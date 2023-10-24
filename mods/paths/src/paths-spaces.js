
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
   }

spaces['calais'] = {
    name: "Calais" ,
    top: 1135 ,
    left: 542 , 
   }

spaces['amiens'] = {
    name: "Amiens" ,
    top: 1263 ,
    left: 575 , 
   }

spaces['cambral'] = {
    name: "Cambral" ,
    top: 1264 ,
    left: 702 , 
   }

spaces['sedan'] = {
    name: "Sedan" ,
    top: 1260 ,
    left: 843 , 
   }

spaces['verdun'] = {
    name: "Verdun" ,
    top: 1354 ,
    left: 942 , 
   }

spaces['chateauthierry'] = {
    name: "Chateau Thierry" ,
    top: 1405 ,
    left: 780 , 
   }



spaces['paris'] = {
    name: "Paris" ,
    top: 1420 ,
    left: 621 , 
   }

spaces['rouen'] = {
    name: "Rouen" ,
    top: 1380 ,
    left: 480 , 
   }

spaces['lehavre'] = {
    name: "Le Havre" ,
    top: 1311 ,
    left: 363 , 
   }

spaces['cherbourg'] = {
    name: "Cherbourg" ,
    top: 1304 ,
    left: 159 , 
   }

spaces['barleduc'] = {
    name: "Bar le Duc" ,
    top: 1525 ,
    left: 885 , 
   }

spaces['caen'] = {
    name: "Caen" ,
    top: 1413 ,
    left: 249 , 
   }

spaces['rennes'] = {
    name: "Rennes" ,
    top: 1533 ,
    left: 171 , 
   }



spaces['lemans'] = {
    name: "Le Mans" ,
    top: 1522 ,
    left: 362 , 
   }

spaces['orleans'] = {
    name: "Orleans" ,
    top: 1575 ,
    left: 561 , 
   }

spaces['melun'] = {
    name: "Melun" ,
    top: 1551 ,
    left: 724 , 
   }

spaces['nancy'] = {
    name: "Nancy" ,
    top: 1490 ,
    left: 1011 , 
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
   }

spaces['larochelle'] = {
    name: "La Rochelle" ,
    top: 1814 ,
    left: 236 , 
   }



spaces['bordeaux'] = {
    name: "Bordeaux" ,
    top: 1986 ,
    left: 274 , 
   }

spaces['poitiers'] = {
    name: "Poitiers" ,
    top: 1790 ,
    left: 405 , 
   }

spaces['stamand'] = {
    name: "St. Amand" ,
    top: 1743 ,
    left: 598 , 
   }

spaces['nevers'] = {
    name: "Nevers" ,
    top: 1721 ,
    left: 757 , 
   }

spaces['dijon'] = {
    name: "Dijon" ,
    top: 1701 ,
    left: 936 , 
   }

spaces['lyon'] = {
    name: "Lyon" ,
    top: 1883 ,
    left: 869 , 
   }

spaces['avignon'] = {
    name: "Avignon" ,
    top: 2058 ,
    left: 824 , 
   }



spaces['marseilles'] = {
    name: "Marseilles" ,
    top: 2232 ,
    left: 912 , 
   }

spaces['nice'] = {
    name: "Nice" ,
    top: 2199 ,
    left: 1077 , 
   }

spaces['grenoble'] = {
    name: "Grenoble" ,
    top: 1944 ,
    left: 1009 , 
   }

spaces['belfort'] = {
    name: "Belfort" ,
    top: 1635 ,
    left: 1072 , 
   }

spaces['ostend'] = {
    name: "Ostend" ,
    top: 1048 ,
    left: 663 , 
   }

spaces['antwerp'] = {
    name: "Antwerp" ,
    top: 1002 ,
    left: 858 , 
   }

spaces['brussels'] = {
    name: "Brussels" ,
    top: 1132 ,
    left: 788 , 
   }



spaces['liege'] = {
    name: "Liege" ,
    top: 1144 ,
    left: 951 , 
   }

spaces['wilhelmshaven'] = {
    name: "Wilhelmshaven" ,
    top: 690 ,
    left: 1222 , 
   }

