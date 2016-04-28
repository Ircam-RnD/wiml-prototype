'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

var _motionInput = require('motion-input');

var _motionInput2 = _interopRequireDefault(_motionInput);

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

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
	frameSize: undefined.params.inputFrameSize,
	ctx: AudioContext
});

var intensity = new _commonLfoIntensity2['default']({});

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

var featuresBpf = new lfo.sinks.Bpf({
	radius: 1,
	min: 0,
	max: 1,
	canvas: document.querySelector('#features-canvas'),
	duration: 10 * inputChain.params.hopSize * inputChain.params.period,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

var signalBpf = new lfo.sinks.Bpf({
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
var likelihoodsBpf = new lfo.sinks.Bpf({
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
		_motionInput2['default'].addListener('acceleration', function (val) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvd2ltbC1jbGllbnQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzhCQUFlLGtCQUFrQjs7OzsyQkFDVCxjQUFjOzs7O3dCQUNqQixXQUFXOztJQUFwQixHQUFHOztrQ0FFTyx5QkFBeUI7Ozs7NkNBQ2Qsc0NBQXNDOzs7O3FDQUM5Qyw2QkFBNkI7Ozs7c0NBQzVCLCtCQUErQjs7OzttQ0FDakMsMkJBQTJCOzs7OztBQUduRCxTQUFTLFVBQVUsR0FBRTtBQUNqQixLQUFJLEVBQUUsR0FBQyxTQUFTLENBQUMsU0FBUztLQUFDLEdBQUc7S0FBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyw4REFBOEQsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNoSCxLQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFDckIsS0FBRyxHQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDckMsU0FBTyxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBRSxFQUFFLEFBQUMsRUFBQyxDQUFDO0VBQ3ZDO0FBQ0wsS0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUcsUUFBUSxFQUFDO0FBQ2YsS0FBRyxHQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLENBQUE7QUFDNUIsTUFBRyxHQUFHLElBQUUsSUFBSSxFQUFJO0FBQUMsVUFBTyxFQUFDLElBQUksRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDO0dBQUM7RUFDdkQ7QUFDTCxFQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFFLENBQUMsU0FBUyxD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RyxDQUFDLENBQUM7Q0FDckIsQ0FBQSxFQUFHLENBQUM7Ozs7QUFJTCxDQUFDLFlBQVc7O0FBRVgsVUFBUyxVQUFVLEdBQUc7QUFDckIsTUFBSSxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2IsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN0QixNQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDaEM7O0FBRUQsTUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDOUIsWUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7O0FBRTVCLE9BQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO0VBQ2hDOztBQUVELFVBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRTtBQUNuQixZQUFVLENBQUMsVUFBVSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0VBQzVCOzs7O0NBS0QsQ0FBQSxFQUFHLENBQUMiLCJmaWxlIjoic3JjL2NsaWVudC93aW1sLWNsaWVudC9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbyBmcm9tICdzb2NrZXQuaW8tY2xpZW50JztcbmltcG9ydCBtb3Rpb25JbnB1dCBmcm9tICdtb3Rpb24taW5wdXQnO1xuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmltcG9ydCBJbnRlbnNpdHkgZnJvbSAnLi4vY29tbW9uL2xmby1pbnRlbnNpdHknO1xuaW1wb3J0IElucHV0UHJvY2Vzc2luZ0NoYWluIGZyb20gJy4uL2NvbW1vbi9sZm8taW5wdXQtcHJvY2Vzc2luZy1jaGFpbic7XG5pbXBvcnQgRGF0YVJlY29yZGVyIGZyb20gJy4uL2NvbW1vbi9sZm8tZGF0YS1yZWNvcmRlcic7XG5pbXBvcnQgWG1tR21tRGVjb2RlciBmcm9tICcuLi9jb21tb24vbGZvLXhtbS1nbW0tZGVjb2Rlcic7XG5pbXBvcnQgQXVkaW9QbGF5ZXIgZnJvbSAnLi4vY29tbW9uL2F1ZGlvLXBsYXllci5qcyc7XG5cbi8vIGZyb20gOiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzU5MTY5MDAvaG93LWNhbi15b3UtZGV0ZWN0LXRoZS12ZXJzaW9uLW9mLWEtYnJvd3NlclxuZnVuY3Rpb24gZ2V0QnJvd3Nlcigpe1xuICAgIHZhciB1YT1uYXZpZ2F0b3IudXNlckFnZW50LHRlbSxNPXVhLm1hdGNoKC8ob3BlcmF8Y2hyb21lfHNhZmFyaXxmaXJlZm94fG1zaWV8dHJpZGVudCg/PVxcLykpXFwvP1xccyooXFxkKykvaSkgfHwgW107IFxuICAgIGlmKC90cmlkZW50L2kudGVzdChNWzFdKSl7XG4gICAgICAgIHRlbT0vXFxicnZbIDpdKyhcXGQrKS9nLmV4ZWModWEpIHx8IFtdOyBcbiAgICAgICAgcmV0dXJuIHtuYW1lOidJRScsdmVyc2lvbjoodGVtWzFdfHwnJyl9O1xuICAgICAgICB9ICAgXG4gICAgaWYoTVsxXT09PSdDaHJvbWUnKXtcbiAgICAgICAgdGVtPXVhLm1hdGNoKC9cXGJPUFJcXC8oXFxkKykvKVxuICAgICAgICBpZih0ZW0hPW51bGwpICAge3JldHVybiB7bmFtZTonT3BlcmEnLCB2ZXJzaW9uOnRlbVsxXX07fVxuICAgICAgICB9ICAgXG4gICAgTT1NWzJdPyBbTVsxXSwgTVsyXV06IFtuYXZpZ2F0b3IuYXBwTmFtZSwgbmF2aWdhdG9yLmFwcFZlcnNpb24sICctPyddO1xuICAgIGlmKCh0ZW09dWEubWF0Y2goL3ZlcnNpb25cXC8oXFxkKykvaSkpIT1udWxsKSB7TS5zcGxpY2UoMSwxLHRlbVsxXSk7fVxuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiBNWzBdLFxuICAgICAgdmVyc2lvbjogTVsxXVxuICAgIH07XG59XG5cbi8vYW5kIGZvciBvcyAoaW4gY2FzZSksIHNlZSA6IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9xdWVzdGlvbnMvOTUxNDE3OS9ob3ctdG8tZmluZC10aGUtb3BlcmF0aW5nLXN5c3RlbS12ZXJzaW9uLXVzaW5nLWphdmFzY3JpcHRcblxubGV0IHJhZHMgPSBmYWxzZTtcbmlmKGdldEJyb3dzZXIoKS5uYW1lID09PSAnQ2hyb21lJykge1xuXHRyYWRzID0gdHJ1ZTtcblx0Y29uc29sZS5sb2coJ3N3aXRjaGluZyB0byByYWRzIG1vZGUgZm9yIHJvdGF0aW9uUmF0ZScpO1xufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PSBDb29vb29vS2llcyAhID09PT09PT09PT09PT09PT09PT0vL1xuXG4vKlxuY29uc3Qgc2V0Q29va2llID0gKGNuYW1lLGN2YWx1ZSxleGRheXMpID0+IHtcbiAgICBsZXQgZCA9IG5ldyBEYXRlKCk7XG4gICAgZC5zZXRUaW1lKGQuZ2V0VGltZSgpICsgKGV4ZGF5cyoyNCo2MCo2MCoxMDAwKSk7XG4gICAgbGV0IGV4cGlyZXMgPSBcImV4cGlyZXM9XCIgKyBkLnRvR01UU3RyaW5nKCk7XG4gICAgZG9jdW1lbnQuY29va2llID0gY25hbWUrXCI9XCIrY3ZhbHVlK1wiOyBcIitleHBpcmVzK1wiOyBwYXRoPS9cIjtcbn1cblxuY29uc3QgZ2V0Q29va2llID0gKGNuYW1lKSA9PiB7XG4gICAgbGV0IG5hbWUgPSBjbmFtZSArIFwiPVwiO1xuICAgIGxldCBjYSA9IGRvY3VtZW50LmNvb2tpZS5zcGxpdCgnOycpO1xuICAgIGZvcihsZXQgaT0wOyBpPGNhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBjID0gY2FbaV07XG4gICAgICAgIHdoaWxlIChjLmNoYXJBdCgwKT09JyAnKSBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgICAgIGlmIChjLmluZGV4T2YobmFtZSkgPT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGMuc3Vic3RyaW5nKG5hbWUubGVuZ3RoLCBjLmxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIFwiXCI7XG59XG5cbmNvbnN0IGNoZWNrQ29va2llID0gKCkgPT4ge1xuICAgIGxldCB1c2VyPWdldENvb2tpZShcInVzZXJuYW1lXCIpO1xuICAgIGlmICh1c2VyICE9IFwiXCIpIHtcbiAgICAgICAgYWxlcnQoXCJXZWxjb21lIGFnYWluIFwiICsgdXNlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgICB1c2VyID0gcHJvbXB0KFwiUGxlYXNlIGVudGVyIHlvdXIgbmFtZTpcIixcIlwiKTtcbiAgICAgICBpZiAodXNlciAhPSBcIlwiICYmIHVzZXIgIT0gbnVsbCkge1xuICAgICAgICAgICBzZXRDb29raWUoXCJ1c2VybmFtZVwiLCB1c2VyLCAzMCk7XG4gICAgICAgfVxuICAgIH1cbn1cbi8vKi9cblxuLy9jaGVja0Nvb2tpZSgpOyBcblxuLy8gPT09PT09PT09PT09PT09PT09PT0gRE9NIGVsZW1lbnRzID09PT09PT09PT09PT09PT09PT0gLy9cblxuLy9sZXQgc291bmRtdXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NvdW5kbXV0ZScpO1xubGV0IHJlY2J1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNyZWMtYnV0Jyk7XG5sZXQgc2VuZGJ1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzZW5kLWJ1dCcpO1xuc2VuZGJ1dC5kaXNhYmxlZCA9IHRydWU7XG4vL2xldCB0cmFpbmJ1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyN0cmFpbi1idXQnKTtcbmxldCBnZXRtb2RlbHNidXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZ2V0bW9kZWxzLWJ1dCcpO1xubGV0IG1vdmVsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI21vdmUtbGlzdCcpO1xubGV0IGxpa2VsaWVzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaWtlbGllc3QtbGFiZWwtZGl2Jyk7XG5cbi8vID09PT09PT09PT09PT09PT09PSBTT05JRklDQVRJT04gPT09PT09PT09PT09PT09PT09PT0gLy9cblxuLy8gPT09PT09PT09PT09PT09PT09PSB0aGUgV2ViIEF1ZGlvIHdheSA9PT09PT09PT09PT09PT09PT0gLy9cblxuLy8qXG5sZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IGZ1bmN0aW9uKCl7fTtcbmxldCBjb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5sZXQgdG91Y2hlZCA9IGZhbHNlO1xubGV0IGxvYWRlZCA9IDA7XG5cbi8qXG5kb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgKCkgPT4ge1xuXHRpZih0b3VjaGVkIHx8IGxvYWRlZCA8IDMpIHJldHVybjtcblx0dG91Y2hlZCA9IHRydWU7XG5cdGZvcihsZXQgaT0wOyBpPHBsYXllcnMubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zb2xlLmxvZyhpICsgJyA6IHN0YXJ0ICEnKTtcblx0XHRwbGF5ZXJzW2ldLnN0YXJ0KCk7XG5cdH1cbn0pO1xuXG5sZXQgcGxheWVycyA9IFtdO1xucGxheWVycy5sZW5ndGggPSAzO1xuXG5jb25zdCBhamF4UmVxcyA9IFtdO1xuYWpheFJlcXMubGVuZ3RoID0gMztcblxuY29uc3QgbG9hZFNvdW5kID0gKHVybCwgaW5kZXgsIHRyaWcpID0+IHtcblx0Y29uc3QgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cdGFqYXhSZXFzW2luZGV4XSA9IHJlcTtcblx0cmVxLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG5cdHJlcS5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuXG5cdHJlcS5vbmxvYWQgPSAoKSA9PiB7XG5cdFx0Y29udGV4dC5kZWNvZGVBdWRpb0RhdGEocmVxLnJlc3BvbnNlLCAoYnVmZmVyKSA9PiB7XG5cdFx0XHQvL2NvbnN0IHBsYXllciA9IG5ldyBBdWRpb1BsYXllcihjb250ZXh0LCBidWZmZXIpO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhcImxvYWRlZCAhXCIpO1xuXHRcdFx0cGxheWVyc1tpbmRleF0gPSBuZXcgQXVkaW9QbGF5ZXIoY29udGV4dCwgYnVmZmVyKTtcblx0XHRcdGNvbnNvbGUubG9nKHVybCArIFwiIGxvYWRlZCAhXCIpO1xuXHRcdFx0dHJpZyhwbGF5ZXJzLmxlbmd0aC0xKTtcblx0XHR9KTtcblx0fTtcblx0cmVxLnNlbmQoKTtcbn1cblxubG9hZFNvdW5kKFwic291bmRzL2J1YnVsbGVfaGFybW8ubXAzXCIsIDAsICgpID0+IHsgbG9hZGVkKys7IH0pO1xubG9hZFNvdW5kKFwic291bmRzL21hcmNoZXN5bnRoX2R1Y2subXAzXCIsIDEsICgpID0+IHsgbG9hZGVkKys7IH0pO1xubG9hZFNvdW5kKFwic291bmRzL3RleDAxLTIzX2NhcnRvb25fbG9vcC5tcDNcIiwgMiwgKCkgPT4geyBsb2FkZWQrKzsgfSk7XG5cbmNvbnN0IGNoYW5nZVNvdW5kcyA9IChsYWJlbCkgPT4ge1xuXG5cdC8vY29uc29sZS5sb2cocGxheWVycy5sZW5ndGgpO1xuXHRzd2l0Y2ggKGxhYmVsKSB7XG5cdFx0Y2FzZSAnU3RpbGwnOlxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8cGxheWVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihpPT0wKSB7XG5cdFx0XHRcdFx0cGxheWVyc1tpXS5mYWRlKDEuMCwgMTAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGxheWVyc1tpXS5mYWRlKDAuMCwgMTAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSAnV2Fsayc6XG5cdFx0XHRmb3IobGV0IGk9MDsgaTxwbGF5ZXJzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmKGk9PTEpIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMS4wLCAxMDAwKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRwbGF5ZXJzW2ldLmZhZGUoMC4wLCAxMDAwKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlICdSdW4nOlxuXHRcdFx0Zm9yKGxldCBpPTA7IGk8cGxheWVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZihpPT0yKSB7XG5cdFx0XHRcdFx0cGxheWVyc1tpXS5mYWRlKDEuMCwgMTAwMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGxheWVyc1tpXS5mYWRlKDAuMCwgMTAwMCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG59XG4vLyovXG5cbmNvbnN0IGNoYW5nZVNvdW5kcyA9IChsYWJlbCkgPT4ge307XG5cbi8vID09PT09PT09PT09PT09PT09PT09PSBsZm9wIGdyYXBoID09PT09PT09PT09PT09PT09PT09IC8vXG5cbmNvbnN0IGV2ZW50SW4gPSBuZXcgbGZvLnNvdXJjZXMuRXZlbnRJbih7XG5cdC8vcmVsYXRpdmU6IHRydWUsXG5cdGZyYW1lU2l6ZTogdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUsXG5cdGN0eDogQXVkaW9Db250ZXh0XG59KTtcblxuY29uc3QgaW50ZW5zaXR5ID0gbmV3IEludGVuc2l0eSh7XG5cbn0pO1xuXG5jb25zdCBpbnB1dENoYWluID0gbmV3IElucHV0UHJvY2Vzc2luZ0NoYWluKHtcblx0d2luZG93U2l6ZTogNjQsXG5cdGhvcFNpemU6IDE2LFxuXHRmcmFtZVNpemU6IDY0LFxuXHRwZXJpb2Q6IDIwXG59KTtcbmNvbnN0IGRhdGFSZWNvcmRlciA9IG5ldyBEYXRhUmVjb3JkZXIoe1xuXHRzZXBhcmF0ZUFycmF5czogdHJ1ZVxufSk7XG5jb25zdCBnbW1EZWNvZGVyID0gbmV3IFhtbUdtbURlY29kZXIoe1xuXHRsaWtlbGlob29kV2luZG93OiAyXG59KTtcblxuY29uc3QgZmVhdHVyZXNCcGYgPSBuZXcgbGZvLnNpbmtzLkJwZih7XG5cdHJhZGl1czogMSxcblx0bWluOiAwLFxuXHRtYXg6IDEsXG5cdGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZlYXR1cmVzLWNhbnZhcycpLFxuXHRkdXJhdGlvbjogMTAgKiBpbnB1dENoYWluLnBhcmFtcy5ob3BTaXplICogaW5wdXRDaGFpbi5wYXJhbXMucGVyaW9kLFxuXHRjb2xvcnM6IFsnI2YwMCcsICcjMGMwJywgJyMzM2YnXSAvLyBtYWduaXR1ZGUgOiBSZWQsIGZyZXF1ZW5jeSA6IEdyZWVuLCBwZXJpb2RpY2l0eSA6IEJsdWVcbn0pO1xuXG5jb25zdCBzaWduYWxCcGYgPSBuZXcgbGZvLnNpbmtzLkJwZih7XG5cdGZyYW1lU2l6ZTogMSxcblx0cmFkaXVzOiAwLFxuXHRtaW46IDAsXG5cdG1heDogMSxcblx0Y2FudmFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2lnbmFsLWNhbnZhcycpLFxuXHRkdXJhdGlvbjogMTAgKiBpbnB1dENoYWluLnBhcmFtcy5ob3BTaXplICogaW5wdXRDaGFpbi5wYXJhbXMucGVyaW9kLFxuXHRjb2xvcnM6IFsnIzAwMCddIC8vIG1hZ25pdHVkZSA6IFJlZCwgZnJlcXVlbmN5IDogR3JlZW4sIHBlcmlvZGljaXR5IDogQmx1ZVxufSk7XG5cbi8qXG4vLyB0ZW1wb3JhcmlseSB1bmF2YWlsYWJsZSAuLi5cbmNvbnN0IGxpa2VsaWhvb2RzU3BlY3RybyA9IG5ldyBsZm8uc2lua3MuU3BlY3Ryb2dyYW0oe1xuLy9jb25zdCBsaWtlbGlob29kc1NwZWN0cm8gPSBuZXcgTXlTcGVjdHJvZ3JhbSh7XG5cdHNjYWxlOiAxMCxcblx0Y2FudmFzOiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGlrZWxpaG9vZHMtY2FudmFzJyksXG5cdGNvbG9yOiAnI2YwMCdcbn0pO1xuLy8qL1xuXG4vLypcbmNvbnN0IGxpa2VsaWhvb2RzQnBmID0gbmV3IGxmby5zaW5rcy5CcGYoe1xuXHRyYWRpdXM6IDEsXG5cdG1pbjogMCxcblx0bWF4OiAxLFxuXHRjYW52YXM6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsaWtlbGlob29kcy1jYW52YXMnKSxcblx0ZHVyYXRpb246IDEwICogaW5wdXRDaGFpbi5wYXJhbXMuaG9wU2l6ZSAqIGlucHV0Q2hhaW4ucGFyYW1zLnBlcmlvZCxcblx0Y29sb3JzOiBbJyNmMDAnLCAnIzBjMCcsICcjMzNmJ10gLy8gbWFnbml0dWRlIDogUmVkLCBmcmVxdWVuY3kgOiBHcmVlbiwgcGVyaW9kaWNpdHkgOiBCbHVlXG59KTtcbi8vKi9cblxuLy9pbnRlbnNpdHkuY29ubmVjdChpbnB1dENoYWluKVxuXG5pbnB1dENoYWluLmNvbm5lY3QoZGF0YVJlY29yZGVyKTtcblxuaW5wdXRDaGFpbi5jb25uZWN0KGdtbURlY29kZXIpO1xuXG5pbnB1dENoYWluLnByZUZyYW1lckNvbm5lY3Qoc2lnbmFsQnBmKTtcbmlucHV0Q2hhaW4uY29ubmVjdChmZWF0dXJlc0JwZik7XG5cbi8vZ21tRGVjb2Rlci5jb25uZWN0KGxpa2VsaWhvb2RzU3BlY3Rybyk7XG5nbW1EZWNvZGVyLmNvbm5lY3QobGlrZWxpaG9vZHNCcGYpO1xuXG4vLyBHTyAhXG5pbnB1dENoYWluLnN0YXJ0KCk7XG5cbmNvbnN0IHJvdW5kVmFsdWUgPSAoaW5wdXQpID0+IHtcblx0aWYgKGlucHV0ID09PSB1bmRlZmluZWQpXG5cdFx0cmV0dXJuICd1bmRlZmluZWQnO1xuXHRpZiAoaW5wdXQgPT09IG51bGwpXG5cdFx0cmV0dXJuICdudWxsJztcblx0cmV0dXJuIE1hdGgucm91bmQoaW5wdXQgKiAxMDApIC8gMTAwO1xufTtcblxuY29uc3QgZmVlZElucHV0Q2hhaW4gPSAobW9kdWxlKSA9PiB7XG5cdGlmKG1vZHVsZS5pc1ZhbGlkKSB7XG5cdFx0Lypcblx0XHRtb3Rpb25JbnB1dC5hZGRMaXN0ZW5lcignZW5lcmd5JywgKHZhbCkgPT4ge1xuXHRcdFx0aW5wdXRDaGFpbi5wcm9jZXNzKHBlcmZvcm1hbmNlLm5vdygpLCB2YWwpO1xuXHRcdH0pO1xuXHRcdC8vKi9cblxuXHRcdC8vKlxuXHRcdG1vdGlvbklucHV0LmFkZExpc3RlbmVyKCdhY2NlbGVyYXRpb24nLCAodmFsKSA9PiB7XG5cdFx0XHRpbnB1dENoYWluLnByb2Nlc3MocGVyZm9ybWFuY2Uubm93KCksIHZhbCk7XG5cdFx0fSk7XG5cdFx0Ly8qL1xuXG5cdFx0Ly8qXG5cdFx0bW90aW9uSW5wdXQuYWRkTGlzdGVuZXIoJ3JvdGF0aW9uUmF0ZScsICh2YWwpID0+IHtcblx0XHRcdC8vaGVyZSBjb21wdXRlIHRoZSBlcXVpdmFsZW50IG9mIFwic3BpblwiIDpcblx0XHRcdGxldCB2YWxTdGQgPSB2YWwuc2xpY2UoMCk7XG5cdFx0XHRpZihyYWRzKSB7XG5cdFx0XHRcdGZvcihsZXQgaT0wOyBpPDM7IGkrKykge1xuXHRcdFx0XHRcdHZhbFN0ZFtpXSAqPSAoMTgwL01hdGguUEkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRsZXQgc3BpbiA9IE1hdGgucG93KHZhbFN0ZFswXSp2YWxTdGRbMF0gKyB2YWxTdGRbMV0qdmFsU3RkWzFdICsgdmFsU3RkWzJdKnZhbFN0ZFsyXSwgMC41KSAqIDAuMDAzO1xuXHRcdFx0aW5wdXRDaGFpbi5wcm9jZXNzKHBlcmZvcm1hbmNlLm5vdygpLCBzcGluKTtcblx0XHR9KTtcblx0XHQvLyovXG5cdH1cbn07XG5cbihmdW5jdGlvbigpIHtcblx0bW90aW9uSW5wdXRcblx0XHQuaW5pdChcblx0XHRcdCdlbmVyZ3knLFxuXHRcdFx0J3JvdGF0aW9uUmF0ZSdcblx0XHRcdClcblx0XHQudGhlbigobW9kdWxlcykgPT4ge1xuXHRcdFx0Y29uc3QgZW5lcmd5ID0gbW9kdWxlc1swXTtcblx0XHRcdGNvbnN0IHJvdGF0aW9uUmF0ZSA9IG1vZHVsZXNbMV07XG5cdFx0XHQvL2ZlZWRJbnB1dENoYWluKGVuZXJneSk7XG5cdFx0XHRmZWVkSW5wdXRDaGFpbihyb3RhdGlvblJhdGUpO1xuXHRcdH0pXG5cdFx0LmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKSk7XG59KSgpO1xuXG4vLyA9PT09PT09PT09PT09PT09PSBzb2NrZXQgb3BlcmF0aW9ucyA9PT09PT09PT09PT09PT09PT0gLy9cblxuLy9sZXQgc29ja2V0ID0gaW8uY29ubmVjdCgnaHR0cDovLzE2OS4yNTQuNjguMTE3OjMwMDAnKTtcbmxldCBzb2NrZXQgPSBpby5jb25uZWN0KGxvY2F0aW9uLmhvc3QgKyAnL3dpbWwtY2xpZW50Jyk7XG4vL2xldCBzb2NrZXQgPSBpby5jb25uZWN0KCcxMjcuMC4wLjE6MzAwMCcpO1xuXG5zb2NrZXQub24oJ2NvbmZpcm0nLCAobWVzc2FnZSkgPT4ge1xuXHRjb25zb2xlLmxvZygnc2VydmVyIGNvbmZpcm1zIHJlY2VwdGlvbiBvZiBtZXNzYWdlIDonKTtcblx0Y29uc29sZS5sb2cobWVzc2FnZSk7XG59KTtcblxuLy8gdGhpcyBjb3VsZCBiZSBwcm9iYWJseSBpbXByb3ZlZCAoa2luZCBvZiBjYWxsYmFjayBmcm9tIHhtbSlcbnNvY2tldC5vbigndHJhaW4nLCAobWVzc2FnZSkgPT4ge1xuXHRpZihtZXNzYWdlID09PSAnb2snKSB7XG5cdFx0Ly8gdHJhaW5pbmcgd29ya2VkLCBjYW4gcmVxdWVzdCBuZXcgbW9kZWxzXG5cdH0gZWxzZSB7XG5cdFx0Y29uc29sZS5lcnJvcihtZXNzYWdlKTtcblx0fVxufSlcblxuLy8gdXBkYXRlIG1vZGVsIG9uIG5ldyBtb2RlbCByZWNlcHRpb24gZnJvbSBzZXJ2ZXIgOlxuc29ja2V0Lm9uKCdtb2RlbHMnLCAobW9kZWxzKSA9PiB7XG5cdGNvbnNvbGUubG9nKG1vZGVscyk7XG5cdGxldCBtID0gbW9kZWxzLm1vZGVscztcblx0aWYoQXJyYXkuaXNBcnJheShtKSAmJiBtLmxlbmd0aCA+IDApIHtcblx0XHQvL2dtbURlY29kZXIuc2V0TW9kZWwobVttLmxlbmd0aCAtIDFdKTtcblx0XHRjb25zb2xlLmxvZyhtb2RlbHMubWVzc2FnZSk7XG5cdFx0Y29uc29sZS5sb2cobVttLmxlbmd0aCAtIDFdKTtcblx0XHRnbW1EZWNvZGVyLnNldE1vZGVsKG1bbS5sZW5ndGggLSAxXSk7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc29sZS5sb2cobW9kZWxzLm1lc3NhZ2UpO1xuXHR9XG59KTtcblxuLy8gPT09PT09PT09PT09PT09PT09PSBVSSBpbnRlcmFjdGlvbiA9PT09PT09PT09PT09PT09PT09IC8vXG5cbnJlY2J1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0bGV0IHN0YXRlID0gcmVjYnV0LmNsYXNzTmFtZTtcblx0aWYoc3RhdGUgPT09ICdyZWMtYnV0Jykge1xuXHRcdHJlY2J1dC5jbGFzc05hbWUgPSAnc3RvcC1idXQnO1xuXHRcdHJlY2J1dC5pbm5lckhUTUwgPSAnU1RPUCdcblx0XHRzZW5kYnV0LmRpc2FibGVkID0gdHJ1ZTtcblx0XHQvLyBzdGFydCByZWNvcmRpbmcgc29tZSBzZW5zb3IgYW5kIGdwcyBkYXRhXG5cdFx0ZGF0YVJlY29yZGVyLnN0YXJ0KCk7XG5cblx0fSBlbHNlIHtcblx0XHRyZWNidXQuY2xhc3NOYW1lID0gJ3JlYy1idXQnO1xuXHRcdHJlY2J1dC5pbm5lckhUTUwgPSAnUkVDJztcblx0XHRzZW5kYnV0LmRpc2FibGVkID0gZmFsc2U7XG5cdFx0Ly8gc3RvcCByZWNvcmRpbmcgZGF0YVxuXHRcdGRhdGFSZWNvcmRlci5zdG9wKCk7XG5cdH1cbn0pO1xuXG5zZW5kYnV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRsZXQgbW92ZSA9IG1vdmVsaXN0Lm9wdGlvbnNbbW92ZWxpc3Quc2VsZWN0ZWRJbmRleF0udGV4dDtcblx0bGV0IHJlcyA9IGNvbmZpcm0oJ1lvdSBhcmUgYWJvdXQgdG8gc2VuZCBkYXRhIGxhYmVsZWQgd2l0aCBcIicgKyBtb3ZlICsgJ1wiLiBDb25maXJtID8nKTtcblx0aWYocmVzID09PSB0cnVlKSB7XG5cdFx0Ly8gc2VuZCByZWNvcmRlZCBkYXRhIHRvIHNlcnZlciA6XG5cdFx0bGV0IHBocmFzZSA9IGRhdGFSZWNvcmRlci5nZXRSZWNvcmRlZFBocmFzZSgpO1xuXHRcdHBocmFzZS5sYWJlbCA9IG1vdmU7XG5cdFx0cGhyYXNlLmRhdGUgPSBuZXcgRGF0ZSgpO1xuXHRcdHNvY2tldC5lbWl0KCd3cml0ZVBocmFzZScsIHBocmFzZSk7XG5cdFx0c2VuZGJ1dC5kaXNhYmxlZCA9IHRydWU7XG5cdH0gZWxzZSB7XG5cdFx0c2VuZGJ1dC5kaXNhYmxlZCA9IGZhbHNlO1xuXHR9XG59KTtcblxuXG5nZXRtb2RlbHNidXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdHNvY2tldC5lbWl0KCd0cmFpbk1vZGVscycpO1xufSk7XG5cbi8vID09PT09PT09PT09PT09PT09PT09PSBQQUdFIElOSVRJQUxJWkFUSU9OID09PT09PT09PT09PT09PT09PT0gLy9cblxuKCgpID0+IHtcblx0Y29uc3QgdXBkYXRlTGlrZWxpZXN0ID0gKGRlbCkgPT4ge1xuXHRcdC8vbGV0IG5ld0xhYmVsID0gZ21tRGVjb2Rlci5saWtlbGllc3RMYWJlbDtcblxuXHRcdGlmKGdtbURlY29kZXIubGlrZWxpZXN0TGFiZWwgIT09IGxpa2VsaWVzdC5pbm5lckhUTUwpIHtcblx0XHRcdGNoYW5nZVNvdW5kcyhnbW1EZWNvZGVyLmxpa2VsaWVzdExhYmVsKTtcblx0XHR9XG5cdFx0bGlrZWxpZXN0LmlubmVySFRNTCA9IGdtbURlY29kZXIubGlrZWxpZXN0TGFiZWw7Ly9uZXdMYWJlbDtcblx0XHRzZXRUaW1lb3V0KHVwZGF0ZUxpa2VsaWVzdCwgZGVsKTtcblx0fVxuXG5cdHVwZGF0ZUxpa2VsaWVzdCgyMDApO1xufSkoKTtcblxuLy8gPT09PT09PT09PT09PT09IHNlbnNvcnMgbW9ja2luZyBmb3IgZGVza3RvcCA9PT09PT09PT09PT09PSAvL1xuLy8qXG4oZnVuY3Rpb24oKSB7XG5cblx0ZnVuY3Rpb24gZ2VuZXJhbmRvbSgpIHtcblx0XHRsZXQgcmV0ID0gW107XG5cdFx0Zm9yKGxldCBpPTA7IGk8MTsgaSsrKSB7XG5cdFx0XHRyZXQucHVzaChNYXRoLnJhbmRvbSgpICogMiAtIDEpO1xuXHRcdH1cblxuXHRcdGxldCB2ID0gTWF0aC5yYW5kb20oKSAqIDIgLSAxO1xuXHRcdGlucHV0Q2hhaW4ucHJvY2VzcyhudWxsLCB2KTtcblxuXHRcdGRlbGF5KE1hdGgucmFuZG9tKCkgKiAxMCArIDEwMCk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWxheShkZWwpIHtcblx0XHRzZXRUaW1lb3V0KGdlbmVyYW5kb20sIGRlbCk7XG5cdH1cblxuXHQvLyB1bmNvbW1lbnQgdG8gc2VuZCByYW5kb20gc2lnbmFsIGlmIG5vIHNlbnNvcnMgYXZhaWxhYmxlIDpcblx0Ly8gZ2VuZXJhbmRvbSgpO1xuXG59KSgpO1xuLy8qLyJdfQ==