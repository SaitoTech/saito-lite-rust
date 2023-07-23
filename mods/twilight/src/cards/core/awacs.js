

    //
    // AWACS Sale to Saudis
    //
    if (card == "awacs") {

      // SAITO COMMUNITY
      this.removeCardFromDeckNextDeal("muslimrevolution", "Muslim Revolution cancelled");

      this.game.state.events.awacs = 1; //Prevent Muslim Revolution
      this.cancelEvent("muslimrevolution");

      this.placeInfluence("saudiarabia", 2, "us");


      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }

      return 1;
    }


