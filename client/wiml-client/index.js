'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

var _motionInput = require('motion-input');

var _motionInput2 = _interopRequireDefault(_motionInput);

var _wavesLfo = require('waves-lfo');

var _wavesLfo2 = _interopRequireDefault(_wavesLfo);

var _commonLfoInputProcessingChain = require('../common/lfo-input-processing-chain');

var _commonLfoInputProcessingChain2 = _interopRequireDefault(_commonLfoInputProcessingChain);

var _commonLfoDataRecorder = require('../common/lfo-data-recorder');

var _commonLfoDataRecorder2 = _interopRequireDefault(_commonLfoDataRecorder);

var _commonLfoXmmGmmDecoder = require('../common/lfo-xmm-gmm-decoder');

var _commonLfoXmmGmmDecoder2 = _interopRequireDefault(_commonLfoXmmGmmDecoder);

var _commonAudioPlayerJs = require('../common/audio-player.js');

var _commonAudioPlayerJs2 = _interopRequireDefault(_commonAudioPlayerJs);

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
var AudioContext = window.AudioContext || window.webkitAudioContext || function () {};
var context = new AudioContext();

var touched = false;
var loaded = 0;

document.body.addEventListener('touchend', function () {
	if (touched || loaded < 3) return;
	touched = true;
	for (var i = 0; i < players.length; i++) {
		console.log(i + ' : start !');
		players[i].start();
	}
});

var players = [];
players.length = 3;

var ajaxReqs = [];
ajaxReqs.length = 3;

var loadSound = function loadSound(url, index, trig) {
	var req = new XMLHttpRequest();
	ajaxReqs[index] = req;
	req.open('GET', url, true);
	req.responseType = 'arraybuffer';

	req.onload = function () {
		context.decodeAudioData(req.response, function (buffer) {
			//const player = new AudioPlayer(context, buffer);
			//console.log("loaded !");
			players[index] = new _commonAudioPlayerJs2['default'](context, buffer);
			console.log(url + " loaded !");
			trig(players.length - 1);
		});
	};
	req.send();
};

//loadSound("sounds/44652__simondsouza__hip-hop-groove.mp3", 0, () => { loaded++; });
loadSound("sounds/bubulle_harmo.mp3", 0, function () {
	loaded++;
});
loadSound("sounds/marchesynth_duck.mp3", 1, function () {
	loaded++;
});
loadSound("sounds/tex01-23_cartoon_loop.mp3", 2, function () {
	loaded++;
});
//*/

var changeSounds = function changeSounds(label) {

	//console.log(players.length);
	switch (label) {
		case 'Still':
			for (var i = 0; i < players.length; i++) {
				if (i == 0) {
					players[i].fade(1.0, 1000);
				} else {
					players[i].fade(0.0, 1000);
				}
			}
			break;

		case 'Walk':
			for (var i = 0; i < players.length; i++) {
				if (i == 1) {
					players[i].fade(1.0, 1000);
				} else {
					players[i].fade(0.0, 1000);
				}
			}
			break;

		case 'Run':
			for (var i = 0; i < players.length; i++) {
				if (i == 2) {
					players[i].fade(1.0, 1000);
				} else {
					players[i].fade(0.0, 1000);
				}
			}
			break;

		default:
			break;
	}
};

// ===================== lfop graph ==================== //

var inputChain = new _commonLfoInputProcessingChain2['default']({
	windowSize: 64,
	hopSize: 16,
	frameSize: 64,
	period: 20
});
var dataRecorder = new _commonLfoDataRecorder2['default']({
	separateArrays: true
});
var gmmDecoder = new _commonLfoXmmGmmDecoder2['default']({
	likelihoodWindow: 2
});

