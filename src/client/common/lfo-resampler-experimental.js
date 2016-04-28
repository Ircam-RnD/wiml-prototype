import * as lfo from 'waves-lfo';

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
			bufferDuration: 100, 	//ms
			outputRate: 50			//Hz
		}
		super(defaults, options);

		this.streamParams.frameSize = this.params.frameSize;
		this.streamParams.frameRate = this.params.outputRate;
		this.outputPeriod = 1000 / this.params.outputRate;
		this.streamParams.sourceSampleRate = 1000 / this.outputPeriod;

		this.running = false;
		this.counter = 0;
		this.inputBuffer = [];

		//======= callback function =======//
		this.fire = (() => {
			const now = performance.now();
			
			this.time = now;
			this.counter++;
			//this.time = this.counter * this.outputPeriod;

			const frameSize = this.streamParams.frameSize;
			const buf = this.inputBuffer;
			const del = this.params.bufferDuration;

			const nextInterval = this.outputPeriod - (now - this.lastNow);
			if(nextInterval < 0) nextInterval = this.outputPeriod;
			this.lastNow = now;
			setTimeout(this.fire.bind(this), nextInterval);

			if(buf.length === 0) {
				return;
			}
			if(buf.length === 1) { // beginning or period without incoming data > bufDur
				if(buf[0].date + del < now) { // period without incoming data > bufDur
					for(let i=0; i<frameSize; i++) {
						this.outFrame[i] = buf[0].frame[i];
					}
					this.output();
				}
				// then :
				return;
			}

			for(let i=0; i<buf.length-1; i++) {
				let l = buf[i],
					r = buf[i+1];
				if(l.date + del <= now && r.date + del > now) {
					let pct = (now - (l.date + del)) / (r.date - l.date);
					for(let j=0; j<frameSize; j++) {
						this.outFrame[j] = l.frame[j] + (r.frame[j] - l.frame[j]) * pct;
					}
					this.output();
					// remove useless frames :
					buf.splice(0, i);
					break;
				}
			}
			//console.log(buf.length);
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

	start() {
		if(this.running) return;
		this.running = true;

		this.lastNow = performance.now();
		setTimeout(this.fire.bind(this), this.params.outputPeriod);

		// this.intervalID = setInterval(this.fire.bind(this), this.outputPeriod);	}

	stop() {
		if(!this.running) return;
		this.running = false;
		//clearInterval(this.intervalID);
	}

	process(time, frame, metaData) {
		this.inputBuffer.push({
			date: performance.now(),
			frame: frame
		});
		this.metaData = metaData;
	}
}