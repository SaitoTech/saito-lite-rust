const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const ArcadeObserver = require("./lib/appspace/arcade-observer");
const GameObserver = require("./lib/components/game-observer");
const ObserverLoader = require("./lib/components/observer-loader");
const JSON = require("json-bigint");


class Observer extends ModTemplate {
  constructor(app) {
    super(app);
    this.name = "Observer";
    this.affix_callbacks_to = [];

    this.games = [];


    this.game_id = null;
    this.game_states = [];
    this.game_moves = [];
    this.future_moves = [];

    this.fast_forward = 0;
    this.step_speed = 2000;
    this.is_paused = true;

    this.debug = true;
    this.controls = null;
  }


  initialize(app) {
    super.initialize(app);

    //
    // listen for txs from arcade-supporting games
    //
    this.app.modules.respondTo("arcade-games").forEach((mod) => {
      this.affix_callbacks_to.push(mod.name);
    });

  }

  renderArcade(app, mod, elem_id){
  	 try{
        this.games.forEach((observe) => {
          let ob = new ArcadeObserver(app, observe);
          ob.render(app, this, elem_id);
        });
      }catch(err){
        console.log(err);
      }
  }

  renderControls(app, game_mod){
  	if (!this.controls){
	    this.controls = new GameObserver(app);
  	}
  	this.controls.render(app, game_mod);
  }

  attachEvents(app, mod) {
  }


  shouldAffixCallbackToModule(modname) {
    for (let i = 0; i < this.affix_callbacks_to.length; i++) {
      if (this.affix_callbacks_to[i] == modname) {
        return 1;
      }
    }
    return 0;
  }


  //
  // load transactions into interface when the network is up
  onPeerHandshakeComplete(app, peer) {
    // fetch any usernames needed
    if (this.app.BROWSER == 1) {
      app.browser.addIdentifiersToDom();
    }

    // load observer games (active) -- ASC
    //
    this.sendPeerDatabaseRequestWithFilter(
      "Observer", /*DISTINCT id, count(id) as count, last_move, game_id, module, player, players_array*/
      `SELECT DISTINCT step, count(step) as count, * FROM gamestate GROUP BY game_id ORDER BY count DESC LIMIT 8`,
      (res) => {
        if (res.rows) {
          console.log("GAMESTATES:");
          res.rows.forEach((row) => {
            //console.log(JSON.parse(JSON.stringify(row)));
            this.addGameToObserverList(row);
          });
        }
      }
    );
  }

  notifyPeers(app, tx) {
    // lite-clients can skip
    if (app.BROWSER == 1) {
      return;
    }
    for (let i = 0; i < app.network.peers.length; i++) {
      if (app.network.peers[i].peer.synctype == "lite") {
        //
        // fwd tx to peer
        //
        let message = {};
        message.request = "observer spv update";
        message.data = {};
        message.data.tx = tx;
        app.network.peers[i].sendRequest(message.request, message.data);
      }
    }
  }


