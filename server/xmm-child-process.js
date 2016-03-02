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
		key: 'trainModels',
		value: function trainModels(dbName, srcCollName, dstCollName, args) {
			var _this = this;

			return new _Promise(function (resolve, reject) {
				//build command line :
				var i = undefined;
				var inputString = 'train ' + dbName + ' ' + srcCollName + ' ' + dstCollName;
				inputString += ' --sender ' + _this.parentid + ' --labels ';
				for (i in args.labels) {
					inputString += args.labels[i] + ' ';
				}
				inputString += '--colnames';
				for (i in args.column_names) {
					inputString += ' ' + args.column_names[i];
				}
				if (args.gaussians !== undefined) {
					inputString += ' --gaussians ' + args.gaussians;
				}
				inputString += '\n';

				//send command line to xmm :
				child.stdin.write(inputString);

				child.stdout.on('data', function (data) {
					//listen for xmm confirmation messages
					var trim = data.replace('\n', '');
					var response = trim.split(' ');
					if (response.length === 4 && response[0] === 'train' && response[2] === '--sender' && response[3] === _this.parentid) {
						//console.log('ok');
						resolve(response[1]);
					}
				});

				child.stderr.on('data', function (data) {
					reject(data);
				});
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIveG1tLWNoaWxkLXByb2Nlc3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs2QkFBMEIsZUFBZTs7Ozs7QUFHekMsSUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDO0FBQ25CLElBQU0sZUFBZSxHQUFHLHNCQUFzQixDQUFDOztBQUUvQyxJQUFNLElBQUksR0FBRywyQkFBYyxJQUFJLENBQUM7QUFDaEMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxlQUFlLEVBQUUsVUFBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBSyxFQUFFLENBQUMsQ0FBQzs7QUFFakYsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsSUFBSSxFQUFLO0FBQ2pDLFFBQU8sQ0FBQyxHQUFHLENBQUMsMkJBQTJCLEdBQUcsSUFBSSxDQUFDLENBQUM7Q0FDaEQsQ0FBQyxDQUFDOztBQUVILEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLElBQUksRUFBSztBQUNqQyxRQUFPLENBQUMsR0FBRyxDQUFDLDJCQUEyQixHQUFHLElBQUksQ0FBQyxDQUFDO0NBQ2hELENBQUMsQ0FBQzs7QUFFSCxTQUFTLFNBQVMsQ0FBQyxPQUFPLEVBQUU7QUFDM0IsTUFBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixNQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7O0FBRWIsS0FBRyxPQUFPLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUM5QixTQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ2hCO0NBQ0Q7QUFDRCxPQUFPLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxZQUFNO0FBQUUsVUFBUyxDQUFFLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxDQUFDLENBQUE7Q0FBRSxDQUFDLENBQUM7OztBQUdq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Q0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0dBQzVCOzs7UUF2RG1CLGVBQWU7OztxQkFBZixlQUFlO0FBd0RuQyxDQUFDIiwiZmlsZSI6InNyYy9zZXJ2ZXIveG1tLWNoaWxkLXByb2Nlc3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgY2hpbGRfcHJvY2VzcyBmcm9tICdjaGlsZF9wcm9jZXNzJztcblxuLy8gZmxhZyB0byBhdm9pZCBjb25jdXJyZW50IGFjY2VzcyAoVE9ETyA6IHJlbW92ZSBieSBpbXByb3ZpbmcgY2hpbGQgcHJvY2VzcylcbmNvbnN0IGJ1c3kgPSBmYWxzZTtcbmNvbnN0IHJlbGF0aXZlQmluUGF0aCA9ICcvYmluL3htbS1zZXJ2ZXItdG9vbCc7XG5cbmNvbnN0IGV4ZWMgPSBjaGlsZF9wcm9jZXNzLmV4ZWM7XG5jb25zdCBjaGlsZCA9IGV4ZWMocHJvY2Vzcy5jd2QoKSArIHJlbGF0aXZlQmluUGF0aCwgKGVyciwgc3Rkb3V0LCBzdGRlcnIpID0+IHt9KTtcblxuY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coJ3htbS1zZXJ2ZXItdG9vbCBzdGRvdXQgOiAnICsgZGF0YSk7XG59KTtcblxuY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0Y29uc29sZS5sb2coJ3htbS1zZXJ2ZXItdG9vbCBzdGRlcnIgOiAnICsgZGF0YSk7XG59KTtcblxuZnVuY3Rpb24gY2xlYW5FeGl0KG9wdGlvbnMpIHtcblx0Y2hpbGQuc3RkaW4ucGF1c2UoKTsgLy8gLT4gbWFuZGF0b3J5ID9cblx0Y2hpbGQua2lsbCgpO1xuXG5cdGlmKG9wdGlvbnMuY29kZSA9PT0gJ1NJR1RFUk0nKSB7XG5cdFx0cHJvY2Vzcy5leGl0KDApO1xuXHR9XG59XG5wcm9jZXNzLm9uKCdTSUdURVJNJywgKCkgPT4geyBjbGVhbkV4aXQoIHsgY29kZTogJ1NJR1RFUk0nIH0pIH0pO1xuXG4vL2V4cG9ydFxuZnVuY3Rpb24gdGVsbFhtbShhcmdTdHJpbmcpIHtcblx0bGV0IHJlYWxBcmdzID0gYXJnU3RyaW5nO1xuXHRpZihhcmdTdHJpbmcuc2xpY2UoLTEpICE9ICdcXG4nKSB7XG5cdFx0cmVhbEFyZ3MgKz0gJ1xcbic7XG5cdH1cblx0Y2hpbGQuc3RkaW4ud3JpdGUocmVhbEFyZ3MpO1xufVxuXG4vLz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Ly9cblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgWG1tQ2hpbGRQcm9jZXNzIHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cdFx0Y29uc3QgZGVmYXVsdHMgPSB7XG5cdFx0XHRwYXJlbnRpZDogJydcblx0XHR9O1xuXG5cdFx0Y29uc3QgYXJncyA9IE9iamVjdC5hc3NpZ24oZGVmYXVsdHMsIG9wdGlvbnMpO1xuXG5cdFx0dGhpcy5wYXJlbnRpZCA9IGRlZmF1bHRzLnBhcmVudGlkO1xuXHR9XG5cblx0dHJhaW5Nb2RlbHMoZGJOYW1lLCBzcmNDb2xsTmFtZSwgZHN0Q29sbE5hbWUsIGFyZ3MpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Ly9idWlsZCBjb21tYW5kIGxpbmUgOlxuXHRcdFx0bGV0IGk7XG5cdFx0XHRsZXQgaW5wdXRTdHJpbmcgPSAndHJhaW4gJyArIGRiTmFtZSArICcgJyArIHNyY0NvbGxOYW1lICsgJyAnICsgZHN0Q29sbE5hbWUgO1xuXHRcdFx0aW5wdXRTdHJpbmcgKz0gJyAtLXNlbmRlciAnICsgdGhpcy5wYXJlbnRpZCArICcgLS1sYWJlbHMgJztcblx0XHRcdGZvcihpIGluIGFyZ3MubGFiZWxzKSB7XG5cdFx0XHRcdGlucHV0U3RyaW5nICs9IGFyZ3MubGFiZWxzW2ldICsgJyAnO1xuXHRcdFx0fVxuXHRcdFx0aW5wdXRTdHJpbmcgKz0gJy0tY29sbmFtZXMnO1xuXHRcdFx0Zm9yKGkgaW4gYXJncy5jb2x1bW5fbmFtZXMpIHtcblx0XHRcdFx0aW5wdXRTdHJpbmcgKz0gJyAnICsgYXJncy5jb2x1bW5fbmFtZXNbaV07XG5cdFx0XHR9XG5cdFx0XHRpZihhcmdzLmdhdXNzaWFucyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlucHV0U3RyaW5nICs9ICcgLS1nYXVzc2lhbnMgJyArIGFyZ3MuZ2F1c3NpYW5zO1xuXHRcdFx0fVxuXHRcdFx0aW5wdXRTdHJpbmcgKz0gJ1xcbic7XG5cblx0XHRcdC8vc2VuZCBjb21tYW5kIGxpbmUgdG8geG1tIDpcblx0XHRcdGNoaWxkLnN0ZGluLndyaXRlKGlucHV0U3RyaW5nKTtcblxuXHRcdFx0Y2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0XHRcdFx0Ly9saXN0ZW4gZm9yIHhtbSBjb25maXJtYXRpb24gbWVzc2FnZXNcblx0XHRcdFx0bGV0IHRyaW0gPSBkYXRhLnJlcGxhY2UoJ1xcbicsICcnKTtcblx0XHRcdFx0bGV0IHJlc3BvbnNlID0gdHJpbS5zcGxpdCgnICcpO1xuXHRcdFx0XHRpZihyZXNwb25zZS5sZW5ndGggPT09IDQgJiYgcmVzcG9uc2VbMF0gPT09ICd0cmFpbicgJiYgcmVzcG9uc2VbMl0gPT09ICctLXNlbmRlcicgJiYgcmVzcG9uc2VbM10gPT09IHRoaXMucGFyZW50aWQpIHtcblx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKCdvaycpO1xuXHRcdFx0XHRcdHJlc29sdmUocmVzcG9uc2VbMV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Y2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcblx0XHRcdFx0cmVqZWN0KGRhdGEpO1xuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cblxuXHQvLyBpbiBjYXNlIHdlIHdhbnQgdG8gc3BlYWsgXG5cdHRlbGwoYXJncykge1xuXHRcdGxldCByZWFsQXJncyA9IGFyZ3M7XG5cdFx0aWYoYXJncy5zbGljZSgtMSkgIT0gJ1xcbicpIHtcblx0XHRcdHJlYWxBcmdzICs9ICdcXG4nO1xuXHRcdH1cblx0XHRjaGlsZC5zdGRpbi53cml0ZShyZWFsQXJncyk7XG5cdH1cbn07Il19