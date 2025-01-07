/****************************************************************
 *
 * An extension of the Game Engine for single player games
 * to facilitate Arcade events like accept game and end game scenarios
 * so that the League Module can function correctly
 *
 *
 ***************************************************************/

let saito = require('../saito/saito');
let GameTemplate = require('./gametemplate');

class OnePlayerGameTemplate extends GameTemplate {
	constructor(app) {
		super(app);

		this.minPlayers = 1;
		this.maxPlayers = 1;
		this.can_bet = 0;
		this.statistical_unit = 'deal';
		this.enable_observer = false;
	}

	returnState() {
		let lifetime = {};
		if (this.loadGamePreference(this.name + '_stats')) {
			lifetime = this.loadGamePreference(this.name + '_stats');
		} else {
			lifetime.round = 0;
			lifetime.wins = 0;
			lifetime.losses = 0;
		}

		let state = {
			session: {},
			lifetime: {}
		};

		state.session.round = 0;
		state.session.wins = 0;
		state.session.losses = 0;

		state.lifetime = lifetime;
		return state;
	}

	// Create an exp league for single player games by default
	respondTo(type) {
		if (type == 'default-league') {
			let obj = super.respondTo(type);
			obj.ranking_algorithm = 'EXP';
			obj.default_score = 0;
			return obj;
		}
		return super.respondTo(type);
	}

	returnStatsHTML(title = null, adjustment = 0) {
		if (!title) {
			title = this.gamename + ' Stats';
		}
		let html = `<div class="solitaire-stats-overlay">
      <h1>${title}</h1>
      <hr>
      <div class="saito-table">
        <div class="saito-table-header">
          <div class="saito-table-row">
            <div></div>
            <div>Session</div>
            <div>Lifetime</div>        
          </div>
        </div>
        <div class="saito-table-body">
          <div class="saito-table-row">
            <div class="saito-table-label">Games Played:</div>
            <div>${this.game.state.session.round + adjustment} </div>
            <div>${this.game.state.lifetime.round + this.game.state.session.round + adjustment} </div>
          </div>
          <div class="saito-table-row">
            <div class="saito-table-label">Games Won:</div>
            <div>${this.game.state.session.wins} </div>
            <div>${this.game.state.lifetime.wins + this.game.state.session.wins} </div>
          </div>
          <div class="saito-table-row">
            <div class="saito-table-label">Win Rate (%):</div>
            <div>`;

     if (this.game.state.session.round + adjustment > 0){
     	html += Math.round(	(1000 * this.game.state.session.wins) /	(this.game.state.session.round + adjustment) ) / 10;
     }else{
     	html += 0;
     }
				
			html +=`</div><div>`

			if (this.game.state.lifetime.round + this.game.state.session.round + adjustment > 0){
				html += Math.round(
			(1000 *	(this.game.state.lifetime.wins +	this.game.state.session.wins)) /
								(this.game.state.lifetime.round +	this.game.state.session.round + adjustment)
					  ) / 10;
			}else{
				html += 0;
			}
		
		html += `</div>
          </div>
        </div>
      </div>
      <div class="stats-menu-controls"></div>
    </div>`;
		return html;
	}

	async render(app) {
		if (this.game.player == 0) {
			let c = await sconfirm(
				'This is not a valid game! Return to Arcade'
			);
			if (c) {
				navigateWindow('/arcade');
			}
			return;
		}

		this.game.over = 0;

		this.saveGame(this.game.id);

		await super.render(app);
	}

	doWeHaveAnOngoingGame() {
		if (this.app?.options?.games) {
			for (let i = 0; i < this.app.options.games.length; i++) {
				if (this.app.options.games[i].module === this.name) {
					if (this.app.options.games[i].over !== 1) {
						this.game = JSON.parse(
							JSON.stringify(this.app.options.games[i])
						);
						console.log('Found a live game in my options');
						//this.loadGame(game_id);
						return 1;
					}
				}
			}
		}
		return 0;
	}

