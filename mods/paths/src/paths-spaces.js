
  activateSpaceForCombat(spacekey) {
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

  returnControlOfSpace(key) {
    let space = this.game.spaces[key];
    if (space.control) { return space.control; }
    if (space.units.length > 0) {
      return this.returnPowerOfUnit(space.units[0]);     
    }
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

spaces['london'] = {
    name: "London" ,
    top: 1036 ,
    left: 316 , 
    neighbours: ["cherbourg", "lehavre", "calais"] ,
    terrain : "normal" ,
    vp : false ,
   }

spaces['calais'] = {
    name: "Calais" ,
    top: 1135 ,
    left: 542 ,
    neighbours: ["ostend", "cambrai", "amiens", "london"] ,
    terrain : "swamp" ,
    vp : true ,
   }

spaces['amiens'] = {
    name: "Amiens" ,
    top: 1263 ,
    left: 575 , 
    neighbours: ["calais", "cambrai", "paris", "rouen"] ,
    terrain : "normal" ,
    vp : true ,
   }

spaces['cambrai'] = {
    name: "Cambrai" ,
    top: 1264 ,
    left: 702 ,
    neighbours: ["amiens", "calais", "brussels", "sedan", "chateauthierry"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['sedan'] = {
    name: "Sedan" ,
    top: 1260 ,
    left: 843 , 
    neighbours: ["cambrai", "koblenz", "brussels", "liege", "chateauthierry", "verdun", "metz"] ,
    terrain : "forest" ,
    vp : true , 
   }



spaces['verdun'] = {
    name: "Verdun" ,
    top: 1354 ,
    left: 942 , 
    neighbours: ["sedan", "chateauthierry", "barleduc", "nancy", "metz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['chateauthierry'] = {
    name: "Chateau Thierry" ,
    top: 1405 ,
    left: 780 , 
    neighbours: ["cambrai", "sedan", "paris", "verdun", "barleduc", "melun"] ,
    terrain : "normal" ,
    vp : false , 
   }



spaces['paris'] = {
    name: "Paris" ,
    top: 1420 ,
    left: 621 , 
    neighbours: ["rouen", "amiens", "chateauthierry", "melun", "orleans"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['rouen'] = {
    name: "Rouen" ,
    top: 1380 ,
    left: 480 , 
    neighbours: ["lehavre", "amiens", "paris", "lemans", "caen"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['lehavre'] = {
    name: "Le Havre" ,
    top: 1311 ,
    left: 363 , 
    neighbours: ["rouen", "london"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['cherbourg'] = {
    name: "Cherbourg" ,
    top: 1304 ,
    left: 159 , 
    neighbours: ["caen", "london"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['barleduc'] = {
    name: "Bar le Duc" ,
    top: 1525 ,
    left: 885 , 
    neighbours: ["chateauthierry", "verdun", "nancy", "melun", "dijon"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['caen'] = {
    name: "Caen" ,
    top: 1413 ,
    left: 249 , 
    neighbours: ["cherbourg", "rouen", "lemans"] ,
    terrain : "normal" ,
    vp : false , 
   }


spaces['rennes'] = {
    name: "Rennes" ,
    top: 1533 ,
    left: 171 , 
    neighbours: ["lemans", "nantes"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['lemans'] = {
    name: "Le Mans" ,
    top: 1522 ,
    left: 362 , 
    neighbours: ["caen", "rouen", "rennes", "nantes", "tours", "orleans"] ,
    terrain : "normal" ,
    vp : false , 

   }

spaces['orleans'] = {
    name: "Orleans" ,
    top: 1575 ,
    left: 561 , 
    neighbours: ["lemans", "paris", "meun", "stamand", "tours"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['melun'] = {
    name: "Melun" ,
    top: 1551 ,
    left: 724 , 
    neighbours: ["paris", "chateauthierry", "barleduc", "nevers", "orleans"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['nancy'] = {
    name: "Nancy" ,
    top: 1490 ,
    left: 1011 , 
    neighbours: ["barleduc", "verdun", "metz", "strasbourg", "belfort"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['nantes'] = {
    name: "Nantes" ,
    top: 1663 ,
    left: 157 , 
   }

spaces['tours'] = {
    name: "Tours" ,
    top: 1646 ,
    left: 414 , 
    neighbours: ["lemans", "orleans", "stamand", "poitiers", "nantes"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['larochelle'] = {
    name: "La Rochelle" ,
    top: 1814 ,
    left: 236 , 
    neighbours: ["nantes", "poitiers", "bordeaux"] ,
    terrain : "normal" ,
    vp : false , 
   }



spaces['bordeaux'] = {
    name: "Bordeaux" ,
    top: 1986 ,
    left: 274 , 
    neighbours: ["larochelle"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['poitiers'] = {
    name: "Poitiers" ,
    top: 1790 ,
    left: 405 , 
    neighbours: ["larochelle", "tours"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['stamand'] = {
    name: "St. Amand" ,
    top: 1743 ,
    left: 598 , 
    neighbours: ["tours", "orleans", "nevers"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['nevers'] = {
    name: "Nevers" ,
    top: 1721 ,
    left: 757 , 
    neighbours: ["stamand", "melun", "dijon", "lyon"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['dijon'] = {
    name: "Dijon" ,
    top: 1701 ,
    left: 936 , 
    neighbours: ["nevers", "barleduc", "belfort"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['lyon'] = {
    name: "Lyon" ,
    top: 1883 ,
    left: 869 , 
    neighbours: ["nevers", "avignon", "grenoble"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['avignon'] = {
    name: "Avignon" ,
    top: 2058 ,
    left: 824 , 
    neighbours: ["lyon", "marseilles"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['marseilles'] = {
    name: "Marseilles" ,
    top: 2232 ,
    left: 912 , 
    neighbours: ["avignon", "nice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['nice'] = {
    name: "Nice" ,
    top: 2199 ,
    left: 1077 , 
    neighbours: ["marseilles", "turin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['grenoble'] = {
    name: "Grenoble" ,
    top: 1944 ,
    left: 1009 , 
    neighbours: ["lyon", "turin"] ,
    terrain : "mountain" ,
    vp : false , 
   }








spaces['belfort'] = {
    name: "Belfort" ,
    top: 1635 ,
    left: 1072 , 
    neighbours: ["dijon", "nancy", "mulhouse"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['ostend'] = {
    name: "Ostend" ,
    top: 1048 ,
    left: 663 , 
    neighbours: ["calais", "brussels", "antwerp"] ,
    terrain : "swamp" ,
    vp : true , 
   }

spaces['antwerp'] = {
    name: "Antwerp" ,
    top: 1002 ,
    left: 858 , 
    neighbours: ["ostend", "brussels"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['brussels'] = {
    name: "Brussels" ,
    top: 1132 ,
    left: 788 , 
    neighbours: ["ostend", "antwerp", "liege", "sedan", "cambrai"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['liege'] = {
    name: "Liege" ,
    top: 1144 ,
    left: 951 , 
    neighbours: ["brussels", "aachen", "sedan", "koblenz"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['wilhelmshaven'] = {
    name: "Wilhelmshaven" ,
    top: 690 ,
    left: 1222 , 
    neighbours: ["bremen"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['essen'] = {
    name: "Essen" ,
    top: 991 ,
    left: 1160 , 
    neighbours: ["aachen", "bremen", "kassel"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['aachen'] = {
    name: "Aachen" ,
    top: 1024 ,
    left: 1018 , 
    neighbours: ["liege", "essen", "koblenz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['koblenz'] = {
    name: "Koblenz" ,
    top: 1162 ,
    left: 1101 , 
    neighbours: ["liege", "aachen", "frankfurt", "sedan", "metz"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['metz'] = {
    name: "Metz" ,
    top: 1307 ,
    left: 1107 , 
    neighbours: ["verdun", "sedan", "koblenz", "strasbourg", "nancy"] ,
    terrain : "forest" ,
    vp : true , 
   }


spaces['strasbourg'] = {
    name: "Strasbourg" ,
    top: 1448 ,
    left: 1184 , 
    neighbours: ["nancy", "metz", "mannheim", "mulhouse"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['mulhouse'] = {
    name: "Mulhouse" ,
    top: 1601 ,
    left: 1214 , 
    neighbours: ["belfort", "strasbourg"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['stuttgart'] = {
    name: "Stuttgart" ,
    top: 1429 ,
    left: 1342 , 
    neighbours: ["mannheim", "augsburg"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['mannheim'] = {
    name: "Mannheim" ,
    top: 1322 ,
    left: 1256 , 
    neighbours: ["frankfurt", "strasbourg", "stuttgart"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['frankfurt'] = {
    name: "Frankfurt" ,
    top: 1164 ,
    left: 1252 , 
    neighbours: ["koblenz", "kassel", "mannheim"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['kassel'] = {
    name: "Kassel" ,
    top: 1006 ,
    left: 1352 , 
    neighbours: ["essen", "hannover", "frankfurt", "erfurt"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['bremen'] = {
    name: "Bremen" ,
    top: 828 ,
    left: 1299 , 
    neighbours: ["wilhelmshaven", "essen", "hamburg", "hannover"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['kiel'] = {
    name: "Kiel" ,
    top: 618 ,
    left: 1431 , 
    neighbours: ["hamburg"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['hamburg'] = {
    name: "Hamburg" ,
    top: 759 ,
    left: 1431 , 
    neighbours: ["kiel", "bremen", "rostock"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['hannover'] = {
    name: "Hannover" ,
    top: 922 ,
    left: 1549 , 
    neighbours: ["bremen", "kassel", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['erfurt'] = {
    name: "Erfurt" ,
    top: 1183 ,
    left: 1527 , 
    neighbours: ["kassel", "leipzig", "nuremberg"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['nuremberg'] = {
    name: "Nuremberg" ,
    top: 1329 ,
    left: 1529 , 
    neighbours: ["erfurt", "augsburg", "regensburg"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['augsburg'] = {
    name: "Augsburg" ,
    top: 1456 ,
    left: 1482 , 
    neighbours: ["stuttgart", "nuremberg", "innsbruck", "regensburg"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['munich'] = {
    name: "Munich" ,
    top: 1506 ,
    left: 1607 , 
    neighbours: ["regensburg", "spittal"] ,
    terrain : "mountain" ,
    vp : true , 
   }

spaces['regensburg'] = {
    name: "Regensburg" ,
    top: 1390 ,
    left: 1659 , 
    neighbours: ["nuremberg", "augsburg", "munich", "linz"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['leipzig'] = {
    name: "Leipzig" ,
    top: 1062 ,
    left: 1675 , 
    neighbours: ["berlin", "erfurt", "dresden"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['berlin'] = {
    name: "Berlin" ,
    top: 871 ,
    left: 1761 , 
    neighbours: ["rostock", "stettin", "hannover", "cottbus", "leipzig"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['rostock'] = {
    name: "Rostock" ,
    top: 656 ,
    left: 1638 , 
    neighbours: ["hamburg", "stettin", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['stettin'] = {
    name: "Stettin" ,
    top: 687 ,
    left: 1911 , 
    neighbours: ["rostock", "kolberg", "berlin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['cottbus'] = {
    name: "Cottbus" ,
    top: 974 ,
    left: 1911 , 
    neighbours: ["berlin", "posen", "breslau", "dresden"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['dresden'] = {
    name: "Dresden" ,
    top: 1094 ,
    left: 1806 , 
    neighbours: ["leipzig", "cottbus", "prague"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['breslau'] = {
    name: "Breslau" ,
    top: 1091 ,
    left: 2157 , 
    neighbours: ["cottbus", "posen", "lodz", "oppeln"] ,
    terrain : "normal" ,
    vp : true , 
   }



spaces['oppeln'] = {
    name: "Oppeln" ,
    top: 1146 ,
    left: 2314 , 
    neighbours: ["breslau", "olmutz", "czestochowa", "cracow"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['posen'] = {
    name: "Posen" ,
    top: 904 ,
    left: 2151 , 
    neighbours: ["cottbus", "thorn", "breslau", "lodz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['kolberg'] = {
    name: "Kolberg" ,
    top: 632 ,
    left: 2115 , 
    neighbours: ["stettin", "danzig"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['thorn'] = {
    name: "Thorn" ,
    top: 767 ,
    left: 2248 , 
    neighbours: ["danzig", "tannenberg", "plock", "lodz", "posen"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['danzig'] = {
    name: "Danzig" ,
    top: 609 ,
    left: 2332 , 
    neighbours: ["kolberg", "tannenberg", "thorn"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['konigsberg'] = {
    name: "Konigsberg" ,
    top: 549 ,
    left: 2514 , 
    neighbours: ["insterberg", "tannenberg"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['tannenberg'] = {
    name: "Tannenberg" ,
    top: 717 ,
    left: 2507 , 
    neighbours: ["danzig", "konigsberg", "insterberg", "lomza", "plock", "thorn"] ,
    terrain : "forest" ,
    vp : false , 
   }

spaces['insterberg'] = {
    name: "Insterberg" ,
    top: 636 ,
    left: 2666 , 
    neighbours: ["tannenberg", "konigsberg", "memel", "kovno", "grodno"] ,
    terrain : "forest" ,
    vp : false , 

   }

spaces['memel'] = {
    name: "Memel" ,
    top: 422 ,
    left: 2614 , 
    neighbours: ["libau", "szawli", "insterberg"] ,
    terrain : "normal" ,
    vp : false , 
   }







spaces['mulhouse'] = {
    name: "Mulhouse" ,
    top: 1600 ,
    left: 1214 , 
    neighbours: ["belfort", "strasbourg"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['turin'] = {
    name: "Turin" ,
    top: 1966 ,
    left: 1161 , 
    neighbours: ["grenoble", "nice", "milan", "genoa"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['milan'] = {
    name: "Milan" ,
    top: 1910 ,
    left: 1324 , 
    neighbours: ["turin", "genoa", "verona"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['genoa'] = {
    name: "Genoa" ,
    top: 2068 ,
    left: 1301 , 
    neighbours: ["turin", "milan", "bologna"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['verona'] = {
    name: "Verona" ,
    top: 1915 ,
    left: 1505 , 
    neighbours: ["trent", "milan", "bologna", "venice"] ,
    terrain : "normal" ,
    vp : false , 
   }



spaces['asiago'] = {
    name: "Asiago" ,
    top: 1788 ,
    left: 1619 , 
    neighbours: ["trent", "maggiore", "venice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['maggiore'] = {
    name: "Maggiore" ,
    top: 1764 ,
    left: 1747 , 
    neighbours: ["asiago", "udine", "villach"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['udine'] = {
    name: "Udine" ,
    top: 1883 ,
    left: 1767 , 
   }

spaces['venice'] = {
    name: "Venice" ,
    top: 1937 ,
    left: 1649 , 
    neighbours: ["bologna", "verona", "asiago", "udine", "ravenna"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['bologna'] = {
    name: "Bologna" ,
    top: 2034 ,
    left: 1545 , 
    neighbours: ["genoa", "verona", "venice", "florence"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['florence'] = {
    name: "Florence" ,
    top: 2163 ,
    left: 1536 , 
    neighbours: ["bologna", "ravenna", "viterbo"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['ravenna'] = {
    name: "Ravenna" ,
    top: 2121 ,
    left: 1688 , 
    neighbours: ["venice", "florence", "ancona"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['ancona'] = {
    name: "Ancona" ,
    top: 2243 ,
    left: 1800 , 
    neighbours: ["ravenna", "pescara"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['viterbo'] = {
    name: "Viterbo" ,
    top: 2307 ,
    left: 1626 , 
    neighbours: ["florence", "rome"] ,
    terrain : "normal" ,
    vp : false , 
   }


spaces['rome'] = {
    name: "Rome" ,
    top: 2431 ,
    left: 1680 , 
    neighbours: ["viterbo", "naples"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['pescara'] = {
    name: "Pescara" ,
    top: 2381 ,
    left: 1864 , 
    neighbours: ["ancona", "foggia"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['naples'] = {
    name: "Naples" ,
    top: 2585 ,
    left: 1869 , 
    neighbours: ["rome", "foggia"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['foggia'] = {
    name: "Foggia" ,
    top: 2526 ,
    left: 2031 , 
    neighbours: ["pescara", "naples", "taranto"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['taranto'] = {
    name: "Taranto" ,
    top: 2646 ,
    left: 2179 , 
    neighbours: ["foggia", "valona"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['prague'] = {
    name: "Prague" ,
    top: 1235 ,
    left: 1884 , 
    neighbours: ["dresden", "kolin"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['trent'] = {
    name: "Trent" ,
    top: 1742 ,
    left: 1450 , 
    neighbours: ["verona", "asiago", "innsbruck"] ,
    terrain : "mountain" ,
    vp : true , 
   }

spaces['innsbruck'] = {
    name: "Innsbruck" ,
    top: 1655 ,
    left: 1570 , 
    neighbours: ["trent", "augsburg", "spittal"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['spittal'] = {
    name: "Spittal" ,
    top: 1635 ,
    left: 1725 , 
    neighbours: ["innsbruck", "munich", "villach"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['linz'] = {
    name: "Linz" ,
    top: 1527 ,
    left: 1847 , 
    neighbours: ["regensburg", "vienna", "graz"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['villach'] = {
    name: "Villach" ,
    top: 1723 ,
    left: 1870 , 
    neighbours: ["spittal", "maggiore", "graz", "trieste"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['trieste'] = {
    name: "Trieste" ,
    top: 1890 ,
    left: 1898 , 
    neighbours: ["udine", "villach", "zagreb"] ,
    terrain : "mountain" ,
    vp : true , 
   }

spaces['kolin'] = {
    name: "Kolin" ,
    top: 1308 ,
    left: 2011 , 
    neighbours: ["prague", "brun"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['brun'] = {
    name: "Brun" ,
    top: 1380 ,
    left: 2130 , 
    neighbours: ["kolin", "olmutz", "vienna"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['vienna'] = {
    name: "Vienna" ,
    top: 1517 ,
    left: 2089 , 
    neighbours: ["linz", "brun", "budapest", "graz"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['graz'] = {
    name: "Graz" ,
    top: 1681 ,
    left: 1998 , 
    neighbours: ["linz", "vienna", "zagreb", "villach"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['zagreb'] = {
    name: "Zagreb" ,
    top: 1866 ,
    left: 2052 , 
    neighbours: ["trieste", "graz", "pecs", "banjaluka"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['banjaluka'] = {
    name: "Banja Luka" ,
    top: 2018 ,
    left: 2184 , 
    neighbours: ["zagreb", "sarajevo"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['mostar'] = {
    name: "Mostar" ,
    top: 2233 ,
    left: 2169 , 
    neighbours: ["sarajevo", "cetinje"] ,
    terrain : "mountain" ,
    vp : false , 
   }
spaces['sarajevo'] = {
    name: "Sarajevo" ,
    top: 2137 ,
    left: 2320 , 
    neighbours: ["mostar", "banjaluka", "novisad", "valjevo"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['pecs'] = {
    name: "Pecs" ,
    top: 1833 ,
    left: 2299 , 
    neighbours: ["zagreb", "budapest", "szeged", "novisad"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['olmutz'] = {
    name: "Olmutz" ,
    top: 1275 ,
    left: 2261 , 
    neighbours: ["oppeln", "martin", "brun"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['martin'] = {
    name: "Martin" ,
    top: 1428 ,
    left: 2331 , 
    neighbours: ["olmutz", "cracow", "budapest", "gorlice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['budapest'] = {
    name: "Budapest" ,
    top: 1613 ,
    left: 2392 , 
    neighbours: ["vienna", "martin", "miskolcz", "szeged", "pecs"] ,
    terrain : "normal" ,
    vp : true , 
   }
spaces['szeged'] = {
    name: "Szeged" ,
    top: 1769 ,
    left: 2492 , 
    neighbours: ["pecs", "budapest", "debrecen", "timisvar", "novisad"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['novisad'] = {
    name: "Novi Sad" ,
    top: 1926 ,
    left: 2452 , 
    neighbours: ["pecs", "szeged", "belgrade", "sarajevo"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['timisvar'] = {
    name: "Timisvar" ,
    top: 1878 ,
    left: 2628 , 
    neighbours: ["szeged", "belgrade", "targujiu"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['debrecen'] = {
    name: "Debrecen" ,
    top: 1611 ,
    left: 2666 , 
    neighbours: ["miskolcz", "cluj", "szeged"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['miskolcz'] = {
    name: "Miskolcz" ,
    top: 1496 ,
    left: 2523 , 
    neighbours: ["gorlice", "uzhgorod", "debrecen", "budapest"] ,
    terrain : "normal" ,
    vp : false , 
   }
spaces['cracow'] = {
    name: "Cracow" ,
    top: 1249 ,
    left: 2460 , 
    neighbours: ["oppeln", "czestochowa", "tarnow", "martin"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['tarnow'] = {
    name: "Tarnow" ,
    top: 1251 ,
    left: 2620 , 
    neighbours: ["cracow", "ivangorod", "przemysl", "gorlice"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['gorlice'] = {
    name: "Gorlice" ,
    top: 1374 ,
    left: 2574 , 
    neighbours: ["martin", "tarnow", "uzhgorod", "miskolcz"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['przemysl'] = {
    name: "Przemysl" ,
    top: 1251 ,
    left: 2778 , 
    neighbours: ["tarnow", "lublin", "lemberg", "stanislau", "uzhgorod"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['uzhgorod'] = {
    name: "Uzhgorod" ,
    top: 1463 ,
    left: 2727 , 
    neighbours: ["miskolcz", "gorlice", "przemysl", "stanislau", "munkacs"] ,
    terrain : "mountain" ,
    vp : false , 
   }
spaces['lemberg'] = {
    name: "Lemberg" ,
    top: 1266 ,
    left: 2931 , 
    neighbours: ["przemysl", "lutsk", "tarnopol", "stanislau"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['stanislau'] = {
    name: "Stanislau" ,
    top: 1426 ,
    left: 2897 , 
    neighbours: ["uzhgorod", "przemysl", "lemberg", "tarnopol", "czernowitz", "munkacs"] ,
    terrain : "normal" ,
    vp : false , 
   }

spaces['munkacs'] = {
    name: "Munkacs" ,
    top: 1560 ,
    left: 2886 , 
    neighbours: ["uzhgorod", "stanislau", "czernowitz", "cluj"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['cluj'] = {
    name: "Cluj" ,
    top: 1685 ,
    left: 2854 , 
    neighbours: ["debrecen", "munkacs", "schossburg", "hermannstadt"] ,
    terrain : "normal" ,
    vp : true , 
   }


spaces['hermannstadt'] = {
    name: "Hermannstadt" ,
    top: 1842 ,
    left: 2850 , 
    neighbours: ["cluj", "kornstadt", "cartedearges"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['kronstadt'] = {
    name: "Kronstadt" ,
    top: 1838 ,
    left: 3004 , 
    neighbours: ["hermannstadt", "schossburg", "ploesti"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['schossburg'] = {
    name: "Schossburg" ,
    top: 1710 ,
    left: 3004 , 
    neighbours: ["cluj", "kronstadt"] ,
    terrain : "mountain" ,
    vp : false , 
   }

spaces['czernowitz'] = {
    name: "Czernowitz" ,
    top: 1524 ,
    left: 3048 , 
    neighbours: ["munkacs", "stanislau", "tarnopol", "kamenets-podolski"] ,
    terrain : "normal" ,
    vp : true , 
   }

spaces['tarnopol'] = {
    name: "Tarnopol" ,
    top: 1371 ,
    left: 3049 , 
    neighbours: ["stanislau", "lemberg", "dubno", "kamenets-podolski", "czernowitz"] ,
    terrain : "normal" ,
    vp : false , 
   }


spaces['reval'] = {
      name: "Reval" ,
      top: 81 ,
      left: 3139 ,
      neighbours: ["riga", "petrograd"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['pskov'] = {
      name: "Pskov" ,
      top: 119 ,
      left: 3395 ,
      neighbours: ["opochka", "petrograd"] ,
      terrain : "normal" ,
      vp : false ,
}



spaces['petrograd'] = {
      name: "Petrograd" ,
      top: 82 ,
      left: 3610 ,
      neighbours: ["velikiyeluki", "pskov", "reval"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['riga'] = {
      name: "Riga" ,
      top: 240 ,
      left: 2921 ,
      neighbours: ["dvinsk", "szawli", "reval"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['libau'] = {
      name: "Libau" ,
      top: 284 ,
      left: 2617 ,
      neighbours: ["memel", "szawli"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['szawli'] = {
      name: "Szawli" ,
      top: 360 ,
      left: 2779 ,
      neighbours: ["libau", "riga", "memel", "kovno", "dvinsk"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['dvinsk'] = {
      name: "Dvinsk" ,
      top: 402 ,
      left: 3185 ,
      neighbours: ["szawli", "riga", "vilna", "moldechno", "polotsk", "opochka"] ,
      terrain : "normal" ,
      vp : false ,
}




spaces['opochka'] = {
      name: "Opochka" ,
      top: 301 ,
      left: 3408 ,
      neighbours: ["pskov", "dvinsk", "polotsk", "velikiyeluki"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['velikiyeluki'] = {
      name: "Velikiye Luki" ,
      top: 298 ,
      left: 3592 ,
      neighbours: ["petrograd", "opochka", "vitebsk", "moscow"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['kovno'] = {
      name: "Kovno" ,
      top: 534 ,
      left: 2807 ,
      neighbours: ["szawli", "vilna", "grodno", "insterberg"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['vilna'] = {
      name: "Vilna" ,
      top: 527 ,
      left: 2970 ,
      neighbours: ["kovno", "grodno", "moldechno", "dvinsk"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['moldechno'] = {
      name: "Moldechno" ,
      top: 594 ,
      left: 3143 ,
      neighbours: ["polotsk", "vilna", "dvinsk", "minsk"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['polotsk'] = {
      name: "Polotsk" ,
      top: 517 ,
      left: 3375 ,
      neighbours: ["dvinsk", "opochka", "moldechno", "vitebsk", "orsha"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['vitebsk'] = {
      name: "Vitebsk" ,
      top: 473 ,
      left: 3592 ,
      neighbours: ["velikiyeluki", "smolensk", "polotsk", "orsha"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['grodno'] = {
      name: "Grodno" ,
      top: 683 ,
      left: 2881 ,
      neighbours: ["vilna", "kovno", "insterberg", "baranovichi", "bialystok"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['baranovichi'] = {
      name: "Baranovichi" ,
      top: 737 ,
      left: 3123 ,
      neighbours: ["grodno", "minsk", "slutsk"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['minsk'] = {
      name: "Minsk" ,
      top: 689 ,
      left: 3314 ,
      neighbours: ["orsha", "slutsk", "baranovichi", "moldechno"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['orsha'] = {
      name: "Orsha" ,
      top: 588 ,
      left: 3592 ,
      neighbours: ["minsk", "polotsk", "vitebsk", "smolensk", "mogilev"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['smolensk'] = {
      name: "Smolensk" ,
      top: 563 ,
      left: 3788 ,
      neighbours: ["orsha", "moscow", "vitebsk", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['moscow'] = {
      name: "Moscow" ,
      top: 514 ,
      left: 3946 ,
      neighbours: ["smolensk", "velikiyeluki"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lomza'] = {
      name: "Lomza" ,
      top: 786 ,
      left: 2707 ,
      neighbours: ["tannenberg", "plock", "warsaw", "bialystok"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['bialystok'] = {
      name: "Bialystok" ,
      top: 819 ,
      left: 2942 ,
      neighbours: ["lomza", "grodno", "brestlitovsk"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['pinsk'] = {
      name: "Pinsk" ,
      top: 881 ,
      left: 3073 ,
      neighbours: ["brestlitovsk", "kovel", "sarny"] ,
      terrain : "swamp" ,
      vp : false ,
}

spaces['sarny'] = {
      name: "Sarny" ,
      top: 966 ,
      left: 3218 ,
      neighbours: ["rovno", "kovel", "pinsk"] ,
      terrain : "swamp" ,
      vp : false ,
}




spaces['slutsk'] = {
      name: "Slutsk" ,
      top: 832 ,
      left: 3395 ,
      neighbours: ["baranovichi", "minsk", "mogilev", "mozyr"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['mogilev'] = {
      name: "Mogilev" ,
      top: 702 ,
      left: 3602 ,
      neighbours: ["orsha", "gomel", "slutsk", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['gomel'] = {
      name: "Gomel" ,
      top: 898 ,
      left: 3671 ,
      neighbours: ["chernigov", "mogilev", "roslavl"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['roslavl'] = {
      name: "Roslavl" ,
      top: 761 ,
      left: 3836 ,
      neighbours: ["gomel", "mogilev", "smolensk"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['plock'] = {
      name: "Plock" ,
      top: 845 ,
      left: 2429 ,
      neighbours: ["tannenberg", "warsaw", "lomza", "lodz", "thorn"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lodz'] = {
      name: "Lodz" ,
      top: 979 ,
      left: 2410 ,
      neighbours: ["posen", "warsaw", "breslau", "plock", "thorn", "czestochowa"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['warsaw'] = {
      name: "Warsaw" ,
      top: 918 ,
      left: 2592 ,
      neighbours: ["ivangorod", "lodz", "lomza", "plock", "brestlitovsk"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['brestlitovsk'] = {
      name: "Brest Litovsk" ,
      top: 934 ,
      left: 2828 ,
      neighbours: ["warsaw", "lublin", "kovel", "pinsk", "bialystok"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['kovel'] = {
      name: "Kovel" ,
      top: 1009 ,
      left: 3008 ,
      neighbours: ["lublin", "brestlitovsk", "lutsk", "sarny", "pinsk"] ,
      terrain : "sawmp" ,
      vp : false ,
}

spaces['mozyr'] = {
      name: "Mozyr" ,
      top: 1011 ,
      left: 3475 ,
      neighbours: ["slutsk", "zhitomir"] ,
      terrain : "sawmp" ,
      vp : false ,
}

spaces['chernigov'] = {
      name: "Chernigov" ,
      top: 1051 ,
      left: 3700 ,
      neighbours: ["gomel", "kiev"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['czestochowa'] = {
      name: "Czestochowa" ,
      top: 1124 ,
      left: 2498 ,
      neighbours: ["lodz", "ivangorod", "cracow", "oppeln"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ivangorod'] = {
      name: "Ivangorod" ,
      top: 1102 ,
      left: 2648 ,
      neighbours: ["warsaw", "lublin", "tarnow", "czestochowa"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lublin'] = {
      name: "Lublin" ,
      top: 1098 ,
      left: 2853 ,
      neighbours: ["ivangorod", "brestlitovsk", "kovel", "lutsk", "przemysl"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['lutsk'] = {
      name: "Lutsk" ,
      top: 1144 ,
      left: 3065 ,
      neighbours: ["dubno", "lemberg", "kovel", "lublin", "rovno"] ,
      terrain : "forest" ,
      vp : false ,
}


spaces['rovno'] = {
      name: "Rovno" ,
      top: 1118 ,
      left: 3281 ,
      neighbours: ["dubno", "sarny", "zhitomir", "lutsk"] ,
      terrain : "forest" ,
      vp : false ,
}

spaces['dubno'] = {
      name: "Dubno" ,
      top: 1252 ,
      left: 3189 ,
      neighbours: ["tarnopol", "rovno", "zhitomir", "lutsk", "kamenestspodolski"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['zhitomir'] = {
      name: "Zhitomir" ,
      top: 1182 ,
      left: 3439 ,
      neighbours: ["dubno", "rovno", "mozyr", "kiev", "belayatserkov"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['kiev'] = {
      name: "Kiev" ,
      top: 1188 ,
      left: 3614 ,
      neighbours: ["zhitomir", "chernigov", "kharkov", "belayatserkov"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['kharkov'] = {
      name: "Kharkov" ,
      top: 1183 ,
      left: 3948 ,
      neighbours: ["kievr"] ,
      terrain : "normal" ,
      vp : false ,
}




spaces['kamenestspodolski'] = {
      name: "Kamenets Podolski" ,
      top: 1440 ,
      left: 3196 ,
      neighbours: ["dubno", "tarnopol", "vinnitsa", "zhmerinka", "czernowitz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['vinnitsa'] = {
      name: "Vinnitsa" ,
      top: 1373 ,
      left: 3404 ,
      neighbours: ["uman", "kamenestspodolski", "zhmerinka", "belayatserkov"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['belayatserkov'] = {
      name: "Belaya Tserkov" ,
      top: 1364 ,
      left: 3643 ,
      neighbours: ["uman", "vinnitsa", "kiev", "zhitomir"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['zhmerinka'] = {
      name: "Zhmerinka" ,
      top: 1544 ,
      left: 3329 ,
      neighbours: ["kamenestspodolski", "vinnitsa", "jassy", "kishinev"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['uman'] = {
      name: "Uman" ,
      top: 1546 ,
      left: 3646 ,
      neighbours: ["odessa", "vinnitsa", "belayatserkov", "caucasus"] ,
      terrain : "normal" ,
      vp : false ,
}




spaces['Kishinev'] = {
      name: "Kishinev" ,
      top: 1692 ,
      left: 3444 ,
      neighbours: ["ismail", "barlad", "zhmerinka"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['caucasus'] = {
      name: "Caucasus" ,
      top: 1608 ,
      left: 3947 ,
      neighbours: ["uman", "odessa", "poti", "grozny"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ismail'] = {
      name: "Ismail" ,
      top: 1855 ,
      left: 3469 ,
      neighbours: ["kishinev", "odessa", "galatz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['odessa'] = {
      name: "Odessa" ,
      top: 1756 ,
      left: 3644 ,
      neighbours: ["caucasus", "uman", "ismail"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['poti'] = {
      name: "Poti" ,
      top: 1871 ,
      left: 4377 ,
      neighbours: ["caucasus", "batum"] ,
      terrain : "mountain" ,
      vp : false ,
}




spaces['grozny'] = {
      name: "Grozny" ,
      top: 1882 ,
      left: 4594 ,
      neighbours: ["caucasus", "petrovsk", "tbilisi"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['petrovsk'] = {
      name: "Petrovsk" ,
      top: 1921 ,
      left: 4801 ,
      neighbours: ["grozny", "tbilisi"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['batum'] = {
      name: "Batum" ,
      top: 2038 ,
      left: 4458 ,
      neighbours: ["kars", "poti", "rize"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['kars'] = {
      name: "Kars" ,
      top: 2085 ,
      left: 4560 ,
      neighbours: ["batum", "erzerum", "tbilisi"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['tbilisi'] = {
      name: "Tbilisi" ,
      top: 2035 ,
      left: 4683 ,
      neighbours: ["grozny", "kars", "petrovsk", "erivan", "elizabethpol"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['erivan'] = {
      name: "Erivan" ,
      top: 2166 ,
      left: 4684 ,
      neighbours: ["tbilisi", "dilman", "eleskirt"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['elizabethpol'] = {
      name: "Elizabethpol" ,
      top: 2119 ,
      left: 4797 ,
      neighbours: ["tbilisi", "baku"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['baku'] = {
      name: "Baku" ,
      top: 2202 ,
      left: 4619 ,
      neighbours: ["elizabethpol"] ,
      terrain : "normal" ,
      vp : true ,
}   

spaces['dilman'] = {
      name: "Dilman" ,
      top: 2318 ,
      left: 4681 ,
      neighbours: ["erivan", "van", "tabriz"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['tabriz'] = {
      name: "Tabriz" ,
      top: 2402 ,
      left: 4794 ,
       neighbours: ["dilman", "hamadan"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['hamadan'] = {
      name: "Hamadan" ,
      top: 2561 ,
      left: 4844 ,
      neighbours: ["tabriz", "khorramabad", "kermanshah"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['kermanshah'] = {
      name: "Kermanshah" ,
      top: 2632 ,
      left: 4716 ,
      neighbours: ["hamadan", "khorramabad", "baghdad"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['khorramabad'] = {
      name: "Khorramabad" ,
      top: 2701 ,
      left: 4858 ,
      neighbours: ["hamadan", "kermanshah", "ahwaz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ahwaz'] = {
      name: "Ahwaz" ,
      top: 2848 ,
      left: 4872 ,
      neighbours: ["basra", "qurna", "khorramabad"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['basra'] = {
      name: "Basra" ,
      top: 2989 ,
      left: 4840 ,
      neighbours: ["ahwaz", "qurna"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['constantinople'] = {
      name: "Constantinople" ,
      top: 2108 ,
      left: 3666 ,
      neighbours: ["bursa", "adapazari", "eskidor"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['adapazari'] = {
      name: "Adapazari" ,
      top: 2099 ,
      left: 3791 ,
      neighbours: ["constantinople", "sinope"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['sinope'] = {
      name: "Sinope" ,
      top: 2052 ,
      left: 2899 ,
      neighbours: ["samsun", "adapazari"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['samsun'] = {
      name: "Samsun" ,
      top: 2035 ,
      left: 4005 ,
      neighbours: ["sinope", "giresun", "sivas", "ankara"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['giresun'] = {
      name: "Giresun" ,
      top: 2068 ,
      left: 4105 ,
      neighbours: ["samsun", "trebizond"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['trebizond'] = {
      name: "Trebizond" ,
      top: 2107 ,
      left: 4225 ,
      neighbours: ["giresun", "rize", "erzingan"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['rize'] = {
      name: "Rize" ,
      top: 2100 ,
      left: 4355 ,
      neighbours: ["trebizond", "batum"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['bursa'] = {
      name: "Bursa" ,
      top: 2252 ,
      left: 3674 ,
      neighbours: ["constantinople", "eskidor"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['eskidor'] = {
      name: "Eskidor" ,
      top: 2238 ,
      left: 3790 ,
      neighbours: ["constantinople", "bursa", "ankara", "konya"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['ankara'] = {
      name: "Ankara" ,
      top: 2204 ,
      left: 3906 ,
      neighbours: ["eskidor", "samsun", "sivas"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['sivas'] = {
      name: "Sivas" ,
      top: 2194 ,
      left: 4060 ,
       neighbours: ["ankara", "samsun", "erzingan", "kayseri"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['erzingan'] = {
      name: "Erzingan" ,
      top: 2233 ,
      left: 4231 ,
      neighbours: ["sivas", "trebizond", "erzerum", "kharput"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['erzerum'] = {
      name: "Erzerum" ,
      top: 2211 ,
      left: 4397 ,
      neighbours: ["diyarbakir", "eleskirt", "erzingan", "kars"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['eleskrit'] = {
      name: "Eleskrit" ,
      top: 2223 ,
      left: 4526 ,
      neighbours: ["erzerum", "van", "erivan"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['konya'] = {
      name: "Konya" ,
      top: 2354 ,
      left: 3960 ,
      neighbours: ["eskidor", "adana"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['kayseri'] = {
      name: "Kayseri" ,
      top: 2334 ,
      left: 4091 ,
      neighbours: ["sivas", "adana", "erzingan"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['kharput'] = {
      name: "Kharput" ,
      top: 2346 ,
      left: 4210 ,
      neighbours: ["urfa", "kayseri", "erzingan", "diyarbakir"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['diyarbakir'] = {
      name: "Diyarbakir" ,
      top: 2336 ,
      left: 4323 ,
      neighbours: ["mardin", "bitlis", "kharput", "erzerum"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['bitlis'] = {
      name: "Bitlis" ,
      top: 2343 ,
      left: 4429 ,
      neighbours: ["diyarbakir", "van"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['van'] = {
      name: "Van" ,
      top: 2340 ,
      left: 4544 ,
      neighbours: ["bitlis", "dilman", "eleskirt"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['adana'] = {
      name: "Adana" ,
      top: 2454 ,
      left: 4072 ,
      neighbours: ["konya", "kayseri", "aleppo"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['aleppo'] = {
      name: "Aleppo" ,
      top: 2510 ,
      left: 4196 ,
      neighbours: ["beirut", "urfa", "adana", "damascus"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['urfa'] = {
      name: "Urfa" ,
      top: 2467 ,
      left: 4310 ,
      neighbours: ["mardin", "aleppo", "kharput"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['mardin'] = {
      name: "Mardin" ,
      top: 2467 ,
      left: 4433 ,
      neighbours: ["urfa", "diyarbakir", "mosul"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['mosul'] = {
      name: "Mosul" ,
      top: 2482 ,
      left: 4546 ,
      neighbours: ["mardin", "kirkuk"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['beirut'] = {
      name: "Beirut" ,
      top: 2585 ,
      left: 4091 ,
      neighbours: ["aleppo", "nablus"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['damascus'] = {
      name: "Damascus" ,
      top: 2614 ,
      left: 4213 ,
      neighbours: ["aleppo", "nablus", "amman"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['kirkuk'] = {
      name: "Kirkuk" ,
      top: 2612 ,
      left: 4558 ,
      neighbours: ["mosul", "baghdad"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['nablus'] = {
      name: "Nablus" ,
      top: 2728 ,
      left: 4043 ,
      neighbours: ["beirut", "damascus", "jerusalem", "gaza"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['amman'] = {
      name: "Amman" ,
      top: 2745 ,
      left: 4166 ,
      neighbours: ["arabia", "damascus", "jerusalem"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['baghdad'] = {
      name: "Baghdad" ,
      top: 2736 ,
      left: 4603 ,
      neighbours: ["kirkuk", "samawah", "kut", "kermanshah"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['kut'] = {
      name: "Kut" ,
      top: 2785 ,
      left: 4712 ,
      neighbours: ["baghdad", "qurna"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['gaza'] = {
      name: "Gaza" ,
      top: 2872 ,
      left: 3989 ,
      neighbours: ["nablus", "sinai", "beersheba"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['jerusalem'] = {
      name: "Jerusalem" ,
      top: 2840 ,
      left: 4116 ,
      neighbours: ["nablus", "amman", "beersheba", "arabia"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['samawah'] = {
      name: "Samawah" ,
      top: 2876 ,
      left: 4554 ,
      neighbours: ["baghdad", "annasiriya"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['qurna'] = {
      name: "Qurna" ,
      top: 2883 ,
      left: 4759 ,
      neighbours: ["kut", "ahwaz", "basra", "annasiriya"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['sinai'] = {
      name: "Sinai" ,
      top: 2979 ,
      left: 3897 ,
      neighbours: ["gaza", "beersheba", "portsaid", "cairo"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['beersheba'] = {
      name: "Beersheba" ,
      top: 2967 ,
      left: 4101 ,
      neighbours: ["gaza", "jerusalem", "sinai", "aqaba"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['aqaba'] = {
      name: "Aqaba" ,
      top: 3077 ,
      left: 4016 ,
      neighbours: ["medina", "beersheba", "arabia"] ,
      terrain : "desert" ,
      vp : false ,
}


spaces['arabia'] = {
      name: "Arabia" ,
      top: 2990 ,
      left: 4321 ,
      neighbours: ["medina", "aqaba", "jerusalem", "amman"] ,
      terrain : "desert" ,
      vp : false ,
}

spaces['medina'] = {
      name: "Medina" ,
      top: 3155 ,
      left: 4167 ,
      neighbours: [ "aqaba", "arabia"] ,
      terrain : "desert" ,
      vp : true ,
}

spaces['annasiriya'] = {
      name: "An Nasiriya" ,
      top: 3034 ,
      left: 4673 ,
      neighbours: [ "qurna", "samawah"] ,
      terrain : "desert" ,
      vp : true ,
}

spaces['libya'] = {
      name: "Libya" ,
      top: 2935 ,
      left: 3518 ,
      neighbours: [ "alexandria"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['alexandria'] = {
      name: "Alexandria" ,
      top: 2955 ,
      left: 3661 ,
       neighbours: [ "libya", "cairo", "portsaid"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['portsaid'] = {
      name: "Port Said" ,
      top: 2899 ,
      left: 3777 ,
      neighbours: [ "alexandria", "cairo", "sinai"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['cairo'] = {
      name: "Cairo" ,
      top: 3038 ,
      left: 3789 ,
      neighbours: [ "alexandria", "portsaid", "sinai"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['izmir'] = {
      name: "Izmir" ,
      top: 2954 ,
      left: 3274 ,
      neighbours: [ "balikesir"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['balikesir'] = {
      name: "Balikesir" ,
      top: 2798 ,
      left: 3355 ,
      neighbours: [ "izmir", "bursa", "canakale"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['canakale'] = {
      name: "Cana Kale" ,
      top: 2775 ,
      left: 3194 ,
      neighbours: [ "balikesir"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['bursa'] = {
      name: "Bursa" ,
      top: 2701 ,
      left: 3479 ,
      neighbours: [ "constantinople", "balikesir"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['constantinople'] = {
      name: "Constantinople" ,
      top: 2560 ,
      left: 3474 ,
      neighbours: [ "adrianople", "bursa", "gallipoli"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['gallipoli'] = {
      name: "Gallipoli" ,
      top: 2644 ,
      left: 3177 ,
      neighbours: [ "constantinople", "adrianople"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['adrianople'] = {
      name: "Adrianople" ,
      top: 2514 ,
      left: 3308 ,
      neighbours: [ "constantinople", "burgas", "gallipoli", "philippoli"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['jassy'] = {
      name: "Jassy" ,
      top: 1644 ,
      left: 3183 ,
      neighbours: [ "zhmerinka", "barlad"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['barlad'] = {
      name: "Barlad" ,
      top: 1777 ,
      left: 3222 ,
      neighbours: [ "jassy", "kishinev", "galatz", "ploesti"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['galatz'] = {
      name: "Galatz" ,
      top: 1946 ,
      left: 3308 ,
      neighbours: [ "barlad", "ismail", "constanta", "bucharest"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['ploesti'] = {
      name: "Ploesti" ,
      top: 1921 ,
      left: 3129 ,
      neighbours: [ "barlad", "cartedearges", "kronstadt", "bucharest"] ,
      terrain : "mountain" ,
      vp : true ,
}


spaces['cartedearges'] = {
      name: "Carte de Arges" ,
      top: 1973 ,
      left: 2909 ,
      neighbours: [ "ploesti", "caracal", "targujiu", "hermannstadt"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['targujiu'] = {
      name: "Targu Jiu" ,
      top: 1983 ,
      left: 2760 ,
      neighbours: [ "timisvar", "caracal", "cartedearges"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['caracal'] = {
      name: "Caracal" ,
      top: 2107 ,
      left: 2938 ,
      neighbours: [ "bucharest", "targujiu", "cartedearges", "plevna"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['bucharest'] = {
      name: "Bucharest" ,
      top: 2074 ,
      left: 3154 ,
      neighbours: [ "ploesti", "caracal", "varna", "plevna", "galatz"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['constanta'] = {
      name: "Constanta" ,
      top: 2080 ,
      left: 3385 ,
      neighbours: ["varna", "galatz"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['varna'] = {
      name: "Varna" ,
      top: 2233 ,
      left: 3331 ,
      neighbours: [ "constanta", "bucharest", "burgas", "plevna", "kazanlik"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['plevna'] = {
      name: "Plevna" ,
      top: 2247 ,
      left: 3017 ,
      neighbours: [ "cacaral", "bucharest", "varna", "kazanlik"] ,
      terrain : "normal" ,
      vp : false ,
}


spaces['sofia'] = {
      name: "Sofia" ,
      top: 2290 ,
      left: 2847 ,
      neighbours: [ "nis", "skopje", "strumitsa", "kazanlik"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['kazanlik'] = {
      name: "Kazanlik" ,
      top: 2388 ,
      left: 3102 ,
      neighbours: [ "burgas", "plevna", "varna", "philippoli", "sofia"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['burgas'] = {
      name: "Burgas" ,
      top: 2365 ,
      left: 3302 ,
      neighbours: [ "kazanlik", "varna", "adrianople"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['philippoli'] = {
      name: "Philippoli" ,
      top: 2536 ,
      left: 3072 ,
      neighbours: [ "kazanlik", "kavala", "adrianople", "strumitsa"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['strumitsa'] = {
      name: "Strumitsa" ,
      top: 2445 ,
      left: 2866 ,
      neighbours: [ "philippoli", "sofia", "kavala", "monastir", "salonika"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['belgrade'] = {
      name: "Belgrade" ,
      top: 2050 ,
      left: 2586 ,
      neighbours: [ "timisvar", "nis", "valjevo", "novisad"] ,
      terrain : "normal" ,
      vp : true ,
}

spaces['valjevo'] = {
      name: "Valjevo" ,
      top: 2204 ,
      left: 2499 ,
      neighbours: [ "sarajevo", "nis", "belgrade"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['nis'] = {
      name: "Nis" ,
      top: 2226 ,
      left: 2650 ,
      neighbours: [ "sofia", "valjevo", "belgrade", "skopje"] ,
      terrain : "normal" ,
      vp : false ,
}

spaces['skopje'] = {
      name: "Skopje" ,
      top: 2410 ,
      left: 2653 ,
      neighbours: [ "sofia", "tirana", "monastir", "nis"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['monastir'] = {
      name: "Monastir" ,
      top: 2550 ,
      left: 2660 ,
      neighbours: [ "skopje", "florina", "strumitsa", "salonika"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['centije'] = {
      name: "Centije" ,
      top: 2341 ,
      left: 2365 ,
      neighbours: [ "tirana", "mostar"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['tirana'] = {
      name: "Tirana" ,
      top: 2484 ,
      left: 2468 ,
      neighbours: [ "valona", "centije", "skopje"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['valona'] = {
      name: "Valona" ,
      top: 2659 ,
      left: 2459 ,
      neighbours: [ "tirana", "florina", "taranto"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['florina'] = {
      name: "Florina" ,
      top: 2702 ,
      left: 2659 ,
      neighbours: [ "larisa", "valona", "salonika", "monastir"] ,
      terrain : "mountain" ,
      vp : false ,
}


spaces['salonika'] = {
      name: "Salonika" ,
      top: 2650 ,
      left: 2782 ,
      neighbours: [ "strumitsa", "florina", "kavala", "monastir"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['kavala'] = {
      name: "Kavala" ,
      top: 2584 ,
      left: 2932 ,
      neighbours: [ "philippoli", "strumitsa", "salonika"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['larisa'] = {
      name: "Larisa" ,
      top: 2803 ,
      left: 2754 ,
      neighbours: ["florina", "athens"] ,
      terrain : "mountain" ,
      vp : false ,
}

spaces['athens'] = {
      name: "Athens" ,
      top: 3017 ,
      left: 2888 ,
      neighbours: ["larisa"] ,
      terrain : "normal" ,
      vp : false ,
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


