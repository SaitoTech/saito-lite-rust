
  returnState() {

    let state = {};

    state.players = [2];
    for (let i = 0; i < 2; i++) {
      state.players[i] = {};
      state.players[i].health = 20;
    }

    state.hands = [2];
    for (let i = 0; i < 2; i++) {
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


