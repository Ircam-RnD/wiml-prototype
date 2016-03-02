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
		key: 'trainModels',
		value: function trainModels(dbName, srcCollName, dstCollName, args) {
			return this.childProcess.trainModels(dbName, srcCollName, dstCollName, args);
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
				var cursor = db.collection('models').find();
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
			var label = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

			mongoClient.connect(this.fullUrl + 'wimldb', function (err, db) {
				//console.log('connected to mongodb');
				var cursor = db.collection('phrases').find();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvbW9uZ29kYi1jb250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7dUJBQW9CLFNBQVM7Ozs7c0JBQ1YsUUFBUTs7Ozs7OytCQUVDLHFCQUFxQjs7OztBQUVqRCxJQUFNLFdBQVcsR0FBRyxxQkFBUSxXQUFXLENBQUM7OztJQUduQixpQkFBaUI7QUFDMUIsVUFEUyxpQkFBaUIsR0FDWDtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBREosaUJBQWlCOztBQUVwQyxNQUFNLFFBQVEsR0FBRztBQUNoQixXQUFRLEVBQUUsTUFBTTs7QUFFaEIsTUFBRyxFQUFFLHFCQUFxQjtBQUMxQixPQUFJLEVBQUUsS0FBSztHQUNYLENBQUM7O0FBRUYsaUJBQWMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUVqQyxNQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7QUFDbEMsTUFBSSxDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO0FBQ3hCLE1BQUksQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQztBQUMxQixNQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDOztBQUVoRCxNQUFJLENBQUMsWUFBWSxHQUFHLGlDQUFvQixFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztFQUNyRTs7Y0FqQm1CLGlCQUFpQjs7U0FtQnRCLHlCQUFDLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFO0FBQ3ZDLGNBQVcsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLEVBQUUsVUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFLO0FBQ3ZELFFBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7QUFD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QUcsQ0FBQyxDQUFDO0FBQ3hCLFNBQUcsR0FBRyxJQUFJLElBQUksRUFBRTs7O0FBR2YsVUFBRyxLQUFLLEtBQUssRUFBRSxJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxLQUFLLEVBQUU7QUFDMUMsWUFBSSxJQUFJLElBQUksSUFBSSxHQUFHLEVBQUU7QUFDcEIsZUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQzs7O1FBR3REO09BQ0Q7TUFDRDtBQUNELE9BQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztLQUNYLENBQUMsQ0FBQztJQUNILENBQUMsQ0FBQztHQUNIOzs7U0FFVyxzQkFBQyxJQUFJLEVBQUU7QUFDbEIsY0FBVyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLFFBQVEsRUFBRSxVQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUs7QUFDekQsTUFBRSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxTQUFTLENBQUMsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEVBQUUsVUFBQyxHQUFHLEVBQUUsT0FBTyxFQUFLOztBQUV0RSxPQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDWCxDQUFDLENBQUM7SUFDSCxDQUFDLENBQUM7R0FDSDs7O1FBbkltQixpQkFBaUI7OztxQkFBakIsaUJBQWlCO0FBcUlyQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIvbW9uZ29kYi1jb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IG1vbmdvZGIgZnJvbSAnbW9uZ29kYic7XG5pbXBvcnQgYXNzZXJ0IGZyb20gJ2Fzc2VydCc7XG4vL2ltcG9ydCBic29uIGZyb20gJ2Jzb24nO1xuaW1wb3J0IFhtbUNoaWxkUHJvY2VzcyBmcm9tICcuL3htbS1jaGlsZC1wcm9jZXNzJztcblxuY29uc3QgbW9uZ29DbGllbnQgPSBtb25nb2RiLk1vbmdvQ2xpZW50O1xuLy9jb25zdCBCU09OID0gbmV3IG1vbmdvZGIuQlNPTlB1cmUuQlNPTigpO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBNb25nb0RCQ29udHJvbGxlciB7XG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0cGFyZW50aWQ6ICdub2lkJyxcblx0XHRcdC8vY2FsbGJhY2s6ICgoZGF0YSkgPT4ge30pLFxuXHRcdFx0dXJsOiAnbW9uZ29kYjovL2xvY2FsaG9zdCcsXG5cdFx0XHRwb3J0OiAyNzAxN1xuXHRcdH07XG5cblx0XHRPYmplY3QuYXNzaWduKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMucGFyZW50aWQgPSBkZWZhdWx0cy5wYXJlbnRpZDtcblx0XHR0aGlzLnVybCA9IGRlZmF1bHRzLnVybDtcblx0XHR0aGlzLnBvcnQgPSBkZWZhdWx0cy5wb3J0O1xuXHRcdHRoaXMuZnVsbFVybCA9IHRoaXMudXJsICsgJzonICsgdGhpcy5wb3J0ICsgJy8nO1xuXHRcdC8vIGp1c3QgYSByZWZlcmVuY2UgdG8gYSBzaW5nbGUgZ2xvYmFsIGNoaWxkIHByb2Nlc3MgOlxuXHRcdHRoaXMuY2hpbGRQcm9jZXNzID0gbmV3IFhtbUNoaWxkUHJvY2Vzcyh7IHBhcmVudGlkOiB0aGlzLnBhcmVudGlkIH0pO1xuXHR9XG5cblx0d3JpdGVUb0RhdGFiYXNlKGRiTmFtZSwgY29sbE5hbWUsIGRhdGEpIHtcblx0XHRtb25nb0NsaWVudC5jb25uZWN0KHRoaXMuZnVsbFVybCArIGRiTmFtZSwgKGVyciwgZGIpID0+IHtcblx0XHRcdGxldCBjb2xsID0gZGIuY29sbGVjdGlvbihjb2xsTmFtZSk7XG5cdFx0XHRjb2xsLmluc2VydE9uZShkYXRhLCAoZXJyLCByKSA9PiB7XG5cdFx0XHRcdGFzc2VydC5lcXVhbChudWxsLCBlcnIpO1xuXHRcdFx0XHRhc3NlcnQuZXF1YWwoMSwgci5pbnNlcnRlZENvdW50KTtcblx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0dGVsbFhtbShtZXNzYWdlKSB7XG5cdFx0dGhpcy5jaGlsZFByb2Nlc3MudGVsbChtZXNzYWdlKTtcblx0fVxuXG5cdHRyYWluTW9kZWxzKGRiTmFtZSwgc3JjQ29sbE5hbWUsIGRzdENvbGxOYW1lLCBhcmdzKSB7XG5cdFx0cmV0dXJuIHRoaXMuY2hpbGRQcm9jZXNzLnRyYWluTW9kZWxzKGRiTmFtZSwgc3JjQ29sbE5hbWUsIGRzdENvbGxOYW1lLCBhcmdzKTtcblx0fVxuXG5cdGdldE1vZGVscyhkYk5hbWUsIGNvbGxOYW1lKSB7XG5cdFx0bGV0IHJlcyA9IFtdO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHQvL2xldCByZXMgPSBbXTtcblx0XHRcdG1vbmdvQ2xpZW50LmNvbm5lY3QodGhpcy5mdWxsVXJsICsgZGJOYW1lLCAoZXJyLCBkYikgPT4ge1xuXHRcdFx0XHRsZXQgY3Vyc29yID0gZGIuY29sbGVjdGlvbihjb2xsTmFtZSkuZmluZCgpO1xuXHRcdFx0XHRjdXJzb3IuZWFjaCgoZXJyLCBkb2MpID0+IHtcblx0XHRcdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdFx0XHRpZihkb2MgIT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0cmVzLnB1c2goZG9jKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHJlc29sdmUocmVzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1x0XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vPT09PT09PT09PT09PT09PT09PT09PT0gQ0xFQU5VUCA9PT09PT09PT09PT09PT09PT09PT09PS8vXG5cblx0ZGVsZXRlQ29sbGVjdGlvbihkYk5hbWUsIGNvbGxOYW1lKSB7XG5cdFx0bW9uZ29DbGllbnQuY29ubmVjdCh0aGlzLmZ1bGxVcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0XHRkYi5jb2xsZWN0aW9uKGNvbGxOYW1lKS5kcm9wKChlcnIsIHJlc3BvbnNlKSA9PiB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Y2xlYXJQaHJhc2VzKGRiTmFtZSwgY29sbE5hbWUsIGxhYmVsKSB7XG5cdFx0bW9uZ29DbGllbnQuY29ubmVjdCh0aGlzLmZ1bGxVcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0XHRkYi5jb2xsZWN0aW9uKGNvbGxOYW1lKS5kZWxldGVPbmUoeyBcImxhYmVsXCI6IGxhYmVsIH0sIChlcnIsIHJlc3VsdHMpID0+IHtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhyZXN1bHRzKTtcblx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdH0pO1xuXHRcdH0pO1x0XG5cdH1cblxuXHQvLz09PT09PT09PT09PT09PT09PT09PT0gUFJJTlRFUlMgPT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5cdHByaW50TW9kZWxzKCkge1xuXHRcdG1vbmdvQ2xpZW50LmNvbm5lY3QodGhpcy5mdWxsVXJsICsgJ3dpbWxkYicsIChlcnIsIGRiKSA9PiB7XG5cdFx0XHRsZXQgY3Vyc29yID0gZGIuY29sbGVjdGlvbignbW9kZWxzJykuZmluZCgpO1xuXHRcdFx0Y3Vyc29yLmVhY2goKGVyciwgZG9jKSA9PiB7XG5cdFx0XHRcdGFzc2VydC5lcXVhbChudWxsLCBlcnIpO1xuXHRcdFx0XHRpZihkb2MgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGZvcihsZXQgcHJvcCBpbiBkb2MpIHtcblx0XHRcdFx0XHRcdGlmKGRvY1twcm9wXS5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKEpTT04uc3RyaW5naWZ5KHByb3ApICsgJyA6ICcpO1xuXHRcdFx0XHRcdFx0XHRmb3IobGV0IGk9MDsgaTxkb2NbcHJvcF0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvY1twcm9wXSArICcgOiAnKTsvLyArIEpTT04uc3RyaW5naWZ5KGRvY1twcm9wXVtpXSkpOyAvLyBUT0RPIDogU3RyaW5naWZ5IG9ubHkgb2JqZWN0c1xuXHRcdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKGRvY1twcm9wXVtpXSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHByb3AgKyAnIDogJyArIEpTT04uc3RyaW5naWZ5KGRvY1twcm9wXSkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRkYi5jbG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XHRcblx0fVxuXG5cdHByaW50UGhyYXNlcyhsYWJlbCA9ICcnKSB7XG5cdFx0bW9uZ29DbGllbnQuY29ubmVjdCh0aGlzLmZ1bGxVcmwgKyAnd2ltbGRiJywgKGVyciwgZGIpID0+IHtcblx0XHRcdC8vY29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byBtb25nb2RiJyk7XG5cdFx0XHRsZXQgY3Vyc29yID0gZGIuY29sbGVjdGlvbigncGhyYXNlcycpLmZpbmQoKTtcblx0XHRcdGN1cnNvci5lYWNoKChlcnIsIGRvYykgPT4ge1xuXHRcdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdFx0aWYoZG9jICE9IG51bGwpIHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvYy50b1N0cmluZygpKTtcblxuXHRcdFx0XHRcdGlmKGxhYmVsID09PSAnJyB8fCBkb2NbJ2xhYmVsJ10gPT09IGxhYmVsKSB7XG5cdFx0XHRcdFx0XHRmb3IodmFyIHByb3AgaW4gZG9jKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHByb3AgKyAnIDogJyArIEpTT04uc3RyaW5naWZ5KGRvY1twcm9wXSkpO1xuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRvY1twcm9wXSk7XG5cdFx0XHRcdFx0XHRcdC8vY29uc29sZS5sb2coZG9jWydkYXRhJ10pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRkYi5jbG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZW1vdmVQaHJhc2UoZGF0ZSkge1xuXHRcdG1vbmdvQ2xpZW50LmNvbm5lY3QodGhpcy5mdWxsVXJsICsgJ3dpbWxkYicsIChlcnIsIGRiKSA9PiB7XG5cdFx0XHRkYi5jb2xsZWN0aW9uKCdwaHJhc2VzJykuZGVsZXRlT25lKHsgXCJkYXRlXCI6IGRhdGUgfSwgKGVyciwgcmVzdWx0cykgPT4ge1xuXHRcdFx0XHQvL2NvbnNvbGUubG9nKHJlc3VsdHMpO1xuXHRcdFx0XHRkYi5jbG9zZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XHRcdFx0XG5cdH1cblxufTtcblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG4vKlxubGV0IG1vbmdvQ2xpZW50ID0gbW9uZ29kYi5Nb25nb0NsaWVudDtcbmxldCBvYmplY3RJRCA9IG1vbmdvZGIuT2JqZWN0SUQ7XG5jb25zdCBtb25nb1VybCA9ICdtb25nb2RiOi8vbG9jYWxob3N0OjI3MDE3Lyc7XG5jb25zdCBkYk5hbWUgPSAnd2ltbGRiJztcblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlVG9EYXRhYmFzZShkYk5hbWUsIGNvbGxOYW1lLCBkYXRhKSB7XG5cdG1vbmdvQ2xpZW50LmNvbm5lY3QobW9uZ29VcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0bGV0IGNvbGwgPSBkYi5jb2xsZWN0aW9uKGNvbGxOYW1lKTtcblx0XHRjb2xsLmluc2VydE9uZShkYXRhLCAoZXJyLCByKSA9PiB7XG5cdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdGFzc2VydC5lcXVhbCgxLHIuaW5zZXJ0ZWRDb3VudCk7XG5cdFx0XHRkYi5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlUGhyYXNlVG9EYXRhYmFzZShkYXRhKSB7XG5cdG1vbmdvQ2xpZW50LmNvbm5lY3QobW9uZ29VcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0Y29uc29sZS5sb2coJ2Nvbm5lY3RlZCB0byBtb25nb2RiJyk7XG5cdFx0bGV0IGNvbGwgPSBkYi5jb2xsZWN0aW9uKCdwaHJhc2VzJyk7XG5cdFx0Y29sbC5pbnNlcnRPbmUoZGF0YSwgKGVyciwgcikgPT4ge1xuXHRcdFx0YXNzZXJ0LmVxdWFsKG51bGwsIGVycik7XG5cdFx0XHRhc3NlcnQuZXF1YWwoMSwgci5pbnNlcnRlZENvdW50KTtcblx0XHRcdGNvbnNvbGUubG9nKCdpbnNlcnRlZCBkYXRhIGludG8gY29sbGVjdGlvbiBcXCdwaHJhc2VzXFwnJyk7XG5cblx0XHRcdGxldCBjdXJzb3IgPSBkYi5jb2xsZWN0aW9uKCdwaHJhc2VzJykuZmluZCgpO1xuXHRcdFx0Y3Vyc29yLmVhY2goKGVyciwgZG9jKSA9PiB7XG5cdFx0XHRcdGFzc2VydC5lcXVhbChudWxsLCBlcnIpO1xuXHRcdFx0XHRpZihkb2MgIT0gbnVsbCkge1xuXHRcdFx0XHRcdGZvcih2YXIgcHJvcCBpbiBkb2MpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHByb3AgKyAnIDogJyArIEpTT04uc3RyaW5naWZ5KGRvY1twcm9wXSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnbnVsbCBkb2MgOiByZWFjaGVkIGVuZCBvZiBjb2xsZWN0aW9uJyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZGIuY2xvc2UoKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRkYi5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByaW50TW9kZWxzKCkge1xuXHRtb25nb0NsaWVudC5jb25uZWN0KG1vbmdvVXJsICsgZGJOYW1lLCAoZXJyLCBkYikgPT4ge1xuXHRcdGxldCBjdXJzb3IgPSBkYi5jb2xsZWN0aW9uKCdtb2RlbHMnKS5maW5kKCk7XG5cdFx0Y3Vyc29yLmVhY2goKGVyciwgZG9jKSA9PiB7XG5cdFx0XHRhc3NlcnQuZXF1YWwobnVsbCwgZXJyKTtcblx0XHRcdGlmKGRvYyAhPSBudWxsKSB7XG5cdFx0XHRcdGZvcihsZXQgcHJvcCBpbiBkb2MpIHtcblx0XHRcdFx0XHRpZihkb2NbcHJvcF0ubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2coSlNPTi5zdHJpbmdpZnkocHJvcCkgKyAnIDogJyk7XG5cdFx0XHRcdFx0XHRmb3IobGV0IGk9MDsgaTxkb2NbcHJvcF0ubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb2NbcHJvcF0gKyAnIDogJyk7Ly8gKyBKU09OLnN0cmluZ2lmeShkb2NbcHJvcF1baV0pKTsgLy8gVE9ETyA6IFN0cmluZ2lmeSBvbmx5IG9iamVjdHNcblx0XHRcdFx0XHRcdFx0Y29uc29sZS5sb2coZG9jW3Byb3BdW2ldKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5sb2cocHJvcCArICcgOiAnICsgSlNPTi5zdHJpbmdpZnkoZG9jW3Byb3BdKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRkYi5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9KTtcdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRQaHJhc2VzKGxhYmVsKSB7XG5cdG1vbmdvQ2xpZW50LmNvbm5lY3QobW9uZ29VcmwgKyBkYk5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0Ly9jb25zb2xlLmxvZygnY29ubmVjdGVkIHRvIG1vbmdvZGInKTtcblx0XHRsZXQgY3Vyc29yID0gZGIuY29sbGVjdGlvbigncGhyYXNlcycpLmZpbmQoKTtcblx0XHRjdXJzb3IuZWFjaCgoZXJyLCBkb2MpID0+IHtcblx0XHRcdGFzc2VydC5lcXVhbChudWxsLCBlcnIpO1xuXHRcdFx0aWYoZG9jICE9IG51bGwpIHtcblx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb2MudG9TdHJpbmcoKSk7XG5cblx0XHRcdFx0aWYoZG9jWydsYWJlbCddID09PSBsYWJlbCkge1xuXHRcdFx0XHRcdGZvcih2YXIgcHJvcCBpbiBkb2MpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKHByb3AgKyAnIDogJyArIEpTT04uc3RyaW5naWZ5KGRvY1twcm9wXSkpO1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb2NbcHJvcF0pO1xuXHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkb2NbJ2RhdGEnXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRkYi5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZVBocmFzZXMobGFiZWwpIHtcblx0bW9uZ29DbGllbnQuY29ubmVjdChtb25nb1VybCArIGRiTmFtZSwgKGVyciwgZGIpID0+IHtcblx0XHRkYi5jb2xsZWN0aW9uLmRlbGV0ZU9uZSh7IFwibGFiZWxcIjogbGFiZWwgfSwgKGVyciwgcmVzdWx0cykgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2cocmVzdWx0cyk7XG5cdFx0XHRkYi5jbG9zZSgpO1xuXHRcdH0pO1xuXHR9KTtcdFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlQ29sbGVjdGlvbihjb2xsTmFtZSkge1xuXHRtb25nb0NsaWVudC5jb25uZWN0KG1vbmdvVXJsICsgY29sbE5hbWUsIChlcnIsIGRiKSA9PiB7XG5cdFx0ZGIuY29sbGVjdGlvbigncGhyYXNlcycpLmRyb3AoKGVyciwgcmVzcG9uc2UpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKHJlc3BvbnNlKTtcblx0XHRcdGRiLmNsb3NlKCk7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG4vLypcbmV4cG9ydCBmdW5jdGlvbiB0cmFpbk1vZGVscygpIHtcblx0cmV0dXJuIHhtbS50cmFpbigpO1xufVxuXG4vLyBUT0RPIDogcmVtb3ZlIHRlc3Qgd2hlbiBhcmNoaSBpcyBPS1xuZXhwb3J0IGZ1bmN0aW9uIHRlc3RYbW0oKSB7XG5cdHhtbS50ZWxsWG1tKCdqdXN0IHRlc3RpbmcsIG5ldmVybWluZCcpO1xufVxuLy8qLyJdfQ==