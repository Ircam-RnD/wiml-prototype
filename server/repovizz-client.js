'use strict';

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Promise = require('babel-runtime/core-js/promise')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var apikey = 'fc490ca45c00b1249bbe3554a4fdf6fb';
var datapacksArray = [];

var RepovizzClient = (function () {
	function RepovizzClient() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, RepovizzClient);
	}

	_createClass(RepovizzClient, [{
		key: 'datapacks',
		value: function datapacks() {
			return new _Promise(function (resolve, reject) {
				datapacksArray = [];
				var options = {
					host: 'repovizz.upf.edu',
					path: '/repo/api/datapacks/list?' + '&api_key=' + apikey
				};

				var reqloop = function reqloop(options) {
					_http2['default'].request(options, function (response) {
						var str = '';
						var json = {};
						//another chunk of data has been received, so append it to `str`
						response.on('data', function (chunk) {
							str += chunk;
						});
						//the whole response has been received, so we process our data here
						response.on('end', function () {

							//str = str.replace(/"/g, '\\"');
							console.log(str);
							try {
								json = JSON.parse(str);
							} catch (e) {
								if (e instanceof SyntaxError) {
									// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
									// double quotes inside strings cause this error !!!!
									// no way to fix it ?????????????????????????????????
								}
								console.error(e.message);
							}

							if (json !== undefined && json["next"] !== undefined && json["next"] !== '') {
								//if(str !== undefined) {
								//json = JSON.parse(str);

								for (var i = 0; i < json["datapacks"].length; i++) {
									datapacksArray.push(json["datapacks"][i]);
								}

								var url = json["next"].replace(/https?:\/\//, '');
								var host = url.split('/')[0];
								var path = url.replace(host, '') + '&api_key=' + apikey;
								// console.log('host : ' + host);
								// console.log('path : ' + path);
								// console.log('next : ' + json["next"]);

								options = {
									host: host,
									path: path
								};
								//console.log(datapacksArray);
								reqloop(options);
								return;
							} else {
								//console.log(datapacksArray);
								resolve(datapacksArray);
							}
						});
					}).end();
				};
				reqloop(options);
			});
		}
	}]);

	return RepovizzClient;
})();

