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
			//frameSize: 3,
			separateArrays: true,
			bimodal: false
		};
		//column_names: ['magnitude', 'frequency', 'periodicity']
		_get(Object.getPrototypeOf(DataRecorder.prototype), 'constructor', this).call(this, defaults, options);
		if (options.column_names !== undefined) {
			this.params.column_names = options.column_names.splice(0);
		}

		this.phrase = {};

		this.updatePhrase = function (data) {
			//console.log(data.data);
			_this.phrase = {};
			_this.phrase.bimodal = _this.params.bimodal;
			_this.phrase.dimension = _this.streamParams.frameSize;
			_this.phrase.dimension_input = 0;
			_this.phrase.column_names = _this.params.column_names.splice(0);
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
		key: 'initialize',
		value: function initialize() {
			var streamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			_get(Object.getPrototypeOf(DataRecorder.prototype), 'initialize', this).call(this, streamParams);
			this.phrase.dimension = this.streamParams.frameSize;
		}
	}, {
		key: 'getRecordedPhrase',
		value: function getRecordedPhrase() {
			return this.phrase;
		}
	}]);

	return DataRecorder;
})(lfo.sinks.DataRecorder);

exports['default'] = DataRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7O0lBRU0sWUFBWTtXQUFaLFlBQVk7O0FBRXJCLFVBRlMsWUFBWSxHQUVOOzs7TUFBZCxPQUFPLHlEQUFHLEVBQUU7O3dCQUZKLFlBQVk7O0FBRy9CLE1BQU0sUUFBUSxHQUFHOztBQUVoQixpQkFBYyxFQUFFLElBQUk7QUFDcEIsVUFBTyxFQUFFLEtBQUs7R0FFZCxDQUFBOztBQUNELDZCQVRtQixZQUFZLDZDQVN6QixRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQ3pCLE1BQUcsT0FBTyxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7QUFDdEMsT0FBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDMUQ7O0FBRUQsTUFBSSxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWpCLE1BQUksQ0FBQyxZQUFZLEdBQUksVUFBQyxJQUFJLEVBQUs7O0FBRTlCLFNBQUssTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUNqQixTQUFLLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBSyxNQUFNLENBQUMsT0FBTyxDQUFDO0FBQzFDLFNBQUssTUFBTSxDQUFDLFNBQVMsR0FBRyxNQUFLLFlBQVksQ0FBQyxTQUFTLENBQUM7QUFDcEQsU0FBSyxNQUFNLENBQUMsZUFBZSxHQUFHLENBQUMsQ0FBQztBQUNoQyxTQUFLLE1BQU0sQ0FBQyxZQUFZLEdBQUcsTUFBSyxNQUFNLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5RCxTQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUMzQixTQUFJLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDL0IsV0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUM7SUFDRDtBQUNELFNBQUssTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN0QyxTQUFLLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFLLFlBQVksQ0FBQyxJQUFJLE9BQU0sQ0FBQyxTQUFNLENBQUMsVUFBQyxHQUFHO1dBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQUEsQ0FBQyxDQUFDO0dBQzVGLEFBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQU0sQ0FBQyxVQUFDLEdBQUc7VUFBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7R0FBQSxDQUFDLENBQUM7RUFDNUY7O2NBbENtQixZQUFZOztTQW9DdEIsc0JBQW9CO09BQW5CLFlBQVkseURBQUcsRUFBRTs7QUFDM0IsOEJBckNtQixZQUFZLDRDQXFDZCxZQUFZLEVBQUU7QUFDL0IsT0FBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUM7R0FDcEQ7OztTQUVnQiw2QkFBRztBQUNuQixVQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7R0FDbkI7OztRQTNDbUIsWUFBWTtHQUFTLEdBQUcsQ0FBQyxLQUFLLENBQUMsWUFBWTs7cUJBQTNDLFlBQVkiLCJmaWxlIjoic3JjL2NsaWVudC9jb21tb24vbGZvLWRhdGEtcmVjb3JkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YVJlY29yZGVyIGV4dGVuZHMgbGZvLnNpbmtzLkRhdGFSZWNvcmRlciB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHQvL2ZyYW1lU2l6ZTogMyxcblx0XHRcdHNlcGFyYXRlQXJyYXlzOiB0cnVlLFxuXHRcdFx0Ymltb2RhbDogZmFsc2UsXG5cdFx0XHQvL2NvbHVtbl9uYW1lczogWydtYWduaXR1ZGUnLCAnZnJlcXVlbmN5JywgJ3BlcmlvZGljaXR5J11cblx0XHR9XG5cdFx0c3VwZXIoZGVmYXVsdHMsIG9wdGlvbnMpO1xuXHRcdGlmKG9wdGlvbnMuY29sdW1uX25hbWVzICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHRoaXMucGFyYW1zLmNvbHVtbl9uYW1lcyA9IG9wdGlvbnMuY29sdW1uX25hbWVzLnNwbGljZSgwKTtcblx0XHR9XG5cblx0XHR0aGlzLnBocmFzZSA9IHt9O1xuXG5cdFx0dGhpcy51cGRhdGVQaHJhc2UgPSAoKGRhdGEpID0+IHtcblx0XHRcdC8vY29uc29sZS5sb2coZGF0YS5kYXRhKTtcblx0XHRcdHRoaXMucGhyYXNlID0ge307XG5cdFx0XHR0aGlzLnBocmFzZS5iaW1vZGFsID0gdGhpcy5wYXJhbXMuYmltb2RhbDtcblx0XHRcdHRoaXMucGhyYXNlLmRpbWVuc2lvbiA9IHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcblx0XHRcdHRoaXMucGhyYXNlLmRpbWVuc2lvbl9pbnB1dCA9IDA7XG5cdFx0XHR0aGlzLnBocmFzZS5jb2x1bW5fbmFtZXMgPSB0aGlzLnBhcmFtcy5jb2x1bW5fbmFtZXMuc3BsaWNlKDApO1xuXHRcdFx0dGhpcy5waHJhc2UuZGF0YSA9IFtdO1xuXHRcdFx0Zm9yKGxldCB2ZWNpZCBpbiBkYXRhLmRhdGEpIHtcblx0XHRcdFx0Zm9yKGxldCBpZCBpbiBkYXRhLmRhdGFbdmVjaWRdKSB7XG5cdFx0XHRcdFx0dGhpcy5waHJhc2UuZGF0YS5wdXNoKGRhdGEuZGF0YVt2ZWNpZF1baWRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5waHJhc2UubGVuZ3RoID0gZGF0YS50aW1lLmxlbmd0aDtcblx0XHRcdHRoaXMucmV0cmlldmUoKS50aGVuKHRoaXMudXBkYXRlUGhyYXNlLmJpbmQodGhpcykpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKSk7XHRcdFx0XG5cdFx0fSk7XG5cblx0XHR0aGlzLnJldHJpZXZlKCkudGhlbih0aGlzLnVwZGF0ZVBocmFzZS5iaW5kKHRoaXMpKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVyci5zdGFjaykpO1xuXHR9XG5cblx0aW5pdGlhbGl6ZShzdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdHN1cGVyLmluaXRpYWxpemUoc3RyZWFtUGFyYW1zKTtcblx0XHR0aGlzLnBocmFzZS5kaW1lbnNpb24gPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cdH1cblxuXHRnZXRSZWNvcmRlZFBocmFzZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5waHJhc2U7XG5cdH1cbn1cbiJdfQ==