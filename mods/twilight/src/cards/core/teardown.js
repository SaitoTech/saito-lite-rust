
    if (card === "teardown") {

      this.game.state.events.teardown = 1;
      this.game.state.events.willybrandt = 0;
      this.cancelEvent("willybrandt");

      if (this.game.state.events.nato == 1) {
        this.game.state.events.nato_westgermany = 1;
      }

      this.placeInfluence("eastgermany", 3, "us");
      
      this.game.queue.push("resolve\tteardown");
      this.game.queue.push("teardownthiswall\tus");
        
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


