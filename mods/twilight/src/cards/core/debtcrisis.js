
    if (card == "debtcrisis") {
 
      let ac = this.returnAllCards(true);
     
      let twilight_self = this;

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) { 

        let user_message = "Choose a card to discard or USSR doubles influence in two countries in South America:";
        
        let cards_to_discard = [];

        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (this.game.deck[0].hand[i] != "china") {
            let avops = this.modifyOps(ac[this.game.deck[0].hand[i]].ops, this.game.deck[0].hand[i], "us", 0);
            if (avops >= 3) { 
              cards_to_discard.push(this.game.deck[0].hand[i]);
            }
          }
        }

        cards_to_discard.push("no discard");
        
        this.updateStatusAndListCards(user_message, cards_to_discard, false);

        if (cards_to_discard.length <= 1) {
          this.addMove("resolve\tdebtcrisis");
          this.addMove("latinamericandebtcrisis");
          this.addMove("notify\tUS has no cards available for Latin American Debt Crisis");
          this.endTurn();
          return 0;
        }

        twilight_self.hud.attachControlCallback(function(action2) {
          if (action2 == "no discard") {
            twilight_self.addMove("resolve\tdebtcrisis");
            twilight_self.addMove("latinamericandebtcrisis");
            twilight_self.endTurn();
            return 0;
          }

          twilight_self.addMove("resolve\tdebtcrisis");
          twilight_self.addMove("discard\tus\t"+action2);
          twilight_self.addMove("NOTIFY\tUS discards "+twilight_self.cardToText(action2) + " to resolve "+ twilight_self.cardToText(card));
          twilight_self.removeCardFromHand(action2);
          twilight_self.endTurn();

        });
      }
      return 0;
    }

