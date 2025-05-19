
  returnSpaceNameForLog() {
    return `<span class="showcard ${card}" id="${card}">${card}</span>`;


  }

  popup(card) {

    let c = null;
    if (!c && this.game.deck[0]) { c = this.game.deck[0].cards[card]; }
    if (!c && this.game.deck[1]) { c = this.game.deck[1].cards[card]; }
    if (!c && this.debaters) { 
      c = this.debaters[card];
      if (c) { return `<span class="showcard ${card}" id="${card}">${c.name}</span>`; }
    }
    if (!c) {
      let x = this.returnDeck();
      if (x[card]) { c = x[card]; }
    }
    if (c) { 
      if (c.name) {
        return `<span class="showcard ${card}" id="${card}">${c.name}</span>`;
      }
    }
    return `<span class="showcard ${card}" id="${card}">${card}</span>`;
  }

  canPlayStrategicRedeployment(faction="allies") {
    if (faction == "allies") {
      if (this.game.state.allies_rounds.length > 0) {
        if (this.game.state.allies_rounds[this.game.state.allies_rounds.length-1] == "sr") {  
  	  return 0;
        }
      }
      return 1;
    } else {
      if (this.game.state.central_rounds.length > 0) {
        if (this.game.state.central_rounds[this.game.state.central_rounds.length-1] == "sr") {  
  	  return 0;
        }
      }
      return 1;
    }
  }

  canPlayReinforcementPoints(faction="allies") {
    if (faction == "allies") {
      if (this.game.state.allies_rounds.length > 0) {
        if (this.game.state.allies_rounds[this.game.state.allies_rounds.length-1] == "rp") {  
  	  return 0;
        }
      }
      return 1;
    } else {
      if (this.game.state.central_rounds.length > 0) {
        if (this.game.state.central_rounds[this.game.state.central_rounds.length-1] == "rp") {  
  	  return 0;
        }
      }
      return 1;
    }
  }


  removeCardFromHand(card) {

    if (card[0] === 'c' && this.game.player == this.returnPlayerOfFaction("central")) {
      if (this.game.deck[0].hand.includes(card)) {
        for (let i = 0; i < this.game.deck[0].hand.length; i++) {
	  if (this.game.deck[0].hand[i] === card) {
	    if (!this.game.deck[0].discards[card]) {
	      this.game.deck[0].discards[card] = this.game.deck[0].cards[card];
	      delete this.game.deck[0].cards[card];
	    }
	    this.game.deck[0].hand.splice(i, 1);
	  }
	}
      }
    }
    if (card[0] === 'a' && this.game.player == this.returnPlayerOfFaction("allies")) {
      if (this.game.deck[1].hand.includes(card)) {
        for (let i = 0; i < this.game.deck[1].hand.length; i++) {
	  if (this.game.deck[1].hand[i] === card) {
	    if (!this.game.deck[1].discards[card]) {
	      this.game.deck[1].discards[card] = this.game.deck[1].cards[card];
	      delete this.game.deck[1].cards[card];
	    }
	    this.game.deck[1].hand.splice(i, 1);
	  }
	}
      }
    }

    if (this.game.deck[1].cards[card]) {
      this.game.deck[1].discards[card] = this.game.deck[1].cards[card];
      delete this.game.deck[1].cards[card];
    }
    if (this.game.deck[1].cards[card]) {
      this.game.deck[1].discards[card] = this.game.deck[1].cards[card];
      delete this.game.deck[1].cards[card];
    }

  }

  removeCardFromGame(card) {

    for (let key in this.game.deck[0].cards) {
      if (key === card) {
        this.game.deck[0].removed[key] = this.game.deck[0].cards[key];
        delete this.game.deck[0].cards[key];
      }
    }
    for (let key in this.game.deck[1].cards) {
      if (key === card) {
        this.game.deck[1].removed[key] = this.game.deck[1].cards[key];
        delete this.game.deck[1].cards[key];
      }
    }

  }

  returnMobilizationDeck(type="all") {
    let deck = {};

    if (type == "allies" || type == "all") {

      deck['ap01'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap01.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army02", "br_corps"], "england");
	  }
	  return 0;
	} ,
      }
	    
      deck['ap02'] = { 
        key : 'blockade',
        img : "cards/card_ap02.svg" ,
        name : "Blockade" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.blockade = 1;
	  return 1;
        } ,
      }

      deck['ap03'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap03.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_army11", "ru_corps"], "russia");
	  }
	  return 0;
	} ,
      }

      deck['ap04'] = { 
        key : 'pleve',
        img : "cards/card_ap04.svg" ,
        name : "Pleve" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "russia") { return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "russia") { return 1; }
	  }
	  return 0;
        } ,
        onEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "russia") { paths_self.game.state.combat.attacker_drm++; return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "russia") { paths_self.game.state.combat.defender_drm++; return 1; }
	  }
	  return 1; 
	} ,
      }

      deck['ap05'] = { 
        key : 'putnik',
        img : "cards/card_ap05.svg" ,
        name : "Putnik" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { 
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "serbia") { return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "serbia") { return 1; }
	  }
	  return 0; 
	} ,
        onEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].country === "serbia") { paths_self.game.state.combat.attacker_drm++; return 1; }
	  }
	  for (let i = 0; i < defender_units.length; i++) {
	    if (defender_units[i].country === "serbia") { paths_self.game.state.combat.defender_drm++; return 1; }
	  }
	  return 1; 
	} ,
      }

      deck['ap06'] = { 
        key : 'withdrawal',
        img : "cards/card_ap06.svg" ,
        name : "Withdrawal" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.withdrawal = 1;
	  paths_self.game.state.combat.withdrawal = 1; 
	  return 1;
	} ,
      }

      deck['ap07'] = { 
        key : 'severeweather',
        img : "cards/card_ap07.svg" ,
        name : "Severe Weather" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  return 1;
	} ,
      }

      deck['ap08'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap08.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_corps", "ru_corps"], "russia");
	  }
	  return 0;
	} ,
      }

      deck['ap09'] = { 
        key : 'moltke',
        img : "cards/card_ap09.svg" ,
        name : "Moltke" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.turn <= 2) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.moltke = 1;
	  return 1;
	} ,
      }

      deck['ap10'] = { 
        key : 'frenchreinforcements',
        img : "cards/card_ap10.svg" ,
        name : "French Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_fr > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_fr\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["fr_army10"], "france");
	  }
	  return 0;
	} ,
      }

      deck['ap11'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap11.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_army09", "ru_army10"], "russia");
	  }
	  return 0;
	} ,
      }

      deck['ap12'] = { 
        key : 'entrench',
        img : "cards/card_ap12.svg" ,
        name : "Entrench" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.entrench == 1) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.entrench = 1;

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {

	    //
	    // get eligible spaces
	    //
    	    let options = paths_self.returnSpacesWithFilter(
      		(key) => {
		  if (paths_self.game.spaces[key].trench > 0) { return 0; }
        	  if (paths_self.game.spaces[key].control == "allies") {
        	    if (paths_self.game.spaces[key].units.length > 0) {
                      if (paths_self.checkSupplyStatus("allies", key)) {
		        return 1;
		      }
		    }
		  }
		} ,
            );

	    //
	    // no placement options
	    //
	    if (options.length == 0) {
	      paths_self.addMove("NOTIFY\tNo Valid Allied Entrenchment Options");
	      paths_self.endTurn();
	      return 0;
	    }

	    //
	    // place a trench
	    //
            paths_self.playerSelectSpaceWithFilter(
              "Add Level 1 Trench Where? ",
              (key) => {
          	if (options.includes(key)) { return 1; }
              },
              (key) => {
		paths_self.updateStatus("processing...");
 		paths_self.addMove("entrench\tallies\t"+key);
 		paths_self.endTurn();
		return 0;
	      },
              null, 
              true
            );
	  }
	  return 0;
	} ,
      }

      deck['ap13'] = { 
        key : 'rapeofbelgium',
        img : "cards/card_ap13.svg" ,
        name : "Rape Of Belgium" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.guns_of_august == 1 && paths_self.game.state.general_records_track.allies_war_status < 4) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.rape_of_belgium = 1;
	  paths_self.displayGeneralRecordsTrack();
	  return 1;
        } ,
      }

