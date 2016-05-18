/*
 *	lfo-select : filters the output of previous lfo
 *	-----------------------------------------------
 *	you can plug any lfo into various lfo-selects to split its output
 * 	and visualize the splitted outputs in separate lfo-sinks for example
 */

"use strict";

var _get = require("babel-runtime/helpers/get")["default"];

var _inherits = require("babel-runtime/helpers/inherits")["default"];

var _createClass = require("babel-runtime/helpers/create-class")["default"];

var _classCallCheck = require("babel-runtime/helpers/class-call-check")["default"];

var _interopRequireWildcard = require("babel-runtime/helpers/interop-require-wildcard")["default"];

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _wavesLfo = require('waves-lfo');

var lfo = _interopRequireWildcard(_wavesLfo);

var Select = (function (_lfo$core$BaseLfo) {
	_inherits(Select, _lfo$core$BaseLfo);

	function Select() {
		var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

		_classCallCheck(this, Select);

		var defaults = {
			indexList: [],
			mode: "include" // can be exclude or include
		};
		_get(Object.getPrototypeOf(Select.prototype), "constructor", this).call(this, defaults, options);

		// remove duplicate indices :
		var indexList = this.params.indexList;

		for (var i = 0; i < indexList.length - 1; i++) {
			for (var j = indexList.length - 1; j > i; j--) {
				if (indexList[i] == indexList[j]) {
					indexList.splice(j, 1);
				}
			}
		}
		//console.log(indexList);
	}

	_createClass(Select, [{
		key: "initialize",
		value: function initialize() {
			var streamParams = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

			this.inputFrameSize = streamParams.frameSize;
			this.streamParams.frameSize = this.inputFrameSize;
			if (this.params.mode === "exclude") {
				for (var i = this.params.indexList.length - 1; i >= 0; i--) {
					if (this.params.indexList[i] < this.inputFrameSize && this.params.indexList[i] >= 0) {
						this.streamParams.frameSize--;
					} else {
						this.params.indexList.splice(i, 1);
					}
				}
			} else if (this.params.mode === "include") {
				this.streamParams.frameSize = 0;
				for (var i = this.params.indexList.length - 1; i >= 0; i--) {
					if (this.params.indexList[i] < this.inputFrameSize && this.params.indexList[i] >= 0) {
						this.streamParams.frameSize++;
					} else {
						this.params.indexList.splice(i, 1);
					}
				}
			}
			_get(Object.getPrototypeOf(Select.prototype), "initialize", this).call(this, this.streamParams);
		}

		// QUESTION : are frame.length in process and streamParams.frameSize in initialize the same value ?
		// ot is streamParams here to allow specification of "columns" (or "rows", whatever ...) ?
		// just in case, let's keep this.params.inputFrameSize for comparison
		// in this case the tricky one should be lfo.slicer -> have another look at it

	}, {
		key: "process",
		value: function process(time, frame, metaData) {
			this.time = time;
			this.metaData = metaData;

			if (this.params.mode === "exclude") {
				// WRONG !!!
				// WRONG !!!
				// DO NOTHING FOR NOW ...
				/*
    for(let i=0, j=0; i<this.params.indexList.length; i++) {
    	// DO THE INVERSE !!! => loop on inputFrameSize (aka frame.length) and use indexOf !
    	if(this.params.indexList[i] < this.inputFrameSize) {
    		this.outFrame[j] = 0;//
    		j++;
    	}
    }
    */
				for (var i = 0; i < this.params.indexList.length; i++) {
					// fill with non-excluded indexes
				}
			} else if (this.params.mode === "include") {
					// RIGHT !!!
					for (var i = 0; i < this.params.indexList.length; i++) {
						this.outFrame[i] = 0; //
						i++;
					}
				} else {
					// pass averything through
					this.outFrame.set(frame, 0);
				}

			this.output();
		}
	}]);

	return Select;
})(lfo.core.BaseLfo);

