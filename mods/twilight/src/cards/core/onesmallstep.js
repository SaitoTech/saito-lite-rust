
    if (card == "onesmallstep") {
      if (player == "us") {
        if (this.game.state.space_race_us < this.game.state.space_race_ussr) {
          this.updateLog("US takes one small step into space...");
          this.advanceSpaceRace("us", true);
          this.advanceSpaceRace("us");
        }
      } else {
        if (this.game.state.space_race_ussr < this.game.state.space_race_us) {
          this.updateLog("USSR takes one small step into space...");
          this.advanceSpaceRace("ussr", true);
          this.advanceSpaceRace("ussr");
        }
      }

      if (!i_played_the_card){
        this.game.queue.push(`ACKNOWLEDGE\t${player.toUpperCase()} plays ${this.cardToText(card)}.`);
      }

      return 1;
    }