deck['ap14'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap14.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,       
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army01", "br_corps"], "england");
	  }
	  return 0;
	} ,
      }
    }
	  
    if (type == "central" || type == "all") {

      deck['cp01'] = { 
        key : 'gunsofaugust',
        img : "cards/card_cp01.svg" ,
        name : "Guns of August" ,
        cc : false ,
	ws : 2 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.turn == 1 && paths_self.game.state.round == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.guns_of_august = 1;
	  paths_self.game.spaces['liege'].fort = -1;
	  paths_self.game.spaces['liege'].control = "central";
	  paths_self.moveUnitToSpacekey("ge_army01", "liege");
	  paths_self.moveUnitToSpacekey("ge_army02", "liege");
	  paths_self.game.spaces['liege'].activated_for_combat = 1;
	  paths_self.game.spaces['koblenz'].activated_for_combat = 1;	    
	  paths_self.game.queue.push("player_play_combat\tcentral");
	  paths_self.displayBoard();
	  paths_self.shakeSpacekey("liege");
	  paths_self.shakeSpacekey("koblenz");

	  return 1;

	} ,
      }

      deck['cp02'] = { 
        key : 'wirelessintercepts',
        img : "cards/card_cp02.svg" ,
        name : "Wireless Intercepts" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.wireless_intercepts = 1;
	  paths_self.game.queue.push("combat_card\tcentral\tcp02");
	  return 1;
	} ,
      }

      deck['cp03'] = { 
        key : 'vonfrancois',
        img : "cards/card_cp03.svg" ,
        name : "Von Francois" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_option = false;
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].country == "germany") { valid_option = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].country != "russia") { valid_option = false; } }
          if (valid_option == true) { return 1; }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_option = false;
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].country == "germany") { valid_option = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].country != "russia") { valid_option = false; } }
          if (valid_option == true) { paths_self.game.state.combat.attacker_drm += 1; }
	  return 1;
	} ,
      }

      deck['cp04'] = { 
        key : 'severeweather',
        img : "cards/card_cp04.svg" ,
        name : "Severe Weather" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      return 1;
	    }
	  }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) { 
	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  if (space.terrain == "mountain") {
	    if ([3,4,7,8,11,12,15,16,19,20].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  if (space.terrain == "swamp") {
	    if ([3,5,7,9,11,13,15,17,19].includes(paths_self.game.state.turn)) { 
	      paths_self.game.state.combat.defender_drm += 2;
	    }
	  }
	  return 1;
	} ,
      }

      deck['cp05'] = { 
        key : 'landwehr',
        img : "cards/card_cp05.svg" ,
        name : "Landwehr" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.queue.push(`rp\tcentral\tcp05`);
	  paths_self.game.queue.push(`landwehr`);
	  return 1;
	} ,
        handleGameLoop : function(paths_self, qe, mv) {
      
          if (mv[0] === "landwehr") {

            paths_self.game.queue.splice(qe, 1);
            let p1 = paths_self.returnPlayerOfFaction("central");

	    let units_to_restore = 2;

	    let loop_fnct = () => {

              paths_self.removeSelectable();
    	      if (units_to_restore > 0) {
    	        //
    	        // players can flip 2 damaged armies back to full strength
    	        //
                paths_self.playerSelectUnitWithFilter(
            	    "Select Unit to Repair / Deploy" ,
          	    filter_fnct ,
          	    execute_fnct ,
          	    null ,
          	    true ,
          	    [{ key : "pass" , value : "pass" }]
                );
	      } else {
        	paths_self.removeSelectable();
        	paths_self.endTurn();
		return 0;
	      }
	    }

    	    let filter_fnct = (spacekey, unit) => {
	       if (paths_self.returnPowerOfUnit(unit) == "allies") { return 0; }
               if (unit.damaged == 1 && unit.destroyed != 1 && unit.army) { return 1; }
	       return 0;
      	    }

	    let execute_fnct = (spacekey, unit_idx) => {
      		paths_self.updateStatus("processing...");
	        if (spacekey === "pass") {
        	  paths_self.removeSelectable();
        	  paths_self.endTurn();
        	  just_stop = 1;
		  units_to_restore = 0;
        	  return 1;
      	        }
        	paths_self.game.spaces[spacekey].units[unit_idx].damaged = 0;
		paths_self.addMove(`NOTIFY\t${paths_self.game.spaces[spacekey].units[unit_idx].name} repaired in ${paths_self.returnSpaceNameForLog(spacekey)}`);
        	paths_self.addMove(`repair\tcentral\t${spacekey}\t${unit_idx}\t${paths_self.game.player}`);
        	paths_self.displaySpace(spacekey);
        	paths_self.shakeSpacekey(spacekey);
		units_to_restore--;
		loop_fnct();
	    } 

	    let count = paths_self.countUnitsWithFilter(filter_fnct);

            if (count == 0) {
	      paths_self.game.queue.push("NOTIFY\tNo eligible units for "+paths_self.popup("cp05"));
	      return 1;
	    }

            if ((count == 1 && units_to_restore >= 1) || (count == 2 && units_to_restore >= 2)) {
    	      let update_filter_fnct = (spacekey, unit) => {
	        if (paths_self.returnPowerOfUnit(unit) == "allies") { return 0; }
                if (unit.damaged == 1 && unit.destroyed != 1) {
		  unit.damaged = 0; paths_self.displaySpace(spacekey);
		  paths_self.updateLog(`${unit.name} repaired in ${paths_self.game.spaces[spacekey].name}`);
        	  paths_self.shakeSpacekey(spacekey);
		}
	        return 1;
	      }
	      // filter function will update now
	      paths_self.countUnitsWithFilter(update_filter_fnct);
	      return 1;
	    }

	    if (paths_self.game.player == p1) {
	      loop_fnct();
	    } else {
	      paths_self.updateStatus("Central Powers playing " + paths_self.popup("cp05"));
	    }
            return 0;
          } 
          
	  return 1;
	}
      }

      deck['cp06'] = { 
        key : 'entrench',
        img : "cards/card_cp06.svg" ,
        name : "Entrench" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.entrench == 1) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) { 

	  paths_self.game.state.events.entrench = 1;

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {

	    //
	    // get eligible spaces
	    //
    	    let options = paths_self.returnSpacesWithFilter(
      		(key) => {
		  if (paths_self.game.spaces[key].trench > 0) { return 0; }
        	  if (paths_self.game.spaces[key].control == "central") {
        	    if (paths_self.game.spaces[key].units.length > 0) {
                      if (paths_self.checkSupplyStatus("central", key)) {
		        return 1;
		      }
		    }
		  }
		} ,
            );

	    //
	    // no placement options
	    //
	    if (options.length == 0) {
	      paths_self.addMove("NOTIFY\tNo Valid Central Entrechment Options");
	      paths_self.endTurn();
	      return 0;
	    }

	    //
	    // place a trench
	    //
            paths_self.playerSelectSpaceWithFilter(
              "Add Level 1 Trench Where? ",
              (key) => {
          	if (options.includes(key)) { return 1; }
              },
              (key) => {
		paths_self.updateStatus("processing...");
 		paths_self.addMove("entrench\tcentral\t"+key);
 		paths_self.endTurn();
		return 0;
	      },
              null, 
              true
            );
	  }

	  return 0;

	} ,
      }

      deck['cp07'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp07.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army09"], "germany");
	  }
	  return 0;
	} ,
      }

      deck['cp08'] = { 
        key : 'racetothesea',
        img : "cards/card_cp08.svg" ,
        name : "Race to the Sea" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.race_to_the_sea = 1; 
	  return 1;
	} ,
      }

      deck['cp09'] = { 
        key : 'reichstagtruce',
        img : "cards/card_cp09.svg" ,
        name : "Reichstag Truce" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.general_records_track.central_war_status > 10) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
          paths_self.game.state.events.reichstag_truce = 1;
	  paths_self.displayGeneralRecordsTrack();
          return 1;
        } ,
      }

      deck['cp10'] = { 
        key : 'sudarmy',
        img : "cards/card_cp10.svg" ,
        name : "Sud Army" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.sudarmy = 1;  
	  return 1;
	} ,
      }

      deck['cp11'] = { 
        key : 'oberost',
        img : "cards/card_cp11.svg" ,
        name : "Oberost" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.oberost = 1;
	  return 1;
	} ,
      }

      deck['cp12'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp12.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps","ge_corps","ge_army10"], "germany");
	  }
	  return 0;
	} ,
      }

      deck['cp13'] = { 
        key : 'falkenhayn',
        img : "cards/card_cp13.svg" ,
        name : "Falkenhayn" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  if (paths_self.game.state.turn >= 3) { return 1; }
	  if (paths_self.game.state.events.moltke == 1) { return 1; }
	  return 0; 
        } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.falkenhayn = 1;
	  return 1;
	} ,
      }

      deck['cp14'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp14.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ah > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ah\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ah_army07","ah_corps","ah_corps"], "austria");
	  }
	  return 0;
	} ,
      }


    }

    for (let key in deck) {
      if (!deck[key].ws) { deck[key].ws = 0; }
    }

    return deck;
  }

  returnLimitedWarDeck(type="all") {

    let deck = {};

    if (type == "allies" || type == "all") {

deck['ap15'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap15.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army04","br_corps"], "england");
	  }
	  return 0;
	} ,
      }

