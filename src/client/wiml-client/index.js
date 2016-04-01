import io from 'socket.io-client';
import motionInput from 'motion-input';
import lfo from 'waves-lfo';

import InputProcessingChain from '../common/lfo-input-processing-chain';
import DataRecorder from '../common/lfo-data-recorder';
import XmmGmmDecoder from '../common/lfo-xmm-gmm-decoder';
import AudioPlayer from '../common/audio-player.js';



// ==================== DOM elements =================== //

//let soundmute = document.querySelector('#soundmute');
let recbut = document.querySelector('#rec-but');
let sendbut = document.querySelector('#send-but');
sendbut.disabled = true;
//let trainbut = document.querySelector('#train-but');
let getmodelsbut = document.querySelector('#getmodels-but');
let movelist = document.querySelector('#move-list');
let likeliest = document.querySelector('#likeliest-label-div');

// ================== SONIFICATION ==================== //

/*
let audiotags = [];
let fadeFunctions = [];

for(let i=0; i<6; i++) {
	let el = document.createElement("audio");
	audiotags.push(el);
	//audiotags[audiotags.length-1].setAttribute("autoplay", true);
	audiotags[audiotags.length-1].setAttribute("preload", "automatic")
	audiotags[audiotags.length-1].setAttribute("controls", "true")
	audiotags[audiotags.length-1].setAttribute("loop", "true");
}
audiotags[0].setAttribute("src", "sounds/323800__reacthor__blood-drone.mp3")
//audiotags[1].setAttribute("src", "sounds/sound.mp3");
audiotags[2].setAttribute("src", "sounds/89953__greg-baumont__oberheimxpanderrandomdrone.mp3");
//audiotags[3].setAttribute("src", "sounds/sound.mp3");
audiotags[4].setAttribute("src", "sounds/324395__felipejordani__004-alien-machine-ii.mp3");
//audiotags[5].setAttribute("src", "sounds/sound.mp3");

let audiodiv = document.querySelector("#audiodiv");
for(let i=0; i<audiotags.length; i++) {
	audiodiv.appendChild(audiotags[i]);
}

document.body.addEventListener('touchend', () => {
	for(let i=0; i<audiotags.length; i++) {
		audiotags[i].volume = 0;
		audiotags[i].play();
		audiotags[i].volume = 0;
	}
});

for(let i=0; i<audiotags.length; i++) {
	fadeFunctions.push((audiotag, targetVal, duration) => {
		let interval = 100;
		let inc = (targetVal - audiotag.volume) / (duration / interval)
		console.log(audiotag.volume + " -> " + targetVal + " " + inc);
		if(inc == 0) return;
		let fade = setInterval(() => {
			if(Math.abs(audiotag.volume - targetVal) > Math.abs(inc)) {
				audiotag.volume += inc;
				//console.log(audiotag.volume);
			}

			if(Math.abs(audiotag.volume - targetVal) < Math.abs(inc)) {
				audiotag.volume = targetVal;
				clearInterval(fade);
			}

		}, interval);
	});
}

const changeSounds = (label) => {

	switch (label) {
		case 'Still':
			for(let i=0; i<audiotags.length; i++) {
				if(i == 0) {
					fadeFunctions[i](audiotags[i], 1, 2000);
				} else {
					fadeFunctions[i](audiotags[i], 0, 2000);
				}
			}
			break;

		case 'Walk':
			for(let i=0; i<audiotags.length; i++) {
				if(i == 2) {
					fadeFunctions[i](audiotags[i], 1, 2000);
				} else {
					fadeFunctions[i](audiotags[i], 0, 2000);
				}
			}
			break;

		case 'Run':
			for(let i=0; i<audiotags.length; i++) {
				if(i == 4) {
					fadeFunctions[i](audiotags[i], 1, 2000);
				} else {
					fadeFunctions[i](audiotags[i], 0, 2000);
				}
			}
			break;

		default:
			break;
	}
}
//*/

// =================== the Web Audio way ================== //

//*
let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};
let context = new AudioContext();

let touched = false;
let loaded = 0;

document.body.addEventListener('touchend', () => {
	if(touched || loaded < 3) return;
	touched = true;
	for(let i=0; i<players.length; i++) {
		console.log(i + ' : start !');
		players[i].start();
	}
});

let players = [];
players.length = 3;

const ajaxReqs = [];
ajaxReqs.length = 3;

const loadSound = (url, index, trig) => {
	const req = new XMLHttpRequest();
	ajaxReqs[index] = req;
	req.open('GET', url, true);
	req.responseType = 'arraybuffer';

	req.onload = () => {
		context.decodeAudioData(req.response, (buffer) => {
			//const player = new AudioPlayer(context, buffer);
			//console.log("loaded !");
			players[index] = new AudioPlayer(context, buffer);
			console.log(url + " loaded !");
			trig(players.length-1);
		});
	};
	req.send();
}

//loadSound("sounds/44652__simondsouza__hip-hop-groove.mp3", 0, () => { loaded++; });
loadSound("sounds/bubulle_harmo.mp3", 0, () => { loaded++; });
loadSound("sounds/marchesynth_duck.mp3", 1, () => { loaded++; });
loadSound("sounds/tex01-23_cartoon_loop.mp3", 2, () => { loaded++; });
//*/

const changeSounds = (label) => {

	//console.log(players.length);
	switch (label) {
		case 'Still':
			for(let i=0; i<players.length; i++) {
				if(i==0) {
					players[i].fade(1.0, 1000);
				} else {
					players[i].fade(0.0, 1000);
				}
			}
			break;

		case 'Walk':
			for(let i=0; i<players.length; i++) {
				if(i==1) {
					players[i].fade(1.0, 1000);
				} else {
					players[i].fade(0.0, 1000);
				}
			}
			break;

		case 'Run':
			for(let i=0; i<players.length; i++) {
				if(i==2) {
					players[i].fade(1.0, 1000);
				} else {
					players[i].fade(0.0, 1000);
				}
			}
			break;

		default:
			break;
	}
}

// ===================== lfop graph ==================== //

const inputChain = new InputProcessingChain({
	windowSize: 64,
	hopSize: 16,
	frameSize: 64,
	period: 20
});
const dataRecorder = new DataRecorder({
	separateArrays: true
});
const gmmDecoder = new XmmGmmDecoder({
	likelihoodWindow: 2
});

const featuresBpf = new lfo.sinks.Bpf({
	radius: 5,
	min: 0,
	max: 1,
	canvas: document.querySelector('#features-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

const signalBpf = new lfo.sinks.Bpf({
	frameSize: 1,
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
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
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
		/*
		motionInput.addListener('energy', (val) => {
			inputChain.process(performance.now(), val);
		});
		//*/

		//*
		motionInput.addListener('rotationRate', (val) => {
			//here compute the equivalent of "spin" :
			let spin = Math.pow(val[0]*val[0] + val[1]*val[1] + val[2]*val[2], 0.5) * 0.003;
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
			feedInputChain(rotationRate);
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
	console.log(models);
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


getmodelsbut.addEventListener('click', () => {
	socket.emit('trainModels');
});

// ===================== PAGE INITIALIZATION =================== //

(() => {
	const updateLikeliest = (del) => {
		//let newLabel = gmmDecoder.likeliestLabel;

		if(gmmDecoder.likeliestLabel !== likeliest.innerHTML) {
			changeSounds(gmmDecoder.likeliestLabel);
		}
		likeliest.innerHTML = gmmDecoder.likeliestLabel;//newLabel;
		setTimeout(updateLikeliest, del);
	}

	updateLikeliest(200);
})();

// =============== sensors mocking for desktop ============== //
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