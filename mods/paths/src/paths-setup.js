

console.log("INITIALIZING PATHS");

    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
      this.game.spaces = this.returnSpaces();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);

console.log("PLAYERS INFO: " + JSON.stringify(this.game.state.players_info));

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
      this.game.queue.push("turn");	// turn 1
      this.game.queue.push("READY");
      this.game.queue.push("init");

      this.game.queue.push("DEAL\t2\t2\t7");
      this.game.queue.push("DEAL\t1\t1\t6"); // player automatically gets Guns of August
      //this.game.queue.push("DEAL\t2\t2\t7");
      //this.game.queue.push("DEAL\t1\t1\t6"); // player chooses Guns of August or extra card 

      this.game.queue.push("DECKENCRYPT\t2\t2");
      this.game.queue.push("DECKENCRYPT\t2\t1");
      this.game.queue.push("DECKXOR\t2\t2");
      this.game.queue.push("DECKXOR\t2\t1");

      this.game.queue.push("DECKENCRYPT\t1\t2");
      this.game.queue.push("DECKENCRYPT\t1\t1");
      this.game.queue.push("DECKXOR\t1\t2");
      this.game.queue.push("DECKXOR\t1\t1");

      let deck = this.returnMobilizationDeck("central");
      delete deck["cp01"];
      this.game.queue.push("DECK\t1\t"+JSON.stringify(deck));
      // this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnMobilizationDeck("central")));
      this.game.queue.push("DECK\t2\t"+JSON.stringify(this.returnMobilizationDeck("allies")));

      //
      // belgium joins the allies
      //
      this.convertCountryToPower("belgium", "allies");

    }

    //
    // all cards with events added to this.deck
    //
    this.deck = this.returnDeck("all");

console.log("INITIALIZING PATHS");

    //
    // and show the board
    //
    this.displayBoard();



  }


