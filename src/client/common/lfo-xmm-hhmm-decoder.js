import lfo from 'waves-lfo';

// simplified decoding algorithm :
// if(!forward_init) forward_init(obs); else forward_update(obs)
// for(model in models) model.updateAlphaWindow(); model.updateResults();
// updateResults();

//=================== THE EXPORTED CLASS ======================//

export default class XmmHhmmDecoder extends lfo.core.BaseLfo {
	constructor(options = {}) {
		const defaults = {
			likelihoodWindow: 5,
		};
		super(defaults, options);

		this.model = undefined;
		this.modelResults = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
		// original xmm modelResults fields :
		// instantLikelihoods, instantNormalizedLikelihoods,
		// smoothedLikelihoods, smoothedNormalizedLikelihoods,
		// smoothedLogLikelihoods, likeliest, outputValues, outputVariance
	}

	get likeliestLabel() {
		if(this.modelResults !== undefined) {
			if(this.modelResults.likeliest > -1) {
				return this.model.models[this.modelResults.likeliest].label;
			}
		}
		return 'unknown';
		//return('no estimation available');
	}

	process(time, frame, metaData) {

		//incoming frame is observation vector
		if(this.model === undefined) {
			console.log("no model loaded");
			return;
		}

		this.time = time;
		this.metaData = metaData;

		const outFrame = this.outFrame;

		likelihoods(frame, this.model, this.modelResults);			

		for(let i=0; i<this.model.models.length; i++) {
			outFrame[i] = this.modelResults.smoothed_normalized_likelihoods[i];
		}

		this.output();
	}

	setModel(model) {
		this.model = undefined;
		this.modelResults = undefined;

		// test if model is valid here (TODO : write a better test)
		if(model.models !== undefined) {
			this.model = model;
			let nmodels = model.models.length;
			this.modelResults = {
				instant_likelihoods: new Array(nmodels),
				smoothed_log_likelihoods: new Array(nmodels),
				smoothed_likelihoods: new Array(nmodels),
				instant_normalized_likelihoods: new Array(nmodels),
				smoothed_normalized_likelihoods: new Array(nmodels),
				likeliest: -1,
				singleClassModelResults: []
			};

			for(let i=0; i<model.models.length; i++) {

				this.modelResults.instant_likelihoods[i] = 0;
				this.modelResults.smoothed_log_likelihoods[i] = 0;
				this.modelResults.smoothed_likelihoods[i] = 0;
				this.modelResults.instant_normalized_likelihoods[i] = 0;
				this.modelResults.smoothed_normalized_likelihoods[i] = 0;

				let res = {};
				res.instant_likelihood = 0;
				res.log_likelihood = 0;
				res.likelihood_buffer = [];
				res.likelihood_buffer.length = this.likelihoodWindow;
				for(let j=0; j<this.likelihoodWindow; j++) {
					res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
				}
				this.modelResults.singleClassModelResults.push(res);
			}
		}

		this.initialize({ frameSize: this.model.models.length });
	}

	setLikelihoodWindow(newWindowSize) {
		this.likelihoodWindow = newWindowSize;
		if(this.model === undefined) return;
		let res = this.modelResults.singleClassModelResults;
		for(let i=0; i<this.model.models.length; i++) {
			res[i].likelihood_buffer = [];
			res[i].likelihood_buffer.length = this.likelihoodWindow;
			for(let j=0; j<this.likelihoodWindow; j++) {
				res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
			}
		}
	}

	setVarianceOffset() {
		// not used for now (need to implement updateInverseCovariance method)
	}
};