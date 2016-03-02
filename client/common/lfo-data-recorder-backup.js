'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _wavesLfo = require('waves-lfo');

var _wavesLfo2 = _interopRequireDefault(_wavesLfo);

var phrase = {};
var recorder = new _wavesLfo2['default'].sinks.DataRecorder({
	//frameSize: 3,
	//separateArrays: true
});

var updatePhrase = function updatePhrase(data) {
	// make it directly compatible with xmm phrases :
	console.log(data);
	phrase = {};
	phrase.bimodal = false;
	phrase.dimension = 3;
	phrase.dimension_input = 0;
	phrase.column_names = ['magnitude', 'frequency', 'periodicity'];
	phrase.data = [];
	for (var vecid in data.data) {
		for (var id in data.data[vecid]) {
			phrase.data.push(data.data[vecid][id]);
		}
	}
	phrase.length = data.time.length;
	recorder.retrieve().then(updatePhrase)['catch'](function (err) {
		return console.error(err.stack);
	});
};

recorder.retrieve().then(updatePhrase)['catch'](function (err) {
	return console.error(err.stack);
});

var DataRecorder = (function (_lfo$core$BaseLfo) {
	_inherits(DataRecorder, _lfo$core$BaseLfo);

	function DataRecorder() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, DataRecorder);

		var defaults = {
			frameSize: 3,
			separateArrays: true
		};
		_get(Object.getPrototypeOf(DataRecorder.prototype), 'constructor', this).call(this, options, defaults);

		recorder.params.frameSize = this.params.frameSize;
		recorder.params.separateArrays = this.params.separateArrays;
		_get(Object.getPrototypeOf(DataRecorder.prototype), 'connect', this).call(this, recorder);
		_get(Object.getPrototypeOf(DataRecorder.prototype), 'initialize', this).call(this);
	}

	_createClass(DataRecorder, [{
		key: 'start',
		value: function start() {
			recorder.start();
			//console.log(this.recorder.params.separateArrays);
		}
	}, {
		key: 'stop',
		value: function stop() {
			recorder.stop();
		}
	}, {
		key: 'getRecordedPhrase',
		value: function getRecordedPhrase() {
			return phrase;
		}
	}]);

	return DataRecorder;
})(_wavesLfo2['default'].core.BaseLfo);

