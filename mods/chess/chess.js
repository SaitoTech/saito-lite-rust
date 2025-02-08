const GameTemplate = require('../../lib/templates/gametemplate');
const saito = require('../../lib/saito/saito');
const ChessGameRulesTemplate = require('./lib/chess-game-rules.template');
const ChessGameOptions = require('./lib/chess-game-options.template');
const ChessSingularGameOptions = require('./lib/chess-singular-game-options.template');
const chess = require('./lib/chess.js');
const chessboard = require('./lib/chessboard');
const htmlTemplate = require('./lib/game-html.template');

//const SaitoUser = require("../../lib/saito/ui/saito-user/saito-user");

var this_chess = null;

class Chessgame extends GameTemplate {
	constructor(app) {
		super(app);

		this.name = 'Chess';
		this.slug = 'chess';
		this.board = null;
		this.engine = new chess.Chess();
		this_chess = this;
		this.icon = 'fa-sharp fa-solid fa-chess';

		this.minPlayers = 2;
		this.maxPlayers = 2;


		this.title = "Saito Chess";
		
		this.styles.push("/chess/chessboard.css");

		this.description = '"Minutes to learn, a lifetime to master" <br><br> Chess is the king of games and original application on the Saito Network. ';
		this.categories = 'Games Boardgame Classic';

		this.confirm_moves = 1;

		this.can_play_async = 1;

		this.insert_rankings = true;

		this.clock.container = "#clock_";
		
		this.roles = ['observer', 'white', 'black'];
		this.app = app;
	}

