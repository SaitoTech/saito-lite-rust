const GamePlayerboxTemplate = require('./playerbox.template');
const SaitoUser = require('./../saito-user/saito-user');

/**
 * Basic template:
 *
 *   Head -- displays SaitoUser component
 *   Body -- information space for games
 *
 */
class GamePlayerBox {
	/**
	 *  @constructor
	 *  @param app - Saito app
	 */
	constructor(app, mod, container = '', publicKey = '', player_number = 0) {
		this.app = app;
		this.mod = mod;
		this.container = container;
		this.player_number = player_number;
		this.saito_user = new SaitoUser(
			this.app,
			this.mod,
			`.game-playerbox-head-${this.player_number}`,
			publicKey,
			`Player ${this.player_number}`,
			'<div class="game-playerbox-icons"></div>'
		);
	}

	render() {
		//
		// add or replace playerbox component
		//
		if (document.querySelector(`.game-playerbox-${this.player_number}`)) {
			this.app.browser.replaceElementBySelector(
				GamePlayerboxTemplate(this),
				`.game-playerbox-${this.player_number}`
			);
		} else {
			this.app.browser.addElementToSelectorOrDom(GamePlayerboxTemplate(this), `${this.container}`);
		}

		//
		// render user into playerbox head
		//
		this.saito_user.render();

		//
		// attach events
		//
		this.attachEvents();
	}

	remove() {
		if (document.querySelector(`.game-playerbox-${this.player_number}`)) {
			document.querySelector(`.game-playerbox-${this.player_number}`).remove();
		}
	}

	attachEvents() {
		//
		// make draggable
		/*
    this.app.browser.makeDraggable(`game-playerbox-${this.player_number}`, `game-playerbox-head-${this.player_number}`);
    document.querySelector(`#game-playerbox-head-${this.player_number}`).style.cursor = "grab";
    */
		// DO NOT MAKE DRAGGABLE FOR NOW BECAUSE IT SHIFTS THE WHOLE SCREEN
	}

	onclick(fn = null) {
		if (document.querySelector(`.game-playerbox-${this.player_number}`)) {
			document
				.querySelector(`.game-playerbox-head-${this.player_number} .saito-user`)
				.setAttribute('data-disable', true);
			document
				.querySelector(`.game-playerbox-head-${this.player_number} .saito-user .saito-userline`)
				.setAttribute('data-disable', true);
			document
				.querySelector(`.game-playerbox-head-${this.player_number} .saito-user .saito-address`)
				.setAttribute('data-disable', true);
			document
				.querySelector(`.game-playerbox-head-${this.player_number} .saito-user .saito-identicon`)
				.setAttribute('data-disable', true);
			document.querySelector(`.game-playerbox-${this.player_number}`).onclick = (e) => {
				fn();
			};
		}
	}

	addClass(classname, target) {
		if (document.querySelector(`.${target}-${this.player_number}`)) {
			document.querySelector(`.${target}-${this.player_number}`).classList.add(classname);
		}
	}

	updateAddress(address) {
		if (
			document.querySelector(
				`.game-playerbox-head-${this.player_number} .saito-user .saito-address`
			)
		) {
			document.querySelector(
				`.game-playerbox-head-${this.player_number} .saito-user .saito-address`
			).innerHTML = address;
		}
	}

	updateUserline(userline) {
		if (
			document.querySelector(
				`.game-playerbox-head-${this.player_number} .saito-user .saito-userline`
			)
		) {
			document.querySelector(
				`.game-playerbox-head-${this.player_number} .saito-user .saito-userline`
			).innerHTML = userline;
		}
	}

	updateIcons(content) {
		if (
			document.querySelector(
				`.game-playerbox-head-${this.player_number} .saito-user .game-playerbox-icons`
			)
		) {
			document.querySelector(
				`.game-playerbox-head-${this.player_number} .saito-user .game-playerbox-icons`
			).innerHTML = content;
		}
	}

	updateBody(content) {
		if (document.querySelector(`.game-playerbox-body-${this.player_number}`)) {
			document.querySelector(`.game-playerbox-body-${this.player_number}`).innerHTML = content;
		}
	}

	updateGraphics(content) {
		if (document.querySelector(`.game-playerbox-graphics-${this.player_number}`)) {
			document.querySelector(`.game-playerbox-graphics-${this.player_number}`).innerHTML = content;
		}
	}

	replaceGraphics(content, selector) {
		let pb_selector = `.game-playerbox-graphics-${this.player_number}`;
		if (document.querySelector(pb_selector)) {
			if (document.querySelector(`${pb_selector} ${selector}`)) {
				this.app.browser.replaceElementBySelector(content, `${pb_selector} ${selector}`);
			} else {
				this.app.browser.addElementToSelector(content, pb_selector);
			}
		}
		return `${pb_selector} ${selector}`;
	}

	hide() {
		if (document.querySelector(`.game-playerbox-${this.player_number}`)) {
			document.querySelector(`.game-playerbox-${this.player_number}`).style.display = 'none';
		}
	}

	show() {
		if (document.querySelector(`.game-playerbox-${this.player_number}`)) {
			document.querySelector(`.game-playerbox-${this.player_number}`).style.display = 'flex';
		}
	}
}

module.exports = GamePlayerBox;
