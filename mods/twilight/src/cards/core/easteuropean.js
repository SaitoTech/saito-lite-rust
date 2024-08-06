
    //////////////////////////
    // East European Unrest //
    //////////////////////////
    if (card == "easteuropean") {

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        var twilight_self = this;

        let ops_to_purge = (this.game.state.round > 7)? 2: 1;
        let countries_to_purge = 3;
        let options_purge = [];

        twilight_self.addMove("resolve\teasteuropean");

        if (twilight_self.countries['czechoslovakia'].ussr > 0) { options_purge.push('czechoslovakia'); }
        if (twilight_self.countries['austria'].ussr > 0) { options_purge.push('austria'); }
        if (twilight_self.countries['hungary'].ussr > 0) { options_purge.push('hungary'); }
        if (twilight_self.countries['romania'].ussr > 0) { options_purge.push('romania'); }
        if (twilight_self.countries['yugoslavia'].ussr > 0) { options_purge.push('yugoslavia'); }
        if (twilight_self.countries['bulgaria'].ussr > 0) { options_purge.push('bulgaria'); }
        if (twilight_self.countries['eastgermany'].ussr > 0) { options_purge.push('eastgermany'); }
        if (twilight_self.countries['poland'].ussr > 0) { options_purge.push('poland'); }
        if (twilight_self.countries['finland'].ussr > 0) { options_purge.push('finland'); }

        if (options_purge.length <= countries_to_purge) {
          //Speed up the game and select for the player
          let msg = `${twilight_self.cardToText(card)}: Auto remove ${ops_to_purge} OPS from `
          for (let i = 0; i < options_purge.length; i++) {
            twilight_self.addMove("remove\tus\tussr\t"+options_purge[i]+"\t"+ops_to_purge);
            twilight_self.removeInfluence(options_purge[i], ops_to_purge, "ussr");
            msg += twilight_self.countries[options_purge[i]].name + ", ";
          }
          twilight_self.addMove("NOTIFY\t"+msg.slice(0, -2));
          twilight_self.endTurn();
        } else {

          twilight_self.updateStatus("Remove "+ops_to_purge+" from 3 countries in Eastern Europe");          

          for (let c of options_purge) {
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
              let o = Math.min(ops_to_purge, twilight_self.countries[c].ussr);
              twilight_self.removeInfluence(c, o, "ussr");
              twilight_self.addMove("remove\tus\tussr\t"+c+"\t"+o);
              
              countries_to_purge--;
              if (countries_to_purge == 0) {
                twilight_self.playerFinishedPlacingInfluence();
                twilight_self.endTurn();
                return 0;
              }
            }
          });
        }
      }
      return 0;

    }



