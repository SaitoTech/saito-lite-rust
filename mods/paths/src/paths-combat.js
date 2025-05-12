
  returnDefenderUnits() {
    return this.game.spaces[this.game.state.combat.key].units;
  }

  returnAttackerUnits() {
    let x = this.game.state.combat.attacker;

    x.sort((a, b) => {
      if (a.unit_idx < b.unit_idx) { return -1; }
      if (a.unit_idx > b.unit_idx) { return 1; }   
      return 0;
    });

    let units = [];
    for (let z = 0; z < x.length; z++) {
      units.push(this.game.spaces[x[z].unit_sourcekey].units[x[z].unit_idx]);   
    }
    return units;
  }

  returnDefenderCombatPower() {
    let x = 0;
    for (let i = 0; i < this.game.spaces[this.game.state.combat.key].units.length; i++) {
      let unit = this.game.spaces[this.game.state.combat.key].units[i];
      if (unit.damaged) {
        x += unit.rcombat;
      } else {
        x += unit.combat;
      }
    }
    return x;
  }

  returnAttackerCombatPower() {
    let x = 0;
    for (let i = 0; i < this.game.state.combat.attacker.length; i++) {
      let unit = this.game.spaces[this.game.state.combat.attacker[i].unit_sourcekey].units[this.game.state.combat.attacker[i].unit_idx];
      if (unit) {
        if (unit.damaged) {
          x += unit.rcombat;
        } else {
          x += unit.combat;
        }
      }
    }
    return x;
  }

  returnArmyColumnNumber(cp=0) {
    if (cp >= 16) { return 10; }
    if (cp >= 15) { return 9; }
    if (cp >= 12) { return 8; }
    if (cp >= 9) { return 7; }
    if (cp >= 6) { return 6; }
    if (cp >= 5) { return 5; }
    if (cp >= 4) { return 4; }
    if (cp >= 3) { return 3; }
    if (cp >= 2) { return 2; }
    if (cp >= 1) { return 1; }
    return 0;
  }

  returnCorpsColumnNumber(cp=0) {
    if (cp >= 8) { return 9; }
    if (cp >= 7) { return 8; }
    if (cp >= 6) { return 7; }
    if (cp >= 5) { return 6; }
    if (cp >= 4) { return 5; }
    if (cp >= 3) { return 4; }
    if (cp >= 2) { return 3; }
    if (cp >= 1) { return 2; }
    return 1;
  }

  returnAttackerLossFactor() {

    let cp = this.returnDefenderCombatPower();

    //
    // forts lend their combat strength to the defender 
    //
    if (this.game.spaces[this.game.state.combat.key].fort > 0) {
      this.updateLog("Defender Combat Bonus " + this.game.spaces[this.game.state.combat.key].fort);
      cp += this.game.spaces[this.game.state.combat.key].fort;
    }
    
console.log("CALCULATING ATTACKER LOSS FACTOR (defender hits): )");
console.log("CP: " + cp);

    let hits = this.returnArmyFireTable();
    if (this.game.state.combat.defender_table === "corps") { hits = this.returnCorpsFireTable(); }

console.log("table: " + JSON.stringify(hits));

    for (let i = hits.length-1; i >= 0; i--) {
      if (hits[i].max >= cp && hits[i].min <= cp) {

	//
	// we have found the right column and row, but we shift
	// based on combat modifiers...
	//
console.log("original col: " + (i) + " " + this.game.state.combat.defender_column_shift);
	let col = i + this.game.state.combat.defender_column_shift;


	if (col <= 0) { col = 1; }
	if (col >= hits.length) { col = hits.length-1; }

console.log("adjusted col: " + col);
console.log("defender hits: " + hits[col][this.game.state.combat.defender_modified_roll]);
console.log("dmr: " + this.game.state.combat.defender_modified_roll);
        return hits[col][this.game.state.combat.defender_modified_roll];


      }
    }
    return 0;
  }

  returnDefenderLossFactor() {
    let cp = this.returnAttackerCombatPower();
console.log("CALCULATING DEFENDER LOSS FACTOR (attacker hits): )");
console.log("CP: " + cp);
    let hits = this.returnArmyFireTable();
    if (this.game.state.combat.attacker_table === "corps") { hits = this.returnCorpsFireTable(); }
console.log("table: " + JSON.stringify(hits));
    for (let i = hits.length-1; i >= 0; i--) {
      if (hits[i].max >= cp && hits[i].min <= cp) {
	
	//
	// we haev found the right column and row, but we shift
	// based on combat modifiers...
	//
	let col = i + this.game.state.combat.attacker_column_shift;
console.log("original col: " + i + " + " + this.game.state.combat.attacker_column_shift);
	if (col <= 0) { col = 1; }
	if (col >= hits.length) { col = hits.length-1; }
console.log("adjusted col: " + col);
console.log("calculating hits: " + hits[i][this.game.state.combat.attacker_modified_roll]);

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


  returnTerrainShift(spacekey="") {
    let tshift = { attack : 0 , defense : 0 , effects : [] };
    let space = this.game.spaces[spacekey];
    if (!space) { return tshift; }
    if (space.terrain == "mountain") { tshift.attack--; }
    if (space.terrain == "swamp") { tshift.attack--; }
    if (this.game.state.combat.cancel_trench_effects != 1) {
      if (space.trench == 1) { tshift.attack--; tshift.defense++; }
      if (space.trench == 2) { tshift.attack--; tshift.defense+=2; }
    }
    return tshift;
  }

  canCancelRetreat(spacekey="") {
    let space = this.game.spaces[spacekey];
    if (!space) { return false; }
    if (space.terrain == "mountain") { return true; }
    if (space.terrain == "swamp") { return true; }
    if (space.terrain == "forest") { return true; }
    if (space.terrain == "desert") { return true; }
    if (space.trench > 0) { return true; }
    return false;
  }

  canStopAdvance(spacekey="") {
    let space = this.game.spaces[spacekey];
    if (!space) { return false; }
    if (space.terrain == "mountain") { return true; }
    if (space.terrain == "swamp") { return true; }
    if (space.terrain == "forest") { return true; }
    if (space.terrain == "desert") { return true; }
    return false;
  }

  canFlankAttack() {

    let combat = this.game.state.combat;
    let spacekey = this.game.state.combat.key;
    let attacker_units = this.returnAttackerUnits();
    let defender_units = this.returnDefenderUnits();
    let space = this.game.spaces[spacekey];

    let is_one_army_attacking = false;
    let are_attacks_from_two_spaces = false;
    let attacker_spaces = [];
    let is_geography_suitable = true;
    let is_flank_attack_possible = false;

    //
    // at least one army attacking
    //
    for (let i = 0; i < attacker_units.length; i++) {
      if (!attacker_spaces.includes(attacker_units[i].spacekey)) { attacker_spaces.push(attacker_units[i].spacekey); }
      if (attacker_units[i].type == "army") { is_one_army_attacking = true; }
    }

    //
    // no swamp or mountain or trench or unoccupied fort
    //
    if (space.terrain == "mountain") { is_geography_suitable = false; }
    if (space.terrain == "swamp")    { is_geography_suitable = false; }
    if (space.trench > 0)            { is_geography_suitable = false; }
    if (space.fort > 0)              { is_geography_suitable = false; }
    if (attacker_spaces.length > 1)         { are_attacks_from_two_spaces = true; }

    if (is_geography_suitable == true && is_one_army_attacking == true && are_attacks_from_two_spaces == true) {
      is_flank_attack_possible = true;
    }

    return is_flank_attack_possible;

  }

