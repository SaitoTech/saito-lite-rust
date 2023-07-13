
	handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split("\t");

			console.log("QUEUE: " + JSON.stringify(this.game.queue));

			//
			// we never clear the "round" so that when we hit it
			// we always bounce back higher on the queue by adding
			// turns for each player.
			//
			if (mv[0] == "round") {
				this.game.queue.push("PLAY\t2");
				this.game.queue.push("DEAL\t2\t2\t1");
				this.game.queue.push("PLAY\t1");
				this.game.queue.push("DEAL\t1\t1\t1");
			}

			if (mv[0] === "summon") {
				let player_id = parseInt(mv[1]);
				let cardkey = mv[2];

				if (this.game.player !== player_id){
					let id = this.insertCardSlot(player_id, "#summoning_stack");
					this.game.state.summoning_stack.push({player: player_id, key: cardkey, card: this.card_library[cardkey], uuid: id});
					this.addCard(cardkey, id);					

					//To Do: add a step for opponent to Counter/Acknowledge summoned card
					//Shortcut to accept
					this.addMove("accept");
					setTimeout(()=> {this.endTurn();}, 2000);
					
				}

				this.game.queue.splice(qe, 1);
				return 0;
			}

			if (mv[0] === "accept") {
				this.game.queue.splice(qe, 1);

				for (let summoned_card of this.game.state.summoning_stack) {
					this.game.queue.push(`resolve_card\t${summoned_card.player}\t${summoned_card.key}`);
				}

			}

			if (mv[0] === "resolve_card") {
				let player = parseInt(mv[1]);
				let card_key = mv[2];

				//Insert code to do stuff based on the card definition

				this.game.queue.splice(qe, 1);

				let card = this.game.state.summoning_stack.pop();
				if (card.key !== card_key) {
					console.log("Desyncronized stacks! " + card_key);
					console.log(JSON.parse(JSON.stringify(card)));
				}

				//lands: [], 				creatures: [], 				artifacts: [],				graveyard: [],

				
				if (["land", "creature", "artifact"].includes(card.type)) {
					//Move permanents onto board
					if (card.type == "creature"){
						card.tapped = true;
					}

					this.game.state.players[player - 1][card.type].push(card);
					
				} //else {
					//Discard non-permanents
					this.game.state.players[player - 1]["graveyard"].push(card);
					this.moveCard(card.uuid, ".graveyard");
				//}

				
			}

		}
		return 1;
	}