spaces['essen'] = {
    name: "Essen" ,
    top: 991 ,
    left: 1160 , 
   }

spaces['aachen'] = {
    name: "Aachen" ,
    top: 1024 ,
    left: 1018 , 
   }

spaces['koblenz'] = {
    name: "Koblenz" ,
    top: 1162 ,
    left: 1101 , 
   }

spaces['metz'] = {
    name: "Metz" ,
    top: 1307 ,
    left: 1107 , 
   }

spaces['strasbourg'] = {
    name: "Strasbourg" ,
    top: 1448 ,
    left: 1184 , 
   }



spaces['mulhouse'] = {
    name: "Mulhouse" ,
    top: 1601 ,
    left: 1214 , 
   }

spaces['stuttgart'] = {
    name: "Stuttgart" ,
    top: 1429 ,
    left: 1342 , 
   }

spaces['mannheim'] = {
    name: "Mannheim" ,
    top: 1322 ,
    left: 1256 , 
   }

spaces['frankfurt'] = {
    name: "Frankfurt" ,
    top: 1164 ,
    left: 1252 , 
   }

spaces['kassel'] = {
    name: "Kassel" ,
    top: 1006 ,
    left: 1352 , 
   }

spaces['bremen'] = {
    name: "Bremen" ,
    top: 828 ,
    left: 1299 , 
   }

spaces['kiel'] = {
    name: "Kiel" ,
    top: 618 ,
    left: 1431 , 
   }



spaces['hamburg'] = {
    name: "Hamburg" ,
    top: 759 ,
    left: 1431 , 
   }

spaces['hannover'] = {
    name: "Hannover" ,
    top: 922 ,
    left: 1549 , 
   }

spaces['erfurt'] = {
    name: "Erfurt" ,
    top: 1183 ,
    left: 1527 , 
   }

spaces['nuremberg'] = {
    name: "Nuremberg" ,
    top: 1329 ,
    left: 1529 , 
   }

spaces['augsburg'] = {
    name: "Augsburg" ,
    top: 1456 ,
    left: 1482 , 
   }

spaces['munich'] = {
    name: "Munich" ,
    top: 1506 ,
    left: 1607 , 
   }

spaces['regensburg'] = {
    name: "Regensburg" ,
    top: 1390 ,
    left: 1659 , 
   }



spaces['leipzig'] = {
    name: "Leipzig" ,
    top: 1062 ,
    left: 1675 , 
   }

spaces['berlin'] = {
    name: "Berlin" ,
    top: 871 ,
    left: 1761 , 
   }

spaces['rostock'] = {
    name: "Rostock" ,
    top: 656 ,
    left: 1638 , 
   }

spaces['stettin'] = {
    name: "Stettin" ,
    top: 687 ,
    left: 1911 , 
   }

spaces['cottbus'] = {
    name: "Cottbus" ,
    top: 974 ,
    left: 1911 , 
   }

spaces['dresden'] = {
    name: "Dresden" ,
    top: 1094 ,
    left: 1806 , 
   }

spaces['breslau'] = {
    name: "Breslau" ,
    top: 1091 ,
    left: 2157 , 
   }



spaces['oppeln'] = {
    name: "Oppeln" ,
    top: 1146 ,
    left: 2314 , 
   }

spaces['posen'] = {
    name: "Posen" ,
    top: 904 ,
    left: 2151 , 
   }

spaces['kolberg'] = {
    name: "Kolberg" ,
    top: 632 ,
    left: 2115 , 
   }

spaces['thorn'] = {
    name: "Thorn" ,
    top: 767 ,
    left: 2248 , 
   }

spaces['danzig'] = {
    name: "Danzig" ,
    top: 609 ,
    left: 2332 , 
   }

spaces['konigsberg'] = {
    name: "Konigsberg" ,
    top: 549 ,
    left: 2514 , 
   }

spaces['tannenberg'] = {
    name: "Tannenberg" ,
    top: 717 ,
    left: 2507 , 
   }



spaces['insterberg'] = {
    name: "Insterberg" ,
    top: 636 ,
    left: 2666 , 
   }

spaces['memel'] = {
    name: "Memel" ,
    top: 422 ,
    left: 2614 , 
   }

