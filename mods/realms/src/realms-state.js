
	returnState() {

		let state = {};
		state.players_info = [2];
		for (let i = 0; i < 2; i++) {
			state.players_info[i] = {
				health: 20,
				mana: 0, 
				cards: [],
				graveyard: [],
			};
		}

		return state;
	}



	deploy(player, cardname) {

	  let c = this.deck[cardname];

	  let obj = {
	    key    	: cardname ,
	    tapped 	: true ,
            affixed 	: [] ,
	  }

	  this.game.state.players_info[player-1].cards.push(obj);

alert("deployed card: " + cardname);

	  this.board.render();

	}

	

