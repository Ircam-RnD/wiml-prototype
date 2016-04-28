"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _wavesLfo = require('waves-lfo');

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
			bufferDuration: 100, //ms
			outputRate: 50 //Hz
		};
		_get(Object.getPrototypeOf(Resampler.prototype), "constructor", this).call(this, defaults, options);

		this.streamParams.frameSize = this.params.frameSize;
		this.streamParams.frameRate = this.params.outputRate;
		this.outputPeriod = 1000 / this.params.outputRate;
		this.streamParams.sourceSampleRate = 1000 / this.outputPeriod;

		this.running = false;
		this.counter = 0;
		this.inputBuffer = [];

		//======= callback function =======//
		this.fire = function () {
			var now = performance.now();

			//this.time = now;
			_this.counter++;
			_this.time = _this.counter * _this.outputPeriod;

			var frameSize = _this.streamParams.frameSize;
			var buf = _this.inputBuffer;
			var del = _this.params.bufferDuration;

			//const nextInterval = this.outputPeriod - (now - this.lastNow);
			//if(nextInterval < 0) nextInterval = this.outputPeriod;
			//this.lastNow = now;
			//setTimeout(this.fire.bind(this), nextInterval);

			if (buf.length === 0) {
				return;
			}
			if (buf.length === 1) {
				// beginning or period without incoming data > bufDur
				if (buf[0].date + del < now) {
					// period without incoming data > bufDur
					for (var i = 0; i < frameSize; i++) {
						_this.outFrame[i] = buf[0].frame[i];
					}
					_this.output();
				}
				// then :
				return;
			}

			for (var i = 0; i < buf.length - 1; i++) {
				var l = buf[i],
				    r = buf[i + 1];
				if (l.date + del <= now && r.date + del > now) {
					var pct = (now - (l.date + del)) / (r.date - l.date);
					for (var j = 0; j < frameSize; j++) {
						_this.outFrame[j] = l.frame[j] + (r.frame[j] - l.frame[j]) * pct;
					}
					_this.output();
					// remove useless frames :
					buf.splice(0, i);
					break;
				}
			}
			//console.log(buf.length);
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
	}, {
		key: "start",
		value: function start() {
			if (this.running) return;
			this.running = true;

			// this.lastNow = performance.now();
			// setTimeout(this.fire.bind(this), this.params.outputPeriod);

			this.intervalID = setInterval(this.fire.bind(this), this.outputPeriod);
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
			this.inputBuffer.push({
				date: performance.now(),
				frame: frame
			});
			this.metaData = metaData;
		}
	}]);

	return Resampler;
})(lfo.core.BaseLfo);

