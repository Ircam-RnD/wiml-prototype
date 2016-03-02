import io from 'socket.io-client';
import motionInput from 'motion-input';
import lfo from 'waves-lfo';

import InputProcessingChain from '../common/lfo-input-processing-chain';
import DataRecorder from '../common/lfo-data-recorder';
import XmmGmmDecoder from '../common/lfo-xmm-gmm-decoder';


// ==================== DOM elements =================== //

let recbut = document.querySelector('#rec-but');
let sendbut = document.querySelector('#send-but');
sendbut.disabled = true;
//let trainbut = document.querySelector('#train-but');
let getmodelsbut = document.querySelector('#getmodels-but');
let movelist = document.querySelector('#move-list');
let likeliest = document.querySelector('#likeliest-label-div');


// ===================== lfop graph ==================== //

const inputChain = new InputProcessingChain({
	windowSize: 256,
	hopSize: 16,
	//frameSize: 1
});
const dataRecorder = new DataRecorder({
	separateArrays: true
});
const gmmDecoder = new XmmGmmDecoder({
	likelihoodWindow: 3
});

const featuresBpf = new lfo.sinks.Bpf({
	radius: 5,
	min: 0,
	max: 1,
	canvas: document.querySelector('#features-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0f0', '#00f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

const signalBpf = new lfo.sinks.Bpf({
	radius: 0,
	min: 0,
	max: 1,
	canvas: document.querySelector('#signal-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#000'] // magnitude : Red, frequency : Green, periodicity : Blue
});

/*
// temporarily unavailable ...
const likelihoodsSpectro = new lfo.sinks.Spectrogram({
//const likelihoodsSpectro = new MySpectrogram({
	scale: 10,
	canvas: document.querySelector('#likelihoods-canvas'),
	color: '#f00'
});
//*/

//*
const likelihoodsBpf = new lfo.sinks.Bpf({
	radius: 5,
	min: 0,
	max: 1,
	canvas: document.querySelector('#likelihoods-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0f0', '#00f'] // magnitude : Red, frequency : Green, periodicity : Blue
});
//*/

inputChain.connect(dataRecorder);

inputChain.connect(gmmDecoder);

inputChain.preFramerConnect(signalBpf);
inputChain.connect(featuresBpf);

//gmmDecoder.connect(likelihoodsSpectro);
gmmDecoder.connect(likelihoodsBpf);

// GO !
inputChain.start();

const roundValue = (input) => {
	if (input === undefined)
		return 'undefined';
	if (input === null)
		return 'null';
	return Math.round(input * 100) / 100;
};

const feedInputChain = (module) => {
	if(module.isValid) {
		//*
		motionInput.addListener('energy', (val) => {
			inputChain.process(performance.now(), val);
		});
		//*/

		//*
		motionInput.addListener('rotationRate', (val) => {
			//here compute the equivalent of "spin" :
			let spin = Math.pow(val[0]*val[0] + val[1]*val[1] + val[2]*val[2], 0.5) * 0.1;
			inputChain.process(performance.now(), spin);
		});
		//*/
	}
};

(function() {
	motionInput
		.init(
			'energy',
			'rotationRate'
			)
		.then((modules) => {
			const energy = modules[0];
			const rotationRate = modules[1];
			//feedInputChain(energy);
			feedInputChain(energy);
		})
		.catch((err) => console.error(err.stack));
})();

// ================= socket operations ================== //

//let socket = io.connect('http://169.254.68.117:3000');
let socket = io.connect(location.host + '/wiml-client');
//let socket = io.connect('127.0.0.1:3000');

socket.on('confirm', (message) => {
	console.log('server confirms reception of message :');
	console.log(message);
});

// this could be probably improved (kind of callback from xmm)
socket.on('train', (message) => {
	if(message === 'ok') {
		// training worked, can request new models
	} else {
		console.error(message);
	}
})

// update model on new model reception from server :
socket.on('models', (models) => {
	//console.log(models);
	let m = models.models;
	if(Array.isArray(m) && m.length > 0) {
		//gmmDecoder.setModel(m[m.length - 1]);
		console.log(models.message);
		console.log(m[m.length - 1]);
		gmmDecoder.setModel(m[m.length - 1]);
	} else {
		console.log(models.message);
	}
});

// =================== UI interaction =================== //

recbut.addEventListener('click', () => {
	let state = recbut.className;
	if(state === 'rec-but') {
		recbut.className = 'stop-but';
		recbut.innerHTML = 'STOP'
		sendbut.disabled = true;
		// start recording some sensor and gps data
		dataRecorder.start();

	} else {
		recbut.className = 'rec-but';
		recbut.innerHTML = 'REC';
		sendbut.disabled = false;
		// stop recording data
		dataRecorder.stop();
	}
});

sendbut.addEventListener('click', () => {
	let move = movelist.options[movelist.selectedIndex].text;
	let res = confirm('You are about to send data labeled with "' + move + '". Confirm ?');
	if(res === true) {
		// send recorded data to server :
		let phrase = dataRecorder.getRecordedPhrase();
		phrase.label = move;
		phrase.date = new Date();
		socket.emit('writePhrase', phrase);
		sendbut.disabled = true;
	} else {
		sendbut.disabled = false;
	}
});

/*
trainbut.addEventListener('click', () => {
	socket.emit('trainModels');
});

getmodelsbut.addEventListener('click', () => {
	socket.emit('getModels');
});
//*/

getmodelsbut.addEventListener('click', () => {
	socket.emit('trainModels');
});


(() => {
	const updateLikeliest = (del) => {
		likeliest.innerHTML = gmmDecoder.likeliestLabel;
		setTimeout(updateLikeliest, del);
	}

	updateLikeliest(200);
})();

// =============== sensors simulation for desktop ============== //
//*
(function() {

	function generandom() {
		let ret = [];
		for(let i=0; i<1; i++) {
			ret.push(Math.random() * 2 - 1);
		}

		let v = Math.random() * 2 - 1;
		inputChain.process(null, v);

		delay(Math.random() * 10 + 100);
	}

	function delay(del) {
		setTimeout(generandom, del);
	}

	// uncomment to send random signal if no sensors available :
	// generandom();

})();
//*/