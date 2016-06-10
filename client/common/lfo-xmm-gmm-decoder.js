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

// TODO : add reset() function (empty likelihood_buffer)

//=================== THE EXPORTED CLASS ======================//

var XmmGmmDecoder = (function (_lfo$core$BaseLfo) {
	_inherits(XmmGmmDecoder, _lfo$core$BaseLfo);

	function XmmGmmDecoder() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, XmmGmmDecoder);

		var defaults = {
			likelihoodWindow: 5
		};
		_get(Object.getPrototypeOf(XmmGmmDecoder.prototype), 'constructor', this).call(this, defaults, options);

		this.model = undefined;
		this.modelResults = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
		// original xmm modelResults fields :
		// instantLikelihoods, instantNormalizedLikelihoods,
		// smoothedLikelihoods, smoothedNormalizedLikelihoods,
		// smoothedLogLikelihoods, likeliest, outputValues, outputVariance
	}

	_createClass(XmmGmmDecoder, [{
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

			(0, _xmmDecoderCommon.gmmLikelihoods)(frame, this.model, this.modelResults);
			//gmmLikelihoods(frame, this.model, this.modelResults);			

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
					singleClassGmmModelResults: []
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
					this.modelResults.singleClassGmmModelResults.push(res);
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

	return XmmGmmDecoder;
})(lfo.core.BaseLfo);

exports['default'] = XmmGmmDecoder;
;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby14bW0tZ21tLWRlY29kZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFBcUIsV0FBVzs7SUFBcEIsR0FBRzs7Z0NBQ2dCLHNCQUFzQjs7Ozs7O0lBTWhDLGFBQWE7V0FBYixhQUFhOztBQUN0QixVQURTLGFBQWEsR0FDUDtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBREosYUFBYTs7QUFFaEMsTUFBTSxRQUFRLEdBQUc7QUFDaEIsbUJBQWdCLEVBQUUsQ0FBQztHQUNuQixDQUFDO0FBQ0YsNkJBTG1CLGFBQWEsNkNBSzFCLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxZQUFZLEdBQUcsU0FBUyxDQUFDO0FBQzlCLE1BQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDOzs7OztFQUtyRDs7Y0FkbUIsYUFBYTs7OztTQTBCMUIsaUJBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7OztBQUc5QixPQUFHLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFO0FBQzVCLFdBQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUMvQixXQUFPO0lBQ1A7O0FBRUQsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLE9BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7O0FBRS9CLHlDQUFlLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzs7O0FBR3JELFFBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUs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Q0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM3QyxPQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0FBQzlCLE9BQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDO0FBQ3hELFNBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDMUMsUUFBRyxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDckQ7SUFDRDtHQUNEOzs7U0FFZ0IsNkJBQUc7O0dBRW5COzs7T0F6RmlCLGVBQUc7QUFDcEIsT0FBRyxJQUFJLENBQUMsWUFBWSxLQUFLLFNBQVMsRUFBRTtBQUNuQyxRQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQ3BDLFlBQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLENBQUM7S0FDNUQ7SUFDRDtBQUNELFVBQU8sU0FBUyxDQUFDO0dBRWpCOzs7UUF4Qm1CLGFBQWE7R0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU87O3FCQUF0QyxhQUFhO0FBMEdqQyxDQUFDIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby14bW0tZ21tLWRlY29kZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcbmltcG9ydCB7IGdtbUxpa2VsaWhvb2RzIH0gZnJvbSAnLi94bW0tZGVjb2Rlci1jb21tb24nXG5cbi8vIFRPRE8gOiBhZGQgcmVzZXQoKSBmdW5jdGlvbiAoZW1wdHkgbGlrZWxpaG9vZF9idWZmZXIpXG5cbi8vPT09PT09PT09PT09PT09PT09PSBUSEUgRVhQT1JURUQgQ0xBU1MgPT09PT09PT09PT09PT09PT09PT09PS8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFhtbUdtbURlY29kZXIgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRsaWtlbGlob29kV2luZG93OiA1LFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSB0aGlzLnBhcmFtcy5saWtlbGlob29kV2luZG93O1xuXHRcdC8vIG9yaWdpbmFsIHhtbSBtb2RlbFJlc3VsdHMgZmllbGRzIDpcblx0XHQvLyBpbnN0YW50TGlrZWxpaG9vZHMsIGluc3RhbnROb3JtYWxpemVkTGlrZWxpaG9vZHMsXG5cdFx0Ly8gc21vb3RoZWRMaWtlbGlob29kcywgc21vb3RoZWROb3JtYWxpemVkTGlrZWxpaG9vZHMsXG5cdFx0Ly8gc21vb3RoZWRMb2dMaWtlbGlob29kcywgbGlrZWxpZXN0LCBvdXRwdXRWYWx1ZXMsIG91dHB1dFZhcmlhbmNlXG5cdH1cblxuXHRnZXQgbGlrZWxpZXN0TGFiZWwoKSB7XG5cdFx0aWYodGhpcy5tb2RlbFJlc3VsdHMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYodGhpcy5tb2RlbFJlc3VsdHMubGlrZWxpZXN0ID4gLTEpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubW9kZWwubW9kZWxzW3RoaXMubW9kZWxSZXN1bHRzLmxpa2VsaWVzdF0ubGFiZWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAndW5rbm93bic7XG5cdFx0Ly9yZXR1cm4oJ25vIGVzdGltYXRpb24gYXZhaWxhYmxlJyk7XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXG5cdFx0Ly9pbmNvbWluZyBmcmFtZSBpcyBvYnNlcnZhdGlvbiB2ZWN0b3Jcblx0XHRpZih0aGlzLm1vZGVsID09PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwibm8gbW9kZWwgbG9hZGVkXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cdFx0dGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXG5cdFx0Y29uc3Qgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lO1xuXG5cdFx0Z21tTGlrZWxpaG9vZHMoZnJhbWUsIHRoaXMubW9kZWwsIHRoaXMubW9kZWxSZXN1bHRzKTtcdFx0XHRcblx0XHQvL2dtbUxpa2VsaWhvb2RzKGZyYW1lLCB0aGlzLm1vZGVsLCB0aGlzLm1vZGVsUmVzdWx0cyk7XHRcdFx0XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0b3V0RnJhbWVbaV0gPSB0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldO1xuXHRcdH1cblxuXHRcdHRoaXMub3V0cHV0KCk7XG5cdH1cblxuXHRzZXRNb2RlbChtb2RlbCkge1xuXHRcdHRoaXMubW9kZWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5tb2RlbFJlc3VsdHMgPSB1bmRlZmluZWQ7XG5cblx0XHQvLyB0ZXN0IGlmIG1vZGVsIGlzIHZhbGlkIGhlcmUgKFRPRE8gOiB3cml0ZSBhIGJldHRlciB0ZXN0KVxuXHRcdGlmKG1vZGVsLm1vZGVscyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLm1vZGVsID0gbW9kZWw7XG5cdFx0XHRsZXQgbm1vZGVscyA9IG1vZGVsLm1vZGVscy5sZW5ndGg7XG5cdFx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHtcblx0XHRcdFx0aW5zdGFudF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0aW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bGlrZWxpZXN0OiAtMSxcblx0XHRcdFx0c2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHM6IFtdXG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IobGV0IGk9MDsgaTxtb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblxuXHRcdFx0XHRsZXQgcmVzID0ge307XG5cdFx0XHRcdHJlcy5pbnN0YW50X2xpa2VsaWhvb2QgPSAwO1xuXHRcdFx0XHRyZXMubG9nX2xpa2VsaWhvb2QgPSAwO1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXIgPSBbXTtcblx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aCA9IHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8dGhpcy5saWtlbGlob29kV2luZG93OyBqKyspIHtcblx0XHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXJbal0gPSAxIC8gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzLnB1c2gocmVzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmluaXRpYWxpemUoeyBmcmFtZVNpemU6IHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aCB9KTtcblx0fVxuXG5cdHNldExpa2VsaWhvb2RXaW5kb3cobmV3V2luZG93U2l6ZSkge1xuXHRcdHRoaXMubGlrZWxpaG9vZFdpbmRvdyA9IG5ld1dpbmRvd1NpemU7XG5cdFx0aWYodGhpcy5tb2RlbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cdFx0bGV0IHJlcyA9IHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzO1xuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRyZXNbaV0ubGlrZWxpaG9vZF9idWZmZXIgPSBbXTtcblx0XHRcdHJlc1tpXS5saWtlbGlob29kX2J1ZmZlci5sZW5ndGggPSB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRmb3IobGV0IGo9MDsgajx0aGlzLmxpa2VsaWhvb2RXaW5kb3c7IGorKykge1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXJbal0gPSAxIC8gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNldFZhcmlhbmNlT2Zmc2V0KCkge1xuXHRcdC8vIG5vdCB1c2VkIGZvciBub3cgKG5lZWQgdG8gaW1wbGVtZW50IHVwZGF0ZUludmVyc2VDb3ZhcmlhbmNlIG1ldGhvZClcblx0fVxufTtcbiJdfQ==