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
	column_names: ['magnitude', 'frequency', 'periodicity']
};

// instead of io.on('connection', function(client) { .. });
//gaussians: 1
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

		socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', hhmmTrainingConfig).then(function (data) {
			console.log('train result : ' + data);
			if (data === 'ok') {
				socket.mongo.getModels('wimldb', 'gmmModels').then(function (data) {
					console.log(data);
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
			console.log('training problem');
			// if we arrive here that means that xmm-server-tool crashed
			socket.emit('models', { message: 'xmm-server-tool seems to be down' });
		});

		// socket.mongo.configureModels('gmm', {
		// 	gaussians: 2,
		// 	relativeRegularization: 0.1,
		// 	absoluteRegularization: 0.1
		// })
		// .then(socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', trainingConfig)
		// .then((data) => { if(data === 'ok') return socket.mongo.getModels('wimldb', 'gmmModels'); })
		// .then((data) => { socket.emit('models', { models: data, message: 'here are your models' }); });

		/*
  .then((data) => {
  	console.log(data + ' : now training');
  	return socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', trainingConfig)
  	//socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', trainingConfig)
  .then((data) => {
  	if(data === 'ok') {
  		console.log('ok');
  		return socket.mongo.getModels('wimldb', 'gmmModels')
  	.then((data) => {
  	//console.log(data);
  	socket.emit('models', { models: data, message: 'here are your models' });
  })
  .catch((err) => {
  	socket.emit('models', { message: 'problem retrieving models' });
  })
  }
  })});
  */

		/*
  .then((data) => {
  	//console.log(data);
  	console.log('and now the training begins');
  	return socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', trainingConfig);
  })
  	.then((data) => {
  		console.log(data);
  		if(data === 'ok') {
  			socket.mongo.getModels('wimldb', 'gmmModels')
  			.then((data) => {
  				//console.log(data);
  				socket.emit('models', { models: data, message: 'here are your models' });
  			})
  			.catch((err) => {
  				socket.emit('models', { message: 'problem retrieving models' });
  			});
  		} else {
  			// xmm-server-tool return an error code
  			socket.emit('models', { message: 'problem training models' });
  		}
  	})
  	.catch((err) => {
  		console.log(err.message);	
  	})
  //})
  .catch((err) => {
  	// if we arrive here that means that xmm-server-tool crashed
  	console.log(err.message);
  	socket.emit('models', { message: 'xmm-server-tool seems to be down' });
  });
  // })
  // .catch((err) => {
  // 	//console.log(err);
  // });
  */
	});
});

//==================================================================================//

var hhmmSockets = [];
var nsp_hhmm = io.of('/wiml-hhmm');
var hhmmTrainingConfig = {
	labels: ['Half-turn', 'Go-low', 'Jump', 'Kata1', 'Kata2', 'Kata3', 'Kata4'],
	column_names: ['accelX', 'accelY', 'accelZ', 'rotX', 'rotY', 'rotZ']
};

// instead of io.on('connection', function(client) { .. });
//gaussians: 1
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
		console.log(data);
		socket.mongo.writeToDatabase('wimldb', 'hhmmPhrases', data);
		for (var i = 0; i < hhmmAdminSockets.length; i++) {
			hhmmAdminSockets[i].refresh();
		}
	});

	socket.on('trainModels', function (data) {
		// socket.mongo.configureModels('hhmm', {
		// 	gaussians: 1,
		// 	states: 5,
		// 	relativeRegularization: 0.1,
		// 	absoluteRegularization: 0.1
		// })
		// .then((data) => {
		// 	console.log(data);
		// })
		// .catch((err) => {
		// 	console.log(err);
		// });

		socket.mongo.trainModels('hhmm', 'wimldb', 'hhmmPhrases', 'hhmmModels', hhmmTrainingConfig).then(function (data) {
			console.log('train result : ' + data);
			if (data === 'ok') {
				socket.mongo.getModels('wimldb', 'hhmmModels').then(function (data) {
					console.log(data);
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
			console.log('training problem');
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
//mongodbController.printPhrases('Kata1', 'hhmmPhrases');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7b0JBQ2lCLE1BQU07Ozs7Ozt1QkFHSCxTQUFTOzs7OzZCQUNWLGdCQUFnQjs7OzsyQkFDWCxjQUFjOzs7OzZCQUNaLGdCQUFnQjs7Ozs2QkFDdkIsZ0JBQWdCOzs7Ozt3QkFFZCxXQUFXOzs7Ozt1QkFFWixTQUFTOzs7O3NCQUNWLFFBQVE7Ozs7aUNBQ0csc0JBQXNCOzs7Ozs2QkFFMUIsZUFBZTs7Ozs7a0JBRTFCLElBQUk7Ozs7Ozs4QkFFUSxtQkFBbUI7Ozs7QUFFOUMsSUFBTSxHQUFHLEdBQUcsMkJBQVMsQ0FBQztBQUN0QixJQUFNLGlCQUFpQixHQUFHLG9DQUF1QixDQUFDO0FBQ2xELElBQU0sY0FBYyxHQUFHLGlDQUFvQixDQUFDOzs7QUFHNUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDOztBQUUvQixHQUFHLENBQUMsR0FBRyxDQUFDLGlDQUFRLENBQUMsQ0FBQzs7QUFFbEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQ0FBYztBQUNyQixLQUFJLEVBQUUsU0FBUztBQUNmLEtBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7Q0FDdEIsQ0FBQyxDQUFDLENBQUM7O0FBRUosR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQ0FBTztBQUNkLEtBQUksRUFBRSxTQUFTLEdBQUcsV0FBVztBQUM3QixPQUFNLEVBQUUsYUFBYTtBQUNyQixNQUFLLEVBQUUsSUFBSTtBQUNYLFFBQU8sRUFBRTs7Ozs7Ozs7O0VBU1I7Q0FDRCxDQUFDLENBQUMsQ0FBQzs7QUFFSixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Ozs7QUFJWixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFLO0FBQ3hDLElBQUcsQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLEVBQUUsT0FBTyxFQUFFLFVB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LEVBQUUsWUFBVztBQUM5QixRQUFPLENBQUMsR0FBRyx3Q0FBc0MsSUFBSSxDQUFHLENBQUM7Q0FDekQsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSByZWd1bGFyIGh0dHAgc2VydmVyIDpcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuLy9pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0Jztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGNvbm5lY3Qgc3R1ZmYgOlxuaW1wb3J0IGNvbm5lY3QgZnJvbSAnY29ubmVjdCc7XG5pbXBvcnQgcmVuZGVyIGZyb20gJ2Nvbm5lY3QtcmVuZGVyJztcbmltcG9ydCBzZXJ2ZVN0YXRpYyBmcm9tICdzZXJ2ZS1zdGF0aWMnO1xuaW1wb3J0IGNvb2tpZVNlc3Npb24gZnJvbSAnY29va2llLXNlc3Npb24nO1xuaW1wb3J0IGJ1c2JveSBmcm9tICdjb25uZWN0LWJ1c2JveSc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzb2NrZXQuaW8gOlxuaW1wb3J0IGlvbW9kdWxlIGZyb20gJ3NvY2tldC5pbyc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtb25nb2RiIGRyaXZlciA6XG5pbXBvcnQgbW9uZ29kYiBmcm9tICdtb25nb2RiJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBNb25nb0RCQ29udHJvbGxlciBmcm9tICcuL21vbmdvZGItY29udHJvbGxlcic7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBsYXVuY2ggYmluYXJpZXMgOlxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBmb3Igc3RhdGljIGh0bWwgZmlsZXMgYW5kIGZpbGUgdXBsb2FkIDpcbmltcG9ydCBmcyBmcm9tICdmcyc7XG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuaW1wb3J0IFJlcG92aXp6Q2xpZW50IGZyb20gJy4vcmVwb3ZpenotY2xpZW50JztcblxuY29uc3QgYXBwID0gY29ubmVjdCgpO1xuY29uc3QgbW9uZ29kYkNvbnRyb2xsZXIgPSBuZXcgTW9uZ29EQkNvbnRyb2xsZXIoKTtcbmNvbnN0IHJlcG92aXp6Q2xpZW50ID0gbmV3IFJlcG92aXp6Q2xpZW50KCk7XG5cbi8vIGluIGNhc2Ugd2Ugd2FudCB0byBzZXJ2ZSBzdGF0aWMgZmlsZXNcbmFwcC51c2Uoc2VydmVTdGF0aWMoJ3B1YmxpYycpKTtcbi8vYXBwLnVzZShidXNib3koeyBoZWFkZXJzOiByZXEuaGVhZGVycyB9KSk7XG5hcHAudXNlKGJ1c2JveSgpKTtcblxuYXBwLnVzZShjb29raWVTZXNzaW9uKHtcblx0bmFtZTogJ3Nlc3Npb24nLFxuXHRrZXlzOiBbJ2tleTEnLCAna2V5MiddXG59KSk7XG5cbmFwcC51c2UocmVuZGVyKHtcblx0cm9vdDogX19kaXJuYW1lICsgJy8uLi92aWV3cycsXG5cdGxheW91dDogJ2xheW91dC5odG1sJyxcblx0Y2FjaGU6IHRydWUsIC8vc2V0IHRvIHRydWUgaW4gcHJvZFxuXHRoZWxwZXJzOiB7XG5cdFx0Ly9kZWZhdWx0VHlwZTogJ2luZGV4Jyxcblx0XHQvL2Fzc2V0c0RvbWFpbjogJ3B1YmxpYycsXG5cdFx0Lypcblx0XHRzdGFydHRpbWU6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuXHRcdG5vdzogZnVuY3Rpb24ocmVxLCByZXMpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpO1xuXHRcdH1cblx0XHQvLyovXG5cdH1cbn0pKTtcblxubGV0IGNudCA9IDE7XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFJPVVRFUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuYXBwLnVzZSgnL3dpbWwtZ21tJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG5cdHJlcy5yZW5kZXIoJ3dpbWwtZ21tLmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWdtbScsIGNsaWVudFR5cGU6ICd3aW1sLWdtbSd9KTtcblx0cmVxLnNlc3Npb24uaWQgPSByZXEuc2Vzc2lvbi5pZCB8fCArK2NudDtcblx0Y29uc29sZS5sb2cocmVxLnNlc3Npb24uaWQpO1xufSk7XG5cbmFwcC51c2UoJy93aW1sLWdtbS1hZG1pbicsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuXG5cdC8vcmVzLnJlbmRlcignd2ltbC1hZG1pbi5odG1sJywgeyBhcHBOYW1lOiAnd2ltbC1hZG1pbicsIGNsaWVudFR5cGU6ICd3aW1sLWFkbWluJywgdXBsb2FkOiB1cGxvYWRTdGF0ZX0pO1xuXHRyZXMucmVuZGVyKCd3aW1sLWdtbS1hZG1pbi5odG1sJywgeyBhcHBOYW1lOiAnd2ltbC1nbW0tYWRtaW4nLCBjbGllbnRUeXBlOiAnd2ltbC1nbW0tYWRtaW4nIH0pO1xuXHRyZXEuc2Vzc2lvbi5pZCA9IHJlcS5zZXNzaW9uLmlkIHx8ICsrY250O1xuXHRjb25zb2xlLmxvZyhyZXEuc2Vzc2lvbi5pZCk7XG5cblx0bGV0IHVwbG9hZFN0YXRlID0gJ25vbmUnO1xuXG5cdGlmKHJlcS5idXNib3kpIHtcblx0XHR2YXIgZmlsZXNOYW1lcyA9IFtdO1xuXG5cdFx0cmVxLnBpcGUocmVxLmJ1c2JveSk7XG5cdFx0dXBsb2FkU3RhdGUgPSAnZmFpbGVkJztcblxuXHRcdHJlcS5idXNib3kub24oJ2ZpbGUnLCBmdW5jdGlvbihmaWVsZG5hbWUsIGZpbGUsIGZpbGVuYW1lLCBlbmNvZGluZywgbWltZXR5cGUpIHtcblx0XHRcdHZhciB3cyA9IGZzLmNyZWF0ZVdyaXRlU3RyZWFtKCcuL3B1YmxpYy91cGxvYWRzL3BocmFzZXMvJyArIGZpbGVuYW1lLCB7ZmxhZ3M6IFwiYVwifSk7XG5cdCAgICBcdGZpbGUucGlwZSh3cyk7XG5cdCAgICBcdGZpbGVzTmFtZXMucHVzaChmaWxlbmFtZSk7XG5cdCAgICBcdGNvbnNvbGUubG9nKGZpbGVuYW1lKTtcblx0XHR9KTtcblx0ICBcdHJlcS5idXNib3kub24oJ2ZpZWxkJywgZnVuY3Rpb24oa2V5LCB2YWx1ZSwga2V5VHJ1bmNhdGVkLCB2YWx1ZVRydW5jYXRlZCkge1xuICAgIFx0XHQvLyAuLi4gXG4gICAgXHRcdGNvbnNvbGUubG9nKCdmaWVsZCBldmVudCBmaXJlZCcpO1xuICBcdFx0fSk7XG5cdFx0cmVxLmJ1c2JveS5vbignZmluaXNoJywgZnVuY3Rpb24oKSB7XG5cdCAgICAgICAgLy8gcmVzLndyaXRlSGVhZCgyMDAsIHsnQ29ubmVjdGlvbic6ICdjbG9zZSd9KTtcbiAgICBcdCAgICAvLyBmb3IgKHZhciBpID0gMDsgaSA8IGZpbGVzTmFtZXMubGVuZ3RoOyBpKyspXG4gICAgICAgIFx0Ly8ge1xuICAgICAgICAgLy8gICAgXHRyZXMud3JpdGUoZmlsZXNOYW1lc1tpXSArIFwiXFxuXCIpO1xuICAgICAgICBcdC8vIH1cbiAgICAgICAgXHQvLyBjb25zb2xlLmxvZyhcImJ1c2JveSBkb25lXCIpO1xuICAgICAgICBcdC8vIHJlcy5lbmQoXCJEb25lLi5cIik7XHRcbiAgICAgICAgXHR1cGxvYWRTdGF0ZSA9ICdzdWNjZWVkZWQnO1x0XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5hcHAudXNlKCcvd2ltbC1oaG1tJywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG5cdHJlcy5yZW5kZXIoJ3dpbWwtaGhtbS5odG1sJywgeyBhcHBOYW1lOiAnd2ltbC1oaG1tJywgY2xpZW50VHlwZTogJ3dpbWwtaGhtbSd9KTtcblx0cmVxLnNlc3Npb24uaWQgPSByZXEuc2Vzc2lvbi5pZCB8fCArK2NudDtcblx0Y29uc29sZS5sb2cocmVxLnNlc3Npb24uaWQpO1xufSk7XG5cbmFwcC51c2UoJy93aW1sLWhobW0tYWRtaW4nLCAocmVxLCByZXMsIG5leHQpID0+IHtcblx0Ly9yZXMucmVuZGVyKCd3aW1sLWFkbWluLmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWFkbWluJywgY2xpZW50VHlwZTogJ3dpbWwtYWRtaW4nLCB1cGxvYWQ6IHVwbG9hZFN0YXRlfSk7XG5cdHJlcy5yZW5kZXIoJ3dpbWwtaGhtbS1hZG1pbi5odG1sJywgeyBhcHBOYW1lOiAnd2ltbC1oaG1tLWFkbWluJywgY2xpZW50VHlwZTogJ3dpbWwtaGhtbS1hZG1pbicgfSk7XG5cdHJlcS5zZXNzaW9uLmlkID0gcmVxLnNlc3Npb24uaWQgfHwgKytjbnQ7XG5cdGNvbnNvbGUubG9nKHJlcS5zZXNzaW9uLmlkKTtcbn0pO1xuXG5hcHAudXNlKCcvc2Vuc29yLXRlc3QnLCAocmVxLCByZXMsIG5leHQpID0+IHtcblx0cmVzLnJlbmRlcignc2Vuc29yLXRlc3QuaHRtbCcsIHsgYXBwTmFtZTogJ3NlbnNvci10ZXN0JywgY2xpZW50VHlwZTogJ3NlbnNvci10ZXN0J30pO1xuXHRyZXEuc2Vzc2lvbi5pZCA9IHJlcS5zZXNzaW9uLmlkIHx8ICsrY250O1xuXHRjb25zb2xlLmxvZyhyZXEuc2Vzc2lvbi5pZCk7XG59KTtcblxuLy8gZGVmYXVsdCByb3V0ZSA6IGxlYXZlIGl0IGFmdGVyIGFueSBvdGhlciByb3V0ZSBkZWNsYXJhdGlvbnNcbmFwcC51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG5cdHJlcy5yZW5kZXIoJ2luZGV4Lmh0bWwnLCB7IGFwcE5hbWU6ICdpbmRleCcsIGNsaWVudFR5cGU6ICdpbmRleCd9KTtcblx0cmVxLnNlc3Npb24uaWQgPSByZXEuc2Vzc2lvbi5pZCB8fCArK2NudDtcblx0Y29uc29sZS5sb2cocmVxLnNlc3Npb24uaWQpO1xufSk7XG5cbmxldCBzZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcihhcHApO1xubGV0IGlvID0gaW9tb2R1bGUoc2VydmVyKTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gU09DS0VUUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5jb25zdCBjbGllbnRTb2NrZXRzID0gW107XG5jb25zdCBuc3BfY2xpZW50ID0gaW8ub2YoJy93aW1sLWdtbScpO1xuY29uc3QgdHJhaW5pbmdDb25maWcgPSB7XG5cdGxhYmVsczogWydTdGlsbCcsICdTaHVmZmxlJywgJ1dhbGsnLCAnUnVuJywgJ0hvcCcsICdTdGFnZ2VyJywgJ05pbmphJ10sXG5cdGNvbHVtbl9uYW1lczogWydtYWduaXR1ZGUnLCAnZnJlcXVlbmN5JywgJ3BlcmlvZGljaXR5J10sXG5cdC8vZ2F1c3NpYW5zOiAxXG59O1xuXG4vLyBpbnN0ZWFkIG9mIGlvLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oY2xpZW50KSB7IC4uIH0pO1xubnNwX2NsaWVudC5vbignY29ubmVjdGlvbicsIChzb2NrZXQpID0+IHtcblx0XG5cdHNvY2tldC5tb25nbyA9IG5ldyBNb25nb0RCQ29udHJvbGxlcih7IHBhcmVudGlkOiBzb2NrZXQuaWQgfSk7XG5cblx0Y2xpZW50U29ja2V0cy5wdXNoKHNvY2tldCk7XG5cdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgY29ubmVjdGVkJyk7XG5cdHNvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGRpc2Nvbm5lY3RlZCcpO1xuXHRcdGNsaWVudFNvY2tldHMuc3BsaWNlKGNsaWVudFNvY2tldHMuaW5kZXhPZihzb2NrZXQpLCAxKTtcblx0fSk7XG5cblx0Ly8gZ2V0IG1vZGVsIG9uIGZpcnN0IGNvbm5lY3Rpb25cblx0c29ja2V0Lm1vbmdvLmdldE1vZGVscygnd2ltbGRiJywgJ2dtbU1vZGVscycpXG5cdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7XG5cdH0pXG5cdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gcmV0cmlldmluZyBtb2RlbHMnIH0pO1xuXHR9KVxuXG5cblx0c29ja2V0Lm9uKCd3cml0ZVBocmFzZScsIChkYXRhKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBzYWlkIDogd3JpdGVQaHJhc2UgIScpO1xuXHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cdFx0c29ja2V0Lm1vbmdvLndyaXRlVG9EYXRhYmFzZSgnd2ltbGRiJywgJ2dtbVBocmFzZXMnLCBkYXRhKTtcblx0XHRmb3IobGV0IGk9MDsgaTxhZG1pblNvY2tldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGFkbWluU29ja2V0c1tpXS5yZWZyZXNoKCk7XG5cdFx0fVxuXHR9KTtcblxuXHRzb2NrZXQub24oJ3RyYWluTW9kZWxzJywgKGRhdGEpID0+IHtcblxuXHRcdHNvY2tldC5tb25nby50cmFpbk1vZGVscygnZ21tJywgJ3dpbWxkYicsICdnbW1QaHJhc2VzJywgJ2dtbU1vZGVscycsIGhobW1UcmFpbmluZ0NvbmZpZylcblx0XHQudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ3RyYWluIHJlc3VsdCA6ICcgKyBkYXRhKTtcblx0XHRcdGlmKGRhdGEgPT09ICdvaycpIHtcblx0XHRcdFx0c29ja2V0Lm1vbmdvLmdldE1vZGVscygnd2ltbGRiJywgJ2dtbU1vZGVscycpXG5cdFx0XHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbW9kZWxzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBtb2RlbHMnIH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHJldHJpZXZpbmcgbW9kZWxzJyB9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyB4bW0tc2VydmVyLXRvb2wgcmV0dXJuIGFuIGVycm9yIGNvZGVcblx0XHRcdFx0Y29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHRyYWluaW5nIG1vZGVscycgfSk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coJ3RyYWluaW5nIHByb2JsZW0nKTtcblx0XHRcdC8vIGlmIHdlIGFycml2ZSBoZXJlIHRoYXQgbWVhbnMgdGhhdCB4bW0tc2VydmVyLXRvb2wgY3Jhc2hlZFxuXHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3htbS1zZXJ2ZXItdG9vbCBzZWVtcyB0byBiZSBkb3duJyB9KTtcblx0XHR9KTtcblxuXHRcdC8vIHNvY2tldC5tb25nby5jb25maWd1cmVNb2RlbHMoJ2dtbScsIHtcblx0XHQvLyBcdGdhdXNzaWFuczogMixcblx0XHQvLyBcdHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMSxcblx0XHQvLyBcdGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMVxuXHRcdC8vIH0pXG5cdFx0Ly8gLnRoZW4oc29ja2V0Lm1vbmdvLnRyYWluTW9kZWxzKCdnbW0nLCAnd2ltbGRiJywgJ2dtbVBocmFzZXMnLCAnZ21tTW9kZWxzJywgdHJhaW5pbmdDb25maWcpXG5cdFx0Ly8gLnRoZW4oKGRhdGEpID0+IHsgaWYoZGF0YSA9PT0gJ29rJykgcmV0dXJuIHNvY2tldC5tb25nby5nZXRNb2RlbHMoJ3dpbWxkYicsICdnbW1Nb2RlbHMnKTsgfSlcblx0XHQvLyAudGhlbigoZGF0YSkgPT4geyBzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7IH0pO1xuXG5cdFx0Lypcblx0XHQudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coZGF0YSArICcgOiBub3cgdHJhaW5pbmcnKTtcblx0XHRcdHJldHVybiBzb2NrZXQubW9uZ28udHJhaW5Nb2RlbHMoJ2dtbScsICd3aW1sZGInLCAnZ21tUGhyYXNlcycsICdnbW1Nb2RlbHMnLCB0cmFpbmluZ0NvbmZpZylcblxuXHRcdC8vc29ja2V0Lm1vbmdvLnRyYWluTW9kZWxzKCdnbW0nLCAnd2ltbGRiJywgJ2dtbVBocmFzZXMnLCAnZ21tTW9kZWxzJywgdHJhaW5pbmdDb25maWcpXG5cdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdGlmKGRhdGEgPT09ICdvaycpIHtcblx0XHRcdFx0Y29uc29sZS5sb2coJ29rJyk7XG5cdFx0XHRcdHJldHVybiBzb2NrZXQubW9uZ28uZ2V0TW9kZWxzKCd3aW1sZGInLCAnZ21tTW9kZWxzJylcblxuXHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbW9kZWxzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBtb2RlbHMnIH0pO1xuXHRcdH0pXG5cdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHJldHJpZXZpbmcgbW9kZWxzJyB9KTtcblx0XHR9KVxuXHRcdH1cblx0XHR9KX0pO1xuXHRcdCovXG5cdFx0XG5cdFx0Lypcblx0XHQudGhlbigoZGF0YSkgPT4ge1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdGNvbnNvbGUubG9nKCdhbmQgbm93IHRoZSB0cmFpbmluZyBiZWdpbnMnKTtcblx0XHRcdHJldHVybiBzb2NrZXQubW9uZ28udHJhaW5Nb2RlbHMoJ2dtbScsICd3aW1sZGInLCAnZ21tUGhyYXNlcycsICdnbW1Nb2RlbHMnLCB0cmFpbmluZ0NvbmZpZyk7XG5cdFx0fSlcblx0XHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRpZihkYXRhID09PSAnb2snKSB7XG5cdFx0XHRcdFx0c29ja2V0Lm1vbmdvLmdldE1vZGVscygnd2ltbGRiJywgJ2dtbU1vZGVscycpXG5cdFx0XHRcdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cdFx0XHRcdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gcmV0cmlldmluZyBtb2RlbHMnIH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHhtbS1zZXJ2ZXItdG9vbCByZXR1cm4gYW4gZXJyb3IgY29kZVxuXHRcdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHRyYWluaW5nIG1vZGVscycgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKGVycikgPT4ge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhlcnIubWVzc2FnZSk7XHRcblx0XHRcdH0pXG5cdFx0Ly99KVxuXHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHQvLyBpZiB3ZSBhcnJpdmUgaGVyZSB0aGF0IG1lYW5zIHRoYXQgeG1tLXNlcnZlci10b29sIGNyYXNoZWRcblx0XHRcdGNvbnNvbGUubG9nKGVyci5tZXNzYWdlKTtcblx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICd4bW0tc2VydmVyLXRvb2wgc2VlbXMgdG8gYmUgZG93bicgfSk7XG5cdFx0fSk7XG5cdFx0Ly8gfSlcblx0XHQvLyAuY2F0Y2goKGVycikgPT4ge1xuXHRcdC8vIFx0Ly9jb25zb2xlLmxvZyhlcnIpO1xuXHRcdC8vIH0pO1xuXHRcdCovXG5cblx0fSk7XG5cbn0pO1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5jb25zdCBoaG1tU29ja2V0cyA9IFtdO1xuY29uc3QgbnNwX2hobW0gPSBpby5vZignL3dpbWwtaGhtbScpO1xuY29uc3QgaGhtbVRyYWluaW5nQ29uZmlnID0ge1xuXHRsYWJlbHM6IFsnSGFsZi10dXJuJywgJ0dvLWxvdycsICdKdW1wJywgJ0thdGExJywgJ0thdGEyJywgJ0thdGEzJywgJ0thdGE0J10sXG5cdGNvbHVtbl9uYW1lczogWydhY2NlbFgnLCAnYWNjZWxZJywgJ2FjY2VsWicsICdyb3RYJywgJ3JvdFknLCAncm90WiddLFxuXHQvL2dhdXNzaWFuczogMVxufTtcblxuLy8gaW5zdGVhZCBvZiBpby5vbignY29ubmVjdGlvbicsIGZ1bmN0aW9uKGNsaWVudCkgeyAuLiB9KTtcbm5zcF9oaG1tLm9uKCdjb25uZWN0aW9uJywgKHNvY2tldCkgPT4ge1xuXHRcblx0c29ja2V0Lm1vbmdvID0gbmV3IE1vbmdvREJDb250cm9sbGVyKHsgcGFyZW50aWQ6IHNvY2tldC5pZCB9KTtcblxuXHRoaG1tU29ja2V0cy5wdXNoKHNvY2tldCk7XG5cdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgY29ubmVjdGVkJyk7XG5cdHNvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGRpc2Nvbm5lY3RlZCcpO1xuXHRcdGhobW1Tb2NrZXRzLnNwbGljZShoaG1tU29ja2V0cy5pbmRleE9mKHNvY2tldCksIDEpO1xuXHR9KTtcblxuXHQvLyBnZXQgbW9kZWwgb24gZmlyc3QgY29ubmVjdGlvblxuXHRzb2NrZXQubW9uZ28uZ2V0TW9kZWxzKCd3aW1sZGInLCAnaGhtbU1vZGVscycpXG5cdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7XG5cdH0pXG5cdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gcmV0cmlldmluZyBtb2RlbHMnIH0pO1xuXHR9KVxuXG5cblx0c29ja2V0Lm9uKCd3cml0ZVBocmFzZScsIChkYXRhKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBzYWlkIDogd3JpdGVQaHJhc2UgIScpO1xuXHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdHNvY2tldC5tb25nby53cml0ZVRvRGF0YWJhc2UoJ3dpbWxkYicsICdoaG1tUGhyYXNlcycsIGRhdGEpO1xuXHRcdGZvcihsZXQgaT0wOyBpPGhobW1BZG1pblNvY2tldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGhobW1BZG1pblNvY2tldHNbaV0ucmVmcmVzaCgpO1xuXHRcdH1cblx0fSk7XG5cblx0c29ja2V0Lm9uKCd0cmFpbk1vZGVscycsIChkYXRhKSA9PiB7XG5cdFx0Ly8gc29ja2V0Lm1vbmdvLmNvbmZpZ3VyZU1vZGVscygnaGhtbScsIHtcblx0XHQvLyBcdGdhdXNzaWFuczogMSxcblx0XHQvLyBcdHN0YXRlczogNSxcblx0XHQvLyBcdHJlbGF0aXZlUmVndWxhcml6YXRpb246IDAuMSxcblx0XHQvLyBcdGFic29sdXRlUmVndWxhcml6YXRpb246IDAuMVxuXHRcdC8vIH0pXG5cdFx0Ly8gLnRoZW4oKGRhdGEpID0+IHtcblx0XHQvLyBcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdC8vIH0pXG5cdFx0Ly8gLmNhdGNoKChlcnIpID0+IHtcblx0XHQvLyBcdGNvbnNvbGUubG9nKGVycik7XG5cdFx0Ly8gfSk7XG5cblx0XHRzb2NrZXQubW9uZ28udHJhaW5Nb2RlbHMoJ2hobW0nLCAnd2ltbGRiJywgJ2hobW1QaHJhc2VzJywgJ2hobW1Nb2RlbHMnLCBoaG1tVHJhaW5pbmdDb25maWcpXG5cdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKCd0cmFpbiByZXN1bHQgOiAnICsgZGF0YSk7XG5cdFx0XHRpZihkYXRhID09PSAnb2snKSB7XG5cdFx0XHRcdHNvY2tldC5tb25nby5nZXRNb2RlbHMoJ3dpbWxkYicsICdoaG1tTW9kZWxzJylcblx0XHRcdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gcmV0cmlldmluZyBtb2RlbHMnIH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIHhtbS1zZXJ2ZXItdG9vbCByZXR1cm4gYW4gZXJyb3IgY29kZVxuXHRcdFx0XHRjb25zb2xlLmxvZyhkYXRhKTtcblx0XHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gdHJhaW5pbmcgbW9kZWxzJyB9KTtcblx0XHRcdH1cblx0XHR9KVxuXHRcdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZygndHJhaW5pbmcgcHJvYmxlbScpO1xuXHRcdFx0Ly8gaWYgd2UgYXJyaXZlIGhlcmUgdGhhdCBtZWFucyB0aGF0IHhtbS1zZXJ2ZXItdG9vbCBjcmFzaGVkXG5cdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAneG1tLXNlcnZlci10b29sIHNlZW1zIHRvIGJlIGRvd24nIH0pO1xuXHRcdH0pO1xuXHR9KTtcblxufSk7XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5jb25zdCBhZG1pblNvY2tldHMgPSBbXTtcbmNvbnN0IG5zcF9hZG1pbiA9IGlvLm9mKCcvd2ltbC1nbW0tYWRtaW4nKTtcblxubnNwX2FkbWluLm9uKCdjb25uZWN0aW9uJywgKHNvY2tldCkgPT4ge1xuXG5cdHNvY2tldC5yZWZyZXNoID0gKCkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ2dtbVBocmFzZXMnKVxuXHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcblx0fVxuXG5cdGFkbWluU29ja2V0cy5wdXNoKHNvY2tldCk7XG5cdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgY29ubmVjdGVkJyk7XG5cdHNvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGRpc2Nvbm5lY3RlZCcpO1xuXHRcdGFkbWluU29ja2V0cy5zcGxpY2UoYWRtaW5Tb2NrZXRzLmluZGV4T2Yoc29ja2V0KSwgMSk7XG5cdH0pO1xuXG5cdC8vIHNlbmQgcGhyYXNlcyB0byBidWlsZCBVSSA6XG5cdC8vIG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnKVxuXHQvLyAudGhlbigoZGF0YSkgPT4ge1xuXHQvLyBcdHNvY2tldC5lbWl0KCdwaHJhc2VzJywgeyBwaHJhc2VzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBwaHJhc2VzJyB9KTtcblx0Ly8gfSlcblx0Ly8gLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG5cblx0c29ja2V0LnJlZnJlc2goKTtcblxuXHRzb2NrZXQub24oJ3JlZnJlc2hQaHJhc2VzJywgKGRhdGEpID0+IHtcblx0XHRzb2NrZXQucmVmcmVzaCgpO1xuXHRcdC8vIG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnKVxuXHRcdC8vIC50aGVuKChwKSA9PiB7XG5cdFx0Ly8gXHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogcCwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdFx0Ly8gfSlcblx0XHQvLyAuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhck1vZGVscycsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2dtbU1vZGVscycpO1xuXHRcdHNvY2tldC5lbWl0KCdjbGVhcicsIHsgbWVzc2FnZTogJ2NsZWFyIG1vZGVscyBkb25lJyB9KTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhclBocmFzZXMnLCAoZGF0YSkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdnbW1QaHJhc2VzJyk7XG5cdFx0c29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgcGhyYXNlcyBkb25lJyB9KTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhckFsbCcsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2dtbU1vZGVscycpO1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdnbW1QaHJhc2VzJyk7XG5cdFx0Ly9zb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBhbGwgZG9uZScgfSk7XG5cdFx0Zm9yKGxldCBpPTA7IGk8YWRtaW5Tb2NrZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRhZG1pblNvY2tldHNbaV0uZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBhbGwgZG9uZScgfSk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuY29uc3QgaGhtbUFkbWluU29ja2V0cyA9IFtdO1xuY29uc3QgbnNwX2hobW1hZG1pbiA9IGlvLm9mKCcvd2ltbC1oaG1tLWFkbWluJyk7XG5cbm5zcF9oaG1tYWRtaW4ub24oJ2Nvbm5lY3Rpb24nLCAoc29ja2V0KSA9PiB7XG5cblx0c29ja2V0LnJlZnJlc2ggPSAoKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZ2V0TW9kZWxzKCd3aW1sZGInLCAnaGhtbVBocmFzZXMnKVxuXHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcblx0fVxuXG5cdGhobW1BZG1pblNvY2tldHMucHVzaChzb2NrZXQpO1xuXHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGNvbm5lY3RlZCcpO1xuXHRzb2NrZXQub24oJ2Rpc2Nvbm5lY3QnLCAoKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBkaXNjb25uZWN0ZWQnKTtcblx0XHRoaG1tQWRtaW5Tb2NrZXRzLnNwbGljZShoaG1tQWRtaW5Tb2NrZXRzLmluZGV4T2Yoc29ja2V0KSwgMSk7XG5cdH0pO1xuXG5cdC8vIHNlbmQgcGhyYXNlcyB0byBidWlsZCBVSSA6XG5cdC8vIG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnKVxuXHQvLyAudGhlbigoZGF0YSkgPT4ge1xuXHQvLyBcdHNvY2tldC5lbWl0KCdwaHJhc2VzJywgeyBwaHJhc2VzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBwaHJhc2VzJyB9KTtcblx0Ly8gfSlcblx0Ly8gLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG5cblx0c29ja2V0LnJlZnJlc2goKTtcblxuXHRzb2NrZXQub24oJ3JlZnJlc2hQaHJhc2VzJywgKGRhdGEpID0+IHtcblx0XHRzb2NrZXQucmVmcmVzaCgpO1xuXHRcdC8vIG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnKVxuXHRcdC8vIC50aGVuKChwKSA9PiB7XG5cdFx0Ly8gXHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogcCwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdFx0Ly8gfSlcblx0XHQvLyAuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhck1vZGVscycsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2hobW1Nb2RlbHMnKTtcblx0XHRzb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBtb2RlbHMgZG9uZScgfSk7XG5cdH0pO1xuXG5cdHNvY2tldC5vbignY2xlYXJQaHJhc2VzJywgKGRhdGEpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnaGhtbVBocmFzZXMnKTtcblx0XHRzb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBwaHJhc2VzIGRvbmUnIH0pO1xuXHR9KTtcblxuXHRzb2NrZXQub24oJ2NsZWFyQWxsJywgKGRhdGEpID0+IHtcblx0XHRtb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnaGhtbU1vZGVscycpO1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdoaG1tUGhyYXNlcycpO1xuXHRcdC8vc29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgYWxsIGRvbmUnIH0pO1xuXHRcdGZvcihsZXQgaT0wOyBpPGhobW1BZG1pblNvY2tldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGhobW1BZG1pblNvY2tldHNbaV0uZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBhbGwgZG9uZScgfSk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG4vL21vbmdvZGJDb250cm9sbGVyLnRyYWluTW9kZWxzKCd3aW1sZGInLCAncGhyYXNlcycsICdtb2RlbHMnLCB0cmFpbmluZ0NvbmZpZyk7XG4vL21vbmdvZGJDb250cm9sbGVyLnByaW50TW9kZWxzKCk7XG4vL21vbmdvZGJDb250cm9sbGVyLnByaW50UGhyYXNlcygnS2F0YTEnLCAnaGhtbVBocmFzZXMnKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIucHJpbnRQaHJhc2VzKCk7XG4vL21vbmdvZGJDb250cm9sbGVyLnJlbW92ZVBocmFzZSgnMjAxNi0wMi0yOVQxNjowNTozNS4wMTdaJyk7XG4vL21vbmdvZGJDb250cm9sbGVyLnRlbGxYbW0oJ2FueXRoaW5nJyk7XG4vKlxubW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2dtbU1vZGVscycpO1xubW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ2hobW1Nb2RlbHMnKTtcbm1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdnbW1QaHJhc2VzJyk7XG5tb25nb2RiQ29udHJvbGxlci5kZWxldGVDb2xsZWN0aW9uKCd3aW1sZGInLCAnaGhtbVBocmFzZXMnKTtcbi8vKi9cblxuLypcbnJlcG92aXp6Q2xpZW50LmRhdGFwYWNrcygpXG5cdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coZGF0YS5sZW5ndGgpO1xuXHR9KVxuXHQuY2F0Y2goKGVycm9yKSA9PiB7XG5cdFx0Y29uc29sZS5lcnJvcihlcnJvcik7XG5cdH0pO1xuLy8qL1xuXG5jb25zdCBwb3J0ID0gMzAwMDtcbnNlcnZlci5saXN0ZW4ocG9ydCwgZnVuY3Rpb24oKSB7XG5cdGNvbnNvbGUubG9nKGBzZXJ2ZXIgbGlzdGVuIG9uIGh0dHA6Ly8xMjcuMC4wLjE6JHtwb3J0fWApO1xufSk7XG4vL2FwcC5saXN0ZW4ocG9ydCk7XG4iXX0=