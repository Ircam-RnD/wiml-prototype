'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Object$assign = require('babel-runtime/core-js/object/assign')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _child_process = require('child_process');

var _child_process2 = _interopRequireDefault(_child_process);

// flag to avoid concurrent access (TODO : remove by improving child process)
var busy = false;
var relativeBinPath = '/bin/xmm-server-tool';

var exec = _child_process2['default'].exec;
var child = exec(process.cwd() + relativeBinPath, function (err, stdout, stderr) {});

child.stdout.on('data', function (data) {
	console.log('xmm-server-tool stdout : ' + data);
});

child.stderr.on('data', function (data) {
	console.log('xmm-server-tool stderr : ' + data);
});

function cleanExit(options) {
	child.stdin.pause(); // -> mandatory ?
	child.kill();

	if (options.code === 'SIGTERM') {
		process.exit(0);
	}
}
process.on('SIGTERM', function () {
	cleanExit({ code: 'SIGTERM' });
});

//export
function tellXmm(argString) {
	var realArgs = argString;
	if (argString.slice(-1) != '\n') {
		realArgs += '\n';
	}
	child.stdin.write(realArgs);
}

//===================================================================================//

var XmmChildProcess = (function () {
	function XmmChildProcess() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, XmmChildProcess);

		var defaults = {
			parentid: ''
		};

		var args = _Object$assign(defaults, options);

		this.parentid = defaults.parentid;
	}

	_createClass(XmmChildProcess, [{
		key: 'configureModels',
		value: function configureModels(modelType, args) {
			var _this = this;

			return new _Promise(function (resolve) {
				// build command line :
				var configString = 'config' + ' ' + modelType;
				if (args.gaussians !== undefined) {
					configString += ' --gaussians ' + args.gaussians;
				}
				if (args.states !== undefined) {
					configString += ' --states ' + args.states;
				}
				if (args.relativeRegularization !== undefined) {
					configString += ' --relative_regularization ' + args.relativeRegularization;
				}
				if (args.absoluteRegularization !== undefined) {
					configString += ' --absolute_regularization ' + args.absoluteRegularization;
				}
				configString += ' --sender ' + _this.parentid + '\n';
				//console.log(configString);

				// send command line to xmm :
				child.stdin.write(configString);

				child.stdout.on('data', function (data) {
					// listen for xmm confirmation messages
					var response = data.replace('\n', '').split(' ');
					//if(response.length === 4 && response[0] === 'config' && response[2] === '--sender' && response[3] === this.parentid) {
					if (response[0] === 'config') {
						if (response.length === 4 && response[1] === 'ok' && response[2] === '--sender' && response[3] === _this.parentid) {
							console.log('config ok : ' + data);
							resolve(response[1]);
						}
					}
				});
			});
		}
	}, {
		key: 'trainModels',
		value: function trainModels(modelType, dbName, srcCollName, dstCollName, args) {
			var _this2 = this;

			return new _Promise(function (resolve) {
				// build command line :
				var i = undefined;
				var trainString = 'train ' + modelType + ' ' + dbName + ' ' + srcCollName + ' ' + dstCollName;
				trainString += ' --sender ' + _this2.parentid + ' --labels ';
				for (i in args.labels) {
					trainString += args.labels[i] + ' ';
				}
				trainString += '--colnames';
				for (i in args.column_names) {
					trainString += ' ' + args.column_names[i];
				}
				trainString += '\n';

				console.log(trainString);

				// send command line to xmm :
				child.stdin.write(trainString);

				child.stdout.on('data', function (data) {
					// listen for xmm confirmation messages
					//let trim = data.replace('\n', '');
					//let response = trim.split(' ');
					var response = data.replace('\n', '').split(' ');
					//if(response.length === 4 && response[0] === 'train' && response[2] === '--sender' && response[3] === this.parentid) {
					if (response[0] === 'train') {
						if (response.length === 4 && response[1] === 'ok' && response[2] === '--sender' && response[3] === _this2.parentid) {
							console.log('train ok : ' + data);
							resolve(response[1]);
						}
						// } else {
						// 	trainModels(modelType, dbName, srcCollName, dstCollName, args);
					}
				});

				// child.stderr.on('data', (data) => {
				// 	reject(data);
				// });
			});
		}

		// in case we want to speak
	}, {
		key: 'tell',
		value: function tell(args) {
			var realArgs = args;
			if (args.slice(-1) != '\n') {
				realArgs += '\n';
			}
			child.stdin.write(realArgs);
		}
	}]);

	return XmmChildProcess;
})();

