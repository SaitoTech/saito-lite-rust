
    ////////////
    // Truman //
    ////////////
    if (card == "truman") {

      var twilight_self = this;

      var options_purge = [];
      for (var i in this.countries) {
        if (this.countries[i].region === "europe") {
          if (twilight_self.countries[i].ussr > 0 && twilight_self.whoControls(i) == "") { 
            options_purge.push(i); 
          }
        }
      }

      if (options_purge.length == 0) {
        this.updateLog("USSR has no influence that can be removed by Truman");
        return 1;
      }

      if (options_purge.length == 1) {
        twilight_self.removeInfluence(options_purge[0], twilight_self.countries[options_purge[0]].ussr, "ussr");
        this.updateLog("Truman removes all USSR influence from " + options_purge[0]);
        return 1;
      }

      this.startClockAndSetActivePlayer(2);
      if (this.game.player == 2) {

        for (let i of options_purge) {
          $(`#${i}`).addClass("westerneurope");
          this.countries[i].place = 1;
        }

        twilight_self.updateStatus("Select a non-controlled country in Europe to remove all USSR influence:");
        twilight_self.addMove("resolve\ttruman");
        
        $(".westerneurope").off();
        $(".westerneurope").on('click', function() {
          let c = $(this).attr('id');
          let ussrpur = twilight_self.countries[c].ussr;
          twilight_self.removeInfluence(c, ussrpur, "ussr");
          twilight_self.addMove(`NOTIFY\t${twilight_self.cardToText(card)}: US removes all USSR influence from `+twilight_self.countries[c].name);
          twilight_self.addMove("remove\tus\tussr\t"+c+"\t"+ussrpur);
          twilight_self.playerFinishedPlacingInfluence();
          twilight_self.endTurn();
        });
        
      }

      return 0;
    }



