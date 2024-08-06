
      
    //
    // Che
    //
    if (card == "che") {

      this.game.state.events.che = 1;
 
   
      //
      // SAITO COMMUNITY - united fruit company removed
      //
      if (this.game.state.events.unitedfruit_removed != 1) {
        this.game.state.events.unitedfruit_removed = 1;
        this.cancelEvent("unitedfruit");
        this.removeCardFromDeckNextDeal("unitedfruit", "Che Evented");
      }
     
      let twilight_self = this;
      let valid_targets = 0;
      let couppower = 3;
      
      if (player == "us") { couppower = this.modifyOps(3,"che","us"); }
      if (player == "ussr") { couppower = this.modifyOps(3,"che","ussr"); } 
       
      for (var c in this.countries) {
        
        if ( twilight_self.countries[c].bg == 0 && (twilight_self.countries[c].region == "africa" || twilight_self.countries[c].region == "camerica" || twilight_self.countries[c].region == "samerica") && twilight_self.countries[c].us > 0 ) {
          valid_targets++;
          $("#"+c).addClass("easterneurope");
        }
      }

      if (valid_targets == 0) {
        this.updateLog("No valid targets for Che");
        return 1;
      } 
        
      this.startClockAndSetActivePlayer(1);

      if (this.game.player == 1) {
          
        let user_message = `${this.cardToText(card)} takes effect. Pick first target for coup:`;
        let html = '<ul><li class="option" id="skipche">or skip coup</li></ul>';
            
        twilight_self.updateStatusWithOptions(user_message, html, function(action2) {
          if (action2 == "skipche") {
            twilight_self.addMove("resolve\tche");
            twilight_self.endTurn();
            twilight_self.updateStatus("Skipping Che coups...");
          }
        });
          
        $(".easterneurope").on('click', function() {
          let c = $(this).attr('id');
          twilight_self.addMove("resolve\tche");
          twilight_self.addMove("checoup\tussr\t"+c+"\t"+couppower);
          twilight_self.addMove("NOTIFY\tChe launches coup in "+twilight_self.countries[c].name);
          twilight_self.addMove("milops\tussr\t"+couppower);
          twilight_self.endTurn();
          twilight_self.playerFinishedPlacingInfluence(player);
        }); 
      }
      return 0;
    }     
          
          
          


