const GameTemplate = require('../../lib/templates/gametemplate');
const GameRulesTemplate = require('./lib/game-rules.template');
const GameOptionsTemplate = require('./lib/game-options.template');
const htmlTemplate = require('./lib/game-html.template');

//////////////////
// CONSTRUCTOR  //
//////////////////
class Jaipur extends GameTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'Bazaar';
		this.slug = 'bazaar';
		this.description = `Become the richest merchant in the kingdom of Jaipur by collecting sets of resources and selling them for maximum profit in this fast-paced 2-player card game.`;
		this.status = 'Alpha';

		this.card_height_ratio = 1.5;

		this.interface = 1; //Display card graphics
		this.minPlayers = 2;
		this.maxPlayers = 2;

		this.seats = [7, 4]; //Alternate player box arrangement
		this.card_img_dir = `/${this.slug}/img/cards/`;
		this.token_img_dir = `/${this.slug}/img/tokens/`;
		this.categories = 'Games Cardgame Tactical';
	}

	returnWelcomeOverlay() {
		let html = `<div id="welcome_overlay" class="welcome_overlay splash_overlay rules-overlay">
           <img src="/${this.name.toLowerCase()}/img/splash_welcome.jpg"/>
               </div>`;
		return html;
	}

	async render(app) {
		if (this.browser_active == 0) {
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

		this.playerbox.render();
		//this.playerbox.addClassAll('poker-seat-', true);

		this.hud.card_width = 120;
		this.hud.draggable_whole = false;
		this.hud.render();
	}

	////////////////
	// initialize //
	////////////////
	async initializeGame(game_id) {
		if (this.game.status != '') {
			this.updateStatus(this.game.status);
		}

		//
		// initialize
		//
		if (!this.game.state) {
			this.game.state = {};

			console.log('\n\n\n\n');
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('------ INITIALIZE GAME ----');
			console.log(`-----------${this.name}----------`);
			console.log('---------------------------');
			console.log('---------------------------');
			console.log('\n\n\n\n');

			this.updateStatus(
				'<div class=\'status-message\' id=\'status-message\'>Generating the Game</div>'
			);
			this.initializeQueue();
		}

		if (this.browser_active) {
			$('.jaipur_board').attr('style', '');
			this.updateTokens();
			this.updateMarket();
			this.updatePlayers();
		}
	}

	initializeQueue(first_player = 1) {
		Object.assign(this.game.state, this.returnState());

		this.game.queue = [];
		this.game.queue.push(`turn\t${first_player}`);
		this.game.queue.push('READY');
		this.game.queue.push('disclose_camels\t1');
		this.game.queue.push('disclose_camels\t2');
		this.game.queue.push('init');

		//Bonus Tokens
		this.game.queue.push(
			`DECKANDENCRYPT\t4\t2\t` + JSON.stringify(this.returnBonusTiles(5))
		);
		this.game.queue.push(
			`DECKANDENCRYPT\t3\t2\t` + JSON.stringify(this.returnBonusTiles(4))
		);
		this.game.queue.push(
			`DECKANDENCRYPT\t2\t2\t` + JSON.stringify(this.returnBonusTiles(3))
		);

		//Main Deck
		this.game.queue.push('marketdeal');
		this.game.queue.push('POOLDEAL\t1\t2\t1');
		this.game.queue.push(
			'SIMPLEDEAL\t5\t1\t' + JSON.stringify(this.returnCards())
		);
	}

	//
	// Core Game Logic
	//
	async handleGameLoop() {
		let we_self = this;

		this.saveGame(this.game.id);
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			if (this.browser_active) {
				this.updatePlayers();
			}

			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			/*
      Copy players hand into state.hand
      Move pool into state.market
      */
			if (mv[0] == 'init') {
				this.game.queue.splice(qe, 1);

				while (this.game.deck[0].hand.length > 0) {
					let card = this.game.deck[0].hand.pop();
					card = this.game.deck[0].cards[card].type;
					if (card == 'camel') {
						this.game.state.herd++;
					} else {
						this.game.state.hand.push(card);
					}
				}

				//Redraw everything for new round
				if (this.browser_active) {
					$('.jaipur_board').attr('style', '');
					this.updateTokens();
					this.updateMarket();
					this.updatePlayers();
				}
			}

			if (mv[0] == 'disclose_camels') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);

				if (this.game.player == player) {
					this.addMove(
						`my_camels\t${player}\t${this.game.state.herd}`
					);
					this.endTurn();
				}
				return 0;
			}

			if (mv[0] == 'my_camels') {
				let player = parseInt(mv[1]);
				let camCt = parseInt(mv[2]);
				if (this.game.player !== player) {
					this.game.state.enemyherd = camCt;
					this.game.state.enemyhand -= camCt;
				}
				this.game.queue.splice(qe, 1);
			}

			if (mv[0] == 'marketdeal') {
				this.game.queue.splice(qe, 1);

				while (this.game.pool[0].hand.length > 0) {
					let card = this.game.pool[0].hand.pop();
					this.game.state.market.push(
						this.game.deck[0].cards[card].type
					);

					if (this.browser_active) {
						$(this.cardToHTML(this.game.deck[0].cards[card].type))
							.hide()
							.appendTo('.market')
							.fadeIn('slow');
					}
				}

				this.updateStatusWithCards(
					'Dealing new cards to the market...'
				);

				this.updateLog(
					`There are ${this.game.deck[0].crypt.length} cards left`
				);
			}

			if (mv[0] == 'revealbonus') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);

				if (this.game.player == player) {
					let tokens = [];
					for (let i = 1; i < 4; i++) {
						while (this.game.deck[i].hand.length > 0) {
							let token = this.game.deck[i].hand.pop();
							console.log(
								`Deck ${i}, value: ${this.game.deck[i].cards[token]}`
							);
							tokens.push({
								type: i,
								value: this.game.deck[i].cards[token]
							});
						}
					}
					this.game.state.mybonustokens = tokens;
					this.addMove(
						`mybonus\t${player}\t${JSON.stringify(tokens)}`
					);
					this.endTurn();
				}
				return 0;
			}

			if (mv[0] == 'mybonus') {
				let player = parseInt(mv[1]);
				let tokens = JSON.parse(mv[2]);
				if (this.game.player !== player) {
					this.game.state.enemytokens = tokens;
					if (tokens.length !== this.game.state.enemybonus.length) {
						console.log('Bonus token mismatch');
					}
					this.game.state.enemybonus = [];
				}
				this.game.queue.splice(qe, 1);
			}

			if (mv[0] == 'endround') {
				let winner = 0;

				let myscore =
					this.game.state.herd > this.game.state.enemyherd ? 5 : 0;
				myscore += this.game.state.vp[this.game.player - 1];
				myscore += this.reduceScore(this.game.state.mybonustokens);

				let opponent_score =
					this.game.state.enemyherd > this.game.state.herd ? 5 : 0;
				opponent_score += this.game.state.vp[2 - this.game.player];
				opponent_score += this.reduceScore(this.game.state.enemytokens);

				this.updateLog(
					`You scored ${myscore} points versus ${opponent_score} for your opponent`
				);

				let method = 'score';
				if (myscore > opponent_score) {
					winner = this.game.player;
				} else if (opponent_score > myscore) {
					winner = 3 - this.game.player;
				} else {
					this.updateLog(`It's a tie!`);
					method = 'bonus token count';
					if (
						this.game.state.mybonustokens.length >
						this.game.state.enemytokens.length
					) {
						winner = this.game.player;
					} else if (
						this.game.state.mybonustokens.length <
						this.game.state.enemytokens.length
					) {
						winner = 3 - this.game.player;
					}
				}
				if (!winner) {
					this.updateLog(
						`Both players have ${this.game.state.mybonustokens.length} bonus tokens, checking second tiebreaker...`
					);
					winner =
						this.game.state.goodtokens[0].length >
						this.game.state.goodtokens[1].length
							? 1
							: 2;
					method = 'good token count';
				}

				let my_name =
					this.game.player == winner
						? 'You win'
						: 'Your opponent wins';
				this.updateLog(`${my_name} the round by ${method}`);

				if (this.game.state[`winner${winner}`]) {
					await this.sendGameOverTransaction(
						this.game.players[winner - 1],
						'excellence'
					);
					return 0;
				} else {
					this.game.state[`winner${winner}`] = 1;
					this.updatePlayers();
					this.initializeQueue(3 - winner);
				}

				this.game.queue.push(
					`ACKNOWLEDGE\t${my_name} the round by ${method}`
				);

				return 1;
			}

			if (mv[0] == 'turn') {
				if (!this.browser_active) {
					return 0;
				}

				//For the beginning of the game only...
				if (this.game.state.welcome == 0) {
					try {
						this.overlay.show(this.returnWelcomeOverlay());
						document.querySelector('.welcome_overlay').onclick =
							() => {
								this.overlay.hide();
							};
					} catch (err) {}
					this.game.state.welcome = 1;
				}

				if (this.gameOver()) {
					this.game.queue.push('endround');
					this.game.queue.push('revealbonus\t1');
					this.game.queue.push('revealbonus\t2');
					this.updateLog('End of round. Determining winner...');

					return 1;
				}

				let player = parseInt(mv[1]);
				$('.player-box').removeClass('active');
				this.playerbox.addClass('active', player);

				if (this.game.player == player) {
					await this.playerTurn();
				} else {
					this.updateStatusWithCards(`Waiting for opponent to play`);
				}
				return 0;
			}

			if (mv[0] == 'take') {
				let player = parseInt(mv[1]);
				let card = mv[2];

				this.game.queue.splice(qe, 2);
				this.game.queue.push('turn\t' + (3 - player));

				for (let i = 0; i < this.game.state.market.length; i++) {
					if (this.game.state.market[i] == card) {
						this.game.state.market.splice(i, 1);
						break;
					}
				}

				let moving_card = this.copyGameElement(
					`.market .card[data-id="${card}"]`
				);

				if (this.game.player == player) {
					this.game.state.hand.push(card);

					let dest = document.querySelector(
						`#status .hud-card[data-id="${card}"]`
					);
					if (!dest) {
						await this.hud.insertCard(
							`<div id="slot00" class="card hud-card"></div>`
						);
						dest = '#slot00';
					}
					this.moveGameElement(
						moving_card,
						dest,
						{ resize: 1 },
						() => {
							this.restartQueue();
						}
					);
				} else {
					this.game.state.enemyhand++;

					this.moveGameElement(
						moving_card,
						'#purchase_zone',
						{ insert: 1 },
						async () => {
							$('#purchase_zone')
								.children()
								.fadeOut(1000, function () {
									$(this).remove();
								});
							this.restartQueue();
						}
					);
				}

				let my_name =
					this.game.player == player ? 'You' : 'Your opponent';
				this.updateLog(`${my_name} took a ${card} from the market.`);

				this.game.queue.push('marketdeal');
				this.game.queue.push(`POOLDEAL\t1\t1\t1`);

				return 0;
			}

			if (mv[0] == 'sell') {
				let player = parseInt(mv[1]);
				let card = mv[2];
				let count = parseInt(mv[3]);

				this.game.queue.splice(qe, 2);
				this.game.queue.push('turn\t' + (3 - player));

				this.game.state.last_discard = card;

				let destination = '#player-box-7 .player-box-tokens';

				if (this.game.player == player) {
					this.game.state.hand = this.game.state.hand.filter(
						(c) => c !== card
					);
				} else {
					this.game.state.enemyhand -= count;
					destination = '#player-box-4 .player-box-tokens';
				}

				let good_token = 0;
				let num_tokens =
					$(`.bonus_tokens .tip.${card} .token`).length - 1;
				for (let i = 0; i < count; i++) {
					if (this.game.state.tokens[card].length > 0) {
						good_token++;
						let profit = this.game.state.tokens[card].pop();
						this.game.state.vp[player - 1] += profit;
						this.game.state.goodtokens[player - 1].push({
							type: card,
							value: profit
						});

						this.animationSequence.push({
							callback: this.moveGameElement,
							params: [
								this.copyGameElement(
									$(`.bonus_tokens .tip.${card} .token`)[
										num_tokens - i
									]
								),
								destination,
								{ insert: 1 },
								() => {
									this.updateTokens();
									this.restartQueue();
								}
							]
						});
					}
				}

				let bonus_deck = 0;
				if (count >= 3) {
					bonus_deck = Math.min(count - 1, 4); //In case selling more than 5
					this.game.queue.push(`DEAL\t${bonus_deck}\t${player}\t1`);
					if (this.game.player !== player) {
						this.game.state.enemybonus.push(bonus_deck);
					}
					this.animationSequence.push({
						callback: this.moveGameElement,
						params: [
							this.copyGameElement(
								$(
									`.bonus_tokens .tip.bonus${
										bonus_deck + 1
									} .token`
								).last()[0]
							),
							destination,
							{ insert: 1 },
							() => {
								this.updateTokens();
								this.restartQueue();
							}
						]
					});
				}

				let my_name =
					this.game.player == player ? 'You' : 'Your opponent';
				this.updateLog(
					`${my_name} sold ${count} ${card}${
						count > 1 ? 's' : ''
					}, gaining ${good_token} goods token${
						good_token > 1 ? 's' : ''
					}${bonus_deck > 0 ? ' and a bonus token' : ''}.`
				);

				this.runAnimationQueue();
				return 0;
			}

			if (mv[0] == 'trade') {
				let player = parseInt(mv[1]);
				let from_market = JSON.parse(mv[2]);
				let to_market = JSON.parse(mv[3]);

				this.game.queue.splice(qe, 2);
				this.game.queue.push('turn\t' + (3 - player));

				for (let i = 0; i < from_market.length; i++) {
					//console.log(JSON.stringify(this.game.state.hand),JSON.stringify(this.game.state.market));
					if (this.game.player === player) {
						this.game.state.hand.push(from_market[i]);
					} else {
						this.game.state.enemyhand++;
					}

					for (let j = 0; j < this.game.state.market.length; j++) {
						if (from_market[i] === this.game.state.market[j]) {
							this.game.state.market.splice(j, 1);
							break;
						}
					}

					//          this.moveGameElement(moving_card, "#purchase_zone", {insert: 1}, ()=>{
					//            $("#purchase_zone").children().fadeOut(1000, function(){ $(this).remove(); });
					//            this.restartQueue();
					//          });

					$(`.market .card[data-id="${from_market[i]}"]`)
						.first()
						.attr('data-id', '')
						.fadeOut('slow', function () {
							$(this).remove();
						});
				}

				for (let i = 0; i < to_market.length; i++) {
					//console.log(JSON.stringify(this.game.state.hand),JSON.stringify(this.game.state.market));
					this.game.state.market.push(to_market[i]);
					if (this.game.player === player) {
						if (to_market[i] === 'camel') {
							this.game.state.herd--;
						} else {
							for (
								let j = 0;
								j < this.game.state.hand.length;
								j++
							) {
								if (to_market[i] === this.game.state.hand[j]) {
									this.game.state.hand.splice(j, 1);
									break;
								}
							}
						}
					} else {
						if (to_market[i] === 'camel') {
							this.game.state.enemyherd--;
						} else {
							this.game.state.enemyhand--;
						}
					}

					$(this.cardToHTML(to_market[i]))
						.hide()
						.appendTo('.market')
						.fadeIn('slow');
				}

				let my_name =
					this.game.player == player ? 'You' : 'Your opponent';
				this.updateLog(
					`${my_name} traded ${to_market} for ${from_market}.`
				);

				console.log(
					JSON.stringify(this.game.state.hand),
					JSON.stringify(this.game.state.market)
				);
			}

			if (mv[0] == 'camels') {
				let player = parseInt(mv[1]);

				this.game.queue.splice(qe, 2);
				this.game.queue.push('turn\t' + (3 - player));

				this.game.state.market = this.game.state.market.filter(
					(card) => card !== 'camel'
				);

				let numCamels = 5 - this.game.state.market.length;

				let destination = '#player-box-7 .camel_train';

				if (this.game.player === player) {
					this.game.state.herd += numCamels;
					this.updateLog(
						`You added ${numCamels} camels to your herd.`
					);
				} else {
					this.game.state.enemyherd += numCamels;
					this.updateLog(
						`Your opponent added ${numCamels} camels to their herd.`
					);
					destination = '#player-box-4 .camel_train';
				}

				Array.from(
					document.querySelectorAll(`.market .card[data-id="camel"]`)
				).forEach((card) => {
					this.moveGameElement(
						this.copyGameElement(card),
						destination,
						{ insert: 1, resize: 1 },
						() => {
							this.restartQueue();
						}
					);
				});

				this.game.queue.push('marketdeal');
				this.game.queue.push(`POOLDEAL\t1\t${numCamels}\t1`);

				return 0;
			}

			return 1;
		} // if cards in queue

		return 0;
	}

	gameOver() {
		if (this.game.deck[0].crypt.length == 0) {
			return true;
		}

		let emptyCt = 0;
		for (let token in this.game.state.tokens) {
			if (this.game.state.tokens[token].length == 0) {
				emptyCt++;
			}
		}

		return emptyCt >= 3;
	}

	playerTurn() {
		let html = `Select a card in the market to buy, in your hand to sell, or <span id="trade" class="link">click here to trade</span>`;

		this.updateStatusWithCards(html);
		this.attachGameEvents();
	}

	attachGameEvents() {
		let game_self = this;

		//Buy
		$('.market .card').on('click', async function () {
			$('.market .card').off();
			let card = $(this).attr('data-id');
			if (card == 'camel') {
				game_self.addMove(`camels\t${game_self.game.player}`);
				game_self.endTurn();
			} else {
				if (game_self.game.state.hand.length < 7) {
					game_self.addMove(
						`take\t${game_self.game.player}\t${card}`
					);
					game_self.endTurn();
				} else {
					salert('Your hand is already full, trade or sell cards!');
				}
			}
		});

		//Sell
		$('.rack .card_count').on('click', async function () {
			$('.rack .card_count').off();
			let card = $(this).attr('data-id');
			let count = $(this).attr('data-cnt');

			let expensive = ['diamond', 'gold', 'silver'];
			if (expensive.includes(card) && count < 2) {
				salert(
					`You have to have at least 2 ${card} in order to make a sale`
				);
			} else {
				game_self.moveGameElement(
					game_self.copyGameElement(`.hud-card[data-id="${card}"]`),
					'.invisible_item',
					{},
					(item) => {
						$(item).remove();
					}
				);
				game_self.addMove(
					`sell\t${game_self.game.player}\t${card}\t${count}`
				);
				game_self.endTurn();
			}
		});

		//Trade
		$('#trade').off();
		$('#trade').on('click', function () {
			game_self.pickMany();
		});
	}

	pickMany() {
		//Let's first organize the resources
		let market = {};
		let hand = {};
		let to_give = [];
		let to_take = [];
		let game_self = this;

		for (let res of this.game.state.market) {
			if (res !== 'camel') {
				if (!market[res]) {
					market[res] = 0;
				}
				market[res]++;
			}
		}
		for (let res of this.game.state.hand) {
			if (!hand[res]) {
				hand[res] = 0;
			}
			hand[res]++;
		}
		if (this.game.state.herd > 0) {
			hand['camel'] = this.game.state.herd;
		}

		let updateOverlay = () => {
			//Refresh available supply

			let html = `<div class="trade_overlay" id="trade_overlay">
                  <div class="grid_display">
                    <div class="market_overlay">
                      <div class="h2">Cards in Market:</div>
                      <div class="card_group">`;
			for (let r in market) {
				if (!to_give.includes(r)) {
					html += game_self.cardWithCountToHTML(r, market[r]);
				} else {
					html += game_self.cardWithCountToHTML(r, -market[r]);
				}
			}
			html += `</div></div> <div class="take_overlay">
                            <div class="h2">Take from Market:</div>
                            <div class="card_group">`;
			for (let r of to_take) {
				html += game_self.cardToHTML(r);
			}
			html += `</div></div> <div class="hand_overlay">
                        <div class="h2">Cards in Hand:</div>
                        <div class="card_group">`;
			let handCount =
				game_self.game.state.hand.length +
				to_take.length -
				to_give.filter((c) => {
					return c !== 'camel';
				}).length;
			console.log(
				JSON.parse(JSON.stringify(game_self.game.state.hand)),
				game_self.game.state.hand.length
			);
			console.log(JSON.parse(JSON.stringify(to_take)), to_take.length);
			console.log(
				JSON.parse(JSON.stringify(to_give)),
				to_give.filter((c) => {
					return c !== 'camel';
				}).length
			);
			for (let r in hand) {
				if (
					to_take.includes(r) ||
					(r == 'camel' &&
						handCount >= 7 &&
						to_give.length >= to_take.length)
				) {
					html += game_self.cardWithCountToHTML(r, -hand[r]);
				} else {
					html += game_self.cardWithCountToHTML(r, hand[r]);
				}
			}
			html += `</div></div> <div class="give_overlay">                            
                            <div class="h2">Give to Market:</div>
                            <div class="card_group">`;

			for (let r of to_give) {
				html += game_self.cardToHTML(r);
			}
			html += `</div></div></div>
          <div class="trade_overlay_buttons">
            <div id="cancel_btn" class="trade_overlay_button saito-button-primary">Cancel</div>
            <div id="trade_btn" class="trade_overlay_button saito-button-primary disabled">Trade</div>
          </div>
        </div>
      `;

			game_self.overlay.show(html);
			game_self.overlay.blockClose();

			$('.market_overlay .card_count').on('click', (e) => {
				let card = e.target.dataset.id;
				if (e.target.classList.contains('disabled') || !card) {
					return;
				}
				market[card]--;
				to_take.unshift(card);
				updateOverlay();
			});
			$('.hand_overlay .card_count').on('click', (e) => {
				let card = e.target.dataset.id;
				if (e.target.classList.contains('disabled') || !card) {
					return;
				}
				hand[card]--;
				to_give.unshift(card);
				updateOverlay();
			});
			$('.take_overlay .card').on('click', (e) => {
				let card = e.target.dataset.id;
				if (!card) {
					return;
				}
				market[card]++;
				to_take.splice(to_take.indexOf(card), 1);
				updateOverlay();
			});
			$('.give_overlay .card').on('click', (e) => {
				let card = e.target.dataset.id;
				if (!card) {
					return;
				}
				hand[card]++;
				to_give.splice(to_give.indexOf(card), 1);
				updateOverlay();
			});

			if (to_give.length === to_take.length && to_give.length > 1) {
				if (
					game_self.game.state.hand.length +
						to_take.length -
						to_give.filter((c) => {
							return c !== 'camel';
						}).length <=
					7
				) {
					let submit = document.getElementById('trade_btn');
					submit.classList.remove('disabled');
					submit.onclick = async () => {
						game_self.overlay.remove();
						game_self.addMove(
							`trade\t${game_self.game.player}\t${JSON.stringify(
								to_take
							)}\t${JSON.stringify(to_give)}`
						);
						game_self.endTurn();
					};
				}
			}

			$('#cancel_btn').on('click', async () => {
				game_self.overlay.remove();
				game_self.playerTurn();
			});
		};

		updateOverlay();
	}

	cardToHTML(card) {
		if (card) {
			return `<img class="card" data-id="${card}" src="${this.card_img_dir}/${card}.png">`;
		} else {
			return '';
		}
	}

	cardWithCountToHTML(card, amt) {
		if (amt !== 0) {
			return `<div class="hud-card card_count${
				amt < 0 ? ' disabled' : ''
			}" data-id="${card}" data-cnt="${amt}" style="background-image:url('${
				this.card_img_dir
			}${card}.png');">${Math.abs(amt)}</div>`;
		} else {
			return '';
		}
	}

	camelHTML(herd1, herd2) {
		let camel_bonus =
			herd1 > herd2
				? `<img class="camel_bonus" src="${this.token_img_dir}camel_token.png" />`
				: '';
		if (herd1 > 0) {
			return `<div class="camel_train"><div class="card_count" style="background-image: url('${this.card_img_dir}camel.png');">${herd1}</div>${camel_bonus}</div>`;
		} else {
			return `<div class="camel_train" style="visibility=hidden;"></div>`;
		}
	}

	bonusTokensToHTML(player) {
		let html = `<div class="player-box-tokens">`;

		if (this.game.state.goodtokens[player - 1].length > 0) {
			for (let token of this.game.state.goodtokens[player - 1]) {
				html += `<div class="token" style="background-image:url('${this.token_img_dir}${token.type}_token.png');">${token.value}</div>`;
			}
		}

		if (this.game.player == player) {
			for (let j = 1; j <= 3; j++) {
				for (let i = 0; i < this.game.deck[j].hand.length; i++) {
					html += `<div class="token" style='background-image:url("${
						this.token_img_dir
					}${j + 2}_card_token.png");'>${
						this.game.deck[j].cards[this.game.deck[j].hand[i]]
					}</div>`;
				}
			}
			for (let bt of this.game.state.mybonustokens) {
				html += `<div class="token" style='background-image:url("${
					this.token_img_dir
				}${bt.type + 2}_card_token.png");'>${bt.value}</div>`;
			}
		} else {
			for (let bt of this.game.state.enemybonus) {
				html += `<div class="token" style='background-image:url("${
					this.token_img_dir
				}${bt + 1}_card_token.png");'></div>`;
			}
			for (let bt of this.game.state.enemytokens) {
				html += `<div class="token" style='background-image:url("${
					this.token_img_dir
				}${bt.type + 2}_card_token.png");'>${bt.value}</div>`;
			}
		}

		return html + '</div>';
	}

	reduceScore(bonusToken) {
		let score = 0;
		for (let obj of bonusToken) {
			score += obj.value;
		}
		return score;
	}

	calculateBonus() {
		let bonus = 0;
		for (let j = 1; j <= 3; j++) {
			for (let i = 0; i < this.game.deck[j].hand.length; i++) {
				bonus += this.game.deck[j].cards[this.game.deck[j].hand[i]];
			}
		}
		return bonus;
	}

	updatePlayers() {
		let crown = `<i class="fas fa-crown"></i>`;

		this.playerbox.updateGraphics(
			this.camelHTML(this.game.state.herd, this.game.state.enemyherd),
			this.game.player
		);
		this.playerbox.updateGraphics(
			this.camelHTML(this.game.state.enemyherd, this.game.state.herd),
			3 - this.game.player
		);

		let my_score = this.game.state.herd > this.game.state.enemyherd ? 5 : 0;
		my_score += this.game.state.vp[this.game.player - 1];
		my_score += this.calculateBonus();
		my_score += this.reduceScore(this.game.state.mybonustokens);

		let html = `<div class="score tip">Me: ${my_score}</div>`;
		if (this.game.state[`winner${this.game.player}`]) {
			html = crown + html;
		}

		this.playerbox.updateBody(html + this.bonusTokensToHTML(this.game.player));

		let enemy_score =
			this.game.state.herd < this.game.state.enemyherd ? 5 : 0;
		enemy_score += this.game.state.vp[2 - this.game.player];
		enemy_score += this.reduceScore(this.game.state.enemytokens);

		let bonus_text =
			this.game.state.enemybonus.length > 0
				? `*<div class="tiptext">Score does not include ${this.game.state.enemybonus.length} bonus token(s).</div>`
				: '';
		html = `<div class="score tip">Opponent: ${enemy_score}${bonus_text}, ${this.game.state.enemyhand} cards</div>`;

		if (this.game.state[`winner${3 - this.game.player}`]) {
			html = crown + html;
		}

		html += this.bonusTokensToHTML(3 - this.game.player);

		this.playerbox.updateBody(html, 3 - this.game.player);

	}

	updateStatusWithCards(status) {
		if (this.game.player == 0) {
			this.updateStatus(
				`<div class="hud-status-update-message">${status}</div>`
			);
			return;
		}

		$('.animated_elem').fadeOut(1000, function () {
			$(this).remove();
		});

		let available_resources = {};
		for (let card of this.game.state.hand) {
			if (!available_resources[card]) {
				available_resources[card] = 0;
			}
			available_resources[card]++;
		}

		try {
			let card_html = '';

			this.game.state.hand.sort();

			for (let c in available_resources) {
				card_html += this.cardWithCountToHTML(
					c,
					available_resources[c]
				);
			}

			this.updateStatus(`<div class="status-message">${status}</div>`); //Attach html to #status box
			this.updateControls(`<div class="status-icon-menu rack" id="rack">${card_html}</div>`);

		} catch (err) {
			console.error(err);
		}
	}

	updateTokens() {
		let html = `<div class="bonus_tokens">`;
		for (let token in this.game.state.tokens) {
			if (this.game.state.tokens[token].length > 0) {
				html += `<div class="tip ${token}">`;
				for (let i = 0; i < this.game.state.tokens[token].length; i++) {
					let value = this.game.state.tokens[token][i];
					html += `<div class="token" style="background-image:url('${this.token_img_dir}${token}_token.png');">${value}</div>`;
				}
				html += `<div class="tiptext">${
					this.game.state.tokens[token].length + 1
				} ${token} token(s) left</div>
              </div>`;
			} else {
				html += `<img class="token empty" src="${this.token_img_dir}${token}_token.png"/>`;
			}
		}
		for (let i = 3; i <= 5; i++) {
			if (this.game.deck[i - 2].crypt.length > 0) {
				html += `<div class="tip bonus${i}">`;
				for (let j = 0; j < this.game.deck[i - 2].crypt.length; j++) {
					html += `<div class="token" style='background-image:url("${this.token_img_dir}${i}_card_token.png");'></div>`;
				}
				html += `<div class="tiptext">${
					this.game.deck[i - 2].crypt.length
				} ${i} bonus token(s) left</div>
                </div>`;
			} else {
				html += `<img class="token empty" src="${this.token_img_dir}${i}_card_token.png"/>`;
			}
		}
		html += '</div>';

		this.app.browser.replaceElementBySelector(html, '.bonus_tokens');
	}

	updateMarket() {
		/*
    <div id="discard">${this.cardToHTML(this.game.state.last_discard)}</div>
      <div id="draw" class="tip card_count">
        ${this.game.deck[0].crypt.length}
        <div class="tiptext">${this.game.deck[0].crypt.length} cards left in draw pile.</div>
      </div>
    */

		let html = `<div class="market">`;
		for (let res of this.game.state.market) {
			html += this.cardToHTML(res);
		}

		html += `</div>`;

		this.app.browser.replaceElementBySelector(html, '.market');
	}

	////////////////////
	// Core Game Data //
	////////////////////
	returnState() {
		let state = {};
		state.market = ['camel', 'camel', 'camel'];
		state.hand = [];
		state.herd = 0;
		state.enemyherd = 0;
		state.enemyhand = 5;
		state.vp = [0, 0];
		state.enemybonus = [];
		state.goodtokens = [[], []];
		state.mybonustokens = [];
		state.enemytokens = [];
		state.welcome = 0;

		state.tokens = {
			cloth: [1, 1, 2, 2, 3, 3, 5],
			leather: [1, 1, 1, 1, 1, 1, 2, 3, 4],
			spice: [1, 1, 2, 2, 3, 3, 5],
			silver: [5, 5, 5, 5, 5],
			gold: [5, 5, 5, 6, 6],
			diamond: [5, 5, 5, 7, 7]
		};

		return state;
	}

	returnCards() {
		var deck = {};

		let definition = {
			diamond: 6,
			gold: 6,
			silver: 6,
			cloth: 8,
			spice: 8,
			leather: 10,
			camel: 8
		};
		for (let res in definition) {
			for (let i = 0; i < definition[res]; i++) {
				deck[`${res}${i}`] = { type: res };
			}
		}

		return deck;
	}

	returnBonusTiles(set) {
		let start = 1;
		if (set == 4) {
			start = 4;
		}
		if (set == 5) {
			start = 8;
		}

		let deck = {};
		let idx = 1;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 2; j++) {
				deck[idx] = start;
				idx++;
			}
			start++;
		}

		return deck;
	}

	returnGameRulesHTML() {
		return GameRulesTemplate(this.app, this);
	}

	returnGameOptionsHTML() {
		return GameOptionsTemplate(this.app, this);
	}
} // end Jaipur class

module.exports = Jaipur;
