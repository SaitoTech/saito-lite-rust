const OnePlayerGameTemplate = require('../../lib/templates/oneplayer-gametemplate');
const SolitrioGameRulesTemplate = require('./lib/solitrio-game-rules.template');
const SolitrioGameOptions = require('./lib/solitrio-game-options');
const htmlTemplate = require('./lib/game-html.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Solitrio extends OnePlayerGameTemplate {
	constructor(app) {
		super(app);

		this.name = 'Solitrio';
		this.slug = 'solitrio';
		this.game_length = 5; //Estimated number of minutes to complete a game
		this.description = 'Once you\'ve started playing Solitrio, how can you go back to old-fashioned Solitaire? This one-player card game is the perfect way to pass a flight from Hong Kong to pretty much anywhere. Arrange the cards on the table from 2-10 ordered by suite. Harder than it looks and wildly addictive.';
		this.categories = 'Games Cardgame One-player';
		this.animationSpeed = 500;
		this.card_img_dir = '/saito/img/arcade/cards';
		this.app = app;
		this.version = '1.1.4';
	}

	returnGameRulesHTML() {
		return SolitrioGameRulesTemplate(this.app, this);
	}


	  hasSettings() {
	    return true;
	  }

	  loadSettings(container = null) {
	    if (!container){
	      this.overlay.show(`<div class="module-settings-overlay"><h2>Solitrio Settings</h2></div>`);
	      container = ".module-settings-overlay";
	    }
	    let as = new SolitrioGameOptions(this.app, this, container);
	    as.render();
	  }


	initializeGame(game_id) {
		console.log('SET WITH GAMEID: ' + game_id);

		if (!this.game.state) {
			console.log('******Generating the Game******');
			this.game.state = this.returnState();
			this.game.queue = [];
			this.game.queue.push('round');
			this.game.queue.push('READY');
		} else {
			this.game.state = Object.assign(
				this.returnState(),
				this.game.state
			);
			if (this.game.state.game_started) {
				this.game.queue = ['play'];
			}
		}

		console.log(JSON.parse(JSON.stringify(this.game.state)));

		if (this.browser_active) {
			$('.slot').css('min-height', $('.card').css('min-height'));
		}
	}

	newRound() {
		//Set up queue
		this.game.queue = [];
		this.game.queue.push('play\t90');
		this.game.queue.push('DEAL\t1\t1\t40');
		this.game.queue.push('SHUFFLE\t1\t1');
		this.game.queue.push('DECK\t1\t' + JSON.stringify(this.returnDeck()));
		this.game.queue.push('clear_board');

		//Reset/Increment State
		this.game.state.recycles_remaining = 2;

		if (this.browser_active) {
			$('#rowbox').removeClass('nomoves');
		}
	}

	async render(app) {
		//console.trace("Initialize HTML");
		if (!this.browser_active || this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());

		await super.render(app);

		/*if (app.browser.isMobileBrowser(navigator.userAgent)) {
			this.app.connection.on('browser-fullscreen-toggle', (value) => {
				if (value) {
					setTimeout(()=> {
					    screen.orientation.lock('landscape')
					    .then(()=> {
					    	console.log("Lock success");
					    }).catch((error) => {
					    	alert(error);
					    });
					}, 25);
				}else{
					screen.orientation.unlock();
				}
			});
		}*/

		//
		// ADD MENU
		//
		this.menu.addMenuOption('game-game', 'Game');

		this.menu.addSubMenuOption('game-game', {
			text: 'Start New Game',
			id: 'game-new',
			class: 'game-new',
			callback: async function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.prependMove('lose');
				await game_mod.clearTable();
				game_mod.endTurn();
			}
		});
		this.menu.addSubMenuOption('game-game', {
			text: 'Settings',
			id: 'game-settings',
			class: 'game-settings',
			callback: function(app, game_mod){
				game_mod.loadSettings();
			}
		});


		this.menu.addSubMenuOption('game-game', {
			text: 'How to Play',
			id: 'game-intro',
			class: 'game-intro',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnGameRulesHTML());
			}
		});

		this.menu.addSubMenuOption('game-game', {
			text: 'Stats',
			id: 'game-stats',
			class: 'game-stats',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.overlay.show(game_mod.returnStatsHTML('Solitrio'));
			}
		});

		this.menu.addChatMenu();
		this.menu.render();

		this.app.connection.on("solitrio-update-settings", ()=> {
			this.attachEventsToBoard();
		});

	}

	returnState() {
		let state = super.returnState();
		state.recycles_remaining = 2;
		state.game_started = 0;

		return state;
	}

	async checkBoardStatus() {
		//Use recycling function to check if in winning state
		this.displayUserInterface();

		let winner = await this.scanBoard(false);
		if (winner) {
			this.prependMove('win');
			this.endTurn();
		} else if (!this.hasAvailableMoves()) {
			if (this.game.state.recycles_remaining == 0) {
				this.prependMove('lose');
				this.overlay.show(this.returnStatsHTML('Game over', 1), async ()=> {
					await this.clearTable();
					this.endTurn();
				});
				$(".stats-menu-controls").html(`<button id="undo" class="option saito-button-primary">Go back</button><button id="quit" class="option saito-button-primary">Start Next Game</button>`);
				this.attachHUDEvents();
				$(".stats-menu-controls .saito-button-primary").on("click", () => { this.overlay.hide(); });

			} else {
				this.shuffleFlash();
				$('#hint').css('display', 'none');
			}
		}
	}

	attachEventsToBoard() {
		let play_mode = this.loadGamePreference('solitrio-play-mode') || 'auto';
		
		if (play_mode == 'auto') {
			this.attachEventsToBoardAutomatic();
		} else {
			this.attachEventsToBoardManual();
		}
	}

	attachEventsToBoardAutomatic() {
		let solitrio_self = this;

		$('.slot').off();
		$('.slot').on('click', function () {
			let card = $(this).attr('id');

			if (solitrio_self.game.board[card][0] === 'E') {
				return;
			}

			solitrio_self.toggleCard(card);
			let slot = solitrio_self.dynamicColoring(card);

			if (slot) {
				//card = selected, slot = card
				solitrio_self.prependMove(`move\t${card}\t${slot}`);

				let x = JSON.stringify(solitrio_self.game.board[card]);
				let y = JSON.stringify(solitrio_self.game.board[slot]);

				solitrio_self.game.board[card] = JSON.parse(y);
				solitrio_self.game.board[slot] = JSON.parse(x);

				solitrio_self.untoggleCard(card);

				//console.log(`Animate ${x}: ${card} -> ${slot}`);
				solitrio_self.moveGameElement(
					solitrio_self.copyGameElement(`#${card} img`),
					`#${slot}`,
					{
						/*resize: 1,*/
						insert: 1,
						callback: () => {
							$('#' + card).addClass('empty');
							$('#' + slot).removeClass('empty');
						}
					},
					() => {

						$('.animated_elem').remove();

						//Redraw whole board
						//for (let i in solitrio_self.game.board) {
						//	let divname = '#' + i;
						//	$(divname).html(solitrio_self.returnCardImageHTML(solitrio_self.game.board[i]));
						//}
						
						/*$('#' + card).html(
							solitrio_self.returnCardImageHTML(
								solitrio_self.game.board[card]
							)
						);
						$('#' + slot).html(
							solitrio_self.returnCardImageHTML(
								solitrio_self.game.board[slot]
							)
						);*/

						solitrio_self.checkBoardStatus();
					}
				);
			} else {
				$(this).toggleClass('misclick');
				solitrio_self.untoggleCard(card);
			}
		});
	}

	attachEventsToBoardManual() {
		let solitrio_self = this;
		let selected = ''; // prev selected

		$('.slot').off();
		$('.slot').on('click', function () {
			let card = $(this).attr('id');

			if (selected === card) {
				//Selecting same card again
				solitrio_self.untoggleCard(card);
				selected = '';
				$('#rowbox').removeClass('selected');
				return;
			} else {
				if (!selected) {
					//New Card
					if (solitrio_self.game.board[card][0] !== 'E') {
						selected = card;
						solitrio_self.toggleCard(card);
						$('#rowbox').addClass('selected');
						solitrio_self.dynamicColoring(selected);
						return;
					}
				} else {
					//Change selection
					if (solitrio_self.game.board[card][0] !== 'E') {
						solitrio_self.untoggleCard(selected);
						solitrio_self.toggleCard(card);
						selected = card;
						solitrio_self.dynamicColoring(selected);
						return;
					}

					// Move card to empty slot if it is legal
					// selected must work in this context
					if (solitrio_self.canCardPlaceInSlot(selected, card)) {
						solitrio_self.prependMove(`move\t${selected}\t${card}`);
						//solitrio_self.endTurn();

						let x = JSON.stringify(
							solitrio_self.game.board[selected]
						);
						let y = JSON.stringify(solitrio_self.game.board[card]);

						solitrio_self.game.board[selected] = JSON.parse(y);
						solitrio_self.game.board[card] = JSON.parse(x);

						solitrio_self.untoggleCard(card);
						solitrio_self.untoggleCard(selected);

						$('#' + selected).html(
							solitrio_self.returnCardImageHTML(
								solitrio_self.game.board[selected]
							)
						);
						$('#' + card).html(
							solitrio_self.returnCardImageHTML(
								solitrio_self.game.board[card]
							)
						);
						$('#' + selected).toggleClass('empty');
						$('#' + card).toggleClass('empty');
						$('#rowbox').removeClass('selected');
						selected = '';

						solitrio_self.checkBoardStatus();

						return;
					} else {
						//SmartTip, slightly redundant with internal logic of canCardPlaceInSlot
						let smartTip;
						let predecessor = solitrio_self.getPredecessor(card);
						if (predecessor) {
							let cardValue =
								parseInt(
									solitrio_self.returnCardNumber(predecessor)
								) + 1;
							if (cardValue < 11)
								smartTip =
									'Hint: Try a ' +
									cardValue +
									' of ' +
									solitrio_self.cardSuitHTML(
										solitrio_self.returnCardSuite(
											predecessor
										)
									);
							else
								smartTip =
									'Unfortunately, no card can go there';
						} else {
							smartTip = 'Hint: Try a 2 of any suit';
						}
						//Feedback
						$(this).toggleClass('misclick');
						solitrio_self.untoggleCard(selected);
						selected = '';
						$('#rowbox').removeClass('selected');
						return;
					}
				}
			}
		});
	}

	shuffleFlash() {
		$('#rowbox').addClass('nomoves');

		$('#shuffle')
			.css('color', '#000')
			.css('background', '#FFF6')
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#FFF')
					.css('background', '#0004')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#000')
					.css('background', '#FFF6')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#FFF')
					.css('background', '#0004')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#000')
					.css('background', '#FFF6')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#FFF')
					.css('background', '#0004')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#000')
					.css('background', '#FFF6')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#FFF')
					.css('background', '#0004')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this)
					.css('color', '#000')
					.css('background', '#FFF6')
					.dequeue();
			})
			.delay(300)
			.queue(function () {
				$(this).removeAttr('style').dequeue();
			});
	}

	dynamicColoring(card) {
		let solitrio_self = this;
		let availableSlot = null;
		$('.valid').removeClass('valid');
		$('.invalid').removeClass('invalid');

		$('.empty').each(function () {
			if (solitrio_self.canCardPlaceInSlot(card, $(this).attr('id'))) {
				availableSlot = $(this).attr('id');
				$(this).addClass('valid');
			} else {
				$(this).addClass('invalid');
			}
		});
		return availableSlot;
	}

	/*
  Card: Previously selected card 
  Slot: empty slot
  Both expressed by position "row[1-4]_slot[1-10]"
  */
	canCardPlaceInSlot(card, slot) {
		let cardValue = this.returnCardNumber(card);
		let cardSuit = this.returnCardSuite(card);

		let predecessor = this.getPredecessor(slot);

		if (predecessor) {
			let predecessorValueNum = parseInt(
				this.returnCardNumber(predecessor)
			);
			let predecessorSuit = this.returnCardSuite(predecessor);
			if (
				cardValue == predecessorValueNum + 1 &&
				cardSuit === predecessorSuit
			)
				return true;
		} else {
			//No predecessor, i.e. first position in row
			if (cardValue === '2') return true;
		}
		return false;
	}

	/*
  Return previous position in row for a given coordinate, false if no predecessor
*/
	getPredecessor(cardPos) {
		let tempArr = cardPos.split('_slot');
		if (tempArr[1] === '1') return false;
		else return tempArr[0] + '_slot' + (tempArr[1] - 1);
	}

	/* scan board to see if any legal moves available*/
	hasAvailableMoves() {
		for (let i = 1; i <= 4; i++) {
			let prevNum = 'none';
			for (let j = 1; j <= 10; j++) {
				let slot = `row${i}_slot${j}`;
				let suite = this.returnCardSuite(slot);
				if (suite === 'E') {
					if (prevNum != '10') return true;
					prevNum = '10'; //Empty slot counts as a 10 because it is "blocking"
				} else prevNum = this.returnCardNumber(slot);
			}
		}
		return false;
	}

	toggleCard(divname) {
		divname = '#' + divname;
		$(divname).css('opacity', '0.75');
	}

	untoggleAll() {
		$('.slot').css('opacity', '1.0');
	}

	untoggleCard(divname) {
		divname = '#' + divname;
		$(divname).css('opacity', '1.0');
	}

	hideCard(divname) {
		divname = '#' + divname;
		$(divname).css('opacity', '0.0');
	}

	async clearTable() {
		$('.option').off();
		$('.slot').off();

		for (let i = 1; i <= 4; i++) {
			for (let j = 1; j <= 10; j++) {
				let divname = `row${i}_slot${j}`;
				this.hideCard(divname);
				await this.timeout(15);
			}
		}
	}

	/* Copy hand into board*/
	handToBoard() {
		let indexCt = 0;
		for (let i = 1; i <= 4; i++)
			for (let j = 1; j <= 10; j++) {
				let position = `row${i}_slot${j}`;
				this.game.board[position] =
					this.game.deck[0].cards[this.game.deck[0].hand[indexCt++]];
			}
	}

	boardToHand() {
		let indexCt = 0;
		for (let position in this.game.board) {
			this.game.deck[0].hand[indexCt++] = this.game.board[position];
		}
	}

	parseIndex(slot) {
		let coords = slot.split('_');
		let x = coords[0].replace('row', '');
		let y = coords[1].replace('slot', '');
		return 10 * (parseInt(x) - 1) + parseInt(y) - 1;
	}

	handleGameLoop(msg = null) {
		this.saveGame(this.game.id);
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			console.log(JSON.stringify(mv));

			if (mv[0] === 'round') {
				this.game.state.game_started = true;
				this.newRound();
			}

			if (mv[0] === 'win') {
				this.game.state.session.round++;
				this.game.state.session.wins++;
				this.overlay.show(this.returnStatsHTML('Congratulations!'), ()=> {
					this.newRound();
					this.game.queue.push(`ROUNDOVER\t${JSON.stringify([this.publicKey])}\troundover\t${JSON.stringify([])}`);
					this.restartQueue();
				});

				$(".stats-menu-controls").html(`<button id="quit" class="option saito-button-primary">Start Next Game</button>`);
				$(".stats-menu-controls .saito-button-primary").on("click", () => { this.overlay.close(); });
				return 0;
			}

			if (mv[0] === 'lose') {
				this.game.state.session.round++;
				this.game.state.session.losses++;
				this.newRound();
				this.game.queue.push(
					`ROUNDOVER\t${JSON.stringify(
						[]
					)}\troundover\t${JSON.stringify([this.publicKey])}`
				);
			}

			if (mv[0] === 'clear_board') {
				this.game.queue.splice(qe, 1);
				for (let i in this.game.board) {
					let divname = '#' + i;
					$(divname).html('');
				}
				//Clear board
				this.game.board = {};
			}

			if (mv[0] === 'play') {
				if (this.browser_active) {
					this.game.queue.splice(qe, 1);
					this.game.queue.push('play\t90');

					let pause = mv[1] ? parseInt(mv[1]) : 0;
					this.displayUserInterface();
					this.handToBoard();
					setTimeout(async () => {
						await this.displayBoard(pause);
						this.attachEventsToBoard();
						this.checkBoardStatus();
					}, 25);
				}
				return 0;
			}

			if (mv[0] === 'shuffle') {
				// We return 0 to pause queue execution because the scanBoard is async
				// and we don't want to use an await

				this.game.queue.splice(qe, 1);
				this.scanBoard(true);
				this.game.state.recycles_remaining--;
				return 0;
			}

			if (mv[0] === 'move') {
				this.game.queue.splice(qe, 1);
				let card = mv[1]; //rowX_slotY
				let emptySlot = mv[2]; //rowX_slotY

				let x = this.parseIndex(card);
				let y = this.parseIndex(emptySlot);

				let temp = this.game.deck[0].hand[x];
				this.game.deck[0].hand[x] = this.game.deck[0].hand[y];
				this.game.deck[0].hand[y] = temp;
			}
		}
		return 1;
	}

	undoMove() {
		let mv = this.moves.shift().split('\t');

		if (mv[0] == 'lose' || mv[1] == 'win') {
			this.undoMove();
			return;
		}

		let card = mv[1];

		let selected = mv[2];

		let x = JSON.stringify(this.game.board[selected]);
		let y = JSON.stringify(this.game.board[card]);

		this.game.board[selected] = JSON.parse(y);
		this.game.board[card] = JSON.parse(x);

		$('#' + selected).html(
			this.returnCardImageHTML(this.game.board[selected])
		);
		$('#' + card).html(this.returnCardImageHTML(this.game.board[card]));
		$('#' + selected).toggleClass('empty');
		$('#' + card).toggleClass('empty');
		$('#rowbox').removeClass('selected');
		this.untoggleAll();
		this.displayUserInterface();
	}

	async displayBoard(timeInterval = 0) {
		if (this.browser_active == 0) {
			return;
		}
		$('.slot').removeClass('empty');
		try {
			//Want to add a timed delay for animated effect

			for (let i in this.game.board) {
				await this.timeout(timeInterval);
				let divname = '#' + i;
				$(divname).html(this.returnCardImageHTML(this.game.board[i]));
				this.untoggleCard(i);
				if (this.game.board[i][0] == 'E') {
					$(divname).addClass('empty');
					$(divname).html(
						`<img src="${this.card_img_dir}/red_back.png" />`
					);
					$(divname)
						.children()
						.fadeOut(10 * timeInterval, function(){
							$(this).addClass("copied_elem");
						});
				}
			}

			//
			// We will provide hints automatically until you win at least twice
			//
			if (this.game.state.lifetime.wins < 1 && timeInterval > 0) {
				this.provideHint();
			}
		} catch (err) {}
	}

	/*
no status atm, but this is to update the hud
*/
	displayUserInterface() {

		let html =
			'<span>Arrange the cards from 2 to 10, one suit per row by moving cards into empty spaces. </span>';
		let option = `<ul><li class="option"`;
		if (this.game.state.recycles_remaining > 0) {
			html += '<span>You may shuffle the unarranged cards ';
			if (this.game.state.recycles_remaining == 2) {
				html += '<strong>two</strong> more times.';
			} else {
				html += '<strong>one</strong> more time.';
			}
			html += '</span>';
			option += ` id="shuffle">Shuffle cards`;
		} else {
			option += ` id="quit">New Game`;
		}
		option += `</li><li class="option" id="hint">Hint`;
		if (this.moves.length > 0) {
			option += `</li><li class="option" id="undo">Undo`;
		}

		option += '</li></ul>';

		this.updateStatusWithOptions(html, option);
		this.attachHUDEvents();
	}

	attachHUDEvents(){
		let solitrio_self = this;

		$('.option').off();
		$('.option').on('click', async function () {
			let action = $(this).attr('id');
			$('#rowbox').removeClass('nomoves');
			if (action == 'shuffle') {
				solitrio_self.updateStatusWithOptions('shuffle cards...');
				solitrio_self.prependMove('shuffle');
				solitrio_self.endTurn();
				return;
			}
			if (action == 'quit') {
				let last_move = solitrio_self.moves.shift();
				if (last_move && (last_move == 'win' || last_move == 'lose')) {
					solitrio_self.prependMove(last_move);
				} else {
					solitrio_self.prependMove(last_move);
					solitrio_self.prependMove('lose');
					await solitrio_self.clearTable();
				}
				solitrio_self.endTurn();
				return;
			}
			if (action == 'undo') {
				solitrio_self.undoMove();
				return;
			}
			if (action == 'hint') {
				solitrio_self.provideHint();
				return;
			}
		});

	}

	returnCardImageHTML(name) {
		if (name[0] == 'E') {
			return '';
		} else {
			return `<img src="${this.card_img_dir}/${name}.png" />`;
		}
	}

	returnDeck() {
		let suits = ['S', 'C', 'H', 'D', 'E'];
		var deck = {};
		/* WTF is with this indexing system??? */
		//2-10 of each suit, with indexing gaps on the 1's
		for (let i = 0; i < 4; i++)
			for (let j = 2; j <= 10; j++) {
				let index = 10 * i + j;
				//deck[index.toString()] = suits[i]+j;
				let name = suits[i] + j;
				deck[name] = name;
			}
		//E[mpty] slots (1-4) into '41'-'44'
		for (let j = 1; j <= 4; j++) {
			let index = 40 + j;
			//deck[index.toString()] = suits[4]+j;
			let name = suits[4] + j;
			deck[name] = name;
		}

		return deck;
	}

	/*
  Combo function to check if in winning board state
  and shuffle cards that are not in winning positions
  */
	async scanBoard(recycle = true) {
		let rows = new Array(4);
		rows.fill(0);

		if (recycle) {
			$('.option').off();
			$('.slot').off();
		}

		let myarray = [];
		/*
      For each row of cards, if a 2 is in the left most position, 
      find the length of the sequential streak of same suit
    */
		for (let i = 0; i < 4; i++) {
			let rowsuite = 'none';

			for (let j = 1; j < 10; j++) {
				//Don't read last slot in each row

				let slot = 'row' + (i + 1) + '_slot' + j;
				let suite = this.returnCardSuite(slot);
				let num = this.returnCardNumber(slot);

				if (j == 1 && num == 2) {
					rowsuite = suite;
				}

				if (rowsuite === suite && num == j + 1) {
					rows[i] = j;
					if (recycle) this.toggleCard(slot);
				} else break;
			}
		}

		//
		// pull off board
		//
		for (let i = 0; i < 4; i++) {
			for (let j = rows[i] + 1; j < 11; j++) {
				let divname = `row${i + 1}_slot${j}`;
				if (recycle) {
					this.hideCard(divname);
					await this.timeout(25);
				}
				myarray.push(this.game.board[divname]);
			}
		}

		let winningGame = myarray.length === 4;

		if (recycle) {
			//shuffle array, best method?
			myarray.sort(() => Math.random() - 0.5);

			//refill board

			for (let i = 0; i < 4; i++) {
				for (let j = rows[i] + 1; j < 11; j++) {
					let divname = `row${i + 1}_slot${j}`;
					this.game.board[divname] = myarray.shift();
				}
			}

			this.boardToHand();
			this.endTurn();
		}
		return winningGame;
	}

	async provideHint() {
		let emptySlots = [];
		for (let i in this.game.board) {
			if (this.game.board[i][0] == 'E') {
				emptySlots.push(i);
			}
		}

		let targets = [];

		for (let slot of emptySlots) {
			let predecessor = this.getPredecessor(slot);
			if (predecessor) {
				let cardValue =
					parseInt(this.returnCardNumber(predecessor)) + 1;
				if (cardValue < 11) {
					targets.push(this.returnCardSuite(predecessor) + cardValue);
				}
			} else {
				targets = targets.concat(['D2', 'H2', 'S2', 'C2']);
			}
		}

		for (let i in this.game.board) {
			if (targets.includes(this.game.board[i])) {
				$(`#${i}`).toggleClass('misclick');
				await this.timeout(150);
			}
		}
	}

	returnCardSuite(slot) {
		let card = this.game.board[slot];
		return card[0];
	}

	cardSuitHTML(suit) {
		switch (suit) {
		case 'D':
			return '&diams;';
		case 'H':
			return '&hearts;';
		case 'S':
			return '&spades;';
		case 'C':
			return '&clubs;';
		default:
			return '';
		}
	}

	returnCardNumber(slot) {
		let card = this.game.board[slot];
		if (card[0] === 'E')
			//empty slot
			return 11;
		return card.substring(1);
	}
}

module.exports = Solitrio;
