    /////////////
    // Comecon //
    /////////////
    if (card == "comecon") {

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        var countries_where_i_can_place = 0;
        for (var i in this.countries) {
          if (i == "finland" || i == "poland" || i == "eastgermany" || i == "austria" || i == "czechoslovakia" || i == "bulgaria" || i == "hungary" || i == "romania" || i == "yugoslavia") {
            if (this.isControlled("us", i) != 1) {
              countries_where_i_can_place++;
              $(`#${i}`).addClass("easterneurope");
              twilight_self.countries[i].place = 1; //Allow placement
            }
          }
        }

        var ops_to_place = Math.min(4, countries_where_i_can_place);

        twilight_self.updateStatus("Place "+ops_to_place+" influence in non-US controlled countries in Eastern Europe (1 per country)");

        twilight_self.addMove("resolve\tcomecon");

        $(".easterneurope").on('click', function() {
          let c = $(this).attr('id');
          $(this).removeClass("easterneurope");
          if (twilight_self.countries[c].place == 1) { //only one per country
            twilight_self.addMove("place\tussr\tussr\t"+c+"\t1");
            twilight_self.placeInfluence(c, 1, "ussr"); 
            twilight_self.countries[c].place = 0;
            ops_to_place--;
            twilight_self.updateStatus("Place "+ops_to_place+" influence in non-US controlled countries in Eastern Europe (1 per country)");
            if (ops_to_place == 0) {
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


