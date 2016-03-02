"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireDefault = require("babel-runtime/helpers/interop-require-default")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _wavesLfo = require("waves-lfo");

var _wavesLfo2 = _interopRequireDefault(_wavesLfo);

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
			noiseThreshold: 0.05
		};
		_get(Object.getPrototypeOf(PseudoYin.prototype), "constructor", this).call(this, defaults, options);

		this.mean = 0;
		this.magnitude = 0;
		this.stdDev = 0;
		this.crossings = [];
		this.periodMean = 0;
		this.periodStdDev = 0;
		this.noiseThreshold = this.params.noiseThreshold;
	}

	_createClass(PseudoYin, [{
		key: "initialize",
		value: function initialize() {
			_get(Object.getPrototypeOf(PseudoYin.prototype), "initialize", this).call(this, {
				frameSize: 3
			});
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
			this.mean /= this.inputFrame.length;
			this.magnitude /= this.inputFrame.length;
			this.magnitude = Math.sqrt(this.magnitude);

			// compute signal stdDev and number of mean-crossings
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

			// TODO : improve periodicity algorithm !!!
			this.outFrame[0] = this.stdDev * 2;
			this.outFrame[1] = this.crossings.length * 5 / this.inputFrame.length;
			this.outFrame[2] = this.periodStdDev / this.inputFrame.length; // kind of non periodicity
			this.output();
		}
	}]);

	return PseudoYin;
})(_wavesLfo2["default"].core.BaseLfo);

