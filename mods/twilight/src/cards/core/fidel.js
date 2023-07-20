    ///////////
    // Fidel //
    ///////////
    if (card == "fidel") {

      //
      // SAITO COMMUNITY - united fruit company removed
      //
      if (!this.saito_cards_removed.includes("unitedfruit")) { this.saito_cards_removed.push("unitedfruit"); }


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

