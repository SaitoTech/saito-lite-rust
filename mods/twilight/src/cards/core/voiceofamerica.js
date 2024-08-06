
    if (card == "voiceofamerica") {


      let ops_to_purge = 4;
      let ops_removable = 0;

      for (var i in this.countries) { if (this.countries[i].ussr > 0) { ops_removable += this.countries[i].ussr; } }
      if (ops_to_purge > ops_removable) { ops_to_purge = ops_removable; }
      if (ops_to_purge <= 0) {
        return 1;
      }

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        this.hud.back_button = false;
        this.hud.back_button_callback = null;
        this.updateStatus("Remove 4 USSR influence from non-European countries (max 2 per country)");

        var twilight_self = this;
        var ops_purged = {};

        twilight_self.playerFinishedPlacingInfluence();
        twilight_self.addMove("resolve\tvoiceofamerica");

        for (var i in this.countries) {

          let countryname  = i;
          ops_purged[countryname] = 0;
          let divname      = '#'+i;

          if (this.countries[i].region != "europe") {

            twilight_self.countries[countryname].place = 1;

            $(divname).off();
            $(divname).on('click', function() {

              let c = $(this).attr('id');

              if (twilight_self.countries[c].place != 1 || twilight_self.countries[c].ussr == 0) {
                twilight_self.displayModal("Invalid Country");
              } else {
                ops_purged[c]++;
                if (ops_purged[c] >= 2) {
                  twilight_self.countries[c].place = 0;
                }
                twilight_self.removeInfluence(c, 1, "ussr", function() {
                  twilight_self.addMove("remove\tus\tussr\t"+c+"\t1");
                  ops_to_purge--;
                  if (ops_to_purge == 0) {
                    twilight_self.playerFinishedPlacingInfluence();
                    twilight_self.endTurn();
                  }
                });
              }
            });

          }
        }
      }
      return 0;
    }



