

    //
    // The Iron Lady
    //
    if (card == "ironlady") {

      // SAITO COMMUNITY
      this.removeCardFromDeckNextDeal("socgov", "The Iron Lady evented");


      this.updateLog("US gains 1 VP from The Iron Lady");
      this.game.state.vp += 1;
      this.updateVictoryPoints();

      //
      // keep track of whether the USSR has influence in Argentina in order
      // to know whether it can place there or beside Argentina if it plays
      // ops after the event, and uses the US event to get influence into the
      // country..
      //
      this.game.state.ironlady_before_ops = 1;
      this.cancelEvent("socgov");

      this.placeInfluence("argentina", 1, "ussr");
      if (this.countries["uk"].ussr > 0) { this.removeInfluence("uk", this.countries["uk"].ussr, "ussr"); }

      this.game.state.events.ironlady = 1;

      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }



