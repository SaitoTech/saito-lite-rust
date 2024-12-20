
    if (card == "specialrelation") {

      if (this.isControlled("us", "uk") == 1) {

        this.startClockAndSetActivePlayer(2);

        if (this.game.player == 2) {
          
          let twilight_self = this;
          let ops_to_place = 1;
          let placeable = [];

          twilight_self.addMove("resolve\tspecialrelation");
          
          if (this.game.state.events.nato == 1) {
            twilight_self.addMove("vp\tus\t2");
            ops_to_place = 2;
            placeable.push("canada");
            placeable.push("uk");
            placeable.push("italy");
            placeable.push("france");
            placeable.push("spain");
            placeable.push("greece");
            placeable.push("turkey");
            placeable.push("austria");
            placeable.push("benelux");
            placeable.push("westgermany");
            placeable.push("denmark");
            placeable.push("norway");
            placeable.push("sweden");
            placeable.push("finland");
            this.updateStatus("US is playing Special Relationship. Add 2 Influence to any country in Western Europe.");

          } else {

            this.updateStatus("US is playing Special Relationship. Add 1 Influence to any country adjacent to the UK.");
            placeable.push("canada");
            placeable.push("france");
            placeable.push("norway");
            placeable.push("benelux");
          }

          for (let i of placeable) {
            $("#"+i).addClass("westerneurope");
          }

          $(".westerneurope").off();
          $(".westerneurope").on('click', function() {
              let c = $(this).attr('id');
              twilight_self.placeInfluence(c, ops_to_place, "us");
              twilight_self.addMove("place\tus\tus\t"+c+"\t"+ops_to_place);
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            });
          return 0;
        } else {
        }

        return 0;
      
      } else {
        this.updateLog(`${this.cardToText(card)} doesn't trigger because UK not controlled by US`);
      }

      return 1;

    }


