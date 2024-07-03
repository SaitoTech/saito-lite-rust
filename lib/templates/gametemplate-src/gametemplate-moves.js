/*********************************************************************************
 GAME MOVES

 Players communicate with each other by sending game moves. A "move" is sent with a lot
 of metadata that is parsed to make sure moves are processed in the correct order 
 (because we have no guarantees about the order in which transactions are received on/off chain
 and some games utilize SIMULTANEOUS moves). 

 A move is sent with a +1 on the game.step.game / game.step.players[player] from the sending
 player. When received,  we check if the move will be the next one or if it should be 
 saved as a future move.  Future moves is an array of unprocessed received transactions.
 Moves may also be temporarily saved as "future" if the game is halted for UI reasons,
 is "active" (i.e. running through the queue), or still initializing from a page load.
 This prevents interruption of game execution and makes sure all the players have their
 queues properly synchronized.

 **********************************************************************************/

let saito = require('./../../saito/saito');
const Transaction = require('./../../saito/transaction').default;

class GameMoves {

	/**
	 * Check what moves are pending in my wallet and if any of them are future moves
	 * (I sent, but haven't received and processed) return 1
	 */
	async hasGameMovePending() {

		let arrived = [];
		if (this.game?.future) {
                	for (let z = 0; z < this.game.future.length; z++) {
                		let ftx = new Transaction();
                        	ftx.deserialize_from_web(this.app, this.game.future[z]);
                        	arrived.push(ftx);
		 	}
		}

		let pending = await this.app.wallet.getPendingTransactions();
		for (let i = 0; i < pending.length; i++) {
			let tx = pending[i];
			let txmsg = tx.returnMessage();
			if (txmsg && txmsg.module == this.name) {
				if (txmsg.game_id === this.game?.id) {
					if (txmsg?.step?.game) {
						if (
							txmsg.step.game >
							this.game.step.players[tx.from[0].publicKey]
						) {

							//
							// if this transaction is already in our FUTURE list then
							// it has arrived and is not pending, and we can safely 
							// continue.
							//
							let matched = false;
							for (let zz = 0; zz < arrived.length; zz++) {
								if (JSON.stringify(txmsg) === JSON.stringify(arrived[zz].returnMessage())) { matched = true; }
							}

							// FEB 16, 2024
							if (matched == true) {
								// skip this one
								//console.log("OLD MOVE in PENDING TXS, so we can ignore it!");
							} else {
								console.log(
									'PENDING TXS:',
									JSON.parse(JSON.stringify(txmsg))
								);
								return 1;
							}
						} else {
							//console.log("OLD MOVE in PENDING TXS:",JSON.parse(JSON.stringify(txmsg)));
						}
					}
				}
			}
		}
		return 0;
	}

	//
	// we accept this as the next move if it is either one more than the current
	// in the MASTER step (i.e. legacy for two player games) or if it is one more
	// than the last move made by the specific player (i.e. 3P simultaneous moves)
	//
	isFutureMove(playerpkey, txmsg) {
		let tx_step = parseInt(txmsg.step.game) - 1;

		if (txmsg.game_id !== this.game.id) {
			return 0;
		}

		if (
			tx_step <=
			Math.min(this.game.step.game, this.game.step.players[playerpkey])
		) {
			return 0;
		}

		if (
			tx_step >
			Math.max(this.game.step.game, this.game.step.players[playerpkey])
		) {
			return 1;
		}

		return 0;
	}

	/*
	  Is this tx the next game move? It should have a step exactly one more than the main game
	  @param player - the public key address of the player
	*/
	isUnprocessedMove(player, txmsg) {

		let tx_step = parseInt(txmsg.step.game) - 1;

		if (txmsg.game_id !== this.game.id) {
			return 0;
		}

		if (tx_step == this.game.step.game) {
			return 1;
		}

		if (this.game.step.players[player] !== undefined) {
			if (tx_step == this.game.step.players[player]) {
				return 1;
			}
			if (
				tx_step >= this.game.step.players[player] &&
				tx_step < this.game.step.game
			) {
				return 1;
			}
		}

		return 0;
	}

	async addNextMove(gametx) {
		let gametxmsg = gametx.returnMessage();

		if (
			this.halted == 1 ||
			this.gaming_active == 1 ||
			this.game.initialize_game_run == 0
		) {
			console.info(
				`Save as future move because halted (${this.halted}) or active (${this.gaming_active})`
			);

			await this.addFutureMove(gametx);
			return;
		}

		this.game.step.players[gametx.from[0].publicKey] = gametxmsg.step.game;

		if (gametxmsg.step.game > this.game.step.game) {
			this.game.step.game = gametxmsg.step.game;
			this.game.step.timestamp = gametxmsg.step.timestamp;
		}

		window.location.hash = this.app.browser.modifyHash(
			window.location.hash,
			{
				step: gametxmsg.step.game
			}
		);

		console.info(`Add Next Move (${gametxmsg.step.game}) to QUEUE: ${JSON.stringify(gametxmsg.turn)}`);
		//console.log(JSON.parse(JSON.stringify(gametxmsg)));

		//
		// OBSERVER MODE -
		//
		if (this.game.player == 0) {
			if (this.browser_active) {
				this.observerControls.showLastMoveButton();
				this.observerControls.updateStep(this.game.step.game);
			}

			this.observerControls.game_states.push(this.game_state_pre_move);
			this.observerControls.game_moves.push(gametx);
			//To avoid memory overflow for long games
			if (this.observerControls.game_states.length > 100) {
				this.observerControls.game_states.shift();
			}
			if (this.observerControls.game_moves.length > 100) {
				this.observerControls.game_moves.shift();
			}
		}

		if (this.game.queue) {
			for (let i = 0; i < gametxmsg.turn.length; i++) {
				this.game.queue.push(gametxmsg.turn[i]);
			}

			this.saveFutureMoves(this.game.id);
			this.saveGame(this.game.id);
			this.startQueue();
		} else {
			console.error('No queue in game engine');
		}
	}

