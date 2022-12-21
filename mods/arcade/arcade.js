const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const ArcadeMain = require("./lib/main/main");
const SaitoHeader = require("./../../lib/saito/ui/saito-header/saito-header");
const InviteManager = require("./lib/invite-manager");
const GameWizard = require("./lib/overlays/game-wizard");

class Arcade extends ModTemplate {

  constructor(app) {
    super(app);
    this.name = "Arcade";
    this.description = "Interface for creating and joining games coded for the Saito Open Source Game Engine.";
    this.categories = "Games Entertainment Utilities";

    this.mods = [];
    this.games = [];

    this.icon_fa = "fas fa-gamepad";
    this.ui_initialized = false;

    this.styles = ['/arcade/style.css'];
    this.debug = false;
  }


  canRenderInto(qs) {
    if (qs === ".redsquare-sidebar") { return true; }
    return false;
  }
  renderInto(qs) {
    if (qs == ".redsquare-sidebar") {
      this.styles = ['/arcade/css/arcade-join-game-overlay.css','/arcade/css/arcade-invites.css', '/arcade/css/arcade-wizard.css'];
      if (!this.renderIntos[qs]) {
        this.renderIntos[qs] = [];
        this.renderIntos[qs].push(new InviteManager(this.app, this, ".saito-sidebar.right"));
      }
      this.attachStyleSheets();
      this.renderIntos[qs].forEach((comp) => { comp.render(); });



      //
      // TEMPORARY event for rendering hardcoded game invite
      //

      let invites = [
        {
          id: "abcd1234",
          game: "twilight",
          name: "Twilight Struggle",
          type: "custom",
          players: 1
        },
        {
          id: "abcd5678",
          game: "solitrio",
          name: "Beleaguered Solitaire",
          type: "standard",
          players: 3
        },
        {
          id: "abcd12346677",
          game: "settlers",
          name: "Settlers of Saitoa",
          type: "standard",
          players: 5
        },
      ]


      for (let i = 0; i < invites.length; i++) {
        this.app.connection.emit('invite-render-request', invites[i]);
      }
    }

  }


  //
  // this initializes the DOM but does not necessarily show the loaded content
  // onto the page, as we are likely being asked to render the components on
  // the application BEFORE we have any peers capable of feeding us content.
  //
  render() {
    
    if (this.main == null) {
      this.main = new ArcadeMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.addComponent(this.header);
      this.addComponent(this.main);
    }
    
    super.render();
    
  } 
    


  //
  //
  //
  initialize(app) {

    arcade_self = this;
    super.initialize(app);

    //
    // list of arcade games
    //
    app.modules.respondTo("arcade-games").forEach(game_mod => {
console.log("ADDING: " + game_mod.returnName());
      arcade_self.games.push(game_mod);
    });

    //
    // initiate game wizard and listener inside constructor for invites
    //
    let x = new GameWizard(app, arcade_self, null, {});

  }


   async verifyOptions(gameType, options){
    if (gameType !== "single"){
      for (let game of this.games){
        if (this.isMyGame(game, this.app) && game.msg.players_needed>1){
          let c = await sconfirm(`You already have a ${game.msg.game} game open, are you sure you want to create a new game invite?`);
          if (!c){
            return false;
          }
        }
        if (game.msg.game === options.game){
          let c = await sconfirm(`There is an open invite for ${game.msg.game}, are you sure you want to create a new invite?`);
          if (!c){
            return false;
          }
        }
      }
    }

    //
    // if crypto and stake selected, make sure creator has it
    //
    try{
      if (options.crypto && parseFloat(options.stake) > 0) {
        let crypto_transfer_manager = new GameCryptoTransferManager(this.app);
        let success = await crypto_transfer_manager.confirmBalance(this.app, this, options.crypto, options.stake);
        if (!success){
          return false;
        }
      }
    }catch(err){
       console.log("ERROR checking crypto: " + err);
      return false;
    }

    return true;
  }

