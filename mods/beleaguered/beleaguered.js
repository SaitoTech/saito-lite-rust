const OnePlayerGameTemplate = require('../../lib/templates/oneplayer-gametemplate');
const BeleagueredGameRulesTemplate = require('./lib/beleaguered-game-rules.template');
const htmlTemplate = require('./lib/game-html.template');

const CardStack = require('../../lib/saito/ui/game-cardstack/game-cardstack');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Beleaguered extends OnePlayerGameTemplate {
	constructor(app) {
		super(app);

		this.name = 'Beleaguered';
		this.gamename = 'Beleaguered Castle';
		this.slug = 'beleaguered';
		this.description = 'Stack all cards by suit from aces to kings to win this game';
		this.categories = 'Games Cardgame One-player';
		this.publisher_message =
			'created by Pawel (twitter: @PawelPawlak14) with contributions from Saito team. Feel free to pm me with any suggestions/feedback';

		this.animationSpeed = 700;
		this.card_img_dir = '/saito/img/arcade/cards';

		this.app = app;
		this.status = 'Beta';
		this.stacks = [
			'l1',
			'm1',
			'r1',
			'l2',
			'm2',
			'r2',
			'l3',
			'm3',
			'r3',
			'l4',
			'm4',
			'r4'
		];

		this.social.creator = "Pawel Pawlak";
		this.social.twitter = "@PawelPawlak14";
	}

	returnGameRulesHTML() {
		return BeleagueredGameRulesTemplate(this.app, this);
	}

	initializeGame(game_id) {
		if (!this.game.state) {
			console.log('******Generating the Game******');
			this.game.state = this.returnState();
			this.game.queue = [];
			this.game.queue.push('round');
		}

		this.game.queue.push('READY');

		if (this.browser_active) {
			$('.slot').css('min-height', $('.card').css('min-height'));
		}
	}

	newRound() {
		//Set up queue
		this.game.queue = [];
		this.game.queue.push('play');
		this.game.queue.push('DEAL\t1\t1\t48');
		this.game.queue.push('SHUFFLE\t1\t1');
		this.game.queue.push('DECK\t1\t' + JSON.stringify(this.returnDeck()));

		//Clear board
		this.game.board = {};

		for (let slot of this.stacks) {
			this.cardStacks[slot].clear();
		}
	}

	async render(app) {
		//console.trace("Initialize HTML");
		if (!this.browser_active || !this.app.BROWSER || this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());

		await super.render(app);

		//
		// ADD MENU
		//
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
				game_mod.overlay.show(game_mod.returnStatsHTML());
			}
		});

		this.menu.addChatMenu();
		this.menu.render();

		//Check screen dimensions
		let dynamic_card_size = Math.min(
			120,
			window.innerWidth / 5,
			window.innerHeight * 0.14
		);

		this.cardStacks = {};
		for (let slot of this.stacks) {
			this.cardStacks[slot] = new CardStack(app, this, slot);
			this.cardStacks[slot].card_width = Math.ceil(dynamic_card_size);
		}

		this.setUpStacks();
	}

	setUpStacks() {
		for (let i = 1; i <= 4; i++) {
			this.cardStacks['l' + i].orientation = 'left';
			this.cardStacks['r' + i].orientation = 'right';
			this.cardStacks['m' + i].orientation = 'center';
		}
	}

	removeEvents() {
		for (let i of this.stacks) {
			this.cardStacks[i].removeFilter();
		}
	}

	attachEventsToBoard() {
		const canMoveCard = (card_index, stack) => {
			//You can't select a card that doesn't exist
			if (card_index == -1) {
				return false;
			}

			let card = stack.cards[card_index];
			let beleaguered_self = stack.mod;
			let suit = card[0];
			let number = parseInt(card.slice(1));

			//You can't move cards from the center
			if (stack.name[0] == 'm') {
				return false;
			}

			for (let st in beleaguered_self.game.board) {
				//You can move any card to an empty space
				if (beleaguered_self.game.board[st].length == 0) {
					return true;
				}

				let top_card = beleaguered_self.game.board[st].slice(-1)[0];

				let top_suit = top_card[0];
				let top_number = parseInt(top_card.slice(1));

				if (st[0] == 'm') {
					//Count up in the middle, suits must match
					if (suit == top_suit && number == top_number + 1) {
						return true;
					}
				} else {
					//Count down on the sides, suits can mismatch
					if (number + 1 == top_number) {
						return true;
					}
				}
			}
			return false;
		};

		const selectCard = (activated_card_stack, card_index) => {
			let game_self = activated_card_stack.mod;

			game_self.selected = activated_card_stack.cards[card_index];
			$('.gameboard').addClass('selected_state');

			for (let slot of game_self.stacks) {
				////////////////////////
				// Move Card!
				///////////////////////
				game_self.cardStacks[slot].applyFilter(
					canPlaceCard,
					async (target_card_stack) => {
						game_self.prependMove(
							`move\t${game_self.selected}\t${activated_card_stack.name}\t${target_card_stack.name}`
						);

						await game_self.moveCard(
							game_self.selected,
							activated_card_stack.name,
							target_card_stack.name
						);
					}
				);
			}

			//Clicking on the same stack will unselect the card
			activated_card_stack.applyFilter(() => {
				return true;
			}, returnCard);
			activated_card_stack.markSelected(card_index);
		};

		const canPlaceCard = (card_index, stack) => {
			//Can always place on an empty slot
			if (card_index === -1) {
				return true;
			}

			let card = stack.cards[card_index];
			let beleaguered_self = stack.mod;
			let moving_card = beleaguered_self.selected;
			let moving_card_suit = moving_card[0];
			let moving_card_number = parseInt(moving_card.slice(1));

			let suit = card[0];
			let number = parseInt(card.slice(1));

			if (stack.name[0] == 'm') {
				if (
					moving_card_suit === suit &&
					number + 1 === moving_card_number
				) {
					return true;
				}
			} else {
				if (moving_card_number + 1 == number) {
					return true;
				}
			}

			return false;
		};

		const returnCard = () => {
			activateCards();
		};

		const activateCards = async () => {
			//Check for victory
			if (
				this.game.board['m1'].length +
					this.game.board['m2'].length +
					this.game.board['m3'].length +
					this.game.board['m4'].length ==
				52
			) {
				this.updateStatus('You Win');
				let c = await sconfirm('You win! Start new Game?');
				if (c) {
					this.prependMove('win');
					this.endTurn();
				}
				return;
			}

			//
			// Activate events always starts without a selected card
			//
			let success = 0;
			$('.gameboard').removeClass('selected_state');
			for (let slot of this.stacks) {
				success += this.cardStacks[slot].applyFilter(
					canMoveCard,
					selectCard
				);
			}

			if (!success) {
				let c = await sconfirm(`No more moves. Start new Game?`);
				if (c) {
					this.updateStatus('Game Over');
					this.prependMove('lose');
					this.endTurn();
				}

				return;
			}

			this.displayUserInterface();
		};

		activateCards();
	}

	async moveCard(card, source_stack, target_stack) {
		console.log(`Move ${card} from ${source_stack} to ${target_stack}`);

		//Update Internal Game Logic
		this.game.board[source_stack].pop();
		this.game.board[target_stack].push(card);

		this.selected = '';

		this.removeEvents();

		this.moveGameElement(
			this.copyGameElement(
				this.cardStacks[source_stack].getTopCardElement().children[0]
			),
			this.cardStacks[target_stack].getTopCardElement(),
			{
				resize: 1
			},
			() => {
				$('.animated_elem').remove();
				this.cardStacks[source_stack].pop();
				this.cardStacks[target_stack].push(card);
				this.attachEventsToBoard();
				console.log('Finished animating');
			}
		);
	}

	/* Copy hand into board*/
	async handToBoard() {
		for (let i of this.stacks) {
			this.cardStacks[i].render();
		}

		if (
			!('board' in this.game) ||
			Object.keys(this.game.board).length != this.stacks.length
		) {
			this.game.board = {};
			for (let slot of this.stacks) {
				this.game.board[slot] = [];
			}

			let indexCt = 0;
			this.game.board['m1'] = ['C1'];
			this.game.board['m2'] = ['D1'];
			this.game.board['m3'] = ['H1'];
			this.game.board['m4'] = ['S1'];

			this.cardStacks['m1'].push('C1');
			this.cardStacks['m2'].push('D1');
			this.cardStacks['m3'].push('H1');
			this.cardStacks['m4'].push('S1');

			for (let j = 0; j < 6; j++) {
				for (let i = 1; i <= 4; i++) {
					let card =
						this.game.deck[0].cards[
							this.game.deck[0].hand[indexCt++]
						];
					this.game.board[`l${i}`].push(card);
					await this.timeout(75);
					this.cardStacks[`l${i}`].push(card);
					card =
						this.game.deck[0].cards[
							this.game.deck[0].hand[indexCt++]
						];
					this.game.board[`r${i}`].push(card);
					await this.timeout(75);
					this.cardStacks[`r${i}`].push(card);
				}
			}
		} else {
			for (let slot of this.stacks) {
				if (!this.cardStacks[slot].initialized) {
					for (let card of this.game.board[slot]) {
						await this.timeout(15);
						this.cardStacks[slot].push(card);
					}
					this.cardStacks[slot].initialized = true;
				} else {
					console.log('********************');
					console.log('Oh no, the cardstack is already initialize');
					console.log('********************');
				}
			}
		}

		this.selected = '';

		this.displayBoard();
	}

	parseIndex(slot) {
		let coords = slot.split('_');
		let x = coords[0].replace('row', '');
		let y = coords[1].replace('slot', '');
		return 10 * (parseInt(x) - 1) + parseInt(y) - 1;
	}

	async handleGameLoop(msg = null) {
		this.saveGame(this.game.id);
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;

			if (mv[0] === 'round') {
				this.newRound();
			}

			if (mv[0] === 'win') {
				this.game.state.session.round++;
				this.game.state.session.wins++;
				this.game.queue.push('round');
				this.game.queue.push(
					`ROUNDOVER\t${JSON.stringify([
						this.publicKey
					])}\t${JSON.stringify([])}`
				);
			}

			if (mv[0] === 'lose') {
				this.game.state.session.round++;
				this.game.state.session.losses++;
				this.game.queue.push('round');
				this.game.queue.push(
					`ROUNDOVER\t${JSON.stringify([])}\t${JSON.stringify([
						this.publicKey
					])}`
				);
			}

			if (mv[0] === 'play') {
				//this.game.queue.splice(qe, 1);
				if (this.browser_active) {
					this.handToBoard();
					this.displayUserInterface();
				}
				return 0;
			}

			if (mv[0] === 'move') {
				this.game.queue.splice(qe, 1);
			}
		}
		return 1;
	}

	displayBoard() {
		if (this.browser_active == 0) {
			return;
		}

		for (let i of this.stacks) {
			this.cardStacks[i].render();
		}

		this.attachEventsToBoard();
	}

	/*
  no status atm, but this is to update the hud
  */
	displayUserInterface() {
		let html = `<div class="hidable">Place all cards ascending by number on their suit stacks to win the game.</div>
      <div class="hidable">Cards can be moved around on higher cards on the side stacks regardless of their suit. 
      Any card can be placed on the empty side stack.</div>
      <div class="controls">`;

		html += `<div class="new_game status_option">New Game</div>`;

		if (this.moves.length > 0) {
			html += `<div class="undo_last status_option">Undo</div>`;
		}
		html += `<div class="auto_solve status_option">Auto Complete</div></div>`;

		this.updateStatus(html);

		$('.new_game').on('click', async () => {
			let c = await sconfirm('Do you want to end this game and start a new one?');
			if (c) {
				this.prependMove('lose');
				this.endTurn();
			}
		});

		$('.undo_last').on('click', () => {
			this.undoMove();
		});

		$('.auto_solve').on('click', async () => {
			this.removeEvents();
			let success = await this.autoPlay();
			if (!success) {
				$('.auto_solve').text('No cards can castle');
				$('.auto_solve').off();
				this.displayBoard();
			} else {
				if (!this.animating_autoplay) {
					$('.animated_elem').remove();
					this.displayBoard();
				} else {
					let x;
					x = setInterval(() => {
						if (!this.animating_autoplay) {
							$('.animated_elem').remove();
							this.displayBoard();
							clearInterval(x);
						}
					}, 500);
				}
			}
		});
	}

	undoMove() {
		if (this.moves.length == 0) {
			return;
		}

		let mv = this.moves.shift().split('\t');

		if (mv[0] == 'move') {
			this.moveCard(mv[1], mv[3], mv[2]);

			$('.undo_last').off();
		}
	}

	async autoPlay() {
		let source_stack = '';
		let target_stack = '';
		let target_card = '';

		for (let i = 1; i <= 4; i++) {
			target_stack = `m${i}`;
			let top_card = this.game.board[target_stack].slice(-1)[0];
			target_card = top_card[0] + (parseInt(top_card.slice(1)) + 1);

			for (let slot of this.stacks) {
				if (this.game.board[slot].length > 0) {
					let available_card = this.game.board[slot].slice(-1)[0];
					if (available_card == target_card) {
						source_stack = slot;
						break;
					}
				}
			}

			if (source_stack) {
				break;
			}
		}

		if (source_stack) {
			this.prependMove(
				`move\t${target_card}\t${source_stack}\t${target_stack}`
			);
			//this.animationSpeed = 500;

			//Update Internal Game Logic
			this.game.board[source_stack].pop();
			this.game.board[target_stack].push(target_card);

			this.selected = '';
			this.animating_autoplay = true;

			this.moveGameElement(
				this.copyGameElement(
					this.cardStacks[source_stack].getTopCardElement()
						.children[0]
				),
				`#cardstack_${target_stack}`,
				{
					resize: 1,
					callback: () => {
						this.cardStacks[source_stack].pop();
						this.cardStacks[target_stack].push(target_card, false);
					}
				},
				() => {
					this.animating_autoplay = false;
					console.log('Running callback at end of animation???');
				}
			);

			await this.timeout(200);
			//Recurse as long as we make a move
			await this.autoPlay();
			return true;
		}
		return false;
	}

	returnCardImageHTML(name) {
		if (name[0] == 'E') {
			return '';
		} else {
			return `<img src="${this.card_img_dir}/${name}.png" />`;
		}
	}

	returnDeck() {
		let suits = ['S', 'C', 'H', 'D'];
		var deck = {};
		for (let i = 0; i < 4; i++)
			for (let j = 2; j <= 13; j++) {
				let name = suits[i] + j;
				deck[name] = name;
			}

		return deck;
	}
}

module.exports = Beleaguered;
