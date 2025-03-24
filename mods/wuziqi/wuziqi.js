const { timingSafeEqual } = require('crypto'); //Wtf is this???
const saito = require('../../lib/saito/saito');
const GameTemplate = require('../../lib/templates/gametemplate');
const WuziqiGameRulesTemplate = require('./lib/wuziqi-game-rules.template');
const WuziqiGameOptionsTemplate = require('./lib/wuziqi-game-options.template');
const WuziqiSingularGameOptionsTemplate = require('./lib/wuziqi-singular-game-options.template');
const htmlTemplate = require('./lib/game-html.template');

class Wuziqi extends GameTemplate {
	constructor(app) {
		super(app);

		// Define static game parameters and add global variables.

		this.name = 'Wuziqi';
		this.slug = 'wuziqi';
		this.game_length = 10; //Estimated number of minutes to complete a game
		this.description =
			'Take turns placing black or white tiles on a Go board of various sizes to make a line of five in a row to win the round. Also known as 五子棋, Gokomu, or Gobang.';
		this.categories = 'Games Boardgame Classic';

		this.minPlayers = 2;
		this.maxPlayers = 2;

		this.moves = [];
		this.bestof = 1;

		this.social.creator = "Richard M Parris";
		this.title = '五子棋 - Five-in-a-Row';

		this.hud.is_draggable = 0;

		this.can_play_async = 1;
		this.insert_rankings = true;

		this.clock.container = "#clock_";
		this.roles = ['observer', 'black', 'white'];
		this.acknowledge_text = 'next round...'; // not "i understand..."

		return this;
	}