spaces['mulhouse'] = {
    name: "Mulhouse" ,
    top: 1600 ,
    left: 1214 , 
   }

spaces['turin'] = {
    name: "Turin" ,
    top: 1966 ,
    left: 1161 , 
   }

spaces['milan'] = {
    name: "Milan" ,
    top: 1910 ,
    left: 1324 , 
   }

spaces['genoa'] = {
    name: "Genoa" ,
    top: 2068 ,
    left: 1301 , 
   }

spaces['verona'] = {
    name: "Verona" ,
    top: 1915 ,
    left: 1505 , 
   }



spaces['asiago'] = {
    name: "Asiago" ,
    top: 1788 ,
    left: 1619 , 
   }

spaces['maggiore'] = {
    name: "Maggiore" ,
    top: 1764 ,
    left: 1747 , 
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
   }

spaces['bologna'] = {
    name: "Bologna" ,
    top: 2034 ,
    left: 1545 , 
   }

spaces['florence'] = {
    name: "Florence" ,
    top: 2163 ,
    left: 1536 , 
   }

spaces['ravenna'] = {
    name: "Ravenna" ,
    top: 2121 ,
    left: 1688 , 
   }



spaces['ancona'] = {
    name: "Ancona" ,
    top: 2243 ,
    left: 1800 , 
   }

spaces['viterbo'] = {
    name: "Viterbo" ,
    top: 2307 ,
    left: 1626 , 
   }

spaces['rome'] = {
    name: "Rome" ,
    top: 2431 ,
    left: 1680 , 
   }

spaces['pescara'] = {
    name: "Pescara" ,
    top: 2381 ,
    left: 1864 , 
   }

spaces['naples'] = {
    name: "Naples" ,
    top: 2585 ,
    left: 1869 , 
   }

spaces['foggia'] = {
    name: "Foggia" ,
    top: 2526 ,
    left: 2031 , 
   }

spaces['taranto'] = {
    name: "Taranto" ,
    top: 2646 ,
    left: 2179 , 
   }



spaces['prague'] = {
    name: "Prague" ,
    top: 1235 ,
    left: 1884 , 
   }

spaces['trent'] = {
    name: "Trent" ,
    top: 1742 ,
    left: 1450 , 
   }

spaces['innsbruck'] = {
    name: "Innsbruck" ,
    top: 1655 ,
    left: 1570 , 
   }

spaces['spittal'] = {
    name: "Spittal" ,
    top: 1635 ,
    left: 1725 , 
   }

spaces['linz'] = {
    name: "Linz" ,
    top: 1527 ,
    left: 1847 , 
   }

spaces['villach'] = {
    name: "Villach" ,
    top: 1723 ,
    left: 1870 , 
   }

spaces['trieste'] = {
    name: "Trieste" ,
    top: 1890 ,
    left: 1898 , 
   }



spaces['kolin'] = {
    name: "Kolin" ,
    top: 1308 ,
    left: 2011 , 
   }

spaces['brun'] = {
    name: "Brun" ,
    top: 1380 ,
    left: 2130 , 
   }

spaces['vienna'] = {
    name: "Vienna" ,
    top: 1517 ,
    left: 2089 , 
   }

spaces['graz'] = {
    name: "Graz" ,
    top: 1681 ,
    left: 1998 , 
   }

spaces['zagreb'] = {
    name: "Zagreb" ,
    top: 1866 ,
    left: 2052 , 
   }

spaces['banjaluka'] = {
    name: "Banja Luka" ,
    top: 2018 ,
    left: 2184 , 
   }

spaces['mostar'] = {
    name: "Mostar" ,
    top: 2233 ,
    left: 2169 , 
   }



spaces['sarajevo'] = {
    name: "Sarajevo" ,
    top: 2137 ,
    left: 2320 , 
   }

spaces['pecs'] = {
    name: "Pecs" ,
    top: 1833 ,
    left: 2299 , 
   }

spaces['olmutz'] = {
    name: "Olmutz" ,
    top: 1275 ,
    left: 2261 , 
   }

spaces['martin'] = {
    name: "Martin" ,
    top: 1428 ,
    left: 2331 , 
   }

