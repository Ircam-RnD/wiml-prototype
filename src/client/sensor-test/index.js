import * as lfo from 'waves-lfo'
//import Delta from '../common/lfo-delta';
import Intensity from '../common/lfo-intensity';
import Resampler from '../common/lfo-resampler';

let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};

const evin = new lfo.sources.EventIn({
	frameSize: 3,
	ctx: AudioContext
});

// const delta = new Delta({
// 	order: 3,
// 	frameSize: 3
// });

const resampler = new Resampler({
	period: 10
});

const intensity = new Intensity({
});

const rawBpf = new lfo.sinks.Bpf({
	radius: 0,
	min: -500,
	max: 500,
	canvas: document.querySelector('#raw-canvas'),
	duration: 3000,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

const smoothBpf = new lfo.sinks.Bpf({
	radius: 0,
	min: -500,
	max: 500,
	canvas: document.querySelector('#smooth-canvas'),
	duration: 3000,
	colors: ['#f00', '#0c0', '#33f'] // magnitude : Red, frequency : Green, periodicity : Blue
});

// evin.connect(resampler);
// resampler.connect(rawBpf);
// resampler.connect(intensity);

evin.connect(rawBpf);
// evin.connect(delta);
// delta.connect(smoothBpf);
evin.connect(intensity);
intensity.connect(smoothBpf);

// from : http://stackoverflow.com/questions/5916900/how-can-you-detect-the-version-of-a-browser
function getBrowser(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return {name:'IE',version:(tem[1]||'')};
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return {name:'Opera', version:tem[1]};}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return {
      name: M[0],
      version: M[1]
    };
}

//and for os, see : http://stackoverflow.com/questions/9514179/how-to-find-the-operating-system-version-using-javascript

let rads = false;
if(getBrowser().name === 'Chrome') {
	rads = true;
	console.log('switching to rads mode for rotationRate');
}

let txt = document.querySelector('#display-sensor-bounds');
txt.innerHTML = 'not yet initialized ... wait please';

let minx, maxx, miny, maxy, minz, maxz;
let mingx, maxgx, mingy, maxgy, mingz, maxgz;
let minra, maxra, minrb, maxrb, minrg, maxrg;

minx = maxx = miny = maxy = minz = maxz = 0;
mingx = maxgx = mingy = maxgy = mingz = maxgz = 0;
minra = maxra = minrb = maxrb = minrg = maxrg = 0;

//*
if(window.DeviceMotionEvent) {
	console.log('ok');
	evin.start();
	window.addEventListener('devicemotion', (e) => {
		let x = e.acceleration.x;
		let y = e.acceleration.y;
		let z = e.acceleration.z;

		let gx = e.accelerationIncludingGravity.x;
		let gy = e.accelerationIncludingGravity.y;
		let gz = e.accelerationIncludingGravity.z;

		let ra = e.rotationRate.alpha;
		let rb = e.rotationRate.beta;
		let rg = e.rotationRate.gamma;

		if(rads) {
			ra *= (180/Math.PI);
			rb *= (180/Math.PI);
			rg *= (180/Math.PI);
		}

		if(x > maxx) maxx = x;
		if(x < minx) minx = x;
		if(y > maxy) maxy = y;
		if(y < miny) miny = y;
		if(z > maxz) maxz = z;
		if(z < minz) minz = z;

		if(gx > maxgx) maxgx = gx;
		if(gx < mingx) mingx = gx;
		if(gy > maxgy) maxgy = gy;
		if(gy < mingy) mingy = gy;
		if(gz > maxgz) maxgz = gz;
		if(gz < mingz) mingz = gz;

		if(ra > maxra) maxra = ra;
		if(ra < minra) minra = ra;
		if(rb > maxrb) maxrb = rb;
		if(rb < minrb) minrb = rb;
		if(rg > maxrg) maxrg = rg;
		if(rg < minrg) minrg = rg;

		txt.innerHTML = minx + ' ' + maxx
			+ '<br />' + miny + ' ' + maxy
			+ '<br />' + minz + ' ' + maxz + '<br />'
			+ '<br />' + mingx + ' ' + maxgx
			+ '<br />' + mingy + ' ' + maxgy
			+ '<br />' + mingz + ' ' + maxgz + '<br />'
			+ '<br />' + minra + ' ' + maxra
			+ '<br />' + minrb + ' ' + maxrb
			+ '<br />' + minrg + ' ' + maxrg;
			// + '<br />' + navigator;

		//console.log('event !')
		evin.process(performance.now(), [ra, rb, rg]);
	});
} else {
	console.log('not ok');
}
//*/
