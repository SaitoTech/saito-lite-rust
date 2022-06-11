

    //
    // Flower Power
    //
    if (card == "flowerpower") {
      if (this.game.state.events.evilempire == 1) {
        this.updateLog("Flower Power prevented by Evil Empire");
        return 1;
      }
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      this.game.state.events.flowerpower = 1;
      return 1;
    }




