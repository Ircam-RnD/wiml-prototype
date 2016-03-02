
import lfo from 'waves-lfo';
import Resampler from './lfo-resampler';
import PseudoYin from './lfo-pseudo-yin';


// ================ polyfill for performance.now ============= //
// --> https://gist.github.com/paulirish/5438650

(function(){

  if ("performance" in window == false) {
      window.performance = {};
  }
  
  Date.now = (Date.now || function () {  // thanks IE8
	  return new Date().getTime();
  });

  if ("now" in window.performance == false) {
    
    var nowOffset = Date.now();
    
    if (performance.timing && performance.timing.navigationStart) {
      nowOffset = performance.timing.navigationStart
    }

    window.performance.now = function now() {
      return Date.now() - nowOffset;
    }
  }

})();

// webkitAudioContext for safari, empty function for old android
// [ Audio not needed here ]
let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};

export default class InputProcessingChain extends lfo.core.BaseLfo {
	constructor(options = {}) {

		const defaults = {
			inputFrameSize: 1,
			windowSize: 128,
			hopSize: 64,
			period: 10
		};
		super(defaults, options);

		this.eventIn = new lfo.sources.EventIn({
			relative: true,
			frameSize: this.params.inputFrameSize,
			ctx: AudioContext
		});

		this.resampler = new Resampler({
			period: this.params.period // in milliseconds
		});

		this.filter = new lfo.operators.MovingMedian({
		//this.filter = new lfo.operators.MovingAverage({ // fill() function not recognized
			order: 1
		});

		this.framer = new lfo.operators.Framer({
			frameSize: this.params.windowSize * this.params.inputFrameSize,
			//frameRate: this.resampler.frameRate / (this.params.windowSize * this.params.inputFrameSize),
			hopSize: this.params.hopSize
			//centeredTimeTag: true
		});

		this.descr = new PseudoYin({
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

	start() {
		this.eventIn.start();
	}

	stop() {
		this.eventIn.stop();
	}

	connect(child) {
    	this.descr.children.push(child);
    	child.parent = this.descr;
	}

	process(time, frame, metaData) {
		//this.eventIn.process(performance.now(), [frame]);
		//console.log('Pseudo-Yin outFrame : ' + this.descr.outFrame);
		this.eventIn.process(time, frame, metaData);
	}

	preFramerConnect(dest) {
		this.filter.connect(dest);
	}
}