exports['default'] = XmmChildProcess;
;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIveG1tLWNoaWxkLXByb2Nlc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFBMEIsZUFBZTs7Ozs7QUFHekMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ25CLElBQU0sZUFBZSxHQUFHLHNCQUFzQixDQUFDOztBQUUvQyxJQUFNLElBQUksR0FBRywyQkFBYyxJQUFJLENBQUM7QUFDaEMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxlQUFlLEVBQUUsVUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBSyxFQUFFLENBQUMsQ0FBQzs7QUFFakYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ2pDLFFBQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLENBQUM7Q0FDaEQsQ0FBQyxDQUFDOztBQUVILEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLElBQUksRUFBSztBQUNqQyxRQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxDQUFDO0NBQ2hELENBQUMsQ0FBQzs7QUFFSCxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUU7QUFDM0IsTUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixNQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWIsS0FBRyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUM5QixTQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2hCO0NBQ0Q7QUFDRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxZQUFNO0FBQUUsVUFBUyxDQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7Q0FBRSxDQUFDLENBQUM7OztBQUdq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LElBQUksRUFBRTtBQUNWLE9BQUksUUFBUSxHQUFHLElBQUksQ0FBQztBQUNwQixPQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDMUIsWUFBUSxJQUFJLElBQUksQ0FBQztJQUNqQjtBQUNELFFBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzVCOzs7UUFoR21CLGVBQWU7OztxQkFBZixlQUFlO0FBaUduQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIveG1tLWNoaWxkLXByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuLy8gZmxhZyB0byBhdm9pZCBjb25jdXJyZW50IGFjY2VzcyAoVE9ETyA6IHJlbW92ZSBieSBpbXByb3ZpbmcgY2hpbGQgcHJvY2VzcylcbmNvbnN0IGJ1c3kgPSBmYWxzZTtcbmNvbnN0IHJlbGF0aXZlQmluUGF0aCA9ICcvYmluL3htbS1zZXJ2ZXItdG9vbCc7XG5cbmNvbnN0IGV4ZWMgPSBjaGlsZF9wcm9jZXNzLmV4ZWM7XG5jb25zdCBjaGlsZCA9IGV4ZWMocHJvY2Vzcy5jd2QoKSArIHJlbGF0aXZlQmluUGF0aCwgKGVyciwgc3Rkb3V0LCBzdGRlcnIpID0+IHt9KTtcblxuY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coJ3htbS1zZXJ2ZXItdG9vbCBzdGRvdXQgOiAnICsgZGF0YSk7XG59KTtcblxuY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coJ3htbS1zZXJ2ZXItdG9vbCBzdGRlcnIgOiAnICsgZGF0YSk7XG59KTtcblxuZnVuY3Rpb24gY2xlYW5FeGl0KG9wdGlvbnMpIHtcblx0Y2hpbGQuc3RkaW4ucGF1c2UoKTsgLy8gLT4gbWFuZGF0b3J5ID9cblx0Y2hpbGQua2lsbCgpO1xuXG5cdGlmKG9wdGlvbnMuY29kZSA9PT0gJ1NJR1RFUk0nKSB7XG5cdFx0cHJvY2Vzcy5leGl0KDApO1xuXHR9XG59XG5wcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4geyBjbGVhbkV4aXQoIHsgY29kZTogJ1NJR1RFUk0nIH0pIH0pO1xuXG4vL2V4cG9ydFxuZnVuY3Rpb24gdGVsbFhtbShhcmdTdHJpbmcpIHtcblx0bGV0IHJlYWxBcmdzID0gYXJnU3RyaW5nO1xuXHRpZihhcmdTdHJpbmcuc2xpY2UoLTEpICE9ICdcXG4nKSB7XG5cdFx0cmVhbEFyZ3MgKz0gJ1xcbic7XG5cdH1cblx0Y2hpbGQuc3RkaW4ud3JpdGUocmVhbEFyZ3MpO1xufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWG1tQ2hpbGRQcm9jZXNzIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRwYXJlbnRpZDogJydcblx0XHR9O1xuXG5cdFx0Y29uc3QgYXJncyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5wYXJlbnRpZCA9IGRlZmF1bHRzLnBhcmVudGlkO1xuXHR9XG5cblx0Y29uZmlndXJlTW9kZWxzKG1vZGVsVHlwZSwgYXJncykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Ly8gYnVpbGQgY29tbWFuZCBsaW5lIDpcblx0XHRcdGxldCBjb25maWdTdHJpbmcgPSAnY29uZmlnJyArICcgJyArIG1vZGVsVHlwZTtcblx0XHRcdGlmKGFyZ3MuZ2F1c3NpYW5zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29uZmlnU3RyaW5nICs9ICcgLS1nYXVzc2lhbnMgJyArIGFyZ3MuZ2F1c3NpYW5zO1xuXHRcdFx0fVxuXHRcdFx0aWYoYXJncy5zdGF0ZXMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25maWdTdHJpbmcgKz0gJyAtLXN0YXRlcyAnICsgYXJncy5zdGF0ZXM7XG5cdFx0XHR9XG5cdFx0XHRpZihhcmdzLnJlbGF0aXZlUmVndWxhcml6YXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25maWdTdHJpbmcgKz0gJyAtLXJlbGF0aXZlX3JlZ3VsYXJpemF0aW9uICcgKyBhcmdzLnJlbGF0aXZlUmVndWxhcml6YXRpb247XG5cdFx0XHR9XG5cdFx0XHRpZihhcmdzLmFic29sdXRlUmVndWxhcml6YXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25maWdTdHJpbmcgKz0gJyAtLWFic29sdXRlX3JlZ3VsYXJpemF0aW9uICcgKyBhcmdzLmFic29sdXRlUmVndWxhcml6YXRpb247XG5cdFx0XHR9XG5cdFx0XHRjb25maWdTdHJpbmcgKz0gJyAtLXNlbmRlciAnICsgdGhpcy5wYXJlbnRpZCArICdcXG4nO1xuXHRcdFx0Ly9jb25zb2xlLmxvZyhjb25maWdTdHJpbmcpO1xuXG5cdFx0XHQvLyBzZW5kIGNvbW1hbmQgbGluZSB0byB4bW0gOlxuXHRcdFx0Y2hpbGQuc3RkaW4ud3JpdGUoY29uZmlnU3RyaW5nKTtcblxuXHRcdFx0Y2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0XHRcdFx0Ly8gbGlzdGVuIGZvciB4bW0gY29uZmlybWF0aW9uIG1lc3NhZ2VzXG5cdFx0XHRcdGxldCByZXNwb25zZSA9IGRhdGEucmVwbGFjZSgnXFxuJywgJycpLnNwbGl0KCcgJyk7XG5cdFx0XHRcdC8vaWYocmVzcG9uc2UubGVuZ3RoID09PSA0ICYmIHJlc3BvbnNlWzBdID09PSAnY29uZmlnJyAmJiByZXNwb25zZVsyXSA9PT0gJy0tc2VuZGVyJyAmJiByZXNwb25zZVszXSA9PT0gdGhpcy5wYXJlbnRpZCkge1xuXHRcdFx0XHRpZihyZXNwb25zZVswXSA9PT0gJ2NvbmZpZycpIHtcblx0XHRcdFx0XHRpZihyZXNwb25zZS5sZW5ndGggPT09IDQgJiYgcmVzcG9uc2VbMV0gPT09ICdvaycgJiYgcmVzcG9uc2VbMl0gPT09ICctLXNlbmRlcicgJiYgcmVzcG9uc2VbM10gPT09IHRoaXMucGFyZW50aWQpIHtcblx0XHRcdFx0XHRcdGNvbnNvbGUubG9nKCdjb25maWcgb2sgOiAnICsgZGF0YSk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlWzFdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0dHJhaW5Nb2RlbHMobW9kZWxUeXBlLCBkYk5hbWUsIHNyY0NvbGxOYW1lLCBkc3RDb2xsTmFtZSwgYXJncykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0Ly8gYnVpbGQgY29tbWFuZCBsaW5lIDpcblx0XHRcdGxldCBpO1xuXHRcdFx0bGV0IHRyYWluU3RyaW5nID0gJ3RyYWluICcgKyBtb2RlbFR5cGUgKyAnICcgKyBkYk5hbWUgKyAnICcgKyBzcmNDb2xsTmFtZSArICcgJyArIGRzdENvbGxOYW1lIDtcblx0XHRcdHRyYWluU3RyaW5nICs9ICcgLS1zZW5kZXIgJyArIHRoaXMucGFyZW50aWQgKyAnIC0tbGFiZWxzICc7XG5cdFx0XHRmb3IoaSBpbiBhcmdzLmxhYmVscykge1xuXHRcdFx0XHR0cmFpblN0cmluZyArPSBhcmdzLmxhYmVsc1tpXSArICcgJztcblx0XHRcdH1cblx0XHRcdHRyYWluU3RyaW5nICs9ICctLWNvbG5hbWVzJztcblx0XHRcdGZvcihpIGluIGFyZ3MuY29sdW1uX25hbWVzKSB7XG5cdFx0XHRcdHRyYWluU3RyaW5nICs9ICcgJyArIGFyZ3MuY29sdW1uX25hbWVzW2ldO1xuXHRcdFx0fVxuXHRcdFx0dHJhaW5TdHJpbmcgKz0gJ1xcbic7XG5cblx0XHRcdGNvbnNvbGUubG9nKHRyYWluU3RyaW5nKTtcblxuXHRcdFx0Ly8gc2VuZCBjb21tYW5kIGxpbmUgdG8geG1tIDpcblx0XHRcdGNoaWxkLnN0ZGluLndyaXRlKHRyYWluU3RyaW5nKTtcblxuXHRcdFx0XHRjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuXHRcdFx0XHRcdC8vIGxpc3RlbiBmb3IgeG1tIGNvbmZpcm1hdGlvbiBtZXNzYWdlc1xuXHRcdFx0XHRcdC8vbGV0IHRyaW0gPSBkYXRhLnJlcGxhY2UoJ1xcbicsICcnKTtcblx0XHRcdFx0XHQvL2xldCByZXNwb25zZSA9IHRyaW0uc3BsaXQoJyAnKTtcblx0XHRcdFx0XHRsZXQgcmVzcG9uc2UgPSBkYXRhLnJlcGxhY2UoJ1xcbicsICcnKS5zcGxpdCgnICcpO1xuXHRcdFx0XHRcdC8vaWYocmVzcG9uc2UubGVuZ3RoID09PSA0ICYmIHJlc3BvbnNlWzBdID09PSAndHJhaW4nICYmIHJlc3BvbnNlWzJdID09PSAnLS1zZW5kZXInICYmIHJlc3BvbnNlWzNdID09PSB0aGlzLnBhcmVudGlkKSB7XG5cdFx0XHRcdFx0aWYocmVzcG9uc2VbMF0gPT09ICd0cmFpbicpIHtcblx0XHRcdFx0XHRcdGlmKHJlc3BvbnNlLmxlbmd0aCA9PT0gNCAmJiByZXNwb25zZVsxXSA9PT0gJ29rJyAmJiByZXNwb25zZVsyXSA9PT0gJy0tc2VuZGVyJyAmJiByZXNwb25zZVszXSA9PT0gdGhpcy5wYXJlbnRpZCkge1xuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmxvZygndHJhaW4gb2sgOiAnICsgZGF0YSk7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2VbMV0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gXHR0cmFpbk1vZGVscyhtb2RlbFR5cGUsIGRiTmFtZSwgc3JjQ29sbE5hbWUsIGRzdENvbGxOYW1lLCBhcmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHQvLyBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuXHRcdFx0Ly8gXHRyZWplY3QoZGF0YSk7XG5cdFx0XHQvLyB9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIGluIGNhc2Ugd2Ugd2FudCB0byBzcGVhayBcblx0dGVsbChhcmdzKSB7XG5cdFx0bGV0IHJlYWxBcmdzID0gYXJncztcblx0XHRpZihhcmdzLnNsaWNlKC0xKSAhPSAnXFxuJykge1xuXHRcdFx0cmVhbEFyZ3MgKz0gJ1xcbic7XG5cdFx0fVxuXHRcdGNoaWxkLnN0ZGluLndyaXRlKHJlYWxBcmdzKTtcblx0fVxufTsiXX0=