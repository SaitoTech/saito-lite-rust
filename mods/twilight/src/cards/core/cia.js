
    /////////////////
    // CIA Created //
    /////////////////
    if (card == "cia") {

      //
      // SAITO COMMUNITY - lone gunman added
      //
      if (!this.saito_cards_added.includes("lonegunman")) { this.saito_cards_added.push("lonegunman"); }


      //USSR needs to share its card information
      if (this.game.player == 1) {

        this.addMove("resolve\tcia");
        this.addMove("ops\tus\tcia\t1");
        this.addMove("setvar\tgame\tstate\tback_button_cancelled\t1");
        
        let revealed = "", keys = "";
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (i > 0) { 
            revealed += ", "; 
            keys += " ";
          }
          revealed += this.cardToText(this.game.deck[0].hand[i]);
          keys += this.game.deck[0].hand[i];
        }

        if (this.game.deck[0].hand.length > 0 ) {
          this.addMove("showhand\t1\t"+keys);
          this.addMove("notify\tUSSR holds: "+revealed);
        } else {
          this.addMove("notify\tUSSR has no cards to reveal");
        }

        this.endTurn();
        this.updateStatus(`<div class='status-message' id='status-message'>US saw your hand and is playing 1OP (${this.cardToText(card)})</div>`);

      }

      return 0;
    }