	async addFutureMove(gametx) {
		if (!this.game.future) {
			this.game.future = [];
		}

		let ftx = gametx.serialize_to_web(this.app);

		if (!this.game.future.includes(ftx)) {
			console.info('Future TX:', gametx);
			this.game.future.push(ftx);
			this.saveFutureMoves(this.game.id);

			if (this.game.player == 0 && this.browser_active) {
				try {
					if (this.observerControls.is_paused) {
						this.observerControls.showNextMoveButton();
						this.observerControls.updateStatus('New pending move');
					} else {
						await this.processFutureMoves();
					}
				} catch (err) {
					console.error('Observer error adding future move');
					console.error(err);
				}
			}
		}
	}

  /*
  The goal of this function is not to process all the future moves, but to search
  the archived future moves for JUST the NEXT one, so we can continue processing the game steps
  */
	async processFutureMoves() {
		this.gaming_active = 0;

		if (this.halted == 1 || this.game.initialize_game_run == 0) {
			console.info(
				`Unable to process future moves now because halted (${this.halted}) or gamefeeder not initialized (${this.initialize_game_run})`
			);
			return -1;
		}

		//console.info(this.game.future.length + " FUTURE MOVES at step --> " + this.game.step.game);

		//Search all future moves for the next one
		for (let i = 0; i < this.game.future.length; i++) {
			let ftx = new Transaction();
			ftx.deserialize_from_web(this.app, this.game.future[i]);
			let ftxmsg = ftx.returnMessage();
			console.info(
				`FTMSG (${ftxmsg.step.game}): ` + JSON.stringify(ftxmsg.turn)
			);

			if (this.isUnprocessedMove(ftx.from[0].publicKey, ftxmsg)) {
				//This move (future[i]) is the next one, move it to the queue
				this.game.future.splice(i, 1);
console.log("adding as next move 1!");
				this.observerControls.updateStatus('Advanced one move');
console.log("adding as next move 2!");
				await this.addNextMove(ftx);
				return 1;
			} else if (this.isFutureMove(ftx.from[0].publicKey, ftxmsg)) {
				//console.info("Is future move, leave on future queue");
				//This move (future[i]) is still for the future, so leave it alone
console.log("leaving, still seems future move...");
			} else {
				//Old move, can ignore
console.info("Is old move, prune from future queue");
				this.game.future.splice(i, 1);
				i--; // reduce index as deleted
			}
		}

		if (this.game.player == 0 && this.game.future.length == 0) {
			this.observerControls.updateStatus(
				'No pending moves, click again to check the database'
			);
			//salert("Caught up to current game state");
		}

		this.saveFutureMoves(this.game.id);
		if (this.game.future?.length > 0) {
			console.info(JSON.parse(JSON.stringify(this.game.future)));
		}

		return 0; //No moves in future
	}

	//
	// saves future moves without disrupting our queue state
	// so that we can continue without reloading and reload
	// without losing future moves.
	//
	saveFutureMoves(game_id = null) {
		if (game_id === null) {
			return;
		}

		if (this.app.options?.games) {
			for (let i = 0; i < this.app.options.games.length; i++) {
				if (this.app.options.games[i].id === this.game.id) {
					this.app.options.games[i].future = this.game.future;
				}
			}
		}

		this.app.storage.saveOptions();
	}

	prependMove(mv) {
		if (mv) {
			this.moves.unshift(mv);
		}
	}

	addMove(mv) {
		if (mv) {
			this.moves.push(mv);
		}
	}

	addEndMove(mv) {
		if (mv) {
			this.endmoves.push(mv);
		}
	}

	removeMove() {
		return this.moves.pop();
	}

	/**
	 *
	 * End Turn is the developer friendly wrapper for packaging player moves to send
	 * over the network.
	 */
	endTurn(nextTarget = 0) {
		let extra = {};

		if (!nextTarget) {
			nextTarget = this.returnNextPlayer();
		}

		extra.target = nextTarget;

		this.game.turn = this.moves;

		//Not sure this is necessary, but want to reset when you send your move
		//game.target should be updated when we receive our own move and continue processing
		this.game.target = 0; 

		for (let i = 0; i < this.endmoves.length; i++) {
			this.game.turn.push(this.endmoves[i]);
		}
		this.moves = [];
		this.endmoves = [];

		this.sendGameMoveTransaction('game', extra);
	}