spaces['budapest'] = {
    name: "Budapest" ,
    top: 1613 ,
    left: 2392 , 
   }

spaces['szeged'] = {
    name: "Szeged" ,
    top: 1769 ,
    left: 2492 , 
   }

spaces['novisad'] = {
    name: "Novi Sad" ,
    top: 1926 ,
    left: 2452 , 
   }



spaces['timisvar'] = {
    name: "Timisvar" ,
    top: 1878 ,
    left: 2628 , 
   }

spaces['debrecen'] = {
    name: "Debrecen" ,
    top: 1611 ,
    left: 2666 , 
   }

spaces['miskolcz'] = {
    name: "Miskolcz" ,
    top: 1496 ,
    left: 2523 , 
   }

spaces['cracow'] = {
    name: "Cracow" ,
    top: 1249 ,
    left: 2460 , 
   }

spaces['tarnow'] = {
    name: "Tarnow" ,
    top: 1251 ,
    left: 2620 , 
   }

spaces['gorlice'] = {
    name: "Gorlice" ,
    top: 1374 ,
    left: 2574 , 
   }

spaces['przemysl'] = {
    name: "Przemysl" ,
    top: 1251 ,
    left: 2778 , 
   }



spaces['uzhgorod'] = {
    name: "Uzhgorod" ,
    top: 1463 ,
    left: 2727 , 
   }

spaces['lemberg'] = {
    name: "Lemberg" ,
    top: 1266 ,
    left: 2931 , 
   }

spaces['stanislau'] = {
    name: "Stanislau" ,
    top: 1426 ,
    left: 2897 , 
   }

spaces['munkacs'] = {
    name: "Munkacs" ,
    top: 1560 ,
    left: 2886 , 
   }

spaces['cluj'] = {
    name: "Cluj" ,
    top: 1685 ,
    left: 2854 , 
   }

spaces['hermannstadt'] = {
    name: "Hermannstadt" ,
    top: 1842 ,
    left: 2850 , 
   }

spaces['kronstadt'] = {
    name: "Kronstadt" ,
    top: 1838 ,
    left: 3004 , 
   }



spaces['schossburg'] = {
    name: "Schossburg" ,
    top: 1710 ,
    left: 3004 , 
   }

spaces['czernowitz'] = {
    name: "Czernowitz" ,
    top: 1524 ,
    left: 3048 , 
   }

spaces['tarnopol'] = {
    name: "Tarnopol" ,
    top: 1371 ,
    left: 3049 , 
   }



spaces['reval'] = {
      name: "Reval" ,
      top: 81 ,
      left: 3139 ,
    }

spaces['pskov'] = {
      name: "Pskov" ,
      top: 119 ,
      left: 3395 ,
    }

spaces['petrograd'] = {
      name: "Petrograd" ,
      top: 82 ,
      left: 3610 ,
    }

spaces['riga'] = {
      name: "Riga" ,
      top: 240 ,
      left: 2921 ,
    }

spaces['libau'] = {
      name: "Libau" ,
      top: 284 ,
      left: 2617 ,
    }


spaces['szawli'] = {
      name: "Szawli" ,
      top: 360 ,
      left: 2779 ,
    }


spaces['dvinsk'] = {
      name: "Dvinsk" ,
      top: 402 ,
      left: 3185 ,
    }




spaces['opochka'] = {
      name: "Opochka" ,
      top: 301 ,
      left: 3408 ,
    }


spaces['velikiyeluki'] = {
      name: "Velikiye Luki" ,
      top: 298 ,
      left: 3592 ,
    }

spaces['kovno'] = {
      name: "Kovno" ,
      top: 534 ,
      left: 2807 ,
    }



spaces['vilna'] = {
      name: "Vilna" ,
      top: 527 ,
      left: 2970 ,
    }

spaces['moldechno'] = {
      name: "Moldechno" ,
      top: 594 ,
      left: 3143 ,
    }

spaces['polotsk'] = {
      name: "Polotsk" ,
      top: 517 ,
      left: 3375 ,
    }

spaces['vitebsk'] = {
      name: "Vitebsk" ,
      top: 473 ,
      left: 3592 ,
    }

