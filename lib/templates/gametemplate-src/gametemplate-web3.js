/*********************************************************************************
 GAME WEB3


**********************************************************************************/
class GameWeb3 {
	//
	// games can override this function if they want to support crypto integration and
	// have any module-specific initialization work to do. it is a good idea to restart
	// the game for instance...
	//
	initializeGameStake(crypto, stake) {

		//
		// reset vars
		//
		//this.game.queue = [];
		//this.game.deck = [];
		delete this.game.state;

                //this.halted = 0;
                //this.gaming_active = 0;


                //
                // have we tried running our existing queue?
                //
                this.initialize_game_run = 0;

		this.initializeGame(this.game.id);

		if (this.browser_active) {
			this.render(this.app);
		}

		if (this.browser_active) {
			console.log("Get Logo for " + crypto);
			this.insertCryptoLogo(crypto);
		}

console.log("restarting which queue 1: ");
console.log("restarting which queue 1: ");
console.log("restarting which queue 1: ");
console.log("restarting which queue 1: ");
console.log(JSON.stringify(this.game.queue));
// TODO REMOVE ONCE WEB3 all solid
//		this.restartQueue();
console.log("restarting which queue 2: ");
console.log("restarting which queue 2: ");
console.log("restarting which queue 2: ");
console.log("restarting which queue 2: ");
console.log(JSON.stringify(this.game.queue));

	}


	insertCryptoLogo(ticker){

		let results = this.app.modules.getRespondTos("crypto-logo", {ticker});

		if (results.length > 0){

			console.log(results[0]);

			let logo = results[0]?.svg;

			if (logo){
				try {
					if (!document.querySelector('.crypto_logo')) {
						$('.gameboard').append(this.app.browser.htmlToElement(`<div class="crypto_logo">${logo}</div>`));
					}
				} catch (err) {
					console.warn("Error: ", err);
				}
			}			
		}

	}


	//
	// this allows players to propose a crypto/web3 stake for the game. it will trigger
	// the STAKE command among players who have not INIT'd or APPROVED the shift allowing
	// them to accept / reject the idea.
	//
	async proposeGameStake(
		ticker = '',
		stake = '',
		sigs = [],
		ts = new Date().getTime()
	) {

		//
		// restore original pre-move state
		//
		// this ensures if we are halfway through a move that we will
		// return to the game in a clean state after we send the request
		// to our opponent for shifting game modes.
		//
		this.game = this.game_state_pre_move;
		this.moves = [];

		while (sigs.length < this.game.players.length) {
			sigs.push('');
		}

		let privateKey = await this.app.wallet.getPrivateKey();

		sigs[this.game.player - 1] = this.app.crypto.signMessage(
			`${ts} ${ticker} ${stake} ${this.game.id}`,
			privateKey
		);

		//
		// remove STAKE instruction
		//
		if (this.game.queue.length) {
			let pmv = this.game.queue[this.game.queue.length - 1];
			let pm = pmv.split('\t');
			if (pm[0] === 'STAKE') {
				this.game.queue.splice(this.game.queue.length - 1, 1);
			}
		}

		this.game.turn = [
			`STAKE\t${ticker}\t${stake}\t${ts}\t${JSON.stringify(sigs)}`
		];
		await this.sendGameMoveTransaction('game', {});
	}

	async depositGameStake(
		ticker = '',
		stake = '',
		sigs = [],
		ts = new Date().getTime()
	) {
		this.game.turn = ['ACKNOWLEDGE\tOpponent considering...'];
		await this.sendGameMoveTransaction('game', {});
	}
	async refuseGameStake(
		ticker = '',
		stake = '',
		sigs = [],
		ts = new Date().getTime()
	) {
		this.game.turn = ['ACKNOWLEDGE\tCrypto Game Rejected'];
		await this.sendGameMoveTransaction('game', {});
	}

	/**
	 *
	 * If we have established a game stake, this function will get called at the end of the game
	 * Games like poker/blackjack that settle every round or have players join/leave at will, are
	 * processed in table-gametemplate in an overrode function
	 *
	 * So given one or more winners, the remaining players send the bet amount to the winners
	 *
	 * In a 2 player game, the 1 loser pays the 1 winner.
	 * If there is a tie, no money is sent
	 * In a 3 player game, 1 winner collect 1 stake from each of the losers
	 * In a 3 player game, if there is a 2 way tie, the 1 loser pays half the stake to each winner
	 * etc.
	 *
	 */
	async settleGameStake(winners) {

		console.log("settleGameStake winners: ", winners);

		if (!this.game?.stake || !this.game?.crypto) {
			return;
		}

		if (this.game.crypto == 'CHIPS' || this.game.crypto == 'SAITO') {
			return;
		}

		if (Array.isArray(winners)) {
			let amount_to_send_each =
				parseFloat(this.game.stake) / winners.length;

			for (let i = 0; i < this.game.players.length; i++) {
				if (!winners.includes(this.game.players[i])) {
					let loser = this.game.players[i];
					for (let winner of winners) {
						await this.payWinner(
							loser,
							winner,
							amount_to_send_each
						);
					}
				}
			}
		} else {
			let winner = winners;
			for (let i = 0; i < this.game.players.length; i++) {
				if (this.game.players[i] !== winner) {
					let loser = this.game.players[i];
					await this.payWinner(loser, winner, this.game.stake);
				}
			}
		}
	}

