
  activeSpaceForCombat(spacekey) {
    this.game.spaces[spacekey].activated_for_combat = 1;
    this.displaySpace(spacekey);
  }

  activateSpaceForMovement(spacekey) {
    this.game.spaces[spacekey].activated_for_movement = 1;
    this.displaySpace(spacekey);
  }

  addTrench(spacekey, level=0) {
    if (level != 0) {
      this.game.spaces[spacekey].trench = level;
      return;
    }
    if (this.game.spaces[spacekey].trench == 1) {
      this.game.spaces[spacekey].trench = 2;
    }
    if (this.game.spaces[spacekey].trench == 0) {
      this.game.spaces[spacekey].trench = 1;
    }
  }
  removeTrench(spacekey, level=0) {
    if (level != 0) {
      this.game.spaces[spacekey].trench = level;
      return;
    }
    if (this.game.spaces[spacekey].trench == 1) {
      this.game.spaces[spacekey].trench = 0;
    }
    if (this.game.spaces[spacekey].trench == 2) {
      this.game.spaces[spacekey].trench = 1;
    }
  }

  returnActivationCost(key) {

    let space = this.game.spaces[key];
    let units = [];
    for (let i = 0; i < space.units.length; i++) {
      if (!units.includes(space.units[i].ckey)) {
	units.push(space.units[i].ckey);
      }
    }

    if (units.length == 1) { return 1; }
    if (units.length == 2) { return 2; }
    if (units.length == 3) { return 3; }

    return 100;

  }
 

  returnNumberOfSpacesWithFilter(filter_func) {
    let count = 0;
    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) {
        count++;
      }
    }
    return count;
  }

  returnHopsToDestination(source, destination) {
    try { if (this.game.spaces[source]) { destination = this.game.spaces[source]; } } catch (err) {}
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

  returnSpaces() {

    let spaces = {};

    spaces['stirling'] = {
      top: 690,
      left: 1222,
      name: "Stirling",
      neighbours: ["glasgow","edinburgh"],
      type: "town"
    }

    for (let key in spaces) {
      spaces[key].units = [];
      spaces[key].trench = 0;
      if (!spaces[key].control) { spaces[key].control = ""; }
      spaces[key].activated_for_movement = 0;
      spaces[key].activated_for_combat = 0;
    }

    return spaces;

  }


