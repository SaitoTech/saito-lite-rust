const GameHammerMobileTemplate = require('./game-hammer-mobile.template');

/**
 Utility to allow users to resize and move gameboard on a mobile device (replaces gameBoardSizer)
 Resizing and moving apply to a DOM element with id "gameboard" by default unless otherwise specified in attachEvents
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
		this.rendered = false;

		this.rightJustify = false;
	}

	render(target = '.gameboard', min_width = 0, min_height = 0) {
		this.element = document.querySelector(target);

		if (!this.element) {
			console.error(target + ' does not exist for gameMobileHammer');
			return;
		}

		if (!this.rendered){
			this.app.connection.on("browser-fullscreen-toggle", () => {
			  setTimeout( ()=> { 
			  		this.render(target, min_width, min_height);
			  	}, 25);
			});
			this.rendered = true;

			screen.orientation.addEventListener("change", (event) => {
			  const type = event.target.type;
			  const angle = event.target.angle;
			  console.log(`ScreenOrientation change: ${type}, ${angle} degrees.`);
			  setTimeout( ()=> { 
			  		this.render(target, min_width, min_height);
			  	}, 25);
			});
		}

		this.element.removeAttribute("style");

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

		let fit_width = window.innerWidth;
		let fit_height = window.innerHeight;

		if (this.debug){
			console.log("screensize: ", fit_width, fit_height);
		}

		let scale =
			Math.floor(
				100 *
					Math.min(
						fit_width / boardWidth,
						fit_height / boardHeight
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

		if (min_width){

			//Square boards
			min_height = min_height || min_width;

			if (min_width > window.innerWidth || min_height > window.innerHeight){
				this.min_width = min_width;
				this.min_height = min_height;
				if (!document.getElementById('game_board_size_toggle')) {
					this.app.browser.addElementToDom(GameHammerMobileTemplate());
				}
			}

			this.alternateEvents(target);
		}else{
			this.attachEvents(target);
		}
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


	alternateEvents(target){
		let toggle = document.getElementById('game_board_size_toggle');
		if (toggle){
			toggle.onclick = (e) => {
				let icon = e.currentTarget.querySelector("i");

				let fit_width, fit_height;

				if (icon.classList.contains("fa-minimize")){
					fit_width = window.innerWidth;
					fit_height = window.innerHeight;
				}else{
					fit_width = Math.max(window.innerWidth, this.min_width);
					fit_height = Math.max(window.innerHeight, this.min_height);	
				}

				icon.classList.toggle("fa-minimize");
				icon.classList.toggle("fa-maximize");

				this.element.style.left = '';
				this.element.style.top ='';

				let scale =
					Math.floor(
						100 *
							Math.min(
								fit_width / this.originalSize.width,
								fit_height / this.originalSize.height
							)
					) / 100;

				this.pinchZoomOrigin = this.getRelativePosition(
					this.element,
					{ x: 0, y: 0 },
					this.originalSize,
					1
				);

				var d = this.scaleFrom(this.pinchZoomOrigin, 1, scale);

				this.current.x = d.x;
				this.current.y = d.y;
				this.current.z = d.z;

				this.last = JSON.parse(JSON.stringify(this.current));

				this.update();
				this.makeDraggableBounded(target);				
			}
		}

		this.makeDraggableBounded(target);
	}


	makeDraggableBounded(target){

		try {
			const element_to_move = document.querySelector(target);

			let mouse_down_left = 0;
			let mouse_down_top = 0;
			let mouse_current_left = 0;
			let mouse_current_top = 0;
			let element_start_left = 0;
			let element_start_top = 0;

			let element_width = element_to_move.getBoundingClientRect().width;
			let element_height = element_to_move.getBoundingClientRect().height;

			// Allow you to push the board off screen, but keep enough so you can grab it again


			let max_x, min_x, max_y, min_y;

			if (element_width >= window.innerWidth) {
				max_x = 0;
				min_x = window.innerWidth - element_width;
			} else{
				min_x = 0;
				max_x = window.innerWidth - element_width;
			}

			if (element_height >= window.innerHeight) {
				max_y = 0;
				min_y = window.innerHeight - element_height;
			}else{
				min_y = 0;
				max_y = window.innerHeight - element_height;
			}

			if (this.debug){
				console.log("Set dragging boundaries: ", min_x, min_y, max_x, max_y);
			}

			if (this.rightJustify){
				element_to_move.style.left = max_x + 'px';	
			}

			element_to_move.ontouchstart = function (e) {
				e = e || window.event;

				if (!e.currentTarget?.id || !target.includes(e.currentTarget.id)) {
					console.warn(target);
					document.ontouchend = null;
					document.ontouchmove = null;
					return;
				}

				element_to_move.style.transition = 'unset';

				const rect = element_to_move.getBoundingClientRect();
				element_start_left = rect.left;
				element_start_top = rect.top;
				mouse_down_left = e.targetTouches[0]
					? e.targetTouches[0].pageX
					: e.changedTouches[e.changedTouches.length - 1].pageX;
				mouse_down_top = e.targetTouches[0]
					? event.targetTouches[0].pageY
					: e.changedTouches[e.changedTouches.length - 1].pageY;
				mouse_current_left = mouse_down_left;
				mouse_current_top = mouse_down_top;

				document.ontouchend = async function (e) {
					document.ontouchend = null;
					document.ontouchmove = null;
				};

				document.ontouchmove = function (e) {
					e = e || window.event;
					//e.preventDefault();

					mouse_current_left = e.targetTouches[0]
						? e.targetTouches[0].pageX
						: e.changedTouches[e.changedTouches.length - 1].pageX;
					mouse_current_top = e.targetTouches[0]
						? event.targetTouches[0].pageY
						: e.changedTouches[e.changedTouches.length - 1].pageY;
					const adjustmentX = mouse_current_left - mouse_down_left;
					const adjustmentY = mouse_current_top - mouse_down_top;

					let newPosX = element_start_left + adjustmentX;
					let newPosY = element_start_top + adjustmentY;

					newPosX = Math.max(min_x, Math.min(newPosX, max_x));
					newPosY = Math.max(min_y, Math.min(newPosY, max_y));

					// set the element's new position:
					element_to_move.style.left =
						newPosX + 'px';
					element_to_move.style.top =
						newPosY + 'px';
					element_to_move.style.bottom = 'unset';
					element_to_move.style.right = 'unset';
					element_to_move.style.marginTop = 'unset';
					element_to_move.style.marginLeft = 'unset';
				};
			};
		} catch (err) {
			console.error('error: ' + err);
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