deck['ap16'] = { 
        key : 'romania',
        img : "cards/card_ap16.svg" ,
        name : "Romania" ,
        cc : false ,
	ws : 1 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.convertCountryToPower("romania", "allies");
	  paths_self.game.state.events.romania = true;
	  paths_self.game.state.events.neutral_entry = 1;
	  paths_self.addUnitToSpace("ro_corps", "bucharest");
	  paths_self.addUnitToSpace("ro_corps", "bucharest");
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerPlaceUnitOnBoard("romania", ["ro_corps", "ro_corps", "ro_corps", "ro_corps"], () => {
	      paths_self.addMove("SETVAR\tstate\tneutral_entry\t1");
	      paths_self.endTurn();
	    });
	  } else {
	    paths_self.updateStatus("Romania entering war...");
	  }

          paths_self.displayCustomOverlay({
                text : "Romania joins the Allies" ,
                title : "Romania joins the War!",
                img : "/paths/img/backgrounds/entry/romania-enters-the-war.png",
                msg : "Romanian units added to board...",
                styles : [{ key : "backgroundPosition" , val : "bottom" }],
          });
	  return 0;
	} ,
      }

deck['ap17'] = { 
        key : 'italy',
        img : "cards/card_ap17.svg" ,
        name : "Italy" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.convertCountryToPower("italy", "allies");
          paths_self.addTrench("trent", 1);
          paths_self.addTrench("asiago", 1);
          paths_self.addTrench("maggiore", 1);

	  paths_self.game.state.events.italy = true;
	  paths_self.game.state.neutral_entry = 1;

	  paths_self.addUnitToSpace("it_corps", "arbox");
	  paths_self.addUnitToSpace("it_corps", "arbox");
	  paths_self.addUnitToSpace("it_corps", "arbox");

	  paths_self.addUnitToSpace("it_corps", "turin");

	  paths_self.addUnitToSpace("it_army01", "verona");
	  paths_self.addUnitToSpace("it_army04", "asiago");
	  paths_self.addUnitToSpace("it_army03", "maggiore");
	  paths_self.addUnitToSpace("it_army02", "udine");
	  paths_self.addUnitToSpace("it_corps", "rome");
	  paths_self.addUnitToSpace("it_corps", "taranto");

          paths_self.displayCustomOverlay({
                text : "Italy joins the Allied Powers" ,
                title : "Italy joins the War!",
                img : "/paths/img/backgrounds/entry/italy-enters-the-war.png",
                msg : "Italian units added to board...",
                styles : [{ key : "backgroundPosition" , val : "bottom" }],
          });

	  return 1;
	} ,
      }


deck['ap18'] = { 
        key : 'hurricanebarrage',
        img : "cards/card_ap18.svg" ,
        name : "Hurricane Barrage" ,
        cc : true ,
        ops : 2 ,
        sr : 2 , 
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR") { return 1; }
          }
          return 0;
        } ,
	onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;  
        } ,   
      }

deck['ap19'] = { 
        key : 'airsuperiority',
        img : "cards/card_ap19.svg" ,
        name : "Air Superiority" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR" || attacker_units[i].ckey == "FR") { return 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "BR" || attacker_units[i].ckey == "FR") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;  
        } ,   
      }

deck['ap20'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap20.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["cad_corps", "aus_corps"], "england");
	  }
	  return 0;
	} ,
      }


deck['ap21'] = { 
        key : 'phosgenegas',
        img : "cards/card_ap21.svg" ,
        name : "Phosgene Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "FR") { return 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "FR") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;  
        } ,   
      }

deck['ap22'] = { 
        key : 'italianreinforcements',
        img : "cards/card_ap22.svg" ,
        name : "Italian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.italy && paths_self.game.state.allies_reinforcements_it == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_it\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["it_army05"], "italy");
	  }
	  return 0;
	} ,
      }

deck['ap23'] = { 
        key : 'cloakanddagger',
        img : "cards/card_ap23.svg" ,
        name : "Cloak And Dagger" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.queue.push("cloak_and_dagger");
	  return 1;
	} ,
        handleGameLoop : function(paths_self, qe, mv) {
      
          if (mv[0] === "cloak_and_dagger") {

            paths_self.game.queue.splice(qe, 1);

            let p1 = paths_self.returnPlayerOfFaction("central");
	    if (paths_self.game.player == p1) {
              paths_self.addMove("cloak_and_dagger_results\t"+JSON.stringify(paths_self.game.deck[0].hand));
              paths_self.endTurn();
	    } else {
	      paths_self.updateStatus("opponent revealing hand...");
	    }
            return 0;
          } 
          
          if (mv[0] === "cloak_and_dagger_results") {

            paths_self.game.queue.splice(qe, 1);

	    let hand = JSON.parse(mv[1]);

	    let html = "Central Powers: ";
	    for (let z = 0; z < hand.length; z++) { html += paths_self.popup(hand[z]); }
	    paths_self.updateLog(html);

	    paths_self.game.queue.push("player_play_ops\tallies\tap23\t");

	    return 1;
          } 
          
          return 1;
        }
      }

