

  returnEventObjects() {

    let z = [];

    //
    // cards on the table
    //


    //
    // playable cards in my hand
    //

    return z;

  }



  addEvents(obj) {

    ///////////////////////
    // game state events //
    ///////////////////////
    // 
    // 1 = fall through, 0 = halt game
    //
    if (obj.canEvent == null) {
      obj.canEvent = function(his_self, faction) { return 0; } // 0 means cannot event
    }
    if (obj.onEvent == null) {
      obj.onEvent = function(his_self, player) { return 1; }
    }
    if (obj.handleGameLoop == null) {
      obj.handleGameLoop = function(his_self, qe, mv) { return 1; }
    }


    //
    // functions for convenience
    //
    //if (obj.menuOptionTriggers == null) {
    //  obj.menuOptionTriggers = function(his_self, stage, player, faction) { return 0; }
    //}
    //if (obj.menuOption == null) {
    //  obj.menuOption = function(his_self, stage, player, faction) { return 0; }
    //}
    //if (obj.menuOptionActivated == null) {
    //  obj.menuOptionActivated = function(his_self, stage, player, faction) { return 0; }
    //}

    return obj;

  }


