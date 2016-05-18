/*
 *	lfo-select : filters the output of previous lfo
 *	-----------------------------------------------
 *	you can plug any lfo into various lfo-selects to split its output
 * 	and visualize the splitted outputs in separate lfo-sinks for example
 */

import * as lfo from 'waves-lfo';

export default class Select extends lfo.core.BaseLfo {
	constructor(options = {}) {
		const defaults = {
			indexList: [],
			mode: "include" // can be exclude or include
		}
		super(defaults, options);

		// remove duplicate indices :
		let indexList = this.params.indexList;

		for(let i=0; i<indexList.length-1; i++) {
			for(let j=indexList.length-1; j>i; j--) {
				if(indexList[i] == indexList[j]) {
					indexList.splice(j, 1);
				}
			}
		}
		//console.log(indexList);

	}

	initialize(streamParams = {}) {
		this.inputFrameSize = streamParams.frameSize;
		this.streamParams.frameSize = this.inputFrameSize;
		if(this.params.mode === "exclude") {
			for(let i=this.params.indexList.length-1; i>=0; i--) {
				if(this.params.indexList[i] < this.inputFrameSize && this.params.indexList[i] >= 0) {
					this.streamParams.frameSize--;
				} else {
					this.params.indexList.splice(i, 1);
				}
			}
		} else if(this.params.mode === "include") {
			this.streamParams.frameSize = 0;
			for(let i=this.params.indexList.length-1; i>=0; i--) {
				if(this.params.indexList[i] < this.inputFrameSize && this.params.indexList[i] >= 0) {
					this.streamParams.frameSize++;
				} else {
					this.params.indexList.splice(i, 1);
				}
			}
		}
		super.initialize(this.streamParams);
	}

	// QUESTION : are frame.length in process and streamParams.frameSize in initialize the same value ?
	// ot is streamParams here to allow specification of "columns" (or "rows", whatever ...) ?
	// just in case, let's keep this.params.inputFrameSize for comparison
	// in this case the tricky one should be lfo.slicer -> have another look at it

	process(time, frame, metaData) {
		this.time = time;
		this.metaData = metaData;

		if(this.params.mode === "exclude") {
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
			for(let i=0; i<this.params.indexList.length; i++) {
				// fill with non-excluded indexes
			}
		} else if(this.params.mode === "include") {
			// RIGHT !!!
			for(let i=0; i<this.params.indexList.length; i++) {
				this.outFrame[i] = 0;//
				i++;
			}
		} else { // pass averything through
			this.outFrame.set(frame, 0);
		}

		this.output();
	}

}