deck['ap24'] = { 
        key : 'frenchreinforcements',
        img : "cards/card_ap24.svg" ,
        name : "French Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_fr == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_fr\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["fr_army07"], "france");
	  }
	  return 0;
	} ,
      }

deck['ap25'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap25.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_corps", "ru_corps", "ru_army07"], "russia");
	  }
	  return 0;
	} ,
      }

deck['ap26'] = { 
        key : 'lusitania',
        img : "cards/card_ap26.svg" ,
        name : "Lusitania" ,
        cc : false ,
	ws : 2 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.blockade && !paths_self.game.state.events.zimmerman_telegram) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.lusitania = 1;
	  paths_self.displayGeneralRecordsTrack();
	  return 1;
	} ,
      }

deck['ap27'] = { 
        key : 'greatretreat',
        img : "cards/card_ap27.svg" ,
        name : "Great Retreat" ,
        cc : false ,
	ws : 1 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.great_retreat = 1; return 1; } ,
      }


deck['ap28'] = { 
        key : 'landships',
        img : "cards/card_ap28.svg" ,
        name : "Landships" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.landships = 1; return 1; } ,
      }

deck['ap29'] = { 
        key : 'yudenitch',
        img : "cards/card_ap29.svg" ,
        name : "Yudenitch" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {

	  //
	  // near east spaces
	  //
	  let nespaces = ["constantinople","bursa","adapazari","sinope","eskidor","ankara","samsun","giresun","trebizond","sivas","erzingan","kharput","kayseri","konya","rize","erzerum","bitlis","diyarbakir","adana","aleppo","urfa","mardin","potl","grozny","petrovsk","tbilisi","elizabethpol","baku","erivan","kars","batum","eleskirt","van","mosul","kirkuk","dilman","tabriz","hamadan","kermanshah","khorramabad","abwaz","basra","qurna","kut","annasiriya","samawah","baghdad","beirut","damascus","nablus","amman","jerusalem","beersheba","arabia","medina","aqaba","sinai","gaza","cairo","portsaid","alexandria","libya"];

	  //
	  // supplied Russian spaces
	  //
	  let russian_spaces = paths_self.returnSpacekeysByCountry("russia");
	  for (let z = russian_spaces.length-1; z >= 0; z--) {
	    if (!nespaces.includes(russian_spaces[z])) {
	      russian_spaces.splice(z, 1);
	    } else {
	      if (paths_self.game.spaces[russian_spaces[z]].control != "allies") {
	        russian_spaces.splice(z, 1);
	      } else {
	        if (!paths_self.checkSupplyStatus("ru", russian_spaces[z])) {
		  russian_spaces.splice(z, 1);
	        }
	      }
	    }
	  }

	  if (russian_spaces.length == 0) {
	    paths_self.updateLog("No in-supply Russian spaces...");
	    return 1;
	  }

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction("allies")) {
  	    paths_self.playerPlaceUnitInSpacekey(russian_spaces, ["cau_army"], () => {
	      paths_self.endTurn();
	    });
	  } else {
	    paths_self.updateStatus("Russia placing unit...");
	  }       

	  return 0;
	} ,
      }


deck['ap30'] = { 
        key : 'salonika',
        img : "cards/card_ap30.svg" ,
        name : "Salonika" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.salonika = 1;

	  if (paths_self.game.state.events.greece != 1) {
	    paths_self.addUnitToSpace("gr_corps", "florina");
	    paths_self.addUnitToSpace("gr_corps", "athens");
	    paths_self.addUnitToSpace("gr_corps", "larisa");
	  }

	  //
	  // 9.3.3 - rhe play of the Salonika event counts as an SR play for purposes of this rule.
	  //
	  paths_self.game.state.central_rounds[paths_self.game.state.central_rounds.length-1] = "sr";

	  let p = paths_self.returnPlayerOfFaction("allies");
          let just_stop = 0;

	  if (paths_self.game.player == p) {

	    //
	    // count max units movable
	    //
	    let max_units_movable = 3;
	    max_units_movable -= paths_self.game.spaces["salonika"].units.length;
	    if (max_units_movable <= 0) { paths_self.endTurn(); return 0; }

            let loop_fnct = () => {
              if (continue_fnct()) {
        	paths_self.playerSelectUnitWithFilter(
        	  "Select Corps for Salonika?" ,
        	  filter_fnct ,
        	  execute_fnct ,
        	  null ,
        	  true ,
        	  [{ key : "pass" , value : "pass" }]
        	);
      	      }
    	    }

    	    let filter_fnct = (spacekey, unit) => {
	      if (spacekey == "arbox") {
		for (let z = 0; z < paths_self.game.spaces["arbox"].units.length; z++) {
		  if (paths_self.game.spaces["arbox"].units[z].corps) { return 1; }
		}
	      }
	      if (paths_self.game.spaces[spacekey].port.length > 0) { if (unit.corps) { return 1; } }
	      return 0;
	    };

    	    let continue_fnct = () => {
  	      if (just_stop == 1) { return 0; }
	      let count = paths_self.countUnitsWithFilter(filter_fnct);
	      if (count == 0) { return 0; }
	      for (let key in paths_self.game.state.rp[faction]) {
	        if (parseInt(paths_self.game.state.rp[faction][key]) > 0) { return 1; }
	      } 
	      return 0;
	    }

	    let execute_fnct = (spacekey, unit_idx) => {
	      paths_self.updateStatus("processing...");
	      if (spacekey === "pass") {
	        paths_self.removeSelectable();
	        paths_self.endTurn();
	        just_stop = 1;
	        return 1;
	      } 
	      paths_self.moveUnit(spacekey, unit_idx, "salonika");
	      paths_self.prependMove(`move\t${faction}\t${spacekey}\t${unit_idx}\tsalonika\t${paths_self.game.player}`);
	      paths_self.displaySpace(spacekey);
	      paths_self.displaySpace("salonika");
	      loop_fnct();
	    }

	    loop_fnct();

	  } else {
	    paths_self.updateLog("Allies playing Salonika...");
	  }

	  return 0;
	} ,
      }


deck['ap31'] = { 
        key : 'mef',
        img : "cards/card_ap31.svg" ,
        name : "Middle-East Force" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1, 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  if (paths_self.game.state.events.salonika != 1 && paths_self.game.state.events.turkey == 1) { return 1; }
	  return 0; 
	} ,
        onEvent : function(paths_self, faction) {

	  paths_self.game.state.events.mef = 1;
	  paths_self.game.state.events.mef_beachhead = "";

	  if (paths_self.game.player == paths_self.returnPlayerOfFaction("allies")) {
	    let filter_fnct = (spacekey) => {
	      if (paths_self.game.spaces[spacekey].control == "central") { return 0; }
	      if (spacekey == "gallipoli") { return 1; }
	      if (spacekey == "canakale") { return 1; }
	      if (spacekey == "izmir") { return 1; }
	      if (spacekey == "adana") { return 1; }
	      return 0;
	    }
	    let count = paths_self.countUnitsWithFilter(filter_fnct);
	    if (count == 0) {
	      paths_self.addMove("NOTIFY\tNo viable placements for Middle-East Force");
	      paths_self.endTurn();
	      return 0;
	    }

            paths_self.playerSelectSpaceWithFilter(
              "Place MEF Where? " ,
              filter_fnct ,
              (key) => {
		paths_self.updateStatus("processing...");
 		paths_self.addMove("mef_placement\t"+key);
 		paths_self.endTurn();
		return 0;
	      },
              null , 
	      true 
	    );

	    return 0;

	  } else {
	    paths_self.updateStatus("Allies placing MEF...");
	  }	
	  return 0;
	},
      }

