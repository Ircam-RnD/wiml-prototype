'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

var _wavesLfo = require('waves-lfo');

var _wavesLfo2 = _interopRequireDefault(_wavesLfo);

// let clearmodelsbut = document.querySelector('#clearmodels-but');
// let clearphrasesbut = document.querySelector('#clearphrases-but');
var clearallbut = document.querySelector('#clearall-but');

var socket = _socketIoClient2['default'].connect(location.host + '/wiml-admin');

// clearmodelsbut.addEventListener('click', () => {
// 	socket.emit('clearModels');
// });

// clearphrasesbut.addEventListener('click', () => {
// 	socket.emit('clearPhrases');
// });

clearallbut.addEventListener('click', function () {
	socket.emit('clearAll');
});

// responses :
socket.on('clear', function (data) {
	console.log(data.message);
	socket.emit('refreshPhrases');
});

var lfoPhrases = [];
var phrasesDiv = document.querySelector('.phrases-div');
var AudioContext = window.AudioContext || window.webkitAudioContext || function () {};
var context = new AudioContext();

socket.on('phrases', function (phrases) {

	lfoPhrases = [];
	while (phrasesDiv.firstChild) {
		phrasesDiv.removeChild(phrasesDiv.firstChild);
	}

	var p = phrases.phrases;
	if (Array.isArray(p) && p.length > 0) {
		//console.log(p);
		console.log(phrases.message);
		console.log(p[p.length - 1]);
	} else {
		console.log(phrases.message);
	}

	for (var i = 0; i < p.length; i++) {

		var cd1 = document.createElement('div');
		cd1.setAttribute('class', 'clear-div');
		var c = document.createElement('canvas');
		c.setAttribute('id', 'phrase-' + i);
		cd1.appendChild(c);
		phrasesDiv.appendChild(cd1);

		var cd2 = document.createElement('div');
		cd2.setAttribute('class', 'canvas-legend');
		cd2.innerHTML = p[i].label + '<br />' + p[i].date + '<br />';
		phrasesDiv.appendChild(cd2);
		phrasesDiv.appendChild(document.createElement('br'));

		var evin = new _wavesLfo2['default'].sources.EventIn({
			frameSize: 1,
			frameRate: 1,
			ctx: context
		});

		var framer = new _wavesLfo2['default'].operators.Framer({
			frameSize: p[i].dimension,
			hopSize: p[i].dimension
		});

		var bpf = new _wavesLfo2['default'].sinks.Bpf({
			trigger: true,
			radius: 5,
			frameSize: p[i].dimension,
			min: 0,
			max: 1,
			canvas: document.querySelector('#phrase-' + i),
			duration: 1000 * (p[i].data.length - p[i].dimension),
			colors: ['#f00', '#0c0', '#33f'] // magnitude : R, frequency : G, periodicity : B
		});

		evin.connect(framer);
		framer.connect(bpf);

		//evin.initialize({ frameSize: 1, frameRate: 1000 });
		//framer.initialize({ frameSize: p[i].dimension });
		evin.start();

		var date = Date.now();
		var arrayin = new Float32Array(1);

		for (var j = 0; j < p[i].data.length; j++) {
			arrayin[0] = p[i].data[j];
			evin.process(j * 1000, arrayin);
		}

		lfoPhrases.push(bpf);

		framer.disconnect(bpf);
		evin.stop();
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvd2ltbC1hZG1pbi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OzhCQUFlLGtCQUFrQjs7Ozt3QkFDakIsV0FBVzs7Ozs7O0FBSTNCLElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTFELElBQUksTUFBTSxHQUFHLDRCQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDOzs7Ozs7Ozs7O0FBVXZELFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUMzQyxPQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ3hCLENBQUMsQ0FBQzs7O0FBR0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDNUIsUUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDMUIsT0FBTSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0NBQzlCLENBQUMsQ0FBQzs7QUFFSCxJQUFJLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDcEIsSUFBSSxVQUFVLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUN4RCxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQyxrQkFBa0IsSUFBSSxZQUFVLEVBQUUsQ0FBQztBQUNwRixJQUFJLE9BQU8sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDOztBQUdqQyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFDLE9BQU8sRUFBSzs7QUFFakMsV0FBVSxHQUFHLEVBQUUsQ0FBQztBQUNoQixRQUFNLFVBQVUsQ0FBQyxVQUFVLEVBQUU7QUFDNUIsWUFBVSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUM7RUFDOUM7O0FBRUQsS0FB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Q0FBQzs7OztBQUlwQixNQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7O0FBRWIsTUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLE1BQUksT0FBTyxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDOztBQUVsQyxPQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDckMsVUFBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDMUIsT0FBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0dBQ2hDOztBQUdELFlBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7O0FBRXJCLFFBQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsTUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0VBQ1o7Q0FDRCxDQUFDLENBQUMiLCJmaWxlIjoic3JjL2NsaWVudC93aW1sLWFkbWluL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGlvIGZyb20gJ3NvY2tldC5pby1jbGllbnQnO1xuaW1wb3J0IGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuXG4vLyBsZXQgY2xlYXJtb2RlbHNidXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2xlYXJtb2RlbHMtYnV0Jyk7XG4vLyBsZXQgY2xlYXJwaHJhc2VzYnV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NsZWFycGhyYXNlcy1idXQnKTtcbmxldCBjbGVhcmFsbGJ1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbGVhcmFsbC1idXQnKTtcblxubGV0IHNvY2tldCA9IGlvLmNvbm5lY3QobG9jYXRpb24uaG9zdCArICcvd2ltbC1hZG1pbicpO1xuXG4vLyBjbGVhcm1vZGVsc2J1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbi8vIFx0c29ja2V0LmVtaXQoJ2NsZWFyTW9kZWxzJyk7XG4vLyB9KTtcblxuLy8gY2xlYXJwaHJhc2VzYnV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuLy8gXHRzb2NrZXQuZW1pdCgnY2xlYXJQaHJhc2VzJyk7XG4vLyB9KTtcblxuY2xlYXJhbGxidXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdHNvY2tldC5lbWl0KCdjbGVhckFsbCcpO1xufSk7XG5cbi8vIHJlc3BvbnNlcyA6XG5zb2NrZXQub24oJ2NsZWFyJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcblx0c29ja2V0LmVtaXQoJ3JlZnJlc2hQaHJhc2VzJyk7XG59KTtcblxubGV0IGxmb1BocmFzZXMgPSBbXTtcbmxldCBwaHJhc2VzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBocmFzZXMtZGl2Jyk7XG5sZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IGZ1bmN0aW9uKCl7fTtcbmxldCBjb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5cbnNvY2tldC5vbigncGhyYXNlcycsIChwaHJhc2VzKSA9PiB7XG5cblx0bGZvUGhyYXNlcyA9IFtdO1xuXHR3aGlsZShwaHJhc2VzRGl2LmZpcnN0Q2hpbGQpIHtcblx0XHRwaHJhc2VzRGl2LnJlbW92ZUNoaWxkKHBocmFzZXNEaXYuZmlyc3RDaGlsZCk7XG5cdH1cblxuXHRsZXQgcCA9IHBocmFzZXMucGhyYXNlcztcblx0aWYoQXJyYXkuaXNBcnJheShwKSAmJiBwLmxlbmd0aCA+IDApIHtcblx0XHQvL2NvbnNvbGUubG9nKHApO1xuXHRcdGNvbnNvbGUubG9nKHBocmFzZXMubWVzc2FnZSk7XG5cdFx0Y29uc29sZS5sb2cocFtwLmxlbmd0aCAtIDFdKTtcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLmxvZyhwaHJhc2VzLm1lc3NhZ2UpO1xuXHR9XG5cblx0Zm9yKGxldCBpPTA7IGk8cC5sZW5ndGg7IGkrKykge1xuXG5cdFx0Y29uc3QgY2QxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0Y2QxLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY2xlYXItZGl2Jyk7XG5cdFx0Y29uc3QgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRcdGMuc2V0QXR0cmlidXRlKCdpZCcsICdwaHJhc2UtJyArIGkpO1xuXHRcdGNkMS5hcHBlbmRDaGlsZChjKTtcblx0XHRwaHJhc2VzRGl2LmFwcGVuZENoaWxkKGNkMSk7XG5cblx0XHRjb25zdCBjZDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRjZDIuc2V0QXR0cmlidXRlKCdjbGFzcycsICdjYW52YXMtbGVnZW5kJyk7XG5cdFx0Y2QyLmlubmVySFRNTCA9IHBbaV0ubGFiZWwgKyAnPGJyIC8+JyArIHBbaV0uZGF0ZSArICc8YnIgLz4nO1xuXHRcdHBocmFzZXNEaXYuYXBwZW5kQ2hpbGQoY2QyKTtcblx0XHRwaHJhc2VzRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xuXG5cdFx0bGV0IGV2aW4gPSBuZXcgbGZvLnNvdXJjZXMuRXZlbnRJbih7XG5cdFx0XHRmcmFtZVNpemU6IDEsXG5cdFx0XHRmcmFtZVJhdGU6IDEsXG5cdFx0XHRjdHg6IGNvbnRleHRcblx0XHR9KTtcblxuXHRcdGxldCBmcmFtZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5GcmFtZXIoe1xuXHRcdFx0ZnJhbWVTaXplOiBwW2ldLmRpbWVuc2lvbixcblx0XHRcdGhvcFNpemU6IHBbaV0uZGltZW5zaW9uXG5cdFx0fSk7XG5cblx0XHRjb25zdCBicGYgPSBuZXcgbGZvLnNpbmtzLkJwZih7XG5cdFx0XHR0cmlnZ2VyOiB0cnVlLFxuXHRcdFx0cmFkaXVzOiA1LFxuXHRcdFx0ZnJhbWVTaXplOiBwW2ldLmRpbWVuc2lvbixcblx0XHRcdG1pbjogMCxcblx0XHRcdG1heDogMSxcblx0XHRcdGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BocmFzZS0nICsgaSksXG5cdFx0XHRkdXJhdGlvbjogMTAwMCAqIChwW2ldLmRhdGEubGVuZ3RoIC0gcFtpXS5kaW1lbnNpb24pLFxuXHRcdFx0Y29sb3JzOiBbJyNmMDAnLCAnIzBjMCcsICcjMzNmJ10gLy8gbWFnbml0dWRlIDogUiwgZnJlcXVlbmN5IDogRywgcGVyaW9kaWNpdHkgOiBCXG5cdFx0fSlcblxuXHRcdGV2aW4uY29ubmVjdChmcmFtZXIpO1xuXHRcdGZyYW1lci5jb25uZWN0KGJwZik7XG5cblx0XHQvL2V2aW4uaW5pdGlhbGl6ZSh7IGZyYW1lU2l6ZTogMSwgZnJhbWVSYXRlOiAxMDAwIH0pO1xuXHRcdC8vZnJhbWVyLmluaXRpYWxpemUoeyBmcmFtZVNpemU6IHBbaV0uZGltZW5zaW9uIH0pO1xuXHRcdGV2aW4uc3RhcnQoKTtcblxuXHRcdGxldCBkYXRlID0gRGF0ZS5ub3coKTtcblx0XHRsZXQgYXJyYXlpbiA9IG5ldyBGbG9hdDMyQXJyYXkoMSk7XG5cblx0XHRmb3IobGV0IGo9MDsgajxwW2ldLmRhdGEubGVuZ3RoOyBqKyspIHtcblx0XHRcdGFycmF5aW5bMF0gPSBwW2ldLmRhdGFbal07XG5cdFx0XHRldmluLnByb2Nlc3MoaiAqIDEwMDAsIGFycmF5aW4pO1xuXHRcdH1cblxuXG5cdFx0bGZvUGhyYXNlcy5wdXNoKGJwZik7XG5cblx0XHRmcmFtZXIuZGlzY29ubmVjdChicGYpO1xuXHRcdGV2aW4uc3RvcCgpO1xuXHR9XG59KTsiXX0=