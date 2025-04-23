
    if (card === "teardown") {

      // SAITO COMMUNITY
      if (this.game.options.deck === "saito") {
	       this.removeCardFromDeckNextDeal("willybrandt");
      }

      this.game.state.events.teardown = 1;
      this.game.state.events.willybrandt = 0;
      this.game.state.events.willybrandt_cancelled = 1;
      this.cancelEvent("willybrandt");

      if (this.game.state.events.nato == 1) {
        this.game.state.events.nato_westgermany = 1;
      }

      this.placeInfluence("eastgermany", 3, "us");
      
      this.game.queue.push("resolve\tteardown");
      this.game.queue.push("teardownthiswall\tus");
      this.game.queue.push("setvar\tgame\tstate\tback_button_cancelled\t1");
        
      if (!i_played_the_card){
        if (player == "ussr"){
          this.game.queue.push(`ACKNOWLEDGE\tUSSR triggers ${this.cardToText(card)}.`);
        }else{
          this.game.queue.push(`ACKNOWLEDGE\tUS plays ${this.cardToText(card)}.`);
        }
      }
      return 1;
    }


