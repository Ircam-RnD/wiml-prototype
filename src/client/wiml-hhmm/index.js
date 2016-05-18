import io from 'socket.io-client';
import motionInput from 'motion-input';
import * as lfo from 'waves-lfo';

import Resampler from '../common/lfo-resampler';
import Select from '../common/lfo-select';
import DataRecorder from '../common/lfo-data-recorder';
import XmmHhmmDecoder from '../common/lfo-xmm-hhmm-decoder';

let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};

// from : http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
function getBrowser(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
}

//and for os (in case), see : http://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript

let rads = false;
if(getBrowser().name === 'Chrome') {
	rads = true;
	console.log('switching to rads mode for rotationRate');
}

let recbut = document.querySelector('#rec-but');
let sendbut = document.querySelector('#send-but');
sendbut.disabled = true;
//let trainbut = document.querySelector('#train-but');
let getmodelsbut = document.querySelector('#getmodels-but');
let movelist = document.querySelector('#move-list');
let likeliest = document.querySelector('#likeliest-label-div');


//======================== LFOp's =======================//

const eventIn = new lfo.sources.EventIn({
	frameSize: 6,
	ctx: AudioContext
});

const resampler = new Resampler({});

const dataRecorder = new DataRecorder({
	column_names: ['accelX', 'accelY', 'accelZ', 'rotX', 'rotY', 'rotZ']
});

const hhmmDecoder = new XmmHhmmDecoder({});

const select = new Select({
	mode: "passthru" // anything else than "include" or "exclude" passes through
});

const inputBpf = new lfo.sinks.Bpf({
	radius: 0,
	min: -4,
	max: 4,
	canvas: document.querySelector('#rawinput-canvas'),
	duration: 1000,// * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0c0', '#33f', '#333', '#333', '#333'] // magnitude : Red, frequency : Green, periodicity : Blue	
});

const likelihoodsSpectro = new lfo.sinks.Spectrogram({
	scale: 1,
	min: 0,
	max: 1
	canvas: document.querySelector('#likelihoods-canvas'),
	duration: 1000,
	color: '#333'
});

const statesSpectro = new lfo.sinks.Spectrogram({
	scale: 1,
	canvas: document.querySelector('#states-canvas'),
	duration: 1000,
	color: '#333'
})

eventIn.connect(resampler);

resampler.connect(inputBpf);

resampler.connect(dataRecorder);

resampler.connect(hhmmDecoder);
hhmmDecoder.connect(likelihoodsSpectro);
hhmmDecoder.connect(statesSpectro);

eventIn.start();

//======================================================//

let sensors = new Array(6);
for(let i=0; i<6; i++) {
	sensors[i] = 0;
}

const feedInputChain = (module) => {
	if(module.isValid) {

		//*
		motionInput.addListener('acceleration', (val) => {
			//inputChain.process(performance.now(), val);
			for(let i=0; i<3; i++) {
				sensors[i] = val[i];
			}
			eventIn.process(performance.now(), sensors);
			//console.log(sensors);
		});
		//*/

		//*
		motionInput.addListener('rotationRate', (val) => {
			//here compute the equivalent of "spin" :
			let valStd = val.slice(0);
			if(rads) {
				for(let i=0; i<3; i++) {
					valStd[i] *= (180/Math.PI);
				}
			}
			let spin = Math.pow(valStd[0]*valStd[0] + valStd[1]*valStd[1] + valStd[2]*valStd[2], 0.5) * 0.003;
			//inputChain.process(performance.now(), spin);

			// THE REAL CODE :
			for(let i=0; i<3; i++) {
				sensors[i+3] = val[i];
			}
			eventIn.process(performance.now(), sensors);
			//console.log(sensors);

		});
		//*/
	}
};

(function() {
	motionInput
		.init(
			'acceleration',
			//'accelerationIncludingGravity',
			'rotationRate'
			)
		.then((modules) => {
			const acceleration = modules[0];
			const rotationRate = modules[1];
			feedInputChain(acceleration);
			feedInputChain(rotationRate);
		})
		.catch((err) => console.error(err.stack));
})();

// ================= socket operations ================== //

//let socket = io.connect('http://169.254.68.117:3000');
let socket = io.connect(location.host + '/wiml-hhmm');
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
		hhmmDecoder.setModel(m[m.length - 1]);
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

		if(hhmmDecoder.likeliestLabel !== likeliest.innerHTML) {
			//changeSounds(hhmmDecoder.likeliestLabel);
		}
		likeliest.innerHTML = hhmmDecoder.likeliestLabel;//newLabel;
		setTimeout(updateLikeliest, del);
	}

	updateLikeliest(200);
})();
