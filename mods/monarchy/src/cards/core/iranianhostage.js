
    //
    // Iranian Hostage Crisis
    //
    if (card == "iranianhostage") {
      this.game.state.events.iranianhostage = 1;
      if (this.countries["iran"].us > 0) { this.removeInfluence("iran", this.countries["iran"].us, "us"); }
      this.placeInfluence("iran", 2, "ussr");
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }



