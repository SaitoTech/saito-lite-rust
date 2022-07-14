

    //
    // U2 Incident
    //
    if (card == "u2") {

      this.game.state.events.u2 = 1;
      this.game.state.vp -= 1;
      this.updateVictoryPoints();
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


