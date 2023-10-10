
    /////////////////////////
    // Romanian Abdication //
    /////////////////////////
    if (card == "romanianab") {
      let usinf = parseInt(this.countries['romania'].us);
      let ussrinf = parseInt(this.countries['romania'].ussr);
      this.removeInfluence("romania", usinf, "us");
      if (ussrinf < 3) {
        this.placeInfluence("romania", (3-ussrinf), "ussr");
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



