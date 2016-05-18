import io from 'socket.io-client';
import motionInput from 'motion-input';
import * as lfo from 'waves-lfo';

//import Select from '../common/lfo-select';
import Intensity from '../common/lfo-intensity';
import InputProcessingChain from '../common/lfo-input-processing-chain';
import DataRecorder from '../common/lfo-data-recorder';
import XmmGmmDecoder from '../common/lfo-xmm-gmm-decoder';
import AudioPlayer from '../common/audio-player.js';

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

//===================== CooooooKies ! ===================//

/*
const setCookie = (cname,cvalue,exdays) => {
    let d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires=" + d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires+"; path=/";
}

const getCookie = (cname) => {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i=0; i<ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

const checkCookie = () => {
    let user=getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
       user = prompt("Please enter your name:","");
       if (user != "" && user != null) {
           setCookie("username", user, 30);
       }
    }
}
//*/

//checkCookie(); 

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

// =================== the Web Audio way ================== //

//*
let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};
let context = new AudioContext();

let touched = false;
let loaded = 0;

/*
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

loadSound("sounds/bubulle_harmo.mp3", 0, () => { loaded++; });
loadSound("sounds/marchesynth_duck.mp3", 1, () => { loaded++; });
loadSound("sounds/tex01-23_cartoon_loop.mp3", 2, () => { loaded++; });

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
//*/

const changeSounds = (label) => {};

// ===================== lfop graph ==================== //

const eventIn = new lfo.sources.EventIn({
	//relative: true,
	frameSize: 1,//this.params.inputFrameSize,
	ctx: AudioContext
});

const intensity = new Intensity({

});

const inputChain = new InputProcessingChain({
	// windowSize: 64,
	// hopSize: 16,
	// frameSize: 64,
	// period: 20
	windowSize: 64,
	hopSize: 16,
	frameSize: 64,
	period: 20
});
const dataRecorder = new DataRecorder({
	//separateArrays: true,
	//frameSize: 3, // <=> dimension
	column_names: ['magnitude', 'frequency', 'periodicity']
});
const gmmDecoder = new XmmGmmDecoder({
	likelihoodWindow: 5
});

const featuresBpf = new lfo.sinks.Bpf({
	//frameSize: 3,
	radius: 1,
	min: 0,
	max: 1,
	canvas: document.querySelector('#features-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

const signalBpf = new lfo.sinks.Bpf({
	//frameSize: 1,
	radius: 0,
	min: 0,
	max: 1,
	canvas: document.querySelector('#signal-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#000'] // magnitude : Red, frequency : Green, periodicity : Blue
});

//*
// temporarily unavailable ...
const likelihoodsSpectro = new lfo.sinks.Spectrogram({
//const likelihoodsSpectro = new MySpectrogram({
	scale: 10,
	canvas: document.querySelector('#likelihoods-canvas'),
	color: '#f00'
});
//*/

/*
const likelihoodsBpf = new lfo.sinks.Bpf({
	radius: 1,
	min: 0,
	max: 1,
	canvas: document.querySelector('#likelihoods-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});
//*/

//intensity.connect(inputChain)

inputChain.connect(dataRecorder);

inputChain.connect(gmmDecoder);

inputChain.preFramerConnect(signalBpf);
inputChain.connect(featuresBpf);

gmmDecoder.connect(likelihoodsSpectro);
//gmmDecoder.connect(likelihoodsBpf);

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

		/*
		motionInput.addListener('acceleration', (val) => {
			inputChain.process(performance.now(), val);
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
let socket = io.connect(location.host + '/wiml-gmm');
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
		console.log(phrase);
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