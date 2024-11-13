 
  ////////////////////
  // Return Planets //
  ////////////////////
  returnPlanets() {
  
    var planets = {};

    //  
    // regular planets
    //  
    planets['crystalis']  	= { type : "hazardous" , img : "/imperium/img/planets/crystalis.png" , name : "Crystalis" , resources : 3 , influence : 0 , bonus : ""  }
    planets['troth']  		= { type : "hazardous" , img : "/imperium/img/planets/troth.png" , name : "Troth" , resources : 2 , influence : 0 , bonus : ""  }

    planets['londrak']  	= { type : "industrial" , img : "/imperium/img/planets/londrak.png" , name : "Londrak" , resources : 1 , influence : 2 , bonus : ""  }
    planets['citadel']  	= { type : "hazardous" , img : "/imperium/img/planets/citadel.png" , name : "Citadel" , resources : 0 , influence : 4 , bonus : "red"  }

    planets['calthrex']  	= { type : "industrial" , img : "/imperium/img/planets/calthrex.png" , name : "Calthrex" , resources : 2 , influence : 1 , bonus : ""  }
    planets['soundra-iv']  	= { type : "industrial" , img : "/imperium/img/planets/soundra_iv.png" , name : "Soundra IV" , resources : 1 , influence : 2 , bonus : ""  }

    planets['udon-i']  		= { type : "hazardous" , img : "/imperium/img/planets/udon_i.png" , name : "Udon-I" , resources : 3 , influence : 1 , bonus : ""  }
    planets['udon-ii']  	= { type : "hazardous" , img : "/imperium/img/planets/udon_ii.png" , name : "Udon-II" , resources : 2 , influence : 3 , bonus : ""  }

    planets['olympia']  	= { type : "cultural" , img : "/imperium/img/planets/olympia.png" , name : "Olympia" , resources : 1 , influence : 3 , bonus : ""  }
    planets['granton-mex'] 	= { type : "industrial" , img : "/imperium/img/planets/granton_mex.png" , name : "Granton Mex" , resources : 1 , influence : 1 , bonus : "blue"  }

    planets['new-illia'] 	= { type : "cultural" , img : "/imperium/img/planets/new_illia.png" , name : "New Illia" , resources : 1 , influence : 2 , bonus : ""  }
    planets['sirens-end'] 	= { type : "cultural" , img : "/imperium/img/planets/sirens_end.png" , name : "Siren's End" , resources : 2 , influence : 0 , bonus : ""  }

    planets['lazaks-curse'] 	= { type : "cultural" , img : "/imperium/img/planets/lazaks_curse.png" , name : "Lazak's Curse" , resources : 0 , influence : 2 , bonus : ""  }
    planets['riftview'] 	= { type : "cultural" , img : "/imperium/img/planets/riftview.png" , name : "Riftview" , resources : 1 , influence : 1 , bonus : ""  }

    planets['broughton'] 	= { type : "industrial" , img : "/imperium/img/planets/broughton.png" , name : "Broughton" , resources : 1 , influence : 0 , bonus : "yellow"  }
    planets['singharta'] 	= { type : "hazardous" , img : "/imperium/img/planets/singharta.png" , name : "Singharta" , resources : 2 , influence : 1 , bonus : ""  }

    planets['nova-klondike'] 	= { type : "cultural" , img : "/imperium/img/planets/nova_klondike.png" , name : "Nova Klondike" , resources : 2 , influence : 1 , bonus : ""  }

    planets['grox-towers'] 	= { type : "hazardous" , img : "/imperium/img/planets/grox_towers.png" , name : "Grox Towers", resources : 1 , influence : 3 , bonus : "red"  }

    planets['gravitys-edge'] 	= { type : "cultural" , img : "/imperium/img/planets/gravitys_edge.png" , name : "Gravity's Edge" , resources : 0 , influence : 2 , bonus : ""  }
    planets['vespar'] 		= { type : "hazardous" , img : "/imperium/img/planets/vespar.png" , name : "Vespar" , resources : 3 , influence : 1 , bonus : ""  }

    planets['craw-populi'] 	= { type : "industrial" , img : "/imperium/img/planets/craw_populi.png" , name : "Craw Populi" , resources : 1 , influence : 1 , bonus : "green"  }
    planets['hopes-lure'] 	= { type : "hazardous" , img : "/imperium/img/planets/hopes_lure.png" , name : "Hope's Lure" , resources : 3 , influence : 1 , bonus : ""  }

    planets['incarth'] 		= { type : "cultural" , img : "/imperium/img/planets/incarth.png" , name : "Incarth" , resources : 2 , influence : 1 , bonus : ""  }

    planets['quandor'] 		= { type : "industrial" , img : "/imperium/img/planets/quandor.png" , name : "Quandor" , resources : 1 , influence : 2 , bonus : ""  }
    planets['quandam'] 		= { type : "cultural" , img : "/imperium/img/planets/quandam.png" , name : "Quandam" , resources : 0 , influence : 3 , bonus : ""  }

    planets['virgil'] 		= { type : "industrial" , img : "/imperium/img/planets/virgil.png" , name : "Virgil" , resources : 2 , influence : 2 , bonus : ""  }

    planets['contouri-i']	= { type : "industrial" , img : "/imperium/img/planets/contouri_i.png" , name : "Contouri I" , resources : 1 , influence : 1 , bonus : "green"  }

    planets['shriva'] 		= { type : "hazardous" , img : "/imperium/img/planets/shriva.png" , name : "Shriva" , resources : 2 , influence : 0 , bonus : ""  }
    planets['vigor'] 		= { type : "cultural" , img : "/imperium/img/planets/vigor.png" , name : "Vigor" , resources : 0 , influence : 3 , bonus : ""  }

    planets['xerxes'] 		= { type : "industrial" , img : "/imperium/img/planets/xerxes.png" , name : "Xerxes" , resources : 1 , influence : 1 , bonus : "blue"  }

    planets['unsulla'] 		= { type : "hazardous" , img : "/imperium/img/planets/unsulla.png" , name : "Unsulla" , resources : 2 , influence : 2 , bonus : ""  }

    planets['panther']		= { type : "industrial" , img : "/imperium/img/planets/panther.png" , name : "Panther" , resources : 1 , influence : 2 , bonus : "yellow"  }


    //
    // homeworlds & diplomatic
    //
    //
    planets['new-byzantium']	= { type : "diplomatic" , img : "/imperium/img/planets/new_byzantium.png" , name : "New Byzantium" , resources : 1 , influence : 6 , bonus : ""  }
    // sol
    planets['terra']		= { type : "diplomatic" , img : "/imperium/img/planets/terra.png" , name : "Terra" , resources : 4 , influence : 2 , bonus : ""  }
    // yin
    planets['sigurds-cradle']	= { type : "diplomatic" , img : "/imperium/img/planets/sigurds_cradle.png" , name : "Sigurd's Cradle" , resources : 4 , influence : 4 , bonus : ""  }
    // muaat
    planets['kroeber']		= { type : "diplomatic" , img : "/imperium/img/planets/kroeber.png" , name : "Kroeber" , resources : 4 , influence : 1 , bonus : ""  }
    // yssaril
    planets['miranda']		= { type : "diplomatic" , img : "/imperium/img/planets/miranda.png" , name : "Miranda" , resources : 2 , influence : 3 , bonus : ""  }
    planets['fischer']		= { type : "diplomatic" , img : "/imperium/img/planets/fischer.png" , name : "Fischer" , resources : 1 , influence : 2 , bonus : ""  }
    // arborec
    planets['som']		= { type : "diplomatic" , img : "/imperium/img/planets/som.png" , name : "Som" , resources : 3 , influence : 2 , bonus : ""  }
    // jolnar
    planets['startide']		= { type : "diplomatic" , img : "/imperium/img/planets/startide.png" , name : "Startide" , resources : 1 , influence : 2 , bonus : ""  }
    planets['evenflow']		= { type : "diplomatic" , img : "/imperium/img/planets/evenflow.png" , name : "Evenflow" , resources : 2 , influence : 3 , bonus : ""  }
    // sardakk
    planets['aandor']		= { type : "diplomatic" , img : "/imperium/img/planets/aandor.png" , name : "Aandor" , resources : 1 , influence : 0 , bonus : ""  }
    planets['brest']		= { type : "diplomatic" , img : "/imperium/img/planets/brest.png" , name : "Brest" , resources : 3 , influence : 1 , bonus : ""  }
    // xxcha
    planets['giants-drink']	= { type : "diplomatic" , img : "/imperium/img/planets/giants_drink.png" , name : "Giant's Drink" , resources : 2 , influence : 3 , bonus : ""  }
    planets['otho']		= { type : "diplomatic" , img : "/imperium/img/planets/otho.png" , name : "Otho" , resources : 1 , influence : 1 , bonus : ""  }
    // hacan
    planets['hiraeth']		= { type : "diplomatic" , img : "/imperium/img/planets/hiraeth.png" , name : "Hiraeth" , resources : 1 , influence : 1 , bonus : ""  }
    planets['quartil']		= { type : "diplomatic" , img : "/imperium/img/planets/quartil.png" , name : "Quartil" , resources : 2 , influence : 0 , bonus : ""  }
    planets['surriel']		= { type : "diplomatic" , img : "/imperium/img/planets/surriel.png" , name : "Surriel" , resources : 0 , influence : 1 , bonus : ""  }


    for (var i in planets) {

      planets[i].exhausted = 0;
      planets[i].locked = 0; // units cannot be placed, produced or landed
      planets[i].owner = -1;
      planets[i].units = [this.totalPlayers]; // array to store units
      planets[i].sector = ""; // "sector43" <--- fleshed in by initialize
      planets[i].tile = ""; // "4_5" <--- fleshed in by initialize
      planets[i].idx = -1; // 0 - n // <--- fleshed in by initialize
      planets[i].planet = ""; // name in planets array
      planets[i].hw = 0;

      for (let j = 0; j < this.totalPlayers; j++) {
        planets[i].units[j] = [];


	if (j == 1) {
//	  planets[i].units[j].push(this.returnUnit("infantry", 1));
//	  planets[i].units[j].push(this.returnUnit("infantry", 1));
//	  planets[i].units[j].push(this.returnUnit("infantry", 1));
//	  planets[i].units[j].push(this.returnUnit("pds", 1));
//	  planets[i].units[j].push(this.returnUnit("pds", 1));
//	  planets[i].units[j].push(this.returnUnit("spacedock", 1));
	}

      }
    }
 
    return planets;
  }
  
  
  
  ////////////////////
  // Return Sectors //
  ////////////////////
  //
  // type 0 - normal
  // type 1 - rift
  // type 2 - nebula
  // type 3 - asteroids
  // type 4 - supernova
  //
  returnSectors() {

    var sectors = {};

    sectors['sector1']         = { img : "/imperium/img/sectors/sector1.png" ,  name : "Crystalis / Troth" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['crystalis','troth'] }
    sectors['sector2']         = { img : "/imperium/img/sectors/sector2.png" ,  name : "Londrak / Citadel" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['londrak','citadel'] }
    sectors['sector3']         = { img : "/imperium/img/sectors/sector3.png" ,  name : "Calthrex / Soundra IV" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['calthrex','soundra-iv'] }
    sectors['sector4']         = { img : "/imperium/img/sectors/sector4.png" ,  name : "Udon" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['udon-i','udon-ii'] }
    sectors['sector5']         = { img : "/imperium/img/sectors/sector5.png" ,  name : "Olympia / Granton Mex" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['olympia','granton-mex'] }
    sectors['sector6']         = { img : "/imperium/img/sectors/sector6.png" ,  name : "New Illia / Siren's End" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['new-illia','sirens-end'] }
    sectors['sector7']         = { img : "/imperium/img/sectors/sector7.png" ,  name : "Lazak's Curse / Riftview" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['lazaks-curse','riftview'] }
    sectors['sector8']         = { img : "/imperium/img/sectors/sector8.png" ,  name : "Broughton / Singharta" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['broughton','singharta'] }
    sectors['sector9']         = { img : "/imperium/img/sectors/sector9.png" ,  name : "Nova Klondike" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['nova-klondike'] }
    sectors['sector10']        = { img : "/imperium/img/sectors/sector10.png" , name : "Grox Towers" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['grox-towers'] }
    sectors['sector11']        = { img : "/imperium/img/sectors/sector11.png" , name : "Gravity's Edge / Vespar" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['gravitys-edge','vespar'] }
    sectors['sector12']        = { img : "/imperium/img/sectors/sector12.png" , name : "Craw Populi / Hope's Lure" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['craw-populi','hopes-lure'] }
    sectors['sector13']        = { img : "/imperium/img/sectors/sector13.png" , name : "Incarth" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['incarth'] }
    sectors['sector14']        = { img : "/imperium/img/sectors/sector14.png" , name : "Quandam / Quandor" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['quandam','quandor'] }
    sectors['sector15']        = { img : "/imperium/img/sectors/sector15.png" , name : "Virgil" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['virgil'] }
    sectors['sector16']        = { img : "/imperium/img/sectors/sector16.png" , name : "Contouri" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['contouri-i'] }
    sectors['sector17']        = { img : "/imperium/img/sectors/sector17.png" , name : "Shriva / Vigor" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['shriva','vigor'] }
    sectors['sector18']        = { img : "/imperium/img/sectors/sector18.png" , name : "Xerxes" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['xerxes'] }
    sectors['sector19']        = { img : "/imperium/img/sectors/sector19.png" , name : "Unsulla" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['unsulla'] }
    sectors['sector20']        = { img : "/imperium/img/sectors/sector20.png" , name : "Panther" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : ['panther'] }

    sectors['new-byzantium']   = { img : "/imperium/img/sectors/sector21.png" , name : "New Byzantium" , type : 0 , hw : 0 , wormhole : 0, mr : 1 , planets : ['new-byzantium'] }
    sectors['sector22']        = { img : "/imperium/img/sectors/sector22.png" , name : "Sol Homeworld" , type : 0 , hw : 1 , wormhole : 0 , mr : 0 , planets : ['terra'] }
    sectors['sector23']        = { img : "/imperium/img/sectors/sector23.png" , name : "Yin Homeworld" , type : 0 , hw : 1 , wormhole : 0, mr : 0 , planets : ['sigurds-cradle'] }
    sectors['sector24']        = { img : "/imperium/img/sectors/sector24.png" , name : "Muaat Homeworld" , type : 0 , hw : 1 , wormhole : 0, mr : 0 , planets : ['kroeber'] }
    sectors['sector25']        = { img : "/imperium/img/sectors/sector25.png" , name : "Ysarril Homeworld" , type : 0 , hw : 1 , wormhole : 0, mr : 0 , planets : ['miranda','fischer'] }
    sectors['sector26']        = { img : "/imperium/img/sectors/sector26.png" , name : "Arborec" , type : 0 , hw : 1 , wormhole : 0, mr : 0 , planets : ['som'] }
    sectors['sector27']        = { img : "/imperium/img/sectors/sector27.png" , name : "Jol Nar Homeworld" , type : 0 , hw : 1 , wormhole : 0 , mr : 0 , planets : ['startide','evenflow'] }
    sectors['sector28']        = { img : "/imperium/img/sectors/sector28.png" , name : "Sardaak Homeworld" , type : 0 , hw : 1 , wormhole: 0 , mr : 0 , planets : ['aandor','brest'] } 
    sectors['sector29']        = { img : "/imperium/img/sectors/sector29.png" , name : "XXCha Homeworld" , type : 0 , hw : 1 , wormhole : 0 , mr : 0 , planets : ['giants-drink','otho'] }
    sectors['sector30']        = { img : "/imperium/img/sectors/sector30.png" , name : "Hacan Homeworld" , type : 0 , hw : 1 , wormhole : 0, mr : 0 , planets : ['hiraeth','quartil','surriel'] }

    sectors['sector31']        = { img : "/imperium/img/sectors/sector31.png" ,	name : "Empty Space" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector32']        = { img : "/imperium/img/sectors/sector32.png" ,	name : "Empty Space" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : [] } 
    sectors['sector33']        = { img : "/imperium/img/sectors/sector33.png" ,	name : "Empty Space" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector34']        = { img : "/imperium/img/sectors/sector34.png" ,	name : "Empty Space" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector35']        = { img : "/imperium/img/sectors/sector35.png" ,	name : "Empty Space" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector36']        = { img : "/imperium/img/sectors/sector36.png" ,	name : "Wormhole A" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector37']        = { img : "/imperium/img/sectors/sector37.png" ,	name : "Wormhole B" , type : 0 , hw : 0 , wormhole : 0, mr : 0 , planets : [] } // black hole or rift
    sectors['sector38']        = { img : "/imperium/img/sectors/sector38.png" ,	name : "Gravity Rift" , type : 1 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector39']        = { img : "/imperium/img/sectors/sector39.png" ,	name : "Nebula" , type : 2 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector40']        = { img : "/imperium/img/sectors/sector40.png" , name : "Asteroid Field" , type : 3 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector41']        = { img : "/imperium/img/sectors/sector41.png" , name : "Asteroid Field" , type : 3 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }
    sectors['sector42']        = { img : "/imperium/img/sectors/sector42.png" , name : "Supernova" , type : 4 , hw : 0 , wormhole : 0, mr : 0 , planets : [] }

    for (var i in sectors) {

      sectors[i].units = [this.totalPlayers]; // array to store units
      sectors[i].activated = [this.totalPlayers]; // array to store units
      sectors[i].sector = "";  // sector reference
      sectors[i].tile = "";  // tile on board

      for (let j = 0; j < this.totalPlayers; j++) {
        sectors[i].units[j] = []; // array of united
        sectors[i].activated[j] = 0; // is this activated by the player
      }
      
    }
    return sectors;
  };
  
  
  addWormholesToBoardTiles(tiles) {

    let wormholes = [];

    for (let i in this.game.sectors) {
      if (this.game.sectors[i].wormhole != 0) { wormholes.push(i); }
    }    

    for (let i in tiles) {
      if (this.game.board[i]) {
        let sector = this.game.board[i].tile;
        if (this.game.sectors[sector].wormhole != 0) {
	  for (let z = 0; z < wormholes.length; z++) {

	    //
	    // wormholes are all adjacent
	    //
	    if (this.game.state.wormholes_adjacent || this.game.state.temporary_wormholes_adjacent) {

	      if (wormholes[z] != sector && this.game.sectors[sector].wormhole != 0 && this.game.sectors[wormholes[z]].wormhole != 0) {
	        let tile_with_partner_wormhole = "";
	        for (let b in tiles) {
	          if (this.game.board[b]) {
	            if (this.game.board[b].tile == wormholes[z]) {
	              if (!tiles[i].neighbours.includes(b)) {
	  	        tiles[i].neighbours.push(b);
	  	      }
	            }
	          }
	        }
	      }

	    //
	    // wormholes are not adjacent
	    //
	    } else {

	      if (wormholes[z] != sector && this.game.sectors[sector].wormhole == this.game.sectors[wormholes[z]].wormhole) {
	        let tile_with_partner_wormhole = "";
	        for (let b in tiles) {
	          if (this.game.board[b]) {
	            if (this.game.board[b].tile == wormholes[z]) {
	              if (!tiles[i].neighbours.includes(b)) {
	  	        tiles[i].neighbours.push(b);
	  	      }
	            }
	          }
	        }
	      }
  	    }

  	  }
        }
      }
    }

    return tiles;
  }


  
  returnBoardTiles() {
    var slot = {};
    slot['1_1'] = {
      neighbours: ["1_2", "2_1", "2_2"]
    };
    slot['1_2'] = {
      neighbours: ["1_1", "1_3", "2_2", "2_3"]
    };
    slot['1_3'] = {
      neighbours: ["1_2", "1_4", "2_3", "2_4"]
    };
    slot['1_4'] = {
      neighbours: ["1_3", "2_4", "2_5"]
    };
    slot['2_1'] = {
      neighbours: ["1_1", "2_2", "3_1", "3_2"]
    };
    slot['2_2'] = {
      neighbours: ["1_1", "1_2", "2_1", "2_3", "3_2", "3_3"]
    };
    slot['2_3'] = {
      neighbours: ["1_2", "1_3", "2_2", "2_4", "3_3", "3_4"]
    };
    slot['2_4'] = {
      neighbours: ["1_3", "1_4", "2_3", "2_5", "3_4", "3_5"]
    };
    slot['2_5'] = {
      neighbours: ["1_4", "2_4", "3_5", "3_6"]
    };
    slot['3_1'] = {
      neighbours: ["2_1", "3_2", "4_1", "4_2"]
    };
    slot['3_2'] = {
      neighbours: ["2_1", "2_2", "3_1", "3_3", "4_2", "4_3"]
    };
    slot['3_3'] = {
      neighbours: ["2_2", "2_3", "3_2", "3_4", "4_3", "4_4"]
    };
    slot['3_4'] = {
      neighbours: ["2_3", "2_4", "3_3", "3_5", "4_4", "4_5"]
    };
    slot['3_5'] = {
      neighbours: ["2_4", "3_4", "3_6", "4_5", "4_6"]
    };
    slot['3_6'] = {
      neighbours: ["2_5", "3_5", "4_6", "4_7"]
    };
    slot['4_1'] = {
      neighbours: ["3_1", "4_2", "5_1"]
    };
    slot['4_2'] = {
      neighbours: ["3_1", "3_2", "4_1", "4_3", "5_1", "5_2"]
    };
    slot['4_3'] = {
      neighbours: ["3_2", "3_3", "4_2", "4_4", "5_2", "5_3"]
    };
    slot['4_4'] = {
      neighbours: ["3_3", "3_4", "4_3", "4_5", "5_3", "5_4"]
    };
    slot['4_5'] = {
      neighbours: ["3_4", "3_5", "4_4", "4_6", "5_4", "5_5"]
    };
    slot['4_6'] = {
      neighbours: ["3_5", "3_6", "4_5", "4_7", "5_5", "5_6"]
    };
    slot['4_7'] = {
      neighbours: ["3_6", "4_6", "5_6"]
    };
    slot['5_1'] = {
      neighbours: ["4_1", "4_2", "5_2", "6_1"]
    };
    slot['5_2'] = {
      neighbours: ["4_2", "4_3", "5_1", "5_3", "6_1", "6_2"]
    };
    slot['5_3'] = {
      neighbours: ["4_3", "4_4", "5_2", "5_4", "6_2", "6_3"]
    };
    slot['5_4'] = {
      neighbours: ["4_4", "4_5", "5_3", "5_5", "6_3", "6_4"]
    };
    slot['5_5'] = {
      neighbours: ["4_5", "4_6", "5_4", "5_6", "6_4", "6_5"]
    };
    slot['5_6'] = {
      neighbours: ["4_6", "4_7", "5_5", "6_5"]
    };
    slot['6_1'] = {
      neighbours: ["5_1", "5_2", "6_2", "7_1"]
    };
    slot['6_2'] = {
      neighbours: ["5_2", "5_3", "6_1", "6_3", "7_1", "7_2"]
    };
    slot['6_3'] = {
      neighbours: ["5_3", "5_4", "6_2", "6_4", "7_2", "7_3"]
    };
    slot['6_4'] = {
      neighbours: ["5_4", "5_5", "6_3", "6_5", "7_3", "7_4"]
    };
    slot['6_5'] = {
      neighbours: ["5_5", "5_6", "6_4", "7_4"]
    };
    slot['7_1'] = {
      neighbours: ["6_1", "6_2", "7_2"]
    };
    slot['7_2'] = {
      neighbours: ["6_2", "6_3", "7_1", "7_3"]
    };
    slot['7_3'] = {
      neighbours: ["6_3", "6_4", "7_2", "7_4"]
    };
    slot['7_4'] = {
      neighbours: ["6_4", "6_5", "7_3"]
    };
    return slot;
  }; 
  
  
  



  ///////////////////////////////
  // Return Starting Positions //
  ///////////////////////////////
  returnHomeworldSectors(players = 4) {
    if (players <= 2) {
      return ["1_1", "4_7"];
//
// for testing - place factions in fighting
// position on start.
//
//      return ["1_1", "2_1"];
    }

    if (players <= 3) {
      return ["1_1", "4_7", "7_1"];
    }
  
    if (players <= 4) {
      return ["1_3", "3_1", "5_6", "7_2"];
    }
  
    if (players <= 5) {
      return ["1_3", "3_1", "4_7", "7_1", "7_4"];
    }
    if (players <= 6) {
      return ["1_1", "1_4", "4_1", "4_7", "7_1", "7_7"];
    }
  }; 



