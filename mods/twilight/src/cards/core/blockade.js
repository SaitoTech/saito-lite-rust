

    //////////////
    // Blockade //
    //////////////
    if (card == "blockade") {

      //
      // COMMUNITY
      //
      if (this.game.state.events.optional.berlinagreement == 1) {
        this.updateLog(`${this.cardToText("berlinagreement")} prevents ${this.cardToText("blockade")}.`);
        return 1;
      }


      if (this.game.player == 1) {
        this.updateStatus(`<div class='status-message' id='status-message'>US is responding to ${this.cardToText(card)}</div>`);
        this.attachCardboxEvents();
        return 0;
      }
      if (this.game.player == 2) {

        this.addMove("resolve\tblockade");

        let twilight_self = this;
        let available = 0;
        let cards_to_discard = [];

        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (this.game.deck[0].hand[i] != "china") {
            let avops = this.modifyOps(this.game.deck[0].cards[this.game.deck[0].hand[i]].ops, this.game.deck[0].hand[i], this.game.player, 0);
            if (avops >= 3) { 
              available = 1; 
              cards_to_discard.push(this.game.deck[0].hand[i]);
            }
          }
        }

        if (available == 0) {
          this.addMove("remove\tus\tus\twestgermany\t"+this.countries['westgermany'].us);
          this.addMove("NOTIFY\tUS loses all influence from West Germany");
          this.removeInfluence("westgermany", this.countries['westgermany'].us, "us");
          this.endTurn();
          this.updateStatus(`<div class='status-message' id='status-message'>${twilight_self.cardToText("blockade")} played: no cards available to discard.</div>`);
          return 0;
        }

        this.updateStatusWithOptions(`${this.cardToText(card)}:`,'<ul><li class="card" id="discard">discard 3 OP card</li><li class="card" id="remove">remove all US influence in W. Germany</li></ul>',false);
        twilight_self.attachCardboxEvents(function(action) {

          if (action == "discard") {
            
            twilight_self.updateStatusAndListCards("Choose a card to discard:",cards_to_discard,false);
            twilight_self.attachCardboxEvents(function(card) {
              twilight_self.removeCardFromHand(card);
              twilight_self.addMove(`NOTIFY\tUS discarded ${twilight_self.cardToText(card)} to resolve ${twilight_self.cardToText("blockade")}`);
              twilight_self.endTurn();
              return 0;
            });

          }
          if (action == "remove") {
            twilight_self.addMove("remove\tus\tus\twestgermany\t"+twilight_self.countries['westgermany'].us);
            twilight_self.addMove("NOTIFY\tUS loses all influence from West Germany");
            twilight_self.removeInfluence("westgermany", twilight_self.countries['westgermany'].us, "us");
            twilight_self.endTurn();
            twilight_self.updateStatus(`<div class='status-message' id='status-message'>${twilight_self.cardToText("blockade")}: lose all influence in West Germany.</div>`);
            return 0;
          }

        });

        return 0;
      }
    }