	//initializeSinglePlayerGame(game_data) {
	async initializeGameFromAcceptTransaction(tx) {
		let txmsg = tx.returnMessage();
		let game_id = txmsg.game_id;

		//Load last session
		if (!this.loadGame()){
			this.loadGame(game_id);
		}

		//Then overwrite with new id
		this.game.id = game_id;

		this.game.module = this.name;
		this.game.options = txmsg.options;
		this.game.originator = txmsg.originator; //Keep track of who initiated the game
		this.game.players_needed = 1; //So arcade renders correctly

		/*
    So people can close (i.e. hide) solitaire games between sessions, but we want the game to persist
    in the wallet (for localized long term stats tracking), we toggle between game.over = 0 and game.over = 2
    (over = 1 is reserved for when the game is over and cannot be played further and will/may trigger deletion)
    */
		this.game.over = 0;

		if (this.game.players_set == 0) {
			this.game.players = [];

			this.game.players.push(this.publicKey);
			this.game.accepted = this.game.players;
			this.game.step.players[this.publicKey] = 1;
			this.game.players_set = 1;
			this.game.player = 1;

			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('!!! SINGLE PLAYER GAME CREATED !!!');
			console.log('!!!!!!!!!!!!!!!!!!!!');

			console.log('My Public Key: ' + this.publicKey);
			console.log('My Position: ' + this.game.player);
			console.log('ALL KEYS: ' + JSON.stringify(this.game.players));
			console.log('saving with id: ' + game_id);
			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('!!!!!!!!!!!!!!!!!!!!');
		} else {
			console.log('!!!!!!!!!!!!!!!!!!!!');
			console.log('!!! CONTINUING SINGLE PLAYER GAME !!!');
			console.log('!!!!!!!!!!!!!!!!!!!!');
		}

		this.saveGame(game_id);
		await this.initializeGameQueue(game_id);

		/*
    //
    // single player games with undefined game ids will hash to this dice
    //
    // ... in which case we want to set it randomly
    //
    if (this.game.dice === "dba5865c0d91b17958e4d2cac98c338f85cbbda07b71a020ab16c391b5e7af4b") {
      // single player games do not necessarily have a proper
      // game-id supplied, so we set the dice to a random source
      // on initialize if needed.
      this.game.dice = this.app.crypto.hash(Math.random());
    }
    */

		return this.game.id;
	}

	exitGame() {
		//Force these
		this.halted = 0;
		this.gaming_active = 0;

		this.updateStatusWithOptions('Saving game to the blockchain...');
		this.prependMove('EXITGAME');
		this.endTurn();
	}

	async receiveStopGameTransaction(resigning_player = null, txmsg = null) {
		if (this.game.over > 0) {
			if (resigning_player == this.publicKey && txmsg) {
				console.log(
					'Receiving quit message from Arcade, delete game from wallet'
				);
				this.removeGameFromOptions(this.game.id);
			}
			return;
		}

		let msg = 'cancellation';
		console.log(JSON.parse(JSON.stringify(this.game.state)));
		if (
			this.game.state?.session?.wins >= 0 &&
			this.game.state?.session?.losses >= 0
		) {
			msg = `Wins: ${this.game.state.session.wins}, Losses: ${this.game.state.session.losses}`;
		}
		if (this.game.state?.scores) {
			msg = 'Scores: ' + this.game.state.scores.join(', ');
		}
		this.game.over = 2;

		this.sendGameOverTransaction([], msg);
	}

	receiveGameoverTransaction(blk, tx, conf, app) {
		console.log('The game never ends when you play by yourself');

		try {
			if (this.game.state?.session) {
				for (let x in this.game.state.session) {
					this.game.state.lifetime[x] += this.game.state.session[x];
					this.game.state.session[x] = 0;
				}
			}
			if (this.game.state?.scores) {
				this.game.state.scores = [];
			}
		} catch (err) {
			console.error(err);
		}

		this.saveGamePreference(this.name + '_stats', this.game.state.lifetime);

		this.game.queue.push('READY');
		this.game.moves = [];
		this.saveGame(this.game.id);

		if (this.browser_active && this.request_exit) {
			siteMessage('Game saved, exiting now', 750);
			setTimeout(() => {
				super.exitGame();
			}, 750);
		}

		return;
	}

	/**
	 * Definition of core gaming logic commands
	 */
	initializeQueueCommands() {
		//Take all Game Engine Commands
		super.initializeQueueCommands();

		//Add some more ones
		this.commands.push((game_self, gmv) => {
			if (gmv[0] === 'EXITGAME') {
				game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
				game_self.saveGame(game_self.game.id);
				game_self.request_exit = true;

				//
				// We want to auto-close single player games when we exit
				// which is basically resigning the game session
				//
				game_self.receiveStopGameTransaction();
				//Don't need to await because returning 0 and stopping the queue
				return 0;
			}

			return 1;
		});
	}
}

module.exports = OnePlayerGameTemplate;
