

  onNewRound() {
  }

  onNewTurn() {

    this.game.state.rp['central'] = {};
    this.game.state.rp['allies'] = {};

    this.game.state.mandated_offensives = {};
    this.game.state.mandated_offensives.central = "";
    this.game.state.mandated_offensives.allies = "";

    for (let key in this.game.spaces) {
      let redisplay = false;
      if (this.game.spaces[key].activated_for_combat || this.game.spaces[key].activated_for_movement) {
        redisplay = true;
      }
      this.game.spaces[key].activated_for_combat = 0;
      this.game.spaces[key].activated_for_movement = 0;
      for (let z = 0; z < this.game.spaces[key].units.length; z++) {
	this.game.spaces[key].units[z].moved = 0;
	this.game.spaces[key].units[z].attacked = 0;
      }
      if (redisplay) { this.displaySpace(key); }
    }

  }

  returnState() {

    let state = {};

    state.events = {};
    state.players = [];
    state.removed = []; // removed cards
    state.turn = 0;
    state.skip_counter_or_acknowledge = 0; // don't skip
    state.cards_left = {};

    state.mandated_offensives = {};
    state.mandated_offensives.central = "";
    state.mandated_offensives.allies = "";

    state.reserves = {};
    state.reserves['central'] = [];
    state.reserves['allies'] = [];

    state.rp = {};
    state.rp['central'] = {};
    state.rp['allies'] = {};


    state.active_player = -1;

    return state;

  }

  returnActivationCost(key) {
    return 1;
  }

  returnMovementCost(key) {
    return 1;
  }

