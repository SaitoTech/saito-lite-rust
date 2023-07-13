
	initializeGame(game_id) {

		//
		// initialize
		//
		if (this.game.status) { this.updateStatus(this.game.status); }

		//
		// import player cards
		//
		let deck1 = this.returnRedDeck();
		let deck2 = this.returnGreenDeck();

		//
		// initialize queue on new games
		//
		if (this.game.deck.length == 0) {

			this.game.state = this.returnState();

			this.game.queue.push("round");
			this.game.queue.push("READY");

			//
			// first play to go draws 6 to avoid pulling 8th first turn
			//
			this.game.queue.push("DEAL\t1\t1\t6");
			this.game.queue.push("DEAL\t2\t2\t7");

			//
			// encrypt and shuffle player-2 deck
			//
			this.game.queue.push("DECKENCRYPT\t2\t2");
			this.game.queue.push("DECKENCRYPT\t2\t1");
			this.game.queue.push("DECKXOR\t2\t2");
			this.game.queue.push("DECKXOR\t2\t1");

			// encrypt and shuffle player-1 deck
			this.game.queue.push("DECKENCRYPT\t1\t2");
			this.game.queue.push("DECKENCRYPT\t1\t1");
			this.game.queue.push("DECKXOR\t1\t2");
			this.game.queue.push("DECKXOR\t1\t1");

			// import our decks
			this.game.queue.push("DECK\t1\t" + JSON.stringify(deck1));
			this.game.queue.push("DECK\t2\t" + JSON.stringify(deck2));
		}

		//
		// add events to cards
		//
		this.deck = {};
		for (let key in deck1) { this.importCard(key, deck1[key]); }
		for (let key in deck2) { this.importCard(key, deck2[key]); }

	}


