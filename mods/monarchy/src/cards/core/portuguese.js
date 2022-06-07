

    //
    // Portuguese Empire Crumbles
    //
    if (card == "portuguese") {
      this.placeInfluence("seafricanstates", 2, "ussr");
      this.placeInfluence("angola", 2, "ussr");
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }



