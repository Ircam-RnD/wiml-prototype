// intensity : lfo returning an estimation of movement intensity (energy)
// uses derivation + integration to return to zero when there is no movement
// based on the intensity module developed by Fred Bevilacqua and Gael Dubus
// for the MusicBricks EU project

import * as lfo from 'waves-lfo';
import Delta from './lfo-delta';

// internal class : the complete algorithm needs linear regression as derivation

class IntensityCore extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
			integrationFactor: 0.8,
			outputGain: 0.005
		};
		super(defaults, options);

		this.inputDims = 0;

		super(defaults, options);
	}

	initialize(inStreamParams = {}, outStreamParams = {}) {
		this.inputFrameSize = inStreamParams.frameSize;
		this.frameAccumulator = new Float32Array(this.inputFrameSize);

		outStreamParams.frameSize = 1;
		super.initialize(inStreamParams, outStreamParams);

		for(let i=0; i<this.inputFrameSize; i++) {
			this.frameAccumulator[i] = 0;
		}
		//console.log(this.streamParams.frameSize + ' ' + this.inputFrameSize);
	}

	process(time, frame, metaData) {
		const factor = this.params.integrationFactor;
		const gain = this.params.outputGain;
		const inSize = this.inputFrameSize;
		const frameBuf = this.frameAccumulator;

		let outValue = 0;

		for(let i=0; i<inSize; i++) {
			let sqi = frame[i] * frame[i];
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
}

//======================================================//
//============= the real Intensity class ===============//
//======================================================//

export default class Intensity extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
		};
		super(defaults, options);

		this.delta = new Delta({
			order: 3
		});

		this.intensity = new IntensityCore({
		});

		this.delta.connect(this.intensity);

	}

	initialize(inStreamParams = {}, outStreamParams = {}) {
		this.delta.initialize(inStreamParams, outStreamParams);
	}

	connect(child) {
    	this.intensity.children.push(child);
    	child.parent = this.intensity;
	}

	process(time, frame, metaData) {
		this.delta.process(time, frame, metaData);
	}
}