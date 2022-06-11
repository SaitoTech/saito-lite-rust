

    //
    // Panama Canal
    //
    if (card == "panamacanal") {
      this.placeInfluence("panama", 1, "us");
      this.placeInfluence("venezuela", 1, "us");
      this.placeInfluence("costarica", 1, "us");
       if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