	async render(app) {
		if (!this.browser_active) {
			return;
		}
		if (this.initialize_game_run) {
			return 0;
		}

		await this.injectGameHTML(htmlTemplate());

		// Don't completly Override the game template render function
		await super.render(app);

		this.menu.addMenuOption('game-game', 'Game');

		this.menu.addSubMenuOption('game-game', {
			text: 'How to Play',
			id: 'game-intro',
			class: 'game-intro',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnGameRulesHTML());
			}
		});

		// Add Chat Features to Menu
		this.menu.addChatMenu(this.roles.slice(1));

		// Render menu and attach events
		this.menu.render();

		if (this.game.player > 0) {
			this.hud.render();
			let hh = document.querySelector('.hud-header');
			if (hh) {
				hh.classList.add(this.roles[this.game.player]);
			}

			document
				.querySelector('.main')
				.classList.add(this.roles[this.game.player]);
		}

		this.racetrack.win = Math.ceil(this.game.options.best_of / 2);
		this.racetrack.title = 'Best of ' + this.game.options.best_of;
		this.racetrack.icon = `<i class="fa-solid fa-trophy"></i>`;
		this.racetrack.players = [];
		for (let i = 0; i < this.game.players.length; i++) {
			let player = {
				name: this.app.keychain.returnUsername(this.game.players[i])/*this.roles[i + 1].toUpperCase()*/,
				score: this.game.score[i],
				color: this.roles[i + 1]
			};
			this.racetrack.players.push(player);
		}
		this.racetrack.render();

		this.playerbox.render();

		for (let i = 1; i <= this.game.players.length; i++) {
			this.playerbox.updateIcons(
				`<div class="tool-item item-detail turn-shape ${this.roles[
					i
				].toLowerCase()}"></div>`,
				i
			);

			this.playerbox.updateBody(`<div class="player_clock" id="clock_${i}"></div>`, i);
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

		// Temporary fallback experiment -- if successful move to gametemplate
		if (this.game.turn.length){
			this.sendGameMoveTransaction('game', {target: this.returnNextPlayer()});
		}


	}

	//html for game intro/rules
	returnGameRulesHTML() {
		return WuziqiGameRulesTemplate(this.app, this);
	}

	initializeGame(game_id) {
		if (this.game.initializing) {
			console.log('Initialize WuZiQi');
			// Initialize our game
			this.game.score = [0, 0];

			// Set the game board to the size set in the options
			this.game.size = this.game.options.board_size;
			this.generateBoard(this.game.options.board_size);

			// Send 'let's get started' message.
			this.game.queue.push('clearboard\t1');
			this.game.queue.push('READY');
		}
	}

	// Create the game board data structure
	generateBoard(x) {
		//console.log("Generate board for " + x);
		// Set the board size (always a square of side length set by the user.)
		var cells = x * x;
		// Clear the board
		this.game.board = [];
		// Itterate through the cells in the board
		for (let n = 1; n <= cells; n++) {
			// Create an empty cell
			let cell = {};
			// Add the id
			cell.id = n;
			// The cell is blank.
			cell.owner = 'none';
			// The cell does not have a winning tile in it.
			cell.winner = false;

			/* Sets are the rows, columns and diagonals to which the cell belongs.
               Each row, col, and diag has a unique index, so that adjacent sells share
               a value in one of the four set categories
            */
			cell.sets = {};
			// Set the row as the total divided by the side length rounded up.
			cell.sets.row = Math.ceil(n / x);
			// Set the collumn as the cell id mod side length.
			cell.sets.col = ((n - 1) % x) + 1;
			// Set the left down diagonal as where inverse of the column summed with row is constant
			cell.sets.lddiag = x - cell.sets.col + cell.sets.row;
			// Set the right and up diagonal to where the sum of the row and collumn
			cell.sets.rudiag = cell.sets.row + cell.sets.col - 1;
			this.game.board.push(cell);
		}
		//console.log(this.game.board);
	}

	// UI Score Update
	/* Though unnecessary to loop through two players, it is important to remember that players are numbered (1, 2, 3), 
        but data structures for player properties are typically 0-indexed arrays
    */
	updateScore() {
		if (!this.gameBrowserActive()){
			return;
		}

		let roundsToWin = Math.ceil(this.game.options.best_of / 2);
		for (let i = 0; i < this.game.players.length; i++) {
			let scoreHTML = `<div>Score: </div><div class="tokens">`;
			for (let j = 0; j < this.game.score[i]; j++) {
				scoreHTML += `<img class="piece" src="img/${
					this.roles[i + 1]
				}piece.png">`;
			}
			for (let j = 0; j < roundsToWin - this.game.score[i]; j++) {
				scoreHTML += `<img class="piece opaque30" src="img/${
					this.roles[i + 1]
				}piece.png">`;
			}
			scoreHTML += '</div>';
		}
	}

	updateStatus(str) {
		if (this.lock_interface == 1) {
			return;
		}

		this.game.status = str;

		if (this.gameBrowserActive()) {
			let status_obj = document.querySelector('.status');
			if (status_obj) {
				status_obj.innerHTML = str;
			}
		}
	}

	animatePlay(cell) {
		//$(`div#tile_${cell.id} div`).removeClass("empty").addClass("piece").addClass(cell.owner).fadeIn();
		$(`div#tile_${cell.id} div`).remove();
		$(`<div class="piece ${cell.owner}"></div>`)
			.hide()
			.appendTo(`#tile_${cell.id}`)
			.fadeIn(600);
	}

	// Iterate through the board object to draw each cell in the DOM
	drawBoard(board) {
		if (!this.gameBrowserActive()){
			console.log("Opt out of drawing board");
			return;
		}

		console.log("DRAWING BOARD!");
		//console.log(board);
		boardElement = document.querySelector('.board');
		// Clear the board
		boardElement.innerHTML = '';
		// Add the CSS grid-template-columns value to the correct number of rows.
		//Because variable board size, easier than hardcoding size classes in CSS
		boardElement.style.gridTemplate = `repeat(${this.game.size}, 1fr) / repeat(${this.game.size}, 1fr)`; //'repeat(' + this.game.size + ', 1fr)';

		// Draw the cells
		let ct = 1;
		board.forEach((cell) => {
			let tile = document.createElement('div');
			tile.id = 'tile_' + cell.id;
			if (cell.winner) tile.classList.add('winner');
			if (ct <= this.game.size) tile.classList.add('top');
			if (ct > this.game.size * (this.game.size - 1))
				tile.classList.add('bottom');
			if (ct % this.game.size == 1) tile.classList.add('left');
			if (ct % this.game.size == 0) tile.classList.add('right');
			if (cell.owner != 'none') {
				let el = document.createElement('div');
				el.classList.add('piece');
				el.classList.add(cell.owner);
				tile.append(el);
			} else {
				let el = document.createElement('div');
				el.classList.add('empty');
				tile.append(el);
			}
			boardElement.append(tile);
			ct++;
		});
	}

	// Add click events to the board
	// This is the functional function of Wuziqi
	addEvents(board) {
		this.setPlayerActive();

		if (!this.gameBrowserActive()){
			return;
		}

		board.forEach((cell) => {
			el = document.getElementById('tile_' + cell.id);
			// Only add click function to blank cells,
			if (cell.owner == 'none') {
				// Add CSS indications that the cell can be clicked.
				el.classList.add('active');

				// When the cell is clicked
				el.addEventListener('click', (e) => {
					// Set it's owner to the clicker.
					cell.owner = this.roles[this.game.player];
					// Check for round winner.
					let winner = this.findWinner(cell);

					this.drawBoard(this.game.board);

					// Do the Saito Game Queue stuff

					// No matter what, add a 'place' message (filo - thi will be executed first) to update the board for both players.
					// Set the message type, the board state, cell played, player.
					let mv =
						'place\t' +
						this.serializeBoard(board) +
						'\t' +
						cell.id +
						'\t' +
						this.game.player;
					// Add this move to the stack
					this.addMove(mv);

					// And send on chain.
					this.endTurn();
				});
			}
		});
	}

	removeEvents() {
		this.drawBoard(this.game.board);
		this.playerbox.setInactive();
	}

	onTimeOver(){
		this.removeEvents();
		this.moves = [`roundover\t${3-this.game.player}`];
		this.endTurn();
	}

	//
	// Core Game Logic
	//
	async handleGameLoop(msg = null) {
		// The Game Loop hands us back moves from the end of the stack (the reverse order they were added)
		let cell;

		this.drawBoard(this.game.board);
		
		// Check we have a queue
		if (this.game.queue.length > 0) {

			// Save before we start executing the game queue
			// this.saveGame(this.game.id);

			// Get the last move and split it on tabs.
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			// Game over conditions
			if (mv[0] === 'gameover') {
				// Remove this item from the queue.
				this.game.queue = [];
				this.stopClock();
				await this.sendGameOverTransaction(
					this.game.players[parseInt(mv[1]) - 1],
					`best of ${this.game.options.best_of}`
				);
				return 0; //end queue cycling
			}

			if (mv[0] === 'clearboard') {
				let first_player = parseInt(mv[1]);
				this.generateBoard(this.game.options.board_size);
				this.drawBoard(this.game.board);
				// Remove this item from the queue.
				this.game.queue.splice(this.game.queue.length - 1, 1);

				this.game.target = first_player;
				console.log("Update target: ", this.game.target);

				this.playerbox.setActive(first_player);

				if (this.useClock == 1) {
					this.game.time.last_received = new Date().getTime();
					for (let i = 0; i < this.game.clock.length; i++){
						this.game.clock[i].spent = 0;
						this.clock.displayTime(this.game.clock[i].limit - this.game.clock[i].spent, i+1);
					}
				}

				if (this.game.player == first_player) {
					this.addEvents(this.game.board);
					this.updateStatus('You go first');
				} else {
					this.startClock();
					this.updateStatus(
						`Waiting for <span class="playertitle">${this.roles[first_player]} (${this.app.keychain.returnUsername(this.game.players[first_player - 1])})</span> to start`
					);
				}
				return 0;
			}

			if (mv[0] == 'draw') {
				let player = parseInt(mv[1]);
				// Initiate next round.
				// Add a continue button if player did not play the winning token, just draw the board (and remove events if they did not);
				if (player != this.game.player && this.game.player > 0) {
					this.addContinueButton(`It's a draw -- no winner.`);
				} else {
					this.updateStatus(
						`Draw! <span class="playertitle">${
							this.roles[3 - player]
						}</span> (${this.app.keychain.returnUsername(this.game.players[2-player])}) will start`
					);
				}
				// Remove this item from the queue.
				this.game.queue.splice(this.game.queue.length - 1, 1);
				return 1;
			}

			// Round over
			if (mv[0] == 'roundover') {
				let winner = parseInt(mv[1]);

				this.game.target = this.returnNextPlayer(winner);

				if (!this.gameBrowserActive() && this.game.player === this.game.target){
					this.updateStatus("You lost the round");
					this.setPlayerActive();
					return 0;
				}

				// Remove this item from the queue.
				this.game.queue.splice(this.game.queue.length - 1, 1);

				// Update my scores
				this.game.score[winner - 1]++;
				this.racetrack.advancePlayer(winner);
				this.racetrack.lock();

				// If this round win, wins the game - let the winner know.
				if (
					2 * this.game.score[winner - 1] >
					this.game.options.best_of
				) {
					this.game.winner = winner;

					// Add a game over message to the stack.
					this.game.queue.push('gameover\t' + winner);
					return 1;
				} else {
					this.stopClock();
					// Initiate next round.
					// Add a continue button if player did not play the winning token, just draw the board (and remove events if they did not);
					if (winner != this.game.player) {
						this.addContinueButton('You lost!');
					} else {
						this.updateStatus(
							`You win the round! <span class="playertitle">${
								this.roles[3 - winner]
							}</span> (${this.app.keychain.returnUsername(this.game.players[2-winner])}) will start`
						);
						this.drawBoard(this.game.board);
					}
				}

				return 0;
			}
			if (mv[0] == 'place') {
				let player = parseInt(mv[3]);

				// Regenerate the game board object from the serialized version sent by the other player.
				// Even though the player who just placed has an accurate board, we rerun it in case of browser refresh

				this.boardFromString(mv[1]);
				// Grab the played cell
				cell = this.returnCellById(parseInt(mv[2]));

				// And check if it won the game (this will just update winners in data structure)
				let winner = this.findWinner(cell);

				if (this.game.player !== player) {
					this.animatePlay(cell);
				}

				// If we have a winner
				if (winner != 'no winner') {
					// If not only add a 'round over' message to the stack.
					this.game.queue = ['roundover\t' + player];
					return 1;
				}

				//If board full
				if (!this.canPlayTile()) {
					this.game.queue = ['draw\t' + player];
					return 1;
				}

				this.game.target = this.returnNextPlayer(player);

				this.playerbox.setActive(this.game.target);

				// Remove this item from the queue.
				this.game.queue.splice(this.game.queue.length - 1, 1);

			}
		}

		if (this.game.player == this.game.target) {
			//Let player make their move
			this.addEvents(this.game.board);

			console.log("GBA: ", this.gameBrowserActive());
			console.log("cell: ", cell);

			if (this.gameBrowserActive() && cell){
				this.updateStatus(`Your move <span class="replay">Replay Last</span>`);
				document.querySelector('.replay').onclick = (e) => {
					this.animatePlay(cell);
				};
			}else{
				this.updateStatus("Your move");
			}
		} else {

			this.startClock();
			this.updateStatus(
				`Waiting on <span class='playertitle'>${this.roles[3 - this.game.player]}</span> (${this.app.keychain.returnUsername(this.game.players[2-this.game.player])})` 
			);
		}

		return 0;
	}

	// Add button to continue the game
	addContinueButton(notice) {
		if (this.game.player == 0) {
			return;
		}

		let game_self = this;
		this.playerAcknowledgeNotice(notice, function () {
			game_self.addMove('clearboard\t' + game_self.game.player);
			game_self.endTurn();
		});
	}

	// Check if a player won the round
	findWinner(cell) {
		let win;
		let winner = 'no winner';
		// Iterate through the row, column and diagonals for the played cell
		for (const [key, value] of Object.entries(cell.sets)) {
			// Test each to check if there are five cells in a row with the same colour tile.
			let testset = this.returnCellsInLine(key, value);
			win = 0; //reset to 0 when switch directions, just in case there is a possibility that we accidentally count a bent line
			// Only check if there are at least 5 cells in the line (diagonals can be short)
			if (testset.length > 4) {
				testset.forEach((item) => {
					if (item.owner == cell.owner) {
						win = win + 1;
						if (win > 4) {
							this.showWin(key, value, cell);
							winner = cell.owner;
						}
					} else {
						win = 0;
					}
				});
			}
		}
		return winner;
	}

	// Modify property winner of cells in the winning set so that CSS can be updated
	showWin(key, value, cell) {
		let set = this.returnCellsInLine(key, value);
		this.markWinners(set, cell);
		//must run through both ways to mark the whole winning set
		set.reverse();
		this.markWinners(set, cell);
	}

	/*Skim through the line and start marking winning cells when we reach the given cell
    and as long as the following cells have the same owner */
	markWinners(set, cell) {
		let draw = false;
		set.forEach((el) => {
			if (el.id == cell.id) {
				draw = true;
			}
			if (draw) {
				if (el.owner == cell.owner) {
					el.winner = true;
				} else {
					draw = false;
				}
			}
		});
	}

	/* Return cells that belong to a particular axis (horizontal, vertical, or diagonal)
        type = {row, col, lddiag, rudiag}
    */
	returnCellsInLine(type, value) {
		var cells = [];
		this.game.board.forEach((cell) => {
			if (cell.sets[type] == value) {
				cells.push(cell);
			}
		});
		return cells;
	}

	returnCellById(id) {
		var cell = {};
		this.game.board.forEach((item) => {
			if (item.id == id) {
				cell = item;
			}
		});
		return cell;
	}

	canPlayTile() {
		for (let item of this.game.board) {
			if (item.owner == 'none') {
				return true;
			}
		}
		return false;
	}

	/*
    The following four function compress/decompress the board state into a string so that
    players can transmit it with their move, a completely unnecessary action, since each player places a single 
    tile at a time, it is enough to infer the new boardstate from the player's number and the cell id.
    */

	// Return the board as a series of letters B, W, N
	// For Black, White, No owner.
	serializeBoard(board) {
		boardString = '';
		board.forEach((cell) => {
			boardString += this.shortOwner(cell.owner);
		});
		return boardString;
	}

	// Return a game board object from a serialised string.
	boardFromString(boardString) {
		this.generateBoard(Math.sqrt(boardString.length));
		this.game.board.forEach((cell, idx) => {
			cell.owner = this.longOwner(boardString[idx]);
		});
	}

	// Translators between B - black etc.
	shortOwner(s) {
		switch (s) {
		case 'black':
			return 'B';
			break;
		case 'white':
			return 'W';
			break;
		default:
			return 'N';
			break;
		}
	}

	longOwner(s) {
		switch (s) {
		case 'B':
			return 'black';
			break;
		case 'W':
			return 'white';
			break;
		default:
			return 'none';
			break;
		}
	}

	returnSingularGameOption() {
		return WuziqiSingularGameOptionsTemplate(this.app, this);
	}
	// Add options to the game start wizard for different game parameters
	returnAdvancedOptions() {
		return WuziqiGameOptionsTemplate(this.app, this);
	}
}

module.exports = Wuziqi;