deck['ap32'] = { 
        key : 'russianreinforcements',
        img : "cards/card_ap32.svg" ,
        name : "Russian Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_ru == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_ru\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["ru_army12"], "russia");
	  }
	  return 0;
        } ,
      }

deck['ap33'] = { 
        key : 'grandfleet',
        img : "cards/card_ap33.svg" ,
        name : "Grand Fleet" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.event.grand_fleet = 1;
	  if (paths_self.game.state.event.high_seas_fleet > 1) {
	    paths_self.game.state.event.high_seas_fleet = 0;
	  }
	  return 1;
	} ,
      }

deck['ap34'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap34.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_corps", "br_army03", "br_corps"], "england");
	  }
	  return 0;
        } ,
      }
    }

    if (type == "central" || type == "all") {

      deck['cp15'] = { 
        key : 'chlorinegas',
        img : "cards/card_cp15.svg" ,
        name : "Chlorine Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }   
          return 1;
        } , 
      }

  deck['cp16'] = { 
        key : 'limanvonsanders',
        img : "cards/card_cp16.svg" ,
        name : "Liman Von Sanders" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey === "RU") { return 1; }
          } 
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "RU") { 1; }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey === "RU") { paths_self.game.state.combat.attacker_drm++; return 1; }
          } 
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "RU") { paths_self.game.state.combat.defender_drm++; return 1; }
          }
          return 1;
        } ,
      }

  deck['cp17'] = { 
        key : 'matahari',
        img : "cards/card_cp17.svg" ,
        name : "Mata Hari" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
          paths_self.game.queue.push("matahari");
	  return 1;
        } , 
        handleGameLoop : function(paths_self, qe, mv) {
          if (mv[0] === "matahari") {
        
            paths_self.game.queue.splice(qe, 1);
        
            let p1 = paths_self.returnPlayerOfFaction("allies"); 
            if (paths_self.game.player == p1) {
              paths_self.addMove("matahari_results\t"+JSON.stringify(paths_self.game.deck[1].hand));
              paths_self.endTurn();
            } else {
              paths_self.updateStatus("opponent revealing hand...");
            }
            return 0;
          }
          
          if (mv[0] === "matahari_results") {
        
            paths_self.game.queue.splice(qe, 1);

            let hand = JSON.parse(mv[1]);

            let html = "Allied Powers: ";
            for (let z = 0; z < hand.length; z++) { html += paths_self.popup(hand[z]); }
            paths_self.updateLog(html);

            paths_self.game.queue.push("player_play_ops\tcentral\tcp17\t");

            return 1;
          }

          return 1;
        }
      }

  deck['cp18'] = { 
        key : 'fortifiedmachineguns',
        img : "cards/card_cp18.svg" ,
        name : "Fortified Machine Guns" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "GE") { 
	      if (paths_self.game.spaces[paths_self.game.state.combat.key].trench > 0) { return 1; }
            }
          }
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let defender_units = paths_self.returnDefenderUnits();
          for (let i = 0; i < defender_units.length; i++) {
            if (defender_units[i].ckey === "GE") { 
	      if (paths_self.game.spaces[paths_self.game.state.combat.key].trench > 0) { paths_self.game.state.combat.defender_drm++; return 1; }
            }
          }
          return 1;
        } , 
      }

  deck['cp19'] = { 
        key : 'flamethrowers',
        img : "cards/card_cp19.svg" ,
        name : "Flamethrowers" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }   
          return 1;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }   
          return 1;
        } , 
      }


  deck['cp20'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp20.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ah > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ah\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ah_army10"], "austria");
	  }
          return 0;
        } ,
      }

  deck['cp21'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp21.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps","ge_army11"], "germany");
	  }
          return 0;
        } ,
      }

  deck['cp22'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp22.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army12","ge_corps"], "germany");
	  }
          return 0;
        } ,
      }


  deck['cp23'] = { 
        key : 'austria-hungaryreinforcements',
        img : "cards/card_cp23.svg" ,
        name : "Austria-Hungary Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ah > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ah\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ah_army11"], "austria");
	  }
          return 0;
        } ,
      }

  deck['cp24'] = { 
        key : 'libyanrevolts(tureinforcements)',
        img : "cards/card_cp24.svg" ,
        name : "Libyan Revolt (Tu Reinforcements)" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
          paths_self.addUnitToSpace("sn_corps", "libya");
	  paths_self.game.state.events.libyan_revolt = 1;
          return 1;
        } ,
      }

  deck['cp25'] = { 
        key : 'highseasfleet',
        img : "cards/card_cp25.svg" ,
        name : "High Seas Fleet" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.high_seas_fleet = 3; return 1; } ,
      }

deck['cp26'] = { 
        key : 'placeofexecution',
        img : "cards/card_cp26.svg" ,
        name : "Place of Execution" ,
        cc : true ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
	  if (faction == "defender" || faction == "attacker") { if (paths_self.game.state.events.hl_take_command) { return 0; } return 1; }
	  for (let key in paths_self.game.spaces) {
	    if (paths_self.game.spaces[key].country == "france" && paths_self.game.spaces[key].fort > 0) {
	      return 0;
	    }
	  }
	  return 1;
	}  ,
        onEvent : function(paths_self, faction) {
	  //
	  // indicates play as combat card
	  //
	  if (faction == "defender" || faction == "attacker") {
            let attacker_units = paths_self.returnAttackerUnits();
	    if (paths_self.game.spaces[paths_self.game.state.combat.key].fort > 0) {
              for (let i = 0; i < attacker_units.length; i++) {
                if (attacker_units[i].ckey === "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
              }
	    }
	  } else {
	    //
	    // indicates play as event for war status points
	    //
	  }
          return 1;
        } ,
      }

  deck['cp27'] = { 
        key : 'zeppelinraids',
        img : "cards/card_cp27.svg" ,
        name : "Zeppelin Raids" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.zeppelin_raids = 1; return 1; } ,
      }

  deck['cp28'] = { 
        key : 'tsartakescommand',
        img : "cards/card_cp28.svg" ,
        name : "Tsar Takes Command" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.russian_capitulation_track == 3) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.tsar_takes_command = 1;
	  return 1;
	} ,
      }

  deck['cp29'] = { 
        key : '11tharmy',
        img : "cards/card_cp29.svg" ,
        name : "11th Army" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.eleventh_army = 1;
          return 1;
        } ,
      }

deck['cp30'] = { 
        key : 'alpenkorps',
        img : "cards/card_cp30.svg" ,
        name : "Alpenkorps" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].ckey == "GE" && (paths_self.game.spaces[attacker_units[i].spacekey].terrain === "mountain" || paths_self.game.spaces[paths_self.game.state.combat.key].terrain === "mountain")) { return 1; }
	  }
	  return 0; 
	} ,
        onEvent : function(paths_self, faction) {
	  let attacker_units = paths_self.returnAttackerUnits();
	  let defender_units = paths_self.returnDefenderUnits();
	  for (let i = 0; i < attacker_units.length; i++) {
	    if (attacker_units[i].ckey == "GE" && (paths_self.game.spaces[attacker_units[i].spacekey].terrain === "mountain" || paths_self.game.spaces[paths_self.game.state.combat.key].terrain === "mountain")) { paths_self.game.state.combat.attacker_drm++; return 1; }
	  }
	  return 1; 
	} ,
      }

