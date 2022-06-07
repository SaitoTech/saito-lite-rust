
    if (card == "reagan") {

      let us_vp = 0;
      let x = this.countries["libya"].ussr;

      if (x >= 2) {
        while (x > 1) {
          x -= 2;
          us_vp++;
        }
        this.updateLog("<span>Reagan bombs Libya and US scores</span> "+us_vp+" <span>VP</span>");
        this.game.state.vp += us_vp;
        this.updateVictoryPoints();
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




