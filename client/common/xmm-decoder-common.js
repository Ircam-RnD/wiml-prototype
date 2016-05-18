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
	res.likelihood_buffer.push(res.instant_likelihood);
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

		res.instant_likelihoods[i] = singleResults.instant_likelihood;
		res.smoothed_log_likelihoods[i] = singleResults.log_likelihood;
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

	for (var i = 0; i < model.models.length; i++) {

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL3htbS1kZWNvZGVyLWNvbW1vbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CTyxJQUFNLG9CQUFvQixHQUFHLFNBQXZCLG9CQUFvQixDQUFJLG1CQUFtQixFQUFFLDBCQUEwQixFQUFLO0FBQ3hGLEtBQUksQ0FBQyxHQUFHLG1CQUFtQixDQUFDO0FBQzVCLEtBQUksR0FBRyxHQUFHLDBCQUEwQixDQUFDOztBQUVyQyxLQUFJLE9BQU8sR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQzs7QUFFbEMsSUFBRyxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDeEIsS0FBSSxVQUFVLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ3ZELE1BQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUIsTUFBRyxBQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBSSxVQUFVLEVBQUU7QUFDeEQsYUFBVSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNuRCxNQUFHLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztHQUN4QjtFQUNEOztBQUVELElBQUcsQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLGVBQWUsR0FBRyxPQUFPLEdBQUcsQ0FBQyxDQUFDO0FBQ3hELElBQUcsQ0FBQyxlQUFl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QUMsOEJBQThCLENBQUMsQ0FBQyxDQUFDLElBQUksZ0JBQWdCLENBQUM7QUFDMUQsS0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUMsQ0FBQyxJQUFJLGlCQUFpQixDQUFDO0VBQzVEO0NBQ0QsQ0FBQyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi94bW0tZGVjb2Rlci1jb21tb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICpcdHhtbSBkZWNvZGVyXG4gKlx0anMgcG9ydCBvZiB0aGUgZGVjb2RpbmcgcGFydCBvZiBYTU1cbiAqXHRhbGxvd3MgdG8gZmlsdGVyIGlucHV0IGRhdGEgZnJvbSB0cmFpbmVkIG1vZGVsc1xuICogXHR0aGUgdHJhaW5pbmcgaGVzIHRvIGJlIGRvbmUgd2l0aCB0aGUgWE1NIEMrKyBsaWJyYXJ5XG4gKi9cblxuXG4vLyBOT1RFIDogdGhlIG1vZGVscyBhbmQgbW9kZWxSZXN1bHRzIG11c3QgZm9sbG93IGEgcHJlY2lzZSBkb2N1bWVudCBzdHJ1Y3R1cmUgOlxuLy8gXHQtIFx0bW9kZWxzIHNob3VsZCB3b3JrIGFzIGV4cG9ydGVkIGJ5IFhNTSAoSlNPTilcbi8vXHQtIFx0bW9kZWxSZXN1bHRzIHJlcGxhY2UgdGhlIHZhcmlhYmxlcyB0aGF0IG5vcm1hbGx5IGV4aXN0IGluIHRoZSBjcHAgY2xhc3Nlcywgd2hpY2ggYXJlIG5lZWRlZCBmb3IgdGhlIGRlY29kaW5nLlxuLy9cdFx0bW9kZWxSZXN1bHRzIChpbiB0aGUgY2FzZSBvZiBITU1zKSwgY29udGFpbnMgdGhlIGFycmF5IHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzLCBlYWNoIGVsZW1lbnQgb2Ygd2hpY2hcbi8vXHRcdGNvbnRhaW5zIGFuIGFycmF5IG9mIHNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzICh0aGUgSE1NIHN0YXRlcykuXG4vL1x0XHRzZWUgdGhlIGRlY29kZXIgbGZvcHMgZm9yIGltcGxlbWVudGF0aW9uLlxuXG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gICAgYXMgaW4geG1tSG1tU2luZ2xlQ2xhc3MuY3BwICAgIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGNvbnN0IGhtbVVwZGF0ZUFscGhhV2luZG93ID0gKHNpbmdsZUNsYXNzSG1tTW9kZWwsIHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzKSA9PiB7XG5cdGxldCBtID0gc2luZ2xlQ2xhc3NIbW1Nb2RlbDtcblx0bGV0IHJlcyA9IHNpbmdsZUNsYXNzSG1tTW9kZWxSZXN1bHRzO1xuXG5cdGxldCBuc3RhdGVzID0gbS5wYXJhbWV0ZXJzLnN0YXRlcztcblx0XG5cdHJlcy5saWtlbGllc3Rfc3RhdGUgPSAwO1xuXHRsZXQgYmVzdF9hbHBoYSA9IHJlcy5hbHBoYV9oWzBdWzBdICsgcmVzLmFscGhhX2hbMV1bMF07XG5cdGZvcihsZXQgaT0xOyBpPG5zdGF0ZXM7IGkrKykge1xuXHRcdGlmKChyZXMuYWxwaGFfaFswXVtpXSArIHJlcy5hbHBoYV9oWzFdW2ldKSA+IGJlc3RfYWxwaGEpIHtcblx0XHRcdGJlc3RfYWxwaGEgPSByZXMuYWxwaGFfaFswXVtpXSArIHJlcy5hbHBoYV9oWzFdW2ldO1xuXHRcdFx0cmVzLmxpa2VsaWVzdF9zdGF0ZSA9IGk7XG5cdFx0fVxuXHR9XG5cblx0cmVzLndpbmRvd19taW5pbmRleCA9IHJlcy5saWtlbGllc3Rfc3RhdGUgLSBuc3RhdGVzIC8gMjtcblx0cmVzLndpbmRvd19tYXhpbmRleCA9IHJlcy5saWtlbGllc3Rfc3RhdGUgKyBuc3RhdGVzIC8gMjtcblx0cmVzLndpbmRvd19taW5pbmRleCA9IHJlcy53aW5kb3dfbWluaW5kZXggPj0gMCA/IHJlcy53aW5kb3dfbWluaW5kZXggOiAwO1xuXHRyZXMud2luZG93X21heGluZGV4ID0gcmVzLndpbmRvd19tYXhpbmRleCA8PSBuc3RhdGVzID8gcmVzLndpbmRvd19tYXhpbmRleCA6IG5zdGF0ZXM7XG5cdHJlcy53aW5kb3dfbm9ybWFsaXphdGlvbl9jb25zdGFudCA9IDA7XG5cdGZvcihsZXQgaT1yZXMud2luZG93X21pbmluZGV4OyBpPHJlcy53aW5kb3dfbWF4aW5kZXg7IGkrKykge1xuXHRcdHJlcy53aW5kb3dfbm9ybWFsaXphdGlvbl9jb25zdGFudCArPSAocmVzLmFscGhhX2hbMF1baV0gKyByZXMuYWxwaGFfaFsxXVtpXSk7XG5cdH1cbn1cblxuZXhwb3J0IGNvbnN0IGhtbVVwZGF0ZVJlc3VsdHMgPSAoc2luZ2xlQ2xhc3NIbW1Nb2RlbCwgc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHMpID0+IHtcblx0bGV0IG0gPSBzaW5nbGVDbGFzc0htbU1vZGVsO1xuXHRsZXQgcmVzID0gc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHM7XG5cblx0Ly8gSVMgVEhJUyBDT1JSRUNUICA/IENIRUNLICFcblx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyLnB1c2gocmVzLmluc3RhbnRfbGlrZWxpaG9vZCk7XG5cdHJlcy5sb2dfbGlrZWxpaG9vZCA9IDA7XG5cdGxldCBidWZTaXplID0gcmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aDtcblx0Zm9yKGxldCBpPTA7IGk8YnVmU2l6ZTsgaSsrKSB7XG5cdFx0cmVzLmxvZ19saWtlbGlob29kICs9IHJlcy5saWtlbGlob29kX2J1ZmZlcltpXTtcblx0fVxuXHRyZXMubG9nX2xpa2VsaWhvb2QgLz0gYnVmU2l6ZTtcblxuXHRyZXMucHJvZ3Jlc3MgPSAwO1xuXHRmb3IobGV0IGk9cmVzLndpbmRvd19taW5pbmRleDsgaTxyZXMud2luZG93X21heGluZGV4OyBpKyspIHtcblx0XHRyZXMucHJvZ3Jlc3MgKz0gKHJlcy5hbHBoYV9oWzBdW2ldICsgcmVzLmFscGhhX2hbMV1baV0gKyByZXMuYWxwaGFfaFsyXVtpXSkgKiBpIC9cblx0XHRcdFx0XHRcdHJlcy53aW5kb3dfbm9ybWFsaXphdGlvbl9jb25zdGFudDtcblx0fVxuXHRyZXMucHJvZ3Jlc3MgLz0gKG0ucGFyYW1ldGVycy5zdGF0ZXMgLSAxKTtcbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgIGFzIGluIHhtbUhpZXJhcmNoaWNhbEhtbS5jcHAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgY29uc3QgaGhtbUxpa2VsaWhvb2RBbHBoYSA9IChleGl0TnVtLCBsaWtlbGlob29kVmVjdG9yLCBoaG1tTW9kZWwsIGhobW1Nb2RlbFJlc3VsdHMpID0+IHtcblx0bGV0IG0gPSBoaG1tTW9kZWw7XG5cdGxldCByZXMgPSBoaG1tTW9kZWxSZXN1bHRzO1xuXG5cdGlmKGV4aXROdW0gPCAwKSB7XG5cdFx0Ly9sZXQgbCA9IDA7XG5cdFx0Zm9yKGxldCBpPTA7IGk8bS5tb2RlbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxpa2VsaWhvb2RWZWN0b3JbaV0gPSAwO1xuXHRcdFx0Zm9yKGxldCBleGl0PTA7IGV4aXQ8MzsgZXhpdCsrKSB7XG5cdFx0XHRcdGZvcihsZXQgaz0wOyBrPG0ubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0XHRsaWtlbGlob29kVmVjdG9yW2ldICs9IHJlcy5zaW5nbGVDbGFzc0htbU1vZGVsUmVzdWx0c1tpXS5hbHBoYV9oW2V4aXRdW2tdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvcihsZXQgaT0wOyBpPG0ubW9kZWxzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsaWtlbGlob29kVmVjdG9yW2ldID0gMDtcblx0XHRcdGZvcihsZXQgaz0wOyBrPG0ubW9kZWxzW2ldLnBhcmFtZXRlcnMuc3RhdGVzOyBrKyspIHtcblx0XHRcdFx0bGlrZWxpaG9vZFZlY3RvcltpXSArPSByZXMuc2luZ2xlQ2xhc3NIbW1Nb2RlbFJlc3VsdHNbaV0uYWxwaGFfaFtleGl0TnVtXVtrXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbi8vIGdldCB0aGUgaW52ZXJzZV9jb3ZhcmlhbmNlcyBtYXRyaXggb2YgZWFjaCBvZiB0aGUgR01NIGNsYXNzZXNcbi8vIGZvciBlYWNoIGlucHV0IGRhdGEsIGNvbXB1dGUgdGhlIGRpc3RhbmNlIG9mIHRoZSBmcmFtZSB0byBlYWNoIG9mIHRoZSBHTU1zXG4vLyB3aXRoIHRoZSBmb2xsb3dpbmcgZXF1YXRpb25zIDpcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyBhcyBpbiB4bW1HYXVzc2lhbkRpc3RyaWJ1dGlvbi5jcHAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG5leHBvcnQgY29uc3QgZ2F1c3NpYW5Db21wb25lbnRMaWtlbGlob29kID0gKG9ic2VydmF0aW9uLCBnYXVzc2lhbkNvbXBvbmVudCkgPT4ge1xuXHRsZXQgY29tcG9uZW50ID0gZ2F1c3NpYW5Db21wb25lbnQ7XG5cdGxldCBldWNsaWRpYW5EaXN0YW5jZSA9IDAuMDtcblx0Zm9yKGxldCBsID0gMDsgbCA8IGNvbXBvbmVudC5kaW1lbnNpb247IGwrKykge1xuXHRcdGxldCB0bXAgPSAwLjA7XG5cdFx0Zm9yKGxldCBrPSAwOyBrIDwgY29tcG9uZW50LmRpbWVuc2lvbjsgaysrKSB7XG5cdFx0XHR0bXAgKz0gY29tcG9uZW50LmludmVyc2VfY292YXJpYW5jZVtsICogY29tcG9uZW50LmRpbWVuc2lvbiArIGtdICogKG9ic2VydmF0aW9uW2tdIC0gY29tcG9uZW50Lm1lYW5ba10pO1xuXHRcdH1cblx0XHRldWNsaWRpYW5EaXN0YW5jZSArPSAob2JzZXJ2YXRpb25bbF0gLSBjb21wb25lbnQubWVhbltsXSkgKiB0bXA7XG5cdH1cblx0bGV0IHAgPSBNYXRoLmV4cCgtMC41ICogZXVjbGlkaWFuRGlzdGFuY2UpIC8gTWF0aC5zcXJ0KGNvbXBvbmVudC5jb3ZhcmlhbmNlX2RldGVybWluYW50ICogTWF0aC5wb3coMiAqIE1hdGguUEksIGNvbXBvbmVudC5kaW1lbnNpb24pKTtcblxuXHRpZiggcCA8IDFlLTE4MCB8fCBpc05hTihwKSB8fCBpc05hTihNYXRoLmFicyhwKSkpIHtcblx0XHRwID0gMWUtMTgwO1xuXHR9XG5cdHJldHVybiBwO1xufTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IC8vXG4vLyAgICBhcyBpbiB4bW1HbW1TaW5nbGVDbGFzcy5jcHAgICAgLy9cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuXG4vLyAtPiBpbiBvYnNQcm9iLCBjYWxsZWQgZnJvbSBsaWtlbGlob29kLCBjYWxsZWQgZnJvbSBmaWx0ZXIsIGNhbGxlZCBmcm9tIEdNTTo6ZmlsdGVyXG4vLyBUT0RPIDogZGVjb21wb3NlIGluIGEgc2ltaWxhciB3YXkgdG8gWE1NIGNwcCB0byBiZSBhYmxlIHRvIHVzZSBvYnNQcm9iXG5cbmV4cG9ydCBjb25zdCBnbW1MaWtlbGlob29kID0gKG9ic2VydmF0aW9uLCBzaW5nbGVDbGFzc0dtbU1vZGVsLCBzaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0cyA9IHt9KSA9PiB7XG5cdGxldCBjb2VmZnMgPSBzaW5nbGVDbGFzc0dtbU1vZGVsLm1peHR1cmVfY29lZmZzO1xuXHQvL2NvbnNvbGUubG9nKGNvZWZmcyk7XG5cdC8vaWYoY29lZmZzID09PSB1bmRlZmluZWQpIGNvZWZmcyA9IFsxXTtcblx0bGV0IGNvbXBvbmVudHMgPSBzaW5nbGVDbGFzc0dtbU1vZGVsLmNvbXBvbmVudHM7XG5cdC8vbGV0IHJlcyA9IHNpbmdsZUNsYXNzR21tTW9kZWxSZXN1bHRzO1xuXHRsZXQgcCA9IDA7XG5cblx0Zm9yKGxldCBjID0gMDsgYyA8IGNvZWZmcy5sZW5ndGg7IGMrKykge1xuXHRcdHAgKz0gY29lZmZzW2NdICogZ2F1c3NpYW5Db21wb25lbnRMaWtlbGlob29kKG9ic2VydmF0aW9uLCBjb21wb25lbnRzW2NdKTtcblx0fVxuXG5cdC8vcmVzLmluc3RhbnRfbGlrZWxpaG9vZCA9IHA7XG5cblx0Ly8gYXMgaW4geG1tR21tU2luZ2xlQ2xhc3M6OnVwZGF0ZVJlc3VsdHMoKSA6XG5cdC8vID0+IG1vdmVkIHRvIGdtbUxpa2VsaWhvb2RzKCkgc28gdGhhdCB0aGlzIGZ1bmN0aW9uIGxvb2tzIG1vcmUgbGlrZSBvYnNQcm9iXG5cdC8qXG5cdHJlcy5saWtlbGlob29kX2J1ZmZlci51bnNoaWZ0KHApO1xuXHRyZXMubGlrZWxpaG9vZF9idWZmZXIubGVuZ3RoLS07XG5cdHJlcy5sb2dfbGlrZWxpaG9vZCA9IHJlcy5saWtlbGlob29kX2J1ZmZlci5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKTsgLy8gc3VtIG9mIGFsbCBhcnJheSB2YWx1ZXNcblx0cmVzLmxvZ19saWtlbGlob29kIC89IHJlcy5saWtlbGlob29kX2J1ZmZlci5sZW5ndGg7XG5cdC8vKi9cblxuXHRyZXR1cm4gcDtcbn07XG5cbi8vID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSAvL1xuLy8gICAgICAgICAgYXMgaW4geG1tR21tLmNwcCAgICAgICAgIC8vXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gLy9cblxuZXhwb3J0IGNvbnN0IGdtbUxpa2VsaWhvb2RzID0gKG9ic2VydmF0aW9uLCBnbW1Nb2RlbCwgZ21tTW9kZWxSZXN1bHRzKSA9PiB7XG5cdGxldCBsaWtlbGlob29kcyA9IFtdO1xuXHRsZXQgbW9kZWxzID0gZ21tTW9kZWwubW9kZWxzO1xuXHRsZXQgcmVzID0gZ21tTW9kZWxSZXN1bHRzO1xuXG5cdGxldCBtYXhMb2dMaWtlbGlob29kID0gMDtcblx0bGV0IG5vcm1Db25zdEluc3RhbnQgPSAwO1xuXHRsZXQgbm9ybUNvbnN0U21vb3RoZWQgPSAwO1xuXG5cdGZvcihsZXQgaT0wOyBpPG1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0bGV0IHNpbmdsZVJlcyA9IHJlcy5zaW5nbGVDbGFzc0dtbU1vZGVsUmVzdWx0c1tpXTtcblx0XHRzaW5nbGVSZXMuaW5zdGFudF9saWtlbGlob29kID0gZ21tTGlrZWxpaG9vZChvYnNlcnZhdGlvbiwgbW9kZWxzW2ldLCBzaW5nbGVSZXMpO1xuXG5cdFx0Ly8gYXMgaW4geG1tR21tU2luZ2xlQ2xhc3M6OnVwZGF0ZVJlc3VsdHMoKSAobW92ZWQgZnJvbSBnbW1MaWtlbGlob29kKSA6XG5cdFx0c2luZ2xlUmVzLmxpa2VsaWhvb2RfYnVmZmVyLnVuc2hpZnQoc2luZ2xlUmVzLmluc3RhbnRfbGlrZWxpaG9vZCk7XG5cdFx0c2luZ2xlUmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aC0tO1xuXHRcdHNpbmdsZVJlcy5sb2dfbGlrZWxpaG9vZCA9IHNpbmdsZVJlcy5saWtlbGlob29kX2J1ZmZlci5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiLCAwKTsgLy8gc3VtIG9mIGFsbCBhcnJheSB2YWx1ZXNcblx0XHRzaW5nbGVSZXMubG9nX2xpa2VsaWhvb2QgLz0gc2luZ2xlUmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aDtcblxuXHRcdHJlcy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldID0gc2luZ2xlUmVzdWx0cy5pbnN0YW50X2xpa2VsaWhvb2Q7XG5cdFx0cmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSA9IHNpbmdsZVJlc3VsdHMubG9nX2xpa2VsaWhvb2Q7XG5cdFx0cmVzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldID0gTWF0aC5leHAocmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXSk7XG5cdFx0cmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IHJlcy5pbnN0YW50X2xpa2VsaWhvb2RzW2ldO1xuXHRcdHJlcy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gcmVzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldO1xuXG5cdFx0bm9ybUNvbnN0SW5zdGFudCArPSByZXMuaW5zdGFudF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldO1xuXHRcdG5vcm1Db25zdFNtb290aGVkICs9IHJlcy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldO1xuXG5cdFx0aWYoaSA9PSAwIHx8IHJlcy5zbW9vdGhlZF9sb2dfbGlrZWxpaG9vZHNbaV0gPiBtYXhMb2dMaWtlbGlob29kKSB7XG5cdFx0XHRtYXhMb2dMaWtlbGlob29kID0gcmVzLnNtb290aGVkX2xvZ19saWtlbGlob29kc1tpXTtcblx0XHRcdHJlcy5saWtlbGllc3QgPSBpO1xuXHRcdH1cblx0fVxuXG5cdGZvcihsZXQgaT0wOyBpPG1vZGVsLm1vZGVscy5sZW5ndGg7IGkrKykge1xuXG5cdFx0cmVzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSAvPSBub3JtQ29uc3RJbnN0YW50O1xuXHRcdHJlcy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldIC89IG5vcm1Db25zdFNtb290aGVkO1xuXHR9XG59O1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4vLyBETyBXRSBSRUFMTFkgTkVFRCBUSElTID9cblxuLypcbmNsYXNzIFhtbVNpbmdsZUNsYXNzR21tIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRsaWtlbGlob29kV2luZG93OiA1LFxuXHRcdH07XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnJlc3VsdHMgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5saWtlbGlob29kV2luZG93ID0gdGhpcy5wYXJhbXMubGlrZWxpaG9vZFdpbmRvdztcblx0fVxuXG5cdHNldE1vZGVsKG1vZGVsKSB7XG5cdFx0dGhpcy5tb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLnJlc3VsdHMgPSB1bmRlZmluZWQ7XG5cblx0XHQvLyB0ZXN0IGlmIG1vZGVsIGlzIHZhbGlkIGhlcmUgKFRPRE8gOiB3cml0ZSBhIGJldHRlciB0ZXN0KVxuXHRcdGlmKG1vZGVsICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMubW9kZWwgPSBtb2RlbDtcblx0XHRcdGxldCBubW9kZWxzID0gbW9kZWwubW9kZWxzLmxlbmd0aDtcblx0XHRcdHRoaXMucmVzdWx0cyA9IHtcblx0XHRcdFx0aW5zdGFudF9saWtlbGlob29kOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGxvZ19saWtlbGlob29kOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGxpa2VsaWhvb2RfYnVmZmVyOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kczogbmV3IEFycmF5KG5tb2RlbHMpLFxuXHRcdFx0XHRzbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzOiBuZXcgQXJyYXkobm1vZGVscyksXG5cdFx0XHRcdGxpa2VsaWVzdDogLTEsXG5cdFx0XHRcdHNpbmdsZUNsYXNzTW9kZWxSZXN1bHRzOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8bm1vZGVsczsgaSsrKSB7XG5cblx0XHRcdFx0dGhpcy5yZXN1bHRzLmluc3RhbnRfbGlrZWxpaG9vZHNbaV0gPSAwO1xuXHRcdFx0XHR0aGlzLnJlc3VsdHMuc21vb3RoZWRfbG9nX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLnNtb290aGVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblx0XHRcdFx0dGhpcy5yZXN1bHRzLmluc3RhbnRfbm9ybWFsaXplZF9saWtlbGlob29kc1tpXSA9IDA7XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5zbW9vdGhlZF9ub3JtYWxpemVkX2xpa2VsaWhvb2RzW2ldID0gMDtcblxuXHRcdFx0XHRsZXQgcmVzID0ge307XG5cdFx0XHRcdHJlcy5pbnN0YW50X2xpa2VsaWhvb2QgPSAwO1xuXHRcdFx0XHRyZXMubG9nX2xpa2VsaWhvb2QgPSAwO1xuXHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXIgPSBbXTtcblx0XHRcdFx0cmVzLmxpa2VsaWhvb2RfYnVmZmVyLmxlbmd0aCA9IHRoaXMubGlrZWxpaG9vZFdpbmRvdztcblx0XHRcdFx0Zm9yKGxldCBqPTA7IGo8dGhpcy5saWtlbGlob29kV2luZG93OyBqKyspIHtcblx0XHRcdFx0XHRyZXMubGlrZWxpaG9vZF9idWZmZXJbal0gPSAxIC8gdGhpcy5saWtlbGlob29kV2luZG93O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMucmVzdWx0cy5zaW5nbGVDbGFzc01vZGVsUmVzdWx0cy5wdXNoKHJlcyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5pbml0aWFsaXplKHsgZnJhbWVTaXplOiB0aGlzLm1vZGVsLm1vZGVscy5sZW5ndGggfSk7XG5cdH1cblxuXHRsaWtlbGlob29kKG9ic2VydmF0aW9uKSB7XG5cblx0fVxuXG5cdC8vIGV0YyAuLi5cbn1cblxuY2xhc3MgWG1tU2luZ2xlQ2xhc3NIbW0ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHR0aGlzLmFscGhhX2ggPSBuZXcgQXJyYXkoMyk7XG5cdFx0Zm9yKGxldCBpPTA7IGk8MzsgaSsrKSB7XG5cdFx0XHRhbHBoYV9oW2ldID0gW107XG5cdFx0fVxuXG5cdFx0dGhpcy5wcmlvciA9IFtdO1xuXHRcdHRoaXMuc3RhdGVzID0gW107IC8vIHRoZXNlIGFyZSBYbW1TaW5nbGVDbGFzc0dtbSdzXG5cblx0XHR0aGlzLnJlc3VsdHMgPSB7XG5cdFx0XHRpbnN0YW50X2xpa2VsaWhvb2Q6IDBcblx0XHR9O1xuXG5cdFx0dGhpcy5mb3J3YXJkX2luaXRpYWxpemVkID0gZmFsc2U7XG5cdFx0Ly90aGlzLnByZXZpb3VzX2FscGhhID0gXG5cdH1cblxuXHQvLyBFVENcbn1cblxuKi9cbiJdfQ==