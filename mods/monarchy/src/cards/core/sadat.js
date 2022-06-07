

    //
    // Sadat Expels Soviets
    //
    if (card == "sadat") {
      if (this.countries["egypt"].ussr > 0) {
        this.removeInfluence("egypt", this.countries["egypt"].ussr, "ussr");
      }
      this.placeInfluence("egypt", 1, "us");
       if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }



