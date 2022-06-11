

    ///////////////////////////
    // DeGaulle Leads France //
    ///////////////////////////
    if (card == "degaulle") {
      this.game.state.events.degaulle = 1;
      this.game.state.events.nato_france = 0;
      this.removeInfluence("france", 2, "us");
      this.placeInfluence("france", 1, "ussr");
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


