const GameTemplate = require('../../lib/templates/gametemplate');
const JSON = require('json-bigint');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Labyrinth extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "Labyrinth";
    this.gamename        = "Labyrinth";
    this.slug		 = "labyrinth";
    this.description     = `Labyrinth is a 1-2 player strategic boardgame based around the clash between Islamist jihad and the West in the era of the Global War on Terror.`;
    this.publisher_message = "Labyrinth is owned by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game.";
    this.categories      = "Games Boardgame Strategy";

    this.interface = 1; // graphical interface

    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardWidth  = 5100;

    //
    // newbie mode
    //
    this.confirm_moves = 1;


    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 6;

  }



  ////////////////
  // initialize //
  ////////////////
  initializeGame(game_id) {

    //
    // check user preferences to update interface, if text
    //
    if (this.app?.options?.gameprefs) {
      if (this.app.options.gameprefs.his_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    }

    //
    // re-fill status and log
    //
    if (this.game.status != "") { this.updateStatus(this.game.status); }


    
    //
    // initialize
    //
    let first_time_running = 0;
    if (!this.game.state) {

      first_time_running = 1;
      this.game.state = this.returnState();
      this.game.players_info = this.returnPlayers(this.game.players.length);

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
    // add initial units
    //
    if (first_time_running == 1) {
console.log("is first tiem running: " + this.game.state.scenario);
    }

    //
    // and show the board
    //
    this.displayBoard();

  }


