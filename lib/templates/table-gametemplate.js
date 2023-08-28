/****************************************************************
 *
 * An extension of the Game Engine for special games like
 * Poker or Blackjack where you want to start a game with
 * 2 players, but have open slots on the table that other
 * players can join at a later time. Meanwhile, players can
 * stop playing without ending the game
 *
 *
 ***************************************************************/



let saito = require("../saito/saito");
let GameTemplate = require("./gametemplate");

class GameTableTemplate extends GameTemplate {

  constructor(app) {

    super(app);

    this.opengame = true; //We will use this as a flag for Arcade to distinguish between parent and child class
    this.toJoin = [];
    this.toLeave = [];
    this.statistical_unit = "hand";
    
  }

  async render(app) {
    await super.render(app);

    //Parse game options
    console.log(JSON.parse(JSON.stringify(this.game.options)));

    this.maxPlayers = this.game.options["game-wizard-players-select-max"] || this.maxPlayers;

    this.menu.addMenuOption("game-game", "Game");

    if (this.game.player > 0) {
      this.menu.addSubMenuOption("game-game", {
        text: "Leave Table",
        id: "game-table",
        class: "game-table",
        callback: async function (app, game_mod) {
          game_mod.menu.hideSubMenus();
          let c = await sconfirm("Do you wish to leave the table at the end of this hand?");
          if (c) {
            await game_mod.sendMetaMessage("LEAVE");
          }

        },
      });

      return;      
    }


    if (this.game.players.length < this.maxPlayers && this.game.options["open-table"]) {
      if (!this.game.eliminated || !this.game.eliminated.includes(this.publicKey)) {
        this.menu.addSubMenuOption("game-game", {
          text: "Join Table",
          id: "game-table",
          class: "game-table",
          callback: async function (app, game_mod) {
            game_mod.menu.hideSubMenus();
            let c = await sconfirm("Request to be dealt into the next hand?");
            if (c){
              await game_mod.sendMetaMessage("JOIN");  
            }
          },
        });

      }
    }

  }

  async sendMetaMessage(request) {
    let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee();
    newtx.msg = {
      module: this.name,
      game_id: this.game.id,
      request: request,
      my_key: this.publicKey,
    };

    for (let i = 0; i < this.game.accepted.length; i++) {
      newtx.addTo(this.game.accepted[i]);
    }

    console.log(JSON.parse(JSON.stringify(this.game.accepted)));
    console.log(JSON.parse(JSON.stringify(newtx.msg)));

    await newtx.sign();


    await this.app.network.propagateTransaction(newtx);
    this.app.connection.emit("relay-send-message", {
      recipient: this.game.accepted,
      request: "game relay update",
      data: newtx.toJson(),
    });

  }


  //
  //
  //
  async handlePeerTransaction(app, tx, peer, mycallback = null) {
 
    let message;
    if (tx == null) { return; }
    try {
        message = tx.returnMessage();
    } catch (err) {
        console.log("errore 4123123");
        console.log(JSON.stringify(tx));
    }

    // servers should not make game moves
    if (app.BROWSER == 0) {
      return;
    }

    if (message?.request === "game relay update") {
      if (message?.data != undefined) {
        let gametx = new Transaction(undefined, message?.data);

        let gametxmsg = gametx.returnMessage();

        //
        if (this.name === gametxmsg.module) {
          //console.log("Game Peer Request",JSON.parse(JSON.stringify(gametxmsg)));

          if (gametxmsg.game_id) {
            if (this.game.id !== gametxmsg.game_id) {
              this.game = this.loadGame(gametxmsg.game_id);
            }
          } else if (gametxmsg.id) {
            gametxmsg.game_id = gametxmsg.id;
            if (this.game.id !== gametxmsg.id) {
              this.game = this.loadGame(gametxmsg.id);
            }
          }

          if (!this.game?.id || gametxmsg.game_id != this.game.id) {
            return;
          }

          if (gametxmsg.request === "JOIN") {
            console.log("Join request:" + gametxmsg.my_key);
            if (!this.toJoin.includes(gametxmsg.my_key)) {
              this.toJoin.push(gametxmsg.my_key);
              siteMessage(
                `${
                  this.publicKey == gametxmsg.my_key
                    ? "You"
                    : app.keychain.returnUsername(gametxmsg.my_key)
                } will be dealt in next hand`,
                2500
              );
            }
            console.log(JSON.stringify(this.toJoin));
          }
          if (gametxmsg.request === "LEAVE") {
            console.log("Leave request:" + gametxmsg.my_key);
            if (!this.toLeave.includes(gametxmsg.my_key)) {
              this.toLeave.push(gametxmsg.my_key);
              siteMessage(
                `${
                  this.publicKey == gametxmsg.my_key
                    ? "You"
                    : app.keychain.returnUsername(gametxmsg.my_key)
                } will leave the table after this hand`,
                2500
              );
            }
          }
          if (gametxmsg.request === "CANCEL") {
            this.toJoin = this.toJoin.filter((key) => key !== gametxmsg.my_key);
            this.toLeave = this.toLeave.filter((key) => key !== gametxmsg.my_key);
            siteMessage(`${app.keychain.returnUsername(gametxmsg.my_key)} changed their mind`, 2500);
          }
        }
      }
    }

    await super.handlePeerTransaction(app, tx, peer, mycallback);

    return;
  }

