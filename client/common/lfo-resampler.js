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
			//frameSize: 1,
			period: 20
		};
		_get(Object.getPrototypeOf(Resampler.prototype), "constructor", this).call(this, defaults, options);

		this.streamParams.sourceSampleRate = 1000 / this.params.period;
		//this.streamParams.frameSize = this.params.frameSize;
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
			var streamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			//this.streamParams.frameSize
			_get(Object.getPrototypeOf(Resampler.prototype), "initialize", this).call(this, streamParams, {
				sourceSampleRate: this.streamParams.sourceSampleRate
			});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFBcUIsV0FBVzs7SUFBcEIsR0FBRzs7Ozs7QUFLZixDQUFDLFlBQVU7O0FBRVQsS0FBSSxhQUFhLElBQUksTUFBTSxJQUFJLEtBQUssRUFBRTtBQUNsQyxRQUFNLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztFQUMzQjs7QUFFRCxLQUFJLENBQUMsR0FBRyxHQUFJLElBQUksQ0FBQyxHQUFHLElBQUksWUFBWTs7QUFDbkMsU0FBTyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0VBQzVCLEFBQUMsQ0FBQzs7QUFFSCxLQUFJLEtBQUssSUFBSSxNQUFNLENBQUMsV0FBVyxJQUFJLEtBQUssRUFBRTs7QUFFeEMsTUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDOztBQUUzQixNQUFJLFdBQVcsQ0FBQyxNQUFNLElBQUksV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUU7QUFDNUQsWUFBUyxHQUFHLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFBO0dBQy9DOztBQUVELFFBQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxHQUFHO0FBQ3RDLFVBQU8sSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsQ0FBQztHQUMvQixDQUFBO0VBQ0Y7Q0FFRixDQUFBLEVBQUcsQ0FBQzs7Ozs7O0lBTWdCLFNBQVM7V0FBVCxTQUFTOztBQUVsQixVQUZTLFNBQVMsR0FFSDs7O01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixTQUFTOztBQUc1QixNQUFNLFFBQVEsR0FBRzs7QUFFaEIsU0FBTSxFQUFFLEVBQUU7R0FDVixDQUFDO0FBQ0YsNkJBUG1CLFNBQVMsNkNBT3RCLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDOztBQUUvRCxNQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7OztBQUd4RCxNQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO0FBQ2QsTUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDbEIsTUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsTUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDLENBQUM7QUFDakIsTUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsTUFBSSxDQUFDLFlBQVksQ0FBQzs7O0FBR2xCLE1BQUksQ0FBQyxVQUFVLEdBQUksWUFBTTtBQUN4QixPQUFHLE1BQUssV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRWpDLFdBQU87SUFDUDtBQUNELE9BQUcsQ0FBQyxNQUFLLE9BQU8sRUFBRSxPQUFPOztBQUV6QixTQUFLLE9BQU8sRUFBRSxDQUFDO0FBQ2YsU0FBSyxJQUFJLEdBQUcsTUFBSyxPQUFPLEdBQUcsTUFBSyxNQUFNLENBQUMsTUFBTSxDQUFDOztBQUU5QyxTQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBSyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdkMsU0FBSyxNQUFNLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7OztHQWFkLEFBQUMsQ0FBQztFQUNIOztjQWhEbUIsU0FBUzs7U0FrRG5CLHNCQUFvQjtPQUFuQixZQUFZLHlEQUFHLEVBQUU7OztBQUUzQiw4QkFwRG1CLFNBQVMsNENBb0RYLFlBQVksRUFBRTtBQUM5QixvQkFBZ0IsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQjtJQUNwRCxFQUFFO0FBQ0gsT0FBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ2I7OztTQUVPLG9CQUFHO0FBQ1YsOEJBM0RtQixTQUFTLDBDQTJEWDtBQUNqQixPQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDWjs7Ozs7O1NBSUksaUJBQUc7QUFDUCxPQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTztBQUN4QixPQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztBQUNwQixPQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQzs7QUFFdEIsT0FBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQzs7Ozs7R0FLOUU7OztTQUVHLGdCQUFHO0FBQ04sT0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTztBQUN6QixPQUFJLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQzs7R0FFckI7OztTQUVNLGlCQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO0FBQzlCLE9BQUcsSUFBSSxLQUFLLFNBQVMsRUFBRSxPQUFPOztBQUU5QixPQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNyQixPQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUN6QixPQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztHQUN6Qjs7O1FBekZtQixTQUFTO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztxQkFBbEMsU0FBUyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8tcmVzYW1wbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gXCJ3YXZlcy1sZm9cIjtcblxuLy8gPT09PT09PT09PT09PT09PSBwb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93ID09PT09PT09PT09PT0gLy9cbi8vIC0tPiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvNTQzODY1MFxuXG4oZnVuY3Rpb24oKXtcblxuICBpZiAoXCJwZXJmb3JtYW5jZVwiIGluIHdpbmRvdyA9PSBmYWxzZSkge1xuICAgICAgd2luZG93LnBlcmZvcm1hbmNlID0ge307XG4gIH1cbiAgXG4gIERhdGUubm93ID0gKERhdGUubm93IHx8IGZ1bmN0aW9uICgpIHsgIC8vIHRoYW5rcyBJRThcblx0ICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH0pO1xuXG4gIGlmIChcIm5vd1wiIGluIHdpbmRvdy5wZXJmb3JtYW5jZSA9PSBmYWxzZSkge1xuICAgIFxuICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuICAgIFxuICAgIGlmIChwZXJmb3JtYW5jZS50aW1pbmcgJiYgcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCkge1xuICAgICAgbm93T2Zmc2V0ID0gcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydFxuICAgIH1cblxuICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbiBub3coKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIG5vd09mZnNldDtcbiAgICB9XG4gIH1cblxufSkoKTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09IHJlc2FtcGxlciBsZm8gPT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNhbXBsZXIgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdC8vZnJhbWVTaXplOiAxLFxuXHRcdFx0cGVyaW9kOiAyMFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSA9IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0Ly90aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlID0gMTAwMCAvIHRoaXMucGFyYW1zLnBlcmlvZDtcblxuXHRcdC8vdGhpcy5mcmFtZVJhdGUgPSAxMDAwIC8gdGhpcy5wYXJhbXMucGVyaW9kO1xuXHRcdHRoaXMuaW50ZXJ2YWxJRCA9IC0xO1xuXHRcdHRoaXMudGltZSA9IDA7XG5cdFx0dGhpcy5sYXN0VGltZSA9IDA7XG5cdFx0dGhpcy5jdXJyZW50RGF0YSA9IFtdO1xuXHRcdHRoaXMuY291bnRlciA9IDA7XG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cdFx0dGhpcy5uZXh0SW50ZXJ2YWw7XG5cblx0XHQvLyA9PT09PT09PT09PT0gdGhlIGNhbGxiYWNrID09PT09PT09PT09PT0gLy9cblx0XHR0aGlzLmFwcGVuZERhdGEgPSAoKCkgPT4ge1xuXHRcdFx0aWYodGhpcy5jdXJyZW50RGF0YS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0Ly8gc2V0VGltZW91dCh0aGlzLmFwcGVuZERhdGEuYmluZCh0aGlzKSwgdGhpcy5wYXJhbXMucGVyaW9kKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZighdGhpcy5ydW5uaW5nKSByZXR1cm47XG5cblx0XHRcdHRoaXMuY291bnRlcisrO1xuXHRcdFx0dGhpcy50aW1lID0gdGhpcy5jb3VudGVyICogdGhpcy5wYXJhbXMucGVyaW9kO1xuXHRcdFx0Ly90aGlzLnRpbWUgPSB0aGlzLmxhc3RUaW1lO1xuXHRcdFx0dGhpcy5vdXRGcmFtZS5zZXQodGhpcy5jdXJyZW50RGF0YSwgMCk7XG5cdFx0XHR0aGlzLm91dHB1dCgpO1xuXG5cdFx0XHQvLyBsZXQgbm93VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdFx0Ly8gbGV0IGluYWNjdXJhY3kgPSAobm93VGltZSAtIHRoaXMubGFzdFRpbWUgLSB0aGlzLnBhcmFtcy5wZXJpb2QpICUgdGhpcy5wYXJhbXMucGVyaW9kO1xuXHRcdFx0Ly8gbGV0IG5leHRJbnRlcnZhbCA9IHRoaXMucGFyYW1zLnBlcmlvZCAtIGluYWNjdXJhY3k7XG5cblx0XHRcdC8vIHRoaXMub3V0RnJhbWUuc2V0KHRoaXMuY3VycmVudERhdGEsIDApO1xuXHRcdFx0Ly8gdGhpcy5vdXRwdXQoKTtcblxuXHRcdFx0Ly8gdGhpcy5sYXN0VGltZSA9IG5vd1RpbWU7XG5cdFx0XHQvLyB0aGlzLnRpbWUgKz0gbmV4dEludGVydmFsO1xuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy50aW1lKTtcblx0XHRcdC8vIHNldFRpbWVvdXQodGhpcy5hcHBlbmREYXRhLmJpbmQodGhpcyksIG5leHRJbnRlcnZhbCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpbml0aWFsaXplKHN0cmVhbVBhcmFtcyA9IHt9KSB7XG5cdFx0Ly90aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemVcblx0XHRzdXBlci5pbml0aWFsaXplKHN0cmVhbVBhcmFtcywge1xuXHRcdFx0c291cmNlU2FtcGxlUmF0ZTogdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZVxuXHRcdH0pO1xuXHRcdHRoaXMuc3RhcnQoKTtcblx0fVxuXG5cdGZpbmFsaXplKCkge1xuXHRcdHN1cGVyLmZpbmFsaXplKCk7XG5cdFx0dGhpcy5zdG9wKCk7XG5cdH1cblxuXHQvLyBUT0RPIDogSU1QUk9WRSBUSEUgQUNDVVJBQ1kgQlkgVVNJTkcgOiBzZXRUaW1lb3V0XG5cblx0c3RhcnQoKSB7XG5cdFx0aWYodGhpcy5ydW5uaW5nKSByZXR1cm47XG5cdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZTtcblx0XHR0aGlzLmN1cnJlbnREYXRhID0gW107XG5cblx0XHR0aGlzLmludGVydmFsSUQgPSBzZXRJbnRlcnZhbCh0aGlzLmFwcGVuZERhdGEuYmluZCh0aGlzKSwgdGhpcy5wYXJhbXMucGVyaW9kKTtcblxuXHRcdC8vIHRoaXMubGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHQvLyB0aGlzLnRpbWUgPSB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0Ly8gc2V0VGltZW91dCh0aGlzLmFwcGVuZERhdGEuYmluZCh0aGlzKSwgdGhpcy5wYXJhbXMucGVyaW9kKTtcblx0fVxuXG5cdHN0b3AoKSB7XG5cdFx0aWYoIXRoaXMucnVubmluZykgcmV0dXJuO1xuXHRcdHRoaXMucnVubmluZyA9IGZhbHNlO1xuXHRcdC8vY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSUQpO1xuXHR9XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHRpZih0aW1lID09PSB1bmRlZmluZWQpIHJldHVybjtcblx0XHQvL2NvbnNvbGUubG9nKHRpbWUpO1xuXHRcdHRoaXMubGFzdFRpbWUgPSB0aW1lO1xuXHRcdHRoaXMuY3VycmVudERhdGEgPSBmcmFtZTtcblx0XHR0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cdH1cbn1cbiJdfQ==