  async onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {


        //If there is a game_state to save, we save it
        if (txmsg.game_state != undefined && txmsg.game_id != "") {
    
          if (app.BROWSER == 0){
            this.notifyPeers(app, tx);
          }
            
          if (this.debug) {console.log("onConfirmation: Should save game state");}
  
          this.saveGameState(blk, tx, conf, app);
          this.addGameToObserverList(this.createGameFromTX(tx));
        }
        
      }
    } catch (err) {
      console.log("ERROR in observer: " + err);
    }
  }

 async handlePeerRequest(app, message, peer, mycallback = null) {
    //
    // this code doubles onConfirmation
    //

    if (message.request === "observer spv update") {
      let tx = null;

      if (!message.data.tx) {
        if (message.data.transaction) {
          tx = new saito.default.transaction(message.data.transaction);
        }
      }

      if (tx == null) {
        tx = new saito.default.transaction(message.data.tx.transaction);
      }

      let txmsg = tx.returnMessage();

      //For now, we aren't caring about the message request, but if there is a game_state & game_id attached to the message
	    if (txmsg.game_state != undefined && txmsg.game_id != "") {

  	    //if (this.debug) {console.log("HandlePeerRequest: New game state received in Observer");}
  	    this.saveGameState(null, tx, 0, app);
        this.addGameToObserverList(this.createGameFromTX(tx));
        if (app.BROWSER == 0 && app.SPVMODE == 0) {
          this.notifyPeers(app, tx);
        }

  	  }
      
    }    

    super.handlePeerRequest(app, message, peer, mycallback);
  }

  createGameFromTX(tx){
    let txmsg = tx.returnMessage();
    let newtx = {};
    console.log(txmsg);
    newtx.step = txmsg.game_state.step?.game || 1;
    newtx.game_id = txmsg.game_id;
    newtx.player = txmsg.player;
    newtx.status = (txmsg.game_state.over) ? "over" : "live";
    newtx.players_array = txmsg.game_state.players.join("_");;
    newtx.module = txmsg.module;
    newtx.game_state = JSON.stringify(txmsg.game_state);
    newtx.tx = JSON.stringify(tx.transaction);
    newtx.ts = new Date().getTime();

    return newtx;
  }

  addGameToObserverList(msg) {
    let newGame = true;
    if (msg.count){
      if (msg.count > msg.step){
        msg.step = msg.count;
      }
    }

    for (let i = 0; i < this.games.length; i++) {
      if (msg.game_id == this.games[i].game_id) {
        newGame = false;
        //So we may want to update the displayed invite with most recent timestamp, etc
        this.games[i].ts = msg.ts;
        this.games[i].step = msg.step;
        this.games[i].status = msg.status;
      }
    }
  
    if (newGame){
      console.log(JSON.parse(JSON.stringify(msg)));
      this.games.push(msg);
    }
  
    let arcade = this.app.modules.returnModule("Arcade");
    if (arcade){
    	arcade.renderArcadeMain();	
    }
    
  }

  async saveGameState(blk, tx, conf, app) {
    if (this.app.BROWSER) { return; }
    let txmsg = tx.returnMessage();

    if (!txmsg.game_state){
      console.log("error saving game state, so quitting...");
      return;
    }

    let { game_state } = txmsg;

    let sql = `INSERT OR REPLACE INTO gamestate (
                step ,
                game_id ,
                player ,
                players_array ,
                status ,
                module ,
                game_state ,
                tx ,
                ts
       ) VALUES (
                $step,
                $game_id,
                $player,
                $players_array,
                $status , 
                $module,
                $game_state,
                $tx ,
                $ts
        )`;

    //
    // add any move associated with this tx to the
    // gamestate so that it can be executed to pull
    // us up-to-date on what happened in preparation
    // for the next turn / broadcast
    //
    game_state.last_turn = txmsg.turn;

    //
    // do not save 1-player games
    //
    if (game_state.players.length == 1) {
      return;
    }

    let status = (game_state.over) ? "over" : "live";
    let players_array = game_state.players.join("_"); 
    let step = txmsg.step?.game || 1;

    let params = {
      $step: step,
      $game_id: txmsg.game_id,
      $player: tx.transaction.from[0].add,
      $players_array: players_array,
      $module: txmsg.module,
      $status: status,
      $game_state: JSON.stringify(game_state),
      $tx: JSON.stringify(tx.transaction),
      $ts: new Date().getTime(),
    };

    console.log(JSON.parse(JSON.stringify(params)));
    await app.storage.executeDatabase(sql, params, "observer");

    /*
    // periodically prune
    //
    if (Math.random() < 0.005) {
      let current_ts = new Date().getTime();
      let one_week_ago = current_ts - 640000000;
      let delete_sql =
        "SELECT game_id FROM gamestate WHERE ts < $ts GROUP BY game_id ORDER BY last_move ASC";
      let delete_params = { $ts: one_week_ago };
      let rows3 = await app.storage.queryDatabase(delete_sql, delete_params, "observer");

      if (rows3) {
        if (rows3.length > 0) {
          for (let i = 0; i < rows3.length; i++) {
            let game_id = rows3[i].game_id;
            let purge_sql = "DELETE FROM gamestate WHERE game_id = $game_id";
            let purge_params = { $game_id: game_id };
            await app.storage.executeDatabase(purge_sql, purge_params, "observer");
          }
        }
      }
    }*/
  }

  observeGame(game_id) {

    let msgobj = null;

    for (let i = 0; i < this.games.length; i++){
      if (this.games[i].game_id === game_id){
        msgobj = this.games[i];
      }
    }
    if (!msgobj){
      return;
    }
    
    //Piggy back on Arcade look and feel to load a spinner
    //Block arcade from rerendering while loading game
    let arcade = this.app.modules.returnModule("Arcade");
    if (arcade.browser_active){
      arcade.viewing_arcade_initialization_page = 1;
    }else{
      return;
    }
    ObserverLoader.render(this.app, this); //Start Spinner
    
    //let address_to_watch = msgobj.player;

    if (!this.app.options.games) {
      this.app.options.games = [];
    }

    //
    // already watching game... load it
    //
	  for (let game of this.app.options.games) {
	    if (game.id === game_id) {
	      game.observer_mode = 1;

	      //if (!address_to_watch) {
	      //  address_to_watch = game.players[0];
	      // }

	      //for (let z = 0; z < game.players.length; z++) {
	      //  if (game.players[z] == address_to_watch) {
	      //    game.observer_mode_player = z + 1;
	      //  }
	      //}

	      game.ts = new Date().getTime();
	      //this.app.keys.addWatchedPublicKey(address_to_watch);
	      this.app.storage.saveOptions();
	      let slug = this.app.modules.returnModule(msgobj.module).returnSlug();
	      window.location = "/" + slug;
	      return;
	    }
	  }

	  //It doesn't look like the watched flag in keychain actually affects message relays...
    //this.app.keys.addWatchedPublicKey(address_to_watch);

    //We want to send a message to the players to add us to the game.accept list so they route their game moves to us as well
    this.sendFollowTx(msgobj);

    this.initializeObserverMode(game_id);
  }


  sendFollowTx(game){

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.msg = {
      module: game.module,
      game_id: game.game_id,
      request: "follow game",
      my_key: this.app.wallet.returnPublicKey(),
    };

    let addesses_to_watch = game.players_array.split("_");
    for (let p of addesses_to_watch){
	    tx.transaction.to.push(new saito.default.slip(p, 0.0));   	
    }

    console.log(JSON.parse(JSON.stringify(tx)));
    tx = this.app.wallet.signTransaction(tx);

    this.app.network.propagateTransaction(tx);
    //Relay too...
    let relay_mod = this.app.modules.returnModule("Relay");
    if (relay_mod){
   	    relay_mod.sendRelayMessage(addesses_to_watch, "game relay update", tx);
    }
  }

  insertFutureMoves(game_mod){
    for (let i = 0; i < this.future_moves.length; i++){
      let future_tx = this.future_moves[i];
      game_mod.addFutureMove(future_tx);  
    }
    this.future_moves = [];
  }

  async observerDownloadNextMoves(game_mod, mycallback = null) {
    let arcade_self = this;

    // purge old transactions
    for (let i = game_mod.game.future.length-1; i >= 0; i--) {
      let queued_tx = new saito.default.transaction(JSON.parse(game_mod.game.future[i]));
      let queued_txmsg = queued_tx.returnMessage();

      if (
        queued_txmsg.step.game <= game_mod.game.step.game &&
        queued_txmsg.step.game <= game_mod.game.step.players[queued_tx.transaction.from[0].add]
      ) {
        console.log("Trimming future move to download new ones:",JSON.stringify(queued_txmsg));
        game_mod.game.future.splice(i, 1);
      }
    }

    console.log(` NEXT MOVES: /arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.game}`);

    fetch(
      `/arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.game}`
    )
      .then((response) => {
        response.json().then((data) => {
          console.log("data length: " + data.length);

          for (let i = 0; i < data.length; i++) {
            console.log(i + " --- tx id: " + data[i].id);
            let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
            future_tx.msg = future_tx.returnMessage();
            future_tx.msg.game_state = {};
            //
            // write this data into the tx
            //
            future_tx.msg.last_tid = data[i].tid;
            future_tx.msg.last_bid = data[i].bid;
            future_tx = arcade_self.app.wallet.signTransaction(future_tx);

            let already_contains_move = 0;
            console.log("steps comparison: " + future_tx.msg.step.game + " -- vs -- " + game_mod.game.step.game);

            if (
              future_tx.msg.step.game <= game_mod.game.step.game &&
              future_tx.msg.step.game <=
                game_mod.game.step.players[future_tx.transaction.from[0].add]
            ) {
              already_contains_move = 1;
            }
          

            if (already_contains_move == 0) {
              console.log("Add move: " + JSON.stringify(future_tx.msg));
              game_mod.game.future.push(JSON.stringify(future_tx.transaction));
            }
          }

          game_mod.saveFutureMoves(game_mod.game.id);
          game_mod.saveGame(game_mod.game.id);

          if (mycallback != null) {
            mycallback(game_mod);
          }
        });
      })
      .catch((err) => console.info("ERROR 354322: error downloading next moves", err));
  }

  async initializeObserverModePreviousStep(game_id, starting_move, callback = null) {
    let arcade_self = this;
    let first_tx = null;

    console.log(`FETCHING: /arcade/observer_prev/${game_id}/${starting_move}`);

    fetch(`/arcade/observer_prev/${game_id}/${starting_move}`).then((response) => {
      response.json().then((data) => {
        if (!data.length){
          salert("At beginning game state");
          arcade_self.controls.hideLastMoveButton();
          return;
        }
        first_tx = JSON.parse(data[0].game_state);

        console.log("UPDATED GAME TxStep to: " + JSON.stringify(first_tx.step));
        console.log("UPDATED GAME QUEUE to: " + JSON.stringify(first_tx.queue));

        //
        // single transaction
        //
        let future_tx = new saito.default.transaction(JSON.parse(data[0].tx));
        future_tx.msg = future_tx.returnMessage();
        future_tx.msg.game_state = {};
        //future_tx.msg.last_move = data[0].last_move;
        future_tx.msg.last_tid = data[0].tid;
        future_tx.msg.last_bid = data[0].bid;
        future_tx = arcade_self.app.wallet.signTransaction(future_tx);
        first_tx.future = first_tx.future || [];
        first_tx.future.push(JSON.stringify(future_tx.transaction));

        //
        // we did not add a move
        //
        let game = first_tx;

        //
        // prevent old turns from persisting
        //
        game.turn = [];

        console.log("reset to step: " + game.step.game);
        console.log("queue at this step: " + game.queue);

        game.observer_mode = 1;
        game.player = 0;

        //
        // set timestamp
        //
        game.step.ts = 0;

        let idx = -1;
        for (let i = 0; i < arcade_self.app.options.games.length; i++) {
          if (arcade_self.app.options.games[i].id === first_tx.id) {
            idx = i;
          }
        }
        if (idx == -1) {
          arcade_self.app.options.games.push(game);
        } else {
          arcade_self.app.options.games[idx] = game;
        }

        arcade_self.app.storage.saveOptions();
        let game_mod = arcade_self.app.modules.returnActiveModule();

        if (callback){
          callback(game_mod);
        }else{
          game_mod.initialize_game_run = 0;
          game_mod.initializeGameFeeder(game_mod.game.id);
          arcade_self.controls.updateStep(game_mod.game.step.game);
        }

      });
    });
  }

  /**
   * 
   */ 
  initializeObserverMode(game_id) {
    let arcade_self = this;

    let first_tx = null;

    console.log(`FETCHED: /arcade/observer_multi/${game_id}/0`);

    fetch(`/arcade/observer_multi/${game_id}/0`)
      .then((response) => {
        response.json().then((data) => {

          if (data.length > 0){
            first_tx = JSON.parse(data[0].game_state);
            if (!first_tx.future){
              first_tx.future = [];
            }
          }else{
          	console.error("No Data");
            return;
          }

          for (let i = 1; i < data.length; i++) {
            let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
            future_tx.msg = future_tx.returnMessage();
            future_tx.msg.game_state = {};
            //future_tx.msg.last_move = data[i].last_move;
            future_tx.msg.last_tid = data[i].tid;
            future_tx.msg.last_bid = data[i].bid;
            future_tx = arcade_self.app.wallet.signTransaction(future_tx);
            first_tx.future.push(JSON.stringify(future_tx.transaction));
          }

          first_tx.observer_mode = 1;
          first_tx.player = 0; //Set me as an observer

          //Either add the cloned game to my wallet or update my wallet
          let idx = -1;
          for (let i = 0; i < arcade_self.app.options.games.length; i++) {
            if (arcade_self.app.options.games[i].id === first_tx.id) {
              idx = i;
            }
          }
          if (idx == -1) {
            arcade_self.app.options.games.push(first_tx);
          } else {
            arcade_self.app.options.games[idx] = first_tx;
          }

          console.log(JSON.parse(JSON.stringify(first_tx)));

          arcade_self.app.storage.saveOptions();

          //
          // move into game
          //
          let slug = arcade_self.app.modules.returnModule(first_tx.module).returnSlug();
          ObserverLoader.render(arcade_self.app, arcade_self, slug); //Stop spinner, move into game
        });
      })
      .catch((err) =>
        console.info("ERROR 351232: error fetching queued games for observer mode", err)
      );
  }


    webServer(app, expressapp, express) {
    super.webServer(app, expressapp, express);

    const fs = app.storage.returnFileSystem();
    const path = require("path");

    if (fs != null) {
    //InitializeObserverMode, downloadNextMoves	
      expressapp.get("/arcade/observer_multi/:game_id/:step", async (req, res) => {
        let lm 	 = 	req.params.step || 0;
        let game_id = req.params.game_id || 0;


        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND step > $step ORDER BY step ASC";
        let params = { $game_id: game_id, $step: lm };

        let games = await app.storage.queryDatabase(sql, params, "observer");

        res.setHeader("Content-type", "text/html");
        res.charset = "UTF-8";

        if (games.length > 0) {
          res.write(JSON.stringify(games));
        } else {
          res.write("{}");
        }
        res.end();
        return;
    
      });

      //InitializeObserverModePreviousStep
      expressapp.get("/arcade/observer_prev/:game_id/:current_move", async (req, res) => {
        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND step <= $step ORDER BY step DESC LIMIT 1";
        let params = { $game_id: req.params.game_id, $step: req.params.current_move };

        if (req.params.current_move == 0 || req.params.current_move === "undefined") {
          sql = "SELECT * FROM gamestate WHERE game_id = $game_id ORDER BY step ASC LIMIT 1";
          params = { $game_id: req.params.game_id };
        }

        console.log(sql);
        let games = await app.storage.queryDatabase(sql, params, "observer");

        res.setHeader("Content-type", "text/html");
	    res.charset = "UTF-8";

	    if (games.length > 0) {
          res.write(JSON.stringify(games));
        } else {
          res.write("{}");
        }
        res.end();
        return;
      });

      /*
      //Watch Live
      expressapp.get("/arcade/observer/:game_id", async (req, res) => {
        let sql =
          "SELECT bid, tid, last_move, game_state FROM gamestate WHERE game_id = $game_id ORDER BY id DESC LIMIT 1";
        let params = { $game_id: req.params.game_id };

        let games = await app.storage.queryDatabase(sql, params, "observer");

        if (games.length > 0) {
          let game = games[0];
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(game));
          res.end();
          return;
        }
      });

      //Not (programatically) called anywhere
      //Gets most recent move from given player???
      expressapp.get("/arcade/keystate/:game_id/:player_pkey", async (req, res) => {
        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND player = $playerpkey ORDER BY id DESC LIMIT 1";
        let params = {
          $game_id: req.params.game_id,
          $playerpkey: req.params.player_pkey,
        };
        let games = await app.storage.queryDatabase(sql, params, "observer");

        if (games.length > 0) {
          let game = games[0];
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(game.game_state.toString());
          res.end();
          return;
        }
      });

      //Not (programatically) called anywhere
      expressapp.get("/arcade/restore/:game_id/:player_pkey", async (req, res) => {
        let sql = "SELECT * FROM gamestate WHERE game_id = $game_id ORDER BY id DESC LIMIT 10";
        let params = { $game_id: req.params.game_id };
        let games = await app.storage.queryDatabase(sql, params, "observer");

        let stop_now = 0;
        let games_to_push = [];
        let recovering_pkey = "";

        try {
          if (req.params.player_pkey != undefined) {
            recovering_pkey = req.params.pkayer_pkey;
          }
        } catch (err) {}

        if (games.length > 0) {
          for (let z = 0; z < games.length; z++) {
            let game = games[z];
            if (game.player_pkey == recovering_pkey) {
              stop_now = 1;
            } else {
              games_to_push.push(game.state);
            }
            if (recovering_pkey == "" || stop_now == 1) {
              z = games.length + 1;
            }
          }
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(games_to_push));
          res.end();
          return;
        }
      });

      /*
		Deprecated arcade invite system
      expressapp.get("/arcade/invite/:gameinvite", async (req, res) => {
        res.setHeader("Content-type", "text/html");
        res.sendFile(path.resolve(__dirname + "/web/invite.html"));
      });
      */
    }
  }


}


module.exports = Observer;
