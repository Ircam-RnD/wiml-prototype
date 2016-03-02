import lfo from "waves-lfo";

// ========================================================== //
// ==================== descriptors lfo ===================== //
// ========================================================== //

export default class PseudoYin extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
			frameSize: 3,
			noiseThreshold: 0.05
		};
		super(defaults, options);

		this.mean = 0;
		this.magnitude = 0;
		this.stdDev = 0;
		this.crossings = [];
		this.periodMean = 0;
		this.periodStdDev = 0;
		this.noiseThreshold = this.params.noiseThreshold;
	}

	initialize(inStreamParams = {}, outStreamParams = {}) {
		outStreamParams.frameSize: this.params.frameSize;
		super.initialize(inStreamParams, outStreamParams);
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
		this.mean = (max - min) * 0.5;

		this.magnitude /= this.inputFrame.length;
		this.magnitude = Math.sqrt(this.magnitude);

		// compute signal stdDev and number of mean-crossings
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

		// TODO : improve periodicity algorithm !!!
		this.outFrame[0] = this.stdDev * 2;
		this.outFrame[1] = this.crossings.length * 5 / this.inputFrame.length;
		this.outFrame[2] = this.periodStdDev / this.inputFrame.length; // kind of non periodicity
		this.output();
	}
}
