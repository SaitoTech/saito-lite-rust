
    if (card == "colonial") {

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        var twilight_self = this;
      
        var ops_to_place = 4;
        twilight_self.addMove("resolve\tcolonial");

        this.updateStatus(`<div class='status-message' id='status-message'>Place ${ops_to_place} influence in Africa or Southeast Asia (1 per country)</div>`);

        for (var i in this.countries) {
          if (this.countries[i].region == "africa" || this.countries[i].region == "seasia"){
            this.countries[i].place = 1;
            $("#"+i).addClass("westerneurope");
          }
        }

        $(".westerneurope").off();
        $(".westerneurope").on('click', function (e) {
            
          let countryname = $(this).attr('id');
          if (twilight_self.countries[countryname].place == 1) {
            twilight_self.addMove("place\tus\tus\t"+countryname+"\t1");
            twilight_self.placeInfluence(countryname, 1, "us");
            
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



