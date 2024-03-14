const GameCardboxTemplate = require('./game-cardbox.template');

/**
 * CardBox is mainly a tool to display a full size image of a game card (with detailed text instructions).
 * It works together with HUD and gameTemplate to allow players to click on cards in order to play them.
 * Cardbox actions are added to a register through addCardType, where a css class (that appears in HUD or Log or wherever)
 * is associated with a (name) and (callback function). Hovering over the css-class element will trigger the cardbox to display
 * and clicking on it will trigger the action in the callback.
 * Many games use .card (or .showcard) as target css classes. Remember to call attachCardEvents after refreshing the DOM.
 * For convenience, gameTemplate includes a wrapper functino attachCardboxEvents to update the clickable event and re-attach events.
 *
 * skip_card_prompt is a flag that allows cardbox to directly enact the action upon clicking on the target element.
 * Set the flag to 0 to bring up a confirmation window before instantiating the action.
 * For convenience, gameTemplate includes a pair of functions cardbox_callback and changeable_callback.
 * You can associate cardbox_callback with a css class through addCardType once upon initialization of the game, and if you want different actions to occur
 * simply call game_mod.attachCardboxEvents(new_callback) to change the reference of cardbox_callback. gameTemplate automatically does this with
 * some wrapper functions for updating the DOM, such as updateStatusAndListCards
 *
 */
class GameCardbox {
	/**
	 * @constructor
	 * @param app - the Saito application
	 * @param mod - the game module
	 */
	constructor(app, mod) {
		this.app = app;
		this.game_mod = mod;

		this.cardbox_lock = 0; // 1 = mouseout does not remove popup
		this.show_exit_button = true;
		this.skip_card_prompt = 1; // 1 = don't prompt for action, just execute
		this.card_types = []; // associative array of css / text / callback
		this.current = null;
	}

	/**
	 * Adds cardbox to the DOM if it doesn't already exist (div elements start in display=none state)
	 */
	render() {
		if (!this.game_mod.browser_active) {
			return;
		}

		this.game_mod.useCardbox = 1;
		if (!document.getElementById('game-cardbox')) {
			this.app.browser.addElementToDom(GameCardboxTemplate());
			document.getElementById('game-cardbox').style.zIndex = -10; //push behind
		}
	}

	/**
	 * Doesnt' do anything
	 * Normally we would put the events here, but it is more clear to use a different function
	 * because we often add/subtract card types or change the callback associated with the card
	 */
	attachEvents() {
		console.log(
			'For the Saito Cardbox, don\'t use attachEvents, use attachCardEvents'
		);
	}

	/**
	 * Cycles through property card_types (stored by method this.addCardType)
	 * to associate mouse hover and click behavior on different css classes in the DOM
	 */
	attachCardboxEvents() {
		this.attachCardEvents();
	}
	attachCardEvents() {
		try {
			this.render();

			for (let i = 0; i < this.card_types.length; i++) {
				let card_css = this.card_types[i].css;
				let card_action = this.card_types[i].action;
				let card_callback = this.card_types[i].mycallback;

				Array.from(document.getElementsByClassName(card_css)).forEach(
					(card) => {
						card.onmouseover = (e) => {
							try {
								if (this.cardbox_lock !== 1) {
									document.querySelector(
										'.game-cardbox'
									).style.pointerEvents = 'none';
									this.show(e.currentTarget.id);
								}
							} catch (err) {
								console.error(err);
							}
						};
						card.onmouseout = (e) => {
							try {
								this.hide(); //cardbox_lock condition tested in hide
							} catch (err) {
								console.error(err);
							}
						};

						let xpos, ypos;

						if (card.classList.contains('noclick')) {
							return;
						}

						card.onmousedown = (e) => {
							xpos = e.clientX;
							ypos = e.clientY;
						};

						card.onmouseup = (e) => {
							if (Math.abs(xpos - e.clientX) > 4) {
								return;
							}
							if (Math.abs(ypos - e.clientY) > 4) {
								return;
							}
							if (this.cardbox_lock === 1 && this.current == e.currentTarget.id) {
								this.hide(1); //cardbox_lock condition tested in hide
							} else {
								this.cardbox_lock = 1; //toggle lock
								this.current = e.currentTarget.id;
								try {
									// lock so mouse can hover on cardbox
									document.querySelector(
										'.game-cardbox'
									).style.pointerEvents = 'unset';
								} catch (err) {}
								this.show(
									e.currentTarget.id,
									card_action,
									card_callback
								);
							}
						};
					}
				);
			}

			//
			// force-close card popup
			//
			if (document.getElementById('cardbox-exit')) {
				let cardbox_exit_btn = document.getElementById('cardbox-exit');
				cardbox_exit_btn.onclick = (e) => {
					this.hide(1);
				};
			}
		} catch (err) {
			console.error(err);
		}
	}

	detachCardEvents() {
		try {
			for (let i = 0; i < this.card_types.length; i++) {
				let card_css = this.card_types[i].css;

				Array.from(document.getElementsByClassName(card_css)).forEach(
					(card) => {
						card.onmouseover = null;
						card.onmouseout = null;
						card.onmousedown = null;
						card.onmouseup = null;
					}
				);
			}
		} catch (err) {
			console.err(err);
		}
	}

