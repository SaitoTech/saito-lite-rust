/*********************************************************************************
 GAME GAME

  These are the functions for creating instances of a game, saving, and loading them
  The functions for game initialization and end of game processing are also here

 **********************************************************************************/

class GameGame {

	/////////////////////////////////////////////////////////////////////
	// Does a game object of this ID exist in our wallet already??
	//
	doesGameExistLocally(game_id) {
		if (this.app?.options?.games) {
			for (let i = 0; i < this.app.options.games.length; i++) {
				if (this.app.options.games[i].id === game_id) {
					return 1;
				}
			}
		}
		return 0;
	}

	removeGameFromOptions(game_id = '') {
		if (game_id === '') {
			return;
		}
		if (this.app.options?.games) {
			for (let i = 0; i < this.app.options.games.length; i++) {
				if (this.app.options.games[i].id === game_id) {
					this.app.options.games.splice(i, 1);
					i--;
				}
			}
		}
		this.app.storage.saveOptions();
	}

	/**
	 * A stub that one player games fill in
	 * So we can customize the gameWizard to show "Continue Game" instead of create new game
	 * A little complicated if someone starts a chess game then tries to create a second one, so
	 * just return 0.
	 *
	 */
	doWeHaveAnOngoingGame() {
		return 0;
	}

	/**********************************************************************************
	 *  Game Preferences are stored persistently in the wallet,
	 *  so you can implement some basic stats tracking across multiple games or
	 *  just remember that a player likes to play in "advanced" mode or not
	 */

	loadGamePreference(key) {
		if (this.app.options) {
			if (this.app.options.gameprefs) {
				return this.app.options.gameprefs[key];
			}
		}
		return null;
	}

	saveGamePreference(key, value) {
		this.app.options.gameprefs[key] = value;
		this.app.storage.saveOptions();
	}

	deleteGamePreference(key) {
		if (this.app.options) {
			if (this.app.options.gameprefs) {
				if (this.app.options.gameprefs[key]) {
					delete this.app.options.gameprefs[key];
				}
			}
		}
		return null;
	}

	/****************************************************************************************
	 * Creates a new game object for this game module. This object can be JSON-stringified
	 * and saved through the wallet (app.options) so that games can persist across browser
	 * sessions or other network interruptions
	 */
	newGame(game_id = null) {

		console.info('=====CREATING NEW GAME ID: ' + game_id);
		if (!game_id) {
			game_id = this.app.crypto.hash(Math.random().toString(32)); //Returns 0.19235734589 format. We never want this to happen!
			//game_id = this.app.crypto.hash(Math.random());
			//console.log("new id -- " + game_id);
		}
		//console.trace("Creating New Game","ID = "+game_id);
		let game = {};
		game.id = game_id;
		game.confirms_needed = [];
		game.player = 0;
		game.players = [];
		game.opponents = []; //Is this not redundanct?
		game.keys = [];
		game.players_needed = 1; //For when the Arcade (createGameTXfromOptionsGame)
		game.accepted = []; //Not clear what this was originally for, but is now a master list of players to receive game moves
		game.players_set = 0;
		game.target = 1;
		game.invitation = 1;
		game.initializing = 1;
		game.initialize_game_run = 0;
		game.accept = 0;
		game.over = 0;
		game.winner = 0;
		game.module = '';
		game.originator = '';
		game.timestamp = new Date().getTime();
		game.last_block = 0;
		game.options = {};
		game.options.ver = 1;
		game.invite_sig = '';
		game.future = []; // future moves (arrive while we take action)
		game.lock_interface = 0;

		game.clock = [];
		game.time = {};
		game.time.last_received = 0; //For when we last received control of game
		game.time.last_sent = 0; //For when we send our moves

		game.step = {};
		game.step.game = 0; //Trial to start at 0.
		game.step.players = {}; // associative array mapping pkeys to last game step
		game.step.timestamp = 0; // last_move in observer mode

		game.queue = [];
		game.turn = [];
		game.deck = []; // shuffled cards
		game.pool = []; // pools of revealed cards
		game.dice = this.app.crypto.hash(game_id); //Why not just initialize the dice here?

		game.status = ''; // status message
		game.log = [];
		game.sroll = 0; // secure roll
		game.sroll_hash = '';
		game.sroll_done = 0;
		game.spick_card = ''; // card selected
		game.spick_hash = ''; // secure pick (simulatenous card pick)
		game.spick_done = 0;

		return game;
	}

