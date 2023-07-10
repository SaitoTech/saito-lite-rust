
	returnState() {
		let state = {};

		state.players = [2];
		for (let i = 0; i < 2; i++) {
			state.players[i] = {
				health: 20,
				mana: 0, 
				land: [],
				creature: [],
				artifact: [],
				graveyard: [],
			};
		}

		state.summoning_stack = [];

		return state;
	}

