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
})(_wavesLfo2['default'].sinks.DataRecorder);

exports['default'] = DataRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQWdCLFdBQVc7Ozs7SUFFTixZQUFZO1dBQVosWUFBWTs7QUFFckIsVUFGUyxZQUFZLEdBRU47OztNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBRkosWUFBWTs7QUFHL0IsTUFBTSxRQUFRLEdBQUc7QUFDaEIsWUFBUyxFQUFFLENBQUM7QUFDWixpQkFBYyxFQUFFLElBQUk7R0FDcEIsQ0FBQTtBQUNELDZCQVBtQixZQUFZLDZDQU96QixRQUFRLEVBQUUsT0FBTyxFQUFFOztBQUV6QixNQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQzs7QUFFakIsTUFBSSxDQUFDLFlBQVksR0FBSSxVQUFDLElBQUksRUFBSztBQUM5QixVQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixTQUFLLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsU0FBSyxNQUFNLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUM1QixTQUFLLE1BQU0sQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQzFCLFNBQUssTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDaEMsU0FBSyxNQUFNLENBQUMsWUFBWSxHQUFHLENBQUMsV0FBVyxFQUFFLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztBQUNyRSxTQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3RCLFFBQUksSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtBQUMzQixTQUFJLElBQUksRUFBRSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7QUFDL0IsV0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUM7SUFDRDtBQUNELFNBQUssTUFBTSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN0QyxTQUFLLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxNQUFLLFlBQVksQ0FBQyxJQUFJLE9BQU0sQ0FBQyxTQUFNLENBQUMsVUFBQyxHQUFHO1dBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQUEsQ0FBQyxDQUFDO0dBQzVGLEFBQUMsQ0FBQzs7QUFFSCxNQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQU0sQ0FBQyxVQUFDLEdBQUc7VUFBSyxPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7R0FBQSxDQUFDLENBQUM7RUFDNUY7O2NBN0JtQixZQUFZOztTQStCZiw2QkFBRztBQUNuQixVQUFPLElBQUksQ0FBQyxNQUFNLENBQUM7R0FDbkI7OztRQWpDbUIsWUFBWTtHQUFTLHNCQUFJLEtBQUssQ0FBQyxZQUFZOztxQkFBM0MsWUFBWSIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8tZGF0YS1yZWNvcmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBsZm8gZnJvbSAnd2F2ZXMtbGZvJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGF0YVJlY29yZGVyIGV4dGVuZHMgbGZvLnNpbmtzLkRhdGFSZWNvcmRlciB7XG5cblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRmcmFtZVNpemU6IDMsXG5cdFx0XHRzZXBhcmF0ZUFycmF5czogdHJ1ZVxuXHRcdH1cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLnBocmFzZSA9IHt9O1xuXG5cdFx0dGhpcy51cGRhdGVQaHJhc2UgPSAoKGRhdGEpID0+IHtcblx0XHRcdGNvbnNvbGUubG9nKGRhdGEuZGF0YSk7XG5cdFx0XHR0aGlzLnBocmFzZSA9IHt9O1xuXHRcdFx0dGhpcy5waHJhc2UuYmltb2RhbCA9IGZhbHNlO1xuXHRcdFx0dGhpcy5waHJhc2UuZGltZW5zaW9uID0gMztcblx0XHRcdHRoaXMucGhyYXNlLmRpbWVuc2lvbl9pbnB1dCA9IDA7XG5cdFx0XHR0aGlzLnBocmFzZS5jb2x1bW5fbmFtZXMgPSBbJ21hZ25pdHVkZScsICdmcmVxdWVuY3knLCAncGVyaW9kaWNpdHknXTtcblx0XHRcdHRoaXMucGhyYXNlLmRhdGEgPSBbXTtcblx0XHRcdGZvcihsZXQgdmVjaWQgaW4gZGF0YS5kYXRhKSB7XG5cdFx0XHRcdGZvcihsZXQgaWQgaW4gZGF0YS5kYXRhW3ZlY2lkXSkge1xuXHRcdFx0XHRcdHRoaXMucGhyYXNlLmRhdGEucHVzaChkYXRhLmRhdGFbdmVjaWRdW2lkXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucGhyYXNlLmxlbmd0aCA9IGRhdGEudGltZS5sZW5ndGg7XG5cdFx0XHR0aGlzLnJldHJpZXZlKCkudGhlbih0aGlzLnVwZGF0ZVBocmFzZS5iaW5kKHRoaXMpKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVyci5zdGFjaykpO1x0XHRcdFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5yZXRyaWV2ZSgpLnRoZW4odGhpcy51cGRhdGVQaHJhc2UuYmluZCh0aGlzKSkuY2F0Y2goKGVycikgPT4gY29uc29sZS5lcnJvcihlcnIuc3RhY2spKTtcblx0fVxuXG5cdGdldFJlY29yZGVkUGhyYXNlKCkge1xuXHRcdHJldHVybiB0aGlzLnBocmFzZTtcblx0fVxufVxuIl19