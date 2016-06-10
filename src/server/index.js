// ----------------------------- regular http server :
import http from 'http';
//import request from 'request';
// ----------------------------- connect stuff :
import connect from 'connect';
import render from 'connect-render';
import serveStatic from 'serve-static';
import cookieSession from 'cookie-session';
import busboy from 'connect-busboy';
// ----------------------------- socket.io :
import iomodule from 'socket.io';
// ----------------------------- mongodb driver :
import mongodb from 'mongodb';
import assert from 'assert';
import MongoDBController from './mongodb-controller';
// ----------------------------- launch binaries :
import child_process from 'child_process';
// ----------------------------- for static html files and file upload :
import fs from 'fs';
//------------------------------
import RepovizzClient from './repovizz-client';

const app = connect();
const mongodbController = new MongoDBController();
const repovizzClient = new RepovizzClient();

// in case we want to serve static files
app.use(serveStatic('public'));
//app.use(busboy({ headers: req.headers }));
app.use(busboy());

app.use(cookieSession({
	name: 'session',
	keys: ['key1', 'key2']
}));

app.use(render({
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

let cnt = 1;

//================================= ROUTES ==================================//

app.use('/wiml-gmm', (req, res, next) => {
	res.render('wiml-gmm.html', { appName: 'wiml-gmm', clientType: 'wiml-gmm'});
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

app.use('/wiml-gmm-admin', (req, res, next) => {

	//res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin', upload: uploadState});
	res.render('wiml-gmm-admin.html', { appName: 'wiml-gmm-admin', clientType: 'wiml-gmm-admin' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);

	let uploadState = 'none';

	if(req.busboy) {
		var filesNames = [];

		req.pipe(req.busboy);
		uploadState = 'failed';

		req.busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
			var ws = fs.createWriteStream('./public/uploads/phrases/' + filename, {flags: "a"});
	    	file.pipe(ws);
	    	filesNames.push(filename);
	    	console.log(filename);
		});
	  	req.busboy.on('field', function(key, value, keyTruncated, valueTruncated) {
    		// ... 
    		console.log('field event fired');
  		});
		req.busboy.on('finish', function() {
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

app.use('/wiml-hhmm', (req, res, next) => {
	res.render('wiml-hhmm.html', { appName: 'wiml-hhmm', clientType: 'wiml-hhmm'});
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

app.use('/wiml-hhmm-admin', (req, res, next) => {
	//res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin', upload: uploadState});
	res.render('wiml-hhmm-admin.html', { appName: 'wiml-hhmm-admin', clientType: 'wiml-hhmm-admin' });
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

app.use('/sensor-test', (req, res, next) => {
	res.render('sensor-test.html', { appName: 'sensor-test', clientType: 'sensor-test'});
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

// default route : leave it after any other route declarations
app.use((req, res, next) => {
	res.render('index.html', { appName: 'index', clientType: 'index'});
	req.session.id = req.session.id || ++cnt;
	console.log(req.session.id);
});

let server = http.createServer(app);
let io = iomodule(server);

//================================= SOCKETS =================================//

const clientSockets = [];
const nsp_client = io.of('/wiml-gmm');
const trainingConfig = {
	labels: ['Still', 'Shuffle', 'Walk', 'Run', 'Hop', 'Stagger', 'Ninja'],
	column_names: ['magnitude', 'frequency', 'periodicity'],
	//gaussians: 1
};

// instead of io.on('connection', function(client) { .. });
nsp_client.on('connection', (socket) => {
	
	socket.mongo = new MongoDBController({ parentid: socket.id });

	clientSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', () => {
		console.log('client ' + socket.id + ' disconnected');
		clientSockets.splice(clientSockets.indexOf(socket), 1);
	});

	// get model on first connection
	socket.mongo.getModels('wimldb', 'gmmModels')
	.then((data) => {
		//console.log(data);
		socket.emit('models', { models: data, message: 'here are your models' });
	})
	.catch((err) => {
		socket.emit('models', { message: 'problem retrieving models' });
	})


	socket.on('writePhrase', (data) => {
		console.log('client ' + socket.id + ' said : writePhrase !');
		//console.log(data);
		socket.mongo.writeToDatabase('wimldb', 'gmmPhrases', data);
		for(let i=0; i<adminSockets.length; i++) {
			adminSockets[i].refresh();
		}
	});

	socket.on('trainModels', (data) => {

		socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', hhmmTrainingConfig)
		.then((data) => {
			console.log('train result : ' + data);
			if(data === 'ok') {
				socket.mongo.getModels('wimldb', 'gmmModels')
				.then((data) => {
					console.log(data);
					socket.emit('models', { models: data, message: 'here are your models' });
				})
				.catch((err) => {
					socket.emit('models', { message: 'problem retrieving models' });
				});
			} else {
				// xmm-server-tool return an error code
				console.log(data);
				socket.emit('models', { message: 'problem training models' });
			}
		})
		.catch((err) => {
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

const hhmmSockets = [];
const nsp_hhmm = io.of('/wiml-hhmm');
const hhmmTrainingConfig = {
	labels: ['Half-turn', 'Go-low', 'Jump', 'Kata1', 'Kata2', 'Kata3', 'Kata4'],
	column_names: ['accelX', 'accelY', 'accelZ', 'rotX', 'rotY', 'rotZ'],
	//gaussians: 1
};

// instead of io.on('connection', function(client) { .. });
nsp_hhmm.on('connection', (socket) => {
	
	socket.mongo = new MongoDBController({ parentid: socket.id });

	hhmmSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', () => {
		console.log('client ' + socket.id + ' disconnected');
		hhmmSockets.splice(hhmmSockets.indexOf(socket), 1);
	});

	// get model on first connection
	socket.mongo.getModels('wimldb', 'hhmmModels')
	.then((data) => {
		//console.log(data);
		socket.emit('models', { models: data, message: 'here are your models' });
	})
	.catch((err) => {
		socket.emit('models', { message: 'problem retrieving models' });
	})


	socket.on('writePhrase', (data) => {
		console.log('client ' + socket.id + ' said : writePhrase !');
		console.log(data);
		socket.mongo.writeToDatabase('wimldb', 'hhmmPhrases', data);
		for(let i=0; i<hhmmAdminSockets.length; i++) {
			hhmmAdminSockets[i].refresh();
		}
	});

	socket.on('trainModels', (data) => {
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

		socket.mongo.trainModels('hhmm', 'wimldb', 'hhmmPhrases', 'hhmmModels', hhmmTrainingConfig)
		.then((data) => {
			console.log('train result : ' + data);
			if(data === 'ok') {
				socket.mongo.getModels('wimldb', 'hhmmModels')
				.then((data) => {
					console.log(data);
					socket.emit('models', { models: data, message: 'here are your models' });
				})
				.catch((err) => {
					socket.emit('models', { message: 'problem retrieving models' });
				});
			} else {
				// xmm-server-tool return an error code
				console.log(data);
				socket.emit('models', { message: 'problem training models' });
			}
		})
		.catch((err) => {
			console.log('training problem');
			// if we arrive here that means that xmm-server-tool crashed
			socket.emit('models', { message: 'xmm-server-tool seems to be down' });
		});
	});

});

//=======================================================================//

const adminSockets = [];
const nsp_admin = io.of('/wiml-gmm-admin');

nsp_admin.on('connection', (socket) => {

	socket.refresh = () => {
		mongodbController.getModels('wimldb', 'gmmPhrases')
		.then((data) => {
			socket.emit('phrases', { phrases: data, message: 'here are your phrases' });
		})
		.catch((err) => console.error(err));
	}

	adminSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', () => {
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

	socket.on('refreshPhrases', (data) => {
		socket.refresh();
		// mongodbController.getModels('wimldb', 'phrases')
		// .then((p) => {
		// 	socket.emit('phrases', { phrases: p, message: 'here are your phrases' });
		// })
		// .catch((err) => console.error(err));
	});

	socket.on('clearModels', (data) => {
		mongodbController.deleteCollection('wimldb', 'gmmModels');
		socket.emit('clear', { message: 'clear models done' });
	});

	socket.on('clearPhrases', (data) => {
		mongodbController.deleteCollection('wimldb', 'gmmPhrases');
		socket.emit('clear', { message: 'clear phrases done' });
	});

	socket.on('clearAll', (data) => {
		mongodbController.deleteCollection('wimldb', 'gmmModels');
		mongodbController.deleteCollection('wimldb', 'gmmPhrases');
		//socket.emit('clear', { message: 'clear all done' });
		for(let i=0; i<adminSockets.length; i++) {
			adminSockets[i].emit('clear', { message: 'clear all done' });
		}
	});
});

//=======================================================================//

const hhmmAdminSockets = [];
const nsp_hhmmadmin = io.of('/wiml-hhmm-admin');

nsp_hhmmadmin.on('connection', (socket) => {

	socket.refresh = () => {
		mongodbController.getModels('wimldb', 'hhmmPhrases')
		.then((data) => {
			socket.emit('phrases', { phrases: data, message: 'here are your phrases' });
		})
		.catch((err) => console.error(err));
	}

	hhmmAdminSockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', () => {
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

	socket.on('refreshPhrases', (data) => {
		socket.refresh();
		// mongodbController.getModels('wimldb', 'phrases')
		// .then((p) => {
		// 	socket.emit('phrases', { phrases: p, message: 'here are your phrases' });
		// })
		// .catch((err) => console.error(err));
	});

	socket.on('clearModels', (data) => {
		mongodbController.deleteCollection('wimldb', 'hhmmModels');
		socket.emit('clear', { message: 'clear models done' });
	});

	socket.on('clearPhrases', (data) => {
		mongodbController.deleteCollection('wimldb', 'hhmmPhrases');
		socket.emit('clear', { message: 'clear phrases done' });
	});

	socket.on('clearAll', (data) => {
		mongodbController.deleteCollection('wimldb', 'hhmmModels');
		mongodbController.deleteCollection('wimldb', 'hhmmPhrases');
		//socket.emit('clear', { message: 'clear all done' });
		for(let i=0; i<hhmmAdminSockets.length; i++) {
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

const port = 3000;
server.listen(port, function() {
	console.log(`server listen on http://127.0.0.1:${port}`);
});
//app.listen(port);
