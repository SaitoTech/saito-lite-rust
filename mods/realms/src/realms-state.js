
	returnState() {
		let state = {};

		state.players = [2];
		for (let i = 0; i < 2; i++) {
			state.players[i] = {
				health: 20,
				mana: 0, 
				land: [],
				creature: [],
				artifact: [],
				graveyard: [],
			};
		}

		state.summoning_stack = [];

		return state;
	}



	deployLand(player, card) {
	  let c = this.deck[card];
	  this.game.state.players_info[player-1].mana.push(c);
	  this.game.state.players_info[player-1].mana[this.game.state.players_info[player-1].mana.length-1].tapped = true;
	  this.board.render();
	}

	deployCreature(player, card) {
	  let c = this.deck[card];
	  this.game.state.players_info[player-1].creatures.push(c);
	  this.game.state.players_info[player-1].creatures[this.game.state.players_info[player-1].artifacts.length-1].tapped = true;
	  this.board.render();
	}

	deployArtifact(player, card) {
	  let c = this.deck[card];
	  this.game.state.players_info[player-1].artifacts.push(c);
	  this.game.state.players_info[player-1].artifacts[this.game.state.players_info[player-1].artifacts.length-1].tapped = true;
	  this.board.render();
	}

	playInstant(player, card) {

	}


