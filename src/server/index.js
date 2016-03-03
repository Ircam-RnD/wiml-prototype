// ----------------------------- regular http server :
import http from 'http';
// ----------------------------- connect stuff :
import connect from 'connect';
import render from 'connect-render';
import serveStatic from 'serve-static';
// ----------------------------- socket.io :
import iomodule from 'socket.io';
// ----------------------------- mongodb driver :
import mongodb from 'mongodb';
import assert from 'assert';
import MongoDBController from './mongodb-controller';
// ----------------------------- launch binaries :
import child_process from 'child_process';
// ----------------------------- for static html files :
//import fs from 'fs';

const app = connect();
const mongodbController = new MongoDBController();

// in case we want to serve static files
app.use(serveStatic('public'));

app.use(render({
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

app.use('/wiml-admin', (req, res) => {
	res.render('wiml-admin.html', { appName: 'wiml-admin', clientType: 'wiml-admin'});
});

app.use('/wiml-client', (req, res) => {
	res.render('wiml-client.html', { appName: 'wiml-client', clientType: 'wiml-client'});
});

// default route : leave it after any other routes declarations
app.use((req, res) => {
	res.render('index.html', { appName: 'index', clientType: 'index'});
});

let server = http.createServer(app);
let io = iomodule(server);

//================================= SOCKETS =================================//

const sockets = [];
const nsp_client = io.of('/wiml-client');
const trainingConfig = {
	labels: ['Still', 'Shuffle', 'Walk', 'Run', 'Hop', 'Stagger', 'Ninja'],
	column_names: ['magnitude', 'frequency', 'periodicity'],
	gaussians: 3
};

// instead of io.on('connection', function(client) { .. });
nsp_client.on('connection', (socket) => {
	
	socket.mongo = new MongoDBController({ parentid: socket.id });

	sockets.push(socket);
	console.log('client ' + socket.id + ' connected');
	socket.on('disconnect', () => {
		console.log('client ' + socket.id + ' disconnected');
		sockets.splice(sockets.indexOf(socket), 1);
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
	});

	socket.on('trainModels', (data) => {
		socket.mongo.trainModels('wimldb', 'phrases', 'models', trainingConfig)
		.then((data => {
			console.log(data);
			if(data === 'ok') {
				socket.mongo.getModels('wimldb', 'models')
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
			socket.emit('models', { message: 'xmm-server-tool seems to be crashed' });
		});
	});

});



const nsp_admin = io.of('/wiml-admin');

nsp_admin.on('connection', (socket) => {

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

const port = 3000;
server.listen(port, function() {
	console.log(`server listen on http://127.0.0.1:${port}`);
});
//app.listen(port);
