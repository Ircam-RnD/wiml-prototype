"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _wavesLfo = require("waves-lfo");

var lfo = _interopRequireWildcard(_wavesLfo);

// ========================================================== //
// ==================== descriptors lfo ===================== //
// ========================================================== //

var PseudoYin = (function (_lfo$core$BaseLfo) {
	_inherits(PseudoYin, _lfo$core$BaseLfo);

	function PseudoYin() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, PseudoYin);

		var defaults = {
			frameSize: 3,
			// minInput: -360,
			// maxInput: 360,
			noiseThreshold: 0.1
		};
		_get(Object.getPrototypeOf(PseudoYin.prototype), "constructor", this).call(this, defaults, options);

		this.mean = 0;
		this.magnitude = 0;
		this.stdDev = 0;
		this.crossings = [];
		this.periodMean = 0;
		this.periodStdDev = 0;
		//this.inputRate = this.params.inputRate;
		this.noiseThreshold = this.params.noiseThreshold;

		//this.maxFreq = this.inputRate / 0.5;
	}

	_createClass(PseudoYin, [{
		key: "initialize",
		value: function initialize() {
			var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			outStreamParams.frameSize = this.params.frameSize;
			_get(Object.getPrototypeOf(PseudoYin.prototype), "initialize", this).call(this, inStreamParams, outStreamParams);
			console.log(this.streamParams.sourceSampleRate);

			// normalize frequency with maxFreq
			if (!this.streamParams.sourceSampleRate) {
				this.streamParams.sourceSampleRate = 10;
			}
			this.maxFreq = this.streamParams.sourceSampleRate * 0.5;

			// normalize periodicity with maxPeriod - minPeriod
			// minPeriod is 2 samples
			// maxPeriod is frameSize - 1
			// simplification : minPeriod = 0, maxPeriod = frameSize
			// => max mean = frameSize / 2
			// => max std dev = sqrt(2 * (framsize / 2) * (framesize / 2))
			//				  = sqrt(framesize * framesize * 0.5)
			//  			  = framesize * sqrt(0.5) < framesize

			/*
   super.initialize({
   	frameSize: this.params.frameSize
   });
   */
		}
	}, {
		key: "_mainAlgorithm",
		value: function _mainAlgorithm() {

			// compute min, max and mean (and magnitude)
			var min = undefined,
			    max = undefined;
			min = max = this.inputFrame[0];
			this.mean = 0;
			this.magnitude = 0;
			for (var i in this.inputFrame) {
				var val = this.inputFrame[i];
				this.magnitude += val * val;
				this.mean += val;
				if (val > max) {
					max = val;
				} else if (val < min) {
					min = val;
				}
			}
			// TODO : more tests to determine which mean (true mean or (max-min)/2) is the best
			//this.mean /= this.inputFrame.length;
			this.mean = min + (max - min) * 0.5;

			this.magnitude /= this.inputFrame.length;
			this.magnitude = Math.sqrt(this.magnitude);

			// compute signal stdDev and number of mean-crossings
			// descending mean crossing is used here
			this.crossings = [];
			this.stdDev = 0;
			var prevDelta = this.inputFrame[0] - this.mean;
			for (var i in this.inputFrame) {
				var delta = this.inputFrame[i] - this.mean;
				this.stdDev += delta * delta;
				if (prevDelta > this.noiseThreshold && delta < this.noiseThreshold) {
					this.crossings.push(i);
				}
				prevDelta = delta;
			}
			this.stdDev /= this.inputFrame.length - 1;
			this.stdDev = Math.sqrt(this.stdDev);

			// compute mean of delta-T between crossings
			this.periodMean = 0;
			for (var i = 1; i < this.crossings.length; i++) {
				this.periodMean += this.crossings[i] - this.crossings[i - 1];
			}
			this.periodMean /= this.crossings.length - 1;

			// compute stdDev of delta-T between crossings
			this.periodStdDev = 0;
			for (var i = 1; i < this.crossings.length; i++) {
				var deltaP = this.crossings[i] - this.crossings[i - 1] - this.periodMean;
				this.periodStdDev += deltaP * deltaP;
			}
			if (this.crossings.length > 2) {
				this.periodStdDev = Math.sqrt(this.periodStdDev / (this.crossings.length - 2));
			}
		}
	}, {
		key: "setNoiseThreshold",
		value: function setNoiseThreshold(thresh) {
			this.noiseThreshold = thresh;
		}

		// this one gets frames to analyze : compute magnitude, zero crossing rate, and periodicity
	}, {
		key: "process",
		value: function process(time, frame, metaData) {
			this.time = time;
			this.inputFrame = frame;

			this._mainAlgorithm();

			this.amplitude = this.stdDev * 2.0; // empirical factor because we don't know a priori sensor range

			//this.frequency = Math.sqrt(this.crossings.length * 2.0 / this.inputFrame.length); // sqrt'ed normalized by nyquist freq
			this.frequency = this.crossings.length * 2.0 / this.inputFrame.length; // normalized by nyquist freq

			if (this.crossings.length > 2) {
				//let clip = this.periodStdDev * 5 / this.inputFrame.length;
				//clip = Math.min(clip, 1.);
				//this.periodicity = 1.0 - Math.sqrt(clip);

				this.periodicity = 1.0 - Math.sqrt(this.periodStdDev / this.inputFrame.length);
				//this.periodicity = 1.0 - Math.pow(this.periodStdDev / this.inputFrame.length, 0.7);
			} else {
					this.periodicity = 0;
				}

			// TODO : improve periodicity algorithm !!!
			this.outFrame[0] = this.amplitude;
			this.outFrame[1] = this.frequency;
			this.outFrame[2] = this.periodicity;
			this.output();
		}
	}]);

	return PseudoYin;
})(lfo.core.BaseLfo);

