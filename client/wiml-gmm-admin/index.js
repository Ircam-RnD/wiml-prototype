'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

//window.location.href = window.location.pathname + window.location.search;

//===================== CooooooKies ! ===================//

var setCookie = function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
	var expires = "expires=" + d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
};

var getCookie = function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') c = c.substring(1);
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
};

var checkCookie = function checkCookie() {
	var user = getCookie("username");
	if (user != "") {
		alert("Welcome again " + user);
	} else {
		user = prompt("Please enter your name:", "");
		if (user != "" && user != null) {
			setCookie("username", user, 30);
		}
	}
};

//checkCookie();

// let clearmodelsbut = document.querySelector('#clearmodels-but');
// let clearphrasesbut = document.querySelector('#clearphrases-but');
var clearallbut = document.querySelector('#clearall-but');

var socket = _socketIoClient2['default'].connect(location.host + '/wiml-gmm-admin');

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

		var evin = new lfo.sources.EventIn({
			frameSize: 1,
			frameRate: 1,
			ctx: context
		});

		var framer = new lfo.operators.Framer({
			frameSize: p[i].dimension,
			hopSize: p[i].dimension
		});

		var bpf = new lfo.sinks.Bpf({
			trigger: true,
			radius: 1,
			frameSize: p[i].dimension,
			min: 0,
			max: 1,
			canvas: document.querySelector('#phrase-' + i),
			duration: 1000 * (p[i].data.length - p[i].dimension),
			colors: ['#f00', '#0c0', '#33f'] // magnitude : R, frequency : G, periodicity : B
		});

		evin.connect(framer);
		framer.connect(bpf);

		evin.initialize({ frameSize: 1, frameRate: 1 });
		//framer.initialize({ frameSize: p[i].dimension });
		evin.start();

		var date = Date.now();
		var arrayin = [0]; //new Float32Array(1);

		for (var j = 0; j < p[i].data.length; j++) {
			arrayin[0] = p[i].data[j];
			evin.process(j * 1000, arrayin);
		}

		lfoPhrases.push(bpf);

		framer.disconnect(bpf);
		evin.stop();
	}
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvd2ltbC1nbW0tYWRtaW4vaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OzhCQUFlLGtCQUFrQjs7Ozt3QkFDWixXQUFXOztJQUFwQixHQUFHOzs7Ozs7QUFNZixJQUFNLFNBQVMsR0FBRyxTQUFaLFNBQVMsQ0FBSSxLQUFLLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBSztBQUN2QyxLQUFJLENBQUMsR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ25CLEVBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxHQUFJLE1BQU0sR0FBQyxFQUFFLEdBQUMsRUFBRSxHQUFDLEVBQUUsR0FBQyxJQUFJLEFBQUMsQ0FBQyxDQUFDO0FBQ2hELEtBQUksT0FBTyxHQUFHLFVBQVUsR0FBRyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0MsU0FBUSxDQUFDLE1BQU0sR0FBRyxLQUFLLEdBQUMsR0FBRyxHQUFDLE1BQU0sR0FBQyxJQUFJLEdBQUMsT0FBTyxHQUFDLFVBQVUsQ0FBQztDQUM5RCxDQUFBOztBQUVELElBQU0sU0FBUyxHQUFHLFNBQVosU0FBUyxDQUFJLEtBQUssRUFBSztBQUN6QixLQUFJLElBQUksR0FBRyxLQUFLLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLEtBQUksRUFBRSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BDLE1BQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzNCLE1BQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNkLFNBQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUMsTUFBSSxDQUFD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OztBQUVyQixRQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3ZCLE1BQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztFQUNaO0NBQ0QsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9jbGllbnQvd2ltbC1nbW0tYWRtaW4vaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgaW8gZnJvbSAnc29ja2V0LmlvLWNsaWVudCc7XG5pbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuLy93aW5kb3cubG9jYXRpb24uaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2g7XG5cbi8vPT09PT09PT09PT09PT09PT09PT09IENvb29vb29LaWVzICEgPT09PT09PT09PT09PT09PT09PS8vXG5cbmNvbnN0IHNldENvb2tpZSA9IChjbmFtZSxjdmFsdWUsZXhkYXlzKSA9PiB7XG4gICAgbGV0IGQgPSBuZXcgRGF0ZSgpO1xuICAgIGQuc2V0VGltZShkLmdldFRpbWUoKSArIChleGRheXMqMjQqNjAqNjAqMTAwMCkpO1xuICAgIGxldCBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b0dNVFN0cmluZygpO1xuICAgIGRvY3VtZW50LmNvb2tpZSA9IGNuYW1lK1wiPVwiK2N2YWx1ZStcIjsgXCIrZXhwaXJlcytcIjsgcGF0aD0vXCI7XG59XG5cbmNvbnN0IGdldENvb2tpZSA9IChjbmFtZSkgPT4ge1xuICAgIGxldCBuYW1lID0gY25hbWUgKyBcIj1cIjtcbiAgICBsZXQgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcbiAgICBmb3IobGV0IGk9MDsgaTxjYS5sZW5ndGg7IGkrKykge1xuICAgICAgICBsZXQgYyA9IGNhW2ldO1xuICAgICAgICB3aGlsZSAoYy5jaGFyQXQoMCk9PScgJykgYyA9IGMuc3Vic3RyaW5nKDEpO1xuICAgICAgICBpZiAoYy5pbmRleE9mKG5hbWUpID09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBjLnN1YnN0cmluZyhuYW1lLmxlbmd0aCwgYy5sZW5ndGgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBcIlwiO1xufVxuXG5jb25zdCBjaGVja0Nvb2tpZSA9ICgpID0+IHtcbiAgICBsZXQgdXNlcj1nZXRDb29raWUoXCJ1c2VybmFtZVwiKTtcbiAgICBpZiAodXNlciAhPSBcIlwiKSB7XG4gICAgICAgIGFsZXJ0KFwiV2VsY29tZSBhZ2FpbiBcIiArIHVzZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgdXNlciA9IHByb21wdChcIlBsZWFzZSBlbnRlciB5b3VyIG5hbWU6XCIsXCJcIik7XG4gICAgICAgaWYgKHVzZXIgIT0gXCJcIiAmJiB1c2VyICE9IG51bGwpIHtcbiAgICAgICAgICAgc2V0Q29va2llKFwidXNlcm5hbWVcIiwgdXNlciwgMzApO1xuICAgICAgIH1cbiAgICB9XG59XG5cbi8vY2hlY2tDb29raWUoKTsgXG5cbi8vIGxldCBjbGVhcm1vZGVsc2J1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbGVhcm1vZGVscy1idXQnKTtcbi8vIGxldCBjbGVhcnBocmFzZXNidXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2xlYXJwaHJhc2VzLWJ1dCcpO1xubGV0IGNsZWFyYWxsYnV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NsZWFyYWxsLWJ1dCcpO1xuXG5sZXQgc29ja2V0ID0gaW8uY29ubmVjdChsb2NhdGlvbi5ob3N0ICsgJy93aW1sLWdtbS1hZG1pbicpO1xuXG4vLyBjbGVhcm1vZGVsc2J1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbi8vIFx0c29ja2V0LmVtaXQoJ2NsZWFyTW9kZWxzJyk7XG4vLyB9KTtcblxuLy8gY2xlYXJwaHJhc2VzYnV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuLy8gXHRzb2NrZXQuZW1pdCgnY2xlYXJQaHJhc2VzJyk7XG4vLyB9KTtcblxuY2xlYXJhbGxidXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdHNvY2tldC5lbWl0KCdjbGVhckFsbCcpO1xufSk7XG5cbi8vIHJlc3BvbnNlcyA6XG5zb2NrZXQub24oJ2NsZWFyJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coZGF0YS5tZXNzYWdlKTtcblx0c29ja2V0LmVtaXQoJ3JlZnJlc2hQaHJhc2VzJyk7XG59KTtcblxubGV0IGxmb1BocmFzZXMgPSBbXTtcbmxldCBwaHJhc2VzRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBocmFzZXMtZGl2Jyk7XG5sZXQgQXVkaW9Db250ZXh0ID0gd2luZG93LkF1ZGlvQ29udGV4dCB8fCB3aW5kb3cud2Via2l0QXVkaW9Db250ZXh0IHx8IGZ1bmN0aW9uKCl7fTtcbmxldCBjb250ZXh0ID0gbmV3IEF1ZGlvQ29udGV4dCgpO1xuXG5cbnNvY2tldC5vbigncGhyYXNlcycsIChwaHJhc2VzKSA9PiB7XG5cblx0bGZvUGhyYXNlcyA9IFtdO1xuXHR3aGlsZShwaHJhc2VzRGl2LmZpcnN0Q2hpbGQpIHtcblx0XHRwaHJhc2VzRGl2LnJlbW92ZUNoaWxkKHBocmFzZXNEaXYuZmlyc3RDaGlsZCk7XG5cdH1cblxuXHRsZXQgcCA9IHBocmFzZXMucGhyYXNlcztcblx0aWYoQXJyYXkuaXNBcnJheShwKSAmJiBwLmxlbmd0aCA+IDApIHtcblx0XHQvL2NvbnNvbGUubG9nKHApO1xuXHRcdGNvbnNvbGUubG9nKHBocmFzZXMubWVzc2FnZSk7XG5cdFx0Y29uc29sZS5sb2cocFtwLmxlbmd0aCAtIDFdKTtcblx0fSBlbHNlIHtcblx0XHRjb25zb2xlLmxvZyhwaHJhc2VzLm1lc3NhZ2UpO1xuXHR9XG5cblx0Zm9yKGxldCBpPTA7IGk8cC5sZW5ndGg7IGkrKykge1xuXG5cdFx0Y29uc3QgY2QxID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0Y2QxLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnY2xlYXItZGl2Jyk7XG5cdFx0Y29uc3QgYyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuXHRcdGMuc2V0QXR0cmlidXRlKCdpZCcsICdwaHJhc2UtJyArIGkpO1xuXHRcdGNkMS5hcHBlbmRDaGlsZChjKTtcblx0XHRwaHJhc2VzRGl2LmFwcGVuZENoaWxkKGNkMSk7XG5cblx0XHRjb25zdCBjZDIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblx0XHRjZDIuc2V0QXR0cmlidXRlKCdjbGFzcycsICdjYW52YXMtbGVnZW5kJyk7XG5cdFx0Y2QyLmlubmVySFRNTCA9IHBbaV0ubGFiZWwgKyAnPGJyIC8+JyArIHBbaV0uZGF0ZSArICc8YnIgLz4nO1xuXHRcdHBocmFzZXNEaXYuYXBwZW5kQ2hpbGQoY2QyKTtcblx0XHRwaHJhc2VzRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2JyJykpO1xuXG5cdFx0bGV0IGV2aW4gPSBuZXcgbGZvLnNvdXJjZXMuRXZlbnRJbih7XG5cdFx0XHRmcmFtZVNpemU6IDEsXG5cdFx0XHRmcmFtZVJhdGU6IDEsXG5cdFx0XHRjdHg6IGNvbnRleHRcblx0XHR9KTtcblxuXHRcdGxldCBmcmFtZXIgPSBuZXcgbGZvLm9wZXJhdG9ycy5GcmFtZXIoe1xuXHRcdFx0ZnJhbWVTaXplOiBwW2ldLmRpbWVuc2lvbixcblx0XHRcdGhvcFNpemU6IHBbaV0uZGltZW5zaW9uXG5cdFx0fSk7XG5cblx0XHRjb25zdCBicGYgPSBuZXcgbGZvLnNpbmtzLkJwZih7XG5cdFx0XHR0cmlnZ2VyOiB0cnVlLFxuXHRcdFx0cmFkaXVzOiAxLFxuXHRcdFx0ZnJhbWVTaXplOiBwW2ldLmRpbWVuc2lvbixcblx0XHRcdG1pbjogMCxcblx0XHRcdG1heDogMSxcblx0XHRcdGNhbnZhczogZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3BocmFzZS0nICsgaSksXG5cdFx0XHRkdXJhdGlvbjogMTAwMCAqIChwW2ldLmRhdGEubGVuZ3RoIC0gcFtpXS5kaW1lbnNpb24pLFxuXHRcdFx0Y29sb3JzOiBbJyNmMDAnLCAnIzBjMCcsICcjMzNmJ10gLy8gbWFnbml0dWRlIDogUiwgZnJlcXVlbmN5IDogRywgcGVyaW9kaWNpdHkgOiBCXG5cdFx0fSlcblxuXHRcdGV2aW4uY29ubmVjdChmcmFtZXIpO1xuXHRcdGZyYW1lci5jb25uZWN0KGJwZik7XG5cblx0XHRldmluLmluaXRpYWxpemUoeyBmcmFtZVNpemU6IDEsIGZyYW1lUmF0ZTogMSB9KTtcblx0XHQvL2ZyYW1lci5pbml0aWFsaXplKHsgZnJhbWVTaXplOiBwW2ldLmRpbWVuc2lvbiB9KTtcblx0XHRldmluLnN0YXJ0KCk7XG5cblx0XHRsZXQgZGF0ZSA9IERhdGUubm93KCk7XG5cdFx0bGV0IGFycmF5aW4gPSBbMF07Ly9uZXcgRmxvYXQzMkFycmF5KDEpO1xuXG5cdFx0Zm9yKGxldCBqPTA7IGo8cFtpXS5kYXRhLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRhcnJheWluWzBdID0gcFtpXS5kYXRhW2pdO1xuXHRcdFx0ZXZpbi5wcm9jZXNzKGogKiAxMDAwLCBhcnJheWluKTtcblx0XHR9XG5cblxuXHRcdGxmb1BocmFzZXMucHVzaChicGYpO1xuXG5cdFx0ZnJhbWVyLmRpc2Nvbm5lY3QoYnBmKTtcblx0XHRldmluLnN0b3AoKTtcblx0fVxufSk7Il19