	async sendGameMoveTransaction(
		type = 'game',
		extra = {},
		mycallback = null
	) {
		console.log('GAME TURN TO SEND: ' + JSON.stringify(this.game.turn));

		//
		// TODO - avoid browser overheating
		//
		// adding a minor delay here allows JQUERY to execute
		// out-of-order, so that the board and UI can update
		// before we take back control.
		//

		this.stopClock(); //Don't penalize the player for this minor timeout

		let privateKey = await this.app.wallet.getPrivateKey();

//		setTimeout(async () => {
			//
			// trigger regeneration of secure hash for generating random
			// numbers if we have requested it during the course of making
			// our move.
			//
			if (this.game.sroll == 1) {
				let hash1 = this.app.crypto.hash(Math.random());
				let hash2 = this.app.crypto.hash(hash1);
				let hash1_sig = await this.app.crypto.signMessage(
					hash1,
					privatekey
				);
				let hash2_sig = await this.app.crypto.signMessage(
					hash2,
					privatekey
				);

				this.game.sroll_hash = hash1;
				this.game.sroll_done = 0;
				this.game.sroll = 0; // do not trigger next message sent

				this.game.turn.slice().unshift('SECUREROLL_END');
				this.game.turn.push(
					'SECUREROLL\t' +
						this.game.player +
						'\t' +
						hash2 +
						'\t' +
						hash2_sig
				);
			}

			// observers don't send game moves
			if (this.game.player == 0) {
				return;
			}
			if (this.game.opponents == undefined) {
				return;
			}

			let send_onchain_only = 0;
			for (let i = 0; i < this.game.turn.length; i++) {
				if (this.game.turn[i] == 'READY') {
					send_onchain_only = 1;
				}
			}

			let game_self = this;
			let mymsg = {};

			//
			// steps
			//
			let ns = {};
			ns.game = this.game.step.game;
			if (type == 'game') {
				ns.game++;
				ns.timestamp = new Date().getTime();
				mymsg.request = 'game';
			}

			//
			// if our crypto key is out-of-date, update -- note that SAITO and CHIPS are not checked
			//
			let crypto_key = this.publicKey;

			if (
				game_self.game?.crypto &&
				game_self.game.crypto !== 'SAITO' &&
				game_self.game.crypto !== 'CHIPS'
			) {
				let crypto_key =
					await this.app.wallet.returnCryptoAddressByTicker(
						game_self.game.crypto
					);

				if (crypto_key !== this.game.keys[this.game.player - 1]) {
					this.game.turn.push(
						`CRYPTOKEY\t${
							this.publicKey
						}\t${crypto_key}\t${await this.app.crypto.signMessage(
							crypto_key,
							privateKey
						)}`
					);
				}
			}

			mymsg.turn = this.game.turn;
			mymsg.module = this.name;
			mymsg.game_id = this.game.id;
			mymsg.player = this.game.player;
			mymsg.step = ns;
			mymsg.extra = extra;

			//if (ns.game % 50 === 1) {
			//  mymsg.game_state = JSON.stringify(this.game);
			//}

			//console.log("sending TX with what step? " + JSON.stringify(mymsg.step));

			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee();
			if (newtx == null) {
				salert('ERROR: Difficulty Sending Transaction, please reload');
				return;
			}

			for (let i = 0; i < this.game.accepted.length; i++) {
				newtx.addTo(this.game.accepted[i]);
			}

			console.log('MESSAGE: ' + JSON.stringify(mymsg));

			newtx.msg = mymsg;
			await newtx.sign();

			//console.log("GAME ADDING TX TO PENDING: " + newtx.returnMessage());


//
// we traditionally add the transaction to pending before saving the wallet, so that
// if there is an issue with the network we don't lose the transaction when the network
// comes back online. refreshing the browser will also try to auto-resend the tx this way.
//


			await game_self.app.wallet.addTransactionToPending(newtx);
			game_self.saveGame(game_self.game.id);

			console.info('Sending Move: ', JSON.parse(JSON.stringify(mymsg)));

			//
			// send off-chain if possible - step 2 onchain to avoid relay issues with options
			//
			if (
				this.relay_moves_offchain_if_possible &&
				send_onchain_only == 0
			) {
				// only game moves to start
				if (
					(newtx.msg.request === 'game' &&
						this.game.initializing == 0) ||
					this.initialize_game_offchain_if_possible == 1
				) {
					this.app.connection.emit('relay-send-message', {
						recipient: this.game.accepted,
						request: 'game relay gamemove',
						data: newtx.toJson()
					});

					//An experiment to have game steps/ts update in arcade
					this.app.connection.emit('relay-send-message', {
						recipient: 'PEERS',
						request: 'arcade spv update',
						data: newtx.toJson()
					});
				}
			}

			game_self.app.network.propagateTransaction(newtx);

//		}, 100);
	}
}

module.exports = GameMoves;
