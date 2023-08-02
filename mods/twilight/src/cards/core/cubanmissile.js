
    //
    // Cuban Missile Crisis
    //
    if (card == "cubanmissile") {

      this.game.state.events.cubanmissile = 1;

      // SAITO COMMUNITY
      if (this.game.options.deck === "saito") {
        this.removeCardFromDeckNextDeal("bayofpigs");
        this.cancelEvent("bayofpigs");
      }

      if (this.game.state.events.norad == 1 && this.game.state.defcon != 2 && this.game.state.headline != 1) {
        this.game.state.us_defcon_bonus = 1;
      }

      this.game.state.defcon = 2;
      this.updateDefcon();
      if (player == "ussr") { this.game.state.events.cubanmissilecrisis = 2; }
      if (player == "us") { this.game.state.events.cubanmissilecrisis = 1; }

      
      if (!i_played_the_card){
        this.game.queue.push(`ACKNOWLEDGE\t${player.toUpperCase()} plays ${this.cardToText(card)}.`);
      }
      return 1;
    }