var featuresBpf = new _wavesLfo2['default'].sinks.Bpf({
	radius: 5,
	min: 0,
	max: 1,
	canvas: document.querySelector('#features-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

var signalBpf = new _wavesLfo2['default'].sinks.Bpf({
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
var likelihoodsBpf = new _wavesLfo2['default'].sinks.Bpf({
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

		//*
		_motionInput2['default'].addListener('rotationRate', function (val) {
			//here compute the equivalent of "spin" :
			var spin = Math.pow(val[0] * val[0] + val[1] * val[1] + val[2] * val[2], 0.5) * 0.003;
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
var socket = _socketIoClient2['default'].connect(location.host + '/wiml-client');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvd2ltbC1jbGllbnQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs4QkFBZSxrQkFBa0I7Ozs7MkJBQ1QsY0FBYzs7Ozt3QkFDdEIsV0FBVzs7Ozs2Q0FFTSxzQ0FBc0M7Ozs7cUNBQzlDLDZCQUE2Qjs7OztzQ0FDNUIsK0JBQStCOzs7O21DQUNqQywyQkFBMkI7Ozs7Ozs7QUFPbkQsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoRCxJQUFJLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2xELE9BQU8sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDOztBQUV4QixJQUFJLFlBQVksR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDNUQsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwRCxJQUFJLFNBQVMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLHNCQUFzQixDQUFDLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW1HL0QsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksSUFBSSxNQUFNLENBQUMsa0JBQWtCLElBQUksWUFBVSxFQUFFLENBQUM7QUFDcEYsSUFBSSxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQzs7QUFFakMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFZixRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsRUFBRSxZQUFNO0FBQ2hELEtBQUcsT0FBTyxJQUFJLE1BQU0sR0FBRyxDQUFDLEVBQUUsT0FB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LENBQUM7RUFDaEM7O0FBRUQsVUFBUyxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQ25CLFlBQVUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLENBQUM7RUFDNUI7Ozs7Q0FLRCxDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJzcmMvY2xpZW50L3dpbWwtY2xpZW50L2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGlvIGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xuaW1wb3J0IG1vdGlvbklucHV0IGZyb20gJ21vdGlvbi1pbnB1dCc7XG5pbXBvcnQgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmltcG9ydCBJbnB1dFByb2Nlc3NpbmdDaGFpbiBmcm9tICcuLi9jb21tb24vbGZvLWlucHV0LXByb2Nlc3NpbmctY2hhaW4nO1xuaW1wb3J0IERhdGFSZWNvcmRlciBmcm9tICcuLi9jb21tb24vbGZvLWRhdGEtcmVjb3JkZXInO1xuaW1wb3J0IFhtbUdtbURlY29kZXIgZnJvbSAnLi4vY29tbW9uL2xmby14bW0tZ21tLWRlY29kZXInO1xuaW1wb3J0IEF1ZGlvUGxheWVyIGZyb20gJy4uL2NvbW1vbi9hdWRpby1wbGF5ZXIuanMnO1xuXG5cblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRE9NIGVsZW1lbnRzID09PT09PT09PT09PT09PT09PT0gLy9cblxuLy9sZXQgc291bmRtdXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NvdW5kbXV0ZScpO1xubGV0IHJlY2J1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZWMtYnV0Jyk7XG5sZXQgc2VuZGJ1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZW5kLWJ1dCcpO1xuc2VuZGJ1dC5kaXNhYmxlZCA9IHRydWU7XG4vL2xldCB0cmFpbmJ1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0cmFpbi1idXQnKTtcbmxldCBnZXRtb2RlbHNidXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ2V0bW9kZWxzLWJ1dCcpO1xubGV0IG1vdmVsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21vdmUtbGlzdCcpO1xubGV0IGxpa2VsaWVzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaWtlbGllc3QtbGFiZWwtZGl2Jyk7XG5cbi8vID09PT09PT09PT09PT09PT09PSBTT05JRklDQVRJT04gPT09PT09PT09PT09PT09PT09PT0gLy9cblxuLypcbmxldCBhdWRpb3RhZ3MgPSBbXTtcbmxldCBmYWRlRnVuY3Rpb25zID0gW107XG5cbmZvcihsZXQgaT0wOyBpPDY7IGkrKykge1xuXHRsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIik7XG5cdGF1ZGlvdGFncy5wdXNoKGVsKTtcblx0Ly9hdWRpb3RhZ3NbYXVkaW90YWdzLmxlbmd0aC0xXS5zZXRBdHRyaWJ1dGUoXCJhdXRvcGxheVwiLCB0cnVlKTtcblx0YXVkaW90YWdzW2F1ZGlvdGFncy5sZW5ndGgtMV0uc2V0QXR0cmlidXRlKFwicHJlbG9hZFwiLCBcImF1dG9tYXRpY1wiKVxuXHRhdWRpb3RhZ3NbYXVkaW90YWdzLmxlbmd0aC0xXS5zZXRBdHRyaWJ1dGUoXCJjb250cm9sc1wiLCBcInRydWVcIilcblx0YXVkaW90YWdzW2F1ZGlvdGFncy5sZW5ndGgtMV0uc2V0QXR0cmlidXRlKFwibG9vcFwiLCBcInRydWVcIik7XG59XG5hdWRpb3RhZ3NbMF0uc2V0QXR0cmlidXRlKFwic3JjXCIsIFwic291bmRzLzMyMzgwMF9fcmVhY3Rob3JfX2Jsb29kLWRyb25lLm1wM1wiKVxuLy9hdWRpb3RhZ3NbMV0uc2V0QXR0cmlidXRlKFwic3JjXCIsIFwic291bmRzL3NvdW5kLm1wM1wiKTtcbmF1ZGlvdGFnc1syXS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgXCJzb3VuZHMvODk5NTNfX2dyZWctYmF1bW9udF9fb2JlcmhlaW14cGFuZGVycmFuZG9tZHJvbmUubXAzXCIpO1xuLy9hdWRpb3RhZ3NbM10uc2V0QXR0cmlidXRlKFwic3JjXCIsIFwic291bmRzL3NvdW5kLm1wM1wiKTtcbmF1ZGlvdGFnc1s0XS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgXCJzb3VuZHMvMzI0Mzk1X19mZWxpcGVqb3JkYW5pX18wMDQtYWxpZW4tbWFjaGluZS1paS5tcDNcIik7XG4vL2F1ZGlvdGFnc1s1XS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgXCJzb3VuZHMvc291bmQubXAzXCIpO1xuXG5sZXQgYXVkaW9kaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2F1ZGlvZGl2XCIpO1xuZm9yKGxldCBpPTA7IGk8YXVkaW90YWdzLmxlbmd0aDsgaSsrKSB7XG5cdGF1ZGlvZGl2LmFwcGVuZENoaWxkKGF1ZGlvdGFnc1tpXSk7XG59XG5cbmRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCAoKSA9PiB7XG5cdGZvcihsZXQgaT0wOyBpPGF1ZGlvdGFncy5sZW5ndGg7IGkrKykge1xuXHRcdGF1ZGlvdGFnc1tpXS52b2x1bWUgPSAwO1xuXHRcdGF1ZGlvdGFnc1tpXS5wbGF5KCk7XG5cdFx0YXVkaW90YWdzW2ldLnZvbHVtZSA9IDA7XG5cdH1cbn0pO1xuXG5mb3IobGV0IGk9MDsgaTxhdWRpb3RhZ3MubGVuZ3RoOyBpKyspIHtcblx0ZmFkZUZ1bmN0aW9ucy5wdXNoKChhdWRpb3RhZywgdGFyZ2V0VmFsLCBkdXJhdGlvbikgPT4ge1xuXHRcdGxldCBpbnRlcnZhbCA9IDEwMDtcblx0XHRsZXQgaW5jID0gKHRhcmdldFZhbCAtIGF1ZGlvdGFnLnZvbHVtZSkgLyAoZHVyYXRpb24gLyBpbnRlcnZhbClcblx0XHRjb25zb2xlLmxvZyhhdWRpb3RhZy52b2x1bWUgKyBcIiAtPiBcIiArIHRhcmdldFZhbCArIFwiIFwiICsgaW5jKTtcblx0XHRpZihpbmMgPT0gMCkgcmV0dXJuO1xuXHRcdGxldCBmYWRlID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuXHRcdFx0aWYoTWF0aC5hYnMoYXVkaW90YWcudm9sdW1lIC0gdGFyZ2V0VmFsKSA+IE1hdGguYWJzKGluYykpIHtcblx0XHRcdFx0YXVkaW90YWcudm9sdW1lICs9IGluYztcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhhdWRpb3RhZy52b2x1bWUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZihNYXRoLmFicyhhdWRpb3RhZy52b2x1bWUgLSB0YXJnZXRWYWwpIDwgTWF0aC5hYnMoaW5jKSkge1xuXHRcdFx0XHRhdWRpb3RhZy52b2x1bWUgPSB0YXJnZXRWYWw7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoZmFkZSk7XG5cdFx0XHR9XG5cblx0XHR9LCBpbnRlcnZhbCk7XG5cdH0pO1xufVxuXG5jb25zdCBjaGFuZ2VTb3VuZHMgPSAobGFiZWwpID0+IHtcblxuXHRzd2l0Y2ggKGxhYmVsKSB7XG5cdFx0Y2FzZSAnU3RpbGwnOlxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8YXVkaW90YWdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGkgPT0gMCkge1xuXHRcdFx0XHRcdGZhZGVGdW5jdGlvbnNbaV0oYXVkaW90YWdzW2ldLCAxLCAyMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWRlRnVuY3Rpb25zW2ldKGF1ZGlvdGFnc1tpXSwgMCwgMjAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnV2Fsayc6XG5cdFx0XHRmb3IobGV0IGk9MDsgaTxhdWRpb3RhZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoaSA9PSAyKSB7XG5cdFx0XHRcdFx0ZmFkZUZ1bmN0aW9uc1tpXShhdWRpb3RhZ3NbaV0sIDEsIDIwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZhZGVGdW5jdGlvbnNbaV0oYXVkaW90YWdzW2ldLCAwLCAyMDAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdSdW4nOlxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8YXVkaW90YWdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGkgPT0gNCkge1xuXHRcdFx0XHRcdGZhZGVGdW5jdGlvbnNbaV0oYXVkaW90YWdzW2ldLCAxLCAyMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmYWRlRnVuY3Rpb25zW2ldKGF1ZGlvdGFnc1tpXSwgMCwgMjAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG59XG4vLyovXG5cbi8vID09PT09PT09PT09PT09PT09PT0gdGhlIFdlYiBBdWRpbyB3YXkgPT09PT09PT09PT09PT09PT09IC8vXG5cbi8vKlxubGV0IEF1ZGlvQ29udGV4dCA9IHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCBmdW5jdGlvbigpe307XG5sZXQgY29udGV4dCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcblxubGV0IHRvdWNoZWQgPSBmYWxzZTtcbmxldCBsb2FkZWQgPSAwO1xuXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKCkgPT4ge1xuXHRpZih0b3VjaGVkIHx8IGxvYWRlZCA8IDMpIHJldHVybjtcblx0dG91Y2hlZCA9IHRydWU7XG5cdGZvcihsZXQgaT0wOyBpPHBsYXllcnMubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zb2xlLmxvZyhpICsgJyA6IHN0YXJ0ICEnKTtcblx0XHRwbGF5ZXJzW2ldLnN0YXJ0KCk7XG5cdH1cbn0pO1xuXG5sZXQgcGxheWVycyA9IFtdO1xucGxheWVycy5sZW5ndGggPSAzO1xuXG5jb25zdCBhamF4UmVxcyA9IFtdO1xuYWpheFJlcXMubGVuZ3RoID0gMztcblxuY29uc3QgbG9hZFNvdW5kID0gKHVybCwgaW5kZXgsIHRyaWcpID0+IHtcblx0Y29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdGFqYXhSZXFzW2luZGV4XSA9IHJlcTtcblx0cmVxLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG5cdHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG5cdHJlcS5vbmxvYWQgPSAoKSA9PiB7XG5cdFx0Y29udGV4dC5kZWNvZGVBdWRpb0RhdGEocmVxLnJlc3BvbnNlLCAoYnVmZmVyKSA9PiB7XG5cdFx0XHQvL2NvbnN0IHBsYXllciA9IG5ldyBBdWRpb1BsYXllcihjb250ZXh0LCBidWZmZXIpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImxvYWRlZCAhXCIpO1xuXHRcdFx0cGxheWVyc1tpbmRleF0gPSBuZXcgQXVkaW9QbGF5ZXIoY29udGV4dCwgYnVmZmVyKTtcblx0XHRcdGNvbnNvbGUubG9nKHVybCArIFwiIGxvYWRlZCAhXCIpO1xuXHRcdFx0dHJpZyhwbGF5ZXJzLmxlbmd0aC0xKTtcblx0XHR9KTtcblx0fTtcblx0cmVxLnNlbmQoKTtcbn1cblxuLy9sb2FkU291bmQoXCJzb3VuZHMvNDQ2NTJfX3NpbW9uZHNvdXphX19oaXAtaG9wLWdyb292ZS5tcDNcIiwgMCwgKCkgPT4geyBsb2FkZWQrKzsgfSk7XG5sb2FkU291bmQoXCJzb3VuZHMvYnVidWxsZV9oYXJtby5tcDNcIiwgMCwgKCkgPT4geyBsb2FkZWQrKzsgfSk7XG5sb2FkU291bmQoXCJzb3VuZHMvbWFyY2hlc3ludGhfZHVjay5tcDNcIiwgMSwgKCkgPT4geyBsb2FkZWQrKzsgfSk7XG5sb2FkU291bmQoXCJzb3VuZHMvdGV4MDEtMjNfY2FydG9vbl9sb29wLm1wM1wiLCAyLCAoKSA9PiB7IGxvYWRlZCsrOyB9KTtcbi8vKi9cblxuY29uc3QgY2hhbmdlU291bmRzID0gKGxhYmVsKSA9PiB7XG5cblx0Ly9jb25zb2xlLmxvZyhwbGF5ZXJzLmxlbmd0aCk7XG5cdHN3aXRjaCAobGFiZWwpIHtcblx0XHRjYXNlICdTdGlsbCc6XG5cdFx0XHRmb3IobGV0IGk9MDsgaTxwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGk9PTApIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMS4wLCAxMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMC4wLCAxMDAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdXYWxrJzpcblx0XHRcdGZvcihsZXQgaT0wOyBpPHBsYXllcnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYoaT09MSkge1xuXHRcdFx0XHRcdHBsYXllcnNbaV0uZmFkZSgxLjAsIDEwMDApO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBsYXllcnNbaV0uZmFkZSgwLjAsIDEwMDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgJ1J1bic6XG5cdFx0XHRmb3IobGV0IGk9MDsgaTxwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGk9PTIpIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMS4wLCAxMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMC4wLCAxMDAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cbn1cblxuLy8gPT09PT09PT09PT09PT09PT09PT09IGxmb3AgZ3JhcGggPT09PT09PT09PT09PT09PT09PT0gLy9cblxuY29uc3QgaW5wdXRDaGFpbiA9IG5ldyBJbnB1dFByb2Nlc3NpbmdDaGFpbih7XG5cdHdpbmRvd1NpemU6IDY0LFxuXHRob3BTaXplOiAxNixcblx0ZnJhbWVTaXplOiA2NCxcblx0cGVyaW9kOiAyMFxufSk7XG5jb25zdCBkYXRhUmVjb3JkZXIgPSBuZXcgRGF0YVJlY29yZGVyKHtcblx0c2VwYXJhdGVBcnJheXM6IHRydWVcbn0pO1xuY29uc3QgZ21tRGVjb2RlciA9IG5ldyBYbW1HbW1EZWNvZGVyKHtcblx0bGlrZWxpaG9vZFdpbmRvdzogMlxufSk7XG5cbmNvbnN0IGZlYXR1cmVzQnBmID0gbmV3IGxmby5zaW5rcy5CcGYoe1xuXHRyYWRpdXM6IDUsXG5cdG1pbjogMCxcblx0bWF4OiAxLFxuXHRjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWF0dXJlcy1jYW52YXMnKSxcblx0ZHVyYXRpb246IDEwICogaW5wdXRDaGFpbi5wYXJhbXMuaG9wU2l6ZSAqIGlucHV0Q2hhaW4ucGFyYW1zLnBlcmlvZCxcblx0Y29sb3JzOiBbJyNmMDAnLCAnIzBjMCcsICcjMzNmJ10gLy8gbWFnbml0dWRlIDogUmVkLCBmcmVxdWVuY3kgOiBHcmVlbiwgcGVyaW9kaWNpdHkgOiBCbHVlXG59KTtcblxuY29uc3Qgc2lnbmFsQnBmID0gbmV3IGxmby5zaW5rcy5CcGYoe1xuXHRmcmFtZVNpemU6IDEsXG5cdHJhZGl1czogMCxcblx0bWluOiAwLFxuXHRtYXg6IDEsXG5cdGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NpZ25hbC1jYW52YXMnKSxcblx0ZHVyYXRpb246IDEwICogaW5wdXRDaGFpbi5wYXJhbXMuaG9wU2l6ZSAqIGlucHV0Q2hhaW4ucGFyYW1zLnBlcmlvZCxcblx0Y29sb3JzOiBbJyMwMDAnXSAvLyBtYWduaXR1ZGUgOiBSZWQsIGZyZXF1ZW5jeSA6IEdyZWVuLCBwZXJpb2RpY2l0eSA6IEJsdWVcbn0pO1xuXG4vKlxuLy8gdGVtcG9yYXJpbHkgdW5hdmFpbGFibGUgLi4uXG5jb25zdCBsaWtlbGlob29kc1NwZWN0cm8gPSBuZXcgbGZvLnNpbmtzLlNwZWN0cm9ncmFtKHtcbi8vY29uc3QgbGlrZWxpaG9vZHNTcGVjdHJvID0gbmV3IE15U3BlY3Ryb2dyYW0oe1xuXHRzY2FsZTogMTAsXG5cdGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpa2VsaWhvb2RzLWNhbnZhcycpLFxuXHRjb2xvcjogJyNmMDAnXG59KTtcbi8vKi9cblxuLy8qXG5jb25zdCBsaWtlbGlob29kc0JwZiA9IG5ldyBsZm8uc2lua3MuQnBmKHtcblx0cmFkaXVzOiA1LFxuXHRtaW46IDAsXG5cdG1heDogMSxcblx0Y2FudmFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlrZWxpaG9vZHMtY2FudmFzJyksXG5cdGR1cmF0aW9uOiAxMCAqIGlucHV0Q2hhaW4ucGFyYW1zLmhvcFNpemUgKiBpbnB1dENoYWluLnBhcmFtcy5wZXJpb2QsXG5cdGNvbG9yczogWycjZjAwJywgJyMwYzAnLCAnIzMzZiddIC8vIG1hZ25pdHVkZSA6IFJlZCwgZnJlcXVlbmN5IDogR3JlZW4sIHBlcmlvZGljaXR5IDogQmx1ZVxufSk7XG4vLyovXG5cbmlucHV0Q2hhaW4uY29ubmVjdChkYXRhUmVjb3JkZXIpO1xuXG5pbnB1dENoYWluLmNvbm5lY3QoZ21tRGVjb2Rlcik7XG5cbmlucHV0Q2hhaW4ucHJlRnJhbWVyQ29ubmVjdChzaWduYWxCcGYpO1xuaW5wdXRDaGFpbi5jb25uZWN0KGZlYXR1cmVzQnBmKTtcblxuLy9nbW1EZWNvZGVyLmNvbm5lY3QobGlrZWxpaG9vZHNTcGVjdHJvKTtcbmdtbURlY29kZXIuY29ubmVjdChsaWtlbGlob29kc0JwZik7XG5cbi8vIEdPICFcbmlucHV0Q2hhaW4uc3RhcnQoKTtcblxuY29uc3Qgcm91bmRWYWx1ZSA9IChpbnB1dCkgPT4ge1xuXHRpZiAoaW5wdXQgPT09IHVuZGVmaW5lZClcblx0XHRyZXR1cm4gJ3VuZGVmaW5lZCc7XG5cdGlmIChpbnB1dCA9PT0gbnVsbClcblx0XHRyZXR1cm4gJ251bGwnO1xuXHRyZXR1cm4gTWF0aC5yb3VuZChpbnB1dCAqIDEwMCkgLyAxMDA7XG59O1xuXG5jb25zdCBmZWVkSW5wdXRDaGFpbiA9IChtb2R1bGUpID0+IHtcblx0aWYobW9kdWxlLmlzVmFsaWQpIHtcblx0XHQvKlxuXHRcdG1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdlbmVyZ3knLCAodmFsKSA9PiB7XG5cdFx0XHRpbnB1dENoYWluLnByb2Nlc3MocGVyZm9ybWFuY2Uubm93KCksIHZhbCk7XG5cdFx0fSk7XG5cdFx0Ly8qL1xuXG5cdFx0Ly8qXG5cdFx0bW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ3JvdGF0aW9uUmF0ZScsICh2YWwpID0+IHtcblx0XHRcdC8vaGVyZSBjb21wdXRlIHRoZSBlcXVpdmFsZW50IG9mIFwic3BpblwiIDpcblx0XHRcdGxldCBzcGluID0gTWF0aC5wb3codmFsWzBdKnZhbFswXSArIHZhbFsxXSp2YWxbMV0gKyB2YWxbMl0qdmFsWzJdLCAwLjUpICogMC4wMDM7XG5cdFx0XHRpbnB1dENoYWluLnByb2Nlc3MocGVyZm9ybWFuY2Uubm93KCksIHNwaW4pO1xuXHRcdH0pO1xuXHRcdC8vKi9cblx0fVxufTtcblxuKGZ1bmN0aW9uKCkge1xuXHRtb3Rpb25JbnB1dFxuXHRcdC5pbml0KFxuXHRcdFx0J2VuZXJneScsXG5cdFx0XHQncm90YXRpb25SYXRlJ1xuXHRcdFx0KVxuXHRcdC50aGVuKChtb2R1bGVzKSA9PiB7XG5cdFx0XHRjb25zdCBlbmVyZ3kgPSBtb2R1bGVzWzBdO1xuXHRcdFx0Y29uc3Qgcm90YXRpb25SYXRlID0gbW9kdWxlc1sxXTtcblx0XHRcdC8vZmVlZElucHV0Q2hhaW4oZW5lcmd5KTtcblx0XHRcdGZlZWRJbnB1dENoYWluKHJvdGF0aW9uUmF0ZSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcbn0pKCk7XG5cbi8vID09PT09PT09PT09PT09PT09IHNvY2tldCBvcGVyYXRpb25zID09PT09PT09PT09PT09PT09PSAvL1xuXG4vL2xldCBzb2NrZXQgPSBpby5jb25uZWN0KCdodHRwOi8vMTY5LjI1NC42OC4xMTc6MzAwMCcpO1xubGV0IHNvY2tldCA9IGlvLmNvbm5lY3QobG9jYXRpb24uaG9zdCArICcvd2ltbC1jbGllbnQnKTtcbi8vbGV0IHNvY2tldCA9IGlvLmNvbm5lY3QoJzEyNy4wLjAuMTozMDAwJyk7XG5cbnNvY2tldC5vbignY29uZmlybScsIChtZXNzYWdlKSA9PiB7XG5cdGNvbnNvbGUubG9nKCdzZXJ2ZXIgY29uZmlybXMgcmVjZXB0aW9uIG9mIG1lc3NhZ2UgOicpO1xuXHRjb25zb2xlLmxvZyhtZXNzYWdlKTtcbn0pO1xuXG4vLyB0aGlzIGNvdWxkIGJlIHByb2JhYmx5IGltcHJvdmVkIChraW5kIG9mIGNhbGxiYWNrIGZyb20geG1tKVxuc29ja2V0Lm9uKCd0cmFpbicsIChtZXNzYWdlKSA9PiB7XG5cdGlmKG1lc3NhZ2UgPT09ICdvaycpIHtcblx0XHQvLyB0cmFpbmluZyB3b3JrZWQsIGNhbiByZXF1ZXN0IG5ldyBtb2RlbHNcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLmVycm9yKG1lc3NhZ2UpO1xuXHR9XG59KVxuXG4vLyB1cGRhdGUgbW9kZWwgb24gbmV3IG1vZGVsIHJlY2VwdGlvbiBmcm9tIHNlcnZlciA6XG5zb2NrZXQub24oJ21vZGVscycsIChtb2RlbHMpID0+IHtcblx0Y29uc29sZS5sb2cobW9kZWxzKTtcblx0bGV0IG0gPSBtb2RlbHMubW9kZWxzO1xuXHRpZihBcnJheS5pc0FycmF5KG0pICYmIG0ubGVuZ3RoID4gMCkge1xuXHRcdC8vZ21tRGVjb2Rlci5zZXRNb2RlbChtW20ubGVuZ3RoIC0gMV0pO1xuXHRcdGNvbnNvbGUubG9nKG1vZGVscy5tZXNzYWdlKTtcblx0XHRjb25zb2xlLmxvZyhtW20ubGVuZ3RoIC0gMV0pO1xuXHRcdGdtbURlY29kZXIuc2V0TW9kZWwobVttLmxlbmd0aCAtIDFdKTtcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLmxvZyhtb2RlbHMubWVzc2FnZSk7XG5cdH1cbn0pO1xuXG4vLyA9PT09PT09PT09PT09PT09PT09IFVJIGludGVyYWN0aW9uID09PT09PT09PT09PT09PT09PT0gLy9cblxucmVjYnV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRsZXQgc3RhdGUgPSByZWNidXQuY2xhc3NOYW1lO1xuXHRpZihzdGF0ZSA9PT0gJ3JlYy1idXQnKSB7XG5cdFx0cmVjYnV0LmNsYXNzTmFtZSA9ICdzdG9wLWJ1dCc7XG5cdFx0cmVjYnV0LmlubmVySFRNTCA9ICdTVE9QJ1xuXHRcdHNlbmRidXQuZGlzYWJsZWQgPSB0cnVlO1xuXHRcdC8vIHN0YXJ0IHJlY29yZGluZyBzb21lIHNlbnNvciBhbmQgZ3BzIGRhdGFcblx0XHRkYXRhUmVjb3JkZXIuc3RhcnQoKTtcblxuXHR9IGVsc2Uge1xuXHRcdHJlY2J1dC5jbGFzc05hbWUgPSAncmVjLWJ1dCc7XG5cdFx0cmVjYnV0LmlubmVySFRNTCA9ICdSRUMnO1xuXHRcdHNlbmRidXQuZGlzYWJsZWQgPSBmYWxzZTtcblx0XHQvLyBzdG9wIHJlY29yZGluZyBkYXRhXG5cdFx0ZGF0YVJlY29yZGVyLnN0b3AoKTtcblx0fVxufSk7XG5cbnNlbmRidXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdGxldCBtb3ZlID0gbW92ZWxpc3Qub3B0aW9uc1ttb3ZlbGlzdC5zZWxlY3RlZEluZGV4XS50ZXh0O1xuXHRsZXQgcmVzID0gY29uZmlybSgnWW91IGFyZSBhYm91dCB0byBzZW5kIGRhdGEgbGFiZWxlZCB3aXRoIFwiJyArIG1vdmUgKyAnXCIuIENvbmZpcm0gPycpO1xuXHRpZihyZXMgPT09IHRydWUpIHtcblx0XHQvLyBzZW5kIHJlY29yZGVkIGRhdGEgdG8gc2VydmVyIDpcblx0XHRsZXQgcGhyYXNlID0gZGF0YVJlY29yZGVyLmdldFJlY29yZGVkUGhyYXNlKCk7XG5cdFx0cGhyYXNlLmxhYmVsID0gbW92ZTtcblx0XHRwaHJhc2UuZGF0ZSA9IG5ldyBEYXRlKCk7XG5cdFx0c29ja2V0LmVtaXQoJ3dyaXRlUGhyYXNlJywgcGhyYXNlKTtcblx0XHRzZW5kYnV0LmRpc2FibGVkID0gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRzZW5kYnV0LmRpc2FibGVkID0gZmFsc2U7XG5cdH1cbn0pO1xuXG5cbmdldG1vZGVsc2J1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0c29ja2V0LmVtaXQoJ3RyYWluTW9kZWxzJyk7XG59KTtcblxuLy8gPT09PT09PT09PT09PT09PT09PT09IFBBR0UgSU5JVElBTElaQVRJT04gPT09PT09PT09PT09PT09PT09PSAvL1xuXG4oKCkgPT4ge1xuXHRjb25zdCB1cGRhdGVMaWtlbGllc3QgPSAoZGVsKSA9PiB7XG5cdFx0Ly9sZXQgbmV3TGFiZWwgPSBnbW1EZWNvZGVyLmxpa2VsaWVzdExhYmVsO1xuXG5cdFx0aWYoZ21tRGVjb2Rlci5saWtlbGllc3RMYWJlbCAhPT0gbGlrZWxpZXN0LmlubmVySFRNTCkge1xuXHRcdFx0Y2hhbmdlU291bmRzKGdtbURlY29kZXIubGlrZWxpZXN0TGFiZWwpO1xuXHRcdH1cblx0XHRsaWtlbGllc3QuaW5uZXJIVE1MID0gZ21tRGVjb2Rlci5saWtlbGllc3RMYWJlbDsvL25ld0xhYmVsO1xuXHRcdHNldFRpbWVvdXQodXBkYXRlTGlrZWxpZXN0LCBkZWwpO1xuXHR9XG5cblx0dXBkYXRlTGlrZWxpZXN0KDIwMCk7XG59KSgpO1xuXG4vLyA9PT09PT09PT09PT09PT0gc2Vuc29ycyBtb2NraW5nIGZvciBkZXNrdG9wID09PT09PT09PT09PT09IC8vXG4vLypcbihmdW5jdGlvbigpIHtcblxuXHRmdW5jdGlvbiBnZW5lcmFuZG9tKCkge1xuXHRcdGxldCByZXQgPSBbXTtcblx0XHRmb3IobGV0IGk9MDsgaTwxOyBpKyspIHtcblx0XHRcdHJldC5wdXNoKE1hdGgucmFuZG9tKCkgKiAyIC0gMSk7XG5cdFx0fVxuXG5cdFx0bGV0IHYgPSBNYXRoLnJhbmRvbSgpICogMiAtIDE7XG5cdFx0aW5wdXRDaGFpbi5wcm9jZXNzKG51bGwsIHYpO1xuXG5cdFx0ZGVsYXkoTWF0aC5yYW5kb20oKSAqIDEwICsgMTAwKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlbGF5KGRlbCkge1xuXHRcdHNldFRpbWVvdXQoZ2VuZXJhbmRvbSwgZGVsKTtcblx0fVxuXG5cdC8vIHVuY29tbWVudCB0byBzZW5kIHJhbmRvbSBzaWduYWwgaWYgbm8gc2Vuc29ycyBhdmFpbGFibGUgOlxuXHQvLyBnZW5lcmFuZG9tKCk7XG5cbn0pKCk7XG4vLyovIl19