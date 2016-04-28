// intensity : lfo returning an estimation of movement intensity (energy)
// uses derivation + integration to return to zero when there is no movement
// based on the intensity module developed by Fred Bevilacqua and Gael Dubus
// for the MusicBricks EU project

'use strict';

var _get = require('babel-runtime/helpers/get')['default'];

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _createClass = require('babel-runtime/helpers/create-class')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _interopRequireWildcard = require('babel-runtime/helpers/interop-require-wildcard')['default'];

var _interopRequireDefault = require('babel-runtime/helpers/interop-require-default')['default'];

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

var _lfoDelta = require('./lfo-delta');

var _lfoDelta2 = _interopRequireDefault(_lfoDelta);

// internal class : the complete algorithm needs linear regression as derivation

var IntensityCore = (function (_lfo$core$BaseLfo) {
	_inherits(IntensityCore, _lfo$core$BaseLfo);

	function IntensityCore() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, IntensityCore);

		var defaults = {
			integrationFactor: 0.8,
			outputGain: 0.005
		};
		_get(Object.getPrototypeOf(IntensityCore.prototype), 'constructor', this).call(this, defaults, options);

		this.inputDims = 0;

		_get(Object.getPrototypeOf(IntensityCore.prototype), 'constructor', this).call(this, defaults, options);
	}

	//======================================================//
	//============= the real Intensity class ===============//
	//======================================================//

	_createClass(IntensityCore, [{
		key: 'initialize',
		value: function initialize() {
			var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			this.inputFrameSize = inStreamParams.frameSize;
			this.frameAccumulator = new Float32Array(this.inputFrameSize);

			outStreamParams.frameSize = 1;
			_get(Object.getPrototypeOf(IntensityCore.prototype), 'initialize', this).call(this, inStreamParams, outStreamParams);

			for (var i = 0; i < this.inputFrameSize; i++) {
				this.frameAccumulator[i] = 0;
			}
			//console.log(this.streamParams.frameSize + ' ' + this.inputFrameSize);
		}
	}, {
		key: 'process',
		value: function process(time, frame, metaData) {
			var factor = this.params.integrationFactor;
			var gain = this.params.outputGain;
			var inSize = this.inputFrameSize;
			var frameBuf = this.frameAccumulator;

			var outValue = 0;

			for (var i = 0; i < inSize; i++) {
				var sqi = frame[i] * frame[i];
				frameBuf[i] = sqi + frameBuf[i] * factor;

				// outValue += frameBuf[i] * gain;

				// see below : use sqrt instead of output gain
				outValue += frameBuf[i];
			}

			// this.outFrame[0] = outValue;

			// little mod : use sqrt instead of output gain
			// so that the algorithm is more similar to RMS computation
			// (sqrt'ed sum of squares)
			this.outFrame[0] = Math.sqrt(outValue);
			//console.log(outValue);
			this.output(time, this.outFrame, metaData);
		}
	}]);

	return IntensityCore;
})(lfo.core.BaseLfo);

var Intensity = (function (_lfo$core$BaseLfo2) {
	_inherits(Intensity, _lfo$core$BaseLfo2);

	function Intensity() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Intensity);

		var defaults = {};
		_get(Object.getPrototypeOf(Intensity.prototype), 'constructor', this).call(this, defaults, options);

		this.delta = new _lfoDelta2['default']({
			order: 3
		});

		this.intensity = new IntensityCore({});

		this.delta.connect(this.intensity);
	}

	_createClass(Intensity, [{
		key: 'initialize',
		value: function initialize() {
			var inStreamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
			var outStreamParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

			this.delta.initialize(inStreamParams, outStreamParams);
		}
	}, {
		key: 'connect',
		value: function connect(child) {
			this.intensity.children.push(child);
			child.parent = this.intensity;
		}
	}, {
		key: 'process',
		value: function process(time, frame, metaData) {
			this.delta.process(time, frame, metaData);
		}
	}]);

	return Intensity;
})(lfo.core.BaseLfo);

