/****************************************************************
 *
 * An extension of the Game Engine for single player games
 * to facilitate Arcade events like accept game and end game scenarios
 * so that the League Module can function correctly
 *
 *
 ***************************************************************/

let saito = require("../saito/saito");
let GameTemplate = require("./gametemplate");

class OnePlayerGameTemplate extends GameTemplate {
  constructor(app) {
    super(app);

    this.minPlayers = 1;
    this.maxPlayers = 1;


  }

  returnState() {

    let state = {
      session: {},
      lifetime: {},
    };

    state.session.round = 0;
    state.session.wins = 0;
    state.session.losses = 0;

    state.lifetime.round = 0;
    state.lifetime.wins = 0;
    state.lifetime.losses = 0;

    return state;

  }

  // Create an exp league for single player games by default
  respondTo(type){
    if (type == "default-league") {
      let obj = super.respondTo(type);
      obj.ranking_algorithm = "EXP";
      obj.default_score = 0;
      return obj;
    }
    return super.respondTo(type);
  }


  returnStatsHTML(title = "Solitaire Stats"){

    let html = 
    `<div class="solitaire-stats-overlay">
      <h1>${title}</h1>
      <hr>
      <div class="saito-table">
        <div class="saito-table-header">
          <div class="saito-table-row">
            <div></div>
            <div>Current Session</div>
            <div>Lifetime</div>        
          </div>
        </div>
        <div class="saito-table-body">
          <div class="saito-table-row">
            <div class="saito-table-label">Games Played:</div>
            <div>${this.game.state.session.round} </div>
            <div>${this.game.state.lifetime.round + this.game.state.session.round} </div>
          </div>
          <div class="saito-table-row">
            <div class="saito-table-label">Games Won:</div>
            <div>${this.game.state.session.wins} </div>
            <div>${this.game.state.lifetime.wins + this.game.state.session.wins} </div>
          </div>
          <div class="saito-table-row">
            <div class="saito-table-label">Win Rate (%):</div>
            <div>${(this.game.state.session.round>0)? Math.round(1000* this.game.state.session.wins / (this.game.state.session.round))/10 : 0}</div>
            <div>${(this.game.state.lifetime.round + this.game.state.session.round > 0)? Math.round(1000* (this.game.state.lifetime.wins + this.game.state.session.wins)/ (this.game.state.lifetime.round+ this.game.state.session.round))/10 : 0}</div>
          </div>
        </div>
      </div>
    </div>`;
    return html;
  }




  //initializeSinglePlayerGame(game_data) {
  async processAcceptRequest(tx){

    let txmsg = tx.returnMessage();
    let game_id = txmsg.game_id;

    //Load last session
    this.loadGame();

    //Then overwrite with new id
    this.game.id = game_id;

    this.game.module = this.name;
    this.game.options = txmsg.options;
    this.game.originator = txmsg.originator; //Keep track of who initiated the game
    this.game.players_needed = 1; //So arcade renders correctly

    
    /*
    So people can close (i.e. hide) solitaire games between sessions, but we want the game to persist
    in the wallet (for localized long term stats tracking), we toggle between game.over = 0 and game.over = 2
    (over = 1 is reserved for when the game is over and cannot be played further and will/may trigger deletion)
    */
    this.game.over = 0;

    //
    // enable save game state if observer mode is an advanced option

    //if (this.game.options.observer === "enable") {
    this.game.observer_mode = 1;
    this.game.saveGameState = 1;
    //}

    if (this.game.players_set == 0) {
      this.game.players = [];
      this.game.players.push(this.app.wallet.returnPublicKey());
      this.game.accepted = this.game.players;
      this.game.step.players[this.app.wallet.returnPublicKey()] = 1;
      this.game.players_set = 1;
      this.game.player = 1;

      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!! SINGLE PLAYER GAME CREATED !!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("My Public Key: " + this.app.wallet.returnPublicKey());
      console.log("My Position: " + this.game.player);
      console.log("ALL KEYS: " + JSON.stringify(this.game.players));
      console.log("saving with id: " + game_id);
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
    }else{
      console.log("!!!!!!!!!!!!!!!!!!!!");
      console.log("!!! CONTINUING SINGLE PLAYER GAME !!!");
      console.log("!!!!!!!!!!!!!!!!!!!!");
    }


    this.saveGame(game_id);
    this.initializeGameFeeder(game_id);

    /*
    //
    // single player games with undefined game ids will hash to this dice
    //
    // ... in which case we want to set it randomly
    //
    if (this.game.dice === "dba5865c0d91b17958e4d2cac98c338f85cbbda07b71a020ab16c391b5e7af4b") {
      // single player games do not necessarily have a proper
      // game-id supplied, so we set the dice to a random source
      // on initialize if needed.
      this.game.dice = this.app.crypto.hash(Math.random());
    }
    */

    return this.game.id;
  }


  exitGame(){
    this.updateStatusWithOptions("Saving game to the blockchain...");
    this.prependMove("EXITGAME");
    this.endTurn();
  }

  processResignation(resigning_player, txmsg) {
    let msg = "Close game";
    if (this.game.state?.wins >=0 && this.game.state?.losses >= 0){
      msg = `Wins: ${this.game.state.wins}, Losses: ${this.game.state.losses}`;
    }
    if (this.game.state?.scores){
      msg = "Scores: " + this.game.state.scores.join(", ");
    }
    this.endGame([], msg);
  }

  receiveGameoverRequest(blk, tx, conf, app) {
    console.log("The game never ends when you play by yourself");

    if (!this.browser_active){

      try{
        if (this.game.state?.session){
          for (let x in this.game.state.session){
            this.game.state.lifetime[x] += this.game.state.session[x];
            this.game.state.session[x] = 0;
          }
        }

      }catch(err){
        console.error(err);
      }

      this.game.over = 2;
      this.game.queue.push("READY");
      this.game.moves = [];
      this.saveGame(this.game.id);
    }

    return;
  }


  /**
   * Definition of core gaming logic commands
   */
  initializeQueueCommands() {
    //Take all Game Engine Commands
    super.initializeQueueCommands();

    //Add some more ones
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "EXITGAME") {
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        game_self.updateStatus("Player has exited the building");
        game_self.saveGame(game_self.game.id);
    
        if (game_self.browser_active){
          super.exitGame();
        }

        return 0;
      }

      return 1;
    });
  }

}

module.exports = OnePlayerGameTemplate;
