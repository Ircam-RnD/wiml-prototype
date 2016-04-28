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
			frameSize: 1,
			period: 20
		};
		_get(Object.getPrototypeOf(Resampler.prototype), "constructor", this).call(this, defaults, options);

		this.streamParams.sourceSampleRate = 1000 / this.params.period;
		this.streamParams.frameSize = this.params.frameSize;
		this.streamParams.frameRate = 1000 / this.params.period;

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
})(lfo.core.BaseLfo);

exports["default"] = Resampler;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFBcUIsV0FBVzs7SUFBcEIsR0FBRzs7Ozs7QUFLZixDQUFDLFlBQVU7O0FBRVQsS0FBSSxhQUFhLElBQUksTUFBTSxJQUFJLEtBQUssRUFBRTtBQUNsQyxRQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztFQUMzQjs7QUFFRCxLQUFJLENBQUMsR0FBRyxHQUFJLElBQUksQ0FBQyxHQUFHLElBQUksWUFBWTs7QUFDbkMsU0FBTyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0VBQzVCLEFBQUMsQ0FBQzs7QUFFSCxLQUFJLEtBQUssSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLEtBQUssRUFBRTs7QUFFeEMsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUUzQixNQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7QUFDNUQsWUFBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFBO0dBQy9DOztBQUVELFFBQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxHQUFHO0FBQ3RDLFVBQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztHQUMvQixDQUFBO0VBQ0Y7Q0FFRixDQUFBLEVBQUcsQ0FBQzs7Ozs7O0lBTWdCLFNBQVM7V0FBVCxTQUFTOztBQUVsQixVQUZTLFNBQVMsR0FFSDs7O01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixTQUFTOztBQUc1QixNQUFNLFFBQVEsR0FBRztBQUNoQixZQUFTLEVBQUUsQ0FBQztBQUNaLFNBQU0sRUFBRSxFQUFFO0dBQ1YsQ0FBQztBQUNGLDZCQVBtQixTQUFTLDZDQU90QixRQUFRLEVBQUUsT0FBTyxFQUFFOztBQUV6QixNQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUMvRCxNQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztBQUNwRCxNQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7OztBQUd4RCxNQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDbEIsTUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsTUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsTUFBSSxDQUFDLFlBQVksQ0FBQzs7O0FBR2xCLE1BQUksQ0FBQyxVQUFVLEdBQUksWUFBTTtBQUN4QixPQUFHLE1BQUssV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRWpDLFdBQU87SUFDUDtBQUNELE9BQUcsQ0FBQyxNQUFLLE9BQU8sRUFBRSxPQUFPOztBQUV6QixTQUFLLE9BQU8sRUFBRSxDQUFDO0FBQ2YsU0FBSyxJQUFJLEdBQUcsTUFBSyxPQUFPLEdBQUcsTUFBSyxNQUFNLENBQUMsTUFBTSxDQUFDOztBQUU5QyxTQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBSyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMsU0FBSyxNQUFNLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7OztHQWFkLEFBQUMsQ0FBQztFQUNIOztjQWhEbUIsU0FBUzs7U0FrRG5CLHNCQUFHO0FBQ1osOEJBbkRtQixTQUFTLDRDQW1EVDtBQUNuQixPQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7R0FDYjs7O1NBRU8sb0JBQUc7QUFDViw4QkF4RG1CLFNBQVMsMENBd0RYO0FBQ2pCLE9BQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNaOzs7Ozs7U0FJSSxpQkFBRztBQUNQLE9BQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPO0FBQ3hCLE9BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLE9BQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOztBQUV0QixPQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7OztHQUs5RTs7O1NBRUcsZ0JBQUc7QUFDTixPQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxPQUFPO0FBQ3pCLE9BQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDOztHQUVyQjs7O1NBRU0saUJBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDOUIsT0FBRyxJQUFJLEtBQUssU0FBUyxFQUFFLE9BQU87O0FBRTlCLE9BQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLE9BQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0dBQ3pCOzs7UUF0Rm1CLFNBQVM7R0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU87O3FCQUFsQyxTQUFTIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSBcIndhdmVzLWxmb1wiO1xuXG4vLyA9PT09PT09PT09PT09PT09IHBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3cgPT09PT09PT09PT09PSAvL1xuLy8gLS0+IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC81NDM4NjUwXG5cbihmdW5jdGlvbigpe1xuXG4gIGlmIChcInBlcmZvcm1hbmNlXCIgaW4gd2luZG93ID09IGZhbHNlKSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBcbiAgRGF0ZS5ub3cgPSAoRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkgeyAgLy8gdGhhbmtzIElFOFxuXHQgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfSk7XG5cbiAgaWYgKFwibm93XCIgaW4gd2luZG93LnBlcmZvcm1hbmNlID09IGZhbHNlKSB7XG4gICAgXG4gICAgdmFyIG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgXG4gICAgaWYgKHBlcmZvcm1hbmNlLnRpbWluZyAmJiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0KSB7XG4gICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0XG4gICAgfVxuXG4gICAgd2luZG93LnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgIH1cbiAgfVxuXG59KSgpO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT0gcmVzYW1wbGVyIGxmbyA9PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2FtcGxlciBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0ZnJhbWVTaXplOiAxLFxuXHRcdFx0cGVyaW9kOiAyMFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSA9IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuXHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZSA9IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cblx0XHQvL3RoaXMuZnJhbWVSYXRlID0gMTAwMCAvIHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHR0aGlzLmludGVydmFsSUQgPSAtMTtcblx0XHR0aGlzLnRpbWUgPSAwO1xuXHRcdHRoaXMubGFzdFRpbWUgPSAwO1xuXHRcdHRoaXMuY3VycmVudERhdGEgPSBbXTtcblx0XHR0aGlzLmNvdW50ZXIgPSAwO1xuXHRcdHRoaXMucnVubmluZyA9IGZhbHNlO1xuXHRcdHRoaXMubmV4dEludGVydmFsO1xuXG5cdFx0Ly8gPT09PT09PT09PT09IHRoZSBjYWxsYmFjayA9PT09PT09PT09PT09IC8vXG5cdFx0dGhpcy5hcHBlbmREYXRhID0gKCgpID0+IHtcblx0XHRcdGlmKHRoaXMuY3VycmVudERhdGEubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdC8vIHNldFRpbWVvdXQodGhpcy5hcHBlbmREYXRhLmJpbmQodGhpcyksIHRoaXMucGFyYW1zLnBlcmlvZClcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoIXRoaXMucnVubmluZykgcmV0dXJuO1xuXG5cdFx0XHR0aGlzLmNvdW50ZXIrKztcblx0XHRcdHRoaXMudGltZSA9IHRoaXMuY291bnRlciAqIHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHRcdC8vdGhpcy50aW1lID0gdGhpcy5sYXN0VGltZTtcblx0XHRcdHRoaXMub3V0RnJhbWUuc2V0KHRoaXMuY3VycmVudERhdGEsIDApO1xuXHRcdFx0dGhpcy5vdXRwdXQoKTtcblxuXHRcdFx0Ly8gbGV0IG5vd1RpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHRcdC8vIGxldCBpbmFjY3VyYWN5ID0gKG5vd1RpbWUgLSB0aGlzLmxhc3RUaW1lIC0gdGhpcy5wYXJhbXMucGVyaW9kKSAlIHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHRcdC8vIGxldCBuZXh0SW50ZXJ2YWwgPSB0aGlzLnBhcmFtcy5wZXJpb2QgLSBpbmFjY3VyYWN5O1xuXG5cdFx0XHQvLyB0aGlzLm91dEZyYW1lLnNldCh0aGlzLmN1cnJlbnREYXRhLCAwKTtcblx0XHRcdC8vIHRoaXMub3V0cHV0KCk7XG5cblx0XHRcdC8vIHRoaXMubGFzdFRpbWUgPSBub3dUaW1lO1xuXHRcdFx0Ly8gdGhpcy50aW1lICs9IG5leHRJbnRlcnZhbDtcblx0XHRcdC8vIGNvbnNvbGUubG9nKHRoaXMudGltZSk7XG5cdFx0XHQvLyBzZXRUaW1lb3V0KHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCBuZXh0SW50ZXJ2YWwpO1xuXHRcdH0pO1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRzdXBlci5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5zdGFydCgpO1xuXHR9XG5cblx0ZmluYWxpemUoKSB7XG5cdFx0c3VwZXIuZmluYWxpemUoKTtcblx0XHR0aGlzLnN0b3AoKTtcblx0fVxuXG5cdC8vIFRPRE8gOiBJTVBST1ZFIFRIRSBBQ0NVUkFDWSBCWSBVU0lORyA6IHNldFRpbWVvdXRcblxuXHRzdGFydCgpIHtcblx0XHRpZih0aGlzLnJ1bm5pbmcpIHJldHVybjtcblx0XHR0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuXHRcdHRoaXMuY3VycmVudERhdGEgPSBbXTtcblxuXHRcdHRoaXMuaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5wZXJpb2QpO1xuXG5cdFx0Ly8gdGhpcy5sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdC8vIHRoaXMudGltZSA9IHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHQvLyBzZXRUaW1lb3V0KHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5wZXJpb2QpO1xuXHR9XG5cblx0c3RvcCgpIHtcblx0XHRpZighdGhpcy5ydW5uaW5nKSByZXR1cm47XG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cdFx0Ly9jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJRCk7XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdGlmKHRpbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdC8vY29uc29sZS5sb2codGltZSk7XG5cdFx0dGhpcy5sYXN0VGltZSA9IHRpbWU7XG5cdFx0dGhpcy5jdXJyZW50RGF0YSA9IGZyYW1lO1xuXHRcdHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblx0fVxufVxuIl19