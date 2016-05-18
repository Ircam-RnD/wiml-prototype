/*
 *	xmm decoder
 *	js port of the decoding part of XMM
 *	allows to filter input data from trained models
 * 	the training hes to be done with the XMM C++ library
 */


// NOTE : the models and modelResults must follow a precise document structure :
// 	- 	models should work as exported by XMM (JSON)
//	- 	modelResults replace the variables that normally exist in the cpp classes, which are needed for the decoding.
//		modelResults (in the case of HMMs), contains the array singleClassHmmModelResults, each element of which
//		contains an array of singleClassGmmModelResults (the HMM states).
//		see the decoder lfops for implementation.


// ================================= //
//    as in xmmHmmSingleClass.cpp    //
// ================================= //

export const hmmUpdateAlphaWindow = (singleClassHmmModel, singleClassHmmModelResults) => {
	let m = singleClassHmmModel;
	let res = singleClassHmmModelResults;

	let nstates = m.parameters.states;
	
	res.likeliest_state = 0;
	let best_alpha = res.alpha_h[0][0] + res.alpha_h[1][0];
	for(let i=1; i<nstates; i++) {
		if((res.alpha_h[0][i] + res.alpha_h[1][i]) > best_alpha) {
			best_alpha = res.alpha_h[0][i] + res.alpha_h[1][i];
			res.likeliest_state = i;
		}
	}

	res.window_minindex = res.likeliest_state - nstates / 2;
	res.window_maxindex = res.likeliest_state + nstates / 2;
	res.window_minindex = res.window_minindex >= 0 ? res.window_minindex : 0;
	res.window_maxindex = res.window_maxindex <= nstates ? res.window_maxindex : nstates;
	res.window_normalization_constant = 0;
	for(let i=res.window_minindex; i<res.window_maxindex; i++) {
		res.window_normalization_constant += (res.alpha_h[0][i] + res.alpha_h[1][i]);
	}
}

export const hmmUpdateResults = (singleClassHmmModel, singleClassHmmModelResults) => {
	let m = singleClassHmmModel;
	let res = singleClassHmmModelResults;

	// IS THIS CORRECT  ? CHECK !
	res.likelihood_buffer.push(res.instant_likelihood);
	res.log_likelihood = 0;
	let bufSize = res.likelihood_buffer.length;
	for(let i=0; i<bufSize; i++) {
		res.log_likelihood += res.likelihood_buffer[i];
	}
	res.log_likelihood /= bufSize;

	res.progress = 0;
	for(let i=res.window_minindex; i<res.window_maxindex; i++) {
		res.progress += (res.alpha_h[0][i] + res.alpha_h[1][i] + res.alpha_h[2][i]) * i /
						res.window_normalization_constant;
	}
	res.progress /= (m.parameters.states - 1);
}

// ================================= //
//   as in xmmHierarchicalHmm.cpp    //
// ================================= //

export const hhmmLikelihoodAlpha = (exitNum, likelihoodVector, hhmmModel, hhmmModelResults) => {
	let m = hhmmModel;
	let res = hhmmModelResults;

	if(exitNum < 0) {
		//let l = 0;
		for(let i=0; i<m.models.length; i++) {
			likelihoodVector[i] = 0;
			for(let exit=0; exit<3; exit++) {
				for(let k=0; k<m.models[i].parameters.states; k++) {
					likelihoodVector[i] += res.singleClassHmmModelResults[i].alpha_h[exit][k];
				}
			}
		}
	} else {
		for(let i=0; i<m.models.length; i++) {
			likelihoodVector[i] = 0;
			for(let k=0; k<m.models[i].parameters.states; k++) {
				likelihoodVector[i] += res.singleClassHmmModelResults[i].alpha_h[exitNum][k];
			}
		}
	}
};

//============================================================================//

// get the inverse_covariances matrix of each of the GMM classes
// for each input data, compute the distance of the frame to each of the GMMs
// with the following equations :

// ================================= //
// as in xmmGaussianDistribution.cpp //
// ================================= //

