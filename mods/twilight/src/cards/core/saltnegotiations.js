

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

      let my_go = 0;

      if (player === "ussr" && this.game.player == 1) { my_go = 1; }
      if (player === "us" && this.game.player == 2) { my_go = 1; }

      if (my_go == 0) {
        this.updateStatus("<div class='status-message' id='status-message'>Opponent retrieving card from discard pile</div>");
        return 0;
      }

      // pick discarded card
      var twilight_self = this;

      let html = "<ul>";
      for (var i in this.game.deck[0].discards) {
        if (this.game.deck[0].discards[i].scoring == 0) {
          if (this.game.state.events.shuttlediplomacy == 0 || (this.game.state.events.shuttlediplomacy == 1 && i != "shuttle")) {
            html += '<li class="card" id="'+i+'">'+this.game.deck[0].discards[i].name+'</li>';
          }
        }
      }
      html += '<li class="card" id="nocard">do not reclaim card...</li></ul>';
      
      twilight_self.updateStatusWithOptions("Choose Card to Reclaim:",html,false);
      twilight_self.addMove("resolve\tsaltnegotiations");
      twilight_self.attachCardboxEvents(function(action2) {

        if (action2 != "nocard") {
          twilight_self.game.deck[0].hand.push(action2);
          twilight_self.addMove("notify\t"+player.toUpperCase() +" retrieved "+twilight_self.game.deck[0].cards[action2].name);
        } else {
          twilight_self.addMove("notify\t"+player.toUpperCase() +" does not retrieve card");
        }
        twilight_self.addMove("undiscard\t"+action2); 
        twilight_self.endTurn();

      });

      return 0;
    }