deck['cp31'] = { 
        key : 'kemal',
        img : "cards/card_cp31.svg" ,
        name : "Kemal" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp32'] = { 
        key : 'warinafrica',
        img : "cards/card_cp32.svg" ,
        name : "War in Africa" ,
        cc : false ,
	ws : 1 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 

	  if (paths_self.returnPlayerOfFaction("allies") == paths_self.game.player) {

    	    let filter_fnct = (spacekey, unit) => {
	      if (spacekey == "aeubox") { return 0; }
	      if (unit.army && unit.damaged == 0 && unit.ckey == "BR") { return 1; }
	    }
    	    let filter_fnct2 = (spacekey, unit) => {
	      if (spacekey == "aeubox") { return 0; }
	      if (unit.army && unit.damaged == 0 && unit.ckey == "BR") { return 0; }
	    }

	    let execute_fnct = (spacekey, unit_idx) => {
	      paths_self.updateStatus("processing...");
	      if (spacekey === "pass") {
	        paths_self.removeSelectable();
	        paths_self.endTurn();
	        return 1;
	      }
	      paths_self.addMove(`eliminate\t${spacekey}\t${unit_idx}`);
	      paths_self.endTurn();
	      return 1;
	    }

	    //
	    //
	    //
	    let count = paths_self.countUnitsWithFilter(filter_fnct);
	    if (count == 0) {
	      filter_fnct = filter_fnct2;
	      count = paths_self.countUnitsWithFilter(filter_fnct);
	    }
	    if (count == 0) {
	      return 0;
	    }

	    //
	    // should they remove 
	    //
    	    let html = `<ul>`;
    	    html    += `<li class="card" id="remove">remove BR corps</li>`;
    	    html    += `<li class="card" id="vp">cede +1 VP</li>`;
    	    html    += `</ul>`; 

    	    this.updateStatusWithOptions(`War in Africa!`, html);
    	    this.attachCardboxEvents((action) => {
    
      	      if (action === "remove") {
                paths_self.playerSelectUnitWithFilter(
          	  "Select BR Army to Remove" ,
        	  filter_fnct2 ,
        	  execute_fnct ,
        	  null ,
        	  true ,
        	  [{ key : "pass" , value : "pass" }]
                );

    	        return;
    	      }

    	      if (action === "vp") {
	        paths_self.addMove("SETVAR\tstate\tevents\twar_in_africa_vp\t1");
	        paths_self.endTurn();
    	      }
 
    	    });

	  } else {
	    paths_self.updateStatus("Allies playing War in Africa");
	  }

	  return 0;
	} ,
      }

deck['cp33'] = { 
        key : 'walterrathenau',
        img : "cards/card_cp33.svg" ,
        name : "Walter Rathenau" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.walter_rathenau = 1;
	}
      }
   deck['cp34'] = { 
        key : 'bulgaria',
        img : "cards/card_cp34.svg" ,
        name : "Bulgaria" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.convertCountryToPower("bulgaria", "central");
	  paths_self.game.state.events.neutral_entry = 1;
	  paths_self.game.state.events.romania = true;
	  paths_self.addUnitToSpace("bu_corps", "sofia");
	  paths_self.addUnitToSpace("bu_corps", "sofia");
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerPlaceUnitOnBoard("romania", ["bu_corps", "bu_corps", "bu_corps", "bu_corps"], () => {
	      paths_self.addMove("SETVAR\tstate\tneutral_entry\t1");
	      paths_self.endTurn();
	    });
	  } else {
	    paths_self.updateStatus("Bulgaria entering war...");
	  }

          paths_self.displayCustomOverlay({
                text : "Bulgaria joins the Central Powers" ,
                title : "Bulgaria joins the War!",
                img : "/paths/img/backgrounds/entry/bulgaria-enters-the-war.png",
                msg : "Bulgarian units added to board...",
                styles : [{ key : "backgroundPosition" , val : "bottom" }],
          });

	  return 0;
	} ,
      }


    }
    return deck;
  }

  returnTotalWarDeck(type="all") {
    let deck = {};

    if (type == "allies" || type == "all") {

deck['ap35'] = { 
        key : 'yanksandtanks',
        img : "cards/card_ap35.svg" ,
        name : "Yanks And Tanks" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.queue.push("player_play_ops\tallies\tap35\t");
	  paths_self.game.state.events.yanks_and_tanks = 1;
	  return 1;

	} ,
      }

deck['ap36'] = { 
        key : 'mineattack',
        img : "cards/card_ap36.svg" ,
        name : "Mine Attack" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.mine_attack != 1) { 

	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  let valid_defender = 0;
	  let valid_attacker = 0;

	  if (space.trench > 0) {
	    let attacker_units = paths_self.returnAttackerUnits();
	    for (let i = 0; i < attacker_units.length; i++) {
	      if (attacker_units[i].ckey == "BR") { return 1; }
	    }
	  }

	} return 0; } ,
        onEvent : function(paths_self, faction) {

	  if (paths_self.game.state.events.mine_attack == 1) { return 1; }
	  paths_self.game.state.events.mine_attack = 1; // already used this turn

	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];
	  let valid_defender = 0;
	  let valid_attacker = 0;

	  if (space.trench > 0) {
	    let attacker_units = paths_self.returnAttackerUnits();
	    for (let i = 0; i < attacker_units.length; i++) {
	      if (attacker_units[i].ckey == "BR") { paths_self.game.state.combat.attacker_drm++; return 1; }
	    }
	  }

	  return 1;

	} ,
      }

deck['ap37'] = { 
        key : 'independentairforce',
        img : "cards/card_ap37.svg" ,
        name : "Independent Air Force" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.independent_air_force = 1;
	  return 1;
	} ,
      }

deck['ap38'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap38.svg" ,
        name : "USA Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.over_there == 1) { return 1; } return 0;  } ,
        onEvent : function(paths_self, faction) { return 1; 
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_us\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["us_corps"], "usa");
	  }
	  return 0;
	} ,
      }

deck['ap39'] = { 
        key : 'theyshallnotpass',
        img : "cards/card_ap39.svg" ,
        name : "They Shall Not Pass" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.they_shall_not_pass = 1; return 1; } ,
      }

deck['ap40'] = { 
        key : '14points',
        img : "cards/card_ap40.svg" ,
        name : "14 Points" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.fourteen_points = 1;
	  return 1;
	} ,
      }

deck['ap41'] = { 
        key : 'arabnorthernarmy',
        img : "cards/card_ap41.svg" ,
        name : "Arab Northern Army" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.turkey == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  let options = [];
	  for (let key in paths_self.game.spaces) { if (paths_self.game.spaces[key].country == "arabia") { options.push(key); } }
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerAddReinforcements("allies", ["ana_corps"], "england", options);
	  }
	  return 0;
        } ,
      }

deck['ap42'] = { 
        key : 'britishreinforcements',
        img : "cards/card_ap42.svg" ,
        name : "British Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.allies_reinforcements_br > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_br\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["br_army05","br_corps", "pt_corps"], "england");
	  }
	  return 0;
	} ,
      }

deck['ap43'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap43.svg" ,
        name : "USA Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.over_there == 1) { return 1; } return false; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tallies_reinforcements_us\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("allies", ["us_army01","us_corps", "us_corps"], "usa");
	  }
	  return 0;
	} ,
      }