exports['default'] = RepovizzClient;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9zZXJ2ZXIvcmVwb3ZpenotY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O29CQUFpQixNQUFNOzs7O0FBRXZCLElBQU0sTUFBTSxHQUFHLGtDQUFrQyxDQUFBO0FBQ2pELElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQzs7SUFFSCxjQUFjO0FBQ3ZCLFVBRFMsY0FBYyxHQUNSO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFESixjQUFjO0VBR2pDOztjQUhtQixjQUFjOztTQUt6QixxQkFBRztBQUNYLFVBQU8sYUFBWSxVQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUs7QUFDdkMsa0JBQWMsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBSSxPQUFPLEdBQUc7QUFDYixTQUFJLEVBQUUsa0JBQWtCO0FBQ3hCLFNBQUksRUFBRSwyQkFBMkIsR0FBRyxXQUFXLEdBQUcsTUFBTTtLQUN4RCxDQUFBOztBQUVELFFBQUksT0FBTyxHQUFHLFNBQVYsT0FBTyxDQUFJLE9BQU8sRUFBSztBQUMxQix1QkFBSyxPQUFPLENBQUMsT0FBTyxFQUFFLFVBQUMsUUFBUSxFQUFLO0FBQ25DLFVBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztBQUNiLFVBQUksSUFBSSxHQUFHLEVBQUUsQ0FBQzs7QUFFZCxjQUFRLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFDLEtBQUssRUFBSztBQUM5QixVQUFHLElBQUksS0FBSyxDQUFDO09BQ2IsQ0FBQyxDQUFDOztBQUVILGNBQVEsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQU07OztBQUd4QixjQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2pCLFdBQUk7QUFDSCxZQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN2QixDQUFDLE9BQU0sQ0FBQyxFQUFFO0FBQ1YsWUFBRyxDQUFDLFlBQVksV0FBVyxFQUFFOzs7O1NBSTVCO0FBQ0QsZUFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDekI7O0FBRUQsV0FBRyxJQUFJLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsRUFBRTs7OztBQUkzRSxhQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM3Qyx1QkFBYyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQzs7QUFFRCxZQUFJLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNsRCxZQUFJLElBQUksR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdCLFlBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxHQUFHLFdBQVcsR0FBRyxNQUFNLENBQUM7Ozs7O0FBS3hELGVBQU8sR0FBRztBQUNULGFBQUksRUFBRSxJQUFJO0FBQ1YsYUFBSSxFQUFFLElBQUk7U0FDVixDQUFBOztBQUVELGVBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUNqQixlQUFPO1FBQ1AsTUFBTTs7QUFFTixlQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDeEI7T0FDRCxDQUFDLENBQUM7TUFDSCxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7S0FDVCxDQUFDO0FBQ0YsV0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBRWpCLENBQUMsQ0FBQztHQUNIOzs7UUFyRW1CLGNBQWM7OztxQkFBZCxjQUFjIiwiZmlsZSI6InNyYy9zZXJ2ZXIvcmVwb3ZpenotY2xpZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGh0dHAgZnJvbSAnaHR0cCc7XG5cbmNvbnN0IGFwaWtleSA9ICdmYzQ5MGNhNDVjMDBiMTI0OWJiZTM1NTRhNGZkZjZmYidcbmxldCBkYXRhcGFja3NBcnJheSA9IFtdO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBSZXBvdml6ekNsaWVudHtcblx0Y29uc3RydWN0b3Iob3B0aW9ucyA9IHt9KSB7XG5cblx0fVxuXG5cdGRhdGFwYWNrcygpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0ZGF0YXBhY2tzQXJyYXkgPSBbXTtcblx0XHRcdGxldCBvcHRpb25zID0ge1xuXHRcdFx0XHRob3N0OiAncmVwb3ZpenoudXBmLmVkdScsXG5cdFx0XHRcdHBhdGg6ICcvcmVwby9hcGkvZGF0YXBhY2tzL2xpc3Q/JyArICcmYXBpX2tleT0nICsgYXBpa2V5XG5cdFx0XHR9XG5cblx0XHRcdGxldCByZXFsb29wID0gKG9wdGlvbnMpID0+IHtcblx0XHRcdFx0aHR0cC5yZXF1ZXN0KG9wdGlvbnMsIChyZXNwb25zZSkgPT4ge1xuXHRcdFx0XHRcdGxldCBzdHIgPSAnJztcblx0XHRcdFx0XHRsZXQganNvbiA9IHt9O1xuXHRcdFx0XHRcdC8vYW5vdGhlciBjaHVuayBvZiBkYXRhIGhhcyBiZWVuIHJlY2VpdmVkLCBzbyBhcHBlbmQgaXQgdG8gYHN0cmBcblx0XHRcdFx0XHRyZXNwb25zZS5vbignZGF0YScsIChjaHVuaykgPT4ge1xuXHRcdFx0XHRcdFx0c3RyICs9IGNodW5rO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vdGhlIHdob2xlIHJlc3BvbnNlIGhhcyBiZWVuIHJlY2VpdmVkLCBzbyB3ZSBwcm9jZXNzIG91ciBkYXRhIGhlcmVcblx0XHRcdFx0XHRyZXNwb25zZS5vbignZW5kJywgKCkgPT4ge1xuXHRcdFx0XHRcdFx0XG5cdFx0XHRcdFx0XHQvL3N0ciA9IHN0ci5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJyk7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmxvZyhzdHIpO1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0anNvbiA9IEpTT04ucGFyc2Uoc3RyKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2goZSkge1xuXHRcdFx0XHRcdFx0XHRpZihlIGluc3RhbmNlb2YgU3ludGF4RXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVxuXHRcdFx0XHRcdFx0XHRcdC8vIGRvdWJsZSBxdW90ZXMgaW5zaWRlIHN0cmluZ3MgY2F1c2UgdGhpcyBlcnJvciAhISEhXG5cdFx0XHRcdFx0XHRcdFx0Ly8gbm8gd2F5IHRvIGZpeCBpdCA/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz8/Pz9cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKGUubWVzc2FnZSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmKGpzb24gIT09IHVuZGVmaW5lZCAmJiBqc29uW1wibmV4dFwiXSAhPT0gdW5kZWZpbmVkICYmIGpzb25bXCJuZXh0XCJdICE9PSAnJykge1xuXHRcdFx0XHRcdFx0Ly9pZihzdHIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHQvL2pzb24gPSBKU09OLnBhcnNlKHN0cik7XG5cblx0XHRcdFx0XHRcdFx0Zm9yKGxldCBpPTA7IGk8anNvbltcImRhdGFwYWNrc1wiXS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFwYWNrc0FycmF5LnB1c2goanNvbltcImRhdGFwYWNrc1wiXVtpXSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRsZXQgdXJsID0ganNvbltcIm5leHRcIl0ucmVwbGFjZSgvaHR0cHM/OlxcL1xcLy8sICcnKTtcblx0XHRcdFx0XHRcdFx0bGV0IGhvc3QgPSB1cmwuc3BsaXQoJy8nKVswXTtcblx0XHRcdFx0XHRcdFx0bGV0IHBhdGggPSB1cmwucmVwbGFjZShob3N0LCAnJykgKyAnJmFwaV9rZXk9JyArIGFwaWtleTtcblx0XHRcdFx0XHRcdFx0Ly8gY29uc29sZS5sb2coJ2hvc3QgOiAnICsgaG9zdCk7XG5cdFx0XHRcdFx0XHRcdC8vIGNvbnNvbGUubG9nKCdwYXRoIDogJyArIHBhdGgpO1xuXHRcdFx0XHRcdFx0XHQvLyBjb25zb2xlLmxvZygnbmV4dCA6ICcgKyBqc29uW1wibmV4dFwiXSk7XG5cblx0XHRcdFx0XHRcdFx0b3B0aW9ucyA9IHtcblx0XHRcdFx0XHRcdFx0XHRob3N0OiBob3N0LFxuXHRcdFx0XHRcdFx0XHRcdHBhdGg6IHBhdGhcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHQvL2NvbnNvbGUubG9nKGRhdGFwYWNrc0FycmF5KTtcblx0XHRcdFx0XHRcdFx0cmVxbG9vcChvcHRpb25zKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly9jb25zb2xlLmxvZyhkYXRhcGFja3NBcnJheSk7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoZGF0YXBhY2tzQXJyYXkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KS5lbmQoKTtcblx0XHRcdH07XG5cdFx0XHRyZXFsb29wKG9wdGlvbnMpO1xuXG5cdFx0fSk7XG5cdH1cblxufSJdfQ==