import lfo from 'waves-lfo';

let phrase = {};
const recorder = new lfo.sinks.DataRecorder({
	//frameSize: 3,
	//separateArrays: true
});

const updatePhrase = (data) => {
	// make it directly compatible with xmm phrases :
	console.log(data);
	phrase = {};
	phrase.bimodal = false;
	phrase.dimension = 3;
	phrase.dimension_input = 0;
	phrase.column_names = ['magnitude', 'frequency', 'periodicity'];
	phrase.data = [];
	for(let vecid in data.data) {
		for(let id in data.data[vecid]) {
			phrase.data.push(data.data[vecid][id]);
		}
	}
	phrase.length = data.time.length;
	recorder.retrieve().then(updatePhrase).catch((err) => console.error(err.stack));
};

recorder.retrieve().then(updatePhrase).catch((err) => console.error(err.stack));



export default class DataRecorder extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
			frameSize: 3,
			separateArrays: true
		}
		super(options, defaults);

		recorder.params.frameSize = this.params.frameSize;
		recorder.params.separateArrays = this.params.separateArrays;
		super.connect(recorder);
		super.initialize();
	}

	start() {
		recorder.start();
		//console.log(this.recorder.params.separateArrays);
	}

	stop() {
		recorder.stop();
	}

	getRecordedPhrase() {
		return phrase;
	}
}
