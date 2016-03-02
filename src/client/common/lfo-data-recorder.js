import lfo from 'waves-lfo';

export default class DataRecorder extends lfo.sinks.DataRecorder {

	constructor(options = {}) {
		const defaults = {
			frameSize: 3,
			separateArrays: true
		}
		super(defaults, options);

		this.phrase = {};

		this.updatePhrase = ((data) => {
			console.log(data.data);
			this.phrase = {};
			this.phrase.bimodal = false;
			this.phrase.dimension = 3;
			this.phrase.dimension_input = 0;
			this.phrase.column_names = ['magnitude', 'frequency', 'periodicity'];
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

	getRecordedPhrase() {
		return this.phrase;
	}
}
