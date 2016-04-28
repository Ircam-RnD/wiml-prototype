import * as lfo from "waves-lfo";

// ========================================================== //
// ==================== descriptors lfo ===================== //
// ========================================================== //

export default class PseudoYin extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
			frameSize: 3,
			// minInput: -360,
			// maxInput: 360,
			noiseThreshold: 0.1
		};
		super(defaults, options);

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

	initialize(inStreamParams = {}, outStreamParams = {}) {
		outStreamParams.frameSize = this.params.frameSize;
		super.initialize(inStreamParams, outStreamParams);
		console.log(this.streamParams.sourceSampleRate);

		// normalize frequency with maxFreq
		if(!this.streamParams.sourceSampleRate) {
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

	_mainAlgorithm() {

		// compute min, max and mean (and magnitude)
		let min, max;
		min = max = this.inputFrame[0];
		this.mean = 0;
		this.magnitude = 0;
		for(let i in this.inputFrame) {
			let val = this.inputFrame[i];
			this.magnitude += val * val;
			this.mean += val;
			if(val > max) {
				max = val;
			} else if(val < min) {
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
		let prevDelta = this.inputFrame[0] - this.mean;
		for(let i in this.inputFrame) {
			let delta = this.inputFrame[i] - this.mean;
			this.stdDev += delta * delta;
			if(prevDelta > this.noiseThreshold && delta < this.noiseThreshold) {
				this.crossings.push(i);
			}
			prevDelta = delta;
		}
		this.stdDev /= (this.inputFrame.length - 1);
		this.stdDev = Math.sqrt(this.stdDev);

		// compute mean of delta-T between crossings
		this.periodMean = 0;
		for(let i=1; i<this.crossings.length; i++) {
			this.periodMean += this.crossings[i] - this.crossings[i - 1];
		}
		this.periodMean /= (this.crossings.length - 1);

		// compute stdDev of delta-T between crossings
		this.periodStdDev = 0;
		for(let i=1; i<this.crossings.length; i++) {
			let deltaP = (this.crossings[i] - this.crossings[i - 1] - this.periodMean)
			this.periodStdDev += deltaP * deltaP;
		}
		if(this.crossings.length > 2) {
			this.periodStdDev = Math.sqrt(this.periodStdDev / (this.crossings.length - 2));
		}
	}

	setNoiseThreshold(thresh) {
		this.noiseThreshold = thresh;
	}

	// this one gets frames to analyze : compute magnitude, zero crossing rate, and periodicity
	process(time, frame, metaData) {
		this.time = time;
		this.inputFrame = frame;

		this._mainAlgorithm();

		this.amplitude = this.stdDev * 2.0; // empirical factor because we don't know a priori sensor range

		//this.frequency = Math.sqrt(this.crossings.length * 2.0 / this.inputFrame.length); // sqrt'ed normalized by nyquist freq
		this.frequency = this.crossings.length * 2.0 / this.inputFrame.length; // normalized by nyquist freq
		
		if(this.crossings.length > 2) {
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
}
