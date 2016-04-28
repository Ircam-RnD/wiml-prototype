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

app.use('/wiml-admin', (req, res, next) => {

	//res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin', upload: uploadState});
	res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin' });
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

app.use('/wiml-client', (req, res, next) => {
	res.render('wiml-client.html', { appName: 'wiml-client', clientType: 'wiml-client'});
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
const nsp_client = io.of('/wiml-client');
const trainingConfig = {
	labels: ['Still', 'Shuffle', 'Walk', 'Run', 'Hop', 'Stagger', 'Ninja'],
	column_names: ['magnitude', 'frequency', 'periodicity'],
	gaussians: 1
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
	socket.mongo.getModels('wimldb', 'models')
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
		socket.mongo.writeToDatabase('wimldb', 'phrases', data);
		for(let i=0; i<adminSockets.length; i++) {
			adminSockets[i].refresh();
		}
	});

	socket.on('trainModels', (data) => {
		socket.mongo.trainModels('gmm', 'wimldb', 'gmmPhrases', 'gmmModels', trainingConfig)
		.then((data => {
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
		}))
		.catch((err) => {
			// if we arrive here that means that xmm-server-tool crashed
			socket.emit('models', { message: 'xmm-server-tool seems to be down' });
		});
	});

});



const adminSockets = [];
const nsp_admin = io.of('/wiml-admin');

nsp_admin.on('connection', (socket) => {

	socket.refresh = () => {
		mongodbController.getModels('wimldb', 'phrases')
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
		mongodbController.deleteCollection('wimldb', 'models');
		socket.emit('clear', { message: 'clear models done' });
	});

	socket.on('clearPhrases', (data) => {
		mongodbController.deleteCollection('wimldb', 'phrases');
		socket.emit('clear', { message: 'clear phrases done' });
	});

	socket.on('clearAll', (data) => {
		mongodbController.deleteCollection('wimldb', 'models');
		mongodbController.deleteCollection('wimldb', 'phrases');
		//socket.emit('clear', { message: 'clear all done' });
		for(let i=0; i<adminSockets.length; i++) {
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

const port = 3000;
server.listen(port, function() {
	console.log(`server listen on http://127.0.0.1:${port}`);
});
//app.listen(port);