spaces['grodno'] = {
      name: "Grodno" ,
      top: 683 ,
      left: 2881 ,
    }

spaces['baranovichi'] = {
      name: "Baranovichi" ,
      top: 737 ,
      left: 3123 ,
    }

spaces['minsk'] = {
      name: "Minsk" ,
      top: 689 ,
      left: 3314 ,
    }

spaces['orsha'] = {
      name: "Orsha" ,
      top: 588 ,
      left: 3592 ,
    }

spaces['smolensk'] = {
      name: "Smolensk" ,
      top: 563 ,
      left: 3788 ,
    }

spaces['moscow'] = {
      name: "Moscow" ,
      top: 514 ,
      left: 3946 ,
    }

spaces['lomza'] = {
      name: "Lomza" ,
      top: 786 ,
      left: 2707 ,
    }

spaces['bialystok'] = {
      name: "Bialystok" ,
      top: 819 ,
      left: 2942 ,
    }

spaces['pinsk'] = {
      name: "Pinsk" ,
      top: 881 ,
      left: 3073 ,
    }

spaces['sarny'] = {
      name: "Sarny" ,
      top: 966 ,
      left: 3218 ,
    }

spaces['slutsk'] = {
      name: "Slutsk" ,
      top: 832 ,
      left: 3395 ,
    }

spaces['mogilev'] = {
      name: "Mogilev" ,
      top: 702 ,
      left: 3602 ,
    }

spaces['gomel'] = {
      name: "Gomel" ,
      top: 898 ,
      left: 3671 ,
    }

spaces['roslavl'] = {
      name: "Roslavl" ,
      top: 761 ,
      left: 3836 ,
    }

spaces['plock'] = {
      name: "Plock" ,
      top: 845 ,
      left: 2429 ,
    }

spaces['lodz'] = {
      name: "Lodz" ,
      top: 979 ,
      left: 2410 ,
    }

spaces['warsaw'] = {
      name: "Warsaw" ,
      top: 918 ,
      left: 2592 ,
    }

spaces['brestlitovsk'] = {
      name: "Brest Litovsk" ,
      top: 934 ,
      left: 2828 ,
    }

spaces['kovel'] = {
      name: "Kovel" ,
      top: 1009 ,
      left: 3008 ,
    }

spaces['mozyr'] = {
      name: "Mozyr" ,
      top: 1011 ,
      left: 3475 ,
    }

spaces['chernigov'] = {
      name: "Chernigov" ,
      top: 1051 ,
      left: 3700 ,
    }

spaces['czestochowa'] = {
      name: "Czestochowa" ,
      top: 1124 ,
      left: 2498 ,
    }

spaces['ivangorod'] = {
      name: "Ivangorod" ,
      top: 1102 ,
      left: 2648 ,
    }

spaces['lublin'] = {
      name: "Lublin" ,
      top: 1098 ,
      left: 2853 ,
    }

spaces['lutsk'] = {
      name: "Lutsk" ,
      top: 1144 ,
      left: 3065 ,
    }



spaces['rovno'] = {
      name: "Rovno" ,
      top: 1118 ,
      left: 3281 ,
    }

spaces['dubno'] = {
      name: "Dubno" ,
      top: 1252 ,
      left: 3189 ,
    }

spaces['zhitomir'] = {
      name: "Zhitomir" ,
      top: 1182 ,
      left: 3439 ,
    }

spaces['kiev'] = {
      name: "Kiev" ,
      top: 1188 ,
      left: 3614 ,
    }

spaces['kharkov'] = {
      name: "Kharkov" ,
      top: 1183 ,
      left: 3948 ,
    }

spaces['kamenetspodolski'] = {
      name: "Kamenets Podolski" ,
      top: 1440 ,
      left: 3196 ,
    }

spaces['vinnitsa'] = {
      name: "Vinnitsa" ,
      top: 1373 ,
      left: 3404 ,
    }



spaces['belayatserkov'] = {
      name: "Belaya Tserkov" ,
      top: 1364 ,
      left: 3643 ,
    }

spaces['zhmerinka'] = {
      name: "Zhmerinka" ,
      top: 1544 ,
      left: 3329 ,
    }

