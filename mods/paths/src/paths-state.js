

  onNewRound() {
  }

  onNewTurn() {
  }

  returnState() {

    let state = {};

    state.events = {};
    state.players = [];
    state.removed = []; // removed cards
    state.turn = 1;
    state.skip_counter_or_acknowledge = 0; // don't skip

    state.active_player = -1;

    return state;

  }
