// linear regression lfo for fixed samplerate multi-dimensional data streams
// based on rta_delta.c by Jean-Philippe Lambert

import * as lfo from 'waves-lfo';

export default class Delta extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
			order: 3,
			fill: 0,
			frameSize: 1
		}
		super(defaults, options);

		// order must be odd and > 3
		if(this.params.order < 3) {
			this.params.order = 3;
		} else if(this.params.order % 2 == 0) {
			this.params.order -= 1;
		}

		let halfFilterSize = Math.floor(this.params.order * 0.5);

		// weights for input vectors
		this.weights = new Float32Array(this.params.order);
		for(let i=0, filterValue=-halfFilterSize; i<this.params.order; i++, filterValue+=1) {
			this.weights[i] = filterValue;
		}

		// normalization factor
		this.normFactor = 0;
		for(let i=1; i<=halfFilterSize; i++) {
			this.normFactor += i*i;
		}
		this.normFactor = 0.5 / this.normFactor;

		this.ringBuffer = null;//new Float32Array(this.order * this.params.frameSize);
		this.ringIndex = 0;
	}

	initialize(inStreamParams = {}, outStreamParams = {}) {
		super.initialize(inStreamParams, outStreamParams);
		this.params.frameSize = this.streamParams.frameSize;
		this.ringBuffer = new Float32Array(this.params.order * this.params.frameSize);
	}

	reset() {
		super.reset();
		for(let i=0; i<this.ringBuffer.length; i++) {
			this.ringBuffer[i] = this.params.fill;
		}
	}

	process(time, frame, metaData) {
		const ringIndex = this.ringIndex;
		const frameSize = this.params.frameSize;
		const order = this.params.order;

		for(let i=0; i<frameSize; i++) {
			this.ringBuffer[ringIndex * frameSize + i] = frame[i];
			this.outFrame[i] = 0;
		}

		for(let i=0; i<order; i++) {
			for(let j=0; j<frameSize; j++) {
				this.outFrame[j] += this.ringBuffer[i * frameSize + j] * this.weights[i];
			}
		}

		for(let i=0; i<frameSize; i++) {
			this.outFrame[i] *= this.normFactor;
		}

		this.ringIndex = (ringIndex + 1) % order;

		// NOW DEAL WITH TIME :
		if(this.streamParams.sourceSampleRate) {
			time -= 0.5 * order / this.streamParams.sourceSampleRate;
		}

		//console.log(this.outFrame);
		this.output(time, this.outFrame, metaData);
	}
}