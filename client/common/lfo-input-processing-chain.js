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
			outputRate: 50,
			period: 20
		};
		_get(Object.getPrototypeOf(InputProcessingChain.prototype), 'constructor', this).call(this, defaults, options);

		// this.eventIn = new lfo.sources.EventIn({
		// 	//relative: true,
		// 	frameSize: this.params.inputFrameSize,
		// 	ctx: AudioContext
		// });

		// this.resampler = new Resampler({
		// 	frameSize: this.params.inputFrameSize,
		// 	period: this.params.period // in milliseconds
		// });

		this.resampler = new _lfoResamplerExperimental2['default']({
			frameSize: this.params.inputFrameSize,
			outputRate: this.params.outputRate,
			bufferDuration: 150
			//period: this.params.period // in milliseconds
		});

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
			//this.eventIn.process(time, frame, metaData);

			this.resampler.process(time, frame, metaData);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkFDcUIsV0FBVzs7SUFBcEIsR0FBRzs7NEJBQ08saUJBQWlCOzs7O3dDQUNkLDhCQUE4Qjs7Ozs0QkFDakMsa0JBQWtCOzs7Ozs7O0FBTXhDLENBQUMsWUFBVTs7QUFFVCxLQUFJLGFBQWEsSUFBSSxNQUFNLElBQUksS0FBSyxFQUFFO0FBQ2xDLFFBQU0sQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO0VBQzNCOztBQUVELEtBQUksQ0FBQyxHQUFHLEdBQUksSUFBSSxDQUFDLEdBQUcsSUFBSSxZQUFZOztBQUNuQyxTQUFPLElBQUksSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUM7RUFDNUIsQUFBQyxDQUFDOztBQUVILEtBQUksS0FBSyxJQUFJLE1BQU0sQ0FBQyxXQUFXLElBQUksS0FBSyxFQUFFOztBQUV4QyxNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7O0FBRTNCLE1BQUksV0FBVyxDQUFDLE1BQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRTtBQUM1RCxZQUFTLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUE7R0FDL0M7O0FBRUQsUUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLEdBQUc7QUFDdEMsVUFBTyxJQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsU0FBUyxDQUFDO0dBQy9CLENBQUE7RUFDRjtDQUVGLENBQUEsRUFBRyxDQUFDOzs7O0FBSUwsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsa0JBQWtCLElBQUksWUFBVSxFQUFFLENBQUM7O0lBRS9ELG9CQUFvQjtXQUFwQixvQkFBb0I7O0FBQzdCLFVBRFMsb0JBQW9CLEdBQ2Q7TUFBZCxPQUFPLHlEQUFHLEVBQUU7O3dCQURKLG9CQUFvQjs7QUFHdkMsTUFBTSxRQUFRLEdBQUc7QUFDaEIsaUJBQWMsRUFBRSxDQUFDO0FBQ2pCLGFBQVUsRUFBRSxHQUFHO0FBQ2YsVUFBTyxFQUFFLEVBQUU7QUFDWCxhQUFVLEVBQUUsRUFBRTtBQUNkLFNBQU0sRUFBRSxFQUFFO0dBQ1YsQ0FBQztBQUNGLDZCQVZtQixvQkFBb0IsNkNBVWpDLFFBQVEsRUFBRSxPQUFPLEVBQUU7Ozs7Ozs7Ozs7Ozs7QUFhekIsTUFBSSxDQUFDLFNBQVMsR0FBRywwQ0FBaUI7QUFDakMsWUFBUyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYztBQUNyQyxhQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVO0FBQ2xDLGlCQUFjLEVBQUUsR0FBRzs7R0FFbkIsQ0FBQyxDQUFDOzs7Ozs7O0FBT0gsTUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO0FBQ3RDLFlBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWM7O0FBRTlELFVBQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87O0dBRTVCLENBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsS0FBSyxHQUFHLDhCQUFjOztBQUUxQixZQUFTLEVBQUUsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTTtBQUNwQyxpQkFBYyxFQUFFLElBQUk7R0FDcEIsQ0FBQyxDQUFDOzs7Ozs7QUFNSCxNQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Ozs7QUFJckMsTUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3BDLE1BQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztFQUVoQzs7Y0EzRG1CLG9CQUFvQjs7U0E2RG5DLGlCQUFHO0FBQ1AsT0FBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQztHQUNyQjs7O1NBRUcsZ0JBQUc7QUFDTixPQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0dBQ3BCOzs7U0FFTSxpQkFBQyxLQUFLLEVBQUU7QUFDWCxPQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsUUFBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQzdCOzs7Ozs7U0FJTSxpQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTs7Ozs7O0FBTTlCLE9BQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDOUM7OztTQUVlLDBCQUFDLElBQUksRUFBRTs7QUFFdEIsT0FBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDN0I7OztRQXhGbUIsb0JBQW9CO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztxQkFBN0Msb0JBQW9CIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5pbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcbmltcG9ydCBSZXNhbXBsZXIgZnJvbSAnLi9sZm8tcmVzYW1wbGVyJztcbmltcG9ydCBSZXNhbXBsZXJFeHAgZnJvbSAnLi9sZm8tcmVzYW1wbGVyLWV4cGVyaW1lbnRhbCc7XG5pbXBvcnQgUHNldWRvWWluIGZyb20gJy4vbGZvLXBzZXVkby15aW4nO1xuXG5cbi8vID09PT09PT09PT09PT09PT0gcG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdyA9PT09PT09PT09PT09IC8vXG4vLyAtLT4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzU0Mzg2NTBcblxuKGZ1bmN0aW9uKCl7XG5cbiAgaWYgKFwicGVyZm9ybWFuY2VcIiBpbiB3aW5kb3cgPT0gZmFsc2UpIHtcbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHt9O1xuICB9XG4gIFxuICBEYXRlLm5vdyA9IChEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7ICAvLyB0aGFua3MgSUU4XG5cdCAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9KTtcblxuICBpZiAoXCJub3dcIiBpbiB3aW5kb3cucGVyZm9ybWFuY2UgPT0gZmFsc2UpIHtcbiAgICBcbiAgICB2YXIgbm93T2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICBpZiAocGVyZm9ybWFuY2UudGltaW5nICYmIHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgIG5vd09mZnNldCA9IHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnRcbiAgICB9XG5cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgfVxuICB9XG5cbn0pKCk7XG5cbi8vIHdlYmtpdEF1ZGlvQ29udGV4dCBmb3Igc2FmYXJpLCBlbXB0eSBmdW5jdGlvbiBmb3Igb2xkIGFuZHJvaWRcbi8vIFsgQXVkaW8gbm90IG5lZWRlZCBoZXJlIF1cbmxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgZnVuY3Rpb24oKXt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnB1dFByb2Nlc3NpbmdDaGFpbiBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblxuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0aW5wdXRGcmFtZVNpemU6IDEsXG5cdFx0XHR3aW5kb3dTaXplOiAxMjgsXG5cdFx0XHRob3BTaXplOiA2NCxcblx0XHRcdG91dHB1dFJhdGU6IDUwLFx0XG5cdFx0XHRwZXJpb2Q6IDIwXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHQvLyB0aGlzLmV2ZW50SW4gPSBuZXcgbGZvLnNvdXJjZXMuRXZlbnRJbih7XG5cdFx0Ly8gXHQvL3JlbGF0aXZlOiB0cnVlLFxuXHRcdC8vIFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSxcblx0XHQvLyBcdGN0eDogQXVkaW9Db250ZXh0XG5cdFx0Ly8gfSk7XG5cblx0XHQvLyB0aGlzLnJlc2FtcGxlciA9IG5ldyBSZXNhbXBsZXIoe1xuXHRcdC8vIFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSxcblx0XHQvLyBcdHBlcmlvZDogdGhpcy5wYXJhbXMucGVyaW9kIC8vIGluIG1pbGxpc2Vjb25kc1xuXHRcdC8vIH0pO1xuXG5cdFx0dGhpcy5yZXNhbXBsZXIgPSBuZXcgUmVzYW1wbGVyRXhwKHtcblx0XHRcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdFx0XHRvdXRwdXRSYXRlOiB0aGlzLnBhcmFtcy5vdXRwdXRSYXRlLFxuXHRcdFx0YnVmZmVyRHVyYXRpb246IDE1MFxuXHRcdFx0Ly9wZXJpb2Q6IHRoaXMucGFyYW1zLnBlcmlvZCAvLyBpbiBtaWxsaXNlY29uZHNcblx0XHR9KTtcblxuXHRcdC8vIHRoaXMuZmlsdGVyID0gbmV3IGxmby5vcGVyYXRvcnMuTW92aW5nTWVkaWFuKHtcblx0XHQvLyAvL3RoaXMuZmlsdGVyID0gbmV3IGxmby5vcGVyYXRvcnMuTW92aW5nQXZlcmFnZSh7IC8vIGZpbGwoKSBmdW5jdGlvbiBub3QgcmVjb2duaXplZFxuXHRcdC8vIFx0b3JkZXI6IDFcblx0XHQvLyB9KTtcblxuXHRcdHRoaXMuZnJhbWVyID0gbmV3IGxmby5vcGVyYXRvcnMuRnJhbWVyKHtcblx0XHRcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMud2luZG93U2l6ZSAqIHRoaXMucGFyYW1zLmlucHV0RnJhbWVTaXplLFxuXHRcdFx0Ly9mcmFtZVJhdGU6IHRoaXMucmVzYW1wbGVyLmZyYW1lUmF0ZSAvICh0aGlzLnBhcmFtcy53aW5kb3dTaXplICogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUpLFxuXHRcdFx0aG9wU2l6ZTogdGhpcy5wYXJhbXMuaG9wU2l6ZVxuXHRcdFx0Ly9jZW50ZXJlZFRpbWVUYWc6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZGVzY3IgPSBuZXcgUHNldWRvWWluKHtcblx0XHRcdC8vZnJhbWVTaXplOiAzLCAvLyBkZWZpbmVkIGludGVybmFsbHlcblx0XHRcdGlucHV0UmF0ZTogMTAwMCAvIHRoaXMucGFyYW1zLnBlcmlvZCxcblx0XHRcdG5vaXNlVGhyZXNob2xkOiAwLjAzXG5cdFx0fSk7XG5cblx0XHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0XHQvLz09PT09PT09PT0gY29ubmVjdCB0aGluZ3MgPT09PT09PT09Ly9cblx0XHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuXHRcdHRoaXMuZXZlbnRJbi5jb25uZWN0KHRoaXMucmVzYW1wbGVyKTtcblx0XHQvL3RoaXMucmVzYW1wbGVyLmNvbm5lY3QodGhpcy5maWx0ZXIpO1xuXHRcdC8vdGhpcy5ldmVudEluLmNvbm5lY3QodGhpcy5maWx0ZXIpO1xuXHRcdC8vdGhpcy5maWx0ZXIuY29ubmVjdCh0aGlzLmZyYW1lcik7XG5cdFx0dGhpcy5yZXNhbXBsZXIuY29ubmVjdCh0aGlzLmZyYW1lcik7XG5cdFx0dGhpcy5mcmFtZXIuY29ubmVjdCh0aGlzLmRlc2NyKTtcblxuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0dGhpcy5ldmVudEluLnN0YXJ0KCk7XG5cdH1cblxuXHRzdG9wKCkge1xuXHRcdHRoaXMuZXZlbnRJbi5zdG9wKCk7XG5cdH1cblxuXHRjb25uZWN0KGNoaWxkKSB7XG4gICAgXHR0aGlzLmRlc2NyLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIFx0Y2hpbGQucGFyZW50ID0gdGhpcy5kZXNjcjtcblx0fVxuXG5cdC8vIFRPRE8gOiBpbXBsZW1lbnQgZGlzY29uZWN0KClcblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdC8vdGhpcy5ldmVudEluLnByb2Nlc3MocGVyZm9ybWFuY2Uubm93KCksIFtmcmFtZV0pO1xuXHRcdFxuXHRcdC8vY29uc29sZS5sb2coJ1BzZXVkby1ZaW4gb3V0RnJhbWUgOiAnICsgdGhpcy5kZXNjci5vdXRGcmFtZSk7XG5cdFx0Ly90aGlzLmV2ZW50SW4ucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuXG5cdFx0dGhpcy5yZXNhbXBsZXIucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuXHR9XG5cblx0cHJlRnJhbWVyQ29ubmVjdChkZXN0KSB7XG5cdFx0Ly90aGlzLmZpbHRlci5jb25uZWN0KGRlc3QpO1xuXHRcdHRoaXMucmVzYW1wbGVyLmNvbm5lY3QoZGVzdCk7XG5cdH1cbn1cblxuIl19