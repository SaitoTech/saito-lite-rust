
    if (card == "wargames") {

      if (this.game.state.defcon != 2) {
        this.updateLog("Wargames event cannot trigger as DEFCON is not at 2");
        return 1;
      }

      let twilight_self = this;
      this.startClockAndSetActivePlayer(this.roles.indexOf(player));

      if (i_played_the_card){

        let choicehtml = '<ul><li class="option" id="endgame">end the game</li><li class="option" id="cont">continue playing</li></ul>';

        this.updateStatusWithOptions(`${this.cardToText(card)}: Do you want to give your opponent 6 VP and End the Game? (VP ties will be won by opponent)`, choicehtml, function(action2) {

          if (action2 == "endgame") {
            twilight_self.updateStatus("Triggering Wargames...");
            twilight_self.addMove("resolve\twargames");
            twilight_self.addMove("wargames\t"+player+"\t1");
            twilight_self.endTurn();
          }
          if (action2 == "cont") {
            twilight_self.updateStatus("Discarding Wargames...");
            twilight_self.addMove("resolve\twargames");
            twilight_self.addMove("wargames\t"+player+"\t0");
            twilight_self.endTurn();
          }
        });
      }
      return 0;
    }


