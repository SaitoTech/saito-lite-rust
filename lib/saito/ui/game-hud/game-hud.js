const GameHudTemplate = require('./game-hud.template');

const { DESKTOP, MOBILE_PORTRAIT, MOBILE_LANDSCAPE } = require('./game-hud-types');

/**
 * The HUD is a general interface for users to interact with a (board) game
 * HUD is optimized for dynamically displaying user controls, and will (unless overridden) attempt to resize
 * in order to optimally fit the height and width of the menu options, by assuming developers follow certain
 * conventions about labeling cards, icons, or text menu lists for users to click on.
 * Other than rendering and attaching events in your Game_Module, you will primarily interact with GameHud
 * indirectly. GameTemplate includes two functions for nicely putting content into the GameHud--
 *
 * updateStatusAndListCards -- display a status message (prompt) and graphical depiction of cards
 * updateStatusWithOptions -- display a status message (prompt) and a list of text commands
 *
 * HUD vs PlayerBox. HUD is best when information about game state is available on the game board and we don't need persistent summaries of opponent statistics.
 * HUD is flexible for inserting different kinds of clickable options to interact with the game, and can be easily hidden to allow viewing of a possibly large/complex game board
 *
 *
 * GameHud is available in different modes -- vertical (along the left side of the screen)
 * or horizontal (along the bottom of the screen)
 *
 */
