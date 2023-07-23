

	importCard(key, card) {
		let game_self = this;

		let c = {
			key,
			name		: "Unnamed",
			color		: "*",
			cost		: [],
			power		: 0,
			toughness	: 0,
			text		: "This card has not provided text",
			img		: "/img/cards/sample.png",
		};

		c = Object.assign(c, card);

		//
		// add dummy events that return 0 (do nothing)
		//
		if (!c.onInstant) {
			c.onInstant = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onEnterBattlefield) {
			c.onEnterBattlefield = function (game_self, player, card) {
				return 0;
			};
		}
		if (!c.onCostAdjustment) {
			c.onCostAdjustment = function (game_self, player, card) {
				return 0;
			};
		}

		game_self.deck[c.key] = c;
	}



