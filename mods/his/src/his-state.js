
  addUnit(player, space, type) {
    try { if (this.spaces[space]) { space = this.spaces[space]; } } catch (err) {}
    space.units[player-1].push(this.newUnit(player, type));
  }

  addRegular(player, space) {
    try { if (this.spaces[space]) { space = this.spaces[space]; } } catch (err) {}
    space.units[player-1].push(this.newUnit(player, "regular"));
  }

  addMercenary(player, space) {
    try { if (this.spaces[space]) { space = this.spaces[space]; } } catch (err) {}
    space.units[player-1].push(this.newUnit(player, "mercenary"));
  }

  addDebater(player, space) {
    try { if (this.spaces[space]) { space = this.spaces[space]; } } catch (err) {}
    space.units[player-1].push(this.newUnit(player, "debater"));
  }

  convertSpace(religion, space) {
    try { if (this.spaces[space]) { space = this.spaces[space]; } } catch (err) {}
    space.religion = religion;
    this.displayBoard();
  }


  isSpaceAdjacentToReligion(space, religion) {
   console.log ("rel 1: ");
    try { if (this.spaces[space]) { space = this.spaces[space]; } } catch (err) {}
   console.log ("rel 2: " + space.religion);
    for (let i = 0; i < space.neighbours.length; i++) {
   console.log ("rel 2: " + space.neighbours[i]);
      if (this.spaces[space.neighbours[i]].religion === religion) {
	return true;
      }
    }
console.log("returning false");
    return false;
  }



  /////////////////////
  // Core Game State //
  /////////////////////
  returnState() {

    let state = {};

    state.round = 0;
    state.players = [];
    state.events = {};

    return state;

  }


  returnColonies() {

    let colonies = {};

    colonies['1'] = {
      top : 1007,
      left : 55
    }
    colonies['2'] = {
      top : 1120,
      left : 55
    }
    colonies['3'] = {
      top : 1232,
      left : 55
    }
    colonies['4'] = {
      top : 1344,
      left : 55
    }
    colonies['5'] = {
      top : 1456,
      left : 55
    }
    colonies['6'] = {
      top : 1568,
      left : 55
    }
    colonies['7'] = {
      top : 1680,
      left : 55
    }

    return colonies;

  }


  returnNewWorld() {

    let nw = {};

    nw['greatlakes'] = {
      top : 1906 ,
      left : 280,
      vp : 1
    }
    nw['stlawrence'] = {
      top : 1886 ,
      left : 515,
      vp : 1
    }
    nw['mississippi'] = {
      top : 2075 ,
      left : 280 ,
      vp : 1
    }
    nw['aztec'] = {
      top : 2258 ,
      left : 168 ,
      vp : 2
    }
    nw['maya'] = {
      top : 2300 ,
      left : 302 ,
      vp : 2
    }
    nw['amazon'] = {
      top : 2536 ,
      left : 668 ,
      vp : 2
    }
    nw['inca'] = {
      top : 2660 ,
      left : 225,
      vp : 2
    }
    nw['circumnavigation'] = {
      top : 2698,
      left : 128,
      vp : 3
    }
    nw['pacificstrait'] = {
      top : 2996 ,
      left : 486 ,
      vp : 1
    }


    return nw;

  }


  returnConquest() {

    let conquest = {};

    conquest['1'] = {
      top : 1007,
      left : 178
    }
    conquest['2'] = {
      top : 1120,
      left : 178
    }
    conquest['3'] = {
      top : 1232,
      left : 178
    }
    conquest['4'] = {
      top : 1344,
      left : 178
    }
    conquest['5'] = {
      top : 1456,
      left : 178
    }
    conquest['6'] = {
      top : 1568,
      left : 178
    }
    conquest['7'] = {
      top : 1680,
      left : 178
    }

    return conquest;

  }

  returnVictoryPointTrack() {

    let track = {};

    track['1'] = {
      top : 2912,
      left : 2138
    }
    track['2'] = {
      top : 2912,
      left : 2252
    }
    track['3'] = {
      top : 2912,
      left : 2366
    }
    track['4'] = {
      top : 2912,
      left : 2480
    }
    track['5'] = {
      top : 2912,
      left : 2594
    }
    track['6'] = {
      top : 2912,
      left : 2708
    }
    track['7'] = {
      top : 2912,
      left : 2822
    }
    track['8'] = {
      top : 2912,
      left : 2936
    }
    track['9'] = {
      top : 2912,
      left : 3050
    }
    track['10'] = {
      top : 3026,
      left : 884
    }
    track['11'] = {
      top : 3026,
      left : 998
    }
    track['12'] = {
      top : 3026,
      left : 1112
    }
    track['13'] = {
      top : 1226,
      left : 1
    }
    track['14'] = {
      top : 3026,
      left : 1340
    }
    track['15'] = {
      top : 3026,
      left : 1454
    }
    track['16'] = {
      top : 3026,
      left : 1568
    }
    track['17'] = {
      top : 3026,
      left : 1682
    }
    track['18'] = {
      top : 3026,
      left : 1796
    }
    track['19'] = {
      top : 3026,
      left : 1910
    }
    track['20'] = {
      top : 3026,
      left : 2024
    }
    track['21'] = {
      top : 3026,
      left : 2138
    }
    track['22'] = {
      top : 3026,
      left : 2252
    }
    track['23'] = {
      top : 3026,
      left : 2366
    }
    track['24'] = {
      top : 3026,
      left : 2480
    }
    track['25'] = {
      top : 3026,
      left : 2594
    }
    track['26'] = {
      top : 3026,
      left : 2708
    }
    track['27'] = {
      top : 3026,
      left : 2822
    }
    track['28'] = {
      top : 3026,
      left : 2936
    }
    track['29'] = {
      top : 3026,
      left : 3050
    }

  }


  returnSpaces() {

    let spaces = {};


    spaces['stirling'] = {
      top: 70,
      left: 1265,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
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
      neighbours: ["stirling","carlisle","berwick"],
      language: "english",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
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
      type: "key"

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
      neighbours: ["shrewsbury","wales","plymouth","portsmouth","london"],
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religion: "catholic",
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
      neighbours: ["calais","rouen","paris","stquentin"],
      language: "french",
      type: "town"
    }
    spaces['stquentin'] = {
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stdizier","paris","boulogne"],
      type: "town"
    }
    spaces['stdizier'] = {
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussles","stquentin","paris","dijon","metz"],
      language: "french",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","boulogne","stquentin","stdizer","dijon","orleans"],
      language: "french",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      religion: "catholic",
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
      neighbours: ["stdizer","paris","orleans","lyon","besancon"],
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
      neighbours: ["nantes","tours","limgoes"],
      language: "french",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["avignon","limgoes","orleans","digion","geneva","grenoble"],
      language: "french",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["lyon","geneva"],
      language: "french",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["toulouse","lyon","marseille"],
      language: "french",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religion: "catholic",
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
      neighbours: ["bordeaux","avignon"],
      language: "french",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["nantes","tours","limoges","toulouse"],
      language: "french",
      type: "key"
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
      neighbours: ["lubeck","brandenburg"],
      language: "german",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 460,
      left: 3077,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["stettin","lubeck","magdeburg","wittenberg","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 600,
      left: 3130,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["brandenburg","magdeburg","leipzip","prague","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 534,
      left: 2932,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["lubeck","brandenburg","wittenburg","erfurt","brunswick"],
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
      top: 716,
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
      neighbours: ["nuremburg","augsburg","salzburg","linz"],
      language: "german",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["linz","regensburg","augsburg","innsbruck"],
      language: "german",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1080,
      left: 2860,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["worms","nuremberg","regensburg","salzburg"],
      language: "german",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 925,
      left: 2834,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["augsburg","worms","mainz","kassel","leipzig","regensburg"],
      language: "german",
      type: "town"
    }
    spaces['mainz'] = {
      top: 868,
      left: 2666,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["trier","cologne","kassel","nuremberg","worms"],
      language: "german",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 894,
      left: 2516,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["liege","metz","mainz"],
      language: "german",
      type: "town"
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
    spaces['corunnas'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religion: "catholic",
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
      neighbours: ["zaragoza","velencia"],
      language: "spanish",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
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
      neighbours: ["edinburgh","carlisle","yddork"],
      language: "spanish",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religion: "catholic",
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
      neighbours: ["granda","valencia"],
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
      language: "other",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "ottoman independent",
      political: "",
      religion: "catholic",
      language: "other",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religion: "catholic",
      language: "other",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      language: "other",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religion: "catholic",
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
      neighbours: ["vienna","mohacs","agram","trieste"],
      language: "german",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religion: "catholic",
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
      neighbours: ["zurich","salzburg"],
      language: "german",
      type: "town"
    }


    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      language: "other",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religion: "catholic",
      language: "other",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religion: "catholic",
      language: "other",
      type: "town"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religion: "catholic",
      language: "other",
      type: "fortress"
    }


    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religion: "other",
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
      neighbours: ["lepanto","athens","salonika"],
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
      neighbours: ["scutari"],
      language: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["ragusa","durazzo"],
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
      neighbours: ["bucharest","belgrade"],
      language: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nezh","edirne"],
      language: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["belgrade","sofia"],
      language: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["szegedin","mohacs","agram","nezh","nicopolis"],
      language: "other",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["buda","belgrade"],
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
      neighbours: ["graz","trieste","belgrade","mohacs"],
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
      neighbours: ["basel","besancon","lyon","grenoble"],
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
      neighbours: ["milan","modena","venice"],
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
      neighbours: ["milan","pavia","genoa"],
      language: "italian",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["marseille"],
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
      language: "other",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religion: "catholic",
      neighbours: ["pavia","turin","modena","siena"],
      language: "italian",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religion: "catholic",
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
      neighbours: ["ragusa","trieste"],
      language: "other",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religion: "catholic",
      neighbours: ["zara","scutari"],
      language: "italian",
      type: "town"
    }


    for (let key in spaces) {
      spaces[key].units = [];
      for (let i = 0; i < this.game.players.length; i++) {
	spaces[key].units.push([]);
      }
    }

    return spaces;

  }


  returnElectorateDisplay() {

    let electorates = {};

    electorates['augsburg'] = {
      top: 190,
      left: 3380,
    }
    electorates['trier'] = {
      top: 190,
      left: 3510,
    }
    electorates['cologne'] = {
      top: 190,
      left: 3642,
    }
    electorates['wittenberg'] = {
      top: 376,
      left: 3380,
    }
    electorates['mainz'] = {
      top: 376,
      left: 3510,
    }
    electorates['brandenburg'] = {
      top: 376,
      left: 3642,
    }

    return electorates;

  }

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {
	return `
	  <div class="space_view" id="">
	    This is the detailed view of the city or town.
	  </div>
	`;
      };

    }

    return obj;

  }



  returnDeck() {

    var deck = {};

    // EARLY WAR
    deck['001'] = { 
      img : "HIS-001.svg" , 
      name : "Card" ,
    }
    deck['002'] = { 
      img : "HIS-002.svg" , 
      name : "Card" ,
    }
    deck['003'] = { 
      img : "HIS-003.svg" , 
      name : "Card" ,
    }
    deck['004'] = { 
      img : "HIS-004.svg" , 
      name : "Card" ,
    }
    deck['005'] = { 
      img : "HIS-005.svg" , 
      name : "Card" ,
    }
    deck['006'] = { 
      img : "HIS-006.svg" , 
      name : "Card" ,
    }
    deck['007'] = { 
      img : "HIS-007.svg" , 
      name : "Card" ,
    }
    deck['008'] = { 
      img : "HIS-008.svg" , 
      name : "Card" ,
      onEvent : function(game_mod, player) {

	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
	game_mod.game.queue.push("protestant_reformation\t"+player);
        game_mod.game.queue.push("ACKNOWLEDGE\tThe Reformation.!");
        game_mod.convertSpace("protestant", "wittenberg");
        game_mod.addUnit(1, "wittenberg", "regular");
        game_mod.addUnit(1, "wittenberg", "regular");
        game_mod.addUnit(1, "wittenberg", "debater");
        game_mod.displaySpace("wittenberg");

	return 1;
      },
      handleGameLoop : function(game_mod, qe, mv) {

        if (mv[0] == "protestant_reformation") {

          let player = parseInt(mv[1]);
console.log("player is: " + player + " -- i am " + game_mod.game.player);

          game_mod.game.queue.splice(qe, 1);

	  if (game_mod.game.player == player) {
            game_mod.playerSelectSpaceWithFilter(

	      "Select Reformation Attempt",

	      //
	      // catholic spaces adjacent to protestant 
	      //
	      function(space) {
console.log("is this catholic: " + space.religion);
let isatr = game_mod.isSpaceAdjacentToReligion(space, "protestant");
console.log("and printing now!");
console.log("is space adj: " + isatr);
		if (
		  space.religion === "catholic" &&
		  game_mod.isSpaceAdjacentToReligion(space, "protestant")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch reformation
	      //
	      function(spacekey) {
		game_mod.addMove("reformation\t"+spacekey);
		game_mod.endTurn();
	      },

	      null

	    );
	  }

          return 0;

        }

	return 1;
      }
    }
    deck['009'] = { 
      img : "HIS-009.svg" , 
      name : "Card" ,
    }
    deck['010'] = { 
      img : "HIS-010.svg" , 
      name : "Card" ,
    }
    deck['011'] = { 
      img : "HIS-011.svg" , 
      name : "Card" ,
    }
    deck['012'] = { 
      img : "HIS-012.svg" , 
      name : "Card" ,
    }
    deck['013'] = { 
      img : "HIS-013.svg" , 
      name : "Card" ,
    }
    deck['014'] = { 
      img : "HIS-014.svg" , 
      name : "Card" ,
    }
    deck['015'] = { 
      img : "HIS-015.svg" , 
      name : "Card" ,
    }
    deck['016'] = { 
      img : "HIS-016.svg" , 
      name : "Card" ,
    }
    deck['017'] = { 
      img : "HIS-017.svg" , 
      name : "Card" ,
    }
    deck['018'] = { 
      img : "HIS-018.svg" , 
      name : "Card" ,
    }
    deck['019'] = { 
      img : "HIS-019.svg" , 
      name : "Card" ,
    }
    deck['020'] = { 
      img : "HIS-020.svg" , 
      name : "Card" ,
    }
    deck['021'] = { 
      img : "HIS-021.svg" , 
      name : "Card" ,
    }
    deck['022'] = { 
      img : "HIS-022.svg" , 
      name : "Card" ,
    }
    deck['023'] = { 
      img : "HIS-023.svg" , 
      name : "Card" ,
    }
    deck['024'] = { 
      img : "HIS-024.svg" , 
      name : "Card" ,
    }
    deck['025'] = { 
      img : "HIS-025.svg" , 
      name : "Card" ,
    }
    deck['026'] = { 
      img : "HIS-026.svg" , 
      name : "Card" ,
    }
    deck['027'] = { 
      img : "HIS-027.svg" , 
      name : "Card" ,
    }
    deck['028'] = { 
      img : "HIS-028.svg" , 
      name : "Card" ,
    }
    deck['029'] = { 
      img : "HIS-029.svg" , 
      name : "Card" ,
    }
    deck['030'] = { 
      img : "HIS-030.svg" , 
      name : "Card" ,
    }
    deck['031'] = { 
      img : "HIS-031.svg" , 
      name : "Card" ,
    }
    deck['032'] = { 
      img : "HIS-032.svg" , 
      name : "Card" ,
    }
    deck['033'] = { 
      img : "HIS-033.svg" , 
      name : "Card" ,
    }
    deck['034'] = { 
      img : "HIS-034.svg" , 
      name : "Card" ,
    }
    deck['035'] = { 
      img : "HIS-035.svg" , 
      name : "Card" ,
    }
    deck['036'] = { 
      img : "HIS-036.svg" , 
      name : "Card" ,
    }
    deck['037'] = { 
      img : "HIS-037.svg" , 
      name : "Card" ,
    }
    deck['038'] = { 
      img : "HIS-038.svg" , 
      name : "Card" ,
    }
    deck['039'] = { 
      img : "HIS-039.svg" , 
      name : "Card" ,
    }
    deck['040'] = { 
      img : "HIS-040.svg" , 
      name : "Card" ,
    }
    deck['041'] = { 
      img : "HIS-041.svg" , 
      name : "Card" ,
    }
    deck['042'] = { 
      img : "HIS-042.svg" , 
      name : "Card" ,
    }
    deck['043'] = { 
      img : "HIS-043.svg" , 
      name : "Card" ,
    }
    deck['044'] = { 
      img : "HIS-044.svg" , 
      name : "Card" ,
    }
    deck['045'] = { 
      img : "HIS-045.svg" , 
      name : "Card" ,
    }
    deck['046'] = { 
      img : "HIS-046.svg" , 
      name : "Card" ,
    }
    deck['047'] = { 
      img : "HIS-047.svg" , 
      name : "Card" ,
    }
    deck['048'] = { 
      img : "HIS-048.svg" , 
      name : "Card" ,
    }
    deck['049'] = { 
      img : "HIS-049.svg" , 
      name : "Card" ,
    }
    deck['050'] = { 
      img : "HIS-050.svg" , 
      name : "Card" ,
    }
    deck['051'] = { 
      img : "HIS-051.svg" , 
      name : "Card" ,
    }
    deck['052'] = { 
      img : "HIS-052.svg" , 
      name : "Card" ,
    }
    deck['053'] = { 
      img : "HIS-053.svg" , 
      name : "Card" ,
    }
    deck['054'] = { 
      img : "HIS-054.svg" , 
      name : "Card" ,
    }
    deck['055'] = { 
      img : "HIS-055.svg" , 
      name : "Card" ,
    }
    deck['056'] = { 
      img : "HIS-056.svg" , 
      name : "Card" ,
    }
    deck['057'] = { 
      img : "HIS-057.svg" , 
      name : "Card" ,
    }
    deck['058'] = { 
      img : "HIS-058.svg" , 
      name : "Card" ,
    }
    deck['059'] = { 
      img : "HIS-059.svg" , 
      name : "Card" ,
    }
    deck['060'] = { 
      img : "HIS-060.svg" , 
      name : "Card" ,
    }
    deck['061'] = { 
      img : "HIS-061.svg" , 
      name : "Card" ,
    }
    deck['062'] = { 
      img : "HIS-062.svg" , 
      name : "Card" ,
    }
    deck['063'] = { 
      img : "HIS-063.svg" , 
      name : "Card" ,
    }
    deck['064'] = { 
      img : "HIS-064.svg" , 
      name : "Card" ,
    }
    deck['065'] = { 
      img : "HIS-065.svg" , 
      name : "Card" ,
    }
    deck['066'] = { 
      img : "HIS-066.svg" , 
      name : "Card" ,
    }
    deck['067'] = { 
      img : "HIS-067.svg" , 
      name : "Card" ,
    }
    deck['068'] = { 
      img : "HIS-068.svg" , 
      name : "Card" ,
    }
    deck['069'] = { 
      img : "HIS-069.svg" , 
      name : "Card" ,
    }
    deck['070'] = { 
      img : "HIS-070.svg" , 
      name : "Card" ,
    }
    deck['071'] = { 
      img : "HIS-071.svg" , 
      name : "Card" ,
    }
    deck['072'] = { 
      img : "HIS-072.svg" , 
      name : "Card" ,
    }
    deck['073'] = { 
      img : "HIS-073.svg" , 
      name : "Card" ,
    }
    deck['074'] = { 
      img : "HIS-074.svg" , 
      name : "Card" ,
    }
    deck['075'] = { 
      img : "HIS-075.svg" , 
      name : "Card" ,
    }
    deck['076'] = { 
      img : "HIS-076.svg" , 
      name : "Card" ,
    }
    deck['077'] = { 
      img : "HIS-077.svg" , 
      name : "Card" ,
    }
    deck['078'] = { 
      img : "HIS-078.svg" , 
      name : "Card" ,
    }
    deck['079'] = { 
      img : "HIS-079.svg" , 
      name : "Card" ,
    }
    deck['080'] = { 
      img : "HIS-080.svg" , 
      name : "Card" ,
    }
    deck['081'] = { 
      img : "HIS-081.svg" , 
      name : "Card" ,
    }
    deck['082'] = { 
      img : "HIS-082.svg" , 
      name : "Card" ,
    }
    deck['083'] = { 
      img : "HIS-083.svg" , 
      name : "Card" ,
    }
    deck['084'] = { 
      img : "HIS-084.svg" , 
      name : "Card" ,
    }
    deck['085'] = { 
      img : "HIS-085.svg" , 
      name : "Card" ,
    }
    deck['086'] = { 
      img : "HIS-086.svg" , 
      name : "Card" ,
    }
    deck['087'] = { 
      img : "HIS-087.svg" , 
      name : "Card" ,
    }
    deck['088'] = { 
      img : "HIS-088.svg" , 
      name : "Card" ,
    }
    deck['089'] = { 
      img : "HIS-089.svg" , 
      name : "Card" ,
    }
    deck['090'] = { 
      img : "HIS-090.svg" , 
      name : "Card" ,
    }
    deck['091'] = { 
      img : "HIS-091.svg" , 
      name : "Card" ,
    }
    deck['092'] = { 
      img : "HIS-092.svg" , 
      name : "Card" ,
    }
    deck['093'] = { 
      img : "HIS-093.svg" , 
      name : "Card" ,
    }
    deck['094'] = { 
      img : "HIS-094.svg" , 
      name : "Card" ,
    }
    deck['095'] = { 
      img : "HIS-095.svg" , 
      name : "Card" ,
    }
    deck['096'] = { 
      img : "HIS-096.svg" , 
      name : "Card" ,
    }
    deck['097'] = { 
      img : "HIS-097.svg" , 
      name : "Card" ,
    }
    deck['098'] = { 
      img : "HIS-098.svg" , 
      name : "Card" ,
    }
    deck['099'] = { 
      img : "HIS-099.svg" , 
      name : "Card" ,
    }
    deck['100'] = { 
      img : "HIS-100.svg" , 
      name : "Card" ,
    }
    deck['101'] = { 
      img : "HIS-101.svg" , 
      name : "Card" ,
    }
    deck['102'] = { 
      img : "HIS-102.svg" , 
      name : "Card" ,
    }
    deck['103'] = { 
      img : "HIS-103.svg" , 
      name : "Card" ,
    }
    deck['104'] = { 
      img : "HIS-104.svg" , 
      name : "Card" ,
    }
    deck['105'] = { 
      img : "HIS-105.svg" , 
      name : "Card" ,
    }
    deck['106'] = { 
      img : "HIS-106.svg" , 
      name : "Card" ,
    }
    deck['107'] = { 
      img : "HIS-107.svg" , 
      name : "Card" ,
    }
    deck['108'] = { 
      img : "HIS-108.svg" , 
      name : "Card" ,
    }
    deck['109'] = { 
      img : "HIS-109.svg" , 
      name : "Card" ,
    }
    deck['110'] = { 
      img : "HIS-110.svg" , 
      name : "Card" ,
    }
    deck['111'] = { 
      img : "HIS-111.svg" , 
      name : "Card" ,
    }
    deck['112'] = { 
      img : "HIS-112.svg" , 
      name : "Card" ,
    }
    deck['113'] = { 
      img : "HIS-113.svg" , 
      name : "Card" ,
    }
    deck['114'] = { 
      img : "HIS-114.svg" , 
      name : "Card" ,
    }
    deck['115'] = { 
      img : "HIS-115.svg" , 
      name : "Card" ,
    }
    deck['116'] = { 
      img : "HIS-116.svg" , 
      name : "Card" ,
    }
    deck['117'] = { 
      img : "HIS-117.svg" , 
      name : "Card" ,
    }
    deck['118'] = { 
      img : "HIS-118.svg" , 
      name : "Card" ,
    }
    deck['119'] = { 
      img : "HIS-119.svg" , 
      name : "Card" ,
    }
    deck['120'] = { 
      img : "HIS-120.svg" , 
      name : "Card" ,
    }
    deck['121'] = { 
      img : "HIS-121.svg" , 
      name : "Card" ,
    }
    deck['122'] = { 
      img : "HIS-122.svg" , 
      name : "Card" ,
    }
    deck['123'] = { 
      img : "HIS-123.svg" , 
      name : "Card" ,
    }
    deck['124'] = { 
      img : "HIS-124.svg" , 
      name : "Card" ,
    }
    deck['125'] = { 
      img : "HIS-125.svg" , 
      name : "Card" ,
    }
    deck['126'] = { 
      img : "HIS-126.svg" , 
      name : "Card" ,
    }
    deck['127'] = { 
      img : "HIS-127.svg" , 
      name : "Card" ,
    }
    deck['128'] = { 
      img : "HIS-128.svg" , 
      name : "Card" ,
    }
    deck['129'] = { 
      img : "HIS-129.svg" , 
      name : "Card" ,
    }
    deck['130'] = { 
      img : "HIS-130.svg" , 
      name : "Card" ,
    }
    deck['131'] = { 
      img : "HIS-131.svg" , 
      name : "Card" ,
    }
    deck['132'] = { 
      img : "HIS-132.svg" , 
      name : "Card" ,
    }
    deck['133'] = { 
      img : "HIS-133.svg" , 
      name : "Card" ,
    }
    deck['134'] = { 
      img : "HIS-134.svg" , 
      name : "Card" ,
    }
    deck['135'] = { 
      img : "HIS-135.svg" , 
      name : "Card" ,
    }
    deck['136'] = { 
      img : "HIS-136.svg" , 
      name : "Card" ,
    }
    deck['137'] = { 
      img : "HIS-137.svg" , 
      name : "Card" ,
    }
    deck['138'] = { 
      img : "HIS-138.svg" , 
      name : "Card" ,
    }
    deck['139'] = { 
      img : "HIS-139.svg" , 
      name : "Card" ,
    }
    deck['140'] = { 
      img : "HIS-140.svg" , 
      name : "Card" ,
    }
    deck['141'] = { 
      img : "HIS-141.svg" , 
      name : "Card" ,
    }
    deck['142'] = { 
      img : "HIS-142.svg" , 
      name : "Card" ,
    }
    deck['143'] = { 
      img : "HIS-143.svg" , 
      name : "Card" ,
    }
    deck['144'] = { 
      img : "HIS-144.svg" , 
      name : "Card" ,
    }
    deck['145'] = { 
      img : "HIS-145.svg" , 
      name : "Card" ,
    }
    deck['146'] = { 
      img : "HIS-146.svg" , 
      name : "Card" ,
    }
    deck['147'] = { 
      img : "HIS-147.svg" , 
      name : "Card" ,
    }
    deck['148'] = { 
      img : "HIS-148.svg" , 
      name : "Card" ,
    }
    deck['149'] = { 
      img : "HIS-149.svg" , 
      name : "Card" ,
    }
    deck['150'] = { 
      img : "HIS-150.svg" , 
      name : "Card" ,
    }
    deck['151'] = { 
      img : "HIS-151.svg" , 
      name : "Card" ,
    }
    deck['152'] = { 
      img : "HIS-152.svg" , 
      name : "Card" ,
    }
    deck['153'] = { 
      img : "HIS-153.svg" , 
      name : "Card" ,
    }
    deck['154'] = { 
      img : "HIS-154.svg" , 
      name : "Card" ,
    }
    deck['155'] = { 
      img : "HIS-155.svg" , 
      name : "Card" ,
    }
    deck['156'] = { 
      img : "HIS-156.svg" , 
      name : "Card" ,
    }
    deck['157'] = { 
      img : "HIS-157.svg" , 
      name : "Card" ,
    }
    deck['158'] = { 
      img : "HIS-158.svg" , 
      name : "Card" ,
    }
    deck['159'] = { 
      img : "HIS-159.svg" , 
      name : "Card" ,
    }
    deck['160'] = { 
      img : "HIS-160.svg" , 
      name : "Card" ,
    }
    deck['161'] = { 
      img : "HIS-161.svg" , 
      name : "Card" ,
    }
    deck['162'] = { 
      img : "HIS-162.svg" , 
      name : "Card" ,
    }
    deck['163'] = { 
      img : "HIS-163.svg" , 
      name : "Card" ,
    }
    deck['164'] = { 
      img : "HIS-164.svg" , 
      name : "Card" ,
    }
    deck['165'] = { 
      img : "HIS-165.svg" , 
      name : "Card" ,
    }
    deck['166'] = { 
      img : "HIS-166.svg" , 
      name : "Card" ,
    }
    deck['167'] = { 
      img : "HIS-167.svg" , 
      name : "Card" ,
    }
    deck['168'] = { 
      img : "HIS-168.svg" , 
      name : "Card" ,
    }
    deck['169'] = { 
      img : "HIS-169.svg" , 
      name : "Card" ,
    }
    deck['170'] = { 
      img : "HIS-170.svg" , 
      name : "Card" ,
    }
    deck['171'] = { 
      img : "HIS-171.svg" , 
      name : "Card" ,
    }
    deck['172'] = { 
      img : "HIS-172.svg" , 
      name : "Card" ,
    }
    deck['173'] = { 
      img : "HIS-173.svg" , 
      name : "Card" ,
    }
    deck['174'] = { 
      img : "HIS-174.svg" , 
      name : "Card" ,
    }
    deck['175'] = { 
      img : "HIS-175.svg" , 
      name : "Card" ,
    }
    deck['176'] = { 
      img : "HIS-176.svg" , 
      name : "Card" ,
    }
    deck['177'] = { 
      img : "HIS-177.svg" , 
      name : "Card" ,
    }
    deck['178'] = { 
      img : "HIS-178.svg" , 
      name : "Card" ,
    }
    deck['179'] = { 
      img : "HIS-179.svg" , 
      name : "Card" ,
    }
    deck['180'] = { 
      img : "HIS-180.svg" , 
      name : "Card" ,
    }
    deck['181'] = { 
      img : "HIS-181.svg" , 
      name : "Card" ,
    }
    deck['182'] = { 
      img : "HIS-182.svg" , 
      name : "Card" ,
    }
    deck['183'] = { 
      img : "HIS-183.svg" , 
      name : "Card" ,
    }
    deck['184'] = { 
      img : "HIS-184.svg" , 
      name : "Card" ,
    }
    deck['185'] = { 
      img : "HIS-185.svg" , 
      name : "Card" ,
    }
    deck['186'] = { 
      img : "HIS-186.svg" , 
      name : "Card" ,
    }
    deck['187'] = { 
      img : "HIS-187.svg" , 
      name : "Card" ,
    }
    deck['188'] = { 
      img : "HIS-188.svg" , 
      name : "Card" ,
    }
    deck['189'] = { 
      img : "HIS-189.svg" , 
      name : "Card" ,
    }
    deck['190'] = { 
      img : "HIS-190.svg" , 
      name : "Card" ,
    }
    deck['191'] = { 
      img : "HIS-191.svg" , 
      name : "Card" ,
    }
    deck['192'] = { 
      img : "HIS-192.svg" , 
      name : "Card" ,
    }
    deck['193'] = { 
      img : "HIS-193.svg" , 
      name : "Card" ,
    }
    deck['194'] = { 
      img : "HIS-194.svg" , 
      name : "Card" ,
    }
    deck['195'] = { 
      img : "HIS-195.svg" , 
      name : "Card" ,
    }
    deck['196'] = { 
      img : "HIS-196.svg" , 
      name : "Card" ,
    }
    deck['197'] = { 
      img : "HIS-197.svg" , 
      name : "Card" ,
    }
    deck['198'] = { 
      img : "HIS-198.svg" , 
      name : "Card" ,
    }
    deck['199'] = { 
      img : "HIS-199.svg" , 
      name : "Card" ,
    }
    deck['200'] = { 
      img : "HIS-200.svg" , 
      name : "Card" ,
    }
    deck['201'] = { 
      img : "HIS-201.svg" , 
      name : "Card" ,
    }
    deck['202'] = { 
      img : "HIS-202.svg" , 
      name : "Card" ,
    }
    deck['203'] = { 
      img : "HIS-203.svg" , 
      name : "Card" ,
    }
    deck['204'] = { 
      img : "HIS-204.svg" , 
      name : "Card" ,
    }
    deck['205'] = { 
      img : "HIS-205.svg" , 
      name : "Card" ,
    }
    deck['206'] = { 
      img : "HIS-206.svg" , 
      name : "Card" ,
    }
    deck['207'] = { 
      img : "HIS-207.svg" , 
      name : "Card" ,
    }
    deck['208'] = { 
      img : "HIS-208.svg" , 
      name : "Card" ,
    }
    deck['209'] = { 
      img : "HIS-209.svg" , 
      name : "Card" ,
    }
    deck['210'] = { 
      img : "HIS-210.svg" , 
      name : "Card" ,
    }
    deck['211'] = { 
      img : "HIS-211.svg" , 
      name : "Card" ,
    }
    deck['212'] = { 
      img : "HIS-212.svg" , 
      name : "Card" ,
    }
    deck['213'] = { 
      img : "HIS-213.svg" , 
      name : "Card" ,
    }
    deck['214'] = { 
      img : "HIS-214.svg" , 
      name : "Card" ,
    }
    deck['215'] = { 
      img : "HIS-215.svg" , 
      name : "Card" ,
    }
    deck['216'] = { 
      img : "HIS-216.svg" , 
      name : "Card" ,
    }
    deck['217'] = { 
      img : "HIS-217.svg" , 
      name : "Card" ,
    }
    deck['218'] = { 
      img : "HIS-218.svg" , 
      name : "Card" ,
    }
    deck['219'] = { 
      img : "HIS-219.svg" , 
      name : "Card" ,
    }

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }


