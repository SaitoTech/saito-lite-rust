/*********************************************************************************
 GAME PLAYER


 **********************************************************************************/

class GamePlayers {

	//
	// games can override this 
	//
        returnUsername(publickey="", max = 12) {
		return this.app.keychain.returnUsername(publickey, max);
        }

	addPlayer(address) {
		if (address === '') {
			return 0;
		}
		for (let i = 0; i < this.game.players.length; i++) {
			if (this.game.players[i] === address) {
				return 0;
			}
		}

		this.game.players.push(address);

		if (!this.game.accepted.includes(address)) {
			this.game.accepted.push(address);
		}

		if (this.publicKey !== address) {
			this.game.opponents.push(address);
		}
		return 1;
	}

	removePlayerFromState(address) {
		console.error('Did you define removePlayerFromState in your game module?');
		return null;
	}

	removePlayer(address) {
		if (address === '') {
			return;
		}

		let player_final_state = this.removePlayerFromState(address);

		if (address === this.publicKey) {
			this.app.connection.emit('arcade-gametable-removeplayer',	this.game.id, player_final_state);
			this.game.over = 2; // Hide in arcade...
		}

		for (let i = this.game.players.length - 1; i >= 0; i--) {
			if (this.game.players[i] === address) {
				this.game.players.splice(i, 1);
				this.game.keys.splice(i, 1);
				//this.game.accepted.splice(i, 1);

				if (this.game?.opponent_decks){
					if (this.game.opponent_decks[`${i+1}`]){
						delete this.game.opponent_decks[`${i+1}`];
					}
				}
			}
		}
		for (let i = 0; i < this.game.opponents.length; i++) {
			if (this.game.opponents[i] === address) {
				this.game.opponents.splice(i, 1);
			}
		}

		//
		// reassign player id's
		//
		this.game.player = 0;
		for (let i = 0; i < this.game.players.length; i++) {
			if (this.game.players[i] === this.publicKey) {
				this.game.player = i + 1;
			}
		}

		//
		// track of players removed from the game 
		// WARNING: do not confuse with tx.msg.options.eliminated, which is used for summaries in the Join overlay
		// We aren't using this yet, but doing an object to be consistent...
		//

		if (!this.game.options.eliminated) {
			this.game.options.eliminated = {};
		}
		this.game.options.eliminated[address] = true;

	}

	//
	// If other people are "watching" the game, we want to let all the players
	// know their address, so that game moves can be broadcast to them as well
	//
	addFollower(address) {
		console.log("Adding follower: " + address);
		if (address === '') {
			return;
		}
		if (!this.game.accepted.includes(address)) {
			this.game.accepted.push(address);
			this.saveGame(this.game.id);
		}
	}

	returnLastPlayer(target = this.game.player, max = this.game.players.length) {
		target--;
		if (target < 1) {
			return max;
		}
		return target;
	}

	returnNextPlayer(num = 0) {
		num = parseInt(num) || this.game.player;

		num++;

		if (num > this.game.players.length) {
			return 1;
		}

		return num;
	}

	//////////////////////////////////////////////////////////////////
	// Player Turn is an archaic part of the game engine where we could
	// define a playerTurn function that runs whenever it is your turn
	// (this assumes what you can do at any part of the game is the same)
	// Most games don't rely on it, but it is necessary for simultaneous
	// moves

	nonPlayerTurn() {
		//console.log("it is not my turn!");
		this.hud.updateStatusMessage('Waiting for Opponent to Move');
	}

	playerTurn() {
		let game_self = this;

		console.log(`
  This is the default Player Turn function. It should be replaced in any 
  game by code logic that specifies what players actually do. Their moves
  should be added to the queue using addMove() and then endTurn() to 
  submit those moves to all other players.

  Note that other players will execute the contents of this queue in 
  reverse order. Complicated game moves that require conditional should
  be handled in .

  The PLAY instruction does not "fall-out" automatically (it will keep 
  coming back to the player whose turn it is. This is deliberate design.
  In order to remove this move, RESOLVE command must be issued by the 
  player whose turn it is. This will permit the queue to clear and 
  the game will continue with the next player.
    `);

		game_self.addMove('RESOLVE\t' + this.publicKey);
		game_self.addMove(
			'NOTIFY\tPlayer ' + game_self.game.player + ' has moved'
		);
		game_self.endTurn();
	}



	setPlayerActive(player=null){

		// It doesn't matter how playerTurn gets called, but we know it means
		// that we are waiting on input from this player and we will standardize
		// game.target as flag of whose turn the game is waiting on. 
		if (player == null) {
			this.game.target = this.game.player;
		} else {
			this.game.target = player;
		}

		if (this.game.over == 0) {
			if (this.gameBrowserActive()){
				if (this.useClock) {
					this.startClock(this.game.target);
				}
				if (this.game.target == this.game.player) { 
//
// TODO - make opt-in
//					this.setPlayReminder();
				}
			} else {
				// Notifications will read game from app.options, so need to wait a second to make sure
				// any saveGames complete
				let {id, target, status } = this.game;
				setTimeout(()=> {
					this.app.connection.emit("arcade-notify-player-turn", id, target, status);
				}, 500);
			}
		}
	}

}

module.exports = GamePlayers;
