(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};

"use strict";

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var AudioPlayer = (function () {
	function AudioPlayer(context, buffer) {
		var _this = this;

		_classCallCheck(this, AudioPlayer);

		this.context = context;
		//this.context = new AudioContext();
		this.sourceBuffer = this.context.createBufferSource();
		this.bufferGain = this.context.createGain();
		this.sourceBuffer.buffer = buffer;
		this.sourceBuffer.loop = true;
		this.bufferGain.gain.value = 0;
		this.fadeID = -1;

		this.sourceBuffer.connect(this.bufferGain);
		this.bufferGain.connect(this.context.destination);

		this.fadeFunction = function (target, inc) {
			//console.log(this.bufferGain.gain.value);
			if (_this.bufferGain.gain.value === target) return;
			if (Math.abs(_this.bufferGain.gain.value - target) > Math.abs(inc)) {
				//console.log(this.bufferGain.gain.value);
				_this.bufferGain.gain.value += inc;
			}

			if (Math.abs(_this.bufferGain.gain.value - target) < Math.abs(inc)) {
				_this.bufferGain.gain.value = target;
				clearInterval(_this.fadeID);
			}
		};
	}

	_createClass(AudioPlayer, [{
		key: "start",
		value: function start() {
			this.sourceBuffer.start(this.context.currentTime);
		}
	}, {
		key: "stop",
		value: function stop() {
			this.sourceBuffer.stop();
		}
	}, {
		key: "fade",
		value: function fade(target, duration) {
			if (duration === 0) {
				this.bufferGain.gain.value = target;
				return;
			}
			var interval = 10;
			var inc = (target - this.bufferGain.gain.value) / (duration / interval);
			//console.log(this.bufferGain.gain.value + " -> " + target + " " + inc);
			if (inc == 0) return;
			clearInterval(this.fadeID);
			this.fadeID = setInterval(this.fadeFunction.bind(this, target, inc), interval);
		}
	}]);

	return AudioPlayer;
})();

exports["default"] = AudioPlayer;
module.exports = exports["default"];

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19}],2:[function(require,module,exports){
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _lfoDataRecorder = require('./lfo-data-recorder');

var _lfoDataRecorder2 = _interopRequireDefault(_lfoDataRecorder);

var _lfoInputProcessingChain = require('./lfo-input-processing-chain');

var _lfoInputProcessingChain2 = _interopRequireDefault(_lfoInputProcessingChain);

var _lfoPseudoYin = require('./lfo-pseudo-yin');

var _lfoPseudoYin2 = _interopRequireDefault(_lfoPseudoYin);

var _lfoResampler = require('./lfo-resampler');

var _lfoResampler2 = _interopRequireDefault(_lfoResampler);

var _lfoResamplerExperimental = require('./lfo-resampler-experimental');

var _lfoResamplerExperimental2 = _interopRequireDefault(_lfoResamplerExperimental);

var _lfoXmmGmmDecoder = require('./lfo-xmm-gmm-decoder');

var _lfoXmmGmmDecoder2 = _interopRequireDefault(_lfoXmmGmmDecoder);

var _lfoXmmHhmmDecoder = require('./lfo-xmm-hhmm-decoder');

var _lfoXmmHhmmDecoder2 = _interopRequireDefault(_lfoXmmHhmmDecoder);

var _lfoDelta = require('./lfo-delta');

var _lfoDelta2 = _interopRequireDefault(_lfoDelta);

var _lfoIntensity = require('./lfo-intensity');

var _lfoIntensity2 = _interopRequireDefault(_lfoIntensity);

var _lfoSelect = require('./lfo-select');

var _lfoSelect2 = _interopRequireDefault(_lfoSelect);

var _audioPlayerJs = require('./audio-player.js');

var _audioPlayerJs2 = _interopRequireDefault(_audioPlayerJs);

},{"./audio-player.js":1,"./lfo-data-recorder":3,"./lfo-delta":4,"./lfo-input-processing-chain":5,"./lfo-intensity":6,"./lfo-pseudo-yin":7,"./lfo-resampler":9,"./lfo-resampler-experimental":8,"./lfo-select":10,"./lfo-xmm-gmm-decoder":11,"./lfo-xmm-hhmm-decoder":12,"babel-runtime/helpers/interop-require-default":22}],3:[function(require,module,exports){
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

var DataRecorder = (function (_lfo$sinks$DataRecorder) {
	_inherits(DataRecorder, _lfo$sinks$DataRecorder);

	function DataRecorder() {
		var _this = this;

		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, DataRecorder);

		var defaults = {
			//frameSize: 3,
			separateArrays: true,
			bimodal: false
		};
		//column_names: ['magnitude', 'frequency', 'periodicity']
		_get(Object.getPrototypeOf(DataRecorder.prototype), 'constructor', this).call(this, defaults, options);
		if (options.column_names !== undefined) {
			this.params.column_names = options.column_names.slice(0);
			//console.log(this.params.column_names);
		}

		this.phrase = {};

		this.updatePhrase = function (data) {
			//console.log(data.data);
			_this.phrase = {};
			_this.phrase.bimodal = _this.params.bimodal;
			_this.phrase.dimension = _this.streamParams.frameSize;
			_this.phrase.dimension_input = 0;
			_this.phrase.column_names = _this.params.column_names.slice(0);
			_this.phrase.data = [];
			for (var vecid in data.data) {
				for (var id in data.data[vecid]) {
					_this.phrase.data.push(data.data[vecid][id]);
				}
			}
			_this.phrase.length = data.time.length;
			_this.retrieve().then(_this.updatePhrase.bind(_this))['catch'](function (err) {
				return console.error(err.stack);
			});
		};

		this.retrieve().then(this.updatePhrase.bind(this))['catch'](function (err) {
			return console.error(err.stack);
		});
	}

	_createClass(DataRecorder, [{
		key: 'initialize',
		value: function initialize() {
			var streamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_get(Object.getPrototypeOf(DataRecorder.prototype), 'initialize', this).call(this, streamParams);
			this.phrase.dimension = this.streamParams.frameSize;
		}
	}, {
		key: 'getRecordedPhrase',
		value: function getRecordedPhrase() {
			console.log(this.params.column_names);
			return this.phrase;
		}
	}]);

	return DataRecorder;
})(lfo.sinks.DataRecorder);

exports['default'] = DataRecorder;
module.exports = exports['default'];

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],4:[function(require,module,exports){
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

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],5:[function(require,module,exports){
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

},{"./lfo-pseudo-yin":7,"./lfo-resampler":9,"./lfo-resampler-experimental":8,"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-default":22,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],6:[function(require,module,exports){
// intensity : lfo returning an estimation of movement intensity (energy)
// uses derivation + integration to return to zero when there is no movement
// based on the intensity module developed by Fred Bevilacqua and Gael Dubus
// for the MusicBricks EU project

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

var _lfoDelta = require('./lfo-delta');

var _lfoDelta2 = _interopRequireDefault(_lfoDelta);

// internal class : the complete algorithm needs linear regression as derivation

var IntensityCore = (function (_lfo$core$BaseLfo) {
	_inherits(IntensityCore, _lfo$core$BaseLfo);

	function IntensityCore() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, IntensityCore);

		var defaults = {
			integrationFactor: 0.8,
			outputGain: 0.005
		};
		_get(Object.getPrototypeOf(IntensityCore.prototype), 'constructor', this).call(this, defaults, options);

		this.inputDims = 0;

		_get(Object.getPrototypeOf(IntensityCore.prototype), 'constructor', this).call(this, defaults, options);
	}

	//======================================================//
	//============= the real Intensity class ===============//
	//======================================================//

	_createClass(IntensityCore, [{
		key: 'initialize',
		value: function initialize() {
			var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			this.inputFrameSize = inStreamParams.frameSize;
			this.frameAccumulator = new Float32Array(this.inputFrameSize);

			outStreamParams.frameSize = 1;
			_get(Object.getPrototypeOf(IntensityCore.prototype), 'initialize', this).call(this, inStreamParams, outStreamParams);

			for (var i = 0; i < this.inputFrameSize; i++) {
				this.frameAccumulator[i] = 0;
			}
			//console.log(this.streamParams.frameSize + ' ' + this.inputFrameSize);
		}
	}, {
		key: 'process',
		value: function process(time, frame, metaData) {
			var factor = this.params.integrationFactor;
			var gain = this.params.outputGain;
			var inSize = this.inputFrameSize;
			var frameBuf = this.frameAccumulator;

			var outValue = 0;

			for (var i = 0; i < inSize; i++) {
				var sqi = frame[i] * frame[i];
				frameBuf[i] = sqi + frameBuf[i] * factor;

				// outValue += frameBuf[i] * gain;

				// see below : use sqrt instead of output gain
				outValue += frameBuf[i];
			}

			// this.outFrame[0] = outValue;

			// little mod : use sqrt instead of output gain
			// so that the algorithm is more similar to RMS computation
			// (sqrt'ed sum of squares)
			this.outFrame[0] = Math.sqrt(outValue);
			//console.log(outValue);
			this.output(time, this.outFrame, metaData);
		}
	}]);

	return IntensityCore;
})(lfo.core.BaseLfo);

var Intensity = (function (_lfo$core$BaseLfo2) {
	_inherits(Intensity, _lfo$core$BaseLfo2);

	function Intensity() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Intensity);

		var defaults = {};
		_get(Object.getPrototypeOf(Intensity.prototype), 'constructor', this).call(this, defaults, options);

		this.delta = new _lfoDelta2['default']({
			order: 3
		});

		this.intensity = new IntensityCore({});

		this.delta.connect(this.intensity);
	}

	_createClass(Intensity, [{
		key: 'initialize',
		value: function initialize() {
			var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			this.delta.initialize(inStreamParams, outStreamParams);
		}
	}, {
		key: 'connect',
		value: function connect(child) {
			this.intensity.children.push(child);
			child.parent = this.intensity;
		}
	}, {
		key: 'process',
		value: function process(time, frame, metaData) {
			this.delta.process(time, frame, metaData);
		}
	}]);

	return Intensity;
})(lfo.core.BaseLfo);

exports['default'] = Intensity;
module.exports = exports['default'];

},{"./lfo-delta":4,"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-default":22,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],7:[function(require,module,exports){
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
			// minInput: -360,
			// maxInput: 360,
			noiseThreshold: 0.1
		};
		_get(Object.getPrototypeOf(PseudoYin.prototype), "constructor", this).call(this, defaults, options);

		this.mean = 0;
		this.magnitude = 0;
		this.stdDev = 0;
		this.crossings = [];
		this.periodMean = 0;
		this.periodStdDev = 0;
		//this.inputRate = this.params.inputRate;
		this.noiseThreshold = this.params.noiseThreshold;

		//this.maxFreq = this.inputRate / 0.5;
	}

	_createClass(PseudoYin, [{
		key: "initialize",
		value: function initialize() {
			var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			outStreamParams.frameSize = this.params.frameSize;
			_get(Object.getPrototypeOf(PseudoYin.prototype), "initialize", this).call(this, inStreamParams, outStreamParams);
			console.log(this.streamParams.sourceSampleRate);

			// normalize frequency with maxFreq
			if (!this.streamParams.sourceSampleRate) {
				this.streamParams.sourceSampleRate = 10;
			}
			this.maxFreq = this.streamParams.sourceSampleRate * 0.5;

			// normalize periodicity with maxPeriod - minPeriod
			// minPeriod is 2 samples
			// maxPeriod is frameSize - 1
			// simplification : minPeriod = 0, maxPeriod = frameSize
			// => max mean = frameSize / 2
			// => max std dev = sqrt(2 * (framsize / 2) * (framesize / 2))
			//				  = sqrt(framesize * framesize * 0.5)
			//  			  = framesize * sqrt(0.5) < framesize

			/*
   super.initialize({
   	frameSize: this.params.frameSize
   });
   */
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
			// TODO : more tests to determine which mean (true mean or (max-min)/2) is the best
			//this.mean /= this.inputFrame.length;
			this.mean = min + (max - min) * 0.5;

			this.magnitude /= this.inputFrame.length;
			this.magnitude = Math.sqrt(this.magnitude);

			// compute signal stdDev and number of mean-crossings
			// descending mean crossing is used here
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

			this.amplitude = this.stdDev * 2.0; // empirical factor because we don't know a priori sensor range

			//this.frequency = Math.sqrt(this.crossings.length * 2.0 / this.inputFrame.length); // sqrt'ed normalized by nyquist freq
			this.frequency = this.crossings.length * 2.0 / this.inputFrame.length; // normalized by nyquist freq

			if (this.crossings.length > 2) {
				//let clip = this.periodStdDev * 5 / this.inputFrame.length;
				//clip = Math.min(clip, 1.);
				//this.periodicity = 1.0 - Math.sqrt(clip);

				this.periodicity = 1.0 - Math.sqrt(this.periodStdDev / this.inputFrame.length);
				//this.periodicity = 1.0 - Math.pow(this.periodStdDev / this.inputFrame.length, 0.7);
			} else {
					this.periodicity = 0;
				}

			// TODO : improve periodicity algorithm !!!
			this.outFrame[0] = this.amplitude;
			this.outFrame[1] = this.frequency;
			this.outFrame[2] = this.periodicity;
			this.output();
		}
	}]);

	return PseudoYin;
})(lfo.core.BaseLfo);

exports["default"] = PseudoYin;
module.exports = exports["default"];

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],8:[function(require,module,exports){
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

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],9:[function(require,module,exports){
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

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],10:[function(require,module,exports){
/*
 *	lfo-select : filters the output of previous lfo
 *	-----------------------------------------------
 *	you can plug any lfo into various lfo-selects to split its output
 * 	and visualize the splitted outputs in separate lfo-sinks for example
 */

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

var Select = (function (_lfo$core$BaseLfo) {
	_inherits(Select, _lfo$core$BaseLfo);

	function Select() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Select);

		var defaults = {
			indexList: [],
			mode: "include" // can be exclude or include
		};
		_get(Object.getPrototypeOf(Select.prototype), "constructor", this).call(this, defaults, options);

		// remove duplicate indices :
		var indexList = this.params.indexList;

		for (var i = 0; i < indexList.length - 1; i++) {
			for (var j = indexList.length - 1; j > i; j--) {
				if (indexList[i] == indexList[j]) {
					indexList.splice(j, 1);
				}
			}
		}
		//console.log(indexList);
	}

	_createClass(Select, [{
		key: "initialize",
		value: function initialize() {
			var streamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			this.inputFrameSize = streamParams.frameSize;
			this.streamParams.frameSize = this.inputFrameSize;
			if (this.params.mode === "exclude") {
				for (var i = this.params.indexList.length - 1; i >= 0; i--) {
					if (this.params.indexList[i] < this.inputFrameSize && this.params.indexList[i] >= 0) {
						this.streamParams.frameSize--;
					} else {
						this.params.indexList.splice(i, 1);
					}
				}
			} else if (this.params.mode === "include") {
				this.streamParams.frameSize = 0;
				for (var i = this.params.indexList.length - 1; i >= 0; i--) {
					if (this.params.indexList[i] < this.inputFrameSize && this.params.indexList[i] >= 0) {
						this.streamParams.frameSize++;
					} else {
						this.params.indexList.splice(i, 1);
					}
				}
			}
			_get(Object.getPrototypeOf(Select.prototype), "initialize", this).call(this, this.streamParams);
		}

		// QUESTION : are frame.length in process and streamParams.frameSize in initialize the same value ?
		// ot is streamParams here to allow specification of "columns" (or "rows", whatever ...) ?
		// just in case, let's keep this.params.inputFrameSize for comparison
		// in this case the tricky one should be lfo.slicer -> have another look at it

	}, {
		key: "process",
		value: function process(time, frame, metaData) {
			this.time = time;
			this.metaData = metaData;

			if (this.params.mode === "exclude") {
				// WRONG !!!
				// WRONG !!!
				// DO NOTHING FOR NOW ...
				/*
    for(let i=0, j=0; i<this.params.indexList.length; i++) {
    	// DO THE INVERSE !!! => loop on inputFrameSize (aka frame.length) and use indexOf !
    	if(this.params.indexList[i] < this.inputFrameSize) {
    		this.outFrame[j] = 0;//
    		j++;
    	}
    }
    */
				for (var i = 0; i < this.params.indexList.length; i++) {
					// fill with non-excluded indexes
				}
			} else if (this.params.mode === "include") {
					// RIGHT !!!
					for (var i = 0; i < this.params.indexList.length; i++) {
						this.outFrame[i] = 0; //
						i++;
					}
				} else {
					// pass averything through
					this.outFrame.set(frame, 0);
				}

			this.output();
		}
	}]);

	return Select;
})(lfo.core.BaseLfo);

exports["default"] = Select;
module.exports = exports["default"];

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],11:[function(require,module,exports){
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

var _xmmDecoderCommon = require('./xmm-decoder-common');

// TODO : add reset() function (empty likelihood_buffer)

//=================== THE EXPORTED CLASS ======================//

var XmmGmmDecoder = (function (_lfo$core$BaseLfo) {
	_inherits(XmmGmmDecoder, _lfo$core$BaseLfo);

	function XmmGmmDecoder() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, XmmGmmDecoder);

		var defaults = {
			likelihoodWindow: 5
		};
		_get(Object.getPrototypeOf(XmmGmmDecoder.prototype), 'constructor', this).call(this, defaults, options);

		this.model = undefined;
		this.modelResults = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
		// original xmm modelResults fields :
		// instantLikelihoods, instantNormalizedLikelihoods,
		// smoothedLikelihoods, smoothedNormalizedLikelihoods,
		// smoothedLogLikelihoods, likeliest, outputValues, outputVariance
	}

	_createClass(XmmGmmDecoder, [{
		key: 'process',

		//return('no estimation available');
		value: function process(time, frame, metaData) {

			//incoming frame is observation vector
			if (this.model === undefined) {
				console.log("no model loaded");
				return;
			}

			this.time = time;
			this.metaData = metaData;

			var outFrame = this.outFrame;

			(0, _xmmDecoderCommon.gmmLikelihoods)(frame, this.model, this.modelResults);
			//gmmLikelihoods(frame, this.model, this.modelResults);			

			for (var i = 0; i < this.model.models.length; i++) {
				outFrame[i] = this.modelResults.smoothed_normalized_likelihoods[i];
			}

			this.output();
		}
	}, {
		key: 'setModel',
		value: function setModel(model) {
			this.model = undefined;
			this.modelResults = undefined;

			// test if model is valid here (TODO : write a better test)
			if (model.models !== undefined) {
				this.model = model;
				var nmodels = model.models.length;
				this.modelResults = {
					instant_likelihoods: new Array(nmodels),
					smoothed_log_likelihoods: new Array(nmodels),
					smoothed_likelihoods: new Array(nmodels),
					instant_normalized_likelihoods: new Array(nmodels),
					smoothed_normalized_likelihoods: new Array(nmodels),
					likeliest: -1,
					singleClassGmmModelResults: []
				};

				for (var i = 0; i < model.models.length; i++) {

					this.modelResults.instant_likelihoods[i] = 0;
					this.modelResults.smoothed_log_likelihoods[i] = 0;
					this.modelResults.smoothed_likelihoods[i] = 0;
					this.modelResults.instant_normalized_likelihoods[i] = 0;
					this.modelResults.smoothed_normalized_likelihoods[i] = 0;

					var res = {};
					res.instant_likelihood = 0;
					res.log_likelihood = 0;
					res.likelihood_buffer = [];
					res.likelihood_buffer.length = this.likelihoodWindow;
					for (var j = 0; j < this.likelihoodWindow; j++) {
						res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
					}
					this.modelResults.singleClassGmmModelResults.push(res);
				}
			}

			this.initialize({ frameSize: this.model.models.length });
		}
	}, {
		key: 'setLikelihoodWindow',
		value: function setLikelihoodWindow(newWindowSize) {
			this.likelihoodWindow = newWindowSize;
			if (this.model === undefined) return;
			var res = this.modelResults.singleClassModelResults;
			for (var i = 0; i < this.model.models.length; i++) {
				res[i].likelihood_buffer = [];
				res[i].likelihood_buffer.length = this.likelihoodWindow;
				for (var j = 0; j < this.likelihoodWindow; j++) {
					res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
				}
			}
		}
	}, {
		key: 'setVarianceOffset',
		value: function setVarianceOffset() {
			// not used for now (need to implement updateInverseCovariance method)
		}
	}, {
		key: 'likeliestLabel',
		get: function get() {
			if (this.modelResults !== undefined) {
				if (this.modelResults.likeliest > -1) {
					return this.model.models[this.modelResults.likeliest].label;
				}
			}
			return 'unknown';
		}
	}]);

	return XmmGmmDecoder;
})(lfo.core.BaseLfo);

exports['default'] = XmmGmmDecoder;
;
module.exports = exports['default'];

},{"./xmm-decoder-common":13,"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],12:[function(require,module,exports){
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

var _xmmDecoderCommon = require('./xmm-decoder-common');

// simplified decoding algorithm :
//
// if(!forward_init)
// 		forward_init(obs);
// else
// 		forward_update(obs);
//
// for(model in models)
// 		model.updateAlphaWindow();
// 		model.updateResults();
//
// updateResults();

// A utiliser de xmm-decoder-common :
// - gaussianComponentLikelihood
// - gmmLikelihood (which uses gaussianComponentLikelihood)
// - not gmmLikelihoods, as it's the classifying part of GMM

// Which decoder parameters ?
// setLikelihoodWindow ?
// other smoothing windows ?
// exit probabilities ?
// ...

//===========================================================//

var XmmHhmmDecoder = (function (_lfo$core$BaseLfo) {
	_inherits(XmmHhmmDecoder, _lfo$core$BaseLfo);

	function XmmHhmmDecoder() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, XmmHhmmDecoder);

		var defaults = {
			likelihoodWindow: 5
		};
		_get(Object.getPrototypeOf(XmmHhmmDecoder.prototype), 'constructor', this).call(this, defaults, options);

		this.model = undefined;
		this.modelResults = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
	}

	/*
 	setLikelihoodWindow(newWindowSize) {
 		this.likelihoodWindow = newWindowSize;
 		if(this.model === undefined) return;
 		let res = this.modelResults.singleClassModelResults;
 		for(let i=0; i<this.model.models.length; i++) {
 			res[i].likelihood_buffer = [];
 			res[i].likelihood_buffer.length = this.likelihoodWindow;
 			for(let j=0; j<this.likelihoodWindow; j++) {
 				res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
 			}
 		}
 	}
 
 	setVarianceOffset() {
 		// not used for now (need to implement updateInverseCovariance method).
 		// now accessible as training parameter of the child process.
 	}
 
 //*/

	_createClass(XmmHhmmDecoder, [{
		key: 'process',

		//return('no estimation available');

		//================ process frame =================//

		value: function process(time, frame, metaData) {

			//incoming frame is observation vector
			if (this.model === undefined || this.modelResults === undefined) {
				//console.log("no model loaded");
				return;
			}

			//--------------------------------------------//

			this.time = time;
			this.metaData = metaData;

			var outFrame = this.outFrame;

			if (this.forward_initialized) {
				this.forwardUpdate(frame);
			} else {
				this.forwardInit(frame);
			}

			// for(let i=0; i<this.modelResults.singleClassHmmModelResults.length; i++) {
			// 		console.log(this.modelResults.singleClassHmmModelResults[i].alpha_h[0][0]);
			// }

			for (var i = 0; i < this.model.models.length; i++) {
				(0, _xmmDecoderCommon.hmmUpdateAlphaWindow)(this.model.models[i], this.modelResults.singleClassHmmModelResults[i]);
				(0, _xmmDecoderCommon.hmmUpdateResults)(this.model.models[i], this.modelResults.singleClassHmmModelResults[i]);
			}

			this.updateResults();

			for (var i = 0; i < this.model.models.length; i++) {
				outFrame[i] = this.modelResults.smoothed_normalized_likelihoods[i];
			}

			this.output();
		}

		//==================================================================//
		//====================== load model from json ======================//
		//==================================================================//

	}, {
		key: 'setModel',
		value: function setModel(model) {

			this.model = undefined;
			this.modelResults = undefined;

			// test if model is valid here (TODO : write a better test)
			if (model.models !== undefined) {

				console.log(model);

				this.model = model;
				var nmodels = model.models.length;

				var nstatesGlobal = model.configuration.default_parameters.states;
				this.params.frameSize = nstatesGlobal;

				// this.prior = new Array(nmodels);
				// this.exit_transition = new Array(nmodels);
				// this.transition = new Array(nmodels);
				// for(let i=0; i<nmodels; i++) {
				// 	this.transition[i] = new Array(nmodels);
				// }
				this.frontier_v1 = new Array(nmodels);
				this.frontier_v2 = new Array(nmodels);
				this.forward_initialized = false;
				//this.results = {};

				this.modelResults = {
					instant_likelihoods: new Array(nmodels),
					smoothed_log_likelihoods: new Array(nmodels),
					smoothed_likelihoods: new Array(nmodels),
					instant_normalized_likelihoods: new Array(nmodels),
					smoothed_normalized_likelihoods: new Array(nmodels),
					likeliest: -1,
					singleClassHmmModelResults: []
				};

				for (var i = 0; i < nmodels; i++) {

					this.modelResults.instant_likelihoods[i] = 0;
					this.modelResults.smoothed_log_likelihoods[i] = 0;
					this.modelResults.smoothed_likelihoods[i] = 0;
					this.modelResults.instant_normalized_likelihoods[i] = 0;
					this.modelResults.smoothed_normalized_likelihoods[i] = 0;

					var nstates = this.model.models[i].parameters.states;

					var alpha_h = new Array(3);
					for (var j = 0; j < 3; j++) {
						alpha_h[j] = new Array(nstates);
						for (var k = 0; k < nstates; k++) {
							alpha_h[j][k] = 0;
						}
					}

					var hmmRes = {
						instant_likelihood: 0,
						log_likelihood: 0,
						likelihood_buffer: [],
						progress: 0,

						// never used ? -> check xmm cpp
						exit_likelihood: 0,
						exit_ratio: 0,

						likeliest_state: -1,

						//alpha: new Array(nstates), 	// for non-hierarchical
						alpha_h: alpha_h, // for hierarchical
						prior: new Array(nstates),
						transition: new Array(nstates),

						// used in hmmUpdateAlphaWindow
						window_minindex: 0,
						window_maxindex: 0,
						window_normalization_constant: 0,

						singleClassGmmModelResults: [] // states
					};

					// ADD INDIVIDUAL STATES (GMMs)
					for (var j = 0; j < nstates; j++) {
						var gmmRes = {
							instant_likelihood: 0
						};

						// log_likelihood: 0,
						// TODO : add same fields as in GmmDecoder ????
						hmmRes.singleClassGmmModelResults.push(gmmRes);
					}

					this.modelResults.singleClassHmmModelResults.push(hmmRes);
				}
			}

			//this.streamParams.frameSize = this.model.models.length;
			this.initialize({ frameSize: this.model.models.length });
			//console.log(this.streamParams.frameSize);
			//console.log(this.modelResults);
		}

		//============================ RESET ==============================//

	}, {
		key: 'reset',
		value: function reset() {
			this.forward_initialized = false;
		}

		//==================================================================//
		//========================= FORWARD INIT ===========================//
		//==================================================================//

	}, {
		key: 'forwardInit',
		value: function forwardInit(observation) {
			var norm_const = 0;
			//let modelIndex = 0;

			//================= INITIALIZE ALPHA VARIABLES =================//

			for (var i = 0; i < this.model.models.length; i++) {

				var m = this.model.models[i];
				var nstates = m.parameters.states;
				var mRes = this.modelResults.singleClassHmmModelResults[i];

				for (var j = 0; j < 3; j++) {
					mRes.alpha_h[j] = new Array(nstates);
					for (var k = 0; k < nstates; k++) {
						mRes.alpha_h[j][k] = 0;
					}
				}

				if (m.parameters.transition_mode == 0) {
					////////////////////// ergodic
					for (var k = 0; k < nstates; k++) {
						mRes.alpha_h[0][k] = mRes.prior[k] * (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[k], mRes.singleClassGmmModelResults[k]); // see how obsProb is implemented
						mRes.instant_likelihood += mRes.alpha[0][k];
					}
				} else {
					///////////////////////////////////////////////////// left-right
					mRes.alpha_h[0][0] = this.model.prior[i];
					mRes.alpha_h[0][0] *= (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[0], mRes.singleClassGmmModelResults[0]);
					mRes.instant_likelihood = mRes.alpha_h[0][0];
				}
				norm_const += mRes.instant_likelihood;
			}

			//================== NORMALIZE ALPHA VARIABLES =================//

			for (var i = 0; i < this.model.models.length; i++) {

				var nstates = this.model.models[i].parameters.states;
				for (var e = 0; e < 3; e++) {
					for (var k = 0; k < nstates; k++) {
						this.modelResults.singleClassHmmModelResults[i].alpha_h[e][k] /= norm_const;
					}
				}
			}

			this.forward_initialized = true;
		}

		//==================================================================//
		//======================== FORWARD UPDATE ==========================//
		//==================================================================//

	}, {
		key: 'forwardUpdate',
		value: function forwardUpdate(observation) {
			var norm_const = 0;
			var tmp = 0;
			var front = undefined; // array

			var nmodels = this.model.models.length;

			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(1, this.frontier_v1, this.model, this.modelResults);
			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(2, this.frontier_v2, this.model, this.modelResults);

			// let num_classes =
			// let dstModelIndex = 0;

			for (var i = 0; i < nmodels; i++) {

				var m = this.model.models[i];
				var nstates = m.parameters.states;
				var mRes = this.modelResults.singleClassHmmModelResults[i];

				//============= COMPUTE FRONTIER VARIABLE ============//

				front = new Array(nstates);
				for (var j = 0; j < nstates; j++) {
					front[j] = 0;
				}

				if (m.parameters.transition_mode == 0) {
					////////////////////// ergodic
					for (var k = 0; k < nstates; k++) {
						for (var j = 0; j < nstates; j++) {
							front[k] += m.transition[j * nstates + k] / (1 - m.exitProbabilities[j]) * mRes.alpha_h[0][j];
						}
						for (var srci = 0; srci < nmodels; srci++) {
							front[k] += mRes.prior[k] * (this.frontier_v1[srci] * this.model.transition[srci][i] + this.model.prior[i] * this.frontier_v2[srci]);
						}
					}
				} else {
					//////////////////////////////////////////////////// left-right

					// k == 0 : first state of the primitive
					front[0] = m.transition[0] * mRes.alpha_h[0][0];

					for (var srci = 0; srci < this.model.models.length; srci++) {
						front[0] += this.frontier_v1[srci] * this.model.transition[srci][i] + this.model.prior[i] * this.frontier_v2[srci];
					}

					// k > 0 : rest of the primitive
					for (var k = 1; k < nstates; k++) {
						front[k] += m.transition[k * 2] / (1 - m.exitProbabilities[k]) * mRes.alpha_h[0][k];
						front[k] += m.transition[(k - 1) * 2 + 1] / (1 - m.exitProbabilities[k - 1]) * mRes.alpha_h[0][k - 1];
					}

					for (var j = 0; j < 3; j++) {
						for (var k = 0; k < nstates; k++) {
							mRes.alpha_h[j][k] = 0;
						}
					}
				}

				//console.log(front);

				//============== UPDATE FORWARD VARIABLE =============//

				mRes.exit_likelihood = 0;
				mRes.instant_likelihood = 0;

				for (var k = 0; k < nstates; k++) {
					tmp = (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[k], mRes.singleClassGmmModelResults[k]) * front[k];

					mRes.alpha_h[2][k] = this.model.exit_transition[i] * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[1][k] = (1 - this.model.exit_transition[i]) * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[0][k] = (1 - m.exitProbabilities[k]) * tmp;

					mRes.exit_likelihood += mRes.alpha_h[1][k] + mRes.alpha_h[2][k];
					mRes.instant_likelihood += mRes.alpha_h[0][k] + mRes.alpha_h[1][k] + mRes.alpha_h[2][k];

					norm_const += tmp;
				}

				mRes.exit_ratio = mRes.exit_likelihood / mRes.instant_likelihood;
			}

			//============== NORMALIZE ALPHA VARIABLES =============//

			for (var i = 0; i < nmodels; i++) {
				for (var e = 0; e < 3; e++) {
					for (var k = 0; k < this.model.models[i].parameters.states; k++) {
						this.modelResults.singleClassHmmModelResults[i].alpha_h[e][k] /= norm_const;
					}
				}
			}
		}

		//====================== UPDATE RESULTS ====================//

	}, {
		key: 'updateResults',
		value: function updateResults() {
			var maxlog_likelihood = 0;
			var normconst_instant = 0;
			var normconst_smoothed = 0;

			var res = this.modelResults;

			for (var i = 0; i < this.model.models.length; i++) {

				var hmmRes = res.singleClassHmmModelResults[i];

				res.instant_likelihoods[i] = hmmRes.instant_likelihood;
				res.smoothed_log_likelihoods[i] = hmmRes.log_likelihood;
				res.smoothed_likelihoods[i] = Math.exp(res.smoothed_log_likelihoods[i]);

				res.instant_normalized_likelihoods[i] = res.instant_likelihoods[i];
				res.smoothed_normalized_likelihoods[i] = res.smoothed_likelihoods[i];

				normconst_instant += res.instant_normalized_likelihoods[i];
				normconst_smoothed += res.smoothed_normalized_likelihoods[i];

				if (i == 0 || res.smoothed_log_likelihoods[i] > maxlog_likelihood) {
					maxlog_likelihood = res.smoothed_log_likelihoods[i];
					res.likeliest = i;
				}
			}

			for (var i = 0; i < this.model.models.length; i++) {
				res.instant_normalized_likelihoods[i] /= normconst_instant;
				res.smoothed_normalized_likelihoods[i] /= normconst_smoothed;
			}
		}
	}, {
		key: 'likeliestLabel',
		get: function get() {
			if (this.modelResults !== undefined) {
				if (this.modelResults.likeliest > -1) {
					return this.model.models[this.modelResults.likeliest].label;
				}
			}
			return 'unknown';
		}
	}]);

	return XmmHhmmDecoder;
})(lfo.core.BaseLfo);

exports['default'] = XmmHhmmDecoder;
module.exports = exports['default'];

},{"./xmm-decoder-common":13,"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],13:[function(require,module,exports){
/*
 *	xmm decoder
 *	js port of the decoding part of XMM
 *	allows to filter input data from trained models
 * 	the training hes to be done with the XMM C++ library
 */

// NOTE : the models and modelResults must follow a precise document structure :
// 	- 	models should work as exported by XMM (JSON)
//	- 	modelResults replace the variables that normally exist in the cpp classes, which are needed for the decoding.
//		modelResults (in the case of HMMs), contains the array singleClassHmmModelResults, each element of which
//		contains an array of singleClassGmmModelResults (the HMM states).
//		see the decoder lfops for implementation.

// ================================= //
//    as in xmmHmmSingleClass.cpp    //
// ================================= //

"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var hmmUpdateAlphaWindow = function hmmUpdateAlphaWindow(singleClassHmmModel, singleClassHmmModelResults) {
	var m = singleClassHmmModel;
	var res = singleClassHmmModelResults;

	var nstates = m.parameters.states;

	res.likeliest_state = 0;
	var best_alpha = res.alpha_h[0][0] + res.alpha_h[1][0];
	for (var i = 1; i < nstates; i++) {
		if (res.alpha_h[0][i] + res.alpha_h[1][i] > best_alpha) {
			best_alpha = res.alpha_h[0][i] + res.alpha_h[1][i];
			res.likeliest_state = i;
		}
	}

	res.window_minindex = res.likeliest_state - nstates / 2;
	res.window_maxindex = res.likeliest_state + nstates / 2;
	res.window_minindex = res.window_minindex >= 0 ? res.window_minindex : 0;
	res.window_maxindex = res.window_maxindex <= nstates ? res.window_maxindex : nstates;
	res.window_normalization_constant = 0;
	for (var i = res.window_minindex; i < res.window_maxindex; i++) {
		res.window_normalization_constant += res.alpha_h[0][i] + res.alpha_h[1][i];
	}
};

exports.hmmUpdateAlphaWindow = hmmUpdateAlphaWindow;
var hmmUpdateResults = function hmmUpdateResults(singleClassHmmModel, singleClassHmmModelResults) {
	var m = singleClassHmmModel;
	var res = singleClassHmmModelResults;

	// IS THIS CORRECT  ? CHECK !
	res.likelihood_buffer.push(Math.log(res.instant_likelihood));
	res.log_likelihood = 0;
	var bufSize = res.likelihood_buffer.length;
	for (var i = 0; i < bufSize; i++) {
		res.log_likelihood += res.likelihood_buffer[i];
	}
	res.log_likelihood /= bufSize;

	res.progress = 0;
	for (var i = res.window_minindex; i < res.window_maxindex; i++) {
		res.progress += (res.alpha_h[0][i] + res.alpha_h[1][i] + res.alpha_h[2][i]) * i / res.window_normalization_constant;
	}
	res.progress /= m.parameters.states - 1;
};

exports.hmmUpdateResults = hmmUpdateResults;
// ================================= //
//   as in xmmHierarchicalHmm.cpp    //
// ================================= //

var hhmmLikelihoodAlpha = function hhmmLikelihoodAlpha(exitNum, likelihoodVector, hhmmModel, hhmmModelResults) {
	var m = hhmmModel;
	var res = hhmmModelResults;

	if (exitNum < 0) {
		//let l = 0;
		for (var i = 0; i < m.models.length; i++) {
			likelihoodVector[i] = 0;
			for (var exit = 0; exit < 3; exit++) {
				for (var k = 0; k < m.models[i].parameters.states; k++) {
					likelihoodVector[i] += res.singleClassHmmModelResults[i].alpha_h[exit][k];
				}
			}
		}
	} else {
		for (var i = 0; i < m.models.length; i++) {
			likelihoodVector[i] = 0;
			for (var k = 0; k < m.models[i].parameters.states; k++) {
				likelihoodVector[i] += res.singleClassHmmModelResults[i].alpha_h[exitNum][k];
			}
		}
	}
};

exports.hhmmLikelihoodAlpha = hhmmLikelihoodAlpha;
//============================================================================//

// get the inverse_covariances matrix of each of the GMM classes
// for each input data, compute the distance of the frame to each of the GMMs
// with the following equations :

// ================================= //
// as in xmmGaussianDistribution.cpp //
// ================================= //

var gaussianComponentLikelihood = function gaussianComponentLikelihood(observation, gaussianComponent) {
	var component = gaussianComponent;
	var euclidianDistance = 0.0;
	for (var l = 0; l < component.dimension; l++) {
		var tmp = 0.0;
		for (var k = 0; k < component.dimension; k++) {
			tmp += component.inverse_covariance[l * component.dimension + k] * (observation[k] - component.mean[k]);
		}
		euclidianDistance += (observation[l] - component.mean[l]) * tmp;
	}
	var p = Math.exp(-0.5 * euclidianDistance) / Math.sqrt(component.covariance_determinant * Math.pow(2 * Math.PI, component.dimension));

	if (p < 1e-180 || isNaN(p) || isNaN(Math.abs(p))) {
		p = 1e-180;
	}
	return p;
};

exports.gaussianComponentLikelihood = gaussianComponentLikelihood;
// ================================= //
//    as in xmmGmmSingleClass.cpp    //
// ================================= //

// -> in obsProb, called from likelihood, called from filter, called from GMM::filter
// TODO : decompose in a similar way to XMM cpp to be able to use obsProb

var gmmLikelihood = function gmmLikelihood(observation, singleClassGmmModel) {
	var singleClassGmmModelResults = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var coeffs = singleClassGmmModel.mixture_coeffs;
	//console.log(coeffs);
	//if(coeffs === undefined) coeffs = [1];
	var components = singleClassGmmModel.components;
	//let res = singleClassGmmModelResults;
	var p = 0;

	for (var c = 0; c < coeffs.length; c++) {
		p += coeffs[c] * gaussianComponentLikelihood(observation, components[c]);
	}

	//res.instant_likelihood = p;

	// as in xmmGmmSingleClass::updateResults() :
	// => moved to gmmLikelihoods() so that this function looks more like obsProb
	/*
 res.likelihood_buffer.unshift(p);
 res.likelihood_buffer.length--;
 res.log_likelihood = res.likelihood_buffer.reduce((a, b) => a + b, 0); // sum of all array values
 res.log_likelihood /= res.likelihood_buffer.length;
 //*/

	return p;
};

exports.gmmLikelihood = gmmLikelihood;
// ================================= //
//          as in xmmGmm.cpp         //
// ================================= //

var gmmLikelihoods = function gmmLikelihoods(observation, gmmModel, gmmModelResults) {
	var likelihoods = [];
	var models = gmmModel.models;
	var res = gmmModelResults;

	var maxLogLikelihood = 0;
	var normConstInstant = 0;
	var normConstSmoothed = 0;

	for (var i = 0; i < models.length; i++) {

		var singleRes = res.singleClassGmmModelResults[i];
		singleRes.instant_likelihood = gmmLikelihood(observation, models[i], singleRes);

		// as in xmmGmmSingleClass::updateResults() (moved from gmmLikelihood) :
		singleRes.likelihood_buffer.unshift(singleRes.instant_likelihood);
		singleRes.likelihood_buffer.length--;
		singleRes.log_likelihood = singleRes.likelihood_buffer.reduce(function (a, b) {
			return a + b;
		}, 0); // sum of all array values
		singleRes.log_likelihood /= singleRes.likelihood_buffer.length;

		res.instant_likelihoods[i] = singleRes.instant_likelihood;
		res.smoothed_log_likelihoods[i] = singleRes.log_likelihood;
		res.smoothed_likelihoods[i] = Math.exp(res.smoothed_log_likelihoods[i]);
		res.instant_normalized_likelihoods[i] = res.instant_likelihoods[i];
		res.smoothed_normalized_likelihoods[i] = res.smoothed_likelihoods[i];

		normConstInstant += res.instant_normalized_likelihoods[i];
		normConstSmoothed += res.smoothed_normalized_likelihoods[i];

		if (i == 0 || res.smoothed_log_likelihoods[i] > maxLogLikelihood) {
			maxLogLikelihood = res.smoothed_log_likelihoods[i];
			res.likeliest = i;
		}
	}

	for (var i = 0; i < models.length; i++) {

		res.instant_normalized_likelihoods[i] /= normConstInstant;
		res.smoothed_normalized_likelihoods[i] /= normConstSmoothed;
	}
};

exports.gmmLikelihoods = gmmLikelihoods;
//============================================================================//

// DO WE REALLY NEED THIS ?

/*
class XmmSingleClassGmm {
	constructor(options = {}) {
		const defaults = {
			likelihoodWindow: 5,
		};
		super(defaults, options);

		this.model = undefined;
		this.results = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
	}

	setModel(model) {
		this.model = undefined;
		this.results = undefined;

		// test if model is valid here (TODO : write a better test)
		if(model !== undefined) {
			this.model = model;
			let nmodels = model.models.length;
			this.results = {
				instant_likelihood: new Array(nmodels),
				log_likelihood: new Array(nmodels),
				likelihood_buffer: new Array(nmodels),
				instant_normalized_likelihoods: new Array(nmodels),
				smoothed_normalized_likelihoods: new Array(nmodels),
				likeliest: -1,
				singleClassModelResults: []
			};

			for(let i=0; i<nmodels; i++) {

				this.results.instant_likelihoods[i] = 0;
				this.results.smoothed_log_likelihoods[i] = 0;
				this.results.smoothed_likelihoods[i] = 0;
				this.results.instant_normalized_likelihoods[i] = 0;
				this.results.smoothed_normalized_likelihoods[i] = 0;

				let res = {};
				res.instant_likelihood = 0;
				res.log_likelihood = 0;
				res.likelihood_buffer = [];
				res.likelihood_buffer.length = this.likelihoodWindow;
				for(let j=0; j<this.likelihoodWindow; j++) {
					res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
				}
				this.results.singleClassModelResults.push(res);
			}
		}

		this.initialize({ frameSize: this.model.models.length });
	}

	likelihood(observation) {

	}

	// etc ...
}

class XmmSingleClassHmm {
	constructor(options = {}) {
		this.alpha_h = new Array(3);
		for(let i=0; i<3; i++) {
			alpha_h[i] = [];
		}

		this.prior = [];
		this.states = []; // these are XmmSingleClassGmm's

		this.results = {
			instant_likelihood: 0
		};

		this.forward_initialized = false;
		//this.previous_alpha = 
	}

	// ETC
}

*/

},{}],14:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/create"), __esModule: true };
},{"core-js/library/fn/object/create":27}],15:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/define-property"), __esModule: true };
},{"core-js/library/fn/object/define-property":28}],16:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-own-property-descriptor"), __esModule: true };
},{"core-js/library/fn/object/get-own-property-descriptor":29}],17:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/set-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/set-prototype-of":30}],18:[function(require,module,exports){
"use strict";

exports["default"] = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

exports.__esModule = true;
},{}],19:[function(require,module,exports){
"use strict";

var _Object$defineProperty = require("babel-runtime/core-js/object/define-property")["default"];

exports["default"] = (function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      _Object$defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
})();

exports.__esModule = true;
},{"babel-runtime/core-js/object/define-property":15}],20:[function(require,module,exports){
"use strict";

var _Object$getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor")["default"];

exports["default"] = function get(_x, _x2, _x3) {
  var _again = true;

  _function: while (_again) {
    var object = _x,
        property = _x2,
        receiver = _x3;
    _again = false;
    if (object === null) object = Function.prototype;

    var desc = _Object$getOwnPropertyDescriptor(object, property);

    if (desc === undefined) {
      var parent = Object.getPrototypeOf(object);

      if (parent === null) {
        return undefined;
      } else {
        _x = parent;
        _x2 = property;
        _x3 = receiver;
        _again = true;
        desc = parent = undefined;
        continue _function;
      }
    } else if ("value" in desc) {
      return desc.value;
    } else {
      var getter = desc.get;

      if (getter === undefined) {
        return undefined;
      }

      return getter.call(receiver);
    }
  }
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/get-own-property-descriptor":16}],21:[function(require,module,exports){
"use strict";

var _Object$create = require("babel-runtime/core-js/object/create")["default"];

var _Object$setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of")["default"];

exports["default"] = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = _Object$create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

exports.__esModule = true;
},{"babel-runtime/core-js/object/create":14,"babel-runtime/core-js/object/set-prototype-of":17}],22:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
};

exports.__esModule = true;
},{}],23:[function(require,module,exports){
"use strict";

exports["default"] = function (obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key];
      }
    }

    newObj["default"] = obj;
    return newObj;
  }
};

exports.__esModule = true;
},{}],24:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],25:[function(require,module,exports){
(function (global){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')
var isArray = require('isarray')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192 // not used by this implementation

var rootParent = {}

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Safari 5-7 lacks support for changing the `Object.prototype.constructor` property
 *     on objects.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

function typedArraySupport () {
  function Bar () {}
  try {
    var arr = new Uint8Array(1)
    arr.foo = function () { return 42 }
    arr.constructor = Bar
    return arr.foo() === 42 && // typed array instances can be augmented
        arr.constructor === Bar && // constructor can be set
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (arg) {
  if (!(this instanceof Buffer)) {
    // Avoid going through an ArgumentsAdaptorTrampoline in the common case.
    if (arguments.length > 1) return new Buffer(arg, arguments[1])
    return new Buffer(arg)
  }

  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    this.length = 0
    this.parent = undefined
  }

  // Common case.
  if (typeof arg === 'number') {
    return fromNumber(this, arg)
  }

  // Slightly less common case.
  if (typeof arg === 'string') {
    return fromString(this, arg, arguments.length > 1 ? arguments[1] : 'utf8')
  }

  // Unusual.
  return fromObject(this, arg)
}

function fromNumber (that, length) {
  that = allocate(that, length < 0 ? 0 : checked(length) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < length; i++) {
      that[i] = 0
    }
  }
  return that
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') encoding = 'utf8'

  // Assumption: byteLength() return value is always < kMaxLength.
  var length = byteLength(string, encoding) | 0
  that = allocate(that, length)

  that.write(string, encoding)
  return that
}

function fromObject (that, object) {
  if (Buffer.isBuffer(object)) return fromBuffer(that, object)

  if (isArray(object)) return fromArray(that, object)

  if (object == null) {
    throw new TypeError('must start with number, buffer, array or string')
  }

  if (typeof ArrayBuffer !== 'undefined') {
    if (object.buffer instanceof ArrayBuffer) {
      return fromTypedArray(that, object)
    }
    if (object instanceof ArrayBuffer) {
      return fromArrayBuffer(that, object)
    }
  }

  if (object.length) return fromArrayLike(that, object)

  return fromJsonObject(that, object)
}

function fromBuffer (that, buffer) {
  var length = checked(buffer.length) | 0
  that = allocate(that, length)
  buffer.copy(that, 0, 0, length)
  return that
}

function fromArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Duplicate of fromArray() to keep fromArray() monomorphic.
function fromTypedArray (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  // Truncating the elements is probably not what people expect from typed
  // arrays with BYTES_PER_ELEMENT > 1 but it's compatible with the behavior
  // of the old Buffer constructor.
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    array.byteLength
    that = Buffer._augment(new Uint8Array(array))
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromTypedArray(that, new Uint8Array(array))
  }
  return that
}

function fromArrayLike (that, array) {
  var length = checked(array.length) | 0
  that = allocate(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

// Deserialize { type: 'Buffer', data: [1,2,3,...] } into a Buffer object.
// Returns a zero-length buffer for inputs that don't conform to the spec.
function fromJsonObject (that, object) {
  var array
  var length = 0

  if (object.type === 'Buffer' && isArray(object.data)) {
    array = object.data
    length = checked(array.length) | 0
  }
  that = allocate(that, length)

  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
} else {
  // pre-set for values that may exist in the future
  Buffer.prototype.length = undefined
  Buffer.prototype.parent = undefined
}

function allocate (that, length) {
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = Buffer._augment(new Uint8Array(length))
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that.length = length
    that._isBuffer = true
  }

  var fromPool = length !== 0 && length <= Buffer.poolSize >>> 1
  if (fromPool) that.parent = rootParent

  return that
}

function checked (length) {
  // Note: cannot use `length < kMaxLength` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (subject, encoding) {
  if (!(this instanceof SlowBuffer)) return new SlowBuffer(subject, encoding)

  var buf = new Buffer(subject, encoding)
  delete buf.parent
  return buf
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  var i = 0
  var len = Math.min(x, y)
  while (i < len) {
    if (a[i] !== b[i]) break

    ++i
  }

  if (i !== len) {
    x = a[i]
    y = b[i]
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) throw new TypeError('list argument must be an Array of Buffers.')

  if (list.length === 0) {
    return new Buffer(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; i++) {
      length += list[i].length
    }
  }

  var buf = new Buffer(length)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

function byteLength (string, encoding) {
  if (typeof string !== 'string') string = '' + string

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'binary':
      // Deprecated
      case 'raw':
      case 'raws':
        return len
      case 'utf8':
      case 'utf-8':
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  start = start | 0
  end = end === undefined || end === Infinity ? this.length : end | 0

  if (!encoding) encoding = 'utf8'
  if (start < 0) start = 0
  if (end > this.length) end = this.length
  if (end <= start) return ''

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'binary':
        return binarySlice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return 0
  return Buffer.compare(this, b)
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset) {
  if (byteOffset > 0x7fffffff) byteOffset = 0x7fffffff
  else if (byteOffset < -0x80000000) byteOffset = -0x80000000
  byteOffset >>= 0

  if (this.length === 0) return -1
  if (byteOffset >= this.length) return -1

  // Negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = Math.max(this.length + byteOffset, 0)

  if (typeof val === 'string') {
    if (val.length === 0) return -1 // special case: looking for empty string always fails
    return String.prototype.indexOf.call(this, val, byteOffset)
  }
  if (Buffer.isBuffer(val)) {
    return arrayIndexOf(this, val, byteOffset)
  }
  if (typeof val === 'number') {
    if (Buffer.TYPED_ARRAY_SUPPORT && Uint8Array.prototype.indexOf === 'function') {
      return Uint8Array.prototype.indexOf.call(this, val, byteOffset)
    }
    return arrayIndexOf(this, [ val ], byteOffset)
  }

  function arrayIndexOf (arr, val, byteOffset) {
    var foundIndex = -1
    for (var i = 0; byteOffset + i < arr.length; i++) {
      if (arr[byteOffset + i] === val[foundIndex === -1 ? 0 : i - foundIndex]) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === val.length) return byteOffset + foundIndex
      } else {
        foundIndex = -1
      }
    }
    return -1
  }

  throw new TypeError('val must be string, number or Buffer')
}

// `get` is deprecated
Buffer.prototype.get = function get (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` is deprecated
Buffer.prototype.set = function set (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new Error('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) throw new Error('Invalid hex string')
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function binaryWrite (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    var swap = encoding
    encoding = offset
    offset = length | 0
    length = swap
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'binary':
        return binaryWrite(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function binarySlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
  }

  if (newBuf.length) newBuf.parent = this.parent || this

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('buffer must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkInt(this, value, offset, byteLength, Math.pow(2, 8 * byteLength), 0)

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; i++) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; i++) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = value < 0 ? 1 : 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (value > max || value < min) throw new RangeError('value is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('index out of range')
  if (offset < 0) throw new RangeError('index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; i--) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; i++) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    target._set(this.subarray(start, start + len), targetStart)
  }

  return len
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function fill (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (end < start) throw new RangeError('end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  if (start < 0 || start >= this.length) throw new RangeError('start out of bounds')
  if (end < 0 || end > this.length) throw new RangeError('end out of bounds')

  var i
  if (typeof value === 'number') {
    for (i = start; i < end; i++) {
      this[i] = value
    }
  } else {
    var bytes = utf8ToBytes(value.toString())
    var len = bytes.length
    for (i = start; i < end; i++) {
      this[i] = bytes[i % len]
    }
  }

  return this
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function toArrayBuffer () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1) {
        buf[i] = this[i]
      }
      return buf.buffer
    }
  } else {
    throw new TypeError('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function _augment (arr) {
  arr.constructor = Buffer
  arr._isBuffer = true

  // save reference to original Uint8Array set method before overwriting
  arr._set = arr.set

  // deprecated
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.equals = BP.equals
  arr.compare = BP.compare
  arr.indexOf = BP.indexOf
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUIntLE = BP.readUIntLE
  arr.readUIntBE = BP.readUIntBE
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readIntLE = BP.readIntLE
  arr.readIntBE = BP.readIntBE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUIntLE = BP.writeUIntLE
  arr.writeUIntBE = BP.writeUIntBE
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeIntLE = BP.writeIntLE
  arr.writeIntBE = BP.writeIntBE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; i++) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"base64-js":24,"ieee754":48,"isarray":26}],26:[function(require,module,exports){
var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};

},{}],27:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function create(P, D){
  return $.create(P, D);
};
},{"../../modules/$":42}],28:[function(require,module,exports){
var $ = require('../../modules/$');
module.exports = function defineProperty(it, key, desc){
  return $.setDesc(it, key, desc);
};
},{"../../modules/$":42}],29:[function(require,module,exports){
var $ = require('../../modules/$');
require('../../modules/es6.object.get-own-property-descriptor');
module.exports = function getOwnPropertyDescriptor(it, key){
  return $.getDesc(it, key);
};
},{"../../modules/$":42,"../../modules/es6.object.get-own-property-descriptor":46}],30:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/$.core').Object.setPrototypeOf;
},{"../../modules/$.core":34,"../../modules/es6.object.set-prototype-of":47}],31:[function(require,module,exports){
module.exports = function(it){
  if(typeof it != 'function')throw TypeError(it + ' is not a function!');
  return it;
};
},{}],32:[function(require,module,exports){
var isObject = require('./$.is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./$.is-object":41}],33:[function(require,module,exports){
var toString = {}.toString;

module.exports = function(it){
  return toString.call(it).slice(8, -1);
};
},{}],34:[function(require,module,exports){
var core = module.exports = {version: '1.2.6'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],35:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./$.a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./$.a-function":31}],36:[function(require,module,exports){
// 7.2.1 RequireObjectCoercible(argument)
module.exports = function(it){
  if(it == undefined)throw TypeError("Can't call method on  " + it);
  return it;
};
},{}],37:[function(require,module,exports){
var global    = require('./$.global')
  , core      = require('./$.core')
  , ctx       = require('./$.ctx')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && key in target;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(param){
        return this instanceof C ? new C(param) : C(param);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    if(IS_PROTO)(exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
  }
};
// type bitmap
$export.F = 1;  // forced
$export.G = 2;  // global
$export.S = 4;  // static
$export.P = 8;  // proto
$export.B = 16; // bind
$export.W = 32; // wrap
module.exports = $export;
},{"./$.core":34,"./$.ctx":35,"./$.global":39}],38:[function(require,module,exports){
module.exports = function(exec){
  try {
    return !!exec();
  } catch(e){
    return true;
  }
};
},{}],39:[function(require,module,exports){
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
if(typeof __g == 'number')__g = global; // eslint-disable-line no-undef
},{}],40:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./$.cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./$.cof":33}],41:[function(require,module,exports){
module.exports = function(it){
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};
},{}],42:[function(require,module,exports){
var $Object = Object;
module.exports = {
  create:     $Object.create,
  getProto:   $Object.getPrototypeOf,
  isEnum:     {}.propertyIsEnumerable,
  getDesc:    $Object.getOwnPropertyDescriptor,
  setDesc:    $Object.defineProperty,
  setDescs:   $Object.defineProperties,
  getKeys:    $Object.keys,
  getNames:   $Object.getOwnPropertyNames,
  getSymbols: $Object.getOwnPropertySymbols,
  each:       [].forEach
};
},{}],43:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./$.export')
  , core    = require('./$.core')
  , fails   = require('./$.fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./$.core":34,"./$.export":37,"./$.fails":38}],44:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var getDesc  = require('./$').getDesc
  , isObject = require('./$.is-object')
  , anObject = require('./$.an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./$.ctx')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./$":42,"./$.an-object":32,"./$.ctx":35,"./$.is-object":41}],45:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./$.iobject')
  , defined = require('./$.defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./$.defined":36,"./$.iobject":40}],46:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject = require('./$.to-iobject');

require('./$.object-sap')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./$.object-sap":43,"./$.to-iobject":45}],47:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./$.export');
$export($export.S, 'Object', {setPrototypeOf: require('./$.set-proto').set});
},{"./$.export":37,"./$.set-proto":44}],48:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],49:[function(require,module,exports){
'use strict';

!function(exports, undefined) {

  var
    // If the typed array is unspecified, use this.
    DefaultArrayType = Float32Array,
    // Simple math functions we need.
    sqrt = Math.sqrt,
    sqr = function(number) {return Math.pow(number, 2)},
    // Internal convenience copies of the exported functions
    isComplexArray,
    ComplexArray

  exports.isComplexArray = isComplexArray = function(obj) {
    return obj !== undefined &&
      obj.hasOwnProperty !== undefined &&
      obj.hasOwnProperty('real') &&
      obj.hasOwnProperty('imag')
  }

  exports.ComplexArray = ComplexArray = function(other, opt_array_type){
    if (isComplexArray(other)) {
      // Copy constuctor.
      this.ArrayType = other.ArrayType
      this.real = new this.ArrayType(other.real)
      this.imag = new this.ArrayType(other.imag)
    } else {
      this.ArrayType = opt_array_type || DefaultArrayType
      // other can be either an array or a number.
      this.real = new this.ArrayType(other)
      this.imag = new this.ArrayType(this.real.length)
    }

    this.length = this.real.length
  }

  ComplexArray.prototype.toString = function() {
    var components = []

    this.forEach(function(c_value, i) {
      components.push(
        '(' +
        c_value.real.toFixed(2) + ',' +
        c_value.imag.toFixed(2) +
        ')'
      )
    })

    return '[' + components.join(',') + ']'
  }

  // In-place mapper.
  ComplexArray.prototype.map = function(mapper) {
    var
      i,
      n = this.length,
      // For GC efficiency, pass a single c_value object to the mapper.
      c_value = {}

    for (i = 0; i < n; i++) {
      c_value.real = this.real[i]
      c_value.imag = this.imag[i]
      mapper(c_value, i, n)
      this.real[i] = c_value.real
      this.imag[i] = c_value.imag
    }

    return this
  }

  ComplexArray.prototype.forEach = function(iterator) {
    var
      i,
      n = this.length,
      // For consistency with .map.
      c_value = {}

    for (i = 0; i < n; i++) {
      c_value.real = this.real[i]
      c_value.imag = this.imag[i]
      iterator(c_value, i, n)
    }
  }

  ComplexArray.prototype.conjugate = function() {
    return (new ComplexArray(this)).map(function(value) {
      value.imag *= -1
    })
  }

  // Helper so we can make ArrayType objects returned have similar interfaces
  //   to ComplexArrays.
  function iterable(obj) {
    if (!obj.forEach)
      obj.forEach = function(iterator) {
        var i, n = this.length

        for (i = 0; i < n; i++)
          iterator(this[i], i, n)
      }

    return obj
  }

  ComplexArray.prototype.magnitude = function() {
    var mags = new this.ArrayType(this.length)

    this.forEach(function(value, i) {
      mags[i] = sqrt(sqr(value.real) + sqr(value.imag))
    })

    // ArrayType will not necessarily be iterable: make it so.
    return iterable(mags)
  }
}(typeof exports === 'undefined' && (this.complex_array = {}) || exports)

},{}],50:[function(require,module,exports){
'use strict';

!function(exports, complex_array) {

  var
    ComplexArray = complex_array.ComplexArray,
    // Math constants and functions we need.
    PI = Math.PI,
    SQRT1_2 = Math.SQRT1_2,
    sqrt = Math.sqrt,
    cos = Math.cos,
    sin = Math.sin

  ComplexArray.prototype.FFT = function() {
    return FFT(this, false)
  }

  exports.FFT = function(input) {
    return ensureComplexArray(input).FFT()
  }

  ComplexArray.prototype.InvFFT = function() {
    return FFT(this, true)
  }

  exports.InvFFT = function(input) {
    return ensureComplexArray(input).InvFFT()
  }

  // Applies a frequency-space filter to input, and returns the real-space
  // filtered input.
  // filterer accepts freq, i, n and modifies freq.real and freq.imag.
  ComplexArray.prototype.frequencyMap = function(filterer) {
    return this.FFT().map(filterer).InvFFT()
  }

  exports.frequencyMap = function(input, filterer) {
    return ensureComplexArray(input).frequencyMap(filterer)
  }

  function ensureComplexArray(input) {
    return complex_array.isComplexArray(input) && input ||
        new ComplexArray(input)
  }

  function FFT(input, inverse) {
    var n = input.length

    if (n & (n - 1)) {
      return FFT_Recursive(input, inverse)
    } else {
      return FFT_2_Iterative(input, inverse)
    }
  }

  function FFT_Recursive(input, inverse) {
    var
      n = input.length,
      // Counters.
      i, j,
      output,
      // Complex multiplier and its delta.
      f_r, f_i, del_f_r, del_f_i,
      // Lowest divisor and remainder.
      p, m,
      normalisation,
      recursive_result,
      _swap, _real, _imag

    if (n === 1) {
      return input
    }

    output = new ComplexArray(n, input.ArrayType)

    // Use the lowest odd factor, so we are able to use FFT_2_Iterative in the
    // recursive transforms optimally.
    p = LowestOddFactor(n)
    m = n / p
    normalisation = 1 / sqrt(p)
    recursive_result = new ComplexArray(m, input.ArrayType)

    // Loops go like O(n Σ p_i), where p_i are the prime factors of n.
    // for a power of a prime, p, this reduces to O(n p log_p n)
    for(j = 0; j < p; j++) {
      for(i = 0; i < m; i++) {
        recursive_result.real[i] = input.real[i * p + j]
        recursive_result.imag[i] = input.imag[i * p + j]
      }
      // Don't go deeper unless necessary to save allocs.
      if (m > 1) {
        recursive_result = FFT(recursive_result, inverse)
      }

      del_f_r = cos(2*PI*j/n)
      del_f_i = (inverse ? -1 : 1) * sin(2*PI*j/n)
      f_r = 1
      f_i = 0

      for(i = 0; i < n; i++) {
        _real = recursive_result.real[i % m]
        _imag = recursive_result.imag[i % m]

        output.real[i] += f_r * _real - f_i * _imag
        output.imag[i] += f_r * _imag + f_i * _real

        _swap = f_r * del_f_r - f_i * del_f_i
        f_i = f_r * del_f_i + f_i * del_f_r
        f_r = _swap
      }
    }

    // Copy back to input to match FFT_2_Iterative in-placeness
    // TODO: faster way of making this in-place?
    for(i = 0; i < n; i++) {
      input.real[i] = normalisation * output.real[i]
      input.imag[i] = normalisation * output.imag[i]
    }

    return input
  }

  function FFT_2_Iterative(input, inverse) {
    var
      n = input.length,
      // Counters.
      i, j,
      output, output_r, output_i,
      // Complex multiplier and its delta.
      f_r, f_i, del_f_r, del_f_i, temp,
      // Temporary loop variables.
      l_index, r_index,
      left_r, left_i, right_r, right_i,
      // width of each sub-array for which we're iteratively calculating FFT.
      width

    output = BitReverseComplexArray(input)
    output_r = output.real
    output_i = output.imag
    // Loops go like O(n log n):
    //   width ~ log n; i,j ~ n
    width = 1
    while (width < n) {
      del_f_r = cos(PI/width)
      del_f_i = (inverse ? -1 : 1) * sin(PI/width)
      for (i = 0; i < n/(2*width); i++) {
        f_r = 1
        f_i = 0
        for (j = 0; j < width; j++) {
          l_index = 2*i*width + j
          r_index = l_index + width

          left_r = output_r[l_index]
          left_i = output_i[l_index]
          right_r = f_r * output_r[r_index] - f_i * output_i[r_index]
          right_i = f_i * output_r[r_index] + f_r * output_i[r_index]

          output_r[l_index] = SQRT1_2 * (left_r + right_r)
          output_i[l_index] = SQRT1_2 * (left_i + right_i)
          output_r[r_index] = SQRT1_2 * (left_r - right_r)
          output_i[r_index] = SQRT1_2 * (left_i - right_i)
          temp = f_r * del_f_r - f_i * del_f_i
          f_i = f_r * del_f_i + f_i * del_f_r
          f_r = temp
        }
      }
      width <<= 1
    }

    return output
  }

  function BitReverseIndex(index, n) {
    var bitreversed_index = 0

    while (n > 1) {
      bitreversed_index <<= 1
      bitreversed_index += index & 1
      index >>= 1
      n >>= 1
    }
    return bitreversed_index
  }

  function BitReverseComplexArray(array) {
    var n = array.length,
        flips = {},
        swap,
        i

    for(i = 0; i < n; i++) {
      var r_i = BitReverseIndex(i, n)

      if (flips.hasOwnProperty(i) || flips.hasOwnProperty(r_i)) continue

      swap = array.real[r_i]
      array.real[r_i] = array.real[i]
      array.real[i] = swap

      swap = array.imag[r_i]
      array.imag[r_i] = array.imag[i]
      array.imag[i] = swap

      flips[i] = flips[r_i] = true
    }

    return array
  }

  function LowestOddFactor(n) {
    var factor = 3,
        sqrt_n = sqrt(n)

    while(factor <= sqrt_n) {
      if (n % factor === 0) return factor
      factor = factor + 2
    }
    return n
  }

}(
  typeof exports === 'undefined' && (this.fft = {}) || exports,
  typeof require === 'undefined' && (this.complex_array) ||
    require('./complex_array')
)

},{"./complex_array":49}],51:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var id = 0;

var BaseLfo = function () {
  /**
   * @todo - reverse arguments order, is weird
   */

  function BaseLfo() {
    var defaults = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    (0, _classCallCheck3.default)(this, BaseLfo);

    this.cid = id++;
    this.params = {};

    this.streamParams = {
      frameSize: 1,
      frameRate: 0,
      sourceSampleRate: 0
    };

    this.params = (0, _assign2.default)({}, defaults, options);
    this.children = [];

    // stream data
    this.time = 0;
    this.outFrame = null;
    this.metaData = {};
  }

  // WebAudioAPI `connect` like method


  (0, _createClass3.default)(BaseLfo, [{
    key: 'connect',
    value: function connect(child) {
      if (this.streamParams === null) {
        throw new Error('cannot connect to a dead lfo node');
      }

      this.children.push(child);
      child.parent = this;
    }

    // define if suffiscient

  }, {
    key: 'disconnect',
    value: function disconnect() {
      // remove itself from parent children
      var index = this.parent.children.indexOf(this);
      this.parent.children.splice(index, 1);
      // this.parent = null;
      // this.children = null;
    }

    // initialize the current node stream and propagate to it's children

  }, {
    key: 'initialize',
    value: function initialize() {
      var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
      var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      (0, _assign2.default)(this.streamParams, inStreamParams, outStreamParams);

      // create the `outFrame` arrayBuffer
      this.setupStream();

      // propagate initialization in lfo chain
      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].initialize(this.streamParams);
      }
    }

    /**
     * create the outputFrame according to the `streamParams`
     */

  }, {
    key: 'setupStream',
    value: function setupStream() {
      var frameSize = this.streamParams.frameSize;

      if (frameSize > 0) this.outFrame = new Float32Array(frameSize);
    }

    // reset `outFrame` and call reset on children

  }, {
    key: 'reset',
    value: function reset() {
      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].reset();
      }

      // sinks have no `outFrame`
      if (!this.outFrame) {
        return;
      }

      // this.outFrame.fill(0); // probably better but doesn't work yet
      for (var _i = 0, _l = this.outFrame.length; _i < _l; _i++) {
        this.outFrame[_i] = 0;
      }
    }

    // finalize stream

  }, {
    key: 'finalize',
    value: function finalize(endTime) {
      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].finalize(endTime);
      }
    }

    // forward the current state (time, frame, metaData) to all the children

  }, {
    key: 'output',
    value: function output() {
      var time = arguments.length <= 0 || arguments[0] === undefined ? this.time : arguments[0];
      var outFrame = arguments.length <= 1 || arguments[1] === undefined ? this.outFrame : arguments[1];
      var metaData = arguments.length <= 2 || arguments[2] === undefined ? this.metaData : arguments[2];

      for (var i = 0, l = this.children.length; i < l; i++) {
        this.children[i].process(time, outFrame, metaData);
      }
    }

    // main function to override, defaults to noop

  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      this.time = time;
      this.outFrame = frame;
      this.metaData = metaData;

      this.output();
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      // call `destroy` in all it's children
      var index = this.children.length;

      while (index--) {
        this.children[index].destroy();
      }

      // delete itself from the parent node
      if (this.parent) {
        var _index = this.parent.children.indexOf(this);
        this.parent.children.splice(_index, 1);
      }

      // cannot use a dead object as parent
      this.streamParams = null;

      // clean it's own references / disconnect audio nodes if needed
    }
  }]);
  return BaseLfo;
}();

exports.default = BaseLfo;

},{"babel-runtime/core-js/object/assign":91,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101}],52:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseLfo = require('./base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  BaseLfo: _baseLfo2.default
};

},{"./base-lfo":51}],53:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _core = require('./core');

Object.defineProperty(exports, 'core', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_core).default;
  }
});

var _sources = require('./sources');

Object.defineProperty(exports, 'sources', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_sources).default;
  }
});

var _sinks = require('./sinks');

Object.defineProperty(exports, 'sinks', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_sinks).default;
  }
});

var _operators = require('./operators');

Object.defineProperty(exports, 'operators', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_operators).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./core":52,"./operators":57,"./sinks":71,"./sources":83}],54:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sin = Math.sin; /**
                     * @fileoverview WAVE LFO module: biquad filter.
                     * @author Jean-Philippe.Lambert@ircam.fr, Norbert.Schnell@ircam.fr, victor.saiz@ircam.fr
                     * @version 0.1.0
                     *
                     * @brief  Biquad filter and coefficients calculator
                     *
                     * Based on the "Cookbook formulae for audio EQ biquad filter
                     * coefficients" by Robert Bristow-Johnson
                     *
                     */

/* y(n) = b0 x(n) + b1 x(n-1) + b2 x(n-2)  */
/*                - a1 x(n-1) - a2 x(n-2)  */

/* f0 is normalised by the nyquist frequency */
/* q must be > 0. */
/* gain must be > 0. and is linear */

/* when there is no gain parameter, one can simply multiply the b
 * coefficients by a (linear) gain */

/* a0 is always 1. as each coefficient is normalised by a0, including a0 */

/* a1 is a[0] and a2 is a[1] */

var cos = Math.cos;
var M_PI = Math.PI;
var sqrt = Math.sqrt;

// coefs calculations
// ------------------

/* LPF: H(s) = 1 / (s^2 + s/Q + 1) */
function lowpass_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = (1.0 - c) * 0.5 * a0_inv;
  coefs.b1 = (1.0 - c) * a0_inv;
  coefs.b2 = coefs.b0;
}

/* HPF: H(s) = s^2 / (s^2 + s/Q + 1) */
function highpass_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = (1.0 + c) * 0.5 * a0_inv;
  coefs.b1 = (-1.0 - c) * a0_inv;
  coefs.b2 = coefs.b0;
}

/* BPF: H(s) = s / (s^2 + s/Q + 1)  (constant skirt gain, peak gain = Q) */
function bandpass_constant_skirt_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var s = sin(w0);
  var alpha = s / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = s * 0.5 * a0_inv;
  coefs.b1 = 0.0;
  coefs.b2 = -coefs.b0;
}

/* BPF: H(s) = (s/Q) / (s^2 + s/Q + 1)      (constant 0 dB peak gain) */
function bandpass_constant_peak_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = alpha * a0_inv;
  coefs.b1 = 0.0;
  coefs.b2 = -coefs.b0;
}

/* notch: H(s) = (s^2 + 1) / (s^2 + s/Q + 1) */
function notch_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = a0_inv;
  coefs.b1 = coefs.a1;
  coefs.b2 = coefs.b0;
}

/* APF: H(s) = (s^2 - s/Q + 1) / (s^2 + s/Q + 1) */
function allpass_coefs(f0, q, coefs) {
  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha) * a0_inv;

  coefs.b0 = coefs.a2;
  coefs.b1 = coefs.a1;
  coefs.b2 = 1.0;
}

/* peakingEQ: H(s) = (s^2 + s*(A/Q) + 1) / (s^2 + s/(A*Q) + 1) */
/* A = sqrt( 10^(dBgain/20) ) = 10^(dBgain/40) */
/* gain is linear here */
function peaking_coefs(f0, q, gain, coefs) {
  var g = sqrt(gain);
  var g_inv = 1.0 / g;

  var w0 = M_PI * f0;
  var alpha = sin(w0) / (2.0 * q);
  var c = cos(w0);

  var a0_inv = 1.0 / (1.0 + alpha * g_inv);

  coefs.a1 = -2.0 * c * a0_inv;
  coefs.a2 = (1.0 - alpha * g_inv) * a0_inv;

  coefs.b0 = (1.0 + alpha * g) * a0_inv;
  coefs.b1 = coefs.a1;
  coefs.b2 = (1.0 - alpha * g) * a0_inv;
}

/* lowShelf: H(s) = A * (s^2 + (sqrt(A)/Q)*s + A)/(A*s^2 + (sqrt(A)/Q)*s + 1) */
/* A = sqrt( 10^(dBgain/20) ) = 10^(dBgain/40) */
/* gain is linear here */
function lowshelf_coefs(f0, q, gain, coefs) {
  var g = sqrt(gain);

  var w0 = M_PI * f0;
  var alpha_2_sqrtg = sin(w0) * sqrt(g) / q;
  var c = cos(w0);

  var a0_inv = 1.0 / (g + 1.0 + (g - 1.0) * c + alpha_2_sqrtg);

  coefs.a1 = -2.0 * (g - 1.0 + (g + 1.0) * c) * a0_inv;
  coefs.a2 = (g + 1.0 + (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;

  coefs.b0 = g * (g + 1.0 - (g - 1.0) * c + alpha_2_sqrtg) * a0_inv;
  coefs.b1 = 2.0 * g * (g - 1.0 - (g + 1.0) * c) * a0_inv;
  coefs.b2 = g * (g + 1.0 - (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;
}

/* highShelf: H(s) = A * (A*s^2 + (sqrt(A)/Q)*s + 1)/(s^2 + (sqrt(A)/Q)*s + A) */
/* A = sqrt( 10^(dBgain/20) ) = 10^(dBgain/40) */
/* gain is linear here */
function highshelf_coefs(f0, q, gain, coefs) {
  var g = sqrt(gain);

  var w0 = M_PI * f0;
  var alpha_2_sqrtg = sin(w0) * sqrt(g) / q;
  var c = cos(w0);

  var a0_inv = 1.0 / (g + 1.0 - (g - 1.0) * c + alpha_2_sqrtg);

  coefs.a1 = 2.0 * (g - 1.0 - (g + 1.0) * c) * a0_inv;
  coefs.a2 = (g + 1.0 - (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;

  coefs.b0 = g * (g + 1.0 + (g - 1.0) * c + alpha_2_sqrtg) * a0_inv;
  coefs.b1 = -2.0 * g * (g - 1.0 + (g + 1.0) * c) * a0_inv;
  coefs.b2 = g * (g + 1.0 + (g - 1.0) * c - alpha_2_sqrtg) * a0_inv;
}

/* helper */
function calculateCoefs(type, f0, q, gain, coefs) {

  switch (type) {
    case 'lowpass':
      lowpass_coefs(f0, q, coefs);
      break;

    case 'highpass':
      highpass_coefs(f0, q, coefs);
      break;

    case 'bandpass_constant_skirt':
      bandpass_constant_skirt_coefs(f0, q, coefs);
      break;

    case 'bandpass_constant_peak':
      bandpass_constant_peak_coefs(f0, q, coefs);
      break;

    case 'notch':
      notch_coefs(f0, q, coefs);
      break;

    case 'allpass':
      allpass_coefs(f0, q, coefs);
      break;

    case 'peaking':
      peaking_coefs(f0, q, gain, coefs);
      break;

    case 'lowshelf':
      lowshelf_coefs(f0, q, gain, coefs);
      break;

    case 'highshelf':
      highshelf_coefs(f0, q, gain, coefs);
      break;
  }

  // apply gain
  switch (type) {
    case 'lowpass':
    case 'highpass':
    case 'bandpass_constant_skirt':
    case 'bandpass_constant_peak':
    case 'notch':
    case 'allpass':
      if (gain != 1.0) {
        coefs.b0 *= gain;
        coefs.b1 *= gain;
        coefs.b2 *= gain;
      }
      break;
    /* gain is already integrated for the following */
    case 'peaking':
    case 'lowshelf':
    case 'highshelf':
      break;
  }
}

/* direct form I */
/* a0 = 1, a1 = a[0], a2 = a[1] */
/* 4 states (in that order): x(n-1), x(n-2), y(n-1), y(n-2)  */
function biquadArrayDf1(coefs, state, inFrame, outFrame, size) {
  for (var i = 0; i < size; i++) {
    var y = coefs.b0 * inFrame[i] + coefs.b1 * state.xn_1[i] + coefs.b2 * state.xn_2[i] - coefs.a1 * state.yn_1[i] - coefs.a2 * state.yn_2[i];

    outFrame[i] = y;

    // update states
    state.xn_2[i] = state.xn_1[i];
    state.xn_1[i] = inFrame[i];

    state.yn_2[i] = state.yn_1[i];
    state.yn_1[i] = y;
  }
}

/* transposed direct form II */
/* a0 = 1, a1 = a[0], a2 = a[1] */
/* 2 states */
function biquadArrayDf2(coefs, state, inFrame, outFrame, size) {
  for (var i = 0; i < size; i++) {
    outFrame[i] = coefs.b0 * inFrame[i] + state.xn_1[i];

    // update states
    state.xn_1[i] = coefs.b1 * inFrame[i] - coefs.a1[i] * outFrame[i] + state.xn_2[i];
    state.xn_2[i] = coefs.b2 * inFrame[i] - coefs.a2[i] * outFrame[i];
  }
}

var Biquad = function (_BaseLfo) {
  (0, _inherits3.default)(Biquad, _BaseLfo);

  function Biquad(options) {
    (0, _classCallCheck3.default)(this, Biquad);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Biquad).call(this, {
      filterType: 'lowpass',
      f0: 1.0,
      gain: 1.0,
      q: 1.0
    }, options));
  }

  (0, _createClass3.default)(Biquad, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(Biquad.prototype), 'initialize', this).call(this, inStreamParams);

      var frameRate = this.streamParams.frameRate;

      // if no frameRate or framerate is 0 we shall halt!
      if (!frameRate || frameRate <= 0) {
        throw new Error('This Operator requires a frameRate higher than 0.');
      }

      var normF0 = this.params.f0 / frameRate;
      var gain = this.params.gain;
      var q = void 0;

      if (this.params.q) {
        q = this.params.q;
      }
      if (this.params.bw) {
        q = this.params.f0 / this.params.bw;
      }

      this.coefs = {
        b0: 0,
        b1: 0,
        b2: 0,
        a1: 0,
        a2: 0
      };

      var frameSize = this.streamParams.frameSize;

      this.state = {
        xn_1: new Float32Array(frameSize),
        xn_2: new Float32Array(frameSize),
        yn_1: new Float32Array(frameSize),
        yn_2: new Float32Array(frameSize)
      };

      calculateCoefs(this.params.filterType, normF0, q, gain, this.coefs);
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      biquadArrayDf1(this.coefs, this.state, frame, this.outFrame, frame.length);
      // console.log(this.outFrame);
      this.output(time, this.outFrame, metaData);
    }
  }]);
  return Biquad;
}(_baseLfo2.default);

exports.default = Biquad;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],55:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

var _jsfft = require('jsfft');

var _jsfft2 = _interopRequireDefault(_jsfft);

var _complex_array = require('jsfft/lib/complex_array');

var _complex_array2 = _interopRequireDefault(_complex_array);

var _fftWindows = require('../utils/fft-windows');

var _fftWindows2 = _interopRequireDefault(_fftWindows);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// const PI   = Math.PI;
// const cos  = Math.cos;
// const sin  = Math.sin;
var sqrt = Math.sqrt;

var isPowerOfTwo = function isPowerOfTwo(number) {
  while (number % 2 === 0 && number > 1) {
    number = number / 2;
  }

  return number === 1;
};

var Fft = function (_BaseLfo) {
  (0, _inherits3.default)(Fft, _BaseLfo);

  function Fft(options) {
    (0, _classCallCheck3.default)(this, Fft);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Fft).call(this, {
      fftSize: 1024,
      windowName: 'hann',
      outType: 'magnitude'
    }, options));

    _this.windowSize = _this.params.fftSize;

    if (!isPowerOfTwo(_this.params.fftSize)) {
      throw new Error('fftSize must be a power of two');
    }
    return _this;
  }

  (0, _createClass3.default)(Fft, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      // set output frameSize
      (0, _get3.default)((0, _getPrototypeOf2.default)(Fft.prototype), 'initialize', this).call(this, inStreamParams, {
        frameSize: this.params.fftSize / 2 + 1
      });

      var inFrameSize = inStreamParams.frameSize;
      var fftSize = this.params.fftSize;

      this.windowSize = fftSize;

      if (inFrameSize < fftSize) this.windowSize = inFrameSize;

      // references to populate in window functions
      this.normalizeCoefs = { linear: 0, power: 0 };
      this.window = new Float32Array(this.windowSize);

      // init the complex array to reuse for the FFT
      this.complexFrame = new _complex_array2.default.ComplexArray(fftSize);

      (0, _fftWindows2.default)(this.params.windowName, this.window, // buffer to populate with the window
      this.windowSize, // buffer.length
      this.normalizeCoefs // an object to populate with the normalization coefs
      );

      // ArrayBuffers to reuse in process
      this.windowedFrame = new Float32Array(fftSize);
    }

    /**
     * the first call of this method can be quite long (~4ms),
     * the subsequent ones are faster (~0.5ms) for fftSize = 1024
     */

  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var _this2 = this;

      var windowSize = this.windowSize;
      var outFrameSize = this.streamParams.frameSize;
      var fftSize = this.params.fftSize;

      // apply window on frame
      // => `this.window` and `frame` have the same length
      // => if `this.windowedFrame` is bigger, it's filled with zero
      // and window don't apply there
      for (var i = 0; i < windowSize; i++) {
        this.windowedFrame[i] = frame[i] * this.window[i];
      }if (windowSize < fftSize) this.windowedFrame.fill(0, windowSize);

      // FFT
      // this.complexFrame = new complexArray.ComplexArray(fftSize);
      // reuse the same complexFrame
      this.complexFrame.map(function (value, i) {
        value.real = _this2.windowedFrame[i];
        value.imag = 0;
      });

      var complexSpectrum = this.complexFrame.FFT();
      var scale = 1 / fftSize;

      // DC index
      var realDc = complexSpectrum.real[0];
      var imagDc = complexSpectrum.imag[0];
      this.outFrame[0] = (realDc * realDc + imagDc * imagDc) * scale;

      // Nquyst index
      var realNy = complexSpectrum.real[fftSize / 2];
      var imagNy = complexSpectrum.imag[fftSize / 2];
      this.outFrame[fftSize / 2] = (realNy * realNy + imagNy * imagNy) * scale;

      // power spectrum
      for (var _i = 1, j = fftSize - 1; _i < fftSize / 2; _i++, j--) {
        var real = complexSpectrum.real[_i] + complexSpectrum.real[j];
        var imag = complexSpectrum.imag[_i] - complexSpectrum.imag[j];

        this.outFrame[_i] = (real * real + imag * imag) * scale;
      }

      // magnitude spectrum
      // @NOTE maybe check how to remove this loop properly
      if (this.params.outType === 'magnitude') {
        for (var _i2 = 0; _i2 < outFrameSize; _i2++) {
          this.outFrame[_i2] = sqrt(this.outFrame[_i2]);
        }
      }

      this.output(time);
    }
  }]);
  return Fft;
}(_baseLfo2.default);

exports.default = Fft;

},{"../core/base-lfo":51,"../utils/fft-windows":87,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104,"jsfft":50,"jsfft/lib/complex_array":49}],56:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Framer = function (_BaseLfo) {
  (0, _inherits3.default)(Framer, _BaseLfo);

  function Framer(options) {
    (0, _classCallCheck3.default)(this, Framer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Framer).call(this, {
      frameSize: 512,
      centeredTimeTag: false
    }, options));

    _this.frameIndex = 0;
    return _this;
  }

  (0, _createClass3.default)(Framer, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      if (!this.params.hopSize) this.params.hopSize = this.params.frameSize; // hopSize defaults to frameSize

      (0, _get3.default)((0, _getPrototypeOf2.default)(Framer.prototype), 'initialize', this).call(this, inStreamParams, {
        frameSize: this.params.frameSize,
        frameRate: inStreamParams.sourceSampleRate / this.params.hopSize
      });
    }

    // @NOTE must be tested

  }, {
    key: 'reset',
    value: function reset() {
      this.frameIndex = 0;
      (0, _get3.default)((0, _getPrototypeOf2.default)(Framer.prototype), 'reset', this).call(this);
    }
  }, {
    key: 'finalize',
    value: function finalize(endTime) {
      if (this.frameIndex > 0) {
        this.outFrame.fill(0, this.frameIndex);
        this.output();
      }

      (0, _get3.default)((0, _getPrototypeOf2.default)(Framer.prototype), 'finalize', this).call(this, endTime);
    }
  }, {
    key: 'process',
    value: function process(time, block, metaData) {
      var outFrame = this.outFrame;
      var sampleRate = this.streamParams.sourceSampleRate;
      var samplePeriod = 1 / sampleRate;
      var frameSize = this.streamParams.frameSize;
      var blockSize = block.length;
      var hopSize = this.params.hopSize;
      var frameIndex = this.frameIndex;
      var blockIndex = 0;

      while (blockIndex < blockSize) {
        var numSkip = 0;

        // skip block samples for negative frameIndex
        if (frameIndex < 0) {
          numSkip = -frameIndex;
        }

        if (numSkip < blockSize) {
          blockIndex += numSkip; // skip block segment

          // can copy all the rest of the incoming block
          var numCopy = blockSize - blockIndex;

          // connot copy more than what fits into the frame
          var maxCopy = frameSize - frameIndex;

          if (numCopy >= maxCopy) {
            numCopy = maxCopy;
          }

          // copy block segment into frame
          var copy = block.subarray(blockIndex, blockIndex + numCopy);

          outFrame.set(copy, frameIndex);

          // advance block and frame index
          blockIndex += numCopy;
          frameIndex += numCopy;

          // send frame when completed
          if (frameIndex === frameSize) {
            // define time tag for the outFrame according to configuration
            if (this.params.centeredTimeTag) {
              this.time = time + (blockIndex - frameSize / 2) * samplePeriod;
            } else {
              this.time = time + (blockIndex - frameSize) * samplePeriod;
            }

            // forward metaData ?
            this.metaData = metaData;

            // forward to next nodes
            this.output();

            // shift frame left
            if (hopSize < frameSize) {
              outFrame.set(outFrame.subarray(hopSize, frameSize), 0);
            }

            frameIndex -= hopSize; // hop forward
          }
        } else {
            // skip entire block
            var blockRest = blockSize - blockIndex;
            frameIndex += blockRest;
            blockIndex += blockRest;
          }
      }

      this.frameIndex = frameIndex;
    }
  }]);
  return Framer;
}(_baseLfo2.default);

exports.default = Framer;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],57:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _biquad = require('./biquad');

var _biquad2 = _interopRequireDefault(_biquad);

var _fft = require('./fft');

var _fft2 = _interopRequireDefault(_fft);

var _framer = require('./framer');

var _framer2 = _interopRequireDefault(_framer);

var _magnitude = require('./magnitude');

var _magnitude2 = _interopRequireDefault(_magnitude);

var _max = require('./max');

var _max2 = _interopRequireDefault(_max);

var _minMax = require('./min-max');

var _minMax2 = _interopRequireDefault(_minMax);

var _movingAverage = require('./moving-average');

var _movingAverage2 = _interopRequireDefault(_movingAverage);

var _movingMedian = require('./moving-median');

var _movingMedian2 = _interopRequireDefault(_movingMedian);

var _noop = require('./noop');

var _noop2 = _interopRequireDefault(_noop);

var _operator = require('./operator');

var _operator2 = _interopRequireDefault(_operator);

var _segmenter = require('./segmenter');

var _segmenter2 = _interopRequireDefault(_segmenter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  Biquad: _biquad2.default,
  Fft: _fft2.default,
  Framer: _framer2.default,
  Magnitude: _magnitude2.default,
  Max: _max2.default,
  MinMax: _minMax2.default,
  MovingAverage: _movingAverage2.default,
  MovingMedian: _movingMedian2.default,
  Noop: _noop2.default,
  Operator: _operator2.default,
  Segmenter: _segmenter2.default
};

},{"./biquad":54,"./fft":55,"./framer":56,"./magnitude":58,"./max":59,"./min-max":60,"./moving-average":61,"./moving-median":62,"./noop":63,"./operator":64,"./segmenter":65}],58:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Magnitude = function (_BaseLfo) {
  (0, _inherits3.default)(Magnitude, _BaseLfo);

  function Magnitude(options) {
    (0, _classCallCheck3.default)(this, Magnitude);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Magnitude).call(this, {
      normalize: true,
      power: false
    }, options));
  }

  (0, _createClass3.default)(Magnitude, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(Magnitude.prototype), 'initialize', this).call(this, inStreamParams, {
        frameSize: 1
      });
    }
  }, {
    key: 'inputArray',
    value: function inputArray(frame) {
      var outFrame = this.outFrame;
      var frameSize = frame.length;
      var sum = 0;

      for (var i = 0; i < frameSize; i++) {
        sum += frame[i] * frame[i];
      }var mag = sum;

      if (this.params.normalize) mag /= frameSize;

      if (!this.params.power) mag = Math.sqrt(mag);

      outFrame[0] = mag;

      return outFrame;
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      this.inputArray(frame);
      this.output(time, this.outFrame, metaData);
    }
  }]);
  return Magnitude;
}(_baseLfo2.default);

exports.default = Magnitude;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],59:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Max = function (_BaseLfo) {
  (0, _inherits3.default)(Max, _BaseLfo);

  function Max(options) {
    (0, _classCallCheck3.default)(this, Max);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Max).call(this, options));
  }

  (0, _createClass3.default)(Max, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(Max.prototype), 'initialize', this).call(this, inStreamParams, {
        frameSize: 1
      });
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      this.time = time;
      this.outFrame[0] = Math.max.apply(null, frame);
      this.metaData = metaData;

      this.output();
    }
  }]);
  return Max;
}(_baseLfo2.default);

exports.default = Max;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],60:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Returns the min and max values from each frame
 */

var MinMax = function (_BaseLfo) {
  (0, _inherits3.default)(MinMax, _BaseLfo);

  function MinMax(options) {
    (0, _classCallCheck3.default)(this, MinMax);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(MinMax).call(this, options));
  }

  (0, _createClass3.default)(MinMax, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(MinMax.prototype), 'initialize', this).call(this, inStreamParams, {
        frameSize: 2
      });
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var min = +Infinity;
      var max = -Infinity;

      for (var i = 0, l = frame.length; i < l; i++) {
        var value = frame[i];
        if (value < min) {
          min = value;
        }
        if (value > max) {
          max = value;
        }
      }

      this.time = time;
      this.outFrame[0] = min;
      this.outFrame[1] = max;
      this.metaData = metaData;

      this.output();
    }
  }]);
  return MinMax;
}(_baseLfo2.default);

exports.default = MinMax;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],61:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// NOTES:
// - add 'symetrical' option (how to deal with values between frames ?) ?
// - can we improve algorithm implementation ?

var MovingAverage = function (_BaseLfo) {
  (0, _inherits3.default)(MovingAverage, _BaseLfo);

  function MovingAverage(options) {
    (0, _classCallCheck3.default)(this, MovingAverage);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(MovingAverage).call(this, {
      order: 10,
      fill: 0
    }, options));

    _this.sum = null;
    _this.ringBuffer = null;
    _this.ringIndex = 0;
    return _this;
  }

  (0, _createClass3.default)(MovingAverage, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(MovingAverage.prototype), 'initialize', this).call(this, inStreamParams);

      this.ringBuffer = new Float32Array(this.params.order * this.streamParams.frameSize);

      if (this.streamParams.frameSize > 1) this.sum = new Float32Array(this.streamParams.frameSize);else this.sum = 0;
    }
  }, {
    key: 'reset',
    value: function reset() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(MovingAverage.prototype), 'reset', this).call(this);

      this.ringBuffer.fill(this.params.fill);

      var fillSum = this.params.order * this.params.fill;

      if (this.streamParams.frameSize > 1) this.sum.fill(fillSum);else this.sum = fillSum;

      this.ringIndex = 0;
    }
  }, {
    key: 'inputScalar',
    value: function inputScalar(value) {
      var order = this.params.order;
      var ringIndex = this.ringIndex;
      var ringBuffer = this.ringBuffer;
      var sum = this.sum;

      sum -= ringBuffer[ringIndex];
      sum += value;

      this.sum = sum;
      this.ringBuffer[ringIndex] = value;
      this.ringIndex = (ringIndex + 1) % order;

      return sum / order;
    }
  }, {
    key: 'inputArray',
    value: function inputArray(frame) {
      var outFrame = this.outFrame;
      var order = this.params.order;
      var frameSize = this.streamParams.frameSize;
      var ringIndex = this.ringIndex;
      var ringOffset = ringIndex * frameSize;
      var ring = this.ringBuffer;
      var sum = this.sum;
      var scale = 1 / order;

      for (var i = 0; i < frameSize; i++) {
        var ringBufferIndex = ringOffset + i;
        var value = frame[i];
        var _sum = _sum[i];

        _sum -= ringBuffer[ringBufferIndex];
        _sum += value;

        outFrame[i] = _sum * scale;

        this.sum[i] = _sum;
        this.ringBuffer[ringBufferIndex] = value;
      }

      this.ringIndex = (ringIndex + 1) % order;

      return outFrame;
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      if (this.frameSize > 1) this.inputArray(frame);else this.outFrame[0] = this.inputScalar(frame[0]);

      if (this.streamParams.sourceSampleRate) time -= 0.5 * (this.params.order - 1) / this.streamParams.sourceSampleRate;

      this.output(time, this.outFrame, metaData);
    }
  }]);
  return MovingAverage;
}(_baseLfo2.default);

exports.default = MovingAverage;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],62:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MovingMedian = function (_BaseLfo) {
  (0, _inherits3.default)(MovingMedian, _BaseLfo);

  function MovingMedian(options) {
    (0, _classCallCheck3.default)(this, MovingMedian);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(MovingMedian).call(this, {
      order: 9
    }, options));

    if (_this.params.order % 2 === 0) {
      throw new Error('order must be an odd number');
    }

    _this.queue = new Float32Array(_this.params.order);
    _this.sorter = [];
    return _this;
  }

  (0, _createClass3.default)(MovingMedian, [{
    key: 'reset',
    value: function reset() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(MovingMedian.prototype), 'reset', this).call(this);

      for (var i = 0, l = this.queue.length; i < l; i++) {
        this.queue[i] = 0;
      }
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var outFrame = this.outFrame;
      var frameSize = frame.length;
      var order = this.params.order;
      var pushIndex = this.params.order - 1;
      var medianIndex = Math.floor(order / 2);

      for (var i = 0; i < frameSize; i++) {
        var current = frame[i];
        // update queue
        this.queue.set(this.queue.subarray(1), 0);
        this.queue[pushIndex] = current;
        // get median
        this.sorter = (0, _from2.default)(this.queue.values());
        this.sorter.sort(function (a, b) {
          return a - b;
        });

        outFrame[i] = this.sorter[medianIndex];
      }

      this.output(time, outFrame, metaData);
    }
  }]);
  return MovingMedian;
}(_baseLfo2.default);

exports.default = MovingMedian;

},{"../core/base-lfo":51,"babel-runtime/core-js/array/from":89,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],63:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * a NoOp Lfo
 */

var Noop = function (_BaseLfo) {
  (0, _inherits3.default)(Noop, _BaseLfo);

  function Noop(options) {
    (0, _classCallCheck3.default)(this, Noop);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Noop).call(this, options));
  }

  (0, _createClass3.default)(Noop, [{
    key: 'process',
    value: function process(time, frame, metaData) {
      this.outFrame.set(frame, 0);
      this.time = time;
      this.metaData = metaData;

      this.output();
    }
  }]);
  return Noop;
}(_baseLfo2.default);

exports.default = Noop;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],64:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * apply a given function on each frame
 *
 * @SIGNATURE scalar callback
 * function(value, index, frame) {
 *   return doSomething(value)
 * }
 *
 * @SIGNATURE vector callback
 * function(time, inFrame, outFrame) {
 *   outFrame.set(inFrame, 0);
 *   return time + 1;
 * }
 *
 */

var Operator = function (_BaseLfo) {
  (0, _inherits3.default)(Operator, _BaseLfo);

  function Operator(options) {
    (0, _classCallCheck3.default)(this, Operator);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Operator).call(this, options));

    _this.params.type = _this.params.type || 'scalar';

    if (_this.params.onProcess) {
      _this.callback = _this.params.onProcess.bind(_this);
    }
    return _this;
  }

  (0, _createClass3.default)(Operator, [{
    key: 'configureStream',
    value: function configureStream() {
      if (this.params.type === 'vector' && this.params.frameSize) {
        this.streamParams.frameSize = this.params.frameSize;
      }
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      // apply the callback to the frame
      if (this.params.type === 'vector') {
        var outTime = this.callback(time, frame, this.outFrame);

        if (outTime !== undefined) {
          time = outTime;
        }
      } else {
        for (var i = 0, l = frame.length; i < l; i++) {
          this.outFrame[i] = this.callback(frame[i], i);
        }
      }

      this.time = time;
      this.metaData = metaData;

      this.output();
    }
  }]);
  return Operator;
}(_baseLfo2.default);

exports.default = Operator;
;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],65:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

var _movingAverage = require('./moving-average');

var _movingAverage2 = _interopRequireDefault(_movingAverage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Segmenter = function (_BaseLfo) {
  (0, _inherits3.default)(Segmenter, _BaseLfo);

  function Segmenter(options) {
    (0, _classCallCheck3.default)(this, Segmenter);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Segmenter).call(this, {
      logInput: false,
      minInput: 0.000000000001,
      filterOrder: 5,
      threshold: 3,
      offThreshold: -Infinity,
      minInter: 0.050,
      maxDuration: Infinity
    }, options));

    _this.insideSegment = false;
    _this.onsetTime = -Infinity;

    // stats
    _this.min = Infinity;
    _this.max = -Infinity;
    _this.sum = 0;
    _this.sumOfSquares = 0;
    _this.count = 0;

    var minInput = _this.params.minInput;
    var fill = minInput;

    if (_this.params.logInput && minInput > 0) fill = Math.log(minInput);

    _this.movingAverage = new _movingAverage2.default({
      order: _this.params.filterOrder,
      fill: fill
    });

    _this.lastMvavrg = fill;
    return _this;
  }

  (0, _createClass3.default)(Segmenter, [{
    key: 'resetSegment',
    value: function resetSegment() {
      this.insideSegment = false;
      this.onsetTime = -Infinity;

      // stats
      this.min = Infinity;
      this.max = -Infinity;
      this.sum = 0;
      this.sumOfSquares = 0;
      this.count = 0;
    }
  }, {
    key: 'outputSegment',
    value: function outputSegment(endTime) {
      this.outFrame[0] = endTime - this.onsetTime;
      this.outFrame[1] = this.min;
      this.outFrame[2] = this.max;

      var norm = 1 / this.count;
      var mean = this.sum * norm;
      var meanOfSquare = this.sumOfSquares * norm;
      var squareOfmean = mean * mean;

      this.outFrame[3] = mean;
      this.outFrame[4] = 0;

      if (meanOfSquare > squareOfmean) this.outFrame[4] = Math.sqrt(meanOfSquare - squareOfmean);

      this.output(this.onsetTime);
    }
  }, {
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(Segmenter.prototype), 'initialize', this).call(this, inStreamParams, {
        frameSize: 5,
        description: ['duration', 'min', 'max', 'mean', 'std dev']
      });

      this.movingAverage.initialize(inStreamParams);
    }
  }, {
    key: 'reset',
    value: function reset() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(Segmenter.prototype), 'reset', this).call(this);
      this.movingAverage.reset();
      this.resetSegment();
    }
  }, {
    key: 'finalize',
    value: function finalize(endTime) {
      if (this.insideSegment) this.outputSegment(endTime);

      (0, _get3.default)((0, _getPrototypeOf2.default)(Segmenter.prototype), 'finalize', this).call(this, endTime);
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var rawValue = frame[0];
      var minInput = this.params.minInput;
      var value = Math.max(rawValue, minInput);

      if (this.params.logInput) value = Math.log(value);

      var diff = value - this.lastMvavrg;
      this.lastMvavrg = this.movingAverage.inputScalar(value);

      this.metaData = metaData;

      if (diff > this.params.threshold && time - this.onsetTime > this.params.minInter) {
        if (this.insideSegment) this.outputSegment(time);

        // start segment
        this.insideSegment = true;
        this.onsetTime = time;
        this.max = -Infinity;
      }

      if (this.insideSegment) {
        this.min = Math.min(this.min, rawValue);
        this.max = Math.max(this.max, rawValue);
        this.sum += rawValue;
        this.sumOfSquares += rawValue * rawValue;
        this.count++;

        if (time - this.onsetTime >= this.params.maxDuration || value <= this.params.offThreshold) {
          this.outputSegment(time);
          this.insideSegment = false;
        }
      }
    }
  }, {
    key: 'threshold',
    set: function set(value) {
      this.params.threshold = value;
    }
  }, {
    key: 'offThreshold',
    set: function set(value) {
      this.params.offThreshold = value;
    }
  }]);
  return Segmenter;
}(_baseLfo2.default);

exports.default = Segmenter;

},{"../core/base-lfo":51,"./moving-average":61,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],66:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var worker = '\nvar isInfiniteBuffer = false;\nvar stack = [];\nvar buffer;\nvar bufferLength;\nvar currentIndex;\n\nfunction init() {\n  buffer = new Float32Array(bufferLength);\n  stack.length = 0;\n  currentIndex = 0;\n}\n\nfunction append(block) {\n  var availableSpace = bufferLength - currentIndex;\n  var currentBlock;\n  // return if already full\n  if (availableSpace <= 0) { return; }\n\n  if (availableSpace < block.length) {\n    currentBlock = block.subarray(0, availableSpace);\n  } else {\n    currentBlock = block;\n  }\n\n  buffer.set(currentBlock, currentIndex);\n  currentIndex += currentBlock.length;\n\n  if (isInfiniteBuffer && currentIndex === buffer.length) {\n    stack.push(buffer);\n\n    currentBlock = block.subarray(availableSpace);\n    buffer = new Float32Array(buffer.length);\n    buffer.set(currentBlock, 0);\n    currentIndex = currentBlock.length;\n  }\n}\n\nself.addEventListener(\'message\', function(e) {\n  switch (e.data.command) {\n    case \'init\':\n      if (isFinite(e.data.duration)) {\n        bufferLength = e.data.sampleRate * e.data.duration;\n      } else {\n        isInfiniteBuffer = true;\n        bufferLength = e.data.sampleRate * 10;\n      }\n\n      init();\n      break;\n\n    case \'process\':\n      var block = new Float32Array(e.data.buffer);\n      append(block);\n\n\n      // if the buffer is full return it, only works with finite buffers\n      if (!isInfiniteBuffer && currentIndex === bufferLength) {\n        var buf = buffer.buffer.slice(0);\n        self.postMessage({ buffer: buf }, [buf]);\n        init();\n      }\n      break;\n\n    case \'stop\':\n      if (!isInfiniteBuffer) {\n        // @TODO add option to not clip the returned buffer\n        // values in FLoat32Array are 4 bytes long (32 / 8)\n        var copy = buffer.buffer.slice(0, currentIndex * (32 / 8));\n        self.postMessage({ buffer: copy }, [copy]);\n      } else {\n        var copy = new Float32Array(stack.length * bufferLength + currentIndex);\n        stack.forEach(function(buffer, index) {\n          copy.set(buffer, bufferLength * index);\n        });\n\n        copy.set(buffer.subarray(0, currentIndex), stack.length * bufferLength);\n        self.postMessage({ buffer: copy.buffer }, [copy.buffer]);\n      }\n      init();\n      break;\n  }\n}, false)';

var audioContext = void 0;

/**
 * Record an audio stream
 */

var AudioRecorder = function (_BaseLfo) {
  (0, _inherits3.default)(AudioRecorder, _BaseLfo);

  function AudioRecorder(options) {
    (0, _classCallCheck3.default)(this, AudioRecorder);


    // needed to retrive an AudioBuffer

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AudioRecorder).call(this, {
      duration: 10, // seconds
      ignoreLeadingZeros: true }, // ignore zeros at the beginning of the recoarding
    options));

    if (!_this.params.ctx) {
      if (!audioContext) {
        audioContext = new window.AudioContext();
      }
      _this.ctx = audioContext;
    } else {
      _this.ctx = _this.params.ctx;
    }

    _this._isStarted = false;
    _this._ignoreZeros = false;

    var blob = new Blob([worker], { type: 'text/javascript' });
    _this.worker = new Worker(window.URL.createObjectURL(blob));
    return _this;
  }

  (0, _createClass3.default)(AudioRecorder, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(AudioRecorder.prototype), 'initialize', this).call(this, inStreamParams);

      // propagate `streamParams` to the worker
      this.worker.postMessage({
        command: 'init',
        duration: this.params.duration,
        sampleRate: this.streamParams.sourceSampleRate
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this._isStarted = true;
      this._ignoreZeros = this.params.ignoreLeadingZeros;

      this.count = 0;
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this._isStarted) {
        this.worker.postMessage({ command: 'stop' });
        this._isStarted = false;
      }
    }

    // called when `stop` is triggered on the source
    // @todo - optionnaly truncate retrieved buffer to end time

  }, {
    key: 'finalize',
    value: function finalize(endTime) {
      this.stop();
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      if (!this._isStarted) {
        return;
      }
      // `this.outFrame` must be recreated each time because
      // it is copied in the worker and lost for this context
      var sendFrame = null;

      if (!this._ignoreZeros) {
        sendFrame = new Float32Array(frame);
      } else if (frame[frame.length - 1] !== 0) {
        var len = frame.length;
        var i = void 0;

        for (i = 0; i < len; i++) {
          if (frame[i] !== 0) break;
        }

        // copy non zero segment
        sendFrame = new Float32Array(frame.subarray(i));
        this._ignoreZeros = false;
      }

      if (sendFrame) {
        var buffer = sendFrame.buffer;
        this.worker.postMessage({
          command: 'process',
          buffer: buffer
        }, [buffer]);
      }
    }

    /**
     * retrieve the created audioBuffer
     * @return {Promise}
     */

  }, {
    key: 'retrieve',
    value: function retrieve() {
      var _this2 = this;

      return new _promise2.default(function (resolve, reject) {
        var callback = function callback(e) {
          // if called when buffer is full, stop the recorder too
          _this2._isStarted = false;

          _this2.worker.removeEventListener('message', callback, false);
          // create an audio buffer from the data
          var buffer = new Float32Array(e.data.buffer);
          var length = buffer.length;
          var sampleRate = _this2.streamParams.sourceSampleRate;

          var audioBuffer = _this2.ctx.createBuffer(1, length, sampleRate);
          var audioArrayBuffer = audioBuffer.getChannelData(0);
          audioArrayBuffer.set(buffer, 0);

          resolve(audioBuffer);
        };

        _this2.worker.addEventListener('message', callback, false);
      });
    }
  }]);
  return AudioRecorder;
}(_baseLfo2.default);

exports.default = AudioRecorder;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/core-js/promise":97,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],67:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseDraw = function (_BaseLfo) {
  (0, _inherits3.default)(BaseDraw, _BaseLfo);

  function BaseDraw() {
    var extendDefaults = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    (0, _classCallCheck3.default)(this, BaseDraw);

    var defaults = (0, _assign2.default)({
      duration: 1,
      min: -1,
      max: 1,
      width: 300,
      height: 150, // default canvas size in DOM too
      isSynchronized: false, // is set to true if used in a synchronizedSink
      canvas: null, // an existing canvas element be used for drawing
      container: null }, // a selector inside which create an element
    extendDefaults);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(BaseDraw).call(this, defaults, options));

    if (!_this.params.canvas && !_this.params.container) throw new Error('parameter `canvas` or `container` are mandatory');

    // prepare canvas
    if (_this.params.canvas) {
      _this.canvas = _this.params.canvas;
    } else if (_this.params.container) {
      var container = document.querySelector(_this.params.container);
      _this.canvas = document.createElement('canvas');
      container.appendChild(_this.canvas);
    }

    _this.ctx = _this.canvas.getContext('2d');

    _this.cachedCanvas = document.createElement('canvas');
    _this.cachedCtx = _this.cachedCanvas.getContext('2d');

    _this.previousTime = 0;
    _this.lastShiftError = 0;
    _this.currentPartialShift = 0;

    _this.resize(_this.params.width, _this.params.height);

    //
    _this._stack;
    _this._rafId;
    _this.draw = _this.draw.bind(_this);
    return _this;
  }

  // params modifiers


  (0, _createClass3.default)(BaseDraw, [{
    key: '_setYScale',


    /**
     * Create the transfert function used to map values to pixel in the y axis
     * @private
     */
    value: function _setYScale() {
      var min = this.params.min;
      var max = this.params.max;
      var height = this.params.height;

      var a = (0 - height) / (max - min);
      var b = height - a * min;

      this.getYPosition = function (x) {
        return a * x + b;
      };
    }
  }, {
    key: 'setupStream',
    value: function setupStream() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(BaseDraw.prototype), 'setupStream', this).call(this);
      // keep track of the previous frame
      this.previousFrame = new Float32Array(this.streamParams.frameSize);
    }
  }, {
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(BaseDraw.prototype), 'initialize', this).call(this, inStreamParams);

      this._stack = [];
      this._rafId = requestAnimationFrame(this.draw);
    }
  }, {
    key: 'reset',
    value: function reset() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(BaseDraw.prototype), 'reset', this).call(this);
      this.ctx.clearRect(0, 0, this.params.width, this.params.height);
      this.cachedCtx.clearRect(0, 0, this.params.width, this.params.height);
    }
  }, {
    key: 'finalize',
    value: function finalize(endTime) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(BaseDraw.prototype), 'finalize', this).call(this, endTime);
      cancelAnimationFrame(this._rafId);
    }

    /**
     * Add the current frame to the frames to draw. Should not be overriden.
     * @inheritdoc
     * @final
     */

  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var buffer = frame.buffer.slice(0); // copy values instead of reference
      var copy = new Float32Array(buffer);

      this._stack.push({ time: time, frame: copy, metaData: metaData });
    }
  }, {
    key: 'draw',
    value: function draw() {
      for (var i = 0, length = this._stack.length; i < length; i++) {
        var event = this._stack[i];
        this.executeDraw(event.time, event.frame);
      }

      // reinit stack for next call
      this._stack.length = 0;
      this._rafId = requestAnimationFrame(this.draw);
    }
  }, {
    key: 'executeDraw',
    value: function executeDraw(time, frame) {
      this.scrollModeDraw(time, frame);
    }
  }, {
    key: 'resize',
    value: function resize(width, height) {
      var ctx = this.ctx;
      var cachedCtx = this.cachedCtx;

      // @todo - fix this, problem with the cached canvas...
      // http://www.html5rocks.com/en/tutorials/canvas/hidpi/
      // const auto = true;
      // const devicePixelRatio = window.devicePixelRatio || 1;
      // const backingStoreRatio = ctx.webkitBackingStorePixelRatio ||
      //                     ctx.mozBackingStorePixelRatio ||
      //                     ctx.msBackingStorePixelRatio ||
      //                     ctx.oBackingStorePixelRatio ||
      //                     ctx.backingStorePixelRatio || 1;

      // if (auto && devicePixelRatio !== backingStoreRatio) {
      //   const ratio = devicePixelRatio / backingStoreRatio;

      //   this.params.width = width * ratio;
      //   this.params.height = height * ratio;

      //   ctx.canvas.width = cachedCtx.canvas.width = this.params.width;
      //   ctx.canvas.height = cachedCtx.canvas.height = this.params.height;

      //   ctx.canvas.style.width = `${width}px`;
      //   ctx.canvas.style.height = `${height}px`;

      //   ctx.scale(ratio, ratio);
      // } else {
      this.params.width = width;
      this.params.height = height;

      ctx.canvas.width = cachedCtx.canvas.width = width;
      ctx.canvas.height = cachedCtx.canvas.height = height;
      // }

      // clear cache canvas
      cachedCtx.clearRect(0, 0, this.params.width, this.params.height);
      // update scale
      this._setYScale();
    }

    // default draw mode

  }, {
    key: 'scrollModeDraw',
    value: function scrollModeDraw(time, frame) {
      var ctx = this.ctx;
      var width = this.params.width;
      var height = this.params.height;
      var duration = this.params.duration;

      var dt = time - this.previousTime;
      var fShift = dt / duration * width - this.lastShiftError;
      var iShift = Math.round(fShift);
      this.lastShiftError = iShift - fShift;

      var partialShift = iShift - this.currentPartialShift;
      this.shiftCanvas(partialShift);

      // shift all siblings if synchronized
      if (this.params.isSynchronized && this.synchronizer) this.synchronizer.shiftSiblings(partialShift, this);

      // translate to the current frame and draw a new polygon
      ctx.save();
      ctx.translate(width, 0);
      this.drawCurve(frame, this.previousFrame, iShift);
      ctx.restore();
      // update `currentPartialShift`
      this.currentPartialShift -= iShift;
      // save current state into buffer canvas
      this.cachedCtx.clearRect(0, 0, width, height);
      this.cachedCtx.drawImage(this.canvas, 0, 0, width, height);

      this.previousFrame.set(frame, 0);
      this.previousTime = time;
    }
  }, {
    key: 'shiftCanvas',
    value: function shiftCanvas(shift) {
      var ctx = this.ctx;
      var width = this.params.width;
      var height = this.params.height;

      this.currentPartialShift += shift;

      ctx.clearRect(0, 0, width, height);
      ctx.save();

      var croppedWidth = width - this.currentPartialShift;

      ctx.drawImage(this.cachedCanvas, this.currentPartialShift, 0, croppedWidth, height, 0, 0, croppedWidth, height);

      ctx.restore();
    }

    /**
     * Interface method to implement in order to define how to draw the shape
     * between the previous and the current frame, assuming the canvas context
     * is centered on the current frame.
     * @param {Float32Array} frame - The current frame to draw.
     * @param {Float32Array} prevFrame - The last frame.
     * @param {Number} iShift - the number of pixels between the last and the current frame.
     */

  }, {
    key: 'drawCurve',
    value: function drawCurve(frame, prevFrame, iShift) {
      console.error('must be implemented');
    }
  }, {
    key: 'duration',
    set: function set(duration) {
      this.params.duration = duration;
    }
  }, {
    key: 'min',
    set: function set(min) {
      this.params.min = min;
      this._setYScale();
    }
  }, {
    key: 'max',
    set: function set(max) {
      this.params.max = max;
      this._setYScale();
    }
  }]);
  return BaseDraw;
}(_baseLfo2.default);

exports.default = BaseDraw;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/assign":91,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],68:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _drawUtils = require('../utils/draw-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Bpf = function (_BaseDraw) {
  (0, _inherits3.default)(Bpf, _BaseDraw);

  function Bpf(options) {
    (0, _classCallCheck3.default)(this, Bpf);


    // for loop mode

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Bpf).call(this, {
      trigger: false,
      radius: 0,
      line: true
    }, options));

    _this.currentXPosition = 0;
    return _this;
  }

  (0, _createClass3.default)(Bpf, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(Bpf.prototype), 'initialize', this).call(this, inStreamParams);

      // create an array of colors according to the `outFrame` size
      if (!this.params.colors) {
        this.params.colors = [];

        for (var i = 0, l = this.streamParams.frameSize; i < l; i++) {
          this.params.colors.push((0, _drawUtils.getRandomColor)());
        }
      }
    }

    // allow to witch easily between the 2 modes

  }, {
    key: 'setTrigger',
    value: function setTrigger(bool) {
      this.params.trigger = bool;
      // clear canvas and cache
      this.ctx.clearRect(0, 0, this.params.width, this.params.height);
      this.cachedCtx.clearRect(0, 0, this.params.width, this.params.height);
      // reset currentXPosition
      this.currentXPosition = 0;
      this.lastShiftError = 0;
    }
  }, {
    key: 'executeDraw',
    value: function executeDraw(time, frame) {
      if (this.params.trigger) this.triggerModeDraw(time, frame);else this.scrollModeDraw(time, frame);

      (0, _get3.default)((0, _getPrototypeOf2.default)(Bpf.prototype), 'process', this).call(this, time, frame);
    }

    /**
     * Alternative drawing mode.
     * Draw from left to right, go back to left when > width
     */

  }, {
    key: 'triggerModeDraw',
    value: function triggerModeDraw(time, frame) {
      var width = this.params.width;
      var height = this.params.height;
      var duration = this.params.duration;
      var ctx = this.ctx;

      var dt = time - this.previousTime;
      var fShift = dt / duration * width - this.lastShiftError; // px
      var iShift = Math.round(fShift);
      this.lastShiftError = iShift - fShift;

      this.currentXPosition += iShift;

      // draw the right part
      ctx.save();
      ctx.translate(this.currentXPosition, 0);
      ctx.clearRect(-iShift, 0, iShift, height);
      this.drawCurve(frame, iShift);
      ctx.restore();

      // go back to the left of the canvas and redraw the same thing
      if (this.currentXPosition > width) {
        // go back to start
        this.currentXPosition -= width;

        ctx.save();
        ctx.translate(this.currentXPosition, 0);
        ctx.clearRect(-iShift, 0, iShift, height);
        this.drawCurve(frame, this.previousFrame, iShift);
        ctx.restore();
      }
    }
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame, prevFrame, iShift) {
      var colors = this.params.colors;
      var ctx = this.ctx;
      var radius = this.params.radius;

      for (var i = 0, l = frame.length; i < l; i++) {
        ctx.save();
        // color should bechosen according to index
        ctx.fillStyle = colors[i];
        ctx.strokeStyle = colors[i];

        var posY = this.getYPosition(frame[i]);
        // as an options ? radius ?
        if (radius > 0) {
          ctx.beginPath();
          ctx.arc(0, posY, radius, 0, Math.PI * 2, false);
          ctx.fill();
          ctx.closePath();
        }

        if (prevFrame && this.params.line) {
          var lastPosY = this.getYPosition(prevFrame[i]);
          // draw line
          ctx.beginPath();
          ctx.moveTo(-iShift, lastPosY);
          ctx.lineTo(0, posY);
          ctx.stroke();
          ctx.closePath();
        }

        ctx.restore();
      }
    }
  }]);
  return Bpf;
}(_baseDraw2.default);

exports.default = Bpf;

},{"../utils/draw-utils":86,"./base-draw":67,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],69:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Create a bridge between `push` to `pull` paradigms.
 * Alias `outFrame` to `data` and accumulate incomming frames into it.
 */

var Bridge = function (_BaseLfo) {
  (0, _inherits3.default)(Bridge, _BaseLfo);

  function Bridge(options, process) {
    (0, _classCallCheck3.default)(this, Bridge);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Bridge).call(this, options));

    _this.process = process.bind(_this);
    _this.data = _this.outFrame = [];
    return _this;
  }

  (0, _createClass3.default)(Bridge, [{
    key: 'setupStream',
    value: function setupStream() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(Bridge.prototype), 'setupStream', this).call(this);
      this.data.length = 0;
    }
  }, {
    key: 'reset',
    value: function reset() {
      this.data.length = 0;
    }
  }]);
  return Bridge;
}(_baseLfo2.default);

exports.default = Bridge;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],70:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var worker = '\nvar _separateArrays = false;\nvar _data = [];\nvar _separateArraysData = { time: [], data: [] };\n\nfunction init() {\n  _data.length = 0;\n  _separateArraysData.time.length = 0;\n  _separateArraysData.data.length = 0;\n}\n\nfunction process(time, data) {\n  if (_separateArrays) {\n    _separateArraysData.time.push(time);\n    _separateArraysData.data.push(data);\n  } else {\n    var datum = { time: time, data: data };\n    _data.push(datum);\n  }\n}\n\nself.addEventListener(\'message\', function(e) {\n  switch (e.data.command) {\n    case \'init\':\n      _separateArrays = e.data.separateArrays;\n      init();\n      break;\n    case \'process\':\n      var time = e.data.time;\n      var data = new Float32Array(e.data.buffer);\n      process(time, data);\n      break;\n    case \'stop\':\n      var data = _separateArrays ? _separateArraysData : _data;\n      self.postMessage({ data: data });\n      init();\n      break;\n  }\n});\n';

var DataRecorder = function (_BaseLfo) {
  (0, _inherits3.default)(DataRecorder, _BaseLfo);

  function DataRecorder(options) {
    (0, _classCallCheck3.default)(this, DataRecorder);


    // @todo - rename `isRecording`

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(DataRecorder).call(this, {
      // default format is [{time, data}, {time, data}]
      // if set to `true` format is { time: [...], data: [...] }
      separateArrays: false
    }, options));

    _this._isStarted = false;

    // init worker
    var blob = new Blob([worker], { type: 'text/javascript' });
    _this.worker = new Worker(window.URL.createObjectURL(blob));
    return _this;
  }

  (0, _createClass3.default)(DataRecorder, [{
    key: 'initialize',
    value: function initialize(inStreamParams) {
      (0, _get3.default)((0, _getPrototypeOf2.default)(DataRecorder.prototype), 'initialize', this).call(this, inStreamParams);

      this.worker.postMessage({
        command: 'init',
        separateArrays: this.params.separateArrays
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this._isStarted = true;
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this._isStarted) {
        this.worker.postMessage({ command: 'stop' });
        this._isStarted = false;
      }
    }
  }, {
    key: 'finalize',
    value: function finalize() {
      this.stop();
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      if (!this._isStarted) {
        return;
      }

      this.outFrame = new Float32Array(frame);
      var buffer = this.outFrame.buffer;

      this.worker.postMessage({
        command: 'process',
        time: time,
        buffer: buffer
      }, [buffer]);
    }
  }, {
    key: 'retrieve',
    value: function retrieve() {
      var _this2 = this;

      return new _promise2.default(function (resolve, reject) {
        var callback = function callback(e) {
          _this2._started = false;

          _this2.worker.removeEventListener('message', callback, false);
          resolve(e.data.data);
        };

        _this2.worker.addEventListener('message', callback, false);
      });
    }
  }]);
  return DataRecorder;
}(_baseLfo2.default);

exports.default = DataRecorder;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/core-js/promise":97,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],71:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioRecorder = require('./audio-recorder');

var _audioRecorder2 = _interopRequireDefault(_audioRecorder);

var _bpf = require('./bpf');

var _bpf2 = _interopRequireDefault(_bpf);

var _bridge = require('./bridge');

var _bridge2 = _interopRequireDefault(_bridge);

var _dataRecorder = require('./data-recorder');

var _dataRecorder2 = _interopRequireDefault(_dataRecorder);

var _marker = require('./marker');

var _marker2 = _interopRequireDefault(_marker);

var _spectrogram = require('./spectrogram');

var _spectrogram2 = _interopRequireDefault(_spectrogram);

var _socketClient = require('./socket-client');

var _socketClient2 = _interopRequireDefault(_socketClient);

var _socketServer = require('./socket-server');

var _socketServer2 = _interopRequireDefault(_socketServer);

var _sonogram = require('./sonogram');

var _sonogram2 = _interopRequireDefault(_sonogram);

var _synchronizedDraw = require('./synchronized-draw');

var _synchronizedDraw2 = _interopRequireDefault(_synchronizedDraw);

var _trace = require('./trace');

var _trace2 = _interopRequireDefault(_trace);

var _waveform = require('./waveform');

var _waveform2 = _interopRequireDefault(_waveform);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  AudioRecorder: _audioRecorder2.default,
  Bpf: _bpf2.default,
  Bridge: _bridge2.default,
  DataRecorder: _dataRecorder2.default,
  Marker: _marker2.default,
  Spectrogram: _spectrogram2.default,
  SocketClient: _socketClient2.default,
  SocketServer: _socketServer2.default,
  Sonogram: _sonogram2.default,
  SynchronizedDraw: _synchronizedDraw2.default,
  Trace: _trace2.default,
  Waveform: _waveform2.default
};

},{"./audio-recorder":66,"./bpf":68,"./bridge":69,"./data-recorder":70,"./marker":72,"./socket-client":73,"./socket-server":74,"./sonogram":75,"./spectrogram":76,"./synchronized-draw":77,"./trace":78,"./waveform":79}],72:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _drawUtils = require('../utils/draw-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Marker = function (_BaseDraw) {
  (0, _inherits3.default)(Marker, _BaseDraw);

  function Marker(options) {
    (0, _classCallCheck3.default)(this, Marker);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Marker).call(this, {
      frameSize: 1,
      color: (0, _drawUtils.getRandomColor)(),
      threshold: 0
    }, options));
  }

  (0, _createClass3.default)(Marker, [{
    key: 'drawCurve',
    value: function drawCurve(frame, prevFrame, iShift) {
      var color = this.params.color;
      var ctx = this.ctx;
      var height = ctx.height;

      var value = frame[0];

      if (value > this.params.threshold) {
        ctx.save();
        ctx.strokeStyle = this.params.color;
        ctx.beginPath();
        ctx.moveTo(-iShift, this.getYPosition(this.params.min));
        ctx.lineTo(-iShift, this.getYPosition(this.params.max));
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
    }
  }]);
  return Marker;
}(_baseDraw2.default);

exports.default = Marker;

},{"../utils/draw-utils":86,"./base-draw":67,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],73:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

var _socketUtils = require('../utils/socket-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// send an Lfo stream from the browser over the network
// through a WebSocket - should be paired with a SocketSourceServer
// @NOTE: does it need to implement some ping process to maintain connection ?

var SocketClient = function (_BaseLfo) {
  (0, _inherits3.default)(SocketClient, _BaseLfo);

  function SocketClient(options) {
    (0, _classCallCheck3.default)(this, SocketClient);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SocketClient).call(this, {
      port: 3030,
      address: window.location.hostname
    }, options));

    _this.socket = null;
    _this.initConnection();
    return _this;
  }

  (0, _createClass3.default)(SocketClient, [{
    key: 'initConnection',
    value: function initConnection() {
      var _this2 = this;

      var socketAddr = 'ws://' + this.params.address + ':' + this.params.port;
      this.socket = new WebSocket(socketAddr);
      this.socket.binaryType = 'arraybuffer';

      // callback to start to when WebSocket is connected
      this.socket.onopen = function () {
        _this2.params.onopen();
      };

      this.socket.onclose = function () {};

      this.socket.onmessage = function () {};

      this.socket.onerror = function (err) {
        console.error(err);
      };
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var buffer = (0, _socketUtils.encodeMessage)(time, frame, metaData);
      this.socket.send(buffer);
    }
  }]);
  return SocketClient;
}(_baseLfo2.default);

exports.default = SocketClient;

},{"../core/base-lfo":51,"../utils/socket-utils":88,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],74:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

var _ws = require('ws');

var ws = _interopRequireWildcard(_ws);

var _socketUtils = require('../utils/socket-utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SocketServer = function (_BaseLfo) {
  (0, _inherits3.default)(SocketServer, _BaseLfo);

  function SocketServer(options) {
    (0, _classCallCheck3.default)(this, SocketServer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SocketServer).call(this, {
      port: 3031
    }, options));

    _this.server = null;
    _this.initServer();
    return _this;
  }

  (0, _createClass3.default)(SocketServer, [{
    key: 'initServer',
    value: function initServer() {
      this.server = new ws.Server({ port: this.params.port });
    }
  }, {
    key: 'process',
    value: function process(time, frame, metaData) {
      var arrayBuffer = (0, _socketUtils.encodeMessage)(time, frame, metaData);
      var buffer = (0, _socketUtils.arrayBufferToBuffer)(arrayBuffer);

      this.server.clients.forEach(function (client) {
        client.send(buffer);
      });
    }
  }]);
  return SocketServer;
}(_baseLfo2.default);

exports.default = SocketServer;

},{"../core/base-lfo":51,"../utils/socket-utils":88,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104,"ws":201}],75:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _drawUtils = require('../utils/draw-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var counter = 0;

var Sonogram = function (_BaseDraw) {
  (0, _inherits3.default)(Sonogram, _BaseDraw);

  function Sonogram(options) {
    (0, _classCallCheck3.default)(this, Sonogram);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Sonogram).call(this, {
      scale: 1
    }, options));
  }

  (0, _createClass3.default)(Sonogram, [{
    key: 'drawCurve',
    value: function drawCurve(frame, previousFrame, iShift) {
      var ctx = this.ctx;
      var height = this.params.height;
      var scale = this.params.scale;
      var binPerPixel = frame.length / this.params.height;

      for (var i = 0; i < height; i++) {
        // interpolate between prev and next bins
        // is not a very good strategy if more than two bins per pixels
        // some values won't be taken into account
        // this hack is not reliable
        // -> could we resample the frame in frequency domain ?
        var fBin = i * binPerPixel;
        var prevBinIndex = Math.floor(fBin);
        var nextBinIndex = Math.ceil(fBin);

        var prevBin = frame[prevBinIndex];
        var nextBin = frame[nextBinIndex];

        var position = fBin - prevBinIndex;
        var slope = nextBin - prevBin;
        var intercept = prevBin;
        var weightedBin = slope * position + intercept;
        var sqrtWeightedBin = weightedBin * weightedBin;

        var y = this.params.height - i;
        var c = Math.round(sqrtWeightedBin * scale * 255);

        ctx.fillStyle = 'rgba(' + c + ', ' + c + ', ' + c + ', 1)';
        ctx.fillRect(-iShift, y, iShift, -1);
      }
    }
  }, {
    key: 'scale',
    set: function set(value) {
      this.params.scale = value;
    },
    get: function get() {
      return this.params.scale;
    }
  }]);
  return Sonogram;
}(_baseDraw2.default);

exports.default = Sonogram;

},{"../utils/draw-utils":86,"./base-draw":67,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],76:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _drawUtils = require('../utils/draw-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Spectrogram = function (_BaseDraw) {
  (0, _inherits3.default)(Spectrogram, _BaseDraw);

  function Spectrogram(options) {
    (0, _classCallCheck3.default)(this, Spectrogram);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Spectrogram).call(this, {
      min: 0,
      max: 1,
      scale: 1,
      color: (0, _drawUtils.getRandomColor)()
    }, options));
  }

  (0, _createClass3.default)(Spectrogram, [{
    key: 'executeDraw',


    // no need to scroll or anything
    value: function executeDraw(time, frame) {
      this.drawCurve(frame);
    }
  }, {
    key: 'drawCurve',
    value: function drawCurve(frame) {
      var nbrBins = frame.length;
      var width = this.params.width;
      var height = this.params.height;
      var binWidth = width / nbrBins;
      var scale = this.params.scale;
      var ctx = this.ctx;

      ctx.fillStyle = this.params.color;
      ctx.clearRect(0, 0, width, height);

      // error handling needs review...
      var error = 0;

      for (var i = 0; i < nbrBins; i++) {
        var x1Float = i * binWidth + error;
        var x1Int = Math.round(x1Float);
        var x2Float = x1Float + (binWidth - error);
        var x2Int = Math.round(x2Float);

        error = x2Int - x2Float;

        if (x1Int !== x2Int) {
          var _width = x2Int - x1Int;
          var y = this.getYPosition(frame[i] * scale);
          ctx.fillRect(x1Int, y, _width, height - y);
        } else {
          error -= binWidth;
        }
      }
    }
  }, {
    key: 'scale',
    set: function set(value) {
      this.params.scale = value;
    },
    get: function get() {
      return this.params.scale;
    }
  }]);
  return Spectrogram;
}(_baseDraw2.default);

exports.default = Spectrogram;

},{"../utils/draw-utils":86,"./base-draw":67,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],77:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * is used to keep several draw in sync
 * when a view is installed in a synchronized draw
 * the meta view is installed as a member of all it's children
 */

var SynchronizedDraw = function () {
  function SynchronizedDraw() {
    (0, _classCallCheck3.default)(this, SynchronizedDraw);

    this.views = [];
    this.add.apply(this, arguments);
  }

  (0, _createClass3.default)(SynchronizedDraw, [{
    key: "add",
    value: function add() {
      var _this = this;

      for (var _len = arguments.length, views = Array(_len), _key = 0; _key < _len; _key++) {
        views[_key] = arguments[_key];
      }

      views.forEach(function (view) {
        _this.install(view);
      });
    }
  }, {
    key: "install",
    value: function install(view) {
      this.views.push(view);
      view.params.isSynchronized = true;
      view.synchronizer = this;
    }
  }, {
    key: "shiftSiblings",
    value: function shiftSiblings(iShift, view) {
      this.views.forEach(function (child) {
        if (child === view) {
          return;
        }
        child.shiftCanvas(iShift);
      });
    }
  }]);
  return SynchronizedDraw;
}();

exports.default = SynchronizedDraw;

},{"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101}],78:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _drawUtils = require('../utils/draw-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Trace = function (_BaseDraw) {
  (0, _inherits3.default)(Trace, _BaseDraw);

  function Trace(options) {
    (0, _classCallCheck3.default)(this, Trace);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Trace).call(this, {
      colorScheme: 'none', // color, opacity
      color: (0, _drawUtils.getRandomColor)()
    }, options));
  }

  (0, _createClass3.default)(Trace, [{
    key: 'drawCurve',
    value: function drawCurve(frame, prevFrame, iShift) {
      var ctx = this.ctx;
      var color = void 0,
          gradient = void 0;

      var halfRange = frame[1] / 2;
      var mean = this.getYPosition(frame[0]);
      var min = this.getYPosition(frame[0] - halfRange);
      var max = this.getYPosition(frame[0] + halfRange);

      var prevHalfRange = void 0;
      var prevMin = void 0;
      var prevMax = void 0;

      if (prevFrame) {
        prevHalfRange = prevFrame[1] / 2;
        prevMin = this.getYPosition(prevFrame[0] - prevHalfRange);
        prevMax = this.getYPosition(prevFrame[0] + prevHalfRange);
      }

      switch (this.params.colorScheme) {
        case 'none':
          ctx.fillStyle = this.params.color;
          break;
        case 'hue':
          gradient = ctx.createLinearGradient(-iShift, 0, 0, 0);

          if (prevFrame) gradient.addColorStop(0, 'hsl(' + (0, _drawUtils.getHue)(prevFrame[2]) + ', 100%, 50%)');else gradient.addColorStop(0, 'hsl(' + (0, _drawUtils.getHue)(frame[2]) + ', 100%, 50%)');

          gradient.addColorStop(1, 'hsl(' + (0, _drawUtils.getHue)(frame[2]) + ', 100%, 50%)');
          ctx.fillStyle = gradient;
          break;
        case 'opacity':
          var rgb = (0, _drawUtils.hexToRGB)(this.params.color);
          gradient = ctx.createLinearGradient(-iShift, 0, 0, 0);

          if (prevFrame) gradient.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + prevFrame[2] + ')');else gradient.addColorStop(0, 'rgba(' + rgb.join(',') + ',' + frame[2] + ')');

          gradient.addColorStop(1, 'rgba(' + rgb.join(',') + ',' + frame[2] + ')');
          ctx.fillStyle = gradient;
          break;
      }

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, mean);
      ctx.lineTo(0, max);

      if (prevFrame) {
        ctx.lineTo(-iShift, prevMax);
        ctx.lineTo(-iShift, prevMin);
      }

      ctx.lineTo(0, min);
      ctx.closePath();

      ctx.fill();
      ctx.restore();
    }
  }]);
  return Trace;
}(_baseDraw2.default);

exports.default = Trace;
;

module.exports = Trace;

},{"../utils/draw-utils":86,"./base-draw":67,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],79:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseDraw = require('./base-draw');

var _baseDraw2 = _interopRequireDefault(_baseDraw);

var _drawUtils = require('../utils/draw-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Waveform = function (_BaseDraw) {
  (0, _inherits3.default)(Waveform, _BaseDraw);

  function Waveform(options) {
    (0, _classCallCheck3.default)(this, Waveform);
    return (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(Waveform).call(this, {
      color: (0, _drawUtils.getRandomColor)()
    }, options));
  }

  (0, _createClass3.default)(Waveform, [{
    key: 'drawCurve',
    value: function drawCurve(frame, previousFrame, iShift) {
      var ctx = this.ctx;
      var min = this.getYPosition(frame[0]);
      var max = this.getYPosition(frame[1]);

      ctx.save();

      ctx.fillStyle = this.params.color;
      ctx.beginPath();

      ctx.moveTo(0, this.getYPosition(0));
      ctx.lineTo(0, max);

      if (previousFrame) {
        var prevMin = this.getYPosition(previousFrame[0]);
        var prevMax = this.getYPosition(previousFrame[1]);
        ctx.lineTo(-iShift, prevMax);
        ctx.lineTo(-iShift, prevMin);
      }

      ctx.lineTo(0, min);

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }]);
  return Waveform;
}(_baseDraw2.default);

exports.default = Waveform;

},{"../utils/draw-utils":86,"./base-draw":67,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],80:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var workerCode = '\nself.addEventListener(\'message\', function process(e) {\n  var blockSize = e.data.blockSize;\n  var bufferSource = e.data.buffer;\n  var buffer = new Float32Array(bufferSource);\n  var length = buffer.length;\n  var index = 0;\n\n  while (index < length) {\n    var copySize = Math.min(length - index, blockSize);\n    var block = buffer.subarray(index, index + copySize);\n    var sendBlock = new Float32Array(block);\n\n    postMessage({\n      command: \'process\',\n      index: index,\n      buffer: sendBlock.buffer,\n    }, [sendBlock.buffer]);\n\n    index += copySize;\n  }\n\n  postMessage({\n    command: \'finalize\',\n    index: index,\n    buffer: bufferSource,\n  }, [bufferSource]);\n}, false)';

var _PseudoWorker = function () {
  function _PseudoWorker() {
    (0, _classCallCheck3.default)(this, _PseudoWorker);

    this._callback = null;
  }

  (0, _createClass3.default)(_PseudoWorker, [{
    key: 'postMessage',
    value: function postMessage(e) {
      var blockSize = e.blockSize;
      var bufferSource = e.buffer;
      var buffer = new Float32Array(bufferSource);
      var length = buffer.length;
      var that = this;
      var index = 0;

      (function slice() {
        if (index < length) {
          var copySize = Math.min(length - index, blockSize);
          var block = buffer.subarray(index, index + copySize);
          var sendBlock = new Float32Array(block);

          that._send({
            command: 'process',
            index: index,
            buffer: sendBlock.buffer
          });

          index += copySize;
          setTimeout(slice, 0);
        } else {
          that._send({
            command: 'finalize',
            index: index,
            buffer: buffer
          });
        }
      })();
    }
  }, {
    key: 'addListener',
    value: function addListener(callback) {
      this._callback = callback;
    }
  }, {
    key: '_send',
    value: function _send(msg) {
      this._callback({ data: msg });
    }
  }]);
  return _PseudoWorker;
}();

/**
 * AudioBuffer as source, sliced it in blocks through a worker
 */


var AudioInBuffer = function (_BaseLfo) {
  (0, _inherits3.default)(AudioInBuffer, _BaseLfo);

  function AudioInBuffer() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, AudioInBuffer);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AudioInBuffer).call(this, {
      frameSize: 512,
      channel: 0,
      ctx: null,
      buffer: null,
      useWorker: true
    }, options));

    _this.buffer = _this.params.buffer;
    _this.endTime = 0;

    if (!_this.params.ctx || !(_this.params.ctx instanceof AudioContext)) throw new Error('Missing audio context parameter (ctx)');

    if (!_this.params.buffer || !(_this.params.buffer instanceof AudioBuffer)) throw new Error('Missing audio buffer parameter (buffer)');

    _this.blob = new Blob([workerCode], { type: "text/javascript" });
    _this.worker = null;

    _this.process = _this.process.bind(_this);
    return _this;
  }

  (0, _createClass3.default)(AudioInBuffer, [{
    key: 'setupStream',
    value: function setupStream() {
      this.outFrame = null;
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(AudioInBuffer.prototype), 'initialize', this).call(this, {
        frameSize: this.params.frameSize,
        frameRate: this.buffer.sampleRate / this.params.frameSize,
        sourceSampleRate: this.buffer.sampleRate
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this.initialize();
      this.reset();

      if (this.params.useWorker) {
        this.worker = new Worker(window.URL.createObjectURL(this.blob));
        this.worker.addEventListener('message', this.process, false);
      } else {
        this.worker = new _PseudoWorker();
        this.worker.addListener(this.process);
      }

      this.endTime = 0;

      var buffer = this.buffer.getChannelData(this.params.channel).buffer;
      var sendBuffer = buffer;

      if (this.params.useWorker) sendBuffer = buffer.slice(0);

      this.worker.postMessage({
        blockSize: this.streamParams.frameSize,
        buffer: sendBuffer
      }, [sendBuffer]);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.worker.terminate();
      this.worker = null;

      this.finalize(this.endTime);
    }

    // worker callback

  }, {
    key: 'process',
    value: function process(e) {
      var sourceSampleRate = this.streamParams.sourceSampleRate;
      var command = e.data.command;
      var index = e.data.index;
      var buffer = e.data.buffer;
      var time = index / sourceSampleRate;

      if (command === 'finalize') {
        this.finalize(time);
      } else {
        this.outFrame = new Float32Array(buffer);
        this.time = time;
        this.output();

        this.endTime = this.time + this.outFrame.length / sourceSampleRate;
      }
    }
  }]);
  return AudioInBuffer;
}(_baseLfo2.default);

exports.default = AudioInBuffer;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],81:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *  Use a WebAudio node as a source
 */

var AudioInNode = function (_BaseLfo) {
  (0, _inherits3.default)(AudioInNode, _BaseLfo);

  function AudioInNode() {
    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    (0, _classCallCheck3.default)(this, AudioInNode);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(AudioInNode).call(this, {
      frameSize: 512,
      channel: 0,
      ctx: null,
      src: null
    }, options));

    if (!_this.params.ctx || !(_this.params.ctx instanceof AudioContext)) {
      throw new Error('Missing audio context parameter (ctx)');
    }

    if (!_this.params.src || !(_this.params.src instanceof AudioNode)) {
      throw new Error('Missing audio source node parameter (src)');
    }
    return _this;
  }

  (0, _createClass3.default)(AudioInNode, [{
    key: 'initialize',
    value: function initialize() {
      var ctx = this.params.ctx;

      (0, _get3.default)((0, _getPrototypeOf2.default)(AudioInNode.prototype), 'initialize', this).call(this, {
        frameSize: this.params.frameSize,
        frameRate: ctx.sampleRate / this.params.frameSize,
        sourceSampleRate: ctx.sampleRate
      });

      var blockSize = this.streamParams.frameSize;
      this.scriptProcessor = ctx.createScriptProcessor(blockSize, 1, 1);

      // prepare audio graph
      this.scriptProcessor.onaudioprocess = this.process.bind(this);
      this.params.src.connect(this.scriptProcessor);
    }

    // connect the audio nodes to start streaming

  }, {
    key: 'start',
    value: function start() {
      this.initialize();
      this.reset();
      this.time = 0;
      this.scriptProcessor.connect(this.params.ctx.destination);
    }
  }, {
    key: 'stop',
    value: function stop() {
      this.finalize(this.time);
      this.scriptProcessor.disconnect();
    }

    // is basically the `scriptProcessor.onaudioprocess` callback

  }, {
    key: 'process',
    value: function process(e) {
      var block = e.inputBuffer.getChannelData(this.params.channel);

      if (!this.blockDuration) this.blockDuration = block.length / this.streamParams.sourceSampleRate;

      this.outFrame = block;
      this.output();

      this.time += this.blockDuration;
    }
  }]);
  return AudioInNode;
}(_baseLfo2.default);

exports.default = AudioInNode;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],82:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventIn = function (_BaseLfo) {
  (0, _inherits3.default)(EventIn, _BaseLfo);

  function EventIn(options) {
    (0, _classCallCheck3.default)(this, EventIn);


    // test AudioContext for use in node environment

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(EventIn).call(this, {
      absoluteTime: false
    }, options));

    if (!_this.params.ctx && typeof process === 'undefined') {
      _this.params.ctx = new AudioContext();
    }

    _this._isStarted = false;
    _this._startTime = undefined;
    return _this;
  }

  (0, _createClass3.default)(EventIn, [{
    key: 'initialize',
    value: function initialize() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(EventIn.prototype), 'initialize', this).call(this, {
        frameSize: this.params.frameSize,
        frameRate: this.params.frameRate,
        sourceSampleRate: this.params.frameRate
      });
    }
  }, {
    key: 'start',
    value: function start() {
      this.initialize();
      this.reset();

      var currentTime = this.params.ctx.currentTime;

      // should be setted in the first process call
      this._isStarted = true;
      this._startTime = undefined;
      this._lastTime = undefined;
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (this._isStarted && this._startTime) {
        var currentTime = this.params.ctx.currentTime;
        var endTime = this.time + (currentTime - this._lastTime);

        this.finalize(endTime);
      }
    }
  }, {
    key: 'process',
    value: function process(time, frame) {
      var metaData = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      if (!this._isStarted) return;

      var currentTime = this.params.ctx.currentTime;
      // if no time provided, use audioContext.currentTime
      time = !isNaN(parseFloat(time)) && isFinite(time) ? time : currentTime;

      // set `startTime` if first call after a `start`
      if (!this._startTime) this._startTime = time;

      // handle time according to config
      if (this.params.absoluteTime === false) time = time - this._startTime;

      // if scalar, create a vector
      if (frame.length === undefined) frame = [frame];

      // works if frame is an array
      this.outFrame.set(frame, 0);
      this.time = time;
      this.metaData = metaData;
      this._lastTime = currentTime;

      this.output();
    }
  }]);
  return EventIn;
}(_baseLfo2.default);

exports.default = EventIn;


module.exports = EventIn;

},{"../core/base-lfo":51,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],83:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _audioInBuffer = require('./audio-in-buffer');

var _audioInBuffer2 = _interopRequireDefault(_audioInBuffer);

var _audioInNode = require('./audio-in-node');

var _audioInNode2 = _interopRequireDefault(_audioInNode);

var _eventIn = require('./event-in');

var _eventIn2 = _interopRequireDefault(_eventIn);

var _socketClient = require('./socket-client');

var _socketClient2 = _interopRequireDefault(_socketClient);

var _socketServer = require('./socket-server');

var _socketServer2 = _interopRequireDefault(_socketServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
  AudioInBuffer: _audioInBuffer2.default,
  AudioInNode: _audioInNode2.default,
  EventIn: _eventIn2.default,
  SocketClient: _socketClient2.default,
  SocketServer: _socketServer2.default
};

},{"./audio-in-buffer":80,"./audio-in-node":81,"./event-in":82,"./socket-client":84,"./socket-server":85}],84:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

var _socketUtils = require('../utils/socket-utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @TODO: handle `start` and `stop`

var SocketClient = function (_BaseLfo) {
  (0, _inherits3.default)(SocketClient, _BaseLfo);

  function SocketClient(options) {
    (0, _classCallCheck3.default)(this, SocketClient);

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SocketClient).call(this, {
      port: 3031,
      address: window.location.hostname
    }, options));

    _this.socket = null;
    _this.initConnection();
    return _this;
  }

  (0, _createClass3.default)(SocketClient, [{
    key: 'start',
    value: function start() {
      this.initialize();
      this.reset();
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      (0, _get3.default)((0, _getPrototypeOf2.default)(SocketClient.prototype), 'initialize', this).call(this, undefined, {
        frameSize: this.params.frameSize,
        frameRate: this.params.frameRate
      });
    }
  }, {
    key: 'initConnection',
    value: function initConnection() {
      var _this2 = this;

      var socketAddr = 'ws://' + this.params.address + ':' + this.params.port;
      this.socket = new WebSocket(socketAddr);
      this.socket.binaryType = 'arraybuffer';

      // callback to start to when WebSocket is connected
      this.socket.onopen = function () {
        _this2.start();
      };

      this.socket.onclose = function () {};

      this.socket.onmessage = function (message) {
        _this2.process(message.data);
      };

      this.socket.onerror = function (err) {
        console.error(err);
      };
    }
  }, {
    key: 'process',
    value: function process(buffer) {
      var message = (0, _socketUtils.decodeMessage)(buffer);

      this.time = message.time;
      this.outFrame = message.frame;
      this.metaData = message.metaData;

      this.output();
    }
  }]);
  return SocketClient;
}(_baseLfo2.default);

exports.default = SocketClient;

},{"../core/base-lfo":51,"../utils/socket-utils":88,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/get":102,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104}],85:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _baseLfo = require('../core/base-lfo');

var _baseLfo2 = _interopRequireDefault(_baseLfo);

var _ws = require('ws');

var ws = _interopRequireWildcard(_ws);

var _socketUtils = require('../utils/socket-utils');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// @TODO: handle `start` and `stop`

var SocketServer = function (_BaseLfo) {
  (0, _inherits3.default)(SocketServer, _BaseLfo);

  function SocketServer(options) {
    (0, _classCallCheck3.default)(this, SocketServer);


    // @TODO handle disconnect and so on...

    var _this = (0, _possibleConstructorReturn3.default)(this, (0, _getPrototypeOf2.default)(SocketServer).call(this, {
      port: 3030
    }, options));

    _this.clients = [];
    _this.server = null;
    _this.initServer();

    // @FIXME - right place ?
    _this.start();
    return _this;
  }

  (0, _createClass3.default)(SocketServer, [{
    key: 'start',
    value: function start() {
      this.initialize();
      this.reset();
    }
  }, {
    key: 'initServer',
    value: function initServer() {
      var _this2 = this;

      this.server = new ws.Server({ port: this.params.port });

      this.server.on('connection', function (socket) {
        // this.clients.push(socket);
        socket.on('message', _this2.process.bind(_this2));
      });
    }
  }, {
    key: 'process',
    value: function process(buffer) {
      var arrayBuffer = (0, _socketUtils.bufferToArrayBuffer)(buffer);
      var message = (0, _socketUtils.decodeMessage)(arrayBuffer);

      this.time = message.time;
      this.outFrame = message.frame;
      this.metaData = message.metaData;

      this.output();
    }
  }]);
  return SocketServer;
}(_baseLfo2.default);

exports.default = SocketServer;

},{"../core/base-lfo":51,"../utils/socket-utils":88,"babel-runtime/core-js/object/get-prototype-of":95,"babel-runtime/helpers/classCallCheck":100,"babel-runtime/helpers/createClass":101,"babel-runtime/helpers/inherits":103,"babel-runtime/helpers/possibleConstructorReturn":104,"ws":201}],86:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// http://stackoverflow.com/questions/1484506/random-color-generator-in-javascript
var getRandomColor = exports.getRandomColor = function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// scale from domain [0, 1] to range [270, 0] to consume in
// hsl(x, 100%, 50%) color scheme
var getHue = exports.getHue = function getHue(x) {
  var domainMin = 0;
  var domainMax = 1;
  var rangeMin = 270;
  var rangeMax = 0;

  return (rangeMax - rangeMin) * (x - domainMin) / (domainMax - domainMin) + rangeMin;
};

var hexToRGB = exports.hexToRGB = function hexToRGB(hex) {
  hex = hex.substring(1, 7);
  var r = parseInt(hex.substring(0, 2), 16);
  var g = parseInt(hex.substring(2, 4), 16);
  var b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
};

},{}],87:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

// shortcuts / helpers
var PI = Math.PI;
var cos = Math.cos;
var sin = Math.sin;
var sqrt = Math.sqrt;

// window creation functions
function initHannWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = 0.5 - 0.5 * cos(phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initHammingWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = 0.54 - 0.46 * cos(phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initBlackmanWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = 0.42 - 0.5 * cos(phi) + 0.08 * cos(2 * phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initBlackmanHarrisWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var a0 = 0.35875;
  var a1 = 0.48829;
  var a2 = 0.14128;
  var a3 = 0.01168;
  var step = 2 * PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = a0 - a1 * cos(phi) + a2 * cos(2 * phi);-a3 * cos(3 * phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initSineWindow(buffer, size, normCoefs) {
  var linSum = 0;
  var powSum = 0;
  var step = PI / size;

  for (var i = 0; i < size; i++) {
    var phi = i * step;
    var value = sin(phi);

    buffer[i] = value;

    linSum += value;
    powSum += value * value;
  }

  normCoefs.linear = size / linSum;
  normCoefs.power = sqrt(size / powSum);
}

function initRectangleWindow(buffer, size, normCoefs) {
  // @TODO normCoefs
  for (var i = 0; i < size; i++) {
    buffer[i] = 1;
  }
}

exports.default = function () {
  // @NOTE implement some caching system (is this really usefull ?)
  var cache = {};

  return function (name, buffer, size, normCoefs) {
    name = name.toLowerCase();

    switch (name) {
      case 'hann':
      case 'hanning':
        initHannWindow(buffer, size, normCoefs);
        break;
      case 'hamming':
        initHammingWindow(buffer, size, normCoefs);
        break;
      case 'blackman':
        initBlackmanWindow(buffer, size, normCoefs);
        break;
      case 'blackmanharris':
        initBlackmanHarrisWindow(buffer, size, normCoefs);
        break;
      case 'sine':
        initSineWindow(buffer, size, normCoefs);
        break;
      case 'rectangle':
        initRectangleWindow(buffer, size, normCoefs);
        break;
    }
  };
}();

},{}],88:[function(require,module,exports){
(function (Buffer){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

exports.bufferToArrayBuffer = bufferToArrayBuffer;
exports.arrayBufferToBuffer = arrayBufferToBuffer;
exports.encodeMessage = encodeMessage;
exports.decodeMessage = decodeMessage;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// http://updates.html5rocks.com/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
function Uint16Array2str(buf) {
  return String.fromCharCode.apply(null, buf);
}

function str2Uint16Array(str) {
  var buffer = new ArrayBuffer(str.length * 2); // 2 bytes for each char
  var bufferView = new Uint16Array(buffer);

  for (var i = 0, l = str.length; i < l; i++) {
    bufferView[i] = str.charCodeAt(i);
  }
  return bufferView;
}

//http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
// converts a nodejs Buffer to ArrayBuffer
function bufferToArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

function arrayBufferToBuffer(arrayBuffer) {
  var buffer = new Buffer(arrayBuffer.byteLength);
  var view = new Uint8Array(arrayBuffer);
  for (var i = 0; i < buffer.length; ++i) {
    buffer[i] = view[i];
  }
  return buffer;
}

// @TODO `encodeMessage` and `decodeMessage` could probably use DataView to parse the buffer

// concat the lfo stream, time and metaData into a single buffer
// the concatenation is done as follow :
//  * time          => 8 bytes
//  * frame.length  => 2 bytes
//  * frame         => 4 * frameLength bytes
//  * metaData      => rest of the message
// @return  ArrayBuffer of the created message
// @note    must create a new buffer each time because metaData length is not known
function encodeMessage(time, frame, metaData) {
  // should probably use use DataView instead
  // http://www.html5rocks.com/en/tutorials/webgl/typed_arrays/
  var time64 = new Float64Array(1);
  time64[0] = time;
  var time16 = new Uint16Array(time64.buffer);

  var length16 = new Uint16Array(1);
  length16[0] = frame.length;

  var frame16 = new Uint16Array(frame.buffer);

  var metaData16 = str2Uint16Array((0, _stringify2.default)(metaData));

  var bufferLength = time16.length + length16.length + frame16.length + metaData16.length;

  var buffer = new Uint16Array(bufferLength);

  // buffer is the concatenation of time, frameLength, frame, metaData
  buffer.set(time16, 0);
  buffer.set(length16, time16.length);
  buffer.set(frame16, time16.length + length16.length);
  buffer.set(metaData16, time16.length + length16.length + frame16.length);

  return buffer.buffer;
}

// recreate the Lfo stream (time, frame, metaData) form a buffer
// created with `encodeMessage`
function decodeMessage(buffer) {
  // time is a float64Array of size 1 (8 bytes)
  var timeArray = new Float64Array(buffer.slice(0, 8));
  var time = timeArray[0];

  // frame length is encoded in 2 bytes
  var frameLengthArray = new Uint16Array(buffer.slice(8, 10));
  var frameLength = frameLengthArray[0];

  // frame is a float32Array (4 bytes) * frameLength
  var frameByteLength = 4 * frameLength;
  var frame = new Float32Array(buffer.slice(10, 10 + frameByteLength));

  // metaData is the rest of the buffer
  var metaDataArray = new Uint16Array(buffer.slice(10 + frameByteLength));
  // JSON.parse here crashes node because of this character : `\u0000` (null in unicode) ??
  var metaData = Uint16Array2str(metaDataArray);
  metaData = JSON.parse(metaData.replace(/\u0000/g, ''));

  return { time: time, frame: frame, metaData: metaData };
}

}).call(this,require("buffer").Buffer)

},{"babel-runtime/core-js/json/stringify":90,"buffer":25}],89:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/array/from"), __esModule: true };
},{"core-js/library/fn/array/from":106}],90:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/json/stringify"), __esModule: true };
},{"core-js/library/fn/json/stringify":107}],91:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/assign"), __esModule: true };
},{"core-js/library/fn/object/assign":108}],92:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"core-js/library/fn/object/create":109,"dup":14}],93:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"core-js/library/fn/object/define-property":110,"dup":15}],94:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"core-js/library/fn/object/get-own-property-descriptor":111,"dup":16}],95:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/object/get-prototype-of"), __esModule: true };
},{"core-js/library/fn/object/get-prototype-of":112}],96:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"core-js/library/fn/object/set-prototype-of":113,"dup":17}],97:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/promise"), __esModule: true };
},{"core-js/library/fn/promise":114}],98:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol"), __esModule: true };
},{"core-js/library/fn/symbol":115}],99:[function(require,module,exports){
module.exports = { "default": require("core-js/library/fn/symbol/iterator"), __esModule: true };
},{"core-js/library/fn/symbol/iterator":116}],100:[function(require,module,exports){
"use strict";

exports.__esModule = true;

exports.default = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};
},{}],101:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _defineProperty = require("babel-runtime/core-js/object/define-property");

var _defineProperty2 = _interopRequireDefault(_defineProperty);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      (0, _defineProperty2.default)(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
},{"babel-runtime/core-js/object/define-property":93}],102:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _getOwnPropertyDescriptor = require("babel-runtime/core-js/object/get-own-property-descriptor");

var _getOwnPropertyDescriptor2 = _interopRequireDefault(_getOwnPropertyDescriptor);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = (0, _getOwnPropertyDescriptor2.default)(object, property);

  if (desc === undefined) {
    var parent = (0, _getPrototypeOf2.default)(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};
},{"babel-runtime/core-js/object/get-own-property-descriptor":94,"babel-runtime/core-js/object/get-prototype-of":95}],103:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _setPrototypeOf = require("babel-runtime/core-js/object/set-prototype-of");

var _setPrototypeOf2 = _interopRequireDefault(_setPrototypeOf);

var _create = require("babel-runtime/core-js/object/create");

var _create2 = _interopRequireDefault(_create);

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
  }

  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
};
},{"babel-runtime/core-js/object/create":92,"babel-runtime/core-js/object/set-prototype-of":96,"babel-runtime/helpers/typeof":105}],104:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _typeof2 = require("babel-runtime/helpers/typeof");

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
};
},{"babel-runtime/helpers/typeof":105}],105:[function(require,module,exports){
"use strict";

exports.__esModule = true;

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
} : function (obj) {
  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
};
},{"babel-runtime/core-js/symbol":98,"babel-runtime/core-js/symbol/iterator":99}],106:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/es6.array.from');
module.exports = require('../../modules/_core').Array.from;
},{"../../modules/_core":124,"../../modules/es6.array.from":188,"../../modules/es6.string.iterator":198}],107:[function(require,module,exports){
var core  = require('../../modules/_core')
  , $JSON = core.JSON || (core.JSON = {stringify: JSON.stringify});
module.exports = function stringify(it){ // eslint-disable-line no-unused-vars
  return $JSON.stringify.apply($JSON, arguments);
};
},{"../../modules/_core":124}],108:[function(require,module,exports){
require('../../modules/es6.object.assign');
module.exports = require('../../modules/_core').Object.assign;
},{"../../modules/_core":124,"../../modules/es6.object.assign":190}],109:[function(require,module,exports){
require('../../modules/es6.object.create');
var $Object = require('../../modules/_core').Object;
module.exports = function create(P, D){
  return $Object.create(P, D);
};
},{"../../modules/_core":124,"../../modules/es6.object.create":191}],110:[function(require,module,exports){
require('../../modules/es6.object.define-property');
var $Object = require('../../modules/_core').Object;
module.exports = function defineProperty(it, key, desc){
  return $Object.defineProperty(it, key, desc);
};
},{"../../modules/_core":124,"../../modules/es6.object.define-property":192}],111:[function(require,module,exports){
require('../../modules/es6.object.get-own-property-descriptor');
var $Object = require('../../modules/_core').Object;
module.exports = function getOwnPropertyDescriptor(it, key){
  return $Object.getOwnPropertyDescriptor(it, key);
};
},{"../../modules/_core":124,"../../modules/es6.object.get-own-property-descriptor":193}],112:[function(require,module,exports){
require('../../modules/es6.object.get-prototype-of');
module.exports = require('../../modules/_core').Object.getPrototypeOf;
},{"../../modules/_core":124,"../../modules/es6.object.get-prototype-of":194}],113:[function(require,module,exports){
require('../../modules/es6.object.set-prototype-of');
module.exports = require('../../modules/_core').Object.setPrototypeOf;
},{"../../modules/_core":124,"../../modules/es6.object.set-prototype-of":195}],114:[function(require,module,exports){
require('../modules/es6.object.to-string');
require('../modules/es6.string.iterator');
require('../modules/web.dom.iterable');
require('../modules/es6.promise');
module.exports = require('../modules/_core').Promise;
},{"../modules/_core":124,"../modules/es6.object.to-string":196,"../modules/es6.promise":197,"../modules/es6.string.iterator":198,"../modules/web.dom.iterable":200}],115:[function(require,module,exports){
require('../../modules/es6.symbol');
require('../../modules/es6.object.to-string');
module.exports = require('../../modules/_core').Symbol;
},{"../../modules/_core":124,"../../modules/es6.object.to-string":196,"../../modules/es6.symbol":199}],116:[function(require,module,exports){
require('../../modules/es6.string.iterator');
require('../../modules/web.dom.iterable');
module.exports = require('../../modules/_wks')('iterator');
},{"../../modules/_wks":186,"../../modules/es6.string.iterator":198,"../../modules/web.dom.iterable":200}],117:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"dup":31}],118:[function(require,module,exports){
module.exports = function(){ /* empty */ };
},{}],119:[function(require,module,exports){
module.exports = function(it, Constructor, name, forbiddenField){
  if(!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)){
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};
},{}],120:[function(require,module,exports){
var isObject = require('./_is-object');
module.exports = function(it){
  if(!isObject(it))throw TypeError(it + ' is not an object!');
  return it;
};
},{"./_is-object":144}],121:[function(require,module,exports){
// false -> Array#indexOf
// true  -> Array#includes
var toIObject = require('./_to-iobject')
  , toLength  = require('./_to-length')
  , toIndex   = require('./_to-index');
module.exports = function(IS_INCLUDES){
  return function($this, el, fromIndex){
    var O      = toIObject($this)
      , length = toLength(O.length)
      , index  = toIndex(fromIndex, length)
      , value;
    // Array#includes uses SameValueZero equality algorithm
    if(IS_INCLUDES && el != el)while(length > index){
      value = O[index++];
      if(value != value)return true;
    // Array#toIndex ignores holes, Array#includes - not
    } else for(;length > index; index++)if(IS_INCLUDES || index in O){
      if(O[index] === el)return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};
},{"./_to-index":179,"./_to-iobject":181,"./_to-length":182}],122:[function(require,module,exports){
// getting tag from 19.1.3.6 Object.prototype.toString()
var cof = require('./_cof')
  , TAG = require('./_wks')('toStringTag')
  // ES3 wrong here
  , ARG = cof(function(){ return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function(it, key){
  try {
    return it[key];
  } catch(e){ /* empty */ }
};

module.exports = function(it){
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
    // builtinTag case
    : ARG ? cof(O)
    // ES3 arguments fallback
    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};
},{"./_cof":123,"./_wks":186}],123:[function(require,module,exports){
arguments[4][33][0].apply(exports,arguments)
},{"dup":33}],124:[function(require,module,exports){
var core = module.exports = {version: '2.2.2'};
if(typeof __e == 'number')__e = core; // eslint-disable-line no-undef
},{}],125:[function(require,module,exports){
'use strict';
var $defineProperty = require('./_object-dp')
  , createDesc      = require('./_property-desc');

module.exports = function(object, index, value){
  if(index in object)$defineProperty.f(object, index, createDesc(0, value));
  else object[index] = value;
};
},{"./_object-dp":157,"./_property-desc":168}],126:[function(require,module,exports){
// optional / simple context binding
var aFunction = require('./_a-function');
module.exports = function(fn, that, length){
  aFunction(fn);
  if(that === undefined)return fn;
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
    case 2: return function(a, b){
      return fn.call(that, a, b);
    };
    case 3: return function(a, b, c){
      return fn.call(that, a, b, c);
    };
  }
  return function(/* ...args */){
    return fn.apply(that, arguments);
  };
};
},{"./_a-function":117}],127:[function(require,module,exports){
arguments[4][36][0].apply(exports,arguments)
},{"dup":36}],128:[function(require,module,exports){
// Thank's IE8 for his funny defineProperty
module.exports = !require('./_fails')(function(){
  return Object.defineProperty({}, 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_fails":133}],129:[function(require,module,exports){
var isObject = require('./_is-object')
  , document = require('./_global').document
  // in old IE typeof document.createElement is 'object'
  , is = isObject(document) && isObject(document.createElement);
module.exports = function(it){
  return is ? document.createElement(it) : {};
};
},{"./_global":135,"./_is-object":144}],130:[function(require,module,exports){
// IE 8- don't enum bug keys
module.exports = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');
},{}],131:[function(require,module,exports){
// all enumerable object keys, includes symbols
var getKeys = require('./_object-keys')
  , gOPS    = require('./_object-gops')
  , pIE     = require('./_object-pie');
module.exports = function(it){
  var result     = getKeys(it)
    , getSymbols = gOPS.f;
  if(getSymbols){
    var symbols = getSymbols(it)
      , isEnum  = pIE.f
      , i       = 0
      , key;
    while(symbols.length > i)if(isEnum.call(it, key = symbols[i++]))result.push(key);
  } return result;
};
},{"./_object-gops":162,"./_object-keys":165,"./_object-pie":166}],132:[function(require,module,exports){
var global    = require('./_global')
  , core      = require('./_core')
  , ctx       = require('./_ctx')
  , hide      = require('./_hide')
  , PROTOTYPE = 'prototype';

var $export = function(type, name, source){
  var IS_FORCED = type & $export.F
    , IS_GLOBAL = type & $export.G
    , IS_STATIC = type & $export.S
    , IS_PROTO  = type & $export.P
    , IS_BIND   = type & $export.B
    , IS_WRAP   = type & $export.W
    , exports   = IS_GLOBAL ? core : core[name] || (core[name] = {})
    , expProto  = exports[PROTOTYPE]
    , target    = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE]
    , key, own, out;
  if(IS_GLOBAL)source = name;
  for(key in source){
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    if(own && key in exports)continue;
    // export native or passed
    out = own ? target[key] : source[key];
    // prevent global pollution for namespaces
    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
    // bind timers to global for call from export context
    : IS_BIND && own ? ctx(out, global)
    // wrap global constructors for prevent change them in library
    : IS_WRAP && target[key] == out ? (function(C){
      var F = function(a, b, c){
        if(this instanceof C){
          switch(arguments.length){
            case 0: return new C;
            case 1: return new C(a);
            case 2: return new C(a, b);
          } return new C(a, b, c);
        } return C.apply(this, arguments);
      };
      F[PROTOTYPE] = C[PROTOTYPE];
      return F;
    // make static versions for prototype methods
    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
    if(IS_PROTO){
      (exports.virtual || (exports.virtual = {}))[key] = out;
      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
      if(type & $export.R && expProto && !expProto[key])hide(expProto, key, out);
    }
  }
};
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library` 
module.exports = $export;
},{"./_core":124,"./_ctx":126,"./_global":135,"./_hide":137}],133:[function(require,module,exports){
arguments[4][38][0].apply(exports,arguments)
},{"dup":38}],134:[function(require,module,exports){
var ctx         = require('./_ctx')
  , call        = require('./_iter-call')
  , isArrayIter = require('./_is-array-iter')
  , anObject    = require('./_an-object')
  , toLength    = require('./_to-length')
  , getIterFn   = require('./core.get-iterator-method');
module.exports = function(iterable, entries, fn, that, ITERATOR){
  var iterFn = ITERATOR ? function(){ return iterable; } : getIterFn(iterable)
    , f      = ctx(fn, that, entries ? 2 : 1)
    , index  = 0
    , length, step, iterator;
  if(typeof iterFn != 'function')throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if(isArrayIter(iterFn))for(length = toLength(iterable.length); length > index; index++){
    entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
  } else for(iterator = iterFn.call(iterable); !(step = iterator.next()).done; ){
    call(iterator, f, step.value, entries);
  }
};
},{"./_an-object":120,"./_ctx":126,"./_is-array-iter":142,"./_iter-call":145,"./_to-length":182,"./core.get-iterator-method":187}],135:[function(require,module,exports){
arguments[4][39][0].apply(exports,arguments)
},{"dup":39}],136:[function(require,module,exports){
var hasOwnProperty = {}.hasOwnProperty;
module.exports = function(it, key){
  return hasOwnProperty.call(it, key);
};
},{}],137:[function(require,module,exports){
var dP         = require('./_object-dp')
  , createDesc = require('./_property-desc');
module.exports = require('./_descriptors') ? function(object, key, value){
  return dP.f(object, key, createDesc(1, value));
} : function(object, key, value){
  object[key] = value;
  return object;
};
},{"./_descriptors":128,"./_object-dp":157,"./_property-desc":168}],138:[function(require,module,exports){
module.exports = require('./_global').document && document.documentElement;
},{"./_global":135}],139:[function(require,module,exports){
module.exports = !require('./_descriptors') && !require('./_fails')(function(){
  return Object.defineProperty(require('./_dom-create')('div'), 'a', {get: function(){ return 7; }}).a != 7;
});
},{"./_descriptors":128,"./_dom-create":129,"./_fails":133}],140:[function(require,module,exports){
// fast apply, http://jsperf.lnkit.com/fast-apply/5
module.exports = function(fn, args, that){
  var un = that === undefined;
  switch(args.length){
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return              fn.apply(that, args);
};
},{}],141:[function(require,module,exports){
// fallback for non-array-like ES3 and non-enumerable old V8 strings
var cof = require('./_cof');
module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it){
  return cof(it) == 'String' ? it.split('') : Object(it);
};
},{"./_cof":123}],142:[function(require,module,exports){
// check on default Array iterator
var Iterators  = require('./_iterators')
  , ITERATOR   = require('./_wks')('iterator')
  , ArrayProto = Array.prototype;

module.exports = function(it){
  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
};
},{"./_iterators":150,"./_wks":186}],143:[function(require,module,exports){
// 7.2.2 IsArray(argument)
var cof = require('./_cof');
module.exports = Array.isArray || function isArray(arg){
  return cof(arg) == 'Array';
};
},{"./_cof":123}],144:[function(require,module,exports){
arguments[4][41][0].apply(exports,arguments)
},{"dup":41}],145:[function(require,module,exports){
// call something on iterator step with safe closing on error
var anObject = require('./_an-object');
module.exports = function(iterator, fn, value, entries){
  try {
    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch(e){
    var ret = iterator['return'];
    if(ret !== undefined)anObject(ret.call(iterator));
    throw e;
  }
};
},{"./_an-object":120}],146:[function(require,module,exports){
'use strict';
var create         = require('./_object-create')
  , descriptor     = require('./_property-desc')
  , setToStringTag = require('./_set-to-string-tag')
  , IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
require('./_hide')(IteratorPrototype, require('./_wks')('iterator'), function(){ return this; });

module.exports = function(Constructor, NAME, next){
  Constructor.prototype = create(IteratorPrototype, {next: descriptor(1, next)});
  setToStringTag(Constructor, NAME + ' Iterator');
};
},{"./_hide":137,"./_object-create":156,"./_property-desc":168,"./_set-to-string-tag":173,"./_wks":186}],147:[function(require,module,exports){
'use strict';
var LIBRARY        = require('./_library')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , hide           = require('./_hide')
  , has            = require('./_has')
  , Iterators      = require('./_iterators')
  , $iterCreate    = require('./_iter-create')
  , setToStringTag = require('./_set-to-string-tag')
  , getPrototypeOf = require('./_object-gpo')
  , ITERATOR       = require('./_wks')('iterator')
  , BUGGY          = !([].keys && 'next' in [].keys()) // Safari has buggy iterators w/o `next`
  , FF_ITERATOR    = '@@iterator'
  , KEYS           = 'keys'
  , VALUES         = 'values';

var returnThis = function(){ return this; };

module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED){
  $iterCreate(Constructor, NAME, next);
  var getMethod = function(kind){
    if(!BUGGY && kind in proto)return proto[kind];
    switch(kind){
      case KEYS: return function keys(){ return new Constructor(this, kind); };
      case VALUES: return function values(){ return new Constructor(this, kind); };
    } return function entries(){ return new Constructor(this, kind); };
  };
  var TAG        = NAME + ' Iterator'
    , DEF_VALUES = DEFAULT == VALUES
    , VALUES_BUG = false
    , proto      = Base.prototype
    , $native    = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT]
    , $default   = $native || getMethod(DEFAULT)
    , $entries   = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined
    , $anyNative = NAME == 'Array' ? proto.entries || $native : $native
    , methods, key, IteratorPrototype;
  // Fix native
  if($anyNative){
    IteratorPrototype = getPrototypeOf($anyNative.call(new Base));
    if(IteratorPrototype !== Object.prototype){
      // Set @@toStringTag to native iterators
      setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if(!LIBRARY && !has(IteratorPrototype, ITERATOR))hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if(DEF_VALUES && $native && $native.name !== VALUES){
    VALUES_BUG = true;
    $default = function values(){ return $native.call(this); };
  }
  // Define iterator
  if((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])){
    hide(proto, ITERATOR, $default);
  }
  // Plug for library
  Iterators[NAME] = $default;
  Iterators[TAG]  = returnThis;
  if(DEFAULT){
    methods = {
      values:  DEF_VALUES ? $default : getMethod(VALUES),
      keys:    IS_SET     ? $default : getMethod(KEYS),
      entries: $entries
    };
    if(FORCED)for(key in methods){
      if(!(key in proto))redefine(proto, key, methods[key]);
    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};
},{"./_export":132,"./_has":136,"./_hide":137,"./_iter-create":146,"./_iterators":150,"./_library":152,"./_object-gpo":163,"./_redefine":170,"./_set-to-string-tag":173,"./_wks":186}],148:[function(require,module,exports){
var ITERATOR     = require('./_wks')('iterator')
  , SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR]();
  riter['return'] = function(){ SAFE_CLOSING = true; };
  Array.from(riter, function(){ throw 2; });
} catch(e){ /* empty */ }

module.exports = function(exec, skipClosing){
  if(!skipClosing && !SAFE_CLOSING)return false;
  var safe = false;
  try {
    var arr  = [7]
      , iter = arr[ITERATOR]();
    iter.next = function(){ return {done: safe = true}; };
    arr[ITERATOR] = function(){ return iter; };
    exec(arr);
  } catch(e){ /* empty */ }
  return safe;
};
},{"./_wks":186}],149:[function(require,module,exports){
module.exports = function(done, value){
  return {value: value, done: !!done};
};
},{}],150:[function(require,module,exports){
module.exports = {};
},{}],151:[function(require,module,exports){
var getKeys   = require('./_object-keys')
  , toIObject = require('./_to-iobject');
module.exports = function(object, el){
  var O      = toIObject(object)
    , keys   = getKeys(O)
    , length = keys.length
    , index  = 0
    , key;
  while(length > index)if(O[key = keys[index++]] === el)return key;
};
},{"./_object-keys":165,"./_to-iobject":181}],152:[function(require,module,exports){
module.exports = true;
},{}],153:[function(require,module,exports){
var META     = require('./_uid')('meta')
  , isObject = require('./_is-object')
  , has      = require('./_has')
  , setDesc  = require('./_object-dp').f
  , id       = 0;
var isExtensible = Object.isExtensible || function(){
  return true;
};
var FREEZE = !require('./_fails')(function(){
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function(it){
  setDesc(it, META, {value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  }});
};
var fastKey = function(it, create){
  // return primitive with prefix
  if(!isObject(it))return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return 'F';
    // not necessary to add metadata
    if(!create)return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function(it, create){
  if(!has(it, META)){
    // can't set metadata to uncaught frozen object
    if(!isExtensible(it))return true;
    // not necessary to add metadata
    if(!create)return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function(it){
  if(FREEZE && meta.NEED && isExtensible(it) && !has(it, META))setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY:      META,
  NEED:     false,
  fastKey:  fastKey,
  getWeak:  getWeak,
  onFreeze: onFreeze
};
},{"./_fails":133,"./_has":136,"./_is-object":144,"./_object-dp":157,"./_uid":185}],154:[function(require,module,exports){
var global    = require('./_global')
  , macrotask = require('./_task').set
  , Observer  = global.MutationObserver || global.WebKitMutationObserver
  , process   = global.process
  , Promise   = global.Promise
  , isNode    = require('./_cof')(process) == 'process'
  , head, last, notify;

var flush = function(){
  var parent, fn;
  if(isNode && (parent = process.domain))parent.exit();
  while(head){
    fn = head.fn;
    fn(); // <- currently we use it only for Promise - try / catch not required
    head = head.next;
  } last = undefined;
  if(parent)parent.enter();
};

// Node.js
if(isNode){
  notify = function(){
    process.nextTick(flush);
  };
// browsers with MutationObserver
} else if(Observer){
  var toggle = true
    , node   = document.createTextNode('');
  new Observer(flush).observe(node, {characterData: true}); // eslint-disable-line no-new
  notify = function(){
    node.data = toggle = !toggle;
  };
// environments with maybe non-completely correct, but existent Promise
} else if(Promise && Promise.resolve){
  notify = function(){
    Promise.resolve().then(flush);
  };
// for other environments - macrotask based on:
// - setImmediate
// - MessageChannel
// - window.postMessag
// - onreadystatechange
// - setTimeout
} else {
  notify = function(){
    // strange IE + webpack dev server bug - use .call(global)
    macrotask.call(global, flush);
  };
}

module.exports = function(fn){
  var task = {fn: fn, next: undefined};
  if(last)last.next = task;
  if(!head){
    head = task;
    notify();
  } last = task;
};
},{"./_cof":123,"./_global":135,"./_task":178}],155:[function(require,module,exports){
'use strict';
// 19.1.2.1 Object.assign(target, source, ...)
var getKeys  = require('./_object-keys')
  , gOPS     = require('./_object-gops')
  , pIE      = require('./_object-pie')
  , toObject = require('./_to-object')
  , IObject  = require('./_iobject')
  , $assign  = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
module.exports = !$assign || require('./_fails')(function(){
  var A = {}
    , B = {}
    , S = Symbol()
    , K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function(k){ B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source){ // eslint-disable-line no-unused-vars
  var T     = toObject(target)
    , aLen  = arguments.length
    , index = 1
    , getSymbols = gOPS.f
    , isEnum     = pIE.f;
  while(aLen > index){
    var S      = IObject(arguments[index++])
      , keys   = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S)
      , length = keys.length
      , j      = 0
      , key;
    while(length > j)if(isEnum.call(S, key = keys[j++]))T[key] = S[key];
  } return T;
} : $assign;
},{"./_fails":133,"./_iobject":141,"./_object-gops":162,"./_object-keys":165,"./_object-pie":166,"./_to-object":183}],156:[function(require,module,exports){
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
var anObject    = require('./_an-object')
  , dPs         = require('./_object-dps')
  , enumBugKeys = require('./_enum-bug-keys')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , Empty       = function(){ /* empty */ }
  , PROTOTYPE   = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function(){
  // Thrash, waste and sodomy: IE GC bug
  var iframe = require('./_dom-create')('iframe')
    , i      = enumBugKeys.length
    , gt     = '>'
    , iframeDocument;
  iframe.style.display = 'none';
  require('./_html').appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write('<script>document.F=Object</script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while(i--)delete createDict[PROTOTYPE][enumBugKeys[i]];
  return createDict();
};

module.exports = Object.create || function create(O, Properties){
  var result;
  if(O !== null){
    Empty[PROTOTYPE] = anObject(O);
    result = new Empty;
    Empty[PROTOTYPE] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO] = O;
  } else result = createDict();
  return Properties === undefined ? result : dPs(result, Properties);
};
},{"./_an-object":120,"./_dom-create":129,"./_enum-bug-keys":130,"./_html":138,"./_object-dps":158,"./_shared-key":174}],157:[function(require,module,exports){
var anObject       = require('./_an-object')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , toPrimitive    = require('./_to-primitive')
  , dP             = Object.defineProperty;

exports.f = require('./_descriptors') ? Object.defineProperty : function defineProperty(O, P, Attributes){
  anObject(O);
  P = toPrimitive(P, true);
  anObject(Attributes);
  if(IE8_DOM_DEFINE)try {
    return dP(O, P, Attributes);
  } catch(e){ /* empty */ }
  if('get' in Attributes || 'set' in Attributes)throw TypeError('Accessors not supported!');
  if('value' in Attributes)O[P] = Attributes.value;
  return O;
};
},{"./_an-object":120,"./_descriptors":128,"./_ie8-dom-define":139,"./_to-primitive":184}],158:[function(require,module,exports){
var dP       = require('./_object-dp')
  , anObject = require('./_an-object')
  , getKeys  = require('./_object-keys');

module.exports = require('./_descriptors') ? Object.defineProperties : function defineProperties(O, Properties){
  anObject(O);
  var keys   = getKeys(Properties)
    , length = keys.length
    , i = 0
    , P;
  while(length > i)dP.f(O, P = keys[i++], Properties[P]);
  return O;
};
},{"./_an-object":120,"./_descriptors":128,"./_object-dp":157,"./_object-keys":165}],159:[function(require,module,exports){
var pIE            = require('./_object-pie')
  , createDesc     = require('./_property-desc')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , has            = require('./_has')
  , IE8_DOM_DEFINE = require('./_ie8-dom-define')
  , gOPD           = Object.getOwnPropertyDescriptor;

exports.f = require('./_descriptors') ? gOPD : function getOwnPropertyDescriptor(O, P){
  O = toIObject(O);
  P = toPrimitive(P, true);
  if(IE8_DOM_DEFINE)try {
    return gOPD(O, P);
  } catch(e){ /* empty */ }
  if(has(O, P))return createDesc(!pIE.f.call(O, P), O[P]);
};
},{"./_descriptors":128,"./_has":136,"./_ie8-dom-define":139,"./_object-pie":166,"./_property-desc":168,"./_to-iobject":181,"./_to-primitive":184}],160:[function(require,module,exports){
// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
var toIObject = require('./_to-iobject')
  , gOPN      = require('./_object-gopn').f
  , toString  = {}.toString;

var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
  ? Object.getOwnPropertyNames(window) : [];

var getWindowNames = function(it){
  try {
    return gOPN(it);
  } catch(e){
    return windowNames.slice();
  }
};

module.exports.f = function getOwnPropertyNames(it){
  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
};

},{"./_object-gopn":161,"./_to-iobject":181}],161:[function(require,module,exports){
// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
var $keys      = require('./_object-keys-internal')
  , hiddenKeys = require('./_enum-bug-keys').concat('length', 'prototype');

exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O){
  return $keys(O, hiddenKeys);
};
},{"./_enum-bug-keys":130,"./_object-keys-internal":164}],162:[function(require,module,exports){
exports.f = Object.getOwnPropertySymbols;
},{}],163:[function(require,module,exports){
// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
var has         = require('./_has')
  , toObject    = require('./_to-object')
  , IE_PROTO    = require('./_shared-key')('IE_PROTO')
  , ObjectProto = Object.prototype;

module.exports = Object.getPrototypeOf || function(O){
  O = toObject(O);
  if(has(O, IE_PROTO))return O[IE_PROTO];
  if(typeof O.constructor == 'function' && O instanceof O.constructor){
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};
},{"./_has":136,"./_shared-key":174,"./_to-object":183}],164:[function(require,module,exports){
var has          = require('./_has')
  , toIObject    = require('./_to-iobject')
  , arrayIndexOf = require('./_array-includes')(false)
  , IE_PROTO     = require('./_shared-key')('IE_PROTO');

module.exports = function(object, names){
  var O      = toIObject(object)
    , i      = 0
    , result = []
    , key;
  for(key in O)if(key != IE_PROTO)has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while(names.length > i)if(has(O, key = names[i++])){
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};
},{"./_array-includes":121,"./_has":136,"./_shared-key":174,"./_to-iobject":181}],165:[function(require,module,exports){
// 19.1.2.14 / 15.2.3.14 Object.keys(O)
var $keys       = require('./_object-keys-internal')
  , enumBugKeys = require('./_enum-bug-keys');

module.exports = Object.keys || function keys(O){
  return $keys(O, enumBugKeys);
};
},{"./_enum-bug-keys":130,"./_object-keys-internal":164}],166:[function(require,module,exports){
exports.f = {}.propertyIsEnumerable;
},{}],167:[function(require,module,exports){
// most Object methods by ES6 should accept primitives
var $export = require('./_export')
  , core    = require('./_core')
  , fails   = require('./_fails');
module.exports = function(KEY, exec){
  var fn  = (core.Object || {})[KEY] || Object[KEY]
    , exp = {};
  exp[KEY] = exec(fn);
  $export($export.S + $export.F * fails(function(){ fn(1); }), 'Object', exp);
};
},{"./_core":124,"./_export":132,"./_fails":133}],168:[function(require,module,exports){
module.exports = function(bitmap, value){
  return {
    enumerable  : !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable    : !(bitmap & 4),
    value       : value
  };
};
},{}],169:[function(require,module,exports){
var hide = require('./_hide');
module.exports = function(target, src, safe){
  for(var key in src){
    if(safe && target[key])target[key] = src[key];
    else hide(target, key, src[key]);
  } return target;
};
},{"./_hide":137}],170:[function(require,module,exports){
module.exports = require('./_hide');
},{"./_hide":137}],171:[function(require,module,exports){
// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */
var isObject = require('./_is-object')
  , anObject = require('./_an-object');
var check = function(O, proto){
  anObject(O);
  if(!isObject(proto) && proto !== null)throw TypeError(proto + ": can't set as prototype!");
};
module.exports = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function(test, buggy, set){
      try {
        set = require('./_ctx')(Function.call, require('./_object-gopd').f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch(e){ buggy = true; }
      return function setPrototypeOf(O, proto){
        check(O, proto);
        if(buggy)O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};
},{"./_an-object":120,"./_ctx":126,"./_is-object":144,"./_object-gopd":159}],172:[function(require,module,exports){
'use strict';
var global      = require('./_global')
  , core        = require('./_core')
  , dP          = require('./_object-dp')
  , DESCRIPTORS = require('./_descriptors')
  , SPECIES     = require('./_wks')('species');

module.exports = function(KEY){
  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
  if(DESCRIPTORS && C && !C[SPECIES])dP.f(C, SPECIES, {
    configurable: true,
    get: function(){ return this; }
  });
};
},{"./_core":124,"./_descriptors":128,"./_global":135,"./_object-dp":157,"./_wks":186}],173:[function(require,module,exports){
var def = require('./_object-dp').f
  , has = require('./_has')
  , TAG = require('./_wks')('toStringTag');

module.exports = function(it, tag, stat){
  if(it && !has(it = stat ? it : it.prototype, TAG))def(it, TAG, {configurable: true, value: tag});
};
},{"./_has":136,"./_object-dp":157,"./_wks":186}],174:[function(require,module,exports){
var shared = require('./_shared')('keys')
  , uid    = require('./_uid');
module.exports = function(key){
  return shared[key] || (shared[key] = uid(key));
};
},{"./_shared":175,"./_uid":185}],175:[function(require,module,exports){
var global = require('./_global')
  , SHARED = '__core-js_shared__'
  , store  = global[SHARED] || (global[SHARED] = {});
module.exports = function(key){
  return store[key] || (store[key] = {});
};
},{"./_global":135}],176:[function(require,module,exports){
// 7.3.20 SpeciesConstructor(O, defaultConstructor)
var anObject  = require('./_an-object')
  , aFunction = require('./_a-function')
  , SPECIES   = require('./_wks')('species');
module.exports = function(O, D){
  var C = anObject(O).constructor, S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
};
},{"./_a-function":117,"./_an-object":120,"./_wks":186}],177:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , defined   = require('./_defined');
// true  -> String#at
// false -> String#codePointAt
module.exports = function(TO_STRING){
  return function(that, pos){
    var s = String(defined(that))
      , i = toInteger(pos)
      , l = s.length
      , a, b;
    if(i < 0 || i >= l)return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};
},{"./_defined":127,"./_to-integer":180}],178:[function(require,module,exports){
var ctx                = require('./_ctx')
  , invoke             = require('./_invoke')
  , html               = require('./_html')
  , cel                = require('./_dom-create')
  , global             = require('./_global')
  , process            = global.process
  , setTask            = global.setImmediate
  , clearTask          = global.clearImmediate
  , MessageChannel     = global.MessageChannel
  , counter            = 0
  , queue              = {}
  , ONREADYSTATECHANGE = 'onreadystatechange'
  , defer, channel, port;
var run = function(){
  var id = +this;
  if(queue.hasOwnProperty(id)){
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function(event){
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if(!setTask || !clearTask){
  setTask = function setImmediate(fn){
    var args = [], i = 1;
    while(arguments.length > i)args.push(arguments[i++]);
    queue[++counter] = function(){
      invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id){
    delete queue[id];
  };
  // Node.js 0.8-
  if(require('./_cof')(process) == 'process'){
    defer = function(id){
      process.nextTick(ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if(MessageChannel){
    channel = new MessageChannel;
    port    = channel.port2;
    channel.port1.onmessage = listener;
    defer = ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if(global.addEventListener && typeof postMessage == 'function' && !global.importScripts){
    defer = function(id){
      global.postMessage(id + '', '*');
    };
    global.addEventListener('message', listener, false);
  // IE8-
  } else if(ONREADYSTATECHANGE in cel('script')){
    defer = function(id){
      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function(){
        html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function(id){
      setTimeout(ctx(run, id, 1), 0);
    };
  }
}
module.exports = {
  set:   setTask,
  clear: clearTask
};
},{"./_cof":123,"./_ctx":126,"./_dom-create":129,"./_global":135,"./_html":138,"./_invoke":140}],179:[function(require,module,exports){
var toInteger = require('./_to-integer')
  , max       = Math.max
  , min       = Math.min;
module.exports = function(index, length){
  index = toInteger(index);
  return index < 0 ? max(index + length, 0) : min(index, length);
};
},{"./_to-integer":180}],180:[function(require,module,exports){
// 7.1.4 ToInteger
var ceil  = Math.ceil
  , floor = Math.floor;
module.exports = function(it){
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};
},{}],181:[function(require,module,exports){
// to indexed object, toObject with fallback for non-array-like ES3 strings
var IObject = require('./_iobject')
  , defined = require('./_defined');
module.exports = function(it){
  return IObject(defined(it));
};
},{"./_defined":127,"./_iobject":141}],182:[function(require,module,exports){
// 7.1.15 ToLength
var toInteger = require('./_to-integer')
  , min       = Math.min;
module.exports = function(it){
  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};
},{"./_to-integer":180}],183:[function(require,module,exports){
// 7.1.13 ToObject(argument)
var defined = require('./_defined');
module.exports = function(it){
  return Object(defined(it));
};
},{"./_defined":127}],184:[function(require,module,exports){
// 7.1.1 ToPrimitive(input [, PreferredType])
var isObject = require('./_is-object');
// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
module.exports = function(it, S){
  if(!isObject(it))return it;
  var fn, val;
  if(S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to primitive value");
};
},{"./_is-object":144}],185:[function(require,module,exports){
var id = 0
  , px = Math.random();
module.exports = function(key){
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};
},{}],186:[function(require,module,exports){
var store      = require('./_shared')('wks')
  , uid        = require('./_uid')
  , Symbol     = require('./_global').Symbol
  , USE_SYMBOL = typeof Symbol == 'function';
module.exports = function(name){
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
};
},{"./_global":135,"./_shared":175,"./_uid":185}],187:[function(require,module,exports){
var classof   = require('./_classof')
  , ITERATOR  = require('./_wks')('iterator')
  , Iterators = require('./_iterators');
module.exports = require('./_core').getIteratorMethod = function(it){
  if(it != undefined)return it[ITERATOR]
    || it['@@iterator']
    || Iterators[classof(it)];
};
},{"./_classof":122,"./_core":124,"./_iterators":150,"./_wks":186}],188:[function(require,module,exports){
'use strict';
var ctx            = require('./_ctx')
  , $export        = require('./_export')
  , toObject       = require('./_to-object')
  , call           = require('./_iter-call')
  , isArrayIter    = require('./_is-array-iter')
  , toLength       = require('./_to-length')
  , createProperty = require('./_create-property')
  , getIterFn      = require('./core.get-iterator-method');

$export($export.S + $export.F * !require('./_iter-detect')(function(iter){ Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike/*, mapfn = undefined, thisArg = undefined*/){
    var O       = toObject(arrayLike)
      , C       = typeof this == 'function' ? this : Array
      , aLen    = arguments.length
      , mapfn   = aLen > 1 ? arguments[1] : undefined
      , mapping = mapfn !== undefined
      , index   = 0
      , iterFn  = getIterFn(O)
      , length, result, step, iterator;
    if(mapping)mapfn = ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if(iterFn != undefined && !(C == Array && isArrayIter(iterFn))){
      for(iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++){
        createProperty(result, index, mapping ? call(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = toLength(O.length);
      for(result = new C(length); length > index; index++){
        createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

},{"./_create-property":125,"./_ctx":126,"./_export":132,"./_is-array-iter":142,"./_iter-call":145,"./_iter-detect":148,"./_to-length":182,"./_to-object":183,"./core.get-iterator-method":187}],189:[function(require,module,exports){
'use strict';
var addToUnscopables = require('./_add-to-unscopables')
  , step             = require('./_iter-step')
  , Iterators        = require('./_iterators')
  , toIObject        = require('./_to-iobject');

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
module.exports = require('./_iter-define')(Array, 'Array', function(iterated, kind){
  this._t = toIObject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , kind  = this._k
    , index = this._i++;
  if(!O || index >= O.length){
    this._t = undefined;
    return step(1);
  }
  if(kind == 'keys'  )return step(0, index);
  if(kind == 'values')return step(0, O[index]);
  return step(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
Iterators.Arguments = Iterators.Array;

addToUnscopables('keys');
addToUnscopables('values');
addToUnscopables('entries');
},{"./_add-to-unscopables":118,"./_iter-define":147,"./_iter-step":149,"./_iterators":150,"./_to-iobject":181}],190:[function(require,module,exports){
// 19.1.3.1 Object.assign(target, source)
var $export = require('./_export');

$export($export.S + $export.F, 'Object', {assign: require('./_object-assign')});
},{"./_export":132,"./_object-assign":155}],191:[function(require,module,exports){
var $export = require('./_export')
// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
$export($export.S, 'Object', {create: require('./_object-create')});
},{"./_export":132,"./_object-create":156}],192:[function(require,module,exports){
var $export = require('./_export');
// 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
$export($export.S + $export.F * !require('./_descriptors'), 'Object', {defineProperty: require('./_object-dp').f});
},{"./_descriptors":128,"./_export":132,"./_object-dp":157}],193:[function(require,module,exports){
// 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
var toIObject                 = require('./_to-iobject')
  , $getOwnPropertyDescriptor = require('./_object-gopd').f;

require('./_object-sap')('getOwnPropertyDescriptor', function(){
  return function getOwnPropertyDescriptor(it, key){
    return $getOwnPropertyDescriptor(toIObject(it), key);
  };
});
},{"./_object-gopd":159,"./_object-sap":167,"./_to-iobject":181}],194:[function(require,module,exports){
// 19.1.2.9 Object.getPrototypeOf(O)
var toObject        = require('./_to-object')
  , $getPrototypeOf = require('./_object-gpo');

require('./_object-sap')('getPrototypeOf', function(){
  return function getPrototypeOf(it){
    return $getPrototypeOf(toObject(it));
  };
});
},{"./_object-gpo":163,"./_object-sap":167,"./_to-object":183}],195:[function(require,module,exports){
// 19.1.3.19 Object.setPrototypeOf(O, proto)
var $export = require('./_export');
$export($export.S, 'Object', {setPrototypeOf: require('./_set-proto').set});
},{"./_export":132,"./_set-proto":171}],196:[function(require,module,exports){

},{}],197:[function(require,module,exports){
'use strict';
var LIBRARY            = require('./_library')
  , global             = require('./_global')
  , ctx                = require('./_ctx')
  , classof            = require('./_classof')
  , $export            = require('./_export')
  , isObject           = require('./_is-object')
  , anObject           = require('./_an-object')
  , aFunction          = require('./_a-function')
  , anInstance         = require('./_an-instance')
  , forOf              = require('./_for-of')
  , setProto           = require('./_set-proto').set
  , speciesConstructor = require('./_species-constructor')
  , task               = require('./_task').set
  , microtask          = require('./_microtask')
  , PROMISE            = 'Promise'
  , TypeError          = global.TypeError
  , process            = global.process
  , $Promise           = global[PROMISE]
  , process            = global.process
  , isNode             = classof(process) == 'process'
  , empty              = function(){ /* empty */ }
  , Internal, GenericPromiseCapability, Wrapper;

var USE_NATIVE = !!function(){
  try {
    // correct subclassing with @@species support
    var promise     = $Promise.resolve(1)
      , FakePromise = (promise.constructor = {})[require('./_wks')('species')] = function(exec){ exec(empty, empty); };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
  } catch(e){ /* empty */ }
}();

// helpers
var sameConstructor = function(a, b){
  // with library wrapper special case
  return a === b || a === $Promise && b === Wrapper;
};
var isThenable = function(it){
  var then;
  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var newPromiseCapability = function(C){
  return sameConstructor($Promise, C)
    ? new PromiseCapability(C)
    : new GenericPromiseCapability(C);
};
var PromiseCapability = GenericPromiseCapability = function(C){
  var resolve, reject;
  this.promise = new C(function($$resolve, $$reject){
    if(resolve !== undefined || reject !== undefined)throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject  = $$reject;
  });
  this.resolve = aFunction(resolve);
  this.reject  = aFunction(reject);
};
var perform = function(exec){
  try {
    exec();
  } catch(e){
    return {error: e};
  }
};
var notify = function(promise, isReject){
  if(promise._n)return;
  promise._n = true;
  var chain = promise._c;
  microtask(function(){
    var value = promise._v
      , ok    = promise._s == 1
      , i     = 0;
    var run = function(reaction){
      var handler = ok ? reaction.ok : reaction.fail
        , resolve = reaction.resolve
        , reject  = reaction.reject
        , domain  = reaction.domain
        , result, then;
      try {
        if(handler){
          if(!ok){
            if(promise._h == 2)onHandleUnhandled(promise);
            promise._h = 1;
          }
          if(handler === true)result = value;
          else {
            if(domain)domain.enter();
            result = handler(value);
            if(domain)domain.exit();
          }
          if(result === reaction.promise){
            reject(TypeError('Promise-chain cycle'));
          } else if(then = isThenable(result)){
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch(e){
        reject(e);
      }
    };
    while(chain.length > i)run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if(isReject && !promise._h)onUnhandled(promise);
  });
};
var onUnhandled = function(promise){
  task.call(global, function(){
    var value = promise._v
      , abrupt, handler, console;
    if(isUnhandled(promise)){
      abrupt = perform(function(){
        if(isNode){
          process.emit('unhandledRejection', value, promise);
        } else if(handler = global.onunhandledrejection){
          handler({promise: promise, reason: value});
        } else if((console = global.console) && console.error){
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if(abrupt)throw abrupt.error;
  });
};
var isUnhandled = function(promise){
  if(promise._h == 1)return false;
  var chain = promise._a || promise._c
    , i     = 0
    , reaction;
  while(chain.length > i){
    reaction = chain[i++];
    if(reaction.fail || !isUnhandled(reaction.promise))return false;
  } return true;
};
var onHandleUnhandled = function(promise){
  task.call(global, function(){
    var handler;
    if(isNode){
      process.emit('rejectionHandled', promise);
    } else if(handler = global.onrejectionhandled){
      handler({promise: promise, reason: promise._v});
    }
  });
};
var $reject = function(value){
  var promise = this;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if(!promise._a)promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function(value){
  var promise = this
    , then;
  if(promise._d)return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if(promise === value)throw TypeError("Promise can't be resolved itself");
    if(then = isThenable(value)){
      microtask(function(){
        var wrapper = {_w: promise, _d: false}; // wrap
        try {
          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
        } catch(e){
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch(e){
    $reject.call({_w: promise, _d: false}, e); // wrap
  }
};

// constructor polyfill
if(!USE_NATIVE){
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor){
    anInstance(this, $Promise, PROMISE, '_h');
    aFunction(executor);
    Internal.call(this);
    try {
      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
    } catch(err){
      $reject.call(this, err);
    }
  };
  Internal = function Promise(executor){
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal.prototype = require('./_redefine-all')($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected){
      var reaction    = newPromiseCapability(speciesConstructor(this, $Promise));
      reaction.ok     = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail   = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode ? process.domain : undefined;
      this._c.push(reaction);
      if(this._a)this._a.push(reaction);
      if(this._s)notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function(onRejected){
      return this.then(undefined, onRejected);
    }
  });
  PromiseCapability = function(){
    var promise  = new Internal;
    this.promise = promise;
    this.resolve = ctx($resolve, promise, 1);
    this.reject  = ctx($reject, promise, 1);
  };
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: $Promise});
require('./_set-to-string-tag')($Promise, PROMISE);
require('./_set-species')(PROMISE);
Wrapper = require('./_core')[PROMISE];

// statics
$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r){
    var capability = newPromiseCapability(this)
      , $$reject   = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x){
    // instanceof instead of internal slot check because we should fix it without replacement native Promise core
    if(x instanceof $Promise && sameConstructor(x.constructor, this))return x;
    var capability = newPromiseCapability(this)
      , $$resolve  = capability.resolve;
    $$resolve(x);
    return capability.promise;
  }
});
$export($export.S + $export.F * !(USE_NATIVE && require('./_iter-detect')(function(iter){
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , resolve    = capability.resolve
      , reject     = capability.reject;
    var abrupt = perform(function(){
      var values    = []
        , index     = 0
        , remaining = 1;
      forOf(iterable, false, function(promise){
        var $index        = index++
          , alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function(value){
          if(alreadyCalled)return;
          alreadyCalled  = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable){
    var C          = this
      , capability = newPromiseCapability(C)
      , reject     = capability.reject;
    var abrupt = perform(function(){
      forOf(iterable, false, function(promise){
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if(abrupt)reject(abrupt.error);
    return capability.promise;
  }
});
},{"./_a-function":117,"./_an-instance":119,"./_an-object":120,"./_classof":122,"./_core":124,"./_ctx":126,"./_export":132,"./_for-of":134,"./_global":135,"./_is-object":144,"./_iter-detect":148,"./_library":152,"./_microtask":154,"./_redefine-all":169,"./_set-proto":171,"./_set-species":172,"./_set-to-string-tag":173,"./_species-constructor":176,"./_task":178,"./_wks":186}],198:[function(require,module,exports){
'use strict';
var $at  = require('./_string-at')(true);

// 21.1.3.27 String.prototype[@@iterator]()
require('./_iter-define')(String, 'String', function(iterated){
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function(){
  var O     = this._t
    , index = this._i
    , point;
  if(index >= O.length)return {value: undefined, done: true};
  point = $at(O, index);
  this._i += point.length;
  return {value: point, done: false};
});
},{"./_iter-define":147,"./_string-at":177}],199:[function(require,module,exports){
'use strict';
// ECMAScript 6 symbols shim
var global         = require('./_global')
  , core           = require('./_core')
  , has            = require('./_has')
  , DESCRIPTORS    = require('./_descriptors')
  , $export        = require('./_export')
  , redefine       = require('./_redefine')
  , META           = require('./_meta').KEY
  , $fails         = require('./_fails')
  , shared         = require('./_shared')
  , setToStringTag = require('./_set-to-string-tag')
  , uid            = require('./_uid')
  , wks            = require('./_wks')
  , keyOf          = require('./_keyof')
  , enumKeys       = require('./_enum-keys')
  , isArray        = require('./_is-array')
  , anObject       = require('./_an-object')
  , toIObject      = require('./_to-iobject')
  , toPrimitive    = require('./_to-primitive')
  , createDesc     = require('./_property-desc')
  , _create        = require('./_object-create')
  , gOPNExt        = require('./_object-gopn-ext')
  , $GOPD          = require('./_object-gopd')
  , $DP            = require('./_object-dp')
  , gOPD           = $GOPD.f
  , dP             = $DP.f
  , gOPN           = gOPNExt.f
  , $Symbol        = global.Symbol
  , $JSON          = global.JSON
  , _stringify     = $JSON && $JSON.stringify
  , setter         = false
  , PROTOTYPE      = 'prototype'
  , HIDDEN         = wks('_hidden')
  , TO_PRIMITIVE   = wks('toPrimitive')
  , isEnum         = {}.propertyIsEnumerable
  , SymbolRegistry = shared('symbol-registry')
  , AllSymbols     = shared('symbols')
  , ObjectProto    = Object[PROTOTYPE]
  , USE_NATIVE     = typeof $Symbol == 'function'
  , QObject        = global.QObject;

// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
var setSymbolDesc = DESCRIPTORS && $fails(function(){
  return _create(dP({}, 'a', {
    get: function(){ return dP(this, 'a', {value: 7}).a; }
  })).a != 7;
}) ? function(it, key, D){
  var protoDesc = gOPD(ObjectProto, key);
  if(protoDesc)delete ObjectProto[key];
  dP(it, key, D);
  if(protoDesc && it !== ObjectProto)dP(ObjectProto, key, protoDesc);
} : dP;

var wrap = function(tag){
  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
  sym._k = tag;
  DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
    configurable: true,
    set: function(value){
      if(has(this, HIDDEN) && has(this[HIDDEN], tag))this[HIDDEN][tag] = false;
      setSymbolDesc(this, tag, createDesc(1, value));
    }
  });
  return sym;
};

var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function(it){
  return typeof it == 'symbol';
} : function(it){
  return it instanceof $Symbol;
};

var $defineProperty = function defineProperty(it, key, D){
  anObject(it);
  key = toPrimitive(key, true);
  anObject(D);
  if(has(AllSymbols, key)){
    if(!D.enumerable){
      if(!has(it, HIDDEN))dP(it, HIDDEN, createDesc(1, {}));
      it[HIDDEN][key] = true;
    } else {
      if(has(it, HIDDEN) && it[HIDDEN][key])it[HIDDEN][key] = false;
      D = _create(D, {enumerable: createDesc(0, false)});
    } return setSymbolDesc(it, key, D);
  } return dP(it, key, D);
};
var $defineProperties = function defineProperties(it, P){
  anObject(it);
  var keys = enumKeys(P = toIObject(P))
    , i    = 0
    , l = keys.length
    , key;
  while(l > i)$defineProperty(it, key = keys[i++], P[key]);
  return it;
};
var $create = function create(it, P){
  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
};
var $propertyIsEnumerable = function propertyIsEnumerable(key){
  var E = isEnum.call(this, key = toPrimitive(key, true));
  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
};
var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key){
  var D = gOPD(it = toIObject(it), key = toPrimitive(key, true));
  if(D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))D.enumerable = true;
  return D;
};
var $getOwnPropertyNames = function getOwnPropertyNames(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META)result.push(key);
  return result;
};
var $getOwnPropertySymbols = function getOwnPropertySymbols(it){
  var names  = gOPN(toIObject(it))
    , result = []
    , i      = 0
    , key;
  while(names.length > i)if(has(AllSymbols, key = names[i++]))result.push(AllSymbols[key]);
  return result;
};
var $stringify = function stringify(it){
  if(it === undefined || isSymbol(it))return; // IE8 returns string on undefined
  var args = [it]
    , i    = 1
    , replacer, $replacer;
  while(arguments.length > i)args.push(arguments[i++]);
  replacer = args[1];
  if(typeof replacer == 'function')$replacer = replacer;
  if($replacer || !isArray(replacer))replacer = function(key, value){
    if($replacer)value = $replacer.call(this, key, value);
    if(!isSymbol(value))return value;
  };
  args[1] = replacer;
  return _stringify.apply($JSON, args);
};
var BUGGY_JSON = $fails(function(){
  var S = $Symbol();
  // MS Edge converts symbol values to JSON as {}
  // WebKit converts symbol values to JSON as null
  // V8 throws on boxed symbols
  return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
});

// 19.4.1.1 Symbol([description])
if(!USE_NATIVE){
  $Symbol = function Symbol(){
    if(this instanceof $Symbol)throw TypeError('Symbol is not a constructor!');
    return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
  };
  redefine($Symbol[PROTOTYPE], 'toString', function toString(){
    return this._k;
  });

  $GOPD.f = $getOwnPropertyDescriptor;
  $DP.f   = $defineProperty;
  require('./_object-gopn').f = gOPNExt.f = $getOwnPropertyNames;
  require('./_object-pie').f  = $propertyIsEnumerable
  require('./_object-gops').f = $getOwnPropertySymbols;

  if(DESCRIPTORS && !require('./_library')){
    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
  }
}

$export($export.G + $export.W + $export.F * !USE_NATIVE, {Symbol: $Symbol});

// 19.4.2.2 Symbol.hasInstance
// 19.4.2.3 Symbol.isConcatSpreadable
// 19.4.2.4 Symbol.iterator
// 19.4.2.6 Symbol.match
// 19.4.2.8 Symbol.replace
// 19.4.2.9 Symbol.search
// 19.4.2.10 Symbol.species
// 19.4.2.11 Symbol.split
// 19.4.2.12 Symbol.toPrimitive
// 19.4.2.13 Symbol.toStringTag
// 19.4.2.14 Symbol.unscopables
for(var symbols = (
  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
).split(','), i = 0; symbols.length > i; ){
  var key     = symbols[i++]
    , Wrapper = core.Symbol
    , sym     = wks(key);
  if(!(key in Wrapper))dP(Wrapper, key, {value: USE_NATIVE ? sym : wrap(sym)});
};

// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
if(!QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild)setter = true;

$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
  // 19.4.2.1 Symbol.for(key)
  'for': function(key){
    return has(SymbolRegistry, key += '')
      ? SymbolRegistry[key]
      : SymbolRegistry[key] = $Symbol(key);
  },
  // 19.4.2.5 Symbol.keyFor(sym)
  keyFor: function keyFor(key){
    if(isSymbol(key))return keyOf(SymbolRegistry, key);
    throw TypeError(key + ' is not a symbol!');
  },
  useSetter: function(){ setter = true; },
  useSimple: function(){ setter = false; }
});

$export($export.S + $export.F * !USE_NATIVE, 'Object', {
  // 19.1.2.2 Object.create(O [, Properties])
  create: $create,
  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
  defineProperty: $defineProperty,
  // 19.1.2.3 Object.defineProperties(O, Properties)
  defineProperties: $defineProperties,
  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
  // 19.1.2.7 Object.getOwnPropertyNames(O)
  getOwnPropertyNames: $getOwnPropertyNames,
  // 19.1.2.8 Object.getOwnPropertySymbols(O)
  getOwnPropertySymbols: $getOwnPropertySymbols
});

// 24.3.2 JSON.stringify(value [, replacer [, space]])
$JSON && $export($export.S + $export.F * (!USE_NATIVE || BUGGY_JSON), 'JSON', {stringify: $stringify});

// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
$Symbol[PROTOTYPE][TO_PRIMITIVE] || require('./_hide')($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
// 19.4.3.5 Symbol.prototype[@@toStringTag]
setToStringTag($Symbol, 'Symbol');
// 20.2.1.9 Math[@@toStringTag]
setToStringTag(Math, 'Math', true);
// 24.3.3 JSON[@@toStringTag]
setToStringTag(global.JSON, 'JSON', true);
},{"./_an-object":120,"./_core":124,"./_descriptors":128,"./_enum-keys":131,"./_export":132,"./_fails":133,"./_global":135,"./_has":136,"./_hide":137,"./_is-array":143,"./_keyof":151,"./_library":152,"./_meta":153,"./_object-create":156,"./_object-dp":157,"./_object-gopd":159,"./_object-gopn":161,"./_object-gopn-ext":160,"./_object-gops":162,"./_object-pie":166,"./_property-desc":168,"./_redefine":170,"./_set-to-string-tag":173,"./_shared":175,"./_to-iobject":181,"./_to-primitive":184,"./_uid":185,"./_wks":186}],200:[function(require,module,exports){
require('./es6.array.iterator');
var global        = require('./_global')
  , hide          = require('./_hide')
  , Iterators     = require('./_iterators')
  , TO_STRING_TAG = require('./_wks')('toStringTag');

for(var collections = ['NodeList', 'DOMTokenList', 'MediaList', 'StyleSheetList', 'CSSRuleList'], i = 0; i < 5; i++){
  var NAME       = collections[i]
    , Collection = global[NAME]
    , proto      = Collection && Collection.prototype;
  if(proto && !proto[TO_STRING_TAG])hide(proto, TO_STRING_TAG, NAME);
  Iterators[NAME] = Iterators.Array;
}
},{"./_global":135,"./_hide":137,"./_iterators":150,"./_wks":186,"./es6.array.iterator":189}],201:[function(require,module,exports){

/**
 * Module dependencies.
 */

var global = (function() { return this; })();

/**
 * WebSocket constructor.
 */

var WebSocket = global.WebSocket || global.MozWebSocket;

/**
 * Module exports.
 */

module.exports = WebSocket ? ws : null;

/**
 * WebSocket constructor.
 *
 * The third `opts` options object gets ignored in web browsers, since it's
 * non-standard, and throws a TypeError if passed to the constructor.
 * See: https://github.com/einaros/ws/issues/227
 *
 * @param {String} uri
 * @param {Array} protocols (optional)
 * @param {Object) opts (optional)
 * @api public
 */

function ws(uri, protocols, opts) {
  var instance;
  if (protocols) {
    instance = new WebSocket(uri, protocols);
  } else {
    instance = new WebSocket(uri);
  }
  return instance;
}

if (WebSocket) ws.prototype = WebSocket.prototype;

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2F1ZGlvLXBsYXllci5qcyIsImNsaWVudC9jb21tb24vc3JjL2NsaWVudC9jb21tb24vaW5kZXguanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi9sZm8tZGVsdGEuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluLmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi9sZm8taW50ZW5zaXR5LmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi9sZm8tcHNldWRvLXlpbi5qcyIsImNsaWVudC9jb21tb24vc3JjL2NsaWVudC9jb21tb24vbGZvLXJlc2FtcGxlci1leHBlcmltZW50YWwuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXIuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1zZWxlY3QuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby14bW0tZ21tLWRlY29kZXIuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby14bW0taGhtbS1kZWNvZGVyLmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi94bW0tZGVjb2Rlci1jb21tb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGUtY2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2ludGVyb3AtcmVxdWlyZS1kZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtd2lsZGNhcmQuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1zYXAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2pzZmZ0L2xpYi9jb21wbGV4X2FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2pzZmZ0L2xpYi9mZnQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3QvY29yZS9iYXNlLWxmby5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9jb3JlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9iaXF1YWQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL2ZmdC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvZnJhbWVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvbWFnbml0dWRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9tYXguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL21pbi1tYXguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL21vdmluZy1hdmVyYWdlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9tb3ZpbmctbWVkaWFuLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9ub29wLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9vcGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvc2VnbWVudGVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2F1ZGlvLXJlY29yZGVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2Jhc2UtZHJhdy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9icGYuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvYnJpZGdlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2RhdGEtcmVjb3JkZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvbWFya2VyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL3NvY2tldC1jbGllbnQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3Mvc29ja2V0LXNlcnZlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9zb25vZ3JhbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9zcGVjdHJvZ3JhbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9zeW5jaHJvbml6ZWQtZHJhdy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy90cmFjZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy93YXZlZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2F1ZGlvLWluLWJ1ZmZlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2F1ZGlvLWluLW5vZGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc291cmNlcy9ldmVudC1pbi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NvdXJjZXMvc29ja2V0LWNsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL3NvY2tldC1zZXJ2ZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3QvdXRpbHMvZHJhdy11dGlscy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC91dGlscy9mZnQtd2luZG93cy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC91dGlscy9zb2NrZXQtdXRpbHMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9qc29uL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC9pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9nZXQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9qc29uL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4taW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jcmVhdGUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY3R4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Zvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGlkZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19odG1sLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2ludm9rZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jYWxsLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGV0ZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItc3RlcC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fa2V5b2YuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fbGlicmFyeS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19tZXRhLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21pY3JvdGFzay5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcG4tZXh0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1ncG8uanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qtc2FwLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUtYWxsLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1wcm90by5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQta2V5LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3N0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190YXNrLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWludGVnZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fd2tzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy93cy9saWIvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQ0VxQixXQUFXO0FBQ3BCLFVBRFMsV0FBVyxDQUNuQixPQUFPLEVBQUUsTUFBTSxFQUFFOzs7d0JBRFQsV0FBVzs7QUFFOUIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRXZCLE1BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3RELE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUM1QyxNQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDbEMsTUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQzlCLE1BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDL0IsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFakIsTUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLE1BQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRWxELE1BQUksQ0FBQyxZQUFZLEdBQUksVUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFLOztBQUVyQyxPQUFHLE1BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssTUFBTSxFQUFFLE9BQU87QUFDakQsT0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTs7QUFFakUsVUFBSyxVQUFVLENB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QUFDLENBQUMsQ0FBQSxBQUFDLEdBQzVCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDdEI7QUFDRCxXQUFJLElBQUksSUFBSSxHQUFDLENBQUMsRUFBRSxJQUFJLEdBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFO0FBQ3JDLFlBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUVyQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUN2RCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFBLEFBQzVDLENBQUM7T0FDTDtNQUNEO0tBQ0QsTUFBTTs7OztBQUdOLFVBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0FBRWhELFVBQUksSUFBSSxJQUFJLEdBQUMsQ0FBQyxFQUFFLElBQUksR0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUU7QUFDdEQsV0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQ2hFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7TUFDaEQ7OztBQUdELFVBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMs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QUMsR0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFOztBQUVsQyxLQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUM7QUFDMUQsS0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDO0VBQzVEO0NBQ0QsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN2TUY7O0FDQUE7O0FDQUE7O0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQzVIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVnREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7Ozs7QUNGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEJBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBOztBQ0FBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7O0FDRkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBOztBQ0ZBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvL2xldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgZnVuY3Rpb24oKXt9O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdWRpb1BsYXllciB7XG5cdGNvbnN0cnVjdG9yKGNvbnRleHQsIGJ1ZmZlcikge1xuXHRcdHRoaXMuY29udGV4dCA9IGNvbnRleHQ7XG5cdFx0Ly90aGlzLmNvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cdFx0dGhpcy5zb3VyY2VCdWZmZXIgPSB0aGlzLmNvbnRleHQuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cdFx0dGhpcy5idWZmZXJHYWluID0gdGhpcy5jb250ZXh0LmNyZWF0ZUdhaW4oKTtcblx0XHR0aGlzLnNvdXJjZUJ1ZmZlci5idWZmZXIgPSBidWZmZXI7XG5cdFx0dGhpcy5zb3VyY2VCdWZmZXIubG9vcCA9IHRydWU7XG5cdFx0dGhpcy5idWZmZXJHYWluLmdhaW4udmFsdWUgPSAwO1xuXHRcdHRoaXMuZmFkZUlEID0gLTE7XG5cblx0XHR0aGlzLnNvdXJjZUJ1ZmZlci5jb25uZWN0KHRoaXMuYnVmZmVyR2Fpbik7XG5cdFx0dGhpcy5idWZmZXJHYWluLmNvbm5lY3QodGhpcy5jb250ZXh0LmRlc3RpbmF0aW9uKTtcblxuXHRcdHRoaXMuZmFkZUZ1bmN0aW9uID0gKCh0YXJnZXQsIGluYykgPT4ge1xuXHRcdFx0Ly9jb25zb2xlLmxvZyh0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSk7XG5cdFx0XHRpZih0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSA9PT0gdGFyZ2V0KSByZXR1cm47XG5cdFx0XHRpZihNYXRoLmFicyh0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSAtIHRhcmdldCkgPiBNYXRoLmFicyhpbmMpKSB7XG5cdFx0XHRcdC8vY29uc29sZS5sb2codGhpcy5idWZmZXJHYWluLmdhaW4udmFsdWUpO1xuXHRcdFx0XHR0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSArPSBpbmM7XG5cdFx0XHR9XG5cblx0XHRcdGlmKE1hdGguYWJzKHRoaXMuYnVmZmVyR2Fpbi5nYWluLnZhbHVlIC0gdGFyZ2V0KSA8IE1hdGguYWJzKGluYykpIHtcblx0XHRcdFx0dGhpcy5idWZmZXJHYWluLmdhaW4udmFsdWUgPSB0YXJnZXQ7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwodGhpcy5mYWRlSUQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0dGhpcy5zb3VyY2VCdWZmZXIuc3RhcnQodGhpcy5jb250ZXh0LmN1cnJlbnRUaW1lKTtcblx0fVxuXG5cdHN0b3AoKSB7XG5cdFx0dGhpcy5zb3VyY2VCdWZmZXIuc3RvcCgpO1xuXHR9XG5cblx0ZmFkZSh0YXJnZXQsIGR1cmF0aW9uKSB7XG5cdFx0aWYoZHVyYXRpb24gPT09IDApIHtcblx0XHRcdHRoaXMuYnVmZmVyR2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0O1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRsZXQgaW50ZXJ2YWwgPSAxMDtcblx0XHRsZXQgaW5jID0gKHRhcmdldCAtIHRoaXMuYnVmZmVyR2Fpbi5nYWluLnZhbHVlKSAvIChkdXJhdGlvbiAvIGludGVydmFsKTtcblx0XHQvL2NvbnNvbGUubG9nKHRoaXMuYnVmZmVyR2Fpbi5nYWluLnZhbHVlICsgXCIgLT4gXCIgKyB0YXJnZXQgKyBcIiBcIiArIGluYyk7XG5cdFx0aWYoaW5jID09IDApIHJldHVybjtcblx0XHRjbGVhckludGVydmFsKHRoaXMuZmFkZUlEKTtcblx0XHR0aGlzLmZhZGVJRCA9IHNldEludGVydmFsKHRoaXMuZmFkZUZ1bmN0aW9uLmJpbmQodGhpcywgdGFyZ2V0LCBpbmMpLCBpbnRlcnZhbCk7XG5cdH1cbn0iLCJpbXBvcnQgRGF0YVJlY29yZGVyIGZyb20gJy4vbGZvLWRhdGEtcmVjb3JkZXInO1xuaW1wb3J0IElucHV0UHJvY2Vzc2luZ0NoYWluIGZyb20gJy4vbGZvLWlucHV0LXByb2Nlc3NpbmctY2hhaW4nO1xuaW1wb3J0IFBzZXVkb1lpbiBmcm9tICcuL2xmby1wc2V1ZG8teWluJztcbmltcG9ydCBSZXNhbXBsZXIgZnJvbSAnLi9sZm8tcmVzYW1wbGVyJztcbmltcG9ydCBSZXNhbXBsZXJFeHAgZnJvbSAnLi9sZm8tcmVzYW1wbGVyLWV4cGVyaW1lbnRhbCc7XG5pbXBvcnQgR21tRGVjb2RlciBmcm9tICcuL2xmby14bW0tZ21tLWRlY29kZXInO1xuaW1wb3J0IEhobW1EZWNvZGVyIGZyb20gJy4vbGZvLXhtbS1oaG1tLWRlY29kZXInO1xuaW1wb3J0IERlbHRhIGZyb20gJy4vbGZvLWRlbHRhJztcbmltcG9ydCBJbnRlbnNpdHkgZnJvbSAnLi9sZm8taW50ZW5zaXR5JztcbmltcG9ydCBTZWxlY3QgZnJvbSAnLi9sZm8tc2VsZWN0JztcbmltcG9ydCBBdWRpb1BsYXllciBmcm9tICcuL2F1ZGlvLXBsYXllci5qcyc7XG4iLCJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YVJlY29yZGVyIGV4dGVuZHMgbGZvLnNpbmtzLkRhdGFSZWNvcmRlciB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHQvL2ZyYW1lU2l6ZTogMyxcblx0XHRcdHNlcGFyYXRlQXJyYXlzOiB0cnVlLFxuXHRcdFx0Ymltb2RhbDogZmFsc2UsXG5cdFx0XHQvL2NvbHVtbl9uYW1lczogWydtYWduaXR1ZGUnLCAnZnJlcXVlbmN5JywgJ3BlcmlvZGljaXR5J11cblx0XHR9XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXHRcdGlmKG9wdGlvbnMuY29sdW1uX25hbWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMucGFyYW1zLmNvbHVtbl9uYW1lcyA9IG9wdGlvbnMuY29sdW1uX25hbWVzLnNsaWNlKDApO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyh0aGlzLnBhcmFtcy5jb2x1bW5fbmFtZXMpO1xuXHRcdH1cblxuXHRcdHRoaXMucGhyYXNlID0ge307XG5cblx0XHR0aGlzLnVwZGF0ZVBocmFzZSA9ICgoZGF0YSkgPT4ge1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhLmRhdGEpO1xuXHRcdFx0dGhpcy5waHJhc2UgPSB7fTtcblx0XHRcdHRoaXMucGhyYXNlLmJpbW9kYWwgPSB0aGlzLnBhcmFtcy5iaW1vZGFsO1xuXHRcdFx0dGhpcy5waHJhc2UuZGltZW5zaW9uID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHRcdFx0dGhpcy5waHJhc2UuZGltZW5zaW9uX2lucHV0ID0gMDtcblx0XHRcdHRoaXMucGhyYXNlLmNvbHVtbl9uYW1lcyA9IHRoaXMucGFyYW1zLmNvbHVtbl9uYW1lcy5zbGljZSgwKTtcblx0XHRcdHRoaXMucGhyYXNlLmRhdGEgPSBbXTtcblx0XHRcdGZvcihsZXQgdmVjaWQgaW4gZGF0YS5kYXRhKSB7XG5cdFx0XHRcdGZvcihsZXQgaWQgaW4gZGF0YS5kYXRhW3ZlY2lkXSkge1xuXHRcdFx0XHRcdHRoaXMucGhyYXNlLmRhdGEucHVzaChkYXRhLmRhdGFbdmVjaWRdW2lkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucGhyYXNlLmxlbmd0aCA9IGRhdGEudGltZS5sZW5ndGg7XG5cdFx0XHR0aGlzLnJldHJpZXZlKCkudGhlbih0aGlzLnVwZGF0ZVBocmFzZS5iaW5kKHRoaXMpKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVyci5zdGFjaykpO1x0XHRcdFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZXRyaWV2ZSgpLnRoZW4odGhpcy51cGRhdGVQaHJhc2UuYmluZCh0aGlzKSkuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcblx0fVxuXG5cdGluaXRpYWxpemUoc3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHRzdXBlci5pbml0aWFsaXplKHN0cmVhbVBhcmFtcyk7XG5cdFx0dGhpcy5waHJhc2UuZGltZW5zaW9uID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHR9XG5cblx0Z2V0UmVjb3JkZWRQaHJhc2UoKSB7XG5cdFx0Y29uc29sZS5sb2codGhpcy5wYXJhbXMuY29sdW1uX25hbWVzKTtcblx0XHRyZXR1cm4gdGhpcy5waHJhc2U7XG5cdH1cbn1cbiIsIi8vIGxpbmVhciByZWdyZXNzaW9uIGxmbyBmb3IgZml4ZWQgc2FtcGxlcmF0ZSBtdWx0aS1kaW1lbnNpb25hbCBkYXRhIHN0cmVhbXNcbi8vIGJhc2VkIG9uIHJ0YV9kZWx0YS5jIGJ5IEplYW4tUGhpbGlwcGUgTGFtYmVydFxuXG5pbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVsdGEgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdG9yZGVyOiAzLFxuXHRcdFx0ZmlsbDogMCxcblx0XHRcdGZyYW1lU2l6ZTogMVxuXHRcdH1cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHQvLyBvcmRlciBtdXN0IGJlIG9kZCBhbmQgPiAzXG5cdFx0aWYodGhpcy5wYXJhbXMub3JkZXIgPCAzKSB7XG5cdFx0XHR0aGlzLnBhcmFtcy5vcmRlciA9IDM7XG5cdFx0fSBlbHNlIGlmKHRoaXMucGFyYW1zLm9yZGVyICUgMiA9PSAwKSB7XG5cdFx0XHR0aGlzLnBhcmFtcy5vcmRlciAtPSAxO1xuXHRcdH1cblxuXHRcdGxldCBoYWxmRmlsdGVyU2l6ZSA9IE1hdGguZmxvb3IodGhpcy5wYXJhbXMub3JkZXIgKiAwLjUpO1xuXG5cdFx0Ly8gd2VpZ2h0cyBmb3IgaW5wdXQgdmVjdG9yc1xuXHRcdHRoaXMud2VpZ2h0cyA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wYXJhbXMub3JkZXIpO1xuXHRcdGZvcihsZXQgaT0wLCBmaWx0ZXJWYWx1ZT0taGFsZkZpbHRlclNpemU7IGk8dGhpcy5wYXJhbXMub3JkZXI7IGkrKywgZmlsdGVyVmFsdWUrPTEpIHtcblx0XHRcdHRoaXMud2VpZ2h0c1tpXSA9IGZpbHRlclZhbHVlO1xuXHRcdH1cblxuXHRcdC8vIG5vcm1hbGl6YXRpb24gZmFjdG9yXG5cdFx0dGhpcy5ub3JtRmFjdG9yID0gMDtcblx0XHRmb3IobGV0IGk9MTsgaTw9aGFsZkZpbHRlclNpemU7IGkrKykge1xuXHRcdFx0dGhpcy5ub3JtRmFjdG9yICs9IGkqaTtcblx0XHR9XG5cdFx0dGhpcy5ub3JtRmFjdG9yID0gMC41IC8gdGhpcy5ub3JtRmFjdG9yO1xuXG5cdFx0dGhpcy5yaW5nQnVmZmVyID0gbnVsbDsvL25ldyBGbG9hdDMyQXJyYXkodGhpcy5vcmRlciAqIHRoaXMucGFyYW1zLmZyYW1lU2l6ZSk7XG5cdFx0dGhpcy5yaW5nSW5kZXggPSAwO1xuXHR9XG5cblx0aW5pdGlhbGl6ZShzdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdHN1cGVyLmluaXRpYWxpemUoc3RyZWFtUGFyYW1zKTtcblx0XHR0aGlzLnBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cdFx0dGhpcy5yaW5nQnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnBhcmFtcy5vcmRlciAqIHRoaXMucGFyYW1zLmZyYW1lU2l6ZSk7XG5cdH1cblxuXHRyZXNldCgpIHtcblx0XHRzdXBlci5yZXNldCgpO1xuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMucmluZ0J1ZmZlci5sZW5ndGg7IGkrKykge1xuXHRcdFx0dGhpcy5yaW5nQnVmZmVyW2ldID0gdGhpcy5wYXJhbXMuZmlsbDtcblx0XHR9XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdGNvbnN0IHJpbmdJbmRleCA9IHRoaXMucmluZ0luZGV4O1xuXHRcdGNvbnN0IGZyYW1lU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTtcblx0XHRjb25zdCBvcmRlciA9IHRoaXMucGFyYW1zLm9yZGVyO1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8ZnJhbWVTaXplOyBpKyspIHtcblx0XHRcdHRoaXMucmluZ0J1ZmZlcltyaW5nSW5kZXggKiBmcmFtZVNpemUgKyBpXSA9IGZyYW1lW2ldO1xuXHRcdFx0dGhpcy5vdXRGcmFtZVtpXSA9IDA7XG5cdFx0fVxuXG5cdFx0Zm9yKGxldCBpPTA7IGk8b3JkZXI7IGkrKykge1xuXHRcdFx0Zm9yKGxldCBqPTA7IGo8ZnJhbWVTaXplOyBqKyspIHtcblx0XHRcdFx0dGhpcy5vdXRGcmFtZVtqXSArPSB0aGlzLnJpbmdCdWZmZXJbaSAqIGZyYW1lU2l6ZSArIGpdICogdGhpcy53ZWlnaHRzW2ldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvcihsZXQgaT0wOyBpPGZyYW1lU2l6ZTsgaSsrKSB7XG5cdFx0XHR0aGlzLm91dEZyYW1lW2ldICo9IHRoaXMubm9ybUZhY3Rvcjtcblx0XHR9XG5cblx0XHR0aGlzLnJpbmdJbmRleCA9IChyaW5nSW5kZXggKyAxKSAlIG9yZGVyO1xuXG5cdFx0Ly8gTk9XIERFQUwgV0lUSCBUSU1FIDpcblx0XHRpZih0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlKSB7XG5cdFx0XHR0aW1lIC09IDAuNSAqIG9yZGVyIC8gdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZTtcblx0XHR9XG5cblx0XHQvL2NvbnNvbGUubG9nKHRoaXMub3V0RnJhbWUpO1xuXHRcdHRoaXMub3V0cHV0KHRpbWUsIHRoaXMub3V0RnJhbWUsIG1ldGFEYXRhKTtcblx0fVxufSIsIlxuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5pbXBvcnQgUmVzYW1wbGVyIGZyb20gJy4vbGZvLXJlc2FtcGxlcic7XG5pbXBvcnQgUmVzYW1wbGVyRXhwIGZyb20gJy4vbGZvLXJlc2FtcGxlci1leHBlcmltZW50YWwnO1xuaW1wb3J0IFBzZXVkb1lpbiBmcm9tICcuL2xmby1wc2V1ZG8teWluJztcblxuXG4vLyA9PT09PT09PT09PT09PT09IHBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3cgPT09PT09PT09PT09PSAvL1xuLy8gLS0+IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC81NDM4NjUwXG5cbihmdW5jdGlvbigpe1xuXG4gIGlmIChcInBlcmZvcm1hbmNlXCIgaW4gd2luZG93ID09IGZhbHNlKSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBcbiAgRGF0ZS5ub3cgPSAoRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkgeyAgLy8gdGhhbmtzIElFOFxuXHQgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfSk7XG5cbiAgaWYgKFwibm93XCIgaW4gd2luZG93LnBlcmZvcm1hbmNlID09IGZhbHNlKSB7XG4gICAgXG4gICAgdmFyIG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgXG4gICAgaWYgKHBlcmZvcm1hbmNlLnRpbWluZyAmJiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0KSB7XG4gICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0XG4gICAgfVxuXG4gICAgd2luZG93LnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgIH1cbiAgfVxuXG59KSgpO1xuXG4vLyB3ZWJraXRBdWRpb0NvbnRleHQgZm9yIHNhZmFyaSwgZW1wdHkgZnVuY3Rpb24gZm9yIG9sZCBhbmRyb2lkXG4vLyBbIEF1ZGlvIG5vdCBuZWVkZWQgaGVyZSBdXG5sZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSW5wdXRQcm9jZXNzaW5nQ2hhaW4gZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGlucHV0RnJhbWVTaXplOiAxLFxuXHRcdFx0d2luZG93U2l6ZTogMTI4LFxuXHRcdFx0aG9wU2l6ZTogNjQsXG5cdFx0XHQvL291dHB1dFJhdGU6IDUwLFx0XG5cdFx0XHRwZXJpb2Q6IDIwXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLmV2ZW50SW4gPSBuZXcgbGZvLnNvdXJjZXMuRXZlbnRJbih7XG5cdFx0XHQvL3JlbGF0aXZlOiB0cnVlLFxuXHRcdFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSxcblx0XHRcdGN0eDogQXVkaW9Db250ZXh0XG5cdFx0fSk7XG5cblx0XHR0aGlzLnJlc2FtcGxlciA9IG5ldyBSZXNhbXBsZXIoe1xuXHRcdFx0ZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSxcblx0XHRcdHBlcmlvZDogdGhpcy5wYXJhbXMucGVyaW9kIC8vIGluIG1pbGxpc2Vjb25kc1xuXHRcdH0pO1xuXG5cdFx0Ly8gdGhpcy5yZXNhbXBsZXIgPSBuZXcgUmVzYW1wbGVyRXhwKHtcblx0XHQvLyBcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdFx0Ly8gXHRvdXRwdXRSYXRlOiB0aGlzLnBhcmFtcy5vdXRwdXRSYXRlLFxuXHRcdC8vIFx0YnVmZmVyRHVyYXRpb246IDE1MFxuXHRcdC8vIFx0Ly9wZXJpb2Q6IHRoaXMucGFyYW1zLnBlcmlvZCAvLyBpbiBtaWxsaXNlY29uZHNcblx0XHQvLyB9KTtcblxuXHRcdC8vIHRoaXMuZmlsdGVyID0gbmV3IGxmby5vcGVyYXRvcnMuTW92aW5nTWVkaWFuKHtcblx0XHQvLyAvL3RoaXMuZmlsdGVyID0gbmV3IGxmby5vcGVyYXRvcnMuTW92aW5nQXZlcmFnZSh7IC8vIGZpbGwoKSBmdW5jdGlvbiBub3QgcmVjb2duaXplZFxuXHRcdC8vIFx0b3JkZXI6IDFcblx0XHQvLyB9KTtcblxuXHRcdHRoaXMuZnJhbWVyID0gbmV3IGxmby5vcGVyYXRvcnMuRnJhbWVyKHtcblx0XHRcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMud2luZG93U2l6ZSAqIHRoaXMucGFyYW1zLmlucHV0RnJhbWVTaXplLFxuXHRcdFx0Ly9mcmFtZVJhdGU6IHRoaXMucmVzYW1wbGVyLmZyYW1lUmF0ZSAvICh0aGlzLnBhcmFtcy53aW5kb3dTaXplICogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUpLFxuXHRcdFx0aG9wU2l6ZTogdGhpcy5wYXJhbXMuaG9wU2l6ZVxuXHRcdFx0Ly9jZW50ZXJlZFRpbWVUYWc6IHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZGVzY3IgPSBuZXcgUHNldWRvWWluKHtcblx0XHRcdC8vZnJhbWVTaXplOiAzLCAvLyBkZWZpbmVkIGludGVybmFsbHlcblx0XHRcdGlucHV0UmF0ZTogMTAwMCAvIHRoaXMucGFyYW1zLnBlcmlvZCxcblx0XHRcdG5vaXNlVGhyZXNob2xkOiAwLjAzXG5cdFx0fSk7XG5cblx0XHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0XHQvLz09PT09PT09PT0gY29ubmVjdCB0aGluZ3MgPT09PT09PT09Ly9cblx0XHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuXHRcdHRoaXMuZXZlbnRJbi5jb25uZWN0KHRoaXMucmVzYW1wbGVyKTtcblx0XHQvL3RoaXMucmVzYW1wbGVyLmNvbm5lY3QodGhpcy5maWx0ZXIpO1xuXHRcdC8vdGhpcy5ldmVudEluLmNvbm5lY3QodGhpcy5maWx0ZXIpO1xuXHRcdC8vdGhpcy5maWx0ZXIuY29ubmVjdCh0aGlzLmZyYW1lcik7XG5cdFx0dGhpcy5yZXNhbXBsZXIuY29ubmVjdCh0aGlzLmZyYW1lcik7XG5cdFx0dGhpcy5mcmFtZXIuY29ubmVjdCh0aGlzLmRlc2NyKTtcblxuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0dGhpcy5ldmVudEluLnN0YXJ0KCk7XG5cdH1cblxuXHRzdG9wKCkge1xuXHRcdHRoaXMuZXZlbnRJbi5zdG9wKCk7XG5cdH1cblxuXHRjb25uZWN0KGNoaWxkKSB7XG4gICAgXHR0aGlzLmRlc2NyLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIFx0Y2hpbGQucGFyZW50ID0gdGhpcy5kZXNjcjtcblx0fVxuXG5cdC8vIFRPRE8gOiBpbXBsZW1lbnQgZGlzY29uZWN0KClcblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdC8vdGhpcy5ldmVudEluLnByb2Nlc3MocGVyZm9ybWFuY2Uubm93KCksIFtmcmFtZV0pO1xuXHRcdFxuXHRcdC8vY29uc29sZS5sb2coJ1BzZXVkby1ZaW4gb3V0RnJhbWUgOiAnICsgdGhpcy5kZXNjci5vdXRGcmFtZSk7XG5cdFx0dGhpcy5ldmVudEluLnByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKTtcblxuXHRcdC8vXHR0aGlzLnJlc2FtcGxlci5wcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSk7XG5cdH1cblxuXHRwcmVGcmFtZXJDb25uZWN0KGRlc3QpIHtcblx0XHQvL3RoaXMuZmlsdGVyLmNvbm5lY3QoZGVzdCk7XG5cdFx0dGhpcy5yZXNhbXBsZXIuY29ubmVjdChkZXN0KTtcblx0fVxufVxuXG4iLCIvLyBpbnRlbnNpdHkgOiBsZm8gcmV0dXJuaW5nIGFuIGVzdGltYXRpb24gb2YgbW92ZW1lbnQgaW50ZW5zaXR5IChlbmVyZ3kpXG4vLyB1c2VzIGRlcml2YXRpb24gKyBpbnRlZ3JhdGlvbiB0byByZXR1cm4gdG8gemVybyB3aGVuIHRoZXJlIGlzIG5vIG1vdmVtZW50XG4vLyBiYXNlZCBvbiB0aGUgaW50ZW5zaXR5IG1vZHVsZSBkZXZlbG9wZWQgYnkgRnJlZCBCZXZpbGFjcXVhIGFuZCBHYWVsIER1YnVzXG4vLyBmb3IgdGhlIE11c2ljQnJpY2tzIEVVIHByb2plY3RcblxuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5pbXBvcnQgRGVsdGEgZnJvbSAnLi9sZm8tZGVsdGEnO1xuXG4vLyBpbnRlcm5hbCBjbGFzcyA6IHRoZSBjb21wbGV0ZSBhbGdvcml0aG0gbmVlZHMgbGluZWFyIHJlZ3Jlc3Npb24gYXMgZGVyaXZhdGlvblxuXG5jbGFzcyBJbnRlbnNpdHlDb3JlIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRpbnRlZ3JhdGlvbkZhY3RvcjogMC44LFxuXHRcdFx0b3V0cHV0R2FpbjogMC4wMDVcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuaW5wdXREaW1zID0gMDtcblxuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblx0fVxuXG5cdGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMgPSB7fSwgb3V0U3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHR0aGlzLmlucHV0RnJhbWVTaXplID0gaW5TdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHRcdHRoaXMuZnJhbWVBY2N1bXVsYXRvciA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5pbnB1dEZyYW1lU2l6ZSk7XG5cblx0XHRvdXRTdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gMTtcblx0XHRzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCBvdXRTdHJlYW1QYXJhbXMpO1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5pbnB1dEZyYW1lU2l6ZTsgaSsrKSB7XG5cdFx0XHR0aGlzLmZyYW1lQWNjdW11bGF0b3JbaV0gPSAwO1xuXHRcdH1cblx0XHQvL2NvbnNvbGUubG9nKHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSArICcgJyArIHRoaXMuaW5wdXRGcmFtZVNpemUpO1xuXHR9XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHRjb25zdCBmYWN0b3IgPSB0aGlzLnBhcmFtcy5pbnRlZ3JhdGlvbkZhY3Rvcjtcblx0XHRjb25zdCBnYWluID0gdGhpcy5wYXJhbXMub3V0cHV0R2Fpbjtcblx0XHRjb25zdCBpblNpemUgPSB0aGlzLmlucHV0RnJhbWVTaXplO1xuXHRcdGNvbnN0IGZyYW1lQnVmID0gdGhpcy5mcmFtZUFjY3VtdWxhdG9yO1xuXG5cdFx0bGV0IG91dFZhbHVlID0gMDtcblxuXHRcdGZvcihsZXQgaT0wOyBpPGluU2l6ZTsgaSsrKSB7XG5cdFx0XHRsZXQgc3FpID0gZnJhbWVbaV0gKiBmcmFtZVtpXTtcblx0XHRcdGZyYW1lQnVmW2ldID0gc3FpICsgZnJhbWVCdWZbaV0gKiBmYWN0b3I7XG5cblx0XHRcdC8vIG91dFZhbHVlICs9IGZyYW1lQnVmW2ldICogZ2Fpbjtcblx0XHRcdFxuXHRcdFx0Ly8gc2VlIGJlbG93IDogdXNlIHNxcnQgaW5zdGVhZCBvZiBvdXRwdXQgZ2FpblxuXHRcdFx0b3V0VmFsdWUgKz0gZnJhbWVCdWZbaV07XG5cdFx0fVxuXG5cdFx0Ly8gdGhpcy5vdXRGcmFtZVswXSA9IG91dFZhbHVlO1xuXG5cdFx0Ly8gbGl0dGxlIG1vZCA6IHVzZSBzcXJ0IGluc3RlYWQgb2Ygb3V0cHV0IGdhaW5cblx0XHQvLyBzbyB0aGF0IHRoZSBhbGdvcml0aG0gaXMgbW9yZSBzaW1pbGFyIHRvIFJNUyBjb21wdXRhdGlvblxuXHRcdC8vIChzcXJ0J2VkIHN1bSBvZiBzcXVhcmVzKVxuXHRcdHRoaXMub3V0RnJhbWVbMF0gPSBNYXRoLnNxcnQob3V0VmFsdWUpO1xuXHRcdC8vY29uc29sZS5sb2cob3V0VmFsdWUpO1xuXHRcdHRoaXMub3V0cHV0KHRpbWUsIHRoaXMub3V0RnJhbWUsIG1ldGFEYXRhKTtcblx0fVxufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG4vLz09PT09PT09PT09PT0gdGhlIHJlYWwgSW50ZW5zaXR5IGNsYXNzID09PT09PT09PT09PT09PS8vXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEludGVuc2l0eSBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5kZWx0YSA9IG5ldyBEZWx0YSh7XG5cdFx0XHRvcmRlcjogM1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5pbnRlbnNpdHkgPSBuZXcgSW50ZW5zaXR5Q29yZSh7XG5cdFx0fSk7XG5cblx0XHR0aGlzLmRlbHRhLmNvbm5lY3QodGhpcy5pbnRlbnNpdHkpO1xuXG5cdH1cblxuXHRpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zID0ge30sIG91dFN0cmVhbVBhcmFtcyA9IHt9KSB7XG5cdFx0dGhpcy5kZWx0YS5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCBvdXRTdHJlYW1QYXJhbXMpO1xuXHR9XG5cblx0Y29ubmVjdChjaGlsZCkge1xuICAgIFx0dGhpcy5pbnRlbnNpdHkuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgXHRjaGlsZC5wYXJlbnQgPSB0aGlzLmludGVuc2l0eTtcblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0dGhpcy5kZWx0YS5wcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSk7XG5cdH1cbn0iLCJpbXBvcnQgKiBhcyBsZm8gZnJvbSBcIndhdmVzLWxmb1wiO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PSBkZXNjcmlwdG9ycyBsZm8gPT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBzZXVkb1lpbiBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0ZnJhbWVTaXplOiAzLFxuXHRcdFx0Ly8gbWluSW5wdXQ6IC0zNjAsXG5cdFx0XHQvLyBtYXhJbnB1dDogMzYwLFxuXHRcdFx0bm9pc2VUaHJlc2hvbGQ6IDAuMVxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5tZWFuID0gMDtcblx0XHR0aGlzLm1hZ25pdHVkZSA9IDA7XG5cdFx0dGhpcy5zdGREZXYgPSAwO1xuXHRcdHRoaXMuY3Jvc3NpbmdzID0gW107XG5cdFx0dGhpcy5wZXJpb2RNZWFuID0gMDtcblx0XHR0aGlzLnBlcmlvZFN0ZERldiA9IDA7XG5cdFx0Ly90aGlzLmlucHV0UmF0ZSA9IHRoaXMucGFyYW1zLmlucHV0UmF0ZTtcblx0XHR0aGlzLm5vaXNlVGhyZXNob2xkID0gdGhpcy5wYXJhbXMubm9pc2VUaHJlc2hvbGQ7XG5cblx0XHQvL3RoaXMubWF4RnJlcSA9IHRoaXMuaW5wdXRSYXRlIC8gMC41O1xuXHR9XG5cblx0aW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcyA9IHt9LCBvdXRTdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdG91dFN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG5cdFx0c3VwZXIuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcywgb3V0U3RyZWFtUGFyYW1zKTtcblx0XHRjb25zb2xlLmxvZyh0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlKTtcblxuXHRcdC8vIG5vcm1hbGl6ZSBmcmVxdWVuY3kgd2l0aCBtYXhGcmVxXG5cdFx0aWYoIXRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUpIHtcblx0XHRcdHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUgPSAxMDtcblx0XHR9XG5cdFx0dGhpcy5tYXhGcmVxID0gdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSAqIDAuNTtcblxuXHRcdC8vIG5vcm1hbGl6ZSBwZXJpb2RpY2l0eSB3aXRoIG1heFBlcmlvZCAtIG1pblBlcmlvZFxuXHRcdC8vIG1pblBlcmlvZCBpcyAyIHNhbXBsZXNcblx0XHQvLyBtYXhQZXJpb2QgaXMgZnJhbWVTaXplIC0gMVxuXHRcdC8vIHNpbXBsaWZpY2F0aW9uIDogbWluUGVyaW9kID0gMCwgbWF4UGVyaW9kID0gZnJhbWVTaXplXG5cdFx0Ly8gPT4gbWF4IG1lYW4gPSBmcmFtZVNpemUgLyAyXG5cdFx0Ly8gPT4gbWF4IHN0ZCBkZXYgPSBzcXJ0KDIgKiAoZnJhbXNpemUgLyAyKSAqIChmcmFtZXNpemUgLyAyKSkgXG5cdFx0Ly9cdFx0XHRcdCAgPSBzcXJ0KGZyYW1lc2l6ZSAqIGZyYW1lc2l6ZSAqIDAuNSlcblx0XHQvLyAgXHRcdFx0ICA9IGZyYW1lc2l6ZSAqIHNxcnQoMC41KSA8IGZyYW1lc2l6ZVxuXG5cdFx0Lypcblx0XHRzdXBlci5pbml0aWFsaXplKHtcblx0XHRcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuZnJhbWVTaXplXG5cdFx0fSk7XG5cdFx0Ki9cblx0fVxuXG5cdF9tYWluQWxnb3JpdGhtKCkge1xuXG5cdFx0Ly8gY29tcHV0ZSBtaW4sIG1heCBhbmQgbWVhbiAoYW5kIG1hZ25pdHVkZSlcblx0XHRsZXQgbWluLCBtYXg7XG5cdFx0bWluID0gbWF4ID0gdGhpcy5pbnB1dEZyYW1lWzBdO1xuXHRcdHRoaXMubWVhbiA9IDA7XG5cdFx0dGhpcy5tYWduaXR1ZGUgPSAwO1xuXHRcdGZvcihsZXQgaSBpbiB0aGlzLmlucHV0RnJhbWUpIHtcblx0XHRcdGxldCB2YWwgPSB0aGlzLmlucHV0RnJhbWVbaV07XG5cdFx0XHR0aGlzLm1hZ25pdHVkZSArPSB2YWwgKiB2YWw7XG5cdFx0XHR0aGlzLm1lYW4gKz0gdmFsO1xuXHRcdFx0aWYodmFsID4gbWF4KSB7XG5cdFx0XHRcdG1heCA9IHZhbDtcblx0XHRcdH0gZWxzZSBpZih2YWwgPCBtaW4pIHtcblx0XHRcdFx0bWluID0gdmFsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBUT0RPIDogbW9yZSB0ZXN0cyB0byBkZXRlcm1pbmUgd2hpY2ggbWVhbiAodHJ1ZSBtZWFuIG9yIChtYXgtbWluKS8yKSBpcyB0aGUgYmVzdFxuXHRcdC8vdGhpcy5tZWFuIC89IHRoaXMuaW5wdXRGcmFtZS5sZW5ndGg7XG5cdFx0dGhpcy5tZWFuID0gbWluICsgKG1heCAtIG1pbikgKiAwLjU7XG5cblx0XHR0aGlzLm1hZ25pdHVkZSAvPSB0aGlzLmlucHV0RnJhbWUubGVuZ3RoO1xuXHRcdHRoaXMubWFnbml0dWRlID0gTWF0aC5zcXJ0KHRoaXMubWFnbml0dWRlKTtcblxuXHRcdC8vIGNvbXB1dGUgc2lnbmFsIHN0ZERldiBhbmQgbnVtYmVyIG9mIG1lYW4tY3Jvc3NpbmdzXG5cdFx0Ly8gZGVzY2VuZGluZyBtZWFuIGNyb3NzaW5nIGlzIHVzZWQgaGVyZVxuXHRcdHRoaXMuY3Jvc3NpbmdzID0gW107XG5cdFx0dGhpcy5zdGREZXYgPSAwO1xuXHRcdGxldCBwcmV2RGVsdGEgPSB0aGlzLmlucHV0RnJhbWVbMF0gLSB0aGlzLm1lYW47XG5cdFx0Zm9yKGxldCBpIGluIHRoaXMuaW5wdXRGcmFtZSkge1xuXHRcdFx0bGV0IGRlbHRhID0gdGhpcy5pbnB1dEZyYW1lW2ldIC0gdGhpcy5tZWFuO1xuXHRcdFx0dGhpcy5zdGREZXYgKz0gZGVsdGEgKiBkZWx0YTtcblx0XHRcdGlmKHByZXZEZWx0YSA+IHRoaXMubm9pc2VUaHJlc2hvbGQgJiYgZGVsdGEgPCB0aGlzLm5vaXNlVGhyZXNob2xkKSB7XG5cdFx0XHRcdHRoaXMuY3Jvc3NpbmdzLnB1c2goaSk7XG5cdFx0XHR9XG5cdFx0XHRwcmV2RGVsdGEgPSBkZWx0YTtcblx0XHR9XG5cdFx0dGhpcy5zdGREZXYgLz0gKHRoaXMuaW5wdXRGcmFtZS5sZW5ndGggLSAxKTtcblx0XHR0aGlzLnN0ZERldiA9IE1hdGguc3FydCh0aGlzLnN0ZERldik7XG5cblx0XHQvLyBjb21wdXRlIG1lYW4gb2YgZGVsdGEtVCBiZXR3ZWVuIGNyb3NzaW5nc1xuXHRcdHRoaXMucGVyaW9kTWVhbiA9IDA7XG5cdFx0Zm9yKGxldCBpPTE7IGk8dGhpcy5jcm9zc2luZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMucGVyaW9kTWVhbiArPSB0aGlzLmNyb3NzaW5nc1tpXSAtIHRoaXMuY3Jvc3NpbmdzW2kgLSAxXTtcblx0XHR9XG5cdFx0dGhpcy5wZXJpb2RNZWFuIC89ICh0aGlzLmNyb3NzaW5ncy5sZW5ndGggLSAxKTtcblxuXHRcdC8vIGNvbXB1dGUgc3RkRGV2IG9mIGRlbHRhLVQgYmV0d2VlbiBjcm9zc2luZ3Ncblx0XHR0aGlzLnBlcmlvZFN0ZERldiA9IDA7XG5cdFx0Zm9yKGxldCBpPTE7IGk8dGhpcy5jcm9zc2luZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxldCBkZWx0YVAgPSAodGhpcy5jcm9zc2luZ3NbaV0gLSB0aGlzLmNyb3NzaW5nc1tpIC0gMV0gLSB0aGlzLnBlcmlvZE1lYW4pXG5cdFx0XHR0aGlzLnBlcmlvZFN0ZERldiArPSBkZWx0YVAgKiBkZWx0YVA7XG5cdFx0fVxuXHRcdGlmKHRoaXMuY3Jvc3NpbmdzLmxlbmd0aCA+IDIpIHtcblx0XHRcdHRoaXMucGVyaW9kU3RkRGV2ID0gTWF0aC5zcXJ0KHRoaXMucGVyaW9kU3RkRGV2IC8gKHRoaXMuY3Jvc3NpbmdzLmxlbmd0aCAtIDIpKTtcblx0XHR9XG5cdH1cblxuXHRzZXROb2lzZVRocmVzaG9sZCh0aHJlc2gpIHtcblx0XHR0aGlzLm5vaXNlVGhyZXNob2xkID0gdGhyZXNoO1xuXHR9XG5cblx0Ly8gdGhpcyBvbmUgZ2V0cyBmcmFtZXMgdG8gYW5hbHl6ZSA6IGNvbXB1dGUgbWFnbml0dWRlLCB6ZXJvIGNyb3NzaW5nIHJhdGUsIGFuZCBwZXJpb2RpY2l0eVxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cdFx0dGhpcy5pbnB1dEZyYW1lID0gZnJhbWU7XG5cblx0XHR0aGlzLl9tYWluQWxnb3JpdGhtKCk7XG5cblx0XHR0aGlzLmFtcGxpdHVkZSA9IHRoaXMuc3RkRGV2ICogMi4wOyAvLyBlbXBpcmljYWwgZmFjdG9yIGJlY2F1c2Ugd2UgZG9uJ3Qga25vdyBhIHByaW9yaSBzZW5zb3IgcmFuZ2VcblxuXHRcdC8vdGhpcy5mcmVxdWVuY3kgPSBNYXRoLnNxcnQodGhpcy5jcm9zc2luZ3MubGVuZ3RoICogMi4wIC8gdGhpcy5pbnB1dEZyYW1lLmxlbmd0aCk7IC8vIHNxcnQnZWQgbm9ybWFsaXplZCBieSBueXF1aXN0IGZyZXFcblx0XHR0aGlzLmZyZXF1ZW5jeSA9IHRoaXMuY3Jvc3NpbmdzLmxlbmd0aCAqIDIuMCAvIHRoaXMuaW5wdXRGcmFtZS5sZW5ndGg7IC8vIG5vcm1hbGl6ZWQgYnkgbnlxdWlzdCBmcmVxXG5cdFx0XG5cdFx0aWYodGhpcy5jcm9zc2luZ3MubGVuZ3RoID4gMikge1xuXHRcdFx0Ly9sZXQgY2xpcCA9IHRoaXMucGVyaW9kU3RkRGV2ICogNSAvIHRoaXMuaW5wdXRGcmFtZS5sZW5ndGg7XG5cdFx0XHQvL2NsaXAgPSBNYXRoLm1pbihjbGlwLCAxLik7XG5cdFx0XHQvL3RoaXMucGVyaW9kaWNpdHkgPSAxLjAgLSBNYXRoLnNxcnQoY2xpcCk7XG5cblx0XHRcdHRoaXMucGVyaW9kaWNpdHkgPSAxLjAgLSBNYXRoLnNxcnQodGhpcy5wZXJpb2RTdGREZXYgLyB0aGlzLmlucHV0RnJhbWUubGVuZ3RoKTtcblx0XHRcdC8vdGhpcy5wZXJpb2RpY2l0eSA9IDEuMCAtIE1hdGgucG93KHRoaXMucGVyaW9kU3RkRGV2IC8gdGhpcy5pbnB1dEZyYW1lLmxlbmd0aCwgMC43KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wZXJpb2RpY2l0eSA9IDA7XG5cdFx0fVxuXG5cdFx0Ly8gVE9ETyA6IGltcHJvdmUgcGVyaW9kaWNpdHkgYWxnb3JpdGhtICEhIVxuXHRcdHRoaXMub3V0RnJhbWVbMF0gPSB0aGlzLmFtcGxpdHVkZTtcblx0XHR0aGlzLm91dEZyYW1lWzFdID0gdGhpcy5mcmVxdWVuY3k7XG5cdFx0dGhpcy5vdXRGcmFtZVsyXSA9IHRoaXMucGVyaW9kaWNpdHk7XG5cdFx0dGhpcy5vdXRwdXQoKTtcblx0fVxufVxuIiwiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbi8vID09PT09PT09PT09PT09PT0gcG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdyA9PT09PT09PT09PT09IC8vXG4vLyAtLT4gaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzU0Mzg2NTBcblxuKGZ1bmN0aW9uKCl7XG5cbiAgaWYgKFwicGVyZm9ybWFuY2VcIiBpbiB3aW5kb3cgPT0gZmFsc2UpIHtcbiAgICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHt9O1xuICB9XG4gIFxuICBEYXRlLm5vdyA9IChEYXRlLm5vdyB8fCBmdW5jdGlvbiAoKSB7ICAvLyB0aGFua3MgSUU4XG5cdCAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9KTtcblxuICBpZiAoXCJub3dcIiBpbiB3aW5kb3cucGVyZm9ybWFuY2UgPT0gZmFsc2UpIHtcbiAgICBcbiAgICB2YXIgbm93T2Zmc2V0ID0gRGF0ZS5ub3coKTtcbiAgICBcbiAgICBpZiAocGVyZm9ybWFuY2UudGltaW5nICYmIHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnQpIHtcbiAgICAgIG5vd09mZnNldCA9IHBlcmZvcm1hbmNlLnRpbWluZy5uYXZpZ2F0aW9uU3RhcnRcbiAgICB9XG5cbiAgICB3aW5kb3cucGVyZm9ybWFuY2Uubm93ID0gZnVuY3Rpb24gbm93KCkge1xuICAgICAgcmV0dXJuIERhdGUubm93KCkgLSBub3dPZmZzZXQ7XG4gICAgfVxuICB9XG5cbn0pKCk7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PSByZXNhbXBsZXIgbGZvID09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzYW1wbGVyIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRmcmFtZVNpemU6IDEsXG5cdFx0XHRidWZmZXJEdXJhdGlvbjogMTAwLCBcdC8vbXNcblx0XHRcdG91dHB1dFJhdGU6IDUwXHRcdFx0Ly9IelxuXHRcdH1cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlID0gdGhpcy5wYXJhbXMub3V0cHV0UmF0ZTtcblx0XHR0aGlzLm91dHB1dFBlcmlvZCA9IDEwMDAgLyB0aGlzLnBhcmFtcy5vdXRwdXRSYXRlO1xuXHRcdHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUgPSAxMDAwIC8gdGhpcy5vdXRwdXRQZXJpb2Q7XG5cblx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblx0XHR0aGlzLmNvdW50ZXIgPSAwO1xuXHRcdHRoaXMuaW5wdXRCdWZmZXIgPSBbXTtcblxuXHRcdC8vPT09PT09PSBjYWxsYmFjayBmdW5jdGlvbiA9PT09PT09Ly9cblx0XHR0aGlzLmZpcmUgPSAoKCkgPT4ge1xuXHRcdFx0Y29uc3Qgbm93ID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0XHRcblx0XHRcdC8vdGhpcy50aW1lID0gbm93O1xuXHRcdFx0dGhpcy5jb3VudGVyKys7XG5cdFx0XHR0aGlzLnRpbWUgPSB0aGlzLmNvdW50ZXIgKiB0aGlzLm91dHB1dFBlcmlvZDtcblxuXHRcdFx0Y29uc3QgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHRcdFx0Y29uc3QgYnVmID0gdGhpcy5pbnB1dEJ1ZmZlcjtcblx0XHRcdGNvbnN0IGRlbCA9IHRoaXMucGFyYW1zLmJ1ZmZlckR1cmF0aW9uO1xuXG5cdFx0XHQvL2NvbnN0IG5leHRJbnRlcnZhbCA9IHRoaXMub3V0cHV0UGVyaW9kIC0gKG5vdyAtIHRoaXMubGFzdE5vdyk7XG5cdFx0XHQvL2lmKG5leHRJbnRlcnZhbCA8IDApIG5leHRJbnRlcnZhbCA9IHRoaXMub3V0cHV0UGVyaW9kO1xuXHRcdFx0Ly90aGlzLmxhc3ROb3cgPSBub3c7XG5cdFx0XHQvL3NldFRpbWVvdXQodGhpcy5maXJlLmJpbmQodGhpcyksIG5leHRJbnRlcnZhbCk7XG5cblx0XHRcdGlmKGJ1Zi5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYoYnVmLmxlbmd0aCA9PT0gMSkgeyAvLyBiZWdpbm5pbmcgb3IgcGVyaW9kIHdpdGhvdXQgaW5jb21pbmcgZGF0YSA+IGJ1ZkR1clxuXHRcdFx0XHRpZihidWZbMF0uZGF0ZSArIGRlbCA8IG5vdykgeyAvLyBwZXJpb2Qgd2l0aG91dCBpbmNvbWluZyBkYXRhID4gYnVmRHVyXG5cdFx0XHRcdFx0Zm9yKGxldCBpPTA7IGk8ZnJhbWVTaXplOyBpKyspIHtcblx0XHRcdFx0XHRcdHRoaXMub3V0RnJhbWVbaV0gPSBidWZbMF0uZnJhbWVbaV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMub3V0cHV0KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gdGhlbiA6XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8YnVmLmxlbmd0aC0xOyBpKyspIHtcblx0XHRcdFx0bGV0IGwgPSBidWZbaV0sXG5cdFx0XHRcdFx0ciA9IGJ1ZltpKzFdO1xuXHRcdFx0XHRpZihsLmRhdGUgKyBkZWwgPD0gbm93ICYmIHIuZGF0ZSArIGRlbCA+IG5vdykge1xuXHRcdFx0XHRcdGxldCBwY3QgPSAobm93IC0gKGwuZGF0ZSArIGRlbCkpIC8gKHIuZGF0ZSAtIGwuZGF0ZSk7XG5cdFx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8ZnJhbWVTaXplOyBqKyspIHtcblx0XHRcdFx0XHRcdHRoaXMub3V0RnJhbWVbal0gPSBsLmZyYW1lW2pdICsgKHIuZnJhbWVbal0gLSBsLmZyYW1lW2pdKSAqIHBjdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5vdXRwdXQoKTtcblx0XHRcdFx0XHQvLyByZW1vdmUgdXNlbGVzcyBmcmFtZXMgOlxuXHRcdFx0XHRcdGJ1Zi5zcGxpY2UoMCwgaSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vY29uc29sZS5sb2coYnVmLmxlbmd0aCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpbml0aWFsaXplKCkge1xuXHRcdHN1cGVyLmluaXRpYWxpemUoKTtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH1cblxuXHRmaW5hbGl6ZSgpIHtcblx0XHRzdXBlci5maW5hbGl6ZSgpO1xuXHRcdHRoaXMuc3RvcCgpO1xuXHR9XG5cblx0c3RhcnQoKSB7XG5cdFx0aWYodGhpcy5ydW5uaW5nKSByZXR1cm47XG5cdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZTtcblxuXHRcdC8vIHRoaXMubGFzdE5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdC8vIHNldFRpbWVvdXQodGhpcy5maXJlLmJpbmQodGhpcyksIHRoaXMucGFyYW1zLm91dHB1dFBlcmlvZCk7XG5cblx0XHR0aGlzLmludGVydmFsSUQgPSBzZXRJbnRlcnZhbCh0aGlzLmZpcmUuYmluZCh0aGlzKSwgdGhpcy5vdXRwdXRQZXJpb2QpO1x0fVxuXG5cdHN0b3AoKSB7XG5cdFx0aWYoIXRoaXMucnVubmluZykgcmV0dXJuO1xuXHRcdHRoaXMucnVubmluZyA9IGZhbHNlO1xuXHRcdC8vY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSUQpO1xuXHR9XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHR0aGlzLmlucHV0QnVmZmVyLnB1c2goe1xuXHRcdFx0ZGF0ZTogcGVyZm9ybWFuY2Uubm93KCksXG5cdFx0XHRmcmFtZTogZnJhbWVcblx0XHR9KTtcblx0XHR0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cdH1cbn0iLCJpbXBvcnQgKiBhcyBsZm8gZnJvbSBcIndhdmVzLWxmb1wiO1xuXG4vLyA9PT09PT09PT09PT09PT09IHBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3cgPT09PT09PT09PT09PSAvL1xuLy8gLS0+IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC81NDM4NjUwXG5cbihmdW5jdGlvbigpe1xuXG4gIGlmIChcInBlcmZvcm1hbmNlXCIgaW4gd2luZG93ID09IGZhbHNlKSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBcbiAgRGF0ZS5ub3cgPSAoRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkgeyAgLy8gdGhhbmtzIElFOFxuXHQgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfSk7XG5cbiAgaWYgKFwibm93XCIgaW4gd2luZG93LnBlcmZvcm1hbmNlID09IGZhbHNlKSB7XG4gICAgXG4gICAgdmFyIG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgXG4gICAgaWYgKHBlcmZvcm1hbmNlLnRpbWluZyAmJiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0KSB7XG4gICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0XG4gICAgfVxuXG4gICAgd2luZG93LnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgIH1cbiAgfVxuXG59KSgpO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT0gcmVzYW1wbGVyIGxmbyA9PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2FtcGxlciBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0Ly9mcmFtZVNpemU6IDEsXG5cdFx0XHRwZXJpb2Q6IDIwXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlID0gMTAwMCAvIHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHQvL3RoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTtcblx0XHR0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVJhdGUgPSAxMDAwIC8gdGhpcy5wYXJhbXMucGVyaW9kO1xuXG5cdFx0Ly90aGlzLmZyYW1lUmF0ZSA9IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0dGhpcy5pbnRlcnZhbElEID0gLTE7XG5cdFx0dGhpcy50aW1lID0gMDtcblx0XHR0aGlzLmxhc3RUaW1lID0gMDtcblx0XHR0aGlzLmN1cnJlbnREYXRhID0gW107XG5cdFx0dGhpcy5jb3VudGVyID0gMDtcblx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblx0XHR0aGlzLm5leHRJbnRlcnZhbDtcblxuXHRcdC8vID09PT09PT09PT09PSB0aGUgY2FsbGJhY2sgPT09PT09PT09PT09PSAvL1xuXHRcdHRoaXMuYXBwZW5kRGF0YSA9ICgoKSA9PiB7XG5cdFx0XHRpZih0aGlzLmN1cnJlbnREYXRhLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQvLyBzZXRUaW1lb3V0KHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5wZXJpb2QpXG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmKCF0aGlzLnJ1bm5pbmcpIHJldHVybjtcblxuXHRcdFx0dGhpcy5jb3VudGVyKys7XG5cdFx0XHR0aGlzLnRpbWUgPSB0aGlzLmNvdW50ZXIgKiB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0XHQvL3RoaXMudGltZSA9IHRoaXMubGFzdFRpbWU7XG5cdFx0XHR0aGlzLm91dEZyYW1lLnNldCh0aGlzLmN1cnJlbnREYXRhLCAwKTtcblx0XHRcdHRoaXMub3V0cHV0KCk7XG5cblx0XHRcdC8vIGxldCBub3dUaW1lID0gcGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0XHQvLyBsZXQgaW5hY2N1cmFjeSA9IChub3dUaW1lIC0gdGhpcy5sYXN0VGltZSAtIHRoaXMucGFyYW1zLnBlcmlvZCkgJSB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0XHQvLyBsZXQgbmV4dEludGVydmFsID0gdGhpcy5wYXJhbXMucGVyaW9kIC0gaW5hY2N1cmFjeTtcblxuXHRcdFx0Ly8gdGhpcy5vdXRGcmFtZS5zZXQodGhpcy5jdXJyZW50RGF0YSwgMCk7XG5cdFx0XHQvLyB0aGlzLm91dHB1dCgpO1xuXG5cdFx0XHQvLyB0aGlzLmxhc3RUaW1lID0gbm93VGltZTtcblx0XHRcdC8vIHRoaXMudGltZSArPSBuZXh0SW50ZXJ2YWw7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyh0aGlzLnRpbWUpO1xuXHRcdFx0Ly8gc2V0VGltZW91dCh0aGlzLmFwcGVuZERhdGEuYmluZCh0aGlzKSwgbmV4dEludGVydmFsKTtcblx0XHR9KTtcblx0fVxuXG5cdGluaXRpYWxpemUoc3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHQvL3RoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZVxuXHRcdHN1cGVyLmluaXRpYWxpemUoc3RyZWFtUGFyYW1zLCB7XG5cdFx0XHRzb3VyY2VTYW1wbGVSYXRlOiB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlXG5cdFx0fSk7XG5cdFx0dGhpcy5zdGFydCgpO1xuXHR9XG5cblx0ZmluYWxpemUoKSB7XG5cdFx0c3VwZXIuZmluYWxpemUoKTtcblx0XHR0aGlzLnN0b3AoKTtcblx0fVxuXG5cdC8vIFRPRE8gOiBJTVBST1ZFIFRIRSBBQ0NVUkFDWSBCWSBVU0lORyA6IHNldFRpbWVvdXRcblxuXHRzdGFydCgpIHtcblx0XHRpZih0aGlzLnJ1bm5pbmcpIHJldHVybjtcblx0XHR0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuXHRcdHRoaXMuY3VycmVudERhdGEgPSBbXTtcblxuXHRcdHRoaXMuaW50ZXJ2YWxJRCA9IHNldEludGVydmFsKHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5wZXJpb2QpO1xuXG5cdFx0Ly8gdGhpcy5sYXN0VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdC8vIHRoaXMudGltZSA9IHRoaXMucGFyYW1zLnBlcmlvZDtcblx0XHQvLyBzZXRUaW1lb3V0KHRoaXMuYXBwZW5kRGF0YS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5wZXJpb2QpO1xuXHR9XG5cblx0c3RvcCgpIHtcblx0XHRpZighdGhpcy5ydW5uaW5nKSByZXR1cm47XG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cdFx0Ly9jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJRCk7XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdGlmKHRpbWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdC8vY29uc29sZS5sb2codGltZSk7XG5cdFx0dGhpcy5sYXN0VGltZSA9IHRpbWU7XG5cdFx0dGhpcy5jdXJyZW50RGF0YSA9IGZyYW1lO1xuXHRcdHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblx0fVxufVxuIiwiLypcbiAqXHRsZm8tc2VsZWN0IDogZmlsdGVycyB0aGUgb3V0cHV0IG9mIHByZXZpb3VzIGxmb1xuICpcdC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKlx0eW91IGNhbiBwbHVnIGFueSBsZm8gaW50byB2YXJpb3VzIGxmby1zZWxlY3RzIHRvIHNwbGl0IGl0cyBvdXRwdXRcbiAqIFx0YW5kIHZpc3VhbGl6ZSB0aGUgc3BsaXR0ZWQgb3V0cHV0cyBpbiBzZXBhcmF0ZSBsZm8tc2lua3MgZm9yIGV4YW1wbGVcbiAqL1xuXG5pbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2VsZWN0IGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0aW5kZXhMaXN0OiBbXSxcblx0XHRcdG1vZGU6IFwiaW5jbHVkZVwiIC8vIGNhbiBiZSBleGNsdWRlIG9yIGluY2x1ZGVcblx0XHR9XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0Ly8gcmVtb3ZlIGR1cGxpY2F0ZSBpbmRpY2VzIDpcblx0XHRsZXQgaW5kZXhMaXN0ID0gdGhpcy5wYXJhbXMuaW5kZXhMaXN0O1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8aW5kZXhMaXN0Lmxlbmd0aC0xOyBpKyspIHtcblx0XHRcdGZvcihsZXQgaj1pbmRleExpc3QubGVuZ3RoLTE7IGo+aTsgai0tKSB7XG5cdFx0XHRcdGlmKGluZGV4TGlzdFtpXSA9PSBpbmRleExpc3Rbal0pIHtcblx0XHRcdFx0XHRpbmRleExpc3Quc3BsaWNlKGosIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vY29uc29sZS5sb2coaW5kZXhMaXN0KTtcblxuXHR9XG5cblx0aW5pdGlhbGl6ZShzdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdHRoaXMuaW5wdXRGcmFtZVNpemUgPSBzdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMuaW5wdXRGcmFtZVNpemU7XG5cdFx0aWYodGhpcy5wYXJhbXMubW9kZSA9PT0gXCJleGNsdWRlXCIpIHtcblx0XHRcdGZvcihsZXQgaT10aGlzLnBhcmFtcy5pbmRleExpc3QubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdFx0XHRpZih0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPCB0aGlzLmlucHV0RnJhbWVTaXplICYmIHRoaXMucGFyYW1zLmluZGV4TGlzdFtpXSA+PSAwKSB7XG5cdFx0XHRcdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplLS07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wYXJhbXMuaW5kZXhMaXN0LnNwbGljZShpLCAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZih0aGlzLnBhcmFtcy5tb2RlID09PSBcImluY2x1ZGVcIikge1xuXHRcdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gMDtcblx0XHRcdGZvcihsZXQgaT10aGlzLnBhcmFtcy5pbmRleExpc3QubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuXHRcdFx0XHRpZih0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPCB0aGlzLmlucHV0RnJhbWVTaXplICYmIHRoaXMucGFyYW1zLmluZGV4TGlzdFtpXSA+PSAwKSB7XG5cdFx0XHRcdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplKys7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhpcy5wYXJhbXMuaW5kZXhMaXN0LnNwbGljZShpLCAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRzdXBlci5pbml0aWFsaXplKHRoaXMuc3RyZWFtUGFyYW1zKTtcblx0fVxuXG5cdC8vIFFVRVNUSU9OIDogYXJlIGZyYW1lLmxlbmd0aCBpbiBwcm9jZXNzIGFuZCBzdHJlYW1QYXJhbXMuZnJhbWVTaXplIGluIGluaXRpYWxpemUgdGhlIHNhbWUgdmFsdWUgP1xuXHQvLyBvdCBpcyBzdHJlYW1QYXJhbXMgaGVyZSB0byBhbGxvdyBzcGVjaWZpY2F0aW9uIG9mIFwiY29sdW1uc1wiIChvciBcInJvd3NcIiwgd2hhdGV2ZXIgLi4uKSA/XG5cdC8vIGp1c3QgaW4gY2FzZSwgbGV0J3Mga2VlcCB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSBmb3IgY29tcGFyaXNvblxuXHQvLyBpbiB0aGlzIGNhc2UgdGhlIHRyaWNreSBvbmUgc2hvdWxkIGJlIGxmby5zbGljZXIgLT4gaGF2ZSBhbm90aGVyIGxvb2sgYXQgaXRcblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cdFx0dGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXG5cdFx0aWYodGhpcy5wYXJhbXMubW9kZSA9PT0gXCJleGNsdWRlXCIpIHtcblx0XHRcdC8vIFdST05HICEhIVxuXHRcdFx0Ly8gV1JPTkcgISEhXG5cdFx0XHQvLyBETyBOT1RISU5HIEZPUiBOT1cgLi4uXG5cdFx0XHQvKlxuXHRcdFx0Zm9yKGxldCBpPTAsIGo9MDsgaTx0aGlzLnBhcmFtcy5pbmRleExpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gRE8gVEhFIElOVkVSU0UgISEhID0+IGxvb3Agb24gaW5wdXRGcmFtZVNpemUgKGFrYSBmcmFtZS5sZW5ndGgpIGFuZCB1c2UgaW5kZXhPZiAhXG5cdFx0XHRcdGlmKHRoaXMucGFyYW1zLmluZGV4TGlzdFtpXSA8IHRoaXMuaW5wdXRGcmFtZVNpemUpIHtcblx0XHRcdFx0XHR0aGlzLm91dEZyYW1lW2pdID0gMDsvL1xuXHRcdFx0XHRcdGorKztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ki9cblx0XHRcdGZvcihsZXQgaT0wOyBpPHRoaXMucGFyYW1zLmluZGV4TGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQvLyBmaWxsIHdpdGggbm9uLWV4Y2x1ZGVkIGluZGV4ZXNcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYodGhpcy5wYXJhbXMubW9kZSA9PT0gXCJpbmNsdWRlXCIpIHtcblx0XHRcdC8vIFJJR0hUICEhIVxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5wYXJhbXMuaW5kZXhMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHRoaXMub3V0RnJhbWVbaV0gPSAwOy8vXG5cdFx0XHRcdGkrKztcblx0XHRcdH1cblx0XHR9IGVsc2UgeyAvLyBwYXNzIGF2ZXJ5dGhpbmcgdGhyb3VnaFxuXHRcdFx0dGhpcy5vdXRGcmFtZS5zZXQoZnJhbWUsIDApO1xuXHRcdH1cblxuXHRcdHRoaXMub3V0cHV0KCk7XG5cdH1cblxufSIsImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuaW1wb3J0IHsgZ21tTGlrZWxpaG9vZHMgfSBmcm9tICcuL3htbS1kZWNvZGVyLWNvbW1vbidcblxuLy8gVE9ETyA6IGFkZCByZXNldCgpIGZ1bmN0aW9uIChlbXB0eSBsaWtlbGlob29kX2J1ZmZlcilcblxuLy89PT09PT09PT09PT09PT09PT09IFRIRSBFWFBPUlRFRCBDTEFTUyA9PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWG1tR21tRGVjb2RlciBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGxpa2VsaWhvb2RXaW5kb3c6IDUsXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubW9kZWxSZXN1bHRzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubGlrZWxpaG9vZFdpbmRvdyA9IHRoaXMucGFyYW1zLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0Ly8gb3JpZ2luYWwgeG1tIG1vZGVsUmVzdWx0cyBmaWVsZHMgOlxuXHRcdC8vIGluc3RhbnRMaWtlbGlob29kcywgaW5zdGFudE5vcm1hbGl6ZWRMaWtlbGlob29kcyxcblx0XHQvLyBzbW9vdGhlZExpa2VsaWhvb2RzLCBzbW9vdGhlZE5vcm1hbGl6ZWRMaWtlbGlob29kcyxcblx0XHQvLyBzbW9vdGhlZExvZ0xpa2VsaWhvb2RzLCBsaWtlbGllc3QsIG91dHB1dFZhbHVlcywgb3V0cHV0VmFyaWFuY2Vcblx0fVxuXG5cdGdldCBsaWtlbGllc3RMYWJlbCgpIHtcblx0XHRpZih0aGlzLm1vZGVsUmVzdWx0cyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsUmVzdWx0cy5saWtlbGllc3QgPiAtMSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5tb2RlbC5tb2RlbHNbdGhpcy5tb2RlbFJlc3VsdHMubGlrZWxpZXN0XS5sYWJlbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuICd1bmtub3duJztcblx0XHQvL3JldHVybignbm8gZXN0aW1hdGlvbiBhdmFpbGFibGUnKTtcblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cblx0XHQvL2luY29taW5nIGZyYW1lIGlzIG9ic2VydmF0aW9uIHZlY3RvclxuXHRcdGlmKHRoaXMubW9kZWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJubyBtb2RlbCBsb2FkZWRcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy50aW1lID0gdGltZTtcblx0XHR0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cblx0XHRjb25zdCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG5cblx0XHRnbW1MaWtlbGlob29kcyhmcmFtZSwgdGhpcy5tb2RlbCwgdGhpcy5tb2RlbFJlc3VsdHMpO1x0XHRcdFxuXHRcdC8vZ21tTGlrZWxpaG9vZHMoZnJhbWUsIHRoaXMubW9kZWwsIHRoaXMubW9kZWxSZXN1bHRzKTtcdFx0XHRcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRvdXRGcmFtZVtpXSA9IHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cdFx0fVxuXG5cdFx0dGhpcy5vdXRwdXQoKTtcblx0fVxuXG5cdHNldE1vZGVsKG1vZGVsKSB7XG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlc3QgaWYgbW9kZWwgaXMgdmFsaWQgaGVyZSAoVE9ETyA6IHdyaXRlIGEgYmV0dGVyIHRlc3QpXG5cdFx0aWYobW9kZWwubW9kZWxzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMubW9kZWwgPSBtb2RlbDtcblx0XHRcdGxldCBubW9kZWxzID0gbW9kZWwubW9kZWxzLmxlbmd0aDtcblx0XHRcdHRoaXMubW9kZWxSZXN1bHRzID0ge1xuXHRcdFx0XHRpbnN0YW50X2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX2xvZ19saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRpbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRsaWtlbGllc3Q6IC0xLFxuXHRcdFx0XHRzaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0czogW11cblx0XHRcdH07XG5cblx0XHRcdGZvcihsZXQgaT0wOyBpPG1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zbW9vdGhlZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXG5cdFx0XHRcdGxldCByZXMgPSB7fTtcblx0XHRcdFx0cmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5sb2dfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlciA9IFtdO1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoID0gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0XHRmb3IobGV0IGo9MDsgajx0aGlzLmxpa2VsaWhvb2RXaW5kb3c7IGorKykge1xuXHRcdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlcltqXSA9IDEgLyB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHMucHVzaChyZXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuaW5pdGlhbGl6ZSh7IGZyYW1lU2l6ZTogdGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoIH0pO1xuXHR9XG5cblx0c2V0TGlrZWxpaG9vZFdpbmRvdyhuZXdXaW5kb3dTaXplKSB7XG5cdFx0dGhpcy5saWtlbGlob29kV2luZG93ID0gbmV3V2luZG93U2l6ZTtcblx0XHRpZih0aGlzLm1vZGVsID09PSB1bmRlZmluZWQpIHJldHVybjtcblx0XHRsZXQgcmVzID0gdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NNb2RlbFJlc3VsdHM7XG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHJlc1tpXS5saWtlbGlob29kX2J1ZmZlciA9IFtdO1xuXHRcdFx0cmVzW2ldLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aCA9IHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdGZvcihsZXQgaj0wOyBqPHRoaXMubGlrZWxpaG9vZFdpbmRvdzsgaisrKSB7XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlcltqXSA9IDEgLyB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c2V0VmFyaWFuY2VPZmZzZXQoKSB7XG5cdFx0Ly8gbm90IHVzZWQgZm9yIG5vdyAobmVlZCB0byBpbXBsZW1lbnQgdXBkYXRlSW52ZXJzZUNvdmFyaWFuY2UgbWV0aG9kKVxuXHR9XG59O1xuIiwiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5pbXBvcnQge2dtbUxpa2VsaWhvb2QsXG5cdFx0aG1tVXBkYXRlQWxwaGFXaW5kb3csXG5cdFx0aG1tVXBkYXRlUmVzdWx0cyxcblx0XHRoaG1tTGlrZWxpaG9vZEFscGhhfSBmcm9tICcuL3htbS1kZWNvZGVyLWNvbW1vbic7XG5cbi8vIHNpbXBsaWZpZWQgZGVjb2RpbmcgYWxnb3JpdGhtIDpcbi8vXG4vLyBpZighZm9yd2FyZF9pbml0KVxuLy8gXHRcdGZvcndhcmRfaW5pdChvYnMpO1xuLy8gZWxzZVxuLy8gXHRcdGZvcndhcmRfdXBkYXRlKG9icyk7XG4vL1xuLy8gZm9yKG1vZGVsIGluIG1vZGVscylcbi8vIFx0XHRtb2RlbC51cGRhdGVBbHBoYVdpbmRvdygpO1xuLy8gXHRcdG1vZGVsLnVwZGF0ZVJlc3VsdHMoKTtcbi8vXG4vLyB1cGRhdGVSZXN1bHRzKCk7XG5cbi8vIEEgdXRpbGlzZXIgZGUgeG1tLWRlY29kZXItY29tbW9uIDpcbi8vIC0gZ2F1c3NpYW5Db21wb25lbnRMaWtlbGlob29kXG4vLyAtIGdtbUxpa2VsaWhvb2QgKHdoaWNoIHVzZXMgZ2F1c3NpYW5Db21wb25lbnRMaWtlbGlob29kKVxuLy8gLSBub3QgZ21tTGlrZWxpaG9vZHMsIGFzIGl0J3MgdGhlIGNsYXNzaWZ5aW5nIHBhcnQgb2YgR01NXG5cbi8vIFdoaWNoIGRlY29kZXIgcGFyYW1ldGVycyA/XG4vLyBzZXRMaWtlbGlob29kV2luZG93ID9cbi8vIG90aGVyIHNtb290aGluZyB3aW5kb3dzID9cbi8vIGV4aXQgcHJvYmFiaWxpdGllcyA/XG4vLyAuLi5cblxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWG1tSGhtbURlY29kZXIgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGxpa2VsaWhvb2RXaW5kb3c6IDUsXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubW9kZWxSZXN1bHRzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubGlrZWxpaG9vZFdpbmRvdyA9IHRoaXMucGFyYW1zLmxpa2VsaWhvb2RXaW5kb3c7XG5cdH1cblxuXHRnZXQgbGlrZWxpZXN0TGFiZWwoKSB7XG5cdFx0aWYodGhpcy5tb2RlbFJlc3VsdHMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYodGhpcy5tb2RlbFJlc3VsdHMubGlrZWxpZXN0ID4gLTEpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMubW9kZWwubW9kZWxzW3RoaXMubW9kZWxSZXN1bHRzLmxpa2VsaWVzdF0ubGFiZWw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiAndW5rbm93bic7XG5cdFx0Ly9yZXR1cm4oJ25vIGVzdGltYXRpb24gYXZhaWxhYmxlJyk7XG5cdH1cblxuXG5cdC8vPT09PT09PT09PT09PT09PSBwcm9jZXNzIGZyYW1lID09PT09PT09PT09PT09PT09Ly9cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXG5cdFx0Ly9pbmNvbWluZyBmcmFtZSBpcyBvYnNlcnZhdGlvbiB2ZWN0b3Jcblx0XHRpZih0aGlzLm1vZGVsID09PSB1bmRlZmluZWQgfHwgdGhpcy5tb2RlbFJlc3VsdHMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcIm5vIG1vZGVsIGxvYWRlZFwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuXHRcdHRoaXMudGltZSA9IHRpbWU7XG5cdFx0dGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXG5cdFx0Y29uc3Qgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lO1xuXG5cdFx0aWYodGhpcy5mb3J3YXJkX2luaXRpYWxpemVkKSB7XG5cdFx0XHR0aGlzLmZvcndhcmRVcGRhdGUoZnJhbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmZvcndhcmRJbml0KGZyYW1lKTtcblx0XHR9XG5cblx0XHQvLyBmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0cy5sZW5ndGg7IGkrKykge1xuXHRcdC8vIFx0XHRjb25zb2xlLmxvZyh0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXS5hbHBoYV9oWzBdWzBdKTtcblx0XHQvLyB9XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aG1tVXBkYXRlQWxwaGFXaW5kb3codGhpcy5tb2RlbC5tb2RlbHNbaV0sIHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldKTtcblx0XHRcdGhtbVVwZGF0ZVJlc3VsdHModGhpcy5tb2RlbC5tb2RlbHNbaV0sIHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldKTtcblx0XHR9XG5cblx0XHR0aGlzLnVwZGF0ZVJlc3VsdHMoKTtcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRvdXRGcmFtZVtpXSA9IHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cdFx0fVxuXG5cdFx0dGhpcy5vdXRwdXQoKTtcblx0fVxuXHRcdFxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09IGxvYWQgbW9kZWwgZnJvbSBqc29uID09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdFxuXHRzZXRNb2RlbChtb2RlbCkge1x0XHRcblxuXHRcdHRoaXMubW9kZWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5tb2RlbFJlc3VsdHMgPSB1bmRlZmluZWQ7XG5cblx0XHQvLyB0ZXN0IGlmIG1vZGVsIGlzIHZhbGlkIGhlcmUgKFRPRE8gOiB3cml0ZSBhIGJldHRlciB0ZXN0KVxuXHRcdGlmKG1vZGVsLm1vZGVscyAhPT0gdW5kZWZpbmVkKSB7XG5cblx0XHRcdGNvbnNvbGUubG9nKG1vZGVsKTtcblxuXHRcdFx0dGhpcy5tb2RlbCA9IG1vZGVsO1xuXHRcdFx0bGV0IG5tb2RlbHMgPSBtb2RlbC5tb2RlbHMubGVuZ3RoO1xuXG5cdFx0XHRsZXQgbnN0YXRlc0dsb2JhbCA9IG1vZGVsLmNvbmZpZ3VyYXRpb24uZGVmYXVsdF9wYXJhbWV0ZXJzLnN0YXRlcztcblx0XHRcdHRoaXMucGFyYW1zLmZyYW1lU2l6ZSA9IG5zdGF0ZXNHbG9iYWw7XG5cblx0XHRcdC8vIHRoaXMucHJpb3IgPSBuZXcgQXJyYXkobm1vZGVscyk7XG5cdFx0XHQvLyB0aGlzLmV4aXRfdHJhbnNpdGlvbiA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdC8vIHRoaXMudHJhbnNpdGlvbiA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdC8vIGZvcihsZXQgaT0wOyBpPG5tb2RlbHM7IGkrKykge1xuXHRcdFx0Ly8gXHR0aGlzLnRyYW5zaXRpb25baV0gPSBuZXcgQXJyYXkobm1vZGVscyk7XG5cdFx0XHQvLyB9XG5cdFx0XHR0aGlzLmZyb250aWVyX3YxID0gbmV3IEFycmF5KG5tb2RlbHMpO1xuXHRcdFx0dGhpcy5mcm9udGllcl92MiA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRcdFx0Ly90aGlzLnJlc3VsdHMgPSB7fTtcblxuXHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMgPSB7XG5cdFx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGxpa2VsaWVzdDogLTEsXG5cdFx0XHRcdHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8bm1vZGVsczsgaSsrKSB7XG5cblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuaW5zdGFudF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cblx0XHRcdFx0bGV0IG5zdGF0ZXMgPSB0aGlzLm1vZGVsLm1vZGVsc1tpXS5wYXJhbWV0ZXJzLnN0YXRlcztcblxuXHRcdFx0XHRsZXQgYWxwaGFfaCA9IG5ldyBBcnJheSgzKTtcblx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8MzsgaisrKSB7XG5cdFx0XHRcdFx0YWxwaGFfaFtqXSA9IG5ldyBBcnJheShuc3RhdGVzKTtcblx0XHRcdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRcdGFscGhhX2hbal1ba10gPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBobW1SZXMgPSB7XG5cdFx0XHRcdFx0aW5zdGFudF9saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdGxvZ19saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdGxpa2VsaWhvb2RfYnVmZmVyOiBbXSxcblx0XHRcdFx0XHRwcm9ncmVzczogMCxcblxuXHRcdFx0XHRcdC8vIG5ldmVyIHVzZWQgPyAtPiBjaGVjayB4bW0gY3BwXG5cdFx0XHRcdFx0ZXhpdF9saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdGV4aXRfcmF0aW86IDAsXG5cblx0XHRcdFx0XHRsaWtlbGllc3Rfc3RhdGU6IC0xLFxuXG5cdFx0XHRcdFx0Ly9hbHBoYTogbmV3IEFycmF5KG5zdGF0ZXMpLCBcdC8vIGZvciBub24taGllcmFyY2hpY2FsXG5cdFx0XHRcdFx0YWxwaGFfaDogYWxwaGFfaCxcdFx0XHRcdC8vIGZvciBoaWVyYXJjaGljYWxcblx0XHRcdFx0XHRwcmlvcjogbmV3IEFycmF5KG5zdGF0ZXMpLFxuXHRcdFx0XHRcdHRyYW5zaXRpb246IG5ldyBBcnJheShuc3RhdGVzKSxcblxuXHRcdFx0XHRcdC8vIHVzZWQgaW4gaG1tVXBkYXRlQWxwaGFXaW5kb3dcblx0XHRcdFx0XHR3aW5kb3dfbWluaW5kZXg6IDAsXG5cdFx0XHRcdFx0d2luZG93X21heGluZGV4OiAwLFxuXHRcdFx0XHRcdHdpbmRvd19ub3JtYWxpemF0aW9uX2NvbnN0YW50OiAwLFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzOiBbXVx0Ly8gc3RhdGVzXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Ly8gQUREIElORElWSURVQUwgU1RBVEVTIChHTU1zKVxuXHRcdFx0XHRmb3IobGV0IGo9MDsgajxuc3RhdGVzOyBqKyspIHtcblx0XHRcdFx0XHRsZXQgZ21tUmVzID0ge1xuXHRcdFx0XHRcdFx0aW5zdGFudF9saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdFx0Ly8gbG9nX2xpa2VsaWhvb2Q6IDAsXG5cdFx0XHRcdFx0XHQvLyBUT0RPIDogYWRkIHNhbWUgZmllbGRzIGFzIGluIEdtbURlY29kZXIgPz8/P1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRobW1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHMucHVzaChnbW1SZXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMucHVzaChobW1SZXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSh7IGZyYW1lU2l6ZTogdGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoIH0pO1xuXHRcdC8vY29uc29sZS5sb2codGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplKTtcblx0XHQvL2NvbnNvbGUubG9nKHRoaXMubW9kZWxSZXN1bHRzKTtcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PSBSRVNFVCA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdHJlc2V0KCkge1xuXHRcdHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHR9XG5cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT0gRk9SV0FSRCBJTklUID09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuXHRmb3J3YXJkSW5pdChvYnNlcnZhdGlvbikge1xuXHRcdGxldCBub3JtX2NvbnN0ID0gMDtcblx0XHQvL2xldCBtb2RlbEluZGV4ID0gMDtcblxuXHRcdC8vPT09PT09PT09PT09PT09PT0gSU5JVElBTElaRSBBTFBIQSBWQVJJQUJMRVMgPT09PT09PT09PT09PT09PT0vL1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdFx0bGV0IG0gPSB0aGlzLm1vZGVsLm1vZGVsc1tpXTtcblx0XHRcdGxldCBuc3RhdGVzID0gbS5wYXJhbWV0ZXJzLnN0YXRlcztcblx0XHRcdGxldCBtUmVzID0gdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV07XG5cblx0XHRcdGZvcihsZXQgaj0wOyBqPDM7IGorKykge1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbal0gPSBuZXcgQXJyYXkobnN0YXRlcyk7XG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdG1SZXMuYWxwaGFfaFtqXVtrXSA9IDA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYobS5wYXJhbWV0ZXJzLnRyYW5zaXRpb25fbW9kZSA9PSAwKSB7IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gZXJnb2RpY1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRtUmVzLmFscGhhX2hbMF1ba10gPSBtUmVzLnByaW9yW2tdICogZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbS5zdGF0ZXNba10sIG1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHNba10pOyAvLyBzZWUgaG93IG9ic1Byb2IgaXMgaW1wbGVtZW50ZWRcblx0XHRcdFx0XHRtUmVzLmluc3RhbnRfbGlrZWxpaG9vZCArPSBtUmVzLmFscGhhWzBdW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgeyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBsZWZ0LXJpZ2h0XG5cdFx0XHRcdG1SZXMuYWxwaGFfaFswXVswXSA9IHRoaXMubW9kZWwucHJpb3JbaV07XG5cdFx0XHRcdG1SZXMuYWxwaGFfaFswXVswXSAqPSBnbW1MaWtlbGlob29kKG9ic2VydmF0aW9uLCBtLnN0YXRlc1swXSwgbVJlcy5zaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0c1swXSk7XG5cdFx0XHRcdG1SZXMuaW5zdGFudF9saWtlbGlob29kID0gbVJlcy5hbHBoYV9oWzBdWzBdO1xuXHRcdFx0fVxuXHRcdFx0bm9ybV9jb25zdCArPSBtUmVzLmluc3RhbnRfbGlrZWxpaG9vZDtcblx0XHR9XG5cblx0XHQvLz09PT09PT09PT09PT09PT09PSBOT1JNQUxJWkUgQUxQSEEgVkFSSUFCTEVTID09PT09PT09PT09PT09PT09Ly9cblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGxldCBuc3RhdGVzID0gdGhpcy5tb2RlbC5tb2RlbHNbaV0ucGFyYW1ldGVycy5zdGF0ZXM7XG5cdFx0XHRmb3IobGV0IGU9MDsgZTwzOyBlKyspIHtcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFtlXVtrXSAvPSBub3JtX2NvbnN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5mb3J3YXJkX2luaXRpYWxpemVkID0gdHJ1ZTtcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT0gRk9SV0FSRCBVUERBVEUgPT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cblx0Zm9yd2FyZFVwZGF0ZShvYnNlcnZhdGlvbikge1xuXHRcdGxldCBub3JtX2NvbnN0ID0gMDtcblx0XHRsZXQgdG1wID0gMDtcblx0XHRsZXQgZnJvbnQ7IC8vIGFycmF5XG5cblx0XHRsZXQgbm1vZGVscyA9IHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDtcblx0XG5cdFx0aGhtbUxpa2VsaWhvb2RBbHBoYSgxLCB0aGlzLmZyb250aWVyX3YxLCB0aGlzLm1vZGVsLCB0aGlzLm1vZGVsUmVzdWx0cyk7XG5cdFx0aGhtbUxpa2VsaWhvb2RBbHBoYSgyLCB0aGlzLmZyb250aWVyX3YyLCB0aGlzLm1vZGVsLCB0aGlzLm1vZGVsUmVzdWx0cyk7XG5cblx0XHQvLyBsZXQgbnVtX2NsYXNzZXMgPSBcblx0XHQvLyBsZXQgZHN0TW9kZWxJbmRleCA9IDA7XG5cblx0XHRmb3IobGV0IGk9MDsgaTxubW9kZWxzOyBpKyspIHtcblxuXHRcdFx0bGV0IG0gPSB0aGlzLm1vZGVsLm1vZGVsc1tpXTtcblx0XHRcdGxldCBuc3RhdGVzID0gbS5wYXJhbWV0ZXJzLnN0YXRlcztcblx0XHRcdGxldCBtUmVzID0gdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV07XG5cdFx0XHRcblx0XHRcdC8vPT09PT09PT09PT09PSBDT01QVVRFIEZST05USUVSIFZBUklBQkxFID09PT09PT09PT09PS8vXG5cblx0XHRcdGZyb250ID0gbmV3IEFycmF5KG5zdGF0ZXMpO1xuXHRcdFx0Zm9yKGxldCBqPTA7IGo8bnN0YXRlczsgaisrKSB7XG5cdFx0XHRcdGZyb250W2pdID0gMDtcblx0XHRcdH1cblxuXHRcdFx0aWYobS5wYXJhbWV0ZXJzLnRyYW5zaXRpb25fbW9kZSA9PSAwKSB7IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gZXJnb2RpY1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRmb3IobGV0IGo9MDsgajxuc3RhdGVzOyBqKyspIHtcblx0XHRcdFx0XHRcdGZyb250W2tdICs9IG0udHJhbnNpdGlvbltqICogbnN0YXRlcyArIGtdIC9cblx0XHRcdFx0XHRcdFx0XHRcdCgxIC0gbS5leGl0UHJvYmFiaWxpdGllc1tqXSkgKlxuXHRcdFx0XHRcdFx0XHRcdFx0bVJlcy5hbHBoYV9oWzBdW2pdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRmb3IobGV0IHNyY2k9MDsgc3JjaTxubW9kZWxzOyBzcmNpKyspIHtcblx0XHRcdFx0XHRcdGZyb250W2tdICs9IG1SZXMucHJpb3Jba10gKlxuXHRcdFx0XHRcdFx0XHRcdFx0KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmZyb250aWVyX3YxW3NyY2ldICogdGhpcy5tb2RlbC50cmFuc2l0aW9uW3NyY2ldW2ldICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5tb2RlbC5wcmlvcltpXSAqIHRoaXMuZnJvbnRpZXJfdjJbc3JjaV1cblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgeyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vIGxlZnQtcmlnaHRcblxuXHRcdFx0XHQvLyBrID09IDAgOiBmaXJzdCBzdGF0ZSBvZiB0aGUgcHJpbWl0aXZlXG5cdFx0XHRcdGZyb250WzBdID0gbS50cmFuc2l0aW9uWzBdICogbVJlcy5hbHBoYV9oWzBdWzBdO1xuXG5cdFx0XHRcdGZvcihsZXQgc3JjaT0wOyBzcmNpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgc3JjaSsrKSB7XG5cdFx0XHRcdFx0ZnJvbnRbMF0gKz0gdGhpcy5mcm9udGllcl92MVtzcmNpXSAqIHRoaXMubW9kZWwudHJhbnNpdGlvbltzcmNpXVtpXSArXG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5tb2RlbC5wcmlvcltpXSAqIHRoaXMuZnJvbnRpZXJfdjJbc3JjaV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBrID4gMCA6IHJlc3Qgb2YgdGhlIHByaW1pdGl2ZVxuXHRcdFx0XHRmb3IobGV0IGs9MTsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRmcm9udFtrXSArPSBtLnRyYW5zaXRpb25bayAqIDJdIC9cblx0XHRcdFx0XHRcdFx0XHQoMSAtIG0uZXhpdFByb2JhYmlsaXRpZXNba10pICpcblx0XHRcdFx0XHRcdFx0XHRtUmVzLmFscGhhX2hbMF1ba107XG5cdFx0XHRcdFx0ZnJvbnRba10gKz0gbS50cmFuc2l0aW9uWyhrIC0gMSkgKiAyICsgMV0gL1xuXHRcdFx0XHRcdFx0XHRcdCgxIC0gbS5leGl0UHJvYmFiaWxpdGllc1trIC0gMV0pICpcblx0XHRcdFx0XHRcdFx0XHRtUmVzLmFscGhhX2hbMF1bayAtIDFdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8MzsgaisrKSB7XG5cdFx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0XHRtUmVzLmFscGhhX2hbal1ba10gPSAwO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL2NvbnNvbGUubG9nKGZyb250KTtcblxuXHRcdFx0Ly89PT09PT09PT09PT09PSBVUERBVEUgRk9SV0FSRCBWQVJJQUJMRSA9PT09PT09PT09PT09Ly9cblxuXHRcdFx0bVJlcy5leGl0X2xpa2VsaWhvb2QgPSAwO1xuXHRcdFx0bVJlcy5pbnN0YW50X2xpa2VsaWhvb2QgPSAwO1xuXG5cdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0dG1wID0gZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbS5zdGF0ZXNba10sIG1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHNba10pICogZnJvbnRba107XG5cblx0XHRcdFx0bVJlcy5hbHBoYV9oWzJdW2tdID0gdGhpcy5tb2RlbC5leGl0X3RyYW5zaXRpb25baV0gKiBtLmV4aXRQcm9iYWJpbGl0aWVzW2tdICogdG1wO1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbMV1ba10gPSAoMSAtIHRoaXMubW9kZWwuZXhpdF90cmFuc2l0aW9uW2ldKSAqIG0uZXhpdFByb2JhYmlsaXRpZXNba10gKiB0bXA7XG5cdFx0XHRcdG1SZXMuYWxwaGFfaFswXVtrXSA9ICgxIC0gbS5leGl0UHJvYmFiaWxpdGllc1trXSkgKiB0bXA7XG5cblx0XHRcdFx0bVJlcy5leGl0X2xpa2VsaWhvb2QgXHQrPSBtUmVzLmFscGhhX2hbMV1ba10gKyBtUmVzLmFscGhhX2hbMl1ba107XG5cdFx0XHRcdG1SZXMuaW5zdGFudF9saWtlbGlob29kICs9IG1SZXMuYWxwaGFfaFswXVtrXSArIG1SZXMuYWxwaGFfaFsxXVtrXSArIG1SZXMuYWxwaGFfaFsyXVtrXTtcblxuXHRcdFx0XHRub3JtX2NvbnN0ICs9IHRtcDtcblx0XHRcdH1cblxuXHRcdFx0bVJlcy5leGl0X3JhdGlvID0gbVJlcy5leGl0X2xpa2VsaWhvb2QgLyBtUmVzLmluc3RhbnRfbGlrZWxpaG9vZDtcblx0XHR9XG5cblx0XHQvLz09PT09PT09PT09PT09IE5PUk1BTElaRSBBTFBIQSBWQVJJQUJMRVMgPT09PT09PT09PT09PS8vXG5cblx0XHRmb3IobGV0IGk9MDsgaTxubW9kZWxzOyBpKyspIHtcblx0XHRcdGZvcihsZXQgZT0wOyBlPDM7IGUrKykge1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazx0aGlzLm1vZGVsLm1vZGVsc1tpXS5wYXJhbWV0ZXJzLnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFtlXVtrXSAvPSBub3JtX2NvbnN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly89PT09PT09PT09PT09PT09PT09PT09IFVQREFURSBSRVNVTFRTID09PT09PT09PT09PT09PT09PT09Ly9cblxuXHR1cGRhdGVSZXN1bHRzKCkge1xuXHRcdGxldCBtYXhsb2dfbGlrZWxpaG9vZCA9IDA7XG5cdFx0bGV0IG5vcm1jb25zdF9pbnN0YW50ID0gMDtcblx0XHRsZXQgbm9ybWNvbnN0X3Ntb290aGVkID0gMDtcblxuXHRcdGxldCByZXMgPSB0aGlzLm1vZGVsUmVzdWx0cztcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGxldCBobW1SZXMgPSByZXMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV07XG5cblx0XHRcdHJlcy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldIFx0XHQ9IGhtbVJlcy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0XHRyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID0gaG1tUmVzLmxvZ19saWtlbGlob29kO1xuXHRcdFx0cmVzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldIFx0PSBNYXRoLmV4cChyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldKTtcblxuXHRcdFx0cmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSBcdD0gcmVzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV07XG5cdFx0XHRyZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSBcdD0gcmVzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldO1xuXG5cdFx0XHRub3JtY29uc3RfaW5zdGFudCBcdCs9IHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cdFx0XHRub3JtY29uc3Rfc21vb3RoZWQgXHQrPSByZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblxuXHRcdFx0aWYoaT09MCB8fCByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID4gbWF4bG9nX2xpa2VsaWhvb2QpIHtcblx0XHRcdFx0bWF4bG9nX2xpa2VsaWhvb2QgPSByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldO1xuXHRcdFx0XHRyZXMubGlrZWxpZXN0ID0gaTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSBcdC89IG5vcm1jb25zdF9pbnN0YW50O1xuXHRcdFx0cmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gXHQvPSBub3JtY29uc3Rfc21vb3RoZWQ7XG5cdFx0fVxuXHR9XG59XG5cbi8qXG5cdHNldExpa2VsaWhvb2RXaW5kb3cobmV3V2luZG93U2l6ZSkge1xuXHRcdHRoaXMubGlrZWxpaG9vZFdpbmRvdyA9IG5ld1dpbmRvd1NpemU7XG5cdFx0aWYodGhpcy5tb2RlbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cdFx0bGV0IHJlcyA9IHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzO1xuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRyZXNbaV0ubGlrZWxpaG9vZF9idWZmZXIgPSBbXTtcblx0XHRcdHJlc1tpXS5saWtlbGlob29kX2J1ZmZlci5sZW5ndGggPSB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRmb3IobGV0IGo9MDsgajx0aGlzLmxpa2VsaWhvb2RXaW5kb3c7IGorKykge1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXJbal0gPSAxIC8gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNldFZhcmlhbmNlT2Zmc2V0KCkge1xuXHRcdC8vIG5vdCB1c2VkIGZvciBub3cgKG5lZWQgdG8gaW1wbGVtZW50IHVwZGF0ZUludmVyc2VDb3ZhcmlhbmNlIG1ldGhvZCkuXG5cdFx0Ly8gbm93IGFjY2Vzc2libGUgYXMgdHJhaW5pbmcgcGFyYW1ldGVyIG9mIHRoZSBjaGlsZCBwcm9jZXNzLlxuXHR9XG5cbi8vKi9cbiIsIi8qXG4gKlx0eG1tIGRlY29kZXJcbiAqXHRqcyBwb3J0IG9mIHRoZSBkZWNvZGluZyBwYXJ0IG9mIFhNTVxuICpcdGFsbG93cyB0byBmaWx0ZXIgaW5wdXQgZGF0YSBmcm9tIHRyYWluZWQgbW9kZWxzXG4gKiBcdHRoZSB0cmFpbmluZyBoZXMgdG8gYmUgZG9uZSB3aXRoIHRoZSBYTU0gQysrIGxpYnJhcnlcbiAqL1xuXG5cbi8vIE5PVEUgOiB0aGUgbW9kZWxzIGFuZCBtb2RlbFJlc3VsdHMgbXVzdCBmb2xsb3cgYSBwcmVjaXNlIGRvY3VtZW50IHN0cnVjdHVyZSA6XG4vLyBcdC0gXHRtb2RlbHMgc2hvdWxkIHdvcmsgYXMgZXhwb3J0ZWQgYnkgWE1NIChKU09OKVxuLy9cdC0gXHRtb2RlbFJlc3VsdHMgcmVwbGFjZSB0aGUgdmFyaWFibGVzIHRoYXQgbm9ybWFsbHkgZXhpc3QgaW4gdGhlIGNwcCBjbGFzc2VzLCB3aGljaCBhcmUgbmVlZGVkIGZvciB0aGUgZGVjb2RpbmcuXG4vL1x0XHRtb2RlbFJlc3VsdHMgKGluIHRoZSBjYXNlIG9mIEhNTXMpLCBjb250YWlucyB0aGUgYXJyYXkgc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMsIGVhY2ggZWxlbWVudCBvZiB3aGljaFxuLy9cdFx0Y29udGFpbnMgYW4gYXJyYXkgb2Ygc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHMgKHRoZSBITU0gc3RhdGVzKS5cbi8vXHRcdHNlZSB0aGUgZGVjb2RlciBsZm9wcyBmb3IgaW1wbGVtZW50YXRpb24uXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgICBhcyBpbiB4bW1IbW1TaW5nbGVDbGFzcy5jcHAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgY29uc3QgaG1tVXBkYXRlQWxwaGFXaW5kb3cgPSAoc2luZ2xlQ2xhc3NIbW1Nb2RlbCwgc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMpID0+IHtcblx0bGV0IG0gPSBzaW5nbGVDbGFzc0htbU1vZGVsO1xuXHRsZXQgcmVzID0gc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHM7XG5cblx0bGV0IG5zdGF0ZXMgPSBtLnBhcmFtZXRlcnMuc3RhdGVzO1xuXHRcblx0cmVzLmxpa2VsaWVzdF9zdGF0ZSA9IDA7XG5cdGxldCBiZXN0X2FscGhhID0gcmVzLmFscGhhX2hbMF1bMF0gKyByZXMuYWxwaGFfaFsxXVswXTtcblx0Zm9yKGxldCBpPTE7IGk8bnN0YXRlczsgaSsrKSB7XG5cdFx0aWYoKHJlcy5hbHBoYV9oWzBdW2ldICsgcmVzLmFscGhhX2hbMV1baV0pID4gYmVzdF9hbHBoYSkge1xuXHRcdFx0YmVzdF9hbHBoYSA9IHJlcy5hbHBoYV9oWzBdW2ldICsgcmVzLmFscGhhX2hbMV1baV07XG5cdFx0XHRyZXMubGlrZWxpZXN0X3N0YXRlID0gaTtcblx0XHR9XG5cdH1cblxuXHRyZXMud2luZG93X21pbmluZGV4ID0gcmVzLmxpa2VsaWVzdF9zdGF0ZSAtIG5zdGF0ZXMgLyAyO1xuXHRyZXMud2luZG93X21heGluZGV4ID0gcmVzLmxpa2VsaWVzdF9zdGF0ZSArIG5zdGF0ZXMgLyAyO1xuXHRyZXMud2luZG93X21pbmluZGV4ID0gcmVzLndpbmRvd19taW5pbmRleCA+PSAwID8gcmVzLndpbmRvd19taW5pbmRleCA6IDA7XG5cdHJlcy53aW5kb3dfbWF4aW5kZXggPSByZXMud2luZG93X21heGluZGV4IDw9IG5zdGF0ZXMgPyByZXMud2luZG93X21heGluZGV4IDogbnN0YXRlcztcblx0cmVzLndpbmRvd19ub3JtYWxpemF0aW9uX2NvbnN0YW50ID0gMDtcblx0Zm9yKGxldCBpPXJlcy53aW5kb3dfbWluaW5kZXg7IGk8cmVzLndpbmRvd19tYXhpbmRleDsgaSsrKSB7XG5cdFx0cmVzLndpbmRvd19ub3JtYWxpemF0aW9uX2NvbnN0YW50ICs9IChyZXMuYWxwaGFfaFswXVtpXSArIHJlcy5hbHBoYV9oWzFdW2ldKTtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgaG1tVXBkYXRlUmVzdWx0cyA9IChzaW5nbGVDbGFzc0htbU1vZGVsLCBzaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0cykgPT4ge1xuXHRsZXQgbSA9IHNpbmdsZUNsYXNzSG1tTW9kZWw7XG5cdGxldCByZXMgPSBzaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0cztcblxuXHQvLyBJUyBUSElTIENPUlJFQ1QgID8gQ0hFQ0sgIVxuXHRyZXMubGlrZWxpaG9vZF9idWZmZXIucHVzaChNYXRoLmxvZyhyZXMuaW5zdGFudF9saWtlbGlob29kKSk7XG5cdHJlcy5sb2dfbGlrZWxpaG9vZCA9IDA7XG5cdGxldCBidWZTaXplID0gcmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aDtcblx0Zm9yKGxldCBpPTA7IGk8YnVmU2l6ZTsgaSsrKSB7XG5cdFx0cmVzLmxvZ19saWtlbGlob29kICs9IHJlcy5saWtlbGlob29kX2J1ZmZlcltpXTtcblx0fVxuXHRyZXMubG9nX2xpa2VsaWhvb2QgLz0gYnVmU2l6ZTtcblxuXHRyZXMucHJvZ3Jlc3MgPSAwO1xuXHRmb3IobGV0IGk9cmVzLndpbmRvd19taW5pbmRleDsgaTxyZXMud2luZG93X21heGluZGV4OyBpKyspIHtcblx0XHRyZXMucHJvZ3Jlc3MgKz0gKHJlcy5hbHBoYV9oWzBdW2ldICsgcmVzLmFscGhhX2hbMV1baV0gKyByZXMuYWxwaGFfaFsyXVtpXSkgKiBpIC9cblx0XHRcdFx0XHRcdHJlcy53aW5kb3dfbm9ybWFsaXphdGlvbl9jb25zdGFudDtcblx0fVxuXHRyZXMucHJvZ3Jlc3MgLz0gKG0ucGFyYW1ldGVycy5zdGF0ZXMgLSAxKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgIGFzIGluIHhtbUhpZXJhcmNoaWNhbEhtbS5jcHAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgY29uc3QgaGhtbUxpa2VsaWhvb2RBbHBoYSA9IChleGl0TnVtLCBsaWtlbGlob29kVmVjdG9yLCBoaG1tTW9kZWwsIGhobW1Nb2RlbFJlc3VsdHMpID0+IHtcblx0bGV0IG0gPSBoaG1tTW9kZWw7XG5cdGxldCByZXMgPSBoaG1tTW9kZWxSZXN1bHRzO1xuXG5cdGlmKGV4aXROdW0gPCAwKSB7XG5cdFx0Ly9sZXQgbCA9IDA7XG5cdFx0Zm9yKGxldCBpPTA7IGk8bS5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxpa2VsaWhvb2RWZWN0b3JbaV0gPSAwO1xuXHRcdFx0Zm9yKGxldCBleGl0PTA7IGV4aXQ8MzsgZXhpdCsrKSB7XG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPG0ubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRsaWtlbGlob29kVmVjdG9yW2ldICs9IHJlcy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXS5hbHBoYV9oW2V4aXRdW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvcihsZXQgaT0wOyBpPG0ubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsaWtlbGlob29kVmVjdG9yW2ldID0gMDtcblx0XHRcdGZvcihsZXQgaz0wOyBrPG0ubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0bGlrZWxpaG9vZFZlY3RvcltpXSArPSByZXMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFtleGl0TnVtXVtrXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbi8vIGdldCB0aGUgaW52ZXJzZV9jb3ZhcmlhbmNlcyBtYXRyaXggb2YgZWFjaCBvZiB0aGUgR01NIGNsYXNzZXNcbi8vIGZvciBlYWNoIGlucHV0IGRhdGEsIGNvbXB1dGUgdGhlIGRpc3RhbmNlIG9mIHRoZSBmcmFtZSB0byBlYWNoIG9mIHRoZSBHTU1zXG4vLyB3aXRoIHRoZSBmb2xsb3dpbmcgZXF1YXRpb25zIDpcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyBhcyBpbiB4bW1HYXVzc2lhbkRpc3RyaWJ1dGlvbi5jcHAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgY29uc3QgZ2F1c3NpYW5Db21wb25lbnRMaWtlbGlob29kID0gKG9ic2VydmF0aW9uLCBnYXVzc2lhbkNvbXBvbmVudCkgPT4ge1xuXHRsZXQgY29tcG9uZW50ID0gZ2F1c3NpYW5Db21wb25lbnQ7XG5cdGxldCBldWNsaWRpYW5EaXN0YW5jZSA9IDAuMDtcblx0Zm9yKGxldCBsID0gMDsgbCA8IGNvbXBvbmVudC5kaW1lbnNpb247IGwrKykge1xuXHRcdGxldCB0bXAgPSAwLjA7XG5cdFx0Zm9yKGxldCBrPSAwOyBrIDwgY29tcG9uZW50LmRpbWVuc2lvbjsgaysrKSB7XG5cdFx0XHR0bXAgKz0gY29tcG9uZW50LmludmVyc2VfY292YXJpYW5jZVtsICogY29tcG9uZW50LmRpbWVuc2lvbiArIGtdICogKG9ic2VydmF0aW9uW2tdIC0gY29tcG9uZW50Lm1lYW5ba10pO1xuXHRcdH1cblx0XHRldWNsaWRpYW5EaXN0YW5jZSArPSAob2JzZXJ2YXRpb25bbF0gLSBjb21wb25lbnQubWVhbltsXSkgKiB0bXA7XG5cdH1cblx0bGV0IHAgPSBNYXRoLmV4cCgtMC41ICogZXVjbGlkaWFuRGlzdGFuY2UpIC8gTWF0aC5zcXJ0KGNvbXBvbmVudC5jb3ZhcmlhbmNlX2RldGVybWluYW50ICogTWF0aC5wb3coMiAqIE1hdGguUEksIGNvbXBvbmVudC5kaW1lbnNpb24pKTtcblxuXHRpZiggcCA8IDFlLTE4MCB8fCBpc05hTihwKSB8fCBpc05hTihNYXRoLmFicyhwKSkpIHtcblx0XHRwID0gMWUtMTgwO1xuXHR9XG5cdHJldHVybiBwO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgICBhcyBpbiB4bW1HbW1TaW5nbGVDbGFzcy5jcHAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG4vLyAtPiBpbiBvYnNQcm9iLCBjYWxsZWQgZnJvbSBsaWtlbGlob29kLCBjYWxsZWQgZnJvbSBmaWx0ZXIsIGNhbGxlZCBmcm9tIEdNTTo6ZmlsdGVyXG4vLyBUT0RPIDogZGVjb21wb3NlIGluIGEgc2ltaWxhciB3YXkgdG8gWE1NIGNwcCB0byBiZSBhYmxlIHRvIHVzZSBvYnNQcm9iXG5cbmV4cG9ydCBjb25zdCBnbW1MaWtlbGlob29kID0gKG9ic2VydmF0aW9uLCBzaW5nbGVDbGFzc0dtbU1vZGVsLCBzaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0cyA9IHt9KSA9PiB7XG5cdGxldCBjb2VmZnMgPSBzaW5nbGVDbGFzc0dtbU1vZGVsLm1peHR1cmVfY29lZmZzO1xuXHQvL2NvbnNvbGUubG9nKGNvZWZmcyk7XG5cdC8vaWYoY29lZmZzID09PSB1bmRlZmluZWQpIGNvZWZmcyA9IFsxXTtcblx0bGV0IGNvbXBvbmVudHMgPSBzaW5nbGVDbGFzc0dtbU1vZGVsLmNvbXBvbmVudHM7XG5cdC8vbGV0IHJlcyA9IHNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzO1xuXHRsZXQgcCA9IDA7XG5cblx0Zm9yKGxldCBjID0gMDsgYyA8IGNvZWZmcy5sZW5ndGg7IGMrKykge1xuXHRcdHAgKz0gY29lZmZzW2NdICogZ2F1c3NpYW5Db21wb25lbnRMaWtlbGlob29kKG9ic2VydmF0aW9uLCBjb21wb25lbnRzW2NdKTtcblx0fVxuXG5cdC8vcmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IHA7XG5cblx0Ly8gYXMgaW4geG1tR21tU2luZ2xlQ2xhc3M6OnVwZGF0ZVJlc3VsdHMoKSA6XG5cdC8vID0+IG1vdmVkIHRvIGdtbUxpa2VsaWhvb2RzKCkgc28gdGhhdCB0aGlzIGZ1bmN0aW9uIGxvb2tzIG1vcmUgbGlrZSBvYnNQcm9iXG5cdC8qXG5cdHJlcy5saWtlbGlob29kX2J1ZmZlci51bnNoaWZ0KHApO1xuXHRyZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoLS07XG5cdHJlcy5sb2dfbGlrZWxpaG9vZCA9IHJlcy5saWtlbGlob29kX2J1ZmZlci5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKTsgLy8gc3VtIG9mIGFsbCBhcnJheSB2YWx1ZXNcblx0cmVzLmxvZ19saWtlbGlob29kIC89IHJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGg7XG5cdC8vKi9cblxuXHRyZXR1cm4gcDtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gICAgICAgICAgYXMgaW4geG1tR21tLmNwcCAgICAgICAgIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGNvbnN0IGdtbUxpa2VsaWhvb2RzID0gKG9ic2VydmF0aW9uLCBnbW1Nb2RlbCwgZ21tTW9kZWxSZXN1bHRzKSA9PiB7XG5cdGxldCBsaWtlbGlob29kcyA9IFtdO1xuXHRsZXQgbW9kZWxzID0gZ21tTW9kZWwubW9kZWxzO1xuXHRsZXQgcmVzID0gZ21tTW9kZWxSZXN1bHRzO1xuXG5cdGxldCBtYXhMb2dMaWtlbGlob29kID0gMDtcblx0bGV0IG5vcm1Db25zdEluc3RhbnQgPSAwO1xuXHRsZXQgbm9ybUNvbnN0U21vb3RoZWQgPSAwO1xuXG5cdGZvcihsZXQgaT0wOyBpPG1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0bGV0IHNpbmdsZVJlcyA9IHJlcy5zaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0c1tpXTtcblx0XHRzaW5nbGVSZXMuaW5zdGFudF9saWtlbGlob29kID0gZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbW9kZWxzW2ldLCBzaW5nbGVSZXMpO1xuXG5cdFx0Ly8gYXMgaW4geG1tR21tU2luZ2xlQ2xhc3M6OnVwZGF0ZVJlc3VsdHMoKSAobW92ZWQgZnJvbSBnbW1MaWtlbGlob29kKSA6XG5cdFx0c2luZ2xlUmVzLmxpa2VsaWhvb2RfYnVmZmVyLnVuc2hpZnQoc2luZ2xlUmVzLmluc3RhbnRfbGlrZWxpaG9vZCk7XG5cdFx0c2luZ2xlUmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aC0tO1xuXHRcdHNpbmdsZVJlcy5sb2dfbGlrZWxpaG9vZCA9IHNpbmdsZVJlcy5saWtlbGlob29kX2J1ZmZlci5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKTsgLy8gc3VtIG9mIGFsbCBhcnJheSB2YWx1ZXNcblx0XHRzaW5nbGVSZXMubG9nX2xpa2VsaWhvb2QgLz0gc2luZ2xlUmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aDtcblxuXHRcdHJlcy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldID0gc2luZ2xlUmVzLmluc3RhbnRfbGlrZWxpaG9vZDtcblx0XHRyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID0gc2luZ2xlUmVzLmxvZ19saWtlbGlob29kO1xuXHRcdHJlcy5zbW9vdGhlZF9saWtlbGlob29kc1tpXSA9IE1hdGguZXhwKHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0pO1xuXHRcdHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSByZXMuaW5zdGFudF9saWtlbGlob29kc1tpXTtcblx0XHRyZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IHJlcy5zbW9vdGhlZF9saWtlbGlob29kc1tpXTtcblxuXHRcdG5vcm1Db25zdEluc3RhbnQgKz0gcmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblx0XHRub3JtQ29uc3RTbW9vdGhlZCArPSByZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblxuXHRcdGlmKGkgPT0gMCB8fCByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID4gbWF4TG9nTGlrZWxpaG9vZCkge1xuXHRcdFx0bWF4TG9nTGlrZWxpaG9vZCA9IHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV07XG5cdFx0XHRyZXMubGlrZWxpZXN0ID0gaTtcblx0XHR9XG5cdH1cblxuXHRmb3IobGV0IGk9MDsgaTxtb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gLz0gbm9ybUNvbnN0SW5zdGFudDtcblx0XHRyZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSAvPSBub3JtQ29uc3RTbW9vdGhlZDtcblx0fVxufTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuLy8gRE8gV0UgUkVBTExZIE5FRUQgVEhJUyA/XG5cbi8qXG5jbGFzcyBYbW1TaW5nbGVDbGFzc0dtbSB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0bGlrZWxpaG9vZFdpbmRvdzogNSxcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMubW9kZWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5yZXN1bHRzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubGlrZWxpaG9vZFdpbmRvdyA9IHRoaXMucGFyYW1zLmxpa2VsaWhvb2RXaW5kb3c7XG5cdH1cblxuXHRzZXRNb2RlbChtb2RlbCkge1xuXHRcdHRoaXMubW9kZWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5yZXN1bHRzID0gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdGVzdCBpZiBtb2RlbCBpcyB2YWxpZCBoZXJlIChUT0RPIDogd3JpdGUgYSBiZXR0ZXIgdGVzdClcblx0XHRpZihtb2RlbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLm1vZGVsID0gbW9kZWw7XG5cdFx0XHRsZXQgbm1vZGVscyA9IG1vZGVsLm1vZGVscy5sZW5ndGg7XG5cdFx0XHR0aGlzLnJlc3VsdHMgPSB7XG5cdFx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZDogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRsb2dfbGlrZWxpaG9vZDogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRsaWtlbGlob29kX2J1ZmZlcjogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRpbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRsaWtlbGllc3Q6IC0xLFxuXHRcdFx0XHRzaW5nbGVDbGFzc01vZGVsUmVzdWx0czogW11cblx0XHRcdH07XG5cblx0XHRcdGZvcihsZXQgaT0wOyBpPG5tb2RlbHM7IGkrKykge1xuXG5cdFx0XHRcdHRoaXMucmVzdWx0cy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5zbW9vdGhlZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cblx0XHRcdFx0bGV0IHJlcyA9IHt9O1xuXHRcdFx0XHRyZXMuaW5zdGFudF9saWtlbGlob29kID0gMDtcblx0XHRcdFx0cmVzLmxvZ19saWtlbGlob29kID0gMDtcblx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyID0gW107XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGggPSB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRcdGZvcihsZXQgaj0wOyBqPHRoaXMubGlrZWxpaG9vZFdpbmRvdzsgaisrKSB7XG5cdFx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyW2pdID0gMSAvIHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnJlc3VsdHMuc2luZ2xlQ2xhc3NNb2RlbFJlc3VsdHMucHVzaChyZXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuaW5pdGlhbGl6ZSh7IGZyYW1lU2l6ZTogdGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoIH0pO1xuXHR9XG5cblx0bGlrZWxpaG9vZChvYnNlcnZhdGlvbikge1xuXG5cdH1cblxuXHQvLyBldGMgLi4uXG59XG5cbmNsYXNzIFhtbVNpbmdsZUNsYXNzSG1tIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0dGhpcy5hbHBoYV9oID0gbmV3IEFycmF5KDMpO1xuXHRcdGZvcihsZXQgaT0wOyBpPDM7IGkrKykge1xuXHRcdFx0YWxwaGFfaFtpXSA9IFtdO1xuXHRcdH1cblxuXHRcdHRoaXMucHJpb3IgPSBbXTtcblx0XHR0aGlzLnN0YXRlcyA9IFtdOyAvLyB0aGVzZSBhcmUgWG1tU2luZ2xlQ2xhc3NHbW0nc1xuXG5cdFx0dGhpcy5yZXN1bHRzID0ge1xuXHRcdFx0aW5zdGFudF9saWtlbGlob29kOiAwXG5cdFx0fTtcblxuXHRcdHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRcdC8vdGhpcy5wcmV2aW91c19hbHBoYSA9IFxuXHR9XG5cblx0Ly8gRVRDXG59XG5cbiovXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IChmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuXG4gICAgICBfT2JqZWN0JGRlZmluZVByb3BlcnR5KHRhcmdldCwgZGVzY3JpcHRvci5rZXksIGRlc2NyaXB0b3IpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIHByb3RvUHJvcHMsIHN0YXRpY1Byb3BzKSB7XG4gICAgaWYgKHByb3RvUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IucHJvdG90eXBlLCBwcm90b1Byb3BzKTtcbiAgICBpZiAoc3RhdGljUHJvcHMpIGRlZmluZVByb3BlcnRpZXMoQ29uc3RydWN0b3IsIHN0YXRpY1Byb3BzKTtcbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH07XG59KSgpO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgX09iamVjdCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3JcIilbXCJkZWZhdWx0XCJdO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIGdldChfeCwgX3gyLCBfeDMpIHtcbiAgdmFyIF9hZ2FpbiA9IHRydWU7XG5cbiAgX2Z1bmN0aW9uOiB3aGlsZSAoX2FnYWluKSB7XG4gICAgdmFyIG9iamVjdCA9IF94LFxuICAgICAgICBwcm9wZXJ0eSA9IF94MixcbiAgICAgICAgcmVjZWl2ZXIgPSBfeDM7XG4gICAgX2FnYWluID0gZmFsc2U7XG4gICAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gICAgdmFyIGRlc2MgPSBfT2JqZWN0JGdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHByb3BlcnR5KTtcblxuICAgIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBwYXJlbnQgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqZWN0KTtcblxuICAgICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgX3ggPSBwYXJlbnQ7XG4gICAgICAgIF94MiA9IHByb3BlcnR5O1xuICAgICAgICBfeDMgPSByZWNlaXZlcjtcbiAgICAgICAgX2FnYWluID0gdHJ1ZTtcbiAgICAgICAgZGVzYyA9IHBhcmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgY29udGludWUgX2Z1bmN0aW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICAgIHJldHVybiBkZXNjLnZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICAgIGlmIChnZXR0ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZ2V0dGVyLmNhbGwocmVjZWl2ZXIpO1xuICAgIH1cbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkY3JlYXRlID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvY3JlYXRlXCIpW1wiZGVmYXVsdFwiXTtcblxudmFyIF9PYmplY3Qkc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgdHlwZW9mIHN1cGVyQ2xhc3MpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gX09iamVjdCRjcmVhdGUoc3VwZXJDbGFzcyAmJiBzdXBlckNsYXNzLnByb3RvdHlwZSwge1xuICAgIGNvbnN0cnVjdG9yOiB7XG4gICAgICB2YWx1ZTogc3ViQ2xhc3MsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfVxuICB9KTtcbiAgaWYgKHN1cGVyQ2xhc3MpIF9PYmplY3Qkc2V0UHJvdG90eXBlT2YgPyBfT2JqZWN0JHNldFByb3RvdHlwZU9mKHN1YkNsYXNzLCBzdXBlckNsYXNzKSA6IHN1YkNsYXNzLl9fcHJvdG9fXyA9IHN1cGVyQ2xhc3M7XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtcbiAgICBcImRlZmF1bHRcIjogb2JqXG4gIH07XG59O1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgaWYgKG9iaiAmJiBvYmouX19lc01vZHVsZSkge1xuICAgIHJldHVybiBvYmo7XG4gIH0gZWxzZSB7XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuXG4gICAgaWYgKG9iaiAhPSBudWxsKSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSBuZXdPYmpba2V5XSA9IG9ialtrZXldO1xuICAgICAgfVxuICAgIH1cblxuICAgIG5ld09ialtcImRlZmF1bHRcIl0gPSBvYmo7XG4gICAgcmV0dXJuIG5ld09iajtcbiAgfVxufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJ2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXHR2YXIgUExVU19VUkxfU0FGRSA9ICctJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSF9VUkxfU0FGRSA9ICdfJy5jaGFyQ29kZUF0KDApXG5cblx0ZnVuY3Rpb24gZGVjb2RlIChlbHQpIHtcblx0XHR2YXIgY29kZSA9IGVsdC5jaGFyQ29kZUF0KDApXG5cdFx0aWYgKGNvZGUgPT09IFBMVVMgfHxcblx0XHQgICAgY29kZSA9PT0gUExVU19VUkxfU0FGRSlcblx0XHRcdHJldHVybiA2MiAvLyAnKydcblx0XHRpZiAoY29kZSA9PT0gU0xBU0ggfHxcblx0XHQgICAgY29kZSA9PT0gU0xBU0hfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjMgLy8gJy8nXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIpXG5cdFx0XHRyZXR1cm4gLTEgLy9ubyBtYXRjaFxuXHRcdGlmIChjb2RlIDwgTlVNQkVSICsgMTApXG5cdFx0XHRyZXR1cm4gY29kZSAtIE5VTUJFUiArIDI2ICsgMjZcblx0XHRpZiAoY29kZSA8IFVQUEVSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIFVQUEVSXG5cdFx0aWYgKGNvZGUgPCBMT1dFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBMT1dFUiArIDI2XG5cdH1cblxuXHRmdW5jdGlvbiBiNjRUb0J5dGVBcnJheSAoYjY0KSB7XG5cdFx0dmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcblxuXHRcdGlmIChiNjQubGVuZ3RoICUgNCA+IDApIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG5cdFx0fVxuXG5cdFx0Ly8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcblx0XHQvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG5cdFx0Ly8gcmVwcmVzZW50IG9uZSBieXRlXG5cdFx0Ly8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG5cdFx0Ly8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuXHRcdHZhciBsZW4gPSBiNjQubGVuZ3RoXG5cdFx0cGxhY2VIb2xkZXJzID0gJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDIpID8gMiA6ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAxKSA/IDEgOiAwXG5cblx0XHQvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcblx0XHRhcnIgPSBuZXcgQXJyKGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuXHRcdC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcblx0XHRsID0gcGxhY2VIb2xkZXJzID4gMCA/IGI2NC5sZW5ndGggLSA0IDogYjY0Lmxlbmd0aFxuXG5cdFx0dmFyIEwgPSAwXG5cblx0XHRmdW5jdGlvbiBwdXNoICh2KSB7XG5cdFx0XHRhcnJbTCsrXSA9IHZcblx0XHR9XG5cblx0XHRmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDE4KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDEyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpIDw8IDYpIHwgZGVjb2RlKGI2NC5jaGFyQXQoaSArIDMpKVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwMDApID4+IDE2KVxuXHRcdFx0cHVzaCgodG1wICYgMHhGRjAwKSA+PiA4KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA+PiA0KVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDEwKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpIDw8IDQpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPj4gMilcblx0XHRcdHB1c2goKHRtcCA+PiA4KSAmIDB4RkYpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGFyclxuXHR9XG5cblx0ZnVuY3Rpb24gdWludDhUb0Jhc2U2NCAodWludDgpIHtcblx0XHR2YXIgaSxcblx0XHRcdGV4dHJhQnl0ZXMgPSB1aW50OC5sZW5ndGggJSAzLCAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuXHRcdFx0b3V0cHV0ID0gXCJcIixcblx0XHRcdHRlbXAsIGxlbmd0aFxuXG5cdFx0ZnVuY3Rpb24gZW5jb2RlIChudW0pIHtcblx0XHRcdHJldHVybiBsb29rdXAuY2hhckF0KG51bSlcblx0XHR9XG5cblx0XHRmdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuXHRcdFx0cmV0dXJuIGVuY29kZShudW0gPj4gMTggJiAweDNGKSArIGVuY29kZShudW0gPj4gMTIgJiAweDNGKSArIGVuY29kZShudW0gPj4gNiAmIDB4M0YpICsgZW5jb2RlKG51bSAmIDB4M0YpXG5cdFx0fVxuXG5cdFx0Ly8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuXHRcdGZvciAoaSA9IDAsIGxlbmd0aCA9IHVpbnQ4Lmxlbmd0aCAtIGV4dHJhQnl0ZXM7IGkgPCBsZW5ndGg7IGkgKz0gMykge1xuXHRcdFx0dGVtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcblx0XHRcdG91dHB1dCArPSB0cmlwbGV0VG9CYXNlNjQodGVtcClcblx0XHR9XG5cblx0XHQvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG5cdFx0c3dpdGNoIChleHRyYUJ5dGVzKSB7XG5cdFx0XHRjYXNlIDE6XG5cdFx0XHRcdHRlbXAgPSB1aW50OFt1aW50OC5sZW5ndGggLSAxXVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPT0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIDI6XG5cdFx0XHRcdHRlbXAgPSAodWludDhbdWludDgubGVuZ3RoIC0gMl0gPDwgOCkgKyAodWludDhbdWludDgubGVuZ3RoIC0gMV0pXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAxMClcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA+PiA0KSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgMikgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz0nXG5cdFx0XHRcdGJyZWFrXG5cdFx0fVxuXG5cdFx0cmV0dXJuIG91dHB1dFxuXHR9XG5cblx0ZXhwb3J0cy50b0J5dGVBcnJheSA9IGI2NFRvQnl0ZUFycmF5XG5cdGV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IHVpbnQ4VG9CYXNlNjRcbn0odHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnID8gKHRoaXMuYmFzZTY0anMgPSB7fSkgOiBleHBvcnRzKSlcbiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJ2lzYXJyYXknKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxudmFyIHJvb3RQYXJlbnQgPSB7fVxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBEdWUgdG8gdmFyaW91cyBicm93c2VyIGJ1Z3MsIHNvbWV0aW1lcyB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uIHdpbGwgYmUgdXNlZCBldmVuXG4gKiB3aGVuIHRoZSBicm93c2VyIHN1cHBvcnRzIHR5cGVkIGFycmF5cy5cbiAqXG4gKiBOb3RlOlxuICpcbiAqICAgLSBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsXG4gKiAgICAgU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzguXG4gKlxuICogICAtIFNhZmFyaSA1LTcgbGFja3Mgc3VwcG9ydCBmb3IgY2hhbmdpbmcgdGhlIGBPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yYCBwcm9wZXJ0eVxuICogICAgIG9uIG9iamVjdHMuXG4gKlxuICogICAtIENocm9tZSA5LTEwIGlzIG1pc3NpbmcgdGhlIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24uXG4gKlxuICogICAtIElFMTAgaGFzIGEgYnJva2VuIGBUeXBlZEFycmF5LnByb3RvdHlwZS5zdWJhcnJheWAgZnVuY3Rpb24gd2hpY2ggcmV0dXJucyBhcnJheXMgb2ZcbiAqICAgICBpbmNvcnJlY3QgbGVuZ3RoIGluIHNvbWUgc2l0dWF0aW9ucy5cblxuICogV2UgZGV0ZWN0IHRoZXNlIGJ1Z2d5IGJyb3dzZXJzIGFuZCBzZXQgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYCB0byBgZmFsc2VgIHNvIHRoZXlcbiAqIGdldCB0aGUgT2JqZWN0IGltcGxlbWVudGF0aW9uLCB3aGljaCBpcyBzbG93ZXIgYnV0IGJlaGF2ZXMgY29ycmVjdGx5LlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IGdsb2JhbC5UWVBFRF9BUlJBWV9TVVBQT1JUICE9PSB1bmRlZmluZWRcbiAgPyBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVFxuICA6IHR5cGVkQXJyYXlTdXBwb3J0KClcblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICBmdW5jdGlvbiBCYXIgKCkge31cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIGFyci5jb25zdHJ1Y3RvciA9IEJhclxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyICYmIC8vIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkXG4gICAgICAgIGFyci5jb25zdHJ1Y3RvciA9PT0gQmFyICYmIC8vIGNvbnN0cnVjdG9yIGNhbiBiZSBzZXRcbiAgICAgICAgdHlwZW9mIGFyci5zdWJhcnJheSA9PT0gJ2Z1bmN0aW9uJyAmJiAvLyBjaHJvbWUgOS0xMCBsYWNrIGBzdWJhcnJheWBcbiAgICAgICAgYXJyLnN1YmFycmF5KDEsIDEpLmJ5dGVMZW5ndGggPT09IDAgLy8gaWUxMCBoYXMgYnJva2VuIGBzdWJhcnJheWBcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGtNYXhMZW5ndGggKCkge1xuICByZXR1cm4gQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgICA/IDB4N2ZmZmZmZmZcbiAgICA6IDB4M2ZmZmZmZmZcbn1cblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKSB7XG4gICAgLy8gQXZvaWQgZ29pbmcgdGhyb3VnaCBhbiBBcmd1bWVudHNBZGFwdG9yVHJhbXBvbGluZSBpbiB0aGUgY29tbW9uIGNhc2UuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSByZXR1cm4gbmV3IEJ1ZmZlcihhcmcsIGFyZ3VtZW50c1sxXSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihhcmcpXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpcy5sZW5ndGggPSAwXG4gICAgdGhpcy5wYXJlbnQgPSB1bmRlZmluZWRcbiAgfVxuXG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICByZXR1cm4gZnJvbU51bWJlcih0aGlzLCBhcmcpXG4gIH1cblxuICAvLyBTbGlnaHRseSBsZXNzIGNvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh0aGlzLCBhcmcsIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogJ3V0ZjgnKVxuICB9XG5cbiAgLy8gVW51c3VhbC5cbiAgcmV0dXJuIGZyb21PYmplY3QodGhpcywgYXJnKVxufVxuXG5mdW5jdGlvbiBmcm9tTnVtYmVyICh0aGF0LCBsZW5ndGgpIHtcbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChsZW5ndGgpIHwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoYXRbaV0gPSAwXG4gICAgfVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHRoYXQsIHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIC8vIEFzc3VtcHRpb246IGJ5dGVMZW5ndGgoKSByZXR1cm4gdmFsdWUgaXMgYWx3YXlzIDwga01heExlbmd0aC5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG5cbiAgdGhhdC53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0ICh0aGF0LCBvYmplY3QpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmplY3QpKSByZXR1cm4gZnJvbUJ1ZmZlcih0aGF0LCBvYmplY3QpXG5cbiAgaWYgKGlzQXJyYXkob2JqZWN0KSkgcmV0dXJuIGZyb21BcnJheSh0aGF0LCBvYmplY3QpXG5cbiAgaWYgKG9iamVjdCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbXVzdCBzdGFydCB3aXRoIG51bWJlciwgYnVmZmVyLCBhcnJheSBvciBzdHJpbmcnKVxuICB9XG5cbiAgaWYgKHR5cGVvZiBBcnJheUJ1ZmZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAob2JqZWN0LmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gZnJvbVR5cGVkQXJyYXkodGhhdCwgb2JqZWN0KVxuICAgIH1cbiAgICBpZiAob2JqZWN0IGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodGhhdCwgb2JqZWN0KVxuICAgIH1cbiAgfVxuXG4gIGlmIChvYmplY3QubGVuZ3RoKSByZXR1cm4gZnJvbUFycmF5TGlrZSh0aGF0LCBvYmplY3QpXG5cbiAgcmV0dXJuIGZyb21Kc29uT2JqZWN0KHRoYXQsIG9iamVjdClcbn1cblxuZnVuY3Rpb24gZnJvbUJ1ZmZlciAodGhhdCwgYnVmZmVyKSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGJ1ZmZlci5sZW5ndGgpIHwgMFxuICB0aGF0ID0gYWxsb2NhdGUodGhhdCwgbGVuZ3RoKVxuICBidWZmZXIuY29weSh0aGF0LCAwLCAwLCBsZW5ndGgpXG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheSAodGhhdCwgYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbi8vIER1cGxpY2F0ZSBvZiBmcm9tQXJyYXkoKSB0byBrZWVwIGZyb21BcnJheSgpIG1vbm9tb3JwaGljLlxuZnVuY3Rpb24gZnJvbVR5cGVkQXJyYXkgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG4gIC8vIFRydW5jYXRpbmcgdGhlIGVsZW1lbnRzIGlzIHByb2JhYmx5IG5vdCB3aGF0IHBlb3BsZSBleHBlY3QgZnJvbSB0eXBlZFxuICAvLyBhcnJheXMgd2l0aCBCWVRFU19QRVJfRUxFTUVOVCA+IDEgYnV0IGl0J3MgY29tcGF0aWJsZSB3aXRoIHRoZSBiZWhhdmlvclxuICAvLyBvZiB0aGUgb2xkIEJ1ZmZlciBjb25zdHJ1Y3Rvci5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAodGhhdCwgYXJyYXkpIHtcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYXJyYXkuYnl0ZUxlbmd0aFxuICAgIHRoYXQgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkoYXJyYXkpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICB0aGF0ID0gZnJvbVR5cGVkQXJyYXkodGhhdCwgbmV3IFVpbnQ4QXJyYXkoYXJyYXkpKVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG4vLyBEZXNlcmlhbGl6ZSB7IHR5cGU6ICdCdWZmZXInLCBkYXRhOiBbMSwyLDMsLi4uXSB9IGludG8gYSBCdWZmZXIgb2JqZWN0LlxuLy8gUmV0dXJucyBhIHplcm8tbGVuZ3RoIGJ1ZmZlciBmb3IgaW5wdXRzIHRoYXQgZG9uJ3QgY29uZm9ybSB0byB0aGUgc3BlYy5cbmZ1bmN0aW9uIGZyb21Kc29uT2JqZWN0ICh0aGF0LCBvYmplY3QpIHtcbiAgdmFyIGFycmF5XG4gIHZhciBsZW5ndGggPSAwXG5cbiAgaWYgKG9iamVjdC50eXBlID09PSAnQnVmZmVyJyAmJiBpc0FycmF5KG9iamVjdC5kYXRhKSkge1xuICAgIGFycmF5ID0gb2JqZWN0LmRhdGFcbiAgICBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIH1cbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhhdFtpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gIEJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbiAgQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcbn0gZWxzZSB7XG4gIC8vIHByZS1zZXQgZm9yIHZhbHVlcyB0aGF0IG1heSBleGlzdCBpbiB0aGUgZnV0dXJlXG4gIEJ1ZmZlci5wcm90b3R5cGUubGVuZ3RoID0gdW5kZWZpbmVkXG4gIEJ1ZmZlci5wcm90b3R5cGUucGFyZW50ID0gdW5kZWZpbmVkXG59XG5cbmZ1bmN0aW9uIGFsbG9jYXRlICh0aGF0LCBsZW5ndGgpIHtcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2UsIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgdGhhdCA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICAgIHRoYXQuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gYW4gb2JqZWN0IGluc3RhbmNlIG9mIHRoZSBCdWZmZXIgY2xhc3NcbiAgICB0aGF0Lmxlbmd0aCA9IGxlbmd0aFxuICAgIHRoYXQuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGZyb21Qb29sID0gbGVuZ3RoICE9PSAwICYmIGxlbmd0aCA8PSBCdWZmZXIucG9vbFNpemUgPj4+IDFcbiAgaWYgKGZyb21Qb29sKSB0aGF0LnBhcmVudCA9IHJvb3RQYXJlbnRcblxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwga01heExlbmd0aGAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBrTWF4TGVuZ3RoKCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsga01heExlbmd0aCgpLnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKHN1YmplY3QsIGVuY29kaW5nKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBTbG93QnVmZmVyKSkgcmV0dXJuIG5ldyBTbG93QnVmZmVyKHN1YmplY3QsIGVuY29kaW5nKVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nKVxuICBkZWxldGUgYnVmLnBhcmVudFxuICByZXR1cm4gYnVmXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiAhIShiICE9IG51bGwgJiYgYi5faXNCdWZmZXIpXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICB2YXIgaSA9IDBcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIGJyZWFrXG5cbiAgICArK2lcbiAgfVxuXG4gIGlmIChpICE9PSBsZW4pIHtcbiAgICB4ID0gYVtpXVxuICAgIHkgPSBiW2ldXG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIWlzQXJyYXkobGlzdCkpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2xpc3QgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzLicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSBzdHJpbmcgPSAnJyArIHN0cmluZ1xuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgLy8gRGVwcmVjYXRlZFxuICAgICAgY2FzZSAncmF3JzpcbiAgICAgIGNhc2UgJ3Jhd3MnOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIHN0YXJ0ID0gc3RhcnQgfCAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA9PT0gSW5maW5pdHkgPyB0aGlzLmxlbmd0aCA6IGVuZCB8IDBcblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoZW5kIDw9IHN0YXJ0KSByZXR1cm4gJydcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBiaW5hcnlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoIHwgMFxuICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB1dGY4U2xpY2UodGhpcywgMCwgbGVuZ3RoKVxuICByZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIHRydWVcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICB2YXIgc3RyID0gJydcbiAgdmFyIG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkubWF0Y2goLy57Mn0vZykuam9pbignICcpXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIDBcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCkge1xuICBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIGJ5dGVPZmZzZXQgPj49IDBcblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVybiAtMVxuICBpZiAoYnl0ZU9mZnNldCA+PSB0aGlzLmxlbmd0aCkgcmV0dXJuIC0xXG5cbiAgLy8gTmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBNYXRoLm1heCh0aGlzLmxlbmd0aCArIGJ5dGVPZmZzZXQsIDApXG5cbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHJldHVybiAtMSAvLyBzcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZyBhbHdheXMgZmFpbHNcbiAgICByZXR1cm4gU3RyaW5nLnByb3RvdHlwZS5pbmRleE9mLmNhbGwodGhpcywgdmFsLCBieXRlT2Zmc2V0KVxuICB9XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIHJldHVybiBhcnJheUluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0KVxuICB9XG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZih0aGlzLCBbIHZhbCBdLCBieXRlT2Zmc2V0KVxuICB9XG5cbiAgZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCkge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKHZhciBpID0gMDsgYnl0ZU9mZnNldCArIGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhcnJbYnl0ZU9mZnNldCArIGldID09PSB2YWxbZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXhdKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsLmxlbmd0aCkgcmV0dXJuIGJ5dGVPZmZzZXQgKyBmb3VuZEluZGV4XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIC0xXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG4vLyBgZ2V0YCBpcyBkZXByZWNhdGVkXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCBpcyBkZXByZWNhdGVkXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldCAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAoc3RyTGVuICUgMiAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChpc05hTihwYXJzZWQpKSB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCB8IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICAvLyBsZWdhY3kgd3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0LCBsZW5ndGgpIC0gcmVtb3ZlIGluIHYwLjEzXG4gIH0gZWxzZSB7XG4gICAgdmFyIHN3YXAgPSBlbmNvZGluZ1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgb2Zmc2V0ID0gbGVuZ3RoIHwgMFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdhdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBiaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgYnl0ZXNbaSArIDFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWZcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgbmV3QnVmID0gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH1cblxuICBpZiAobmV3QnVmLmxlbmd0aCkgbmV3QnVmLnBhcmVudCA9IHRoaXMucGFyZW50IHx8IHRoaXNcblxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ2J1ZmZlciBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndmFsdWUgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCksIDApXG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCksIDApXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZiArIHZhbHVlICsgMVxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGJ1Zi5sZW5ndGggLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID0gKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbmZ1bmN0aW9uIG9iamVjdFdyaXRlVUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbikge1xuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICAgIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSB2YWx1ZSA8IDAgPyAxIDogMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IHZhbHVlIDwgMCA/IDEgOiAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHZhbHVlID0gTWF0aC5mbG9vcih2YWx1ZSlcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignaW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcbiAgdmFyIGlcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHN0YXJ0IDwgdGFyZ2V0U3RhcnQgJiYgdGFyZ2V0U3RhcnQgPCBlbmQpIHtcbiAgICAvLyBkZXNjZW5kaW5nIGNvcHkgZnJvbSBlbmRcbiAgICBmb3IgKGkgPSBsZW4gLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSBpZiAobGVuIDwgMTAwMCB8fCAhQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAvLyBhc2NlbmRpbmcgY29weSBmcm9tIHN0YXJ0XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldFN0YXJ0KVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBmaWxsKHZhbHVlLCBzdGFydD0wLCBlbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2VuZCBvdXQgb2YgYm91bmRzJylcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICAgIHRoaXNbaV0gPSB2YWx1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSB1dGY4VG9CeXRlcyh2YWx1ZS50b1N0cmluZygpKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiB0b0FycmF5QnVmZmVyICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSkge1xuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICB9XG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiBfYXVnbWVudCAoYXJyKSB7XG4gIGFyci5jb25zdHJ1Y3RvciA9IEJ1ZmZlclxuICBhcnIuX2lzQnVmZmVyID0gdHJ1ZVxuXG4gIC8vIHNhdmUgcmVmZXJlbmNlIHRvIG9yaWdpbmFsIFVpbnQ4QXJyYXkgc2V0IG1ldGhvZCBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9zZXQgPSBhcnIuc2V0XG5cbiAgLy8gZGVwcmVjYXRlZFxuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5lcXVhbHMgPSBCUC5lcXVhbHNcbiAgYXJyLmNvbXBhcmUgPSBCUC5jb21wYXJlXG4gIGFyci5pbmRleE9mID0gQlAuaW5kZXhPZlxuICBhcnIuY29weSA9IEJQLmNvcHlcbiAgYXJyLnNsaWNlID0gQlAuc2xpY2VcbiAgYXJyLnJlYWRVSW50TEUgPSBCUC5yZWFkVUludExFXG4gIGFyci5yZWFkVUludEJFID0gQlAucmVhZFVJbnRCRVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnRMRSA9IEJQLnJlYWRJbnRMRVxuICBhcnIucmVhZEludEJFID0gQlAucmVhZEludEJFXG4gIGFyci5yZWFkSW50OCA9IEJQLnJlYWRJbnQ4XG4gIGFyci5yZWFkSW50MTZMRSA9IEJQLnJlYWRJbnQxNkxFXG4gIGFyci5yZWFkSW50MTZCRSA9IEJQLnJlYWRJbnQxNkJFXG4gIGFyci5yZWFkSW50MzJMRSA9IEJQLnJlYWRJbnQzMkxFXG4gIGFyci5yZWFkSW50MzJCRSA9IEJQLnJlYWRJbnQzMkJFXG4gIGFyci5yZWFkRmxvYXRMRSA9IEJQLnJlYWRGbG9hdExFXG4gIGFyci5yZWFkRmxvYXRCRSA9IEJQLnJlYWRGbG9hdEJFXG4gIGFyci5yZWFkRG91YmxlTEUgPSBCUC5yZWFkRG91YmxlTEVcbiAgYXJyLnJlYWREb3VibGVCRSA9IEJQLnJlYWREb3VibGVCRVxuICBhcnIud3JpdGVVSW50OCA9IEJQLndyaXRlVUludDhcbiAgYXJyLndyaXRlVUludExFID0gQlAud3JpdGVVSW50TEVcbiAgYXJyLndyaXRlVUludEJFID0gQlAud3JpdGVVSW50QkVcbiAgYXJyLndyaXRlVUludDE2TEUgPSBCUC53cml0ZVVJbnQxNkxFXG4gIGFyci53cml0ZVVJbnQxNkJFID0gQlAud3JpdGVVSW50MTZCRVxuICBhcnIud3JpdGVVSW50MzJMRSA9IEJQLndyaXRlVUludDMyTEVcbiAgYXJyLndyaXRlVUludDMyQkUgPSBCUC53cml0ZVVJbnQzMkJFXG4gIGFyci53cml0ZUludExFID0gQlAud3JpdGVJbnRMRVxuICBhcnIud3JpdGVJbnRCRSA9IEJQLndyaXRlSW50QkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rXFwvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyaW5ndHJpbShzdHIpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cbiIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGFycikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChhcnIpID09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuIiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpe1xuICByZXR1cm4gJC5jcmVhdGUoUCwgRCk7XG59OyIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2Mpe1xuICByZXR1cm4gJC5zZXREZXNjKGl0LCBrZXksIGRlc2MpO1xufTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHJldHVybiAkLmdldERlc2MoaXQsIGtleSk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJC5jb3JlJykuT2JqZWN0LnNldFByb3RvdHlwZU9mOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZih0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJyl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uIScpO1xuICByZXR1cm4gaXQ7XG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vJC5pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59OyIsInZhciBjb3JlID0gbW9kdWxlLmV4cG9ydHMgPSB7dmVyc2lvbjogJzEuMi42J307XG5pZih0eXBlb2YgX19lID09ICdudW1iZXInKV9fZSA9IGNvcmU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCIvLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbnZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLyQuYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvLyA3LjIuMSBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ID09IHVuZGVmaW5lZCl0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiAgXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vJC5nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vJC5jb3JlJylcbiAgLCBjdHggICAgICAgPSByZXF1aXJlKCcuLyQuY3R4JylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgSVNfV1JBUCAgID0gdHlwZSAmICRleHBvcnQuV1xuICAgICwgZXhwb3J0cyAgID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSlcbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGtleSwgb3duLCBvdXQ7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYga2V5IGluIHRhcmdldDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbihDKXtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24ocGFyYW0pe1xuICAgICAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIEMgPyBuZXcgQyhwYXJhbSkgOiBDKHBhcmFtKTtcbiAgICAgIH07XG4gICAgICBGW1BST1RPVFlQRV0gPSBDW1BST1RPVFlQRV07XG4gICAgICByZXR1cm4gRjtcbiAgICAvLyBtYWtlIHN0YXRpYyB2ZXJzaW9ucyBmb3IgcHJvdG90eXBlIG1ldGhvZHNcbiAgICB9KShvdXQpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgaWYoSVNfUFJPVE8pKGV4cG9ydHNbUFJPVE9UWVBFXSB8fCAoZXhwb3J0c1tQUk9UT1RZUEVdID0ge30pKVtrZXldID0gb3V0O1xuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAvLyBmb3JjZWRcbiRleHBvcnQuRyA9IDI7ICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAvLyBwcm90b1xuJGV4cG9ydC5CID0gMTY7IC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAvLyB3cmFwXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07IiwiLy8gaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzg2I2lzc3VlY29tbWVudC0xMTU3NTkwMjhcbnZhciBnbG9iYWwgPSBtb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lk1hdGggPT0gTWF0aFxuICA/IHdpbmRvdyA6IHR5cGVvZiBzZWxmICE9ICd1bmRlZmluZWQnICYmIHNlbGYuTWF0aCA9PSBNYXRoID8gc2VsZiA6IEZ1bmN0aW9uKCdyZXR1cm4gdGhpcycpKCk7XG5pZih0eXBlb2YgX19nID09ICdudW1iZXInKV9fZyA9IGdsb2JhbDsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG52YXIgY29mID0gcmVxdWlyZSgnLi8kLmNvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07IiwidmFyICRPYmplY3QgPSBPYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgY3JlYXRlOiAgICAgJE9iamVjdC5jcmVhdGUsXG4gIGdldFByb3RvOiAgICRPYmplY3QuZ2V0UHJvdG90eXBlT2YsXG4gIGlzRW51bTogICAgIHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlLFxuICBnZXREZXNjOiAgICAkT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcixcbiAgc2V0RGVzYzogICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0eSxcbiAgc2V0RGVzY3M6ICAgJE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzLFxuICBnZXRLZXlzOiAgICAkT2JqZWN0LmtleXMsXG4gIGdldE5hbWVzOiAgICRPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgZ2V0U3ltYm9sczogJE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMsXG4gIGVhY2g6ICAgICAgIFtdLmZvckVhY2hcbn07IiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKVxuICAsIGNvcmUgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgZmFpbHMgICA9IHJlcXVpcmUoJy4vJC5mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVksIGV4ZWMpe1xuICB2YXIgZm4gID0gKGNvcmUuT2JqZWN0IHx8IHt9KVtLRVldIHx8IE9iamVjdFtLRVldXG4gICAgLCBleHAgPSB7fTtcbiAgZXhwW0tFWV0gPSBleGVjKGZuKTtcbiAgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiBmYWlscyhmdW5jdGlvbigpeyBmbigxKTsgfSksICdPYmplY3QnLCBleHApO1xufTsiLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG52YXIgZ2V0RGVzYyAgPSByZXF1aXJlKCcuLyQnKS5nZXREZXNjXG4gICwgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0JylcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vJC5hbi1vYmplY3QnKTtcbnZhciBjaGVjayA9IGZ1bmN0aW9uKE8sIHByb3RvKXtcbiAgYW5PYmplY3QoTyk7XG4gIGlmKCFpc09iamVjdChwcm90bykgJiYgcHJvdG8gIT09IG51bGwpdGhyb3cgVHlwZUVycm9yKHByb3RvICsgXCI6IGNhbid0IHNldCBhcyBwcm90b3R5cGUhXCIpO1xufTtcbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fCAoJ19fcHJvdG9fXycgaW4ge30gPyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgZnVuY3Rpb24odGVzdCwgYnVnZ3ksIHNldCl7XG4gICAgICB0cnkge1xuICAgICAgICBzZXQgPSByZXF1aXJlKCcuLyQuY3R4JykoRnVuY3Rpb24uY2FsbCwgZ2V0RGVzYyhPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0LCAyKTtcbiAgICAgICAgc2V0KHRlc3QsIFtdKTtcbiAgICAgICAgYnVnZ3kgPSAhKHRlc3QgaW5zdGFuY2VvZiBBcnJheSk7XG4gICAgICB9IGNhdGNoKGUpeyBidWdneSA9IHRydWU7IH1cbiAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90byl7XG4gICAgICAgIGNoZWNrKE8sIHByb3RvKTtcbiAgICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xuICAgICAgICByZXR1cm4gTztcbiAgICAgIH07XG4gICAgfSh7fSwgZmFsc2UpIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59OyIsIi8vIHRvIGluZGV4ZWQgb2JqZWN0LCB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIElPYmplY3QgPSByZXF1aXJlKCcuLyQuaW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vJC5kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi8kLnRvLWlvYmplY3QnKTtcblxucmVxdWlyZSgnLi8kLm9iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgZnVuY3Rpb24oJGdldE93blByb3BlcnR5RGVzY3JpcHRvcil7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gICAgcmV0dXJuICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG9JT2JqZWN0KGl0KSwga2V5KTtcbiAgfTtcbn0pOyIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vJC5leHBvcnQnKTtcbiRleHBvcnQoJGV4cG9ydC5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuLyQuc2V0LXByb3RvJykuc2V0fSk7IiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbihleHBvcnRzLCB1bmRlZmluZWQpIHtcblxuICB2YXJcbiAgICAvLyBJZiB0aGUgdHlwZWQgYXJyYXkgaXMgdW5zcGVjaWZpZWQsIHVzZSB0aGlzLlxuICAgIERlZmF1bHRBcnJheVR5cGUgPSBGbG9hdDMyQXJyYXksXG4gICAgLy8gU2ltcGxlIG1hdGggZnVuY3Rpb25zIHdlIG5lZWQuXG4gICAgc3FydCA9IE1hdGguc3FydCxcbiAgICBzcXIgPSBmdW5jdGlvbihudW1iZXIpIHtyZXR1cm4gTWF0aC5wb3cobnVtYmVyLCAyKX0sXG4gICAgLy8gSW50ZXJuYWwgY29udmVuaWVuY2UgY29waWVzIG9mIHRoZSBleHBvcnRlZCBmdW5jdGlvbnNcbiAgICBpc0NvbXBsZXhBcnJheSxcbiAgICBDb21wbGV4QXJyYXlcblxuICBleHBvcnRzLmlzQ29tcGxleEFycmF5ID0gaXNDb21wbGV4QXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIG9iai5oYXNPd25Qcm9wZXJ0eSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBvYmouaGFzT3duUHJvcGVydHkoJ3JlYWwnKSAmJlxuICAgICAgb2JqLmhhc093blByb3BlcnR5KCdpbWFnJylcbiAgfVxuXG4gIGV4cG9ydHMuQ29tcGxleEFycmF5ID0gQ29tcGxleEFycmF5ID0gZnVuY3Rpb24ob3RoZXIsIG9wdF9hcnJheV90eXBlKXtcbiAgICBpZiAoaXNDb21wbGV4QXJyYXkob3RoZXIpKSB7XG4gICAgICAvLyBDb3B5IGNvbnN0dWN0b3IuXG4gICAgICB0aGlzLkFycmF5VHlwZSA9IG90aGVyLkFycmF5VHlwZVxuICAgICAgdGhpcy5yZWFsID0gbmV3IHRoaXMuQXJyYXlUeXBlKG90aGVyLnJlYWwpXG4gICAgICB0aGlzLmltYWcgPSBuZXcgdGhpcy5BcnJheVR5cGUob3RoZXIuaW1hZylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5BcnJheVR5cGUgPSBvcHRfYXJyYXlfdHlwZSB8fCBEZWZhdWx0QXJyYXlUeXBlXG4gICAgICAvLyBvdGhlciBjYW4gYmUgZWl0aGVyIGFuIGFycmF5IG9yIGEgbnVtYmVyLlxuICAgICAgdGhpcy5yZWFsID0gbmV3IHRoaXMuQXJyYXlUeXBlKG90aGVyKVxuICAgICAgdGhpcy5pbWFnID0gbmV3IHRoaXMuQXJyYXlUeXBlKHRoaXMucmVhbC5sZW5ndGgpXG4gICAgfVxuXG4gICAgdGhpcy5sZW5ndGggPSB0aGlzLnJlYWwubGVuZ3RoXG4gIH1cblxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvbXBvbmVudHMgPSBbXVxuXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKGNfdmFsdWUsIGkpIHtcbiAgICAgIGNvbXBvbmVudHMucHVzaChcbiAgICAgICAgJygnICtcbiAgICAgICAgY192YWx1ZS5yZWFsLnRvRml4ZWQoMikgKyAnLCcgK1xuICAgICAgICBjX3ZhbHVlLmltYWcudG9GaXhlZCgyKSArXG4gICAgICAgICcpJ1xuICAgICAgKVxuICAgIH0pXG5cbiAgICByZXR1cm4gJ1snICsgY29tcG9uZW50cy5qb2luKCcsJykgKyAnXSdcbiAgfVxuXG4gIC8vIEluLXBsYWNlIG1hcHBlci5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbihtYXBwZXIpIHtcbiAgICB2YXJcbiAgICAgIGksXG4gICAgICBuID0gdGhpcy5sZW5ndGgsXG4gICAgICAvLyBGb3IgR0MgZWZmaWNpZW5jeSwgcGFzcyBhIHNpbmdsZSBjX3ZhbHVlIG9iamVjdCB0byB0aGUgbWFwcGVyLlxuICAgICAgY192YWx1ZSA9IHt9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICBjX3ZhbHVlLnJlYWwgPSB0aGlzLnJlYWxbaV1cbiAgICAgIGNfdmFsdWUuaW1hZyA9IHRoaXMuaW1hZ1tpXVxuICAgICAgbWFwcGVyKGNfdmFsdWUsIGksIG4pXG4gICAgICB0aGlzLnJlYWxbaV0gPSBjX3ZhbHVlLnJlYWxcbiAgICAgIHRoaXMuaW1hZ1tpXSA9IGNfdmFsdWUuaW1hZ1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbihpdGVyYXRvcikge1xuICAgIHZhclxuICAgICAgaSxcbiAgICAgIG4gPSB0aGlzLmxlbmd0aCxcbiAgICAgIC8vIEZvciBjb25zaXN0ZW5jeSB3aXRoIC5tYXAuXG4gICAgICBjX3ZhbHVlID0ge31cblxuICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIGNfdmFsdWUucmVhbCA9IHRoaXMucmVhbFtpXVxuICAgICAgY192YWx1ZS5pbWFnID0gdGhpcy5pbWFnW2ldXG4gICAgICBpdGVyYXRvcihjX3ZhbHVlLCBpLCBuKVxuICAgIH1cbiAgfVxuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUuY29uanVnYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIChuZXcgQ29tcGxleEFycmF5KHRoaXMpKS5tYXAoZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhbHVlLmltYWcgKj0gLTFcbiAgICB9KVxuICB9XG5cbiAgLy8gSGVscGVyIHNvIHdlIGNhbiBtYWtlIEFycmF5VHlwZSBvYmplY3RzIHJldHVybmVkIGhhdmUgc2ltaWxhciBpbnRlcmZhY2VzXG4gIC8vICAgdG8gQ29tcGxleEFycmF5cy5cbiAgZnVuY3Rpb24gaXRlcmFibGUob2JqKSB7XG4gICAgaWYgKCFvYmouZm9yRWFjaClcbiAgICAgIG9iai5mb3JFYWNoID0gZnVuY3Rpb24oaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGksIG4gPSB0aGlzLmxlbmd0aFxuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspXG4gICAgICAgICAgaXRlcmF0b3IodGhpc1tpXSwgaSwgbilcbiAgICAgIH1cblxuICAgIHJldHVybiBvYmpcbiAgfVxuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUubWFnbml0dWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1hZ3MgPSBuZXcgdGhpcy5BcnJheVR5cGUodGhpcy5sZW5ndGgpXG5cbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24odmFsdWUsIGkpIHtcbiAgICAgIG1hZ3NbaV0gPSBzcXJ0KHNxcih2YWx1ZS5yZWFsKSArIHNxcih2YWx1ZS5pbWFnKSlcbiAgICB9KVxuXG4gICAgLy8gQXJyYXlUeXBlIHdpbGwgbm90IG5lY2Vzc2FyaWx5IGJlIGl0ZXJhYmxlOiBtYWtlIGl0IHNvLlxuICAgIHJldHVybiBpdGVyYWJsZShtYWdzKVxuICB9XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyAmJiAodGhpcy5jb21wbGV4X2FycmF5ID0ge30pIHx8IGV4cG9ydHMpXG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbihleHBvcnRzLCBjb21wbGV4X2FycmF5KSB7XG5cbiAgdmFyXG4gICAgQ29tcGxleEFycmF5ID0gY29tcGxleF9hcnJheS5Db21wbGV4QXJyYXksXG4gICAgLy8gTWF0aCBjb25zdGFudHMgYW5kIGZ1bmN0aW9ucyB3ZSBuZWVkLlxuICAgIFBJID0gTWF0aC5QSSxcbiAgICBTUVJUMV8yID0gTWF0aC5TUVJUMV8yLFxuICAgIHNxcnQgPSBNYXRoLnNxcnQsXG4gICAgY29zID0gTWF0aC5jb3MsXG4gICAgc2luID0gTWF0aC5zaW5cblxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLkZGVCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBGRlQodGhpcywgZmFsc2UpXG4gIH1cblxuICBleHBvcnRzLkZGVCA9IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuIGVuc3VyZUNvbXBsZXhBcnJheShpbnB1dCkuRkZUKClcbiAgfVxuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUuSW52RkZUID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEZGVCh0aGlzLCB0cnVlKVxuICB9XG5cbiAgZXhwb3J0cy5JbnZGRlQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiBlbnN1cmVDb21wbGV4QXJyYXkoaW5wdXQpLkludkZGVCgpXG4gIH1cblxuICAvLyBBcHBsaWVzIGEgZnJlcXVlbmN5LXNwYWNlIGZpbHRlciB0byBpbnB1dCwgYW5kIHJldHVybnMgdGhlIHJlYWwtc3BhY2VcbiAgLy8gZmlsdGVyZWQgaW5wdXQuXG4gIC8vIGZpbHRlcmVyIGFjY2VwdHMgZnJlcSwgaSwgbiBhbmQgbW9kaWZpZXMgZnJlcS5yZWFsIGFuZCBmcmVxLmltYWcuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUuZnJlcXVlbmN5TWFwID0gZnVuY3Rpb24oZmlsdGVyZXIpIHtcbiAgICByZXR1cm4gdGhpcy5GRlQoKS5tYXAoZmlsdGVyZXIpLkludkZGVCgpXG4gIH1cblxuICBleHBvcnRzLmZyZXF1ZW5jeU1hcCA9IGZ1bmN0aW9uKGlucHV0LCBmaWx0ZXJlcikge1xuICAgIHJldHVybiBlbnN1cmVDb21wbGV4QXJyYXkoaW5wdXQpLmZyZXF1ZW5jeU1hcChmaWx0ZXJlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIGVuc3VyZUNvbXBsZXhBcnJheShpbnB1dCkge1xuICAgIHJldHVybiBjb21wbGV4X2FycmF5LmlzQ29tcGxleEFycmF5KGlucHV0KSAmJiBpbnB1dCB8fFxuICAgICAgICBuZXcgQ29tcGxleEFycmF5KGlucHV0KVxuICB9XG5cbiAgZnVuY3Rpb24gRkZUKGlucHV0LCBpbnZlcnNlKSB7XG4gICAgdmFyIG4gPSBpbnB1dC5sZW5ndGhcblxuICAgIGlmIChuICYgKG4gLSAxKSkge1xuICAgICAgcmV0dXJuIEZGVF9SZWN1cnNpdmUoaW5wdXQsIGludmVyc2UpXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBGRlRfMl9JdGVyYXRpdmUoaW5wdXQsIGludmVyc2UpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gRkZUX1JlY3Vyc2l2ZShpbnB1dCwgaW52ZXJzZSkge1xuICAgIHZhclxuICAgICAgbiA9IGlucHV0Lmxlbmd0aCxcbiAgICAgIC8vIENvdW50ZXJzLlxuICAgICAgaSwgaixcbiAgICAgIG91dHB1dCxcbiAgICAgIC8vIENvbXBsZXggbXVsdGlwbGllciBhbmQgaXRzIGRlbHRhLlxuICAgICAgZl9yLCBmX2ksIGRlbF9mX3IsIGRlbF9mX2ksXG4gICAgICAvLyBMb3dlc3QgZGl2aXNvciBhbmQgcmVtYWluZGVyLlxuICAgICAgcCwgbSxcbiAgICAgIG5vcm1hbGlzYXRpb24sXG4gICAgICByZWN1cnNpdmVfcmVzdWx0LFxuICAgICAgX3N3YXAsIF9yZWFsLCBfaW1hZ1xuXG4gICAgaWYgKG4gPT09IDEpIHtcbiAgICAgIHJldHVybiBpbnB1dFxuICAgIH1cblxuICAgIG91dHB1dCA9IG5ldyBDb21wbGV4QXJyYXkobiwgaW5wdXQuQXJyYXlUeXBlKVxuXG4gICAgLy8gVXNlIHRoZSBsb3dlc3Qgb2RkIGZhY3Rvciwgc28gd2UgYXJlIGFibGUgdG8gdXNlIEZGVF8yX0l0ZXJhdGl2ZSBpbiB0aGVcbiAgICAvLyByZWN1cnNpdmUgdHJhbnNmb3JtcyBvcHRpbWFsbHkuXG4gICAgcCA9IExvd2VzdE9kZEZhY3RvcihuKVxuICAgIG0gPSBuIC8gcFxuICAgIG5vcm1hbGlzYXRpb24gPSAxIC8gc3FydChwKVxuICAgIHJlY3Vyc2l2ZV9yZXN1bHQgPSBuZXcgQ29tcGxleEFycmF5KG0sIGlucHV0LkFycmF5VHlwZSlcblxuICAgIC8vIExvb3BzIGdvIGxpa2UgTyhuIM6jIHBfaSksIHdoZXJlIHBfaSBhcmUgdGhlIHByaW1lIGZhY3RvcnMgb2Ygbi5cbiAgICAvLyBmb3IgYSBwb3dlciBvZiBhIHByaW1lLCBwLCB0aGlzIHJlZHVjZXMgdG8gTyhuIHAgbG9nX3AgbilcbiAgICBmb3IoaiA9IDA7IGogPCBwOyBqKyspIHtcbiAgICAgIGZvcihpID0gMDsgaSA8IG07IGkrKykge1xuICAgICAgICByZWN1cnNpdmVfcmVzdWx0LnJlYWxbaV0gPSBpbnB1dC5yZWFsW2kgKiBwICsgal1cbiAgICAgICAgcmVjdXJzaXZlX3Jlc3VsdC5pbWFnW2ldID0gaW5wdXQuaW1hZ1tpICogcCArIGpdXG4gICAgICB9XG4gICAgICAvLyBEb24ndCBnbyBkZWVwZXIgdW5sZXNzIG5lY2Vzc2FyeSB0byBzYXZlIGFsbG9jcy5cbiAgICAgIGlmIChtID4gMSkge1xuICAgICAgICByZWN1cnNpdmVfcmVzdWx0ID0gRkZUKHJlY3Vyc2l2ZV9yZXN1bHQsIGludmVyc2UpXG4gICAgICB9XG5cbiAgICAgIGRlbF9mX3IgPSBjb3MoMipQSSpqL24pXG4gICAgICBkZWxfZl9pID0gKGludmVyc2UgPyAtMSA6IDEpICogc2luKDIqUEkqai9uKVxuICAgICAgZl9yID0gMVxuICAgICAgZl9pID0gMFxuXG4gICAgICBmb3IoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgX3JlYWwgPSByZWN1cnNpdmVfcmVzdWx0LnJlYWxbaSAlIG1dXG4gICAgICAgIF9pbWFnID0gcmVjdXJzaXZlX3Jlc3VsdC5pbWFnW2kgJSBtXVxuXG4gICAgICAgIG91dHB1dC5yZWFsW2ldICs9IGZfciAqIF9yZWFsIC0gZl9pICogX2ltYWdcbiAgICAgICAgb3V0cHV0LmltYWdbaV0gKz0gZl9yICogX2ltYWcgKyBmX2kgKiBfcmVhbFxuXG4gICAgICAgIF9zd2FwID0gZl9yICogZGVsX2ZfciAtIGZfaSAqIGRlbF9mX2lcbiAgICAgICAgZl9pID0gZl9yICogZGVsX2ZfaSArIGZfaSAqIGRlbF9mX3JcbiAgICAgICAgZl9yID0gX3N3YXBcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDb3B5IGJhY2sgdG8gaW5wdXQgdG8gbWF0Y2ggRkZUXzJfSXRlcmF0aXZlIGluLXBsYWNlbmVzc1xuICAgIC8vIFRPRE86IGZhc3RlciB3YXkgb2YgbWFraW5nIHRoaXMgaW4tcGxhY2U/XG4gICAgZm9yKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICBpbnB1dC5yZWFsW2ldID0gbm9ybWFsaXNhdGlvbiAqIG91dHB1dC5yZWFsW2ldXG4gICAgICBpbnB1dC5pbWFnW2ldID0gbm9ybWFsaXNhdGlvbiAqIG91dHB1dC5pbWFnW2ldXG4gICAgfVxuXG4gICAgcmV0dXJuIGlucHV0XG4gIH1cblxuICBmdW5jdGlvbiBGRlRfMl9JdGVyYXRpdmUoaW5wdXQsIGludmVyc2UpIHtcbiAgICB2YXJcbiAgICAgIG4gPSBpbnB1dC5sZW5ndGgsXG4gICAgICAvLyBDb3VudGVycy5cbiAgICAgIGksIGosXG4gICAgICBvdXRwdXQsIG91dHB1dF9yLCBvdXRwdXRfaSxcbiAgICAgIC8vIENvbXBsZXggbXVsdGlwbGllciBhbmQgaXRzIGRlbHRhLlxuICAgICAgZl9yLCBmX2ksIGRlbF9mX3IsIGRlbF9mX2ksIHRlbXAsXG4gICAgICAvLyBUZW1wb3JhcnkgbG9vcCB2YXJpYWJsZXMuXG4gICAgICBsX2luZGV4LCByX2luZGV4LFxuICAgICAgbGVmdF9yLCBsZWZ0X2ksIHJpZ2h0X3IsIHJpZ2h0X2ksXG4gICAgICAvLyB3aWR0aCBvZiBlYWNoIHN1Yi1hcnJheSBmb3Igd2hpY2ggd2UncmUgaXRlcmF0aXZlbHkgY2FsY3VsYXRpbmcgRkZULlxuICAgICAgd2lkdGhcblxuICAgIG91dHB1dCA9IEJpdFJldmVyc2VDb21wbGV4QXJyYXkoaW5wdXQpXG4gICAgb3V0cHV0X3IgPSBvdXRwdXQucmVhbFxuICAgIG91dHB1dF9pID0gb3V0cHV0LmltYWdcbiAgICAvLyBMb29wcyBnbyBsaWtlIE8obiBsb2cgbik6XG4gICAgLy8gICB3aWR0aCB+IGxvZyBuOyBpLGogfiBuXG4gICAgd2lkdGggPSAxXG4gICAgd2hpbGUgKHdpZHRoIDwgbikge1xuICAgICAgZGVsX2ZfciA9IGNvcyhQSS93aWR0aClcbiAgICAgIGRlbF9mX2kgPSAoaW52ZXJzZSA/IC0xIDogMSkgKiBzaW4oUEkvd2lkdGgpXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbi8oMip3aWR0aCk7IGkrKykge1xuICAgICAgICBmX3IgPSAxXG4gICAgICAgIGZfaSA9IDBcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgICAgICBsX2luZGV4ID0gMippKndpZHRoICsgalxuICAgICAgICAgIHJfaW5kZXggPSBsX2luZGV4ICsgd2lkdGhcblxuICAgICAgICAgIGxlZnRfciA9IG91dHB1dF9yW2xfaW5kZXhdXG4gICAgICAgICAgbGVmdF9pID0gb3V0cHV0X2lbbF9pbmRleF1cbiAgICAgICAgICByaWdodF9yID0gZl9yICogb3V0cHV0X3Jbcl9pbmRleF0gLSBmX2kgKiBvdXRwdXRfaVtyX2luZGV4XVxuICAgICAgICAgIHJpZ2h0X2kgPSBmX2kgKiBvdXRwdXRfcltyX2luZGV4XSArIGZfciAqIG91dHB1dF9pW3JfaW5kZXhdXG5cbiAgICAgICAgICBvdXRwdXRfcltsX2luZGV4XSA9IFNRUlQxXzIgKiAobGVmdF9yICsgcmlnaHRfcilcbiAgICAgICAgICBvdXRwdXRfaVtsX2luZGV4XSA9IFNRUlQxXzIgKiAobGVmdF9pICsgcmlnaHRfaSlcbiAgICAgICAgICBvdXRwdXRfcltyX2luZGV4XSA9IFNRUlQxXzIgKiAobGVmdF9yIC0gcmlnaHRfcilcbiAgICAgICAgICBvdXRwdXRfaVtyX2luZGV4XSA9IFNRUlQxXzIgKiAobGVmdF9pIC0gcmlnaHRfaSlcbiAgICAgICAgICB0ZW1wID0gZl9yICogZGVsX2ZfciAtIGZfaSAqIGRlbF9mX2lcbiAgICAgICAgICBmX2kgPSBmX3IgKiBkZWxfZl9pICsgZl9pICogZGVsX2ZfclxuICAgICAgICAgIGZfciA9IHRlbXBcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgd2lkdGggPDw9IDFcbiAgICB9XG5cbiAgICByZXR1cm4gb3V0cHV0XG4gIH1cblxuICBmdW5jdGlvbiBCaXRSZXZlcnNlSW5kZXgoaW5kZXgsIG4pIHtcbiAgICB2YXIgYml0cmV2ZXJzZWRfaW5kZXggPSAwXG5cbiAgICB3aGlsZSAobiA+IDEpIHtcbiAgICAgIGJpdHJldmVyc2VkX2luZGV4IDw8PSAxXG4gICAgICBiaXRyZXZlcnNlZF9pbmRleCArPSBpbmRleCAmIDFcbiAgICAgIGluZGV4ID4+PSAxXG4gICAgICBuID4+PSAxXG4gICAgfVxuICAgIHJldHVybiBiaXRyZXZlcnNlZF9pbmRleFxuICB9XG5cbiAgZnVuY3Rpb24gQml0UmV2ZXJzZUNvbXBsZXhBcnJheShhcnJheSkge1xuICAgIHZhciBuID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICBmbGlwcyA9IHt9LFxuICAgICAgICBzd2FwLFxuICAgICAgICBpXG5cbiAgICBmb3IoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgIHZhciByX2kgPSBCaXRSZXZlcnNlSW5kZXgoaSwgbilcblxuICAgICAgaWYgKGZsaXBzLmhhc093blByb3BlcnR5KGkpIHx8IGZsaXBzLmhhc093blByb3BlcnR5KHJfaSkpIGNvbnRpbnVlXG5cbiAgICAgIHN3YXAgPSBhcnJheS5yZWFsW3JfaV1cbiAgICAgIGFycmF5LnJlYWxbcl9pXSA9IGFycmF5LnJlYWxbaV1cbiAgICAgIGFycmF5LnJlYWxbaV0gPSBzd2FwXG5cbiAgICAgIHN3YXAgPSBhcnJheS5pbWFnW3JfaV1cbiAgICAgIGFycmF5LmltYWdbcl9pXSA9IGFycmF5LmltYWdbaV1cbiAgICAgIGFycmF5LmltYWdbaV0gPSBzd2FwXG5cbiAgICAgIGZsaXBzW2ldID0gZmxpcHNbcl9pXSA9IHRydWVcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXlcbiAgfVxuXG4gIGZ1bmN0aW9uIExvd2VzdE9kZEZhY3RvcihuKSB7XG4gICAgdmFyIGZhY3RvciA9IDMsXG4gICAgICAgIHNxcnRfbiA9IHNxcnQobilcblxuICAgIHdoaWxlKGZhY3RvciA8PSBzcXJ0X24pIHtcbiAgICAgIGlmIChuICUgZmFjdG9yID09PSAwKSByZXR1cm4gZmFjdG9yXG4gICAgICBmYWN0b3IgPSBmYWN0b3IgKyAyXG4gICAgfVxuICAgIHJldHVybiBuXG4gIH1cblxufShcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICd1bmRlZmluZWQnICYmICh0aGlzLmZmdCA9IHt9KSB8fCBleHBvcnRzLFxuICB0eXBlb2YgcmVxdWlyZSA9PT0gJ3VuZGVmaW5lZCcgJiYgKHRoaXMuY29tcGxleF9hcnJheSkgfHxcbiAgICByZXF1aXJlKCcuL2NvbXBsZXhfYXJyYXknKVxuKVxuIiwibGV0IGlkID0gMDtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZUxmbyB7XG4gIC8qKlxuICAgKiBAdG9kbyAtIHJldmVyc2UgYXJndW1lbnRzIG9yZGVyLCBpcyB3ZWlyZFxuICAgKi9cbiAgY29uc3RydWN0b3IoZGVmYXVsdHMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgdGhpcy5jaWQgPSBpZCsrO1xuICAgIHRoaXMucGFyYW1zID0ge307XG5cbiAgICB0aGlzLnN0cmVhbVBhcmFtcyA9IHtcbiAgICAgIGZyYW1lU2l6ZTogMSxcbiAgICAgIGZyYW1lUmF0ZTogMCxcbiAgICAgIHNvdXJjZVNhbXBsZVJhdGU6IDBcbiAgICB9O1xuXG4gICAgdGhpcy5wYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuXG4gICAgLy8gc3RyZWFtIGRhdGFcbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIHRoaXMub3V0RnJhbWUgPSBudWxsO1xuICAgIHRoaXMubWV0YURhdGEgPSB7fTtcbiAgfVxuXG4gIC8vIFdlYkF1ZGlvQVBJIGBjb25uZWN0YCBsaWtlIG1ldGhvZFxuICBjb25uZWN0KGNoaWxkKSB7XG4gICAgaWYgKHRoaXMuc3RyZWFtUGFyYW1zID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2Nhbm5vdCBjb25uZWN0IHRvIGEgZGVhZCBsZm8gbm9kZScpO1xuICAgIH1cblxuICAgIHRoaXMuY2hpbGRyZW4ucHVzaChjaGlsZCk7XG4gICAgY2hpbGQucGFyZW50ID0gdGhpcztcbiAgfVxuXG4gIC8vIGRlZmluZSBpZiBzdWZmaXNjaWVudFxuICBkaXNjb25uZWN0KCkge1xuICAgIC8vIHJlbW92ZSBpdHNlbGYgZnJvbSBwYXJlbnQgY2hpbGRyZW5cbiAgICBjb25zdCBpbmRleCA9IHRoaXMucGFyZW50LmNoaWxkcmVuLmluZGV4T2YodGhpcyk7XG4gICAgdGhpcy5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICAvLyB0aGlzLnBhcmVudCA9IG51bGw7XG4gICAgLy8gdGhpcy5jaGlsZHJlbiA9IG51bGw7XG4gIH1cblxuICAvLyBpbml0aWFsaXplIHRoZSBjdXJyZW50IG5vZGUgc3RyZWFtIGFuZCBwcm9wYWdhdGUgdG8gaXQncyBjaGlsZHJlblxuICBpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zID0ge30sIG91dFN0cmVhbVBhcmFtcyA9IHt9KSB7XG4gICAgT2JqZWN0LmFzc2lnbih0aGlzLnN0cmVhbVBhcmFtcywgaW5TdHJlYW1QYXJhbXMsIG91dFN0cmVhbVBhcmFtcyk7XG5cbiAgICAvLyBjcmVhdGUgdGhlIGBvdXRGcmFtZWAgYXJyYXlCdWZmZXJcbiAgICB0aGlzLnNldHVwU3RyZWFtKCk7XG5cbiAgICAvLyBwcm9wYWdhdGUgaW5pdGlhbGl6YXRpb24gaW4gbGZvIGNoYWluXG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5jaGlsZHJlbltpXS5pbml0aWFsaXplKHRoaXMuc3RyZWFtUGFyYW1zKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogY3JlYXRlIHRoZSBvdXRwdXRGcmFtZSBhY2NvcmRpbmcgdG8gdGhlIGBzdHJlYW1QYXJhbXNgXG4gICAqL1xuICBzZXR1cFN0cmVhbSgpIHtcbiAgICBjb25zdCBmcmFtZVNpemUgPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cbiAgICBpZihmcmFtZVNpemUgPiAwKVxuICAgICAgdGhpcy5vdXRGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWVTaXplKTtcbiAgfVxuXG4gIC8vIHJlc2V0IGBvdXRGcmFtZWAgYW5kIGNhbGwgcmVzZXQgb24gY2hpbGRyZW5cbiAgcmVzZXQoKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5jaGlsZHJlbltpXS5yZXNldCgpO1xuICAgIH1cblxuICAgIC8vIHNpbmtzIGhhdmUgbm8gYG91dEZyYW1lYFxuICAgIGlmICghdGhpcy5vdXRGcmFtZSkgeyByZXR1cm4gfVxuXG4gICAgLy8gdGhpcy5vdXRGcmFtZS5maWxsKDApOyAvLyBwcm9iYWJseSBiZXR0ZXIgYnV0IGRvZXNuJ3Qgd29yayB5ZXRcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMub3V0RnJhbWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLm91dEZyYW1lW2ldID0gMDtcbiAgICB9XG4gIH1cblxuICAvLyBmaW5hbGl6ZSBzdHJlYW1cbiAgZmluYWxpemUoZW5kVGltZSkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5baV0uZmluYWxpemUoZW5kVGltZSk7XG4gICAgfVxuICB9XG5cbiAgLy8gZm9yd2FyZCB0aGUgY3VycmVudCBzdGF0ZSAodGltZSwgZnJhbWUsIG1ldGFEYXRhKSB0byBhbGwgdGhlIGNoaWxkcmVuXG4gIG91dHB1dCh0aW1lID0gdGhpcy50aW1lLCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWUsIG1ldGFEYXRhID0gdGhpcy5tZXRhRGF0YSkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5baV0ucHJvY2Vzcyh0aW1lLCBvdXRGcmFtZSwgbWV0YURhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8vIG1haW4gZnVuY3Rpb24gdG8gb3ZlcnJpZGUsIGRlZmF1bHRzIHRvIG5vb3BcbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgIHRoaXMub3V0RnJhbWUgPSBmcmFtZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICAvLyBjYWxsIGBkZXN0cm95YCBpbiBhbGwgaXQncyBjaGlsZHJlblxuICAgIGxldCBpbmRleCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGluZGV4LS0pIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5baW5kZXhdLmRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICAvLyBkZWxldGUgaXRzZWxmIGZyb20gdGhlIHBhcmVudCBub2RlXG4gICAgaWYgKHRoaXMucGFyZW50KSB7XG4gICAgICBjb25zdCBpbmRleCA9ICB0aGlzLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHRoaXMpO1xuICAgICAgdGhpcy5wYXJlbnQuY2hpbGRyZW4uc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICAvLyBjYW5ub3QgdXNlIGEgZGVhZCBvYmplY3QgYXMgcGFyZW50XG4gICAgdGhpcy5zdHJlYW1QYXJhbXMgPSBudWxsO1xuXG4gICAgLy8gY2xlYW4gaXQncyBvd24gcmVmZXJlbmNlcyAvIGRpc2Nvbm5lY3QgYXVkaW8gbm9kZXMgaWYgbmVlZGVkXG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4vYmFzZS1sZm8nO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIEJhc2VMZm9cbn07XG4iLCJleHBvcnQgeyBkZWZhdWx0IGFzIGNvcmUgfSBmcm9tICcuL2NvcmUnO1xuZXhwb3J0IHsgZGVmYXVsdCBhcyBzb3VyY2VzIH0gZnJvbSAnLi9zb3VyY2VzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgc2lua3MgfSBmcm9tICcuL3NpbmtzJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgb3BlcmF0b3JzIH0gZnJvbSAnLi9vcGVyYXRvcnMnO1xuIiwiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFdBVkUgTEZPIG1vZHVsZTogYmlxdWFkIGZpbHRlci5cbiAqIEBhdXRob3IgSmVhbi1QaGlsaXBwZS5MYW1iZXJ0QGlyY2FtLmZyLCBOb3JiZXJ0LlNjaG5lbGxAaXJjYW0uZnIsIHZpY3Rvci5zYWl6QGlyY2FtLmZyXG4gKiBAdmVyc2lvbiAwLjEuMFxuICpcbiAqIEBicmllZiAgQmlxdWFkIGZpbHRlciBhbmQgY29lZmZpY2llbnRzIGNhbGN1bGF0b3JcbiAqXG4gKiBCYXNlZCBvbiB0aGUgXCJDb29rYm9vayBmb3JtdWxhZSBmb3IgYXVkaW8gRVEgYmlxdWFkIGZpbHRlclxuICogY29lZmZpY2llbnRzXCIgYnkgUm9iZXJ0IEJyaXN0b3ctSm9obnNvblxuICpcbiAqL1xuXG4vKiB5KG4pID0gYjAgeChuKSArIGIxIHgobi0xKSArIGIyIHgobi0yKSAgKi9cbi8qICAgICAgICAgICAgICAgIC0gYTEgeChuLTEpIC0gYTIgeChuLTIpICAqL1xuXG4vKiBmMCBpcyBub3JtYWxpc2VkIGJ5IHRoZSBueXF1aXN0IGZyZXF1ZW5jeSAqL1xuLyogcSBtdXN0IGJlID4gMC4gKi9cbi8qIGdhaW4gbXVzdCBiZSA+IDAuIGFuZCBpcyBsaW5lYXIgKi9cblxuLyogd2hlbiB0aGVyZSBpcyBubyBnYWluIHBhcmFtZXRlciwgb25lIGNhbiBzaW1wbHkgbXVsdGlwbHkgdGhlIGJcbiAqIGNvZWZmaWNpZW50cyBieSBhIChsaW5lYXIpIGdhaW4gKi9cblxuLyogYTAgaXMgYWx3YXlzIDEuIGFzIGVhY2ggY29lZmZpY2llbnQgaXMgbm9ybWFsaXNlZCBieSBhMCwgaW5jbHVkaW5nIGEwICovXG5cbi8qIGExIGlzIGFbMF0gYW5kIGEyIGlzIGFbMV0gKi9cblxuaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cbnZhciBzaW4gPSBNYXRoLnNpbjtcbnZhciBjb3MgPSBNYXRoLmNvcztcbnZhciBNX1BJID0gTWF0aC5QSTtcbnZhciBzcXJ0ID0gTWF0aC5zcXJ0O1xuXG4vLyBjb2VmcyBjYWxjdWxhdGlvbnNcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vKiBMUEY6IEgocykgPSAxIC8gKHNeMiArIHMvUSArIDEpICovXG5mdW5jdGlvbiBsb3dwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcykge1xuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBhbHBoYSA9IHNpbih3MCkgLyAoMi4wICogcSk7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKDEuMCArIGFscGhhKTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhKSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9ICgoMS4wIC0gYykgKiAwLjUpICogYTBfaW52O1xuICBjb2Vmcy5iMSA9ICgxLjAgLSBjKSAqIGEwX2ludjtcbiAgY29lZnMuYjIgPSBjb2Vmcy5iMDtcbn1cblxuICAvKiBIUEY6IEgocykgPSBzXjIgLyAoc14yICsgcy9RICsgMSkgKi9cbmZ1bmN0aW9uIGhpZ2hwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcykge1xuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBhbHBoYSA9IHNpbih3MCkgLyAoMi4wICogcSk7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKDEuMCArIGFscGhhKTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhKSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9ICgoMS4wICsgYykgKiAwLjUpICogYTBfaW52O1xuICBjb2Vmcy5iMSA9ICgtMS4wIC0gYykgKiBhMF9pbnY7XG4gIGNvZWZzLmIyID0gY29lZnMuYjA7XG59XG5cbi8qIEJQRjogSChzKSA9IHMgLyAoc14yICsgcy9RICsgMSkgIChjb25zdGFudCBza2lydCBnYWluLCBwZWFrIGdhaW4gPSBRKSAqL1xuZnVuY3Rpb24gYmFuZHBhc3NfY29uc3RhbnRfc2tpcnRfY29lZnMoZjAsIHEsIGNvZWZzKSB7XG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIHMgPSBzaW4odzApO1xuICB2YXIgYWxwaGEgPSBzIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSAocyAqIDAuNSkgKiBhMF9pbnY7XG4gIGNvZWZzLmIxID0gMC4wO1xuICBjb2Vmcy5iMiA9IC1jb2Vmcy5iMDtcbn1cblxuLyogQlBGOiBIKHMpID0gKHMvUSkgLyAoc14yICsgcy9RICsgMSkgICAgICAoY29uc3RhbnQgMCBkQiBwZWFrIGdhaW4pICovXG5mdW5jdGlvbiBiYW5kcGFzc19jb25zdGFudF9wZWFrX2NvZWZzKGYwLCBxLCBjb2Vmcykge1xuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBhbHBoYSA9IHNpbih3MCkgLyAoMi4wICogcSk7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKDEuMCArIGFscGhhKTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhKSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9IGFscGhhICogYTBfaW52O1xuICBjb2Vmcy5iMSA9IDAuMDtcbiAgY29lZnMuYjIgPSAtY29lZnMuYjA7XG59XG5cbi8qIG5vdGNoOiBIKHMpID0gKHNeMiArIDEpIC8gKHNeMiArIHMvUSArIDEpICovXG5mdW5jdGlvbiBub3RjaF9jb2VmcyhmMCwgcSwgY29lZnMpIHtcbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSBhMF9pbnY7XG4gIGNvZWZzLmIxID0gY29lZnMuYTE7XG4gIGNvZWZzLmIyID0gY29lZnMuYjA7XG59XG5cbi8qIEFQRjogSChzKSA9IChzXjIgLSBzL1EgKyAxKSAvIChzXjIgKyBzL1EgKyAxKSAqL1xuZnVuY3Rpb24gYWxscGFzc19jb2VmcyhmMCwgcSwgY29lZnMpIHtcbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSBjb2Vmcy5hMjtcbiAgY29lZnMuYjEgPSBjb2Vmcy5hMTtcbiAgY29lZnMuYjIgPSAxLjA7XG59XG5cbi8qIHBlYWtpbmdFUTogSChzKSA9IChzXjIgKyBzKihBL1EpICsgMSkgLyAoc14yICsgcy8oQSpRKSArIDEpICovXG4vKiBBID0gc3FydCggMTBeKGRCZ2Fpbi8yMCkgKSA9IDEwXihkQmdhaW4vNDApICovXG4vKiBnYWluIGlzIGxpbmVhciBoZXJlICovXG5mdW5jdGlvbiBwZWFraW5nX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcykge1xuICB2YXIgZyA9IHNxcnQoZ2Fpbik7XG4gIHZhciBnX2ludiA9IDEuMCAvIGc7XG5cbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSAqIGdfaW52KTtcblxuICBjb2Vmcy5hMSA9ICgtMi4wICogYykgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKDEuMCAtIGFscGhhICogZ19pbnYpICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gKDEuMCArIGFscGhhICogZykgKiBhMF9pbnY7XG4gIGNvZWZzLmIxID0gY29lZnMuYTE7XG4gIGNvZWZzLmIyID0gKDEuMCAtIGFscGhhICogZykgKiBhMF9pbnY7XG59XG5cbi8qIGxvd1NoZWxmOiBIKHMpID0gQSAqIChzXjIgKyAoc3FydChBKS9RKSpzICsgQSkvKEEqc14yICsgKHNxcnQoQSkvUSkqcyArIDEpICovXG4vKiBBID0gc3FydCggMTBeKGRCZ2Fpbi8yMCkgKSA9IDEwXihkQmdhaW4vNDApICovXG4vKiBnYWluIGlzIGxpbmVhciBoZXJlICovXG5mdW5jdGlvbiBsb3dzaGVsZl9jb2VmcyhmMCwgcSwgZ2FpbiwgY29lZnMpIHtcbiAgdmFyIGcgPSBzcXJ0KGdhaW4pO1xuXG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIGFscGhhXzJfc3FydGcgPSBzaW4odzApICogc3FydChnKSAvIHEgO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICggKGcrMS4wKSArIChnLTEuMCkgKiBjICsgYWxwaGFfMl9zcXJ0Zyk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqICAgICAoIChnLTEuMCkgKyAoZysxLjApICogYyAgICAgICAgICAgICAgICApICkgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKCAgICAgICAgICAgICAoZysxLjApICsgKGctMS4wKSAqIGMgLSBhbHBoYV8yX3NxcnRnICApICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gKCAgICAgICBnICogKCAoZysxLjApIC0gKGctMS4wKSAqIGMgKyBhbHBoYV8yX3NxcnRnKSApICogYTBfaW52O1xuICBjb2Vmcy5iMSA9ICggMi4wICogZyAqICggKGctMS4wKSAtIChnKzEuMCkgKiBjICAgICAgICAgICAgICAgICkgKSAqIGEwX2ludjtcbiAgY29lZnMuYjIgPSAoICAgICAgIGcgKiAoIChnKzEuMCkgLSAoZy0xLjApICogYyAtIGFscGhhXzJfc3FydGcpICkgKiBhMF9pbnY7XG59XG5cbi8qIGhpZ2hTaGVsZjogSChzKSA9IEEgKiAoQSpzXjIgKyAoc3FydChBKS9RKSpzICsgMSkvKHNeMiArIChzcXJ0KEEpL1EpKnMgKyBBKSAqL1xuLyogQSA9IHNxcnQoIDEwXihkQmdhaW4vMjApICkgPSAxMF4oZEJnYWluLzQwKSAqL1xuLyogZ2FpbiBpcyBsaW5lYXIgaGVyZSAqL1xuZnVuY3Rpb24gaGlnaHNoZWxmX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcykge1xuICB2YXIgZyA9IHNxcnQoZ2Fpbik7XG5cbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGFfMl9zcXJ0ZyA9IHNpbih3MCkgKiBzcXJ0KGcpIC8gcSA7XG4gIHZhciBjID0gY29zKHcwKTtcblxuICB2YXIgYTBfaW52ID0gMS4wIC8gKCAoZysxLjApIC0gKGctMS4wKSAqIGMgKyBhbHBoYV8yX3NxcnRnKTtcblxuICBjb2Vmcy5hMSA9ICggMi4wICogICAgICggKGctMS4wKSAtIChnKzEuMCkgKiBjICAgICAgICAgICAgICAgICkgKSAqIGEwX2ludjtcbiAgY29lZnMuYTIgPSAoICAgICAgICAgICAgIChnKzEuMCkgLSAoZy0xLjApICogYyAtIGFscGhhXzJfc3FydGcgICkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSAoICAgICAgZyAqICggIChnKzEuMCkgKyAoZy0xLjApICogYyArIGFscGhhXzJfc3FydGcpICkgKiBhMF9pbnY7XG4gIGNvZWZzLmIxID0gKC0yLjAgKiBnICogKCAoZy0xLjApICsgKGcrMS4wKSAqIGMgICAgICAgICAgICAgICAgKSApICogYTBfaW52O1xuICBjb2Vmcy5iMiA9ICggICAgICBnICogKCAgKGcrMS4wKSArIChnLTEuMCkgKiBjIC0gYWxwaGFfMl9zcXJ0ZykgKSAqIGEwX2ludjtcbn1cblxuICAvKiBoZWxwZXIgKi9cbmZ1bmN0aW9uIGNhbGN1bGF0ZUNvZWZzKHR5cGUsIGYwLCBxLCBnYWluLCBjb2Vmcykge1xuXG4gIHN3aXRjaCh0eXBlKSB7XG4gICAgY2FzZSAnbG93cGFzcyc6XG4gICAgICBsb3dwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hpZ2hwYXNzJzpcbiAgICAgIGhpZ2hwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhbmRwYXNzX2NvbnN0YW50X3NraXJ0JzpcbiAgICAgIGJhbmRwYXNzX2NvbnN0YW50X3NraXJ0X2NvZWZzKGYwLCBxLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2JhbmRwYXNzX2NvbnN0YW50X3BlYWsnOlxuICAgICAgYmFuZHBhc3NfY29uc3RhbnRfcGVha19jb2VmcyhmMCwgcSwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdub3RjaCc6XG4gICAgICBub3RjaF9jb2VmcyhmMCwgcSwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdhbGxwYXNzJzpcbiAgICAgIGFsbHBhc3NfY29lZnMoZjAsIHEsIGNvZWZzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAncGVha2luZyc6XG4gICAgICBwZWFraW5nX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2xvd3NoZWxmJzpcbiAgICAgIGxvd3NoZWxmX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ2hpZ2hzaGVsZic6XG4gICAgICBoaWdoc2hlbGZfY29lZnMoZjAsIHEsIGdhaW4sIGNvZWZzKTtcbiAgICAgIGJyZWFrO1xuICB9XG5cbiAgLy8gYXBwbHkgZ2FpblxuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdsb3dwYXNzJzpcbiAgICBjYXNlICdoaWdocGFzcyc6XG4gICAgY2FzZSAnYmFuZHBhc3NfY29uc3RhbnRfc2tpcnQnOlxuICAgIGNhc2UgJ2JhbmRwYXNzX2NvbnN0YW50X3BlYWsnOlxuICAgIGNhc2UgJ25vdGNoJzpcbiAgICBjYXNlICdhbGxwYXNzJzpcbiAgICAgIGlmIChnYWluICE9IDEuMCkge1xuICAgICAgICBjb2Vmcy5iMCAqPSBnYWluO1xuICAgICAgICBjb2Vmcy5iMSAqPSBnYWluO1xuICAgICAgICBjb2Vmcy5iMiAqPSBnYWluO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgLyogZ2FpbiBpcyBhbHJlYWR5IGludGVncmF0ZWQgZm9yIHRoZSBmb2xsb3dpbmcgKi9cbiAgICBjYXNlICdwZWFraW5nJzpcbiAgICBjYXNlICdsb3dzaGVsZic6XG4gICAgY2FzZSAnaGlnaHNoZWxmJzpcbiAgICAgIGJyZWFrO1xuICB9XG59XG5cbi8qIGRpcmVjdCBmb3JtIEkgKi9cbi8qIGEwID0gMSwgYTEgPSBhWzBdLCBhMiA9IGFbMV0gKi9cbi8qIDQgc3RhdGVzIChpbiB0aGF0IG9yZGVyKTogeChuLTEpLCB4KG4tMiksIHkobi0xKSwgeShuLTIpICAqL1xuZnVuY3Rpb24gYmlxdWFkQXJyYXlEZjEoY29lZnMsIHN0YXRlLCBpbkZyYW1lLCBvdXRGcmFtZSwgc2l6ZSkge1xuICBmb3IobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgdmFyIHkgPSBjb2Vmcy5iMCAqIGluRnJhbWVbaV1cbiAgICAgICAgICArIGNvZWZzLmIxICogc3RhdGUueG5fMVtpXSArIGNvZWZzLmIyICogc3RhdGUueG5fMltpXVxuICAgICAgICAgIC0gY29lZnMuYTEgKiBzdGF0ZS55bl8xW2ldIC0gY29lZnMuYTIgKiBzdGF0ZS55bl8yW2ldO1xuXG4gICAgb3V0RnJhbWVbaV0gPSB5O1xuXG4gICAgLy8gdXBkYXRlIHN0YXRlc1xuICAgIHN0YXRlLnhuXzJbaV0gPSBzdGF0ZS54bl8xW2ldO1xuICAgIHN0YXRlLnhuXzFbaV0gPSBpbkZyYW1lW2ldO1xuXG4gICAgc3RhdGUueW5fMltpXSA9IHN0YXRlLnluXzFbaV07XG4gICAgc3RhdGUueW5fMVtpXSA9IHk7XG4gIH1cbn1cblxuLyogdHJhbnNwb3NlZCBkaXJlY3QgZm9ybSBJSSAqL1xuLyogYTAgPSAxLCBhMSA9IGFbMF0sIGEyID0gYVsxXSAqL1xuLyogMiBzdGF0ZXMgKi9cbmZ1bmN0aW9uIGJpcXVhZEFycmF5RGYyKGNvZWZzLCBzdGF0ZSwgaW5GcmFtZSwgb3V0RnJhbWUsIHNpemUpIHtcbiAgZm9yKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIG91dEZyYW1lW2ldID0gY29lZnMuYjAgKiBpbkZyYW1lW2ldICsgc3RhdGUueG5fMVtpXTtcblxuICAgIC8vIHVwZGF0ZSBzdGF0ZXNcbiAgICBzdGF0ZS54bl8xW2ldID0gY29lZnMuYjEgKiBpbkZyYW1lW2ldIC0gY29lZnMuYTFbaV0gKiBvdXRGcmFtZVtpXSArIHN0YXRlLnhuXzJbaV07XG4gICAgc3RhdGUueG5fMltpXSA9IGNvZWZzLmIyICogaW5GcmFtZVtpXSAtIGNvZWZzLmEyW2ldICogb3V0RnJhbWVbaV07XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmlxdWFkIGV4dGVuZHMgQmFzZUxmbyB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIGZpbHRlclR5cGU6J2xvd3Bhc3MnLFxuICAgICAgZjA6IDEuMCxcbiAgICAgIGdhaW46IDEuMCxcbiAgICAgIHE6IDEuMFxuICAgIH0sIG9wdGlvbnMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpO1xuXG4gICAgY29uc3QgZnJhbWVSYXRlID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlO1xuXG4gICAgLy8gaWYgbm8gZnJhbWVSYXRlIG9yIGZyYW1lcmF0ZSBpcyAwIHdlIHNoYWxsIGhhbHQhXG4gICAgaWYgKCFmcmFtZVJhdGUgfHwgZnJhbWVSYXRlIDw9IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBPcGVyYXRvciByZXF1aXJlcyBhIGZyYW1lUmF0ZSBoaWdoZXIgdGhhbiAwLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG5vcm1GMCA9IHRoaXMucGFyYW1zLmYwIC8gZnJhbWVSYXRlO1xuICAgIGNvbnN0IGdhaW4gPSB0aGlzLnBhcmFtcy5nYWluO1xuICAgIGxldCBxO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLnEpICB7IHEgPSB0aGlzLnBhcmFtcy5xOyB9XG4gICAgaWYgKHRoaXMucGFyYW1zLmJ3KSB7IHEgPSB0aGlzLnBhcmFtcy5mMCAvIHRoaXMucGFyYW1zLmJ3OyB9XG5cbiAgICB0aGlzLmNvZWZzID0ge1xuICAgICAgYjA6IDAsXG4gICAgICBiMTogMCxcbiAgICAgIGIyOiAwLFxuICAgICAgYTE6IDAsXG4gICAgICBhMjogMFxuICAgIH07XG5cbiAgICBjb25zdCBmcmFtZVNpemUgPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgeG5fMTogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpLFxuICAgICAgeG5fMjogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpLFxuICAgICAgeW5fMTogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpLFxuICAgICAgeW5fMjogbmV3IEZsb2F0MzJBcnJheShmcmFtZVNpemUpXG4gICAgfTtcblxuICAgIGNhbGN1bGF0ZUNvZWZzKHRoaXMucGFyYW1zLmZpbHRlclR5cGUsIG5vcm1GMCwgcSwgZ2FpbiwgdGhpcy5jb2Vmcyk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGJpcXVhZEFycmF5RGYxKHRoaXMuY29lZnMsIHRoaXMuc3RhdGUsIGZyYW1lLCB0aGlzLm91dEZyYW1lLCBmcmFtZS5sZW5ndGgpO1xuICAgIC8vIGNvbnNvbGUubG9nKHRoaXMub3V0RnJhbWUpO1xuICAgIHRoaXMub3V0cHV0KHRpbWUsIHRoaXMub3V0RnJhbWUsIG1ldGFEYXRhKTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5pbXBvcnQganNmZnQgZnJvbSAnanNmZnQnO1xuaW1wb3J0IGNvbXBsZXhBcnJheSBmcm9tICdqc2ZmdC9saWIvY29tcGxleF9hcnJheSc7XG5pbXBvcnQgaW5pdFdpbmRvdyBmcm9tICcuLi91dGlscy9mZnQtd2luZG93cyc7XG5cbi8vIGNvbnN0IFBJICAgPSBNYXRoLlBJO1xuLy8gY29uc3QgY29zICA9IE1hdGguY29zO1xuLy8gY29uc3Qgc2luICA9IE1hdGguc2luO1xuY29uc3Qgc3FydCA9IE1hdGguc3FydDtcblxuY29uc3QgaXNQb3dlck9mVHdvID0gZnVuY3Rpb24obnVtYmVyKSB7XG4gIHdoaWxlICgobnVtYmVyICUgMiA9PT0gMCkgJiYgbnVtYmVyID4gMSkge1xuICAgIG51bWJlciA9IG51bWJlciAvIDI7XG4gIH1cblxuICByZXR1cm4gbnVtYmVyID09PSAxO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGZnQgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIGZmdFNpemU6IDEwMjQsXG4gICAgICB3aW5kb3dOYW1lOiAnaGFubicsXG4gICAgICBvdXRUeXBlOiAnbWFnbml0dWRlJ1xuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy53aW5kb3dTaXplID0gdGhpcy5wYXJhbXMuZmZ0U2l6ZTtcblxuICAgIGlmICghaXNQb3dlck9mVHdvKHRoaXMucGFyYW1zLmZmdFNpemUpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZmdFNpemUgbXVzdCBiZSBhIHBvd2VyIG9mIHR3bycpO1xuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICAvLyBzZXQgb3V0cHV0IGZyYW1lU2l6ZVxuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMsIHtcbiAgICAgIGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuZmZ0U2l6ZSAvIDIgKyAxLFxuICAgIH0pO1xuXG4gICAgY29uc3QgaW5GcmFtZVNpemUgPSBpblN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG4gICAgY29uc3QgZmZ0U2l6ZSA9IHRoaXMucGFyYW1zLmZmdFNpemU7XG5cbiAgICB0aGlzLndpbmRvd1NpemUgPSBmZnRTaXplO1xuXG4gICAgaWYoaW5GcmFtZVNpemUgPCBmZnRTaXplKVxuICAgICAgdGhpcy53aW5kb3dTaXplID0gaW5GcmFtZVNpemU7XG5cbiAgICAvLyByZWZlcmVuY2VzIHRvIHBvcHVsYXRlIGluIHdpbmRvdyBmdW5jdGlvbnNcbiAgICB0aGlzLm5vcm1hbGl6ZUNvZWZzID0geyBsaW5lYXI6IDAsIHBvd2VyOiAwIH07XG4gICAgdGhpcy53aW5kb3cgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMud2luZG93U2l6ZSk7XG5cbiAgICAvLyBpbml0IHRoZSBjb21wbGV4IGFycmF5IHRvIHJldXNlIGZvciB0aGUgRkZUXG4gICAgdGhpcy5jb21wbGV4RnJhbWUgPSBuZXcgY29tcGxleEFycmF5LkNvbXBsZXhBcnJheShmZnRTaXplKTtcblxuICAgIGluaXRXaW5kb3coXG4gICAgICB0aGlzLnBhcmFtcy53aW5kb3dOYW1lLFxuICAgICAgdGhpcy53aW5kb3csIC8vIGJ1ZmZlciB0byBwb3B1bGF0ZSB3aXRoIHRoZSB3aW5kb3dcbiAgICAgIHRoaXMud2luZG93U2l6ZSwgLy8gYnVmZmVyLmxlbmd0aFxuICAgICAgdGhpcy5ub3JtYWxpemVDb2VmcyAvLyBhbiBvYmplY3QgdG8gcG9wdWxhdGUgd2l0aCB0aGUgbm9ybWFsaXphdGlvbiBjb2Vmc1xuICAgICk7XG5cbiAgICAvLyBBcnJheUJ1ZmZlcnMgdG8gcmV1c2UgaW4gcHJvY2Vzc1xuICAgIHRoaXMud2luZG93ZWRGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkoZmZ0U2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogdGhlIGZpcnN0IGNhbGwgb2YgdGhpcyBtZXRob2QgY2FuIGJlIHF1aXRlIGxvbmcgKH40bXMpLFxuICAgKiB0aGUgc3Vic2VxdWVudCBvbmVzIGFyZSBmYXN0ZXIgKH4wLjVtcykgZm9yIGZmdFNpemUgPSAxMDI0XG4gICAqL1xuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGNvbnN0IHdpbmRvd1NpemUgPSB0aGlzLndpbmRvd1NpemU7XG4gICAgY29uc3Qgb3V0RnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIGNvbnN0IGZmdFNpemUgPSB0aGlzLnBhcmFtcy5mZnRTaXplO1xuXG4gICAgLy8gYXBwbHkgd2luZG93IG9uIGZyYW1lXG4gICAgLy8gPT4gYHRoaXMud2luZG93YCBhbmQgYGZyYW1lYCBoYXZlIHRoZSBzYW1lIGxlbmd0aFxuICAgIC8vID0+IGlmIGB0aGlzLndpbmRvd2VkRnJhbWVgIGlzIGJpZ2dlciwgaXQncyBmaWxsZWQgd2l0aCB6ZXJvXG4gICAgLy8gYW5kIHdpbmRvdyBkb24ndCBhcHBseSB0aGVyZVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2luZG93U2l6ZTsgaSsrKVxuICAgICAgdGhpcy53aW5kb3dlZEZyYW1lW2ldID0gZnJhbWVbaV0gKiB0aGlzLndpbmRvd1tpXTtcblxuICAgIGlmKHdpbmRvd1NpemUgPCBmZnRTaXplKVxuICAgICAgdGhpcy53aW5kb3dlZEZyYW1lLmZpbGwoMCwgd2luZG93U2l6ZSk7XG5cbiAgICAvLyBGRlRcbiAgICAvLyB0aGlzLmNvbXBsZXhGcmFtZSA9IG5ldyBjb21wbGV4QXJyYXkuQ29tcGxleEFycmF5KGZmdFNpemUpO1xuICAgIC8vIHJldXNlIHRoZSBzYW1lIGNvbXBsZXhGcmFtZVxuICAgIHRoaXMuY29tcGxleEZyYW1lLm1hcCgodmFsdWUsIGkpID0+IHtcbiAgICAgIHZhbHVlLnJlYWwgPSB0aGlzLndpbmRvd2VkRnJhbWVbaV07XG4gICAgICB2YWx1ZS5pbWFnID0gMDtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbXBsZXhTcGVjdHJ1bSA9IHRoaXMuY29tcGxleEZyYW1lLkZGVCgpO1xuICAgIGNvbnN0IHNjYWxlID0gMSAvIGZmdFNpemU7XG5cbiAgICAvLyBEQyBpbmRleFxuICAgIGNvbnN0IHJlYWxEYyA9IGNvbXBsZXhTcGVjdHJ1bS5yZWFsWzBdO1xuICAgIGNvbnN0IGltYWdEYyA9IGNvbXBsZXhTcGVjdHJ1bS5pbWFnWzBdO1xuICAgIHRoaXMub3V0RnJhbWVbMF0gPSAocmVhbERjICogcmVhbERjICsgaW1hZ0RjICogaW1hZ0RjKSAqIHNjYWxlO1xuXG4gICAgLy8gTnF1eXN0IGluZGV4XG4gICAgY29uc3QgcmVhbE55ID0gY29tcGxleFNwZWN0cnVtLnJlYWxbZmZ0U2l6ZSAvIDJdO1xuICAgIGNvbnN0IGltYWdOeSA9IGNvbXBsZXhTcGVjdHJ1bS5pbWFnW2ZmdFNpemUgLyAyXTtcbiAgICB0aGlzLm91dEZyYW1lW2ZmdFNpemUgLyAyXSA9IChyZWFsTnkgKiByZWFsTnkgKyBpbWFnTnkgKiBpbWFnTnkpICogc2NhbGU7XG5cbiAgICAvLyBwb3dlciBzcGVjdHJ1bVxuICAgIGZvciAobGV0IGkgPSAxLCBqID0gZmZ0U2l6ZSAtIDE7IGkgPCBmZnRTaXplIC8gMjsgaSsrLCBqLS0pIHtcbiAgICAgIGNvbnN0IHJlYWwgPSBjb21wbGV4U3BlY3RydW0ucmVhbFtpXSArIGNvbXBsZXhTcGVjdHJ1bS5yZWFsW2pdO1xuICAgICAgY29uc3QgaW1hZyA9IGNvbXBsZXhTcGVjdHJ1bS5pbWFnW2ldIC0gY29tcGxleFNwZWN0cnVtLmltYWdbal07XG5cbiAgICAgIHRoaXMub3V0RnJhbWVbaV0gPSAocmVhbCAqIHJlYWwgKyBpbWFnICogaW1hZykgKiBzY2FsZTtcbiAgICB9XG5cbiAgICAvLyBtYWduaXR1ZGUgc3BlY3RydW1cbiAgICAvLyBATk9URSBtYXliZSBjaGVjayBob3cgdG8gcmVtb3ZlIHRoaXMgbG9vcCBwcm9wZXJseVxuICAgIGlmICh0aGlzLnBhcmFtcy5vdXRUeXBlID09PSAnbWFnbml0dWRlJykge1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRGcmFtZVNpemU7IGkrKykge1xuICAgICAgICB0aGlzLm91dEZyYW1lW2ldID0gc3FydCh0aGlzLm91dEZyYW1lW2ldKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLm91dHB1dCh0aW1lKTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRnJhbWVyIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBmcmFtZVNpemU6IDUxMixcbiAgICAgIGNlbnRlcmVkVGltZVRhZzogZmFsc2VcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuZnJhbWVJbmRleCA9IDA7XG4gIH1cblxuICBpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKSB7XG4gICAgaWYgKCF0aGlzLnBhcmFtcy5ob3BTaXplKVxuICAgICAgdGhpcy5wYXJhbXMuaG9wU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTsgLy8gaG9wU2l6ZSBkZWZhdWx0cyB0byBmcmFtZVNpemVcblxuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMsIHtcbiAgICAgIGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuZnJhbWVTaXplLFxuICAgICAgZnJhbWVSYXRlOiBpblN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlIC8gdGhpcy5wYXJhbXMuaG9wU2l6ZSxcbiAgICB9KTtcbiAgfVxuXG4gIC8vIEBOT1RFIG11c3QgYmUgdGVzdGVkXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuZnJhbWVJbmRleCA9IDA7XG4gICAgc3VwZXIucmVzZXQoKTtcbiAgfVxuXG4gIGZpbmFsaXplKGVuZFRpbWUpIHtcbiAgICBpZiAodGhpcy5mcmFtZUluZGV4ID4gMCkge1xuICAgICAgdGhpcy5vdXRGcmFtZS5maWxsKDAsIHRoaXMuZnJhbWVJbmRleCk7XG4gICAgICB0aGlzLm91dHB1dCgpO1xuICAgIH1cblxuICAgIHN1cGVyLmZpbmFsaXplKGVuZFRpbWUpO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBibG9jaywgbWV0YURhdGEpIHtcbiAgICBjb25zdCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG4gICAgY29uc3Qgc2FtcGxlUmF0ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGU7XG4gICAgY29uc3Qgc2FtcGxlUGVyaW9kID0gMSAvIHNhbXBsZVJhdGU7XG4gICAgY29uc3QgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIGNvbnN0IGJsb2NrU2l6ZSA9IGJsb2NrLmxlbmd0aDtcbiAgICBjb25zdCBob3BTaXplID0gdGhpcy5wYXJhbXMuaG9wU2l6ZTtcbiAgICBsZXQgZnJhbWVJbmRleCA9IHRoaXMuZnJhbWVJbmRleDtcbiAgICBsZXQgYmxvY2tJbmRleCA9IDA7XG5cbiAgICB3aGlsZSAoYmxvY2tJbmRleCA8IGJsb2NrU2l6ZSkge1xuICAgICAgbGV0IG51bVNraXAgPSAwO1xuXG4gICAgICAvLyBza2lwIGJsb2NrIHNhbXBsZXMgZm9yIG5lZ2F0aXZlIGZyYW1lSW5kZXhcbiAgICAgIGlmIChmcmFtZUluZGV4IDwgMCkge1xuICAgICAgICBudW1Ta2lwID0gLWZyYW1lSW5kZXg7XG4gICAgICB9XG5cbiAgICAgIGlmIChudW1Ta2lwIDwgYmxvY2tTaXplKSB7XG4gICAgICAgIGJsb2NrSW5kZXggKz0gbnVtU2tpcDsgLy8gc2tpcCBibG9jayBzZWdtZW50XG5cbiAgICAgICAgLy8gY2FuIGNvcHkgYWxsIHRoZSByZXN0IG9mIHRoZSBpbmNvbWluZyBibG9ja1xuICAgICAgICBsZXQgbnVtQ29weSA9IGJsb2NrU2l6ZSAtIGJsb2NrSW5kZXg7XG5cbiAgICAgICAgLy8gY29ubm90IGNvcHkgbW9yZSB0aGFuIHdoYXQgZml0cyBpbnRvIHRoZSBmcmFtZVxuICAgICAgICBjb25zdCBtYXhDb3B5ID0gZnJhbWVTaXplIC0gZnJhbWVJbmRleDtcblxuICAgICAgICBpZiAobnVtQ29weSA+PSBtYXhDb3B5KSB7XG4gICAgICAgICAgbnVtQ29weSA9IG1heENvcHk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjb3B5IGJsb2NrIHNlZ21lbnQgaW50byBmcmFtZVxuICAgICAgICBjb25zdCBjb3B5ID0gYmxvY2suc3ViYXJyYXkoYmxvY2tJbmRleCwgYmxvY2tJbmRleCArIG51bUNvcHkpO1xuXG4gICAgICAgIG91dEZyYW1lLnNldChjb3B5LCBmcmFtZUluZGV4KTtcblxuICAgICAgICAvLyBhZHZhbmNlIGJsb2NrIGFuZCBmcmFtZSBpbmRleFxuICAgICAgICBibG9ja0luZGV4ICs9IG51bUNvcHk7XG4gICAgICAgIGZyYW1lSW5kZXggKz0gbnVtQ29weTtcblxuICAgICAgICAvLyBzZW5kIGZyYW1lIHdoZW4gY29tcGxldGVkXG4gICAgICAgIGlmIChmcmFtZUluZGV4ID09PSBmcmFtZVNpemUpIHtcbiAgICAgICAgICAvLyBkZWZpbmUgdGltZSB0YWcgZm9yIHRoZSBvdXRGcmFtZSBhY2NvcmRpbmcgdG8gY29uZmlndXJhdGlvblxuICAgICAgICAgIGlmICh0aGlzLnBhcmFtcy5jZW50ZXJlZFRpbWVUYWcpIHtcbiAgICAgICAgICAgIHRoaXMudGltZSA9IHRpbWUgKyAoYmxvY2tJbmRleCAtIGZyYW1lU2l6ZSAvIDIpICogc2FtcGxlUGVyaW9kO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRpbWUgPSB0aW1lICsgKGJsb2NrSW5kZXggLSBmcmFtZVNpemUpICogc2FtcGxlUGVyaW9kO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIGZvcndhcmQgbWV0YURhdGEgP1xuICAgICAgICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgICAgICAgIC8vIGZvcndhcmQgdG8gbmV4dCBub2Rlc1xuICAgICAgICAgIHRoaXMub3V0cHV0KCk7XG5cbiAgICAgICAgICAvLyBzaGlmdCBmcmFtZSBsZWZ0XG4gICAgICAgICAgaWYgKGhvcFNpemUgPCBmcmFtZVNpemUpIHtcbiAgICAgICAgICAgIG91dEZyYW1lLnNldChvdXRGcmFtZS5zdWJhcnJheShob3BTaXplLCBmcmFtZVNpemUpLCAwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBmcmFtZUluZGV4IC09IGhvcFNpemU7IC8vIGhvcCBmb3J3YXJkXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHNraXAgZW50aXJlIGJsb2NrXG4gICAgICAgIGNvbnN0IGJsb2NrUmVzdCA9IGJsb2NrU2l6ZSAtIGJsb2NrSW5kZXg7XG4gICAgICAgIGZyYW1lSW5kZXggKz0gYmxvY2tSZXN0O1xuICAgICAgICBibG9ja0luZGV4ICs9IGJsb2NrUmVzdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmZyYW1lSW5kZXggPSBmcmFtZUluZGV4O1xuICB9XG59XG4iLCJpbXBvcnQgQmlxdWFkIGZyb20gJy4vYmlxdWFkJztcbmltcG9ydCBGZnQgZnJvbSAnLi9mZnQnO1xuaW1wb3J0IEZyYW1lciBmcm9tICcuL2ZyYW1lcic7XG5pbXBvcnQgTWFnbml0dWRlIGZyb20gJy4vbWFnbml0dWRlJztcbmltcG9ydCBNYXggZnJvbSAnLi9tYXgnO1xuaW1wb3J0IE1pbk1heCBmcm9tICcuL21pbi1tYXgnO1xuaW1wb3J0IE1vdmluZ0F2ZXJhZ2UgZnJvbSAnLi9tb3ZpbmctYXZlcmFnZSc7XG5pbXBvcnQgTW92aW5nTWVkaWFuIGZyb20gJy4vbW92aW5nLW1lZGlhbic7XG5pbXBvcnQgTm9vcCBmcm9tICcuL25vb3AnO1xuaW1wb3J0IE9wZXJhdG9yIGZyb20gJy4vb3BlcmF0b3InO1xuaW1wb3J0IFNlZ21lbnRlciBmcm9tICcuL3NlZ21lbnRlcic7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgQmlxdWFkLFxuICBGZnQsXG4gIEZyYW1lcixcbiAgTWFnbml0dWRlLFxuICBNYXgsXG4gIE1pbk1heCxcbiAgTW92aW5nQXZlcmFnZSxcbiAgTW92aW5nTWVkaWFuLFxuICBOb29wLFxuICBPcGVyYXRvcixcbiAgU2VnbWVudGVyLFxufTtcbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hZ25pdHVkZSBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgbm9ybWFsaXplOiB0cnVlLFxuICAgICAgcG93ZXI6IGZhbHNlLFxuICAgIH0sIG9wdGlvbnMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMsIHtcbiAgICAgIGZyYW1lU2l6ZTogMSxcbiAgICB9KTtcbiAgfVxuXG4gIGlucHV0QXJyYXkoZnJhbWUpIHtcbiAgICBjb25zdCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG4gICAgY29uc3QgZnJhbWVTaXplID0gZnJhbWUubGVuZ3RoO1xuICAgIGxldCBzdW0gPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFtZVNpemU7IGkrKylcbiAgICAgIHN1bSArPSAoZnJhbWVbaV0gKiBmcmFtZVtpXSk7XG5cbiAgICBsZXQgbWFnID0gc3VtO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLm5vcm1hbGl6ZSlcbiAgICAgIG1hZyAvPSBmcmFtZVNpemU7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLnBvd2VyKVxuICAgICAgbWFnID0gTWF0aC5zcXJ0KG1hZyk7XG5cbiAgICBvdXRGcmFtZVswXSA9IG1hZztcblxuICAgIHJldHVybiBvdXRGcmFtZTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgdGhpcy5pbnB1dEFycmF5KGZyYW1lKTtcbiAgICB0aGlzLm91dHB1dCh0aW1lLCB0aGlzLm91dEZyYW1lLCBtZXRhRGF0YSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXggZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMsIHtcbiAgICAgIGZyYW1lU2l6ZTogMSxcbiAgICB9KTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm91dEZyYW1lWzBdID0gTWF0aC5tYXguYXBwbHkobnVsbCwgZnJhbWUpO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbiBhbmQgbWF4IHZhbHVlcyBmcm9tIGVhY2ggZnJhbWVcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWluTWF4IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCB7XG4gICAgICBmcmFtZVNpemU6IDIsXG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGxldCBtaW4gPSArSW5maW5pdHk7XG4gICAgbGV0IG1heCA9IC1JbmZpbml0eTtcblxuICAgIGZvciAobGV0IGkgPSAwLCBsID0gZnJhbWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IGZyYW1lW2ldO1xuICAgICAgaWYgKHZhbHVlIDwgbWluKSB7IG1pbiA9IHZhbHVlOyB9XG4gICAgICBpZiAodmFsdWUgPiBtYXgpIHsgbWF4ID0gdmFsdWU7IH1cbiAgICB9XG5cbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgIHRoaXMub3V0RnJhbWVbMF0gPSBtaW47XG4gICAgdGhpcy5vdXRGcmFtZVsxXSA9IG1heDtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuLy8gTk9URVM6XG4vLyAtIGFkZCAnc3ltZXRyaWNhbCcgb3B0aW9uIChob3cgdG8gZGVhbCB3aXRoIHZhbHVlcyBiZXR3ZWVuIGZyYW1lcyA/KSA/XG4vLyAtIGNhbiB3ZSBpbXByb3ZlIGFsZ29yaXRobSBpbXBsZW1lbnRhdGlvbiA/XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb3ZpbmdBdmVyYWdlIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBvcmRlcjogMTAsXG4gICAgICBmaWxsOiAwLFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5zdW0gPSBudWxsO1xuICAgIHRoaXMucmluZ0J1ZmZlciA9IG51bGw7XG4gICAgdGhpcy5yaW5nSW5kZXggPSAwO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpO1xuXG4gICAgdGhpcy5yaW5nQnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnBhcmFtcy5vcmRlciAqIHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSk7XG5cbiAgICBpZiAodGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID4gMSlcbiAgICAgIHRoaXMuc3VtID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuc3VtID0gMDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHN1cGVyLnJlc2V0KCk7XG5cbiAgICB0aGlzLnJpbmdCdWZmZXIuZmlsbCh0aGlzLnBhcmFtcy5maWxsKTtcblxuICAgIGNvbnN0IGZpbGxTdW0gPSB0aGlzLnBhcmFtcy5vcmRlciAqIHRoaXMucGFyYW1zLmZpbGw7XG5cbiAgICBpZiAodGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID4gMSlcbiAgICAgIHRoaXMuc3VtLmZpbGwoZmlsbFN1bSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zdW0gPSBmaWxsU3VtO1xuXG4gICAgdGhpcy5yaW5nSW5kZXggPSAwO1xuICB9XG5cbiAgaW5wdXRTY2FsYXIodmFsdWUpIHtcbiAgICBjb25zdCBvcmRlciA9IHRoaXMucGFyYW1zLm9yZGVyO1xuICAgIGNvbnN0IHJpbmdJbmRleCA9IHRoaXMucmluZ0luZGV4O1xuICAgIGNvbnN0IHJpbmdCdWZmZXIgPSB0aGlzLnJpbmdCdWZmZXI7XG4gICAgbGV0IHN1bSA9IHRoaXMuc3VtO1xuXG4gICAgc3VtIC09IHJpbmdCdWZmZXJbcmluZ0luZGV4XTtcbiAgICBzdW0gKz0gdmFsdWU7XG5cbiAgICB0aGlzLnN1bSA9IHN1bTtcbiAgICB0aGlzLnJpbmdCdWZmZXJbcmluZ0luZGV4XSA9IHZhbHVlO1xuICAgIHRoaXMucmluZ0luZGV4ID0gKHJpbmdJbmRleCArIDEpICUgb3JkZXI7XG5cbiAgICByZXR1cm4gc3VtIC8gb3JkZXI7XG4gIH1cblxuICBpbnB1dEFycmF5KGZyYW1lKSB7XG4gICAgY29uc3Qgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lO1xuICAgIGNvbnN0IG9yZGVyID0gdGhpcy5wYXJhbXMub3JkZXI7XG4gICAgY29uc3QgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIGNvbnN0IHJpbmdJbmRleCA9IHRoaXMucmluZ0luZGV4O1xuICAgIGNvbnN0IHJpbmdPZmZzZXQgPSByaW5nSW5kZXggKiBmcmFtZVNpemU7XG4gICAgY29uc3QgcmluZyA9IHRoaXMucmluZ0J1ZmZlcjtcbiAgICBjb25zdCBzdW0gPSB0aGlzLnN1bTtcbiAgICBjb25zdCBzY2FsZSA9IDEgLyBvcmRlcjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhbWVTaXplOyBpKyspIHtcbiAgICAgIGNvbnN0IHJpbmdCdWZmZXJJbmRleCA9IHJpbmdPZmZzZXQgKyBpO1xuICAgICAgY29uc3QgdmFsdWUgPSBmcmFtZVtpXTtcbiAgICAgIGxldCBzdW0gPSBzdW1baV07XG5cbiAgICAgIHN1bSAtPSByaW5nQnVmZmVyW3JpbmdCdWZmZXJJbmRleF07XG4gICAgICBzdW0gKz0gdmFsdWU7XG5cbiAgICAgIG91dEZyYW1lW2ldID0gc3VtICogc2NhbGU7XG5cbiAgICAgIHRoaXMuc3VtW2ldID0gc3VtO1xuICAgICAgdGhpcy5yaW5nQnVmZmVyW3JpbmdCdWZmZXJJbmRleF0gPSB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLnJpbmdJbmRleCA9IChyaW5nSW5kZXggKyAxKSAlIG9yZGVyO1xuXG4gICAgcmV0dXJuIG91dEZyYW1lO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBpZih0aGlzLmZyYW1lU2l6ZSA+IDEpXG4gICAgICB0aGlzLmlucHV0QXJyYXkoZnJhbWUpO1xuICAgIGVsc2VcbiAgICAgIHRoaXMub3V0RnJhbWVbMF0gPSB0aGlzLmlucHV0U2NhbGFyKGZyYW1lWzBdKTtcblxuICAgIGlmKHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUpXG4gICAgICB0aW1lIC09ICgwLjUgKiAodGhpcy5wYXJhbXMub3JkZXIgLSAxKSAvIHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUpO1xuXG4gICAgdGhpcy5vdXRwdXQodGltZSwgdGhpcy5vdXRGcmFtZSwgbWV0YURhdGEpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW92aW5nTWVkaWFuIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBvcmRlcjogOSxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIGlmICh0aGlzLnBhcmFtcy5vcmRlciAlIDIgPT09IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignb3JkZXIgbXVzdCBiZSBhbiBvZGQgbnVtYmVyJyk7XG4gICAgfVxuXG4gICAgdGhpcy5xdWV1ZSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wYXJhbXMub3JkZXIpO1xuICAgIHRoaXMuc29ydGVyID0gW107XG4gIH1cblxuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuXG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLnF1ZXVlLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5xdWV1ZVtpXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBjb25zdCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG4gICAgY29uc3QgZnJhbWVTaXplID0gZnJhbWUubGVuZ3RoO1xuICAgIGNvbnN0IG9yZGVyID0gdGhpcy5wYXJhbXMub3JkZXI7XG4gICAgY29uc3QgcHVzaEluZGV4ID0gdGhpcy5wYXJhbXMub3JkZXIgLSAxO1xuICAgIGNvbnN0IG1lZGlhbkluZGV4ID0gTWF0aC5mbG9vcihvcmRlciAvIDIpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmcmFtZVNpemU7IGkrKykge1xuICAgICAgY29uc3QgY3VycmVudCA9IGZyYW1lW2ldO1xuICAgICAgLy8gdXBkYXRlIHF1ZXVlXG4gICAgICB0aGlzLnF1ZXVlLnNldCh0aGlzLnF1ZXVlLnN1YmFycmF5KDEpLCAwKTtcbiAgICAgIHRoaXMucXVldWVbcHVzaEluZGV4XSA9IGN1cnJlbnQ7XG4gICAgICAvLyBnZXQgbWVkaWFuXG4gICAgICB0aGlzLnNvcnRlciA9IEFycmF5LmZyb20odGhpcy5xdWV1ZS52YWx1ZXMoKSk7XG4gICAgICB0aGlzLnNvcnRlci5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG5cbiAgICAgIG91dEZyYW1lW2ldID0gdGhpcy5zb3J0ZXJbbWVkaWFuSW5kZXhdO1xuICAgIH1cblxuICAgIHRoaXMub3V0cHV0KHRpbWUsIG91dEZyYW1lLCBtZXRhRGF0YSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG4vKipcbiAqIGEgTm9PcCBMZm9cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTm9vcCBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIHRoaXMub3V0RnJhbWUuc2V0KGZyYW1lLCAwKTtcbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG4vKipcbiAqIGFwcGx5IGEgZ2l2ZW4gZnVuY3Rpb24gb24gZWFjaCBmcmFtZVxuICpcbiAqIEBTSUdOQVRVUkUgc2NhbGFyIGNhbGxiYWNrXG4gKiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGZyYW1lKSB7XG4gKiAgIHJldHVybiBkb1NvbWV0aGluZyh2YWx1ZSlcbiAqIH1cbiAqXG4gKiBAU0lHTkFUVVJFIHZlY3RvciBjYWxsYmFja1xuICogZnVuY3Rpb24odGltZSwgaW5GcmFtZSwgb3V0RnJhbWUpIHtcbiAqICAgb3V0RnJhbWUuc2V0KGluRnJhbWUsIDApO1xuICogICByZXR1cm4gdGltZSArIDE7XG4gKiB9XG4gKlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBPcGVyYXRvciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICB0aGlzLnBhcmFtcy50eXBlID0gdGhpcy5wYXJhbXMudHlwZSB8fMKgJ3NjYWxhcic7XG5cbiAgICBpZiAodGhpcy5wYXJhbXMub25Qcm9jZXNzKSB7XG4gICAgICB0aGlzLmNhbGxiYWNrID0gdGhpcy5wYXJhbXMub25Qcm9jZXNzLmJpbmQodGhpcyk7XG4gICAgfVxuICB9XG5cbiAgY29uZmlndXJlU3RyZWFtKCkge1xuICAgIGlmICh0aGlzLnBhcmFtcy50eXBlID09PSAndmVjdG9yJyAmJiB0aGlzLnBhcmFtcy5mcmFtZVNpemUpIHtcbiAgICAgIHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IHRoaXMucGFyYW1zLmZyYW1lU2l6ZTtcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIC8vIGFwcGx5IHRoZSBjYWxsYmFjayB0byB0aGUgZnJhbWVcbiAgICBpZiAodGhpcy5wYXJhbXMudHlwZSA9PT0gJ3ZlY3RvcicpIHtcbiAgICAgIHZhciBvdXRUaW1lID0gdGhpcy5jYWxsYmFjayh0aW1lLCBmcmFtZSwgdGhpcy5vdXRGcmFtZSk7XG5cbiAgICAgIGlmIChvdXRUaW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGltZSA9IG91dFRpbWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gZnJhbWUubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMub3V0RnJhbWVbaV0gPSB0aGlzLmNhbGxiYWNrKGZyYW1lW2ldLCBpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn07XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCBNb3ZpbmdBdmVyYWdlIGZyb20gJy4vbW92aW5nLWF2ZXJhZ2UnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlZ21lbnRlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgbG9nSW5wdXQ6IGZhbHNlLFxuICAgICAgbWluSW5wdXQ6IDAuMDAwMDAwMDAwMDAxLFxuICAgICAgZmlsdGVyT3JkZXI6IDUsXG4gICAgICB0aHJlc2hvbGQ6IDMsXG4gICAgICBvZmZUaHJlc2hvbGQ6IC1JbmZpbml0eSxcbiAgICAgIG1pbkludGVyOiAwLjA1MCxcbiAgICAgIG1heER1cmF0aW9uOiBJbmZpbml0eSxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuaW5zaWRlU2VnbWVudCA9IGZhbHNlO1xuICAgIHRoaXMub25zZXRUaW1lID0gLUluZmluaXR5O1xuXG4gICAgLy8gc3RhdHNcbiAgICB0aGlzLm1pbiA9IEluZmluaXR5O1xuICAgIHRoaXMubWF4ID0gLUluZmluaXR5O1xuICAgIHRoaXMuc3VtID0gMDtcbiAgICB0aGlzLnN1bU9mU3F1YXJlcyA9IDA7XG4gICAgdGhpcy5jb3VudCA9IDA7XG5cbiAgICBjb25zdCBtaW5JbnB1dCA9IHRoaXMucGFyYW1zLm1pbklucHV0O1xuICAgIGxldCBmaWxsID0gbWluSW5wdXQ7XG5cbiAgICBpZih0aGlzLnBhcmFtcy5sb2dJbnB1dCAmJiBtaW5JbnB1dCA+IDApXG4gICAgICBmaWxsID0gTWF0aC5sb2cobWluSW5wdXQpO1xuXG4gICAgdGhpcy5tb3ZpbmdBdmVyYWdlID0gbmV3IE1vdmluZ0F2ZXJhZ2Uoe1xuICAgICAgb3JkZXI6IHRoaXMucGFyYW1zLmZpbHRlck9yZGVyLFxuICAgICAgZmlsbDogZmlsbCxcbiAgICB9KTtcblxuICAgIHRoaXMubGFzdE12YXZyZyA9IGZpbGw7XG4gIH1cblxuICBzZXQgdGhyZXNob2xkKHZhbHVlKSB7XG4gICAgdGhpcy5wYXJhbXMudGhyZXNob2xkID0gdmFsdWU7XG4gIH1cblxuICBzZXQgb2ZmVGhyZXNob2xkKHZhbHVlKSB7XG4gICAgdGhpcy5wYXJhbXMub2ZmVGhyZXNob2xkID0gdmFsdWU7XG4gIH1cblxuICByZXNldFNlZ21lbnQoKSB7XG4gICAgdGhpcy5pbnNpZGVTZWdtZW50ID0gZmFsc2U7XG4gICAgdGhpcy5vbnNldFRpbWUgPSAtSW5maW5pdHk7XG5cbiAgICAvLyBzdGF0c1xuICAgIHRoaXMubWluID0gSW5maW5pdHk7XG4gICAgdGhpcy5tYXggPSAtSW5maW5pdHk7XG4gICAgdGhpcy5zdW0gPSAwO1xuICAgIHRoaXMuc3VtT2ZTcXVhcmVzID0gMDtcbiAgICB0aGlzLmNvdW50ID0gMDtcbiAgfVxuXG4gIG91dHB1dFNlZ21lbnQoZW5kVGltZSkge1xuICAgIHRoaXMub3V0RnJhbWVbMF0gPSBlbmRUaW1lIC0gdGhpcy5vbnNldFRpbWU7XG4gICAgdGhpcy5vdXRGcmFtZVsxXSA9IHRoaXMubWluO1xuICAgIHRoaXMub3V0RnJhbWVbMl0gPSB0aGlzLm1heDtcblxuICAgIGNvbnN0IG5vcm0gPSAxIC8gdGhpcy5jb3VudDtcbiAgICBjb25zdCBtZWFuID0gdGhpcy5zdW0gKiBub3JtO1xuICAgIGNvbnN0IG1lYW5PZlNxdWFyZSA9IHRoaXMuc3VtT2ZTcXVhcmVzICogbm9ybTtcbiAgICBjb25zdCBzcXVhcmVPZm1lYW4gPSBtZWFuICogbWVhbjtcblxuICAgIHRoaXMub3V0RnJhbWVbM10gPSBtZWFuO1xuICAgIHRoaXMub3V0RnJhbWVbNF0gPSAwO1xuXG4gICAgaWYgKG1lYW5PZlNxdWFyZSA+IHNxdWFyZU9mbWVhbilcbiAgICAgIHRoaXMub3V0RnJhbWVbNF0gPSBNYXRoLnNxcnQobWVhbk9mU3F1YXJlIC0gc3F1YXJlT2ZtZWFuKTtcblxuICAgIHRoaXMub3V0cHV0KHRoaXMub25zZXRUaW1lKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCB7XG4gICAgICBmcmFtZVNpemU6IDUsXG4gICAgICBkZXNjcmlwdGlvbjogW1xuICAgICAgICAnZHVyYXRpb24nLFxuICAgICAgICAnbWluJyxcbiAgICAgICAgJ21heCcsXG4gICAgICAgICdtZWFuJyxcbiAgICAgICAgJ3N0ZCBkZXYnLFxuICAgICAgXSxcbiAgICB9KTtcblxuICAgIHRoaXMubW92aW5nQXZlcmFnZS5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKTtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHN1cGVyLnJlc2V0KCk7XG4gICAgdGhpcy5tb3ZpbmdBdmVyYWdlLnJlc2V0KCk7XG4gICAgdGhpcy5yZXNldFNlZ21lbnQoKTtcbiAgfVxuXG4gIGZpbmFsaXplKGVuZFRpbWUpIHtcbiAgICBpZiAodGhpcy5pbnNpZGVTZWdtZW50KVxuICAgICAgdGhpcy5vdXRwdXRTZWdtZW50KGVuZFRpbWUpO1xuXG4gICAgc3VwZXIuZmluYWxpemUoZW5kVGltZSk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGNvbnN0IHJhd1ZhbHVlID0gZnJhbWVbMF07XG4gICAgY29uc3QgbWluSW5wdXQgPSB0aGlzLnBhcmFtcy5taW5JbnB1dDtcbiAgICBsZXQgdmFsdWUgPSBNYXRoLm1heChyYXdWYWx1ZSwgbWluSW5wdXQpO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLmxvZ0lucHV0KVxuICAgICAgdmFsdWUgPSBNYXRoLmxvZyh2YWx1ZSk7XG5cbiAgICBjb25zdCBkaWZmID0gdmFsdWUgLSB0aGlzLmxhc3RNdmF2cmc7XG4gICAgdGhpcy5sYXN0TXZhdnJnID0gdGhpcy5tb3ZpbmdBdmVyYWdlLmlucHV0U2NhbGFyKHZhbHVlKTtcblxuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuICAgIGlmIChkaWZmID4gdGhpcy5wYXJhbXMudGhyZXNob2xkICYmIHRpbWUgLSB0aGlzLm9uc2V0VGltZSA+IHRoaXMucGFyYW1zLm1pbkludGVyKSB7XG4gICAgICBpZih0aGlzLmluc2lkZVNlZ21lbnQpXG4gICAgICAgIHRoaXMub3V0cHV0U2VnbWVudCh0aW1lKTtcblxuICAgICAgLy8gc3RhcnQgc2VnbWVudFxuICAgICAgdGhpcy5pbnNpZGVTZWdtZW50ID0gdHJ1ZTtcbiAgICAgIHRoaXMub25zZXRUaW1lID0gdGltZTtcbiAgICAgIHRoaXMubWF4ID0gLUluZmluaXR5O1xuICAgIH1cblxuICAgIGlmICh0aGlzLmluc2lkZVNlZ21lbnQpIHtcbiAgICAgIHRoaXMubWluID0gTWF0aC5taW4odGhpcy5taW4sIHJhd1ZhbHVlKTtcbiAgICAgIHRoaXMubWF4ID0gTWF0aC5tYXgodGhpcy5tYXgsIHJhd1ZhbHVlKTtcbiAgICAgIHRoaXMuc3VtICs9IHJhd1ZhbHVlO1xuICAgICAgdGhpcy5zdW1PZlNxdWFyZXMgKz0gcmF3VmFsdWUgKiByYXdWYWx1ZTtcbiAgICAgIHRoaXMuY291bnQrKztcblxuICAgICAgaWYgKHRpbWUgLSB0aGlzLm9uc2V0VGltZSA+PSB0aGlzLnBhcmFtcy5tYXhEdXJhdGlvbiB8fCB2YWx1ZSA8PSB0aGlzLnBhcmFtcy5vZmZUaHJlc2hvbGQpIHtcbiAgICAgICAgdGhpcy5vdXRwdXRTZWdtZW50KHRpbWUpO1xuICAgICAgICB0aGlzLmluc2lkZVNlZ21lbnQgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5jb25zdCB3b3JrZXIgPSBgXG52YXIgaXNJbmZpbml0ZUJ1ZmZlciA9IGZhbHNlO1xudmFyIHN0YWNrID0gW107XG52YXIgYnVmZmVyO1xudmFyIGJ1ZmZlckxlbmd0aDtcbnZhciBjdXJyZW50SW5kZXg7XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyTGVuZ3RoKTtcbiAgc3RhY2subGVuZ3RoID0gMDtcbiAgY3VycmVudEluZGV4ID0gMDtcbn1cblxuZnVuY3Rpb24gYXBwZW5kKGJsb2NrKSB7XG4gIHZhciBhdmFpbGFibGVTcGFjZSA9IGJ1ZmZlckxlbmd0aCAtIGN1cnJlbnRJbmRleDtcbiAgdmFyIGN1cnJlbnRCbG9jaztcbiAgLy8gcmV0dXJuIGlmIGFscmVhZHkgZnVsbFxuICBpZiAoYXZhaWxhYmxlU3BhY2UgPD0gMCkgeyByZXR1cm47IH1cblxuICBpZiAoYXZhaWxhYmxlU3BhY2UgPCBibG9jay5sZW5ndGgpIHtcbiAgICBjdXJyZW50QmxvY2sgPSBibG9jay5zdWJhcnJheSgwLCBhdmFpbGFibGVTcGFjZSk7XG4gIH0gZWxzZSB7XG4gICAgY3VycmVudEJsb2NrID0gYmxvY2s7XG4gIH1cblxuICBidWZmZXIuc2V0KGN1cnJlbnRCbG9jaywgY3VycmVudEluZGV4KTtcbiAgY3VycmVudEluZGV4ICs9IGN1cnJlbnRCbG9jay5sZW5ndGg7XG5cbiAgaWYgKGlzSW5maW5pdGVCdWZmZXIgJiYgY3VycmVudEluZGV4ID09PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgc3RhY2sucHVzaChidWZmZXIpO1xuXG4gICAgY3VycmVudEJsb2NrID0gYmxvY2suc3ViYXJyYXkoYXZhaWxhYmxlU3BhY2UpO1xuICAgIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyLmxlbmd0aCk7XG4gICAgYnVmZmVyLnNldChjdXJyZW50QmxvY2ssIDApO1xuICAgIGN1cnJlbnRJbmRleCA9IGN1cnJlbnRCbG9jay5sZW5ndGg7XG4gIH1cbn1cblxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24oZSkge1xuICBzd2l0Y2ggKGUuZGF0YS5jb21tYW5kKSB7XG4gICAgY2FzZSAnaW5pdCc6XG4gICAgICBpZiAoaXNGaW5pdGUoZS5kYXRhLmR1cmF0aW9uKSkge1xuICAgICAgICBidWZmZXJMZW5ndGggPSBlLmRhdGEuc2FtcGxlUmF0ZSAqIGUuZGF0YS5kdXJhdGlvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlzSW5maW5pdGVCdWZmZXIgPSB0cnVlO1xuICAgICAgICBidWZmZXJMZW5ndGggPSBlLmRhdGEuc2FtcGxlUmF0ZSAqIDEwO1xuICAgICAgfVxuXG4gICAgICBpbml0KCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3Byb2Nlc3MnOlxuICAgICAgdmFyIGJsb2NrID0gbmV3IEZsb2F0MzJBcnJheShlLmRhdGEuYnVmZmVyKTtcbiAgICAgIGFwcGVuZChibG9jayk7XG5cblxuICAgICAgLy8gaWYgdGhlIGJ1ZmZlciBpcyBmdWxsIHJldHVybiBpdCwgb25seSB3b3JrcyB3aXRoIGZpbml0ZSBidWZmZXJzXG4gICAgICBpZiAoIWlzSW5maW5pdGVCdWZmZXIgJiYgY3VycmVudEluZGV4ID09PSBidWZmZXJMZW5ndGgpIHtcbiAgICAgICAgdmFyIGJ1ZiA9IGJ1ZmZlci5idWZmZXIuc2xpY2UoMCk7XG4gICAgICAgIHNlbGYucG9zdE1lc3NhZ2UoeyBidWZmZXI6IGJ1ZiB9LCBbYnVmXSk7XG4gICAgICAgIGluaXQoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnc3RvcCc6XG4gICAgICBpZiAoIWlzSW5maW5pdGVCdWZmZXIpIHtcbiAgICAgICAgLy8gQFRPRE8gYWRkIG9wdGlvbiB0byBub3QgY2xpcCB0aGUgcmV0dXJuZWQgYnVmZmVyXG4gICAgICAgIC8vIHZhbHVlcyBpbiBGTG9hdDMyQXJyYXkgYXJlIDQgYnl0ZXMgbG9uZyAoMzIgLyA4KVxuICAgICAgICB2YXIgY29weSA9IGJ1ZmZlci5idWZmZXIuc2xpY2UoMCwgY3VycmVudEluZGV4ICogKDMyIC8gOCkpO1xuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgYnVmZmVyOiBjb3B5IH0sIFtjb3B5XSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgY29weSA9IG5ldyBGbG9hdDMyQXJyYXkoc3RhY2subGVuZ3RoICogYnVmZmVyTGVuZ3RoICsgY3VycmVudEluZGV4KTtcbiAgICAgICAgc3RhY2suZm9yRWFjaChmdW5jdGlvbihidWZmZXIsIGluZGV4KSB7XG4gICAgICAgICAgY29weS5zZXQoYnVmZmVyLCBidWZmZXJMZW5ndGggKiBpbmRleCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvcHkuc2V0KGJ1ZmZlci5zdWJhcnJheSgwLCBjdXJyZW50SW5kZXgpLCBzdGFjay5sZW5ndGggKiBidWZmZXJMZW5ndGgpO1xuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgYnVmZmVyOiBjb3B5LmJ1ZmZlciB9LCBbY29weS5idWZmZXJdKTtcbiAgICAgIH1cbiAgICAgIGluaXQoKTtcbiAgICAgIGJyZWFrO1xuICB9XG59LCBmYWxzZSlgO1xuXG5sZXQgYXVkaW9Db250ZXh0O1xuXG4vKipcbiAqIFJlY29yZCBhbiBhdWRpbyBzdHJlYW1cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9SZWNvcmRlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgZHVyYXRpb246IDEwLCAvLyBzZWNvbmRzXG4gICAgICBpZ25vcmVMZWFkaW5nWmVyb3M6IHRydWUsIC8vIGlnbm9yZSB6ZXJvcyBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSByZWNvYXJkaW5nXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBuZWVkZWQgdG8gcmV0cml2ZSBhbiBBdWRpb0J1ZmZlclxuICAgIGlmICghdGhpcy5wYXJhbXMuY3R4KSB7XG4gICAgICBpZiAoIWF1ZGlvQ29udGV4dCkgeyBhdWRpb0NvbnRleHQgPSBuZXcgd2luZG93LkF1ZGlvQ29udGV4dCgpOyB9XG4gICAgICB0aGlzLmN0eCA9IGF1ZGlvQ29udGV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5jdHggPSB0aGlzLnBhcmFtcy5jdHg7XG4gICAgfVxuXG4gICAgdGhpcy5faXNTdGFydGVkID0gZmFsc2U7XG4gICAgdGhpcy5faWdub3JlWmVyb3MgPSBmYWxzZTtcblxuICAgIGNvbnN0IGJsb2IgPSBuZXcgQmxvYihbd29ya2VyXSwgeyB0eXBlOiAndGV4dC9qYXZhc2NyaXB0JyB9KTtcbiAgICB0aGlzLndvcmtlciA9IG5ldyBXb3JrZXIod2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYikpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpO1xuXG4gICAgLy8gcHJvcGFnYXRlIGBzdHJlYW1QYXJhbXNgIHRvIHRoZSB3b3JrZXJcbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICBjb21tYW5kOiAnaW5pdCcsXG4gICAgICBkdXJhdGlvbjogdGhpcy5wYXJhbXMuZHVyYXRpb24sXG4gICAgICBzYW1wbGVSYXRlOiB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlXG4gICAgfSk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX2lnbm9yZVplcm9zID0gdGhpcy5wYXJhbXMuaWdub3JlTGVhZGluZ1plcm9zO1xuXG4gICAgdGhpcy5jb3VudCA9IDA7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICh0aGlzLl9pc1N0YXJ0ZWQpIHtcbiAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgY29tbWFuZDogJ3N0b3AnIH0pO1xuICAgICAgdGhpcy5faXNTdGFydGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLy8gY2FsbGVkIHdoZW4gYHN0b3BgIGlzIHRyaWdnZXJlZCBvbiB0aGUgc291cmNlXG4gIC8vIEB0b2RvIC0gb3B0aW9ubmFseSB0cnVuY2F0ZSByZXRyaWV2ZWQgYnVmZmVyIHRvIGVuZCB0aW1lXG4gIGZpbmFsaXplKGVuZFRpbWUpIHtcbiAgICB0aGlzLnN0b3AoKTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgaWYgKCF0aGlzLl9pc1N0YXJ0ZWQpIHsgcmV0dXJuOyB9XG4gICAgLy8gYHRoaXMub3V0RnJhbWVgIG11c3QgYmUgcmVjcmVhdGVkIGVhY2ggdGltZSBiZWNhdXNlXG4gICAgLy8gaXQgaXMgY29waWVkIGluIHRoZSB3b3JrZXIgYW5kIGxvc3QgZm9yIHRoaXMgY29udGV4dFxuICAgIGxldCBzZW5kRnJhbWUgPSBudWxsO1xuXG4gICAgaWYgKCF0aGlzLl9pZ25vcmVaZXJvcykge1xuICAgICAgc2VuZEZyYW1lID0gbmV3IEZsb2F0MzJBcnJheShmcmFtZSk7XG4gICAgfSBlbHNlIGlmIChmcmFtZVtmcmFtZS5sZW5ndGggLSAxXSAhPT0gMCkge1xuICAgICAgY29uc3QgbGVuID0gZnJhbWUubGVuZ3RoO1xuICAgICAgbGV0IGk7XG5cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgICBpZiAoZnJhbWVbaV0gIT09IDApXG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvcHkgbm9uIHplcm8gc2VnbWVudFxuICAgICAgc2VuZEZyYW1lID0gbmV3IEZsb2F0MzJBcnJheShmcmFtZS5zdWJhcnJheShpKSk7XG4gICAgICB0aGlzLl9pZ25vcmVaZXJvcyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzZW5kRnJhbWUpIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IHNlbmRGcmFtZS5idWZmZXI7XG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICAgIGNvbW1hbmQ6ICdwcm9jZXNzJyxcbiAgICAgICAgYnVmZmVyOiBidWZmZXJcbiAgICAgIH0sIFtidWZmZXJdKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogcmV0cmlldmUgdGhlIGNyZWF0ZWQgYXVkaW9CdWZmZXJcbiAgICogQHJldHVybiB7UHJvbWlzZX1cbiAgICovXG4gIHJldHJpZXZlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IChlKSA9PiB7XG4gICAgICAgIC8vIGlmIGNhbGxlZCB3aGVuIGJ1ZmZlciBpcyBmdWxsLCBzdG9wIHRoZSByZWNvcmRlciB0b29cbiAgICAgICAgdGhpcy5faXNTdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy53b3JrZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIC8vIGNyZWF0ZSBhbiBhdWRpbyBidWZmZXIgZnJvbSB0aGUgZGF0YVxuICAgICAgICBjb25zdCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KGUuZGF0YS5idWZmZXIpO1xuICAgICAgICBjb25zdCBsZW5ndGggPSBidWZmZXIubGVuZ3RoO1xuICAgICAgICBjb25zdCBzYW1wbGVSYXRlID0gdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZTtcblxuICAgICAgICBjb25zdCBhdWRpb0J1ZmZlciA9IHRoaXMuY3R4LmNyZWF0ZUJ1ZmZlcigxLCBsZW5ndGgsIHNhbXBsZVJhdGUpO1xuICAgICAgICBjb25zdCBhdWRpb0FycmF5QnVmZmVyID0gYXVkaW9CdWZmZXIuZ2V0Q2hhbm5lbERhdGEoMCk7XG4gICAgICAgIGF1ZGlvQXJyYXlCdWZmZXIuc2V0KGJ1ZmZlciwgMCk7XG5cbiAgICAgICAgcmVzb2x2ZShhdWRpb0J1ZmZlcik7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQmFzZURyYXcgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3IoZXh0ZW5kRGVmYXVsdHMgPSB7fSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3QgZGVmYXVsdHMgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgIGR1cmF0aW9uOiAxLFxuICAgICAgbWluOiAtMSxcbiAgICAgIG1heDogMSxcbiAgICAgIHdpZHRoOiAzMDAsXG4gICAgICBoZWlnaHQ6IDE1MCwgLy8gZGVmYXVsdCBjYW52YXMgc2l6ZSBpbiBET00gdG9vXG4gICAgICBpc1N5bmNocm9uaXplZDogZmFsc2UsIC8vIGlzIHNldCB0byB0cnVlIGlmIHVzZWQgaW4gYSBzeW5jaHJvbml6ZWRTaW5rXG4gICAgICBjYW52YXM6IG51bGwsIC8vIGFuIGV4aXN0aW5nIGNhbnZhcyBlbGVtZW50IGJlIHVzZWQgZm9yIGRyYXdpbmdcbiAgICAgIGNvbnRhaW5lcjogbnVsbCwgLy8gYSBzZWxlY3RvciBpbnNpZGUgd2hpY2ggY3JlYXRlIGFuIGVsZW1lbnRcbiAgICB9LCBleHRlbmREZWZhdWx0cyk7XG5cbiAgICBzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmNhbnZhcyAmJiAhdGhpcy5wYXJhbXMuY29udGFpbmVyKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwYXJhbWV0ZXIgYGNhbnZhc2Agb3IgYGNvbnRhaW5lcmAgYXJlIG1hbmRhdG9yeScpO1xuXG4gICAgLy8gcHJlcGFyZSBjYW52YXNcbiAgICBpZiAodGhpcy5wYXJhbXMuY2FudmFzKSB7XG4gICAgICB0aGlzLmNhbnZhcyA9IHRoaXMucGFyYW1zLmNhbnZhcztcbiAgICB9IGVsc2UgaWYgKHRoaXMucGFyYW1zLmNvbnRhaW5lcikge1xuICAgICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0aGlzLnBhcmFtcy5jb250YWluZXIpO1xuICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG4gICAgfVxuXG4gICAgdGhpcy5jdHggPSB0aGlzLmNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgdGhpcy5jYWNoZWRDYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmNhY2hlZEN0eCA9IHRoaXMuY2FjaGVkQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICB0aGlzLnByZXZpb3VzVGltZSA9IDA7XG4gICAgdGhpcy5sYXN0U2hpZnRFcnJvciA9IDA7XG4gICAgdGhpcy5jdXJyZW50UGFydGlhbFNoaWZ0ID0gMDtcblxuICAgIHRoaXMucmVzaXplKHRoaXMucGFyYW1zLndpZHRoLCB0aGlzLnBhcmFtcy5oZWlnaHQpO1xuXG4gICAgLy9cbiAgICB0aGlzLl9zdGFjaztcbiAgICB0aGlzLl9yYWZJZDtcbiAgICB0aGlzLmRyYXcgPSB0aGlzLmRyYXcuYmluZCh0aGlzKTtcbiAgfVxuXG4gIC8vIHBhcmFtcyBtb2RpZmllcnNcbiAgc2V0IGR1cmF0aW9uKGR1cmF0aW9uKSB7XG4gICAgdGhpcy5wYXJhbXMuZHVyYXRpb24gPSBkdXJhdGlvbjtcbiAgfVxuXG4gIHNldCBtaW4obWluKSB7XG4gICAgdGhpcy5wYXJhbXMubWluID0gbWluO1xuICAgIHRoaXMuX3NldFlTY2FsZSgpO1xuICB9XG5cbiAgc2V0IG1heChtYXgpIHtcbiAgICB0aGlzLnBhcmFtcy5tYXggPSBtYXg7XG4gICAgdGhpcy5fc2V0WVNjYWxlKCk7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlIHRoZSB0cmFuc2ZlcnQgZnVuY3Rpb24gdXNlZCB0byBtYXAgdmFsdWVzIHRvIHBpeGVsIGluIHRoZSB5IGF4aXNcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRZU2NhbGUoKSB7XG4gICAgY29uc3QgbWluID0gdGhpcy5wYXJhbXMubWluO1xuICAgIGNvbnN0IG1heCA9IHRoaXMucGFyYW1zLm1heDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG5cbiAgICBjb25zdCBhID0gKDAgLSBoZWlnaHQpIC8gKG1heCAtIG1pbik7XG4gICAgY29uc3QgYiA9IGhlaWdodCAtIChhICogbWluKTtcblxuICAgIHRoaXMuZ2V0WVBvc2l0aW9uID0gKHgpID0+IGEgKiB4ICsgYjtcbiAgfVxuXG4gIHNldHVwU3RyZWFtKCkge1xuICAgIHN1cGVyLnNldHVwU3RyZWFtKCk7XG4gICAgLy8ga2VlcCB0cmFjayBvZiB0aGUgcHJldmlvdXMgZnJhbWVcbiAgICB0aGlzLnByZXZpb3VzRnJhbWUgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSk7XG4gIH1cblxuICBpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcyk7XG5cbiAgICB0aGlzLl9zdGFjayA9IFtdO1xuICAgIHRoaXMuX3JhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZHJhdyk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuICAgIHRoaXMuY3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnBhcmFtcy53aWR0aCwgdGhpcy5wYXJhbXMuaGVpZ2h0KTtcbiAgICB0aGlzLmNhY2hlZEN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCk7XG4gIH1cblxuICBmaW5hbGl6ZShlbmRUaW1lICApIHtcbiAgICBzdXBlci5maW5hbGl6ZShlbmRUaW1lICApO1xuICAgIGNhbmNlbEFuaW1hdGlvbkZyYW1lKHRoaXMuX3JhZklkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgdGhlIGN1cnJlbnQgZnJhbWUgdG8gdGhlIGZyYW1lcyB0byBkcmF3LiBTaG91bGQgbm90IGJlIG92ZXJyaWRlbi5cbiAgICogQGluaGVyaXRkb2NcbiAgICogQGZpbmFsXG4gICAqL1xuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGZyYW1lLmJ1ZmZlci5zbGljZSgwKTsgLy8gY29weSB2YWx1ZXMgaW5zdGVhZCBvZiByZWZlcmVuY2VcbiAgICBjb25zdCBjb3B5ID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIpO1xuXG4gICAgdGhpcy5fc3RhY2sucHVzaCh7IHRpbWUsIGZyYW1lOiBjb3B5LCBtZXRhRGF0YSB9KTtcbiAgfVxuXG4gIGRyYXcoKSB7XG4gICAgZm9yIChsZXQgaSA9IDAsIGxlbmd0aCA9IHRoaXMuX3N0YWNrLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBldmVudCA9IHRoaXMuX3N0YWNrW2ldO1xuICAgICAgdGhpcy5leGVjdXRlRHJhdyhldmVudC50aW1lLCBldmVudC5mcmFtZSk7XG4gICAgfVxuXG4gICAgLy8gcmVpbml0IHN0YWNrIGZvciBuZXh0IGNhbGxcbiAgICB0aGlzLl9zdGFjay5sZW5ndGggPSAwO1xuICAgIHRoaXMuX3JhZklkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuZHJhdyk7XG4gIH1cblxuICBleGVjdXRlRHJhdyh0aW1lLCBmcmFtZSkge1xuICAgIHRoaXMuc2Nyb2xsTW9kZURyYXcodGltZSwgZnJhbWUpO1xuICB9XG5cbiAgcmVzaXplKHdpZHRoLCBoZWlnaHQpIHtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBjb25zdCBjYWNoZWRDdHggPSB0aGlzLmNhY2hlZEN0eDtcblxuICAgIC8vIEB0b2RvIC0gZml4IHRoaXMsIHByb2JsZW0gd2l0aCB0aGUgY2FjaGVkIGNhbnZhcy4uLlxuICAgIC8vIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL2NhbnZhcy9oaWRwaS9cbiAgICAvLyBjb25zdCBhdXRvID0gdHJ1ZTtcbiAgICAvLyBjb25zdCBkZXZpY2VQaXhlbFJhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICAvLyBjb25zdCBiYWNraW5nU3RvcmVSYXRpbyA9IGN0eC53ZWJraXRCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBjdHgubW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgY3R4Lm1zQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgY3R4Lm9CYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBjdHguYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxO1xuXG4gICAgLy8gaWYgKGF1dG8gJiYgZGV2aWNlUGl4ZWxSYXRpbyAhPT0gYmFja2luZ1N0b3JlUmF0aW8pIHtcbiAgICAvLyAgIGNvbnN0IHJhdGlvID0gZGV2aWNlUGl4ZWxSYXRpbyAvIGJhY2tpbmdTdG9yZVJhdGlvO1xuXG4gICAgLy8gICB0aGlzLnBhcmFtcy53aWR0aCA9IHdpZHRoICogcmF0aW87XG4gICAgLy8gICB0aGlzLnBhcmFtcy5oZWlnaHQgPSBoZWlnaHQgKiByYXRpbztcblxuICAgIC8vICAgY3R4LmNhbnZhcy53aWR0aCA9IGNhY2hlZEN0eC5jYW52YXMud2lkdGggPSB0aGlzLnBhcmFtcy53aWR0aDtcbiAgICAvLyAgIGN0eC5jYW52YXMuaGVpZ2h0ID0gY2FjaGVkQ3R4LmNhbnZhcy5oZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG5cbiAgICAvLyAgIGN0eC5jYW52YXMuc3R5bGUud2lkdGggPSBgJHt3aWR0aH1weGA7XG4gICAgLy8gICBjdHguY2FudmFzLnN0eWxlLmhlaWdodCA9IGAke2hlaWdodH1weGA7XG5cbiAgICAvLyAgIGN0eC5zY2FsZShyYXRpbywgcmF0aW8pO1xuICAgIC8vIH0gZWxzZSB7XG4gICAgICB0aGlzLnBhcmFtcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGhpcy5wYXJhbXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICBjdHguY2FudmFzLndpZHRoID0gY2FjaGVkQ3R4LmNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgY3R4LmNhbnZhcy5oZWlnaHQgPSBjYWNoZWRDdHguY2FudmFzLmhlaWdodCA9IGhlaWdodDtcbiAgICAvLyB9XG5cbiAgICAvLyBjbGVhciBjYWNoZSBjYW52YXNcbiAgICBjYWNoZWRDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucGFyYW1zLndpZHRoLCB0aGlzLnBhcmFtcy5oZWlnaHQpO1xuICAgIC8vIHVwZGF0ZSBzY2FsZVxuICAgIHRoaXMuX3NldFlTY2FsZSgpO1xuICB9XG5cbiAgLy8gZGVmYXVsdCBkcmF3IG1vZGVcbiAgc2Nyb2xsTW9kZURyYXcodGltZSwgZnJhbWUpIHtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMucGFyYW1zLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMucGFyYW1zLmR1cmF0aW9uO1xuXG4gICAgY29uc3QgZHQgPSB0aW1lIC0gdGhpcy5wcmV2aW91c1RpbWU7XG4gICAgY29uc3QgZlNoaWZ0ID0gKGR0IC8gZHVyYXRpb24pICogd2lkdGggLSB0aGlzLmxhc3RTaGlmdEVycm9yO1xuICAgIGNvbnN0IGlTaGlmdCA9IE1hdGgucm91bmQoZlNoaWZ0KTtcbiAgICB0aGlzLmxhc3RTaGlmdEVycm9yID0gaVNoaWZ0IC0gZlNoaWZ0O1xuXG4gICAgY29uc3QgcGFydGlhbFNoaWZ0ID0gaVNoaWZ0IC0gdGhpcy5jdXJyZW50UGFydGlhbFNoaWZ0O1xuICAgIHRoaXMuc2hpZnRDYW52YXMocGFydGlhbFNoaWZ0KTtcblxuICAgIC8vIHNoaWZ0IGFsbCBzaWJsaW5ncyBpZiBzeW5jaHJvbml6ZWRcbiAgICBpZiAodGhpcy5wYXJhbXMuaXNTeW5jaHJvbml6ZWQgJiYgdGhpcy5zeW5jaHJvbml6ZXIpXG4gICAgICB0aGlzLnN5bmNocm9uaXplci5zaGlmdFNpYmxpbmdzKHBhcnRpYWxTaGlmdCwgdGhpcyk7XG5cbiAgICAvLyB0cmFuc2xhdGUgdG8gdGhlIGN1cnJlbnQgZnJhbWUgYW5kIGRyYXcgYSBuZXcgcG9seWdvblxuICAgIGN0eC5zYXZlKCk7XG4gICAgY3R4LnRyYW5zbGF0ZSh3aWR0aCwgMCk7XG4gICAgdGhpcy5kcmF3Q3VydmUoZnJhbWUsIHRoaXMucHJldmlvdXNGcmFtZSwgaVNoaWZ0KTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICAgIC8vIHVwZGF0ZSBgY3VycmVudFBhcnRpYWxTaGlmdGBcbiAgICB0aGlzLmN1cnJlbnRQYXJ0aWFsU2hpZnQgLT0gaVNoaWZ0O1xuICAgIC8vIHNhdmUgY3VycmVudCBzdGF0ZSBpbnRvIGJ1ZmZlciBjYW52YXNcbiAgICB0aGlzLmNhY2hlZEN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgdGhpcy5jYWNoZWRDdHguZHJhd0ltYWdlKHRoaXMuY2FudmFzLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIHRoaXMucHJldmlvdXNGcmFtZS5zZXQoZnJhbWUsIDApO1xuICAgIHRoaXMucHJldmlvdXNUaW1lID0gdGltZTtcbiAgfVxuXG4gIHNoaWZ0Q2FudmFzKHNoaWZ0KSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLnBhcmFtcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG5cbiAgICB0aGlzLmN1cnJlbnRQYXJ0aWFsU2hpZnQgKz0gc2hpZnQ7XG5cbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIGN0eC5zYXZlKCk7XG5cbiAgICBjb25zdCBjcm9wcGVkV2lkdGggPSB3aWR0aCAtIHRoaXMuY3VycmVudFBhcnRpYWxTaGlmdDtcblxuICAgIGN0eC5kcmF3SW1hZ2UodGhpcy5jYWNoZWRDYW52YXMsXG4gICAgICB0aGlzLmN1cnJlbnRQYXJ0aWFsU2hpZnQsIDAsIGNyb3BwZWRXaWR0aCwgaGVpZ2h0LFxuICAgICAgMCwgMCwgY3JvcHBlZFdpZHRoLCBoZWlnaHRcbiAgICApO1xuXG4gICAgY3R4LnJlc3RvcmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbnRlcmZhY2UgbWV0aG9kIHRvIGltcGxlbWVudCBpbiBvcmRlciB0byBkZWZpbmUgaG93IHRvIGRyYXcgdGhlIHNoYXBlXG4gICAqIGJldHdlZW4gdGhlIHByZXZpb3VzIGFuZCB0aGUgY3VycmVudCBmcmFtZSwgYXNzdW1pbmcgdGhlIGNhbnZhcyBjb250ZXh0XG4gICAqIGlzIGNlbnRlcmVkIG9uIHRoZSBjdXJyZW50IGZyYW1lLlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheX0gZnJhbWUgLSBUaGUgY3VycmVudCBmcmFtZSB0byBkcmF3LlxuICAgKiBAcGFyYW0ge0Zsb2F0MzJBcnJheX0gcHJldkZyYW1lIC0gVGhlIGxhc3QgZnJhbWUuXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBpU2hpZnQgLSB0aGUgbnVtYmVyIG9mIHBpeGVscyBiZXR3ZWVuIHRoZSBsYXN0IGFuZCB0aGUgY3VycmVudCBmcmFtZS5cbiAgICovXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldkZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zb2xlLmVycm9yKCdtdXN0IGJlIGltcGxlbWVudGVkJyk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlRHJhdyBmcm9tICcuL2Jhc2UtZHJhdyc7XG5pbXBvcnQgeyBnZXRSYW5kb21Db2xvciB9IGZyb20gJy4uL3V0aWxzL2RyYXctdXRpbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBCcGYgZXh0ZW5kcyBCYXNlRHJhdyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICB0cmlnZ2VyOiBmYWxzZSxcbiAgICAgIHJhZGl1czogMCxcbiAgICAgIGxpbmU6IHRydWVcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIGZvciBsb29wIG1vZGVcbiAgICB0aGlzLmN1cnJlbnRYUG9zaXRpb24gPSAwO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpO1xuXG4gICAgLy8gY3JlYXRlIGFuIGFycmF5IG9mIGNvbG9ycyBhY2NvcmRpbmcgdG8gdGhlIGBvdXRGcmFtZWAgc2l6ZVxuICAgIGlmICghdGhpcy5wYXJhbXMuY29sb3JzKSB7XG4gICAgICB0aGlzLnBhcmFtcy5jb2xvcnMgPSBbXTtcblxuICAgICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7IGkgPCBsOyBpKyspXG4gICAgICAgIHRoaXMucGFyYW1zLmNvbG9ycy5wdXNoKGdldFJhbmRvbUNvbG9yKCkpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGFsbG93IHRvIHdpdGNoIGVhc2lseSBiZXR3ZWVuIHRoZSAyIG1vZGVzXG4gIHNldFRyaWdnZXIoYm9vbCkge1xuICAgIHRoaXMucGFyYW1zLnRyaWdnZXIgPSBib29sO1xuICAgIC8vIGNsZWFyIGNhbnZhcyBhbmQgY2FjaGVcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCk7XG4gICAgdGhpcy5jYWNoZWRDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucGFyYW1zLndpZHRoLCB0aGlzLnBhcmFtcy5oZWlnaHQpO1xuICAgIC8vIHJlc2V0IGN1cnJlbnRYUG9zaXRpb25cbiAgICB0aGlzLmN1cnJlbnRYUG9zaXRpb24gPSAwO1xuICAgIHRoaXMubGFzdFNoaWZ0RXJyb3IgPSAwO1xuICB9XG5cbiAgZXhlY3V0ZURyYXcodGltZSwgZnJhbWUpIHtcbiAgICBpZiAodGhpcy5wYXJhbXMudHJpZ2dlcilcbiAgICAgIHRoaXMudHJpZ2dlck1vZGVEcmF3KHRpbWUsIGZyYW1lKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnNjcm9sbE1vZGVEcmF3KHRpbWUsIGZyYW1lKTtcblxuICAgIHN1cGVyLnByb2Nlc3ModGltZSwgZnJhbWUpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFsdGVybmF0aXZlIGRyYXdpbmcgbW9kZS5cbiAgICogRHJhdyBmcm9tIGxlZnQgdG8gcmlnaHQsIGdvIGJhY2sgdG8gbGVmdCB3aGVuID4gd2lkdGhcbiAgICovXG4gIHRyaWdnZXJNb2RlRHJhdyh0aW1lLCBmcmFtZSkge1xuICAgIGNvbnN0IHdpZHRoICA9IHRoaXMucGFyYW1zLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcbiAgICBjb25zdCBkdXJhdGlvbiA9IHRoaXMucGFyYW1zLmR1cmF0aW9uO1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuXG4gICAgY29uc3QgZHQgPSB0aW1lIC0gdGhpcy5wcmV2aW91c1RpbWU7XG4gICAgY29uc3QgZlNoaWZ0ID0gKGR0IC8gZHVyYXRpb24pICogd2lkdGggLSB0aGlzLmxhc3RTaGlmdEVycm9yOyAvLyBweFxuICAgIGNvbnN0IGlTaGlmdCA9IE1hdGgucm91bmQoZlNoaWZ0KTtcbiAgICB0aGlzLmxhc3RTaGlmdEVycm9yID0gaVNoaWZ0IC0gZlNoaWZ0O1xuXG4gICAgdGhpcy5jdXJyZW50WFBvc2l0aW9uICs9IGlTaGlmdDtcblxuICAgIC8vIGRyYXcgdGhlIHJpZ2h0IHBhcnRcbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2xhdGUodGhpcy5jdXJyZW50WFBvc2l0aW9uLCAwKTtcbiAgICBjdHguY2xlYXJSZWN0KC1pU2hpZnQsIDAsIGlTaGlmdCwgaGVpZ2h0KTtcbiAgICB0aGlzLmRyYXdDdXJ2ZShmcmFtZSwgaVNoaWZ0KTtcbiAgICBjdHgucmVzdG9yZSgpO1xuXG4gICAgLy8gZ28gYmFjayB0byB0aGUgbGVmdCBvZiB0aGUgY2FudmFzIGFuZCByZWRyYXcgdGhlIHNhbWUgdGhpbmdcbiAgICBpZiAodGhpcy5jdXJyZW50WFBvc2l0aW9uID4gd2lkdGgpIHtcbiAgICAgIC8vIGdvIGJhY2sgdG8gc3RhcnRcbiAgICAgIHRoaXMuY3VycmVudFhQb3NpdGlvbiAtPSB3aWR0aDtcblxuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGN0eC50cmFuc2xhdGUodGhpcy5jdXJyZW50WFBvc2l0aW9uLCAwKTtcbiAgICAgIGN0eC5jbGVhclJlY3QoLWlTaGlmdCwgMCwgaVNoaWZ0LCBoZWlnaHQpO1xuICAgICAgdGhpcy5kcmF3Q3VydmUoZnJhbWUsIHRoaXMucHJldmlvdXNGcmFtZSwgaVNoaWZ0KTtcbiAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuICB9XG5cbiAgZHJhd0N1cnZlKGZyYW1lLCBwcmV2RnJhbWUsIGlTaGlmdCkge1xuICAgIGNvbnN0IGNvbG9ycyA9IHRoaXMucGFyYW1zLmNvbG9ycztcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBjb25zdCByYWRpdXMgPSB0aGlzLnBhcmFtcy5yYWRpdXM7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGZyYW1lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIC8vIGNvbG9yIHNob3VsZCBiZWNob3NlbiBhY2NvcmRpbmcgdG8gaW5kZXhcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBjb2xvcnNbaV07XG4gICAgICBjdHguc3Ryb2tlU3R5bGUgPSBjb2xvcnNbaV07XG5cbiAgICAgIGNvbnN0IHBvc1kgPSB0aGlzLmdldFlQb3NpdGlvbihmcmFtZVtpXSk7XG4gICAgICAvLyBhcyBhbiBvcHRpb25zID8gcmFkaXVzID9cbiAgICAgIGlmIChyYWRpdXMgPiAwKSB7XG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4LmFyYygwLCBwb3NZLCByYWRpdXMsIDAsIE1hdGguUEkgKiAyLCBmYWxzZSk7XG4gICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHByZXZGcmFtZSAmJiB0aGlzLnBhcmFtcy5saW5lKSB7XG4gICAgICAgIGNvbnN0IGxhc3RQb3NZID0gdGhpcy5nZXRZUG9zaXRpb24ocHJldkZyYW1lW2ldKTtcbiAgICAgICAgLy8gZHJhdyBsaW5lXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgY3R4Lm1vdmVUbygtaVNoaWZ0LCBsYXN0UG9zWSk7XG4gICAgICAgIGN0eC5saW5lVG8oMCwgcG9zWSk7XG4gICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgfVxuXG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cblxuLyoqXG4gKiBDcmVhdGUgYSBicmlkZ2UgYmV0d2VlbiBgcHVzaGAgdG8gYHB1bGxgIHBhcmFkaWdtcy5cbiAqIEFsaWFzIGBvdXRGcmFtZWAgdG8gYGRhdGFgIGFuZCBhY2N1bXVsYXRlIGluY29tbWluZyBmcmFtZXMgaW50byBpdC5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnJpZGdlIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMsIHByb2Nlc3MpIHtcbiAgICBzdXBlcihvcHRpb25zKTtcblxuICAgIHRoaXMucHJvY2VzcyA9IHByb2Nlc3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLmRhdGEgPSB0aGlzLm91dEZyYW1lID0gW107XG4gIH1cblxuICBzZXR1cFN0cmVhbSgpIHtcbiAgICBzdXBlci5zZXR1cFN0cmVhbSgpO1xuICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgdGhpcy5kYXRhLmxlbmd0aCA9IDA7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5jb25zdCB3b3JrZXIgPSBgXG52YXIgX3NlcGFyYXRlQXJyYXlzID0gZmFsc2U7XG52YXIgX2RhdGEgPSBbXTtcbnZhciBfc2VwYXJhdGVBcnJheXNEYXRhID0geyB0aW1lOiBbXSwgZGF0YTogW10gfTtcblxuZnVuY3Rpb24gaW5pdCgpIHtcbiAgX2RhdGEubGVuZ3RoID0gMDtcbiAgX3NlcGFyYXRlQXJyYXlzRGF0YS50aW1lLmxlbmd0aCA9IDA7XG4gIF9zZXBhcmF0ZUFycmF5c0RhdGEuZGF0YS5sZW5ndGggPSAwO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzKHRpbWUsIGRhdGEpIHtcbiAgaWYgKF9zZXBhcmF0ZUFycmF5cykge1xuICAgIF9zZXBhcmF0ZUFycmF5c0RhdGEudGltZS5wdXNoKHRpbWUpO1xuICAgIF9zZXBhcmF0ZUFycmF5c0RhdGEuZGF0YS5wdXNoKGRhdGEpO1xuICB9IGVsc2Uge1xuICAgIHZhciBkYXR1bSA9IHsgdGltZTogdGltZSwgZGF0YTogZGF0YSB9O1xuICAgIF9kYXRhLnB1c2goZGF0dW0pO1xuICB9XG59XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGUpIHtcbiAgc3dpdGNoIChlLmRhdGEuY29tbWFuZCkge1xuICAgIGNhc2UgJ2luaXQnOlxuICAgICAgX3NlcGFyYXRlQXJyYXlzID0gZS5kYXRhLnNlcGFyYXRlQXJyYXlzO1xuICAgICAgaW5pdCgpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncHJvY2Vzcyc6XG4gICAgICB2YXIgdGltZSA9IGUuZGF0YS50aW1lO1xuICAgICAgdmFyIGRhdGEgPSBuZXcgRmxvYXQzMkFycmF5KGUuZGF0YS5idWZmZXIpO1xuICAgICAgcHJvY2Vzcyh0aW1lLCBkYXRhKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3N0b3AnOlxuICAgICAgdmFyIGRhdGEgPSBfc2VwYXJhdGVBcnJheXMgPyBfc2VwYXJhdGVBcnJheXNEYXRhIDogX2RhdGE7XG4gICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgZGF0YTogZGF0YSB9KTtcbiAgICAgIGluaXQoKTtcbiAgICAgIGJyZWFrO1xuICB9XG59KTtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFSZWNvcmRlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgLy8gZGVmYXVsdCBmb3JtYXQgaXMgW3t0aW1lLCBkYXRhfSwge3RpbWUsIGRhdGF9XVxuICAgICAgLy8gaWYgc2V0IHRvIGB0cnVlYCBmb3JtYXQgaXMgeyB0aW1lOiBbLi4uXSwgZGF0YTogWy4uLl0gfVxuICAgICAgc2VwYXJhdGVBcnJheXM6IGZhbHNlLFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gQHRvZG8gLSByZW5hbWUgYGlzUmVjb3JkaW5nYFxuICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gaW5pdCB3b3JrZXJcbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3dvcmtlcl0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKTtcblxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIGNvbW1hbmQ6ICdpbml0JyxcbiAgICAgIHNlcGFyYXRlQXJyYXlzOiB0aGlzLnBhcmFtcy5zZXBhcmF0ZUFycmF5cyxcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuX2lzU3RhcnRlZCA9IHRydWU7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICh0aGlzLl9pc1N0YXJ0ZWQpIHtcbiAgICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHsgY29tbWFuZDogJ3N0b3AnIH0pO1xuICAgICAgdGhpcy5faXNTdGFydGVkID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgZmluYWxpemUoKSB7XG4gICAgdGhpcy5zdG9wKCk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGlmICghdGhpcy5faXNTdGFydGVkKSB7IHJldHVybjsgfVxuXG4gICAgdGhpcy5vdXRGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWUpO1xuICAgIGNvbnN0IGJ1ZmZlciA9IHRoaXMub3V0RnJhbWUuYnVmZmVyO1xuXG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgY29tbWFuZDogJ3Byb2Nlc3MnLFxuICAgICAgdGltZTogdGltZSxcbiAgICAgIGJ1ZmZlcjogYnVmZmVyLFxuICAgIH0sIFtidWZmZXJdKTtcbiAgfVxuXG4gIHJldHJpZXZlKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IChlKSA9PiB7XG4gICAgICAgIHRoaXMuX3N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgICAgICB0aGlzLndvcmtlci5yZW1vdmVFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICAgICAgcmVzb2x2ZShlLmRhdGEuZGF0YSk7XG4gICAgICB9O1xuXG4gICAgICB0aGlzLndvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgY2FsbGJhY2ssIGZhbHNlKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEF1ZGlvUmVjb3JkZXIgZnJvbSAnLi9hdWRpby1yZWNvcmRlcic7XG5pbXBvcnQgQnBmIGZyb20gJy4vYnBmJztcbmltcG9ydCBCcmlkZ2UgZnJvbSAnLi9icmlkZ2UnO1xuaW1wb3J0IERhdGFSZWNvcmRlciBmcm9tICcuL2RhdGEtcmVjb3JkZXInO1xuaW1wb3J0IE1hcmtlciBmcm9tICcuL21hcmtlcic7XG5pbXBvcnQgU3BlY3Ryb2dyYW0gZnJvbSAnLi9zcGVjdHJvZ3JhbSc7XG5pbXBvcnQgU29ja2V0Q2xpZW50IGZyb20gJy4vc29ja2V0LWNsaWVudCc7XG5pbXBvcnQgU29ja2V0U2VydmVyIGZyb20gJy4vc29ja2V0LXNlcnZlcic7XG5pbXBvcnQgU29ub2dyYW0gZnJvbSAnLi9zb25vZ3JhbSc7XG5pbXBvcnQgU3luY2hyb25pemVkRHJhdyBmcm9tICcuL3N5bmNocm9uaXplZC1kcmF3JztcbmltcG9ydCBUcmFjZSBmcm9tICcuL3RyYWNlJztcbmltcG9ydCBXYXZlZm9ybSBmcm9tICcuL3dhdmVmb3JtJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBBdWRpb1JlY29yZGVyLFxuICBCcGYsXG4gIEJyaWRnZSxcbiAgRGF0YVJlY29yZGVyLFxuICBNYXJrZXIsXG4gIFNwZWN0cm9ncmFtLFxuICBTb2NrZXRDbGllbnQsXG4gIFNvY2tldFNlcnZlcixcbiAgU29ub2dyYW0sXG4gIFN5bmNocm9uaXplZERyYXcsXG4gIFRyYWNlLFxuICBXYXZlZm9ybSxcbn07XG4iLCJpbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYXJrZXIgZXh0ZW5kcyBCYXNlRHJhdyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBmcmFtZVNpemU6IDEsXG4gICAgICBjb2xvcjogZ2V0UmFuZG9tQ29sb3IoKSxcbiAgICAgIHRocmVzaG9sZDogMCxcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldkZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zdCBjb2xvciA9IHRoaXMucGFyYW1zLmNvbG9yO1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuICAgIGNvbnN0IGhlaWdodCA9IGN0eC5oZWlnaHQ7XG5cbiAgICBjb25zdCB2YWx1ZSA9IGZyYW1lWzBdO1xuXG4gICAgaWYgKHZhbHVlID4gdGhpcy5wYXJhbXMudGhyZXNob2xkKSB7XG4gICAgICBjdHguc2F2ZSgpO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gdGhpcy5wYXJhbXMuY29sb3I7XG4gICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICBjdHgubW92ZVRvKC1pU2hpZnQsIHRoaXMuZ2V0WVBvc2l0aW9uKHRoaXMucGFyYW1zLm1pbikpO1xuICAgICAgY3R4LmxpbmVUbygtaVNoaWZ0LCB0aGlzLmdldFlQb3NpdGlvbih0aGlzLnBhcmFtcy5tYXgpKTtcbiAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCB7IGVuY29kZU1lc3NhZ2UgfSBmcm9tICcuLi91dGlscy9zb2NrZXQtdXRpbHMnO1xuXG4vLyBzZW5kIGFuIExmbyBzdHJlYW0gZnJvbSB0aGUgYnJvd3NlciBvdmVyIHRoZSBuZXR3b3JrXG4vLyB0aHJvdWdoIGEgV2ViU29ja2V0IC0gc2hvdWxkIGJlIHBhaXJlZCB3aXRoIGEgU29ja2V0U291cmNlU2VydmVyXG4vLyBATk9URTogZG9lcyBpdCBuZWVkIHRvIGltcGxlbWVudCBzb21lIHBpbmcgcHJvY2VzcyB0byBtYWludGFpbiBjb25uZWN0aW9uID9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvY2tldENsaWVudCBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgcG9ydDogMzAzMCxcbiAgICAgIGFkZHJlc3M6IHdpbmRvdy5sb2NhdGlvbi5ob3N0bmFtZVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5zb2NrZXQgPSBudWxsO1xuICAgIHRoaXMuaW5pdENvbm5lY3Rpb24oKTtcbiAgfVxuXG4gIGluaXRDb25uZWN0aW9uKCkge1xuICAgIHZhciBzb2NrZXRBZGRyID0gJ3dzOi8vJyArIHRoaXMucGFyYW1zLmFkZHJlc3MgKyAnOicgKyB0aGlzLnBhcmFtcy5wb3J0O1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChzb2NrZXRBZGRyKTtcbiAgICB0aGlzLnNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAgIC8vIGNhbGxiYWNrIHRvIHN0YXJ0IHRvIHdoZW4gV2ViU29ja2V0IGlzIGNvbm5lY3RlZFxuICAgIHRoaXMuc29ja2V0Lm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMucGFyYW1zLm9ub3BlbigpO1xuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKCkgPT4ge1xuXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9ICgpID0+IHtcblxuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgIH07XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIHZhciBidWZmZXIgPSBlbmNvZGVNZXNzYWdlKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSk7XG4gICAgdGhpcy5zb2NrZXQuc2VuZChidWZmZXIpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCAqIGFzIHdzIGZyb20gJ3dzJztcbmltcG9ydCB7IGVuY29kZU1lc3NhZ2UsIGFycmF5QnVmZmVyVG9CdWZmZXIgfSBmcm9tICcuLi91dGlscy9zb2NrZXQtdXRpbHMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvY2tldFNlcnZlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgcG9ydDogMzAzMVxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuaW5pdFNlcnZlcigpO1xuICB9XG5cbiAgaW5pdFNlcnZlcigpIHtcbiAgICB0aGlzLnNlcnZlciA9IG5ldyB3cy5TZXJ2ZXIoeyBwb3J0OiB0aGlzLnBhcmFtcy5wb3J0IH0pO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICB2YXIgYXJyYXlCdWZmZXIgPSBlbmNvZGVNZXNzYWdlKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSk7XG4gICAgdmFyIGJ1ZmZlciA9IGFycmF5QnVmZmVyVG9CdWZmZXIoYXJyYXlCdWZmZXIpO1xuXG4gICAgdGhpcy5zZXJ2ZXIuY2xpZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGNsaWVudCkge1xuICAgICAgY2xpZW50LnNlbmQoYnVmZmVyKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VEcmF3IGZyb20gJy4vYmFzZS1kcmF3JztcbmltcG9ydCB7IGdldFJhbmRvbUNvbG9yIH0gZnJvbSAnLi4vdXRpbHMvZHJhdy11dGlscyc7XG5cbmxldCBjb3VudGVyID0gMDtcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvbm9ncmFtIGV4dGVuZHMgQmFzZURyYXcge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgc2NhbGU6IDFcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHNldCBzY2FsZSh2YWx1ZSkge1xuICAgIHRoaXMucGFyYW1zLnNjYWxlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgc2NhbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyYW1zLnNjYWxlO1xuICB9XG5cbiAgZHJhd0N1cnZlKGZyYW1lLCBwcmV2aW91c0ZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG4gICAgY29uc3Qgc2NhbGUgPSB0aGlzLnBhcmFtcy5zY2FsZTtcbiAgICBjb25zdCBiaW5QZXJQaXhlbCA9IGZyYW1lLmxlbmd0aCAvIHRoaXMucGFyYW1zLmhlaWdodDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcbiAgICAgIC8vIGludGVycG9sYXRlIGJldHdlZW4gcHJldiBhbmQgbmV4dCBiaW5zXG4gICAgICAvLyBpcyBub3QgYSB2ZXJ5IGdvb2Qgc3RyYXRlZ3kgaWYgbW9yZSB0aGFuIHR3byBiaW5zIHBlciBwaXhlbHNcbiAgICAgIC8vIHNvbWUgdmFsdWVzIHdvbid0IGJlIHRha2VuIGludG8gYWNjb3VudFxuICAgICAgLy8gdGhpcyBoYWNrIGlzIG5vdCByZWxpYWJsZVxuICAgICAgLy8gLT4gY291bGQgd2UgcmVzYW1wbGUgdGhlIGZyYW1lIGluIGZyZXF1ZW5jeSBkb21haW4gP1xuICAgICAgY29uc3QgZkJpbiA9IGkgKiBiaW5QZXJQaXhlbDtcbiAgICAgIGNvbnN0IHByZXZCaW5JbmRleCA9IE1hdGguZmxvb3IoZkJpbik7XG4gICAgICBjb25zdCBuZXh0QmluSW5kZXggPSBNYXRoLmNlaWwoZkJpbik7XG5cbiAgICAgIGNvbnN0IHByZXZCaW4gPSBmcmFtZVtwcmV2QmluSW5kZXhdO1xuICAgICAgY29uc3QgbmV4dEJpbiA9IGZyYW1lW25leHRCaW5JbmRleF07XG5cbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZkJpbiAtIHByZXZCaW5JbmRleDtcbiAgICAgIGNvbnN0IHNsb3BlID0gKG5leHRCaW4gLSBwcmV2QmluKTtcbiAgICAgIGNvbnN0IGludGVyY2VwdCA9IHByZXZCaW47XG4gICAgICBjb25zdCB3ZWlnaHRlZEJpbiA9IHNsb3BlICogcG9zaXRpb24gKyBpbnRlcmNlcHQ7XG4gICAgICBjb25zdCBzcXJ0V2VpZ2h0ZWRCaW4gPSB3ZWlnaHRlZEJpbiAqIHdlaWdodGVkQmluO1xuXG4gICAgICBjb25zdCB5ID0gdGhpcy5wYXJhbXMuaGVpZ2h0IC0gaTtcbiAgICAgIGNvbnN0IGMgPSBNYXRoLnJvdW5kKHNxcnRXZWlnaHRlZEJpbiAqIHNjYWxlICogMjU1KTtcblxuICAgICAgY3R4LmZpbGxTdHlsZSA9IGByZ2JhKCR7Y30sICR7Y30sICR7Y30sIDEpYDtcbiAgICAgIGN0eC5maWxsUmVjdCgtaVNoaWZ0LCB5LCBpU2hpZnQsIC0xKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlRHJhdyBmcm9tICcuL2Jhc2UtZHJhdyc7XG5pbXBvcnQgeyBnZXRSYW5kb21Db2xvciB9IGZyb20gJy4uL3V0aWxzL2RyYXctdXRpbHMnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNwZWN0cm9ncmFtIGV4dGVuZHMgQmFzZURyYXcge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgbWluOiAwLFxuICAgICAgbWF4OiAxLFxuICAgICAgc2NhbGU6IDEsXG4gICAgICBjb2xvcjogZ2V0UmFuZG9tQ29sb3IoKSxcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIHNldCBzY2FsZSh2YWx1ZSkge1xuICAgIHRoaXMucGFyYW1zLnNjYWxlID0gdmFsdWU7XG4gIH1cblxuICBnZXQgc2NhbGUoKSB7XG4gICAgcmV0dXJuIHRoaXMucGFyYW1zLnNjYWxlO1xuICB9XG5cbiAgLy8gbm8gbmVlZCB0byBzY3JvbGwgb3IgYW55dGhpbmdcbiAgZXhlY3V0ZURyYXcodGltZSwgZnJhbWUpIHtcbiAgICB0aGlzLmRyYXdDdXJ2ZShmcmFtZSk7XG4gIH1cblxuICBkcmF3Q3VydmUoZnJhbWUpIHtcbiAgICBjb25zdCBuYnJCaW5zID0gZnJhbWUubGVuZ3RoO1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5wYXJhbXMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJhbXMuaGVpZ2h0O1xuICAgIGNvbnN0IGJpbldpZHRoID0gd2lkdGggLyBuYnJCaW5zO1xuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5wYXJhbXMuc2NhbGU7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wYXJhbXMuY29sb3I7XG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcblxuICAgIC8vIGVycm9yIGhhbmRsaW5nIG5lZWRzIHJldmlldy4uLlxuICAgIGxldCBlcnJvciA9IDA7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG5ickJpbnM7IGkrKykge1xuICAgICAgY29uc3QgeDFGbG9hdCA9IGkgKiBiaW5XaWR0aCArIGVycm9yO1xuICAgICAgY29uc3QgeDFJbnQgPSBNYXRoLnJvdW5kKHgxRmxvYXQpO1xuICAgICAgY29uc3QgeDJGbG9hdCA9IHgxRmxvYXQgKyAoYmluV2lkdGggLSBlcnJvcik7XG4gICAgICBjb25zdCB4MkludCA9IE1hdGgucm91bmQoeDJGbG9hdCk7XG5cbiAgICAgIGVycm9yID0geDJJbnQgLSB4MkZsb2F0O1xuXG4gICAgICBpZiAoeDFJbnQgIT09IHgySW50KSB7XG4gICAgICAgIGNvbnN0IHdpZHRoID0geDJJbnQgLSB4MUludDtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMuZ2V0WVBvc2l0aW9uKGZyYW1lW2ldICogc2NhbGUpO1xuICAgICAgICBjdHguZmlsbFJlY3QoeDFJbnQsIHksIHdpZHRoLCBoZWlnaHQgLSB5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVycm9yIC09IGJpbldpZHRoO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiLyoqXG4gKiBpcyB1c2VkIHRvIGtlZXAgc2V2ZXJhbCBkcmF3IGluIHN5bmNcbiAqIHdoZW4gYSB2aWV3IGlzIGluc3RhbGxlZCBpbiBhIHN5bmNocm9uaXplZCBkcmF3XG4gKiB0aGUgbWV0YSB2aWV3IGlzIGluc3RhbGxlZCBhcyBhIG1lbWJlciBvZiBhbGwgaXQncyBjaGlsZHJlblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTeW5jaHJvbml6ZWREcmF3IHtcbiAgY29uc3RydWN0b3IoLi4udmlld3MpIHtcbiAgICB0aGlzLnZpZXdzID0gW107XG4gICAgdGhpcy5hZGQoLi4udmlld3MpO1xuICB9XG5cbiAgYWRkKC4uLnZpZXdzKSB7XG4gICAgdmlld3MuZm9yRWFjaCh2aWV3ID0+IHsgdGhpcy5pbnN0YWxsKHZpZXcpOyB9KTtcbiAgfVxuXG4gIGluc3RhbGwodmlldykge1xuICAgIHRoaXMudmlld3MucHVzaCh2aWV3KTtcbiAgICB2aWV3LnBhcmFtcy5pc1N5bmNocm9uaXplZCA9IHRydWU7XG4gICAgdmlldy5zeW5jaHJvbml6ZXIgPSB0aGlzO1xuICB9XG5cbiAgc2hpZnRTaWJsaW5ncyhpU2hpZnQsIHZpZXcpIHtcbiAgICB0aGlzLnZpZXdzLmZvckVhY2goKGNoaWxkKSA9PiB7XG4gICAgICBpZiAoY2hpbGQgPT09IHZpZXcpIHsgcmV0dXJuOyB9XG4gICAgICBjaGlsZC5zaGlmdENhbnZhcyhpU2hpZnQpO1xuICAgIH0pO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IsIGdldEh1ZSwgaGV4VG9SR0IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVHJhY2UgZXh0ZW5kcyBCYXNlRHJhdyB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIGNvbG9yU2NoZW1lOiAnbm9uZScsIC8vIGNvbG9yLCBvcGFjaXR5XG4gICAgICBjb2xvcjogZ2V0UmFuZG9tQ29sb3IoKSxcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldkZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBsZXQgY29sb3IsIGdyYWRpZW50O1xuXG4gICAgY29uc3QgaGFsZlJhbmdlID0gZnJhbWVbMV0gLyAyO1xuICAgIGNvbnN0IG1lYW4gPSB0aGlzLmdldFlQb3NpdGlvbihmcmFtZVswXSk7XG4gICAgY29uc3QgbWluID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbMF0gLSBoYWxmUmFuZ2UpO1xuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0WVBvc2l0aW9uKGZyYW1lWzBdICsgaGFsZlJhbmdlKTtcblxuICAgIGxldCBwcmV2SGFsZlJhbmdlO1xuICAgIGxldCBwcmV2TWluO1xuICAgIGxldCBwcmV2TWF4O1xuXG4gICAgaWYgKHByZXZGcmFtZSkge1xuICAgICAgcHJldkhhbGZSYW5nZSA9IHByZXZGcmFtZVsxXSAvIDI7XG4gICAgICBwcmV2TWluID0gdGhpcy5nZXRZUG9zaXRpb24ocHJldkZyYW1lWzBdIC0gcHJldkhhbGZSYW5nZSk7XG4gICAgICBwcmV2TWF4ID0gdGhpcy5nZXRZUG9zaXRpb24ocHJldkZyYW1lWzBdICsgcHJldkhhbGZSYW5nZSk7XG4gICAgfVxuXG4gICAgc3dpdGNoICh0aGlzLnBhcmFtcy5jb2xvclNjaGVtZSkge1xuICAgICAgY2FzZSAnbm9uZSc6XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnBhcmFtcy5jb2xvcjtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaHVlJzpcbiAgICAgICAgZ3JhZGllbnQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoLWlTaGlmdCwgMCwgMCwgMCk7XG5cbiAgICAgICAgaWYgKHByZXZGcmFtZSlcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ2hzbCgnICsgZ2V0SHVlKHByZXZGcmFtZVsyXSkgKyAnLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ2hzbCgnICsgZ2V0SHVlKGZyYW1lWzJdKSArICcsIDEwMCUsIDUwJSknKTtcblxuICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMSwgJ2hzbCgnICsgZ2V0SHVlKGZyYW1lWzJdKSArICcsIDEwMCUsIDUwJSknKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdvcGFjaXR5JzpcbiAgICAgICAgY29uc3QgcmdiID0gaGV4VG9SR0IodGhpcy5wYXJhbXMuY29sb3IpO1xuICAgICAgICBncmFkaWVudCA9IGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCgtaVNoaWZ0LCAwLCAwLCAwKTtcblxuICAgICAgICBpZiAocHJldkZyYW1lKVxuICAgICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgwLCAncmdiYSgnICsgcmdiLmpvaW4oJywnKSArICcsJyArIHByZXZGcmFtZVsyXSArICcpJyk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ3JnYmEoJyArIHJnYi5qb2luKCcsJykgKyAnLCcgKyBmcmFtZVsyXSArICcpJyk7XG5cbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsICdyZ2JhKCcgKyByZ2Iuam9pbignLCcpICsgJywnICsgZnJhbWVbMl0gKyAnKScpO1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gZ3JhZGllbnQ7XG4gICAgICBicmVhaztcbiAgICB9XG5cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHgubW92ZVRvKDAsIG1lYW4pO1xuICAgIGN0eC5saW5lVG8oMCwgbWF4KTtcblxuICAgIGlmIChwcmV2RnJhbWUpIHtcbiAgICAgIGN0eC5saW5lVG8oLWlTaGlmdCwgcHJldk1heCk7XG4gICAgICBjdHgubGluZVRvKC1pU2hpZnQsIHByZXZNaW4pO1xuICAgIH1cblxuICAgIGN0eC5saW5lVG8oMCwgbWluKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG5cbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVHJhY2U7XG4iLCJpbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXYXZlZm9ybSBleHRlbmRzIEJhc2VEcmF3IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIGNvbG9yOiBnZXRSYW5kb21Db2xvcigpLFxuICAgIH0sIG9wdGlvbnMpO1xuICB9XG5cbiAgZHJhd0N1cnZlKGZyYW1lLCBwcmV2aW91c0ZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBjb25zdCBtaW4gPSB0aGlzLmdldFlQb3NpdGlvbihmcmFtZVswXSk7XG4gICAgY29uc3QgbWF4ID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbMV0pO1xuXG4gICAgY3R4LnNhdmUoKTtcblxuICAgIGN0eC5maWxsU3R5bGUgPSB0aGlzLnBhcmFtcy5jb2xvcjtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG5cbiAgICBjdHgubW92ZVRvKDAsIHRoaXMuZ2V0WVBvc2l0aW9uKDApKTtcbiAgICBjdHgubGluZVRvKDAsIG1heCk7XG5cbiAgICBpZiAocHJldmlvdXNGcmFtZSkge1xuICAgICAgY29uc3QgcHJldk1pbiA9IHRoaXMuZ2V0WVBvc2l0aW9uKHByZXZpb3VzRnJhbWVbMF0pO1xuICAgICAgY29uc3QgcHJldk1heCA9IHRoaXMuZ2V0WVBvc2l0aW9uKHByZXZpb3VzRnJhbWVbMV0pO1xuICAgICAgY3R4LmxpbmVUbygtaVNoaWZ0LCBwcmV2TWF4KTtcbiAgICAgIGN0eC5saW5lVG8oLWlTaGlmdCwgcHJldk1pbik7XG4gICAgfVxuXG4gICAgY3R4LmxpbmVUbygwLCBtaW4pO1xuXG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgIGN0eC5maWxsKCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cbmNvbnN0IHdvcmtlckNvZGUgPSBgXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiBwcm9jZXNzKGUpIHtcbiAgdmFyIGJsb2NrU2l6ZSA9IGUuZGF0YS5ibG9ja1NpemU7XG4gIHZhciBidWZmZXJTb3VyY2UgPSBlLmRhdGEuYnVmZmVyO1xuICB2YXIgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXJTb3VyY2UpO1xuICB2YXIgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgdmFyIGluZGV4ID0gMDtcblxuICB3aGlsZSAoaW5kZXggPCBsZW5ndGgpIHtcbiAgICB2YXIgY29weVNpemUgPSBNYXRoLm1pbihsZW5ndGggLSBpbmRleCwgYmxvY2tTaXplKTtcbiAgICB2YXIgYmxvY2sgPSBidWZmZXIuc3ViYXJyYXkoaW5kZXgsIGluZGV4ICsgY29weVNpemUpO1xuICAgIHZhciBzZW5kQmxvY2sgPSBuZXcgRmxvYXQzMkFycmF5KGJsb2NrKTtcblxuICAgIHBvc3RNZXNzYWdlKHtcbiAgICAgIGNvbW1hbmQ6ICdwcm9jZXNzJyxcbiAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgIGJ1ZmZlcjogc2VuZEJsb2NrLmJ1ZmZlcixcbiAgICB9LCBbc2VuZEJsb2NrLmJ1ZmZlcl0pO1xuXG4gICAgaW5kZXggKz0gY29weVNpemU7XG4gIH1cblxuICBwb3N0TWVzc2FnZSh7XG4gICAgY29tbWFuZDogJ2ZpbmFsaXplJyxcbiAgICBpbmRleDogaW5kZXgsXG4gICAgYnVmZmVyOiBidWZmZXJTb3VyY2UsXG4gIH0sIFtidWZmZXJTb3VyY2VdKTtcbn0sIGZhbHNlKWA7XG5cblxuY2xhc3MgX1BzZXVkb1dvcmtlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2NhbGxiYWNrID0gbnVsbDtcbiAgfVxuXG4gIHBvc3RNZXNzYWdlKGUpIHtcbiAgICBjb25zdCBibG9ja1NpemUgPSBlLmJsb2NrU2l6ZTtcbiAgICBjb25zdCBidWZmZXJTb3VyY2UgPSBlLmJ1ZmZlcjtcbiAgICBjb25zdCBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlclNvdXJjZSk7XG4gICAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgICBjb25zdCB0aGF0ID0gdGhpcztcbiAgICBsZXQgaW5kZXggPSAwO1xuXG4gICAgKGZ1bmN0aW9uIHNsaWNlKCkge1xuICAgICAgaWYgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgIHZhciBjb3B5U2l6ZSA9IE1hdGgubWluKGxlbmd0aCAtIGluZGV4LCBibG9ja1NpemUpO1xuICAgICAgICB2YXIgYmxvY2sgPSBidWZmZXIuc3ViYXJyYXkoaW5kZXgsIGluZGV4ICsgY29weVNpemUpO1xuICAgICAgICB2YXIgc2VuZEJsb2NrID0gbmV3IEZsb2F0MzJBcnJheShibG9jayk7XG5cbiAgICAgICAgdGhhdC5fc2VuZCh7XG4gICAgICAgICAgY29tbWFuZDogJ3Byb2Nlc3MnLFxuICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICBidWZmZXI6IHNlbmRCbG9jay5idWZmZXIsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGluZGV4ICs9IGNvcHlTaXplO1xuICAgICAgICBzZXRUaW1lb3V0KHNsaWNlLCAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuX3NlbmQoe1xuICAgICAgICAgIGNvbW1hbmQ6ICdmaW5hbGl6ZScsXG4gICAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICAgIGJ1ZmZlcjogYnVmZmVyLFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KCkpO1xuICB9XG5cbiAgYWRkTGlzdGVuZXIoY2FsbGJhY2spIHtcbiAgICB0aGlzLl9jYWxsYmFjayA9IGNhbGxiYWNrO1xuICB9XG5cbiAgX3NlbmQobXNnKSB7XG4gICAgdGhpcy5fY2FsbGJhY2soeyBkYXRhOiBtc2cgfSk7XG4gIH1cbn1cblxuLyoqXG4gKiBBdWRpb0J1ZmZlciBhcyBzb3VyY2UsIHNsaWNlZCBpdCBpbiBibG9ja3MgdGhyb3VnaCBhIHdvcmtlclxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdWRpb0luQnVmZmVyIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKHtcbiAgICAgIGZyYW1lU2l6ZTogNTEyLFxuICAgICAgY2hhbm5lbDogMCxcbiAgICAgIGN0eDogbnVsbCxcbiAgICAgIGJ1ZmZlcjogbnVsbCxcbiAgICAgIHVzZVdvcmtlcjogdHJ1ZSxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuYnVmZmVyID0gdGhpcy5wYXJhbXMuYnVmZmVyO1xuICAgIHRoaXMuZW5kVGltZSA9IDA7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmN0eCB8fCAhKHRoaXMucGFyYW1zLmN0eCBpbnN0YW5jZW9mIEF1ZGlvQ29udGV4dCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgYXVkaW8gY29udGV4dCBwYXJhbWV0ZXIgKGN0eCknKTtcblxuICAgIGlmICghdGhpcy5wYXJhbXMuYnVmZmVyIHx8ICEodGhpcy5wYXJhbXMuYnVmZmVyIGluc3RhbmNlb2YgQXVkaW9CdWZmZXIpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGF1ZGlvIGJ1ZmZlciBwYXJhbWV0ZXIgKGJ1ZmZlciknKTtcblxuICAgIHRoaXMuYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJDb2RlXSwgeyB0eXBlOiBcInRleHQvamF2YXNjcmlwdFwiIH0pO1xuICAgIHRoaXMud29ya2VyID0gbnVsbDtcblxuICAgIHRoaXMucHJvY2VzcyA9IHRoaXMucHJvY2Vzcy5iaW5kKHRoaXMpO1xuICB9XG5cbiAgc2V0dXBTdHJlYW0oKSB7XG4gICAgdGhpcy5vdXRGcmFtZSA9IG51bGw7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoe1xuICAgICAgZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5mcmFtZVNpemUsXG4gICAgICBmcmFtZVJhdGU6IHRoaXMuYnVmZmVyLnNhbXBsZVJhdGUgLyB0aGlzLnBhcmFtcy5mcmFtZVNpemUsXG4gICAgICBzb3VyY2VTYW1wbGVSYXRlOiB0aGlzLmJ1ZmZlci5zYW1wbGVSYXRlLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLnVzZVdvcmtlcikge1xuICAgICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKHRoaXMuYmxvYikpO1xuICAgICAgdGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIHRoaXMucHJvY2VzcywgZmFsc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLndvcmtlciA9IG5ldyBfUHNldWRvV29ya2VyKCk7XG4gICAgICB0aGlzLndvcmtlci5hZGRMaXN0ZW5lcih0aGlzLnByb2Nlc3MpO1xuICAgIH1cblxuICAgIHRoaXMuZW5kVGltZSA9IDA7XG5cbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLmJ1ZmZlci5nZXRDaGFubmVsRGF0YSh0aGlzLnBhcmFtcy5jaGFubmVsKS5idWZmZXI7XG4gICAgbGV0IHNlbmRCdWZmZXIgPSBidWZmZXI7XG5cbiAgICBpZiAodGhpcy5wYXJhbXMudXNlV29ya2VyKVxuICAgICAgc2VuZEJ1ZmZlciA9IGJ1ZmZlci5zbGljZSgwKTtcblxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIGJsb2NrU2l6ZTogdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplLFxuICAgICAgYnVmZmVyOiBzZW5kQnVmZmVyLFxuICAgIH0sIFtzZW5kQnVmZmVyXSk7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIHRoaXMud29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgIHRoaXMud29ya2VyID0gbnVsbDtcblxuICAgIHRoaXMuZmluYWxpemUodGhpcy5lbmRUaW1lKTtcbiAgfVxuXG4gIC8vIHdvcmtlciBjYWxsYmFja1xuICBwcm9jZXNzKGUpIHtcbiAgICBjb25zdCBzb3VyY2VTYW1wbGVSYXRlID0gdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZTtcbiAgICBjb25zdCBjb21tYW5kID0gZS5kYXRhLmNvbW1hbmQ7XG4gICAgY29uc3QgaW5kZXggPSBlLmRhdGEuaW5kZXg7XG4gICAgY29uc3QgYnVmZmVyID0gZS5kYXRhLmJ1ZmZlcjtcbiAgICBjb25zdCB0aW1lID0gaW5kZXggLyBzb3VyY2VTYW1wbGVSYXRlO1xuXG4gICAgaWYgKGNvbW1hbmQgPT09ICdmaW5hbGl6ZScpIHtcbiAgICAgIHRoaXMuZmluYWxpemUodGltZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMub3V0RnJhbWUgPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlcik7XG4gICAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgICAgdGhpcy5vdXRwdXQoKTtcblxuICAgICAgdGhpcy5lbmRUaW1lID0gdGhpcy50aW1lICsgdGhpcy5vdXRGcmFtZS5sZW5ndGggLyBzb3VyY2VTYW1wbGVSYXRlO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cbi8qKlxuICogIFVzZSBhIFdlYkF1ZGlvIG5vZGUgYXMgYSBzb3VyY2VcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9Jbk5vZGUgZXh0ZW5kcyBCYXNlTGZvIHtcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcih7XG4gICAgICBmcmFtZVNpemU6IDUxMixcbiAgICAgIGNoYW5uZWw6IDAsXG4gICAgICBjdHg6IG51bGwsXG4gICAgICBzcmM6IG51bGwsXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmN0eCB8fCAhKHRoaXMucGFyYW1zLmN0eCBpbnN0YW5jZW9mIEF1ZGlvQ29udGV4dCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBhdWRpbyBjb250ZXh0IHBhcmFtZXRlciAoY3R4KScpO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5wYXJhbXMuc3JjIHx8ICEodGhpcy5wYXJhbXMuc3JjIGluc3RhbmNlb2YgQXVkaW9Ob2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGF1ZGlvIHNvdXJjZSBub2RlIHBhcmFtZXRlciAoc3JjKScpO1xuICAgIH1cbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5wYXJhbXMuY3R4O1xuXG4gICAgc3VwZXIuaW5pdGlhbGl6ZSh7XG4gICAgICBmcmFtZVNpemU6IHRoaXMucGFyYW1zLmZyYW1lU2l6ZSxcbiAgICAgIGZyYW1lUmF0ZTogY3R4LnNhbXBsZVJhdGUgLyB0aGlzLnBhcmFtcy5mcmFtZVNpemUsXG4gICAgICBzb3VyY2VTYW1wbGVSYXRlOiBjdHguc2FtcGxlUmF0ZSxcbiAgICB9KTtcblxuICAgIHZhciBibG9ja1NpemUgPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG4gICAgdGhpcy5zY3JpcHRQcm9jZXNzb3IgPSBjdHguY3JlYXRlU2NyaXB0UHJvY2Vzc29yKGJsb2NrU2l6ZSwgMSwgMSk7XG5cbiAgICAvLyBwcmVwYXJlIGF1ZGlvIGdyYXBoXG4gICAgdGhpcy5zY3JpcHRQcm9jZXNzb3Iub25hdWRpb3Byb2Nlc3MgPSB0aGlzLnByb2Nlc3MuYmluZCh0aGlzKTtcbiAgICB0aGlzLnBhcmFtcy5zcmMuY29ubmVjdCh0aGlzLnNjcmlwdFByb2Nlc3Nvcik7XG4gIH1cblxuICAvLyBjb25uZWN0IHRoZSBhdWRpbyBub2RlcyB0byBzdGFydCBzdHJlYW1pbmdcbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuICAgIHRoaXMudGltZSA9IDA7XG4gICAgdGhpcy5zY3JpcHRQcm9jZXNzb3IuY29ubmVjdCh0aGlzLnBhcmFtcy5jdHguZGVzdGluYXRpb24pO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLmZpbmFsaXplKHRoaXMudGltZSk7XG4gICAgdGhpcy5zY3JpcHRQcm9jZXNzb3IuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgLy8gaXMgYmFzaWNhbGx5IHRoZSBgc2NyaXB0UHJvY2Vzc29yLm9uYXVkaW9wcm9jZXNzYCBjYWxsYmFja1xuICBwcm9jZXNzKGUpIHtcbiAgICBjb25zdCBibG9jayA9IGUuaW5wdXRCdWZmZXIuZ2V0Q2hhbm5lbERhdGEodGhpcy5wYXJhbXMuY2hhbm5lbCk7XG5cbiAgICBpZiAoIXRoaXMuYmxvY2tEdXJhdGlvbilcbiAgICAgIHRoaXMuYmxvY2tEdXJhdGlvbiA9IGJsb2NrLmxlbmd0aCAvIHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGU7XG5cbiAgICB0aGlzLm91dEZyYW1lID0gYmxvY2s7XG4gICAgdGhpcy5vdXRwdXQoKTtcblxuICAgIHRoaXMudGltZSArPSB0aGlzLmJsb2NrRHVyYXRpb247XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEV2ZW50SW4gZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIGFic29sdXRlVGltZTogZmFsc2UsXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyB0ZXN0IEF1ZGlvQ29udGV4dCBmb3IgdXNlIGluIG5vZGUgZW52aXJvbm1lbnRcbiAgICBpZiAoIXRoaXMucGFyYW1zLmN0eCAmJiAodHlwZW9mIHByb2Nlc3MgPT09ICd1bmRlZmluZWQnKSkge1xuICAgICAgdGhpcy5wYXJhbXMuY3R4ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuICAgIH1cblxuICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGluaXRpYWxpemUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZSh7XG4gICAgICBmcmFtZVNpemU6IHRoaXMucGFyYW1zLmZyYW1lU2l6ZSxcbiAgICAgIGZyYW1lUmF0ZTogdGhpcy5wYXJhbXMuZnJhbWVSYXRlLFxuICAgICAgc291cmNlU2FtcGxlUmF0ZTogdGhpcy5wYXJhbXMuZnJhbWVSYXRlLFxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuXG4gICAgY29uc3QgY3VycmVudFRpbWUgPSB0aGlzLnBhcmFtcy5jdHguY3VycmVudFRpbWU7XG5cbiAgICAvLyBzaG91bGQgYmUgc2V0dGVkIGluIHRoZSBmaXJzdCBwcm9jZXNzIGNhbGxcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3N0YXJ0VGltZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9sYXN0VGltZSA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgaWYgKHRoaXMuX2lzU3RhcnRlZCAmJiB0aGlzLl9zdGFydFRpbWUpIHtcbiAgICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gdGhpcy5wYXJhbXMuY3R4LmN1cnJlbnRUaW1lO1xuICAgICAgY29uc3QgZW5kVGltZSA9IHRoaXMudGltZSArIChjdXJyZW50VGltZSAtIHRoaXMuX2xhc3RUaW1lKTtcblxuICAgICAgdGhpcy5maW5hbGl6ZShlbmRUaW1lKTtcbiAgICB9XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSA9IHt9KSB7XG4gICAgaWYgKCF0aGlzLl9pc1N0YXJ0ZWQpIHJldHVybjtcblxuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gdGhpcy5wYXJhbXMuY3R4LmN1cnJlbnRUaW1lO1xuICAgIC8vIGlmIG5vIHRpbWUgcHJvdmlkZWQsIHVzZSBhdWRpb0NvbnRleHQuY3VycmVudFRpbWVcbiAgICB0aW1lID0gIWlzTmFOKHBhcnNlRmxvYXQodGltZSkpICYmIGlzRmluaXRlKHRpbWUpID9cbiAgICAgIHRpbWUgOiBjdXJyZW50VGltZTtcblxuICAgIC8vIHNldCBgc3RhcnRUaW1lYCBpZiBmaXJzdCBjYWxsIGFmdGVyIGEgYHN0YXJ0YFxuICAgIGlmICghdGhpcy5fc3RhcnRUaW1lKVxuICAgICAgdGhpcy5fc3RhcnRUaW1lID0gdGltZTtcblxuICAgIC8vIGhhbmRsZSB0aW1lIGFjY29yZGluZyB0byBjb25maWdcbiAgICBpZiAodGhpcy5wYXJhbXMuYWJzb2x1dGVUaW1lID09PSBmYWxzZSlcbiAgICAgIHRpbWUgPSB0aW1lIC0gdGhpcy5fc3RhcnRUaW1lO1xuXG4gICAgLy8gaWYgc2NhbGFyLCBjcmVhdGUgYSB2ZWN0b3JcbiAgICBpZiAoZnJhbWUubGVuZ3RoID09PSB1bmRlZmluZWQpXG4gICAgICBmcmFtZSA9IFtmcmFtZV07XG5cbiAgICAvLyB3b3JrcyBpZiBmcmFtZSBpcyBhbiBhcnJheVxuICAgIHRoaXMub3V0RnJhbWUuc2V0KGZyYW1lLCAwKTtcbiAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcbiAgICB0aGlzLl9sYXN0VGltZSA9IGN1cnJlbnRUaW1lO1xuXG4gICAgdGhpcy5vdXRwdXQoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50SW47XG4iLCJpbXBvcnQgQXVkaW9JbkJ1ZmZlciBmcm9tICcuL2F1ZGlvLWluLWJ1ZmZlcic7XG5pbXBvcnQgQXVkaW9Jbk5vZGUgZnJvbSAnLi9hdWRpby1pbi1ub2RlJztcbmltcG9ydCBFdmVudEluIGZyb20gJy4vZXZlbnQtaW4nO1xuaW1wb3J0IFNvY2tldENsaWVudCBmcm9tICcuL3NvY2tldC1jbGllbnQnO1xuaW1wb3J0IFNvY2tldFNlcnZlciBmcm9tICcuL3NvY2tldC1zZXJ2ZXInO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIEF1ZGlvSW5CdWZmZXIsXG4gIEF1ZGlvSW5Ob2RlLFxuICBFdmVudEluLFxuICBTb2NrZXRDbGllbnQsXG4gIFNvY2tldFNlcnZlcixcbn07XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCB7IGRlY29kZU1lc3NhZ2UgfSBmcm9tICcuLi91dGlscy9zb2NrZXQtdXRpbHMnO1xuXG5cbi8vIEBUT0RPOiBoYW5kbGUgYHN0YXJ0YCBhbmQgYHN0b3BgXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2NrZXRDbGllbnQgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIHBvcnQ6IDMwMzEsXG4gICAgICBhZGRyZXNzOiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWVcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuc29ja2V0ID0gbnVsbDtcbiAgICB0aGlzLmluaXRDb25uZWN0aW9uKCk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUodW5kZWZpbmVkLCB7XG4gICAgICBmcmFtZVNpemU6IHRoaXMucGFyYW1zLmZyYW1lU2l6ZSxcbiAgICAgIGZyYW1lUmF0ZTogdGhpcy5wYXJhbXMuZnJhbWVSYXRlLFxuICAgIH0pO1xuICB9XG5cbiAgaW5pdENvbm5lY3Rpb24oKSB7XG4gICAgdmFyIHNvY2tldEFkZHIgPSAnd3M6Ly8nICsgdGhpcy5wYXJhbXMuYWRkcmVzcyArICc6JyArIHRoaXMucGFyYW1zLnBvcnQ7XG4gICAgdGhpcy5zb2NrZXQgPSBuZXcgV2ViU29ja2V0KHNvY2tldEFkZHIpO1xuICAgIHRoaXMuc29ja2V0LmJpbmFyeVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG4gICAgLy8gY2FsbGJhY2sgdG8gc3RhcnQgdG8gd2hlbiBXZWJTb2NrZXQgaXMgY29ubmVjdGVkXG4gICAgdGhpcy5zb2NrZXQub25vcGVuID0gKCkgPT4ge1xuICAgICAgdGhpcy5zdGFydCgpO1xuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5vbmNsb3NlID0gKCkgPT4ge1xuXG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0Lm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XG4gICAgICB0aGlzLnByb2Nlc3MobWVzc2FnZS5kYXRhKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlcnIpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9O1xuICB9XG5cbiAgcHJvY2VzcyhidWZmZXIpIHtcbiAgICB2YXIgbWVzc2FnZSA9IGRlY29kZU1lc3NhZ2UoYnVmZmVyKTtcblxuICAgIHRoaXMudGltZSA9IG1lc3NhZ2UudGltZTtcbiAgICB0aGlzLm91dEZyYW1lID0gbWVzc2FnZS5mcmFtZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWVzc2FnZS5tZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuaW1wb3J0ICogYXMgd3MgZnJvbSAnd3MnO1xuaW1wb3J0IHsgYnVmZmVyVG9BcnJheUJ1ZmZlciwgZGVjb2RlTWVzc2FnZSB9IGZyb20gJy4uL3V0aWxzL3NvY2tldC11dGlscyc7XG5cblxuLy8gQFRPRE86IGhhbmRsZSBgc3RhcnRgIGFuZCBgc3RvcGBcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNvY2tldFNlcnZlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgcG9ydDogMzAzMFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gQFRPRE8gaGFuZGxlIGRpc2Nvbm5lY3QgYW5kIHNvIG9uLi4uXG4gICAgdGhpcy5jbGllbnRzID0gW107XG4gICAgdGhpcy5zZXJ2ZXIgPSBudWxsO1xuICAgIHRoaXMuaW5pdFNlcnZlcigpO1xuXG4gICAgLy8gQEZJWE1FIC0gcmlnaHQgcGxhY2UgP1xuICAgIHRoaXMuc3RhcnQoKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIGluaXRTZXJ2ZXIoKSB7XG4gICAgdGhpcy5zZXJ2ZXIgPSBuZXcgd3MuU2VydmVyKHsgcG9ydDogdGhpcy5wYXJhbXMucG9ydCB9KTtcblxuICAgIHRoaXMuc2VydmVyLm9uKCdjb25uZWN0aW9uJywgc29ja2V0ID0+IHtcbiAgICAgIC8vIHRoaXMuY2xpZW50cy5wdXNoKHNvY2tldCk7XG4gICAgICBzb2NrZXQub24oJ21lc3NhZ2UnLCB0aGlzLnByb2Nlc3MuYmluZCh0aGlzKSk7XG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzKGJ1ZmZlcikge1xuICAgIHZhciBhcnJheUJ1ZmZlciA9IGJ1ZmZlclRvQXJyYXlCdWZmZXIoYnVmZmVyKTtcbiAgICB2YXIgbWVzc2FnZSA9IGRlY29kZU1lc3NhZ2UoYXJyYXlCdWZmZXIpO1xuXG4gICAgdGhpcy50aW1lID0gbWVzc2FnZS50aW1lO1xuICAgIHRoaXMub3V0RnJhbWUgPSBtZXNzYWdlLmZyYW1lO1xuICAgIHRoaXMubWV0YURhdGEgPSBtZXNzYWdlLm1ldGFEYXRhO1xuXG4gICAgdGhpcy5vdXRwdXQoKTtcbiAgfVxufVxuIiwiLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8xNDg0NTA2L3JhbmRvbS1jb2xvci1nZW5lcmF0b3ItaW4tamF2YXNjcmlwdFxuZXhwb3J0IGNvbnN0IGdldFJhbmRvbUNvbG9yID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnLnNwbGl0KCcnKTtcbiAgdmFyIGNvbG9yID0gJyMnO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKyApIHtcbiAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gIH1cbiAgcmV0dXJuIGNvbG9yO1xufTtcblxuLy8gc2NhbGUgZnJvbSBkb21haW4gWzAsIDFdIHRvIHJhbmdlIFsyNzAsIDBdIHRvIGNvbnN1bWUgaW5cbi8vIGhzbCh4LCAxMDAlLCA1MCUpIGNvbG9yIHNjaGVtZVxuZXhwb3J0IGNvbnN0IGdldEh1ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgdmFyIGRvbWFpbk1pbiA9IDA7XG4gIHZhciBkb21haW5NYXggPSAxO1xuICB2YXIgcmFuZ2VNaW4gPSAyNzA7XG4gIHZhciByYW5nZU1heCA9IDA7XG5cbiAgcmV0dXJuICgoKHJhbmdlTWF4IC0gcmFuZ2VNaW4pICogKHggLSBkb21haW5NaW4pKSAvIChkb21haW5NYXggLSBkb21haW5NaW4pKSArIHJhbmdlTWluO1xufTtcblxuZXhwb3J0IGNvbnN0IGhleFRvUkdCID0gZnVuY3Rpb24oaGV4KSB7XG4gIGhleCA9IGhleC5zdWJzdHJpbmcoMSwgNyk7XG4gIHZhciByID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZygwLCAyKSwgMTYpO1xuICB2YXIgZyA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoMiwgNCksIDE2KTtcbiAgdmFyIGIgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDQsIDYpLCAxNik7XG4gIHJldHVybiBbciwgZywgYl07XG59O1xuIiwiXG4vLyBzaG9ydGN1dHMgLyBoZWxwZXJzXG5jb25zdCBQSSAgID0gTWF0aC5QSTtcbmNvbnN0IGNvcyAgPSBNYXRoLmNvcztcbmNvbnN0IHNpbiAgPSBNYXRoLnNpbjtcbmNvbnN0IHNxcnQgPSBNYXRoLnNxcnQ7XG5cbi8vIHdpbmRvdyBjcmVhdGlvbiBmdW5jdGlvbnNcbmZ1bmN0aW9uIGluaXRIYW5uV2luZG93KGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKSB7XG4gIGxldCBsaW5TdW0gPSAwO1xuICBsZXQgcG93U3VtID0gMDtcbiAgY29uc3Qgc3RlcCA9IDIgKiBQSSAvIHNpemU7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBjb25zdCBwaGkgPSBpICogc3RlcDtcbiAgICBjb25zdCB2YWx1ZSA9IDAuNSAtIDAuNSAqIGNvcyhwaGkpO1xuXG4gICAgYnVmZmVyW2ldID0gdmFsdWU7XG5cbiAgICBsaW5TdW0gKz0gdmFsdWU7XG4gICAgcG93U3VtICs9IHZhbHVlICogdmFsdWU7XG4gIH1cblxuICBub3JtQ29lZnMubGluZWFyID0gc2l6ZSAvIGxpblN1bTtcbiAgbm9ybUNvZWZzLnBvd2VyID0gc3FydChzaXplIC8gcG93U3VtKTtcbn1cblxuZnVuY3Rpb24gaW5pdEhhbW1pbmdXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgbGV0IGxpblN1bSA9IDA7XG4gIGxldCBwb3dTdW0gPSAwO1xuICBjb25zdCBzdGVwID0gMiAqIFBJIC8gc2l6ZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIGNvbnN0IHBoaSA9IGkgKiBzdGVwO1xuICAgIGNvbnN0IHZhbHVlID0gMC41NCAtIDAuNDYgKiBjb3MocGhpKTtcblxuICAgIGJ1ZmZlcltpXSA9IHZhbHVlO1xuXG4gICAgbGluU3VtICs9IHZhbHVlO1xuICAgIHBvd1N1bSArPSB2YWx1ZSAqIHZhbHVlO1xuICB9XG5cbiAgbm9ybUNvZWZzLmxpbmVhciA9IHNpemUgLyBsaW5TdW07XG4gIG5vcm1Db2Vmcy5wb3dlciA9IHNxcnQoc2l6ZSAvIHBvd1N1bSk7XG59XG5cbmZ1bmN0aW9uIGluaXRCbGFja21hbldpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcykge1xuICBsZXQgbGluU3VtID0gMDtcbiAgbGV0IHBvd1N1bSA9IDA7XG4gIGNvbnN0IHN0ZXAgPSAyICogUEkgLyBzaXplO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgY29uc3QgcGhpID0gaSAqIHN0ZXA7XG4gICAgY29uc3QgdmFsdWUgPSAwLjQyIC0gMC41ICogY29zKHBoaSkgKyAwLjA4ICogY29zKDIgKiBwaGkpO1xuXG4gICAgYnVmZmVyW2ldID0gdmFsdWU7XG5cbiAgICBsaW5TdW0gKz0gdmFsdWU7XG4gICAgcG93U3VtICs9IHZhbHVlICogdmFsdWU7XG4gIH1cblxuICBub3JtQ29lZnMubGluZWFyID0gc2l6ZSAvIGxpblN1bTtcbiAgbm9ybUNvZWZzLnBvd2VyID0gc3FydChzaXplIC8gcG93U3VtKTtcbn1cblxuZnVuY3Rpb24gaW5pdEJsYWNrbWFuSGFycmlzV2luZG93KGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKSB7XG4gIGxldCBsaW5TdW0gPSAwO1xuICBsZXQgcG93U3VtID0gMDtcbiAgY29uc3QgYTAgPSAwLjM1ODc1O1xuICBjb25zdCBhMSA9IDAuNDg4Mjk7XG4gIGNvbnN0IGEyID0gMC4xNDEyODtcbiAgY29uc3QgYTMgPSAwLjAxMTY4O1xuICBjb25zdCBzdGVwID0gMiAqIFBJIC8gc2l6ZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIGNvbnN0IHBoaSA9IGkgKiBzdGVwO1xuICAgIGNvbnN0IHZhbHVlID0gYTAgLSBhMSAqIGNvcyhwaGkpICsgYTIgKiBjb3MoMiAqIHBoaSk7IC0gYTMgKiBjb3MoMyAqIHBoaSk7XG5cbiAgICBidWZmZXJbaV0gPSB2YWx1ZTtcblxuICAgIGxpblN1bSArPSB2YWx1ZTtcbiAgICBwb3dTdW0gKz0gdmFsdWUgKiB2YWx1ZTtcbiAgfVxuXG4gIG5vcm1Db2Vmcy5saW5lYXIgPSBzaXplIC8gbGluU3VtO1xuICBub3JtQ29lZnMucG93ZXIgPSBzcXJ0KHNpemUgLyBwb3dTdW0pO1xufVxuXG5mdW5jdGlvbiBpbml0U2luZVdpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcykge1xuICBsZXQgbGluU3VtID0gMDtcbiAgbGV0IHBvd1N1bSA9IDA7XG4gIGNvbnN0IHN0ZXAgPSBQSSAvIHNpemU7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBjb25zdCBwaGkgPSBpICogc3RlcDtcbiAgICBjb25zdCB2YWx1ZSA9IHNpbihwaGkpO1xuXG4gICAgYnVmZmVyW2ldID0gdmFsdWU7XG5cbiAgICBsaW5TdW0gKz0gdmFsdWU7XG4gICAgcG93U3VtICs9IHZhbHVlICogdmFsdWU7XG4gIH1cblxuICBub3JtQ29lZnMubGluZWFyID0gc2l6ZSAvIGxpblN1bTtcbiAgbm9ybUNvZWZzLnBvd2VyID0gc3FydChzaXplIC8gcG93U3VtKTtcbn1cblxuZnVuY3Rpb24gaW5pdFJlY3RhbmdsZVdpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcykge1xuICAvLyBAVE9ETyBub3JtQ29lZnNcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBidWZmZXJbaV0gPSAxO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbigpIHtcbiAgLy8gQE5PVEUgaW1wbGVtZW50IHNvbWUgY2FjaGluZyBzeXN0ZW0gKGlzIHRoaXMgcmVhbGx5IHVzZWZ1bGwgPylcbiAgY29uc3QgY2FjaGUgPSB7fTtcblxuICByZXR1cm4gZnVuY3Rpb24obmFtZSwgYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgICBuYW1lID0gbmFtZS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICBjYXNlICdoYW5uJzpcbiAgICAgIGNhc2UgJ2hhbm5pbmcnOlxuICAgICAgICBpbml0SGFubldpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnaGFtbWluZyc6XG4gICAgICAgIGluaXRIYW1taW5nV2luZG93KGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdibGFja21hbic6XG4gICAgICAgIGluaXRCbGFja21hbldpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYmxhY2ttYW5oYXJyaXMnOlxuICAgICAgICBpbml0QmxhY2ttYW5IYXJyaXNXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3NpbmUnOlxuICAgICAgICBpbml0U2luZVdpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncmVjdGFuZ2xlJzpcbiAgICAgICAgaW5pdFJlY3RhbmdsZVdpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcyk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufSgpKTsiLCJcbi8vIGh0dHA6Ly91cGRhdGVzLmh0bWw1cm9ja3MuY29tLzIwMTIvMDYvSG93LXRvLWNvbnZlcnQtQXJyYXlCdWZmZXItdG8tYW5kLWZyb20tU3RyaW5nXG5mdW5jdGlvbiBVaW50MTZBcnJheTJzdHIoYnVmKSB7XG4gIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsIGJ1Zik7XG59XG5cbmZ1bmN0aW9uIHN0cjJVaW50MTZBcnJheShzdHIpIHtcbiAgdmFyIGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzdHIubGVuZ3RoICogMik7IC8vIDIgYnl0ZXMgZm9yIGVhY2ggY2hhclxuICB2YXIgYnVmZmVyVmlldyA9IG5ldyBVaW50MTZBcnJheShidWZmZXIpO1xuXG4gIGZvciAodmFyIGkgPSAwLCBsID0gc3RyLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGJ1ZmZlclZpZXdbaV0gPSBzdHIuY2hhckNvZGVBdChpKTtcbiAgfVxuICByZXR1cm4gYnVmZmVyVmlldztcbn1cblxuLy9odHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg2MDkyODkvY29udmVydC1hLWJpbmFyeS1ub2RlanMtYnVmZmVyLXRvLWphdmFzY3JpcHQtYXJyYXlidWZmZXJcbi8vIGNvbnZlcnRzIGEgbm9kZWpzIEJ1ZmZlciB0byBBcnJheUJ1ZmZlclxuZXhwb3J0IGZ1bmN0aW9uIGJ1ZmZlclRvQXJyYXlCdWZmZXIoYnVmZmVyKSB7XG4gIHZhciBhYiA9IG5ldyBBcnJheUJ1ZmZlcihidWZmZXIubGVuZ3RoKTtcbiAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShhYik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgKytpKSB7XG4gICAgdmlld1tpXSA9IGJ1ZmZlcltpXTtcbiAgfVxuICByZXR1cm4gYWI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcnJheUJ1ZmZlclRvQnVmZmVyKGFycmF5QnVmZmVyKSB7XG4gIHZhciBidWZmZXIgPSBuZXcgQnVmZmVyKGFycmF5QnVmZmVyLmJ5dGVMZW5ndGgpO1xuICB2YXIgdmlldyA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyArK2kpIHtcbiAgICBidWZmZXJbaV0gPSB2aWV3W2ldO1xuICB9XG4gIHJldHVybiBidWZmZXI7XG59XG5cbi8vIEBUT0RPIGBlbmNvZGVNZXNzYWdlYCBhbmQgYGRlY29kZU1lc3NhZ2VgIGNvdWxkIHByb2JhYmx5IHVzZSBEYXRhVmlldyB0byBwYXJzZSB0aGUgYnVmZmVyXG5cbi8vIGNvbmNhdCB0aGUgbGZvIHN0cmVhbSwgdGltZSBhbmQgbWV0YURhdGEgaW50byBhIHNpbmdsZSBidWZmZXJcbi8vIHRoZSBjb25jYXRlbmF0aW9uIGlzIGRvbmUgYXMgZm9sbG93IDpcbi8vICAqIHRpbWUgICAgICAgICAgPT4gOCBieXRlc1xuLy8gICogZnJhbWUubGVuZ3RoICA9PiAyIGJ5dGVzXG4vLyAgKiBmcmFtZSAgICAgICAgID0+IDQgKiBmcmFtZUxlbmd0aCBieXRlc1xuLy8gICogbWV0YURhdGEgICAgICA9PiByZXN0IG9mIHRoZSBtZXNzYWdlXG4vLyBAcmV0dXJuICBBcnJheUJ1ZmZlciBvZiB0aGUgY3JlYXRlZCBtZXNzYWdlXG4vLyBAbm90ZSAgICBtdXN0IGNyZWF0ZSBhIG5ldyBidWZmZXIgZWFjaCB0aW1lIGJlY2F1c2UgbWV0YURhdGEgbGVuZ3RoIGlzIG5vdCBrbm93blxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZU1lc3NhZ2UodGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAvLyBzaG91bGQgcHJvYmFibHkgdXNlIHVzZSBEYXRhVmlldyBpbnN0ZWFkXG4gIC8vIGh0dHA6Ly93d3cuaHRtbDVyb2Nrcy5jb20vZW4vdHV0b3JpYWxzL3dlYmdsL3R5cGVkX2FycmF5cy9cbiAgdmFyIHRpbWU2NCA9IG5ldyBGbG9hdDY0QXJyYXkoMSk7XG4gIHRpbWU2NFswXSA9IHRpbWU7XG4gIHZhciB0aW1lMTYgPSBuZXcgVWludDE2QXJyYXkodGltZTY0LmJ1ZmZlcik7XG5cbiAgdmFyIGxlbmd0aDE2ID0gbmV3IFVpbnQxNkFycmF5KDEpO1xuICBsZW5ndGgxNlswXSA9IGZyYW1lLmxlbmd0aDtcblxuICB2YXIgZnJhbWUxNiA9IG5ldyBVaW50MTZBcnJheShmcmFtZS5idWZmZXIpO1xuXG4gIHZhciBtZXRhRGF0YTE2ID0gc3RyMlVpbnQxNkFycmF5KEpTT04uc3RyaW5naWZ5KG1ldGFEYXRhKSk7XG5cbiAgdmFyIGJ1ZmZlckxlbmd0aCA9IHRpbWUxNi5sZW5ndGggKyBsZW5ndGgxNi5sZW5ndGggKyBmcmFtZTE2Lmxlbmd0aCArIG1ldGFEYXRhMTYubGVuZ3RoO1xuXG4gIHZhciBidWZmZXIgPSBuZXcgVWludDE2QXJyYXkoYnVmZmVyTGVuZ3RoKTtcblxuICAvLyBidWZmZXIgaXMgdGhlIGNvbmNhdGVuYXRpb24gb2YgdGltZSwgZnJhbWVMZW5ndGgsIGZyYW1lLCBtZXRhRGF0YVxuICBidWZmZXIuc2V0KHRpbWUxNiwgMCk7XG4gIGJ1ZmZlci5zZXQobGVuZ3RoMTYsIHRpbWUxNi5sZW5ndGgpO1xuICBidWZmZXIuc2V0KGZyYW1lMTYsIHRpbWUxNi5sZW5ndGggKyBsZW5ndGgxNi5sZW5ndGgpO1xuICBidWZmZXIuc2V0KG1ldGFEYXRhMTYsIHRpbWUxNi5sZW5ndGggKyBsZW5ndGgxNi5sZW5ndGggKyBmcmFtZTE2Lmxlbmd0aCk7XG5cbiAgcmV0dXJuIGJ1ZmZlci5idWZmZXI7XG59XG5cbi8vIHJlY3JlYXRlIHRoZSBMZm8gc3RyZWFtICh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIGZvcm0gYSBidWZmZXJcbi8vIGNyZWF0ZWQgd2l0aCBgZW5jb2RlTWVzc2FnZWBcbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVNZXNzYWdlKGJ1ZmZlcikge1xuICAvLyB0aW1lIGlzIGEgZmxvYXQ2NEFycmF5IG9mIHNpemUgMSAoOCBieXRlcylcbiAgdmFyIHRpbWVBcnJheSA9IG5ldyBGbG9hdDY0QXJyYXkoYnVmZmVyLnNsaWNlKDAsIDgpKTtcbiAgdmFyIHRpbWUgPSB0aW1lQXJyYXlbMF07XG5cbiAgLy8gZnJhbWUgbGVuZ3RoIGlzIGVuY29kZWQgaW4gMiBieXRlc1xuICB2YXIgZnJhbWVMZW5ndGhBcnJheSA9IG5ldyBVaW50MTZBcnJheShidWZmZXIuc2xpY2UoOCwgMTApKTtcbiAgdmFyIGZyYW1lTGVuZ3RoID0gZnJhbWVMZW5ndGhBcnJheVswXTtcblxuICAvLyBmcmFtZSBpcyBhIGZsb2F0MzJBcnJheSAoNCBieXRlcykgKiBmcmFtZUxlbmd0aFxuICB2YXIgZnJhbWVCeXRlTGVuZ3RoID0gNCAqIGZyYW1lTGVuZ3RoO1xuICB2YXIgZnJhbWUgPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlci5zbGljZSgxMCwgMTAgKyBmcmFtZUJ5dGVMZW5ndGgpKTtcblxuICAvLyBtZXRhRGF0YSBpcyB0aGUgcmVzdCBvZiB0aGUgYnVmZmVyXG4gIHZhciBtZXRhRGF0YUFycmF5ID0gbmV3IFVpbnQxNkFycmF5KGJ1ZmZlci5zbGljZSgxMCArIGZyYW1lQnl0ZUxlbmd0aCkpO1xuICAvLyBKU09OLnBhcnNlIGhlcmUgY3Jhc2hlcyBub2RlIGJlY2F1c2Ugb2YgdGhpcyBjaGFyYWN0ZXIgOiBgXFx1MDAwMGAgKG51bGwgaW4gdW5pY29kZSkgPz9cbiAgdmFyIG1ldGFEYXRhID0gVWludDE2QXJyYXkyc3RyKG1ldGFEYXRhQXJyYXkpO1xuICBtZXRhRGF0YSA9IEpTT04ucGFyc2UobWV0YURhdGEucmVwbGFjZSgvXFx1MDAwMC9nLCAnJykpO1xuXG4gIHJldHVybiB7IHRpbWUsIGZyYW1lLCBtZXRhRGF0YSB9O1xufVxuXG4iLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9qc29uL3N0cmluZ2lmeVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtcHJvdG90eXBlLW9mXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3Byb21pc2VcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvclwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoaW5zdGFuY2UsIENvbnN0cnVjdG9yKSB7XG4gIGlmICghKGluc3RhbmNlIGluc3RhbmNlb2YgQ29uc3RydWN0b3IpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCBjYWxsIGEgY2xhc3MgYXMgYSBmdW5jdGlvblwiKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKTtcblxudmFyIF9kZWZpbmVQcm9wZXJ0eTIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9kZWZpbmVQcm9wZXJ0eSk7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7IHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7IGRlZmF1bHQ6IG9iaiB9OyB9XG5cbmV4cG9ydHMuZGVmYXVsdCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyh0YXJnZXQsIHByb3BzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGRlc2NyaXB0b3IgPSBwcm9wc1tpXTtcbiAgICAgIGRlc2NyaXB0b3IuZW51bWVyYWJsZSA9IGRlc2NyaXB0b3IuZW51bWVyYWJsZSB8fCBmYWxzZTtcbiAgICAgIGRlc2NyaXB0b3IuY29uZmlndXJhYmxlID0gdHJ1ZTtcbiAgICAgIGlmIChcInZhbHVlXCIgaW4gZGVzY3JpcHRvcikgZGVzY3JpcHRvci53cml0YWJsZSA9IHRydWU7XG4gICAgICAoMCwgX2RlZmluZVByb3BlcnR5Mi5kZWZhdWx0KSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSgpOyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2dldFByb3RvdHlwZU9mID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZlwiKTtcblxudmFyIF9nZXRQcm90b3R5cGVPZjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9nZXRQcm90b3R5cGVPZik7XG5cbnZhciBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiBnZXQob2JqZWN0LCBwcm9wZXJ0eSwgcmVjZWl2ZXIpIHtcbiAgaWYgKG9iamVjdCA9PT0gbnVsbCkgb2JqZWN0ID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuICB2YXIgZGVzYyA9ICgwLCBfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yMi5kZWZhdWx0KShvYmplY3QsIHByb3BlcnR5KTtcblxuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIHBhcmVudCA9ICgwLCBfZ2V0UHJvdG90eXBlT2YyLmRlZmF1bHQpKG9iamVjdCk7XG5cbiAgICBpZiAocGFyZW50ID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZ2V0KHBhcmVudCwgcHJvcGVydHksIHJlY2VpdmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoXCJ2YWx1ZVwiIGluIGRlc2MpIHtcbiAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZ2V0dGVyID0gZGVzYy5nZXQ7XG5cbiAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgfVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9zZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L3NldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfc2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfc2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2NyZWF0ZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2NyZWF0ZVwiKTtcblxudmFyIF9jcmVhdGUyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfY3JlYXRlKTtcblxudmFyIF90eXBlb2YyID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIHtcbiAgaWYgKHR5cGVvZiBzdXBlckNsYXNzICE9PSBcImZ1bmN0aW9uXCIgJiYgc3VwZXJDbGFzcyAhPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJTdXBlciBleHByZXNzaW9uIG11c3QgZWl0aGVyIGJlIG51bGwgb3IgYSBmdW5jdGlvbiwgbm90IFwiICsgKHR5cGVvZiBzdXBlckNsYXNzID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShzdXBlckNsYXNzKSkpO1xuICB9XG5cbiAgc3ViQ2xhc3MucHJvdG90eXBlID0gKDAsIF9jcmVhdGUyLmRlZmF1bHQpKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBfc2V0UHJvdG90eXBlT2YyLmRlZmF1bHQgPyAoMCwgX3NldFByb3RvdHlwZU9mMi5kZWZhdWx0KShzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF90eXBlb2YyID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2ZcIik7XG5cbnZhciBfdHlwZW9mMyA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3R5cGVvZjIpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoc2VsZiwgY2FsbCkge1xuICBpZiAoIXNlbGYpIHtcbiAgICB0aHJvdyBuZXcgUmVmZXJlbmNlRXJyb3IoXCJ0aGlzIGhhc24ndCBiZWVuIGluaXRpYWxpc2VkIC0gc3VwZXIoKSBoYXNuJ3QgYmVlbiBjYWxsZWRcIik7XG4gIH1cblxuICByZXR1cm4gY2FsbCAmJiAoKHR5cGVvZiBjYWxsID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6ICgwLCBfdHlwZW9mMy5kZWZhdWx0KShjYWxsKSkgPT09IFwib2JqZWN0XCIgfHwgdHlwZW9mIGNhbGwgPT09IFwiZnVuY3Rpb25cIikgPyBjYWxsIDogc2VsZjtcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfaXRlcmF0b3IgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC9pdGVyYXRvclwiKTtcblxudmFyIF9pdGVyYXRvcjIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9pdGVyYXRvcik7XG5cbnZhciBfc3ltYm9sID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2xcIik7XG5cbnZhciBfc3ltYm9sMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3N5bWJvbCk7XG5cbnZhciBfdHlwZW9mID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgX2l0ZXJhdG9yMi5kZWZhdWx0ID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gX3N5bWJvbDIuZGVmYXVsdCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIF90eXBlb2YoX2l0ZXJhdG9yMi5kZWZhdWx0KSA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmogPT09IFwidW5kZWZpbmVkXCIgPyBcInVuZGVmaW5lZFwiIDogX3R5cGVvZihvYmopO1xufSA6IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgX3N5bWJvbDIuZGVmYXVsdCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gX3N5bWJvbDIuZGVmYXVsdCA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn07IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5hcnJheS5mcm9tJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5BcnJheS5mcm9tOyIsInZhciBjb3JlICA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKVxuICAsICRKU09OID0gY29yZS5KU09OIHx8IChjb3JlLkpTT04gPSB7c3RyaW5naWZ5OiBKU09OLnN0cmluZ2lmeX0pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBzdHJpbmdpZnkoaXQpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiAkSlNPTi5zdHJpbmdpZnkuYXBwbHkoJEpTT04sIGFyZ3VtZW50cyk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5hc3NpZ24nKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC5hc3NpZ247IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmNyZWF0ZScpO1xudmFyICRPYmplY3QgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBjcmVhdGUoUCwgRCl7XG4gIHJldHVybiAkT2JqZWN0LmNyZWF0ZShQLCBEKTtcbn07IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LmRlZmluZS1wcm9wZXJ0eScpO1xudmFyICRPYmplY3QgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKXtcbiAgcmV0dXJuICRPYmplY3QuZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYyk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICByZXR1cm4gJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtcHJvdG90eXBlLW9mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3QuZ2V0UHJvdG90eXBlT2Y7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYub2JqZWN0LnNldC1wcm90b3R5cGUtb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdC5zZXRQcm90b3R5cGVPZjsiLCJyZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYucHJvbWlzZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9tb2R1bGVzL19jb3JlJykuUHJvbWlzZTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zeW1ib2wnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC50by1zdHJpbmcnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLlN5bWJvbDsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5zdHJpbmcuaXRlcmF0b3InKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvd2ViLmRvbS5pdGVyYWJsZScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL193a3MnKSgnaXRlcmF0b3InKTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgQ29uc3RydWN0b3IsIG5hbWUsIGZvcmJpZGRlbkZpZWxkKXtcbiAgaWYoIShpdCBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSB8fCAoZm9yYmlkZGVuRmllbGQgIT09IHVuZGVmaW5lZCAmJiBmb3JiaWRkZW5GaWVsZCBpbiBpdCkpe1xuICAgIHRocm93IFR5cGVFcnJvcihuYW1lICsgJzogaW5jb3JyZWN0IGludm9jYXRpb24hJyk7XG4gIH0gcmV0dXJuIGl0O1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZighaXNPYmplY3QoaXQpKXRocm93IFR5cGVFcnJvcihpdCArICcgaXMgbm90IGFuIG9iamVjdCEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCIvLyBmYWxzZSAtPiBBcnJheSNpbmRleE9mXG4vLyB0cnVlICAtPiBBcnJheSNpbmNsdWRlc1xudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIHRvTGVuZ3RoICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgdG9JbmRleCAgID0gcmVxdWlyZSgnLi9fdG8taW5kZXgnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oSVNfSU5DTFVERVMpe1xuICByZXR1cm4gZnVuY3Rpb24oJHRoaXMsIGVsLCBmcm9tSW5kZXgpe1xuICAgIHZhciBPICAgICAgPSB0b0lPYmplY3QoJHRoaXMpXG4gICAgICAsIGxlbmd0aCA9IHRvTGVuZ3RoKE8ubGVuZ3RoKVxuICAgICAgLCBpbmRleCAgPSB0b0luZGV4KGZyb21JbmRleCwgbGVuZ3RoKVxuICAgICAgLCB2YWx1ZTtcbiAgICAvLyBBcnJheSNpbmNsdWRlcyB1c2VzIFNhbWVWYWx1ZVplcm8gZXF1YWxpdHkgYWxnb3JpdGhtXG4gICAgaWYoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpd2hpbGUobGVuZ3RoID4gaW5kZXgpe1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgaWYodmFsdWUgIT0gdmFsdWUpcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjdG9JbmRleCBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKWlmKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pe1xuICAgICAgaWYoT1tpbmRleF0gPT09IGVsKXJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07IiwiLy8gZ2V0dGluZyB0YWcgZnJvbSAxOS4xLjMuNiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nKClcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpXG4gIC8vIEVTMyB3cm9uZyBoZXJlXG4gICwgQVJHID0gY29mKGZ1bmN0aW9uKCl7IHJldHVybiBhcmd1bWVudHM7IH0oKSkgPT0gJ0FyZ3VtZW50cyc7XG5cbi8vIGZhbGxiYWNrIGZvciBJRTExIFNjcmlwdCBBY2Nlc3MgRGVuaWVkIGVycm9yXG52YXIgdHJ5R2V0ID0gZnVuY3Rpb24oaXQsIGtleSl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGl0W2tleV07XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgTywgVCwgQjtcbiAgcmV0dXJuIGl0ID09PSB1bmRlZmluZWQgPyAnVW5kZWZpbmVkJyA6IGl0ID09PSBudWxsID8gJ051bGwnXG4gICAgLy8gQEB0b1N0cmluZ1RhZyBjYXNlXG4gICAgOiB0eXBlb2YgKFQgPSB0cnlHZXQoTyA9IE9iamVjdChpdCksIFRBRykpID09ICdzdHJpbmcnID8gVFxuICAgIC8vIGJ1aWx0aW5UYWcgY2FzZVxuICAgIDogQVJHID8gY29mKE8pXG4gICAgLy8gRVMzIGFyZ3VtZW50cyBmYWxsYmFja1xuICAgIDogKEIgPSBjb2YoTykpID09ICdPYmplY3QnICYmIHR5cGVvZiBPLmNhbGxlZSA9PSAnZnVuY3Rpb24nID8gJ0FyZ3VtZW50cycgOiBCO1xufTsiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcyLjIuMid9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiJ3VzZSBzdHJpY3QnO1xyXG52YXIgJGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcclxuICAsIGNyZWF0ZURlc2MgICAgICA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBpbmRleCwgdmFsdWUpe1xyXG4gIGlmKGluZGV4IGluIG9iamVjdCkkZGVmaW5lUHJvcGVydHkuZihvYmplY3QsIGluZGV4LCBjcmVhdGVEZXNjKDAsIHZhbHVlKSk7XHJcbiAgZWxzZSBvYmplY3RbaW5kZXhdID0gdmFsdWU7XHJcbn07IiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgdGhhdCwgbGVuZ3RoKXtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYodGhhdCA9PT0gdW5kZWZpbmVkKXJldHVybiBmbjtcbiAgc3dpdGNoKGxlbmd0aCl7XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKGEsIGIpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSwgYik7XG4gICAgfTtcbiAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uKC8qIC4uLmFyZ3MgKi8pe1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTsiLCIvLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XG59KTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGRvY3VtZW50ID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnRcbiAgLy8gaW4gb2xkIElFIHR5cGVvZiBkb2N1bWVudC5jcmVhdGVFbGVtZW50IGlzICdvYmplY3QnXG4gICwgaXMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGlzID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07IiwiLy8gSUUgOC0gZG9uJ3QgZW51bSBidWcga2V5c1xyXG5tb2R1bGUuZXhwb3J0cyA9IChcclxuICAnY29uc3RydWN0b3IsaGFzT3duUHJvcGVydHksaXNQcm90b3R5cGVPZixwcm9wZXJ0eUlzRW51bWVyYWJsZSx0b0xvY2FsZVN0cmluZyx0b1N0cmluZyx2YWx1ZU9mJ1xyXG4pLnNwbGl0KCcsJyk7IiwiLy8gYWxsIGVudW1lcmFibGUgb2JqZWN0IGtleXMsIGluY2x1ZGVzIHN5bWJvbHNcbnZhciBnZXRLZXlzID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKVxuICAsIGdPUFMgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpXG4gICwgcElFICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgcmVzdWx0ICAgICA9IGdldEtleXMoaXQpXG4gICAgLCBnZXRTeW1ib2xzID0gZ09QUy5mO1xuICBpZihnZXRTeW1ib2xzKXtcbiAgICB2YXIgc3ltYm9scyA9IGdldFN5bWJvbHMoaXQpXG4gICAgICAsIGlzRW51bSAgPSBwSUUuZlxuICAgICAgLCBpICAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUoc3ltYm9scy5sZW5ndGggPiBpKWlmKGlzRW51bS5jYWxsKGl0LCBrZXkgPSBzeW1ib2xzW2krK10pKXJlc3VsdC5wdXNoKGtleSk7XG4gIH0gcmV0dXJuIHJlc3VsdDtcbn07IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgY29yZSAgICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBoaWRlICAgICAgPSByZXF1aXJlKCcuL19oaWRlJylcbiAgLCBQUk9UT1RZUEUgPSAncHJvdG90eXBlJztcblxudmFyICRleHBvcnQgPSBmdW5jdGlvbih0eXBlLCBuYW1lLCBzb3VyY2Upe1xuICB2YXIgSVNfRk9SQ0VEID0gdHlwZSAmICRleHBvcnQuRlxuICAgICwgSVNfR0xPQkFMID0gdHlwZSAmICRleHBvcnQuR1xuICAgICwgSVNfU1RBVElDID0gdHlwZSAmICRleHBvcnQuU1xuICAgICwgSVNfUFJPVE8gID0gdHlwZSAmICRleHBvcnQuUFxuICAgICwgSVNfQklORCAgID0gdHlwZSAmICRleHBvcnQuQlxuICAgICwgSVNfV1JBUCAgID0gdHlwZSAmICRleHBvcnQuV1xuICAgICwgZXhwb3J0cyAgID0gSVNfR0xPQkFMID8gY29yZSA6IGNvcmVbbmFtZV0gfHwgKGNvcmVbbmFtZV0gPSB7fSlcbiAgICAsIGV4cFByb3RvICA9IGV4cG9ydHNbUFJPVE9UWVBFXVxuICAgICwgdGFyZ2V0ICAgID0gSVNfR0xPQkFMID8gZ2xvYmFsIDogSVNfU1RBVElDID8gZ2xvYmFsW25hbWVdIDogKGdsb2JhbFtuYW1lXSB8fCB7fSlbUFJPVE9UWVBFXVxuICAgICwga2V5LCBvd24sIG91dDtcbiAgaWYoSVNfR0xPQkFMKXNvdXJjZSA9IG5hbWU7XG4gIGZvcihrZXkgaW4gc291cmNlKXtcbiAgICAvLyBjb250YWlucyBpbiBuYXRpdmVcbiAgICBvd24gPSAhSVNfRk9SQ0VEICYmIHRhcmdldCAmJiB0YXJnZXRba2V5XSAhPT0gdW5kZWZpbmVkO1xuICAgIGlmKG93biAmJiBrZXkgaW4gZXhwb3J0cyljb250aW51ZTtcbiAgICAvLyBleHBvcnQgbmF0aXZlIG9yIHBhc3NlZFxuICAgIG91dCA9IG93biA/IHRhcmdldFtrZXldIDogc291cmNlW2tleV07XG4gICAgLy8gcHJldmVudCBnbG9iYWwgcG9sbHV0aW9uIGZvciBuYW1lc3BhY2VzXG4gICAgZXhwb3J0c1trZXldID0gSVNfR0xPQkFMICYmIHR5cGVvZiB0YXJnZXRba2V5XSAhPSAnZnVuY3Rpb24nID8gc291cmNlW2tleV1cbiAgICAvLyBiaW5kIHRpbWVycyB0byBnbG9iYWwgZm9yIGNhbGwgZnJvbSBleHBvcnQgY29udGV4dFxuICAgIDogSVNfQklORCAmJiBvd24gPyBjdHgob3V0LCBnbG9iYWwpXG4gICAgLy8gd3JhcCBnbG9iYWwgY29uc3RydWN0b3JzIGZvciBwcmV2ZW50IGNoYW5nZSB0aGVtIGluIGxpYnJhcnlcbiAgICA6IElTX1dSQVAgJiYgdGFyZ2V0W2tleV0gPT0gb3V0ID8gKGZ1bmN0aW9uKEMpe1xuICAgICAgdmFyIEYgPSBmdW5jdGlvbihhLCBiLCBjKXtcbiAgICAgICAgaWYodGhpcyBpbnN0YW5jZW9mIEMpe1xuICAgICAgICAgIHN3aXRjaChhcmd1bWVudHMubGVuZ3RoKXtcbiAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIG5ldyBDO1xuICAgICAgICAgICAgY2FzZSAxOiByZXR1cm4gbmV3IEMoYSk7XG4gICAgICAgICAgICBjYXNlIDI6IHJldHVybiBuZXcgQyhhLCBiKTtcbiAgICAgICAgICB9IHJldHVybiBuZXcgQyhhLCBiLCBjKTtcbiAgICAgICAgfSByZXR1cm4gQy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfTtcbiAgICAgIEZbUFJPVE9UWVBFXSA9IENbUFJPVE9UWVBFXTtcbiAgICAgIHJldHVybiBGO1xuICAgIC8vIG1ha2Ugc3RhdGljIHZlcnNpb25zIGZvciBwcm90b3R5cGUgbWV0aG9kc1xuICAgIH0pKG91dCkgOiBJU19QUk9UTyAmJiB0eXBlb2Ygb3V0ID09ICdmdW5jdGlvbicgPyBjdHgoRnVuY3Rpb24uY2FsbCwgb3V0KSA6IG91dDtcbiAgICAvLyBleHBvcnQgcHJvdG8gbWV0aG9kcyB0byBjb3JlLiVDT05TVFJVQ1RPUiUubWV0aG9kcy4lTkFNRSVcbiAgICBpZihJU19QUk9UTyl7XG4gICAgICAoZXhwb3J0cy52aXJ0dWFsIHx8IChleHBvcnRzLnZpcnR1YWwgPSB7fSkpW2tleV0gPSBvdXQ7XG4gICAgICAvLyBleHBvcnQgcHJvdG8gbWV0aG9kcyB0byBjb3JlLiVDT05TVFJVQ1RPUiUucHJvdG90eXBlLiVOQU1FJVxuICAgICAgaWYodHlwZSAmICRleHBvcnQuUiAmJiBleHBQcm90byAmJiAhZXhwUHJvdG9ba2V5XSloaWRlKGV4cFByb3RvLCBrZXksIG91dCk7XG4gICAgfVxuICB9XG59O1xuLy8gdHlwZSBiaXRtYXBcbiRleHBvcnQuRiA9IDE7ICAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgIC8vIGdsb2JhbFxuJGV4cG9ydC5TID0gNDsgICAvLyBzdGF0aWNcbiRleHBvcnQuUCA9IDg7ICAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAgLy8gYmluZFxuJGV4cG9ydC5XID0gMzI7ICAvLyB3cmFwXG4kZXhwb3J0LlUgPSA2NDsgIC8vIHNhZmVcbiRleHBvcnQuUiA9IDEyODsgLy8gcmVhbCBwcm90byBtZXRob2QgZm9yIGBsaWJyYXJ5YCBcbm1vZHVsZS5leHBvcnRzID0gJGV4cG9ydDsiLCJ2YXIgY3R4ICAgICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGNhbGwgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKVxuICAsIGFuT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgZ2V0SXRlckZuICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYWJsZSwgZW50cmllcywgZm4sIHRoYXQsIElURVJBVE9SKXtcbiAgdmFyIGl0ZXJGbiA9IElURVJBVE9SID8gZnVuY3Rpb24oKXsgcmV0dXJuIGl0ZXJhYmxlOyB9IDogZ2V0SXRlckZuKGl0ZXJhYmxlKVxuICAgICwgZiAgICAgID0gY3R4KGZuLCB0aGF0LCBlbnRyaWVzID8gMiA6IDEpXG4gICAgLCBpbmRleCAgPSAwXG4gICAgLCBsZW5ndGgsIHN0ZXAsIGl0ZXJhdG9yO1xuICBpZih0eXBlb2YgaXRlckZuICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ZXJhYmxlICsgJyBpcyBub3QgaXRlcmFibGUhJyk7XG4gIC8vIGZhc3QgY2FzZSBmb3IgYXJyYXlzIHdpdGggZGVmYXVsdCBpdGVyYXRvclxuICBpZihpc0FycmF5SXRlcihpdGVyRm4pKWZvcihsZW5ndGggPSB0b0xlbmd0aChpdGVyYWJsZS5sZW5ndGgpOyBsZW5ndGggPiBpbmRleDsgaW5kZXgrKyl7XG4gICAgZW50cmllcyA/IGYoYW5PYmplY3Qoc3RlcCA9IGl0ZXJhYmxlW2luZGV4XSlbMF0sIHN0ZXBbMV0pIDogZihpdGVyYWJsZVtpbmRleF0pO1xuICB9IGVsc2UgZm9yKGl0ZXJhdG9yID0gaXRlckZuLmNhbGwoaXRlcmFibGUpOyAhKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmU7ICl7XG4gICAgY2FsbChpdGVyYXRvciwgZiwgc3RlcC52YWx1ZSwgZW50cmllcyk7XG4gIH1cbn07IiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07IiwidmFyIGRQICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxuICAsIGNyZWF0ZURlc2MgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICByZXR1cm4gZFAuZihvYmplY3QsIGtleSwgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uKG9iamVjdCwga2V5LCB2YWx1ZSl7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuZG9jdW1lbnQgJiYgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50OyIsIm1vZHVsZS5leHBvcnRzID0gIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgJiYgIXJlcXVpcmUoJy4vX2ZhaWxzJykoZnVuY3Rpb24oKXtcclxuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnZGl2JyksICdhJywge2dldDogZnVuY3Rpb24oKXsgcmV0dXJuIDc7IH19KS5hICE9IDc7XHJcbn0pOyIsIi8vIGZhc3QgYXBwbHksIGh0dHA6Ly9qc3BlcmYubG5raXQuY29tL2Zhc3QtYXBwbHkvNVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbiwgYXJncywgdGhhdCl7XG4gIHZhciB1biA9IHRoYXQgPT09IHVuZGVmaW5lZDtcbiAgc3dpdGNoKGFyZ3MubGVuZ3RoKXtcbiAgICBjYXNlIDA6IHJldHVybiB1biA/IGZuKClcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCk7XG4gICAgY2FzZSAxOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdKTtcbiAgICBjYXNlIDI6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0pO1xuICAgIGNhc2UgMzogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSk7XG4gICAgY2FzZSA0OiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdKTtcbiAgfSByZXR1cm4gICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MpO1xufTsiLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKSA/IE9iamVjdCA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGNvZihpdCkgPT0gJ1N0cmluZycgPyBpdC5zcGxpdCgnJykgOiBPYmplY3QoaXQpO1xufTsiLCIvLyBjaGVjayBvbiBkZWZhdWx0IEFycmF5IGl0ZXJhdG9yXG52YXIgSXRlcmF0b3JzICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgSVRFUkFUT1IgICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCAhPT0gdW5kZWZpbmVkICYmIChJdGVyYXRvcnMuQXJyYXkgPT09IGl0IHx8IEFycmF5UHJvdG9bSVRFUkFUT1JdID09PSBpdCk7XG59OyIsIi8vIDcuMi4yIElzQXJyYXkoYXJndW1lbnQpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpe1xuICByZXR1cm4gY29mKGFyZykgPT0gJ0FycmF5Jztcbn07IiwiLy8gY2FsbCBzb21ldGhpbmcgb24gaXRlcmF0b3Igc3RlcCB3aXRoIHNhZmUgY2xvc2luZyBvbiBlcnJvclxudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0ZXJhdG9yLCBmbiwgdmFsdWUsIGVudHJpZXMpe1xuICB0cnkge1xuICAgIHJldHVybiBlbnRyaWVzID8gZm4oYW5PYmplY3QodmFsdWUpWzBdLCB2YWx1ZVsxXSkgOiBmbih2YWx1ZSk7XG4gIC8vIDcuNC42IEl0ZXJhdG9yQ2xvc2UoaXRlcmF0b3IsIGNvbXBsZXRpb24pXG4gIH0gY2F0Y2goZSl7XG4gICAgdmFyIHJldCA9IGl0ZXJhdG9yWydyZXR1cm4nXTtcbiAgICBpZihyZXQgIT09IHVuZGVmaW5lZClhbk9iamVjdChyZXQuY2FsbChpdGVyYXRvcikpO1xuICAgIHRocm93IGU7XG4gIH1cbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGNyZWF0ZSAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgZGVzY3JpcHRvciAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBJdGVyYXRvclByb3RvdHlwZSA9IHt9O1xuXG4vLyAyNS4xLjIuMS4xICVJdGVyYXRvclByb3RvdHlwZSVbQEBpdGVyYXRvcl0oKVxucmVxdWlyZSgnLi9faGlkZScpKEl0ZXJhdG9yUHJvdG90eXBlLCByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKSwgZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KXtcbiAgQ29uc3RydWN0b3IucHJvdG90eXBlID0gY3JlYXRlKEl0ZXJhdG9yUHJvdG90eXBlLCB7bmV4dDogZGVzY3JpcHRvcigxLCBuZXh0KX0pO1xuICBzZXRUb1N0cmluZ1RhZyhDb25zdHJ1Y3RvciwgTkFNRSArICcgSXRlcmF0b3InKTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIExJQlJBUlkgICAgICAgID0gcmVxdWlyZSgnLi9fbGlicmFyeScpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIGhpZGUgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgaGFzICAgICAgICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIEl0ZXJhdG9ycyAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCAkaXRlckNyZWF0ZSAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY3JlYXRlJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCBnZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4vX29iamVjdC1ncG8nKVxuICAsIElURVJBVE9SICAgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBCVUdHWSAgICAgICAgICA9ICEoW10ua2V5cyAmJiAnbmV4dCcgaW4gW10ua2V5cygpKSAvLyBTYWZhcmkgaGFzIGJ1Z2d5IGl0ZXJhdG9ycyB3L28gYG5leHRgXG4gICwgRkZfSVRFUkFUT1IgICAgPSAnQEBpdGVyYXRvcidcbiAgLCBLRVlTICAgICAgICAgICA9ICdrZXlzJ1xuICAsIFZBTFVFUyAgICAgICAgID0gJ3ZhbHVlcyc7XG5cbnZhciByZXR1cm5UaGlzID0gZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oQmFzZSwgTkFNRSwgQ29uc3RydWN0b3IsIG5leHQsIERFRkFVTFQsIElTX1NFVCwgRk9SQ0VEKXtcbiAgJGl0ZXJDcmVhdGUoQ29uc3RydWN0b3IsIE5BTUUsIG5leHQpO1xuICB2YXIgZ2V0TWV0aG9kID0gZnVuY3Rpb24oa2luZCl7XG4gICAgaWYoIUJVR0dZICYmIGtpbmQgaW4gcHJvdG8pcmV0dXJuIHByb3RvW2tpbmRdO1xuICAgIHN3aXRjaChraW5kKXtcbiAgICAgIGNhc2UgS0VZUzogcmV0dXJuIGZ1bmN0aW9uIGtleXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgICAgIGNhc2UgVkFMVUVTOiByZXR1cm4gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgfSByZXR1cm4gZnVuY3Rpb24gZW50cmllcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICB9O1xuICB2YXIgVEFHICAgICAgICA9IE5BTUUgKyAnIEl0ZXJhdG9yJ1xuICAgICwgREVGX1ZBTFVFUyA9IERFRkFVTFQgPT0gVkFMVUVTXG4gICAgLCBWQUxVRVNfQlVHID0gZmFsc2VcbiAgICAsIHByb3RvICAgICAgPSBCYXNlLnByb3RvdHlwZVxuICAgICwgJG5hdGl2ZSAgICA9IHByb3RvW0lURVJBVE9SXSB8fCBwcm90b1tGRl9JVEVSQVRPUl0gfHwgREVGQVVMVCAmJiBwcm90b1tERUZBVUxUXVxuICAgICwgJGRlZmF1bHQgICA9ICRuYXRpdmUgfHwgZ2V0TWV0aG9kKERFRkFVTFQpXG4gICAgLCAkZW50cmllcyAgID0gREVGQVVMVCA/ICFERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoJ2VudHJpZXMnKSA6IHVuZGVmaW5lZFxuICAgICwgJGFueU5hdGl2ZSA9IE5BTUUgPT0gJ0FycmF5JyA/IHByb3RvLmVudHJpZXMgfHwgJG5hdGl2ZSA6ICRuYXRpdmVcbiAgICAsIG1ldGhvZHMsIGtleSwgSXRlcmF0b3JQcm90b3R5cGU7XG4gIC8vIEZpeCBuYXRpdmVcbiAgaWYoJGFueU5hdGl2ZSl7XG4gICAgSXRlcmF0b3JQcm90b3R5cGUgPSBnZXRQcm90b3R5cGVPZigkYW55TmF0aXZlLmNhbGwobmV3IEJhc2UpKTtcbiAgICBpZihJdGVyYXRvclByb3RvdHlwZSAhPT0gT2JqZWN0LnByb3RvdHlwZSl7XG4gICAgICAvLyBTZXQgQEB0b1N0cmluZ1RhZyB0byBuYXRpdmUgaXRlcmF0b3JzXG4gICAgICBzZXRUb1N0cmluZ1RhZyhJdGVyYXRvclByb3RvdHlwZSwgVEFHLCB0cnVlKTtcbiAgICAgIC8vIGZpeCBmb3Igc29tZSBvbGQgZW5naW5lc1xuICAgICAgaWYoIUxJQlJBUlkgJiYgIWhhcyhJdGVyYXRvclByb3RvdHlwZSwgSVRFUkFUT1IpKWhpZGUoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SLCByZXR1cm5UaGlzKTtcbiAgICB9XG4gIH1cbiAgLy8gZml4IEFycmF5I3t2YWx1ZXMsIEBAaXRlcmF0b3J9Lm5hbWUgaW4gVjggLyBGRlxuICBpZihERUZfVkFMVUVTICYmICRuYXRpdmUgJiYgJG5hdGl2ZS5uYW1lICE9PSBWQUxVRVMpe1xuICAgIFZBTFVFU19CVUcgPSB0cnVlO1xuICAgICRkZWZhdWx0ID0gZnVuY3Rpb24gdmFsdWVzKCl7IHJldHVybiAkbmF0aXZlLmNhbGwodGhpcyk7IH07XG4gIH1cbiAgLy8gRGVmaW5lIGl0ZXJhdG9yXG4gIGlmKCghTElCUkFSWSB8fCBGT1JDRUQpICYmIChCVUdHWSB8fCBWQUxVRVNfQlVHIHx8ICFwcm90b1tJVEVSQVRPUl0pKXtcbiAgICBoaWRlKHByb3RvLCBJVEVSQVRPUiwgJGRlZmF1bHQpO1xuICB9XG4gIC8vIFBsdWcgZm9yIGxpYnJhcnlcbiAgSXRlcmF0b3JzW05BTUVdID0gJGRlZmF1bHQ7XG4gIEl0ZXJhdG9yc1tUQUddICA9IHJldHVyblRoaXM7XG4gIGlmKERFRkFVTFQpe1xuICAgIG1ldGhvZHMgPSB7XG4gICAgICB2YWx1ZXM6ICBERUZfVkFMVUVTID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoVkFMVUVTKSxcbiAgICAgIGtleXM6ICAgIElTX1NFVCAgICAgPyAkZGVmYXVsdCA6IGdldE1ldGhvZChLRVlTKSxcbiAgICAgIGVudHJpZXM6ICRlbnRyaWVzXG4gICAgfTtcbiAgICBpZihGT1JDRUQpZm9yKGtleSBpbiBtZXRob2RzKXtcbiAgICAgIGlmKCEoa2V5IGluIHByb3RvKSlyZWRlZmluZShwcm90bywga2V5LCBtZXRob2RzW2tleV0pO1xuICAgIH0gZWxzZSAkZXhwb3J0KCRleHBvcnQuUCArICRleHBvcnQuRiAqIChCVUdHWSB8fCBWQUxVRVNfQlVHKSwgTkFNRSwgbWV0aG9kcyk7XG4gIH1cbiAgcmV0dXJuIG1ldGhvZHM7XG59OyIsInZhciBJVEVSQVRPUiAgICAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIFNBRkVfQ0xPU0lORyA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgcml0ZXIgPSBbN11bSVRFUkFUT1JdKCk7XG4gIHJpdGVyWydyZXR1cm4nXSA9IGZ1bmN0aW9uKCl7IFNBRkVfQ0xPU0lORyA9IHRydWU7IH07XG4gIEFycmF5LmZyb20ocml0ZXIsIGZ1bmN0aW9uKCl7IHRocm93IDI7IH0pO1xufSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGV4ZWMsIHNraXBDbG9zaW5nKXtcbiAgaWYoIXNraXBDbG9zaW5nICYmICFTQUZFX0NMT1NJTkcpcmV0dXJuIGZhbHNlO1xuICB2YXIgc2FmZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIHZhciBhcnIgID0gWzddXG4gICAgICAsIGl0ZXIgPSBhcnJbSVRFUkFUT1JdKCk7XG4gICAgaXRlci5uZXh0ID0gZnVuY3Rpb24oKXsgcmV0dXJuIHtkb25lOiBzYWZlID0gdHJ1ZX07IH07XG4gICAgYXJyW0lURVJBVE9SXSA9IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyOyB9O1xuICAgIGV4ZWMoYXJyKTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gc2FmZTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihkb25lLCB2YWx1ZSl7XG4gIHJldHVybiB7dmFsdWU6IHZhbHVlLCBkb25lOiAhIWRvbmV9O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHt9OyIsInZhciBnZXRLZXlzICAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpXG4gICwgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihvYmplY3QsIGVsKXtcbiAgdmFyIE8gICAgICA9IHRvSU9iamVjdChvYmplY3QpXG4gICAgLCBrZXlzICAgPSBnZXRLZXlzKE8pXG4gICAgLCBsZW5ndGggPSBrZXlzLmxlbmd0aFxuICAgICwgaW5kZXggID0gMFxuICAgICwga2V5O1xuICB3aGlsZShsZW5ndGggPiBpbmRleClpZihPW2tleSA9IGtleXNbaW5kZXgrK11dID09PSBlbClyZXR1cm4ga2V5O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHRydWU7IiwidmFyIE1FVEEgICAgID0gcmVxdWlyZSgnLi9fdWlkJykoJ21ldGEnKVxuICAsIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBoYXMgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgc2V0RGVzYyAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mXG4gICwgaWQgICAgICAgPSAwO1xudmFyIGlzRXh0ZW5zaWJsZSA9IE9iamVjdC5pc0V4dGVuc2libGUgfHwgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIHRydWU7XG59O1xudmFyIEZSRUVaRSA9ICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBpc0V4dGVuc2libGUoT2JqZWN0LnByZXZlbnRFeHRlbnNpb25zKHt9KSk7XG59KTtcbnZhciBzZXRNZXRhID0gZnVuY3Rpb24oaXQpe1xuICBzZXREZXNjKGl0LCBNRVRBLCB7dmFsdWU6IHtcbiAgICBpOiAnTycgKyArK2lkLCAvLyBvYmplY3QgSURcbiAgICB3OiB7fSAgICAgICAgICAvLyB3ZWFrIGNvbGxlY3Rpb25zIElEc1xuICB9fSk7XG59O1xudmFyIGZhc3RLZXkgPSBmdW5jdGlvbihpdCwgY3JlYXRlKXtcbiAgLy8gcmV0dXJuIHByaW1pdGl2ZSB3aXRoIHByZWZpeFxuICBpZighaXNPYmplY3QoaXQpKXJldHVybiB0eXBlb2YgaXQgPT0gJ3N5bWJvbCcgPyBpdCA6ICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgPyAnUycgOiAnUCcpICsgaXQ7XG4gIGlmKCFoYXMoaXQsIE1FVEEpKXtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmKCFpc0V4dGVuc2libGUoaXQpKXJldHVybiAnRic7XG4gICAgLy8gbm90IG5lY2Vzc2FyeSB0byBhZGQgbWV0YWRhdGFcbiAgICBpZighY3JlYXRlKXJldHVybiAnRSc7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIG9iamVjdCBJRFxuICB9IHJldHVybiBpdFtNRVRBXS5pO1xufTtcbnZhciBnZXRXZWFrID0gZnVuY3Rpb24oaXQsIGNyZWF0ZSl7XG4gIGlmKCFoYXMoaXQsIE1FVEEpKXtcbiAgICAvLyBjYW4ndCBzZXQgbWV0YWRhdGEgdG8gdW5jYXVnaHQgZnJvemVuIG9iamVjdFxuICAgIGlmKCFpc0V4dGVuc2libGUoaXQpKXJldHVybiB0cnVlO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gZmFsc2U7XG4gICAgLy8gYWRkIG1pc3NpbmcgbWV0YWRhdGFcbiAgICBzZXRNZXRhKGl0KTtcbiAgLy8gcmV0dXJuIGhhc2ggd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfSByZXR1cm4gaXRbTUVUQV0udztcbn07XG4vLyBhZGQgbWV0YWRhdGEgb24gZnJlZXplLWZhbWlseSBtZXRob2RzIGNhbGxpbmdcbnZhciBvbkZyZWV6ZSA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoRlJFRVpFICYmIG1ldGEuTkVFRCAmJiBpc0V4dGVuc2libGUoaXQpICYmICFoYXMoaXQsIE1FVEEpKXNldE1ldGEoaXQpO1xuICByZXR1cm4gaXQ7XG59O1xudmFyIG1ldGEgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgS0VZOiAgICAgIE1FVEEsXG4gIE5FRUQ6ICAgICBmYWxzZSxcbiAgZmFzdEtleTogIGZhc3RLZXksXG4gIGdldFdlYWs6ICBnZXRXZWFrLFxuICBvbkZyZWV6ZTogb25GcmVlemVcbn07IiwidmFyIGdsb2JhbCAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgbWFjcm90YXNrID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldFxuICAsIE9ic2VydmVyICA9IGdsb2JhbC5NdXRhdGlvbk9ic2VydmVyIHx8IGdsb2JhbC5XZWJLaXRNdXRhdGlvbk9ic2VydmVyXG4gICwgcHJvY2VzcyAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBQcm9taXNlICAgPSBnbG9iYWwuUHJvbWlzZVxuICAsIGlzTm9kZSAgICA9IHJlcXVpcmUoJy4vX2NvZicpKHByb2Nlc3MpID09ICdwcm9jZXNzJ1xuICAsIGhlYWQsIGxhc3QsIG5vdGlmeTtcblxudmFyIGZsdXNoID0gZnVuY3Rpb24oKXtcbiAgdmFyIHBhcmVudCwgZm47XG4gIGlmKGlzTm9kZSAmJiAocGFyZW50ID0gcHJvY2Vzcy5kb21haW4pKXBhcmVudC5leGl0KCk7XG4gIHdoaWxlKGhlYWQpe1xuICAgIGZuID0gaGVhZC5mbjtcbiAgICBmbigpOyAvLyA8LSBjdXJyZW50bHkgd2UgdXNlIGl0IG9ubHkgZm9yIFByb21pc2UgLSB0cnkgLyBjYXRjaCBub3QgcmVxdWlyZWRcbiAgICBoZWFkID0gaGVhZC5uZXh0O1xuICB9IGxhc3QgPSB1bmRlZmluZWQ7XG4gIGlmKHBhcmVudClwYXJlbnQuZW50ZXIoKTtcbn07XG5cbi8vIE5vZGUuanNcbmlmKGlzTm9kZSl7XG4gIG5vdGlmeSA9IGZ1bmN0aW9uKCl7XG4gICAgcHJvY2Vzcy5uZXh0VGljayhmbHVzaCk7XG4gIH07XG4vLyBicm93c2VycyB3aXRoIE11dGF0aW9uT2JzZXJ2ZXJcbn0gZWxzZSBpZihPYnNlcnZlcil7XG4gIHZhciB0b2dnbGUgPSB0cnVlXG4gICAgLCBub2RlICAgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnJyk7XG4gIG5ldyBPYnNlcnZlcihmbHVzaCkub2JzZXJ2ZShub2RlLCB7Y2hhcmFjdGVyRGF0YTogdHJ1ZX0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ld1xuICBub3RpZnkgPSBmdW5jdGlvbigpe1xuICAgIG5vZGUuZGF0YSA9IHRvZ2dsZSA9ICF0b2dnbGU7XG4gIH07XG4vLyBlbnZpcm9ubWVudHMgd2l0aCBtYXliZSBub24tY29tcGxldGVseSBjb3JyZWN0LCBidXQgZXhpc3RlbnQgUHJvbWlzZVxufSBlbHNlIGlmKFByb21pc2UgJiYgUHJvbWlzZS5yZXNvbHZlKXtcbiAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcbiAgICBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZsdXNoKTtcbiAgfTtcbi8vIGZvciBvdGhlciBlbnZpcm9ubWVudHMgLSBtYWNyb3Rhc2sgYmFzZWQgb246XG4vLyAtIHNldEltbWVkaWF0ZVxuLy8gLSBNZXNzYWdlQ2hhbm5lbFxuLy8gLSB3aW5kb3cucG9zdE1lc3NhZ1xuLy8gLSBvbnJlYWR5c3RhdGVjaGFuZ2Vcbi8vIC0gc2V0VGltZW91dFxufSBlbHNlIHtcbiAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcbiAgICAvLyBzdHJhbmdlIElFICsgd2VicGFjayBkZXYgc2VydmVyIGJ1ZyAtIHVzZSAuY2FsbChnbG9iYWwpXG4gICAgbWFjcm90YXNrLmNhbGwoZ2xvYmFsLCBmbHVzaCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4pe1xuICB2YXIgdGFzayA9IHtmbjogZm4sIG5leHQ6IHVuZGVmaW5lZH07XG4gIGlmKGxhc3QpbGFzdC5uZXh0ID0gdGFzaztcbiAgaWYoIWhlYWQpe1xuICAgIGhlYWQgPSB0YXNrO1xuICAgIG5vdGlmeSgpO1xuICB9IGxhc3QgPSB0YXNrO1xufTsiLCIndXNlIHN0cmljdCc7XG4vLyAxOS4xLjIuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlLCAuLi4pXG52YXIgZ2V0S2V5cyAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpXG4gICwgZ09QUyAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpXG4gICwgcElFICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJylcbiAgLCB0b09iamVjdCA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXG4gICwgSU9iamVjdCAgPSByZXF1aXJlKCcuL19pb2JqZWN0JylcbiAgLCAkYXNzaWduICA9IE9iamVjdC5hc3NpZ247XG5cbi8vIHNob3VsZCB3b3JrIHdpdGggc3ltYm9scyBhbmQgc2hvdWxkIGhhdmUgZGV0ZXJtaW5pc3RpYyBwcm9wZXJ0eSBvcmRlciAoVjggYnVnKVxubW9kdWxlLmV4cG9ydHMgPSAhJGFzc2lnbiB8fCByZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XG4gIHZhciBBID0ge31cbiAgICAsIEIgPSB7fVxuICAgICwgUyA9IFN5bWJvbCgpXG4gICAgLCBLID0gJ2FiY2RlZmdoaWprbG1ub3BxcnN0JztcbiAgQVtTXSA9IDc7XG4gIEsuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24oayl7IEJba10gPSBrOyB9KTtcbiAgcmV0dXJuICRhc3NpZ24oe30sIEEpW1NdICE9IDcgfHwgT2JqZWN0LmtleXMoJGFzc2lnbih7fSwgQikpLmpvaW4oJycpICE9IEs7XG59KSA/IGZ1bmN0aW9uIGFzc2lnbih0YXJnZXQsIHNvdXJjZSl7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgdmFyIFQgICAgID0gdG9PYmplY3QodGFyZ2V0KVxuICAgICwgYUxlbiAgPSBhcmd1bWVudHMubGVuZ3RoXG4gICAgLCBpbmRleCA9IDFcbiAgICAsIGdldFN5bWJvbHMgPSBnT1BTLmZcbiAgICAsIGlzRW51bSAgICAgPSBwSUUuZjtcbiAgd2hpbGUoYUxlbiA+IGluZGV4KXtcbiAgICB2YXIgUyAgICAgID0gSU9iamVjdChhcmd1bWVudHNbaW5kZXgrK10pXG4gICAgICAsIGtleXMgICA9IGdldFN5bWJvbHMgPyBnZXRLZXlzKFMpLmNvbmNhdChnZXRTeW1ib2xzKFMpKSA6IGdldEtleXMoUylcbiAgICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAgICwgaiAgICAgID0gMFxuICAgICAgLCBrZXk7XG4gICAgd2hpbGUobGVuZ3RoID4gailpZihpc0VudW0uY2FsbChTLCBrZXkgPSBrZXlzW2orK10pKVRba2V5XSA9IFNba2V5XTtcbiAgfSByZXR1cm4gVDtcbn0gOiAkYXNzaWduOyIsIi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxyXG52YXIgYW5PYmplY3QgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxyXG4gICwgZFBzICAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHBzJylcclxuICAsIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpXHJcbiAgLCBJRV9QUk9UTyAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKVxyXG4gICwgRW1wdHkgICAgICAgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9XHJcbiAgLCBQUk9UT1RZUEUgICA9ICdwcm90b3R5cGUnO1xyXG5cclxuLy8gQ3JlYXRlIG9iamVjdCB3aXRoIGZha2UgYG51bGxgIHByb3RvdHlwZTogdXNlIGlmcmFtZSBPYmplY3Qgd2l0aCBjbGVhcmVkIHByb3RvdHlwZVxyXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uKCl7XHJcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcclxuICB2YXIgaWZyYW1lID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpKCdpZnJhbWUnKVxyXG4gICAgLCBpICAgICAgPSBlbnVtQnVnS2V5cy5sZW5ndGhcclxuICAgICwgZ3QgICAgID0gJz4nXHJcbiAgICAsIGlmcmFtZURvY3VtZW50O1xyXG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xyXG4gIHJlcXVpcmUoJy4vX2h0bWwnKS5hcHBlbmRDaGlsZChpZnJhbWUpO1xyXG4gIGlmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDonOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNjcmlwdC11cmxcclxuICAvLyBjcmVhdGVEaWN0ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuT2JqZWN0O1xyXG4gIC8vIGh0bWwucmVtb3ZlQ2hpbGQoaWZyYW1lKTtcclxuICBpZnJhbWVEb2N1bWVudCA9IGlmcmFtZS5jb250ZW50V2luZG93LmRvY3VtZW50O1xyXG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcclxuICBpZnJhbWVEb2N1bWVudC53cml0ZSgnPHNjcmlwdD5kb2N1bWVudC5GPU9iamVjdDwvc2NyaXB0JyArIGd0KTtcclxuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xyXG4gIGNyZWF0ZURpY3QgPSBpZnJhbWVEb2N1bWVudC5GO1xyXG4gIHdoaWxlKGktLSlkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2ldXTtcclxuICByZXR1cm4gY3JlYXRlRGljdCgpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKXtcclxuICB2YXIgcmVzdWx0O1xyXG4gIGlmKE8gIT09IG51bGwpe1xyXG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xyXG4gICAgcmVzdWx0ID0gbmV3IEVtcHR5O1xyXG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IG51bGw7XHJcbiAgICAvLyBhZGQgXCJfX3Byb3RvX19cIiBmb3IgT2JqZWN0LmdldFByb3RvdHlwZU9mIHBvbHlmaWxsXHJcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcclxuICB9IGVsc2UgcmVzdWx0ID0gY3JlYXRlRGljdCgpO1xyXG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkUHMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcclxufTsiLCJ2YXIgYW5PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKVxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcbiAgLCBkUCAgICAgICAgICAgICA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpe1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcbiAgICByZXR1cm4gZFAoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgaWYoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKXRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQhJyk7XG4gIGlmKCd2YWx1ZScgaW4gQXR0cmlidXRlcylPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59OyIsInZhciBkUCAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXHJcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXHJcbiAgLCBnZXRLZXlzICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcyl7XHJcbiAgYW5PYmplY3QoTyk7XHJcbiAgdmFyIGtleXMgICA9IGdldEtleXMoUHJvcGVydGllcylcclxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcclxuICAgICwgaSA9IDBcclxuICAgICwgUDtcclxuICB3aGlsZShsZW5ndGggPiBpKWRQLmYoTywgUCA9IGtleXNbaSsrXSwgUHJvcGVydGllc1tQXSk7XHJcbiAgcmV0dXJuIE87XHJcbn07IiwidmFyIHBJRSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpXHJcbiAgLCBjcmVhdGVEZXNjICAgICA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKVxyXG4gICwgdG9JT2JqZWN0ICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcclxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcclxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcclxuICAsIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi9faWU4LWRvbS1kZWZpbmUnKVxyXG4gICwgZ09QRCAgICAgICAgICAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xyXG5cclxuZXhwb3J0cy5mID0gcmVxdWlyZSgnLi9fZGVzY3JpcHRvcnMnKSA/IGdPUEQgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCl7XHJcbiAgTyA9IHRvSU9iamVjdChPKTtcclxuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XHJcbiAgaWYoSUU4X0RPTV9ERUZJTkUpdHJ5IHtcclxuICAgIHJldHVybiBnT1BEKE8sIFApO1xyXG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cclxuICBpZihoYXMoTywgUCkpcmV0dXJuIGNyZWF0ZURlc2MoIXBJRS5mLmNhbGwoTywgUCksIE9bUF0pO1xyXG59OyIsIi8vIGZhbGxiYWNrIGZvciBJRTExIGJ1Z2d5IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHdpdGggaWZyYW1lIGFuZCB3aW5kb3dcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCBnT1BOICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbicpLmZcbiAgLCB0b1N0cmluZyAgPSB7fS50b1N0cmluZztcblxudmFyIHdpbmRvd05hbWVzID0gdHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cgJiYgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNcbiAgPyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh3aW5kb3cpIDogW107XG5cbnZhciBnZXRXaW5kb3dOYW1lcyA9IGZ1bmN0aW9uKGl0KXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZ09QTihpdCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHdpbmRvd05hbWVzLnNsaWNlKCk7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmYgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKGl0KXtcbiAgcmV0dXJuIHdpbmRvd05hbWVzICYmIHRvU3RyaW5nLmNhbGwoaXQpID09ICdbb2JqZWN0IFdpbmRvd10nID8gZ2V0V2luZG93TmFtZXMoaXQpIDogZ09QTih0b0lPYmplY3QoaXQpKTtcbn07XG4iLCIvLyAxOS4xLjIuNyAvIDE1LjIuMy40IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXHJcbnZhciAka2V5cyAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKVxyXG4gICwgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKS5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcclxuXHJcbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTyl7XHJcbiAgcmV0dXJuICRrZXlzKE8sIGhpZGRlbktleXMpO1xyXG59OyIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7IiwiLy8gMTkuMS4yLjkgLyAxNS4yLjMuMiBPYmplY3QuZ2V0UHJvdG90eXBlT2YoTylcclxudmFyIGhhcyAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcclxuICAsIHRvT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcclxuICAsIElFX1BST1RPICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkLWtleScpKCdJRV9QUk9UTycpXHJcbiAgLCBPYmplY3RQcm90byA9IE9iamVjdC5wcm90b3R5cGU7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5nZXRQcm90b3R5cGVPZiB8fCBmdW5jdGlvbihPKXtcclxuICBPID0gdG9PYmplY3QoTyk7XHJcbiAgaWYoaGFzKE8sIElFX1BST1RPKSlyZXR1cm4gT1tJRV9QUk9UT107XHJcbiAgaWYodHlwZW9mIE8uY29uc3RydWN0b3IgPT0gJ2Z1bmN0aW9uJyAmJiBPIGluc3RhbmNlb2YgTy5jb25zdHJ1Y3Rvcil7XHJcbiAgICByZXR1cm4gTy5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XHJcbiAgfSByZXR1cm4gTyBpbnN0YW5jZW9mIE9iamVjdCA/IE9iamVjdFByb3RvIDogbnVsbDtcclxufTsiLCJ2YXIgaGFzICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcclxuICAsIHRvSU9iamVjdCAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxyXG4gICwgYXJyYXlJbmRleE9mID0gcmVxdWlyZSgnLi9fYXJyYXktaW5jbHVkZXMnKShmYWxzZSlcclxuICAsIElFX1BST1RPICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBuYW1lcyl7XHJcbiAgdmFyIE8gICAgICA9IHRvSU9iamVjdChvYmplY3QpXHJcbiAgICAsIGkgICAgICA9IDBcclxuICAgICwgcmVzdWx0ID0gW11cclxuICAgICwga2V5O1xyXG4gIGZvcihrZXkgaW4gTylpZihrZXkgIT0gSUVfUFJPVE8paGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcclxuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXHJcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZihoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpe1xyXG4gICAgfmFycmF5SW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcclxuICB9XHJcbiAgcmV0dXJuIHJlc3VsdDtcclxufTsiLCIvLyAxOS4xLjIuMTQgLyAxNS4yLjMuMTQgT2JqZWN0LmtleXMoTylcclxudmFyICRrZXlzICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMtaW50ZXJuYWwnKVxyXG4gICwgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTyl7XHJcbiAgcmV0dXJuICRrZXlzKE8sIGVudW1CdWdLZXlzKTtcclxufTsiLCJleHBvcnRzLmYgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTsiLCIvLyBtb3N0IE9iamVjdCBtZXRob2RzIGJ5IEVTNiBzaG91bGQgYWNjZXB0IHByaW1pdGl2ZXNcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCBjb3JlICAgID0gcmVxdWlyZSgnLi9fY29yZScpXG4gICwgZmFpbHMgICA9IHJlcXVpcmUoJy4vX2ZhaWxzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEtFWSwgZXhlYyl7XG4gIHZhciBmbiAgPSAoY29yZS5PYmplY3QgfHwge30pW0tFWV0gfHwgT2JqZWN0W0tFWV1cbiAgICAsIGV4cCA9IHt9O1xuICBleHBbS0VZXSA9IGV4ZWMoZm4pO1xuICAkZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIGZhaWxzKGZ1bmN0aW9uKCl7IGZuKDEpOyB9KSwgJ09iamVjdCcsIGV4cCk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYml0bWFwLCB2YWx1ZSl7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZSAgOiAhKGJpdG1hcCAmIDEpLFxuICAgIGNvbmZpZ3VyYWJsZTogIShiaXRtYXAgJiAyKSxcbiAgICB3cml0YWJsZSAgICA6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWUgICAgICAgOiB2YWx1ZVxuICB9O1xufTsiLCJ2YXIgaGlkZSA9IHJlcXVpcmUoJy4vX2hpZGUnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odGFyZ2V0LCBzcmMsIHNhZmUpe1xuICBmb3IodmFyIGtleSBpbiBzcmMpe1xuICAgIGlmKHNhZmUgJiYgdGFyZ2V0W2tleV0pdGFyZ2V0W2tleV0gPSBzcmNba2V5XTtcbiAgICBlbHNlIGhpZGUodGFyZ2V0LCBrZXksIHNyY1trZXldKTtcbiAgfSByZXR1cm4gdGFyZ2V0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2hpZGUnKTsiLCIvLyBXb3JrcyB3aXRoIF9fcHJvdG9fXyBvbmx5LiBPbGQgdjggY2FuJ3Qgd29yayB3aXRoIG51bGwgcHJvdG8gb2JqZWN0cy5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0Jyk7XG52YXIgY2hlY2sgPSBmdW5jdGlvbihPLCBwcm90byl7XG4gIGFuT2JqZWN0KE8pO1xuICBpZighaXNPYmplY3QocHJvdG8pICYmIHByb3RvICE9PSBudWxsKXRocm93IFR5cGVFcnJvcihwcm90byArIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGZ1bmN0aW9uKHRlc3QsIGJ1Z2d5LCBzZXQpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi9fY3R4JykoRnVuY3Rpb24uY2FsbCwgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKS5mKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQsIDIpO1xuICAgICAgICBzZXQodGVzdCwgW10pO1xuICAgICAgICBidWdneSA9ICEodGVzdCBpbnN0YW5jZW9mIEFycmF5KTtcbiAgICAgIH0gY2F0Y2goZSl7IGJ1Z2d5ID0gdHJ1ZTsgfVxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIHNldFByb3RvdHlwZU9mKE8sIHByb3RvKXtcbiAgICAgICAgY2hlY2soTywgcHJvdG8pO1xuICAgICAgICBpZihidWdneSlPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgICAgICBlbHNlIHNldChPLCBwcm90byk7XG4gICAgICAgIHJldHVybiBPO1xuICAgICAgfTtcbiAgICB9KHt9LCBmYWxzZSkgOiB1bmRlZmluZWQpLFxuICBjaGVjazogY2hlY2tcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGdsb2JhbCAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGRQICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJylcbiAgLCBTUEVDSUVTICAgICA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZKXtcbiAgdmFyIEMgPSB0eXBlb2YgY29yZVtLRVldID09ICdmdW5jdGlvbicgPyBjb3JlW0tFWV0gOiBnbG9iYWxbS0VZXTtcbiAgaWYoREVTQ1JJUFRPUlMgJiYgQyAmJiAhQ1tTUEVDSUVTXSlkUC5mKEMsIFNQRUNJRVMsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbigpeyByZXR1cm4gdGhpczsgfVxuICB9KTtcbn07IiwidmFyIGRlZiA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZcbiAgLCBoYXMgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIFRBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCB0YWcsIHN0YXQpe1xuICBpZihpdCAmJiAhaGFzKGl0ID0gc3RhdCA/IGl0IDogaXQucHJvdG90eXBlLCBUQUcpKWRlZihpdCwgVEFHLCB7Y29uZmlndXJhYmxlOiB0cnVlLCB2YWx1ZTogdGFnfSk7XG59OyIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgna2V5cycpXHJcbiAgLCB1aWQgICAgPSByZXF1aXJlKCcuL191aWQnKTtcclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xyXG4gIHJldHVybiBzaGFyZWRba2V5XSB8fCAoc2hhcmVkW2tleV0gPSB1aWQoa2V5KSk7XHJcbn07IiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXydcbiAgLCBzdG9yZSAgPSBnbG9iYWxbU0hBUkVEXSB8fCAoZ2xvYmFsW1NIQVJFRF0gPSB7fSk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGtleSl7XG4gIHJldHVybiBzdG9yZVtrZXldIHx8IChzdG9yZVtrZXldID0ge30pO1xufTsiLCIvLyA3LjMuMjAgU3BlY2llc0NvbnN0cnVjdG9yKE8sIGRlZmF1bHRDb25zdHJ1Y3RvcilcbnZhciBhbk9iamVjdCAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKVxuICAsIFNQRUNJRVMgICA9IHJlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKE8sIEQpe1xuICB2YXIgQyA9IGFuT2JqZWN0KE8pLmNvbnN0cnVjdG9yLCBTO1xuICByZXR1cm4gQyA9PT0gdW5kZWZpbmVkIHx8IChTID0gYW5PYmplY3QoQylbU1BFQ0lFU10pID09IHVuZGVmaW5lZCA/IEQgOiBhRnVuY3Rpb24oUyk7XG59OyIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBkZWZpbmVkICAgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG4vLyB0cnVlICAtPiBTdHJpbmcjYXRcbi8vIGZhbHNlIC0+IFN0cmluZyNjb2RlUG9pbnRBdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihUT19TVFJJTkcpe1xuICByZXR1cm4gZnVuY3Rpb24odGhhdCwgcG9zKXtcbiAgICB2YXIgcyA9IFN0cmluZyhkZWZpbmVkKHRoYXQpKVxuICAgICAgLCBpID0gdG9JbnRlZ2VyKHBvcylcbiAgICAgICwgbCA9IHMubGVuZ3RoXG4gICAgICAsIGEsIGI7XG4gICAgaWYoaSA8IDAgfHwgaSA+PSBsKXJldHVybiBUT19TVFJJTkcgPyAnJyA6IHVuZGVmaW5lZDtcbiAgICBhID0gcy5jaGFyQ29kZUF0KGkpO1xuICAgIHJldHVybiBhIDwgMHhkODAwIHx8IGEgPiAweGRiZmYgfHwgaSArIDEgPT09IGwgfHwgKGIgPSBzLmNoYXJDb2RlQXQoaSArIDEpKSA8IDB4ZGMwMCB8fCBiID4gMHhkZmZmXG4gICAgICA/IFRPX1NUUklORyA/IHMuY2hhckF0KGkpIDogYVxuICAgICAgOiBUT19TVFJJTkcgPyBzLnNsaWNlKGksIGkgKyAyKSA6IChhIC0gMHhkODAwIDw8IDEwKSArIChiIC0gMHhkYzAwKSArIDB4MTAwMDA7XG4gIH07XG59OyIsInZhciBjdHggICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGludm9rZSAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2ludm9rZScpXG4gICwgaHRtbCAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faHRtbCcpXG4gICwgY2VsICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fZG9tLWNyZWF0ZScpXG4gICwgZ2xvYmFsICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBwcm9jZXNzICAgICAgICAgICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsIHNldFRhc2sgICAgICAgICAgICA9IGdsb2JhbC5zZXRJbW1lZGlhdGVcbiAgLCBjbGVhclRhc2sgICAgICAgICAgPSBnbG9iYWwuY2xlYXJJbW1lZGlhdGVcbiAgLCBNZXNzYWdlQ2hhbm5lbCAgICAgPSBnbG9iYWwuTWVzc2FnZUNoYW5uZWxcbiAgLCBjb3VudGVyICAgICAgICAgICAgPSAwXG4gICwgcXVldWUgICAgICAgICAgICAgID0ge31cbiAgLCBPTlJFQURZU1RBVEVDSEFOR0UgPSAnb25yZWFkeXN0YXRlY2hhbmdlJ1xuICAsIGRlZmVyLCBjaGFubmVsLCBwb3J0O1xudmFyIHJ1biA9IGZ1bmN0aW9uKCl7XG4gIHZhciBpZCA9ICt0aGlzO1xuICBpZihxdWV1ZS5oYXNPd25Qcm9wZXJ0eShpZCkpe1xuICAgIHZhciBmbiA9IHF1ZXVlW2lkXTtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICAgIGZuKCk7XG4gIH1cbn07XG52YXIgbGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCl7XG4gIHJ1bi5jYWxsKGV2ZW50LmRhdGEpO1xufTtcbi8vIE5vZGUuanMgMC45KyAmIElFMTArIGhhcyBzZXRJbW1lZGlhdGUsIG90aGVyd2lzZTpcbmlmKCFzZXRUYXNrIHx8ICFjbGVhclRhc2spe1xuICBzZXRUYXNrID0gZnVuY3Rpb24gc2V0SW1tZWRpYXRlKGZuKXtcbiAgICB2YXIgYXJncyA9IFtdLCBpID0gMTtcbiAgICB3aGlsZShhcmd1bWVudHMubGVuZ3RoID4gaSlhcmdzLnB1c2goYXJndW1lbnRzW2krK10pO1xuICAgIHF1ZXVlWysrY291bnRlcl0gPSBmdW5jdGlvbigpe1xuICAgICAgaW52b2tlKHR5cGVvZiBmbiA9PSAnZnVuY3Rpb24nID8gZm4gOiBGdW5jdGlvbihmbiksIGFyZ3MpO1xuICAgIH07XG4gICAgZGVmZXIoY291bnRlcik7XG4gICAgcmV0dXJuIGNvdW50ZXI7XG4gIH07XG4gIGNsZWFyVGFzayA9IGZ1bmN0aW9uIGNsZWFySW1tZWRpYXRlKGlkKXtcbiAgICBkZWxldGUgcXVldWVbaWRdO1xuICB9O1xuICAvLyBOb2RlLmpzIDAuOC1cbiAgaWYocmVxdWlyZSgnLi9fY29mJykocHJvY2VzcykgPT0gJ3Byb2Nlc3MnKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soY3R4KHJ1biwgaWQsIDEpKTtcbiAgICB9O1xuICAvLyBCcm93c2VycyB3aXRoIE1lc3NhZ2VDaGFubmVsLCBpbmNsdWRlcyBXZWJXb3JrZXJzXG4gIH0gZWxzZSBpZihNZXNzYWdlQ2hhbm5lbCl7XG4gICAgY2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICBwb3J0ICAgID0gY2hhbm5lbC5wb3J0MjtcbiAgICBjaGFubmVsLnBvcnQxLm9ubWVzc2FnZSA9IGxpc3RlbmVyO1xuICAgIGRlZmVyID0gY3R4KHBvcnQucG9zdE1lc3NhZ2UsIHBvcnQsIDEpO1xuICAvLyBCcm93c2VycyB3aXRoIHBvc3RNZXNzYWdlLCBza2lwIFdlYldvcmtlcnNcbiAgLy8gSUU4IGhhcyBwb3N0TWVzc2FnZSwgYnV0IGl0J3Mgc3luYyAmIHR5cGVvZiBpdHMgcG9zdE1lc3NhZ2UgaXMgJ29iamVjdCdcbiAgfSBlbHNlIGlmKGdsb2JhbC5hZGRFdmVudExpc3RlbmVyICYmIHR5cGVvZiBwb3N0TWVzc2FnZSA9PSAnZnVuY3Rpb24nICYmICFnbG9iYWwuaW1wb3J0U2NyaXB0cyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBnbG9iYWwucG9zdE1lc3NhZ2UoaWQgKyAnJywgJyonKTtcbiAgICB9O1xuICAgIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgbGlzdGVuZXIsIGZhbHNlKTtcbiAgLy8gSUU4LVxuICB9IGVsc2UgaWYoT05SRUFEWVNUQVRFQ0hBTkdFIGluIGNlbCgnc2NyaXB0Jykpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgaHRtbC5hcHBlbmRDaGlsZChjZWwoJ3NjcmlwdCcpKVtPTlJFQURZU1RBVEVDSEFOR0VdID0gZnVuY3Rpb24oKXtcbiAgICAgICAgaHRtbC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICAgICAgcnVuLmNhbGwoaWQpO1xuICAgICAgfTtcbiAgICB9O1xuICAvLyBSZXN0IG9sZCBicm93c2Vyc1xuICB9IGVsc2Uge1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgc2V0VGltZW91dChjdHgocnVuLCBpZCwgMSksIDApO1xuICAgIH07XG4gIH1cbn1cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6ICAgc2V0VGFzayxcbiAgY2xlYXI6IGNsZWFyVGFza1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgbWF4ICAgICAgID0gTWF0aC5tYXhcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaW5kZXgsIGxlbmd0aCl7XG4gIGluZGV4ID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGluZGV4IDwgMCA/IG1heChpbmRleCArIGxlbmd0aCwgMCkgOiBtaW4oaW5kZXgsIGxlbmd0aCk7XG59OyIsIi8vIDcuMS40IFRvSW50ZWdlclxudmFyIGNlaWwgID0gTWF0aC5jZWlsXG4gICwgZmxvb3IgPSBNYXRoLmZsb29yO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpc05hTihpdCA9ICtpdCkgPyAwIDogKGl0ID4gMCA/IGZsb29yIDogY2VpbCkoaXQpO1xufTsiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi9faW9iamVjdCcpXG4gICwgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gSU9iamVjdChkZWZpbmVkKGl0KSk7XG59OyIsIi8vIDcuMS4xNSBUb0xlbmd0aFxudmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1pbiAgICAgICA9IE1hdGgubWluO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCA+IDAgPyBtaW4odG9JbnRlZ2VyKGl0KSwgMHgxZmZmZmZmZmZmZmZmZikgOiAwOyAvLyBwb3coMiwgNTMpIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59OyIsIi8vIDcuMS4xMyBUb09iamVjdChhcmd1bWVudClcbnZhciBkZWZpbmVkID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMSBUb1ByaW1pdGl2ZShpbnB1dCBbLCBQcmVmZXJyZWRUeXBlXSlcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpO1xuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0LCBTKXtcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gaXQ7XG4gIHZhciBmbiwgdmFsO1xuICBpZihTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKHR5cGVvZiAoZm4gPSBpdC52YWx1ZU9mKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgaWYoIVMgJiYgdHlwZW9mIChmbiA9IGl0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGl0KSkpcmV0dXJuIHZhbDtcbiAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY29udmVydCBvYmplY3QgdG8gcHJpbWl0aXZlIHZhbHVlXCIpO1xufTsiLCJ2YXIgaWQgPSAwXG4gICwgcHggPSBNYXRoLnJhbmRvbSgpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gJ1N5bWJvbCgnLmNvbmNhdChrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5LCAnKV8nLCAoKytpZCArIHB4KS50b1N0cmluZygzNikpO1xufTsiLCJ2YXIgc3RvcmUgICAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZCcpKCd3a3MnKVxuICAsIHVpZCAgICAgICAgPSByZXF1aXJlKCcuL191aWQnKVxuICAsIFN5bWJvbCAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKS5TeW1ib2xcbiAgLCBVU0VfU1lNQk9MID0gdHlwZW9mIFN5bWJvbCA9PSAnZnVuY3Rpb24nO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihuYW1lKXtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9XG4gICAgVVNFX1NZTUJPTCAmJiBTeW1ib2xbbmFtZV0gfHwgKFVTRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07IiwidmFyIGNsYXNzb2YgICA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKVxuICAsIElURVJBVE9SICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgSXRlcmF0b3JzID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2NvcmUnKS5nZXRJdGVyYXRvck1ldGhvZCA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoaXQgIT0gdW5kZWZpbmVkKXJldHVybiBpdFtJVEVSQVRPUl1cbiAgICB8fCBpdFsnQEBpdGVyYXRvciddXG4gICAgfHwgSXRlcmF0b3JzW2NsYXNzb2YoaXQpXTtcbn07IiwiJ3VzZSBzdHJpY3QnO1xudmFyIGN0eCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgdG9PYmplY3QgICAgICAgPSByZXF1aXJlKCcuL190by1vYmplY3QnKVxuICAsIGNhbGwgICAgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1jYWxsJylcbiAgLCBpc0FycmF5SXRlciAgICA9IHJlcXVpcmUoJy4vX2lzLWFycmF5LWl0ZXInKVxuICAsIHRvTGVuZ3RoICAgICAgID0gcmVxdWlyZSgnLi9fdG8tbGVuZ3RoJylcbiAgLCBjcmVhdGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX2NyZWF0ZS1wcm9wZXJ0eScpXG4gICwgZ2V0SXRlckZuICAgICAgPSByZXF1aXJlKCcuL2NvcmUuZ2V0LWl0ZXJhdG9yLW1ldGhvZCcpO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpeyBBcnJheS5mcm9tKGl0ZXIpOyB9KSwgJ0FycmF5Jywge1xuICAvLyAyMi4xLjIuMSBBcnJheS5mcm9tKGFycmF5TGlrZSwgbWFwZm4gPSB1bmRlZmluZWQsIHRoaXNBcmcgPSB1bmRlZmluZWQpXG4gIGZyb206IGZ1bmN0aW9uIGZyb20oYXJyYXlMaWtlLyosIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKi8pe1xuICAgIHZhciBPICAgICAgID0gdG9PYmplY3QoYXJyYXlMaWtlKVxuICAgICAgLCBDICAgICAgID0gdHlwZW9mIHRoaXMgPT0gJ2Z1bmN0aW9uJyA/IHRoaXMgOiBBcnJheVxuICAgICAgLCBhTGVuICAgID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgLCBtYXBmbiAgID0gYUxlbiA+IDEgPyBhcmd1bWVudHNbMV0gOiB1bmRlZmluZWRcbiAgICAgICwgbWFwcGluZyA9IG1hcGZuICE9PSB1bmRlZmluZWRcbiAgICAgICwgaW5kZXggICA9IDBcbiAgICAgICwgaXRlckZuICA9IGdldEl0ZXJGbihPKVxuICAgICAgLCBsZW5ndGgsIHJlc3VsdCwgc3RlcCwgaXRlcmF0b3I7XG4gICAgaWYobWFwcGluZyltYXBmbiA9IGN0eChtYXBmbiwgYUxlbiA+IDIgPyBhcmd1bWVudHNbMl0gOiB1bmRlZmluZWQsIDIpO1xuICAgIC8vIGlmIG9iamVjdCBpc24ndCBpdGVyYWJsZSBvciBpdCdzIGFycmF5IHdpdGggZGVmYXVsdCBpdGVyYXRvciAtIHVzZSBzaW1wbGUgY2FzZVxuICAgIGlmKGl0ZXJGbiAhPSB1bmRlZmluZWQgJiYgIShDID09IEFycmF5ICYmIGlzQXJyYXlJdGVyKGl0ZXJGbikpKXtcbiAgICAgIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKE8pLCByZXN1bHQgPSBuZXcgQzsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyBpbmRleCsrKXtcbiAgICAgICAgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBpbmRleCwgbWFwcGluZyA/IGNhbGwoaXRlcmF0b3IsIG1hcGZuLCBbc3RlcC52YWx1ZSwgaW5kZXhdLCB0cnVlKSA6IHN0ZXAudmFsdWUpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgICBmb3IocmVzdWx0ID0gbmV3IEMobGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgICAgICBjcmVhdGVQcm9wZXJ0eShyZXN1bHQsIGluZGV4LCBtYXBwaW5nID8gbWFwZm4oT1tpbmRleF0sIGluZGV4KSA6IE9baW5kZXhdKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmVzdWx0Lmxlbmd0aCA9IGluZGV4O1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGFkZFRvVW5zY29wYWJsZXMgPSByZXF1aXJlKCcuL19hZGQtdG8tdW5zY29wYWJsZXMnKVxuICAsIHN0ZXAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyLXN0ZXAnKVxuICAsIEl0ZXJhdG9ycyAgICAgICAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIHRvSU9iamVjdCAgICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0Jyk7XG5cbi8vIDIyLjEuMy40IEFycmF5LnByb3RvdHlwZS5lbnRyaWVzKClcbi8vIDIyLjEuMy4xMyBBcnJheS5wcm90b3R5cGUua2V5cygpXG4vLyAyMi4xLjMuMjkgQXJyYXkucHJvdG90eXBlLnZhbHVlcygpXG4vLyAyMi4xLjMuMzAgQXJyYXkucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9faXRlci1kZWZpbmUnKShBcnJheSwgJ0FycmF5JywgZnVuY3Rpb24oaXRlcmF0ZWQsIGtpbmQpe1xuICB0aGlzLl90ID0gdG9JT2JqZWN0KGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4gIHRoaXMuX2sgPSBraW5kOyAgICAgICAgICAgICAgICAvLyBraW5kXG4vLyAyMi4xLjUuMi4xICVBcnJheUl0ZXJhdG9yUHJvdG90eXBlJS5uZXh0KClcbn0sIGZ1bmN0aW9uKCl7XG4gIHZhciBPICAgICA9IHRoaXMuX3RcbiAgICAsIGtpbmQgID0gdGhpcy5fa1xuICAgICwgaW5kZXggPSB0aGlzLl9pKys7XG4gIGlmKCFPIHx8IGluZGV4ID49IE8ubGVuZ3RoKXtcbiAgICB0aGlzLl90ID0gdW5kZWZpbmVkO1xuICAgIHJldHVybiBzdGVwKDEpO1xuICB9XG4gIGlmKGtpbmQgPT0gJ2tleXMnICApcmV0dXJuIHN0ZXAoMCwgaW5kZXgpO1xuICBpZihraW5kID09ICd2YWx1ZXMnKXJldHVybiBzdGVwKDAsIE9baW5kZXhdKTtcbiAgcmV0dXJuIHN0ZXAoMCwgW2luZGV4LCBPW2luZGV4XV0pO1xufSwgJ3ZhbHVlcycpO1xuXG4vLyBhcmd1bWVudHNMaXN0W0BAaXRlcmF0b3JdIGlzICVBcnJheVByb3RvX3ZhbHVlcyUgKDkuNC40LjYsIDkuNC40LjcpXG5JdGVyYXRvcnMuQXJndW1lbnRzID0gSXRlcmF0b3JzLkFycmF5O1xuXG5hZGRUb1Vuc2NvcGFibGVzKCdrZXlzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCd2YWx1ZXMnKTtcbmFkZFRvVW5zY29wYWJsZXMoJ2VudHJpZXMnKTsiLCIvLyAxOS4xLjMuMSBPYmplY3QuYXNzaWduKHRhcmdldCwgc291cmNlKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYsICdPYmplY3QnLCB7YXNzaWduOiByZXF1aXJlKCcuL19vYmplY3QtYXNzaWduJyl9KTsiLCJ2YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXHJcbi8vIDE5LjEuMi4yIC8gMTUuMi4zLjUgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxyXG4kZXhwb3J0KCRleHBvcnQuUywgJ09iamVjdCcsIHtjcmVhdGU6IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKX0pOyIsInZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XHJcbi8vIDE5LjEuMi40IC8gMTUuMi4zLjYgT2JqZWN0LmRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpXHJcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIXJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJyksICdPYmplY3QnLCB7ZGVmaW5lUHJvcGVydHk6IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpLmZ9KTsiLCIvLyAxOS4xLjIuNiBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApXG52YXIgdG9JT2JqZWN0ICAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wZCcpLmY7XG5cbnJlcXVpcmUoJy4vX29iamVjdC1zYXAnKSgnZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgICByZXR1cm4gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0b0lPYmplY3QoaXQpLCBrZXkpO1xuICB9O1xufSk7IiwiLy8gMTkuMS4yLjkgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXG52YXIgdG9PYmplY3QgICAgICAgID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCAkZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJyk7XG5cbnJlcXVpcmUoJy4vX29iamVjdC1zYXAnKSgnZ2V0UHJvdG90eXBlT2YnLCBmdW5jdGlvbigpe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0UHJvdG90eXBlT2YoaXQpe1xuICAgIHJldHVybiAkZ2V0UHJvdG90eXBlT2YodG9PYmplY3QoaXQpKTtcbiAgfTtcbn0pOyIsIi8vIDE5LjEuMy4xOSBPYmplY3Quc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7c2V0UHJvdG90eXBlT2Y6IHJlcXVpcmUoJy4vX3NldC1wcm90bycpLnNldH0pOyIsIiIsIid1c2Ugc3RyaWN0JztcbnZhciBMSUJSQVJZICAgICAgICAgICAgPSByZXF1aXJlKCcuL19saWJyYXJ5JylcbiAgLCBnbG9iYWwgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGN0eCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgY2xhc3NvZiAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY2xhc3NvZicpXG4gICwgJGV4cG9ydCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCBpc09iamVjdCAgICAgICAgICAgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKVxuICAsIGFuT2JqZWN0ICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgYUZ1bmN0aW9uICAgICAgICAgID0gcmVxdWlyZSgnLi9fYS1mdW5jdGlvbicpXG4gICwgYW5JbnN0YW5jZSAgICAgICAgID0gcmVxdWlyZSgnLi9fYW4taW5zdGFuY2UnKVxuICAsIGZvck9mICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2Zvci1vZicpXG4gICwgc2V0UHJvdG8gICAgICAgICAgID0gcmVxdWlyZSgnLi9fc2V0LXByb3RvJykuc2V0XG4gICwgc3BlY2llc0NvbnN0cnVjdG9yID0gcmVxdWlyZSgnLi9fc3BlY2llcy1jb25zdHJ1Y3RvcicpXG4gICwgdGFzayAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fdGFzaycpLnNldFxuICAsIG1pY3JvdGFzayAgICAgICAgICA9IHJlcXVpcmUoJy4vX21pY3JvdGFzaycpXG4gICwgUFJPTUlTRSAgICAgICAgICAgID0gJ1Byb21pc2UnXG4gICwgVHlwZUVycm9yICAgICAgICAgID0gZ2xvYmFsLlR5cGVFcnJvclxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgJFByb21pc2UgICAgICAgICAgID0gZ2xvYmFsW1BST01JU0VdXG4gICwgcHJvY2VzcyAgICAgICAgICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBpc05vZGUgICAgICAgICAgICAgPSBjbGFzc29mKHByb2Nlc3MpID09ICdwcm9jZXNzJ1xuICAsIGVtcHR5ICAgICAgICAgICAgICA9IGZ1bmN0aW9uKCl7IC8qIGVtcHR5ICovIH1cbiAgLCBJbnRlcm5hbCwgR2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5LCBXcmFwcGVyO1xuXG52YXIgVVNFX05BVElWRSA9ICEhZnVuY3Rpb24oKXtcbiAgdHJ5IHtcbiAgICAvLyBjb3JyZWN0IHN1YmNsYXNzaW5nIHdpdGggQEBzcGVjaWVzIHN1cHBvcnRcbiAgICB2YXIgcHJvbWlzZSAgICAgPSAkUHJvbWlzZS5yZXNvbHZlKDEpXG4gICAgICAsIEZha2VQcm9taXNlID0gKHByb21pc2UuY29uc3RydWN0b3IgPSB7fSlbcmVxdWlyZSgnLi9fd2tzJykoJ3NwZWNpZXMnKV0gPSBmdW5jdGlvbihleGVjKXsgZXhlYyhlbXB0eSwgZW1wdHkpOyB9O1xuICAgIC8vIHVuaGFuZGxlZCByZWplY3Rpb25zIHRyYWNraW5nIHN1cHBvcnQsIE5vZGVKUyBQcm9taXNlIHdpdGhvdXQgaXQgZmFpbHMgQEBzcGVjaWVzIHRlc3RcbiAgICByZXR1cm4gKGlzTm9kZSB8fCB0eXBlb2YgUHJvbWlzZVJlamVjdGlvbkV2ZW50ID09ICdmdW5jdGlvbicpICYmIHByb21pc2UudGhlbihlbXB0eSkgaW5zdGFuY2VvZiBGYWtlUHJvbWlzZTtcbiAgfSBjYXRjaChlKXsgLyogZW1wdHkgKi8gfVxufSgpO1xuXG4vLyBoZWxwZXJzXG52YXIgc2FtZUNvbnN0cnVjdG9yID0gZnVuY3Rpb24oYSwgYil7XG4gIC8vIHdpdGggbGlicmFyeSB3cmFwcGVyIHNwZWNpYWwgY2FzZVxuICByZXR1cm4gYSA9PT0gYiB8fCBhID09PSAkUHJvbWlzZSAmJiBiID09PSBXcmFwcGVyO1xufTtcbnZhciBpc1RoZW5hYmxlID0gZnVuY3Rpb24oaXQpe1xuICB2YXIgdGhlbjtcbiAgcmV0dXJuIGlzT2JqZWN0KGl0KSAmJiB0eXBlb2YgKHRoZW4gPSBpdC50aGVuKSA9PSAnZnVuY3Rpb24nID8gdGhlbiA6IGZhbHNlO1xufTtcbnZhciBuZXdQcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uKEMpe1xuICByZXR1cm4gc2FtZUNvbnN0cnVjdG9yKCRQcm9taXNlLCBDKVxuICAgID8gbmV3IFByb21pc2VDYXBhYmlsaXR5KEMpXG4gICAgOiBuZXcgR2VuZXJpY1Byb21pc2VDYXBhYmlsaXR5KEMpO1xufTtcbnZhciBQcm9taXNlQ2FwYWJpbGl0eSA9IEdlbmVyaWNQcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uKEMpe1xuICB2YXIgcmVzb2x2ZSwgcmVqZWN0O1xuICB0aGlzLnByb21pc2UgPSBuZXcgQyhmdW5jdGlvbigkJHJlc29sdmUsICQkcmVqZWN0KXtcbiAgICBpZihyZXNvbHZlICE9PSB1bmRlZmluZWQgfHwgcmVqZWN0ICE9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKCdCYWQgUHJvbWlzZSBjb25zdHJ1Y3RvcicpO1xuICAgIHJlc29sdmUgPSAkJHJlc29sdmU7XG4gICAgcmVqZWN0ICA9ICQkcmVqZWN0O1xuICB9KTtcbiAgdGhpcy5yZXNvbHZlID0gYUZ1bmN0aW9uKHJlc29sdmUpO1xuICB0aGlzLnJlamVjdCAgPSBhRnVuY3Rpb24ocmVqZWN0KTtcbn07XG52YXIgcGVyZm9ybSA9IGZ1bmN0aW9uKGV4ZWMpe1xuICB0cnkge1xuICAgIGV4ZWMoKTtcbiAgfSBjYXRjaChlKXtcbiAgICByZXR1cm4ge2Vycm9yOiBlfTtcbiAgfVxufTtcbnZhciBub3RpZnkgPSBmdW5jdGlvbihwcm9taXNlLCBpc1JlamVjdCl7XG4gIGlmKHByb21pc2UuX24pcmV0dXJuO1xuICBwcm9taXNlLl9uID0gdHJ1ZTtcbiAgdmFyIGNoYWluID0gcHJvbWlzZS5fYztcbiAgbWljcm90YXNrKGZ1bmN0aW9uKCl7XG4gICAgdmFyIHZhbHVlID0gcHJvbWlzZS5fdlxuICAgICAgLCBvayAgICA9IHByb21pc2UuX3MgPT0gMVxuICAgICAgLCBpICAgICA9IDA7XG4gICAgdmFyIHJ1biA9IGZ1bmN0aW9uKHJlYWN0aW9uKXtcbiAgICAgIHZhciBoYW5kbGVyID0gb2sgPyByZWFjdGlvbi5vayA6IHJlYWN0aW9uLmZhaWxcbiAgICAgICAgLCByZXNvbHZlID0gcmVhY3Rpb24ucmVzb2x2ZVxuICAgICAgICAsIHJlamVjdCAgPSByZWFjdGlvbi5yZWplY3RcbiAgICAgICAgLCBkb21haW4gID0gcmVhY3Rpb24uZG9tYWluXG4gICAgICAgICwgcmVzdWx0LCB0aGVuO1xuICAgICAgdHJ5IHtcbiAgICAgICAgaWYoaGFuZGxlcil7XG4gICAgICAgICAgaWYoIW9rKXtcbiAgICAgICAgICAgIGlmKHByb21pc2UuX2ggPT0gMilvbkhhbmRsZVVuaGFuZGxlZChwcm9taXNlKTtcbiAgICAgICAgICAgIHByb21pc2UuX2ggPSAxO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZihoYW5kbGVyID09PSB0cnVlKXJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYoZG9tYWluKWRvbWFpbi5lbnRlcigpO1xuICAgICAgICAgICAgcmVzdWx0ID0gaGFuZGxlcih2YWx1ZSk7XG4gICAgICAgICAgICBpZihkb21haW4pZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYocmVzdWx0ID09PSByZWFjdGlvbi5wcm9taXNlKXtcbiAgICAgICAgICAgIHJlamVjdChUeXBlRXJyb3IoJ1Byb21pc2UtY2hhaW4gY3ljbGUnKSk7XG4gICAgICAgICAgfSBlbHNlIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHJlc3VsdCkpe1xuICAgICAgICAgICAgdGhlbi5jYWxsKHJlc3VsdCwgcmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgICAgICB9IGVsc2UgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICB9IGVsc2UgcmVqZWN0KHZhbHVlKTtcbiAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHJlamVjdChlKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHdoaWxlKGNoYWluLmxlbmd0aCA+IGkpcnVuKGNoYWluW2krK10pOyAvLyB2YXJpYWJsZSBsZW5ndGggLSBjYW4ndCB1c2UgZm9yRWFjaFxuICAgIHByb21pc2UuX2MgPSBbXTtcbiAgICBwcm9taXNlLl9uID0gZmFsc2U7XG4gICAgaWYoaXNSZWplY3QgJiYgIXByb21pc2UuX2gpb25VbmhhbmRsZWQocHJvbWlzZSk7XG4gIH0pO1xufTtcbnZhciBvblVuaGFuZGxlZCA9IGZ1bmN0aW9uKHByb21pc2Upe1xuICB0YXNrLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpe1xuICAgIHZhciB2YWx1ZSA9IHByb21pc2UuX3ZcbiAgICAgICwgYWJydXB0LCBoYW5kbGVyLCBjb25zb2xlO1xuICAgIGlmKGlzVW5oYW5kbGVkKHByb21pc2UpKXtcbiAgICAgIGFicnVwdCA9IHBlcmZvcm0oZnVuY3Rpb24oKXtcbiAgICAgICAgaWYoaXNOb2RlKXtcbiAgICAgICAgICBwcm9jZXNzLmVtaXQoJ3VuaGFuZGxlZFJlamVjdGlvbicsIHZhbHVlLCBwcm9taXNlKTtcbiAgICAgICAgfSBlbHNlIGlmKGhhbmRsZXIgPSBnbG9iYWwub251bmhhbmRsZWRyZWplY3Rpb24pe1xuICAgICAgICAgIGhhbmRsZXIoe3Byb21pc2U6IHByb21pc2UsIHJlYXNvbjogdmFsdWV9KTtcbiAgICAgICAgfSBlbHNlIGlmKChjb25zb2xlID0gZ2xvYmFsLmNvbnNvbGUpICYmIGNvbnNvbGUuZXJyb3Ipe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBwcm9taXNlIHJlamVjdGlvbicsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBCcm93c2VycyBzaG91bGQgbm90IHRyaWdnZXIgYHJlamVjdGlvbkhhbmRsZWRgIGV2ZW50IGlmIGl0IHdhcyBoYW5kbGVkIGhlcmUsIE5vZGVKUyAtIHNob3VsZFxuICAgICAgcHJvbWlzZS5faCA9IGlzTm9kZSB8fCBpc1VuaGFuZGxlZChwcm9taXNlKSA/IDIgOiAxO1xuICAgIH0gcHJvbWlzZS5fYSA9IHVuZGVmaW5lZDtcbiAgICBpZihhYnJ1cHQpdGhyb3cgYWJydXB0LmVycm9yO1xuICB9KTtcbn07XG52YXIgaXNVbmhhbmRsZWQgPSBmdW5jdGlvbihwcm9taXNlKXtcbiAgaWYocHJvbWlzZS5faCA9PSAxKXJldHVybiBmYWxzZTtcbiAgdmFyIGNoYWluID0gcHJvbWlzZS5fYSB8fCBwcm9taXNlLl9jXG4gICAgLCBpICAgICA9IDBcbiAgICAsIHJlYWN0aW9uO1xuICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXtcbiAgICByZWFjdGlvbiA9IGNoYWluW2krK107XG4gICAgaWYocmVhY3Rpb24uZmFpbCB8fCAhaXNVbmhhbmRsZWQocmVhY3Rpb24ucHJvbWlzZSkpcmV0dXJuIGZhbHNlO1xuICB9IHJldHVybiB0cnVlO1xufTtcbnZhciBvbkhhbmRsZVVuaGFuZGxlZCA9IGZ1bmN0aW9uKHByb21pc2Upe1xuICB0YXNrLmNhbGwoZ2xvYmFsLCBmdW5jdGlvbigpe1xuICAgIHZhciBoYW5kbGVyO1xuICAgIGlmKGlzTm9kZSl7XG4gICAgICBwcm9jZXNzLmVtaXQoJ3JlamVjdGlvbkhhbmRsZWQnLCBwcm9taXNlKTtcbiAgICB9IGVsc2UgaWYoaGFuZGxlciA9IGdsb2JhbC5vbnJlamVjdGlvbmhhbmRsZWQpe1xuICAgICAgaGFuZGxlcih7cHJvbWlzZTogcHJvbWlzZSwgcmVhc29uOiBwcm9taXNlLl92fSk7XG4gICAgfVxuICB9KTtcbn07XG52YXIgJHJlamVjdCA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdmFyIHByb21pc2UgPSB0aGlzO1xuICBpZihwcm9taXNlLl9kKXJldHVybjtcbiAgcHJvbWlzZS5fZCA9IHRydWU7XG4gIHByb21pc2UgPSBwcm9taXNlLl93IHx8IHByb21pc2U7IC8vIHVud3JhcFxuICBwcm9taXNlLl92ID0gdmFsdWU7XG4gIHByb21pc2UuX3MgPSAyO1xuICBpZighcHJvbWlzZS5fYSlwcm9taXNlLl9hID0gcHJvbWlzZS5fYy5zbGljZSgpO1xuICBub3RpZnkocHJvbWlzZSwgdHJ1ZSk7XG59O1xudmFyICRyZXNvbHZlID0gZnVuY3Rpb24odmFsdWUpe1xuICB2YXIgcHJvbWlzZSA9IHRoaXNcbiAgICAsIHRoZW47XG4gIGlmKHByb21pc2UuX2QpcmV0dXJuO1xuICBwcm9taXNlLl9kID0gdHJ1ZTtcbiAgcHJvbWlzZSA9IHByb21pc2UuX3cgfHwgcHJvbWlzZTsgLy8gdW53cmFwXG4gIHRyeSB7XG4gICAgaWYocHJvbWlzZSA9PT0gdmFsdWUpdGhyb3cgVHlwZUVycm9yKFwiUHJvbWlzZSBjYW4ndCBiZSByZXNvbHZlZCBpdHNlbGZcIik7XG4gICAgaWYodGhlbiA9IGlzVGhlbmFibGUodmFsdWUpKXtcbiAgICAgIG1pY3JvdGFzayhmdW5jdGlvbigpe1xuICAgICAgICB2YXIgd3JhcHBlciA9IHtfdzogcHJvbWlzZSwgX2Q6IGZhbHNlfTsgLy8gd3JhcFxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoZW4uY2FsbCh2YWx1ZSwgY3R4KCRyZXNvbHZlLCB3cmFwcGVyLCAxKSwgY3R4KCRyZWplY3QsIHdyYXBwZXIsIDEpKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAkcmVqZWN0LmNhbGwod3JhcHBlciwgZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcm9taXNlLl92ID0gdmFsdWU7XG4gICAgICBwcm9taXNlLl9zID0gMTtcbiAgICAgIG5vdGlmeShwcm9taXNlLCBmYWxzZSk7XG4gICAgfVxuICB9IGNhdGNoKGUpe1xuICAgICRyZWplY3QuY2FsbCh7X3c6IHByb21pc2UsIF9kOiBmYWxzZX0sIGUpOyAvLyB3cmFwXG4gIH1cbn07XG5cbi8vIGNvbnN0cnVjdG9yIHBvbHlmaWxsXG5pZighVVNFX05BVElWRSl7XG4gIC8vIDI1LjQuMy4xIFByb21pc2UoZXhlY3V0b3IpXG4gICRQcm9taXNlID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcil7XG4gICAgYW5JbnN0YW5jZSh0aGlzLCAkUHJvbWlzZSwgUFJPTUlTRSwgJ19oJyk7XG4gICAgYUZ1bmN0aW9uKGV4ZWN1dG9yKTtcbiAgICBJbnRlcm5hbC5jYWxsKHRoaXMpO1xuICAgIHRyeSB7XG4gICAgICBleGVjdXRvcihjdHgoJHJlc29sdmUsIHRoaXMsIDEpLCBjdHgoJHJlamVjdCwgdGhpcywgMSkpO1xuICAgIH0gY2F0Y2goZXJyKXtcbiAgICAgICRyZWplY3QuY2FsbCh0aGlzLCBlcnIpO1xuICAgIH1cbiAgfTtcbiAgSW50ZXJuYWwgPSBmdW5jdGlvbiBQcm9taXNlKGV4ZWN1dG9yKXtcbiAgICB0aGlzLl9jID0gW107ICAgICAgICAgICAgIC8vIDwtIGF3YWl0aW5nIHJlYWN0aW9uc1xuICAgIHRoaXMuX2EgPSB1bmRlZmluZWQ7ICAgICAgLy8gPC0gY2hlY2tlZCBpbiBpc1VuaGFuZGxlZCByZWFjdGlvbnNcbiAgICB0aGlzLl9zID0gMDsgICAgICAgICAgICAgIC8vIDwtIHN0YXRlXG4gICAgdGhpcy5fZCA9IGZhbHNlOyAgICAgICAgICAvLyA8LSBkb25lXG4gICAgdGhpcy5fdiA9IHVuZGVmaW5lZDsgICAgICAvLyA8LSB2YWx1ZVxuICAgIHRoaXMuX2ggPSAwOyAgICAgICAgICAgICAgLy8gPC0gcmVqZWN0aW9uIHN0YXRlLCAwIC0gZGVmYXVsdCwgMSAtIGhhbmRsZWQsIDIgLSB1bmhhbmRsZWRcbiAgICB0aGlzLl9uID0gZmFsc2U7ICAgICAgICAgIC8vIDwtIG5vdGlmeVxuICB9O1xuICBJbnRlcm5hbC5wcm90b3R5cGUgPSByZXF1aXJlKCcuL19yZWRlZmluZS1hbGwnKSgkUHJvbWlzZS5wcm90b3R5cGUsIHtcbiAgICAvLyAyNS40LjUuMyBQcm9taXNlLnByb3RvdHlwZS50aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKVxuICAgIHRoZW46IGZ1bmN0aW9uIHRoZW4ob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpe1xuICAgICAgdmFyIHJlYWN0aW9uICAgID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoc3BlY2llc0NvbnN0cnVjdG9yKHRoaXMsICRQcm9taXNlKSk7XG4gICAgICByZWFjdGlvbi5vayAgICAgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT0gJ2Z1bmN0aW9uJyA/IG9uRnVsZmlsbGVkIDogdHJ1ZTtcbiAgICAgIHJlYWN0aW9uLmZhaWwgICA9IHR5cGVvZiBvblJlamVjdGVkID09ICdmdW5jdGlvbicgJiYgb25SZWplY3RlZDtcbiAgICAgIHJlYWN0aW9uLmRvbWFpbiA9IGlzTm9kZSA/IHByb2Nlc3MuZG9tYWluIDogdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fYy5wdXNoKHJlYWN0aW9uKTtcbiAgICAgIGlmKHRoaXMuX2EpdGhpcy5fYS5wdXNoKHJlYWN0aW9uKTtcbiAgICAgIGlmKHRoaXMuX3Mpbm90aWZ5KHRoaXMsIGZhbHNlKTtcbiAgICAgIHJldHVybiByZWFjdGlvbi5wcm9taXNlO1xuICAgIH0sXG4gICAgLy8gMjUuNC41LjEgUHJvbWlzZS5wcm90b3R5cGUuY2F0Y2gob25SZWplY3RlZClcbiAgICAnY2F0Y2gnOiBmdW5jdGlvbihvblJlamVjdGVkKXtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4odW5kZWZpbmVkLCBvblJlamVjdGVkKTtcbiAgICB9XG4gIH0pO1xuICBQcm9taXNlQ2FwYWJpbGl0eSA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIHByb21pc2UgID0gbmV3IEludGVybmFsO1xuICAgIHRoaXMucHJvbWlzZSA9IHByb21pc2U7XG4gICAgdGhpcy5yZXNvbHZlID0gY3R4KCRyZXNvbHZlLCBwcm9taXNlLCAxKTtcbiAgICB0aGlzLnJlamVjdCAgPSBjdHgoJHJlamVjdCwgcHJvbWlzZSwgMSk7XG4gIH07XG59XG5cbiRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsIHtQcm9taXNlOiAkUHJvbWlzZX0pO1xucmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKSgkUHJvbWlzZSwgUFJPTUlTRSk7XG5yZXF1aXJlKCcuL19zZXQtc3BlY2llcycpKFBST01JU0UpO1xuV3JhcHBlciA9IHJlcXVpcmUoJy4vX2NvcmUnKVtQUk9NSVNFXTtcblxuLy8gc3RhdGljc1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNSBQcm9taXNlLnJlamVjdChyKVxuICByZWplY3Q6IGZ1bmN0aW9uIHJlamVjdChyKXtcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHRoaXMpXG4gICAgICAsICQkcmVqZWN0ICAgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICAkJHJlamVjdChyKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTtcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKExJQlJBUlkgfHwgIVVTRV9OQVRJVkUpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC42IFByb21pc2UucmVzb2x2ZSh4KVxuICByZXNvbHZlOiBmdW5jdGlvbiByZXNvbHZlKHgpe1xuICAgIC8vIGluc3RhbmNlb2YgaW5zdGVhZCBvZiBpbnRlcm5hbCBzbG90IGNoZWNrIGJlY2F1c2Ugd2Ugc2hvdWxkIGZpeCBpdCB3aXRob3V0IHJlcGxhY2VtZW50IG5hdGl2ZSBQcm9taXNlIGNvcmVcbiAgICBpZih4IGluc3RhbmNlb2YgJFByb21pc2UgJiYgc2FtZUNvbnN0cnVjdG9yKHguY29uc3RydWN0b3IsIHRoaXMpKXJldHVybiB4O1xuICAgIHZhciBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkodGhpcylcbiAgICAgICwgJCRyZXNvbHZlICA9IGNhcGFiaWxpdHkucmVzb2x2ZTtcbiAgICAkJHJlc29sdmUoeCk7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICEoVVNFX05BVElWRSAmJiByZXF1aXJlKCcuL19pdGVyLWRldGVjdCcpKGZ1bmN0aW9uKGl0ZXIpe1xuICAkUHJvbWlzZS5hbGwoaXRlcilbJ2NhdGNoJ10oZW1wdHkpO1xufSkpLCBQUk9NSVNFLCB7XG4gIC8vIDI1LjQuNC4xIFByb21pc2UuYWxsKGl0ZXJhYmxlKVxuICBhbGw6IGZ1bmN0aW9uIGFsbChpdGVyYWJsZSl7XG4gICAgdmFyIEMgICAgICAgICAgPSB0aGlzXG4gICAgICAsIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShDKVxuICAgICAgLCByZXNvbHZlICAgID0gY2FwYWJpbGl0eS5yZXNvbHZlXG4gICAgICAsIHJlamVjdCAgICAgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgYWJydXB0ID0gcGVyZm9ybShmdW5jdGlvbigpe1xuICAgICAgdmFyIHZhbHVlcyAgICA9IFtdXG4gICAgICAgICwgaW5kZXggICAgID0gMFxuICAgICAgICAsIHJlbWFpbmluZyA9IDE7XG4gICAgICBmb3JPZihpdGVyYWJsZSwgZmFsc2UsIGZ1bmN0aW9uKHByb21pc2Upe1xuICAgICAgICB2YXIgJGluZGV4ICAgICAgICA9IGluZGV4KytcbiAgICAgICAgICAsIGFscmVhZHlDYWxsZWQgPSBmYWxzZTtcbiAgICAgICAgdmFsdWVzLnB1c2godW5kZWZpbmVkKTtcbiAgICAgICAgcmVtYWluaW5nKys7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgICAgICBpZihhbHJlYWR5Q2FsbGVkKXJldHVybjtcbiAgICAgICAgICBhbHJlYWR5Q2FsbGVkICA9IHRydWU7XG4gICAgICAgICAgdmFsdWVzWyRpbmRleF0gPSB2YWx1ZTtcbiAgICAgICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgICB9KTtcbiAgICAgIC0tcmVtYWluaW5nIHx8IHJlc29sdmUodmFsdWVzKTtcbiAgICB9KTtcbiAgICBpZihhYnJ1cHQpcmVqZWN0KGFicnVwdC5lcnJvcik7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfSxcbiAgLy8gMjUuNC40LjQgUHJvbWlzZS5yYWNlKGl0ZXJhYmxlKVxuICByYWNlOiBmdW5jdGlvbiByYWNlKGl0ZXJhYmxlKXtcbiAgICB2YXIgQyAgICAgICAgICA9IHRoaXNcbiAgICAgICwgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KEMpXG4gICAgICAsIHJlamVjdCAgICAgPSBjYXBhYmlsaXR5LnJlamVjdDtcbiAgICB2YXIgYWJydXB0ID0gcGVyZm9ybShmdW5jdGlvbigpe1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcbiAgICAgICAgQy5yZXNvbHZlKHByb21pc2UpLnRoZW4oY2FwYWJpbGl0eS5yZXNvbHZlLCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgaWYoYWJydXB0KXJlamVjdChhYnJ1cHQuZXJyb3IpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pOyIsIid1c2Ugc3RyaWN0JztcbnZhciAkYXQgID0gcmVxdWlyZSgnLi9fc3RyaW5nLWF0JykodHJ1ZSk7XG5cbi8vIDIxLjEuMy4yNyBTdHJpbmcucHJvdG90eXBlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoU3RyaW5nLCAnU3RyaW5nJywgZnVuY3Rpb24oaXRlcmF0ZWQpe1xuICB0aGlzLl90ID0gU3RyaW5nKGl0ZXJhdGVkKTsgLy8gdGFyZ2V0XG4gIHRoaXMuX2kgPSAwOyAgICAgICAgICAgICAgICAvLyBuZXh0IGluZGV4XG4vLyAyMS4xLjUuMi4xICVTdHJpbmdJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBpbmRleCA9IHRoaXMuX2lcbiAgICAsIHBvaW50O1xuICBpZihpbmRleCA+PSBPLmxlbmd0aClyZXR1cm4ge3ZhbHVlOiB1bmRlZmluZWQsIGRvbmU6IHRydWV9O1xuICBwb2ludCA9ICRhdChPLCBpbmRleCk7XG4gIHRoaXMuX2kgKz0gcG9pbnQubGVuZ3RoO1xuICByZXR1cm4ge3ZhbHVlOiBwb2ludCwgZG9uZTogZmFsc2V9O1xufSk7IiwiJ3VzZSBzdHJpY3QnO1xuLy8gRUNNQVNjcmlwdCA2IHN5bWJvbHMgc2hpbVxudmFyIGdsb2JhbCAgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBERVNDUklQVE9SUyAgICA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJylcbiAgLCAkZXhwb3J0ICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgcmVkZWZpbmUgICAgICAgPSByZXF1aXJlKCcuL19yZWRlZmluZScpXG4gICwgTUVUQSAgICAgICAgICAgPSByZXF1aXJlKCcuL19tZXRhJykuS0VZXG4gICwgJGZhaWxzICAgICAgICAgPSByZXF1aXJlKCcuL19mYWlscycpXG4gICwgc2hhcmVkICAgICAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQnKVxuICAsIHNldFRvU3RyaW5nVGFnID0gcmVxdWlyZSgnLi9fc2V0LXRvLXN0cmluZy10YWcnKVxuICAsIHVpZCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJylcbiAgLCB3a3MgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3drcycpXG4gICwga2V5T2YgICAgICAgICAgPSByZXF1aXJlKCcuL19rZXlvZicpXG4gICwgZW51bUtleXMgICAgICAgPSByZXF1aXJlKCcuL19lbnVtLWtleXMnKVxuICAsIGlzQXJyYXkgICAgICAgID0gcmVxdWlyZSgnLi9faXMtYXJyYXknKVxuICAsIGFuT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCB0b0lPYmplY3QgICAgICA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKVxuICAsIHRvUHJpbWl0aXZlICAgID0gcmVxdWlyZSgnLi9fdG8tcHJpbWl0aXZlJylcbiAgLCBjcmVhdGVEZXNjICAgICA9IHJlcXVpcmUoJy4vX3Byb3BlcnR5LWRlc2MnKVxuICAsIF9jcmVhdGUgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWNyZWF0ZScpXG4gICwgZ09QTkV4dCAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZ29wbi1leHQnKVxuICAsICRHT1BEICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKVxuICAsICREUCAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBnT1BEICAgICAgICAgICA9ICRHT1BELmZcbiAgLCBkUCAgICAgICAgICAgICA9ICREUC5mXG4gICwgZ09QTiAgICAgICAgICAgPSBnT1BORXh0LmZcbiAgLCAkU3ltYm9sICAgICAgICA9IGdsb2JhbC5TeW1ib2xcbiAgLCAkSlNPTiAgICAgICAgICA9IGdsb2JhbC5KU09OXG4gICwgX3N0cmluZ2lmeSAgICAgPSAkSlNPTiAmJiAkSlNPTi5zdHJpbmdpZnlcbiAgLCBzZXR0ZXIgICAgICAgICA9IGZhbHNlXG4gICwgUFJPVE9UWVBFICAgICAgPSAncHJvdG90eXBlJ1xuICAsIEhJRERFTiAgICAgICAgID0gd2tzKCdfaGlkZGVuJylcbiAgLCBUT19QUklNSVRJVkUgICA9IHdrcygndG9QcmltaXRpdmUnKVxuICAsIGlzRW51bSAgICAgICAgID0ge30ucHJvcGVydHlJc0VudW1lcmFibGVcbiAgLCBTeW1ib2xSZWdpc3RyeSA9IHNoYXJlZCgnc3ltYm9sLXJlZ2lzdHJ5JylcbiAgLCBBbGxTeW1ib2xzICAgICA9IHNoYXJlZCgnc3ltYm9scycpXG4gICwgT2JqZWN0UHJvdG8gICAgPSBPYmplY3RbUFJPVE9UWVBFXVxuICAsIFVTRV9OQVRJVkUgICAgID0gdHlwZW9mICRTeW1ib2wgPT0gJ2Z1bmN0aW9uJ1xuICAsIFFPYmplY3QgICAgICAgID0gZ2xvYmFsLlFPYmplY3Q7XG5cbi8vIGZhbGxiYWNrIGZvciBvbGQgQW5kcm9pZCwgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTY4N1xudmFyIHNldFN5bWJvbERlc2MgPSBERVNDUklQVE9SUyAmJiAkZmFpbHMoZnVuY3Rpb24oKXtcbiAgcmV0dXJuIF9jcmVhdGUoZFAoe30sICdhJywge1xuICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIGRQKHRoaXMsICdhJywge3ZhbHVlOiA3fSkuYTsgfVxuICB9KSkuYSAhPSA3O1xufSkgPyBmdW5jdGlvbihpdCwga2V5LCBEKXtcbiAgdmFyIHByb3RvRGVzYyA9IGdPUEQoT2JqZWN0UHJvdG8sIGtleSk7XG4gIGlmKHByb3RvRGVzYylkZWxldGUgT2JqZWN0UHJvdG9ba2V5XTtcbiAgZFAoaXQsIGtleSwgRCk7XG4gIGlmKHByb3RvRGVzYyAmJiBpdCAhPT0gT2JqZWN0UHJvdG8pZFAoT2JqZWN0UHJvdG8sIGtleSwgcHJvdG9EZXNjKTtcbn0gOiBkUDtcblxudmFyIHdyYXAgPSBmdW5jdGlvbih0YWcpe1xuICB2YXIgc3ltID0gQWxsU3ltYm9sc1t0YWddID0gX2NyZWF0ZSgkU3ltYm9sW1BST1RPVFlQRV0pO1xuICBzeW0uX2sgPSB0YWc7XG4gIERFU0NSSVBUT1JTICYmIHNldHRlciAmJiBzZXRTeW1ib2xEZXNjKE9iamVjdFByb3RvLCB0YWcsIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICBpZihoYXModGhpcywgSElEREVOKSAmJiBoYXModGhpc1tISURERU5dLCB0YWcpKXRoaXNbSElEREVOXVt0YWddID0gZmFsc2U7XG4gICAgICBzZXRTeW1ib2xEZXNjKHRoaXMsIHRhZywgY3JlYXRlRGVzYygxLCB2YWx1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBzeW07XG59O1xuXG52YXIgaXNTeW1ib2wgPSBVU0VfTkFUSVZFICYmIHR5cGVvZiAkU3ltYm9sLml0ZXJhdG9yID09ICdzeW1ib2wnID8gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnO1xufSA6IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIGl0IGluc3RhbmNlb2YgJFN5bWJvbDtcbn07XG5cbnZhciAkZGVmaW5lUHJvcGVydHkgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBEKXtcbiAgYW5PYmplY3QoaXQpO1xuICBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpO1xuICBhbk9iamVjdChEKTtcbiAgaWYoaGFzKEFsbFN5bWJvbHMsIGtleSkpe1xuICAgIGlmKCFELmVudW1lcmFibGUpe1xuICAgICAgaWYoIWhhcyhpdCwgSElEREVOKSlkUChpdCwgSElEREVOLCBjcmVhdGVEZXNjKDEsIHt9KSk7XG4gICAgICBpdFtISURERU5dW2tleV0gPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZihoYXMoaXQsIEhJRERFTikgJiYgaXRbSElEREVOXVtrZXldKWl0W0hJRERFTl1ba2V5XSA9IGZhbHNlO1xuICAgICAgRCA9IF9jcmVhdGUoRCwge2VudW1lcmFibGU6IGNyZWF0ZURlc2MoMCwgZmFsc2UpfSk7XG4gICAgfSByZXR1cm4gc2V0U3ltYm9sRGVzYyhpdCwga2V5LCBEKTtcbiAgfSByZXR1cm4gZFAoaXQsIGtleSwgRCk7XG59O1xudmFyICRkZWZpbmVQcm9wZXJ0aWVzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhpdCwgUCl7XG4gIGFuT2JqZWN0KGl0KTtcbiAgdmFyIGtleXMgPSBlbnVtS2V5cyhQID0gdG9JT2JqZWN0KFApKVxuICAgICwgaSAgICA9IDBcbiAgICAsIGwgPSBrZXlzLmxlbmd0aFxuICAgICwga2V5O1xuICB3aGlsZShsID4gaSkkZGVmaW5lUHJvcGVydHkoaXQsIGtleSA9IGtleXNbaSsrXSwgUFtrZXldKTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciAkY3JlYXRlID0gZnVuY3Rpb24gY3JlYXRlKGl0LCBQKXtcbiAgcmV0dXJuIFAgPT09IHVuZGVmaW5lZCA/IF9jcmVhdGUoaXQpIDogJGRlZmluZVByb3BlcnRpZXMoX2NyZWF0ZShpdCksIFApO1xufTtcbnZhciAkcHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbiBwcm9wZXJ0eUlzRW51bWVyYWJsZShrZXkpe1xuICB2YXIgRSA9IGlzRW51bS5jYWxsKHRoaXMsIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICByZXR1cm4gRSB8fCAhaGFzKHRoaXMsIGtleSkgfHwgIWhhcyhBbGxTeW1ib2xzLCBrZXkpIHx8IGhhcyh0aGlzLCBISURERU4pICYmIHRoaXNbSElEREVOXVtrZXldID8gRSA6IHRydWU7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gIHZhciBEID0gZ09QRChpdCA9IHRvSU9iamVjdChpdCksIGtleSA9IHRvUHJpbWl0aXZlKGtleSwgdHJ1ZSkpO1xuICBpZihEICYmIGhhcyhBbGxTeW1ib2xzLCBrZXkpICYmICEoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSkpRC5lbnVtZXJhYmxlID0gdHJ1ZTtcbiAgcmV0dXJuIEQ7XG59O1xudmFyICRnZXRPd25Qcm9wZXJ0eU5hbWVzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIHZhciBuYW1lcyAgPSBnT1BOKHRvSU9iamVjdChpdCkpXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgaSAgICAgID0gMFxuICAgICwga2V5O1xuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKCFoYXMoQWxsU3ltYm9scywga2V5ID0gbmFtZXNbaSsrXSkgJiYga2V5ICE9IEhJRERFTiAmJiBrZXkgIT0gTUVUQSlyZXN1bHQucHVzaChrZXkpO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGl0KXtcbiAgdmFyIG5hbWVzICA9IGdPUE4odG9JT2JqZWN0KGl0KSlcbiAgICAsIHJlc3VsdCA9IFtdXG4gICAgLCBpICAgICAgPSAwXG4gICAgLCBrZXk7XG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pKXJlc3VsdC5wdXNoKEFsbFN5bWJvbHNba2V5XSk7XG4gIHJldHVybiByZXN1bHQ7XG59O1xudmFyICRzdHJpbmdpZnkgPSBmdW5jdGlvbiBzdHJpbmdpZnkoaXQpe1xuICBpZihpdCA9PT0gdW5kZWZpbmVkIHx8IGlzU3ltYm9sKGl0KSlyZXR1cm47IC8vIElFOCByZXR1cm5zIHN0cmluZyBvbiB1bmRlZmluZWRcbiAgdmFyIGFyZ3MgPSBbaXRdXG4gICAgLCBpICAgID0gMVxuICAgICwgcmVwbGFjZXIsICRyZXBsYWNlcjtcbiAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgcmVwbGFjZXIgPSBhcmdzWzFdO1xuICBpZih0eXBlb2YgcmVwbGFjZXIgPT0gJ2Z1bmN0aW9uJykkcmVwbGFjZXIgPSByZXBsYWNlcjtcbiAgaWYoJHJlcGxhY2VyIHx8ICFpc0FycmF5KHJlcGxhY2VyKSlyZXBsYWNlciA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpe1xuICAgIGlmKCRyZXBsYWNlcil2YWx1ZSA9ICRyZXBsYWNlci5jYWxsKHRoaXMsIGtleSwgdmFsdWUpO1xuICAgIGlmKCFpc1N5bWJvbCh2YWx1ZSkpcmV0dXJuIHZhbHVlO1xuICB9O1xuICBhcmdzWzFdID0gcmVwbGFjZXI7XG4gIHJldHVybiBfc3RyaW5naWZ5LmFwcGx5KCRKU09OLCBhcmdzKTtcbn07XG52YXIgQlVHR1lfSlNPTiA9ICRmYWlscyhmdW5jdGlvbigpe1xuICB2YXIgUyA9ICRTeW1ib2woKTtcbiAgLy8gTVMgRWRnZSBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMge31cbiAgLy8gV2ViS2l0IGNvbnZlcnRzIHN5bWJvbCB2YWx1ZXMgdG8gSlNPTiBhcyBudWxsXG4gIC8vIFY4IHRocm93cyBvbiBib3hlZCBzeW1ib2xzXG4gIHJldHVybiBfc3RyaW5naWZ5KFtTXSkgIT0gJ1tudWxsXScgfHwgX3N0cmluZ2lmeSh7YTogU30pICE9ICd7fScgfHwgX3N0cmluZ2lmeShPYmplY3QoUykpICE9ICd7fSc7XG59KTtcblxuLy8gMTkuNC4xLjEgU3ltYm9sKFtkZXNjcmlwdGlvbl0pXG5pZighVVNFX05BVElWRSl7XG4gICRTeW1ib2wgPSBmdW5jdGlvbiBTeW1ib2woKXtcbiAgICBpZih0aGlzIGluc3RhbmNlb2YgJFN5bWJvbCl0aHJvdyBUeXBlRXJyb3IoJ1N5bWJvbCBpcyBub3QgYSBjb25zdHJ1Y3RvciEnKTtcbiAgICByZXR1cm4gd3JhcCh1aWQoYXJndW1lbnRzLmxlbmd0aCA+IDAgPyBhcmd1bWVudHNbMF0gOiB1bmRlZmluZWQpKTtcbiAgfTtcbiAgcmVkZWZpbmUoJFN5bWJvbFtQUk9UT1RZUEVdLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpe1xuICAgIHJldHVybiB0aGlzLl9rO1xuICB9KTtcblxuICAkR09QRC5mID0gJGdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgJERQLmYgICA9ICRkZWZpbmVQcm9wZXJ0eTtcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mID0gZ09QTkV4dC5mID0gJGdldE93blByb3BlcnR5TmFtZXM7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1waWUnKS5mICA9ICRwcm9wZXJ0eUlzRW51bWVyYWJsZVxuICByZXF1aXJlKCcuL19vYmplY3QtZ29wcycpLmYgPSAkZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuXG4gIGlmKERFU0NSSVBUT1JTICYmICFyZXF1aXJlKCcuL19saWJyYXJ5Jykpe1xuICAgIHJlZGVmaW5lKE9iamVjdFByb3RvLCAncHJvcGVydHlJc0VudW1lcmFibGUnLCAkcHJvcGVydHlJc0VudW1lcmFibGUsIHRydWUpO1xuICB9XG59XG5cbiRleHBvcnQoJGV4cG9ydC5HICsgJGV4cG9ydC5XICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsIHtTeW1ib2w6ICRTeW1ib2x9KTtcblxuLy8gMTkuNC4yLjIgU3ltYm9sLmhhc0luc3RhbmNlXG4vLyAxOS40LjIuMyBTeW1ib2wuaXNDb25jYXRTcHJlYWRhYmxlXG4vLyAxOS40LjIuNCBTeW1ib2wuaXRlcmF0b3Jcbi8vIDE5LjQuMi42IFN5bWJvbC5tYXRjaFxuLy8gMTkuNC4yLjggU3ltYm9sLnJlcGxhY2Vcbi8vIDE5LjQuMi45IFN5bWJvbC5zZWFyY2hcbi8vIDE5LjQuMi4xMCBTeW1ib2wuc3BlY2llc1xuLy8gMTkuNC4yLjExIFN5bWJvbC5zcGxpdFxuLy8gMTkuNC4yLjEyIFN5bWJvbC50b1ByaW1pdGl2ZVxuLy8gMTkuNC4yLjEzIFN5bWJvbC50b1N0cmluZ1RhZ1xuLy8gMTkuNC4yLjE0IFN5bWJvbC51bnNjb3BhYmxlc1xuZm9yKHZhciBzeW1ib2xzID0gKFxuICAnaGFzSW5zdGFuY2UsaXNDb25jYXRTcHJlYWRhYmxlLGl0ZXJhdG9yLG1hdGNoLHJlcGxhY2Usc2VhcmNoLHNwZWNpZXMsc3BsaXQsdG9QcmltaXRpdmUsdG9TdHJpbmdUYWcsdW5zY29wYWJsZXMnXG4pLnNwbGl0KCcsJyksIGkgPSAwOyBzeW1ib2xzLmxlbmd0aCA+IGk7ICl7XG4gIHZhciBrZXkgICAgID0gc3ltYm9sc1tpKytdXG4gICAgLCBXcmFwcGVyID0gY29yZS5TeW1ib2xcbiAgICAsIHN5bSAgICAgPSB3a3Moa2V5KTtcbiAgaWYoIShrZXkgaW4gV3JhcHBlcikpZFAoV3JhcHBlciwga2V5LCB7dmFsdWU6IFVTRV9OQVRJVkUgPyBzeW0gOiB3cmFwKHN5bSl9KTtcbn07XG5cbi8vIERvbid0IHVzZSBzZXR0ZXJzIGluIFF0IFNjcmlwdCwgaHR0cHM6Ly9naXRodWIuY29tL3psb2lyb2NrL2NvcmUtanMvaXNzdWVzLzE3M1xuaWYoIVFPYmplY3QgfHwgIVFPYmplY3RbUFJPVE9UWVBFXSB8fCAhUU9iamVjdFtQUk9UT1RZUEVdLmZpbmRDaGlsZClzZXR0ZXIgPSB0cnVlO1xuXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCAnU3ltYm9sJywge1xuICAvLyAxOS40LjIuMSBTeW1ib2wuZm9yKGtleSlcbiAgJ2Zvcic6IGZ1bmN0aW9uKGtleSl7XG4gICAgcmV0dXJuIGhhcyhTeW1ib2xSZWdpc3RyeSwga2V5ICs9ICcnKVxuICAgICAgPyBTeW1ib2xSZWdpc3RyeVtrZXldXG4gICAgICA6IFN5bWJvbFJlZ2lzdHJ5W2tleV0gPSAkU3ltYm9sKGtleSk7XG4gIH0sXG4gIC8vIDE5LjQuMi41IFN5bWJvbC5rZXlGb3Ioc3ltKVxuICBrZXlGb3I6IGZ1bmN0aW9uIGtleUZvcihrZXkpe1xuICAgIGlmKGlzU3ltYm9sKGtleSkpcmV0dXJuIGtleU9mKFN5bWJvbFJlZ2lzdHJ5LCBrZXkpO1xuICAgIHRocm93IFR5cGVFcnJvcihrZXkgKyAnIGlzIG5vdCBhIHN5bWJvbCEnKTtcbiAgfSxcbiAgdXNlU2V0dGVyOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSB0cnVlOyB9LFxuICB1c2VTaW1wbGU6IGZ1bmN0aW9uKCl7IHNldHRlciA9IGZhbHNlOyB9XG59KTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ09iamVjdCcsIHtcbiAgLy8gMTkuMS4yLjIgT2JqZWN0LmNyZWF0ZShPIFssIFByb3BlcnRpZXNdKVxuICBjcmVhdGU6ICRjcmVhdGUsXG4gIC8vIDE5LjEuMi40IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxuICBkZWZpbmVQcm9wZXJ0eTogJGRlZmluZVByb3BlcnR5LFxuICAvLyAxOS4xLjIuMyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKVxuICBkZWZpbmVQcm9wZXJ0aWVzOiAkZGVmaW5lUHJvcGVydGllcyxcbiAgLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxuICBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I6ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIC8vIDE5LjEuMi43IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKE8pXG4gIGdldE93blByb3BlcnR5TmFtZXM6ICRnZXRPd25Qcm9wZXJ0eU5hbWVzLFxuICAvLyAxOS4xLjIuOCBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKE8pXG4gIGdldE93blByb3BlcnR5U3ltYm9sczogJGdldE93blByb3BlcnR5U3ltYm9sc1xufSk7XG5cbi8vIDI0LjMuMiBKU09OLnN0cmluZ2lmeSh2YWx1ZSBbLCByZXBsYWNlciBbLCBzcGFjZV1dKVxuJEpTT04gJiYgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAoIVVTRV9OQVRJVkUgfHwgQlVHR1lfSlNPTiksICdKU09OJywge3N0cmluZ2lmeTogJHN0cmluZ2lmeX0pO1xuXG4vLyAxOS40LjMuNCBTeW1ib2wucHJvdG90eXBlW0BAdG9QcmltaXRpdmVdKGhpbnQpXG4kU3ltYm9sW1BST1RPVFlQRV1bVE9fUFJJTUlUSVZFXSB8fCByZXF1aXJlKCcuL19oaWRlJykoJFN5bWJvbFtQUk9UT1RZUEVdLCBUT19QUklNSVRJVkUsICRTeW1ib2xbUFJPVE9UWVBFXS52YWx1ZU9mKTtcbi8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKCRTeW1ib2wsICdTeW1ib2wnKTtcbi8vIDIwLjIuMS45IE1hdGhbQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKE1hdGgsICdNYXRoJywgdHJ1ZSk7XG4vLyAyNC4zLjMgSlNPTltAQHRvU3RyaW5nVGFnXVxuc2V0VG9TdHJpbmdUYWcoZ2xvYmFsLkpTT04sICdKU09OJywgdHJ1ZSk7IiwicmVxdWlyZSgnLi9lczYuYXJyYXkuaXRlcmF0b3InKTtcbnZhciBnbG9iYWwgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBoaWRlICAgICAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgSXRlcmF0b3JzICAgICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgVE9fU1RSSU5HX1RBRyA9IHJlcXVpcmUoJy4vX3drcycpKCd0b1N0cmluZ1RhZycpO1xuXG5mb3IodmFyIGNvbGxlY3Rpb25zID0gWydOb2RlTGlzdCcsICdET01Ub2tlbkxpc3QnLCAnTWVkaWFMaXN0JywgJ1N0eWxlU2hlZXRMaXN0JywgJ0NTU1J1bGVMaXN0J10sIGkgPSAwOyBpIDwgNTsgaSsrKXtcbiAgdmFyIE5BTUUgICAgICAgPSBjb2xsZWN0aW9uc1tpXVxuICAgICwgQ29sbGVjdGlvbiA9IGdsb2JhbFtOQU1FXVxuICAgICwgcHJvdG8gICAgICA9IENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGU7XG4gIGlmKHByb3RvICYmICFwcm90b1tUT19TVFJJTkdfVEFHXSloaWRlKHByb3RvLCBUT19TVFJJTkdfVEFHLCBOQU1FKTtcbiAgSXRlcmF0b3JzW05BTUVdID0gSXRlcmF0b3JzLkFycmF5O1xufSIsIlxuLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovXG5cbnZhciBnbG9iYWwgPSAoZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSgpO1xuXG4vKipcbiAqIFdlYlNvY2tldCBjb25zdHJ1Y3Rvci5cbiAqL1xuXG52YXIgV2ViU29ja2V0ID0gZ2xvYmFsLldlYlNvY2tldCB8fCBnbG9iYWwuTW96V2ViU29ja2V0O1xuXG4vKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gV2ViU29ja2V0ID8gd3MgOiBudWxsO1xuXG4vKipcbiAqIFdlYlNvY2tldCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBUaGUgdGhpcmQgYG9wdHNgIG9wdGlvbnMgb2JqZWN0IGdldHMgaWdub3JlZCBpbiB3ZWIgYnJvd3NlcnMsIHNpbmNlIGl0J3NcbiAqIG5vbi1zdGFuZGFyZCwgYW5kIHRocm93cyBhIFR5cGVFcnJvciBpZiBwYXNzZWQgdG8gdGhlIGNvbnN0cnVjdG9yLlxuICogU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZWluYXJvcy93cy9pc3N1ZXMvMjI3XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHVyaVxuICogQHBhcmFtIHtBcnJheX0gcHJvdG9jb2xzIChvcHRpb25hbClcbiAqIEBwYXJhbSB7T2JqZWN0KSBvcHRzIChvcHRpb25hbClcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gd3ModXJpLCBwcm90b2NvbHMsIG9wdHMpIHtcbiAgdmFyIGluc3RhbmNlO1xuICBpZiAocHJvdG9jb2xzKSB7XG4gICAgaW5zdGFuY2UgPSBuZXcgV2ViU29ja2V0KHVyaSwgcHJvdG9jb2xzKTtcbiAgfSBlbHNlIHtcbiAgICBpbnN0YW5jZSA9IG5ldyBXZWJTb2NrZXQodXJpKTtcbiAgfVxuICByZXR1cm4gaW5zdGFuY2U7XG59XG5cbmlmIChXZWJTb2NrZXQpIHdzLnByb3RvdHlwZSA9IFdlYlNvY2tldC5wcm90b3R5cGU7XG4iXX0=
