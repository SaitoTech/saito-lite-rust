

    //
    // Iran-Contra Scandal
    //
    if (card == "irancontra") {
      this.game.state.events.irancontra = 1;

      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


