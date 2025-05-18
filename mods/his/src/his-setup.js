
    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      first_time_running = 1;
      this.game.state = this.returnState();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);
      this.game.spaces = this.returnSpaces();
      this.game.navalspaces = this.returnNavalSpaces();

console.log("PLAYERS INFO: " + JSON.stringify(this.game.state.players_info));

console.log("\n\n\n\n");
console.log("---------------------------");
console.log("---------------------------");
console.log("------ INITIALIZE GAME ----");
console.log("---------------------------");
console.log("---------------------------");
console.log("---------------------------");
console.log("DECK: " + this.game.options.deck);
console.log("\n\n\n\n");

      this.updateStatus("<div class='status-message' id='status-message'>Generating the Game</div>");

      //
      // Game Queue
      //
      this.game.queue.push("round");

//      let deck2 = JSON.parse(JSON.stringify(this.deck));
//      delete deck2['001'];
//      delete deck2['002'];
//      delete deck2['003'];
//      delete deck2['004'];
//      delete deck2['005'];
//      delete deck2['006'];
//      delete deck2['007'];
//      delete deck2['008'];
//
//      this.game.queue.push("DECK\t1\t"+JSON.stringify(deck2));
     this.game.queue.push("DECK\t1\t"+JSON.stringify({})); 
     this.game.queue.push("init");

    }

    //
    // attach events to spaces
    //
    this.spaces = {};
    for (let key in this.game.spaces) {
      this.spaces[key] = this.importSpace(this.game.spaces[key], key);
    }
    this.navalspaces = {};
    for (let key in this.game.navalspaces) {
      this.navalspaces[key] = this.importSpace(this.game.navalspaces[key], key);
    }

    //
    // add initial units
    //
    if (first_time_running == 1) {

      //
      // 1517 scenario
      //
      if (this.game.options.scenario === "1517") {

	//
	// 1517 wars and allies / diplomatic situation
	//
	this.setEnemies("hapsburg", "france");
	this.setEnemies("papacy", "france");
	this.setEnemies("ottoman", "hungary");

        //
        // 2P variant
        //
        if (this.game.players.length == 2) {

	  this.unsetEnemies("papacy", "france");
	  this.unsetEnemies("hapsburg", "france");
	  this.unsetEnemies("ottoman", "hungary");

	  // OTTOMAN
          this.addRegular("ottoman", "istanbul", 1);
          this.addRegular("ottoman", "edirne");
          this.addRegular("ottoman", "salonika", 1);
          this.addRegular("ottoman", "athens", 1);
	  this.addRegular("ottoman", "buda", 1);
	  this.addRegular("ottoman", "belgrade", 1);

	  this.controlSpace("ottoman", "pressburg");
	  this.controlSpace("ottoman", "agram");
	  this.controlSpace("ottoman", "mohacs");
	  this.controlSpace("ottoman", "szegedin");

	  // HAPSBURG
          this.addRegular("hapsburg", "seville", 1);
          this.addRegular("hapsburg", "barcelona", 1);
          this.addRegular("hapsburg", "navarre", 1);
          this.addRegular("hapsburg", "tunis", 1);
          this.controlSpace("hapsburg", "tunis");
          this.addRegular("hapsburg", "naples", 2);
          this.addNavalSquadron("hapsburg", "naples", 1);
          this.addRegular("hapsburg", "besancon", 1);
          this.addRegular("hapsburg", "brussels", 1);
	  this.addRegular("hapsburg", "vienna", 4);
	  this.addRegular("hapsburg", "antwerp", 1);
	  this.addRegular("hapsburg", "valladolid", 1);


	  // ENGLAND
          this.addRegular("england", "london", 1);
          this.addRegular("england", "calais", 1);
          this.addRegular("england", "york", 1);
          this.addRegular("england", "bristol", 1);

	  // FRANCE
          this.addRegular("france", "paris", 1);
          this.addRegular("france", "rouen", 1);
          this.addRegular("france", "bordeaux", 1);
          this.addRegular("france", "lyon", 1);
          this.addRegular("france", "marseille", 1);
          this.addNavalSquadron("france", "marseille", 1);
          this.addRegular("france", "milan", 2);

	  // PAPACY
          this.addRegular("papacy", "rome", 1);
          this.addNavalSquadron("papacy", "rome", 1);
          this.addRegular("papacy", "ravenna", 1);
	
	  // PROTESTANT
	
	  // VENICE
          this.addRegular("venice", "venice", 2);
          this.addNavalSquadron("venice", "venice", 3);
          this.addRegular("venice", "corfu", 1);
          this.addRegular("venice", "candia", 1);
	
	  // HUNGARY
	  this.addRegular("hungary", "prague", 1);

	  // GENOA
          this.addNavyLeader("genoa", "genoa", "andrea-doria");
          this.addNavalSquadron("genoa", "genoa", 1);
          this.addRegular("genoa", "genoa", 2);
	
	  // SCOTLAND
          this.addRegular("scotland", "edinburgh", 1);
	
	  // INDEPENDENT
          this.addRegular("independent", "rhodes", 1);
          this.addRegular("independent", "metz", 1);
          this.addRegular("independent", "florence", 1);	

	  // DEBATERS
	  this.addDebater("papacy", "eck-debater");
	  this.addDebater("papacy", "campeggio-debater");
	  this.addDebater("papacy", "aleander-debater");
	  this.addDebater("papacy", "tetzel-debater");
	  this.addDebater("papacy", "cajetan-debater");

	  this.addDebater("protestant", "luther-debater");
	  this.addDebater("protestant", "melanchthon-debater");
	  this.addDebater("protestant", "bucer-debater");
	  this.addDebater("protestant", "carlstadt-debater");

	  // CUSTOMIZED CONTROL
	  this.controlSpace("hapsburg", "prague");
	  this.controlSpace("hapsburg", "brunn");
	  this.controlSpace("hapsburg", "breslau");
	  this.controlSpace("ottoman", "buda");
	  this.controlSpace("ottoman", "belgrade");
	  this.controlSpace("ottoman", "ragusa");

	  this.setAllies("hungary", "hapsburg");

	} else {

	  // OTTOMAN
          this.addArmyLeader("ottoman", "istanbul", "suleiman");
          this.addArmyLeader("ottoman", "istanbul", "ibrahim-pasha");
          this.addRegular("ottoman", "istanbul", 7);
          this.addCavalry("ottoman", "istanbul", 1);
          this.addNavalSquadron("ottoman", "istanbul", 1);
          this.addRegular("ottoman", "edirne");
          this.addRegular("ottoman", "salonika", 1);
          this.addNavalSquadron("ottoman", "salonika", 1);
          this.addRegular("ottoman", "athens", 1);
          this.addNavalSquadron("ottoman", "athens", 1);

	  // HAPSBURG
	  this.addArmyLeader("hapsburg", "valladolid", "charles-v");
	  this.addArmyLeader("hapsburg", "valladolid", "duke-of-alva");
          this.addRegular("hapsburg", "valladolid", 4);
          this.addRegular("hapsburg", "seville", 1);
          this.addNavalSquadron("hapsburg", "seville", 1);
          this.addRegular("hapsburg", "barcelona", 1);
          this.addNavalSquadron("hapsburg", "barcelona", 1);
          this.addRegular("hapsburg", "navarre", 1);
          this.addRegular("hapsburg", "tunis", 1);
          this.controlSpace("hapsburg", "tunis");
          this.addRegular("hapsburg", "naples", 2);
          this.addNavalSquadron("hapsburg", "naples", 1);
          this.addRegular("hapsburg", "besancon", 1);
          this.addRegular("hapsburg", "brussels", 1);
	  //this.addArmyLeader("hapsburg", "vienna", "ferdinand");
          this.addRegular("hapsburg", "vienna", 4);
          this.addRegular("hapsburg", "antwerp", 1);

	  this.game.state.players_info[0].captured.push(JSON.parse(JSON.stringify(this.army["ferdinand"])));


	  // ENGLAND
          this.addArmyLeader("england", "london", "henry-viii");
          this.addArmyLeader("england", "london", "charles-brandon");
          this.addRegular("england", "london", 3);
          this.addNavalSquadron("england", "london", 1);
          this.addNavalSquadron("england", "portsmouth", 1);
          this.addRegular("england", "calais", 2);
          this.addRegular("england", "york", 1);
          this.addRegular("england", "bristol", 1);

	  // FRANCE
          this.addArmyLeader("france", "paris", "francis-i");
          this.addArmyLeader("france", "paris", "montmorency");
          this.addRegular("france", "paris", 4);
          this.addRegular("france", "rouen", 1);
          this.addNavalSquadron("france", "rouen", 1);
          this.addRegular("france", "bordeaux", 2);
          this.addRegular("france", "lyon", 1);
          this.addRegular("france", "marseille", 1);
          this.addNavalSquadron("france", "marseille", 1);
          this.addRegular("france", "milan", 2);

	  // PAPACY
          this.addRegular("papacy", "rome", 1);
          this.addNavalSquadron("papacy", "rome", 1);
          this.addRegular("papacy", "ravenna", 1);
	
	  // PROTESTANT
	
	  // VENICE
          this.addRegular("venice", "venice", 2);
          this.addNavalSquadron("venice", "venice", 3);
          this.addRegular("venice", "corfu", 1);
          this.addRegular("venice", "candia", 1);
	
	  // GENOA
          this.addNavyLeader("genoa", "genoa", "andrea-doria");
          this.addNavalSquadron("genoa", "genoa", 1);
          this.addRegular("genoa", "genoa", 2);
	
	  // HUNGARY
          this.addRegular("hungary", "belgrade", 1);
          this.addRegular("hungary", "buda", 5);
          this.addRegular("hungary", "prague", 1);

	  // SCOTLAND
          this.addRegular("scotland", "edinburgh", 3);
          this.addNavalSquadron("scotland", "edinburgh", 1);
	
	  // INDEPENDENT
          this.addRegular("independent", "rhodes", 1);
          this.addRegular("independent", "metz", 1);
          this.addRegular("independent", "florence", 1);

	  // DEBATERS
	  this.addDebater("papacy", "eck-debater");
	  this.addDebater("papacy", "campeggio-debater");
	  this.addDebater("papacy", "aleander-debater");
	  this.addDebater("papacy", "tetzel-debater");
	  this.addDebater("papacy", "cajetan-debater");

	  this.addDebater("protestant", "luther-debater");
	  this.addDebater("protestant", "melanchthon-debater");
	  this.addDebater("protestant", "bucer-debater");
	  this.addDebater("protestant", "carlstadt-debater");

	}

      }

      //
      // 1532 scenario
      //
      if (this.game.options.scenario === "1532" || this.game.options.scenario === "tournament") {

	  this.game.state.starting_round = 4;
	  this.game.state.round = 3; // the one before 4

	  //
	  // 1532 wars and allies / diplomatic situation
	  //
	  this.setEnemies("hapsburg", "ottoman");
	  this.setAllies("hapsburg", "hungary");
	  this.setActivatedPower("hapsburg", "hungary");

	  // OTTOMAN
          this.addArmyLeader("ottoman", "istanbul", "suleiman");
          this.addArmyLeader("ottoman", "istanbul", "ibrahim-pasha");
          this.addRegular("ottoman", "istanbul", 5);
          this.addCavalry("ottoman", "istanbul", 1);
          this.addNavalSquadron("ottoman", "istanbul", 1);
          this.addRegular("ottoman", "edirne");
          this.addRegular("ottoman", "salonika", 1);
          this.addNavalSquadron("ottoman", "salonika", 1);
          this.addRegular("ottoman", "athens", 1);
          this.addNavalSquadron("ottoman", "athens", 1);
          this.addNavyLeader("ottoman", "algiers", "barbarossa");
          this.addRegular("ottoman", "algiers", 2);
          this.addCorsair("ottoman", "algiers", 2);
          this.controlSpace("ottoman", "algiers");
          this.addRegular("ottoman", "buda", 3);
          this.addCavalry("ottoman", "buda", 1);
          this.controlSpace("ottoman", "buda");
          this.addRegular("ottoman", "belgrade", 1);
          this.controlSpace("ottoman", "belgrade");
          this.controlSpace("ottoman", "mohacs");
          this.controlSpace("ottoman", "szegedin");
          this.controlSpace("ottoman", "agram");
          this.controlSpace("ottoman", "rhodes");

	  this.game.state.ottoman_war_winner_vp = 2;
	  this.game.spaces["algiers"].pirate_haven = 1;
	  this.game.spaces["algiers"].home = "ottoman";


	  // HAPSBURG
	  this.addArmyLeader("hapsburg", "valladolid", "charles-v");
	  this.addArmyLeader("hapsburg", "valladolid", "duke-of-alva");
          this.addRegular("hapsburg", "valladolid", 4);
          this.addRegular("hapsburg", "seville", 1);
          this.addNavalSquadron("hapsburg", "seville", 1);
          this.addRegular("hapsburg", "barcelona", 1);
          this.addNavalSquadron("hapsburg", "barcelona", 1);
          this.addRegular("hapsburg", "navarre", 1);
          this.addRegular("hapsburg", "naples", 2);
          this.addNavalSquadron("hapsburg", "naples", 1);
          this.addRegular("hapsburg", "besancon", 1);
          this.addRegular("hapsburg", "brussels", 1);
	  this.addArmyLeader("hapsburg", "vienna", "ferdinand");
          this.addRegular("hapsburg", "vienna", 4);
          this.addMercenary("hapsburg", "vienna", 2);

          this.addRegular("hapsburg", "antwerp", 3);
          this.controlSpace("hapsburg", "prague");
          this.controlSpace("hapsburg", "breslau");
          this.controlSpace("hapsburg", "brunn");
          this.controlSpace("hapsburg", "pressburg");
          this.controlSpace("hapsburg", "regensburg");
          this.controlSpace("hapsburg", "salzburg");
          this.controlSpace("hapsburg", "munster");
          this.controlSpace("hapsburg", "cologne");
          this.controlSpace("hapsburg", "trier");
          this.controlSpace("hapsburg", "basel");
          this.controlSpace("hapsburg", "zurich");
          this.controlSpace("hapsburg", "vienna");

	  this.game.state.hapsburg_war_winner_vp = 1;

          this.game.state.newworld['circumnavigation'].faction = "hapsburg";
          this.game.state.newworld['circumnavigation'].claimed = 1;
          this.game.state.newworld['pacificstrait'].faction = "hapsburg";
          this.game.state.newworld['pacificstrait'].claimed = 1;
          this.game.state.newworld['aztec'].faction = "hapsburg";
          this.game.state.newworld['aztec'].claimed = 1;

          this.game.state.newworld['hapsburg_colony1'].faction = "hapsburg";
          this.game.state.newworld['hapsburg_colony1'].claimed = 1;
          this.game.state.newworld['hapsburg_colony2'].faction = "hapsburg";
          this.game.state.newworld['hapsburg_colony2'].claimed = 1;

          this.game.state.colonies.push({
            faction : "hapsburg" ,
            resolved : 1 ,
	    colony : "hapsburg_colony1" ,
            round : 1 ,
	    name : "Puerto Rico",
	    img : "/his/img/tiles/colonies/PuertoRico.svg",
          });
	  this.game.state.colonies.push({
            faction : "hapsburg" ,
            resolved : 1 ,
	    colony : "hapsburg_colony2" ,
            round : 2 ,
	    name : "Cuba",
	    img : "/his/img/tiles/colonies/Cuba.svg",
          });

	  this.removeExplorer("hapsburg", "magellan");
	  this.removeExplorer("hapsburg", "leon");
	  this.removeExplorer("hapsburg", "narvaez");
	  this.removeConquistador("hapsburg", "cordova");

	  this.game.state['hapsburg_uncharted'] = 0;

	  // ENGLAND
          this.addArmyLeader("england", "london", "henry-viii");
          this.addArmyLeader("england", "london", "charles-brandon");
          this.addRegular("england", "london", 3);
          this.addMercenary("england", "london", 2);
          this.addNavalSquadron("england", "london", 1);
          this.addNavalSquadron("england", "plymouth", 1);
          this.addNavalSquadron("england", "portsmouth", 1);
          this.addRegular("england", "calais", 2);
          this.addRegular("england", "york", 1);
          this.addRegular("england", "bristol", 1);

	  this.game.state.england_card_bonus = 1;
	  this.game.state.henry_viii_marital_status = 1;
	  this.game.state['england_uncharted'] = 0;

	  // FRANCE
          this.addArmyLeader("france", "paris", "francis-i");
          this.addArmyLeader("france", "paris", "montmorency");
          this.addRegular("france", "paris", 4);
          this.addMercenary("france", "paris", 2);
          this.addRegular("france", "rouen", 1);
          this.addNavalSquadron("france", "rouen", 1);
          this.addRegular("france", "bordeaux", 2);
          this.addRegular("france", "lyon", 1);
          this.addRegular("france", "marseille", 1);
          this.addNavalSquadron("france", "marseille", 1);

	  this.removeExplorer("france", "verrazano");

	  this.game.state.france_card_bonus = 1;
	  this.game.state['france_uncharted'] = 0;
	  this.game.state.french_chateaux_vp = 2;

	  // PAPACY
          this.addRegular("papacy", "rome", 1);
          this.addMercenary("papacy", "rome", 1);
          this.addNavalSquadron("papacy", "rome", 1);
          this.addRegular("papacy", "ravenna", 1);
          this.addMercenary("papacy", "ravenna", 1);
	  this.controlSpace("papacy", "florence");
          this.addRegular("papacy", "florence", 1);
	  this.controlSpace("papacy", "siena");
	
          this.game.state.saint_peters_cathedral['state'] = 0;
          this.game.state.saint_peters_cathedral['vp'] = 1;
	  this.game.state.leaders.leo_x = 0;
	  this.game.state.events.clement_vii = 1;
	  this.game.state.leaders.clement_vii = 1;
	  this.game.state.already_excommunicated.push("luther-debater");

	  // PROTESTANT
	  this.addRegular("protestant", "brandenburg");	
	  this.addRegular("protestant", "wittenberg", 2);
	  this.addRegular("protestant", "mainz");	
	  this.addMercenary("protestant", "mainz", 2);	
	  this.addRegular("protestant", "augsburg", 2);	

          this.addReformer("protestant", "wittenberg", "luther-reformer");
          this.addArmyLeader("protestant", "brandenburg", "philip-hesse");
          this.addArmyLeader("protestant", "wittenberg", "john-frederick");

    	  this.game.state.augsburg_electoral_bonus = 1;
    	  this.game.state.mainz_electoral_bonus = 1;
    	  this.game.state.trier_electoral_bonus = 0;
    	  this.game.state.cologne_electoral_bonus = 0;
    	  this.game.state.wittenberg_electoral_bonus = 1;
    	  this.game.state.brandenburg_electoral_bonus = 1;

          this.game.state.translations['full']['german'] = 0;
          this.game.state.translations['full']['english'] = 0;
          this.game.state.translations['full']['french'] = 0;
          this.game.state.translations['new']['german'] = 6;
          this.game.state.translations['new']['english'] = 2;
          this.game.state.translations['new']['french'] = 4;

	  this.removeDebater("protestant", "zwingli-debater");
	  this.removeReformer("protestant", "geneva", "zwingli-debater");

	  this.convertSpace("protestant", "wittenberg");
	  this.convertSpace("protestant", "brandenburg");
	  this.convertSpace("protestant", "stettin");
	  this.convertSpace("protestant", "lubeck");
	  this.convertSpace("protestant", "magdeburg");

	  this.convertSpace("protestant", "leipzig");
	  this.convertSpace("protestant", "erfurt");
	  this.convertSpace("protestant", "nuremberg");
	  this.convertSpace("protestant", "hamburg");
	  this.convertSpace("protestant", "bremen");

	  this.convertSpace("protestant", "kassel");
	  this.convertSpace("protestant", "brunswick");
	  this.convertSpace("protestant", "mainz");
	  this.convertSpace("protestant", "worms");
	  this.convertSpace("protestant", "strasburg");

	  this.convertSpace("protestant", "basel");
	  this.convertSpace("protestant", "zurich");
	  this.convertSpace("protestant", "augsburg");
	  this.convertSpace("protestant", "breslau");


          // DEBATERS
          this.addDebater("papacy", "eck-debater");
          this.addDebater("papacy", "campeggio-debater");
          this.addDebater("papacy", "aleander-debater");
          this.addDebater("papacy", "contarini-debater");
          this.addDebater("papacy", "tetzel-debater");
          this.addDebater("papacy", "cajetan-debater");

          this.addDebater("protestant", "luther-debater");
          this.addDebater("protestant", "melanchthon-debater");
          this.addDebater("protestant", "bucer-debater");
          this.addDebater("protestant", "carlstadt-debater");
          this.addDebater("protestant", "bullinger-debater");
          this.addDebater("protestant", "oekolampadius-debater");
          this.addDebater("protestant", "tyndale-debater");

	  // VENICE
          this.addRegular("venice", "venice", 2);
          this.addNavalSquadron("venice", "venice", 3);
          this.addRegular("venice", "corfu", 1);
          this.addRegular("venice", "candia", 1);
	
	  // GENOA
          this.addNavyLeader("genoa", "genoa", "andrea-doria");
          this.addNavalSquadron("genoa", "genoa", 1);
          this.addRegular("genoa", "genoa", 2);
	
	  // HUNGARY
	  this.addRegular("hungary", "prague", 1);

	  // SCOTLAND
          this.addRegular("scotland", "edinburgh", 3);
          this.addNavalSquadron("scotland", "edinburgh", 1);
          this.game.spaces['stirling'].fortify = 1;
	
	  // INDEPENDENT
          this.controlSpace("independent", "basel");
          this.controlSpace("independent", "zurich");
          this.controlSpace("independent", "milan");
          this.controlSpace("independent", "tunis");	
          this.controlSpace("independent", "malta", 1);
          this.addRegular("independent", "malta", 1);
          this.addRegular("independent", "metz", 1);
          this.addRegular("independent", "milan", 1);
          this.addRegular("independent", "tunis", 1);

	  // ALLIANCES
	  this.setEnemies("ottoman", "hapsburg");
	  this.setEnemies("hapsburg", "protestant");
	  this.setEnemies("papacy", "protestant");
	  this.setAllies("hapsburg", "hungary");

	  // DEBATERS         
          this.addDebater("protestant", "farel-debater");
          this.addDebater("protestant", "cop-debater");
          this.addDebater("protestant", "olivetan-debater");
          this.addDebater("protestant", "calvin-debater");
          this.addReformer("protestant", "geneva", "calvin-reformer");
          this.convertSpace("protestant", "geneva");


          this.game.state.events.barbary_pirates = 1;
          this.game.state.events.ottoman_piracy_enabled = 1;
          this.game.state.events.ottoman_corsairs_enabled = 1;

	  this.removeCardFromGame("009");
	  this.removeCardFromGame("008");

      }

      if (this.game.options.scenario === "is_testing") {


	  this.game.state.starting_round = 4;
	  this.game.state.round = 3; // the one before 4

	  //
	  // 1532 wars and allies / diplomatic situation
	  //
	  this.setEnemies("hapsburg", "ottoman");
	  this.setAllies("france", "genoa");
	  this.setAllies("hapsburg", "hungary");
	  this.setActivatedPower("hapsburg", "hungary");

	  this.addNavalSquadron("hapsburg", "gibraltar", 1);
	  this.addNavalSquadron("hapsburg", "gibraltar", 1);

	  // OTTOMAN
          this.addArmyLeader("ottoman", "istanbul", "suleiman");
          this.addArmyLeader("ottoman", "istanbul", "ibrahim-pasha");
          this.addRegular("ottoman", "istanbul", 5);
          this.addCavalry("ottoman", "istanbul", 1);
          this.addNavalSquadron("ottoman", "istanbul", 1);
          this.addRegular("ottoman", "edirne");
          this.addRegular("ottoman", "salonika", 1);
          this.addNavalSquadron("ottoman", "salonika", 1);
          this.addRegular("ottoman", "athens", 1);
          this.addNavalSquadron("ottoman", "athens", 1);
          this.addNavyLeader("ottoman", "algiers", "barbarossa");
          this.addRegular("ottoman", "algiers", 2);
          this.addCorsair("ottoman", "algiers", 2);
          this.controlSpace("ottoman", "algiers");
          this.addRegular("ottoman", "buda", 3);
          this.addCavalry("ottoman", "buda", 1);
          this.controlSpace("ottoman", "buda");
          this.addRegular("ottoman", "belgrade", 1);
          this.controlSpace("ottoman", "belgrade");
          this.controlSpace("ottoman", "mohacs");
          this.controlSpace("ottoman", "szegedin");
          this.controlSpace("ottoman", "agram");
          this.controlSpace("ottoman", "rhodes");

	  this.game.state.ottoman_war_winner_vp = 2;
	  this.game.spaces["algiers"].pirate_haven = 1;
	  this.game.spaces["algiers"].home = "ottoman";


	  // HAPSBURG
//	  this.addArmyLeader("hapsburg", "valladolid", "charles-v");
	  this.addArmyLeader("hapsburg", "valladolid", "duke-of-alva");
          this.addRegular("hapsburg", "valladolid", 4);
          this.addRegular("hapsburg", "seville", 1);
          this.addNavalSquadron("hapsburg", "seville", 1);
          this.addRegular("hapsburg", "barcelona", 1);
          this.addNavalSquadron("hapsburg", "barcelona", 1);
          this.addRegular("hapsburg", "navarre", 1);
          this.addRegular("hapsburg", "naples", 2);
          this.addNavalSquadron("hapsburg", "naples", 1);
          this.addRegular("hapsburg", "besancon", 1);
          this.addRegular("hapsburg", "brussels", 1);
	  this.addArmyLeader("hapsburg", "vienna", "ferdinand");
          //this.addRegular("hapsburg", "vienna", 4);
          this.addMercenary("hapsburg", "vienna", 2);

// TESTING
	  this.addArmyLeader("hapsburg", "palma", "duke-of-alva");
	  this.addArmyLeader("hapsburg", "palma", "charles-v");
          this.addMercenary("hapsburg", "palma", 4);

          this.addRegular("hapsburg", "antwerp", 3);
          this.controlSpace("hapsburg", "prague");
          this.controlSpace("hapsburg", "breslau");
          this.controlSpace("hapsburg", "brunn");
          this.controlSpace("hapsburg", "pressburg");
          this.controlSpace("hapsburg", "regensburg");
          this.controlSpace("hapsburg", "salzburg");
          this.controlSpace("hapsburg", "munster");
          this.controlSpace("hapsburg", "cologne");
          this.controlSpace("hapsburg", "trier");
          this.controlSpace("hapsburg", "basel");
          this.controlSpace("hapsburg", "zurich");
          this.controlSpace("hapsburg", "vienna");

	  this.game.state.hapsburg_war_winner_vp = 1;

          this.game.state.newworld['circumnavigation'].faction = "hapsburg";
          this.game.state.newworld['circumnavigation'].claimed = 1;
          this.game.state.newworld['pacificstrait'].faction = "hapsburg";
          this.game.state.newworld['pacificstrait'].claimed = 1;
          this.game.state.newworld['aztec'].faction = "hapsburg";
          this.game.state.newworld['aztec'].claimed = 1;

          this.game.state.newworld['hapsburg_colony1'].faction = "hapsburg";
          this.game.state.newworld['hapsburg_colony1'].claimed = 1;
          this.game.state.newworld['hapsburg_colony2'].faction = "hapsburg";
          this.game.state.newworld['hapsburg_colony2'].claimed = 1;

          this.game.state.colonies.push({
            faction : "hapsburg" ,
            resolved : 1 ,
	    colony : "hapsburg_colony1" ,
            round : 1 ,
	    name : "Puerto Rico",
	    img : "/his/img/tiles/colonies/PuertoRico.svg",
          });
	  this.game.state.colonies.push({
            faction : "hapsburg" ,
            resolved : 1 ,
	    colony : "hapsburg_colony2" ,
            round : 2 ,
	    name : "Cuba",
	    img : "/his/img/tiles/colonies/Cuba.svg",
          });

	  this.removeExplorer("hapsburg", "magellan");
	  this.removeExplorer("hapsburg", "leon");
	  this.removeExplorer("hapsburg", "narvaez");
	  this.removeConquistador("hapsburg", "cordova");

	  this.game.state['hapsburg_uncharted'] = 0;

	  // ENGLAND
          this.addArmyLeader("england", "london", "henry-viii");
          this.addArmyLeader("england", "london", "charles-brandon");
          this.addRegular("england", "london", 3);
          this.addMercenary("england", "london", 2);
          //this.addNavalSquadron("england", "london", 1);
          //this.addNavalSquadron("england", "plymouth", 1);
          //this.addNavalSquadron("england", "portsmouth", 1);
          this.addRegular("england", "calais", 2);
          this.addRegular("england", "york", 1);
          this.addRegular("england", "bristol", 1);

	  this.game.state.england_card_bonus = 1;
	  this.game.state.henry_viii_marital_status = 1;
	  this.game.state['england_uncharted'] = 0;

	  // FRANCE
          this.addArmyLeader("france", "paris", "francis-i");
          this.addArmyLeader("france", "paris", "montmorency");
          this.addRegular("france", "paris", 4);
          this.addMercenary("france", "paris", 2);
          this.addRegular("france", "rouen", 1);
          this.addNavalSquadron("france", "rouen", 1);
          this.addRegular("france", "bordeaux", 2);
          this.addRegular("france", "lyon", 1);
          this.addRegular("france", "marseille", 1);
          this.addNavalSquadron("france", "marseille", 1);

	  this.removeExplorer("france", "verrazano");

	  this.game.state.france_card_bonus = 1;
	  this.game.state['france_uncharted'] = 0;
	  this.game.state.french_chateaux_vp = 2;

	  // PAPACY
          this.addRegular("papacy", "rome", 1);
          this.addMercenary("papacy", "rome", 1);
          this.addNavalSquadron("papacy", "rome", 1);
          this.addRegular("papacy", "ravenna", 1);
          this.addMercenary("papacy", "ravenna", 1);
	  this.controlSpace("papacy", "florence");
          this.addRegular("papacy", "florence", 1);
	  this.controlSpace("papacy", "siena");
	
          this.game.state.saint_peters_cathedral['state'] = 0;
          this.game.state.saint_peters_cathedral['vp'] = 1;
	  this.game.state.leaders.leo_x = 0;
	  this.game.state.events.clement_vii = 1;
	  this.game.state.leaders.clement_vii = 1;
	  this.game.state.already_excommunicated.push("luther-debater");

	  // PROTESTANT
	  this.addRegular("protestant", "brandenburg");	
	  this.addRegular("protestant", "wittenberg", 2);
	  this.addRegular("protestant", "mainz");	
	  this.addMercenary("protestant", "mainz", 2);	
	  this.addRegular("protestant", "augsburg", 2);	

          this.addReformer("protestant", "wittenberg", "luther-reformer");
          this.addArmyLeader("protestant", "brandenburg", "philip-hesse");
          this.addArmyLeader("protestant", "wittenberg", "john-frederick");

    	  this.game.state.augsburg_electoral_bonus = 1;
    	  this.game.state.mainz_electoral_bonus = 1;
    	  this.game.state.trier_electoral_bonus = 0;
    	  this.game.state.cologne_electoral_bonus = 0;
    	  this.game.state.wittenberg_electoral_bonus = 1;
    	  this.game.state.brandenburg_electoral_bonus = 1;

          this.game.state.translations['full']['german'] = 0;
          this.game.state.translations['full']['english'] = 0;
          this.game.state.translations['full']['french'] = 0;
          this.game.state.translations['new']['german'] = 6;
          this.game.state.translations['new']['english'] = 2;
          this.game.state.translations['new']['french'] = 4;

	  this.removeDebater("protestant", "zwingli-debater");
	  this.removeReformer("protestant", "geneva", "zwingli-debater");

	  this.convertSpace("protestant", "wittenberg");
	  this.convertSpace("protestant", "brandenburg");
	  this.convertSpace("protestant", "stettin");
	  this.convertSpace("protestant", "lubeck");
	  this.convertSpace("protestant", "magdeburg");

	  this.convertSpace("protestant", "leipzig");
	  this.convertSpace("protestant", "erfurt");
	  this.convertSpace("protestant", "nuremberg");
	  this.convertSpace("protestant", "hamburg");
	  this.convertSpace("protestant", "bremen");

	  this.convertSpace("protestant", "kassel");
	  this.convertSpace("protestant", "brunswick");
	  this.convertSpace("protestant", "mainz");
	  this.convertSpace("protestant", "worms");
	  this.convertSpace("protestant", "strasburg");

	  this.convertSpace("protestant", "basel");
	  this.convertSpace("protestant", "zurich");
	  this.convertSpace("protestant", "augsburg");
	  this.convertSpace("protestant", "breslau");


          // DEBATERS
          this.addDebater("papacy", "eck-debater");
          this.addDebater("papacy", "campeggio-debater");
          this.addDebater("papacy", "aleander-debater");
          this.addDebater("papacy", "contarini-debater");
          this.addDebater("papacy", "tetzel-debater");
          this.addDebater("papacy", "cajetan-debater");

          this.addDebater("protestant", "luther-debater");
          this.addDebater("protestant", "melanchthon-debater");
          this.addDebater("protestant", "bucer-debater");
          this.addDebater("protestant", "carlstadt-debater");
          this.addDebater("protestant", "bullinger-debater");
          this.addDebater("protestant", "oekolampadius-debater");
          this.addDebater("protestant", "tyndale-debater");

	  // VENICE
          this.addRegular("venice", "venice", 2);
          this.addNavalSquadron("venice", "venice", 3);
          this.addRegular("venice", "corfu", 1);
          this.addRegular("venice", "candia", 1);
	
	  // GENOA
          this.addNavyLeader("genoa", "genoa", "andrea-doria");
          this.addNavalSquadron("genoa", "genoa", 1);
          this.addRegular("genoa", "genoa", 2);
	
	  // HUNGARY
	  this.addRegular("hungary", "prague", 1);

	  // SCOTLAND
          this.addRegular("scotland", "edinburgh", 3);
          this.addNavalSquadron("scotland", "edinburgh", 1);
          this.game.spaces['stirling'].fortify = 1;
	
	  // INDEPENDENT
          this.controlSpace("independent", "basel");
          this.controlSpace("independent", "zurich");
          this.controlSpace("independent", "milan");
          this.controlSpace("independent", "tunis");	
          this.controlSpace("independent", "malta", 1);
          this.addRegular("independent", "malta", 1);
          //this.addRegular("independent", "metz", 1);
          this.addRegular("independent", "milan", 1);
          this.addRegular("independent", "tunis", 1);

	  // ALLIANCES
	  this.setEnemies("ottoman", "hapsburg");
	  this.setEnemies("hapsburg", "protestant");
	  this.setEnemies("papacy", "protestant");
	  this.setAllies("hapsburg", "hungary");

	  // DEBATERS         
          this.addDebater("protestant", "farel-debater");
          this.addDebater("protestant", "cop-debater");
          this.addDebater("protestant", "olivetan-debater");
          this.addDebater("protestant", "calvin-debater");
          this.addReformer("protestant", "geneva", "calvin-reformer");
          this.convertSpace("protestant", "geneva");


          this.game.state.events.barbary_pirates = 1;
          this.game.state.events.ottoman_piracy_enabled = 1;
          this.game.state.events.ottoman_corsairs_enabled = 1;


	  this.controlSpace("ottoman", "pressburg");
          this.addArmyLeader("ottoman", "pressburg", "suleiman");
          this.addArmyLeader("ottoman", "pressburg", "ibrahim-pasha");
          this.addRegular("ottoman", "pressburg", 6);

	  //
	  // TESTING AND MODIFICTIONS
	  //
	  //
//	  this.addRegular("hapsburg", "graz", 4);

	  this.setAllies("england", "scotland");
	  this.setEnemies("hapsburg", "france");
	  this.setEnemies("england", "france");
	  this.controlSpace("hapsburg", "metz");

	  this.controlSpace("ottoman", "linz");
	  this.controlSpace("ottoman", "brunn");
	  this.controlSpace("ottoman", "salzburg");

	  this.game.spaces["london"].unrest = 1;
	  this.game.spaces["metz"].besieged = 1;
	  this.addRegular("france", "metz", 2);

	  this.removeCardFromGame("009");
	  this.removeCardFromGame("008");

	  this.setAllies("protestant", "england");
	  this.controlSpace("hapsburg", "trent");
	  this.setAllies("hapsburg", "venice");
	  this.setEnemies("ottoman", "venice");
	  this.controlSpace("ottoman", "agram");
	  this.controlSpace("ottoman", "zara");
	  this.controlSpace("ottoman", "ragusa");
          this.addNavalSquadron("hapsburg", "palma", 1);

	  this.addRegular("hapsburg", "prague", 2);
	  this.addRegular("england", "leipzig", 4);
          this.addArmyLeader("england", "leipzig", "charles-brandon");

      }

    }

    //
    // and show the board
    //
    this.displayBoard();

  }


