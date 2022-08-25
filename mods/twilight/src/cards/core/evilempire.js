
    //
    // An Evil Empire
    //
    if (card == "evilempire") {

      this.game.state.events.evilempire = 1;
      this.game.state.events.flowerpower = 0; //Cancel Flower Power
      this.cancelEvent("flowerpower");

      this.game.state.vp += 1;
      this.updateVictoryPoints();

      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;

    }


