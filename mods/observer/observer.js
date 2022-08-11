const ArcadeObserver = require("./lib/appspace/arcade-observer");


class Observer extends ModTemplate {
  constructor(app) {
    super(app);
    this.name = "Observer";

    this.games = [];

    this.game_id = null;
    this.game_states = [];
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
          ob.render(app, mod, elem_id);
        });
      }catch(err){
        console.log(err);
      }
  }

  attachEvents(app, mod) {
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
      "Arcade", /*DISTINCT id, count(id) as count, last_move, game_id, module, player, players_array*/
      `SELECT DISTINCT id, count(id) as count, * FROM gamestate WHERE last_move > 10 GROUP BY game_id ORDER BY count DESC, last_move DESC LIMIT 8`,
      (res) => {
        if (res.rows) {
          console.log("GAMESTATES:");
          res.rows.forEach((row) => {
            console.log(JSON.parse(JSON.stringify(row)));
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

        //
        // save state -- also prolifigate
        //
        if (txmsg.game_state != undefined && txmsg.game_id != "") {
          if (this.debug) {console.log("onConfirmation: Should save game state");}
          this.saveGameState(blk, tx, conf, app);
        }

        if (app.BROWSER == 0){
        	this.notifyPeers(app, tx);
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

      console.log("HPR!");
      console.log(txmsg); 
      
    }    

    super.handlePeerRequest(app, message, peer, mycallback);
  }


  addGameToObserverList(msg) {
    for (let i = 0; i < this.games.length; i++) {
      if (msg.game_id == this.games[i].game_id) {
        return;
      }
    }
    this.games.push(msg);
    console.log(msg.game_state);
    this.renderArcadeMain(this.app, this);
  }

  async saveGameState(blk, tx, conf, app) {
    if (this.app.BROWSER) { return; }
    let txmsg = tx.returnMessage();

    if (!txmsg.game_state){
      console.log("error saving game state, so quitting...");
      return;
    }else{
      console.log(txmsg.game_state);
    }
    let { game_state } = txmsg;

    let sql = `INSERT INTO gamestate (
                game_id ,
                player ,
                players_array ,
                module ,
                bid ,
                tid ,
                lc ,
                sharekey ,
                game_state ,
                tx ,
                last_move
       ) VALUES (
                $game_id,
                $player,
                $players_array,
                $module,
                $bid,
                $tid,
                $lc,
                "",
                $game_state,
                $tx ,
                $last_move
        )`;
    let x = [];
    let txto = tx.transaction.to;
    for (let z = 0; z < txto.length; z++) {
      if (!x.includes(txto[z].add)) {
        x.push(txto[z].add);
      }
    }

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
    if (x.length == 1) {
      return;
    }

    let players_array = x.join("_");

    let params = {
      $game_id: txmsg.game_id,
      $player: tx.transaction.from[0].add,
      $players_array: players_array,
      $module: txmsg.module,
      $bid: blk.block.id,
      $tid: tx.transaction.id,
      $lc: 1,
      $game_state: JSON.stringify(game_state),
      $tx: JSON.stringify(tx.transaction),
      $last_move: new Date().getTime(),
    };

    console.log(JSON.parse(JSON.stringify(params)));
    await app.storage.executeDatabase(sql, params, "arcade");

    /*
    // periodically prune
    //
    if (Math.random() < 0.005) {
      let current_ts = new Date().getTime();
      let one_week_ago = current_ts - 640000000;
      let delete_sql =
        "SELECT game_id FROM gamestate WHERE last_move < $last_move GROUP BY game_id ORDER BY last_move ASC";
      let delete_params = { $last_move: one_week_ago };
      let rows3 = await app.storage.queryDatabase(delete_sql, delete_params, "arcade");

      if (rows3) {
        if (rows3.length > 0) {
          for (let i = 0; i < rows3.length; i++) {
            let game_id = rows3[i].game_id;
            let purge_sql = "DELETE FROM gamestate WHERE game_id = $game_id";
            let purge_params = { $game_id: game_id };
            await app.storage.executeDatabase(purge_sql, purge_params, "arcade");
          }
        }
      }
    }*/
  }

  observeGame(game_id, watch_live = 0) {

    let msgobj = null;

    for (let i = 0; i < this.observer.length; i++){
      if (this.observer[i].game_id === game_id){
        msgobj = this.observer[i];
      }
    }
    if (!msgobj){
      return;
    }
    
    let address_to_watch = msgobj.player;

    let tid = msgobj.tid || 1;
    let bid = msgobj.bid || 1;
    let last_move = msgobj.last_move || 1;

    //
    // already watching game... load it
    //
    if (this.app.options.games) {
      for (let game of this.app.options.games) {
        if (game.id === game_id) {
          game.observer_mode = 1;

          if (!address_to_watch) {
            address_to_watch = game.players[0];
          }

          for (let z = 0; z < game.players.length; z++) {
            if (game.players[z] == address_to_watch) {
              game.observer_mode_player = z + 1;
            }
          }

          game.ts = new Date().getTime();
          this.app.keys.addWatchedPublicKey(address_to_watch);
          this.app.storage.saveOptions();
          let slug = this.app.modules.returnModule(msgobj.module).returnSlug();
          window.location = "/" + slug;
          return;
        }
      }
    }

    /***
    //
    // watch live
    //
    if (watch_live) {
      let arcade_self = this;
      fetch(`/arcade/observer/${game_id}`).then(response => {
        response.json().then(data => {

          let game = JSON.parse(data.game_state);
          let tid = data.tid;
          let bid = data.bid;
          let lm = data.last_move;

    game.step.ts = lm;
    game.step.tid = tid;
    game.step.bid = bid;

          //
          // tell peers to forward this address transactions
          //
          arcade_self.app.keys.addWatchedPublicKey(address_to_watch);
          let { games } = arcade_self.app.options;

          //
          // specify observer mode only
          //
          if (games == undefined) {
            games = [];
          }

          for (let i = 0; i < games.length; i++) {
            if (games[i].id == game_id) {
              games.splice(i, 1);
            }
          }

          game.observer_mode = 1;
          game.player = 0;

          //
          // and we add this stuff to our queue....
          //
          for (let z = 0; z < game.last_turn.length; z++) {
            game.queue.push(game.last_turn[z]);
          }

    //
    // increment the step by 1, as returnPreGameMove will have unincremented
    // ( i.e. not including the step that broadcast it )
          //
    game.step.game++;

          games.push(game);

          arcade_self.app.options.games = games;
          arcade_self.app.storage.saveOptions();

          //
          // move into game
          //
          let slug = arcade_self.app.modules.returnModule(msgobj.module).returnSlug();
          window.location = '/' + slug;
        })
      }).catch(err => console.info("ERROR 418019: error fetching game for observer mode", err));
    } else {
****/
    //
    // HACK
    // do not listen
    //
    this.app.keys.addWatchedPublicKey(address_to_watch);

    if (!this.app.options.games) {
      this.app.options.games = [];
    }
    for (let i = this.app.options.games.length - 1 ; i >=0 ; i--) {
      if (this.app.options.games[i].id == game_id) {
        this.app.options.games.splice(i, 1);
      }
    }

    this.initializeObserverMode(game_id, watch_live);

    //    }
  }

  observerDownloadNextMoves(game_mod, mycallback = null) {
    let arcade_self = this;

    // purge old transactions
    for (let i = 0; i < game_mod.game.future.length; i++) {
      let queued_tx = new saito.default.transaction(JSON.parse(game_mod.game.future[i]));
      let queued_txmsg = queued_tx.returnMessage();

      if (
        queued_txmsg.step.game <= game_mod.game.step.game &&
        queued_txmsg.step.game <= game_mod.game.step.players[queued_tx.transaction.from[0].add]
      ) {
        game_mod.game.future.splice(i, 1);
        i--;
      }
    }

    console.log(` NEXT MOVES: /arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.bid}/${game_mod.game.step.tid}/${game_mod.game.step.ts}`);

    fetch(
      `/arcade/observer_multi/${game_mod.game.id}/${game_mod.game.step.bid}/${game_mod.game.step.tid}/${game_mod.game.step.ts}`
    )
      .then((response) => {
        response.json().then((data) => {
          console.log("data length: " + data.length);

          for (let i = 0; i < data.length; i++) {
            console.log("i: " + i + " --- tx id: " + data[i].id);
            let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
            future_tx.msg = future_tx.returnMessage();
            future_tx.msg.game_state = {};
            //
            // write this data into the tx
            //
            future_tx.msg.last_move = data[i].last_move;
            future_tx.msg.last_tid = data[i].tid;
            future_tx.msg.last_bid = data[i].bid;
            future_tx = arcade_self.app.wallet.signTransaction(future_tx);

            let already_contains_move = 0;
            for (let z = 0; z < game_mod.game.future.length; z++) {
              let tmptx = new saito.default.transaction(JSON.parse(game_mod.game.future[z]));

              console.log("steps comparison: " + future_tx.msg.step.game + " -- vs -- " + game_mod.game.step.game);

              if (
                future_tx.msg.step.game <= game_mod.game.step.game &&
                future_tx.msg.step.game <=
                  game_mod.game.step.players[future_tx.transaction.from[0].add]
              ) {
                already_contains_move = 1;
              }
            }

            if (already_contains_move == 0) {
              game_mod.game.future.push(JSON.stringify(future_tx.transaction));
            }
          }

          game_mod.saveGame(game_mod.game.id);
          game_mod.saveFutureMoves(game_mod.game.id);

          if (mycallback != null) {
            mycallback(game_mod);
          }
        });
      })
      .catch((err) => console.info("ERROR 354322: error downloading next moves", err));
  }

  async initializeObserverModePreviousStep(game_id, starting_move) {
    let arcade_self = this;
    let { games } = arcade_self.app.options;

    let first_tx = null;

    console.log(`FETCHING: /arcade/observer_prev/${game_id}/${starting_move}`);

    fetch(`/arcade/observer_prev/${game_id}/${starting_move}`).then((response) => {
      response.json().then((data) => {
        first_tx = JSON.parse(data[0].game_state);

        console.log("UPDATED GAME TS to: " + JSON.stringify(first_tx.step));
        console.log("UPDATED GAME QUEUE to: " + JSON.stringify(first_tx.queue));

        //
        // single transaction
        //
        let future_tx = new saito.default.transaction(JSON.parse(data[0].tx));
        future_tx.msg = future_tx.returnMessage();
        future_tx.msg.game_state = {};
        future_tx.msg.last_move = data[0].last_move;
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
        for (let i = 0; i < games.length; i++) {
          if (games[i].id === first_tx.id) {
            idx = i;
          }
        }
        if (idx == -1) {
          games.push(game);
        } else {
          games[idx] = game;
        }

        arcade_self.app.options.games = games;
        arcade_self.app.storage.saveOptions();

        let game_mod = arcade_self.app.modules.returnModule(game.module);

        //
        // move into or reload game
        //
        let slug = arcade_self.app.modules.returnModule(first_tx.module).returnSlug();
        window.location = "/" + slug;
      });
    });
  }

  initializeObserverMode(game_id, starting_move) {
    let arcade_self = this;

    let first_tx = null;

    console.log(`FETCHED: /arcade/observer_multi/${game_id}/0/0/${starting_move}`);

    fetch(`/arcade/observer_multi/${game_id}/0/0/${starting_move}`)
      .then((response) => {
        response.json().then((data) => {

          if (data.length > 0){
            first_tx = JSON.parse(data[0].game_state);
            if (!first_tx.future){
              first_tx.future = [];
            }
          }else{
            return;
          }

          for (let i = 0; i < data.length; i++) {
            let future_tx = new saito.default.transaction(JSON.parse(data[i].tx));
            future_tx.msg = future_tx.returnMessage();
            future_tx.msg.game_state = {};
            future_tx.msg.last_move = data[i].last_move;
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
            arcade_self.app.options.games.push(game);
          } else {
            arcade_self.app.options.games[idx] = first_tx;
          }

          arcade_self.app.storage.saveOptions();

          //
          // move into game
          //
          let slug = arcade_self.app.modules.returnModule(first_tx.module).returnSlug();
          window.location = "/" + slug;
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
      expressapp.get("/arcade/observer_multi/:game_id/:bid/:tid/:last_move", async (req, res) => {
        let lm = 0;
        let lbid = 0;
        let ltid = 0;
        let game_id = 0;

        try {
          if (req.params.last_move) {
            lm = req.params.last_move;
          }
          if (req.params.bid) {
            lbid = req.params.bid;
          }
          if (req.params.tid) {
            ltid = req.params.tid;
          }
          if (req.params.game_id) {
            game_id = req.params.game_id;
          }
          if (lbid === "undefined") {
            lbid = 0;
          }
          if (ltid === "undefined") {
            ltid = 0;
          }
        } catch (err) {}

        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND last_move > $last_move ORDER BY last_move ASC LIMIT 10";
        let params = { $game_id: game_id, $last_move: lm };

        if (ltid != 0) {
          sql =
            "SELECT * FROM gamestate WHERE game_id = $game_id AND (last_move > $last_move OR tid > $last_tid) ORDER BY last_move ASC LIMIT 10";
          params = { $game_id: game_id, $last_move: lm, $last_tid: ltid };
        }

        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(games));
          res.end();
          return;
        } else {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write("{}");
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/observer_prev/:game_id/:current_move", async (req, res) => {
        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND last_move < $last_move ORDER BY last_move DESC LIMIT 2";
        let params = { $game_id: req.params.game_id, $last_move: req.params.current_move };

        if (req.params.current_move == 0 || req.params.current_move === "undefined") {
          sql = "SELECT * FROM gamestate WHERE game_id = $game_id ORDER BY last_move ASC LIMIT 1";
          params = { $game_id: req.params.game_id };
        }

        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(games));
          res.end();
          return;
        } else {
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write("{}");
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/observer/:game_id", async (req, res) => {
        let sql =
          "SELECT bid, tid, last_move, game_state FROM gamestate WHERE game_id = $game_id ORDER BY id DESC LIMIT 1";
        let params = { $game_id: req.params.game_id };

        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          let game = games[0];
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(JSON.stringify(game));
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/keystate/:game_id/:player_pkey", async (req, res) => {
        let sql =
          "SELECT * FROM gamestate WHERE game_id = $game_id AND player = $playerpkey ORDER BY id DESC LIMIT 1";
        let params = {
          $game_id: req.params.game_id,
          $playerpkey: req.params.player_pkey,
        };
        let games = await app.storage.queryDatabase(sql, params, "arcade");

        if (games.length > 0) {
          let game = games[0];
          res.setHeader("Content-type", "text/html");
          res.charset = "UTF-8";
          res.write(game.game_state.toString());
          res.end();
          return;
        }
      });

      expressapp.get("/arcade/restore/:game_id/:player_pkey", async (req, res) => {
        let sql = "SELECT * FROM gamestate WHERE game_id = $game_id ORDER BY id DESC LIMIT 10";
        let params = { $game_id: req.params.game_id };
        let games = await app.storage.queryDatabase(sql, params, "arcade");

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

      expressapp.get("/arcade/invite/:gameinvite", async (req, res) => {
        res.setHeader("Content-type", "text/html");
        res.sendFile(path.resolve(__dirname + "/web/invite.html"));
      });
    }
  }


}


module.exports = Observer;
