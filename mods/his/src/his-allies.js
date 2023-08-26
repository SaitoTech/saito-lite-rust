
  //
  // Allies
  //
  // are by definition major powers as opposed minor / activated powers, although 
  // if you ask areAllies() or areEnemies() on combinations of faction names that 
  // include minor-activated powers like scotland or genoa these functions will 
  // politely let you know if those minor-powers are activated to an ally or enemy
  //

  returnAllies(faction) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areAllies(faction, io[i])) { f.push(io[i]); }
      }
    }
    return f;
  }

  returnEnemies(faction) { 
    let f = [];
    let io = this.returnImpulseOrder();
    for (let i = 0; i < io.length; i++) {
      if (io[i] !== faction) {
        if (this.areEnemies(faction, io[i])) { f.push(io[i]); }
      }
    }
    return f;
  }

  areAllies(faction1, faction2) {
    try { if (this.game.state.diplomacy[faction1][faction2].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.diplomacy[faction2][faction1].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 1; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      try { if (this.game.state.diplomacy[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f1cp][f2cp].allies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
    }
    return 0;
  }

  areEnemies(faction1, faction2) {
    try { if (this.game.state.diplomacy[faction1][faction2].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.diplomacy[faction2][faction1].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 0; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 0; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      try { if (this.game.state.diplomacy[f1cp][f2cp].enemies == 1) { return 1; } } catch (err) {}
      try { if (this.game.state.diplomacy[f2cp][f1cp].enemies == 1) { return 1; } } catch (err) {}
    }
    return 0;
  }

  setAllies(faction1, faction2, amp=1) {

    try { this.game.state.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction1][faction2].allies = 1; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 1; } catch (err) {}

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
    try { this.game.state.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 0; } catch (err) {}

    if (this.game.players.length == 2) { if (faction1 === "hapsburg" && faction2 === "papacy") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Papacy must remain allied in 2P game after Schmalkaldic League formed");
      }
    } } 
    if (this.game.players.length == 2) { if (faction2 === "hapsburg" && faction1 === "papacy") {
      if (this.game.state.events.schmalkaldic_league) { 
	this.updateLog("NOTE: Hapsburg and Papacy must remain allied in 2P game after Schmalkaldic League formed");
      }
    } }

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
    try { this.game.state.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].allies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction1][faction2].enemies = 1; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 1; } catch (err) {}

    this.displayWarBox();

  }

  unsetEnemies(faction1, faction2) {

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


    try { this.game.state.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.state.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}

    this.displayWarBox();

  }

