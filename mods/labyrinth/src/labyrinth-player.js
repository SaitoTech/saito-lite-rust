

  returnPlayers(num = 0) {

    var players = [];

    for (let i = 0; i < num; i++) {

      players[i] = {};
      players[i].num = i;
      players[i].role = "us";
          
      if (i == 0) {
        if (this.game.options.player1 != undefined) {
          if (this.game.options.player1 != "random") {
            players[i].role = this.game.options.player1;
          }
        }
      }
      if (i == 1) {
        if (this.game.options.player2 != undefined) {
          if (this.game.options.player2 != "random") {
            players[i].role = this.game.options.player2;
          }
        }
      }

    }

    return players;

  }



