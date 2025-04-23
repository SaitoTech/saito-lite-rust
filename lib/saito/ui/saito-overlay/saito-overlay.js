const SaitoOverlayTemplate = require('./saito-overlay.template');

/**
 * Generic class for creating an overlay (i.e. a popup box for information or interaction)
 * A callback can be associated with closing the overlay
 * By default, a close button is included
 */
class SaitoOverlay {
	/**
	 * @constructor
	 * @param app - the Saito Application
	 * @param withCloseBox - a flag (default = true) to have a close button in the corner of the overlay
	 * @param removeOnClose - a flag (default = true) to delete the overlay when closing it
	 */
	constructor(
		app,
		mod,
		withCloseBox = true,
		removeOnClose = true,
		clickToClose = false
	) {
		this.app = app;
		this.mod = mod;
		this.ordinal = 0;
		this.closebox = withCloseBox;
		this.clickToClose = clickToClose;
		this.clickBackdropToClose = true;
		this.removeOnClose = removeOnClose;
		this.callback_on_close = null;
		this.class = 'saito-overlay';
		this.zIndex = 100;
		//flag to not add the backdrop
		this.nonBlocking = false;
	}

	pullOverlayToFront() {

		let max_z_index = 0;
		let max = 0;

		Array.from(document.querySelectorAll('.saito-overlay')).forEach(
			(ov) => {
				let temp = parseInt(ov.style.zIndex);
				if (temp > max) {
					max = temp;
				}
			}
		);

		max_z_index_bg = 100 + max + 2;
		max_z_index = 100 + max + 3;

		let qs = `saito-overlay${this.ordinal}`;
		let obj = document.getElementById(qs);
		if (obj) {
		  obj.style.zIndex = max_z_index;
		  obj.style.display = "block";
		}

		let qs2 = `saito-overlay-backdrop${this.ordinal}`;
		let obj2 = document.getElementById(qs2);
		if (obj2) {
		  obj2.style.zIndex = max_z_index_bg;
		  obj2.style.display = "block";
		}

		setTimeout(() => {

			let elsq = `#saito-overlay${this.ordinal}`;
			let bdelsq = `#saito-overlay-backdrop${this.ordinal}`;

			let overlay_el = document.querySelector(elsq);
			let overlay_backdrop_el = document.querySelector(bdelsq);

			if (overlay_backdrop_el) {
				overlay_backdrop_el.style.display = 'block';
			}
			if (overlay_el) {
				overlay_el.style.display = 'block';
		 	}
		}, 50);
	}

	/**
	 * Create the DOM elements if they don't exist. Called by show
	 * @param app - the Saito Application
	 * @param mod - the calling module
	 */
	render() {
		let app = this.app;
		let mod = this.mod;

		if (this.ordinal == 0) {
			let max = 0;
			Array.from(document.querySelectorAll('.saito-overlay')).forEach(
				(ov) => {
					let temp = parseInt(ov.id.replace('saito-overlay', ''));
					if (temp > max) {
						max = temp;
					}
				}
			);

			this.ordinal = max + 1;
		}

		//
		//
		//
		this.zIndex = 100 + 2 * this.ordinal + 1;

		let qs = `saito-overlay-backdrop${this.ordinal}`;
		if (!document.getElementById(qs)) {
		  this.app.browser.addElementToDom(SaitoOverlayTemplate(this));
		}

	}

	/**
	 * Does nothing
	 * @param app - the Saito Application
	 * @param mod - the calling module
	 */
	attachEvents() {}

