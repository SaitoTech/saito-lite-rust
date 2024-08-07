
    if (card == "iranianultimatum") {

      this.game.state.events.iranianultimatum = 1;

      this.placeInfluence("iran", 2, "us");

      this.displayBoard();
      this.updateLog(`${this.cardToText(card)}: 2 US influence added to Iran`);
       
      let ussrtroops = 0;
      for (var i in this.countries) {
        if (this.countries[i].region == "mideast") {
          ussrtroops += this.countries[i].ussr;
        }
      }

      if (ussrtroops == 0) {
        this.updateLog("USSR has no influence in the Middle-East");
        return 1;
      }


      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        this.addMove("resolve\tiranianultimatum");

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        var ops_available = 0;
        for (var i in this.countries) {
          if (this.countries[i].region == "mideast") {
            if (this.countries[i].ussr > 0) {
              $("#"+i).addClass("easterneurope");
              this.countries[i].place = 1;
            }
          }
        }

        let ops_to_purge = Math.min(1, ops_available);

        this.updateStatus("Remove 1 USSR influence from the Middle East");
        
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

	  twilight_self.displayBoard();
        });

      }
      return 0;
    }





