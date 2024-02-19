
  returnSpaceName(spacekey) {
    if (this.game.spaces[spacekey]) { return this.game.spaces[spacekey].name; }
    if (this.game.navalspaces[spacekey]) { return this.game.navalspaces[spacekey].name; }
    return spacekey;
  }

  

  resetBesiegedSpaces() {
    for (let space in this.game.spaces) {
      if (space.besieged == 2) { space.besieged = 1; }
    }
  }
  removeBesiegedSpaces() { this.removeSieges(); }
  removeSieges() {
    for (let space in this.game.spaces) {
      this.removeSiege(space);
    }
  }
  resetLockedTroops() {
    for (let space in this.game.spaces) {
      for (let f in this.game.spaces[space].units) {
        for (let z = 0; z < this.game.spaces[space].units[f].length; z++) {
          this.game.spaces[space].units[f][z].locked = false;
        }
      }
    }
  }

  addUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 1;
  }

  removeSiege(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.besieged = 0;
    for (let key in space.units) {
      for (let i = 0; i < space.units[key].length; i++) {
        space.units[key][i].besieged = 0;
      }
    }
  }

  removeUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 0;
  }

  hasProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["england"].length; i++) {
      let unit = space.units["england"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["france"].length; i++) {
      let unit = space.units["france"][i];
      if (unit.reformer) { return true; }
    }
    return false;
  }



  hasProtestantLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    //
    // only protestant units count
    //
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.type == "regular" || unit.type == "mercenary") { return true; }
    }

    //
    // unless Edward VI or Elizabeth I are on the throne
    //
    if (this.game.state.leaders.edward_vi == 1 || this.game.state.leaders.elizabeth_i == 1) {

      //
      // then british mercenaries and regulars count
      //
      for (let i = 0; i < space.units["england"].length; i++) {
        let unit = space.units["england"][i];
        if (unit.type == "regular" || unit.type == "mercenary") { return true; }
      }

      //
      // or Scottish ones if Scotland is allied to England
      //
      if (this.areAllies("england", "scotland")) {
        for (let i = 0; i < space.units["scotland"].length; i++) {
          let unit = space.units["scotland"][i];
          if (unit.type == "regular" || unit.type == "mercenary") { return true; }
        }
      }

    }

    return false;

  }

  returnCatholicLandUnitsInSpace(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let units = [];

    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {
	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	} else {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	}
      }
    }

    return units;

  }

  hasCatholicLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {
	if (f == "england" && (this.game.state.leaders.henry_viii != 1 && this.game.state.leaders.edward_vi != 1 && this.game.state.leaders.elizabeth_i != 1)) {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	} else {
	  if (f == "england") {
            if (this.returnFactionLandUnitsInSpace(f, space)) { return false; }
	  } else {
            if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	  }
	}
      }
    }

    return false;
  }


  isUnoccupied(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space];  } } catch (err) {}
    for (let key in space.units) {
      if (this.returnFactionLandUnitsInSpace(key, space.key) > 0) { return 0; }
    }
    return 1;
  }

  isNavalSpaceFriendly(space, faction) {
   
    // if a port, must be controlled by faction
    try { if (this.game.spaces[space]) { space = this.game.spaces[space];  } } catch (err) {}
    if (space.language != undefined) { return this.isSpaceFriendly(space, faction); }

    // if naval space, must not have enemy of faction
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (space.units[f].length > 0) {
	if (this.areEnemies(f, faction)) { return 0; }
      }	
    }    

    return 1;
  }


  canFactionMoveIntoSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return 1; }
    if (this.areEnemies(faction, cf)) { return 1; }
    if (this.areAllies(faction, cf)) { return 1; }
    if (this.isSpaceIndependent(space.key)) {

      // if controlled by non-independent, we cannot enter
      if (cf !== "independent") { return 0; }

      let is_empty = true;
      for (let key in space.units) {
	if (key != "independent") {
	  // don't let ourselves be blocked by non-controlling allies/enemies
          if (!this.areAllies(faction, key) && !this.areEnemies(faction, key)) {
            if (space.units[key].length > 0) {
              if (this.returnFactionLandUnitsInSpace(key, space.key, 1)) {
                is_empty = false;
  	        if (!this.areEnemies(faction, key) && !this.areAllies(faction, key)) { return 0; }
	      }
	    }
          }
        }
      }
      if (is_empty) { return 1; }
    }
    return 0;
  }

  isSpaceFriendly(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return true; }
    return this.areAllies(cf, faction);
  }

  isSpaceHostileOrIndependent(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (this.isSpaceHostile(space, faction)) { return true; }
    if (this.isSpaceIndependent(space)) { return true; }
    return false;
  }

  isSpaceIndependent(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.political === "independent") { return true; }
    if (space.home === "independent") { return true; }
    return false;
  }

  isSpaceHomeSpace(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.home === faction) { return true; }
    return false;
  }

  doesSpaceHaveNonFactionUnits(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (f != faction) {
        for (let i = 0; i < space.units[f].length; i++) {
	  let u = space.units[f][i];
	  if (u.type == "regular") { return true; }
	  if (u.type == "mercenary") { return true; }
	  if (u.type == "corsair") { return true; }
        }
      }
    }
    return false;
  }

  doesSpaceHaveEnemyUnits(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (this.areEnemies(faction, f)) {
        for (let i = 0; i < space.units[f].length; i++) {
	  let u = space.units[f][i];
	  if (i.army_leader || i.navy_leader) { return true; }
	  if (i.personage == true) { return false; } else { return true; }
        }
      }
    }
    return false;
  }

  isSpaceHostile(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return false; }
    return this.areEnemies(cf, faction);
  }


  doesSpaceHaveLineOfControl(space, faction) { return this.isSpaceInLineOfControl(space, faction); }
  isSpaceInLineOfControl(space, faction, transit_passes=1, transit_seas=1) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let already_routed_through = {};

    //
    // path of spaces and sea-zones from that space to friendly-controlled, 
    // fortified space that is a home space for that power or one of its allies 
    // (this even includes home spaces of minor powers allied to your major 
    // power allies). All spaces on the path (except the space where the path 
    // ends) must be:
    //
    // • friendly-controlled,
    // • free of enemy units (including naval units and leaders)
    // • free of unrest.
    //
    let res = this.returnNearestSpaceWithFilter(

      space.key ,

      // capitals are good destinations
      function(spacekey) {
        let invalid_choice = false;
        if (his_self.isSpaceFortified(spacekey) && his_self.isSpaceHomeSpace(spacekey, faction)) { invalid_choice = true; }
        if (!his_self.isSpaceFriendly(spacekey, faction)) { invalid_choice = false; }
        return invalid_choice;
      },

      // route through this?
      function(spacekey) {
        if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
        if (his_self.isSpaceFriendly(spacekey, faction) && his_self.doesSpaceHaveEnemyUnits(spacekey, faction) == false && his_self.isSpaceInUnrest(spacekey) != true) {
	  return 1;
	}
	return 0;
      },

      // transit passes? 0
      transit_passes,

      // transit seas?
      transit_seas,

      // faction? optional
      faction,

      // already crossed sea zone optional
      0
    );

    return res.length;

  }

  isSpaceControlled(space, faction) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == "") { return true; }

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == faction) { return true; }

    // independent (gray) spaces seized by the power.
    if (space.home === "independent" && space.political === faction) { return true; }

    // home spaces of other powers seized by the power.
    if (space.home !== faction && space.political === faction) { return true; }
    if (space.home === faction && space.political === faction) { return true; }

    // home spaces of allied minor powers. 
    if (space.political == "" && space.home !== faction && this.isAlliedMinorPower(space.home, faction)) { return true; }

    return false;
  }

  isSpaceFortified(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.type === "electorate" || space.type === "key" || space.type === "fortress") { return true; }
    return false;
  }

  returnHopsToFortifiedHomeSpace(source, faction) {
    let his_self = this;
    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, function(spacekey) {
      if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
	if (his_self.isSpaceControlled(spacekey, faction)) {
	  if (his_self.game.spaces[spacekey].home === faction) {
	    return 1;
	  }
	}
      }
      return 0;
    });
  }
  returnHopsToDestination(source, destination) {
    try { if (this.game.spaces[source]) { destination = this.game.spaces[source]; } } catch (err) {}
    try { if (this.game.spaces[destination]) { destination = this.game.spaces[destination]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, function(spacekey) {
      if (spacekey === destination.key) { return 1; }
      return 0;  
    });
  }

  returnHopsBetweenSpacesWithFilter(space, filter_func) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let map = {};
    let sources = [];
    let hop = 0;

    let addHop = function(sources, hop) {

      hop++;
      
      let new_neighbours = [];

      for (let i = 0; i < sources.length; i++) {
	for (let z = 0; z < his_self.game.spaces[sources[i]].neighbours.length; z++) {
	  let sourcekey = his_self.game.spaces[sources[i]].neighbours[z];
	  if (!map[sourcekey]) {
	    map[sourcekey] = 1;
	    new_neighbours.push(sourcekey);

	    //
	    // if we have a hit, it's this many hops!
	    //
	    if (filter_func(sourcekey)) { return hop; }
	  }
	}
      }

      if (new_neighbours.length > 0) {
	return addHop(new_neighbours, hop);
      } else {
	return 0;
      }

    }

    return addHop(space.neighbours, 0);   

  }

  //
  // similar to above, except it can cross a sea-zone
  //
  isSpaceConnectedToCapitalSpringDeployment(space, faction, transit_seas=1) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};
    let transit_passes = 0;
    let hostile_sea_passes = 0;

    if (this.game.state.spring_deploy_across_seas.includes(faction)) {
      hostile_sea_passes = 1;
    }
    if (this.game.state.spring_deploy_across_passes.includes(faction)) {
      transit_passes = 1;
    }

