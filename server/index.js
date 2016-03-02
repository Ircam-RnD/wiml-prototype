// ----------------------------- regular http server :
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

// ----------------------------- connect stuff :
var _connect = require('connect');

var _connect2 = _interopRequireDefault(_connect);

var _connectRender = require('connect-render');

var _connectRender2 = _interopRequireDefault(_connectRender);

var _serveStatic = require('serve-static');

var _serveStatic2 = _interopRequireDefault(_serveStatic);

// ----------------------------- socket.io :
var _socketIo = require('socket.io');

var _socketIo2 = _interopRequireDefault(_socketIo);

// ----------------------------- mongodb driver :
var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _mongodbController = require('./mongodb-controller');

var _mongodbController2 = _interopRequireDefault(_mongodbController);

// ----------------------------- launch binaries :
var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

// ----------------------------- for static html files :
//import fs from 'fs';

var app = (0, _connect2['default'])();
var mongodbController = new _mongodbController2['default']();

// in case we want to serve static files
app.use((0, _serveStatic2['default'])('public'));

app.use((0, _connectRender2['default'])({
	root: __dirname + '/../views',
	layout: 'layout.html',
	cache: false,
	helpers: {
		//defaultType: 'index',
		//assetsDomain: 'public',
		/*
  starttime: new Date().getTime(),
  now: function(req, res) {
  	return new Date();
  }
  //*/
	}
}));

//================================= ROUTES ==================================//

app.use('/wiml-admin', function (req, res) {
	res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin' });
});

app.use('/wiml-client', function (req, res) {
	res.render('wiml-client.html', { appName: 'wiml-client', clientType: 'wiml-client' });
});

// default route : leave it after any other routes declarations
app.use(function (req, res) {
	res.render('index.html', { appName: 'index', clientType: 'index' });
});

var server = _http2['default'].createServer(app);
var io = (0, _socketIo2['default'])(server);

//================================= SOCKETS =================================//

var sockets = [];
var nsp_client = io.of('/wiml-client');
var trainingConfig = {
	labels: ['Still', 'Shuffle', 'Walk', 'Run', 'Hop', 'Stagger', 'Ninja'],
	column_names: ['magnitude', 'frequency', 'periodicity'],
	gaussians: 3
};

// instead of io.on('connection', function(client) { .. });
nsp_client.on('connection', function (socket) {

	socket.mongo = new _mongodbController2['default']({ parentid: socket.id });

	sockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', function () {
		console.log('client ' + socket.id + ' disconnected');
		sockets.splice(sockets.indexOf(socket), 1);
	});

	// get model on first connection
	socket.mongo.getModels('wimldb', 'models').then(function (data) {
		//console.log(data);
		socket.emit('models', { models: data, message: 'here are your models' });
	})['catch'](function (err) {
		socket.emit('models', { message: 'problem retrieving models' });
	});

	socket.on('writePhrase', function (data) {
		console.log('client ' + socket.id + ' said : writePhrase !');
		//console.log(data);
		socket.mongo.writeToDatabase('wimldb', 'phrases', data);
	});

	socket.on('trainModels', function (data) {
		socket.mongo.trainModels('wimldb', 'phrases', 'models', trainingConfig).then(function (data) {
			console.log(data);
			if (data === 'ok') {
				socket.mongo.getModels('wimldb', 'models').then(function (data) {
					//console.log(data);
					socket.emit('models', { models: data, message: 'here are your models' });
				})['catch'](function (err) {
					socket.emit('models', { message: 'problem retrieving models' });
				});
			} else {
				// xmm-server-tool return an error code
				socket.emit('models', { message: 'problem training models' });
			}
		})['catch'](function (err) {
			// if we arrive here that means that xmm-server-tool crashed
			socket.emit('models', { message: 'xmm-server-tool seems to be crashed' });
		});
	});
});

var nsp_admin = io.of('/wiml-admin');

nsp_admin.on('connection', function (socket) {

	socket.on('clearModels', function (data) {
		mongodbController.deleteCollection('wimldb', 'models');
		socket.emit('clear', { message: 'clear models done' });
	});

	socket.on('clearPhrases', function (data) {
		mongodbController.deleteCollection('wimldb', 'phrases');
		socket.emit('clear', { message: 'clear phrases done' });
	});

	socket.on('clearAll', function (data) {
		mongodbController.deleteCollection('wimldb', 'models');
		mongodbController.deleteCollection('wimldb', 'phrases');
		socket.emit('clear', { message: 'clear all done' });
	});
});

//mongodbController.trainModels('wimldb', 'phrases', 'models', trainingConfig);
//mongodbController.printModels();
//mongodbController.printPhrases('Run');
//mongodbController.printPhrases();
//mongodbController.removePhrase('2016-02-29T16:05:35.017Z');
//mongodbController.tellXmm('anything');
//mongodbController.deleteCollection('wimldb', 'models');

