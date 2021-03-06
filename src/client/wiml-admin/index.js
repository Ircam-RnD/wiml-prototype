import io from 'socket.io-client';
import lfo from 'waves-lfo';

// let clearmodelsbut = document.querySelector('#clearmodels-but');
// let clearphrasesbut = document.querySelector('#clearphrases-but');
let clearallbut = document.querySelector('#clearall-but');

let socket = io.connect(location.host + '/wiml-admin');

// clearmodelsbut.addEventListener('click', () => {
// 	socket.emit('clearModels');
// });

// clearphrasesbut.addEventListener('click', () => {
// 	socket.emit('clearPhrases');
// });

clearallbut.addEventListener('click', () => {
	socket.emit('clearAll');
});

// responses :
socket.on('clear', (data) => {
	console.log(data.message);
	socket.emit('refreshPhrases');
});

let lfoPhrases = [];
let phrasesDiv = document.querySelector('.phrases-div');
let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};
let context = new AudioContext();


socket.on('phrases', (phrases) => {

	lfoPhrases = [];
	while(phrasesDiv.firstChild) {
		phrasesDiv.removeChild(phrasesDiv.firstChild);
	}

	let p = phrases.phrases;
	if(Array.isArray(p) && p.length > 0) {
		//console.log(p);
		console.log(phrases.message);
		console.log(p[p.length - 1]);
	} else {
		console.log(phrases.message);
	}

	for(let i=0; i<p.length; i++) {

		const cd1 = document.createElement('div');
		cd1.setAttribute('class', 'clear-div');
		const c = document.createElement('canvas');
		c.setAttribute('id', 'phrase-' + i);
		cd1.appendChild(c);
		phrasesDiv.appendChild(cd1);

		const cd2 = document.createElement('div');
		cd2.setAttribute('class', 'canvas-legend');
		cd2.innerHTML = p[i].label + '<br />' + p[i].date + '<br />';
		phrasesDiv.appendChild(cd2);
		phrasesDiv.appendChild(document.createElement('br'));

		let evin = new lfo.sources.EventIn({
			frameSize: 1,
			frameRate: 1,
			ctx: context
		});

		let framer = new lfo.operators.Framer({
			frameSize: p[i].dimension,
			hopSize: p[i].dimension
		});

		const bpf = new lfo.sinks.Bpf({
			trigger: true,
			radius: 5,
			frameSize: p[i].dimension,
			min: 0,
			max: 1,
			canvas: document.querySelector('#phrase-' + i),
			duration: 1000 * (p[i].data.length - p[i].dimension),
			colors: ['#f00', '#0c0', '#33f'] // magnitude : R, frequency : G, periodicity : B
		})

		evin.connect(framer);
		framer.connect(bpf);

		//evin.initialize({ frameSize: 1, frameRate: 1000 });
		//framer.initialize({ frameSize: p[i].dimension });
		evin.start();

		let date = Date.now();
		let arrayin = new Float32Array(1);

		for(let j=0; j<p[i].data.length; j++) {
			arrayin[0] = p[i].data[j];
			evin.process(j * 1000, arrayin);
		}


		lfoPhrases.push(bpf);

		framer.disconnect(bpf);
		evin.stop();
	}
});