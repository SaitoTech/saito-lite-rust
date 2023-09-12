
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
    this.returnAllyOfMinorPower(power);
  }

  returnAllyOfMinorPower(power) {
    if (!this.game.state.minor_activated_powers.includes(power)) { return ""; }
    for (let key in this.game.state.activated_powers) {
      if (this.game.state.activated_powers[key].includes(power)) {
	return key;
      }
    }
    return power;
  }

  activateMinorPower(faction, power) {
    if (this.returnAllyOfMinorPower(power) != power) {
      this.deactivateMinorPower(this.returnAllyOfMinorPower(power), power);
    }
    this.setAllies(faction, power, 0);
    this.game.state.activated_powers[faction].push(power);
    this.game.state.minor_activated_powers.push(power);
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
  }

  canFactionDeactivateMinorPower(faction, power) {
    if (power == "genoa") { return 1; }
    if (power == "scotland") { return 1; }
    if (power == "venice") { return 1; }
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

