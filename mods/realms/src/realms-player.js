
	playerTurn() {

		let realms_self = this;

		if (this.browser_active == 0) {
			return;
		}

console.log("CARDS IS: " + JSON.stringify(this.game.deck[this.game.player-1].hand));

		//
		// show my hand
		//
		this.updateStatusAndListCards(
		  	`play card(s) or click board to attack <span id="end-turn" class="end-turn">[ or pass ]</span>`,
		    	this.game.deck[this.game.player-1].hand,
			function(cardname) {

				let card = realms_self.deck[cardname];

				if (card.type == "land") {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(`deploy\tland\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();
				}
				if (card.type == "creature") {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(`deploy\tcreature\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();
				}
				if (card.type == "artifact") {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(`deploy\tartifact\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();
				}
				if (card.type == "enchantment") {
					this.deploy(realms_self.game.player, cardname);
					this.addMove(`deploy\tenchantment\t${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();

				}

			}
		);

		//
		// or end their turn
		//
		document.getElementById("end-turn").onclick = (e) => {
			this.prependMove("RESOLVE\t" + this.publicKey);
			this.endTurn();
		};

	}




