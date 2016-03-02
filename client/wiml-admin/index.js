'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _socketIoClient = require('socket.io-client');

var _socketIoClient2 = _interopRequireDefault(_socketIoClient);

var clearmodelsbut = document.querySelector('#clearmodels-but');
var clearphrasesbut = document.querySelector('#clearphrases-but');
var clearallbut = document.querySelector('#clearall-but');

var socket = _socketIoClient2['default'].connect(location.host + '/wiml-admin');

clearmodelsbut.addEventListener('click', function () {
	socket.emit('clearModels');
});

clearphrasesbut.addEventListener('click', function () {
	socket.emit('clearPhrases');
});

clearallbut.addEventListener('click', function () {
	socket.emit('clearAll');
});

// responses :
socket.on('clear', function (data) {
	console.log(data.message);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvd2ltbC1hZG1pbi9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OzhCQUFlLGtCQUFrQjs7OztBQUVqQyxJQUFJLGNBQWMsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDaEUsSUFBSSxlQUFlLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ2xFLElBQUksV0FBVyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRTFELElBQUksTUFBTSxHQUFHLDRCQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxDQUFDOztBQUV2RCxjQUFjLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFlBQU07QUFDOUMsT0FBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztDQUMzQixDQUFDLENBQUM7O0FBRUgsZUFBZSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxZQUFNO0FBQy9DLE9BQU0sQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7Q0FDNUIsQ0FBQyxDQUFDOztBQUVILFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsWUFBTTtBQUMzQyxPQUFNLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0NBQ3hCLENBQUMsQ0FBQzs7O0FBR0gsTUFBTSxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDNUIsUUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Q0FDMUIsQ0FBQyxDQUFBIiwiZmlsZSI6InNyYy9jbGllbnQvd2ltbC1hZG1pbi9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBpbyBmcm9tICdzb2NrZXQuaW8tY2xpZW50JztcblxubGV0IGNsZWFybW9kZWxzYnV0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NsZWFybW9kZWxzLWJ1dCcpO1xubGV0IGNsZWFycGhyYXNlc2J1dCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjbGVhcnBocmFzZXMtYnV0Jyk7XG5sZXQgY2xlYXJhbGxidXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2xlYXJhbGwtYnV0Jyk7XG5cbmxldCBzb2NrZXQgPSBpby5jb25uZWN0KGxvY2F0aW9uLmhvc3QgKyAnL3dpbWwtYWRtaW4nKTtcblxuY2xlYXJtb2RlbHNidXQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cdHNvY2tldC5lbWl0KCdjbGVhck1vZGVscycpO1xufSk7XG5cbmNsZWFycGhyYXNlc2J1dC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcblx0c29ja2V0LmVtaXQoJ2NsZWFyUGhyYXNlcycpO1xufSk7XG5cbmNsZWFyYWxsYnV0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXHRzb2NrZXQuZW1pdCgnY2xlYXJBbGwnKTtcbn0pO1xuXG4vLyByZXNwb25zZXMgOlxuc29ja2V0Lm9uKCdjbGVhcicsIChkYXRhKSA9PiB7XG5cdGNvbnNvbGUubG9nKGRhdGEubWVzc2FnZSk7XG59KSJdfQ==