  addPlayerLate(address) {
    if (!this.addPlayer(address)) {
      return;
    }
    //To add a player after the game started,
    // need to assign this.game.player
    // add key
    if (this.publicKey === address) {
      //this.game.live = 1;
      this.game.player = this.game.players.length;
    }
    this.game.keys.push(address);
  }

  removePlayerFromState(index) {
    console.error("Did you define removePlayerFromState in your game module?");
  }

  addPlayerToState(address) {
    console.error("Did you define addPlayerToState in your game module?");
  }

  async processResignation(resigning_player, txmsg) {
    //End game if only two players
    if (this.game.players.length == 2) {
      await super.processResignation(resigning_player, txmsg);
      return;
    }

    //Stop receiving game txs
    if (!this.game.players.includes(resigning_player)) {
      console.log(resigning_player + " not in ", (this.game.players));
      //Player already not an active player, make sure they are also removed from accepted to stop receiving messages
      for (let i = this.game.accepted.length; i >= 0; i--) {
        if (this.game.accepted[i] == resigning_player) {
          this.game.accepted.splice(i, 1);
        }
      }
      return;
    }

    //Schedule to leave at end of round
    if (!this.toLeave.includes(resigning_player)) {
      this.toLeave.push(resigning_player);
    }
  }

  /**
   * Definition of core gaming logic commands
   */
  initializeQueueCommands() {
    //Take all Game Engine Commands
    super.initializeQueueCommands();

    //Add some more ones
    this.commands.push((game_self, gmv) => {
      if (gmv[0] === "PLAYERS") {
        let change = this.toLeave.length + this.toJoin.length > 0;
        game_self.game.queue.splice(game_self.game.queue.length - 1, 1);
        console.log("Checking player change between rounds");
        console.log(JSON.stringify(this.toLeave), JSON.stringify(this.toJoin));
        for (let pkey of this.toLeave) {
          let i = this.game.players.indexOf(pkey);
          this.removePlayerFromState(i);
          this.removePlayer(pkey);
          this.updateLog(`Player ${i + 1} (${this.app.keychain.returnUsername(pkey)}) leaves the table.`);
          if (pkey === this.publicKey) {
            this.app.connection.emit("arcade-gametable-removeplayer", this.game.id);
          }
        }

        while (this.toJoin.length > 0 && this.game.players.length < this.maxPlayers) {
          let pkey = this.toJoin.shift();
          this.addPlayerToState(pkey);
          this.addPlayerLate(pkey);
          this.updateLog(
            `${this.app.keychain.returnUsername(pkey)} joins the table as Player ${this.game.players.length}`
          );
          if (pkey === this.publicKey) {
            this.app.connection.emit("arcade-gametable-addplayer", this.game.id);
          }
        }

        this.toLeave = [];

        if (game_self.game.players.length === 1) {
          this.game.queue.push("checkplayers");
          return 1;
        }

        if (change) {
          this.game.halted = 1;

          console.log("!!!!!!!!!!!!!!!!!!!!");
          console.log("!!! GAME UPDATED !!!");
          console.log("!!!!!!!!!!!!!!!!!!!!");
          console.log("My Public Key: " + this.publicKey);
          console.log("My Position: " + this.game.player);
          console.log("ALL PLAYERS: " + JSON.stringify(this.game.players));
          console.log("ALL KEYS: " + JSON.stringify(this.game.keys));
          console.log("saving with id: " + this.game.id);
          console.log("!!!!!!!!!!!!!!!!!!!!");
          console.log("!!!!!!!!!!!!!!!!!!!!");
          console.log("!!!!!!!!!!!!!!!!!!!!");

          this.saveGame(this.game.id);
          setTimeout(() => {
            this.initialize_game_run = 0;
            this.initializeGameQueue(this.game.id);
          }, 1000);
          return 0;
        }
      }
      return 1;
    });
  }
}

module.exports = GameTableTemplate;