spaces['uman'] = {
      name: "Uman" ,
      top: 1546 ,
      left: 3646 ,
    }

spaces['Kishinev'] = {
      name: "Kishinev" ,
      top: 1692 ,
      left: 3444 ,
    }

spaces['caucasus'] = {
      name: "Caucasus" ,
      top: 1608 ,
      left: 3947 ,
    }

spaces['ismail'] = {
      name: "Ismail" ,
      top: 1855 ,
      left: 3469 ,
    }

spaces['odessa'] = {
      name: "Odessa" ,
      top: 1756 ,
      left: 3644 ,
    }



spaces['poti'] = {
      name: "Poti" ,
      top: 1871 ,
      left: 4377 ,
    }


spaces['grozny'] = {
      name: "Grozny" ,
      top: 1882 ,
      left: 4594 ,
    }

spaces['petrovsk'] = {
      name: "Petrovsk" ,
      top: 1921 ,
      left: 4801 ,
    }

spaces['batum'] = {
      name: "Batum" ,
      top: 2038 ,
      left: 4458 ,
    }

spaces['kars'] = {
      name: "Kars" ,
      top: 2085 ,
      left: 4560 ,
    }

spaces['tbilisi'] = {
      name: "Tbilisi" ,
      top: 2035 ,
      left: 4683 ,
    }

spaces['erivan'] = {
      name: "Erivan" ,
      top: 2166 ,
      left: 4684 ,
    }


spaces['elizabethpol'] = {
      name: "Elizabethpol" ,
      top: 2119 ,
      left: 4797 ,
    }

spaces['baku'] = {
      name: "Baku" ,
      top: 2202 ,
      left: 4619 ,
    }

spaces['dilman'] = {
      name: "Dilman" ,
      top: 2318 ,
      left: 4681 ,
    }

spaces['tabriz'] = {
      name: "Tabriz" ,
      top: 2402 ,
      left: 4794 ,
    }

spaces['hamadan'] = {
      name: "Hamadan" ,
      top: 2561 ,
      left: 4844 ,
    }

spaces['kermanshah'] = {
      name: "Kermanshah" ,
      top: 2632 ,
      left: 4716 ,
    }

spaces['khorramabad'] = {
      name: "Khorramabad" ,
      top: 2701 ,
      left: 4858 ,
    }




spaces['ahwaz'] = {
      name: "Ahwaz" ,
      top: 2848 ,
      left: 4872 ,
    }

spaces['basra'] = {
      name: "Basra" ,
      top: 2989 ,
      left: 4840 ,
    }

spaces['constantinople'] = {
      name: "Constantinople" ,
      top: 2108 ,
      left: 3666 ,
    }

spaces['adapazari'] = {
      name: "Adapazari" ,
      top: 2099 ,
      left: 3791 ,
    }

spaces['sinope'] = {
      name: "Sinope" ,
      top: 2052 ,
      left: 2899 ,
    }

spaces['samsun'] = {
      name: "Samsun" ,
      top: 2035 ,
      left: 4005 ,
    }


spaces['giresun'] = {
      name: "Giresun" ,
      top: 2068 ,
      left: 4105 ,
    }


spaces['trebizond'] = {
      name: "Trebizond" ,
      top: 2107 ,
      left: 4225 ,
    }


spaces['rize'] = {
      name: "Rize" ,
      top: 2100 ,
      left: 4355 ,
    }


spaces['bursa'] = {
      name: "Bursa" ,
      top: 2252 ,
      left: 3674 ,
    }


spaces['eskidor'] = {
      name: "Eskidor" ,
      top: 2238 ,
      left: 3790 ,
    }


spaces['ankara'] = {
      name: "Ankara" ,
      top: 2204 ,
      left: 3906 ,
    }


spaces['sivas'] = {
      name: "Sivas" ,
      top: 2194 ,
      left: 4060 ,
    }




spaces['erzingan'] = {
      name: "Erzingan" ,
      top: 2233 ,
      left: 4231 ,
    }


spaces['erzerum'] = {
      name: "Erzerum" ,
      top: 2211 ,
      left: 4397 ,
    }


