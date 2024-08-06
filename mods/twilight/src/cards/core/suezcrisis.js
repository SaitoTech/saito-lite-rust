
    /////////////////
    // Suez Crisis //
    /////////////////
    if (card == "suezcrisis") {

      this.startClockAndSetActivePlayer(1);
      if (this.game.player == 1) {

        var twilight_self = this;

        twilight_self.addMove("resolve\tsuezcrisis");
        twilight_self.updateStatus("Remove four influence from Israel, UK or France");

        let ops_to_purge = 4;
        let options_purge = [];
        let options_available = 0;
        let options_purged = {};

        var israel_ops = twilight_self.countries['israel'].us;
        var uk_ops = twilight_self.countries['uk'].us;
        var france_ops = twilight_self.countries['france'].us;

        if (israel_ops > 2) { israel_ops = 2; }
        if (uk_ops > 2)     { uk_ops = 2; }
        if (france_ops > 2) { france_ops = 2; }

        options_available = israel_ops + uk_ops + france_ops;

        if (options_available <= 4) {

          this.updateLog("Suez Crisis auto-removed available influence");

          if (israel_ops >= 2) { israel_ops = 2; } else {}
          if (uk_ops >= 2) { uk_ops = 2; } else {}
          if (france_ops >= 2) { france_ops = 2; } else {}

          if (israel_ops > 0) {
            twilight_self.removeInfluence("israel", israel_ops, "us");
              twilight_self.addMove("remove\tussr\tus\tisrael\t"+israel_ops);
          }
          if (france_ops > 0) {
            twilight_self.removeInfluence("france", france_ops, "us");
            twilight_self.addMove("remove\tussr\tus\tfrance\t"+france_ops);
          }
          if (uk_ops > 0) {
            twilight_self.removeInfluence("uk", uk_ops, "us");
            twilight_self.addMove("remove\tussr\tus\tuk\t"+uk_ops);
          }
          twilight_self.endTurn();

        } else {

          if (twilight_self.countries['uk'].us > 0) { options_purge.push('uk'); }
          if (twilight_self.countries['france'].us > 0) { options_purge.push('france'); }
          if (twilight_self.countries['israel'].us > 0) { options_purge.push('israel'); }

          for (let m = 0; m < options_purge.length; m++) {

            let countryname = options_purge[m];
            options_purged[countryname] = 0;

            let divname      = '#'+countryname;
            $(divname).addClass("easterneurope");

            $(divname).off();
            $(divname).on('click', function() {

              let c = $(this).attr('id');

              if (options_purged[c] >= 2) {
                twilight_self.displayModal("Invalid Option");
              } else {
                twilight_self.removeInfluence(c, 1, "us");
                twilight_self.addMove("remove\tussr\tus\t"+c+"\t1");
                options_purged[c]++;
                
                ops_to_purge--;
                if (ops_to_purge == 0) {
                  twilight_self.playerFinishedPlacingInfluence();
                  twilight_self.displayModal("All Influence Removed");
                  twilight_self.endTurn();
                }
              }
            });
          }
        }
      }
      return 0;
    }



