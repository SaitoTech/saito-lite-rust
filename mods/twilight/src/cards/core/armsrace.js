

    //
    // Arms Race
    //
    if (card == "armsrace") {
      
      let bonus = 0;

      if (player == "us") {
        if (this.game.state.milops_us > this.game.state.milops_ussr) {
          bonus = 1;
          this.game.state.vp += 1;
          if (this.game.state.milops_us >= this.game.state.defcon) {
            this.game.state.vp += 2;
            bonus = 3;
          }
        }  
      } else {
        if (this.game.state.milops_ussr > this.game.state.milops_us) {
          bonus = 1;
          this.game.state.vp -= 1;
          if (this.game.state.milops_ussr >= this.game.state.defcon) {
            bonus = 3;
            this.game.state.vp -= 2;
          }
        }
      }
      this.updateVictoryPoints();
      this.updateLog(`${player.toUpperCase()} gains ${bonus} VP from ${this.cardToText(card)}`);
      this.displayModal(this.cardToText(card), `${player.toUpperCase()} gains ${bonus} VP`);
      if (!i_played_the_card){
        this.game.queue.push(`ACKNOWLEDGE\t${player.toUpperCase()} plays ${this.cardToText(card)}.`);
      }
      
      return 1;

    }