  isMyGame(invite, app) {
    for (let i = 0; i < invite.msg.players.length; i++) {
      if (invite.msg.players[i] == app.wallet.returnPublicKey()) {
        return true;
      }
    }
    return false;
  }

  makeGameInvite(options, gameType = "public"){
    console.log(JSON.parse(JSON.stringify(options)));

    let game = options.game;
    let game_mod = this.app.modules.returnModule(game);
    let players_needed = options["game-wizard-players-select"];

    if (!players_needed) {
      console.error("Create Game Error");
      console.log(options);
      return;
    }

    if (options["game-wizard-players-select-max"] && !options["open_table"]){
      options["game-wizard-players-select-max"] = players_needed;
    }


    let gamedata = {
      ts: new Date().getTime(),
      name: game,
      slug: game_mod.returnSlug(),
      options: options,
      players_needed: players_needed,
      invitation_type: gameType,
    };

    if (players_needed == 1) {
      this.launchSinglePlayerGame(this.app, gamedata); //Game options don't get saved....
    } else {

      if (gameType == "private" || gameType == "direct") {
        gamedata.invitation_type = "private";
      }

      if (gameType == "direct") {
        let newtx = this.createOpenTransaction(gamedata, options.publickey);
        let w = new ScheduleInvite(this.app, this, newtx);
        w.render(this.app, this);
        return;
      }

      let newtx = this.createOpenTransaction(gamedata);
      this.app.network.propagateTransaction(newtx);

      //
      // and relay open if exists
      //
      let peers = [];
      for (let i = 0; i < this.app.network.peers.length; i++) {
        peers.push(this.app.network.peers[i].returnPublicKey());
      }

      this.app.connection.emit("send-relay-message", {recipient: peers, request: "arcade spv update", data: newtx});

      this.addGameToOpenList(newtx);

      this.active_tab = "arcade"; //So it refreshes to show the new game invite

      //this.renderArcadeMain(this.app, this.mod);

      if (gameType == "private") {
        console.log(newtx);
        //Create invite link from the game_sig
        this.showShareLink(newtx.transaction.sig);
      }
    }
  }

  showShareLink(game_sig) {
    let data = {};

    //Add more information about the game
    let accepted_game = this.games.find((g) => g.transaction.sig === game_sig);

    if (accepted_game) {
      data.game = accepted_game.msg.game;
    }else{
      console.log("Game invitation not found");
      return;
    }

    //Create invite link from the game_sig
    let inviteLink = window.location.origin;

    inviteLink += "/arcade?jid=" + game_sig;

    data.invite_link = inviteLink;

    console.log(JSON.stringify(data));

    let invitationModal = new InvitationLink(this.app, this);
    invitationModal.render(this.app, this, data);
  }

  async launchSinglePlayerGame(app, gameobj) {
    try {

      this.launchGame();

      if (app.options.games){
        for (let i = 0; i < app.options.games.length; i++){
          if (app.options.games[i].module == gameobj.name){
            console.log("We already have an open copy of this single player game");
            this.launchGame(app.options.games[i].id);
            return;
          }
        }
      }

      let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
      tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey(), 0.0));

      tx.msg = {};
      tx.msg.request = "launch singleplayer";
      tx.msg.module = gameobj.name;
      tx = this.app.wallet.signTransaction(tx);
      this.app.network.propagateTransaction(tx);

      let gameMod = app.modules.returnModule(gameobj.name);
      let game_id = await gameMod.initializeSinglePlayerGame(gameobj);

