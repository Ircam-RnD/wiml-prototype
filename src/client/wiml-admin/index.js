import io from 'socket.io-client';

let clearmodelsbut = document.querySelector('#clearmodels-but');
let clearphrasesbut = document.querySelector('#clearphrases-but');
let clearallbut = document.querySelector('#clearall-but');

let socket = io.connect(location.host + '/wiml-admin');

clearmodelsbut.addEventListener('click', () => {
	socket.emit('clearModels');
});

clearphrasesbut.addEventListener('click', () => {
	socket.emit('clearPhrases');
});

clearallbut.addEventListener('click', () => {
	socket.emit('clearAll');
});

// responses :
socket.on('clear', (data) => {
	console.log(data.message);
})