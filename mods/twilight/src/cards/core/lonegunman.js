

    //
    // Lone Gunman
    //
    if (card == "lonegunman") {

      if (this.game.player == 1) {
        //this.updateStatus("<div class='status-message' id='status-message'>US is playing Lone Gunman</div>");
        return 0;

      }
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
          revealed += this.game.deck[0].cards[this.game.deck[0].hand[i]].name;
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


