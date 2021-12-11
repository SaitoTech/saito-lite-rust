const GameTemplate = require('../../lib/templates/gametemplate');


//////////////////
// CONSTRUCTOR  //
//////////////////
class HereIStand extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "HereIStand";
    this.gamename        = "Here I Stand";
    this.slug		 = "his";
    this.description     = `Here I Stand is a boardgame based on the military, political and religious conflicts within Europe at the outbreak of the Protestant Reformation (1517-1555). Each player controls one or more major powers that dominated Europe: the Ottoman Empire, the Hapsburgs, England, France, the Papacy and the Protestant states.`;
    this.publisher_message = "Here I Stand is owned by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game.";
    this.categories      = "Games Arcade Entertainment";

    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardgameWidth  = 5100;

    //
    // newbie mode
    //
    this.confirm_moves = 1;

    //
    // max log entries
    //
    this.log_length 	 = 150;

    //
    // default zoom
    //
    this.gameboardZoom   = 0.90;
    this.gameboardMobileZoom = 0.67;

    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 2;
    this.type       	 = "Strategy Boardgame";
    this.categories 	 = "Bordgame Game"

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
    if (this.game.log) { 
      if (this.game.log.length > 0) { 
        for (let i = this.game.log.length-1; i >= 0; i--) { this.updateLog(this.game.log[i]); }
      }
    }

    //
    // initialize
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
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
      this.game.queue.push("init");
    }


    //
    // adjust screen ratio
    //
    try {
      //$('.country').css('width', this.scale(202)+"px");
      //$('.formosan_resolution').css('width', this.scale(202)+"px");
      //$('.formosan_resolution').css('height', this.scale(132)+"px");
      //$('.formosan_resolution').css('top', this.scale(this.countries['taiwan'].top-32)+"px");
      //$('.formosan_resolution').css('left', this.scale(this.countries['taiwan'].left)+"px");



      //
      // INITIALIZE GAME-OBJECTS
      //



