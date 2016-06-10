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
			this.params.column_names = options.column_names.slice(0);
			//console.log(this.params.column_names);
		}

		this.phrase = {};

		this.updatePhrase = function (data) {
			//console.log(data.data);
			_this.phrase = {};
			_this.phrase.bimodal = _this.params.bimodal;
			_this.phrase.dimension = _this.streamParams.frameSize;
			_this.phrase.dimension_input = 0;
			_this.phrase.column_names = _this.params.column_names.slice(0);
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
			console.log(this.params.column_names);
			return this.phrase;
		}
	}]);

	return DataRecorder;
})(lfo.sinks.DataRecorder);

exports['default'] = DataRecorder;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1kYXRhLXJlY29yZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBQXFCLFdBQVc7O0lBQXBCLEdBQUc7O0lBRU0sWUFBWTtXQUFaLFlBQVk7O0FBRXJCLFVBRlMsWUFBWSxHQUVOOzs7TUFBZCxPQUFPLHlEQUFHLEVBQUU7O3dCQUZKLFlBQVk7O0FBRy9CLE1BQU0sUUFBUSxHQUFHOztBQUVoQixpQkFBYyxFQUFFLElBQUk7QUFDcEIsVUFBTyxFQUFFLEtBQUs7R0FFZCxDQUFBOztBQUNELDZCQVRtQixZQUFZLDZDQVN6QixRQUFRLEVBQUUsT0FBTyxFQUFFO0FBQ3pCLE1BQUcsT0FBTyxDQUFDLFlBQVksS0FBSyxTQUFTLEVBQUU7QUFDdEMsT0FBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7O0dBRXpEOztBQUVELE1BQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDOztBQUVqQixNQUFJLENBQUMsWUFBWSxHQUFJLFVBQUMsSUFBSSxFQUFLOztBQUU5QixTQUFLLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDakIsU0FBSyxNQUFNLENBQUMsT0FBTyxHQUFHLE1BQUssTUFBTSxDQUFDLE9BQU8sQ0FBQztBQUMxQyxTQUFLLE1BQU0sQ0FBQyxTQUFTLEdBQUcsTUFBSyxZQUFZLENBQUMsU0FBUyxDQUFDO0FBQ3BELFNBQUssTUFBTSxDQUFDLGVBQWUsR0FBRyxDQUFDLENBQUM7QUFDaEMsU0FBSyxNQUFNLENBQUMsWUFBWSxHQUFHLE1BQUssTUFBTSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsU0FBSyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUN0QixRQUFJLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDM0IsU0FBSSxJQUFJLEVBQUUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO0FBQy9CLFdBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0tBQzVDO0lBQ0Q7QUFDRCxTQUFLLE1BQU0sQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDdEMsU0FBSyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsTUFBSyxZQUFZLENBQUMsSUFBSSxPQUFNLENBQUMsU0FBTSxDQUFDLFVBQUMsR0FBRztXQUFLLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztJQUFBLENBQUMsQ0FBQztHQUM1RixBQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxTQUFNLENBQUMsVUFBQyxHQUFHO1VBQUssT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO0dBQUEsQ0FBQyxDQUFDO0VBQzVGOztjQW5DbUIsWUFBWTs7U0FxQ3RCLHNCQUFvQjtPQUFuQixZQUFZLHlEQUFHLEVBQUU7O0FBQzNCLDhCQXRDbUIsWUFBWSw0Q0FzQ2QsWUFBWSxFQUFFO0FBQy9CLE9BQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDO0dBQ3BEOzs7U0FFZ0IsNkJBQUc7QUFDbkIsVUFBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3RDLFVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztHQUNuQjs7O1FBN0NtQixZQUFZO0dBQVMsR0FBRyxDQUFDLEtBQUssQ0FBQyxZQUFZOztxQkFBM0MsWUFBWSIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8tZGF0YS1yZWNvcmRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEYXRhUmVjb3JkZXIgZXh0ZW5kcyBsZm8uc2lua3MuRGF0YVJlY29yZGVyIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdC8vZnJhbWVTaXplOiAzLFxuXHRcdFx0c2VwYXJhdGVBcnJheXM6IHRydWUsXG5cdFx0XHRiaW1vZGFsOiBmYWxzZSxcblx0XHRcdC8vY29sdW1uX25hbWVzOiBbJ21hZ25pdHVkZScsICdmcmVxdWVuY3knLCAncGVyaW9kaWNpdHknXVxuXHRcdH1cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cdFx0aWYob3B0aW9ucy5jb2x1bW5fbmFtZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5wYXJhbXMuY29sdW1uX25hbWVzID0gb3B0aW9ucy5jb2x1bW5fbmFtZXMuc2xpY2UoMCk7XG5cdFx0XHQvL2NvbnNvbGUubG9nKHRoaXMucGFyYW1zLmNvbHVtbl9uYW1lcyk7XG5cdFx0fVxuXG5cdFx0dGhpcy5waHJhc2UgPSB7fTtcblxuXHRcdHRoaXMudXBkYXRlUGhyYXNlID0gKChkYXRhKSA9PiB7XG5cdFx0XHQvL2NvbnNvbGUubG9nKGRhdGEuZGF0YSk7XG5cdFx0XHR0aGlzLnBocmFzZSA9IHt9O1xuXHRcdFx0dGhpcy5waHJhc2UuYmltb2RhbCA9IHRoaXMucGFyYW1zLmJpbW9kYWw7XG5cdFx0XHR0aGlzLnBocmFzZS5kaW1lbnNpb24gPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cdFx0XHR0aGlzLnBocmFzZS5kaW1lbnNpb25faW5wdXQgPSAwO1xuXHRcdFx0dGhpcy5waHJhc2UuY29sdW1uX25hbWVzID0gdGhpcy5wYXJhbXMuY29sdW1uX25hbWVzLnNsaWNlKDApO1xuXHRcdFx0dGhpcy5waHJhc2UuZGF0YSA9IFtdO1xuXHRcdFx0Zm9yKGxldCB2ZWNpZCBpbiBkYXRhLmRhdGEpIHtcblx0XHRcdFx0Zm9yKGxldCBpZCBpbiBkYXRhLmRhdGFbdmVjaWRdKSB7XG5cdFx0XHRcdFx0dGhpcy5waHJhc2UuZGF0YS5wdXNoKGRhdGEuZGF0YVt2ZWNpZF1baWRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhpcy5waHJhc2UubGVuZ3RoID0gZGF0YS50aW1lLmxlbmd0aDtcblx0XHRcdHRoaXMucmV0cmlldmUoKS50aGVuKHRoaXMudXBkYXRlUGhyYXNlLmJpbmQodGhpcykpLmNhdGNoKChlcnIpID0+IGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKSk7XHRcdFx0XG5cdFx0fSk7XG5cblx0XHR0aGlzLnJldHJpZXZlKCkudGhlbih0aGlzLnVwZGF0ZVBocmFzZS5iaW5kKHRoaXMpKS5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmVycm9yKGVyci5zdGFjaykpO1xuXHR9XG5cblx0aW5pdGlhbGl6ZShzdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdHN1cGVyLmluaXRpYWxpemUoc3RyZWFtUGFyYW1zKTtcblx0XHR0aGlzLnBocmFzZS5kaW1lbnNpb24gPSB0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemU7XG5cdH1cblxuXHRnZXRSZWNvcmRlZFBocmFzZSgpIHtcblx0XHRjb25zb2xlLmxvZyh0aGlzLnBhcmFtcy5jb2x1bW5fbmFtZXMpO1xuXHRcdHJldHVybiB0aGlzLnBocmFzZTtcblx0fVxufVxuIl19