var port = 3000;
server.listen(port, function () {
	console.log('server listen on http://127.0.0.1:' + port);
});
//app.listen(port);
//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFDLElBQUksRUFBSztBQUMvQixtQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkQsbUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0FBQ3hELFFBQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEVBQUUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLENBQUMsQ0FBQztFQUNwRCxDQUFDLENBQUM7Q0FDSCxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUFVSCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBVztBQUM5QixRQUFPLENBQUMsR0FBRyx3Q0FBc0MsSUFBSSxDQUFHLENBQUM7Q0FDekQsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSByZWd1bGFyIGh0dHAgc2VydmVyIDpcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gY29ubmVjdCBzdHVmZiA6XG5pbXBvcnQgY29ubmVjdCBmcm9tICdjb25uZWN0JztcbmltcG9ydCByZW5kZXIgZnJvbSAnY29ubmVjdC1yZW5kZXInO1xuaW1wb3J0IHNlcnZlU3RhdGljIGZyb20gJ3NlcnZlLXN0YXRpYyc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzb2NrZXQuaW8gOlxuaW1wb3J0IGlvbW9kdWxlIGZyb20gJ3NvY2tldC5pbyc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtb25nb2RiIGRyaXZlciA6XG5pbXBvcnQgbW9uZ29kYiBmcm9tICdtb25nb2RiJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBNb25nb0RCQ29udHJvbGxlciBmcm9tICcuL21vbmdvZGItY29udHJvbGxlcic7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBsYXVuY2ggYmluYXJpZXMgOlxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBmb3Igc3RhdGljIGh0bWwgZmlsZXMgOlxuLy9pbXBvcnQgZnMgZnJvbSAnZnMnO1xuXG5jb25zdCBhcHAgPSBjb25uZWN0KCk7XG5jb25zdCBtb25nb2RiQ29udHJvbGxlciA9IG5ldyBNb25nb0RCQ29udHJvbGxlcigpO1xuXG4vLyBpbiBjYXNlIHdlIHdhbnQgdG8gc2VydmUgc3RhdGljIGZpbGVzXG5hcHAudXNlKHNlcnZlU3RhdGljKCdwdWJsaWMnKSk7XG5cbmFwcC51c2UocmVuZGVyKHtcblx0cm9vdDogX19kaXJuYW1lICsgJy8uLi92aWV3cycsXG5cdGxheW91dDogJ2xheW91dC5odG1sJyxcblx0Y2FjaGU6IGZhbHNlLFxuXHRoZWxwZXJzOiB7XG5cdFx0Ly9kZWZhdWx0VHlwZTogJ2luZGV4Jyxcblx0XHQvL2Fzc2V0c0RvbWFpbjogJ3B1YmxpYycsXG5cdFx0Lypcblx0XHRzdGFydHRpbWU6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuXHRcdG5vdzogZnVuY3Rpb24ocmVxLCByZXMpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpO1xuXHRcdH1cblx0XHQvLyovXG5cdH1cbn0pKTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUk9VVEVTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5hcHAudXNlKCcvd2ltbC1hZG1pbicsIChyZXEsIHJlcykgPT4ge1xuXHRyZXMucmVuZGVyKCd3aW1sLWFkbWluLmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWFkbWluJywgY2xpZW50VHlwZTogJ3dpbWwtYWRtaW4nfSk7XG59KTtcblxuYXBwLnVzZSgnL3dpbWwtY2xpZW50JywgKHJlcSwgcmVzKSA9PiB7XG5cdHJlcy5yZW5kZXIoJ3dpbWwtY2xpZW50Lmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWNsaWVudCcsIGNsaWVudFR5cGU6ICd3aW1sLWNsaWVudCd9KTtcbn0pO1xuXG4vLyBkZWZhdWx0IHJvdXRlIDogbGVhdmUgaXQgYWZ0ZXIgYW55IG90aGVyIHJvdXRlcyBkZWNsYXJhdGlvbnNcbmFwcC51c2UoKHJlcSwgcmVzKSA9PiB7XG5cdHJlcy5yZW5kZXIoJ2luZGV4Lmh0bWwnLCB7IGFwcE5hbWU6ICdpbmRleCcsIGNsaWVudFR5cGU6ICdpbmRleCd9KTtcbn0pO1xuXG5sZXQgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXBwKTtcbmxldCBpbyA9IGlvbW9kdWxlKHNlcnZlcik7XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNPQ0tFVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuY29uc3Qgc29ja2V0cyA9IFtdO1xuY29uc3QgbnNwX2NsaWVudCA9IGlvLm9mKCcvd2ltbC1jbGllbnQnKTtcbmNvbnN0IHRyYWluaW5nQ29uZmlnID0ge1xuXHRsYWJlbHM6IFsnU3RpbGwnLCAnU2h1ZmZsZScsICdXYWxrJywgJ1J1bicsICdIb3AnLCAnU3RhZ2dlcicsICdOaW5qYSddLFxuXHRjb2x1bW5fbmFtZXM6IFsnbWFnbml0dWRlJywgJ2ZyZXF1ZW5jeScsICdwZXJpb2RpY2l0eSddLFxuXHRnYXVzc2lhbnM6IDNcbn07XG5cbi8vIGluc3RlYWQgb2YgaW8ub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbihjbGllbnQpIHsgLi4gfSk7XG5uc3BfY2xpZW50Lm9uKCdjb25uZWN0aW9uJywgKHNvY2tldCkgPT4ge1xuXHRcblx0c29ja2V0Lm1vbmdvID0gbmV3IE1vbmdvREJDb250cm9sbGVyKHsgcGFyZW50aWQ6IHNvY2tldC5pZCB9KTtcblxuXHRzb2NrZXRzLnB1c2goc29ja2V0KTtcblx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBjb25uZWN0ZWQnKTtcblx0c29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKCkgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgZGlzY29ubmVjdGVkJyk7XG5cdFx0c29ja2V0cy5zcGxpY2Uoc29ja2V0cy5pbmRleE9mKHNvY2tldCksIDEpO1xuXHR9KTtcblxuXHQvLyBnZXQgbW9kZWwgb24gZmlyc3QgY29ubmVjdGlvblxuXHRzb2NrZXQubW9uZ28uZ2V0TW9kZWxzKCd3aW1sZGInLCAnbW9kZWxzJylcblx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1vZGVsczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgbW9kZWxzJyB9KTtcblx0fSlcblx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAncHJvYmxlbSByZXRyaWV2aW5nIG1vZGVscycgfSk7XG5cdH0pXG5cblxuXHRzb2NrZXQub24oJ3dyaXRlUGhyYXNlJywgKGRhdGEpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIHNhaWQgOiB3cml0ZVBocmFzZSAhJyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRzb2NrZXQubW9uZ28ud3JpdGVUb0RhdGFiYXNlKCd3aW1sZGInLCAncGhyYXNlcycsIGRhdGEpO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ3RyYWluTW9kZWxzJywgKGRhdGEpID0+IHtcblx0XHRzb2NrZXQubW9uZ28udHJhaW5Nb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJywgJ21vZGVscycsIHRyYWluaW5nQ29uZmlnKVxuXHRcdC50aGVuKChkYXRhID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0aWYoZGF0YSA9PT0gJ29rJykge1xuXHRcdFx0XHRzb2NrZXQubW9uZ28uZ2V0TW9kZWxzKCd3aW1sZGInLCAnbW9kZWxzJylcblx0XHRcdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1vZGVsczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgbW9kZWxzJyB9KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAncHJvYmxlbSByZXRyaWV2aW5nIG1vZGVscycgfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8geG1tLXNlcnZlci10b29sIHJldHVybiBhbiBlcnJvciBjb2RlXG5cdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHRyYWluaW5nIG1vZGVscycgfSk7XG5cdFx0XHR9XG5cdFx0fSkpXG5cdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdC8vIGlmIHdlIGFycml2ZSBoZXJlIHRoYXQgbWVhbnMgdGhhdCB4bW0tc2VydmVyLXRvb2wgY3Jhc2hlZFxuXHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3htbS1zZXJ2ZXItdG9vbCBzZWVtcyB0byBiZSBjcmFzaGVkJyB9KTtcblx0XHR9KTtcblx0fSk7XG5cbn0pO1xuXG5cblxuY29uc3QgbnNwX2FkbWluID0gaW8ub2YoJy93aW1sLWFkbWluJyk7XG5cbm5zcF9hZG1pbi5vbignY29ubmVjdGlvbicsIChzb2NrZXQpID0+IHtcblxuXHRzb2NrZXQub24oJ2NsZWFyTW9kZWxzJywgKGRhdGEpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnbW9kZWxzJyk7XG5cdFx0c29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgbW9kZWxzIGRvbmUnIH0pO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ2NsZWFyUGhyYXNlcycsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ3BocmFzZXMnKTtcblx0XHRzb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBwaHJhc2VzIGRvbmUnIH0pO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ2NsZWFyQWxsJywgKGRhdGEpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnbW9kZWxzJyk7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ3BocmFzZXMnKTtcblx0XHRzb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBhbGwgZG9uZScgfSk7XG5cdH0pO1xufSk7XG5cbi8vbW9uZ29kYkNvbnRyb2xsZXIudHJhaW5Nb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJywgJ21vZGVscycsIHRyYWluaW5nQ29uZmlnKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIucHJpbnRNb2RlbHMoKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIucHJpbnRQaHJhc2VzKCdSdW4nKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIucHJpbnRQaHJhc2VzKCk7XG4vL21vbmdvZGJDb250cm9sbGVyLnJlbW92ZVBocmFzZSgnMjAxNi0wMi0yOVQxNjowNTozNS4wMTdaJyk7XG4vL21vbmdvZGJDb250cm9sbGVyLnRlbGxYbW0oJ2FueXRoaW5nJyk7XG4vL21vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdtb2RlbHMnKTtcblxuY29uc3QgcG9ydCA9IDMwMDA7XG5zZXJ2ZXIubGlzdGVuKHBvcnQsIGZ1bmN0aW9uKCkge1xuXHRjb25zb2xlLmxvZyhgc2VydmVyIGxpc3RlbiBvbiBodHRwOi8vMTI3LjAuMC4xOiR7cG9ydH1gKTtcbn0pO1xuLy9hcHAubGlzdGVuKHBvcnQpO1xuIl19