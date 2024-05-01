
	handleGameLoop() {

		///////////
		// QUEUE //
		///////////
		if (this.game.queue.length > 0) {

			let qe = this.game.queue.length - 1;
			let mv = this.game.queue[qe].split('\t');
			let shd_continue = 1;

			if (this.browser_active) {
				this.pot.render();
			}

			if (mv[0] === 'winner') {
				this.displayPlayers(true); //to update chips before game_over
				this.game.queue = [];
				this.game.crypto = null;
				this.settleDebt();
				this.sendGameOverTransaction(
					this.game.players[parseInt(mv[1])],
					'elimination'
				);
				return 0;
			}

			if (mv[0] === 'newround') {
				//
				// clear displayed cards...
				//
				for (let i = 1; i <= this.game.players; i++) {
					this.playerbox.updateGraphics('', i);
				}

				this.game.state.round++;

				//Shift dealer, small blind, and big blind
				this.game.state.button_player--; //dealer
				if (this.game.state.button_player < 1) {
					this.game.state.button_player = this.game.players.length;
				}

				this.game.state.small_blind_player =
					this.game.state.button_player - 1;
				if (this.game.state.small_blind_player < 1) {
					this.game.state.small_blind_player =
						this.game.players.length;
				}

				this.game.state.big_blind_player =
					this.game.state.small_blind_player - 1;
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
				if (
					this.game.blind_mode == 'increase' &&
					this.game.state.round % 5 == 0
				) {
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
				this.game.state.pot = 0;
				this.game.state.last_raise = this.game.state.big_blind;
				this.game.state.required_pot = this.game.state.big_blind;
				this.game.state.all_in = false; //we are stupidly testing for all_in on the display players

				for (let i = 0; i < this.game.players.length; i++) {
					this.game.state.passed[i] = 0;
					this.game.state.player_pot[i] = 0;
					this.game.stats[this.game.players[i]].hands++;
				}

				this.startRound();
				return 1;
			}

			//
			// turns "resolve"
			//
			if (mv[0] === 'resolve') {
				let last_mv = this.game.queue[qe - 1].split('\t');
				if (mv[1] === last_mv[0]) {
					this.game.queue.splice(qe - 1, 2);
				} else {
					console.error('Unexpected resolve in queue');
					this.game.queue.splice(qe, 1);
				}
				return 1;
			}

			if (mv[0] === 'checkplayers') {
				this.game.queue.splice(qe, 1);

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
					for (
						let i = this.game.state.player_credit.length - 1;
						i >= 0;
						i--
					) {
						if (this.game.state.player_credit[i] <= 0) {
							this.updateLog(`Player ${i + 1} (${this.game.state.player_names[i]}) has been eliminated from the game.`);
							removal = true;
							//
							// remove any players who are missing
							//
							if (this.game.players[i] == this.publicKey){ am_i_out = true; }

							this.removePlayerFromState(i);
							this.removePlayer(this.game.players[i]);

							//Adjust dealer for each removed player
							if (i < this.game.state.button_player) {
								this.game.state.button_player--;
								if (this.game.state.button_player < 1) {
									this.game.state.button_player =
										this.game.players.length;
								}
							}
						}
					}
				}

				if (removal) {
					this.halted = 1;

					if (am_i_out){
						this.updateStatusForPlayerOut("You have been eliminated!", true);
					}else{
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
					let winnings =
						this.game.state.pot -
						this.game.state.player_pot[player_left_idx];

					let logMsg = `${
						this.game.state.player_names[player_left_idx]
					} wins ${this.formatWager(
						this.game.state.pot
					)} (${this.formatWager(winnings, false)} net)`;

					this.updateLog(logMsg);
					
					//this.game.state.player_credit[player_left_idx] +=	this.game.state.pot;
					
					this.game.stats[this.game.players[player_left_idx]]
						.wins++;

					if (this.game.state.flipped == 0){
						if (this.game.state.pot == this.game.state.big_blind + this.game.state.small_blind){
							// No one called or raised --> walk
							for (let p of this.game.players){
								this.game.stats[p].walks++;
							}
						}
					}

					//So that userline updates with winner
					this.game.state.winners = [player_left_idx+1];

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
									let amount_to_send =
										this.convertChipsToCrypto(
											this.game.state.player_pot[i]
										);

									if (this.settleNow) {
										let ts = new Date().getTime();
										this.rollDice();
										let uh = this.game.dice;
										this.settlement.push(
											`RECEIVE\t${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
										);
										this.settlement.push(
											`SEND\t${this.game.players[i]}\t${this.game.players[player_left_idx]}\t${amount_to_send}\t${ts}\t${uh}\t${this.game.crypto}`
										);
									} else {
										this.game.state.debt[i] +=
											this.game.state.player_pot[i];
										this.game.state.debt[player_left_idx] -=
											this.game.state.player_pot[i];
									}
								}
							}
						}
					}

					// if everyone has folded - start a new round
					this.halted = 1;

					let msg = `${this.game.state.player_names[player_left_idx]} wins the round`;
					if (this.game.player == player_left_idx + 1){
						msg = "You win the round";
					}

					this.cardfan.hide();
					this.animateWin(this.game.state.pot, [player_left_idx]);
					this.playerAcknowledgeNotice(msg, async () => {
						this.settleLastRound([this.game.players[player_left_idx]], "fold");
						this.clearTable();
					});

					return 0;

				}
				this.game.state.plays_since_last_raise++;

				//
				// Is this the end of betting?
				//
				if (
					this.game.state.plays_since_last_raise >
					this.game.players.length
				) {
					//Is this the end of the hand?
					if (this.game.state.flipped == 5) {
						this.playerbox.setInactive();

						this.game.queue = [];
						let first_scorer = 0;

						for (
							let i = 1;
							i <= this.game.state.passed.length;
							i++
						) {
							if (this.game.state.passed[i - 1] == 0) {
								first_scorer = first_scorer || i;
								this.game.state.player_cards_required++;
								this.game.state.player_cards[i] = [];

								this.game.stats[this.game.players[i-1]].showdowns++;
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
						let cards_to_flip =
							this.game.state.flipped == 0 ? 3 : 1;

						this.game.state.flipped += cards_to_flip;

						//We can't just push "announce", have to reset queue to clear out any remaining turns
						this.game.queue = ['round', 'announce'];
						this.game.queue.push(
							`POOLDEAL\t1\t${cards_to_flip}\t1`
						);

						this.game.state.plays_since_last_raise = 0;
						return 1;
					}
				}

				if (this.game.state.passed[player_to_go - 1] == 1) {
					//
					// we auto-clear without need for player to broadcast
					//
					this.game.queue.splice(qe, 1);
					return 1;
				} else if (
					this.game.state.player_credit[player_to_go - 1] == 0
				) {
					//
					// we auto-clear without need for player to broadcast
					//
					this.game.queue.splice(qe, 1);
					return 1;
				} else {
					this.playerbox.setActive(player_to_go);

					if (player_to_go == this.game.player) {
						this.playerTurn();
					} else {
						this.displayPlayerNotice(
							`<div class="plog-update">active player</div>`,
							player_to_go
						);
						if (this.game.state.passed[this.game.player - 1]) {
							this.updateStatus('waiting for next round');
						} else {
							this.updateStatus(
								'waiting for ' +
									this.game.state.player_names[
										player_to_go - 1
									]
							);
						}
					}
					return 0;
				}
				shd_continue = 0;
			}

			if (mv[0] === 'announce') {
				this.game.queue.splice(qe, 1);

				if (this.game.state.flipped === 0) {
					if (this.game.player > 0) {
						this.updateLog(
							`*** HOLE CARDS *** [${this.cardToHuman(
								this.game.deck[0].hand[0]
							)} ${this.cardToHuman(this.game.deck[0].hand[1])}]`
						);
					}
					return 1;
				}

				this.animateRiver();

				if (this.game.state.flipped === 3) {
					this.updateLog(
						`*** FLOP *** [${this.cardToHuman(
							this.game.pool[0].hand[0]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(this.game.pool[0].hand[2])}]`
					);
				}
				if (this.game.state.flipped === 4) {
					this.updateLog(
						`*** TURN *** [${this.cardToHuman(
							this.game.pool[0].hand[0]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[2]
						)}] [${this.cardToHuman(this.game.pool[0].hand[3])}]`
					);
				}
				if (this.game.state.flipped === 5) {
					this.updateLog(
						`*** RIVER *** [${this.cardToHuman(
							this.game.pool[0].hand[0]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[1]
						)} ${this.cardToHuman(
							this.game.pool[0].hand[2]
						)}] [${this.cardToHuman(
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
				this.game.state.player_cards[scorer].push(
					this.returnCardFromDeck(card1)
				);
				this.game.state.player_cards[scorer].push(
					this.returnCardFromDeck(card2)
				);

				let playercards = `
          <div class="other-player-hand hand tinyhand">
            <div class="card"><img src="${this.card_img_dir}/${this.game.deck[0].cards[card1].name}"></div>
            <div class="card"><img src="${this.card_img_dir}/${this.game.deck[0].cards[card2].name}"></div>
          </div>
        `;
				this.playerbox.updateGraphics(playercards, scorer);

				//Everyone can use the pool
				for (let i = 0; i < 5; i++) {
					this.game.state.player_cards[scorer].push(
						this.returnCardFromDeck(this.game.pool[0].hand[i])
					);
				}

				this.game.state.player_cards_reported++;

				if (
					this.game.state.player_cards_reported !==
					this.game.state.player_cards_required
				) {
					//If not everyone has reported there hand yet, find the next in sequence from this scorer
					let next_scorer = 0;
					for (
						let i = scorer;
						i < this.game.state.passed.length;
						i++
					) {
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
				// PLAYER WINS HAND HERE
				//
				let winners = [];
				let winner_keys = [];

				var updateHTML = '';
				var winlist = [];

				for (let i = 1; i <= this.game.players.length; i++){
					this.playerbox.renderUserline(`<span></span><div class="saito-balance">${this.formatWager(this.game.state.player_credit[i-1])}</div>`, i);			
				}

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
							let w = this.pickWinner(
								winlist[k].player_hand,
								score
							);
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

				console.log("Showdown:", winlist);

				// ... and anyone else who ties
				for (let p = 0; p < winlist.length; p++) {
					if (
						this.pickWinner(
							topPlayer.player_hand,
							winlist[p].player_hand
						) == 3
					) {
						winners.push(winlist[p].player - 1);
						winner_keys.push(
							this.game.players[winlist[p].player - 1]
						);
					}
				}

				// Put my key first, if it is in the list
				winners.sort((a, b) => {
					if (b == this.game.player - 1){
						return 1;
					}
					return 0;
				});

				// split winnings among winners
				let pot_size = Math.floor(this.game.state.pot / winners.length);
				let winnerStr = '';

				// single winner gets everything

				let logMsg =
					winners.length > 1
						? `split the pot for ${this.formatWager(pot_size)} each`
						: `wins ${this.formatWager(
							this.game.state.pot
						  )} (${this.formatWager(
							this.game.state.pot -
									this.game.state.player_pot[winners[0]],
							false
						  )} net)`;

				for (let i = 0; i < winners.length; i++) {
					if (i >= 1){
						if (i + 1 < winners.length) {
							winnerStr += ', ';
						}else{
							winnerStr += ", and ";
						}
					} 
					this.game.stats[this.game.players[winners[i]]].wins++;
					if (winners[i] == this.game.player - 1){
						winnerStr += "You";
					}else{
						winnerStr += this.game.state.player_names[winners[i]];	
					}
					
					//this.game.state.player_credit[winners[i]] += pot_size;
					//this.game.state.pot -= pot_size;

					this.game.state.winners.push(winners[i]+1);

				}

				//update log
				this.updateLog(winnerStr + logMsg);

				// update splash!
				if (winners.length == 1) {
					if (winners[0] == this.game.player -1 ){
						winnerStr += ` win with ${winning_hand.toUpperCase()}!`;
					}else{
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

					let player_hand = this.game.state.player_cards[
						pl.player
					].slice(0, 2);
					updateHTML =
						`<div class="player-result">` +
						this.handToHTML(
							pl.player_hand.cards_to_score,
							player_hand
						) +
						'</div>' +
						updateHTML;

					updateHTML = `<div class="h3">${
						this.game.state.player_names[pl.player - 1]
					}: ${pl.player_hand.hand_description}</div>${updateHTML}`;


				});

				this.updateHTML = updateHTML;

				//
				// non-winners send wagers to winner
				//
				if (this.game.crypto) {
					for (let ii = 0; ii < this.game.players.length; ii++) {
						for (let i = 0; i < winners.length; i++) {
							if (
								!winners.includes(ii) &&
								this.game.state.player_pot[ii] > 0
							) {
								let amount_to_send = this.convertChipsToCrypto(
									this.game.state.player_pot[ii] /
										winners.length
								);
								//To Do: check math on this... and make more efficient (fewer transfers total if split pot)

								if (this.settleNow) {
									// do not reformat -- adding whitespace screws with API
									let ts = new Date().getTime();
									this.rollDice();
									let uh = this.game.dice;
									this.settlement.push(
										`RECEIVE\t${this.game.players[ii]}\t${
											this.game.players[winners[i]]
										}\t${amount_to_send}\t${ts}\t${uh}\t${
											this.game.crypto
										}`
									);
									this.settlement.push(
										`SEND\t${this.game.players[ii]}\t${
											this.game.players[winners[i]]
										}\t${amount_to_send}\t${ts}\t${uh}\t${
											this.game.crypto
										}`
									);
								} else {
									let share_of_winnings =
										this.game.state.player_pot[ii] /
										winners.length;
									this.game.state.debt[ii] +=
										share_of_winnings;
									this.game.state.debt[winners[i]] -=
										share_of_winnings;
								}
							}
						}
					}
				}


				this.halted = 1;
				this.cardfan.hide();
				this.animateWin(pot_size, winners);
				this.playerAcknowledgeNotice(winnerStr, async () => {
					this.settleLastRound(winner_keys, "besthand");
					this.clearTable();
				});

				return 0;
			}

			//Set up bets for beginning of round (new deal)
			if (mv[0] == 'ante') {
				this.game.queue.splice(qe, 1);

				this.displayBoard(); //Clean HTML

				let bbpi = this.game.state.big_blind_player - 1;
				//
				// Big Blind
				//
				if (
					this.game.state.player_credit[bbpi] <=
					this.game.state.big_blind
				) {
					this.updateLog(
						this.game.state.player_names[bbpi] +
							` posts remaining ${this.game.state.player_credit[bbpi]} chips for big blind and is removed from game`
					);
					//Put all the player tokens in the pot and have them pass / remove
					this.game.state.player_pot[bbpi] +=
						this.game.state.player_credit[bbpi];
					//this.game.state.pot += this.game.state.player_credit[bbpi];
					//this.game.state.player_credit[bbpi] = 0;
					this.animateBet(this.game.state.player_credit[bbpi], bbpi);
					this.game.state.passed[bbpi] = 1;
				} else {
					this.updateLog(
						`${
							this.game.state.player_names[bbpi]
						} posts big blind: ${this.formatWager(
							this.game.state.big_blind
						)}`
					);
					this.game.state.player_pot[bbpi] +=
						this.game.state.big_blind;
					//this.game.state.pot += this.game.state.big_blind;
					//this.game.state.player_credit[bbpi] -=
					//	this.game.state.big_blind;
					this.animateBet(this.game.state.big_blind, bbpi);
				}

				//
				// Small Blind
				//
				let sbpi = this.game.state.small_blind_player - 1;
				if (
					this.game.state.player_credit[sbpi] <=
					this.game.state.small_blind
				) {
					this.updateLog(
						this.game.state.player_names[sbpi] +
							` posts remaining ${this.game.state.player_credit[sbpi]} chips as small blind and is removed from the game`
					);
					this.game.state.player_pot[sbpi] +=
						this.game.state.player_credit[sbpi];
					//this.game.state.pot += this.game.state.player_credit[sbpi];
					//this.game.state.player_credit[sbpi] = 0;
					this.animateBet(this.game.state.player_credit[sbpi], sbpi);
					this.game.state.passed[sbpi] = 1;
				} else {
					this.updateLog(
						`${
							this.game.state.player_names[sbpi]
						} posts small blind: ${this.formatWager(
							this.game.state.small_blind
						)}`
					);
					this.game.state.player_pot[sbpi] +=
						this.game.state.small_blind;
					//this.game.state.pot += this.game.state.small_blind;
					//this.game.state.player_credit[sbpi] -=
					//	this.game.state.small_blind;
					this.animateBet(this.game.state.small_blind, sbpi);
				}

				this.displayPlayers(true); //Update Chip stacks after betting
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
					this.game.state.plays_since_last_raise <
						this.game.players.length
						? this.game.state.big_blind_player
						: this.game.state.button_player;
				for (
					let i = lastToBet;
					i <= lastToBet + this.game.players.length - 1;
					i++
				) {
					let player_to_go = i % this.game.players.length;
					if (player_to_go == 0) {
						player_to_go = this.game.players.length;
					}
					this.game.queue.push('turn\t' + player_to_go);
				}
			}

			/* WE programmatically determine here how much the call is*/
			if (mv[0] === 'call') {
				let player = parseInt(mv[1]);

				let amount_to_call =
					this.game.state.required_pot -
					this.game.state.player_pot[player - 1];

				if (amount_to_call <= 0) {
					console.error('Zero/Negative Call');
				}


				if (this.game.state.player_credit[player - 1] === amount_to_call) {
					this.game.state.all_in = true;
					this.updateLog(
						this.game.state.player_names[player - 1] +
							' goes all in to call'
					);
					if (this.game.player !== player) {
					this.displayPlayerNotice(
						`<div class="plog-update">All in!</div>`,
						player
					);
				}

				} else {
					this.updateLog(
						this.game.state.player_names[player - 1] + ' calls'
					);
					if (this.game.player !== player) {
						this.displayPlayerNotice(
							`<div class="plog-update">calls</div>`,
							player
						);
					}

				}

				//
				// reset plays since last raise
				//
				
				this.game.state.player_pot[player - 1] += amount_to_call;
				this.animateBet(amount_to_call, player - 1, true);
				//this.game.state.pot += amount_to_call;
				//this.game.state.player_credit[player - 1] -= amount_to_call;
				
				this.game.queue.splice(qe, 1);

				this.displayPlayerStack(player); //Here we don't want to hide cards


				return 0;
			}

			if (mv[0] === 'fold') {
				let player = parseInt(mv[1]);

				this.updateLog(
					this.game.state.player_names[player - 1] + ' folds'
				);

				this.game.stats[this.game.players[player - 1]].folds++;
				this.game.state.passed[player - 1] = 1;
				this.game.state.last_fold = player;
				this.game.queue.splice(qe, 1);

				if (this.browser_active) {
					if (this.game.player !== player) {
						this.displayPlayerNotice(
							`<div class="plog-update">folds</div>`,
							player
						);
					} else {
						this.displayHand();
					}
				}

			}

			if (mv[0] === 'check') {
				let player = parseInt(mv[1]);
				this.game.queue.splice(qe, 1);
				this.updateLog(
					this.game.state.player_names[player - 1] + ' checks.'
				);
				if (this.game.player !== player && this.browser_active) {
					this.displayPlayerLog(
						`<div class="plog-update">checks</div>`,
						player
					);
				}
				return 1;
			}

			if (mv[0] === 'raise') {
				let player = parseInt(mv[1]);
				let raise = parseInt(mv[2]); // raise is a float now, i don't think so !!!!

				let call_portion =
					this.game.state.required_pot -
					this.game.state.player_pot[player - 1];
				let raise_portion = raise - call_portion;

				this.game.state.plays_since_last_raise = 1;

				//this.game.state.player_credit[player - 1] -= raise;
				this.game.state.player_pot[player - 1] += raise;
				//this.game.state.pot += raise;

				if (this.game.state.player_credit[player - 1] === raise) {
					this.game.state.all_in = true;
					raise_message = `goes all in `;
					if (this.game.player !== player && this.browser_active) {
						this.displayPlayerNotice(
							`<div class="plog-update">all in!</div>`,
							player
						);
					}
				}

				this.animateBet(raise, player - 1, true);

				this.game.state.last_raise = raise_portion;
				this.game.state.required_pot += raise_portion;

				let raise_message = `raises ${this.formatWager(
					raise_portion
				)} `;

				if (call_portion > 0) {
					if (raise_portion > 0) {
						this.updateLog(
							`${
								this.game.state.player_names[player - 1]
							} ${raise_message}to ${this.formatWager(
								this.game.state.player_pot[player - 1]
							)}`
						);
						if (
							this.game.player !== player &&
							this.browser_active
						) {
							this.displayPlayerNotice(
								`<div class="plog-update">raises ${this.formatWager(
									raise_portion
								)}</div>`,
								player
							);
						}
					} else {
						this.updateLog(
							`${
								this.game.state.player_names[player - 1]
							} calls ${this.formatWager(call_portion)}`
						);
						if (
							this.game.player !== player &&
							this.browser_active
						) {
							this.displayPlayerNotice(
								`<div class="plog-update">calls ${this.formatWager(
									call_portion
								)}</div>`,
								player
							);
						}
					}
				} else {
					this.updateLog(
						`${
							this.game.state.player_names[player - 1]
						} ${raise_message}to ${this.formatWager(
							this.game.state.player_pot[player - 1]
						)}`
					);
					if (this.game.player !== player && this.browser_active) {
						this.displayPlayerNotice(
							`<div class="plog-update">raises ${this.formatWager(
								raise
							)}</div>`,
							player
						);
					}
				}
				this.game.queue.splice(qe, 1);
				this.displayPlayerStack(player); //Here we don't want to hide cards

				return 0;
			}

			//
			// avoid infinite loops
			//
			if (shd_continue == 0) {
				return 0;
			}
		} else {
		}
		return 1;
	}

