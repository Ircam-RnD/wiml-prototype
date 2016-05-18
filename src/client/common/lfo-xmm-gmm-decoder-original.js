import * as lfo from 'waves-lfo';
import { gmmLikelihoods } from './xmm-decoder-common'

// get the inverse_covariances matrix of each of the GMM classes

// for each input data, compute the distance of the frame to each of the GMMs
// with the following equations :

// ================================= //
// as in xmmGaussianDistribution.cpp //
// ================================= //

const componentLikelihood = (observation, component) => {
	let euclidianDistance = 0.0;
	for(let l = 0; l < component.dimension; l++) {
		let tmp = 0.0;
		for(let k= 0; k < component.dimension; k++) {
			tmp += component.inverse_covariance[l * component.dimension + k] * (observation[k] - component.mean[k]);
		}
		euclidianDistance += (observation[l] - component.mean[l]) * tmp;
	}
	let p = Math.exp(-0.5 * euclidianDistance) / Math.sqrt(component.covariance_determinant * Math.pow(2 * Math.PI, component.dimension));

	if( p < 1e-180 || isNaN(p) || isNaN(Math.abs(p))) {
		p = 1e-180;
	}
	return p;
};

// ================================= //
//    as in xmmGmmSingleClass.cpp    //
// ================================= //

// -> in obsProb, called from likelihood, called from filter, called from GMM::filter

const likelihood = (observation, singleClassGmmModel, singleClassGmmModelResults) => {
	let coeffs = singleClassGmmModel.mixture_coeffs;
	let components = singleClassGmmModel.components;
	let res = singleClassGmmModelResults;
	let p = 0;

	for(let c = 0; c < coeffs.length; c++) {
		p += coeffs[c] * componentLikelihood(observation, components[c]);
	}

	res.instant_likelihood = p;
	res.likelihood_buffer.unshift(p);
	res.likelihood_buffer.length--;
	res.log_likelihood = res.likelihood_buffer.reduce((a, b) => a + b, 0) // sum of all array values
	res.log_likelihood /= res.likelihood_buffer.length;
};

// ================================= //
//          as in xmmGmm.cpp         //
// ================================= //

const likelihoods = (observation, gmmModel, gmmModelResults) => {
	let likelihoods = [];
	let models = gmmModel.models;
	let res = gmmModelResults;

	let maxLogLikelihood = 0;
	let normConstInstant = 0;
	let normConstSmoothed = 0;

	for(let i=0; i<models.length; i++) {

		let singleResults = res.singleClassGmmModelResults[i];
		likelihood(observation, models[i], singleResults);

		res.instant_likelihoods[i] = singleResults.instant_likelihood;
		res.smoothed_log_likelihoods[i] = singleResults.log_likelihood;
		res.smoothed_likelihoods[i] = Math.exp(res.smoothed_log_likelihoods[i]);
		res.instant_normalized_likelihoods[i] = res.instant_likelihoods[i];
		res.smoothed_normalized_likelihoods[i] = res.smoothed_likelihoods[i];

		normConstInstant += res.instant_normalized_likelihoods[i];
		normConstSmoothed += res.smoothed_normalized_likelihoods[i];

		if(i == 0 || res.smoothed_log_likelihoods[i] > maxLogLikelihood) {
			maxLogLikelihood = res.smoothed_log_likelihoods[i];
			res.likeliest = i;
		}
	}

	for(let i=0; i<model.models.length; i++) {

		res.instant_normalized_likelihoods[i] /= normConstInstant;
		res.smoothed_normalized_likelihoods[i] /= normConstSmoothed;
	}
};

// TODO : add reset() function (empty likelihood_buffer)

//=================== THE EXPORTED CLASS ======================//

export default class XmmGmmDecoder extends lfo.core.BaseLfo {
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
		//gmmLikelihoods(frame, this.model, this.modelResults);			

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
				singleClassGmmModelResults: []
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
				this.modelResults.singleClassGmmModelResults.push(res);
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
