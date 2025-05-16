/****************************************************************
 *
 * An extension of the Game Engine for special games like
 * Poker or Blackjack where you want to start a game with
 * 2 players, but have open slots on the table that other
 * players can join at a later time. Meanwhile, players can
 * stop playing without ending the game
 *
 *
 ***************************************************************/

const Transaction = require('../../lib/saito/transaction').default;
const GameTemplate = require('./gametemplate');
const SaitoOverlay = require('./../saito/ui/saito-overlay/saito-overlay');

class GameTableTemplate extends GameTemplate {
	constructor(app) {
		super(app);

		this.can_bet = 1;
		this.crypto_msg = 'settles round-by-round';

		this.opengame = true;
		//
		// We will use this as a flag for Arcade to distinguish between parent and child class
		// players still need to select 'open-game' through the Arcade game wizard to fully realize
		// differential behavior
		//

		this.toJoin = [];
		this.toLeave = [];
		this.statistical_unit = 'hand';
		this.resetCommand = 'newround';
		this.exitOverlay = new SaitoOverlay(app, this, false);
	}

	initializeGame() {
		super.initializeGame();
	}

	async render(app) {
		if (!this.game.options['open-table']) {
			console.log('Treat table game as standard game');
			this.opengame = false;
		}

		await super.render(app);
	}

	// Extension for table games
	receiveMetaMessage(tx) {
		if (!tx.isTo(this.publicKey)) {
			console.warn("processing a tx that isn't addressed to us...");
		}

		let txmsg = tx.returnMessage();

		if (txmsg.request == 'JOIN') {
			console.log('Join request:' + txmsg.my_key);
			if (!this.toJoin.includes(txmsg.my_key)) {
				this.toJoin.push(txmsg.my_key);
				siteMessage(
					`${
						this.publicKey == txmsg.my_key
							? 'You'
							: app.keychain.returnUsername(txmsg.my_key)
					} will be dealt in next hand`,
					2500
				);
			}
			console.log(JSON.stringify(this.toJoin));
			return;
		}

		if (txmsg.request == 'LEAVE') {
			console.log('Leave request:' + txmsg.my_key);
			if (!this.toLeave.includes(txmsg.my_key)) {
				this.toLeave.push(txmsg.my_key);
				siteMessage(
					`${
						this.publicKey == txmsg.my_key
							? 'You'
							: app.keychain.returnUsername(txmsg.my_key)
					} will leave the table after this hand`,
					2500
				);
			}
			return;
		}

		if (txmsg.request == 'CANCEL') {
			this.toJoin = this.toJoin.filter((key) => key !== txmsg.my_key);
			this.toLeave = this.toLeave.filter((key) => key !== txmsg.my_key);
			siteMessage(`${app.keychain.returnUsername(txmsg.my_key)} changed their mind`, 2500);
			return;
		}

		if (txmsg.request == 'SETTLEMENT') {
			console.log(`${tx.from[0].publicKey} requested we settle at the end of the round`);
			this.settleNow = true;
			siteMessage('Will settle at the end of the round', 1500);
			return;
		}

		super.receiveMetaMessage(tx);
	}

	addPlayerLate(address) {
		if (!this.addPlayer(address)) {
			return;
		}
		//To add a player after the game started,
		// need to assign this.game.player
		// add key
		if (this.publicKey === address) {
			this.game.player = this.game.players.length;
		}
		this.game.keys.push(address);
	}

	addPlayerToState(address) {
		console.error('Did you define addPlayerToState in your game module?');
	}

	refreshPlayerboxes() {
		console.error('Did you define refreshPlayerboxes in your game module?');
	}

	async receiveStopGameTransaction(resigning_player, txmsg) {
		//End game if only two players
		if (this.game.players.length == 2) {
			await super.receiveStopGameTransaction(resigning_player, txmsg);
			return;
		}

		if (this.publicKey === resigning_player) {
			this.game.over = 2;
			this.saveGame(this.game.id);
		}

		//Stop receiving game txs
		if (!this.game.players.includes(resigning_player)) {
			//Player already not an active player, make sure they are also removed from accepted to stop receiving messages
			for (let i = this.game.accepted.length; i >= 0; i--) {
				if (this.game.accepted[i] == resigning_player) {
					this.game.accepted.splice(i, 1);
				}
			}
			console.log(resigning_player + ' not in ', this.game.players);
			this.saveGame(this.game.id);

			return;
		}

		//Schedule to leave at end of round
		if (!this.toLeave.includes(resigning_player)) {
			this.toLeave.push(resigning_player);
		}
	}

	//
	// Overwrite gametemplate-web3 function because these games are more complicated
	// Todo: check that there is no remaining debt
	//
	settleGameStake(winners) {
		return;
	}

	resetGameWithFewerPlayers() {
		console.log('!!!!!!!!!!!!!!!!!!!!');
		console.log('!!! GAME UPDATED !!!');
		console.log('!!!!!!!!!!!!!!!!!!!!');
		console.log('My Public Key: ' + this.publicKey);
		console.log('My Position: ' + this.game.player);
		console.log('ALL PLAYERS: ' + JSON.stringify(this.game.players));
		console.log('ALL KEYS: ' + JSON.stringify(this.game.keys));
		console.log('saving with id: ' + this.game.id);
		console.log('!!!!!!!!!!!!!!!!!!!!');
		console.log('!!!!!!!!!!!!!!!!!!!!');
		console.log('!!!!!!!!!!!!!!!!!!!!');

		this.game.queue = [this.resetCommand];
		this.game.live = true;
		this.saveGame(this.game.id);

		setTimeout(() => {
			console.log('Re-initialize game with different players');
			this.initialize_game_run = 0;
			this.halted = 0;
			this.refreshPlayerboxes();
			this.initializeGameQueue(this.game.id);
		}, 1000);
	}

