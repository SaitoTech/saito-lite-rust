
    //
    // US may discard any number of cards and replace them with a new draw
    //
    if (card == "antiapartheid") {

      this.game.state.events.antiapartheid = 1;

      var twilight_self = this;

      twilight_self.startClockAndSetActivePlayer(1);

      if (twilight_self.game.player == 1) {

        twilight_self.addMove("resolve\tantiapartheid");

        twilight_self.updateStatusWithOptions(`${twilight_self.cardToText(card)}: `,'<ul><li class="option" id="anywhere">2 Influence in Non-Battlegrounds</li><li class="option" id="african">2 Influence in African Battlegrounds</li></ul>', function(action2) {

          let bgs = twilight_self.returnBattlegroundCountries();
          let targets = [];
	  let us_troops = 0;

          if (action2 == "african") {
            for (var i in twilight_self.countries) {
	      if (twilight_self.countries[i].region == "africa" && bgs.includes(i)) {
                if (twilight_self.countries[i].us > 0) {
		  us_troops += twilight_self.countries[i].us;
                  targets.push(i);
                }
              }
            }
          }

          if (action2 == "anywhere") {
            for (var i in twilight_self.countries) {
              if (!bgs.includes(i)) {
                if (twilight_self.countries[i].us > 0) {
                  us_troops += twilight_self.countries[i].us;
                  targets.push(i);
                }
              }
            }
          }

          if (us_troops == 0) {
            twilight_self.updateLog("US has no influence in non-battleground countries");
            twilight_self.endTurn();
	    return 0;
          }

          twilight_self.playerFinishedPlacingInfluence();

          var ops_available = 0;
          for (let i = 0; i < targets.length; i++) {
            $("#"+targets[i]).addClass("easterneurope");
            twilight_self.countries[targets[i]].place = 1;
          }

          let ops_to_purge = Math.min(2, us_troops);

          twilight_self.updateStatus("Remove "+ops_to_purge+" US influence");

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
            twilight_self.updateStatus("Remove "+ops_to_purge+" US influence");
          });
        });
      }
      return 0;

    }