class GameHud {
	/**
	 * @constructor
	 * @param app - the Saito application
	 * @param mod - the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;
		this.maxWidth = 0.5; //this.mode associated variable, ratio of view width for maximum display
		this.card_width = 150; //Maximum card width of 150px
		this.minWidth = 500; //num of pixels for minimum display width (dependent on this.mode) overwrite AFTER rendering
		this.auto_sizing = 1; //flag to automatically resize HUD based on its internal functions
		this.is_draggable = 1;
		this.enable_mode_change = 0; //flag to allow users to toggle between hud-long, hud-square and hud-vertical
		this.draggable_whole = true;
		this.hud_popup_timeout = null;
		this.back_button = false;
		this.back_button_callback = null;
		this.back_button_clicked = false;
		this.zIndex = 1;
		this.mode = 0; // 0 wide (HUD-long)
		// 1 classic (HUD-square)
		// 2 vertical
		this.lastPosition = ''; //Remember where the hud was if toggling to hide offscreen
		this.respectDocking = false;

		//
		// variables used to keep status centered in hud
		// as the hud resizes when cards change. we calculate
		// new widths and use older data to inch HUD along so
		// the status stays centered in place as the HUD is
		// redrawn.
		//

		this.user_dragged = 0;
		this.cached_status_header_height_inclusive = 50; //default to 50px (40px height + 10px margin)

		this.cards_currently_displayed = -1;
		this.status_left = -1;
		this.status_width = -1;
		this.hud_left = -1;
		this.hud_width = -1;

		this.lock_interface = false;
		this.timers = [];
		this.display_queue = [];

		this.debugging = false;
	}

	render() {
		//Needed for game engine to know to call HUD's internal updateStatus instead of basic updateStatus
		this.game_mod.useHUD = 1;

		if (!this.game_mod.browser_active == 1) {
			return;
		}

		if (!document.querySelector('#hud')) {
			this.app.browser.addElementToDom(GameHudTemplate(this.enable_mode_change));
		}

		let hud = document.querySelector('#hud');

		if (this.mode >= 0 && this.mode <= 2) {
			hud.className = 'hud'; //Remove additional class names
			hud.removeAttribute('style'); //Remove all inline styling
		}

		let deviceType = this.checkSizeAndOrientation();

		switch (this.mode) {
			case 0:
				hud.classList.add('hud-long');
				hud.classList.add('hide-scrollbar');
				this.maxWidth = deviceType == MOBILE_PORTRAIT ? 1 : 0.8;
				this.minWidth = 500;
				hud.style.top = '';
				break;
			case 1:
				hud.classList.add('hud-square');
				hud.classList.add('hide-scrollbar');
				this.maxWidth = 0.4;
				this.minWidth = 400;
				break;
			case 2:
				hud.classList.add('hud-vertical');
				this.maxWidth = 0.2;
				this.minWidth = 240;
				break;
			default:
				console.error('Undefined HUD Mode');
				this.auto_sizing = false;
		}

		if (this.auto_sizing) {
			let dockStatus = this.respectDocking;
			this.respectDocking = true;
			this.respectDocking = dockStatus;
		}
		hud.style.display = 'block';
		hud.style.zIndex = this.zIndex;
		this.attachEvents();
	}

	/**
	 * HUD events:
	 *    1) HUD can be dragged by the user to a new position
	 *    2) HUD can be minimized/restored by clicking on an icon in its top right corner
	 *    3) HUD mode can be toggled between available display modes (optional, requires changing the this.enable_mode_change property)
	 * @param app - the Saito application
	 * @param game_mod - the containing game module
	 */
	attachEvents() {
		let myself = this;
		try {
			if (this.is_draggable) {
				// hud is draggable
				let drag_handle = this.draggable_whole ? 'hud' : 'hud-header';
				this.app.browser.makeDraggable('hud', drag_handle, true, () => {
					this.user_dragged = 1;

					try {
						let hud = document.querySelector('.hud');
						let status = document.querySelector('.status-header');

						this.status_left = hud.style.left;
						this.status_top = hud.style.top;
						this.status_width = hud.style.width;

						this.hud_left = hud.style.left;
						this.hud_top = hud.style.top;
						this.hud_width = hud.offsetWidth;
					} catch (err) {}

					document.querySelector('.hud').classList.add('user_dragged');
				});
			}
		} catch (err) {
			console.log('HUD Events:', err);
		}
		// hud is minimizable
		try {
			let hud_toggle_button = document.getElementById('hud-toggle-button');
			if (hud_toggle_button) {
				hud_toggle_button.onclick = (e) => {
					e.stopPropagation();
					myself.toggleHud();
				};
			}
		} catch (err) {
			console.error('HUD Events:', err);
		}

		//cycle through hud modes
		try {
			let hud_mode_button = document.getElementById('hud-mode-button');
			if (hud_mode_button) {
				hud_mode_button.onclick = (e) => {
					e.stopPropagation();
					myself.mode++;
					if (myself.mode > 2) {
						myself.mode = 0;
					}
					//myself.cards_currently_displayed = -5; // force recalculation of sizing
					myself.render();
				};
			}
		} catch (err) {
			console.error('HUD Events:', err);
		}


		if (document.querySelector('.hud-notice')){
			document.querySelector('.hud-notice').onclick = (e) => {
				this.hidePopup();
			};
		}
			
	}

	/**
	 * (completely) hide Hud from the DOM
	 */
	hide() {
		try {
			document.getElementById('hud').style.display = 'none';
		} catch (err) {}
	}

	updateStatus(msg) {
		if (this.back_button == true && this.back_button_callback != null) {
			this.back_button_clicked = false;
			msg = `<div class="back-button">${this.game_mod.back_button_html}</div>${msg}`;
		} else {
			msg = `<div class="back-button" style="display:none;">${this.game_mod.back_button_html}</div>${msg}`;
		}

		if (document.querySelector('.hud-body .status')) {
			document.querySelector('.hud-body .status').innerHTML = msg;
		}
		if (document.querySelector('.hud-body .status .back-button')) {
			document.querySelector('.hud-body .status .back-button').onclick = (e) => {
				this.back_button_clicked = true;
				this.back_button_callback();
			};
		}
	}

	updateControls(msg) {
		if (document.querySelector('#hud .controls')) {
			document.querySelector('#hud .controls').innerHTML = msg;
		}
	}

