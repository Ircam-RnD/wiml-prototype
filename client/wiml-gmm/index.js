'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

var _motionInput = require('motion-input');

var _motionInput2 = _interopRequireDefault(_motionInput);

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

//import Select from '../common/lfo-select';

var _commonLfoIntensity = require('../common/lfo-intensity');

var _commonLfoIntensity2 = _interopRequireDefault(_commonLfoIntensity);

var _commonLfoInputProcessingChain = require('../common/lfo-input-processing-chain');

var _commonLfoInputProcessingChain2 = _interopRequireDefault(_commonLfoInputProcessingChain);

var _commonLfoDataRecorder = require('../common/lfo-data-recorder');

var _commonLfoDataRecorder2 = _interopRequireDefault(_commonLfoDataRecorder);

var _commonLfoXmmGmmDecoder = require('../common/lfo-xmm-gmm-decoder');

var _commonLfoXmmGmmDecoder2 = _interopRequireDefault(_commonLfoXmmGmmDecoder);

var _commonAudioPlayerJs = require('../common/audio-player.js');

var _commonAudioPlayerJs2 = _interopRequireDefault(_commonAudioPlayerJs);

// from : http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
function getBrowser() {
	var ua = navigator.userAgent,
	    tem,
	    M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
	if (/trident/i.test(M[1])) {
		tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
		return { name: 'IE', version: tem[1] || '' };
	}
	if (M[1] === 'Chrome') {
		tem = ua.match(/\bOPR\/(\d+)/);
		if (tem != null) {
			return { name: 'Opera', version: tem[1] };
		}
	}
	M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
	if ((tem = ua.match(/version\/(\d+)/i)) != null) {
		M.splice(1, 1, tem[1]);
	}
	return {
		name: M[0],
		version: M[1]
	};
}

//and for os (in case), see : http://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript

