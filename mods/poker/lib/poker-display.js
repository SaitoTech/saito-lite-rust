const htmlTemplate = require('./game-html.template');

class PokerDisplay {



	startRound() {

		this.updateLog('===============');
		this.updateLog('Round: ' + this.game.state.round);

		for (let i = 0; i < this.game.players.length; i++) {
			this.updateLog(
				`Player ${i + 1}${
					i + 1 == this.game.state.button_player ? ' (dealer)' : ''
				}: ${this.game.state.player_names[i]} (${this.formatWager(
					this.game.state.player_credit[i],
					true
				)})`
			);
		}

		for (let i = 1; i <= this.game.players.length; i++) {
			this.playerbox.updateGraphics('', i);
		}

		this.initializeQueue();
	}

	returnPlayerRole(player) {
		if (this.game.state.winners.includes(player)){
			return "Winner!";
		}
		if (player == this.game.state.small_blind_player) {
			return 'small blind';
		}
		if (player == this.game.state.big_blind_player) {
			return 'big blind';
		}
		if (player == this.game.state.button_player) {
			return 'dealer';
		}

		return '';
	}

	displayPlayers(preserveLog = false) {
		if (!this.browser_active) {
			return;
		}
		try {
			for (let i = 1; i <= this.game.players.length; i++) {
				this.displayPlayerStack(i);
				this.playerbox.updateIcons(``, i);
				if (!preserveLog) {
					this.displayPlayerNotice('', i);
				}
			}
			this.playerbox.updateIcons(
				`<i class="fa-solid fa-circle-dot"></i>`,
				this.game.state.button_player
			);
		} catch (err) {
			console.log('error displaying player box', err);
		}
	}

	displayHand() {
		if (this.game.player == 0) {
			this.updateStatus(`You are observing the game`, -1);
			return;
		}

		if (this.game.state.passed[this.game.player - 1]) {
			this.cardfan.hide();
		} else {
			this.cardfan.render();
		}
	}

	returnTicker() {
		if (this.game.crypto) {
			return this.game.crypto;
		}
		return 'CHIPS';
	}


	displayPlayerNotice(msg, player) {
		this.playerbox.renderNotice(msg, player);
	}

	displayPlayerLog(html, player) {
		this.playerbox.renderNotice(html, player);
	}

	displayPlayerStack(player) {

		if (!this.browser_active) { return; }

		let credit = this.game.state.player_credit[player - 1]; 
		let userline = `${this.returnPlayerRole(player)}<div class="saito-balance">${this.formatWager(credit)}</div>`;

		this.playerbox.renderUserline(userline, player);

		this.stack.render();

	}


	attachAdvancedOptionsEventListeners() {

		let blindModeInput = document.getElementById('blind_mode');
		let numChips = document.getElementById('num_chips');
		let blindDisplay = document.getElementById('blind_explainer');
		let crypto = document.getElementById('crypto');
		let stakeValue = document.getElementById('stake');
		let chipInput = document.getElementById('chip_wrapper');
		//let stake = document.getElementById("stake");

		const updateChips = function () {
			if (numChips && stakeValue && chipInput /*&& stake*/) {
				if (crypto.value == '') {
					chipInput.style.display = 'none';
					stake.value = '0';
				} else {
					let nChips = parseInt(numChips.value);
					let stakeAmt = parseFloat(stakeValue.value);
					let jsMath = stakeAmt / nChips;
					chipInput.style.display = 'block';
				}
			}
		};

		if (blindModeInput && blindDisplay) {
			blindModeInput.onchange = function () {
				if (blindModeInput.value == 'static') {
					blindDisplay.textContent =
						'Small blind is one chip, big blind is two chips throughout the game';
				} else {
					blindDisplay.textContent =
						'Small blind starts at one chip, and increments by 1 every 5 rounds';
				}
			};
		}

		if (crypto) {
			crypto.onchange = updateChips;
		}
		if (numChips) {
			numChips.onchange = updateChips;
		}
	}

	updateStatus(str, hide_info = 0) {
		if (str.indexOf('<') == -1) {
			str = `<div style="padding-top:2rem">${str}</div>`;
		}

		this.game.status = str;
		if (!this.browser_active) {
			return;
		}
		if (this.lock_interface == 1) {
			return;
		}

		//
		// insert status message into playerbox BODY unless the status
		// already exists, in which case we simplify update it instead
		// of updating the body again.
		//
		try {
			let status_obj = document.querySelector('.status');
			if (status_obj) {
				status_obj.innerHTML = str;
			} else {
				this.playerbox.renderNotice(
					`<div class="status">${str}</div>`,
					this.game.player
				);
			}
		} catch (err) {
			console.log('ERR: ' + err);
		}
	}

}

module.exports = PokerDisplay;