deck['ap44'] = { 
        key : 'greece',
        img : "cards/card_ap44.svg" ,
        name : "Greece" ,
        cc : false ,
	ws : 1 ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.neutral_entry == 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  paths_self.convertCountryToPower("greece", "allies");
	  paths_self.game.state.events.greece = true;
	  paths_self.game.state.neutral_entry = 1;

	  if (paths_self.game.state.events.salonika != 1) {
	    paths_self.addUnitToSpace("gr_corps", "florina");
	    paths_self.addUnitToSpace("gr_corps", "athens");
	    paths_self.addUnitToSpace("gr_corps", "larisa");
	  }

	  return 1;
        } ,
      }

deck['ap45'] = { 
        key : 'kerenskyoffensive',
        img : "cards/card_ap45.svg" ,
        name : "Kerensky Offensive" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.kerensky_offensive = 1;
	  paths_self.game.queue.push("player_play_ops\tallies\tap45\t");
	  return 1;
	} ,
      }

deck['ap46'] = { 
        key : 'brusilovoffensive',
        img : "cards/card_ap46.svg" ,
        name : "Brusilov Offensive" ,
        cc : false ,
	ws : 2 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.brusilov_offensive = 1;
	  paths_self.game.queue.push("player_play_ops\tallies\tap46\t");
	  return 1;
	} ,
      }

deck['ap47'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap47.svg" ,
        name : "USA Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap48'] = { 
        key : 'royaltankcorps',
        img : "cards/card_ap48.svg" ,
        name : "Royal Tank Corps" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.landships == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {

	  let space = paths_self.game.spaces[paths_self.game.state.combat.key];

	  if (space.terrain == "normal" && (space.country == "france" || space.country == "belgium" || space.country == "germany")) {
	    if (paths_self.game.spaces[paths_self.game.state.combat.key].terrain == "normal") {
	      let attacker_units = paths_self.returnAttackerUnits();
	      for (let i = 0; i < attacker_units.length; i++) {
	        if (attacker_units[i].ckey == "BR") { paths_self.game.state.combat.cancel_trench_effects = 1; }
	      }
	    }
	  }
	  return 1; 
	} ,
      }

deck['ap49'] = { 
        key : 'sinaipipeline',
        img : "cards/card_ap49.svg" ,
        name : "Sinai Pipeline" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.sinai_pipeline = 1;
	} ,
      }

deck['ap50'] = { 
        key : 'allenby',
        img : "cards/card_ap50.svg" ,
        name : "Allenby" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.sinai_pipeline == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerAddReinforcements("allies", ["ne_army"], "england", ["alexandria"]);
	  }
          return 0;
	} ,
      }

deck['ap51'] = { 
        key : 'everyoneintobattle',
        img : "cards/card_ap51.svg" ,
        name : "Everyone Into Battle" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) {
	  if (paths_self.game.state.events.blucher == 1 || paths_self.game.state.events.michael == 1 || paths_self.game.state.events.peace_offensive == 1) { return 1; }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.everyone_into_battle = 1;
	  return 1;
	} ,
      }

deck['ap52'] = { 
        key : 'convoy',
        img : "cards/card_ap52.svg" ,
        name : "Convoy" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.convoy = 1;
	  return 1;
	} ,
      }

deck['ap53'] = { 
        key : 'armyoftheorient',
        img : "cards/card_ap53.svg" ,
        name : "Army Of The Orient" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.spaces["salonika"].control == "allies" && paths_self.game.spaces["salonika"].units.length < 3) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.playerAddReinforcements("allies", ["orient_army"], "england", ["salonika"]);
	  }
          return 0;
	} ,
      }

deck['ap54'] = { 
        key : 'zimmermanntelegram',
        img : "cards/card_ap54.svg" ,
        name : "Zimmermann Telegram" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.us_commitment_track == 2) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; 
	  paths_self.game.state.events.zimmerman_telegram = 1;
	  paths_self.game.state.events.usa = 1;
	  paths_self.game.state.us_commitment_track = 3;
	  paths_self.displayUSCommitmentTrack();
	  return 1;
	} ,
      }

deck['ap55'] = { 
        key : 'overthere',
        img : "cards/card_ap55.svg" ,
        name : "Over There" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'A' : 1 , 'BR' : 3 , 'FR' : 3 , 'IT' : 2 , 'RU' : 4 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.zimmerman_telegram == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.over_there = 1;
	  paths_self.game.state.us_commitment_track = 4;
	  paths_self.displayUSCommitmentTrack();
	  return 1;
	} ,
      }

