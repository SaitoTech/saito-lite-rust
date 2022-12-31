
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
    try { if (this.game.diplomacy[faction1][faction2].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.diplomacy[faction2][faction1].allies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 1; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      try { if (this.game.diplomacy[f1cp][f2cp].allies == 1) { return 1; } } catch (err) {}
      try { if (this.game.diplomacy[f2cp][f1cp].allies == 1) { return 1; } } catch (err) {}
    }
    return 0;
  }

  areEnemies(faction1, faction2) {
    try { if (this.game.diplomacy[faction1][faction2].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.diplomacy[faction2][faction1].enemies == 1) { return 1; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction1].includes(faction2)) { return 0; } } catch (err) {}
    try { if (this.game.state.activated_powers[faction2].includes(faction1)) { return 0; } } catch (err) {}
    if (this.isMinorPower(faction1) || this.isMinorPower(faction2)) {
      let f1cp = this.returnControllingPower(faction1);
      let f2cp = this.returnControllingPower(faction2);
      try { if (this.game.diplomacy[f1cp][f2cp].enemies == 1) { return 1; } } catch (err) {}
      try { if (this.game.diplomacy[f2cp][f1cp].enemies == 1) { return 1; } } catch (err) {}
    }
    return 0;
  }

  setAllies(faction1, faction2) {
    try { this.game.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}
    try { this.game.diplomacy[faction1][faction2].allies = 1; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].allies = 1; } catch (err) {}
  }

  unsetAllies(faction1, faction2) {
    try { this.game.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].allies = 0; } catch (err) {}
  }

  setEnemies(faction1, faction2) {
    try { this.game.diplomacy[faction1][faction2].allies = 0; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].allies = 0; } catch (err) {}
    try { this.game.diplomacy[faction1][faction2].enemies = 1; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].enemies = 1; } catch (err) {}
  }

  unsetEnemies(faction1, faction2) {
    try { this.game.diplomacy[faction1][faction2].enemies = 0; } catch (err) {}
    try { this.game.diplomacy[faction2][faction1].enemies = 0; } catch (err) {}
  }