	exportGame() {
		let g = JSON.parse(JSON.stringify(this.game));

                let pom = document.createElement('a');
                pom.setAttribute('type', 'hidden');
                pom.setAttribute(
                    'href',
                    'data:application/json;utf-8,' +
                                                encodeURIComponent(JSON.stringify(g))
                );
                pom.setAttribute('download', `${this.slug}-export.json`);
                document.body.appendChild(pom);
                pom.click();
                pom.remove();
	}

	saveGame(game_id) {
		if (!this.app.BROWSER) {
			return;
		}

		console.log("---------------------");
		console.log("===== SAVING GAME ID: "+game_id);
		console.log("q: " + JSON.stringify(this.game.queue));
		console.log("---------------------");

		if (this.game == undefined) {
			console.warn('Saving Game Error: safety catch 1');
			return;
		}

		// make sure options file has structure to save your game
		if (!this.app.options) {
			this.app.options = {};
		}
		if (!this.app.options.games) {
			this.app.options = Object.assign(
				{
					games: [],
					gameprefs: { random: this.app.crypto.generateKeys() }
				},
				this.app.options
			);
		}

		//console.log("saveGame version: "+this.app.crypto.hash(Math.random()));
		if (!game_id || game_id !== this.game.id) {
			//game_id = this.app.crypto.hash(Math.random().toString(32));
			console.warn('ERR? Save game with wrong id');
			console.warn(
				'Parameter: ' + game_id,
				'this game.id = ' + this.game.id
			);
			return;
		}

		if (game_id != null) {
			if (this.app.options?.games) {
				for (let i = 0; i < this.app.options.games.length; i++) {
					if (this.app.options.games[i].id === game_id) {
						this.game.timestamp = new Date().getTime();

						//
						// sept 25 - do not overwrite any future moves saved separately
						//
						for (
							let ii = 0;
							ii < this.app.options.games[i].future.length;
							ii++
						) {
							let do_we_contain_this_move = 0;
							for (
								let iii = 0;
								iii < this.game.future.length;
								iii++
							) {
								if (
									this.app.options.games[i].future[ii] ===
									this.game.future[iii]
								) {
									do_we_contain_this_move = 1;
								}
							}
							if (do_we_contain_this_move == 0) {
								this.game.future.push(
									this.app.options.games[i].future[ii]
								);
							}
						}

						this.app.options.games[i] = JSON.parse(
							JSON.stringify(this.game)
						); //create new object

console.log("as saved: " + JSON.stringify(this.game.queue));

						this.app.storage.saveOptions();
						return;
					}
				}
			}
		}

		//
		// If we didn't find the game (by id) in our wallet
		// add it and save the options

		this.app.options.games.push(JSON.parse(JSON.stringify(this.game)));
		this.app.storage.saveOptions();
	}

	/**
	 * Will search your wallet for the provided game_id
	 * or the most recent game of the type if a game_id is not provided
	 *
	 * If no game is found, a new game is created, saved, and returned
	 *
	 * Note: "game" refers to the game object
	 */
	loadGame(game_id = null) {

console.log("loading game: " + game_id);

		//
		// try to URL specified game
		//
		if (game_id == null) {

			let hash = this.app.browser.parseHash(window.location.hash);
			if (hash?.gid){
				if (this.app.options?.games?.length > 0) {
					for (let i = 0; i < this.app.options.games.length; i++) {
						if (this.name == this.app.options.games[i].module){
							if (this.app.crypto.hash(this.app.options.games[i].id).slice(-6) == hash.gid){
								game_id = this.app.options.games[i].id;
								break;
							}
						}
					}
				}
			}
		}

		//
		// try to load most recent game
		//
		if (game_id == null) {

			let game_to_open = -1;
			let timeStamp = 0;

			console.log("Game engine: Look for most recent game");

			if (this.app.options?.games?.length > 0) {
				for (let i = 0; i < this.app.options.games.length; i++) {
					//It's not enough to just pull the most recent game,
					//Need to make sure it is the right game module!!
					if (
						this.name == this.app.options.games[i].module &&
						this.app.options.games[i].timestamp > timeStamp
					) {
						game_to_open = i;
						timeStamp = this.app.options.games[i].timestamp;
					}
				}
				if (game_to_open > -1) {
					game_id = this.app.options.games[game_to_open].id;
				}
			}
		}

		//If we were given the game_id or found the most recent valid game, then load it
		if (game_id) {
			for (let i = 0; i < this.app.options?.games?.length; i++) {
				if (this.app.options.games[i].id === game_id) {
					this.game = JSON.parse(
						JSON.stringify(this.app.options.games[i])
					);
					console.log('Loading game: ' + game_id);
					return this.game;
				}
			}

			//No game to load, must create one
			console.warn(`Load failed (${game_id} not found), so creating new game`);
			console.info(JSON.parse(JSON.stringify(this.app.options.games)));

			//we don't have a game with game_id stored in app.options.games
			this.game = this.newGame(game_id);
			this.saveGame(this.game.id);

			return this.game;

		}

		return null;

	}

