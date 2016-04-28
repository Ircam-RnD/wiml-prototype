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

// simplified decoding algorithm :
// if(!forward_init) forward_init(obs); else forward_update(obs)
// for(model in models) model.updateAlphaWindow(); model.updateResults();
// updateResults();

//=================== THE EXPORTED CLASS ======================//

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
		// original xmm modelResults fields :
		// instantLikelihoods, instantNormalizedLikelihoods,
		// smoothedLikelihoods, smoothedNormalizedLikelihoods,
		// smoothedLogLikelihoods, likeliest, outputValues, outputVariance
	}

	_createClass(XmmHhmmDecoder, [{
		key: 'process',

		//return('no estimation available');
		value: function process(time, frame, metaData) {

			//incoming frame is observation vector
			if (this.model === undefined) {
				console.log("no model loaded");
				return;
			}

			this.time = time;
			this.metaData = metaData;

			var outFrame = this.outFrame;

			likelihoods(frame, this.model, this.modelResults);

			for (var i = 0; i < this.model.models.length; i++) {
				outFrame[i] = this.modelResults.smoothed_normalized_likelihoods[i];
			}

			this.output();
		}
	}, {
		key: 'setModel',
		value: function setModel(model) {
			this.model = undefined;
			this.modelResults = undefined;

			// test if model is valid here (TODO : write a better test)
			if (model.models !== undefined) {
				this.model = model;
				var nmodels = model.models.length;
				this.modelResults = {
					instant_likelihoods: new Array(nmodels),
					smoothed_log_likelihoods: new Array(nmodels),
					smoothed_likelihoods: new Array(nmodels),
					instant_normalized_likelihoods: new Array(nmodels),
					smoothed_normalized_likelihoods: new Array(nmodels),
					likeliest: -1,
					singleClassModelResults: []
				};

				for (var i = 0; i < model.models.length; i++) {

					this.modelResults.instant_likelihoods[i] = 0;
					this.modelResults.smoothed_log_likelihoods[i] = 0;
					this.modelResults.smoothed_likelihoods[i] = 0;
					this.modelResults.instant_normalized_likelihoods[i] = 0;
					this.modelResults.smoothed_normalized_likelihoods[i] = 0;

					var res = {};
					res.instant_likelihood = 0;
					res.log_likelihood = 0;
					res.likelihood_buffer = [];
					res.likelihood_buffer.length = this.likelihoodWindow;
					for (var j = 0; j < this.likelihoodWindow; j++) {
						res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
					}
					this.modelResults.singleClassModelResults.push(res);
				}
			}

			this.initialize({ frameSize: this.model.models.length });
		}
	}, {
		key: 'setLikelihoodWindow',
		value: function setLikelihoodWindow(newWindowSize) {
			this.likelihoodWindow = newWindowSize;
			if (this.model === undefined) return;
			var res = this.modelResults.singleClassModelResults;
			for (var i = 0; i < this.model.models.length; i++) {
				res[i].likelihood_buffer = [];
				res[i].likelihood_buffer.length = this.likelihoodWindow;
				for (var j = 0; j < this.likelihoodWindow; j++) {
					res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
				}
			}
		}
	}, {
		key: 'setVarianceOffset',
		value: function setVarianceOffset() {
			// not used for now (need to implement updateInverseCovariance method)
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
;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby14bW0taGhtbS1kZWNvZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7Ozs7Ozs7OztJQVNNLGNBQWM7V0FBZCxjQUFjOztBQUN2QixVQURTLGNBQWMsR0FDUjtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBREosY0FBYzs7QUFFakMsTUFBTSxRQUFRLEdBQUc7QUFDaEIsbUJBQWdCLEVBQUUsQ0FBQztHQUNuQixDQUFDO0FBQ0YsNkJBTG1CLGNBQWMsNkNBSzNCLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO0FBQzlCLE1BQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDOzs7OztFQUtyRDs7Y0FkbUIsY0FBYzs7OztTQTBCM0IsaUJBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7OztBQUc5QixPQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQzVCLFdBQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMvQixXQUFPO0lBQ1A7O0FBRUQsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLE9BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7O0FBRS9CLGNBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7O0FBRWxELFFBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFF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LElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM3QyxPQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0FBQzlCLE9BQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQ3hELFNBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsUUFBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDckQ7SUFDRDtHQUNEOzs7U0FFZ0IsNkJBQUc7O0dBRW5COzs7T0F4RmlCLGVBQUc7QUFDcEIsT0FBRyxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtBQUNuQyxRQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ3BDLFlBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDNUQ7SUFDRDtBQUNELFVBQU8sU0FBUyxDQUFDO0dBRWpCOzs7UUF4Qm1CLGNBQWM7R0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU87O3FCQUF2QyxjQUFjO0FBeUdsQyxDQUFDIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby14bW0taGhtbS1kZWNvZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbi8vIHNpbXBsaWZpZWQgZGVjb2RpbmcgYWxnb3JpdGhtIDpcbi8vIGlmKCFmb3J3YXJkX2luaXQpIGZvcndhcmRfaW5pdChvYnMpOyBlbHNlIGZvcndhcmRfdXBkYXRlKG9icylcbi8vIGZvcihtb2RlbCBpbiBtb2RlbHMpIG1vZGVsLnVwZGF0ZUFscGhhV2luZG93KCk7IG1vZGVsLnVwZGF0ZVJlc3VsdHMoKTtcbi8vIHVwZGF0ZVJlc3VsdHMoKTtcblxuLy89PT09PT09PT09PT09PT09PT09IFRIRSBFWFBPUlRFRCBDTEFTUyA9PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWG1tSGhtbURlY29kZXIgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRsaWtlbGlob29kV2luZG93OiA1LFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSB0aGlzLnBhcmFtcy5saWtlbGlob29kV2luZG93O1xuXHRcdC8vIG9yaWdpbmFsIHhtbSBtb2RlbFJlc3VsdHMgZmllbGRzIDpcblx0XHQvLyBpbnN0YW50TGlrZWxpaG9vZHMsIGluc3RhbnROb3JtYWxpemVkTGlrZWxpaG9vZHMsXG5cdFx0Ly8gc21vb3RoZWRMaWtlbGlob29kcywgc21vb3RoZWROb3JtYWxpemVkTGlrZWxpaG9vZHMsXG5cdFx0Ly8gc21vb3RoZWRMb2dMaWtlbGlob29kcywgbGlrZWxpZXN0LCBvdXRwdXRWYWx1ZXMsIG91dHB1dFZhcmlhbmNlXG5cdH1cblxuXHRnZXQgbGlrZWxpZXN0TGFiZWwoKSB7XG5cdFx0aWYodGhpcy5tb2RlbFJlc3VsdHMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYodGhpcy5tb2RlbFJlc3VsdHMubGlrZWxpZXN0ID4gLTEpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubW9kZWwubW9kZWxzW3RoaXMubW9kZWxSZXN1bHRzLmxpa2VsaWVzdF0ubGFiZWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAndW5rbm93bic7XG5cdFx0Ly9yZXR1cm4oJ25vIGVzdGltYXRpb24gYXZhaWxhYmxlJyk7XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXG5cdFx0Ly9pbmNvbWluZyBmcmFtZSBpcyBvYnNlcnZhdGlvbiB2ZWN0b3Jcblx0XHRpZih0aGlzLm1vZGVsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwibm8gbW9kZWwgbG9hZGVkXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cdFx0dGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXG5cdFx0Y29uc3Qgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lO1xuXG5cdFx0bGlrZWxpaG9vZHMoZnJhbWUsIHRoaXMubW9kZWwsIHRoaXMubW9kZWxSZXN1bHRzKTtcdFx0XHRcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRvdXRGcmFtZVtpXSA9IHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cdFx0fVxuXG5cdFx0dGhpcy5vdXRwdXQoKTtcblx0fVxuXG5cdHNldE1vZGVsKG1vZGVsKSB7XG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlc3QgaWYgbW9kZWwgaXMgdmFsaWQgaGVyZSAoVE9ETyA6IHdyaXRlIGEgYmV0dGVyIHRlc3QpXG5cdFx0aWYobW9kZWwubW9kZWxzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMubW9kZWwgPSBtb2RlbDtcblx0XHRcdGxldCBubW9kZWxzID0gbW9kZWwubW9kZWxzLmxlbmd0aDtcblx0XHRcdHRoaXMubW9kZWxSZXN1bHRzID0ge1xuXHRcdFx0XHRpbnN0YW50X2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX2xvZ19saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRpbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRsaWtlbGllc3Q6IC0xLFxuXHRcdFx0XHRzaW5nbGVDbGFzc01vZGVsUmVzdWx0czogW11cblx0XHRcdH07XG5cblx0XHRcdGZvcihsZXQgaT0wOyBpPG1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXG5cdFx0XHRcdGxldCByZXMgPSB7fTtcblx0XHRcdFx0cmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5sb2dfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlciA9IFtdO1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoID0gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0XHRmb3IobGV0IGo9MDsgajx0aGlzLmxpa2VsaWhvb2RXaW5kb3c7IGorKykge1xuXHRcdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlcltqXSA9IDEgLyB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NNb2RlbFJlc3VsdHMucHVzaChyZXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuaW5pdGlhbGl6ZSh7IGZyYW1lU2l6ZTogdGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoIH0pO1xuXHR9XG5cblx0c2V0TGlrZWxpaG9vZFdpbmRvdyhuZXdXaW5kb3dTaXplKSB7XG5cdFx0dGhpcy5saWtlbGlob29kV2luZG93ID0gbmV3V2luZG93U2l6ZTtcblx0XHRpZih0aGlzLm1vZGVsID09PSB1bmRlZmluZWQpIHJldHVybjtcblx0XHRsZXQgcmVzID0gdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NNb2RlbFJlc3VsdHM7XG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJlc1tpXS5saWtlbGlob29kX2J1ZmZlciA9IFtdO1xuXHRcdFx0cmVzW2ldLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aCA9IHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdGZvcihsZXQgaj0wOyBqPHRoaXMubGlrZWxpaG9vZFdpbmRvdzsgaisrKSB7XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlcltqXSA9IDEgLyB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2V0VmFyaWFuY2VPZmZzZXQoKSB7XG5cdFx0Ly8gbm90IHVzZWQgZm9yIG5vdyAobmVlZCB0byBpbXBsZW1lbnQgdXBkYXRlSW52ZXJzZUNvdmFyaWFuY2UgbWV0aG9kKVxuXHR9XG59OyJdfQ==