
    //
    // North Sea Oil
    //
    if (card == "northseaoil") {

      // SAITO COMMUNITY
      this.removeCardFromDeckNextDeal("opec", "OPEC cancelled");

      this.cancelEvent("opec");
      this.game.state.events.northseaoil = 1; //block OPEC
      this.game.state.events.northseaoil_bonus = 1; //let US play 8 cards
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