	exitConfirmationTemplate() {
		return `<div class="saito-modal saito-modal-menu game-exit-menu" id="saito-exit-menu">
     				<div class="saito-modal-title">Exit Game / Leave Table</div>
     				<div class="saito-modal-content">
     					<div class="saito-modal-menu-option" id="stay">
     						<i class="fa-solid fa-play"></i>
     						<div class="option-keyword">Continue playing</div>
     					</div>
     					<div class="saito-modal-menu-option" id="finish">
     						<i class="fa-solid fa-forward-step"></i>
     						<div class="option-keyword">Finish Hand<span>--</span><span class="option-explanation">play out the hand and then leave</span></div>
     					</div>
     					<div class="saito-modal-menu-option" id="forfeit">
     						<i class="fa-solid fa-door-open"></i>
     						<div class="option-keyword">Leave now<span>--</span><span class="option-explanation">abandon any active bets and quit the game</span></div>
     					</div>
     				</div>
     			</div>`;
	}

	async exitGame() {
		if (this.game.over == 0 && this.game.player && this.game.options['open-table']) {
			//this.game.state.passed[loser - 1] = 1;

			this.exitOverlay.show(this.exitConfirmationTemplate());
			this.exitOverlay.blockClose();

			let game_self = this;
			$('.saito-modal-menu-option').off();
			$('.saito-modal-menu-option').on('click', async function () {
				let choice = $(this).attr('id');
				game_self.exitOverlay.remove();
				if (choice == 'stay') {
					return;
				}
				if (choice == 'forfeit') {
					await game_self.sendStopGameTransaction('withdraw');
					game_self.game.over = 2;
					game_self.removePlayer(game_self.publicKey);
					game_self.saveGame(game_self.game.id);
					setTimeout(() => {
						//Recursive but will call super because changed the flag
						game_self.exitGame();
					}, 500);
				}
				if (choice == 'finish') {
					game_self.sendMetaMessage('LEAVE');
				}
			});
		} else {
			super.exitGame();
		}
	}

	/**
	 * Definition of core gaming logic commands
	 */
	initializeQueueCommands() {
		//Take all Game Engine Commands
		super.initializeQueueCommands();

		this.commands.unshift((game_self, gmv) => {
			if (gmv[0] === this.resetCommand) {
				if (this.game.player) {
					this.cacheGame = JSON.parse(JSON.stringify(this.game));
					//clear out cards
					this.cacheGame.deck = [];
					this.cacheGame.pool = [];
					console.log('POKERTABLE: Save game state...', this.cacheGame);
				}
			}
			return 1;
		});

		//Add some more ones
		this.commands.push((game_self, gmv) => {
			if (gmv[0] === 'ADDPLAYER') {
				let pkey = gmv[1];

				game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

				console.log('Adding ' + pkey + ' to game');

				this.addPlayerLate(pkey); // Adds player to game
				this.addPlayerToState(pkey);
				this.updateLog('================');
				this.updateLog(
					`${this.app.keychain.returnUsername(pkey)} joins the table as Player ${
						this.game.players.length
					}`
				);
				if (pkey === this.publicKey) {
					this.app.connection.emit('arcade-gametable-addplayer', this.game.id);
				}

				// Clear toJoin
				for (let j = this.toJoin.length - 1; j >= 0; j--) {
					if (this.toJoin[j] == pkey) {
						this.toJoin.splice(j, 1);
					}
				}
			}
			return 1;
		});

		this.commands.push((game_self, gmv) => {
			if (gmv[0] === 'REMOVEPLAYER') {
				let pkey = gmv[1];

				game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

				console.log('Removing ' + pkey + ' from game');
				let i = this.game.players.indexOf(pkey);

				this.updateLog(
					`Player ${i + 1} (${this.app.keychain.returnUsername(pkey)}) leaves the table.`
				);
				this.removePlayer(pkey);

				if (pkey == this.publicKey) {
					this.updateStatusForPlayerOut('You cashed out of the table game');
				}
			}
			return 1;
		});

		this.commands.push((game_self, gmv) => {
			if (gmv[0] === 'RESTARTGAME') {
				this.toLeave = [];

				game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

				if (game_self.game.players.length === 1) {
					this.game.queue.push('checkplayers');
					return 1;
				}

				this.halted = 1;

				this.resetGameWithFewerPlayers();
				return 0;
			}
			return 1;
		});

		this.commands.push((game_self, gmv) => {
			if (gmv[0] === 'PLAYERS') {
				console.log(this.toLeave, this.toJoin);

				let change = this.toLeave.length + this.toJoin.length > 0;

				game_self.game.queue.splice(game_self.game.queue.length - 1, 1);

				if (change) {
					let player_to_send = 0;
					for (let i = 0; i < this.game.players.length; i++) {
						if (!this.toLeave.includes(this.game.players[i])) {
							player_to_send = i + 1;
							break;
						}
					}

					console.log(`Player ${player_to_send} will send the moves to reset the table`);
					//Player one handles the move
					if (this.game.player == player_to_send) {
						let player_count = this.game.players.length;

						this.addMove('RESTARTGAME');

						for (let pkey of this.toLeave) {
							if (this.game.players.includes(pkey)) {
								this.addMove(`REMOVEPLAYER\t${pkey}`);
								player_count--;
							}
						}

						for (let i = 0; i < this.toJoin.length && player_count++ < this.maxPlayers; i++) {
							let pkey = this.toJoin[i];
							this.addMove(`ADDPLAYER\t${pkey}`);
						}

						this.endTurn();
					}

					return 0;
				}
			}
			return 1;
		});
	}
}

module.exports = GameTableTemplate;
