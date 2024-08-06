

    //////////////
    // Blockade //
    //////////////
    if (card == "blockade") {

      this.game.state.events.blockade = 1;

      let ac = this.returnAllCards(true);

      //
      // COMMUNITY
      //
      if (this.game.state.events.optional.berlinagreement == 1) {
        this.updateLog(`${this.cardToText("berlinagreement")} prevents ${this.cardToText("blockade")}.`);
        return 1;
      }

      this.startClockAndSetActivePlayer(2);

      if (this.game.player == 2) {

        this.addMove("resolve\tblockade");

        let twilight_self = this;
        
        let cards_to_discard = [];

        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
          if (this.game.deck[0].hand[i] != "china") {
            let avops = this.modifyOps(ac[this.game.deck[0].hand[i]].ops, this.game.deck[0].hand[i], "us", 0);
            if (avops >= 3) { 
              cards_to_discard.push(this.game.deck[0].hand[i]);
            }
          }
        }

        if (cards_to_discard.length == 0) {
          this.addMove("remove\tus\tus\twestgermany\t"+this.countries['westgermany'].us);
          this.addMove("NOTIFY\tUS loses all influence from West Germany");
          this.removeInfluence("westgermany", this.countries['westgermany'].us, "us");
          this.endTurn();
          this.updateStatus(`<div class='status-message' id='status-message'>${twilight_self.cardToText("blockade")} played: no cards available to discard.</div>`);
          return 0;
        }

        this.updateStatusWithOptions(`${this.cardToText(card)}:`,'<ul><li class="option" id="discard">discard 3 OP card</li><li class="option" id="remove">remove all US influence in W. Germany</li></ul>', function(action) {

          if (action == "discard") {
            
            twilight_self.updateStatusAndListCards("Choose a card to discard:",cards_to_discard, function(card) {
              twilight_self.removeCardFromHand(card);
	      twilight_self.addMove("discard\tus\t"+card);
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
      
      }else{
        this.updateStatus(`<div class='status-message' id='status-message'>US is responding to ${this.cardToText(card)}</div>`);
      }
      return 0;
    }