exports["default"] = Select;
module.exports = exports["default"];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9jbGllbnQvY29tbW9uL2xmby1zZWxlY3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBT3FCLFdBQVc7O0lBQXBCLEdBQUc7O0lBRU0sTUFBTTtXQUFOLE1BQU07O0FBQ2YsVUFEUyxNQUFNLEdBQ0E7TUFBZCxPQUFPLHlEQUFHLEVBQUU7O3dCQURKLE1BQU07O0FBRXpCLE1BQU0sUUFBUSxHQUFHO0FBQ2hCLFlBQVMsRUFBRSxFQUFFO0FBQ2IsT0FBSSxFQUFFLFNBQVM7R0FDZixDQUFBO0FBQ0QsNkJBTm1CLE1BQU0sNkNBTW5CLFFBQVEsRUFBRSxPQUFPLEVBQUU7OztBQUd6QixNQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQzs7QUFFdEMsT0FBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3ZDLFFBQUksSUFBSSxDQUFDLEdBQUMsU0FBUyxDQUFDLE1BQU0sR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN2QyxRQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDaEMsY0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDdkI7SUFDRDtHQUNEOztFQUdEOztjQXBCbUIsTUFBTTs7U0FzQmhCLHNCQUFvQjtPQUFuQixZQUFZLHlEQUFHLEVBQUU7O0FBQzNCLE9BQUksQ0FBQyxjQUFjLEdBQUcsWUFBWSxDQUFDLFNBQVMsQ0FBQztBQUM3QyxPQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO0FBQ2xELE9BQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFO0FBQ2xDLFNBQUksSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBRSxDQUFDLElBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3BELFNBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDbkYsVUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsQ0FBQztNQUM5QixNQUFNO0FBQ04sVUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztNQUNuQztLQUNEO0lBQ0QsTUFBTSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTtBQUN6QyxRQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFDaEMsU0FBSSxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUMsQ0FBQyxFQUFFLENBQUMsSUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDcEQsU0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNuRixVQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO01BQzlCLE1BQU07QUFDTixVQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ25DO0tBQ0Q7SUFDRDtBQUNELDhCQTNDbUIsTUFBTSw0Q0EyQ1IsSUFBSSxDQUFDLFlBQVksRUFBRTtHQUNwQzs7Ozs7Ozs7O1NBT00saUJBQUMsSUFBSSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUU7QUFDOUIsT0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsT0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0FBRXpCLE9BQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssU0FBUyxFQUFFOzs7Ozs7Ozs7Ozs7O0FBYWxDLFNBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7O0tBRWpEO0lBQ0QsTUFBTSxJQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLFNBQVMsRUFBRTs7QUFFekMsVUFBSSxJQUFJLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUNqRCxVQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQixPQUFDLEVBQUUsQ0FBQztNQUNKO0tBQ0QsTUFBTTs7QUFDTixTQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7S0FDNUI7O0FBRUQsT0FBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0dBQ2Q7OztRQWxGbUIsTUFBTTtHQUFTLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTzs7cUJBQS9CLE1BQU0iLCJmaWxlIjoic3JjL2NsaWVudC9jb21tb24vbGZvLXNlbGVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKlx0bGZvLXNlbGVjdCA6IGZpbHRlcnMgdGhlIG91dHB1dCBvZiBwcmV2aW91cyBsZm9cbiAqXHQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICpcdHlvdSBjYW4gcGx1ZyBhbnkgbGZvIGludG8gdmFyaW91cyBsZm8tc2VsZWN0cyB0byBzcGxpdCBpdHMgb3V0cHV0XG4gKiBcdGFuZCB2aXN1YWxpemUgdGhlIHNwbGl0dGVkIG91dHB1dHMgaW4gc2VwYXJhdGUgbGZvLXNpbmtzIGZvciBleGFtcGxlXG4gKi9cblxuaW1wb3J0ICogYXMgbGZvIGZyb20gJ3dhdmVzLWxmbyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNlbGVjdCBleHRlbmRzIGxmby5jb3JlLkJhc2VMZm8ge1xuXHRjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcblx0XHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRcdGluZGV4TGlzdDogW10sXG5cdFx0XHRtb2RlOiBcImluY2x1ZGVcIiAvLyBjYW4gYmUgZXhjbHVkZSBvciBpbmNsdWRlXG5cdFx0fVxuXHRcdHN1cGVyKGRlZmF1bHRzLCBvcHRpb25zKTtcblxuXHRcdC8vIHJlbW92ZSBkdXBsaWNhdGUgaW5kaWNlcyA6XG5cdFx0bGV0IGluZGV4TGlzdCA9IHRoaXMucGFyYW1zLmluZGV4TGlzdDtcblxuXHRcdGZvcihsZXQgaT0wOyBpPGluZGV4TGlzdC5sZW5ndGgtMTsgaSsrKSB7XG5cdFx0XHRmb3IobGV0IGo9aW5kZXhMaXN0Lmxlbmd0aC0xOyBqPmk7IGotLSkge1xuXHRcdFx0XHRpZihpbmRleExpc3RbaV0gPT0gaW5kZXhMaXN0W2pdKSB7XG5cdFx0XHRcdFx0aW5kZXhMaXN0LnNwbGljZShqLCAxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvL2NvbnNvbGUubG9nKGluZGV4TGlzdCk7XG5cblx0fVxuXG5cdGluaXRpYWxpemUoc3RyZWFtUGFyYW1zID0ge30pIHtcblx0XHR0aGlzLmlucHV0RnJhbWVTaXplID0gc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZTtcblx0XHR0aGlzLnN0cmVhbVBhcmFtcy5mcmFtZVNpemUgPSB0aGlzLmlucHV0RnJhbWVTaXplO1xuXHRcdGlmKHRoaXMucGFyYW1zLm1vZGUgPT09IFwiZXhjbHVkZVwiKSB7XG5cdFx0XHRmb3IobGV0IGk9dGhpcy5wYXJhbXMuaW5kZXhMaXN0Lmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRcdFx0aWYodGhpcy5wYXJhbXMuaW5kZXhMaXN0W2ldIDwgdGhpcy5pbnB1dEZyYW1lU2l6ZSAmJiB0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPj0gMCkge1xuXHRcdFx0XHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZS0tO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFyYW1zLmluZGV4TGlzdC5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYodGhpcy5wYXJhbXMubW9kZSA9PT0gXCJpbmNsdWRlXCIpIHtcblx0XHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSA9IDA7XG5cdFx0XHRmb3IobGV0IGk9dGhpcy5wYXJhbXMuaW5kZXhMaXN0Lmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcblx0XHRcdFx0aWYodGhpcy5wYXJhbXMuaW5kZXhMaXN0W2ldIDwgdGhpcy5pbnB1dEZyYW1lU2l6ZSAmJiB0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPj0gMCkge1xuXHRcdFx0XHRcdHRoaXMuc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSsrO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMucGFyYW1zLmluZGV4TGlzdC5zcGxpY2UoaSwgMSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0c3VwZXIuaW5pdGlhbGl6ZSh0aGlzLnN0cmVhbVBhcmFtcyk7XG5cdH1cblxuXHQvLyBRVUVTVElPTiA6IGFyZSBmcmFtZS5sZW5ndGggaW4gcHJvY2VzcyBhbmQgc3RyZWFtUGFyYW1zLmZyYW1lU2l6ZSBpbiBpbml0aWFsaXplIHRoZSBzYW1lIHZhbHVlID9cblx0Ly8gb3QgaXMgc3RyZWFtUGFyYW1zIGhlcmUgdG8gYWxsb3cgc3BlY2lmaWNhdGlvbiBvZiBcImNvbHVtbnNcIiAob3IgXCJyb3dzXCIsIHdoYXRldmVyIC4uLikgP1xuXHQvLyBqdXN0IGluIGNhc2UsIGxldCdzIGtlZXAgdGhpcy5wYXJhbXMuaW5wdXRGcmFtZVNpemUgZm9yIGNvbXBhcmlzb25cblx0Ly8gaW4gdGhpcyBjYXNlIHRoZSB0cmlja3kgb25lIHNob3VsZCBiZSBsZm8uc2xpY2VyIC0+IGhhdmUgYW5vdGhlciBsb29rIGF0IGl0XG5cblx0cHJvY2Vzcyh0aW1lLCBmcmFtZSwgbWV0YURhdGEpIHtcblx0XHR0aGlzLnRpbWUgPSB0aW1lO1xuXHRcdHRoaXMubWV0YURhdGEgPSBtZXRhRGF0YTtcblxuXHRcdGlmKHRoaXMucGFyYW1zLm1vZGUgPT09IFwiZXhjbHVkZVwiKSB7XG5cdFx0XHQvLyBXUk9ORyAhISFcblx0XHRcdC8vIFdST05HICEhIVxuXHRcdFx0Ly8gRE8gTk9USElORyBGT1IgTk9XIC4uLlxuXHRcdFx0Lypcblx0XHRcdGZvcihsZXQgaT0wLCBqPTA7IGk8dGhpcy5wYXJhbXMuaW5kZXhMaXN0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdC8vIERPIFRIRSBJTlZFUlNFICEhISA9PiBsb29wIG9uIGlucHV0RnJhbWVTaXplIChha2EgZnJhbWUubGVuZ3RoKSBhbmQgdXNlIGluZGV4T2YgIVxuXHRcdFx0XHRpZih0aGlzLnBhcmFtcy5pbmRleExpc3RbaV0gPCB0aGlzLmlucHV0RnJhbWVTaXplKSB7XG5cdFx0XHRcdFx0dGhpcy5vdXRGcmFtZVtqXSA9IDA7Ly9cblx0XHRcdFx0XHRqKys7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdCovXG5cdFx0XHRmb3IobGV0IGk9MDsgaTx0aGlzLnBhcmFtcy5pbmRleExpc3QubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gZmlsbCB3aXRoIG5vbi1leGNsdWRlZCBpbmRleGVzXG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmKHRoaXMucGFyYW1zLm1vZGUgPT09IFwiaW5jbHVkZVwiKSB7XG5cdFx0XHQvLyBSSUdIVCAhISFcblx0XHRcdGZvcihsZXQgaT0wOyBpPHRoaXMucGFyYW1zLmluZGV4TGlzdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHR0aGlzLm91dEZyYW1lW2ldID0gMDsvL1xuXHRcdFx0XHRpKys7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHsgLy8gcGFzcyBhdmVyeXRoaW5nIHRocm91Z2hcblx0XHRcdHRoaXMub3V0RnJhbWUuc2V0KGZyYW1lLCAwKTtcblx0XHR9XG5cblx0XHR0aGlzLm91dHB1dCgpO1xuXHR9XG5cbn0iXX0=