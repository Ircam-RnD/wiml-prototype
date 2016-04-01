//let AudioContext = window.AudioContext || window.webkitAudioContext || function(){};

export default class AudioPlayer {
	constructor(context, buffer) {
		this.context = context;
		//this.context = new AudioContext();
		this.sourceBuffer = this.context.createBufferSource();
		this.bufferGain = this.context.createGain();
		this.sourceBuffer.buffer = buffer;
		this.sourceBuffer.loop = true;
		this.bufferGain.gain.value = 0;
		this.fadeID = -1;

		this.sourceBuffer.connect(this.bufferGain);
		this.bufferGain.connect(this.context.destination);

		this.fadeFunction = ((target, inc) => {
			//console.log(this.bufferGain.gain.value);
			if(this.bufferGain.gain.value === target) return;
			if(Math.abs(this.bufferGain.gain.value - target) > Math.abs(inc)) {
				//console.log(this.bufferGain.gain.value);
				this.bufferGain.gain.value += inc;
			}

			if(Math.abs(this.bufferGain.gain.value - target) < Math.abs(inc)) {
				this.bufferGain.gain.value = target;
				clearInterval(this.fadeID);
			}
		});
	}

	start() {
		this.sourceBuffer.start(this.context.currentTime);
	}

	stop() {
		this.sourceBuffer.stop();
	}

	fade(target, duration) {
		if(duration === 0) {
			this.bufferGain.gain.value = target;
			return;
		}
		let interval = 10;
		let inc = (target - this.bufferGain.gain.value) / (duration / interval);
		//console.log(this.bufferGain.gain.value + " -> " + target + " " + inc);
		if(inc == 0) return;
		clearInterval(this.fadeID);
		this.fadeID = setInterval(this.fadeFunction.bind(this, target, inc), interval);
	}
}