	/**
	 * Renders the Overlay with the given html and attaches events to close it
	 * @param app - the Saito application
	 * @param mod - the calling module
	 * @param html - the content for the overlay
	 * @param mycallback - a function to run when the user closes the overlay
	 *
	 */
	show(html = '', mycallback = null) {

		let app = this.app;
		let mod = this.mod;

		this.render();

		let overlay_self = this;

		let overlay_el = document.getElementById(
			`saito-overlay${this.ordinal}`
		);
		let overlay_backdrop_el = document.getElementById(
			`saito-overlay-backdrop${this.ordinal}`
		);

		this.callback_on_close = mycallback;
		if (mycallback){
			console.log("SAITO OVERLAY -- add callback");
		}

		try {
			overlay_el.style.display = 'block';
			if (overlay_backdrop_el && !this.nonBlocking){
				overlay_backdrop_el.style.display = 'block';	
			}
			

			if (html) {
				if (this.closebox) {
					overlay_el.innerHTML =
						`<div id="saito-overlay-closebox${this.ordinal}" class="saito-overlay-closebox"><i class="fas fa-times-circle saito-overlay-closebox-btn"></i></div>` +
						html;
					//Close by clicking on closebox
					let closebox_qs = `#saito-overlay-closebox${this.ordinal}`;
					let closebox_el = document.querySelector(closebox_qs);
					closebox_el.onclick = this.close.bind(this);

					//Adjust position of closebox for full screen overlay
					setTimeout(() => {
						overlay_el = document.getElementById(
							`saito-overlay${this.ordinal}`
						);
						if (overlay_el){
							let box = overlay_el.getBoundingClientRect();
							if (
								box.width + 30 > window.innerWidth ||
								box.height + 30 > window.innerHeight || this.nonBlocking
							) {
								overlay_el.classList.add('maximized-overlay');
							}

							closebox_el.style.display = 'block';
						}
					}, 10);
				} else {
					overlay_el.innerHTML = html;
				}
			}

			if (overlay_backdrop_el){
				if (this.clickBackdropToClose) {
				  	overlay_backdrop_el.onclick = this.close.bind(this);
				} else {
				  	overlay_backdrop_el.onclick = () => {};
				}
			}

			if (this.clickToClose) {
				overlay_el.onclick = this.close.bind(this);
			} else {
				overlay_el.onclick = () => {};
			}

		} catch (err) {
			console.error('OVERLAY ERROR:', err);
		}
	}

	/**
	 * Hide all the overlay elements from view
	 *
	 */
	close(){
		
		this.hide();
		
		if (this.callback_on_close != null) {
			this.callback_on_close();
		}
		
		if (this.removeOnClose) {
			this.remove();
		}
	}


	hide() {
		let elsq = `#saito-overlay${this.ordinal}`;
		let bdelsq = `#saito-overlay-backdrop${this.ordinal}`;

		let overlay_el = document.querySelector(elsq);
		let overlay_backdrop_el = document.querySelector(bdelsq);
		if (overlay_backdrop_el) {
			overlay_backdrop_el.style.display = 'none';
		}
		if (overlay_el) {
			overlay_el.style.display = 'none';
		}
	}

	remove() {
		try {
			let overlay_el = document.querySelector(
				`#saito-overlay${this.ordinal}`
			);
			if (overlay_el != null) {
				overlay_el.remove();
			}

			let overlay_backdrop_el = document.querySelector(
				`#saito-overlay-backdrop${this.ordinal}`
			);
			if (overlay_backdrop_el != null) {
				overlay_backdrop_el.remove();
			}

			this.ordinal = 0;

			this.callback_on_close = null;
		} catch (err) {
			console.error(err);
		}
	}

	//
	// The following functions are ported over from the old GameOverlay to retain
	// backwards compatibility of code written for that component. We should eventually
	// purge these from the main UI component or push them down to sub-components in
	// the games which inherit from the main overlay class and add this functionality.
	//
	/**
	 * Backwards compatible show function
	 * @param app - the Saito application
	 * @param mod - the calling module
	 * @param html - the content for the overlay
	 * @param mycallback - a function to run when the user closes the overlay
	 *
	 */
	showOverlay(html, mycallback = null) {
		this.show(html, mycallback);
	}

	/**
	 * Backwards compatible hide functino
	 * @param mycallback - a function to run on completion
	 */
	hideOverlay(mycallback = null) {
		this.hide();
	}

	/**
	 * Turn off event listerner for clicking outside overlay to close it
	 */
	blockClose() {
		if (!this.closebox) {
			console.warn('Display uncloseable overlay');
		}
		let qs = `#saito-overlay-backdrop${this.ordinal}`;
		let overlay_backdrop_el = document.querySelector(qs);
		if (overlay_backdrop_el) {
			overlay_backdrop_el.onclick = (e) => {
				let closebox_qs = `#saito-overlay-closebox${this.ordinal}`;
				let closebox_el = document.querySelector(closebox_qs);
				if (closebox_el) {
					closebox_el.style.transform = 'rotate(180deg)';
					setTimeout(() => {
						closebox_el.style.transform = '';
					}, 500);
				}
			};
		}
	}

	move(x, y){
		let overlay_el = document.querySelector(`#saito-overlay${this.ordinal}`);
		if (overlay_el) {
			overlay_el.classList.remove("center-overlay");
			overlay_el.style.top = `${x}px`;
			overlay_el.style.left = `${y}px`;
		}
	}

