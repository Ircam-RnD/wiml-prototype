'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

var _lfoResampler = require('./lfo-resampler');

var _lfoResampler2 = _interopRequireDefault(_lfoResampler);

var _lfoResamplerExperimental = require('./lfo-resampler-experimental');

var _lfoResamplerExperimental2 = _interopRequireDefault(_lfoResamplerExperimental);

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
			//outputRate: 50,	
			period: 20
		};
		_get(Object.getPrototypeOf(InputProcessingChain.prototype), 'constructor', this).call(this, defaults, options);

		this.eventIn = new lfo.sources.EventIn({
			//relative: true,
			frameSize: this.params.inputFrameSize,
			ctx: AudioContext
		});

		this.resampler = new _lfoResampler2['default']({
			frameSize: this.params.inputFrameSize,
			period: this.params.period // in milliseconds
		});

		// this.resampler = new ResamplerExp({
		// 	frameSize: this.params.inputFrameSize,
		// 	outputRate: this.params.outputRate,
		// 	bufferDuration: 150
		// 	//period: this.params.period // in milliseconds
		// });

		// this.filter = new lfo.operators.MovingMedian({
		// //this.filter = new lfo.operators.MovingAverage({ // fill() function not recognized
		// 	order: 1
		// });

		this.framer = new lfo.operators.Framer({
			frameSize: this.params.windowSize * this.params.inputFrameSize,
			//frameRate: this.resampler.frameRate / (this.params.windowSize * this.params.inputFrameSize),
			hopSize: this.params.hopSize
			//centeredTimeTag: true
		});

		this.descr = new _lfoPseudoYin2['default']({
			//frameSize: 3, // defined internally
			inputRate: 1000 / this.params.period,
			noiseThreshold: 0.03
		});

		//===================================//
		//========== connect things =========//
		//===================================//

		this.eventIn.connect(this.resampler);
		//this.resampler.connect(this.filter);
		//this.eventIn.connect(this.filter);
		//this.filter.connect(this.framer);
		this.resampler.connect(this.framer);
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

		// TODO : implement disconect()

	}, {
		key: 'process',
		value: function process(time, frame, metaData) {
			//this.eventIn.process(performance.now(), [frame]);

			//console.log('Pseudo-Yin outFrame : ' + this.descr.outFrame);
			this.eventIn.process(time, frame, metaData);

			//	this.resampler.process(time, frame, metaData);
		}
	}, {
		key: 'preFramerConnect',
		value: function preFramerConnect(dest) {
			//this.filter.connect(dest);
			this.resampler.connect(dest);
		}
	}]);

	return InputProcessingChain;
})(lfo.core.BaseLfo);

