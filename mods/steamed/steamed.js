const GameTemplate = require('../../lib/templates/gametemplate');
const GameRulesTemplate = require('./lib/game-rules.template');
const GameOptionsTemplate = require('./lib/game-options.template');
const htmlTemplate = require('./lib/game-html.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Steamed extends GameTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'Steamed';
		this.slug = 'steamed';
		this.gamename = 'Steam Bonanza';

		this.description = `Win the industrial revolution by building and liquidating factories in an open source clone of Bohnanza`;
		this.status = 'Alpha';

		this.card_height_ratio = 1.5;

		this.interface = 1; //Display card graphics
		this.minPlayers = 2;
		this.maxPlayers = 2;

		this.slug = this.name.toLowerCase();
		this.card_img_dir = `/${this.slug}/img/cards/`;
		this.categories = 'Games Cardgame Tactical';
		this.factory = this.returnFactoryRules();
	}

	returnWelcomeOverlay() {
		let html = `<div id="welcome_overlay" class="welcome_overlay splash_overlay rules-overlay">
           <img src="/${this.name.toLowerCase()}/img/splash_welcome.jpg"/>
               </div>`;

		return html;
	}

	async render(app) {
		if (!this.browser_active) {
			return;
		}
		if (this.initialize_game_run) {
			return;
		}

		await this.injectGameHTML(htmlTemplate());

		await super.render(app);

		this.menu.addMenuOption('game-game', 'Game');

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

		$('.score_card').css('background-image', `url('${this.card_img_dir}SB_reward.png')`);
	}

	////////////////
	// initialize //
	////////////////
	initializeGame(game_id) {
		if (this.game.status != '') {
			this.updateStatus(this.game.status);
		}

		//
		// initialize
		//
		if (!this.game.state) {
			this.game.state = {};
			Object.assign(this.game.state, this.returnState());
			this.game.tutorial = this.returnTutorial();

			console.log('\n\n\n\n');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('------ INITIALIZE GAME ----');
			console.log(`-----------${this.name}----------`);
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('\n\n\n\n');

			this.updateStatus("<div class='status-message'>Generating the Game</div>");

			this.game.queue = [];
			this.game.queue.push(`turn\t1`);
			this.game.queue.push('READY');

			//Main Deck
			this.game.queue.push('deal');
			this.game.queue.push('SIMPLEDEAL\t5\t1\t' + JSON.stringify(this.returnCards()));
		}
	}

	//
	// Core Game Logic
	//
	handleGameLoop() {
		let we_self = this;

		this.saveGame(this.game.id);

		console.log(JSON.parse(JSON.stringify(this.game.state)));

		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			this.displayAll();
			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

	 /*
      Copy players hand into state.hand
      */
			if (mv[0] == 'deal') {
				this.game.queue.splice(qe, 1);

				for (let i = this.game.deck[0].hand.length; i > 0; i--) {
					let card = this.game.deck[0].hand.pop();
					card = this.game.deck[0].cards[card].type;
					this.game.state.hand.unshift(card);
					if (this.gameBrowserActive()) {
						this.animationSequence.push({
							callback: this.moveGameElement,
							params: [
								this.createGameElement(this.twoSidedCard(card), '#draw_deck'),
								`#cardfan`,
								{
									callback: (id) => {
										$(`#${id} .flipped`).removeClass('flipped');
										$(`#${id}`)
											.css('z-index', `${i}`)
											.css('transform', `rotate(${10 * i - 40}deg) translateX(${50 * i - 150}px)`);
									}
								},
								() => {
									console.log('Next card');
									this.finishAnimation(500);
								}
							]
						});
					}
				}

				//Animate the draw
				if (this.gameBrowserActive() && this.animationSequence.length > 0) {
					this.runAnimationQueue();
					return 0;
				}

				return 1;
			}

			if (mv[0] == 'turn') {
				if (!this.gameBrowserActive()) {
					return 0;
				}

				//For the beginning of the game only...
				/*if (this.game.state.welcome == 0) {
					try {
						this.overlay.show(this.returnWelcomeOverlay());
						document.querySelector('.welcome_overlay').onclick =
							() => {
								this.overlay.hide();
							};
					} catch (err) {}
					this.game.state.welcome = 1;
				}*/

				this.displayAll();

				let player = parseInt(mv[1]);

				this.game.queue.splice(qe, 1);

				this.game.queue.push('checkgameover\t' + mv[1]);
				this.game.queue.push('deal');
				this.game.queue.push(`DEAL\t1\t${mv[1]}\t2`);
				this.game.queue.push('phase\t' + mv[1]);
				this.game.queue.push('draw_offer');
				this.game.queue.push('POOLDEAL\t1\t3\t1');
				this.game.queue.push('phase\t' + mv[1]);
				this.game.queue.push('flush_market');
				if (this.game.state.market.length > 0) {
					this.game.queue.push('phase\t' + mv[1]);
				}

				this.game.state.planted = -1;
				this.game.state.discarded = false;

				return 1;
			}

			if (mv[0] === 'gameover') {
				this.game.queue.splice(qe, 1);
				$('#opponent').remove();
				$('#self .field_slot').css('display', 'none');
				$('.status').css('width', '');
				$('.cardfan').fadeOut();

				let i_won = false;
				if (this.game.state.gold[0] == this.game.state.gold[1]) {
					if (this.game.player == 2) {
						i_won = true;
					}
					this.sendGameOverTransaction(this.game.players[1], 'Second Player wins tie');
				}
				if (this.game.state.gold[0] > this.game.state.gold[1]) {
					i_won = true;
					this.sendGameOverTransaction(this.game.players[this.game.player - 1], 'High Score');
				} else {
					this.sendGameOverTransaction(this.game.players[2 - this.game.player], 'High Score');
				}
				this.updateLog(`The Game is over and I ${i_won ? 'won' : 'lost'}!`);
				return 0;
			}

			if (mv[0] == 'checkgameover') {
				this.removeEvents();
				this.game.queue.splice(qe, 1);
				if (this.game.deck[0].crypt.length == 0) {
					if (this.gameBrowserActive()){
						$('.active').removeClass('active');
						$('.status').css('display', 'block');
						$('.offer').fadeOut();
					}
					this.updateStatus(
						"<div class='status-message'>Liquidating remaining factories to tally final score</div>"
					);
					this.game.queue.push('gameover');
					this.game.queue.push(`liquidate\t1\t1`);
					this.game.queue.push(`liquidate\t1\t2`);
					this.game.queue.push(`liquidate\t1\t3`);
					this.game.queue.push(`liquidate\t2\t1`);
					this.game.queue.push(`liquidate\t2\t2`);
					this.game.queue.push(`liquidate\t2\t3`);
				} else {
					this.game.queue.push('turn\t' + this.returnNextPlayer(parseInt(mv[1])));
				}
				return 1;
			}

			if (mv[0] === 'phase') {
				let player = parseInt(mv[1]);

				if (this.game.player == player) {
					this.playerTurn();
				} else {
					this.removeEvents();
					this.updateStatus(`<div class='status-message'>Opponent making their moves...</div>`);
				}

				$('.active').removeClass('active');
				if (this.game.player === player) {
					$('#self').addClass('active');
				} else {
					$('#opponent').addClass('active');
				}

				return 0;
			}

			if (mv[0] === 'flush_market') {
				this.game.queue.splice(qe, 1);
				let message = '';
				while (this.game.state.market.length > 0) {
					let card = this.game.state.market.shift();
					message += card + ', ';
					this.game.state.discards.push(card);
				}

				this.game.state.planted = 0;
				console.log(JSON.stringify(this.game.state.discards));

				if (message) {
					message = message.substring(0, message.length - 2);
					this.updateLog(message + ' are discarded from the offers.');
					Array.from(document.querySelectorAll('.offer img')).forEach(async (c) => {
						this.animationSequence.push({
							callback: this.moveGameElement,
							params: [
								this.copyGameElement(c),
								'#discards',
								{ resize: 1 },
								() => {
									this.finishAnimation();
								}
							]
						});
					});
					this.runAnimationQueue(250);
				} else {
					return 1;
				}

				return 0;
			}

			if (mv[0] === 'draw_offer') {
				this.game.queue.splice(qe, 1);
				this.game.state.planted = 3;
				this.dealCard();
				return 0;
			}

			// A slight variation of the resolve command
			if (mv[0] === 'continue') {
				//Remove the "continue"
				this.game.queue.pop();

				//Remove the next step
				let nextMove = this.game.queue.pop();

				if (nextMove.slice(0, 5) !== 'phase') {
					console.warn('Unexpected queue order for CONTINUE', nextMove);
					this.game.queue.push('continue');
					this.game.queue.push(nextMove);
				}

				return 1;
			}

			if (mv[0] === 'plant') {
				let player = parseInt(mv[1]);
				let card = mv[2];
				let slot = parseInt(mv[3]);
				let source = mv[4];

				this.game.queue.splice(qe, 1);

				this.updateLog(
					`${this.game.player == player ? 'You build' : 'Your Opponent builds'} a ${card} factory`
				);

				if (this.game.player !== player) {
					this.game.state.opponent[slot].push(card);

					if (source === 'market') {
						this.moveGameElement(
							this.copyGameElement(`.offer .card[data-id="${card}"]`),
							`#o${slot + 1}`,
							{ insert: 1 },
							() => {
								this.finishAnimation();
							}
						);
						for (let i = 0; i < this.game.state.market.length; i++) {
							if (this.game.state.market[i] == card) {
								this.game.state.market.splice(i, 1);
								break;
							}
						}
					} else {
						$(this.cardToHTML(card))
							.hide()
							.appendTo(`#o${slot + 1}`)
							.slideDown(1500, () => {
								this.finishAnimation();
							});
					}
					this.halted = 1;
					return 0;
				}

				return 1;
			}

			if (mv[0] === 'discard') {
				let player = parseInt(mv[1]);

				this.game.queue.splice(qe, 1);
				let card = mv[2];

				//So only allow one discard
				this.game.state.discarded = true;

				this.game.state.discards.push(card);

				if (this.game.player !== player) {
					$(this.cardToHTML(card))
						.hide()
						.appendTo(`#discards`)
						.slideDown(1500, () => {
							this.finishAnimation();
						});
					this.halted = 1;
					return 0;
				}
				return 1;
			}

			if (mv[0] === 'liquidate') {
				let player = parseInt(mv[1]);
				let slot = parseInt(mv[2]) - 1; //ID from clicking field
				this.game.queue.splice(qe, 1);
				let steamSelf = this;
				let gold = this.calculateProfit(player, slot);

				if (gold < 0){
					return 1;
				}

				//$("#deal").children().animate({left: "1000px"}, 1200, "swing", function(){$(this).remove();});
				let children = [];
				let destination = '';

				if (this.game.player === player) {
					this.updateLog(
						`You sell ${this.game.state.self[slot].length} ${this.game.state.self[slot][0]} factories for ${gold} gold.`
					);
					for (let i = gold; i < this.game.state.self[slot].length; i++) {
						this.game.state.discards.push(this.game.state.self[slot][0]);
					}

					if (document.querySelector(`#s${mv[2]} div.field_slot`)) {
						document.querySelector(`#s${mv[2]} div.field_slot`).remove();
						$(
							this.cardToHTML(
								this.game.state.self[slot][0],
								10 * (this.game.state.self[slot].length - 1)
							)
						).appendTo(`#s${mv[2]}`);
					}

					this.game.state.self[slot] = [];

					children = document.querySelectorAll(`#s${mv[2]} img.card`);
					destination = '#my_score';
				} else {
					this.updateLog(
						`Your opponent sells ${this.game.state.opponent[slot].length} ${this.game.state.opponent[slot][0]} factories for ${gold} gold.`
					);
					for (let i = gold; i < this.game.state.opponent[slot].length; i++) {
						this.game.state.discards.push(this.game.state.opponent[slot][0]);
					}

					if (document.querySelector(`#o${mv[2]} div.field_slot`)) {
						document.querySelector(`#o${mv[2]} div.field_slot`).remove();
						$(
							this.cardToHTML(
								this.game.state.opponent[slot][0],
								10 * (this.game.state.opponent[slot].length - 1)
							)
						).appendTo(`#s${mv[2]}`);
					}
					this.game.state.opponent[slot] = [];

					children = document.querySelectorAll(`#o${mv[2]} img.card`);
					destination = '#opponent_score';
				}

				for (let i = 0; i < children.length; i++) {
					children[i].id = `c${i}`;
					console.log(JSON.stringify(children[i]));
					if (i < gold) {
						this.animationSequence.unshift({
							callback: this.moveGameElement,
							params: [
								this.copyGameElement(`#c${i}`),
								destination,
								{ resize: 1 },
								() => {
									console.log('Discard2');
									this.finishAnimation();
								}
							]
						});
					} else {
						this.animationSequence.unshift({
							callback: this.moveGameElement,
							params: [
								this.copyGameElement(`#c${i}`),
								`#discards`,
								{ resize: 1 },
								() => {
									console.log('Discard1');
									this.finishAnimation();
								}
							]
						});
					}
				}

				this.game.state.gold[Math.abs(this.game.player - player)] += gold;

				this.runAnimationQueue();

				return 0;
			}

			return 1;
		} // if cards in queue

		return 0;
	}

	async finishAnimation(delay = 0) {
		//this.displayAll();
		console.log(
			'Kickstarting the queue:',
			this.animation_queue.length,
			this.animationSequence.length
		);
		if (this.animation_queue.length + this.animationSequence.length === 0) {
			if (delay) {
				await this.timeout(delay);
			}
			this.restartQueue();
		} else {
			console.log("Nevermind, let's wait a bit");
		}
	}

	dealCard() {
		if (this.game.pool[0].hand.length == 0) {
			this.runAnimationQueue();
			return 1;
		}

		$('#draw_deck').html('');
		let newCard = this.game.pool[0].hand.pop();
		newCard = this.game.deck[0].cards[newCard].type;
		console.log(`Add ${newCard} to market`);
		this.game.state.market.push(newCard);

		$(`<div class="slot_holder" id="sh${this.game.state.market.length}"></div>`).appendTo('.offer');

		this.animationSequence.push({
			callback: this.moveGameElement,
			params: [
				this.createGameElement(this.twoSidedCard(newCard), '#draw_deck'),
				`#sh${this.game.state.market.length}`,
				{
					callback: (id) => {
						$(`#${id} .flipped`).removeClass('flipped');
					}
				},
				() => {
					console.log('Hello');
					this.finishAnimation();
				}
			]
		});

		this.checkNextDiscard();

		return 0;
	}

	checkNextDiscard() {
		if (this.game.state.discards.length > 0) {
			let used = false;
			let discardedCard = this.game.state.discards.pop();
			for (let card of this.game.state.market) {
				if (card === discardedCard) {
					used = true;
					break;
				}
			}

			if (used) {
				this.game.state.market.push(discardedCard);

				$(`<div class="slot_holder" id="sh${this.game.state.market.length}"></div>`).appendTo(
					'.offer'
				);
				this.animationSequence.push({
					callback: this.moveGameElement,
					params: [
						this.copyGameElement('#discards img:last-child'),
						`#sh${this.game.state.market.length}`,
						{ insert: 1, resize: 1 },
						() => {
							console.log('Hello2');
							this.finishAnimation();
						}
					]
				});

				this.checkNextDiscard();
				return;
			} else {
				this.game.state.discards.push(discardedCard);
			}
		}
		this.dealCard();
	}

	hasPlayableField() {
		let card = null;
		if (this.game.state.hand.length > 0) {
			card = this.game.state.hand[this.game.state.hand.length - 1];
		}

		for (let i = 0; i < 3; i++) {
			if (this.game.state.self[i].length == 0) {
				return true;
			} else if (this.game.state.self[i][0] === card) {
				return true;
			}
		}
		return false;
	}

	canLiquidate() {
		for (let i = 0; i < 3; i++) {
			if (this.game.state.self[i].length > 0) {
				return true;
			}
		}
		return false;
	}

	playerTurn() {
		let html = `<div class="status-message"><span>`;

		if (this.game.state.planted < 0) {
			html += 'Do you want any of the left over cards?';

			//If no offers available any more, just end the turn
			if (this.game.state.market.length == 0) {
				this.addMove('continue');
				this.endTurn();
				return;
			}
		} else if (this.game.state.planted == 0) {
			if (this.hasPlayableField()) {
				html += `Build the first plant from your hand (mandatory)`;
			} else {
				html += 'You must liquidate a factory so you can start a new plant';
			}
		} else if (this.game.state.planted == 1) {
			if (!this.game.state.discarded){
				html += `Build the next plant, delete any, or skip`;	
			}else{
				html += `Build the next plant, or continue`;	
			}
			
		} else if (this.game.state.market.length > 0) {
			html += `Build any available offers or leave them for your opponent`;
		} else if (this.game.state.planted == 2) {
			html += `Sell${!this.game.state.discarded? ", trash,":""} or deal 3 new offers from the deck..`;
		} else {
			html += `Sell a stack or end your turn`;
		}

		html += `</span></div>`;

		if (
			this.game.state.planted >= 1 &&
			this.game.state.planted <= 2 &&
			!this.game.state.discarded
		) {
			$('#discard').css('visibility', 'visible');
		} else {
			$('#discard').css('visibility', 'hidden');
		}


		//if (this.game.tutorial.show){
		//  this.showTutorial(this.game.state.planted.toString());
		//}

		this.updateStatus(html);
		this.attachBoardEvents();
	}

	attachBoardEvents() {
		let steamSelf = this;
		this.removeEvents();
		console.log('Attach board events');
		//
		//Define Helper Function
		//
		const plantCard = async (card, div = null) => {
			let openSlot = -1;
			let source = div ? 'market' : 'hand';

			//Check if you have started the factory
			for (let i = 2; i >= 0; i--) {
				if (this.game.state.self[i].length > 0) {
					if (this.game.state.self[i][0] == card) {
						openSlot = i;
						break;
					}
				} else {
					openSlot = i;
				}
			}

			//Failure condition
			if (openSlot === -1) {
				this.displayModal('You have no available fields to place that factory');

				if (div) {
					//this.game.state.market.push(card);
					for (let i = 0; i < this.game.state.market.length; i++) {
						if (!this.game.state.market[i]) {
							this.game.state.market[i] = card;
							break;
						}
					}
				} else {
					this.game.state.hand.push(card);
				}
				return;
			}

			if (!div) {
				this.game.state.planted++;
				div = document.querySelector(`#cardfan img:last-child`);
				div.style.transform = 'unset';
				await this.timeout(50);
			}

			this.game.state.self[openSlot].push(card);
			this.addMove(`plant\t${this.game.player}\t${card}\t${openSlot}\t${source}`);
			this.moveGameElement(
				this.copyGameElement(div),
				`#s${openSlot + 1}`,
				{ resize: 1, insert: 1 },
				() => {
					console.log('Sending move(s) to plant');
					this.endTurn();
				}
			);
			this.displayHand();
			this.attachBoardEvents();
		};


		if (this.game.state.planted >= 0 && this.game.state.planted < 2) {
			$('.cardfan img.card:last-child').addClass('active_element');

			let xpos, ypos;

			$('.cardfan img.card:last-child').on('mousedown', function (e) {
				xpos = e.clientX;
				ypos = e.clientY;
			});

			$('.cardfan img.card:last-child').on('mouseup', function (e) {
				if (Math.abs(xpos - e.clientX) > 4) {
					return;
				}
				if (Math.abs(ypos - e.clientY) > 4) {
					return;
				}

				plantCard(steamSelf.game.state.hand.pop());
			});
		}

		if (this.game.state.planted === 0) {
			$('.cardfan img.card:last-child').addClass('activated');
		}

		document.querySelectorAll('.offer img').forEach(c => {
			let type = c.dataset.id;
			console.log(type);
			for (let plot of this.game.state.self){
				if (plot.length == 0 || plot[0] == type){
					c.classList.add("active_element");
				}
			}
		})

		//$('.offer img').addClass('active_element');
		$('.offer img.active_element').on('click', function () {
			$(this).off();
			let card = $(this).attr('data-id');
			let id = $(this).attr('id').substring(2);
			console.log(id);
			steamSelf.game.state.market[parseInt(id)] = '';
			//steamSelf.game.state.market.splice(parseInt(id), 1);
			plantCard(card, this);
		});

		if (this.game.state.planted !== 0) {
			$('#forward').css('visibility', 'visible');
			$('#forward').addClass('active_element');
		}

		$('#forward').on('click', function () {
			if (steamSelf.game.state.planted !== 0) {
				steamSelf.removeEvents();
				$('#discard').css('visibility', 'hidden');
				steamSelf.dealCards();
			} else {
				steamSelf.displayModal('You have to build the first plant in your hand before moving on');
			}
		});

		/*
    We want to be a little selective so that we don't mislead users about where you can click (empty or otherwise unavailable to sell fields)
    But we attach a click event with the error message for the single card fields because users may want to click on it (despite the lack of hover action)
    and think the game is a mistake when there is actually an intentional rule preventing the action
    */
		for (let slot = 1; slot <= 3; slot++) {
			let field = `#s${slot}`;
			$(field).off();
			if (steamSelf.game.state.self[slot - 1].length > 0) {
				if (!steamSelf.isProtected(slot)) {
					$(field).addClass('active_element');
					$(field).on('click', function () {
						steamSelf.confirmSale(steamSelf.game.player, slot, () => {
							steamSelf.removeEvents();
							steamSelf.prependMove(`liquidate\t${steamSelf.game.player}\t${slot}`);
							if (steamSelf.animation_queue.length == 0) {
								steamSelf.endTurn();
							} else {
								console.log(`${steamSelf.animation_queue.length} animations still running....`);
							}
						});
					});
				} else {
					$(field).on('click', function () {
						steamSelf.displayModal('You cannot sell a single plant when you have a larger factory');
					});
				}
			}
		}

		$('#discard').on('click', function () {
			
			steamSelf.removeEvents();
			$('.active_element').removeClass('active_element');
			$('.cardfan img.card').addClass('deletable');
			$('#discard').addClass('active_state');
			$('.cardfan img.card').on('click', function () {
				let card = $(this).attr('data-id');
				$('#discard').off();
				let card_pos = parseInt($(this).attr('id').substring(1));
				steamSelf.game.state.hand.splice(card_pos, 1);

				steamSelf.addMove(`discard\t${steamSelf.game.player}\t${card}`);

				steamSelf.moveGameElement(
					steamSelf.copyGameElement(this),
					`#discards`,
					{ insert: 1, resize: 1 },
					() => {
						console.log('Sending move to discard card');
						steamSelf.endTurn();
					}
				);
			});

			$('#discard').off();
			$('#discard').on('click', function () {
				$('.deletable').removeClass('deletable');
				$("#discard").removeClass("active_state");
				steamSelf.attachBoardEvents();
			});
		});
	}

	dealCards() {
		this.removeEvents();
		this.updateStatus("<div class='status-message'>Dealing new cards...</div>");
		this.prependMove('continue');
		if (this.animation_queue.length == 0) {
			this.endTurn();
		} else {
			console.log(`${this.animation_queue.length} animations still running....`);
		}
	}

	isProtected(slot) {
		if (this.game.state.self[slot - 1].length > 1) {
			return false;
		}

		for (let i = 0; i < 3; i++) {
			if (this.game.state.self[i].length > 1) {
				return true;
			}
		}

		return false;
	}

	removeEvents() {
		$('#self > .field_slot').off();
		$('#forward').off();
		$('.offer img').off();
		$('.cardfan img.card').off();
		$('.active_element').removeClass('active_element');
		$('#discard').off();
		$('#discard').removeClass('active_state');
		$('#forward').css('visibility', 'hidden');
		//$(".jumpy").removeClass("jumpy");
	}

	/*
	 * DISPLAY FUNCTIONS
	 */

	calculateProfit(player, slot) {
		let factory =
			this.game.player === player ? this.game.state.self[slot] : this.game.state.opponent[slot];
		let resource = factory[0];
		if (!resource){
			//this is an empty slot
			return -1;
		}
		let reward = this.factory[resource];
		console.log(player, slot, resource, reward);
		return factory.length < reward.length ? reward[factory.length] : reward[reward.length - 1];
	}

	cardToHTML(card, offsety = 0, offsetx = 0) {
		if (card && this.factory[card]) {
			return `<img class="card" data-id="${card}" src="${this.card_img_dir}SB_${card}.png" style="top: ${offsety}px; left: ${offsetx}px;"/>`;
		} else {
			return '';
		}
	}

	twoSidedCard(card) {
		if (card && this.factory[card]) {
			return `<div class="flip-card flipped" data-id="${card}" >
                <img class="card cardBack" src="${this.card_img_dir}SB_${card}.png"/>
                <img class="card cardFront" src="${this.card_img_dir}SB_Reward.png"/>      
              </div>`;
		}
		return '';
	}

	/*cardWithCountToHTML(card, amt){
    if (amt !== 0){
      return `<div class="hud-card card_count${(amt < 0)?" disabled":""}" data-id="${card}" data-cnt="${amt}" style="background-image:url('${this.card_img_dir}${card}.png');">${Math.abs(amt)}</div>`;  
    }else{
      return "";
    }
  }*/

	displayAll() {
		if (!this.gameBrowserActive()){
			return;
		}
		this.displayBoard();
		this.displayScore();
		this.displayFields();
		this.displayHand();
	}

	displayBoard() {
		//Get rid of any remaining animation stuff
		$('.animated_elem').remove();

		$('#draw_deck').css('background-image', `url("${this.card_img_dir}SB_reward.png")`);
		if (this.game.deck[0].crypt.length > 0) {
			$('#draw_deck').html(
				this.game.deck[0].crypt.length +
					`<div class="tiptext">The game will end when all cards have been drawn</div>`
			);
		} else {
			$('#draw_deck').css('visibility', 'hidden');
		}

		let html = '';

		this.game.state.market = this.game.state.market.filter((e) => e !== '');

		for (let i = 0; i < this.game.state.market.length; i++) {
			let card = this.game.state.market[i];
			html += `<img class="card" data-id="${card}" id="m_${i}" src="${this.card_img_dir}SB_${card}.png"/>`;
		}
		$('.offer').html(html);

		html = '';
		for (let c = 0; c < this.game.state.discards.length; c++) {
			html += this.cardToHTML(this.game.state.discards[c], -2 * c, -2 * c);
		}
		$('#discards').html(html);
	}

	displayScore() {
		$('#my_score').html(this.game.state.gold[0]);
		$('#opponent_score').html(this.game.state.gold[1]);
	}

	displayHand() {
		let cards_html = this.game.state.hand
			.map(
				(card, i) =>
					`<img class="card" id="c${i}" data-id="${card}" src="${this.card_img_dir}SB_${card}.png">`
			)
			.join('');

		this.cardfan.render(cards_html);
		this.cardfan.addClass('bighand');
		this.cardfan.addClass('jumpy');

		//this.cardfan.addClass("staggered-hand");
	}

	displayFields() {
		//Maybe temporary display before animations
		let html_stack;
		for (let i = 0; i < 3; i++) {
			html_stack = '';
			if (this.game.state.opponent[i].length > 0) {
				for (let j = 0; j < this.game.state.opponent[i].length - 1; j++) {
					html_stack += this.cardToHTML(this.game.state.opponent[i][j], 10 * j);
				}
				let gold = this.calculateProfit(3 - this.game.player, i);
				if (gold > 0) {
					html_stack += `<div class="field_slot" style="background-image: url('${
						this.card_img_dir
					}SB_${this.game.state.opponent[i][0]}.png'); top: ${
						10 * (this.game.state.opponent[i].length - 1)
					}px;">
                            <div class="profit profit${gold}"></div>
                          </div>`;
				} else {
					html_stack += this.cardToHTML(
						this.game.state.opponent[i][0],
						10 * (this.game.state.opponent[i].length - 1)
					);
				}
			}

			$(`#o${i + 1}`).html(html_stack);
		}

		for (let i = 0; i < 3; i++) {
			html_stack = '';
			if (this.game.state.self[i].length > 0) {
				for (let j = 0; j < this.game.state.self[i].length - 1; j++) {
					html_stack += this.cardToHTML(this.game.state.self[i][j], 10 * j);
				}
				let gold = this.calculateProfit(this.game.player, i);
				if (gold > 0) {
					html_stack += `<div class="field_slot" style="background-image: url('${
						this.card_img_dir
					}SB_${this.game.state.self[i][0]}.png'); top: ${
						10 * (this.game.state.self[i].length - 1)
					}px;">
                            <div class="profit profit${gold}"></div>
                          </div>`;
				} else {
					html_stack += this.cardToHTML(
						this.game.state.self[i][0],
						10 * (this.game.state.self[i].length - 1)
					);
				}
			}

			$(`#s${i + 1}`).html(html_stack);
		}
	}

	confirmSale(player, plot, callback) {
		if (this?.dontask) {
			callback();
			return;
		}

		let left = $(`#s${plot}`).offset().left + 50;
		let top = $(`#s${plot}`).offset().top + 20;

		plot--;

		let gold = this.calculateProfit(player, plot);
		let msg = `Sell ${this.game.state.self[plot].length} ${this.game.state.self[plot][0]} factories for ${gold} gold?`;

		let steamSelf = this;
		let html = `
          <div class="popup-confirm-menu">
            <div class="popup-prompt">${msg}</div>
            <div class="action" id="confirm">yes</div>
            <div class="action" id="stopasking">yes, stop asking</div>
            <div id="close" class="saito-overlay-closebox"><i class="fas fa-times-circle saito-overlay-closebox-btn"></i></div>
          </div>`;


		$('.popup-confirm-menu').remove();
		$('body').append(html);

		if (left + 200 < window.innerWidth) {
			$('.popup-confirm-menu').css({
				position: 'absolute',
				top: top,
				left: left
			});
		} else {
			$('.popup-confirm-menu').css({
				position: 'absolute',
				top: top,
				right: 0
			});
		}

		$('.action').off();
		$('.action').on('click', function () {
			let confirmation = $(this).attr('id');

			$('.action').off();
			$('.popup-confirm-menu').remove();
			if (confirmation == 'stopasking') {
				steamSelf.dontask = true;
				callback();
			}
			if (confirmation == 'confirm') {
				callback();
			}
		});

		$("#close").off();
		$("#close").on('click', function(){
			$('.popup-confirm-menu').remove();
		});
	}

	gameOverUserInterface() {

		$(".player_field").fadeOut(50, function () {
  			$(this).remove();
 		});

 		this.hud.render();
		super.gameOverUserInterface();
	}

	////////////////////
	// Core Game Data //
	////////////////////
	returnState() {
		let state = {};
		state.market = []; //Cards available to take
		state.discards = [];
		state.hand = []; //My hand -- in order
		state.gold = [0, 0]; //Running total of player scores
		//The ordered data structures for the factories as they grow
		state.opponent = [[], [], []];
		state.self = [[], [], []];

		state.welcome = 0;
		state.tutorial = true;

		return state;
	}

	returnCards() {
		var deck = {};

		let definition = {
			coal: 18,
			cement: 16,
			coke: 14,
			iron: 12,
			cotton: 10,
			pottery: 8 /*lightbulb: 6,*/
		};
		for (let res in definition) {
			for (let i = 0; i < definition[res]; i++) {
				deck[`${res}${i}`] = { type: res };
			}
		}

		return deck;
	}

	returnFactoryRules() {
		let factory = {};
		factory['cement'] = [0, 0, 0, 1, 1, 2, 2, 3, 4];
		factory['coal'] = [0, 0, 0, 1, 1, 1, 2, 2, 3, 4];
		factory['coke'] = [0, 0, 0, 1, 1, 2, 3, 4];
		factory['cotton'] = [0, 0, 1, 1, 2, 3, 4];
		factory['iron'] = [0, 0, 1, 1, 2, 2, 3, 4];
		factory['lightbulb'] = [0, 0, 2, 3];
		factory['pottery'] = [0, 0, 1, 2, 3, 4];
		return factory;
	}

	returnGameRulesHTML() {
		return GameRulesTemplate(this.app, this);
	}

	returnAdvancedOptions() {
		return GameOptionsTemplate(this.app, this);
	}

	showTutorial(step) {
		let hints = this.game.tutorial[step];
		let steamSelf = this;

		let showHint = () => {
			if (steamSelf.game.tutorial.show) {
				let hint = hints.shift();
				$(hint.element).addClass('tutorial-highlight');

				$(this.formatHelpMessage(hint.message, hints.length)).appendTo('body');

				$('.tutorial-help button').on('click', function () {
					$('.tutorial-highlight').removeClass('tutorial-highlight');
					if ($('#dontshowme').is(':checked')) {
					}
					steamSelf.game.tutorial.show = false;
					$('.tutorial-help').remove();
					if (hints.length > 0) {
						showHint();
					}
				});
			}
		};

		if (hints?.length > 0) {
			showHint();
		}
	}

	formatHelpMessage(message, cont) {
		let html = `<div class="tutorial-help">
                  <div class="message">${message}</div>`;
		if (cont > 0) {
			html += `<div>...or...</div>`;
		}

		html += `<li><input type="checkbox" id="dontshowme" value="false"/> don't show me any more hints...</li>
                  <button>${cont > 0 ? 'Continue' : 'Okay'}</button>
                </div>`;

		return html;
	}

	returnTutorial() {
		let tutorial = {};
		tutorial.show = true;
		tutorial['-1'] = [
			{
				element: '.offer',
				message: 'Click a card in the offer to build the plant'
			},
			{
				element: '#draw_deck',
				message: 'Click here to discard the offers and move on'
			}
		];

		tutorial['0'] = [
			{
				element: '.cardfan img.card:last-child ',
				message: 'Click the first card in your hand to build it'
			}
		];

		return tutorial;
	}
} // end Steam Bohnanza class

module.exports = Steamed;
