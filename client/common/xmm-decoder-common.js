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

"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var hmmUpdateAlphaWindow = function hmmUpdateAlphaWindow(singleClassHmmModel, singleClassHmmModelResults) {
	var m = singleClassHmmModel;
	var res = singleClassHmmModelResults;

	var nstates = m.parameters.states;

	res.likeliest_state = 0;
	var best_alpha = res.alpha_h[0][0] + res.alpha_h[1][0];
	for (var i = 1; i < nstates; i++) {
		if (res.alpha_h[0][i] + res.alpha_h[1][i] > best_alpha) {
			best_alpha = res.alpha_h[0][i] + res.alpha_h[1][i];
			res.likeliest_state = i;
		}
	}

	res.window_minindex = res.likeliest_state - nstates / 2;
	res.window_maxindex = res.likeliest_state + nstates / 2;
	res.window_minindex = res.window_minindex >= 0 ? res.window_minindex : 0;
	res.window_maxindex = res.window_maxindex <= nstates ? res.window_maxindex : nstates;
	res.window_normalization_constant = 0;
	for (var i = res.window_minindex; i < res.window_maxindex; i++) {
		res.window_normalization_constant += res.alpha_h[0][i] + res.alpha_h[1][i];
	}
};

exports.hmmUpdateAlphaWindow = hmmUpdateAlphaWindow;
var hmmUpdateResults = function hmmUpdateResults(singleClassHmmModel, singleClassHmmModelResults) {
	var m = singleClassHmmModel;
	var res = singleClassHmmModelResults;

	// IS THIS CORRECT  ? CHECK !
	res.likelihood_buffer.push(Math.log(res.instant_likelihood));
	res.log_likelihood = 0;
	var bufSize = res.likelihood_buffer.length;
	for (var i = 0; i < bufSize; i++) {
		res.log_likelihood += res.likelihood_buffer[i];
	}
	res.log_likelihood /= bufSize;

	res.progress = 0;
	for (var i = res.window_minindex; i < res.window_maxindex; i++) {
		res.progress += (res.alpha_h[0][i] + res.alpha_h[1][i] + res.alpha_h[2][i]) * i / res.window_normalization_constant;
	}
	res.progress /= m.parameters.states - 1;
};

exports.hmmUpdateResults = hmmUpdateResults;
// ================================= //
//   as in xmmHierarchicalHmm.cpp    //
// ================================= //

var hhmmLikelihoodAlpha = function hhmmLikelihoodAlpha(exitNum, likelihoodVector, hhmmModel, hhmmModelResults) {
	var m = hhmmModel;
	var res = hhmmModelResults;

	if (exitNum < 0) {
		//let l = 0;
		for (var i = 0; i < m.models.length; i++) {
			likelihoodVector[i] = 0;
			for (var exit = 0; exit < 3; exit++) {
				for (var k = 0; k < m.models[i].parameters.states; k++) {
					likelihoodVector[i] += res.singleClassHmmModelResults[i].alpha_h[exit][k];
				}
			}
		}
	} else {
		for (var i = 0; i < m.models.length; i++) {
			likelihoodVector[i] = 0;
			for (var k = 0; k < m.models[i].parameters.states; k++) {
				likelihoodVector[i] += res.singleClassHmmModelResults[i].alpha_h[exitNum][k];
			}
		}
	}
};

exports.hhmmLikelihoodAlpha = hhmmLikelihoodAlpha;
//============================================================================//

// get the inverse_covariances matrix of each of the GMM classes
// for each input data, compute the distance of the frame to each of the GMMs
// with the following equations :

// ================================= //
// as in xmmGaussianDistribution.cpp //
// ================================= //

