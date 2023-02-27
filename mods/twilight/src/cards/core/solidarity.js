

    //
    // Solidarity
    //
    if (card == "solidarity") {
      if (this.game.state.events.johnpaul == 0) {
        this.updateLog(`${this.cardToText(card)} does not trigger because no ${this.cardToText("johnpaul")}`);
        return 1;
      }
      this.placeInfluence("poland", 3, "us");
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }

      return 1;
    }



