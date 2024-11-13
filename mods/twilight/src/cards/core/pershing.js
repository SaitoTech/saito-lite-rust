
    //
    // Pershing II Deployed
    //
    if (card == "pershing") {

      this.startClockAndSetActivePlayer(1);
      
      if (this.game.player == 1) {

        var twilight_self = this;
        this.updateStatus(`<div class='status-message' id='status-message'>${this.cardToText(card)}: Remove 3 US influence from Western Europe (max 1 per country)</div>`);
        
        twilight_self.playerFinishedPlacingInfluence();

        twilight_self.addMove("resolve\tpershing");
        twilight_self.addMove("vp\tussr\t1");

        let valid_targets = [];
        for (var countryname in this.countries) {
          if (countryname == "turkey" ||
              countryname == "greece" ||
              countryname == "spain" ||
              countryname == "italy" ||
              countryname == "france" ||
              countryname == "canada" ||
              countryname == "uk" ||
              countryname == "benelux" ||
              countryname == "denmark" ||
              countryname == "austria" ||
              countryname == "norway" ||
              countryname == "sweden" ||
              countryname == "finland" ||
              countryname == "westgermany"){
            if (this.countries[countryname].us > 0) {
              valid_targets.push(countryname);
              this.countries[countryname].place = 1;
              $("#"+countryname).addClass("easterneurope");
            }  
          }
        }

        if (valid_targets.length == 0) {
          twilight_self.addMove("NOTIFY\tUS does not have any targets for "+ twilight_self.cardToText(card));
          twilight_self.endTurn();
          return;
        }

        var ops_to_purge = Math.min(valid_targets.length, 3);

        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {

          let c = $(this).attr('id');

          if (twilight_self.countries[c].place != 1) {
            twilight_self.displayModal("Invalid Country");
          } else {
            twilight_self.countries[c].place = 0;
            twilight_self.removeInfluence(c, 1, "us");
            
            twilight_self.addMove("remove\tussr\tus\t"+c+"\t1");
            ops_to_purge--;
            if (ops_to_purge == 0) {
              twilight_self.playerFinishedPlacingInfluence();
              twilight_self.endTurn();
            }  
            twilight_self.updateStatus(`<div class='status-message' id='status-message'>${twilight_self.cardToText(card)}: Remove ${ops_to_purge} US influence from Western Europe (max 1 per country)</div>`);
          }
        });
      }
      return 0;
    }