var rads = false;
if (getBrowser().name === 'Chrome') {
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
var recbut = document.querySelector('#rec-but');
var sendbut = document.querySelector('#send-but');
sendbut.disabled = true;
//let trainbut = document.querySelector('#train-but');
var getmodelsbut = document.querySelector('#getmodels-but');
var movelist = document.querySelector('#move-list');
var likeliest = document.querySelector('#likeliest-label-div');

// ================== SONIFICATION ==================== //

// =================== the Web Audio way ================== //

//*
var AudioContext = window.AudioContext || window.webkitAudioContext || function () {};
var context = new AudioContext();

var touched = false;
var loaded = 0;

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

var changeSounds = function changeSounds(label) {};

// ===================== lfop graph ==================== //

var eventIn = new lfo.sources.EventIn({
	//relative: true,
	frameSize: 1, //this.params.inputFrameSize,
	ctx: AudioContext
});

var intensity = new _commonLfoIntensity2['default']({});

var inputChain = new _commonLfoInputProcessingChain2['default']({
	// windowSize: 64,
	// hopSize: 16,
	// frameSize: 64,
	// period: 20
	windowSize: 64,
	hopSize: 16,
	frameSize: 64,
	period: 20
});
var dataRecorder = new _commonLfoDataRecorder2['default']({
	//separateArrays: true,
	//frameSize: 3, // <=> dimension
	column_names: ['magnitude', 'frequency', 'periodicity']
});
var gmmDecoder = new _commonLfoXmmGmmDecoder2['default']({
	likelihoodWindow: 5
});

var featuresBpf = new lfo.sinks.Bpf({
	//frameSize: 3,
	radius: 1,
	min: 0,
	max: 1,
	canvas: document.querySelector('#features-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

var signalBpf = new lfo.sinks.Bpf({
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
var likelihoodsSpectro = new lfo.sinks.Spectrogram({
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

var roundValue = function roundValue(input) {
	if (input === undefined) return 'undefined';
	if (input === null) return 'null';
	return Math.round(input * 100) / 100;
};

var feedInputChain = function feedInputChain(module) {
	if (module.isValid) {
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
		_motionInput2['default'].addListener('rotationRate', function (val) {
			//here compute the equivalent of "spin" :
			var valStd = val.slice(0);
			if (rads) {
				for (var i = 0; i < 3; i++) {
					valStd[i] *= 180 / Math.PI;
				}
			}
			var spin = Math.pow(valStd[0] * valStd[0] + valStd[1] * valStd[1] + valStd[2] * valStd[2], 0.5) * 0.003;
			inputChain.process(performance.now(), spin);
		});
		//*/
	}
};

(function () {
	_motionInput2['default'].init('energy', 'rotationRate').then(function (modules) {
		var energy = modules[0];
		var rotationRate = modules[1];
		//feedInputChain(energy);
		feedInputChain(rotationRate);
	})['catch'](function (err) {
		return console.error(err.stack);
	});
})();

// ================= socket operations ================== //

//let socket = io.connect('http://169.254.68.117:3000');
var socket = _socketIoClient2['default'].connect(location.host + '/wiml-gmm');
//let socket = io.connect('127.0.0.1:3000');

socket.on('confirm', function (message) {
	console.log('server confirms reception of message :');
	console.log(message);
});

// this could be probably improved (kind of callback from xmm)
socket.on('train', function (message) {
	if (message === 'ok') {
		// training worked, can request new models
	} else {
			console.error(message);
		}
});

// update model on new model reception from server :
socket.on('models', function (models) {
	console.log(models);
	var m = models.models;
	if (Array.isArray(m) && m.length > 0) {
		//gmmDecoder.setModel(m[m.length - 1]);
		console.log(models.message);
		console.log(m[m.length - 1]);
		gmmDecoder.setModel(m[m.length - 1]);
	} else {
		console.log(models.message);
	}
});

// =================== UI interaction =================== //

recbut.addEventListener('click', function () {
	var state = recbut.className;
	if (state === 'rec-but') {
		recbut.className = 'stop-but';
		recbut.innerHTML = 'STOP';
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

sendbut.addEventListener('click', function () {
	var move = movelist.options[movelist.selectedIndex].text;
	var res = confirm('You are about to send data labeled with "' + move + '". Confirm ?');
	if (res === true) {
		// send recorded data to server :
		var phrase = dataRecorder.getRecordedPhrase();
		phrase.label = move;
		phrase.date = new Date();
		socket.emit('writePhrase', phrase);
		console.log(phrase);
		sendbut.disabled = true;
	} else {
		sendbut.disabled = false;
	}
});

getmodelsbut.addEventListener('click', function () {
	socket.emit('trainModels');
});

// ===================== PAGE INITIALIZATION =================== //

(function () {
	var updateLikeliest = function updateLikeliest(del) {
		//let newLabel = gmmDecoder.likeliestLabel;

		if (gmmDecoder.likeliestLabel !== likeliest.innerHTML) {
			changeSounds(gmmDecoder.likeliestLabel);
		}
		likeliest.innerHTML = gmmDecoder.likeliestLabel; //newLabel;
		setTimeout(updateLikeliest, del);
	};

	updateLikeliest(200);
})();

// =============== sensors mocking for desktop ============== //
//*
(function () {

	function generandom() {
		var ret = [];
		for (var i = 0; i < 1; i++) {
			ret.push(Math.random() * 2 - 1);
		}

		var v = Math.random() * 2 - 1;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvd2ltbC1nbW0vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzhCQUFlLGtCQUFrQjs7OzsyQkFDVCxjQUFjOzs7O3dCQUNqQixXQUFXOztJQUFwQixHQUFHOzs7O2tDQUdPLHlCQUF5Qjs7Ozs2Q0FDZCxzQ0FBc0M7Ozs7cUNBQzlDLDZCQUE2Qjs7OztzQ0FDNUIsK0JBQStCOzs7O21DQUNqQywyQkFBMkI7Ozs7O0FBR25ELFNBQVMsVUFBVSxHQUFFO0FBQ2pCLEtBQUksRUFBRSxHQUFDLFNBQVMsQ0FBQyxTQUFTO0tBQUMsR0FBRztLQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLDhEQUE4RCxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2hILEtBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUNyQixLQUFHLEdBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNyQyxTQUFPLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFFLEVBQUUsQUFBQyxFQUFDLENBQUM7RUFDdkM7QUFDTCxLQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBRyxRQUFRLEVBQUM7QUFDZixLQUFHLEdBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQTtBQUM1QixNQUFHLEdBQUcsSUFBRSxJQUFJLEVBQUk7QUFBQyxVQUFPLEVBQUMsSUFBSSxFQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7R0FBQztFQUN2RDtBQUNMLEVBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUUsQ0FBQyxTQUFTLENB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QyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQ2hDOztBQUVELE1BQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLFlBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDOztBQUU1QixPQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQztFQUNoQzs7QUFFRCxVQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUU7QUFDbkIsWUFBVSxDQUFDLFVBQVUsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUM1Qjs7OztDQUtELENBQUEsRUFBRyxDQUFDIiwiZmlsZSI6InNyYy9jbGllbnQvd2ltbC1nbW0vaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW8gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XG5pbXBvcnQgbW90aW9uSW5wdXQgZnJvbSAnbW90aW9uLWlucHV0JztcbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuXG4vL2ltcG9ydCBTZWxlY3QgZnJvbSAnLi4vY29tbW9uL2xmby1zZWxlY3QnO1xuaW1wb3J0IEludGVuc2l0eSBmcm9tICcuLi9jb21tb24vbGZvLWludGVuc2l0eSc7XG5pbXBvcnQgSW5wdXRQcm9jZXNzaW5nQ2hhaW4gZnJvbSAnLi4vY29tbW9uL2xmby1pbnB1dC1wcm9jZXNzaW5nLWNoYWluJztcbmltcG9ydCBEYXRhUmVjb3JkZXIgZnJvbSAnLi4vY29tbW9uL2xmby1kYXRhLXJlY29yZGVyJztcbmltcG9ydCBYbW1HbW1EZWNvZGVyIGZyb20gJy4uL2NvbW1vbi9sZm8teG1tLWdtbS1kZWNvZGVyJztcbmltcG9ydCBBdWRpb1BsYXllciBmcm9tICcuLi9jb21tb24vYXVkaW8tcGxheWVyLmpzJztcblxuLy8gZnJvbSA6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvNTkxNjkwMC9ob3ctY2FuLXlvdS1kZXRlY3QtdGhlLXZlcnNpb24tb2YtYS1icm93c2VyXG5mdW5jdGlvbiBnZXRCcm93c2VyKCl7XG4gICAgdmFyIHVhPW5hdmlnYXRvci51c2VyQWdlbnQsdGVtLE09dWEubWF0Y2goLyhvcGVyYXxjaHJvbWV8c2FmYXJpfGZpcmVmb3h8bXNpZXx0cmlkZW50KD89XFwvKSlcXC8/XFxzKihcXGQrKS9pKSB8fCBbXTsgXG4gICAgaWYoL3RyaWRlbnQvaS50ZXN0KE1bMV0pKXtcbiAgICAgICAgdGVtPS9cXGJydlsgOl0rKFxcZCspL2cuZXhlYyh1YSkgfHwgW107IFxuICAgICAgICByZXR1cm4ge25hbWU6J0lFJyx2ZXJzaW9uOih0ZW1bMV18fCcnKX07XG4gICAgICAgIH0gICBcbiAgICBpZihNWzFdPT09J0Nocm9tZScpe1xuICAgICAgICB0ZW09dWEubWF0Y2goL1xcYk9QUlxcLyhcXGQrKS8pXG4gICAgICAgIGlmKHRlbSE9bnVsbCkgICB7cmV0dXJuIHtuYW1lOidPcGVyYScsIHZlcnNpb246dGVtWzFdfTt9XG4gICAgICAgIH0gICBcbiAgICBNPU1bMl0/IFtNWzFdLCBNWzJdXTogW25hdmlnYXRvci5hcHBOYW1lLCBuYXZpZ2F0b3IuYXBwVmVyc2lvbiwgJy0/J107XG4gICAgaWYoKHRlbT11YS5tYXRjaCgvdmVyc2lvblxcLyhcXGQrKS9pKSkhPW51bGwpIHtNLnNwbGljZSgxLDEsdGVtWzFdKTt9XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IE1bMF0sXG4gICAgICB2ZXJzaW9uOiBNWzFdXG4gICAgfTtcbn1cblxuLy9hbmQgZm9yIG9zIChpbiBjYXNlKSwgc2VlIDogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy85NTE0MTc5L2hvdy10by1maW5kLXRoZS1vcGVyYXRpbmctc3lzdGVtLXZlcnNpb24tdXNpbmctamF2YXNjcmlwdFxuXG5sZXQgcmFkcyA9IGZhbHNlO1xuaWYoZ2V0QnJvd3NlcigpLm5hbWUgPT09ICdDaHJvbWUnKSB7XG5cdHJhZHMgPSB0cnVlO1xuXHRjb25zb2xlLmxvZygnc3dpdGNoaW5nIHRvIHJhZHMgbW9kZSBmb3Igcm90YXRpb25SYXRlJyk7XG59XG5cbi8vPT09PT09PT09PT09PT09PT09PT09IENvb29vb29LaWVzICEgPT09PT09PT09PT09PT09PT09PS8vXG5cbi8qXG5jb25zdCBzZXRDb29raWUgPSAoY25hbWUsY3ZhbHVlLGV4ZGF5cykgPT4ge1xuICAgIGxldCBkID0gbmV3IERhdGUoKTtcbiAgICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoZXhkYXlzKjI0KjYwKjYwKjEwMDApKTtcbiAgICBsZXQgZXhwaXJlcyA9IFwiZXhwaXJlcz1cIiArIGQudG9HTVRTdHJpbmcoKTtcbiAgICBkb2N1bWVudC5jb29raWUgPSBjbmFtZStcIj1cIitjdmFsdWUrXCI7IFwiK2V4cGlyZXMrXCI7IHBhdGg9L1wiO1xufVxuXG5jb25zdCBnZXRDb29raWUgPSAoY25hbWUpID0+IHtcbiAgICBsZXQgbmFtZSA9IGNuYW1lICsgXCI9XCI7XG4gICAgbGV0IGNhID0gZG9jdW1lbnQuY29va2llLnNwbGl0KCc7Jyk7XG4gICAgZm9yKGxldCBpPTA7IGk8Y2EubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgbGV0IGMgPSBjYVtpXTtcbiAgICAgICAgd2hpbGUgKGMuY2hhckF0KDApPT0nICcpIGMgPSBjLnN1YnN0cmluZygxKTtcbiAgICAgICAgaWYgKGMuaW5kZXhPZihuYW1lKSA9PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gYy5zdWJzdHJpbmcobmFtZS5sZW5ndGgsIGMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gXCJcIjtcbn1cblxuY29uc3QgY2hlY2tDb29raWUgPSAoKSA9PiB7XG4gICAgbGV0IHVzZXI9Z2V0Q29va2llKFwidXNlcm5hbWVcIik7XG4gICAgaWYgKHVzZXIgIT0gXCJcIikge1xuICAgICAgICBhbGVydChcIldlbGNvbWUgYWdhaW4gXCIgKyB1c2VyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgIHVzZXIgPSBwcm9tcHQoXCJQbGVhc2UgZW50ZXIgeW91ciBuYW1lOlwiLFwiXCIpO1xuICAgICAgIGlmICh1c2VyICE9IFwiXCIgJiYgdXNlciAhPSBudWxsKSB7XG4gICAgICAgICAgIHNldENvb2tpZShcInVzZXJuYW1lXCIsIHVzZXIsIDMwKTtcbiAgICAgICB9XG4gICAgfVxufVxuLy8qL1xuXG4vL2NoZWNrQ29va2llKCk7IFxuXG4vLyA9PT09PT09PT09PT09PT09PT09PSBET00gZWxlbWVudHMgPT09PT09PT09PT09PT09PT09PSAvL1xuXG4vL2xldCBzb3VuZG11dGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc291bmRtdXRlJyk7XG5sZXQgcmVjYnV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3JlYy1idXQnKTtcbmxldCBzZW5kYnV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NlbmQtYnV0Jyk7XG5zZW5kYnV0LmRpc2FibGVkID0gdHJ1ZTtcbi8vbGV0IHRyYWluYnV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3RyYWluLWJ1dCcpO1xubGV0IGdldG1vZGVsc2J1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNnZXRtb2RlbHMtYnV0Jyk7XG5sZXQgbW92ZWxpc3QgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbW92ZS1saXN0Jyk7XG5sZXQgbGlrZWxpZXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpa2VsaWVzdC1sYWJlbC1kaXYnKTtcblxuLy8gPT09PT09PT09PT09PT09PT09IFNPTklGSUNBVElPTiA9PT09PT09PT09PT09PT09PT09PSAvL1xuXG4vLyA9PT09PT09PT09PT09PT09PT09IHRoZSBXZWIgQXVkaW8gd2F5ID09PT09PT09PT09PT09PT09PSAvL1xuXG4vLypcbmxldCBBdWRpb0NvbnRleHQgPSB3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgZnVuY3Rpb24oKXt9O1xubGV0IGNvbnRleHQgPSBuZXcgQXVkaW9Db250ZXh0KCk7XG5cbmxldCB0b3VjaGVkID0gZmFsc2U7XG5sZXQgbG9hZGVkID0gMDtcblxuLypcbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAoKSA9PiB7XG5cdGlmKHRvdWNoZWQgfHwgbG9hZGVkIDwgMykgcmV0dXJuO1xuXHR0b3VjaGVkID0gdHJ1ZTtcblx0Zm9yKGxldCBpPTA7IGk8cGxheWVycy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnNvbGUubG9nKGkgKyAnIDogc3RhcnQgIScpO1xuXHRcdHBsYXllcnNbaV0uc3RhcnQoKTtcblx0fVxufSk7XG5cbmxldCBwbGF5ZXJzID0gW107XG5wbGF5ZXJzLmxlbmd0aCA9IDM7XG5cbmNvbnN0IGFqYXhSZXFzID0gW107XG5hamF4UmVxcy5sZW5ndGggPSAzO1xuXG5jb25zdCBsb2FkU291bmQgPSAodXJsLCBpbmRleCwgdHJpZykgPT4ge1xuXHRjb25zdCByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblx0YWpheFJlcXNbaW5kZXhdID0gcmVxO1xuXHRyZXEub3BlbignR0VUJywgdXJsLCB0cnVlKTtcblx0cmVxLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG5cblx0cmVxLm9ubG9hZCA9ICgpID0+IHtcblx0XHRjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShyZXEucmVzcG9uc2UsIChidWZmZXIpID0+IHtcblx0XHRcdC8vY29uc3QgcGxheWVyID0gbmV3IEF1ZGlvUGxheWVyKGNvbnRleHQsIGJ1ZmZlcik7XG5cdFx0XHQvL2NvbnNvbGUubG9nKFwibG9hZGVkICFcIik7XG5cdFx0XHRwbGF5ZXJzW2luZGV4XSA9IG5ldyBBdWRpb1BsYXllcihjb250ZXh0LCBidWZmZXIpO1xuXHRcdFx0Y29uc29sZS5sb2codXJsICsgXCIgbG9hZGVkICFcIik7XG5cdFx0XHR0cmlnKHBsYXllcnMubGVuZ3RoLTEpO1xuXHRcdH0pO1xuXHR9O1xuXHRyZXEuc2VuZCgpO1xufVxuXG5sb2FkU291bmQoXCJzb3VuZHMvYnVidWxsZV9oYXJtby5tcDNcIiwgMCwgKCkgPT4geyBsb2FkZWQrKzsgfSk7XG5sb2FkU291bmQoXCJzb3VuZHMvbWFyY2hlc3ludGhfZHVjay5tcDNcIiwgMSwgKCkgPT4geyBsb2FkZWQrKzsgfSk7XG5sb2FkU291bmQoXCJzb3VuZHMvdGV4MDEtMjNfY2FydG9vbl9sb29wLm1wM1wiLCAyLCAoKSA9PiB7IGxvYWRlZCsrOyB9KTtcblxuY29uc3QgY2hhbmdlU291bmRzID0gKGxhYmVsKSA9PiB7XG5cblx0Ly9jb25zb2xlLmxvZyhwbGF5ZXJzLmxlbmd0aCk7XG5cdHN3aXRjaCAobGFiZWwpIHtcblx0XHRjYXNlICdTdGlsbCc6XG5cdFx0XHRmb3IobGV0IGk9MDsgaTxwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGk9PTApIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMS4wLCAxMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMC4wLCAxMDAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdXYWxrJzpcblx0XHRcdGZvcihsZXQgaT0wOyBpPHBsYXllcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoaT09MSkge1xuXHRcdFx0XHRcdHBsYXllcnNbaV0uZmFkZSgxLjAsIDEwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBsYXllcnNbaV0uZmFkZSgwLjAsIDEwMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgJ1J1bic6XG5cdFx0XHRmb3IobGV0IGk9MDsgaTxwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGk9PTIpIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMS4wLCAxMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMC4wLCAxMDAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cbn1cbi8vKi9cblxuY29uc3QgY2hhbmdlU291bmRzID0gKGxhYmVsKSA9PiB7fTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09IGxmb3AgZ3JhcGggPT09PT09PT09PT09PT09PT09PT0gLy9cblxuY29uc3QgZXZlbnRJbiA9IG5ldyBsZm8uc291cmNlcy5FdmVudEluKHtcblx0Ly9yZWxhdGl2ZTogdHJ1ZSxcblx0ZnJhbWVTaXplOiAxLC8vdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdGN0eDogQXVkaW9Db250ZXh0XG59KTtcblxuY29uc3QgaW50ZW5zaXR5ID0gbmV3IEludGVuc2l0eSh7XG5cbn0pO1xuXG5jb25zdCBpbnB1dENoYWluID0gbmV3IElucHV0UHJvY2Vzc2luZ0NoYWluKHtcblx0Ly8gd2luZG93U2l6ZTogNjQsXG5cdC8vIGhvcFNpemU6IDE2LFxuXHQvLyBmcmFtZVNpemU6IDY0LFxuXHQvLyBwZXJpb2Q6IDIwXG5cdHdpbmRvd1NpemU6IDY0LFxuXHRob3BTaXplOiAxNixcblx0ZnJhbWVTaXplOiA2NCxcblx0cGVyaW9kOiAyMFxufSk7XG5jb25zdCBkYXRhUmVjb3JkZXIgPSBuZXcgRGF0YVJlY29yZGVyKHtcblx0Ly9zZXBhcmF0ZUFycmF5czogdHJ1ZSxcblx0Ly9mcmFtZVNpemU6IDMsIC8vIDw9PiBkaW1lbnNpb25cblx0Y29sdW1uX25hbWVzOiBbJ21hZ25pdHVkZScsICdmcmVxdWVuY3knLCAncGVyaW9kaWNpdHknXVxufSk7XG5jb25zdCBnbW1EZWNvZGVyID0gbmV3IFhtbUdtbURlY29kZXIoe1xuXHRsaWtlbGlob29kV2luZG93OiA1XG59KTtcblxuY29uc3QgZmVhdHVyZXNCcGYgPSBuZXcgbGZvLnNpbmtzLkJwZih7XG5cdC8vZnJhbWVTaXplOiAzLFxuXHRyYWRpdXM6IDEsXG5cdG1pbjogMCxcblx0bWF4OiAxLFxuXHRjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWF0dXJlcy1jYW52YXMnKSxcblx0ZHVyYXRpb246IDEwICogaW5wdXRDaGFpbi5wYXJhbXMuaG9wU2l6ZSAqIGlucHV0Q2hhaW4ucGFyYW1zLnBlcmlvZCxcblx0Y29sb3JzOiBbJyNmMDAnLCAnIzBjMCcsICcjMzNmJ10gLy8gbWFnbml0dWRlIDogUmVkLCBmcmVxdWVuY3kgOiBHcmVlbiwgcGVyaW9kaWNpdHkgOiBCbHVlXG59KTtcblxuY29uc3Qgc2lnbmFsQnBmID0gbmV3IGxmby5zaW5rcy5CcGYoe1xuXHQvL2ZyYW1lU2l6ZTogMSxcblx0cmFkaXVzOiAwLFxuXHRtaW46IDAsXG5cdG1heDogMSxcblx0Y2FudmFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2lnbmFsLWNhbnZhcycpLFxuXHRkdXJhdGlvbjogMTAgKiBpbnB1dENoYWluLnBhcmFtcy5ob3BTaXplICogaW5wdXRDaGFpbi5wYXJhbXMucGVyaW9kLFxuXHRjb2xvcnM6IFsnIzAwMCddIC8vIG1hZ25pdHVkZSA6IFJlZCwgZnJlcXVlbmN5IDogR3JlZW4sIHBlcmlvZGljaXR5IDogQmx1ZVxufSk7XG5cbi8vKlxuLy8gdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUgLi4uXG5jb25zdCBsaWtlbGlob29kc1NwZWN0cm8gPSBuZXcgbGZvLnNpbmtzLlNwZWN0cm9ncmFtKHtcbi8vY29uc3QgbGlrZWxpaG9vZHNTcGVjdHJvID0gbmV3IE15U3BlY3Ryb2dyYW0oe1xuXHRzY2FsZTogMTAsXG5cdGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpa2VsaWhvb2RzLWNhbnZhcycpLFxuXHRjb2xvcjogJyNmMDAnXG59KTtcbi8vKi9cblxuLypcbmNvbnN0IGxpa2VsaWhvb2RzQnBmID0gbmV3IGxmby5zaW5rcy5CcGYoe1xuXHRyYWRpdXM6IDEsXG5cdG1pbjogMCxcblx0bWF4OiAxLFxuXHRjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaWtlbGlob29kcy1jYW52YXMnKSxcblx0ZHVyYXRpb246IDEwICogaW5wdXRDaGFpbi5wYXJhbXMuaG9wU2l6ZSAqIGlucHV0Q2hhaW4ucGFyYW1zLnBlcmlvZCxcblx0Y29sb3JzOiBbJyNmMDAnLCAnIzBjMCcsICcjMzNmJ10gLy8gbWFnbml0dWRlIDogUmVkLCBmcmVxdWVuY3kgOiBHcmVlbiwgcGVyaW9kaWNpdHkgOiBCbHVlXG59KTtcbi8vKi9cblxuLy9pbnRlbnNpdHkuY29ubmVjdChpbnB1dENoYWluKVxuXG5pbnB1dENoYWluLmNvbm5lY3QoZGF0YVJlY29yZGVyKTtcblxuaW5wdXRDaGFpbi5jb25uZWN0KGdtbURlY29kZXIpO1xuXG5pbnB1dENoYWluLnByZUZyYW1lckNvbm5lY3Qoc2lnbmFsQnBmKTtcbmlucHV0Q2hhaW4uY29ubmVjdChmZWF0dXJlc0JwZik7XG5cbmdtbURlY29kZXIuY29ubmVjdChsaWtlbGlob29kc1NwZWN0cm8pO1xuLy9nbW1EZWNvZGVyLmNvbm5lY3QobGlrZWxpaG9vZHNCcGYpO1xuXG4vLyBHTyAhXG5pbnB1dENoYWluLnN0YXJ0KCk7XG5cbmNvbnN0IHJvdW5kVmFsdWUgPSAoaW5wdXQpID0+IHtcblx0aWYgKGlucHV0ID09PSB1bmRlZmluZWQpXG5cdFx0cmV0dXJuICd1bmRlZmluZWQnO1xuXHRpZiAoaW5wdXQgPT09IG51bGwpXG5cdFx0cmV0dXJuICdudWxsJztcblx0cmV0dXJuIE1hdGgucm91bmQoaW5wdXQgKiAxMDApIC8gMTAwO1xufTtcblxuY29uc3QgZmVlZElucHV0Q2hhaW4gPSAobW9kdWxlKSA9PiB7XG5cdGlmKG1vZHVsZS5pc1ZhbGlkKSB7XG5cdFx0Lypcblx0XHRtb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignZW5lcmd5JywgKHZhbCkgPT4ge1xuXHRcdFx0aW5wdXRDaGFpbi5wcm9jZXNzKHBlcmZvcm1hbmNlLm5vdygpLCB2YWwpO1xuXHRcdH0pO1xuXHRcdC8vKi9cblxuXHRcdC8qXG5cdFx0bW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ2FjY2VsZXJhdGlvbicsICh2YWwpID0+IHtcblx0XHRcdGlucHV0Q2hhaW4ucHJvY2VzcyhwZXJmb3JtYW5jZS5ub3coKSwgdmFsKTtcblx0XHR9KTtcblx0XHQvLyovXG5cblx0XHQvLypcblx0XHRtb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcigncm90YXRpb25SYXRlJywgKHZhbCkgPT4ge1xuXHRcdFx0Ly9oZXJlIGNvbXB1dGUgdGhlIGVxdWl2YWxlbnQgb2YgXCJzcGluXCIgOlxuXHRcdFx0bGV0IHZhbFN0ZCA9IHZhbC5zbGljZSgwKTtcblx0XHRcdGlmKHJhZHMpIHtcblx0XHRcdFx0Zm9yKGxldCBpPTA7IGk8MzsgaSsrKSB7XG5cdFx0XHRcdFx0dmFsU3RkW2ldICo9ICgxODAvTWF0aC5QSSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGxldCBzcGluID0gTWF0aC5wb3codmFsU3RkWzBdKnZhbFN0ZFswXSArIHZhbFN0ZFsxXSp2YWxTdGRbMV0gKyB2YWxTdGRbMl0qdmFsU3RkWzJdLCAwLjUpICogMC4wMDM7XG5cdFx0XHRpbnB1dENoYWluLnByb2Nlc3MocGVyZm9ybWFuY2Uubm93KCksIHNwaW4pO1xuXHRcdH0pO1xuXHRcdC8vKi9cblx0fVxufTtcblxuKGZ1bmN0aW9uKCkge1xuXHRtb3Rpb25JbnB1dFxuXHRcdC5pbml0KFxuXHRcdFx0J2VuZXJneScsXG5cdFx0XHQncm90YXRpb25SYXRlJ1xuXHRcdFx0KVxuXHRcdC50aGVuKChtb2R1bGVzKSA9PiB7XG5cdFx0XHRjb25zdCBlbmVyZ3kgPSBtb2R1bGVzWzBdO1xuXHRcdFx0Y29uc3Qgcm90YXRpb25SYXRlID0gbW9kdWxlc1sxXTtcblx0XHRcdC8vZmVlZElucHV0Q2hhaW4oZW5lcmd5KTtcblx0XHRcdGZlZWRJbnB1dENoYWluKHJvdGF0aW9uUmF0ZSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcbn0pKCk7XG5cbi8vID09PT09PT09PT09PT09PT09IHNvY2tldCBvcGVyYXRpb25zID09PT09PT09PT09PT09PT09PSAvL1xuXG4vL2xldCBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vMTY5LjI1NC42OC4xMTc6MzAwMCcpO1xubGV0IHNvY2tldCA9IGlvLmNvbm5lY3QobG9jYXRpb24uaG9zdCArICcvd2ltbC1nbW0nKTtcbi8vbGV0IHNvY2tldCA9IGlvLmNvbm5lY3QoJzEyNy4wLjAuMTozMDAwJyk7XG5cbnNvY2tldC5vbignY29uZmlybScsIChtZXNzYWdlKSA9PiB7XG5cdGNvbnNvbGUubG9nKCdzZXJ2ZXIgY29uZmlybXMgcmVjZXB0aW9uIG9mIG1lc3NhZ2UgOicpO1xuXHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcbn0pO1xuXG4vLyB0aGlzIGNvdWxkIGJlIHByb2JhYmx5IGltcHJvdmVkIChraW5kIG9mIGNhbGxiYWNrIGZyb20geG1tKVxuc29ja2V0Lm9uKCd0cmFpbicsIChtZXNzYWdlKSA9PiB7XG5cdGlmKG1lc3NhZ2UgPT09ICdvaycpIHtcblx0XHQvLyB0cmFpbmluZyB3b3JrZWQsIGNhbiByZXF1ZXN0IG5ldyBtb2RlbHNcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuXHR9XG59KVxuXG4vLyB1cGRhdGUgbW9kZWwgb24gbmV3IG1vZGVsIHJlY2VwdGlvbiBmcm9tIHNlcnZlciA6XG5zb2NrZXQub24oJ21vZGVscycsIChtb2RlbHMpID0+IHtcblx0Y29uc29sZS5sb2cobW9kZWxzKTtcblx0bGV0IG0gPSBtb2RlbHMubW9kZWxzO1xuXHRpZihBcnJheS5pc0FycmF5KG0pICYmIG0ubGVuZ3RoID4gMCkge1xuXHRcdC8vZ21tRGVjb2Rlci5zZXRNb2RlbChtW20ubGVuZ3RoIC0gMV0pO1xuXHRcdGNvbnNvbGUubG9nKG1vZGVscy5tZXNzYWdlKTtcblx0XHRjb25zb2xlLmxvZyhtW20ubGVuZ3RoIC0gMV0pO1xuXHRcdGdtbURlY29kZXIuc2V0TW9kZWwobVttLmxlbmd0aCAtIDFdKTtcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLmxvZyhtb2RlbHMubWVzc2FnZSk7XG5cdH1cbn0pO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09IFVJIGludGVyYWN0aW9uID09PT09PT09PT09PT09PT09PT0gLy9cblxucmVjYnV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRsZXQgc3RhdGUgPSByZWNidXQuY2xhc3NOYW1lO1xuXHRpZihzdGF0ZSA9PT0gJ3JlYy1idXQnKSB7XG5cdFx0cmVjYnV0LmNsYXNzTmFtZSA9ICdzdG9wLWJ1dCc7XG5cdFx0cmVjYnV0LmlubmVySFRNTCA9ICdTVE9QJ1xuXHRcdHNlbmRidXQuZGlzYWJsZWQgPSB0cnVlO1xuXHRcdC8vIHN0YXJ0IHJlY29yZGluZyBzb21lIHNlbnNvciBhbmQgZ3BzIGRhdGFcblx0XHRkYXRhUmVjb3JkZXIuc3RhcnQoKTtcblxuXHR9IGVsc2Uge1xuXHRcdHJlY2J1dC5jbGFzc05hbWUgPSAncmVjLWJ1dCc7XG5cdFx0cmVjYnV0LmlubmVySFRNTCA9ICdSRUMnO1xuXHRcdHNlbmRidXQuZGlzYWJsZWQgPSBmYWxzZTtcblx0XHQvLyBzdG9wIHJlY29yZGluZyBkYXRhXG5cdFx0ZGF0YVJlY29yZGVyLnN0b3AoKTtcblx0fVxufSk7XG5cbnNlbmRidXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdGxldCBtb3ZlID0gbW92ZWxpc3Qub3B0aW9uc1ttb3ZlbGlzdC5zZWxlY3RlZEluZGV4XS50ZXh0O1xuXHRsZXQgcmVzID0gY29uZmlybSgnWW91IGFyZSBhYm91dCB0byBzZW5kIGRhdGEgbGFiZWxlZCB3aXRoIFwiJyArIG1vdmUgKyAnXCIuIENvbmZpcm0gPycpO1xuXHRpZihyZXMgPT09IHRydWUpIHtcblx0XHQvLyBzZW5kIHJlY29yZGVkIGRhdGEgdG8gc2VydmVyIDpcblx0XHRsZXQgcGhyYXNlID0gZGF0YVJlY29yZGVyLmdldFJlY29yZGVkUGhyYXNlKCk7XG5cdFx0cGhyYXNlLmxhYmVsID0gbW92ZTtcblx0XHRwaHJhc2UuZGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0c29ja2V0LmVtaXQoJ3dyaXRlUGhyYXNlJywgcGhyYXNlKTtcblx0XHRjb25zb2xlLmxvZyhwaHJhc2UpO1xuXHRcdHNlbmRidXQuZGlzYWJsZWQgPSB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHNlbmRidXQuZGlzYWJsZWQgPSBmYWxzZTtcblx0fVxufSk7XG5cblxuZ2V0bW9kZWxzYnV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRzb2NrZXQuZW1pdCgndHJhaW5Nb2RlbHMnKTtcbn0pO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09PT0gUEFHRSBJTklUSUFMSVpBVElPTiA9PT09PT09PT09PT09PT09PT09IC8vXG5cbigoKSA9PiB7XG5cdGNvbnN0IHVwZGF0ZUxpa2VsaWVzdCA9IChkZWwpID0+IHtcblx0XHQvL2xldCBuZXdMYWJlbCA9IGdtbURlY29kZXIubGlrZWxpZXN0TGFiZWw7XG5cblx0XHRpZihnbW1EZWNvZGVyLmxpa2VsaWVzdExhYmVsICE9PSBsaWtlbGllc3QuaW5uZXJIVE1MKSB7XG5cdFx0XHRjaGFuZ2VTb3VuZHMoZ21tRGVjb2Rlci5saWtlbGllc3RMYWJlbCk7XG5cdFx0fVxuXHRcdGxpa2VsaWVzdC5pbm5lckhUTUwgPSBnbW1EZWNvZGVyLmxpa2VsaWVzdExhYmVsOy8vbmV3TGFiZWw7XG5cdFx0c2V0VGltZW91dCh1cGRhdGVMaWtlbGllc3QsIGRlbCk7XG5cdH1cblxuXHR1cGRhdGVMaWtlbGllc3QoMjAwKTtcbn0pKCk7XG5cbi8vID09PT09PT09PT09PT09PSBzZW5zb3JzIG1vY2tpbmcgZm9yIGRlc2t0b3AgPT09PT09PT09PT09PT0gLy9cbi8vKlxuKGZ1bmN0aW9uKCkge1xuXG5cdGZ1bmN0aW9uIGdlbmVyYW5kb20oKSB7XG5cdFx0bGV0IHJldCA9IFtdO1xuXHRcdGZvcihsZXQgaT0wOyBpPDE7IGkrKykge1xuXHRcdFx0cmV0LnB1c2goTWF0aC5yYW5kb20oKSAqIDIgLSAxKTtcblx0XHR9XG5cblx0XHRsZXQgdiA9IE1hdGgucmFuZG9tKCkgKiAyIC0gMTtcblx0XHRpbnB1dENoYWluLnByb2Nlc3MobnVsbCwgdik7XG5cblx0XHRkZWxheShNYXRoLnJhbmRvbSgpICogMTAgKyAxMDApO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVsYXkoZGVsKSB7XG5cdFx0c2V0VGltZW91dChnZW5lcmFuZG9tLCBkZWwpO1xuXHR9XG5cblx0Ly8gdW5jb21tZW50IHRvIHNlbmQgcmFuZG9tIHNpZ25hbCBpZiBubyBzZW5zb3JzIGF2YWlsYWJsZSA6XG5cdC8vIGdlbmVyYW5kb20oKTtcblxufSkoKTtcbi8vKi8iXX0=