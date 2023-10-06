
    //
    // Aldrich Ames Remix
    //
    if (card == "aldrichames") {

      this.game.state.events.aldrich = 1;
      let ac = this.returnAllCards(true);

      if (this.game.player == 2) {

        this.updateStatus("USSR is playing Aldrich Ames<");

        this.addMove("resolve\taldrichames");

        if (this.game.deck[0].hand.length < 1) {
          this.addMove("NOTIFY\tUS has no more cards");
          this.endTurn();
	  return 0;
        }

        let cards_to_reveal = 0;
        let revealed = "";

        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (this.game.deck[0].hand[i] != "aldrichames" && this.game.deck[0].hand[i] !== "china" && this.game.deck[0].hand[i] !== this.game.state.headline_opponent_card && this.game.deck[0].hand[i] !== this.game.state.headline_card) {
           cards_to_reveal++; 
           if (revealed != "") { revealed += ", "; }
            revealed += ac[this.game.deck[0].hand[i]].name;
            this.addMove(this.game.deck[0].hand[i]);
          }
        }

        if (cards_to_reveal == 0) {
          this.addMove("NOTIFY\tUS has no cards left");
          this.endTurn();
        } else {
          this.addMove("aldrich\tus\t"+cards_to_reveal);
          this.addMove("NOTIFY\tUS holds: "+revealed);
          this.endTurn();
        }


      }
      return 0;
    }




