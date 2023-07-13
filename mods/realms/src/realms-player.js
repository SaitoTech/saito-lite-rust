	
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
				alert("CLICKED ON CARD: " + cardname);

				if (card.type == "land") {
					this.deployLand(realms_self.game.player, cardname);
					this.addMove(`deploy\tland\t"${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();
				}
				if (card.type == "creature") {
					this.deployLand(realms_self.game.player, cardname);
					this.addMove(`deploy\tcreature\t"${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();
				}
				if (card.type == "artifact") {
					this.deployLand(realms_self.game.player, cardname);
					this.addMove(`deploy\tartifact\t"${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();
				}
				if (card.type == "enchantment") {
					this.deployEnchantment(realms_self.game.player, cardname);
					this.addMove(`deploy\tenchantment\t"${realms_self.game.player}\t${cardname}\t${realms_self.game.player}`);
					this.endTurn();

				}

			}
		);

		//
		// or end their turn
		//
		document.getElementById("end-turn").onclick = (e) => {
			this.prependMove("RESOLVE\t" + this.app.wallet.returnPublicKey());
			this.endTurn();
		};

	}

/****
	playerPlayCardFromHand(card_index) {
		let card = this.game.deck[this.game.player - 1].cards[card_index];

		let c = this.card_library[card];

		console.log(c);

		if (c.type == "land") {
			if (this.game.state.has_placed_land) {
				salert("You may only play one land per turn.");
				return;
			} else {
				this.game.state.has_placed_land = 1;
			}
		}

		//To do -- insert test for mana pool


		let ui_id = this.insertCardSlot(this.game.player, "#summoning_stack");
		for (let i = 0; i < this.game.deck[this.game.player-1].hand.length; i++){
			if (this.game.deck[this.game.player-1].hand[i] == card_index){
				this.game.deck[this.game.player-1].hand.splice(i,1);
				this.game.state.summoning_stack.push({player: this.game.player, key: card, card: c, uuid: ui_id});
			}
		}

		this.addMove(`summon\t${this.game.player}\t${card}`);

		this.moveCard(card_index, ui_id);
		this.endTurn();
	}
****/

