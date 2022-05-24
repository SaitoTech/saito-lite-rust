
    //
    // Latin American Death Squads
    //
    if (card == "deathsquads") {
      if (player == "ussr") { this.game.state.events.deathsquads--; }
      if (player == "us") { this.game.state.events.deathsquads++; }
      
      if (!i_played_the_card){
        this.game.queue.push(`ACKNOWLEDGE\t${player.toUpperCase()} plays ${this.cardToText(card)}.`);
      }
      return 1;
    }


