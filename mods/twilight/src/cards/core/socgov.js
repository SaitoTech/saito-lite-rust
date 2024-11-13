
    ///////////////////////////
    // Socialist Governments //
    ///////////////////////////
    if (card == "socgov") {

      if (this.game.state.events.ironlady == 1) {
        this.updateLog("Iron Lady cancels Socialist Governments");
        this.updateStatus("Socialist Governments prevented by Iron Lady");
        return 1;
      }
      
      this.startClockAndSetActivePlayer(1);
      if (this.game.player == 1) {
  
        var twilight_self = this;
        //twilight_self.playerFinishedPlacingInfluence();

        twilight_self.addMove("resolve\tsocgov");

        let ops_to_purge = 3;
        let ops_purged = {};
        let available_targets = 0;

        const europeanCountries = ["italy", "turkey", "greece", "spain", "france", "westgermany", "uk", "canada", "benelux", "finland", "austria", "denmark", "norway", "sweden"]; 

        for (var i of europeanCountries) {
          if (twilight_self.countries[i].us == 1) { available_targets += 1; }
          if (twilight_self.countries[i].us > 1) { available_targets += 2; }

          if (twilight_self.countries[i].us > 0){
            $("#"+i).addClass("easterneurope");
            twilight_self.countries[i].place = 1;  
            ops_purged[i] = 0;
          }

        }
        
        if (available_targets == 0){
          this.endTurn();
        }

        ops_to_purge = Math.min(3, available_targets);
        
        this.updateStatus("Remove "+ops_to_purge+" US influence from Western Europe (max 2 per country)");        

        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {
          let c = $(this).attr('id');
          if (twilight_self.countries[c].place != 1) {
            twilight_self.displayModal("Invalid Country");
          } else {
            ops_purged[c]++;
            if (ops_purged[c] >= 2) {
              twilight_self.countries[c].place = 0;
            }
            twilight_self.removeInfluence(c, 1, "us");
            twilight_self.addMove("remove\tussr\tus\t"+c+"\t1");
            ops_to_purge--;
            if (ops_to_purge == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }
          }
        });
      
      }
        return 0;
    }
