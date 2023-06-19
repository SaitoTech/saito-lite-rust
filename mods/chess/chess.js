const GameTemplate = require("../../lib/templates/gametemplate");
const saito = require("../../lib/saito/saito");
const ChessGameRulesTemplate = require("./lib/chess-game-rules.template");
const ChessGameOptions = require("./lib/chess-game-options.template");
const ChessSingularGameOptions = require("./lib/chess-singular-game-options.template");
<<<<<<< HEAD
const chess = require("./lib/chess.js");
const chessboard = require("./lib/chessboard");
=======
const chess = require('./lib/chess.js');
const chessboard = require('./lib/chessboard');
//const SaitoUser = require("../../lib/saito/ui/saito-user/saito-user");

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

let this_chess = null;

class Chessgame extends GameTemplate {
  constructor(app) {
    super(app);

    this.name = "Chess";
    this.description =
      "Chess is a two-player strategy board game played on a checkered board with 64 squares arranged in an 8×8 grid.";
    this.board = null;
    this.engine = null;
    this_chess = this;

    this.icon = "fa-sharp fa-solid fa-chess";

    this.minPlayers = 2;
    this.maxPlayers = 2;

    this.description = "An implementation of Chess for the Saito Blockchain";
    this.categories = "Games Boardgame Classic";

    this.confirm_moves = 1;

    this.roles = ["Observer", "White", "Black"];
    this.app = app;
  }

<<<<<<< HEAD
  async initializeHTML(app) {
    if (!this.browser_active) {
      return;
    }
    await super.initializeHTML(app);
=======

  render(app) {

    if (!this.browser_active) { return; }
    if (this.initialize_game_run) { return; }

    super.render(app);
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    //
    // ADD MENU
    //
    this.menu.addMenuOption("game-game", "Game");
<<<<<<< HEAD
    this.menu.addMenuOption("game-info", "Info");

    /*
    this.menu.addSubMenuOption("game-game", {
      text : "Play Mode",
      id : "game-confirm",
      class : "game-confirm",
      callback : function(app, game_mod) {
         game_mod.menu.showSubSubMenu("game-confirm");
      }
    });

    this.menu.addSubMenuOption("game-confirm",{
      text: `Newbie ${(this.confirm_moves==1)?"✔":""}`,
      id:"game-confirm-newbie",
      class:"game-confirm-newbie",
      callback: function(app,game_mod){
        if (game_mod.confirm_moves == 0){
          //game_mod.saveGamePreference('chess_expert_mode', 1);
          //setTimeout(function() { window.location.reload(); }, 1000);
        }else{
          game_mod.menu.hideSubMenus();
        }
      }
    });

    this.menu.addSubMenuOption("game-confirm",{
      text: `Expert ${(this.confirm_moves==1)?"":"✔"}`,
      id:"game-confirm-expert",
      class:"game-confirm-expert",
      callback: function(app,game_mod){
        if (game_mod.confirm_moves == 1){
          //game_mod.saveGamePreference('chess_expert_mode', 0);
          //setTimeout(function() { window.location.reload(); }, 1000);
        }else{
          game_mod.menu.hideSubMenus();
        }
      }
    });
    */

    this.menu.addSubMenuOption("game-game", {
      text: "Offer Draw",
      id: "game-draw",
      class: "game-draw",
      callback: async function (app, game_mod) {
        if (game_mod.game.draw_offered == 0) {
          let c = await sconfirm("Offer to end the game in a draw?");
          if (c) {
            game_mod.updateStatusMessage("Draw offer sent; " + game_mod.status);
            game_mod.game.draw_offered = -1; //Offer already sent
            var data = { draw: "offer" };
            game_mod.endTurn(data);
          }
        } else {
          let c = await sconfirm("Accept offer to end the game in a draw?");
          if (c) {
            game_mod.updateStatusMessage("Draw offer accepted!");
            game_mod.game.draw_offered = -1; //Offer already sent
            var data = { draw: "accept" };
            game_mod.endTurn(data);
          }
        }
      },
    });

    this.menu.addSubMenuOption("game-game", {
      text: "Offer Draw",
      id: "game-draw",
      class: "game-draw",
      callback: async function (app, game_mod) {
        let c = await sconfirm("Do you really want to offer a draw?");
        if (c) {
          if (game_mod.game.draw_offered >= 0) {
            if (game_mod.game.draw_offered == 0) {
              game_mod.updateStatusMessage("Draw offer sent; " + game_mod.status);
              game_mod.game.draw_offered = -1;
              const data = { draw: "offer" };
              game_mod.endTurn(data);
            }
          }
        }
      },
    });

    this.menu.addSubMenuOption("game-game", {
      text: "Resign",
      id: "game-resign",
      class: "game-resign",
      callback: async function (app, game_mod) {
        let c = await sconfirm("Do you really want to resign?");
        if (c) {
          await game_mod.resignGame(game_mod.game.id, "resignation");
        }
      },
    });

    this.menu.addSubMenuOption("game-info", {
      text: "Rules",
=======

    if (this.game.player > 0){

      this.menu.addSubMenuOption("game-game", {
        text : (this.game.draw_offered)? "Accept Draw": "Offer Draw",
        id : "game-draw",
        class : "game-draw",
        callback : async function(app, game_mod) {
           if (game_mod.game.draw_offered == 0){
              let c = await sconfirm("Offer to end the game in a draw?");
              if (c) {
                game_mod.updateStatusMessage("Draw offer sent; " + game_mod.status);
                game_mod.game.draw_offered = -1; //Offer already sent
                var data = {draw: "offer"};
                game_mod.endTurn(data);
                return;
              }  
            }else{
              let c = await sconfirm("Accept offer to end the game in a draw?");
              if (c) {
                game_mod.updateStatusMessage("Draw offer accepted!");
                game_mod.game.draw_offered = -1; //Offer already sent
                var data = {draw: "accept"};
                game_mod.endTurn(data);
                return;
              }
            }
        }
      });

      this.menu.addSubMenuOption("game-game", {
        text : "Resign",
        id : "game-resign",
        class : "game-resign",
        callback : async function(app, game_mod) {
          let c = await sconfirm("Do you really want to resign?");
          if (c) {
            game_mod.resignGame(game_mod.game.id, "resignation");
            return;
          }
        }
      });

    }

    this.menu.addSubMenuOption("game-game", {
      text: "How to Play",
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      id: "game-rules",
      class: "game-rules",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(game_mod.returnGameRulesHTML());
      },
    });

    await this.menu.addChatMenu();
    await this.menu.render();

    this.log.render();

<<<<<<< HEAD
    //Plug Opponent Information into the Controls
    if (this.game.player) {
      let opponent = this.game.opponents[0];
      console.log("bbbb : ", this.game);
      let identicon = this.app.keychain.returnIdenticon(opponent);
      identicon = identicon ? `<img class="player-identicon" src="${identicon}">` : "";

      let name = this.app.keychain.returnUsername(opponent);
      if (name && name.indexOf("@") > 0) {
        name = name.substring(0, name.indexOf("@"));
      }

      $("#opponent_id").html(name);
      $("#opponent_identicon").html(identicon);
    } else {
      //Hide some controls in Observer Mode
      $(".hide_in_observer").remove();
    }
  }

  async switchColors() {
    // observer skips
    if (this.game.player === 0 || !this.game.players.includes(this.publicKey)) {
      return 1;
    }

    //Game engine automatically randomizes player order, so we are good to go
    if (!this.game.options.player1 || this.game.options.player1 == "random") {
      return 1;
    }

    //Reordeer the players so that originator can be the correct role
    if (this.game.options.player1 === "white") {
      if (this.game.players[0] !== this.game.originator) {
        let p = this.game.players.shift();
        this.game.players.push(p);
      }
    } else {
      if (this.game.players[1] !== this.game.originator) {
        let p = this.game.players.shift();
        this.game.players.push(p);
      }
    }
    //Fix game.player so that it corresponds to the indices of game.players[]
    for (let i = 0; i < this.game.players.length; i++) {
      if (this.game.players[i] === (await this.app.wallet.getPublicKey())) {
        this.game.player = i + 1;
      }
    }
  }
=======
    this.playerbox.render();   

    this.playerbox.updateUserline(this.roles[this.game.player], this.game.player);
    this.playerbox.updateGraphics(`<div class="tool-item item-detail turn-shape ${this.roles[this.game.player].toLowerCase()}"></div>`, this.game.player);
    this.playerbox.updateUserline(this.roles[(3-this.game.player)], (3-this.game.player));
    this.playerbox.updateGraphics(`<div class="tool-item item-detail turn-shape ${this.roles[(3-this.game.player)].toLowerCase()}"></div>`, (3-this.game.player));

    window.onresize = () => this.board.resize();

  }

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

  async initializeGame(game_id) {
    console.log("######################################################");
    console.log("######################################################");
    console.log("######################         #######################");
    console.log("######################  CHESS  #######################");
    console.log("######################         #######################");
    console.log("######################################################");
    console.log("######################################################");
    console.log(game_id);

    //
    // There is no initializing in Chess -- finish initializing
    //
    if (this.game.initializing == 1) {
      this.game.queue.push("READY");
      //Check colors
      await this.switchColors();
    }

    if (!this.browser_active) {
      return;
    }

<<<<<<< HEAD
    this.board = new chessboard("board", { pieceTheme: "img/pieces/{piece}.png" });
=======
    if (this.loadGamePreference("chess_expert_mode")){
      this.confirm_moves = 0;
    }

    this.board = new chessboard('board', { pieceTheme: 'img/pieces/{piece}.png' });
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    this.engine = new chess.Chess();

    if (this.game.position != undefined) {
      this.engine.load(this.game.position);
    } else {
      this.game.position = this.engine.fen();
    }

    if (this.game.over) {
      this.lockBoard(this.engine.fen());
    } else {
      this.setBoard(this.engine.fen());
    }

    //
    //game.target is initialized to 1, which is white (switched above if "player 1" wanted to be black)
    //
    if (this.game.target == this.game.player) {
<<<<<<< HEAD
      if (this.useClock) {
        this.startClock();
      }
=======
      if (this.useClock) { this.startClock(); }
      this.setPlayReminder();
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }

    // If we have a fast-ish timed game turn off move confirmations initially
    if (this.useClock && parseInt(this.game.options.clock) < 15) {
      this.confirm_moves = 0;
    }

    this.updateStatusMessage();
    this.game.draw_offered = this.game.draw_offered || 0;
<<<<<<< HEAD
    this.attachGameEvents();
=======
    //this.attachGameEvents();


>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }

  ////////////////
  // handleGame //
  ////////////////
<<<<<<< HEAD
  async handleGameLoop(msg = {}) {
=======
  handleGameLoop(msg={}) {

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    msg = {};
    if (this.game.queue.length > 0) {
      msg.extra = JSON.parse(
        this.app.crypto.base64ToString(this.game.queue[this.game.queue.length - 1])
      );
    } else {
      msg.extra = {};
    }
    this.game.queue.splice(this.game.queue.length - 1, 1);

    console.log("QUEUE IN CHESS: " + JSON.stringify(this.game.queue));
    console.log(JSON.parse(JSON.stringify(msg.extra)));

    if (msg.extra == undefined) {
      console.log("NO MESSAGE DEFINED!");
    }
    if (msg.extra.data == undefined) {
      console.log("NO MESSAGE RECEIVED!");
    }

    //
    // the message we get from the other player
    // tells us the new board state, so we
    // update our own information and save the
    // game
    //
    let data = JSON.parse(msg.extra.data);

    if (data.draw) {
      if (data.draw === "accept") {
        console.log("Ending game");
        await this.endGame(this.game.players, "draw");
        return;
      } else {
        //(data.draw == "offer")
        if (this.game.player === msg.extra.target) {
          this.game.draw_offered = 2; //I am receving offer
          this.updateStatusMessage("Opponent offers a draw; " + this.status);
<<<<<<< HEAD
        }
      }
      //Refresh events
      this.attachGameEvents();

=======
          this.render(this.app);
        } 
      }
      //Refresh events
      //this.attachGameEvents();
      
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      //Process independently of game moves
      //i.e. don't disrupt turn system
      return;
    }

    if (this.game.draw_offered !== 0) {
      this.game.draw_offered = 0; //No offer on table
<<<<<<< HEAD
      this.attachGameEvents();
    }

=======
      //this.attachGameEvents();      
    }

