/*
 *	xmm decoder
 *	js port of the decoding part of XMM
 *	allows to filter input data from trained models
 * 	the training hes to be done with the XMM C++ library
 */

// get the inverse_covariances matrix of each of the GMM classes

// for each input data, compute the distance of the frame to each of the GMMs
// with the following equations :

// ================================= //
// as in xmmGaussianDistribution.cpp //
// ================================= //

const componentLikelihood = (component, observation) => {
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

const likelihood = (observation, singleClassModel, singleClassModelResults) => {
	let coeffs = singleClassModel.mixture_coeffs;
	let components = singleClassModel.components;
	let res = singleClassModelResults;
	let p = 0;

	for(let c = 0; c < coeffs.length; c++) {
		p += coeffs[c] * componentLikelihood(components[c], observation);
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

const likelihoods = (observation, model, modelResults) => {
	let likelihoods = [];
	let models = model.models;
	let res = modelResults;

	let maxLogLikelihood = 0;
	let normConstInstant = 0;
	let normConstSmoothed = 0;

	for(let i=0; i<model.models.length; i++) {

		let singleResults = modelResults.singleClassModelResults[i];
		likelihood(observation, model.models[i], singleResults);

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