	/**
	 * This function is very similar to the QUEUE Commands
	 * SEND & RECEIVE except without the game loop logic.
	 *
	 * If the player is the sender or receiver, they will launch the appropriate
	 * UI from the gameCryptoTransferManager to trigger a crypto transfer
	 *
	 */
	async payWinner(sender, receiver, amount) {
		let ts = new Date().getTime();
		this.rollDice();
		let unique_hash = this.game.dice;
		amount = this.app.crypto.convertFloatToSmartPrecision(
			parseFloat(amount)
		);
		//parseFloat(amount).toFixed(8); //ensure string representation
		let ticker = this.game.crypto;

		//
		// if we are the sender, lets get sending and receiving addresses
		//

		console.log('-----------------------------');		
		console.log('payWinner ///');
		console.log('sender, receiver ');
		console.log(sender, receiver);
		 // console.log('this.game');
		 // console.log(this.game);
		console.log('-----------------------------');

		let game_self = this;
		let sender_crypto_address = '';
		let receiver_crypto_address = '';
		for (let i = 0; i < this.game.players.length; i++) {
			let player = i+1;
			let crypto = this.game.crypto;
			if (this.game.players[i] === sender) {
				sender_crypto_address = this.game.cryptos[player][crypto]['address'];
			}
			if (this.game.players[i] === receiver) {
				receiver_crypto_address = this.game.cryptos[player][crypto]['address'];
			}
		}


		console.log('***************************************************');

		console.log('sender_crypto_address, receiver_crypto_address');
		console.log(sender_crypto_address, receiver_crypto_address);

		console.log('***************************************************');

		if (this.publicKey === sender) {
			this.crypto_transfer_manager.sendPayment(
				this.app,
				this,
				[sender+'-'+sender_crypto_address],
				[receiver+'-'+receiver_crypto_address],
				[amount],
				ts,
				ticker,
				async function () {
					await game_self.app.wallet.sendPayment(
						[sender_crypto_address],
						[receiver_crypto_address],
						[amount],
						ts,
						unique_hash,
						function (robj) {
							console.log(
								'End game crypto transfer callback',
								robj
							);
							if (game_self?.game?.over == 1) {
								document.querySelector('#auth_title').innerHTML = `Crypto 
								Sent`;
								document.querySelector('#spinner').style.display = 'none';
								document.querySelector('#game-crypto-icon').style.display = 'block';
							}
						},
						ticker
					);
					return 0;
				}
			);
		} else if (this.publicKey === receiver) {
			game_self.crypto_transfer_manager.receivePayment(
				this.app,
				this,
				[sender+'-'+sender_crypto_address],
				[receiver+'-'+receiver_crypto_address],
				[amount],
				ts,
				ticker,
				async function (divname = null, overlay = null) {
					await game_self.app.wallet.receivePayment(
						[sender_crypto_address],
						[receiver_crypto_address],
						[amount],
						ts,
						unique_hash,
						function (robj) {
							
								if (document.querySelector('.spinner')) {
									document
										.querySelector('.spinner')
										.remove();
								}
								document.querySelector('#game-crypto-icon').style.display = 'block';
								$(
									'.game-crypto-transfer-manager-container .hidden'
								).removeClass('hidden');
								if (divname) {
									if (robj) {
										//==1, success
										divname.textContent = 'Received Crypto';
									} else {
										//==0, failure
										divname.textContent = 'Failed to receive crypto';
									}
								}

								if (game_self.app.options.gameprefs.crypto_transfers_inbound_trusted 
									|| game_self?.game?.over == 1)  {
									siteMessage(`Received ${amount} ${ticker}`, 3000);	
								}

								return 0;
							},
						ticker,
						-1
					);

					return 0;
				}
			);
		}
	}

	//
	// float to string
	//
	fts(val) {
		try {
			if (val.toFixed(8)) {
				val = val.toFixed(8);
			}
		} catch (err) {}
		return this.app.crypto.convertStringToDecimalPrecision(val);
	}

	//
	// string to float
	//
	stf(val) {
		if (!isNaN(val) && val.toString().indexOf('.') != -1) {
			return parseFloat(parseFloat(val).toFixed(8));
		}
		val = parseFloat(val);
		val = parseFloat(val.toFixed(8));
		return val;
	}

	//
	// add to string
	//
	addToString(x, add_me) {
		let y = this.stf(x) + this.stf(add_me);
		y = this.fts(y);
		return this.app.crypto.convertStringToDecimalPrecision(y, 8);
	}

	//
	// subtract from string
	//
	subtractFromString(x, subtract_me) {
		let y = this.stf(x) - this.stf(subtract_me);
		if (y < 0) {
			y = 0;
		}
		return this.app.crypto.convertStringToDecimalPrecision(y, 8);
	}
}

module.exports = GameWeb3;
