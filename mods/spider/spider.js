const OnePlayerGameTemplate = require('../../lib/templates/oneplayer-gametemplate');
const SpiderGameRulesTemplate = require('./lib/spider-game-rules.template');
const AppSettings = require('./lib/spider-settings');
const CardStack = require('../../lib/saito/ui/game-cardstack/game-cardstack');
const htmlTemplate = require('./lib/game-html.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Spider extends OnePlayerGameTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.name = 'Spider';
		this.slug = 'spider';
		this.gamename = 'Spider Solitaire';
		this.game_length = 10; //Estimated number of minutes to complete a game
		this.description =
			'Classic multideck solitaire game with three levels of difficulty available. Complete stacks of Ace through King in a single suit to remove them from the board. Partial stacks of the same suit can be moved to access the cards below them.';
		this.categories = 'Games Cardgame One-player';

		this.status = 'Beta';
		this.difficulty = 2; //default medium, 1 = easy, 4 = hard

		this.selected_stack = null;
		this.possible_moves = null; //When using auto mode, some temporary memory
		this.hints = null;
	}

	// Create an exp league by default
	respondTo(type) {
		if (type == 'default-league') {
			let obj = super.respondTo(type);
			obj.ranking_algorithm = 'HSC';
			return obj;
		}
		return super.respondTo(type);
	}

	returnGameRulesHTML() {
		return SpiderGameRulesTemplate(this.app, this);
	}


	initializeGame(game_id) {
		console.log('SET WITH GAMEID: ' + game_id);

		if (!this.game.state) {
			console.log('******Generating the Game******');
			this.game.state = this.returnState();
			this.game.queue = [];
		}

		console.log(JSON.parse(JSON.stringify(this.game)));

		//Set difficulty
		let input_dif = this.loadGamePreference('spider-difficulty') || 'medium';
		this.changeDifficulty(input_dif);

		if (this.browser_active) {
			if (this.game.deck.length == 0) {
				this.newRound();
			}
		} else {
			this.game.queue.push('READY');
		}
	}

	async render(app) {
		//console.trace("Initialize HTML");
		if (!this.browser_active || this.initialize_game_run) {
			return;
		}

		// Insert game board
		await this.injectGameHTML(htmlTemplate());
		$('.gameboard').html(this.returnBoard());
		this.removeEvents();

		await super.render(app);

		this.preloadImages();

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
				game_mod.overlay.show(game_mod.returnStatsHTML());
			}
		});

		this.menu.addChatMenu();
		this.menu.render();
		
		this.updateScore(0);

		this.cardStacks = [];
		for (let i = 0; i < 10; i++) {
			this.cardStacks.push(new CardStack(app, this, i));
			//
			//Copy Board state from memory if it exists
			//
			if (this.game.state.board[i]) {
				console.log(
					'Load Last Board:',
					JSON.parse(JSON.stringify(this.game.state.board[i]))
				);
				this.cardStacks[i].cards = this.game.state.board[i];
			}
		}
	}

	newRound() {
		//Set up queue
		this.game.queue = [];
		this.game.queue.push('play');
		this.game.queue.push('DEAL\t1\t1\t54');
		this.game.queue.push('SHUFFLE\t1\t1');
		this.game.queue.push(
			'DECK\t1\t' + JSON.stringify(this.returnDeck(this.difficulty))
		);

		//Clear board -
		this.game.state.board = [];

		this.game.state.moves = 0;
		this.game.state.completed_stacks = [];
		this.game.state.score = 100 * this.difficulty;

		//Reset/Increment State
		this.game.state.draws_remaining = 5;

		if (this.browser_active) {
			this.updateScore(0);
			for (let i = 0; i < 10; i++) {
				this.cardStacks[i].clear();
				$('#helper').remove();
			}
		}
	}

	updateScore(change = -1) {
		this.game.state.score += change;
		this.scoreboard.update(
			`<div class="score">Score: ${this.game.state.score}</div>`
		);
		if (this.game.state.score <= 0) {
			this.displayModal('You Lose!', 'Too many moves');
			this.prependMove('lose');
			this.endTurn();
		}
	}

	removeEvents() {
		$('.undo').off();
		$('#hint').off();
		$('.draw-pile').off();
		$('.undo').css('opacity', '50%');
		$('#hint').css('opacity', '50%');
	}

	attachEventsToBoard() {
		let spider_self = this;

		if (!this.browser_active){
			return;
		}

		//Just in case
		this.removeEvents();

		//Undo last move
		if (this.moves.length > 0) {
			$('.undo').css('visibility', 'visible');
			$('.undo').css('opacity', '100%');
		} else {
			$('.undo').css('visibility', 'hidden');
		}

		$('.undo').on('click', function () {
			spider_self.removeEvents();
			spider_self.updateScore();
			spider_self.undoMove();
		});

		//Deal another round of cards

		$('.draw-pile').on('click', async function () {
			if (spider_self.moves.length == 0 && spider_self.hints.length > 0) {
				let c = await sconfirm('Deal without making any moves?');
				if (!c) {
					return;
				}
			}

			$('.gameboard').removeClass('nomoves');

			if (spider_self.game.state.draws_remaining > 0) {
				if (spider_self.canDraw()) {
					spider_self.removeEvents();
					spider_self.updateScore();
					spider_self.prependMove('draw');
					spider_self.endTurn();
				} else {
					spider_self.displayWarning(
						'Invalid Move',
						'You cannot deal with open slots!'
					);
				}
			} else {
				spider_self.prependMove('lose');
				spider_self.endTurn();
			}
		});

		for (let i = 0; i < 10; i++) {
			if (this.loadGamePreference('spider-play-mode') == 'auto') {
				this.cardStacks[i].applyFilter(
					this.canSelectAndMoveStack.bind(this),
					this.pickAndMoveStack.bind(this),
					false
				);
			} else {
				this.cardStacks[i].applyFilter(
					this.canSelectStack.bind(this),
					this.pickUpStack,
					false
				);
			}
		}

		if (this.hints?.length > 0) {
			$('#hint').css('visibility', 'visible');
			$('#hint').css('opacity', '100%');
			$('.gameboard').removeClass('nomoves');

			$('#hint').on('click', () => {
				this.removeEvents();
				let next_hint = this.hints.shift();
				this.hints.push(next_hint);
				this.displayBoard();
				if (!document.getElementById('helper')) {
					this.app.browser.addElementToSelector(
						`<div id="helper" class="cardstack animated_elem"></div>`,
						'.gameboard'
					);
				}

				this.invisible_scaffolding.push('dummy');
				this.cardStacks[next_hint.target].push('dummy');

				const helper = document.getElementById('helper');

				let divname =
					'#cardstack_' + next_hint.source + '_' + next_hint.index;

				let first_in_stack = document.querySelector(divname);
				let offset = parseInt(first_in_stack.style.top);
				$('#helper').css({
					top: first_in_stack.getBoundingClientRect().y,
					left: first_in_stack.getBoundingClientRect().x
				});

				helper.style.zIndex = 100;

				this.animationSpeed = 750;

				let as = `${this.animationSpeed / 1000}s`;
				helper.style.transition = `left ${as}, top ${as}, width ${as}, height ${as}`;

				for (
					let i = next_hint.index;
					i < this.cardStacks[next_hint.source].getCardCount();
					i++
				) {
					divname = '#cardstack_' + next_hint.source + '_' + i;
					let elem = document.querySelector(divname);
					elem.style.top = `${parseInt(elem.style.top) - offset}px`;
					helper.append(elem);
				}

				this.moveGameElement(
					'helper',
					this.cardStacks[next_hint.target].getTopCardElement(),
					{},
					() => {
						this.cardStacks[next_hint.target].pop();
						this.invisible_scaffolding = [];
						$('#helper').remove();
						this.cardStacks[next_hint.source].render();
						this.attachEventsToBoard();
					}
				);
			});
		} else {
			$('#hint').css('visibility', 'hidden');
			$('.gameboard').addClass('nomoves');
		}
	}

	calculateHints() {
		//Build hints
		this.hints = [];
		for (let i = 0; i < 10; i++) {
			//Get the maximum stack
			let last_card = this.cardStacks[i].getTopCardValue();
			if (!last_card) {
				continue;
			}
			let suit = last_card[0];
			let value = parseInt(last_card.substring(1));
			let stack_index = this.cardStacks[i].getCardCount() - 1;
			for (let j = stack_index - 1; j >= 0; j--) {
				let next_card = this.cardStacks[i].cards[j];
				if (
					parseInt(next_card.substring(1)) == ++value &&
					next_card[0] == suit
				) {
					stack_index--;
				} else {
					break;
				}
			}

			//Requery value
			value =
				parseInt(this.cardStacks[i].cards[stack_index].substring(1)) +
				1;

			// stack_index will be the depth of the maximum selectable substack from this stack
			// now we see if and where we can place it
			for (let j = 0; j < 10; j++) {
				if (j == i) {
					continue;
				}
				let bottom_card = this.cardStacks[j].getTopCardValue();
				if (
					!bottom_card ||
					parseInt(bottom_card.substring(1)) == value
				) {
					this.hints.push({
						source: i,
						target: j,
						index: stack_index
					});
				}
			}
		}
	}

	canSelectStack(card_index, stack) {
		if (card_index == -1) {
			return false;
		}

		let card = stack.cards[card_index];
		let suit = card[0];

		//card must already be flipped over
		if (this.isFaceDown(card)) {
			return false;
		}

		let value = parseInt(card.slice(1));

		for (let i = card_index + 1; i < stack.cards.length; i++) {
			if (stack.cards[i][0] !== suit) {
				return false;
			}

			let temp_value = parseInt(stack.cards[i].slice(1));
			if (temp_value !== --value) {
				return false;
			}
		}

		return true;
	}

	canPlaceStack(card_index, stack) {
		if (card_index === -1) {
			return true;
		}

		let card = stack.cards[card_index];
		let spider_self = stack.mod;
		let moving_card = spider_self.selected_stack[0];
		let moving_card_number = parseInt(moving_card.slice(1));

		let number = parseInt(card.slice(1));

		if (this.isFaceDown(moving_card)) {
			return false;
		}

		if (number == moving_card_number + 1) {
			return true;
		}

		return false;
	}

	canSelectAndMoveStack(card_index, stack) {
		if (this.canSelectStack(card_index, stack)) {
			let card = stack.cards[card_index];
			let spider_self = stack.mod;

			for (let i = 0; i < 10; i++) {
				if (spider_self.cardStacks[i].getCardCount() > 0) {
					let bottom_card =
						spider_self.cardStacks[i].getTopCardValue();

					let value1 = parseInt(bottom_card.slice(1));
					let value2 = parseInt(card.slice(1));

					if (value1 == value2 + 1) {
						return true;
					}
				} else {
					//Can move on to blank spot
					return true;
				}
			}
		}

		return false;
	}

	pickAndMoveStack(activated_card_stack, card_index, event) {
		let spider_self = activated_card_stack.mod;

		let stack_to_move = activated_card_stack.cards.slice(card_index);

		const sameStack = (stack_to_move) => {
			if (!spider_self.selected_stack) {
				return false;
			}
			if (spider_self.moves.length == 0) {
				return false;
			}

			let lastMove = spider_self.moves[0].split('\t');
			if (lastMove[0] == 'flip') {
				lastMove = spider_self.moves[1].split('\t');
			}
			//Check move meta data first that we are clicking where the last move landed
			if (
				activated_card_stack.name == lastMove[2] &&
				parseInt(lastMove[3]) == stack_to_move.length
			) {
				return true;
			}

			return false;
		};

		if (!sameStack(stack_to_move)) {
			spider_self.selected_stack = stack_to_move;
			spider_self.possible_moves = [];

			let card = activated_card_stack.cards[card_index];

			for (let i = 0; i < 10; i++) {
				if (parseInt(activated_card_stack.name) == i) {
					continue;
				}
				if (spider_self.cardStacks[i].getCardCount() == 0) {
					spider_self.possible_moves.push(i);
				} else {
					let bottom_card =
						spider_self.cardStacks[i].getTopCardValue();

					let value1 = parseInt(bottom_card.slice(1));
					let value2 = parseInt(card.slice(1));

					if (value1 == value2 + 1) {
						spider_self.possible_moves.push(i);
					}
				}
			}
			if (card_index > 0) {
				let card_above = activated_card_stack.cards[card_index - 1];

				let value1 = parseInt(card_above.slice(1));
				let value2 = parseInt(card.slice(1));

				if (value1 == value2 + 1) {
					spider_self.possible_moves.push(
						parseInt(activated_card_stack.name)
					);
				}
			}

			if (spider_self.possible_moves.length > 1) {
				spider_self.possible_moves.sort((a, b) => {
					if (a == parseInt(activated_card_stack.name)) {
						return 1;
					}
					if (b == parseInt(activated_card_stack.name)) {
						return -1;
					}

					let a_card = spider_self.cardStacks[a].getTopCardValue();
					let b_card = spider_self.cardStacks[b].getTopCardValue();

					if (
						b_card &&
						b_card[0] === card[0] &&
						(!a_card || a_card[0] !== card[0])
					) {
						return 1;
					}
					if (
						a_card &&
						a_card[0] === card[0] &&
						(!b_card || b_card[0] !== card[0])
					) {
						return -1;
					}

					if (!b_card && a_card) {
						return 1;
					}

					if (b_card && !a_card) {
						return -1;
					}

					return a - b;
				});
			}
		}

		let target = spider_self.possible_moves.shift();
		spider_self.possible_moves.push(target);

		for (let i = 0; i < 10; i++) {
			spider_self.cardStacks[i].removeFilter();
		}

		spider_self.moveStack(activated_card_stack.name, card_index, target);
	}

	moveStack(source, index, target) {
		index = parseInt(index);
		target = parseInt(target);
		source = parseInt(source);

		if (!document.getElementById('helper')) {
			this.app.browser.addElementToSelector(
				`<div id="helper" class="cardstack animated_elem"></div>`,
				'.gameboard'
			);
		}

		let card = this.cardStacks[source].cards[index];
		this.invisible_scaffolding.push(card);
		this.cardStacks[target].push(card);

		const helper = document.getElementById('helper');

		let divname = '#cardstack_' + source + '_' + index;

		let first_in_stack = document.querySelector(divname);
		let offset = parseInt(first_in_stack.style.top);
		$('#helper').css({
			top: first_in_stack.getBoundingClientRect().y,
			left: first_in_stack.getBoundingClientRect().x
		});

		helper.style.zIndex = 100;

		//>>>>>>>> Change the animation speed!
		this.animationSpeed = 450;

		let as = `${this.animationSpeed / 1000}s`; //Make it faster
		helper.style.transition = `left ${as}, top ${as}, width ${as}, height ${as}`;

		for (let i = index; i < this.cardStacks[source].getCardCount(); i++) {
			divname = '#cardstack_' + source + '_' + i;
			let elem = document.querySelector(divname);
			elem.style.top = `${parseInt(elem.style.top) - offset}px`;
			helper.append(elem);
		}

		this.removeEvents();
		this.moveGameElement(
			'helper',
			this.cardStacks[target].getTopCardElement(),
			{
				callback: () => {
					let stack_to_move =
						this.cardStacks[source].cards.splice(index);
					//drop the first card we already added
					stack_to_move.shift();
					//Concat the rest of the stack
					for (let card of stack_to_move) {
						this.cardStacks[target].cards.push(card);
					}
					this.commitMove(
						source + '_' + index,
						target,
						stack_to_move.length + 1
					);
				}
			},
			() => {
				this.invisible_scaffolding = [];
				$('#helper').remove();
				this.cardStacks[target].render();
				this.cardStacks[source].render();
				if (!this.checkStack(target)) {
					this.calculateHints();
					setTimeout(this.attachEventsToBoard.bind(this), 5);
				}
			}
		);
	}

	placeStack(activated_card_stack, card_index, event) {
		let spider_self = activated_card_stack.mod;
		for (let card of spider_self.selected_stack) {
			activated_card_stack.cards.push(card);
		}

		activated_card_stack.render();
		spider_self.selected_stack = [];
		$('#helper').remove();
	}

	pickUpStack(activated_card_stack, card_index, event) {
		let spider_self = activated_card_stack.mod;
		let af = null;

		spider_self.removeEvents();

		if (!document.getElementById('helper')) {
			spider_self.app.browser.addElementToSelector(
				`<div id="helper" class="cardstack"></div>`,
				'.gameboard'
			);
		}

		const helper = document.getElementById('helper');

		$('.gameboard').addClass('selection');

		//
		// Note: The cardstack element(s) has a top value so they make a stack, we style.top so that clicking
		// the 2 elment of the stack or the 20th element of the stack yield the same vertical offset
		//
		let offsetY =
			event.clientY -
			Math.round(
				event.currentTarget.getBoundingClientRect().y -
					parseInt(event.currentTarget.style.top)
			);
		let offsetX =
			event.clientX -
			Math.round(event.currentTarget.getBoundingClientRect().x);

		let xposition = event.clientX - offsetX + 5;
		let yposition = event.clientY - offsetY + 5;

		$('.gameboard').on('mousemove', function (e) {
			xposition = e.clientX - offsetX;
			yposition = e.clientY - offsetY;
		});

		const animate = () => {
			$('#helper').css({ top: yposition, left: xposition });
			af = requestAnimationFrame(animate);
		};

		animate();

		//Move card stack cards into helper
		for (let i = card_index; i < activated_card_stack.cards.length; i++) {
			let divname = '#cardstack_' + activated_card_stack.name + '_' + i;
			helper.append(document.querySelector(divname));
			//$("#helper").append($(divname));
		}

		spider_self.selected_stack =
			activated_card_stack.cards.splice(card_index);

		for (let i = 0; i < 10; i++) {
			////////////////////////
			// Move Card!
			///////////////////////
			spider_self.cardStacks[i].applyFilter(
				spider_self.canPlaceStack.bind(spider_self),
				async (target_card_stack) => {
					window.cancelAnimationFrame(af);
					let num_of_cards_to_move =
						spider_self.selected_stack.length;
					let top_card_to_move = `${activated_card_stack.name}_${card_index}`;

					spider_self.placeStack(target_card_stack);
					await spider_self.commitMove(
						top_card_to_move,
						target_card_stack.name,
						num_of_cards_to_move
					);
					if (!spider_self.checkStack(target_card_stack.name)) {
						spider_self.calculateHints();
						setTimeout(
							spider_self.attachEventsToBoard.bind(spider_self),
							20
						);
					}
				}
			);
		}

		activated_card_stack.applyFilter(
			() => {
				return true;
			},
			(param) => {
				window.cancelAnimationFrame(af);
				spider_self.placeStack(param);
				spider_self.attachEventsToBoard();
			}
		);
	}

	async commitMove(source, target, stackSize) {
		this.updateScore();
		this.prependMove(`move\t${source}\t${target}\t${stackSize}`);

		this.game.state.moves++;

		let key = await this.revealCard(source[0]);
		if (key) {
			this.prependMove(`flip\t${source[0]}\t${key}`);
		}
	}

	async revealCard(stackNum) {
		stackNum = parseInt(stackNum);

		//Reveal card under stack (if necessary)
		if (this.cardStacks[stackNum].getCardCount() > 0) {
			let topCard = this.cardStacks[stackNum].pop(false);
			//console.log("Reveal: " + topCard);
			if (this.isFaceDown(topCard)) {
				let realCard = this.game.deck[0].cards[topCard];
				//Save "decoded" card to game state
				this.cardStacks[stackNum].push(realCard, false);

				let card_to_reveal =
					this.cardStacks[stackNum].getTopCardElement();
				if (card_to_reveal) {
					card_to_reveal.innerHTML =
						this.returnCardImageHTML(realCard);
					await this.timeout(30);
					card_to_reveal.classList.remove('facedown');
					card_to_reveal.classList.add('faceup');
					await this.timeout(300);
				}

				return topCard;
			} else {
				this.cardStacks[stackNum].push(topCard, false);
			}
		}
		return null;
	}

	undoMove() {
		let mv = this.moves.shift().split('\t');
		console.log('Undo: ' + mv);
		if (mv[0] === 'flip') {
			let key = mv[2];
			let slot = parseInt(mv[1]);

			let card = this.cardStacks[slot].pop(false);
			this.cardStacks[slot].push(key);

			this.undoMove();
			return;
		}

		if (mv[0] == 'complete') {
			this.game.state.completed_stacks.pop();
			let slot = parseInt(mv[1]);
			for (let i = 13; i > 0; i--) {
				this.cardStacks[slot].push(`${mv[2]}${i}`);
			}
			this.undoMove();
			return;
		}

		let original_card_pos = mv[1];
		let slot = parseInt(mv[2]);
		let stackSize = parseInt(mv[3]);
		let oldstackNum = parseInt(original_card_pos[0]);

		let moved_cards = this.cardStacks[slot].cards.splice(-stackSize);

		for (let card of moved_cards) {
			this.cardStacks[oldstackNum].cards.push(card);
		}

		this.game.state.moves++;
		this.displayBoard();
		this.calculateHints();
		this.attachEventsToBoard();
	}

	/*
    Check if we have completed a stack
  */
	checkStack(stackNum) {
		if (this.cardStacks[stackNum].getCardCount() < 13) {
			return false;
		}

		let tempStack = [];
		let success = true;

		let lastCard = this.cardStacks[stackNum].cards.slice(-1)[0];
		let suit = lastCard[0];

		for (let i = 1; i <= 13 && success; i++) {
			let card = this.cardStacks[stackNum].pop(false);
			tempStack.push(card);

			if (this.isFaceDown(card)) {
				success = false;
				break;
			}
			if (suit !== card[0]) {
				success = false;
				break;
			}
			if (parseInt(card.substring(1)) != i) {
				success = false;
				break;
			}
		}

		//Put the cards back
		if (!success) {
			while (tempStack.length > 0) {
				card = tempStack.pop();
				this.cardStacks[stackNum].push(card, false);
			}
			return false;
		} else {
			this.updateScore(50);
			this.game.state.completed_stacks.push(suit);

			let numComplete = this.game.state.completed_stacks.length;

			this.prependMove(`complete\t${stackNum}\t${suit}`);

			$('.completed_stack_box').append(
				`<div id="cs${numComplete}" class="completed_stack"></div>`
			);

			let depth = this.cardStacks[stackNum].getCardCount();

			for (let i = 0; i < 13; i++) {
				this.animationSequence.unshift({
					callback: this.moveGameElement,
					params: [
						this.copyGameElement(
							`#cardstack_${stackNum}_${depth + i}`
						),
						`#cs${numComplete}`,
						{ resize: 1, insert: 1 }
					]
				});
			}

			this.animationSequence.unshift({
				callback: () => {
					this.cardStacks[stackNum].render();
				},
				params: null
			});

			this.animationSequence.push({
				callback: () => {
					setTimeout(async () => {
						this.displayBoard();
						$('.animated_elem').remove();
						this.halted = 0;
						let temp = await this.revealCard(stackNum);
						if (temp) {
							this.prependMove(`flip\t${stackNum}\t${temp}`);
						}

						if (this.game.state.completed_stacks.length == 8) {
							this.prependMove('win');
							this.endTurn();
						} else {
							this.calculateHints();
							this.attachEventsToBoard();
						}
					}, 1000);
				},
				params: null
			});

			this.runAnimationQueue(100);
			return true;
		}
	}

	canDraw() {
		for (let i = 0; i < 10; i++) {
			if (this.cardStacks[i].getCardCount() == 0) {
				return false;
			}
		}
		return true;
	}

	isFaceDown(card) {
		if (
			card[0] == 'S' ||
			card[0] == 'C' ||
			card[0] == 'H' ||
			card[0] == 'D'
		)
			return false;
		else return true;
	}

	handleGameLoop(msg = null) {
		let spider_self = this;

		this.saveGame(this.game.id);
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;

			if (mv[0] === 'lose') {
				this.game.queue.splice(qe, 1);
				let final_score = 0;
				if (this.game.state.moves > 0) {
					console.log('Process loss');
					this.game.state.session.round++;
					this.game.state.session.losses++;
					final_score = this.game.state.score;
					this.game.state.scores.push(final_score);
				}
				this.newRound();
				if (final_score > 0) {
					this.game.queue.push(
						`ROUNDOVER\t${JSON.stringify(
							[]
						)}\t${final_score}\t${JSON.stringify([this.publicKey])}`
					);
				}

				return 1;
			}

			if (mv[0] === 'win') {
				this.game.queue.splice(qe, 1);
				this.game.state.session.round++;
				this.game.state.session.wins++;
				this.animateFinalVictory();
				let final_score = this.game.state.score + 400;
				this.game.state.scores.push(final_score);
				this.overlay.show(this.returnStatsHTML('Winner!'), () => {
					this.newRound();
					this.game.queue.push(
						`ROUNDOVER\t${JSON.stringify([
							this.publicKey
						])}\t${final_score}\t${JSON.stringify([])}`
					);
					$('.completed_card').remove();
					this.restartQueue();
				});
				return 0;
			}

			if (mv[0] === 'draw') {
				this.game.state.draws_remaining--;
				this.game.queue.splice(qe, 1);
				this.game.queue.push(`DEAL\t1\t1\t10`);
			}

			/*
        Build the board from the shuffled deck
      */
			if (mv[0] === 'play') {
				if (this.browser_active) {
					/* We want to deal the cards onto the table, each stack is an array*/
					let indexCt = 0;

					console.log('play');
					this.displayBoard();

					if (this.game.deck[0].hand.length == 0) {
						this.calculateHints();
						this.attachEventsToBoard();
						return 0;
					}

					console.log('Animate card deal');

					$('.empty_slot').remove();

					this.animationSpeed = 900;

					while (this.game.deck[0].hand.length > 0) {
						let card = this.game.deck[0].hand.pop();

						this.invisible_scaffolding.push(card);
						this.cardStacks[indexCt].push(card);

						this.animationSequence.push({
							callback: this.moveGameElement,
							params: [
								this.createGameElement(
									`<img class="cardBack" src="/spider/img/cards/red_back.png"/>`,
									'.draw-pile'
								),
								`#cardstack_${indexCt}_${
									this.cardStacks[indexCt].getCardCount() - 1
								}`,
								{ resize: 1, insert: 1 }
							]
						});

						indexCt = (indexCt + 1) % 10;
					}

					this.animationSequence.push({ delay: 200, params: null });
					this.animationSequence.push({
						callback: this.displayBoard,
						params: null
					});

					//Flip bottom row
					for (let i = 0; i < 10; i++) {
						this.animationSequence.push({
							callback: this.revealCard,
							params: [i]
						});

						//Set our saveable state to a reference of the cardstacks array
						this.game.state.board[i] = this.cardStacks[i].cards;
					}

					this.animationSequence.push({
						callback: this.finishAnimation,
						params: null
					});

					this.runAnimationQueue(120);
				}
				return 0;
			}

			if (mv[0] === 'flip') {
				this.game.queue.splice(qe, 1);
				if (this.game.player !== 1) {
					this.displayBoard();
					this.revealCard(mv[1]);
				}
			}

			if (mv[0] === 'complete') {
				this.game.queue.splice(qe, 1);
				let slot = parseInt(mv[1]); //rowX_slotY
				if (this.game.player !== 1) {
					for (let i = 0; i < 13; i++) {
						this.cardStacks[slot].pop();
					}
				}
			}

			if (mv[0] === 'move') {
				this.game.queue.splice(qe, 1);
				let card = mv[1]; //rowX_slotY
				let emptySlot = mv[2]; //rowX_slotY

				if (this.game.player !== 1) {
					//this.moveStack(card, emptySlot);
					this.game.state.moves++;
				}
			}

			return 1;
		}
		return 0;
	}

	async animateFinalVictory() {
		$('.card.completed_card').css('width', '100px');
		$('.gameboard').append($('.card.completed_card'));

		let cards = document.querySelectorAll('.card.completed_card');
		let max_x = window.innerWidth - 50;
		let max_y = window.innerHeight - 100;

		for (let i = 0; i < cards.length; i++) {
			cards[i].style.left = Math.floor(Math.random() * max_x) + 25;
			cards[i].style.top = Math.floor(Math.random() * max_y) + 50;
			await this.timeout(50);
		}
	}

	finishAnimation() {
		setTimeout(() => {
			console.log('Animation finished');
			$('.animated_elem').remove();
			this.restartQueue();
		}, 400);
	}

	returnBoard() {
		let html = `<div class="card-stack-array">`;
		for (let i = 0; i < 10; i++) {
			html += `<div id="cardstack_${i}"></div>`;
		}
		html += '</div>';
		html += `<div class="spider-footer">
              <div class="completed_stack_box"></div>
              <div class="icon_container">
                <div id="hint" class="hint"><i class="fa-solid fa-question fa-border"></i></div>
                <div class="undo"><i class="fas fa-undo fa-border"></i></div>
              </div>
              <div class="draw-pile">New Game</div>
            </div>
            `;
		return html;
	}

	async changeDifficulty(dif) {

		let old_dif = this.loadGamePreference("spider-difficulty");
		this.saveGamePreference("spider-difficulty", dif);

		if (!this.browser_active){
			return;
		}

		if (dif == 'easy') {
			this.difficulty = 1;
		} else if (dif == 'hard') {
			this.difficulty = 4;
		} else {
			this.difficulty = 2;
		}

		if (this.game.deck.length && dif !== old_dif) {
			let c = await sconfirm("Abandon this game?");
			if (c) {
				this.game.queue.push('lose');
				this.endTurn();
			}
		}
	}

	displayBoard() {
		console.log('REFRESH BOARD');
		if (this.browser_active == 0) {
			return;
		}

		//Don't load card images...
		this.invisible_scaffolding = [];

		for (let i = 0; i < 10; i++) {
			this.cardStacks[i].render();
		}

		let html = '';

		let dp = document.querySelector('.draw-pile');
		if (dp) {
			if (this.game.state.draws_remaining > 0) {
				dp.style.backgroundImage =
					'url(/spider/img/cards/red_back.png)';
				html = `<div>${this.game.state.draws_remaining}</div><div>Deal${
					this.game.state.draws_remaining > 1 ? 's' : ''
				}</div>`;
			} else {
				dp.style.backgroundImage = 'unset';
				html = '<span>Start</span><span>New</span><span>Game</span>';
			}
			dp.innerHTML = html;
		}

		//Completed stacks
		html = '';
		for (let i = 0; i < this.game.state.completed_stacks.length; i++) {
			html += `<div class="completed_stack">`;
			for (let j = 0; j < 13; j++) {
				html += `<div class="card-slot faceup" style="position:absolute;right:${j}px;bottom:${j}px">${this.returnCardImageHTML(
					this.game.state.completed_stacks[i] + (j + 1)
				)}</div>`;
			}
			html += '</div>';
		}

		document.querySelector('.completed_stack_box').innerHTML = html;
	}

	returnState() {
		let state = super.returnState();

		state.moves = 0;
		state.score = 100 * this.difficulty;
		state.recycles_remaining = 5;

		state.completed_stacks = [];
		state.board = [];

		state.scores = [];

		//    for (let i = 0; i < 10; i++) {
		//      state.board.push([]);
		//    }

		return state;
	}

	returnCardImageHTML(name) {
		if (
			this.invisible_scaffolding &&
			this.invisible_scaffolding.includes(name)
		) {
			return '';
		}

		if (!this.isFaceDown(name)) {
			return `<img class="cardFront" src="/spider/img/cards/${name}.png" />
              <img class="cardBack" src="/spider/img/cards/red_back.png" />`;
		} else {
			return '<img src="/spider/img/cards/red_back.png" />';
		}
	}

	returnDeck(numSuits) {
		let suits = ['S', 'D', 'C', 'H'];
		var deck = {};
		/* WTF is with this indexing system??? */
		//2-10 of each suit, with indexing gaps on the 1's
		let index = 1;
		let numLoops = 104 / (13 * numSuits);

		for (let k = 0; k < numLoops; k++) {
			for (let i = 0; i < numSuits; i++) {
				for (let j = 1; j <= 13; j++) {
					deck[index.toString()] = suits[i] + j;
					index++;
				}
			}
		}

		return deck;
	}

	preloadImages() {
		let suits = ['S', 'D', 'C', 'H'];

		var allImages = [];
		for (let i = 0; i < this.difficulty; i++) {
			for (let j = 1; j <= 13; j++) {
				allImages.push(suits[i] + j);
			}
		}
		this.preloadImageArray(allImages, 0);
	}

	preloadImageArray(imageArray, idx = 0) {
		let pre_images = [imageArray.length];

		if (imageArray && imageArray.length > idx) {
			pre_images[idx] = new Image();
			pre_images[idx].onload = () => {
				this.preloadImageArray(imageArray, idx + 1);
			};
			pre_images[idx].src =
				'/spider/img/cards/' + imageArray[idx] + '.png';
		}
	}

	  hasSettings() {
	    return true;
	  }


	loadSettings(container = null) {
	    if (!container){
	      this.overlay.show(`<div class="module-settings-overlay"><h2>Spider Solitaire Settings</h2></div>`);
	      container = ".module-settings-overlay";
	    }

		let as = new AppSettings(this.app, this, container);
		as.render();
	}

}

module.exports = Spider;
