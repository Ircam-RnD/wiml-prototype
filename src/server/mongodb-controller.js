import mongodb from 'mongodb';
import assert from 'assert';
//import bson from 'bson';
import XmmChildProcess from './xmm-child-process';

const mongoClient = mongodb.MongoClient;
//const BSON = new mongodb.BSONPure.BSON();

export default class MongoDBController {
	constructor(options = {}) {
		const defaults = {
			parentid: 'noid',
			//callback: ((data) => {}),
			url: 'mongodb://localhost',
			port: 27017
		};

		Object.assign(defaults, options);

		this.parentid = defaults.parentid;
		this.url = defaults.url;
		this.port = defaults.port;
		this.fullUrl = this.url + ':' + this.port + '/';
		// just a reference to a single global child process :
		this.childProcess = new XmmChildProcess({ parentid: this.parentid });
	}

	writeToDatabase(dbName, collName, data) {
		mongoClient.connect(this.fullUrl + dbName, (err, db) => {
			let coll = db.collection(collName);
			coll.insertOne(data, (err, r) => {
				assert.equal(null, err);
				assert.equal(1, r.insertedCount);
				db.close();
			});
		});
	}

	tellXmm(message) {
		this.childProcess.tell(message);
	}

	configureModels(modelType, args) {
		return this.childProcess.configureModels(modelType, args);
	}

	trainModels(modelType, dbName, srcCollName, dstCollName, args) {
		return this.childProcess.trainModels(modelType, dbName, srcCollName, dstCollName, args);
	}

	getModels(dbName, collName) {
		let res = [];
		return new Promise((resolve, reject) => {
			//let res = [];
			mongoClient.connect(this.fullUrl + dbName, (err, db) => {
				let cursor = db.collection(collName).find();
				cursor.each((err, doc) => {
					assert.equal(null, err);
					if(doc != null) {
						res.push(doc);
					} else {
						db.close();
						resolve(res);
					}
				});	
			});
		});
	}

	// getPhrases(dbName, collName) {
	// 	let res = [];
	// 	return new Promise((resolve, reject) => {
	// 		mongoClient.connect(this.fullUrl + dbName, (err, db) => {
	// 			let cursor = db.collection()
	// 		});
	// 	});
	// }

	//======================= CLEANUP =======================//

	deleteCollection(dbName, collName) {
		mongoClient.connect(this.fullUrl + dbName, (err, db) => {
			db.collection(collName).drop((err, response) => {
				console.log(response);
				db.close();
			});
		});
	}

	clearPhrases(dbName, collName, label) {
		mongoClient.connect(this.fullUrl + dbName, (err, db) => {
			db.collection(collName).deleteOne({ "label": label }, (err, results) => {
				//console.log(results);
				db.close();
			});
		});	
	}

	//====================== PRINTERS =======================//

	printModels() {
		mongoClient.connect(this.fullUrl + 'wimldb', (err, db) => {
			let cursor = db.collection('models').find();
			cursor.each((err, doc) => {
				assert.equal(null, err);
				if(doc != null) {
					for(let prop in doc) {
						if(doc[prop].length > 1) {
							console.log(JSON.stringify(prop) + ' : ');
							for(let i=0; i<doc[prop].length; i++) {
								//console.log(doc[prop] + ' : ');// + JSON.stringify(doc[prop][i])); // TODO : Stringify only objects
								console.log(doc[prop][i]);
							}
						} else {
							console.log(prop + ' : ' + JSON.stringify(doc[prop]));
						}
					}
				}
				db.close();
			});
		});	
	}

	printPhrases(label = 'Still', phrases = 'gmmPhrases') {
		mongoClient.connect(this.fullUrl + 'wimldb', (err, db) => {
			//console.log('connected to mongodb');
			let cursor = db.collection('gmmPhrases').find();
			cursor.each((err, doc) => {
				assert.equal(null, err);
				if(doc != null) {
					//console.log(doc.toString());

					if(label === '' || doc['label'] === label) {
						for(var prop in doc) {
							console.log(prop + ' : ' + JSON.stringify(doc[prop]));
							//console.log(doc[prop]);
							//console.log(doc['data']);
						}
					}
				}
				db.close();
			});
		});
	}

	removePhrase(date) {
		mongoClient.connect(this.fullUrl + 'wimldb', (err, db) => {
			db.collection('phrases').deleteOne({ "date": date }, (err, results) => {
				//console.log(results);
				db.close();
			});
		});			
	}

};

//==========================================//

/*
let mongoClient = mongodb.MongoClient;
let objectID = mongodb.ObjectID;
const mongoUrl = 'mongodb://localhost:27017/';
const dbName = 'wimldb';

export function writeToDatabase(dbName, collName, data) {
	mongoClient.connect(mongoUrl + dbName, (err, db) => {
		let coll = db.collection(collName);
		coll.insertOne(data, (err, r) => {
			assert.equal(null, err);
			assert.equal(1,r.insertedCount);
			db.close();
		});
	});
}

export function writePhraseToDatabase(data) {
	mongoClient.connect(mongoUrl + dbName, (err, db) => {
		console.log('connected to mongodb');
		let coll = db.collection('phrases');
		coll.insertOne(data, (err, r) => {
			assert.equal(null, err);
			assert.equal(1, r.insertedCount);
			console.log('inserted data into collection \'phrases\'');

			let cursor = db.collection('phrases').find();
			cursor.each((err, doc) => {
				assert.equal(null, err);
				if(doc != null) {
					for(var prop in doc) {
						console.log(prop + ' : ' + JSON.stringify(doc[prop]));
					}
				} else {
					console.log('null doc : reached end of collection');
				}
				db.close();
			});

			db.close();
		});
	});
}

export function printModels() {
	mongoClient.connect(mongoUrl + dbName, (err, db) => {
		let cursor = db.collection('models').find();
		cursor.each((err, doc) => {
			assert.equal(null, err);
			if(doc != null) {
				for(let prop in doc) {
					if(doc[prop].length > 1) {
						console.log(JSON.stringify(prop) + ' : ');
						for(let i=0; i<doc[prop].length; i++) {
							//console.log(doc[prop] + ' : ');// + JSON.stringify(doc[prop][i])); // TODO : Stringify only objects
							console.log(doc[prop][i]);
						}
					} else {
						console.log(prop + ' : ' + JSON.stringify(doc[prop]));
					}
				}
			}
			db.close();
		});
	});	
}

export function printPhrases(label) {
	mongoClient.connect(mongoUrl + dbName, (err, db) => {
		//console.log('connected to mongodb');
		let cursor = db.collection('phrases').find();
		cursor.each((err, doc) => {
			assert.equal(null, err);
			if(doc != null) {
				//console.log(doc.toString());

				if(doc['label'] === label) {
					for(var prop in doc) {
						console.log(prop + ' : ' + JSON.stringify(doc[prop]));
						//console.log(doc[prop]);
						//console.log(doc['data']);
					}
				}
			}
			db.close();
		});
	});
}

export function deletePhrases(label) {
	mongoClient.connect(mongoUrl + dbName, (err, db) => {
		db.collection.deleteOne({ "label": label }, (err, results) => {
			console.log(results);
			db.close();
		});
	});	
}

export function deleteCollection(collName) {
	mongoClient.connect(mongoUrl + collName, (err, db) => {
		db.collection('phrases').drop((err, response) => {
			console.log(response);
			db.close();
		});
	});
}

//*
export function trainModels() {
	return xmm.train();
}

// TODO : remove test when archi is OK
export function testXmm() {
	xmm.tellXmm('just testing, nevermind');
}
//*/