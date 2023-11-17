
  returnDefenderUnits() {
    return this.game.spaces[this.game.state.combat.key].units;
  }

  returnAttackerUnits() {
console.log(JSON.stringify(this.game.state.combat));
    return this.game.state.combat.attacker;
  }

  returnDefenderCombatPower() {
    let x = 0;
    for (let i = 0; i < this.game.spaces[this.game.state.combat.key].units.length; i++) {
      let unit = this.game.spaces[this.game.state.combat.key].units[i];
      x += unit.combat;
    }
    return x;
  }

  returnAttackerCombatPower() {
    let x = 0;
    for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
      let unit = this.game.spaces[this.game.state.combat.attacker[i].unit_sourcekey].units[this.game.state.combat.attacker[i].unit_idx];
      x += unit.combat;
    }
    return x;
  }

  returnAttackerLossFactor() {
    let cp = this.returnDefenderCombatPower();
    let hits = this.returnArmyFireTable();
    if (this.game.state.combat.defender_table === "corps") { hits = this.returnCorpsFireTable(); }
    for (let i = hits.length-1; i >= 0; i--) {
      if (hits[i].max >= cp && hits[i].min <= cp) {
        return hits[i][this.game.state.combat.defender_modified_roll];
      }
    }
    return 0;
  }

  returnDefenderLossFactor() {
    let cp = this.returnAttackerCombatPower();
    let hits = this.returnArmyFireTable();
    if (this.game.state.combat.attacker_table === "corps") { hits = this.returnCorpsFireTable(); }
    for (let i = hits.length-1; i >= 0; i--) {
      if (hits[i].max >= cp && hits[i].min <= cp) {
        return hits[i][this.game.state.combat.attacker_modified_roll];
      }
    }
    return 0;
  }

  returnArmyFireTable() {
    let hits = [];
    hits.push({ min : 1,  max : 1,   1 : 0 , 2 : 1 , 3 : 1 , 4 : 1 , 5 : 2 , 6 : 2 })
    hits.push({ min : 2,  max : 2,   1 : 1 , 2 : 1 , 3 : 2 , 4 : 2 , 5 : 3 , 6 : 3 })
    hits.push({ min : 3,  max : 3,   1 : 1 , 2 : 2 , 3 : 2 , 4 : 3 , 5 : 3 , 6 : 4 })
    hits.push({ min : 4,  max : 4,   1 : 2 , 2 : 2 , 3 : 3 , 4 : 3 , 5 : 4 , 6 : 4 })
    hits.push({ min : 5,  max : 5,   1 : 2 , 2 : 3 , 3 : 3 , 4 : 4 , 5 : 4 , 6 : 5 })
    hits.push({ min : 6,  max : 8,   1 : 3 , 2 : 3 , 3 : 4 , 4 : 4 , 5 : 5 , 6 : 5 })
    hits.push({ min : 9,  max : 11,  1 : 3 , 2 : 4 , 3 : 4 , 4 : 5 , 5 : 5 , 6 : 7 })
    hits.push({ min : 12, max : 14,  1 : 4 , 2 : 4 , 3 : 5 , 4 : 5 , 5 : 7 , 6 : 7 })
    hits.push({ min : 15, max : 15,  1 : 4 , 2 : 5 , 3 : 5 , 4 : 7 , 5 : 7 , 6 : 7 })
    hits.push({ min : 16, max : 100, 1 : 5 , 2 : 5 , 3 : 7 , 4 : 7 , 5 : 7 , 6 : 7 })
    return hits;
  }

  returnCorpsFireTable() {
    let hits = [];
    hits.push({ min : 0, max : 0, 1 : 0 , 2 : 0 , 3 : 0 , 4 : 0 , 5 : 1 , 6 : 1 })
    hits.push({ min : 1, max : 1, 1 : 0 , 2 : 0 , 3 : 0 , 4 : 1 , 5 : 1 , 6 : 1 })
    hits.push({ min : 2, max : 2, 1 : 0 , 2 : 1 , 3 : 1 , 4 : 1 , 5 : 1 , 6 : 1 })
    hits.push({ min : 3, max : 3, 1 : 1 , 2 : 1 , 3 : 1 , 4 : 1 , 5 : 2 , 6 : 2 })
    hits.push({ min : 4, max : 4, 1 : 1 , 2 : 1 , 3 : 1 , 4 : 2 , 5 : 2 , 6 : 2 })
    hits.push({ min : 5, max : 5, 1 : 1 , 2 : 1 , 3 : 2 , 4 : 2 , 5 : 2 , 6 : 3 })
    hits.push({ min : 6, max : 6, 1 : 1 , 2 : 1 , 3 : 2 , 4 : 2 , 5 : 3 , 6 : 3 })
    hits.push({ min : 7, max : 7, 1 : 1 , 2 : 2 , 3 : 2 , 4 : 3 , 5 : 3 , 6 : 4 })
    hits.push({ min : 8, max : 100, 1 : 2 , 2 : 2 , 3 : 3 , 4 : 3 , 5 : 4 , 6 : 4 })
    return hits;
  }

