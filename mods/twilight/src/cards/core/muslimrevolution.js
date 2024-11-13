
    if (card == "muslimrevolution") {

      if (this.game.state.events.awacs == 1) { 
        this.updateLog(`${this.cardToText("muslimrevolution")} prevented by ${this.cardToText("awacs")}}`);
        return 1; 
      }

      var countries_to_purge = 2;
      let muslim_countries = [];

      for (var i in this.countries) {
        if (i == "sudan" || i == "egypt" || i == "libya" || i == "syria" || i == "iran" || i == "iraq" || i == "jordan" || i == "saudiarabia") {
          if (this.countries[i].us > 0) {
            muslim_countries.push(i);
          }
        }
      }

      if (muslim_countries.length == 0) {
        this.updateLog("Muslim Revolutions targets no countries with US influence.");
        return 1;
      }

      if (muslim_countries.length <= 2) {
        for (var i of muslim_countries) {
          this.updateLog("Muslim Revolutions removes all US influence in "+i);
          this.removeInfluence(i, this.countries[i].us, "us");
        }
      
        if (!i_played_the_card){
          if (player == "ussr"){
            this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
          }else{
            this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
          }
        }

        return 1;
      }

      //
      // or ask the USSR to choose
      //
      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {

        this.updateStatus("Remove All US influence from 2 countries among: Sudan, Egypt, Iran, Iraq, Libya, Saudi Arabia, Syria, Jordan.");

        var twilight_self = this;
        twilight_self.playerFinishedPlacingInfluence();
        twilight_self.addMove("resolve\tmuslimrevolution");

        for (var i of muslim_countries) {
          $("#"+i).addClass("easterneurope");
        }
          $(".easterneurope").off();
          $(".easterneurope").on('click', function() {

            let c = $(this).attr('id');

            if (twilight_self.countries[c].us <= 0) {
              twilight_self.displayModal("Invalid Country");
            } else {
              let purginf = twilight_self.countries[c].us;
              twilight_self.removeInfluence(c, purginf, "us");
              
              twilight_self.addMove("remove\tussr\tus\t"+c+"\t"+purginf);
              countries_to_purge--;
              if (countries_to_purge == 0) {
                twilight_self.playerFinishedPlacingInfluence();
                twilight_self.endTurn();
              }
            }
          });        
      }
      return 0;
    }