var gaussianComponentLikelihood = function gaussianComponentLikelihood(observation, gaussianComponent) {
	var component = gaussianComponent;
	var euclidianDistance = 0.0;
	for (var l = 0; l < component.dimension; l++) {
		var tmp = 0.0;
		for (var k = 0; k < component.dimension; k++) {
			tmp += component.inverse_covariance[l * component.dimension + k] * (observation[k] - component.mean[k]);
		}
		euclidianDistance += (observation[l] - component.mean[l]) * tmp;
	}
	var p = Math.exp(-0.5 * euclidianDistance) / Math.sqrt(component.covariance_determinant * Math.pow(2 * Math.PI, component.dimension));

	if (p < 1e-180 || isNaN(p) || isNaN(Math.abs(p))) {
		p = 1e-180;
	}
	return p;
};

exports.gaussianComponentLikelihood = gaussianComponentLikelihood;
// ================================= //
//    as in xmmGmmSingleClass.cpp    //
// ================================= //

// -> in obsProb, called from likelihood, called from filter, called from GMM::filter
// TODO : decompose in a similar way to XMM cpp to be able to use obsProb

var gmmLikelihood = function gmmLikelihood(observation, singleClassGmmModel) {
	var singleClassGmmModelResults = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

	var coeffs = singleClassGmmModel.mixture_coeffs;
	//console.log(coeffs);
	//if(coeffs === undefined) coeffs = [1];
	var components = singleClassGmmModel.components;
	//let res = singleClassGmmModelResults;
	var p = 0;

	for (var c = 0; c < coeffs.length; c++) {
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

exports.gmmLikelihood = gmmLikelihood;
// ================================= //
//          as in xmmGmm.cpp         //
// ================================= //

var gmmLikelihoods = function gmmLikelihoods(observation, gmmModel, gmmModelResults) {
	var likelihoods = [];
	var models = gmmModel.models;
	var res = gmmModelResults;

	var maxLogLikelihood = 0;
	var normConstInstant = 0;
	var normConstSmoothed = 0;

	for (var i = 0; i < models.length; i++) {

		var singleRes = res.singleClassGmmModelResults[i];
		singleRes.instant_likelihood = gmmLikelihood(observation, models[i], singleRes);

		// as in xmmGmmSingleClass::updateResults() (moved from gmmLikelihood) :
		singleRes.likelihood_buffer.unshift(singleRes.instant_likelihood);
		singleRes.likelihood_buffer.length--;
		singleRes.log_likelihood = singleRes.likelihood_buffer.reduce(function (a, b) {
			return a + b;
		}, 0); // sum of all array values
		singleRes.log_likelihood /= singleRes.likelihood_buffer.length;

		res.instant_likelihoods[i] = singleRes.instant_likelihood;
		res.smoothed_log_likelihoods[i] = singleRes.log_likelihood;
		res.smoothed_likelihoods[i] = Math.exp(res.smoothed_log_likelihoods[i]);
		res.instant_normalized_likelihoods[i] = res.instant_likelihoods[i];
		res.smoothed_normalized_likelihoods[i] = res.smoothed_likelihoods[i];

		normConstInstant += res.instant_normalized_likelihoods[i];
		normConstSmoothed += res.smoothed_normalized_likelihoods[i];

		if (i == 0 || res.smoothed_log_likelihoods[i] > maxLogLikelihood) {
			maxLogLikelihood = res.smoothed_log_likelihoods[i];
			res.likeliest = i;
		}
	}

	for (var i = 0; i < models.length; i++) {

		res.instant_normalized_likelihoods[i] /= normConstInstant;
		res.smoothed_normalized_likelihoods[i] /= normConstSmoothed;
	}
};

exports.gmmLikelihoods = gmmLikelihoods;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL3htbS1kZWNvZGVyLWNvbW1vbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CTyxJQUFNLG9CQUFvQixHQUFHLFNBQXZCLG9CQUFvQixDQUFJLG1CQUFtQixFQUFFLDBCQUEwQixFQUFLO0FBQ3hGLEtBQUksQ0FBQyxHQUFHLG1CQUFtQixDQUFDO0FBQzVCLEtBQUksR0FBRyxHQUFHLDBCQUEwQixDQUFDOztBQUVyQyxLQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQzs7QUFFbEMsSUFBRyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDeEIsS0FBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUIsTUFBRyxBQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBSSxVQUFVLEVBQUU7QUFDeEQsYUFBVSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRCxNQUFHLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztHQUN4QjtFQUNEOztBQUVELElBQUcsQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLGVBQWUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ3hELElBQUcsQ0FBQyxlQUFl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OztBQUVsQyxLQUFHLENBQUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUM7QUFDMUQsS0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDO0VBQzVEO0NBQ0QsQ0FBQyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi94bW0tZGVjb2Rlci1jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICpcdHhtbSBkZWNvZGVyXG4gKlx0anMgcG9ydCBvZiB0aGUgZGVjb2RpbmcgcGFydCBvZiBYTU1cbiAqXHRhbGxvd3MgdG8gZmlsdGVyIGlucHV0IGRhdGEgZnJvbSB0cmFpbmVkIG1vZGVsc1xuICogXHR0aGUgdHJhaW5pbmcgaGVzIHRvIGJlIGRvbmUgd2l0aCB0aGUgWE1NIEMrKyBsaWJyYXJ5XG4gKi9cblxuXG4vLyBOT1RFIDogdGhlIG1vZGVscyBhbmQgbW9kZWxSZXN1bHRzIG11c3QgZm9sbG93IGEgcHJlY2lzZSBkb2N1bWVudCBzdHJ1Y3R1cmUgOlxuLy8gXHQtIFx0bW9kZWxzIHNob3VsZCB3b3JrIGFzIGV4cG9ydGVkIGJ5IFhNTSAoSlNPTilcbi8vXHQtIFx0bW9kZWxSZXN1bHRzIHJlcGxhY2UgdGhlIHZhcmlhYmxlcyB0aGF0IG5vcm1hbGx5IGV4aXN0IGluIHRoZSBjcHAgY2xhc3Nlcywgd2hpY2ggYXJlIG5lZWRlZCBmb3IgdGhlIGRlY29kaW5nLlxuLy9cdFx0bW9kZWxSZXN1bHRzIChpbiB0aGUgY2FzZSBvZiBITU1zKSwgY29udGFpbnMgdGhlIGFycmF5IHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzLCBlYWNoIGVsZW1lbnQgb2Ygd2hpY2hcbi8vXHRcdGNvbnRhaW5zIGFuIGFycmF5IG9mIHNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzICh0aGUgSE1NIHN0YXRlcykuXG4vL1x0XHRzZWUgdGhlIGRlY29kZXIgbGZvcHMgZm9yIGltcGxlbWVudGF0aW9uLlxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gICAgYXMgaW4geG1tSG1tU2luZ2xlQ2xhc3MuY3BwICAgIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGNvbnN0IGhtbVVwZGF0ZUFscGhhV2luZG93ID0gKHNpbmdsZUNsYXNzSG1tTW9kZWwsIHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzKSA9PiB7XG5cdGxldCBtID0gc2luZ2xlQ2xhc3NIbW1Nb2RlbDtcblx0bGV0IHJlcyA9IHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzO1xuXG5cdGxldCBuc3RhdGVzID0gbS5wYXJhbWV0ZXJzLnN0YXRlcztcblx0XG5cdHJlcy5saWtlbGllc3Rfc3RhdGUgPSAwO1xuXHRsZXQgYmVzdF9hbHBoYSA9IHJlcy5hbHBoYV9oWzBdWzBdICsgcmVzLmFscGhhX2hbMV1bMF07XG5cdGZvcihsZXQgaT0xOyBpPG5zdGF0ZXM7IGkrKykge1xuXHRcdGlmKChyZXMuYWxwaGFfaFswXVtpXSArIHJlcy5hbHBoYV9oWzFdW2ldKSA+IGJlc3RfYWxwaGEpIHtcblx0XHRcdGJlc3RfYWxwaGEgPSByZXMuYWxwaGFfaFswXVtpXSArIHJlcy5hbHBoYV9oWzFdW2ldO1xuXHRcdFx0cmVzLmxpa2VsaWVzdF9zdGF0ZSA9IGk7XG5cdFx0fVxuXHR9XG5cblx0cmVzLndpbmRvd19taW5pbmRleCA9IHJlcy5saWtlbGllc3Rfc3RhdGUgLSBuc3RhdGVzIC8gMjtcblx0cmVzLndpbmRvd19tYXhpbmRleCA9IHJlcy5saWtlbGllc3Rfc3RhdGUgKyBuc3RhdGVzIC8gMjtcblx0cmVzLndpbmRvd19taW5pbmRleCA9IHJlcy53aW5kb3dfbWluaW5kZXggPj0gMCA/IHJlcy53aW5kb3dfbWluaW5kZXggOiAwO1xuXHRyZXMud2luZG93X21heGluZGV4ID0gcmVzLndpbmRvd19tYXhpbmRleCA8PSBuc3RhdGVzID8gcmVzLndpbmRvd19tYXhpbmRleCA6IG5zdGF0ZXM7XG5cdHJlcy53aW5kb3dfbm9ybWFsaXphdGlvbl9jb25zdGFudCA9IDA7XG5cdGZvcihsZXQgaT1yZXMud2luZG93X21pbmluZGV4OyBpPHJlcy53aW5kb3dfbWF4aW5kZXg7IGkrKykge1xuXHRcdHJlcy53aW5kb3dfbm9ybWFsaXphdGlvbl9jb25zdGFudCArPSAocmVzLmFscGhhX2hbMF1baV0gKyByZXMuYWxwaGFfaFsxXVtpXSk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGhtbVVwZGF0ZVJlc3VsdHMgPSAoc2luZ2xlQ2xhc3NIbW1Nb2RlbCwgc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMpID0+IHtcblx0bGV0IG0gPSBzaW5nbGVDbGFzc0htbU1vZGVsO1xuXHRsZXQgcmVzID0gc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHM7XG5cblx0Ly8gSVMgVEhJUyBDT1JSRUNUICA/IENIRUNLICFcblx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyLnB1c2goTWF0aC5sb2cocmVzLmluc3RhbnRfbGlrZWxpaG9vZCkpO1xuXHRyZXMubG9nX2xpa2VsaWhvb2QgPSAwO1xuXHRsZXQgYnVmU2l6ZSA9IHJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGg7XG5cdGZvcihsZXQgaT0wOyBpPGJ1ZlNpemU7IGkrKykge1xuXHRcdHJlcy5sb2dfbGlrZWxpaG9vZCArPSByZXMubGlrZWxpaG9vZF9idWZmZXJbaV07XG5cdH1cblx0cmVzLmxvZ19saWtlbGlob29kIC89IGJ1ZlNpemU7XG5cblx0cmVzLnByb2dyZXNzID0gMDtcblx0Zm9yKGxldCBpPXJlcy53aW5kb3dfbWluaW5kZXg7IGk8cmVzLndpbmRvd19tYXhpbmRleDsgaSsrKSB7XG5cdFx0cmVzLnByb2dyZXNzICs9IChyZXMuYWxwaGFfaFswXVtpXSArIHJlcy5hbHBoYV9oWzFdW2ldICsgcmVzLmFscGhhX2hbMl1baV0pICogaSAvXG5cdFx0XHRcdFx0XHRyZXMud2luZG93X25vcm1hbGl6YXRpb25fY29uc3RhbnQ7XG5cdH1cblx0cmVzLnByb2dyZXNzIC89IChtLnBhcmFtZXRlcnMuc3RhdGVzIC0gMSk7XG59XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gICBhcyBpbiB4bW1IaWVyYXJjaGljYWxIbW0uY3BwICAgIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGNvbnN0IGhobW1MaWtlbGlob29kQWxwaGEgPSAoZXhpdE51bSwgbGlrZWxpaG9vZFZlY3RvciwgaGhtbU1vZGVsLCBoaG1tTW9kZWxSZXN1bHRzKSA9PiB7XG5cdGxldCBtID0gaGhtbU1vZGVsO1xuXHRsZXQgcmVzID0gaGhtbU1vZGVsUmVzdWx0cztcblxuXHRpZihleGl0TnVtIDwgMCkge1xuXHRcdC8vbGV0IGwgPSAwO1xuXHRcdGZvcihsZXQgaT0wOyBpPG0ubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsaWtlbGlob29kVmVjdG9yW2ldID0gMDtcblx0XHRcdGZvcihsZXQgZXhpdD0wOyBleGl0PDM7IGV4aXQrKykge1xuXHRcdFx0XHRmb3IobGV0IGs9MDsgazxtLm1vZGVsc1tpXS5wYXJhbWV0ZXJzLnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdFx0bGlrZWxpaG9vZFZlY3RvcltpXSArPSByZXMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFtleGl0XVtrXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRmb3IobGV0IGk9MDsgaTxtLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bGlrZWxpaG9vZFZlY3RvcltpXSA9IDA7XG5cdFx0XHRmb3IobGV0IGs9MDsgazxtLm1vZGVsc1tpXS5wYXJhbWV0ZXJzLnN0YXRlczsgaysrKSB7XG5cdFx0XHRcdGxpa2VsaWhvb2RWZWN0b3JbaV0gKz0gcmVzLnNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzW2ldLmFscGhhX2hbZXhpdE51bV1ba107XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4vLyBnZXQgdGhlIGludmVyc2VfY292YXJpYW5jZXMgbWF0cml4IG9mIGVhY2ggb2YgdGhlIEdNTSBjbGFzc2VzXG4vLyBmb3IgZWFjaCBpbnB1dCBkYXRhLCBjb21wdXRlIHRoZSBkaXN0YW5jZSBvZiB0aGUgZnJhbWUgdG8gZWFjaCBvZiB0aGUgR01Nc1xuLy8gd2l0aCB0aGUgZm9sbG93aW5nIGVxdWF0aW9ucyA6XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gYXMgaW4geG1tR2F1c3NpYW5EaXN0cmlidXRpb24uY3BwIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGNvbnN0IGdhdXNzaWFuQ29tcG9uZW50TGlrZWxpaG9vZCA9IChvYnNlcnZhdGlvbiwgZ2F1c3NpYW5Db21wb25lbnQpID0+IHtcblx0bGV0IGNvbXBvbmVudCA9IGdhdXNzaWFuQ29tcG9uZW50O1xuXHRsZXQgZXVjbGlkaWFuRGlzdGFuY2UgPSAwLjA7XG5cdGZvcihsZXQgbCA9IDA7IGwgPCBjb21wb25lbnQuZGltZW5zaW9uOyBsKyspIHtcblx0XHRsZXQgdG1wID0gMC4wO1xuXHRcdGZvcihsZXQgaz0gMDsgayA8IGNvbXBvbmVudC5kaW1lbnNpb247IGsrKykge1xuXHRcdFx0dG1wICs9IGNvbXBvbmVudC5pbnZlcnNlX2NvdmFyaWFuY2VbbCAqIGNvbXBvbmVudC5kaW1lbnNpb24gKyBrXSAqIChvYnNlcnZhdGlvbltrXSAtIGNvbXBvbmVudC5tZWFuW2tdKTtcblx0XHR9XG5cdFx0ZXVjbGlkaWFuRGlzdGFuY2UgKz0gKG9ic2VydmF0aW9uW2xdIC0gY29tcG9uZW50Lm1lYW5bbF0pICogdG1wO1xuXHR9XG5cdGxldCBwID0gTWF0aC5leHAoLTAuNSAqIGV1Y2xpZGlhbkRpc3RhbmNlKSAvIE1hdGguc3FydChjb21wb25lbnQuY292YXJpYW5jZV9kZXRlcm1pbmFudCAqIE1hdGgucG93KDIgKiBNYXRoLlBJLCBjb21wb25lbnQuZGltZW5zaW9uKSk7XG5cblx0aWYoIHAgPCAxZS0xODAgfHwgaXNOYU4ocCkgfHwgaXNOYU4oTWF0aC5hYnMocCkpKSB7XG5cdFx0cCA9IDFlLTE4MDtcblx0fVxuXHRyZXR1cm4gcDtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gICAgYXMgaW4geG1tR21tU2luZ2xlQ2xhc3MuY3BwICAgIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuLy8gLT4gaW4gb2JzUHJvYiwgY2FsbGVkIGZyb20gbGlrZWxpaG9vZCwgY2FsbGVkIGZyb20gZmlsdGVyLCBjYWxsZWQgZnJvbSBHTU06OmZpbHRlclxuLy8gVE9ETyA6IGRlY29tcG9zZSBpbiBhIHNpbWlsYXIgd2F5IHRvIFhNTSBjcHAgdG8gYmUgYWJsZSB0byB1c2Ugb2JzUHJvYlxuXG5leHBvcnQgY29uc3QgZ21tTGlrZWxpaG9vZCA9IChvYnNlcnZhdGlvbiwgc2luZ2xlQ2xhc3NHbW1Nb2RlbCwgc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHMgPSB7fSkgPT4ge1xuXHRsZXQgY29lZmZzID0gc2luZ2xlQ2xhc3NHbW1Nb2RlbC5taXh0dXJlX2NvZWZmcztcblx0Ly9jb25zb2xlLmxvZyhjb2VmZnMpO1xuXHQvL2lmKGNvZWZmcyA9PT0gdW5kZWZpbmVkKSBjb2VmZnMgPSBbMV07XG5cdGxldCBjb21wb25lbnRzID0gc2luZ2xlQ2xhc3NHbW1Nb2RlbC5jb21wb25lbnRzO1xuXHQvL2xldCByZXMgPSBzaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0cztcblx0bGV0IHAgPSAwO1xuXG5cdGZvcihsZXQgYyA9IDA7IGMgPCBjb2VmZnMubGVuZ3RoOyBjKyspIHtcblx0XHRwICs9IGNvZWZmc1tjXSAqIGdhdXNzaWFuQ29tcG9uZW50TGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgY29tcG9uZW50c1tjXSk7XG5cdH1cblxuXHQvL3Jlcy5pbnN0YW50X2xpa2VsaWhvb2QgPSBwO1xuXG5cdC8vIGFzIGluIHhtbUdtbVNpbmdsZUNsYXNzOjp1cGRhdGVSZXN1bHRzKCkgOlxuXHQvLyA9PiBtb3ZlZCB0byBnbW1MaWtlbGlob29kcygpIHNvIHRoYXQgdGhpcyBmdW5jdGlvbiBsb29rcyBtb3JlIGxpa2Ugb2JzUHJvYlxuXHQvKlxuXHRyZXMubGlrZWxpaG9vZF9idWZmZXIudW5zaGlmdChwKTtcblx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aC0tO1xuXHRyZXMubG9nX2xpa2VsaWhvb2QgPSByZXMubGlrZWxpaG9vZF9idWZmZXIucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCk7IC8vIHN1bSBvZiBhbGwgYXJyYXkgdmFsdWVzXG5cdHJlcy5sb2dfbGlrZWxpaG9vZCAvPSByZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoO1xuXHQvLyovXG5cblx0cmV0dXJuIHA7XG59O1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cbi8vICAgICAgICAgIGFzIGluIHhtbUdtbS5jcHAgICAgICAgICAvL1xuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG5cbmV4cG9ydCBjb25zdCBnbW1MaWtlbGlob29kcyA9IChvYnNlcnZhdGlvbiwgZ21tTW9kZWwsIGdtbU1vZGVsUmVzdWx0cykgPT4ge1xuXHRsZXQgbGlrZWxpaG9vZHMgPSBbXTtcblx0bGV0IG1vZGVscyA9IGdtbU1vZGVsLm1vZGVscztcblx0bGV0IHJlcyA9IGdtbU1vZGVsUmVzdWx0cztcblxuXHRsZXQgbWF4TG9nTGlrZWxpaG9vZCA9IDA7XG5cdGxldCBub3JtQ29uc3RJbnN0YW50ID0gMDtcblx0bGV0IG5vcm1Db25zdFNtb290aGVkID0gMDtcblxuXHRmb3IobGV0IGk9MDsgaTxtb2RlbHMubGVuZ3RoOyBpKyspIHtcblxuXHRcdGxldCBzaW5nbGVSZXMgPSByZXMuc2luZ2xlQ2xhc3NHbW1Nb2RlbFJlc3VsdHNbaV07XG5cdFx0c2luZ2xlUmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IGdtbUxpa2VsaWhvb2Qob2JzZXJ2YXRpb24sIG1vZGVsc1tpXSwgc2luZ2xlUmVzKTtcblxuXHRcdC8vIGFzIGluIHhtbUdtbVNpbmdsZUNsYXNzOjp1cGRhdGVSZXN1bHRzKCkgKG1vdmVkIGZyb20gZ21tTGlrZWxpaG9vZCkgOlxuXHRcdHNpbmdsZVJlcy5saWtlbGlob29kX2J1ZmZlci51bnNoaWZ0KHNpbmdsZVJlcy5pbnN0YW50X2xpa2VsaWhvb2QpO1xuXHRcdHNpbmdsZVJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGgtLTtcblx0XHRzaW5nbGVSZXMubG9nX2xpa2VsaWhvb2QgPSBzaW5nbGVSZXMubGlrZWxpaG9vZF9idWZmZXIucmVkdWNlKChhLCBiKSA9PiBhICsgYiwgMCk7IC8vIHN1bSBvZiBhbGwgYXJyYXkgdmFsdWVzXG5cdFx0c2luZ2xlUmVzLmxvZ19saWtlbGlob29kIC89IHNpbmdsZVJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGg7XG5cblx0XHRyZXMuaW5zdGFudF9saWtlbGlob29kc1tpXSA9IHNpbmdsZVJlcy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0cmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA9IHNpbmdsZVJlcy5sb2dfbGlrZWxpaG9vZDtcblx0XHRyZXMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV0gPSBNYXRoLmV4cChyZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldKTtcblx0XHRyZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gcmVzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV07XG5cdFx0cmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSByZXMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV07XG5cblx0XHRub3JtQ29uc3RJbnN0YW50ICs9IHJlcy5pbnN0YW50X25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cdFx0bm9ybUNvbnN0U21vb3RoZWQgKz0gcmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV07XG5cblx0XHRpZihpID09IDAgfHwgcmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA+IG1heExvZ0xpa2VsaWhvb2QpIHtcblx0XHRcdG1heExvZ0xpa2VsaWhvb2QgPSByZXMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldO1xuXHRcdFx0cmVzLmxpa2VsaWVzdCA9IGk7XG5cdFx0fVxuXHR9XG5cblx0Zm9yKGxldCBpPTA7IGk8bW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRyZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldIC89IG5vcm1Db25zdEluc3RhbnQ7XG5cdFx0cmVzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gLz0gbm9ybUNvbnN0U21vb3RoZWQ7XG5cdH1cbn07XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbi8vIERPIFdFIFJFQUxMWSBORUVEIFRISVMgP1xuXG4vKlxuY2xhc3MgWG1tU2luZ2xlQ2xhc3NHbW0ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGxpa2VsaWhvb2RXaW5kb3c6IDUsXG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucmVzdWx0cyA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLmxpa2VsaWhvb2RXaW5kb3cgPSB0aGlzLnBhcmFtcy5saWtlbGlob29kV2luZG93O1xuXHR9XG5cblx0c2V0TW9kZWwobW9kZWwpIHtcblx0XHR0aGlzLm1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMucmVzdWx0cyA9IHVuZGVmaW5lZDtcblxuXHRcdC8vIHRlc3QgaWYgbW9kZWwgaXMgdmFsaWQgaGVyZSAoVE9ETyA6IHdyaXRlIGEgYmV0dGVyIHRlc3QpXG5cdFx0aWYobW9kZWwgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5tb2RlbCA9IG1vZGVsO1xuXHRcdFx0bGV0IG5tb2RlbHMgPSBtb2RlbC5tb2RlbHMubGVuZ3RoO1xuXHRcdFx0dGhpcy5yZXN1bHRzID0ge1xuXHRcdFx0XHRpbnN0YW50X2xpa2VsaWhvb2Q6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bG9nX2xpa2VsaWhvb2Q6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bGlrZWxpaG9vZF9idWZmZXI6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0aW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdHNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHM6IG5ldyBBcnJheShubW9kZWxzKSxcblx0XHRcdFx0bGlrZWxpZXN0OiAtMSxcblx0XHRcdFx0c2luZ2xlQ2xhc3NNb2RlbFJlc3VsdHM6IFtdXG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IobGV0IGk9MDsgaTxubW9kZWxzOyBpKyspIHtcblxuXHRcdFx0XHR0aGlzLnJlc3VsdHMuaW5zdGFudF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMuc21vb3RoZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLnNtb290aGVkX25vcm1hbGl6ZWRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXG5cdFx0XHRcdGxldCByZXMgPSB7fTtcblx0XHRcdFx0cmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5sb2dfbGlrZWxpaG9vZCA9IDA7XG5cdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlciA9IFtdO1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoID0gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0XHRmb3IobGV0IGo9MDsgajx0aGlzLmxpa2VsaWhvb2RXaW5kb3c7IGorKykge1xuXHRcdFx0XHRcdHJlcy5saWtlbGlob29kX2J1ZmZlcltqXSA9IDEgLyB0aGlzLmxpa2VsaWhvb2RXaW5kb3c7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5yZXN1bHRzLnNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzLnB1c2gocmVzKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLmluaXRpYWxpemUoeyBmcmFtZVNpemU6IHRoaXMubW9kZWwubW9kZWxzLmxlbmd0aCB9KTtcblx0fVxuXG5cdGxpa2VsaWhvb2Qob2JzZXJ2YXRpb24pIHtcblxuXHR9XG5cblx0Ly8gZXRjIC4uLlxufVxuXG5jbGFzcyBYbW1TaW5nbGVDbGFzc0htbSB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdHRoaXMuYWxwaGFfaCA9IG5ldyBBcnJheSgzKTtcblx0XHRmb3IobGV0IGk9MDsgaTwzOyBpKyspIHtcblx0XHRcdGFscGhhX2hbaV0gPSBbXTtcblx0XHR9XG5cblx0XHR0aGlzLnByaW9yID0gW107XG5cdFx0dGhpcy5zdGF0ZXMgPSBbXTsgLy8gdGhlc2UgYXJlIFhtbVNpbmdsZUNsYXNzR21tJ3NcblxuXHRcdHRoaXMucmVzdWx0cyA9IHtcblx0XHRcdGluc3RhbnRfbGlrZWxpaG9vZDogMFxuXHRcdH07XG5cblx0XHR0aGlzLmZvcndhcmRfaW5pdGlhbGl6ZWQgPSBmYWxzZTtcblx0XHQvL3RoaXMucHJldmlvdXNfYWxwaGEgPSBcblx0fVxuXG5cdC8vIEVUQ1xufVxuXG4qL1xuIl19