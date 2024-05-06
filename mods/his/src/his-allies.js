
  //
  // Allies
  //
  // are by definition major powers as opposed minor / activated powers, although 
  // if you ask areAllies() or areEnemies() on combinations of faction names that 
  // include minor-activated powers like scotland or genoa these functions will 
  // politely let you know if those minor-powers are activated to an ally or enemy
  //
  returnDeclarationOfWarCost(f1, f2) {
    if (f1 == "ottoman") {
      if (f2 == "ottoman") 	{ return 0; }
      if (f2 == "hapsburg") 	{ return 2; }
      if (f2 == "england") 	{ return 2; }
      if (f2 == "france") 	{ return 2; }
      if (f2 == "papacy") 	{ return 2; }
      if (f2 == "protestant") 	{ return 2; }
      if (f2 == "genoa") 	{ return 1; }
      if (f2 == "hungary") 	{ return 0; }
      if (f2 == "scotland") 	{ return 0; }
      if (f2 == "venice") 	{ return 1; }
    }
    if (f1 == "hapsburg") {
      if (f2 == "ottoman") 	{ return 2; }
      if (f2 == "hapsburg") 	{ return 2; }
      if (f2 == "england") 	{ return 3; }
      if (f2 == "france") 	{ return 3; }
      if (f2 == "papacy") 	{ return 4; }
      if (f2 == "protestant") 	{ return 0; }
      if (f2 == "genoa") 	{ return 2; }
      if (f2 == "hungary") 	{ return 0; }
      if (f2 == "scotland") 	{ return 1; }
      if (f2 == "venice") 	{ return 2; }
    }
    if (f1 == "england") {
      if (f2 == "ottoman") 	{ return 2; }
      if (f2 == "hapsburg") 	{ return 1; }
      if (f2 == "england") 	{ return 0; }
      if (f2 == "france") 	{ return 3; }
      if (f2 == "papacy") 	{ return 3; }
      if (f2 == "protestant") 	{ return 2; }
      if (f2 == "genoa") 	{ return 1; }
      if (f2 == "hungary") 	{ return 0; }
      if (f2 == "scotland") 	{ return 1; }
      if (f2 == "venice") 	{ return 0; }
    }
    if (f1 == "france") {
      if (f2 == "ottoman") 	{ return 2; }
      if (f2 == "hapsburg") 	{ return 3; }
      if (f2 == "england") 	{ return 3; }
      if (f2 == "france") 	{ return 0; }
      if (f2 == "papacy") 	{ return 3; }
      if (f2 == "protestant") 	{ return 2; }
      if (f2 == "genoa") 	{ return 1; }
      if (f2 == "hungary") 	{ return 0; }
      if (f2 == "scotland") 	{ return 2; }
      if (f2 == "venice") 	{ return 1; }
    }
    if (f1 == "papacy") {
      if (f2 == "ottoman") 	{ return 2; }
      if (f2 == "hapsburg") 	{ return 4; }
      if (f2 == "england") 	{ return 3; }
      if (f2 == "france") 	{ return 3; }
      if (f2 == "papacy") 	{ return 0; }
      if (f2 == "protestant") 	{ return 0; }
      if (f2 == "genoa") 	{ return 2; }
      if (f2 == "hungary") 	{ return 0; }
      if (f2 == "scotland") 	{ return 0; }
      if (f2 == "venice") 	{ return 2; }
    }
    if (f1 == "protestant") {
      if (f2 == "ottoman") 	{ return 2; }
      if (f2 == "hapsburg") 	{ return 0; }
      if (f2 == "england") 	{ return 2; }
      if (f2 == "france") 	{ return 2; }
      if (f2 == "papacy") 	{ return 0; }
      if (f2 == "protestant") 	{ return 0; }
      if (f2 == "genoa") 	{ return 1; }
      if (f2 == "hungary") 	{ return 0; }
      if (f2 == "scotland") 	{ return 0; }
      if (f2 == "venice") 	{ return 1; }
    }
    return 0;
  }
  returnDeclarationOfWarTargets(faction) {

    let na = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (!this.areAllies(faction, io[i])) { na.push(io[i]); }
      }
    }
    if (!this.areAllies(faction, "genoa")) { na.push("genoa"); }
    if (!this.areAllies(faction, "scotland")) { 
      if (faction != "protestant" && faction != "papacy" && faction != "ottoman") { na.push("scotland"); }
    }
    if (!this.areAllies(faction, "venice")) { 
      if (faction != "england") { na.push("venice"); }
    }

    let rv = [];

    for (let i = 0; i < na.length; i++) {
      if (na[i] != faction) {
        if (this.returnDeclarationOfWarCost(faction, na[i]) > 0) {
	  rv.push({ faction : na[i] , cost : this.returnDeclarationOfWarCost(faction, na[i]) });
        }
      }
    } 

    return rv;
  }

  returnAllies(faction) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areAllies(faction, io[i])) { f.push(io[i]); }
      }
    }
    if (this.areAllies(faction, "genoa")) { f.push("genoa"); }
    if (this.areAllies(faction, "venice")) { f.push("venice"); }
    if (this.areAllies(faction, "hungary")) { f.push("hungary"); }
    if (this.areAllies(faction, "scotland")) { f.push("scotland"); }
    return f;
  }

  returnEnemies(faction, include_minor_powers=false) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areEnemies(faction, io[i])) { f.push(io[i]); }
      }
    }
    if (include_minor_powers) {
      if (this.areEnemies(faction, "hungary")) { f.push("hungary"); }
      if (this.areEnemies(faction, "scotland")) { f.push("scotland"); }
      if (this.areEnemies(faction, "venice")) { f.push("venice"); }
      if (this.areEnemies(faction, "genoa")) { f.push("genoa"); }
    }
    return f;
  }

  areAllies(faction1, faction2, count_minor_activated_factions=1) {
    if (faction1 == faction2) { return 1; }
    try { if (this.game.state.alliances[faction1][faction2].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.alliances[faction2][faction1].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 1; } } catch (err) {}
    if (count_minor_activated_factions) {
      if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
        let f1cp = this.returnControllingPower(faction1);
        let f2cp = this.returnControllingPower(faction2);
        try { if (this.game.state.alliances[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
        try { if (this.game.state.alliances[f1cp][f2cp].allies == 1) { return 1; } } catch (err) {}
        try { if (this.game.state.alliances[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
      }
    }
    return 0;
  }

  areEnemies(faction1, faction2, count_minor_activated_factions=1) {

    if (faction1 === faction2) { return 0; }
    try { if (this.game.state.alliances[faction1][faction2].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.alliances[faction2][faction1].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 0; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 0; } } catch (err) {}
    if (count_minor_activated_factions) {
      if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
        let f1cp = this.returnControllingPower(faction1);
        let f2cp = this.returnControllingPower(faction2);
        try { if (this.game.state.alliances[f1cp][f2cp].enemies == 1) { return 1; } } catch (err) {}
        try { if (this.game.state.alliances[f2cp][f1cp].enemies == 1) { return 1; } } catch (err) {}
      }
    }
    return 0;
  }

  setActivatedPower(faction, activated_power) {
    if (!this.game.state.activated_powers[faction].includes(activated_power)) { 
      this.game.state.activated_powers[faction].push(activated_power);
    }

    //
    // any units not belonging to this activated_power or the faction must be
    // relocated to their capital (if exists) or destroyed.
    //
    for (let key in this.game.spaces) {
      let space = this.game.spaces[key];
      if (space.political == activated_power || (space.political == "" && space.home == activated_power)) {
	for (let f in space.units) {
	  if (f !== faction && f !== activated_power) {
	    if (space.units[f].length > 0) {
	      this.moveFactionUnitsInSpaceToCapitalIfPossible(f, space.key);
	    }
	  }
	}
      }
    }
  }


  unsetActivatedPower(faction, activated_power) {

    if (this.game.state.activated_powers[faction].includes(activated_power)) {
      let x = [];
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
        if (this.game.state.activated_powers[faction][i] !== activated_power) {
          x.push(this.game.state.activated_powers[faction][i]);
        }
      }
      this.game.state.activated_powers[faction] = x;
    }

   
    //
    // any units not belonging to this activated_power must be
    // relocated to their capital (if exists) or destroyed.
    //
    for (let key in this.game.spaces) {
      let space = this.game.spaces[key];
      if (space.political == activated_power || (space.political == "" && space.home == activated_power)) {
        for (let f in space.units) {
          if (f !== faction && f !== activated_power) {
            if (space.units[f].length > 0) {
              this.moveFactionUnitsInSpaceToCapitalIfPossible(f, space.key);
            }
          }
        }
      }
    } 

  }

  isActivatedPower(faction, activated_power) {
    if (this.game.state.activated_powers[faction].includes(activated_power)) {
      return 1;
    }
    return 0;
  }


  setAllies(faction1, faction2, amp=1) {

    if ((faction1 == "hungary" || faction2 == "hungary") && (faction1 == "hapsburg" || faction2 == "hapsburg")) {
     this.game.state.events.defeat_of_hungary_bohemia = 1;

      if (this.areEnemies("hungary", "ottoman") && !this.areEnemies("ottoman", "hapsburg"))    {
	if (this.game.state.events.defeat_of_hungary_bohemia == 0) { 
	  this.game.queue.push("natural_enemy_intervention\tottoman\thungary\thapsburg");
	}
      }
      if (this.areEnemies("hungary", "protestant") && !this.areEnemies("protestant", "hapsburg")) { this.game.queue.push("natural_enemy_intervention\tprotestant\thungary\thapsburg"); }
      if (this.areEnemies("hungary", "france") && !this.areEnemies("france", "hapsburg"))     { this.game.queue.push("natural_enemy_intervention\tfrance\thungary\thapsburg"); }
      if (this.areEnemies("hungary", "papacy") && !this.areEnemies("papacy", "hapsburg"))     { this.game.queue.push("natural_enemy_intervention\tpapacy\thungary\thapsburg"); }
      if (this.areEnemies("hungary", "england") && !this.areEnemies("england", "hapsburg"))    { this.game.queue.push("natural_enemy_intervention\tengland\thungary\thapsburg"); }
    }
    if ((faction1 == "scotland" || faction2 == "scotland") && (faction1 == "france" || faction2 == "france")) {
      if (this.areEnemies("scotland", "ottoman") && !this.areEnemies("ottoman", "france"))    { this.game.queue.push("natural_enemy_intervention\tottoman\tscotland\tfrance"); }
      if (this.areEnemies("scotland", "protestant") && !this.areEnemies("protestant", "france")) { this.game.queue.push("natural_enemy_intervention\tprotestant\tscotland\tfrance"); }
      if (this.areEnemies("scotland", "hapsburg") && !this.areEnemies("hapsburg", "france"))   { this.game.queue.push("natural_enemy_intervention\thapsburg\tscotland\tfrance"); }
      if (this.areEnemies("scotland", "papacy") && !this.areEnemies("papacy", "france"))     { this.game.queue.push("natural_enemy_intervention\tpapacy\tscotland\tfrance"); }
      if (this.areEnemies("scotland", "england") && !this.areEnemies("england", "france"))    { this.game.queue.push("natural_enemy_intervention\tengland\tscotland\tfrance"); }
    }
    if ((faction1 == "venice" || faction2 == "venice") && (faction1 == "papacy" || faction2 == "papacy")) {
      if (this.areEnemies("venice", "ottoman") && !this.areEnemies("ottoman", "papacy"))    { this.game.queue.push("natural_enemy_intervention\tottoman\tvenice\tpapacy"); }
      if (this.areEnemies("venice", "protestant") && !this.areEnemies("protestant", "papacy")) { this.game.queue.push("natural_enemy_intervention\tprotestant\tvenice\tpapacy"); }
      if (this.areEnemies("venice", "france") && !this.areEnemies("france", "papacy"))     { this.game.queue.push("natural_enemy_intervention\tfrance\tvenice\tpapacy"); }
      if (this.areEnemies("venice", "hapsburg") && !this.areEnemies("hapsburg", "papacy"))     { this.game.queue.push("natural_enemy_intervention\thapsburg\tvenice\tpapacy"); }
      if (this.areEnemies("venice", "england") && !this.areEnemies("england", "papacy"))    { this.game.queue.push("natural_enemy_intervention\tengland\tvenice\tpapacy"); }
    }

    try { this.game.state.alliances[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.alliances[faction2][faction1].enemies = 0; } catch (err) {}
    try { this.game.state.alliances[faction1][faction2].allies = 1; } catch (err) {}
    try { this.game.state.alliances[faction2][faction1].allies = 1; } catch (err) {}

    //
    // in the 2P game, Hapsburgs are an activated power for the Papacy
    //
    if (this.game.state.events.schmalkaldic_league == 1 && this.game.players.length == 2 && (faction1 == "papacy" || faction1 == "hapsburg") && (faction1 == "hapsburg" || faction2 == "papacy")) {
      if (!this.game.state.activated_powers["papacy"].includes("hapsburg")) {
        this.setActivatedPower("papacy", "hapsburg");
      }
    }

    if (amp == 1) {
      if (this.isMinorPower(faction1)) {
        if (!this.isMinorPower(faction2)) {
  	  this.activateMinorPower(faction2, faction1);
        }
      }
      if (this.isMinorPower(faction2)) {
        if (!this.isMinorPower(faction1)) {
	  this.activateMinorPower(faction1, faction2);
        }
      }
    }

    this.displayWarBox();

  }

  unsetAllies(faction1, faction2, amp=1) {

    //
    // hungary and hapsburgs locked-for-life
    //
    if (this.game.state.events.defeat_of_hungary_bohemia == 1 && (faction1 == "hapsburg" || faction2 == "hapsburg") && (faction1 == "hungary" || faction2 == "hungary")) {
      return 0;
    }

    //
    // some conditions prevent deactivating alliances
    //
    if (this.game.players.length == 2) { if (faction1 === "hapsburg" && faction2 === "papacy") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Papacy must remain allied in 2P game after Schmalkaldic League formed");
	return 1;
      }
    } } 
    if (this.game.players.length == 2) { if (faction2 === "hapsburg" && faction1 === "papacy") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Papacy must remain allied in 2P game after Schmalkaldic League formed");
	return 1;
      }
    } }

    //
    // and... no longer allies
    //
    try { this.game.state.alliances[faction2][faction1].allies = 0; } catch (err) {}
    try { this.game.state.alliances[faction1][faction2].allies = 0; } catch (err) {}


    //
    // remove activated powers if set
    //
    try {
      this.unsetActivatePower(faction1, faction2);
      this.unsetActivatePower(faction2, faction1);
    } catch (err) {}


    if (amp == 1) {
      if (this.isMinorPower(faction1)) {
        if (!this.isMinorPower(faction2)) {
  	  this.activateMinorPower(faction2, faction1);
        }
      }
      if (this.isMinorPower(faction2)) {
        if (!this.isMinorPower(faction1)) {
	  this.activateMinorPower(faction1, faction2);
        }
      }
    }

    this.displayWarBox();

  }

  setEnemies(faction1, faction2) {
    try { this.game.state.alliances[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.state.alliances[faction2][faction1].allies = 0; } catch (err) {}
    try { this.game.state.alliances[faction1][faction2].enemies = 1; } catch (err) {}
    try { this.game.state.alliances[faction2][faction1].enemies = 1; } catch (err) {}
    this.displayWarBox();
  }

  unsetEnemies(faction1, faction2) {

    //
    // undo excommunication
    //
    if (faction1 == "papacy") {
      if (this.game.state.excommunicated_factions[faction2] == 1) {
	this.unexcommunicateFaction(faction2);
      }
    }
    if (faction2 == "papacy") {
      if (this.game.state.excommunicated_factions[faction1] == 1) {
	this.unexcommunicateFaction(faction1);
      }
    }

    if (this.game.players.length == 2) { if (faction1 === "hapsburg" && faction2 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Protestants must remain at war in 2P variant");
      }
    } }
    if (this.game.players.length == 2) { if (faction2 === "hapsburg" && faction1 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Protestants must remain at war in 2P variant");
      }
    } }
    if (this.game.players.length == 2) { if (faction1 === "papacy" && faction2 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Papacy and Protestants must remain at war in 2P variant");
      }
    } }
    if (this.game.players.length == 2) { if (faction2 === "papacy" && faction1 === "protestant") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Papacy and Protestants must remain at war in 2P variant");
      }
    } }


    try { this.game.state.alliances[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.alliances[faction2][faction1].enemies = 0; } catch (err) {}

    this.displayWarBox();

  }


  returnPlayerCommandingFaction(defender) {

    //
    // by default factions control themselves
    //

    //
    // maybe this is a minor power controlled by a larger one
    //
    if (defender == "venice" || defender == "independent" || defender == "genoa" || defender == "scotland" || defender == "hungary") {
      defender = this.returnControllingPower(defender);
    }

    //
    // defender now controlling power or itself
    //
    for (let p = 0; p < this.game.players.length; p++) {

      //
      // does player command this faction
      //
      let player_factions = this.returnPlayerFactions((p+1));

      let i_command_this_faction = false;
      for (let i = 0; i < player_factions.length; i++) { 
	if (player_factions[i] === defender) { 
	  return (p+1);
	}

        if (this.game.state.activated_powers[player_factions[i]].includes(defender)) { 
	  return (p+1);
	}
        for (let z = 0; z < this.game.state.activated_powers[player_factions[i]]; z++) {
          if (this.game.state.activated_powers[player_factions[i]][z] === defender) {
	    return (p+1);
	  }
        }
      }
    }

    //
    // no-one controls this faction
    //
    return 0;

  }


