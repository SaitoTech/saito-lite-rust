

    //////////////////////
    // Nuclear Test Ban //
    //////////////////////
    if (card == "nucleartestban") {

      this.game.state.events.nucleartestbantreaty = 1;


      let vpchange = this.game.state.defcon-2;
      if (vpchange < 0) { vpchange = 0; }
      this.game.state.defcon = this.game.state.defcon+2;
      if (this.game.state.defcon > 5) { this.game.state.defcon = 5; }

      if (player == "us") {
        this.game.state.vp = this.game.state.vp+vpchange;
      } else {
        this.game.state.vp = this.game.state.vp-vpchange;
      }
      this.updateVictoryPoints();
      this.updateDefcon();

      if (!i_played_the_card){
        this.game.queue.push(`ACKNOWLEDGE\t${player.toUpperCase()} plays ${this.cardToText(card)}.`);
      }


      return 1;
    }