exports['default'] = DataRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLWJhY2t1cC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O3dCQUFnQixXQUFXOzs7O0FBRTNCLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNoQixJQUFNLFFBQVEsR0FBRyxJQUFJLHNCQUFJLEtBQUssQ0FBQyxZQUFZLENBQUM7OztDQUczQyxDQUFDLENBQUM7O0FBRUgsSUFBTSxZQUFZLEdBQUcsU0FBZixZQUFZLENBQUksSUFBSSxFQUFLOztBQUU5QixRQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xCLE9BQU0sR0FBRyxFQUFFLENBQUM7QUFDWixPQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUN2QixPQUFNLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUNyQixPQUFNLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztBQUMzQixPQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNoRSxPQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNqQixNQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDM0IsT0FBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQy9CLFNBQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztHQUN2QztFQUNEO0FBQ0QsT0FBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUNqQyxTQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFNLENBQUMsVUFBQyxHQUFHO1NBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0VBQUEsQ0FBQyxDQUFDO0NBQ2hGLENBQUM7O0FBRUYsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBTSxDQUFDLFVBQUMsR0FBRztRQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztDQUFBLENBQUMsQ0FBQzs7SUFJM0QsWUFBWTtXQUFaLFlBQVk7O0FBRXJCLFVBRlMsWUFBWSxHQUVOO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixZQUFZOztBQUcvQixNQUFNLFFBQVEsR0FBRztBQUNoQixZQUFTLEVBQUUsQ0FBQztBQUNaLGlCQUFjLEVBQUUsSUFBSTtHQUNwQixDQUFBO0FBQ0QsNkJBUG1CLFlBQVksNkNBT3pCLE9BQU8sRUFBRSxRQUFRLEVBQUU7O0FBRXpCLFVBQVEsQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0FBQ2xELFVBQVEsQ0FBQyxNQUFNLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBQzVELDZCQVhtQixZQUFZLHlDQVdqQixRQUFRLEVBQUU7QUFDeEIsNkJBWm1CLFlBQVksNENBWVo7RUFDbkI7O2NBYm1CLFlBQVk7O1NBZTNCLGlCQUFHO0FBQ1AsV0FBUSxDQUFDLEtBQUssRUFBRSxDQUFDOztHQUVqQjs7O1NBRUcsZ0JBQUc7QUFDTixXQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7R0FDaEI7OztTQUVnQiw2QkFBRztBQUNuQixVQUFPLE1BQU0sQ0FBQztHQUNkOzs7UUExQm1CLFlBQVk7R0FBUyxzQkFBSSxJQUFJLENBQUMsT0FBTzs7cUJBQXJDLFlBQVkiLCJmaWxlIjoic3JjL2NsaWVudC9jb21tb24vbGZvLWRhdGEtcmVjb3JkZXItYmFja3VwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuXG5sZXQgcGhyYXNlID0ge307XG5jb25zdCByZWNvcmRlciA9IG5ldyBsZm8uc2lua3MuRGF0YVJlY29yZGVyKHtcblx0Ly9mcmFtZVNpemU6IDMsXG5cdC8vc2VwYXJhdGVBcnJheXM6IHRydWVcbn0pO1xuXG5jb25zdCB1cGRhdGVQaHJhc2UgPSAoZGF0YSkgPT4ge1xuXHQvLyBtYWtlIGl0IGRpcmVjdGx5IGNvbXBhdGlibGUgd2l0aCB4bW0gcGhyYXNlcyA6XG5cdGNvbnNvbGUubG9nKGRhdGEpO1xuXHRwaHJhc2UgPSB7fTtcblx0cGhyYXNlLmJpbW9kYWwgPSBmYWxzZTtcblx0cGhyYXNlLmRpbWVuc2lvbiA9IDM7XG5cdHBocmFzZS5kaW1lbnNpb25faW5wdXQgPSAwO1xuXHRwaHJhc2UuY29sdW1uX25hbWVzID0gWydtYWduaXR1ZGUnLCAnZnJlcXVlbmN5JywgJ3BlcmlvZGljaXR5J107XG5cdHBocmFzZS5kYXRhID0gW107XG5cdGZvcihsZXQgdmVjaWQgaW4gZGF0YS5kYXRhKSB7XG5cdFx0Zm9yKGxldCBpZCBpbiBkYXRhLmRhdGFbdmVjaWRdKSB7XG5cdFx0XHRwaHJhc2UuZGF0YS5wdXNoKGRhdGEuZGF0YVt2ZWNpZF1baWRdKTtcblx0XHR9XG5cdH1cblx0cGhyYXNlLmxlbmd0aCA9IGRhdGEudGltZS5sZW5ndGg7XG5cdHJlY29yZGVyLnJldHJpZXZlKCkudGhlbih1cGRhdGVQaHJhc2UpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKSk7XG59O1xuXG5yZWNvcmRlci5yZXRyaWV2ZSgpLnRoZW4odXBkYXRlUGhyYXNlKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVyci5zdGFjaykpO1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YVJlY29yZGVyIGV4dGVuZHMgbGZvLmNvcmUuQmFzZUxmbyB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRmcmFtZVNpemU6IDMsXG5cdFx0XHRzZXBhcmF0ZUFycmF5czogdHJ1ZVxuXHRcdH1cblx0XHRzdXBlcihvcHRpb25zLCBkZWZhdWx0cyk7XG5cblx0XHRyZWNvcmRlci5wYXJhbXMuZnJhbWVTaXplID0gdGhpcy5wYXJhbXMuZnJhbWVTaXplO1xuXHRcdHJlY29yZGVyLnBhcmFtcy5zZXBhcmF0ZUFycmF5cyA9IHRoaXMucGFyYW1zLnNlcGFyYXRlQXJyYXlzO1xuXHRcdHN1cGVyLmNvbm5lY3QocmVjb3JkZXIpO1xuXHRcdHN1cGVyLmluaXRpYWxpemUoKTtcblx0fVxuXG5cdHN0YXJ0KCkge1xuXHRcdHJlY29yZGVyLnN0YXJ0KCk7XG5cdFx0Ly9jb25zb2xlLmxvZyh0aGlzLnJlY29yZGVyLnBhcmFtcy5zZXBhcmF0ZUFycmF5cyk7XG5cdH1cblxuXHRzdG9wKCkge1xuXHRcdHJlY29yZGVyLnN0b3AoKTtcblx0fVxuXG5cdGdldFJlY29yZGVkUGhyYXNlKCkge1xuXHRcdHJldHVybiBwaHJhc2U7XG5cdH1cbn1cbiJdfQ==