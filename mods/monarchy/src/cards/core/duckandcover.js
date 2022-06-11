

    ////////////////////
    // Duck and Cover //
    ////////////////////
    if (card == "duckandcover") {

      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }

      this.lowerDefcon();
      
      let vpchange = 5-this.game.state.defcon;

      this.game.state.vp = this.game.state.vp+vpchange;
      this.updateLog("US gains "+vpchange+" VP from Duck and Cover");
      this.updateVictoryPoints();

      return 1;
    }




