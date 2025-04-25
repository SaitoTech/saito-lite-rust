

  returnEventObjects() {

    let z = [];

    //
    // cards in the deck can modify gameloop
    //
    for (let key in this.deck) {
      z.push(this.deck[key]);
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
    // 1 = fall through, 0 = halt game
    //
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function(paths_self, qe, mv) { return 1; } // 1 means fall-through / no-stop
    }

    //
    // functions for convenience
    //
    if (obj.menuOptionTriggers == null) {
      obj.menuOptionTriggers = function(paths_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOption == null) {
      obj.menuOption = function(paths_self, stage, player, faction) { return 0; }
    }
    if (obj.menuOptionActivated == null) {
      obj.menuOptionActivated = function(paths_self, stage, player, faction) { return 0; }
    }

    return obj;

  }


