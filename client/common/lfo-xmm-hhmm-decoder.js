'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

var _xmmDecoderCommon = require('./xmm-decoder-common');

// simplified decoding algorithm :
//
// if(!forward_init)
// 		forward_init(obs);
// else
// 		forward_update(obs);
//
// for(model in models)
// 		model.updateAlphaWindow();
// 		model.updateResults();
//
// updateResults();

// A utiliser de xmm-decoder-common :
// - gaussianComponentLikelihood
// - gmmLikelihood (which uses gaussianComponentLikelihood)
// - not gmmLikelihoods, as it's the classifying part of GMM

// Which decoder parameters ?
// setLikelihoodWindow ?
// other smoothing windows ?
// exit probabilities ?
// ...

//===========================================================//

var XmmHhmmDecoder = (function (_lfo$core$BaseLfo) {
	_inherits(XmmHhmmDecoder, _lfo$core$BaseLfo);

	function XmmHhmmDecoder() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, XmmHhmmDecoder);

		var defaults = {
			likelihoodWindow: 5
		};
		_get(Object.getPrototypeOf(XmmHhmmDecoder.prototype), 'constructor', this).call(this, defaults, options);

		this.model = undefined;
		this.modelResults = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
	}

	/*
 	setLikelihoodWindow(newWindowSize) {
 		this.likelihoodWindow = newWindowSize;
 		if(this.model === undefined) return;
 		let res = this.modelResults.singleClassModelResults;
 		for(let i=0; i<this.model.models.length; i++) {
 			res[i].likelihood_buffer = [];
 			res[i].likelihood_buffer.length = this.likelihoodWindow;
 			for(let j=0; j<this.likelihoodWindow; j++) {
 				res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
 			}
 		}
 	}
 
 	setVarianceOffset() {
 		// not used for now (need to implement updateInverseCovariance method).
 		// now accessible as training parameter of the child process.
 	}
 
 //*/

	_createClass(XmmHhmmDecoder, [{
		key: 'process',

		//return('no estimation available');

		//================ process frame =================//

		value: function process(time, frame, metaData) {

			//incoming frame is observation vector
			if (this.model === undefined || this.modelResults === undefined) {
				//console.log("no model loaded");
				return;
			}

			//--------------------------------------------//

			this.time = time;
			this.metaData = metaData;

			var outFrame = this.outFrame;

			if (this.forward_initialized) {
				this.forwardUpdate(frame);
			} else {
				this.forwardInit(frame);
			}

			// for(let i=0; i<this.modelResults.singleClassHmmModelResults.length; i++) {
			// 		console.log(this.modelResults.singleClassHmmModelResults[i].alpha_h[0][0]);
			// }

			for (var i = 0; i < this.model.models.length; i++) {
				(0, _xmmDecoderCommon.hmmUpdateAlphaWindow)(this.model.models[i], this.modelResults.singleClassHmmModelResults[i]);
				(0, _xmmDecoderCommon.hmmUpdateResults)(this.model.models[i], this.modelResults.singleClassHmmModelResults[i]);
			}

			this.updateResults();

			for (var i = 0; i < this.model.models.length; i++) {
				outFrame[i] = this.modelResults.smoothed_normalized_likelihoods[i];
			}

			this.output();
		}

		//==================================================================//
		//====================== load model from json ======================//
		//==================================================================//

	}, {
		key: 'setModel',
		value: function setModel(model) {

			this.model = undefined;
			this.modelResults = undefined;

			// test if model is valid here (TODO : write a better test)
			if (model.models !== undefined) {

				console.log(model);

				this.model = model;
				var nmodels = model.models.length;

				var nstatesGlobal = model.configuration.default_parameters.states;
				this.params.frameSize = nstatesGlobal;

				// this.prior = new Array(nmodels);
				// this.exit_transition = new Array(nmodels);
				// this.transition = new Array(nmodels);
				// for(let i=0; i<nmodels; i++) {
				// 	this.transition[i] = new Array(nmodels);
				// }
				this.frontier_v1 = new Array(nmodels);
				this.frontier_v2 = new Array(nmodels);
				this.forward_initialized = false;
				//this.results = {};

				this.modelResults = {
					instant_likelihoods: new Array(nmodels),
					smoothed_log_likelihoods: new Array(nmodels),
					smoothed_likelihoods: new Array(nmodels),
					instant_normalized_likelihoods: new Array(nmodels),
					smoothed_normalized_likelihoods: new Array(nmodels),
					likeliest: -1,
					singleClassHmmModelResults: []
				};

				for (var i = 0; i < nmodels; i++) {

					this.modelResults.instant_likelihoods[i] = 0;
					this.modelResults.smoothed_log_likelihoods[i] = 0;
					this.modelResults.smoothed_likelihoods[i] = 0;
					this.modelResults.instant_normalized_likelihoods[i] = 0;
					this.modelResults.smoothed_normalized_likelihoods[i] = 0;

					var nstates = this.model.models[i].parameters.states;

					var alpha_h = new Array(3);
					for (var j = 0; j < 3; j++) {
						alpha_h[j] = new Array(nstates);
						for (var k = 0; k < nstates; k++) {
							alpha_h[j][k] = 0;
						}
					}

					var hmmRes = {
						instant_likelihood: 0,
						log_likelihood: 0,
						likelihood_buffer: [],
						progress: 0,

						// never used ? -> check xmm cpp
						exit_likelihood: 0,
						exit_ratio: 0,

						likeliest_state: -1,

						//alpha: new Array(nstates), 	// for non-hierarchical
						alpha_h: alpha_h, // for hierarchical
						prior: new Array(nstates),
						transition: new Array(nstates),

						// used in hmmUpdateAlphaWindow
						window_minindex: 0,
						window_maxindex: 0,
						window_normalization_constant: 0,

						singleClassGmmModelResults: [] // states
					};

					// ADD INDIVIDUAL STATES (GMMs)
					for (var j = 0; j < nstates; j++) {
						var gmmRes = {
							instant_likelihood: 0
						};

						// log_likelihood: 0,
						// TODO : add same fields as in GmmDecoder ????
						hmmRes.singleClassGmmModelResults.push(gmmRes);
					}

					this.modelResults.singleClassHmmModelResults.push(hmmRes);
				}
			}

			//this.streamParams.frameSize = this.model.models.length;
			this.initialize({ frameSize: this.model.models.length });
			//console.log(this.streamParams.frameSize);
			//console.log(this.modelResults);
		}

		//============================ RESET ==============================//

	}, {
		key: 'reset',
		value: function reset() {
			this.forward_initialized = false;
		}

		//==================================================================//
		//========================= FORWARD INIT ===========================//
		//==================================================================//

	}, {
		key: 'forwardInit',
		value: function forwardInit(observation) {
			var norm_const = 0;
			//let modelIndex = 0;

			//================= INITIALIZE ALPHA VARIABLES =================//

			for (var i = 0; i < this.model.models.length; i++) {

				var m = this.model.models[i];
				var nstates = m.parameters.states;
				var mRes = this.modelResults.singleClassHmmModelResults[i];

				for (var j = 0; j < 3; j++) {
					mRes.alpha_h[j] = new Array(nstates);
					for (var k = 0; k < nstates; k++) {
						mRes.alpha_h[j][k] = 0;
					}
				}

				if (m.parameters.transition_mode == 0) {
					////////////////////// ergodic
					for (var k = 0; k < nstates; k++) {
						mRes.alpha_h[0][k] = mRes.prior[k] * (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[k], mRes.singleClassGmmModelResults[k]); // see how obsProb is implemented
						mRes.instant_likelihood += mRes.alpha[0][k];
					}
				} else {
					///////////////////////////////////////////////////// left-right
					mRes.alpha_h[0][0] = this.model.prior[i];
					mRes.alpha_h[0][0] *= (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[0], mRes.singleClassGmmModelResults[0]);
					mRes.instant_likelihood = mRes.alpha_h[0][0];
				}
				norm_const += mRes.instant_likelihood;
			}

			//================== NORMALIZE ALPHA VARIABLES =================//

			for (var i = 0; i < this.model.models.length; i++) {

				var nstates = this.model.models[i].parameters.states;
				for (var e = 0; e < 3; e++) {
					for (var k = 0; k < nstates; k++) {
						this.modelResults.singleClassHmmModelResults[i].alpha_h[e][k] /= norm_const;
					}
				}
			}

			this.forward_initialized = true;
		}

		//==================================================================//
		//======================== FORWARD UPDATE ==========================//
		//==================================================================//

	}, {
		key: 'forwardUpdate',
		value: function forwardUpdate(observation) {
			var norm_const = 0;
			var tmp = 0;
			var front = undefined; // array

			var nmodels = this.model.models.length;

			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(1, this.frontier_v1, this.model, this.modelResults);
			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(2, this.frontier_v2, this.model, this.modelResults);

			// let num_classes =
			// let dstModelIndex = 0;

			for (var i = 0; i < nmodels; i++) {

				var m = this.model.models[i];
				var nstates = m.parameters.states;
				var mRes = this.modelResults.singleClassHmmModelResults[i];

				//============= COMPUTE FRONTIER VARIABLE ============//

				front = new Array(nstates);
				for (var j = 0; j < nstates; j++) {
					front[j] = 0;
				}

				if (m.parameters.transition_mode == 0) {
					////////////////////// ergodic
					for (var k = 0; k < nstates; k++) {
						for (var j = 0; j < nstates; j++) {
							front[k] += m.transition[j * nstates + k] / (1 - m.exitProbabilities[j]) * mRes.alpha_h[0][j];
						}
						for (var srci = 0; srci < nmodels; srci++) {
							front[k] += mRes.prior[k] * (this.frontier_v1[srci] * this.model.transition[srci][i] + this.model.prior[i] * this.frontier_v2[srci]);
						}
					}
				} else {
					//////////////////////////////////////////////////// left-right

					// k == 0 : first state of the primitive
					front[0] = m.transition[0] * mRes.alpha_h[0][0];

					for (var srci = 0; srci < this.model.models.length; srci++) {
						front[0] += this.frontier_v1[srci] * this.model.transition[srci][i] + this.model.prior[i] * this.frontier_v2[srci];
					}

					// k > 0 : rest of the primitive
					for (var k = 1; k < nstates; k++) {
						front[k] += m.transition[k * 2] / (1 - m.exitProbabilities[k]) * mRes.alpha_h[0][k];
						front[k] += m.transition[(k - 1) * 2 + 1] / (1 - m.exitProbabilities[k - 1]) * mRes.alpha_h[0][k - 1];
					}

					for (var j = 0; j < 3; j++) {
						for (var k = 0; k < nstates; k++) {
							mRes.alpha_h[j][k] = 0;
						}
					}
				}

				//console.log(front);

				//============== UPDATE FORWARD VARIABLE =============//

				mRes.exit_likelihood = 0;
				mRes.instant_likelihood = 0;

				for (var k = 0; k < nstates; k++) {
					tmp = (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[k], mRes.singleClassGmmModelResults[k]) * front[k];

					mRes.alpha_h[2][k] = this.model.exit_transition[i] * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[1][k] = (1 - this.model.exit_transition[i]) * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[0][k] = (1 - m.exitProbabilities[k]) * tmp;

					mRes.exit_likelihood += mRes.alpha_h[1][k] + mRes.alpha_h[2][k];
					mRes.instant_likelihood += mRes.alpha_h[0][k] + mRes.alpha_h[1][k] + mRes.alpha_h[2][k];

					norm_const += tmp;
				}

				mRes.exit_ratio = mRes.exit_likelihood / mRes.instant_likelihood;
			}

			//============== NORMALIZE ALPHA VARIABLES =============//

			for (var i = 0; i < nmodels; i++) {
				for (var e = 0; e < 3; e++) {
					for (var k = 0; k < this.model.models[i].parameters.states; k++) {
						this.modelResults.singleClassHmmModelResults[i].alpha_h[e][k] /= norm_const;
					}
				}
			}
		}

		//====================== UPDATE RESULTS ====================//

	}, {
		key: 'updateResults',
		value: function updateResults() {
			var maxlog_likelihood = 0;
			var normconst_instant = 0;
			var normconst_smoothed = 0;

			var res = this.modelResults;

			for (var i = 0; i < this.model.models.length; i++) {

				var hmmRes = res.singleClassHmmModelResults[i];

				res.instant_likelihoods[i] = hmmRes.instant_likelihood;
				res.smoothed_log_likelihoods[i] = hmmRes.log_likelihood;
				res.smoothed_likelihoods[i] = Math.exp(res.smoothed_log_likelihoods[i]);

				res.instant_normalized_likelihoods[i] = res.instant_likelihoods[i];
				res.smoothed_normalized_likelihoods[i] = res.smoothed_likelihoods[i];

				normconst_instant += res.instant_normalized_likelihoods[i];
				normconst_smoothed += res.smoothed_normalized_likelihoods[i];

				if (i == 0 || res.smoothed_log_likelihoods[i] > maxlog_likelihood) {
					maxlog_likelihood = res.smoothed_log_likelihoods[i];
					res.likeliest = i;
				}
			}

			for (var i = 0; i < this.model.models.length; i++) {
				res.instant_normalized_likelihoods[i] /= normconst_instant;
				res.smoothed_normalized_likelihoods[i] /= normconst_smoothed;
			}
		}
	}, {
		key: 'likeliestLabel',
		get: function get() {
			if (this.modelResults !== undefined) {
				if (this.modelResults.likeliest > -1) {
					return this.model.models[this.modelResults.likeliest].label;
				}
			}
			return 'unknown';
		}
	}]);

	return XmmHhmmDecoder;
})(lfo.core.BaseLfo);