export const gaussianComponentLikelihood = (observation, gaussianComponent) => {
	let component = gaussianComponent;
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
// TODO : decompose in a similar way to XMM cpp to be able to use obsProb

export const gmmLikelihood = (observation, singleClassGmmModel, singleClassGmmModelResults = {}) => {
	let coeffs = singleClassGmmModel.mixture_coeffs;
	//console.log(coeffs);
	//if(coeffs === undefined) coeffs = [1];
	let components = singleClassGmmModel.components;
	//let res = singleClassGmmModelResults;
	let p = 0;

	for(let c = 0; c < coeffs.length; c++) {
		p += coeffs[c] * gaussianComponentLikelihood(observation, components[c]);
	}

	//res.instant_likelihood = p;

	// as in xmmGmmSingleClass::updateResults() :
	// => moved to gmmLikelihoods() so that this function looks more like obsProb
	/*
	res.likelihood_buffer.unshift(p);
	res.likelihood_buffer.length--;
	res.log_likelihood = res.likelihood_buffer.reduce((a, b) => a + b, 0); // sum of all array values
	res.log_likelihood /= res.likelihood_buffer.length;
	//*/

	return p;
};

// ================================= //
//          as in xmmGmm.cpp         //
// ================================= //

export const gmmLikelihoods = (observation, gmmModel, gmmModelResults) => {
	let likelihoods = [];
	let models = gmmModel.models;
	let res = gmmModelResults;

	let maxLogLikelihood = 0;
	let normConstInstant = 0;
	let normConstSmoothed = 0;

	for(let i=0; i<models.length; i++) {

		let singleRes = res.singleClassGmmModelResults[i];
		singleRes.instant_likelihood = gmmLikelihood(observation, models[i], singleRes);

		// as in xmmGmmSingleClass::updateResults() (moved from gmmLikelihood) :
		singleRes.likelihood_buffer.unshift(singleRes.instant_likelihood);
		singleRes.likelihood_buffer.length--;
		singleRes.log_likelihood = singleRes.likelihood_buffer.reduce((a, b) => a + b, 0); // sum of all array values
		singleRes.log_likelihood /= singleRes.likelihood_buffer.length;

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

//============================================================================//

// DO WE REALLY NEED THIS ?

/*
class XmmSingleClassGmm {
	constructor(options = {}) {
		const defaults = {
			likelihoodWindow: 5,
		};
		super(defaults, options);

		this.model = undefined;
		this.results = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
	}

	setModel(model) {
		this.model = undefined;
		this.results = undefined;

		// test if model is valid here (TODO : write a better test)
		if(model !== undefined) {
			this.model = model;
			let nmodels = model.models.length;
			this.results = {
				instant_likelihood: new Array(nmodels),
				log_likelihood: new Array(nmodels),
				likelihood_buffer: new Array(nmodels),
				instant_normalized_likelihoods: new Array(nmodels),
				smoothed_normalized_likelihoods: new Array(nmodels),
				likeliest: -1,
				singleClassModelResults: []
			};

			for(let i=0; i<nmodels; i++) {

				this.results.instant_likelihoods[i] = 0;
				this.results.smoothed_log_likelihoods[i] = 0;
				this.results.smoothed_likelihoods[i] = 0;
				this.results.instant_normalized_likelihoods[i] = 0;
				this.results.smoothed_normalized_likelihoods[i] = 0;

				let res = {};
				res.instant_likelihood = 0;
				res.log_likelihood = 0;
				res.likelihood_buffer = [];
				res.likelihood_buffer.length = this.likelihoodWindow;
				for(let j=0; j<this.likelihoodWindow; j++) {
					res.likelihood_buffer[j] = 1 / this.likelihoodWindow;
				}
				this.results.singleClassModelResults.push(res);
			}
		}

		this.initialize({ frameSize: this.model.models.length });
	}

	likelihood(observation) {

	}

	// etc ...
}

class XmmSingleClassHmm {
	constructor(options = {}) {
		this.alpha_h = new Array(3);
		for(let i=0; i<3; i++) {
			alpha_h[i] = [];
		}

		this.prior = [];
		this.states = []; // these are XmmSingleClassGmm's

		this.results = {
			instant_likelihood: 0
		};

		this.forward_initialized = false;
		//this.previous_alpha = 
	}

	// ETC
}

*/
