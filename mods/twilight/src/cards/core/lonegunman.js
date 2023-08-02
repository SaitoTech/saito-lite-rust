

    //
    // Lone Gunman
    //
    if (card == "lonegunman") {

      let ac = this.returnAllCards(true);

      if (this.game.player == 2) {

        this.addMove("resolve\tlonegunman");
        this.addMove("ops\tussr\tlonegunman\t1");
        this.addMove("setvar\tgame\tstate\tback_button_cancelled\t1");
  
       let revealed = "", keys = "";
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (i > 0) { 
            revealed += ", "; 
            keys += " ";
          }
          revealed += ac[this.game.deck[0].hand[i]].name;
          keys += this.game.deck[0].hand[i];
        }

        this.addMove("showhand\t2\t"+keys);

        if (this.game.deck[0].hand.length > 0 ) {
          this.addMove("NOTIFY\tUS holds: "+revealed);
        } else {
          this.addMove("NOTIFY\tUS has no cards to reveal");
        }

        this.endTurn();
      }
      return 0;
    }


