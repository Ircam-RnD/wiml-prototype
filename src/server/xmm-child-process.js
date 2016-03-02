import child_process from 'child_process';

// flag to avoid concurrent access (TODO : remove by improving child process)
const busy = false;
const relativeBinPath = '/bin/xmm-server-tool';

const exec = child_process.exec;
const child = exec(process.cwd() + relativeBinPath, (err, stdout, stderr) => {});

child.stdout.on('data', (data) => {
	console.log('xmm-server-tool stdout : ' + data);
});

child.stderr.on('data', (data) => {
	console.log('xmm-server-tool stderr : ' + data);
});

function cleanExit(options) {
	child.stdin.pause(); // -> mandatory ?
	child.kill();

	if(options.code === 'SIGTERM') {
		process.exit(0);
	}
}
process.on('SIGTERM', () => { cleanExit( { code: 'SIGTERM' }) });

//export
function tellXmm(argString) {
	let realArgs = argString;
	if(argString.slice(-1) != '\n') {
		realArgs += '\n';
	}
	child.stdin.write(realArgs);
}

//===================================================================================//

export default class XmmChildProcess {
	constructor(options = {}) {
		const defaults = {
			parentid: ''
		};

		const args = Object.assign(defaults, options);

		this.parentid = defaults.parentid;
	}

	trainModels(dbName, srcCollName, dstCollName, args) {
		return new Promise((resolve, reject) => {
			//build command line :
			let i;
			let inputString = 'train ' + dbName + ' ' + srcCollName + ' ' + dstCollName ;
			inputString += ' --sender ' + this.parentid + ' --labels ';
			for(i in args.labels) {
				inputString += args.labels[i] + ' ';
			}
			inputString += '--colnames';
			for(i in args.column_names) {
				inputString += ' ' + args.column_names[i];
			}
			if(args.gaussians !== undefined) {
				inputString += ' --gaussians ' + args.gaussians;
			}
			inputString += '\n';

			//send command line to xmm :
			child.stdin.write(inputString);

			child.stdout.on('data', (data) => {
				//listen for xmm confirmation messages
				let trim = data.replace('\n', '');
				let response = trim.split(' ');
				if(response.length === 4 && response[0] === 'train' && response[2] === '--sender' && response[3] === this.parentid) {
					//console.log('ok');
					resolve(response[1]);
				}
			});

			child.stderr.on('data', (data) => {
				reject(data);
			});
		});
	}

	// in case we want to speak 
	tell(args) {
		let realArgs = args;
		if(args.slice(-1) != '\n') {
			realArgs += '\n';
		}
		child.stdin.write(realArgs);
	}
};