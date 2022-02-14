
    if (card == "debtcrisis") {
      if (this.game.player == 1) {
        this.updateStatus("<div class='status-message' id='status-message'>US playing Latin American Debt Crisis</div>");
        return 0;
      }

      let cards_available = 0;
      let twilight_self = this;

      let user_message = "Choose a card to discard or USSR doubles influence in two countries in South America:";
      let html = "<ul>";
      for (i = 0; i < this.game.deck[0].hand.length; i++) {
        if (this.modifyOps(this.game.deck[0].cards[this.game.deck[0].hand[i]].ops, this.game.deck[0].hand[i], this.game.player, 0) > 2 && this.game.deck[0].hand[i] != "china") {
          html += `<li class="card" id="${this.game.deck[0].hand[i]}">${this.game.deck[0].cards[this.game.deck[0].hand[i]].name}</li>`;
          cards_available++;
        }
      }
      html += '<li class="card" id="nodiscard">[do not discard]</li></ul>';
      
      this.updateStatusWithOptions(user_message, html, false);


      if (cards_available == 0) {
        this.addMove("resolve\tdebtcrisis");
        this.addMove("latinamericandebtcrisis");
        this.addMove("notify\tUS has no cards available for Latin American Debt Crisis");
        this.endTurn();
        return 0;
      }

      twilight_self.attachCardboxEvents(function(action2) {

        if (action2 == "nodiscard") {
          twilight_self.addMove("resolve\tdebtcrisis");
          twilight_self.addMove("latinamericandebtcrisis");
          twilight_self.endTurn();
          return 0;
        }

        twilight_self.addMove("resolve\tdebtcrisis");
        twilight_self.addMove("discard\tus\t"+action2);
        twilight_self.addMove("notify\tUS discards <span class=\"showcard\" id=\""+action2+"\">"+twilight_self.game.deck[0].cards[action2].name + "</span>");
        twilight_self.removeCardFromHand(action2);
        twilight_self.endTurn();

      });

      return 0;
    }

