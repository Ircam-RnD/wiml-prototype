'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _wavesLfo = require('waves-lfo');

var _wavesLfo2 = _interopRequireDefault(_wavesLfo);

var _lfoResampler = require('./lfo-resampler');

var _lfoResampler2 = _interopRequireDefault(_lfoResampler);

var _lfoPseudoYin = require('./lfo-pseudo-yin');

var _lfoPseudoYin2 = _interopRequireDefault(_lfoPseudoYin);

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

// webkitAudioContext for safari, empty function for old android
// [ Audio not needed here ]
var AudioContext = window.AudioContext || window.webkitAudioContext || function () {};

var InputProcessingChain = (function (_lfo$core$BaseLfo) {
	_inherits(InputProcessingChain, _lfo$core$BaseLfo);

	function InputProcessingChain() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, InputProcessingChain);

		var defaults = {
			inputFrameSize: 1,
			windowSize: 128,
			hopSize: 64,
			period: 10
		};
		_get(Object.getPrototypeOf(InputProcessingChain.prototype), 'constructor', this).call(this, defaults, options);

		this.eventIn = new _wavesLfo2['default'].sources.EventIn({
			relative: true,
			frameSize: this.params.inputFrameSize,
			ctx: AudioContext
		});

		this.resampler = new _lfoResampler2['default']({
			period: this.params.period // in milliseconds
		});

		this.filter = new _wavesLfo2['default'].operators.MovingMedian({
			//this.filter = new lfo.operators.MovingAverage({ // fill() function not recognized
			order: 1
		});

		this.framer = new _wavesLfo2['default'].operators.Framer({
			frameSize: this.params.windowSize * this.params.inputFrameSize,
			//frameRate: this.resampler.frameRate / (this.params.windowSize * this.params.inputFrameSize),
			hopSize: this.params.hopSize
			//centeredTimeTag: true
		});

		this.descr = new _lfoPseudoYin2['default']({
			frameSize: 3,
			noiseThreshold: 0.03
		});

		//===================================//
		//========== connect things =========//
		//===================================//

		this.eventIn.connect(this.resampler);
		this.resampler.connect(this.filter);
		//this.eventIn.connect(this.filter);
		this.filter.connect(this.framer);
		//this.resampler.connect(this.framer);
		this.framer.connect(this.descr);
	}

	_createClass(InputProcessingChain, [{
		key: 'start',
		value: function start() {
			this.eventIn.start();
		}
	}, {
		key: 'stop',
		value: function stop() {
			this.eventIn.stop();
		}
	}, {
		key: 'connect',
		value: function connect(child) {
			this.descr.children.push(child);
			child.parent = this.descr;
		}
	}, {
		key: 'process',
		value: function process(time, frame, metaData) {
			//this.eventIn.process(performance.now(), [frame]);
			//console.log('Pseudo-Yin outFrame : ' + this.descr.outFrame);
			this.eventIn.process(time, frame, metaData);
		}
	}, {
		key: 'preFramerConnect',
		value: function preFramerConnect(dest) {
			this.filter.connect(dest);
		}
	}]);

	return InputProcessingChain;
})(_wavesLfo2['default'].core.BaseLfo);