exports["default"] = Resampler;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXItZXhwZXJpbWVudGFsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7Ozs7O0FBS2YsQ0FBQyxZQUFVOztBQUVULEtBQUksYUFBYSxJQUFJLE1BQU0sSUFBSSxLQUFLLEVBQUU7QUFDbEMsUUFBTSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7RUFDM0I7O0FBRUQsS0FBSSxDQUFDLEdBQUcsR0FBSSxJQUFJLENBQUMsR0FBRyxJQUFJLFlBQVk7O0FBQ25DLFNBQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztFQUM1QixBQUFDLENBQUM7O0FBRUgsS0FBSSxLQUFLLElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxLQUFLLEVBQUU7O0FBRXhDLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFM0IsTUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO0FBQzVELFlBQVMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQTtHQUMvQzs7QUFFRCxRQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsR0FBRztBQUN0QyxVQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7R0FDL0IsQ0FBQTtFQUNGO0NBRUYsQ0FBQSxFQUFHLENBQUM7Ozs7OztJQU1nQixTQUFTO1dBQVQsU0FBUzs7QUFFbEIsVUFGUyxTQUFTLEdBRUg7OztNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBRkosU0FBUzs7QUFHNUIsTUFBTSxRQUFRLEdBQUc7QUFDaEIsWUFBUyxFQUFFLENBQUM7QUFDWixpQkFBYyxFQUFFLEdBQUc7QUFDbkIsYUFBVSxFQUFFLEVBQUU7R0FDZCxDQUFBO0FBQ0QsNkJBUm1CLFNBQVMsNkNBUXRCLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ3BELE1BQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3JELE1BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ2xELE1BQUksQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7O0FBRTlELE1BQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLE1BQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDOzs7QUFHdEIsTUFBSSxDQUFDLElBQUksR0FBSSxZQUFNO0FBQ2xCLE9BQU0sR0FBRyxHQUFHLFdBQVcsQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7O0FBRzlCLFNBQUssT0FBTyxFQUFFLENBQUM7QUFDZixTQUFLLElBQUksR0FBRyxNQUFLLE9BQU8sR0FBRyxNQUFLLFlBQVksQ0FBQzs7QUFFN0MsT0FBTSxTQUFTLEdBQUcsTUFBSyxZQUFZLENBQUMsU0FBUyxDQUFDO0FBQzlDLE9BQU0sR0FBRyxHQUFHLE1BQUssV0FBVyxDQUFDO0FBQzdCLE9BQU0sR0FBRyxHQUFHLE1BQUssTUFBTSxDQUFDLGNBQWMsQ0FBQzs7Ozs7OztBQU92QyxPQUFHLEdBQUcsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0FBQ3BCLFdBQU87SUFDUDtBQUNELE9BQUcsR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBQ3BCLFFBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxFQUFFOztBQUMzQixVQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzlCLFlBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDbkM7QUFDRCxXQUFLLE1BQU0sRUFBRSxDQUFDO0tBQ2Q7O0FBRUQsV0FBTztJQUNQOztBQUVELFFBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxHQUFHLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNqQyxRQUFJLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7QUFDZCxRQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBSSxHQUFHLEdBQUcsR0FBRyxHQUFHLEVBQUU7QUFDN0MsU0FBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUEsQ0FBQyxJQUFLLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQSxBQUFDLENBQUM7QUFDckQsVUFBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM5QixZQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBLEdBQUksR0FBRyxDQUFDO01BQ2hFO0FBQ0QsV0FBSyxNQUFNLEVBQUUsQ0FBQzs7QUFFZCxRQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNqQixXQUFNO0tBQ047SUFDRDs7R0FFRCxBQUFDLENBQUM7RUFDSDs7Y0FsRW1CLFNBQVM7O1NBb0VuQixzQkFBRztBQUNaLDhCQXJFbUIsU0FBUyw0Q0FxRVQ7QUFDbkIsT0FBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0dBQ2I7OztTQUVPLG9CQUFHO0FBQ1YsOEJBMUVtQixTQUFTLDBDQTBFWDtBQUNqQixPQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDWjs7O1NBRUksaUJBQUc7QUFDUCxPQUFHLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTztBQUN4QixPQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7Ozs7QUFLcEIsT0FBSSxDQUFDLFVBQVUsR0FBRyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0dBQUU7OztTQUV0RSxnQkFBRztBQUNOLE9BQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU87QUFDekIsT0FBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7O0dBRXJCOzs7U0FFTSxpQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtBQUM5QixPQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztBQUNyQixRQUFJLEVBQUUsV0FBVyxDQUFDLEdBQUcsRUFBRTtBQUN2QixTQUFLLEVBQUUsS0FBSztJQUNaLENBQUMsQ0FBQztBQUNILE9BQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0dBQ3pCOzs7UUFuR21CLFNBQVM7R0FBUyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU87O3FCQUFsQyxTQUFTIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXItZXhwZXJpbWVudGFsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbi8vID09PT09PT09PT09PT09PT0gcG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdyA9PT09PT09PT09PT09IC8vXG4vLyAtLT4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzU0Mzg2NTBcblxuKGZ1bmN0aW9uKCl7XG5cbiAgaWYgKFwicGVyZm9ybWFuY2VcIiBpbiB3aW5kb3cgPT0gZmFsc2UpIHtcbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHt9O1xuICB9XG4gIFxuICBEYXRlLm5vdyA9IChEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7ICAvLyB0aGFua3MgSUU4XG5cdCAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9KTtcblxuICBpZiAoXCJub3dcIiBpbiB3aW5kb3cucGVyZm9ybWFuY2UgPT0gZmFsc2UpIHtcbiAgICBcbiAgICB2YXIgbm93T2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICBpZiAocGVyZm9ybWFuY2UudGltaW5nICYmIHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgIG5vd09mZnNldCA9IHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnRcbiAgICB9XG5cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgfVxuICB9XG5cbn0pKCk7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PSByZXNhbXBsZXIgbGZvID09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzYW1wbGVyIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRmcmFtZVNpemU6IDEsXG5cdFx0XHRidWZmZXJEdXJhdGlvbjogMTAwLCBcdC8vbXNcblx0XHRcdG91dHB1dFJhdGU6IDUwXHRcdFx0Ly9IelxuXHRcdH1cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlID0gdGhpcy5wYXJhbXMub3V0cHV0UmF0ZTtcblx0XHR0aGlzLm91dHB1dFBlcmlvZCA9IDEwMDAgLyB0aGlzLnBhcmFtcy5vdXRwdXRSYXRlO1xuXHRcdHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUgPSAxMDAwIC8gdGhpcy5vdXRwdXRQZXJpb2Q7XG5cblx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblx0XHR0aGlzLmNvdW50ZXIgPSAwO1xuXHRcdHRoaXMuaW5wdXRCdWZmZXIgPSBbXTtcblxuXHRcdC8vPT09PT09PSBjYWxsYmFjayBmdW5jdGlvbiA9PT09PT09Ly9cblx0XHR0aGlzLmZpcmUgPSAoKCkgPT4ge1xuXHRcdFx0Y29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0XHRcblx0XHRcdC8vdGhpcy50aW1lID0gbm93O1xuXHRcdFx0dGhpcy5jb3VudGVyKys7XG5cdFx0XHR0aGlzLnRpbWUgPSB0aGlzLmNvdW50ZXIgKiB0aGlzLm91dHB1dFBlcmlvZDtcblxuXHRcdFx0Y29uc3QgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHRcdFx0Y29uc3QgYnVmID0gdGhpcy5pbnB1dEJ1ZmZlcjtcblx0XHRcdGNvbnN0IGRlbCA9IHRoaXMucGFyYW1zLmJ1ZmZlckR1cmF0aW9uO1xuXG5cdFx0XHQvL2NvbnN0IG5leHRJbnRlcnZhbCA9IHRoaXMub3V0cHV0UGVyaW9kIC0gKG5vdyAtIHRoaXMubGFzdE5vdyk7XG5cdFx0XHQvL2lmKG5leHRJbnRlcnZhbCA8IDApIG5leHRJbnRlcnZhbCA9IHRoaXMub3V0cHV0UGVyaW9kO1xuXHRcdFx0Ly90aGlzLmxhc3ROb3cgPSBub3c7XG5cdFx0XHQvL3NldFRpbWVvdXQodGhpcy5maXJlLmJpbmQodGhpcyksIG5leHRJbnRlcnZhbCk7XG5cblx0XHRcdGlmKGJ1Zi5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoYnVmLmxlbmd0aCA9PT0gMSkgeyAvLyBiZWdpbm5pbmcgb3IgcGVyaW9kIHdpdGhvdXQgaW5jb21pbmcgZGF0YSA+IGJ1ZkR1clxuXHRcdFx0XHRpZihidWZbMF0uZGF0ZSArIGRlbCA8IG5vdykgeyAvLyBwZXJpb2Qgd2l0aG91dCBpbmNvbWluZyBkYXRhID4gYnVmRHVyXG5cdFx0XHRcdFx0Zm9yKGxldCBpPTA7IGk8ZnJhbWVTaXplOyBpKyspIHtcblx0XHRcdFx0XHRcdHRoaXMub3V0RnJhbWVbaV0gPSBidWZbMF0uZnJhbWVbaV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMub3V0cHV0KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gdGhlbiA6XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8YnVmLmxlbmd0aC0xOyBpKyspIHtcblx0XHRcdFx0bGV0IGwgPSBidWZbaV0sXG5cdFx0XHRcdFx0ciA9IGJ1ZltpKzFdO1xuXHRcdFx0XHRpZihsLmRhdGUgKyBkZWwgPD0gbm93ICYmIHIuZGF0ZSArIGRlbCA+IG5vdykge1xuXHRcdFx0XHRcdGxldCBwY3QgPSAobm93IC0gKGwuZGF0ZSArIGRlbCkpIC8gKHIuZGF0ZSAtIGwuZGF0ZSk7XG5cdFx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8ZnJhbWVTaXplOyBqKyspIHtcblx0XHRcdFx0XHRcdHRoaXMub3V0RnJhbWVbal0gPSBsLmZyYW1lW2pdICsgKHIuZnJhbWVbal0gLSBsLmZyYW1lW2pdKSAqIHBjdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5vdXRwdXQoKTtcblx0XHRcdFx0XHQvLyByZW1vdmUgdXNlbGVzcyBmcmFtZXMgOlxuXHRcdFx0XHRcdGJ1Zi5zcGxpY2UoMCwgaSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vY29uc29sZS5sb2coYnVmLmxlbmd0aCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHN1cGVyLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH1cblxuXHRmaW5hbGl6ZSgpIHtcblx0XHRzdXBlci5maW5hbGl6ZSgpO1xuXHRcdHRoaXMuc3RvcCgpO1xuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0aWYodGhpcy5ydW5uaW5nKSByZXR1cm47XG5cdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZTtcblxuXHRcdC8vIHRoaXMubGFzdE5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdC8vIHNldFRpbWVvdXQodGhpcy5maXJlLmJpbmQodGhpcyksIHRoaXMucGFyYW1zLm91dHB1dFBlcmlvZCk7XG5cblx0XHR0aGlzLmludGVydmFsSUQgPSBzZXRJbnRlcnZhbCh0aGlzLmZpcmUuYmluZCh0aGlzKSwgdGhpcy5vdXRwdXRQZXJpb2QpO1x0fVxuXG5cdHN0b3AoKSB7XG5cdFx0aWYoIXRoaXMucnVubmluZykgcmV0dXJuO1xuXHRcdHRoaXMucnVubmluZyA9IGZhbHNlO1xuXHRcdC8vY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSUQpO1xuXHR9XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHR0aGlzLmlucHV0QnVmZmVyLnB1c2goe1xuXHRcdFx0ZGF0ZTogcGVyZm9ybWFuY2Uubm93KCksXG5cdFx0XHRmcmFtZTogZnJhbWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cdH1cbn0iXX0=