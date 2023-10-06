    ///////////
    // Fidel //
    ///////////
    if (card == "fidel") {

      this.game.state.events.fidel = 1;

      //
      // SAITO COMMUNITY - united fruit company removed
      //
      if (!this.game.state.events.unitedfruit_removed) {
        this.game.state.events.unitedfruit_removed = 1;
        this.removeCardFromDeckNextDeal("unitedfruit", "Fidel Evented");
        this.cancelEvent("unitedfruit");
      }


      let usinf = parseInt(this.countries['cuba'].us);
      let ussrinf = parseInt(this.countries['cuba'].ussr);
      this.removeInfluence("cuba", usinf, "us");
      if (ussrinf < 3) {
        this.placeInfluence("cuba", (3-ussrinf), "ussr");
      }
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      
      return 1;
    }

