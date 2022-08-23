
    if (card == "marshall") {

      this.game.state.events.marshall = 1;
      var twilight_self = this;

      if (this.game.player == 2) {
        //If the event card has a UI component, run the clock for the player we are waiting on
        this.startClock();

        var countries_where_i_can_place = 0;
        for (var i in this.countries) {
          if (i == "canada" || i == "uk" || i == "sweden" || i == "france" || i == "benelux" || i == "westgermany" || i == "spain" ||  i == "italy" || i == "greece" || i == "turkey" || i == "denmark" || i == "norway" || i == "sweden" ||  i == "finland" || i == "austria") {
            if (this.isControlled("ussr", i) != 1) {
              countries_where_i_can_place++;
              $(`#${i}`).addClass("westerneurope");
              twilight_self.countries[i].place = 1; //Allow placement
            }
          }
        }

        var ops_to_place = Math.min(7, countries_where_i_can_place);
        
        this.updateStatus("<div class='status-message' id='status-message'>Place 1 influence in each of "+ops_to_place+" non USSR-controlled countries in Western Europe</div>");

        twilight_self.addMove("resolve\tmarshall");
        
        $(".westerneurope").on('click', function() {
          let c = $(this).attr('id');
          $(this).removeClass("westerneurope");
          
          if (twilight_self.countries[c].place == 1) { //only one per country
            twilight_self.addMove("place\tus\tus\t"+c+"\t1");
            twilight_self.placeInfluence(c, 1, "us"); 
            twilight_self.countries[c].place = 0;
            ops_to_place--;
            twilight_self.updateStatus("<div class='status-message' id='status-message'>Place 1 influence in each of "+ops_to_place+" non USSR-controlled countries in Western Europe</div>");
            if (ops_to_place <= 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }
          } else {
            twilight_self.displayModal("you already place one there...");
          }
        });
      }
      return 0;

    }