exports['default'] = InputProcessingChain;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQ2dCLFdBQVc7Ozs7NEJBQ0wsaUJBQWlCOzs7OzRCQUNqQixrQkFBa0I7Ozs7Ozs7QUFNeEMsQ0FBQyxZQUFVOztBQUVULEtBQUksYUFBYSxJQUFJLE1BQU0sSUFBSSxLQUFLLEVBQUU7QUFDbEMsUUFBTSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7RUFDM0I7O0FBRUQsS0FBSSxDQUFDLEdBQUcsR0FBSSxJQUFJLENBQUMsR0FBRyxJQUFJLFlBQVk7O0FBQ25DLFNBQU8sSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztFQUM1QixBQUFDLENBQUM7O0FBRUgsS0FBSSxLQUFLLElBQUksTUFBTSxDQUFDLFdBQVcsSUFBSSxLQUFLLEVBQUU7O0FBRXhDLE1BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQzs7QUFFM0IsTUFBSSxXQUFXLENBQUMsTUFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFO0FBQzVELFlBQVMsR0FBRyxXQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQTtHQUMvQzs7QUFFRCxRQUFNLENBQUMsV0FBVyxDQUFDLEdBQUcsR0FBRyxTQUFTLEdBQUcsR0FBRztBQUN0QyxVQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxTQUFTLENBQUM7R0FDL0IsQ0FBQTtFQUNGO0NBRUYsQ0FBQSxFQUFHLENBQUM7Ozs7QUFJTCxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsSUFBSSxZQUFVLEVBQUUsQ0FBQzs7SUFFL0Qsb0JBQW9CO1dBQXBCLG9CQUFvQjs7QUFDN0IsVUFEUyxvQkFBb0IsR0FDZDtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBREosb0JBQW9COztBQUd2QyxNQUFNLFFBQVEsR0FBRztBQUNoQixpQkFBYyxFQUFFLENBQUM7QUFDakIsYUFBVSxFQUFFLEdBQUc7QUFDZixVQUFPLEVBQUUsRUFBRTtBQUNYLFNBQU0sRUFBRSxFQUFFO0dBQ1YsQ0FBQztBQUNGLDZCQVRtQixvQkFBb0IsNkNBU2pDLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxzQkFBSSxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3RDLFdBQVEsRUFBRSxJQUFJO0FBQ2QsWUFBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYztBQUNyQyxNQUFHLEVBQUUsWUFBWTtHQUNqQixDQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLFNBQVMsR0FBRyw4QkFBYztBQUM5QixTQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNO0dBQzFCLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksc0JBQUksU0FBUyxDQUFDLFlBQVksQ0FBQzs7QUFFNUMsUUFBSyxFQUFFLENBQUM7R0FDUixDQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLHNCQUFJLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFDdEMsWUFBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYzs7QUFFOUQsVUFBTyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTzs7R0FFNUIsQ0FBQyxDQUFDOztBQUVILE1BQUksQ0FBQyxLQUFLLEdBQUcsOEJBQWM7QUFDMUIsWUFBUyxFQUFFLENBQUM7QUFDWixpQkFBYyxFQUFFLElBQUk7R0FDcEIsQ0FBQyxDQUFDOzs7Ozs7QUFNSCxNQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDckMsTUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUVwQyxNQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7O0FBRWpDLE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUVoQzs7Y0FqRG1CLG9CQUFvQjs7U0FtRG5DLGlCQUFHO0FBQ1AsT0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNyQjs7O1NBRUcsZ0JBQUc7QUFDTixPQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ3BCOzs7U0FFTSxpQkFBQyxLQUFLLEVBQUU7QUFDWCxPQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsUUFBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQzdCOzs7U0FFTSxpQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTs7O0FBRzlCLE9BQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDNUM7OztTQUVlLDBCQUFDLElBQUksRUFBRTtBQUN0QixPQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUMxQjs7O1FBeEVtQixvQkFBb0I7R0FBUyxzQkFBSSxJQUFJLENBQUMsT0FBTzs7cUJBQTdDLG9CQUFvQiIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8taW5wdXQtcHJvY2Vzc2luZy1jaGFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW1wb3J0IGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuaW1wb3J0IFJlc2FtcGxlciBmcm9tICcuL2xmby1yZXNhbXBsZXInO1xuaW1wb3J0IFBzZXVkb1lpbiBmcm9tICcuL2xmby1wc2V1ZG8teWluJztcblxuXG4vLyA9PT09PT09PT09PT09PT09IHBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3cgPT09PT09PT09PT09PSAvL1xuLy8gLS0+IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC81NDM4NjUwXG5cbihmdW5jdGlvbigpe1xuXG4gIGlmIChcInBlcmZvcm1hbmNlXCIgaW4gd2luZG93ID09IGZhbHNlKSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBcbiAgRGF0ZS5ub3cgPSAoRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkgeyAgLy8gdGhhbmtzIElFOFxuXHQgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfSk7XG5cbiAgaWYgKFwibm93XCIgaW4gd2luZG93LnBlcmZvcm1hbmNlID09IGZhbHNlKSB7XG4gICAgXG4gICAgdmFyIG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgXG4gICAgaWYgKHBlcmZvcm1hbmNlLnRpbWluZyAmJiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0KSB7XG4gICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0XG4gICAgfVxuXG4gICAgd2luZG93LnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgIH1cbiAgfVxuXG59KSgpO1xuXG4vLyB3ZWJraXRBdWRpb0NvbnRleHQgZm9yIHNhZmFyaSwgZW1wdHkgZnVuY3Rpb24gZm9yIG9sZCBhbmRyb2lkXG4vLyBbIEF1ZGlvIG5vdCBuZWVkZWQgaGVyZSBdXG5sZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXRQcm9jZXNzaW5nQ2hhaW4gZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGlucHV0RnJhbWVTaXplOiAxLFxuXHRcdFx0d2luZG93U2l6ZTogMTI4LFxuXHRcdFx0aG9wU2l6ZTogNjQsXG5cdFx0XHRwZXJpb2Q6IDEwXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLmV2ZW50SW4gPSBuZXcgbGZvLnNvdXJjZXMuRXZlbnRJbih7XG5cdFx0XHRyZWxhdGl2ZTogdHJ1ZSxcblx0XHRcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdFx0XHRjdHg6IEF1ZGlvQ29udGV4dFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZXNhbXBsZXIgPSBuZXcgUmVzYW1wbGVyKHtcblx0XHRcdHBlcmlvZDogdGhpcy5wYXJhbXMucGVyaW9kIC8vIGluIG1pbGxpc2Vjb25kc1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5maWx0ZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5Nb3ZpbmdNZWRpYW4oe1xuXHRcdC8vdGhpcy5maWx0ZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5Nb3ZpbmdBdmVyYWdlKHsgLy8gZmlsbCgpIGZ1bmN0aW9uIG5vdCByZWNvZ25pemVkXG5cdFx0XHRvcmRlcjogMVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5mcmFtZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5GcmFtZXIoe1xuXHRcdFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy53aW5kb3dTaXplICogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdFx0XHQvL2ZyYW1lUmF0ZTogdGhpcy5yZXNhbXBsZXIuZnJhbWVSYXRlIC8gKHRoaXMucGFyYW1zLndpbmRvd1NpemUgKiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSksXG5cdFx0XHRob3BTaXplOiB0aGlzLnBhcmFtcy5ob3BTaXplXG5cdFx0XHQvL2NlbnRlcmVkVGltZVRhZzogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5kZXNjciA9IG5ldyBQc2V1ZG9ZaW4oe1xuXHRcdFx0ZnJhbWVTaXplOiAzLFxuXHRcdFx0bm9pc2VUaHJlc2hvbGQ6IDAuMDNcblx0XHR9KTtcblxuXHRcdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHRcdC8vPT09PT09PT09PSBjb25uZWN0IHRoaW5ncyA9PT09PT09PT0vL1xuXHRcdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdFx0dGhpcy5ldmVudEluLmNvbm5lY3QodGhpcy5yZXNhbXBsZXIpO1xuXHRcdHRoaXMucmVzYW1wbGVyLmNvbm5lY3QodGhpcy5maWx0ZXIpO1xuXHRcdC8vdGhpcy5ldmVudEluLmNvbm5lY3QodGhpcy5maWx0ZXIpO1xuXHRcdHRoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5mcmFtZXIpO1xuXHRcdC8vdGhpcy5yZXNhbXBsZXIuY29ubmVjdCh0aGlzLmZyYW1lcik7XG5cdFx0dGhpcy5mcmFtZXIuY29ubmVjdCh0aGlzLmRlc2NyKTtcblxuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0dGhpcy5ldmVudEluLnN0YXJ0KCk7XG5cdH1cblxuXHRzdG9wKCkge1xuXHRcdHRoaXMuZXZlbnRJbi5zdG9wKCk7XG5cdH1cblxuXHRjb25uZWN0KGNoaWxkKSB7XG4gICAgXHR0aGlzLmRlc2NyLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIFx0Y2hpbGQucGFyZW50ID0gdGhpcy5kZXNjcjtcblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0Ly90aGlzLmV2ZW50SW4ucHJvY2VzcyhwZXJmb3JtYW5jZS5ub3coKSwgW2ZyYW1lXSk7XG5cdFx0Ly9jb25zb2xlLmxvZygnUHNldWRvLVlpbiBvdXRGcmFtZSA6ICcgKyB0aGlzLmRlc2NyLm91dEZyYW1lKTtcblx0XHR0aGlzLmV2ZW50SW4ucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuXHR9XG5cblx0cHJlRnJhbWVyQ29ubmVjdChkZXN0KSB7XG5cdFx0dGhpcy5maWx0ZXIuY29ubmVjdChkZXN0KTtcblx0fVxufVxuXG4iXX0=