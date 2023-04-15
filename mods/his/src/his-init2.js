
    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      first_time_running = 1;
      this.game.state = this.returnState();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);
      this.game.spaces = this.returnSpaces();
      this.game.navalspaces = this.returnNavalSpaces();

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
      this.game.queue.push("round");
      this.game.queue.push("READY");
      this.game.queue.push("DECK\t1\t"+JSON.stringify(this.deck));
      this.game.queue.push("init");

    }

    //
    // attach events to spaces
    //
    this.spaces = {};
    for (let key in this.game.spaces) {
      this.spaces[key] = this.importSpace(this.game.spaces[key], key);
    }

    //
    // add initial units
    //
    if (first_time_running == 1) {

      //
      // 1517 scenario
      //
      if (this.game.state.scenario == "1517") {

	// OTTOMAN
        this.addArmyLeader("ottoman", "istanbul", "suleiman");
        this.addArmyLeader("ottoman", "istanbul", "ibrahim-pasha");
        this.addRegular("ottoman", "istanbul", 7);
        this.addCavalry("ottoman", "istanbul", 1);
        this.addNavalSquadron("ottoman", "istanbul", 1);
        this.addRegular("ottoman", "edirne");
        this.addRegular("ottoman", "salonika", 1);
        this.addNavalSquadron("ottoman", "salonika", 1);
        this.addRegular("ottoman", "athens", 1);
        this.addNavalSquadron("ottoman", "athens", 1);

	// HAPSBURG
	this.addArmyLeader("hapsburg", "valladolid", "charles-v");
	this.addArmyLeader("hapsburg", "valladolid", "duke-of-alva");
        this.addRegular("hapsburg", "seville", 1);
        this.addNavalSquadron("hapsburg", "seville", 1);
        this.addRegular("hapsburg", "barcelona", 1);
        this.addNavalSquadron("hapsburg", "barcelona", 1);
        this.addRegular("hapsburg", "navarre", 1);
        this.addRegular("hapsburg", "tunis", 1);
        this.addRegular("hapsburg", "naples", 2);
        this.addNavalSquadron("hapsburg", "naples", 2);
        this.addRegular("hapsburg", "besancon", 1);
        this.addRegular("hapsburg", "brussels", 1);
	this.addArmyLeader("hapsburg", "vienna", "ferdinand");
        this.addRegular("hapsburg", "vienna", 4);
        this.addRegular("hapsburg", "antwerp", 3);

	// ENGLAND
        this.addArmyLeader("england", "london", "henry-viii");
        this.addArmyLeader("england", "london", "charles-brandon");
        this.addRegular("england", "london", 3);
        this.addNavalSquadron("england", "london", 1);
        this.addNavalSquadron("england", "portsmouth", 1);
        this.addRegular("england", "calais", 2);
        this.addRegular("england", "york", 1);
        this.addRegular("england", "bristol", 1);

	// FRANCE
        this.addArmyLeader("france", "paris", "francis-i");
        this.addArmyLeader("france", "paris", "montmorency");
        this.addRegular("france", "paris", 4);
        this.addRegular("france", "rouen", 1);
        this.addNavalSquadron("france", "rouen", 1);
        this.addRegular("france", "bordeaux", 2);
        this.addRegular("france", "lyon", 1);
        this.addRegular("france", "marseille", 1);
        this.addNavalSquadron("france", "marseille", 1);
        this.addRegular("france", "milan", 2);

	// PAPACY
        this.addRegular("papacy", "rome", 1);
        this.addNavalSquadron("papacy", "rome", 1);
        this.addRegular("papacy", "ravenna", 1);
	
	// PROTESTANT
        this.addRegular("papacy", "rome", 1);
        this.addNavalSquadron("papacy", "rome", 1);
        this.addRegular("papacy", "ravenna", 1);
	
	// VENICE
        this.addRegular("venice", "venice", 2);
        this.addNavalSquadron("venice", "venice", 3);
        this.addRegular("venice", "corfu", 1);
        this.addRegular("venice", "candia", 1);
	
	// GENOA
        this.addNavyLeader("genoa", "genoa", "andrea-doria");
        this.addNavalSquadron("genoa", "genoa", 1);
        this.addRegular("genoa", "genoa", 2);
	
	// SCOTLAND
        this.addRegular("scotland", "edinburgh", 3);
        this.addNavalSquadron("scotland", "edinburgh", 1);
	
	// INDEPENDENT
        this.addRegular("independent", "rhodes", 1);
        this.addRegular("independent", "metz", 1);
        this.addRegular("independent", "florence", 1);
	
	// DEBATERS
	this.addDebater("papacy", "eck-debater");
	this.addDebater("papacy", "campeggio-debater");
	this.addDebater("papacy", "aleander-debater");
	this.addDebater("papacy", "tetzel-debater");
	this.addDebater("papacy", "cajetan-debater");

	this.addDebater("protestant", "luther-debater");
	this.addDebater("protestant", "melanchthon-debater");
	this.addDebater("protestant", "bucer-debater");
	this.addDebater("protestant", "carlstadt-debater");
      }

      //
      // 1532 scenario
      //
      if (this.game.state.scenario === "1532") {

      }

      if (this.game.state.scenario === "tournament") {

      }

    }

    //
    // and show the board
    //
    this.displayBoard();

  }