      this.addMyGamesToOpenList();
      this.launchGame(game_id);

    } catch (err) {
      console.log(err);
      return;
    }

  }

  createOpenTransaction(gamedata, recipient = "") {

    let sendto = this.app.wallet.returnPublicKey();
    let moduletype = "Arcade";

    //
    // currently used actively in game invite process
    //
    if (recipient != "") {
      sendto = recipient;
      moduletype = "ArcadeInvite";
    }

    let { ts, name, options, players_needed, invitation_type } = gamedata;

    let requestMsg = invitation_type == "private" ? "private" : "open";

    let accept_sig = this.app.crypto.signMessage(
      `invite_game_${ts}`,
      this.app.wallet.returnPrivateKey()
    );

    let tx = this.app.wallet.createUnsignedTransactionWithDefaultFee();
    if (recipient != "") { tx.transaction.to.push(new saito.default.slip(sendto, 0.0)); }

    tx.msg = {
      ts: ts,
      module: moduletype,
      request: requestMsg,
      game: name,
      options: options,
      players_needed: parseInt(players_needed),
      players: [this.app.wallet.returnPublicKey()],
      players_sigs: [accept_sig],
      originator: this.app.wallet.returnPublicKey(),
    };
    tx = this.app.wallet.signTransaction(tx);

    return tx;
  }


  addGameToOpenList(tx) {
    if (this.validateGame(tx)) {
      this.games.unshift(tx);
      this.main.renderArcadeTab(this.app, this);
    }
  }


  /*
    Process games we read from Arcade SQL table
    First validate the games (make sure they are game invite txs)
    and filter any old games (for which we aren't a member...)
    TODO: if I see my old invite, but no one else does, what is the point?
  */
  addGamesToOpenList(txs) {
    console.log("Loaded games:");
    txs.forEach((tx, i) => {
      if (this.validateGame(tx)) {
          console.log(JSON.parse(JSON.stringify(tx)));
          this.games.unshift(tx);
      }
    });

    this.removeOldGames();
    this.main.renderArcadeTab(this.app, this);

  }


  //
  // add my own games (as fake txs)
  //
  addMyGamesToOpenList(){
    if (this.app?.options?.games != null) {
      for (let game of this.app.options.games) {
        if (game.over == 0 && (game.players_set != 1 || game.players.includes(this.app.wallet.returnPublicKey()) || game.accepted.includes(this.app.wallet.returnPublicKey()))) {
          this.addGameToOpenList(this.createGameTXFromOptionsGame(game));
        }
      }
    }

  }


   removeOldGames() {
    let removed_old_games = false;

    for (let i = this.games.length-1; i >= 0; i--) {
      if (!this.games[i].msg?.players?.includes(this.app.wallet.returnPublicKey())) {
        let timepassed = new Date().getTime() - parseInt(this.games[i].transaction.ts);
        if (timepassed > this.old_game_removal_delay) {
          this.games.splice(i, 1);
          removed_old_games = true;
        }
      }
    }

    return removed_old_games;
  }

   /**
   * given a game from app.options.games creates the transaction wrapper
   * so that addGameToOpenList works (i.e. inserts into [arcade.]games list and re-renders ArcadeMain so that game displays)
   */
  createGameTXFromOptionsGame(game) {
    let game_tx = new saito.default.transaction();

    //
    // ignore games that are over
    //
    if (this.debug) { console.info("GAME OVER: " + game.over + ", LAST BLOCK: " + game.last_block + ", Game ID: " + game.id); }

    if (game.over) {
      if (game.last_block > 0) {
        return;
      }
    }

    if (game.players) {
      game_tx.transaction.to = game.players.map((player) => new saito.default.slip(player));
      game_tx.transaction.from = game.players.map((player) => new saito.default.slip(player));
    } else {
      game_tx.transaction.from.push(new saito.default.slip(this.app.wallet.returnPublicKey()));
      game_tx.transaction.to.push(new saito.default.slip(this.app.wallet.returnPublicKey()));
    }

    let msg = {
      request: "loaded",
      game: game.module,
      game_id: game.id,
      options: game.options,
      players: game.players,
      players_needed: game.players_needed,
      over: game.over,
      last_block: game.last_block,
    };

    game_tx.transaction.sig = game.id;
    game_tx.msg = msg;
    // screws up sig
    //game_tx = this.app.wallet.signTransaction(game_tx);

    return game_tx;
  }

}

module.exports = Arcade;
