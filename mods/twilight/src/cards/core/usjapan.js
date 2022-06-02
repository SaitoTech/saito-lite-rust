
    /////////////////////////
    // US / Japan Alliance //
    /////////////////////////
    if (card == "usjapan") {
      this.game.state.events.usjapan = 1;
      let usinf = parseInt(this.countries['japan'].us);
      let ussrinf = parseInt(this.countries['japan'].ussr);
      let targetinf = ussrinf + 4;
      if (usinf < (ussrinf +4)){
        this.placeInfluence("japan", (targetinf - usinf), "us");
      }
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }




