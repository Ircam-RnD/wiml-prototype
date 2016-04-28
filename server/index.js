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

app.use('/wiml-admin', function (req, res, next) {

	//res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin', upload: uploadState});
	res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin' });
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

app.use('/wiml-client', function (req, res, next) {
	res.render('wiml-client.html', { appName: 'wiml-client', clientType: 'wiml-client' });
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
mongodbController.printModels();
//mongodbController.printPhrases('Run');
mongodbController.printPhrases();
//mongodbController.removePhrase('2016-02-29T16:05:35.017Z');
//mongodbController.tellXmm('anything');
//mongodbController.deleteCollection('wimldb', 'models');

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7b0JBQ2lCLE1BQU07Ozs7Ozt1QkFHSCxTQUFTOzs7OzZCQUNWLGdCQUFnQjs7OzsyQkFDWCxjQUFjOzs7OzZCQUNaLGdCQUFnQjs7Ozs2QkFDdkIsZ0JBQWdCOzs7Ozt3QkFFZCxXQUFXOzs7Ozt1QkFFWixTQUFTOzs7O3NCQUNWLFFBQVE7Ozs7aUNBQ0csc0JBQXNCOzs7Ozs2QkFFMUIsZUFBZTs7Ozs7a0JBRTFCLElBQUk7Ozs7Ozs4QkFFUSxtQkFBbUI7Ozs7QUFFOUMsSUFBTSxHQUFHLEdBQUcsMkJBQVMsQ0FBQztBQUN0QixJQUFNLGlCQUFpQixHQUFHLG9DQUF1QixDQUFDO0FBQ2xELElBQU0sY0FBYyxHQUFHLGlDQUFvQixDQUFDOzs7QUFHNUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyw4QkFBWSxRQUFRLENBQUMsQ0FBQyxDQUFDOztBQUUvQixHQUFHLENBQUMsR0FBRyxDQUFDLGlDQUFRLENBQUMsQ0FBQzs7QUFFbEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQ0FBYztBQUNyQixLQUFJLEVBQUUsU0FBUztBQUNmLEtBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7Q0FDdEIsQ0FBQyxDQUFDLENBQUM7O0FBRUosR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQ0FBTztBQUNkLEtBQUksRUFBRSxTQUFTLEdBQUcsV0FBVztBQUM3QixPQUFNLEVBQUUsYUFBYTtBQUNyQixNQUFLLEVBQUUsSUFBSTtBQUNYLFFBQU8sRUFBRTs7Ozs7Ozs7O0VBU1I7Q0FDRCxDQUFDLENBQUMsQ0FBQzs7QUFFSixJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7Ozs7QUFJWixHQUFHLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFLOzs7QUFHMUMsSUFBRyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLE9BQU8sRUFB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QUUsT0FBTyxFQUFFLG9CQUFvQixFQUFFLENBQUMsQ0FBQztFQUN4RCxDQUFDLENBQUM7O0FBRUgsT0FBTSxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDL0IsbUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQ3ZELG1CQUFpQixDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxTQUFTLENBQUMsQ0FBQzs7QUFFeEQsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEMsZUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO0dBQzdEO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQyxDQUFDOzs7QUFJSCxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQzs7QUFFaEMsaUJBQWlCLENBQUMsWUFBWSxFQUFFLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQWVqQyxJQUFNLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsWUFBVztBQUM5QixRQUFPLENBQUMsR0FBRyx3Q0FBc0MsSUFBSSxDQUFHLENBQUM7Q0FDekQsQ0FBQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSByZWd1bGFyIGh0dHAgc2VydmVyIDpcbmltcG9ydCBodHRwIGZyb20gJ2h0dHAnO1xuLy9pbXBvcnQgcmVxdWVzdCBmcm9tICdyZXF1ZXN0Jztcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGNvbm5lY3Qgc3R1ZmYgOlxuaW1wb3J0IGNvbm5lY3QgZnJvbSAnY29ubmVjdCc7XG5pbXBvcnQgcmVuZGVyIGZyb20gJ2Nvbm5lY3QtcmVuZGVyJztcbmltcG9ydCBzZXJ2ZVN0YXRpYyBmcm9tICdzZXJ2ZS1zdGF0aWMnO1xuaW1wb3J0IGNvb2tpZVNlc3Npb24gZnJvbSAnY29va2llLXNlc3Npb24nO1xuaW1wb3J0IGJ1c2JveSBmcm9tICdjb25uZWN0LWJ1c2JveSc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzb2NrZXQuaW8gOlxuaW1wb3J0IGlvbW9kdWxlIGZyb20gJ3NvY2tldC5pbyc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtb25nb2RiIGRyaXZlciA6XG5pbXBvcnQgbW9uZ29kYiBmcm9tICdtb25nb2RiJztcbmltcG9ydCBhc3NlcnQgZnJvbSAnYXNzZXJ0JztcbmltcG9ydCBNb25nb0RCQ29udHJvbGxlciBmcm9tICcuL21vbmdvZGItY29udHJvbGxlcic7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBsYXVuY2ggYmluYXJpZXMgOlxuaW1wb3J0IGNoaWxkX3Byb2Nlc3MgZnJvbSAnY2hpbGRfcHJvY2Vzcyc7XG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBmb3Igc3RhdGljIGh0bWwgZmlsZXMgYW5kIGZpbGUgdXBsb2FkIDpcbmltcG9ydCBmcyBmcm9tICdmcyc7XG4vLy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuaW1wb3J0IFJlcG92aXp6Q2xpZW50IGZyb20gJy4vcmVwb3ZpenotY2xpZW50JztcblxuY29uc3QgYXBwID0gY29ubmVjdCgpO1xuY29uc3QgbW9uZ29kYkNvbnRyb2xsZXIgPSBuZXcgTW9uZ29EQkNvbnRyb2xsZXIoKTtcbmNvbnN0IHJlcG92aXp6Q2xpZW50ID0gbmV3IFJlcG92aXp6Q2xpZW50KCk7XG5cbi8vIGluIGNhc2Ugd2Ugd2FudCB0byBzZXJ2ZSBzdGF0aWMgZmlsZXNcbmFwcC51c2Uoc2VydmVTdGF0aWMoJ3B1YmxpYycpKTtcbi8vYXBwLnVzZShidXNib3koeyBoZWFkZXJzOiByZXEuaGVhZGVycyB9KSk7XG5hcHAudXNlKGJ1c2JveSgpKTtcblxuYXBwLnVzZShjb29raWVTZXNzaW9uKHtcblx0bmFtZTogJ3Nlc3Npb24nLFxuXHRrZXlzOiBbJ2tleTEnLCAna2V5MiddXG59KSk7XG5cbmFwcC51c2UocmVuZGVyKHtcblx0cm9vdDogX19kaXJuYW1lICsgJy8uLi92aWV3cycsXG5cdGxheW91dDogJ2xheW91dC5odG1sJyxcblx0Y2FjaGU6IHRydWUsIC8vc2V0IHRvIHRydWUgaW4gcHJvZFxuXHRoZWxwZXJzOiB7XG5cdFx0Ly9kZWZhdWx0VHlwZTogJ2luZGV4Jyxcblx0XHQvL2Fzc2V0c0RvbWFpbjogJ3B1YmxpYycsXG5cdFx0Lypcblx0XHRzdGFydHRpbWU6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuXHRcdG5vdzogZnVuY3Rpb24ocmVxLCByZXMpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpO1xuXHRcdH1cblx0XHQvLyovXG5cdH1cbn0pKTtcblxubGV0IGNudCA9IDE7XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09IFJPVVRFUyA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuYXBwLnVzZSgnL3dpbWwtYWRtaW4nLCAocmVxLCByZXMsIG5leHQpID0+IHtcblxuXHQvL3Jlcy5yZW5kZXIoJ3dpbWwtYWRtaW4uaHRtbCcsIHsgYXBwTmFtZTogJ3dpbWwtYWRtaW4nLCBjbGllbnRUeXBlOiAnd2ltbC1hZG1pbicsIHVwbG9hZDogdXBsb2FkU3RhdGV9KTtcblx0cmVzLnJlbmRlcignd2ltbC1hZG1pbi5odG1sJywgeyBhcHBOYW1lOiAnd2ltbC1hZG1pbicsIGNsaWVudFR5cGU6ICd3aW1sLWFkbWluJyB9KTtcblx0cmVxLnNlc3Npb24uaWQgPSByZXEuc2Vzc2lvbi5pZCB8fCArK2NudDtcblx0Y29uc29sZS5sb2cocmVxLnNlc3Npb24uaWQpO1xuXG5cdGxldCB1cGxvYWRTdGF0ZSA9ICdub25lJztcblxuXHRpZihyZXEuYnVzYm95KSB7XG5cdFx0dmFyIGZpbGVzTmFtZXMgPSBbXTtcblxuXHRcdHJlcS5waXBlKHJlcS5idXNib3kpO1xuXHRcdHVwbG9hZFN0YXRlID0gJ2ZhaWxlZCc7XG5cblx0XHRyZXEuYnVzYm95Lm9uKCdmaWxlJywgZnVuY3Rpb24oZmllbGRuYW1lLCBmaWxlLCBmaWxlbmFtZSwgZW5jb2RpbmcsIG1pbWV0eXBlKSB7XG5cdFx0XHR2YXIgd3MgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSgnLi9wdWJsaWMvdXBsb2Fkcy9waHJhc2VzLycgKyBmaWxlbmFtZSwge2ZsYWdzOiBcImFcIn0pO1xuXHQgICAgXHRmaWxlLnBpcGUod3MpO1xuXHQgICAgXHRmaWxlc05hbWVzLnB1c2goZmlsZW5hbWUpO1xuXHQgICAgXHRjb25zb2xlLmxvZyhmaWxlbmFtZSk7XG5cdFx0fSk7XG5cdCAgXHRyZXEuYnVzYm95Lm9uKCdmaWVsZCcsIGZ1bmN0aW9uKGtleSwgdmFsdWUsIGtleVRydW5jYXRlZCwgdmFsdWVUcnVuY2F0ZWQpIHtcbiAgICBcdFx0Ly8gLi4uIFxuICAgIFx0XHRjb25zb2xlLmxvZygnZmllbGQgZXZlbnQgZmlyZWQnKTtcbiAgXHRcdH0pO1xuXHRcdHJlcS5idXNib3kub24oJ2ZpbmlzaCcsIGZ1bmN0aW9uKCkge1xuXHQgICAgICAgIC8vIHJlcy53cml0ZUhlYWQoMjAwLCB7J0Nvbm5lY3Rpb24nOiAnY2xvc2UnfSk7XG4gICAgXHQgICAgLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBmaWxlc05hbWVzLmxlbmd0aDsgaSsrKVxuICAgICAgICBcdC8vIHtcbiAgICAgICAgIC8vICAgIFx0cmVzLndyaXRlKGZpbGVzTmFtZXNbaV0gKyBcIlxcblwiKTtcbiAgICAgICAgXHQvLyB9XG4gICAgICAgIFx0Ly8gY29uc29sZS5sb2coXCJidXNib3kgZG9uZVwiKTtcbiAgICAgICAgXHQvLyByZXMuZW5kKFwiRG9uZS4uXCIpO1x0XG4gICAgICAgIFx0dXBsb2FkU3RhdGUgPSAnc3VjY2VlZGVkJztcdFxuXHRcdH0pO1xuXHR9XG59KTtcblxuYXBwLnVzZSgnL3dpbWwtY2xpZW50JywgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XG5cdHJlcy5yZW5kZXIoJ3dpbWwtY2xpZW50Lmh0bWwnLCB7IGFwcE5hbWU6ICd3aW1sLWNsaWVudCcsIGNsaWVudFR5cGU6ICd3aW1sLWNsaWVudCd9KTtcblx0cmVxLnNlc3Npb24uaWQgPSByZXEuc2Vzc2lvbi5pZCB8fCArK2NudDtcblx0Y29uc29sZS5sb2cocmVxLnNlc3Npb24uaWQpO1xufSk7XG5cbmFwcC51c2UoJy9zZW5zb3ItdGVzdCcsIChyZXEsIHJlcywgbmV4dCkgPT4ge1xuXHRyZXMucmVuZGVyKCdzZW5zb3ItdGVzdC5odG1sJywgeyBhcHBOYW1lOiAnc2Vuc29yLXRlc3QnLCBjbGllbnRUeXBlOiAnc2Vuc29yLXRlc3QnfSk7XG5cdHJlcS5zZXNzaW9uLmlkID0gcmVxLnNlc3Npb24uaWQgfHwgKytjbnQ7XG5cdGNvbnNvbGUubG9nKHJlcS5zZXNzaW9uLmlkKTtcbn0pO1xuXG4vLyBkZWZhdWx0IHJvdXRlIDogbGVhdmUgaXQgYWZ0ZXIgYW55IG90aGVyIHJvdXRlIGRlY2xhcmF0aW9uc1xuYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcblx0cmVzLnJlbmRlcignaW5kZXguaHRtbCcsIHsgYXBwTmFtZTogJ2luZGV4JywgY2xpZW50VHlwZTogJ2luZGV4J30pO1xuXHRyZXEuc2Vzc2lvbi5pZCA9IHJlcS5zZXNzaW9uLmlkIHx8ICsrY250O1xuXHRjb25zb2xlLmxvZyhyZXEuc2Vzc2lvbi5pZCk7XG59KTtcblxubGV0IHNlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKGFwcCk7XG5sZXQgaW8gPSBpb21vZHVsZShzZXJ2ZXIpO1xuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PSBTT0NLRVRTID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PS8vXG5cbmNvbnN0IGNsaWVudFNvY2tldHMgPSBbXTtcbmNvbnN0IG5zcF9jbGllbnQgPSBpby5vZignL3dpbWwtY2xpZW50Jyk7XG5jb25zdCB0cmFpbmluZ0NvbmZpZyA9IHtcblx0bGFiZWxzOiBbJ1N0aWxsJywgJ1NodWZmbGUnLCAnV2FsaycsICdSdW4nLCAnSG9wJywgJ1N0YWdnZXInLCAnTmluamEnXSxcblx0Y29sdW1uX25hbWVzOiBbJ21hZ25pdHVkZScsICdmcmVxdWVuY3knLCAncGVyaW9kaWNpdHknXSxcblx0Z2F1c3NpYW5zOiAxXG59O1xuXG4vLyBpbnN0ZWFkIG9mIGlvLm9uKCdjb25uZWN0aW9uJywgZnVuY3Rpb24oY2xpZW50KSB7IC4uIH0pO1xubnNwX2NsaWVudC5vbignY29ubmVjdGlvbicsIChzb2NrZXQpID0+IHtcblx0XG5cdHNvY2tldC5tb25nbyA9IG5ldyBNb25nb0RCQ29udHJvbGxlcih7IHBhcmVudGlkOiBzb2NrZXQuaWQgfSk7XG5cblx0Y2xpZW50U29ja2V0cy5wdXNoKHNvY2tldCk7XG5cdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgY29ubmVjdGVkJyk7XG5cdHNvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGRpc2Nvbm5lY3RlZCcpO1xuXHRcdGNsaWVudFNvY2tldHMuc3BsaWNlKGNsaWVudFNvY2tldHMuaW5kZXhPZihzb2NrZXQpLCAxKTtcblx0fSk7XG5cblx0Ly8gZ2V0IG1vZGVsIG9uIGZpcnN0IGNvbm5lY3Rpb25cblx0c29ja2V0Lm1vbmdvLmdldE1vZGVscygnd2ltbGRiJywgJ21vZGVscycpXG5cdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0Ly9jb25zb2xlLmxvZyhkYXRhKTtcblx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtb2RlbHM6IGRhdGEsIG1lc3NhZ2U6ICdoZXJlIGFyZSB5b3VyIG1vZGVscycgfSk7XG5cdH0pXG5cdC5jYXRjaCgoZXJyKSA9PiB7XG5cdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3Byb2JsZW0gcmV0cmlldmluZyBtb2RlbHMnIH0pO1xuXHR9KVxuXG5cblx0c29ja2V0Lm9uKCd3cml0ZVBocmFzZScsIChkYXRhKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ2NsaWVudCAnICsgc29ja2V0LmlkICsgJyBzYWlkIDogd3JpdGVQaHJhc2UgIScpO1xuXHRcdC8vY29uc29sZS5sb2coZGF0YSk7XG5cdFx0c29ja2V0Lm1vbmdvLndyaXRlVG9EYXRhYmFzZSgnd2ltbGRiJywgJ3BocmFzZXMnLCBkYXRhKTtcblx0XHRmb3IobGV0IGk9MDsgaTxhZG1pblNvY2tldHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGFkbWluU29ja2V0c1tpXS5yZWZyZXNoKCk7XG5cdFx0fVxuXHR9KTtcblxuXHRzb2NrZXQub24oJ3RyYWluTW9kZWxzJywgKGRhdGEpID0+IHtcblx0XHRzb2NrZXQubW9uZ28udHJhaW5Nb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJywgJ21vZGVscycsIHRyYWluaW5nQ29uZmlnKVxuXHRcdC50aGVuKChkYXRhID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0aWYoZGF0YSA9PT0gJ29rJykge1xuXHRcdFx0XHRzb2NrZXQubW9uZ28uZ2V0TW9kZWxzKCd3aW1sZGInLCAnbW9kZWxzJylcblx0XHRcdFx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEpO1xuXHRcdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1vZGVsczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgbW9kZWxzJyB9KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdFx0XHRzb2NrZXQuZW1pdCgnbW9kZWxzJywgeyBtZXNzYWdlOiAncHJvYmxlbSByZXRyaWV2aW5nIG1vZGVscycgfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8geG1tLXNlcnZlci10b29sIHJldHVybiBhbiBlcnJvciBjb2RlXG5cdFx0XHRcdHNvY2tldC5lbWl0KCdtb2RlbHMnLCB7IG1lc3NhZ2U6ICdwcm9ibGVtIHRyYWluaW5nIG1vZGVscycgfSk7XG5cdFx0XHR9XG5cdFx0fSkpXG5cdFx0LmNhdGNoKChlcnIpID0+IHtcblx0XHRcdC8vIGlmIHdlIGFycml2ZSBoZXJlIHRoYXQgbWVhbnMgdGhhdCB4bW0tc2VydmVyLXRvb2wgY3Jhc2hlZFxuXHRcdFx0c29ja2V0LmVtaXQoJ21vZGVscycsIHsgbWVzc2FnZTogJ3htbS1zZXJ2ZXItdG9vbCBzZWVtcyB0byBiZSBjcmFzaGVkJyB9KTtcblx0XHR9KTtcblx0fSk7XG5cbn0pO1xuXG5cblxuY29uc3QgYWRtaW5Tb2NrZXRzID0gW107XG5jb25zdCBuc3BfYWRtaW4gPSBpby5vZignL3dpbWwtYWRtaW4nKTtcblxubnNwX2FkbWluLm9uKCdjb25uZWN0aW9uJywgKHNvY2tldCkgPT4ge1xuXG5cdHNvY2tldC5yZWZyZXNoID0gKCkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnKVxuXHRcdC50aGVuKChkYXRhKSA9PiB7XG5cdFx0XHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogZGF0YSwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdFx0fSlcblx0XHQuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcblx0fVxuXG5cdGFkbWluU29ja2V0cy5wdXNoKHNvY2tldCk7XG5cdGNvbnNvbGUubG9nKCdjbGllbnQgJyArIHNvY2tldC5pZCArICcgY29ubmVjdGVkJyk7XG5cdHNvY2tldC5vbignZGlzY29ubmVjdCcsICgpID0+IHtcblx0XHRjb25zb2xlLmxvZygnY2xpZW50ICcgKyBzb2NrZXQuaWQgKyAnIGRpc2Nvbm5lY3RlZCcpO1xuXHRcdGFkbWluU29ja2V0cy5zcGxpY2UoYWRtaW5Tb2NrZXRzLmluZGV4T2Yoc29ja2V0KSwgMSk7XG5cdH0pO1xuXG5cdC8vIHNlbmQgcGhyYXNlcyB0byBidWlsZCBVSSA6XG5cdC8vIG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnKVxuXHQvLyAudGhlbigoZGF0YSkgPT4ge1xuXHQvLyBcdHNvY2tldC5lbWl0KCdwaHJhc2VzJywgeyBwaHJhc2VzOiBkYXRhLCBtZXNzYWdlOiAnaGVyZSBhcmUgeW91ciBwaHJhc2VzJyB9KTtcblx0Ly8gfSlcblx0Ly8gLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyKSk7XG5cblx0c29ja2V0LnJlZnJlc2goKTtcblxuXHRzb2NrZXQub24oJ3JlZnJlc2hQaHJhc2VzJywgKGRhdGEpID0+IHtcblx0XHRzb2NrZXQucmVmcmVzaCgpO1xuXHRcdC8vIG1vbmdvZGJDb250cm9sbGVyLmdldE1vZGVscygnd2ltbGRiJywgJ3BocmFzZXMnKVxuXHRcdC8vIC50aGVuKChwKSA9PiB7XG5cdFx0Ly8gXHRzb2NrZXQuZW1pdCgncGhyYXNlcycsIHsgcGhyYXNlczogcCwgbWVzc2FnZTogJ2hlcmUgYXJlIHlvdXIgcGhyYXNlcycgfSk7XG5cdFx0Ly8gfSlcblx0XHQvLyAuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIpKTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhck1vZGVscycsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ21vZGVscycpO1xuXHRcdHNvY2tldC5lbWl0KCdjbGVhcicsIHsgbWVzc2FnZTogJ2NsZWFyIG1vZGVscyBkb25lJyB9KTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhclBocmFzZXMnLCAoZGF0YSkgPT4ge1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdwaHJhc2VzJyk7XG5cdFx0c29ja2V0LmVtaXQoJ2NsZWFyJywgeyBtZXNzYWdlOiAnY2xlYXIgcGhyYXNlcyBkb25lJyB9KTtcblx0fSk7XG5cblx0c29ja2V0Lm9uKCdjbGVhckFsbCcsIChkYXRhKSA9PiB7XG5cdFx0bW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ21vZGVscycpO1xuXHRcdG1vbmdvZGJDb250cm9sbGVyLmRlbGV0ZUNvbGxlY3Rpb24oJ3dpbWxkYicsICdwaHJhc2VzJyk7XG5cdFx0Ly9zb2NrZXQuZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBhbGwgZG9uZScgfSk7XG5cdFx0Zm9yKGxldCBpPTA7IGk8YWRtaW5Tb2NrZXRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRhZG1pblNvY2tldHNbaV0uZW1pdCgnY2xlYXInLCB7IG1lc3NhZ2U6ICdjbGVhciBhbGwgZG9uZScgfSk7XG5cdFx0fVxuXHR9KTtcbn0pO1xuXG5cbi8vbW9uZ29kYkNvbnRyb2xsZXIudHJhaW5Nb2RlbHMoJ3dpbWxkYicsICdwaHJhc2VzJywgJ21vZGVscycsIHRyYWluaW5nQ29uZmlnKTtcbm1vbmdvZGJDb250cm9sbGVyLnByaW50TW9kZWxzKCk7XG4vL21vbmdvZGJDb250cm9sbGVyLnByaW50UGhyYXNlcygnUnVuJyk7XG5tb25nb2RiQ29udHJvbGxlci5wcmludFBocmFzZXMoKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIucmVtb3ZlUGhyYXNlKCcyMDE2LTAyLTI5VDE2OjA1OjM1LjAxN1onKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIudGVsbFhtbSgnYW55dGhpbmcnKTtcbi8vbW9uZ29kYkNvbnRyb2xsZXIuZGVsZXRlQ29sbGVjdGlvbignd2ltbGRiJywgJ21vZGVscycpO1xuXG4vKlxucmVwb3ZpenpDbGllbnQuZGF0YXBhY2tzKClcblx0LnRoZW4oKGRhdGEpID0+IHtcblx0XHRjb25zb2xlLmxvZyhkYXRhLmxlbmd0aCk7XG5cdH0pXG5cdC5jYXRjaCgoZXJyb3IpID0+IHtcblx0XHRjb25zb2xlLmVycm9yKGVycm9yKTtcblx0fSk7XG4vLyovXG5cbmNvbnN0IHBvcnQgPSAzMDAwO1xuc2VydmVyLmxpc3Rlbihwb3J0LCBmdW5jdGlvbigpIHtcblx0Y29uc29sZS5sb2coYHNlcnZlciBsaXN0ZW4gb24gaHR0cDovLzEyNy4wLjAuMToke3BvcnR9YCk7XG59KTtcbi8vYXBwLmxpc3Rlbihwb3J0KTtcbiJdfQ==