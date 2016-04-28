// linear regression lfo for fixed samplerate multi-dimensional data streams
// based on rta_delta.c by Jean-Philippe Lambert

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

var Delta = (function (_lfo$core$BaseLfo) {
	_inherits(Delta, _lfo$core$BaseLfo);

	function Delta() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Delta);

		var defaults = {
			order: 3,
			fill: 0,
			frameSize: 1
		};
		_get(Object.getPrototypeOf(Delta.prototype), 'constructor', this).call(this, defaults, options);

		// order must be odd and > 3
		if (this.params.order < 3) {
			this.params.order = 3;
		} else if (this.params.order % 2 == 0) {
			this.params.order -= 1;
		}

		var halfFilterSize = Math.floor(this.params.order * 0.5);

		// weights for input vectors
		this.weights = new Float32Array(this.params.order);
		for (var i = 0, filterValue = -halfFilterSize; i < this.params.order; i++, filterValue += 1) {
			this.weights[i] = filterValue;
		}

		// normalization factor
		this.normFactor = 0;
		for (var i = 1; i <= halfFilterSize; i++) {
			this.normFactor += i * i;
		}
		this.normFactor = 0.5 / this.normFactor;

		this.ringBuffer = null; //new Float32Array(this.order * this.params.frameSize);
		this.ringIndex = 0;
	}

	_createClass(Delta, [{
		key: 'initialize',
		value: function initialize() {
			var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			_get(Object.getPrototypeOf(Delta.prototype), 'initialize', this).call(this, inStreamParams, outStreamParams);
			this.params.frameSize = this.streamParams.frameSize;
			this.ringBuffer = new Float32Array(this.params.order * this.params.frameSize);
		}
	}, {
		key: 'reset',
		value: function reset() {
			_get(Object.getPrototypeOf(Delta.prototype), 'reset', this).call(this);
			for (var i = 0; i < this.ringBuffer.length; i++) {
				this.ringBuffer[i] = this.params.fill;
			}
		}
	}, {
		key: 'process',
		value: function process(time, frame, metaData) {
			var ringIndex = this.ringIndex;
			var frameSize = this.params.frameSize;
			var order = this.params.order;

			for (var i = 0; i < frameSize; i++) {
				this.ringBuffer[ringIndex * frameSize + i] = frame[i];
				this.outFrame[i] = 0;
			}

			for (var i = 0; i < order; i++) {
				for (var j = 0; j < frameSize; j++) {
					this.outFrame[j] += this.ringBuffer[i * frameSize + j] * this.weights[i];
				}
			}

			for (var i = 0; i < frameSize; i++) {
				this.outFrame[i] *= this.normFactor;
			}

			this.ringIndex = (ringIndex + 1) % order;

			// NOW DEAL WITH TIME :
			if (this.streamParams.sourceSampleRate) {
				time -= 0.5 * order / this.streamParams.sourceSampleRate;
			}

			//console.log(this.outFrame);
			this.output(time, this.outFrame, metaData);
		}
	}]);

	return Delta;
})(lfo.core.BaseLfo);

