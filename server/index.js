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

var _cookieSession = require('cookie-session');

var _cookieSession2 = _interopRequireDefault(_cookieSession);

var _connectBusboy = require('connect-busboy');

var _connectBusboy2 = _interopRequireDefault(_connectBusboy);

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

// ----------------------------- for static html files and file upload :
var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

//------------------------------

var _repovizzClient = require('./repovizz-client');

var _repovizzClient2 = _interopRequireDefault(_repovizzClient);

var app = (0, _connect2['default'])();
var mongodbController = new _mongodbController2['default']();
var repovizzClient = new _repovizzClient2['default']();

// in case we want to serve static files
app.use((0, _serveStatic2['default'])('public'));
//app.use(busboy({ headers: req.headers }));
app.use((0, _connectBusboy2['default'])());

app.use((0, _cookieSession2['default'])({
	name: 'session',
	keys: ['key1', 'key2']
}));

app.use((0, _connectRender2['default'])({
	root: __dirname + '/../views',
	layout: 'layout.html',
	cache: true, //set to true in prod
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

var cnt = 1;

//================================= ROUTES ==================================//

app.use('/wiml-gmm', function (req, res, next) {
	res.render('wiml-gmm.html', { appName: 'wiml-gmm', clientType: 'wiml-gmm' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

app.use('/wiml-gmm-admin', function (req, res, next) {

	//res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin', upload: uploadState});
	res.render('wiml-gmm-admin.html', { appName: 'wiml-gmm-admin', clientType: 'wiml-gmm-admin' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);

	var uploadState = 'none';

	if (req.busboy) {
		var filesNames = [];

		req.pipe(req.busboy);
		uploadState = 'failed';

		req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
			var ws = _fs2['default'].createWriteStream('./public/uploads/phrases/' + filename, { flags: "a" });
			file.pipe(ws);
			filesNames.push(filename);
			console.log(filename);
		});
		req.busboy.on('field', function (key, value, keyTruncated, valueTruncated) {
			// ...
			console.log('field event fired');
		});
		req.busboy.on('finish', function () {
			// res.writeHead(200, {'Connection': 'close'});
			// for (var i = 0; i < filesNames.length; i++)
			// {
			//    	res.write(filesNames[i] + "\n");
			// }
			// console.log("busboy done");
			// res.end("Done..");	
			uploadState = 'succeeded';
		});
	}
});

app.use('/wiml-hhmm', function (req, res, next) {
	res.render('wiml-hhmm.html', { appName: 'wiml-hhmm', clientType: 'wiml-hhmm' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

app.use('/wiml-hhmm-admin', function (req, res, next) {
	//res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin', upload: uploadState});
	res.render('wiml-hhmm-admin.html', { appName: 'wiml-hhmm-admin', clientType: 'wiml-hhmm-admin' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

app.use('/sensor-test', function (req, res, next) {
	res.render('sensor-test.html', { appName: 'sensor-test', clientType: 'sensor-test' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

// default route : leave it after any other route declarations
app.use(function (req, res, next) {
	res.render('index.html', { appName: 'index', clientType: 'index' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

var server = _http2['default'].createServer(app);
var io = (0, _socketIo2['default'])(server);

//================================= SOCKETS =================================//

var clientSockets = [];
var nsp_client = io.of('/wiml-gmm');
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
	socket.mongo.getModels('wimldb', 'gmmModels').then(function (data) {
		//console.log(data);
		socket.emit('models', { models: data, message: 'here are your models' });
	})['catch'](function (err) {
		socket.emit('models', { message: 'problem retrieving models' });
	});

	socket.on('writePhrase', function (data) {
		console.log('client ' + socket.id + ' said : writePhrase !');
		//console.log(data);
		socket.mongo.writeToDatabase('wimldb', 'gmmPhrases', data);
		for (var i = 0; i < adminSockets.length; i++) {
			adminSockets[i].refresh();
		}
	});

	socket.on('trainModels', function (data) {
		socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', trainingConfig).then(function (data) {
			console.log(data);
			if (data === 'ok') {
				socket.mongo.getModels('wimldb', 'gmmModels').then(function (data) {
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
			socket.emit('models', { message: 'xmm-server-tool seems to be down' });
		});
	});
});

//==================================================================================//

var hhmmSockets = [];
var nsp_hhmm = io.of('/wiml-hhmm');
var hhmmTrainingConfig = {
	labels: ['Half-turn', 'Go-low', 'Jump', 'Kata1', 'Kata2', 'Kata3', 'Kata4'],
	column_names: ['accelX', 'accelY', 'accelZ', 'rotX', 'rotY', 'rotZ'],
	gaussians: 1
};

// instead of io.on('connection', function(client) { .. });
nsp_hhmm.on('connection', function (socket) {

	socket.mongo = new _mongodbController2['default']({ parentid: socket.id });

	hhmmSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', function () {
		console.log('client ' + socket.id + ' disconnected');
		hhmmSockets.splice(hhmmSockets.indexOf(socket), 1);
	});

	// get model on first connection
	socket.mongo.getModels('wimldb', 'hhmmModels').then(function (data) {
		//console.log(data);
		socket.emit('models', { models: data, message: 'here are your models' });
	})['catch'](function (err) {
		socket.emit('models', { message: 'problem retrieving models' });
	});

	socket.on('writePhrase', function (data) {
		console.log('client ' + socket.id + ' said : writePhrase !');
		//console.log(data);
		socket.mongo.writeToDatabase('wimldb', 'hhmmPhrases', data);
		for (var i = 0; i < hhmmAdminSockets.length; i++) {
			hhmmAdminSockets[i].refresh();
		}
	});

	socket.on('trainModels', function (data) {
		socket.mongo.trainModels('hhmm', 'wimldb', 'hhmmPhrases', 'hhmmModels', hhmmTrainingConfig).then(function (data) {
			console.log(data);
			if (data === 'ok') {
				socket.mongo.getModels('wimldb', 'hhmmModels').then(function (data) {
					//console.log(data);
					socket.emit('models', { models: data, message: 'here are your models' });
				})['catch'](function (err) {
					socket.emit('models', { message: 'problem retrieving models' });
				});
			} else {
				// xmm-server-tool return an error code
				console.log(data);
				socket.emit('models', { message: 'problem training models' });
			}
		})['catch'](function (err) {
			// if we arrive here that means that xmm-server-tool crashed
			socket.emit('models', { message: 'xmm-server-tool seems to be down' });
		});
	});
});

//=======================================================================//

var adminSockets = [];
var nsp_admin = io.of('/wiml-gmm-admin');

nsp_admin.on('connection', function (socket) {

	socket.refresh = function () {
		mongodbController.getModels('wimldb', 'gmmPhrases').then(function (data) {
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
		mongodbController.deleteCollection('wimldb', 'gmmModels');
		socket.emit('clear', { message: 'clear models done' });
	});

	socket.on('clearPhrases', function (data) {
		mongodbController.deleteCollection('wimldb', 'gmmPhrases');
		socket.emit('clear', { message: 'clear phrases done' });
	});

	socket.on('clearAll', function (data) {
		mongodbController.deleteCollection('wimldb', 'gmmModels');
		mongodbController.deleteCollection('wimldb', 'gmmPhrases');
		//socket.emit('clear', { message: 'clear all done' });
		for (var i = 0; i < adminSockets.length; i++) {
			adminSockets[i].emit('clear', { message: 'clear all done' });
		}
	});
});

//=======================================================================//

var hhmmAdminSockets = [];
var nsp_hhmmadmin = io.of('/wiml-hhmm-admin');

nsp_hhmmadmin.on('connection', function (socket) {

	socket.refresh = function () {
		mongodbController.getModels('wimldb', 'hhmmPhrases').then(function (data) {
			socket.emit('phrases', { phrases: data, message: 'here are your phrases' });
		})['catch'](function (err) {
			return console.error(err);
		});
	};

	hhmmAdminSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', function () {
		console.log('client ' + socket.id + ' disconnected');
		hhmmAdminSockets.splice(hhmmAdminSockets.indexOf(socket), 1);
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
		mongodbController.deleteCollection('wimldb', 'hhmmModels');
		socket.emit('clear', { message: 'clear models done' });
	});

	socket.on('clearPhrases', function (data) {
		mongodbController.deleteCollection('wimldb', 'hhmmPhrases');
		socket.emit('clear', { message: 'clear phrases done' });
	});

	socket.on('clearAll', function (data) {
		mongodbController.deleteCollection('wimldb', 'hhmmModels');
		mongodbController.deleteCollection('wimldb', 'hhmmPhrases');
		//socket.emit('clear', { message: 'clear all done' });
		for (var i = 0; i < hhmmAdminSockets.length; i++) {
			hhmmAdminSockets[i].emit('clear', { message: 'clear all done' });
		}
	});
});

//mongodbController.trainModels('wimldb', 'phrases', 'models', trainingConfig);
//mongodbController.printModels();
//mongodbController.printPhrases('Run');
//mongodbController.printPhrases();
//mongodbController.removePhrase('2016-02-29T16:05:35.017Z');
//mongodbController.tellXmm('anything');
/*
mongodbController.deleteCollection('wimldb', 'gmmModels');
mongodbController.deleteCollection('wimldb', 'hhmmModels');
mongodbController.deleteCollection('wimldb', 'gmmPhrases');
mongodbController.deleteCollection('wimldb', 'hhmmPhrases');
//*/

/*
repovizzClient.datapacks()
	.then((data) => {
		console.log(data.length);
	})
	.catch((error) => {
		console.error(error);
	});
//*/

var port = 3000;
server.listen(port, function () {
	console.log('server listen on http://127.0.0.1:' + port);
});
//app.listen(port);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7b0JBQ2lCLE1BQU07Ozs7Ozt1QkFHSCxTQUFTOzs7OzZCQUNWLGdCQUFnQjs7OzsyQkFDWCxjQUFjOzs7OzZCQUNaLGdCQUFnQjs7Ozs2QkFDdkIsZ0JBQWdCOzs7Ozt3QkFFZCxXQUFXOzs7Ozt1QkFFWixTQUFTOzs7O3NCQUNWLFFBQVE7Ozs7aUNBQ0csc0JBQXNCOzs7Ozs2QkFFMUIsZUFBZTs7Ozs7a0JBRTFCLElBQUk7Ozs7Ozs4QkFFUSxtQkFBbUI7Ozs7QUFFOUMsSUFBTSxHQUFHLEdBQUcsMkJBQVMsQ0FBQztBQUN0QixJQUFNLGlCQUFpQixHQUFHLG9DQUF1QixDQUFDO0FBQ2xELElBQU0sY0FBYyxHQUFHLGlDQUFvQixDQUFDOzs7QUFHNUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDOztBQUUvQixHQUFHLENBQUMsR0FBRyxDQUFDLGlDQUFRLENBQUMsQ0FBQzs7QUFFbEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQ0FBYztBQUNyQixLQUFJLEVBQUUsU0FBUztBQUNmLEtBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7Q0FDdEIsQ0FBQyxDQUFDLENBQUM7O0FBRUosR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQ0FBTztBQUNkLEtBQUksRUFBRSxTQUFTLEdBQUcsV0FBVztBQUM3QixPQUFNLEVBQUUsYUFBYTtBQUNyQixNQUFLLEVBQUUsSUFBSTtBQUNYLFFBQU8sRUFBRTs7Ozs7Ozs7O0VBU1I7Q0FDRCxDQUFDLENBQUMsQ0FBQzs7QUFFSixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Ozs7QUFJWixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFLO0FBQ3hDLElBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFFLFVB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QyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDNUQsUUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsb0JBQW9CLEVBQUUsQ0FBQyxDQUFDO0VBQ3hELENBQUMsQ0FBQzs7QUFFSCxPQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFDLElBQUksRUFBSztBQUMvQixtQkFBaUIsQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDM0QsbUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGFBQWEsQ0FBQyxDQUFDOztBQUU1RCxPQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQzVDLG1CQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0dBQ2pFO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJILElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxZQUFXO0FBQzlCLFFBQU8sQ0FBQyxHQUFHLHdDQUFzQyxJQUFJLENBQUcsQ0FBQztDQUN6RCxDQUFDLENBQUMiLCJmaWxlIjoic3JjL3NlcnZlci9pbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHJlZ3VsYXIgaHR0cCBzZXJ2ZXIgOlxuaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG4vL2ltcG9ydCByZXF1ZXN0IGZyb20gJ3JlcXVlc3QnO1xuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gY29ubmVjdCBzdHVmZiA6XG5pbXBvcnQgY29ubmVjdCBmcm9tICdjb25uZWN0JztcbmltcG9ydCByZW5kZXIgZnJvbSAnY29ubmVjdC1yZW5kZXInO1xuaW1wb3J0IHNlcnZlU3RhdGljIGZyb20gJ3NlcnZlLXN0YXRpYyc7XG5pbXBvcnQgY29va2llU2Vzc2lvbiBmcm9tICdjb29raWUtc2Vzc2lvbic7XG5pbXBvcnQgYnVzYm95IGZyb20gJ2Nvbm5lY3QtYnVzYm95Jztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHNvY2tldC5pbyA6XG5pbXBvcnQgaW9tb2R1bGUgZnJvbSAnc29ja2V0LmlvJztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1vbmdvZGIgZHJpdmVyIDpcbmltcG9ydCBtb25nb2RiIGZyb20gJ21vbmdvZGInO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IE1vbmdvREJDb250cm9sbGVyIGZyb20gJy4vbW9uZ29kYi1jb250cm9sbGVyJztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGxhdW5jaCBiaW5hcmllcyA6XG5pbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGZvciBzdGF0aWMgaHRtbCBmaWxlcyBhbmQgZmlsZSB1cGxvYWQgOlxuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5pbXBvcnQgUmVwb3ZpenpDbGllbnQgZnJvbSAnLi9yZXBvdml6ei1jbGllbnQnO1xuXG5jb25zdCBhcHAgPSBjb25uZWN0KCk7XG5jb25zdCBtb25nb2RiQ29udHJvbGxlciA9IG5ldyBNb25nb0RCQ29udHJvbGxlcigpO1xuY29uc3QgcmVwb3ZpenpDbGllbnQgPSBuZXcgUmVwb3ZpenpDbGllbnQoKTtcblxuLy8gaW4gY2FzZSB3ZSB3YW50IHRvIHNlcnZlIHN0YXRpYyBmaWxlc1xuYXBwLnVzZShzZXJ2ZVN0YXRpYygncHVibGljJykpO1xuLy9hcHAudXNlKGJ1c2JveSh7IGhlYWRlcnM6IHJlcS5oZWFkZXJzIH0pKTtcbmFwcC51c2UoYnVzYm95KCkpO1xuXG5hcHAudXNlKGNvb2tpZVNlc3Npb24oe1xuXHRuYW1lOiAnc2Vzc2lvbicsXG5cdGtleXM6IFsna2V5MScsICdrZXkyJ11cbn0pKTtcblxuYXBwLnVzZShyZW5kZXIoe1xuXHRyb290OiBfX2Rpcm5hbWUgKyAnLy4uL3ZpZXdzJyxcblx0bGF5b3V0OiAnbGF5b3V0Lmh0bWwnLFxuXHRjYWNoZTogdHJ1ZSwgLy9zZXQgdG8gdHJ1ZSBpbiBwcm9kXG5cdGhlbHBlcnM6IHtcblx0XHQvL2RlZmF1bHRUeXBlOiAnaW5kZXgnLFxuXHRcdC8vYXNzZXRzRG9tYWluOiAncHVibGljJyxcblx0XHQvKlxuXHRcdHN0YXJ0dGltZTogbmV3IERhdGUoKS5nZXRUaW1lKCksXG5cdFx0bm93OiBmdW5jdGlvbihyZXEsIHJlcykge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XG5cdFx0fVxuXHRcdC8vKi9cblx0fVxufSkpO1xuXG5sZXQgY250ID0gMTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gUk9VVEVTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5hcHAudXNlKCcvd2ltbC1nbW0nLCAocmVxLCByZXMsIG5leHQpID0+IHtcblx0cmVzLnJlbmRlcignd2ltbC1nbW0uaHRtbCcsIHsgYXBwTmFtZTogJ3dpbWwtZ21tJywgY2xpZW50VHlwZTogJ3dpbWwtZ21tJ30pO1xuXHRyZXEuc2Vzc2lvbi5pZCA9IHJlcS5zZXNzaW9uLmlkIHx8ICsrY250O1xuXHRjb25zb2xlLmxvZyhyZXEuc2Vzc2lvbi5pZCk7XG59KTtcblxuYXBwLnVzZSgnL3dpbWwtZ21tLWFkbWluJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG5cblx0Ly9yZXMucmVuZGVyKCd3aW1sLWFkbWluLmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWFkbWluJywgY2xpZW50VHlwZTogJ3dpbWwtYWRtaW4nLCB1cGxvYWQ6IHVwbG9hZFN0YXRlfSk7XG5cdHJlcy5yZW5kZXIoJ3dpbWwtZ21tLWFkbWluLmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWdtbS1hZG1pbicsIGNsaWVudFR5cGU6ICd3aW1sLWdtbS1hZG1pbicgfSk7XG5cdHJlcS5zZXNzaW9uLmlkID0gcmVxLnNlc3Npb24uaWQgfHwgKytjbnQ7XG5cdGNvbnNvbGUubG9nKHJlcS5zZXNzaW9uLmlkKTtcblxuXHRsZXQgdXBsb2FkU3RhdGUgPSAnbm9uZSc7XG5cblx0aWYocmVxLmJ1c2JveSkge1xuXHRcdHZhciBmaWxlc05hbWVzID0gW107XG5cblx0XHRyZXEucGlwZShyZXEuYnVzYm95KTtcblx0XHR1cGxvYWRTdGF0ZSA9ICdmYWlsZWQnO1xuXG5cdFx0cmVxLmJ1c2JveS5vbignZmlsZScsIGZ1bmN0aW9uKGZpZWxkbmFtZSwgZmlsZSwgZmlsZW5hbWUsIGVuY29kaW5nLCBtaW1ldHlwZSkge1xuXHRcdFx0dmFyIHdzID0gZnMuY3JlYXRlV3JpdGVTdHJlYW0oJy4vcHVibGljL3VwbG9hZHMvcGhyYXNlcy8nICsgZmlsZW5hbWUsIHtmbGFnczogXCJhXCJ9KTtcblx0ICAgIFx0ZmlsZS5waXBlKHdzKTtcblx0ICAgIFx0ZmlsZXNOYW1lcy5wdXNoKGZpbGVuYW1lKTtcblx0ICAgIFx0Y29uc29sZS5sb2coZmlsZW5hbWUpO1xuXHRcdH0pO1xuXHQgIFx0cmVxLmJ1c2JveS5vbignZmllbGQnLCBmdW5jdGlvbihrZXksIHZhbHVlLCBrZXlUcnVuY2F0ZWQsIHZhbHVlVHJ1bmNhdGVkKSB7XG4gICAgXHRcdC8vIC4uLiBcbiAgICBcdFx0Y29uc29sZS5sb2coJ2ZpZWxkIGV2ZW50IGZpcmVkJyk7XG4gIFx0XHR9KTtcblx0XHRyZXEuYnVzYm95Lm9uKCdmaW5pc2gnLCBmdW5jdGlvbigpIHtcblx0ICAgICAgICAvLyByZXMud3JpdGVIZWFkKDIwMCwgeydDb25uZWN0aW9uJzogJ2Nsb3NlJ30pO1xuICAgIFx0ICAgIC8vIGZvciAodmFyIGkgPSAwOyBpIDwgZmlsZXNOYW1lcy5sZW5ndGg7IGkrKylcbiAgICAgICAgXHQvLyB7XG4gICAgICAgICAvLyAgICBcdHJlcy53cml0ZShmaWxlc05hbWVzW2ldICsgXCJcXG5cIik7XG4gICAgICAgIFx0Ly8gfVxuICAgICAgICBcdC8vIGNvbnNvbGUubG9nKFwiYnVzYm95IGRvbmVcIik7XG4gICAgICAgIFx0Ly8gcmVzLmVuZChcIkRvbmUuLlwiKTtcdFxuICAgICAgICBcdHVwbG9hZFN0YXRlID0gJ3N1Y2NlZWRlZCc7XHRcblx0XHR9KTtcblx0fVxufSk7XG5cbmFwcC51c2UoJy93aW1sLWhobW0nLCAocmVxLCByZXMsIG5leHQpID0+IHtcblx0cmVzLnJlbmRlcignd2ltbC1oaG1tLmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWhobW0nLCBjbGllbnRUeXBlOiAnd2ltbC1oaG1tJ30pO1xuXHRyZXEuc2Vzc2lvbi5pZCA9IHJlcS5zZXNzaW9uLmlkIHx8ICsrY250O1xuXHRjb25zb2xlLmxvZyhyZXEuc2Vzc2lvbi5pZCk7XG59KTtcblxuYXBwLnVzZSgnL3dpbWwtaGhtbS1hZG1pbicsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuXHQvL3Jlcy5yZW5kZXIoJ3dpbWwtYWRtaW4uaHRtbCcsIHsgYXBwTmFtZTogJ3dpbWwtYWRtaW4nLCBjbGllbnRUeXBlOiAnd2ltbC1hZG1pbicsIHVwbG9hZDogdXBsb2FkU3RhdGV9KTtcblx0cmVzLnJlbmRlcignd2ltbC1oaG1tLWFkbWluLmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWhobW0tYWRtaW4nLCBjbGllbnRUeXBlOiAnd2ltbC1oaG1tLWFkbWluJyB9KTtcblx0cmVxLnNlc3Npb24uaWQgPSByZXEuc2Vzc2lvbi5pZCB8fCArK2NudDtcblx0Y29uc29sZS5sb2cocmVxLnNlc3Npb24uaWQpO1xufSk7XG5cbmFwcC51c2UoJy9zZW5zb3ItdGVzdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuXHRyZXMucmVuZGVyKCdzZW5zb3ItdGVzdC5odG1sJywgeyBhcHBOYW1lOiAnc2Vuc29yLXRlc3QnLCBjbGllbnRUeXBlOiAnc2Vuc29yLXRlc3QnfSk7XG5cdHJlcS5zZXNzaW9uLmlkID0gcmVxLnNlc3Npb24uaWQgfHwgKytjbnQ7XG5cdGNvbnNvbGUubG9nKHJlcS5zZXNzaW9uLmlkKTtcbn0pO1xuXG4vLyBkZWZhdWx0IHJvdXRlIDogbGVhdmUgaXQgYWZ0ZXIgYW55IG90aGVyIHJvdXRlIGRlY2xhcmF0aW9uc1xuYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcblx0cmVzLnJlbmRlcignaW5kZXguaHRtbCcsIHsgYXBwTmFtZTogJ2luZGV4JywgY2xpZW50VHlwZTogJ2luZGV4J30pO1xuXHRyZXEuc2Vzc2lvbi5pZCA9IHJlcS5zZXNzaW9uLmlkIHx8ICsrY250O1xuXHRjb25zb2xlLmxvZyhyZXEuc2Vzc2lvbi5pZCk7XG59KTtcblxubGV0IHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG5sZXQgaW8gPSBpb21vZHVsZShzZXJ2ZXIpO1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTT0NLRVRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbmNvbnN0IGNsaWVudFNvY2tldHMgPSBbXTtcbmNvbnN0IG5zcF9jbGllbnQgPSBpby5vZignL3dpbWwtZ21tJyk7XG5jb25zdCB0cmFpbmluZ0NvbmZpZyA9IHtcblx0bGFiZWxzOiBbJ1N0aWxsJywgJ1NodWZmbGUnLCAnV2FsaycsICdSdW4nLCAnSG9wJywgJ1N0YWdnZXInLCAnTmluamEnXSxcblx0Y29sdW1uX25hbWVzOiBbJ21hZ25pdHVkZScsICdmcmVxdWVuY3knLCAncGVyaW9kaWNpdHknXSxcblx0Z2F1c3NpYW5zOiAxXG59O1xuXG4vLyBpbnN0ZWFkIG9mIGlvLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oY2xpZW50KSB7IC4uIH0pO1xubnNwX2NsaWVudC5vbignY29ubmVjdGlvbicsIChzb2NrZXQpID0+IHtcblx0XG5cdHNvY2tldC5tb25nbyA9IG5ldyBNb25nb0RCQ29udHJvbGxlcih7IHBhcmVudGlkOiBzb2NrZXQuaWQgfSk7XG5cblx0Y2xpZW50U29ja2V0cy5wdXNoKHNvY2tldCk7XG5cdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgY29ubmVjdGVkJyk7XG5cdHNvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGRpc2Nvbm5lY3RlZCcpO1xuXHRcdGNsaWVudFNvY2tldHMuc3BsaWNlKGNsaWVudFNvY2tldHMuaW5kZXhPZihzb2NrZXQpLCAxKTtcblx0fSk7XG5cblx0Ly8gZ2V0IG1vZGVsIG9uIGZpcnN0IGNvbm5lY3Rpb25cblx0c29ja2V0Lm1vbmdvLmdldE1vZGVscygnd2ltbGRiJywgJ2dtbU1vZGVscycpXG5cdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7XG5cdH0pXG5cdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gcmV0cmlldmluZyBtb2RlbHMnIH0pO1xuXHR9KVxuXG5cblx0c29ja2V0Lm9uKCd3cml0ZVBocmFzZScsIChkYXRhKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBzYWlkIDogd3JpdGVQaHJhc2UgIScpO1xuXHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cdFx0c29ja2V0Lm1vbmdvLndyaXRlVG9EYXRhYmFzZSgnd2ltbGRiJywgJ2dtbVBocmFzZXMnLCBkYXRhKTtcblx0XHRmb3IobGV0IGk9MDsgaTxhZG1pblNvY2tldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGFkbWluU29ja2V0c1tpXS5yZWZyZXNoKCk7XG5cdFx0fVxuXHR9KTtcblxuXHRzb2NrZXQub24oJ3RyYWluTW9kZWxzJywgKGRhdGEpID0+IHtcblx0XHRzb2NrZXQubW9uZ28udHJhaW5Nb2RlbHMoJ2dtbScsICd3aW1sZGInLCAnZ21tUGhyYXNlcycsICdnbW1Nb2RlbHMnLCB0cmFpbmluZ0NvbmZpZylcblx0XHQudGhlbigoZGF0YSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdGlmKGRhdGEgPT09ICdvaycpIHtcblx0XHRcdFx0c29ja2V0Lm1vbmdvLmdldE1vZGVscygnd2ltbGRiJywgJ2dtbU1vZGVscycpXG5cdFx0XHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gcmV0cmlldmluZyBtb2RlbHMnIH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHhtbS1zZXJ2ZXItdG9vbCByZXR1cm4gYW4gZXJyb3IgY29kZVxuXHRcdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAncHJvYmxlbSB0cmFpbmluZyBtb2RlbHMnIH0pO1xuXHRcdFx0fVxuXHRcdH0pKVxuXHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHQvLyBpZiB3ZSBhcnJpdmUgaGVyZSB0aGF0IG1lYW5zIHRoYXQgeG1tLXNlcnZlci10b29sIGNyYXNoZWRcblx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICd4bW0tc2VydmVyLXRvb2wgc2VlbXMgdG8gYmUgZG93bicgfSk7XG5cdFx0fSk7XG5cdH0pO1xuXG59KTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuY29uc3QgaGhtbVNvY2tldHMgPSBbXTtcbmNvbnN0IG5zcF9oaG1tID0gaW8ub2YoJy93aW1sLWhobW0nKTtcbmNvbnN0IGhobW1UcmFpbmluZ0NvbmZpZyA9IHtcblx0bGFiZWxzOiBbJ0hhbGYtdHVybicsICdHby1sb3cnLCAnSnVtcCcsICdLYXRhMScsICdLYXRhMicsICdLYXRhMycsICdLYXRhNCddLFxuXHRjb2x1bW5fbmFtZXM6IFsnYWNjZWxYJywgJ2FjY2VsWScsICdhY2NlbFonLCAncm90WCcsICdyb3RZJywgJ3JvdFonXSxcblx0Z2F1c3NpYW5zOiAxXG59O1xuXG4vLyBpbnN0ZWFkIG9mIGlvLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oY2xpZW50KSB7IC4uIH0pO1xubnNwX2hobW0ub24oJ2Nvbm5lY3Rpb24nLCAoc29ja2V0KSA9PiB7XG5cdFxuXHRzb2NrZXQubW9uZ28gPSBuZXcgTW9uZ29EQkNvbnRyb2xsZXIoeyBwYXJlbnRpZDogc29ja2V0LmlkIH0pO1xuXG5cdGhobW1Tb2NrZXRzLnB1c2goc29ja2V0KTtcblx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBjb25uZWN0ZWQnKTtcblx0c29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKCkgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgZGlzY29ubmVjdGVkJyk7XG5cdFx0aGhtbVNvY2tldHMuc3BsaWNlKGhobW1Tb2NrZXRzLmluZGV4T2Yoc29ja2V0KSwgMSk7XG5cdH0pO1xuXG5cdC8vIGdldCBtb2RlbCBvbiBmaXJzdCBjb25uZWN0aW9uXG5cdHNvY2tldC5tb25nby5nZXRNb2RlbHMoJ3dpbWxkYicsICdoaG1tTW9kZWxzJylcblx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1vZGVsczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgbW9kZWxzJyB9KTtcblx0fSlcblx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAncHJvYmxlbSByZXRyaWV2aW5nIG1vZGVscycgfSk7XG5cdH0pXG5cblxuXHRzb2NrZXQub24oJ3dyaXRlUGhyYXNlJywgKGRhdGEpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIHNhaWQgOiB3cml0ZVBocmFzZSAhJyk7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRzb2NrZXQubW9uZ28ud3JpdGVUb0RhdGFiYXNlKCd3aW1sZGInLCAnaGhtbVBocmFzZXMnLCBkYXRhKTtcblx0XHRmb3IobGV0IGk9MDsgaTxoaG1tQWRtaW5Tb2NrZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRoaG1tQWRtaW5Tb2NrZXRzW2ldLnJlZnJlc2goKTtcblx0XHR9XG5cdH0pO1xuXG5cdHNvY2tldC5vbigndHJhaW5Nb2RlbHMnLCAoZGF0YSkgPT4ge1xuXHRcdHNvY2tldC5tb25nby50cmFpbk1vZGVscygnaGhtbScsICd3aW1sZGInLCAnaGhtbVBocmFzZXMnLCAnaGhtbU1vZGVscycsIGhobW1UcmFpbmluZ0NvbmZpZylcblx0XHQudGhlbigoZGF0YSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdGlmKGRhdGEgPT09ICdvaycpIHtcblx0XHRcdFx0c29ja2V0Lm1vbmdvLmdldE1vZGVscygnd2ltbGRiJywgJ2hobW1Nb2RlbHMnKVxuXHRcdFx0XHQudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbW9kZWxzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBtb2RlbHMnIH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHJldHJpZXZpbmcgbW9kZWxzJyB9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB4bW0tc2VydmVyLXRvb2wgcmV0dXJuIGFuIGVycm9yIGNvZGVcblx0XHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHRyYWluaW5nIG1vZGVscycgfSk7XG5cdFx0XHR9XG5cdFx0fSkpXG5cdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdC8vIGlmIHdlIGFycml2ZSBoZXJlIHRoYXQgbWVhbnMgdGhhdCB4bW0tc2VydmVyLXRvb2wgY3Jhc2hlZFxuXHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3htbS1zZXJ2ZXItdG9vbCBzZWVtcyB0byBiZSBkb3duJyB9KTtcblx0XHR9KTtcblx0fSk7XG5cbn0pO1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuY29uc3QgYWRtaW5Tb2NrZXRzID0gW107XG5jb25zdCBuc3BfYWRtaW4gPSBpby5vZignL3dpbWwtZ21tLWFkbWluJyk7XG5cbm5zcF9hZG1pbi5vbignY29ubmVjdGlvbicsIChzb2NrZXQpID0+IHtcblxuXHRzb2NrZXQucmVmcmVzaCA9ICgpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5nZXRNb2RlbHMoJ3dpbWxkYicsICdnbW1QaHJhc2VzJylcblx0XHQudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0c29ja2V0LmVtaXQoJ3BocmFzZXMnLCB7IHBocmFzZXM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIHBocmFzZXMnIH0pO1xuXHRcdH0pXG5cdFx0LmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG5cdH1cblxuXHRhZG1pblNvY2tldHMucHVzaChzb2NrZXQpO1xuXHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGNvbm5lY3RlZCcpO1xuXHRzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBkaXNjb25uZWN0ZWQnKTtcblx0XHRhZG1pblNvY2tldHMuc3BsaWNlKGFkbWluU29ja2V0cy5pbmRleE9mKHNvY2tldCksIDEpO1xuXHR9KTtcblxuXHQvLyBzZW5kIHBocmFzZXMgdG8gYnVpbGQgVUkgOlxuXHQvLyBtb25nb2RiQ29udHJvbGxlci5nZXRNb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJylcblx0Ly8gLnRoZW4oKGRhdGEpID0+IHtcblx0Ly8gXHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdC8vIH0pXG5cdC8vIC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuXG5cdHNvY2tldC5yZWZyZXNoKCk7XG5cblx0c29ja2V0Lm9uKCdyZWZyZXNoUGhyYXNlcycsIChkYXRhKSA9PiB7XG5cdFx0c29ja2V0LnJlZnJlc2goKTtcblx0XHQvLyBtb25nb2RiQ29udHJvbGxlci5nZXRNb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJylcblx0XHQvLyAudGhlbigocCkgPT4ge1xuXHRcdC8vIFx0c29ja2V0LmVtaXQoJ3BocmFzZXMnLCB7IHBocmFzZXM6IHAsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIHBocmFzZXMnIH0pO1xuXHRcdC8vIH0pXG5cdFx0Ly8gLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG5cdH0pO1xuXG5cdHNvY2tldC5vbignY2xlYXJNb2RlbHMnLCAoZGF0YSkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdnbW1Nb2RlbHMnKTtcblx0XHRzb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBtb2RlbHMgZG9uZScgfSk7XG5cdH0pO1xuXG5cdHNvY2tldC5vbignY2xlYXJQaHJhc2VzJywgKGRhdGEpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnZ21tUGhyYXNlcycpO1xuXHRcdHNvY2tldC5lbWl0KCdjbGVhcicsIHsgbWVzc2FnZTogJ2NsZWFyIHBocmFzZXMgZG9uZScgfSk7XG5cdH0pO1xuXG5cdHNvY2tldC5vbignY2xlYXJBbGwnLCAoZGF0YSkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdnbW1Nb2RlbHMnKTtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnZ21tUGhyYXNlcycpO1xuXHRcdC8vc29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgYWxsIGRvbmUnIH0pO1xuXHRcdGZvcihsZXQgaT0wOyBpPGFkbWluU29ja2V0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0YWRtaW5Tb2NrZXRzW2ldLmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgYWxsIGRvbmUnIH0pO1xuXHRcdH1cblx0fSk7XG59KTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbmNvbnN0IGhobW1BZG1pblNvY2tldHMgPSBbXTtcbmNvbnN0IG5zcF9oaG1tYWRtaW4gPSBpby5vZignL3dpbWwtaGhtbS1hZG1pbicpO1xuXG5uc3BfaGhtbWFkbWluLm9uKCdjb25uZWN0aW9uJywgKHNvY2tldCkgPT4ge1xuXG5cdHNvY2tldC5yZWZyZXNoID0gKCkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ2hobW1QaHJhc2VzJylcblx0XHQudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0c29ja2V0LmVtaXQoJ3BocmFzZXMnLCB7IHBocmFzZXM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIHBocmFzZXMnIH0pO1xuXHRcdH0pXG5cdFx0LmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG5cdH1cblxuXHRoaG1tQWRtaW5Tb2NrZXRzLnB1c2goc29ja2V0KTtcblx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBjb25uZWN0ZWQnKTtcblx0c29ja2V0Lm9uKCdkaXNjb25uZWN0JywgKCkgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgZGlzY29ubmVjdGVkJyk7XG5cdFx0aGhtbUFkbWluU29ja2V0cy5zcGxpY2UoaGhtbUFkbWluU29ja2V0cy5pbmRleE9mKHNvY2tldCksIDEpO1xuXHR9KTtcblxuXHQvLyBzZW5kIHBocmFzZXMgdG8gYnVpbGQgVUkgOlxuXHQvLyBtb25nb2RiQ29udHJvbGxlci5nZXRNb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJylcblx0Ly8gLnRoZW4oKGRhdGEpID0+IHtcblx0Ly8gXHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdC8vIH0pXG5cdC8vIC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVycikpO1xuXG5cdHNvY2tldC5yZWZyZXNoKCk7XG5cblx0c29ja2V0Lm9uKCdyZWZyZXNoUGhyYXNlcycsIChkYXRhKSA9PiB7XG5cdFx0c29ja2V0LnJlZnJlc2goKTtcblx0XHQvLyBtb25nb2RiQ29udHJvbGxlci5nZXRNb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJylcblx0XHQvLyAudGhlbigocCkgPT4ge1xuXHRcdC8vIFx0c29ja2V0LmVtaXQoJ3BocmFzZXMnLCB7IHBocmFzZXM6IHAsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIHBocmFzZXMnIH0pO1xuXHRcdC8vIH0pXG5cdFx0Ly8gLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG5cdH0pO1xuXG5cdHNvY2tldC5vbignY2xlYXJNb2RlbHMnLCAoZGF0YSkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdoaG1tTW9kZWxzJyk7XG5cdFx0c29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgbW9kZWxzIGRvbmUnIH0pO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ2NsZWFyUGhyYXNlcycsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2hobW1QaHJhc2VzJyk7XG5cdFx0c29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgcGhyYXNlcyBkb25lJyB9KTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhckFsbCcsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2hobW1Nb2RlbHMnKTtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnaGhtbVBocmFzZXMnKTtcblx0XHQvL3NvY2tldC5lbWl0KCdjbGVhcicsIHsgbWVzc2FnZTogJ2NsZWFyIGFsbCBkb25lJyB9KTtcblx0XHRmb3IobGV0IGk9MDsgaTxoaG1tQWRtaW5Tb2NrZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRoaG1tQWRtaW5Tb2NrZXRzW2ldLmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgYWxsIGRvbmUnIH0pO1xuXHRcdH1cblx0fSk7XG59KTtcblxuLy9tb25nb2RiQ29udHJvbGxlci50cmFpbk1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnLCAnbW9kZWxzJywgdHJhaW5pbmdDb25maWcpO1xuLy9tb25nb2RiQ29udHJvbGxlci5wcmludE1vZGVscygpO1xuLy9tb25nb2RiQ29udHJvbGxlci5wcmludFBocmFzZXMoJ1J1bicpO1xuLy9tb25nb2RiQ29udHJvbGxlci5wcmludFBocmFzZXMoKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIucmVtb3ZlUGhyYXNlKCcyMDE2LTAyLTI5VDE2OjA1OjM1LjAxN1onKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIudGVsbFhtbSgnYW55dGhpbmcnKTtcbi8qXG5tb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnZ21tTW9kZWxzJyk7XG5tb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnaGhtbU1vZGVscycpO1xubW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2dtbVBocmFzZXMnKTtcbm1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdoaG1tUGhyYXNlcycpO1xuLy8qL1xuXG4vKlxucmVwb3ZpenpDbGllbnQuZGF0YXBhY2tzKClcblx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRjb25zb2xlLmxvZyhkYXRhLmxlbmd0aCk7XG5cdH0pXG5cdC5jYXRjaCgoZXJyb3IpID0+IHtcblx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcblx0fSk7XG4vLyovXG5cbmNvbnN0IHBvcnQgPSAzMDAwO1xuc2VydmVyLmxpc3Rlbihwb3J0LCBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coYHNlcnZlciBsaXN0ZW4gb24gaHR0cDovLzEyNy4wLjAuMToke3BvcnR9YCk7XG59KTtcbi8vYXBwLmxpc3Rlbihwb3J0KTtcbiJdfQ==