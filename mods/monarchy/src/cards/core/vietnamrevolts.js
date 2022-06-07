

    /////////////////////
    // Vietnam Revolts //
    /////////////////////
    if (card == "vietnamrevolts") {
      this.game.state.events.vietnam_revolts = 1;
      this.placeInfluence("vietnam", 2, "ussr");
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }



