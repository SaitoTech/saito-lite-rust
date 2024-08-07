
    if (card == "liberation") {

      this.game.state.events.liberation = 1;
 
  
      //
      // SAITO COMMUNITY - united fruit company removed
      //
      if (this.game.state.events.unitedfruit_removed != 1) {
        this.game.state.events.unitedfruit_removed = 1;
        this.removeCardFromDeckNextDeal("unitedfruit", "Liberation Theology Evented");
        this.cancelEvent("unitedfruit");
      }

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        var ops_to_place = 3;
        var already_placed = {};

        twilight_self.addMove("resolve\tliberation");

        this.updateStatus("USSR places three influence in Central America (max 2 per country)");
        for (var i in this.countries) {
          if (this.countries[i].region == "camerica"){
            this.countries[i].place = 1;
            
            $("#"+i).addClass("easterneurope");
          }
        }

        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {
          let countryname = $(this).attr('id');
          if (twilight_self.countries[countryname].place == 1) {
            if (already_placed[countryname]) {
              twilight_self.countries[countryname].place = 0;
            }else{
              already_placed[countryname] = 1;  
            }
            twilight_self.addMove("place\tussr\tussr\t"+countryname+"\t1");
            twilight_self.placeInfluence(countryname, 1, "ussr");
            
            ops_to_place--;
            if (ops_to_place == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }
          } else {
            twilight_self.displayModal("you cannot place there...");
          }
        });
      }
      return 0;
    }



