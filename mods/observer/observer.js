const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const GameObserver = require("./lib/game-observer");
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
    app.modules.returnModulesRespondingTo("arcade-games").forEach((mod) => {
      this.affix_callbacks_to.push(mod.name);
    });
  }

  renderControls(app, game_mod) {
    if (!this.controls) {
      this.controls = new GameObserver(app);
    }
    this.controls.render(app, game_mod);
  }

  removeControls() {
    if (this.controls) {
      this.controls.hide();
      //this.controls = null;
    }
  }

  shouldAffixCallbackToModule(modname) {
    if (modname == this.name) {
      return 1;
    }

    for (let i = 0; i < this.affix_callbacks_to.length; i++) {
      if (this.affix_callbacks_to[i] == modname) {
        return 1;
      }
    }
    return 0;
  }

  async onConfirmation(blk, tx, conf, app) {
    let txmsg = tx.returnMessage();

    try {
      if (conf == 0) {
        if (txmsg.game_id != "") {
          if (app.BROWSER == 0) {
            this.notifyPeers(app, tx);
          }

          if (this.debug) {
            console.log(`onConfirmation (${txmsg.request}): Should save game state`);
          }

          this.saveGameState(blk, tx, conf, app);
        }
      }
    } catch (err) {
      console.log("ERROR in observer: " + err);
    }
  }

  async saveGameState(blk, tx, conf, app) {
    if (this.app.BROWSER) {
      return;
    }
    let txmsg = tx.returnMessage();

    let sql, params;

    //We are given game_State to create new game stub
    if (txmsg.request == "observer") {
      let { game_state } = txmsg;

      // do not save 1-player games
      if (game_state.players.length == 1) {
        return;
      }

      //Initial game state
      sql = `INSERT OR REPLACE INTO obgames (
                  game_id ,
                  game_status ,
                  players_array ,
                  module ,
                  step ,
                  ts ,
                  game_state
         ) VALUES (
                  $game_id,
                  "live" , 
                  $players_array,
                  $module,
                  0 ,
                  $ts ,
                  $game_state
          )`;

      let players_array = game_state.players.join("_");

      params = {
        $game_id: txmsg.game_id,
        $players_array: players_array,
        $module: txmsg.module,
        $ts: game_state.step.ts || new Date().getTime(),
        $game_state: JSON.stringify(game_state),
      };

      await app.storage.executeDatabase(sql, params, "observer");
      return; // STOP HERE
    }

    //Otherwise, we have an update to the game
    if (txmsg.request == "game") {
      //New Step
      sql = `INSERT OR REPLACE INTO gamestate (
                  step ,
                  game_id ,
                  player ,
                  tx ,
                  ts
         ) VALUES (
                  $step,
                  $game_id,
                  $player,
                  $tx ,
                  $ts
          )`;

      params = {
        $step: txmsg.step?.game || 1,
        $game_id: txmsg.game_id,
        $player: tx.transaction.from[0].add,
        $tx: JSON.stringify(tx.transaction),
        $ts: txmsg.step?.ts || new Date().getTime(),
      };

      await app.storage.executeDatabase(sql, params, "observer");

      /*
      let sql2 = `UPDATE obgames SET step = $step, ts = $ts WHERE game_id = $game_id`;
      //console.log(sql2);
      //console.log(params);
      params = {
        $step: txmsg.step?.game || 1,
        $game_id: txmsg.game_id,
        $ts: new Date().getTime(),
      }
      await app.storage.executeDatabase(sql2, params, "observer");
    */
    } else {
      if (txmsg.request == "stopgame" || txmsg.request == "gameover") {
        //We have a game over request
        let sql2 = `UPDATE obgames SET game_status = "over" WHERE game_id = $game_id`;
        params = {
          $game_id: txmsg.game_id,
        };

        await app.storage.executeDatabase(sql2, params, "observer");
      }
    }
  }

  observeGame(game_id, watch_live) {
    let msgobj = null;

    for (let i = 0; i < this.games.length; i++) {
      if (this.games[i].game_id === game_id) {
        msgobj = this.games[i];
      }
    }
    if (!msgobj) {
      return;
    }

    //Piggy back on Arcade look and feel to load a spinner
    //Block arcade from rerendering while loading game
    let arcade = this.app.modules.returnModule("Arcade");
    if (arcade.browser_active) {
      arcade.viewing_arcade_initialization_page = 1;
      let gameLoader = new GameLoader(this.app, this, "#arcade-main");
      gameLoader.render("Loading Game Moves"); //Start Spinner
    }

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
        //this.app.keychain.addWatchedPublicKey(address_to_watch);
        this.app.storage.saveOptions();
        let slug = this.app.modules.returnModule(msgobj.module).returnSlug();
        window.location = "/" + slug;
        return;
      }
    }

    //It doesn't look like the watched flag in keychain actually affects message relays...
    //this.app.keychain.addWatchedPublicKey(address_to_watch);

    //We want to send a message to the players to add us to the game.accept list so they route their game moves to us as well
    this.sendFollowTx(msgobj);

    this.initializeObserverMode(game_id, watch_live);
  }

  sendFollowTx(game) {
    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    tx.msg = {
      module: game.module,
      game_id: game.game_id,
      request: "follow game",
      my_key: this.app.wallet.returnPublicKey(),
    };

    let addesses_to_watch = game.players_array.split("_");
    for (let p of addesses_to_watch) {
      tx.transaction.to.push(new saito.default.slip(p, 0.0));
    }

    tx = this.app.wallet.signTransaction(tx);

    this.app.network.propagateTransaction(tx);

    //
    // relay too
    //
    this.app.connection.emit("relay-send-message", {
      recipient: addresses_to_watch,
      request: "game relay update",
      data: tx.transaction,
    });
  }

  insertFutureMoves(game_mod) {
    for (let i = 0; i < this.future_moves.length; i++) {
      let future_tx = this.future_moves[i];
      game_mod.addFutureMove(future_tx);
    }
    this.future_moves = [];
  }

  async observerDownloadNextMoves(game_mod, mycallback = null) {
    let arcade_self = this;

    // purge old transactions
    for (let i = game_mod.game.future.length - 1; i >= 0; i--) {
      let queued_tx = new saito.default.transaction(JSON.parse(game_mod.game.future[i]));
      let queued_txmsg = queued_tx.returnMessage();

      if (
        queued_txmsg.step.game <= game_mod.game.step.game &&
        queued_txmsg.step.game <= game_mod.game.step.players[queued_tx.transaction.from[0].add]
      ) {
        console.log("Trimming future move to download new ones:", JSON.stringify(queued_txmsg));
        game_mod.game.future.splice(i, 1);
      }
    }

    console.log(
      ` NEXT MOVES: /arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.game}`
    );

    fetch(`/arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.game}`)
      .then((response) => {
        response.json().then((data) => {
          console.log("data length: " + data.length);

          for (let i = 1; i < data.length; i++) {
            console.log(i + " --- tx id: " + data[i].id);
            let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
            future_tx.msg = future_tx.returnMessage();
            //future_tx.msg.game_state = {};
            //
            // write this data into the tx
            //
            //future_tx.msg.last_tid = data[i].tid;
            //future_tx.msg.last_bid = data[i].bid;
            future_tx = arcade_self.app.wallet.signTransaction(future_tx);

            let already_contains_move = 0;
            console.log(
              "steps comparison: " +
                future_tx.msg.step.game +
                " -- vs -- " +
                game_mod.game.step.game
            );

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

  async initializeObserverModePreviousStep(game_mod, starting_move, callback = null) {
    let arcade_self = this;
    let first_tx = null;

    console.log(`FETCHING: /arcade/observer_prev/${game_mod.game.id}/${starting_move}`);

    fetch(`/arcade/observer_prev/${game_mod.game.id}/${starting_move}`).then((response) => {
      response.json().then((data) => {
        if (!data.length) {
          salert("At beginning game state");
          arcade_self.controls.hideLastMoveButton();
          return;
        }
        console.log(data[0]);
        first_tx = JSON.parse(data[0].game_state);

        console.log("UPDATED GAME TxStep to: " + JSON.stringify(first_tx.step));
        //console.log("UPDATED GAME QUEUE to: " + JSON.stringify(first_tx.queue));

        //
        // single transaction
        //
        //let future_tx = new saito.default.transaction(JSON.parse(data[1].tx));
        //future_tx.msg = future_tx.returnMessage();
        //future_tx = arcade_self.app.wallet.signTransaction(future_tx);
        //first_tx.future = first_tx.future || [];
        //first_tx.future.push(JSON.stringify(future_tx.transaction));

        //let idx = -1;
        //for (let i = 0; i < arcade_self.app.options.games.length; i++) {
        //  if (arcade_self.app.options.games[i].id === first_tx.id) {
        //    idx = i;
        //  }
        //}
        //if (idx == -1) {
        //  arcade_self.app.options.games.push(first_tx);
        //} else {
        //  arcade_self.app.options.games[idx] = first_tx;
        //}

        //arcade_self.app.storage.saveOptions();
        //let game_mod = arcade_self.app.modules.returnActiveModule();
        game_mod.game = first_tx;
        game_mod.saveGame(game_mod.game.id);

        if (callback) {
          callback(game_mod);
        } else {
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
  async initializeObserverMode(game_id, watch_live) {
    let arcade_self = this;

    let first_tx = null;

    console.log(`FETCHED: /arcade/observer_multi/${game_id}/0`);

    fetch(`/arcade/observer_multi/${game_id}/0`)
      .then((response) => {
        response.json().then((data) => {
          if (data.length > 0) {
            first_tx = JSON.parse(data[0].game_state);
            if (!first_tx.future) {
              first_tx.future = [];
            }
          } else {
            console.error("No Data");
            return;
          }

          for (let i = 1; i < data.length; i++) {
            let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
            future_tx.msg = future_tx.returnMessage();
            future_tx = arcade_self.app.wallet.signTransaction(future_tx);
            first_tx.future.push(JSON.stringify(future_tx.transaction));
          }

          first_tx.observer_mode = 1;
          first_tx.player = 0; //Set me as an observer
          first_tx.halted = 1; // Default to paused
          if (watch_live) {
            first_tx.halted = 0;
            first_tx.live = 1;
          }

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

          //game_mod.saveFutureMoves(game_mod.game.id);
          //game_mod.saveGame(game_mod.game.id);

          arcade_self.app.storage.saveOptions();

          //
          // move into game
          //
          let slug = arcade_self.app.modules.returnModule(first_tx.module).returnSlug();
          let gameLoader = new GameLoader(arcade_self.app, arcade_self, first_tx.id);
          let msg = `You are ready to ${watch_live ? "follow" : "watch"} the game!`;
          gameLoader.render(arcade_self.app, arcade_self, "#arcade-main", msg, "enter game");

          arcade_self.app.connection.emit("arcade-game-ready-observer", first_tx.id);
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
        res.setHeader("Content-type", "text/html");
        res.charset = "UTF-8";

        let lm = req.params.step || 0;
        let game_id = req.params.game_id || 0;

        //Fetch the initial gamestate
        let sql = "SELECT * FROM obgames WHERE game_id = $game_id";
        let params = { $game_id: game_id };
        let games = await app.storage.queryDatabase(sql, params, "observer");

        //Fetch all the moves
        sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND step > $step ORDER BY step ASC LIMIT 100";
        params = { $game_id: game_id, $step: lm };
        let more_games = await app.storage.queryDatabase(sql, params, "observer");

        games = games.concat(more_games);
        if (games.length > 0) {
          res.send(JSON.stringify(games));
        } else {
          res.send("{}");
        }
        return;
      });

      //InitializeObserverModePreviousStep
      expressapp.get("/arcade/observer_prev/:game_id/:current_move", async (req, res) => {
        let sql, params;

        if (req.params.current_move == 0 || req.params.current_move === "undefined") {
          sql = "SELECT * FROM obgames WHERE game_id = $game_id";
          params = { $game_id: req.params.game_id };
        } else {
          sql =
            "SELECT * FROM gamestate WHERE game_id = $game_id AND step <= $step ORDER BY step DESC LIMIT 1";
          params = { $game_id: req.params.game_id, $step: req.params.current_move };
        }

        console.log(sql);
        let games = await app.storage.queryDatabase(sql, params, "observer");

        res.setHeader("Content-type", "text/html");
        res.charset = "UTF-8";

        if (games.length > 0) {
          res.send(JSON.stringify(games));
        } else {
          res.send("{}");
        }
        return;
      });
    }
  }
}

module.exports = Observer;