exports['default'] = Delta;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1kZWx0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUdxQixXQUFXOztJQUFwQixHQUFHOztJQUVNLEtBQUs7V0FBTCxLQUFLOztBQUVkLFVBRlMsS0FBSyxHQUVDO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixLQUFLOztBQUd4QixNQUFNLFFBQVEsR0FBRztBQUNoQixRQUFLLEVBQUUsQ0FBQztBQUNSLE9BQUksRUFBRSxDQUFDO0FBQ1AsWUFBUyxFQUFFLENBQUM7R0FDWixDQUFBO0FBQ0QsNkJBUm1CLEtBQUssNkNBUWxCLFFBQVEsRUFBRSxPQUFPLEVBQUU7OztBQUd6QixNQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtBQUN6QixPQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDdEIsTUFBTSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckMsT0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0dBQ3ZCOztBQUVELE1BQUksY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7OztBQUd6RCxNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkQsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsV0FBVyxHQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxXQUFXLElBQUUsQ0FBQyxFQUFFO0FBQ25GLE9BQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxD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QkFBZ0IsQ0FBQztJQUN6RDs7O0FBR0QsT0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztHQUMzQzs7O1FBOUVtQixLQUFLO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztxQkFBOUIsS0FBSyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8tZGVsdGEuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBsaW5lYXIgcmVncmVzc2lvbiBsZm8gZm9yIGZpeGVkIHNhbXBsZXJhdGUgbXVsdGktZGltZW5zaW9uYWwgZGF0YSBzdHJlYW1zXG4vLyBiYXNlZCBvbiBydGFfZGVsdGEuYyBieSBKZWFuLVBoaWxpcHBlIExhbWJlcnRcblxuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlbHRhIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRvcmRlcjogMyxcblx0XHRcdGZpbGw6IDAsXG5cdFx0XHRmcmFtZVNpemU6IDFcblx0XHR9XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0Ly8gb3JkZXIgbXVzdCBiZSBvZGQgYW5kID4gM1xuXHRcdGlmKHRoaXMucGFyYW1zLm9yZGVyIDwgMykge1xuXHRcdFx0dGhpcy5wYXJhbXMub3JkZXIgPSAzO1xuXHRcdH0gZWxzZSBpZih0aGlzLnBhcmFtcy5vcmRlciAlIDIgPT0gMCkge1xuXHRcdFx0dGhpcy5wYXJhbXMub3JkZXIgLT0gMTtcblx0XHR9XG5cblx0XHRsZXQgaGFsZkZpbHRlclNpemUgPSBNYXRoLmZsb29yKHRoaXMucGFyYW1zLm9yZGVyICogMC41KTtcblxuXHRcdC8vIHdlaWdodHMgZm9yIGlucHV0IHZlY3RvcnNcblx0XHR0aGlzLndlaWdodHMgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMucGFyYW1zLm9yZGVyKTtcblx0XHRmb3IobGV0IGk9MCwgZmlsdGVyVmFsdWU9LWhhbGZGaWx0ZXJTaXplOyBpPHRoaXMucGFyYW1zLm9yZGVyOyBpKyssIGZpbHRlclZhbHVlKz0xKSB7XG5cdFx0XHR0aGlzLndlaWdodHNbaV0gPSBmaWx0ZXJWYWx1ZTtcblx0XHR9XG5cblx0XHQvLyBub3JtYWxpemF0aW9uIGZhY3RvclxuXHRcdHRoaXMubm9ybUZhY3RvciA9IDA7XG5cdFx0Zm9yKGxldCBpPTE7IGk8PWhhbGZGaWx0ZXJTaXplOyBpKyspIHtcblx0XHRcdHRoaXMubm9ybUZhY3RvciArPSBpKmk7XG5cdFx0fVxuXHRcdHRoaXMubm9ybUZhY3RvciA9IDAuNSAvIHRoaXMubm9ybUZhY3RvcjtcblxuXHRcdHRoaXMucmluZ0J1ZmZlciA9IG51bGw7Ly9uZXcgRmxvYXQzMkFycmF5KHRoaXMub3JkZXIgKiB0aGlzLnBhcmFtcy5mcmFtZVNpemUpO1xuXHRcdHRoaXMucmluZ0luZGV4ID0gMDtcblx0fVxuXG5cdGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMgPSB7fSwgb3V0U3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHRzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCBvdXRTdHJlYW1QYXJhbXMpO1xuXHRcdHRoaXMucGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcblx0XHR0aGlzLnJpbmdCdWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMucGFyYW1zLm9yZGVyICogdGhpcy5wYXJhbXMuZnJhbWVTaXplKTtcblx0fVxuXG5cdHJlc2V0KCkge1xuXHRcdHN1cGVyLnJlc2V0KCk7XG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5yaW5nQnVmZmVyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnJpbmdCdWZmZXJbaV0gPSB0aGlzLnBhcmFtcy5maWxsO1xuXHRcdH1cblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0Y29uc3QgcmluZ0luZGV4ID0gdGhpcy5yaW5nSW5kZXg7XG5cdFx0Y29uc3QgZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuXHRcdGNvbnN0IG9yZGVyID0gdGhpcy5wYXJhbXMub3JkZXI7XG5cblx0XHRmb3IobGV0IGk9MDsgaTxmcmFtZVNpemU7IGkrKykge1xuXHRcdFx0dGhpcy5yaW5nQnVmZmVyW3JpbmdJbmRleCAqIGZyYW1lU2l6ZSArIGldID0gZnJhbWVbaV07XG5cdFx0XHR0aGlzLm91dEZyYW1lW2ldID0gMDtcblx0XHR9XG5cblx0XHRmb3IobGV0IGk9MDsgaTxvcmRlcjsgaSsrKSB7XG5cdFx0XHRmb3IobGV0IGo9MDsgajxmcmFtZVNpemU7IGorKykge1xuXHRcdFx0XHR0aGlzLm91dEZyYW1lW2pdICs9IHRoaXMucmluZ0J1ZmZlcltpICogZnJhbWVTaXplICsgal0gKiB0aGlzLndlaWdodHNbaV07XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Zm9yKGxldCBpPTA7IGk8ZnJhbWVTaXplOyBpKyspIHtcblx0XHRcdHRoaXMub3V0RnJhbWVbaV0gKj0gdGhpcy5ub3JtRmFjdG9yO1xuXHRcdH1cblxuXHRcdHRoaXMucmluZ0luZGV4ID0gKHJpbmdJbmRleCArIDEpICUgb3JkZXI7XG5cblx0XHQvLyBOT1cgREVBTCBXSVRIIFRJTUUgOlxuXHRcdGlmKHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUpIHtcblx0XHRcdHRpbWUgLT0gMC41ICogb3JkZXIgLyB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlO1xuXHRcdH1cblxuXHRcdC8vY29uc29sZS5sb2codGhpcy5vdXRGcmFtZSk7XG5cdFx0dGhpcy5vdXRwdXQodGltZSwgdGhpcy5vdXRGcmFtZSwgbWV0YURhdGEpO1xuXHR9XG59Il19