	async render(app) {
		if (!this.browser_active) {
			return;
		}
		if (this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());
		document.documentElement.setAttribute('data-theme', 'dark');

		//this.sizer.render();
		//this.sizer.attachEvents('#board');
		//this.app.browser.makeDraggable('#board');


		await super.render(app);

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');

		if (this.game.player > 0) {
			if (!this.game?.draw_offered) {
				this.menu.addSubMenuOption('game-game', {
					text: 'Offer Draw',
					id: 'game-draw',
					class: 'game-draw',
					callback: async function (app, game_mod) {
						let c = await sconfirm(
							'Offer to end the game in a draw?'
						);
						if (c) {
							game_mod.game.draw_offered = -1; //Offer already sent
							var data = { draw: 'offer' };
							game_mod.endTurn(data);
							return;
						}
					}
				});
			}

			if (this.game.player == this.game?.draw_offered) {
				this.menu.addSubMenuOption('game-game', {
					text: 'Accept Draw',
					id: 'game-draw',
					class: 'game-draw',
					callback: async function (app, game_mod) {
						let c = await sconfirm(
							'Accept offer to end the game in a draw?'
						);
						if (c) {
							game_mod.game.draw_offered = -1; //Offer already sent
							var data = { draw: 'accept' };
							game_mod.endTurn(data);
							return;
						}
					}
				});
			}

			this.menu.addSubMenuOption('game-game', {
				text: 'Resign',
				id: 'game-resign',
				class: 'game-resign',
				callback: async function (app, game_mod) {
					let c = await sconfirm('Do you really want to resign?');
					if (c) {
						game_mod.game.turn = [`resignation\t${game_mod.game.player}`];
						game_mod.sendGameMoveTransaction("game", {});
						//await game_mod.sendStopGameTransaction('resignation');
						return;
					}
				}
			});
		}

		this.menu.addSubMenuOption('game-game', {
			text: 'How to Play',
			id: 'game-rules',
			class: 'game-rules',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnGameRulesHTML());
			}
		});

		this.menu.addChatMenu();
		this.menu.render();

		this.log.render();

		this.playerbox.render();
		//Opt in to playerbox holding video call boxes
		this.playerbox.hostVideo();

		for (let i = 1; i <= 2; i++) {
			
			this.playerbox.updateIcons(
				`<div class="tool-item item-detail turn-shape ${this.roles[
					i
				].toLowerCase()}"></div>`,
				i
			);

			let newhtml = "";
			if (this.game.player == i){
				newhtml += `<div></div>`;
			}else{
				newhtml += `<div class="last_move" id="last_${i}"></div>`;;
			}

			if (this.useClock){
				newhtml += `<div class="player_clock" id="clock_${i}"></div>`;
			}
			newhtml += `<div class="trophies" id="trophies_${i}"></div>`;
			if (this.game.player == i){
				newhtml += `<div class="status" id="status"></div>`;
			}
			this.playerbox.updateBody(newhtml, i);

		}

		if (this.game.player == 1) {
			$('.game-playerbox-manager').addClass('reverse');
		}

		if (this.useClock == 1) {
			this.clock.render();
			for (let i = 0; i < this.game.clock.length; i++){
				this.clock.displayTime(this.game.clock[i].limit - this.game.clock[i].spent, i+1);
			}
		}

		this.playerbox.setActive(this.game.target);	

		window.onresize = () => this.board.resize();
	}

	async initializeGame(game_id) {
		console.log('######################         #######################');
		console.log('##### INITIALIZE #####  CHESS  #######################');
		console.log('######################         #######################');

		//
		// There is no initializing in Chess -- finish initializing
		//
		if (this.game.initializing == 1) {
			this.engine.reset();
			this.game.queue.push('READY');
			//Check colors
			this.switchColors();
		}

		console.log(this.game?.position);

		if (this.game.position != undefined) {
			this.engine.load(this.game.position);
		} else {
			this.game.position = this.engine.fen();
		}

		if (!this.game.state){
			this.game.state = { last: "" };
		}

		console.log(this.game.position, this.game.state);

		if (!this.gameBrowserActive()) {
			console.log("nope out");
			return;
		}

		if (this.loadGamePreference('chess_expert_mode')) {
			this.confirm_moves = 0;
		}

		if (!this.board){
			this.board = new chessboard('board', {
				pieceTheme: '/chess/img/pieces/{piece}.png'
			});
			
		}

		if (this.game.over) {
			this.lockBoard(this.game.position);
		} else {
			this.setBoard(this.game.position);
		}

		//
		//game.target is initialized to 1, which is white (switched above if "player 1" wanted to be black)
		//
		console.log("Target/Player", this.game.target, this.game.player);
		if (this.game.target == this.game.player) {
			this.setPlayerActive();
		}
		this.updatePlayers();

		// If we have a fast-ish timed game turn off move confirmations initially
		if (this.useClock && parseInt(this.game.options.clock) < 15) {
			this.confirm_moves = 0;
		}

		this.game.draw_offered = this.game.draw_offered || 0;
		//this.attachGameEvents();
	}

	////////////////
	// handleGame //
	////////////////
	async handleGameLoop() {

		console.log("######## HANDLE GAME LOOP CHESS ###########");
		console.log('QUEUE IN CHESS: ' + JSON.stringify(this.game.queue));

		let msg = {};
		if (this.game.queue.length > 0) {
			let mv = this.game.queue.pop();

			if (mv == "checkmate"){
				var winnerColor = this.engine.turn() === 'b' ? 'white' : 'black';
				let winner = this.roles.indexOf(winnerColor);
				this.sendGameOverTransaction(this.game.players[winner-1], "checkmate");
				return 0;
			}

			if (mv.includes("resignation")){
				let cmd = mv.split("\t");
				let loser = cmd.pop();
				let winner = 2-loser;
				this.sendGameOverTransaction(this.game.players[winner], "resignation");
				return 0;
			}

			msg.extra = JSON.parse(this.app.crypto.base64ToString(mv));
		} else {
			msg.extra = {};
			this.startClock();
			return;
		}
		


		if (this.game?.position) {
			console.log(this.game.position);
			this.engine.load(this.game.position);

			if (this.engine.in_check()){
				this.playerbox.setInactive();
				this.playerbox.addClass("in_check", this.game.target);
			}
		}


		if (msg.extra == undefined) {
			console.log('NO MESSAGE DEFINED!');
			return;
		}
		if (msg.extra.data == undefined) {
			console.log('NO MESSAGE RECEIVED!');
			return;
		}

		//
		// the message we get from the other player
		// tells us the new board state, so we
		// update our own information and save the
		// game
		//
		let data = JSON.parse(msg.extra.data);

		if (data.draw) {
			if (data.draw === 'accept') {
				console.log('Ending game');
				this.sendGameOverTransaction(this.game.players, 'draw');
				return;
			} else {
				//(data.draw == "offer")
				this.game.draw_offered = msg.extra.target; //I am receving offer
				if (this.game.player === msg.extra.target) {
					/*this.updateStatusMessage(
						'Opponent offers a draw; ' + this.game.status
					);*/
				}
				this.initialize_game_run = 0;
				this.render(this.app);
				this.initialize_game_run = 1;
			}
			//Refresh events
			//this.attachGameEvents();

			//Process independently of game moves
			//i.e. don't disrupt turn system
			return;
		}

		//if (this.game.draw_offered !== 0){
		//  this.game.draw_offered = 0; //No offer on table
		//this.attachGameEvents();
		//}

		this.game.last_position = this.game.position;
		this.game.position = data.position;
		this.updateLog(data.move);
		this.game.target = msg.extra.target;

		this.updateBoard(data.position);
		this.updatePlayers(msg.extra.target, data.move.substring(data.move.indexOf(':') + 2));

		//Check for draw according to game engine
		if (this.engine.in_draw() === true) {
			this.sendGameOverTransaction(this.game.players, 'draw');
			return 0;
		}

		if (this.engine.in_check()){
			this.playerbox.setInactive();
			this.playerbox.addClass("in_check", this.game.target);
		}else{
			this.playerbox.setActive(this.game.target);	
			$(".in_check").removeClass("in_check");
		}
		
		if (msg.extra.target == this.game.player) {
			this.setPlayerActive();
		}else{
			//I announce that I am in checkmate to end the game
			if (this.engine.in_checkmate() === true) {
				this.game.turn = ["checkmate"];

				this.sendGameMoveTransaction("game", {});

				//this.sendStopGameTransaction('checkmate');
				return 0;
			}else{
				this.startClock();
			}

		}

		this.saveGame(this.game.id);

		return 0;
	}

	switchColors() {
		// observer skips
		if (
			this.game.player === 0 ||
			!this.game.players.includes(this.publicKey)
		) {
			return 1;
		}

		//Game engine automatically randomizes player order, so we are good to go
		if (
			!this.game.options.player1 ||
			this.game.options.player1 == 'random'
		) {
			return 1;
		}

		// re-order the players so that originator can be the correct role
		if (this.game.options.player1 === 'white') {
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
			if (this.game.players[i] === this.publicKey) {
				this.game.player = i + 1;
			}
		}
	}

	removeEvents() {
		this.lockBoard(this.game.position);

		if (this.game.over) {
			this.playerbox.setInactive();
			let cont = document.getElementById('commands-cont');
			if (cont) {
				cont.style.display = 'none';
			}
		}
	}

	endTurn(data) {
		let extra = {};

		extra.target = this.returnNextPlayer(this.game.player);
		extra.data = JSON.stringify(data);

		let data_to_send = this.app.crypto.stringToBase64(
			JSON.stringify(extra)
		);
		this.game.turn = [data_to_send];
		this.moves = [];
		this.sendGameMoveTransaction('game', extra);
	}


	updatePlayers(target = this.game.target, move = this.game.state.last) {
		if (this.game.player == 0 || !this.gameBrowserActive()) {
			return;
		}

		for (let i = 1; i < 3; i++){
			let captured = this.returnCapturedHTML(this.returnCaptured(this.engine.fen()), i);
			if (document.querySelector(`#trophies_${i}`)){
				document.querySelector(`#trophies_${i}`).innerHTML = captured;
			}
		}
		
		this.game.state.last = move;
		if (target == this.game.player) {
			if (document.querySelector(".last_move")){
				document.querySelector(".last_move").innerHTML = this.game.state.last;
			}
		}

		if (document.querySelector('.last_move')) {
			document.querySelector('.last_move').onclick = () => {
				if (this.game.last_position) {
					this.setBoard(this.game.last_position);
					this.updateBoard(this.game.position);
				}
			};
		}
	}

	updateBoard(position) {
		this.engine.load(position);

		if (this.gameBrowserActive()) { 
			this.board.position(position, true);
		}
	}

	setBoard(position) {
		console.log('SETTING BOARD');

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
			pieceTheme: '/chess/img/pieces/{piece}.png',
			onDragStart: this.onDragStart,
			onDrop: this.onDrop,
			onMouseoutSquare: this.onMouseoutSquare,
			onMouseoverSquare: this.onMouseoverSquare,
			onChange: this.onChange,
			moveSpeed: 400
		};

		if (this.gameBrowserActive()) {
			this.board = new chessboard('board', cfg);

			if (this.game.player == 2) {
				this.board.orientation('black');
			}
		}
	}

	lockBoard(position) {
		console.log('LOCKING BOARD');

		if (this.board != undefined) {
			if (this.board.destroy != undefined) {
				this.board.destroy();
			}
		}

		let cfg = {
			pieceTheme: '/chess/img/pieces/{piece}.png',
			moveSpeed: 0,
			position: position
		};

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
		if (this_chess.game.target !== this_chess.game.player) {
			return false;
		}
		if (
			this_chess.engine.game_over() === true ||
			this_chess.game.over ||
			(this_chess.engine.turn() === 'w' && piece.search(/^b/) !== -1) ||
			(this_chess.engine.turn() === 'b' && piece.search(/^w/) !== -1)
		) {
			return false;
		}
	}

	onDrop(source, target, piece, newPos, oldPos, orientation, topromote) {
		this_chess.removeGreySquares();

		this_chess.game.move =
			this_chess.engine.fen().split(' ').slice(-1)[0] +
			' ' +
			this_chess.colours(this_chess.engine.fen().split(' ')[1]) +
			': ';

		this_chess.slot = target;

		//was a pawn moved to the last rank
		if (
			(source.charAt(1) == 7 && target.charAt(1) == 8 && piece == 'wP') ||
			(source.charAt(1) == 2 && target.charAt(1) == 1 && piece == 'bP')
		) {
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

			this_chess.game.move += this_chess.pieces(move.piece) + ' ';

			this_chess.game.move += ' - ' + move.san;

			this_chess.confirmPlacement(() => {
				var data = {};
				data.position = this_chess.engine.fen();
				data.move = this_chess.game.move;
				this_chess.endTurn(data);
			});
		}
	}

	promoteAfterDrop(source, target, piece) {
		var move = this_chess.engine.move({
			from: source,
			to: target,
			promotion: piece
		});

		// legal move - make it
		this_chess.game.move += `${this_chess.pieces(move.piece)} - ${move.san
			}`;

		var data = {};
		data.position = this.engine.fen();
		data.move = this.game.move;
		this.endTurn(data);
		this.updateLog('Pawn promoted to ' + this_chess.pieces(piece) + '.');
	}

	checkPromotion(source, target, color) {
		let html = ['q', 'r', 'b', 'n']
			.map(
				(n) =>
					`<div class="action piece" id="${n}">${this.piecehtml(
						n,
						color
					)}</div>`
			)
			.join('');

		html = `<div class="popup-confirm-menu promotion-choices">
              <div class="popup-prompt">Promote to:</div>
              ${html}
              <div class="action" id="cancel"> ✘ cancel</div>
              </div>`;

		let left = $(`#board`).offset().left;
		let top = $(`#board`).offset().top;

		if (this.slot) {
			left =
				$(`.square-${this.slot}`).offset().left +
				$(`.square-${this.slot}`).width();
			if (left + 100 > window.innerWidth) {
				left = $(`.square-${this.slot}`).offset().left - 150;
			}
			top = $(`.square-${this.slot}`).offset().top;
		}

		$('.popup-confirm-menu').remove();
		$('body').append(html);

		$('.popup-confirm-menu').css({
			position: 'absolute',
			top: top,
			left: left
		});
		if ($('.popup-confirm-menu').height() + top > window.innerHeight) {
			$('.popup-confirm-menu').css(
				'top',
				window.innerHeight - $('.popup-confirm-menu').height()
			);
		}

		$('.action').off();
		$('.action').on('click', function () {
			let confirmation = $(this).attr('id');

			$('.action').off();
			$('.popup-confirm-menu').remove();
			if (confirmation == 'cancel') {
				this_chess.setBoard(this_chess.game.position);
			} else {
				this_chess.promoteAfterDrop(source, target, confirmation);
			}
		});
	}

	onMouseoverSquare(square, piece) {
		// get list of possible moves for this square
		var moves = this_chess.engine.moves({
			square: square,
			verbose: true
		});

		// exit if there are no moves available for this square
		if (moves.length === 0) {
			return;
		}

		// highlight the square they moused over
		this_chess.greySquare(square);

		// highlight the possible squares for this piece
		for (var i = 0; i < moves.length; i++) {
			this_chess.greySquare(moves[i].to);
		}
	}

	onMouseoutSquare(square, piece) {
		this_chess.removeGreySquares();
	}

	removeGreySquares() {
		let grey_squares = document.querySelectorAll('#board .square-55d63');
		Array.from(grey_squares).forEach(
			(square) => (square.style.background = '')
		);
	}

	greySquare(square) {
		var squareEl = document.querySelector(`#board .square-${square}`);

		var background = '#c5e8a2';
		if (squareEl.classList.contains('black-3c85d') === true) {
			background = '#769656';
		}

		squareEl.style.background = background;
	}

	onChange(oldPos, newPos) {
		if (this_chess.game.target !== this_chess.game.player) {
			//This gets called when I update my board for my opponents move
			//Don't want to accidentally trigger a Send Move
			return;
		}

	}

	confirmPlacement(callback) {
		if (this.confirm_moves == 0) {
			callback();
			return;
		}

		let html = `
          <div class="popup-confirm-menu">
            <div class="popup-prompt">Are you sure?</div>
            <div class="action" id="confirm"><div>✔</div><div>yes</div></div>
            <div class="action" id="cancel"><div>✘</div><div>cancel</div></div>
            <div class="confirm_check"><input type="checkbox" name="dontshowme" value="true"/> don't ask </div>
          </div>`;

		let left = $(`#board`).offset().left;
		let top = $(`#board`).offset().top;

		if (this.slot) {
			left =
				$(`.square-${this.slot}`).offset().left +
				1.5 * $(`.square-${this.slot}`).width();
			if (left + 100 > window.innerWidth) {
				left = $(`.square-${this.slot}`).offset().left - 150;
			}
			top = $(`.square-${this.slot}`).offset().top;
		}

		$('.popup-confirm-menu').remove();
		$('body').append(html);

		$('.popup-confirm-menu').css({
			position: 'absolute',
			top: top,
			left: left
		});
		if ($('.popup-confirm-menu').height() + top > window.innerHeight) {
			$('.popup-confirm-menu').css(
				'top',
				window.innerHeight - $('.popup-confirm-menu').height()
			);
		}

		$('.action').off();
		$('.action').on('click', function () {
			let confirmation = $(this).attr('id');

			$('.action').off();
			$('.popup-confirm-menu').remove();
			if (confirmation == 'confirm') {
				callback();
			} else {
				this_chess.setBoard(this_chess.game.position);
			}
		});

		$('input:checkbox').change(function () {
			if ($(this).is(':checked')) {
				this_chess.confirm_moves = 0;
				this_chess.saveGamePreference('chess_expert_mode', 1);
			} else {
				this_chess.confirm_moves = 1;
			}
		});
	}

	colours(x) {
		switch (x) {
			case 'w':
				return 'white';
			case 'b':
				return 'black';
		}

		return;
	}

	pieces(x) {
		switch (x) {
			case 'p':
				return 'Pawn';
			case 'r':
				return 'Rook';
			case 'n':
				return 'Knight';
			case 'b':
				return 'Bishop';
			case 'q':
				return 'Queen';
			case 'k':
				return 'King';
		}

		return;
	}

	returnCaptured(afen) {
		afen = afen.split(' ')[0];
		let WH = [
			'Q',
			'R',
			'R',
			'B',
			'B',
			'N',
			'N',
			'P',
			'P',
			'P',
			'P',
			'P',
			'P',
			'P',
			'P'
		];
		let BL = [
			'q',
			'r',
			'r',
			'b',
			'b',
			'n',
			'n',
			'p',
			'p',
			'p',
			'p',
			'p',
			'p',
			'p',
			'p'
		];
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

	// player = number of opponent
	returnCapturedHTML(acapt, player) {
		let captHTML = '';

		if (player == 2) {
			for (var i = 0; i < acapt[0].length; i++) {
				captHTML += this.piecehtml(acapt[0][i], 'w');
			}
		} else {
			for (var i = 0; i < acapt[1].length; i++) {
				captHTML += this.piecehtml(acapt[1][i], 'b');
			}
		}

		return captHTML;
	}

	piecehtml(p, c) {
		return `<img class="captured" alt="${p}" src = "/chess/img/pieces/${c}${p.toUpperCase()}.png">`;
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
			if (!(i == 'player1' && sgoa[i] == 'random')) {
				ngoa[i] = sgoa[i];
			}
		}
		return ngoa;
	}

}

module.exports = Chessgame;
