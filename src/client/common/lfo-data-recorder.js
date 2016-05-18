import * as lfo from 'waves-lfo';

export default class DataRecorder extends lfo.sinks.DataRecorder {

	constructor(options = {}) {
		const defaults = {
			//frameSize: 3,
			separateArrays: true,
			bimodal: false,
			//column_names: ['magnitude', 'frequency', 'periodicity']
		}
		super(defaults, options);
		if(options.column_names !== undefined) {
			this.params.column_names = options.column_names.splice(0);
		}

		this.phrase = {};

		this.updatePhrase = ((data) => {
			//console.log(data.data);
			this.phrase = {};
			this.phrase.bimodal = this.params.bimodal;
			this.phrase.dimension = this.streamParams.frameSize;
			this.phrase.dimension_input = 0;
			this.phrase.column_names = this.params.column_names.splice(0);
			this.phrase.data = [];
			for(let vecid in data.data) {
				for(let id in data.data[vecid]) {
					this.phrase.data.push(data.data[vecid][id]);
				}
			}
			this.phrase.length = data.time.length;
			this.retrieve().then(this.updatePhrase.bind(this)).catch((err) => console.error(err.stack));			
		});

		this.retrieve().then(this.updatePhrase.bind(this)).catch((err) => console.error(err.stack));
	}

	initialize(streamParams = {}) {
		super.initialize(streamParams);
		this.phrase.dimension = this.streamParams.frameSize;
	}

	getRecordedPhrase() {
		return this.phrase;
	}
}
