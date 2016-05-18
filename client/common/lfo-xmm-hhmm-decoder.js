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

				this.model = model;
				var nmodels = model.models.length;

				var nstatesGlobal = model.configuration.default_parameters.states;
				this.params.frameSize = nstatesGlobal;

				this.prior = new Array(nmodels);
				this.exit_transition = new Array(nmodels);
				this.transition = new Array(nmodels);
				for (var i = 0; i < nmodels; i++) {
					this.transition[i] = new Array(nmodels);
				}
				this.frontier_v1 = new Array(nstatesGlobal);
				this.frontier_v2 = new Array(nstatesGlobal);
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
			console.log(this.streamParams.frameSize);
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

			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(1, this.frontier_v1, this.model, this.modelResults);
			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(2, this.frontier_v2, this.model, this.modelResults);

			// let num_classes =
			// let dstModelIndex = 0;

			for (var i = 0; i < this.model.models.length; i++) {

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
						for (var srci = 0; srci < nstates; srci++) {
							front[k] += mRes.prior[k] * (this.frontier_v1[srci] * this.transition[srci][i] + this.prior[i] * this.frontier_v2[srci]);
						}
					}
				} else {
					//////////////////////////////////////////////////// left-right

					// k == 0 : first state of the primitive
					front[0] = mRes.transition[0] * mRes.alpha_h[0][0];

					for (var srci = 0; srci < this.model.models.length; srci++) {
						front[0] += this.frontier_v1[srci] * this.transition[srci][i] + this.prior[i] * this.frontier_v2[srci];
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

				//============== UPDATE FORWARD VARIABLE =============//

				mRes.exit_likelihood = 0;
				mRes.instant_likelihood = 0;

				for (var k = 0; k < nstates; k++) {
					tmp = (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[k], mRes.singleClassGmmModelResults[k]) * front[k];

					mRes.alpha_h[2][k] = this.exit_transition[i] * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[1][k] = (1 - this.exit_transition[i]) * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[0][k] = (1 - m.exitProbabilities[k]) * tmp;

					mRes.exit_likelihood += mRes.alpha_h[1][k] + mRes.alpha_h[2][k];
					mRes.instant_likelihood += mRes.alpha_h[0][k] + mRes.alpha_h[1][k] + mRes.alpha_h[2][k];
				}

				mRes.exit_ratio = mRes.exit_likelihood / mRes.instant_likelihood;
			}

			//============== NORMALIZE ALPHA VARIABLES =============//

			for (var i = 0; i < this.model.models.length; i++) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby14bW0taGhtbS1kZWNvZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7O2dDQUlhLHNCQUFzQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQTZCN0IsY0FBYztXQUFkLGNBQWM7O0FBRXZCLFVBRlMsY0FBYyxHQUVSO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixjQUFjOztBQUdqQyxNQUFNLFFBQVEsR0FBRztBQUNoQixtQkFBZ0IsRUFBRSxDQUFDO0dBQ25CLENBQUM7QUFDRiw2QkFObUIsY0FBYyw2Q0FNM0IsUUFBUSxFQUFFLE9BQU8sRUFBRTs7QUFFekIsTUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7QUFDdkIsTUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7QUFDOUIsTUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUM7RUFDckQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2NBWG1CLGNBQWM7Ozs7Ozs7U0EwQjNCLGlCQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFOzs7QUFHOUIsT0FBRyxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVMsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTs7QUFFL0QsV0FBTztJQUNQOzs7O0FBSUQsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLE9BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7O0FBRS9CLE9BQUcsSUFBSSxDQUFDLG1CQUFtQixFQUFFO0FBQzVCLFFBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDMUIsTUFBTTtBQUNOLFFBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENB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bW1vbi9sZm8teG1tLWhobW0tZGVjb2Rlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuaW1wb3J0IHtnbW1MaWtlbGlob29kLFxuXHRcdGhtbVVwZGF0ZUFscGhhV2luZG93LFxuXHRcdGhtbVVwZGF0ZVJlc3VsdHMsXG5cdFx0aGhtbUxpa2VsaWhvb2RBbHBoYX0gZnJvbSAnLi94bW0tZGVjb2Rlci1jb21tb24nO1xuXG4vLyBzaW1wbGlmaWVkIGRlY29kaW5nIGFsZ29yaXRobSA6XG4vL1xuLy8gaWYoIWZvcndhcmRfaW5pdClcbi8vIFx0XHRmb3J3YXJkX2luaXQob2JzKTtcbi8vIGVsc2Vcbi8vIFx0XHRmb3J3YXJkX3VwZGF0ZShvYnMpO1xuLy9cbi8vIGZvcihtb2RlbCBpbiBtb2RlbHMpXG4vLyBcdFx0bW9kZWwudXBkYXRlQWxwaGFXaW5kb3coKTtcbi8vIFx0XHRtb2RlbC51cGRhdGVSZXN1bHRzKCk7XG4vL1xuLy8gdXBkYXRlUmVzdWx0cygpO1xuXG4vLyBBIHV0aWxpc2VyIGRlIHhtbS1kZWNvZGVyLWNvbW1vbiA6XG4vLyAtIGdhdXNzaWFuQ29tcG9uZW50TGlrZWxpaG9vZFxuLy8gLSBnbW1MaWtlbGlob29kICh3aGljaCB1c2VzIGdhdXNzaWFuQ29tcG9uZW50TGlrZWxpaG9vZClcbi8vIC0gbm90IGdtbUxpa2VsaWhvb2RzLCBhcyBpdCdzIHRoZSBjbGFzc2lmeWluZyBwYXJ0IG9mIEdNTVxuXG4vLyBXaGljaCBkZWNvZGVyIHBhcmFtZXRlcnMgP1xuLy8gc2V0TGlrZWxpaG9vZFdpbmRvdyA/XG4vLyBvdGhlciBzbW9vdGhpbmcgd2luZG93cyA/XG4vLyBleGl0IHByb2JhYmlsaXRpZXMgP1xuLy8gLi4uXG5cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFhtbUhobW1EZWNvZGVyIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRsaWtlbGlob29kV2luZG93OiA1LFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSB0aGlzLnBhcmFtcy5saWtlbGlob29kV2luZG93O1xuXHR9XG5cblx0Z2V0IGxpa2VsaWVzdExhYmVsKCkge1xuXHRcdGlmKHRoaXMubW9kZWxSZXN1bHRzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmKHRoaXMubW9kZWxSZXN1bHRzLmxpa2VsaWVzdCA+IC0xKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLm1vZGVsLm1vZGVsc1t0aGlzLm1vZGVsUmVzdWx0cy5saWtlbGllc3RdLmxhYmVsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gJ3Vua25vd24nO1xuXHRcdC8vcmV0dXJuKCdubyBlc3RpbWF0aW9uIGF2YWlsYWJsZScpO1xuXHR9XG5cblxuXHQvLz09PT09PT09PT09PT09PT0gcHJvY2VzcyBmcmFtZSA9PT09PT09PT09PT09PT09PS8vXG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblxuXHRcdC8vaW5jb21pbmcgZnJhbWUgaXMgb2JzZXJ2YXRpb24gdmVjdG9yXG5cdFx0aWYodGhpcy5tb2RlbCA9PT0gdW5kZWZpbmVkIHx8IHRoaXMubW9kZWxSZXN1bHRzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vY29uc29sZS5sb2coXCJubyBtb2RlbCBsb2FkZWRcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXHRcdHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuXHRcdGNvbnN0IG91dEZyYW1lID0gdGhpcy5vdXRGcmFtZTtcblxuXHRcdGlmKHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCkge1xuXHRcdFx0dGhpcy5mb3J3YXJkVXBkYXRlKGZyYW1lKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5mb3J3YXJkSW5pdChmcmFtZSk7XG5cdFx0fVxuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGhtbVVwZGF0ZUFscGhhV2luZG93KHRoaXMubW9kZWwubW9kZWxzW2ldLCB0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXSk7XG5cdFx0XHRobW1VcGRhdGVSZXN1bHRzKHRoaXMubW9kZWwubW9kZWxzW2ldLCB0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXSk7XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVSZXN1bHRzKCk7XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0b3V0RnJhbWVbaV0gPSB0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldO1xuXHRcdH1cblxuXHRcdHRoaXMub3V0cHV0KCk7XG5cdH1cblx0XHRcblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PSBsb2FkIG1vZGVsIGZyb20ganNvbiA9PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHRcblx0c2V0TW9kZWwobW9kZWwpIHtcdFx0XG5cblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubW9kZWxSZXN1bHRzID0gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdGVzdCBpZiBtb2RlbCBpcyB2YWxpZCBoZXJlIChUT0RPIDogd3JpdGUgYSBiZXR0ZXIgdGVzdClcblx0XHRpZihtb2RlbC5tb2RlbHMgIT09IHVuZGVmaW5lZCkge1xuXG5cdFx0XHR0aGlzLm1vZGVsID0gbW9kZWw7XG5cdFx0XHRsZXQgbm1vZGVscyA9IG1vZGVsLm1vZGVscy5sZW5ndGg7XG5cblx0XHRcdGxldCBuc3RhdGVzR2xvYmFsID0gbW9kZWwuY29uZmlndXJhdGlvbi5kZWZhdWx0X3BhcmFtZXRlcnMuc3RhdGVzO1xuXHRcdFx0dGhpcy5wYXJhbXMuZnJhbWVTaXplID0gbnN0YXRlc0dsb2JhbDtcblxuXHRcdFx0dGhpcy5wcmlvciA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdHRoaXMuZXhpdF90cmFuc2l0aW9uID0gbmV3IEFycmF5KG5tb2RlbHMpO1xuXHRcdFx0dGhpcy50cmFuc2l0aW9uID0gbmV3IEFycmF5KG5tb2RlbHMpO1xuXHRcdFx0Zm9yKGxldCBpPTA7IGk8bm1vZGVsczsgaSsrKSB7XG5cdFx0XHRcdHRoaXMudHJhbnNpdGlvbltpXSA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZnJvbnRpZXJfdjEgPSBuZXcgQXJyYXkobnN0YXRlc0dsb2JhbCk7XG5cdFx0XHR0aGlzLmZyb250aWVyX3YyID0gbmV3IEFycmF5KG5zdGF0ZXNHbG9iYWwpO1xuXHRcdFx0dGhpcy5mb3J3YXJkX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0XHQvL3RoaXMucmVzdWx0cyA9IHt9O1xuXG5cdFx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHtcblx0XHRcdFx0aW5zdGFudF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0aW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bGlrZWxpZXN0OiAtMSxcblx0XHRcdFx0c2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHM6IFtdXG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IobGV0IGk9MDsgaTxubW9kZWxzOyBpKyspIHtcblxuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblxuXHRcdFx0XHRsZXQgbnN0YXRlcyA9IHRoaXMubW9kZWwubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzO1xuXG5cdFx0XHRcdGxldCBhbHBoYV9oID0gbmV3IEFycmF5KDMpO1xuXHRcdFx0XHRmb3IobGV0IGo9MDsgajwzOyBqKyspIHtcblx0XHRcdFx0XHRhbHBoYV9oW2pdID0gbmV3IEFycmF5KG5zdGF0ZXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGhtbVJlcyA9IHtcblx0XHRcdFx0XHRpbnN0YW50X2xpa2VsaWhvb2Q6IDAsXG5cdFx0XHRcdFx0bG9nX2xpa2VsaWhvb2Q6IDAsXG5cdFx0XHRcdFx0bGlrZWxpaG9vZF9idWZmZXI6IFtdLFxuXHRcdFx0XHRcdHByb2dyZXNzOiAwLFxuXG5cdFx0XHRcdFx0Ly8gbmV2ZXIgdXNlZCA/IC0+IGNoZWNrIHhtbSBjcHBcblx0XHRcdFx0XHRleGl0X2xpa2VsaWhvb2Q6IDAsXG5cdFx0XHRcdFx0ZXhpdF9yYXRpbzogMCxcblxuXHRcdFx0XHRcdGxpa2VsaWVzdF9zdGF0ZTogLTEsXG5cblx0XHRcdFx0XHQvL2FscGhhOiBuZXcgQXJyYXkobnN0YXRlcyksIFx0Ly8gZm9yIG5vbi1oaWVyYXJjaGljYWxcblx0XHRcdFx0XHRhbHBoYV9oOiBhbHBoYV9oLFx0XHRcdFx0Ly8gZm9yIGhpZXJhcmNoaWNhbFxuXHRcdFx0XHRcdHByaW9yOiBuZXcgQXJyYXkobnN0YXRlcyksXG5cdFx0XHRcdFx0dHJhbnNpdGlvbjogbmV3IEFycmF5KG5zdGF0ZXMpLFxuXG5cdFx0XHRcdFx0Ly8gdXNlZCBpbiBobW1VcGRhdGVBbHBoYVdpbmRvd1xuXHRcdFx0XHRcdHdpbmRvd19taW5pbmRleDogMCxcblx0XHRcdFx0XHR3aW5kb3dfbWF4aW5kZXg6IDAsXG5cdFx0XHRcdFx0d2luZG93X25vcm1hbGl6YXRpb25fY29uc3RhbnQ6IDAsXG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0c2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHM6IFtdXHQvLyBzdGF0ZXNcblx0XHRcdFx0fTtcblxuXHRcdFx0XHQvLyBBREQgSU5ESVZJRFVBTCBTVEFURVMgKEdNTXMpXG5cdFx0XHRcdGZvcihsZXQgaj0wOyBqPG5zdGF0ZXM7IGorKykge1xuXHRcdFx0XHRcdGxldCBnbW1SZXMgPSB7XG5cdFx0XHRcdFx0XHRpbnN0YW50X2xpa2VsaWhvb2Q6IDAsXG5cdFx0XHRcdFx0XHQvLyBsb2dfbGlrZWxpaG9vZDogMCxcblx0XHRcdFx0XHRcdC8vIFRPRE8gOiBhZGQgc2FtZSBmaWVsZHMgYXMgaW4gR21tRGVjb2RlciA/Pz8/XG5cdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGhtbVJlcy5zaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0cy5wdXNoKGdtbVJlcyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0cy5wdXNoKGhtbVJlcyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly90aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7XG5cdFx0dGhpcy5pbml0aWFsaXplKHsgZnJhbWVTaXplOiB0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGggfSk7XG5cdFx0Y29uc29sZS5sb2codGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplKTtcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PSBSRVNFVCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdHJlc2V0KCkge1xuXHRcdHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHR9XG5cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT0gRk9SV0FSRCBJTklUID09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuXHRmb3J3YXJkSW5pdChvYnNlcnZhdGlvbikge1xuXHRcdGxldCBub3JtX2NvbnN0ID0gMDtcblx0XHQvL2xldCBtb2RlbEluZGV4ID0gMDtcblxuXHRcdC8vPT09PT09PT09PT09PT09PT0gSU5JVElBTElaRSBBTFBIQSBWQVJJQUJMRVMgPT09PT09PT09PT09PT09PT0vL1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0bGV0IG0gPSB0aGlzLm1vZGVsLm1vZGVsc1tpXTtcblx0XHRcdGxldCBuc3RhdGVzID0gbS5wYXJhbWV0ZXJzLnN0YXRlcztcblx0XHRcdGxldCBtUmVzID0gdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV07XG5cblx0XHRcdGZvcihsZXQgaj0wOyBqPDM7IGorKykge1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbal0gPSBuZXcgQXJyYXkobnN0YXRlcyk7XG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdG1SZXMuYWxwaGFfaFtqXVtrXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYobS5wYXJhbWV0ZXJzLnRyYW5zaXRpb25fbW9kZSA9PSAwKSB7IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gZXJnb2RpY1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRtUmVzLmFscGhhX2hbMF1ba10gPSBtUmVzLnByaW9yW2tdICogZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbS5zdGF0ZXNba10sIG1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHNba10pOyAvLyBzZWUgaG93IG9ic1Byb2IgaXMgaW1wbGVtZW50ZWRcblx0XHRcdFx0XHRtUmVzLmluc3RhbnRfbGlrZWxpaG9vZCArPSBtUmVzLmFscGhhWzBdW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgeyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBsZWZ0LXJpZ2h0XG5cdFx0XHRcdG1SZXMuYWxwaGFfaFswXVswXSA9IHRoaXMubW9kZWwucHJpb3JbaV07XG5cdFx0XHRcdG1SZXMuYWxwaGFfaFswXVswXSAqPSBnbW1MaWtlbGlob29kKG9ic2VydmF0aW9uLCBtLnN0YXRlc1swXSwgbVJlcy5zaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0c1swXSk7XG5cdFx0XHRcdG1SZXMuaW5zdGFudF9saWtlbGlob29kID0gbVJlcy5hbHBoYV9oWzBdWzBdO1xuXHRcdFx0fVxuXHRcdFx0bm9ybV9jb25zdCArPSBtUmVzLmluc3RhbnRfbGlrZWxpaG9vZDtcblx0XHR9XG5cblx0XHQvLz09PT09PT09PT09PT09PT09PSBOT1JNQUxJWkUgQUxQSEEgVkFSSUFCTEVTID09PT09PT09PT09PT09PT09Ly9cblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGxldCBuc3RhdGVzID0gdGhpcy5tb2RlbC5tb2RlbHNbaV0ucGFyYW1ldGVycy5zdGF0ZXM7XG5cdFx0XHRmb3IobGV0IGU9MDsgZTwzOyBlKyspIHtcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFtlXVtrXSAvPSBub3JtX2NvbnN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5mb3J3YXJkX2luaXRpYWxpemVkID0gdHJ1ZTtcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT0gRk9SV0FSRCBVUERBVEUgPT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cblx0Zm9yd2FyZFVwZGF0ZShvYnNlcnZhdGlvbikge1xuXHRcdGxldCBub3JtX2NvbnN0ID0gMDtcblx0XHRsZXQgdG1wID0gMDtcblx0XHRsZXQgZnJvbnQ7IC8vIGFycmF5XG5cblx0XHRoaG1tTGlrZWxpaG9vZEFscGhhKDEsIHRoaXMuZnJvbnRpZXJfdjEsIHRoaXMubW9kZWwsIHRoaXMubW9kZWxSZXN1bHRzKTtcblx0XHRoaG1tTGlrZWxpaG9vZEFscGhhKDIsIHRoaXMuZnJvbnRpZXJfdjIsIHRoaXMubW9kZWwsIHRoaXMubW9kZWxSZXN1bHRzKTtcblxuXHRcdC8vIGxldCBudW1fY2xhc3NlcyA9IFxuXHRcdC8vIGxldCBkc3RNb2RlbEluZGV4ID0gMDtcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGxldCBtID0gdGhpcy5tb2RlbC5tb2RlbHNbaV07XG5cdFx0XHRsZXQgbnN0YXRlcyA9IG0ucGFyYW1ldGVycy5zdGF0ZXM7XG5cdFx0XHRsZXQgbVJlcyA9IHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldO1xuXHRcdFx0XG5cdFx0XHQvLz09PT09PT09PT09PT0gQ09NUFVURSBGUk9OVElFUiBWQVJJQUJMRSA9PT09PT09PT09PT0vL1xuXG5cdFx0XHRmcm9udCA9IG5ldyBBcnJheShuc3RhdGVzKTtcblx0XHRcdGZvcihsZXQgaj0wOyBqPG5zdGF0ZXM7IGorKykge1xuXHRcdFx0XHRmcm9udFtqXSA9IDA7XG5cdFx0XHR9XG5cblx0XHRcdGlmKG0ucGFyYW1ldGVycy50cmFuc2l0aW9uX21vZGUgPT0gMCkgeyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vIGVyZ29kaWNcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8bnN0YXRlczsgaisrKSB7XG5cdFx0XHRcdFx0XHRmcm9udFtrXSArPSBtLnRyYW5zaXRpb25baiAqIG5zdGF0ZXMgKyBrXSAvXG5cdFx0XHRcdFx0XHRcdFx0XHQoMSAtIG0uZXhpdFByb2JhYmlsaXRpZXNbal0pICpcblx0XHRcdFx0XHRcdFx0XHRcdG1SZXMuYWxwaGFfaFswXVtqXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Zm9yKGxldCBzcmNpPTA7IHNyY2k8bnN0YXRlczsgc3JjaSsrKSB7XG5cdFx0XHRcdFx0XHRmcm9udFtrXSArPSBtUmVzLnByaW9yW2tdICpcblx0XHRcdFx0XHRcdFx0XHRcdChcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5mcm9udGllcl92MVtzcmNpXSAqIHRoaXMudHJhbnNpdGlvbltzcmNpXVtpXSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMucHJpb3JbaV0gKiB0aGlzLmZyb250aWVyX3YyW3NyY2ldXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHsgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBsZWZ0LXJpZ2h0XG5cblx0XHRcdFx0Ly8gayA9PSAwIDogZmlyc3Qgc3RhdGUgb2YgdGhlIHByaW1pdGl2ZVxuXHRcdFx0XHRmcm9udFswXSA9IG1SZXMudHJhbnNpdGlvblswXSAqIG1SZXMuYWxwaGFfaFswXVswXTtcblxuXHRcdFx0XHRmb3IobGV0IHNyY2k9MDsgc3JjaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IHNyY2krKykge1xuXHRcdFx0XHRcdGZyb250WzBdICs9IHRoaXMuZnJvbnRpZXJfdjFbc3JjaV0gKiB0aGlzLnRyYW5zaXRpb25bc3JjaV1baV0gK1xuXHRcdFx0XHRcdFx0XHRcdHRoaXMucHJpb3JbaV0gKiB0aGlzLmZyb250aWVyX3YyW3NyY2ldO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gayA+IDAgOiByZXN0IG9mIHRoZSBwcmltaXRpdmVcblx0XHRcdFx0Zm9yKGxldCBrPTE7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0ZnJvbnRba10gKz0gbS50cmFuc2l0aW9uW2sgKiAyXSAvXG5cdFx0XHRcdFx0XHRcdFx0KDEgLSBtLmV4aXRQcm9iYWJpbGl0aWVzW2tdKSAqXG5cdFx0XHRcdFx0XHRcdFx0bVJlcy5hbHBoYV9oWzBdW2tdO1xuXHRcdFx0XHRcdGZyb250W2tdICs9IG0udHJhbnNpdGlvblsoayAtIDEpICogMiArIDFdIC9cblx0XHRcdFx0XHRcdFx0XHQoMSAtIG0uZXhpdFByb2JhYmlsaXRpZXNbayAtIDFdKSAqXG5cdFx0XHRcdFx0XHRcdFx0bVJlcy5hbHBoYV9oWzBdW2sgLSAxXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGZvcihsZXQgaj0wOyBqPDM7IGorKykge1xuXHRcdFx0XHRcdGZvcihsZXQgaz0wOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdFx0bVJlcy5hbHBoYV9oW2pdW2tdID0gMDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly89PT09PT09PT09PT09PSBVUERBVEUgRk9SV0FSRCBWQVJJQUJMRSA9PT09PT09PT09PT09Ly9cblxuXHRcdFx0bVJlcy5leGl0X2xpa2VsaWhvb2QgPSAwO1xuXHRcdFx0bVJlcy5pbnN0YW50X2xpa2VsaWhvb2QgPSAwO1xuXG5cdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0dG1wID0gZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbS5zdGF0ZXNba10sIG1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHNba10pICogZnJvbnRba107XG5cblx0XHRcdFx0bVJlcy5hbHBoYV9oWzJdW2tdID0gdGhpcy5leGl0X3RyYW5zaXRpb25baV0gKiBtLmV4aXRQcm9iYWJpbGl0aWVzW2tdICogdG1wO1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbMV1ba10gPSAoMSAtIHRoaXMuZXhpdF90cmFuc2l0aW9uW2ldKSAqIG0uZXhpdFByb2JhYmlsaXRpZXNba10gKiB0bXA7XG5cdFx0XHRcdG1SZXMuYWxwaGFfaFswXVtrXSA9ICgxIC0gbS5leGl0UHJvYmFiaWxpdGllc1trXSkgKiB0bXA7XG5cblx0XHRcdFx0bVJlcy5leGl0X2xpa2VsaWhvb2QgXHQrPSBtUmVzLmFscGhhX2hbMV1ba10gKyBtUmVzLmFscGhhX2hbMl1ba107XG5cdFx0XHRcdG1SZXMuaW5zdGFudF9saWtlbGlob29kICs9IG1SZXMuYWxwaGFfaFswXVtrXSArIG1SZXMuYWxwaGFfaFsxXVtrXSArIG1SZXMuYWxwaGFfaFsyXVtrXTtcblx0XHRcdH1cblxuXHRcdFx0bVJlcy5leGl0X3JhdGlvID0gbVJlcy5leGl0X2xpa2VsaWhvb2QgLyBtUmVzLmluc3RhbnRfbGlrZWxpaG9vZDtcblx0XHR9XG5cblx0XHQvLz09PT09PT09PT09PT09IE5PUk1BTElaRSBBTFBIQSBWQVJJQUJMRVMgPT09PT09PT09PT09PS8vXG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Zm9yKGxldCBlPTA7IGU8MzsgZSsrKSB7XG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPHRoaXMubW9kZWwubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXS5hbHBoYV9oW2VdW2tdIC89IG5vcm1fY29uc3Q7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT0gVVBEQVRFIFJFU1VMVFMgPT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdHVwZGF0ZVJlc3VsdHMoKSB7XG5cdFx0bGV0IG1heGxvZ19saWtlbGlob29kID0gMDtcblx0XHRsZXQgbm9ybWNvbnN0X2luc3RhbnQgPSAwO1xuXHRcdGxldCBub3JtY29uc3Rfc21vb3RoZWQgPSAwO1xuXG5cdFx0bGV0IHJlcyA9IHRoaXMubW9kZWxSZXN1bHRzO1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0bGV0IGhtbVJlcyA9IHJlcy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXTtcblxuXHRcdFx0cmVzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV0gXHRcdD0gaG1tUmVzLmluc3RhbnRfbGlrZWxpaG9vZDtcblx0XHRcdHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPSBobW1SZXMubG9nX2xpa2VsaWhvb2Q7XG5cdFx0XHRyZXMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV0gXHQ9IE1hdGguZXhwKHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0pO1xuXG5cdFx0XHRyZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldIFx0PSByZXMuaW5zdGFudF9saWtlbGlob29kc1tpXTtcblx0XHRcdHJlcy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldIFx0PSByZXMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV07XG5cblx0XHRcdG5vcm1jb25zdF9pbnN0YW50IFx0Kz0gcmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblx0XHRcdG5vcm1jb25zdF9zbW9vdGhlZCBcdCs9IHJlcy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldO1xuXG5cdFx0XHRpZihpPT0wIHx8IHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPiBtYXhsb2dfbGlrZWxpaG9vZCkge1xuXHRcdFx0XHRtYXhsb2dfbGlrZWxpaG9vZCA9IHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV07XG5cdFx0XHRcdHJlcy5saWtlbGllc3QgPSBpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRyZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldIFx0Lz0gbm9ybWNvbnN0X2luc3RhbnQ7XG5cdFx0XHRyZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSBcdC89IG5vcm1jb25zdF9zbW9vdGhlZDtcblx0XHR9XG5cdH1cbn1cblxuLypcblx0c2V0TGlrZWxpaG9vZFdpbmRvdyhuZXdXaW5kb3dTaXplKSB7XG5cdFx0dGhpcy5saWtlbGlob29kV2luZG93ID0gbmV3V2luZG93U2l6ZTtcblx0XHRpZih0aGlzLm1vZGVsID09PSB1bmRlZmluZWQpIHJldHVybjtcblx0XHRsZXQgcmVzID0gdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NNb2RlbFJlc3VsdHM7XG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJlc1tpXS5saWtlbGlob29kX2J1ZmZlciA9IFtdO1xuXHRcdFx0cmVzW2ldLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aCA9IHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdGZvcihsZXQgaj0wOyBqPHRoaXMubGlrZWxpaG9vZFdpbmRvdzsgaisrKSB7XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlcltqXSA9IDEgLyB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2V0VmFyaWFuY2VPZmZzZXQoKSB7XG5cdFx0Ly8gbm90IHVzZWQgZm9yIG5vdyAobmVlZCB0byBpbXBsZW1lbnQgdXBkYXRlSW52ZXJzZUNvdmFyaWFuY2UgbWV0aG9kKS5cblx0XHQvLyBub3cgYWNjZXNzaWJsZSBhcyB0cmFpbmluZyBwYXJhbWV0ZXIgb2YgdGhlIGNoaWxkIHByb2Nlc3MuXG5cdH1cblxuLy8qL1xuIl19