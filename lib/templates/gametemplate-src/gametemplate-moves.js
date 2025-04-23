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


	//
	// experimental function around converting counter_or_acknowledge commands to 
	// ackwnoledge commands after a certain period of delay to permit faster gameplay
	// i.e. you have N seconds to respond, after which the other player can move
	// and your counter_or_acknowledge is just acknowledging.
	//
	// a late player might have a RESOLVE queued in Future Moves and process it after
	// processing an intervention like Gout in HIS that clears the counter_or_acknowledge
	// such that RESOLVE destroys the consistency of the queue.
	//
	async hasMyResolvePending() {

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
							for (let i = 0; i < txmsg.turn.length; i++) {
								if (txmsg.turn[i].indexOf("RESOLVE") >= 0) {
									return 1;
								}
							}

						}
					}
				}
			}
		}

		if (this.game?.future) {
                	for (let z = 0; z < this.game.future.length; z++) {
                		let ftx = new Transaction();
                        	ftx.deserialize_from_web(this.app, this.game.future[z]);
				if (ftx.from[0].publicKey == this.game.players[this.game.player-1]) {
					let ftxmsg = ftx.returnMessage();
					if (ftxmsg && ftxmsg.module == this.name) {
						if (ftxmsg.game_id === this.game?.id) {
	                       				for (let i = 0; i < ftxmsg.turn.length; i++) {
                        			        	if (ftxmsg.turn[i].indexOf("RESOLVE") >= 0) { 

									//
									// we have a resolve move in pending, but if this is an older move
									// then we want to discard it.
									//
									if (this.isUnprocessedMove(this.game.player, ftxmsg)) {
										return 1;
									} else {
									}

								}
		 					}
		 				}
		 			}
		 		}
		 	}
		}

		return 0;

	}


	/**
	 * Check what moves are pending in my wallet and if any of them are future moves
	 * (I sent, but haven't received and processed) return 1
	 */
	async getPendingGameMoves() {

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
							} else {
								if (!this.pending.includes(tx)){
									this.pending.push(tx);	
								}
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

	//
	// 1 = yes
	// 0 = unsure
	// -1 = no
	//
	isUnprocessedMoveQuickCheck(publickey, step, gameid) {

	  if (!this.app.options) { return 0; }
	  if (!this.app.options.games) { return 0; }

	  let gameobj = null;

	  for (let z = 0; z < this.app.options.games.length; z++) {
	    if (this.app.options.games[z].id === gameid) {
	      gameobj = this.app.options.games[z];
	    }
	  }

	  if (!gameobj == null) { return -1; }
	  if (!gameobj.step) { return 0; }
	  if (!gameobj.step.players) { return 0; }
	  if (gameobj.step.players[publickey] < step) { return 1; }
	  if (gameobj.step.players[publickey] >= step) { return -1; }
	  return 0;
	}

	/*
	  Is this tx the next game move? It should have a step exactly one more than the main game
	  or it should be more than my last move as a player
	  @param player - the public key address of the player
	*/
	isUnprocessedMove(player, txmsg) {

		let tx_step = parseInt(txmsg.step.game) - 1;


		if (txmsg.game_id !== this.game.id) {
//console.log("not processing as game ids differ: " + txmsg.game_id + " / " + this.game.id);
			return 0;
		}

		if (tx_step == this.game.step.game) {
//console.log("identified as next move -- (tx_step-1) is: " + tx_step + " which means we are 1 step ahead of game step of... " + this.game.step.game);
			return 1;
		}


		if (this.game.step.players[player] !== undefined) {

//console.log("p-step: " + (tx_step) + " (-1 applied)");
//console.log("g-step: " + this.game.step.game + " ---> " + JSON.stringify(this.game.step.players));

			if (tx_step == this.game.step.players[player]) {
//console.log("... YES .. tx_step exactly 1 bigger than last player step (" + this.game.step.players[player] + ")");
				return 1;
			} else {
//console.log("... NO ... received step is not +1 than last player move: --> current: " + this.game.step.players[player] + " ---> tx_step (-1 modified) " + tx_step);
			}

			//
			// this is our classic check, which means that the tx_step we received is NOT larger than the game step itself
			// so our error with SIMULTANEOUS moves is likely somewhere in here, because on occasion we seem to receive
			// a resolve that is valid but fits the first criteria (advance in our move) but also is +1 ahead of the current
			// game step. i.e. tx_step == 
			//
			// it used to be this, but maybe P1's move shifts step.game so that it gets ignored
			if (
				tx_step > this.game.step.players[player] &&
				tx_step < this.game.step.game
			) {
//console.log("... YES .. player-step is +2 ahead, but equals game-step");
				return 1;
			}

			if (
				tx_step > this.game.step.players[player] &&
				tx_step == this.game.step.game
			) {
//console.log("... YES .. player-step is +2 ahead, but exactly +1 game-step");
				return 1;
			}

		}

		return 0;
	}

	fetchRecentMoves() {

/*****
                let query = this.module + '_' + this.game.id;

                this.app.storage.loadTransactions(
                	{
                        	field1: query
                        },
                        async (txs) => {
                        	for (let i = txs.length - 1; i >= 0; i--) {
                                	await this.onConfirmation(-1, txs[i], 0);
                                }
                        },
                );
****/
	}


	async addNextMove(gametx) {

		let gametxmsg = gametx.returnMessage();

		if (
			this.halted == 1 ||
			this.gaming_active == 1 ||
			this.game.initialize_game_run == 0
		) {
			console.info(
				`This is next Move, but save as future move because halted (${this.halted}) or active (${this.gaming_active}) or not initialized (${this.game.initialize_game_run}): ${JSON.stringify(gametxmsg)}`
			);

			await this.addFutureMove(gametx);
			return;
		}

		this.game.step.players[gametx.from[0].publicKey] = gametxmsg.step.game;

		if (gametxmsg.step.game > this.game.step.game) {
			this.game.step.game = gametxmsg.step.game;
			this.game.step.timestamp = gametxmsg.step.timestamp;
			this.stopClock(this.game.players.indexOf(gametx.from[0].publicKey) + 1);
		}

		// reset turn on receiving it back
		this.game.turn = [];

		if (this.gameBrowserActive()){
			window.location.hash = this.app.browser.modifyHash(
				window.location.hash,
				{
					step: gametxmsg.step.game
				}
			);
		}


		//
		// ADDED JULY 31, 2024
		//
		// ASYNC games may receive Next Move while the game is not technically initialized, in 
		// which case we want to make sure the game has initialized (prepared the data objects
		// and processed any outstanding game moves in the queue
		//
		// to avoid problems, only do this if not in game
		//
		if (!this.browser_active) {
			await this.initializeGameQueue(this.game.id);
		}

		//
		// OBSERVER MODE -
		//
		if (this.game.player == 0) {
			if (this.gameBrowserActive()) {
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

			console.info(`Add next move (${gametxmsg.step.game}, ${this.app.keychain.returnUsername(gametx.from[0].publicKey)}): `, gametxmsg.turn);

			this.saveFutureMoves(this.game.id);
			this.saveGame(this.game.id);
			await this.startQueue();
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
			this.game.future.push(ftx);
			this.saveFutureMoves(this.game.id);

			if (this.game.player == 0 && this.gameBrowserActive()) {
				try {
					if (this.observerControls.is_paused || this.halted) {
						this.observerControls.showNextMoveButton();
						this.observerControls.updateStatus('New future move');
					} else if (!this.gaming_active && this.archive_exhausted > 0) {
						console.log("Added future move when game seems stuck...");
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

		// this is always called after runQueue which locks the queue for newMoves while processing
		// but there are multiple paths out of the queue, so we unlock it here
		this.gaming_active = 0;

		if (this.game.futurePlus && this.game.futurePlus[this.game.step.game]){
			console.warn("Execute meta game transaction");
			await this.handlePeerTransaction(this.app, this.game.futurePlus[this.game.step.game]);
			delete this.game.futurePlus[this.game.step.game];
		}


		if (this.halted == 1 || this.game.initialize_game_run == 0) {
			console.info(
				`Unable to process future moves now because halted (${this.halted}) or gamefeeder not initialized (${this.initialize_game_run})`
			);
			console.info(`${this.game.future.length} future moves saved`);
			return -1;
		}

		console.info(`Check ${this.game.future.length} future moves for next one...`);

		//Search all future moves for the next one
		for (let i = 0; i < this.game.future.length; i++) {

			let ftx = new Transaction();
			ftx.deserialize_from_web(this.app, this.game.future[i]);
			let ftxmsg = ftx.returnMessage();

			if (this.isUnprocessedMove(ftx.from[0].publicKey, ftxmsg)) {
				console.info(
					`Found FTMSG (${ftxmsg.step.game}): ` + JSON.stringify(ftxmsg.turn)
				);

				//This move (future[i]) is the next one, move it to the queue
				this.game.future.splice(i, 1);
				this.observerControls.updateStatus('Advanced one move');
				await this.addNextMove(ftx);
				return 1;
			} else if (this.isFutureMove(ftx.from[0].publicKey, ftxmsg)) {
				//console.info("Is future move, leave on future queue");
				//This move (future[i]) is still for the future, so leave it alone
			} else {
				//Old move, can ignore
				this.game.future.splice(i, 1);
				i--; // reduce index as deleted
			}
		}

		this.saveFutureMoves(this.game.id);

		if (this.game.future?.length > 0) {
			console.info(`We have ${this.game.future.length} future moves, but NOT the next one!`);
			this.archive_exhausted = -1;
		}

		if (this.game.player == 0 && this.archive_exhausted <= 0){
			//param prevents endless looping
			console.info('Observer.... check for additional moves... after processing future moves');
			this.observerDownloadNextMoves(() => {
				this.processFutureMoves();	
			});
		}


		return 0; //No processable moves in future
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
	async endTurn(nextTarget = 0) {
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

		//
		// AWAIT on this causes issues -- delays UI update
		//
		this.sendGameMoveTransaction('game', extra);
	}

	async sendGameMoveTransaction(
		type = 'game',
		extra = {},
		mycallback = null
	) {

		//
		// TODO - avoid browser overheating
		//
		// adding a minor delay here allows JQUERY to execute
		// out-of-order, so that the board and UI can update
		// before we take back control.
		//
		let turn = this.game.turn;

		this.stopClock(this.game.player); //Don't penalize the player for this minor timeout

		// Debugging
		if (this.halted){
			console.error("Attempting to send a game move from a halted state");
		}

		let privateKey = await this.app.wallet.getPrivateKey();

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

				turn.slice().unshift('SECUREROLL_END');
				turn.push(
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
			for (let i = 0; i < turn.length; i++) {
				if (turn[i] == 'READY') {
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
				ns.timestamp = this.game.time.last_sent;
				mymsg.step = ns;
			}


console.info("#");
console.info("# sending MOVE w/ step: " + JSON.stringify(ns) + " - " + this.publicKey);
console.info("#");

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
					this.app.wallet.returnCryptoAddressByTicker(
						game_self.game.crypto
					);

				if (crypto_key !== this.game.keys[this.game.player - 1]) {
					turn.push(
						`CRYPTOKEY\t${
							this.publicKey
						}\t${crypto_key}\t${await this.app.crypto.signMessage(
							crypto_key,
							privateKey
						)}`
					);
				}
			}

			mymsg.request = type;
			mymsg.turn = turn;
			mymsg.module = this.name;
			mymsg.game_id = this.game.id;
			mymsg.player = this.game.player;
			mymsg.extra = extra;

			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee();
			if (newtx == null) {
				salert('ERROR: Difficulty Sending Transaction, please reload');
				return;
			}

			for (let i = 0; i < this.game.accepted.length; i++) {
				newtx.addTo(this.game.accepted[i]);
			}

			newtx.msg = mymsg;
			await newtx.sign();

//
// we traditionally add the transaction to pending before saving the wallet, so that
// if there is an issue with the network we don't lose the transaction when the network
// comes back online. refreshing the browser will also try to auto-resend the tx this way.
//
			game_self.app.wallet.addTransactionToPending(newtx);
			//
			// await here seems to sometimes trigger game engine to continue
			// which can result in moves = [] becoming empty and we lose 
			// our resolve...
			//
			//await game_self.app.wallet.addTransactionToPending(newtx);
			game_self.saveGame(game_self.game.id);

			console.info('Sending Move: ', JSON.parse(JSON.stringify(mymsg)));

			//
			// send off-chain if possible - step 2 onchain to avoid relay issues with options
			//
			if (
				this.relay_moves_offchain_if_possible &&
				send_onchain_only == 0
			) {
				//
				// only game moves to start
				//
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

	}

	async observerDownloadNextMoves(mycallback = null) {
		// purge old transactions
		for (let i = this.game.future.length - 1; i >= 0; i--) {
			let queued_tx = new Transaction();
			queued_tx.deserialize_from_web(this.app, this.game.future[i]);
			let queued_txmsg = queued_tx.returnMessage();

			if (
				queued_txmsg.step.game <= this.game.step.game &&
				queued_txmsg.step.game <= this.game.step.players[queued_tx.from[0].publicKey]
			) {
				console.info('Trimming future move to download new ones:', JSON.stringify(queued_txmsg));
				this.game.future.splice(i, 1);
			}
		}

		if (!this.archive_connected){
			console.log("Haven't established peer yet, try again after 3s");		
			setTimeout(()=>{ 
				this.observerDownloadNextMoves(mycallback)
			}, 3000);
			return null;
		}

		if (this.archive_exhausted < 0) {
			console.log("Try archives after 10s delay");
			setTimeout(()=>{ 
				this.archive_exhausted = 0;
				this.observerDownloadNextMoves(mycallback)
			}, 10000);
			return null;
		}

		let currentStep = String(this.game.step.game).padStart(5, '0');

		console.log(`Load game moves from archive (${this.archive_exhausted}): ${this.name}_${this.game.id} from ${this.game.originator} after ${currentStep}`);

		return this.app.storage.loadTransactions(
			{ field1: this.name, field4: this.game.id, field5: currentStep, ascending: 1, limit: 20 },
			async (txs) => {

				let new_moves = 0;

				for (let tx of txs) {
					let game_move = tx.returnMessage();

					if (game_move?.step && game_move.request == "game"){
						let loaded_step = game_move.step.game;

						if (
							loaded_step > this.game.step.game ||
							loaded_step > this.game.step.players[tx.from[0].publicKey]
						) {

							let ftx = tx.serialize_to_web(this.app);

							if (!this.game.future.includes(ftx)) {
								this.game.future.push(ftx);
								new_moves++;
								console.log('Archived move: ' + JSON.stringify(game_move));
							}
						}
					} else {
						console.warn("Non game move: ", game_move);

    						let rtx = new Transaction();
						rtx.msg.module = "Relay";
						rtx.msg.request = 'game relay update';
						rtx.msg.data = tx.toJson();

						if (!this.game.futurePlus) {
							this.game.futurePlus = {};
						}

						this.game.futurePlus[game_move.step] = rtx;
					}

				}
				
				console.log(`Found ${new_moves} future moves in archives. Initializing? `, this.game.initializing);
				
				this.saveFutureMoves(this.game.id);
				this.saveGame(this.game.id);

				if (new_moves == 0) {

					if (this.game.initializing){
						// Allow delayed looping when getting initial moves...
						this.archive_exhausted = -1;
					}else{
						this.archive_exhausted = 1;
					}
					
					if (this.game.player == 0 && this.gameBrowserActive()){
						this.observerControls.render();
					}
				}

				if (mycallback) {
					console.log("Run callback after fetching archives...");
					mycallback();
				}
			}
		);
	}

}

module.exports = GameMoves;
