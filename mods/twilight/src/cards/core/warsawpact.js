
    /////////////////
    // Warsaw Pact //
    /////////////////
    if (card == "warsawpact") {

      // SAITO COMMUNITY
      if (!this.game.state.events.nato_added) {
        this.game.state.events.nato_added = 1;
        this.addCardToDeck("nato", "Prerequisites Met");
      }

      this.game.state.events.warsawpact = 1;

      this.startClockAndSetActivePlayer(1);
      if (this.game.player == 1) {

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();

        let html = `
          <ul>
            <li class="option" id="remove">remove all US influence in four countries in Eastern Europe</li>
            <li class="option" id="add">add five USSR influence in Eastern Europe (max 2 per country)</li>
          </ul>`;
        twilight_self.updateStatusWithOptions("USSR establishes the Warsaw Pact:", html, function(action2) {
          const europeanCountries = ["czechoslovakia", "austria", "hungary", "romania", "yugoslavia", "bulgaria", "eastgermany", "poland", "finland"];

          if (action2 == "remove") {

            twilight_self.addMove("resolve\twarsawpact");
            twilight_self.updateStatus('<div class="status-message" id="status-message">Remove all US influence from four countries in Eastern Europe</div>');

            var countries_to_purge = 4;
            var options_purge = [];

            for (var c of europeanCountries) {
              let divname      = '#'+c;
              
              if (twilight_self.countries[c].us > 0) { 
                options_purge.push(c); 
                $(divname).addClass("easterneurope");
                twilight_self.countries[c].place = 1;
              }

            }

            if (options_purge == 0){
              
              twilight_self.displayModal("US has no influence in Eastern Europe", "Add influence instead");
              action2 = "add";

            }else if (options_purge.length <= countries_to_purge) {

              for (let i = 0; i < options_purge.length; i++) {
                twilight_self.addMove("remove\tussr\tus\t"+options_purge[i]+"\t"+twilight_self.countries[options_purge[i]].us);
                twilight_self.removeInfluence(options_purge[i], twilight_self.countries[options_purge[i]].us, "us");
              }

              twilight_self.endTurn();
              twilight_self.updateStatus(`Only ${options_purge.length} countries in Eastern Europe with US influence...`);

            } else {

              var countries_purged = 0;

              $(".easterneurope").off();
              $(".easterneurope").on('click', function() {

                let c = $(this).attr('id');

                if (twilight_self.countries[c].place != 1) {
                  twilight_self.displayModal("Invalid Option", "No US influence to remove");
                } else {
                  twilight_self.countries[c].place = 0;
                  let uspur = twilight_self.countries[c].us;
                  twilight_self.removeInfluence(c, uspur, "us");
                  twilight_self.addMove("remove\tussr\tus\t"+c+"\t"+uspur);
                  countries_purged++;
                
                  if (countries_purged == countries_to_purge) {
                    twilight_self.playerFinishedPlacingInfluence();
                    twilight_self.endTurn();
                  }
                }
              });
            }
          }

          if (action2 == "add") {

            twilight_self.addMove("resolve\twarsawpact");
            twilight_self.updateStatus('<div class="status-message" id="status-message">Add five influence in Eastern Europe (max 2 per country)</div>');

            var ops_to_place = 5;
            var ops_placed = {};

            for (var c of europeanCountries) {

              ops_placed[c] = 0;
              let divname      = '#'+c;
              $(divname).addClass("easterneurope");
              twilight_self.countries[c].place = 1;

            }

            $(".easterneurope").off();
            $(".easterneurope").on('click', function() {

              let c = $(this).attr('id');

              if (twilight_self.countries[c].place != 1) {
                twilight_self.displayModal("Invalid Placement");
              } else {
                ops_placed[c]++;
                ops_to_place--;
                twilight_self.placeInfluence(c, 1, "ussr");
                twilight_self.addMove("place\tussr\tussr\t"+c+"\t1");
                
                if (ops_placed[c] >= 2) { twilight_self.countries[c].place = 0; }
                
                if (ops_to_place == 0) {
                  twilight_self.playerFinishedPlacingInfluence();
                  twilight_self.endTurn();
                }
              }
            });

          }
        });
      }

      return 0;
    }