	/*******************************************************************************************************
	 *          GAME INITIALIZATION
	 *******************************************************************************************************
	 *
	 * Accept Request is the transaction when all players have agreed to play the game with given options
	 * The options and data in tx are processed to create an identical game instance for all players who
	 * are given randomized player order (that is consistent despite being run in parallel on different
	 * lite clients). Upon successful initialization, the game is saved to the wallet and game queue
	 * commands are run. (This is useful for games with card decks that require multiple transactions to
	 * encrypt and shuffle a deck)
	 *
	 */
	async initializeGameFromAcceptTransaction(tx) {
		let txmsg = tx.returnMessage();
		let game_id = txmsg.game_id;

		//
		// accepted games should have all the players. If they do not, drop out
		//
		if (txmsg.players_needed > txmsg.players.length) {
			console.info(
				'ACCEPT REQUEST RECEIVED -- but not enough players in accepted transaction.... aborting'
			);
			return false;
		}

		//
		// ignore games not containing us
		//
		if (!txmsg.players.includes(this.publicKey)) {
			console.info(
				'ACCEPT REQUEST RECEIVED -- but not for a game with us in it!'
			);
			return false;
		}

		//
		// NOTE: re-loading the game might throw out some data
		// But this should create the game
		if (!this.game || this.game.id != game_id) {
			if (this.doesGameExistLocally(game_id)) {
				this.loadGame(game_id);				
			} else {
				this.game = this.newGame(game_id);	
			}
		}

		//
		// async game?
		//
		if (txmsg.options.async_dealing == 1) {
			this.async_dealing = 1;
		}


		if (!txmsg.options?.async_dealing){

console.log("ASYNC DEALING NOT ENABLED");

			//
			// do not re-accept
			if (this.game.step.game > 2) {
				console.warn("ACCEPT IGNORED -- GAME IN PROGRESS");
				return false;
			}

			//
			// validate all accept-sigs are proper
			let msg_to_verify = 'invite_game_' + txmsg.timestamp;

			if (txmsg.players.length == txmsg.players_sigs.length) {
				for (let i = 0; i < txmsg.players.length; i++) {
					if (
						!this.app.crypto.verifyMessage(
							msg_to_verify,
							txmsg.players_sigs[i],
							txmsg.players[i]
						)
					) {
						console.warn(
							'PLAYER SIGS do not verify for all players, aborting game acceptance'
						);
						this.halted = 0;
						return false;
					}
				}
			} else {
				console.warn('Players and player_sigs different lengths!');
				return false;
			}

		}


		// if game is over, exit
		//
		if (this.game.over == 1) {
			this.halted = 0;
			console.warn("This game is over, cannot initialize from accept tx");
			return false;
		}

		//
		// otherwise setup the game
		//
		this.game.options = txmsg.options;
		this.game.module = txmsg.game;
		this.game.originator = txmsg.originator; //Keep track of who initiated the game
		this.game.players_needed = txmsg.players.length; //So arcade renders correctly

		this.gaming_active = 1; //Prevent any moves processing while sorting players

		//
		// add all the players
		//
		for (let i = 0; i < txmsg.players.length; i++) {
			this.addPlayer(txmsg.players[i]);
		}

		this.saveGame(game_id);

		if (this.game.players_set == 0) {

			//
			// set our player numbers alphabetically
			//
			let players = [];
			for (let z = 0; z < this.game.players.length; z++) {
				players.push(
					this.app.crypto.hash(this.game.players[z] + this.game.id)
				);
			}

			players.sort();

			let players_reconstructed = [];
			for (let z = 0; z < players.length; z++) {
				for (let zz = 0; zz < this.game.players.length; zz++) {
					if (
						players[z] ===
						this.app.crypto.hash(
							this.game.players[zz] + this.game.id
						)
					) {
						//For async, accepting player goes first!
						if (this.game.options?.async_dealing && this.game.players[zz] !== txmsg.originator){
							players_reconstructed.unshift(this.game.players[zz]);
						}else{
							players_reconstructed.push(this.game.players[zz]);	
						}
					}
				}
			}
			this.game.players = players_reconstructed;

			for (let i = 0; i < this.game.players.length; i++) {
				//Figure out which seat is mine
				if (this.game.players[i] === this.publicKey) {
					this.game.player = i + 1;
				}

				// defaults to SAITO keys
				// I guess this is useful for something...
				this.game.keys.push(this.game.players[i]);

				//
				//This should automatically add all game opponents to my "contacts"
				//
				if (this.app.BROWSER) {
					this.app.keychain.addWatchedPublicKey(this.game.players[i]);
				}
			}
			//
			// game step
			//
			for (let i = 0; i < this.game.players.length; i++) {
				this.game.step.players[this.game.players[i]] = 0;
			}

			//
			// special key for keystate encryption --> store in game
			//
			this.game.sharekey = this.app.crypto.generateRandomNumber();

			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('!!! GAME CREATED !!!');
			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('Game Id: ' + game_id);
			console.log('My PublicKey: ' + this.publicKey);
			console.log('My Player Number: ' + this.game.player);
			console.log('ALL KEYS: ' + JSON.stringify(this.game.players));
			console.log('My Share Key: ' + this.game.sharekey);
			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('!!!!!!!!!!!!!!!!!!!!');

			this.game.players_set = 1;

			this.saveGame(game_id);

			//
			// players are set and game is accepted, so move into handleGame
			//
			await this.initializeGameQueue(game_id);
		}

		return game_id;
	}

