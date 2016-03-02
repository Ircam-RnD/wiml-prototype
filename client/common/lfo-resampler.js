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

// ================ polyfill for performance.now ============= //
// --> https://gist.github.com/paulirish/5438650

(function () {

	if ("performance" in window == false) {
		window.performance = {};
	}

	Date.now = Date.now || function () {
		// thanks IE8
		return new Date().getTime();
	};

	if ("now" in window.performance == false) {

		var nowOffset = Date.now();

		if (performance.timing && performance.timing.navigationStart) {
			nowOffset = performance.timing.navigationStart;
		}

		window.performance.now = function now() {
			return Date.now() - nowOffset;
		};
	}
})();

// ========================================================== //
// ===================== resampler lfo ====================== //
// ========================================================== //

var Resampler = (function (_lfo$core$BaseLfo) {
	_inherits(Resampler, _lfo$core$BaseLfo);

	function Resampler() {
		var _this = this;

		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Resampler);

		var defaults = {
			//period: 10
		};
		_get(Object.getPrototypeOf(Resampler.prototype), "constructor", this).call(this, defaults, options);
		//this.params.frameRate = 1000 / this.params.period;
		this.streamParams.sourceSampleRate = 1000 / this.params.period;

		//this.frameRate = 1000 / this.params.period;
		this.intervalID = -1;
		this.time = 0;
		this.lastTime = 0;
		this.currentData = [];
		this.counter = 0;
		this.running = false;
		this.nextInterval;

		// ============ the callback ============= //
		this.appendData = function () {
			if (_this.currentData.length === 0) {
				// setTimeout(this.appendData.bind(this), this.params.period)
				return;
			}
			if (!_this.running) return;

			_this.counter++;
			_this.time = _this.counter * _this.params.period;
			//this.time = this.lastTime;
			_this.outFrame.set(_this.currentData, 0);
			_this.output();

			// let nowTime = performance.now();
			// let inaccuracy = (nowTime - this.lastTime - this.params.period) % this.params.period;
			// let nextInterval = this.params.period - inaccuracy;

			// this.outFrame.set(this.currentData, 0);
			// this.output();

			// this.lastTime = nowTime;
			// this.time += nextInterval;
			// console.log(this.time);
			// setTimeout(this.appendData.bind(this), nextInterval);
		};
	}

	_createClass(Resampler, [{
		key: "initialize",
		value: function initialize() {
			_get(Object.getPrototypeOf(Resampler.prototype), "initialize", this).call(this);
			this.start();
		}
	}, {
		key: "finalize",
		value: function finalize() {
			_get(Object.getPrototypeOf(Resampler.prototype), "finalize", this).call(this);
			this.stop();
		}

		// TODO : IMPROVE THE ACCURACY BY USING : setTimeout

	}, {
		key: "start",
		value: function start() {
			if (this.running) return;
			this.running = true;
			this.currentData = [];

			this.intervalID = setInterval(this.appendData.bind(this), this.params.period);

			// this.lastTime = performance.now();
			// this.time = this.params.period;
			// setTimeout(this.appendData.bind(this), this.params.period);
		}
	}, {
		key: "stop",
		value: function stop() {
			if (!this.running) return;
			this.running = false;
			//clearInterval(this.intervalID);
		}
	}, {
		key: "process",
		value: function process(time, frame, metaData) {
			if (time === undefined) return;
			//console.log(time);
			this.lastTime = time;
			this.currentData = frame;
			this.metaData = metaData;
		}
	}]);

	return Resampler;
})(_wavesLfo2["default"].core.BaseLfo);

