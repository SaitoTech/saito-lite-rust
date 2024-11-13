
    if (card == "terrorism") {

      let twilight_self = this;
      let cards_to_discard = 1;
      let target = (player == "ussr")? "us": "ussr";
     
      if (target == "us" && this.game.state.events.iranianhostage == 1) { 
        cards_to_discard = 2; 
      } 

      // SAITO COMMUNITY
      if (target == "us" && this.game.state.events.argo == 1 && this.isControlled("us", "canada")) {
	this.updateLog(this.cardToText("argo") + " cancels Terrorism against United States");
        return 1;
      }



      this.addMove("resolve\tterrorism");

      if (target == this.roles[this.game.player]) {

        let available_cards = this.game.deck[0].hand.length;
	let discarded_cards = [];
        let cards_for_select = [];
        for (let z = 0; z < this.game.deck[0].hand.length; z++) {
          if (this.game.deck[0].hand[z] === "china" || this.game.deck[0].hand[z] == this.game.state.headline_opponent_card || this.game.deck[0].hand[z] == this.game.state.headline_card) {} else {
            cards_for_select.push(this.game.deck[0].hand[z]);
          }
        }
        if (cards_for_select.length < cards_to_discard) { cards_to_discard = cards_for_select.length; }
        
        if (cards_to_discard == 0) { this.addMove(`NOTIFY\t${this.cardToText(card)}: ${target.toUpperCase()} has no cards to discard`); }

        for (let i = 0; i < cards_to_discard; i++) {
          if (cards_for_select.length > 0) {
            this.rollDice(cards_for_select.length, function(roll) {
              roll = parseInt(roll)-1;
              let victim = cards_for_select[roll];
	      discarded_cards.push(victim);
              twilight_self.removeCardFromHand(victim);
              twilight_self.addMove("dice\tburn\t"+player);
              twilight_self.addMove(`discard\t${target}\t${victim}`);
              cards_for_select.splice(roll, 1);
            });
          }
        }

	let discard_text = "";
	for (let i = 0; i < discarded_cards.length; i++) {
	  if (i > 0) { discard_text += ", "; }
	  discard_text += twilight_self.cardToText(discarded_cards[i]);
	}

        twilight_self.addMove(`modal\t${twilight_self.cardToText(card)}\t${target.toUpperCase()} discarded ${discard_text}`);
        this.endTurn();
      }
      
      return 0;
    }