spaces['eleskrit'] = {
      name: "Eleskrit" ,
      top: 2223 ,
      left: 4526 ,
    }


spaces['konya'] = {
      name: "Konya" ,
      top: 2354 ,
      left: 3960 ,
    }


spaces['kayseri'] = {
      name: "Kayseri" ,
      top: 2334 ,
      left: 4091 ,
    }


spaces['kharput'] = {
      name: "Kharput" ,
      top: 2346 ,
      left: 4210 ,
    }




spaces['diyarbakir'] = {
      name: "Diyarbakir" ,
      top: 2336 ,
      left: 4323 ,
    }


spaces['bitlis'] = {
      name: "Bitlis" ,
      top: 2343 ,
      left: 4429 ,
    }


spaces['van'] = {
      name: "Van" ,
      top: 2340 ,
      left: 4544 ,
    }


spaces['adana'] = {
      name: "Adana" ,
      top: 2454 ,
      left: 4072 ,
    }


spaces['aleppo'] = {
      name: "Aleppo" ,
      top: 2510 ,
      left: 4196 ,
    }
spaces['urfa'] = {
      name: "Urfa" ,
      top: 2467 ,
      left: 4310 ,
    }

spaces['mardin'] = {
      name: "Mardin" ,
      top: 2467 ,
      left: 4433 ,
    }

spaces['mosul'] = {
      name: "Mosul" ,
      top: 2482 ,
      left: 4546 ,
    }

spaces['beirut'] = {
      name: "Beirut" ,
      top: 2585 ,
      left: 4091 ,
    }

spaces['damascus'] = {
      name: "Damascus" ,
      top: 2614 ,
      left: 4213 ,
    }

spaces['kirkuk'] = {
      name: "Kirkuk" ,
      top: 2612 ,
      left: 4558 ,
    }

spaces['nablus'] = {
      name: "Nablus" ,
      top: 2728 ,
      left: 4043 ,
    }

spaces['amman'] = {
      name: "Amman" ,
      top: 2745 ,
      left: 4166 ,
    }

spaces['baghdad'] = {
      name: "Baghdad" ,
      top: 2736 ,
      left: 4603 ,
    }


spaces['kut'] = {
      name: "Kut" ,
      top: 2785 ,
      left: 4712 ,
    }

spaces['gaza'] = {
      name: "Gaza" ,
      top: 2872 ,
      left: 3989 ,
    }

spaces['jerusalem'] = {
      name: "Jerusalem" ,
      top: 2840 ,
      left: 4116 ,
    }

spaces['samawah'] = {
      name: "Samawah" ,
      top: 2876 ,
      left: 4554 ,
    }

spaces['qurna'] = {
      name: "Qurna" ,
      top: 2883 ,
      left: 4759 ,
    }

spaces['sinai'] = {
      name: "Sinai" ,
      top: 2979 ,
      left: 3897 ,
    }

spaces['beersheba'] = {
      name: "Beersheba" ,
      top: 2967 ,
      left: 4101 ,
    }



spaces['aqaba'] = {
      name: "Aqaba" ,
      top: 3077 ,
      left: 4016 ,
    }

spaces['arabia'] = {
      name: "Arabia" ,
      top: 2990 ,
      left: 4321 ,
    }

spaces['medina'] = {
      name: "Medina" ,
      top: 3155 ,
      left: 4167 ,
    }

spaces['annasiriya'] = {
      name: "An Nasiriya" ,
      top: 3034 ,
      left: 4673 ,
    }

spaces['izmir'] = {
      name: "Izmir" ,
      top: 2954 ,
      left: 3274 ,
    }

spaces['balikesir'] = {
      name: "Balikesir" ,
      top: 2798 ,
      left: 3355 ,
    }

spaces['canakale'] = {
      name: "Cana Kale" ,
      top: 2775 ,
      left: 3194 ,
    }



spaces['bursa'] = {
      name: "Bursa" ,
      top: 2701 ,
      left: 3479 ,
    }

spaces['constantinople'] = {
      name: "Constantinople" ,
      top: 2560 ,
      left: 3474 ,
    }

