
	async render(app) {

		if (!this.browser_active) {
			return;
		}
		if (this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');
		this.menu.addSubMenuOption('game-game', {
			text: 'How to Play',
			id: 'game-rules',
			class: 'game-rules',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnGameRulesHTML());
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Stats',
			id: 'game-stats',
			class: 'game-stats',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.stats.render();
			}
		});

		await super.render(app);

		//
		// board renders all subcomponents
		//
		this.board.render();

		this.menu.addChatMenu();
		this.menu.render();

		this.log.render();

		this.insertCryptoLogo(this.game?.options?.crypto);

		//
		// gametabletemplate adds a scoreboard DIV that shows HIDE / LEAVE / JOIN instructions
		// which we are going to hide to prevent UI / UX clutter, but leave functional so as to
		// enable faster experimentation.
		//
		if (document.querySelector('.game-scoreboard')) {
			document.querySelector('.game-scoreboard').style.display = 'none';
		}
	}

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


	eisplayBoard() {
		if (!this.browser_active) {
			return;
		}
		try {
alert("DISPLAY BOARD!");
			this.board.render();
			//this.displayHand();
			//this.displayTable();
		} catch (err) {
			console.error('err: ' + err);
		}
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

	displayTable() {
		if (!this.browser_active) {
			return;
		}
		try {
			if (document.getElementById('deal')) {
				let newHTML = '';
				for (
					let i = 0;
					i < 5 || i < this.game.pool[0].hand.length;
					i++
				) {
					let card = {};

					if (i < this.game.pool[0].hand.length) {
						card =
							this.game.pool[0].cards[this.game.pool[0].hand[i]];
						newHTML += `<div class="flip-card card"><img class="cardFront" src="${this.card_img_dir}/${card.name}"></div>`;
					} else {
						newHTML += `<div class="flip-card card"><img class="cardBack" src="${this.card_img_dir}/red_back.png"></div>`;
					}
				}
				document.getElementById('deal').innerHTML = newHTML;
			}
		} catch (err) {
			console.warn('Card error displaying table:', err);
		}

		this.pot.render();
	}

	displayPot() {
		this.pot.render();
	}



	async clearTable() {
		if (!this.browser_active) {
			return;
		}

		$('#pot').fadeOut(1650);
		$('.winner').removeClass('winner');

		await this.timeout(200);
		this.restartQueue();
	}

	displayPlayerLog(html, player) {
		this.playerbox.renderNotice(html, player);
	}

	displayPlayerStack(player) {

		if (!this.browser_active) { return; }

		let credit = this.game.state.player_credit[player - 1]; 
		let userline = `${this.returnPlayerRole(player)}<div class="saito-balance">${this.formatWager(credit)}</div>`;

		this.playerbox.renderUserline(userline, player);

alert("display player stack!");

		this.stack.render();

	}

	async exitGame(){
      if (this.game.over == 0 && this.game.player){
	      let c = await sconfirm("forfeit the game?");
	      if (c) {
	      	await this.sendStopGameTransaction("forfeit");
	      	this.game.over = 2;
					this.removePlayer(this.publicKey);
	      	this.saveGame(this.game.id);
	      	setTimeout(
	      		() => {
	      			super.exitGame();
	      		}, 500); 
				}
      }else{
      	super.exitGame();
      }
	}


	async receiveStopGameTransaction(resigning_player, txmsg) {
		console.log("Poker: receiveStopGameTransaction", txmsg, resigning_player);

		await super.receiveStopGameTransaction(resigning_player, txmsg);

		if (this.publicKey == resigning_player){
			return;
		}

		let loser = -1;
		for (let i = 0; i < this.game.players.length; i++){
			if (this.game.players[i] == resigning_player){
				loser = i + 1;
				break;
			}
		}

		if (loser < 0){
			console.log("Player is not in the game");
			return;
		}

		if (txmsg?.deck){
			if (!this.game?.opponent_decks){
				this.game.opponent_decks = {};	
			}
			if (!this.game.opponent_decks[`${loser}`]){
			 this.game.opponent_decks[`${loser}`] = txmsg.deck;
			}
		}

		if (this.browser_active) {
			if (this.publicKey !== resigning_player) {
				this.displayPlayerNotice(
					`<div class="plog-update">left the table</div>`,
					loser
				);
			}
		}

		this.updateLog(
			this.game.state.player_names[loser - 1] + ' left the table'
		);

		this.game.stats[resigning_player].folds++;
		this.game.state.passed[loser - 1] = 1;
		this.game.state.last_fold = loser;

		if (this.game.target == loser) {
			this.game.state.plays_since_last_raise--;
			this.startQueue();
		}
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

