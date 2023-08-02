

    //
    // Camp David
    //
    if (card == "campdavid") {

      // SAITO COMMUNITY
      this.removeCardFromDeckNextDeal("arabisraeli", "Camp David evented");
      this.game.saito_cards_added.push("sudan");

      this.game.state.events.campdavid = 1; //Prevents Arab-Isreali War
      this.cancelEvent("arabisraeli");

      this.updateLog("US gets 1 VP for Camp David Accords");

      this.game.state.vp += 1;
      this.updateVictoryPoints();

      this.placeInfluence("israel", 1, "us");
      this.placeInfluence("egypt", 1, "us");
      this.placeInfluence("jordan", 1, "us");
      
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }





