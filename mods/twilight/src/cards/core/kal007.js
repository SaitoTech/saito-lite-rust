
    if (card == "KAL007") {

      this.game.state.vp += 2;
      this.updateVictoryPoints();

      this.lowerDefcon();

      if (this.isControlled("us", "southkorea") == 1) {
        this.game.queue.push("resolve\tKAL007");
        this.game.queue.push("unlimit\tcoups");
        this.game.queue.push("ops\tus\tKAL007\t4");
        this.game.queue.push("setvar\tgame\tstate\tback_button_cancelled\t1");
        this.game.queue.push("limit\tcoups"); 
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