exports["default"] = Resampler;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFBZ0IsV0FBVzs7Ozs7OztBQUszQixDQUFDLFlBQVU7O0FBRVQsS0FBSSxhQUFhLElBQUksTUFBTSxJQUFJLEtBQUssRUFBRTtBQUNsQyxRQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztFQUMzQjs7QUFFRCxLQUFJLENBQUMsR0FBRyxHQUFJLElBQUksQ0FBQyxHQUFHLElBQUksWUFBWTs7QUFDbkMsU0FBTyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0VBQzVCLEFBQUMsQ0FBQzs7QUFFSCxLQUFJLEtBQUssSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLEtBQUssRUFBRTs7QUFFeEMsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUUzQixNQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7QUFDNUQsWUFBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFBO0dBQy9DOztBQUVELFFBQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxHQUFHO0FBQ3RDLFVBQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztHQUMvQixDQUFBO0VBQ0Y7Q0FFRixDQUFBLEVBQUcsQ0FBQzs7Ozs7O0lBTWdCLFNBQVM7V0FBVCxTQUFTOztBQUVsQixVQUZTLFNBQVMsR0FFSDs7O01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixTQUFTOztBQUc1QixNQUFNLFFBQVEsR0FBRzs7R0FFaEIsQ0FBQztBQUNGLDZCQU5tQixTQUFTLDZDQU10QixRQUFRLEVBQUUsT0FBTyxFQUFFOztBQUV6QixNQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQzs7O0FBRy9ELE1BQUksQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckIsTUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZCxNQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsQ0FBQztBQUNsQixNQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztBQUN0QixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNqQixNQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixNQUFJLENBQUMsWUFBWSxDQUFDOzs7QUFHbEIsTUFBSSxDQUFDLFVBQVUsR0FBSSxZQUFNO0FBQ3hCLE9BQUcsTUFBSyxXQUFXLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7QUFFakMsV0FBTztJQUNQO0FBQ0QsT0FBRyxDQUFDLE1BQUssT0FBTyxFQUFFLE9BQU87O0FBRXpCLFNBQUssT0FBTyxFQUFFLENBQUM7QUFDZixTQUFLLElBQUksR0FBRyxNQUFLLE9BQU8sR0FBRyxNQUFLLE1BQU0sQ0FBQyxNQUFNLENBQUM7O0FBRTlDLFNBQUssUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFLLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN2QyxTQUFLLE1BQU0sRUFBRSxDQUFDOzs7Ozs7Ozs7Ozs7O0dBYWQsQUFBQyxDQUFDO0VBQ0g7O2NBN0NtQixTQUFTOztTQStDbkIsc0JBQUc7QUFDWiw4QkFoRG1CLFNBQVMsNENBZ0RUO0FBQ25CLE9BQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNiOzs7U0FFTyxvQkFBRztBQUNWLDhCQXJEbUIsU0FBUywwQ0FxRFg7QUFDakIsT0FBSSxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ1o7Ozs7OztTQUlJLGlCQUFHO0FBQ1AsT0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU87QUFDeEIsT0FBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDcEIsT0FBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7O0FBRXRCLE9BQUksQ0FBQyxVQUFVLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7Ozs7O0dBSzlFOzs7U0FFRyxnQkFBRztBQUNOLE9BQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU87QUFDekIsT0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7O0dBRXJCOzs7U0FFTSxpQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtBQUM5QixPQUFHLElBQUksS0FBSyxTQUFTLEVBQUUsT0FBTzs7QUFFOUIsT0FBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7QUFDckIsT0FBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDekIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7R0FDekI7OztRQW5GbUIsU0FBUztHQUFTLHNCQUFJLElBQUksQ0FBQyxPQUFPOztxQkFBbEMsU0FBUyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8tcmVzYW1wbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxmbyBmcm9tIFwid2F2ZXMtbGZvXCI7XG5cbi8vID09PT09PT09PT09PT09PT0gcG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdyA9PT09PT09PT09PT09IC8vXG4vLyAtLT4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzU0Mzg2NTBcblxuKGZ1bmN0aW9uKCl7XG5cbiAgaWYgKFwicGVyZm9ybWFuY2VcIiBpbiB3aW5kb3cgPT0gZmFsc2UpIHtcbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHt9O1xuICB9XG4gIFxuICBEYXRlLm5vdyA9IChEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7ICAvLyB0aGFua3MgSUU4XG5cdCAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9KTtcblxuICBpZiAoXCJub3dcIiBpbiB3aW5kb3cucGVyZm9ybWFuY2UgPT0gZmFsc2UpIHtcbiAgICBcbiAgICB2YXIgbm93T2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICBpZiAocGVyZm9ybWFuY2UudGltaW5nICYmIHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgIG5vd09mZnNldCA9IHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnRcbiAgICB9XG5cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgfVxuICB9XG5cbn0pKCk7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PSByZXNhbXBsZXIgbGZvID09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzYW1wbGVyIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHQvL3BlcmlvZDogMTBcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblx0XHQvL3RoaXMucGFyYW1zLmZyYW1lUmF0ZSA9IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSA9IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cblx0XHQvL3RoaXMuZnJhbWVSYXRlID0gMTAwMCAvIHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHR0aGlzLmludGVydmFsSUQgPSAtMTtcblx0XHR0aGlzLnRpbWUgPSAwO1xuXHRcdHRoaXMubGFzdFRpbWUgPSAwO1xuXHRcdHRoaXMuY3VycmVudERhdGEgPSBbXTtcblx0XHR0aGlzLmNvdW50ZXIgPSAwO1xuXHRcdHRoaXMucnVubmluZyA9IGZhbHNlO1xuXHRcdHRoaXMubmV4dEludGVydmFsO1xuXG5cdFx0Ly8gPT09PT09PT09PT09IHRoZSBjYWxsYmFjayA9PT09PT09PT09PT09IC8vXG5cdFx0dGhpcy5hcHBlbmREYXRhID0gKCgpID0+IHtcblx0XHRcdGlmKHRoaXMuY3VycmVudERhdGEubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdC8vIHNldFRpbWVvdXQodGhpcy5hcHBlbmREYXRhLmJpbmQodGhpcyksIHRoaXMucGFyYW1zLnBlcmlvZClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoIXRoaXMucnVubmluZykgcmV0dXJuO1xuXG5cdFx0XHR0aGlzLmNvdW50ZXIrKztcblx0XHRcdHRoaXMudGltZSA9IHRoaXMuY291bnRlciAqIHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHRcdC8vdGhpcy50aW1lID0gdGhpcy5sYXN0VGltZTtcblx0XHRcdHRoaXMub3V0RnJhbWUuc2V0KHRoaXMuY3VycmVudERhdGEsIDApO1xuXHRcdFx0dGhpcy5vdXRwdXQoKTtcblxuXHRcdFx0Ly8gbGV0IG5vd1RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHRcdC8vIGxldCBpbmFjY3VyYWN5ID0gKG5vd1RpbWUgLSB0aGlzLmxhc3RUaW1lIC0gdGhpcy5wYXJhbXMucGVyaW9kKSAlIHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHRcdC8vIGxldCBuZXh0SW50ZXJ2YWwgPSB0aGlzLnBhcmFtcy5wZXJpb2QgLSBpbmFjY3VyYWN5O1xuXG5cdFx0XHQvLyB0aGlzLm91dEZyYW1lLnNldCh0aGlzLmN1cnJlbnREYXRhLCAwKTtcblx0XHRcdC8vIHRoaXMub3V0cHV0KCk7XG5cblx0XHRcdC8vIHRoaXMubGFzdFRpbWUgPSBub3dUaW1lO1xuXHRcdFx0Ly8gdGhpcy50aW1lICs9IG5leHRJbnRlcnZhbDtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMudGltZSk7XG5cdFx0XHQvLyBzZXRUaW1lb3V0KHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCBuZXh0SW50ZXJ2YWwpO1xuXHRcdH0pO1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRzdXBlci5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5zdGFydCgpO1xuXHR9XG5cblx0ZmluYWxpemUoKSB7XG5cdFx0c3VwZXIuZmluYWxpemUoKTtcblx0XHR0aGlzLnN0b3AoKTtcblx0fVxuXG5cdC8vIFRPRE8gOiBJTVBST1ZFIFRIRSBBQ0NVUkFDWSBCWSBVU0lORyA6IHNldFRpbWVvdXRcblxuXHRzdGFydCgpIHtcblx0XHRpZih0aGlzLnJ1bm5pbmcpIHJldHVybjtcblx0XHR0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuXHRcdHRoaXMuY3VycmVudERhdGEgPSBbXTtcblxuXHRcdHRoaXMuaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5wZXJpb2QpO1xuXG5cdFx0Ly8gdGhpcy5sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdC8vIHRoaXMudGltZSA9IHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHQvLyBzZXRUaW1lb3V0KHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5wZXJpb2QpO1xuXHR9XG5cblx0c3RvcCgpIHtcblx0XHRpZighdGhpcy5ydW5uaW5nKSByZXR1cm47XG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cdFx0Ly9jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJRCk7XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdGlmKHRpbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdC8vY29uc29sZS5sb2codGltZSk7XG5cdFx0dGhpcy5sYXN0VGltZSA9IHRpbWU7XG5cdFx0dGhpcy5jdXJyZW50RGF0YSA9IGZyYW1lO1xuXHRcdHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblx0fVxufVxuIl19