	/*****************************************************************************************************
	 *
	 * ****************************               GAME TERMINATION                ************************
	 *
	 * ***************************************************************************************************
	 *
	 * There are two ways to end a game:
	 * 1) a player sends a "stopgame" request
	 * 2) the player(s) send a "gameover" request
	 *
	 * stopgame may originate in the game through:
	 * a) I know I have reached a losing condition based on non-public information
	 * b) I choose to forfeit/quit the game through a game module provided UI
	 * c) I cancel/forfeit the game through the Arcade or other game invite manager outside the game
	 *
	 *
	 * ****************************************************************************************************/

	/*
  When my game logic shows that I have reached a losing condition and need to notify the opponents
  */
	async sendStopGameTransaction(reason = 'forfeit') {
		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		this.game.accepted.forEach((player) => {
			newtx.addTo(player);
		});
		newtx.msg = {
			request: 'stopgame',
			game_id: this.game.id,
			module: this.game.module,
			reason,
			step: this.game?.step?.game,
			deck: this.game.deck,
		};

		await newtx.sign();

		//Send message
		this.app.network.propagateTransaction(newtx);
		this.app.connection.emit('relay-send-message', {
			recipient: this.game.accepted,
			request: 'game relay update',
			data: newtx.toJson()
		});
		//Send message into the ether so that the arcade service can update the game status to "over"
		this.app.connection.emit('relay-send-message', {
			recipient: 'PEERS',
			request: 'arcade spv update',
			data: newtx.toJson()
		});
	}

	/*
  We receive a transaction (on/off chain) saying that a player hit the quit button
  We figure out who the other players are and if the game has gone beyond its grace period,
  call another function to push us into end game state (which requires another transaction)
  */
	async receiveStopGameTransaction(resigning_player, txmsg) {
		console.log('processing resignation : ' + resigning_player, txmsg);
		this.game.queue = [];
		this.moves = [];

		console.log('this.game = ', this.game);
		//Prevents double processing (from on/off chain)
		if (this.game.over > 0) {
			return;
		}

		console.info(resigning_player, JSON.parse(JSON.stringify(txmsg)));
		console.info(this.game.players, this.game.accepted);


		//Cancelling a game in the arcade to which you are not a player --> unsubscribe from the game
		if (this.game?.players) {
			if (!this.game.players.includes(resigning_player)) {
				//Player already not an active player, make sure they are also removed from accepted to stop receiving messages
				for (let i = this.game.accepted.length; i >= 0; i--) {
					if (this.game.accepted[i] == resigning_player) {
						this.game.accepted.splice(i, 1);
					}
				}

				return 0;
			}
		}

		this.game.over = 2;

		this.saveGame(this.game.id);

		if (this.game.players.length == 1) {
			return;
		}

		let winners = [];

		if (txmsg.reason == 'cancellation') {
			if (resigning_player == this.publicKey) {
				siteMessage(`${this.name} game cancelled`, 5000);
			} else {
				this.updateLog(
					`${this.app.keychain.returnUsername(
						resigning_player
					)} cancels the game, no one wins`
				);
				siteMessage(
					`${this.app.keychain.returnUsername(
						resigning_player
					)} cancels the game, no one wins`,
					8000
				);
			}
		} else {
			for (let p of this.game.players) {
				if (p !== resigning_player) {
					winners.push(p);
				}
			}
		}

		await this.sendGameOverTransaction(winners, txmsg.reason);
	}

