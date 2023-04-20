
      
    //
    // Che
    //
    if (card == "che") {
      
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
        
      if (this.game.player == 1) {
        //If the event card has a UI component, run the clock for the player we are waiting on
        this.startClock();
          
        let user_message = `${this.cardToText(card)} takes effect. Pick first target for coup:`;
        let html = '<ul><li class="card" id="skipche">or skip coup</li></ul>';
            
        twilight_self.updateStatusWithOptions(user_message, html, false);
        twilight_self.attachCardboxEvents(function(action2) {
          if (action2 == "skipche") {
            twilight_self.addMove("resolve\tche");
            twilight_self.endTurn();
            twilight_self.updateStatusHeader("Skipping Che coups...");
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
          
          
          


