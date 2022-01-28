

    //
    // initialize
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
      this.game.spaces = this.returnSpaces();
      this.game.players_info = this.returnPlayers(this.game.players.length);

      this.initializeDice();

console.log("\n\n\n\n");
console.log("---------------------------");
console.log("---------------------------");
console.log("------ INITIALIZE GAME ----");
console.log("---------------------------");
console.log("---------------------------");
console.log("---------------------------");
console.log("DECK: " + this.game.options.deck);
console.log("\n\n\n\n");

      this.updateStatus("<div class='status-message' id='status-message'>Generating the Game</div>");

      //
      // Game Queue
      //
      this.game.queue.push("round");

      this.game.queue.push("READY");
      this.game.queue.push("DEAL\t1\t2\t8");
      this.game.queue.push("DEAL\t1\t1\t8");
      this.game.queue.push("DECKENCRYPT\t1\t2");
      this.game.queue.push("DECKENCRYPT\t1\t1");
      this.game.queue.push("DECKXOR\t1\t2");
      this.game.queue.push("DECKXOR\t1\t1");
      this.game.queue.push("DECK\t1\t"+JSON.stringify(this.deck));

      this.game.queue.push("init");

    }

console.log("INIT GAME SPACES!");

    //
    // attach events to spaces
    //
    this.spaces = {};
    for (let key in this.game.spaces) {
      this.spaces[key] = this.importSpace(this.game.spaces[key], key);
    }

console.log("DONE INIT GAME SPACES!");

    //
    // add some units
    //
    this.addRegular(1, "london");
    this.addRegular(1, "london");
    this.addRegular(1, "london");
    this.addRegular(1, "london");
    this.addRegular(1, "worms");
    this.addMercenary(2, "paris");
    this.addDebater(2, "venice");
console.log("TEST: " + JSON.stringify(this.spaces['london']));

    //
    // and show the board
    //
    this.displayBoard();

  }