let debugmode = 0;
if (space.key == "cagliari") { debugmode = 1; 
  console.log("!");
  console.log("!");
  console.log("!");
  console.log("cagliari!");
}

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },


      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      },

      0, // include source

      // transit passes? 0
      transit_passes,

      // transit seas? 1
      transit_seas,
     
      // faction? optional
      faction,

      // already crossed sea zone optional
      0,

      // is spring deployment
      1
    );

    if (res.length > 0) {
      return 1;
    }

    return 0;

  }

  isSpaceAdjacentToReligion(space, religion) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.neighbours.length; i++) {
      if (this.game.spaces[space.neighbours[i]].religion === religion) {
	return true;
      }
    }
    return false;
  }

  isSpaceAdjacentToProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let z = 0; z < space.neighbours.length; z++) {
      if (this.doesSpaceContainProtestantReformer(space.neighbours[z])) { return true; }
    }
    return false;
  }

  // either in port or in adjacent sea
  returnNumberOfSquadronsProtectingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let number_of_squadrons_in_port = 0;
    let number_of_squadrons_at_sea = 0;

    //
    // in port
    //
    for (let f in space.units) {
      for (let i = 0; i < space.units[f].length; i++) {
        if (space.units[f][i].type == "squadron") {
	  if (space.units[f][i].besieged != 0) { number_of_squadrons_in_port++; }
	}
      }
    }

    //
    // adjacent sea
    //
    for (let p = 0; p < space.ports.length; p++) {

      let sea = this.game.navalspaces[space.ports[p]];

      for (let f in sea.units) {

	// faction at sea is friendly to port space controller
	if (this.isSpaceFriendly(space, f)) {
	  for (let i = 0; i < sea.units[f].length; i++) {
	    if (sea.units[f][i].type == "squadron") {
	      number_of_squadrons_at_sea++;
	    }
	  }
	}
      }
    }

    return (number_of_squadrons_in_port + number_of_squadrons_at_sea);

  }
  doesSpaceContainProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      if (space.units["protestant"][i].reformer == true) { return true; }
    }
    return false;
  }

  isSpaceAPortInTheSameSeaZoneAsACatholicPort(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let seas = [];
    for (let i = 0; i < space.ports.length; i++) {
      if (!seas.includes(space.ports[i])) { seas.push(space.ports[i]); }
    }
    for (let s in this.game.spaces) {
      let sp = this.game.spaces[s];
      if (sp.religion == "catholic" && sp.ports.length > 0) {
	for (let z = 0; z < sp.ports.length; z++) {
	  if (seas.includes(sp.ports[z])) { return true; }
	}
      }
    }  
    return false;
  }

  isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let seas = [];
    for (let i = 0; i < space.ports.length; i++) {
      if (!seas.includes(space.ports[i])) { seas.push(space.ports[i]); }
    }
    for (let s in this.game.spaces) {
      let sp = this.game.spaces[s];
      if (sp.religion == "protestant" && sp.ports.length > 0) {
	for (let z = 0; z < sp.ports.length; z++) {
	  if (seas.includes(sp.ports[z])) { return true; }
	}
      }
    }  
    return false;
  }


  returnSpacesWithFilter(filter_func) {
    let spaces = [];
    for (let spacekey in this.game.spaces) {
      if (filter_func(spacekey) == 1) { spaces.push(spacekey); }
    }
    return spaces;
  }

  isSpaceFactionCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let capitals = this.returnCapitals(faction);
    for (let i = 0; i < capitals.length; i++) {
      if (capitals[i] === space.key) { return true; }
    }
    return false;
  }

  isSpaceInUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.unrest == 1) { return true; }
    return false;
  }

  isSpaceUnderSiege(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.besieged > 0) { return true; }
    return false;
  }

  isSpaceConnectedToCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      }
    );

    return 1;
  }










  returnFactionControllingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let factions = this.returnImpulseOrder(); 
    for (let i = 0; i < factions.length; i++) {
      if (this.isSpaceControlled(space.key, factions[i])) { return factions[i]; }
    }
    if (space.political) { return space.political; }
    return space.home;
  }



  returnSpaceOfPersonage(faction, personage) {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i]) {
	    if (this.game.spaces[key].units[faction][i].type === personage) {
  	      return key;
            }
          }
        }
      }
    }
    return "";
  }

  returnIndexOfPersonageInSpace(faction, personage, spacekey="") {
    if (spacekey === "") { return -1; }
    if (!this.game.spaces[spacekey]) { return -1; }
    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
      if (this.game.spaces[spacekey].units[faction][i].type === personage) {
        return i;
      }
    }
    return -1;
  }

  returnNavalTransportDestinations(faction, space, ops) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let viable_destinations = [];
    let viable_navalspaces = [];
    let options = [];
    let ops_remaining = ops-1;    

    for (let i = 0; i < space.ports.length; i++) {
      if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	viable_navalspaces.push({key : space.ports[i] , ops_remaining : ops_remaining});
      }
    }

    //
    // TODO check for blocking fleet
    //
    while (ops_remaining > 1) {
      ops_remaining--;
      for (let i = 0; i < viable_navalspaces.length; i++) {
	for (let z = 0; z < this.game.navalspaces[viable_navalspaces[i].key].neighbours.length; z++) {
	  let ns = this.game.navalspaces[viable_navalspaces[i].key].neighbours[z];
          if (this.doesFactionHaveNavalUnitsInSpace(faction, ns)) {
	    let already_included = 0;
	    for (let z = 0; z < viable_navalspaces.length; z++) {
	      if (viable_navalspaces[z].key == ns) { already_included = 1; }
	    }
	    if (already_included == 0) {
	      viable_navalspaces.push({ key : ns , ops_remaining : ops_remaining });
	    }
	  }
	}
      }
    }

    //
    //
    //
    for (let i = 0; i < viable_navalspaces.length; i++) {
      let key = viable_navalspaces[i].key;
      for (let z = 0; z < this.game.navalspaces[key].ports.length; z++) {      
	let port = this.game.navalspaces[key].ports[z];
	if (port != space.key) {
	  viable_destinations.push({ key : port , cost : (viable_navalspaces[i].ops_remaining-1)});
	}
      }
    }

    return viable_destinations;

  }


  returnFactionNavalUnitsToMove(faction) {

    let units = [];

    //
    // include minor-activated factions
    //
    let fip = [];
    fip.push(faction);
    if (this.game.state.activated_powers[faction]) {
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
        fip.push(this.game.state.activated_powers[faction][i]);
      }
    }

    //
    // if this is the 2P game, include any major activated units
    //
    if (faction != "independent" && faction != "scotland" && faction != "genoa" && faction != "venice" && faction != "hungary") {
      if (this.game.players.length == 2) {
        if (this.areAllies(faction, "hapsburg") && faction != "hapsburg") { fip.push("hapsburg"); }
        if (this.areAllies(faction, "protestant") && faction != "protestant") { fip.push("protestant"); }
        if (this.areAllies(faction, "france") && faction != "france") { fip.push("france"); }
        if (this.areAllies(faction, "england") && faction != "england") { fip.push("england"); }
        if (this.areAllies(faction, "papacy") && faction != "papacy") { fip.push("papacy"); }
        if (this.areAllies(faction, "ottoman") && faction != "ottoman") { fip.push("ottoman"); }
      }
    }

    //
    // find units
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.spaces) {

	//
	// we only care about units in ports
	//
	if (this.game.spaces[key].ports) {
	if (this.game.spaces[key].ports.length > 0) {
	  let ships = [];
	  let leaders = [];
	  for (let z = 0; z < this.game.spaces[key].units[fip[i]].length; z++) {

	    //
	    // only add leaders if there is a ship in port
	    //
	    let u = this.game.spaces[key].units[fip[i]][z];
	    u.idx = z;

	    if (u.navy_leader == true) {
	      leaders.push(u);
	    } else {
	      if (u.land_or_sea === "sea" || u.land_or_sea === "both") {
		ships.push(u);
	      }
	    }
	  }

	  //
	  // add and include location
	  //
	  if (ships.length > 0) {
	    for (let y = 0; y < ships.length; y++) {
	      ships[y].spacekey = key;
	      ships[y].faction = fip[i];
	      units.push(ships[y]);
	    }
	    for (let y = 0; y < leaders.length; y++) {
	      leaders[y].spacekey = key;
	      units.push(leaders[y]);
	    }
	  }
	}
        }
      }
    }

    //
    // add ships and leaders out-of-port
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.navalspaces) {
	for (let z = 0; z < this.game.navalspaces[key].units[fip[i]].length; z++) {
	  this.game.navalspaces[key].units[fip[i]][z].spacekey = key;
	  this.game.navalspaces[key].units[fip[i]][z].faction = fip[i];
	  units.push(this.game.navalspaces[key].units[fip[i]][z]);
	}
      }
    }

    return units;
  }








  returnNearestFriendlyFortifiedSpaces(faction, space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let original_spacekey = space.key;
    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // fortified spaces
      function(spacekey) {

	// non-protestants can't move into electorates, so they aren't friendly fortified spaces 
	// for anyone at this point.
	if (faction !== "protestant" && his_self.game.state.events.schmalkaldic_league != 1) {
	  if (his_self.isElectorate(spacekey)) { return 0; }
	}

        if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
	  if (his_self.isSpaceControlled(spacekey, faction)) {
	    return 1;
	  }
	  if (his_self.isSpaceFriendly(spacekey, faction)) {
	    return 1;
	  }
	}
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	if (spacekey == original_spacekey) { return 1; }
	return 0;
      }, 


      true , // include source
    );

    return res;

  }


  returnNearestFactionControlledPorts(faction, spacekey) {

    let space = spacekey;

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestNavalSpaceOrPortWithFilter(

      space.key,

      // ports
      function(spacekey) {
        if (his_self.game.spaces[spacekey]) {
	  if (his_self.isSpaceControlled(spacekey, faction)) {
	    return 1;
	  }
	}
        return 0;
      },

      // route through this
      function(spacekey) {	
        if (his_self.game.spaces[spacekey]) { return 0; }
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	return 1;
      }
    );

    return res;

  }


  canFactionRetreatToSpace(faction, space, attacker_comes_from_this_space="") {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.spaces[attacker_comes_from_this_space]) { attacker_comes_from_this_space = this.game.spaces[attacker_comes_from_this_space]; } } catch (err) {}
    if (space === attacker_comes_from_this_space) { return 0; }
    if (this.isSpaceInUnrest(space) == 1) { return 0; }
    if (this.isSpaceFriendly(space, faction) == 1) { return 1; }
    return 0;
  }

  canFactionRetreatToNavalSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    if (this.isNavalSpaceFriendly(space, faction) == 1) { console.log("navalspace is friendly"); return 1; }
    if (this.isSpaceFriendly(space, faction) == 1) { console.log("space is friendly!"); return 1; }
    return 0;
  }

  convertSpace(religion, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (religion === "papacy") { religion = "catholic"; }
    space.religion = religion;
    this.displayBoard();
  }

  controlSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.political = faction;
    space.occupier = faction;
  }


  returnDefenderFaction(attacker_faction, space) {
    // called in combat, this finds whichever faction is there but isn't allied to the attacker
    // or -- failing that -- whichever faction is recorded as occupying the space.
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      let luis = 0;
      if (space.language == undefined) {
        luis = this.returnFactionSeaUnitsInSpace(f, space.key);
      } else {
        luis = this.returnFactionLandUnitsInSpace(f, space.key);
      }
      if (luis > 0) {
        if (!this.areAllies(attacker_faction, f) && f !== attacker_faction) {
	  return f;
	}
      }
    }
    return this.returnFactionOccupyingSpace(space);
  }

  returnFactionOccupyingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.occupier != "" && space.occupier != undefined && space.occupier != "undefined" && space.occupier != 'undefined') { 
      // whoever had units here first
      if (space.units[space.occupier]) {
        if (space.units[space.occupier].length > 0) {
          return space.occupier; 
        }
      }
    }
    // or whoever has political control
    if (space.political != "") { return space.political; }
    // or whoever has home control
    if (space.owner != -1) { return space.owner; }
    return space.home;
  }

  returnNonFactionLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (f !== faction) {
        for (let i = 0; i < space.units[f].length; i++) {
          if (space.units[f][i].type === "regular") { luis++; }
          if (space.units[f][i].type === "mercenary") { luis++; }
          if (space.units[f][i].type === "cavalry") { luis++; }
        }
      }
    }
    return luis;
  }

  returnHostileLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (this.areEnemies(faction, f)) {
        for (let i = 0; i < space.units[f].length; i++) {
          if (space.units[f][i].type === "regular") { luis++; }
          if (space.units[f][i].type === "mercenary") { luis++; }
          if (space.units[f][i].type === "cavalry") { luis++; }
        }
      }
    }
    return luis;
  }

  returnFriendlyLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionLandUnitsInSpace(faction, space, include_minor_allies=false) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (f in space.units) {
      if (include_minor_allies == false && f == faction) {
        for (let i = 0; i < space.units[f].length; i++) {
          if (space.units[f][i].type === "regular") { luis++; }
          if (space.units[f][i].type === "mercenary") { luis++; }
          if (space.units[f][i].type === "cavalry") { luis++; }
        }
      } else {
	if (include_minor_allies == true && (f == faction || this.isAlliedMinorPower(f, faction))) {
          for (let i = 0; i < space.units[f].length; i++) {
            if (space.units[f][i].type === "regular") { luis++; }
            if (space.units[f][i].type === "mercenary") { luis++; }
            if (space.units[f][i].type === "cavalry") { luis++; }
          }
        }
      }
    }
    return luis;
  }

  returnFactionSeaUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "squadron") { luis++; }
      if (space.units[faction][i].type === "corsair") { luis++; }
    }
    return luis;
  }

  doesOtherFactionHaveNavalUnitsInSpace(exclude_faction, key) {
    if (this.game.spaces[key]) {
      for (let f in this.game.spaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.spaces[key].units[f]) {
            for (let i = 0; i < this.game.spaces[key].units[f].length; i++) {
              if (this.game.spaces[key].units[f][i].type === "squadron" || this.game.spaces[key].units[f][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
      return 0;
    }
    if (this.game.navalspaces[key]) {
      for (let f in this.game.navalspaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.navalspaces[key].units[f]) {
            for (let i = 0; i < this.game.navalspaces[key].units[f].length; i++) {
              if (this.game.navalspaces[key].units[f][i].type === "squadron" || this.game.navalspaces[key].units[f][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
      return 0;
    }
    return 0;
  }

  doesFactionHaveNavalUnitsInSpace(faction, key) {
    if (this.game.spaces[key]) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
          if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    if (this.game.navalspaces[key]) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
          if (this.game.navalspaces[key].units[faction][i].type === "squadron" || this.game.navalspaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsOnBoard(faction) {
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
	  return 1;
	}
      }
    }
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].land_or_sea === "sea") {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  returnNavalFactionMap(space, faction1, faction2) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let faction_map = {};

    for (let f in space.units) {
      if (f === faction1) {
        faction_map[f] = faction1;
      }
      if (f === faction2) {
        faction_map[f] = faction2;
      }
    }
    return faction_map;
  }


  

  returnFactionMap(space, faction1, faction2) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let faction_map = {};

    for (let f in space.units) {
      if (this.returnFactionLandUnitsInSpace(f, space)) {
        if (f == faction1) {
          faction_map[f] = faction1;
        } else {
          if (f == faction2) {
            faction_map[f] = faction2;
          } else {
            if (this.areAllies(f, faction1)) {
              faction_map[f] = faction1;
            }
            if (this.areAllies(f, faction2)) {
              faction_map[f] = faction2;
            }
          }
        }
      }
    }
    return faction_map;
  }

  returnHomeSpaces(faction) {

    let spaces = [];

    for (let i in this.game.spaces) {
      if (this.game.spaces[i].home === faction) { spaces.push(i); }
    }

    return spaces;

  }

  //
  // transit seas calculates neighbours across a sea zone
  //
  // if transit_seas and faction is specified, we can only cross if
  // there are no ports in a zone with non-faction ships.
  //
  returnNeighboursAsArrayOfKeys(space, transit_passes=1, transit_seas=0, faction="") {
    let res = [];
    let x = this.returnNeighbours(space, transit_passes, transit_seas, faction);
    for (let i = 0; i < x.length; i++) {
      res.push(x[i].neighbour);
    }
    return res;
  }
  returnNeighbours(space, transit_passes=1, transit_seas=0, faction="", is_spring_deployment=0) {
try {

    let is_naval_space = false;

    // not a naval space
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; is_naval_space = true; } } catch (err) {}
    try { if (this.game.navalspaces[space.key]) { is_naval_space = true; } } catch (err) {}


    if (transit_seas == 0 && is_naval_space != true) {
      if (transit_passes == 1) {
	let res = [];
	for (let z = 0; z < space.neighbours.length; z++) {
	  res.push({ neighbour : space.neighbours[z] , overseas : false });
	} 
        return res;
      }
      let neighbours = [];
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];      
        if (!space.pass.includes[x]) {
  	  neighbours.push({ neighbour : x , overseas : false });
        }
      }
      return neighbours;
    } else {

      let neighbours = [];

      if (transit_passes == 1 && is_naval_space != true) {
	for (let z = 0; z < space.neighbours.length; z++) {
	  neighbours.push({ neighbour : space.neighbours[z] , overseas : false });
	}
      } else {
        for (let i = 0; i < space.neighbours.length; i++) {
          let x = space.neighbours[i];
	  if (is_naval_space != true) {
            if (!space.pass.includes[x]) {
              neighbours.push({ neighbour : x , overseas : false });
            }
          }
        }
      }

      //
      // any ports ?
      //
      if (space.ports) {
        if (space.ports.length > 0) {
	  for (let i = 0; i < space.ports.length; i++) {
	    let navalspace = "";

	    if (this.game.navalspaces[space.ports[i]]) {
	      navalspace = this.game.navalspaces[space.ports[i]];
	    } else {
	      navalspace = this.game.spaces[space.ports[i]];
	    }

	    let any_unfriendly_ships = false;


	    let ignore_hostiles = false;

	    if (this.game.state.spring_deploy_across_passes.includes(faction) && is_spring_deployment == 1) { ignore_hostiles = true; }

	    if (navalspace.ports) {
	      if (faction != "") {
	        for (let z = 0; z < navalspace.ports.length; z++) {
	          if (this.doesOtherFactionHaveNavalUnitsInSpace(faction, navalspace.ports[z])) {
		    if (this.game.state.events.spring_preparations != faction) {
	              if (ignore_hostiles == false) {
		        any_unfriendly_ships = true;
		      }
		    }
		  }
	        }
	      }
              for (let z = 0; z < navalspace.ports.length; z++) {
		let already_listed = false;
	        for (let zz = 0; zz < neighbours.length; zz++) {
	          if (neighbours[zz].neighbour === navalspace.ports[z]) {
		    already_listed = true;
		  }
 		}
	        if (already_listed == false && any_unfriendly_ships == false) {
	          neighbours.push({ neighbour : navalspace.ports[z] , overseas : true });
	        };
	      }
	    }
 	  }
        }
      }
      return neighbours;
    }
} catch (err) {
  alert("return neighbours bug pls report: " + JSON.stringify(err));
}
    return [];
  }


  //
  // only calculates moves from naval spaces, not outbound from ports
  //
  returnNavalNeighbours(space, transit_passes=1) {
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let neighbours = [];
    for (let i = 0; i < space.ports.length; i++) {
      let x = space.ports[i];
      neighbours.push(x);
    }
    for (let i = 0; i < space.neighbours.length; i++) {
      let x = space.neighbours[i];
      neighbours.push(x);
    }

    return neighbours;
  }




  //
  // returns adjacent naval and port spaces
  //
  returnNavalAndPortNeighbours(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let key = space.key;
    let neighbours = [];

    //
    // ports add only naval spaces
    //
    if (this.game.spaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
    }

    //
    // naval spaces add ports
    //
    if (this.game.navalspaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];
        neighbours.push(x);
      }
    }

    return neighbours;
  }


  //
  // returns both naval and port movement options
  //
  returnNavalMoveOptions(spacekey) {

    let neighbours = [];

    if (this.game.navalspaces[spacekey]) {
      for (let i = 0; i < this.game.navalspaces[spacekey].neighbours.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].neighbours[i]);
      }
      for (let i = 0; i < this.game.navalspaces[spacekey].ports.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].ports[i]);
      }
    } else {
      if (this.game.spaces[spacekey]) {
        for (let i = 0; i < this.game.spaces[spacekey].ports.length; i++) {
	  neighbours.push(this.game.spaces[spacekey].ports[i]);
        }
      }
    }

    return neighbours;
  }


  //
  // find the nearest destination.
  //
  returnNearestNavalSpaceOrPortWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNavalNeighbours(sourcekey);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }



    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.navalspaces[key].neighbours.length; i++) {
	      if (searched_spaces[this.game.navalspaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[this.game.navalspaces[key].neighbours[i]] = { hops : (hops+1) , key : this.game.navalspaces[key].neighbours[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  //
  // find the nearest destination.
  //
  // transit_eas = filters on spring deploment criteria of two friendly ports on either side of the zone + no uncontrolled ships in zone
  //
  returnNearestSpaceWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1, transit_passes=0, transit_seas=0, faction="", already_crossed_sea_zone=0, is_spring_deployment=0) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};


    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNeighbours(sourcekey, transit_passes, transit_seas, faction, is_spring_deployment);

if (sourcekey == "cagliari") {
  console.log("faction is: " + faction);
  console.log("neighbours: " + JSON.stringify(n));
  let cf = this.returnFactionControllingSpace("toulouse");
  console.log("controlling faction: " + cf + " faction is: " + faction);
  console.log("allies: " + this.areAllies(cf, faction));
}

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i].neighbour] = { hops : 0 , key : n[i] , overseas : n[i].overseas };
    }

    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key , overseas : pending_spaces[key].overseas });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
	    let nn = [];
	    if (pending_spaces[key].overseas) {
	      nn = this.returnNeighbours(key, transit_passes, 0, faction);
	    } else {
	      nn = this.returnNeighbours(key, transit_passes, 1, faction);
	    }
    	    for (let i = 0; i < nn.length; i++) {
	      if (searched_spaces[nn[i].neighbour]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[nn[i].neighbour] = { hops : (hops+1) , key : this.game.spaces[key].neighbours[i] , overseas : nn[i].overseas };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key , overseas : 0 };
	}
	delete pending_spaces[key];
      }

      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  isSpaceElectorate(spacekey) {
    if (spacekey === "augsburg") { return true; }
    if (spacekey === "mainz") { return true; }
    if (spacekey === "trier") { return true; }
    if (spacekey === "cologne") { return true; }
    if (spacekey === "wittenberg") { return true; }
    if (spacekey === "brandenburg") { return true; }
    return false;
  }

  returnNumberOfCatholicElectorates() {
    let controlled_keys = 0;
    if (!this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfProtestantElectorates() {
    let controlled_keys = 0;
    if (this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByCatholics() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "catholic") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByProtestants() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "protestant") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByFaction(faction) {
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }

    //
    // minor allied powers
    //
    if (faction === this.returnAllyOfMinorPower("genoa")) {
      for (let key in this.game.spaces) {
        if (this.game.spaces[key].type === "key") {
          if (this.game.spaces[key].political === "genoa" || (this.game.spaces[key].political === "" && this.game.spaces[key].home === "genoa")) {
            controlled_keys++;
          }
        }
      }
    }
    if (faction === this.returnAllyOfMinorPower("scotland")) {
      for (let key in this.game.spaces) {
        if (this.game.spaces[key].type === "key") {
          if (this.game.spaces[key].political === "scotland" || (this.game.spaces[key].political === "" && this.game.spaces[key].home === "scotland")) {
            controlled_keys++;
          }
        }
      }
    }
    if (faction === this.returnAllyOfMinorPower("hungary")) {
      for (let key in this.game.spaces) {
        if (this.game.spaces[key].type === "key") {
          if (this.game.spaces[key].political === "hungary" || (this.game.spaces[key].political === "" && this.game.spaces[key].home === "hungary")) {
            controlled_keys++;
          }
        }
      }
    }
    if (faction === this.returnAllyOfMinorPower("venice")) {
      for (let key in this.game.spaces) {
        if (this.game.spaces[key].type === "key") {
          if (this.game.spaces[key].political === "venice" || (this.game.spaces[key].political === "" && this.game.spaces[key].home === "venice")) {
            controlled_keys++;
          }
        }
      }
    }

    return controlled_keys;
  }
  returnNumberOfKeysControlledByPlayer(player_num) {
    let faction = this.game.state.players_info[player_num-1].faction;
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }

  returnNumberOfCatholicSpacesInLanguageZone(language="", do_not_count_unrest = 0) {  
    let catholic_spaces = 0;
    for (let key in this.game.spaces) {
      if (do_not_count_unrest == 0) {
        if ((this.game.spaces[key].unrest == 1 && this.game.spaces[key].religion == "protestant") || this.game.spaces[key].religion === "catholic") {
  	  if (language == "" || this.game.spaces[key].language == language) {
	    catholic_spaces++;
	  }
	}
      } else {
        if (this.game.spaces[key].religion === "catholic") {
  	  if (language == "" || this.game.spaces[key].language == language) {
	    catholic_spaces++;
	  }
        }
      }
    }
    return catholic_spaces;
  }

  returnNumberOfProtestantSpacesInLanguageZone(language="", do_not_count_unrest = 0) {  
console.log("language zone: " + language);
    let protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (do_not_count_unrest == 0) {
        if (this.game.spaces[key].religion === "protestant" && this.game.spaces[key].unrest == 0) {
console.log(this.game.spaces[key].name + " -- " + this.game.spaces[key].language);
	  if (language == "all" || language == "" || this.game.spaces[key].language == language) {
	    protestant_spaces++;
	  }
        }
      } else {
        if (this.game.spaces[key].religion === "protestant") {
	  if (language == "all" || language == "" || this.game.spaces[key].language == language) {
	    protestant_spaces++;
	  }
        }
      }
    }
    return protestant_spaces;
  }


  returnNavalSpaces() {

    let seas = {};

    seas['irish'] = {
      top : 875 ,
      left : 900 ,
      name : "Irish Sea" ,
      ports : ["glasgow"] ,
      neighbours : ["biscay","north","channel"] ,
    }
    seas['biscay'] = {
      top : 1500 ,
      left : 1400 ,
      name : "Bay of Biscay" ,
      ports : ["brest", "nantes", "bordeaux", "corunna" ] ,
      neighbours : ["irish","channel","atlantic"] ,
    }
    seas['atlantic'] = {
      top : 2700 ,
      left : 850 ,
      name : "Atlantic Ocean" ,
      ports : ["gibraltar" , "seville" , "corunna"] ,
      neighbours : ["biscay"] ,
    }
    seas['channel'] = {
      top : 1020 ,
      left : 1450 ,
      name : "English Channel" ,
      ports : ["brest", "plymouth", "portsmouth", "rouen", "boulogne", "calais" ] ,
      neighbours : ["irish","biscay","north"] ,
    }
    seas['north'] = {
      top : 200 ,
      left : 2350 ,
      name : "North Sea" ,
      ports : ["london", "norwich", "berwick", "edinburgh", "calais", "antwerp", "amsterdam", "bremen", "hamburg" ] ,
      neighbours : ["irish","channel","baltic"] ,
    }
    seas['baltic'] = {
      top : 50 ,
      left : 3150 ,
      name : "Baltic Sea" ,
      ports : ["lubeck", "stettin" ] ,
      neighbours : ["north"] ,
    }
    seas['gulflyon'] = {
      top : 1930 ,
      left : 2430 ,
      name : "Gulf of Lyon" ,
      ports : ["cartagena", "valencia", "palma", "barcelona" , "marseille", "nice" , "genoa", "bastia" ] ,
      neighbours : ["barbary","tyrrhenian"] ,
    }
    seas['barbary'] = {
      top : 2330 ,
      left : 2430 ,
      name : "Barbary Coast" ,
      ports : ["gibraltar", "oran", "cartagena", "algiers" , "tunis", "cagliari" , "palma" ] ,
      neighbours : ["gulflyon","tyrrhenian","ionian","africa"] ,
    }
    seas['tyrrhenian'] = {
      top : 2260 ,
      left : 3300 ,
      name : "Tyrrhenian Sea" ,
      ports : ["genoa" , "bastia" , "rome" , "naples" , "palermo" , "cagliari" , "messina" ] ,
      neighbours : ["barbary","gulflyon"] ,
    }
    seas['africa'] = {
      top : 2770 ,
      left : 4200 ,
      name : "North African Coast" ,
      ports : ["tunis" , "tripoli" , "malta" , "candia" , "rhodes" ] ,
      neighbours : ["ionian","barbary","aegean"] ,
    }
    seas['aegean'] = {
      top : 2470 ,
      left : 4450 ,
      name : "Aegean Sea" ,
      ports : ["rhodes" , "candia" , "coron" , "athens" , "salonika" , "istanbul" ] ,
      neighbours : ["black","africa","ionian"] ,
    }
    seas['ionian'] = {
      top : 2390 ,
      left : 3750 ,
      name : "Ionian Sea" ,
      ports : ["malta" , "messina" , "coron", "lepanto" , "corfu" , "taranto" ] ,
      neighbours : ["black","aegean","adriatic"] ,
    }
    seas['adriatic'] = {
      top : 1790 ,
      left : 3400 ,
      name : "Adriatic Sea" ,
      ports : ["corfu" , "durazzo" , "scutari" , "ragusa" , "trieste" , "venice" , "ravenna" , "ancona" ] ,
      neighbours : ["ionian"] ,
    }
    seas['black'] = {
      top : 1450 ,
      left : 4750 ,
      name : "Black Sea" ,
      ports : ["istanbul" , "varna" ] ,
      neighbours : ["aegean"] ,
    }

    for (let key in seas) {
      seas[key].units = {};
      seas[key].units['england'] = [];
      seas[key].units['france'] = [];
      seas[key].units['hapsburg'] = [];
      seas[key].units['ottoman'] = [];
      seas[key].units['papacy'] = [];
      seas[key].units['protestant'] = [];
      seas[key].units['venice'] = [];
      seas[key].units['genoa'] = [];
      seas[key].units['hungary'] = [];
      seas[key].units['scotland'] = [];
      seas[key].units['independent'] = [];
      seas[key].key = key;
    }

    return seas;
  }

  returnSpaceName(key) {
    if (this.game.spaces[key]) { return this.game.spaces[key].name; }
    if (this.game.navalspaces[key]) { return this.game.navalspaces[key].name; }
    return "Unknown";
  }


  returnSpacesInUnrest() {
    let spaces_in_unrest = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].unrest == 1) { spaces_in_unrest.push(key); }
    }
    return spaces_in_unrest;
  }

  returnSpacesWithAdjacentFactionInfantry(faction) {
    return this.returnSpacesWithFactionInfantry(faction, true);
  }

  returnSpacesWithFactionInfantry(faction, adjacency_ok=false) {
    let spaces_with_infantry = [];
    for (let key in this.game.spaces) {
      let added = false;
      if (this.game.spaces[key].units[faction].length > 0) {
        spaces_with_infantry.push(key);
        added = true;
      }
      if (adjacency_ok == true && added == false) {
        for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
          let n = this.game.spaces[key].neighbours[i];
	  if (added == false && this.game.spaces[n].units[faction].length > 0) {
	    spaces_with_infantry.push(key);
	    added = true;
	  }
	}
      }
    }
    return spaces_with_infantry;
  }

  returnSpaces() {

    let spaces = {};

    spaces['stirling'] = {
      top: 70,
      left: 1265,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["glasgow","edinburgh"],
      language: "english",
      type: "fortress"
    }
    spaces['glasgow'] = {
      top: 225,
      left: 1285,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["stirling","edinburgh","carlisle"],
      language: "english",
      type: "town"
    }
    spaces['edinburgh'] = {
      top: 125,
      left: 1420,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["stirling","carlisle","berwick"],
      language: "english",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
      ports: ["north"],
      neighbours: ["edinburgh","carlisle","york"],
      language: "english",
      religion: "catholic",
      type: "town"
    }
    spaces['carlisle'] = {
      top: 276,
      left: 1447,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["glasgow","berwick","york","shrewsbury"],
      language: "english",
      type: "town"
    }
    spaces['york'] = {
      top: 375,
      left: 1595,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["berwick","carlisle","shrewsbury","lincoln"],
      language: "english",
      type: "key"
    }
    spaces['wales'] = {
      top: 633,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["shrewsbury","bristol"],
      language: "english",
      type: "town"

    }
    spaces['shrewsbury'] = {
      top: 521,
      left: 1535,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["wales","carlisle","york","london","bristol"],
      language: "english",
      type: "town"
    }
    spaces['lincoln'] = {
      top: 531,
      left: 1706,
      home: "england",
      political: "england",
      religion: "catholic",
      neighbours: ["london","york"],
      language: "english",
      type: "town"
    }
    spaces['norwich'] = {
      top: 538,
      left: 1896,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours:["london"],
      language: "english",
      type: "town"
    }
    spaces['bristol'] = {
      top: 688,
      left: 1554,
      home: "england",
      political: "england",
      religion: "catholic",
      language: "english",
      ports: ["irish"],
      neighbours: ["shrewsbury","wales","plymouth","portsmouth","london"],
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["norwich","lincoln","bristol","portsmouth","shrewsbury"],
      language: "english",
      type: "key"
    }
    spaces['plymouth'] = {
      top: 898,
      left: 1398,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["irish"],
      neighbours: ["bristol","portsmouth"],
      language: "english",
      type: "town"
    }
    spaces['portsmouth'] = {
      top: 821,
      left: 1661,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["plymouth","bristol","london"],
      language: "english",
      type: "town"
    }
    spaces['calais'] = {
      top: 745,
      left: 2022,
      home: "england",
      political: "england",
      religion: "catholic",
      ports:["north"], 
      neighbours: ["boulogne","brussels","antwerp"],
      language: "french",
      type: "key"
    }

    spaces['boulogne'] = {
      top: 880,
      left: 1955,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channel"],
      neighbours: ["calais","rouen","paris","stquentin"],
      language: "french",
      type: "town"
    }
    spaces['stquentin'] = {
      name: "St. Quentin",
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stdizier","paris","boulogne"],
      type: "town"
    }
    spaces['stdizier'] = {
      name: "St. Dizier",
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stquentin","paris","dijon","metz"],
      language: "french",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","boulogne","stquentin","stdizier","dijon","orleans"],
      language: "french",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      ports: ["channel"],
      religion: "channelc",
      neighbours: ["boulogne","paris","tours","nantes"],
      language: "french",
      type: "key"
    }
    spaces['orleans'] = {
      top: 1217,
      left: 2018,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["paris","tours","dijon","lyon"],
      language: "french",
      type: "town"
    }
    spaces['dijon'] = {
      top: 1205,
      left: 2204,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["stdizier","paris","orleans","lyon","besancon"],
      type: "town"
    }
    spaces['limoges'] = {
      top: 1398,
      left: 1975,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["tours","bordeaux","lyon"],
      language: "french",
      type: "town"
    }
    spaces['tours'] = {
      top: 1277,
      left: 1849,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","nantes","bordeaux","limoges","orleans"],
      language: "french",
      type: "town"
    }
    spaces['nantes'] = {
      top: 1310,
      left: 1650,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["brest","rouen","tours","bordeaux"],
      language: "french",
      type: "town"
    }
    spaces['brest'] = {
      top: 1173,
      left: 1409,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["channel","biscay"],
      neighbours: ["nantes"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["biscay"],
      neighbours: ["navarre", "nantes","tours","limoges"],
      pass: ["navarre"],
      language: "french",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["avignon","limoges","orleans","dijon","geneva","grenoble"],
      language: "french",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["turin","lyon","geneva"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","toulouse","lyon","marseille"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["lyon"],
      neighbours: ["avignon","nice"],
      language: "french",
      type: "key"
    }
    spaces['toulouse'] = {
      top: 1740,
      left: 1990,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","bordeaux","avignon"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }

    spaces['munster'] = {
      top: 537,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","kassel","cologne","amsterdam"],
      language: "german",
      type: "town"
    }
    spaces['bremen'] = {
      top: 422,
      left: 2595,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours:["munster","brunswick","hamburg"],
      language: "german",
      type: "town"
    }
    spaces['hamburg'] = {
      top: 345,
      left: 2758,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["bremen","brunswick","lubeck"],
      language: "german",
      type: "town"
    }
    spaces['lubeck'] = {
      top: 258,
      left: 2985,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["hamburg","magdeburg","brandenburg","stettin"],
      language: "german",
      type: "town"
    }
    spaces['stettin'] = {
      top: 310,
      left: 3214,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      ports: ["baltic"],
      neighbours: ["lubeck","brandenburg"],
      language: "german",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 467,
      left: 3080,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["stettin","lubeck","magdeburg","wittenberg","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 610,
      left: 3133,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["brandenburg","magdeburg","leipzig","prague","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 536,
      left: 2935,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["lubeck","brandenburg","wittenberg","erfurt","brunswick"],
      language: "german",
      type: "town"
    }
    spaces['brunswick'] = {
      top: 568,
      left: 2722,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["bremen","hamburg","magdeburg","kassel"],
      language: "german",
      type: "town"
    }
    spaces['cologne'] = {
      top: 726,
      left: 2500,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","mainz","liege"],
      language: "german",
      type: "electorate"
    }
    spaces['kassel'] = {
      top: 714,
      left: 2665,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["munster","brunswick","erfurt","nuremberg","mainz"],
      language: "german",
      type: "town"
    }
    spaces['erfurt'] = {
      top: 750,
      left: 2824,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["magdeburg","kassel","leipzig"],
      language: "german",
      type: "town"
    }
    spaces['leipzig'] = {
      top: 690,
      left: 2983,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["wittenberg","prague","nuremberg","erfurt"],
      language: "german",
      type: "town"
    }
    spaces['regensburg'] = {
      top: 956,
      left: 3033,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["nuremberg","augsburg","salzburg","linz"],
      language: "german",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["graz","linz","regensburg","augsburg","innsbruck"],
      pass: ["graz"],
      language: "german",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1084,
      left: 2864,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["innsbruck","worms","nuremberg","regensburg","salzburg"],
      pass: ["innsbruck"],
      language: "german",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 930,
      left: 2837,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["augsburg","worms","mainz","kassel","leipzig","regensburg"],
      language: "german",
      type: "town"
    }
    spaces['mainz'] = {
      top: 872,
      left: 2668,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["trier","cologne","kassel","nuremberg","worms"],
      language: "german",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 897,
      left: 2521,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["liege","metz","mainz"],
      language: "german",
      type: "electorate"
    }
    spaces['strasburg'] = {
      top: 1070,
      left: 2578,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["metz","besancon","basel","worms"],
      language: "german",
      type: "town"
    }
    spaces['worms'] = {
      top: 1009,
      left: 2704,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["strasburg","mainz","nuremberg","augsburg"],
      language: "german",
      type: "town"
    }
    spaces['navarre'] = {
      top: 1814,
      left: 1702,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["zaragoza","bilbao"],
      language: "spanish",
      type: "key"
    }
    spaces['bilbao'] = {
      top: 1825,
      left: 1533,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","valladolid","zaragoza","navarre"],
      language: "spanish",
      type: "town"
    }
    spaces['corunna'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["biscay","atlantic"],
      neighbours: ["bilbao","valladolid"],
      language: "spanish",
      type: "town"
    }
    spaces['valladolid'] = {
      top: 2058,
      left: 1394,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["corunna","bilbao","madrid"],
      language: "spanish",
      type: "key"
    }
    spaces['zaragoza'] = {
      top: 2025,
      left: 1777,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["navarre","bilbao","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['barcelona'] = {
      top: 2062,
      left: 2106,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["toulouse","avignon","zaragoza","valencia"],
      pass: ["toulouse","avignon"],
      language: "spanish",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
      ports: ["gulflyon","barbary"],
      neighbours: ["cartagena","cagliari"],
      language: "other",
      religion: "catholic",
      type: "town"
    }
    spaces['madrid'] = {
      top: 2236,
      left: 1550,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","valladolid","zaragoza","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["cartagena","madrid","barcelona"],
      language: "spanish",
      type: "town"
    }
    spaces['cartagena'] = {
      top: 2593,
      left: 1830,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","barbary"],
      neighbours: ["granada","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['granada'] = {
      top: 2657,
      left: 1558,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["cordoba","gibraltar","cartagena"],
      language: "spanish",
      type: "town"
    }
    spaces['seville'] = {
      top: 2642,
      left: 1319,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic"],
      neighbours: ["cordoba","gibraltar"],
      language: "spanish",
      type: "key"
    }
    spaces['cordoba'] = {
      top: 2530,
      left: 1446,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["madrid","seville","granada"],
      language: "spanish",
      type: "town"
    }
    spaces['gibraltar'] = {
      top: 2814,
      left: 1374,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["atlantic","barbary"],
      neighbours: ["seville","granada"],
      language: "spanish",
      type: "fortress"
    }
    spaces['oran'] = {
      top: 2822,
      left: 1902,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary","africa"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports:["tyrrhenian","barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["messina"],
      language: "italian",
      type: "town"
    }
    spaces['messina'] = {
      top: 2429,
      left: 3475,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian","ionian"],
      neighbours: ["palermo","naples","taranto"],
      language: "italian",
      type: "town"
    }
    spaces['cerignola'] = {
      top: 1915,
      left: 3426,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["taranto","ancona","rome"],
      language: "italian",
      type: "town"
    }
    spaces['taranto'] = {
      top: 2080,
      left: 3597,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian"],
      neighbours: ["cerignola","naples","messina"],
      language: "italian",
      type: "town"
    }
    spaces['naples'] = {
      top: 2087,
      left: 3358,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["rome","taranto","messina"],
      language: "italian",
      type: "key"
    }
    spaces['malta'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["ionian","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['vienna'] = {
      top: 1020,
      left: 3474,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["brunn","linz","graz","pressburg"],
      language: "german",
      type: "key"
    }
    spaces['linz'] = {
      top: 1045,
      left: 3288,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["prague","regensburg","salzburg","vienna"],
      language: "german",
      type: "town"
    }
    spaces['graz'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["salzburg","vienna","mohacs","agram","trieste"],
      pass: ["salzburg"],
      language: "german",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["graz","agram","zara","venice"],
      language: "italian",
      type: "town"
    }
    spaces['innsbruck'] = {
      top: 1170,
      left: 3016,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["augsburg","trent","zurich","salzburg"],
      pass: ["augsburg","trent"],
      language: "german",
      type: "town"
    }
    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religion: "other",
      ports:["ionian","aegean"],
      neighbours: ["athens"],
      language: "other",
      type: "town"
    }
    spaces['athens'] = {
      top: 2346,
      left: 4286,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["aegean"],
      neighbours: ["larissa","lepanto","coron"],
      language: "other",
      type: "key"
    }
    spaces['lepanto'] = {
      top: 2320,
      left: 4057,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["ionian"],
      neighbours: ["larissa","athens"],
      language: "other",
      type: "town"
    }
    spaces['larissa'] = {
      top: 2184,
      left: 4130,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["durazzo","lepanto","athens","salonika"],
      pass: ["durazzo"],
      language: "other",
      type: "town"
    }
    spaces['salonika'] = {
      top: 2010,
      left: 4164,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["larissa","edirne"],
      language: "other",
      type: "key"
    }
    spaces['durazzo'] = {
      top: 2040,
      left: 3844,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["larissa","scutari"],
      pass: ["larissa"],
      language: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["nezh","ragusa","durazzo"],
      pass: ["nezh"],
      language: "other",
      type: "fortress"
    }
    spaces['edirne'] = {
      top: 1840,
      left: 4532,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["varna","istanbul","salonika","sofia",],
      language: "other",
      type: "key"
    }
    spaces['istanbul'] = {
      top: 1890,
      left: 4775,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black","aegean"],
      neighbours: ["edirne","varna"],
      language: "other",
      type: "key"
    }
    spaces['varna'] = {
      top: 1620,
      left: 4653,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["black"],
      neighbours: ["bucharest","edirne","istanbul"],
      language: "other",
      type: "town"
    }
    spaces['bucharest'] = {
      top: 1430,
      left: 4459,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","varna"],
      language: "other",
      type: "town"
    }
    spaces['nicopolis'] = {
      top: 1570,
      left: 4336,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["szegedin","sofia","bucharest","belgrade"],
      pass: ["szegedin","sofia"],
      language: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","nezh","edirne"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["scutari","belgrade","sofia"],
      pass: ["scutari"],
      language: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["ragusa","szegedin","mohacs","agram","nezh","nicopolis"],
      pass: ["ragusa"],
      language: "other",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["nicopolis","buda","belgrade"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['mohacs'] = {
      top: 1353,
      left: 3710,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["buda","graz","agram","belgrade"],
      language: "other",
      type: "town"
    }
    spaces['graz'] = {
      top: 1208,
      left: 3374,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","mohacs","agram","trieste"],
      language: "german",
      type: "town"
    }
    spaces['agram'] = {
      top: 1373,
      left: 3460,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["zara","graz","trieste","belgrade","mohacs"],
      pass: ["zara"],
      language: "other",
      type: "town"
    }
    spaces['buda'] = {
      top: 1104,
      left: 3746,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["pressburg","mohacs","szegedin"],
      language: "other",
      type: "key"
    }
    spaces['pressburg'] = {
      top: 1080,
      left: 3613,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["vienna","buda"],
      language: "other",
      type: "town"
    }
    spaces['brunn'] = {
      top: 840,
      left: 3526,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["breslau","prague","vienna"],
      language: "other",
      type: "town"
    }
    spaces['breslau'] = {
      top: 640,
      left: 3466,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["brandenburg","wittenberg","brunn"],
      language: "other",
      type: "town"
    }
    spaces['prague'] = {
      top: 785,
      left: 3230,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["wittenberg","leipzig","linz"],
      language: "other",
      type: "key"
    }
    spaces['amsterdam'] = {
      top: 546,
      left: 2244,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","munster"],
      language: "other",
      type: "town"
    }
    spaces['antwerp'] = {
      top: 669,
      left: 2168,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: ["antwerp","liege","brussels","calais"],
      language: "other",
      type: "key"
    }
    spaces['brussels'] = {
      top: 823,
      left: 2201,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["antwerp","calais","stquentin","stdizier","liege"],
      language: "french",
      type: "fortress"
    }
    spaces['liege'] = {
      top: 783,
      left: 2351,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["cologne","trier","metz","brussels","antwerp"],
      language: "french",
      type: "town"
    }
    spaces['metz'] = {
      top: 995,
      left: 2384,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["liege","trier","strasburg","besancon","stdizier"],
      language: "french",
      type: "key"
    }
    spaces['besancon'] = {
      top: 1169,
      left: 2390,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      neighbours: ["metz","dijon","geneva","basel","strasburg"],
      language: "french",
      type: "fortress"
    }
    spaces['basel'] = {
      top: 1211,
      left: 2558,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["strasburg","besancon","geneva","zurich"],
      language: "german",
      type: "town"
    }
    spaces['zurich'] = {
      top: 1216,
      left: 2712,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","innsbruck"],
      language: "german",
      type: "town"
    }
    spaces['geneva'] = {
      top: 1367,
      left: 2474,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["basel","besancon","lyon","turin","grenoble"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['milan'] = {
      top: 1373,
      left: 2746,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["trent","modena","pavia","turin"],
      language: "italian",
      type: "key"
    }
    spaces['trent'] = {
      top: 1310,
      left: 2933,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["innsbruck","milan","modena","venice"],
      pass: ["innsbruck"],
      language: "italian",
      type: "town"
    }
    spaces['modena'] = {
      top: 1486,
      left: 2951,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["trent","milan","pavia","florence","ravenna","venice"],
      language: "italian",
      type: "town"
    }
    spaces['pavia'] = {
      top: 1505,
      left: 2800,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["milan","turin","genoa","modena"],
      language: "italian",
      type: "town"
    }
    spaces['turin'] = {
      top: 1530,
      left: 2585,
      home: "independent",
      political: "france",
      religion: "catholic",
      neighbours: ["milan","pavia","geneva","grenoble","genoa"],
      pass: ["grenoble","geneva"],
      language: "italian",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["genoa","marseille"],
      pass: ["genoa"],
      language: "french",
      type: "town"
    }
    spaces['florence'] = {
      top: 1642,
      left: 2976,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["modena","genoa","siena"],
      language: "italian",
      type: "key"
    }
    spaces['siena'] = {
      top: 1805,
      left: 2988,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["genoa","florence","rome"],
      language: "italian",
      type: "town"
    }
    spaces['bastia'] = {
      top: 1829,
      left: 2784,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: ["nice","pavia","turin","modena","siena"],
      pass: ["nice"],
      language: "italian",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
      neighbours: ["siena","ancona","cerignola","naples"],
      language: "italian",
      type: "key"
    }
    spaces['ancona'] = {
      top: 1754,
      left: 3238,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["ravenna","rome","cerignola"],
      language: "italian",
      type: "town"
    }
    spaces['ravenna'] = {
      top: 1596,
      left: 3130,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["venice","modena","ancona"],
      language: "italian",
      type: "key" 
    }
    spaces['venice'] = {
      top: 1399,
      left: 3086,
      home: "venice",
      political: "",
      religion: "catholic",
      ports:["adriatic"],
      neighbours: ["trent","modena","ravenna","trieste"],
      language: "italian",
      type: "key"
    }
    spaces['zara'] = {
      top: 1571,
      left: 3374,
      home: "venice",
      political: "",
      religion: "catholic",
      neighbours: ["agram","ragusa","trieste"],
      pass: ["agram"],
      language: "other",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["belgrade","zara","scutari"],
      pass: ["belgrade"],
      language: "italian",
      type: "town"
    }

    //
    // foreign war cards are spaces
    //
    spaces['egypt'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['ireland'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['persia'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }

    for (let key in spaces) {
      spaces[key].key = key;
      spaces[key].units = {};
      spaces[key].units['england'] = [];
      spaces[key].units['france'] = [];
      spaces[key].units['hapsburg'] = [];
      spaces[key].units['ottoman'] = [];
      spaces[key].units['papacy'] = [];
      spaces[key].units['protestant'] = [];
      spaces[key].units['venice'] = [];
      spaces[key].units['genoa'] = [];
      spaces[key].units['hungary'] = [];
      spaces[key].units['scotland'] = [];
      spaces[key].units['independent'] = [];
      spaces[key].university = 0;
      spaces[key].unrest = 0;
      if (!spaces[key].ports) { spaces[key].ports = []; }
      if (!spaces[key].pass) { spaces[key].pass = []; }
      if (!spaces[key].name) { spaces[key].name = key.charAt(0).toUpperCase() + key.slice(1); }
      if (!spaces[key].key) { spaces[key].key = key; }
      if (!spaces[key].besieged) { spaces[key].besieged = 0; }
      if (!spaces[key].besieged_factions) { spaces[key].besieged_factions = []; }
    }

    return spaces;

  }


  isOccupied(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    for (let key in space.units) {
      if (space.units[key].length > 0) { return 1; }
    }

    return 0;
  }

  isElectorate(spacekey) {

    try { if (spacekey.key) { spacekey = spacekey.key; } } catch (err) {}

    if (spacekey === "augsburg") { return 1; }
    if (spacekey === "trier") { return 1; }
    if (spacekey === "cologne") { return 1; }
    if (spacekey === "wittenberg") { return 1; }
    if (spacekey === "mainz") { return 1; }
    if (spacekey === "brandenburg") { return 1; }
    return 0;
  }

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    let his_self = this;

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {

	let html = '<div class="space_view" id="">';

	let home = obj.home;
	let religion = obj.religion;
	let political = obj.political;
	let language = obj.language;
	if (!political) { political = obj.home; }

	if (political == "genoa" || political == "venice" || political == "scotland" || political == "hungary" || political == "independent") { his_self.game.state.board[political] = his_self.returnOnBoardUnits(political); } else {
	  if (home == "genoa" || home == "venice" || home == "scotland" || home == "hungary" || home == "independent") { his_self.game.state.board[home] = his_self.returnOnBoardUnits(home); }
	}

	html += `
	  <div class="space_name">${obj.name}</div>
	  <div class="space_properties">
	    <div class="religion"><div class="${religion}" style="background-image: url('${his_self.returnReligionImage(religion)}')"></div><div class="label">${religion} religion</div></div>
	    <div class="political"><div class="${political}" style="background-image: url('${his_self.returnControlImage(political)}')"></div><div class="label">${political} control</div></div>
	    <div class="language"><div class="${language}" style="background-image: url('${his_self.returnLanguageImage(language)}')"></div><div class="label">${language} language</div></div>
	    <div class="home"><div class="${home}" style="background-image: url('${his_self.returnControlImage(home)}')"></div><div class="label">${home} home</div></div>
	  </div>
	  <div class="space_units">
	`;

        for (let key in obj.units) {
	  html += his_self.returnArmyTiles(key, obj.key);
	  html += his_self.returnMercenaryTiles(key, obj.key);
	  html += his_self.returnPersonagesTiles(key, obj.key);
	  html += his_self.returnNavalTiles(key, obj.key);
        }

        for (let f in this.units) {
	  if (this.units[f].length > 0) {
            for (let i = 0; i < this.units[f].length; i++) {
	      let b = "";
	      if (this.units[f][i].besieged) { b = ' (besieged)'; }
	      html += `<div class="space_unit">${f} - ${this.units[f][i].type} ${b}</div>`;
	    }
	  }
	}

	html += `</div>`;
	html += `</div>`;

	return html;

      };

    }

    return obj;

  }

