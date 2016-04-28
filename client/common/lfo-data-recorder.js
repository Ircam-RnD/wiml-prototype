'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

var DataRecorder = (function (_lfo$sinks$DataRecorder) {
	_inherits(DataRecorder, _lfo$sinks$DataRecorder);

	function DataRecorder() {
		var _this = this;

		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, DataRecorder);

		var defaults = {
			frameSize: 3,
			separateArrays: true
		};
		_get(Object.getPrototypeOf(DataRecorder.prototype), 'constructor', this).call(this, defaults, options);

		this.phrase = {};

		this.updatePhrase = function (data) {
			console.log(data.data);
			_this.phrase = {};
			_this.phrase.bimodal = false;
			_this.phrase.dimension = 3;
			_this.phrase.dimension_input = 0;
			_this.phrase.column_names = ['magnitude', 'frequency', 'periodicity'];
			_this.phrase.data = [];
			for (var vecid in data.data) {
				for (var id in data.data[vecid]) {
					_this.phrase.data.push(data.data[vecid][id]);
				}
			}
			_this.phrase.length = data.time.length;
			_this.retrieve().then(_this.updatePhrase.bind(_this))['catch'](function (err) {
				return console.error(err.stack);
			});
		};

		this.retrieve().then(this.updatePhrase.bind(this))['catch'](function (err) {
			return console.error(err.stack);
		});
	}

	_createClass(DataRecorder, [{
		key: 'getRecordedPhrase',
		value: function getRecordedPhrase() {
			return this.phrase;
		}
	}]);

	return DataRecorder;
})(lfo.sinks.DataRecorder);

exports['default'] = DataRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7O0lBRU0sWUFBWTtXQUFaLFlBQVk7O0FBRXJCLFVBRlMsWUFBWSxHQUVOOzs7TUFBZCxPQUFPLHlEQUFHLEVBQUU7O3dCQUZKLFlBQVk7O0FBRy9CLE1BQU0sUUFBUSxHQUFHO0FBQ2hCLFlBQVMsRUFBRSxDQUFDO0FBQ1osaUJBQWMsRUFBRSxJQUFJO0dBQ3BCLENBQUE7QUFDRCw2QkFQbUIsWUFBWSw2Q0FPekIsUUFBUSxFQUFFLE9BQU8sRUFBRTs7QUFFekIsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWpCLE1BQUksQ0FBQyxZQUFZLEdBQUksVUFBQyxJQUFJLEVBQUs7QUFDOUIsVUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkIsU0FBSyxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFNBQUssTUFBTSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDNUIsU0FBSyxNQUFNLENBQUMsU0FBUyxHQUFHLENBQUMsQ0FBQztBQUMxQixTQUFLLE1BQU0sQ0FBQyxlQUFlLEdBQUcsQ0FBQyxDQUFDO0FBQ2hDLFNBQUssTUFBTSxDQUFDLFlBQVksR0FBRyxDQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUUsYUFBYSxDQUFDLENBQUM7QUFDckUsU0FBSyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN0QixRQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDM0IsU0FBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQy9CLFdBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQ0Q7QUFDRCxTQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDdEMsU0FBSyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBSyxZQUFZLENBQUMsSUFBSSxPQUFNLENBQUMsU0FBTSxDQUFDLFVBQUMsR0FBRztXQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztJQUFBLENBQUMsQ0FBQztHQUM1RixBQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFNLENBQUMsVUFBQyxHQUFHO1VBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUFDO0VBQzVGOztjQTdCbUIsWUFBWTs7U0ErQmYsNkJBQUc7QUFDbkIsVUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDO0dBQ25COzs7UUFqQ21CLFlBQVk7R0FBUyxHQUFHLENBQUMsS0FBSyxDQUFDLFlBQVk7O3FCQUEzQyxZQUFZIiwiZmlsZSI6InNyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERhdGFSZWNvcmRlciBleHRlbmRzIGxmby5zaW5rcy5EYXRhUmVjb3JkZXIge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0ZnJhbWVTaXplOiAzLFxuXHRcdFx0c2VwYXJhdGVBcnJheXM6IHRydWVcblx0XHR9XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5waHJhc2UgPSB7fTtcblxuXHRcdHRoaXMudXBkYXRlUGhyYXNlID0gKChkYXRhKSA9PiB7XG5cdFx0XHRjb25zb2xlLmxvZyhkYXRhLmRhdGEpO1xuXHRcdFx0dGhpcy5waHJhc2UgPSB7fTtcblx0XHRcdHRoaXMucGhyYXNlLmJpbW9kYWwgPSBmYWxzZTtcblx0XHRcdHRoaXMucGhyYXNlLmRpbWVuc2lvbiA9IDM7XG5cdFx0XHR0aGlzLnBocmFzZS5kaW1lbnNpb25faW5wdXQgPSAwO1xuXHRcdFx0dGhpcy5waHJhc2UuY29sdW1uX25hbWVzID0gWydtYWduaXR1ZGUnLCAnZnJlcXVlbmN5JywgJ3BlcmlvZGljaXR5J107XG5cdFx0XHR0aGlzLnBocmFzZS5kYXRhID0gW107XG5cdFx0XHRmb3IobGV0IHZlY2lkIGluIGRhdGEuZGF0YSkge1xuXHRcdFx0XHRmb3IobGV0IGlkIGluIGRhdGEuZGF0YVt2ZWNpZF0pIHtcblx0XHRcdFx0XHR0aGlzLnBocmFzZS5kYXRhLnB1c2goZGF0YS5kYXRhW3ZlY2lkXVtpZF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnBocmFzZS5sZW5ndGggPSBkYXRhLnRpbWUubGVuZ3RoO1xuXHRcdFx0dGhpcy5yZXRyaWV2ZSgpLnRoZW4odGhpcy51cGRhdGVQaHJhc2UuYmluZCh0aGlzKSkuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcdFx0XHRcblx0XHR9KTtcblxuXHRcdHRoaXMucmV0cmlldmUoKS50aGVuKHRoaXMudXBkYXRlUGhyYXNlLmJpbmQodGhpcykpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKSk7XG5cdH1cblxuXHRnZXRSZWNvcmRlZFBocmFzZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5waHJhc2U7XG5cdH1cbn1cbiJdfQ==