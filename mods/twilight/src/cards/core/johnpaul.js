

    //
    // John Paul II
    //
    if (card == "johnpaul") {

      this.game.state.events.johnpaul = 1;
      this.uncancelEvent("solidarity");

      this.removeInfluence("poland", 2, "ussr");
      this.placeInfluence("poland", 1, "us");
       if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


