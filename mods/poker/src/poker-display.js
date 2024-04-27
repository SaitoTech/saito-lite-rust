



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

		this.board.render();

		this.menu.addChatMenu();
		this.menu.render();

		this.log.render();

//		this.playerbox.container = 'body';
//		this.playerbox.mode = 2; // poker/cards
//		this.playerbox.render();

		this.insertCryptoLogo(this.game?.options?.crypto);

//		for (let i = 0; i < this.game.players.length; i++){
//			let hm = new HealthMeter(this.app, this, `.game-playerbox-${i+1}`);
//			hm.color = this.app.keychain.returnIdenticonColor(this.game.players[i]);
//			this.healthBars.push(hm);
//			hm.render(this.game.state.player_credit[i]);
//		}

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


	returnState(num_of_players) {
		let state = {};

		state.round = 1;
		state.flipped = 0;

		state.player_cards = {};
		state.player_cards_reported = 0;
		state.player_cards_required = 0;

		state.plays_since_last_raise = 0;

		state.pot = 0;

		state.big_blind_player = 1;
		state.small_blind_player = 2;
		state.button_player = 3;

		if (num_of_players == 2) {
			state.button_player = 2;
			state.big_blind_player = 2;
			state.small_blind_player = 1;
		}

		state.player_names = [];
		state.player_pot = [];
		state.player_credit = [];
		state.passed = [];
		state.debt = [];

		state.winners = [];
		state.last_fold = null;

		//
		// initializeGameStake should flesh this out
		//
		for (let i = 0; i < num_of_players; i++) {
			state.passed[i] = 0;
			state.player_pot[i] = 0;
			state.player_credit[i] = 0;
			state.debt[i] = 0;
			state.player_names[i] = this.app.keychain.returnUsername(
				this.game.players[i],
				12
			);
		}

		state.big_blind = 2;
		state.small_blind = 1;
		state.last_raise = 2;
		state.required_pot = 2;
		state.all_in = false;

		return state;
	}

	returnStats() {
		let stats = {};
		for (let i = 0; i < this.game.players.length; i++) {
			stats[this.game.players[i]] = {};
			stats[this.game.players[i]].hands = 0;
			stats[this.game.players[i]].wins = 0;
			stats[this.game.players[i]].folds = 0;
			stats[this.game.players[i]].walks = 0;
			stats[this.game.players[i]].vpip = 0;
			stats[this.game.players[i]].showdowns = 0;
		}
		return stats;
	}

	removePlayerFromState(index) {
		if (index >= 0 && index < this.game.state.player_names.length){
			this.game.state.player_names.splice(index, 1);
			this.game.state.player_pot.splice(index, 1);
			this.game.state.player_credit.splice(index, 1);
			this.game.state.passed.splice(index, 1);
			this.game.state.debt.splice(index, 1);
		}else{
			console.warn("Invalid index removePlayerFromState");
		}
	}


	/****************
	 *
	 ***** GUI *****
	 *
	 ***************/

	displayBoard() {
		if (!this.browser_active) {
			return;
		}
		try {
			this.displayPlayers(); //Clear player log
			this.displayHand();
			this.displayTable();
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
				this.refreshPlayerStack(i);
				this.playerbox.updateIcons(``, i);
				if (!preserveLog) {
					this.refreshPlayerLog('', i);
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

	updatePot() {
		let poker_self = this;

		let html = `<div class="pot-counter">${this.formatWager(this.game.state.pot)}</div>`;

		$('#pot').css('display', 'flex');

		this.app.browser.replaceElementBySelector(html, ".pot-counter");

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
		this.updatePot();
	}

	async animateRiver() {
		if (!this.browser_active || !document.getElementById('deal')) {
			return;
		}

		for (let i = 0; i < this.game.pool[0].hand.length; i++) {
			let card = this.game.pool[0].cards[this.game.pool[0].hand[i]];
			let nthSlot = $('#deal').children().get(i);

			if (
				nthSlot.classList.contains('flipped') ||
				!nthSlot.classList.contains('flip-card')
			) {
				continue;
			}
			$(nthSlot).append(
				`<img class="card cardFront" src="${this.card_img_dir}/${card.name}">`
			);
			await this.timeout(250);
			$(nthSlot).addClass('flipped');
		}
	}

	//
	// We will actually increment player stack / decrement the game pot in this function!!!
	//
	async animateWin(amount, player_indices){	

		for (let i = 0; i < amount; i++){
	
			for (let j = 0; j < player_indices.length; j++){

				this.moveGameElement(this.createGameElement(`<div class="poker-chip"></div>`, ".pot-chips"),
					`.game-playerbox-${player_indices[j] + 1}`,
					{
						callback: () => {
							this.game.state.pot--;
							this.game.state.player_credit[player_indices[j]]++;
							this.updatePot();
							this.refreshPlayerStack(player_indices[j] + 1);
						},
						run_all_callbacks: true
					},
					(item) => {
						$(item).remove();
					});
				await this.timeout(1000/amount);
			}
		}

		if (this.game.state.pot > 0) {
			// ***TO DO: examine possibility of fractional chips
			// Randomly give the remaining chip to one player
		}


	}

	async animateBet(amount, player_index, restartQueue = false){

		if (restartQueue){
			this.halted = 1;
		}
		
		for (let i = 0; i < amount; i++){

			this.moveGameElement(this.createGameElement(`<div class="poker-chip"></div>`, `.game-playerbox-${player_index+1}`),
				".pot-chips",
				{
					callback: () => {
						this.game.state.pot++;
						this.game.state.player_credit[player_index]--;
						this.updatePot();
						this.refreshPlayerStack(player_index+1);
					},
					run_all_callbacks: !restartQueue
				},
				(item) => {
					if (!restartQueue){
						$(item).remove();	
					}else{
						$('.animated_elem').remove();
						console.log("*******************************");
						this.restartQueue();
					}
					
				});
			await this.timeout(500/amount);
		}

	}

	async clearTable() {
		if (!this.browser_active) {
			return;
		}

		$('#pot').fadeOut(1650);


		$('.game-playerbox-graphics .hand').animate(
			{ left: '1000px' },
			1200,
			'swing',
			function () {
				$(this).remove();
			}
		);

		await this.timeout(600);

		$($('#deal').children().get().reverse()).each(function (index) {
			$(this)
				.delay(50 * index)
				.queue(function () {
					$(this)
						.removeClass('flipped')
						.delay(20 * index)
						.queue(function () {
							$(this)
								.animate(
									{ left: '1000px' },
									1200,
									'swing',
									function () {
										$(this).remove();
									}
								)
								.dequeue();
						})
						.dequeue();
				});
		});

		$('.winner').removeClass('winner');

		await this.timeout(1000);
		this.restartQueue();
	}

	refreshPlayerLog(html, player) {
		this.playerbox.updateBody(html, player);
	}

	refreshPlayerStack(player) {
		if (!this.browser_active) {
			return;
		}

		let credit = this.game.state.player_credit[player - 1]; 

		let userline =
			this.returnPlayerRole(player) +
			`<div class="saito-balance">${this.formatWager(credit)}</div>`;
		this.playerbox.updateUserline(userline, player);

		this.healthBars[player-1].render(credit);
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
				this.refreshPlayerLog(
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

	returnGameRulesHTML() {
		return PokerGameRulesTemplate(this.app, this);
	}

	returnAdvancedOptions() {
		return PokerGameOptionsTemplate(this.app, this);
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
		// if (stake){
		//   stake.onchange = updateChips;
		// }
		if (numChips) {
			numChips.onchange = updateChips;
		}
	}

	returnShortGameOptionsArray(options) {
		let sgoa = super.returnShortGameOptionsArray(options);
		let ngoa = {};
		let crypto = '';
		for (let i in sgoa) {
			if (sgoa[i] != '') {
				let okey = i;
				let oval = sgoa[i];

				let output_me = 1;
				if (okey == 'chip') {
					if (oval !== '0') {
						okey = 'small blind';
					} else {
						output_me = 0;
					}
				}
				if (okey == 'blind_mode') {
					if (oval == 'increase') {
						okey = 'mode';
						oval = 'tournament';
					} else {
						output_me = 0;
					}
				}
				if (okey == 'num_chips') {
					okey = 'chips';
				}

				if (output_me == 1) {
					ngoa[okey] = oval;
				}
			}
		}

		return ngoa;
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
				this.playerbox.updateBody(
					`<div class="status">${str}</div>`,
					this.game.player
				);
			}
		} catch (err) {
			console.log('ERR: ' + err);
		}
	}

