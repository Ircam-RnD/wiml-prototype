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
			this.params.column_names = options.column_names.splice(0);
		}

		this.phrase = {};

		this.updatePhrase = function (data) {
			//console.log(data.data);
			_this.phrase = {};
			_this.phrase.bimodal = _this.params.bimodal;
			_this.phrase.dimension = _this.streamParams.frameSize;
			_this.phrase.dimension_input = 0;
			_this.phrase.column_names = _this.params.column_names.splice(0);
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

// get the inverse_covariances matrix of each of the GMM classes

// for each input data, compute the distance of the frame to each of the GMMs
// with the following equations :

// ================================= //
// as in xmmGaussianDistribution.cpp //
// ================================= //

var componentLikelihood = function componentLikelihood(component, observation) {
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

// ================================= //
//    as in xmmGmmSingleClass.cpp    //
// ================================= //

// -> in obsProb, called from likelihood, called from filter, called from GMM::filter

var likelihood = function likelihood(observation, singleClassModel, singleClassModelResults) {
	var coeffs = singleClassModel.mixture_coeffs;
	var components = singleClassModel.components;
	var res = singleClassModelResults;
	var p = 0;

	for (var c = 0; c < coeffs.length; c++) {
		p += coeffs[c] * componentLikelihood(components[c], observation);
	}

	res.instant_likelihood = p;
	res.likelihood_buffer.unshift(p);
	res.likelihood_buffer.length--;
	res.log_likelihood = res.likelihood_buffer.reduce(function (a, b) {
		return a + b;
	}, 0); // sum of all array values
	res.log_likelihood /= res.likelihood_buffer.length;
};

// ================================= //
//          as in xmmGmm.cpp         //
// ================================= //

var likelihoods = function likelihoods(observation, model, modelResults) {
	var likelihoods = [];
	var models = model.models;
	var res = modelResults;

	var maxLogLikelihood = 0;
	var normConstInstant = 0;
	var normConstSmoothed = 0;

	for (var i = 0; i < model.models.length; i++) {

		var singleResults = modelResults.singleClassModelResults[i];
		likelihood(observation, model.models[i], singleResults);

		res.instant_likelihoods[i] = singleResults.instant_likelihood;
		res.smoothed_log_likelihoods[i] = singleResults.log_likelihood;
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

	for (var i = 0; i < model.models.length; i++) {

		res.instant_normalized_likelihoods[i] /= normConstInstant;
		res.smoothed_normalized_likelihoods[i] /= normConstSmoothed;
	}
};

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

			likelihoods(frame, this.model, this.modelResults);

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
					singleClassModelResults: []
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
					this.modelResults.singleClassModelResults.push(res);
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

},{"babel-runtime/helpers/class-call-check":18,"babel-runtime/helpers/create-class":19,"babel-runtime/helpers/get":20,"babel-runtime/helpers/inherits":21,"babel-runtime/helpers/interop-require-wildcard":23,"waves-lfo":53}],12:[function(require,module,exports){
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

				this.model = model;
				var nmodels = model.models.length;

				var nstatesGlobal = model.configuration.default_parameters.states;
				this.params.frameSize = nstatesGlobal;

				this.prior = new Array(nmodels);
				this.exit_transition = new Array(nmodels);
				this.transition = new Array(nmodels);
				for (var i = 0; i < nmodels; i++) {
					this.transition[i] = new Array(nmodels);
				}
				this.frontier_v1 = new Array(nstatesGlobal);
				this.frontier_v2 = new Array(nstatesGlobal);
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
			console.log(this.streamParams.frameSize);
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

			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(1, this.frontier_v1, this.model, this.modelResults);
			(0, _xmmDecoderCommon.hhmmLikelihoodAlpha)(2, this.frontier_v2, this.model, this.modelResults);

			// let num_classes =
			// let dstModelIndex = 0;

			for (var i = 0; i < this.model.models.length; i++) {

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
						for (var srci = 0; srci < nstates; srci++) {
							front[k] += mRes.prior[k] * (this.frontier_v1[srci] * this.transition[srci][i] + this.prior[i] * this.frontier_v2[srci]);
						}
					}
				} else {
					//////////////////////////////////////////////////// left-right

					// k == 0 : first state of the primitive
					front[0] = mRes.transition[0] * mRes.alpha_h[0][0];

					for (var srci = 0; srci < this.model.models.length; srci++) {
						front[0] += this.frontier_v1[srci] * this.transition[srci][i] + this.prior[i] * this.frontier_v2[srci];
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

				//============== UPDATE FORWARD VARIABLE =============//

				mRes.exit_likelihood = 0;
				mRes.instant_likelihood = 0;

				for (var k = 0; k < nstates; k++) {
					tmp = (0, _xmmDecoderCommon.gmmLikelihood)(observation, m.states[k], mRes.singleClassGmmModelResults[k]) * front[k];

					mRes.alpha_h[2][k] = this.exit_transition[i] * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[1][k] = (1 - this.exit_transition[i]) * m.exitProbabilities[k] * tmp;
					mRes.alpha_h[0][k] = (1 - m.exitProbabilities[k]) * tmp;

					mRes.exit_likelihood += mRes.alpha_h[1][k] + mRes.alpha_h[2][k];
					mRes.instant_likelihood += mRes.alpha_h[0][k] + mRes.alpha_h[1][k] + mRes.alpha_h[2][k];
				}

				mRes.exit_ratio = mRes.exit_likelihood / mRes.instant_likelihood;
			}

			//============== NORMALIZE ALPHA VARIABLES =============//

			for (var i = 0; i < this.model.models.length; i++) {
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
	res.likelihood_buffer.push(res.instant_likelihood);
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

		res.instant_likelihoods[i] = singleResults.instant_likelihood;
		res.smoothed_log_likelihoods[i] = singleResults.log_likelihood;
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

	for (var i = 0; i < model.models.length; i++) {

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2F1ZGlvLXBsYXllci5qcyIsImNsaWVudC9jb21tb24vc3JjL2NsaWVudC9jb21tb24vaW5kZXguanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi9sZm8tZGVsdGEuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluLmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi9sZm8taW50ZW5zaXR5LmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi9sZm8tcHNldWRvLXlpbi5qcyIsImNsaWVudC9jb21tb24vc3JjL2NsaWVudC9jb21tb24vbGZvLXJlc2FtcGxlci1leHBlcmltZW50YWwuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1yZXNhbXBsZXIuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby1zZWxlY3QuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby14bW0tZ21tLWRlY29kZXIuanMiLCJjbGllbnQvY29tbW9uL3NyYy9jbGllbnQvY29tbW9uL2xmby14bW0taGhtbS1kZWNvZGVyLmpzIiwiY2xpZW50L2NvbW1vbi9zcmMvY2xpZW50L2NvbW1vbi94bW0tZGVjb2Rlci1jb21tb24uanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3IuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzcy1jYWxsLWNoZWNrLmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGUtY2xhc3MuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2dldC5qcyIsIm5vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9oZWxwZXJzL2ludGVyb3AtcmVxdWlyZS1kZWZhdWx0LmpzIiwibm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9pbnRlcm9wLXJlcXVpcmUtd2lsZGNhcmQuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2xpYi9iNjQuanMiLCJub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9ub2RlX21vZHVsZXMvaXNhcnJheS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2NyZWF0ZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L3NldC1wcm90b3R5cGUtb2YuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5hLWZ1bmN0aW9uLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29mLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzLyQuY29yZS5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmN0eC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmRlZmluZWQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5leHBvcnQuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5mYWlscy5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmdsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLmlvYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5pcy1vYmplY3QuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5qcyIsIm5vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy8kLm9iamVjdC1zYXAuanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC5zZXQtcHJvdG8uanMiLCJub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvJC50by1pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2pzZmZ0L2xpYi9jb21wbGV4X2FycmF5LmpzIiwibm9kZV9tb2R1bGVzL2pzZmZ0L2xpYi9mZnQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3QvY29yZS9iYXNlLWxmby5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9jb3JlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9iaXF1YWQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL2ZmdC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvZnJhbWVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvbWFnbml0dWRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9tYXguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL21pbi1tYXguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvb3BlcmF0b3JzL21vdmluZy1hdmVyYWdlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9tb3ZpbmctbWVkaWFuLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9ub29wLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L29wZXJhdG9ycy9vcGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9vcGVyYXRvcnMvc2VnbWVudGVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2F1ZGlvLXJlY29yZGVyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2Jhc2UtZHJhdy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9icGYuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvYnJpZGdlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL2RhdGEtcmVjb3JkZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvaW5kZXguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3MvbWFya2VyLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NpbmtzL3NvY2tldC1jbGllbnQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc2lua3Mvc29ja2V0LXNlcnZlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9zb25vZ3JhbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9zcGVjdHJvZ3JhbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy9zeW5jaHJvbml6ZWQtZHJhdy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy90cmFjZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zaW5rcy93YXZlZm9ybS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2F1ZGlvLWluLWJ1ZmZlci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2F1ZGlvLWluLW5vZGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3Qvc291cmNlcy9ldmVudC1pbi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9kaXN0L3NvdXJjZXMvc29ja2V0LWNsaWVudC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC9zb3VyY2VzL3NvY2tldC1zZXJ2ZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL2Rpc3QvdXRpbHMvZHJhdy11dGlscy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC91dGlscy9mZnQtd2luZG93cy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vZGlzdC91dGlscy9zb2NrZXQtdXRpbHMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9qc29uL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvYmFiZWwtcnVudGltZS9jb3JlLWpzL3N5bWJvbC9pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jbGFzc0NhbGxDaGVjay5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9jcmVhdGVDbGFzcy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy9nZXQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvaW5oZXJpdHMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9iYWJlbC1ydW50aW1lL2hlbHBlcnMvcG9zc2libGVDb25zdHJ1Y3RvclJldHVybi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2JhYmVsLXJ1bnRpbWUvaGVscGVycy90eXBlb2YuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vYXJyYXkvZnJvbS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9qc29uL3N0cmluZ2lmeS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9nZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3Byb21pc2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvZm4vc3ltYm9sL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbC9pdGVyYXRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19hZGQtdG8tdW5zY29wYWJsZXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4taW5zdGFuY2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fYW4tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2FycmF5LWluY2x1ZGVzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2NsYXNzb2YuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY29yZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19jcmVhdGUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fY3R4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Rlc2NyaXB0b3JzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2RvbS1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZW51bS1idWcta2V5cy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19lbnVtLWtleXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fZXhwb3J0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2Zvci1vZi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19oYXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faGlkZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19odG1sLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2llOC1kb20tZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2ludm9rZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2lzLWFycmF5LWl0ZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXMtYXJyYXkuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9faXRlci1jYWxsLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItZGV0ZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX2l0ZXItc3RlcC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19pdGVyYXRvcnMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fa2V5b2YuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fbGlicmFyeS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19tZXRhLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX21pY3JvdGFzay5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3QtYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1jcmVhdGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWRwLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1kcHMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcGQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWdvcG4tZXh0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BuLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1nb3BzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX29iamVjdC1ncG8uanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMtaW50ZXJuYWwuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LWtleXMuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fb2JqZWN0LXBpZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19vYmplY3Qtc2FwLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3Byb3BlcnR5LWRlc2MuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fcmVkZWZpbmUtYWxsLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3JlZGVmaW5lLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NldC1wcm90by5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtc3BlY2llcy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zZXQtdG8tc3RyaW5nLXRhZy5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zaGFyZWQta2V5LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3NoYXJlZC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL19zcGVjaWVzLWNvbnN0cnVjdG9yLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3N0cmluZy1hdC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190YXNrLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWluZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLWludGVnZXIuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8taW9iamVjdC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL190by1sZW5ndGguanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fdG8tb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvX3RvLXByaW1pdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL191aWQuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9fd2tzLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvY29yZS5nZXQtaXRlcmF0b3ItbWV0aG9kLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LmFycmF5LmZyb20uanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuYXJyYXkuaXRlcmF0b3IuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmFzc2lnbi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuY3JlYXRlLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHkuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYub2JqZWN0LmdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvci5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZi5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnByb21pc2UuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy9jb3JlLWpzL2xpYnJhcnkvbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yLmpzIiwibm9kZV9tb2R1bGVzL3dhdmVzLWxmby9ub2RlX21vZHVsZXMvY29yZS1qcy9saWJyYXJ5L21vZHVsZXMvZXM2LnN5bWJvbC5qcyIsIm5vZGVfbW9kdWxlcy93YXZlcy1sZm8vbm9kZV9tb2R1bGVzL2NvcmUtanMvbGlicmFyeS9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUuanMiLCJub2RlX21vZHVsZXMvd2F2ZXMtbGZvL25vZGVfbW9kdWxlcy93cy9saWIvYnJvd3Nlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7OztJQ0VxQixXQUFXO0FBQ3BCLFVBRFMsV0FBVyxDQUNuQixPQUFPLEVBQUUsTUFBTSxFQUFFOzs7d0JBRFQsV0FBVzs7QUFFOUIsTUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7O0FBRXZCLE1BQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBQ3RELE1BQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUM1QyxNQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDbEMsTUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQzlCLE1BQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDL0IsTUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFakIsTUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQzNDLE1BQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLENBQUM7O0FBRWxELE1BQUksQ0FBQyxZQUFZLEdBQUksVUFBQyxNQUFNLEVBQUUsR0FBRyxFQUFLOztBQUVyQyxPQUFHLE1BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEtBQUssTUFBTSxFQUFFLE9BQU87QUFDakQsT0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUssVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRTs7QUFFakUsVUFBSyxVQUFVLENB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QUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Ozs7QUFJM0MsT0FBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsT0FBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7QUFDaEIsT0FBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQy9DLFFBQUksSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUM3QixRQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDM0MsUUFBSSxDQUFDLE1BQU0sSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQzdCLFFBQUcsU0FBUyxHQUFHLElBQUksQ0FBQyxjQUFjLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxjQUFjLEVBQUU7QUFDbEUsU0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDdkI7QUFDRCxhQUFTLEdBQUcsS0FBSyxDQUFDO0lBQ2xCO0FBQ0QsT0FBSSxDQUFDLE1BQU0sSUFBSyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsQ0FBQztBQUM1QyxPQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDOzs7QUFHckMsT0FBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDcEIsUUFBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzFDLFFBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsR0FB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1Z0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBOztBQ0RBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBOzs7O0FDRkE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3RCQTtBQUNBOztBQ0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ25CQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTs7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBOztBQ0ZBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTs7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1JBO0FBQ0E7QUFDQTs7QUNGQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMU9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy9sZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IGZ1bmN0aW9uKCl7fTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9QbGF5ZXIge1xuXHRjb25zdHJ1Y3Rvcihjb250ZXh0LCBidWZmZXIpIHtcblx0XHR0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuXHRcdC8vdGhpcy5jb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXHRcdHRoaXMuc291cmNlQnVmZmVyID0gdGhpcy5jb250ZXh0LmNyZWF0ZUJ1ZmZlclNvdXJjZSgpO1xuXHRcdHRoaXMuYnVmZmVyR2FpbiA9IHRoaXMuY29udGV4dC5jcmVhdGVHYWluKCk7XG5cdFx0dGhpcy5zb3VyY2VCdWZmZXIuYnVmZmVyID0gYnVmZmVyO1xuXHRcdHRoaXMuc291cmNlQnVmZmVyLmxvb3AgPSB0cnVlO1xuXHRcdHRoaXMuYnVmZmVyR2Fpbi5nYWluLnZhbHVlID0gMDtcblx0XHR0aGlzLmZhZGVJRCA9IC0xO1xuXG5cdFx0dGhpcy5zb3VyY2VCdWZmZXIuY29ubmVjdCh0aGlzLmJ1ZmZlckdhaW4pO1xuXHRcdHRoaXMuYnVmZmVyR2Fpbi5jb25uZWN0KHRoaXMuY29udGV4dC5kZXN0aW5hdGlvbik7XG5cblx0XHR0aGlzLmZhZGVGdW5jdGlvbiA9ICgodGFyZ2V0LCBpbmMpID0+IHtcblx0XHRcdC8vY29uc29sZS5sb2codGhpcy5idWZmZXJHYWluLmdhaW4udmFsdWUpO1xuXHRcdFx0aWYodGhpcy5idWZmZXJHYWluLmdhaW4udmFsdWUgPT09IHRhcmdldCkgcmV0dXJuO1xuXHRcdFx0aWYoTWF0aC5hYnModGhpcy5idWZmZXJHYWluLmdhaW4udmFsdWUgLSB0YXJnZXQpID4gTWF0aC5hYnMoaW5jKSkge1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHRoaXMuYnVmZmVyR2Fpbi5nYWluLnZhbHVlKTtcblx0XHRcdFx0dGhpcy5idWZmZXJHYWluLmdhaW4udmFsdWUgKz0gaW5jO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihNYXRoLmFicyh0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSAtIHRhcmdldCkgPCBNYXRoLmFicyhpbmMpKSB7XG5cdFx0XHRcdHRoaXMuYnVmZmVyR2Fpbi5nYWluLnZhbHVlID0gdGFyZ2V0O1xuXHRcdFx0XHRjbGVhckludGVydmFsKHRoaXMuZmFkZUlEKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdHN0YXJ0KCkge1xuXHRcdHRoaXMuc291cmNlQnVmZmVyLnN0YXJ0KHRoaXMuY29udGV4dC5jdXJyZW50VGltZSk7XG5cdH1cblxuXHRzdG9wKCkge1xuXHRcdHRoaXMuc291cmNlQnVmZmVyLnN0b3AoKTtcblx0fVxuXG5cdGZhZGUodGFyZ2V0LCBkdXJhdGlvbikge1xuXHRcdGlmKGR1cmF0aW9uID09PSAwKSB7XG5cdFx0XHR0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSA9IHRhcmdldDtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0bGV0IGludGVydmFsID0gMTA7XG5cdFx0bGV0IGluYyA9ICh0YXJnZXQgLSB0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSkgLyAoZHVyYXRpb24gLyBpbnRlcnZhbCk7XG5cdFx0Ly9jb25zb2xlLmxvZyh0aGlzLmJ1ZmZlckdhaW4uZ2Fpbi52YWx1ZSArIFwiIC0+IFwiICsgdGFyZ2V0ICsgXCIgXCIgKyBpbmMpO1xuXHRcdGlmKGluYyA9PSAwKSByZXR1cm47XG5cdFx0Y2xlYXJJbnRlcnZhbCh0aGlzLmZhZGVJRCk7XG5cdFx0dGhpcy5mYWRlSUQgPSBzZXRJbnRlcnZhbCh0aGlzLmZhZGVGdW5jdGlvbi5iaW5kKHRoaXMsIHRhcmdldCwgaW5jKSwgaW50ZXJ2YWwpO1xuXHR9XG59IiwiaW1wb3J0IERhdGFSZWNvcmRlciBmcm9tICcuL2xmby1kYXRhLXJlY29yZGVyJztcbmltcG9ydCBJbnB1dFByb2Nlc3NpbmdDaGFpbiBmcm9tICcuL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluJztcbmltcG9ydCBQc2V1ZG9ZaW4gZnJvbSAnLi9sZm8tcHNldWRvLXlpbic7XG5pbXBvcnQgUmVzYW1wbGVyIGZyb20gJy4vbGZvLXJlc2FtcGxlcic7XG5pbXBvcnQgUmVzYW1wbGVyRXhwIGZyb20gJy4vbGZvLXJlc2FtcGxlci1leHBlcmltZW50YWwnO1xuaW1wb3J0IEdtbURlY29kZXIgZnJvbSAnLi9sZm8teG1tLWdtbS1kZWNvZGVyJztcbmltcG9ydCBIaG1tRGVjb2RlciBmcm9tICcuL2xmby14bW0taGhtbS1kZWNvZGVyJztcbmltcG9ydCBEZWx0YSBmcm9tICcuL2xmby1kZWx0YSc7XG5pbXBvcnQgSW50ZW5zaXR5IGZyb20gJy4vbGZvLWludGVuc2l0eSc7XG5pbXBvcnQgU2VsZWN0IGZyb20gJy4vbGZvLXNlbGVjdCc7XG5pbXBvcnQgQXVkaW9QbGF5ZXIgZnJvbSAnLi9hdWRpby1wbGF5ZXIuanMnO1xuIiwiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFSZWNvcmRlciBleHRlbmRzIGxmby5zaW5rcy5EYXRhUmVjb3JkZXIge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0Ly9mcmFtZVNpemU6IDMsXG5cdFx0XHRzZXBhcmF0ZUFycmF5czogdHJ1ZSxcblx0XHRcdGJpbW9kYWw6IGZhbHNlLFxuXHRcdFx0Ly9jb2x1bW5fbmFtZXM6IFsnbWFnbml0dWRlJywgJ2ZyZXF1ZW5jeScsICdwZXJpb2RpY2l0eSddXG5cdFx0fVxuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblx0XHRpZihvcHRpb25zLmNvbHVtbl9uYW1lcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0aGlzLnBhcmFtcy5jb2x1bW5fbmFtZXMgPSBvcHRpb25zLmNvbHVtbl9uYW1lcy5zcGxpY2UoMCk7XG5cdFx0fVxuXG5cdFx0dGhpcy5waHJhc2UgPSB7fTtcblxuXHRcdHRoaXMudXBkYXRlUGhyYXNlID0gKChkYXRhKSA9PiB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEuZGF0YSk7XG5cdFx0XHR0aGlzLnBocmFzZSA9IHt9O1xuXHRcdFx0dGhpcy5waHJhc2UuYmltb2RhbCA9IHRoaXMucGFyYW1zLmJpbW9kYWw7XG5cdFx0XHR0aGlzLnBocmFzZS5kaW1lbnNpb24gPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cdFx0XHR0aGlzLnBocmFzZS5kaW1lbnNpb25faW5wdXQgPSAwO1xuXHRcdFx0dGhpcy5waHJhc2UuY29sdW1uX25hbWVzID0gdGhpcy5wYXJhbXMuY29sdW1uX25hbWVzLnNwbGljZSgwKTtcblx0XHRcdHRoaXMucGhyYXNlLmRhdGEgPSBbXTtcblx0XHRcdGZvcihsZXQgdmVjaWQgaW4gZGF0YS5kYXRhKSB7XG5cdFx0XHRcdGZvcihsZXQgaWQgaW4gZGF0YS5kYXRhW3ZlY2lkXSkge1xuXHRcdFx0XHRcdHRoaXMucGhyYXNlLmRhdGEucHVzaChkYXRhLmRhdGFbdmVjaWRdW2lkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucGhyYXNlLmxlbmd0aCA9IGRhdGEudGltZS5sZW5ndGg7XG5cdFx0XHR0aGlzLnJldHJpZXZlKCkudGhlbih0aGlzLnVwZGF0ZVBocmFzZS5iaW5kKHRoaXMpKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVyci5zdGFjaykpO1x0XHRcdFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZXRyaWV2ZSgpLnRoZW4odGhpcy51cGRhdGVQaHJhc2UuYmluZCh0aGlzKSkuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcblx0fVxuXG5cdGluaXRpYWxpemUoc3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHRzdXBlci5pbml0aWFsaXplKHN0cmVhbVBhcmFtcyk7XG5cdFx0dGhpcy5waHJhc2UuZGltZW5zaW9uID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHR9XG5cblx0Z2V0UmVjb3JkZWRQaHJhc2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMucGhyYXNlO1xuXHR9XG59XG4iLCIvLyBsaW5lYXIgcmVncmVzc2lvbiBsZm8gZm9yIGZpeGVkIHNhbXBsZXJhdGUgbXVsdGktZGltZW5zaW9uYWwgZGF0YSBzdHJlYW1zXG4vLyBiYXNlZCBvbiBydGFfZGVsdGEuYyBieSBKZWFuLVBoaWxpcHBlIExhbWJlcnRcblxuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERlbHRhIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRvcmRlcjogMyxcblx0XHRcdGZpbGw6IDAsXG5cdFx0XHRmcmFtZVNpemU6IDFcblx0XHR9XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0Ly8gb3JkZXIgbXVzdCBiZSBvZGQgYW5kID4gM1xuXHRcdGlmKHRoaXMucGFyYW1zLm9yZGVyIDwgMykge1xuXHRcdFx0dGhpcy5wYXJhbXMub3JkZXIgPSAzO1xuXHRcdH0gZWxzZSBpZih0aGlzLnBhcmFtcy5vcmRlciAlIDIgPT0gMCkge1xuXHRcdFx0dGhpcy5wYXJhbXMub3JkZXIgLT0gMTtcblx0XHR9XG5cblx0XHRsZXQgaGFsZkZpbHRlclNpemUgPSBNYXRoLmZsb29yKHRoaXMucGFyYW1zLm9yZGVyICogMC41KTtcblxuXHRcdC8vIHdlaWdodHMgZm9yIGlucHV0IHZlY3RvcnNcblx0XHR0aGlzLndlaWdodHMgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMucGFyYW1zLm9yZGVyKTtcblx0XHRmb3IobGV0IGk9MCwgZmlsdGVyVmFsdWU9LWhhbGZGaWx0ZXJTaXplOyBpPHRoaXMucGFyYW1zLm9yZGVyOyBpKyssIGZpbHRlclZhbHVlKz0xKSB7XG5cdFx0XHR0aGlzLndlaWdodHNbaV0gPSBmaWx0ZXJWYWx1ZTtcblx0XHR9XG5cblx0XHQvLyBub3JtYWxpemF0aW9uIGZhY3RvclxuXHRcdHRoaXMubm9ybUZhY3RvciA9IDA7XG5cdFx0Zm9yKGxldCBpPTE7IGk8PWhhbGZGaWx0ZXJTaXplOyBpKyspIHtcblx0XHRcdHRoaXMubm9ybUZhY3RvciArPSBpKmk7XG5cdFx0fVxuXHRcdHRoaXMubm9ybUZhY3RvciA9IDAuNSAvIHRoaXMubm9ybUZhY3RvcjtcblxuXHRcdHRoaXMucmluZ0J1ZmZlciA9IG51bGw7Ly9uZXcgRmxvYXQzMkFycmF5KHRoaXMub3JkZXIgKiB0aGlzLnBhcmFtcy5mcmFtZVNpemUpO1xuXHRcdHRoaXMucmluZ0luZGV4ID0gMDtcblx0fVxuXG5cdGluaXRpYWxpemUoc3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHRzdXBlci5pbml0aWFsaXplKHN0cmVhbVBhcmFtcyk7XG5cdFx0dGhpcy5wYXJhbXMuZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXHRcdHRoaXMucmluZ0J1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wYXJhbXMub3JkZXIgKiB0aGlzLnBhcmFtcy5mcmFtZVNpemUpO1xuXHR9XG5cblx0cmVzZXQoKSB7XG5cdFx0c3VwZXIucmVzZXQoKTtcblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLnJpbmdCdWZmZXIubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMucmluZ0J1ZmZlcltpXSA9IHRoaXMucGFyYW1zLmZpbGw7XG5cdFx0fVxuXHR9XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHRjb25zdCByaW5nSW5kZXggPSB0aGlzLnJpbmdJbmRleDtcblx0XHRjb25zdCBmcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG5cdFx0Y29uc3Qgb3JkZXIgPSB0aGlzLnBhcmFtcy5vcmRlcjtcblxuXHRcdGZvcihsZXQgaT0wOyBpPGZyYW1lU2l6ZTsgaSsrKSB7XG5cdFx0XHR0aGlzLnJpbmdCdWZmZXJbcmluZ0luZGV4ICogZnJhbWVTaXplICsgaV0gPSBmcmFtZVtpXTtcblx0XHRcdHRoaXMub3V0RnJhbWVbaV0gPSAwO1xuXHRcdH1cblxuXHRcdGZvcihsZXQgaT0wOyBpPG9yZGVyOyBpKyspIHtcblx0XHRcdGZvcihsZXQgaj0wOyBqPGZyYW1lU2l6ZTsgaisrKSB7XG5cdFx0XHRcdHRoaXMub3V0RnJhbWVbal0gKz0gdGhpcy5yaW5nQnVmZmVyW2kgKiBmcmFtZVNpemUgKyBqXSAqIHRoaXMud2VpZ2h0c1tpXTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IobGV0IGk9MDsgaTxmcmFtZVNpemU7IGkrKykge1xuXHRcdFx0dGhpcy5vdXRGcmFtZVtpXSAqPSB0aGlzLm5vcm1GYWN0b3I7XG5cdFx0fVxuXG5cdFx0dGhpcy5yaW5nSW5kZXggPSAocmluZ0luZGV4ICsgMSkgJSBvcmRlcjtcblxuXHRcdC8vIE5PVyBERUFMIFdJVEggVElNRSA6XG5cdFx0aWYodGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSkge1xuXHRcdFx0dGltZSAtPSAwLjUgKiBvcmRlciAvIHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGU7XG5cdFx0fVxuXG5cdFx0Ly9jb25zb2xlLmxvZyh0aGlzLm91dEZyYW1lKTtcblx0XHR0aGlzLm91dHB1dCh0aW1lLCB0aGlzLm91dEZyYW1lLCBtZXRhRGF0YSk7XG5cdH1cbn0iLCJcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuaW1wb3J0IFJlc2FtcGxlciBmcm9tICcuL2xmby1yZXNhbXBsZXInO1xuaW1wb3J0IFJlc2FtcGxlckV4cCBmcm9tICcuL2xmby1yZXNhbXBsZXItZXhwZXJpbWVudGFsJztcbmltcG9ydCBQc2V1ZG9ZaW4gZnJvbSAnLi9sZm8tcHNldWRvLXlpbic7XG5cblxuLy8gPT09PT09PT09PT09PT09PSBwb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93ID09PT09PT09PT09PT0gLy9cbi8vIC0tPiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvNTQzODY1MFxuXG4oZnVuY3Rpb24oKXtcblxuICBpZiAoXCJwZXJmb3JtYW5jZVwiIGluIHdpbmRvdyA9PSBmYWxzZSkge1xuICAgICAgd2luZG93LnBlcmZvcm1hbmNlID0ge307XG4gIH1cbiAgXG4gIERhdGUubm93ID0gKERhdGUubm93IHx8IGZ1bmN0aW9uICgpIHsgIC8vIHRoYW5rcyBJRThcblx0ICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH0pO1xuXG4gIGlmIChcIm5vd1wiIGluIHdpbmRvdy5wZXJmb3JtYW5jZSA9PSBmYWxzZSkge1xuICAgIFxuICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuICAgIFxuICAgIGlmIChwZXJmb3JtYW5jZS50aW1pbmcgJiYgcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCkge1xuICAgICAgbm93T2Zmc2V0ID0gcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydFxuICAgIH1cblxuICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbiBub3coKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIG5vd09mZnNldDtcbiAgICB9XG4gIH1cblxufSkoKTtcblxuLy8gd2Via2l0QXVkaW9Db250ZXh0IGZvciBzYWZhcmksIGVtcHR5IGZ1bmN0aW9uIGZvciBvbGQgYW5kcm9pZFxuLy8gWyBBdWRpbyBub3QgbmVlZGVkIGhlcmUgXVxubGV0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCBmdW5jdGlvbigpe307XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElucHV0UHJvY2Vzc2luZ0NoYWluIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRpbnB1dEZyYW1lU2l6ZTogMSxcblx0XHRcdHdpbmRvd1NpemU6IDEyOCxcblx0XHRcdGhvcFNpemU6IDY0LFxuXHRcdFx0Ly9vdXRwdXRSYXRlOiA1MCxcdFxuXHRcdFx0cGVyaW9kOiAyMFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5ldmVudEluID0gbmV3IGxmby5zb3VyY2VzLkV2ZW50SW4oe1xuXHRcdFx0Ly9yZWxhdGl2ZTogdHJ1ZSxcblx0XHRcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdFx0XHRjdHg6IEF1ZGlvQ29udGV4dFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZXNhbXBsZXIgPSBuZXcgUmVzYW1wbGVyKHtcblx0XHRcdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdFx0XHRwZXJpb2Q6IHRoaXMucGFyYW1zLnBlcmlvZCAvLyBpbiBtaWxsaXNlY29uZHNcblx0XHR9KTtcblxuXHRcdC8vIHRoaXMucmVzYW1wbGVyID0gbmV3IFJlc2FtcGxlckV4cCh7XG5cdFx0Ly8gXHRmcmFtZVNpemU6IHRoaXMucGFyYW1zLmlucHV0RnJhbWVTaXplLFxuXHRcdC8vIFx0b3V0cHV0UmF0ZTogdGhpcy5wYXJhbXMub3V0cHV0UmF0ZSxcblx0XHQvLyBcdGJ1ZmZlckR1cmF0aW9uOiAxNTBcblx0XHQvLyBcdC8vcGVyaW9kOiB0aGlzLnBhcmFtcy5wZXJpb2QgLy8gaW4gbWlsbGlzZWNvbmRzXG5cdFx0Ly8gfSk7XG5cblx0XHQvLyB0aGlzLmZpbHRlciA9IG5ldyBsZm8ub3BlcmF0b3JzLk1vdmluZ01lZGlhbih7XG5cdFx0Ly8gLy90aGlzLmZpbHRlciA9IG5ldyBsZm8ub3BlcmF0b3JzLk1vdmluZ0F2ZXJhZ2UoeyAvLyBmaWxsKCkgZnVuY3Rpb24gbm90IHJlY29nbml6ZWRcblx0XHQvLyBcdG9yZGVyOiAxXG5cdFx0Ly8gfSk7XG5cblx0XHR0aGlzLmZyYW1lciA9IG5ldyBsZm8ub3BlcmF0b3JzLkZyYW1lcih7XG5cdFx0XHRmcmFtZVNpemU6IHRoaXMucGFyYW1zLndpbmRvd1NpemUgKiB0aGlzLnBhcmFtcy5pbnB1dEZyYW1lU2l6ZSxcblx0XHRcdC8vZnJhbWVSYXRlOiB0aGlzLnJlc2FtcGxlci5mcmFtZVJhdGUgLyAodGhpcy5wYXJhbXMud2luZG93U2l6ZSAqIHRoaXMucGFyYW1zLmlucHV0RnJhbWVTaXplKSxcblx0XHRcdGhvcFNpemU6IHRoaXMucGFyYW1zLmhvcFNpemVcblx0XHRcdC8vY2VudGVyZWRUaW1lVGFnOiB0cnVlXG5cdFx0fSk7XG5cblx0XHR0aGlzLmRlc2NyID0gbmV3IFBzZXVkb1lpbih7XG5cdFx0XHQvL2ZyYW1lU2l6ZTogMywgLy8gZGVmaW5lZCBpbnRlcm5hbGx5XG5cdFx0XHRpbnB1dFJhdGU6IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2QsXG5cdFx0XHRub2lzZVRocmVzaG9sZDogMC4wM1xuXHRcdH0pO1xuXG5cdFx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdFx0Ly89PT09PT09PT09IGNvbm5lY3QgdGhpbmdzID09PT09PT09PS8vXG5cdFx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cblx0XHR0aGlzLmV2ZW50SW4uY29ubmVjdCh0aGlzLnJlc2FtcGxlcik7XG5cdFx0Ly90aGlzLnJlc2FtcGxlci5jb25uZWN0KHRoaXMuZmlsdGVyKTtcblx0XHQvL3RoaXMuZXZlbnRJbi5jb25uZWN0KHRoaXMuZmlsdGVyKTtcblx0XHQvL3RoaXMuZmlsdGVyLmNvbm5lY3QodGhpcy5mcmFtZXIpO1xuXHRcdHRoaXMucmVzYW1wbGVyLmNvbm5lY3QodGhpcy5mcmFtZXIpO1xuXHRcdHRoaXMuZnJhbWVyLmNvbm5lY3QodGhpcy5kZXNjcik7XG5cblx0fVxuXG5cdHN0YXJ0KCkge1xuXHRcdHRoaXMuZXZlbnRJbi5zdGFydCgpO1xuXHR9XG5cblx0c3RvcCgpIHtcblx0XHR0aGlzLmV2ZW50SW4uc3RvcCgpO1xuXHR9XG5cblx0Y29ubmVjdChjaGlsZCkge1xuICAgIFx0dGhpcy5kZXNjci5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICBcdGNoaWxkLnBhcmVudCA9IHRoaXMuZGVzY3I7XG5cdH1cblxuXHQvLyBUT0RPIDogaW1wbGVtZW50IGRpc2NvbmVjdCgpXG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHQvL3RoaXMuZXZlbnRJbi5wcm9jZXNzKHBlcmZvcm1hbmNlLm5vdygpLCBbZnJhbWVdKTtcblx0XHRcblx0XHQvL2NvbnNvbGUubG9nKCdQc2V1ZG8tWWluIG91dEZyYW1lIDogJyArIHRoaXMuZGVzY3Iub3V0RnJhbWUpO1xuXHRcdHRoaXMuZXZlbnRJbi5wcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSk7XG5cblx0XHQvL1x0dGhpcy5yZXNhbXBsZXIucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuXHR9XG5cblx0cHJlRnJhbWVyQ29ubmVjdChkZXN0KSB7XG5cdFx0Ly90aGlzLmZpbHRlci5jb25uZWN0KGRlc3QpO1xuXHRcdHRoaXMucmVzYW1wbGVyLmNvbm5lY3QoZGVzdCk7XG5cdH1cbn1cblxuIiwiLy8gaW50ZW5zaXR5IDogbGZvIHJldHVybmluZyBhbiBlc3RpbWF0aW9uIG9mIG1vdmVtZW50IGludGVuc2l0eSAoZW5lcmd5KVxuLy8gdXNlcyBkZXJpdmF0aW9uICsgaW50ZWdyYXRpb24gdG8gcmV0dXJuIHRvIHplcm8gd2hlbiB0aGVyZSBpcyBubyBtb3ZlbWVudFxuLy8gYmFzZWQgb24gdGhlIGludGVuc2l0eSBtb2R1bGUgZGV2ZWxvcGVkIGJ5IEZyZWQgQmV2aWxhY3F1YSBhbmQgR2FlbCBEdWJ1c1xuLy8gZm9yIHRoZSBNdXNpY0JyaWNrcyBFVSBwcm9qZWN0XG5cbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuaW1wb3J0IERlbHRhIGZyb20gJy4vbGZvLWRlbHRhJztcblxuLy8gaW50ZXJuYWwgY2xhc3MgOiB0aGUgY29tcGxldGUgYWxnb3JpdGhtIG5lZWRzIGxpbmVhciByZWdyZXNzaW9uIGFzIGRlcml2YXRpb25cblxuY2xhc3MgSW50ZW5zaXR5Q29yZSBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0aW50ZWdyYXRpb25GYWN0b3I6IDAuOCxcblx0XHRcdG91dHB1dEdhaW46IDAuMDA1XG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLmlucHV0RGltcyA9IDA7XG5cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cdH1cblxuXHRpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zID0ge30sIG91dFN0cmVhbVBhcmFtcyA9IHt9KSB7XG5cdFx0dGhpcy5pbnB1dEZyYW1lU2l6ZSA9IGluU3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcblx0XHR0aGlzLmZyYW1lQWNjdW11bGF0b3IgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuaW5wdXRGcmFtZVNpemUpO1xuXG5cdFx0b3V0U3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IDE7XG5cdFx0c3VwZXIuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcywgb3V0U3RyZWFtUGFyYW1zKTtcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMuaW5wdXRGcmFtZVNpemU7IGkrKykge1xuXHRcdFx0dGhpcy5mcmFtZUFjY3VtdWxhdG9yW2ldID0gMDtcblx0XHR9XG5cdFx0Ly9jb25zb2xlLmxvZyh0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgKyAnICcgKyB0aGlzLmlucHV0RnJhbWVTaXplKTtcblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0Y29uc3QgZmFjdG9yID0gdGhpcy5wYXJhbXMuaW50ZWdyYXRpb25GYWN0b3I7XG5cdFx0Y29uc3QgZ2FpbiA9IHRoaXMucGFyYW1zLm91dHB1dEdhaW47XG5cdFx0Y29uc3QgaW5TaXplID0gdGhpcy5pbnB1dEZyYW1lU2l6ZTtcblx0XHRjb25zdCBmcmFtZUJ1ZiA9IHRoaXMuZnJhbWVBY2N1bXVsYXRvcjtcblxuXHRcdGxldCBvdXRWYWx1ZSA9IDA7XG5cblx0XHRmb3IobGV0IGk9MDsgaTxpblNpemU7IGkrKykge1xuXHRcdFx0bGV0IHNxaSA9IGZyYW1lW2ldICogZnJhbWVbaV07XG5cdFx0XHRmcmFtZUJ1ZltpXSA9IHNxaSArIGZyYW1lQnVmW2ldICogZmFjdG9yO1xuXG5cdFx0XHQvLyBvdXRWYWx1ZSArPSBmcmFtZUJ1ZltpXSAqIGdhaW47XG5cdFx0XHRcblx0XHRcdC8vIHNlZSBiZWxvdyA6IHVzZSBzcXJ0IGluc3RlYWQgb2Ygb3V0cHV0IGdhaW5cblx0XHRcdG91dFZhbHVlICs9IGZyYW1lQnVmW2ldO1xuXHRcdH1cblxuXHRcdC8vIHRoaXMub3V0RnJhbWVbMF0gPSBvdXRWYWx1ZTtcblxuXHRcdC8vIGxpdHRsZSBtb2QgOiB1c2Ugc3FydCBpbnN0ZWFkIG9mIG91dHB1dCBnYWluXG5cdFx0Ly8gc28gdGhhdCB0aGUgYWxnb3JpdGhtIGlzIG1vcmUgc2ltaWxhciB0byBSTVMgY29tcHV0YXRpb25cblx0XHQvLyAoc3FydCdlZCBzdW0gb2Ygc3F1YXJlcylcblx0XHR0aGlzLm91dEZyYW1lWzBdID0gTWF0aC5zcXJ0KG91dFZhbHVlKTtcblx0XHQvL2NvbnNvbGUubG9nKG91dFZhbHVlKTtcblx0XHR0aGlzLm91dHB1dCh0aW1lLCB0aGlzLm91dEZyYW1lLCBtZXRhRGF0YSk7XG5cdH1cbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuLy89PT09PT09PT09PT09IHRoZSByZWFsIEludGVuc2l0eSBjbGFzcyA9PT09PT09PT09PT09PT0vL1xuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlbnNpdHkgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuZGVsdGEgPSBuZXcgRGVsdGEoe1xuXHRcdFx0b3JkZXI6IDNcblx0XHR9KTtcblxuXHRcdHRoaXMuaW50ZW5zaXR5ID0gbmV3IEludGVuc2l0eUNvcmUoe1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5kZWx0YS5jb25uZWN0KHRoaXMuaW50ZW5zaXR5KTtcblxuXHR9XG5cblx0aW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcyA9IHt9LCBvdXRTdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdHRoaXMuZGVsdGEuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcywgb3V0U3RyZWFtUGFyYW1zKTtcblx0fVxuXG5cdGNvbm5lY3QoY2hpbGQpIHtcbiAgICBcdHRoaXMuaW50ZW5zaXR5LmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIFx0Y2hpbGQucGFyZW50ID0gdGhpcy5pbnRlbnNpdHk7XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdHRoaXMuZGVsdGEucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuXHR9XG59IiwiaW1wb3J0ICogYXMgbGZvIGZyb20gXCJ3YXZlcy1sZm9cIjtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT0gZGVzY3JpcHRvcnMgbGZvID09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQc2V1ZG9ZaW4gZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGZyYW1lU2l6ZTogMyxcblx0XHRcdC8vIG1pbklucHV0OiAtMzYwLFxuXHRcdFx0Ly8gbWF4SW5wdXQ6IDM2MCxcblx0XHRcdG5vaXNlVGhyZXNob2xkOiAwLjFcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMubWVhbiA9IDA7XG5cdFx0dGhpcy5tYWduaXR1ZGUgPSAwO1xuXHRcdHRoaXMuc3RkRGV2ID0gMDtcblx0XHR0aGlzLmNyb3NzaW5ncyA9IFtdO1xuXHRcdHRoaXMucGVyaW9kTWVhbiA9IDA7XG5cdFx0dGhpcy5wZXJpb2RTdGREZXYgPSAwO1xuXHRcdC8vdGhpcy5pbnB1dFJhdGUgPSB0aGlzLnBhcmFtcy5pbnB1dFJhdGU7XG5cdFx0dGhpcy5ub2lzZVRocmVzaG9sZCA9IHRoaXMucGFyYW1zLm5vaXNlVGhyZXNob2xkO1xuXG5cdFx0Ly90aGlzLm1heEZyZXEgPSB0aGlzLmlucHV0UmF0ZSAvIDAuNTtcblx0fVxuXG5cdGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMgPSB7fSwgb3V0U3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHRvdXRTdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuXHRcdHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMsIG91dFN0cmVhbVBhcmFtcyk7XG5cdFx0Y29uc29sZS5sb2codGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSk7XG5cblx0XHQvLyBub3JtYWxpemUgZnJlcXVlbmN5IHdpdGggbWF4RnJlcVxuXHRcdGlmKCF0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlKSB7XG5cdFx0XHR0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlID0gMTA7XG5cdFx0fVxuXHRcdHRoaXMubWF4RnJlcSA9IHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGUgKiAwLjU7XG5cblx0XHQvLyBub3JtYWxpemUgcGVyaW9kaWNpdHkgd2l0aCBtYXhQZXJpb2QgLSBtaW5QZXJpb2Rcblx0XHQvLyBtaW5QZXJpb2QgaXMgMiBzYW1wbGVzXG5cdFx0Ly8gbWF4UGVyaW9kIGlzIGZyYW1lU2l6ZSAtIDFcblx0XHQvLyBzaW1wbGlmaWNhdGlvbiA6IG1pblBlcmlvZCA9IDAsIG1heFBlcmlvZCA9IGZyYW1lU2l6ZVxuXHRcdC8vID0+IG1heCBtZWFuID0gZnJhbWVTaXplIC8gMlxuXHRcdC8vID0+IG1heCBzdGQgZGV2ID0gc3FydCgyICogKGZyYW1zaXplIC8gMikgKiAoZnJhbWVzaXplIC8gMikpIFxuXHRcdC8vXHRcdFx0XHQgID0gc3FydChmcmFtZXNpemUgKiBmcmFtZXNpemUgKiAwLjUpXG5cdFx0Ly8gIFx0XHRcdCAgPSBmcmFtZXNpemUgKiBzcXJ0KDAuNSkgPCBmcmFtZXNpemVcblxuXHRcdC8qXG5cdFx0c3VwZXIuaW5pdGlhbGl6ZSh7XG5cdFx0XHRmcmFtZVNpemU6IHRoaXMucGFyYW1zLmZyYW1lU2l6ZVxuXHRcdH0pO1xuXHRcdCovXG5cdH1cblxuXHRfbWFpbkFsZ29yaXRobSgpIHtcblxuXHRcdC8vIGNvbXB1dGUgbWluLCBtYXggYW5kIG1lYW4gKGFuZCBtYWduaXR1ZGUpXG5cdFx0bGV0IG1pbiwgbWF4O1xuXHRcdG1pbiA9IG1heCA9IHRoaXMuaW5wdXRGcmFtZVswXTtcblx0XHR0aGlzLm1lYW4gPSAwO1xuXHRcdHRoaXMubWFnbml0dWRlID0gMDtcblx0XHRmb3IobGV0IGkgaW4gdGhpcy5pbnB1dEZyYW1lKSB7XG5cdFx0XHRsZXQgdmFsID0gdGhpcy5pbnB1dEZyYW1lW2ldO1xuXHRcdFx0dGhpcy5tYWduaXR1ZGUgKz0gdmFsICogdmFsO1xuXHRcdFx0dGhpcy5tZWFuICs9IHZhbDtcblx0XHRcdGlmKHZhbCA+IG1heCkge1xuXHRcdFx0XHRtYXggPSB2YWw7XG5cdFx0XHR9IGVsc2UgaWYodmFsIDwgbWluKSB7XG5cdFx0XHRcdG1pbiA9IHZhbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gVE9ETyA6IG1vcmUgdGVzdHMgdG8gZGV0ZXJtaW5lIHdoaWNoIG1lYW4gKHRydWUgbWVhbiBvciAobWF4LW1pbikvMikgaXMgdGhlIGJlc3Rcblx0XHQvL3RoaXMubWVhbiAvPSB0aGlzLmlucHV0RnJhbWUubGVuZ3RoO1xuXHRcdHRoaXMubWVhbiA9IG1pbiArIChtYXggLSBtaW4pICogMC41O1xuXG5cdFx0dGhpcy5tYWduaXR1ZGUgLz0gdGhpcy5pbnB1dEZyYW1lLmxlbmd0aDtcblx0XHR0aGlzLm1hZ25pdHVkZSA9IE1hdGguc3FydCh0aGlzLm1hZ25pdHVkZSk7XG5cblx0XHQvLyBjb21wdXRlIHNpZ25hbCBzdGREZXYgYW5kIG51bWJlciBvZiBtZWFuLWNyb3NzaW5nc1xuXHRcdC8vIGRlc2NlbmRpbmcgbWVhbiBjcm9zc2luZyBpcyB1c2VkIGhlcmVcblx0XHR0aGlzLmNyb3NzaW5ncyA9IFtdO1xuXHRcdHRoaXMuc3RkRGV2ID0gMDtcblx0XHRsZXQgcHJldkRlbHRhID0gdGhpcy5pbnB1dEZyYW1lWzBdIC0gdGhpcy5tZWFuO1xuXHRcdGZvcihsZXQgaSBpbiB0aGlzLmlucHV0RnJhbWUpIHtcblx0XHRcdGxldCBkZWx0YSA9IHRoaXMuaW5wdXRGcmFtZVtpXSAtIHRoaXMubWVhbjtcblx0XHRcdHRoaXMuc3RkRGV2ICs9IGRlbHRhICogZGVsdGE7XG5cdFx0XHRpZihwcmV2RGVsdGEgPiB0aGlzLm5vaXNlVGhyZXNob2xkICYmIGRlbHRhIDwgdGhpcy5ub2lzZVRocmVzaG9sZCkge1xuXHRcdFx0XHR0aGlzLmNyb3NzaW5ncy5wdXNoKGkpO1xuXHRcdFx0fVxuXHRcdFx0cHJldkRlbHRhID0gZGVsdGE7XG5cdFx0fVxuXHRcdHRoaXMuc3RkRGV2IC89ICh0aGlzLmlucHV0RnJhbWUubGVuZ3RoIC0gMSk7XG5cdFx0dGhpcy5zdGREZXYgPSBNYXRoLnNxcnQodGhpcy5zdGREZXYpO1xuXG5cdFx0Ly8gY29tcHV0ZSBtZWFuIG9mIGRlbHRhLVQgYmV0d2VlbiBjcm9zc2luZ3Ncblx0XHR0aGlzLnBlcmlvZE1lYW4gPSAwO1xuXHRcdGZvcihsZXQgaT0xOyBpPHRoaXMuY3Jvc3NpbmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLnBlcmlvZE1lYW4gKz0gdGhpcy5jcm9zc2luZ3NbaV0gLSB0aGlzLmNyb3NzaW5nc1tpIC0gMV07XG5cdFx0fVxuXHRcdHRoaXMucGVyaW9kTWVhbiAvPSAodGhpcy5jcm9zc2luZ3MubGVuZ3RoIC0gMSk7XG5cblx0XHQvLyBjb21wdXRlIHN0ZERldiBvZiBkZWx0YS1UIGJldHdlZW4gY3Jvc3NpbmdzXG5cdFx0dGhpcy5wZXJpb2RTdGREZXYgPSAwO1xuXHRcdGZvcihsZXQgaT0xOyBpPHRoaXMuY3Jvc3NpbmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsZXQgZGVsdGFQID0gKHRoaXMuY3Jvc3NpbmdzW2ldIC0gdGhpcy5jcm9zc2luZ3NbaSAtIDFdIC0gdGhpcy5wZXJpb2RNZWFuKVxuXHRcdFx0dGhpcy5wZXJpb2RTdGREZXYgKz0gZGVsdGFQICogZGVsdGFQO1xuXHRcdH1cblx0XHRpZih0aGlzLmNyb3NzaW5ncy5sZW5ndGggPiAyKSB7XG5cdFx0XHR0aGlzLnBlcmlvZFN0ZERldiA9IE1hdGguc3FydCh0aGlzLnBlcmlvZFN0ZERldiAvICh0aGlzLmNyb3NzaW5ncy5sZW5ndGggLSAyKSk7XG5cdFx0fVxuXHR9XG5cblx0c2V0Tm9pc2VUaHJlc2hvbGQodGhyZXNoKSB7XG5cdFx0dGhpcy5ub2lzZVRocmVzaG9sZCA9IHRocmVzaDtcblx0fVxuXG5cdC8vIHRoaXMgb25lIGdldHMgZnJhbWVzIHRvIGFuYWx5emUgOiBjb21wdXRlIG1hZ25pdHVkZSwgemVybyBjcm9zc2luZyByYXRlLCBhbmQgcGVyaW9kaWNpdHlcblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXHRcdHRoaXMuaW5wdXRGcmFtZSA9IGZyYW1lO1xuXG5cdFx0dGhpcy5fbWFpbkFsZ29yaXRobSgpO1xuXG5cdFx0dGhpcy5hbXBsaXR1ZGUgPSB0aGlzLnN0ZERldiAqIDIuMDsgLy8gZW1waXJpY2FsIGZhY3RvciBiZWNhdXNlIHdlIGRvbid0IGtub3cgYSBwcmlvcmkgc2Vuc29yIHJhbmdlXG5cblx0XHQvL3RoaXMuZnJlcXVlbmN5ID0gTWF0aC5zcXJ0KHRoaXMuY3Jvc3NpbmdzLmxlbmd0aCAqIDIuMCAvIHRoaXMuaW5wdXRGcmFtZS5sZW5ndGgpOyAvLyBzcXJ0J2VkIG5vcm1hbGl6ZWQgYnkgbnlxdWlzdCBmcmVxXG5cdFx0dGhpcy5mcmVxdWVuY3kgPSB0aGlzLmNyb3NzaW5ncy5sZW5ndGggKiAyLjAgLyB0aGlzLmlucHV0RnJhbWUubGVuZ3RoOyAvLyBub3JtYWxpemVkIGJ5IG55cXVpc3QgZnJlcVxuXHRcdFxuXHRcdGlmKHRoaXMuY3Jvc3NpbmdzLmxlbmd0aCA+IDIpIHtcblx0XHRcdC8vbGV0IGNsaXAgPSB0aGlzLnBlcmlvZFN0ZERldiAqIDUgLyB0aGlzLmlucHV0RnJhbWUubGVuZ3RoO1xuXHRcdFx0Ly9jbGlwID0gTWF0aC5taW4oY2xpcCwgMS4pO1xuXHRcdFx0Ly90aGlzLnBlcmlvZGljaXR5ID0gMS4wIC0gTWF0aC5zcXJ0KGNsaXApO1xuXG5cdFx0XHR0aGlzLnBlcmlvZGljaXR5ID0gMS4wIC0gTWF0aC5zcXJ0KHRoaXMucGVyaW9kU3RkRGV2IC8gdGhpcy5pbnB1dEZyYW1lLmxlbmd0aCk7XG5cdFx0XHQvL3RoaXMucGVyaW9kaWNpdHkgPSAxLjAgLSBNYXRoLnBvdyh0aGlzLnBlcmlvZFN0ZERldiAvIHRoaXMuaW5wdXRGcmFtZS5sZW5ndGgsIDAuNyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMucGVyaW9kaWNpdHkgPSAwO1xuXHRcdH1cblxuXHRcdC8vIFRPRE8gOiBpbXByb3ZlIHBlcmlvZGljaXR5IGFsZ29yaXRobSAhISFcblx0XHR0aGlzLm91dEZyYW1lWzBdID0gdGhpcy5hbXBsaXR1ZGU7XG5cdFx0dGhpcy5vdXRGcmFtZVsxXSA9IHRoaXMuZnJlcXVlbmN5O1xuXHRcdHRoaXMub3V0RnJhbWVbMl0gPSB0aGlzLnBlcmlvZGljaXR5O1xuXHRcdHRoaXMub3V0cHV0KCk7XG5cdH1cbn1cbiIsImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuXG4vLyA9PT09PT09PT09PT09PT09IHBvbHlmaWxsIGZvciBwZXJmb3JtYW5jZS5ub3cgPT09PT09PT09PT09PSAvL1xuLy8gLS0+IGh0dHBzOi8vZ2lzdC5naXRodWIuY29tL3BhdWxpcmlzaC81NDM4NjUwXG5cbihmdW5jdGlvbigpe1xuXG4gIGlmIChcInBlcmZvcm1hbmNlXCIgaW4gd2luZG93ID09IGZhbHNlKSB7XG4gICAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7fTtcbiAgfVxuICBcbiAgRGF0ZS5ub3cgPSAoRGF0ZS5ub3cgfHwgZnVuY3Rpb24gKCkgeyAgLy8gdGhhbmtzIElFOFxuXHQgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfSk7XG5cbiAgaWYgKFwibm93XCIgaW4gd2luZG93LnBlcmZvcm1hbmNlID09IGZhbHNlKSB7XG4gICAgXG4gICAgdmFyIG5vd09mZnNldCA9IERhdGUubm93KCk7XG4gICAgXG4gICAgaWYgKHBlcmZvcm1hbmNlLnRpbWluZyAmJiBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0KSB7XG4gICAgICBub3dPZmZzZXQgPSBwZXJmb3JtYW5jZS50aW1pbmcubmF2aWdhdGlvblN0YXJ0XG4gICAgfVxuXG4gICAgd2luZG93LnBlcmZvcm1hbmNlLm5vdyA9IGZ1bmN0aW9uIG5vdygpIHtcbiAgICAgIHJldHVybiBEYXRlLm5vdygpIC0gbm93T2Zmc2V0O1xuICAgIH1cbiAgfVxuXG59KSgpO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT0gcmVzYW1wbGVyIGxmbyA9PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlc2FtcGxlciBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0ZnJhbWVTaXplOiAxLFxuXHRcdFx0YnVmZmVyRHVyYXRpb246IDEwMCwgXHQvL21zXG5cdFx0XHRvdXRwdXRSYXRlOiA1MFx0XHRcdC8vSHpcblx0XHR9XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuXHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZSA9IHRoaXMucGFyYW1zLm91dHB1dFJhdGU7XG5cdFx0dGhpcy5vdXRwdXRQZXJpb2QgPSAxMDAwIC8gdGhpcy5wYXJhbXMub3V0cHV0UmF0ZTtcblx0XHR0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlID0gMTAwMCAvIHRoaXMub3V0cHV0UGVyaW9kO1xuXG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cdFx0dGhpcy5jb3VudGVyID0gMDtcblx0XHR0aGlzLmlucHV0QnVmZmVyID0gW107XG5cblx0XHQvLz09PT09PT0gY2FsbGJhY2sgZnVuY3Rpb24gPT09PT09PS8vXG5cdFx0dGhpcy5maXJlID0gKCgpID0+IHtcblx0XHRcdGNvbnN0IG5vdyA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdFx0XG5cdFx0XHQvL3RoaXMudGltZSA9IG5vdztcblx0XHRcdHRoaXMuY291bnRlcisrO1xuXHRcdFx0dGhpcy50aW1lID0gdGhpcy5jb3VudGVyICogdGhpcy5vdXRwdXRQZXJpb2Q7XG5cblx0XHRcdGNvbnN0IGZyYW1lU2l6ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcblx0XHRcdGNvbnN0IGJ1ZiA9IHRoaXMuaW5wdXRCdWZmZXI7XG5cdFx0XHRjb25zdCBkZWwgPSB0aGlzLnBhcmFtcy5idWZmZXJEdXJhdGlvbjtcblxuXHRcdFx0Ly9jb25zdCBuZXh0SW50ZXJ2YWwgPSB0aGlzLm91dHB1dFBlcmlvZCAtIChub3cgLSB0aGlzLmxhc3ROb3cpO1xuXHRcdFx0Ly9pZihuZXh0SW50ZXJ2YWwgPCAwKSBuZXh0SW50ZXJ2YWwgPSB0aGlzLm91dHB1dFBlcmlvZDtcblx0XHRcdC8vdGhpcy5sYXN0Tm93ID0gbm93O1xuXHRcdFx0Ly9zZXRUaW1lb3V0KHRoaXMuZmlyZS5iaW5kKHRoaXMpLCBuZXh0SW50ZXJ2YWwpO1xuXG5cdFx0XHRpZihidWYubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmKGJ1Zi5sZW5ndGggPT09IDEpIHsgLy8gYmVnaW5uaW5nIG9yIHBlcmlvZCB3aXRob3V0IGluY29taW5nIGRhdGEgPiBidWZEdXJcblx0XHRcdFx0aWYoYnVmWzBdLmRhdGUgKyBkZWwgPCBub3cpIHsgLy8gcGVyaW9kIHdpdGhvdXQgaW5jb21pbmcgZGF0YSA+IGJ1ZkR1clxuXHRcdFx0XHRcdGZvcihsZXQgaT0wOyBpPGZyYW1lU2l6ZTsgaSsrKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm91dEZyYW1lW2ldID0gYnVmWzBdLmZyYW1lW2ldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLm91dHB1dCgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHRoZW4gOlxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGZvcihsZXQgaT0wOyBpPGJ1Zi5sZW5ndGgtMTsgaSsrKSB7XG5cdFx0XHRcdGxldCBsID0gYnVmW2ldLFxuXHRcdFx0XHRcdHIgPSBidWZbaSsxXTtcblx0XHRcdFx0aWYobC5kYXRlICsgZGVsIDw9IG5vdyAmJiByLmRhdGUgKyBkZWwgPiBub3cpIHtcblx0XHRcdFx0XHRsZXQgcGN0ID0gKG5vdyAtIChsLmRhdGUgKyBkZWwpKSAvIChyLmRhdGUgLSBsLmRhdGUpO1xuXHRcdFx0XHRcdGZvcihsZXQgaj0wOyBqPGZyYW1lU2l6ZTsgaisrKSB7XG5cdFx0XHRcdFx0XHR0aGlzLm91dEZyYW1lW2pdID0gbC5mcmFtZVtqXSArIChyLmZyYW1lW2pdIC0gbC5mcmFtZVtqXSkgKiBwY3Q7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMub3V0cHV0KCk7XG5cdFx0XHRcdFx0Ly8gcmVtb3ZlIHVzZWxlc3MgZnJhbWVzIDpcblx0XHRcdFx0XHRidWYuc3BsaWNlKDAsIGkpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvL2NvbnNvbGUubG9nKGJ1Zi5sZW5ndGgpO1xuXHRcdH0pO1xuXHR9XG5cblx0aW5pdGlhbGl6ZSgpIHtcblx0XHRzdXBlci5pbml0aWFsaXplKCk7XG5cdFx0dGhpcy5zdGFydCgpO1xuXHR9XG5cblx0ZmluYWxpemUoKSB7XG5cdFx0c3VwZXIuZmluYWxpemUoKTtcblx0XHR0aGlzLnN0b3AoKTtcblx0fVxuXG5cdHN0YXJ0KCkge1xuXHRcdGlmKHRoaXMucnVubmluZykgcmV0dXJuO1xuXHRcdHRoaXMucnVubmluZyA9IHRydWU7XG5cblx0XHQvLyB0aGlzLmxhc3ROb3cgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHQvLyBzZXRUaW1lb3V0KHRoaXMuZmlyZS5iaW5kKHRoaXMpLCB0aGlzLnBhcmFtcy5vdXRwdXRQZXJpb2QpO1xuXG5cdFx0dGhpcy5pbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwodGhpcy5maXJlLmJpbmQodGhpcyksIHRoaXMub3V0cHV0UGVyaW9kKTtcdH1cblxuXHRzdG9wKCkge1xuXHRcdGlmKCF0aGlzLnJ1bm5pbmcpIHJldHVybjtcblx0XHR0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcblx0XHQvL2NsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElEKTtcblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0dGhpcy5pbnB1dEJ1ZmZlci5wdXNoKHtcblx0XHRcdGRhdGU6IHBlcmZvcm1hbmNlLm5vdygpLFxuXHRcdFx0ZnJhbWU6IGZyYW1lXG5cdFx0fSk7XG5cdFx0dGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXHR9XG59IiwiaW1wb3J0ICogYXMgbGZvIGZyb20gXCJ3YXZlcy1sZm9cIjtcblxuLy8gPT09PT09PT09PT09PT09PSBwb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93ID09PT09PT09PT09PT0gLy9cbi8vIC0tPiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9wYXVsaXJpc2gvNTQzODY1MFxuXG4oZnVuY3Rpb24oKXtcblxuICBpZiAoXCJwZXJmb3JtYW5jZVwiIGluIHdpbmRvdyA9PSBmYWxzZSkge1xuICAgICAgd2luZG93LnBlcmZvcm1hbmNlID0ge307XG4gIH1cbiAgXG4gIERhdGUubm93ID0gKERhdGUubm93IHx8IGZ1bmN0aW9uICgpIHsgIC8vIHRoYW5rcyBJRThcblx0ICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH0pO1xuXG4gIGlmIChcIm5vd1wiIGluIHdpbmRvdy5wZXJmb3JtYW5jZSA9PSBmYWxzZSkge1xuICAgIFxuICAgIHZhciBub3dPZmZzZXQgPSBEYXRlLm5vdygpO1xuICAgIFxuICAgIGlmIChwZXJmb3JtYW5jZS50aW1pbmcgJiYgcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydCkge1xuICAgICAgbm93T2Zmc2V0ID0gcGVyZm9ybWFuY2UudGltaW5nLm5hdmlnYXRpb25TdGFydFxuICAgIH1cblxuICAgIHdpbmRvdy5wZXJmb3JtYW5jZS5ub3cgPSBmdW5jdGlvbiBub3coKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIG5vd09mZnNldDtcbiAgICB9XG4gIH1cblxufSkoKTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09IHJlc2FtcGxlciBsZm8gPT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXNhbXBsZXIgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdC8vZnJhbWVTaXplOiAxLFxuXHRcdFx0cGVyaW9kOiAyMFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSA9IDEwMDAgLyB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0Ly90aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG5cdFx0dGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVSYXRlID0gMTAwMCAvIHRoaXMucGFyYW1zLnBlcmlvZDtcblxuXHRcdC8vdGhpcy5mcmFtZVJhdGUgPSAxMDAwIC8gdGhpcy5wYXJhbXMucGVyaW9kO1xuXHRcdHRoaXMuaW50ZXJ2YWxJRCA9IC0xO1xuXHRcdHRoaXMudGltZSA9IDA7XG5cdFx0dGhpcy5sYXN0VGltZSA9IDA7XG5cdFx0dGhpcy5jdXJyZW50RGF0YSA9IFtdO1xuXHRcdHRoaXMuY291bnRlciA9IDA7XG5cdFx0dGhpcy5ydW5uaW5nID0gZmFsc2U7XG5cdFx0dGhpcy5uZXh0SW50ZXJ2YWw7XG5cblx0XHQvLyA9PT09PT09PT09PT0gdGhlIGNhbGxiYWNrID09PT09PT09PT09PT0gLy9cblx0XHR0aGlzLmFwcGVuZERhdGEgPSAoKCkgPT4ge1xuXHRcdFx0aWYodGhpcy5jdXJyZW50RGF0YS5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0Ly8gc2V0VGltZW91dCh0aGlzLmFwcGVuZERhdGEuYmluZCh0aGlzKSwgdGhpcy5wYXJhbXMucGVyaW9kKVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZighdGhpcy5ydW5uaW5nKSByZXR1cm47XG5cblx0XHRcdHRoaXMuY291bnRlcisrO1xuXHRcdFx0dGhpcy50aW1lID0gdGhpcy5jb3VudGVyICogdGhpcy5wYXJhbXMucGVyaW9kO1xuXHRcdFx0Ly90aGlzLnRpbWUgPSB0aGlzLmxhc3RUaW1lO1xuXHRcdFx0dGhpcy5vdXRGcmFtZS5zZXQodGhpcy5jdXJyZW50RGF0YSwgMCk7XG5cdFx0XHR0aGlzLm91dHB1dCgpO1xuXG5cdFx0XHQvLyBsZXQgbm93VGltZSA9IHBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdFx0Ly8gbGV0IGluYWNjdXJhY3kgPSAobm93VGltZSAtIHRoaXMubGFzdFRpbWUgLSB0aGlzLnBhcmFtcy5wZXJpb2QpICUgdGhpcy5wYXJhbXMucGVyaW9kO1xuXHRcdFx0Ly8gbGV0IG5leHRJbnRlcnZhbCA9IHRoaXMucGFyYW1zLnBlcmlvZCAtIGluYWNjdXJhY3k7XG5cblx0XHRcdC8vIHRoaXMub3V0RnJhbWUuc2V0KHRoaXMuY3VycmVudERhdGEsIDApO1xuXHRcdFx0Ly8gdGhpcy5vdXRwdXQoKTtcblxuXHRcdFx0Ly8gdGhpcy5sYXN0VGltZSA9IG5vd1RpbWU7XG5cdFx0XHQvLyB0aGlzLnRpbWUgKz0gbmV4dEludGVydmFsO1xuXHRcdFx0Ly8gY29uc29sZS5sb2codGhpcy50aW1lKTtcblx0XHRcdC8vIHNldFRpbWVvdXQodGhpcy5hcHBlbmREYXRhLmJpbmQodGhpcyksIG5leHRJbnRlcnZhbCk7XG5cdFx0fSk7XG5cdH1cblxuXHRpbml0aWFsaXplKHN0cmVhbVBhcmFtcyA9IHt9KSB7XG5cdFx0Ly90aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemVcblx0XHRzdXBlci5pbml0aWFsaXplKHN0cmVhbVBhcmFtcywge1xuXHRcdFx0c291cmNlU2FtcGxlUmF0ZTogdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZVxuXHRcdH0pO1xuXHRcdHRoaXMuc3RhcnQoKTtcblx0fVxuXG5cdGZpbmFsaXplKCkge1xuXHRcdHN1cGVyLmZpbmFsaXplKCk7XG5cdFx0dGhpcy5zdG9wKCk7XG5cdH1cblxuXHQvLyBUT0RPIDogSU1QUk9WRSBUSEUgQUNDVVJBQ1kgQlkgVVNJTkcgOiBzZXRUaW1lb3V0XG5cblx0c3RhcnQoKSB7XG5cdFx0aWYodGhpcy5ydW5uaW5nKSByZXR1cm47XG5cdFx0dGhpcy5ydW5uaW5nID0gdHJ1ZTtcblx0XHR0aGlzLmN1cnJlbnREYXRhID0gW107XG5cblx0XHR0aGlzLmludGVydmFsSUQgPSBzZXRJbnRlcnZhbCh0aGlzLmFwcGVuZERhdGEuYmluZCh0aGlzKSwgdGhpcy5wYXJhbXMucGVyaW9kKTtcblxuXHRcdC8vIHRoaXMubGFzdFRpbWUgPSBwZXJmb3JtYW5jZS5ub3coKTtcblx0XHQvLyB0aGlzLnRpbWUgPSB0aGlzLnBhcmFtcy5wZXJpb2Q7XG5cdFx0Ly8gc2V0VGltZW91dCh0aGlzLmFwcGVuZERhdGEuYmluZCh0aGlzKSwgdGhpcy5wYXJhbXMucGVyaW9kKTtcblx0fVxuXG5cdHN0b3AoKSB7XG5cdFx0aWYoIXRoaXMucnVubmluZykgcmV0dXJuO1xuXHRcdHRoaXMucnVubmluZyA9IGZhbHNlO1xuXHRcdC8vY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsSUQpO1xuXHR9XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHRpZih0aW1lID09PSB1bmRlZmluZWQpIHJldHVybjtcblx0XHQvL2NvbnNvbGUubG9nKHRpbWUpO1xuXHRcdHRoaXMubGFzdFRpbWUgPSB0aW1lO1xuXHRcdHRoaXMuY3VycmVudERhdGEgPSBmcmFtZTtcblx0XHR0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cdH1cbn1cbiIsIi8qXG4gKlx0bGZvLXNlbGVjdCA6IGZpbHRlcnMgdGhlIG91dHB1dCBvZiBwcmV2aW91cyBsZm9cbiAqXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICpcdHlvdSBjYW4gcGx1ZyBhbnkgbGZvIGludG8gdmFyaW91cyBsZm8tc2VsZWN0cyB0byBzcGxpdCBpdHMgb3V0cHV0XG4gKiBcdGFuZCB2aXN1YWxpemUgdGhlIHNwbGl0dGVkIG91dHB1dHMgaW4gc2VwYXJhdGUgbGZvLXNpbmtzIGZvciBleGFtcGxlXG4gKi9cblxuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdCBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGluZGV4TGlzdDogW10sXG5cdFx0XHRtb2RlOiBcImluY2x1ZGVcIiAvLyBjYW4gYmUgZXhjbHVkZSBvciBpbmNsdWRlXG5cdFx0fVxuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdC8vIHJlbW92ZSBkdXBsaWNhdGUgaW5kaWNlcyA6XG5cdFx0bGV0IGluZGV4TGlzdCA9IHRoaXMucGFyYW1zLmluZGV4TGlzdDtcblxuXHRcdGZvcihsZXQgaT0wOyBpPGluZGV4TGlzdC5sZW5ndGgtMTsgaSsrKSB7XG5cdFx0XHRmb3IobGV0IGo9aW5kZXhMaXN0Lmxlbmd0aC0xOyBqPmk7IGotLSkge1xuXHRcdFx0XHRpZihpbmRleExpc3RbaV0gPT0gaW5kZXhMaXN0W2pdKSB7XG5cdFx0XHRcdFx0aW5kZXhMaXN0LnNwbGljZShqLCAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvL2NvbnNvbGUubG9nKGluZGV4TGlzdCk7XG5cblx0fVxuXG5cdGluaXRpYWxpemUoc3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHR0aGlzLmlucHV0RnJhbWVTaXplID0gc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcblx0XHR0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLmlucHV0RnJhbWVTaXplO1xuXHRcdGlmKHRoaXMucGFyYW1zLm1vZGUgPT09IFwiZXhjbHVkZVwiKSB7XG5cdFx0XHRmb3IobGV0IGk9dGhpcy5wYXJhbXMuaW5kZXhMaXN0Lmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRcdFx0aWYodGhpcy5wYXJhbXMuaW5kZXhMaXN0W2ldIDwgdGhpcy5pbnB1dEZyYW1lU2l6ZSAmJiB0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPj0gMCkge1xuXHRcdFx0XHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZS0tO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFyYW1zLmluZGV4TGlzdC5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYodGhpcy5wYXJhbXMubW9kZSA9PT0gXCJpbmNsdWRlXCIpIHtcblx0XHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IDA7XG5cdFx0XHRmb3IobGV0IGk9dGhpcy5wYXJhbXMuaW5kZXhMaXN0Lmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRcdFx0aWYodGhpcy5wYXJhbXMuaW5kZXhMaXN0W2ldIDwgdGhpcy5pbnB1dEZyYW1lU2l6ZSAmJiB0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPj0gMCkge1xuXHRcdFx0XHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSsrO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFyYW1zLmluZGV4TGlzdC5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0c3VwZXIuaW5pdGlhbGl6ZSh0aGlzLnN0cmVhbVBhcmFtcyk7XG5cdH1cblxuXHQvLyBRVUVTVElPTiA6IGFyZSBmcmFtZS5sZW5ndGggaW4gcHJvY2VzcyBhbmQgc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSBpbiBpbml0aWFsaXplIHRoZSBzYW1lIHZhbHVlID9cblx0Ly8gb3QgaXMgc3RyZWFtUGFyYW1zIGhlcmUgdG8gYWxsb3cgc3BlY2lmaWNhdGlvbiBvZiBcImNvbHVtbnNcIiAob3IgXCJyb3dzXCIsIHdoYXRldmVyIC4uLikgP1xuXHQvLyBqdXN0IGluIGNhc2UsIGxldCdzIGtlZXAgdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUgZm9yIGNvbXBhcmlzb25cblx0Ly8gaW4gdGhpcyBjYXNlIHRoZSB0cmlja3kgb25lIHNob3VsZCBiZSBsZm8uc2xpY2VyIC0+IGhhdmUgYW5vdGhlciBsb29rIGF0IGl0XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXHRcdHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuXHRcdGlmKHRoaXMucGFyYW1zLm1vZGUgPT09IFwiZXhjbHVkZVwiKSB7XG5cdFx0XHQvLyBXUk9ORyAhISFcblx0XHRcdC8vIFdST05HICEhIVxuXHRcdFx0Ly8gRE8gTk9USElORyBGT1IgTk9XIC4uLlxuXHRcdFx0Lypcblx0XHRcdGZvcihsZXQgaT0wLCBqPTA7IGk8dGhpcy5wYXJhbXMuaW5kZXhMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdC8vIERPIFRIRSBJTlZFUlNFICEhISA9PiBsb29wIG9uIGlucHV0RnJhbWVTaXplIChha2EgZnJhbWUubGVuZ3RoKSBhbmQgdXNlIGluZGV4T2YgIVxuXHRcdFx0XHRpZih0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPCB0aGlzLmlucHV0RnJhbWVTaXplKSB7XG5cdFx0XHRcdFx0dGhpcy5vdXRGcmFtZVtqXSA9IDA7Ly9cblx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdCovXG5cdFx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLnBhcmFtcy5pbmRleExpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gZmlsbCB3aXRoIG5vbi1leGNsdWRlZCBpbmRleGVzXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmKHRoaXMucGFyYW1zLm1vZGUgPT09IFwiaW5jbHVkZVwiKSB7XG5cdFx0XHQvLyBSSUdIVCAhISFcblx0XHRcdGZvcihsZXQgaT0wOyBpPHRoaXMucGFyYW1zLmluZGV4TGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0aGlzLm91dEZyYW1lW2ldID0gMDsvL1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHsgLy8gcGFzcyBhdmVyeXRoaW5nIHRocm91Z2hcblx0XHRcdHRoaXMub3V0RnJhbWUuc2V0KGZyYW1lLCAwKTtcblx0XHR9XG5cblx0XHR0aGlzLm91dHB1dCgpO1xuXHR9XG5cbn0iLCJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuLy8gZ2V0IHRoZSBpbnZlcnNlX2NvdmFyaWFuY2VzIG1hdHJpeCBvZiBlYWNoIG9mIHRoZSBHTU0gY2xhc3Nlc1xuXG4vLyBmb3IgZWFjaCBpbnB1dCBkYXRhLCBjb21wdXRlIHRoZSBkaXN0YW5jZSBvZiB0aGUgZnJhbWUgdG8gZWFjaCBvZiB0aGUgR01Nc1xuLy8gd2l0aCB0aGUgZm9sbG93aW5nIGVxdWF0aW9ucyA6XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gYXMgaW4geG1tR2F1c3NpYW5EaXN0cmlidXRpb24uY3BwIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuY29uc3QgY29tcG9uZW50TGlrZWxpaG9vZCA9IChjb21wb25lbnQsIG9ic2VydmF0aW9uKSA9PiB7XG5cdGxldCBldWNsaWRpYW5EaXN0YW5jZSA9IDAuMDtcblx0Zm9yKGxldCBsID0gMDsgbCA8IGNvbXBvbmVudC5kaW1lbnNpb247IGwrKykge1xuXHRcdGxldCB0bXAgPSAwLjA7XG5cdFx0Zm9yKGxldCBrPSAwOyBrIDwgY29tcG9uZW50LmRpbWVuc2lvbjsgaysrKSB7XG5cdFx0XHR0bXAgKz0gY29tcG9uZW50LmludmVyc2VfY292YXJpYW5jZVtsICogY29tcG9uZW50LmRpbWVuc2lvbiArIGtdICogKG9ic2VydmF0aW9uW2tdIC0gY29tcG9uZW50Lm1lYW5ba10pO1xuXHRcdH1cblx0XHRldWNsaWRpYW5EaXN0YW5jZSArPSAob2JzZXJ2YXRpb25bbF0gLSBjb21wb25lbnQubWVhbltsXSkgKiB0bXA7XG5cdH1cblx0bGV0IHAgPSBNYXRoLmV4cCgtMC41ICogZXVjbGlkaWFuRGlzdGFuY2UpIC8gTWF0aC5zcXJ0KGNvbXBvbmVudC5jb3ZhcmlhbmNlX2RldGVybWluYW50ICogTWF0aC5wb3coMiAqIE1hdGguUEksIGNvbXBvbmVudC5kaW1lbnNpb24pKTtcblxuXHRpZiggcCA8IDFlLTE4MCB8fCBpc05hTihwKSB8fCBpc05hTihNYXRoLmFicyhwKSkpIHtcblx0XHRwID0gMWUtMTgwO1xuXHR9XG5cdHJldHVybiBwO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgICBhcyBpbiB4bW1HbW1TaW5nbGVDbGFzcy5jcHAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG4vLyAtPiBpbiBvYnNQcm9iLCBjYWxsZWQgZnJvbSBsaWtlbGlob29kLCBjYWxsZWQgZnJvbSBmaWx0ZXIsIGNhbGxlZCBmcm9tIEdNTTo6ZmlsdGVyXG5cbmNvbnN0IGxpa2VsaWhvb2QgPSAob2JzZXJ2YXRpb24sIHNpbmdsZUNsYXNzTW9kZWwsIHNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzKSA9PiB7XG5cdGxldCBjb2VmZnMgPSBzaW5nbGVDbGFzc01vZGVsLm1peHR1cmVfY29lZmZzO1xuXHRsZXQgY29tcG9uZW50cyA9IHNpbmdsZUNsYXNzTW9kZWwuY29tcG9uZW50cztcblx0bGV0IHJlcyA9IHNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzO1xuXHRsZXQgcCA9IDA7XG5cblx0Zm9yKGxldCBjID0gMDsgYyA8IGNvZWZmcy5sZW5ndGg7IGMrKykge1xuXHRcdHAgKz0gY29lZmZzW2NdICogY29tcG9uZW50TGlrZWxpaG9vZChjb21wb25lbnRzW2NdLCBvYnNlcnZhdGlvbik7XG5cdH1cblxuXHRyZXMuaW5zdGFudF9saWtlbGlob29kID0gcDtcblx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyLnVuc2hpZnQocCk7XG5cdHJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGgtLTtcblx0cmVzLmxvZ19saWtlbGlob29kID0gcmVzLmxpa2VsaWhvb2RfYnVmZmVyLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApIC8vIHN1bSBvZiBhbGwgYXJyYXkgdmFsdWVzXG5cdHJlcy5sb2dfbGlrZWxpaG9vZCAvPSByZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgICAgICAgICBhcyBpbiB4bW1HbW0uY3BwICAgICAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5jb25zdCBsaWtlbGlob29kcyA9IChvYnNlcnZhdGlvbiwgbW9kZWwsIG1vZGVsUmVzdWx0cykgPT4ge1xuXHRsZXQgbGlrZWxpaG9vZHMgPSBbXTtcblx0bGV0IG1vZGVscyA9IG1vZGVsLm1vZGVscztcblx0bGV0IHJlcyA9IG1vZGVsUmVzdWx0cztcblxuXHRsZXQgbWF4TG9nTGlrZWxpaG9vZCA9IDA7XG5cdGxldCBub3JtQ29uc3RJbnN0YW50ID0gMDtcblx0bGV0IG5vcm1Db25zdFNtb290aGVkID0gMDtcblxuXHRmb3IobGV0IGk9MDsgaTxtb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdGxldCBzaW5nbGVSZXN1bHRzID0gbW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzW2ldO1xuXHRcdGxpa2VsaWhvb2Qob2JzZXJ2YXRpb24sIG1vZGVsLm1vZGVsc1tpXSwgc2luZ2xlUmVzdWx0cyk7XG5cblx0XHRyZXMuaW5zdGFudF9saWtlbGlob29kc1tpXSA9IHNpbmdsZVJlc3VsdHMuaW5zdGFudF9saWtlbGlob29kO1xuXHRcdHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPSBzaW5nbGVSZXN1bHRzLmxvZ19saWtlbGlob29kO1xuXHRcdHJlcy5zbW9vdGhlZF9saWtlbGlob29kc1tpXSA9IE1hdGguZXhwKHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0pO1xuXHRcdHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSByZXMuaW5zdGFudF9saWtlbGlob29kc1tpXTtcblx0XHRyZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IHJlcy5zbW9vdGhlZF9saWtlbGlob29kc1tpXTtcblxuXHRcdG5vcm1Db25zdEluc3RhbnQgKz0gcmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblx0XHRub3JtQ29uc3RTbW9vdGhlZCArPSByZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblxuXHRcdGlmKGkgPT0gMCB8fCByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID4gbWF4TG9nTGlrZWxpaG9vZCkge1xuXHRcdFx0bWF4TG9nTGlrZWxpaG9vZCA9IHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV07XG5cdFx0XHRyZXMubGlrZWxpZXN0ID0gaTtcblx0XHR9XG5cdH1cblxuXHRmb3IobGV0IGk9MDsgaTxtb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gLz0gbm9ybUNvbnN0SW5zdGFudDtcblx0XHRyZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSAvPSBub3JtQ29uc3RTbW9vdGhlZDtcblx0fVxufTtcblxuLy8gVE9ETyA6IGFkZCByZXNldCgpIGZ1bmN0aW9uIChlbXB0eSBsaWtlbGlob29kX2J1ZmZlcilcblxuLy89PT09PT09PT09PT09PT09PT09IFRIRSBFWFBPUlRFRCBDTEFTUyA9PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWG1tR21tRGVjb2RlciBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGxpa2VsaWhvb2RXaW5kb3c6IDUsXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubW9kZWxSZXN1bHRzID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubGlrZWxpaG9vZFdpbmRvdyA9IHRoaXMucGFyYW1zLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0Ly8gb3JpZ2luYWwgeG1tIG1vZGVsUmVzdWx0cyBmaWVsZHMgOlxuXHRcdC8vIGluc3RhbnRMaWtlbGlob29kcywgaW5zdGFudE5vcm1hbGl6ZWRMaWtlbGlob29kcyxcblx0XHQvLyBzbW9vdGhlZExpa2VsaWhvb2RzLCBzbW9vdGhlZE5vcm1hbGl6ZWRMaWtlbGlob29kcyxcblx0XHQvLyBzbW9vdGhlZExvZ0xpa2VsaWhvb2RzLCBsaWtlbGllc3QsIG91dHB1dFZhbHVlcywgb3V0cHV0VmFyaWFuY2Vcblx0fVxuXG5cdGdldCBsaWtlbGllc3RMYWJlbCgpIHtcblx0XHRpZih0aGlzLm1vZGVsUmVzdWx0cyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsUmVzdWx0cy5saWtlbGllc3QgPiAtMSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5tb2RlbC5tb2RlbHNbdGhpcy5tb2RlbFJlc3VsdHMubGlrZWxpZXN0XS5sYWJlbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuICd1bmtub3duJztcblx0XHQvL3JldHVybignbm8gZXN0aW1hdGlvbiBhdmFpbGFibGUnKTtcblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cblx0XHQvL2luY29taW5nIGZyYW1lIGlzIG9ic2VydmF0aW9uIHZlY3RvclxuXHRcdGlmKHRoaXMubW9kZWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJubyBtb2RlbCBsb2FkZWRcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy50aW1lID0gdGltZTtcblx0XHR0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cblx0XHRjb25zdCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG5cblx0XHRsaWtlbGlob29kcyhmcmFtZSwgdGhpcy5tb2RlbCwgdGhpcy5tb2RlbFJlc3VsdHMpO1x0XHRcdFxuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG91dEZyYW1lW2ldID0gdGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblx0XHR9XG5cblx0XHR0aGlzLm91dHB1dCgpO1xuXHR9XG5cblx0c2V0TW9kZWwobW9kZWwpIHtcblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMubW9kZWxSZXN1bHRzID0gdW5kZWZpbmVkO1xuXG5cdFx0Ly8gdGVzdCBpZiBtb2RlbCBpcyB2YWxpZCBoZXJlIChUT0RPIDogd3JpdGUgYSBiZXR0ZXIgdGVzdClcblx0XHRpZihtb2RlbC5tb2RlbHMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5tb2RlbCA9IG1vZGVsO1xuXHRcdFx0bGV0IG5tb2RlbHMgPSBtb2RlbC5tb2RlbHMubGVuZ3RoO1xuXHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMgPSB7XG5cdFx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGxpa2VsaWVzdDogLTEsXG5cdFx0XHRcdHNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8bW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuaW5zdGFudF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cblx0XHRcdFx0bGV0IHJlcyA9IHt9O1xuXHRcdFx0XHRyZXMuaW5zdGFudF9saWtlbGlob29kID0gMDtcblx0XHRcdFx0cmVzLmxvZ19saWtlbGlob29kID0gMDtcblx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyID0gW107XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGggPSB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRcdGZvcihsZXQgaj0wOyBqPHRoaXMubGlrZWxpaG9vZFdpbmRvdzsgaisrKSB7XG5cdFx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyW2pdID0gMSAvIHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc01vZGVsUmVzdWx0cy5wdXNoKHJlcyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5pbml0aWFsaXplKHsgZnJhbWVTaXplOiB0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGggfSk7XG5cdH1cblxuXHRzZXRMaWtlbGlob29kV2luZG93KG5ld1dpbmRvd1NpemUpIHtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSBuZXdXaW5kb3dTaXplO1xuXHRcdGlmKHRoaXMubW9kZWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXHRcdGxldCByZXMgPSB0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc01vZGVsUmVzdWx0cztcblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cmVzW2ldLmxpa2VsaWhvb2RfYnVmZmVyID0gW107XG5cdFx0XHRyZXNbaV0ubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoID0gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0Zm9yKGxldCBqPTA7IGo8dGhpcy5saWtlbGlob29kV2luZG93OyBqKyspIHtcblx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyW2pdID0gMSAvIHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRzZXRWYXJpYW5jZU9mZnNldCgpIHtcblx0XHQvLyBub3QgdXNlZCBmb3Igbm93IChuZWVkIHRvIGltcGxlbWVudCB1cGRhdGVJbnZlcnNlQ292YXJpYW5jZSBtZXRob2QpXG5cdH1cbn07XG4iLCJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcbmltcG9ydCB7Z21tTGlrZWxpaG9vZCxcblx0XHRobW1VcGRhdGVBbHBoYVdpbmRvdyxcblx0XHRobW1VcGRhdGVSZXN1bHRzLFxuXHRcdGhobW1MaWtlbGlob29kQWxwaGF9IGZyb20gJy4veG1tLWRlY29kZXItY29tbW9uJztcblxuLy8gc2ltcGxpZmllZCBkZWNvZGluZyBhbGdvcml0aG0gOlxuLy9cbi8vIGlmKCFmb3J3YXJkX2luaXQpXG4vLyBcdFx0Zm9yd2FyZF9pbml0KG9icyk7XG4vLyBlbHNlXG4vLyBcdFx0Zm9yd2FyZF91cGRhdGUob2JzKTtcbi8vXG4vLyBmb3IobW9kZWwgaW4gbW9kZWxzKVxuLy8gXHRcdG1vZGVsLnVwZGF0ZUFscGhhV2luZG93KCk7XG4vLyBcdFx0bW9kZWwudXBkYXRlUmVzdWx0cygpO1xuLy9cbi8vIHVwZGF0ZVJlc3VsdHMoKTtcblxuLy8gQSB1dGlsaXNlciBkZSB4bW0tZGVjb2Rlci1jb21tb24gOlxuLy8gLSBnYXVzc2lhbkNvbXBvbmVudExpa2VsaWhvb2Rcbi8vIC0gZ21tTGlrZWxpaG9vZCAod2hpY2ggdXNlcyBnYXVzc2lhbkNvbXBvbmVudExpa2VsaWhvb2QpXG4vLyAtIG5vdCBnbW1MaWtlbGlob29kcywgYXMgaXQncyB0aGUgY2xhc3NpZnlpbmcgcGFydCBvZiBHTU1cblxuLy8gV2hpY2ggZGVjb2RlciBwYXJhbWV0ZXJzID9cbi8vIHNldExpa2VsaWhvb2RXaW5kb3cgP1xuLy8gb3RoZXIgc21vb3RoaW5nIHdpbmRvd3MgP1xuLy8gZXhpdCBwcm9iYWJpbGl0aWVzID9cbi8vIC4uLlxuXG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBYbW1IaG1tRGVjb2RlciBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0bGlrZWxpaG9vZFdpbmRvdzogNSxcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMubW9kZWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5tb2RlbFJlc3VsdHMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5saWtlbGlob29kV2luZG93ID0gdGhpcy5wYXJhbXMubGlrZWxpaG9vZFdpbmRvdztcblx0fVxuXG5cdGdldCBsaWtlbGllc3RMYWJlbCgpIHtcblx0XHRpZih0aGlzLm1vZGVsUmVzdWx0cyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRpZih0aGlzLm1vZGVsUmVzdWx0cy5saWtlbGllc3QgPiAtMSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5tb2RlbC5tb2RlbHNbdGhpcy5tb2RlbFJlc3VsdHMubGlrZWxpZXN0XS5sYWJlbDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuICd1bmtub3duJztcblx0XHQvL3JldHVybignbm8gZXN0aW1hdGlvbiBhdmFpbGFibGUnKTtcblx0fVxuXG5cblx0Ly89PT09PT09PT09PT09PT09IHByb2Nlc3MgZnJhbWUgPT09PT09PT09PT09PT09PT0vL1xuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cblx0XHQvL2luY29taW5nIGZyYW1lIGlzIG9ic2VydmF0aW9uIHZlY3RvclxuXHRcdGlmKHRoaXMubW9kZWwgPT09IHVuZGVmaW5lZCB8fCB0aGlzLm1vZGVsUmVzdWx0cyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwibm8gbW9kZWwgbG9hZGVkXCIpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXG5cdFx0dGhpcy50aW1lID0gdGltZTtcblx0XHR0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cblx0XHRjb25zdCBvdXRGcmFtZSA9IHRoaXMub3V0RnJhbWU7XG5cblx0XHRpZih0aGlzLmZvcndhcmRfaW5pdGlhbGl6ZWQpIHtcblx0XHRcdHRoaXMuZm9yd2FyZFVwZGF0ZShmcmFtZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZm9yd2FyZEluaXQoZnJhbWUpO1xuXHRcdH1cblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRobW1VcGRhdGVBbHBoYVdpbmRvdyh0aGlzLm1vZGVsLm1vZGVsc1tpXSwgdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0pO1xuXHRcdFx0aG1tVXBkYXRlUmVzdWx0cyh0aGlzLm1vZGVsLm1vZGVsc1tpXSwgdGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0pO1xuXHRcdH1cblxuXHRcdHRoaXMudXBkYXRlUmVzdWx0cygpO1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdG91dEZyYW1lW2ldID0gdGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblx0XHR9XG5cblx0XHR0aGlzLm91dHB1dCgpO1xuXHR9XG5cdFx0XG5cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT0gbG9hZCBtb2RlbCBmcm9tIGpzb24gPT09PT09PT09PT09PT09PT09PT09PS8vXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0XG5cdHNldE1vZGVsKG1vZGVsKSB7XHRcdFxuXG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLm1vZGVsUmVzdWx0cyA9IHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlc3QgaWYgbW9kZWwgaXMgdmFsaWQgaGVyZSAoVE9ETyA6IHdyaXRlIGEgYmV0dGVyIHRlc3QpXG5cdFx0aWYobW9kZWwubW9kZWxzICE9PSB1bmRlZmluZWQpIHtcblxuXHRcdFx0dGhpcy5tb2RlbCA9IG1vZGVsO1xuXHRcdFx0bGV0IG5tb2RlbHMgPSBtb2RlbC5tb2RlbHMubGVuZ3RoO1xuXG5cdFx0XHRsZXQgbnN0YXRlc0dsb2JhbCA9IG1vZGVsLmNvbmZpZ3VyYXRpb24uZGVmYXVsdF9wYXJhbWV0ZXJzLnN0YXRlcztcblx0XHRcdHRoaXMucGFyYW1zLmZyYW1lU2l6ZSA9IG5zdGF0ZXNHbG9iYWw7XG5cblx0XHRcdHRoaXMucHJpb3IgPSBuZXcgQXJyYXkobm1vZGVscyk7XG5cdFx0XHR0aGlzLmV4aXRfdHJhbnNpdGlvbiA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdHRoaXMudHJhbnNpdGlvbiA9IG5ldyBBcnJheShubW9kZWxzKTtcblx0XHRcdGZvcihsZXQgaT0wOyBpPG5tb2RlbHM7IGkrKykge1xuXHRcdFx0XHR0aGlzLnRyYW5zaXRpb25baV0gPSBuZXcgQXJyYXkobm1vZGVscyk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmZyb250aWVyX3YxID0gbmV3IEFycmF5KG5zdGF0ZXNHbG9iYWwpO1xuXHRcdFx0dGhpcy5mcm9udGllcl92MiA9IG5ldyBBcnJheShuc3RhdGVzR2xvYmFsKTtcblx0XHRcdHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCA9IGZhbHNlO1xuXHRcdFx0Ly90aGlzLnJlc3VsdHMgPSB7fTtcblxuXHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMgPSB7XG5cdFx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0c21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGxpa2VsaWVzdDogLTEsXG5cdFx0XHRcdHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8bm1vZGVsczsgaSsrKSB7XG5cblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuaW5zdGFudF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cblx0XHRcdFx0bGV0IG5zdGF0ZXMgPSB0aGlzLm1vZGVsLm1vZGVsc1tpXS5wYXJhbWV0ZXJzLnN0YXRlcztcblxuXHRcdFx0XHRsZXQgYWxwaGFfaCA9IG5ldyBBcnJheSgzKTtcblx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8MzsgaisrKSB7XG5cdFx0XHRcdFx0YWxwaGFfaFtqXSA9IG5ldyBBcnJheShuc3RhdGVzKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCBobW1SZXMgPSB7XG5cdFx0XHRcdFx0aW5zdGFudF9saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdGxvZ19saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdGxpa2VsaWhvb2RfYnVmZmVyOiBbXSxcblx0XHRcdFx0XHRwcm9ncmVzczogMCxcblxuXHRcdFx0XHRcdC8vIG5ldmVyIHVzZWQgPyAtPiBjaGVjayB4bW0gY3BwXG5cdFx0XHRcdFx0ZXhpdF9saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdGV4aXRfcmF0aW86IDAsXG5cblx0XHRcdFx0XHRsaWtlbGllc3Rfc3RhdGU6IC0xLFxuXG5cdFx0XHRcdFx0Ly9hbHBoYTogbmV3IEFycmF5KG5zdGF0ZXMpLCBcdC8vIGZvciBub24taGllcmFyY2hpY2FsXG5cdFx0XHRcdFx0YWxwaGFfaDogYWxwaGFfaCxcdFx0XHRcdC8vIGZvciBoaWVyYXJjaGljYWxcblx0XHRcdFx0XHRwcmlvcjogbmV3IEFycmF5KG5zdGF0ZXMpLFxuXHRcdFx0XHRcdHRyYW5zaXRpb246IG5ldyBBcnJheShuc3RhdGVzKSxcblxuXHRcdFx0XHRcdC8vIHVzZWQgaW4gaG1tVXBkYXRlQWxwaGFXaW5kb3dcblx0XHRcdFx0XHR3aW5kb3dfbWluaW5kZXg6IDAsXG5cdFx0XHRcdFx0d2luZG93X21heGluZGV4OiAwLFxuXHRcdFx0XHRcdHdpbmRvd19ub3JtYWxpemF0aW9uX2NvbnN0YW50OiAwLFxuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdHNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzOiBbXVx0Ly8gc3RhdGVzXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Ly8gQUREIElORElWSURVQUwgU1RBVEVTIChHTU1zKVxuXHRcdFx0XHRmb3IobGV0IGo9MDsgajxuc3RhdGVzOyBqKyspIHtcblx0XHRcdFx0XHRsZXQgZ21tUmVzID0ge1xuXHRcdFx0XHRcdFx0aW5zdGFudF9saWtlbGlob29kOiAwLFxuXHRcdFx0XHRcdFx0Ly8gbG9nX2xpa2VsaWhvb2Q6IDAsXG5cdFx0XHRcdFx0XHQvLyBUT0RPIDogYWRkIHNhbWUgZmllbGRzIGFzIGluIEdtbURlY29kZXIgPz8/P1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRobW1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHMucHVzaChnbW1SZXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMucHVzaChobW1SZXMpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplID0gdGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoO1xuXHRcdHRoaXMuaW5pdGlhbGl6ZSh7IGZyYW1lU2l6ZTogdGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoIH0pO1xuXHRcdGNvbnNvbGUubG9nKHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSk7XG5cdH1cblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUkVTRVQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuXHRyZXNldCgpIHtcblx0XHR0aGlzLmZvcndhcmRfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09IEZPUldBUkQgSU5JVCA9PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cblx0Zm9yd2FyZEluaXQob2JzZXJ2YXRpb24pIHtcblx0XHRsZXQgbm9ybV9jb25zdCA9IDA7XG5cdFx0Ly9sZXQgbW9kZWxJbmRleCA9IDA7XG5cblx0XHQvLz09PT09PT09PT09PT09PT09IElOSVRJQUxJWkUgQUxQSEEgVkFSSUFCTEVTID09PT09PT09PT09PT09PT09Ly9cblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGxldCBtID0gdGhpcy5tb2RlbC5tb2RlbHNbaV07XG5cdFx0XHRsZXQgbnN0YXRlcyA9IG0ucGFyYW1ldGVycy5zdGF0ZXM7XG5cdFx0XHRsZXQgbVJlcyA9IHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldO1xuXG5cdFx0XHRmb3IobGV0IGo9MDsgajwzOyBqKyspIHtcblx0XHRcdFx0bVJlcy5hbHBoYV9oW2pdID0gbmV3IEFycmF5KG5zdGF0ZXMpO1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRtUmVzLmFscGhhX2hbal1ba10gPSAwO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmKG0ucGFyYW1ldGVycy50cmFuc2l0aW9uX21vZGUgPT0gMCkgeyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vIGVyZ29kaWNcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0bVJlcy5hbHBoYV9oWzBdW2tdID0gbVJlcy5wcmlvcltrXSAqIGdtbUxpa2VsaWhvb2Qob2JzZXJ2YXRpb24sIG0uc3RhdGVzW2tdLCBtUmVzLnNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzW2tdKTsgLy8gc2VlIGhvdyBvYnNQcm9iIGlzIGltcGxlbWVudGVkXG5cdFx0XHRcdFx0bVJlcy5pbnN0YW50X2xpa2VsaWhvb2QgKz0gbVJlcy5hbHBoYVswXVtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHsgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gbGVmdC1yaWdodFxuXHRcdFx0XHRtUmVzLmFscGhhX2hbMF1bMF0gPSB0aGlzLm1vZGVsLnByaW9yW2ldO1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbMF1bMF0gKj0gZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbS5zdGF0ZXNbMF0sIG1SZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHNbMF0pO1xuXHRcdFx0XHRtUmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IG1SZXMuYWxwaGFfaFswXVswXTtcblx0XHRcdH1cblx0XHRcdG5vcm1fY29uc3QgKz0gbVJlcy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0fVxuXG5cdFx0Ly89PT09PT09PT09PT09PT09PT0gTk9STUFMSVpFIEFMUEhBIFZBUklBQkxFUyA9PT09PT09PT09PT09PT09PS8vXG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0XHRsZXQgbnN0YXRlcyA9IHRoaXMubW9kZWwubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzO1xuXHRcdFx0Zm9yKGxldCBlPTA7IGU8MzsgZSsrKSB7XG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldLmFscGhhX2hbZV1ba10gLz0gbm9ybV9jb25zdDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuZm9yd2FyZF9pbml0aWFsaXplZCA9IHRydWU7XG5cdH1cblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT09IEZPUldBUkQgVVBEQVRFID09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdGZvcndhcmRVcGRhdGUob2JzZXJ2YXRpb24pIHtcblx0XHRsZXQgbm9ybV9jb25zdCA9IDA7XG5cdFx0bGV0IHRtcCA9IDA7XG5cdFx0bGV0IGZyb250OyAvLyBhcnJheVxuXG5cdFx0aGhtbUxpa2VsaWhvb2RBbHBoYSgxLCB0aGlzLmZyb250aWVyX3YxLCB0aGlzLm1vZGVsLCB0aGlzLm1vZGVsUmVzdWx0cyk7XG5cdFx0aGhtbUxpa2VsaWhvb2RBbHBoYSgyLCB0aGlzLmZyb250aWVyX3YyLCB0aGlzLm1vZGVsLCB0aGlzLm1vZGVsUmVzdWx0cyk7XG5cblx0XHQvLyBsZXQgbnVtX2NsYXNzZXMgPSBcblx0XHQvLyBsZXQgZHN0TW9kZWxJbmRleCA9IDA7XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0XHRsZXQgbSA9IHRoaXMubW9kZWwubW9kZWxzW2ldO1xuXHRcdFx0bGV0IG5zdGF0ZXMgPSBtLnBhcmFtZXRlcnMuc3RhdGVzO1xuXHRcdFx0bGV0IG1SZXMgPSB0aGlzLm1vZGVsUmVzdWx0cy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXTtcblx0XHRcdFxuXHRcdFx0Ly89PT09PT09PT09PT09IENPTVBVVEUgRlJPTlRJRVIgVkFSSUFCTEUgPT09PT09PT09PT09Ly9cblxuXHRcdFx0ZnJvbnQgPSBuZXcgQXJyYXkobnN0YXRlcyk7XG5cdFx0XHRmb3IobGV0IGo9MDsgajxuc3RhdGVzOyBqKyspIHtcblx0XHRcdFx0ZnJvbnRbal0gPSAwO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihtLnBhcmFtZXRlcnMudHJhbnNpdGlvbl9tb2RlID09IDApIHsgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLyBlcmdvZGljXG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdGZvcihsZXQgaj0wOyBqPG5zdGF0ZXM7IGorKykge1xuXHRcdFx0XHRcdFx0ZnJvbnRba10gKz0gbS50cmFuc2l0aW9uW2ogKiBuc3RhdGVzICsga10gL1xuXHRcdFx0XHRcdFx0XHRcdFx0KDEgLSBtLmV4aXRQcm9iYWJpbGl0aWVzW2pdKSAqXG5cdFx0XHRcdFx0XHRcdFx0XHRtUmVzLmFscGhhX2hbMF1bal07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGZvcihsZXQgc3JjaT0wOyBzcmNpPG5zdGF0ZXM7IHNyY2krKykge1xuXHRcdFx0XHRcdFx0ZnJvbnRba10gKz0gbVJlcy5wcmlvcltrXSAqXG5cdFx0XHRcdFx0XHRcdFx0XHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZnJvbnRpZXJfdjFbc3JjaV0gKiB0aGlzLnRyYW5zaXRpb25bc3JjaV1baV0gK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLnByaW9yW2ldICogdGhpcy5mcm9udGllcl92MltzcmNpXVxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7IC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8gbGVmdC1yaWdodFxuXG5cdFx0XHRcdC8vIGsgPT0gMCA6IGZpcnN0IHN0YXRlIG9mIHRoZSBwcmltaXRpdmVcblx0XHRcdFx0ZnJvbnRbMF0gPSBtUmVzLnRyYW5zaXRpb25bMF0gKiBtUmVzLmFscGhhX2hbMF1bMF07XG5cblx0XHRcdFx0Zm9yKGxldCBzcmNpPTA7IHNyY2k8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBzcmNpKyspIHtcblx0XHRcdFx0XHRmcm9udFswXSArPSB0aGlzLmZyb250aWVyX3YxW3NyY2ldICogdGhpcy50cmFuc2l0aW9uW3NyY2ldW2ldICtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLnByaW9yW2ldICogdGhpcy5mcm9udGllcl92MltzcmNpXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIGsgPiAwIDogcmVzdCBvZiB0aGUgcHJpbWl0aXZlXG5cdFx0XHRcdGZvcihsZXQgaz0xOyBrPG5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdGZyb250W2tdICs9IG0udHJhbnNpdGlvbltrICogMl0gL1xuXHRcdFx0XHRcdFx0XHRcdCgxIC0gbS5leGl0UHJvYmFiaWxpdGllc1trXSkgKlxuXHRcdFx0XHRcdFx0XHRcdG1SZXMuYWxwaGFfaFswXVtrXTtcblx0XHRcdFx0XHRmcm9udFtrXSArPSBtLnRyYW5zaXRpb25bKGsgLSAxKSAqIDIgKyAxXSAvXG5cdFx0XHRcdFx0XHRcdFx0KDEgLSBtLmV4aXRQcm9iYWJpbGl0aWVzW2sgLSAxXSkgKlxuXHRcdFx0XHRcdFx0XHRcdG1SZXMuYWxwaGFfaFswXVtrIC0gMV07XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRmb3IobGV0IGo9MDsgajwzOyBqKyspIHtcblx0XHRcdFx0XHRmb3IobGV0IGs9MDsgazxuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRcdG1SZXMuYWxwaGFfaFtqXVtrXSA9IDA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vPT09PT09PT09PT09PT0gVVBEQVRFIEZPUldBUkQgVkFSSUFCTEUgPT09PT09PT09PT09PS8vXG5cblx0XHRcdG1SZXMuZXhpdF9saWtlbGlob29kID0gMDtcblx0XHRcdG1SZXMuaW5zdGFudF9saWtlbGlob29kID0gMDtcblxuXHRcdFx0Zm9yKGxldCBrPTA7IGs8bnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdHRtcCA9IGdtbUxpa2VsaWhvb2Qob2JzZXJ2YXRpb24sIG0uc3RhdGVzW2tdLCBtUmVzLnNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzW2tdKSAqIGZyb250W2tdO1xuXG5cdFx0XHRcdG1SZXMuYWxwaGFfaFsyXVtrXSA9IHRoaXMuZXhpdF90cmFuc2l0aW9uW2ldICogbS5leGl0UHJvYmFiaWxpdGllc1trXSAqIHRtcDtcblx0XHRcdFx0bVJlcy5hbHBoYV9oWzFdW2tdID0gKDEgLSB0aGlzLmV4aXRfdHJhbnNpdGlvbltpXSkgKiBtLmV4aXRQcm9iYWJpbGl0aWVzW2tdICogdG1wO1xuXHRcdFx0XHRtUmVzLmFscGhhX2hbMF1ba10gPSAoMSAtIG0uZXhpdFByb2JhYmlsaXRpZXNba10pICogdG1wO1xuXG5cdFx0XHRcdG1SZXMuZXhpdF9saWtlbGlob29kIFx0Kz0gbVJlcy5hbHBoYV9oWzFdW2tdICsgbVJlcy5hbHBoYV9oWzJdW2tdO1xuXHRcdFx0XHRtUmVzLmluc3RhbnRfbGlrZWxpaG9vZCArPSBtUmVzLmFscGhhX2hbMF1ba10gKyBtUmVzLmFscGhhX2hbMV1ba10gKyBtUmVzLmFscGhhX2hbMl1ba107XG5cdFx0XHR9XG5cblx0XHRcdG1SZXMuZXhpdF9yYXRpbyA9IG1SZXMuZXhpdF9saWtlbGlob29kIC8gbVJlcy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0fVxuXG5cdFx0Ly89PT09PT09PT09PT09PSBOT1JNQUxJWkUgQUxQSEEgVkFSSUFCTEVTID09PT09PT09PT09PT0vL1xuXG5cdFx0Zm9yKGxldCBpPTA7IGk8dGhpcy5tb2RlbC5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGZvcihsZXQgZT0wOyBlPDM7IGUrKykge1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazx0aGlzLm1vZGVsLm1vZGVsc1tpXS5wYXJhbWV0ZXJzLnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0dGhpcy5tb2RlbFJlc3VsdHMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFtlXVtrXSAvPSBub3JtX2NvbnN0O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly89PT09PT09PT09PT09PT09PT09PT09IFVQREFURSBSRVNVTFRTID09PT09PT09PT09PT09PT09PT09Ly9cblxuXHR1cGRhdGVSZXN1bHRzKCkge1xuXHRcdGxldCBtYXhsb2dfbGlrZWxpaG9vZCA9IDA7XG5cdFx0bGV0IG5vcm1jb25zdF9pbnN0YW50ID0gMDtcblx0XHRsZXQgbm9ybWNvbnN0X3Ntb290aGVkID0gMDtcblxuXHRcdGxldCByZXMgPSB0aGlzLm1vZGVsUmVzdWx0cztcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdGxldCBobW1SZXMgPSByZXMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV07XG5cblx0XHRcdHJlcy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldIFx0XHQ9IGhtbVJlcy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0XHRyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID0gaG1tUmVzLmxvZ19saWtlbGlob29kO1xuXHRcdFx0cmVzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldIFx0PSBNYXRoLmV4cChyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldKTtcblxuXHRcdFx0cmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSBcdD0gcmVzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV07XG5cdFx0XHRyZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSBcdD0gcmVzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldO1xuXG5cdFx0XHRub3JtY29uc3RfaW5zdGFudCBcdCs9IHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cdFx0XHRub3JtY29uc3Rfc21vb3RoZWQgXHQrPSByZXMuc21vb3RoZWRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXTtcblxuXHRcdFx0aWYoaT09MCB8fCByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID4gbWF4bG9nX2xpa2VsaWhvb2QpIHtcblx0XHRcdFx0bWF4bG9nX2xpa2VsaWhvb2QgPSByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldO1xuXHRcdFx0XHRyZXMubGlrZWxpZXN0ID0gaTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSBcdC89IG5vcm1jb25zdF9pbnN0YW50O1xuXHRcdFx0cmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gXHQvPSBub3JtY29uc3Rfc21vb3RoZWQ7XG5cdFx0fVxuXHR9XG59XG5cbi8qXG5cdHNldExpa2VsaWhvb2RXaW5kb3cobmV3V2luZG93U2l6ZSkge1xuXHRcdHRoaXMubGlrZWxpaG9vZFdpbmRvdyA9IG5ld1dpbmRvd1NpemU7XG5cdFx0aWYodGhpcy5tb2RlbCA9PT0gdW5kZWZpbmVkKSByZXR1cm47XG5cdFx0bGV0IHJlcyA9IHRoaXMubW9kZWxSZXN1bHRzLnNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzO1xuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRyZXNbaV0ubGlrZWxpaG9vZF9idWZmZXIgPSBbXTtcblx0XHRcdHJlc1tpXS5saWtlbGlob29kX2J1ZmZlci5sZW5ndGggPSB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRmb3IobGV0IGo9MDsgajx0aGlzLmxpa2VsaWhvb2RXaW5kb3c7IGorKykge1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXJbal0gPSAxIC8gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHNldFZhcmlhbmNlT2Zmc2V0KCkge1xuXHRcdC8vIG5vdCB1c2VkIGZvciBub3cgKG5lZWQgdG8gaW1wbGVtZW50IHVwZGF0ZUludmVyc2VDb3ZhcmlhbmNlIG1ldGhvZCkuXG5cdFx0Ly8gbm93IGFjY2Vzc2libGUgYXMgdHJhaW5pbmcgcGFyYW1ldGVyIG9mIHRoZSBjaGlsZCBwcm9jZXNzLlxuXHR9XG5cbi8vKi9cbiIsIi8qXG4gKlx0eG1tIGRlY29kZXJcbiAqXHRqcyBwb3J0IG9mIHRoZSBkZWNvZGluZyBwYXJ0IG9mIFhNTVxuICpcdGFsbG93cyB0byBmaWx0ZXIgaW5wdXQgZGF0YSBmcm9tIHRyYWluZWQgbW9kZWxzXG4gKiBcdHRoZSB0cmFpbmluZyBoZXMgdG8gYmUgZG9uZSB3aXRoIHRoZSBYTU0gQysrIGxpYnJhcnlcbiAqL1xuXG5cbi8vIE5PVEUgOiB0aGUgbW9kZWxzIGFuZCBtb2RlbFJlc3VsdHMgbXVzdCBmb2xsb3cgYSBwcmVjaXNlIGRvY3VtZW50IHN0cnVjdHVyZSA6XG4vLyBcdC0gXHRtb2RlbHMgc2hvdWxkIHdvcmsgYXMgZXhwb3J0ZWQgYnkgWE1NIChKU09OKVxuLy9cdC0gXHRtb2RlbFJlc3VsdHMgcmVwbGFjZSB0aGUgdmFyaWFibGVzIHRoYXQgbm9ybWFsbHkgZXhpc3QgaW4gdGhlIGNwcCBjbGFzc2VzLCB3aGljaCBhcmUgbmVlZGVkIGZvciB0aGUgZGVjb2RpbmcuXG4vL1x0XHRtb2RlbFJlc3VsdHMgKGluIHRoZSBjYXNlIG9mIEhNTXMpLCBjb250YWlucyB0aGUgYXJyYXkgc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMsIGVhY2ggZWxlbWVudCBvZiB3aGljaFxuLy9cdFx0Y29udGFpbnMgYW4gYXJyYXkgb2Ygc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHMgKHRoZSBITU0gc3RhdGVzKS5cbi8vXHRcdHNlZSB0aGUgZGVjb2RlciBsZm9wcyBmb3IgaW1wbGVtZW50YXRpb24uXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgICBhcyBpbiB4bW1IbW1TaW5nbGVDbGFzcy5jcHAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgY29uc3QgaG1tVXBkYXRlQWxwaGFXaW5kb3cgPSAoc2luZ2xlQ2xhc3NIbW1Nb2RlbCwgc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMpID0+IHtcblx0bGV0IG0gPSBzaW5nbGVDbGFzc0htbU1vZGVsO1xuXHRsZXQgcmVzID0gc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHM7XG5cblx0bGV0IG5zdGF0ZXMgPSBtLnBhcmFtZXRlcnMuc3RhdGVzO1xuXHRcblx0cmVzLmxpa2VsaWVzdF9zdGF0ZSA9IDA7XG5cdGxldCBiZXN0X2FscGhhID0gcmVzLmFscGhhX2hbMF1bMF0gKyByZXMuYWxwaGFfaFsxXVswXTtcblx0Zm9yKGxldCBpPTE7IGk8bnN0YXRlczsgaSsrKSB7XG5cdFx0aWYoKHJlcy5hbHBoYV9oWzBdW2ldICsgcmVzLmFscGhhX2hbMV1baV0pID4gYmVzdF9hbHBoYSkge1xuXHRcdFx0YmVzdF9hbHBoYSA9IHJlcy5hbHBoYV9oWzBdW2ldICsgcmVzLmFscGhhX2hbMV1baV07XG5cdFx0XHRyZXMubGlrZWxpZXN0X3N0YXRlID0gaTtcblx0XHR9XG5cdH1cblxuXHRyZXMud2luZG93X21pbmluZGV4ID0gcmVzLmxpa2VsaWVzdF9zdGF0ZSAtIG5zdGF0ZXMgLyAyO1xuXHRyZXMud2luZG93X21heGluZGV4ID0gcmVzLmxpa2VsaWVzdF9zdGF0ZSArIG5zdGF0ZXMgLyAyO1xuXHRyZXMud2luZG93X21pbmluZGV4ID0gcmVzLndpbmRvd19taW5pbmRleCA+PSAwID8gcmVzLndpbmRvd19taW5pbmRleCA6IDA7XG5cdHJlcy53aW5kb3dfbWF4aW5kZXggPSByZXMud2luZG93X21heGluZGV4IDw9IG5zdGF0ZXMgPyByZXMud2luZG93X21heGluZGV4IDogbnN0YXRlcztcblx0cmVzLndpbmRvd19ub3JtYWxpemF0aW9uX2NvbnN0YW50ID0gMDtcblx0Zm9yKGxldCBpPXJlcy53aW5kb3dfbWluaW5kZXg7IGk8cmVzLndpbmRvd19tYXhpbmRleDsgaSsrKSB7XG5cdFx0cmVzLndpbmRvd19ub3JtYWxpemF0aW9uX2NvbnN0YW50ICs9IChyZXMuYWxwaGFfaFswXVtpXSArIHJlcy5hbHBoYV9oWzFdW2ldKTtcblx0fVxufVxuXG5leHBvcnQgY29uc3QgaG1tVXBkYXRlUmVzdWx0cyA9IChzaW5nbGVDbGFzc0htbU1vZGVsLCBzaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0cykgPT4ge1xuXHRsZXQgbSA9IHNpbmdsZUNsYXNzSG1tTW9kZWw7XG5cdGxldCByZXMgPSBzaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0cztcblxuXHQvLyBJUyBUSElTIENPUlJFQ1QgID8gQ0hFQ0sgIVxuXHRyZXMubGlrZWxpaG9vZF9idWZmZXIucHVzaChyZXMuaW5zdGFudF9saWtlbGlob29kKTtcblx0cmVzLmxvZ19saWtlbGlob29kID0gMDtcblx0bGV0IGJ1ZlNpemUgPSByZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoO1xuXHRmb3IobGV0IGk9MDsgaTxidWZTaXplOyBpKyspIHtcblx0XHRyZXMubG9nX2xpa2VsaWhvb2QgKz0gcmVzLmxpa2VsaWhvb2RfYnVmZmVyW2ldO1xuXHR9XG5cdHJlcy5sb2dfbGlrZWxpaG9vZCAvPSBidWZTaXplO1xuXG5cdHJlcy5wcm9ncmVzcyA9IDA7XG5cdGZvcihsZXQgaT1yZXMud2luZG93X21pbmluZGV4OyBpPHJlcy53aW5kb3dfbWF4aW5kZXg7IGkrKykge1xuXHRcdHJlcy5wcm9ncmVzcyArPSAocmVzLmFscGhhX2hbMF1baV0gKyByZXMuYWxwaGFfaFsxXVtpXSArIHJlcy5hbHBoYV9oWzJdW2ldKSAqIGkgL1xuXHRcdFx0XHRcdFx0cmVzLndpbmRvd19ub3JtYWxpemF0aW9uX2NvbnN0YW50O1xuXHR9XG5cdHJlcy5wcm9ncmVzcyAvPSAobS5wYXJhbWV0ZXJzLnN0YXRlcyAtIDEpO1xufVxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vICAgYXMgaW4geG1tSGllcmFyY2hpY2FsSG1tLmNwcCAgICAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbmV4cG9ydCBjb25zdCBoaG1tTGlrZWxpaG9vZEFscGhhID0gKGV4aXROdW0sIGxpa2VsaWhvb2RWZWN0b3IsIGhobW1Nb2RlbCwgaGhtbU1vZGVsUmVzdWx0cykgPT4ge1xuXHRsZXQgbSA9IGhobW1Nb2RlbDtcblx0bGV0IHJlcyA9IGhobW1Nb2RlbFJlc3VsdHM7XG5cblx0aWYoZXhpdE51bSA8IDApIHtcblx0XHQvL2xldCBsID0gMDtcblx0XHRmb3IobGV0IGk9MDsgaTxtLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGlrZWxpaG9vZFZlY3RvcltpXSA9IDA7XG5cdFx0XHRmb3IobGV0IGV4aXQ9MDsgZXhpdDwzOyBleGl0KyspIHtcblx0XHRcdFx0Zm9yKGxldCBrPTA7IGs8bS5tb2RlbHNbaV0ucGFyYW1ldGVycy5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRcdGxpa2VsaWhvb2RWZWN0b3JbaV0gKz0gcmVzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldLmFscGhhX2hbZXhpdF1ba107XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Zm9yKGxldCBpPTA7IGk8bS5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxpa2VsaWhvb2RWZWN0b3JbaV0gPSAwO1xuXHRcdFx0Zm9yKGxldCBrPTA7IGs8bS5tb2RlbHNbaV0ucGFyYW1ldGVycy5zdGF0ZXM7IGsrKykge1xuXHRcdFx0XHRsaWtlbGlob29kVmVjdG9yW2ldICs9IHJlcy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXS5hbHBoYV9oW2V4aXROdW1dW2tdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuLy8gZ2V0IHRoZSBpbnZlcnNlX2NvdmFyaWFuY2VzIG1hdHJpeCBvZiBlYWNoIG9mIHRoZSBHTU0gY2xhc3Nlc1xuLy8gZm9yIGVhY2ggaW5wdXQgZGF0YSwgY29tcHV0ZSB0aGUgZGlzdGFuY2Ugb2YgdGhlIGZyYW1lIHRvIGVhY2ggb2YgdGhlIEdNTXNcbi8vIHdpdGggdGhlIGZvbGxvd2luZyBlcXVhdGlvbnMgOlxuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vIGFzIGluIHhtbUdhdXNzaWFuRGlzdHJpYnV0aW9uLmNwcCAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbmV4cG9ydCBjb25zdCBnYXVzc2lhbkNvbXBvbmVudExpa2VsaWhvb2QgPSAob2JzZXJ2YXRpb24sIGdhdXNzaWFuQ29tcG9uZW50KSA9PiB7XG5cdGxldCBjb21wb25lbnQgPSBnYXVzc2lhbkNvbXBvbmVudDtcblx0bGV0IGV1Y2xpZGlhbkRpc3RhbmNlID0gMC4wO1xuXHRmb3IobGV0IGwgPSAwOyBsIDwgY29tcG9uZW50LmRpbWVuc2lvbjsgbCsrKSB7XG5cdFx0bGV0IHRtcCA9IDAuMDtcblx0XHRmb3IobGV0IGs9IDA7IGsgPCBjb21wb25lbnQuZGltZW5zaW9uOyBrKyspIHtcblx0XHRcdHRtcCArPSBjb21wb25lbnQuaW52ZXJzZV9jb3ZhcmlhbmNlW2wgKiBjb21wb25lbnQuZGltZW5zaW9uICsga10gKiAob2JzZXJ2YXRpb25ba10gLSBjb21wb25lbnQubWVhbltrXSk7XG5cdFx0fVxuXHRcdGV1Y2xpZGlhbkRpc3RhbmNlICs9IChvYnNlcnZhdGlvbltsXSAtIGNvbXBvbmVudC5tZWFuW2xdKSAqIHRtcDtcblx0fVxuXHRsZXQgcCA9IE1hdGguZXhwKC0wLjUgKiBldWNsaWRpYW5EaXN0YW5jZSkgLyBNYXRoLnNxcnQoY29tcG9uZW50LmNvdmFyaWFuY2VfZGV0ZXJtaW5hbnQgKiBNYXRoLnBvdygyICogTWF0aC5QSSwgY29tcG9uZW50LmRpbWVuc2lvbikpO1xuXG5cdGlmKCBwIDwgMWUtMTgwIHx8IGlzTmFOKHApIHx8IGlzTmFOKE1hdGguYWJzKHApKSkge1xuXHRcdHAgPSAxZS0xODA7XG5cdH1cblx0cmV0dXJuIHA7XG59O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vICAgIGFzIGluIHhtbUdtbVNpbmdsZUNsYXNzLmNwcCAgICAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbi8vIC0+IGluIG9ic1Byb2IsIGNhbGxlZCBmcm9tIGxpa2VsaWhvb2QsIGNhbGxlZCBmcm9tIGZpbHRlciwgY2FsbGVkIGZyb20gR01NOjpmaWx0ZXJcbi8vIFRPRE8gOiBkZWNvbXBvc2UgaW4gYSBzaW1pbGFyIHdheSB0byBYTU0gY3BwIHRvIGJlIGFibGUgdG8gdXNlIG9ic1Byb2JcblxuZXhwb3J0IGNvbnN0IGdtbUxpa2VsaWhvb2QgPSAob2JzZXJ2YXRpb24sIHNpbmdsZUNsYXNzR21tTW9kZWwsIHNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzID0ge30pID0+IHtcblx0bGV0IGNvZWZmcyA9IHNpbmdsZUNsYXNzR21tTW9kZWwubWl4dHVyZV9jb2VmZnM7XG5cdC8vY29uc29sZS5sb2coY29lZmZzKTtcblx0Ly9pZihjb2VmZnMgPT09IHVuZGVmaW5lZCkgY29lZmZzID0gWzFdO1xuXHRsZXQgY29tcG9uZW50cyA9IHNpbmdsZUNsYXNzR21tTW9kZWwuY29tcG9uZW50cztcblx0Ly9sZXQgcmVzID0gc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHM7XG5cdGxldCBwID0gMDtcblxuXHRmb3IobGV0IGMgPSAwOyBjIDwgY29lZmZzLmxlbmd0aDsgYysrKSB7XG5cdFx0cCArPSBjb2VmZnNbY10gKiBnYXVzc2lhbkNvbXBvbmVudExpa2VsaWhvb2Qob2JzZXJ2YXRpb24sIGNvbXBvbmVudHNbY10pO1xuXHR9XG5cblx0Ly9yZXMuaW5zdGFudF9saWtlbGlob29kID0gcDtcblxuXHQvLyBhcyBpbiB4bW1HbW1TaW5nbGVDbGFzczo6dXBkYXRlUmVzdWx0cygpIDpcblx0Ly8gPT4gbW92ZWQgdG8gZ21tTGlrZWxpaG9vZHMoKSBzbyB0aGF0IHRoaXMgZnVuY3Rpb24gbG9va3MgbW9yZSBsaWtlIG9ic1Byb2Jcblx0Lypcblx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyLnVuc2hpZnQocCk7XG5cdHJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGgtLTtcblx0cmVzLmxvZ19saWtlbGlob29kID0gcmVzLmxpa2VsaWhvb2RfYnVmZmVyLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApOyAvLyBzdW0gb2YgYWxsIGFycmF5IHZhbHVlc1xuXHRyZXMubG9nX2xpa2VsaWhvb2QgLz0gcmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aDtcblx0Ly8qL1xuXG5cdHJldHVybiBwO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgICAgICAgICBhcyBpbiB4bW1HbW0uY3BwICAgICAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgY29uc3QgZ21tTGlrZWxpaG9vZHMgPSAob2JzZXJ2YXRpb24sIGdtbU1vZGVsLCBnbW1Nb2RlbFJlc3VsdHMpID0+IHtcblx0bGV0IGxpa2VsaWhvb2RzID0gW107XG5cdGxldCBtb2RlbHMgPSBnbW1Nb2RlbC5tb2RlbHM7XG5cdGxldCByZXMgPSBnbW1Nb2RlbFJlc3VsdHM7XG5cblx0bGV0IG1heExvZ0xpa2VsaWhvb2QgPSAwO1xuXHRsZXQgbm9ybUNvbnN0SW5zdGFudCA9IDA7XG5cdGxldCBub3JtQ29uc3RTbW9vdGhlZCA9IDA7XG5cblx0Zm9yKGxldCBpPTA7IGk8bW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRsZXQgc2luZ2xlUmVzID0gcmVzLnNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzW2ldO1xuXHRcdHNpbmdsZVJlcy5pbnN0YW50X2xpa2VsaWhvb2QgPSBnbW1MaWtlbGlob29kKG9ic2VydmF0aW9uLCBtb2RlbHNbaV0sIHNpbmdsZVJlcyk7XG5cblx0XHQvLyBhcyBpbiB4bW1HbW1TaW5nbGVDbGFzczo6dXBkYXRlUmVzdWx0cygpIChtb3ZlZCBmcm9tIGdtbUxpa2VsaWhvb2QpIDpcblx0XHRzaW5nbGVSZXMubGlrZWxpaG9vZF9idWZmZXIudW5zaGlmdChzaW5nbGVSZXMuaW5zdGFudF9saWtlbGlob29kKTtcblx0XHRzaW5nbGVSZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoLS07XG5cdFx0c2luZ2xlUmVzLmxvZ19saWtlbGlob29kID0gc2luZ2xlUmVzLmxpa2VsaWhvb2RfYnVmZmVyLnJlZHVjZSgoYSwgYikgPT4gYSArIGIsIDApOyAvLyBzdW0gb2YgYWxsIGFycmF5IHZhbHVlc1xuXHRcdHNpbmdsZVJlcy5sb2dfbGlrZWxpaG9vZCAvPSBzaW5nbGVSZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoO1xuXG5cdFx0cmVzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV0gPSBzaW5nbGVSZXN1bHRzLmluc3RhbnRfbGlrZWxpaG9vZDtcblx0XHRyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID0gc2luZ2xlUmVzdWx0cy5sb2dfbGlrZWxpaG9vZDtcblx0XHRyZXMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV0gPSBNYXRoLmV4cChyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldKTtcblx0XHRyZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gcmVzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV07XG5cdFx0cmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSByZXMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV07XG5cblx0XHRub3JtQ29uc3RJbnN0YW50ICs9IHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cdFx0bm9ybUNvbnN0U21vb3RoZWQgKz0gcmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cblx0XHRpZihpID09IDAgfHwgcmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA+IG1heExvZ0xpa2VsaWhvb2QpIHtcblx0XHRcdG1heExvZ0xpa2VsaWhvb2QgPSByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldO1xuXHRcdFx0cmVzLmxpa2VsaWVzdCA9IGk7XG5cdFx0fVxuXHR9XG5cblx0Zm9yKGxldCBpPTA7IGk8bW9kZWwubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRyZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldIC89IG5vcm1Db25zdEluc3RhbnQ7XG5cdFx0cmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gLz0gbm9ybUNvbnN0U21vb3RoZWQ7XG5cdH1cbn07XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbi8vIERPIFdFIFJFQUxMWSBORUVEIFRISVMgP1xuXG4vKlxuY2xhc3MgWG1tU2luZ2xlQ2xhc3NHbW0ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGxpa2VsaWhvb2RXaW5kb3c6IDUsXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucmVzdWx0cyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSB0aGlzLnBhcmFtcy5saWtlbGlob29kV2luZG93O1xuXHR9XG5cblx0c2V0TW9kZWwobW9kZWwpIHtcblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucmVzdWx0cyA9IHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlc3QgaWYgbW9kZWwgaXMgdmFsaWQgaGVyZSAoVE9ETyA6IHdyaXRlIGEgYmV0dGVyIHRlc3QpXG5cdFx0aWYobW9kZWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5tb2RlbCA9IG1vZGVsO1xuXHRcdFx0bGV0IG5tb2RlbHMgPSBtb2RlbC5tb2RlbHMubGVuZ3RoO1xuXHRcdFx0dGhpcy5yZXN1bHRzID0ge1xuXHRcdFx0XHRpbnN0YW50X2xpa2VsaWhvb2Q6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bG9nX2xpa2VsaWhvb2Q6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bGlrZWxpaG9vZF9idWZmZXI6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0aW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bGlrZWxpZXN0OiAtMSxcblx0XHRcdFx0c2luZ2xlQ2xhc3NNb2RlbFJlc3VsdHM6IFtdXG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IobGV0IGk9MDsgaTxubW9kZWxzOyBpKyspIHtcblxuXHRcdFx0XHR0aGlzLnJlc3VsdHMuaW5zdGFudF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXG5cdFx0XHRcdGxldCByZXMgPSB7fTtcblx0XHRcdFx0cmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5sb2dfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlciA9IFtdO1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoID0gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0XHRmb3IobGV0IGo9MDsgajx0aGlzLmxpa2VsaWhvb2RXaW5kb3c7IGorKykge1xuXHRcdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlcltqXSA9IDEgLyB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5yZXN1bHRzLnNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzLnB1c2gocmVzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmluaXRpYWxpemUoeyBmcmFtZVNpemU6IHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aCB9KTtcblx0fVxuXG5cdGxpa2VsaWhvb2Qob2JzZXJ2YXRpb24pIHtcblxuXHR9XG5cblx0Ly8gZXRjIC4uLlxufVxuXG5jbGFzcyBYbW1TaW5nbGVDbGFzc0htbSB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuYWxwaGFfaCA9IG5ldyBBcnJheSgzKTtcblx0XHRmb3IobGV0IGk9MDsgaTwzOyBpKyspIHtcblx0XHRcdGFscGhhX2hbaV0gPSBbXTtcblx0XHR9XG5cblx0XHR0aGlzLnByaW9yID0gW107XG5cdFx0dGhpcy5zdGF0ZXMgPSBbXTsgLy8gdGhlc2UgYXJlIFhtbVNpbmdsZUNsYXNzR21tJ3NcblxuXHRcdHRoaXMucmVzdWx0cyA9IHtcblx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZDogMFxuXHRcdH07XG5cblx0XHR0aGlzLmZvcndhcmRfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHQvL3RoaXMucHJldmlvdXNfYWxwaGEgPSBcblx0fVxuXG5cdC8vIEVUQ1xufVxuXG4qL1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9jcmVhdGVcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2RlZmluZS1wcm9wZXJ0eVwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZGVmaW5lLXByb3BlcnR5XCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKHRhcmdldCwgcHJvcHMpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgZGVzY3JpcHRvciA9IHByb3BzW2ldO1xuICAgICAgZGVzY3JpcHRvci5lbnVtZXJhYmxlID0gZGVzY3JpcHRvci5lbnVtZXJhYmxlIHx8IGZhbHNlO1xuICAgICAgZGVzY3JpcHRvci5jb25maWd1cmFibGUgPSB0cnVlO1xuICAgICAgaWYgKFwidmFsdWVcIiBpbiBkZXNjcmlwdG9yKSBkZXNjcmlwdG9yLndyaXRhYmxlID0gdHJ1ZTtcblxuICAgICAgX09iamVjdCRkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGRlc2NyaXB0b3Iua2V5LCBkZXNjcmlwdG9yKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBwcm90b1Byb3BzLCBzdGF0aWNQcm9wcykge1xuICAgIGlmIChwcm90b1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLnByb3RvdHlwZSwgcHJvdG9Qcm9wcyk7XG4gICAgaWYgKHN0YXRpY1Byb3BzKSBkZWZpbmVQcm9wZXJ0aWVzKENvbnN0cnVjdG9yLCBzdGF0aWNQcm9wcyk7XG4gICAgcmV0dXJuIENvbnN0cnVjdG9yO1xuICB9O1xufSkoKTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIF9PYmplY3QkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3QvZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yXCIpW1wiZGVmYXVsdFwiXTtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiBnZXQoX3gsIF94MiwgX3gzKSB7XG4gIHZhciBfYWdhaW4gPSB0cnVlO1xuXG4gIF9mdW5jdGlvbjogd2hpbGUgKF9hZ2Fpbikge1xuICAgIHZhciBvYmplY3QgPSBfeCxcbiAgICAgICAgcHJvcGVydHkgPSBfeDIsXG4gICAgICAgIHJlY2VpdmVyID0gX3gzO1xuICAgIF9hZ2FpbiA9IGZhbHNlO1xuICAgIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAgIHZhciBkZXNjID0gX09iamVjdCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgcGFyZW50ID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iamVjdCk7XG5cbiAgICAgIGlmIChwYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIF94ID0gcGFyZW50O1xuICAgICAgICBfeDIgPSBwcm9wZXJ0eTtcbiAgICAgICAgX3gzID0gcmVjZWl2ZXI7XG4gICAgICAgIF9hZ2FpbiA9IHRydWU7XG4gICAgICAgIGRlc2MgPSBwYXJlbnQgPSB1bmRlZmluZWQ7XG4gICAgICAgIGNvbnRpbnVlIF9mdW5jdGlvbjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgICByZXR1cm4gZGVzYy52YWx1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgICBpZiAoZ2V0dGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGdldHRlci5jYWxsKHJlY2VpdmVyKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfT2JqZWN0JGNyZWF0ZSA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2NyZWF0ZVwiKVtcImRlZmF1bHRcIl07XG5cbnZhciBfT2JqZWN0JHNldFByb3RvdHlwZU9mID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9vYmplY3Qvc2V0LXByb3RvdHlwZS1vZlwiKVtcImRlZmF1bHRcIl07XG5cbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArIHR5cGVvZiBzdXBlckNsYXNzKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9IF9PYmplY3QkY3JlYXRlKHN1cGVyQ2xhc3MgJiYgc3VwZXJDbGFzcy5wcm90b3R5cGUsIHtcbiAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgdmFsdWU6IHN1YkNsYXNzLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH1cbiAgfSk7XG4gIGlmIChzdXBlckNsYXNzKSBfT2JqZWN0JHNldFByb3RvdHlwZU9mID8gX09iamVjdCRzZXRQcm90b3R5cGVPZihzdWJDbGFzcywgc3VwZXJDbGFzcykgOiBzdWJDbGFzcy5fX3Byb3RvX18gPSBzdXBlckNsYXNzO1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7XG4gICAgXCJkZWZhdWx0XCI6IG9ialxuICB9O1xufTtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBmdW5jdGlvbiAob2JqKSB7XG4gIGlmIChvYmogJiYgb2JqLl9fZXNNb2R1bGUpIHtcbiAgICByZXR1cm4gb2JqO1xuICB9IGVsc2Uge1xuICAgIHZhciBuZXdPYmogPSB7fTtcblxuICAgIGlmIChvYmogIT0gbnVsbCkge1xuICAgICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KSkgbmV3T2JqW2tleV0gPSBvYmpba2V5XTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBuZXdPYmpbXCJkZWZhdWx0XCJdID0gb2JqO1xuICAgIHJldHVybiBuZXdPYmo7XG4gIH1cbn07XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7IiwidmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxudmFyIGlzQXJyYXkgPSByZXF1aXJlKCdpc2FycmF5JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbnZhciByb290UGFyZW50ID0ge31cblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogRHVlIHRvIHZhcmlvdXMgYnJvd3NlciBidWdzLCBzb21ldGltZXMgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiB3aWxsIGJlIHVzZWQgZXZlblxuICogd2hlbiB0aGUgYnJvd3NlciBzdXBwb3J0cyB0eXBlZCBhcnJheXMuXG4gKlxuICogTm90ZTpcbiAqXG4gKiAgIC0gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLFxuICogICAgIFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4LlxuICpcbiAqICAgLSBTYWZhcmkgNS03IGxhY2tzIHN1cHBvcnQgZm9yIGNoYW5naW5nIHRoZSBgT2JqZWN0LnByb3RvdHlwZS5jb25zdHJ1Y3RvcmAgcHJvcGVydHlcbiAqICAgICBvbiBvYmplY3RzLlxuICpcbiAqICAgLSBDaHJvbWUgOS0xMCBpcyBtaXNzaW5nIHRoZSBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uLlxuICpcbiAqICAgLSBJRTEwIGhhcyBhIGJyb2tlbiBgVHlwZWRBcnJheS5wcm90b3R5cGUuc3ViYXJyYXlgIGZ1bmN0aW9uIHdoaWNoIHJldHVybnMgYXJyYXlzIG9mXG4gKiAgICAgaW5jb3JyZWN0IGxlbmd0aCBpbiBzb21lIHNpdHVhdGlvbnMuXG5cbiAqIFdlIGRldGVjdCB0aGVzZSBidWdneSBicm93c2VycyBhbmQgc2V0IGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGAgdG8gYGZhbHNlYCBzbyB0aGV5XG4gKiBnZXQgdGhlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiwgd2hpY2ggaXMgc2xvd2VyIGJ1dCBiZWhhdmVzIGNvcnJlY3RseS5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSBnbG9iYWwuVFlQRURfQVJSQVlfU1VQUE9SVCAhPT0gdW5kZWZpbmVkXG4gID8gZ2xvYmFsLlRZUEVEX0FSUkFZX1NVUFBPUlRcbiAgOiB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgZnVuY3Rpb24gQmFyICgpIHt9XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICBhcnIuY29uc3RydWN0b3IgPSBCYXJcbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MiAmJiAvLyB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZFxuICAgICAgICBhcnIuY29uc3RydWN0b3IgPT09IEJhciAmJiAvLyBjb25zdHJ1Y3RvciBjYW4gYmUgc2V0XG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgJiYgLy8gY2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gICAgICAgIGFyci5zdWJhcnJheSgxLCAxKS5ieXRlTGVuZ3RoID09PSAwIC8vIGllMTAgaGFzIGJyb2tlbiBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBrTWF4TGVuZ3RoICgpIHtcbiAgcmV0dXJuIEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUXG4gICAgPyAweDdmZmZmZmZmXG4gICAgOiAweDNmZmZmZmZmXG59XG5cbi8qKlxuICogQ2xhc3M6IEJ1ZmZlclxuICogPT09PT09PT09PT09PVxuICpcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgYXJlIGF1Z21lbnRlZFxuICogd2l0aCBmdW5jdGlvbiBwcm9wZXJ0aWVzIGZvciBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgQVBJIGZ1bmN0aW9ucy4gV2UgdXNlXG4gKiBgVWludDhBcnJheWAgc28gdGhhdCBzcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdCByZXR1cm5zXG4gKiBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBCeSBhdWdtZW50aW5nIHRoZSBpbnN0YW5jZXMsIHdlIGNhbiBhdm9pZCBtb2RpZnlpbmcgdGhlIGBVaW50OEFycmF5YFxuICogcHJvdG90eXBlLlxuICovXG5mdW5jdGlvbiBCdWZmZXIgKGFyZykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSkge1xuICAgIC8vIEF2b2lkIGdvaW5nIHRocm91Z2ggYW4gQXJndW1lbnRzQWRhcHRvclRyYW1wb2xpbmUgaW4gdGhlIGNvbW1vbiBjYXNlLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgcmV0dXJuIG5ldyBCdWZmZXIoYXJnLCBhcmd1bWVudHNbMV0pXG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoYXJnKVxuICB9XG5cbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXMubGVuZ3RoID0gMFxuICAgIHRoaXMucGFyZW50ID0gdW5kZWZpbmVkXG4gIH1cblxuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgcmV0dXJuIGZyb21OdW1iZXIodGhpcywgYXJnKVxuICB9XG5cbiAgLy8gU2xpZ2h0bHkgbGVzcyBjb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodGhpcywgYXJnLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6ICd1dGY4JylcbiAgfVxuXG4gIC8vIFVudXN1YWwuXG4gIHJldHVybiBmcm9tT2JqZWN0KHRoaXMsIGFyZylcbn1cblxuZnVuY3Rpb24gZnJvbU51bWJlciAodGhhdCwgbGVuZ3RoKSB7XG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGggPCAwID8gMCA6IGNoZWNrZWQobGVuZ3RoKSB8IDApXG4gIGlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB0aGF0W2ldID0gMFxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nICh0aGF0LCBzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykgZW5jb2RpbmcgPSAndXRmOCdcblxuICAvLyBBc3N1bXB0aW9uOiBieXRlTGVuZ3RoKCkgcmV0dXJuIHZhbHVlIGlzIGFsd2F5cyA8IGtNYXhMZW5ndGguXG4gIHZhciBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICB0aGF0ID0gYWxsb2NhdGUodGhhdCwgbGVuZ3RoKVxuXG4gIHRoYXQud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAodGhhdCwgb2JqZWN0KSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqZWN0KSkgcmV0dXJuIGZyb21CdWZmZXIodGhhdCwgb2JqZWN0KVxuXG4gIGlmIChpc0FycmF5KG9iamVjdCkpIHJldHVybiBmcm9tQXJyYXkodGhhdCwgb2JqZWN0KVxuXG4gIGlmIChvYmplY3QgPT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ211c3Qgc3RhcnQgd2l0aCBudW1iZXIsIGJ1ZmZlciwgYXJyYXkgb3Igc3RyaW5nJylcbiAgfVxuXG4gIGlmICh0eXBlb2YgQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKG9iamVjdC5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgcmV0dXJuIGZyb21UeXBlZEFycmF5KHRoYXQsIG9iamVjdClcbiAgICB9XG4gICAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHRoYXQsIG9iamVjdClcbiAgICB9XG4gIH1cblxuICBpZiAob2JqZWN0Lmxlbmd0aCkgcmV0dXJuIGZyb21BcnJheUxpa2UodGhhdCwgb2JqZWN0KVxuXG4gIHJldHVybiBmcm9tSnNvbk9iamVjdCh0aGF0LCBvYmplY3QpXG59XG5cbmZ1bmN0aW9uIGZyb21CdWZmZXIgKHRoYXQsIGJ1ZmZlcikge1xuICB2YXIgbGVuZ3RoID0gY2hlY2tlZChidWZmZXIubGVuZ3RoKSB8IDBcbiAgdGhhdCA9IGFsbG9jYXRlKHRoYXQsIGxlbmd0aClcbiAgYnVmZmVyLmNvcHkodGhhdCwgMCwgMCwgbGVuZ3RoKVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXkgKHRoYXQsIGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG4vLyBEdXBsaWNhdGUgb2YgZnJvbUFycmF5KCkgdG8ga2VlcCBmcm9tQXJyYXkoKSBtb25vbW9ycGhpYy5cbmZ1bmN0aW9uIGZyb21UeXBlZEFycmF5ICh0aGF0LCBhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB0aGF0ID0gYWxsb2NhdGUodGhhdCwgbGVuZ3RoKVxuICAvLyBUcnVuY2F0aW5nIHRoZSBlbGVtZW50cyBpcyBwcm9iYWJseSBub3Qgd2hhdCBwZW9wbGUgZXhwZWN0IGZyb20gdHlwZWRcbiAgLy8gYXJyYXlzIHdpdGggQllURVNfUEVSX0VMRU1FTlQgPiAxIGJ1dCBpdCdzIGNvbXBhdGlibGUgd2l0aCB0aGUgYmVoYXZpb3JcbiAgLy8gb2YgdGhlIG9sZCBCdWZmZXIgY29uc3RydWN0b3IuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICB0aGF0W2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKHRoYXQsIGFycmF5KSB7XG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGFycmF5LmJ5dGVMZW5ndGhcbiAgICB0aGF0ID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGFycmF5KSlcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgdGhhdCA9IGZyb21UeXBlZEFycmF5KHRoYXQsIG5ldyBVaW50OEFycmF5KGFycmF5KSlcbiAgfVxuICByZXR1cm4gdGhhdFxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlICh0aGF0LCBhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB0aGF0ID0gYWxsb2NhdGUodGhhdCwgbGVuZ3RoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgdGhhdFtpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIHRoYXRcbn1cblxuLy8gRGVzZXJpYWxpemUgeyB0eXBlOiAnQnVmZmVyJywgZGF0YTogWzEsMiwzLC4uLl0gfSBpbnRvIGEgQnVmZmVyIG9iamVjdC5cbi8vIFJldHVybnMgYSB6ZXJvLWxlbmd0aCBidWZmZXIgZm9yIGlucHV0cyB0aGF0IGRvbid0IGNvbmZvcm0gdG8gdGhlIHNwZWMuXG5mdW5jdGlvbiBmcm9tSnNvbk9iamVjdCAodGhhdCwgb2JqZWN0KSB7XG4gIHZhciBhcnJheVxuICB2YXIgbGVuZ3RoID0gMFxuXG4gIGlmIChvYmplY3QudHlwZSA9PT0gJ0J1ZmZlcicgJiYgaXNBcnJheShvYmplY3QuZGF0YSkpIHtcbiAgICBhcnJheSA9IG9iamVjdC5kYXRhXG4gICAgbGVuZ3RoID0gY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB9XG4gIHRoYXQgPSBhbGxvY2F0ZSh0aGF0LCBsZW5ndGgpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIHRoYXRbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiB0aGF0XG59XG5cbmlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICBCdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG4gIEJ1ZmZlci5fX3Byb3RvX18gPSBVaW50OEFycmF5XG59IGVsc2Uge1xuICAvLyBwcmUtc2V0IGZvciB2YWx1ZXMgdGhhdCBtYXkgZXhpc3QgaW4gdGhlIGZ1dHVyZVxuICBCdWZmZXIucHJvdG90eXBlLmxlbmd0aCA9IHVuZGVmaW5lZFxuICBCdWZmZXIucHJvdG90eXBlLnBhcmVudCA9IHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBhbGxvY2F0ZSAodGhhdCwgbGVuZ3RoKSB7XG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlLCBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIHRoYXQgPSBCdWZmZXIuX2F1Z21lbnQobmV3IFVpbnQ4QXJyYXkobGVuZ3RoKSlcbiAgICB0aGF0Ll9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgfSBlbHNlIHtcbiAgICAvLyBGYWxsYmFjazogUmV0dXJuIGFuIG9iamVjdCBpbnN0YW5jZSBvZiB0aGUgQnVmZmVyIGNsYXNzXG4gICAgdGhhdC5sZW5ndGggPSBsZW5ndGhcbiAgICB0aGF0Ll9pc0J1ZmZlciA9IHRydWVcbiAgfVxuXG4gIHZhciBmcm9tUG9vbCA9IGxlbmd0aCAhPT0gMCAmJiBsZW5ndGggPD0gQnVmZmVyLnBvb2xTaXplID4+PiAxXG4gIGlmIChmcm9tUG9vbCkgdGhhdC5wYXJlbnQgPSByb290UGFyZW50XG5cbiAgcmV0dXJuIHRoYXRcbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IGtNYXhMZW5ndGhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0ga01heExlbmd0aCgpKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIGtNYXhMZW5ndGgoKS50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgU2xvd0J1ZmZlcikpIHJldHVybiBuZXcgU2xvd0J1ZmZlcihzdWJqZWN0LCBlbmNvZGluZylcblxuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZylcbiAgZGVsZXRlIGJ1Zi5wYXJlbnRcbiAgcmV0dXJuIGJ1ZlxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gISEoYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgdmFyIGkgPSAwXG4gIHZhciBsZW4gPSBNYXRoLm1pbih4LCB5KVxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSBicmVha1xuXG4gICAgKytpXG4gIH1cblxuICBpZiAoaSAhPT0gbGVuKSB7XG4gICAgeCA9IGFbaV1cbiAgICB5ID0gYltpXVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICdyYXcnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFpc0FycmF5KGxpc3QpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdsaXN0IGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycy4nKVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBuZXcgQnVmZmVyKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKGxlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaXRlbSA9IGxpc3RbaV1cbiAgICBpdGVtLmNvcHkoYnVmLCBwb3MpXG4gICAgcG9zICs9IGl0ZW0ubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykgc3RyaW5nID0gJycgKyBzdHJpbmdcblxuICB2YXIgbGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAobGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgIC8vIERlcHJlY2F0ZWRcbiAgICAgIGNhc2UgJ3Jhdyc6XG4gICAgICBjYXNlICdyYXdzJzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICBzdGFydCA9IHN0YXJ0IHwgMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPT09IEluZmluaXR5ID8gdGhpcy5sZW5ndGggOiBlbmQgfCAwXG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcbiAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKGVuZCA8PSBzdGFydCkgcmV0dXJuICcnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gYmluYXJ5U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aCB8IDBcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiAwXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICBieXRlT2Zmc2V0ID4+PSAwXG5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVybiAtMVxuXG4gIC8vIE5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gTWF0aC5tYXgodGhpcy5sZW5ndGggKyBieXRlT2Zmc2V0LCAwKVxuXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSByZXR1cm4gLTEgLy8gc3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcgYWx3YXlzIGZhaWxzXG4gICAgcmV0dXJuIFN0cmluZy5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldClcbiAgfVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbCh0aGlzLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YodGhpcywgWyB2YWwgXSwgYnl0ZU9mZnNldClcbiAgfVxuXG4gIGZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yICh2YXIgaSA9IDA7IGJ5dGVPZmZzZXQgKyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoYXJyW2J5dGVPZmZzZXQgKyBpXSA9PT0gdmFsW2ZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4XSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbC5sZW5ndGgpIHJldHVybiBieXRlT2Zmc2V0ICsgZm91bmRJbmRleFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAtMVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuLy8gYGdldGAgaXMgZGVwcmVjYXRlZFxuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLmdldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMucmVhZFVJbnQ4KG9mZnNldClcbn1cblxuLy8gYHNldGAgaXMgZGVwcmVjYXRlZFxuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKHYsIG9mZnNldCkge1xuICBjb25zb2xlLmxvZygnLnNldCgpIGlzIGRlcHJlY2F0ZWQuIEFjY2VzcyB1c2luZyBhcnJheSBpbmRleGVzIGluc3RlYWQuJylcbiAgcmV0dXJuIHRoaXMud3JpdGVVSW50OCh2LCBvZmZzZXQpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAoaXNOYU4ocGFyc2VkKSkgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggfCAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgLy8gbGVnYWN5IHdyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKSAtIHJlbW92ZSBpbiB2MC4xM1xuICB9IGVsc2Uge1xuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aCB8IDBcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignYXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGJpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2kgKyAxXSAqIDI1NilcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIG5ld0J1ZiA9IEJ1ZmZlci5fYXVnbWVudCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpKVxuICB9IGVsc2Uge1xuICAgIHZhciBzbGljZUxlbiA9IGVuZCAtIHN0YXJ0XG4gICAgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9XG5cbiAgaWYgKG5ld0J1Zi5sZW5ndGgpIG5ld0J1Zi5wYXJlbnQgPSB0aGlzLnBhcmVudCB8fCB0aGlzXG5cbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoIHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdidWZmZXIgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3ZhbHVlIGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpLCAwKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCB8IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkgdmFsdWUgPSBNYXRoLmZsb29yKHZhbHVlKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmYgKyB2YWx1ZSArIDFcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihidWYubGVuZ3RoIC0gb2Zmc2V0LCAyKTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9ICh2YWx1ZSAmICgweGZmIDw8ICg4ICogKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkpKSkgPj4+XG4gICAgICAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSAqIDhcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUpXG4gIH1cbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5mdW5jdGlvbiBvYmplY3RXcml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4pIHtcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4oYnVmLmxlbmd0aCAtIG9mZnNldCwgNCk7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSAodmFsdWUgPj4+IChsaXR0bGVFbmRpYW4gPyBpIDogMyAtIGkpICogOCkgJiAweGZmXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gdmFsdWUgPCAwID8gMSA6IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGggLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSB2YWx1ZSA8IDAgPyAxIDogMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB2YWx1ZSA9IE1hdGguZmxvb3IodmFsdWUpXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgaWYgKEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICB9IGVsc2Uge1xuICAgIG9iamVjdFdyaXRlVUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlKVxuICB9XG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgfCAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICAgIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIH0gZWxzZSB7XG4gICAgb2JqZWN0V3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0IHwgMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIGlmIChCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCkge1xuICAgIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gICAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gICAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgfSBlbHNlIHtcbiAgICBvYmplY3RXcml0ZVVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSlcbiAgfVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCd2YWx1ZSBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdpbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDAgfHwgIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0Ll9zZXQodGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLCB0YXJnZXRTdGFydClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWx1ZSwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXZhbHVlKSB2YWx1ZSA9IDBcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kKSBlbmQgPSB0aGlzLmxlbmd0aFxuXG4gIGlmIChlbmQgPCBzdGFydCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ2VuZCA8IHN0YXJ0JylcblxuICAvLyBGaWxsIDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVyblxuICBpZiAodGhpcy5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDAgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgICB0aGlzW2ldID0gdmFsdWVcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gdXRmOFRvQnl0ZXModmFsdWUudG9TdHJpbmcoKSlcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgICAgdGhpc1tpXSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGBBcnJheUJ1ZmZlcmAgd2l0aCB0aGUgKmNvcGllZCogbWVtb3J5IG9mIHRoZSBidWZmZXIgaW5zdGFuY2UuXG4gKiBBZGRlZCBpbiBOb2RlIDAuMTIuIE9ubHkgYXZhaWxhYmxlIGluIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBBcnJheUJ1ZmZlci5cbiAqL1xuQnVmZmVyLnByb3RvdHlwZS50b0FycmF5QnVmZmVyID0gZnVuY3Rpb24gdG9BcnJheUJ1ZmZlciAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQpIHtcbiAgICAgIHJldHVybiAobmV3IEJ1ZmZlcih0aGlzKSkuYnVmZmVyXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBidWYgPSBuZXcgVWludDhBcnJheSh0aGlzLmxlbmd0aClcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBidWYubGVuZ3RoOyBpIDwgbGVuOyBpICs9IDEpIHtcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQnVmZmVyLnRvQXJyYXlCdWZmZXIgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXInKVxuICB9XG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIEJQID0gQnVmZmVyLnByb3RvdHlwZVxuXG4vKipcbiAqIEF1Z21lbnQgYSBVaW50OEFycmF5ICppbnN0YW5jZSogKG5vdCB0aGUgVWludDhBcnJheSBjbGFzcyEpIHdpdGggQnVmZmVyIG1ldGhvZHNcbiAqL1xuQnVmZmVyLl9hdWdtZW50ID0gZnVuY3Rpb24gX2F1Z21lbnQgKGFycikge1xuICBhcnIuY29uc3RydWN0b3IgPSBCdWZmZXJcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IHNldCBtZXRob2QgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWRcbiAgYXJyLmdldCA9IEJQLmdldFxuICBhcnIuc2V0ID0gQlAuc2V0XG5cbiAgYXJyLndyaXRlID0gQlAud3JpdGVcbiAgYXJyLnRvU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvTG9jYWxlU3RyaW5nID0gQlAudG9TdHJpbmdcbiAgYXJyLnRvSlNPTiA9IEJQLnRvSlNPTlxuICBhcnIuZXF1YWxzID0gQlAuZXF1YWxzXG4gIGFyci5jb21wYXJlID0gQlAuY29tcGFyZVxuICBhcnIuaW5kZXhPZiA9IEJQLmluZGV4T2ZcbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludExFID0gQlAucmVhZFVJbnRMRVxuICBhcnIucmVhZFVJbnRCRSA9IEJQLnJlYWRVSW50QkVcbiAgYXJyLnJlYWRVSW50OCA9IEJQLnJlYWRVSW50OFxuICBhcnIucmVhZFVJbnQxNkxFID0gQlAucmVhZFVJbnQxNkxFXG4gIGFyci5yZWFkVUludDE2QkUgPSBCUC5yZWFkVUludDE2QkVcbiAgYXJyLnJlYWRVSW50MzJMRSA9IEJQLnJlYWRVSW50MzJMRVxuICBhcnIucmVhZFVJbnQzMkJFID0gQlAucmVhZFVJbnQzMkJFXG4gIGFyci5yZWFkSW50TEUgPSBCUC5yZWFkSW50TEVcbiAgYXJyLnJlYWRJbnRCRSA9IEJQLnJlYWRJbnRCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnRMRSA9IEJQLndyaXRlVUludExFXG4gIGFyci53cml0ZVVJbnRCRSA9IEJQLndyaXRlVUludEJFXG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnRMRSA9IEJQLndyaXRlSW50TEVcbiAgYXJyLndyaXRlSW50QkUgPSBCUC53cml0ZUludEJFXG4gIGFyci53cml0ZUludDggPSBCUC53cml0ZUludDhcbiAgYXJyLndyaXRlSW50MTZMRSA9IEJQLndyaXRlSW50MTZMRVxuICBhcnIud3JpdGVJbnQxNkJFID0gQlAud3JpdGVJbnQxNkJFXG4gIGFyci53cml0ZUludDMyTEUgPSBCUC53cml0ZUludDMyTEVcbiAgYXJyLndyaXRlSW50MzJCRSA9IEJQLndyaXRlSW50MzJCRVxuICBhcnIud3JpdGVGbG9hdExFID0gQlAud3JpdGVGbG9hdExFXG4gIGFyci53cml0ZUZsb2F0QkUgPSBCUC53cml0ZUZsb2F0QkVcbiAgYXJyLndyaXRlRG91YmxlTEUgPSBCUC53cml0ZURvdWJsZUxFXG4gIGFyci53cml0ZURvdWJsZUJFID0gQlAud3JpdGVEb3VibGVCRVxuICBhcnIuZmlsbCA9IEJQLmZpbGxcbiAgYXJyLmluc3BlY3QgPSBCUC5pbnNwZWN0XG4gIGFyci50b0FycmF5QnVmZmVyID0gQlAudG9BcnJheUJ1ZmZlclxuXG4gIHJldHVybiBhcnJcbn1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teK1xcLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0cmluZ3RyaW0oc3RyKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG4iLCJ2YXIgdG9TdHJpbmcgPSB7fS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChhcnIpIHtcbiAgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYXJyKSA9PSAnW29iamVjdCBBcnJheV0nO1xufTtcbiIsInZhciAkID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy8kJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGNyZWF0ZShQLCBEKXtcbiAgcmV0dXJuICQuY3JlYXRlKFAsIEQpO1xufTsiLCJ2YXIgJCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvJCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShpdCwga2V5LCBkZXNjKXtcbiAgcmV0dXJuICQuc2V0RGVzYyhpdCwga2V5LCBkZXNjKTtcbn07IiwidmFyICQgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQnKTtcbnJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICByZXR1cm4gJC5nZXREZXNjKGl0LCBrZXkpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3Quc2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzLyQuY29yZScpLk9iamVjdC5zZXRQcm90b3R5cGVPZjsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYodHlwZW9mIGl0ICE9ICdmdW5jdGlvbicpdGhyb3cgVHlwZUVycm9yKGl0ICsgJyBpcyBub3QgYSBmdW5jdGlvbiEnKTtcbiAgcmV0dXJuIGl0O1xufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLyQuaXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07IiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTsiLCJ2YXIgY29yZSA9IG1vZHVsZS5leHBvcnRzID0ge3ZlcnNpb246ICcxLjIuNid9O1xuaWYodHlwZW9mIF9fZSA9PSAnbnVtYmVyJylfX2UgPSBjb3JlOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVuZGVmIiwiLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG52YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi8kLmEtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gNy4yLjEgUmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudClcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICBpZihpdCA9PSB1bmRlZmluZWQpdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuLyQuZ2xvYmFsJylcbiAgLCBjb3JlICAgICAgPSByZXF1aXJlKCcuLyQuY29yZScpXG4gICwgY3R4ICAgICAgID0gcmVxdWlyZSgnLi8kLmN0eCcpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkZcbiAgICAsIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0LkdcbiAgICAsIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlNcbiAgICAsIElTX1BST1RPICA9IHR5cGUgJiAkZXhwb3J0LlBcbiAgICAsIElTX0JJTkQgICA9IHR5cGUgJiAkZXhwb3J0LkJcbiAgICAsIElTX1dSQVAgICA9IHR5cGUgJiAkZXhwb3J0LldcbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCB0YXJnZXQgICAgPSBJU19HTE9CQUwgPyBnbG9iYWwgOiBJU19TVEFUSUMgPyBnbG9iYWxbbmFtZV0gOiAoZ2xvYmFsW25hbWVdIHx8IHt9KVtQUk9UT1RZUEVdXG4gICAgLCBrZXksIG93biwgb3V0O1xuICBpZihJU19HTE9CQUwpc291cmNlID0gbmFtZTtcbiAgZm9yKGtleSBpbiBzb3VyY2Upe1xuICAgIC8vIGNvbnRhaW5zIGluIG5hdGl2ZVxuICAgIG93biA9ICFJU19GT1JDRUQgJiYgdGFyZ2V0ICYmIGtleSBpbiB0YXJnZXQ7XG4gICAgaWYob3duICYmIGtleSBpbiBleHBvcnRzKWNvbnRpbnVlO1xuICAgIC8vIGV4cG9ydCBuYXRpdmUgb3IgcGFzc2VkXG4gICAgb3V0ID0gb3duID8gdGFyZ2V0W2tleV0gOiBzb3VyY2Vba2V5XTtcbiAgICAvLyBwcmV2ZW50IGdsb2JhbCBwb2xsdXRpb24gZm9yIG5hbWVzcGFjZXNcbiAgICBleHBvcnRzW2tleV0gPSBJU19HTE9CQUwgJiYgdHlwZW9mIHRhcmdldFtrZXldICE9ICdmdW5jdGlvbicgPyBzb3VyY2Vba2V5XVxuICAgIC8vIGJpbmQgdGltZXJzIHRvIGdsb2JhbCBmb3IgY2FsbCBmcm9tIGV4cG9ydCBjb250ZXh0XG4gICAgOiBJU19CSU5EICYmIG93biA/IGN0eChvdXQsIGdsb2JhbClcbiAgICAvLyB3cmFwIGdsb2JhbCBjb25zdHJ1Y3RvcnMgZm9yIHByZXZlbnQgY2hhbmdlIHRoZW0gaW4gbGlicmFyeVxuICAgIDogSVNfV1JBUCAmJiB0YXJnZXRba2V5XSA9PSBvdXQgPyAoZnVuY3Rpb24oQyl7XG4gICAgICB2YXIgRiA9IGZ1bmN0aW9uKHBhcmFtKXtcbiAgICAgICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBDID8gbmV3IEMocGFyYW0pIDogQyhwYXJhbSk7XG4gICAgICB9O1xuICAgICAgRltQUk9UT1RZUEVdID0gQ1tQUk9UT1RZUEVdO1xuICAgICAgcmV0dXJuIEY7XG4gICAgLy8gbWFrZSBzdGF0aWMgdmVyc2lvbnMgZm9yIHByb3RvdHlwZSBtZXRob2RzXG4gICAgfSkob3V0KSA6IElTX1BST1RPICYmIHR5cGVvZiBvdXQgPT0gJ2Z1bmN0aW9uJyA/IGN0eChGdW5jdGlvbi5jYWxsLCBvdXQpIDogb3V0O1xuICAgIGlmKElTX1BST1RPKShleHBvcnRzW1BST1RPVFlQRV0gfHwgKGV4cG9ydHNbUFJPVE9UWVBFXSA9IHt9KSlba2V5XSA9IG91dDtcbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgLy8gZm9yY2VkXG4kZXhwb3J0LkcgPSAyOyAgLy8gZ2xvYmFsXG4kZXhwb3J0LlMgPSA0OyAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgLy8gcHJvdG9cbiRleHBvcnQuQiA9IDE2OyAvLyBiaW5kXG4kZXhwb3J0LlcgPSAzMjsgLy8gd3JhcFxubW9kdWxlLmV4cG9ydHMgPSAkZXhwb3J0OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZXhlYyl7XG4gIHRyeSB7XG4gICAgcmV0dXJuICEhZXhlYygpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59OyIsIi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG52YXIgZ2xvYmFsID0gbW9kdWxlLmV4cG9ydHMgPSB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnICYmIHdpbmRvdy5NYXRoID09IE1hdGhcbiAgPyB3aW5kb3cgOiB0eXBlb2Ygc2VsZiAhPSAndW5kZWZpbmVkJyAmJiBzZWxmLk1hdGggPT0gTWF0aCA/IHNlbGYgOiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuaWYodHlwZW9mIF9fZyA9PSAnbnVtYmVyJylfX2cgPSBnbG9iYWw7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW5kZWYiLCIvLyBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIGFuZCBub24tZW51bWVyYWJsZSBvbGQgVjggc3RyaW5nc1xudmFyIGNvZiA9IHJlcXVpcmUoJy4vJC5jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59OyIsInZhciAkT2JqZWN0ID0gT2JqZWN0O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNyZWF0ZTogICAgICRPYmplY3QuY3JlYXRlLFxuICBnZXRQcm90bzogICAkT2JqZWN0LmdldFByb3RvdHlwZU9mLFxuICBpc0VudW06ICAgICB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZSxcbiAgZ2V0RGVzYzogICAgJE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IsXG4gIHNldERlc2M6ICAgICRPYmplY3QuZGVmaW5lUHJvcGVydHksXG4gIHNldERlc2NzOiAgICRPYmplY3QuZGVmaW5lUHJvcGVydGllcyxcbiAgZ2V0S2V5czogICAgJE9iamVjdC5rZXlzLFxuICBnZXROYW1lczogICAkT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMsXG4gIGdldFN5bWJvbHM6ICRPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzLFxuICBlYWNoOiAgICAgICBbXS5mb3JFYWNoXG59OyIsIi8vIG1vc3QgT2JqZWN0IG1ldGhvZHMgYnkgRVM2IHNob3VsZCBhY2NlcHQgcHJpbWl0aXZlc1xudmFyICRleHBvcnQgPSByZXF1aXJlKCcuLyQuZXhwb3J0JylcbiAgLCBjb3JlICAgID0gcmVxdWlyZSgnLi8kLmNvcmUnKVxuICAsIGZhaWxzICAgPSByZXF1aXJlKCcuLyQuZmFpbHMnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oS0VZLCBleGVjKXtcbiAgdmFyIGZuICA9IChjb3JlLk9iamVjdCB8fCB7fSlbS0VZXSB8fCBPYmplY3RbS0VZXVxuICAgICwgZXhwID0ge307XG4gIGV4cFtLRVldID0gZXhlYyhmbik7XG4gICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogZmFpbHMoZnVuY3Rpb24oKXsgZm4oMSk7IH0pLCAnT2JqZWN0JywgZXhwKTtcbn07IiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xudmFyIGdldERlc2MgID0gcmVxdWlyZSgnLi8kJykuZ2V0RGVzY1xuICAsIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlzLW9iamVjdCcpXG4gICwgYW5PYmplY3QgPSByZXF1aXJlKCcuLyQuYW4tb2JqZWN0Jyk7XG52YXIgY2hlY2sgPSBmdW5jdGlvbihPLCBwcm90byl7XG4gIGFuT2JqZWN0KE8pO1xuICBpZighaXNPYmplY3QocHJvdG8pICYmIHByb3RvICE9PSBudWxsKXRocm93IFR5cGVFcnJvcihwcm90byArIFwiOiBjYW4ndCBzZXQgYXMgcHJvdG90eXBlIVwiKTtcbn07XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGZ1bmN0aW9uKHRlc3QsIGJ1Z2d5LCBzZXQpe1xuICAgICAgdHJ5IHtcbiAgICAgICAgc2V0ID0gcmVxdWlyZSgnLi8kLmN0eCcpKEZ1bmN0aW9uLmNhbGwsIGdldERlc2MoT2JqZWN0LnByb3RvdHlwZSwgJ19fcHJvdG9fXycpLnNldCwgMik7XG4gICAgICAgIHNldCh0ZXN0LCBbXSk7XG4gICAgICAgIGJ1Z2d5ID0gISh0ZXN0IGluc3RhbmNlb2YgQXJyYXkpO1xuICAgICAgfSBjYXRjaChlKXsgYnVnZ3kgPSB0cnVlOyB9XG4gICAgICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pe1xuICAgICAgICBjaGVjayhPLCBwcm90byk7XG4gICAgICAgIGlmKGJ1Z2d5KU8uX19wcm90b19fID0gcHJvdG87XG4gICAgICAgIGVsc2Ugc2V0KE8sIHByb3RvKTtcbiAgICAgICAgcmV0dXJuIE87XG4gICAgICB9O1xuICAgIH0oe30sIGZhbHNlKSA6IHVuZGVmaW5lZCksXG4gIGNoZWNrOiBjaGVja1xufTsiLCIvLyB0byBpbmRleGVkIG9iamVjdCwgdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJT2JqZWN0ID0gcmVxdWlyZSgnLi8kLmlvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuLyQuZGVmaW5lZCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBJT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vJC50by1pb2JqZWN0Jyk7XG5cbnJlcXVpcmUoJy4vJC5vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Ipe1xuICByZXR1cm4gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICAgIHJldHVybiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRvSU9iamVjdChpdCksIGtleSk7XG4gIH07XG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuLyQuZXhwb3J0Jyk7XG4kZXhwb3J0KCRleHBvcnQuUywgJ09iamVjdCcsIHtzZXRQcm90b3R5cGVPZjogcmVxdWlyZSgnLi8kLnNldC1wcm90bycpLnNldH0pOyIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oZXhwb3J0cywgdW5kZWZpbmVkKSB7XG5cbiAgdmFyXG4gICAgLy8gSWYgdGhlIHR5cGVkIGFycmF5IGlzIHVuc3BlY2lmaWVkLCB1c2UgdGhpcy5cbiAgICBEZWZhdWx0QXJyYXlUeXBlID0gRmxvYXQzMkFycmF5LFxuICAgIC8vIFNpbXBsZSBtYXRoIGZ1bmN0aW9ucyB3ZSBuZWVkLlxuICAgIHNxcnQgPSBNYXRoLnNxcnQsXG4gICAgc3FyID0gZnVuY3Rpb24obnVtYmVyKSB7cmV0dXJuIE1hdGgucG93KG51bWJlciwgMil9LFxuICAgIC8vIEludGVybmFsIGNvbnZlbmllbmNlIGNvcGllcyBvZiB0aGUgZXhwb3J0ZWQgZnVuY3Rpb25zXG4gICAgaXNDb21wbGV4QXJyYXksXG4gICAgQ29tcGxleEFycmF5XG5cbiAgZXhwb3J0cy5pc0NvbXBsZXhBcnJheSA9IGlzQ29tcGxleEFycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBvYmouaGFzT3duUHJvcGVydHkgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgb2JqLmhhc093blByb3BlcnR5KCdyZWFsJykgJiZcbiAgICAgIG9iai5oYXNPd25Qcm9wZXJ0eSgnaW1hZycpXG4gIH1cblxuICBleHBvcnRzLkNvbXBsZXhBcnJheSA9IENvbXBsZXhBcnJheSA9IGZ1bmN0aW9uKG90aGVyLCBvcHRfYXJyYXlfdHlwZSl7XG4gICAgaWYgKGlzQ29tcGxleEFycmF5KG90aGVyKSkge1xuICAgICAgLy8gQ29weSBjb25zdHVjdG9yLlxuICAgICAgdGhpcy5BcnJheVR5cGUgPSBvdGhlci5BcnJheVR5cGVcbiAgICAgIHRoaXMucmVhbCA9IG5ldyB0aGlzLkFycmF5VHlwZShvdGhlci5yZWFsKVxuICAgICAgdGhpcy5pbWFnID0gbmV3IHRoaXMuQXJyYXlUeXBlKG90aGVyLmltYWcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuQXJyYXlUeXBlID0gb3B0X2FycmF5X3R5cGUgfHwgRGVmYXVsdEFycmF5VHlwZVxuICAgICAgLy8gb3RoZXIgY2FuIGJlIGVpdGhlciBhbiBhcnJheSBvciBhIG51bWJlci5cbiAgICAgIHRoaXMucmVhbCA9IG5ldyB0aGlzLkFycmF5VHlwZShvdGhlcilcbiAgICAgIHRoaXMuaW1hZyA9IG5ldyB0aGlzLkFycmF5VHlwZSh0aGlzLnJlYWwubGVuZ3RoKVxuICAgIH1cblxuICAgIHRoaXMubGVuZ3RoID0gdGhpcy5yZWFsLmxlbmd0aFxuICB9XG5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb21wb25lbnRzID0gW11cblxuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbihjX3ZhbHVlLCBpKSB7XG4gICAgICBjb21wb25lbnRzLnB1c2goXG4gICAgICAgICcoJyArXG4gICAgICAgIGNfdmFsdWUucmVhbC50b0ZpeGVkKDIpICsgJywnICtcbiAgICAgICAgY192YWx1ZS5pbWFnLnRvRml4ZWQoMikgK1xuICAgICAgICAnKSdcbiAgICAgIClcbiAgICB9KVxuXG4gICAgcmV0dXJuICdbJyArIGNvbXBvbmVudHMuam9pbignLCcpICsgJ10nXG4gIH1cblxuICAvLyBJbi1wbGFjZSBtYXBwZXIuXG4gIENvbXBsZXhBcnJheS5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24obWFwcGVyKSB7XG4gICAgdmFyXG4gICAgICBpLFxuICAgICAgbiA9IHRoaXMubGVuZ3RoLFxuICAgICAgLy8gRm9yIEdDIGVmZmljaWVuY3ksIHBhc3MgYSBzaW5nbGUgY192YWx1ZSBvYmplY3QgdG8gdGhlIG1hcHBlci5cbiAgICAgIGNfdmFsdWUgPSB7fVxuXG4gICAgZm9yIChpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgY192YWx1ZS5yZWFsID0gdGhpcy5yZWFsW2ldXG4gICAgICBjX3ZhbHVlLmltYWcgPSB0aGlzLmltYWdbaV1cbiAgICAgIG1hcHBlcihjX3ZhbHVlLCBpLCBuKVxuICAgICAgdGhpcy5yZWFsW2ldID0gY192YWx1ZS5yZWFsXG4gICAgICB0aGlzLmltYWdbaV0gPSBjX3ZhbHVlLmltYWdcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oaXRlcmF0b3IpIHtcbiAgICB2YXJcbiAgICAgIGksXG4gICAgICBuID0gdGhpcy5sZW5ndGgsXG4gICAgICAvLyBGb3IgY29uc2lzdGVuY3kgd2l0aCAubWFwLlxuICAgICAgY192YWx1ZSA9IHt9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICBjX3ZhbHVlLnJlYWwgPSB0aGlzLnJlYWxbaV1cbiAgICAgIGNfdmFsdWUuaW1hZyA9IHRoaXMuaW1hZ1tpXVxuICAgICAgaXRlcmF0b3IoY192YWx1ZSwgaSwgbilcbiAgICB9XG4gIH1cblxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLmNvbmp1Z2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAobmV3IENvbXBsZXhBcnJheSh0aGlzKSkubWFwKGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YWx1ZS5pbWFnICo9IC0xXG4gICAgfSlcbiAgfVxuXG4gIC8vIEhlbHBlciBzbyB3ZSBjYW4gbWFrZSBBcnJheVR5cGUgb2JqZWN0cyByZXR1cm5lZCBoYXZlIHNpbWlsYXIgaW50ZXJmYWNlc1xuICAvLyAgIHRvIENvbXBsZXhBcnJheXMuXG4gIGZ1bmN0aW9uIGl0ZXJhYmxlKG9iaikge1xuICAgIGlmICghb2JqLmZvckVhY2gpXG4gICAgICBvYmouZm9yRWFjaCA9IGZ1bmN0aW9uKGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpLCBuID0gdGhpcy5sZW5ndGhcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKVxuICAgICAgICAgIGl0ZXJhdG9yKHRoaXNbaV0sIGksIG4pXG4gICAgICB9XG5cbiAgICByZXR1cm4gb2JqXG4gIH1cblxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLm1hZ25pdHVkZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYWdzID0gbmV3IHRoaXMuQXJyYXlUeXBlKHRoaXMubGVuZ3RoKVxuXG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uKHZhbHVlLCBpKSB7XG4gICAgICBtYWdzW2ldID0gc3FydChzcXIodmFsdWUucmVhbCkgKyBzcXIodmFsdWUuaW1hZykpXG4gICAgfSlcblxuICAgIC8vIEFycmF5VHlwZSB3aWxsIG5vdCBuZWNlc3NhcmlseSBiZSBpdGVyYWJsZTogbWFrZSBpdCBzby5cbiAgICByZXR1cm4gaXRlcmFibGUobWFncylcbiAgfVxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgJiYgKHRoaXMuY29tcGxleF9hcnJheSA9IHt9KSB8fCBleHBvcnRzKVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oZXhwb3J0cywgY29tcGxleF9hcnJheSkge1xuXG4gIHZhclxuICAgIENvbXBsZXhBcnJheSA9IGNvbXBsZXhfYXJyYXkuQ29tcGxleEFycmF5LFxuICAgIC8vIE1hdGggY29uc3RhbnRzIGFuZCBmdW5jdGlvbnMgd2UgbmVlZC5cbiAgICBQSSA9IE1hdGguUEksXG4gICAgU1FSVDFfMiA9IE1hdGguU1FSVDFfMixcbiAgICBzcXJ0ID0gTWF0aC5zcXJ0LFxuICAgIGNvcyA9IE1hdGguY29zLFxuICAgIHNpbiA9IE1hdGguc2luXG5cbiAgQ29tcGxleEFycmF5LnByb3RvdHlwZS5GRlQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gRkZUKHRoaXMsIGZhbHNlKVxuICB9XG5cbiAgZXhwb3J0cy5GRlQgPSBmdW5jdGlvbihpbnB1dCkge1xuICAgIHJldHVybiBlbnN1cmVDb21wbGV4QXJyYXkoaW5wdXQpLkZGVCgpXG4gIH1cblxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLkludkZGVCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBGRlQodGhpcywgdHJ1ZSlcbiAgfVxuXG4gIGV4cG9ydHMuSW52RkZUID0gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gZW5zdXJlQ29tcGxleEFycmF5KGlucHV0KS5JbnZGRlQoKVxuICB9XG5cbiAgLy8gQXBwbGllcyBhIGZyZXF1ZW5jeS1zcGFjZSBmaWx0ZXIgdG8gaW5wdXQsIGFuZCByZXR1cm5zIHRoZSByZWFsLXNwYWNlXG4gIC8vIGZpbHRlcmVkIGlucHV0LlxuICAvLyBmaWx0ZXJlciBhY2NlcHRzIGZyZXEsIGksIG4gYW5kIG1vZGlmaWVzIGZyZXEucmVhbCBhbmQgZnJlcS5pbWFnLlxuICBDb21wbGV4QXJyYXkucHJvdG90eXBlLmZyZXF1ZW5jeU1hcCA9IGZ1bmN0aW9uKGZpbHRlcmVyKSB7XG4gICAgcmV0dXJuIHRoaXMuRkZUKCkubWFwKGZpbHRlcmVyKS5JbnZGRlQoKVxuICB9XG5cbiAgZXhwb3J0cy5mcmVxdWVuY3lNYXAgPSBmdW5jdGlvbihpbnB1dCwgZmlsdGVyZXIpIHtcbiAgICByZXR1cm4gZW5zdXJlQ29tcGxleEFycmF5KGlucHV0KS5mcmVxdWVuY3lNYXAoZmlsdGVyZXIpXG4gIH1cblxuICBmdW5jdGlvbiBlbnN1cmVDb21wbGV4QXJyYXkoaW5wdXQpIHtcbiAgICByZXR1cm4gY29tcGxleF9hcnJheS5pc0NvbXBsZXhBcnJheShpbnB1dCkgJiYgaW5wdXQgfHxcbiAgICAgICAgbmV3IENvbXBsZXhBcnJheShpbnB1dClcbiAgfVxuXG4gIGZ1bmN0aW9uIEZGVChpbnB1dCwgaW52ZXJzZSkge1xuICAgIHZhciBuID0gaW5wdXQubGVuZ3RoXG5cbiAgICBpZiAobiAmIChuIC0gMSkpIHtcbiAgICAgIHJldHVybiBGRlRfUmVjdXJzaXZlKGlucHV0LCBpbnZlcnNlKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gRkZUXzJfSXRlcmF0aXZlKGlucHV0LCBpbnZlcnNlKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIEZGVF9SZWN1cnNpdmUoaW5wdXQsIGludmVyc2UpIHtcbiAgICB2YXJcbiAgICAgIG4gPSBpbnB1dC5sZW5ndGgsXG4gICAgICAvLyBDb3VudGVycy5cbiAgICAgIGksIGosXG4gICAgICBvdXRwdXQsXG4gICAgICAvLyBDb21wbGV4IG11bHRpcGxpZXIgYW5kIGl0cyBkZWx0YS5cbiAgICAgIGZfciwgZl9pLCBkZWxfZl9yLCBkZWxfZl9pLFxuICAgICAgLy8gTG93ZXN0IGRpdmlzb3IgYW5kIHJlbWFpbmRlci5cbiAgICAgIHAsIG0sXG4gICAgICBub3JtYWxpc2F0aW9uLFxuICAgICAgcmVjdXJzaXZlX3Jlc3VsdCxcbiAgICAgIF9zd2FwLCBfcmVhbCwgX2ltYWdcblxuICAgIGlmIChuID09PSAxKSB7XG4gICAgICByZXR1cm4gaW5wdXRcbiAgICB9XG5cbiAgICBvdXRwdXQgPSBuZXcgQ29tcGxleEFycmF5KG4sIGlucHV0LkFycmF5VHlwZSlcblxuICAgIC8vIFVzZSB0aGUgbG93ZXN0IG9kZCBmYWN0b3IsIHNvIHdlIGFyZSBhYmxlIHRvIHVzZSBGRlRfMl9JdGVyYXRpdmUgaW4gdGhlXG4gICAgLy8gcmVjdXJzaXZlIHRyYW5zZm9ybXMgb3B0aW1hbGx5LlxuICAgIHAgPSBMb3dlc3RPZGRGYWN0b3IobilcbiAgICBtID0gbiAvIHBcbiAgICBub3JtYWxpc2F0aW9uID0gMSAvIHNxcnQocClcbiAgICByZWN1cnNpdmVfcmVzdWx0ID0gbmV3IENvbXBsZXhBcnJheShtLCBpbnB1dC5BcnJheVR5cGUpXG5cbiAgICAvLyBMb29wcyBnbyBsaWtlIE8obiDOoyBwX2kpLCB3aGVyZSBwX2kgYXJlIHRoZSBwcmltZSBmYWN0b3JzIG9mIG4uXG4gICAgLy8gZm9yIGEgcG93ZXIgb2YgYSBwcmltZSwgcCwgdGhpcyByZWR1Y2VzIHRvIE8obiBwIGxvZ19wIG4pXG4gICAgZm9yKGogPSAwOyBqIDwgcDsgaisrKSB7XG4gICAgICBmb3IoaSA9IDA7IGkgPCBtOyBpKyspIHtcbiAgICAgICAgcmVjdXJzaXZlX3Jlc3VsdC5yZWFsW2ldID0gaW5wdXQucmVhbFtpICogcCArIGpdXG4gICAgICAgIHJlY3Vyc2l2ZV9yZXN1bHQuaW1hZ1tpXSA9IGlucHV0LmltYWdbaSAqIHAgKyBqXVxuICAgICAgfVxuICAgICAgLy8gRG9uJ3QgZ28gZGVlcGVyIHVubGVzcyBuZWNlc3NhcnkgdG8gc2F2ZSBhbGxvY3MuXG4gICAgICBpZiAobSA+IDEpIHtcbiAgICAgICAgcmVjdXJzaXZlX3Jlc3VsdCA9IEZGVChyZWN1cnNpdmVfcmVzdWx0LCBpbnZlcnNlKVxuICAgICAgfVxuXG4gICAgICBkZWxfZl9yID0gY29zKDIqUEkqai9uKVxuICAgICAgZGVsX2ZfaSA9IChpbnZlcnNlID8gLTEgOiAxKSAqIHNpbigyKlBJKmovbilcbiAgICAgIGZfciA9IDFcbiAgICAgIGZfaSA9IDBcblxuICAgICAgZm9yKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIF9yZWFsID0gcmVjdXJzaXZlX3Jlc3VsdC5yZWFsW2kgJSBtXVxuICAgICAgICBfaW1hZyA9IHJlY3Vyc2l2ZV9yZXN1bHQuaW1hZ1tpICUgbV1cblxuICAgICAgICBvdXRwdXQucmVhbFtpXSArPSBmX3IgKiBfcmVhbCAtIGZfaSAqIF9pbWFnXG4gICAgICAgIG91dHB1dC5pbWFnW2ldICs9IGZfciAqIF9pbWFnICsgZl9pICogX3JlYWxcblxuICAgICAgICBfc3dhcCA9IGZfciAqIGRlbF9mX3IgLSBmX2kgKiBkZWxfZl9pXG4gICAgICAgIGZfaSA9IGZfciAqIGRlbF9mX2kgKyBmX2kgKiBkZWxfZl9yXG4gICAgICAgIGZfciA9IF9zd2FwXG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ29weSBiYWNrIHRvIGlucHV0IHRvIG1hdGNoIEZGVF8yX0l0ZXJhdGl2ZSBpbi1wbGFjZW5lc3NcbiAgICAvLyBUT0RPOiBmYXN0ZXIgd2F5IG9mIG1ha2luZyB0aGlzIGluLXBsYWNlP1xuICAgIGZvcihpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgaW5wdXQucmVhbFtpXSA9IG5vcm1hbGlzYXRpb24gKiBvdXRwdXQucmVhbFtpXVxuICAgICAgaW5wdXQuaW1hZ1tpXSA9IG5vcm1hbGlzYXRpb24gKiBvdXRwdXQuaW1hZ1tpXVxuICAgIH1cblxuICAgIHJldHVybiBpbnB1dFxuICB9XG5cbiAgZnVuY3Rpb24gRkZUXzJfSXRlcmF0aXZlKGlucHV0LCBpbnZlcnNlKSB7XG4gICAgdmFyXG4gICAgICBuID0gaW5wdXQubGVuZ3RoLFxuICAgICAgLy8gQ291bnRlcnMuXG4gICAgICBpLCBqLFxuICAgICAgb3V0cHV0LCBvdXRwdXRfciwgb3V0cHV0X2ksXG4gICAgICAvLyBDb21wbGV4IG11bHRpcGxpZXIgYW5kIGl0cyBkZWx0YS5cbiAgICAgIGZfciwgZl9pLCBkZWxfZl9yLCBkZWxfZl9pLCB0ZW1wLFxuICAgICAgLy8gVGVtcG9yYXJ5IGxvb3AgdmFyaWFibGVzLlxuICAgICAgbF9pbmRleCwgcl9pbmRleCxcbiAgICAgIGxlZnRfciwgbGVmdF9pLCByaWdodF9yLCByaWdodF9pLFxuICAgICAgLy8gd2lkdGggb2YgZWFjaCBzdWItYXJyYXkgZm9yIHdoaWNoIHdlJ3JlIGl0ZXJhdGl2ZWx5IGNhbGN1bGF0aW5nIEZGVC5cbiAgICAgIHdpZHRoXG5cbiAgICBvdXRwdXQgPSBCaXRSZXZlcnNlQ29tcGxleEFycmF5KGlucHV0KVxuICAgIG91dHB1dF9yID0gb3V0cHV0LnJlYWxcbiAgICBvdXRwdXRfaSA9IG91dHB1dC5pbWFnXG4gICAgLy8gTG9vcHMgZ28gbGlrZSBPKG4gbG9nIG4pOlxuICAgIC8vICAgd2lkdGggfiBsb2cgbjsgaSxqIH4gblxuICAgIHdpZHRoID0gMVxuICAgIHdoaWxlICh3aWR0aCA8IG4pIHtcbiAgICAgIGRlbF9mX3IgPSBjb3MoUEkvd2lkdGgpXG4gICAgICBkZWxfZl9pID0gKGludmVyc2UgPyAtMSA6IDEpICogc2luKFBJL3dpZHRoKVxuICAgICAgZm9yIChpID0gMDsgaSA8IG4vKDIqd2lkdGgpOyBpKyspIHtcbiAgICAgICAgZl9yID0gMVxuICAgICAgICBmX2kgPSAwXG4gICAgICAgIGZvciAoaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG4gICAgICAgICAgbF9pbmRleCA9IDIqaSp3aWR0aCArIGpcbiAgICAgICAgICByX2luZGV4ID0gbF9pbmRleCArIHdpZHRoXG5cbiAgICAgICAgICBsZWZ0X3IgPSBvdXRwdXRfcltsX2luZGV4XVxuICAgICAgICAgIGxlZnRfaSA9IG91dHB1dF9pW2xfaW5kZXhdXG4gICAgICAgICAgcmlnaHRfciA9IGZfciAqIG91dHB1dF9yW3JfaW5kZXhdIC0gZl9pICogb3V0cHV0X2lbcl9pbmRleF1cbiAgICAgICAgICByaWdodF9pID0gZl9pICogb3V0cHV0X3Jbcl9pbmRleF0gKyBmX3IgKiBvdXRwdXRfaVtyX2luZGV4XVxuXG4gICAgICAgICAgb3V0cHV0X3JbbF9pbmRleF0gPSBTUVJUMV8yICogKGxlZnRfciArIHJpZ2h0X3IpXG4gICAgICAgICAgb3V0cHV0X2lbbF9pbmRleF0gPSBTUVJUMV8yICogKGxlZnRfaSArIHJpZ2h0X2kpXG4gICAgICAgICAgb3V0cHV0X3Jbcl9pbmRleF0gPSBTUVJUMV8yICogKGxlZnRfciAtIHJpZ2h0X3IpXG4gICAgICAgICAgb3V0cHV0X2lbcl9pbmRleF0gPSBTUVJUMV8yICogKGxlZnRfaSAtIHJpZ2h0X2kpXG4gICAgICAgICAgdGVtcCA9IGZfciAqIGRlbF9mX3IgLSBmX2kgKiBkZWxfZl9pXG4gICAgICAgICAgZl9pID0gZl9yICogZGVsX2ZfaSArIGZfaSAqIGRlbF9mX3JcbiAgICAgICAgICBmX3IgPSB0ZW1wXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHdpZHRoIDw8PSAxXG4gICAgfVxuXG4gICAgcmV0dXJuIG91dHB1dFxuICB9XG5cbiAgZnVuY3Rpb24gQml0UmV2ZXJzZUluZGV4KGluZGV4LCBuKSB7XG4gICAgdmFyIGJpdHJldmVyc2VkX2luZGV4ID0gMFxuXG4gICAgd2hpbGUgKG4gPiAxKSB7XG4gICAgICBiaXRyZXZlcnNlZF9pbmRleCA8PD0gMVxuICAgICAgYml0cmV2ZXJzZWRfaW5kZXggKz0gaW5kZXggJiAxXG4gICAgICBpbmRleCA+Pj0gMVxuICAgICAgbiA+Pj0gMVxuICAgIH1cbiAgICByZXR1cm4gYml0cmV2ZXJzZWRfaW5kZXhcbiAgfVxuXG4gIGZ1bmN0aW9uIEJpdFJldmVyc2VDb21wbGV4QXJyYXkoYXJyYXkpIHtcbiAgICB2YXIgbiA9IGFycmF5Lmxlbmd0aCxcbiAgICAgICAgZmxpcHMgPSB7fSxcbiAgICAgICAgc3dhcCxcbiAgICAgICAgaVxuXG4gICAgZm9yKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICB2YXIgcl9pID0gQml0UmV2ZXJzZUluZGV4KGksIG4pXG5cbiAgICAgIGlmIChmbGlwcy5oYXNPd25Qcm9wZXJ0eShpKSB8fCBmbGlwcy5oYXNPd25Qcm9wZXJ0eShyX2kpKSBjb250aW51ZVxuXG4gICAgICBzd2FwID0gYXJyYXkucmVhbFtyX2ldXG4gICAgICBhcnJheS5yZWFsW3JfaV0gPSBhcnJheS5yZWFsW2ldXG4gICAgICBhcnJheS5yZWFsW2ldID0gc3dhcFxuXG4gICAgICBzd2FwID0gYXJyYXkuaW1hZ1tyX2ldXG4gICAgICBhcnJheS5pbWFnW3JfaV0gPSBhcnJheS5pbWFnW2ldXG4gICAgICBhcnJheS5pbWFnW2ldID0gc3dhcFxuXG4gICAgICBmbGlwc1tpXSA9IGZsaXBzW3JfaV0gPSB0cnVlXG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5XG4gIH1cblxuICBmdW5jdGlvbiBMb3dlc3RPZGRGYWN0b3Iobikge1xuICAgIHZhciBmYWN0b3IgPSAzLFxuICAgICAgICBzcXJ0X24gPSBzcXJ0KG4pXG5cbiAgICB3aGlsZShmYWN0b3IgPD0gc3FydF9uKSB7XG4gICAgICBpZiAobiAlIGZhY3RvciA9PT0gMCkgcmV0dXJuIGZhY3RvclxuICAgICAgZmFjdG9yID0gZmFjdG9yICsgMlxuICAgIH1cbiAgICByZXR1cm4gblxuICB9XG5cbn0oXG4gIHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyAmJiAodGhpcy5mZnQgPSB7fSkgfHwgZXhwb3J0cyxcbiAgdHlwZW9mIHJlcXVpcmUgPT09ICd1bmRlZmluZWQnICYmICh0aGlzLmNvbXBsZXhfYXJyYXkpIHx8XG4gICAgcmVxdWlyZSgnLi9jb21wbGV4X2FycmF5JylcbilcbiIsImxldCBpZCA9IDA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VMZm8ge1xuICAvKipcbiAgICogQHRvZG8gLSByZXZlcnNlIGFyZ3VtZW50cyBvcmRlciwgaXMgd2VpcmRcbiAgICovXG4gIGNvbnN0cnVjdG9yKGRlZmF1bHRzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIHRoaXMuY2lkID0gaWQrKztcbiAgICB0aGlzLnBhcmFtcyA9IHt9O1xuXG4gICAgdGhpcy5zdHJlYW1QYXJhbXMgPSB7XG4gICAgICBmcmFtZVNpemU6IDEsXG4gICAgICBmcmFtZVJhdGU6IDAsXG4gICAgICBzb3VyY2VTYW1wbGVSYXRlOiAwXG4gICAgfTtcblxuICAgIHRoaXMucGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMuY2hpbGRyZW4gPSBbXTtcblxuICAgIC8vIHN0cmVhbSBkYXRhXG4gICAgdGhpcy50aW1lID0gMDtcbiAgICB0aGlzLm91dEZyYW1lID0gbnVsbDtcbiAgICB0aGlzLm1ldGFEYXRhID0ge307XG4gIH1cblxuICAvLyBXZWJBdWRpb0FQSSBgY29ubmVjdGAgbGlrZSBtZXRob2RcbiAgY29ubmVjdChjaGlsZCkge1xuICAgIGlmICh0aGlzLnN0cmVhbVBhcmFtcyA9PT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjYW5ub3QgY29ubmVjdCB0byBhIGRlYWQgbGZvIG5vZGUnKTtcbiAgICB9XG5cbiAgICB0aGlzLmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIGNoaWxkLnBhcmVudCA9IHRoaXM7XG4gIH1cblxuICAvLyBkZWZpbmUgaWYgc3VmZmlzY2llbnRcbiAgZGlzY29ubmVjdCgpIHtcbiAgICAvLyByZW1vdmUgaXRzZWxmIGZyb20gcGFyZW50IGNoaWxkcmVuXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnBhcmVudC5jaGlsZHJlbi5pbmRleE9mKHRoaXMpO1xuICAgIHRoaXMucGFyZW50LmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgLy8gdGhpcy5wYXJlbnQgPSBudWxsO1xuICAgIC8vIHRoaXMuY2hpbGRyZW4gPSBudWxsO1xuICB9XG5cbiAgLy8gaW5pdGlhbGl6ZSB0aGUgY3VycmVudCBub2RlIHN0cmVhbSBhbmQgcHJvcGFnYXRlIHRvIGl0J3MgY2hpbGRyZW5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcyA9IHt9LCBvdXRTdHJlYW1QYXJhbXMgPSB7fSkge1xuICAgIE9iamVjdC5hc3NpZ24odGhpcy5zdHJlYW1QYXJhbXMsIGluU3RyZWFtUGFyYW1zLCBvdXRTdHJlYW1QYXJhbXMpO1xuXG4gICAgLy8gY3JlYXRlIHRoZSBgb3V0RnJhbWVgIGFycmF5QnVmZmVyXG4gICAgdGhpcy5zZXR1cFN0cmVhbSgpO1xuXG4gICAgLy8gcHJvcGFnYXRlIGluaXRpYWxpemF0aW9uIGluIGxmbyBjaGFpblxuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5baV0uaW5pdGlhbGl6ZSh0aGlzLnN0cmVhbVBhcmFtcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSB0aGUgb3V0cHV0RnJhbWUgYWNjb3JkaW5nIHRvIHRoZSBgc3RyZWFtUGFyYW1zYFxuICAgKi9cbiAgc2V0dXBTdHJlYW0oKSB7XG4gICAgY29uc3QgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXG4gICAgaWYoZnJhbWVTaXplID4gMClcbiAgICAgIHRoaXMub3V0RnJhbWUgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lU2l6ZSk7XG4gIH1cblxuICAvLyByZXNldCBgb3V0RnJhbWVgIGFuZCBjYWxsIHJlc2V0IG9uIGNoaWxkcmVuXG4gIHJlc2V0KCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMuY2hpbGRyZW5baV0ucmVzZXQoKTtcbiAgICB9XG5cbiAgICAvLyBzaW5rcyBoYXZlIG5vIGBvdXRGcmFtZWBcbiAgICBpZiAoIXRoaXMub3V0RnJhbWUpIHsgcmV0dXJuIH1cblxuICAgIC8vIHRoaXMub3V0RnJhbWUuZmlsbCgwKTsgLy8gcHJvYmFibHkgYmV0dGVyIGJ1dCBkb2Vzbid0IHdvcmsgeWV0XG4gICAgZm9yIChsZXQgaSA9IDAsIGwgPSB0aGlzLm91dEZyYW1lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdGhpcy5vdXRGcmFtZVtpXSA9IDA7XG4gICAgfVxuICB9XG5cbiAgLy8gZmluYWxpemUgc3RyZWFtXG4gIGZpbmFsaXplKGVuZFRpbWUpIHtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuW2ldLmZpbmFsaXplKGVuZFRpbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGZvcndhcmQgdGhlIGN1cnJlbnQgc3RhdGUgKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkgdG8gYWxsIHRoZSBjaGlsZHJlblxuICBvdXRwdXQodGltZSA9IHRoaXMudGltZSwgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lLCBtZXRhRGF0YSA9IHRoaXMubWV0YURhdGEpIHtcbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IHRoaXMuY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuW2ldLnByb2Nlc3ModGltZSwgb3V0RnJhbWUsIG1ldGFEYXRhKTtcbiAgICB9XG4gIH1cblxuICAvLyBtYWluIGZ1bmN0aW9uIHRvIG92ZXJyaWRlLCBkZWZhdWx0cyB0byBub29wXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm91dEZyYW1lID0gZnJhbWU7XG4gICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXG4gICAgdGhpcy5vdXRwdXQoKTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgLy8gY2FsbCBgZGVzdHJveWAgaW4gYWxsIGl0J3MgY2hpbGRyZW5cbiAgICBsZXQgaW5kZXggPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcblxuICAgIHdoaWxlIChpbmRleC0tKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuW2luZGV4XS5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLy8gZGVsZXRlIGl0c2VsZiBmcm9tIHRoZSBwYXJlbnQgbm9kZVxuICAgIGlmICh0aGlzLnBhcmVudCkge1xuICAgICAgY29uc3QgaW5kZXggPSAgdGhpcy5wYXJlbnQuY2hpbGRyZW4uaW5kZXhPZih0aGlzKTtcbiAgICAgIHRoaXMucGFyZW50LmNoaWxkcmVuLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuXG4gICAgLy8gY2Fubm90IHVzZSBhIGRlYWQgb2JqZWN0IGFzIHBhcmVudFxuICAgIHRoaXMuc3RyZWFtUGFyYW1zID0gbnVsbDtcblxuICAgIC8vIGNsZWFuIGl0J3Mgb3duIHJlZmVyZW5jZXMgLyBkaXNjb25uZWN0IGF1ZGlvIG5vZGVzIGlmIG5lZWRlZFxuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuL2Jhc2UtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBCYXNlTGZvXG59O1xuIiwiZXhwb3J0IHsgZGVmYXVsdCBhcyBjb3JlIH0gZnJvbSAnLi9jb3JlJztcbmV4cG9ydCB7IGRlZmF1bHQgYXMgc291cmNlcyB9IGZyb20gJy4vc291cmNlcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIHNpbmtzIH0gZnJvbSAnLi9zaW5rcyc7XG5leHBvcnQgeyBkZWZhdWx0IGFzIG9wZXJhdG9ycyB9IGZyb20gJy4vb3BlcmF0b3JzJztcbiIsIi8qKlxuICogQGZpbGVvdmVydmlldyBXQVZFIExGTyBtb2R1bGU6IGJpcXVhZCBmaWx0ZXIuXG4gKiBAYXV0aG9yIEplYW4tUGhpbGlwcGUuTGFtYmVydEBpcmNhbS5mciwgTm9yYmVydC5TY2huZWxsQGlyY2FtLmZyLCB2aWN0b3Iuc2FpekBpcmNhbS5mclxuICogQHZlcnNpb24gMC4xLjBcbiAqXG4gKiBAYnJpZWYgIEJpcXVhZCBmaWx0ZXIgYW5kIGNvZWZmaWNpZW50cyBjYWxjdWxhdG9yXG4gKlxuICogQmFzZWQgb24gdGhlIFwiQ29va2Jvb2sgZm9ybXVsYWUgZm9yIGF1ZGlvIEVRIGJpcXVhZCBmaWx0ZXJcbiAqIGNvZWZmaWNpZW50c1wiIGJ5IFJvYmVydCBCcmlzdG93LUpvaG5zb25cbiAqXG4gKi9cblxuLyogeShuKSA9IGIwIHgobikgKyBiMSB4KG4tMSkgKyBiMiB4KG4tMikgICovXG4vKiAgICAgICAgICAgICAgICAtIGExIHgobi0xKSAtIGEyIHgobi0yKSAgKi9cblxuLyogZjAgaXMgbm9ybWFsaXNlZCBieSB0aGUgbnlxdWlzdCBmcmVxdWVuY3kgKi9cbi8qIHEgbXVzdCBiZSA+IDAuICovXG4vKiBnYWluIG11c3QgYmUgPiAwLiBhbmQgaXMgbGluZWFyICovXG5cbi8qIHdoZW4gdGhlcmUgaXMgbm8gZ2FpbiBwYXJhbWV0ZXIsIG9uZSBjYW4gc2ltcGx5IG11bHRpcGx5IHRoZSBiXG4gKiBjb2VmZmljaWVudHMgYnkgYSAobGluZWFyKSBnYWluICovXG5cbi8qIGEwIGlzIGFsd2F5cyAxLiBhcyBlYWNoIGNvZWZmaWNpZW50IGlzIG5vcm1hbGlzZWQgYnkgYTAsIGluY2x1ZGluZyBhMCAqL1xuXG4vKiBhMSBpcyBhWzBdIGFuZCBhMiBpcyBhWzFdICovXG5cbmltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG52YXIgc2luID0gTWF0aC5zaW47XG52YXIgY29zID0gTWF0aC5jb3M7XG52YXIgTV9QSSA9IE1hdGguUEk7XG52YXIgc3FydCA9IE1hdGguc3FydDtcblxuLy8gY29lZnMgY2FsY3VsYXRpb25zXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuLyogTFBGOiBIKHMpID0gMSAvIChzXjIgKyBzL1EgKyAxKSAqL1xuZnVuY3Rpb24gbG93cGFzc19jb2VmcyhmMCwgcSwgY29lZnMpIHtcbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSAoKDEuMCAtIGMpICogMC41KSAqIGEwX2ludjtcbiAgY29lZnMuYjEgPSAoMS4wIC0gYykgKiBhMF9pbnY7XG4gIGNvZWZzLmIyID0gY29lZnMuYjA7XG59XG5cbiAgLyogSFBGOiBIKHMpID0gc14yIC8gKHNeMiArIHMvUSArIDEpICovXG5mdW5jdGlvbiBoaWdocGFzc19jb2VmcyhmMCwgcSwgY29lZnMpIHtcbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSAoKDEuMCArIGMpICogMC41KSAqIGEwX2ludjtcbiAgY29lZnMuYjEgPSAoLTEuMCAtIGMpICogYTBfaW52O1xuICBjb2Vmcy5iMiA9IGNvZWZzLmIwO1xufVxuXG4vKiBCUEY6IEgocykgPSBzIC8gKHNeMiArIHMvUSArIDEpICAoY29uc3RhbnQgc2tpcnQgZ2FpbiwgcGVhayBnYWluID0gUSkgKi9cbmZ1bmN0aW9uIGJhbmRwYXNzX2NvbnN0YW50X3NraXJ0X2NvZWZzKGYwLCBxLCBjb2Vmcykge1xuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBzID0gc2luKHcwKTtcbiAgdmFyIGFscGhhID0gcyAvICgyLjAgKiBxKTtcbiAgdmFyIGMgPSBjb3ModzApO1xuXG4gIHZhciBhMF9pbnYgPSAxLjAgLyAoMS4wICsgYWxwaGEpO1xuXG4gIGNvZWZzLmExID0gKC0yLjAgKiBjKSAqIGEwX2ludjtcbiAgY29lZnMuYTIgPSAoMS4wIC0gYWxwaGEpICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gKHMgKiAwLjUpICogYTBfaW52O1xuICBjb2Vmcy5iMSA9IDAuMDtcbiAgY29lZnMuYjIgPSAtY29lZnMuYjA7XG59XG5cbi8qIEJQRjogSChzKSA9IChzL1EpIC8gKHNeMiArIHMvUSArIDEpICAgICAgKGNvbnN0YW50IDAgZEIgcGVhayBnYWluKSAqL1xuZnVuY3Rpb24gYmFuZHBhc3NfY29uc3RhbnRfcGVha19jb2VmcyhmMCwgcSwgY29lZnMpIHtcbiAgdmFyIHcwID0gTV9QSSAqIGYwO1xuICB2YXIgYWxwaGEgPSBzaW4odzApIC8gKDIuMCAqIHEpO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICgxLjAgKyBhbHBoYSk7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSkgKiBhMF9pbnY7XG5cbiAgY29lZnMuYjAgPSBhbHBoYSAqIGEwX2ludjtcbiAgY29lZnMuYjEgPSAwLjA7XG4gIGNvZWZzLmIyID0gLWNvZWZzLmIwO1xufVxuXG4vKiBub3RjaDogSChzKSA9IChzXjIgKyAxKSAvIChzXjIgKyBzL1EgKyAxKSAqL1xuZnVuY3Rpb24gbm90Y2hfY29lZnMoZjAsIHEsIGNvZWZzKSB7XG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIGFscGhhID0gc2luKHcwKSAvICgyLjAgKiBxKTtcbiAgdmFyIGMgPSBjb3ModzApO1xuXG4gIHZhciBhMF9pbnYgPSAxLjAgLyAoMS4wICsgYWxwaGEpO1xuXG4gIGNvZWZzLmExID0gKC0yLjAgKiBjKSAqIGEwX2ludjtcbiAgY29lZnMuYTIgPSAoMS4wIC0gYWxwaGEpICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gYTBfaW52O1xuICBjb2Vmcy5iMSA9IGNvZWZzLmExO1xuICBjb2Vmcy5iMiA9IGNvZWZzLmIwO1xufVxuXG4vKiBBUEY6IEgocykgPSAoc14yIC0gcy9RICsgMSkgLyAoc14yICsgcy9RICsgMSkgKi9cbmZ1bmN0aW9uIGFsbHBhc3NfY29lZnMoZjAsIHEsIGNvZWZzKSB7XG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIGFscGhhID0gc2luKHcwKSAvICgyLjAgKiBxKTtcbiAgdmFyIGMgPSBjb3ModzApO1xuXG4gIHZhciBhMF9pbnYgPSAxLjAgLyAoMS4wICsgYWxwaGEpO1xuXG4gIGNvZWZzLmExID0gKC0yLjAgKiBjKSAqIGEwX2ludjtcbiAgY29lZnMuYTIgPSAoMS4wIC0gYWxwaGEpICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gY29lZnMuYTI7XG4gIGNvZWZzLmIxID0gY29lZnMuYTE7XG4gIGNvZWZzLmIyID0gMS4wO1xufVxuXG4vKiBwZWFraW5nRVE6IEgocykgPSAoc14yICsgcyooQS9RKSArIDEpIC8gKHNeMiArIHMvKEEqUSkgKyAxKSAqL1xuLyogQSA9IHNxcnQoIDEwXihkQmdhaW4vMjApICkgPSAxMF4oZEJnYWluLzQwKSAqL1xuLyogZ2FpbiBpcyBsaW5lYXIgaGVyZSAqL1xuZnVuY3Rpb24gcGVha2luZ19jb2VmcyhmMCwgcSwgZ2FpbiwgY29lZnMpIHtcbiAgdmFyIGcgPSBzcXJ0KGdhaW4pO1xuICB2YXIgZ19pbnYgPSAxLjAgLyBnO1xuXG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIGFscGhhID0gc2luKHcwKSAvICgyLjAgKiBxKTtcbiAgdmFyIGMgPSBjb3ModzApO1xuXG4gIHZhciBhMF9pbnYgPSAxLjAgLyAoMS4wICsgYWxwaGEgKiBnX2ludik7XG5cbiAgY29lZnMuYTEgPSAoLTIuMCAqIGMpICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICgxLjAgLSBhbHBoYSAqIGdfaW52KSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9ICgxLjAgKyBhbHBoYSAqIGcpICogYTBfaW52O1xuICBjb2Vmcy5iMSA9IGNvZWZzLmExO1xuICBjb2Vmcy5iMiA9ICgxLjAgLSBhbHBoYSAqIGcpICogYTBfaW52O1xufVxuXG4vKiBsb3dTaGVsZjogSChzKSA9IEEgKiAoc14yICsgKHNxcnQoQSkvUSkqcyArIEEpLyhBKnNeMiArIChzcXJ0KEEpL1EpKnMgKyAxKSAqL1xuLyogQSA9IHNxcnQoIDEwXihkQmdhaW4vMjApICkgPSAxMF4oZEJnYWluLzQwKSAqL1xuLyogZ2FpbiBpcyBsaW5lYXIgaGVyZSAqL1xuZnVuY3Rpb24gbG93c2hlbGZfY29lZnMoZjAsIHEsIGdhaW4sIGNvZWZzKSB7XG4gIHZhciBnID0gc3FydChnYWluKTtcblxuICB2YXIgdzAgPSBNX1BJICogZjA7XG4gIHZhciBhbHBoYV8yX3NxcnRnID0gc2luKHcwKSAqIHNxcnQoZykgLyBxIDtcbiAgdmFyIGMgPSBjb3ModzApO1xuXG4gIHZhciBhMF9pbnYgPSAxLjAgLyAoIChnKzEuMCkgKyAoZy0xLjApICogYyArIGFscGhhXzJfc3FydGcpO1xuXG4gIGNvZWZzLmExID0gKC0yLjAgKiAgICAgKCAoZy0xLjApICsgKGcrMS4wKSAqIGMgICAgICAgICAgICAgICAgKSApICogYTBfaW52O1xuICBjb2Vmcy5hMiA9ICggICAgICAgICAgICAgKGcrMS4wKSArIChnLTEuMCkgKiBjIC0gYWxwaGFfMl9zcXJ0ZyAgKSAqIGEwX2ludjtcblxuICBjb2Vmcy5iMCA9ICggICAgICAgZyAqICggKGcrMS4wKSAtIChnLTEuMCkgKiBjICsgYWxwaGFfMl9zcXJ0ZykgKSAqIGEwX2ludjtcbiAgY29lZnMuYjEgPSAoIDIuMCAqIGcgKiAoIChnLTEuMCkgLSAoZysxLjApICogYyAgICAgICAgICAgICAgICApICkgKiBhMF9pbnY7XG4gIGNvZWZzLmIyID0gKCAgICAgICBnICogKCAoZysxLjApIC0gKGctMS4wKSAqIGMgLSBhbHBoYV8yX3NxcnRnKSApICogYTBfaW52O1xufVxuXG4vKiBoaWdoU2hlbGY6IEgocykgPSBBICogKEEqc14yICsgKHNxcnQoQSkvUSkqcyArIDEpLyhzXjIgKyAoc3FydChBKS9RKSpzICsgQSkgKi9cbi8qIEEgPSBzcXJ0KCAxMF4oZEJnYWluLzIwKSApID0gMTBeKGRCZ2Fpbi80MCkgKi9cbi8qIGdhaW4gaXMgbGluZWFyIGhlcmUgKi9cbmZ1bmN0aW9uIGhpZ2hzaGVsZl9jb2VmcyhmMCwgcSwgZ2FpbiwgY29lZnMpIHtcbiAgdmFyIGcgPSBzcXJ0KGdhaW4pO1xuXG4gIHZhciB3MCA9IE1fUEkgKiBmMDtcbiAgdmFyIGFscGhhXzJfc3FydGcgPSBzaW4odzApICogc3FydChnKSAvIHEgO1xuICB2YXIgYyA9IGNvcyh3MCk7XG5cbiAgdmFyIGEwX2ludiA9IDEuMCAvICggKGcrMS4wKSAtIChnLTEuMCkgKiBjICsgYWxwaGFfMl9zcXJ0Zyk7XG5cbiAgY29lZnMuYTEgPSAoIDIuMCAqICAgICAoIChnLTEuMCkgLSAoZysxLjApICogYyAgICAgICAgICAgICAgICApICkgKiBhMF9pbnY7XG4gIGNvZWZzLmEyID0gKCAgICAgICAgICAgICAoZysxLjApIC0gKGctMS4wKSAqIGMgLSBhbHBoYV8yX3NxcnRnICApICogYTBfaW52O1xuXG4gIGNvZWZzLmIwID0gKCAgICAgIGcgKiAoICAoZysxLjApICsgKGctMS4wKSAqIGMgKyBhbHBoYV8yX3NxcnRnKSApICogYTBfaW52O1xuICBjb2Vmcy5iMSA9ICgtMi4wICogZyAqICggKGctMS4wKSArIChnKzEuMCkgKiBjICAgICAgICAgICAgICAgICkgKSAqIGEwX2ludjtcbiAgY29lZnMuYjIgPSAoICAgICAgZyAqICggIChnKzEuMCkgKyAoZy0xLjApICogYyAtIGFscGhhXzJfc3FydGcpICkgKiBhMF9pbnY7XG59XG5cbiAgLyogaGVscGVyICovXG5mdW5jdGlvbiBjYWxjdWxhdGVDb2Vmcyh0eXBlLCBmMCwgcSwgZ2FpbiwgY29lZnMpIHtcblxuICBzd2l0Y2godHlwZSkge1xuICAgIGNhc2UgJ2xvd3Bhc3MnOlxuICAgICAgbG93cGFzc19jb2VmcyhmMCwgcSwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdoaWdocGFzcyc6XG4gICAgICBoaWdocGFzc19jb2VmcyhmMCwgcSwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdiYW5kcGFzc19jb25zdGFudF9za2lydCc6XG4gICAgICBiYW5kcGFzc19jb25zdGFudF9za2lydF9jb2VmcyhmMCwgcSwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdiYW5kcGFzc19jb25zdGFudF9wZWFrJzpcbiAgICAgIGJhbmRwYXNzX2NvbnN0YW50X3BlYWtfY29lZnMoZjAsIHEsIGNvZWZzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnbm90Y2gnOlxuICAgICAgbm90Y2hfY29lZnMoZjAsIHEsIGNvZWZzKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSAnYWxscGFzcyc6XG4gICAgICBhbGxwYXNzX2NvZWZzKGYwLCBxLCBjb2Vmcyk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3BlYWtpbmcnOlxuICAgICAgcGVha2luZ19jb2VmcyhmMCwgcSwgZ2FpbiwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdsb3dzaGVsZic6XG4gICAgICBsb3dzaGVsZl9jb2VmcyhmMCwgcSwgZ2FpbiwgY29lZnMpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdoaWdoc2hlbGYnOlxuICAgICAgaGlnaHNoZWxmX2NvZWZzKGYwLCBxLCBnYWluLCBjb2Vmcyk7XG4gICAgICBicmVhaztcbiAgfVxuXG4gIC8vIGFwcGx5IGdhaW5cbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnbG93cGFzcyc6XG4gICAgY2FzZSAnaGlnaHBhc3MnOlxuICAgIGNhc2UgJ2JhbmRwYXNzX2NvbnN0YW50X3NraXJ0JzpcbiAgICBjYXNlICdiYW5kcGFzc19jb25zdGFudF9wZWFrJzpcbiAgICBjYXNlICdub3RjaCc6XG4gICAgY2FzZSAnYWxscGFzcyc6XG4gICAgICBpZiAoZ2FpbiAhPSAxLjApIHtcbiAgICAgICAgY29lZnMuYjAgKj0gZ2FpbjtcbiAgICAgICAgY29lZnMuYjEgKj0gZ2FpbjtcbiAgICAgICAgY29lZnMuYjIgKj0gZ2FpbjtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIC8qIGdhaW4gaXMgYWxyZWFkeSBpbnRlZ3JhdGVkIGZvciB0aGUgZm9sbG93aW5nICovXG4gICAgY2FzZSAncGVha2luZyc6XG4gICAgY2FzZSAnbG93c2hlbGYnOlxuICAgIGNhc2UgJ2hpZ2hzaGVsZic6XG4gICAgICBicmVhaztcbiAgfVxufVxuXG4vKiBkaXJlY3QgZm9ybSBJICovXG4vKiBhMCA9IDEsIGExID0gYVswXSwgYTIgPSBhWzFdICovXG4vKiA0IHN0YXRlcyAoaW4gdGhhdCBvcmRlcik6IHgobi0xKSwgeChuLTIpLCB5KG4tMSksIHkobi0yKSAgKi9cbmZ1bmN0aW9uIGJpcXVhZEFycmF5RGYxKGNvZWZzLCBzdGF0ZSwgaW5GcmFtZSwgb3V0RnJhbWUsIHNpemUpIHtcbiAgZm9yKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIHZhciB5ID0gY29lZnMuYjAgKiBpbkZyYW1lW2ldXG4gICAgICAgICAgKyBjb2Vmcy5iMSAqIHN0YXRlLnhuXzFbaV0gKyBjb2Vmcy5iMiAqIHN0YXRlLnhuXzJbaV1cbiAgICAgICAgICAtIGNvZWZzLmExICogc3RhdGUueW5fMVtpXSAtIGNvZWZzLmEyICogc3RhdGUueW5fMltpXTtcblxuICAgIG91dEZyYW1lW2ldID0geTtcblxuICAgIC8vIHVwZGF0ZSBzdGF0ZXNcbiAgICBzdGF0ZS54bl8yW2ldID0gc3RhdGUueG5fMVtpXTtcbiAgICBzdGF0ZS54bl8xW2ldID0gaW5GcmFtZVtpXTtcblxuICAgIHN0YXRlLnluXzJbaV0gPSBzdGF0ZS55bl8xW2ldO1xuICAgIHN0YXRlLnluXzFbaV0gPSB5O1xuICB9XG59XG5cbi8qIHRyYW5zcG9zZWQgZGlyZWN0IGZvcm0gSUkgKi9cbi8qIGEwID0gMSwgYTEgPSBhWzBdLCBhMiA9IGFbMV0gKi9cbi8qIDIgc3RhdGVzICovXG5mdW5jdGlvbiBiaXF1YWRBcnJheURmMihjb2Vmcywgc3RhdGUsIGluRnJhbWUsIG91dEZyYW1lLCBzaXplKSB7XG4gIGZvcihsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBvdXRGcmFtZVtpXSA9IGNvZWZzLmIwICogaW5GcmFtZVtpXSArIHN0YXRlLnhuXzFbaV07XG5cbiAgICAvLyB1cGRhdGUgc3RhdGVzXG4gICAgc3RhdGUueG5fMVtpXSA9IGNvZWZzLmIxICogaW5GcmFtZVtpXSAtIGNvZWZzLmExW2ldICogb3V0RnJhbWVbaV0gKyBzdGF0ZS54bl8yW2ldO1xuICAgIHN0YXRlLnhuXzJbaV0gPSBjb2Vmcy5iMiAqIGluRnJhbWVbaV0gLSBjb2Vmcy5hMltpXSAqIG91dEZyYW1lW2ldO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJpcXVhZCBleHRlbmRzIEJhc2VMZm8ge1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBmaWx0ZXJUeXBlOidsb3dwYXNzJyxcbiAgICAgIGYwOiAxLjAsXG4gICAgICBnYWluOiAxLjAsXG4gICAgICBxOiAxLjBcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKTtcblxuICAgIGNvbnN0IGZyYW1lUmF0ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lUmF0ZTtcblxuICAgIC8vIGlmIG5vIGZyYW1lUmF0ZSBvciBmcmFtZXJhdGUgaXMgMCB3ZSBzaGFsbCBoYWx0IVxuICAgIGlmICghZnJhbWVSYXRlIHx8IGZyYW1lUmF0ZSA8PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgT3BlcmF0b3IgcmVxdWlyZXMgYSBmcmFtZVJhdGUgaGlnaGVyIHRoYW4gMC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBub3JtRjAgPSB0aGlzLnBhcmFtcy5mMCAvIGZyYW1lUmF0ZTtcbiAgICBjb25zdCBnYWluID0gdGhpcy5wYXJhbXMuZ2FpbjtcbiAgICBsZXQgcTtcblxuICAgIGlmICh0aGlzLnBhcmFtcy5xKSAgeyBxID0gdGhpcy5wYXJhbXMucTsgfVxuICAgIGlmICh0aGlzLnBhcmFtcy5idykgeyBxID0gdGhpcy5wYXJhbXMuZjAgLyB0aGlzLnBhcmFtcy5idzsgfVxuXG4gICAgdGhpcy5jb2VmcyA9IHtcbiAgICAgIGIwOiAwLFxuICAgICAgYjE6IDAsXG4gICAgICBiMjogMCxcbiAgICAgIGExOiAwLFxuICAgICAgYTI6IDBcbiAgICB9O1xuXG4gICAgY29uc3QgZnJhbWVTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuXG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIHhuXzE6IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWVTaXplKSxcbiAgICAgIHhuXzI6IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWVTaXplKSxcbiAgICAgIHluXzE6IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWVTaXplKSxcbiAgICAgIHluXzI6IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWVTaXplKVxuICAgIH07XG5cbiAgICBjYWxjdWxhdGVDb2Vmcyh0aGlzLnBhcmFtcy5maWx0ZXJUeXBlLCBub3JtRjAsIHEsIGdhaW4sIHRoaXMuY29lZnMpO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBiaXF1YWRBcnJheURmMSh0aGlzLmNvZWZzLCB0aGlzLnN0YXRlLCBmcmFtZSwgdGhpcy5vdXRGcmFtZSwgZnJhbWUubGVuZ3RoKTtcbiAgICAvLyBjb25zb2xlLmxvZyh0aGlzLm91dEZyYW1lKTtcbiAgICB0aGlzLm91dHB1dCh0aW1lLCB0aGlzLm91dEZyYW1lLCBtZXRhRGF0YSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuaW1wb3J0IGpzZmZ0IGZyb20gJ2pzZmZ0JztcbmltcG9ydCBjb21wbGV4QXJyYXkgZnJvbSAnanNmZnQvbGliL2NvbXBsZXhfYXJyYXknO1xuaW1wb3J0IGluaXRXaW5kb3cgZnJvbSAnLi4vdXRpbHMvZmZ0LXdpbmRvd3MnO1xuXG4vLyBjb25zdCBQSSAgID0gTWF0aC5QSTtcbi8vIGNvbnN0IGNvcyAgPSBNYXRoLmNvcztcbi8vIGNvbnN0IHNpbiAgPSBNYXRoLnNpbjtcbmNvbnN0IHNxcnQgPSBNYXRoLnNxcnQ7XG5cbmNvbnN0IGlzUG93ZXJPZlR3byA9IGZ1bmN0aW9uKG51bWJlcikge1xuICB3aGlsZSAoKG51bWJlciAlIDIgPT09IDApICYmIG51bWJlciA+IDEpIHtcbiAgICBudW1iZXIgPSBudW1iZXIgLyAyO1xuICB9XG5cbiAgcmV0dXJuIG51bWJlciA9PT0gMTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRmZ0IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBmZnRTaXplOiAxMDI0LFxuICAgICAgd2luZG93TmFtZTogJ2hhbm4nLFxuICAgICAgb3V0VHlwZTogJ21hZ25pdHVkZSdcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMud2luZG93U2l6ZSA9IHRoaXMucGFyYW1zLmZmdFNpemU7XG5cbiAgICBpZiAoIWlzUG93ZXJPZlR3byh0aGlzLnBhcmFtcy5mZnRTaXplKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdmZnRTaXplIG11c3QgYmUgYSBwb3dlciBvZiB0d28nKTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKSB7XG4gICAgLy8gc2V0IG91dHB1dCBmcmFtZVNpemVcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCB7XG4gICAgICBmcmFtZVNpemU6IHRoaXMucGFyYW1zLmZmdFNpemUgLyAyICsgMSxcbiAgICB9KTtcblxuICAgIGNvbnN0IGluRnJhbWVTaXplID0gaW5TdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIGNvbnN0IGZmdFNpemUgPSB0aGlzLnBhcmFtcy5mZnRTaXplO1xuXG4gICAgdGhpcy53aW5kb3dTaXplID0gZmZ0U2l6ZTtcblxuICAgIGlmKGluRnJhbWVTaXplIDwgZmZ0U2l6ZSlcbiAgICAgIHRoaXMud2luZG93U2l6ZSA9IGluRnJhbWVTaXplO1xuXG4gICAgLy8gcmVmZXJlbmNlcyB0byBwb3B1bGF0ZSBpbiB3aW5kb3cgZnVuY3Rpb25zXG4gICAgdGhpcy5ub3JtYWxpemVDb2VmcyA9IHsgbGluZWFyOiAwLCBwb3dlcjogMCB9O1xuICAgIHRoaXMud2luZG93ID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLndpbmRvd1NpemUpO1xuXG4gICAgLy8gaW5pdCB0aGUgY29tcGxleCBhcnJheSB0byByZXVzZSBmb3IgdGhlIEZGVFxuICAgIHRoaXMuY29tcGxleEZyYW1lID0gbmV3IGNvbXBsZXhBcnJheS5Db21wbGV4QXJyYXkoZmZ0U2l6ZSk7XG5cbiAgICBpbml0V2luZG93KFxuICAgICAgdGhpcy5wYXJhbXMud2luZG93TmFtZSxcbiAgICAgIHRoaXMud2luZG93LCAvLyBidWZmZXIgdG8gcG9wdWxhdGUgd2l0aCB0aGUgd2luZG93XG4gICAgICB0aGlzLndpbmRvd1NpemUsIC8vIGJ1ZmZlci5sZW5ndGhcbiAgICAgIHRoaXMubm9ybWFsaXplQ29lZnMgLy8gYW4gb2JqZWN0IHRvIHBvcHVsYXRlIHdpdGggdGhlIG5vcm1hbGl6YXRpb24gY29lZnNcbiAgICApO1xuXG4gICAgLy8gQXJyYXlCdWZmZXJzIHRvIHJldXNlIGluIHByb2Nlc3NcbiAgICB0aGlzLndpbmRvd2VkRnJhbWUgPSBuZXcgRmxvYXQzMkFycmF5KGZmdFNpemUpO1xuICB9XG5cbiAgLyoqXG4gICAqIHRoZSBmaXJzdCBjYWxsIG9mIHRoaXMgbWV0aG9kIGNhbiBiZSBxdWl0ZSBsb25nICh+NG1zKSxcbiAgICogdGhlIHN1YnNlcXVlbnQgb25lcyBhcmUgZmFzdGVyICh+MC41bXMpIGZvciBmZnRTaXplID0gMTAyNFxuICAgKi9cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBjb25zdCB3aW5kb3dTaXplID0gdGhpcy53aW5kb3dTaXplO1xuICAgIGNvbnN0IG91dEZyYW1lU2l6ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcbiAgICBjb25zdCBmZnRTaXplID0gdGhpcy5wYXJhbXMuZmZ0U2l6ZTtcblxuICAgIC8vIGFwcGx5IHdpbmRvdyBvbiBmcmFtZVxuICAgIC8vID0+IGB0aGlzLndpbmRvd2AgYW5kIGBmcmFtZWAgaGF2ZSB0aGUgc2FtZSBsZW5ndGhcbiAgICAvLyA9PiBpZiBgdGhpcy53aW5kb3dlZEZyYW1lYCBpcyBiaWdnZXIsIGl0J3MgZmlsbGVkIHdpdGggemVyb1xuICAgIC8vIGFuZCB3aW5kb3cgZG9uJ3QgYXBwbHkgdGhlcmVcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdpbmRvd1NpemU7IGkrKylcbiAgICAgIHRoaXMud2luZG93ZWRGcmFtZVtpXSA9IGZyYW1lW2ldICogdGhpcy53aW5kb3dbaV07XG5cbiAgICBpZih3aW5kb3dTaXplIDwgZmZ0U2l6ZSlcbiAgICAgIHRoaXMud2luZG93ZWRGcmFtZS5maWxsKDAsIHdpbmRvd1NpemUpO1xuXG4gICAgLy8gRkZUXG4gICAgLy8gdGhpcy5jb21wbGV4RnJhbWUgPSBuZXcgY29tcGxleEFycmF5LkNvbXBsZXhBcnJheShmZnRTaXplKTtcbiAgICAvLyByZXVzZSB0aGUgc2FtZSBjb21wbGV4RnJhbWVcbiAgICB0aGlzLmNvbXBsZXhGcmFtZS5tYXAoKHZhbHVlLCBpKSA9PiB7XG4gICAgICB2YWx1ZS5yZWFsID0gdGhpcy53aW5kb3dlZEZyYW1lW2ldO1xuICAgICAgdmFsdWUuaW1hZyA9IDA7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjb21wbGV4U3BlY3RydW0gPSB0aGlzLmNvbXBsZXhGcmFtZS5GRlQoKTtcbiAgICBjb25zdCBzY2FsZSA9IDEgLyBmZnRTaXplO1xuXG4gICAgLy8gREMgaW5kZXhcbiAgICBjb25zdCByZWFsRGMgPSBjb21wbGV4U3BlY3RydW0ucmVhbFswXTtcbiAgICBjb25zdCBpbWFnRGMgPSBjb21wbGV4U3BlY3RydW0uaW1hZ1swXTtcbiAgICB0aGlzLm91dEZyYW1lWzBdID0gKHJlYWxEYyAqIHJlYWxEYyArIGltYWdEYyAqIGltYWdEYykgKiBzY2FsZTtcblxuICAgIC8vIE5xdXlzdCBpbmRleFxuICAgIGNvbnN0IHJlYWxOeSA9IGNvbXBsZXhTcGVjdHJ1bS5yZWFsW2ZmdFNpemUgLyAyXTtcbiAgICBjb25zdCBpbWFnTnkgPSBjb21wbGV4U3BlY3RydW0uaW1hZ1tmZnRTaXplIC8gMl07XG4gICAgdGhpcy5vdXRGcmFtZVtmZnRTaXplIC8gMl0gPSAocmVhbE55ICogcmVhbE55ICsgaW1hZ055ICogaW1hZ055KSAqIHNjYWxlO1xuXG4gICAgLy8gcG93ZXIgc3BlY3RydW1cbiAgICBmb3IgKGxldCBpID0gMSwgaiA9IGZmdFNpemUgLSAxOyBpIDwgZmZ0U2l6ZSAvIDI7IGkrKywgai0tKSB7XG4gICAgICBjb25zdCByZWFsID0gY29tcGxleFNwZWN0cnVtLnJlYWxbaV0gKyBjb21wbGV4U3BlY3RydW0ucmVhbFtqXTtcbiAgICAgIGNvbnN0IGltYWcgPSBjb21wbGV4U3BlY3RydW0uaW1hZ1tpXSAtIGNvbXBsZXhTcGVjdHJ1bS5pbWFnW2pdO1xuXG4gICAgICB0aGlzLm91dEZyYW1lW2ldID0gKHJlYWwgKiByZWFsICsgaW1hZyAqIGltYWcpICogc2NhbGU7XG4gICAgfVxuXG4gICAgLy8gbWFnbml0dWRlIHNwZWN0cnVtXG4gICAgLy8gQE5PVEUgbWF5YmUgY2hlY2sgaG93IHRvIHJlbW92ZSB0aGlzIGxvb3AgcHJvcGVybHlcbiAgICBpZiAodGhpcy5wYXJhbXMub3V0VHlwZSA9PT0gJ21hZ25pdHVkZScpIHtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0RnJhbWVTaXplOyBpKyspIHtcbiAgICAgICAgdGhpcy5vdXRGcmFtZVtpXSA9IHNxcnQodGhpcy5vdXRGcmFtZVtpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5vdXRwdXQodGltZSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZyYW1lciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgZnJhbWVTaXplOiA1MTIsXG4gICAgICBjZW50ZXJlZFRpbWVUYWc6IGZhbHNlXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmZyYW1lSW5kZXggPSAwO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIGlmICghdGhpcy5wYXJhbXMuaG9wU2l6ZSlcbiAgICAgIHRoaXMucGFyYW1zLmhvcFNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7IC8vIGhvcFNpemUgZGVmYXVsdHMgdG8gZnJhbWVTaXplXG5cbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCB7XG4gICAgICBmcmFtZVNpemU6IHRoaXMucGFyYW1zLmZyYW1lU2l6ZSxcbiAgICAgIGZyYW1lUmF0ZTogaW5TdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZSAvIHRoaXMucGFyYW1zLmhvcFNpemUsXG4gICAgfSk7XG4gIH1cblxuICAvLyBATk9URSBtdXN0IGJlIHRlc3RlZFxuICByZXNldCgpIHtcbiAgICB0aGlzLmZyYW1lSW5kZXggPSAwO1xuICAgIHN1cGVyLnJlc2V0KCk7XG4gIH1cblxuICBmaW5hbGl6ZShlbmRUaW1lKSB7XG4gICAgaWYgKHRoaXMuZnJhbWVJbmRleCA+IDApIHtcbiAgICAgIHRoaXMub3V0RnJhbWUuZmlsbCgwLCB0aGlzLmZyYW1lSW5kZXgpO1xuICAgICAgdGhpcy5vdXRwdXQoKTtcbiAgICB9XG5cbiAgICBzdXBlci5maW5hbGl6ZShlbmRUaW1lKTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgYmxvY2ssIG1ldGFEYXRhKSB7XG4gICAgY29uc3Qgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lO1xuICAgIGNvbnN0IHNhbXBsZVJhdGUgPSB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlO1xuICAgIGNvbnN0IHNhbXBsZVBlcmlvZCA9IDEgLyBzYW1wbGVSYXRlO1xuICAgIGNvbnN0IGZyYW1lU2l6ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcbiAgICBjb25zdCBibG9ja1NpemUgPSBibG9jay5sZW5ndGg7XG4gICAgY29uc3QgaG9wU2l6ZSA9IHRoaXMucGFyYW1zLmhvcFNpemU7XG4gICAgbGV0IGZyYW1lSW5kZXggPSB0aGlzLmZyYW1lSW5kZXg7XG4gICAgbGV0IGJsb2NrSW5kZXggPSAwO1xuXG4gICAgd2hpbGUgKGJsb2NrSW5kZXggPCBibG9ja1NpemUpIHtcbiAgICAgIGxldCBudW1Ta2lwID0gMDtcblxuICAgICAgLy8gc2tpcCBibG9jayBzYW1wbGVzIGZvciBuZWdhdGl2ZSBmcmFtZUluZGV4XG4gICAgICBpZiAoZnJhbWVJbmRleCA8IDApIHtcbiAgICAgICAgbnVtU2tpcCA9IC1mcmFtZUluZGV4O1xuICAgICAgfVxuXG4gICAgICBpZiAobnVtU2tpcCA8IGJsb2NrU2l6ZSkge1xuICAgICAgICBibG9ja0luZGV4ICs9IG51bVNraXA7IC8vIHNraXAgYmxvY2sgc2VnbWVudFxuXG4gICAgICAgIC8vIGNhbiBjb3B5IGFsbCB0aGUgcmVzdCBvZiB0aGUgaW5jb21pbmcgYmxvY2tcbiAgICAgICAgbGV0IG51bUNvcHkgPSBibG9ja1NpemUgLSBibG9ja0luZGV4O1xuXG4gICAgICAgIC8vIGNvbm5vdCBjb3B5IG1vcmUgdGhhbiB3aGF0IGZpdHMgaW50byB0aGUgZnJhbWVcbiAgICAgICAgY29uc3QgbWF4Q29weSA9IGZyYW1lU2l6ZSAtIGZyYW1lSW5kZXg7XG5cbiAgICAgICAgaWYgKG51bUNvcHkgPj0gbWF4Q29weSkge1xuICAgICAgICAgIG51bUNvcHkgPSBtYXhDb3B5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY29weSBibG9jayBzZWdtZW50IGludG8gZnJhbWVcbiAgICAgICAgY29uc3QgY29weSA9IGJsb2NrLnN1YmFycmF5KGJsb2NrSW5kZXgsIGJsb2NrSW5kZXggKyBudW1Db3B5KTtcblxuICAgICAgICBvdXRGcmFtZS5zZXQoY29weSwgZnJhbWVJbmRleCk7XG5cbiAgICAgICAgLy8gYWR2YW5jZSBibG9jayBhbmQgZnJhbWUgaW5kZXhcbiAgICAgICAgYmxvY2tJbmRleCArPSBudW1Db3B5O1xuICAgICAgICBmcmFtZUluZGV4ICs9IG51bUNvcHk7XG5cbiAgICAgICAgLy8gc2VuZCBmcmFtZSB3aGVuIGNvbXBsZXRlZFxuICAgICAgICBpZiAoZnJhbWVJbmRleCA9PT0gZnJhbWVTaXplKSB7XG4gICAgICAgICAgLy8gZGVmaW5lIHRpbWUgdGFnIGZvciB0aGUgb3V0RnJhbWUgYWNjb3JkaW5nIHRvIGNvbmZpZ3VyYXRpb25cbiAgICAgICAgICBpZiAodGhpcy5wYXJhbXMuY2VudGVyZWRUaW1lVGFnKSB7XG4gICAgICAgICAgICB0aGlzLnRpbWUgPSB0aW1lICsgKGJsb2NrSW5kZXggLSBmcmFtZVNpemUgLyAyKSAqIHNhbXBsZVBlcmlvZDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy50aW1lID0gdGltZSArIChibG9ja0luZGV4IC0gZnJhbWVTaXplKSAqIHNhbXBsZVBlcmlvZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBmb3J3YXJkIG1ldGFEYXRhID9cbiAgICAgICAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICAgICAgICAvLyBmb3J3YXJkIHRvIG5leHQgbm9kZXNcbiAgICAgICAgICB0aGlzLm91dHB1dCgpO1xuXG4gICAgICAgICAgLy8gc2hpZnQgZnJhbWUgbGVmdFxuICAgICAgICAgIGlmIChob3BTaXplIDwgZnJhbWVTaXplKSB7XG4gICAgICAgICAgICBvdXRGcmFtZS5zZXQob3V0RnJhbWUuc3ViYXJyYXkoaG9wU2l6ZSwgZnJhbWVTaXplKSwgMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZnJhbWVJbmRleCAtPSBob3BTaXplOyAvLyBob3AgZm9yd2FyZFxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBza2lwIGVudGlyZSBibG9ja1xuICAgICAgICBjb25zdCBibG9ja1Jlc3QgPSBibG9ja1NpemUgLSBibG9ja0luZGV4O1xuICAgICAgICBmcmFtZUluZGV4ICs9IGJsb2NrUmVzdDtcbiAgICAgICAgYmxvY2tJbmRleCArPSBibG9ja1Jlc3Q7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5mcmFtZUluZGV4ID0gZnJhbWVJbmRleDtcbiAgfVxufVxuIiwiaW1wb3J0IEJpcXVhZCBmcm9tICcuL2JpcXVhZCc7XG5pbXBvcnQgRmZ0IGZyb20gJy4vZmZ0JztcbmltcG9ydCBGcmFtZXIgZnJvbSAnLi9mcmFtZXInO1xuaW1wb3J0IE1hZ25pdHVkZSBmcm9tICcuL21hZ25pdHVkZSc7XG5pbXBvcnQgTWF4IGZyb20gJy4vbWF4JztcbmltcG9ydCBNaW5NYXggZnJvbSAnLi9taW4tbWF4JztcbmltcG9ydCBNb3ZpbmdBdmVyYWdlIGZyb20gJy4vbW92aW5nLWF2ZXJhZ2UnO1xuaW1wb3J0IE1vdmluZ01lZGlhbiBmcm9tICcuL21vdmluZy1tZWRpYW4nO1xuaW1wb3J0IE5vb3AgZnJvbSAnLi9ub29wJztcbmltcG9ydCBPcGVyYXRvciBmcm9tICcuL29wZXJhdG9yJztcbmltcG9ydCBTZWdtZW50ZXIgZnJvbSAnLi9zZWdtZW50ZXInO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIEJpcXVhZCxcbiAgRmZ0LFxuICBGcmFtZXIsXG4gIE1hZ25pdHVkZSxcbiAgTWF4LFxuICBNaW5NYXgsXG4gIE1vdmluZ0F2ZXJhZ2UsXG4gIE1vdmluZ01lZGlhbixcbiAgTm9vcCxcbiAgT3BlcmF0b3IsXG4gIFNlZ21lbnRlcixcbn07XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNYWduaXR1ZGUgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIG5vcm1hbGl6ZTogdHJ1ZSxcbiAgICAgIHBvd2VyOiBmYWxzZSxcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCB7XG4gICAgICBmcmFtZVNpemU6IDEsXG4gICAgfSk7XG4gIH1cblxuICBpbnB1dEFycmF5KGZyYW1lKSB7XG4gICAgY29uc3Qgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lO1xuICAgIGNvbnN0IGZyYW1lU2l6ZSA9IGZyYW1lLmxlbmd0aDtcbiAgICBsZXQgc3VtID0gMDtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhbWVTaXplOyBpKyspXG4gICAgICBzdW0gKz0gKGZyYW1lW2ldICogZnJhbWVbaV0pO1xuXG4gICAgbGV0IG1hZyA9IHN1bTtcblxuICAgIGlmICh0aGlzLnBhcmFtcy5ub3JtYWxpemUpXG4gICAgICBtYWcgLz0gZnJhbWVTaXplO1xuXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5wb3dlcilcbiAgICAgIG1hZyA9IE1hdGguc3FydChtYWcpO1xuXG4gICAgb3V0RnJhbWVbMF0gPSBtYWc7XG5cbiAgICByZXR1cm4gb3V0RnJhbWU7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIHRoaXMuaW5wdXRBcnJheShmcmFtZSk7XG4gICAgdGhpcy5vdXRwdXQodGltZSwgdGhpcy5vdXRGcmFtZSwgbWV0YURhdGEpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWF4IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zLCB7XG4gICAgICBmcmFtZVNpemU6IDEsXG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIHRoaXMudGltZSA9IHRpbWU7XG4gICAgdGhpcy5vdXRGcmFtZVswXSA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGZyYW1lKTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW4gYW5kIG1heCB2YWx1ZXMgZnJvbSBlYWNoIGZyYW1lXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1pbk1heCBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG4gIH1cblxuICBpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcywge1xuICAgICAgZnJhbWVTaXplOiAyLFxuICAgIH0pO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBsZXQgbWluID0gK0luZmluaXR5O1xuICAgIGxldCBtYXggPSAtSW5maW5pdHk7XG5cbiAgICBmb3IgKGxldCBpID0gMCwgbCA9IGZyYW1lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgY29uc3QgdmFsdWUgPSBmcmFtZVtpXTtcbiAgICAgIGlmICh2YWx1ZSA8IG1pbikgeyBtaW4gPSB2YWx1ZTsgfVxuICAgICAgaWYgKHZhbHVlID4gbWF4KSB7IG1heCA9IHZhbHVlOyB9XG4gICAgfVxuXG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm91dEZyYW1lWzBdID0gbWluO1xuICAgIHRoaXMub3V0RnJhbWVbMV0gPSBtYXg7XG4gICAgdGhpcy5tZXRhRGF0YSA9IG1ldGFEYXRhO1xuXG4gICAgdGhpcy5vdXRwdXQoKTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cbi8vIE5PVEVTOlxuLy8gLSBhZGQgJ3N5bWV0cmljYWwnIG9wdGlvbiAoaG93IHRvIGRlYWwgd2l0aCB2YWx1ZXMgYmV0d2VlbiBmcmFtZXMgPykgP1xuLy8gLSBjYW4gd2UgaW1wcm92ZSBhbGdvcml0aG0gaW1wbGVtZW50YXRpb24gP1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW92aW5nQXZlcmFnZSBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgb3JkZXI6IDEwLFxuICAgICAgZmlsbDogMCxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuc3VtID0gbnVsbDtcbiAgICB0aGlzLnJpbmdCdWZmZXIgPSBudWxsO1xuICAgIHRoaXMucmluZ0luZGV4ID0gMDtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKTtcblxuICAgIHRoaXMucmluZ0J1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5wYXJhbXMub3JkZXIgKiB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUpO1xuXG4gICAgaWYgKHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA+IDEpXG4gICAgICB0aGlzLnN1bSA9IG5ldyBGbG9hdDMyQXJyYXkodGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLnN1bSA9IDA7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuXG4gICAgdGhpcy5yaW5nQnVmZmVyLmZpbGwodGhpcy5wYXJhbXMuZmlsbCk7XG5cbiAgICBjb25zdCBmaWxsU3VtID0gdGhpcy5wYXJhbXMub3JkZXIgKiB0aGlzLnBhcmFtcy5maWxsO1xuXG4gICAgaWYgKHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA+IDEpXG4gICAgICB0aGlzLnN1bS5maWxsKGZpbGxTdW0pO1xuICAgIGVsc2VcbiAgICAgIHRoaXMuc3VtID0gZmlsbFN1bTtcblxuICAgIHRoaXMucmluZ0luZGV4ID0gMDtcbiAgfVxuXG4gIGlucHV0U2NhbGFyKHZhbHVlKSB7XG4gICAgY29uc3Qgb3JkZXIgPSB0aGlzLnBhcmFtcy5vcmRlcjtcbiAgICBjb25zdCByaW5nSW5kZXggPSB0aGlzLnJpbmdJbmRleDtcbiAgICBjb25zdCByaW5nQnVmZmVyID0gdGhpcy5yaW5nQnVmZmVyO1xuICAgIGxldCBzdW0gPSB0aGlzLnN1bTtcblxuICAgIHN1bSAtPSByaW5nQnVmZmVyW3JpbmdJbmRleF07XG4gICAgc3VtICs9IHZhbHVlO1xuXG4gICAgdGhpcy5zdW0gPSBzdW07XG4gICAgdGhpcy5yaW5nQnVmZmVyW3JpbmdJbmRleF0gPSB2YWx1ZTtcbiAgICB0aGlzLnJpbmdJbmRleCA9IChyaW5nSW5kZXggKyAxKSAlIG9yZGVyO1xuXG4gICAgcmV0dXJuIHN1bSAvIG9yZGVyO1xuICB9XG5cbiAgaW5wdXRBcnJheShmcmFtZSkge1xuICAgIGNvbnN0IG91dEZyYW1lID0gdGhpcy5vdXRGcmFtZTtcbiAgICBjb25zdCBvcmRlciA9IHRoaXMucGFyYW1zLm9yZGVyO1xuICAgIGNvbnN0IGZyYW1lU2l6ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcbiAgICBjb25zdCByaW5nSW5kZXggPSB0aGlzLnJpbmdJbmRleDtcbiAgICBjb25zdCByaW5nT2Zmc2V0ID0gcmluZ0luZGV4ICogZnJhbWVTaXplO1xuICAgIGNvbnN0IHJpbmcgPSB0aGlzLnJpbmdCdWZmZXI7XG4gICAgY29uc3Qgc3VtID0gdGhpcy5zdW07XG4gICAgY29uc3Qgc2NhbGUgPSAxIC8gb3JkZXI7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZyYW1lU2l6ZTsgaSsrKSB7XG4gICAgICBjb25zdCByaW5nQnVmZmVySW5kZXggPSByaW5nT2Zmc2V0ICsgaTtcbiAgICAgIGNvbnN0IHZhbHVlID0gZnJhbWVbaV07XG4gICAgICBsZXQgc3VtID0gc3VtW2ldO1xuXG4gICAgICBzdW0gLT0gcmluZ0J1ZmZlcltyaW5nQnVmZmVySW5kZXhdO1xuICAgICAgc3VtICs9IHZhbHVlO1xuXG4gICAgICBvdXRGcmFtZVtpXSA9IHN1bSAqIHNjYWxlO1xuXG4gICAgICB0aGlzLnN1bVtpXSA9IHN1bTtcbiAgICAgIHRoaXMucmluZ0J1ZmZlcltyaW5nQnVmZmVySW5kZXhdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgdGhpcy5yaW5nSW5kZXggPSAocmluZ0luZGV4ICsgMSkgJSBvcmRlcjtcblxuICAgIHJldHVybiBvdXRGcmFtZTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgaWYodGhpcy5mcmFtZVNpemUgPiAxKVxuICAgICAgdGhpcy5pbnB1dEFycmF5KGZyYW1lKTtcbiAgICBlbHNlXG4gICAgICB0aGlzLm91dEZyYW1lWzBdID0gdGhpcy5pbnB1dFNjYWxhcihmcmFtZVswXSk7XG5cbiAgICBpZih0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlKVxuICAgICAgdGltZSAtPSAoMC41ICogKHRoaXMucGFyYW1zLm9yZGVyIC0gMSkgLyB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlKTtcblxuICAgIHRoaXMub3V0cHV0KHRpbWUsIHRoaXMub3V0RnJhbWUsIG1ldGFEYXRhKTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1vdmluZ01lZGlhbiBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgb3JkZXI6IDksXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICBpZiAodGhpcy5wYXJhbXMub3JkZXIgJSAyID09PSAwKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ29yZGVyIG11c3QgYmUgYW4gb2RkIG51bWJlcicpO1xuICAgIH1cblxuICAgIHRoaXMucXVldWUgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMucGFyYW1zLm9yZGVyKTtcbiAgICB0aGlzLnNvcnRlciA9IFtdO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcblxuICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5xdWV1ZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRoaXMucXVldWVbaV0gPSAwO1xuICAgIH1cbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgY29uc3Qgb3V0RnJhbWUgPSB0aGlzLm91dEZyYW1lO1xuICAgIGNvbnN0IGZyYW1lU2l6ZSA9IGZyYW1lLmxlbmd0aDtcbiAgICBjb25zdCBvcmRlciA9IHRoaXMucGFyYW1zLm9yZGVyO1xuICAgIGNvbnN0IHB1c2hJbmRleCA9IHRoaXMucGFyYW1zLm9yZGVyIC0gMTtcbiAgICBjb25zdCBtZWRpYW5JbmRleCA9IE1hdGguZmxvb3Iob3JkZXIgLyAyKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZnJhbWVTaXplOyBpKyspIHtcbiAgICAgIGNvbnN0IGN1cnJlbnQgPSBmcmFtZVtpXTtcbiAgICAgIC8vIHVwZGF0ZSBxdWV1ZVxuICAgICAgdGhpcy5xdWV1ZS5zZXQodGhpcy5xdWV1ZS5zdWJhcnJheSgxKSwgMCk7XG4gICAgICB0aGlzLnF1ZXVlW3B1c2hJbmRleF0gPSBjdXJyZW50O1xuICAgICAgLy8gZ2V0IG1lZGlhblxuICAgICAgdGhpcy5zb3J0ZXIgPSBBcnJheS5mcm9tKHRoaXMucXVldWUudmFsdWVzKCkpO1xuICAgICAgdGhpcy5zb3J0ZXIuc29ydCgoYSwgYikgPT4gYSAtIGIpO1xuXG4gICAgICBvdXRGcmFtZVtpXSA9IHRoaXMuc29ydGVyW21lZGlhbkluZGV4XTtcbiAgICB9XG5cbiAgICB0aGlzLm91dHB1dCh0aW1lLCBvdXRGcmFtZSwgbWV0YURhdGEpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuLyoqXG4gKiBhIE5vT3AgTGZvXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE5vb3AgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICB0aGlzLm91dEZyYW1lLnNldChmcmFtZSwgMCk7XG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuLyoqXG4gKiBhcHBseSBhIGdpdmVuIGZ1bmN0aW9uIG9uIGVhY2ggZnJhbWVcbiAqXG4gKiBAU0lHTkFUVVJFIHNjYWxhciBjYWxsYmFja1xuICogZnVuY3Rpb24odmFsdWUsIGluZGV4LCBmcmFtZSkge1xuICogICByZXR1cm4gZG9Tb21ldGhpbmcodmFsdWUpXG4gKiB9XG4gKlxuICogQFNJR05BVFVSRSB2ZWN0b3IgY2FsbGJhY2tcbiAqIGZ1bmN0aW9uKHRpbWUsIGluRnJhbWUsIG91dEZyYW1lKSB7XG4gKiAgIG91dEZyYW1lLnNldChpbkZyYW1lLCAwKTtcbiAqICAgcmV0dXJuIHRpbWUgKyAxO1xuICogfVxuICpcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgT3BlcmF0b3IgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKG9wdGlvbnMpO1xuXG4gICAgdGhpcy5wYXJhbXMudHlwZSA9IHRoaXMucGFyYW1zLnR5cGUgfHzCoCdzY2FsYXInO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLm9uUHJvY2Vzcykge1xuICAgICAgdGhpcy5jYWxsYmFjayA9IHRoaXMucGFyYW1zLm9uUHJvY2Vzcy5iaW5kKHRoaXMpO1xuICAgIH1cbiAgfVxuXG4gIGNvbmZpZ3VyZVN0cmVhbSgpIHtcbiAgICBpZiAodGhpcy5wYXJhbXMudHlwZSA9PT0gJ3ZlY3RvcicgJiYgdGhpcy5wYXJhbXMuZnJhbWVTaXplKSB7XG4gICAgICB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLnBhcmFtcy5mcmFtZVNpemU7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICAvLyBhcHBseSB0aGUgY2FsbGJhY2sgdG8gdGhlIGZyYW1lXG4gICAgaWYgKHRoaXMucGFyYW1zLnR5cGUgPT09ICd2ZWN0b3InKSB7XG4gICAgICB2YXIgb3V0VGltZSA9IHRoaXMuY2FsbGJhY2sodGltZSwgZnJhbWUsIHRoaXMub3V0RnJhbWUpO1xuXG4gICAgICBpZiAob3V0VGltZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRpbWUgPSBvdXRUaW1lO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGZyYW1lLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLm91dEZyYW1lW2ldID0gdGhpcy5jYWxsYmFjayhmcmFtZVtpXSwgaSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59O1xuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5pbXBvcnQgTW92aW5nQXZlcmFnZSBmcm9tICcuL21vdmluZy1hdmVyYWdlJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTZWdtZW50ZXIgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIGxvZ0lucHV0OiBmYWxzZSxcbiAgICAgIG1pbklucHV0OiAwLjAwMDAwMDAwMDAwMSxcbiAgICAgIGZpbHRlck9yZGVyOiA1LFxuICAgICAgdGhyZXNob2xkOiAzLFxuICAgICAgb2ZmVGhyZXNob2xkOiAtSW5maW5pdHksXG4gICAgICBtaW5JbnRlcjogMC4wNTAsXG4gICAgICBtYXhEdXJhdGlvbjogSW5maW5pdHksXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmluc2lkZVNlZ21lbnQgPSBmYWxzZTtcbiAgICB0aGlzLm9uc2V0VGltZSA9IC1JbmZpbml0eTtcblxuICAgIC8vIHN0YXRzXG4gICAgdGhpcy5taW4gPSBJbmZpbml0eTtcbiAgICB0aGlzLm1heCA9IC1JbmZpbml0eTtcbiAgICB0aGlzLnN1bSA9IDA7XG4gICAgdGhpcy5zdW1PZlNxdWFyZXMgPSAwO1xuICAgIHRoaXMuY291bnQgPSAwO1xuXG4gICAgY29uc3QgbWluSW5wdXQgPSB0aGlzLnBhcmFtcy5taW5JbnB1dDtcbiAgICBsZXQgZmlsbCA9IG1pbklucHV0O1xuXG4gICAgaWYodGhpcy5wYXJhbXMubG9nSW5wdXQgJiYgbWluSW5wdXQgPiAwKVxuICAgICAgZmlsbCA9IE1hdGgubG9nKG1pbklucHV0KTtcblxuICAgIHRoaXMubW92aW5nQXZlcmFnZSA9IG5ldyBNb3ZpbmdBdmVyYWdlKHtcbiAgICAgIG9yZGVyOiB0aGlzLnBhcmFtcy5maWx0ZXJPcmRlcixcbiAgICAgIGZpbGw6IGZpbGwsXG4gICAgfSk7XG5cbiAgICB0aGlzLmxhc3RNdmF2cmcgPSBmaWxsO1xuICB9XG5cbiAgc2V0IHRocmVzaG9sZCh2YWx1ZSkge1xuICAgIHRoaXMucGFyYW1zLnRocmVzaG9sZCA9IHZhbHVlO1xuICB9XG5cbiAgc2V0IG9mZlRocmVzaG9sZCh2YWx1ZSkge1xuICAgIHRoaXMucGFyYW1zLm9mZlRocmVzaG9sZCA9IHZhbHVlO1xuICB9XG5cbiAgcmVzZXRTZWdtZW50KCkge1xuICAgIHRoaXMuaW5zaWRlU2VnbWVudCA9IGZhbHNlO1xuICAgIHRoaXMub25zZXRUaW1lID0gLUluZmluaXR5O1xuXG4gICAgLy8gc3RhdHNcbiAgICB0aGlzLm1pbiA9IEluZmluaXR5O1xuICAgIHRoaXMubWF4ID0gLUluZmluaXR5O1xuICAgIHRoaXMuc3VtID0gMDtcbiAgICB0aGlzLnN1bU9mU3F1YXJlcyA9IDA7XG4gICAgdGhpcy5jb3VudCA9IDA7XG4gIH1cblxuICBvdXRwdXRTZWdtZW50KGVuZFRpbWUpIHtcbiAgICB0aGlzLm91dEZyYW1lWzBdID0gZW5kVGltZSAtIHRoaXMub25zZXRUaW1lO1xuICAgIHRoaXMub3V0RnJhbWVbMV0gPSB0aGlzLm1pbjtcbiAgICB0aGlzLm91dEZyYW1lWzJdID0gdGhpcy5tYXg7XG5cbiAgICBjb25zdCBub3JtID0gMSAvIHRoaXMuY291bnQ7XG4gICAgY29uc3QgbWVhbiA9IHRoaXMuc3VtICogbm9ybTtcbiAgICBjb25zdCBtZWFuT2ZTcXVhcmUgPSB0aGlzLnN1bU9mU3F1YXJlcyAqIG5vcm07XG4gICAgY29uc3Qgc3F1YXJlT2ZtZWFuID0gbWVhbiAqIG1lYW47XG5cbiAgICB0aGlzLm91dEZyYW1lWzNdID0gbWVhbjtcbiAgICB0aGlzLm91dEZyYW1lWzRdID0gMDtcblxuICAgIGlmIChtZWFuT2ZTcXVhcmUgPiBzcXVhcmVPZm1lYW4pXG4gICAgICB0aGlzLm91dEZyYW1lWzRdID0gTWF0aC5zcXJ0KG1lYW5PZlNxdWFyZSAtIHNxdWFyZU9mbWVhbik7XG5cbiAgICB0aGlzLm91dHB1dCh0aGlzLm9uc2V0VGltZSk7XG4gIH1cblxuICBpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcywge1xuICAgICAgZnJhbWVTaXplOiA1LFxuICAgICAgZGVzY3JpcHRpb246IFtcbiAgICAgICAgJ2R1cmF0aW9uJyxcbiAgICAgICAgJ21pbicsXG4gICAgICAgICdtYXgnLFxuICAgICAgICAnbWVhbicsXG4gICAgICAgICdzdGQgZGV2JyxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICB0aGlzLm1vdmluZ0F2ZXJhZ2UuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcyk7XG4gIH1cblxuICByZXNldCgpIHtcbiAgICBzdXBlci5yZXNldCgpO1xuICAgIHRoaXMubW92aW5nQXZlcmFnZS5yZXNldCgpO1xuICAgIHRoaXMucmVzZXRTZWdtZW50KCk7XG4gIH1cblxuICBmaW5hbGl6ZShlbmRUaW1lKSB7XG4gICAgaWYgKHRoaXMuaW5zaWRlU2VnbWVudClcbiAgICAgIHRoaXMub3V0cHV0U2VnbWVudChlbmRUaW1lKTtcblxuICAgIHN1cGVyLmZpbmFsaXplKGVuZFRpbWUpO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBjb25zdCByYXdWYWx1ZSA9IGZyYW1lWzBdO1xuICAgIGNvbnN0IG1pbklucHV0ID0gdGhpcy5wYXJhbXMubWluSW5wdXQ7XG4gICAgbGV0IHZhbHVlID0gTWF0aC5tYXgocmF3VmFsdWUsIG1pbklucHV0KTtcblxuICAgIGlmICh0aGlzLnBhcmFtcy5sb2dJbnB1dClcbiAgICAgIHZhbHVlID0gTWF0aC5sb2codmFsdWUpO1xuXG4gICAgY29uc3QgZGlmZiA9IHZhbHVlIC0gdGhpcy5sYXN0TXZhdnJnO1xuICAgIHRoaXMubGFzdE12YXZyZyA9IHRoaXMubW92aW5nQXZlcmFnZS5pbnB1dFNjYWxhcih2YWx1ZSk7XG5cbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG5cbiAgICBpZiAoZGlmZiA+IHRoaXMucGFyYW1zLnRocmVzaG9sZCAmJiB0aW1lIC0gdGhpcy5vbnNldFRpbWUgPiB0aGlzLnBhcmFtcy5taW5JbnRlcikge1xuICAgICAgaWYodGhpcy5pbnNpZGVTZWdtZW50KVxuICAgICAgICB0aGlzLm91dHB1dFNlZ21lbnQodGltZSk7XG5cbiAgICAgIC8vIHN0YXJ0IHNlZ21lbnRcbiAgICAgIHRoaXMuaW5zaWRlU2VnbWVudCA9IHRydWU7XG4gICAgICB0aGlzLm9uc2V0VGltZSA9IHRpbWU7XG4gICAgICB0aGlzLm1heCA9IC1JbmZpbml0eTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5pbnNpZGVTZWdtZW50KSB7XG4gICAgICB0aGlzLm1pbiA9IE1hdGgubWluKHRoaXMubWluLCByYXdWYWx1ZSk7XG4gICAgICB0aGlzLm1heCA9IE1hdGgubWF4KHRoaXMubWF4LCByYXdWYWx1ZSk7XG4gICAgICB0aGlzLnN1bSArPSByYXdWYWx1ZTtcbiAgICAgIHRoaXMuc3VtT2ZTcXVhcmVzICs9IHJhd1ZhbHVlICogcmF3VmFsdWU7XG4gICAgICB0aGlzLmNvdW50Kys7XG5cbiAgICAgIGlmICh0aW1lIC0gdGhpcy5vbnNldFRpbWUgPj0gdGhpcy5wYXJhbXMubWF4RHVyYXRpb24gfHwgdmFsdWUgPD0gdGhpcy5wYXJhbXMub2ZmVGhyZXNob2xkKSB7XG4gICAgICAgIHRoaXMub3V0cHV0U2VnbWVudCh0aW1lKTtcbiAgICAgICAgdGhpcy5pbnNpZGVTZWdtZW50ID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuY29uc3Qgd29ya2VyID0gYFxudmFyIGlzSW5maW5pdGVCdWZmZXIgPSBmYWxzZTtcbnZhciBzdGFjayA9IFtdO1xudmFyIGJ1ZmZlcjtcbnZhciBidWZmZXJMZW5ndGg7XG52YXIgY3VycmVudEluZGV4O1xuXG5mdW5jdGlvbiBpbml0KCkge1xuICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlckxlbmd0aCk7XG4gIHN0YWNrLmxlbmd0aCA9IDA7XG4gIGN1cnJlbnRJbmRleCA9IDA7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZChibG9jaykge1xuICB2YXIgYXZhaWxhYmxlU3BhY2UgPSBidWZmZXJMZW5ndGggLSBjdXJyZW50SW5kZXg7XG4gIHZhciBjdXJyZW50QmxvY2s7XG4gIC8vIHJldHVybiBpZiBhbHJlYWR5IGZ1bGxcbiAgaWYgKGF2YWlsYWJsZVNwYWNlIDw9IDApIHsgcmV0dXJuOyB9XG5cbiAgaWYgKGF2YWlsYWJsZVNwYWNlIDwgYmxvY2subGVuZ3RoKSB7XG4gICAgY3VycmVudEJsb2NrID0gYmxvY2suc3ViYXJyYXkoMCwgYXZhaWxhYmxlU3BhY2UpO1xuICB9IGVsc2Uge1xuICAgIGN1cnJlbnRCbG9jayA9IGJsb2NrO1xuICB9XG5cbiAgYnVmZmVyLnNldChjdXJyZW50QmxvY2ssIGN1cnJlbnRJbmRleCk7XG4gIGN1cnJlbnRJbmRleCArPSBjdXJyZW50QmxvY2subGVuZ3RoO1xuXG4gIGlmIChpc0luZmluaXRlQnVmZmVyICYmIGN1cnJlbnRJbmRleCA9PT0gYnVmZmVyLmxlbmd0aCkge1xuICAgIHN0YWNrLnB1c2goYnVmZmVyKTtcblxuICAgIGN1cnJlbnRCbG9jayA9IGJsb2NrLnN1YmFycmF5KGF2YWlsYWJsZVNwYWNlKTtcbiAgICBidWZmZXIgPSBuZXcgRmxvYXQzMkFycmF5KGJ1ZmZlci5sZW5ndGgpO1xuICAgIGJ1ZmZlci5zZXQoY3VycmVudEJsb2NrLCAwKTtcbiAgICBjdXJyZW50SW5kZXggPSBjdXJyZW50QmxvY2subGVuZ3RoO1xuICB9XG59XG5cbnNlbGYuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uKGUpIHtcbiAgc3dpdGNoIChlLmRhdGEuY29tbWFuZCkge1xuICAgIGNhc2UgJ2luaXQnOlxuICAgICAgaWYgKGlzRmluaXRlKGUuZGF0YS5kdXJhdGlvbikpIHtcbiAgICAgICAgYnVmZmVyTGVuZ3RoID0gZS5kYXRhLnNhbXBsZVJhdGUgKiBlLmRhdGEuZHVyYXRpb247XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpc0luZmluaXRlQnVmZmVyID0gdHJ1ZTtcbiAgICAgICAgYnVmZmVyTGVuZ3RoID0gZS5kYXRhLnNhbXBsZVJhdGUgKiAxMDtcbiAgICAgIH1cblxuICAgICAgaW5pdCgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlICdwcm9jZXNzJzpcbiAgICAgIHZhciBibG9jayA9IG5ldyBGbG9hdDMyQXJyYXkoZS5kYXRhLmJ1ZmZlcik7XG4gICAgICBhcHBlbmQoYmxvY2spO1xuXG5cbiAgICAgIC8vIGlmIHRoZSBidWZmZXIgaXMgZnVsbCByZXR1cm4gaXQsIG9ubHkgd29ya3Mgd2l0aCBmaW5pdGUgYnVmZmVyc1xuICAgICAgaWYgKCFpc0luZmluaXRlQnVmZmVyICYmIGN1cnJlbnRJbmRleCA9PT0gYnVmZmVyTGVuZ3RoKSB7XG4gICAgICAgIHZhciBidWYgPSBidWZmZXIuYnVmZmVyLnNsaWNlKDApO1xuICAgICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgYnVmZmVyOiBidWYgfSwgW2J1Zl0pO1xuICAgICAgICBpbml0KCk7XG4gICAgICB9XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgJ3N0b3AnOlxuICAgICAgaWYgKCFpc0luZmluaXRlQnVmZmVyKSB7XG4gICAgICAgIC8vIEBUT0RPIGFkZCBvcHRpb24gdG8gbm90IGNsaXAgdGhlIHJldHVybmVkIGJ1ZmZlclxuICAgICAgICAvLyB2YWx1ZXMgaW4gRkxvYXQzMkFycmF5IGFyZSA0IGJ5dGVzIGxvbmcgKDMyIC8gOClcbiAgICAgICAgdmFyIGNvcHkgPSBidWZmZXIuYnVmZmVyLnNsaWNlKDAsIGN1cnJlbnRJbmRleCAqICgzMiAvIDgpKTtcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGJ1ZmZlcjogY29weSB9LCBbY29weV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIGNvcHkgPSBuZXcgRmxvYXQzMkFycmF5KHN0YWNrLmxlbmd0aCAqIGJ1ZmZlckxlbmd0aCArIGN1cnJlbnRJbmRleCk7XG4gICAgICAgIHN0YWNrLmZvckVhY2goZnVuY3Rpb24oYnVmZmVyLCBpbmRleCkge1xuICAgICAgICAgIGNvcHkuc2V0KGJ1ZmZlciwgYnVmZmVyTGVuZ3RoICogaW5kZXgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBjb3B5LnNldChidWZmZXIuc3ViYXJyYXkoMCwgY3VycmVudEluZGV4KSwgc3RhY2subGVuZ3RoICogYnVmZmVyTGVuZ3RoKTtcbiAgICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGJ1ZmZlcjogY29weS5idWZmZXIgfSwgW2NvcHkuYnVmZmVyXSk7XG4gICAgICB9XG4gICAgICBpbml0KCk7XG4gICAgICBicmVhaztcbiAgfVxufSwgZmFsc2UpYDtcblxubGV0IGF1ZGlvQ29udGV4dDtcblxuLyoqXG4gKiBSZWNvcmQgYW4gYXVkaW8gc3RyZWFtXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvUmVjb3JkZXIgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIGR1cmF0aW9uOiAxMCwgLy8gc2Vjb25kc1xuICAgICAgaWdub3JlTGVhZGluZ1plcm9zOiB0cnVlLCAvLyBpZ25vcmUgemVyb3MgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgcmVjb2FyZGluZ1xuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gbmVlZGVkIHRvIHJldHJpdmUgYW4gQXVkaW9CdWZmZXJcbiAgICBpZiAoIXRoaXMucGFyYW1zLmN0eCkge1xuICAgICAgaWYgKCFhdWRpb0NvbnRleHQpIHsgYXVkaW9Db250ZXh0ID0gbmV3IHdpbmRvdy5BdWRpb0NvbnRleHQoKTsgfVxuICAgICAgdGhpcy5jdHggPSBhdWRpb0NvbnRleHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuY3R4ID0gdGhpcy5wYXJhbXMuY3R4O1xuICAgIH1cblxuICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2lnbm9yZVplcm9zID0gZmFsc2U7XG5cbiAgICBjb25zdCBibG9iID0gbmV3IEJsb2IoW3dvcmtlcl0sIHsgdHlwZTogJ3RleHQvamF2YXNjcmlwdCcgfSk7XG4gICAgdGhpcy53b3JrZXIgPSBuZXcgV29ya2VyKHdpbmRvdy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpKTtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKTtcblxuICAgIC8vIHByb3BhZ2F0ZSBgc3RyZWFtUGFyYW1zYCB0byB0aGUgd29ya2VyXG4gICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgY29tbWFuZDogJ2luaXQnLFxuICAgICAgZHVyYXRpb246IHRoaXMucGFyYW1zLmR1cmF0aW9uLFxuICAgICAgc2FtcGxlUmF0ZTogdGhpcy5zdHJlYW1QYXJhbXMuc291cmNlU2FtcGxlUmF0ZVxuICAgIH0pO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5faXNTdGFydGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9pZ25vcmVaZXJvcyA9IHRoaXMucGFyYW1zLmlnbm9yZUxlYWRpbmdaZXJvcztcblxuICAgIHRoaXMuY291bnQgPSAwO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBpZiAodGhpcy5faXNTdGFydGVkKSB7XG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IGNvbW1hbmQ6ICdzdG9wJyB9KTtcbiAgICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNhbGxlZCB3aGVuIGBzdG9wYCBpcyB0cmlnZ2VyZWQgb24gdGhlIHNvdXJjZVxuICAvLyBAdG9kbyAtIG9wdGlvbm5hbHkgdHJ1bmNhdGUgcmV0cmlldmVkIGJ1ZmZlciB0byBlbmQgdGltZVxuICBmaW5hbGl6ZShlbmRUaW1lKSB7XG4gICAgdGhpcy5zdG9wKCk7XG4gIH1cblxuICBwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgIGlmICghdGhpcy5faXNTdGFydGVkKSB7IHJldHVybjsgfVxuICAgIC8vIGB0aGlzLm91dEZyYW1lYCBtdXN0IGJlIHJlY3JlYXRlZCBlYWNoIHRpbWUgYmVjYXVzZVxuICAgIC8vIGl0IGlzIGNvcGllZCBpbiB0aGUgd29ya2VyIGFuZCBsb3N0IGZvciB0aGlzIGNvbnRleHRcbiAgICBsZXQgc2VuZEZyYW1lID0gbnVsbDtcblxuICAgIGlmICghdGhpcy5faWdub3JlWmVyb3MpIHtcbiAgICAgIHNlbmRGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWUpO1xuICAgIH0gZWxzZSBpZiAoZnJhbWVbZnJhbWUubGVuZ3RoIC0gMV0gIT09IDApIHtcbiAgICAgIGNvbnN0IGxlbiA9IGZyYW1lLmxlbmd0aDtcbiAgICAgIGxldCBpO1xuXG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgaWYgKGZyYW1lW2ldICE9PSAwKVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICAvLyBjb3B5IG5vbiB6ZXJvIHNlZ21lbnRcbiAgICAgIHNlbmRGcmFtZSA9IG5ldyBGbG9hdDMyQXJyYXkoZnJhbWUuc3ViYXJyYXkoaSkpO1xuICAgICAgdGhpcy5faWdub3JlWmVyb3MgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc2VuZEZyYW1lKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBzZW5kRnJhbWUuYnVmZmVyO1xuICAgICAgdGhpcy53b3JrZXIucG9zdE1lc3NhZ2Uoe1xuICAgICAgICBjb21tYW5kOiAncHJvY2VzcycsXG4gICAgICAgIGJ1ZmZlcjogYnVmZmVyXG4gICAgICB9LCBbYnVmZmVyXSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIHJldHJpZXZlIHRoZSBjcmVhdGVkIGF1ZGlvQnVmZmVyXG4gICAqIEByZXR1cm4ge1Byb21pc2V9XG4gICAqL1xuICByZXRyaWV2ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSAoZSkgPT4ge1xuICAgICAgICAvLyBpZiBjYWxsZWQgd2hlbiBidWZmZXIgaXMgZnVsbCwgc3RvcCB0aGUgcmVjb3JkZXIgdG9vXG4gICAgICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgICAgIHRoaXMud29ya2VyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBjYWxsYmFjaywgZmFsc2UpO1xuICAgICAgICAvLyBjcmVhdGUgYW4gYXVkaW8gYnVmZmVyIGZyb20gdGhlIGRhdGFcbiAgICAgICAgY29uc3QgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShlLmRhdGEuYnVmZmVyKTtcbiAgICAgICAgY29uc3QgbGVuZ3RoID0gYnVmZmVyLmxlbmd0aDtcbiAgICAgICAgY29uc3Qgc2FtcGxlUmF0ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGU7XG5cbiAgICAgICAgY29uc3QgYXVkaW9CdWZmZXIgPSB0aGlzLmN0eC5jcmVhdGVCdWZmZXIoMSwgbGVuZ3RoLCBzYW1wbGVSYXRlKTtcbiAgICAgICAgY29uc3QgYXVkaW9BcnJheUJ1ZmZlciA9IGF1ZGlvQnVmZmVyLmdldENoYW5uZWxEYXRhKDApO1xuICAgICAgICBhdWRpb0FycmF5QnVmZmVyLnNldChidWZmZXIsIDApO1xuXG4gICAgICAgIHJlc29sdmUoYXVkaW9CdWZmZXIpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJhc2VEcmF3IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKGV4dGVuZERlZmF1bHRzID0ge30sIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IGRlZmF1bHRzID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICBkdXJhdGlvbjogMSxcbiAgICAgIG1pbjogLTEsXG4gICAgICBtYXg6IDEsXG4gICAgICB3aWR0aDogMzAwLFxuICAgICAgaGVpZ2h0OiAxNTAsIC8vIGRlZmF1bHQgY2FudmFzIHNpemUgaW4gRE9NIHRvb1xuICAgICAgaXNTeW5jaHJvbml6ZWQ6IGZhbHNlLCAvLyBpcyBzZXQgdG8gdHJ1ZSBpZiB1c2VkIGluIGEgc3luY2hyb25pemVkU2lua1xuICAgICAgY2FudmFzOiBudWxsLCAvLyBhbiBleGlzdGluZyBjYW52YXMgZWxlbWVudCBiZSB1c2VkIGZvciBkcmF3aW5nXG4gICAgICBjb250YWluZXI6IG51bGwsIC8vIGEgc2VsZWN0b3IgaW5zaWRlIHdoaWNoIGNyZWF0ZSBhbiBlbGVtZW50XG4gICAgfSwgZXh0ZW5kRGVmYXVsdHMpO1xuXG4gICAgc3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jYW52YXMgJiYgIXRoaXMucGFyYW1zLmNvbnRhaW5lcilcbiAgICAgIHRocm93IG5ldyBFcnJvcigncGFyYW1ldGVyIGBjYW52YXNgIG9yIGBjb250YWluZXJgIGFyZSBtYW5kYXRvcnknKTtcblxuICAgIC8vIHByZXBhcmUgY2FudmFzXG4gICAgaWYgKHRoaXMucGFyYW1zLmNhbnZhcykge1xuICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLnBhcmFtcy5jYW52YXM7XG4gICAgfSBlbHNlIGlmICh0aGlzLnBhcmFtcy5jb250YWluZXIpIHtcbiAgICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGhpcy5wYXJhbXMuY29udGFpbmVyKTtcbiAgICAgIHRoaXMuY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuICAgIH1cblxuICAgIHRoaXMuY3R4ID0gdGhpcy5jYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgIHRoaXMuY2FjaGVkQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgdGhpcy5jYWNoZWRDdHggPSB0aGlzLmNhY2hlZENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgdGhpcy5wcmV2aW91c1RpbWUgPSAwO1xuICAgIHRoaXMubGFzdFNoaWZ0RXJyb3IgPSAwO1xuICAgIHRoaXMuY3VycmVudFBhcnRpYWxTaGlmdCA9IDA7XG5cbiAgICB0aGlzLnJlc2l6ZSh0aGlzLnBhcmFtcy53aWR0aCwgdGhpcy5wYXJhbXMuaGVpZ2h0KTtcblxuICAgIC8vXG4gICAgdGhpcy5fc3RhY2s7XG4gICAgdGhpcy5fcmFmSWQ7XG4gICAgdGhpcy5kcmF3ID0gdGhpcy5kcmF3LmJpbmQodGhpcyk7XG4gIH1cblxuICAvLyBwYXJhbXMgbW9kaWZpZXJzXG4gIHNldCBkdXJhdGlvbihkdXJhdGlvbikge1xuICAgIHRoaXMucGFyYW1zLmR1cmF0aW9uID0gZHVyYXRpb247XG4gIH1cblxuICBzZXQgbWluKG1pbikge1xuICAgIHRoaXMucGFyYW1zLm1pbiA9IG1pbjtcbiAgICB0aGlzLl9zZXRZU2NhbGUoKTtcbiAgfVxuXG4gIHNldCBtYXgobWF4KSB7XG4gICAgdGhpcy5wYXJhbXMubWF4ID0gbWF4O1xuICAgIHRoaXMuX3NldFlTY2FsZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgdHJhbnNmZXJ0IGZ1bmN0aW9uIHVzZWQgdG8gbWFwIHZhbHVlcyB0byBwaXhlbCBpbiB0aGUgeSBheGlzXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfc2V0WVNjYWxlKCkge1xuICAgIGNvbnN0IG1pbiA9IHRoaXMucGFyYW1zLm1pbjtcbiAgICBjb25zdCBtYXggPSB0aGlzLnBhcmFtcy5tYXg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJhbXMuaGVpZ2h0O1xuXG4gICAgY29uc3QgYSA9ICgwIC0gaGVpZ2h0KSAvIChtYXggLSBtaW4pO1xuICAgIGNvbnN0IGIgPSBoZWlnaHQgLSAoYSAqIG1pbik7XG5cbiAgICB0aGlzLmdldFlQb3NpdGlvbiA9ICh4KSA9PiBhICogeCArIGI7XG4gIH1cblxuICBzZXR1cFN0cmVhbSgpIHtcbiAgICBzdXBlci5zZXR1cFN0cmVhbSgpO1xuICAgIC8vIGtlZXAgdHJhY2sgb2YgdGhlIHByZXZpb3VzIGZyYW1lXG4gICAgdGhpcy5wcmV2aW91c0ZyYW1lID0gbmV3IEZsb2F0MzJBcnJheSh0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcykge1xuICAgIHN1cGVyLmluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpO1xuXG4gICAgdGhpcy5fc3RhY2sgPSBbXTtcbiAgICB0aGlzLl9yYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmRyYXcpO1xuICB9XG5cbiAgcmVzZXQoKSB7XG4gICAgc3VwZXIucmVzZXQoKTtcbiAgICB0aGlzLmN0eC5jbGVhclJlY3QoMCwgMCwgdGhpcy5wYXJhbXMud2lkdGgsIHRoaXMucGFyYW1zLmhlaWdodCk7XG4gICAgdGhpcy5jYWNoZWRDdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucGFyYW1zLndpZHRoLCB0aGlzLnBhcmFtcy5oZWlnaHQpO1xuICB9XG5cbiAgZmluYWxpemUoZW5kVGltZSAgKSB7XG4gICAgc3VwZXIuZmluYWxpemUoZW5kVGltZSAgKTtcbiAgICBjYW5jZWxBbmltYXRpb25GcmFtZSh0aGlzLl9yYWZJZCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHRoZSBjdXJyZW50IGZyYW1lIHRvIHRoZSBmcmFtZXMgdG8gZHJhdy4gU2hvdWxkIG5vdCBiZSBvdmVycmlkZW4uXG4gICAqIEBpbmhlcml0ZG9jXG4gICAqIEBmaW5hbFxuICAgKi9cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBjb25zdCBidWZmZXIgPSBmcmFtZS5idWZmZXIuc2xpY2UoMCk7IC8vIGNvcHkgdmFsdWVzIGluc3RlYWQgb2YgcmVmZXJlbmNlXG4gICAgY29uc3QgY29weSA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyKTtcblxuICAgIHRoaXMuX3N0YWNrLnB1c2goeyB0aW1lLCBmcmFtZTogY29weSwgbWV0YURhdGEgfSk7XG4gIH1cblxuICBkcmF3KCkge1xuICAgIGZvciAobGV0IGkgPSAwLCBsZW5ndGggPSB0aGlzLl9zdGFjay5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgY29uc3QgZXZlbnQgPSB0aGlzLl9zdGFja1tpXTtcbiAgICAgIHRoaXMuZXhlY3V0ZURyYXcoZXZlbnQudGltZSwgZXZlbnQuZnJhbWUpO1xuICAgIH1cblxuICAgIC8vIHJlaW5pdCBzdGFjayBmb3IgbmV4dCBjYWxsXG4gICAgdGhpcy5fc3RhY2subGVuZ3RoID0gMDtcbiAgICB0aGlzLl9yYWZJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLmRyYXcpO1xuICB9XG5cbiAgZXhlY3V0ZURyYXcodGltZSwgZnJhbWUpIHtcbiAgICB0aGlzLnNjcm9sbE1vZGVEcmF3KHRpbWUsIGZyYW1lKTtcbiAgfVxuXG4gIHJlc2l6ZSh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3QgY2FjaGVkQ3R4ID0gdGhpcy5jYWNoZWRDdHg7XG5cbiAgICAvLyBAdG9kbyAtIGZpeCB0aGlzLCBwcm9ibGVtIHdpdGggdGhlIGNhY2hlZCBjYW52YXMuLi5cbiAgICAvLyBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy9jYW52YXMvaGlkcGkvXG4gICAgLy8gY29uc3QgYXV0byA9IHRydWU7XG4gICAgLy8gY29uc3QgZGV2aWNlUGl4ZWxSYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgLy8gY29uc3QgYmFja2luZ1N0b3JlUmF0aW8gPSBjdHgud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgY3R4Lm1vekJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGN0eC5tc0JhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHxcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIGN0eC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgY3R4LmJhY2tpbmdTdG9yZVBpeGVsUmF0aW8gfHwgMTtcblxuICAgIC8vIGlmIChhdXRvICYmIGRldmljZVBpeGVsUmF0aW8gIT09IGJhY2tpbmdTdG9yZVJhdGlvKSB7XG4gICAgLy8gICBjb25zdCByYXRpbyA9IGRldmljZVBpeGVsUmF0aW8gLyBiYWNraW5nU3RvcmVSYXRpbztcblxuICAgIC8vICAgdGhpcy5wYXJhbXMud2lkdGggPSB3aWR0aCAqIHJhdGlvO1xuICAgIC8vICAgdGhpcy5wYXJhbXMuaGVpZ2h0ID0gaGVpZ2h0ICogcmF0aW87XG5cbiAgICAvLyAgIGN0eC5jYW52YXMud2lkdGggPSBjYWNoZWRDdHguY2FudmFzLndpZHRoID0gdGhpcy5wYXJhbXMud2lkdGg7XG4gICAgLy8gICBjdHguY2FudmFzLmhlaWdodCA9IGNhY2hlZEN0eC5jYW52YXMuaGVpZ2h0ID0gdGhpcy5wYXJhbXMuaGVpZ2h0O1xuXG4gICAgLy8gICBjdHguY2FudmFzLnN0eWxlLndpZHRoID0gYCR7d2lkdGh9cHhgO1xuICAgIC8vICAgY3R4LmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBgJHtoZWlnaHR9cHhgO1xuXG4gICAgLy8gICBjdHguc2NhbGUocmF0aW8sIHJhdGlvKTtcbiAgICAvLyB9IGVsc2Uge1xuICAgICAgdGhpcy5wYXJhbXMud2lkdGggPSB3aWR0aDtcbiAgICAgIHRoaXMucGFyYW1zLmhlaWdodCA9IGhlaWdodDtcblxuICAgICAgY3R4LmNhbnZhcy53aWR0aCA9IGNhY2hlZEN0eC5jYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgIGN0eC5jYW52YXMuaGVpZ2h0ID0gY2FjaGVkQ3R4LmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgLy8gfVxuXG4gICAgLy8gY2xlYXIgY2FjaGUgY2FudmFzXG4gICAgY2FjaGVkQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnBhcmFtcy53aWR0aCwgdGhpcy5wYXJhbXMuaGVpZ2h0KTtcbiAgICAvLyB1cGRhdGUgc2NhbGVcbiAgICB0aGlzLl9zZXRZU2NhbGUoKTtcbiAgfVxuXG4gIC8vIGRlZmF1bHQgZHJhdyBtb2RlXG4gIHNjcm9sbE1vZGVEcmF3KHRpbWUsIGZyYW1lKSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3Qgd2lkdGggPSB0aGlzLnBhcmFtcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnBhcmFtcy5kdXJhdGlvbjtcblxuICAgIGNvbnN0IGR0ID0gdGltZSAtIHRoaXMucHJldmlvdXNUaW1lO1xuICAgIGNvbnN0IGZTaGlmdCA9IChkdCAvIGR1cmF0aW9uKSAqIHdpZHRoIC0gdGhpcy5sYXN0U2hpZnRFcnJvcjtcbiAgICBjb25zdCBpU2hpZnQgPSBNYXRoLnJvdW5kKGZTaGlmdCk7XG4gICAgdGhpcy5sYXN0U2hpZnRFcnJvciA9IGlTaGlmdCAtIGZTaGlmdDtcblxuICAgIGNvbnN0IHBhcnRpYWxTaGlmdCA9IGlTaGlmdCAtIHRoaXMuY3VycmVudFBhcnRpYWxTaGlmdDtcbiAgICB0aGlzLnNoaWZ0Q2FudmFzKHBhcnRpYWxTaGlmdCk7XG5cbiAgICAvLyBzaGlmdCBhbGwgc2libGluZ3MgaWYgc3luY2hyb25pemVkXG4gICAgaWYgKHRoaXMucGFyYW1zLmlzU3luY2hyb25pemVkICYmIHRoaXMuc3luY2hyb25pemVyKVxuICAgICAgdGhpcy5zeW5jaHJvbml6ZXIuc2hpZnRTaWJsaW5ncyhwYXJ0aWFsU2hpZnQsIHRoaXMpO1xuXG4gICAgLy8gdHJhbnNsYXRlIHRvIHRoZSBjdXJyZW50IGZyYW1lIGFuZCBkcmF3IGEgbmV3IHBvbHlnb25cbiAgICBjdHguc2F2ZSgpO1xuICAgIGN0eC50cmFuc2xhdGUod2lkdGgsIDApO1xuICAgIHRoaXMuZHJhd0N1cnZlKGZyYW1lLCB0aGlzLnByZXZpb3VzRnJhbWUsIGlTaGlmdCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcbiAgICAvLyB1cGRhdGUgYGN1cnJlbnRQYXJ0aWFsU2hpZnRgXG4gICAgdGhpcy5jdXJyZW50UGFydGlhbFNoaWZ0IC09IGlTaGlmdDtcbiAgICAvLyBzYXZlIGN1cnJlbnQgc3RhdGUgaW50byBidWZmZXIgY2FudmFzXG4gICAgdGhpcy5jYWNoZWRDdHguY2xlYXJSZWN0KDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgIHRoaXMuY2FjaGVkQ3R4LmRyYXdJbWFnZSh0aGlzLmNhbnZhcywgMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICB0aGlzLnByZXZpb3VzRnJhbWUuc2V0KGZyYW1lLCAwKTtcbiAgICB0aGlzLnByZXZpb3VzVGltZSA9IHRpbWU7XG4gIH1cblxuICBzaGlmdENhbnZhcyhzaGlmdCkge1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuICAgIGNvbnN0IHdpZHRoID0gdGhpcy5wYXJhbXMud2lkdGg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJhbXMuaGVpZ2h0O1xuXG4gICAgdGhpcy5jdXJyZW50UGFydGlhbFNoaWZ0ICs9IHNoaWZ0O1xuXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICBjdHguc2F2ZSgpO1xuXG4gICAgY29uc3QgY3JvcHBlZFdpZHRoID0gd2lkdGggLSB0aGlzLmN1cnJlbnRQYXJ0aWFsU2hpZnQ7XG5cbiAgICBjdHguZHJhd0ltYWdlKHRoaXMuY2FjaGVkQ2FudmFzLFxuICAgICAgdGhpcy5jdXJyZW50UGFydGlhbFNoaWZ0LCAwLCBjcm9wcGVkV2lkdGgsIGhlaWdodCxcbiAgICAgIDAsIDAsIGNyb3BwZWRXaWR0aCwgaGVpZ2h0XG4gICAgKTtcblxuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cblxuICAvKipcbiAgICogSW50ZXJmYWNlIG1ldGhvZCB0byBpbXBsZW1lbnQgaW4gb3JkZXIgdG8gZGVmaW5lIGhvdyB0byBkcmF3IHRoZSBzaGFwZVxuICAgKiBiZXR3ZWVuIHRoZSBwcmV2aW91cyBhbmQgdGhlIGN1cnJlbnQgZnJhbWUsIGFzc3VtaW5nIHRoZSBjYW52YXMgY29udGV4dFxuICAgKiBpcyBjZW50ZXJlZCBvbiB0aGUgY3VycmVudCBmcmFtZS5cbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IGZyYW1lIC0gVGhlIGN1cnJlbnQgZnJhbWUgdG8gZHJhdy5cbiAgICogQHBhcmFtIHtGbG9hdDMyQXJyYXl9IHByZXZGcmFtZSAtIFRoZSBsYXN0IGZyYW1lLlxuICAgKiBAcGFyYW0ge051bWJlcn0gaVNoaWZ0IC0gdGhlIG51bWJlciBvZiBwaXhlbHMgYmV0d2VlbiB0aGUgbGFzdCBhbmQgdGhlIGN1cnJlbnQgZnJhbWUuXG4gICAqL1xuICBkcmF3Q3VydmUoZnJhbWUsIHByZXZGcmFtZSwgaVNoaWZ0KSB7XG4gICAgY29uc29sZS5lcnJvcignbXVzdCBiZSBpbXBsZW1lbnRlZCcpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQnBmIGV4dGVuZHMgQmFzZURyYXcge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgdHJpZ2dlcjogZmFsc2UsXG4gICAgICByYWRpdXM6IDAsXG4gICAgICBsaW5lOiB0cnVlXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICAvLyBmb3IgbG9vcCBtb2RlXG4gICAgdGhpcy5jdXJyZW50WFBvc2l0aW9uID0gMDtcbiAgfVxuXG4gIGluaXRpYWxpemUoaW5TdHJlYW1QYXJhbXMpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKTtcblxuICAgIC8vIGNyZWF0ZSBhbiBhcnJheSBvZiBjb2xvcnMgYWNjb3JkaW5nIHRvIHRoZSBgb3V0RnJhbWVgIHNpemVcbiAgICBpZiAoIXRoaXMucGFyYW1zLmNvbG9ycykge1xuICAgICAgdGhpcy5wYXJhbXMuY29sb3JzID0gW107XG5cbiAgICAgIGZvciAobGV0IGkgPSAwLCBsID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplOyBpIDwgbDsgaSsrKVxuICAgICAgICB0aGlzLnBhcmFtcy5jb2xvcnMucHVzaChnZXRSYW5kb21Db2xvcigpKTtcbiAgICB9XG4gIH1cblxuICAvLyBhbGxvdyB0byB3aXRjaCBlYXNpbHkgYmV0d2VlbiB0aGUgMiBtb2Rlc1xuICBzZXRUcmlnZ2VyKGJvb2wpIHtcbiAgICB0aGlzLnBhcmFtcy50cmlnZ2VyID0gYm9vbDtcbiAgICAvLyBjbGVhciBjYW52YXMgYW5kIGNhY2hlXG4gICAgdGhpcy5jdHguY2xlYXJSZWN0KDAsIDAsIHRoaXMucGFyYW1zLndpZHRoLCB0aGlzLnBhcmFtcy5oZWlnaHQpO1xuICAgIHRoaXMuY2FjaGVkQ3R4LmNsZWFyUmVjdCgwLCAwLCB0aGlzLnBhcmFtcy53aWR0aCwgdGhpcy5wYXJhbXMuaGVpZ2h0KTtcbiAgICAvLyByZXNldCBjdXJyZW50WFBvc2l0aW9uXG4gICAgdGhpcy5jdXJyZW50WFBvc2l0aW9uID0gMDtcbiAgICB0aGlzLmxhc3RTaGlmdEVycm9yID0gMDtcbiAgfVxuXG4gIGV4ZWN1dGVEcmF3KHRpbWUsIGZyYW1lKSB7XG4gICAgaWYgKHRoaXMucGFyYW1zLnRyaWdnZXIpXG4gICAgICB0aGlzLnRyaWdnZXJNb2RlRHJhdyh0aW1lLCBmcmFtZSk7XG4gICAgZWxzZVxuICAgICAgdGhpcy5zY3JvbGxNb2RlRHJhdyh0aW1lLCBmcmFtZSk7XG5cbiAgICBzdXBlci5wcm9jZXNzKHRpbWUsIGZyYW1lKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBbHRlcm5hdGl2ZSBkcmF3aW5nIG1vZGUuXG4gICAqIERyYXcgZnJvbSBsZWZ0IHRvIHJpZ2h0LCBnbyBiYWNrIHRvIGxlZnQgd2hlbiA+IHdpZHRoXG4gICAqL1xuICB0cmlnZ2VyTW9kZURyYXcodGltZSwgZnJhbWUpIHtcbiAgICBjb25zdCB3aWR0aCAgPSB0aGlzLnBhcmFtcy53aWR0aDtcbiAgICBjb25zdCBoZWlnaHQgPSB0aGlzLnBhcmFtcy5oZWlnaHQ7XG4gICAgY29uc3QgZHVyYXRpb24gPSB0aGlzLnBhcmFtcy5kdXJhdGlvbjtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcblxuICAgIGNvbnN0IGR0ID0gdGltZSAtIHRoaXMucHJldmlvdXNUaW1lO1xuICAgIGNvbnN0IGZTaGlmdCA9IChkdCAvIGR1cmF0aW9uKSAqIHdpZHRoIC0gdGhpcy5sYXN0U2hpZnRFcnJvcjsgLy8gcHhcbiAgICBjb25zdCBpU2hpZnQgPSBNYXRoLnJvdW5kKGZTaGlmdCk7XG4gICAgdGhpcy5sYXN0U2hpZnRFcnJvciA9IGlTaGlmdCAtIGZTaGlmdDtcblxuICAgIHRoaXMuY3VycmVudFhQb3NpdGlvbiArPSBpU2hpZnQ7XG5cbiAgICAvLyBkcmF3IHRoZSByaWdodCBwYXJ0XG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHgudHJhbnNsYXRlKHRoaXMuY3VycmVudFhQb3NpdGlvbiwgMCk7XG4gICAgY3R4LmNsZWFyUmVjdCgtaVNoaWZ0LCAwLCBpU2hpZnQsIGhlaWdodCk7XG4gICAgdGhpcy5kcmF3Q3VydmUoZnJhbWUsIGlTaGlmdCk7XG4gICAgY3R4LnJlc3RvcmUoKTtcblxuICAgIC8vIGdvIGJhY2sgdG8gdGhlIGxlZnQgb2YgdGhlIGNhbnZhcyBhbmQgcmVkcmF3IHRoZSBzYW1lIHRoaW5nXG4gICAgaWYgKHRoaXMuY3VycmVudFhQb3NpdGlvbiA+IHdpZHRoKSB7XG4gICAgICAvLyBnbyBiYWNrIHRvIHN0YXJ0XG4gICAgICB0aGlzLmN1cnJlbnRYUG9zaXRpb24gLT0gd2lkdGg7XG5cbiAgICAgIGN0eC5zYXZlKCk7XG4gICAgICBjdHgudHJhbnNsYXRlKHRoaXMuY3VycmVudFhQb3NpdGlvbiwgMCk7XG4gICAgICBjdHguY2xlYXJSZWN0KC1pU2hpZnQsIDAsIGlTaGlmdCwgaGVpZ2h0KTtcbiAgICAgIHRoaXMuZHJhd0N1cnZlKGZyYW1lLCB0aGlzLnByZXZpb3VzRnJhbWUsIGlTaGlmdCk7XG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxuXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldkZyYW1lLCBpU2hpZnQpIHtcbiAgICBjb25zdCBjb2xvcnMgPSB0aGlzLnBhcmFtcy5jb2xvcnM7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3QgcmFkaXVzID0gdGhpcy5wYXJhbXMucmFkaXVzO1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBmcmFtZS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAvLyBjb2xvciBzaG91bGQgYmVjaG9zZW4gYWNjb3JkaW5nIHRvIGluZGV4XG4gICAgICBjdHguZmlsbFN0eWxlID0gY29sb3JzW2ldO1xuICAgICAgY3R4LnN0cm9rZVN0eWxlID0gY29sb3JzW2ldO1xuXG4gICAgICBjb25zdCBwb3NZID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbaV0pO1xuICAgICAgLy8gYXMgYW4gb3B0aW9ucyA/IHJhZGl1cyA/XG4gICAgICBpZiAocmFkaXVzID4gMCkge1xuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5hcmMoMCwgcG9zWSwgcmFkaXVzLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgICAgICBjdHguZmlsbCgpO1xuICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICB9XG5cbiAgICAgIGlmIChwcmV2RnJhbWUgJiYgdGhpcy5wYXJhbXMubGluZSkge1xuICAgICAgICBjb25zdCBsYXN0UG9zWSA9IHRoaXMuZ2V0WVBvc2l0aW9uKHByZXZGcmFtZVtpXSk7XG4gICAgICAgIC8vIGRyYXcgbGluZVxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIGN0eC5tb3ZlVG8oLWlTaGlmdCwgbGFzdFBvc1kpO1xuICAgICAgICBjdHgubGluZVRvKDAsIHBvc1kpO1xuICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgIH1cblxuICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5cbi8qKlxuICogQ3JlYXRlIGEgYnJpZGdlIGJldHdlZW4gYHB1c2hgIHRvIGBwdWxsYCBwYXJhZGlnbXMuXG4gKiBBbGlhcyBgb3V0RnJhbWVgIHRvIGBkYXRhYCBhbmQgYWNjdW11bGF0ZSBpbmNvbW1pbmcgZnJhbWVzIGludG8gaXQuXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEJyaWRnZSBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zLCBwcm9jZXNzKSB7XG4gICAgc3VwZXIob3B0aW9ucyk7XG5cbiAgICB0aGlzLnByb2Nlc3MgPSBwcm9jZXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5kYXRhID0gdGhpcy5vdXRGcmFtZSA9IFtdO1xuICB9XG5cbiAgc2V0dXBTdHJlYW0oKSB7XG4gICAgc3VwZXIuc2V0dXBTdHJlYW0oKTtcbiAgICB0aGlzLmRhdGEubGVuZ3RoID0gMDtcbiAgfVxuXG4gIHJlc2V0KCkge1xuICAgIHRoaXMuZGF0YS5sZW5ndGggPSAwO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuY29uc3Qgd29ya2VyID0gYFxudmFyIF9zZXBhcmF0ZUFycmF5cyA9IGZhbHNlO1xudmFyIF9kYXRhID0gW107XG52YXIgX3NlcGFyYXRlQXJyYXlzRGF0YSA9IHsgdGltZTogW10sIGRhdGE6IFtdIH07XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gIF9kYXRhLmxlbmd0aCA9IDA7XG4gIF9zZXBhcmF0ZUFycmF5c0RhdGEudGltZS5sZW5ndGggPSAwO1xuICBfc2VwYXJhdGVBcnJheXNEYXRhLmRhdGEubGVuZ3RoID0gMDtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzcyh0aW1lLCBkYXRhKSB7XG4gIGlmIChfc2VwYXJhdGVBcnJheXMpIHtcbiAgICBfc2VwYXJhdGVBcnJheXNEYXRhLnRpbWUucHVzaCh0aW1lKTtcbiAgICBfc2VwYXJhdGVBcnJheXNEYXRhLmRhdGEucHVzaChkYXRhKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgZGF0dW0gPSB7IHRpbWU6IHRpbWUsIGRhdGE6IGRhdGEgfTtcbiAgICBfZGF0YS5wdXNoKGRhdHVtKTtcbiAgfVxufVxuXG5zZWxmLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbihlKSB7XG4gIHN3aXRjaCAoZS5kYXRhLmNvbW1hbmQpIHtcbiAgICBjYXNlICdpbml0JzpcbiAgICAgIF9zZXBhcmF0ZUFycmF5cyA9IGUuZGF0YS5zZXBhcmF0ZUFycmF5cztcbiAgICAgIGluaXQoKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Byb2Nlc3MnOlxuICAgICAgdmFyIHRpbWUgPSBlLmRhdGEudGltZTtcbiAgICAgIHZhciBkYXRhID0gbmV3IEZsb2F0MzJBcnJheShlLmRhdGEuYnVmZmVyKTtcbiAgICAgIHByb2Nlc3ModGltZSwgZGF0YSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzdG9wJzpcbiAgICAgIHZhciBkYXRhID0gX3NlcGFyYXRlQXJyYXlzID8gX3NlcGFyYXRlQXJyYXlzRGF0YSA6IF9kYXRhO1xuICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IGRhdGE6IGRhdGEgfSk7XG4gICAgICBpbml0KCk7XG4gICAgICBicmVhaztcbiAgfVxufSk7XG5gO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhUmVjb3JkZXIgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIC8vIGRlZmF1bHQgZm9ybWF0IGlzIFt7dGltZSwgZGF0YX0sIHt0aW1lLCBkYXRhfV1cbiAgICAgIC8vIGlmIHNldCB0byBgdHJ1ZWAgZm9ybWF0IGlzIHsgdGltZTogWy4uLl0sIGRhdGE6IFsuLi5dIH1cbiAgICAgIHNlcGFyYXRlQXJyYXlzOiBmYWxzZSxcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIEB0b2RvIC0gcmVuYW1lIGBpc1JlY29yZGluZ2BcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSBmYWxzZTtcblxuICAgIC8vIGluaXQgd29ya2VyXG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFt3b3JrZXJdLCB7IHR5cGU6ICd0ZXh0L2phdmFzY3JpcHQnIH0pO1xuICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKSk7XG4gIH1cblxuICBpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcyk7XG5cbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICBjb21tYW5kOiAnaW5pdCcsXG4gICAgICBzZXBhcmF0ZUFycmF5czogdGhpcy5wYXJhbXMuc2VwYXJhdGVBcnJheXMsXG4gICAgfSk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSB0cnVlO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICBpZiAodGhpcy5faXNTdGFydGVkKSB7XG4gICAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7IGNvbW1hbmQ6ICdzdG9wJyB9KTtcbiAgICAgIHRoaXMuX2lzU3RhcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIHRoaXMuc3RvcCgpO1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICBpZiAoIXRoaXMuX2lzU3RhcnRlZCkgeyByZXR1cm47IH1cblxuICAgIHRoaXMub3V0RnJhbWUgPSBuZXcgRmxvYXQzMkFycmF5KGZyYW1lKTtcbiAgICBjb25zdCBidWZmZXIgPSB0aGlzLm91dEZyYW1lLmJ1ZmZlcjtcblxuICAgIHRoaXMud29ya2VyLnBvc3RNZXNzYWdlKHtcbiAgICAgIGNvbW1hbmQ6ICdwcm9jZXNzJyxcbiAgICAgIHRpbWU6IHRpbWUsXG4gICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICB9LCBbYnVmZmVyXSk7XG4gIH1cblxuICByZXRyaWV2ZSgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY2FsbGJhY2sgPSAoZSkgPT4ge1xuICAgICAgICB0aGlzLl9zdGFydGVkID0gZmFsc2U7XG5cbiAgICAgICAgdGhpcy53b3JrZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgICAgIHJlc29sdmUoZS5kYXRhLmRhdGEpO1xuICAgICAgfTtcblxuICAgICAgdGhpcy53b3JrZXIuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGNhbGxiYWNrLCBmYWxzZSk7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBBdWRpb1JlY29yZGVyIGZyb20gJy4vYXVkaW8tcmVjb3JkZXInO1xuaW1wb3J0IEJwZiBmcm9tICcuL2JwZic7XG5pbXBvcnQgQnJpZGdlIGZyb20gJy4vYnJpZGdlJztcbmltcG9ydCBEYXRhUmVjb3JkZXIgZnJvbSAnLi9kYXRhLXJlY29yZGVyJztcbmltcG9ydCBNYXJrZXIgZnJvbSAnLi9tYXJrZXInO1xuaW1wb3J0IFNwZWN0cm9ncmFtIGZyb20gJy4vc3BlY3Ryb2dyYW0nO1xuaW1wb3J0IFNvY2tldENsaWVudCBmcm9tICcuL3NvY2tldC1jbGllbnQnO1xuaW1wb3J0IFNvY2tldFNlcnZlciBmcm9tICcuL3NvY2tldC1zZXJ2ZXInO1xuaW1wb3J0IFNvbm9ncmFtIGZyb20gJy4vc29ub2dyYW0nO1xuaW1wb3J0IFN5bmNocm9uaXplZERyYXcgZnJvbSAnLi9zeW5jaHJvbml6ZWQtZHJhdyc7XG5pbXBvcnQgVHJhY2UgZnJvbSAnLi90cmFjZSc7XG5pbXBvcnQgV2F2ZWZvcm0gZnJvbSAnLi93YXZlZm9ybSc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgQXVkaW9SZWNvcmRlcixcbiAgQnBmLFxuICBCcmlkZ2UsXG4gIERhdGFSZWNvcmRlcixcbiAgTWFya2VyLFxuICBTcGVjdHJvZ3JhbSxcbiAgU29ja2V0Q2xpZW50LFxuICBTb2NrZXRTZXJ2ZXIsXG4gIFNvbm9ncmFtLFxuICBTeW5jaHJvbml6ZWREcmF3LFxuICBUcmFjZSxcbiAgV2F2ZWZvcm0sXG59O1xuIiwiaW1wb3J0IEJhc2VEcmF3IGZyb20gJy4vYmFzZS1kcmF3JztcbmltcG9ydCB7IGdldFJhbmRvbUNvbG9yIH0gZnJvbSAnLi4vdXRpbHMvZHJhdy11dGlscyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTWFya2VyIGV4dGVuZHMgQmFzZURyYXcge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgc3VwZXIoe1xuICAgICAgZnJhbWVTaXplOiAxLFxuICAgICAgY29sb3I6IGdldFJhbmRvbUNvbG9yKCksXG4gICAgICB0aHJlc2hvbGQ6IDAsXG4gICAgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBkcmF3Q3VydmUoZnJhbWUsIHByZXZGcmFtZSwgaVNoaWZ0KSB7XG4gICAgY29uc3QgY29sb3IgPSB0aGlzLnBhcmFtcy5jb2xvcjtcbiAgICBjb25zdCBjdHggPSB0aGlzLmN0eDtcbiAgICBjb25zdCBoZWlnaHQgPSBjdHguaGVpZ2h0O1xuXG4gICAgY29uc3QgdmFsdWUgPSBmcmFtZVswXTtcblxuICAgIGlmICh2YWx1ZSA+IHRoaXMucGFyYW1zLnRocmVzaG9sZCkge1xuICAgICAgY3R4LnNhdmUoKTtcbiAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHRoaXMucGFyYW1zLmNvbG9yO1xuICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgY3R4Lm1vdmVUbygtaVNoaWZ0LCB0aGlzLmdldFlQb3NpdGlvbih0aGlzLnBhcmFtcy5taW4pKTtcbiAgICAgIGN0eC5saW5lVG8oLWlTaGlmdCwgdGhpcy5nZXRZUG9zaXRpb24odGhpcy5wYXJhbXMubWF4KSk7XG4gICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5pbXBvcnQgeyBlbmNvZGVNZXNzYWdlIH0gZnJvbSAnLi4vdXRpbHMvc29ja2V0LXV0aWxzJztcblxuLy8gc2VuZCBhbiBMZm8gc3RyZWFtIGZyb20gdGhlIGJyb3dzZXIgb3ZlciB0aGUgbmV0d29ya1xuLy8gdGhyb3VnaCBhIFdlYlNvY2tldCAtIHNob3VsZCBiZSBwYWlyZWQgd2l0aCBhIFNvY2tldFNvdXJjZVNlcnZlclxuLy8gQE5PVEU6IGRvZXMgaXQgbmVlZCB0byBpbXBsZW1lbnQgc29tZSBwaW5nIHByb2Nlc3MgdG8gbWFpbnRhaW4gY29ubmVjdGlvbiA/XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2NrZXRDbGllbnQgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIHBvcnQ6IDMwMzAsXG4gICAgICBhZGRyZXNzOiB3aW5kb3cubG9jYXRpb24uaG9zdG5hbWVcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuc29ja2V0ID0gbnVsbDtcbiAgICB0aGlzLmluaXRDb25uZWN0aW9uKCk7XG4gIH1cblxuICBpbml0Q29ubmVjdGlvbigpIHtcbiAgICB2YXIgc29ja2V0QWRkciA9ICd3czovLycgKyB0aGlzLnBhcmFtcy5hZGRyZXNzICsgJzonICsgdGhpcy5wYXJhbXMucG9ydDtcbiAgICB0aGlzLnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoc29ja2V0QWRkcik7XG4gICAgdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cbiAgICAvLyBjYWxsYmFjayB0byBzdGFydCB0byB3aGVuIFdlYlNvY2tldCBpcyBjb25uZWN0ZWRcbiAgICB0aGlzLnNvY2tldC5vbm9wZW4gPSAoKSA9PiB7XG4gICAgICB0aGlzLnBhcmFtcy5vbm9wZW4oKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9ICgpID0+IHtcblxuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSAoKSA9PiB7XG5cbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25lcnJvciA9IChlcnIpID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICB9O1xuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcbiAgICB2YXIgYnVmZmVyID0gZW5jb2RlTWVzc2FnZSh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuICAgIHRoaXMuc29ja2V0LnNlbmQoYnVmZmVyKTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5pbXBvcnQgKiBhcyB3cyBmcm9tICd3cyc7XG5pbXBvcnQgeyBlbmNvZGVNZXNzYWdlLCBhcnJheUJ1ZmZlclRvQnVmZmVyIH0gZnJvbSAnLi4vdXRpbHMvc29ja2V0LXV0aWxzJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2NrZXRTZXJ2ZXIgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIHBvcnQ6IDMwMzFcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICB0aGlzLmluaXRTZXJ2ZXIoKTtcbiAgfVxuXG4gIGluaXRTZXJ2ZXIoKSB7XG4gICAgdGhpcy5zZXJ2ZXIgPSBuZXcgd3MuU2VydmVyKHsgcG9ydDogdGhpcy5wYXJhbXMucG9ydCB9KTtcbiAgfVxuXG4gIHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG4gICAgdmFyIGFycmF5QnVmZmVyID0gZW5jb2RlTWVzc2FnZSh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuICAgIHZhciBidWZmZXIgPSBhcnJheUJ1ZmZlclRvQnVmZmVyKGFycmF5QnVmZmVyKTtcblxuICAgIHRoaXMuc2VydmVyLmNsaWVudHMuZm9yRWFjaChmdW5jdGlvbihjbGllbnQpIHtcbiAgICAgIGNsaWVudC5zZW5kKGJ1ZmZlcik7XG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlRHJhdyBmcm9tICcuL2Jhc2UtZHJhdyc7XG5pbXBvcnQgeyBnZXRSYW5kb21Db2xvciB9IGZyb20gJy4uL3V0aWxzL2RyYXctdXRpbHMnO1xuXG5sZXQgY291bnRlciA9IDA7XG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb25vZ3JhbSBleHRlbmRzIEJhc2VEcmF3IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIHNjYWxlOiAxXG4gICAgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBzZXQgc2NhbGUodmFsdWUpIHtcbiAgICB0aGlzLnBhcmFtcy5zY2FsZSA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IHNjYWxlKCkge1xuICAgIHJldHVybiB0aGlzLnBhcmFtcy5zY2FsZTtcbiAgfVxuXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldmlvdXNGcmFtZSwgaVNoaWZ0KSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5wYXJhbXMuaGVpZ2h0O1xuICAgIGNvbnN0IHNjYWxlID0gdGhpcy5wYXJhbXMuc2NhbGU7XG4gICAgY29uc3QgYmluUGVyUGl4ZWwgPSBmcmFtZS5sZW5ndGggLyB0aGlzLnBhcmFtcy5oZWlnaHQ7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhlaWdodDsgaSsrKSB7XG4gICAgICAvLyBpbnRlcnBvbGF0ZSBiZXR3ZWVuIHByZXYgYW5kIG5leHQgYmluc1xuICAgICAgLy8gaXMgbm90IGEgdmVyeSBnb29kIHN0cmF0ZWd5IGlmIG1vcmUgdGhhbiB0d28gYmlucyBwZXIgcGl4ZWxzXG4gICAgICAvLyBzb21lIHZhbHVlcyB3b24ndCBiZSB0YWtlbiBpbnRvIGFjY291bnRcbiAgICAgIC8vIHRoaXMgaGFjayBpcyBub3QgcmVsaWFibGVcbiAgICAgIC8vIC0+IGNvdWxkIHdlIHJlc2FtcGxlIHRoZSBmcmFtZSBpbiBmcmVxdWVuY3kgZG9tYWluID9cbiAgICAgIGNvbnN0IGZCaW4gPSBpICogYmluUGVyUGl4ZWw7XG4gICAgICBjb25zdCBwcmV2QmluSW5kZXggPSBNYXRoLmZsb29yKGZCaW4pO1xuICAgICAgY29uc3QgbmV4dEJpbkluZGV4ID0gTWF0aC5jZWlsKGZCaW4pO1xuXG4gICAgICBjb25zdCBwcmV2QmluID0gZnJhbWVbcHJldkJpbkluZGV4XTtcbiAgICAgIGNvbnN0IG5leHRCaW4gPSBmcmFtZVtuZXh0QmluSW5kZXhdO1xuXG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGZCaW4gLSBwcmV2QmluSW5kZXg7XG4gICAgICBjb25zdCBzbG9wZSA9IChuZXh0QmluIC0gcHJldkJpbik7XG4gICAgICBjb25zdCBpbnRlcmNlcHQgPSBwcmV2QmluO1xuICAgICAgY29uc3Qgd2VpZ2h0ZWRCaW4gPSBzbG9wZSAqIHBvc2l0aW9uICsgaW50ZXJjZXB0O1xuICAgICAgY29uc3Qgc3FydFdlaWdodGVkQmluID0gd2VpZ2h0ZWRCaW4gKiB3ZWlnaHRlZEJpbjtcblxuICAgICAgY29uc3QgeSA9IHRoaXMucGFyYW1zLmhlaWdodCAtIGk7XG4gICAgICBjb25zdCBjID0gTWF0aC5yb3VuZChzcXJ0V2VpZ2h0ZWRCaW4gKiBzY2FsZSAqIDI1NSk7XG5cbiAgICAgIGN0eC5maWxsU3R5bGUgPSBgcmdiYSgke2N9LCAke2N9LCAke2N9LCAxKWA7XG4gICAgICBjdHguZmlsbFJlY3QoLWlTaGlmdCwgeSwgaVNoaWZ0LCAtMSk7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgQmFzZURyYXcgZnJvbSAnLi9iYXNlLWRyYXcnO1xuaW1wb3J0IHsgZ2V0UmFuZG9tQ29sb3IgfSBmcm9tICcuLi91dGlscy9kcmF3LXV0aWxzJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTcGVjdHJvZ3JhbSBleHRlbmRzIEJhc2VEcmF3IHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIG1pbjogMCxcbiAgICAgIG1heDogMSxcbiAgICAgIHNjYWxlOiAxLFxuICAgICAgY29sb3I6IGdldFJhbmRvbUNvbG9yKCksXG4gICAgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBzZXQgc2NhbGUodmFsdWUpIHtcbiAgICB0aGlzLnBhcmFtcy5zY2FsZSA9IHZhbHVlO1xuICB9XG5cbiAgZ2V0IHNjYWxlKCkge1xuICAgIHJldHVybiB0aGlzLnBhcmFtcy5zY2FsZTtcbiAgfVxuXG4gIC8vIG5vIG5lZWQgdG8gc2Nyb2xsIG9yIGFueXRoaW5nXG4gIGV4ZWN1dGVEcmF3KHRpbWUsIGZyYW1lKSB7XG4gICAgdGhpcy5kcmF3Q3VydmUoZnJhbWUpO1xuICB9XG5cbiAgZHJhd0N1cnZlKGZyYW1lKSB7XG4gICAgY29uc3QgbmJyQmlucyA9IGZyYW1lLmxlbmd0aDtcbiAgICBjb25zdCB3aWR0aCA9IHRoaXMucGFyYW1zLndpZHRoO1xuICAgIGNvbnN0IGhlaWdodCA9IHRoaXMucGFyYW1zLmhlaWdodDtcbiAgICBjb25zdCBiaW5XaWR0aCA9IHdpZHRoIC8gbmJyQmlucztcbiAgICBjb25zdCBzY2FsZSA9IHRoaXMucGFyYW1zLnNjYWxlO1xuICAgIGNvbnN0IGN0eCA9IHRoaXMuY3R4O1xuXG4gICAgY3R4LmZpbGxTdHlsZSA9IHRoaXMucGFyYW1zLmNvbG9yO1xuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG5cbiAgICAvLyBlcnJvciBoYW5kbGluZyBuZWVkcyByZXZpZXcuLi5cbiAgICBsZXQgZXJyb3IgPSAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBuYnJCaW5zOyBpKyspIHtcbiAgICAgIGNvbnN0IHgxRmxvYXQgPSBpICogYmluV2lkdGggKyBlcnJvcjtcbiAgICAgIGNvbnN0IHgxSW50ID0gTWF0aC5yb3VuZCh4MUZsb2F0KTtcbiAgICAgIGNvbnN0IHgyRmxvYXQgPSB4MUZsb2F0ICsgKGJpbldpZHRoIC0gZXJyb3IpO1xuICAgICAgY29uc3QgeDJJbnQgPSBNYXRoLnJvdW5kKHgyRmxvYXQpO1xuXG4gICAgICBlcnJvciA9IHgySW50IC0geDJGbG9hdDtcblxuICAgICAgaWYgKHgxSW50ICE9PSB4MkludCkge1xuICAgICAgICBjb25zdCB3aWR0aCA9IHgySW50IC0geDFJbnQ7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmdldFlQb3NpdGlvbihmcmFtZVtpXSAqIHNjYWxlKTtcbiAgICAgICAgY3R4LmZpbGxSZWN0KHgxSW50LCB5LCB3aWR0aCwgaGVpZ2h0IC0geSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBlcnJvciAtPSBiaW5XaWR0aDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiIsIi8qKlxuICogaXMgdXNlZCB0byBrZWVwIHNldmVyYWwgZHJhdyBpbiBzeW5jXG4gKiB3aGVuIGEgdmlldyBpcyBpbnN0YWxsZWQgaW4gYSBzeW5jaHJvbml6ZWQgZHJhd1xuICogdGhlIG1ldGEgdmlldyBpcyBpbnN0YWxsZWQgYXMgYSBtZW1iZXIgb2YgYWxsIGl0J3MgY2hpbGRyZW5cbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3luY2hyb25pemVkRHJhdyB7XG4gIGNvbnN0cnVjdG9yKC4uLnZpZXdzKSB7XG4gICAgdGhpcy52aWV3cyA9IFtdO1xuICAgIHRoaXMuYWRkKC4uLnZpZXdzKTtcbiAgfVxuXG4gIGFkZCguLi52aWV3cykge1xuICAgIHZpZXdzLmZvckVhY2godmlldyA9PiB7IHRoaXMuaW5zdGFsbCh2aWV3KTsgfSk7XG4gIH1cblxuICBpbnN0YWxsKHZpZXcpIHtcbiAgICB0aGlzLnZpZXdzLnB1c2godmlldyk7XG4gICAgdmlldy5wYXJhbXMuaXNTeW5jaHJvbml6ZWQgPSB0cnVlO1xuICAgIHZpZXcuc3luY2hyb25pemVyID0gdGhpcztcbiAgfVxuXG4gIHNoaWZ0U2libGluZ3MoaVNoaWZ0LCB2aWV3KSB7XG4gICAgdGhpcy52aWV3cy5mb3JFYWNoKChjaGlsZCkgPT4ge1xuICAgICAgaWYgKGNoaWxkID09PSB2aWV3KSB7IHJldHVybjsgfVxuICAgICAgY2hpbGQuc2hpZnRDYW52YXMoaVNoaWZ0KTtcbiAgICB9KTtcbiAgfVxufVxuIiwiaW1wb3J0IEJhc2VEcmF3IGZyb20gJy4vYmFzZS1kcmF3JztcbmltcG9ydCB7IGdldFJhbmRvbUNvbG9yLCBnZXRIdWUsIGhleFRvUkdCIH0gZnJvbSAnLi4vdXRpbHMvZHJhdy11dGlscyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFRyYWNlIGV4dGVuZHMgQmFzZURyYXcge1xuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBjb2xvclNjaGVtZTogJ25vbmUnLCAvLyBjb2xvciwgb3BhY2l0eVxuICAgICAgY29sb3I6IGdldFJhbmRvbUNvbG9yKCksXG4gICAgfSwgb3B0aW9ucyk7XG4gIH1cblxuICBkcmF3Q3VydmUoZnJhbWUsIHByZXZGcmFtZSwgaVNoaWZ0KSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgbGV0IGNvbG9yLCBncmFkaWVudDtcblxuICAgIGNvbnN0IGhhbGZSYW5nZSA9IGZyYW1lWzFdIC8gMjtcbiAgICBjb25zdCBtZWFuID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbMF0pO1xuICAgIGNvbnN0IG1pbiA9IHRoaXMuZ2V0WVBvc2l0aW9uKGZyYW1lWzBdIC0gaGFsZlJhbmdlKTtcbiAgICBjb25zdCBtYXggPSB0aGlzLmdldFlQb3NpdGlvbihmcmFtZVswXSArIGhhbGZSYW5nZSk7XG5cbiAgICBsZXQgcHJldkhhbGZSYW5nZTtcbiAgICBsZXQgcHJldk1pbjtcbiAgICBsZXQgcHJldk1heDtcblxuICAgIGlmIChwcmV2RnJhbWUpIHtcbiAgICAgIHByZXZIYWxmUmFuZ2UgPSBwcmV2RnJhbWVbMV0gLyAyO1xuICAgICAgcHJldk1pbiA9IHRoaXMuZ2V0WVBvc2l0aW9uKHByZXZGcmFtZVswXSAtIHByZXZIYWxmUmFuZ2UpO1xuICAgICAgcHJldk1heCA9IHRoaXMuZ2V0WVBvc2l0aW9uKHByZXZGcmFtZVswXSArIHByZXZIYWxmUmFuZ2UpO1xuICAgIH1cblxuICAgIHN3aXRjaCAodGhpcy5wYXJhbXMuY29sb3JTY2hlbWUpIHtcbiAgICAgIGNhc2UgJ25vbmUnOlxuICAgICAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wYXJhbXMuY29sb3I7XG4gICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2h1ZSc6XG4gICAgICAgIGdyYWRpZW50ID0gY3R4LmNyZWF0ZUxpbmVhckdyYWRpZW50KC1pU2hpZnQsIDAsIDAsIDApO1xuXG4gICAgICAgIGlmIChwcmV2RnJhbWUpXG4gICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICdoc2woJyArIGdldEh1ZShwcmV2RnJhbWVbMl0pICsgJywgMTAwJSwgNTAlKScpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICdoc2woJyArIGdldEh1ZShmcmFtZVsyXSkgKyAnLCAxMDAlLCA1MCUpJyk7XG5cbiAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDEsICdoc2woJyArIGdldEh1ZShmcmFtZVsyXSkgKyAnLCAxMDAlLCA1MCUpJyk7XG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBncmFkaWVudDtcbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnb3BhY2l0eSc6XG4gICAgICAgIGNvbnN0IHJnYiA9IGhleFRvUkdCKHRoaXMucGFyYW1zLmNvbG9yKTtcbiAgICAgICAgZ3JhZGllbnQgPSBjdHguY3JlYXRlTGluZWFyR3JhZGllbnQoLWlTaGlmdCwgMCwgMCwgMCk7XG5cbiAgICAgICAgaWYgKHByZXZGcmFtZSlcbiAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3AoMCwgJ3JnYmEoJyArIHJnYi5qb2luKCcsJykgKyAnLCcgKyBwcmV2RnJhbWVbMl0gKyAnKScpO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgZ3JhZGllbnQuYWRkQ29sb3JTdG9wKDAsICdyZ2JhKCcgKyByZ2Iuam9pbignLCcpICsgJywnICsgZnJhbWVbMl0gKyAnKScpO1xuXG4gICAgICAgIGdyYWRpZW50LmFkZENvbG9yU3RvcCgxLCAncmdiYSgnICsgcmdiLmpvaW4oJywnKSArICcsJyArIGZyYW1lWzJdICsgJyknKTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgY3R4LnNhdmUoKTtcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4Lm1vdmVUbygwLCBtZWFuKTtcbiAgICBjdHgubGluZVRvKDAsIG1heCk7XG5cbiAgICBpZiAocHJldkZyYW1lKSB7XG4gICAgICBjdHgubGluZVRvKC1pU2hpZnQsIHByZXZNYXgpO1xuICAgICAgY3R4LmxpbmVUbygtaVNoaWZ0LCBwcmV2TWluKTtcbiAgICB9XG5cbiAgICBjdHgubGluZVRvKDAsIG1pbik7XG4gICAgY3R4LmNsb3NlUGF0aCgpO1xuXG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHgucmVzdG9yZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyYWNlO1xuIiwiaW1wb3J0IEJhc2VEcmF3IGZyb20gJy4vYmFzZS1kcmF3JztcbmltcG9ydCB7IGdldFJhbmRvbUNvbG9yIH0gZnJvbSAnLi4vdXRpbHMvZHJhdy11dGlscyc7XG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2F2ZWZvcm0gZXh0ZW5kcyBCYXNlRHJhdyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBjb2xvcjogZ2V0UmFuZG9tQ29sb3IoKSxcbiAgICB9LCBvcHRpb25zKTtcbiAgfVxuXG4gIGRyYXdDdXJ2ZShmcmFtZSwgcHJldmlvdXNGcmFtZSwgaVNoaWZ0KSB7XG4gICAgY29uc3QgY3R4ID0gdGhpcy5jdHg7XG4gICAgY29uc3QgbWluID0gdGhpcy5nZXRZUG9zaXRpb24oZnJhbWVbMF0pO1xuICAgIGNvbnN0IG1heCA9IHRoaXMuZ2V0WVBvc2l0aW9uKGZyYW1lWzFdKTtcblxuICAgIGN0eC5zYXZlKCk7XG5cbiAgICBjdHguZmlsbFN0eWxlID0gdGhpcy5wYXJhbXMuY29sb3I7XG4gICAgY3R4LmJlZ2luUGF0aCgpO1xuXG4gICAgY3R4Lm1vdmVUbygwLCB0aGlzLmdldFlQb3NpdGlvbigwKSk7XG4gICAgY3R4LmxpbmVUbygwLCBtYXgpO1xuXG4gICAgaWYgKHByZXZpb3VzRnJhbWUpIHtcbiAgICAgIGNvbnN0IHByZXZNaW4gPSB0aGlzLmdldFlQb3NpdGlvbihwcmV2aW91c0ZyYW1lWzBdKTtcbiAgICAgIGNvbnN0IHByZXZNYXggPSB0aGlzLmdldFlQb3NpdGlvbihwcmV2aW91c0ZyYW1lWzFdKTtcbiAgICAgIGN0eC5saW5lVG8oLWlTaGlmdCwgcHJldk1heCk7XG4gICAgICBjdHgubGluZVRvKC1pU2hpZnQsIHByZXZNaW4pO1xuICAgIH1cblxuICAgIGN0eC5saW5lVG8oMCwgbWluKTtcblxuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5yZXN0b3JlKCk7XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG5jb25zdCB3b3JrZXJDb2RlID0gYFxuc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gcHJvY2VzcyhlKSB7XG4gIHZhciBibG9ja1NpemUgPSBlLmRhdGEuYmxvY2tTaXplO1xuICB2YXIgYnVmZmVyU291cmNlID0gZS5kYXRhLmJ1ZmZlcjtcbiAgdmFyIGJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoYnVmZmVyU291cmNlKTtcbiAgdmFyIGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDA7XG5cbiAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgdmFyIGNvcHlTaXplID0gTWF0aC5taW4obGVuZ3RoIC0gaW5kZXgsIGJsb2NrU2l6ZSk7XG4gICAgdmFyIGJsb2NrID0gYnVmZmVyLnN1YmFycmF5KGluZGV4LCBpbmRleCArIGNvcHlTaXplKTtcbiAgICB2YXIgc2VuZEJsb2NrID0gbmV3IEZsb2F0MzJBcnJheShibG9jayk7XG5cbiAgICBwb3N0TWVzc2FnZSh7XG4gICAgICBjb21tYW5kOiAncHJvY2VzcycsXG4gICAgICBpbmRleDogaW5kZXgsXG4gICAgICBidWZmZXI6IHNlbmRCbG9jay5idWZmZXIsXG4gICAgfSwgW3NlbmRCbG9jay5idWZmZXJdKTtcblxuICAgIGluZGV4ICs9IGNvcHlTaXplO1xuICB9XG5cbiAgcG9zdE1lc3NhZ2Uoe1xuICAgIGNvbW1hbmQ6ICdmaW5hbGl6ZScsXG4gICAgaW5kZXg6IGluZGV4LFxuICAgIGJ1ZmZlcjogYnVmZmVyU291cmNlLFxuICB9LCBbYnVmZmVyU291cmNlXSk7XG59LCBmYWxzZSlgO1xuXG5cbmNsYXNzIF9Qc2V1ZG9Xb3JrZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jYWxsYmFjayA9IG51bGw7XG4gIH1cblxuICBwb3N0TWVzc2FnZShlKSB7XG4gICAgY29uc3QgYmxvY2tTaXplID0gZS5ibG9ja1NpemU7XG4gICAgY29uc3QgYnVmZmVyU291cmNlID0gZS5idWZmZXI7XG4gICAgY29uc3QgYnVmZmVyID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXJTb3VyY2UpO1xuICAgIGNvbnN0IGxlbmd0aCA9IGJ1ZmZlci5sZW5ndGg7XG4gICAgY29uc3QgdGhhdCA9IHRoaXM7XG4gICAgbGV0IGluZGV4ID0gMDtcblxuICAgIChmdW5jdGlvbiBzbGljZSgpIHtcbiAgICAgIGlmIChpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICB2YXIgY29weVNpemUgPSBNYXRoLm1pbihsZW5ndGggLSBpbmRleCwgYmxvY2tTaXplKTtcbiAgICAgICAgdmFyIGJsb2NrID0gYnVmZmVyLnN1YmFycmF5KGluZGV4LCBpbmRleCArIGNvcHlTaXplKTtcbiAgICAgICAgdmFyIHNlbmRCbG9jayA9IG5ldyBGbG9hdDMyQXJyYXkoYmxvY2spO1xuXG4gICAgICAgIHRoYXQuX3NlbmQoe1xuICAgICAgICAgIGNvbW1hbmQ6ICdwcm9jZXNzJyxcbiAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgYnVmZmVyOiBzZW5kQmxvY2suYnVmZmVyLFxuICAgICAgICB9KTtcblxuICAgICAgICBpbmRleCArPSBjb3B5U2l6ZTtcbiAgICAgICAgc2V0VGltZW91dChzbGljZSwgMCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGF0Ll9zZW5kKHtcbiAgICAgICAgICBjb21tYW5kOiAnZmluYWxpemUnLFxuICAgICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgICBidWZmZXI6IGJ1ZmZlcixcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSgpKTtcbiAgfVxuXG4gIGFkZExpc3RlbmVyKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5fY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgfVxuXG4gIF9zZW5kKG1zZykge1xuICAgIHRoaXMuX2NhbGxiYWNrKHsgZGF0YTogbXNnIH0pO1xuICB9XG59XG5cbi8qKlxuICogQXVkaW9CdWZmZXIgYXMgc291cmNlLCBzbGljZWQgaXQgaW4gYmxvY2tzIHRocm91Z2ggYSB3b3JrZXJcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXVkaW9JbkJ1ZmZlciBleHRlbmRzIEJhc2VMZm8ge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcih7XG4gICAgICBmcmFtZVNpemU6IDUxMixcbiAgICAgIGNoYW5uZWw6IDAsXG4gICAgICBjdHg6IG51bGwsXG4gICAgICBidWZmZXI6IG51bGwsXG4gICAgICB1c2VXb3JrZXI6IHRydWUsXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLmJ1ZmZlciA9IHRoaXMucGFyYW1zLmJ1ZmZlcjtcbiAgICB0aGlzLmVuZFRpbWUgPSAwO1xuXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jdHggfHwgISh0aGlzLnBhcmFtcy5jdHggaW5zdGFuY2VvZiBBdWRpb0NvbnRleHQpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIGF1ZGlvIGNvbnRleHQgcGFyYW1ldGVyIChjdHgpJyk7XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLmJ1ZmZlciB8fCAhKHRoaXMucGFyYW1zLmJ1ZmZlciBpbnN0YW5jZW9mIEF1ZGlvQnVmZmVyKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBhdWRpbyBidWZmZXIgcGFyYW1ldGVyIChidWZmZXIpJyk7XG5cbiAgICB0aGlzLmJsb2IgPSBuZXcgQmxvYihbd29ya2VyQ29kZV0sIHsgdHlwZTogXCJ0ZXh0L2phdmFzY3JpcHRcIiB9KTtcbiAgICB0aGlzLndvcmtlciA9IG51bGw7XG5cbiAgICB0aGlzLnByb2Nlc3MgPSB0aGlzLnByb2Nlc3MuYmluZCh0aGlzKTtcbiAgfVxuXG4gIHNldHVwU3RyZWFtKCkge1xuICAgIHRoaXMub3V0RnJhbWUgPSBudWxsO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKHtcbiAgICAgIGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuZnJhbWVTaXplLFxuICAgICAgZnJhbWVSYXRlOiB0aGlzLmJ1ZmZlci5zYW1wbGVSYXRlIC8gdGhpcy5wYXJhbXMuZnJhbWVTaXplLFxuICAgICAgc291cmNlU2FtcGxlUmF0ZTogdGhpcy5idWZmZXIuc2FtcGxlUmF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcblxuICAgIGlmICh0aGlzLnBhcmFtcy51c2VXb3JrZXIpIHtcbiAgICAgIHRoaXMud29ya2VyID0gbmV3IFdvcmtlcih3aW5kb3cuVVJMLmNyZWF0ZU9iamVjdFVSTCh0aGlzLmJsb2IpKTtcbiAgICAgIHRoaXMud29ya2VyLmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCB0aGlzLnByb2Nlc3MsIGZhbHNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy53b3JrZXIgPSBuZXcgX1BzZXVkb1dvcmtlcigpO1xuICAgICAgdGhpcy53b3JrZXIuYWRkTGlzdGVuZXIodGhpcy5wcm9jZXNzKTtcbiAgICB9XG5cbiAgICB0aGlzLmVuZFRpbWUgPSAwO1xuXG4gICAgY29uc3QgYnVmZmVyID0gdGhpcy5idWZmZXIuZ2V0Q2hhbm5lbERhdGEodGhpcy5wYXJhbXMuY2hhbm5lbCkuYnVmZmVyO1xuICAgIGxldCBzZW5kQnVmZmVyID0gYnVmZmVyO1xuXG4gICAgaWYgKHRoaXMucGFyYW1zLnVzZVdvcmtlcilcbiAgICAgIHNlbmRCdWZmZXIgPSBidWZmZXIuc2xpY2UoMCk7XG5cbiAgICB0aGlzLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICBibG9ja1NpemU6IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSxcbiAgICAgIGJ1ZmZlcjogc2VuZEJ1ZmZlcixcbiAgICB9LCBbc2VuZEJ1ZmZlcl0pO1xuICB9XG5cbiAgc3RvcCgpIHtcbiAgICB0aGlzLndvcmtlci50ZXJtaW5hdGUoKTtcbiAgICB0aGlzLndvcmtlciA9IG51bGw7XG5cbiAgICB0aGlzLmZpbmFsaXplKHRoaXMuZW5kVGltZSk7XG4gIH1cblxuICAvLyB3b3JrZXIgY2FsbGJhY2tcbiAgcHJvY2VzcyhlKSB7XG4gICAgY29uc3Qgc291cmNlU2FtcGxlUmF0ZSA9IHRoaXMuc3RyZWFtUGFyYW1zLnNvdXJjZVNhbXBsZVJhdGU7XG4gICAgY29uc3QgY29tbWFuZCA9IGUuZGF0YS5jb21tYW5kO1xuICAgIGNvbnN0IGluZGV4ID0gZS5kYXRhLmluZGV4O1xuICAgIGNvbnN0IGJ1ZmZlciA9IGUuZGF0YS5idWZmZXI7XG4gICAgY29uc3QgdGltZSA9IGluZGV4IC8gc291cmNlU2FtcGxlUmF0ZTtcblxuICAgIGlmIChjb21tYW5kID09PSAnZmluYWxpemUnKSB7XG4gICAgICB0aGlzLmZpbmFsaXplKHRpbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLm91dEZyYW1lID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIpO1xuICAgICAgdGhpcy50aW1lID0gdGltZTtcbiAgICAgIHRoaXMub3V0cHV0KCk7XG5cbiAgICAgIHRoaXMuZW5kVGltZSA9IHRoaXMudGltZSArIHRoaXMub3V0RnJhbWUubGVuZ3RoIC8gc291cmNlU2FtcGxlUmF0ZTtcbiAgICB9XG4gIH1cbn1cbiIsImltcG9ydCBCYXNlTGZvIGZyb20gJy4uL2NvcmUvYmFzZS1sZm8nO1xuXG4vKipcbiAqICBVc2UgYSBXZWJBdWRpbyBub2RlIGFzIGEgc291cmNlXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEF1ZGlvSW5Ob2RlIGV4dGVuZHMgQmFzZUxmbyB7XG5cbiAgY29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoe1xuICAgICAgZnJhbWVTaXplOiA1MTIsXG4gICAgICBjaGFubmVsOiAwLFxuICAgICAgY3R4OiBudWxsLFxuICAgICAgc3JjOiBudWxsLFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jdHggfHwgISh0aGlzLnBhcmFtcy5jdHggaW5zdGFuY2VvZiBBdWRpb0NvbnRleHQpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01pc3NpbmcgYXVkaW8gY29udGV4dCBwYXJhbWV0ZXIgKGN0eCknKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMucGFyYW1zLnNyYyB8fCAhKHRoaXMucGFyYW1zLnNyYyBpbnN0YW5jZW9mIEF1ZGlvTm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWlzc2luZyBhdWRpbyBzb3VyY2Ugbm9kZSBwYXJhbWV0ZXIgKHNyYyknKTtcbiAgICB9XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIGNvbnN0IGN0eCA9IHRoaXMucGFyYW1zLmN0eDtcblxuICAgIHN1cGVyLmluaXRpYWxpemUoe1xuICAgICAgZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5mcmFtZVNpemUsXG4gICAgICBmcmFtZVJhdGU6IGN0eC5zYW1wbGVSYXRlIC8gdGhpcy5wYXJhbXMuZnJhbWVTaXplLFxuICAgICAgc291cmNlU2FtcGxlUmF0ZTogY3R4LnNhbXBsZVJhdGUsXG4gICAgfSk7XG5cbiAgICB2YXIgYmxvY2tTaXplID0gdGhpcy5zdHJlYW1QYXJhbXMuZnJhbWVTaXplO1xuICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yID0gY3R4LmNyZWF0ZVNjcmlwdFByb2Nlc3NvcihibG9ja1NpemUsIDEsIDEpO1xuXG4gICAgLy8gcHJlcGFyZSBhdWRpbyBncmFwaFxuICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yLm9uYXVkaW9wcm9jZXNzID0gdGhpcy5wcm9jZXNzLmJpbmQodGhpcyk7XG4gICAgdGhpcy5wYXJhbXMuc3JjLmNvbm5lY3QodGhpcy5zY3JpcHRQcm9jZXNzb3IpO1xuICB9XG5cbiAgLy8gY29ubmVjdCB0aGUgYXVkaW8gbm9kZXMgdG8gc3RhcnQgc3RyZWFtaW5nXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yLmNvbm5lY3QodGhpcy5wYXJhbXMuY3R4LmRlc3RpbmF0aW9uKTtcbiAgfVxuXG4gIHN0b3AoKSB7XG4gICAgdGhpcy5maW5hbGl6ZSh0aGlzLnRpbWUpO1xuICAgIHRoaXMuc2NyaXB0UHJvY2Vzc29yLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIC8vIGlzIGJhc2ljYWxseSB0aGUgYHNjcmlwdFByb2Nlc3Nvci5vbmF1ZGlvcHJvY2Vzc2AgY2FsbGJhY2tcbiAgcHJvY2VzcyhlKSB7XG4gICAgY29uc3QgYmxvY2sgPSBlLmlucHV0QnVmZmVyLmdldENoYW5uZWxEYXRhKHRoaXMucGFyYW1zLmNoYW5uZWwpO1xuXG4gICAgaWYgKCF0aGlzLmJsb2NrRHVyYXRpb24pXG4gICAgICB0aGlzLmJsb2NrRHVyYXRpb24gPSBibG9jay5sZW5ndGggLyB0aGlzLnN0cmVhbVBhcmFtcy5zb3VyY2VTYW1wbGVSYXRlO1xuXG4gICAgdGhpcy5vdXRGcmFtZSA9IGJsb2NrO1xuICAgIHRoaXMub3V0cHV0KCk7XG5cbiAgICB0aGlzLnRpbWUgKz0gdGhpcy5ibG9ja0R1cmF0aW9uO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudEluIGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBhYnNvbHV0ZVRpbWU6IGZhbHNlLFxuICAgIH0sIG9wdGlvbnMpO1xuXG4gICAgLy8gdGVzdCBBdWRpb0NvbnRleHQgZm9yIHVzZSBpbiBub2RlIGVudmlyb25tZW50XG4gICAgaWYgKCF0aGlzLnBhcmFtcy5jdHggJiYgKHR5cGVvZiBwcm9jZXNzID09PSAndW5kZWZpbmVkJykpIHtcbiAgICAgIHRoaXMucGFyYW1zLmN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9pc1N0YXJ0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemUoe1xuICAgICAgZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5mcmFtZVNpemUsXG4gICAgICBmcmFtZVJhdGU6IHRoaXMucGFyYW1zLmZyYW1lUmF0ZSxcbiAgICAgIHNvdXJjZVNhbXBsZVJhdGU6IHRoaXMucGFyYW1zLmZyYW1lUmF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuaW5pdGlhbGl6ZSgpO1xuICAgIHRoaXMucmVzZXQoKTtcblxuICAgIGNvbnN0IGN1cnJlbnRUaW1lID0gdGhpcy5wYXJhbXMuY3R4LmN1cnJlbnRUaW1lO1xuXG4gICAgLy8gc2hvdWxkIGJlIHNldHRlZCBpbiB0aGUgZmlyc3QgcHJvY2VzcyBjYWxsXG4gICAgdGhpcy5faXNTdGFydGVkID0gdHJ1ZTtcbiAgICB0aGlzLl9zdGFydFRpbWUgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5fbGFzdFRpbWUgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBzdG9wKCkge1xuICAgIGlmICh0aGlzLl9pc1N0YXJ0ZWQgJiYgdGhpcy5fc3RhcnRUaW1lKSB7XG4gICAgICBjb25zdCBjdXJyZW50VGltZSA9IHRoaXMucGFyYW1zLmN0eC5jdXJyZW50VGltZTtcbiAgICAgIGNvbnN0IGVuZFRpbWUgPSB0aGlzLnRpbWUgKyAoY3VycmVudFRpbWUgLSB0aGlzLl9sYXN0VGltZSk7XG5cbiAgICAgIHRoaXMuZmluYWxpemUoZW5kVGltZSk7XG4gICAgfVxuICB9XG5cbiAgcHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEgPSB7fSkge1xuICAgIGlmICghdGhpcy5faXNTdGFydGVkKSByZXR1cm47XG5cbiAgICBjb25zdCBjdXJyZW50VGltZSA9IHRoaXMucGFyYW1zLmN0eC5jdXJyZW50VGltZTtcbiAgICAvLyBpZiBubyB0aW1lIHByb3ZpZGVkLCB1c2UgYXVkaW9Db250ZXh0LmN1cnJlbnRUaW1lXG4gICAgdGltZSA9ICFpc05hTihwYXJzZUZsb2F0KHRpbWUpKSAmJiBpc0Zpbml0ZSh0aW1lKSA/XG4gICAgICB0aW1lIDogY3VycmVudFRpbWU7XG5cbiAgICAvLyBzZXQgYHN0YXJ0VGltZWAgaWYgZmlyc3QgY2FsbCBhZnRlciBhIGBzdGFydGBcbiAgICBpZiAoIXRoaXMuX3N0YXJ0VGltZSlcbiAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IHRpbWU7XG5cbiAgICAvLyBoYW5kbGUgdGltZSBhY2NvcmRpbmcgdG8gY29uZmlnXG4gICAgaWYgKHRoaXMucGFyYW1zLmFic29sdXRlVGltZSA9PT0gZmFsc2UpXG4gICAgICB0aW1lID0gdGltZSAtIHRoaXMuX3N0YXJ0VGltZTtcblxuICAgIC8vIGlmIHNjYWxhciwgY3JlYXRlIGEgdmVjdG9yXG4gICAgaWYgKGZyYW1lLmxlbmd0aCA9PT0gdW5kZWZpbmVkKVxuICAgICAgZnJhbWUgPSBbZnJhbWVdO1xuXG4gICAgLy8gd29ya3MgaWYgZnJhbWUgaXMgYW4gYXJyYXlcbiAgICB0aGlzLm91dEZyYW1lLnNldChmcmFtZSwgMCk7XG4gICAgdGhpcy50aW1lID0gdGltZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWV0YURhdGE7XG4gICAgdGhpcy5fbGFzdFRpbWUgPSBjdXJyZW50VGltZTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEluO1xuIiwiaW1wb3J0IEF1ZGlvSW5CdWZmZXIgZnJvbSAnLi9hdWRpby1pbi1idWZmZXInO1xuaW1wb3J0IEF1ZGlvSW5Ob2RlIGZyb20gJy4vYXVkaW8taW4tbm9kZSc7XG5pbXBvcnQgRXZlbnRJbiBmcm9tICcuL2V2ZW50LWluJztcbmltcG9ydCBTb2NrZXRDbGllbnQgZnJvbSAnLi9zb2NrZXQtY2xpZW50JztcbmltcG9ydCBTb2NrZXRTZXJ2ZXIgZnJvbSAnLi9zb2NrZXQtc2VydmVyJztcblxuZXhwb3J0IGRlZmF1bHQge1xuICBBdWRpb0luQnVmZmVyLFxuICBBdWRpb0luTm9kZSxcbiAgRXZlbnRJbixcbiAgU29ja2V0Q2xpZW50LFxuICBTb2NrZXRTZXJ2ZXIsXG59O1xuIiwiaW1wb3J0IEJhc2VMZm8gZnJvbSAnLi4vY29yZS9iYXNlLWxmbyc7XG5pbXBvcnQgeyBkZWNvZGVNZXNzYWdlIH0gZnJvbSAnLi4vdXRpbHMvc29ja2V0LXV0aWxzJztcblxuXG4vLyBAVE9ETzogaGFuZGxlIGBzdGFydGAgYW5kIGBzdG9wYFxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU29ja2V0Q2xpZW50IGV4dGVuZHMgQmFzZUxmbyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICBzdXBlcih7XG4gICAgICBwb3J0OiAzMDMxLFxuICAgICAgYWRkcmVzczogd2luZG93LmxvY2F0aW9uLmhvc3RuYW1lXG4gICAgfSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLnNvY2tldCA9IG51bGw7XG4gICAgdGhpcy5pbml0Q29ubmVjdGlvbigpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG4gICAgdGhpcy5pbml0aWFsaXplKCk7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplKHVuZGVmaW5lZCwge1xuICAgICAgZnJhbWVTaXplOiB0aGlzLnBhcmFtcy5mcmFtZVNpemUsXG4gICAgICBmcmFtZVJhdGU6IHRoaXMucGFyYW1zLmZyYW1lUmF0ZSxcbiAgICB9KTtcbiAgfVxuXG4gIGluaXRDb25uZWN0aW9uKCkge1xuICAgIHZhciBzb2NrZXRBZGRyID0gJ3dzOi8vJyArIHRoaXMucGFyYW1zLmFkZHJlc3MgKyAnOicgKyB0aGlzLnBhcmFtcy5wb3J0O1xuICAgIHRoaXMuc29ja2V0ID0gbmV3IFdlYlNvY2tldChzb2NrZXRBZGRyKTtcbiAgICB0aGlzLnNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJztcblxuICAgIC8vIGNhbGxiYWNrIHRvIHN0YXJ0IHRvIHdoZW4gV2ViU29ja2V0IGlzIGNvbm5lY3RlZFxuICAgIHRoaXMuc29ja2V0Lm9ub3BlbiA9ICgpID0+IHtcbiAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zb2NrZXQub25jbG9zZSA9ICgpID0+IHtcblxuICAgIH07XG5cbiAgICB0aGlzLnNvY2tldC5vbm1lc3NhZ2UgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgdGhpcy5wcm9jZXNzKG1lc3NhZ2UuZGF0YSk7XG4gICAgfTtcblxuICAgIHRoaXMuc29ja2V0Lm9uZXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgfTtcbiAgfVxuXG4gIHByb2Nlc3MoYnVmZmVyKSB7XG4gICAgdmFyIG1lc3NhZ2UgPSBkZWNvZGVNZXNzYWdlKGJ1ZmZlcik7XG5cbiAgICB0aGlzLnRpbWUgPSBtZXNzYWdlLnRpbWU7XG4gICAgdGhpcy5vdXRGcmFtZSA9IG1lc3NhZ2UuZnJhbWU7XG4gICAgdGhpcy5tZXRhRGF0YSA9IG1lc3NhZ2UubWV0YURhdGE7XG5cbiAgICB0aGlzLm91dHB1dCgpO1xuICB9XG59XG4iLCJpbXBvcnQgQmFzZUxmbyBmcm9tICcuLi9jb3JlL2Jhc2UtbGZvJztcbmltcG9ydCAqIGFzIHdzIGZyb20gJ3dzJztcbmltcG9ydCB7IGJ1ZmZlclRvQXJyYXlCdWZmZXIsIGRlY29kZU1lc3NhZ2UgfSBmcm9tICcuLi91dGlscy9zb2NrZXQtdXRpbHMnO1xuXG5cbi8vIEBUT0RPOiBoYW5kbGUgYHN0YXJ0YCBhbmQgYHN0b3BgXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTb2NrZXRTZXJ2ZXIgZXh0ZW5kcyBCYXNlTGZvIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHN1cGVyKHtcbiAgICAgIHBvcnQ6IDMwMzBcbiAgICB9LCBvcHRpb25zKTtcblxuICAgIC8vIEBUT0RPIGhhbmRsZSBkaXNjb25uZWN0IGFuZCBzbyBvbi4uLlxuICAgIHRoaXMuY2xpZW50cyA9IFtdO1xuICAgIHRoaXMuc2VydmVyID0gbnVsbDtcbiAgICB0aGlzLmluaXRTZXJ2ZXIoKTtcblxuICAgIC8vIEBGSVhNRSAtIHJpZ2h0IHBsYWNlID9cbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICBzdGFydCgpIHtcbiAgICB0aGlzLmluaXRpYWxpemUoKTtcbiAgICB0aGlzLnJlc2V0KCk7XG4gIH1cblxuICBpbml0U2VydmVyKCkge1xuICAgIHRoaXMuc2VydmVyID0gbmV3IHdzLlNlcnZlcih7IHBvcnQ6IHRoaXMucGFyYW1zLnBvcnQgfSk7XG5cbiAgICB0aGlzLnNlcnZlci5vbignY29ubmVjdGlvbicsIHNvY2tldCA9PiB7XG4gICAgICAvLyB0aGlzLmNsaWVudHMucHVzaChzb2NrZXQpO1xuICAgICAgc29ja2V0Lm9uKCdtZXNzYWdlJywgdGhpcy5wcm9jZXNzLmJpbmQodGhpcykpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJvY2VzcyhidWZmZXIpIHtcbiAgICB2YXIgYXJyYXlCdWZmZXIgPSBidWZmZXJUb0FycmF5QnVmZmVyKGJ1ZmZlcik7XG4gICAgdmFyIG1lc3NhZ2UgPSBkZWNvZGVNZXNzYWdlKGFycmF5QnVmZmVyKTtcblxuICAgIHRoaXMudGltZSA9IG1lc3NhZ2UudGltZTtcbiAgICB0aGlzLm91dEZyYW1lID0gbWVzc2FnZS5mcmFtZTtcbiAgICB0aGlzLm1ldGFEYXRhID0gbWVzc2FnZS5tZXRhRGF0YTtcblxuICAgIHRoaXMub3V0cHV0KCk7XG4gIH1cbn1cbiIsIi8vIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvMTQ4NDUwNi9yYW5kb20tY29sb3ItZ2VuZXJhdG9yLWluLWphdmFzY3JpcHRcbmV4cG9ydCBjb25zdCBnZXRSYW5kb21Db2xvciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJy5zcGxpdCgnJyk7XG4gIHZhciBjb2xvciA9ICcjJztcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKysgKSB7XG4gICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNildO1xuICB9XG4gIHJldHVybiBjb2xvcjtcbn07XG5cbi8vIHNjYWxlIGZyb20gZG9tYWluIFswLCAxXSB0byByYW5nZSBbMjcwLCAwXSB0byBjb25zdW1lIGluXG4vLyBoc2woeCwgMTAwJSwgNTAlKSBjb2xvciBzY2hlbWVcbmV4cG9ydCBjb25zdCBnZXRIdWUgPSBmdW5jdGlvbih4KSB7XG4gIHZhciBkb21haW5NaW4gPSAwO1xuICB2YXIgZG9tYWluTWF4ID0gMTtcbiAgdmFyIHJhbmdlTWluID0gMjcwO1xuICB2YXIgcmFuZ2VNYXggPSAwO1xuXG4gIHJldHVybiAoKChyYW5nZU1heCAtIHJhbmdlTWluKSAqICh4IC0gZG9tYWluTWluKSkgLyAoZG9tYWluTWF4IC0gZG9tYWluTWluKSkgKyByYW5nZU1pbjtcbn07XG5cbmV4cG9ydCBjb25zdCBoZXhUb1JHQiA9IGZ1bmN0aW9uKGhleCkge1xuICBoZXggPSBoZXguc3Vic3RyaW5nKDEsIDcpO1xuICB2YXIgciA9IHBhcnNlSW50KGhleC5zdWJzdHJpbmcoMCwgMiksIDE2KTtcbiAgdmFyIGcgPSBwYXJzZUludChoZXguc3Vic3RyaW5nKDIsIDQpLCAxNik7XG4gIHZhciBiID0gcGFyc2VJbnQoaGV4LnN1YnN0cmluZyg0LCA2KSwgMTYpO1xuICByZXR1cm4gW3IsIGcsIGJdO1xufTtcbiIsIlxuLy8gc2hvcnRjdXRzIC8gaGVscGVyc1xuY29uc3QgUEkgICA9IE1hdGguUEk7XG5jb25zdCBjb3MgID0gTWF0aC5jb3M7XG5jb25zdCBzaW4gID0gTWF0aC5zaW47XG5jb25zdCBzcXJ0ID0gTWF0aC5zcXJ0O1xuXG4vLyB3aW5kb3cgY3JlYXRpb24gZnVuY3Rpb25zXG5mdW5jdGlvbiBpbml0SGFubldpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcykge1xuICBsZXQgbGluU3VtID0gMDtcbiAgbGV0IHBvd1N1bSA9IDA7XG4gIGNvbnN0IHN0ZXAgPSAyICogUEkgLyBzaXplO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgY29uc3QgcGhpID0gaSAqIHN0ZXA7XG4gICAgY29uc3QgdmFsdWUgPSAwLjUgLSAwLjUgKiBjb3MocGhpKTtcblxuICAgIGJ1ZmZlcltpXSA9IHZhbHVlO1xuXG4gICAgbGluU3VtICs9IHZhbHVlO1xuICAgIHBvd1N1bSArPSB2YWx1ZSAqIHZhbHVlO1xuICB9XG5cbiAgbm9ybUNvZWZzLmxpbmVhciA9IHNpemUgLyBsaW5TdW07XG4gIG5vcm1Db2Vmcy5wb3dlciA9IHNxcnQoc2l6ZSAvIHBvd1N1bSk7XG59XG5cbmZ1bmN0aW9uIGluaXRIYW1taW5nV2luZG93KGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKSB7XG4gIGxldCBsaW5TdW0gPSAwO1xuICBsZXQgcG93U3VtID0gMDtcbiAgY29uc3Qgc3RlcCA9IDIgKiBQSSAvIHNpemU7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBjb25zdCBwaGkgPSBpICogc3RlcDtcbiAgICBjb25zdCB2YWx1ZSA9IDAuNTQgLSAwLjQ2ICogY29zKHBoaSk7XG5cbiAgICBidWZmZXJbaV0gPSB2YWx1ZTtcblxuICAgIGxpblN1bSArPSB2YWx1ZTtcbiAgICBwb3dTdW0gKz0gdmFsdWUgKiB2YWx1ZTtcbiAgfVxuXG4gIG5vcm1Db2Vmcy5saW5lYXIgPSBzaXplIC8gbGluU3VtO1xuICBub3JtQ29lZnMucG93ZXIgPSBzcXJ0KHNpemUgLyBwb3dTdW0pO1xufVxuXG5mdW5jdGlvbiBpbml0QmxhY2ttYW5XaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgbGV0IGxpblN1bSA9IDA7XG4gIGxldCBwb3dTdW0gPSAwO1xuICBjb25zdCBzdGVwID0gMiAqIFBJIC8gc2l6ZTtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgIGNvbnN0IHBoaSA9IGkgKiBzdGVwO1xuICAgIGNvbnN0IHZhbHVlID0gMC40MiAtIDAuNSAqIGNvcyhwaGkpICsgMC4wOCAqIGNvcygyICogcGhpKTtcblxuICAgIGJ1ZmZlcltpXSA9IHZhbHVlO1xuXG4gICAgbGluU3VtICs9IHZhbHVlO1xuICAgIHBvd1N1bSArPSB2YWx1ZSAqIHZhbHVlO1xuICB9XG5cbiAgbm9ybUNvZWZzLmxpbmVhciA9IHNpemUgLyBsaW5TdW07XG4gIG5vcm1Db2Vmcy5wb3dlciA9IHNxcnQoc2l6ZSAvIHBvd1N1bSk7XG59XG5cbmZ1bmN0aW9uIGluaXRCbGFja21hbkhhcnJpc1dpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcykge1xuICBsZXQgbGluU3VtID0gMDtcbiAgbGV0IHBvd1N1bSA9IDA7XG4gIGNvbnN0IGEwID0gMC4zNTg3NTtcbiAgY29uc3QgYTEgPSAwLjQ4ODI5O1xuICBjb25zdCBhMiA9IDAuMTQxMjg7XG4gIGNvbnN0IGEzID0gMC4wMTE2ODtcbiAgY29uc3Qgc3RlcCA9IDIgKiBQSSAvIHNpemU7XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICBjb25zdCBwaGkgPSBpICogc3RlcDtcbiAgICBjb25zdCB2YWx1ZSA9IGEwIC0gYTEgKiBjb3MocGhpKSArIGEyICogY29zKDIgKiBwaGkpOyAtIGEzICogY29zKDMgKiBwaGkpO1xuXG4gICAgYnVmZmVyW2ldID0gdmFsdWU7XG5cbiAgICBsaW5TdW0gKz0gdmFsdWU7XG4gICAgcG93U3VtICs9IHZhbHVlICogdmFsdWU7XG4gIH1cblxuICBub3JtQ29lZnMubGluZWFyID0gc2l6ZSAvIGxpblN1bTtcbiAgbm9ybUNvZWZzLnBvd2VyID0gc3FydChzaXplIC8gcG93U3VtKTtcbn1cblxuZnVuY3Rpb24gaW5pdFNpbmVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgbGV0IGxpblN1bSA9IDA7XG4gIGxldCBwb3dTdW0gPSAwO1xuICBjb25zdCBzdGVwID0gUEkgLyBzaXplO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgY29uc3QgcGhpID0gaSAqIHN0ZXA7XG4gICAgY29uc3QgdmFsdWUgPSBzaW4ocGhpKTtcblxuICAgIGJ1ZmZlcltpXSA9IHZhbHVlO1xuXG4gICAgbGluU3VtICs9IHZhbHVlO1xuICAgIHBvd1N1bSArPSB2YWx1ZSAqIHZhbHVlO1xuICB9XG5cbiAgbm9ybUNvZWZzLmxpbmVhciA9IHNpemUgLyBsaW5TdW07XG4gIG5vcm1Db2Vmcy5wb3dlciA9IHNxcnQoc2l6ZSAvIHBvd1N1bSk7XG59XG5cbmZ1bmN0aW9uIGluaXRSZWN0YW5nbGVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpIHtcbiAgLy8gQFRPRE8gbm9ybUNvZWZzXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XG4gICAgYnVmZmVyW2ldID0gMTtcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24oKSB7XG4gIC8vIEBOT1RFIGltcGxlbWVudCBzb21lIGNhY2hpbmcgc3lzdGVtIChpcyB0aGlzIHJlYWxseSB1c2VmdWxsID8pXG4gIGNvbnN0IGNhY2hlID0ge307XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG5hbWUsIGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKSB7XG4gICAgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKTtcblxuICAgIHN3aXRjaCAobmFtZSkge1xuICAgICAgY2FzZSAnaGFubic6XG4gICAgICBjYXNlICdoYW5uaW5nJzpcbiAgICAgICAgaW5pdEhhbm5XaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2hhbW1pbmcnOlxuICAgICAgICBpbml0SGFtbWluZ1dpbmRvdyhidWZmZXIsIHNpemUsIG5vcm1Db2Vmcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYmxhY2ttYW4nOlxuICAgICAgICBpbml0QmxhY2ttYW5XaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2JsYWNrbWFuaGFycmlzJzpcbiAgICAgICAgaW5pdEJsYWNrbWFuSGFycmlzV2luZG93KGJ1ZmZlciwgc2l6ZSwgbm9ybUNvZWZzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdzaW5lJzpcbiAgICAgICAgaW5pdFNpbmVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3JlY3RhbmdsZSc6XG4gICAgICAgIGluaXRSZWN0YW5nbGVXaW5kb3coYnVmZmVyLCBzaXplLCBub3JtQ29lZnMpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbn0oKSk7IiwiXG4vLyBodHRwOi8vdXBkYXRlcy5odG1sNXJvY2tzLmNvbS8yMDEyLzA2L0hvdy10by1jb252ZXJ0LUFycmF5QnVmZmVyLXRvLWFuZC1mcm9tLVN0cmluZ1xuZnVuY3Rpb24gVWludDE2QXJyYXkyc3RyKGJ1Zikge1xuICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLCBidWYpO1xufVxuXG5mdW5jdGlvbiBzdHIyVWludDE2QXJyYXkoc3RyKSB7XG4gIHZhciBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc3RyLmxlbmd0aCAqIDIpOyAvLyAyIGJ5dGVzIGZvciBlYWNoIGNoYXJcbiAgdmFyIGJ1ZmZlclZpZXcgPSBuZXcgVWludDE2QXJyYXkoYnVmZmVyKTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHN0ci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBidWZmZXJWaWV3W2ldID0gc3RyLmNoYXJDb2RlQXQoaSk7XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclZpZXc7XG59XG5cbi8vaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy84NjA5Mjg5L2NvbnZlcnQtYS1iaW5hcnktbm9kZWpzLWJ1ZmZlci10by1qYXZhc2NyaXB0LWFycmF5YnVmZmVyXG4vLyBjb252ZXJ0cyBhIG5vZGVqcyBCdWZmZXIgdG8gQXJyYXlCdWZmZXJcbmV4cG9ydCBmdW5jdGlvbiBidWZmZXJUb0FycmF5QnVmZmVyKGJ1ZmZlcikge1xuICB2YXIgYWIgPSBuZXcgQXJyYXlCdWZmZXIoYnVmZmVyLmxlbmd0aCk7XG4gIHZhciB2aWV3ID0gbmV3IFVpbnQ4QXJyYXkoYWIpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1ZmZlci5sZW5ndGg7ICsraSkge1xuICAgIHZpZXdbaV0gPSBidWZmZXJbaV07XG4gIH1cbiAgcmV0dXJuIGFiO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJyYXlCdWZmZXJUb0J1ZmZlcihhcnJheUJ1ZmZlcikge1xuICB2YXIgYnVmZmVyID0gbmV3IEJ1ZmZlcihhcnJheUJ1ZmZlci5ieXRlTGVuZ3RoKTtcbiAgdmFyIHZpZXcgPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlcik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmZmVyLmxlbmd0aDsgKytpKSB7XG4gICAgYnVmZmVyW2ldID0gdmlld1tpXTtcbiAgfVxuICByZXR1cm4gYnVmZmVyO1xufVxuXG4vLyBAVE9ETyBgZW5jb2RlTWVzc2FnZWAgYW5kIGBkZWNvZGVNZXNzYWdlYCBjb3VsZCBwcm9iYWJseSB1c2UgRGF0YVZpZXcgdG8gcGFyc2UgdGhlIGJ1ZmZlclxuXG4vLyBjb25jYXQgdGhlIGxmbyBzdHJlYW0sIHRpbWUgYW5kIG1ldGFEYXRhIGludG8gYSBzaW5nbGUgYnVmZmVyXG4vLyB0aGUgY29uY2F0ZW5hdGlvbiBpcyBkb25lIGFzIGZvbGxvdyA6XG4vLyAgKiB0aW1lICAgICAgICAgID0+IDggYnl0ZXNcbi8vICAqIGZyYW1lLmxlbmd0aCAgPT4gMiBieXRlc1xuLy8gICogZnJhbWUgICAgICAgICA9PiA0ICogZnJhbWVMZW5ndGggYnl0ZXNcbi8vICAqIG1ldGFEYXRhICAgICAgPT4gcmVzdCBvZiB0aGUgbWVzc2FnZVxuLy8gQHJldHVybiAgQXJyYXlCdWZmZXIgb2YgdGhlIGNyZWF0ZWQgbWVzc2FnZVxuLy8gQG5vdGUgICAgbXVzdCBjcmVhdGUgYSBuZXcgYnVmZmVyIGVhY2ggdGltZSBiZWNhdXNlIG1ldGFEYXRhIGxlbmd0aCBpcyBub3Qga25vd25cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVNZXNzYWdlKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuICAgLy8gc2hvdWxkIHByb2JhYmx5IHVzZSB1c2UgRGF0YVZpZXcgaW5zdGVhZFxuICAvLyBodHRwOi8vd3d3Lmh0bWw1cm9ja3MuY29tL2VuL3R1dG9yaWFscy93ZWJnbC90eXBlZF9hcnJheXMvXG4gIHZhciB0aW1lNjQgPSBuZXcgRmxvYXQ2NEFycmF5KDEpO1xuICB0aW1lNjRbMF0gPSB0aW1lO1xuICB2YXIgdGltZTE2ID0gbmV3IFVpbnQxNkFycmF5KHRpbWU2NC5idWZmZXIpO1xuXG4gIHZhciBsZW5ndGgxNiA9IG5ldyBVaW50MTZBcnJheSgxKTtcbiAgbGVuZ3RoMTZbMF0gPSBmcmFtZS5sZW5ndGg7XG5cbiAgdmFyIGZyYW1lMTYgPSBuZXcgVWludDE2QXJyYXkoZnJhbWUuYnVmZmVyKTtcblxuICB2YXIgbWV0YURhdGExNiA9IHN0cjJVaW50MTZBcnJheShKU09OLnN0cmluZ2lmeShtZXRhRGF0YSkpO1xuXG4gIHZhciBidWZmZXJMZW5ndGggPSB0aW1lMTYubGVuZ3RoICsgbGVuZ3RoMTYubGVuZ3RoICsgZnJhbWUxNi5sZW5ndGggKyBtZXRhRGF0YTE2Lmxlbmd0aDtcblxuICB2YXIgYnVmZmVyID0gbmV3IFVpbnQxNkFycmF5KGJ1ZmZlckxlbmd0aCk7XG5cbiAgLy8gYnVmZmVyIGlzIHRoZSBjb25jYXRlbmF0aW9uIG9mIHRpbWUsIGZyYW1lTGVuZ3RoLCBmcmFtZSwgbWV0YURhdGFcbiAgYnVmZmVyLnNldCh0aW1lMTYsIDApO1xuICBidWZmZXIuc2V0KGxlbmd0aDE2LCB0aW1lMTYubGVuZ3RoKTtcbiAgYnVmZmVyLnNldChmcmFtZTE2LCB0aW1lMTYubGVuZ3RoICsgbGVuZ3RoMTYubGVuZ3RoKTtcbiAgYnVmZmVyLnNldChtZXRhRGF0YTE2LCB0aW1lMTYubGVuZ3RoICsgbGVuZ3RoMTYubGVuZ3RoICsgZnJhbWUxNi5sZW5ndGgpO1xuXG4gIHJldHVybiBidWZmZXIuYnVmZmVyO1xufVxuXG4vLyByZWNyZWF0ZSB0aGUgTGZvIHN0cmVhbSAodGltZSwgZnJhbWUsIG1ldGFEYXRhKSBmb3JtIGEgYnVmZmVyXG4vLyBjcmVhdGVkIHdpdGggYGVuY29kZU1lc3NhZ2VgXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlTWVzc2FnZShidWZmZXIpIHtcbiAgLy8gdGltZSBpcyBhIGZsb2F0NjRBcnJheSBvZiBzaXplIDEgKDggYnl0ZXMpXG4gIHZhciB0aW1lQXJyYXkgPSBuZXcgRmxvYXQ2NEFycmF5KGJ1ZmZlci5zbGljZSgwLCA4KSk7XG4gIHZhciB0aW1lID0gdGltZUFycmF5WzBdO1xuXG4gIC8vIGZyYW1lIGxlbmd0aCBpcyBlbmNvZGVkIGluIDIgYnl0ZXNcbiAgdmFyIGZyYW1lTGVuZ3RoQXJyYXkgPSBuZXcgVWludDE2QXJyYXkoYnVmZmVyLnNsaWNlKDgsIDEwKSk7XG4gIHZhciBmcmFtZUxlbmd0aCA9IGZyYW1lTGVuZ3RoQXJyYXlbMF07XG5cbiAgLy8gZnJhbWUgaXMgYSBmbG9hdDMyQXJyYXkgKDQgYnl0ZXMpICogZnJhbWVMZW5ndGhcbiAgdmFyIGZyYW1lQnl0ZUxlbmd0aCA9IDQgKiBmcmFtZUxlbmd0aDtcbiAgdmFyIGZyYW1lID0gbmV3IEZsb2F0MzJBcnJheShidWZmZXIuc2xpY2UoMTAsIDEwICsgZnJhbWVCeXRlTGVuZ3RoKSk7XG5cbiAgLy8gbWV0YURhdGEgaXMgdGhlIHJlc3Qgb2YgdGhlIGJ1ZmZlclxuICB2YXIgbWV0YURhdGFBcnJheSA9IG5ldyBVaW50MTZBcnJheShidWZmZXIuc2xpY2UoMTAgKyBmcmFtZUJ5dGVMZW5ndGgpKTtcbiAgLy8gSlNPTi5wYXJzZSBoZXJlIGNyYXNoZXMgbm9kZSBiZWNhdXNlIG9mIHRoaXMgY2hhcmFjdGVyIDogYFxcdTAwMDBgIChudWxsIGluIHVuaWNvZGUpID8/XG4gIHZhciBtZXRhRGF0YSA9IFVpbnQxNkFycmF5MnN0cihtZXRhRGF0YUFycmF5KTtcbiAgbWV0YURhdGEgPSBKU09OLnBhcnNlKG1ldGFEYXRhLnJlcGxhY2UoL1xcdTAwMDAvZywgJycpKTtcblxuICByZXR1cm4geyB0aW1lLCBmcmFtZSwgbWV0YURhdGEgfTtcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL2FycmF5L2Zyb21cIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vanNvbi9zdHJpbmdpZnlcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJtb2R1bGUuZXhwb3J0cyA9IHsgXCJkZWZhdWx0XCI6IHJlcXVpcmUoXCJjb3JlLWpzL2xpYnJhcnkvZm4vb2JqZWN0L2Fzc2lnblwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9vYmplY3QvZ2V0LXByb3RvdHlwZS1vZlwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9wcm9taXNlXCIpLCBfX2VzTW9kdWxlOiB0cnVlIH07IiwibW9kdWxlLmV4cG9ydHMgPSB7IFwiZGVmYXVsdFwiOiByZXF1aXJlKFwiY29yZS1qcy9saWJyYXJ5L2ZuL3N5bWJvbFwiKSwgX19lc01vZHVsZTogdHJ1ZSB9OyIsIm1vZHVsZS5leHBvcnRzID0geyBcImRlZmF1bHRcIjogcmVxdWlyZShcImNvcmUtanMvbGlicmFyeS9mbi9zeW1ib2wvaXRlcmF0b3JcIiksIF9fZXNNb2R1bGU6IHRydWUgfTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKGluc3RhbmNlLCBDb25zdHJ1Y3Rvcikge1xuICBpZiAoIShpbnN0YW5jZSBpbnN0YW5jZW9mIENvbnN0cnVjdG9yKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgY2FsbCBhIGNsYXNzIGFzIGEgZnVuY3Rpb25cIik7XG4gIH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9kZWZpbmUtcHJvcGVydHlcIik7XG5cbnZhciBfZGVmaW5lUHJvcGVydHkyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZGVmaW5lUHJvcGVydHkpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikgeyByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDogeyBkZWZhdWx0OiBvYmogfTsgfVxuXG5leHBvcnRzLmRlZmF1bHQgPSBmdW5jdGlvbiAoKSB7XG4gIGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXModGFyZ2V0LCBwcm9wcykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBkZXNjcmlwdG9yID0gcHJvcHNbaV07XG4gICAgICBkZXNjcmlwdG9yLmVudW1lcmFibGUgPSBkZXNjcmlwdG9yLmVudW1lcmFibGUgfHwgZmFsc2U7XG4gICAgICBkZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9IHRydWU7XG4gICAgICBpZiAoXCJ2YWx1ZVwiIGluIGRlc2NyaXB0b3IpIGRlc2NyaXB0b3Iud3JpdGFibGUgPSB0cnVlO1xuICAgICAgKDAsIF9kZWZpbmVQcm9wZXJ0eTIuZGVmYXVsdCkodGFyZ2V0LCBkZXNjcmlwdG9yLmtleSwgZGVzY3JpcHRvcik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvdG9Qcm9wcywgc3RhdGljUHJvcHMpIHtcbiAgICBpZiAocHJvdG9Qcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvci5wcm90b3R5cGUsIHByb3RvUHJvcHMpO1xuICAgIGlmIChzdGF0aWNQcm9wcykgZGVmaW5lUHJvcGVydGllcyhDb25zdHJ1Y3Rvciwgc3RhdGljUHJvcHMpO1xuICAgIHJldHVybiBDb25zdHJ1Y3RvcjtcbiAgfTtcbn0oKTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcblxudmFyIF9nZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1wcm90b3R5cGUtb2ZcIik7XG5cbnZhciBfZ2V0UHJvdG90eXBlT2YyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0UHJvdG90eXBlT2YpO1xuXG52YXIgX2dldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvb2JqZWN0L2dldC1vd24tcHJvcGVydHktZGVzY3JpcHRvclwiKTtcblxudmFyIF9nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gZ2V0KG9iamVjdCwgcHJvcGVydHksIHJlY2VpdmVyKSB7XG4gIGlmIChvYmplY3QgPT09IG51bGwpIG9iamVjdCA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcbiAgdmFyIGRlc2MgPSAoMCwgX2dldE93blByb3BlcnR5RGVzY3JpcHRvcjIuZGVmYXVsdCkob2JqZWN0LCBwcm9wZXJ0eSk7XG5cbiAgaWYgKGRlc2MgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBwYXJlbnQgPSAoMCwgX2dldFByb3RvdHlwZU9mMi5kZWZhdWx0KShvYmplY3QpO1xuXG4gICAgaWYgKHBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGdldChwYXJlbnQsIHByb3BlcnR5LCByZWNlaXZlcik7XG4gICAgfVxuICB9IGVsc2UgaWYgKFwidmFsdWVcIiBpbiBkZXNjKSB7XG4gICAgcmV0dXJuIGRlc2MudmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGdldHRlciA9IGRlc2MuZ2V0O1xuXG4gICAgaWYgKGdldHRlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHJldHVybiBnZXR0ZXIuY2FsbChyZWNlaXZlcik7XG4gIH1cbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9zZXQtcHJvdG90eXBlLW9mXCIpO1xuXG52YXIgX3NldFByb3RvdHlwZU9mMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX3NldFByb3RvdHlwZU9mKTtcblxudmFyIF9jcmVhdGUgPSByZXF1aXJlKFwiYmFiZWwtcnVudGltZS9jb3JlLWpzL29iamVjdC9jcmVhdGVcIik7XG5cbnZhciBfY3JlYXRlMiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoX2NyZWF0ZSk7XG5cbnZhciBfdHlwZW9mMiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpO1xuXG52YXIgX3R5cGVvZjMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90eXBlb2YyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHN1YkNsYXNzLCBzdXBlckNsYXNzKSB7XG4gIGlmICh0eXBlb2Ygc3VwZXJDbGFzcyAhPT0gXCJmdW5jdGlvblwiICYmIHN1cGVyQ2xhc3MgIT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3VwZXIgZXhwcmVzc2lvbiBtdXN0IGVpdGhlciBiZSBudWxsIG9yIGEgZnVuY3Rpb24sIG5vdCBcIiArICh0eXBlb2Ygc3VwZXJDbGFzcyA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiAoMCwgX3R5cGVvZjMuZGVmYXVsdCkoc3VwZXJDbGFzcykpKTtcbiAgfVxuXG4gIHN1YkNsYXNzLnByb3RvdHlwZSA9ICgwLCBfY3JlYXRlMi5kZWZhdWx0KShzdXBlckNsYXNzICYmIHN1cGVyQ2xhc3MucHJvdG90eXBlLCB7XG4gICAgY29uc3RydWN0b3I6IHtcbiAgICAgIHZhbHVlOiBzdWJDbGFzcyxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9XG4gIH0pO1xuICBpZiAoc3VwZXJDbGFzcykgX3NldFByb3RvdHlwZU9mMi5kZWZhdWx0ID8gKDAsIF9zZXRQcm90b3R5cGVPZjIuZGVmYXVsdCkoc3ViQ2xhc3MsIHN1cGVyQ2xhc3MpIDogc3ViQ2xhc3MuX19wcm90b19fID0gc3VwZXJDbGFzcztcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5cbnZhciBfdHlwZW9mMiA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2hlbHBlcnMvdHlwZW9mXCIpO1xuXG52YXIgX3R5cGVvZjMgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF90eXBlb2YyKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gZnVuY3Rpb24gKHNlbGYsIGNhbGwpIHtcbiAgaWYgKCFzZWxmKSB7XG4gICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwidGhpcyBoYXNuJ3QgYmVlbiBpbml0aWFsaXNlZCAtIHN1cGVyKCkgaGFzbid0IGJlZW4gY2FsbGVkXCIpO1xuICB9XG5cbiAgcmV0dXJuIGNhbGwgJiYgKCh0eXBlb2YgY2FsbCA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiAoMCwgX3R5cGVvZjMuZGVmYXVsdCkoY2FsbCkpID09PSBcIm9iamVjdFwiIHx8IHR5cGVvZiBjYWxsID09PSBcImZ1bmN0aW9uXCIpID8gY2FsbCA6IHNlbGY7XG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuXG52YXIgX2l0ZXJhdG9yID0gcmVxdWlyZShcImJhYmVsLXJ1bnRpbWUvY29yZS1qcy9zeW1ib2wvaXRlcmF0b3JcIik7XG5cbnZhciBfaXRlcmF0b3IyID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChfaXRlcmF0b3IpO1xuXG52YXIgX3N5bWJvbCA9IHJlcXVpcmUoXCJiYWJlbC1ydW50aW1lL2NvcmUtanMvc3ltYm9sXCIpO1xuXG52YXIgX3N5bWJvbDIgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KF9zeW1ib2wpO1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBfc3ltYm9sMi5kZWZhdWx0ID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIF9pdGVyYXRvcjIuZGVmYXVsdCA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IF9zeW1ib2wyLmRlZmF1bHQgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iajsgfTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHsgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHsgZGVmYXVsdDogb2JqIH07IH1cblxuZXhwb3J0cy5kZWZhdWx0ID0gdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBfdHlwZW9mKF9pdGVyYXRvcjIuZGVmYXVsdCkgPT09IFwic3ltYm9sXCIgPyBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiB0eXBlb2Ygb2JqID09PSBcInVuZGVmaW5lZFwiID8gXCJ1bmRlZmluZWRcIiA6IF90eXBlb2Yob2JqKTtcbn0gOiBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmogJiYgdHlwZW9mIF9zeW1ib2wyLmRlZmF1bHQgPT09IFwiZnVuY3Rpb25cIiAmJiBvYmouY29uc3RydWN0b3IgPT09IF9zeW1ib2wyLmRlZmF1bHQgPyBcInN5bWJvbFwiIDogdHlwZW9mIG9iaiA9PT0gXCJ1bmRlZmluZWRcIiA/IFwidW5kZWZpbmVkXCIgOiBfdHlwZW9mKG9iaik7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2LnN0cmluZy5pdGVyYXRvcicpO1xucmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuYXJyYXkuZnJvbScpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuQXJyYXkuZnJvbTsiLCJ2YXIgY29yZSAgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJylcbiAgLCAkSlNPTiA9IGNvcmUuSlNPTiB8fCAoY29yZS5KU09OID0ge3N0cmluZ2lmeTogSlNPTi5zdHJpbmdpZnl9KTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc3RyaW5naWZ5KGl0KXsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gJEpTT04uc3RyaW5naWZ5LmFwcGx5KCRKU09OLCBhcmd1bWVudHMpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuYXNzaWduJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3QuYXNzaWduOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5jcmVhdGUnKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gY3JlYXRlKFAsIEQpe1xuICByZXR1cm4gJE9iamVjdC5jcmVhdGUoUCwgRCk7XG59OyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5kZWZpbmUtcHJvcGVydHknKTtcbnZhciAkT2JqZWN0ID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fY29yZScpLk9iamVjdDtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgZGVzYyl7XG4gIHJldHVybiAkT2JqZWN0LmRlZmluZVByb3BlcnR5KGl0LCBrZXksIGRlc2MpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG52YXIgJE9iamVjdCA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Q7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihpdCwga2V5KXtcbiAgcmV0dXJuICRPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpO1xufTsiLCJyZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QuZ2V0LXByb3RvdHlwZS1vZicpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi8uLi9tb2R1bGVzL19jb3JlJykuT2JqZWN0LmdldFByb3RvdHlwZU9mOyIsInJlcXVpcmUoJy4uLy4uL21vZHVsZXMvZXM2Lm9iamVjdC5zZXQtcHJvdG90eXBlLW9mJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5PYmplY3Quc2V0UHJvdG90eXBlT2Y7IiwicmVxdWlyZSgnLi4vbW9kdWxlcy9lczYub2JqZWN0LnRvLXN0cmluZycpO1xucmVxdWlyZSgnLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbnJlcXVpcmUoJy4uL21vZHVsZXMvZXM2LnByb21pc2UnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vbW9kdWxlcy9fY29yZScpLlByb21pc2U7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3ltYm9sJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL2VzNi5vYmplY3QudG8tc3RyaW5nJyk7XG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uLy4uL21vZHVsZXMvX2NvcmUnKS5TeW1ib2w7IiwicmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9lczYuc3RyaW5nLml0ZXJhdG9yJyk7XG5yZXF1aXJlKCcuLi8uLi9tb2R1bGVzL3dlYi5kb20uaXRlcmFibGUnKTtcbm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi4vLi4vbW9kdWxlcy9fd2tzJykoJ2l0ZXJhdG9yJyk7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQsIENvbnN0cnVjdG9yLCBuYW1lLCBmb3JiaWRkZW5GaWVsZCl7XG4gIGlmKCEoaXQgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikgfHwgKGZvcmJpZGRlbkZpZWxkICE9PSB1bmRlZmluZWQgJiYgZm9yYmlkZGVuRmllbGQgaW4gaXQpKXtcbiAgICB0aHJvdyBUeXBlRXJyb3IobmFtZSArICc6IGluY29ycmVjdCBpbnZvY2F0aW9uIScpO1xuICB9IHJldHVybiBpdDtcbn07IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgaWYoIWlzT2JqZWN0KGl0KSl0aHJvdyBUeXBlRXJyb3IoaXQgKyAnIGlzIG5vdCBhbiBvYmplY3QhJyk7XG4gIHJldHVybiBpdDtcbn07IiwiLy8gZmFsc2UgLT4gQXJyYXkjaW5kZXhPZlxuLy8gdHJ1ZSAgLT4gQXJyYXkjaW5jbHVkZXNcbnZhciB0b0lPYmplY3QgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCB0b0xlbmd0aCAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIHRvSW5kZXggICA9IHJlcXVpcmUoJy4vX3RvLWluZGV4Jyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKElTX0lOQ0xVREVTKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKCR0aGlzLCBlbCwgZnJvbUluZGV4KXtcbiAgICB2YXIgTyAgICAgID0gdG9JT2JqZWN0KCR0aGlzKVxuICAgICAgLCBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aClcbiAgICAgICwgaW5kZXggID0gdG9JbmRleChmcm9tSW5kZXgsIGxlbmd0aClcbiAgICAgICwgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIGlmKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKXdoaWxlKGxlbmd0aCA+IGluZGV4KXtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIGlmKHZhbHVlICE9IHZhbHVlKXJldHVybiB0cnVlO1xuICAgIC8vIEFycmF5I3RvSW5kZXggaWdub3JlcyBob2xlcywgQXJyYXkjaW5jbHVkZXMgLSBub3RcbiAgICB9IGVsc2UgZm9yKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKylpZihJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKXtcbiAgICAgIGlmKE9baW5kZXhdID09PSBlbClyZXR1cm4gSVNfSU5DTFVERVMgfHwgaW5kZXggfHwgMDtcbiAgICB9IHJldHVybiAhSVNfSU5DTFVERVMgJiYgLTE7XG4gIH07XG59OyIsIi8vIGdldHRpbmcgdGFnIGZyb20gMTkuMS4zLjYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZygpXG52YXIgY29mID0gcmVxdWlyZSgnLi9fY29mJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKVxuICAvLyBFUzMgd3JvbmcgaGVyZVxuICAsIEFSRyA9IGNvZihmdW5jdGlvbigpeyByZXR1cm4gYXJndW1lbnRzOyB9KCkpID09ICdBcmd1bWVudHMnO1xuXG4vLyBmYWxsYmFjayBmb3IgSUUxMSBTY3JpcHQgQWNjZXNzIERlbmllZCBlcnJvclxudmFyIHRyeUdldCA9IGZ1bmN0aW9uKGl0LCBrZXkpe1xuICB0cnkge1xuICAgIHJldHVybiBpdFtrZXldO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIE8sIFQsIEI7XG4gIHJldHVybiBpdCA9PT0gdW5kZWZpbmVkID8gJ1VuZGVmaW5lZCcgOiBpdCA9PT0gbnVsbCA/ICdOdWxsJ1xuICAgIC8vIEBAdG9TdHJpbmdUYWcgY2FzZVxuICAgIDogdHlwZW9mIChUID0gdHJ5R2V0KE8gPSBPYmplY3QoaXQpLCBUQUcpKSA9PSAnc3RyaW5nJyA/IFRcbiAgICAvLyBidWlsdGluVGFnIGNhc2VcbiAgICA6IEFSRyA/IGNvZihPKVxuICAgIC8vIEVTMyBhcmd1bWVudHMgZmFsbGJhY2tcbiAgICA6IChCID0gY29mKE8pKSA9PSAnT2JqZWN0JyAmJiB0eXBlb2YgTy5jYWxsZWUgPT0gJ2Z1bmN0aW9uJyA/ICdBcmd1bWVudHMnIDogQjtcbn07IiwidmFyIGNvcmUgPSBtb2R1bGUuZXhwb3J0cyA9IHt2ZXJzaW9uOiAnMi4yLjInfTtcbmlmKHR5cGVvZiBfX2UgPT0gJ251bWJlcicpX19lID0gY29yZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bmRlZiIsIid1c2Ugc3RyaWN0JztcclxudmFyICRkZWZpbmVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXHJcbiAgLCBjcmVhdGVEZXNjICAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgaW5kZXgsIHZhbHVlKXtcclxuICBpZihpbmRleCBpbiBvYmplY3QpJGRlZmluZVByb3BlcnR5LmYob2JqZWN0LCBpbmRleCwgY3JlYXRlRGVzYygwLCB2YWx1ZSkpO1xyXG4gIGVsc2Ugb2JqZWN0W2luZGV4XSA9IHZhbHVlO1xyXG59OyIsIi8vIG9wdGlvbmFsIC8gc2ltcGxlIGNvbnRleHQgYmluZGluZ1xudmFyIGFGdW5jdGlvbiA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIHRoYXQsIGxlbmd0aCl7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmKHRoYXQgPT09IHVuZGVmaW5lZClyZXR1cm4gZm47XG4gIHN3aXRjaChsZW5ndGgpe1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKGEpe1xuICAgICAgcmV0dXJuIGZuLmNhbGwodGhhdCwgYSk7XG4gICAgfTtcbiAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLCBiKXtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbigvKiAuLi5hcmdzICovKXtcbiAgICByZXR1cm4gZm4uYXBwbHkodGhhdCwgYXJndW1lbnRzKTtcbiAgfTtcbn07IiwiLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xufSk7IiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBkb2N1bWVudCA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50XG4gIC8vIGluIG9sZCBJRSB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0J1xuICAsIGlzID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpcyA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoaXQpIDoge307XG59OyIsIi8vIElFIDgtIGRvbid0IGVudW0gYnVnIGtleXNcclxubW9kdWxlLmV4cG9ydHMgPSAoXHJcbiAgJ2NvbnN0cnVjdG9yLGhhc093blByb3BlcnR5LGlzUHJvdG90eXBlT2YscHJvcGVydHlJc0VudW1lcmFibGUsdG9Mb2NhbGVTdHJpbmcsdG9TdHJpbmcsdmFsdWVPZidcclxuKS5zcGxpdCgnLCcpOyIsIi8vIGFsbCBlbnVtZXJhYmxlIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBzeW1ib2xzXG52YXIgZ2V0S2V5cyA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzJylcbiAgLCBnT1BTICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKVxuICAsIHBJRSAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtcGllJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIHJlc3VsdCAgICAgPSBnZXRLZXlzKGl0KVxuICAgICwgZ2V0U3ltYm9scyA9IGdPUFMuZjtcbiAgaWYoZ2V0U3ltYm9scyl7XG4gICAgdmFyIHN5bWJvbHMgPSBnZXRTeW1ib2xzKGl0KVxuICAgICAgLCBpc0VudW0gID0gcElFLmZcbiAgICAgICwgaSAgICAgICA9IDBcbiAgICAgICwga2V5O1xuICAgIHdoaWxlKHN5bWJvbHMubGVuZ3RoID4gaSlpZihpc0VudW0uY2FsbChpdCwga2V5ID0gc3ltYm9sc1tpKytdKSlyZXN1bHQucHVzaChrZXkpO1xuICB9IHJldHVybiByZXN1bHQ7XG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIGNvcmUgICAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGN0eCAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgaGlkZSAgICAgID0gcmVxdWlyZSgnLi9faGlkZScpXG4gICwgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG5cbnZhciAkZXhwb3J0ID0gZnVuY3Rpb24odHlwZSwgbmFtZSwgc291cmNlKXtcbiAgdmFyIElTX0ZPUkNFRCA9IHR5cGUgJiAkZXhwb3J0LkZcbiAgICAsIElTX0dMT0JBTCA9IHR5cGUgJiAkZXhwb3J0LkdcbiAgICAsIElTX1NUQVRJQyA9IHR5cGUgJiAkZXhwb3J0LlNcbiAgICAsIElTX1BST1RPICA9IHR5cGUgJiAkZXhwb3J0LlBcbiAgICAsIElTX0JJTkQgICA9IHR5cGUgJiAkZXhwb3J0LkJcbiAgICAsIElTX1dSQVAgICA9IHR5cGUgJiAkZXhwb3J0LldcbiAgICAsIGV4cG9ydHMgICA9IElTX0dMT0JBTCA/IGNvcmUgOiBjb3JlW25hbWVdIHx8IChjb3JlW25hbWVdID0ge30pXG4gICAgLCBleHBQcm90byAgPSBleHBvcnRzW1BST1RPVFlQRV1cbiAgICAsIHRhcmdldCAgICA9IElTX0dMT0JBTCA/IGdsb2JhbCA6IElTX1NUQVRJQyA/IGdsb2JhbFtuYW1lXSA6IChnbG9iYWxbbmFtZV0gfHwge30pW1BST1RPVFlQRV1cbiAgICAsIGtleSwgb3duLCBvdXQ7XG4gIGlmKElTX0dMT0JBTClzb3VyY2UgPSBuYW1lO1xuICBmb3Ioa2V5IGluIHNvdXJjZSl7XG4gICAgLy8gY29udGFpbnMgaW4gbmF0aXZlXG4gICAgb3duID0gIUlTX0ZPUkNFRCAmJiB0YXJnZXQgJiYgdGFyZ2V0W2tleV0gIT09IHVuZGVmaW5lZDtcbiAgICBpZihvd24gJiYga2V5IGluIGV4cG9ydHMpY29udGludWU7XG4gICAgLy8gZXhwb3J0IG5hdGl2ZSBvciBwYXNzZWRcbiAgICBvdXQgPSBvd24gPyB0YXJnZXRba2V5XSA6IHNvdXJjZVtrZXldO1xuICAgIC8vIHByZXZlbnQgZ2xvYmFsIHBvbGx1dGlvbiBmb3IgbmFtZXNwYWNlc1xuICAgIGV4cG9ydHNba2V5XSA9IElTX0dMT0JBTCAmJiB0eXBlb2YgdGFyZ2V0W2tleV0gIT0gJ2Z1bmN0aW9uJyA/IHNvdXJjZVtrZXldXG4gICAgLy8gYmluZCB0aW1lcnMgdG8gZ2xvYmFsIGZvciBjYWxsIGZyb20gZXhwb3J0IGNvbnRleHRcbiAgICA6IElTX0JJTkQgJiYgb3duID8gY3R4KG91dCwgZ2xvYmFsKVxuICAgIC8vIHdyYXAgZ2xvYmFsIGNvbnN0cnVjdG9ycyBmb3IgcHJldmVudCBjaGFuZ2UgdGhlbSBpbiBsaWJyYXJ5XG4gICAgOiBJU19XUkFQICYmIHRhcmdldFtrZXldID09IG91dCA/IChmdW5jdGlvbihDKXtcbiAgICAgIHZhciBGID0gZnVuY3Rpb24oYSwgYiwgYyl7XG4gICAgICAgIGlmKHRoaXMgaW5zdGFuY2VvZiBDKXtcbiAgICAgICAgICBzd2l0Y2goYXJndW1lbnRzLmxlbmd0aCl7XG4gICAgICAgICAgICBjYXNlIDA6IHJldHVybiBuZXcgQztcbiAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIG5ldyBDKGEpO1xuICAgICAgICAgICAgY2FzZSAyOiByZXR1cm4gbmV3IEMoYSwgYik7XG4gICAgICAgICAgfSByZXR1cm4gbmV3IEMoYSwgYiwgYyk7XG4gICAgICAgIH0gcmV0dXJuIEMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH07XG4gICAgICBGW1BST1RPVFlQRV0gPSBDW1BST1RPVFlQRV07XG4gICAgICByZXR1cm4gRjtcbiAgICAvLyBtYWtlIHN0YXRpYyB2ZXJzaW9ucyBmb3IgcHJvdG90eXBlIG1ldGhvZHNcbiAgICB9KShvdXQpIDogSVNfUFJPVE8gJiYgdHlwZW9mIG91dCA9PSAnZnVuY3Rpb24nID8gY3R4KEZ1bmN0aW9uLmNhbGwsIG91dCkgOiBvdXQ7XG4gICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLm1ldGhvZHMuJU5BTUUlXG4gICAgaWYoSVNfUFJPVE8pe1xuICAgICAgKGV4cG9ydHMudmlydHVhbCB8fCAoZXhwb3J0cy52aXJ0dWFsID0ge30pKVtrZXldID0gb3V0O1xuICAgICAgLy8gZXhwb3J0IHByb3RvIG1ldGhvZHMgdG8gY29yZS4lQ09OU1RSVUNUT1IlLnByb3RvdHlwZS4lTkFNRSVcbiAgICAgIGlmKHR5cGUgJiAkZXhwb3J0LlIgJiYgZXhwUHJvdG8gJiYgIWV4cFByb3RvW2tleV0paGlkZShleHBQcm90bywga2V5LCBvdXQpO1xuICAgIH1cbiAgfVxufTtcbi8vIHR5cGUgYml0bWFwXG4kZXhwb3J0LkYgPSAxOyAgIC8vIGZvcmNlZFxuJGV4cG9ydC5HID0gMjsgICAvLyBnbG9iYWxcbiRleHBvcnQuUyA9IDQ7ICAgLy8gc3RhdGljXG4kZXhwb3J0LlAgPSA4OyAgIC8vIHByb3RvXG4kZXhwb3J0LkIgPSAxNjsgIC8vIGJpbmRcbiRleHBvcnQuVyA9IDMyOyAgLy8gd3JhcFxuJGV4cG9ydC5VID0gNjQ7ICAvLyBzYWZlXG4kZXhwb3J0LlIgPSAxMjg7IC8vIHJlYWwgcHJvdG8gbWV0aG9kIGZvciBgbGlicmFyeWAgXG5tb2R1bGUuZXhwb3J0cyA9ICRleHBvcnQ7IiwidmFyIGN0eCAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBjYWxsICAgICAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgPSByZXF1aXJlKCcuL19pcy1hcnJheS1pdGVyJylcbiAgLCBhbk9iamVjdCAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgdG9MZW5ndGggICAgPSByZXF1aXJlKCcuL190by1sZW5ndGgnKVxuICAsIGdldEl0ZXJGbiAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXRlcmFibGUsIGVudHJpZXMsIGZuLCB0aGF0LCBJVEVSQVRPUil7XG4gIHZhciBpdGVyRm4gPSBJVEVSQVRPUiA/IGZ1bmN0aW9uKCl7IHJldHVybiBpdGVyYWJsZTsgfSA6IGdldEl0ZXJGbihpdGVyYWJsZSlcbiAgICAsIGYgICAgICA9IGN0eChmbiwgdGhhdCwgZW50cmllcyA/IDIgOiAxKVxuICAgICwgaW5kZXggID0gMFxuICAgICwgbGVuZ3RoLCBzdGVwLCBpdGVyYXRvcjtcbiAgaWYodHlwZW9mIGl0ZXJGbiAhPSAnZnVuY3Rpb24nKXRocm93IFR5cGVFcnJvcihpdGVyYWJsZSArICcgaXMgbm90IGl0ZXJhYmxlIScpO1xuICAvLyBmYXN0IGNhc2UgZm9yIGFycmF5cyB3aXRoIGRlZmF1bHQgaXRlcmF0b3JcbiAgaWYoaXNBcnJheUl0ZXIoaXRlckZuKSlmb3IobGVuZ3RoID0gdG9MZW5ndGgoaXRlcmFibGUubGVuZ3RoKTsgbGVuZ3RoID4gaW5kZXg7IGluZGV4Kyspe1xuICAgIGVudHJpZXMgPyBmKGFuT2JqZWN0KHN0ZXAgPSBpdGVyYWJsZVtpbmRleF0pWzBdLCBzdGVwWzFdKSA6IGYoaXRlcmFibGVbaW5kZXhdKTtcbiAgfSBlbHNlIGZvcihpdGVyYXRvciA9IGl0ZXJGbi5jYWxsKGl0ZXJhYmxlKTsgIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lOyApe1xuICAgIGNhbGwoaXRlcmF0b3IsIGYsIHN0ZXAudmFsdWUsIGVudHJpZXMpO1xuICB9XG59OyIsInZhciBoYXNPd25Qcm9wZXJ0eSA9IHt9Lmhhc093blByb3BlcnR5O1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwga2V5KXtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59OyIsInZhciBkUCAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJylcbiAgLCBjcmVhdGVEZXNjID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gZnVuY3Rpb24ob2JqZWN0LCBrZXksIHZhbHVlKXtcbiAgcmV0dXJuIGRQLmYob2JqZWN0LCBrZXksIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbihvYmplY3QsIGtleSwgdmFsdWUpe1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpLmRvY3VtZW50ICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDsiLCJtb2R1bGUuZXhwb3J0cyA9ICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpICYmICFyZXF1aXJlKCcuL19mYWlscycpKGZ1bmN0aW9uKCl7XHJcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShyZXF1aXJlKCcuL19kb20tY3JlYXRlJykoJ2RpdicpLCAnYScsIHtnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiA3OyB9fSkuYSAhPSA3O1xyXG59KTsiLCIvLyBmYXN0IGFwcGx5LCBodHRwOi8vanNwZXJmLmxua2l0LmNvbS9mYXN0LWFwcGx5LzVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4sIGFyZ3MsIHRoYXQpe1xuICB2YXIgdW4gPSB0aGF0ID09PSB1bmRlZmluZWQ7XG4gIHN3aXRjaChhcmdzLmxlbmd0aCl7XG4gICAgY2FzZSAwOiByZXR1cm4gdW4gPyBmbigpXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQpO1xuICAgIGNhc2UgMTogcmV0dXJuIHVuID8gZm4oYXJnc1swXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSk7XG4gICAgY2FzZSAyOiByZXR1cm4gdW4gPyBmbihhcmdzWzBdLCBhcmdzWzFdKVxuICAgICAgICAgICAgICAgICAgICAgIDogZm4uY2FsbCh0aGF0LCBhcmdzWzBdLCBhcmdzWzFdKTtcbiAgICBjYXNlIDM6IHJldHVybiB1biA/IGZuKGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pXG4gICAgICAgICAgICAgICAgICAgICAgOiBmbi5jYWxsKHRoYXQsIGFyZ3NbMF0sIGFyZ3NbMV0sIGFyZ3NbMl0pO1xuICAgIGNhc2UgNDogcmV0dXJuIHVuID8gZm4oYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSlcbiAgICAgICAgICAgICAgICAgICAgICA6IGZuLmNhbGwodGhhdCwgYXJnc1swXSwgYXJnc1sxXSwgYXJnc1syXSwgYXJnc1szXSk7XG4gIH0gcmV0dXJuICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzKTtcbn07IiwiLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3NcbnZhciBjb2YgPSByZXF1aXJlKCcuL19jb2YnKTtcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCkgPyBPYmplY3QgOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBjb2YoaXQpID09ICdTdHJpbmcnID8gaXQuc3BsaXQoJycpIDogT2JqZWN0KGl0KTtcbn07IiwiLy8gY2hlY2sgb24gZGVmYXVsdCBBcnJheSBpdGVyYXRvclxudmFyIEl0ZXJhdG9ycyAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIElURVJBVE9SICAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgIT09IHVuZGVmaW5lZCAmJiAoSXRlcmF0b3JzLkFycmF5ID09PSBpdCB8fCBBcnJheVByb3RvW0lURVJBVE9SXSA9PT0gaXQpO1xufTsiLCIvLyA3LjIuMiBJc0FycmF5KGFyZ3VtZW50KVxudmFyIGNvZiA9IHJlcXVpcmUoJy4vX2NvZicpO1xubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKXtcbiAgcmV0dXJuIGNvZihhcmcpID09ICdBcnJheSc7XG59OyIsIi8vIGNhbGwgc29tZXRoaW5nIG9uIGl0ZXJhdG9yIHN0ZXAgd2l0aCBzYWZlIGNsb3Npbmcgb24gZXJyb3JcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdGVyYXRvciwgZm4sIHZhbHVlLCBlbnRyaWVzKXtcbiAgdHJ5IHtcbiAgICByZXR1cm4gZW50cmllcyA/IGZuKGFuT2JqZWN0KHZhbHVlKVswXSwgdmFsdWVbMV0pIDogZm4odmFsdWUpO1xuICAvLyA3LjQuNiBJdGVyYXRvckNsb3NlKGl0ZXJhdG9yLCBjb21wbGV0aW9uKVxuICB9IGNhdGNoKGUpe1xuICAgIHZhciByZXQgPSBpdGVyYXRvclsncmV0dXJuJ107XG4gICAgaWYocmV0ICE9PSB1bmRlZmluZWQpYW5PYmplY3QocmV0LmNhbGwoaXRlcmF0b3IpKTtcbiAgICB0aHJvdyBlO1xuICB9XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBjcmVhdGUgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKVxuICAsIGRlc2NyaXB0b3IgICAgID0gcmVxdWlyZSgnLi9fcHJvcGVydHktZGVzYycpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgSXRlcmF0b3JQcm90b3R5cGUgPSB7fTtcblxuLy8gMjUuMS4yLjEuMSAlSXRlcmF0b3JQcm90b3R5cGUlW0BAaXRlcmF0b3JdKClcbnJlcXVpcmUoJy4vX2hpZGUnKShJdGVyYXRvclByb3RvdHlwZSwgcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJyksIGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihDb25zdHJ1Y3RvciwgTkFNRSwgbmV4dCl7XG4gIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGNyZWF0ZShJdGVyYXRvclByb3RvdHlwZSwge25leHQ6IGRlc2NyaXB0b3IoMSwgbmV4dCl9KTtcbiAgc2V0VG9TdHJpbmdUYWcoQ29uc3RydWN0b3IsIE5BTUUgKyAnIEl0ZXJhdG9yJyk7XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBMSUJSQVJZICAgICAgICA9IHJlcXVpcmUoJy4vX2xpYnJhcnknKVxuICAsICRleHBvcnQgICAgICAgID0gcmVxdWlyZSgnLi9fZXhwb3J0JylcbiAgLCByZWRlZmluZSAgICAgICA9IHJlcXVpcmUoJy4vX3JlZGVmaW5lJylcbiAgLCBoaWRlICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIGhhcyAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBJdGVyYXRvcnMgICAgICA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpXG4gICwgJGl0ZXJDcmVhdGUgICAgPSByZXF1aXJlKCcuL19pdGVyLWNyZWF0ZScpXG4gICwgc2V0VG9TdHJpbmdUYWcgPSByZXF1aXJlKCcuL19zZXQtdG8tc3RyaW5nLXRhZycpXG4gICwgZ2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuL19vYmplY3QtZ3BvJylcbiAgLCBJVEVSQVRPUiAgICAgICA9IHJlcXVpcmUoJy4vX3drcycpKCdpdGVyYXRvcicpXG4gICwgQlVHR1kgICAgICAgICAgPSAhKFtdLmtleXMgJiYgJ25leHQnIGluIFtdLmtleXMoKSkgLy8gU2FmYXJpIGhhcyBidWdneSBpdGVyYXRvcnMgdy9vIGBuZXh0YFxuICAsIEZGX0lURVJBVE9SICAgID0gJ0BAaXRlcmF0b3InXG4gICwgS0VZUyAgICAgICAgICAgPSAna2V5cydcbiAgLCBWQUxVRVMgICAgICAgICA9ICd2YWx1ZXMnO1xuXG52YXIgcmV0dXJuVGhpcyA9IGZ1bmN0aW9uKCl7IHJldHVybiB0aGlzOyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEJhc2UsIE5BTUUsIENvbnN0cnVjdG9yLCBuZXh0LCBERUZBVUxULCBJU19TRVQsIEZPUkNFRCl7XG4gICRpdGVyQ3JlYXRlKENvbnN0cnVjdG9yLCBOQU1FLCBuZXh0KTtcbiAgdmFyIGdldE1ldGhvZCA9IGZ1bmN0aW9uKGtpbmQpe1xuICAgIGlmKCFCVUdHWSAmJiBraW5kIGluIHByb3RvKXJldHVybiBwcm90b1traW5kXTtcbiAgICBzd2l0Y2goa2luZCl7XG4gICAgICBjYXNlIEtFWVM6IHJldHVybiBmdW5jdGlvbiBrZXlzKCl7IHJldHVybiBuZXcgQ29uc3RydWN0b3IodGhpcywga2luZCk7IH07XG4gICAgICBjYXNlIFZBTFVFUzogcmV0dXJuIGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gbmV3IENvbnN0cnVjdG9yKHRoaXMsIGtpbmQpOyB9O1xuICAgIH0gcmV0dXJuIGZ1bmN0aW9uIGVudHJpZXMoKXsgcmV0dXJuIG5ldyBDb25zdHJ1Y3Rvcih0aGlzLCBraW5kKTsgfTtcbiAgfTtcbiAgdmFyIFRBRyAgICAgICAgPSBOQU1FICsgJyBJdGVyYXRvcidcbiAgICAsIERFRl9WQUxVRVMgPSBERUZBVUxUID09IFZBTFVFU1xuICAgICwgVkFMVUVTX0JVRyA9IGZhbHNlXG4gICAgLCBwcm90byAgICAgID0gQmFzZS5wcm90b3R5cGVcbiAgICAsICRuYXRpdmUgICAgPSBwcm90b1tJVEVSQVRPUl0gfHwgcHJvdG9bRkZfSVRFUkFUT1JdIHx8IERFRkFVTFQgJiYgcHJvdG9bREVGQVVMVF1cbiAgICAsICRkZWZhdWx0ICAgPSAkbmF0aXZlIHx8IGdldE1ldGhvZChERUZBVUxUKVxuICAgICwgJGVudHJpZXMgICA9IERFRkFVTFQgPyAhREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKCdlbnRyaWVzJykgOiB1bmRlZmluZWRcbiAgICAsICRhbnlOYXRpdmUgPSBOQU1FID09ICdBcnJheScgPyBwcm90by5lbnRyaWVzIHx8ICRuYXRpdmUgOiAkbmF0aXZlXG4gICAgLCBtZXRob2RzLCBrZXksIEl0ZXJhdG9yUHJvdG90eXBlO1xuICAvLyBGaXggbmF0aXZlXG4gIGlmKCRhbnlOYXRpdmUpe1xuICAgIEl0ZXJhdG9yUHJvdG90eXBlID0gZ2V0UHJvdG90eXBlT2YoJGFueU5hdGl2ZS5jYWxsKG5ldyBCYXNlKSk7XG4gICAgaWYoSXRlcmF0b3JQcm90b3R5cGUgIT09IE9iamVjdC5wcm90b3R5cGUpe1xuICAgICAgLy8gU2V0IEBAdG9TdHJpbmdUYWcgdG8gbmF0aXZlIGl0ZXJhdG9yc1xuICAgICAgc2V0VG9TdHJpbmdUYWcoSXRlcmF0b3JQcm90b3R5cGUsIFRBRywgdHJ1ZSk7XG4gICAgICAvLyBmaXggZm9yIHNvbWUgb2xkIGVuZ2luZXNcbiAgICAgIGlmKCFMSUJSQVJZICYmICFoYXMoSXRlcmF0b3JQcm90b3R5cGUsIElURVJBVE9SKSloaWRlKEl0ZXJhdG9yUHJvdG90eXBlLCBJVEVSQVRPUiwgcmV0dXJuVGhpcyk7XG4gICAgfVxuICB9XG4gIC8vIGZpeCBBcnJheSN7dmFsdWVzLCBAQGl0ZXJhdG9yfS5uYW1lIGluIFY4IC8gRkZcbiAgaWYoREVGX1ZBTFVFUyAmJiAkbmF0aXZlICYmICRuYXRpdmUubmFtZSAhPT0gVkFMVUVTKXtcbiAgICBWQUxVRVNfQlVHID0gdHJ1ZTtcbiAgICAkZGVmYXVsdCA9IGZ1bmN0aW9uIHZhbHVlcygpeyByZXR1cm4gJG5hdGl2ZS5jYWxsKHRoaXMpOyB9O1xuICB9XG4gIC8vIERlZmluZSBpdGVyYXRvclxuICBpZigoIUxJQlJBUlkgfHwgRk9SQ0VEKSAmJiAoQlVHR1kgfHwgVkFMVUVTX0JVRyB8fCAhcHJvdG9bSVRFUkFUT1JdKSl7XG4gICAgaGlkZShwcm90bywgSVRFUkFUT1IsICRkZWZhdWx0KTtcbiAgfVxuICAvLyBQbHVnIGZvciBsaWJyYXJ5XG4gIEl0ZXJhdG9yc1tOQU1FXSA9ICRkZWZhdWx0O1xuICBJdGVyYXRvcnNbVEFHXSAgPSByZXR1cm5UaGlzO1xuICBpZihERUZBVUxUKXtcbiAgICBtZXRob2RzID0ge1xuICAgICAgdmFsdWVzOiAgREVGX1ZBTFVFUyA/ICRkZWZhdWx0IDogZ2V0TWV0aG9kKFZBTFVFUyksXG4gICAgICBrZXlzOiAgICBJU19TRVQgICAgID8gJGRlZmF1bHQgOiBnZXRNZXRob2QoS0VZUyksXG4gICAgICBlbnRyaWVzOiAkZW50cmllc1xuICAgIH07XG4gICAgaWYoRk9SQ0VEKWZvcihrZXkgaW4gbWV0aG9kcyl7XG4gICAgICBpZighKGtleSBpbiBwcm90bykpcmVkZWZpbmUocHJvdG8sIGtleSwgbWV0aG9kc1trZXldKTtcbiAgICB9IGVsc2UgJGV4cG9ydCgkZXhwb3J0LlAgKyAkZXhwb3J0LkYgKiAoQlVHR1kgfHwgVkFMVUVTX0JVRyksIE5BTUUsIG1ldGhvZHMpO1xuICB9XG4gIHJldHVybiBtZXRob2RzO1xufTsiLCJ2YXIgSVRFUkFUT1IgICAgID0gcmVxdWlyZSgnLi9fd2tzJykoJ2l0ZXJhdG9yJylcbiAgLCBTQUZFX0NMT1NJTkcgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIHJpdGVyID0gWzddW0lURVJBVE9SXSgpO1xuICByaXRlclsncmV0dXJuJ10gPSBmdW5jdGlvbigpeyBTQUZFX0NMT1NJTkcgPSB0cnVlOyB9O1xuICBBcnJheS5mcm9tKHJpdGVyLCBmdW5jdGlvbigpeyB0aHJvdyAyOyB9KTtcbn0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihleGVjLCBza2lwQ2xvc2luZyl7XG4gIGlmKCFza2lwQ2xvc2luZyAmJiAhU0FGRV9DTE9TSU5HKXJldHVybiBmYWxzZTtcbiAgdmFyIHNhZmUgPSBmYWxzZTtcbiAgdHJ5IHtcbiAgICB2YXIgYXJyICA9IFs3XVxuICAgICAgLCBpdGVyID0gYXJyW0lURVJBVE9SXSgpO1xuICAgIGl0ZXIubmV4dCA9IGZ1bmN0aW9uKCl7IHJldHVybiB7ZG9uZTogc2FmZSA9IHRydWV9OyB9O1xuICAgIGFycltJVEVSQVRPUl0gPSBmdW5jdGlvbigpeyByZXR1cm4gaXRlcjsgfTtcbiAgICBleGVjKGFycik7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbiAgcmV0dXJuIHNhZmU7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZG9uZSwgdmFsdWUpe1xuICByZXR1cm4ge3ZhbHVlOiB2YWx1ZSwgZG9uZTogISFkb25lfTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7fTsiLCJ2YXIgZ2V0S2V5cyAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKVxuICAsIHRvSU9iamVjdCA9IHJlcXVpcmUoJy4vX3RvLWlvYmplY3QnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqZWN0LCBlbCl7XG4gIHZhciBPICAgICAgPSB0b0lPYmplY3Qob2JqZWN0KVxuICAgICwga2V5cyAgID0gZ2V0S2V5cyhPKVxuICAgICwgbGVuZ3RoID0ga2V5cy5sZW5ndGhcbiAgICAsIGluZGV4ICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobGVuZ3RoID4gaW5kZXgpaWYoT1trZXkgPSBrZXlzW2luZGV4KytdXSA9PT0gZWwpcmV0dXJuIGtleTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB0cnVlOyIsInZhciBNRVRBICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpKCdtZXRhJylcbiAgLCBpc09iamVjdCA9IHJlcXVpcmUoJy4vX2lzLW9iamVjdCcpXG4gICwgaGFzICAgICAgPSByZXF1aXJlKCcuL19oYXMnKVxuICAsIHNldERlc2MgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwJykuZlxuICAsIGlkICAgICAgID0gMDtcbnZhciBpc0V4dGVuc2libGUgPSBPYmplY3QuaXNFeHRlbnNpYmxlIHx8IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB0cnVlO1xufTtcbnZhciBGUkVFWkUgPSAhcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICByZXR1cm4gaXNFeHRlbnNpYmxlKE9iamVjdC5wcmV2ZW50RXh0ZW5zaW9ucyh7fSkpO1xufSk7XG52YXIgc2V0TWV0YSA9IGZ1bmN0aW9uKGl0KXtcbiAgc2V0RGVzYyhpdCwgTUVUQSwge3ZhbHVlOiB7XG4gICAgaTogJ08nICsgKytpZCwgLy8gb2JqZWN0IElEXG4gICAgdzoge30gICAgICAgICAgLy8gd2VhayBjb2xsZWN0aW9ucyBJRHNcbiAgfX0pO1xufTtcbnZhciBmYXN0S2V5ID0gZnVuY3Rpb24oaXQsIGNyZWF0ZSl7XG4gIC8vIHJldHVybiBwcmltaXRpdmUgd2l0aCBwcmVmaXhcbiAgaWYoIWlzT2JqZWN0KGl0KSlyZXR1cm4gdHlwZW9mIGl0ID09ICdzeW1ib2wnID8gaXQgOiAodHlwZW9mIGl0ID09ICdzdHJpbmcnID8gJ1MnIDogJ1AnKSArIGl0O1xuICBpZighaGFzKGl0LCBNRVRBKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gJ0YnO1xuICAgIC8vIG5vdCBuZWNlc3NhcnkgdG8gYWRkIG1ldGFkYXRhXG4gICAgaWYoIWNyZWF0ZSlyZXR1cm4gJ0UnO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBvYmplY3QgSURcbiAgfSByZXR1cm4gaXRbTUVUQV0uaTtcbn07XG52YXIgZ2V0V2VhayA9IGZ1bmN0aW9uKGl0LCBjcmVhdGUpe1xuICBpZighaGFzKGl0LCBNRVRBKSl7XG4gICAgLy8gY2FuJ3Qgc2V0IG1ldGFkYXRhIHRvIHVuY2F1Z2h0IGZyb3plbiBvYmplY3RcbiAgICBpZighaXNFeHRlbnNpYmxlKGl0KSlyZXR1cm4gdHJ1ZTtcbiAgICAvLyBub3QgbmVjZXNzYXJ5IHRvIGFkZCBtZXRhZGF0YVxuICAgIGlmKCFjcmVhdGUpcmV0dXJuIGZhbHNlO1xuICAgIC8vIGFkZCBtaXNzaW5nIG1ldGFkYXRhXG4gICAgc2V0TWV0YShpdCk7XG4gIC8vIHJldHVybiBoYXNoIHdlYWsgY29sbGVjdGlvbnMgSURzXG4gIH0gcmV0dXJuIGl0W01FVEFdLnc7XG59O1xuLy8gYWRkIG1ldGFkYXRhIG9uIGZyZWV6ZS1mYW1pbHkgbWV0aG9kcyBjYWxsaW5nXG52YXIgb25GcmVlemUgPSBmdW5jdGlvbihpdCl7XG4gIGlmKEZSRUVaRSAmJiBtZXRhLk5FRUQgJiYgaXNFeHRlbnNpYmxlKGl0KSAmJiAhaGFzKGl0LCBNRVRBKSlzZXRNZXRhKGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbnZhciBtZXRhID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIEtFWTogICAgICBNRVRBLFxuICBORUVEOiAgICAgZmFsc2UsXG4gIGZhc3RLZXk6ICBmYXN0S2V5LFxuICBnZXRXZWFrOiAgZ2V0V2VhayxcbiAgb25GcmVlemU6IG9uRnJlZXplXG59OyIsInZhciBnbG9iYWwgICAgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIG1hY3JvdGFzayA9IHJlcXVpcmUoJy4vX3Rhc2snKS5zZXRcbiAgLCBPYnNlcnZlciAgPSBnbG9iYWwuTXV0YXRpb25PYnNlcnZlciB8fCBnbG9iYWwuV2ViS2l0TXV0YXRpb25PYnNlcnZlclxuICAsIHByb2Nlc3MgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgUHJvbWlzZSAgID0gZ2xvYmFsLlByb21pc2VcbiAgLCBpc05vZGUgICAgPSByZXF1aXJlKCcuL19jb2YnKShwcm9jZXNzKSA9PSAncHJvY2VzcydcbiAgLCBoZWFkLCBsYXN0LCBub3RpZnk7XG5cbnZhciBmbHVzaCA9IGZ1bmN0aW9uKCl7XG4gIHZhciBwYXJlbnQsIGZuO1xuICBpZihpc05vZGUgJiYgKHBhcmVudCA9IHByb2Nlc3MuZG9tYWluKSlwYXJlbnQuZXhpdCgpO1xuICB3aGlsZShoZWFkKXtcbiAgICBmbiA9IGhlYWQuZm47XG4gICAgZm4oKTsgLy8gPC0gY3VycmVudGx5IHdlIHVzZSBpdCBvbmx5IGZvciBQcm9taXNlIC0gdHJ5IC8gY2F0Y2ggbm90IHJlcXVpcmVkXG4gICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgfSBsYXN0ID0gdW5kZWZpbmVkO1xuICBpZihwYXJlbnQpcGFyZW50LmVudGVyKCk7XG59O1xuXG4vLyBOb2RlLmpzXG5pZihpc05vZGUpe1xuICBub3RpZnkgPSBmdW5jdGlvbigpe1xuICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICB9O1xuLy8gYnJvd3NlcnMgd2l0aCBNdXRhdGlvbk9ic2VydmVyXG59IGVsc2UgaWYoT2JzZXJ2ZXIpe1xuICB2YXIgdG9nZ2xlID0gdHJ1ZVxuICAgICwgbm9kZSAgID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJycpO1xuICBuZXcgT2JzZXJ2ZXIoZmx1c2gpLm9ic2VydmUobm9kZSwge2NoYXJhY3RlckRhdGE6IHRydWV9KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXdcbiAgbm90aWZ5ID0gZnVuY3Rpb24oKXtcbiAgICBub2RlLmRhdGEgPSB0b2dnbGUgPSAhdG9nZ2xlO1xuICB9O1xuLy8gZW52aXJvbm1lbnRzIHdpdGggbWF5YmUgbm9uLWNvbXBsZXRlbHkgY29ycmVjdCwgYnV0IGV4aXN0ZW50IFByb21pc2Vcbn0gZWxzZSBpZihQcm9taXNlICYmIFByb21pc2UucmVzb2x2ZSl7XG4gIG5vdGlmeSA9IGZ1bmN0aW9uKCl7XG4gICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmbHVzaCk7XG4gIH07XG4vLyBmb3Igb3RoZXIgZW52aXJvbm1lbnRzIC0gbWFjcm90YXNrIGJhc2VkIG9uOlxuLy8gLSBzZXRJbW1lZGlhdGVcbi8vIC0gTWVzc2FnZUNoYW5uZWxcbi8vIC0gd2luZG93LnBvc3RNZXNzYWdcbi8vIC0gb25yZWFkeXN0YXRlY2hhbmdlXG4vLyAtIHNldFRpbWVvdXRcbn0gZWxzZSB7XG4gIG5vdGlmeSA9IGZ1bmN0aW9uKCl7XG4gICAgLy8gc3RyYW5nZSBJRSArIHdlYnBhY2sgZGV2IHNlcnZlciBidWcgLSB1c2UgLmNhbGwoZ2xvYmFsKVxuICAgIG1hY3JvdGFzay5jYWxsKGdsb2JhbCwgZmx1c2gpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGZuKXtcbiAgdmFyIHRhc2sgPSB7Zm46IGZuLCBuZXh0OiB1bmRlZmluZWR9O1xuICBpZihsYXN0KWxhc3QubmV4dCA9IHRhc2s7XG4gIGlmKCFoZWFkKXtcbiAgICBoZWFkID0gdGFzaztcbiAgICBub3RpZnkoKTtcbiAgfSBsYXN0ID0gdGFzaztcbn07IiwiJ3VzZSBzdHJpY3QnO1xuLy8gMTkuMS4yLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSwgLi4uKVxudmFyIGdldEtleXMgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWtleXMnKVxuICAsIGdPUFMgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKVxuICAsIHBJRSAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LXBpZScpXG4gICwgdG9PYmplY3QgPSByZXF1aXJlKCcuL190by1vYmplY3QnKVxuICAsIElPYmplY3QgID0gcmVxdWlyZSgnLi9faW9iamVjdCcpXG4gICwgJGFzc2lnbiAgPSBPYmplY3QuYXNzaWduO1xuXG4vLyBzaG91bGQgd29yayB3aXRoIHN5bWJvbHMgYW5kIHNob3VsZCBoYXZlIGRldGVybWluaXN0aWMgcHJvcGVydHkgb3JkZXIgKFY4IGJ1Zylcbm1vZHVsZS5leHBvcnRzID0gISRhc3NpZ24gfHwgcmVxdWlyZSgnLi9fZmFpbHMnKShmdW5jdGlvbigpe1xuICB2YXIgQSA9IHt9XG4gICAgLCBCID0ge31cbiAgICAsIFMgPSBTeW1ib2woKVxuICAgICwgSyA9ICdhYmNkZWZnaGlqa2xtbm9wcXJzdCc7XG4gIEFbU10gPSA3O1xuICBLLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uKGspeyBCW2tdID0gazsgfSk7XG4gIHJldHVybiAkYXNzaWduKHt9LCBBKVtTXSAhPSA3IHx8IE9iamVjdC5rZXlzKCRhc3NpZ24oe30sIEIpKS5qb2luKCcnKSAhPSBLO1xufSkgPyBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0LCBzb3VyY2UpeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHZhciBUICAgICA9IHRvT2JqZWN0KHRhcmdldClcbiAgICAsIGFMZW4gID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgaW5kZXggPSAxXG4gICAgLCBnZXRTeW1ib2xzID0gZ09QUy5mXG4gICAgLCBpc0VudW0gICAgID0gcElFLmY7XG4gIHdoaWxlKGFMZW4gPiBpbmRleCl7XG4gICAgdmFyIFMgICAgICA9IElPYmplY3QoYXJndW1lbnRzW2luZGV4KytdKVxuICAgICAgLCBrZXlzICAgPSBnZXRTeW1ib2xzID8gZ2V0S2V5cyhTKS5jb25jYXQoZ2V0U3ltYm9scyhTKSkgOiBnZXRLZXlzKFMpXG4gICAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXG4gICAgICAsIGogICAgICA9IDBcbiAgICAgICwga2V5O1xuICAgIHdoaWxlKGxlbmd0aCA+IGopaWYoaXNFbnVtLmNhbGwoUywga2V5ID0ga2V5c1tqKytdKSlUW2tleV0gPSBTW2tleV07XG4gIH0gcmV0dXJuIFQ7XG59IDogJGFzc2lnbjsiLCIvLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcclxudmFyIGFuT2JqZWN0ICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcclxuICAsIGRQcyAgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWRwcycpXHJcbiAgLCBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4vX2VudW0tYnVnLWtleXMnKVxyXG4gICwgSUVfUFJPVE8gICAgPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJylcclxuICAsIEVtcHR5ICAgICAgID0gZnVuY3Rpb24oKXsgLyogZW1wdHkgKi8gfVxyXG4gICwgUFJPVE9UWVBFICAgPSAncHJvdG90eXBlJztcclxuXHJcbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBpZnJhbWUgT2JqZWN0IHdpdGggY2xlYXJlZCBwcm90b3R5cGVcclxudmFyIGNyZWF0ZURpY3QgPSBmdW5jdGlvbigpe1xyXG4gIC8vIFRocmFzaCwgd2FzdGUgYW5kIHNvZG9teTogSUUgR0MgYnVnXHJcbiAgdmFyIGlmcmFtZSA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKSgnaWZyYW1lJylcclxuICAgICwgaSAgICAgID0gZW51bUJ1Z0tleXMubGVuZ3RoXHJcbiAgICAsIGd0ICAgICA9ICc+J1xyXG4gICAgLCBpZnJhbWVEb2N1bWVudDtcclxuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcclxuICByZXF1aXJlKCcuL19odG1sJykuYXBwZW5kQ2hpbGQoaWZyYW1lKTtcclxuICBpZnJhbWUuc3JjID0gJ2phdmFzY3JpcHQ6JzsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zY3JpcHQtdXJsXHJcbiAgLy8gY3JlYXRlRGljdCA9IGlmcmFtZS5jb250ZW50V2luZG93Lk9iamVjdDtcclxuICAvLyBodG1sLnJlbW92ZUNoaWxkKGlmcmFtZSk7XHJcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcclxuICBpZnJhbWVEb2N1bWVudC5vcGVuKCk7XHJcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUoJzxzY3JpcHQ+ZG9jdW1lbnQuRj1PYmplY3Q8L3NjcmlwdCcgKyBndCk7XHJcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcclxuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcclxuICB3aGlsZShpLS0pZGVsZXRlIGNyZWF0ZURpY3RbUFJPVE9UWVBFXVtlbnVtQnVnS2V5c1tpXV07XHJcbiAgcmV0dXJuIGNyZWF0ZURpY3QoKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LmNyZWF0ZSB8fCBmdW5jdGlvbiBjcmVhdGUoTywgUHJvcGVydGllcyl7XHJcbiAgdmFyIHJlc3VsdDtcclxuICBpZihPICE9PSBudWxsKXtcclxuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcclxuICAgIHJlc3VsdCA9IG5ldyBFbXB0eTtcclxuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xyXG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxyXG4gICAgcmVzdWx0W0lFX1BST1RPXSA9IE87XHJcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcclxuICByZXR1cm4gUHJvcGVydGllcyA9PT0gdW5kZWZpbmVkID8gcmVzdWx0IDogZFBzKHJlc3VsdCwgUHJvcGVydGllcyk7XHJcbn07IiwidmFyIGFuT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJylcbiAgLCB0b1ByaW1pdGl2ZSAgICA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpXG4gICwgZFAgICAgICAgICAgICAgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBPYmplY3QuZGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKXtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XG4gICAgcmV0dXJuIGRQKE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XG4gIGlmKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcyl0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkIScpO1xuICBpZigndmFsdWUnIGluIEF0dHJpYnV0ZXMpT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTsiLCJ2YXIgZFAgICAgICAgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKVxyXG4gICwgYW5PYmplY3QgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxyXG4gICwgZ2V0S2V5cyAgPSByZXF1aXJlKCcuL19vYmplY3Qta2V5cycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpID8gT2JqZWN0LmRlZmluZVByb3BlcnRpZXMgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0aWVzKE8sIFByb3BlcnRpZXMpe1xyXG4gIGFuT2JqZWN0KE8pO1xyXG4gIHZhciBrZXlzICAgPSBnZXRLZXlzKFByb3BlcnRpZXMpXHJcbiAgICAsIGxlbmd0aCA9IGtleXMubGVuZ3RoXHJcbiAgICAsIGkgPSAwXHJcbiAgICAsIFA7XHJcbiAgd2hpbGUobGVuZ3RoID4gaSlkUC5mKE8sIFAgPSBrZXlzW2krK10sIFByb3BlcnRpZXNbUF0pO1xyXG4gIHJldHVybiBPO1xyXG59OyIsInZhciBwSUUgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1waWUnKVxyXG4gICwgY3JlYXRlRGVzYyAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJylcclxuICAsIHRvSU9iamVjdCAgICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXHJcbiAgLCB0b1ByaW1pdGl2ZSAgICA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpXHJcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXHJcbiAgLCBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4vX2llOC1kb20tZGVmaW5lJylcclxuICAsIGdPUEQgICAgICAgICAgID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcclxuXHJcbmV4cG9ydHMuZiA9IHJlcXVpcmUoJy4vX2Rlc2NyaXB0b3JzJykgPyBnT1BEIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApe1xyXG4gIE8gPSB0b0lPYmplY3QoTyk7XHJcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xyXG4gIGlmKElFOF9ET01fREVGSU5FKXRyeSB7XHJcbiAgICByZXR1cm4gZ09QRChPLCBQKTtcclxuICB9IGNhdGNoKGUpeyAvKiBlbXB0eSAqLyB9XHJcbiAgaWYoaGFzKE8sIFApKXJldHVybiBjcmVhdGVEZXNjKCFwSUUuZi5jYWxsKE8sIFApLCBPW1BdKTtcclxufTsiLCIvLyBmYWxsYmFjayBmb3IgSUUxMSBidWdneSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB3aXRoIGlmcmFtZSBhbmQgd2luZG93XG52YXIgdG9JT2JqZWN0ID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpXG4gICwgZ09QTiAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4nKS5mXG4gICwgdG9TdHJpbmcgID0ge30udG9TdHJpbmc7XG5cbnZhciB3aW5kb3dOYW1lcyA9IHR5cGVvZiB3aW5kb3cgPT0gJ29iamVjdCcgJiYgd2luZG93ICYmIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzXG4gID8gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMod2luZG93KSA6IFtdO1xuXG52YXIgZ2V0V2luZG93TmFtZXMgPSBmdW5jdGlvbihpdCl7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGdPUE4oaXQpO1xuICB9IGNhdGNoKGUpe1xuICAgIHJldHVybiB3aW5kb3dOYW1lcy5zbGljZSgpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5mID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlOYW1lcyhpdCl7XG4gIHJldHVybiB3aW5kb3dOYW1lcyAmJiB0b1N0cmluZy5jYWxsKGl0KSA9PSAnW29iamVjdCBXaW5kb3ddJyA/IGdldFdpbmRvd05hbWVzKGl0KSA6IGdPUE4odG9JT2JqZWN0KGl0KSk7XG59O1xuIiwiLy8gMTkuMS4yLjcgLyAxNS4yLjMuNCBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxyXG52YXIgJGtleXMgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJylcclxuICAsIGhpZGRlbktleXMgPSByZXF1aXJlKCcuL19lbnVtLWJ1Zy1rZXlzJykuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XHJcblxyXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pe1xyXG4gIHJldHVybiAka2V5cyhPLCBoaWRkZW5LZXlzKTtcclxufTsiLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzOyIsIi8vIDE5LjEuMi45IC8gMTUuMi4zLjIgT2JqZWN0LmdldFByb3RvdHlwZU9mKE8pXHJcbnZhciBoYXMgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXHJcbiAgLCB0b09iamVjdCAgICA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXHJcbiAgLCBJRV9QUk9UTyAgICA9IHJlcXVpcmUoJy4vX3NoYXJlZC1rZXknKSgnSUVfUFJPVE8nKVxyXG4gICwgT2JqZWN0UHJvdG8gPSBPYmplY3QucHJvdG90eXBlO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YgfHwgZnVuY3Rpb24oTyl7XHJcbiAgTyA9IHRvT2JqZWN0KE8pO1xyXG4gIGlmKGhhcyhPLCBJRV9QUk9UTykpcmV0dXJuIE9bSUVfUFJPVE9dO1xyXG4gIGlmKHR5cGVvZiBPLmNvbnN0cnVjdG9yID09ICdmdW5jdGlvbicgJiYgTyBpbnN0YW5jZW9mIE8uY29uc3RydWN0b3Ipe1xyXG4gICAgcmV0dXJuIE8uY29uc3RydWN0b3IucHJvdG90eXBlO1xyXG4gIH0gcmV0dXJuIE8gaW5zdGFuY2VvZiBPYmplY3QgPyBPYmplY3RQcm90byA6IG51bGw7XHJcbn07IiwidmFyIGhhcyAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXHJcbiAgLCB0b0lPYmplY3QgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcclxuICAsIGFycmF5SW5kZXhPZiA9IHJlcXVpcmUoJy4vX2FycmF5LWluY2x1ZGVzJykoZmFsc2UpXHJcbiAgLCBJRV9QUk9UTyAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQta2V5JykoJ0lFX1BST1RPJyk7XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9iamVjdCwgbmFtZXMpe1xyXG4gIHZhciBPICAgICAgPSB0b0lPYmplY3Qob2JqZWN0KVxyXG4gICAgLCBpICAgICAgPSAwXHJcbiAgICAsIHJlc3VsdCA9IFtdXHJcbiAgICAsIGtleTtcclxuICBmb3Ioa2V5IGluIE8paWYoa2V5ICE9IElFX1BST1RPKWhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xyXG4gIHdoaWxlKG5hbWVzLmxlbmd0aCA+IGkpaWYoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKXtcclxuICAgIH5hcnJheUluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn07IiwiLy8gMTkuMS4yLjE0IC8gMTUuMi4zLjE0IE9iamVjdC5rZXlzKE8pXHJcbnZhciAka2V5cyAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1rZXlzLWludGVybmFsJylcclxuICAsIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi9fZW51bS1idWcta2V5cycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiBrZXlzKE8pe1xyXG4gIHJldHVybiAka2V5cyhPLCBlbnVtQnVnS2V5cyk7XHJcbn07IiwiZXhwb3J0cy5mID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7IiwiLy8gbW9zdCBPYmplY3QgbWV0aG9kcyBieSBFUzYgc2hvdWxkIGFjY2VwdCBwcmltaXRpdmVzXG52YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgY29yZSAgICA9IHJlcXVpcmUoJy4vX2NvcmUnKVxuICAsIGZhaWxzICAgPSByZXF1aXJlKCcuL19mYWlscycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihLRVksIGV4ZWMpe1xuICB2YXIgZm4gID0gKGNvcmUuT2JqZWN0IHx8IHt9KVtLRVldIHx8IE9iamVjdFtLRVldXG4gICAgLCBleHAgPSB7fTtcbiAgZXhwW0tFWV0gPSBleGVjKGZuKTtcbiAgJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiBmYWlscyhmdW5jdGlvbigpeyBmbigxKTsgfSksICdPYmplY3QnLCBleHApO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGJpdG1hcCwgdmFsdWUpe1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGUgIDogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGUgICAgOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlICAgICAgIDogdmFsdWVcbiAgfTtcbn07IiwidmFyIGhpZGUgPSByZXF1aXJlKCcuL19oaWRlJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRhcmdldCwgc3JjLCBzYWZlKXtcbiAgZm9yKHZhciBrZXkgaW4gc3JjKXtcbiAgICBpZihzYWZlICYmIHRhcmdldFtrZXldKXRhcmdldFtrZXldID0gc3JjW2tleV07XG4gICAgZWxzZSBoaWRlKHRhcmdldCwga2V5LCBzcmNba2V5XSk7XG4gIH0gcmV0dXJuIHRhcmdldDtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19oaWRlJyk7IiwiLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBhbk9iamVjdCA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpO1xudmFyIGNoZWNrID0gZnVuY3Rpb24oTywgcHJvdG8pe1xuICBhbk9iamVjdChPKTtcbiAgaWYoIWlzT2JqZWN0KHByb3RvKSAmJiBwcm90byAhPT0gbnVsbCl0aHJvdyBUeXBlRXJyb3IocHJvdG8gKyBcIjogY2FuJ3Qgc2V0IGFzIHByb3RvdHlwZSFcIik7XG59O1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIHNldDogT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8ICgnX19wcm90b19fJyBpbiB7fSA/IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICBmdW5jdGlvbih0ZXN0LCBidWdneSwgc2V0KXtcbiAgICAgIHRyeSB7XG4gICAgICAgIHNldCA9IHJlcXVpcmUoJy4vX2N0eCcpKEZ1bmN0aW9uLmNhbGwsIHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJykuZihPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0LCAyKTtcbiAgICAgICAgc2V0KHRlc3QsIFtdKTtcbiAgICAgICAgYnVnZ3kgPSAhKHRlc3QgaW5zdGFuY2VvZiBBcnJheSk7XG4gICAgICB9IGNhdGNoKGUpeyBidWdneSA9IHRydWU7IH1cbiAgICAgIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90byl7XG4gICAgICAgIGNoZWNrKE8sIHByb3RvKTtcbiAgICAgICAgaWYoYnVnZ3kpTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICAgICAgZWxzZSBzZXQoTywgcHJvdG8pO1xuICAgICAgICByZXR1cm4gTztcbiAgICAgIH07XG4gICAgfSh7fSwgZmFsc2UpIDogdW5kZWZpbmVkKSxcbiAgY2hlY2s6IGNoZWNrXG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBnbG9iYWwgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgY29yZSAgICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBkUCAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpXG4gICwgU1BFQ0lFUyAgICAgPSByZXF1aXJlKCcuL193a3MnKSgnc3BlY2llcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKEtFWSl7XG4gIHZhciBDID0gdHlwZW9mIGNvcmVbS0VZXSA9PSAnZnVuY3Rpb24nID8gY29yZVtLRVldIDogZ2xvYmFsW0tFWV07XG4gIGlmKERFU0NSSVBUT1JTICYmIEMgJiYgIUNbU1BFQ0lFU10pZFAuZihDLCBTUEVDSUVTLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGdldDogZnVuY3Rpb24oKXsgcmV0dXJuIHRoaXM7IH1cbiAgfSk7XG59OyIsInZhciBkZWYgPSByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mXG4gICwgaGFzID0gcmVxdWlyZSgnLi9faGFzJylcbiAgLCBUQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgdGFnLCBzdGF0KXtcbiAgaWYoaXQgJiYgIWhhcyhpdCA9IHN0YXQgPyBpdCA6IGl0LnByb3RvdHlwZSwgVEFHKSlkZWYoaXQsIFRBRywge2NvbmZpZ3VyYWJsZTogdHJ1ZSwgdmFsdWU6IHRhZ30pO1xufTsiLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi9fc2hhcmVkJykoJ2tleXMnKVxyXG4gICwgdWlkICAgID0gcmVxdWlyZSgnLi9fdWlkJyk7XHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcclxuICByZXR1cm4gc2hhcmVkW2tleV0gfHwgKHNoYXJlZFtrZXldID0gdWlkKGtleSkpO1xyXG59OyIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuL19nbG9iYWwnKVxuICAsIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nXG4gICwgc3RvcmUgID0gZ2xvYmFsW1NIQVJFRF0gfHwgKGdsb2JhbFtTSEFSRURdID0ge30pO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihrZXkpe1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHt9KTtcbn07IiwiLy8gNy4zLjIwIFNwZWNpZXNDb25zdHJ1Y3RvcihPLCBkZWZhdWx0Q29uc3RydWN0b3IpXG52YXIgYW5PYmplY3QgID0gcmVxdWlyZSgnLi9fYW4tb2JqZWN0JylcbiAgLCBhRnVuY3Rpb24gPSByZXF1aXJlKCcuL19hLWZ1bmN0aW9uJylcbiAgLCBTUEVDSUVTICAgPSByZXF1aXJlKCcuL193a3MnKSgnc3BlY2llcycpO1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihPLCBEKXtcbiAgdmFyIEMgPSBhbk9iamVjdChPKS5jb25zdHJ1Y3RvciwgUztcbiAgcmV0dXJuIEMgPT09IHVuZGVmaW5lZCB8fCAoUyA9IGFuT2JqZWN0KEMpW1NQRUNJRVNdKSA9PSB1bmRlZmluZWQgPyBEIDogYUZ1bmN0aW9uKFMpO1xufTsiLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi9fdG8taW50ZWdlcicpXG4gICwgZGVmaW5lZCAgID0gcmVxdWlyZSgnLi9fZGVmaW5lZCcpO1xuLy8gdHJ1ZSAgLT4gU3RyaW5nI2F0XG4vLyBmYWxzZSAtPiBTdHJpbmcjY29kZVBvaW50QXRcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oVE9fU1RSSU5HKXtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRoYXQsIHBvcyl7XG4gICAgdmFyIHMgPSBTdHJpbmcoZGVmaW5lZCh0aGF0KSlcbiAgICAgICwgaSA9IHRvSW50ZWdlcihwb3MpXG4gICAgICAsIGwgPSBzLmxlbmd0aFxuICAgICAgLCBhLCBiO1xuICAgIGlmKGkgPCAwIHx8IGkgPj0gbClyZXR1cm4gVE9fU1RSSU5HID8gJycgOiB1bmRlZmluZWQ7XG4gICAgYSA9IHMuY2hhckNvZGVBdChpKTtcbiAgICByZXR1cm4gYSA8IDB4ZDgwMCB8fCBhID4gMHhkYmZmIHx8IGkgKyAxID09PSBsIHx8IChiID0gcy5jaGFyQ29kZUF0KGkgKyAxKSkgPCAweGRjMDAgfHwgYiA+IDB4ZGZmZlxuICAgICAgPyBUT19TVFJJTkcgPyBzLmNoYXJBdChpKSA6IGFcbiAgICAgIDogVE9fU1RSSU5HID8gcy5zbGljZShpLCBpICsgMikgOiAoYSAtIDB4ZDgwMCA8PCAxMCkgKyAoYiAtIDB4ZGMwMCkgKyAweDEwMDAwO1xuICB9O1xufTsiLCJ2YXIgY3R4ICAgICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fY3R4JylcbiAgLCBpbnZva2UgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19pbnZva2UnKVxuICAsIGh0bWwgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2h0bWwnKVxuICAsIGNlbCAgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2RvbS1jcmVhdGUnKVxuICAsIGdsb2JhbCAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgcHJvY2VzcyAgICAgICAgICAgID0gZ2xvYmFsLnByb2Nlc3NcbiAgLCBzZXRUYXNrICAgICAgICAgICAgPSBnbG9iYWwuc2V0SW1tZWRpYXRlXG4gICwgY2xlYXJUYXNrICAgICAgICAgID0gZ2xvYmFsLmNsZWFySW1tZWRpYXRlXG4gICwgTWVzc2FnZUNoYW5uZWwgICAgID0gZ2xvYmFsLk1lc3NhZ2VDaGFubmVsXG4gICwgY291bnRlciAgICAgICAgICAgID0gMFxuICAsIHF1ZXVlICAgICAgICAgICAgICA9IHt9XG4gICwgT05SRUFEWVNUQVRFQ0hBTkdFID0gJ29ucmVhZHlzdGF0ZWNoYW5nZSdcbiAgLCBkZWZlciwgY2hhbm5lbCwgcG9ydDtcbnZhciBydW4gPSBmdW5jdGlvbigpe1xuICB2YXIgaWQgPSArdGhpcztcbiAgaWYocXVldWUuaGFzT3duUHJvcGVydHkoaWQpKXtcbiAgICB2YXIgZm4gPSBxdWV1ZVtpZF07XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgICBmbigpO1xuICB9XG59O1xudmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQpe1xuICBydW4uY2FsbChldmVudC5kYXRhKTtcbn07XG4vLyBOb2RlLmpzIDAuOSsgJiBJRTEwKyBoYXMgc2V0SW1tZWRpYXRlLCBvdGhlcndpc2U6XG5pZighc2V0VGFzayB8fCAhY2xlYXJUYXNrKXtcbiAgc2V0VGFzayA9IGZ1bmN0aW9uIHNldEltbWVkaWF0ZShmbil7XG4gICAgdmFyIGFyZ3MgPSBbXSwgaSA9IDE7XG4gICAgd2hpbGUoYXJndW1lbnRzLmxlbmd0aCA+IGkpYXJncy5wdXNoKGFyZ3VtZW50c1tpKytdKTtcbiAgICBxdWV1ZVsrK2NvdW50ZXJdID0gZnVuY3Rpb24oKXtcbiAgICAgIGludm9rZSh0eXBlb2YgZm4gPT0gJ2Z1bmN0aW9uJyA/IGZuIDogRnVuY3Rpb24oZm4pLCBhcmdzKTtcbiAgICB9O1xuICAgIGRlZmVyKGNvdW50ZXIpO1xuICAgIHJldHVybiBjb3VudGVyO1xuICB9O1xuICBjbGVhclRhc2sgPSBmdW5jdGlvbiBjbGVhckltbWVkaWF0ZShpZCl7XG4gICAgZGVsZXRlIHF1ZXVlW2lkXTtcbiAgfTtcbiAgLy8gTm9kZS5qcyAwLjgtXG4gIGlmKHJlcXVpcmUoJy4vX2NvZicpKHByb2Nlc3MpID09ICdwcm9jZXNzJyl7XG4gICAgZGVmZXIgPSBmdW5jdGlvbihpZCl7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGN0eChydW4sIGlkLCAxKSk7XG4gICAgfTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBNZXNzYWdlQ2hhbm5lbCwgaW5jbHVkZXMgV2ViV29ya2Vyc1xuICB9IGVsc2UgaWYoTWVzc2FnZUNoYW5uZWwpe1xuICAgIGNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgcG9ydCAgICA9IGNoYW5uZWwucG9ydDI7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBsaXN0ZW5lcjtcbiAgICBkZWZlciA9IGN0eChwb3J0LnBvc3RNZXNzYWdlLCBwb3J0LCAxKTtcbiAgLy8gQnJvd3NlcnMgd2l0aCBwb3N0TWVzc2FnZSwgc2tpcCBXZWJXb3JrZXJzXG4gIC8vIElFOCBoYXMgcG9zdE1lc3NhZ2UsIGJ1dCBpdCdzIHN5bmMgJiB0eXBlb2YgaXRzIHBvc3RNZXNzYWdlIGlzICdvYmplY3QnXG4gIH0gZWxzZSBpZihnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lciAmJiB0eXBlb2YgcG9zdE1lc3NhZ2UgPT0gJ2Z1bmN0aW9uJyAmJiAhZ2xvYmFsLmltcG9ydFNjcmlwdHMpe1xuICAgIGRlZmVyID0gZnVuY3Rpb24oaWQpe1xuICAgICAgZ2xvYmFsLnBvc3RNZXNzYWdlKGlkICsgJycsICcqJyk7XG4gICAgfTtcbiAgICBnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGxpc3RlbmVyLCBmYWxzZSk7XG4gIC8vIElFOC1cbiAgfSBlbHNlIGlmKE9OUkVBRFlTVEFURUNIQU5HRSBpbiBjZWwoJ3NjcmlwdCcpKXtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIGh0bWwuYXBwZW5kQ2hpbGQoY2VsKCdzY3JpcHQnKSlbT05SRUFEWVNUQVRFQ0hBTkdFXSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGh0bWwucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgICAgIHJ1bi5jYWxsKGlkKTtcbiAgICAgIH07XG4gICAgfTtcbiAgLy8gUmVzdCBvbGQgYnJvd3NlcnNcbiAgfSBlbHNlIHtcbiAgICBkZWZlciA9IGZ1bmN0aW9uKGlkKXtcbiAgICAgIHNldFRpbWVvdXQoY3R4KHJ1biwgaWQsIDEpLCAwKTtcbiAgICB9O1xuICB9XG59XG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiAgIHNldFRhc2ssXG4gIGNsZWFyOiBjbGVhclRhc2tcbn07IiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4vX3RvLWludGVnZXInKVxuICAsIG1heCAgICAgICA9IE1hdGgubWF4XG4gICwgbWluICAgICAgID0gTWF0aC5taW47XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGluZGV4LCBsZW5ndGgpe1xuICBpbmRleCA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbmRleCA8IDAgPyBtYXgoaW5kZXggKyBsZW5ndGgsIDApIDogbWluKGluZGV4LCBsZW5ndGgpO1xufTsiLCIvLyA3LjEuNCBUb0ludGVnZXJcbnZhciBjZWlsICA9IE1hdGguY2VpbFxuICAsIGZsb29yID0gTWF0aC5mbG9vcjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXNOYU4oaXQgPSAraXQpID8gMCA6IChpdCA+IDAgPyBmbG9vciA6IGNlaWwpKGl0KTtcbn07IiwiLy8gdG8gaW5kZXhlZCBvYmplY3QsIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSU9iamVjdCA9IHJlcXVpcmUoJy4vX2lvYmplY3QnKVxuICAsIGRlZmluZWQgPSByZXF1aXJlKCcuL19kZWZpbmVkJyk7XG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIElPYmplY3QoZGVmaW5lZChpdCkpO1xufTsiLCIvLyA3LjEuMTUgVG9MZW5ndGhcbnZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuL190by1pbnRlZ2VyJylcbiAgLCBtaW4gICAgICAgPSBNYXRoLm1pbjtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gaXQgPiAwID8gbWluKHRvSW50ZWdlcihpdCksIDB4MWZmZmZmZmZmZmZmZmYpIDogMDsgLy8gcG93KDIsIDUzKSAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTsiLCIvLyA3LjEuMTMgVG9PYmplY3QoYXJndW1lbnQpXG52YXIgZGVmaW5lZCA9IHJlcXVpcmUoJy4vX2RlZmluZWQnKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oaXQpe1xuICByZXR1cm4gT2JqZWN0KGRlZmluZWQoaXQpKTtcbn07IiwiLy8gNy4xLjEgVG9QcmltaXRpdmUoaW5wdXQgWywgUHJlZmVycmVkVHlwZV0pXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuL19pcy1vYmplY3QnKTtcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpdCwgUyl7XG4gIGlmKCFpc09iamVjdChpdCkpcmV0dXJuIGl0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYoUyAmJiB0eXBlb2YgKGZuID0gaXQudG9TdHJpbmcpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaXQpKSlyZXR1cm4gdmFsO1xuICBpZih0eXBlb2YgKGZuID0gaXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIGlmKCFTICYmIHR5cGVvZiAoZm4gPSBpdC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpdCkpKXJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07IiwidmFyIGlkID0gMFxuICAsIHB4ID0gTWF0aC5yYW5kb20oKTtcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oa2V5KXtcbiAgcmV0dXJuICdTeW1ib2woJy5jb25jYXQoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSwgJylfJywgKCsraWQgKyBweCkudG9TdHJpbmcoMzYpKTtcbn07IiwidmFyIHN0b3JlICAgICAgPSByZXF1aXJlKCcuL19zaGFyZWQnKSgnd2tzJylcbiAgLCB1aWQgICAgICAgID0gcmVxdWlyZSgnLi9fdWlkJylcbiAgLCBTeW1ib2wgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJykuU3ltYm9sXG4gICwgVVNFX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT0gJ2Z1bmN0aW9uJztcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24obmFtZSl7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPVxuICAgIFVTRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdIHx8IChVU0VfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59OyIsInZhciBjbGFzc29mICAgPSByZXF1aXJlKCcuL19jbGFzc29mJylcbiAgLCBJVEVSQVRPUiAgPSByZXF1aXJlKCcuL193a3MnKSgnaXRlcmF0b3InKVxuICAsIEl0ZXJhdG9ycyA9IHJlcXVpcmUoJy4vX2l0ZXJhdG9ycycpO1xubW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL19jb3JlJykuZ2V0SXRlcmF0b3JNZXRob2QgPSBmdW5jdGlvbihpdCl7XG4gIGlmKGl0ICE9IHVuZGVmaW5lZClyZXR1cm4gaXRbSVRFUkFUT1JdXG4gICAgfHwgaXRbJ0BAaXRlcmF0b3InXVxuICAgIHx8IEl0ZXJhdG9yc1tjbGFzc29mKGl0KV07XG59OyIsIid1c2Ugc3RyaWN0JztcbnZhciBjdHggICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2N0eCcpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHRvT2JqZWN0ICAgICAgID0gcmVxdWlyZSgnLi9fdG8tb2JqZWN0JylcbiAgLCBjYWxsICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2l0ZXItY2FsbCcpXG4gICwgaXNBcnJheUl0ZXIgICAgPSByZXF1aXJlKCcuL19pcy1hcnJheS1pdGVyJylcbiAgLCB0b0xlbmd0aCAgICAgICA9IHJlcXVpcmUoJy4vX3RvLWxlbmd0aCcpXG4gICwgY3JlYXRlUHJvcGVydHkgPSByZXF1aXJlKCcuL19jcmVhdGUtcHJvcGVydHknKVxuICAsIGdldEl0ZXJGbiAgICAgID0gcmVxdWlyZSgnLi9jb3JlLmdldC1pdGVyYXRvci1tZXRob2QnKTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhcmVxdWlyZSgnLi9faXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXsgQXJyYXkuZnJvbShpdGVyKTsgfSksICdBcnJheScsIHtcbiAgLy8gMjIuMS4yLjEgQXJyYXkuZnJvbShhcnJheUxpa2UsIG1hcGZuID0gdW5kZWZpbmVkLCB0aGlzQXJnID0gdW5kZWZpbmVkKVxuICBmcm9tOiBmdW5jdGlvbiBmcm9tKGFycmF5TGlrZS8qLCBtYXBmbiA9IHVuZGVmaW5lZCwgdGhpc0FyZyA9IHVuZGVmaW5lZCovKXtcbiAgICB2YXIgTyAgICAgICA9IHRvT2JqZWN0KGFycmF5TGlrZSlcbiAgICAgICwgQyAgICAgICA9IHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgPyB0aGlzIDogQXJyYXlcbiAgICAgICwgYUxlbiAgICA9IGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgICwgbWFwZm4gICA9IGFMZW4gPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkXG4gICAgICAsIG1hcHBpbmcgPSBtYXBmbiAhPT0gdW5kZWZpbmVkXG4gICAgICAsIGluZGV4ICAgPSAwXG4gICAgICAsIGl0ZXJGbiAgPSBnZXRJdGVyRm4oTylcbiAgICAgICwgbGVuZ3RoLCByZXN1bHQsIHN0ZXAsIGl0ZXJhdG9yO1xuICAgIGlmKG1hcHBpbmcpbWFwZm4gPSBjdHgobWFwZm4sIGFMZW4gPiAyID8gYXJndW1lbnRzWzJdIDogdW5kZWZpbmVkLCAyKTtcbiAgICAvLyBpZiBvYmplY3QgaXNuJ3QgaXRlcmFibGUgb3IgaXQncyBhcnJheSB3aXRoIGRlZmF1bHQgaXRlcmF0b3IgLSB1c2Ugc2ltcGxlIGNhc2VcbiAgICBpZihpdGVyRm4gIT0gdW5kZWZpbmVkICYmICEoQyA9PSBBcnJheSAmJiBpc0FycmF5SXRlcihpdGVyRm4pKSl7XG4gICAgICBmb3IoaXRlcmF0b3IgPSBpdGVyRm4uY2FsbChPKSwgcmVzdWx0ID0gbmV3IEM7ICEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZTsgaW5kZXgrKyl7XG4gICAgICAgIGNyZWF0ZVByb3BlcnR5KHJlc3VsdCwgaW5kZXgsIG1hcHBpbmcgPyBjYWxsKGl0ZXJhdG9yLCBtYXBmbiwgW3N0ZXAudmFsdWUsIGluZGV4XSwgdHJ1ZSkgOiBzdGVwLnZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgICAgZm9yKHJlc3VsdCA9IG5ldyBDKGxlbmd0aCk7IGxlbmd0aCA+IGluZGV4OyBpbmRleCsrKXtcbiAgICAgICAgY3JlYXRlUHJvcGVydHkocmVzdWx0LCBpbmRleCwgbWFwcGluZyA/IG1hcGZuKE9baW5kZXhdLCBpbmRleCkgOiBPW2luZGV4XSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJlc3VsdC5sZW5ndGggPSBpbmRleDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBhZGRUb1Vuc2NvcGFibGVzID0gcmVxdWlyZSgnLi9fYWRkLXRvLXVuc2NvcGFibGVzJylcbiAgLCBzdGVwICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9faXRlci1zdGVwJylcbiAgLCBJdGVyYXRvcnMgICAgICAgID0gcmVxdWlyZSgnLi9faXRlcmF0b3JzJylcbiAgLCB0b0lPYmplY3QgICAgICAgID0gcmVxdWlyZSgnLi9fdG8taW9iamVjdCcpO1xuXG4vLyAyMi4xLjMuNCBBcnJheS5wcm90b3R5cGUuZW50cmllcygpXG4vLyAyMi4xLjMuMTMgQXJyYXkucHJvdG90eXBlLmtleXMoKVxuLy8gMjIuMS4zLjI5IEFycmF5LnByb3RvdHlwZS52YWx1ZXMoKVxuLy8gMjIuMS4zLjMwIEFycmF5LnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5tb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vX2l0ZXItZGVmaW5lJykoQXJyYXksICdBcnJheScsIGZ1bmN0aW9uKGl0ZXJhdGVkLCBraW5kKXtcbiAgdGhpcy5fdCA9IHRvSU9iamVjdChpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuICB0aGlzLl9rID0ga2luZDsgICAgICAgICAgICAgICAgLy8ga2luZFxuLy8gMjIuMS41LjIuMSAlQXJyYXlJdGVyYXRvclByb3RvdHlwZSUubmV4dCgpXG59LCBmdW5jdGlvbigpe1xuICB2YXIgTyAgICAgPSB0aGlzLl90XG4gICAgLCBraW5kICA9IHRoaXMuX2tcbiAgICAsIGluZGV4ID0gdGhpcy5faSsrO1xuICBpZighTyB8fCBpbmRleCA+PSBPLmxlbmd0aCl7XG4gICAgdGhpcy5fdCA9IHVuZGVmaW5lZDtcbiAgICByZXR1cm4gc3RlcCgxKTtcbiAgfVxuICBpZihraW5kID09ICdrZXlzJyAgKXJldHVybiBzdGVwKDAsIGluZGV4KTtcbiAgaWYoa2luZCA9PSAndmFsdWVzJylyZXR1cm4gc3RlcCgwLCBPW2luZGV4XSk7XG4gIHJldHVybiBzdGVwKDAsIFtpbmRleCwgT1tpbmRleF1dKTtcbn0sICd2YWx1ZXMnKTtcblxuLy8gYXJndW1lbnRzTGlzdFtAQGl0ZXJhdG9yXSBpcyAlQXJyYXlQcm90b192YWx1ZXMlICg5LjQuNC42LCA5LjQuNC43KVxuSXRlcmF0b3JzLkFyZ3VtZW50cyA9IEl0ZXJhdG9ycy5BcnJheTtcblxuYWRkVG9VbnNjb3BhYmxlcygna2V5cycpO1xuYWRkVG9VbnNjb3BhYmxlcygndmFsdWVzJyk7XG5hZGRUb1Vuc2NvcGFibGVzKCdlbnRyaWVzJyk7IiwiLy8gMTkuMS4zLjEgT2JqZWN0LmFzc2lnbih0YXJnZXQsIHNvdXJjZSlcbnZhciAkZXhwb3J0ID0gcmVxdWlyZSgnLi9fZXhwb3J0Jyk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GLCAnT2JqZWN0Jywge2Fzc2lnbjogcmVxdWlyZSgnLi9fb2JqZWN0LWFzc2lnbicpfSk7IiwidmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKVxyXG4vLyAxOS4xLjIuMiAvIDE1LjIuMy41IE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcclxuJGV4cG9ydCgkZXhwb3J0LlMsICdPYmplY3QnLCB7Y3JlYXRlOiByZXF1aXJlKCcuL19vYmplY3QtY3JlYXRlJyl9KTsiLCJ2YXIgJGV4cG9ydCA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpO1xyXG4vLyAxOS4xLjIuNCAvIDE1LjIuMy42IE9iamVjdC5kZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKVxyXG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqICFyZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpLCAnT2JqZWN0Jywge2RlZmluZVByb3BlcnR5OiByZXF1aXJlKCcuL19vYmplY3QtZHAnKS5mfSk7IiwiLy8gMTkuMS4yLjYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKVxudmFyIHRvSU9iamVjdCAgICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcGQnKS5mO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldE93blByb3BlcnR5RGVzY3JpcHRvcicsIGZ1bmN0aW9uKCl7XG4gIHJldHVybiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoaXQsIGtleSl7XG4gICAgcmV0dXJuICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG9JT2JqZWN0KGl0KSwga2V5KTtcbiAgfTtcbn0pOyIsIi8vIDE5LjEuMi45IE9iamVjdC5nZXRQcm90b3R5cGVPZihPKVxudmFyIHRvT2JqZWN0ICAgICAgICA9IHJlcXVpcmUoJy4vX3RvLW9iamVjdCcpXG4gICwgJGdldFByb3RvdHlwZU9mID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdwbycpO1xuXG5yZXF1aXJlKCcuL19vYmplY3Qtc2FwJykoJ2dldFByb3RvdHlwZU9mJywgZnVuY3Rpb24oKXtcbiAgcmV0dXJuIGZ1bmN0aW9uIGdldFByb3RvdHlwZU9mKGl0KXtcbiAgICByZXR1cm4gJGdldFByb3RvdHlwZU9mKHRvT2JqZWN0KGl0KSk7XG4gIH07XG59KTsiLCIvLyAxOS4xLjMuMTkgT2JqZWN0LnNldFByb3RvdHlwZU9mKE8sIHByb3RvKVxudmFyICRleHBvcnQgPSByZXF1aXJlKCcuL19leHBvcnQnKTtcbiRleHBvcnQoJGV4cG9ydC5TLCAnT2JqZWN0Jywge3NldFByb3RvdHlwZU9mOiByZXF1aXJlKCcuL19zZXQtcHJvdG8nKS5zZXR9KTsiLCIiLCIndXNlIHN0cmljdCc7XG52YXIgTElCUkFSWSAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fbGlicmFyeScpXG4gICwgZ2xvYmFsICAgICAgICAgICAgID0gcmVxdWlyZSgnLi9fZ2xvYmFsJylcbiAgLCBjdHggICAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19jdHgnKVxuICAsIGNsYXNzb2YgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2NsYXNzb2YnKVxuICAsICRleHBvcnQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2V4cG9ydCcpXG4gICwgaXNPYmplY3QgICAgICAgICAgID0gcmVxdWlyZSgnLi9faXMtb2JqZWN0JylcbiAgLCBhbk9iamVjdCAgICAgICAgICAgPSByZXF1aXJlKCcuL19hbi1vYmplY3QnKVxuICAsIGFGdW5jdGlvbiAgICAgICAgICA9IHJlcXVpcmUoJy4vX2EtZnVuY3Rpb24nKVxuICAsIGFuSW5zdGFuY2UgICAgICAgICA9IHJlcXVpcmUoJy4vX2FuLWluc3RhbmNlJylcbiAgLCBmb3JPZiAgICAgICAgICAgICAgPSByZXF1aXJlKCcuL19mb3Itb2YnKVxuICAsIHNldFByb3RvICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3NldC1wcm90bycpLnNldFxuICAsIHNwZWNpZXNDb25zdHJ1Y3RvciA9IHJlcXVpcmUoJy4vX3NwZWNpZXMtY29uc3RydWN0b3InKVxuICAsIHRhc2sgICAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3Rhc2snKS5zZXRcbiAgLCBtaWNyb3Rhc2sgICAgICAgICAgPSByZXF1aXJlKCcuL19taWNyb3Rhc2snKVxuICAsIFBST01JU0UgICAgICAgICAgICA9ICdQcm9taXNlJ1xuICAsIFR5cGVFcnJvciAgICAgICAgICA9IGdsb2JhbC5UeXBlRXJyb3JcbiAgLCBwcm9jZXNzICAgICAgICAgICAgPSBnbG9iYWwucHJvY2Vzc1xuICAsICRQcm9taXNlICAgICAgICAgICA9IGdsb2JhbFtQUk9NSVNFXVxuICAsIHByb2Nlc3MgICAgICAgICAgICA9IGdsb2JhbC5wcm9jZXNzXG4gICwgaXNOb2RlICAgICAgICAgICAgID0gY2xhc3NvZihwcm9jZXNzKSA9PSAncHJvY2VzcydcbiAgLCBlbXB0eSAgICAgICAgICAgICAgPSBmdW5jdGlvbigpeyAvKiBlbXB0eSAqLyB9XG4gICwgSW50ZXJuYWwsIEdlbmVyaWNQcm9taXNlQ2FwYWJpbGl0eSwgV3JhcHBlcjtcblxudmFyIFVTRV9OQVRJVkUgPSAhIWZ1bmN0aW9uKCl7XG4gIHRyeSB7XG4gICAgLy8gY29ycmVjdCBzdWJjbGFzc2luZyB3aXRoIEBAc3BlY2llcyBzdXBwb3J0XG4gICAgdmFyIHByb21pc2UgICAgID0gJFByb21pc2UucmVzb2x2ZSgxKVxuICAgICAgLCBGYWtlUHJvbWlzZSA9IChwcm9taXNlLmNvbnN0cnVjdG9yID0ge30pW3JlcXVpcmUoJy4vX3drcycpKCdzcGVjaWVzJyldID0gZnVuY3Rpb24oZXhlYyl7IGV4ZWMoZW1wdHksIGVtcHR5KTsgfTtcbiAgICAvLyB1bmhhbmRsZWQgcmVqZWN0aW9ucyB0cmFja2luZyBzdXBwb3J0LCBOb2RlSlMgUHJvbWlzZSB3aXRob3V0IGl0IGZhaWxzIEBAc3BlY2llcyB0ZXN0XG4gICAgcmV0dXJuIChpc05vZGUgfHwgdHlwZW9mIFByb21pc2VSZWplY3Rpb25FdmVudCA9PSAnZnVuY3Rpb24nKSAmJiBwcm9taXNlLnRoZW4oZW1wdHkpIGluc3RhbmNlb2YgRmFrZVByb21pc2U7XG4gIH0gY2F0Y2goZSl7IC8qIGVtcHR5ICovIH1cbn0oKTtcblxuLy8gaGVscGVyc1xudmFyIHNhbWVDb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKGEsIGIpe1xuICAvLyB3aXRoIGxpYnJhcnkgd3JhcHBlciBzcGVjaWFsIGNhc2VcbiAgcmV0dXJuIGEgPT09IGIgfHwgYSA9PT0gJFByb21pc2UgJiYgYiA9PT0gV3JhcHBlcjtcbn07XG52YXIgaXNUaGVuYWJsZSA9IGZ1bmN0aW9uKGl0KXtcbiAgdmFyIHRoZW47XG4gIHJldHVybiBpc09iamVjdChpdCkgJiYgdHlwZW9mICh0aGVuID0gaXQudGhlbikgPT0gJ2Z1bmN0aW9uJyA/IHRoZW4gOiBmYWxzZTtcbn07XG52YXIgbmV3UHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbihDKXtcbiAgcmV0dXJuIHNhbWVDb25zdHJ1Y3RvcigkUHJvbWlzZSwgQylcbiAgICA/IG5ldyBQcm9taXNlQ2FwYWJpbGl0eShDKVxuICAgIDogbmV3IEdlbmVyaWNQcm9taXNlQ2FwYWJpbGl0eShDKTtcbn07XG52YXIgUHJvbWlzZUNhcGFiaWxpdHkgPSBHZW5lcmljUHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbihDKXtcbiAgdmFyIHJlc29sdmUsIHJlamVjdDtcbiAgdGhpcy5wcm9taXNlID0gbmV3IEMoZnVuY3Rpb24oJCRyZXNvbHZlLCAkJHJlamVjdCl7XG4gICAgaWYocmVzb2x2ZSAhPT0gdW5kZWZpbmVkIHx8IHJlamVjdCAhPT0gdW5kZWZpbmVkKXRocm93IFR5cGVFcnJvcignQmFkIFByb21pc2UgY29uc3RydWN0b3InKTtcbiAgICByZXNvbHZlID0gJCRyZXNvbHZlO1xuICAgIHJlamVjdCAgPSAkJHJlamVjdDtcbiAgfSk7XG4gIHRoaXMucmVzb2x2ZSA9IGFGdW5jdGlvbihyZXNvbHZlKTtcbiAgdGhpcy5yZWplY3QgID0gYUZ1bmN0aW9uKHJlamVjdCk7XG59O1xudmFyIHBlcmZvcm0gPSBmdW5jdGlvbihleGVjKXtcbiAgdHJ5IHtcbiAgICBleGVjKCk7XG4gIH0gY2F0Y2goZSl7XG4gICAgcmV0dXJuIHtlcnJvcjogZX07XG4gIH1cbn07XG52YXIgbm90aWZ5ID0gZnVuY3Rpb24ocHJvbWlzZSwgaXNSZWplY3Qpe1xuICBpZihwcm9taXNlLl9uKXJldHVybjtcbiAgcHJvbWlzZS5fbiA9IHRydWU7XG4gIHZhciBjaGFpbiA9IHByb21pc2UuX2M7XG4gIG1pY3JvdGFzayhmdW5jdGlvbigpe1xuICAgIHZhciB2YWx1ZSA9IHByb21pc2UuX3ZcbiAgICAgICwgb2sgICAgPSBwcm9taXNlLl9zID09IDFcbiAgICAgICwgaSAgICAgPSAwO1xuICAgIHZhciBydW4gPSBmdW5jdGlvbihyZWFjdGlvbil7XG4gICAgICB2YXIgaGFuZGxlciA9IG9rID8gcmVhY3Rpb24ub2sgOiByZWFjdGlvbi5mYWlsXG4gICAgICAgICwgcmVzb2x2ZSA9IHJlYWN0aW9uLnJlc29sdmVcbiAgICAgICAgLCByZWplY3QgID0gcmVhY3Rpb24ucmVqZWN0XG4gICAgICAgICwgZG9tYWluICA9IHJlYWN0aW9uLmRvbWFpblxuICAgICAgICAsIHJlc3VsdCwgdGhlbjtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmKGhhbmRsZXIpe1xuICAgICAgICAgIGlmKCFvayl7XG4gICAgICAgICAgICBpZihwcm9taXNlLl9oID09IDIpb25IYW5kbGVVbmhhbmRsZWQocHJvbWlzZSk7XG4gICAgICAgICAgICBwcm9taXNlLl9oID0gMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYoaGFuZGxlciA9PT0gdHJ1ZSlyZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmKGRvbWFpbilkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgIHJlc3VsdCA9IGhhbmRsZXIodmFsdWUpO1xuICAgICAgICAgICAgaWYoZG9tYWluKWRvbWFpbi5leGl0KCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmKHJlc3VsdCA9PT0gcmVhY3Rpb24ucHJvbWlzZSl7XG4gICAgICAgICAgICByZWplY3QoVHlwZUVycm9yKCdQcm9taXNlLWNoYWluIGN5Y2xlJykpO1xuICAgICAgICAgIH0gZWxzZSBpZih0aGVuID0gaXNUaGVuYWJsZShyZXN1bHQpKXtcbiAgICAgICAgICAgIHRoZW4uY2FsbChyZXN1bHQsIHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgfSBlbHNlIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSBlbHNlIHJlamVjdCh2YWx1ZSk7XG4gICAgICB9IGNhdGNoKGUpe1xuICAgICAgICByZWplY3QoZSk7XG4gICAgICB9XG4gICAgfTtcbiAgICB3aGlsZShjaGFpbi5sZW5ndGggPiBpKXJ1bihjaGFpbltpKytdKTsgLy8gdmFyaWFibGUgbGVuZ3RoIC0gY2FuJ3QgdXNlIGZvckVhY2hcbiAgICBwcm9taXNlLl9jID0gW107XG4gICAgcHJvbWlzZS5fbiA9IGZhbHNlO1xuICAgIGlmKGlzUmVqZWN0ICYmICFwcm9taXNlLl9oKW9uVW5oYW5kbGVkKHByb21pc2UpO1xuICB9KTtcbn07XG52YXIgb25VbmhhbmRsZWQgPSBmdW5jdGlvbihwcm9taXNlKXtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24oKXtcbiAgICB2YXIgdmFsdWUgPSBwcm9taXNlLl92XG4gICAgICAsIGFicnVwdCwgaGFuZGxlciwgY29uc29sZTtcbiAgICBpZihpc1VuaGFuZGxlZChwcm9taXNlKSl7XG4gICAgICBhYnJ1cHQgPSBwZXJmb3JtKGZ1bmN0aW9uKCl7XG4gICAgICAgIGlmKGlzTm9kZSl7XG4gICAgICAgICAgcHJvY2Vzcy5lbWl0KCd1bmhhbmRsZWRSZWplY3Rpb24nLCB2YWx1ZSwgcHJvbWlzZSk7XG4gICAgICAgIH0gZWxzZSBpZihoYW5kbGVyID0gZ2xvYmFsLm9udW5oYW5kbGVkcmVqZWN0aW9uKXtcbiAgICAgICAgICBoYW5kbGVyKHtwcm9taXNlOiBwcm9taXNlLCByZWFzb246IHZhbHVlfSk7XG4gICAgICAgIH0gZWxzZSBpZigoY29uc29sZSA9IGdsb2JhbC5jb25zb2xlKSAmJiBjb25zb2xlLmVycm9yKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmhhbmRsZWQgcHJvbWlzZSByZWplY3Rpb24nLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gQnJvd3NlcnMgc2hvdWxkIG5vdCB0cmlnZ2VyIGByZWplY3Rpb25IYW5kbGVkYCBldmVudCBpZiBpdCB3YXMgaGFuZGxlZCBoZXJlLCBOb2RlSlMgLSBzaG91bGRcbiAgICAgIHByb21pc2UuX2ggPSBpc05vZGUgfHwgaXNVbmhhbmRsZWQocHJvbWlzZSkgPyAyIDogMTtcbiAgICB9IHByb21pc2UuX2EgPSB1bmRlZmluZWQ7XG4gICAgaWYoYWJydXB0KXRocm93IGFicnVwdC5lcnJvcjtcbiAgfSk7XG59O1xudmFyIGlzVW5oYW5kbGVkID0gZnVuY3Rpb24ocHJvbWlzZSl7XG4gIGlmKHByb21pc2UuX2ggPT0gMSlyZXR1cm4gZmFsc2U7XG4gIHZhciBjaGFpbiA9IHByb21pc2UuX2EgfHwgcHJvbWlzZS5fY1xuICAgICwgaSAgICAgPSAwXG4gICAgLCByZWFjdGlvbjtcbiAgd2hpbGUoY2hhaW4ubGVuZ3RoID4gaSl7XG4gICAgcmVhY3Rpb24gPSBjaGFpbltpKytdO1xuICAgIGlmKHJlYWN0aW9uLmZhaWwgfHwgIWlzVW5oYW5kbGVkKHJlYWN0aW9uLnByb21pc2UpKXJldHVybiBmYWxzZTtcbiAgfSByZXR1cm4gdHJ1ZTtcbn07XG52YXIgb25IYW5kbGVVbmhhbmRsZWQgPSBmdW5jdGlvbihwcm9taXNlKXtcbiAgdGFzay5jYWxsKGdsb2JhbCwgZnVuY3Rpb24oKXtcbiAgICB2YXIgaGFuZGxlcjtcbiAgICBpZihpc05vZGUpe1xuICAgICAgcHJvY2Vzcy5lbWl0KCdyZWplY3Rpb25IYW5kbGVkJywgcHJvbWlzZSk7XG4gICAgfSBlbHNlIGlmKGhhbmRsZXIgPSBnbG9iYWwub25yZWplY3Rpb25oYW5kbGVkKXtcbiAgICAgIGhhbmRsZXIoe3Byb21pc2U6IHByb21pc2UsIHJlYXNvbjogcHJvbWlzZS5fdn0pO1xuICAgIH1cbiAgfSk7XG59O1xudmFyICRyZWplY3QgPSBmdW5jdGlvbih2YWx1ZSl7XG4gIHZhciBwcm9taXNlID0gdGhpcztcbiAgaWYocHJvbWlzZS5fZClyZXR1cm47XG4gIHByb21pc2UuX2QgPSB0cnVlO1xuICBwcm9taXNlID0gcHJvbWlzZS5fdyB8fCBwcm9taXNlOyAvLyB1bndyYXBcbiAgcHJvbWlzZS5fdiA9IHZhbHVlO1xuICBwcm9taXNlLl9zID0gMjtcbiAgaWYoIXByb21pc2UuX2EpcHJvbWlzZS5fYSA9IHByb21pc2UuX2Muc2xpY2UoKTtcbiAgbm90aWZ5KHByb21pc2UsIHRydWUpO1xufTtcbnZhciAkcmVzb2x2ZSA9IGZ1bmN0aW9uKHZhbHVlKXtcbiAgdmFyIHByb21pc2UgPSB0aGlzXG4gICAgLCB0aGVuO1xuICBpZihwcm9taXNlLl9kKXJldHVybjtcbiAgcHJvbWlzZS5fZCA9IHRydWU7XG4gIHByb21pc2UgPSBwcm9taXNlLl93IHx8IHByb21pc2U7IC8vIHVud3JhcFxuICB0cnkge1xuICAgIGlmKHByb21pc2UgPT09IHZhbHVlKXRocm93IFR5cGVFcnJvcihcIlByb21pc2UgY2FuJ3QgYmUgcmVzb2x2ZWQgaXRzZWxmXCIpO1xuICAgIGlmKHRoZW4gPSBpc1RoZW5hYmxlKHZhbHVlKSl7XG4gICAgICBtaWNyb3Rhc2soZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSB7X3c6IHByb21pc2UsIF9kOiBmYWxzZX07IC8vIHdyYXBcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB0aGVuLmNhbGwodmFsdWUsIGN0eCgkcmVzb2x2ZSwgd3JhcHBlciwgMSksIGN0eCgkcmVqZWN0LCB3cmFwcGVyLCAxKSk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgJHJlamVjdC5jYWxsKHdyYXBwZXIsIGUpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJvbWlzZS5fdiA9IHZhbHVlO1xuICAgICAgcHJvbWlzZS5fcyA9IDE7XG4gICAgICBub3RpZnkocHJvbWlzZSwgZmFsc2UpO1xuICAgIH1cbiAgfSBjYXRjaChlKXtcbiAgICAkcmVqZWN0LmNhbGwoe193OiBwcm9taXNlLCBfZDogZmFsc2V9LCBlKTsgLy8gd3JhcFxuICB9XG59O1xuXG4vLyBjb25zdHJ1Y3RvciBwb2x5ZmlsbFxuaWYoIVVTRV9OQVRJVkUpe1xuICAvLyAyNS40LjMuMSBQcm9taXNlKGV4ZWN1dG9yKVxuICAkUHJvbWlzZSA9IGZ1bmN0aW9uIFByb21pc2UoZXhlY3V0b3Ipe1xuICAgIGFuSW5zdGFuY2UodGhpcywgJFByb21pc2UsIFBST01JU0UsICdfaCcpO1xuICAgIGFGdW5jdGlvbihleGVjdXRvcik7XG4gICAgSW50ZXJuYWwuY2FsbCh0aGlzKTtcbiAgICB0cnkge1xuICAgICAgZXhlY3V0b3IoY3R4KCRyZXNvbHZlLCB0aGlzLCAxKSwgY3R4KCRyZWplY3QsIHRoaXMsIDEpKTtcbiAgICB9IGNhdGNoKGVycil7XG4gICAgICAkcmVqZWN0LmNhbGwodGhpcywgZXJyKTtcbiAgICB9XG4gIH07XG4gIEludGVybmFsID0gZnVuY3Rpb24gUHJvbWlzZShleGVjdXRvcil7XG4gICAgdGhpcy5fYyA9IFtdOyAgICAgICAgICAgICAvLyA8LSBhd2FpdGluZyByZWFjdGlvbnNcbiAgICB0aGlzLl9hID0gdW5kZWZpbmVkOyAgICAgIC8vIDwtIGNoZWNrZWQgaW4gaXNVbmhhbmRsZWQgcmVhY3Rpb25zXG4gICAgdGhpcy5fcyA9IDA7ICAgICAgICAgICAgICAvLyA8LSBzdGF0ZVxuICAgIHRoaXMuX2QgPSBmYWxzZTsgICAgICAgICAgLy8gPC0gZG9uZVxuICAgIHRoaXMuX3YgPSB1bmRlZmluZWQ7ICAgICAgLy8gPC0gdmFsdWVcbiAgICB0aGlzLl9oID0gMDsgICAgICAgICAgICAgIC8vIDwtIHJlamVjdGlvbiBzdGF0ZSwgMCAtIGRlZmF1bHQsIDEgLSBoYW5kbGVkLCAyIC0gdW5oYW5kbGVkXG4gICAgdGhpcy5fbiA9IGZhbHNlOyAgICAgICAgICAvLyA8LSBub3RpZnlcbiAgfTtcbiAgSW50ZXJuYWwucHJvdG90eXBlID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUtYWxsJykoJFByb21pc2UucHJvdG90eXBlLCB7XG4gICAgLy8gMjUuNC41LjMgUHJvbWlzZS5wcm90b3R5cGUudGhlbihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZClcbiAgICB0aGVuOiBmdW5jdGlvbiB0aGVuKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKXtcbiAgICAgIHZhciByZWFjdGlvbiAgICA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHNwZWNpZXNDb25zdHJ1Y3Rvcih0aGlzLCAkUHJvbWlzZSkpO1xuICAgICAgcmVhY3Rpb24ub2sgICAgID0gdHlwZW9mIG9uRnVsZmlsbGVkID09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IHRydWU7XG4gICAgICByZWFjdGlvbi5mYWlsICAgPSB0eXBlb2Ygb25SZWplY3RlZCA9PSAnZnVuY3Rpb24nICYmIG9uUmVqZWN0ZWQ7XG4gICAgICByZWFjdGlvbi5kb21haW4gPSBpc05vZGUgPyBwcm9jZXNzLmRvbWFpbiA6IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX2MucHVzaChyZWFjdGlvbik7XG4gICAgICBpZih0aGlzLl9hKXRoaXMuX2EucHVzaChyZWFjdGlvbik7XG4gICAgICBpZih0aGlzLl9zKW5vdGlmeSh0aGlzLCBmYWxzZSk7XG4gICAgICByZXR1cm4gcmVhY3Rpb24ucHJvbWlzZTtcbiAgICB9LFxuICAgIC8vIDI1LjQuNS4xIFByb21pc2UucHJvdG90eXBlLmNhdGNoKG9uUmVqZWN0ZWQpXG4gICAgJ2NhdGNoJzogZnVuY3Rpb24ob25SZWplY3RlZCl7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKHVuZGVmaW5lZCwgb25SZWplY3RlZCk7XG4gICAgfVxuICB9KTtcbiAgUHJvbWlzZUNhcGFiaWxpdHkgPSBmdW5jdGlvbigpe1xuICAgIHZhciBwcm9taXNlICA9IG5ldyBJbnRlcm5hbDtcbiAgICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICAgIHRoaXMucmVzb2x2ZSA9IGN0eCgkcmVzb2x2ZSwgcHJvbWlzZSwgMSk7XG4gICAgdGhpcy5yZWplY3QgID0gY3R4KCRyZWplY3QsIHByb21pc2UsIDEpO1xuICB9O1xufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7UHJvbWlzZTogJFByb21pc2V9KTtcbnJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJykoJFByb21pc2UsIFBST01JU0UpO1xucmVxdWlyZSgnLi9fc2V0LXNwZWNpZXMnKShQUk9NSVNFKTtcbldyYXBwZXIgPSByZXF1aXJlKCcuL19jb3JlJylbUFJPTUlTRV07XG5cbi8vIHN0YXRpY3NcbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsIFBST01JU0UsIHtcbiAgLy8gMjUuNC40LjUgUHJvbWlzZS5yZWplY3QocilcbiAgcmVqZWN0OiBmdW5jdGlvbiByZWplY3Qocil7XG4gICAgdmFyIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eSh0aGlzKVxuICAgICAgLCAkJHJlamVjdCAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgJCRyZWplY3Qocik7XG4gICAgcmV0dXJuIGNhcGFiaWxpdHkucHJvbWlzZTtcbiAgfVxufSk7XG4kZXhwb3J0KCRleHBvcnQuUyArICRleHBvcnQuRiAqIChMSUJSQVJZIHx8ICFVU0VfTkFUSVZFKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuNiBQcm9taXNlLnJlc29sdmUoeClcbiAgcmVzb2x2ZTogZnVuY3Rpb24gcmVzb2x2ZSh4KXtcbiAgICAvLyBpbnN0YW5jZW9mIGluc3RlYWQgb2YgaW50ZXJuYWwgc2xvdCBjaGVjayBiZWNhdXNlIHdlIHNob3VsZCBmaXggaXQgd2l0aG91dCByZXBsYWNlbWVudCBuYXRpdmUgUHJvbWlzZSBjb3JlXG4gICAgaWYoeCBpbnN0YW5jZW9mICRQcm9taXNlICYmIHNhbWVDb25zdHJ1Y3Rvcih4LmNvbnN0cnVjdG9yLCB0aGlzKSlyZXR1cm4geDtcbiAgICB2YXIgY2FwYWJpbGl0eSA9IG5ld1Byb21pc2VDYXBhYmlsaXR5KHRoaXMpXG4gICAgICAsICQkcmVzb2x2ZSAgPSBjYXBhYmlsaXR5LnJlc29sdmU7XG4gICAgJCRyZXNvbHZlKHgpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH1cbn0pO1xuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhKFVTRV9OQVRJVkUgJiYgcmVxdWlyZSgnLi9faXRlci1kZXRlY3QnKShmdW5jdGlvbihpdGVyKXtcbiAgJFByb21pc2UuYWxsKGl0ZXIpWydjYXRjaCddKGVtcHR5KTtcbn0pKSwgUFJPTUlTRSwge1xuICAvLyAyNS40LjQuMSBQcm9taXNlLmFsbChpdGVyYWJsZSlcbiAgYWxsOiBmdW5jdGlvbiBhbGwoaXRlcmFibGUpe1xuICAgIHZhciBDICAgICAgICAgID0gdGhpc1xuICAgICAgLCBjYXBhYmlsaXR5ID0gbmV3UHJvbWlzZUNhcGFiaWxpdHkoQylcbiAgICAgICwgcmVzb2x2ZSAgICA9IGNhcGFiaWxpdHkucmVzb2x2ZVxuICAgICAgLCByZWplY3QgICAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIGFicnVwdCA9IHBlcmZvcm0oZnVuY3Rpb24oKXtcbiAgICAgIHZhciB2YWx1ZXMgICAgPSBbXVxuICAgICAgICAsIGluZGV4ICAgICA9IDBcbiAgICAgICAgLCByZW1haW5pbmcgPSAxO1xuICAgICAgZm9yT2YoaXRlcmFibGUsIGZhbHNlLCBmdW5jdGlvbihwcm9taXNlKXtcbiAgICAgICAgdmFyICRpbmRleCAgICAgICAgPSBpbmRleCsrXG4gICAgICAgICAgLCBhbHJlYWR5Q2FsbGVkID0gZmFsc2U7XG4gICAgICAgIHZhbHVlcy5wdXNoKHVuZGVmaW5lZCk7XG4gICAgICAgIHJlbWFpbmluZysrO1xuICAgICAgICBDLnJlc29sdmUocHJvbWlzZSkudGhlbihmdW5jdGlvbih2YWx1ZSl7XG4gICAgICAgICAgaWYoYWxyZWFkeUNhbGxlZClyZXR1cm47XG4gICAgICAgICAgYWxyZWFkeUNhbGxlZCAgPSB0cnVlO1xuICAgICAgICAgIHZhbHVlc1skaW5kZXhdID0gdmFsdWU7XG4gICAgICAgICAgLS1yZW1haW5pbmcgfHwgcmVzb2x2ZSh2YWx1ZXMpO1xuICAgICAgICB9LCByZWplY3QpO1xuICAgICAgfSk7XG4gICAgICAtLXJlbWFpbmluZyB8fCByZXNvbHZlKHZhbHVlcyk7XG4gICAgfSk7XG4gICAgaWYoYWJydXB0KXJlamVjdChhYnJ1cHQuZXJyb3IpO1xuICAgIHJldHVybiBjYXBhYmlsaXR5LnByb21pc2U7XG4gIH0sXG4gIC8vIDI1LjQuNC40IFByb21pc2UucmFjZShpdGVyYWJsZSlcbiAgcmFjZTogZnVuY3Rpb24gcmFjZShpdGVyYWJsZSl7XG4gICAgdmFyIEMgICAgICAgICAgPSB0aGlzXG4gICAgICAsIGNhcGFiaWxpdHkgPSBuZXdQcm9taXNlQ2FwYWJpbGl0eShDKVxuICAgICAgLCByZWplY3QgICAgID0gY2FwYWJpbGl0eS5yZWplY3Q7XG4gICAgdmFyIGFicnVwdCA9IHBlcmZvcm0oZnVuY3Rpb24oKXtcbiAgICAgIGZvck9mKGl0ZXJhYmxlLCBmYWxzZSwgZnVuY3Rpb24ocHJvbWlzZSl7XG4gICAgICAgIEMucmVzb2x2ZShwcm9taXNlKS50aGVuKGNhcGFiaWxpdHkucmVzb2x2ZSwgcmVqZWN0KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIGlmKGFicnVwdClyZWplY3QoYWJydXB0LmVycm9yKTtcbiAgICByZXR1cm4gY2FwYWJpbGl0eS5wcm9taXNlO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG52YXIgJGF0ICA9IHJlcXVpcmUoJy4vX3N0cmluZy1hdCcpKHRydWUpO1xuXG4vLyAyMS4xLjMuMjcgU3RyaW5nLnByb3RvdHlwZVtAQGl0ZXJhdG9yXSgpXG5yZXF1aXJlKCcuL19pdGVyLWRlZmluZScpKFN0cmluZywgJ1N0cmluZycsIGZ1bmN0aW9uKGl0ZXJhdGVkKXtcbiAgdGhpcy5fdCA9IFN0cmluZyhpdGVyYXRlZCk7IC8vIHRhcmdldFxuICB0aGlzLl9pID0gMDsgICAgICAgICAgICAgICAgLy8gbmV4dCBpbmRleFxuLy8gMjEuMS41LjIuMSAlU3RyaW5nSXRlcmF0b3JQcm90b3R5cGUlLm5leHQoKVxufSwgZnVuY3Rpb24oKXtcbiAgdmFyIE8gICAgID0gdGhpcy5fdFxuICAgICwgaW5kZXggPSB0aGlzLl9pXG4gICAgLCBwb2ludDtcbiAgaWYoaW5kZXggPj0gTy5sZW5ndGgpcmV0dXJuIHt2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlfTtcbiAgcG9pbnQgPSAkYXQoTywgaW5kZXgpO1xuICB0aGlzLl9pICs9IHBvaW50Lmxlbmd0aDtcbiAgcmV0dXJuIHt2YWx1ZTogcG9pbnQsIGRvbmU6IGZhbHNlfTtcbn0pOyIsIid1c2Ugc3RyaWN0Jztcbi8vIEVDTUFTY3JpcHQgNiBzeW1ib2xzIHNoaW1cbnZhciBnbG9iYWwgICAgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgY29yZSAgICAgICAgICAgPSByZXF1aXJlKCcuL19jb3JlJylcbiAgLCBoYXMgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hhcycpXG4gICwgREVTQ1JJUFRPUlMgICAgPSByZXF1aXJlKCcuL19kZXNjcmlwdG9ycycpXG4gICwgJGV4cG9ydCAgICAgICAgPSByZXF1aXJlKCcuL19leHBvcnQnKVxuICAsIHJlZGVmaW5lICAgICAgID0gcmVxdWlyZSgnLi9fcmVkZWZpbmUnKVxuICAsIE1FVEEgICAgICAgICAgID0gcmVxdWlyZSgnLi9fbWV0YScpLktFWVxuICAsICRmYWlscyAgICAgICAgID0gcmVxdWlyZSgnLi9fZmFpbHMnKVxuICAsIHNoYXJlZCAgICAgICAgID0gcmVxdWlyZSgnLi9fc2hhcmVkJylcbiAgLCBzZXRUb1N0cmluZ1RhZyA9IHJlcXVpcmUoJy4vX3NldC10by1zdHJpbmctdGFnJylcbiAgLCB1aWQgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX3VpZCcpXG4gICwgd2tzICAgICAgICAgICAgPSByZXF1aXJlKCcuL193a3MnKVxuICAsIGtleU9mICAgICAgICAgID0gcmVxdWlyZSgnLi9fa2V5b2YnKVxuICAsIGVudW1LZXlzICAgICAgID0gcmVxdWlyZSgnLi9fZW51bS1rZXlzJylcbiAgLCBpc0FycmF5ICAgICAgICA9IHJlcXVpcmUoJy4vX2lzLWFycmF5JylcbiAgLCBhbk9iamVjdCAgICAgICA9IHJlcXVpcmUoJy4vX2FuLW9iamVjdCcpXG4gICwgdG9JT2JqZWN0ICAgICAgPSByZXF1aXJlKCcuL190by1pb2JqZWN0JylcbiAgLCB0b1ByaW1pdGl2ZSAgICA9IHJlcXVpcmUoJy4vX3RvLXByaW1pdGl2ZScpXG4gICwgY3JlYXRlRGVzYyAgICAgPSByZXF1aXJlKCcuL19wcm9wZXJ0eS1kZXNjJylcbiAgLCBfY3JlYXRlICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1jcmVhdGUnKVxuICAsIGdPUE5FeHQgICAgICAgID0gcmVxdWlyZSgnLi9fb2JqZWN0LWdvcG4tZXh0JylcbiAgLCAkR09QRCAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1nb3BkJylcbiAgLCAkRFAgICAgICAgICAgICA9IHJlcXVpcmUoJy4vX29iamVjdC1kcCcpXG4gICwgZ09QRCAgICAgICAgICAgPSAkR09QRC5mXG4gICwgZFAgICAgICAgICAgICAgPSAkRFAuZlxuICAsIGdPUE4gICAgICAgICAgID0gZ09QTkV4dC5mXG4gICwgJFN5bWJvbCAgICAgICAgPSBnbG9iYWwuU3ltYm9sXG4gICwgJEpTT04gICAgICAgICAgPSBnbG9iYWwuSlNPTlxuICAsIF9zdHJpbmdpZnkgICAgID0gJEpTT04gJiYgJEpTT04uc3RyaW5naWZ5XG4gICwgc2V0dGVyICAgICAgICAgPSBmYWxzZVxuICAsIFBST1RPVFlQRSAgICAgID0gJ3Byb3RvdHlwZSdcbiAgLCBISURERU4gICAgICAgICA9IHdrcygnX2hpZGRlbicpXG4gICwgVE9fUFJJTUlUSVZFICAgPSB3a3MoJ3RvUHJpbWl0aXZlJylcbiAgLCBpc0VudW0gICAgICAgICA9IHt9LnByb3BlcnR5SXNFbnVtZXJhYmxlXG4gICwgU3ltYm9sUmVnaXN0cnkgPSBzaGFyZWQoJ3N5bWJvbC1yZWdpc3RyeScpXG4gICwgQWxsU3ltYm9scyAgICAgPSBzaGFyZWQoJ3N5bWJvbHMnKVxuICAsIE9iamVjdFByb3RvICAgID0gT2JqZWN0W1BST1RPVFlQRV1cbiAgLCBVU0VfTkFUSVZFICAgICA9IHR5cGVvZiAkU3ltYm9sID09ICdmdW5jdGlvbidcbiAgLCBRT2JqZWN0ICAgICAgICA9IGdsb2JhbC5RT2JqZWN0O1xuXG4vLyBmYWxsYmFjayBmb3Igb2xkIEFuZHJvaWQsIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvdjgvaXNzdWVzL2RldGFpbD9pZD02ODdcbnZhciBzZXRTeW1ib2xEZXNjID0gREVTQ1JJUFRPUlMgJiYgJGZhaWxzKGZ1bmN0aW9uKCl7XG4gIHJldHVybiBfY3JlYXRlKGRQKHt9LCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uKCl7IHJldHVybiBkUCh0aGlzLCAnYScsIHt2YWx1ZTogN30pLmE7IH1cbiAgfSkpLmEgIT0gNztcbn0pID8gZnVuY3Rpb24oaXQsIGtleSwgRCl7XG4gIHZhciBwcm90b0Rlc2MgPSBnT1BEKE9iamVjdFByb3RvLCBrZXkpO1xuICBpZihwcm90b0Rlc2MpZGVsZXRlIE9iamVjdFByb3RvW2tleV07XG4gIGRQKGl0LCBrZXksIEQpO1xuICBpZihwcm90b0Rlc2MgJiYgaXQgIT09IE9iamVjdFByb3RvKWRQKE9iamVjdFByb3RvLCBrZXksIHByb3RvRGVzYyk7XG59IDogZFA7XG5cbnZhciB3cmFwID0gZnVuY3Rpb24odGFnKXtcbiAgdmFyIHN5bSA9IEFsbFN5bWJvbHNbdGFnXSA9IF9jcmVhdGUoJFN5bWJvbFtQUk9UT1RZUEVdKTtcbiAgc3ltLl9rID0gdGFnO1xuICBERVNDUklQVE9SUyAmJiBzZXR0ZXIgJiYgc2V0U3ltYm9sRGVzYyhPYmplY3RQcm90bywgdGFnLCB7XG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIHNldDogZnVuY3Rpb24odmFsdWUpe1xuICAgICAgaWYoaGFzKHRoaXMsIEhJRERFTikgJiYgaGFzKHRoaXNbSElEREVOXSwgdGFnKSl0aGlzW0hJRERFTl1bdGFnXSA9IGZhbHNlO1xuICAgICAgc2V0U3ltYm9sRGVzYyh0aGlzLCB0YWcsIGNyZWF0ZURlc2MoMSwgdmFsdWUpKTtcbiAgICB9XG4gIH0pO1xuICByZXR1cm4gc3ltO1xufTtcblxudmFyIGlzU3ltYm9sID0gVVNFX05BVElWRSAmJiB0eXBlb2YgJFN5bWJvbC5pdGVyYXRvciA9PSAnc3ltYm9sJyA/IGZ1bmN0aW9uKGl0KXtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PSAnc3ltYm9sJztcbn0gOiBmdW5jdGlvbihpdCl7XG4gIHJldHVybiBpdCBpbnN0YW5jZW9mICRTeW1ib2w7XG59O1xuXG52YXIgJGRlZmluZVByb3BlcnR5ID0gZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoaXQsIGtleSwgRCl7XG4gIGFuT2JqZWN0KGl0KTtcbiAga2V5ID0gdG9QcmltaXRpdmUoa2V5LCB0cnVlKTtcbiAgYW5PYmplY3QoRCk7XG4gIGlmKGhhcyhBbGxTeW1ib2xzLCBrZXkpKXtcbiAgICBpZighRC5lbnVtZXJhYmxlKXtcbiAgICAgIGlmKCFoYXMoaXQsIEhJRERFTikpZFAoaXQsIEhJRERFTiwgY3JlYXRlRGVzYygxLCB7fSkpO1xuICAgICAgaXRbSElEREVOXVtrZXldID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYoaGFzKGl0LCBISURERU4pICYmIGl0W0hJRERFTl1ba2V5XSlpdFtISURERU5dW2tleV0gPSBmYWxzZTtcbiAgICAgIEQgPSBfY3JlYXRlKEQsIHtlbnVtZXJhYmxlOiBjcmVhdGVEZXNjKDAsIGZhbHNlKX0pO1xuICAgIH0gcmV0dXJuIHNldFN5bWJvbERlc2MoaXQsIGtleSwgRCk7XG4gIH0gcmV0dXJuIGRQKGl0LCBrZXksIEQpO1xufTtcbnZhciAkZGVmaW5lUHJvcGVydGllcyA9IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoaXQsIFApe1xuICBhbk9iamVjdChpdCk7XG4gIHZhciBrZXlzID0gZW51bUtleXMoUCA9IHRvSU9iamVjdChQKSlcbiAgICAsIGkgICAgPSAwXG4gICAgLCBsID0ga2V5cy5sZW5ndGhcbiAgICAsIGtleTtcbiAgd2hpbGUobCA+IGkpJGRlZmluZVByb3BlcnR5KGl0LCBrZXkgPSBrZXlzW2krK10sIFBba2V5XSk7XG4gIHJldHVybiBpdDtcbn07XG52YXIgJGNyZWF0ZSA9IGZ1bmN0aW9uIGNyZWF0ZShpdCwgUCl7XG4gIHJldHVybiBQID09PSB1bmRlZmluZWQgPyBfY3JlYXRlKGl0KSA6ICRkZWZpbmVQcm9wZXJ0aWVzKF9jcmVhdGUoaXQpLCBQKTtcbn07XG52YXIgJHByb3BlcnR5SXNFbnVtZXJhYmxlID0gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoa2V5KXtcbiAgdmFyIEUgPSBpc0VudW0uY2FsbCh0aGlzLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgcmV0dXJuIEUgfHwgIWhhcyh0aGlzLCBrZXkpIHx8ICFoYXMoQWxsU3ltYm9scywga2V5KSB8fCBoYXModGhpcywgSElEREVOKSAmJiB0aGlzW0hJRERFTl1ba2V5XSA/IEUgOiB0cnVlO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGl0LCBrZXkpe1xuICB2YXIgRCA9IGdPUEQoaXQgPSB0b0lPYmplY3QoaXQpLCBrZXkgPSB0b1ByaW1pdGl2ZShrZXksIHRydWUpKTtcbiAgaWYoRCAmJiBoYXMoQWxsU3ltYm9scywga2V5KSAmJiAhKGhhcyhpdCwgSElEREVOKSAmJiBpdFtISURERU5dW2tleV0pKUQuZW51bWVyYWJsZSA9IHRydWU7XG4gIHJldHVybiBEO1xufTtcbnZhciAkZ2V0T3duUHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoaXQpe1xuICB2YXIgbmFtZXMgID0gZ09QTih0b0lPYmplY3QoaXQpKVxuICAgICwgcmVzdWx0ID0gW11cbiAgICAsIGkgICAgICA9IDBcbiAgICAsIGtleTtcbiAgd2hpbGUobmFtZXMubGVuZ3RoID4gaSlpZighaGFzKEFsbFN5bWJvbHMsIGtleSA9IG5hbWVzW2krK10pICYmIGtleSAhPSBISURERU4gJiYga2V5ICE9IE1FVEEpcmVzdWx0LnB1c2goa2V5KTtcbiAgcmV0dXJuIHJlc3VsdDtcbn07XG52YXIgJGdldE93blByb3BlcnR5U3ltYm9scyA9IGZ1bmN0aW9uIGdldE93blByb3BlcnR5U3ltYm9scyhpdCl7XG4gIHZhciBuYW1lcyAgPSBnT1BOKHRvSU9iamVjdChpdCkpXG4gICAgLCByZXN1bHQgPSBbXVxuICAgICwgaSAgICAgID0gMFxuICAgICwga2V5O1xuICB3aGlsZShuYW1lcy5sZW5ndGggPiBpKWlmKGhhcyhBbGxTeW1ib2xzLCBrZXkgPSBuYW1lc1tpKytdKSlyZXN1bHQucHVzaChBbGxTeW1ib2xzW2tleV0pO1xuICByZXR1cm4gcmVzdWx0O1xufTtcbnZhciAkc3RyaW5naWZ5ID0gZnVuY3Rpb24gc3RyaW5naWZ5KGl0KXtcbiAgaWYoaXQgPT09IHVuZGVmaW5lZCB8fCBpc1N5bWJvbChpdCkpcmV0dXJuOyAvLyBJRTggcmV0dXJucyBzdHJpbmcgb24gdW5kZWZpbmVkXG4gIHZhciBhcmdzID0gW2l0XVxuICAgICwgaSAgICA9IDFcbiAgICAsIHJlcGxhY2VyLCAkcmVwbGFjZXI7XG4gIHdoaWxlKGFyZ3VtZW50cy5sZW5ndGggPiBpKWFyZ3MucHVzaChhcmd1bWVudHNbaSsrXSk7XG4gIHJlcGxhY2VyID0gYXJnc1sxXTtcbiAgaWYodHlwZW9mIHJlcGxhY2VyID09ICdmdW5jdGlvbicpJHJlcGxhY2VyID0gcmVwbGFjZXI7XG4gIGlmKCRyZXBsYWNlciB8fCAhaXNBcnJheShyZXBsYWNlcikpcmVwbGFjZXIgPSBmdW5jdGlvbihrZXksIHZhbHVlKXtcbiAgICBpZigkcmVwbGFjZXIpdmFsdWUgPSAkcmVwbGFjZXIuY2FsbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICBpZighaXNTeW1ib2wodmFsdWUpKXJldHVybiB2YWx1ZTtcbiAgfTtcbiAgYXJnc1sxXSA9IHJlcGxhY2VyO1xuICByZXR1cm4gX3N0cmluZ2lmeS5hcHBseSgkSlNPTiwgYXJncyk7XG59O1xudmFyIEJVR0dZX0pTT04gPSAkZmFpbHMoZnVuY3Rpb24oKXtcbiAgdmFyIFMgPSAkU3ltYm9sKCk7XG4gIC8vIE1TIEVkZ2UgY29udmVydHMgc3ltYm9sIHZhbHVlcyB0byBKU09OIGFzIHt9XG4gIC8vIFdlYktpdCBjb252ZXJ0cyBzeW1ib2wgdmFsdWVzIHRvIEpTT04gYXMgbnVsbFxuICAvLyBWOCB0aHJvd3Mgb24gYm94ZWQgc3ltYm9sc1xuICByZXR1cm4gX3N0cmluZ2lmeShbU10pICE9ICdbbnVsbF0nIHx8IF9zdHJpbmdpZnkoe2E6IFN9KSAhPSAne30nIHx8IF9zdHJpbmdpZnkoT2JqZWN0KFMpKSAhPSAne30nO1xufSk7XG5cbi8vIDE5LjQuMS4xIFN5bWJvbChbZGVzY3JpcHRpb25dKVxuaWYoIVVTRV9OQVRJVkUpe1xuICAkU3ltYm9sID0gZnVuY3Rpb24gU3ltYm9sKCl7XG4gICAgaWYodGhpcyBpbnN0YW5jZW9mICRTeW1ib2wpdGhyb3cgVHlwZUVycm9yKCdTeW1ib2wgaXMgbm90IGEgY29uc3RydWN0b3IhJyk7XG4gICAgcmV0dXJuIHdyYXAodWlkKGFyZ3VtZW50cy5sZW5ndGggPiAwID8gYXJndW1lbnRzWzBdIDogdW5kZWZpbmVkKSk7XG4gIH07XG4gIHJlZGVmaW5lKCRTeW1ib2xbUFJPVE9UWVBFXSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKXtcbiAgICByZXR1cm4gdGhpcy5faztcbiAgfSk7XG5cbiAgJEdPUEQuZiA9ICRnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG4gICREUC5mICAgPSAkZGVmaW5lUHJvcGVydHk7XG4gIHJlcXVpcmUoJy4vX29iamVjdC1nb3BuJykuZiA9IGdPUE5FeHQuZiA9ICRnZXRPd25Qcm9wZXJ0eU5hbWVzO1xuICByZXF1aXJlKCcuL19vYmplY3QtcGllJykuZiAgPSAkcHJvcGVydHlJc0VudW1lcmFibGVcbiAgcmVxdWlyZSgnLi9fb2JqZWN0LWdvcHMnKS5mID0gJGdldE93blByb3BlcnR5U3ltYm9scztcblxuICBpZihERVNDUklQVE9SUyAmJiAhcmVxdWlyZSgnLi9fbGlicmFyeScpKXtcbiAgICByZWRlZmluZShPYmplY3RQcm90bywgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJHByb3BlcnR5SXNFbnVtZXJhYmxlLCB0cnVlKTtcbiAgfVxufVxuXG4kZXhwb3J0KCRleHBvcnQuRyArICRleHBvcnQuVyArICRleHBvcnQuRiAqICFVU0VfTkFUSVZFLCB7U3ltYm9sOiAkU3ltYm9sfSk7XG5cbi8vIDE5LjQuMi4yIFN5bWJvbC5oYXNJbnN0YW5jZVxuLy8gMTkuNC4yLjMgU3ltYm9sLmlzQ29uY2F0U3ByZWFkYWJsZVxuLy8gMTkuNC4yLjQgU3ltYm9sLml0ZXJhdG9yXG4vLyAxOS40LjIuNiBTeW1ib2wubWF0Y2hcbi8vIDE5LjQuMi44IFN5bWJvbC5yZXBsYWNlXG4vLyAxOS40LjIuOSBTeW1ib2wuc2VhcmNoXG4vLyAxOS40LjIuMTAgU3ltYm9sLnNwZWNpZXNcbi8vIDE5LjQuMi4xMSBTeW1ib2wuc3BsaXRcbi8vIDE5LjQuMi4xMiBTeW1ib2wudG9QcmltaXRpdmVcbi8vIDE5LjQuMi4xMyBTeW1ib2wudG9TdHJpbmdUYWdcbi8vIDE5LjQuMi4xNCBTeW1ib2wudW5zY29wYWJsZXNcbmZvcih2YXIgc3ltYm9scyA9IChcbiAgJ2hhc0luc3RhbmNlLGlzQ29uY2F0U3ByZWFkYWJsZSxpdGVyYXRvcixtYXRjaCxyZXBsYWNlLHNlYXJjaCxzcGVjaWVzLHNwbGl0LHRvUHJpbWl0aXZlLHRvU3RyaW5nVGFnLHVuc2NvcGFibGVzJ1xuKS5zcGxpdCgnLCcpLCBpID0gMDsgc3ltYm9scy5sZW5ndGggPiBpOyApe1xuICB2YXIga2V5ICAgICA9IHN5bWJvbHNbaSsrXVxuICAgICwgV3JhcHBlciA9IGNvcmUuU3ltYm9sXG4gICAgLCBzeW0gICAgID0gd2tzKGtleSk7XG4gIGlmKCEoa2V5IGluIFdyYXBwZXIpKWRQKFdyYXBwZXIsIGtleSwge3ZhbHVlOiBVU0VfTkFUSVZFID8gc3ltIDogd3JhcChzeW0pfSk7XG59O1xuXG4vLyBEb24ndCB1c2Ugc2V0dGVycyBpbiBRdCBTY3JpcHQsIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy8xNzNcbmlmKCFRT2JqZWN0IHx8ICFRT2JqZWN0W1BST1RPVFlQRV0gfHwgIVFPYmplY3RbUFJPVE9UWVBFXS5maW5kQ2hpbGQpc2V0dGVyID0gdHJ1ZTtcblxuJGV4cG9ydCgkZXhwb3J0LlMgKyAkZXhwb3J0LkYgKiAhVVNFX05BVElWRSwgJ1N5bWJvbCcsIHtcbiAgLy8gMTkuNC4yLjEgU3ltYm9sLmZvcihrZXkpXG4gICdmb3InOiBmdW5jdGlvbihrZXkpe1xuICAgIHJldHVybiBoYXMoU3ltYm9sUmVnaXN0cnksIGtleSArPSAnJylcbiAgICAgID8gU3ltYm9sUmVnaXN0cnlba2V5XVxuICAgICAgOiBTeW1ib2xSZWdpc3RyeVtrZXldID0gJFN5bWJvbChrZXkpO1xuICB9LFxuICAvLyAxOS40LjIuNSBTeW1ib2wua2V5Rm9yKHN5bSlcbiAga2V5Rm9yOiBmdW5jdGlvbiBrZXlGb3Ioa2V5KXtcbiAgICBpZihpc1N5bWJvbChrZXkpKXJldHVybiBrZXlPZihTeW1ib2xSZWdpc3RyeSwga2V5KTtcbiAgICB0aHJvdyBUeXBlRXJyb3Ioa2V5ICsgJyBpcyBub3QgYSBzeW1ib2whJyk7XG4gIH0sXG4gIHVzZVNldHRlcjogZnVuY3Rpb24oKXsgc2V0dGVyID0gdHJ1ZTsgfSxcbiAgdXNlU2ltcGxlOiBmdW5jdGlvbigpeyBzZXR0ZXIgPSBmYWxzZTsgfVxufSk7XG5cbiRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogIVVTRV9OQVRJVkUsICdPYmplY3QnLCB7XG4gIC8vIDE5LjEuMi4yIE9iamVjdC5jcmVhdGUoTyBbLCBQcm9wZXJ0aWVzXSlcbiAgY3JlYXRlOiAkY3JlYXRlLFxuICAvLyAxOS4xLjIuNCBPYmplY3QuZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcylcbiAgZGVmaW5lUHJvcGVydHk6ICRkZWZpbmVQcm9wZXJ0eSxcbiAgLy8gMTkuMS4yLjMgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcylcbiAgZGVmaW5lUHJvcGVydGllczogJGRlZmluZVByb3BlcnRpZXMsXG4gIC8vIDE5LjEuMi42IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUClcbiAgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yOiAkZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yLFxuICAvLyAxOS4xLjIuNyBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhPKVxuICBnZXRPd25Qcm9wZXJ0eU5hbWVzOiAkZ2V0T3duUHJvcGVydHlOYW1lcyxcbiAgLy8gMTkuMS4yLjggT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhPKVxuICBnZXRPd25Qcm9wZXJ0eVN5bWJvbHM6ICRnZXRPd25Qcm9wZXJ0eVN5bWJvbHNcbn0pO1xuXG4vLyAyNC4zLjIgSlNPTi5zdHJpbmdpZnkodmFsdWUgWywgcmVwbGFjZXIgWywgc3BhY2VdXSlcbiRKU09OICYmICRleHBvcnQoJGV4cG9ydC5TICsgJGV4cG9ydC5GICogKCFVU0VfTkFUSVZFIHx8IEJVR0dZX0pTT04pLCAnSlNPTicsIHtzdHJpbmdpZnk6ICRzdHJpbmdpZnl9KTtcblxuLy8gMTkuNC4zLjQgU3ltYm9sLnByb3RvdHlwZVtAQHRvUHJpbWl0aXZlXShoaW50KVxuJFN5bWJvbFtQUk9UT1RZUEVdW1RPX1BSSU1JVElWRV0gfHwgcmVxdWlyZSgnLi9faGlkZScpKCRTeW1ib2xbUFJPVE9UWVBFXSwgVE9fUFJJTUlUSVZFLCAkU3ltYm9sW1BST1RPVFlQRV0udmFsdWVPZik7XG4vLyAxOS40LjMuNSBTeW1ib2wucHJvdG90eXBlW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZygkU3ltYm9sLCAnU3ltYm9sJyk7XG4vLyAyMC4yLjEuOSBNYXRoW0BAdG9TdHJpbmdUYWddXG5zZXRUb1N0cmluZ1RhZyhNYXRoLCAnTWF0aCcsIHRydWUpO1xuLy8gMjQuMy4zIEpTT05bQEB0b1N0cmluZ1RhZ11cbnNldFRvU3RyaW5nVGFnKGdsb2JhbC5KU09OLCAnSlNPTicsIHRydWUpOyIsInJlcXVpcmUoJy4vZXM2LmFycmF5Lml0ZXJhdG9yJyk7XG52YXIgZ2xvYmFsICAgICAgICA9IHJlcXVpcmUoJy4vX2dsb2JhbCcpXG4gICwgaGlkZSAgICAgICAgICA9IHJlcXVpcmUoJy4vX2hpZGUnKVxuICAsIEl0ZXJhdG9ycyAgICAgPSByZXF1aXJlKCcuL19pdGVyYXRvcnMnKVxuICAsIFRPX1NUUklOR19UQUcgPSByZXF1aXJlKCcuL193a3MnKSgndG9TdHJpbmdUYWcnKTtcblxuZm9yKHZhciBjb2xsZWN0aW9ucyA9IFsnTm9kZUxpc3QnLCAnRE9NVG9rZW5MaXN0JywgJ01lZGlhTGlzdCcsICdTdHlsZVNoZWV0TGlzdCcsICdDU1NSdWxlTGlzdCddLCBpID0gMDsgaSA8IDU7IGkrKyl7XG4gIHZhciBOQU1FICAgICAgID0gY29sbGVjdGlvbnNbaV1cbiAgICAsIENvbGxlY3Rpb24gPSBnbG9iYWxbTkFNRV1cbiAgICAsIHByb3RvICAgICAgPSBDb2xsZWN0aW9uICYmIENvbGxlY3Rpb24ucHJvdG90eXBlO1xuICBpZihwcm90byAmJiAhcHJvdG9bVE9fU1RSSU5HX1RBR10paGlkZShwcm90bywgVE9fU1RSSU5HX1RBRywgTkFNRSk7XG4gIEl0ZXJhdG9yc1tOQU1FXSA9IEl0ZXJhdG9ycy5BcnJheTtcbn0iLCJcbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL1xuXG52YXIgZ2xvYmFsID0gKGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSkoKTtcblxuLyoqXG4gKiBXZWJTb2NrZXQgY29uc3RydWN0b3IuXG4gKi9cblxudmFyIFdlYlNvY2tldCA9IGdsb2JhbC5XZWJTb2NrZXQgfHwgZ2xvYmFsLk1veldlYlNvY2tldDtcblxuLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYlNvY2tldCA/IHdzIDogbnVsbDtcblxuLyoqXG4gKiBXZWJTb2NrZXQgY29uc3RydWN0b3IuXG4gKlxuICogVGhlIHRoaXJkIGBvcHRzYCBvcHRpb25zIG9iamVjdCBnZXRzIGlnbm9yZWQgaW4gd2ViIGJyb3dzZXJzLCBzaW5jZSBpdCdzXG4gKiBub24tc3RhbmRhcmQsIGFuZCB0aHJvd3MgYSBUeXBlRXJyb3IgaWYgcGFzc2VkIHRvIHRoZSBjb25zdHJ1Y3Rvci5cbiAqIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2VpbmFyb3Mvd3MvaXNzdWVzLzIyN1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmlcbiAqIEBwYXJhbSB7QXJyYXl9IHByb3RvY29scyAob3B0aW9uYWwpXG4gKiBAcGFyYW0ge09iamVjdCkgb3B0cyAob3B0aW9uYWwpXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHdzKHVyaSwgcHJvdG9jb2xzLCBvcHRzKSB7XG4gIHZhciBpbnN0YW5jZTtcbiAgaWYgKHByb3RvY29scykge1xuICAgIGluc3RhbmNlID0gbmV3IFdlYlNvY2tldCh1cmksIHByb3RvY29scyk7XG4gIH0gZWxzZSB7XG4gICAgaW5zdGFuY2UgPSBuZXcgV2ViU29ja2V0KHVyaSk7XG4gIH1cbiAgcmV0dXJuIGluc3RhbmNlO1xufVxuXG5pZiAoV2ViU29ja2V0KSB3cy5wcm90b3R5cGUgPSBXZWJTb2NrZXQucHJvdG90eXBlO1xuIl19
