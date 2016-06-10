import * as lfo from 'waves-lfo';
import {gmmLikelihood,
		hmmUpdateAlphaWindow,
		hmmUpdateResults,
		hhmmLikelihoodAlpha} from './xmm-decoder-common';

// simplified decoding algorithm :
//
// if(!forward_init)
// 		forward_init(obs);
// else
// 		forward_update(obs);
//
// for(model in models)
// 		model.updateAlphaWindow();
// 		model.updateResults();
//
// updateResults();

// A utiliser de xmm-decoder-common :
// - gaussianComponentLikelihood
// - gmmLikelihood (which uses gaussianComponentLikelihood)
// - not gmmLikelihoods, as it's the classifying part of GMM

// Which decoder parameters ?
// setLikelihoodWindow ?
// other smoothing windows ?
// exit probabilities ?
// ...


//===========================================================//

export default class XmmHhmmDecoder extends lfo.core.BaseLfo {

	constructor(options = {}) {
		const defaults = {
			likelihoodWindow: 5,
		};
		super(defaults, options);

		this.model = undefined;
		this.modelResults = undefined;
		this.likelihoodWindow = this.params.likelihoodWindow;
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


	//================ process frame =================//

	process(time, frame, metaData) {

		//incoming frame is observation vector
		if(this.model === undefined || this.modelResults === undefined) {
			//console.log("no model loaded");
			return;
		}

		//--------------------------------------------//

		this.time = time;
		this.metaData = metaData;

		const outFrame = this.outFrame;

		if(this.forward_initialized) {
			this.forwardUpdate(frame);
		} else {
			this.forwardInit(frame);
		}

		// for(let i=0; i<this.modelResults.singleClassHmmModelResults.length; i++) {
		// 		console.log(this.modelResults.singleClassHmmModelResults[i].alpha_h[0][0]);
		// }

		for(let i=0; i<this.model.models.length; i++) {
			hmmUpdateAlphaWindow(this.model.models[i], this.modelResults.singleClassHmmModelResults[i]);
			hmmUpdateResults(this.model.models[i], this.modelResults.singleClassHmmModelResults[i]);
		}

		this.updateResults();

		for(let i=0; i<this.model.models.length; i++) {
			outFrame[i] = this.modelResults.smoothed_normalized_likelihoods[i];
		}

		this.output();
	}
		

	//==================================================================//
	//====================== load model from json ======================//
	//==================================================================//
	
	setModel(model) {		

		this.model = undefined;
		this.modelResults = undefined;

		// test if model is valid here (TODO : write a better test)
		if(model.models !== undefined) {

			console.log(model);

			this.model = model;
			let nmodels = model.models.length;

			let nstatesGlobal = model.configuration.default_parameters.states;
			this.params.frameSize = nstatesGlobal;

			// this.prior = new Array(nmodels);
			// this.exit_transition = new Array(nmodels);
			// this.transition = new Array(nmodels);
			// for(let i=0; i<nmodels; i++) {
			// 	this.transition[i] = new Array(nmodels);
			// }
			this.frontier_v1 = new Array(nmodels);
			this.frontier_v2 = new Array(nmodels);
			this.forward_initialized = false;
			//this.results = {};

			this.modelResults = {
				instant_likelihoods: new Array(nmodels),
				smoothed_log_likelihoods: new Array(nmodels),
				smoothed_likelihoods: new Array(nmodels),
				instant_normalized_likelihoods: new Array(nmodels),
				smoothed_normalized_likelihoods: new Array(nmodels),
				likeliest: -1,
				singleClassHmmModelResults: []
			};

			for(let i=0; i<nmodels; i++) {

				this.modelResults.instant_likelihoods[i] = 0;
				this.modelResults.smoothed_log_likelihoods[i] = 0;
				this.modelResults.smoothed_likelihoods[i] = 0;
				this.modelResults.instant_normalized_likelihoods[i] = 0;
				this.modelResults.smoothed_normalized_likelihoods[i] = 0;

				let nstates = this.model.models[i].parameters.states;

				let alpha_h = new Array(3);
				for(let j=0; j<3; j++) {
					alpha_h[j] = new Array(nstates);
					for(let k=0; k<nstates; k++) {
						alpha_h[j][k] = 0;
					}
				}

				let hmmRes = {
					instant_likelihood: 0,
					log_likelihood: 0,
					likelihood_buffer: [],
					progress: 0,

					// never used ? -> check xmm cpp
					exit_likelihood: 0,
					exit_ratio: 0,

					likeliest_state: -1,

					//alpha: new Array(nstates), 	// for non-hierarchical
					alpha_h: alpha_h,				// for hierarchical
					prior: new Array(nstates),
					transition: new Array(nstates),

					// used in hmmUpdateAlphaWindow
					window_minindex: 0,
					window_maxindex: 0,
					window_normalization_constant: 0,
					
					singleClassGmmModelResults: []	// states
				};

				// ADD INDIVIDUAL STATES (GMMs)
				for(let j=0; j<nstates; j++) {
					let gmmRes = {
						instant_likelihood: 0,
						// log_likelihood: 0,
						// TODO : add same fields as in GmmDecoder ????
					};

					hmmRes.singleClassGmmModelResults.push(gmmRes);
				}

				this.modelResults.singleClassHmmModelResults.push(hmmRes);
			}
		}

		//this.streamParams.frameSize = this.model.models.length;
		this.initialize({ frameSize: this.model.models.length });
		//console.log(this.streamParams.frameSize);
		//console.log(this.modelResults);
	}

	//============================ RESET ==============================//

	reset() {
		this.forward_initialized = false;
	}

	//==================================================================//
	//========================= FORWARD INIT ===========================//
	//==================================================================//

	forwardInit(observation) {
		let norm_const = 0;
		//let modelIndex = 0;

		//================= INITIALIZE ALPHA VARIABLES =================//

		for(let i=0; i<this.model.models.length; i++) {

			let m = this.model.models[i];
			let nstates = m.parameters.states;
			let mRes = this.modelResults.singleClassHmmModelResults[i];

			for(let j=0; j<3; j++) {
				mRes.alpha_h[j] = new Array(nstates);
				for(let k=0; k<nstates; k++) {
					mRes.alpha_h[j][k] = 0;
				}
			}

			if(m.parameters.transition_mode == 0) { ////////////////////// ergodic
				for(let k=0; k<nstates; k++) {
					mRes.alpha_h[0][k] = mRes.prior[k] * gmmLikelihood(observation, m.states[k], mRes.singleClassGmmModelResults[k]); // see how obsProb is implemented
					mRes.instant_likelihood += mRes.alpha[0][k];
				}
			} else { ///////////////////////////////////////////////////// left-right
				mRes.alpha_h[0][0] = this.model.prior[i];
				mRes.alpha_h[0][0] *= gmmLikelihood(observation, m.states[0], mRes.singleClassGmmModelResults[0]);
				mRes.instant_likelihood = mRes.alpha_h[0][0];
			}
			norm_const += mRes.instant_likelihood;
		}

		//================== NORMALIZE ALPHA VARIABLES =================//

		for(let i=0; i<this.model.models.length; i++) {

			let nstates = this.model.models[i].parameters.states;
			for(let e=0; e<3; e++) {
				for(let k=0; k<nstates; k++) {
					this.modelResults.singleClassHmmModelResults[i].alpha_h[e][k] /= norm_const;
				}
			}
		}

		this.forward_initialized = true;
	}

	//==================================================================//
	//======================== FORWARD UPDATE ==========================//
	//==================================================================//

	forwardUpdate(observation) {
		let norm_const = 0;
		let tmp = 0;
		let front; // array

		let nmodels = this.model.models.length;
	
		hhmmLikelihoodAlpha(1, this.frontier_v1, this.model, this.modelResults);
		hhmmLikelihoodAlpha(2, this.frontier_v2, this.model, this.modelResults);

		// let num_classes = 
		// let dstModelIndex = 0;

		for(let i=0; i<nmodels; i++) {

			let m = this.model.models[i];
			let nstates = m.parameters.states;
			let mRes = this.modelResults.singleClassHmmModelResults[i];
			
			//============= COMPUTE FRONTIER VARIABLE ============//

			front = new Array(nstates);
			for(let j=0; j<nstates; j++) {
				front[j] = 0;
			}

			if(m.parameters.transition_mode == 0) { ////////////////////// ergodic
				for(let k=0; k<nstates; k++) {
					for(let j=0; j<nstates; j++) {
						front[k] += m.transition[j * nstates + k] /
									(1 - m.exitProbabilities[j]) *
									mRes.alpha_h[0][j];
					}
					for(let srci=0; srci<nmodels; srci++) {
						front[k] += mRes.prior[k] *
									(
										this.frontier_v1[srci] * this.model.transition[srci][i] +
										this.model.prior[i] * this.frontier_v2[srci]
									);
					}
				}
			} else { //////////////////////////////////////////////////// left-right

				// k == 0 : first state of the primitive
				front[0] = m.transition[0] * mRes.alpha_h[0][0];

				for(let srci=0; srci<this.model.models.length; srci++) {
					front[0] += this.frontier_v1[srci] * this.model.transition[srci][i] +
								this.model.prior[i] * this.frontier_v2[srci];
				}

				// k > 0 : rest of the primitive
				for(let k=1; k<nstates; k++) {
					front[k] += m.transition[k * 2] /
								(1 - m.exitProbabilities[k]) *
								mRes.alpha_h[0][k];
					front[k] += m.transition[(k - 1) * 2 + 1] /
								(1 - m.exitProbabilities[k - 1]) *
								mRes.alpha_h[0][k - 1];
				}

				for(let j=0; j<3; j++) {
					for(let k=0; k<nstates; k++) {
						mRes.alpha_h[j][k] = 0;
					}
				}
			}

			//console.log(front);

			//============== UPDATE FORWARD VARIABLE =============//

			mRes.exit_likelihood = 0;
			mRes.instant_likelihood = 0;

			for(let k=0; k<nstates; k++) {
				tmp = gmmLikelihood(observation, m.states[k], mRes.singleClassGmmModelResults[k]) * front[k];

				mRes.alpha_h[2][k] = this.model.exit_transition[i] * m.exitProbabilities[k] * tmp;
				mRes.alpha_h[1][k] = (1 - this.model.exit_transition[i]) * m.exitProbabilities[k] * tmp;
				mRes.alpha_h[0][k] = (1 - m.exitProbabilities[k]) * tmp;

				mRes.exit_likelihood 	+= mRes.alpha_h[1][k] + mRes.alpha_h[2][k];
				mRes.instant_likelihood += mRes.alpha_h[0][k] + mRes.alpha_h[1][k] + mRes.alpha_h[2][k];

				norm_const += tmp;
			}

			mRes.exit_ratio = mRes.exit_likelihood / mRes.instant_likelihood;
		}

		//============== NORMALIZE ALPHA VARIABLES =============//

		for(let i=0; i<nmodels; i++) {
			for(let e=0; e<3; e++) {
				for(let k=0; k<this.model.models[i].parameters.states; k++) {
					this.modelResults.singleClassHmmModelResults[i].alpha_h[e][k] /= norm_const;
				}
			}
		}
	}

	//====================== UPDATE RESULTS ====================//

	updateResults() {
		let maxlog_likelihood = 0;
		let normconst_instant = 0;
		let normconst_smoothed = 0;

		let res = this.modelResults;

		for(let i=0; i<this.model.models.length; i++) {

			let hmmRes = res.singleClassHmmModelResults[i];

			res.instant_likelihoods[i] 		= hmmRes.instant_likelihood;
			res.smoothed_log_likelihoods[i] = hmmRes.log_likelihood;
			res.smoothed_likelihoods[i] 	= Math.exp(res.smoothed_log_likelihoods[i]);

			res.instant_normalized_likelihoods[i] 	= res.instant_likelihoods[i];
			res.smoothed_normalized_likelihoods[i] 	= res.smoothed_likelihoods[i];

			normconst_instant 	+= res.instant_normalized_likelihoods[i];
			normconst_smoothed 	+= res.smoothed_normalized_likelihoods[i];

			if(i==0 || res.smoothed_log_likelihoods[i] > maxlog_likelihood) {
				maxlog_likelihood = res.smoothed_log_likelihoods[i];
				res.likeliest = i;
			}
		}

		for(let i=0; i<this.model.models.length; i++) {
			res.instant_normalized_likelihoods[i] 	/= normconst_instant;
			res.smoothed_normalized_likelihoods[i] 	/= normconst_smoothed;
		}
	}
}

/*
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
		// not used for now (need to implement updateInverseCovariance method).
		// now accessible as training parameter of the child process.
	}

//*/
