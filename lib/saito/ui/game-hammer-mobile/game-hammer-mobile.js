/**
 Utility to allow users to resize and move gameboard on a mobile device (replaces gameBoardSizer)
 Resizing and moving apply to a DOM element with id "gameboard" by default unless otherwise specified in attachEvents

 TODO: convert this into a class
*/

/*  fixHammerjsDeltaIssue: null,
  lastEvent: null,
  element: null,

  pinchZoomOrigin: {x: undefined, y: undefined},

  originalSize: {
    width: 2550,
    height: 1650
  },


  current: {
    x: 0,
    y: 0,
    z: 1,           //This is the scale factor
    width: 2550,
    height: 1650,
  },

*/

class GameHammerMobile {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		this.fixHammerjsDeltaIssue = null;
		this.lastEvent = null;
		this.element = null;
		this.pinchZoomOrigin = { x: undefined, y: undefined };

		this.originalSize = null;

		this.last = { x: 0, y: 0, z: 1 };
		this.current = JSON.parse(JSON.stringify(this.last));
		this.debug = true;
	}

	render(target = '.gameboard') {
		this.element = document.querySelector(target);

		if (!this.element) {
			console.error(target + ' does not exist for gameMobileHammer');
			return;
		}

		let boardWidth = parseInt(window.getComputedStyle(this.element).width);
		let boardHeight = parseInt(
			window.getComputedStyle(this.element).height
		);

		if (this.debug) {
			console.log('Basic gameboard size:', boardWidth, boardHeight);
		}
		if (window.getComputedStyle(this.element).boxSizing == 'content-box') {
			boardWidth +=
				parseInt(window.getComputedStyle(this.element).paddingLeft) +
				parseInt(window.getComputedStyle(this.element).paddingRight);
			boardHeight +=
				parseInt(window.getComputedStyle(this.element).paddingTop) +
				parseInt(window.getComputedStyle(this.element).paddingBottom);
		}
		if (this.debug) {
			console.log('With padding included:', boardWidth, boardHeight);
		}
		boardWidth +=
			parseInt(window.getComputedStyle(this.element).marginLeft) +
			parseInt(window.getComputedStyle(this.element).marginRight);
		boardHeight +=
			parseInt(window.getComputedStyle(this.element).marginTop) +
			parseInt(window.getComputedStyle(this.element).marginBottom);

		if (this.debug) {
			console.log('and with margins:', boardWidth, boardHeight);
		}

		this.originalSize = {
			width: boardWidth,
			height: boardHeight
		};

		this.element.style.position = 'absolute';

		let scale =
			Math.floor(
				100 *
					Math.min(
						window.innerWidth / boardWidth,
						window.innerHeight / boardHeight
					)
			) / 100;

		console.log(this.originalSize);

		this.pinchZoomOrigin = this.getRelativePosition(
			this.element,
			{ x: 0, y: 0 },
			this.originalSize,
			1
		);

		var d = this.scaleFrom(this.pinchZoomOrigin, 1, scale);
		console.log(d);
		this.current.x = d.x;
		this.current.y = d.y;
		this.current.z = d.z;

		this.last = JSON.parse(JSON.stringify(this.current));

		this.update();

		this.attachEvents(target);
	}

	attachEvents(target) {
		if (!this.element) {
			console.error(
				'Invalid selector for gameHammerMobile: ',
				target,
				'does not exist in DOM'
			);
			return;
		}

		try {
			//Create hammer (HammerJS included in index.html script)
			var hammertime = new Hammer(this.element, {});
			hammertime.get('pinch').set({ enable: true });
			hammertime.get('pan').set({ threshold: 0 });

			let hammer_self = this;

			//Dragging object
			hammertime.on('pan', function (e) {
				hammer_self.element.style.transition = 'unset';
				if (hammer_self.lastEvent !== 'pan') {
					hammer_self.fixHammerjsDeltaIssue = {
						x: e.deltaX,
						y: e.deltaY
					};
				}

				hammer_self.current.x =
					hammer_self.last.x +
					e.deltaX -
					hammer_self.fixHammerjsDeltaIssue.x;
				hammer_self.current.y =
					hammer_self.last.y +
					e.deltaY -
					hammer_self.fixHammerjsDeltaIssue.y;
				hammer_self.lastEvent = 'pan';
				hammer_self.update();
			});

			hammertime.on('panend', function (e) {
				hammer_self.last.x = hammer_self.current.x;
				hammer_self.last.y = hammer_self.current.y;
				hammer_self.lastEvent = 'panend';
				hammer_self.element.style.transition = '';
			});

			//Pinch scaling object
			hammertime.on('pinch', function (e) {
				console.log(e.scale);
				var d = hammer_self.scaleFrom(
					hammer_self.pinchZoomOrigin,
					hammer_self.last.z,
					hammer_self.last.z * e.scale
				);
				hammer_self.current.x =
					(d.x + hammer_self.last.x + e.deltaX) * e.scale;
				hammer_self.current.y =
					(d.y + hammer_self.last.y + e.deltaY) * e.scale;
				hammer_self.current.z = d.z;
				hammer_self.lastEvent = 'pinch';
				hammer_self.update();
			});

			hammertime.on('pinchstart', function (e) {
				hammer_self.pinchZoomOrigin = hammer_self.getRelativePosition(
					hammer_self.element,
					{
						x: e.center.x,
						y: e.center.y
					},
					hammer_self.originalSize,
					hammer_self.current.z
				);
				hammer_self.lastEvent = 'pinchstart';
			});

			hammertime.on('pinchend', function (e) {
				hammer_self.last.x = hammer_self.current.x;
				hammer_self.last.y = hammer_self.current.y;
				hammer_self.last.z = hammer_self.current.z;
				hammer_self.lastEvent = 'pinchend';
			});
		} catch (err) {
			console.error('Error: ' + err);
		}
	}

	update() {
		this.current.height = this.originalSize.height * this.current.z;
		this.current.width = this.originalSize.width * this.current.z;
		this.element.style.transform = `translate3d(${this.current.x}px, ${this.current.y}px, 0) scale(${this.current.z})`;
	}

	getRelativePosition(element, point, originalSize, scale) {
		var domCoords = this.getCoords(element);

		var elementX = point.x - domCoords.x;
		var elementY = point.y - domCoords.y;

		var relativeX = elementX / ((originalSize.width * scale) / 2) - 1;
		var relativeY = elementY / ((originalSize.height * scale) / 2) - 1;
		return { x: relativeX, y: relativeY };
	}

	getCoords(elem) {
		var box = elem.getBoundingClientRect();

		var body = document.body;
		var docEl = document.documentElement;

		var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
		var scrollLeft =
			window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

		var clientTop = docEl.clientTop || body.clientTop || 0;
		var clientLeft = docEl.clientLeft || body.clientLeft || 0;

		var top = box.top + scrollTop - clientTop;
		var left = box.left + scrollLeft - clientLeft;

		return { x: Math.round(left), y: Math.round(top) };
	}

	scaleFrom(zoomOrigin, currentScale, newScale) {
		var currentShift = this.getCoordinateShiftDueToScale(
			this.originalSize,
			currentScale
		);
		var newShift = this.getCoordinateShiftDueToScale(
			this.originalSize,
			newScale
		);
		//game_mod.updateLog(`Current (${currentScale}):${currentShift.x}, ${currentShift.y}; New (${newScale}):${newShift.x}, ${newShift.y} `);

		return {
			x: zoomOrigin.x * (currentShift.x - newShift.x),
			y: zoomOrigin.y * (currentShift.y - newShift.y),
			z: newScale
		};
	}

	getCoordinateShiftDueToScale(size, scale) {
		var newWidth = scale * size.width;
		var newHeight = scale * size.height;
		var dx = (newWidth - size.width) / 2;
		var dy = (newHeight - size.height) / 2;
		return {
			x: dx,
			y: dy
		};
	}
}

module.exports = GameHammerMobile;
