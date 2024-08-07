
    if (card == "starwars") {

      let ac = this.returnAllCards(true);

      if (this.game.state.space_race_us <= this.game.state.space_race_ussr) {
        this.updateLog(`US is not ahead of USSR in the space race (${this.cardToText(card)})`);
        return 1;
      }

      this.game.state.events.starwars = 1;

      // otherwise sort through discards
    
      let discard_deck = [];

      var twilight_self = this;

      this.addMove("resolve\tstarwars");

      for (var i in this.game.deck[0].discards) {
        if (this.game.state.headline == 1 && i == "unintervention") {} else {
          if (ac[i] != undefined) {
            if (ac[i].name != undefined) {
              if (ac[i].scoring != 1) {
                if (this.game.state.events.shuttlediplomacy == 0 || (this.game.state.events.shuttlediplomacy == 1 && i != "shuttle")) {
                  discard_deck.push(i);
                } 
              }
            }
          }
        }
      }

      if (discard_deck.length == 0) {
        twilight_self.addMove(`NOTIFY\tUS cannot use ${this.cardToText(card)} as no cards to retrieve`);
        twilight_self.endTurn();
        return 1;
      }

      this.startClockAndSetActivePlayer(2);
      
      if (this.game.player == 2) {
    
        twilight_self.updateStatusAndListCards(`${this.cardToText(card)}: Choose card to play immediately:`, discard_deck, false);
        twilight_self.hud.attachControlCallback(function(action2) {
          twilight_self.addMove("event\tus\t"+action2);
          twilight_self.addMove("NOTIFY\t"+player+" retrieved "+twilight_self.cardToText(action2));
          twilight_self.addMove("undiscard\t"+action2);
          twilight_self.endTurn();
        });
      }
      return 0;
    }


