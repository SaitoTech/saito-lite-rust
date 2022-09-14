const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require("../../lib/saito/saito");
const ChessGameRulesTemplate = require("./lib/chess-game-rules.template");
const ChessGameOptions = require("./lib/chess-game-options.template");

var this_chess = null;
var chess = null;
var chessboard = null;

class Chessgame extends GameTemplate {

  constructor(app) {

    super(app);

    this.name = "Chess";
    this.description = "Chess is a two-player strategy board game played on a checkered board with 64 squares arranged in an 8×8 grid."
    this.board = null;
    this.engine = null;
    this_chess = this;
    this.publickey = app.wallet.returnPublicKey();

    this.minPlayers = 2;
    this.maxPlayers = 2;

    this.description = "An implementation of Chess for the Saito Blockchain";
    this.categories  = "Games Boardgame Classic";
    
    this.player_roles = ["Observer", "White", "Black"];
    this.app = app;
    return this;

  }


  initializeHTML(app) {

    if (!this.browser_active) { return; }
    super.initializeHTML(app);

    this.confirm_moves = this.loadGamePreference("chess_expert_mode"); 
    if (this.confirm_moves == null || this.confirm_moves == undefined){
      this.confirm_moves = 1;
      console.log("Default to move confirmations");
    }


    //
    // ADD MENU
    //
    this.menu.addMenuOption({
      text: "Game",
      id: "game-game",
      class: "game-game",
      callback: function (app, game_mod) {
        game_mod.menu.showSubMenu("game-game");
      },
    });
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
          game_mod.saveGamePreference('chess_expert_mode', 1);
          setTimeout(function() { window.location.reload(); }, 1000);
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
          game_mod.saveGamePreference('chess_expert_mode', 0);
          setTimeout(function() { window.location.reload(); }, 1000);
        }else{
          game_mod.menu.hideSubMenus();
        }
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Rules",
      id: "game-rules",
      class: "game-rules",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.overlay.show(app, game_mod, game_mod.returnGameRulesHTML());
        console.log("Button Press: Rules");
        console.log(game_mod.returnGameRulesHTML());
      },
    });
    this.menu.addSubMenuOption("game-game", {
      text: "Log",
      id: "game-log",
      class: "game-log",
      callback: function (app, game_mod) {
        console.log("Button Press: Log");
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      },
    });

    if (app.modules.returnModule("RedSquare")) {
    this.menu.addSubMenuOption("game-game", {
      text : "Screenshot",
      id : "game-post",
      class : "game-post",
      callback : async function(app, game_mod) {
        let log = document.querySelector(".log");
        let log_lock = document.querySelector(".log_lock");
        if (!log_lock && log) { log.style.display = "none"; }
        await app.browser.captureScreenshot(function(image) {
          if (!log_lock && log) { log.style.display = "block"; }
          let m = game_mod.app.modules.returnModule("RedSquare");
          if (m) { m.tweetImage(image); }
        });
      },
    });
    }


    this.menu.addSubMenuOption("game-game", {
      text: "Exit",
      id: "game-exit",
      class: "game-exit",
      callback: function (app, game_mod) {
        window.location.href = "/arcade";
      },
    });
    this.menu.addMenuIcon({
      text: '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id: "game-menu-fullscreen",
      callback: function (app, game_mod) {
        game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      },
    });

    this.menu.addChatMenu(app, this);
    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.restoreLog();
    this.log.render(app, this);
    this.log.attachEvents(app, this);

    if (!this.confirm_moves){
      let confirm_btn = document.getElementById("buttons");
      if (confirm_btn){
        confirm_btn.style.display = "none";
      }
    }
  }

  switchColors(){
    // observer skips
    if (this.game.player === 0 || !this.game.players.includes(this.app.wallet.returnPublicKey())) { 
          return 1;
      } 

      //Game engine automatically randomizes player order, so we are good to go
      if (!this.game.options.player1 || this.game.options.player1 == "random"){
        return 1;
      }
      
      //Reordeer the players so that originator can be the correct role
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

  async initializeGame(game_id) {

    console.log('######################################################');
    console.log('######################################################');
    console.log('######################         #######################');
    console.log('######################  CHESS  #######################');
    console.log('######################         #######################');
    console.log('######################################################');
    console.log('######################################################');
    console.log(game_id);

    //
    // There is no initializing in Chess -- finish initializing
    //
    if (this.game.initializing == 1) {
      this.game.queue.push("READY");
      //Check colors
      this.switchColors();
    }


    if (!this.browser_active){
      return;
    }

    chess = require('./lib/chess.js');
    chessboard = require('./lib/chessboard');
    this.board = new chessboard('board', { pieceTheme: 'img/pieces/{piece}.png' });
    this.engine = new chess.Chess();

    if (this.game.position != undefined) {
      this.engine.load(this.game.position);
    } else {
      this.game.position = this.engine.fen();
    }

    this.updateStatusMessage("White moves first");
    if (this.game.target == this.game.player) {
      this.setBoard(this.engine.fen());
      if (this.useClock) { this.startClock(); }
    } else {
      this.lockBoard(this.engine.fen());
    }

    //Plug Opponent Information into the Controls 
    if (this.game.player){
      var opponent = this.game.opponents[0];

      if (this.app.crypto.isPublicKey(opponent)) {
        if (this.app.keys.returnIdentifierByPublicKey(opponent).length >= 6) {
          opponent = this.app.keys.returnIdentifierByPublicKey(opponent);
        }
        else {
          try {
            // opponent = await this.app.keys.fetchIdentifierPromise(opponent);
          }
          catch (err) {
            console.log(err);
          }
        }
      }

      let opponent_elem = document.getElementById('opponent_id');
      if (opponent_elem) {
        opponent_elem.innerHTML = sanitize(opponent);
        opponent_elem.setAttribute('data-add', opponent)
      }

      let identicon = "";

      name = this.game.players[0];
      name = this.app.keys.returnUsername(opponent);
      identicon = this.app.keys.returnIdenticon(name);
      
      if (name != "") {
        if (name.indexOf("@") > 0) {
          name = name.substring(0, name.indexOf("@"));
        }
      }

      let html = identicon ? `<img class="player-identicon" src="${identicon}">` : "";
      document.getElementById("opponent_identicon").innerHTML = html;

    }else{
      //Hide some controls in Observer Mode
      $(".hide_in_observer").remove();
    }

    this.updateStatusMessage();
    this.attachGameEvents();


  }

  ////////////////
  // handleGame //
  ////////////////
  handleGameLoop(msg={}) {

    console.log("QUEUE IN CHESS: " + JSON.stringify(this.game.queue));
    console.log(JSON.stringify(msg));


    msg = {};
    if (this.game.queue.length > 0) {
      //if (this.game.queue[this.game.queue.length-1] == "OBSERVER_CHECKPOINT") {
      //  return;
      //}

      msg.extra = JSON.parse(this.app.crypto.base64ToString(this.game.queue[this.game.queue.length-1]));
    } else {
      msg.extra = {};
    }
    this.game.queue.splice(this.game.queue.length-1, 1);


    if (msg.extra == undefined) {
      console.log("NO MESSAGE DEFINED!");
      return;
    }
    if (msg.extra.data == undefined) {
      console.log("NO MESSAGE RECEIVED!");
      return;
    }

    //
    // the message we get from the other player
    // tells us the new board state, so we
    // update our own information and save the
    // game
    //
    let data = JSON.parse(msg.extra.data);
    this.game.position = data.position;
    this.game.target = msg.extra.target;

    if (this.browser_active == 1) {
      
      this.updateLog(data.move);

      if (msg.extra.target == this.game.player) {
        this.setBoard(this.game.position);
        if (this.useClock) { this.startClock(); }
        if (this.engine.in_checkmate() === true) {
          this.game.over = 1;
          this.resignGame(this.game.id, "checkmate");
          this.lockBoard(this.game.position);
          return 0;
        }else if (this.engine.in_draw() === true) {
          this.tieGame(this.game.id, "draw");
          return 0;
        }
      } else {
        this.lockBoard(this.game.position);
      }
    }
    this.updateStatusMessage();

    //if (this.game.player == 0) {
    //  this.game.queue.push("OBSERVER_CHECKPOINT");
    //  return 1;
    //}

    this.saveGame(this.game.id);
    return 0;

  }

  removeEvents(){
    this.lockBoard(this.game.position);
  }

  endTurn(data) {

    let extra = {};

    extra.target = this.returnNextPlayer(this.game.player);
    extra.data = JSON.stringify(data);

    let data_to_send = this.app.crypto.stringToBase64(JSON.stringify(extra));
    this.game.turn = [data_to_send];
    this.moves = [];
    this.sendMessage("game", extra);

  }

  attachGameEvents() {
    if (this.game?.player == 0 || !this.browser_active){
      return;
    }

    let resign_icon = document.getElementById('resign_icon');
    let move_accept = document.getElementById('move_accept');
    let move_reject = document.getElementById('move_reject');
    let copy_btn = document.getElementById('copy-btn');
    if (!move_accept) return;



    if (resign_icon) {
      resign_icon.onclick = async () => {
        let c = await sconfirm("Do you really want to resign?");
        if (c) {
          this.grace_window = 0;
        	this.resignGame(this.game.id, "resignation");
          this.lockBoard(this.game.position);
        	//window.location.href = '/arcade';
        	return;
        }
      }
    }

    if (copy_btn){
      copy_btn.onclick = () => {
            let public_key = document.getElementById('opponent_id').getAttribute('data-add');

            navigator.clipboard.writeText(public_key).then(function(x) {
              copy_btn.classList.add("copy-check");
            });
             copy_btn.classList.add("copy-check");

            setTimeout(() => {
              copy_btn.classList.remove("copy-check");            
            }, 400);
          
      }
    }
    if (move_accept){
      move_accept.onclick = () => {
        console.log('send move transaction and wait for reply.');

        var data = {};
        data.white = this.game.white;
        data.black = this.game.black;
        data.id = this.game.id;
        data.position = this.engine.fen();
        data.move = this.game.move;
        this.endTurn(data);

        move_accept.disabled = true;
        move_reject.disabled = true;
      };
    }

    if (move_reject){
      move_reject.onclick = () => {
        this.setBoard(this.game.position);

        move_accept.disabled = true;
        move_reject.disabled = true;
      };
    }
    window.onresize = () => this.board.resize();

  }

  updateStatusMessage(str = "") {

    if (this.browser_active != 1) { return; }

    let statusEl = document.getElementById('status');

    //
    // print message if provided
    //
    if (str != "") {
      statusEl.innerHTML = sanitize(str);
      return;
    }

    //Otherwise build up default status messaging...

    var status = '';

    var moveColor = 'White';
    let bgColor = '#fff';
    if (this.engine.turn() === 'b') {
      moveColor = 'Black';
      bgColor = '#111';
    }


    document.getElementById('turn-shape').style.backgroundColor = bgColor;

    // check?
    if (this.engine.in_check() === true) {
      status = moveColor + ' is in check';
    }else{
      if (this.player_roles[this.game.player] == moveColor){
        status = "It's your move, " + moveColor;
      }else{
        status = "Waiting for " + moveColor;
      }
    }
    
    document.getElementById('buttons').style.display = "none";

    statusEl.innerHTML = sanitize(status);
    document.getElementById('captured').innerHTML = sanitize(this.returnCapturedHTML(this.returnCaptured(this.engine.fen())));

    //console.log(this.game.position);
    //console.log(this.engine.fen());
    //console.log(this.returnCaptured(this.engine.fen()));
    //console.log(this.returnCapturedHTML(this.returnCaptured(this.engine.fen())));
    
  };

  setBoard(position) {

    this.game.moveStartPosition = position;

    if (this.board != undefined) {
      if (this.board.destroy != undefined) {
        this.board.destroy();
      }
    }

    let cfg = {
      draggable: true,
      position: position,
      // pieceTheme: 'chess/pieces/{piece}.png',
      pieceTheme: 'img/pieces/{piece}.png',
      onDragStart: this.onDragStart,
      onDrop: this.onDrop,
      onMouseoutSquare: this.onMouseoutSquare,
      onMouseoverSquare: this.onMouseoverSquare,
      onSnapEnd: this.onSnapEnd,
      onMoveEnd: this.onMoveEnd,
      onChange: this.onChange
    };

    if (this.browser_active == 1) {
      this.board = new chessboard('board', cfg);
    }
    this.engine.load(position);

    if (this.game.player == 2 && this.browser_active == 1) {
      this.board.orientation('black');
    }

  }

  lockBoard(position) {

    if (this.board != undefined) {
      if (this.board.destroy != undefined) {
        this.board.destroy();
      }
    }

    let cfg = {
      pieceTheme: 'img/pieces/{piece}.png',
      moveSpeed: 0,
      position: position
    }

    this.board = new chessboard('board', cfg);
    this.engine.load(position);

    if (this.game.player == 2) {
      this.board.orientation('black');
    }

  }

  //////////////////
  // Board Config //
  //////////////////
  onDragStart(source, piece, position, orientation) {

    if (this_chess.engine.game_over() === true ||
      (this_chess.engine.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (this_chess.engine.turn() === 'b' && piece.search(/^w/) !== -1)) {
      return false;
    }
  };

  onDrop(source, target, piece, newPos, oldPos, orientation, topromote) {

    this_chess.removeGreySquares();

    this_chess.game.move = this_chess.engine.fen().split(" ").slice(-1)[0] + " " + this_chess.colours(this_chess.engine.fen().split(" ")[1]) + ": ";

    //was a pawn moved to the last rank
    if ((source.charAt(1) == 7 && target.charAt(1) == 8 && piece == 'wP')
        || (source.charAt(1) == 2 && target.charAt(1) == 1 && piece == 'bP')) {
      // check with user on desired piece to promote.
      this_chess.checkPromotion(source, target, piece.charAt(0));
    } else {
      // see if the move is legal
      var move = this_chess.engine.move({
        from: source,
        to: target,
        promotion: 'q' // NOTE: always promote to a queen for example simplicity
      });
      // illegal move
      if (move === null) return 'snapback';
      // legal move - make it

      this_chess.game.move += this_chess.pieces(move.piece) + " ";

      this_chess.game.move += " - " + move.san;
    }
  }

  promoteAfterDrop(source, target, piece) {
    var move = this_chess.engine.move({
      from: source,
      to: target,
      promotion: piece
    });

    //document.getElementById('promotion').style.display = "none";

    this_chess.updateStatusMessage("Confirm Move to Send!");

    // legal move - make it
    this_chess.game.move += `${this_chess.pieces(move.piece)} - ${move.san}`;
    this_chess.updateStatusMessage('Pawn promoted to ' + this_chess.pieces(piece) + '.');

    if (this_chess.confirm_moves == 0){
      var data = {};
      data.white = this.game.white;
      data.black = this.game.black;
      data.id = this.game.id;
      data.position = this.engine.fen();
      data.move = this.game.move;
      this.endTurn(data);
    }else{
      document.getElementById('buttons').style.display = "flex";
    }

  };

  checkPromotion(source, target, color) {
    let promotion = document.getElementById('promotion');
    let promotion_choices = document.getElementById('promotion-choices');
    //let buttons = document.getElementById('buttons');
    //buttons.style.display = "none";

    let html = ['q', 'r', 'b', 'n'].map(n => this.piecehtml(n, color)).join('');
    promotion_choices.innerHTML = html;
    promotion_choices.childNodes.forEach(node => {
      node.onclick = () => {
        promotion.style.display = "none";
        //buttons.style.display = "flex";
        this_chess.promoteAfterDrop(source, target, node.alt);
      }
    });
    this.updateStatusMessage('Choose promotion piece');
    promotion.style.display = "block";
  }

  onMouseoverSquare(square, piece) {

    // get list of possible moves for this square
    var moves = this_chess.engine.moves({
      square: square,
      verbose: true
    });

    // exit if there are no moves available for this square
    if (moves.length === 0) { return; }

    // highlight the square they moused over
    this_chess.greySquare(square);

    // highlight the possible squares for this piece
    for (var i = 0; i < moves.length; i++) {
      this_chess.greySquare(moves[i].to);
    }
  };

  onMouseoutSquare(square, piece) {
    this_chess.removeGreySquares();
  };

  onSnapEnd() {
    this_chess.board.position(this_chess.engine.fen());
  };

  removeGreySquares() {
    let grey_squares = document.querySelectorAll('#board .square-55d63');
    Array.from(grey_squares).forEach(square => square.style.background = '');
  };

  greySquare(square) {

    var squareEl = document.querySelector(`#board .square-${square}`);

    var background = '#c5e8a2';
    if (squareEl.classList.contains('black-3c85d') === true) {
      background = '#769656';
    }

    squareEl.style.background = background;

  };

  onChange(oldPos, newPos) {

    this_chess.lockBoard(this_chess.engine.fen(newPos));

    if (this_chess.confirm_moves){
      document.getElementById('buttons').style.display = "flex";
      let move_accept = document.getElementById('move_accept');
      let move_reject = document.getElementById('move_reject');

      move_accept.disabled = false;
      move_reject.disabled = false;
    }else{
      var data = {};
      data.white = this_chess.game.white;
      data.black = this_chess.game.black;
      data.id = this_chess.game.id;
      data.position = this_chess.engine.fen();
      data.move = this_chess.game.move;
      this_chess.endTurn(data);
    }
    
  };

  colours(x) {

    switch (x) {
      case "w": return ("White");
      case "b": return ("Black");
    }

    return;

  }

  pieces(x) {

    switch (x) {
      case "p": return ("Pawn");
      case "r": return ("Rook");
      case "n": return ("Knight");
      case "b": return ("Bishop");
      case "q": return ("Queen");
      case "k": return ("King");
    }

    return;

  }

  returnCaptured(afen) {
    afen = afen.split(" ")[0];
    let WH = ["Q", "R", "R", "B", "B", "N", "N", "P", "P", "P", "P", "P", "P", "P", "P"];
    let BL = ["q", "r", "r", "b", "b", "n", "n", "p", "p", "p", "p", "p", "p", "p", "p"];
    for (var i = 0; i < afen.length; i++) {
      if (WH.indexOf(afen[i]) >= 0) {
        WH.splice(WH.indexOf(afen[i]), 1);
      }
      if (BL.indexOf(afen[i]) >= 0) {
        BL.splice(BL.indexOf(afen[i]), 1);
      }
    }
    return [WH, BL];
  }

  returnCapturedHTML(acapt) {
    let captHTML = "";
    for (var i = 0; i < acapt[0].length; i++) {
      captHTML += this.piecehtml(acapt[0][i], "w");
    }
    captHTML += "<br />";
    for (var i = 0; i < acapt[1].length; i++) {
      captHTML += this.piecehtml(acapt[1][i], "b");
    }
    return captHTML;
  }

  piecehtml(p, c) {
    return `<img class="captured" alt="${p}" src = "img/pieces/${c}${p.toUpperCase()}.png">`;
  }

  returnGameRulesHTML(){
    return ChessGameRulesTemplate(this.app, this);
  }

  returnSingularGameOption(){
    return ChessGameOptions(this.app, this);
  }

  returnGameOptionsHTML() {

    let html = `<h1 class="overlay-title">Chess Options</h1>`;
      
    html   +=  `<div class="overlay-input">   
                  <label for="player1">Pick Your Color:</label>
                  <select name="player1">
                    <option value="random" default>Random</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                  </select>
                </div>`;

    /*html   +=  `<div class="overlay-input">
                  <label for="observer_mode">Observer Mode:</label>
                  <select name="observer">
                    <option value="enable" >enable</option>
                    <option value="disable" selected>disable</option>
                  </select>
                </div>`;*/
      
    html += this.returnCryptoOptionsHTML();

    return html;

  }


  returnShortGameOptionsArray(options) {
    let sgoa = super.returnShortGameOptionsArray(options);
    let ngoa = {};
    for (let i in sgoa) {
      if (!(i == "player1" && sgoa[i] == "random")){
        ngoa[i] = sgoa[i];
      }
    }
    return ngoa;
  }
}

module.exports = Chessgame;


