const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require("../../lib/saito/saito");


var this_chess = null;
var chess = null;
var chessboard = null;

class Chessgame extends GameTemplate {

  constructor(app) {

    super(app);

    this.name = "Chess";
    this.gamename = "Chess";
    this.description = "Chess is a two-player strategy board game played on a checkered board with 64 squares arranged in an 8×8 grid."
    this.board = null;
    this.engine = null;
    this_chess = this;
    this.publickey = app.wallet.returnPublicKey();

    this.useClock = 0;
    this.log_length = 999;
    this.minPlayers = 2;
    this.maxPlayers = 2;
    this.type       = "Classic Boardgame";
    this.description = "An implementation of Chess for the Saito Blockchain";
    this.categories  = "Boardgame Game";

    return this;

  }

  //
  // manually announce arcade banner support
  //
  respondTo(type) {

    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }

    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/chess/img/arcade/arcade-banner-background.png";
      obj.title = "Chess";
      return obj;
    }
    return null;

  }

  initializeHTML(app) {

    if (!this.browser_active) { return; }
    super.initializeHTML(app);

    this.app.modules.respondTo("chat-manager").forEach(mod => {
      mod.respondTo('chat-manager').render(this_chess.app, this_chess);
    });

        //
    // ADD CHAT
    //
    this.app.modules.respondTo("chat-manager").forEach((mod) => {
      mod.respondTo("chat-manager").render(app, this);
      mod.respondTo("chat-manager").attachEvents(app, this);
    });

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
  }

  async initializeGame(game_id) {

    console.log('######################################################');
    console.log('######################################################');
    console.log('######################         #######################');
    console.log('######################  CHESS  #######################');
    console.log('######################         #######################');
    console.log('######################################################');
    console.log('######################################################');

    if (this.browser_active == 1) {

console.log("A");
      chess = require('./lib/chess.js');
console.log("B");
      chessboard = require('./lib/chessboard');
console.log("C");

      this.board = new chessboard('board', { pieceTheme: 'img/pieces/{piece}.png' });
console.log("D");
      this.engine = new chess.Chess();
console.log("E");
    }

    //
    // load this.game object
    //
    this.loadGame(game_id);

    //
    // finish initializing
    //
    if (this.game.initializing == 1) {
      this.game.queue.push("READY");
    }


    if (this.browser_active == 1) {
      if (this.game.position != undefined) {
        this.engine.load(this.game.position);
      } else {
        this.game.position = this.engine.fen();
      }

      if (this.game.target == this.game.player) {
        this.setBoard(this.engine.fen());
	if (this.useClock) { this.startClock(); }
      } else {
        this.lockBoard(this.engine.fen());
      }

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
      if (opponent_elem) opponent_elem.innerHTML = sanitize(opponent);

      this.updateStatusMessage();
      this.attachEvents();

    }

  }

  ////////////////
  // handleGame //
  ////////////////
  handleGameLoop(msg={}) {

console.log("QUEUE IN CHESS: " + JSON.stringify(this.game.queue));
console.log(JSON.stringify(msg));
//alert("LOOP");

    if (this.game.queue[this.game.queue.length-1] == "OBSERVER_CHECKPOINT") {
      return;
    }

    msg = {};
    if (this.game.queue.length > 0) {
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


    if (msg.extra.target == this.game.player) {
      if (this.browser_active == 1) {
        this.setBoard(this.game.position);
        if (this.useClock) { this.startClock(); }
        this.updateLog(data.move);
        this.updateStatusMessage();
        if (this.engine.in_checkmate() === true) {
          this.resignGame();
        }
      }
    } else {
      if (this.browser_active == 1) {
        this.lockBoard(this.game.position);
      }
    }



    if (this.game.player == 0) {
      this.game.queue.push("OBSERVER_CHECKPOINT");
      return 1;
    }

    this.saveGame(this.game.id);
    return 0;

  }

  endTurn(data) {

    let extra = {};

    extra.target = this.returnNextPlayer(this.game.player);
    extra.data = JSON.stringify(data);

    let data_to_send = this.app.crypto.stringToBase64(JSON.stringify(extra));
    this.game.turn = [data_to_send];
    this.moves = [];
    this.sendMessage("game", extra);
    this.updateLog(data.move);
    this.updateStatusMessage();

  }

  attachEvents() {

    let chat_icon = document.getElementById('chat_icon');
    let resign_icon = document.getElementById('resign_icon');
    let move_accept = document.getElementById('move_accept');
    let move_reject = document.getElementById('move_reject');
    if (!move_accept) return;

    let chatmod = this.app.modules.returnModule("Chat");
    if (!chatmod) { chat_icon.style.display = "none"; }


    resign_icon.onclick = () => {
      let c = confirm("Do you really want to resign?");
      if (c) {
	this.resignGame(this.game.id);
	alert("You have resigned the game...");
	window.location.href = '/arcade';
	return;
      }
    }

    if (chatmod) {
    chat_icon.onclick = () => {
      if (chatmod) {
	chatmod.openChatBox();
	return;
      }
    }
    }


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
      move_accept.classList.remove('green');

      move_reject.disabled = true;
      move_reject.classList.remove('red');
    };

    move_reject.onclick = () => {
      this.setBoard(this.game.position);

      move_accept.disabled = true;
      move_accept.classList.remove('green');

      move_reject.disabled = true;
      move_reject.classList.remove('red');
    }

    window.onresize = () => this.board.resize();

    this.app.modules.respondTo('chat-manager').forEach(mod => {
      mod.respondTo('chat-manager').attachEvents(this_chess.app, this_chess);
    })
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

    var status = '';
;
    var moveColor = 'White';
    if (this.engine.turn() === 'b') {
      moveColor = 'Black';
    }

    // checkmate?
    if (this.engine.in_checkmate() === true) {
      status = 'Game over, ' + moveColor + ' is in checkmate.';
      this.game.over = 1;
      if (this.game.player == 1 && moveColor === 'Black') { this.game.winner = 1; }
      if (this.game.player == 2 && moveColor === 'White') { this.game.winner = 1; }
    }

    // draw?
    else if (this.engine.in_draw() === true) {
      status = 'Game over, drawn position';
      this.game.over = 1;
    }

    // game still on
    else {

      status = moveColor + ' to move';

      // check?
      if (this.engine.in_check() === true) {
        status += ', ' + moveColor + ' is in check';
      }

    }

    statusEl.innerHTML = sanitize(status);
    console.log(this.game.position);
    console.log(this.engine.fen());
    console.log(this.returnCaptured(this.engine.fen()));
    console.log(this.returnCapturedHTML(this.returnCaptured(this.engine.fen())));
    document.getElementById('captured').innerHTML = sanitize(this.returnCapturedHTML(this.returnCaptured(this.engine.fen())));
    // test - no blank update
    //this.updateLog();

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

    document.getElementById('promotion').style.display = "none";
    document.getElementById('buttons').style.display = "grid";

    this_chess.updateStatusMessage("Confirm Move to Send!");

    // legal move - make it
    this_chess.game.move += `${this_chess.pieces(move.piece)} - ${move.san}`;
    this_chess.updateStatusMessage('Pawn promoted to ' + this_chess.pieces(piece) + '.');

  };

  checkPromotion(source, target, color) {
    let promotion = document.getElementById('promotion');
    let promotion_choices = document.getElementById('promotion-choices');
    let buttons = document.getElementById('buttons');
    buttons.style.display = "none";

    let html = ['q', 'r', 'b', 'n'].map(n => this.piecehtml(n, color)).join('');
    promotion_choices.innerHTML = html;
    promotion_choices.childNodes.forEach(node => {
      node.onclick = () => {
        promotion.style.display = "none";
        buttons.style.display = "grid";
        this_chess.promoteAfterDrop(source, target, node.alt);
      }
    });
    this.updateStatusMessage('Chose promotion piece');
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

    var background = '#a9a9a9';
    if (squareEl.classList.contains('black-3c85d') === true) {
      background = '#696969';
    }

    squareEl.style.background = background;

  };

  onChange(oldPos, newPos) {

    this_chess.lockBoard(this_chess.engine.fen(newPos));
    let move_accept = document.getElementById('move_accept');
    let move_reject = document.getElementById('move_reject');

    move_accept.disabled = false;
    move_accept.classList.add('green');

    move_reject.disabled = false;
    move_reject.classList.add('red');

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
    let html = `<div class="rules-overlay">
    <h1>Chess</h1>
    <p>Players attempt to box in the other player's king by sequentially moving pieces on the board. Each piece moves according to various rules (see below). When pieces move into a square occupied by an enemy piece, the enemy is captured. Except for the knight, pieces cannot pass through other pieces.</p>
    <h3>Pieces</h3>
    <ul><li>King: can move one space in any direction. Keep him safe!</li>
    <li>Queen: can move any number of spaces in any direction.</li>
    <li>Bishop: can move diagonally any number of spaces.</li>
    <li>Castle (Rook): can move vertically or horizontally any number of spaces.</li>
    <li>Knight (Horse): moves a 2+1 L shape. The knight is the only piece that can jump over other pieces.</li>
    <li>Pawn: moves forward one space. Move forward diagonally to attack an enemy piece. Can move forward 2 spaces on the first move. If a pawn reaches the back row, it can be exchanged for one of the other pieces.</li>
    </ul>
    <h3>Winning</h3>
    <p>If one of your pieces threatens the opponent's king (i.e. if your piece could move onto the king on the next turn), then the other player is said to be in a state of "CHECK" and must either move the king or another piece in order to get out of check. If a player has no legitimate move to get out of CHECK, then the game ends with CHECK MATE.</p>
    <h3>Special Moves</h3>
    <p><em>Castling.</em> If a player has never moved the king or castle (rook) piece and the spaces between them are empty, then the player may perform a castle. The king moves to the knight's starting position and the rook moves to the bishop's starting position.</p>
    <p><em>En passant.</em> If a player moves a pawn forward by two spaces into a position adjacent to an enemy pawn, then the enemy pawn may capture said pawn as if it had only moved forward one space.</p> 
    </div>
    `;
    return html;
  }

  returnGameOptionsHTML() {


    let html = `
      <h1 class="overlay-title">Chess Options</h1>
      <div class="overlay-input">   
      <label for="color">Pick Your Color:</label>
      <select name="color">
        <option value="black" default>Black</option>
        <option value="white">White</option>
      </select>
      </div>`;

      /*`<div class="overlay-input">
      <label for="clock">Time Limit:</label>
      <select name="clock">
        <option value="0" default>no limit</option>
        <option value="2">2 minutes</option>
        <option value="10">10 minutes</option>
        <option value="30">30 minutes</option>
        <option value="60">60 minutes</option>
        <option value="90">90 minutes</option>
      </select>
      </div>`*/

      html += `<div class="overlay-input">
      <label for="observer_mode">Observer Mode:</label>
      <select name="observer">
        <option value="enable" selected>enable</option>
        <option value="disable">disable</option>
      </select>
      </div>
    
      <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>

        
    `;

    return html;

  }
}

module.exports = Chessgame;


