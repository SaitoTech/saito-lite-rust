

    //
    // Salt Negotiations
    //
    if (card == "saltnegotiations") {

      // update defcon
      this.game.state.defcon += 2;
      if (this.game.state.defcon > 5) { this.game.state.defcon = 5; }
      this.updateDefcon();

      // affect coups
      this.game.state.events.saltnegotiations = 1;

      // otherwise sort through discards
      let discardlength = 0;
      for (var i in this.game.deck[0].discards) { discardlength++; }
      if (discardlength == 0) {
        this.updateLog("No cards in discard pile");
        return 1;
      }

      this.startClockAndSetActivePlayer(this.roles.indexOf(player));

      if (i_played_the_card) {

        // pick discarded card
        var twilight_self = this;

        let discard_deck = [];
        for (var i in this.game.deck[0].discards) {
        	// edge-case bug where scoring is not in scoring card (???)
        	try {
            if (this.game.deck[0].discards[i].scoring == 0) {
              if (this.game.state.events.shuttlediplomacy == 0 || (this.game.state.events.shuttlediplomacy == 1 && i != "shuttle")) {
                discard_deck.push(i);
                console.log(i);
                //html += '<li class="option" id="'+i+'">'+this.game.deck[0].discards[i].name+'</li>';
              }
            }
          } catch (err) {
        	  console.log("ERROR: please check scoring error in SALT for card: " + i);
        	}
        }
        
        twilight_self.updateStatusAndListCards("Choose Card to Reclaim:",discard_deck,true);
        twilight_self.addMove("resolve\tsaltnegotiations");

        twilight_self.hud.attachControlCallback(function(action2) {
          twilight_self.game.deck[0].hand.push(action2);
          twilight_self.addMove("NOTIFY\t"+player.toUpperCase() +" retrieved "+twilight_self.cardToText(action2));
          twilight_self.addMove("undiscard\t"+action2); 
          twilight_self.endTurn();
        });

        twilight_self.bindBackButtonFunction(()=>{
          twilight_self.addMove("NOTIFY\t"+player.toUpperCase() +" does not retrieve card");
          twilight_self.endTurn();
        })
                  
      }
     return 0;
    }


