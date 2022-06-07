
    if (card == "glasnost") {

      let twilight_self = this;

      this.game.state.defcon += 1;
      if (this.game.state.defcon > 5) { this.game.state.defcon = 5; }
      this.game.state.vp -= 2;
      this.updateDefcon();
      this.updateVictoryPoints();

      this.updateLog("DEFCON increases by 1 point");
      this.updateLog("USSR gains 2 VP");

      if (this.game.state.events.reformer == 1) {
        this.game.queue.push("resolve\tglasnost");
        this.game.queue.push("unlimit\tcoups");
        this.game.queue.push("ops\tussr\tglasnost\t4");
        this.game.queue.push("limit\tcoups");
        this.game.queue.push("notify\tUSSR plays 4 OPS for influence or realignments");
      } else {
        if (!i_played_the_card){
          if (player == "ussr"){
            this.game.queue.push(`ACKNOWLEDGE\tUSSR plays ${this.cardToText(card)}.`);
          }else{
            this.game.queue.push(`ACKNOWLEDGE\tUS triggers ${this.cardToText(card)}.`);
          }
        }
        
      }

      return 1;
    }



