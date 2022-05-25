

    //
    // We Will Bury You
    //
    if (card == "wwby") {

      this.game.state.events.wwby = 1;

      this.lowerDefcon(); //Checks for end game
      this.updateDefcon();

      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
        }
      }
      
      return 1;
    }






