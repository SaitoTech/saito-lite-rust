
  returnState(num_of_players) {

    let state = {};

    state.players = [num_of_players];
    for (let i = 0; i < num_of_players; i++) {
      state.players[i] = {};
      state.players[i].health = 20;
    }

    state.hands = [num_of_players];
    for (let i = 0; i < num_of_players; i++) {
      state.hands[i] = {};
      state.hands[i].cards = {};
      state.hands[i].lands = [];
      state.hands[i].creatures = [];
      state.hands[i].enchantments = [];
      state.hands[i].graveyard = [];
      state.hands[i].exhiled = [];
    }

    return state;

  }