	/**
	 * Displays the card's html in the DOM
	 * @param card - the DOM element that triggered the cardbox
	 * @param html - an html representation of the card image
	 * @param action {text} - if provided, gives users a button to click on to execute action of the card
	 * @param mycallback - if provided, is the function that executes the action of the card, passes "card" (DOM element) as a parameter
	 */
	async showCardboxHTML(card, html, action = '', mycallback = null) {
		// "Play" the card automatically (run callback) if there is no html to display
		if (
			!html ||
			html.indexOf('noncard') > -1 ||
			html.indexOf('nocard') > -1
		) {
			if (mycallback != null) {
				await mycallback(card);
				this.hide(1);
			}
			return;
		}

		if ((this.skip_card_prompt == 1 || !action) && mycallback !== null) {
			await mycallback(card);
			this.hide(1);
			return;
		}

		//Make everything else visible and overlay it on top of anything else happening on the screen
		document.getElementById('game-cardbox').style.zIndex = 250;
		document.getElementById('game-cardbox').style.display = 'block';
		document.getElementById('cardbox-card').style.display = 'block';
		document.getElementById('cardbox-card').innerHTML = html;

		//
		// if the cardbox is smaller than the card, we try to fix
		// so that the buttons and the exit button will be more
		// reasonably positioned on screen
		//
		try {
			let cbc = document.getElementById('cardbox-card');
			if (parseInt(cbc.style.width) > 0) {
				document.getElementById('game-cardbox').style.width =
					cbc.style.width;
			}
		} catch (err) {
			console.log('Error resizing cardbox');
		}

		//Create a single option menu for users to click to confirm playing "action"
		if (action) {
			this.cardbox_lock = 1;
			document.getElementById('cardbox-menu').style.display = 'block';
			document.getElementById('cardbox-menu').innerHTML = action;
			document.getElementById('cardbox-menu').onclick = async (e) => {
				if (mycallback != null) {
					await mycallback(card);
				}
				this.hide(1);
			};
		}

		//If we locked the display (on), include the exit button to close
		if (this.cardbox_lock == 1 && this.show_exit_button) {
			document.getElementById('cardbox-exit').style.display = 'block';
			document.getElementById('cardbox-exit-background').style.display =
				'block';
		}
	}

	/**
	 * Will query the game module for an image of the given card
	 * and render it in the DOM. Will store the card in cardbox array of cards
	 * @param card {DOM element}  id of the DOM element triggering the cardbox
	 * @param action {text}
	 * @param mycallback - an optional callback function
	 */
	show(card, action = '', mycallback = null) {
		if (!card) {
			return;
		}

		let html = this.game_mod.returnCardImage(card);

		this.showCardboxHTML(card, html, action, mycallback);
	}

	/**
	 * Hides the cardbox if it is not locked or if a force signal is sent
	 * @param force {int 0,1} - will force the cardbox to close/hide even if it is in lock condition
	 */
	hide(force = 0) {
		try {
			if (this.cardbox_lock === 1 && force === 0) {
				return;
			}

			let selectors = ["game-cardbox", "cardbox-card", "cardbox-menu", "cardbox-exit", "cardbox-exit-background"];
			for (let id of selectors){
				if (document.getElementById(id)){
					document.getElementById(id).style.display = "none";
				}
			}
			if (document.getElementById('game-cardbox')){
				document.getElementById('game-cardbox').style.zIndex = -10;
			}
			
			this.cardbox_lock = 0;
			this.current = null;
			
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * Clear all Cardbox events and reset the card_types array
	 */
	disable() {
		for (let i = 0; i < this.card_types.length; i++) {
			let card_css = this.card_types[i].css;
			Array.from(document.getElementsByClassName(card_css)).forEach(
				(card) => {
					card.onmouseover = null;
					card.onmouseout = null;
					card.onmousedown = null;
					card.onmouseup = null;
				}
			);
		}
		this.card_types = [];
	}

	/**
	 * A "card" is a triplicate of a css class name, a textual description of an action associated with the card, and a callback functon to be called if the card is selected
	 * This function adds a triplicate to the class method so that subsequent calls to attachCardEvents
	 */
	addCardType(css_name, action_text, mycallback, hover = true) {
		for (let i = 0; i < this.card_types.length; i++) {
			if (this.card_types[i].css === css_name) {
				return;
			}
		}

		this.card_types.push({
			css: css_name,
			action: action_text,
			mycallback: mycallback,
			hover: hover
		});
	}

	removeCardType(css_name) {
		this.detachCardEvents();
		for (let i = this.card_types.length - 1; i >= 0; i--) {
			if (this.card_types[i].css == css_name) {
				this.card_types.splice(i, 1);
			}
		}
		this.attachCardEvents();
	}

	makeDraggable() {
		this.app.browser.makeDraggable('game-cardbox', 'game-cardbox', true);
	}
}

module.exports = GameCardbox;