exports['default'] = XmmHhmmDecoder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby14bW0taGhtbS1kZWNvZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7O2dDQUlhLHNCQUFzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQTZCN0IsY0FBYztXQUFkLGNBQWM7O0FBRXZCLFVBRlMsY0FBYyxHQUVSO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixjQUFjOztBQUdqQyxNQUFNLFFBQVEsR0FBRztBQUNoQixtQkFBZ0IsRUFBRSxDQUFDO0dBQ25CLENBQUM7QUFDRiw2QkFObUIsY0FBYyw2Q0FNM0IsUUFBUSxFQUFFLE9BQU8sRUFBRTs7QUFFekIsTUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7QUFDdkIsTUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7QUFDOUIsTUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7RUFDckQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2NBWG1CLGNBQWM7Ozs7Ozs7U0EwQjNCLGlCQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFOzs7QUFHOUIsT0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTs7QUFFL0QsV0FBTztJQUNQOzs7O0FBSUQsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLE9BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE9BQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQzVCLFFBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUIsTUFBTTtBQUNOLFFBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENB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LDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVELHNCQUFrQixJQUFLLEdBQUcsQ0FBQywrQkFBK0IsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7QUFFOUQsUUFBRyxDQUFDLElBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUMsR0FBRyxpQkFBaUIsRUFBRTtBQUMvRCxzQkFBaUIsR0FBRyxHQUFHLENBQUMsd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEQsUUFBRyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7S0FDbEI7SUFDRDs7QUFFRCxRQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzdDLE9BQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsSUFBSyxpQkFBaUIsQ0FBQztBQUM1RCxPQUFHLENBQUMsK0JBQStCLENBQUMsQ0FBQyxDQUFDLElBQUssa0JBQWtCLENBQUM7SUFDOUQ7R0FDRDs7O09BbFdpQixlQUFHO0FBQ3BCLE9BQUcsSUFBSSxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7QUFDbkMsUUFBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNwQyxZQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLENBQUMsS0FBSyxDQUFDO0tBQzVEO0lBQ0Q7QUFDRCxVQUFPLFNBQVMsQ0FBQztHQUVqQjs7O1FBckJtQixjQUFjO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztxQkFBdkMsY0FBYyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8teG1tLWhobW0tZGVjb2Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuaW1wb3J0IHtnbW1MaWtlbGlob29kLFxuXHRcdGhtbVVwZGF0ZUFscGhhV2luZG93LFxuXHRcdGhtbVVwZGF0ZVJlc3VsdHMsXG5cdFx0aGhtbUxpa2VsaWhvb2RBbHBoYX0gZnJvbSAnLi94bW0tZGVjb2Rlci1jb21tb24nO1xuXG4vLyBzaW1wbGlmaWVkIGRlY29kaW5nIGFsZ29yaXRobSA6XG4vL1xuLy8gaWYoIWZvcndhcmRfaW5pdClcbi8vIFx0XHRmb3J3YXJkX2luaXQob2JzKTtcbi8vIGVsc2Vcbi8vIFx0XHRmb3J3YXJkX3VwZGF0ZShvYnMpO1xuLy9cbi8vIGZvcihtb2RlbCBpbiBtb2RlbHMpXG4vLyBcdFx0bW9kZWwudXBkYXRlQWxwaGFXaW5kb3coKTtcbi8vIFx0XHRtb2RlbC51cGRhdGVSZXN1bHRzKCk7XG4vL1xuLy8gdXBkYXRlUmVzdWx0cygpO1xuXG4vLyBBIHV0aWxpc2VyIGRlIHhtbS1kZWNvZGVyLWNvbW1vbiA6XG4vLyAtIGdhdXNzaWFuQ29tcG9uZW50TGlrZWxpaG9vZFxuLy8gLSBnbW1MaWtlbGlob29kICh3aGljaCB1c2VzIGdhdXNzaWFuQ29tcG9uZW50TGlrZWxpaG9vZClcbi8vIC0gbm90IGdtbUxpa2VsaWhvb2RzLCBhcyBpdCdzIHRoZSBjbGFzc2lmeWluZyBwYXJ0IG9mIEdNTVxuXG4vLyBXaGljaCBkZWNvZGVyIHBhcmFtZXRlcnMgP1xuLy8gc2V0TGlrZWxpaG9vZFdpbmRvdyA/XG4vLyBvdGhlciBzbW9vdGhpbmcgd2luZG93cyA/XG4vLyBleGl0IHByb2JhYmlsaXRpZXMgP1xuLy8gLi4uXG5cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFhtbUhobW1EZWNvZGVyIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRsaWtlbGlob29kV2luZG93OiA1LFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSB0aGlzLnBhcmFtcy5saWtlbGlob29kV2luZG93O1xuXHR9XG5cblx0Z2V0IGxpa2VsaWVzdExhYmVsKCkge1xuXHRcdGlmKHRoaXMubW9kZWxSZXN1bHRzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmKHRoaXMubW9kZWxSZXN1bHRzLmxpa2VsaWVzdCA+IC0xKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm1vZGVsLm1vZGVsc1t0aGlzLm1vZGVsUmVzdWx0cy5saWtlbGllc3RdLmxhYmVsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gJ3Vua25vd24nO1xuXHRcdC8vcmV0dXJuKCdubyBlc3RpbWF0aW9uIGF2YWlsYWJsZScpO1xuXHR9XG5cblxuXHQvLz09PT09PT09PT09PT09PT0gcHJvY2VzcyBmcmFtZSA9PT09PT09PT09PT09PT09PS8vXG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblxuXHRcdC8vaW5jb21pbmcgZnJhbWUgaXMgb2JzZXJ2YXRpb24gdmVjdG9yXG5cdFx0aWYodGhpcy5tb2RlbCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMubW9kZWxSZXN1bHRzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJubyBtb2RlbCBsb2FkZWRcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXHRcdHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuXHRcdGNvbnN0IG91dEZyYW1lID0gdGhpcy5vdXRGcmFtZTtcblxuXHRcdGlmKHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5mb3J3YXJkVXBkYXRlKGZyYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5mb3J3YXJkSW5pdChmcmFtZSk7XG5cdFx0fVxuXG5cdFx0Ly8gZm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMubGVuZ3RoOyBpKyspIHtcblx0XHQvLyBcdFx0Y29uc29sZS5sb2codGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFswXVswXSk7XG5cdFx0Ly8gfVxuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGhtbVVwZGF0ZUFscGhhV2luZG93KHRoaXMubW9kZWwubW9kZWxzW2ldLCB0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXSk7XG5cdFx0XHRobW1VcGRhdGVSZXN1bHRzKHRoaXMubW9kZWwubW9kZWxzW2ldLCB0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXSk7XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVSZXN1bHRzKCk7XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0b3V0RnJhbWVbaV0gPSB0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldO1xuXHRcdH1cblxuXHRcdHRoaXMub3V0cHV0KCk7XG5cdH1cblx0XHRcblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PSBsb2FkIG1vZGVsIGZyb20ganNvbiA9PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHRcblx0c2V0TW9kZWwobW9kZWwpIHtcdFx0XG5cblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubW9kZWxSZXN1bHRzID0gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdGVzdCBpZiBtb2RlbCBpcyB2YWxpZCBoZXJlIChUT0RPIDogd3JpdGUgYSBiZXR0ZXIgdGVzdClcblx0XHRpZihtb2RlbC5tb2RlbHMgIT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHRjb25zb2xlLmxvZyhtb2RlbCk7XG5cblx0XHRcdHRoaXMubW9kZWwgPSBtb2RlbDtcblx0XHRcdGxldCBubW9kZWxzID0gbW9kZWwubW9kZWxzLmxlbmd0aDtcblxuXHRcdFx0bGV0IG5zdGF0ZXNHbG9iYWwgPSBtb2RlbC5jb25maWd1cmF0aW9uLmRlZmF1bHRfcGFyYW1ldGVycy5zdGF0ZXM7XG5cdFx0XHR0aGlzLnBhcmFtcy5mcmFtZVNpemUgPSBuc3RhdGVzR2xvYmFsO1xuXG5cdFx0XHQvLyB0aGlzLnByaW9yID0gbmV3IEFycmF5KG5tb2RlbHMpO1xuXHRcdFx0Ly8gdGhpcy5leGl0X3RyYW5zaXRpb24gPSBuZXcgQXJyYXkobm1vZGVscyk7XG5cdFx0XHQvLyB0aGlzLnRyYW5zaXRpb24gPSBuZXcgQXJyYXkobm1vZGVscyk7XG5cdFx0XHQvLyBmb3IobGV0IGk9MDsgaTxubW9kZWxzOyBpKyspIHtcblx0XHRcdC8vIFx0dGhpcy50cmFuc2l0aW9uW2ldID0gbmV3IEFycmF5KG5tb2RlbHMpO1xuXHRcdFx0Ly8gfVxuXHRcdFx0dGhpcy5mcm9udGllcl92MSA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdHRoaXMuZnJvbnRpZXJfdjIgPSBuZXcgQXJyYXkobm1vZGVscyk7XG5cdFx0XHR0aGlzLmZvcndhcmRfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHRcdC8vdGhpcy5yZXN1bHRzID0ge307XG5cblx0XHRcdHRoaXMubW9kZWxSZXN1bHRzID0ge1xuXHRcdFx0XHRpbnN0YW50X2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX2xvZ19saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRpbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRsaWtlbGllc3Q6IC0xLFxuXHRcdFx0XHRzaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0czogW11cblx0XHRcdH07XG5cblx0XHRcdGZvcihsZXQgaT0wOyBpPG5tb2RlbHM7IGkrKykge1xuXG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXG5cdFx0XHRcdGxldCBuc3RhdGVzID0gdGhpcy5tb2RlbC5tb2RlbHNbaV0ucGFyYW1ldGVycy5zdGF0ZXM7XG5cblx0XHRcdFx0bGV0IGFscGhhX2ggPSBuZXcgQXJyYXkoMyk7XG5cdFx0XHRcdGZvcihsZXQgaj0wOyBqPDM7IGorKykge1xuXHRcdFx0XHRcdGFscGhhX2hbal0gPSBuZXcgQXJyYXkobnN0YXRlcyk7XG5cdFx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0XHRhbHBoYV9oW2pdW2tdID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRsZXQgaG1tUmVzID0ge1xuXHRcdFx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZDogMCxcblx0XHRcdFx0XHRsb2dfbGlrZWxpaG9vZDogMCxcblx0XHRcdFx0XHRsaWtlbGlob29kX2J1ZmZlcjogW10sXG5cdFx0XHRcdFx0cHJvZ3Jlc3M6IDAsXG5cblx0XHRcdFx0XHQvLyBuZXZlciB1c2VkID8gLT4gY2hlY2sgeG1tIGNwcFxuXHRcdFx0XHRcdGV4aXRfbGlrZWxpaG9vZDogMCxcblx0XHRcdFx0XHRleGl0X3JhdGlvOiAwLFxuXG5cdFx0XHRcdFx0bGlrZWxpZXN0X3N0YXRlOiAtMSxcblxuXHRcdFx0XHRcdC8vYWxwaGE6IG5ldyBBcnJheShuc3RhdGVzKSwgXHQvLyBmb3Igbm9uLWhpZXJhcmNoaWNhbFxuXHRcdFx0XHRcdGFscGhhX2g6IGFscGhhX2gsXHRcdFx0XHQvLyBmb3IgaGllcmFyY2hpY2FsXG5cdFx0XHRcdFx0cHJpb3I6IG5ldyBBcnJheShuc3RhdGVzKSxcblx0XHRcdFx0XHR0cmFuc2l0aW9uOiBuZXcgQXJyYXkobnN0YXRlcyksXG5cblx0XHRcdFx0XHQvLyB1c2VkIGluIGhtbVVwZGF0ZUFscGhhV2luZG93XG5cdFx0XHRcdFx0d2luZG93X21pbmluZGV4OiAwLFxuXHRcdFx0XHRcdHdpbmRvd19tYXhpbmRleDogMCxcblx0XHRcdFx0XHR3aW5kb3dfbm9ybWFsaXphdGlvbl9jb25zdGFudDogMCxcblx0XHRcdFx0XHRcblx0XHRcdFx0XHRzaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0czogW11cdC8vIHN0YXRlc1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdC8vIEFERCBJTkRJVklEVUFMIFNUQVRFUyAoR01Ncylcblx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8bnN0YXRlczsgaisrKSB7XG5cdFx0XHRcdFx0bGV0IGdtbVJlcyA9IHtcblx0XHRcdFx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZDogMCxcblx0XHRcdFx0XHRcdC8vIGxvZ19saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdFx0Ly8gVE9ETyA6IGFkZCBzYW1lIGZpZWxkcyBhcyBpbiBHbW1EZWNvZGVyID8/Pz9cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aG1tUmVzLnNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzLnB1c2goZ21tUmVzKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzLnB1c2goaG1tUmVzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvL3RoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDtcblx0XHR0aGlzLmluaXRpYWxpemUoeyBmcmFtZVNpemU6IHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aCB9KTtcblx0XHQvL2NvbnNvbGUubG9nKHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSk7XG5cdFx0Ly9jb25zb2xlLmxvZyh0aGlzLm1vZGVsUmVzdWx0cyk7XG5cdH1cblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUkVTRVQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuXHRyZXNldCgpIHtcblx0XHR0aGlzLmZvcndhcmRfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09IEZPUldBUkQgSU5JVCA9PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cblx0Zm9yd2FyZEluaXQob2JzZXJ2YXRpb24pIHtcblx0XHRsZXQgbm9ybV9jb25zdCA9IDA7XG5cdFx0Ly9sZXQgbW9kZWxJbmRleCA9IDA7XG5cblx0XHQvLz09PT09PT09PT09PT09PT09IElOSVRJQUxJWkUgQUxQSEEgVkFSSUFCTEVTID09PT09PT09PT09PT09PT09Ly9cblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGxldCBtID0gdGhpcy5tb2RlbC5tb2RlbHNbaV07XG5cdFx0XHRsZXQgbnN0YXRlcyA9IG0ucGFyYW1ldGVycy5zdGF0ZXM7XG5cdFx0XHRsZXQgbVJlcyA9IHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldO1xuXG5cdFx0XHRmb3IobGV0IGo9MDsgajwzOyBqKyspIHtcblx0XHRcdFx0bVJlcy5hbHBoYV9oW2pdID0gbmV3IEFycmF5KG5zdGF0ZXMpO1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRtUmVzLmFscGhhX2hbal1ba10gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKG0ucGFyYW1ldGVycy50cmFuc2l0aW9uX21vZGUgPT0gMCkgeyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vIGVyZ29kaWNcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0bVJlcy5hbHBoYV9oWzBdW2tdID0gbVJlcy5wcmlvcltrXSAqIGdtbUxpa2VsaWhvb2Qob2JzZXJ2YXRpb24sIG0uc3RhdGVzW2tdLCBtUmVzLnNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzW2tdKTsgLy8gc2VlIGhvdyBvYnNQcm9iIGlzIGltcGxlbWVudGVkXG5cdFx0XHRcdFx0bVJlcy5pbnN0YW50X2xpa2VsaWhvb2QgKz0gbVJlcy5hbHBoYVswXVtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHsgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gbGVmdC1yaWdodFxuXHRcdFx0XHRtUmVzLmFscGhhX2hbMF1bMF0gPSB0aGlzLm1vZGVsLnByaW9yW2ldO1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbMF1bMF0gKj0gZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbS5zdGF0ZXNbMF0sIG1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHNbMF0pO1xuXHRcdFx0XHRtUmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IG1SZXMuYWxwaGFfaFswXVswXTtcblx0XHRcdH1cblx0XHRcdG5vcm1fY29uc3QgKz0gbVJlcy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0fVxuXG5cdFx0Ly89PT09PT09PT09PT09PT09PT0gTk9STUFMSVpFIEFMUEhBIFZBUklBQkxFUyA9PT09PT09PT09PT09PT09PS8vXG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0XHRsZXQgbnN0YXRlcyA9IHRoaXMubW9kZWwubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzO1xuXHRcdFx0Zm9yKGxldCBlPTA7IGU8MzsgZSsrKSB7XG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldLmFscGhhX2hbZV1ba10gLz0gbm9ybV9jb25zdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCA9IHRydWU7XG5cdH1cblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09IEZPUldBUkQgVVBEQVRFID09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdGZvcndhcmRVcGRhdGUob2JzZXJ2YXRpb24pIHtcblx0XHRsZXQgbm9ybV9jb25zdCA9IDA7XG5cdFx0bGV0IHRtcCA9IDA7XG5cdFx0bGV0IGZyb250OyAvLyBhcnJheVxuXG5cdFx0bGV0IG5tb2RlbHMgPSB0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7XG5cdFxuXHRcdGhobW1MaWtlbGlob29kQWxwaGEoMSwgdGhpcy5mcm9udGllcl92MSwgdGhpcy5tb2RlbCwgdGhpcy5tb2RlbFJlc3VsdHMpO1xuXHRcdGhobW1MaWtlbGlob29kQWxwaGEoMiwgdGhpcy5mcm9udGllcl92MiwgdGhpcy5tb2RlbCwgdGhpcy5tb2RlbFJlc3VsdHMpO1xuXG5cdFx0Ly8gbGV0IG51bV9jbGFzc2VzID0gXG5cdFx0Ly8gbGV0IGRzdE1vZGVsSW5kZXggPSAwO1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8bm1vZGVsczsgaSsrKSB7XG5cblx0XHRcdGxldCBtID0gdGhpcy5tb2RlbC5tb2RlbHNbaV07XG5cdFx0XHRsZXQgbnN0YXRlcyA9IG0ucGFyYW1ldGVycy5zdGF0ZXM7XG5cdFx0XHRsZXQgbVJlcyA9IHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldO1xuXHRcdFx0XG5cdFx0XHQvLz09PT09PT09PT09PT0gQ09NUFVURSBGUk9OVElFUiBWQVJJQUJMRSA9PT09PT09PT09PT0vL1xuXG5cdFx0XHRmcm9udCA9IG5ldyBBcnJheShuc3RhdGVzKTtcblx0XHRcdGZvcihsZXQgaj0wOyBqPG5zdGF0ZXM7IGorKykge1xuXHRcdFx0XHRmcm9udFtqXSA9IDA7XG5cdFx0XHR9XG5cblx0XHRcdGlmKG0ucGFyYW1ldGVycy50cmFuc2l0aW9uX21vZGUgPT0gMCkgeyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vIGVyZ29kaWNcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8bnN0YXRlczsgaisrKSB7XG5cdFx0XHRcdFx0XHRmcm9udFtrXSArPSBtLnRyYW5zaXRpb25baiAqIG5zdGF0ZXMgKyBrXSAvXG5cdFx0XHRcdFx0XHRcdFx0XHQoMSAtIG0uZXhpdFByb2JhYmlsaXRpZXNbal0pICpcblx0XHRcdFx0XHRcdFx0XHRcdG1SZXMuYWxwaGFfaFswXVtqXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zm9yKGxldCBzcmNpPTA7IHNyY2k8bm1vZGVsczsgc3JjaSsrKSB7XG5cdFx0XHRcdFx0XHRmcm9udFtrXSArPSBtUmVzLnByaW9yW2tdICpcblx0XHRcdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5mcm9udGllcl92MVtzcmNpXSAqIHRoaXMubW9kZWwudHJhbnNpdGlvbltzcmNpXVtpXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMubW9kZWwucHJpb3JbaV0gKiB0aGlzLmZyb250aWVyX3YyW3NyY2ldXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHsgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBsZWZ0LXJpZ2h0XG5cblx0XHRcdFx0Ly8gayA9PSAwIDogZmlyc3Qgc3RhdGUgb2YgdGhlIHByaW1pdGl2ZVxuXHRcdFx0XHRmcm9udFswXSA9IG0udHJhbnNpdGlvblswXSAqIG1SZXMuYWxwaGFfaFswXVswXTtcblxuXHRcdFx0XHRmb3IobGV0IHNyY2k9MDsgc3JjaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IHNyY2krKykge1xuXHRcdFx0XHRcdGZyb250WzBdICs9IHRoaXMuZnJvbnRpZXJfdjFbc3JjaV0gKiB0aGlzLm1vZGVsLnRyYW5zaXRpb25bc3JjaV1baV0gK1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMubW9kZWwucHJpb3JbaV0gKiB0aGlzLmZyb250aWVyX3YyW3NyY2ldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gayA+IDAgOiByZXN0IG9mIHRoZSBwcmltaXRpdmVcblx0XHRcdFx0Zm9yKGxldCBrPTE7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0ZnJvbnRba10gKz0gbS50cmFuc2l0aW9uW2sgKiAyXSAvXG5cdFx0XHRcdFx0XHRcdFx0KDEgLSBtLmV4aXRQcm9iYWJpbGl0aWVzW2tdKSAqXG5cdFx0XHRcdFx0XHRcdFx0bVJlcy5hbHBoYV9oWzBdW2tdO1xuXHRcdFx0XHRcdGZyb250W2tdICs9IG0udHJhbnNpdGlvblsoayAtIDEpICogMiArIDFdIC9cblx0XHRcdFx0XHRcdFx0XHQoMSAtIG0uZXhpdFByb2JhYmlsaXRpZXNbayAtIDFdKSAqXG5cdFx0XHRcdFx0XHRcdFx0bVJlcy5hbHBoYV9oWzBdW2sgLSAxXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvcihsZXQgaj0wOyBqPDM7IGorKykge1xuXHRcdFx0XHRcdGZvcihsZXQgaz0wOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdFx0bVJlcy5hbHBoYV9oW2pdW2tdID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly9jb25zb2xlLmxvZyhmcm9udCk7XG5cblx0XHRcdC8vPT09PT09PT09PT09PT0gVVBEQVRFIEZPUldBUkQgVkFSSUFCTEUgPT09PT09PT09PT09PS8vXG5cblx0XHRcdG1SZXMuZXhpdF9saWtlbGlob29kID0gMDtcblx0XHRcdG1SZXMuaW5zdGFudF9saWtlbGlob29kID0gMDtcblxuXHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdHRtcCA9IGdtbUxpa2VsaWhvb2Qob2JzZXJ2YXRpb24sIG0uc3RhdGVzW2tdLCBtUmVzLnNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzW2tdKSAqIGZyb250W2tdO1xuXG5cdFx0XHRcdG1SZXMuYWxwaGFfaFsyXVtrXSA9IHRoaXMubW9kZWwuZXhpdF90cmFuc2l0aW9uW2ldICogbS5leGl0UHJvYmFiaWxpdGllc1trXSAqIHRtcDtcblx0XHRcdFx0bVJlcy5hbHBoYV9oWzFdW2tdID0gKDEgLSB0aGlzLm1vZGVsLmV4aXRfdHJhbnNpdGlvbltpXSkgKiBtLmV4aXRQcm9iYWJpbGl0aWVzW2tdICogdG1wO1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbMF1ba10gPSAoMSAtIG0uZXhpdFByb2JhYmlsaXRpZXNba10pICogdG1wO1xuXG5cdFx0XHRcdG1SZXMuZXhpdF9saWtlbGlob29kIFx0Kz0gbVJlcy5hbHBoYV9oWzFdW2tdICsgbVJlcy5hbHBoYV9oWzJdW2tdO1xuXHRcdFx0XHRtUmVzLmluc3RhbnRfbGlrZWxpaG9vZCArPSBtUmVzLmFscGhhX2hbMF1ba10gKyBtUmVzLmFscGhhX2hbMV1ba10gKyBtUmVzLmFscGhhX2hbMl1ba107XG5cblx0XHRcdFx0bm9ybV9jb25zdCArPSB0bXA7XG5cdFx0XHR9XG5cblx0XHRcdG1SZXMuZXhpdF9yYXRpbyA9IG1SZXMuZXhpdF9saWtlbGlob29kIC8gbVJlcy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0fVxuXG5cdFx0Ly89PT09PT09PT09PT09PSBOT1JNQUxJWkUgQUxQSEEgVkFSSUFCTEVTID09PT09PT09PT09PT0vL1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8bm1vZGVsczsgaSsrKSB7XG5cdFx0XHRmb3IobGV0IGU9MDsgZTwzOyBlKyspIHtcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8dGhpcy5tb2RlbC5tb2RlbHNbaV0ucGFyYW1ldGVycy5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldLmFscGhhX2hbZV1ba10gLz0gbm9ybV9jb25zdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PSBVUERBVEUgUkVTVUxUUyA9PT09PT09PT09PT09PT09PT09PS8vXG5cblx0dXBkYXRlUmVzdWx0cygpIHtcblx0XHRsZXQgbWF4bG9nX2xpa2VsaWhvb2QgPSAwO1xuXHRcdGxldCBub3JtY29uc3RfaW5zdGFudCA9IDA7XG5cdFx0bGV0IG5vcm1jb25zdF9zbW9vdGhlZCA9IDA7XG5cblx0XHRsZXQgcmVzID0gdGhpcy5tb2RlbFJlc3VsdHM7XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0XHRsZXQgaG1tUmVzID0gcmVzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldO1xuXG5cdFx0XHRyZXMuaW5zdGFudF9saWtlbGlob29kc1tpXSBcdFx0PSBobW1SZXMuaW5zdGFudF9saWtlbGlob29kO1xuXHRcdFx0cmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA9IGhtbVJlcy5sb2dfbGlrZWxpaG9vZDtcblx0XHRcdHJlcy5zbW9vdGhlZF9saWtlbGlob29kc1tpXSBcdD0gTWF0aC5leHAocmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSk7XG5cblx0XHRcdHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gXHQ9IHJlcy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldO1xuXHRcdFx0cmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gXHQ9IHJlcy5zbW9vdGhlZF9saWtlbGlob29kc1tpXTtcblxuXHRcdFx0bm9ybWNvbnN0X2luc3RhbnQgXHQrPSByZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldO1xuXHRcdFx0bm9ybWNvbnN0X3Ntb290aGVkIFx0Kz0gcmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cblx0XHRcdGlmKGk9PTAgfHwgcmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA+IG1heGxvZ19saWtlbGlob29kKSB7XG5cdFx0XHRcdG1heGxvZ19saWtlbGlob29kID0gcmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXTtcblx0XHRcdFx0cmVzLmxpa2VsaWVzdCA9IGk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gXHQvPSBub3JtY29uc3RfaW5zdGFudDtcblx0XHRcdHJlcy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldIFx0Lz0gbm9ybWNvbnN0X3Ntb290aGVkO1xuXHRcdH1cblx0fVxufVxuXG4vKlxuXHRzZXRMaWtlbGlob29kV2luZG93KG5ld1dpbmRvd1NpemUpIHtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSBuZXdXaW5kb3dTaXplO1xuXHRcdGlmKHRoaXMubW9kZWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdGxldCByZXMgPSB0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc01vZGVsUmVzdWx0cztcblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cmVzW2ldLmxpa2VsaWhvb2RfYnVmZmVyID0gW107XG5cdFx0XHRyZXNbaV0ubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoID0gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0Zm9yKGxldCBqPTA7IGo8dGhpcy5saWtlbGlob29kV2luZG93OyBqKyspIHtcblx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyW2pdID0gMSAvIHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzZXRWYXJpYW5jZU9mZnNldCgpIHtcblx0XHQvLyBub3QgdXNlZCBmb3Igbm93IChuZWVkIHRvIGltcGxlbWVudCB1cGRhdGVJbnZlcnNlQ292YXJpYW5jZSBtZXRob2QpLlxuXHRcdC8vIG5vdyBhY2Nlc3NpYmxlIGFzIHRyYWluaW5nIHBhcmFtZXRlciBvZiB0aGUgY2hpbGQgcHJvY2Vzcy5cblx0fVxuXG4vLyovXG4iXX0=