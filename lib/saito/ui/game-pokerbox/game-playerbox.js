const GamePlayerBoxTemplate = require('./game-playerbox.template');

/**
 * The Playerbox is a compact UI element for displaying player information in a form for use in card
 * games and other applications where compactness and simplicity is desired. The playerbox is also
 * designed to display *around* the screen such that the position of the box may vary depending on how
 * many players are in the game.
 *
 * For example, in a 2-player game each player's own playerbox will have -1 suffixed to all the div id's and the opponent's playerbox will have -4 as the suffix on each of the div ids
 *
 * Basic template:
 *   Head -- typically displays the user
 *   Body -- typically displays the "plog" / player-log
 */
class GamePlayerBox {
	/**
	 *  @constructor
	 *  @param app - Saito app
	 */
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.show_observer_box = false;
		this.rendered = false;
	}

	/**
	 * Creates player boxes according to number of players in game
	 * Automatically assigns unique id #s to divs in DOM, but can be specified by setting a seats property in game object
	 */
	async render() {
		try {
			this.rendered = true;
			let boxes = document.querySelectorAll('.player-box');
			for (let box of boxes) {
				box.remove();
			}

			if (document.querySelector('.player-box-grid')) {
				document.querySelectorAll('.player-box').remove;
			}

			let i = this.show_observer_box ? 0 : 1;

			for (; i <= this.mod.game.players.length; i++) {
				let player = this.playerBox(i);
				if (!document.getElementById(`player-box-${player}`)) {
					this.app.browser.addElementToDom(
						GamePlayerBoxTemplate(player)
					);
					await this.refreshName(i); //Player names included in box by default
				}
			}

			await this.attachEvents();
		} catch (err) {
			console.log('Render error: ', err);
		}
	}

	/** Default event -- double click player-box head to launch chat window with player */
	async attachEvents() {
		let chatmod = null;
		let pb_self = this;
		for (let i = 0; i < this.app.modules.mods.length; i++) {
			if (this.app.modules.mods[i].slug === 'chat') {
				chatmod = this.app.modules.mods[i];
			}
		}

		let publicKey = await pb_self.app.wallet.getPublicKey();

		for (let player = 1; player <= this.mod.game.players.length; player++) {
			let boxId = this.playerBox(player);
			$(`#player-box-head-${boxId}`).off();
			if (pb_self.mod.game.players[player - 1] !== publicKey) {
				$(`#player-box-head-${boxId}`).on('dblclick', function () {
					pb_self.app.connection.emit('open-chat-with', {
						key: pb_self.mod.game.players[player - 1]
					});
				});
			}
		}
	}

	/**
   * Adds draggability to all the playerboxes (not a default setting)
   *
  makeDraggable() {
    try {
      let groupedOpponents = document.getElementById("opponentbox");
      for (let i = 1; i <= this.mod.game.players.length; i++) {
        let player = this.playerBox(i);
        if (
          !document.getElementById(`player-box-${player}`) ||
          !document.getElementById(`player-box-head-${player}`)
        ) {
          console.log("Null DOM elements for Playerbox");
          return -1;
        }
        if (i == this.mod.game.player || !groupedOpponents) {
          this.app.browser.makeDraggable(`player-box-${player}`, `player-box-head-${player}`);
          document.querySelector(`#player-box-head-${player}`).style.cursor = "grab";
        }
      }
      if (groupedOpponents) {
        this.app.browser.makeDraggable("opponentbox");
      }
    } catch (err) {
      console.log("Events error:", err);
    }
  }*/

	hide() {
		try {
			for (let i = 1; i <= this.mod.game.players.length; i++) {
				let player = this.playerBox(i);
				if (document.getElementById(`player-box-${player}`)) {
					document.getElementById(
						`player-box-${player}`
					).style.display = 'none';
				}
			}
		} catch (err) {}
	}

	show() {
		try {
			for (let i = 1; i <= this.mod.game.players.length; i++) {
				let player = this.playerBox(i);
				if (document.getElementById(`player-box-${player}`)) {
					document.getElementById(
						`player-box-${player}`
					).style.display = 'flex';
				}
			}
		} catch (err) {}
	}

	/**
	 * Groups all "opponent" playerboxes into a wrapper division
	 * Sometimes cleaner to have all the opponent boxes together rather than around a poker table
	 */
	async groupOpponents(onlyOpponents = true) {
		let oBox = document.getElementById('opponentbox');

		if (!oBox) {
			let html = `<div class="opponents" id="opponentbox"></div>`;
			oBox = this.app.browser.htmlToElement(html);
			if (document.getElementById('player-box-1')) {
				document.querySelector('#player-box-1').after(oBox); //Put new wrapper just after the player box
			} else {
				document.body.append(oBox);
			}
		}

		let publicKey = await this.app.wallet.getPublicKey();

		let opponents = this.returnPlayersBoxArray();
		if (!this.mod.game.players.includes(publicKey)) {
			opponents = this.returnViewBoxArray();
		} else {
			//Only filter me if I even have a player box
			if (onlyOpponents) {
				opponents.shift(); //Remove the active player
			}
		}
		for (let o of opponents) {
			let pbo = document.querySelector(`#player-box-${o}`);
			let pbho = document.querySelector(`#player-box-head-${o}`);
			if (!pbo || !pbho) {
				console.log('DOM failure');
				return;
			}
			//Unset draggable (if activated)
			pbo.removeAttribute('style');
			pbho.removeAttribute('style');

			//Move Opponent Playerbox into container
			oBox.append(pbo);
		}
		//Make them draggable as a unit
		//this.app.browser.makeDraggable("opponentbox");
	}

	/**
	 * @param {int} pnum - player number, e.g. {1, 2, ... # of players}
	 * Converts the player number to a "seat position" This player is always 1, unless you render with game.seats
	 */
	async playerBox(pnum) {
		//For attempts to access playerbox before rendered
		if (!this.mod) {
			return 1;
		}

		let publicKey = await this.app.wallet.getPublicKey();

		if (!this.mod.game.players.includes(publicKey)) {
			let player_box = this.returnViewBoxArray();
			//console.log("*** Playerbox: Using view box");
			if (pnum <= 0) {
				return 1; //Default is first position
			}
			return player_box[pnum - 1];
		} else {
			let player_box = this.returnPlayersBoxArray();

			if (pnum <= 0) {
				return player_box[0]; //Default is first position
			}

			//Shift players in Box Array according to whose browser, so that I am always in seat 1
			let prank = 1 + this.mod.game.players.indexOf(publicKey); //Equivalent to mod.player ?
			let seat = pnum - prank;

			if (seat < 0) {
				seat += this.mod.game.players.length;
			}
			return player_box[seat];
		}
	}

	/**
	 * Returns either game.seats or the default poker table seating schedule
	 * 5 4 3
	 * 6 1 2  ?? --> CSS this way
	 */
	returnPlayersBoxArray() {
		let player_box = [];
		if (this.mod.seats) {
			player_box = this.mod.seats;
		} else {
			if (this.mod.game.players.length == 1) {
				player_box = [1];
			}
			if (this.mod.game.players.length == 2) {
				player_box = [1, 4];
			}
			if (this.mod.game.players.length == 3) {
				player_box = [1, 3, 5];
			}
			if (this.mod.game.players.length == 4) {
				player_box = [1, 2, 4, 6];
			}
			if (this.mod.game.players.length == 5) {
				player_box = [1, 2, 3, 5, 6];
			}
			if (this.mod.game.players.length == 6) {
				player_box = [1, 2, 3, 4, 5, 6];
			}
		}

		return player_box;
	}

	/**
	 * Returns poker table seating schedule for observer mode
	 * 3 4 5
	 * 2 _ 6
	 */
	returnViewBoxArray() {
		let player_box = [];

		if (this.mod.game.players.length == 1) {
			player_box = [4];
		}
		if (this.mod.game.players.length == 2) {
			player_box = [3, 5];
		}
		if (this.mod.game.players.length == 3) {
			player_box = [3, 4, 5];
		}
		if (this.mod.game.players.length == 4) {
			player_box = [2, 3, 5, 6];
		}
		if (this.mod.game.players.length == 5) {
			player_box = [2, 3, 4, 5, 6];
		}

		return player_box;
	}

	/**
	 * Refresh Player Name (Player-Boxes show Identicon + Username in top line)
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 * @param {string} name - a user-provided name. If blank, will use whatever name is associated with the wallet
	 * @param {stirng} userline - some content to put under the user name
	 */
	async refreshName(pnum, name = '', userline = '') {
		let publickey = this.mod.game.players[pnum - 1];
		let identicon = this.app.keychain.returnIdenticon(publickey);
		if (name == '') {
			name = this.app.keychain.returnUsername(publickey);
		}
		if (name.includes('@')) {
			name = name.substring(0, name.indexOf('@'));
		}

		if (userline == '') {
			//
			// Allow games with fixed player names (like US/USSR or Black/White) to override Player 1 / Player 2
			//
			if (this.mod?.roles) {
				userline = this.mod.roles[pnum];
			} else {
				userline = `Player ${pnum}`;
			}
		}

		let playerBox = await this.playerBox(pnum);

		let html = `
      <div id="player-box-head-${playerBox}" class="player-box-head-${playerBox} player-box-head">
        <div class="saito-user saito-user-${publickey}" id="saito-user-${publickey}" data-id="${publickey}" data-disable="false">
          <div class="saito-identicon-box"><img class="saito-identicon" src="${identicon}"></div>
          <div class="saito-address treated" data-id="${publickey}">${name}</div>
          <div class="saito-userline">${userline}</div>
        </div>
      </div>
    `;

		console.log('refresh name');
		this.app.browser.replaceElementBySelector(
			html,
			'#player-box-head-' + playerBox
		);
	}

	refreshTitle(html, pnum = -1) {
		let selector = '#player-box-head-' + this.playerBox(pnum);
		this._updateDiv(selector, html);
	}

	/**
	 * Adds a class to each of the playerboxes
	 * @param {string} className - user defined class (for css or DOM hacking)
	 * @param {boolean} isStub - flag for whether to add a numerical suffic to classname so you can tell apart playerboxes
	 * This function [addClassAll("poker-seat")] is required for Player-Box to accurately render around a card table
	 */
	addClassAll(className, isStub = true) {
		if (isStub) {
			for (let i = 1; i <= 9; i++) {
				let box = document.querySelector(`#player-box-${i}`);
				if (box) {
					box.classList.add(`${className}${i}`);
				}
			}
		} else {
			let boxes = document.querySelectorAll('.player_box');
			for (let box of boxes) {
				box.classList.add(className);
			}
		}
	}

	/**
	 * Individually a classname to one of the playerboxes
	 * @param {string} className - name of class
	 * @param {int} player - the player number (according to game), -1 means this player
	 */
	addClass(className, player = -1) {
		let selector = '#player-box-' + this.playerBox(player);
		let box = document.querySelector(selector);
		if (box) {
			box.classList.add(className);
		}
	}

	/**
	 * Add a class name to the "graphical" subdivision of each playerbox
	 * @param {string} className - name of class
	 */
	addGraphicClass(className) {
		let playerBoxes = document.querySelectorAll('.player-box-graphic');
		for (let hand of playerBoxes) {
			hand.classList.remove(className);
			hand.classList.add(className);
		}
	}

	/**
	 * Adds a "status" class to player-box log of this player so that updateStatus functions
	 * render in the playerbox
	 */
	addStatus() {
		let div = document.querySelector(
			`#player-box-log-${this.playerBox(-1)}`
		);
		if (div) {
			div.classList.add('status');
			div.classList.add('hide-scrollbar');
		}
	}

	/*
	 * Helper class for updating different sections of Player-Box
	 */
	_updateDiv(selector, html) {
		try {
			let div = document.querySelector(selector);
			if (div) {
				div.innerHTML = html;
			} else {
				console.log(selector + ' not found');
			}
		} catch (err) {
			console.log('could not update div');
		}
	}

	/**
	 * Insert provided html into the graphic subdivision of playerbox
	 * @param {string} html - information to be displayed
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 */
	refreshGraphic(html, pnum = -1) {
		this._updateDiv(`#player-box-graphic-${this.playerBox(pnum)}`, html);
	}

	appendGraphic(html, pnum = -1) {
		try {
			let div = document.querySelector(
				`#player-box-graphic-${this.playerBox(pnum)}`
			);
			if (div) {
				div.innerHTML += html;
			}
		} catch (err) {
			console.warn('could not update graphic div:', err);
		}
	}

	/**
	 * Query selects a dom element and inserts into the given player's graphics box
	 * @param {string} elem_id - id of an already existing dom element
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 */
	insertGraphic(elem_id, pnum = -1) {
		let div = document.getElementById(
			`player-box-graphic-${this.playerBox(pnum)}`
		);
		let elm = document.getElementById(elem_id);
		if (div && elm) {
			div.append(elm);
		}
	}

	/**
	 * Insert provided html into the log subdivision of playerbox
	 * @param {string} html - information to be displayed
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 */
	refreshLog(html, pnum = -1) {
		this.app.browser.replaceElementContentBySelector(
			html,
			`#player-box-body-${this.playerBox(pnum)}`
		);
		console.log(
			'LOG INFO IS: ' +
				JSON.stringify(
					document.querySelector(
						`#player-box-body-${this.playerBox(pnum)}`
					).innerHTML
				)
		);
	}

	appendLog(html, pnum = -1) {
		try {
			let div = document.getElementById(
				`player-box-body-${this.playerBox(pnum)}`
			);
			if (div) {
				div.innerHTML += html;
				console.log(html);
			} else {
				console.log(
					`player-box-body-${this.playerBox(pnum)} not found`
				);
			}
		} catch (err) {
			console.warn('could not update log: ', err);
		}
	}

	/**
	 * Insert provided html into the log subdivision of playerbox
	 * @param {string} html - information to be displayed
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 */
	refreshInfo(html, pnum = -1) {
		this.app.browser.replaceElementContentBySelector(
			html,
			`#player-box-body-${this.playerBox(pnum)}`
		);
	}

	/**
	 * Hide the info subdivision of a given player-box
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 */
	hideInfo(pnum = -1) {
		let selector = '#player-box-body-' + this.playerBox(pnum);
		try {
			document
				.querySelector(selector)
				.classList.add('hidden-playerbox-element');
		} catch (err) {}
	}

	/**
	 * Hide the info subdivision of a given player-box
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 */
	showInfo(pnum = -1) {
		let selector = '#player-box-body-' + this.playerBox(pnum);
		try {
			document
				.querySelector(selector)
				.classList.remove('hidden-playerbox-element');
		} catch (err) {}
	}

	/**
	 *Alert Next player with visual UI changes on player box. Done with predefined css classes
	 * @param {int} pnum - the player number (according to game), -1 means this player
	 * @param {string} alertType - the alert type that should be displayed  supported: 'flash', 'shake'
	 * @param {string} stopTrigger - the browser event that should  stop an alert supported: 'click', 'mousemove'
	 * @param {int} duration - the duration in milliseconds in which the alert should be displayed in the event of no stop trigger
	 */
	alertNextPlayer(
		pnum,
		alertType = 'flash',
		stopTrigger = null,
		duration = 4000
	) {
		let selector = '#player-box-' + this.playerBox(pnum);

		let box = document.querySelector(selector);
		if (box) {
			box.classList.add(alertType);
		}

		if (stopTrigger) {
			// A browser instance only listens to it's own browser stop trigger event, hence won't affect other players.
			// Consider  ways of sending stop trigger event to all peers/players
			window.addEventListener(stopTrigger, (e) => {
				box.classList.remove(alertType);
			});
		} else {
			setTimeout(() => {
				box.classList.remove(alertType);
			}, duration);
		}
	}
}

module.exports = GamePlayerBox;