	/**
	 * Delete inner html of overlay (regardless of whether it is shown or hidden)
	 */
	clear() {
		try {
			let qs = `#saito-overlay${this.ordinal}`;
			let overlay_el = document.querySelector(qs);
			if (overlay_el) {
				if (this.closebox) {
					overlay_el.innerHTML = `<div id="saito-overlay-closebox${this.ordinal}" class="saito-overlay-closebox"><i class="fas fa-times-circle saito-overlay-closebox-btn"></i></div>`;
				} else {
					overlay_el.innerHTML = '';
				}
			}
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * TODO -- improve this module
	 *
	 * A specific function for Twilight that allows for more advanced display formatting through parameters
	 * options. Also Imperium:
	 *
	 *      columns
	 *      backgroundImage
	 *      title
	 *      subtitle
	 *      padding
	 *      textAlign
	 *
	 *      cardListWidth
	 *      cardListHeight
	 *      unselectableCards
	 *      onContinue
	 *      onClose
	 *
	 *    -- DEPRECATED -- rowGap, columnGap
	 */
	showCardSelectionOverlay(app, game_mod, cards, options = {}) {
		//Get Styling Options
		let wrapper_style = options.padding
			? `padding:${options.padding};`
			: '';
		wrapper_style += options.backgroundImage
			? `background-image: url(${options.backgroundImage}); background-size: cover;`
			: 'background-color: #111D;';
		wrapper_style += options.textAlign
			? `text-align:${options.textAlign};`
			: '';

		//Start building HTML
		let html = `<div style="${wrapper_style}">`;

		if (options.title) {
			html += `<div class="game-overlay-cardlist-title">${options.title}</div>`;
		}
		if (options.subtitle) {
			html += `<div class="game-overlay-cardlist-subtitle">${options.subtitle}</div>`;
		}

		let unselectable_cards = options.unselectableCards
			? options.unselectableCards
			: [];

		html += '<div class="hide-scrollbar game-overlay-cardlist-container">';
		for (let i in cards) {
			let thishtml = '<div class="game-overlay-cardlist-card">';
			if (cards[i] != undefined) {
				let x = 0;
				if (
					typeof cards[i] === 'object' &&
					!Array.isArray(cards[i]) &&
					cards[i] != null
				) {
					if (
						cards[i].returnCardImage != 'undefined' &&
						cards[i].returnCardImage != null
					) {
						thishtml += cards[i].returnCardImage();
						x = 1;
					}
				}
				if (x == 0) {
					if (Array.isArray(cards)) {
						thishtml += game_mod.returnCardImage(cards[i]);
					} else {
						thishtml += game_mod.returnCardImage(i);
					}
				}
			} else {
				thishtml += game_mod.returnCardImage(i);
			}
			thishtml += '</div>';

			//
			// is this unselectable?
			//
			for (let p = 0; p < unselectable_cards.length; p++) {
				if (
					JSON.stringify(unselectable_cards[p]) ===
					JSON.stringify(cards[i])
				) {
					thishtml = thishtml.replace(
						/game-overlay-cardlist-card/g,
						'game-overlay-cardlist-card game-overlay-cardlist-unselectable'
					);
				}
			}

			html += thishtml;
		}
		html += '</div>'; //close .game-overlay-cardlist-container

		//Check options for buttons
		let has_continue_button = 1;
		let has_close_button = 1;
		if (!options.onClose) {
			options.onClose = function () {};
			has_close_button = 0;
		}
		if (!options.onContinue) {
			options.onContinue = function () {};
			has_continue_button = 0;
		}

		if (has_continue_button || has_close_button) {
			html += '<div class="game-overlay-button-container">';
			if (has_continue_button) {
				html += `<div class="game-overlay-button-continue button game-overlay-cardlist-button">continue</div>`;
			}
			if (has_close_button) {
				html += `<div class="game-overlay-button-close button super game-overlay-cardlist-button">close</div>`;
			}
			html += '</div>';
		}

		html += '</div>'; //close wrapper div

		//Show Overlay
		this.show(html, options.onClose);

		// set min height of cardlist card elements
		//
		document
			.querySelectorAll('.game-overlay-cardlist-card')
			.forEach((el) => {
				if (el.children) {
					el.style.height = this.calculateElementHeight(
						el.children[0]
					);
				}
			});

		//
		// set width/height
		//
		let cardlist_container_height = options.cardlistHeight || '80vh';
		let cardlist_container_width = options.cardlistWidth || '80vw';

		document.querySelector('.game-overlay-cardlist-container').style.width =
			cardlist_container_width;
		document.querySelector(
			'.game-overlay-cardlist-container'
		).style.height = 'auto';
		document.querySelector(
			'.game-overlay-cardlist-container'
		).style.maxWidth = cardlist_container_width;
		document.querySelector(
			'.game-overlay-cardlist-container'
		).style.maxHeight = cardlist_container_height;

		//
		// right-align left card if only 2
		//
		if (cards.length == 2) {
			let el = document.querySelector('.game-overlay-cardlist-container');
			if (el) {
				el.style.justifyItems = 'unset';
				let el2 = el.children[0];
				if (el2) {
					let el3 = el2.children[0];
					if (el3) {
						el3.style.float = 'right';
					}
				}
			}
		} else {
			let el = document.querySelector('.game-overlay-cardlist-container');
			if (el) {
				el.style.justifyItems = 'center';
			}
		}

		//
		// center single card
		//
		if (cards.length == 1) {
			let el = document.querySelector('.game-overlay-cardlist-card');
			el.style.marginRight = 'auto';
			el.style.marginLeft = 'auto';
		}

		// Apply Functionality to the buttons
		//
		if (has_continue_button) {
			document.querySelector('.game-overlay-button-continue').onclick = (
				e
			) => {
				options.onContinue();
			};
		}
		if (has_close_button) {
			document.querySelector('.game-overlay-button-close').onclick = (
				e
			) => {
				options.onClose();
			};
		}

		//
		// if cards are selectable
		//
		if (options.onCardSelect) {
			document
				.querySelectorAll('.game-overlay-cardlist-card')
				.forEach((el) => {
					el.onclick = (e) => {
						let cardname = el.getAttribute('id');
						if (cardname == null) {
							if (el.children) {
								cardname = el.children[0].getAttribute('id');
							}
						}
						options.onCardSelect(cardname);
					};
				});

			document
				.querySelectorAll('.game-overlay-cardlist-unselectable')
				.forEach((el) => {
					el.onclick = (e) => {};
				});
		}

		// update number shown
		if (options.columns > 0) {
			let x = '1fr ';
			for (let y = 1; y < options.columns; y++) {
				x += '1fr ';
			}
			document.querySelector(
				'.game-overlay-cardlist-container'
			).style.gridTemplateColumns = x;
		} else {
			document.querySelector(
				'.game-overlay-cardlist-container'
			).style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
		}
	}

	/**
	 * copy of gamehud function needed for showCardSelectionOverlay
	 *
	 */
	calculateElementHeight(elm) {
		if (document.all) {
			// IE
			elmHeight = elm.currentStyle.height;
			elmMargin =
				parseInt(elm.currentStyle.marginTop, 10) +
				parseInt(elm.currentStyle.marginBottom, 10);
		} else {
			// Mozilla
			elmHeight = document.defaultView
				.getComputedStyle(elm, '')
				.getPropertyValue('height');
			elmMargin =
				parseInt(
					document.defaultView
						.getComputedStyle(elm, '')
						.getPropertyValue('margin-top')
				) +
				parseInt(
					document.defaultView
						.getComputedStyle(elm, '')
						.getPropertyValue('margin-bottom')
				);
		}
		return parseInt(elmHeight) + parseInt(elmMargin) + 'px';
	}

	setBackground(img_path = '', dark = true) {
		let qs = `#saito-overlay-backdrop${this.ordinal}`;
		let overlay_backdrop_el = document.querySelector(qs);
		if (overlay_backdrop_el) {
			if (dark == true) {
				overlay_backdrop_el.style.background =
					'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("' +
					img_path +
					'")';
				overlay_backdrop_el.style.backgroundSize = 'cover';
				overlay_backdrop_el.style.opacity = 1;
			} else {
				overlay_backdrop_el.style.backgroundImage =
					'url("' + img_path + '")';
				overlay_backdrop_el.style.backgroundSize = 'cover';
				overlay_backdrop_el.style.opacity = 1;
			}
		}
	}

	setBackgroundColor(color = '#000') {
		let qs = `#saito-overlay-backdrop${this.ordinal}`;
		let overlay_backdrop_el = document.querySelector(qs);
		if (overlay_backdrop_el) {
			overlay_backdrop_el.style.backgroundColor = color;
			if (color.length < 4) {
				overlay_backdrop_el.style.opacity = 1;
			}
		}
	}
}

module.exports = SaitoOverlay;
