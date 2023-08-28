

  returnEventObjects() {

    let z = [];

    //
    // factions in-play
    //
    for (let i = 0; i < this.game.state.players_info.length; i++) {
      if (this.factions[this.game.state.players_info[i].faction] != undefined) {
        z.push(this.factions[this.game.state.players_info[i].faction]);
      }
    }


    //
    // cards in the deck can modify gameloop
    //
    for (let key in this.deck) {
      z.push(this.deck[key]);
    }
    for (let key in this.diplomatic_deck) {
      z.push(this.diplomatic_deck[key]);
    }

    //
    // debaters have bonuses which modify gameplay
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      let d = this.game.state.debaters[i];
      let key = d.type;
      z.push(this.debaters[key]);
    }

    return z;

  }



  addEvents(obj) {

    ///////////////////////
    // game state events //
    ///////////////////////
    //
    // these events run at various points of the game. They are attached to objs
    // on object initialization, so that the objects can have these events 
    // triggered at various points of the game automatically.
    //
    //
    // 
    // 1 = fall through, 0 = halt game
    //
    if (obj.onCommit == null) {
      obj.onCommit = function(his_self, faction) { return 1; } // 1 means fall through
    }
    if (obj.onEvent == null) {
      obj.onEvent = function(his_self, player) { return 1; } // 1 means fall-through / no-stop
    }
    if (obj.canEvent == null) {
      obj.canEvent = function(his_self, faction) { return 0; } // 0 means cannot event
    }
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function(his_self, qe, mv) { return 1; } // 1 means fall-through / no-stop
    }





    //
    // functions for convenience
    //
    if (obj.removeFromDeck == null) {
      obj.removeFromDeck = function(his_self, player) { return 0; } 
    }
    if (obj.menuOptionTriggers == null) {
      obj.menuOptionTriggers = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOption == null) {
      obj.menuOption = function(his_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOptionActivated == null) {
      obj.menuOptionActivated = function(his_self, stage, player, faction) { return 0; }
    }

    return obj;

  }


