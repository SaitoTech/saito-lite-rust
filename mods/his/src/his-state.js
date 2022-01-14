
  addUnit(player, space, type) {
    this.spaces[space].units[player-1].push(this.newUnit(player, type));
console.log("ADDED " + type + " to " + space);
console.log(JSON.stringify(this.spaces[space]));
  }

  addRegular(player, space) {
    this.spaces[space].units[player-1].push(this.newUnit(player, "regular"));
  }

  addMercenary(player, space) {
    this.spaces[space].units[player-1].push(this.newUnit(player, "mercenary"));
  }

  addDebater(player, space) {
    this.spaces[space].units[player-1].push(this.newUnit(player, "debater"));
  }

  convertSpace(religion, space) {
    this.spaces[space].religion = religion;
    this.displayBoard();
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
      religious: "catholic",
      type: "fortress"
    }
    spaces['glasgow'] = {
      top: 225,
      left: 1285,
      home: "scotland",
      political: "scotland",
      religious: "catholic",
      type: "town"
    }
    spaces['edinburgh'] = {
      top: 125,
      left: 1420,
      home: "scotland",
      political: "scotland",
      religious: "catholic",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['carlisle'] = {
      top: 276,
      left: 1447,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['york'] = {
      top: 375,
      left: 1595,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }
    spaces['wales'] = {
      top: 633,
      left: 1398,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['shrewsbury'] = {
      top: 521,
      left: 1535,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['lincoln'] = {
      top: 531,
      left: 1706,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['norwich'] = {
      top: 538,
      left: 1896,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['bristol'] = {
      top: 688,
      left: 1554,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }
    spaces['plymouth'] = {
      top: 898,
      left: 1398,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['portsmouth'] = {
      top: 821,
      left: 1661,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "town"
    }
    spaces['calais'] = {
      top: 745,
      left: 2022,
      home: "england",
      political: "england",
      religious: "catholic",
      type: "key"
    }

    spaces['boulogne'] = {
      top: 880,
      left: 1955,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['stquentin'] = {
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['stdizier'] = {
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['orleans'] = {
      top: 1217,
      left: 2018,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['dijon'] = {
      top: 1205,
      left: 2204,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['limoges'] = {
      top: 1398,
      left: 1975,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['tours'] = {
      top: 1277,
      left: 1849,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['nantes'] = {
      top: 1310,
      left: 1650,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['brest'] = {
      top: 1173,
      left: 1409,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['toulouse'] = {
      top: 1740,
      left: 1990,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['bordeaux'] = {
      top: 1568,
      left: 1780,
      home: "france",
      political: "france",
      religious: "catholic",
      type: "key"
    }

    spaces['munster'] = {
      top: 537,
      left: 2500,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['bremen'] = {
      top: 422,
      left: 2595,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['hamburg'] = {
      top: 345,
      left: 2758,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['lubeck'] = {
      top: 258,
      left: 2985,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['stettin'] = {
      top: 310,
      left: 3214,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 460,
      left: 3077,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 600,
      left: 3130,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 534,
      left: 2932,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['brunswick'] = {
      top: 568,
      left: 2722,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['cologne'] = {
      top: 716,
      left: 2500,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['kassel'] = {
      top: 714,
      left: 2665,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['erfurt'] = {
      top: 750,
      left: 2824,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['leipzig'] = {
      top: 690,
      left: 2983,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['regensburg'] = {
      top: 956,
      left: 3033,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1080,
      left: 2860,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 925,
      left: 2834,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['mainz'] = {
      top: 868,
      left: 2666,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 894,
      left: 2516,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['strasburg'] = {
      top: 1070,
      left: 2578,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }
    spaces['worms'] = {
      top: 1009,
      left: 2704,
      home: "",
      political: "hapsburg",
      religious: "catholic",
      type: "town"
    }


    spaces['navarre'] = {
      top: 1814,
      left: 1702,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['bilbao'] = {
      top: 1825,
      left: 1533,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['corunnas'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['valladolid'] = {
      top: 2058,
      left: 1394,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['zaragoza'] = {
      top: 2025,
      left: 1777,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['barcelona'] = {
      top: 2062,
      left: 2106,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['madrid'] = {
      top: 2236,
      left: 1550,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['cartagena'] = {
      top: 2593,
      left: 1830,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['granada'] = {
      top: 2657,
      left: 1558,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['seville'] = {
      top: 2642,
      left: 1319,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['cordoba'] = {
      top: 2530,
      left: 1446,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['gibraltar'] = {
      top: 2814,
      left: 1374,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }

    spaces['oran'] = {
      top: 2822,
      left: 1902,
      home: "hapsburg ottoman",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "ottoman independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['messina'] = {
      top: 2429,
      left: 3475,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['cerignola'] = {
      top: 1915,
      left: 3426,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['taranto'] = {
      top: 2080,
      left: 3597,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['naples'] = {
      top: 2087,
      left: 3358,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['malta'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['vienna'] = {
      top: 1020,
      left: 3474,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['linz'] = {
      top: 1045,
      left: 3288,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['graz'] = {
      top: 2715,
      left: 3380,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['innsbruck'] = {
      top: 1170,
      left: 3016,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }


    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "fortress"
    }


    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['athens'] = {
      top: 2346,
      left: 4286,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['lepanto'] = {
      top: 2320,
      left: 4057,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['larissa'] = {
      top: 2184,
      left: 4130,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['salonika'] = {
      top: 2010,
      left: 4164,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['durazzo'] = {
      top: 2040,
      left: 3844,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "fortress"
    }
    spaces['edirne'] = {
      top: 1840,
      left: 4532,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['istanbul'] = {
      top: 1890,
      left: 4775,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "key"
    }
    spaces['varna'] = {
      top: 1620,
      left: 4653,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['bucharest'] = {
      top: 1430,
      left: 4459,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['nicopolis'] = {
      top: 1570,
      left: 4336,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religious: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['mohacs'] = {
      top: 1353,
      left: 3710,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['graz'] = {
      top: 1208,
      left: 3374,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['agram'] = {
      top: 1373,
      left: 3460,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['buda'] = {
      top: 1104,
      left: 3746,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['pressburg'] = {
      top: 1080,
      left: 3613,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['brunn'] = {
      top: 840,
      left: 3526,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['breslau'] = {
      top: 640,
      left: 3466,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['prague'] = {
      top: 785,
      left: 3230,
      home: "hungary",
      political: "",
      religious: "catholic",
      type: "key"
    }


    spaces['amsterdam'] = {
      top: 546,
      left: 2244,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['antwerp'] = {
      top: 669,
      left: 2168,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['brussels'] = {
      top: 823,
      left: 2201,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['liege'] = {
      top: 783,
      left: 2351,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['metz'] = {
      top: 995,
      left: 2384,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['besancon'] = {
      top: 1169,
      left: 2390,
      home: "hapsburg",
      political: "",
      religious: "catholic",
      type: "fortress"
    }
    spaces['basel'] = {
      top: 1211,
      left: 2558,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['zurich'] = {
      top: 1216,
      left: 2712,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['geneva'] = {
      top: 1367,
      left: 2474,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['milan'] = {
      top: 1373,
      left: 2746,
      home: "independent",
      political: "france",
      religious: "catholic",
      type: "key"
    }
    spaces['trent'] = {
      top: 1310,
      left: 2933,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['modena'] = {
      top: 1486,
      left: 2951,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['pavia'] = {
      top: 1505,
      left: 2800,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['turin'] = {
      top: 1530,
      left: 2585,
      home: "independent",
      political: "france",
      religious: "catholic",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['florence'] = {
      top: 1642,
      left: 2976,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['siena'] = {
      top: 1805,
      left: 2988,
      home: "independent",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['bastia'] = {
      top: 1829,
      left: 2784,
      home: "genoa",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['ancona'] = {
      top: 1754,
      left: 3238,
      home: "papacy",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['ravenna'] = {
      top: 1596,
      left: 3130,
      home: "papacy",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['venice'] = {
      top: 1399,
      left: 3086,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "key"
    }
    spaces['zara'] = {
      top: 1571,
      left: 3374,
      home: "venice",
      political: "",
      religious: "catholic",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religious: "catholic",
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
	alert("The Reformation Happens");
	return 1;
      },
      handleGameLoop : function(game_mod, qe, mv) {
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

    return deck;

  }


