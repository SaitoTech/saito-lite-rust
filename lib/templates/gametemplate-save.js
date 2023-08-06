/*********************************************************************************
 GAME SAVE


 **********************************************************************************/

class GameSave {

  deleteGamePreference(key) {
    if (this.app.options) {
      if (this.app.options.gameprefs) {
        if (this.app.options.gameprefs[key]) {
          delete this.app.options.gameprefs[key];
        }
      }
    }
    return null;
  }

  loadGamePreference(key) {
    if (this.app.options) {
      if (this.app.options.gameprefs) {
        return this.app.options.gameprefs[key];
      }
    }
    return null;
  }

  saveGamePreference(key, value) {
    if (this.app.options.games == undefined) {
      this.app.options.games = [];
    }
    if (this.app.options.gameprefs == undefined) {
      this.app.options.gameprefs = {};
      this.app.options.gameprefs.random = this.app.crypto.generateKeys();
    }

    this.app.options.gameprefs[key] = value;
    this.app.storage.saveOptions();
  }

  saveGame(game_id) {

    if (!this.app.BROWSER) {
      return;
    }

    //console.log("---------------------");
    //console.log("===== SAVING GAME ID: "+game_id);
    //console.log("---------------------");

    if (this.game == undefined) {
      console.warn("Saving Game Error: safety catch 1");
      return;
    }

    // make sure options file has structure to save your game
    if (!this.app.options) {
      this.app.options = {};
    }
    if (!this.app.options.games) {
      this.app.options = Object.assign(
        {
          games: [],
          gameprefs: { random: this.app.crypto.generateKeys() }
        },
        this.app.options
      );
    }

    //console.log("saveGame version: "+this.app.crypto.hash(Math.random()));
    if (!game_id || game_id !== this.game.id) {
      //game_id = this.app.crypto.hash(Math.random().toString(32));
      console.warn("ERR? Save game with wrong id");
      console.warn("Parameter: " + game_id, "this game.id = " + this.game.id);
      return;
    }

    if (game_id != null) {
      if (this.app.options?.games) {
        for (let i = 0; i < this.app.options.games.length; i++) {
          if (this.app.options.games[i].id === game_id) {
            this.game.timestamp = new Date().getTime();

            //
            // sept 25 - do not overwrite any future moves saved separately
            //
            for (let ii = 0; ii < this.app.options.games[i].future.length; ii++) {
              let do_we_contain_this_move = 0;
              for (let iii = 0; iii < this.game.future.length; iii++) {
                if (this.app.options.games[i].future[ii] === this.game.future[iii]) {
                  do_we_contain_this_move = 1;
                }
              }
              if (do_we_contain_this_move == 0) {
                this.game.future.push(this.app.options.games[i].future[ii]);
              }
            }

            this.app.options.games[i] = JSON.parse(JSON.stringify(this.game)); //create new object
            this.app.storage.saveOptions();
            return;
          }
        }
      }

    }

    //
    // If we didn't find the game (by id) in our wallet
    // add it and save the options

    this.app.options.games.push(JSON.parse(JSON.stringify(this.game)));
    this.app.storage.saveOptions();

  }

  loadGame(game_id = null) {
    //
    // try to load most recent game
    //
    if (game_id == null) {
      let game_to_open = -1;
      let timeStamp = 0;

      if (this.app.options?.games?.length > 0) {
        for (let i = 0; i < this.app.options.games.length; i++) {
          //It's not enough to just pull the most recent game,
          //Need to make sure it is the right game module!!
          if (
            this.name == this.app.options.games[i].module &&
            this.app.options.games[i].timestamp > timeStamp
          ) {
            game_to_open = i;
            timeStamp = this.app.options.games[i].timestamp;
          }
        }
        if (game_to_open > -1) {
          game_id = this.app.options.games[game_to_open].id;
        }
      }
    }

    //If we were given the game_id or found the most recent valid game, then load it
    if (game_id != null) {
      for (let i = 0; i < this.app.options?.games?.length; i++) {
        if (this.app.options.games[i].id === game_id) {
          this.game = JSON.parse(JSON.stringify(this.app.options.games[i]));
          console.log("Loading game: " + game_id);
          return this.game;
        }
      }
    }

    //No game to load, must create one
    console.info(`Load failed (${game_id} not found), so creating new game`);
    console.info(JSON.parse(JSON.stringify(this.app.options.games)));

    //we don't have a game with game_id stored in app.options.games
    this.game = this.newGame(game_id);
    this.saveGame(this.game.id);

    return this.game;
  }

  newGame(game_id = null) {
    console.log("=====CREATING NEW GAME ID: " + game_id);
    if (!game_id) {
      game_id = this.app.crypto.hash(Math.random().toString(32)); //Returns 0.19235734589 format. We never want this to happen!
      //game_id = this.app.crypto.hash(Math.random());
      //console.log("new id -- " + game_id);
    }
    //console.trace("Creating New Game","ID = "+game_id);
    let game = {};
    game.id = game_id;
    game.confirms_needed = [];
    game.crypto = "";
    //game.cryptos = {}; // READY adds this
    game.crypto_auto_settle = 0;
    game.player = 0;
    game.players = [];
    game.opponents = []; //Is this not redundanct?
    game.keys = [];
    game.players_needed = 1; //For when the Arcade (createGameTXfromOptionsGame)
    game.accepted = []; //Not clear what this was originally for, but is now a master list of players to receive game moves
    game.players_set = 0;
    game.target = 1;
    game.invitation = 1;
    game.initializing = 1;
    game.initialize_game_run = 0;
    game.accept = 0;
    game.over = 0;
    game.winner = 0;
    game.module = "";
    game.originator = "";
    game.timestamp = new Date().getTime();
    game.last_block = 0;
    game.options = {};
    game.options.ver = 1;
    game.invite_sig = "";
    game.future = []; // future moves (arrive while we take action)
    game.halted = 0;
    game.lock_interface = 0;

    game.clock_spent = 0;
    game.clock_limit = 0;

    game.step = {};
    game.step.game = 0; //Trial to start at 0.
    game.step.players = {}; // associative array mapping pkeys to last game step
    game.step.timestamp = 0; // last_move in observer mode

    game.queue = [];
    game.turn = [];
    game.deck = []; // shuffled cards
    game.pool = []; // pools of revealed cards
    game.dice = this.app.crypto.hash(game_id); //Why not just initialize the dice here?

    game.status = ""; // status message
    game.log = [];
    game.sroll = 0; // secure roll
    game.sroll_hash = "";
    game.sroll_done = 0;
    game.spick_card = ""; // card selected
    game.spick_hash = ""; // secure pick (simulatenous card pick)
    game.spick_done = 0;

    return game;
  }

  doesGameExistLocally(game_id) {
    if (this.app?.options?.games) {
      for (let i = 0; i < this.app.options.games.length; i++) {
        if (this.app.options.games[i].id === game_id) {
          return 1;
        }
      }
    }
    return 0;
  }

}

module.exports = GameSave;

