
  isMajorPower(power) {
    if (power === "france" || power === "hapsburg" || power === "england" || power === "protestant" || power === "ottoman" || power === "papacy") { return true; }
    return false;
  }

  isMinorPower(power) {
    if (power === "genoa" || power === "hungary" || power === "scotland" || power === "venice") { return 1; }
    return 0;
  }

  isAlliedMinorPower(mp, faction) {
    if (faction === this.returnAllyOfMinorPower(mp)) { return true; }
    return false;
  }

  returnMinorPowers() {
    return ["genoa", "hungary", "scotland", "venice"];
  }

  returnControllingPower(power) {
    return this.returnAllyOfMinorPower(power);
  }

  returnAllyOfMinorPower(power) {
    if (this.isMajorPower(power)) { return power; }
    for (let key in this.game.state.activated_powers) {
      if (this.game.state.activated_powers[key].includes(power)) {
	return key;
      }
    }
    if (this.areAllies(power, "papacy", 0)) { return "papacy"; }
    if (this.areAllies(power, "protestant", 0)) { return "protestant"; }
    if (this.areAllies(power, "france", 0)) { return "france"; }
    if (this.areAllies(power, "england", 0)) { return "england"; }
    if (this.areAllies(power, "hapsburg", 0)) { return "hapsburg"; }
    if (this.areAllies(power, "ottoman", 0)) { return "ottoman"; }
    return power;
  }

  activateMinorPower(faction, power) {
    if (this.returnAllyOfMinorPower(power) != power) {
      this.deactivateMinorPower(this.returnAllyOfMinorPower(power), power);
    }

    //
    // any home spaces help by the major power are returned to its minor ally
    // on the alliance being formed. this is needed to ensure that Line of 
    // Communications can work properly...
    //
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].home == power) {
        if (this.game.spaces[key].political == faction) {
	  this.game.spaces[key].political = power;
	}
      }
    }

    this.setAllies(faction, power, 0);
    this.game.state.activated_powers[faction].push(power);
    this.game.state.minor_activated_powers.push(power);
    this.displayBoard();
    this.displayVictoryTrack();
  }

  deactivateMinorPower(faction, power) {
    this.unsetAllies(faction, power, 0);
    for (let key in this.game.state.activated_powers) {
      for (let i = 0; i < this.game.state.activated_powers[key].length; i++) {
        if (this.game.state.activated_powers[key][i] === power) {
  	  this.game.state.activated_powers[key].splice(i, 1);
        }
      }
    }
    for (let i = 0; i < this.game.state.minor_activated_powers.length; i++) {
      if (this.game.state.minor_activated_powers[i] === power) {
	this.game.state.minor_activated_powers.splice(i, 1);
      }
    }

    //
    // any home spaces help by the major power are returned to its minor ally
    // on the alliance being disabled. this is needed to ensure that Line of 
    // Communications can work properly...
    //
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].home == power) {
        if (this.game.spaces[key].political == faction) {
          this.game.spaces[key].political = power;
        }
      }
    }
    
    this.displayBoard();
    this.displayVictoryTrack();
  }

  canFactionDeactivateMinorPower(faction, power) {
    if (power == "genoa") { if (faction == "france" || faction == "hapsburg" || faction == "papacy") { return 1; } }
    if (power == "scotland") { if (faction == "england" || faction == "france") { return 1; } }
    if (power == "venice") { if (faction == "france" || faction == "hapsburg" || faction == "papacy") { return 1; } }
    return 0;
  }

  canFactionActivateMinorPower(faction, power) {
    if (power == "genoa") {
      if (faction == "france") { return 1; }
      if (faction == "hapsburg") { return 1; }
      if (faction == "papacy") { return 1; }
    }
    if (power == "hungary") {
      if (faction == "hapsburg") { return 1; }
    }
    if (power == "scotland") {
      if (faction == "france") { return 1; }
      if (faction == "england") { return 1; }
    }
    if (power == "venice") {
      if (faction == "france") { return 1; }
      if (faction == "hapsburg") { return 1; }
      if (faction == "papacy") { return 1; }
    }
    return 0;
  }

  isMinorActivatedPower(power) {
    for (let i = 0; i < this.game.state.minor_activated_powers.length; i++) {
      if (power === this.game.state.minor_activated_powers[i]) {
	return 1;
      }
    }
    return 0;
  }

  isMinorUnactivatedPower(power) {
    if (power === "genoa" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "scotland" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "hungary" && this.isMinorActivatedPower(power) != 1) { return 1; }
    if (power === "venice" && this.isMinorActivatedPower(power) != 1) { return 1; }
    return 0;
  }

