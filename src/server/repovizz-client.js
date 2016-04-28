import http from 'http';

const apikey = 'fc490ca45c00b1249bbe3554a4fdf6fb'
let datapacksArray = [];

export default class RepovizzClient{
	constructor(options = {}) {

	}

	datapacks() {
		return new Promise((resolve, reject) => {
			datapacksArray = [];
			let options = {
				host: 'repovizz.upf.edu',
				path: '/repo/api/datapacks/list?' + '&api_key=' + apikey
			}

			let reqloop = (options) => {
				http.request(options, (response) => {
					let str = '';
					let json = {};
					//another chunk of data has been received, so append it to `str`
					response.on('data', (chunk) => {
						str += chunk;
					});
					//the whole response has been received, so we process our data here
					response.on('end', () => {
						
						//str = str.replace(/"/g, '\\"');
						console.log(str);
						try {
							json = JSON.parse(str);
						} catch(e) {
							if(e instanceof SyntaxError) {
								// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
								// double quotes inside strings cause this error !!!!
								// no way to fix it ?????????????????????????????????
							}
							console.error(e.message);
						}

						if(json !== undefined && json["next"] !== undefined && json["next"] !== '') {
						//if(str !== undefined) {
							//json = JSON.parse(str);

							for(let i=0; i<json["datapacks"].length; i++) {
								datapacksArray.push(json["datapacks"][i]);
							}

							let url = json["next"].replace(/https?:\/\//, '');
							let host = url.split('/')[0];
							let path = url.replace(host, '') + '&api_key=' + apikey;
							// console.log('host : ' + host);
							// console.log('path : ' + path);
							// console.log('next : ' + json["next"]);

							options = {
								host: host,
								path: path
							}
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

}