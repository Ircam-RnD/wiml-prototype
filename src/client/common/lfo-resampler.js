import * as lfo from "waves-lfo";

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

// ========================================================== //
// ===================== resampler lfo ====================== //
// ========================================================== //

export default class Resampler extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
			frameSize: 1,
			period: 20
		};
		super(defaults, options);

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
		this.appendData = (() => {
			if(this.currentData.length === 0) {
				// setTimeout(this.appendData.bind(this), this.params.period)
				return;
			}
			if(!this.running) return;

			this.counter++;
			this.time = this.counter * this.params.period;
			//this.time = this.lastTime;
			this.outFrame.set(this.currentData, 0);
			this.output();

			// let nowTime = performance.now();
			// let inaccuracy = (nowTime - this.lastTime - this.params.period) % this.params.period;
			// let nextInterval = this.params.period - inaccuracy;

			// this.outFrame.set(this.currentData, 0);
			// this.output();

			// this.lastTime = nowTime;
			// this.time += nextInterval;
			// console.log(this.time);
			// setTimeout(this.appendData.bind(this), nextInterval);
		});
	}

	initialize() {
		super.initialize();
		this.start();
	}

	finalize() {
		super.finalize();
		this.stop();
	}

	// TODO : IMPROVE THE ACCURACY BY USING : setTimeout

	start() {
		if(this.running) return;
		this.running = true;
		this.currentData = [];

		this.intervalID = setInterval(this.appendData.bind(this), this.params.period);

		// this.lastTime = performance.now();
		// this.time = this.params.period;
		// setTimeout(this.appendData.bind(this), this.params.period);
	}

	stop() {
		if(!this.running) return;
		this.running = false;
		//clearInterval(this.intervalID);
	}

	process(time, frame, metaData) {
		if(time === undefined) return;
		//console.log(time);
		this.lastTime = time;
		this.currentData = frame;
		this.metaData = metaData;
	}
}
