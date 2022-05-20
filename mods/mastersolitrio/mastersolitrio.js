var ModTemplate = require('../../lib/templates/modtemplate');


//////////////////
// CONSTRUCTOR  //
//////////////////
//
// This module is not a game module but a regular module. It will replace
// some of the functionality in the Solitrio Module IF INSTALLED so as to
// add performance testing. The following game functions are replaced:
//
// initializeGame(game_id);
// newRound()
// handleGameLoop()
//
class MasterSolitrio extends ModTemplate {

  constructor(app) {

    super(app);

    this.name            = "MasterSolitrio";
    this.description     = 'Not afraid of Solitrio? You will be...';
    this.categories      = "Games Entertainment";

    this.publickey       = app.wallet.returnPublicKey();

  }

  initialize(app) {
console.log("MASTER SOLITRIO UPDATE!");
    for (let i = 0; i < app.modules.mods.length; i++) {
      if (app.modules.mods[i].name === "Solitrio") {
        app.modules.mods[i].initializeGame = this.replace_initializeGame;
        app.modules.mods[i].newRound = this.replace_newRound;
        app.modules.mods[i].handleGameLoop = this.replace_handleGameLoop;
      }
    }
  }

  shouldAffixCallbackToModule(modname, tx=null) {
    if (modname == "Solitrio") { return 1; }
    return 0;
  }


  async onConfirmation(blk, tx, confnum, app) {

    if (confnum == 0) {

      let txmsg = tx.returnMessage();
      console.log("OBSERVE SOLITRIO TX: " + JSON.stringify(txmsg));

      //
      // check if is registereded game
      //
      let sql = `SELECT count(*) AS count FROM games WHERE game_id = $game_id`;
      let params = { game_id : txmsg.game_id };
      let rows = await this.app.storage.queryDatabase(sql, params, "mastersolitrio");
      if (rows) {
        if (rows.length > 0) {
          if (rows[0].count > 0) {
console.log("GAME MOVE IN MONITORED SOLITRIO GAME");
	  }
	}
      }
    }
  }



  replace_initializeGame(game_id) {

    console.log("MASTER SOLITRIO");

    if (this.game.status != "") { this.updateStatus(this.game.status); }
    this.updateStatus("loading game...");

    this.loadGame(game_id);
    
    if (!this.game.state) {
      console.log("******Generating the Game******");
      this.game.state = this.returnState();
      this.game.queue = [];
      this.game.queue.push("round");
      this.game.queue.push("READY");
    }
    
    if (this.browser_active){
      $('.slot').css('min-height', $('.card').css('min-height'));  
    }
  }

  replace_newRound(){

    console.log("MASTER SOLITRIO NEW ROUND");

    //Set up queue
    this.game.queue = [];
    this.game.queue.push("play");
    this.game.queue.push("DEAL\t1\t1\t40");
    this.game.queue.push("SHUFFLE\t1\t1");
    this.game.queue.push("DECK\t1\t"+JSON.stringify(this.returnDeck()));

    //Clear board
    this.game.board = {};

    //Reset/Increment State
    this.game.state.round++;
    this.game.state.recycles_remaining = 2;
  }



  replace_handleGameLoop(msg=null) {
    let solitrio_self = this;

    this.saveGame(this.game.id);
    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

      let qe = this.game.queue.length-1;
      let mv = this.game.queue[qe].split("\t");
      let shd_continue = 1;

      console.log(JSON.stringify(mv));

      if (mv[0] === "round") {
        this.newRound();
      }

      if (mv[0] === "win"){
        this.game.state.wins++;
        this.newRound();
      }

      if (mv[0] === "play") {
        //this.game.queue.splice(qe, 1);
        if (this.browser_active){
          this.handToBoard();        
          this.displayBoard();
          this.displayUserInterface();  
        }        
        return 0;
      }

      if (mv[0] === "exit_game"){
        this.game.queue.splice(qe, 1);
        let player = parseInt(mv[1])
        this.saveGame(this.game.id);

        if (this.game.player === player){
          window.location.href = "/arcade";
        }else{
          this.updateStatus("Player has exited the building");
        }
        return 0;
      }

      if (mv[0] === "shuffle"){
        this.game.queue.splice(qe, 1);
        this.scanBoard(true);
        this.game.state.recycles_remaining--;
        return 1;
      }
      
      if (mv[0] === "move"){
        this.game.queue.splice(qe, 1);
        let card = mv[1];     //rowX_slotY
        let emptySlot = mv[2];//rowX_slotY

        let x = this.parseIndex(card);
        let y = this.parseIndex(emptySlot);

        let temp = this.game.deck[0].hand[x];
        this.game.deck[0].hand[x] = this.game.deck[0].hand[y];
        this.game.deck[0].hand[y] = temp;
        return 1;
      }

      //
      // avoid infinite loops
      //
      if (shd_continue == 0) { 
        console.log("NOT CONTINUING");
        return 0; 
      }

    } 
    return 1;
  }

}

module.exports = MasterSolitrio;


