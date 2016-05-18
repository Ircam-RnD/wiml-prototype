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

			return new _Promise(function (resolve, reject) {
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

				// send command line to xmm :
				child.stdin.write(configString);

				child.stdout.on('data', function (data) {
					// listen for xmm confirmation messages
					var response = data.replace('\n', '').split(' ');
					if (response.length === 4 && response[0] === 'config' && response[2] === '--sender' && response[3] === _this.parentid) {
						// console.log('ok');
						resolve(response[1]);
					}
				});
			});
		}
	}, {
		key: 'trainModels',
		value: function trainModels(modelType, dbName, srcCollName, dstCollName, args) {
			var _this2 = this;

			return new _Promise(function (resolve, reject) {
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

				// send command line to xmm :
				child.stdin.write(trainString);

				child.stdout.on('data', function (data) {
					// listen for xmm confirmation messages
					//let trim = data.replace('\n', '');
					//let response = trim.split(' ');
					var response = data.replace('\n', '').split(' ');
					if (response.length === 4 && response[0] === 'train' && response[2] === '--sender' && response[3] === _this2.parentid) {
						console.log('ok');
						resolve(response[1]);
					} else {
						console.log('pas ok');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIveG1tLWNoaWxkLXByb2Nlc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFBMEIsZUFBZTs7Ozs7QUFHekMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ25CLElBQU0sZUFBZSxHQUFHLHNCQUFzQixDQUFDOztBQUUvQyxJQUFNLElBQUksR0FBRywyQkFBYyxJQUFJLENBQUM7QUFDaEMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxlQUFlLEVBQUUsVUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBSyxFQUFFLENBQUMsQ0FBQzs7QUFFakYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ2pDLFFBQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLENBQUM7Q0FDaEQsQ0FBQyxDQUFDOztBQUVILEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLElBQUksRUFBSztBQUNqQyxRQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxDQUFDO0NBQ2hELENBQUMsQ0FBQzs7QUFFSCxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUU7QUFDM0IsTUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixNQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWIsS0FBRyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUM5QixTQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2hCO0NBQ0Q7QUFDRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxZQUFNO0FBQUUsVUFBUyxDQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7Q0FBRSxDQUFDLENBQUM7OztBQUdqRSxTQUFTLE9BQU8sQ0FBQyxTQUFTLEVBQUU7QUFDM0IsS0FBSSxRQUFRLEdBQUcsU0FBUyxDQUFDO0FBQ3pCLEtBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksRUFBRTtBQUMvQixVQUFRLElBQUksSUFBSSxDQUFDO0VBQ2pCO0FBQ0QsTUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7Q0FDNUI7Ozs7SUFJb0IsZUFBZTtBQUN4QixVQURTLGVBQWUsR0FDVDtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBREosZUFBZTs7QUFFbEMsTUFBTSxRQUFRLEdBQUc7QUFDaEIsV0FBUSxFQUFFLEVBQUU7R0FDWixDQUFDOztBQUVGLE1BQU0sSUFBSSxHQUFHLGVBQWMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDOztBQUU5QyxNQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUM7RUFDbEM7O2NBVG1CLGVBQWU7O1NBV3BCLHlCQUFDLFNBQVMsRUFBRSxJQUFJLEVBQUU7OztBQUNoQyxVQUFPLGFBQVksVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLOztBQUV2QyxRQUFJLFlBQVksR0FBRyxRQUFRLEdBQUcsR0FBRyxHQUFHLFNBQVMsQ0FBQztBQUM5QyxRQUFHLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxFQUFFO0FBQ2hDLGlCQUFZLElBQUksZUFBZSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7S0FDakQ7QUFDRCxRQUFHLElBQUksQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQzdCLGlCQUFZLElBQUksWUFBWSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7S0FDM0M7QUFDRCxRQUFHLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxTQUFTLEVBQUU7QUFDN0MsaUJBQVksSUFBSSw2QkFBNkIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7S0FDNUU7QUFDRCxRQUFHLElBQUksQ0FBQyxzQkFBc0IsS0FBSyxTQUFTLEVBQUU7QUFDN0MsaUJBQVksSUFBSSw2QkFBNkIsR0FBRyxJQUFJLENBQUMsc0JBQXNCLENBQUM7S0FDNUU7QUFDRCxnQkFBWSxJQUFJLFlBQVksR0FBRyxNQUFLLFFBQVEsR0FBRyxJQUFJLENBQUM7OztBQUdwRCxTQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQzs7QUFFaEMsU0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSSxFQUFLOztBQUVqQyxTQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDakQsU0FBRyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxVQUFVLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQUssUUFBUSxFQUFFOztBQUVwSCxhQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7TUFDckI7S0FDRCxDQUFDLENBQUM7SUFDSCxDQUFDLENBQUM7R0FDSDs7O1NBRVUscUJBQUMsU0FBUyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRTs7O0FBQzlELFVBQU8sYUFBWSxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7O0FBRXZDLFFBQUksQ0FBQyxZQUFBLENBQUM7QUFDTixRQUFJLFdBQVcsR0FBRyxRQUFRLEdBQUcsU0FBUyxHQUFHLEdBQUcsR0FBRyxNQUFNLEdBQUcsR0FBRyxHQUFHLFdBQVcsR0FBRyxHQUFHLEdBQUcsV0FBVyxDQUFFO0FBQy9GLGVBQVcsSUFBSSxZQUFZLEdBQUcsT0FBSyxRQUFRLEdBQUcsWUFBWSxDQUFDO0FBQzNELFNBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDckIsZ0JBQVcsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztLQUNwQztBQUNELGVBQVcsSUFBSSxZQUFZLENBQUM7QUFDNUIsU0FBSSxDQUFDLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtBQUMzQixnQkFBVyxJQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFDO0FBQ0QsZUFBVyxJQUFJLElBQUksQ0FBQzs7O0FBR3BCLFNBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDOztBQUUvQixTQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsVUFBQyxJQUFJLEVBQUs7Ozs7QUFJakMsU0FBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pELFNBQUcsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxJQUFJLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxPQUFLLFFBQVEsRUFBRTtBQUNuSCxhQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xCLGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUNyQixNQUFNO0FBQ04sYUFBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztNQUN0QjtLQUNELENBQUMsQ0FBQzs7Ozs7SUFLSCxDQUFDLENBQUM7R0FDSDs7Ozs7U0FHRyxjQUFDLElBQUksRUFBRTtBQUNWLE9BQUksUUFBUSxHQUFHLElBQUksQ0FBQztBQUNwQixPQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLEVBQUU7QUFDMUIsWUFBUSxJQUFJLElBQUksQ0FBQztJQUNqQjtBQUNELFFBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzVCOzs7UUF2Rm1CLGVBQWU7OztxQkFBZixlQUFlO0FBd0ZuQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIveG1tLWNoaWxkLXByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuLy8gZmxhZyB0byBhdm9pZCBjb25jdXJyZW50IGFjY2VzcyAoVE9ETyA6IHJlbW92ZSBieSBpbXByb3ZpbmcgY2hpbGQgcHJvY2VzcylcbmNvbnN0IGJ1c3kgPSBmYWxzZTtcbmNvbnN0IHJlbGF0aXZlQmluUGF0aCA9ICcvYmluL3htbS1zZXJ2ZXItdG9vbCc7XG5cbmNvbnN0IGV4ZWMgPSBjaGlsZF9wcm9jZXNzLmV4ZWM7XG5jb25zdCBjaGlsZCA9IGV4ZWMocHJvY2Vzcy5jd2QoKSArIHJlbGF0aXZlQmluUGF0aCwgKGVyciwgc3Rkb3V0LCBzdGRlcnIpID0+IHt9KTtcblxuY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coJ3htbS1zZXJ2ZXItdG9vbCBzdGRvdXQgOiAnICsgZGF0YSk7XG59KTtcblxuY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coJ3htbS1zZXJ2ZXItdG9vbCBzdGRlcnIgOiAnICsgZGF0YSk7XG59KTtcblxuZnVuY3Rpb24gY2xlYW5FeGl0KG9wdGlvbnMpIHtcblx0Y2hpbGQuc3RkaW4ucGF1c2UoKTsgLy8gLT4gbWFuZGF0b3J5ID9cblx0Y2hpbGQua2lsbCgpO1xuXG5cdGlmKG9wdGlvbnMuY29kZSA9PT0gJ1NJR1RFUk0nKSB7XG5cdFx0cHJvY2Vzcy5leGl0KDApO1xuXHR9XG59XG5wcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4geyBjbGVhbkV4aXQoIHsgY29kZTogJ1NJR1RFUk0nIH0pIH0pO1xuXG4vL2V4cG9ydFxuZnVuY3Rpb24gdGVsbFhtbShhcmdTdHJpbmcpIHtcblx0bGV0IHJlYWxBcmdzID0gYXJnU3RyaW5nO1xuXHRpZihhcmdTdHJpbmcuc2xpY2UoLTEpICE9ICdcXG4nKSB7XG5cdFx0cmVhbEFyZ3MgKz0gJ1xcbic7XG5cdH1cblx0Y2hpbGQuc3RkaW4ud3JpdGUocmVhbEFyZ3MpO1xufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWG1tQ2hpbGRQcm9jZXNzIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRwYXJlbnRpZDogJydcblx0XHR9O1xuXG5cdFx0Y29uc3QgYXJncyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5wYXJlbnRpZCA9IGRlZmF1bHRzLnBhcmVudGlkO1xuXHR9XG5cblx0Y29uZmlndXJlTW9kZWxzKG1vZGVsVHlwZSwgYXJncykge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHQvLyBidWlsZCBjb21tYW5kIGxpbmUgOlxuXHRcdFx0bGV0IGNvbmZpZ1N0cmluZyA9ICdjb25maWcnICsgJyAnICsgbW9kZWxUeXBlO1xuXHRcdFx0aWYoYXJncy5nYXVzc2lhbnMgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25maWdTdHJpbmcgKz0gJyAtLWdhdXNzaWFucyAnICsgYXJncy5nYXVzc2lhbnM7XG5cdFx0XHR9XG5cdFx0XHRpZihhcmdzLnN0YXRlcyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbmZpZ1N0cmluZyArPSAnIC0tc3RhdGVzICcgKyBhcmdzLnN0YXRlcztcblx0XHRcdH1cblx0XHRcdGlmKGFyZ3MucmVsYXRpdmVSZWd1bGFyaXphdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbmZpZ1N0cmluZyArPSAnIC0tcmVsYXRpdmVfcmVndWxhcml6YXRpb24gJyArIGFyZ3MucmVsYXRpdmVSZWd1bGFyaXphdGlvbjtcblx0XHRcdH1cblx0XHRcdGlmKGFyZ3MuYWJzb2x1dGVSZWd1bGFyaXphdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbmZpZ1N0cmluZyArPSAnIC0tYWJzb2x1dGVfcmVndWxhcml6YXRpb24gJyArIGFyZ3MuYWJzb2x1dGVSZWd1bGFyaXphdGlvbjtcblx0XHRcdH1cblx0XHRcdGNvbmZpZ1N0cmluZyArPSAnIC0tc2VuZGVyICcgKyB0aGlzLnBhcmVudGlkICsgJ1xcbic7XG5cblx0XHRcdC8vIHNlbmQgY29tbWFuZCBsaW5lIHRvIHhtbSA6XG5cdFx0XHRjaGlsZC5zdGRpbi53cml0ZShjb25maWdTdHJpbmcpO1xuXG5cdFx0XHRjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuXHRcdFx0XHQvLyBsaXN0ZW4gZm9yIHhtbSBjb25maXJtYXRpb24gbWVzc2FnZXNcblx0XHRcdFx0bGV0IHJlc3BvbnNlID0gZGF0YS5yZXBsYWNlKCdcXG4nLCAnJykuc3BsaXQoJyAnKTtcblx0XHRcdFx0aWYocmVzcG9uc2UubGVuZ3RoID09PSA0ICYmIHJlc3BvbnNlWzBdID09PSAnY29uZmlnJyAmJiByZXNwb25zZVsyXSA9PT0gJy0tc2VuZGVyJyAmJiByZXNwb25zZVszXSA9PT0gdGhpcy5wYXJlbnRpZCkge1xuXHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdvaycpO1xuXHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2VbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fVxuXG5cdHRyYWluTW9kZWxzKG1vZGVsVHlwZSwgZGJOYW1lLCBzcmNDb2xsTmFtZSwgZHN0Q29sbE5hbWUsIGFyZ3MpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly8gYnVpbGQgY29tbWFuZCBsaW5lIDpcblx0XHRcdGxldCBpO1xuXHRcdFx0bGV0IHRyYWluU3RyaW5nID0gJ3RyYWluICcgKyBtb2RlbFR5cGUgKyAnICcgKyBkYk5hbWUgKyAnICcgKyBzcmNDb2xsTmFtZSArICcgJyArIGRzdENvbGxOYW1lIDtcblx0XHRcdHRyYWluU3RyaW5nICs9ICcgLS1zZW5kZXIgJyArIHRoaXMucGFyZW50aWQgKyAnIC0tbGFiZWxzICc7XG5cdFx0XHRmb3IoaSBpbiBhcmdzLmxhYmVscykge1xuXHRcdFx0XHR0cmFpblN0cmluZyArPSBhcmdzLmxhYmVsc1tpXSArICcgJztcblx0XHRcdH1cblx0XHRcdHRyYWluU3RyaW5nICs9ICctLWNvbG5hbWVzJztcblx0XHRcdGZvcihpIGluIGFyZ3MuY29sdW1uX25hbWVzKSB7XG5cdFx0XHRcdHRyYWluU3RyaW5nICs9ICcgJyArIGFyZ3MuY29sdW1uX25hbWVzW2ldO1xuXHRcdFx0fVxuXHRcdFx0dHJhaW5TdHJpbmcgKz0gJ1xcbic7XG5cblx0XHRcdC8vIHNlbmQgY29tbWFuZCBsaW5lIHRvIHhtbSA6XG5cdFx0XHRjaGlsZC5zdGRpbi53cml0ZSh0cmFpblN0cmluZyk7XG5cblx0XHRcdGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSA9PiB7XG5cdFx0XHRcdC8vIGxpc3RlbiBmb3IgeG1tIGNvbmZpcm1hdGlvbiBtZXNzYWdlc1xuXHRcdFx0XHQvL2xldCB0cmltID0gZGF0YS5yZXBsYWNlKCdcXG4nLCAnJyk7XG5cdFx0XHRcdC8vbGV0IHJlc3BvbnNlID0gdHJpbS5zcGxpdCgnICcpO1xuXHRcdFx0XHRsZXQgcmVzcG9uc2UgPSBkYXRhLnJlcGxhY2UoJ1xcbicsICcnKS5zcGxpdCgnICcpO1xuXHRcdFx0XHRpZihyZXNwb25zZS5sZW5ndGggPT09IDQgJiYgcmVzcG9uc2VbMF0gPT09ICd0cmFpbicgJiYgcmVzcG9uc2VbMl0gPT09ICctLXNlbmRlcicgJiYgcmVzcG9uc2VbM10gPT09IHRoaXMucGFyZW50aWQpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnb2snKTtcblx0XHRcdFx0XHRyZXNvbHZlKHJlc3BvbnNlWzFdKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygncGFzIG9rJyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuXHRcdFx0Ly8gXHRyZWplY3QoZGF0YSk7XG5cdFx0XHQvLyB9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8vIGluIGNhc2Ugd2Ugd2FudCB0byBzcGVhayBcblx0dGVsbChhcmdzKSB7XG5cdFx0bGV0IHJlYWxBcmdzID0gYXJncztcblx0XHRpZihhcmdzLnNsaWNlKC0xKSAhPSAnXFxuJykge1xuXHRcdFx0cmVhbEFyZ3MgKz0gJ1xcbic7XG5cdFx0fVxuXHRcdGNoaWxkLnN0ZGluLndyaXRlKHJlYWxBcmdzKTtcblx0fVxufTsiXX0=