exports['default'] = InputProcessingChain;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFDcUIsV0FBVzs7SUFBcEIsR0FBRzs7NEJBQ08saUJBQWlCOzs7O3dDQUNkLDhCQUE4Qjs7Ozs0QkFDakMsa0JBQWtCOzs7Ozs7O0FBTXhDLENBQUMsWUFBVTs7QUFFVCxLQUFJLGFBQWEsSUFBSSxNQUFNLElBQUksS0FBSyxFQUFFO0FBQ2xDLFFBQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0VBQzNCOztBQUVELEtBQUksQ0FBQyxHQUFHLEdBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxZQUFZOztBQUNuQyxTQUFPLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7RUFDNUIsQUFBQyxDQUFDOztBQUVILEtBQUksS0FBSyxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksS0FBSyxFQUFFOztBQUV4QyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRTNCLE1BQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtBQUM1RCxZQUFTLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUE7R0FDL0M7O0FBRUQsUUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLEdBQUc7QUFDdEMsVUFBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO0dBQy9CLENBQUE7RUFDRjtDQUVGLENBQUEsRUFBRyxDQUFDOzs7O0FBSUwsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsa0JBQWtCLElBQUksWUFBVSxFQUFFLENBQUM7O0lBRS9ELG9CQUFvQjtXQUFwQixvQkFBb0I7O0FBQzdCLFVBRFMsb0JBQW9CLEdBQ2Q7TUFBZCxPQUFPLHlEQUFHLEVBQUU7O3dCQURKLG9CQUFvQjs7QUFHdkMsTUFBTSxRQUFRLEdBQUc7QUFDaEIsaUJBQWMsRUFBRSxDQUFDO0FBQ2pCLGFBQVUsRUFBRSxHQUFHO0FBQ2YsVUFBTyxFQUFFLEVBQUU7O0FBRVgsU0FBTSxFQUFFLEVBQUU7R0FDVixDQUFDO0FBQ0YsNkJBVm1CLG9CQUFvQiw2Q0FVakMsUUFBUSxFQUFFLE9BQU8sRUFBRTs7QUFFekIsTUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDOztBQUV0QyxZQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxjQUFjO0FBQ3JDLE1BQUcsRUFBRSxZQUFZO0dBQ2pCLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsU0FBUyxHQUFHLDhCQUFjO0FBQzlCLFlBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWM7QUFDckMsU0FBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtHQUMxQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7O0FBY0gsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3RDLFlBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWM7O0FBRTlELFVBQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87O0dBRTVCLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsS0FBSyxHQUFHLDhCQUFjOztBQUUxQixZQUFTLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtBQUNwQyxpQkFBYyxFQUFFLElBQUk7R0FDcEIsQ0FBQyxDQUFDOzs7Ozs7QUFNSCxNQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Ozs7QUFJckMsTUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUVoQzs7Y0EzRG1CLG9CQUFvQjs7U0E2RG5DLGlCQUFHO0FBQ1AsT0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNyQjs7O1NBRUcsZ0JBQUc7QUFDTixPQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ3BCOzs7U0FFTSxpQkFBQyxLQUFLLEVBQUU7QUFDWCxPQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsUUFBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQzdCOzs7Ozs7U0FJTSxpQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTs7OztBQUk5QixPQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDOzs7R0FHNUM7OztTQUVlLDBCQUFDLElBQUksRUFBRTs7QUFFdEIsT0FBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDN0I7OztRQXhGbUIsb0JBQW9CO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztxQkFBN0Msb0JBQW9CIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcbmltcG9ydCBSZXNhbXBsZXIgZnJvbSAnLi9sZm8tcmVzYW1wbGVyJztcbmltcG9ydCBSZXNhbXBsZXJFeHAgZnJvbSAnLi9sZm8tcmVzYW1wbGVyLWV4cGVyaW1lbnRhbCc7XG5pbXBvcnQgUHNldWRvWWluIGZyb20gJy4vbGZvLXBzZXVkby15aW4nO1xuXG5cbi8vID09PT09PT09PT09PT09PT0gcG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdyA9PT09PT09PT09PT09IC8vXG4vLyAtLT4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzU0Mzg2NTBcblxuKGZ1bmN0aW9uKCl7XG5cbiAgaWYgKFwicGVyZm9ybWFuY2VcIiBpbiB3aW5kb3cgPT0gZmFsc2UpIHtcbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHt9O1xuICB9XG4gIFxuICBEYXRlLm5vdyA9IChEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7ICAvLyB0aGFua3MgSUU4XG5cdCAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9KTtcblxuICBpZiAoXCJub3dcIiBpbiB3aW5kb3cucGVyZm9ybWFuY2UgPT0gZmFsc2UpIHtcbiAgICBcbiAgICB2YXIgbm93T2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICBpZiAocGVyZm9ybWFuY2UudGltaW5nICYmIHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgIG5vd09mZnNldCA9IHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnRcbiAgICB9XG5cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgfVxuICB9XG5cbn0pKCk7XG5cbi8vIHdlYmtpdEF1ZGlvQ29udGV4dCBmb3Igc2FmYXJpLCBlbXB0eSBmdW5jdGlvbiBmb3Igb2xkIGFuZHJvaWRcbi8vIFsgQXVkaW8gbm90IG5lZWRlZCBoZXJlIF1cbmxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgZnVuY3Rpb24oKXt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dFByb2Nlc3NpbmdDaGFpbiBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblxuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0aW5wdXRGcmFtZVNpemU6IDEsXG5cdFx0XHR3aW5kb3dTaXplOiAxMjgsXG5cdFx0XHRob3BTaXplOiA2NCxcblx0XHRcdC8vb3V0cHV0UmF0ZTogNTAsXHRcblx0XHRcdHBlcmlvZDogMjBcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuZXZlbnRJbiA9IG5ldyBsZm8uc291cmNlcy5FdmVudEluKHtcblx0XHRcdC8vcmVsYXRpdmU6IHRydWUsXG5cdFx0XHRmcmFtZVNpemU6IHRoaXMucGFyYW1zLmlucHV0RnJhbWVTaXplLFxuXHRcdFx0Y3R4OiBBdWRpb0NvbnRleHRcblx0XHR9KTtcblxuXHRcdHRoaXMucmVzYW1wbGVyID0gbmV3IFJlc2FtcGxlcih7XG5cdFx0XHRmcmFtZVNpemU6IHRoaXMucGFyYW1zLmlucHV0RnJhbWVTaXplLFxuXHRcdFx0cGVyaW9kOiB0aGlzLnBhcmFtcy5wZXJpb2QgLy8gaW4gbWlsbGlzZWNvbmRzXG5cdFx0fSk7XG5cblx0XHQvLyB0aGlzLnJlc2FtcGxlciA9IG5ldyBSZXNhbXBsZXJFeHAoe1xuXHRcdC8vIFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSxcblx0XHQvLyBcdG91dHB1dFJhdGU6IHRoaXMucGFyYW1zLm91dHB1dFJhdGUsXG5cdFx0Ly8gXHRidWZmZXJEdXJhdGlvbjogMTUwXG5cdFx0Ly8gXHQvL3BlcmlvZDogdGhpcy5wYXJhbXMucGVyaW9kIC8vIGluIG1pbGxpc2Vjb25kc1xuXHRcdC8vIH0pO1xuXG5cdFx0Ly8gdGhpcy5maWx0ZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5Nb3ZpbmdNZWRpYW4oe1xuXHRcdC8vIC8vdGhpcy5maWx0ZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5Nb3ZpbmdBdmVyYWdlKHsgLy8gZmlsbCgpIGZ1bmN0aW9uIG5vdCByZWNvZ25pemVkXG5cdFx0Ly8gXHRvcmRlcjogMVxuXHRcdC8vIH0pO1xuXG5cdFx0dGhpcy5mcmFtZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5GcmFtZXIoe1xuXHRcdFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy53aW5kb3dTaXplICogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdFx0XHQvL2ZyYW1lUmF0ZTogdGhpcy5yZXNhbXBsZXIuZnJhbWVSYXRlIC8gKHRoaXMucGFyYW1zLndpbmRvd1NpemUgKiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSksXG5cdFx0XHRob3BTaXplOiB0aGlzLnBhcmFtcy5ob3BTaXplXG5cdFx0XHQvL2NlbnRlcmVkVGltZVRhZzogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5kZXNjciA9IG5ldyBQc2V1ZG9ZaW4oe1xuXHRcdFx0Ly9mcmFtZVNpemU6IDMsIC8vIGRlZmluZWQgaW50ZXJuYWxseVxuXHRcdFx0aW5wdXRSYXRlOiAxMDAwIC8gdGhpcy5wYXJhbXMucGVyaW9kLFxuXHRcdFx0bm9pc2VUaHJlc2hvbGQ6IDAuMDNcblx0XHR9KTtcblxuXHRcdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHRcdC8vPT09PT09PT09PSBjb25uZWN0IHRoaW5ncyA9PT09PT09PT0vL1xuXHRcdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdFx0dGhpcy5ldmVudEluLmNvbm5lY3QodGhpcy5yZXNhbXBsZXIpO1xuXHRcdC8vdGhpcy5yZXNhbXBsZXIuY29ubmVjdCh0aGlzLmZpbHRlcik7XG5cdFx0Ly90aGlzLmV2ZW50SW4uY29ubmVjdCh0aGlzLmZpbHRlcik7XG5cdFx0Ly90aGlzLmZpbHRlci5jb25uZWN0KHRoaXMuZnJhbWVyKTtcblx0XHR0aGlzLnJlc2FtcGxlci5jb25uZWN0KHRoaXMuZnJhbWVyKTtcblx0XHR0aGlzLmZyYW1lci5jb25uZWN0KHRoaXMuZGVzY3IpO1xuXG5cdH1cblxuXHRzdGFydCgpIHtcblx0XHR0aGlzLmV2ZW50SW4uc3RhcnQoKTtcblx0fVxuXG5cdHN0b3AoKSB7XG5cdFx0dGhpcy5ldmVudEluLnN0b3AoKTtcblx0fVxuXG5cdGNvbm5lY3QoY2hpbGQpIHtcbiAgICBcdHRoaXMuZGVzY3IuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgXHRjaGlsZC5wYXJlbnQgPSB0aGlzLmRlc2NyO1xuXHR9XG5cblx0Ly8gVE9ETyA6IGltcGxlbWVudCBkaXNjb25lY3QoKVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0Ly90aGlzLmV2ZW50SW4ucHJvY2VzcyhwZXJmb3JtYW5jZS5ub3coKSwgW2ZyYW1lXSk7XG5cdFx0XG5cdFx0Ly9jb25zb2xlLmxvZygnUHNldWRvLVlpbiBvdXRGcmFtZSA6ICcgKyB0aGlzLmRlc2NyLm91dEZyYW1lKTtcblx0XHR0aGlzLmV2ZW50SW4ucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuXG5cdFx0Ly9cdHRoaXMucmVzYW1wbGVyLnByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKTtcblx0fVxuXG5cdHByZUZyYW1lckNvbm5lY3QoZGVzdCkge1xuXHRcdC8vdGhpcy5maWx0ZXIuY29ubmVjdChkZXN0KTtcblx0XHR0aGlzLnJlc2FtcGxlci5jb25uZWN0KGRlc3QpO1xuXHR9XG59XG5cbiJdfQ==