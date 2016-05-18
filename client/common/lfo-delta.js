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
			var streamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_get(Object.getPrototypeOf(Delta.prototype), 'initialize', this).call(this, streamParams);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1kZWx0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQUdxQixXQUFXOztJQUFwQixHQUFHOztJQUVNLEtBQUs7V0FBTCxLQUFLOztBQUVkLFVBRlMsS0FBSyxHQUVDO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixLQUFLOztBQUd4QixNQUFNLFFBQVEsR0FBRztBQUNoQixRQUFLLEVBQUUsQ0FBQztBQUNSLE9BQUksRUFBRSxDQUFDO0FBQ1AsWUFBUyxFQUFFLENBQUM7R0FDWixDQUFBO0FBQ0QsNkJBUm1CLEtBQUssNkNBUWxCLFFBQVEsRUFBRSxPQUFPLEVBQUU7OztBQUd6QixNQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtBQUN6QixPQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7R0FDdEIsTUFBTSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDckMsT0FBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksQ0FBQyxDQUFDO0dBQ3ZCOztBQUVELE1BQUksY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLENBQUM7OztBQUd6RCxNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkQsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsV0FBVyxHQUFDLENBQUMsY0FBYyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsRUFBRSxXQUFXLElBQUUsQ0FBQyxFQUFFO0FBQ25GLE9BQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsV0FBVyxD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QUMsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0dBQzNDOzs7UUE5RW1CLEtBQUs7R0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU87O3FCQUE5QixLQUFLIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby1kZWx0YS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGxpbmVhciByZWdyZXNzaW9uIGxmbyBmb3IgZml4ZWQgc2FtcGxlcmF0ZSBtdWx0aS1kaW1lbnNpb25hbCBkYXRhIHN0cmVhbXNcbi8vIGJhc2VkIG9uIHJ0YV9kZWx0YS5jIGJ5IEplYW4tUGhpbGlwcGUgTGFtYmVydFxuXG5pbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVsdGEgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdG9yZGVyOiAzLFxuXHRcdFx0ZmlsbDogMCxcblx0XHRcdGZyYW1lU2l6ZTogMVxuXHRcdH1cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHQvLyBvcmRlciBtdXN0IGJlIG9kZCBhbmQgPiAzXG5cdFx0aWYodGhpcy5wYXJhbXMub3JkZXIgPCAzKSB7XG5cdFx0XHR0aGlzLnBhcmFtcy5vcmRlciA9IDM7XG5cdFx0fSBlbHNlIGlmKHRoaXMucGFyYW1zLm9yZGVyICUgMiA9PSAwKSB7XG5cdFx0XHR0aGlzLnBhcmFtcy5vcmRlciAtPSAxO1xuXHRcdH1cblxuXHRcdGxldCBoYWxmRmlsdGVyU2l6ZSA9IE1hdGguZmxvb3IodGhpcy5wYXJhbXMub3JkZXIgKiAwLjUpO1xuXG5cdFx0Ly8gd2VpZ2h0cyBmb3IgaW5wdXQgdmVjdG9yc1xuXHRcdHRoaXMud2VpZ2h0cyA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wYXJhbXMub3JkZXIpO1xuXHRcdGZvcihsZXQgaT0wLCBmaWx0ZXJWYWx1ZT0taGFsZkZpbHRlclNpemU7IGk8dGhpcy5wYXJhbXMub3JkZXI7IGkrKywgZmlsdGVyVmFsdWUrPTEpIHtcblx0XHRcdHRoaXMud2VpZ2h0c1tpXSA9IGZpbHRlclZhbHVlO1xuXHRcdH1cblxuXHRcdC8vIG5vcm1hbGl6YXRpb24gZmFjdG9yXG5cdFx0dGhpcy5ub3JtRmFjdG9yID0gMDtcblx0XHRmb3IobGV0IGk9MTsgaTw9aGFsZkZpbHRlclNpemU7IGkrKykge1xuXHRcdFx0dGhpcy5ub3JtRmFjdG9yICs9IGkqaTtcblx0XHR9XG5cdFx0dGhpcy5ub3JtRmFjdG9yID0gMC41IC8gdGhpcy5ub3JtRmFjdG9yO1xuXG5cdFx0dGhpcy5yaW5nQnVmZmVyID0gbnVsbDsvL25ldyBGbG9hdDMyQXJyYXkodGhpcy5vcmRlciAqIHRoaXMucGFyYW1zLmZyYW1lU2l6ZSk7XG5cdFx0dGhpcy5yaW5nSW5kZXggPSAwO1xuXHR9XG5cblx0aW5pdGlhbGl6ZShzdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdHN1cGVyLmluaXRpYWxpemUoc3RyZWFtUGFyYW1zKTtcblx0XHR0aGlzLnBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cdFx0dGhpcy5yaW5nQnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnBhcmFtcy5vcmRlciAqIHRoaXMucGFyYW1zLmZyYW1lU2l6ZSk7XG5cdH1cblxuXHRyZXNldCgpIHtcblx0XHRzdXBlci5yZXNldCgpO1xuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMucmluZ0J1ZmZlci5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5yaW5nQnVmZmVyW2ldID0gdGhpcy5wYXJhbXMuZmlsbDtcblx0XHR9XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdGNvbnN0IHJpbmdJbmRleCA9IHRoaXMucmluZ0luZGV4O1xuXHRcdGNvbnN0IGZyYW1lU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTtcblx0XHRjb25zdCBvcmRlciA9IHRoaXMucGFyYW1zLm9yZGVyO1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8ZnJhbWVTaXplOyBpKyspIHtcblx0XHRcdHRoaXMucmluZ0J1ZmZlcltyaW5nSW5kZXggKiBmcmFtZVNpemUgKyBpXSA9IGZyYW1lW2ldO1xuXHRcdFx0dGhpcy5vdXRGcmFtZVtpXSA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yKGxldCBpPTA7IGk8b3JkZXI7IGkrKykge1xuXHRcdFx0Zm9yKGxldCBqPTA7IGo8ZnJhbWVTaXplOyBqKyspIHtcblx0XHRcdFx0dGhpcy5vdXRGcmFtZVtqXSArPSB0aGlzLnJpbmdCdWZmZXJbaSAqIGZyYW1lU2l6ZSArIGpdICogdGhpcy53ZWlnaHRzW2ldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvcihsZXQgaT0wOyBpPGZyYW1lU2l6ZTsgaSsrKSB7XG5cdFx0XHR0aGlzLm91dEZyYW1lW2ldICo9IHRoaXMubm9ybUZhY3Rvcjtcblx0XHR9XG5cblx0XHR0aGlzLnJpbmdJbmRleCA9IChyaW5nSW5kZXggKyAxKSAlIG9yZGVyO1xuXG5cdFx0Ly8gTk9XIERFQUwgV0lUSCBUSU1FIDpcblx0XHRpZih0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlKSB7XG5cdFx0XHR0aW1lIC09IDAuNSAqIG9yZGVyIC8gdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKHRoaXMub3V0RnJhbWUpO1xuXHRcdHRoaXMub3V0cHV0KHRpbWUsIHRoaXMub3V0RnJhbWUsIG1ldGFEYXRhKTtcblx0fVxufSJdfQ==