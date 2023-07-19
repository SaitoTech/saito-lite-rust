

    ///////////////
    // Red Scare //
    ///////////////
    if (card == "redscare") {

      if (player == "ussr") { 
	this.game.state.events.redscare_player2 += 1;
	if (!this.game.state.events.redscare_player2_count) { this.game.state.events.redscare_player2_count = 0; }
	this.game.state.events.redscare_player2_count++;
      }
      if (player == "us") {
	this.game.state.events.redscare_player1 += 1; 
	if (!this.game.state.events.redscare_player1_count) { this.game.state.events.redscare_player1_count = 0; }
	this.game.state.events.redscare_player1_count++;
      }      

      if (!i_played_the_card){
        this.game.queue.push(`ACKNOWLEDGE\t${player.toUpperCase()} plays ${this.cardToText(card)}.`);
      }
      return 1;
    }



