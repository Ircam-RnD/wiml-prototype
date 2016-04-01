// ----------------------------- regular http server :
'use strict';

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

//import request from 'request';
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

// default route : leave it after any other route declarations
app.use(function (req, res) {
	res.render('index.html', { appName: 'index', clientType: 'index' });
});

var server = _http2['default'].createServer(app);
var io = (0, _socketIo2['default'])(server);

//================================= SOCKETS =================================//

var clientSockets = [];
var nsp_client = io.of('/wiml-client');
var trainingConfig = {
	labels: ['Still', 'Shuffle', 'Walk', 'Run', 'Hop', 'Stagger', 'Ninja'],
	column_names: ['magnitude', 'frequency', 'periodicity'],
	gaussians: 1
};

// instead of io.on('connection', function(client) { .. });
nsp_client.on('connection', function (socket) {

	socket.mongo = new _mongodbController2['default']({ parentid: socket.id });

	clientSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', function () {
		console.log('client ' + socket.id + ' disconnected');
		clientSockets.splice(clientSockets.indexOf(socket), 1);
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
		for (var i = 0; i < adminSockets.length; i++) {
			adminSockets[i].refresh();
		}
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

var adminSockets = [];
var nsp_admin = io.of('/wiml-admin');

nsp_admin.on('connection', function (socket) {

	socket.refresh = function () {
		mongodbController.getModels('wimldb', 'phrases').then(function (data) {
			socket.emit('phrases', { phrases: data, message: 'here are your phrases' });
		})['catch'](function (err) {
			return console.error(err);
		});
	};

	adminSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', function () {
		console.log('client ' + socket.id + ' disconnected');
		adminSockets.splice(adminSockets.indexOf(socket), 1);
	});

	// send phrases to build UI :
	// mongodbController.getModels('wimldb', 'phrases')
	// .then((data) => {
	// 	socket.emit('phrases', { phrases: data, message: 'here are your phrases' });
	// })
	// .catch((err) => console.error(err));

	socket.refresh();

	socket.on('refreshPhrases', function (data) {
		socket.refresh();
		// mongodbController.getModels('wimldb', 'phrases')
		// .then((p) => {
		// 	socket.emit('phrases', { phrases: p, message: 'here are your phrases' });
		// })
		// .catch((err) => console.error(err));
	});

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
		//socket.emit('clear', { message: 'clear all done' });
		for (var i = 0; i < adminSockets.length; i++) {
			adminSockets[i].emit('clear', { message: 'clear all done' });
		}
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxDQUFDO0VBQ3hELENBQUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFDLElBQUksRUFBSztBQUMvQixtQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdkQsbUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFNBQVMsQ0FBQyxDQUFDOztBQUV4RCxPQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxlQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7R0FDN0Q7RUFDRCxDQUFDLENBQUM7Q0FDSCxDQUFDLENBQUM7Ozs7Ozs7Ozs7QUFXSCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBVztBQUM5QixRQUFPLENBQUMsR0FBRyx3Q0FBc0MsSUFBSSxDQUFHLENBQUM7Q0FDekQsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSByZWd1bGFyIGh0dHAgc2VydmVyIDpcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuLy9pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0Jztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGNvbm5lY3Qgc3R1ZmYgOlxuaW1wb3J0IGNvbm5lY3QgZnJvbSAnY29ubmVjdCc7XG5pbXBvcnQgcmVuZGVyIGZyb20gJ2Nvbm5lY3QtcmVuZGVyJztcbmltcG9ydCBzZXJ2ZVN0YXRpYyBmcm9tICdzZXJ2ZS1zdGF0aWMnO1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc29ja2V0LmlvIDpcbmltcG9ydCBpb21vZHVsZSBmcm9tICdzb2NrZXQuaW8nO1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbW9uZ29kYiBkcml2ZXIgOlxuaW1wb3J0IG1vbmdvZGIgZnJvbSAnbW9uZ29kYic7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG5pbXBvcnQgTW9uZ29EQkNvbnRyb2xsZXIgZnJvbSAnLi9tb25nb2RiLWNvbnRyb2xsZXInO1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbGF1bmNoIGJpbmFyaWVzIDpcbmltcG9ydCBjaGlsZF9wcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZm9yIHN0YXRpYyBodG1sIGZpbGVzIDpcbi8vaW1wb3J0IGZzIGZyb20gJ2ZzJztcblxuY29uc3QgYXBwID0gY29ubmVjdCgpO1xuY29uc3QgbW9uZ29kYkNvbnRyb2xsZXIgPSBuZXcgTW9uZ29EQkNvbnRyb2xsZXIoKTtcblxuLy8gaW4gY2FzZSB3ZSB3YW50IHRvIHNlcnZlIHN0YXRpYyBmaWxlc1xuYXBwLnVzZShzZXJ2ZVN0YXRpYygncHVibGljJykpO1xuXG5hcHAudXNlKHJlbmRlcih7XG5cdHJvb3Q6IF9fZGlybmFtZSArICcvLi4vdmlld3MnLFxuXHRsYXlvdXQ6ICdsYXlvdXQuaHRtbCcsXG5cdGNhY2hlOiBmYWxzZSxcblx0aGVscGVyczoge1xuXHRcdC8vZGVmYXVsdFR5cGU6ICdpbmRleCcsXG5cdFx0Ly9hc3NldHNEb21haW46ICdwdWJsaWMnLFxuXHRcdC8qXG5cdFx0c3RhcnR0aW1lOiBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcblx0XHRub3c6IGZ1bmN0aW9uKHJlcSwgcmVzKSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGUoKTtcblx0XHR9XG5cdFx0Ly8qL1xuXHR9XG59KSk7XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFJPVVRFUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuYXBwLnVzZSgnL3dpbWwtYWRtaW4nLCAocmVxLCByZXMpID0+IHtcblx0cmVzLnJlbmRlcignd2ltbC1hZG1pbi5odG1sJywgeyBhcHBOYW1lOiAnd2ltbC1hZG1pbicsIGNsaWVudFR5cGU6ICd3aW1sLWFkbWluJ30pO1xufSk7XG5cbmFwcC51c2UoJy93aW1sLWNsaWVudCcsIChyZXEsIHJlcykgPT4ge1xuXHRyZXMucmVuZGVyKCd3aW1sLWNsaWVudC5odG1sJywgeyBhcHBOYW1lOiAnd2ltbC1jbGllbnQnLCBjbGllbnRUeXBlOiAnd2ltbC1jbGllbnQnfSk7XG59KTtcblxuLy8gZGVmYXVsdCByb3V0ZSA6IGxlYXZlIGl0IGFmdGVyIGFueSBvdGhlciByb3V0ZSBkZWNsYXJhdGlvbnNcbmFwcC51c2UoKHJlcSwgcmVzKSA9PiB7XG5cdHJlcy5yZW5kZXIoJ2luZGV4Lmh0bWwnLCB7IGFwcE5hbWU6ICdpbmRleCcsIGNsaWVudFR5cGU6ICdpbmRleCd9KTtcbn0pO1xuXG5sZXQgc2VydmVyID0gaHR0cC5jcmVhdGVTZXJ2ZXIoYXBwKTtcbmxldCBpbyA9IGlvbW9kdWxlKHNlcnZlcik7XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFNPQ0tFVFMgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuY29uc3QgY2xpZW50U29ja2V0cyA9IFtdO1xuY29uc3QgbnNwX2NsaWVudCA9IGlvLm9mKCcvd2ltbC1jbGllbnQnKTtcbmNvbnN0IHRyYWluaW5nQ29uZmlnID0ge1xuXHRsYWJlbHM6IFsnU3RpbGwnLCAnU2h1ZmZsZScsICdXYWxrJywgJ1J1bicsICdIb3AnLCAnU3RhZ2dlcicsICdOaW5qYSddLFxuXHRjb2x1bW5fbmFtZXM6IFsnbWFnbml0dWRlJywgJ2ZyZXF1ZW5jeScsICdwZXJpb2RpY2l0eSddLFxuXHRnYXVzc2lhbnM6IDFcbn07XG5cbi8vIGluc3RlYWQgb2YgaW8ub24oJ2Nvbm5lY3Rpb24nLCBmdW5jdGlvbihjbGllbnQpIHsgLi4gfSk7XG5uc3BfY2xpZW50Lm9uKCdjb25uZWN0aW9uJywgKHNvY2tldCkgPT4ge1xuXHRcblx0c29ja2V0Lm1vbmdvID0gbmV3IE1vbmdvREJDb250cm9sbGVyKHsgcGFyZW50aWQ6IHNvY2tldC5pZCB9KTtcblxuXHRjbGllbnRTb2NrZXRzLnB1c2goc29ja2V0KTtcblx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBjb25uZWN0ZWQnKTtcblx0c29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKCkgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgZGlzY29ubmVjdGVkJyk7XG5cdFx0Y2xpZW50U29ja2V0cy5zcGxpY2UoY2xpZW50U29ja2V0cy5pbmRleE9mKHNvY2tldCksIDEpO1xuXHR9KTtcblxuXHQvLyBnZXQgbW9kZWwgb24gZmlyc3QgY29ubmVjdGlvblxuXHRzb2NrZXQubW9uZ28uZ2V0TW9kZWxzKCd3aW1sZGInLCAnbW9kZWxzJylcblx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1vZGVsczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgbW9kZWxzJyB9KTtcblx0fSlcblx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAncHJvYmxlbSByZXRyaWV2aW5nIG1vZGVscycgfSk7XG5cdH0pXG5cblxuXHRzb2NrZXQub24oJ3dyaXRlUGhyYXNlJywgKGRhdGEpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIHNhaWQgOiB3cml0ZVBocmFzZSAhJyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRzb2NrZXQubW9uZ28ud3JpdGVUb0RhdGFiYXNlKCd3aW1sZGInLCAncGhyYXNlcycsIGRhdGEpO1xuXHRcdGZvcihsZXQgaT0wOyBpPGFkbWluU29ja2V0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0YWRtaW5Tb2NrZXRzW2ldLnJlZnJlc2goKTtcblx0XHR9XG5cdH0pO1xuXG5cdHNvY2tldC5vbigndHJhaW5Nb2RlbHMnLCAoZGF0YSkgPT4ge1xuXHRcdHNvY2tldC5tb25nby50cmFpbk1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnLCAnbW9kZWxzJywgdHJhaW5pbmdDb25maWcpXG5cdFx0LnRoZW4oKGRhdGEgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRpZihkYXRhID09PSAnb2snKSB7XG5cdFx0XHRcdHNvY2tldC5tb25nby5nZXRNb2RlbHMoJ3dpbWxkYicsICdtb2RlbHMnKVxuXHRcdFx0XHQudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbW9kZWxzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBtb2RlbHMnIH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHJldHJpZXZpbmcgbW9kZWxzJyB9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB4bW0tc2VydmVyLXRvb2wgcmV0dXJuIGFuIGVycm9yIGNvZGVcblx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gdHJhaW5pbmcgbW9kZWxzJyB9KTtcblx0XHRcdH1cblx0XHR9KSlcblx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0Ly8gaWYgd2UgYXJyaXZlIGhlcmUgdGhhdCBtZWFucyB0aGF0IHhtbS1zZXJ2ZXItdG9vbCBjcmFzaGVkXG5cdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAneG1tLXNlcnZlci10b29sIHNlZW1zIHRvIGJlIGNyYXNoZWQnIH0pO1xuXHRcdH0pO1xuXHR9KTtcblxufSk7XG5cblxuXG5jb25zdCBhZG1pblNvY2tldHMgPSBbXTtcbmNvbnN0IG5zcF9hZG1pbiA9IGlvLm9mKCcvd2ltbC1hZG1pbicpO1xuXG5uc3BfYWRtaW4ub24oJ2Nvbm5lY3Rpb24nLCAoc29ja2V0KSA9PiB7XG5cblx0c29ja2V0LnJlZnJlc2ggPSAoKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZ2V0TW9kZWxzKCd3aW1sZGInLCAncGhyYXNlcycpXG5cdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdHNvY2tldC5lbWl0KCdwaHJhc2VzJywgeyBwaHJhc2VzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBwaHJhc2VzJyB9KTtcblx0XHR9KVxuXHRcdC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuXHR9XG5cblx0YWRtaW5Tb2NrZXRzLnB1c2goc29ja2V0KTtcblx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBjb25uZWN0ZWQnKTtcblx0c29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKCkgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgZGlzY29ubmVjdGVkJyk7XG5cdFx0YWRtaW5Tb2NrZXRzLnNwbGljZShhZG1pblNvY2tldHMuaW5kZXhPZihzb2NrZXQpLCAxKTtcblx0fSk7XG5cblx0Ly8gc2VuZCBwaHJhc2VzIHRvIGJ1aWxkIFVJIDpcblx0Ly8gbW9uZ29kYkNvbnRyb2xsZXIuZ2V0TW9kZWxzKCd3aW1sZGInLCAncGhyYXNlcycpXG5cdC8vIC50aGVuKChkYXRhKSA9PiB7XG5cdC8vIFx0c29ja2V0LmVtaXQoJ3BocmFzZXMnLCB7IHBocmFzZXM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIHBocmFzZXMnIH0pO1xuXHQvLyB9KVxuXHQvLyAuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcblxuXHRzb2NrZXQucmVmcmVzaCgpO1xuXG5cdHNvY2tldC5vbigncmVmcmVzaFBocmFzZXMnLCAoZGF0YSkgPT4ge1xuXHRcdHNvY2tldC5yZWZyZXNoKCk7XG5cdFx0Ly8gbW9uZ29kYkNvbnRyb2xsZXIuZ2V0TW9kZWxzKCd3aW1sZGInLCAncGhyYXNlcycpXG5cdFx0Ly8gLnRoZW4oKHApID0+IHtcblx0XHQvLyBcdHNvY2tldC5lbWl0KCdwaHJhc2VzJywgeyBwaHJhc2VzOiBwLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBwaHJhc2VzJyB9KTtcblx0XHQvLyB9KVxuXHRcdC8vIC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ2NsZWFyTW9kZWxzJywgKGRhdGEpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnbW9kZWxzJyk7XG5cdFx0c29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgbW9kZWxzIGRvbmUnIH0pO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ2NsZWFyUGhyYXNlcycsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ3BocmFzZXMnKTtcblx0XHRzb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBwaHJhc2VzIGRvbmUnIH0pO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ2NsZWFyQWxsJywgKGRhdGEpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnbW9kZWxzJyk7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ3BocmFzZXMnKTtcblx0XHQvL3NvY2tldC5lbWl0KCdjbGVhcicsIHsgbWVzc2FnZTogJ2NsZWFyIGFsbCBkb25lJyB9KTtcblx0XHRmb3IobGV0IGk9MDsgaTxhZG1pblNvY2tldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGFkbWluU29ja2V0c1tpXS5lbWl0KCdjbGVhcicsIHsgbWVzc2FnZTogJ2NsZWFyIGFsbCBkb25lJyB9KTtcblx0XHR9XG5cdH0pO1xufSk7XG5cblxuLy9tb25nb2RiQ29udHJvbGxlci50cmFpbk1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnLCAnbW9kZWxzJywgdHJhaW5pbmdDb25maWcpO1xuLy9tb25nb2RiQ29udHJvbGxlci5wcmludE1vZGVscygpO1xuLy9tb25nb2RiQ29udHJvbGxlci5wcmludFBocmFzZXMoJ1J1bicpO1xuLy9tb25nb2RiQ29udHJvbGxlci5wcmludFBocmFzZXMoKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIucmVtb3ZlUGhyYXNlKCcyMDE2LTAyLTI5VDE2OjA1OjM1LjAxN1onKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIudGVsbFhtbSgnYW55dGhpbmcnKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ21vZGVscycpO1xuXG5jb25zdCBwb3J0ID0gMzAwMDtcbnNlcnZlci5saXN0ZW4ocG9ydCwgZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKGBzZXJ2ZXIgbGlzdGVuIG9uIGh0dHA6Ly8xMjcuMC4wLjE6JHtwb3J0fWApO1xufSk7XG4vL2FwcC5saXN0ZW4ocG9ydCk7XG4iXX0=