const OnePlayerGameTemplate = require('../../lib/templates/oneplayer-gametemplate');
const MahjongGameRulesTemplate = require('./lib/mahjong-game-rules.template');
const htmlTemplate = require('./lib/game-html.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Mahjong extends OnePlayerGameTemplate {
	constructor(app) {
		super(app);
		this.app = app;

		this.name = 'Mahjong';
		this.slug = 'mahjong';
		this.gamename = 'Mahjong';
		this.game_length = 10; //Estimated number of minutes to complete a game
		this.description = `3D solitary puzzle game with mahjong tiles, also known as Taipei. Match tiles to remove them from the board, clear the board to receive a lucky fortune`;
		this.categories = 'Games Cardgame One-player';
		this.publisher_message =
			'originally developed by Pawel (twitter: @PawelPawlak14). Feel free to pm me with any suggestions/feedback';

		this.social.creator = "Pawel Pawlak";
		this.social.twitter = "@PawelPawlak14";

	}

	returnGameRulesHTML() {
		return MahjongGameRulesTemplate(this.app, this);
	}

	//
	// runs the first time the game is created / initialized
	//
	initializeGame(game_id) {
		console.log('GAMEID: ' + game_id);

		//
		// to persist data between games, such as board state, write it to
		// the game.state object. if this object does not exist, that tells
		// us this is the first time we have initialized this game.
		//
		if (!this.game.state) {
			//Just default 1 player game state (for the stats)
			this.game.state = this.returnState();
			this.game.state.hidden = [];
			this.newRound();
		} else {
			this.game.queue.push('READY');
		}

		this.saveGame(this.game.id);
	}

	//
	// runs whenever we load the game into the browser. render()
	//
	async render(app) {
		if (!this.browser_active || this.initialize_game_run) {
			return;
		}
		
		await this.injectGameHTML(htmlTemplate());

		await super.render(app);

		this.menu.addMenuOption('game-game', 'Game');

		this.menu.addSubMenuOption('game-game', {
			text: 'Start New Game',
			id: 'game-new',
			class: 'game-new',
			callback: function (app, game_mod) {
				game_mod.menu.hideSubMenus();
				game_mod.prependMove('lose');
				game_mod.endTurn();
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
				game_mod.overlay.show(game_mod.returnStatsHTML('Mahjong 统计'));
			}
		});

		this.menu.addChatMenu();

		//
		// render menu
		//
		this.menu.render();

		//
		// display the board?
		//
		if (this.game.board && this.game.deck) {
			this.displayBoard(0);
		}

		if (app.browser.isMobileBrowser(navigator.userAgent)) {
			this.hammer.rightJustify = true;
			this.hammer.render('#mahj-rowbox', 900);
		} else {
			this.sizer.render();
			this.sizer.attachEvents('#mahj-rowbox');
			$('#mahj-rowbox').draggable('option', 'cancel', 'img');
		}
	}

	newRound() {
		//Set up queue
		this.game.queue.push('play');
		this.game.queue.push('READY');
		this.game.queue.push('DEAL\t1\t1\t144');
		this.game.queue.push('SHUFFLE\t1\t1');
		this.game.queue.push('DECK\t1\t' + JSON.stringify(this.returnDeck()));

		//Clear board
		this.game.board = {};
	}

	isArrayInArray(arr, item) {
		var item_as_string = JSON.stringify(item);

		var contains = arr.some(function (ele) {
			return JSON.stringify(ele) === item_as_string;
		});
		return contains;
	}

	firstColumn = 1;
	lastColumn = 14;

	emptyCells = [
		// bottom layer
		[1, 1],
		[1, 14],
		[2, 1],
		[2, 2],
		[2, 3],
		[2, 12],
		[2, 13],
		[2, 14],
		[3, 1],
		[3, 2],
		[3, 13],
		[3, 14],
		[4, 14],
		[5, 1],
		[6, 1],
		[6, 2],
		[6, 13],
		[6, 14],
		[7, 1],
		[7, 2],
		[7, 3],
		[7, 12],
		[7, 13],
		[7, 14],
		[8, 1],
		[8, 14],
		// 2nd layer
		[9, 1],
		[9, 2],
		[9, 3],
		[9, 4],
		[9, 11],
		[9, 12],
		[9, 13],
		[9, 14],
		[10, 1],
		[10, 2],
		[10, 3],
		[10, 4],
		[10, 11],
		[10, 12],
		[10, 13],
		[10, 14],
		[11, 1],
		[11, 2],
		[11, 3],
		[11, 4],
		[11, 11],
		[11, 12],
		[11, 13],
		[11, 14],
		[12, 1],
		[12, 2],
		[12, 3],
		[12, 4],
		[12, 11],
		[12, 12],
		[12, 13],
		[12, 14],
		[13, 1],
		[13, 2],
		[13, 3],
		[13, 4],
		[13, 11],
		[13, 12],
		[13, 13],
		[13, 14],
		[14, 1],
		[14, 2],
		[14, 3],
		[14, 4],
		[14, 11],
		[14, 12],
		[14, 13],
		[14, 14],
		// 3rd layer
		[15, 1],
		[15, 2],
		[15, 3],
		[15, 4],
		[15, 5],
		[15, 10],
		[15, 11],
		[15, 12],
		[15, 13],
		[15, 14],
		[16, 1],
		[16, 2],
		[16, 3],
		[16, 4],
		[16, 5],
		[16, 10],
		[16, 11],
		[16, 12],
		[16, 13],
		[16, 14],
		[17, 1],
		[17, 2],
		[17, 3],
		[17, 4],
		[17, 5],
		[17, 10],
		[17, 11],
		[17, 12],
		[17, 13],
		[17, 14],
		[18, 1],
		[18, 2],
		[18, 3],
		[18, 4],
		[18, 5],
		[18, 10],
		[18, 11],
		[18, 12],
		[18, 13],
		[18, 14],
		// 4th layer
		[19, 1],
		[19, 2],
		[19, 3],
		[19, 4],
		[19, 5],
		[19, 6],
		[19, 9],
		[19, 10],
		[19, 11],
		[19, 12],
		[19, 13],
		[19, 14],
		[20, 1],
		[20, 2],
		[20, 3],
		[20, 4],
		[20, 5],
		[20, 6],
		[20, 9],
		[20, 10],
		[20, 11],
		[20, 12],
		[20, 13],
		[20, 14],
		//5th layer (top)
		[21, 1],
		[21, 2],
		[21, 3],
		[21, 4],
		[21, 5],
		[21, 6],
		[21, 9],
		[21, 10],
		[21, 11],
		[21, 12],
		[21, 13],
		[21, 14]
	];

	// displayBoard
	async displayBoard(timeInterval = 0) {
		console.log('Display board with pause of ' + timeInterval);
		let index = 0;

		let deckSize = 144;

		if (timeInterval){
			$("#tiles").hide();
		}

		this.game.availableMoves = [];

		for (let row = 1; row <= 21; row++) {
			for (let column = 1; column <= 14; column++) {
				let position = `row${row}_slot${column}`;
				this.makeInvisible(position);
			}
		}

		if (!this.game?.board || Object.values(this.game.board).length === 0) {
			this.game.board = {};
			this.game.state.hidden = [];

			for (let row = 1; row <= 21; row++) {
				for (let column = 1; column <= 14; column++) {
					let position = `row${row}_slot${column}`;

					if (
						!this.isArrayInArray(this.emptyCells, [row, column]) &&
						this.game.deck[0].hand.length > 0
					) {
						let tile = this.game.deck[0].hand.pop();
						this.game.board[position] =
							this.game.deck[0].cards[tile];
					} else {
						this.game.board[position] = 'E';
					}
				}
			}
		}

		this.game.cardsLeft = deckSize - this.game.state.hidden.length;
		this.game.selected = '';
		$('.selected').removeClass('selected');

		for (let row = 1; row <= 21; row++) {
			for (let column = 1; column <= 14; column++) {
				var divname = `row${row}_slot${column}`;

				if (this.game.board[divname] !== 'E') {
					$('#' + divname).html(
						this.returnCardImageHTML(this.game.board[divname])
					);
					if (this.game.state.hidden.includes(divname)) {
						this.makeInvisible(divname);
					} else {
						this.makeVisible(divname);
					}

					if (timeInterval) {
						await this.timeout(timeInterval);
					}
				}
			}
		}
		this.attachEventsToBoard();
		this.displayUserInterface();
	}

	makeInvisible(divname) {
		$(`#${divname}`).addClass('invisible');
		$(`#mahj-rowbox #${divname}`).removeClass('selected');
	}

	makeVisible(divname) {
		$(`#${divname}`).removeClass('invisible');
	}

	toggleCard(divname) {
		$(`#${divname}`)
			.addClass('selected')
			.removeClass('available')
			.addClass('emphasis')
			.delay(350)
			.queue(function () {
				$(`#${divname}`).removeClass('emphasis').dequeue();
			});
		this.game.selected = divname;
		this.getAvailableTiles();
	}

	untoggleCard(divname) {
		$(`#${divname}`).removeClass('selected');

		this.game.selected = '';
		this.getAvailableTiles();

		$(`#${divname}`)
			.removeClass('available')
			.delay(250)
			.queue(function () {
				$(`#${divname}`).addClass('available').dequeue();
			});
	}

	returnCardImageHTML(name) {
		if (name[0] === 'E') {
			return '';
		} else {
			return (
				'<img draggable="false" src="/mahjong/img/tiles/white/' +
				name +
				'.png" />'
			);
		}
	}

	attachEventsToBoard() {
		let mahjong_self = this;

		$('.slot').off();
		$('.slot').on('click', async function () {
			let card = $(this).attr('id');
			if (!mahjong_self.game.availableMoves.includes(card)) {
				return;
			}

			if (mahjong_self.game.selected === card) {
				//Selecting same card again
				mahjong_self.untoggleCard(card);
				return;
			} else {
				if (mahjong_self.game.selected === '') {
					// New Card
					mahjong_self.toggleCard(card);
					return;
				} else {
					if (
						mahjong_self.game.board[card] ===
						mahjong_self.game.board[mahjong_self.game.selected]
					) {
						$('.selected').addClass('valid');
						$('#' + card).addClass('selected');
						await mahjong_self.timeout(100);
						mahjong_self.moveGameElement(
							mahjong_self.copyGameElement('#' + card),
							`.notfound.${mahjong_self.game.board[
								card
							].toLowerCase()}`,
							{
								resize: 1,
								callback: (id) => {
									document.getElementById(
										id
									).style.opacity = 0;
								}
							},
							null
						);
						mahjong_self.moveGameElement(
							mahjong_self.copyGameElement(
								'#' + mahjong_self.game.selected
							),
							`.notfound.${mahjong_self.game.board[
								card
							].toLowerCase()}`,
							{
								resize: 1,
								callback: (id) => {
									document.getElementById(
										id
									).style.opacity = 0;
								}
							},
							null
						);

						mahjong_self.makeInvisible(card);
						mahjong_self.makeInvisible(mahjong_self.game.selected);
						mahjong_self.game.state.hidden.push(card);
						mahjong_self.game.state.hidden.push(
							mahjong_self.game.selected
						);
						mahjong_self.game.cardsLeft =
							mahjong_self.game.cardsLeft - 2;

						if (mahjong_self.game.cardsLeft === 0) {
							mahjong_self.prependMove('win');
							mahjong_self.endTurn();
							return;
						}

						mahjong_self.game.selected = '';
						mahjong_self.displayUserInterface();
					} else {
						$(this)
							.addClass('emphasis')
							.delay(350)
							.queue(() => {
								$(this).removeClass('emphasis').dequeue();
							});
					}
				}
			}
		});
	}

	getAvailableTiles() {
		let availableTiles = new Map([]);
		this.game.availableMoves = [];
		$('.mahj-rowbox .slot')
			.removeClass('available')
			.removeClass('valid')
			.removeClass('invalid');
		for (let row = 1; row <= 21; row++) {
			for (let column = 1; column <= 14; column++) {
				if (
					(row === 5 &&
						column === 2 &&
						!this.game.state.hidden.includes('row4_slot1')) ||
					(row === 4 &&
						column === 13 &&
						!this.game.state.hidden.includes('row5_slot14'))
				) {
					continue;
				}
				if (row >= 2 && row <= 7 && column >= 5 && column <= 10) {
					if (
						!this.game.state.hidden.includes(
							`row${row + 7}_slot${column}`
						)
					) {
						continue;
					}
				}
				if (row >= 10 && row <= 13 && column >= 6 && column <= 9) {
					if (
						!this.game.state.hidden.includes(
							`row${row + 5}_slot${column}`
						)
					) {
						continue;
					}
				}
				if (row >= 16 && row <= 17 && column >= 7 && column <= 8) {
					if (
						!this.game.state.hidden.includes(
							`row${row + 3}_slot${column}`
						)
					) {
						continue;
					}
				}
				if (row >= 19 && row <= 20 && column >= 7 && column <= 8) {
					if (
						!this.game.state.hidden.includes(`row21_slot${column}`)
					) {
						continue;
					}
				}
				if (
					// \/ checking if right or left tile is unlocked or empty
					((this.game.state.hidden.includes(
						`row${row}_slot${column - 1}`
					) ||
						this.game.board[`row${row}_slot${column - 1}`] ===
							'E' ||
						this.game.state.hidden.includes(
							`row${row}_slot${column + 1}`
						) ||
						this.game.board[`row${row}_slot${column + 1}`] ===
							'E') &&
						this.game.board[`row${row}_slot${column}`] !== 'E' &&
						!this.game.state.hidden.includes(
							`row${row}_slot${column}`
						)) ||
					// /\ checking if right or left tile is unlocked or empty
					// \/ checking two outermost rows
					(row === 4 &&
						column === 1 &&
						!this.game.state.hidden.includes('row4_slot1')) ||
					(row === 5 &&
						column === 14 &&
						!this.game.state.hidden.includes('row5_slot14'))
				) {
					// /\ checking two outermost rows
					if (
						availableTiles.get(
							this.game.board[`row${row}_slot${column}`]
						) !== undefined
					) {
						availableTiles.set(
							this.game.board[`row${row}_slot${column}`],
							availableTiles.get(
								this.game.board[`row${row}_slot${column}`]
							) + 1
						);
					} else {
						availableTiles.set(
							this.game.board[`row${row}_slot${column}`],
							1
						);
					}
					this.game.availableMoves.push(`row${row}_slot${column}`);
					$(`#row${row}_slot${column}`).addClass('available');
					if (
						this.game.selected &&
						this.game.selected !== `row${row}_slot${column}`
					) {
						if (
							this.game.board[`row${row}_slot${column}`] ==
							this.game.board[this.game.selected]
						) {
							$(`#row${row}_slot${column}`).addClass('valid');
						} else {
							$(`#row${row}_slot${column}`).addClass('invalid');
						}
					}
				}
			}
		}

		let hints = [];
		for (let i = 0; i < this.game.availableMoves.length - 1; i++) {
			for (let j = i + 1; j < this.game.availableMoves.length; j++) {
				if (
					this.game.board[this.game.availableMoves[i]] ===
					this.game.board[this.game.availableMoves[j]]
				) {
					hints.push([
						this.game.availableMoves[i],
						this.game.availableMoves[j]
					]);
				}
			}
		}

		return hints;
	}

	async displayUserInterface() {
		let tilesLeftToUnlock = this.getAvailableTiles();

		if (
			this.game.cardsLeft > 0 &&
			(!tilesLeftToUnlock || tilesLeftToUnlock.length == 0)
		) {
			let c = await sconfirm(
				'There are no more available moves to make, start new game?'
			);
			if (c) {
				this.prependMove('lose');
				this.endTurn();
				return;
			}
		}
		let mahjong_self = this;

		let html = `Remove tiles in pairs until none remain. Tiles must not be blocked to their left and right.`;

		let option = '<ul>';
		option += `<li id="hint" class="option"><span>Hint: ${tilesLeftToUnlock.length}<span class="hidable"> pairs available</span></span></li>`;
		if (this.game.state.hidden.length > 0) {
			option += `<li class="option" id="undo">Undo</li>`;
		}
		option += `</ul>`;

		this.updateStatusWithOptions(html, option);

		let tiles = this.returnTiles();
		html = '';
		for (let tile of tiles) {
			let num_found = this.returnHidden(tile);
			html += `<div class="scoreboard_tile ${
				num_found > 1 ? 'found' : 'notfound'
			} ${tile.toLowerCase()}">${this.returnCardImageHTML(tile)}</div>
               <div class="scoreboard_tile ${
	num_found > 3 ? 'found' : 'notfound'
} ${tile.toLowerCase()}">${this.returnCardImageHTML(tile)}</div>
       `;
		}
		$('#tiles').html(html);
		$('#tiles').show();
		$('.option').off();
		$('.option').on('click', function () {
			let action = $(this).attr('id');
			if (action === 'undo') {
				mahjong_self.undoMove();
				return;
			}

			if (action == 'hint' && tilesLeftToUnlock.length > 0) {
				let pair = tilesLeftToUnlock.pop();
				$(`#${pair[0]}, #${pair[1]}`)
					.addClass('hint')
					.delay(400)
					.queue(function () {
						$(this).removeClass('hint').dequeue();
					})
					.delay(300)
					.queue(function () {
						$(this).addClass('hint').dequeue();
					})
					.delay(400)
					.queue(function () {
						$(this).removeClass('hint').dequeue();
					})
					.delay(300)
					.queue(function () {
						$(this).addClass('hint').dequeue();
					})
					.delay(400)
					.queue(function () {
						$(this).removeClass('hint').dequeue();
					});

				tilesLeftToUnlock.unshift(pair);
			}
		});
	}

	undoMove() {
		if (this.game.selected !== '') {
			this.untoggleCard(this.game.selected);
		}
		this.makeVisible(this.game.state.hidden.pop());
		this.makeVisible(this.game.state.hidden.pop());

		this.game.cardsLeft += 2;
		this.displayUserInterface();
	}

	////////////////////
	// VERY IMPORTANT //
	////////////////////
	//
	// this is the main function for queue-based games. cryptographic logic
	// and shared commands (DEAL, SHUFFLE, etc.) are powered by the underlying
	// game engine, which kicks instructions here if it doesn't recognize them.
	//
	// the convention is for game-level instructions to be lowercase and game-
	// engine commands to be UPPERCASE so as to easily.
	//
	// return 0 -- halts execution
	// return 1 -- continues execution
	//
	// clear the queue manually and return 1 if there is no user-input at this
	// point in the game. if there is user-input, return 0 and the QUEUE will
	// being to execute again the next time a move is received over the network.
	//
	handleGameLoop(msg = null) {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			if (mv[0] === 'play') {
				if (this.browser_active) {
					this.game.queue.splice(qe, 1);
					//Reset/Increment State
					this.displayBoard(2);
				}
			}

			if (mv[0] === 'lose') {
				this.game.queue.splice(qe, 1);
				this.newRound();
				this.game.state.session.round++;
				this.game.state.session.losses++;
				this.game.queue.push(
					`ROUNDOVER\t${JSON.stringify(
						[]
					)}\troundover\t${JSON.stringify([this.publicKey])}`
				);

				return 1;
			}

			if (mv[0] === 'win') {
				this.game.queue.splice(qe, 1);
				this.game.state.session.round++;
				this.game.state.session.wins++;
				this.displayModal(
					'Congratulations! Here is your fortune',
					this.returnFortune()
				);
				this.newRound();
				this.game.queue.push(
					`ROUNDOVER\t${JSON.stringify([
						this.publicKey
					])}\troundover\t${JSON.stringify([])}`
				);

				return 1;
			}

			if (mv[0] === 'move') {
				this.game.queue.splice(qe, 1);
				return 1;
			}

			return 0;
		}

		//
		// nothing in queue, return 0 and halt
		//
		return 0;
	}

	returnHidden(tile) {
		let count = 0;
		for (let slot of this.game.state.hidden) {
			if (this.game.board[slot] == tile) {
				count++;
			}
		}
		return count;
	}

	returnTiles() {
		return [
			'Pin1',
			'Pin2',
			'Pin3',
			'Pin4',
			'Pin5',
			'Pin6',
			'Pin7',
			'Pin8',
			'Pin9',
			'Man1',
			'Man2',
			'Man3',
			'Man4',
			'Man5',
			'Man6',
			'Man7',
			'Man8',
			'Man9',
			'Sou1',
			'Sou2',
			'Sou3',
			'Sou4',
			'Sou5',
			'Sou6',
			'Sou7',
			'Sou8',
			'Sou9',
			'Pin5-Dora',
			'Man5-Dora',
			'Sou5-Dora',
			'Ton',
			'Nan',
			'Shaa',
			'Pei',
			'Chun',
			'Hatsu'
		];
	}

	returnDeck() {
		let cards = this.returnTiles();

		let deck = {};
		let index = 1;

		for (let i = 0; i < cards.length; i++) {
			for (let j = 0; j < 4; j++) {
				deck[index++] = cards[i];
			}
		}

		return deck;
	}

	returnFortune() {
		let fortunes = [
			'Do not be afraid of competition',
			'An exciting opportunity lies ahead of you',
			'You will always be surrounded by true friends',
			'You are kind and friendly',
			'You should be able to undertake and complete anything',
			'You are wise beyond your years',
			'A routine task will turn into an enchanting adventure',
			'Beware of all enterprises that require new clothes',
			'Be true to your work, your word, and your friends',
			'Goodness is the only investment that never fails',
			'A journey of a thousand miles begins with a single step',
			'Forget injuries, but never forget kindnesses',
			'Respect yourself and others will respect you',
			'A man cannot be comfortable without his own approval',
			'It is easier to stay out than to get out',
			'You will receive money from an unexpected source',
			'Attitude is a little thing that makes a big difference',
			'Plan for many pleasure ahead',
			'Experience is the best teacher',
			'You ability to juggle many tasks will take you far',
			'Once you make a decision the universe conspires to make it happen',
			'Make yourself necessary to someone',
			'The only way to have a friend is to be one',
			'Nothing great was ever achieved without enthusiasm',
			'Live this day as if it were your last',
			'Your life will be happy and peaceful',
			'Bloom where you are planted',
			'Move in the direction of your dreams',
			'Help! I\'m being held prisoner in a fortune cookie factory',
			'The one you love is closer than you think',
			'In dreams and in love there are no impossibilities'
		];

		return fortunes[Math.floor(fortunes.length * Math.random())];
	}
}

module.exports = Mahjong;
