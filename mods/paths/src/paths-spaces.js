
  returnSpaceName(spacekey) {
    return this.game.spaces[spacekey].name;
  }

  activateSpaceForCombat(spacekey) {
    this.game.spaces[spacekey].activated_for_combat = 1;
    this.displaySpace(spacekey);
  }

  activateSpaceForMovement(spacekey) {
    this.game.spaces[spacekey].activated_for_movement = 1;
    this.displaySpace(spacekey);
  }

  canSpaceFlank(spacekey) {
    if (this.game.spaces[spacekey].units.length == 0) { return 0; }
    let enemy_units = 0;
    let faction = this.returnPowerOfUnit(this.game.spaces[spacekey].units[0]);
console.log("we are " + faction);
console.log("neighs of: " + spacekey);
    for (let z = 0; z < this.game.spaces[spacekey].neighbours.length; z++) {
console.log("looking at: " + this.game.spaces[spacekey].neighbours[z]);
      let n = this.game.spaces[this.game.spaces[spacekey].neighbours[z]];
      if (n.units.length > 0) {
	if (this.returnPowerOfUnit(n.units[0]) != faction) {
console.log("there are enemy units in: " + n.key);
	  enemy_units++;
	}
      }
    }
console.log("found enemy units: " + enemy_units);
    if (enemy_units == 1) { return 1; }
    return 0;
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

  doesSpaceHaveEnemyUnits(faction, spacekey) { return this.doesSpaceContainEnemyUnits(faction, spacekey); }
  doesSpaceContainEnemyUnits(faction, spacekey) {
    if (this.game.spaces[spacekey].control != faction) {
      if (this.game.spaces[spacekey].units.length > 0) { return 1; }
    }
    return 0;
  }
  isSpaceEnemyControlled(faction, spacekey) {
    if (this.game.spaces[spacekey].control != "neutral" && this.game.spaces[spacekey].control != faction) { return 1; }
    return 0;
  }

  returnSpacesConnectedToSpaceForStrategicRedeployment(faction, spacekey) {

    let spaces = [];
    let pending = [spacekey];
    let examined = {};

    while (pending.length > 0) {

      let current = pending.shift();

      //
      // mark space as examined
      //
      examined[current] = true;

      //
      //
      //
      let loop = 0;

      if (!this.isSpaceEnemyControlled(faction, current)) {
        loop = 1;
        if (this.doesSpaceHaveEnemyUnits(faction, current)) {
	  loop = 0;
	}
      }

      if (loop == 1) {

	//
	// this is a possible destination!
	//
        spaces.push(current);

        //
        // add neighbours to pending if...
        //
        for (let n in this.game.spaces[current].neighbours) {
          let s = this.game.spaces[current].neighbours[n];
          if (!examined[s]) {
            if (this.returnControlOfSpace(s) == faction) {
              pending.push(s);
            }
          }
        }
      }
    }

    return spaces;

  }


  checkSupplyStatus(faction, spacekey) {

    this.game.spaces[spacekey].supply = {};

    let pending = [spacekey];
    let examined = {};
    let sources = [];

    if (faction == "cp") { sources = ["essen","breslau","sofia","constantinople"]; }
    if (faction == "ap") { sources = ["london"]; }
    if (faction == "ru") { sources = ["moscow","petrograd","kharkov","caucasus"]; }
    if (faction == "ro") { sources = ["moscow","petrograd","kharkov","caucasus"]; }
    if (faction == "sb") { 
      sources = ["moscow","petrograd","kharkov","caucasus","london"]; 
      if (this.returnControlOfSpace("salonika") == "allies") { sources["sb"].push("salonika"); }
    }

    while (pending.length > 0) {

      let current = pending.shift();

      //
      // if spacekey is a source we have a supply-line
      //
      if (sources.includes(current)) { return 1; }

      //
      // mark space as examined
      //
      examined[current] = true;

      //
      // add neighbours to pending if...
      //
      for (let n in this.game.spaces[current].neighbours) {
        let s = this.game.spaces[current].neighbours[n];
        if (!examined[s]) {
	  if (this.returnControlOfSpace(s) == faction) {
	    pending.push(s); 
	  }

	}
      }
    }

    return 0;
  }


  returnControlOfSpace(key) {
    let space = this.game.spaces[key];
    if (space.control) { return space.control; }
    if (space.units.length > 0) { return this.returnPowerOfUnit(space.units[0]); }
    return "";
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

  returnSpacesWithFilter(filter_func) {
    let spaces = [];
    for (let key in this.game.spaces) {
      if (filter_func(key) == 1) { spaces.push(key); }
    }
    return spaces;
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

  returnSpacesWithinHops(source, limit=0, passthrough_func=null) {

console.log("source: " + source + " - " + limit);

    let paths_self = this;

    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    if (limit == 0) { return [source.key]; }
    let hop = 0;
    let old = [];

    let addHop = function(news, hop) {     

      hop++;
      let newer = [];

      //
      //
      for (let i = 0; i < news.length; i++) {

console.log("examining: " + news[i]);

	let passthrough = true;
	if (passthrough_func != null) { if (!passthrough_func(news[i])) { passthrough = false; } } 

	//
	// don't add anything that isn't passthrough, and don't process any of its
	// neighbours since we cannot route through it.
	//
	if (passthrough) {

console.log("passthrough: " + news[i]);

          for (let z = 0; z < paths_self.game.spaces[news[i]].neighbours.length; z++) {
            let n = paths_self.game.spaces[news[i]].neighbours[z];
            if (!old.includes(n)) {
              if (!news.includes(n)) {
                if (!newer.includes(n)) {
                  if (n !== source.key) {
	            newer.push(n);
	          }
	        }
	      }
	    }
          }

          if (hop != 1) {
console.log("old 1");
	    if (!old.includes(news[i])) {
console.log("old 2");
	      if (news[i] !== source.key) {
console.log("old 3");
	        old.push(news[i]);
	      }
            }
          }
        }

      }


      if (hop < limit) {
console.log("return1 " + JSON.stringify(newer));
	  return addHop(newer, hop);
      } else {
console.log("return2 " + JSON.stringify(old));
	  return old;
      }

    }

console.log("return3 source");
    return addHop([source.key], 0); 

  }

  returnHopsToDestination(source, destination, limit=0) {
    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    try { if (this.game.spaces[destination]) { destination = this.game.spaces[destination]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, limit=0, function(spacekey) {
      if (spacekey === destination.key) { return 1; }
      return 0;  
    });
  }

  returnHopsBetweenSpacesWithFilter(space, limit=0, filter_func) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let paths_self = this;
    let map = {};
    let sources = [];
    let hop = 0;

    let addHop = function(sources, hop) {

      hop++;

      if (hop > limit && limit > 0) { return 0; }      

      let new_neighbours = [];

      for (let i = 0; i < sources.length; i++) {

        if (!map[sources[i]]) {

	  for (let z = 0; z < paths_self.game.spaces[sources[i]].neighbours.length; z++) {
	    let sourcekey = paths_self.game.spaces[sources[i]].neighbours[z];
	    if (!map[sourcekey]) {

	      //
	      // if we have a hit, it's this many hops!
	      //
	      if (filter_func(sourcekey)) { return hop; }

	      //
	      // otherwise queue for next hop
	      //
	      if (!new_neighbours.includes(sourcekey)) { new_neighbours.push(sourcekey); }

	    }
	  }

	  map[sources[i]] = 1;

	}
      }

      if (new_neighbours.length > 0 && hop < limit) {
	return addHop(new_neighbours, hop);
      } else {
	return 0;
      }

    }

    return addHop(space.neighbours, 0);   

  }

  returnSpaces() {

    let spaces = {};

spaces['london'] = {
    name: "London" ,
    control : "allies" ,
    top: 1036 ,
    left: 316 , 
    neighbours: ["cherbourg", "lehavre", "calais"] ,
    terrain : "normal" ,
    vp : false ,
   }

spaces['calais'] = {
    name: "Calais" ,
    control : "allies" ,
    top: 1135 ,
    left: 542 ,
    neighbours: ["ostend", "cambrai", "amiens", "london"] ,
    terrain : "swamp" ,
    vp : true ,
   }

spaces['amiens'] = {
    name: "Amiens" ,
    control : "allies" ,
    top: 1263 ,
    left: 575 , 
    neighbours: ["calais", "cambrai", "paris", "rouen"] ,
    terrain : "normal" ,
    vp : true ,
   }

spaces['cambrai'] = {
    name: "Cambrai" ,
    control : "allies" ,
    top: 1264 ,
    left: 702 ,
    neighbours: ["amiens", "calais", "brussels", "sedan", "chateauthierry"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['sedan'] = {
    name: "Sedan" ,
    control : "allies" ,
    top: 1260 ,
    left: 843 , 
    neighbours: ["cambrai", "koblenz", "brussels", "liege", "chateauthierry", "verdun", "metz"] ,
    terrain : "forest" ,
    vp : true , 
   }



spaces['verdun'] = {
    name: "Verdun" ,
    control : "allies" ,
    top: 1354 ,
    left: 942 , 
    neighbours: ["sedan", "chateauthierry", "barleduc", "nancy", "metz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['chateauthierry'] = {
    name: "Chateau Thierry" ,
    control : "allies" ,
    top: 1405 ,
    left: 780 , 
    neighbours: ["cambrai", "sedan", "paris", "verdun", "barleduc", "melun"] ,
    terrain : "normal" ,
    vp : false , 
   }



spaces['paris'] = {
    name: "Paris" ,
    control : "allies" ,
    top: 1420 ,
    left: 621 , 
    neighbours: ["rouen", "amiens", "chateauthierry", "melun", "orleans"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['rouen'] = {
    name: "Rouen" ,
    control : "allies" ,
    top: 1380 ,
    left: 480 , 
    neighbours: ["lehavre", "amiens", "paris", "lemans", "caen"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['lehavre'] = {
    name: "Le Havre" ,
    control : "allies" ,
    top: 1311 ,
    left: 363 , 
    neighbours: ["rouen", "london"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['cherbourg'] = {
    name: "Cherbourg" ,
    control : "allies" ,
    top: 1304 ,
    left: 159 , 
    neighbours: ["caen", "london"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['barleduc'] = {
    name: "Bar le Duc" ,
    control : "allies" ,
    top: 1525 ,
    left: 885 , 
    neighbours: ["chateauthierry", "verdun", "nancy", "melun", "dijon"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['caen'] = {
    name: "Caen" ,
    control : "allies" ,
    top: 1413 ,
    left: 249 , 
    neighbours: ["cherbourg", "rouen", "lemans"] ,
    terrain : "normal" ,
    vp : false , 
   }


spaces['rennes'] = {
    name: "Rennes" ,
    control : "allies" ,
    top: 1533 ,
    left: 171 , 
    neighbours: ["lemans", "nantes"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['lemans'] = {
    name: "Le Mans" ,
    control : "allies" ,
    top: 1522 ,
    left: 362 , 
    neighbours: ["caen", "rouen", "rennes", "nantes", "tours", "orleans"] ,
    terrain : "normal" ,
    vp : false , 

   }

spaces['orleans'] = {
    name: "Orleans" ,
    control : "allies" ,
    top: 1575 ,
    left: 561 , 
    neighbours: ["lemans", "paris", "melun", "stamand", "tours"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['melun'] = {
    name: "Melun" ,
    control : "allies" ,
    top: 1551 ,
    left: 724 , 
    neighbours: ["paris", "chateauthierry", "barleduc", "nevers", "orleans"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['nancy'] = {
    name: "Nancy" ,
    control : "allies" ,
    neighbours: ["lemans", "paris", "melun", "stamand", "tours"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['melun'] = {
    name: "Melun" ,
    control: "allies" ,
    top: 1551 ,
    left: 724 , 
    neighbours: ["paris", "chateauthierry", "barleduc", "nevers", "orleans"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['nancy'] = {
    name: "Nancy" ,
    control: "allies" ,
    top: 1490 ,
    left: 1011 , 
    neighbours: ["barleduc", "verdun", "metz", "strasbourg", "belfort"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['nantes'] = {
    name: "Nantes" ,
    control: "allies" ,
    top: 1663 ,
    left: 157 , 
    neighbours: ["rennes","lemans","tours","larochelle"] ,
    terrain : "normal" ,
    vp : false ,
   }

spaces['tours'] = {
    name: "Tours" ,
    control: "allies" ,
    top: 1646 ,
    left: 414 , 
    neighbours: ["lemans", "orleans", "stamand", "poitiers", "nantes"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['larochelle'] = {
    name: "La Rochelle" ,
    control: "allies" ,
    top: 1814 ,
    left: 236 , 
    neighbours: ["nantes", "poitiers", "bordeaux"] ,
    terrain : "normal" ,
    vp : false , 
   }



spaces['bordeaux'] = {
    name: "Bordeaux" ,
    control: "allies" ,
    top: 1986 ,
    left: 274 , 
    neighbours: ["larochelle"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['poitiers'] = {
    name: "Poitiers" ,
    control: "allies" ,
    top: 1790 ,
    left: 405 , 
    neighbours: ["larochelle", "tours"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['stamand'] = {
    name: "St. Amand" ,
    control: "allies" ,
    top: 1743 ,
    left: 598 , 
    neighbours: ["tours", "orleans", "nevers"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['nevers'] = {
    name: "Nevers" ,
    control: "allies" ,
    top: 1721 ,
    left: 757 , 
    neighbours: ["stamand", "melun", "dijon", "lyon"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['dijon'] = {
    name: "Dijon" ,
    control: "allies" ,
    top: 1701 ,
    left: 936 , 
    neighbours: ["nevers", "barleduc", "belfort"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['lyon'] = {
    name: "Lyon" ,
    control: "allies" ,
    top: 1883 ,
    left: 869 , 
    neighbours: ["nevers", "avignon", "grenoble"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['avignon'] = {
    name: "Avignon" ,
    control: "allies" ,
    top: 2058 ,
    left: 824 , 
    neighbours: ["lyon", "marseilles"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['marseilles'] = {
    name: "Marseilles" ,
    control: "allies" ,
    top: 2232 ,
    left: 912 , 
    neighbours: ["avignon", "nice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['nice'] = {
    name: "Nice" ,
    control: "allies" ,
    top: 2199 ,
    left: 1077 , 
    neighbours: ["marseilles", "turin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['grenoble'] = {
    name: "Grenoble" ,
    control: "allies" ,
    top: 1944 ,
    left: 1009 , 
    neighbours: ["lyon", "turin"] ,
    terrain : "mountain" ,
    vp : false , 
   }








spaces['belfort'] = {
    name: "Belfort" ,
    control: "allies" ,
    top: 1635 ,
    left: 1072 , 
    neighbours: ["dijon", "nancy", "mulhouse"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['ostend'] = {
    name: "Ostend" ,
    control: "neutral" ,
    top: 1048 ,
    left: 663 , 
    neighbours: ["calais", "brussels", "antwerp"] ,
    terrain : "swamp" ,
    vp : true , 
   }

spaces['antwerp'] = {
    name: "Antwerp" ,
    control: "neutral" ,
    top: 1002 ,
    left: 858 , 
    neighbours: ["ostend", "brussels"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['brussels'] = {
    name: "Brussels" ,
    control: "neutral" ,
    top: 1132 ,
    left: 788 , 
    neighbours: ["ostend", "antwerp", "liege", "sedan", "cambrai"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['liege'] = {
    name: "Liege" ,
    control: "neutral" ,
    top: 1144 ,
    left: 951 , 
    neighbours: ["brussels", "aachen", "sedan", "koblenz"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['wilhelmshaven'] = {
    name: "Wilhelmshaven" ,
    control: "central" ,
    top: 690 ,
    left: 1222 , 
    neighbours: ["bremen"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['essen'] = {
    name: "Essen" ,
    control: "central" ,
    top: 991 ,
    left: 1160 , 
    neighbours: ["aachen", "bremen", "kassel"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['aachen'] = {
    name: "Aachen" ,
    control: "central" ,
    top: 1024 ,
    left: 1018 , 
    neighbours: ["liege", "essen", "koblenz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['koblenz'] = {
    name: "Koblenz" ,
    control: "central" ,
    top: 1162 ,
    left: 1101 , 
    neighbours: ["liege", "aachen", "frankfurt", "sedan", "metz"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['metz'] = {
    name: "Metz" ,
    control: "central" ,
    top: 1307 ,
    left: 1107 , 
    neighbours: ["verdun", "sedan", "koblenz", "strasbourg", "nancy"] ,
    terrain : "forest" ,
    vp : true , 
   }


spaces['strasbourg'] = {
    name: "Strasbourg" ,
    control: "central" ,
    top: 1448 ,
    left: 1184 , 
    neighbours: ["nancy", "metz", "mannheim", "mulhouse"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['mulhouse'] = {
    name: "Mulhouse" ,
    control: "central" ,
    top: 1601 ,
    left: 1214 , 
    neighbours: ["belfort", "strasbourg"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['stuttgart'] = {
    name: "Stuttgart" ,
    control: "central" ,
    top: 1429 ,
    left: 1342 , 
    neighbours: ["mannheim", "augsburg"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['mannheim'] = {
    name: "Mannheim" ,
    control: "central" ,
    top: 1322 ,
    left: 1256 , 
    neighbours: ["frankfurt", "strasbourg", "stuttgart"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['frankfurt'] = {
    name: "Frankfurt" ,
    control: "central" ,
    top: 1164 ,
    left: 1252 , 
    neighbours: ["koblenz", "kassel", "mannheim"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['kassel'] = {
    name: "Kassel" ,
    control: "central" ,
    top: 1006 ,
    left: 1352 , 
    neighbours: ["essen", "hannover", "frankfurt", "erfurt"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['bremen'] = {
    name: "Bremen" ,
    control: "central" ,
    top: 828 ,
    left: 1299 , 
    neighbours: ["wilhelmshaven", "essen", "hamburg", "hannover"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['kiel'] = {
    name: "Kiel" ,
    control: "central" ,
    top: 618 ,
    left: 1431 , 
    neighbours: ["hamburg"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['hamburg'] = {
    name: "Hamburg" ,
    control: "central" ,
    top: 759 ,
    left: 1431 , 
    neighbours: ["kiel", "bremen", "rostock"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['hannover'] = {
    name: "Hannover" ,
    control: "central" ,
    top: 922 ,
    left: 1549 , 
    neighbours: ["bremen", "kassel", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['erfurt'] = {
    name: "Erfurt" ,
    control: "central" ,
    top: 1183 ,
    left: 1527 , 
    neighbours: ["kassel", "leipzig", "nuremberg"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['nuremberg'] = {
    name: "Nuremberg" ,
    control: "central" ,
    top: 1329 ,
    left: 1529 , 
    neighbours: ["erfurt", "augsburg", "regensburg"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['augsburg'] = {
    name: "Augsburg" ,
    control: "central" ,
    top: 1456 ,
    left: 1482 , 
    neighbours: ["stuttgart", "nuremberg", "innsbruck", "regensburg"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['munich'] = {
    name: "Munich" ,
    control: "central" ,
    top: 1506 ,
    left: 1607 , 
    neighbours: ["regensburg", "spittal"] ,
    terrain : "mountain" ,
    vp : true , 
   }

spaces['regensburg'] = {
    name: "Regensburg" ,
    control: "central" ,
    top: 1390 ,
    left: 1659 , 
    neighbours: ["nuremberg", "augsburg", "munich", "linz"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['leipzig'] = {
    name: "Leipzig" ,
    control: "central" ,
    top: 1062 ,
    left: 1675 , 
    neighbours: ["berlin", "erfurt", "dresden"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['berlin'] = {
    name: "Berlin" ,
    control: "central" ,
    top: 871 ,
    left: 1761 , 
    neighbours: ["rostock", "stettin", "hannover", "cottbus", "leipzig"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['rostock'] = {
    name: "Rostock" ,
    control: "central" ,
    top: 656 ,
    left: 1638 , 
    neighbours: ["hamburg", "stettin", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['stettin'] = {
    name: "Stettin" ,
    control: "central" ,
    top: 687 ,
    left: 1911 , 
    neighbours: ["rostock", "kolberg", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['cottbus'] = {
    name: "Cottbus" ,
    control: "central" ,
    top: 974 ,
    left: 1911 , 
    neighbours: ["berlin", "posen", "breslau", "dresden"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['dresden'] = {
    name: "Dresden" ,
    control: "central" ,
    top: 1094 ,
    left: 1806 , 
    neighbours: ["leipzig", "cottbus", "prague"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['breslau'] = {
    name: "Breslau" ,
    control: "central" ,
    top: 1091 ,
    left: 2157 , 
    neighbours: ["cottbus", "posen", "lodz", "oppeln"] ,
    terrain : "normal" ,
    vp : true , 
   }



spaces['oppeln'] = {
    name: "Oppeln" ,
    control: "central" ,
    top: 1146 ,
    left: 2314 , 
    neighbours: ["breslau", "olmutz", "czestochowa", "cracow"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['posen'] = {
    name: "Posen" ,
    control: "central" ,
    top: 904 ,
    left: 2151 , 
    neighbours: ["cottbus", "thorn", "breslau", "lodz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['kolberg'] = {
    name: "Kolberg" ,
    control: "central" ,
    top: 632 ,
    left: 2115 , 
    neighbours: ["stettin", "danzig"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['thorn'] = {
    name: "Thorn" ,
    control: "central" ,
    top: 767 ,
    left: 2248 , 
    neighbours: ["danzig", "tannenberg", "plock", "lodz", "posen"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['danzig'] = {
    name: "Danzig" ,
    control: "central" ,
    top: 609 ,
    left: 2332 , 
    neighbours: ["kolberg", "tannenberg", "thorn"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['konigsberg'] = {
    name: "Konigsberg" ,
    control: "central" ,
    top: 549 ,
    left: 2514 , 
    neighbours: ["insterberg", "tannenberg"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['tannenberg'] = {
    name: "Tannenberg" ,
    control: "central" ,
    top: 717 ,
    left: 2507 , 
    neighbours: ["danzig", "konigsberg", "insterberg", "lomza", "plock", "thorn"] ,
    terrain : "forest" ,
    vp : false , 
   }

spaces['insterberg'] = {
    name: "Insterberg" ,
    control: "central" ,
    top: 636 ,
    left: 2666 , 
    neighbours: ["tannenberg", "konigsberg", "memel", "kovno", "grodno"] ,
    terrain : "forest" ,
    vp : false , 

   }

spaces['memel'] = {
    name: "Memel" ,
    control: "central" ,
    top: 422 ,
    left: 2614 , 
    neighbours: ["libau", "szawli", "insterberg"] ,
    terrain : "normal" ,
    vp : false , 
   }







spaces['mulhouse'] = {
    name: "Mulhouse" ,
    control: "allies" ,
    top: 1600 ,
    left: 1214 , 
    neighbours: ["belfort", "strasbourg"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['turin'] = {
    name: "Turin" ,
    control: "allies" ,
    top: 1966 ,
    left: 1161 , 
    neighbours: ["grenoble", "nice", "milan", "genoa"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['milan'] = {
    name: "Milan" ,
    control: "allies" ,
    top: 1910 ,
    left: 1324 , 
    neighbours: ["turin", "genoa", "verona"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['genoa'] = {
    name: "Genoa" ,
    control: "allies" ,
    top: 2068 ,
    left: 1301 , 
    neighbours: ["turin", "milan", "bologna"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['verona'] = {
    name: "Verona" ,
    control: "allies" ,
    top: 1915 ,
    left: 1505 , 
    neighbours: ["trent", "milan", "bologna", "venice"] ,
    terrain : "normal" ,
    vp : false , 
   }



spaces['asiago'] = {
    name: "Asiago" ,
    control: "allies" ,
    top: 1788 ,
    left: 1619 , 
    neighbours: ["trent", "maggiore", "venice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['maggiore'] = {
    name: "Maggiore" ,
    control: "allies" ,
    top: 1764 ,
    left: 1747 , 
    neighbours: ["asiago", "udine", "villach"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['udine'] = {
    name: "Udine" ,
    control: "allies" ,
    top: 1883 ,
    left: 1767 , 
    neighbours: ["trieste", "venice", "maggiore"] ,
    terrain: "normal" ,
    vp : false ,
   }

spaces['venice'] = {
    name: "Venice" ,
    control: "allies" ,
    top: 1937 ,
    left: 1649 , 
    neighbours: ["bologna", "verona", "asiago", "udine", "ravenna"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['bologna'] = {
    name: "Bologna" ,
    control: "allies" ,
    top: 2034 ,
    left: 1545 , 
    neighbours: ["genoa", "verona", "venice", "florence"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['florence'] = {
    name: "Florence" ,
    control: "allies" ,
    top: 2163 ,
    left: 1536 , 
    neighbours: ["bologna", "ravenna", "viterbo"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['ravenna'] = {
    name: "Ravenna" ,
    control: "allies" ,
    top: 2121 ,
    left: 1688 , 
    neighbours: ["venice", "florence", "ancona"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['ancona'] = {
    name: "Ancona" ,
    control: "allies" ,
    top: 2243 ,
    left: 1800 , 
    neighbours: ["ravenna", "pescara"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['viterbo'] = {
    name: "Viterbo" ,
    control: "allies" ,
    top: 2307 ,
    left: 1626 , 
    neighbours: ["florence", "rome"] ,
    terrain : "normal" ,
    vp : false , 
   }


spaces['rome'] = {
    name: "Rome" ,
    control: "allies" ,
    top: 2431 ,
    left: 1680 , 
    neighbours: ["viterbo", "naples"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['pescara'] = {
    name: "Pescara" ,
    control: "allies" ,
    top: 2381 ,
    left: 1864 , 
    neighbours: ["ancona", "foggia"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['naples'] = {
    name: "Naples" ,
    control: "allies" ,
    top: 2585 ,
    left: 1869 , 
    neighbours: ["rome", "foggia"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['foggia'] = {
    name: "Foggia" ,
    control: "allies" ,
    top: 2526 ,
    left: 2031 , 
    neighbours: ["pescara", "naples", "taranto"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['taranto'] = {
    name: "Taranto" ,
    control: "allies" ,
    top: 2646 ,
    left: 2179 , 
    neighbours: ["foggia", "valona"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['prague'] = {
    name: "Prague" ,
    control: "central" ,
    top: 1235 ,
    left: 1884 , 
    neighbours: ["dresden", "kolin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['trent'] = {
    name: "Trent" ,
    control: "central" ,
    top: 1742 ,
    left: 1450 , 
    neighbours: ["verona", "asiago", "innsbruck"] ,
    terrain : "mountain" ,
    vp : true , 
   }

spaces['innsbruck'] = {
    name: "Innsbruck" ,
    control: "central" ,
    top: 1655 ,
    left: 1570 , 
    neighbours: ["trent", "augsburg", "spittal"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['spittal'] = {
    name: "Spittal" ,
    control: "central" ,
    top: 1635 ,
    left: 1725 , 
    neighbours: ["innsbruck", "munich", "villach"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['linz'] = {
    name: "Linz" ,
    control: "central" ,
    top: 1527 ,
    left: 1847 , 
    neighbours: ["regensburg", "vienna", "graz"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['villach'] = {
    name: "Villach" ,
    control: "central" ,
    top: 1723 ,
    left: 1870 , 
    neighbours: ["spittal", "maggiore", "graz", "trieste"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['trieste'] = {
    name: "Trieste" ,
    control: "central" ,
    top: 1890 ,
    left: 1898 , 
    neighbours: ["udine", "villach", "zagreb"] ,
    terrain : "mountain" ,
    vp : true , 
   }

spaces['kolin'] = {
    name: "Kolin" ,
    control: "central" ,
    top: 1308 ,
    left: 2011 , 
    neighbours: ["prague", "brun"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['brun'] = {
    name: "Brun" ,
    control: "central" ,
    top: 1380 ,
    left: 2130 , 
    neighbours: ["kolin", "olmutz", "vienna"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['vienna'] = {
    name: "Vienna" ,
    control: "central" ,
    top: 1517 ,
    left: 2089 , 
    neighbours: ["linz", "brun", "budapest", "graz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['graz'] = {
    name: "Graz" ,
    control: "central" ,
    top: 1681 ,
    left: 1998 , 
    neighbours: ["linz", "vienna", "zagreb", "villach"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['zagreb'] = {
    name: "Zagreb" ,
    control: "central" ,
    top: 1866 ,
    left: 2052 , 
    neighbours: ["trieste", "graz", "pecs", "banjaluka"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['banjaluka'] = {
    name: "Banja Luka" ,
    control: "central" ,
    top: 2018 ,
    left: 2184 , 
    neighbours: ["zagreb", "sarajevo"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['mostar'] = {
    name: "Mostar" ,
    control: "central" ,
    top: 2233 ,
    left: 2169 , 
    neighbours: ["sarajevo", "cetinje"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['sarajevo'] = {
    name: "Sarajevo" ,
    control: "central" ,
    top: 2137 ,
    left: 2320 , 
    neighbours: ["mostar", "banjaluka", "novisad", "valjevo"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['pecs'] = {
    name: "Pecs" ,
    control: "central" ,
    top: 1833 ,
    left: 2299 , 
    neighbours: ["zagreb", "budapest", "szeged", "novisad"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['olmutz'] = {
    name: "Olmutz" ,
    control: "central" ,
    top: 1275 ,
    left: 2261 , 
    neighbours: ["oppeln", "martin", "brun"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['martin'] = {
    name: "Martin" ,
    control: "central" ,
    top: 1428 ,
    left: 2331 , 
    neighbours: ["olmutz", "cracow", "budapest", "gorlice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['budapest'] = {
    name: "Budapest" ,
    control: "central" ,
    top: 1613 ,
    left: 2392 , 
    neighbours: ["vienna", "martin", "miskolcz", "szeged", "pecs"] ,
    terrain : "normal" ,
    vp : true , 
   }
spaces['szeged'] = {
    name: "Szeged" ,
    control: "central" ,
    top: 1769 ,
    left: 2492 , 
    neighbours: ["pecs", "budapest", "debrecen", "timisvar", "novisad"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['novisad'] = {
    name: "Novi Sad" ,
    control: "central" ,
    top: 1926 ,
    left: 2452 , 
    neighbours: ["pecs", "szeged", "belgrade", "sarajevo"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['timisvar'] = {
    name: "Timisvar" ,
    control: "central" ,
    top: 1878 ,
    left: 2628 , 
    neighbours: ["szeged", "belgrade", "targujiu"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['debrecen'] = {
    name: "Debrecen" ,
    control: "central" ,
    top: 1611 ,
    left: 2666 , 
    neighbours: ["miskolcz", "cluj", "szeged"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['miskolcz'] = {
    name: "Miskolcz" ,
    control: "central" ,
    top: 1496 ,
    left: 2523 , 
    neighbours: ["gorlice", "uzhgorod", "debrecen", "budapest"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['cracow'] = {
    name: "Cracow" ,
    control: "central" ,
    top: 1249 ,
    left: 2460 , 
    neighbours: ["oppeln", "czestochowa", "tarnow", "martin"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['tarnow'] = {
    name: "Tarnow" ,
    control: "central" ,
    top: 1251 ,
    left: 2620 , 
    neighbours: ["cracow", "ivangorod", "przemysl", "gorlice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['gorlice'] = {
    name: "Gorlice" ,
    control: "central" ,
    top: 1374 ,
    left: 2574 , 
    neighbours: ["martin", "tarnow", "uzhgorod", "miskolcz"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['przemysl'] = {
    name: "Przemysl" ,
    control: "central" ,
    top: 1251 ,
    left: 2778 , 
    neighbours: ["tarnow", "lublin", "lemberg", "stanislau", "uzhgorod"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['uzhgorod'] = {
    name: "Uzhgorod" ,
    control: "central" ,
    top: 1463 ,
    left: 2727 , 
    neighbours: ["miskolcz", "gorlice", "przemysl", "stanislau", "munkacs"] ,
    terrain : "mountain" ,
    vp : false , 
   }
spaces['lemberg'] = {
    name: "Lemberg" ,
    control: "central" ,
    top: 1266 ,
    left: 2931 , 
    neighbours: ["przemysl", "lutsk", "tarnopol", "stanislau"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['stanislau'] = {
    name: "Stanislau" ,
    control: "central" ,
    top: 1426 ,
    left: 2897 , 
    neighbours: ["uzhgorod", "przemysl", "lemberg", "tarnopol", "czernowitz", "munkacs"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['munkacs'] = {
    name: "Munkacs" ,
    control: "central" ,
    top: 1560 ,
    left: 2886 , 
    neighbours: ["uzhgorod", "stanislau", "czernowitz", "cluj"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['cluj'] = {
    name: "Cluj" ,
    control: "central" ,
    top: 1685 ,
    left: 2854 , 
    neighbours: ["debrecen", "munkacs", "schossburg", "hermannstadt"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['hermannstadt'] = {
    name: "Hermannstadt" ,
    control: "central" ,
    top: 1842 ,
    left: 2850 , 
    neighbours: ["cluj", "kronstadt", "cartedearges"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['kronstadt'] = {
    name: "Kronstadt" ,
    control: "central" ,
    top: 1838 ,
    left: 3004 , 
    neighbours: ["hermannstadt", "schossburg", "ploesti"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['schossburg'] = {
    name: "Schossburg" ,
    control: "central" ,
    top: 1710 ,
    left: 3004 , 
    neighbours: ["cluj", "kronstadt"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['czernowitz'] = {
    name: "Czernowitz" ,
    control: "central" ,
    top: 1524 ,
    left: 3048 , 
    neighbours: ["munkacs", "stanislau", "tarnopol", "kamenetspodolski"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['tarnopol'] = {
    name: "Tarnopol" ,
    control: "central" ,
    top: 1371 ,
    left: 3049 , 
    neighbours: ["stanislau", "lemberg", "dubno", "kamenetspodolski", "czernowitz"] ,
    terrain : "normal" ,
    vp : false , 
   }


spaces['reval'] = {
      name: "Reval" ,
    control: "allies" ,
      top: 81 ,
      left: 3139 ,
      neighbours: ["riga", "petrograd"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['pskov'] = {
      name: "Pskov" ,
    control: "allies" ,
      top: 119 ,
      left: 3395 ,
      neighbours: ["opochka", "petrograd"] ,
      terrain : "normal" ,
      vp : false ,
}



spaces['petrograd'] = {
      name: "Petrograd" ,
    control: "allies" ,
      top: 82 ,
      left: 3610 ,
      neighbours: ["velikiyeluki", "pskov", "reval"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['riga'] = {
      name: "Riga" ,
    control: "allies" ,
      top: 240 ,
      left: 2921 ,
      neighbours: ["dvinsk", "szawli", "reval"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['libau'] = {
      name: "Libau" ,
    control: "allies" ,
      top: 284 ,
      left: 2617 ,
      neighbours: ["memel", "szawli"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['szawli'] = {
      name: "Szawli" ,
    control: "allies" ,
      top: 360 ,
      left: 2779 ,
      neighbours: ["libau", "riga", "memel", "kovno", "dvinsk"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['dvinsk'] = {
      name: "Dvinsk" ,
    control: "allies" ,
      top: 402 ,
      left: 3185 ,
      neighbours: ["szawli", "riga", "vilna", "moldechno", "polotsk", "opochka"] ,
      terrain : "normal" ,
      vp : false ,
}




spaces['opochka'] = {
      name: "Opochka" ,
    control: "allies" ,
      top: 301 ,
      left: 3408 ,
      neighbours: ["pskov", "dvinsk", "polotsk", "velikiyeluki"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['velikiyeluki'] = {
      name: "Velikiye Luki" ,
    control: "allies" ,
      top: 298 ,
      left: 3592 ,
      neighbours: ["petrograd", "opochka", "vitebsk", "moscow"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['kovno'] = {
      name: "Kovno" ,
    control: "allies" ,
      top: 534 ,
      left: 2807 ,
      neighbours: ["szawli", "vilna", "grodno", "insterberg"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['vilna'] = {
      name: "Vilna" ,
      top: 527 ,
    control: "allies" ,
      left: 2970 ,
      neighbours: ["kovno", "grodno", "moldechno", "dvinsk"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['moldechno'] = {
      name: "Moldechno" ,
    control: "allies" ,
      top: 594 ,
      left: 3143 ,
      neighbours: ["polotsk", "vilna", "dvinsk", "minsk"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['polotsk'] = {
      name: "Polotsk" ,
    control: "allies" ,
      top: 517 ,
      left: 3375 ,
      neighbours: ["dvinsk", "opochka", "moldechno", "vitebsk", "orsha"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['vitebsk'] = {
      name: "Vitebsk" ,
    control: "allies" ,
      top: 473 ,
      left: 3592 ,
      neighbours: ["velikiyeluki", "smolensk", "polotsk", "orsha"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['grodno'] = {
      name: "Grodno" ,
    control: "allies" ,
      top: 683 ,
      left: 2881 ,
      neighbours: ["vilna", "kovno", "insterberg", "baranovichi", "bialystok"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['baranovichi'] = {
      name: "Baranovichi" ,
    control: "allies" ,
      top: 737 ,
      left: 3123 ,
      neighbours: ["grodno", "minsk", "slutsk"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['minsk'] = {
      name: "Minsk" ,
    control: "allies" ,
      top: 689 ,
      left: 3314 ,
      neighbours: ["orsha", "slutsk", "baranovichi", "moldechno"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['orsha'] = {
      name: "Orsha" ,
    control: "allies" ,
      top: 588 ,
      left: 3592 ,
      neighbours: ["minsk", "polotsk", "vitebsk", "smolensk", "mogilev"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['smolensk'] = {
      name: "Smolensk" ,
    control: "allies" ,
      top: 563 ,
      left: 3788 ,
      neighbours: ["orsha", "moscow", "vitebsk", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['moscow'] = {
      name: "Moscow" ,
    control: "allies" ,
      top: 514 ,
      left: 3946 ,
      neighbours: ["smolensk", "velikiyeluki"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lomza'] = {
      name: "Lomza" ,
    control: "allies" ,
      top: 786 ,
      left: 2707 ,
      neighbours: ["tannenberg", "plock", "warsaw", "bialystok"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['bialystok'] = {
      name: "Bialystok" ,
    control: "allies" ,
      top: 819 ,
      left: 2942 ,
      neighbours: ["lomza", "grodno", "brestlitovsk"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['pinsk'] = {
      name: "Pinsk" ,
    control: "allies" ,
      top: 881 ,
      left: 3073 ,
      neighbours: ["brestlitovsk", "kovel", "sarny"] ,
      terrain : "swamp" ,
      vp : false ,
}

spaces['sarny'] = {
      name: "Sarny" ,
    control: "allies" ,
      top: 966 ,
      left: 3218 ,
      neighbours: ["rovno", "kovel", "pinsk"] ,
      terrain : "swamp" ,
      vp : false ,
}




spaces['slutsk'] = {
      name: "Slutsk" ,
    control: "allies" ,
      top: 832 ,
      left: 3395 ,
      neighbours: ["baranovichi", "minsk", "mogilev", "mozyr"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['mogilev'] = {
      name: "Mogilev" ,
    control: "allies" ,
      top: 702 ,
      left: 3602 ,
      neighbours: ["orsha", "gomel", "slutsk", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['gomel'] = {
      name: "Gomel" ,
    control: "allies" ,
      top: 898 ,
      left: 3671 ,
      neighbours: ["chernigov", "mogilev", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['roslavl'] = {
      name: "Roslavl" ,
    control: "allies" ,
      top: 761 ,
      left: 3836 ,
      neighbours: ["gomel", "mogilev", "smolensk"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['plock'] = {
      name: "Plock" ,
    control: "allies" ,
      top: 845 ,
      left: 2429 ,
      neighbours: ["tannenberg", "warsaw", "lomza", "lodz", "thorn"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lodz'] = {
      name: "Lodz" ,
    control: "allies" ,
      top: 979 ,
      left: 2410 ,
      neighbours: ["posen", "warsaw", "breslau", "plock", "thorn", "czestochowa"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['warsaw'] = {
      name: "Warsaw" ,
    control: "allies" ,
      top: 918 ,
      left: 2592 ,
      neighbours: ["ivangorod", "lodz", "lomza", "plock", "brestlitovsk"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['brestlitovsk'] = {
      name: "Brest Litovsk" ,
    control: "allies" ,
      top: 934 ,
      left: 2828 ,
      neighbours: ["warsaw", "lublin", "kovel", "pinsk", "bialystok"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['kovel'] = {
      name: "Kovel" ,
    control: "allies" ,
      top: 1009 ,
      left: 3008 ,
      neighbours: ["lublin", "brestlitovsk", "lutsk", "sarny", "pinsk"] ,
      terrain : "sawmp" ,
      vp : false ,
}

spaces['mozyr'] = {
      name: "Mozyr" ,
    control: "allies" ,
      top: 1011 ,
      left: 3475 ,
      neighbours: ["slutsk", "zhitomir"] ,
      terrain : "sawmp" ,
      vp : false ,
}

spaces['chernigov'] = {
      name: "Chernigov" ,
    control: "allies" ,
      top: 1051 ,
      left: 3700 ,
      neighbours: ["gomel", "kiev"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['czestochowa'] = {
      name: "Czestochowa" ,
    control: "allies" ,
      top: 1124 ,
      left: 2498 ,
      neighbours: ["lodz", "ivangorod", "cracow", "oppeln"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ivangorod'] = {
      name: "Ivangorod" ,
    control: "allies" ,
      top: 1102 ,
      left: 2648 ,
      neighbours: ["warsaw", "lublin", "tarnow", "czestochowa"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lublin'] = {
      name: "Lublin" ,
    control: "allies" ,
      top: 1098 ,
      left: 2853 ,
      neighbours: ["ivangorod", "brestlitovsk", "kovel", "lutsk", "przemysl"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lutsk'] = {
      name: "Lutsk" ,
    control: "allies" ,
      top: 1144 ,
      left: 3065 ,
      neighbours: ["dubno", "lemberg", "kovel", "lublin", "rovno"] ,
      terrain : "forest" ,
      vp : false ,
}


spaces['rovno'] = {
      name: "Rovno" ,
    control: "allies" ,
      top: 1118 ,
      left: 3281 ,
      neighbours: ["dubno", "sarny", "zhitomir", "lutsk"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['dubno'] = {
      name: "Dubno" ,
    control: "allies" ,
      top: 1252 ,
      left: 3189 ,
      neighbours: ["tarnopol", "rovno", "zhitomir", "lutsk", "kamenetspodolski"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['zhitomir'] = {
      name: "Zhitomir" ,
    control: "allies" ,
      top: 1182 ,
      left: 3439 ,
      neighbours: ["dubno", "rovno", "mozyr", "kiev", "belayatserkov"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['kiev'] = {
      name: "Kiev" ,
    control: "allies" ,
      top: 1188 ,
      left: 3614 ,
      neighbours: ["zhitomir", "chernigov", "kharkov", "belayatserkov"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['kharkov'] = {
      name: "Kharkov" ,
    control: "allies" ,
      top: 1183 ,
      left: 3948 ,
      neighbours: ["kiev"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['kamenetspodolski'] = {
      name: "Kamenets Podolski" ,
    control: "allies" ,
      top: 1440 ,
      left: 3196 ,
      neighbours: ["dubno", "tarnopol", "vinnitsa", "zhmerinka", "czernowitz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['vinnitsa'] = {
      name: "Vinnitsa" ,
    control: "allies" ,
      top: 1373 ,
      left: 3404 ,
      neighbours: ["uman", "kamenetspodolski", "zhmerinka", "belayatserkov"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['belayatserkov'] = {
      name: "Belaya Tserkov" ,
    control: "allies" ,
      top: 1364 ,
      left: 3642 ,
      neighbours: ["uman", "vinnitsa", "kiev", "zhitomir"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['zhmerinka'] = {
      name: "Zhmerinka" ,
    control: "allies" ,
      top: 1544 ,
      left: 3329 ,
      neighbours: ["kamenetspodolski", "vinnitsa", "jassy", "kishinev"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['uman'] = {
      name: "Uman" ,
    control: "allies" ,
      top: 1546 ,
      left: 3646 ,
      neighbours: ["odessa", "vinnitsa", "belayatserkov", "caucasus"] ,
      terrain : "normal" ,
      vp : false ,
}




spaces['kishinev'] = {
      name: "Kishinev" ,
    control: "allies" ,
      top: 1692 ,
      left: 3444 ,
      neighbours: ["ismail", "barlad", "zhmerinka"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['caucasus'] = {
      name: "Caucasus" ,
    control: "allies" ,
      top: 1608 ,
      left: 3947 ,
      neighbours: ["uman", "odessa", "poti", "grozny"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ismail'] = {
      name: "Ismail" ,
    control: "allies" ,
      top: 1855 ,
      left: 3469 ,
      neighbours: ["kishinev", "odessa", "galatz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['odessa'] = {
      name: "Odessa" ,
    control: "allies" ,
      top: 1756 ,
      left: 3644 ,
      neighbours: ["caucasus", "uman", "ismail"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['poti'] = {
      name: "Poti" ,
    control: "neutral" ,
      top: 1871 ,
      left: 4377 ,
      neighbours: ["caucasus", "batum"] ,
      terrain : "mountain" ,
      vp : false ,
}




spaces['grozny'] = {
      name: "Grozny" ,
    control: "neutral" ,
      top: 1882 ,
      left: 4594 ,
      neighbours: ["caucasus", "petrovsk", "tbilisi"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['petrovsk'] = {
      name: "Petrovsk" ,
    control: "neutral" ,
      top: 1921 ,
      left: 4801 ,
      neighbours: ["grozny", "tbilisi"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['batum'] = {
      name: "Batum" ,
    control: "neutral" ,
      top: 2038 ,
      left: 4458 ,
      neighbours: ["kars", "poti", "rize"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['kars'] = {
      name: "Kars" ,
    control: "neutral" ,
      top: 2085 ,
      left: 4560 ,
      neighbours: ["batum", "erzerum", "tbilisi"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['tbilisi'] = {
      name: "Tbilisi" ,
    control: "neutral" ,
      top: 2035 ,
      left: 4683 ,
      neighbours: ["grozny", "kars", "petrovsk", "erivan", "elizabethpol"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['erivan'] = {
      name: "Erivan" ,
    control: "neutral" ,
      top: 2166 ,
      left: 4684 ,
      neighbours: ["tbilisi", "dilman", "eleskrit"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['elizabethpol'] = {
      name: "Elizabethpol" ,
    control: "neutral" ,
      top: 2119 ,
      left: 4797 ,
      neighbours: ["tbilisi", "baku"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['baku'] = {
      name: "Baku" ,
    control: "neutral" ,
      top: 2202 ,
      left: 4919 ,
      neighbours: ["elizabethpol"] ,
      terrain : "normal" ,
      vp : true ,
}   

spaces['dilman'] = {
      name: "Dilman" ,
    control: "neutral" ,
      top: 2318 ,
      left: 4681 ,
      neighbours: ["erivan", "van", "tabriz"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['tabriz'] = {
      name: "Tabriz" ,
    control: "neutral" ,
      top: 2402 ,
      left: 4794 ,
       neighbours: ["dilman", "hamadan"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['hamadan'] = {
      name: "Hamadan" ,
    control: "neutral" ,
      top: 2561 ,
      left: 4844 ,
      neighbours: ["tabriz", "khorramabad", "kermanshah"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['kermanshah'] = {
      name: "Kermanshah" ,
    control: "neutral" ,
      top: 2632 ,
      left: 4716 ,
      neighbours: ["hamadan", "khorramabad", "baghdad"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['khorramabad'] = {
      name: "Khorramabad" ,
    control: "neutral" ,
      top: 2701 ,
      left: 4858 ,
      neighbours: ["hamadan", "kermanshah", "ahwaz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ahwaz'] = {
      name: "Ahwaz" ,
    control: "neutral" ,
      top: 2848 ,
      left: 4872 ,
      neighbours: ["basra", "qurna", "khorramabad"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['basra'] = {
      name: "Basra" ,
    control: "neutral" ,
      top: 2989 ,
      left: 4840 ,
      neighbours: ["ahwaz", "qurna"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['adapazari'] = {
      name: "Adapazari" ,
    control: "neutral" ,
      top: 2099 ,
      left: 3791 ,
      neighbours: ["constantinople", "sinope"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['sinope'] = {
      name: "Sinope" ,
    control: "neutral" ,
      top: 2052 ,
      left: 3899 ,
      neighbours: ["samsun", "adapazari"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['samsun'] = {
      name: "Samsun" ,
    control: "neutral" ,
      top: 2035 ,
      left: 4005 ,
      neighbours: ["sinope", "giresun", "sivas", "ankara"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['giresun'] = {
      name: "Giresun" ,
    control: "neutral" ,
      top: 2068 ,
      left: 4105 ,
      neighbours: ["samsun", "trebizond"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['trebizond'] = {
      name: "Trebizond" ,
    control: "neutral" ,
      top: 2107 ,
      left: 4225 ,
      neighbours: ["giresun", "rize", "erzingan"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['rize'] = {
      name: "Rize" ,
    control: "neutral" ,
      top: 2100 ,
      left: 4355 ,
      neighbours: ["trebizond", "batum"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['bursa'] = {
      name: "Bursa" ,
    control: "neutral" ,
      top: 2695 ,
      left: 3470 ,
      neighbours: ["constantinople", "eskidor"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['eskidor'] = {
      name: "Eskidor" ,
    control: "neutral" ,
      top: 2238 ,
      left: 3790 ,
      neighbours: ["constantinople", "bursa", "ankara", "konya"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['ankara'] = {
      name: "Ankara" ,
    control: "neutral" ,
      top: 2204 ,
      left: 3906 ,
      neighbours: ["eskidor", "samsun", "sivas"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['sivas'] = {
      name: "Sivas" ,
    control: "neutral" ,
      top: 2194 ,
      left: 4060 ,
       neighbours: ["ankara", "samsun", "erzingan", "kayseri"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['erzingan'] = {
      name: "Erzingan" ,
    control: "neutral" ,
      top: 2233 ,
      left: 4231 ,
      neighbours: ["sivas", "trebizond", "erzerum", "kharput"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['erzerum'] = {
      name: "Erzerum" ,
    control: "neutral" ,
      top: 2211 ,
      left: 4397 ,
      neighbours: ["diyarbakir", "eleskrit", "erzingan", "kars"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['eleskrit'] = {
      name: "Eleskrit" ,
    control: "neutral" ,
      top: 2223 ,
      left: 4526 ,
      neighbours: ["erzerum", "van", "erivan"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['konya'] = {
      name: "Konya" ,
    control: "neutral" ,
      top: 2354 ,
      left: 3960 ,
      neighbours: ["eskidor", "adana"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['kayseri'] = {
      name: "Kayseri" ,
    control: "neutral" ,
      top: 2334 ,
      left: 4091 ,
      neighbours: ["sivas", "adana", "erzingan"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['kharput'] = {
      name: "Kharput" ,
    control: "neutral" ,
      top: 2346 ,
      left: 4210 ,
      neighbours: ["urfa", "kayseri", "erzingan", "diyarbakir"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['diyarbakir'] = {
      name: "Diyarbakir" ,
    control: "neutral" ,
      top: 2336 ,
      left: 4323 ,
      neighbours: ["mardin", "bitlis", "kharput", "erzerum"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['bitlis'] = {
      name: "Bitlis" ,
    control: "neutral" ,
      top: 2343 ,
      left: 4429 ,
      neighbours: ["diyarbakir", "van"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['van'] = {
      name: "Van" ,
    control: "neutral" ,
      top: 2340 ,
      left: 4544 ,
      neighbours: ["bitlis", "dilman", "eleskrit"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['adana'] = {
      name: "Adana" ,
    control: "neutral" ,
      top: 2454 ,
      left: 4072 ,
      neighbours: ["konya", "kayseri", "aleppo"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['aleppo'] = {
      name: "Aleppo" ,
    control: "neutral" ,
      top: 2510 ,
      left: 4196 ,
      neighbours: ["beirut", "urfa", "adana", "damascus"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['urfa'] = {
      name: "Urfa" ,
    control: "neutral" ,
      top: 2467 ,
      left: 4310 ,
      neighbours: ["mardin", "aleppo", "kharput"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['mardin'] = {
      name: "Mardin" ,
    control: "neutral" ,
      top: 2467 ,
      left: 4433 ,
      neighbours: ["urfa", "diyarbakir", "mosul"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['mosul'] = {
      name: "Mosul" ,
    control: "neutral" ,
      top: 2482 ,
      left: 4546 ,
      neighbours: ["mardin", "kirkuk"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['beirut'] = {
      name: "Beirut" ,
    control: "neutral" ,
      top: 2585 ,
      left: 4091 ,
      neighbours: ["aleppo", "nablus"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['damascus'] = {
      name: "Damascus" ,
    control: "neutral" ,
      top: 2614 ,
      left: 4213 ,
      neighbours: ["aleppo", "nablus", "amman"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['kirkuk'] = {
      name: "Kirkuk" ,
    control: "neutral" ,
      top: 2612 ,
      left: 4558 ,
      neighbours: ["mosul", "baghdad"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['nablus'] = {
      name: "Nablus" ,
    control: "neutral" ,
      top: 2728 ,
      left: 4043 ,
      neighbours: ["beirut", "damascus", "jerusalem", "gaza"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['amman'] = {
      name: "Amman" ,
    control: "neutral" ,
      top: 2745 ,
      left: 4166 ,
      neighbours: ["arabia", "damascus", "jerusalem"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['baghdad'] = {
      name: "Baghdad" ,
    control: "neutral" ,
      top: 2736 ,
      left: 4603 ,
      neighbours: ["kirkuk", "samawah", "kut", "kermanshah"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['kut'] = {
      name: "Kut" ,
    control: "neutral" ,
      top: 2785 ,
      left: 4712 ,
      neighbours: ["baghdad", "qurna"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['gaza'] = {
      name: "Gaza" ,
    control: "neutral" ,
      top: 2872 ,
      left: 3989 ,
      neighbours: ["nablus", "sinai", "beersheba"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['jerusalem'] = {
      name: "Jerusalem" ,
    control: "neutral" ,
      top: 2840 ,
      left: 4116 ,
      neighbours: ["nablus", "amman", "beersheba", "arabia"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['samawah'] = {
      name: "Samawah" ,
    control: "neutral" ,
      top: 2876 ,
      left: 4554 ,
      neighbours: ["baghdad", "annasiriya"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['qurna'] = {
      name: "Qurna" ,
    control: "neutral" ,
      top: 2883 ,
      left: 4759 ,
      neighbours: ["kut", "ahwaz", "basra", "annasiriya"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['sinai'] = {
      name: "Sinai" ,
    control: "neutral" ,
      top: 2979 ,
      left: 3897 ,
      neighbours: ["gaza", "beersheba", "portsaid", "cairo"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['beersheba'] = {
      name: "Beersheba" ,
    control: "neutral" ,
      top: 2967 ,
      left: 4101 ,
      neighbours: ["gaza", "jerusalem", "sinai", "aqaba"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['aqaba'] = {
      name: "Aqaba" ,
    control: "neutral" ,
      top: 3077 ,
      left: 4016 ,
      neighbours: ["medina", "beersheba", "arabia"] ,
      terrain : "desert" ,
      vp : false ,
}


spaces['arabia'] = {
      name: "Arabia" ,
    control: "neutral" ,
      top: 2990 ,
      left: 4321 ,
      neighbours: ["medina", "aqaba", "jerusalem", "amman"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['medina'] = {
      name: "Medina" ,
    control: "neutral" ,
      top: 3155 ,
      left: 4167 ,
      neighbours: [ "aqaba", "arabia"] ,
      terrain : "desert" ,
      vp : true ,
}

spaces['annasiriya'] = {
      name: "An Nasiriya" ,
    control: "neutral" ,
      top: 3034 ,
      left: 4673 ,
      neighbours: [ "qurna", "samawah"] ,
      terrain : "desert" ,
      vp : true ,
}

spaces['libya'] = {
      name: "Libya" ,
    control: "neutral" ,
      top: 2935 ,
      left: 3518 ,
      neighbours: [ "alexandria"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['alexandria'] = {
      name: "Alexandria" ,
    control: "neutral" ,
      top: 2955 ,
      left: 3661 ,
       neighbours: [ "libya", "cairo", "portsaid"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['portsaid'] = {
      name: "Port Said" ,
    control: "neutral" ,
      top: 2899 ,
      left: 3777 ,
      neighbours: [ "alexandria", "cairo", "sinai"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['cairo'] = {
      name: "Cairo" ,
    control: "neutral" ,
      top: 3038 ,
      left: 3789 ,
      neighbours: [ "alexandria", "portsaid", "sinai"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['cetinje'] = {
      name: "Cetinje" ,
    control: "neutral" ,
      top: 2341 ,
      left: 2365 ,
      neighbours: [ "tirana", "mostar"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['tirana'] = {
      name: "Tirana" ,
    control: "neutral" ,
      top: 2484 ,
      left: 2468 ,
      neighbours: [ "valona", "cetinje", "skopje"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['valona'] = {
      name: "Valona" ,
    control: "neutral" ,
      top: 2659 ,
      left: 2459 ,
      neighbours: [ "tirana", "florina", "taranto"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['florina'] = {
      name: "Florina" ,
    control: "neutral" ,
      top: 2702 ,
      left: 2659 ,
      neighbours: [ "larisa", "valona", "salonika", "monastir"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['salonika'] = {
      name: "Salonika" ,
    control: "neutral" ,
      top: 2650 ,
      left: 2782 ,
      neighbours: [ "strumitsa", "florina", "kavala", "monastir"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['kavala'] = {
      name: "Kavala" ,
    control: "neutral" ,
      top: 2584 ,
      left: 2932 ,
      neighbours: [ "philippoli", "strumitsa", "salonika"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['larisa'] = {
      name: "Larisa" ,
    control: "neutral" ,
      top: 2803 ,
      left: 2754 ,
      neighbours: ["florina", "athens"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['athens'] = {
      name: "Athens" ,
    control: "neutral" ,
      top: 3017 ,
      left: 2888 ,
      neighbours: ["larisa"] ,
      terrain : "normal" ,
      vp : false ,
}


















spaces['valjevo'] = {
      name: "Valjevo" ,
    control: "neutral" ,
      top: 2200 ,
      left: 2490 ,
      neighbours: ["sarajevo","belgrade","nis"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['belgrade'] = {
      name: "Belgrade" ,
    control: "neutral" ,
      top: 2040 ,
      left: 2580 ,
      neighbours: ["valjevo","nis","timisvar","novisad"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['nis'] = {
      name: "Nis" ,
    control: "neutral" ,
      top: 2220 ,
      left: 2640 ,
      neighbours: ["belgrade","valjevo","sofia","skopje"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['skopje'] = {
      name: "Skopje" ,
    control: "neutral" ,
      top: 2400 ,
      left: 2645 ,
      neighbours: ["nis","tirana","monastir","sofia"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['sofia'] = {
      name: "Sofia" ,
    control: "neutral" ,
      top: 2280 ,
      left: 2840 ,
      neighbours: ["strumitsa","skopje","nis","kazanlik"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['strumitsa'] = {
      name: "Strumitsa" ,
    control: "neutral" ,
      top: 2440 ,
      left: 2860 ,
      neighbours: ["sofia","monastir","kavala","philippoli"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['philippoli'] = {
      name: "Philippoli" ,
    control: "neutral" ,
      top: 2525 ,
      left: 3065 ,
      neighbours: ["kavala","strumitsa","kazanlik","adrianople"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['kazanlik'] = {
      name: "Kazanlik" ,
    control: "neutral" ,
      top: 2380 ,
      left: 3095 ,
      neighbours: ["sofia","philippoli","burgas","plevna","varna"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['burgas'] = {
      name: "Burgas" ,
    control: "neutral" ,
      top: 2360 ,
      left: 3295 ,
      neighbours: ["adrianople","kazanlik","varna"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['varna'] = {
      name: "Varna" ,
    control: "neutral" ,
      top: 2225 ,
      left: 3322 ,
      neighbours: ["burgas","kazanlik","bucharest","constanta"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['bucharest'] = {
      name: "Bucharest" ,
    control: "neutral" ,
      top: 2065 ,
      left: 3145 ,
      neighbours: ["plevna","varna","galatz","caracal","ploesti"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['constanta'] = {
      name: "Constanta" ,
    control: "neutral" ,
      top: 2070 ,
      left: 3380 ,
      neighbours: ["varna","bucharest","galatz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['plevna'] = {
      name: "Plevna" ,
    control: "neutral" ,
      top: 2240 ,
      left: 3010 ,
      neighbours: ["caracal","kazanlik","bucharest","varna"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['galatz'] = {
      name: "Galatz" ,
    control: "neutral" ,
      top: 1935 ,
      left: 3300 ,
      neighbours: ["constanta","bucharest","ismail","barlad"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['barlad'] = {
      name: "Barlad" ,
    control: "neutral" ,
      top: 1770 ,
      left: 3215 ,
      neighbours: ["jassy","kishinev","galatz","ploesti"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['jassy'] = {
      name: "Jassy" ,
    control: "neutral" ,
      top: 1635 ,
      left: 3175 ,
      neighbours: ["barlad","zhmerinka"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ploesti'] = {
      name: "Ploesti" ,
    control: "neutral" ,
      top: 1915 ,
      left: 3120 ,
      neighbours: ["bucharest","barlad","kronstadt","cartedearges"] ,
      terrain : "mountain" ,
      vp : true ,
}

spaces['caracal'] = {
      name: "Caracal" ,
    control: "neutral" ,
      top: 2098 ,
      left: 2932 ,
      neighbours: ["bucharest","plevna","targujiu","cartedearges"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['cartedearges'] = {
      name: "Carte de Arges" ,
    control: "neutral" ,
      top: 1963 ,
      left: 2902 ,
      neighbours: ["caracal","ploesti","targujiu","hermannstadt"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['targujiu'] = {
      name: "Targu Jiu" ,
    control: "neutral" ,
      top: 1973 ,
      left: 2753 ,
      neighbours: ["ploesti","caracal","timisvar"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['adrianople'] = {
      name: "Adrianople" ,
    control: "neutral" ,
      top: 2505 ,
      left: 3300 ,
      neighbours: ["gallipoli","philippoli","burgas","constantinople"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['gallipoli'] = {
      name: "Gallipoli" ,
    control: "neutral" ,
      top: 2635 ,
      left: 3170 ,
      neighbours: ["adrianople","constantinople"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['constantinople'] = {
      name: "Constantinople" ,
    control: "neutral" ,
      top: 2555 ,
      left: 3465 ,
      neighbours: ["adrianople","gallipoli","bursa","eskidor","adapazari"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['balikesir'] = {
      name: "Balikesir" ,
    control: "neutral" ,
      top: 2788 ,
      left: 3347 ,
      neighbours: ["bursa","canakale","izmir"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['canakale'] = {
      name: "Cana Kale" ,
    control: "neutral" ,
      top: 2767 ,
      left: 3186 ,
      neighbours: ["balikesir"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['izmir'] = {
      name: "Izmir" ,
    control: "neutral" ,
      top:  2945,
      left: 3265,
      neighbours: ["balikesir"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['arbox'] = {
      name: "Allied Reserves" ,
      control: "allies" ,
      top:  2945,
      left: 3265,
      neighbours: [],
      terrain : "normal" ,
      vp : false ,
}

spaces['crbox'] = {
      name: "Central Powers Reserves" ,
      control: "central",
      top:  2945,
      left: 3265,
      neighbours: [],
      terrain : "normal" ,
      vp : false ,
}

    for (let key in spaces) {
      spaces[key].units = [];
      spaces[key].trench = 0;
      if (!spaces[key].control) { spaces[key].control = ""; }
      spaces[key].activated_for_movement = 0;
      spaces[key].activated_for_combat = 0;
      spaces[key].key = key;
      spaces[key].type = "normal";
    }

    return spaces;

  }


