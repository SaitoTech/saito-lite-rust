

    //
    // Quagmire
    //
    if (card == "quagmire") {
      this.game.state.events.norad = 0;
      this.game.state.events.quagmire = 1;
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }



