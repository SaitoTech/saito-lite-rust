const html2canvas = require('html2canvas');

class PokerQueue {
	initializeQueue() {
		this.game.queue = [];

		this.game.queue.push('ante');
		this.game.queue.push('READY');
		this.game.queue.push('POOL\t1');
		this.game.queue.push(`SIMPLEDEAL\t2\t1\t` + JSON.stringify(this.returnDeck()));
	}

	startRound() {
		this.updateLog('===============');
		this.updateLog('Round: ' + this.game.state.round);
		this.updateLog('===============');
		console.log(JSON.parse(JSON.stringify(this.game.state)));

		for (let i = 0; i < this.game.players.length; i++) {
			this.updateLog(
				`Player ${i + 1}${i + 1 == this.game.state.button_player ? ' (dealer)' : ''}: ${
					this.game.state.player_names[i]
				} (${this.formatWager(this.game.state.player_credit[i], true)})`
			);
		}

		this.displayButton();

		this.initializeQueue();
	}

	async handleGameLoop() {
		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {
			this.displayPlayers(true); //to update chips before game_over

			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');

			if (this.browser_active) {
				this.pot.render();
			}

			if (mv[0] === 'winner') {
				this.game.queue = [];
				//this.game.crypto = null;
				this.settleDebt();
				this.sendGameOverTransaction(this.game.players[parseInt(mv[1])], 'elimination');
				return 0;
			}

			if (mv[0] === 'newround') {
				this.updateStatus('dealing new round...');

				this.game.state.round++;

				//Shift dealer, small blind, and big blind
				this.game.state.button_player--; //dealer
				if (this.game.state.button_player < 1) {
					this.game.state.button_player = this.game.players.length;
				}

				if (this.game.players.length > 2) {
					this.game.state.small_blind_player = this.game.state.button_player - 1;
					if (this.game.state.small_blind_player < 1) {
						this.game.state.small_blind_player = this.game.players.length;
					}
				} else {
					this.game.state.small_blind_player = this.game.state.button_player;
				}

				this.game.state.big_blind_player = this.game.state.small_blind_player - 1;
				if (this.game.state.big_blind_player < 1) {
					this.game.state.big_blind_player = this.game.players.length;
				}

				// This needs to be reset between rounds, hahaah
				// Otherwise, you could fold and still win
				this.game.state.player_cards = {};
				this.game.state.player_cards_reported = 0;
				this.game.state.player_cards_required = 0;

				this.game.state.last_fold = null;
				this.game.state.winners = [];

				//Adjust blind levels if necessary
				if (this.game.blind_mode == 'increase' && this.game.state.round % 5 == 0) {
					//TODO: parameterize num_rounds between increases
					this.game.state.small_blind++;
					this.game.state.big_blind += 2;

					this.updateLog(
						`Blinds increased to: ${this.game.state.big_blind}/${this.game.state.small_blind}`
					);
					salert(
						`Blinds increased to: ${this.game.state.big_blind}/${this.game.state.small_blind}`
					);
				}

				this.game.state.flipped = 0;
				this.game.state.plays_since_last_raise = 0;
				this.game.state.last_raise = this.game.state.big_blind;
				this.game.state.required_pot = this.game.state.big_blind;
				this.game.state.all_in = false; //we are stupidly testing for all_in on the display players

				for (let i = 0; i < this.game.players.length; i++) {
					this.game.state.passed[i] = 0;
					this.game.state.player_pot[i] = 0;
					this.game.stats[this.game.players[i]].hands++;
				}

				this.pot.activate();
				this.stats.update();
				this.startRound();
				return 1;
			}

			//
			// turns "resolve"
			//
			if (mv[0] === 'resolve') {
				if (qe > 0) {
					let last_mv = this.game.queue[qe - 1].split('\t');
					if (mv[1] === last_mv[0]) {
						this.game.queue.splice(qe - 1, 2);
						return 1; // Successful
					}
				}

				console.error('Unexpected resolve in queue, removing and continuing...');
				this.game.queue.splice(qe, 1);

				return 1;
			}

			if (mv[0] === 'checkplayers') {
				this.game.queue.splice(qe, 1);

				if (this.gameBrowserActive()) {
					$('.folded').removeClass('folded');
				}

				//Check for end of game -- everyone except 1 player has zero credit...
				let alive_players = 0;
				let winner = -1;
				let am_i_out = false;

				for (let i = 0; i < this.game.state.player_credit.length; i++) {
					if (this.game.state.player_credit[i] > 0) {
						alive_players++;
						winner = i;
					}
				}

				//Catch that only one player is standing at the start of the new round
				if (alive_players + this.toJoin.length == 1) {
					this.game.queue = [];
					this.game.queue.push('winner\t' + winner);
					return 1;
				}

				//
				// only remove if there are more than two players
				// if two players - let victory play out.
				//
				let removal = false;

				if (alive_players < this.game.state.player_credit.length) {
					for (let i = this.game.state.player_credit.length - 1; i >= 0; i--) {
						if (this.game.state.player_credit[i] <= 0) {
							this.updateLog(
								`Player ${i + 1} (${
									this.game.state.player_names[i]
								}) has been eliminated from the game.`
							);
							removal = true;
							//
							// remove any players who are missing
							//
							if (this.game.players[i] == this.publicKey) {
								am_i_out = true;
							}

							this.removePlayer(this.game.players[i]);

							//Adjust dealer for each removed player
							if (i < this.game.state.button_player) {
								this.game.state.button_player--;
								if (this.game.state.button_player < 1) {
									this.game.state.button_player = this.game.players.length;
								}
							}
						}
					}
				}

				if (removal) {
					this.halted = 1;

					if (am_i_out) {
						this.updateStatusForPlayerOut('You have been eliminated!', true);
					} else {
						this.resetGameWithFewerPlayers();
					}
					return 0;
				}

				return 1;
			}

			//
			//Player's turn to fold,check,call,raise
			//
			if (mv[0] === 'turn') {
				let player_to_go = parseInt(mv[1]);
				this.game.target = player_to_go;
				//
				// if everyone except 1 player has folded...
				//
				let active_players = 0;
				let player_left_idx = 0;
				for (let i = 0; i < this.game.state.passed.length; i++) {
					if (this.game.state.passed[i] == 0) {
						active_players++;
						player_left_idx = i;
					}
				}

				/***********************/
				/*PLAYER WINS HAND HERE*/
				/***********************/

				if (active_players === 1) {
					let winnings = 0;
					for (let i = 0; i < this.game.state.player_pot.length; i++) {
						if (i !== player_left_idx) {
							winnings += this.game.state.player_pot[i];
						}
					}
					let total_pot = winnings + this.game.state.player_pot[player_left_idx];

					let logMsg = `${this.game.state.player_names[player_left_idx]} wins ${this.formatWager(
						winnings
					)}`;

					this.updateLog(logMsg);

					// For animating
					let winners = {};
					winners[player_left_idx] = this.game.state.player_credit[player_left_idx];

					this.game.state.player_credit[player_left_idx] += total_pot;

					this.game.stats[this.game.players[player_left_idx]].wins++;

					// Poker Stats
					if (this.game.state.flipped == 0) {
						if (total_pot == this.game.state.big_blind + this.game.state.small_blind) {
							// No one called or raised --> walk
							for (let p of this.game.players) {
								this.game.stats[p].walks++;
							}
						}
					}

					//So that userline updates with winner
					this.game.state.winners = [player_left_idx + 1];
					this.displayPlayers();

					//
					// everyone settles with winner if needed
					//
					if (this.game.crypto) {
						for (let i = 0; i < this.game.players.length; i++) {
							if (i != player_left_idx) {
								//
								// only losers
								//
								if (this.game.state.player_pot[i] > 0) {
									let amount_to_send = this.convertChipsToCrypto(this.game.state.player_pot[i]);

									console.log(
										`crypto -- ${i}->${player_left_idx}: ${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${amount_to_send}\t${this.game.crypto}`
									);
									this.game.state.debt[i] += this.game.state.player_pot[i];
									this.game.state.debt[player_left_idx] -= this.game.state.player_pot[i];
								}
							}
						}
					}

					// if everyone has folded - start a new round
					let msg = `${this.game.state.player_names[player_left_idx]} wins the round`;
					if (this.game.player == player_left_idx + 1) {
						msg = 'You win the round';
					} else {
						this.cardfan.hide();
					}

					this.playerbox.setActive(player_left_idx + 1);
					this.animateWin(total_pot, winners);
					this.halted = 1;
					this.playerAcknowledgeNotice(msg, async () => {
						this.animating = false;
						this.cardfan.hide();
						this.pot.clearPot();
						this.settleLastRound([this.game.players[player_left_idx]], 'fold');
						this.board.clearTable();
						this.clearPlayers();
						await this.timeout(1000);
						this.restartQueue();
					});
					this.saveGame(this.game.id);
					this.setShotClock('.acknowledge', 6000);

					return 0;
				}

				//
				// Is this the end of betting?
				//
				if (this.game.state.plays_since_last_raise >= this.game.players.length) {
					//Is this the end of the hand?
					if (this.game.state.flipped == 5) {
						this.playerbox.setInactive();

						console.log('PREPARE FOR SHOWDOWN');

						this.game.queue = [];
						let first_scorer = 0;

						for (let i = 1; i <= this.game.state.passed.length; i++) {
							if (this.game.state.passed[i - 1] == 0) {
								first_scorer = first_scorer || i;
								this.game.state.player_cards_required++;
								this.game.state.player_cards[i] = [];

								this.game.stats[this.game.players[i - 1]].showdowns++;
							}
						}

						if (first_scorer == this.game.player) {
							this.addMove(
								`reveal\t${this.game.player}\t${this.game.deck[0].hand[0]}\t${this.game.deck[0].hand[1]}`
							);
							this.endTurn();
						}
						return 0;
					} else {
						let cards_to_flip = this.game.state.flipped == 0 ? 3 : 1;

						this.game.state.flipped += cards_to_flip;

						//We can't just push "announce", have to reset queue to clear out any remaining turns
						this.game.queue = ['round', 'announce'];
						this.game.queue.push(`POOLDEAL\t1\t${cards_to_flip}\t1`);

						this.game.state.plays_since_last_raise = 0;
						return 1;
					}
				}

				if (this.game.state.passed[player_to_go - 1] == 1) {
					//
					// we auto-clear without need for player to broadcast
					//
					this.game.state.plays_since_last_raise++;
					this.game.queue.splice(qe, 1);
					return 1;
				} else if (this.game.state.player_credit[player_to_go - 1] == 0) {
					//
					// we auto-clear without need for player to broadcast
					//
					this.game.state.plays_since_last_raise++;
					this.game.queue.splice(qe, 1);
					return 1;
				} else {
					this.playerbox.setActive(player_to_go);

					if (player_to_go == this.game.player) {
						this.playerTurn();
					} else {
						this.displayPlayerNotice(`<div class="plog-update">active player</div>`, player_to_go);
						if (this.game.state.passed[this.game.player - 1]) {
							this.updateStatus('waiting for next round');
						} else {
							this.updateStatus('waiting for ' + this.game.state.player_names[player_to_go - 1]);
						}
					}
				}

				return 0;
			}

			if (mv[0] === 'announce') {
				this.game.queue.splice(qe, 1);

				this.board.render(true);
				this.displayPlayers(true);

				if (this.game.state.flipped === 0) {
					if (this.game.player > 0) {
						this.updateLog('** HOLE CARDS **');
						this.updateLog(
							`[${this.cardToHuman(this.game.deck[0].hand[0])} ${this.cardToHuman(
								this.game.deck[0].hand[1]
							)}]`
						);
					}
					return 1;
				}

				if (this.game.state.flipped === 3) {
					this.updateLog('*** FLOP ***');
					this.updateLog(
						`[${this.cardToHuman(this.game.pool[0].hand[0])} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(this.game.pool[0].hand[2])}]`
					);
				}
				if (this.game.state.flipped === 4) {
					this.updateLog('**** TURN ****');
					this.updateLog(
						`[${this.cardToHuman(this.game.pool[0].hand[0])} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(this.game.pool[0].hand[2])}] [${this.cardToHuman(
							this.game.pool[0].hand[3]
						)}]`
					);
				}
				if (this.game.state.flipped === 5) {
					this.updateLog('***** RIVER *****');
					this.updateLog(
						`[${this.cardToHuman(this.game.pool[0].hand[0])} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(this.game.pool[0].hand[2])}] [${this.cardToHuman(
							this.game.pool[0].hand[3]
						)}] [${this.cardToHuman(this.game.pool[0].hand[4])}]`
					);
				}

				return 1;
			}

			if (mv[0] === 'reveal') {
				let scorer = parseInt(mv[1]);
				let card1 = mv[2];
				let card2 = mv[3];

				this.game.queue.splice(qe, 1);

				//Pocket
				this.game.state.player_cards[scorer].push(this.returnCardFromDeck(card1));
				this.game.state.player_cards[scorer].push(this.returnCardFromDeck(card2));

				if (scorer != this.game.player) {
					this.showPlayerHand(scorer, card1, card2);
					this.updateLog(`* HOLE CARDS -- ${this.game.state.player_names[scorer - 1]} *`);
					this.updateLog(`[${this.cardToHuman(card1)} ${this.cardToHuman(card2)}]`);
				}

				//Everyone can use the pool
				for (let i = 0; i < 5; i++) {
					this.game.state.player_cards[scorer].push(
						this.returnCardFromDeck(this.game.pool[0].hand[i])
					);
				}

				this.game.state.player_cards_reported++;

				if (this.game.state.player_cards_reported !== this.game.state.player_cards_required) {
					//If not everyone has reported there hand yet, find the next in sequence from this scorer
					let next_scorer = 0;
					for (let i = scorer; i < this.game.state.passed.length; i++) {
						if (this.game.state.passed[i] == 0) {
							next_scorer = i + 1;
							break;
						}
					}

					if (this.game.player == next_scorer) {
						this.addMove(
							`reveal\t${this.game.player}\t${this.game.deck[0].hand[0]}\t${this.game.deck[0].hand[1]}`
						);
						this.endTurn();
					}

					return 0;
				}

				//
				// we have all of the hands, and can pick a winner
				//
				this.displayPlayers();

				// PLAYER WINS HAND HERE
				//
				let winners = [];
				let winner_keys = [];

				var updateHTML = '';
				var winlist = [];

				//Sort hands from low to high
				for (var key in this.game.state.player_cards) {
					let deck = this.game.state.player_cards[key];

					if (winlist.length == 0) {
						winlist.splice(0, 0, {
							player: parseInt(key),
							player_hand: this.scoreHand(deck)
						});
					} else {
						let score = this.scoreHand(deck);
						let winlist_length = winlist.length;
						let place = 0;

						for (let k = 0; k < winlist_length; k++) {
							let w = this.pickWinner(winlist[k].player_hand, score);
							if (w > 1) {
								place = k + 1;
							}
						}
						winlist.splice(place, 0, {
							player: parseInt(key),
							player_hand: score
						});
					}
				}

				// Populate winners with winning players
				let topPlayer = winlist[winlist.length - 1];
				let winning_hand = topPlayer.player_hand.hand_description;

				console.log('Showdown:', winlist);

				// ... and anyone else who ties
				this.playerbox.setInactive();
				for (let p = 0; p < winlist.length; p++) {
					if (this.pickWinner(topPlayer.player_hand, winlist[p].player_hand) == 3) {
						winners.push(winlist[p].player - 1);
						winner_keys.push(this.game.players[winlist[p].player - 1]);
						this.playerbox.setActive(winlist[p].player, false);
					}
				}

				// Put my key first, if it is in the list
				winners.sort((a, b) => {
					if (b == this.game.player - 1) {
						return 1;
					}
					return 0;
				});

				let pot_total = 0;
				for (let i = 0; i < this.game.state.player_pot.length; i++) {
					pot_total += this.game.state.player_pot[i];
				}
				// split winnings among winners
				let pot_size = Math.floor(pot_total / winners.length);
				let winnerStr = '';

				let winObj = {};

				// single winner gets everything

				let logMsg = ` split the pot for ${this.formatWager(pot_size)} each`;
				if (winners.length == 1) {
					logMsg = winners[0] == this.game.player - 1 ? ' win' : ' wins';
					logMsg += ` ${this.formatWager(pot_total)} (${this.formatWager(
						pot_total - this.game.state.player_pot[winners[0]],
						false
					)} net)`;
				}

				for (let i = 0; i < winners.length; i++) {
					if (i >= 1) {
						if (i + 1 < winners.length) {
							winnerStr += ', ';
						} else {
							winnerStr += ', and ';
						}
					}

					// For animating chip change
					winObj[winners[i]] = this.game.state.player_credit[winners[i]];

					this.game.stats[this.game.players[winners[i]]].wins++;
					if (winners[i] == this.game.player - 1) {
						winnerStr += 'You';
					} else {
						winnerStr += this.game.state.player_names[winners[i]];
					}

					this.game.state.player_credit[winners[i]] += pot_size;

					this.game.state.winners.push(winners[i] + 1);
				}

				this.displayPlayers();

				logMsg = winnerStr + logMsg;

				// update splash!
				if (winners.length == 1) {
					if (winners[0] == this.game.player - 1) {
						winnerStr += ` win with ${winning_hand.toUpperCase()}!`;
					} else {
						winnerStr += ` wins with ${winning_hand.toUpperCase()}!`;
					}
				} else {
					winnerStr += ` split the pot with ${winning_hand.toUpperCase()}!`;
				}

				winlist.forEach((pl) => {
					this.updateLog(
						`${this.game.state.player_names[pl.player - 1]}: ${
							pl.player_hand.hand_description
						} <br> ${this.toHuman(pl.player_hand.cards_to_score)}`
					);

					let player_hand = this.game.state.player_cards[pl.player].slice(0, 2);
					updateHTML =
						`<div class="player-result">` +
						this.handToHTML(pl.player_hand.cards_to_score, player_hand) +
						'</div>' +
						updateHTML;

					updateHTML = `<div class="h3">${this.game.state.player_names[pl.player - 1]}: ${
						pl.player_hand.hand_description
					}</div>${updateHTML}`;
				});

				//update log
				this.updateLog(logMsg);

				this.updateHTML = updateHTML;

				//
				// non-winners send wagers to winner
				//
				if (this.game.crypto !== 'CHIPS') {
					for (let ii = 0; ii < this.game.players.length; ii++) {
						for (let i = 0; i < winners.length; i++) {
							if (!winners.includes(ii) && this.game.state.player_pot[ii] > 0) {
								let amount_to_send = this.convertChipsToCrypto(
									this.game.state.player_pot[ii] / winners.length
								);
								console.log(
									`crypto -- ${ii}->${winners[i]}: ${this.game.players[ii]}\t${
										this.game.players[winners[i]]
									}\t${amount_to_send}\t${this.game.crypto}`
								);
								let share_of_winnings = this.game.state.player_pot[ii] / winners.length;
								this.game.state.debt[ii] += share_of_winnings;
								this.game.state.debt[winners[i]] -= share_of_winnings;
							}
						}
					}
				}

				this.animateWin(pot_total, winObj);
				this.halted = 1;
				this.updateStatus(winnerStr);

				this.saveGame(this.game.id);

				if (this.game.player) {
					html2canvas(document.body, {
						/*scale: 0.8,
	                	width: 0.8*window.innerWidth,
	                	height: 0.8*window.innerHeight,*/
						ignoreElements: function (element) {
							if (element.classList.contains('cardBack')) {
								return true;
							}
							if (element.classList.contains('pot')) {
								return true;
							}
							if (element.classList.contains('poker-player-stake')) {
								return true;
							}
							if (element.id === 'log-wrapper') {
								return true;
							}
							if (element.id === 'saito-header') {
								return true;
							}
						}
					}).then((screenshot) => {
						this.playerAcknowledgeNotice(winnerStr, async () => {
							console.log('Continuing poker...');
							this.animating = false;
							this.cardfan.hide();
							this.pot.clearPot();
							this.settleLastRound(winner_keys, 'besthand');
							this.board.clearTable();
							this.clearPlayers();
							await this.timeout(800);
							this.restartQueue();
						});

						this.setShotClock('.acknowledge', 10000, true, () => {
							this.game_help.render({
								title: 'Showdown',
								text: `Tip: click anywhere on the screen to interrupt the 3 second countdown that keeps the game moving along`,
								//img: '/poker/img/poker_screenshot.jpg',
								line1: 'what',
								line2: 'happened?',
								fontsize : "2.1rem",
								id: 'showdown',
								callback: () => {
									let ov = document.querySelector('.game-help-overlay');
									if (ov) {
										ov.prepend(screenshot);
									}
								}
							});
						});
					});
				} else {
					this.halted = 0;
					this.pot.clearPot();
					this.settleLastRound(winner_keys, 'besthand');
					this.board.clearTable();
					this.clearPlayers();
					return 1;
				}

				return 0;
			}

			//Set up bets for beginning of round (new deal)
			if (mv[0] == 'ante') {
				this.game.queue.splice(qe, 1);

				this.board.render(true);

				let bbpi = this.game.state.big_blind_player - 1;
				//
				// Big Blind
				//
				if (this.game.state.player_credit[bbpi] <= this.game.state.big_blind) {
					this.updateLog(
						this.game.state.player_names[bbpi] +
							` posts remaining ${this.game.state.player_credit[bbpi]} chips for big blind and is removed from game`
					);
					//Put all the player tokens in the pot and have them pass / remove
					this.game.state.player_pot[bbpi] += this.game.state.player_credit[bbpi];
					this.game.state.player_credit[bbpi] = 0;
					this.game.state.passed[bbpi] = 1;
				} else {
					this.updateLog(
						`${this.game.state.player_names[bbpi]} posts big blind: ${this.formatWager(
							this.game.state.big_blind
						)}`
					);
					this.game.state.player_pot[bbpi] += this.game.state.big_blind;
					this.game.state.player_credit[bbpi] -= this.game.state.big_blind;
				}

				//
				// Small Blind
				//
				let sbpi = this.game.state.small_blind_player - 1;
				if (this.game.state.player_credit[sbpi] <= this.game.state.small_blind) {
					this.updateLog(
						this.game.state.player_names[sbpi] +
							` posts remaining ${this.game.state.player_credit[sbpi]} chips as small blind and is removed from the game`
					);
					this.game.state.player_pot[sbpi] += this.game.state.player_credit[sbpi];
					this.game.state.player_credit[sbpi] = 0;
					this.game.state.passed[sbpi] = 1;
				} else {
					this.updateLog(
						`${this.game.state.player_names[sbpi]} posts small blind: ${this.formatWager(
							this.game.state.small_blind
						)}`
					);
					this.game.state.player_pot[sbpi] += this.game.state.small_blind;
					this.game.state.player_credit[sbpi] -= this.game.state.small_blind;
				}

				if (!this.loadGamePreference('poker-hide-pot')) {
					let html = `<div class="poker-player-stake"><span class="stake-in-chips">${this.game.state.player_pot[bbpi]}</span></div>`;
					this.playerbox.replaceGraphics(html, '.poker-player-stake', bbpi + 1);
					html = `<div class="poker-player-stake"><span class="stake-in-chips">${this.game.state.player_pot[sbpi]}</span></div>`;
					this.playerbox.replaceGraphics(html, '.poker-player-stake', sbpi + 1);
				}

				this.game.queue.push('round'); //Start
				this.game.queue.push('announce'); //Print Hole cards to Log
			}

			/* Set up a round
  			       We don't splice it, so we keep coming back here after each player has taken their turn
  			       until we reach an endgame state which runs startNextRound and clears to queue
  		        */
			if (mv[0] === 'round') {
				// Start betting to the left of the big blind on first turn

				let lastToBet =
					this.game.state.flipped == 0 &&
					this.game.state.plays_since_last_raise < this.game.players.length
						? this.game.state.big_blind_player
						: this.game.state.button_player;
				for (let i = lastToBet; i <= lastToBet + this.game.players.length - 1; i++) {
					let player_to_go = i % this.game.players.length;
					if (player_to_go == 0) {
						player_to_go = this.game.players.length;
					}
					this.game.queue.push('turn\t' + player_to_go);
				}
			}

			if (mv[0] === 'call') {
				let player = parseInt(mv[1]);

				let amount_to_call = this.game.state.required_pot - this.game.state.player_pot[player - 1];

				if (amount_to_call <= 0) {
					console.error('Zero/Negative Call');
				}

				if (this.game.state.player_credit[player - 1] === amount_to_call) {
					this.game.state.all_in = true;
					this.updateLog(this.game.state.player_names[player - 1] + ' goes all in to call');
					if (this.game.player !== player) {
						this.displayPlayerNotice(`<div class="plog-update">all in!</div>`, player);
					}
				} else {
					this.updateLog(
						this.game.state.player_names[player - 1] +
							' calls to match ' +
							this.formatWager(this.game.state.required_pot)
					);
					if (this.game.player !== player) {
						this.displayPlayerNotice(`<div class="plog-update">calls</div>`, player);
					}
				}

				this.game.state.plays_since_last_raise++;

				await this.animateBet(player, amount_to_call);

				this.game.state.player_pot[player - 1] += amount_to_call;
				this.game.state.player_credit[player - 1] -= amount_to_call;

				this.game.queue.splice(qe, 1);

				return 1;
			}

			if (mv[0] === 'fold') {
				let player = parseInt(mv[1]);

				this.updateLog(
					this.game.state.player_names[player - 1] +
						` folds with ${this.formatWager(this.game.state.player_pot[player - 1])}`
				);

				this.game.stats[this.game.players[player - 1]].folds++;
				this.game.state.passed[player - 1] = 1;
				this.game.state.last_fold = player;
				this.game.queue.splice(qe, 1);

				this.game.state.plays_since_last_raise++;

				if (this.browser_active) {
					if (this.game.player !== player) {
						this.displayPlayerNotice(`<div class="plog-update">folds</div>`, player);
						this.playerbox.addClass('folded', player);
					} else {
						this.displayHand();
						this.ignore_notifications = true;
					}
				}
			}

			if (mv[0] === 'allin') {
				this.game.queue.splice(qe, 1);
				this.game.state.plays_since_last_raise++;
				return 1;
			}

			if (mv[0] === 'check') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);
				this.updateLog(this.game.state.player_names[player - 1] + ' checks.');
				if (this.game.player !== player && this.browser_active) {
					this.displayPlayerNotice(`<div class="plog-update">checks</div>`, player);
				}
				this.game.state.plays_since_last_raise++;

				/*let qs = this.playerbox.replaceGraphics(`<div class="poker-player-stake"><span class="stake-in-chips">${this.game.state.player_pot[player - 1]}</span></div>`, ".poker-player-stake", player); 
		        if (this.loadGamePreference("poker-hide-pot")){
		            setTimeout(()=> {
		              document.querySelector(qs).classList.add("invisible");
		            }, 500);
		        }*/

				return 1;
			}

			if (mv[0] === 'raise') {
				let player = parseInt(mv[1]);
				let raise = parseInt(mv[2]);

				let call_portion = this.game.state.required_pot - this.game.state.player_pot[player - 1];
				let raise_portion = raise - call_portion;

				this.game.state.plays_since_last_raise = 1;

				// Update message before animation...
				let raise_message = `raises ${this.formatWager(raise_portion)}`;

				if (this.game.state.player_credit[player - 1] == raise) {
					this.game.state.all_in = true;
					raise_message = `goes all in`;
				}

				if (this.game.player !== player) {
					this.displayPlayerNotice(`<div class="plog-update">${raise_message}</div>`, player);
				}

				await this.animateBet(player, raise);

				this.game.state.player_credit[player - 1] -= raise;
				this.game.state.player_pot[player - 1] += raise;
				this.game.state.last_raise = raise_portion;
				this.game.state.required_pot += raise_portion;

				raise_message += ` to ${this.formatWager(this.game.state.player_pot[player - 1])}`;

				if (call_portion > 0) {
					if (raise_portion > 0) {
						this.updateLog(
							`${this.game.state.player_names[player - 1]} calls and ${raise_message}`
						);
					} else {
						// This condition shouldn't exist... no raise is just a call (a different queue command)
						this.updateLog(
							`${this.game.state.player_names[player - 1]} calls ${this.formatWager(call_portion)}`
						);
					}
				} else {
					this.updateLog(`${this.game.state.player_names[player - 1]} ${raise_message}`);
				}
				this.game.queue.splice(qe, 1);

				return 1;
			}
		}

		return 1;
	}
}

module.exports = PokerQueue;
