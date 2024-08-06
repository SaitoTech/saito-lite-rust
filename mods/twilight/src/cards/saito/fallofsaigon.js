
    if (card == "fallofsaigon") {

      let success = 0;
      let me = "ussr";
      let opponent = "us";
      if (this.game.player == 2) { opponent = "ussr"; me = "us"; }

			this.startClockAndSetActivePlayer(this.roles.indexOf(player));
      
      if (me == player) {
        
        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();
        twilight_self.addMove("resolve\tfallofsaigon");

        twilight_self.updateStatus('<div class="status-message" id="status-message">Select Country for Evacuation</div>');

        for (var i in twilight_self.countries) {

          if ((twilight_self.countries[i].us > 0 && me === "us") || (twilight_self.countries[i].ussr > 0 && me === "ussr")) {

            let divname = "#" + i;
            $(divname).off();
            $(divname).on('click', function() {

              let c = $(this).attr('id');
              $('.country').off();

	      let influence_to_remove = 0;
	      let max_influence_to_add = 0;
	      if (me === "us") {
		influence_to_remove = twilight_self.game.countries[c].us;
	      }
	      if (me === "ussr") {
		influence_to_remove = twilight_self.game.countries[c].ussr;
	      }

	      let neighbours = twilight_self.game.countries[c].neighbours;

              twilight_self.removeInfluence(c, influence_to_remove, me);
              twilight_self.addMove(`remove\t${player}\t${me}\t${c}\t${influence_to_remove}`);

	      twilight_self.updateStatus('<div class="status-message" id="status-message">Select Country to Place</div>');

        	for (var i in twilight_self.countries) {

  	          if (neighbours.includes(i)) {
 
                   let divname = "#" + i;
	           $(divname).off();
        	   $(divname).on('click', function() {

              	     let c = $(this).attr('id');
              	     $('.country').off();

		     let max_influence_to_add = influence_to_remove;
	      	     if (me === "us") {
		       if (twilight_self.isControlled("ussr", c)) {
		         let max_influence_possible = twilight_self.game.countries[c].ussr + twilight_self.game.countries[c].control - 1;
			 while ((twilight_self.game.countries[c].us + max_influence_to_add) > max_influence_possible) {
			   max_influence_to_add--;
			 }
		       }
		     }
	      	     if (me === "ussr") {
		       if (twilight_self.isControlled("us", c)) {
		         let max_influence_possible = twilight_self.game.countries[c].us + twilight_self.game.countries[c].control - 1;
			 while ((twilight_self.game.countries[c].ussr + max_influence_to_add) > max_influence_possible) {
			   max_influence_to_add--;
			 }
		       }
		     }

		     twilight_self.addMove(`place\t${player}\t${player}\t${c}\t${max_influence_to_add}`);
                     twilight_self.placeInfluence(c, max_influence_to_add, me);
		     twilight_self.endTurn();

		  });
	        }
	      }
            });
          }
        }
      }
      return 0;
    }