exports["default"] = PseudoYin;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1wc2V1ZG8teWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQWdCLFdBQVc7Ozs7Ozs7O0lBTU4sU0FBUztXQUFULFNBQVM7O0FBRWxCLFVBRlMsU0FBUyxHQUVIO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixTQUFTOztBQUc1QixNQUFNLFFBQVEsR0FBRztBQUNoQixZQUFTLEVBQUUsQ0FBQztBQUNaLGlCQUFjLEVBQUUsSUFBSTtHQUNwQixDQUFDO0FBQ0YsNkJBUG1CLFNBQVMsNkNBT3RCLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDbkIsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsTUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsTUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsTUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdEIsTUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQztFQUNqRDs7Y0FoQm1CLFNBQVM7O1NBa0JuQixzQkFBRztBQUNaLDhCQW5CbUIsU0FBUyw0Q0FtQlg7QUFDaEIsYUFBUyxFQUFFLENBQUM7SUFDWixFQUFFO0dBQ0g7OztTQUVhLDBCQUFHOzs7QUFHaEIsT0FBSSxHQUFHLFlBQUE7T0FBRSxHQUFHLFlBQUEsQ0FBQztBQUNiLE1BQUcsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvQixPQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztBQUNkLE9BQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFFBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUM3QixRQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFFBQUksQ0FBQyxTQUFTLElBQUksR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUM1QixRQUFJLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQztBQUNqQixRQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFDYixRQUFHLEdBQUcsR0FBRyxDQUFDO0tBQ1YsTUFBTSxJQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFDcEIsUUFBRyxHQUFHLEdBQUcsQ0FBQztLQUNWO0lBQ0Q7QUFDRCxPQUFJLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ3BDLE9BQUksQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDekMsT0FBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQzs7O0FBRzNDLE9BQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLE9BQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLE9BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztBQUMvQyxRQUFJLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7QUFDN0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzNDLFFBQUksQ0FBQyxNQUFNLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztBQUM3QixRQUFHLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ2xFLFNBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3ZCO0FBQ0QsYUFBUyxHQUFHLEtBQUssQ0FBQztJQUNsQjtBQUNELE9BQUksQ0FBQyxNQUFNLElBQUssSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLENBQUM7QUFDNUMsT0FBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQzs7O0FBR3JDLE9BQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFFBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUMxQyxRQUFJLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDN0Q7QUFDRCxPQUFJLENBQUMsVUFBVSxJQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxDQUFDOzs7QUFHL0MsT0FBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUM7QUFDdEIsUUFBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFDLFFBQUksTUFBTSxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFVBQVUsQUFBQyxDQUFBO0FBQzFFLFFBQUksQ0FBQyxZQUFZLElBQUksTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUNyQztBQUNELE9BQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzdCLFFBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQSxBQUFDLENBQUMsQ0FBQztJQUMvRTtHQUNEOzs7U0FFZ0IsMkJBQUMsTUFBTSxFQUFFO0FBQ3pCLE9BQUksQ0FBQyxjQUFjLEdBQUcsTUFBTSxDQUFDO0dBQzdCOzs7OztTQUdNLGlCQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO0FBQzlCLE9BQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLE9BQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDOztBQUV4QixPQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7OztBQUd0QixPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ25DLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDO0FBQ3RFLE9BQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQztBQUM5RCxPQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDZDs7O1FBOUZtQixTQUFTO0dBQVMsc0JBQUksSUFBSSxDQUFDLE9BQU87O3FCQUFsQyxTQUFTIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby1wc2V1ZG8teWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxmbyBmcm9tIFwid2F2ZXMtbGZvXCI7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09IGRlc2NyaXB0b3JzIGxmbyA9PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUHNldWRvWWluIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRmcmFtZVNpemU6IDMsXG5cdFx0XHRub2lzZVRocmVzaG9sZDogMC4wNVxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5tZWFuID0gMDtcblx0XHR0aGlzLm1hZ25pdHVkZSA9IDA7XG5cdFx0dGhpcy5zdGREZXYgPSAwO1xuXHRcdHRoaXMuY3Jvc3NpbmdzID0gW107XG5cdFx0dGhpcy5wZXJpb2RNZWFuID0gMDtcblx0XHR0aGlzLnBlcmlvZFN0ZERldiA9IDA7XG5cdFx0dGhpcy5ub2lzZVRocmVzaG9sZCA9IHRoaXMucGFyYW1zLm5vaXNlVGhyZXNob2xkO1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRzdXBlci5pbml0aWFsaXplKHtcblx0XHRcdGZyYW1lU2l6ZTogM1xuXHRcdH0pO1xuXHR9XG5cblx0X21haW5BbGdvcml0aG0oKSB7XG5cblx0XHQvLyBjb21wdXRlIG1pbiwgbWF4IGFuZCBtZWFuIChhbmQgbWFnbml0dWRlKVxuXHRcdGxldCBtaW4sIG1heDtcblx0XHRtaW4gPSBtYXggPSB0aGlzLmlucHV0RnJhbWVbMF07XG5cdFx0dGhpcy5tZWFuID0gMDtcblx0XHR0aGlzLm1hZ25pdHVkZSA9IDA7XG5cdFx0Zm9yKGxldCBpIGluIHRoaXMuaW5wdXRGcmFtZSkge1xuXHRcdFx0bGV0IHZhbCA9IHRoaXMuaW5wdXRGcmFtZVtpXTtcblx0XHRcdHRoaXMubWFnbml0dWRlICs9IHZhbCAqIHZhbDtcblx0XHRcdHRoaXMubWVhbiArPSB2YWw7XG5cdFx0XHRpZih2YWwgPiBtYXgpIHtcblx0XHRcdFx0bWF4ID0gdmFsO1xuXHRcdFx0fSBlbHNlIGlmKHZhbCA8IG1pbikge1xuXHRcdFx0XHRtaW4gPSB2YWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMubWVhbiAvPSB0aGlzLmlucHV0RnJhbWUubGVuZ3RoO1xuXHRcdHRoaXMubWFnbml0dWRlIC89IHRoaXMuaW5wdXRGcmFtZS5sZW5ndGg7XG5cdFx0dGhpcy5tYWduaXR1ZGUgPSBNYXRoLnNxcnQodGhpcy5tYWduaXR1ZGUpO1xuXG5cdFx0Ly8gY29tcHV0ZSBzaWduYWwgc3RkRGV2IGFuZCBudW1iZXIgb2YgbWVhbi1jcm9zc2luZ3Ncblx0XHR0aGlzLmNyb3NzaW5ncyA9IFtdO1xuXHRcdHRoaXMuc3RkRGV2ID0gMDtcblx0XHRsZXQgcHJldkRlbHRhID0gdGhpcy5pbnB1dEZyYW1lWzBdIC0gdGhpcy5tZWFuO1xuXHRcdGZvcihsZXQgaSBpbiB0aGlzLmlucHV0RnJhbWUpIHtcblx0XHRcdGxldCBkZWx0YSA9IHRoaXMuaW5wdXRGcmFtZVtpXSAtIHRoaXMubWVhbjtcblx0XHRcdHRoaXMuc3RkRGV2ICs9IGRlbHRhICogZGVsdGE7XG5cdFx0XHRpZihwcmV2RGVsdGEgPiB0aGlzLm5vaXNlVGhyZXNob2xkICYmIGRlbHRhIDwgdGhpcy5ub2lzZVRocmVzaG9sZCkge1xuXHRcdFx0XHR0aGlzLmNyb3NzaW5ncy5wdXNoKGkpO1xuXHRcdFx0fVxuXHRcdFx0cHJldkRlbHRhID0gZGVsdGE7XG5cdFx0fVxuXHRcdHRoaXMuc3RkRGV2IC89ICh0aGlzLmlucHV0RnJhbWUubGVuZ3RoIC0gMSk7XG5cdFx0dGhpcy5zdGREZXYgPSBNYXRoLnNxcnQodGhpcy5zdGREZXYpO1xuXG5cdFx0Ly8gY29tcHV0ZSBtZWFuIG9mIGRlbHRhLVQgYmV0d2VlbiBjcm9zc2luZ3Ncblx0XHR0aGlzLnBlcmlvZE1lYW4gPSAwO1xuXHRcdGZvcihsZXQgaT0xOyBpPHRoaXMuY3Jvc3NpbmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnBlcmlvZE1lYW4gKz0gdGhpcy5jcm9zc2luZ3NbaV0gLSB0aGlzLmNyb3NzaW5nc1tpIC0gMV07XG5cdFx0fVxuXHRcdHRoaXMucGVyaW9kTWVhbiAvPSAodGhpcy5jcm9zc2luZ3MubGVuZ3RoIC0gMSk7XG5cblx0XHQvLyBjb21wdXRlIHN0ZERldiBvZiBkZWx0YS1UIGJldHdlZW4gY3Jvc3NpbmdzXG5cdFx0dGhpcy5wZXJpb2RTdGREZXYgPSAwO1xuXHRcdGZvcihsZXQgaT0xOyBpPHRoaXMuY3Jvc3NpbmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgZGVsdGFQID0gKHRoaXMuY3Jvc3NpbmdzW2ldIC0gdGhpcy5jcm9zc2luZ3NbaSAtIDFdIC0gdGhpcy5wZXJpb2RNZWFuKVxuXHRcdFx0dGhpcy5wZXJpb2RTdGREZXYgKz0gZGVsdGFQICogZGVsdGFQO1xuXHRcdH1cblx0XHRpZih0aGlzLmNyb3NzaW5ncy5sZW5ndGggPiAyKSB7XG5cdFx0XHR0aGlzLnBlcmlvZFN0ZERldiA9IE1hdGguc3FydCh0aGlzLnBlcmlvZFN0ZERldiAvICh0aGlzLmNyb3NzaW5ncy5sZW5ndGggLSAyKSk7XG5cdFx0fVxuXHR9XG5cblx0c2V0Tm9pc2VUaHJlc2hvbGQodGhyZXNoKSB7XG5cdFx0dGhpcy5ub2lzZVRocmVzaG9sZCA9IHRocmVzaDtcblx0fVxuXG5cdC8vIHRoaXMgb25lIGdldHMgZnJhbWVzIHRvIGFuYWx5emUgOiBjb21wdXRlIG1hZ25pdHVkZSwgemVybyBjcm9zc2luZyByYXRlLCBhbmQgcGVyaW9kaWNpdHlcblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXHRcdHRoaXMuaW5wdXRGcmFtZSA9IGZyYW1lO1xuXG5cdFx0dGhpcy5fbWFpbkFsZ29yaXRobSgpO1xuXG5cdFx0Ly8gVE9ETyA6IGltcHJvdmUgcGVyaW9kaWNpdHkgYWxnb3JpdGhtICEhIVxuXHRcdHRoaXMub3V0RnJhbWVbMF0gPSB0aGlzLnN0ZERldiAqIDI7XG5cdFx0dGhpcy5vdXRGcmFtZVsxXSA9IHRoaXMuY3Jvc3NpbmdzLmxlbmd0aCAqIDUgLyB0aGlzLmlucHV0RnJhbWUubGVuZ3RoO1xuXHRcdHRoaXMub3V0RnJhbWVbMl0gPSB0aGlzLnBlcmlvZFN0ZERldiAvIHRoaXMuaW5wdXRGcmFtZS5sZW5ndGg7IC8vIGtpbmQgb2Ygbm9uIHBlcmlvZGljaXR5XG5cdFx0dGhpcy5vdXRwdXQoKTtcblx0fVxufVxuIl19