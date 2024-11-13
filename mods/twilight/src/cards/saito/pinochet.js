
    if (card == "pinochet") {

      this.game.state.events.pinochet = 1;
      this.game.state.events.pinochet_added = 1;

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.updateStatusWithOptions(`${twilight_self.cardToText(card)}: `,'<ul><li class="option" id="chile">2 Influence in Chile</li><li class="option" id="argentina">2 Influence in Argentina</li></ul>', function(action2) {

          twilight_self.addMove("resolve\tpinochet");
          twilight_self.addMove("pinochet");

          if (action2 == "chile") {

            twilight_self.placeInfluence("chile", 2, "us", function() {
              twilight_self.addMove("place\tus\tus\tchile\t2");
              twilight_self.endTurn();
            });
            return 0;

          }
          if (action2 == "argentina") {

            twilight_self.placeInfluence("argentina", 2, "us", function() {
              twilight_self.addMove("place\tus\tus\targentina\t2");
              twilight_self.endTurn();
            });
            return 0;

          }
        });
      }

      return 0;

    }

