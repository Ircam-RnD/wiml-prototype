'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

//import bson from 'bson';

var _xmmChildProcess = require('./xmm-child-process');

var _xmmChildProcess2 = _interopRequireDefault(_xmmChildProcess);

var mongoClient = _mongodb2['default'].MongoClient;
//const BSON = new mongodb.BSONPure.BSON();

var MongoDBController = (function () {
	function MongoDBController() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, MongoDBController);

		var defaults = {
			parentid: 'noid',
			//callback: ((data) => {}),
			url: 'mongodb://localhost',
			port: 27017
		};

		_Object$assign(defaults, options);

		this.parentid = defaults.parentid;
		this.url = defaults.url;
		this.port = defaults.port;
		this.fullUrl = this.url + ':' + this.port + '/';
		// just a reference to a single global child process :
		this.childProcess = new _xmmChildProcess2['default']({ parentid: this.parentid });
	}

	_createClass(MongoDBController, [{
		key: 'writeToDatabase',
		value: function writeToDatabase(dbName, collName, data) {
			mongoClient.connect(this.fullUrl + dbName, function (err, db) {
				var coll = db.collection(collName);
				coll.insertOne(data, function (err, r) {
					_assert2['default'].equal(null, err);
					_assert2['default'].equal(1, r.insertedCount);
					db.close();
				});
			});
		}
	}, {
		key: 'tellXmm',
		value: function tellXmm(message) {
			this.childProcess.tell(message);
		}
	}, {
		key: 'configureModels',
		value: function configureModels(modelType, args) {
			return this.childProcess.configureModels(modelType, args);
		}
	}, {
		key: 'trainModels',
		value: function trainModels(modelType, dbName, srcCollName, dstCollName, args) {
			return this.childProcess.trainModels(modelType, dbName, srcCollName, dstCollName, args);
		}
	}, {
		key: 'getModels',
		value: function getModels(dbName, collName) {
			var _this = this;

			var res = [];
			return new _Promise(function (resolve, reject) {
				//let res = [];
				mongoClient.connect(_this.fullUrl + dbName, function (err, db) {
					var cursor = db.collection(collName).find();
					cursor.each(function (err, doc) {
						_assert2['default'].equal(null, err);
						if (doc != null) {
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

	}, {
		key: 'deleteCollection',
		value: function deleteCollection(dbName, collName) {
			mongoClient.connect(this.fullUrl + dbName, function (err, db) {
				db.collection(collName).drop(function (err, response) {
					console.log(response);
					db.close();
				});
			});
		}
	}, {
		key: 'clearPhrases',
		value: function clearPhrases(dbName, collName, label) {
			mongoClient.connect(this.fullUrl + dbName, function (err, db) {
				db.collection(collName).deleteOne({ "label": label }, function (err, results) {
					//console.log(results);
					db.close();
				});
			});
		}

		//====================== PRINTERS =======================//

	}, {
		key: 'printModels',
		value: function printModels() {
			mongoClient.connect(this.fullUrl + 'wimldb', function (err, db) {
				var cursor = db.collection('gmmModels').find();
				cursor.each(function (err, doc) {
					_assert2['default'].equal(null, err);
					if (doc != null) {
						for (var prop in doc) {
							if (doc[prop].length > 1) {
								console.log(JSON.stringify(prop) + ' : ');
								for (var i = 0; i < doc[prop].length; i++) {
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
	}, {
		key: 'printPhrases',
		value: function printPhrases() {
			var label = arguments.length <= 0 || arguments[0] === undefined ? 'Still' : arguments[0];
			var phrases = arguments.length <= 1 || arguments[1] === undefined ? 'gmmPhrases' : arguments[1];

			mongoClient.connect(this.fullUrl + 'wimldb', function (err, db) {
				//console.log('connected to mongodb');
				var cursor = db.collection('gmmPhrases').find();
				cursor.each(function (err, doc) {
					_assert2['default'].equal(null, err);
					if (doc != null) {
						//console.log(doc.toString());

						if (label === '' || doc['label'] === label) {
							for (var prop in doc) {
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
	}, {
		key: 'removePhrase',
		value: function removePhrase(date) {
			mongoClient.connect(this.fullUrl + 'wimldb', function (err, db) {
				db.collection('phrases').deleteOne({ "date": date }, function (err, results) {
					//console.log(results);
					db.close();
				});
			});
		}
	}]);

	return MongoDBController;
})();

exports['default'] = MongoDBController;
;

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
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvbW9uZ29kYi1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBQW9CLFNBQVM7Ozs7c0JBQ1YsUUFBUTs7Ozs7OytCQUVDLHFCQUFxQjs7OztBQUVqRCxJQUFNLFdBQVcsR0FBRyxxQkFBUSxXQUFXLENBQUM7OztJQUduQixpQkFBaUI7QUFDMUIsVUFEUyxpQkFBaUIsR0FDWDtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBREosaUJBQWlCOztBQUVwQyxNQUFNLFFBQVEsR0FBRztBQUNoQixXQUFRLEVBQUUsTUFBTTs7QUFFaEIsTUFBRyxFQUFFLHFCQUFxQjtBQUMxQixPQUFJLEVBQUUsS0FBSztHQUNYLENBQUM7O0FBRUYsaUJBQWMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVqQyxNQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFDbEMsTUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO0FBQ3hCLE1BQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztBQUMxQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDOztBQUVoRCxNQUFJLENBQUMsWUFBWSxHQUFHLGlDQUFvQixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztFQUNyRTs7Y0FqQm1CLGlCQUFpQjs7U0FtQnRCLHlCQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ3ZDLGNBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEVBQUUsVUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFLO0FBQ3ZELFFBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFD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O0FBRXpELFFBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDaEQsVUFBTSxDQUFDLElBQUksQ0FBQyxVQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUs7QUFDekIseUJBQU8sS0FBSyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN4QixTQUFHLEdBQUcsSUFBSSxJQUFJLEVBQUU7OztBQUdmLFVBQUcsS0FBSyxLQUFLLEVBQUUsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssS0FBSyxFQUFFO0FBQzFDLFlBQUksSUFBSSxJQUFJLElBQUksR0FBRyxFQUFFO0FBQ3BCLGVBQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7OztRQUd0RDtPQUNEO01BQ0Q7QUFDRCxPQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDWCxDQUFDLENBQUM7SUFDSCxDQUFDLENBQUM7R0FDSDs7O1NBRVcsc0JBQUMsSUFBSSxFQUFFO0FBQ2xCLGNBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLEVBQUUsVUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFLO0FBQ3pELE1BQUUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxFQUFFLFVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBSzs7QUFFdEUsT0FBRSxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQ1gsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0dBQ0g7OztRQWhKbUIsaUJBQWlCOzs7cUJBQWpCLGlCQUFpQjtBQWtKckMsQ0FBQyIsImZpbGUiOiJzcmMvc2VydmVyL21vbmdvZGItY29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtb25nb2RiIGZyb20gJ21vbmdvZGInO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuLy9pbXBvcnQgYnNvbiBmcm9tICdic29uJztcbmltcG9ydCBYbW1DaGlsZFByb2Nlc3MgZnJvbSAnLi94bW0tY2hpbGQtcHJvY2Vzcyc7XG5cbmNvbnN0IG1vbmdvQ2xpZW50ID0gbW9uZ29kYi5Nb25nb0NsaWVudDtcbi8vY29uc3QgQlNPTiA9IG5ldyBtb25nb2RiLkJTT05QdXJlLkJTT04oKTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTW9uZ29EQkNvbnRyb2xsZXIge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdHBhcmVudGlkOiAnbm9pZCcsXG5cdFx0XHQvL2NhbGxiYWNrOiAoKGRhdGEpID0+IHt9KSxcblx0XHRcdHVybDogJ21vbmdvZGI6Ly9sb2NhbGhvc3QnLFxuXHRcdFx0cG9ydDogMjcwMTdcblx0XHR9O1xuXG5cdFx0T2JqZWN0LmFzc2lnbihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLnBhcmVudGlkID0gZGVmYXVsdHMucGFyZW50aWQ7XG5cdFx0dGhpcy51cmwgPSBkZWZhdWx0cy51cmw7XG5cdFx0dGhpcy5wb3J0ID0gZGVmYXVsdHMucG9ydDtcblx0XHR0aGlzLmZ1bGxVcmwgPSB0aGlzLnVybCArICc6JyArIHRoaXMucG9ydCArICcvJztcblx0XHQvLyBqdXN0IGEgcmVmZXJlbmNlIHRvIGEgc2luZ2xlIGdsb2JhbCBjaGlsZCBwcm9jZXNzIDpcblx0XHR0aGlzLmNoaWxkUHJvY2VzcyA9IG5ldyBYbW1DaGlsZFByb2Nlc3MoeyBwYXJlbnRpZDogdGhpcy5wYXJlbnRpZCB9KTtcblx0fVxuXG5cdHdyaXRlVG9EYXRhYmFzZShkYk5hbWUsIGNvbGxOYW1lLCBkYXRhKSB7XG5cdFx0bW9uZ29DbGllbnQuY29ubmVjdCh0aGlzLmZ1bGxVcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0XHRsZXQgY29sbCA9IGRiLmNvbGxlY3Rpb24oY29sbE5hbWUpO1xuXHRcdFx0Y29sbC5pbnNlcnRPbmUoZGF0YSwgKGVyciwgcikgPT4ge1xuXHRcdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdFx0YXNzZXJ0LmVxdWFsKDEsIHIuaW5zZXJ0ZWRDb3VudCk7XG5cdFx0XHRcdGRiLmNsb3NlKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHRlbGxYbW0obWVzc2FnZSkge1xuXHRcdHRoaXMuY2hpbGRQcm9jZXNzLnRlbGwobWVzc2FnZSk7XG5cdH1cblxuXHRjb25maWd1cmVNb2RlbHMobW9kZWxUeXBlLCBhcmdzKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRQcm9jZXNzLmNvbmZpZ3VyZU1vZGVscyhtb2RlbFR5cGUsIGFyZ3MpO1xuXHR9XG5cblx0dHJhaW5Nb2RlbHMobW9kZWxUeXBlLCBkYk5hbWUsIHNyY0NvbGxOYW1lLCBkc3RDb2xsTmFtZSwgYXJncykge1xuXHRcdHJldHVybiB0aGlzLmNoaWxkUHJvY2Vzcy50cmFpbk1vZGVscyhtb2RlbFR5cGUsIGRiTmFtZSwgc3JjQ29sbE5hbWUsIGRzdENvbGxOYW1lLCBhcmdzKTtcblx0fVxuXG5cdGdldE1vZGVscyhkYk5hbWUsIGNvbGxOYW1lKSB7XG5cdFx0bGV0IHJlcyA9IFtdO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHQvL2xldCByZXMgPSBbXTtcblx0XHRcdG1vbmdvQ2xpZW50LmNvbm5lY3QodGhpcy5mdWxsVXJsICsgZGJOYW1lLCAoZXJyLCBkYikgPT4ge1xuXHRcdFx0XHRsZXQgY3Vyc29yID0gZGIuY29sbGVjdGlvbihjb2xsTmFtZSkuZmluZCgpO1xuXHRcdFx0XHRjdXJzb3IuZWFjaCgoZXJyLCBkb2MpID0+IHtcblx0XHRcdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdFx0XHRpZihkb2MgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0cmVzLnB1c2goZG9jKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1x0XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIGdldFBocmFzZXMoZGJOYW1lLCBjb2xsTmFtZSkge1xuXHQvLyBcdGxldCByZXMgPSBbXTtcblx0Ly8gXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHQvLyBcdFx0bW9uZ29DbGllbnQuY29ubmVjdCh0aGlzLmZ1bGxVcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdC8vIFx0XHRcdGxldCBjdXJzb3IgPSBkYi5jb2xsZWN0aW9uKClcblx0Ly8gXHRcdH0pO1xuXHQvLyBcdH0pO1xuXHQvLyB9XG5cblx0Ly89PT09PT09PT09PT09PT09PT09PT09PSBDTEVBTlVQID09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuXHRkZWxldGVDb2xsZWN0aW9uKGRiTmFtZSwgY29sbE5hbWUpIHtcblx0XHRtb25nb0NsaWVudC5jb25uZWN0KHRoaXMuZnVsbFVybCArIGRiTmFtZSwgKGVyciwgZGIpID0+IHtcblx0XHRcdGRiLmNvbGxlY3Rpb24oY29sbE5hbWUpLmRyb3AoKGVyciwgcmVzcG9uc2UpID0+IHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzcG9uc2UpO1xuXHRcdFx0XHRkYi5jbG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRjbGVhclBocmFzZXMoZGJOYW1lLCBjb2xsTmFtZSwgbGFiZWwpIHtcblx0XHRtb25nb0NsaWVudC5jb25uZWN0KHRoaXMuZnVsbFVybCArIGRiTmFtZSwgKGVyciwgZGIpID0+IHtcblx0XHRcdGRiLmNvbGxlY3Rpb24oY29sbE5hbWUpLmRlbGV0ZU9uZSh7IFwibGFiZWxcIjogbGFiZWwgfSwgKGVyciwgcmVzdWx0cykgPT4ge1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHJlc3VsdHMpO1xuXHRcdFx0XHRkYi5jbG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XHRcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PSBQUklOVEVSUyA9PT09PT09PT09PT09PT09PT09PT09PS8vXG5cblx0cHJpbnRNb2RlbHMoKSB7XG5cdFx0bW9uZ29DbGllbnQuY29ubmVjdCh0aGlzLmZ1bGxVcmwgKyAnd2ltbGRiJywgKGVyciwgZGIpID0+IHtcblx0XHRcdGxldCBjdXJzb3IgPSBkYi5jb2xsZWN0aW9uKCdnbW1Nb2RlbHMnKS5maW5kKCk7XG5cdFx0XHRjdXJzb3IuZWFjaCgoZXJyLCBkb2MpID0+IHtcblx0XHRcdFx0YXNzZXJ0LmVxdWFsKG51bGwsIGVycik7XG5cdFx0XHRcdGlmKGRvYyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0Zm9yKGxldCBwcm9wIGluIGRvYykge1xuXHRcdFx0XHRcdFx0aWYoZG9jW3Byb3BdLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocHJvcCkgKyAnIDogJyk7XG5cdFx0XHRcdFx0XHRcdGZvcihsZXQgaT0wOyBpPGRvY1twcm9wXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9jW3Byb3BdICsgJyA6ICcpOy8vICsgSlNPTi5zdHJpbmdpZnkoZG9jW3Byb3BdW2ldKSk7IC8vIFRPRE8gOiBTdHJpbmdpZnkgb25seSBvYmplY3RzXG5cdFx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZG9jW3Byb3BdW2ldKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocHJvcCArICcgOiAnICsgSlNPTi5zdHJpbmdpZnkoZG9jW3Byb3BdKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGRiLmNsb3NlKCk7XG5cdFx0XHR9KTtcblx0XHR9KTtcdFxuXHR9XG5cblx0cHJpbnRQaHJhc2VzKGxhYmVsID0gJ1N0aWxsJywgcGhyYXNlcyA9ICdnbW1QaHJhc2VzJykge1xuXHRcdG1vbmdvQ2xpZW50LmNvbm5lY3QodGhpcy5mdWxsVXJsICsgJ3dpbWxkYicsIChlcnIsIGRiKSA9PiB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gbW9uZ29kYicpO1xuXHRcdFx0bGV0IGN1cnNvciA9IGRiLmNvbGxlY3Rpb24oJ2dtbVBocmFzZXMnKS5maW5kKCk7XG5cdFx0XHRjdXJzb3IuZWFjaCgoZXJyLCBkb2MpID0+IHtcblx0XHRcdFx0YXNzZXJ0LmVxdWFsKG51bGwsIGVycik7XG5cdFx0XHRcdGlmKGRvYyAhPSBudWxsKSB7XG5cdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb2MudG9TdHJpbmcoKSk7XG5cblx0XHRcdFx0XHRpZihsYWJlbCA9PT0gJycgfHwgZG9jWydsYWJlbCddID09PSBsYWJlbCkge1xuXHRcdFx0XHRcdFx0Zm9yKHZhciBwcm9wIGluIGRvYykge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhwcm9wICsgJyA6ICcgKyBKU09OLnN0cmluZ2lmeShkb2NbcHJvcF0pKTtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb2NbcHJvcF0pO1xuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvY1snZGF0YSddKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0cmVtb3ZlUGhyYXNlKGRhdGUpIHtcblx0XHRtb25nb0NsaWVudC5jb25uZWN0KHRoaXMuZnVsbFVybCArICd3aW1sZGInLCAoZXJyLCBkYikgPT4ge1xuXHRcdFx0ZGIuY29sbGVjdGlvbigncGhyYXNlcycpLmRlbGV0ZU9uZSh7IFwiZGF0ZVwiOiBkYXRlIH0sIChlcnIsIHJlc3VsdHMpID0+IHtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhyZXN1bHRzKTtcblx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1x0XHRcdFxuXHR9XG5cbn07XG5cbi8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuLypcbmxldCBtb25nb0NsaWVudCA9IG1vbmdvZGIuTW9uZ29DbGllbnQ7XG5sZXQgb2JqZWN0SUQgPSBtb25nb2RiLk9iamVjdElEO1xuY29uc3QgbW9uZ29VcmwgPSAnbW9uZ29kYjovL2xvY2FsaG9zdDoyNzAxNy8nO1xuY29uc3QgZGJOYW1lID0gJ3dpbWxkYic7XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVRvRGF0YWJhc2UoZGJOYW1lLCBjb2xsTmFtZSwgZGF0YSkge1xuXHRtb25nb0NsaWVudC5jb25uZWN0KG1vbmdvVXJsICsgZGJOYW1lLCAoZXJyLCBkYikgPT4ge1xuXHRcdGxldCBjb2xsID0gZGIuY29sbGVjdGlvbihjb2xsTmFtZSk7XG5cdFx0Y29sbC5pbnNlcnRPbmUoZGF0YSwgKGVyciwgcikgPT4ge1xuXHRcdFx0YXNzZXJ0LmVxdWFsKG51bGwsIGVycik7XG5cdFx0XHRhc3NlcnQuZXF1YWwoMSxyLmluc2VydGVkQ291bnQpO1xuXHRcdFx0ZGIuY2xvc2UoKTtcblx0XHR9KTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB3cml0ZVBocmFzZVRvRGF0YWJhc2UoZGF0YSkge1xuXHRtb25nb0NsaWVudC5jb25uZWN0KG1vbmdvVXJsICsgZGJOYW1lLCAoZXJyLCBkYikgPT4ge1xuXHRcdGNvbnNvbGUubG9nKCdjb25uZWN0ZWQgdG8gbW9uZ29kYicpO1xuXHRcdGxldCBjb2xsID0gZGIuY29sbGVjdGlvbigncGhyYXNlcycpO1xuXHRcdGNvbGwuaW5zZXJ0T25lKGRhdGEsIChlcnIsIHIpID0+IHtcblx0XHRcdGFzc2VydC5lcXVhbChudWxsLCBlcnIpO1xuXHRcdFx0YXNzZXJ0LmVxdWFsKDEsIHIuaW5zZXJ0ZWRDb3VudCk7XG5cdFx0XHRjb25zb2xlLmxvZygnaW5zZXJ0ZWQgZGF0YSBpbnRvIGNvbGxlY3Rpb24gXFwncGhyYXNlc1xcJycpO1xuXG5cdFx0XHRsZXQgY3Vyc29yID0gZGIuY29sbGVjdGlvbigncGhyYXNlcycpLmZpbmQoKTtcblx0XHRcdGN1cnNvci5lYWNoKChlcnIsIGRvYykgPT4ge1xuXHRcdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdFx0aWYoZG9jICE9IG51bGwpIHtcblx0XHRcdFx0XHRmb3IodmFyIHByb3AgaW4gZG9jKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhwcm9wICsgJyA6ICcgKyBKU09OLnN0cmluZ2lmeShkb2NbcHJvcF0pKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5sb2coJ251bGwgZG9jIDogcmVhY2hlZCBlbmQgb2YgY29sbGVjdGlvbicpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRiLmNsb3NlKCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0ZGIuY2xvc2UoKTtcblx0XHR9KTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcmludE1vZGVscygpIHtcblx0bW9uZ29DbGllbnQuY29ubmVjdChtb25nb1VybCArIGRiTmFtZSwgKGVyciwgZGIpID0+IHtcblx0XHRsZXQgY3Vyc29yID0gZGIuY29sbGVjdGlvbignbW9kZWxzJykuZmluZCgpO1xuXHRcdGN1cnNvci5lYWNoKChlcnIsIGRvYykgPT4ge1xuXHRcdFx0YXNzZXJ0LmVxdWFsKG51bGwsIGVycik7XG5cdFx0XHRpZihkb2MgIT0gbnVsbCkge1xuXHRcdFx0XHRmb3IobGV0IHByb3AgaW4gZG9jKSB7XG5cdFx0XHRcdFx0aWYoZG9jW3Byb3BdLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHByb3ApICsgJyA6ICcpO1xuXHRcdFx0XHRcdFx0Zm9yKGxldCBpPTA7IGk8ZG9jW3Byb3BdLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9jW3Byb3BdICsgJyA6ICcpOy8vICsgSlNPTi5zdHJpbmdpZnkoZG9jW3Byb3BdW2ldKSk7IC8vIFRPRE8gOiBTdHJpbmdpZnkgb25seSBvYmplY3RzXG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRvY1twcm9wXVtpXSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHByb3AgKyAnIDogJyArIEpTT04uc3RyaW5naWZ5KGRvY1twcm9wXSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZGIuY2xvc2UoKTtcblx0XHR9KTtcblx0fSk7XHRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW50UGhyYXNlcyhsYWJlbCkge1xuXHRtb25nb0NsaWVudC5jb25uZWN0KG1vbmdvVXJsICsgZGJOYW1lLCAoZXJyLCBkYikgPT4ge1xuXHRcdC8vY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byBtb25nb2RiJyk7XG5cdFx0bGV0IGN1cnNvciA9IGRiLmNvbGxlY3Rpb24oJ3BocmFzZXMnKS5maW5kKCk7XG5cdFx0Y3Vyc29yLmVhY2goKGVyciwgZG9jKSA9PiB7XG5cdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdGlmKGRvYyAhPSBudWxsKSB7XG5cdFx0XHRcdC8vY29uc29sZS5sb2coZG9jLnRvU3RyaW5nKCkpO1xuXG5cdFx0XHRcdGlmKGRvY1snbGFiZWwnXSA9PT0gbGFiZWwpIHtcblx0XHRcdFx0XHRmb3IodmFyIHByb3AgaW4gZG9jKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhwcm9wICsgJyA6ICcgKyBKU09OLnN0cmluZ2lmeShkb2NbcHJvcF0pKTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9jW3Byb3BdKTtcblx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9jWydkYXRhJ10pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZGIuY2xvc2UoKTtcblx0XHR9KTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWxldGVQaHJhc2VzKGxhYmVsKSB7XG5cdG1vbmdvQ2xpZW50LmNvbm5lY3QobW9uZ29VcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0ZGIuY29sbGVjdGlvbi5kZWxldGVPbmUoeyBcImxhYmVsXCI6IGxhYmVsIH0sIChlcnIsIHJlc3VsdHMpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKHJlc3VsdHMpO1xuXHRcdFx0ZGIuY2xvc2UoKTtcblx0XHR9KTtcblx0fSk7XHRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZUNvbGxlY3Rpb24oY29sbE5hbWUpIHtcblx0bW9uZ29DbGllbnQuY29ubmVjdChtb25nb1VybCArIGNvbGxOYW1lLCAoZXJyLCBkYikgPT4ge1xuXHRcdGRiLmNvbGxlY3Rpb24oJ3BocmFzZXMnKS5kcm9wKChlcnIsIHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhyZXNwb25zZSk7XG5cdFx0XHRkYi5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuLy8qXG5leHBvcnQgZnVuY3Rpb24gdHJhaW5Nb2RlbHMoKSB7XG5cdHJldHVybiB4bW0udHJhaW4oKTtcbn1cblxuLy8gVE9ETyA6IHJlbW92ZSB0ZXN0IHdoZW4gYXJjaGkgaXMgT0tcbmV4cG9ydCBmdW5jdGlvbiB0ZXN0WG1tKCkge1xuXHR4bW0udGVsbFhtbSgnanVzdCB0ZXN0aW5nLCBuZXZlcm1pbmQnKTtcbn1cbi8vKi8iXX0=