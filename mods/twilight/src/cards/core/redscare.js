

    ///////////////
    // Red Scare //
    ///////////////
    if (card == "redscare") {
      if (player == "ussr") { this.game.state.events.redscare_player2 += 1; }
      if (player == "us") { this.game.state.events.redscare_player1 += 1; }
      
      if (!i_played_the_card){
        this.game.queue.push(`ACKNOWLEDGE\t${player.toUpperCase()} plays ${this.cardToText(card)}.`);
      }
      return 1;
    }