	//
	// regardless of whether we display CARDS (graphics) or OPTIONS (text)
	// we want to trigger the ability for users to click on the card and
	// have the ID submitted to the function provided. This takes care of
	// that issue, using the cardbox as needed.
	//
	attachControlCallback(mycallback = null) {
		if (this.game_mod.useCardbox) {
			this.game_mod.changeable_callback = mycallback;
			this.game_mod.cardbox.hide(1);
			this.game_mod.cardbox.attachCardEvents();
		}
		document.querySelectorAll('.controls ul li.option').forEach((opt) => {
			opt.onclick = (e) => {
				document.querySelectorAll('.controls ul li.option').forEach((opt) => {
					opt.onclick = (evt) => {};
					try {
						opt.remove();
					} catch (err) {}
				});
				let id = e.target.getAttribute('id');
				mycallback(id);
			};
		});
	}

	setInterfaceLock(callback = null) {
		this.lock_interface = true;

		this.game_mod.gaming_active = 1;
		this.timers.push(
			setTimeout(() => {
				this.timers.shift();
				if (this.timers.length == 0) {
					this.game_mod.gaming_active = 0;
					this.lock_interface = false;
					if (this.display_queue.length > 0) {
						this.updateStatus(this.display_queue.pop());
					}
					if (callback) {
						callback();
					}
				}
			}, 1000)
		);
	}

	async insertCard(card_html, callback = null) {
		let hudCards = document.querySelector('.status-cardbox');
		if (!hudCards) {
			console.warn('HUD: insert card failure');
			return;
		}

		this.app.browser.addElementToId(card_html, 'status-cardbox');

		let elm = hudCards.lastElementChild;

		if (callback) {
			const timeout = (ms) => new Promise((res) => setTimeout(res, ms));

			this.setInterfaceLock(callback);
			elm.style.opacity = 1;
			await timeout(150);
			elm.classList.add('flipped');
			await timeout(350);
		}
	}

	/**
	 * Implement the toggle (slide on/offscreen) to minimize and restore HUD from display
	 */
	toggleHud() {
		let hud = document.getElementById('hud');
		let hudToggle = document.getElementById('hud-toggle-button');
		if (!hud || !hudToggle) {
			console.error("Couldn't find HUD elements");
			return;
		}

		hudToggle.classList.toggle('fa-caret-up');
		hudToggle.classList.toggle('fa-caret-down');

		if (hudToggle.classList.contains('fa-caret-up')) {
			//I am minimized
			this.lastPosition = getComputedStyle(hud).top;
			hud.style.top = `${window.innerHeight - 20}px`;
			hud.style.marginTop = 'unset'; //For HUD - vertical, the margin to push it under the menu
			/*hud.style.background = "#222d";*/
		} else {
			//I am restored
			hud.style.top = this.lastPosition;
			hud.style.paddingTop = '';
			hud.style.background = '';
		}
	}

	hidePopup() {
		let hudnotice = document.querySelector('.hud-notice');
		if (hudnotice) {
			hudnotice.classList.remove('show');
			//hudnotice.innerHTML = '';	
			setTimeout(()=> {
				hudnotice.style.display = "none";
			}, 550);
		}
		clearTimeout(this.hud_popup_timeout);
	}

	showPopup(html = '', timeout = 0) {
		let hudnotice = document.querySelector('.hud-notice');

		if (hudnotice) {
			hudnotice.innerHTML = html;
			hudnotice.style.display = "block";

			setTimeout(() => {
				hudnotice.classList.add('show');

				this.hud_popup_timeout = setTimeout(() => {
					this.hidePopup();
				}, timeout);
			}, 50);
		}
	}

	/**
	 * Internal function to determines view window (Desktop, mobile landscape or mobile portrait)
	 *
	 */
	checkSizeAndOrientation() {
		if (window.matchMedia('(orientation: landscape)').matches && window.innerHeight <= 600) {
			return MOBILE_LANDSCAPE;
		}
		if (window.matchMedia('(orientation: portrait)').matches && window.innerWidth <= 600) {
			return MOBILE_PORTRAIT;
		}
		return DESKTOP;
	}
}

module.exports = GameHud;