	/*
	  Typically run by all the players, so we filter to make sure just one player sends to transaction
	  Can also be used by a player (A) to announce to opponents that A is the winner.
	  Function selects a winner to generate the game ending transaction, which is processed above
	  in receiveGameoverTransaction
	  */
	async sendGameOverTransaction(winner = [], reason = '') {
		console.log('End Game! Winner:', winner);

		let player_to_send = Array.isArray(winner) ? winner[0] : winner;
		player_to_send = player_to_send || this.game.players[0];

		this.game.canProcess = true;

		if (this.gameOverCallback){
			console.log("Not sending gameover transaction because already received. Process now!");
			this.gameOverCallback();
			return null;
		}

		if (this.game.over == 1){
			// already processed a game over transaction don't resend!
			return null;
		}

		let newtx =
			await this.app.wallet.createUnsignedTransactionWithDefaultFee();
		this.game.accepted.forEach((player) => {
			newtx.addTo(player);
		});

		newtx.msg = {
			request: 'gameover',
			game_id: this.game.id,
			winner,
			players: this.game.players.join('_'),
			module: this.game.module,
			reason: reason,
			options: this.game.options,
			step: this.game?.step?.game,
			timestamp: new Date().getTime()
		};

		if (this.game.options?.league_id) {
			newtx.msg.league_id = this.game?.options?.league_id;
		}

		await newtx.sign();

		//Only one player needs to generate the transaction
		if (player_to_send == this.publicKey) {

			console.log('I send gameover tx');

			//Send message
			this.app.network.propagateTransaction(newtx);

			//Send message to other players (or observers) so they can process the gameover code
			this.app.connection.emit('relay-send-message', {
				recipient: this.game.accepted,
				request: 'game relay update',
				data: newtx.toJson()
			});
			//Send message into the ether so that the arcade service can update the game status to "over"
			this.app.connection.emit('relay-send-message', {
				recipient: 'PEERS',
				request: 'arcade spv update',
				data: newtx.toJson()
			});
		
			return 0;
		}

		// We return the tx for async purposes, 
		// so that the loser can pretend they've received it and exit the game
		// but it isn't until the winner processes the end and sends the official tx
		// that leagues are updated
		return newtx;
	}

	/*
  Process receipt of a transaction announcing end-of-game
  Updates the internal game status and through UI notifies all players that the game is over
  For convenience, a displayed <div id="status"> on the game page acquires a button to return player to the arcade
  If elsewhere on the site, uses sitemessage to announce end of game
  If crypto is staked on the game, launches a settlement interface
  */
	async receiveGameoverTransaction(blk, tx, conf, app) {
		let txmsg = tx.returnMessage();
		let { game_id, winner, reason } = txmsg;

		console.info('Received Gameover Request from ' + tx.from[0].publicKey);
		console.log(JSON.stringify(this.game.players));
		//
		// sender must be in game to end it (removed players no problem)
		// Make sure this is only processed once
		//
		if (!this.game.players.includes(tx.from[0].publicKey) || this.game.over == 1) {
			return;
		}

		if (this.game.over == 0 && this.game?.canProcess == false) {
			this.gameOverCallback = () => {
				this.receiveGameoverTransaction(blk, tx, conf, app);
			}
			console.log("Received Gameover Transaction before we were ready... move into callback");
			console.log(this.game.over, this.game.canProcess, this.game.queue);
			return;
		}

		this.game.winner = winner;
		this.game.over = 1;
		this.game.reason = reason;
		this.game.last_block = this.app.blockchain.last_bid;

		if (this.gameBrowserActive()) {
			this.gameOverUserInterface();
		} else {
			if (reason !== 'cancellation') {
				siteMessage(txmsg.module + ': Game Over', 5000);
				this.app.connection.emit('arcade-invite-manager-render-request');
			}
		}

		this.saveGame(this.game.id);

		//////////////////////////////////////////////
		// Here is a good place to add any functions
		// you want to be ran one time on the end of
		// the game.
		//////////////////////////////////////////////
		this.settleGameStake(winner);
		
	}
}

module.exports = GameGame;
