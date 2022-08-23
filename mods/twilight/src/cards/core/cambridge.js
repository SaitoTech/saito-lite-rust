
    if (card == "cambridge") {

      if (this.game.state.round > 7) {
        this.updateLog("<span>The Cambridge Five cannot be played as an event in Late Wa</span>");
        this.updateStatus("<div class='status-message' id='status-message'><span>The Cambridge Five cannot be played as an event in Late War</span></div>");
        return 1;
      }

      if (this.game.player == 2) {

        this.addMove("resolve\tcambridge");

        let scoring_cards = "", scoring_alert = "";
        
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          
            if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) {
              if (this.game.deck[0].hand[i] != this.game.state.headline_opponent_card && this.game.deck[0].hand[i] != this.game.state.headline_card) {
                if (scoring_cards.length > 0) { scoring_cards += ", "; scoring_alert += "\t"; }
                scoring_cards += '<span>' + this.game.deck[0].hand[i] + '</span>';
                scoring_alert += this.game.deck[0].hand[i];
              }
            }
        }

        let revealed = "", keys = "";
        for (let i = 0; i < this.game.deck[0].hand.length; i++) { //Search US hand
          if (this.game.deck[0].cards[this.game.deck[0].hand[i]]?.scoring == 1) { //For score cards
            if (this.game.deck[0].hand[i] != this.game.state.headline_opponent_card 
              && this.game.deck[0].hand[i] != this.game.state.headline_card) { //Not played as a headline
         
              if (revealed.length > 0) { 
                revealed += ", "; 
                keys += " ";
              }
              revealed += this.game.deck[0].cards[this.game.deck[0].hand[i]].name;
              keys += this.game.deck[0].hand[i];
            }
          }
        }

        if (revealed.length == 0) {

          this.addMove("NOTIFY\tUS does not have any scoring cards");
          this.endTurn();

        } else {
          let scoring_alert  = "cambridge\t" + keys.replaceAll(" ", "\t");
          this.addMove(scoring_alert);
          this.addMove("showhand\t2\t"+keys);
          this.addMove("NOTIFY\tUS has scoring cards for: " + revealed);
          this.endTurn();
          this.updateStatus(`<div class='status-message' id='status-message'>USSR is placing influence for ${this.cardToText(card)}</div>`);
        }

      }

      return 0;
    }