spaces['gallipoli'] = {
      name: "Gallipoli" ,
      top: 2644 ,
      left: 3177 ,
    }

spaces['adrianople'] = {
      name: "Adrianople" ,
      top: 2514 ,
      left: 3308 ,
    }

spaces['libya'] = {
      name: "Libya" ,
      top: 2935 ,
      left: 3518 ,
    }

spaces['alexandria'] = {
      name: "Alexandria" ,
      top: 2955 ,
      left: 3661 ,
    }

spaces['portsaid'] = {
      name: "Port Said" ,
      top: 2899 ,
      left: 3777 ,
    }

spaces['cairo'] = {
      name: "Cairo" ,
      top: 3038 ,
      left: 3789 ,
    }

spaces['jassy'] = {
      name: "Jassy" ,
      top: 1644 ,
      left: 3183 ,
    }

spaces['barlad'] = {
      name: "Barlad" ,
      top: 1777 ,
      left: 3222 ,
    }

spaces['galatz'] = {
      name: "Galatz" ,
      top: 1946 ,
      left: 3308 ,
    }

spaces['ploesti'] = {
      name: "Ploesti" ,
      top: 1921 ,
      left: 3129 ,
    }


spaces['cartedearges'] = {
      name: "Carte de Arges" ,
      top: 1973 ,
      left: 2909 ,
    }


spaces['targujiu'] = {
      name: "Targu Jiu" ,
      top: 1983 ,
      left: 2760 ,
    }

spaces['caracal'] = {
      name: "Caracal" ,
      top: 2107 ,
      left: 2938 ,
    }

spaces['bucharest'] = {
      name: "Bucharest" ,
      top: 2074 ,
      left: 3154 ,
    }
spaces['constanta'] = {
      name: "Constanta" ,
      top: 2080 ,
      left: 3385 ,
    }

spaces['varna'] = {
      name: "Varna" ,
      top: 2233 ,
      left: 3331 ,
    }

spaces['plevna'] = {
      name: "Plevna" ,
      top: 2247 ,
      left: 3017 ,
    }

spaces['sofia'] = {
      name: "Sofia" ,
      top: 2290 ,
      left: 2847 ,
    }

spaces['kazanlik'] = {
      name: "Kazanlik" ,
      top: 2388 ,
      left: 3102 ,
    }

spaces['burgas'] = {
      name: "Burgas" ,
      top: 2365 ,
      left: 3302 ,
    }

spaces['philippoli'] = {
      name: "Philippoli" ,
      top: 2536 ,
      left: 3072 ,
    }

spaces['strumitsa'] = {
      name: "Strumitsa" ,
      top: 2445 ,
      left: 2866 ,
    }

spaces['belgrade'] = {
      name: "Belgrade" ,
      top: 2050 ,
      left: 2586 ,
    }

spaces['valjevo'] = {
      name: "Valjevo" ,
      top: 2204 ,
      left: 2499 ,
    }

spaces['nis'] = {
      name: "Nis" ,
      top: 2226 ,
      left: 2650 ,
    }

spaces['skopje'] = {
      name: "Skopje" ,
      top: 2410 ,
      left: 2653 ,
    }

spaces['monastir'] = {
      name: "Monastir" ,
      top: 2550 ,
      left: 2660 ,
    }

spaces['centije'] = {
      name: "Centije" ,
      top: 2341 ,
      left: 2365 ,
    }

spaces['tirana'] = {
      name: "Tirana" ,
      top: 2484 ,
      left: 2468 ,
    }

spaces['valona'] = {
      name: "Valona" ,
      top: 2659 ,
      left: 2459 ,
    }

spaces['florina'] = {
      name: "Florina" ,
      top: 2702 ,
      left: 2659 ,
    }

spaces['salonika'] = {
      name: "Salonika" ,
      top: 2650 ,
      left: 2782 ,
    }

spaces['kavala'] = {
      name: "Kavala" ,
      top: 2584 ,
      left: 2932 ,
    }

spaces['larisa'] = {
      name: "Larisa" ,
      top: 2803 ,
      left: 2754 ,
    }

spaces['athens'] = {
      name: "Athens" ,
      top: 3017 ,
      left: 2888 ,
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


