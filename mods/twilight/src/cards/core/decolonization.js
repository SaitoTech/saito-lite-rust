

    ////////////////////
    // Decolonization //
    ////////////////////
    if (card == "decolonization") {

      this.game.state.events.decolonization_played = 1;

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        var ops_to_place = 4;
        twilight_self.addMove("resolve\tdecolonization");

        this.updateStatus(`<div class='status-message' id='status-message'>Place ${ops_to_place} influence in Africa or Southeast Asia (1 per country)</div>`);

        for (var i in this.countries) {
          if (this.countries[i].region == "africa" || this.countries[i].region == "seasia"){
            this.countries[i].place = 1;
            $("#"+i).addClass("easterneurope");
          }
        }

        $(".easterneurope").off();
        $(".easterneurope").on('click', function (e) {
            
          let countryname = $(this).attr('id');
          if (twilight_self.countries[countryname].place == 1) {
            twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
            twilight_self.placeInfluence(countryname, 1, "ussr");
            
            twilight_self.countries[countryname].place = 0;
            ops_to_place--;
            if (ops_to_place <= 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
              return 0;
            }
            twilight_self.updateStatus(`<div class='status-message' id='status-message'>Place ${ops_to_place} influence in Africa or Southeast Asia (1 per country)</div>`);
          } else {
            twilight_self.displayModal("you already placed there...");
          }
        });
      }
      return 0;
      
    }



