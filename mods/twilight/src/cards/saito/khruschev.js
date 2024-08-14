
    ////////////////////
    // Khruschev Thaw //
    ////////////////////
    if (card == "khruschevthaw") {

      this.game.state.events.khruschev_thaw = 1;
      this.game.state.vp -= 1;
      this.updateVictoryPoints();

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        var twilight_self = this;

        var countries_to_add = 3;
        var options_add = ["czechoslovakia","austria","hungary","romania","yugoslavia","bulgaria","finland"];

        twilight_self.addMove("resolve\tkhruschevthaw");

        twilight_self.updateStatus("Add 3 influence to 3 non-battleground countries in Eastern Europe");          

        for (let c of options_add) {
          $("#"+c).addClass("westerneurope");
          this.countries[c].place = 1;
        }

        $(".westerneurope").off();
        $(".westerneurope").on('click', function() {

          let c = $(this).attr('id');

          if (twilight_self.countries[c].place != 1) {
            twilight_self.displayModal("Invalid Option");
          } else {
            twilight_self.countries[c].place = 0; //Only remove once
            twilight_self.placeInfluence(c, 1, "us");
            twilight_self.addMove("place\tus\tus\t"+c+"\t1");
            countries_to_add--;
            if (countries_to_add == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
              return 0;
            }
          }
        });
      }
      return 0;

    }



