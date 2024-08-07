
    if (card == "ortega") {
      
      let purginf = this.countries["nicaragua"].us;
      this.removeInfluence("nicaragua", purginf, "us");
      
      let can_coup = 0;

      if (this.countries["cuba"].us > 0) { can_coup = 1; }
      if (this.countries["honduras"].us > 0) { can_coup = 1; }
      if (this.countries["costarica"].us > 0) { can_coup = 1; }

      if (can_coup == 0) {
        this.updateLog("notify\tUSSR does not have valid coup target");
        return 1;
      }

      if (this.game.state.events.cubanmissilecrisis == 1) {
        this.updateStatus("USSR is under Cuban Missile Crisis and cannot coup. Skipping Ortega coup.");
        this.updateLog("USSR is under Cuban Missile Crisis and cannot coup. Skipping Ortega coup.");
        return 1;
      }

      this.startClockAndSetActivePlayer(1);
      if (this.game.player == 1){

        let twilight_self = this;
        let neighbors = ["costarica","cuba","honduras"];      

        twilight_self.updateStatusWithOptions("Pick a country adjacent to Nicaragua to coup:", '<ul><li class="option" id="skiportega">or skip coup</li></ul>', function(action2) {
          if (action2 == "skiportega") {
            twilight_self.updateStatus("Skipping Ortega coup...");
            twilight_self.addMove("resolve\tortega");
            twilight_self.endTurn();
          }
        })

        //To Launch the Coup


        for (var c of neighbors) {
          $("#"+c).addClass("easterneurope");
        }

        $(".easterneurope").off();
        $(".easterneurope").on('click', function() {
          let c = $(this).attr('id');

          if (twilight_self.countries[c].us>0){
            twilight_self.playerFinishedPlacingInfluence();
            twilight_self.addMove("resolve\tortega");
            twilight_self.addMove("unlimit\tmilops");
            twilight_self.addMove("coup\tussr\t"+c+"\t2");
            twilight_self.addMove("limit\tmilops");
            twilight_self.addMove("notify\tUSSR launches coup in "+twilight_self.countries[c].name + " with " + twilight_self.cardToText(card));
            twilight_self.endTurn();  
          }else{
            twilight_self.displayModal("Invalid Target", "No US influence to coup");
          }
        });   
      }      
      return 0;
    }




