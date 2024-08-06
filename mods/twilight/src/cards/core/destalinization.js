
    /////////////////////
    // Destalinization //
    /////////////////////
    if (card == "destalinization") {

      this.game.state.events.destalinization_played = 1;

      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.addMove("resolve\tdestalinization");

        twilight_self.updateStatus('<div class="status-message" id="status-message">Remove four USSR influence from existing countries:</div>');

        let ops_to_purge = 4;

        
        $(".country").off();
        $(".country").on('click', function() {

          let c = $(this).attr('id');

          if (twilight_self.countries[c].ussr <= 0) {
            twilight_self.displayModal("Invalid Option");
            return;
          } else {
            twilight_self.removeInfluence(c, 1, "ussr");
            twilight_self.addMove("remove\tussr\tussr\t"+c+"\t1");
            ops_to_purge--;
            
            if (ops_to_purge == 0) {

              twilight_self.updateStatus('<div class="status-message" id="status-message">Add four USSR influence to any non-US controlled countries</div>');
              twilight_self.playerFinishedPlacingInfluence();

              var ops_to_place = 4;
              var countries_placed = {};
              
              $(".country").off();
              $(".country").on('click', function() {

                let cn = $(this).attr('id');
                if (twilight_self.isControlled("us", cn) == 1) {
                  twilight_self.displayModal("Cannot re-allocate to US controlled countries");
                  return;
                }
                if (!countries_placed[cn]){
                  countries_placed[cn] = 0;
                }

                if (countries_placed[cn] == 2) {
                  twilight_self.displayModal("Cannot place more than 2 influence in any one country");
                  return;
                } else {
                  twilight_self.placeInfluence(cn, 1, "ussr");
                  twilight_self.addMove("place\tussr\tussr\t"+cn+"\t1");
                  ops_to_place--;
                  countries_placed[cn]++;
                  if (ops_to_place == 0) {
                    twilight_self.playerFinishedPlacingInfluence();
                    twilight_self.endTurn();
                  }
                }
                
              });
              
            }
          }
        });
      
      }
      return 0;
    }