exports['default'] = Intensity;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1pbnRlbnNpdHkuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBS3FCLFdBQVc7O0lBQXBCLEdBQUc7O3dCQUNHLGFBQWE7Ozs7OztJQUl6QixhQUFhO1dBQWIsYUFBYTs7QUFFUCxVQUZOLGFBQWEsR0FFUTtNQUFkLE9BQU8seURBQUcsRUFBRTs7d0JBRm5CLGFBQWE7O0FBR2pCLE1BQU0sUUFBUSxHQUFHO0FBQ2hCLG9CQUFpQixFQUFFLEdBQUc7QUFDdEIsYUFBVSxFQUFFLEtBQUs7R0FDakIsQ0FBQztBQUNGLDZCQVBJLGFBQWEsNkNBT1gsUUFBUSxFQUFFLE9BQU8sRUFBRTs7QUFFekIsTUFBSSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7O0FBRW5CLDZCQVhJLGFBQWEsNkNBV1gsUUFBUSxFQUFFLE9BQU8sRUFBRTtFQUN6Qjs7Ozs7O2NBWkksYUFBYTs7U0FjUixzQkFBNEM7T0FBM0MsY0FBYyx5REFBRyxFQUFFO09BQUUsZUFBZSx5REFBRyxFQUFFOztBQUNuRCxPQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUM7QUFDL0MsT0FBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQzs7QUFFOUQsa0JBQWUsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQzlCLDhCQW5CSSxhQUFhLDRDQW1CQSxjQUFjLEVBQUUsZUFBZSxFQUFFOztBQUVsRCxRQUFJLElBQUksQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxRQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCOztHQUVEOzs7U0FFTSxpQkFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRTtBQUM5QixPQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDO0FBQzdDLE9BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO0FBQ3BDLE9BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUM7QUFDbkMsT0FBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDOztBQUV2QyxPQUFJLFFBQVEsR0FBRyxDQUFDLENBQUM7O0FBRWpCLFFBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDM0IsUUFBSSxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM5QixZQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7Ozs7O0FBS3pDLFlBQVEsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDeEI7Ozs7Ozs7QUFPRCxPQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7O0FBRXZDLE9BQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7R0FDM0M7OztRQXJESSxhQUFhO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztJQTREdkIsU0FBUztXQUFULFNBQVM7O0FBRWxCLFVBRlMsU0FBUyxHQUVIO01BQWQsT0FBTyx5REFBRyxFQUFFOzt3QkFGSixTQUFTOztBQUc1QixNQUFNLFFBQVEsR0FBRyxFQUNoQixDQUFDO0FBQ0YsNkJBTG1CLFNBQVMsNkNBS3RCLFFBQVEsRUFBRSxPQUFPLEVBQUU7O0FBRXpCLE1BQUksQ0FBQyxLQUFLLEdBQUcsMEJBQVU7QUFDdEIsUUFBSyxFQUFFLENBQUM7R0FDUixDQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLGFBQWEsQ0FBQyxFQUNsQyxDQUFDLENBQUM7O0FBRUgsTUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0VBRW5DOztjQWhCbUIsU0FBUzs7U0FrQm5CLHNCQUE0QztPQUEzQyxjQUFjLHlEQUFHLEVBQUU7T0FBRSxlQUFlLHlEQUFHLEVBQUU7O0FBQ25ELE9BQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLGNBQWMsRUFBRSxlQUFlLENBQUMsQ0FBQztHQUN2RDs7O1NBRU0saUJBQUMsS0FBSyxFQUFFO0FBQ1gsT0FBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLFFBQUssQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztHQUNqQzs7O1NBRU0saUJBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDOUIsT0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztHQUMxQzs7O1FBN0JtQixTQUFTO0dBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPOztxQkFBbEMsU0FBUyIsImZpbGUiOiJzcmMvY2xpZW50L2NvbW1vbi9sZm8taW50ZW5zaXR5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gaW50ZW5zaXR5IDogbGZvIHJldHVybmluZyBhbiBlc3RpbWF0aW9uIG9mIG1vdmVtZW50IGludGVuc2l0eSAoZW5lcmd5KVxuLy8gdXNlcyBkZXJpdmF0aW9uICsgaW50ZWdyYXRpb24gdG8gcmV0dXJuIHRvIHplcm8gd2hlbiB0aGVyZSBpcyBubyBtb3ZlbWVudFxuLy8gYmFzZWQgb24gdGhlIGludGVuc2l0eSBtb2R1bGUgZGV2ZWxvcGVkIGJ5IEZyZWQgQmV2aWxhY3F1YSBhbmQgR2FlbCBEdWJ1c1xuLy8gZm9yIHRoZSBNdXNpY0JyaWNrcyBFVSBwcm9qZWN0XG5cbmltcG9ydCAqIGFzIGxmbyBmcm9tICd3YXZlcy1sZm8nO1xuaW1wb3J0IERlbHRhIGZyb20gJy4vbGZvLWRlbHRhJztcblxuLy8gaW50ZXJuYWwgY2xhc3MgOiB0aGUgY29tcGxldGUgYWxnb3JpdGhtIG5lZWRzIGxpbmVhciByZWdyZXNzaW9uIGFzIGRlcml2YXRpb25cblxuY2xhc3MgSW50ZW5zaXR5Q29yZSBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXG5cdGNvbnN0cnVjdG9yKG9wdGlvbnMgPSB7fSkge1xuXHRcdGNvbnN0IGRlZmF1bHRzID0ge1xuXHRcdFx0aW50ZWdyYXRpb25GYWN0b3I6IDAuOCxcblx0XHRcdG91dHB1dEdhaW46IDAuMDA1XG5cdFx0fTtcblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cblx0XHR0aGlzLmlucHV0RGltcyA9IDA7XG5cblx0XHRzdXBlcihkZWZhdWx0cywgb3B0aW9ucyk7XG5cdH1cblxuXHRpbml0aWFsaXplKGluU3RyZWFtUGFyYW1zID0ge30sIG91dFN0cmVhbVBhcmFtcyA9IHt9KSB7XG5cdFx0dGhpcy5pbnB1dEZyYW1lU2l6ZSA9IGluU3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcblx0XHR0aGlzLmZyYW1lQWNjdW11bGF0b3IgPSBuZXcgRmxvYXQzMkFycmF5KHRoaXMuaW5wdXRGcmFtZVNpemUpO1xuXG5cdFx0b3V0U3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IDE7XG5cdFx0c3VwZXIuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcywgb3V0U3RyZWFtUGFyYW1zKTtcblxuXHRcdGZvcihsZXQgaT0wOyBpPHRoaXMuaW5wdXRGcmFtZVNpemU7IGkrKykge1xuXHRcdFx0dGhpcy5mcmFtZUFjY3VtdWxhdG9yW2ldID0gMDtcblx0XHR9XG5cdFx0Ly9jb25zb2xlLmxvZyh0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgKyAnICcgKyB0aGlzLmlucHV0RnJhbWVTaXplKTtcblx0fVxuXG5cdHByb2Nlc3ModGltZSwgZnJhbWUsIG1ldGFEYXRhKSB7XG5cdFx0Y29uc3QgZmFjdG9yID0gdGhpcy5wYXJhbXMuaW50ZWdyYXRpb25GYWN0b3I7XG5cdFx0Y29uc3QgZ2FpbiA9IHRoaXMucGFyYW1zLm91dHB1dEdhaW47XG5cdFx0Y29uc3QgaW5TaXplID0gdGhpcy5pbnB1dEZyYW1lU2l6ZTtcblx0XHRjb25zdCBmcmFtZUJ1ZiA9IHRoaXMuZnJhbWVBY2N1bXVsYXRvcjtcblxuXHRcdGxldCBvdXRWYWx1ZSA9IDA7XG5cblx0XHRmb3IobGV0IGk9MDsgaTxpblNpemU7IGkrKykge1xuXHRcdFx0bGV0IHNxaSA9IGZyYW1lW2ldICogZnJhbWVbaV07XG5cdFx0XHRmcmFtZUJ1ZltpXSA9IHNxaSArIGZyYW1lQnVmW2ldICogZmFjdG9yO1xuXG5cdFx0XHQvLyBvdXRWYWx1ZSArPSBmcmFtZUJ1ZltpXSAqIGdhaW47XG5cdFx0XHRcblx0XHRcdC8vIHNlZSBiZWxvdyA6IHVzZSBzcXJ0IGluc3RlYWQgb2Ygb3V0cHV0IGdhaW5cblx0XHRcdG91dFZhbHVlICs9IGZyYW1lQnVmW2ldO1xuXHRcdH1cblxuXHRcdC8vIHRoaXMub3V0RnJhbWVbMF0gPSBvdXRWYWx1ZTtcblxuXHRcdC8vIGxpdHRsZSBtb2QgOiB1c2Ugc3FydCBpbnN0ZWFkIG9mIG91dHB1dCBnYWluXG5cdFx0Ly8gc28gdGhhdCB0aGUgYWxnb3JpdGhtIGlzIG1vcmUgc2ltaWxhciB0byBSTVMgY29tcHV0YXRpb25cblx0XHQvLyAoc3FydCdlZCBzdW0gb2Ygc3F1YXJlcylcblx0XHR0aGlzLm91dEZyYW1lWzBdID0gTWF0aC5zcXJ0KG91dFZhbHVlKTtcblx0XHQvL2NvbnNvbGUubG9nKG91dFZhbHVlKTtcblx0XHR0aGlzLm91dHB1dCh0aW1lLCB0aGlzLm91dEZyYW1lLCBtZXRhRGF0YSk7XG5cdH1cbn1cblxuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuLy89PT09PT09PT09PT09IHRoZSByZWFsIEludGVuc2l0eSBjbGFzcyA9PT09PT09PT09PT09PT0vL1xuLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0vL1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJbnRlbnNpdHkgZXh0ZW5kcyBsZm8uY29yZS5CYXNlTGZvIHtcblxuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHR9O1xuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdHRoaXMuZGVsdGEgPSBuZXcgRGVsdGEoe1xuXHRcdFx0b3JkZXI6IDNcblx0XHR9KTtcblxuXHRcdHRoaXMuaW50ZW5zaXR5ID0gbmV3IEludGVuc2l0eUNvcmUoe1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5kZWx0YS5jb25uZWN0KHRoaXMuaW50ZW5zaXR5KTtcblxuXHR9XG5cblx0aW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcyA9IHt9LCBvdXRTdHJlYW1QYXJhbXMgPSB7fSkge1xuXHRcdHRoaXMuZGVsdGEuaW5pdGlhbGl6ZShpblN0cmVhbVBhcmFtcywgb3V0U3RyZWFtUGFyYW1zKTtcblx0fVxuXG5cdGNvbm5lY3QoY2hpbGQpIHtcbiAgICBcdHRoaXMuaW50ZW5zaXR5LmNoaWxkcmVuLnB1c2goY2hpbGQpO1xuICAgIFx0Y2hpbGQucGFyZW50ID0gdGhpcy5pbnRlbnNpdHk7XG5cdH1cblxuXHRwcm9jZXNzKHRpbWUsIGZyYW1lLCBtZXRhRGF0YSkge1xuXHRcdHRoaXMuZGVsdGEucHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpO1xuXHR9XG59Il19