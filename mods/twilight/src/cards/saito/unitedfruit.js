
    if (card == "unitedfruit") {

      this.game.state.event.unitedfruit = 1;

      let ussrtroops = 0;
      for (var i in this.countries) {
        if (this.countries[i].region == "centralamerica" || this.countries[i].region == "southamerica") {
          ussrtroops += this.countries[i].ussr;
        }
      }

      if (ustroops == 0) {
        this.updateLog("USSR has no influence in Central or South America");
        return 1;
      }


      if (this.game.player == 2) {

        this.startClock();

        this.addMove("resolve\tunitedfruit");

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        var ops_available = 0;
        for (var i in this.countries) {
          if (this.countries[i].region == "centralamerica" || this.countries[i].region == "southamerica") {
            if (this.countries[i].ussr > 0) {
              $("#"+i).addClass("easterneurope");
              this.countries[i].place = 1;
            }
          }
        }

        let ops_to_purge = Math.min(1, ops_available);

        this.updateStatus("Remove 1 USSR influence from Central or South America");
        
        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {

          let c = $(this).attr('id');

          if (twilight_self.countries[c].place != 1 || twilight_self.countries[c].ussr == 0) {
            twilight_self.displayModal("Invalid Country");
          } else {
            twilight_self.removeInfluence(c, 1, "ussr");
            twilight_self.addMove("remove\tus\tussr\t"+c+"\t1");
            twilight_self.playerFinishedPlacingInfluence();
            twilight_self.endTurn();
          }
        });

      }
      return 0;
    }