exports["default"] = PseudoYin;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1wc2V1ZG8teWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7Ozs7OztJQU1NLFNBQVM7V0FBVCxTQUFTOztBQUVsQixVQUZTLFNBQVMsR0FFSDtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBRkosU0FBUzs7QUFHNUIsTUFBTSxRQUFRLEdBQUc7QUFDaEIsWUFBUyxFQUFFLENBQUM7OztBQUdaLGlCQUFjLEVBQUUsR0FBRztHQUNuQixDQUFDO0FBQ0YsNkJBVG1CLFNBQVMsNkNBU3RCLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsTUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsTUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7O0FBRXRCLE1BQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUM7OztFQUdqRDs7Y0FyQm1CLFNBQVM7O1NBdUJuQixzQkFBNEM7T0FBM0MsY0FBYyx5REFBRyxFQUFFO09BQUUsZUFBZSx5REFBRyxFQUFFOztBQUNuRCxrQkFBZSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNsRCw4QkF6Qm1CLFNBQVMsNENBeUJYLGNBQWMsRUFBRSxlQUFlLEVBQUU7QUFDbEQsVUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7OztBQUdoRCxPQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsRUFBRTtBQUN2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QUMsV0FBVyxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQzs7SUFFL0UsTUFBTTtBQUNOLFNBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0tBQ3JCOzs7QUFHRCxPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDbEMsT0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQ2xDLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNwQyxPQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDZDs7O1FBNUltQixTQUFTO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztxQkFBbEMsU0FBUyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8tcHNldWRvLXlpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tIFwid2F2ZXMtbGZvXCI7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09IGRlc2NyaXB0b3JzIGxmbyA9PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHNldWRvWWluIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRmcmFtZVNpemU6IDMsXG5cdFx0XHQvLyBtaW5JbnB1dDogLTM2MCxcblx0XHRcdC8vIG1heElucHV0OiAzNjAsXG5cdFx0XHRub2lzZVRocmVzaG9sZDogMC4xXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLm1lYW4gPSAwO1xuXHRcdHRoaXMubWFnbml0dWRlID0gMDtcblx0XHR0aGlzLnN0ZERldiA9IDA7XG5cdFx0dGhpcy5jcm9zc2luZ3MgPSBbXTtcblx0XHR0aGlzLnBlcmlvZE1lYW4gPSAwO1xuXHRcdHRoaXMucGVyaW9kU3RkRGV2ID0gMDtcblx0XHQvL3RoaXMuaW5wdXRSYXRlID0gdGhpcy5wYXJhbXMuaW5wdXRSYXRlO1xuXHRcdHRoaXMubm9pc2VUaHJlc2hvbGQgPSB0aGlzLnBhcmFtcy5ub2lzZVRocmVzaG9sZDtcblxuXHRcdC8vdGhpcy5tYXhGcmVxID0gdGhpcy5pbnB1dFJhdGUgLyAwLjU7XG5cdH1cblxuXHRpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zID0ge30sIG91dFN0cmVhbVBhcmFtcyA9IHt9KSB7XG5cdFx0b3V0U3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTtcblx0XHRzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCBvdXRTdHJlYW1QYXJhbXMpO1xuXHRcdGNvbnNvbGUubG9nKHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUpO1xuXG5cdFx0Ly8gbm9ybWFsaXplIGZyZXF1ZW5jeSB3aXRoIG1heEZyZXFcblx0XHRpZighdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSkge1xuXHRcdFx0dGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSA9IDEwO1xuXHRcdH1cblx0XHR0aGlzLm1heEZyZXEgPSB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlICogMC41O1xuXG5cdFx0Ly8gbm9ybWFsaXplIHBlcmlvZGljaXR5IHdpdGggbWF4UGVyaW9kIC0gbWluUGVyaW9kXG5cdFx0Ly8gbWluUGVyaW9kIGlzIDIgc2FtcGxlc1xuXHRcdC8vIG1heFBlcmlvZCBpcyBmcmFtZVNpemUgLSAxXG5cdFx0Ly8gc2ltcGxpZmljYXRpb24gOiBtaW5QZXJpb2QgPSAwLCBtYXhQZXJpb2QgPSBmcmFtZVNpemVcblx0XHQvLyA9PiBtYXggbWVhbiA9IGZyYW1lU2l6ZSAvIDJcblx0XHQvLyA9PiBtYXggc3RkIGRldiA9IHNxcnQoMiAqIChmcmFtc2l6ZSAvIDIpICogKGZyYW1lc2l6ZSAvIDIpKSBcblx0XHQvL1x0XHRcdFx0ICA9IHNxcnQoZnJhbWVzaXplICogZnJhbWVzaXplICogMC41KVxuXHRcdC8vICBcdFx0XHQgID0gZnJhbWVzaXplICogc3FydCgwLjUpIDwgZnJhbWVzaXplXG5cblx0XHQvKlxuXHRcdHN1cGVyLmluaXRpYWxpemUoe1xuXHRcdFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5mcmFtZVNpemVcblx0XHR9KTtcblx0XHQqL1xuXHR9XG5cblx0X21haW5BbGdvcml0aG0oKSB7XG5cblx0XHQvLyBjb21wdXRlIG1pbiwgbWF4IGFuZCBtZWFuIChhbmQgbWFnbml0dWRlKVxuXHRcdGxldCBtaW4sIG1heDtcblx0XHRtaW4gPSBtYXggPSB0aGlzLmlucHV0RnJhbWVbMF07XG5cdFx0dGhpcy5tZWFuID0gMDtcblx0XHR0aGlzLm1hZ25pdHVkZSA9IDA7XG5cdFx0Zm9yKGxldCBpIGluIHRoaXMuaW5wdXRGcmFtZSkge1xuXHRcdFx0bGV0IHZhbCA9IHRoaXMuaW5wdXRGcmFtZVtpXTtcblx0XHRcdHRoaXMubWFnbml0dWRlICs9IHZhbCAqIHZhbDtcblx0XHRcdHRoaXMubWVhbiArPSB2YWw7XG5cdFx0XHRpZih2YWwgPiBtYXgpIHtcblx0XHRcdFx0bWF4ID0gdmFsO1xuXHRcdFx0fSBlbHNlIGlmKHZhbCA8IG1pbikge1xuXHRcdFx0XHRtaW4gPSB2YWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIFRPRE8gOiBtb3JlIHRlc3RzIHRvIGRldGVybWluZSB3aGljaCBtZWFuICh0cnVlIG1lYW4gb3IgKG1heC1taW4pLzIpIGlzIHRoZSBiZXN0XG5cdFx0Ly90aGlzLm1lYW4gLz0gdGhpcy5pbnB1dEZyYW1lLmxlbmd0aDtcblx0XHR0aGlzLm1lYW4gPSBtaW4gKyAobWF4IC0gbWluKSAqIDAuNTtcblxuXHRcdHRoaXMubWFnbml0dWRlIC89IHRoaXMuaW5wdXRGcmFtZS5sZW5ndGg7XG5cdFx0dGhpcy5tYWduaXR1ZGUgPSBNYXRoLnNxcnQodGhpcy5tYWduaXR1ZGUpO1xuXG5cdFx0Ly8gY29tcHV0ZSBzaWduYWwgc3RkRGV2IGFuZCBudW1iZXIgb2YgbWVhbi1jcm9zc2luZ3Ncblx0XHQvLyBkZXNjZW5kaW5nIG1lYW4gY3Jvc3NpbmcgaXMgdXNlZCBoZXJlXG5cdFx0dGhpcy5jcm9zc2luZ3MgPSBbXTtcblx0XHR0aGlzLnN0ZERldiA9IDA7XG5cdFx0bGV0IHByZXZEZWx0YSA9IHRoaXMuaW5wdXRGcmFtZVswXSAtIHRoaXMubWVhbjtcblx0XHRmb3IobGV0IGkgaW4gdGhpcy5pbnB1dEZyYW1lKSB7XG5cdFx0XHRsZXQgZGVsdGEgPSB0aGlzLmlucHV0RnJhbWVbaV0gLSB0aGlzLm1lYW47XG5cdFx0XHR0aGlzLnN0ZERldiArPSBkZWx0YSAqIGRlbHRhO1xuXHRcdFx0aWYocHJldkRlbHRhID4gdGhpcy5ub2lzZVRocmVzaG9sZCAmJiBkZWx0YSA8IHRoaXMubm9pc2VUaHJlc2hvbGQpIHtcblx0XHRcdFx0dGhpcy5jcm9zc2luZ3MucHVzaChpKTtcblx0XHRcdH1cblx0XHRcdHByZXZEZWx0YSA9IGRlbHRhO1xuXHRcdH1cblx0XHR0aGlzLnN0ZERldiAvPSAodGhpcy5pbnB1dEZyYW1lLmxlbmd0aCAtIDEpO1xuXHRcdHRoaXMuc3RkRGV2ID0gTWF0aC5zcXJ0KHRoaXMuc3RkRGV2KTtcblxuXHRcdC8vIGNvbXB1dGUgbWVhbiBvZiBkZWx0YS1UIGJldHdlZW4gY3Jvc3NpbmdzXG5cdFx0dGhpcy5wZXJpb2RNZWFuID0gMDtcblx0XHRmb3IobGV0IGk9MTsgaTx0aGlzLmNyb3NzaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5wZXJpb2RNZWFuICs9IHRoaXMuY3Jvc3NpbmdzW2ldIC0gdGhpcy5jcm9zc2luZ3NbaSAtIDFdO1xuXHRcdH1cblx0XHR0aGlzLnBlcmlvZE1lYW4gLz0gKHRoaXMuY3Jvc3NpbmdzLmxlbmd0aCAtIDEpO1xuXG5cdFx0Ly8gY29tcHV0ZSBzdGREZXYgb2YgZGVsdGEtVCBiZXR3ZWVuIGNyb3NzaW5nc1xuXHRcdHRoaXMucGVyaW9kU3RkRGV2ID0gMDtcblx0XHRmb3IobGV0IGk9MTsgaTx0aGlzLmNyb3NzaW5ncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGV0IGRlbHRhUCA9ICh0aGlzLmNyb3NzaW5nc1tpXSAtIHRoaXMuY3Jvc3NpbmdzW2kgLSAxXSAtIHRoaXMucGVyaW9kTWVhbilcblx0XHRcdHRoaXMucGVyaW9kU3RkRGV2ICs9IGRlbHRhUCAqIGRlbHRhUDtcblx0XHR9XG5cdFx0aWYodGhpcy5jcm9zc2luZ3MubGVuZ3RoID4gMikge1xuXHRcdFx0dGhpcy5wZXJpb2RTdGREZXYgPSBNYXRoLnNxcnQodGhpcy5wZXJpb2RTdGREZXYgLyAodGhpcy5jcm9zc2luZ3MubGVuZ3RoIC0gMikpO1xuXHRcdH1cblx0fVxuXG5cdHNldE5vaXNlVGhyZXNob2xkKHRocmVzaCkge1xuXHRcdHRoaXMubm9pc2VUaHJlc2hvbGQgPSB0aHJlc2g7XG5cdH1cblxuXHQvLyB0aGlzIG9uZSBnZXRzIGZyYW1lcyB0byBhbmFseXplIDogY29tcHV0ZSBtYWduaXR1ZGUsIHplcm8gY3Jvc3NpbmcgcmF0ZSwgYW5kIHBlcmlvZGljaXR5XG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0dGhpcy50aW1lID0gdGltZTtcblx0XHR0aGlzLmlucHV0RnJhbWUgPSBmcmFtZTtcblxuXHRcdHRoaXMuX21haW5BbGdvcml0aG0oKTtcblxuXHRcdHRoaXMuYW1wbGl0dWRlID0gdGhpcy5zdGREZXYgKiAyLjA7IC8vIGVtcGlyaWNhbCBmYWN0b3IgYmVjYXVzZSB3ZSBkb24ndCBrbm93IGEgcHJpb3JpIHNlbnNvciByYW5nZVxuXG5cdFx0Ly90aGlzLmZyZXF1ZW5jeSA9IE1hdGguc3FydCh0aGlzLmNyb3NzaW5ncy5sZW5ndGggKiAyLjAgLyB0aGlzLmlucHV0RnJhbWUubGVuZ3RoKTsgLy8gc3FydCdlZCBub3JtYWxpemVkIGJ5IG55cXVpc3QgZnJlcVxuXHRcdHRoaXMuZnJlcXVlbmN5ID0gdGhpcy5jcm9zc2luZ3MubGVuZ3RoICogMi4wIC8gdGhpcy5pbnB1dEZyYW1lLmxlbmd0aDsgLy8gbm9ybWFsaXplZCBieSBueXF1aXN0IGZyZXFcblx0XHRcblx0XHRpZih0aGlzLmNyb3NzaW5ncy5sZW5ndGggPiAyKSB7XG5cdFx0XHQvL2xldCBjbGlwID0gdGhpcy5wZXJpb2RTdGREZXYgKiA1IC8gdGhpcy5pbnB1dEZyYW1lLmxlbmd0aDtcblx0XHRcdC8vY2xpcCA9IE1hdGgubWluKGNsaXAsIDEuKTtcblx0XHRcdC8vdGhpcy5wZXJpb2RpY2l0eSA9IDEuMCAtIE1hdGguc3FydChjbGlwKTtcblxuXHRcdFx0dGhpcy5wZXJpb2RpY2l0eSA9IDEuMCAtIE1hdGguc3FydCh0aGlzLnBlcmlvZFN0ZERldiAvIHRoaXMuaW5wdXRGcmFtZS5sZW5ndGgpO1xuXHRcdFx0Ly90aGlzLnBlcmlvZGljaXR5ID0gMS4wIC0gTWF0aC5wb3codGhpcy5wZXJpb2RTdGREZXYgLyB0aGlzLmlucHV0RnJhbWUubGVuZ3RoLCAwLjcpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnBlcmlvZGljaXR5ID0gMDtcblx0XHR9XG5cblx0XHQvLyBUT0RPIDogaW1wcm92ZSBwZXJpb2RpY2l0eSBhbGdvcml0aG0gISEhXG5cdFx0dGhpcy5vdXRGcmFtZVswXSA9IHRoaXMuYW1wbGl0dWRlO1xuXHRcdHRoaXMub3V0RnJhbWVbMV0gPSB0aGlzLmZyZXF1ZW5jeTtcblx0XHR0aGlzLm91dEZyYW1lWzJdID0gdGhpcy5wZXJpb2RpY2l0eTtcblx0XHR0aGlzLm91dHB1dCgpO1xuXHR9XG59XG4iXX0=