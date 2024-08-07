
    if (card == "marine") {

      if (this.countries["lebanon"].us > 0){
        this.countries["lebanon"].us = 0;
        this.showInfluence("lebanon", "us");
        this.updateLog(`${this.cardToText(card)}: All US influence removed from Lebanon`);  
      }else{
        this.updateLog(`${this.cardToText(card)}: No US influence in Lebanon to remove`);  
      }
       

      let ustroops = 0;
      for (var i in this.countries) {
        if (this.countries[i].region == "mideast") {
          ustroops += this.countries[i].us;
        }
      }

      if (ustroops == 0) {
        this.updateLog("US has no influence in the Middle-East");
        return 1;
      }

      if (ustroops <= 2) {
        for (var i in this.countries) {
          if (this.countries[i].region == "mideast") {
            if (this.countries[i].us > 0) {
	      this.countries[i].us = 0;
	      this.showInfluence(i);
	    }
          }
        }
        this.updateLog("All US influence in Middle-East removed...");
        return 1;
      }

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        this.addMove("resolve\tmarine");

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        var ops_available = 0;
        for (var i in this.countries) {
          if (this.countries[i].region == "mideast") {
            if (this.countries[i].us > 0) {
              ops_available += this.countries[i].us;
              $("#"+i).addClass("easterneurope");
              this.countries[i].place = 1;
            }
          }
        }

        let ops_to_purge = Math.min(2, ops_available);

        this.updateStatus("Remove"+ops_to_purge+" US influence from the Middle East");
        
        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {

          let c = $(this).attr('id');

          if (twilight_self.countries[c].place != 1 || twilight_self.countries[c].us == 0) {
            twilight_self.displayModal("Invalid Country");
          } else {
            twilight_self.removeInfluence(c, 1, "us");
            twilight_self.addMove("remove\tussr\tus\t"+c+"\t1");
            ops_to_purge--;
            if (ops_to_purge == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }
          }
          twilight_self.updateStatus("Remove "+ops_to_purge+" US influence from the Middle East");        

        });

      }
      return 0;
    }