    this.game.last_position = this.game.position;
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    this.game.position = data.position;

    this.updateLog(data.move);

    if (this.browser_active == 1) {
      this.updateBoard(this.game.position);
<<<<<<< HEAD

=======
      this.updateOpponent(msg.extra.target, data.move);
  
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      //Check for draw according to game engine
      if (this.engine.in_draw() === true) {
        await this.endGame(this.game.players, "draw");
        return 0;
      }

      this.game.target = msg.extra.target;

      if (msg.extra.target == this.game.player) {
        //I announce that I am in checkmate to end the game
        if (this.engine.in_checkmate() === true) {
          await this.resignGame(this.game.id, "checkmate");
          return 0;
        }

<<<<<<< HEAD
        if (this.useClock) {
          this.startClock();
        }
=======
        if (this.useClock) { this.startClock(); }
        this.setPlayReminder();

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
      }
    }

    this.updateStatusMessage();
    this.saveGame(this.game.id);

    return 0;
  }

<<<<<<< HEAD
  removeEvents() {
=======












  switchColors(){
    // observer skips
    if (this.game.player === 0 || !this.game.players.includes(this.app.wallet.returnPublicKey())) { 
          return 1;
      } 

      //Game engine automatically randomizes player order, so we are good to go
      if (!this.game.options.player1 || this.game.options.player1 == "random"){
        return 1;
      }
      
      // re-order the players so that originator can be the correct role
      if (this.game.options.player1 === "white"){
        if (this.game.players[0] !== this.game.originator){
          let p = this.game.players.shift();
          this.game.players.push(p);
        }
      }else{
        if (this.game.players[1] !== this.game.originator){
          let p = this.game.players.shift();
          this.game.players.push(p);
        }
      }
      //Fix game.player so that it corresponds to the indices of game.players[]
      for (let i = 0; i < this.game.players.length; i++){
        if (this.game.players[i] === this.app.wallet.returnPublicKey()){
          this.game.player = i+1;
        }
      }

  }

  removeEvents(){
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    this.lockBoard(this.game.position);
  }

  endGameCleanUp() {
    let cont = document.getElementById("commands-cont");
    if (cont) {
      cont.style.display = "none";
    }
  }

  async endTurn(data) {
    let extra = {};

    extra.target = this.returnNextPlayer(this.game.player);
    extra.data = JSON.stringify(data);

    let data_to_send = this.app.crypto.stringToBase64(JSON.stringify(extra));
    this.game.turn = [data_to_send];
    this.moves = [];
    await this.sendMessage("game", extra);
  }

<<<<<<< HEAD
  attachGameEvents() {
    if (this.game?.player == 0 || !this.browser_active) {
      return;
    }

    let resign_icon = document.getElementById("resign_icon");
    let draw_icon = document.getElementById("draw_icon");
    let chat_btn = document.getElementById("chat-btn");

    if (resign_icon) {
      resign_icon.onclick = async () => {
        let c = await sconfirm("Do you really want to resign?");
        if (c) {
          await this.resignGame(this.game.id, "resignation");
          return;
        }
      };
    }

    if (draw_icon) {
      draw_icon.classList.remove("hidden");
      $(".flash").removeClass("flash");
      if (this.game.draw_offered >= 0) {
        draw_icon.onclick = async () => {
          if (this.game.draw_offered == 0) {
            let c = await sconfirm("Offer to end the game in a draw?");
            if (c) {
              this.updateStatusMessage("Draw offer sent; " + this.status);
              this.game.draw_offered = -1; //Offer already sent
              var data = { draw: "offer" };
              await this.endTurn(data);
            }
          } else {
            let c = await sconfirm("Accept offer to end the game in a draw?");
            if (c) {
              this.updateStatusMessage("Draw offer accepted!");
              this.game.draw_offered = -1; //Offer already sent
              var data = { draw: "accept" };
              await this.endTurn(data);
            }
          }
        };
        if (this.game.draw_offered > 0) {
          draw_icon.classList.add("flash");
        }
      } else {
        console.log("Hide draw icon");
        draw_icon.classList.add("hidden");
      }
    }

    if (chat_btn) {
      chat_btn.onclick = () => {
        this.app.connection.emit("open-chat-with", {
          key: this.game.players[2 - this.game.player],
          name: "Opponent",
        });
      };
    }

    window.onresize = () => this.board.resize();
  }
=======
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

  updateStatusMessage(str = "") {
    if (this.browser_active != 1) {
      return;
    }

<<<<<<< HEAD
    let statusEl = document.getElementById("status");
    let casualtiesEl = document.getElementById("captured");

    if (!statusEl || !casualtiesEl) {
      console.warn("Updating status to null elements");
      return;
    }
=======
    if (!this.browser_active) { return; }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0

    //
    // print message
    //
    if (str != "") {
      this.status = str;

      if (document.querySelector(".status")){
        this.app.browser.replaceElementBySelector(`<div class="status">${str}</div>`, ".status");
      } else {
        this.playerbox.updateBody(`<div class="status">${str}</div>`, this.game.player);  
      }
      
      return;

    //
    // or print game info
    //
    } else {

<<<<<<< HEAD
    let status = "";

    let moveColor = "White";
    let bgColor = "#fff";
    if (this.engine.turn() === "b") {
      moveColor = "Black";
      bgColor = "#111";
=======
      var status = '';
      var moveColor = (this.engine.turn() === 'b')? "Black" : 'White';
    
      // check?
      if (this.engine.in_check() === true) {
        status = moveColor + ' is in check';
      } else {
        if (this.roles[this.game.player] == moveColor){
          status = "your move";
        }else{
          status = "waiting for " + moveColor;
        }
      }
    
      this.status = status;
      status = `<div class="status">${status}</div>`;
      let captHTML = this.returnCapturedHTML(this.returnCaptured(this.engine.fen()), this.game.player);
      status = sanitize(captHTML) + status;
       
      this.playerbox.updateBody(status, this.game.player);

>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }
  }

<<<<<<< HEAD
    document.getElementById("turn-shape").style.backgroundColor = bgColor;

    // check?
    if (this.engine.in_check() === true) {
      status = moveColor + " is in check";
    } else {
      if (this.player_roles[this.game.player] == moveColor) {
        status = "It's your move, " + moveColor;
      } else {
        status = "Waiting for " + moveColor;
      }
    }

    this.status = status;
    statusEl.innerHTML = sanitize(status);
    let captHTML = this.returnCapturedHTML(this.returnCaptured(this.engine.fen()));
    if (captHTML !== "<br/>") {
      casualtiesEl.innerHTML = sanitize(captHTML);
      $("#captured-cont").removeClass("hidden");
    }
=======

  updateOpponent(target, move){
    
    let status = this.returnCapturedHTML(this.returnCaptured(this.engine.fen()), 3-this.game.player);

    if (target == this.game.player){
      status += `<div class="last_move">${move.substring(move.indexOf(":")+2)}</div>`;
    }

    this.playerbox.updateBody(status, 3-this.game.player);

    if (document.querySelector(".last_move")){
      document.querySelector(".last_move").onclick = () =>{
        if (this.game.last_position){
          this.setBoard(this.game.last_position);
          this.updateBoard(this.game.position);
        }
      };
    }
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
  }

  updateBoard(position) {
    console.log("MOVING OPPONENT's PIECE");

    this.engine.load(position);
    this.board.position(position, true);
  }

  setBoard(position) {
    console.log("SETTING BOARD");

    this.engine.load(position);

    if (this.board != undefined) {
      if (this.board.destroy != undefined) {
        this.board.destroy();
      }
    }

    let cfg = {
      draggable: true,
      position: position,
      // pieceTheme: 'chess/pieces/{piece}.png',
      pieceTheme: "img/pieces/{piece}.png",
      onDragStart: this.onDragStart,
      onDrop: this.onDrop,
      onMouseoutSquare: this.onMouseoutSquare,
      onMouseoverSquare: this.onMouseoverSquare,
      onChange: this.onChange,
      moveSpeed: 400,
    };

    if (this.browser_active == 1) {
      this.board = new chessboard("board", cfg);

      if (this.game.player == 2) {
        this.board.orientation("black");
      }
    }
  }

  lockBoard(position) {
    console.log("LOCKING BOARD");

    if (this.board != undefined) {
      if (this.board.destroy != undefined) {
        this.board.destroy();
      }
    }

    let cfg = {
      pieceTheme: "img/pieces/{piece}.png",
      moveSpeed: 0,
      position: position,
    };

    this.board = new chessboard("board", cfg);
    this.engine.load(position);

    if (this.game.player == 2) {
      this.board.orientation("black");
    }
  }

  //////////////////
  // Board Config //
  //////////////////
  onDragStart(source, piece, position, orientation) {
    if (this_chess.game.target !== this_chess.game.player) {
      return false;
    }
    if (
      this_chess.engine.game_over() === true ||
      this_chess.game.over ||
      (this_chess.engine.turn() === "w" && piece.search(/^b/) !== -1) ||
      (this_chess.engine.turn() === "b" && piece.search(/^w/) !== -1)
    ) {
      return false;
    }
  }

  onDrop(source, target, piece, newPos, oldPos, orientation, topromote) {
    this_chess.removeGreySquares();

    this_chess.game.move =
      this_chess.engine.fen().split(" ").slice(-1)[0] +
      " " +
      this_chess.colours(this_chess.engine.fen().split(" ")[1]) +
      ": ";

    this_chess.slot = target;

    //was a pawn moved to the last rank
    if (
      (source.charAt(1) == 7 && target.charAt(1) == 8 && piece == "wP") ||
      (source.charAt(1) == 2 && target.charAt(1) == 1 && piece == "bP")
    ) {
      // check with user on desired piece to promote.
      this_chess.checkPromotion(source, target, piece.charAt(0));
    } else {
      // see if the move is legal
      const move = this_chess.engine.move({
        from: source,
        to: target,
        promotion: "q", // NOTE: always promote to a queen for example simplicity
      });
      // illegal move
      if (move === null) return "snapback";
      // legal move - make it

      this_chess.game.move += this_chess.pieces(move.piece) + " ";

      this_chess.game.move += " - " + move.san;

      this_chess.confirmPlacement(() => {
        const data = {};
        data.position = this_chess.engine.fen();
        data.move = this_chess.game.move;
        this_chess.endTurn(data);
      });
    }
  }

  async promoteAfterDrop(source, target, piece) {
    const move = this_chess.engine.move({
      from: source,
      to: target,
      promotion: piece,
    });

    // legal move - make it
    this_chess.game.move += `${this_chess.pieces(move.piece)} - ${move.san}`;

    const data = {};
    data.position = this.engine.fen();
    data.move = this.game.move;
    await this.endTurn(data);
    this_chess.updateStatusMessage("Pawn promoted to " + this_chess.pieces(piece) + ".");
  }

  checkPromotion(source, target, color) {
    let html = ["q", "r", "b", "n"]
      .map((n) => `<div class="action piece" id="${n}">${this.piecehtml(n, color)}</div>`)
      .join("");

    html = `<div class="popup-confirm-menu promotion-choices">
              <div class="popup-prompt">Promote to:</div>
              ${html}
              <div class="action" id="cancel"> ✘ cancel</div>
              </div>`;

    let left = $(`#board`).offset().left;
    let top = $(`#board`).offset().top;

    if (this.slot) {
      left = $(`.square-${this.slot}`).offset().left + $(`.square-${this.slot}`).width();
      if (left + 100 > window.innerWidth) {
        left = $(`.square-${this.slot}`).offset().left - 150;
      }
      top = $(`.square-${this.slot}`).offset().top;
    }

    $(".popup-confirm-menu").remove();
    $("body").append(html);

    $(".popup-confirm-menu").css({
      position: "absolute",
      top: top,
      left: left,
    });
    if ($(".popup-confirm-menu").height() + top > window.innerHeight) {
      $(".popup-confirm-menu").css("top", window.innerHeight - $(".popup-confirm-menu").height());
    }

    $(".action").off();
    $(".action").on("click", async function () {
      let confirmation = $(this).attr("id");

      $(".action").off();
      $(".popup-confirm-menu").remove();
      if (confirmation == "cancel") {
        this_chess.setBoard(this_chess.game.position);
      } else {
        await this_chess.promoteAfterDrop(source, target, confirmation);
      }
    });
  }

  onMouseoverSquare(square, piece) {
    // get list of possible moves for this square
    const moves = this_chess.engine.moves({
      square: square,
      verbose: true,
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) {
      return;
    }

    // highlight the square they moused over
    this_chess.greySquare(square);

    // highlight the possible squares for this piece
    for (let i = 0; i < moves.length; i++) {
      this_chess.greySquare(moves[i].to);
    }
  }

  onMouseoutSquare(square, piece) {
    this_chess.removeGreySquares();
  }

  removeGreySquares() {
    let grey_squares = document.querySelectorAll("#board .square-55d63");
    Array.from(grey_squares).forEach((square) => (square.style.background = ""));
  }

  greySquare(square) {
    const squareEl = document.querySelector(`#board .square-${square}`);

    let background = "#c5e8a2";
    if (squareEl.classList.contains("black-3c85d") === true) {
      background = "#769656";
    }

    squareEl.style.background = background;
  }

  onChange(oldPos, newPos) {
    if (this_chess.game.target !== this_chess.game.player) {
      //This gets called when I update my board for my opponents move
      //Don't want to accidentally trigger a Send Move
      return;
    }

    console.log(oldPos, newPos);
  }

  confirmPlacement(callback) {
    if (this.confirm_moves == 0) {
      callback();
      return;
    }

    let html = `
          <div class="popup-confirm-menu">
            <div class="popup-prompt">Are you sure?</div>
            <div class="action" id="confirm"> ✔ yes</div>
            <div class="action" id="cancel"> ✘ cancel</div>
            <div class="confirm_check"><input type="checkbox" name="dontshowme" value="true"/> don't ask </div>
          </div>`;

    let left = $(`#board`).offset().left;
    let top = $(`#board`).offset().top;

    if (this.slot) {
      left = $(`.square-${this.slot}`).offset().left + 1.5 * $(`.square-${this.slot}`).width();
      if (left + 100 > window.innerWidth) {
        left = $(`.square-${this.slot}`).offset().left - 150;
      }
      top = $(`.square-${this.slot}`).offset().top;
    }

    $(".popup-confirm-menu").remove();
    $("body").append(html);

    $(".popup-confirm-menu").css({
      position: "absolute",
      top: top,
      left: left,
    });
    if ($(".popup-confirm-menu").height() + top > window.innerHeight) {
      $(".popup-confirm-menu").css("top", window.innerHeight - $(".popup-confirm-menu").height());
    }

    $(".action").off();
    $(".action").on("click", function () {
      let confirmation = $(this).attr("id");

      $(".action").off();
      $(".popup-confirm-menu").remove();
      if (confirmation == "confirm") {
        callback();
      } else {
        this_chess.setBoard(this_chess.game.position);
      }
    });

    $("input:checkbox").change(function () {
      if ($(this).is(":checked")) {
        this_chess.confirm_moves = 0;
<<<<<<< HEAD
      } else {
=======
        this_chess.saveGamePreference("chess_expert_mode", 1);
      }else{
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
        this_chess.confirm_moves = 1;
      }
    });
  }

  colours(x) {
    switch (x) {
      case "w":
        return "White";
      case "b":
        return "Black";
    }

    return;
  }

  pieces(x) {
    switch (x) {
      case "p":
        return "Pawn";
      case "r":
        return "Rook";
      case "n":
        return "Knight";
      case "b":
        return "Bishop";
      case "q":
        return "Queen";
      case "k":
        return "King";
    }

    return;
  }

  returnCaptured(afen) {
    afen = afen.split(" ")[0];
    let WH = ["Q", "R", "R", "B", "B", "N", "N", "P", "P", "P", "P", "P", "P", "P", "P"];
    let BL = ["q", "r", "r", "b", "b", "n", "n", "p", "p", "p", "p", "p", "p", "p", "p"];
    for (let i = 0; i < afen.length; i++) {
      if (WH.indexOf(afen[i]) >= 0) {
        WH.splice(WH.indexOf(afen[i]), 1);
      }
      if (BL.indexOf(afen[i]) >= 0) {
        BL.splice(BL.indexOf(afen[i]), 1);
      }
    }
    return [WH, BL];
  }

<<<<<<< HEAD
  returnCapturedHTML(acapt) {
    let captHTML = "";
    for (var i = 0; i < acapt[0].length; i++) {
      captHTML += this.piecehtml(acapt[0][i], "w");
    }

    captHTML += "<br/>";

    for (var i = 0; i < acapt[1].length; i++) {
      captHTML += this.piecehtml(acapt[1][i], "b");
=======
  // player = number of opponent
  returnCapturedHTML(acapt, player) {
    
    let captHTML = "";
    
    if (player == 2){
      for (var i = 0; i < acapt[0].length; i++) {
        captHTML += this.piecehtml(acapt[0][i], "w");
      }
    }else {
      for (var i = 0; i < acapt[1].length; i++) {
        captHTML += this.piecehtml(acapt[1][i], "b");
      }
    }

    if (captHTML) {
      return `<div class="trophies">${captHTML}</div>`;
    } else {
      return "";
>>>>>>> d78b646660d92a43b6b603e94e8e9f5ce5b2f4b0
    }
        
  }

  piecehtml(p, c) {
    return `<img class="captured" alt="${p}" src = "img/pieces/${c}${p.toUpperCase()}.png">`;
  }

  returnGameRulesHTML() {
    return ChessGameRulesTemplate(this.app, this);
  }

  returnSingularGameOption() {
    return ChessSingularGameOptions(this.app, this);
  }

  returnAdvancedOptions() {
    return ChessGameOptions(this.app, this);
  }

  returnShortGameOptionsArray(options) {
    let sgoa = super.returnShortGameOptionsArray(options);
    let ngoa = {};
    for (let i in sgoa) {
      if (!(i == "player1" && sgoa[i] == "random")) {
        ngoa[i] = sgoa[i];
      }
    }
    return ngoa;
  }
}

module.exports = Chessgame;