deck['ap56'] = { 
        key : 'paristaxis',
        img : "cards/card_ap56.png" ,
        name : "Paris Taxis" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap57'] = { 
        key : 'russiancavalry',
        img : "cards/card_ap57.png" ,
        name : "Russian Cavalry" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap58'] = { 
        key : 'russianguards',
        img : "cards/card_ap58.png" ,
        name : "Russian Guards" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap59'] = { 
        key : 'alpinetroops',
        img : "cards/card_ap59.png" ,
        name : "Alpine Troops" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 2 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['ap60'] = { 
        key : 'czechlegion',
        img : "cards/card_ap60.png" ,
        name : "Czech Legion" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap61'] = { 
        key : 'maude',
        img : "cards/card_ap61.png" ,
        name : "Maude" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap62'] = { 
        key : 'Thesixtusaffair',
        img : "cards/card_ap62.png" ,
        name : "The Sixtus Affair" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'RU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap63'] = { 
        key : 'backstothewall',
        img : "cards/card_ap63.png" ,
        name : "Backs To The Wall" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap64'] = { 
        key : 'usareinforcements',
        img : "cards/card_ap64.png" ,
        name : "Usa Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'BR' : 1 , 'FR' : 1 , 'IT' : 1 , 'RU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['ap65'] = { 
        key : 'influenza',
        img : "cards/card_ap65.png" ,
        name : "Influenza" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'A' : 1 , 'BR' : 2 , 'FR' : 2 , 'IT' : 1 , 'RU' : 3 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

    }

    if (type == "central" || type == "all") {

   deck['cp35'] = { 
        key : 'mustardgas',
        img : "cards/card_cp35.svg" ,
        name : "Mustard Gas" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }   
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;
        } ,
      }

   deck['cp36'] = { 
        key : 'u-boatsunleashed',
        img : "cards/card_cp36.svg" ,
        name : "U-Boats Unleashed" ,
        cc : false ,
	ws : 2 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.uboats_unleashed = 1;
	  return 1;
	} ,
      }

   deck['cp37'] = { 
        key : 'hoffmann',
        img : "cards/card_cp37.svg" ,
        name : "Hoffmann" ,
        cc : false ,
	ws : 1 ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) { paths_self.game.state.events.hottman = 1; return 1; } ,
      }

   deck['cp38'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp38.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps", "ge_corps"], "germany");
	  }
	  return 0;
	} ,
      }

   deck['cp39'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp39.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 0; } return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_corps", "ge_corps"], "germany");
	  }
	  return 0;
	} ,
      }


   deck['cp40'] = { 
        key : 'airsuperiority',
        img : "cards/card_cp40.svg" ,
        name : "Air Superiority" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { return 1; }
          }   
          return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          for (let i = 0; i < attacker_units.length; i++) {
            if (attacker_units[i].ckey == "GE") { paths_self.game.state.combat.attacker_drm++; return 1; }
          }
          return 1;
        } ,
      }

   deck['cp41'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp41.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army14"], "germany");
	  }
	  return 0;
	} ,
      }

   deck['cp42'] = { 
        key : 'turkishreinforcements',
        img : "cards/card_cp42.svg" ,
        name : "Turkish Reinforcements" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_tu\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["yld_army01"], "turkey");
	  }
	  return 0;
	} ,
      }

   deck['cp43'] = { 
        key : 'vonbelow',
        img : "cards/card_cp43.svg" ,
        name : "Von Below" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_attacker = false;
	  let valid_defender = true; 
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].ckey == "GE") { valid_attacker = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].ckey != "IT") { valid_defender = false; } }
          if (valid_attacker == true && valid_defender == true) {
	    return 1;
	  }
	  return 0;
	} ,
        onEvent : function(paths_self, faction) {
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_attacker = false;
	  let valid_defender = true; 
          for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].ckey == "GE") { valid_attacker = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].ckey != "IT") { valid_defender = false; } }
          if (valid_attacker == true && valid_defender == true) {
	    paths_self.game.state.events.von_below = 1;
	  }
	  return 1;
	} ,
      }

   deck['cp44'] = { 
        key : 'vonhutier',
        img : "cards/card_cp44.svg" ,
        name : "Von Hutier" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { 
          let attacker_units = paths_self.returnAttackerUnits();
          let defender_units = paths_self.returnDefenderUnits();
          let valid_attacker = false;
	  let valid_defender = false;
           for (let i = 0; i < attacker_units.length; i++) { if (attacker_units[i].ckey == "GE") { valid_attacker = true; } }
          for (let i = 0; i < defender_units.length; i++) { if (defender_units[i].ckey == "RU") { valid_defender = true; } }
          if (valid_attacker == true && valid_defender == true) {
	    return 1;
	  }
	  return 0;
        } ,
        onEvent : function(paths_self, faction) { return 1; 
	  paths_self.game.state.events.von_hutier = 1;
	  paths_self.game.queue.push("combat_card\tcentral\tcp44");
	  paths_self.game.state.combat.cancel_trench_effects = 1;
	  return 1;
	} ,
      }


   deck['cp45'] = { 
        key : 'treatyofbrestlitovsk',
        img : "cards/card_cp45.svg" ,
        name : "Treaty of Brest Litovsk" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.bolshevik_revolution == 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.treaty_of_brest_litovsk = 1;
	  return 1;
	} ,
      }


 deck['cp46'] = { 
        key : 'germanreinforcements',
        img : "cards/card_cp46.svg" ,
        name : "German Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.central_reinforcements_ge > 0) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_ge\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["ge_army17","ge_army18"], "germany");
	  }
	  return 0;
	} ,
      }

  deck['cp47'] = { 
        key : 'frenchmutiny',
        img : "cards/card_cp47.svg" ,
        name : "French Mutiny" ,
        cc : false ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp48'] = { 
        key : 'turkishreinforcements',
        img : "cards/card_cp48.svg" ,
        name : "Turkish Reinforcements" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 1; } ,
        onEvent : function(paths_self, faction) {
	  if (paths_self.game.player == paths_self.returnPlayerOfFaction(faction)) {
	    paths_self.addMove("SETVAR\tstate\tcentral_reinforcements_tu\t"+paths_self.game.state.round);
	    paths_self.playerAddReinforcements("central", ["aoi_army"], "turkey");
	  }
	  return 0;
	} ,
      }

deck['cp49'] = { 
        key : 'michael',
        img : "cards/card_cp49.svg" ,
        name : "Michael" ,
        cc : true ,
	ws : 1 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp50'] = { 
        key : 'blucher',
        img : "cards/card_cp50.svg" ,
        name : "Blucher" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp51'] = { 
        key : 'peaceoffensive',
        img : "cards/card_cp51.svg" ,
        name : "Peace Offensive" ,
        cc : true ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.hl_take_command) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp52'] = { 
        key : 'fallofthetsar',
        img : "cards/card_cp52.svg" ,
        name : "Fall of The Tsar" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { if (paths_self.game.state.events.fall_of_the_tsar == 1 && paths_self.game.state.events.bolshevik_revolution != 1) { return 1; } return 0; } ,
        onEvent : function(paths_self, faction) { 
	  paths_self.game.state.events.fall_of_the_tsar = 1;
	  if (!paths_self.game.state.events.romania) {
	    paths_self.game.state.events.fall_of_the_tsar_romania_bonus = 1;
	  }
	return 1; } ,
      }

deck['cp53'] = { 
        key : 'bolshevikrevolution',
        img : "cards/card_cp53.svg" ,
        name : "Bolshevik Revolution" ,
        cc : false ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp54'] = { 
        key : 'h-ltakecommand',
        img : "cards/card_cp54.svg" ,
        name : "H-L Take Command" ,
        cc : false ,
	ws : 2 ,
        ops : 5 ,
        sr : 5 ,        
        rp : { 'AH' : 3 , 'BU' : 1 , 'GE' : 4 , 'TU' : 2 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) {
	  paths_self.game.state.events.hl_take_command = 1;
	  return 1;
	} ,
      }

deck['cp55'] = { 
        key : 'lloydgeorge',
        img : "cards/card_cp55.svg" ,
        name : "Lloyd George" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

/***** OPTIONAL ******
deck['cp56'] = { 
        key : 'withdrawal',
        img : "cards/card_cp56.png" ,
        name : "withdrawal" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp57'] = { 
        key : 'kaisertreu',
        img : "cards/card_cp57.png" ,
        name : "Kaisertreu" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }
deck['cp58'] = { 
        key : 'stavkatimidity',
        img : "cards/card_cp58.png" ,
        name : "Stavka Timidity" ,
        cc : false ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 0; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['cp59'] = { 
        key : 'polishrestoration',
        img : "cards/card_cp59.png" ,
        name : "Polish Restoration" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp60'] = { 
        key : 'turkdetermination',
        img : "cards/card_cp60.png" ,
        name : "turk Determination" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }
deck['cp61'] = { 
        key : 'haig',
        img : "cards/card_cp61.png" ,
        name : "Haig" ,
        cc : false ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['cp62'] = { 
        key : 'achtung:panzer',
        img : "cards/card_cp62.png" ,
        name : "Achtung: Panzer" ,
        cc : true ,
        ops : 2 ,
        sr : 2 ,        
        rp : { 'GE' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp63'] = { 
        key : 'russiandesertions',
        img : "cards/card_cp63.png" ,
        name : "Russian Desertions" ,
        cc : false ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }

deck['cp64'] = { 
        key : 'alberich',
        img : "cards/card_cp64.png" ,
        name : "Alberich" ,
        cc : true ,
        ops : 3 ,
        sr : 4 ,        
        rp : { 'AH' : 1 , 'GE' : 2 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }


deck['cp65'] = { 
        key : 'princemax',
        img : "cards/card_cp65.png" ,
        name : "Prince Max" ,
        cc : false ,
	ws : 3 ,
        ops : 4 ,
        sr : 4 ,        
        rp : { 'AH' : 2 , 'BU' : 1 , 'GE' : 3 , 'TU' : 1 } ,        
        type : "normal" ,
        removeFromDeckAfterPlay : function(paths_self, faction) { return 1; } ,
        canEvent : function(paths_self, faction) { return 0; } ,
        onEvent : function(paths_self, faction) { return 1; } ,
      }
***** OPTIONAL ******/
    }

    return deck;
  }
  returnDeck(type="all") {
    let a = this.returnMobilizationDeck(type);
    let b = this.returnLimitedWarDeck(type);
    let c = this.returnTotalWarDeck(type);
    let d = Object.assign({}, a, b);
    let deck = Object.assign({}, d, c);

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;
  }

