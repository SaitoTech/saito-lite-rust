
    if (card == "revolutionsof1989") {

      this.game.state.events.revolutionsof1989 = 1;

      let twilight_self = this;

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        let choicehtml = '<ul><li class="option" id="endgame">end the game</li><li class="option" id="cont">continue playing</li></ul>';

        this.updateStatusWithOptions(`${this.cardToText(card)}: do you want to trigger Final Scoring?`, choicehtml, function(action2) {

          if (action2 == "endgame") {
            twilight_self.addMove("final_scoring");
            twilight_self.endTurn();
          }
          if (action2 == "cont") {
            twilight_self.updateStatus("Not Triggering Final Scoring...");
            twilight_self.addMove("resolve\trevolutionsof1989");
            twilight_self.endTurn();
          }
        });
      }
      return 0;
    }


