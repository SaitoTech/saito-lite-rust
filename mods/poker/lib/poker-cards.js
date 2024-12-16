class PokerCards {

	returnCardFromDeck(idx) {
		let deck = this.returnDeck();
		let card = deck[idx];
		return card.name.substring(0, card.name.indexOf('.'));
	}

	returnDeck() {
		var deck = {};

		deck['1'] = { name: 'S1.png' };
		deck['2'] = { name: 'S2.png' };
		deck['3'] = { name: 'S3.png' };
		deck['4'] = { name: 'S4.png' };
		deck['5'] = { name: 'S5.png' };
		deck['6'] = { name: 'S6.png' };
		deck['7'] = { name: 'S7.png' };
		deck['8'] = { name: 'S8.png' };
		deck['9'] = { name: 'S9.png' };
		deck['10'] = { name: 'S10.png' };
		deck['11'] = { name: 'S11.png' };
		deck['12'] = { name: 'S12.png' };
		deck['13'] = { name: 'S13.png' };
		deck['14'] = { name: 'C1.png' };
		deck['15'] = { name: 'C2.png' };
		deck['16'] = { name: 'C3.png' };
		deck['17'] = { name: 'C4.png' };
		deck['18'] = { name: 'C5.png' };
		deck['19'] = { name: 'C6.png' };
		deck['20'] = { name: 'C7.png' };
		deck['21'] = { name: 'C8.png' };
		deck['22'] = { name: 'C9.png' };
		deck['23'] = { name: 'C10.png' };
		deck['24'] = { name: 'C11.png' };
		deck['25'] = { name: 'C12.png' };
		deck['26'] = { name: 'C13.png' };
		deck['27'] = { name: 'H1.png' };
		deck['28'] = { name: 'H2.png' };
		deck['29'] = { name: 'H3.png' };
		deck['30'] = { name: 'H4.png' };
		deck['31'] = { name: 'H5.png' };
		deck['32'] = { name: 'H6.png' };
		deck['33'] = { name: 'H7.png' };
		deck['34'] = { name: 'H8.png' };
		deck['35'] = { name: 'H9.png' };
		deck['36'] = { name: 'H10.png' };
		deck['37'] = { name: 'H11.png' };
		deck['38'] = { name: 'H12.png' };
		deck['39'] = { name: 'H13.png' };
		deck['40'] = { name: 'D1.png' };
		deck['41'] = { name: 'D2.png' };
		deck['42'] = { name: 'D3.png' };
		deck['43'] = { name: 'D4.png' };
		deck['44'] = { name: 'D5.png' };
		deck['45'] = { name: 'D6.png' };
		deck['46'] = { name: 'D7.png' };
		deck['47'] = { name: 'D8.png' };
		deck['48'] = { name: 'D9.png' };
		deck['49'] = { name: 'D10.png' };
		deck['50'] = { name: 'D11.png' };
		deck['51'] = { name: 'D12.png' };
		deck['52'] = { name: 'D13.png' };

		return deck;
	}

	/* Card to UI conversions */
	cardToHuman(card) {
		if (!this.game.deck[0].cards[card]) {
			return '';
		}
		let h = this.game.deck[0].cards[card].name;
		h = h.replace('.png', '');
		h = h.replace('13', 'K');
		h = h.replace('12', 'Q');
		h = h.replace('11', 'J');
		h = h.replace('1', 'A');
		h = h.replace('A0', '10'); //restore ten
		let suit = h[0];
		h = h.substring(1);
		switch (suit) {
		case 'H':
			return h + 'h';
			break;
		case 'D':
			return h + 'd';
			break;
		case 'S':
			return h + 's';
			break;
		case 'C':
			return h + 'c';
			break;
		}
		return h;
	}

	toHuman(hand) {
		var humanHand = ' <span class=\'htmlhand\'>';
		hand.forEach((h) => {
			h = h.replace(
				'H',
				'<span style=\'color:red\'><span class=\'suit\'>&hearts;</span>'
			);
			h = h.replace(
				'D',
				'<span style=\'color:red\'><span class=\'suit\'>&diams;</span>'
			);
			h = h.replace(
				'S',
				'<span style=\'color:black\'><span class=\'suit\'>&spades;</span>'
			);
			h = h.replace(
				'C',
				'<span style=\'color:black\'><span class=\'suit\'>&clubs;</span>'
			);
			h = h.replace('13', 'K');
			h = h.replace('12', 'Q');
			h = h.replace('11', 'J');
			h = h.replace('1', 'A');
			h = h.replace('A0', '10');
			h = '<span class=\'htmlCard\'>' + h + '</span></span>';
			humanHand += h;
		});
		humanHand += '</span> ';
		return humanHand;
	}


	handToHTML(hand, pocket) {
		let html = '<div class=\'htmlCards pocket\'>';
		pocket.forEach((card) => {
			html += `<img class="card ${
				hand.includes(card) ? 'used' : 'not_used'
			}" src="${this.card_img_dir}/${card}.png">`;
		});
		html += '</div> ';

		html += '<div class=\'htmlCards pool\'>';
		this.game.pool[0].hand.forEach((card) => {
			card = this.game.pool[0].cards[card].name.replace('.png', '');
			html += `<img class="card ${
				hand.includes(card) ? 'used' : 'not_used'
			}" src="${this.card_img_dir}/${card}.png">`;
		});
		html += '</div> ';
		return html;
	}



	/* Functions to analyze hands and compare them*/

	pickWinner(score1, score2) {
		let hands_differ = false;

		//Check if hands are different
		for (let i = 0; i < score1.cards_to_score.length; i++) {
			if (score1.cards_to_score[i] !== score2.cards_to_score[i]) {
				hands_differ = true;
			}
		}
		if (!hands_differ) {
			return 3; // == tie
		}

		if (
			score1.hand_description == 'royal flush' &&
			score2.hand_description == 'royal flush'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				// first card will be aces, so we only need to compare the first entry
				if (
					this.returnHigherCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				} else {
					return 2;
				}
			}
		}

		if (score1.hand_description == 'royal flush') {
			return 1;
		}
		if (score2.hand_description == 'royal flush') {
			return 2;
		}

		if (
			score1.hand_description == 'straight flush' &&
			score2.hand_description == 'straight flush'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'straight flush') {
			return 1;
		}
		if (score2.hand_description == 'straight flush') {
			return 2;
		}

		if (
			score1.hand_description == 'four-of-a-kind' &&
			score2.hand_description == 'four-of-a-kind'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score1.cards_to_score[4]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score2.cards_to_score[4]
			) {
				return 2;
			}
			return 3;
		}
		if (score1.hand_description == 'four-of-a-kind') {
			return 1;
		}
		if (score2.hand_description == 'four-of-a-kind') {
			return 2;
		}

		if (
			score1.hand_description == 'full house' &&
			score2.hand_description == 'full house'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[3],
					score2.cards_to_score[3]
				) == score1.cards_to_score[3]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[3],
					score2.cards_to_score[3]
				) == score2.cards_to_score[3]
			) {
				return 2;
			}
			return 3;
		}
		if (score1.hand_description == 'full house') {
			return 1;
		}
		if (score2.hand_description == 'full house') {
			return 2;
		}

		if (
			score1.hand_description == 'flush' &&
			score2.hand_description == 'flush'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'flush') {
			return 1;
		}
		if (score2.hand_description == 'flush') {
			return 2;
		}

		if (
			score1.hand_description == 'straight' &&
			score2.hand_description == 'straight'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'straight') {
			return 1;
		}
		if (score2.hand_description == 'straight') {
			return 2;
		}

		if (
			score1.hand_description == 'three-of-a-kind' &&
			score2.hand_description == 'three-of-a-kind'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			for (let i = 3; i < 5; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'three-of-a-kind') {
			return 1;
		}
		if (score2.hand_description == 'three-of-a-kind') {
			return 2;
		}

		if (
			score1.hand_description == 'two pair' &&
			score2.hand_description == 'two pair'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score1.cards_to_score[2]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score2.cards_to_score[2]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score1.cards_to_score[4]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score2.cards_to_score[4]
			) {
				return 2;
			}
			return 3;
		}

		if (score1.hand_description == 'two pair') {
			return 1;
		}
		if (score2.hand_description == 'two pair') {
			return 2;
		}

		if (
			score1.hand_description == 'pair' &&
			score2.hand_description == 'pair'
		) {
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score1.cards_to_score[0]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[0],
					score2.cards_to_score[0]
				) == score2.cards_to_score[0]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score1.cards_to_score[2]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[2],
					score2.cards_to_score[2]
				) == score2.cards_to_score[2]
			) {
				return 2;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score1.cards_to_score[4]
			) {
				return 1;
			}
			if (
				this.returnHigherNumberCard(
					score1.cards_to_score[4],
					score2.cards_to_score[4]
				) == score2.cards_to_score[4]
			) {
				return 2;
			}
			return 3;
		}

		if (score1.hand_description == 'pair') {
			return 1;
		}
		if (score2.hand_description == 'pair') {
			return 2;
		}

		if (
			score1.hand_description == 'highest card' &&
			score2.hand_description == 'highest card'
		) {
			for (let i = 0; i < score1.cards_to_score.length; i++) {
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score1.cards_to_score[i]
				) {
					return 1;
				}
				if (
					this.returnHigherNumberCard(
						score1.cards_to_score[i],
						score2.cards_to_score[i]
					) == score2.cards_to_score[i]
				) {
					return 2;
				}
			}
			return 3;
		}
		if (score1.hand_description == 'highest card') {
			return 1;
		}
		if (score2.hand_description == 'highest card') {
			return 2;
		}
	}

	scoreHand(hand) {
		let x = this.convertHand(hand);
		let suite = x.suite;
		let val = x.val;

		let idx = 0;
		let pairs = [];
		let three_of_a_kind = [];
		let four_of_a_kind = [];
		let straights = [];
		let full_house = [];

		//
		// identify pairs
		//
		idx = 1;
		while (idx < 14) {
			let x = this.isTwo(suite, val, idx);
			if (x == 0) {
				idx = 14;
			} else {
				pairs.push(x);
				idx = x + 1;
			}
		}
		pairs.sort((a, b) => a - b);

		//
		// identify triples
		//
		idx = 1;
		while (idx < 14) {
			let x = this.isThree(suite, val, idx);
			if (x == 0) {
				idx = 14;
			} else {
				three_of_a_kind.push(x);
				idx = x + 1;
			}
		}
		three_of_a_kind.sort((a, b) => a - b);

		//
		// identify quintuples
		//
		idx = 1;
		while (idx < 14) {
			let x = this.isFour(suite, val, idx);
			if (x == 0) {
				idx = 14;
			} else {
				four_of_a_kind.push(x);
				idx = x + 1;
			}
		}

		//
		// identify straights
		//
		idx = 1;
		while (idx < 10) {
			let x = this.isStraight(suite, val, idx);
			if (x == 0) {
				idx = 11;
			} else {
				straights.push(x);
				idx = x + 1;
			}
		}

		//
		// remove triples and pairs that are four-of-a-kind
		//
		for (let i = 0; i < four_of_a_kind.length; i++) {
			for (var z = 0; z < three_of_a_kind.length; z++) {
				if (three_of_a_kind[z] === four_of_a_kind[i]) {
					three_of_a_kind.splice(z, 1);
				}
			}

			for (var z = 0; z < pairs.length; z++) {
				if (pairs[z] === four_of_a_kind[i]) {
					pairs.splice(z, 1);
				}
			}
		}

		//
		// remove pairs that are also threes
		//
		for (let i = 0; i < three_of_a_kind.length; i++) {
			for (var z = 0; z < pairs.length; z++) {
				if (pairs[z] === three_of_a_kind[i]) {
					pairs.splice(z, 1);
				}
			}
		}

		//
		// now ready to identify highest hand
		//
		// royal flush
		// straight flush
		// four-of-a-kind    x
		// full-house
		// flush
		// straight      x
		// three-of-a-kind    x
		// two-pair
		// pair        x
		// high card
		//
		let cards_to_score = [];
		let hand_description = '';
		let highest_card = [];

		//
		// ROYAL FLUSH
		//
		if (straights.includes(10)) {
			if (this.isFlush(suite, val) != '') {
				let x = this.isFlush(suite, val);
				if (
					this.isCardSuite(suite, val, 1, x) == 1 &&
					this.isCardSuite(suite, val, 13, x) == 1 &&
					this.isCardSuite(suite, val, 12, x) == 1 &&
					this.isCardSuite(suite, val, 11, x) == 1 &&
					this.isCardSuite(suite, val, 10, x) == 1
				) {
					cards_to_score.push('1' + x);
					cards_to_score.push('13' + x);
					cards_to_score.push('12' + x);
					cards_to_score.push('11' + x);
					cards_to_score.push('10' + x);
					hand_description = 'royal flush';
					return {
						cards_to_score: this.sortByValue(cards_to_score),
						hand_description: hand_description
					};
				}
			}
		}

		//
		// STRAIGHT FLUSH
		//
		if (straights.length > 0) {
			if (this.isFlush(suite, val) != '') {
				let x = this.isFlush(suite, val);
				for (let i = straights.length - 1; i >= 0; i--) {
					if (
						this.isCardSuite(suite, val, straights[i] + 4, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i] + 3, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i] + 2, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i] + 1, x) ==
							1 &&
						this.isCardSuite(suite, val, straights[i], x) == 1
					) {
						cards_to_score.push(straights[i] + 4 + x);
						cards_to_score.push(straights[i] + 3 + x);
						cards_to_score.push(straights[i] + 2 + x);
						cards_to_score.push(straights[i] + 1 + x);
						cards_to_score.push(straights[i] + x);
						hand_description = 'straight flush';
						return {
							cards_to_score: this.sortByValue(cards_to_score),
							hand_description: hand_description
						};
					}
				}
			}
		}

		//
		// FOUR OF A KIND
		//
		if (four_of_a_kind.length > 0) {
			if (four_of_a_kind.includes(1)) {
				cards_to_score = ['C1', 'D1', 'H1', 'S1'];
				highest_card = this.returnHighestCard(
					suite,
					val,
					cards_to_score
				);
				cards_to_score.push(highest_card);
				hand_description = 'four-of-a-kind';
				return {
					cards_to_score: cards_to_score,
					hand_description: hand_description
				};
			}

			cards_to_score = [
				'C' + four_of_a_kind[four_of_a_kind.length - 1],
				'D' + four_of_a_kind[four_of_a_kind.length - 1],
				'H' + four_of_a_kind[four_of_a_kind.length - 1],
				'S' + four_of_a_kind[four_of_a_kind.length - 1]
			];
			highest_card = this.returnHighestCard(suite, val, cards_to_score);
			hand_description = 'four-of-a-kind';
			cards_to_score.push(highest_card);
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// FULL HOUSE
		//
		if (three_of_a_kind.length == 2) {
			if (three_of_a_kind[0] > three_of_a_kind[1]) {
				pairs.push(three_of_a_kind.pop());
			} else {
				pairs.push(three_of_a_kind.shift());
			}
		}
		if (three_of_a_kind.length > 0 && pairs.length > 0) {
			let highest_suite = 'C';

			for (let i = 0; i < val.length; i++) {
				if (val[i] == three_of_a_kind[three_of_a_kind.length - 1]) {
					if (this.isHigherSuite(suite[i], highest_suite)) {
						highest_suite = suite[i];
					}
					cards_to_score.push(suite[i] + val[i]);
				}
			}
			highest_card =
				highest_suite + three_of_a_kind[three_of_a_kind.length - 1];

			for (let i = 0; i < val.length; i++) {
				if (val[i] == pairs[pairs.length - 1]) {
					cards_to_score.push(suite[i] + val[i]);
				}
				if (cards_to_score.length > 5) {
					cards_to_score.pop();
				}
			}

			hand_description = 'full house';
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description,
				highest_card: highest_card
			};
		}

		//
		// FLUSH
		//
		if (this.isFlush(suite, val) != '') {
			let x = this.isFlush(suite, val);
			let y = [];
			let has_ace = false;

			for (let i = 0; i < val.length; i++) {
				if (suite[i] == x) {
					y.push(val[i]);
				}
			}

			// y now contains only in-suite vals
			y.sort((a, b) => a - b);
			// aces high, shift manually if needed
			if (y[0] === 1) {
				y.push(1);
				y.splice(0, 1);
			}
			y.splice(0, y.length - 5);
			for (let i = y.length - 1; i >= 0; i--) {
				cards_to_score.push(x + y[i]);
			}

			hand_description = 'flush';
			return {
				cards_to_score: this.sortByValue(cards_to_score),
				hand_description: hand_description
			};
		}

		//
		// STRAIGHT
		//
		if (this.isStraight(suite, val) > 0) {
			let x = this.isStraight(suite, val);

			hand_description = 'straight';

			//ace hight straight
			if (x == 10) {
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 1));
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 13)
				);
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 12)
				);
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 11)
				);
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, 10)
				);

				return {
					cards_to_score: cards_to_score,
					hand_description: hand_description
				};
			}
			//ace low straight
			if (x == 1) {
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 5));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 4));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 3));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 2));
				cards_to_score.push(this.returnHighestSuiteCard(suite, val, 1));

				return {
					cards_to_score: cards_to_score,
					hand_description: hand_description
				};
			}
			for (let i = 4; i >= 0; i--) {
				cards_to_score.push(
					this.returnHighestSuiteCard(suite, val, x + i)
				);
			}
			return {
				cards_to_score: this.sortByValue(cards_to_score),
				hand_description: hand_description
			};
		}

		//
		// THREE OF A KIND
		//
		if (three_of_a_kind.length > 0) {
			let x = three_of_a_kind[three_of_a_kind.length - 1];
			let y = [];

			let cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == x) {
					y.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}

			for (let i = 0; i < y.length; i++) {
				cards_to_score.push(y[i]);
			}

			let remaining1 = this.returnHighestCard(suite, val);
			let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
			let remaining_cards = this.sortByValue([remaining1, remaining2]);
			for (let i = 0; i < remaining_cards.length; i++) {
				cards_to_score.push(remaining_cards[i]);
			}

			hand_description = 'three-of-a-kind';
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// TWO PAIR
		//
		if (pairs.length > 1) {
			pairs.sort((a, b) => a - b);

			// deal with three pairs.
			if (pairs.length == 3) {
				if (pairs[0] == 1) {
					pairs.push(pairs.shift());
				}
				pairs.shift();
			}

			let m = pairs[pairs.length - 1];
			let n = pairs[pairs.length - 2];

			if (m > n) {
				highest_card = m;
			} else {
				highest_card = n;
			}
			if (n == 1) {
				highest_card = n;
			}

			let cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == highest_card) {
					cards_to_score.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}
			cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == m || val[i] == n) {
					cards_to_score.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}

			let remaining1 = this.returnHighestCard(suite, val, cards_to_score);
			cards_to_score.push(remaining1);
			hand_description = 'two pair';

			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// A PAIR
		//
		if (pairs.length > 0) {
			let x = pairs[pairs.length - 1];
			let y = [];

			let cards_remaining = val.length;
			for (let i = 0; i < cards_remaining; i++) {
				if (val[i] == x) {
					y.push(suite[i] + val[i]);
					val.splice(i, 1);
					suite.splice(i, 1);
					cards_remaining--;
					i--;
				}
			}

			let remaining1 = this.returnHighestCard(suite, val);
			let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
			let remaining3 = this.returnHighestCard(suite, val, [
				remaining1,
				remaining2
			]);

			let cards_remaining2 = this.sortByValue([
				remaining1,
				remaining2,
				remaining3
			]);
			//let cards_remaining2 = [remaining1, remaining2, remaining3];
			cards_to_score.push(y[0]);
			cards_to_score.push(y[1]);
			for (let i = 0; i < cards_remaining2.length; i++) {
				cards_to_score.push(cards_remaining2[i]);
			}
			hand_description = 'pair';
			return {
				cards_to_score: cards_to_score,
				hand_description: hand_description
			};
		}

		//
		// HIGHEST CARD
		//
		let remaining1 = this.returnHighestCard(suite, val);
		let remaining2 = this.returnHighestCard(suite, val, [remaining1]);
		let remaining3 = this.returnHighestCard(suite, val, [
			remaining1,
			remaining2
		]);
		let remaining4 = this.returnHighestCard(suite, val, [
			remaining1,
			remaining2,
			remaining3
		]);
		let remaining5 = this.returnHighestCard(suite, val, [
			remaining1,
			remaining2,
			remaining3,
			remaining4
		]);

		cards_to_score.push(remaining1);
		cards_to_score.push(remaining2);
		cards_to_score.push(remaining3);
		cards_to_score.push(remaining4);
		cards_to_score.push(remaining5);

		hand_description = 'highest card';
		highest_card = remaining1;
		return {
			cards_to_score: this.sortByValue(cards_to_score),
			hand_description: hand_description
		};
	}

	convertHand(hand) {
		let x = {};
		x.suite = [];
		x.val = [];

		for (let i = 0; i < hand.length; i++) {
			x.suite.push(hand[i][0]);
			x.val.push(parseInt(hand[i].substring(1)));
		}

		return x;
	}

	sortByValue(cards) {
		//let x = this.convertHand(cards);
		let y = [];
		let idx = 0;

		y.push(cards[0]);

		for (let i = 1; i < cards.length; i++) {
			idx = 0;
			for (let j = 0; j < y.length; j++) {
				if (this.returnHigherCard(cards[i], y[j]) == y[j]) {
					idx = j + 1;
				}
			}
			y.splice(idx, 0, cards[i]);
		}
		return y;
	}

	returnHigherCard(card1, card2) {
		let card1_suite = card1[0];
		let card1_val = parseInt(card1.substring(1));

		let card2_suite = card2[0];
		let card2_val = parseInt(card2.substring(1));

		if (card1_val == 1) {
			card1_val = 14;
		}
		if (card2_val == 1) {
			card2_val = 14;
		}

		if (card1_val > card2_val) {
			return card1;
		}
		if (card2_val > card1_val) {
			return card2;
		}
		if (card2_val == card1_val) {
			if (card1_suite == card2_suite) {
				return 0;
			}
			if (this.isHigherSuite(card1_suite, card2_suite)) {
				return card1;
			} else {
				return card2;
			}
		}
	}

	returnHigherNumberCard(card1, card2) {
		let card1_val = parseInt(card1.substring(1));
		let card2_val = parseInt(card2.substring(1));

		if (card1_val == 1) {
			card1_val = 14;
		}
		if (card2_val == 1) {
			card2_val = 14;
		}

		if (card1_val > card2_val) {
			return card1;
		}
		if (card2_val > card1_val) {
			return card2;
		}
		if (card2_val == card1_val) {
			return 0;
		}
	}

	isHigherSuite(currentv, newv) {
		if (currentv === 'S') {
			return 1;
		}
		if (newv == 'S') {
			return 0;
		}
		if (currentv === 'H') {
			return 1;
		}
		if (newv == 'H') {
			return 0;
		}
		if (currentv === 'D') {
			return 1;
		}
		if (newv == 'D') {
			return 0;
		}
		if (currentv === 'C') {
			return 1;
		}
		if (newv == 'C') {
			return 0;
		}
	}

	returnHighestSuiteCard(suite, val, x) {
		let suite_to_return = 'C';
		let card_to_return = '';

		for (let i = 0; i < val.length; i++) {
			if (val[i] == x) {
				if (card_to_return != '') {
					if (this.isHigherSuite(suite_to_return, suite[i])) {
						suite_to_return = suite[i];
						card_to_return = suite[i] + val[i];
					}
				} else {
					suite_to_return = suite[i];
					card_to_return = suite[i] + val[i];
				}
			}
		}
		return card_to_return;
	}

	returnHighestCard(suite, val, noval = [], less_than = 14) {
		let highest_card = 0;
		let highest_suite = 'C';
		let highest_idx = 0;

		for (let i = 0; i < val.length; i++) {
			if (noval.includes(suite[i] + val[i])) {
				//if the case id not in the exclude list
			} else {
				if (val[i] == 1) {
					//if the candidate is an ace
					if (highest_card == 14) {
						//and the encumbent is an ace
						if (this.isHigherSuite(suite[i], highest_suite)) {
							//if the candidate is a higher suite
							//the candidate wins
							highest_suite = suite[i];
						}
					} else {
						highest_card = 14; // and if there was no encumbent - the candidate is the winner.
						highest_suite = suite[i];
					}
				}

				if (val[i] == highest_card) {
					//if the candiates is as high as the encumbent
					if (this.isHigherSuite(suite[i], highest_suite)) {
						//if the candidate has a higher suite
						highest_suite = suite[i];
					}
				}

				if (val[i] > highest_card) {
					// if the candidate is just higher
					highest_card = val[i]; // the candidate wins
					highest_suite = suite[i]; // the candiate wins
				}
			}
		}
		if (highest_card == 14) {
			highest_card = 1;
		}
		return highest_suite + highest_card;
	}

	isFlush(suite, val) {
		let total_clubs = 0;
		let total_spades = 0;
		let total_hearts = 0;
		let total_diamonds = 0;

		for (let i = 0; i < suite.length; i++) {
			if (suite[i] == 'C') {
				total_clubs++;
			}
			if (suite[i] == 'D') {
				total_diamonds++;
			}
			if (suite[i] == 'H') {
				total_hearts++;
			}
			if (suite[i] == 'S') {
				total_spades++;
			}
		}

		if (total_clubs >= 5) {
			return 'C';
		}
		if (total_spades >= 5) {
			return 'S';
		}
		if (total_hearts >= 5) {
			return 'H';
		}
		if (total_diamonds >= 5) {
			return 'D';
		}

		return '';
	}

	isFour(suite, val, low = 1) {
		for (let i = low - 1; i < 13; i++) {
			let total = 0;
			for (let z = 0; z < val.length; z++) {
				if (val[z] == i + 1) {
					total++;
					if (total == 4) {
						return i + 1;
					}
				}
			}
		}

		return 0;
	}

	isThree(suite, val, low = 1) {
		for (let i = low - 1; i < 13; i++) {
			let total = 0;
			for (let z = 0; z < val.length; z++) {
				if (val[z] == i + 1) {
					total++;
					if (total == 3) {
						return i + 1;
					}
				}
			}
		}

		return 0;
	}

	isTwo(suite, val, low = 1) {
		for (let i = low - 1; i < 13; i++) {
			let total = 0;
			for (let z = 0; z < val.length; z++) {
				if (val[z] == i + 1) {
					total++;
					if (total == 2) {
						return i + 1;
					}
				}
			}
		}

		return 0;
	}

	isStraight(suite, val, low = 1) {
		let rv = 0;
		for (let i = low - 1; i < 10; i++) {
			//
			// catch royal straight
			//
			if (i == 9) {
				if (
					val.includes(13) &&
					val.includes(12) &&
					val.includes(11) &&
					val.includes(10) &&
					val.includes(1)
				) {
					rv = 10;
				}
			}

			if (
				val.includes(i + 1) &&
				val.includes(i + 2) &&
				val.includes(i + 3) &&
				val.includes(i + 4) &&
				val.includes(i + 5)
			) {
				rv = i + 1;
			}
		}

		return rv;
	}

	isCardSuite(suite, val, card, s) {
		for (let i = 0; i < val.length; i++) {
			if (val[i] == card) {
				if (suite[i] == s) {
					return 1;
				}
			}
		}
		return 0;
	}

	preloadImages() {
		let allImages = [
			'/poker/img/cards/C1.png',
			'/poker/img/cards/C2.png',
			'/poker/img/cards/C3.png',
			'/poker/img/cards/C4.png',
			'/poker/img/cards/C5.png',
			'/poker/img/cards/C6.png',
			'/poker/img/cards/C7.png',
			'/poker/img/cards/C8.png',
			'/poker/img/cards/C9.png',
			'/poker/img/cards/C10.png',
			'/poker/img/cards/C11.png',
			'/poker/img/cards/C12.png',
			'/poker/img/cards/C13.png',
			'/poker/img/cards/S1.png',
			'/poker/img/cards/S2.png',
			'/poker/img/cards/S3.png',
			'/poker/img/cards/S4.png',
			'/poker/img/cards/S5.png',
			'/poker/img/cards/S6.png',
			'/poker/img/cards/S7.png',
			'/poker/img/cards/S8.png',
			'/poker/img/cards/S9.png',
			'/poker/img/cards/S10.png',
			'/poker/img/cards/S11.png',
			'/poker/img/cards/S12.png',
			'/poker/img/cards/S13.png',
			'/poker/img/cards/D1.png',
			'/poker/img/cards/D2.png',
			'/poker/img/cards/D3.png',
			'/poker/img/cards/D4.png',
			'/poker/img/cards/D5.png',
			'/poker/img/cards/D6.png',
			'/poker/img/cards/D7.png',
			'/poker/img/cards/D8.png',
			'/poker/img/cards/D9.png',
			'/poker/img/cards/D10.png',
			'/poker/img/cards/D11.png',
			'/poker/img/cards/D12.png',
			'/poker/img/cards/D13.png',
			'/poker/img/cards/H1.png',
			'/poker/img/cards/H2.png',
			'/poker/img/cards/H3.png',
			'/poker/img/cards/H4.png',
			'/poker/img/cards/H5.png',
			'/poker/img/cards/H6.png',
			'/poker/img/cards/H7.png',
			'/poker/img/cards/H8.png',
			'/poker/img/cards/H9.png',
			'/poker/img/cards/H10.png',
			'/poker/img/cards/H11.png',
			'/poker/img/cards/H12.png',
			'/poker/img/cards/H13.png'
		];

		this.preloadImageArray(allImages, 0);
	}

	preloadImageArray(imageArray = [], idx = 0) {
		let pre_images = [imageArray.length];

		if (imageArray && imageArray.length > idx) {
			pre_images[idx] = new Image();
			pre_images[idx].onload = () => {
				this.preloadImageArray(imageArray, idx + 1);
			};
			pre_images[idx].src = imageArray[idx];
		}
	}

}

module.exports = PokerCards;
