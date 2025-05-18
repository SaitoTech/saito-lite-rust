
  popup(card) {

    let c = null;
    if (!c && this.game.deck[0]) { c = this.game.deck[0].cards[card]; }
    if (!c && this.game.deck[1]) { c = this.game.deck[1].cards[card]; }
    if (!c && this.debaters) { 
      c = this.debaters[card];
      if (c) { return `<span class="showcard ${card}" id="${card}">${c.name}</span>`; }
    }
    if (!c) {
      // catches Here I Stand and other removed cards!
      let x = this.returnDeck(true);
      if (x[card]) { c = x[card]; }
    }
    if (c) { 
      if (c.name) {
        return `<span class="showcard ${card}" id="${card}">${c.name}</span>`;
      }
    }
    return `<span class="showcard ${card}" id="${card}">${card}</span>`;
  }

  returnNewCardsForThisTurn(turn = 1) {

    let deck = this.returnDeck();
    let new_deck = {};

    for (let key in deck) {
      if (key != "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
        if (deck[key].turn === turn) {

	  //
	  // exception for boleyn cards below
	  //
	  if (key != "064" && key != "063" && key != "062") {
	    new_deck[key] = deck[key];
	  }
        }

      }
    }

    //
    // Dissolution of the Monasteries, Pilgrimmage of Grace, Book of Common Prayer added as soon as Boleyn marries Henry
    //
    if (turn < 4 && this.game.state.henry_viii_marital_status >= 2 && this.game.state.henry_viii_boleyn_cards_added != 1) {

      this.game.state.henry_viii_boleyn_cards_added = 1;
      new_deck["064"] = deck["064"];
      new_deck["063"] = deck["063"];
      new_deck["062"] = deck["062"];

    } else {
 
      if (new_deck["064"]) { delete new_deck["064"]; }
      if (new_deck["063"]) { delete new_deck["063"]; }
      if (new_deck["062"]) { delete new_deck["062"]; }

      if (turn == 4 && (this.game.options.scenario === "1532" || this.game.options.scenario === "tournament")) {
	this.game.state.henry_viii_boleyn_cards_added = 1;
        new_deck["064"] = deck["064"];
        new_deck["063"] = deck["063"];
        new_deck["062"] = deck["062"];
      }

      if (turn == 5 && this.game.state.henry_viii_boleyn_cards_added != 1) {
	this.game.state.henry_viii_boleyn_cards_added = 1;
        new_deck["064"] = deck["064"];
        new_deck["063"] = deck["063"];
        new_deck["062"] = deck["062"];
      }

    }

    if (turn >= 6) {
      if (this.game.state.henry_viii_healthy_edward == 1 && this.game.state.henry_viii_edward_added != 1) {
	this.game.state.henry_viii_edward_added = 1;
	new_deck["019"] = deck["019"];
      }
      if (this.game.state.henry_viii_sickly_edward == 1 && this.game.state.henry_viii_edward_added != 1) {
	new_deck["019"] = deck["019"];
	this.game.state.henry_viii_edward_added = 1;
      }
      if (this.game.state.henry_viii_add_elizabeth == 1 && this.game.state.henry_viii_sickly_edward == 0 && this.game.state.henry_viii_healthy_edward == 0 && this.game.state.henry_viii_mary_added != 1) {
	new_deck["021"] = deck["021"];
	this.game.state.henry_viii_mary_i_added = 1;
      }
      if (this.game.state.henry_viii_add_elizabeth == 0 && this.game.state.henry_viii_sickly_edward == 0 && this.game.state.henry_viii_healthy_edward == 0 && this.game.state.henry_viii_mary_added != 1) {
	new_deck["021"] = deck["021"];
	this.game.state.henry_viii_mary_i_added = 1;
      }
      if (this.game.state.henry_viii_mary_added == 1 && this.game.state.henry_viii_add_elizabeth == 1 && this.game.state.henry_viii_elizabeth_added != 1) {
	new_deck["023"] = deck["023"];
	this.game.state.henry_viii_elizabeth_added = 1;
      }
      if (this.game.state.henry_viii_mary_i_added_with_sickly_edward_played == 1 && this.game.state.henry_viii_mary_added_twice != 1) {
	new_deck["021"] = deck["021"];
	this.game.state.henry_viii_mary_added_twice = 1;
      }

    }

    //
    // mary has entered play, but maybe we need to add Elizabeth or Edward
    //
    if (this.game.state.round == (this.game.state.henry_viii_mary_i_added_round+1)) {
      //
      // add elizabeth
      //
      if (this.game.state.henry_viii_elizabeth_added == 1) {
	let deck = this.returnDeck(true);
	new_deck["019"] = deck["019"];
      }

      //
      // re-add Mary (Edward VI won't make it very long)
      //
      if (this.game.state.henry_viii_re_add_mary_to_throne == 1) {
	for (let z = 0 ; z < this.game.state.removed.length; z++) {
	  if (this.game.state.removed[z] == "021") { this.game.state.removed.splice(z, 1); }
	}
	let deck = this.returnDeck(true);
	new_deck["021"] = deck["021"];
      }
    }

    return new_deck;

  }

  returnNewDiplomacyCardsForThisTurn(turn = 1) {

    let deck = this.returnDiplomaticDeck();
    let new_deck = {};

    for (let key in deck) {
      if (deck[key].turn === turn) {
        new_deck[key] = deck[key];
      }
    }

    if (turn == (this.game.state.events.schmalkaldic_league_round+1)) {
        new_deck['213'] = deck['213'];
        new_deck['214'] = deck['214'];
        new_deck['215'] = deck['215'];
        new_deck['216'] = deck['216'];
        new_deck['217'] = deck['217'];
        new_deck['218'] = deck['218'];
        new_deck['219'] = deck['219'];
    }

    return new_deck;

  }

  returnDiplomaticDeck() {

    let deck = {};

    deck['201'] = { 
      img : "cards/HIS-201.svg" , 
      name : "Andrea Doria" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "papacy") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("papacy", "genoa");
	    his_self.updateLog("Papacy allies with Genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tpapacy");
	  }

	}

	if (faction === "protestant") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "france") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("france", "genoa");
	    his_self.updateLog("France allies with Genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tprotestant");
	  }

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "andrea_dorea_placement") {

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (player == his_self.game.player) {
          his_self.playerSelectSpaceWithFilter(

            "Select Genoa Home Space for 4 Regulars",

            function(space) {
              if (space.home == "genoa") { return 1; }
	      return 0;
            },

            function(spacekey) {
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tgenoa\t"+"regular"+"\t"+spacekey);
              his_self.endTurn();
            }, 

	    null, 

	    true

          );
	  } else {
	    his_self.updateStatus("Genoa adding 4 Regulars");
	  }

          return 0;
        }
	return 1;
      }
    }
    deck['202'] = { 
      img : "cards/HIS-202.svg" , 
      name : "French Constable Invades" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.setEnemies("france", "papacy");

	let p = his_self.returnPlayerOfFaction("protestant");
	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select French-Controlled Space for Invasion Force",

            function(space) {
	      if (his_self.isSpaceControlled(space, "france")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("french_constable_invades\t"+spacekey);
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant"+"\t1"); // 1 = overlay
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\tmontmorency");
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null ,

	    true 
          );

          return 0;

	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_constable_invades") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

	  //
	  // 2P game, so france get activated under protestant control
	  //
	  his_self.addMove("set_activated_powers\tprotestant\tfrance");
	  his_self.addMove("declare_war\tpapacy\tfrance");

	  let p = his_self.returnPlayerOfFaction("protestant");

	  if (his_self.game.player == p) {

   	    let msg = "Additional Military Support:";
            let html = '<ul>';
            html += '<li class="option" id="squadron">1 squadron in French home port</li>';
            html += '<li class="option" id="mercenaries">2 more mercenaries in '+his_self.returnSpaceName(spacekey)+'</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");
	      if (action === "squadron") {

                his_self.playerSelectSpaceWithFilter(

                  "Select French Home Port",

                  function(space) {
                    if (space.ports.length > 0 && space.home == "france") {
                      return 1;
                    }
                  },

                  function(spacekey) {
		    his_self.updateStatus("French build squadrons in " + his_self.returnSpaceName(spacekey));
                    his_self.addMove("build\tland\tfrance\t"+"squadron"+"\t"+spacekey);
                    his_self.endTurn();
                  },

		  null ,

		  true

                );
	      }
	      if (action === "mercenaries") {
	        his_self.updateStatus("French add mercenaries in " + his_self.returnSpaceName(spacekey));
                his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
                his_self.endTurn();
	      }

	    });

	  } else {
	    his_self.updateStatus("Protestants playing French Constable Invades.");
	  }

	  return 0;
	}

        return 1;

      },
    }
    deck['203'] = { 
      img : "cards/HIS-203.svg" , 
      name : "Corsair Raid" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	let opponent_faction = "protestant";
	if (faction === "protestant") { opponent_faction = "papacy"; }

	let d1 = his_self.rollDice(6);
	let d2 = his_self.rollDice(6);
	let d3 = his_self.rollDice(6);
	let d4 = his_self.rollDice(6);

	let hits = 0;

	if (d1 >= 5) { hits++; }
	if (d2 >= 5) { hits++; }
	if (d3 >= 5) { hits++; }
	if (d4 >= 5) { hits++; }

	his_self.updateLog(`${his_self.popup('203')} rolls ` + hits + " hits ["+d1+","+d2+","+d3+","+d4+"]");

        if (his_self.game.player == p) {
	  for (let i = hits-1; i >= 0; i--) {
	    his_self.addMove("corsair_raid\t"+opponent_faction+"\t"+(i+1)+"\t"+hits);
	  }
	  his_self.addMove(`NOTIFY\t${his_self.popup('203')} rolls ${hits} hits`);
	  his_self.endTurn();
	}
	
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "corsair_raid") {

	  // faction is victim
	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let total = parseInt(mv[3]);
	  let hit = "hit";

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; hit = "hits"; }
	  if (num == 3) { num = "3rd"; hit = "hits"; }
	  if (num == 4) { num = "4th"; hit = "hits"; }


	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player == player) {

	    let is_squadron_available = false;
	    if (faction === "papacy") {
	      for (let s in his_self.game.spaces) {
	        let space = his_self.game.spaces[s];
	        for (let key in space.units) {
	          if (key === "papacy" || his_self.isAlliedMinorPower(key, "papacy")) {
	  	    for (let i = 0; i < space.units[key].length; i++) {
	  	      if (space.units[key][i].type === "squadron") { is_squadron_available = true; }
	            }
	          }
	        }
	      }
	    }
	    if (faction === "protestant") {
	      for (let s in his_self.game.spaces) {
	        let space = his_self.game.spaces[s];
	        for (let key in space.units) {
	          if (key === "france" || key === "ottoman") {
	  	    for (let i = 0; i < space.units[key].length; i++) {
		      if (space.units[key][i].type === "squadron") { is_squadron_available = true; }
	            }
	          }
	        }
	      }
	    }


 	    let msg = "Corsair Raid: "+num+" of "+total+" "+hit+":";
            let html = '<ul>';
            html += '<li class="option" id="discard">discard card</li>';
	    if (is_squadron_available) {
              html += '<li class="option" id="eliminate">eliminate squadron</li>';
	    }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

  	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action === "eliminate") {

                his_self.playerSelectSpaceOrNavalSpaceWithFilter(

                  `Select Space to Remove Naval Squadron` ,

 	          function(space) {
		    if (faction === "papacy") {
		      for (let key in space.units) {
		        if (key === "papacy" || his_self.isAlliedMinorPower(key, "papacy")) {
		  	  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") { return 1; }
		          }
		        }
		      }
		    }
		    if (faction === "protestant") {
		      for (let key in space.units) {
		        if (key === "france" || key === "ottoman") {
		  	  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") { return 1; }
		          }
		        }
		      }
		    }
	            return 0;
                  },

                  function(spacekey) {

		    let land_or_sea = "land";
		    let space = null;

	            if (his_self.game.navalspaces[spacekey]) {
		      land_or_sea = "sea";
		      space = his_self.game.navalspaces[spacekey];
	            } else {
		      space = his_self.game.spaces[spacekey];
	            }

		    if (faction === "papacy") {
		      for (let key in space.units) {
		        if (key === "papacy" || his_self.isAlliedMinorPower(key, "papacy")) {
		  	  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") {
  	    		      $('.option').off();
			      his_self.updateStatus("Papacy removes squadron");
          	  	      his_self.addMove("remove_unit\t"+land_or_sea+"\t"+key+"\t"+"squadron"+"\t"+spacekey+"\t"+0);
          	  	      his_self.addMove("NOTIFY\tPapacy removes squadron from "+his_self.returnSpaceName(spacekey));
          	  	      his_self.endTurn();
			      return 0;
			    }
		          }
		        }
		      }
		    }

		    if (faction === "protestant") {
		      for (let key in space.units) {
		        if (key === "france" || key === "ottoman") {
			  for (let i = 0; i < space.units[key].length; i++) {
			    if (space.units[key][i].type === "squadron") {
  	    		      $('.option').off();
			      his_self.updateStatus("Protestants remove squadron");
          	  	      his_self.addMove("remove_unit\t"+land_or_sea+"\t"+key+"\t"+"squadron"+"\t"+spacekey+"\t"+0);
          	  	      his_self.addMove("NOTIFY\tProtestant removes squadron from "+his_self.returnSpaceName(spacekey));
          	  	      his_self.endTurn();
			      return 0;
			    }
		          }
		        }
		      }
		    }

  	    	    $('.option').off();
		    his_self.updateStatus("No Squadrons Available to Remove");
	            his_self.addMove("NOTIFY\tNo Squadrons Available to Remove");
		    his_self.endTurn();
		    return 0;
		  },

		  null,

		  true

                );

	      }

	      if (action === "discard") {
		his_self.addMove("discard_random\t"+faction);
          	his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " discards card");
		his_self.endTurn();
	      }

	    });
	  }
	  return 0;
	}
        return 1;
      }
    }
    deck['204'] = { 
      img : "cards/HIS-204.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == p) {

	  let mp = his_self.returnMinorPowers();
	  let ca = [];
	  let cd = [];

	  for (let i = 0; i < mp.length; i++) {
	    if (his_self.canFactionActivateMinorPower(faction, mp[i])) {
	      if (his_self.returnAllyOfMinorPower(mp[i]) != faction) {
	        ca.push(mp[i]);
	      }
	    } else {
	      if (his_self.canFactionDeactivateMinorPower(faction, mp[i])) {
	        cd.push(mp[i]);
	      }
	    }
	  }

	  //
	  // 2P modifications
	  //
          if (faction === "protestant") {
	    if (!cd.includes("genoa") && his_self.returnAllyOfMinorPower("genoa") !== "genoa")  { cd.push("genoa"); }
	    if (!cd.includes("venice") && his_self.returnAllyOfMinorPower("venice") !== "venice")  { cd.push("venice"); }
	    if (!cd.includes("scotland") && his_self.returnAllyOfMinorPower("scotland") !== "scotland")  { cd.push("scotland"); }
	    if (!cd.includes("venice")) { cd.push("venice"); }
	    if (!cd.includes("genoa"))  { cd.push("scotland"); }
	    if (!ca.includes("genoa"))  { ca.push("genoa"); }
	    if (!ca.includes("venice")) { ca.push("venice"); }
	  }

	  let msg = 'Activate or De-activate a Minor Power?';
    	  let html = '<ul>';
	  for (let i = 0; i < ca.length; i++) {
            html += `<li class="option" id="activate_${ca[i]}">activate ${ca[i]}</li>`;
	  }
	  for (let i = 0; i < cd.length; i++) {
            html += `<li class="option" id="deactivate_${cd[i]}">deactivate ${cd[i]}</li>`;
	  }
          html += `<li class="option" id="skip">skip</li>`;
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");

	    if (action === "skip") { his_self.endTurn(); return 0; }
	    let zzt = action.split("_")[1];

	    if (ca.includes(zzt)) {

	      let finished = 0;

	      if (faction === "protestant" && action === "activate_genoa") {
		his_self.addMove("activate_minor_power\thapsburg\tgenoa");
		finished = 1;
	      }
	      if (faction === "protestant" && action === "activate_venice") {
		his_self.addMove("activate_minor_power\thapsburg\tvenice");
		finished = 1;
	      }
	      if (finished == 0) {
	        let x = action.split("_");
	        action = x[1];
		// some cases, same power can be deactivated
		if (x[0] === "deactivate") {
	          his_self.addMove("deactivate_minor_power\t"+his_self.returnAllyOfMinorPower(action)+"\t"+action);
		} else {
	          his_self.addMove("activate_minor_power\t"+faction+"\t"+action);
	        }
	      }

	    } else {
	      his_self.addMove("deactivate_minor_power\t"+his_self.returnAllyOfMinorPower(zzt[1])+"\t"+zzt[1]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['205'] = { 
      img : "cards/HIS-205.svg" , 
      name : "Diplomatic Pressure" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {
	  his_self.game.queue.push("diplomatic_pressure_reveal\tpapacy\tprotestant");
	}

	if (faction === "protestant") {
	  his_self.game.queue.push("diplomatic_pressure_reveal\tprotestant\tpapacy");
	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "diplomatic_pressure_reveal") {

          let faction_taking = mv[1];
          let faction_giving = mv[2];

          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);

          if (his_self.game.player === p2) {
	    if (faction_taking === "protestant") {
              his_self.addMove("diplomatic_pressure_results_protestant\t"+JSON.stringify(his_self.game.deck[1].hand));
	    } else {
              his_self.addMove("diplomatic_pressure_results_papacy\t"+JSON.stringify(his_self.game.deck[1].hand));
	    }
            his_self.endTurn();
          }

          his_self.game.queue.splice(qe, 1);
          return 0;
	}


        if (mv[0] === "diplomatic_pressure_results_papacy") {

          let cards = JSON.parse(mv[1]);

          his_self.game.queue.splice(qe, 1);
	  // also remove protestant card (which is next)
          his_self.game.queue.splice(qe-1, 1);
	
	  if (his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {

   	    let msg = "Choose Protestant Card:";
            let html = '<ul>';
	    for (let i = 0; i < cards.length; i++) {
              html += `<li class="option showcard" id="${cards[i]}">${his_self.game.deck[1].cards[cards[i]].name}</li>`;
	    }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

  	    $('.option').off();
	    $('.option').on('click', function () {
  	      $('.option').off();
              his_self.updateStatus("acknowledge...");
	      let action = $(this).attr("id");
              his_self.addMove("diplomacy_card_event\tprotestant\t"+action);
              his_self.addMove("discard_diplomacy_card\tprotestant\t"+action);
	      // protestant will be dealt another next turn - Jan 24
	      //his_self.addMove("DEAL\t2\t"+(his_self.returnPlayerOfFaction("protestant"))+"\t1");
	      his_self.addMove("NOTIFY\tPapacy selects "+his_self.popup(action));
	      his_self.endTurn();
	    });

  	  } else {
	    salert("Papacy has played Diplomatic Pressure - selecting Protestant card to play");
	  }

          return 0;
        }

        if (mv[0] === "diplomatic_pressure_swap_cards") {

	  let papacy_card = mv[1];
	  let protestant_card = mv[2];

	  if (his_self.returnPlayerOfFaction("papacy") == his_self.game.player) {
	    for (let i = 0; i < his_self.game.deck[1].hand.length; i++) {
	      if (his_self.game.deck[1].hand[i] == papacy_card) {
		his_self.game.deck[1].hand.splice(i, 1);
	      }
	    }
	    his_self.game.deck[1].hand.push(protestant_card);
	  }
	  if (his_self.returnPlayerOfFaction("protestant") == his_self.game.player) {
	    for (let i = 0; i < his_self.game.deck[1].hand.length; i++) {
	      if (his_self.game.deck[1].hand[i] == protestant_card) {
		his_self.game.deck[1].hand.splice(i, 1);
	      }
	    }
	    his_self.game.deck[1].hand.push(papacy_card);
	  }

          his_self.game.queue.splice(qe, 1);

	  return 1;

	}

        if (mv[0] === "diplomatic_pressure_results_protestant") {

          his_self.game.queue.splice(qe, 1);

          let cards = JSON.parse(mv[1]);

 	  let msg = "Papal Card is "+his_self.popup(cards[0]);
          let html = '<ul>';
          html += `<li class="option" id="discard">discard ${his_self.game.deck[1].cards[cards[0]].name}</li>`;
          html += `<li class="option" id="swap">swap ${his_self.game.deck[1].cards[cards[0]].name}</li>`;
    	  html += '</ul>';


	  if (his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {
	    his_self.updateStatus("Protestants playing Diplomatic Pressure");
	    return 0;
	  }

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

  	    $('.option').off();
	    let action = $(this).attr("id");
            his_self.updateStatus("acknowledge...");

	    if (action === "discard") {
	      his_self.addMove("DEAL\t2\t"+(his_self.returnPlayerOfFaction("papacy"))+"\t1");
              his_self.addMove("discard_diplomacy_card\tpapacy\t"+cards[0]);
	      his_self.addMove("NOTIFY\tProtestants discard "+his_self.popup(cards[0]));
	      his_self.endTurn();
	    }

	    if (action === "swap") {
	      his_self.addMove("diplomatic_pressure_swap_cards\t"+cards[0]+"\t"+his_self.game.deck[1].hand[0]);
	      his_self.addMove("NOTIFY\tProtestants swap Diplomacy Cards");
	      his_self.endTurn();
	    }

	  });

          return 0;
	}

        return 1;

      },
    }
    deck['206'] = { 
      img : "cards/HIS-206.svg" , 
      name : "French Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.setEnemies("france", "papacy");

	let p = his_self.returnPlayerOfFaction("protestant");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select French-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "france")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("french_invasion\t"+spacekey);
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant\t1");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
	      if (his_self.game.state.leaders.francis_i) {
                his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\tfrancis-i");
              } else {
		his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\thenry-ii");
              }
	      his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null,

	    true 

          );

	}

        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_invasion") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

	  //
	  // 2P card, so french get activated under protestant control
	  //
	  his_self.addMove("set_activated_powers\tprotestant\tfrance");
	  his_self.addMove("declare_war\tpapacy\tfrance");

	  let player = his_self.returnPlayerOfFaction("protestant");
	  if (his_self.game.player == player) {

 	    let msg = "Choose Option:";
            let html = '<ul>';
            html += '<li class="option" id="squadron">1 squadron in French home port</li>';
            html += '<li class="option" id="mercenaries">2 more mercenaries in '+his_self.returnSpaceName(spacekey)+'</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");
	      if (action === "squadron") {

                his_self.playerSelectSpaceWithFilter(

                  "Select French Home Port",

                  function(space) {
                    if (space.ports.length > 0 && space.home == "france") {
                      return 1;
                    }
                  },

                  function(spacekey) {
		    his_self.updateStatus("French add Squadrons in " + his_self.returnSpaceName(spacekey));
                    his_self.addMove("build\tland\tfrance\t"+"squadron"+"\t"+spacekey);
                    his_self.endTurn();
                  },

		  null,

		  true

                );
	      }
	      if (action === "mercenaries") {
                his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
                his_self.endTurn();
	      }
	    });
	  } else {
	    his_self.updateLog("Protestants playing " + his_self.popup("206"));
	  }
	  return 0;
	}

        return 1;

      },
    }
    deck['207'] = { 
      img : "cards/HIS-207.svg" , 
      name : "Henry Petitions for Divorce" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");
	if (his_self.game.player == p) {

          let msg = his_self.popup("207") + " played for Diplomatic Event";
          let html = '<ul>';
          html += '<li class="option" id="grant">Grant Divorce</li>';
          html += '<li class="option" id="refuse">Refuse Divorce</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let action = $(this).attr("id");
            $('.option').off();

	    if (action === "grant") {

	      his_self.updateStatus("Papacy grants divorce...");
	      his_self.addMove(`NOTIFY\t${his_self.popup("207")} - Papacy grants divorce...`);
	      his_self.addMove("player_call_theological_debate\tpapacy");
	      his_self.addMove("henry_petitions_for_divorce_grant");
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy\t1");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
	      his_self.endTurn();
	    }

	    if (action === "refuse") {
	      his_self.updateStatus("Papacy refuses divorce...");
	      his_self.addMove(`NOTIFY\t${his_self.popup("207")} - Papacy refuses divorce...`);
	      his_self.addMove("henry_petitions_for_divorce_refuse\t3");
	      his_self.addMove("henry_petitions_for_divorce_refuse\t2");
	      his_self.addMove("henry_petitions_for_divorce_refuse\t1");
	      his_self.endTurn();
	    }

	  });
	}

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "henry_petitions_for_divorce_grant") {

          his_self.game.queue.splice(qe, 1);
	  his_self.game.state.events.henry_petitions_for_divorce_grant = 1;

	  let p = his_self.returnPlayerOfFaction("protestant");
	  if (his_self.game.player == p) {

            his_self.playerSelectSpaceWithFilter(

              "Select Hapsburg-Controlled Italian Space" ,

              (space) => {
                if (his_self.isSpaceControlled(space.key, "hapsburg") && space.language === "italian") { return 1; }
		return 0;
	      },

              (spacekey) => {
                his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
	        his_self.addMove(`NOTIFY\tHapsburg recruits 4 mercenaries in ${his_self.returnSpaceName(spacekey)}`);
	        his_self.endTurn();
	      },

    	      null ,

	      true
    
	    );

	  } else {
	    his_self.updateStatus("Protestants selecting Italian space for reinforcements");
	  }

	  return 0;
	}


        if (mv[0] === "henry_petitions_for_divorce_refuse") {

          his_self.game.queue.splice(qe, 1);

	  let num = parseInt(mv[1]);

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; }
	  if (num == 3) { num = "3rd"; }

	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {
            his_self.playerSelectSpaceWithFilter(

              `Select Hapsburg-Controlled Space to add ${num} Regular` ,

              function(space) {
	        if (space.type == "electorate" && his_self.game.state.events.schmalkaldic_league == 0) { return 0; }
                if (his_self.isSpaceControlled(space.key, "hapsburg")) { return 1; }
	        return 0;
              },

              function(spacekey) {
                his_self.addMove("build\tland\thapsburg\tregular\t"+spacekey);
	        his_self.addMove(`NOTIFY\tHapsburg add regular in ${his_self.returnSpaceName(spacekey)}`);
          	his_self.endTurn();
              },

              null, 

	      true

	    );
	  }

	  return 0;
	}
	return 1;
      }
    }
    deck['208'] = { 
      img : "cards/HIS-208.svg" , 
      name : "Knights of St. John" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	his_self.game.queue.push("knights-of-saint-john\t"+faction);
	his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction+"\t1");
        his_self.game.queue.push(`DEAL\t1\t${p}\t1`);

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "knights-of-saint-john") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (player == his_self.game.player) {

            let fhand_idx = his_self.returnFactionHandIdx(player, faction);
            let c = his_self.game.deck[0].fhand[fhand_idx][his_self.game.deck[0].fhand[fhand_idx].length-1];
	    let card = his_self.game.deck[0].cards[c];
	    let ops = card.ops;

	    his_self.addMove("discard\t"+faction+"\t"+c);
	    his_self.addMove("build_saint_peters_with_cp\t"+ops);
	    his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" pulls "+his_self.popup(c)+ " "+ops+" CP");
	    his_self.endTurn();

	  }

	  return 0;
        }

	return 1;	
      }
    }
    deck['209'] = { 
      img : "cards/HIS-209.svg" , 
      name : "Plague" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } , 
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("plague\t"+faction+"\t3");
	his_self.game.queue.push("plague\t"+faction+"\t2");
	his_self.game.queue.push("plague\t"+faction+"\t1");
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "plague") {

	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let player = his_self.returnPlayerOfFaction(faction);
	  let opponent_faction = "protestant";
	  if (faction === "protestant") { opponent_faction = "papacy"; }

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player != player) { return 0; }

	  if (num == 1) { num = "1st"; his_self.game.state.plague_already_removed = []; }
	  if (num == 2) { num = "2nd"; }
	  if (num == 3) { num = "3rd"; }

          his_self.playerSelectSpaceOrNavalSpaceWithFilter(

            `Select Space to Remove ${num} Unit` ,

            function(space) {
	      let anything_here = false;
	      for (let key in space.units) {
		if (space.units[key].length > 1) {
		  if (!his_self.game.state.plague_already_removed.includes(space.key)) {
		    for (let z = 0; z < space.units[key].length; z++) {
		      let u = space.units[key][z];
		      if (u.type === "regular") { return 1; }
		      if (u.type === "mercenary") { return 1; }
		      if (u.type === "cavalry") { return 1; }
		      if (u.type === "corsair") { return 1; }
		      if (u.type === "squadron") { return 1; }
		    }
		  }
		}
	      }
	      return 0;
            },

            function(spacekey) {

	      let land_or_sea = "land";
	      let space = null;

	      if (his_self.game.navalspaces[spacekey]) {
		land_or_sea = "sea";
		space = his_self.game.navalspaces[spacekey];
	      } else {
		space = his_self.game.spaces[spacekey];
	      }
	   
	      if (space == null) {
		alert("ERROR: not sure where you clicked - reload to continue");
		return 1;
	      }
	      
   	      let msg = "Choose Faction to Destroy Unit:";
              let html = '<ul>';
	      let u = 0;
              if (space.units["hapsburg"].length) { u++; html += '<li class="option" id="hapsburg">hapsburgs</li>'; }
              if (space.units["france"].length) { u++; html += '<li class="option" id="france">france</li>'; }
              if (space.units["england"].length) { u++; html += '<li class="option" id="england">england</li>'; }
              if (space.units["papacy"].length) { u++; html += '<li class="option" id="papacy">papacy</li>'; }
              if (space.units["protestant"].length) { u++; html += '<li class="option" id="protestant">protestant</li>'; }
              if (space.units["ottoman"].length) { u++; html += '<li class="option" id="ottoman">ottoman</li>'; }
              if (space.units["hungary"].length) { u++; html += '<li class="option" id="hungary">hungary</li>'; }
              if (space.units["venice"].length) { u++; html += '<li class="option" id="venice">venice</li>'; }
              if (space.units["scotland"].length) { u++; html += '<li class="option" id="scotland">scotland</li>'; }
              if (space.units["genoa"].length) { u++; html += '<li class="option" id="genoa">genoa</li>'; }
              if (space.units["independent"].length) { u++; html += '<li class="option" id="independent">independent</li>'; }
    	      html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

   	      $('.option').off();
	      $('.option').on('click', function () {

   	        $('.option').off();

	        let faction_to_destroy = $(this).attr("id");
   	        let msg = "Destroy Which Unit: ";
                let unittypes = [];
		let unit_destroyed = 0;
                let html = '<ul>';
		let du = -1;
                for (let i = 0; i < space.units[faction_to_destroy].length; i++) {
                  if (space.units[faction_to_destroy][i].command_value == 0) {
		    if (!unittypes.includes(space.units[faction_to_destroy][i].type) &&
		        (space.units[faction_to_destroy][i].type == "regular" ||
		        space.units[faction_to_destroy][i].type == "mercenary" ||
		        space.units[faction_to_destroy][i].type == "squadron" ||
		        space.units[faction_to_destroy][i].type == "corsair" ||
		        space.units[faction_to_destroy][i].type == "cavalry")
		    ) {
		      if (du == -1) { du = i; } else { du = -2; }
  		      html += `<li class="option nonskip" id="${space.units[faction_to_destroy][i].type}">${space.units[faction_to_destroy][i].type}</li>`;
		      unittypes.push(space.units[faction_to_destroy][i].type);
		    }
		  }
		}
  		html += `<li class="option" id="skip">skip</li>`;
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

   	        $('.option').off();
	        $('.option').on('click', function () {

   	          $('.option').off();
	          let unittype = $(this).attr("id");
		  if (unit_destroyed == 1) { return; }	
		  unit_destroyed = 1;

		  if (unittype === "skip") {
          	    his_self.endTurn();
		    return 0;
		  }

          	  his_self.removeUnit(faction_to_destroy, spacekey, unittype);

 	          his_self.game.state.plague_already_removed.push(spacekey);

		  his_self.displaySpace(spacekey);
		  if (num === "3rd") { 
		    his_self.updateStatus("submitted");
		    his_self.addMove("discard_random\t"+opponent_faction);
		  }

          	  his_self.addMove("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	  his_self.endTurn();
		});

		// auto-submit if only 1 choice
		if (du > -1) { $('.nonskip').click(); }

              });

	      // auto-submit if only 1 choice
	      if (u == 1) { $('.option').click(); }

	    },

            null, 

	    true

	  );

          return 0;

	}

	return 1;
      },
    }
    deck['210'] = { 
      img : "cards/HIS-210.svg" , 
      name : "Shipbuilding" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } , 
      onEvent(his_self, faction) {
        his_self.game.queue.push("shipbuilding_diplomacy_event\t"+faction);
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
    
        if (mv[0] == "shipbuilding_diplomacy_event") {
    
          his_self.game.queue.splice(qe, 1);
                        
          let faction = mv[1];
          let player = his_self.returnPlayerOfFaction(faction);
                    
          if (his_self.game.player === player) { 
    
            if (faction === "papacy") {

              //
              // pick port under Papal control
              //
              his_self.playerSelectSpaceWithFilter(

                "Select Space to add 1st Squadron" ,

                  (space) => {
                    if (his_self.isSpaceControlled(space.key, "papacy")) {
		      if (space.ports.length > 0) {
			return 1;
		      }
		    }
		    return 0;
		  },

                  (spacekey) => {

		    let firstspace = spacekey;

              	    //
              	    // pick port under Papal control
              	    //
              	    his_self.playerSelectSpaceWithFilter(

                      "Select Space to add 2nd Squadron" ,

   	              (space) => {
                        if (his_self.isSpaceControlled(space.key, "papacy")) {
		          if (space.ports.length > 0) {
			    return 1;
		          }
		        }
		        return 0;
		      },

                      (spacekey) => {

                        let secondspace = spacekey;
                        his_self.addMove("build\tland\tpapacy\t"+"squadron"+"\t"+firstspace);
                        his_self.addMove("build\tland\tpapacy\t"+"squadron"+"\t"+secondspace);
		        his_self.endTurn();
		      },

		      null ,

		      true
    
		    );

	          },

		  null ,

		  true
    
	      );

            }       
    
            if (faction === "protestant") {
               
	      let squadron_placement_function = (num=1, squadron_placement_function) => {

                let msg = "Add 1st Naval Squadron Where?";
		if (num == 2) { msg = "Add 2nd Naval Squadron Where?"; }

                let html = '<ul>';
                html += '<li class="option" id="french">French - Marseille</li>';
                html += '<li class="option" id="hapsburg">Hapsburg - Naples</li>';
                html += '<li class="option" id="ottoman">Ottoman - any home port</li>';
                html += '<li class="option" id="skip">skip</li>';
                html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

                $('.option').off();
                $('.option').on('click', function () {

                  let action = $(this).attr("id");

		  if (action === "skip") {
		    his_self.endTurn();
		  }

		  if (action === "hapsburg") {
                    his_self.addMove("build\tland\thapsburg\t"+"squadron"+"\tnaples");
		    if (num == 2) { his_self.endTurn(); return; }
		    squadron_placement_function(2);
		  }

		  if (action === "french") {
                    his_self.addMove("build\tland\tfrance\t"+"squadron"+"\tmarseille");
		    if (num == 2) { his_self.endTurn(); return; }
		    squadron_placement_function(2);
		  }

		  if (action === "ottoman") {
                    //
                    // pick any Ottoman home port
                    //
                    his_self.playerSelectSpaceWithFilter(

                      "Select Ottoman-Controlled Home Port" ,

                      (space) => {
                        if (his_self.isSpaceControlled(space.key, "ottoman")) {
		          if (space.ports.length > 0) {
			    return 1;
		          }
		        }
		        return 0;
		      },

                      (spacekey) => {
                        let space = his_self.game.spaces[spacekey];
                        his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
		        if (num == 2) { his_self.endTurn(); return; }
		        squadron_placement_function(2);
		      },

		      null ,

		      true
    
	            );

		  }

                });

              }

	      squadron_placement_function(1, squadron_placement_function);

            }

          }
	  return 0;

	}
	return 1;
      },
    }
    deck['211'] = { 
      img : "cards/HIS-211.svg" , 
      name : "Spanish Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let controlling_power = "papacy";
	let victim_power = "protestant";

	//
	// prior to League formation
	//
	if (his_self.game.state.events.schmalkaldic_league != 1) {
	  controlling_power = "protestant";
	  victim_power = "papacy";
	  his_self.setEnemies("papacy","hapsburg");
	}

	let controlling_player = his_self.returnPlayerOfFaction(controlling_power);

	//
	// remember who controls the invasion
	//
	his_self.game.state.events.spanish_invasion = controlling_power;

	//
	// controlling power gets 1 card
	//
	his_self.game.queue.push("hand_to_fhand\t1\t"+controlling_player+"\t"+controlling_power+"\t1");
        his_self.game.queue.push(`DEAL\t1\t${controlling_player}\t1`);
	his_self.game.queue.push("spanish_invasion_land\t"+controlling_player+"\t"+controlling_power+"\t"+victim_power);

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "spanish_invasion_land") {

          his_self.game.queue.splice(qe, 1);

	  let controlling_player = parseInt(mv[1]);
	  let controlling_power = mv[2];
	  let victim_power = mv[3];

	  if (his_self.game.player === controlling_player) {

  	    //
	    // 2P card, so spanish get activated under protestant control
	    //
	    his_self.addMove("set_activated_powers\t"+controlling_power+"\thapsburg");
	    his_self.addMove("declare_war\t"+victim_power+"\thapsburg");

            his_self.playerSelectSpaceWithFilter(

              "Select Hapsburg-Controlled Space for Invasion Force",

              function(space) {
	        if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	        return 0;
              },

              function(spacekey) {

		his_self.updateStatus("acknowledge...");

	        //
	        // move Duke of Alva, add regulars
	        //
                let ak = his_self.returnSpaceOfPersonage("hapsburg", "duke-of-alva");
                let ak_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "duke-of-alva", ak);
          
                his_self.addMove("spanish_invasion_naval\t"+controlling_player+"\t"+spacekey);
		if (ak_idx == -1) {
                  his_self.addMove("add_army_leader" + "\t" + "hapsburg" + "\t" + spacekey + "\t" + "duke-of-alva");
		} else {
                  his_self.addMove("move" + "\t" + "hapsburg" + "\t" + "land" + "\t" + ak + "\t" + spacekey + "\t" + ak_idx + "\t1");
		}
	        his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
                his_self.endTurn();
              },

	      null,

	      true

            );
	  }

          return 0;

	}
        if (mv[0] == "spanish_invasion_naval") {

          his_self.game.queue.splice(qe, 1);

	  let controlling_player = parseInt(mv[1]);
	  let land_spacekey = mv[2];

	  if (his_self.game.player === controlling_player) {

            let msg = "Add Additional Units:";
            let html = '<ul>';
            html += '<li class="option" id="squadron">Naval Squadron</li>';
            html += '<li class="option" id="mercenaries">+2 Mercenaries</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let action = $(this).attr("id");
              $('.option').off();

	      if (action === "squadron") {

                his_self.playerSelectSpaceWithFilter(

                  "Select Hapsburg-Controlled Port for Squadron",

                  function(space) {
	            if (his_self.isSpaceControlled(space, "hapsburg") && space.home == "hapsburg" && space.ports.length > 0) { return 1; }
	            return 0;
                  },

                  function(spacekey) {
		    his_self.updateStatus("acknowledge...");
                    his_self.addMove("build\tland\thapsburg\t"+"squadron"+"\t"+spacekey);
                    his_self.endTurn();
		  },

		  null ,

		  true
                );
	      }

	      if (action === "mercenaries") {
		his_self.updateStatus("acknowledge...");
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+land_spacekey);
	        his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+land_spacekey);
		his_self.endTurn();
	      }

            });
	  }

	  return 0;

	}

	return 1;
      },
    }
    deck['212'] = { 
      img : "cards/HIS-212.svg" , 
      name : "Venetian Alliance" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { 
	return 1;
      },
      onEvent : function(his_self, faction) {

	let ally = his_self.returnAllyOfMinorPower("venice");

	// papacy is only faction that can activate
	if (ally === "" || ally === "venice") {
	  his_self.activateMinorPower("papacy", "venice");
	}
	if (ally == "france") {
	  his_self.deactivateMinorPower("france", "venice");
	}
	if (ally == "hapsburg") {
	  his_self.deactivateMinorPower("hapsburg", "venice");
	}
        if (ally === "papacy" && faction == "papacy") {
	  his_self.game.queue.push("venetian_alliance_placement");
	}
        if (ally === "papacy" && faction == "ottoman") {
	  his_self.deactivateMinorPower("papacy", "venice");
	}
	his_self.displayWarBox();

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "venetian_alliance_placement") {

          his_self.game.queue.splice(qe, 1);
	  if (his_self.game.player == his_self.returnPlayerOfFaction("papacy")) {  
            his_self.playerSelectSpaceWithFilter(

              "Select Papal-Controlled Port not under Siege",

              function(space) {
	        if (his_self.isSpaceControlled(space, "papacy") && space.ports.length > 0 && !space.besieged) { return 1; }
	        return 0;
              },

              function(spacekey) {
	        his_self.addMove("build\tland\tvenice\t"+"regular"+"\t"+spacekey);
                his_self.addMove("build\tland\tvenice\t"+"squadron"+"\t"+spacekey);
                his_self.addMove("build\tland\tvenice\t"+"squadron"+"\t"+spacekey);
                his_self.endTurn();
              },

	      null,

	      true

            );
            return 0;
          } else {
	    his_self.updateStatus("Papacy executing " + his_self.popup("212"));
	  }

	  return 0;
	}

	return 1;

      },

    }
    deck['213'] = { 
      img : "cards/HIS-213.svg" , 
      name : "Austrian Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; }, 
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Hapsburg-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy"+"\t1");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\thapsburg\t"+spacekey+"\tferdinand");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null,

	    true
          );

	}

        return 0;
      },
    }
    deck['214'] = { 
      img : "cards/HIS-214.svg" , 
      name : "Imperial Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Hapsburg-Controlled Space",

            function(space) {
	      if (his_self.isSpaceControlled(space, "hapsburg")) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy\t1");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\thapsburg\t"+spacekey+"\tcharles-v");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null,

	    true,
          );

	}

        return 0;
      },
    }
    deck['215'] = { 
      img : "cards/HIS-215.svg" , 
      name : "Machiavelli" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let vp = his_self.calculateVictoryPoints();
	let winner = "protestant";

	if (vp["protestant"].vp > vp["papacy"].vp) { winner = "papacy"; }
	if (vp["protestant"].vp == vp["papacy"].vp) { winner = faction; }

	//
	// TODO -- cannot pick an invasion card played earlier this turn
	//
	if (his_self.game.player == his_self.returnPlayerOfFaction(winner)) {

          let msg = "Select Invasion Card:";
          let html = '<ul>';
          html += '<li class="option showcard" id="216">Ottoman Invasion</li>';
          html += '<li class="option showcard" id="214">Imperial Invasion</li>';
          html += '<li class="option showcard" id="213">Austrian Invasion</li>';
          html += '<li class="option showcard" id="211">Spanish Invasion</li>';
          html += '<li class="option showcard" id="206">French Invasion</li>';
          html += '<li class="option showcard" id="202">French Constable Invades</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

	    his_self.updateStatus("acknowledge...");
            let card = $(this).attr("id");
	    his_self.addMove("reshuffle_diplomacy_deck");
	    his_self.addMove("diplomacy_card_event\t"+winner+"\t"+card);
	    his_self.endTurn();

	  });
	} else {
	  his_self.updateStatus("Opponent playing " + his_self.popup("215"));
	}

        return 0;
      },
    }
    deck['216'] = { 
      img : "cards/HIS-216.svg" , 
      name : "Ottoman Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");
	his_self.setEnemies("ottoman", "papacy");

	if (his_self.game.player == p) {

  	  //
	  // 2P card, so ottoman get activated under protestant control
	  //
	  his_self.addMove("set_activated_powers\tprotestant\tottoman");
	  his_self.addMove("declare_war\tpapacy\tottoman");

          his_self.playerSelectSpaceWithFilter(

            `Select Ottoman-Controlled Port for ${his_self.popup("216")}`,

            function(space) {
	      if (his_self.isSpaceControlled(space, "ottoman") && space.ports.length > 0) { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant\t1");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tottoman\t"+spacekey+"\tsuleiman");
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
              his_self.endTurn();
            },

	    null,

	    true 

          );

	}

        return 0;
      },
    }
    deck['217'] = { 
      img : "cards/HIS-217.svg" , 
      name : "Secret Protestant Circle" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");
	let d = his_self.rollDice(6);

	his_self.rollDice("Secret Protestant Circle - rolls: " + d);

	if (d <= 3) {
	  his_self.updateLog("Protestants may flip an Italian and Spanish space");
	  his_self.game.queue.push("secret_protestant_circle\tspanish");
	  his_self.game.queue.push("secret_protestant_circle\titalian");
	} else {
	  his_self.updateLog("Protestants may convert an Italian space");
	  his_self.game.queue.push("secret_protestant_circle\titalian");
	}

        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "secret_protestant_circle") {

	  let zone = mv[1];
	  let player = his_self.returnPlayerOfFaction("protestant");
	  if (player === his_self.game.player) {

            his_self.playerSelectSpaceWithFilter(

              "Select Space to Convert Protestant" ,

              function(space) {
                if (space.language === zone) { return 1; }
	        return 0;
              },

              function(spacekey) {
                his_self.addMove("convert\t"+spacekey+"\tprotestant");
                his_self.endTurn();
              },

	      null,

	      true
            );
	  }
	  
          his_self.game.queue.splice(qe, 1);
          return 0;
        }
	return 1;
      }
    }
    deck['218'] = { 
      img : "cards/HIS-218.svg" , 
      name : "Siege of Vienna" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let lockdown = ["regensburg","salzburg","linz","prague","breslau","brunn","vienna","graz","trieste","agram","pressburg","buda"];
	for (let i = 0; i < lockdown.length; i++) {
	  for (let z = 0; z < his_self.game.spaces[lockdown[i]].units["hapsburg"].length; z++) {
	    his_self.game.spaces[lockdown[i]].units["hapsburg"][z].locked = 1;
	  }
	  for (let z = 0; z < his_self.game.spaces[lockdown[i]].units["hungary"].length; z++) {
	    his_self.game.spaces[lockdown[i]].units["hungary"][z].locked = 1;
	  }
	}

	let spaces = his_self.returnSpacesWithFilter(
          function(spacekey) {
            if (his_self.returnFactionLandUnitsInSpace("hapsburg", spacekey)) { return true; }
            if (his_self.returnFactionLandUnitsInSpace("hungary", spacekey)) { return true; }
	    return false;
	  }
	);

	if (spaces.length >= 2) {
	  his_self.game.queue.push("siege_of_vienna\t"+faction+"\t2");
	}
	if (spaces.length >= 1) {
	  his_self.game.queue.push("siege_of_vienna\t"+faction+"\t1");
	}
	if (spaces.length == 0) {
console.log("Siege of Vienna - no valid spaces");
	}

        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "siege_of_vienna") {

	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let player = his_self.returnPlayerCommandingFaction(faction);

	  let lockdown = ["regensburg","salzburg","linz","prague","breslau","brunn","vienna","graz","trieste","agram","pressburg","buda"];
	  if (player == his_self.game.player) {

 	    let msg = `${his_self.popup("218")}: remove unit #${num}:`;
            let html = '<ul>';
            html += '<li class="option" id="hapsburg">remove hapsburg unit</li>';
            html += '<li class="option" id="hungary">remove hungarian unit</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

   	    $('.option').off();
	    $('.option').on('click', function () {

	      let action = $(this).attr("id");

	      if (action === "hapsburg") {

                let spaces = his_self.returnSpacesWithFilter(
                  function(spacekey) {
	            if (!lockdown.includes(spacekey)) { return false; }
                    if (his_self.returnFactionLandUnitsInSpace("hapsburg", spacekey)) { return true; }
                    return false;
                  } 
                );

	        if (spaces.length == 0) {
	 	  his_self.addMove("NOTIFY\tSiege of Vienna - no units to target.");
	 	  his_self.endTurn();
		  return 0;
	        }

                his_self.playerSelectSpaceWithFilter(

                  "Select Space to Remove Unit" ,

                  function(space) {
console.log("considering: " + space.key);
                    if (spaces.includes(space.key)) { return 1; }
	            return 0;
                  },

                  function(spacekey) {

console.log("selected: " + spacekey);

		    let has_mercenary = false;
		    let has_regular = false;
		    let has_cavalry = false;

		    for (let i = 0; i < his_self.game.spaces[spacekey].units["hapsburg"].length; i++) {
		      if (his_self.game.spaces[spacekey].units["hapsburg"][i].type === "mercenary") { has_mercenary = true; }
		      if (his_self.game.spaces[spacekey].units["hapsburg"][i].type === "regular") { has_regular = true; }
		      if (his_self.game.spaces[spacekey].units["hapsburg"][i].type === "cavalry") { has_cavalry = true; }
		    }

   	            let msg = "Choose Unit to Destroy:";
                    let html = '<ul>';
                    if (has_regular) { html += '<li class="option" id="regular">hapsburg regular</li>'; }
                    if (has_mercenary) { html += '<li class="option" id="mercenary">hapsburg mercenary</li>'; }
                    if (has_cavalry) { html += '<li class="option" id="cavalry">hapsburg cavalry</li>'; }
    	            html += '</ul>';

                    his_self.updateStatusWithOptions(msg, html);

   	            $('.option').off();
	            $('.option').on('click', function () {

		      let unittype = $(this).attr("id");
          	      his_self.removeUnit("hapsburg", spacekey, unittype);
		      his_self.displaySpace(spacekey);
          	      his_self.addMove("remove_unit\tland\thapsburg\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	      his_self.endTurn();
		    });
                  },

		  null, 

		  true
                );

              } // end hapsburg


	      if (action === "hungary") {

                let spaces = his_self.returnSpacesWithFilter(
                  function(spacekey) {
	            if (!lockdown.includes(spacekey)) { return false; }
                    if (his_self.returnFactionLandUnitsInSpace("hungary", spacekey)) { return true; }
                    return false;
                  } 
                );

                his_self.playerSelectSpaceWithFilter(

                  "Select Space to Remove Unit" ,

                  function(space) {
                    if (spaces.includes(space.key)) { return 1; }
	            return 0;
                  },

                  function(spacekey) {

		    let has_mercenary = false;
		    let has_regular = false;
		    let has_cavalry = false;

		    for (let i = 0; i < his_self.game.spaces[spacekey].units["hungary"].length; i++) {
		      if (his_self.game.spaces[spacekey].units["hungary"][i].type === "mercenary") { has_mercenary = true; }
		      if (his_self.game.spaces[spacekey].units["hungary"][i].type === "regular") { has_regular = true; }
		      if (his_self.game.spaces[spacekey].units["hungary"][i].type === "cavalry") { has_cavalry = true; }
		    }

   	            let msg = "Choose Unit to Destroy:";
                    let html = '<ul>';
                    if (has_regular) { html += '<li class="option" id="regular">hungarian regular</li>'; }
                    if (has_mercenary) { html += '<li class="option" id="mercenary">hungarian mercenary</li>'; }
                    if (has_cavalry) { html += '<li class="option" id="cavalry">hungarian cavalry</li>'; }
    	            html += '</ul>';

                    his_self.updateStatusWithOptions(msg, html);

   	            $('.option').off();
	            $('.option').on('click', function () {

		      let unittype = $(this).attr("id");
          	      his_self.removeUnit("hungary", spacekey, unittype);
		      his_self.displaySpace(spacekey);
          	      his_self.addMove("remove_unit\tland\thungary\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	      his_self.endTurn();
		    });
                  },

		  null, 

		  true
                );

              } // end hapsburg
            });

	  } // player

          his_self.game.queue.splice(qe, 1);
          return 0;

	} // siege_of_vienna

	return 1;
      }
    }
    deck['219'] = { 
      img : "cards/HIS-219.svg" , 
      name : "Spanish Inquisition" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {
	  his_self.game.queue.push("spanish_inquisition_reveal");
	}

	if (faction === "protestant") {
	  his_self.game.queue.push("request_reveal_hand\tpapacy\tprotestant");
	  his_self.game.queue.push("NOTIFY\tProtestants play Spanish Inquisition");
   	}

        return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "spanish_inquisition_reveal") {

          if (his_self.game.player === his_self.returnPlayerOfFaction("protestant")) {
            his_self.addMove("spanish_inquisition_results\t"+JSON.stringify(his_self.game.deck[1].hand));
            his_self.endTurn();
          }

          his_self.game.queue.splice(qe, 1);
          return 0;
	}


        if (mv[0] === "spanish_inquisition_results") {

          let cards = JSON.parse(mv[1]);

          his_self.game.queue.splice(qe, 1);
	  // remove protestant play 
          his_self.game.queue.splice(qe-1, 1);

	  if (his_self.game.player === his_self.returnPlayerOfFaction("papacy")) {

   	    let msg = "Choose Protestant Card to Discard:";
            let html = '<ul>';
	    for (let i = 0; i < cards.length; i++) {
              html += `<li class="showcard option" id="${cards[i]}">${his_self.game.deck[1].cards[cards[i]].name}</li>`;
	    }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

  	    $('.option').off();
	    $('.option').on('click', function () {

  	      $('.option').off();
	      let action = $(this).attr("id");

	      let chosen_card = action;
	      let unchosen_card = "";
	      for (let i = 0; i < cards.length; i++) { if (cards[i] != action) { unchosen_card = cards[i]; } }

              his_self.addMove("diplomacy_card_event\tprotestant\t"+unchosen_card);
              his_self.addMove("discard_diplomacy_card\tprotestant\t"+chosen_card);
	      his_self.addMove("DEAL\t2\t"+(his_self.returnPlayerOfFaction("protestant"))+"\t1");
	      his_self.addMove("NOTIFY\tPapacy selects "+his_self.game.deck[1].cards[action].name+" to discard");
	      his_self.endTurn();

	    });

  	  }

          return 0;
        }

        return 1;

      },
    }
    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }


  removeCardFromGame(card) {
    if (!this.game.state.removed.includes(card)) { this.game.state.removed.push(card); }
    try { delete this.game.deck[0].cards[card]; } catch (err) {}
    try { delete this.game.deck[0].discards[card]; } catch (err) {}
  }


  returnDeck(include_removed=false) {

    var deck = {};

    /// HOME CARDS
    deck['001'] = { 
      img : "cards/HIS-001.svg" , 
      name : "Janissaries" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "ottoman" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu === "janissaries" || menu === "janissaries_naval") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
              let f = "ottoman";
              return { faction : f , event : '001', html : `<li class="option" id="001">janissaries (${f})</li>` };
            }
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu === "janissaries") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
	      if (his_self.doesFactionHaveLandUnitsInSpace("ottoman", spacekey)) {
	        his_self.field_battle_overlay.render(his_self.game.state.field_battle);
                return 1;
              }
            }
          }
        }
        if (menu === "janissaries_naval") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
	      if (his_self.doesFactionHaveNavalUnitsInSpace("ottoman", spacekey)) {
	        his_self.naval_battle_overlay.render(his_self.game.state.naval_battle);
                return 1;
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "janissaries") {
	  his_self.addMove("ACKNOWLEDGE\tOttomans play Janissaries");
          his_self.addMove("discard\tottoman\t001");
          his_self.addMove("janissaries");
	  his_self.endTurn();
	  his_self.updateStatus("acknowledge");
        }
        if (menu == "janissaries_naval") {
	  his_self.addMove("ACKNOWLEDGE\tOttomans play Janissaries");
          his_self.addMove("discard\tottoman\t001");
          his_self.addMove("janissaries\tnaval");
	  his_self.endTurn();
	  his_self.updateStatus("acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "janissaries") {

          his_self.game.queue.splice(qe, 1);
	  his_self.updateLog("Ottoman Empire plays "+his_self.popup('001'));

	  if (mv[1]) {
	    if (mv[1] === "naval") {
	      his_self.game.queue.push("add_naval_battle_bonus_rolls\tottoman\t4");
	      return 1;
	    }
	  }
	  his_self.game.queue.push("add_field_battle_bonus_rolls\tottoman\t5\tjanissaries");
	  return 1;
        }

	return 1;

      },
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

        if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

          //
          // add 4 regulars in Ottoman space
          //
          his_self.playerSelectSpaceWithFilter(
                
            "Add 4 regulars in Ottoman Home Space or Foreign War: #1", 
               
            function(space) {
              if (space.political != "" && space.political != "ottoman") { return 0; }
              if (space.key === "oran") { return 0; }
              if (space.key === "algiers") { return 0; }
              if (space.pirate_haven === 1) { return 0; }
              if (space.home == "ottoman") { return 1; }
              if ((space.key == "persia" && his_self.game.state.events.war_in_persia == 1) || (space.key == "egypt" && his_self.game.state.events.revolt_in_egypt == 1)) { return 1; }
	      return 0;
            },

	    function(spacekey) {
	      his_self.addRegular("ottoman", spacekey, 1);
	      his_self.displayBoard(spacekey);
	      his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey+"\t"+his_self.game.player);

	      //
	      // #2
	      //
              his_self.playerSelectSpaceWithFilter(
                
                "Add 4 regulars in Ottoman Home Space or Foreign War: #2",                

                function(space) {
                  if (space.political != "" && space.political != "ottoman") { return 0; }
                  if (space.key === "oran") { return 0; }
                  if (space.key === "algiers") { return 0; }
                  if (space.pirate_haven === 1) { return 0; }
                  if (space.home == "ottoman") { return 1; }
                  if ((space.key == "persia" && his_self.game.state.events.war_in_persia == 1) || (space.key == "egypt" && his_self.game.state.events.revolt_in_egypt == 1)) { return 1; }
	          return 0;
                },

	        function(spacekey) {

	          his_self.addRegular("ottoman", spacekey, 1);
		  his_self.displayBoard(spacekey);
	          his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey+"\t"+his_self.game.player);

	      	  //
	      	  // #3
	          //
                  his_self.playerSelectSpaceWithFilter(
                
                    "Add 4 regulars in Ottoman Home Space or Foreign War: #3",                

                    function(space) {
                      if (space.political != "" && space.political != "ottoman") { return 0; }
                      if (space.key === "oran") { return 0; }
                      if (space.key === "algiers") { return 0; }
                      if (space.pirate_haven === 1) { return 0; }
                      if (space.home == "ottoman") { return 1; }
                      if ((space.key == "persia" && his_self.game.state.events.war_in_persia == 1) || (space.key == "egypt" && his_self.game.state.events.revolt_in_egypt == 1)) { return 1; }
	              return 0;
                    },

	            function(spacekey) {
	              his_self.addRegular("ottoman", spacekey, 1);
		      his_self.displayBoard(spacekey);
	              his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey+"\t"+his_self.game.player);

	              //
	      	      // #3
	              //
                      his_self.playerSelectSpaceWithFilter(
                
                        "Add 4 regulars in Ottoman Home Space or Foreign War: #4",                

                        function(space) {
                          if (space.political != "" && space.political != "ottoman") { return 0; }
                          if (space.key === "oran") { return 0; }
                          if (space.key === "algiers") { return 0; }
                          if (space.pirate_haven === 1) { return 0; }
                          if (space.home == "ottoman") { return 1; }
                          if ((space.key == "persia" && his_self.game.state.events.war_in_persia == 1) || (space.key == "egypt" && his_self.game.state.events.revolt_in_egypt == 1)) { return 1; }
	                  return 0;
                        },
 
	                function(spacekey) {
	                  his_self.addRegular("ottoman", spacekey, 1);
		          his_self.displayBoard(spacekey);
	                  his_self.addMove("build\tland\tottoman\t"+"regular"+"\t"+spacekey+"\t"+his_self.game.player);
			  his_self.endTurn();
		        },

			null, 

		        true

		      );
		    },

		    null, 

		    true

	          );
	        },
	        
	        null,

	        true

	      );
	    },

	    null,

	    true

	  );
	}

	return 0;
      },

    }
    deck['002'] = { 
      img : "cards/HIS-002.svg" , 
      name : "Holy Roman Emperor" ,
      ops : 5 ,
      turn : 1 , 
      type : "normal" ,
      faction : "hapsburg" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	let ck = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	let ck_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "charles-v", ck);
	if (ck_idx == -1) { return 0; }
        if (his_self.isBesieged("hapsburg", "charles-v")) { return 0; }
        if (his_self.isCaptured("hapsburg", "charles-v")) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let ck = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	let ak = his_self.returnSpaceOfPersonage("hapsburg", "duke-of-alva");
	let ck_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "charles-v", ck);
	let ak_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "duke-of-alva", ak);

	if (ck_idx === -1) {
	  his_self.updateLog("Skipping Holy Roman Emperor - Charles V not on board");
	  return 1;
	}

	if (his_self.game.player === his_self.returnPlayerCommandingFaction(faction)) {	

        his_self.playerSelectSpaceWithFilter(

	  "Select Destination for Charles V: ",

	  function(space) {
		if (
		  space.home === "hapsburg" &&
		  his_self.isSpaceControlled(space, "hapsburg") &&
		  !his_self.isSpaceBesieged(space)
	        ) {
		  return 1;
	        }
		return 0;
	  },

	  function(spacekey) {

		if (ak === ck && ak !== "") {

		  let msg = "Move Duke of Alva with Charles V?";
    		  let html = '<ul>';
        	  html += '<li class="option" id="yes">yes</li>';
        	  html += '<li class="option" id="no">no</li>';
    		  html += '</ul>';

    		  his_self.updateStatusWithOptions(msg, html);

	          $('.option').off();
	          $('.option').on('click', function () {

	            let action = $(this).attr("id");
		    his_self.updateStatus("moving...");
		    if (action === "yes") {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      if (ck_idx > ak_idx) {
		        his_self.addMove("move" + "\t" + faction + "\t" + "land" + "\t" + ak + "\t" + spacekey + "\t" + ak_idx + "\t1");
		        his_self.addMove("move" + "\t" + faction + "\t" + "land" + "\t" + ck + "\t" + spacekey + "\t" + ck_idx + "\t1");
		      } else {
		        his_self.addMove("move" + "\t" + faction + "\t" + "land" + "\t" + ck + "\t" + spacekey + "\t" + ck_idx + "\t1");
		        his_self.addMove("move" + "\t" + faction + "\t" + "land" + "\t" + ak + "\t" + spacekey + "\t" + ak_idx + "\t1");
		      }
		      his_self.endTurn();
		    } else {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      his_self.addMove("move" + "\t" + faction + "\t" + "land" + "\t" + ck + "\t" + spacekey + "\t" + ck_idx + "\t1");
		      his_self.endTurn();
		    }
		  });

		} else {
		  his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		  his_self.addMove("move" + "\t" + faction + "\t" + "land" + "\t" + ck + "\t" + spacekey + "\t" + ck_idx + "\t1");
		  his_self.endTurn();
		}

	  },

	  null,

	  true 
	);
	} else {
	  his_self.updateStatus("Hapsburgs playing Home Card");
	}

        return 0;
      },
    }
    deck['003'] = { 
      img : "cards/HIS-003.svg" , 
      name : "Six Wives of Henry VIII" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "england" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("six-wives-of-henry-viii\t"+faction);
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "six-wives-of-henry-viii") {

	    let faction = mv[1];
            his_self.game.queue.splice(qe, 1);

	    let target_haps = false;
	    let target_france = false;
	    let target_scotland = false;

	    let options1 = false;
	    let options2 = false;

	    if (!his_self.areAllies("england", "hapsburg") && !his_self.areEnemies("england", "hapsburg")) { target_haps = true; }
	    if (!his_self.areAllies("england", "scotland") && !his_self.areEnemies("england", "scotland")) { target_scotland = true; }
	    if (!his_self.areAllies("england", "france") && !his_self.areEnemies("england", "france")) { target_france = true; }

	    if (target_haps || target_france || target_scotland) {
	      options1 = true;
	    }

	    if (his_self.game.state.round >= 2 && his_self.game.state.leaders.henry_viii == 1) {
	      if (!his_self.isCaptured("england", "henry-viii") && !his_self.isBesieged("hapsburg", "charles-v")) {
	        options2 = true;
	      }
	    }
	  
	    if (options1 && options2) {

	      if (his_self.game.player == his_self.returnPlayerCommandingFaction("england")) {

                let msg = "Choose an Option: ";
                let html = '<ul>';
                html += `<li class="option" id="war">Declare War</li>`;
                html += `<li class="option" id="marital">Advance Marital Status</li>`;
	        html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);

                $('.option').off();
                $('.option').on('click', function () {
		
                  let action2 = $(this).attr("id");
	          his_self.updateStatus("submitting...");

	          if (action2 === "war") {
	    	    his_self.addMove("henry_viii_declaration_of_war");
		    his_self.endTurn();
	          }
	          if (action2 === "marital") {
	  	    his_self.addMove("display_vp_track");
	  	    his_self.addMove("advance_henry_viii_marital_status");
		    his_self.endTurn();
	          }
	        });

	        return 0;

              }
            } 

	    if (options1) {
	      his_self.game.queue.push("henry_viii_declaration_of_war");
	      return 1;
	    }

	    if (options2) {
	      his_self.game.queue.push("advance_henry_viii_marital_status");
	      return 1;
	    }

	  return 0;
        }

	if (mv[0] === "henry_viii_declaration_of_war") {

	  let target_haps = false;
	  let target_france = false;
	  let target_scotland = false;

	  let options1 = false;
	  let options2 = false;

	  if (!his_self.areAllies("england", "hapsburg") && !his_self.areEnemies("england", "hapsburg")) { target_haps = true; }
	  if (!his_self.areAllies("england", "scotland") && !his_self.areEnemies("england", "scotland")) { target_scotland = true; }
	  if (!his_self.areAllies("england", "france") && !his_self.areEnemies("england", "france")) { target_france = true; }

	  if (his_self.game.player == his_self.returnPlayerCommandingFaction("england")) {

            let msg = "Declare War on Whom?";
            let html = '<ul>';
            if (target_haps) { html += `<li class="option" id="hapsburg">Hapsburg</li>`; }
            if (target_france) { html += `<li class="option" id="france">France</li>`; }
            if (target_scotland) { html += `<li class="option" id="scotland">Scotland</li>`; }
	    html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {
		
              let action2 = $(this).attr("id");
	      his_self.updateStatus("acknowledge");

	      his_self.addMove("ops\tengland\t003\t5");
	      if (action2 === "scotland" && (!his_self.areAllies("england", "scotland") || !his_self.areEnemies("england","france"))) {
	        his_self.addMove("natural_ally_intervention\tfrance\tscotland\tengland\t0\tEngland declares war on Scotland");
	      }	
	      his_self.addMove("unexpected_war\tengland\t"+action2);
	      his_self.addMove("declare_war\tengland\t"+action2+"\t1"); // 1 = skip natural ally intervention
	      his_self.endTurn();

	    });

	  }

          his_self.game.queue.splice(qe, 1);

	  return 0;

	}

        if (mv[0] === "advance_henry_viii_marital_status") {

          his_self.game.queue.splice(qe, 1);
	  let msg = "Henry VIII is pleased with his marital progress...";

	  //
	  // prevents Hapsburg-Papal alliance... or de-activates it as may be
	  //
	  if (his_self.game.state.round == his_self.game.state.henry_viii_pope_approves_divorce_round) {
	    if (his_self.areAllies("papacy", "hapsburg")) {
	      his_self.unsetAllies("papacy", "hapsburg");
	    }
	  }

	  //
	  // Henry VIII already dead, cannot roll
	  //
	  if (his_self.game.state.leaders.mary_i == 1 || his_self.game.state.leaders.edward_vi == 1 || his_self.game.state.leaders.elizabeth_i == 1) {
	    return 1;
	  }

	  his_self.game.state.henry_viii_marital_status++;
	  if (!his_self.game.state.henry_viii_wives) { his_self.game.state.henry_viii_wives = []; }

	  if (his_self.game.state.henry_viii_marital_status == 1) {
	    his_self.updateLog("Henry VIII requests a divorce...");
	  }
	  if (his_self.game.state.henry_viii_marital_status == 2) {
	    his_self.game.state.henry_viii_wives.push("boleyn");
	    his_self.updateLog("Henry VIII marries Anne Boleyn");
	  }
	  if (his_self.game.state.henry_viii_marital_status == 3) {
	    his_self.game.state.henry_viii_wives.push("seymour");
	    his_self.updateLog("Henry VIII marries Jane Seymour");
	  }
	  if (his_self.game.state.henry_viii_marital_status == 4) {
	    his_self.game.state.henry_viii_wives.push("cleves");
	    his_self.updateLog("Henry VIII marries Anne of Cleves");

	    if (his_self.areAllies("england", "protestant")) {
	      let pp = his_self.returnPlayerOfFaction("protestant");
	      let pe = his_self.returnPlayerOfFaction("england");

              his_self.game.queue.push("cards_left\tprotestant\t"+(parseInt(his_self.game.state.cards_left["protestant"])+1));
              his_self.game.queue.push('hand_to_fhand\t1\t' + pp + '\t' + "protestant" + "\t1");
              his_self.game.queue.push("DEAL\t1\t"+pp+"\t1");

              his_self.game.queue.push("cards_left\tengland\t"+(parseInt(his_self.game.state.cards_left["england"])+1));
              his_self.game.queue.push('hand_to_fhand\t1\t' + pe + '\t' + "england" + "\t1");
              his_self.game.queue.push("DEAL\t1\t"+pe+"\t1");
	    }

	  }
	  if (his_self.game.state.henry_viii_marital_status == 5) {

	    his_self.game.state.henry_viii_wives.push("howard");
	    his_self.updateLog("Henry VIII marries Kathryn Howard");

	    let pe = his_self.returnPlayerOfFaction("england");

            his_self.game.queue.push("cards_left\tengland\t"+(parseInt(his_self.game.state.cards_left["england"])+1));
            his_self.game.queue.push('hand_to_fhand\t1\t' + pe + '\t' + "england" + "\t1");
            his_self.game.queue.push("DEAL\t1\t"+pe+"\t1");

	  }
	  if (his_self.game.state.henry_viii_marital_status == 6) {
	    his_self.game.state.henry_viii_wives.push("parr");
	    his_self.updateLog("Henry VIII marries Katherine Parr");
	  }

	  if (his_self.game.state.henry_viii_marital_status > 7) { his_self.game.state.henry_viii_marital_status = 7; return 1; }
	  if (his_self.game.state.henry_viii_marital_status >= 2) {

	    his_self.updateStatus("Henry VIII makes a roll on the pregnancy chart");
	    let dd = his_self.rollDice(6);

	    if (his_self.game.state.henry_viii_marital_status == 3) { 
	      his_self.updateLog("Henry VIII receives +1 bonus for Jane Seymour");
	      dd++;
	    }

	    if (his_self.game.state.henry_viii_rolls.includes(dd)) {
	      while (his_self.game.state.henry_viii_rolls.includes(dd) && dd < 6) {
	        dd++;
	      }
	    }

	    his_self.game.state.henry_viii_rolls.push(dd);

	    msg = "Henry VIII is pleased with his marital progress...";

	    // results of pregnancy chart rolls
	    if (dd == 1) {
	      msg = "Marriage Result: Marriage Fails...";
	      his_self.updateLog("Henry VIII rolls 1: marriage fails");
	    }
	    if (dd == 2) {
	      msg = "Marriage Result: Wife Barren...";
	      his_self.updateLog("Henry VIII rolls 2: marriage barren");
	    }
	    if (dd == 3) {
	      msg = "Marriage Result: Wife Beheaded for Unbecoming Conduct...";
	      his_self.updateLog("Henry VIII rolls 3: wife beheaded: will re-roll when England passes");
	      his_self.game.state.henry_viii_auto_reroll = 1;
	    }
	    if (dd == 4) {
	      msg = "Marriage Result: Elizabeth I born, +2VP for Female Succession...";
	      his_self.updateLog("Henry VIII rolls 4: Elizabeth I born");
	      his_self.updateLog("England gains 2 VP for Female Succession");
	      his_self.game.state.henry_viii_add_elizabeth = 1;
	    }
	    if (dd == 5) {
	      his_self.updateLog("Henry VIII rolls 5: sickly Edward VI");
	      if (his_self.game.state.henry_viii_add_elizabeth == 1) {
	        msg = "Marriage Result: Edward VI born sickly, +3VP for Male Succession...";
	        his_self.updateLog("England gains additional 3 VP for Male Succession");
	      } else {
	        msg = "Marriage Result: Edward VI born sickly, +5VP for Male Succession...";
	        his_self.updateLog("England gains 5 VP for Male Succession");
	      }
	      his_self.game.state.henry_viii_sickly_edward = 1;
	      his_self.game.state.henry_viii_add_elizabeth = 0;
	    }
	    if (dd >= 6) {
	      his_self.updateLog("Henry VIII rolls 6: healthy Edward VI");
	      if (his_self.game.state.henry_viii_sickly_edward == 0) {
		if (his_self.game.state.henry_viii_add_elizabeth == 1) {
	          msg = "Marriage Result: Edward VI born healthy, +3VP for Male Succession...";
	          his_self.updateLog("England gains additional 3 VP for Male Succession");
	        } else {
	          msg = "Marriage Result: Edward VI born healthy, +5VP for Male Succession...";
	        }
	      }
	      his_self.game.state.henry_viii_healthy_edward = 1;
	      his_self.game.state.henry_viii_sickly_edward = 0;
	      his_self.game.state.henry_viii_add_elizabeth = 0;
	    }

	    his_self.updateStatus(msg);
	  }

	  his_self.marriage_overlay.render(msg);
	  his_self.displayVictoryTrack();
	  his_self.displayPregnancyChart();

	  return 1;
	}

	return 1;
      },

    }
    deck['004'] = { 
      img : "cards/HIS-004.svg" , 
      name : "Patron of the Arts" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "france" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.leaders.francis_i == 1) {
	  if (his_self.isCaptured("france", "francis-i")) { return 0; }
	  if (his_self.isBesieged("france", "francis-i")) { return 0; }
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("patron-of-the-arts\t"+faction);
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "patron-of-the-arts") {
	  let faction = mv[1];
          his_self.game.queue.splice(qe, 1);
	  his_self.chateaux_overlay.render(faction);
          return 1;
        }

	return 1;
      },
    }
    if (this.game.players.length > 2) {
      deck['005'] = { 
        img : "cards/HIS-005.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" ,
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        canEvent : function(his_self, faction) {
	  return 1;
        },
        handleGameLoop : function(his_self, qe, mv) {

          if (mv[0] === "papal_bull_add_unrest") {
        
            let region = mv[1]; // france, england, hapsburg
  	    his_self.game.queue.splice(qe, 1);

	    if (his_self.game.player == his_self.returnPlayerOfFaction("papacy")) {

              let space1 = "";
              let space2 = "";
	      let regiontxt = "France";
	      if (region == "england") { regiontxt = "English"; }
	      if (region == "hapsburg") { regiontxt = "Spanish"; }

              his_self.playerSelectSpaceWithFilter(
                `Select 1st Unoccupied ${regiontxt} Home Space: `,
                function(space) {
                  if (
                    space.home === region &&
                    (!his_self.isOccupied(space) && !space.unrest)
                  ) {
                    return 1;
                  }
                  return 0;
                },
                function(spacekey) {

                  space1 = spacekey;

                  his_self.addUnrest(space1);
                  his_self.displaySpace(space1);

                  his_self.playerSelectSpaceWithFilter(
                    `Select 2nd Unoccupied ${regiontxt} Home Space: `,
                    function(space) {
                      if (
                        space.home === region &&
                        space.key != space1 &&
                        (!his_self.isOccupied(space) && !space.unrest)
                      ) {
                        return 1;
                      }
                      return 0;
                    },
                    function(spacekey2) {
                      his_self.updateStatus("adding unrest...");
                      space2 = spacekey2;

                      his_self.addUnrest(space2);
                      his_self.displaySpace(space2);

                      his_self.addMove("unrest\t"+space1);
                      his_self.addMove("unrest\t"+space2);
                      his_self.endTurn();
                    },
                    null,
                    true
                  );
                },
                null,
                true
	      );

	    } else {
	      his_self.updateStatus("Papacy adding unrest after Excommunication");
	    }

	    return 0;

	  }

	  return 1;

        },
	onEvent : function(his_self, faction) {

	  let do_grounds_for_excommunication_exist = [];
	  let papacy = his_self.returnPlayerOfFaction("papacy");
	  if (his_self.canPapacyExcommunicateFaction("france")) { do_grounds_for_excommunication_exist.push("france"); }
	  if (his_self.canPapacyExcommunicateFaction("england")) { do_grounds_for_excommunication_exist.push("england"); }
	  if (his_self.canPapacyExcommunicateFaction("hapsburg")) { do_grounds_for_excommunication_exist.push("hapsburg"); }

	  //
	  // both options call this function
	  //
	  let excommunicate_leader_subfunction = () => {

	    if (papacy == his_self.game.player) {

              let msg = "Excommunicate Which Leader?";
              let html = '<ul>';
	      for (let z = 0; z < do_grounds_for_excommunication_exist.length; z++) {
                html += `<li class="option" id="${do_grounds_for_excommunication_exist[z]}">${his_self.returnFactionName(do_grounds_for_excommunication_exist[z])}</li>`;
	      }
	      html += '</ul>';
              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                let action2 = $(this).attr("id");
		his_self.updateStatus("clerics processing excommunication...");
	        his_self.addMove("papal_bull_add_unrest\t"+action2);
	        his_self.addMove("excommunicate_faction\t"+action2);
	        his_self.endTurn();

	      });
	    } else {
	      his_self.updateStatus("Papacy Excommunicating Heretic");
	    }
	  };

	  let excommunicate_reformer_subfunction = () => {

	    if (papacy == his_self.game.player) {

              let msg = "Excommunicate Protestant Reformer:";
	      let reformer_exists = 0;
              let html = '<ul>';
	      for (let key in his_self.reformers) {
	        let s = his_self.returnSpaceOfPersonage("protestant", key);
	        if (s) {
	  	  if (!his_self.game.state.already_excommunicated.includes(key)) {
	            reformer_exists = 1;
                    html += `<li class="option" id="${key}">${his_self.reformers[key].name}</li>`;
	          }
	        }
	      }
	
	      if (reformer_exists == 0) {

                let msg = "Convene Theological Debate?";
                let html = '<ul>';
                html += `<li class="option" id="yes">yes</li>`;
                html += `<li class="option" id="no">no</li>`;
	        html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);

                $('.option').off();
                $('.option').on('click', function () {

                  let action2 = $(this).attr("id");
	          his_self.updateStatus("convening debate...");

		  if (action2 === "yes") {
		    his_self.playerCallTheologicalDebate(his_self, his_self.game.player, "papacy");
		    return;
		  }

		  // no
	          his_self.updateLog("No excommunicable Protestant reformers exist");
	          his_self.endTurn();
		  return 0;

	        });

	        return 0;
	      }

	      html += '</ul>';
              his_self.updateStatusWithOptions(msg, html);
  
              $('.option').off();
              $('.option').on('click', function () {

                let selected_reformer = $(this).attr("id");

	        if (selected_reformer === "cranmer-reformer") {
	  	  his_self.addEndMove("counter_or_acknowledge\tPapal Bull announces excommunication of Cranmer\tpapal_bull_cranmer_excommunication");
		  his_self.addEndMove("RESETCONFIRMSNEEDED\tall");
	        }
	        his_self.addEndMove("excommunicate_reformer\t"+selected_reformer);

                let msg = "Convene Theological Debate after Excommunication?";
                let html = '<ul>';
                html += `<li class="option" id="yes">yes</li>`;
                html += `<li class="option" id="no">no</li>`;
	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

                $('.option').off();
                $('.option').on('click', function () {
		
	          his_self.updateStatus("convening...");
                  let action2 = $(this).attr("id");

		  let language_zone = "german";
		  //if (selected_reformer == "luther-reformer") { language_zone = "english"; }
		  //if (selected_reformer == "zwingli-reformer") { language_zone = "english"; }
		  if (selected_reformer == "cranmer-reformer") { language_zone = "english"; }
		  if (selected_reformer == "calvin-reformer") { language_zone = "french"; }

		  if (action2 === "yes") {
	            his_self.addMove("excommunicate_reformer\t"+selected_reformer);
	            his_self.addMove("player_call_theological_debate_in_region\tpapacy\t"+language_zone);
		    his_self.endTurn();
		    return;
		  }

		  // no
	          his_self.updateLog("No excommunicable Protestant reformers exist");
	          his_self.endTurn();
		  return;

	        });

	      });
            } else {
	      his_self.updateStatus("Papacy playing "+his_self.popup("005"));
	    }
	  };


	  if (papacy == his_self.game.player) {

            let msg = "Excommunicate Heretic?";
            let html = '<ul>';
                html += `<li class="option" id="reformer">Protestant Reformer</li>`;
	        if (do_grounds_for_excommunication_exist.length > 0) {
                  html += `<li class="option" id="leader">Unfaithful Monarch</li>`;
	        }
		html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let action2 = $(this).attr("id");
	      if (action2 == "reformer") {
	        excommunicate_reformer_subfunction();
	      } else {
	        excommunicate_leader_subfunction();
    	      }
	    });
	  } else {
	    his_self.updateStatus("Papacy playing "+his_self.popup("005"));
	  }

	  return 0;
	},
      }
    } else {
      deck['005'] = { 
        img : "cards/HIS-005-2P.svg" , 
        name : "Papal Bull" ,
        ops : 4 ,
        turn : 1 ,
        type : "normal" , 
        faction : "papacy" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        canEvent : function(his_self, faction) {
	  return 1;
        },
        onEvent : function(his_self, faction) {

	  let papacy = his_self.returnPlayerOfFaction("papacy");
	  if (papacy == his_self.game.player) {

            let msg = "Excommunicate Protestant Reformer:";
	    let reformer_exists = 0;
            let html = '<ul>';
	    for (let key in his_self.reformers) {
	      let s = his_self.returnSpaceOfPersonage("protestant", key);
	      if (s) {
		if (!his_self.game.state.already_excommunicated.includes(key)) {
	          reformer_exists = 1;
                  html += `<li class="option" id="${key}">${his_self.reformers[key].name}</li>`;
	        }
	      }
	    }
	
	    if (reformer_exists == 0) {

              let msg = "Convene Theological Debate?";
              let html = '<ul>';
              html += `<li class="option" id="yes">yes</li>`;
              html += `<li class="option" id="no">no</li>`;
	      html += '</ul>';
              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                let action2 = $(this).attr("id");
	        his_self.updateStatus("submitting...");

		if (action2 === "yes") {
		  his_self.playerCallTheologicalDebate(his_self, his_self.game.player, "papacy");
		  return;
		}

		// no
	        his_self.updateLog("No excommunicable Protestant reformers exist");
	        his_self.endTurn();
		return 0;

	      });

	      return 0;
	    }

	    html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);
  
            $('.option').off();
            $('.option').on('click', function () {

              let selected_reformer = $(this).attr("id");

	      if (selected_reformer === "cranmer-reformer") {
		his_self.addEndMove("counter_or_acknowledge\tPapal Bull announces excommunication of Cranmer\tpapal_bull_cranmer_excommunication");
		his_self.addEndMove("RESETCONFIRMSNEEDED\tall");
	      }
	      his_self.addEndMove("excommunicate_reformer\t"+selected_reformer);

              let msg = "Convene Theological Debate after Excommunication?";
              let html = '<ul>';
              html += `<li class="option" id="yes">yes</li>`;
              html += `<li class="option" id="no">no</li>`;
	      html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {
		
	        his_self.updateStatus("convening...");
                let action2 = $(this).attr("id");

		if (action2 === "yes") {
	          his_self.addMove("excommunicate_reformer\t"+selected_reformer);
	          his_self.addMove("player_call_theological_debate\tpapacy");
		  his_self.endTurn();
		  return;
		}

		// no
	        his_self.updateLog("No excommunicable Protestant reformers exist");
	        his_self.endTurn();
		return;

	      });

	    });

	    return 0;

          } else {
	    his_self.updateStatus("Papacy playing "+his_self.popup("005"));
	  }

	  return 0;
	},
      }
    }
    deck['006'] = { 
      img : "cards/HIS-006.svg" , 
      name : "Leipzig Debate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" , 
      faction : "papacy" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("papacy");

        his_self.game.state.tmp_papacy_may_specify_debater = 1;
        his_self.game.state.tmp_papacy_may_specify_protestant_debater_unavailable = 1;

	if (his_self.game.player === p) {

          let msg = "Select Language Zone for Theological Debate:";
          let html = '<ul>';

          if (his_self.returnDebatersInLanguageZone("german", "protestant")) { 
            html += '<li class="option" style="" id="german">German</li>';
          }
          if (his_self.returnDebatersInLanguageZone("french", "france")) { 
            html += '<li class="option" style="" id="french">French</li>';
          }
          if (his_self.returnDebatersInLanguageZone("english", "france")) { 
            html += '<li class="option" style="" id="english">English</li>';
          }
          html += '</ul>';

	  //
  	  // show visual language zone selector
  	  //
  	  his_self.language_zone_overlay.render("catholic_counter_reformation");

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let language_zone = $(this).attr("id");

            let msg = "Target Committed or Uncommitted Protestant?";
            let html = '<ul>';
            if (1 <= his_self.returnDebatersInLanguageZone(language_zone, "protestant", 0)) {
              html += '<li class="option uncommitted" id="uncommitted">Uncommitted</li>';
            }
            if (1 <= his_self.returnDebatersInLanguageZone(language_zone, "protestant", 1)) {
              html += '<li class="option committed" id="committed">Committed</li>';
            }
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);
            $('.option').off();
            $('.committed').on('mouseover', function () {
	      his_self.language_zone_overlay.hideDebaters();
	      his_self.language_zone_overlay.showDebaters(language_zone, "committed", "protestant");
            });
            $('.committed').on('mouseout', function () {
	      his_self.language_zone_overlay.hideDebaters();
            });
            $('.uncommitted').on('mouseover', function () {
	      his_self.language_zone_overlay.hideDebaters();
	      his_self.language_zone_overlay.showDebaters(language_zone, "uncommitted", "protestant");
            });
            $('.uncommitted').on('mouseout', function () {
	      his_self.language_zone_overlay.hideDebaters();
            });

            $('.option').on('click', function () {

              let is_committed = $(this).attr("id");
	      if (is_committed == "uncommitted") { is_committed = 0; } else { is_committed = 1; }

              let msg = "Leipzig Debate Format?";
              let html = '<ul>';
              html += '<li class="option" id="select">Pick My Debater</li>';
	      // or prohibit uncommitted debaters
              if (is_committed == 0 && 1 < his_self.returnDebatersInLanguageZone(language_zone, "protestant", is_committed)) {
                html += '<li class="option" id="prohibit">Prohibit Protestant Debater</li>';
              }
              html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);
  
              $('.option').off();
              $('.option').on('click', function () {

                let opt = $(this).attr("id");

	        if (opt === "select") {

                  let msg = "Select Uncommitted Papal Debater:";
                  let html = '<ul>';
		  for (let i = 0; i < his_self.game.state.debaters.length; i++) {
		    let d = his_self.game.state.debaters[i];
		    if (d.faction === "papacy" && d.committed === 0) {
            	      html += `<li class="option" id="${d.type}">${d.name}</li>`;
		    }
		  }
		  html += '</ul>';
                  his_self.updateStatusWithOptions(msg, html);
  
                  $('.option').off();
                  $('.option').on('mouseover', function() {
                    let action2 = $(this).attr("id");
                    if (his_self.debaters[action2]) {
                      his_self.cardbox.show(action2);
                    }
                  });
                  $('.option').on('mouseout', function() {
                    let action2 = $(this).attr("id");
                    if (his_self.debaters[action2]) {
                      his_self.cardbox.hide(action2);
                    }
                  });
                  $('.option').on('click', function () {
                    his_self.language_zone_overlay.hide();
                    let selected_papal_debater = $(this).attr("id");
	            his_self.addMove("theological_debate");
        	    his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate\t" + language_zone);
                    let c = [his_self.game.players[his_self.returnPlayerOfFaction("papacy")-1],his_self.game.players[his_self.returnPlayerOfFaction("protestant")-1]];
        	    his_self.addMove("RESETCONFIRMSNEEDED\t"+JSON.stringify(c));
	            if (is_committed == 0) {
		      his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted\t" + selected_papal_debater);
	            } else { 
		      his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"committed\t" + selected_papal_debater);
		    }
		    his_self.endTurn();
		  });
	
	        } else {

                  let msg = "Prohibit Protestant Debater:";
                  let html = '<ul>';
		  for (let i = 0; i < his_self.game.state.debaters.length; i++) {
		    let d = his_self.game.state.debaters[i];
		    if (d.faction !== "papacy" && d.language_zone === language_zone && d.committed == is_committed) {
            	      html += `<li class="option" id="${i}">${d.name}</li>`;
		    }
		  }
		  html += '</ul>';
                  his_self.updateStatusWithOptions(msg, html);
  
                  $('.option').off();
                  $('.option').on('mouseover', function() {
                    let action2 = $(this).attr("id");
                    if (his_self.debaters[action2]) {
                      his_self.cardbox.show(action2);
                    }
                  });
                  $('.option').on('mouseout', function() {
                    let action2 = $(this).attr("id");
                    if (his_self.debaters[action2]) {
                      his_self.cardbox.hide(action2);
                    }
                  });
                  $('.option').on('click', function () {
                    his_self.language_zone_overlay.hide();
                    let selected_idx = parseInt($(this).attr("id"));
		    let prohibited_protestant_debater = his_self.game.state.debaters[selected_idx].type;
	            his_self.addMove("theological_debate");
        	    his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate\t" + language_zone);
                    let c = [his_self.game.players[his_self.returnPlayerOfFaction("papacy")-1],his_self.game.players[his_self.returnPlayerOfFaction("protestant")-1]];
        	    his_self.addMove("RESETCONFIRMSNEEDED\t"+JSON.stringify(c));
	 	    if (is_committed == 0) {
	              his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted\t\t"+prohibited_protestant_debater);
		    } else {
	              his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"committed\t\t"+prohibited_protestant_debater);
		    }
		    his_self.endTurn();
		  });
	
	        }

	      });
	    });
	  });

	} else {
	  his_self.updateStatus("Papacy calling Theological Debate");
	}

	return 0;
      },

    }

    deck['007'] = { 
      img : "cards/HIS-007.svg" , 
      name : "Here I Stand" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "protestant" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {       
	if (his_self.game.state.leaders.luther != 1) { return 0; }
	let cards_available = 0;
        for (let key in his_self.game.deck[0].discards) { if (parseInt(key) > 23) { cards_available++; } }
        if (cards_available == 0) { return 0; }
	if (Object.keys(his_self.game.deck[0].discards).length > 0) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (his_self.game.player === p) {

	  let msg = "Retrieve Card from Discard Pile: ";
          let html = '<ul>';
	  for (let key in his_self.game.deck[0].discards) {
	    if (parseInt(key) > 9 && !his_self.game.state.protestant_cards_evented.includes(key)) {
              html += `<li class="option" id="${key}">${his_self.game.deck[0].cards[key].name}</li>`;
	    }
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
          $('.option').on('mouseover', function() {
            let action2 = $(this).attr("id");
            his_self.cardbox.show(action2);
          });
          $('.option').on('mouseout', function() {
            let action2 = $(this).attr("id");
            his_self.cardbox.hide(action2);
          });
	  $('.option').on('click', function () {

	    $('.option').off();
	    let card = $(this).attr("id");

	    let msg = "Play or Hold Card? ";
            let html = '<ul>';
            html += '<li class="option" id="play">play card</li>';
            html += '<li class="option" id="hold">hold card</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action == "play") {

		his_self.addMove("card\tprotestant\t"+card);
		his_self.addMove("discard\tprotestant\t007");
		his_self.addMove("NOTIFY\tProtestants retrieve "+his_self.popup(card));
		his_self.endTurn();

	      } else {

		//
		// remove any cards_left update that runs after this coming cards_left update and undoes us
		//
		for (let i = 0; i < his_self.moves.length; i++) {
		  let lmv = his_self.moves[i].splice("\t");
		  if (lmv[0] == "cards_left") {
		    his_self.moves.splice(i, 1);
		  }
		}

    		his_self.addMove("remove_cards_left");
    		his_self.addMove("cards_left\tprotestant\t"+(parseInt(his_self.game.state.cards_left["protestant"])+1));
		his_self.addMove("discard\tprotestant\t007");
		his_self.addMove("NOTIFY\tProtestants retrieve "+his_self.popup(card));
		his_self.addMove("here_i_stand_event\t"+card);
		his_self.endTurn();

	      }

	    });
	  });
	} else {
	  his_self.updateStatus("Protestants retrieving card: " + his_self.popup("007"));
	}

	return 0;
      },
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu === "debate") {
	  if (extra === "german") {
            return { faction : "protestant" , event : '007', html : `<li class="option" id="007">Here I Stand (assign Luther)</li>` };
	  }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "debate") {
	  if (extra === "german") {
	    //
	    // Wartburg stops Luther
	    //
	    if (his_self.game.state.events.wartburg == 1) { 
	      return 0;
	    }
	    if (his_self.game.state.leaders.luther == 1) {
	      if (his_self.game.state.theological_debate) {
		if (his_self.game.state.theological_debate.round1_attacker_debater == "luther-debater") { return 0; }
	        if (his_self.game.state.theological_debate.round1_defender_debater == "luther-debater") { return 0; }
	        if (his_self.game.state.theological_debate.round2_attacker_debater == "luther-debater") { return 0; }
	        if (his_self.game.state.theological_debate.round2_defender_debater == "luther-debater") { return 0; }
	        if (player === his_self.returnPlayerOfFaction("protestant")) {
	          if (his_self.canPlayerPlayCard("protestant", "007")) {
		    return 1;
		  } else {
		  }
	        }
	      }
	    }
	  }
	}
	return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "debate") {
	  let p = his_self.returnPlayerOfFaction("protestant");
    	  his_self.addMove("cards_left\tprotestant\t"+(parseInt(his_self.game.state.cards_left["protestant"])+1));
          his_self.addMove('hand_to_fhand\t1\t' + p + '\t' + "protestant" + "\t1");
	  his_self.addMove("DEAL\t1\t"+p+"\t1");
	  his_self.addMove("discard\tprotestant\t007");
	  his_self.addMove("NOTIFY\t"+his_self.popup("007") + ": Luther enters Theological Debate");
	  his_self.addMove("here_i_stand_response");
	  his_self.endTurn();
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "here_i_stand_event") {

          his_self.game.queue.splice(qe, 1);

	  //
	  // first option not implemented
	  //
          let card = mv[1];

	  if (his_self.game.deck[0].discards[card]) {

	    let p = his_self.returnPlayerOfFaction("protestant");

	    //
	    // player returns to hand
	    //
	    if (his_self.game.player === p) {
              let fhand_idx = his_self.returnFactionHandIdx(p, "protestant");
	      his_self.game.deck[0].fhand[fhand_idx].push(card);
	    }

	    //
	    // everyone removes from discards
	    //
	    delete his_self.game.deck[0].discards[card];

	  }

	  return 1;
	}

        if (mv[0] === "here_i_stand_response") {

          his_self.game.queue.splice(qe, 1);

	  his_self.updateLog("Protestants trigger " + his_self.popup("007"));
	  // protestants get extra card
	  his_self.game.queue.push("ACKNOWLEDGE\tProtestants swap Martin Luther into debate");

	  //
	  // second option -- only possible if Wartburg not in-play
	  //
	  if (his_self.game.state.events.wartburg == 0) {

	    //
	    // existing protestant debater is committed, but de-activated (bonus does not apply)
	    //
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      let d = his_self.game.state.debaters[i];
	      if (his_self.game.state.theological_debate.attacker === "papacy") {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_defender_debater) {
	  	    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_defender_debater) {
		    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      } else {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_attacker_debater) {
		    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_attacker_debater) {
		    his_self.commitDebater("protestant", d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      }
	    }

	    let is_luther_committed = 0;
console.log("is luther committed?");
console.log(JSON.stringify(his_self.game.state.excommunicated));
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      if (his_self.game.state.debaters[i].key === "luther-debater") {
		if (his_self.game.state.debaters[i].committed == 1) { 
		  // remove +1 bonus if luther is committed
		  if (his_self.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
		    his_self.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
                    his_self.game.state.theological_debate.defender_debater_bonus--;
		  }
		  is_luther_committed = 1;
		}
	      }
	    }
	    for (let i = 0; i < his_self.game.state.excommunicated.length; i++) {
	      if (his_self.game.state.excommunicated[i].debater) {
	        if (his_self.game.state.excommunicated[i].debater.type === "luther-debater") {
console.log("FOUND LUTHER");
		  if (his_self.game.state.excommunicated[i].debater.committed == 1) {
console.log("LUTHER IS COMMITTED!");
		    // remove +1 bonus if luther is committed
		    if (his_self.game.state.theological_debate.defender_debater_entered_uncommitted == 1) {
		      his_self.game.state.theological_debate.defender_debater_entered_uncommitted = 0;
                      his_self.game.state.theological_debate.defender_debater_bonus--;
		    }
		    is_luther_committed = 1;
		  }
	        }
	      }
	    }


	    if (his_self.game.state.theological_debate.attacker === "papacy") {
	      if (his_self.game.state.theological_debate.round == 1) {
                his_self.game.state.theological_debate.round1_defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
                his_self.game.state.theological_debate.defender_debater_bonus = 1;
		if (is_luther_committed == 0) {
                  his_self.game.state.theological_debate.defender_debater_bonus++;
		}
	      } else {
                his_self.game.state.theological_debate.round2_defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
                his_self.game.state.theological_debate.defender_debater_bonus = 1;
		if (is_luther_committed == 0) {
                  his_self.game.state.theological_debate.defender_debater_bonus++;
		}
	      }
	    } else {
	      if (his_self.game.state.theological_debate.round == 1) {
                his_self.game.state.theological_debate.round1_attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater_power = 4;
                his_self.game.state.theological_debate.attacker_debater_bonus = 3;
	      } else {
                his_self.game.state.theological_debate.round2_attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater_power = 4;
                his_self.game.state.theological_debate.attacker_debater_bonus = 3;
	      }
	    }


	  }

	  // re-render debate overlay with luther there
console.log("rendering with luther here: ");
console.log(JSON.stringify(his_self.game.state.theological_debate));
          his_self.debate_overlay.render(his_self.game.state.theological_debate);
          his_self.displayTheologicalDebater(his_self.game.state.theological_debate.attacker_debater, true);
          his_self.displayTheologicalDebater(his_self.game.state.theological_debate.defender_debater, false);

	  return 1;

        }

	return 1;
      },
    }
    // 95 Theses
    deck['008'] = { 
      img : "cards/HIS-008.svg" , 
      name : "Luther's 95 Theses" ,
      ops : 0 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.factionbar.setActive("protestant");

	// set player to protestant
	let player = his_self.returnPlayerOfFaction("protestant");

	let players_to_go = [];
	for (let i = 1; i < his_self.game.players.length; i++) {
	  if (i != his_self.returnPlayerOfFaction("protestant")) {
	    players_to_go.push(i);
	  }
	}

	// protestant gets 2 roll bonus at start
	his_self.game.state.tmp_protestant_reformation_bonus = 1;
	his_self.game.state.tmp_protestant_reformation_bonus_spaces = [];
	his_self.game.state.tmp_catholic_reformation_bonus = 0;
	his_self.game.state.tmp_catholic_reformation_bonus_spaces = [];
	his_self.game.state.tmp_reformations_this_turn = [];
	his_self.game.state.wittenberg_electoral_bonus = 1;

	his_self.game.queue.push("hide_overlay\ttheses");
        his_self.game.queue.push("ACKNOWLEDGE\tThe Reformation has begun!");
	his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("STATUS\tProtestants selecting reformation targets...\t"+JSON.stringify(players_to_go));
	his_self.game.queue.push("show_overlay\ttheses");
        his_self.convertSpace("protestant", "wittenberg");
        his_self.convertSpace("protestant", "wittenberg");
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addReformer("protestant", "wittenberg", "luther-reformer");
        his_self.displaySpace("wittenberg");

	return 1;
      },
    }
    deck['009'] = { 
      img : "cards/HIS-009.svg" , 
      name : "Barbary Pirates" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      returnCustomOverlay : function() {
	return {
          text : "Algiers is in play, the Ottomans may now build corsairs and engage in piracy!",
          title : "Barbary Pirates!",
          img : "/his/img/backgrounds/events/An_Action_between_an_English_Ship_and_Vessels_of_the_Barbary_Corsairs.jpg",
	  msg : "Barbary Pirates in Play...",
	  styles : [{ key : "backgroundPosition" , val : "bottom" }],
        }
      } ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	// algiers space is now in play
	his_self.game.spaces['algiers'].home = "ottoman";
	his_self.game.spaces['algiers'].political = "ottoman";
	his_self.game.spaces['algiers'].pirate_haven = 1;
	his_self.addRegular("ottoman", "algiers", 2);
	his_self.addCorsair("ottoman", "algiers", 2);
	his_self.addNavyLeader("ottoman", "algiers", "barbarossa");
	his_self.game.state.events.barbary_pirates = 1;
	his_self.game.state.events.ottoman_piracy_enabled = 1;
	his_self.game.state.events.ottoman_corsairs_enabled = 1;

	// re-display algiers
	his_self.displaySpace("algiers");

	return 1;
      },

    }
    deck['010'] = { 
      img : "cards/HIS-010.svg" , 
      name : "Clement VII" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      returnCustomOverlay : function() {
	return {
          text : "Leo X is replaced by Clement VII. Papacy may now hold a card between turns.",
          title : "Accession of Clement VII",
          img : "/his/img/backgrounds/events/clement-vii.png",
	  msg : "Clement VII becomes Pope...",
        }
      } ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	his_self.game.state.events.clement_vii = 1;
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 1;
	return 1;
      },
    }
    deck['011'] = { 
      img : "cards/HIS-011.svg" , 
      name : "Defender of the Faith" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let papacy = his_self.returnPlayerOfFaction("papacy");

	if (faction === "england") {
	  if (his_self.game.player.length < 6) { let faction_hand_idx = 1;  }  
	  let england_player = his_self.returnPlayerCommandingFaction("england");
 	  his_self.game.queue.push("hand_to_fhand\t1\t"+england_player+"\t"+"england"+"\t1");
	  his_self.game.queue.push(`DEAL\t1\t${england_player}\t1`);
        }
	// three counter-reformation attempts
	his_self.game.queue.push(`hide_overlay\tburn_books`);
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push(`catholic_counter_reformation\tpapacy\tall`);
	his_self.game.queue.push(`catholic_counter_reformation\tpapacy\tall`);
	his_self.game.queue.push(`catholic_counter_reformation\tpapacy\tall`);
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['012'] = { 
      img : "cards/HIS-012.svg" , 
      name : "Master of Italy" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { 

	let keys = ["genoa","milan", "venice", "florence", "naples"];
	let f = {};

	for (let key in keys) {
	  let fac = his_self.returnFactionControllingSpace(keys[key]);
	  let owner = his_self.returnAllyOfMinorPower(fac);
	  if (!f[owner]) { f[owner] = 1; }
	  else { f[owner]++; }
	}

	for (let key in f) {
	  if (f[key] >= 4) {
	    return 1;
	  }
	  if (f[key] == 3) {
	    return 1;
	  }
	  if (f[key] == 2) {
	    return 1;
	  }
	}

	return 0;
      } ,
      onEvent : function(his_self, faction) {

        let keys = ["genoa","milan", "venice", "florence", "naples"];
        let f = {};
        for (let key in keys) {
          let fac = his_self.returnFactionControllingSpace(keys[key]);
          let owner = his_self.returnAllyOfMinorPower(fac);
          if (!f[owner]) { f[owner] = 1; }
          else { f[owner]++; }
        } 

	his_self.game.queue.push("display_vp_track");
        
        for (let key in f) {
          if (f[key] >= 4) {
	    his_self.game.queue.push("SETVAR\tstate\tmaster_of_italy\t"+key+"\t"+parseInt(his_self.game.state.master_of_italy[faction])+2);
	    his_self.game.queue.push(`NOTIFY\t${his_self.returnFactionName(key)} gains 2 VP as Master of Italy`);
          }
          if (f[key] == 3) {
	    his_self.game.queue.push("SETVAR\tstate\tmaster_of_italy\t"+key+"\t"+parseInt(his_self.game.state.master_of_italy[faction])+1);
	    his_self.game.queue.push(`NOTIFY\t${his_self.returnFactionName(key)} gains 1 VP from Master of Italy`);
          }
          if (f[key] == 2) {
	    if (his_self.game.players.length > 2) {
	      let player = his_self.returnPlayerOfFaction(key);
 	      his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+key+"\t1");
	      his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
	      his_self.game.queue.push(`NOTIFY\t${his_self.returnFactionName(key)} draws 1 card from Master of Italy`);
            }
          }
        }

	his_self.displayVictoryTrack();

	return 1;

      }
    }
    let sl_img = "cards/HIS-013.svg";
    if (this.game.players.length == 2) {
      sl_img = "cards/HIS-013-2P.svg";
    }
    deck['013'] = { 
      img : sl_img,
      name : "Schmalkaldic League" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	  if (his_self.game.state.round >= 2 && his_self.returnNumberOfProtestantSpacesInLanguageZone("all") >= 12) {
	    return 1; 
	  }
	  return 0;
      },
      onEvent : function(his_self, faction) {

        his_self.game.state.events.schmalkaldic_league_round = his_self.game.state.round;
        his_self.game.state.events.schmalkaldic_league = 1;
	his_self.schmalkaldic_overlay.render();
        his_self.setEnemies("protestant","papacy");
        his_self.setEnemies("protestant","hapsburg");
        if (his_self.game.players.length == 2) { his_self.setAllies("papacy","hapsburg"); }

	//
	// protestant home + political spaces
	//
	// skip keys are home for other factions
	//
	let skip_keys = ["innsbruck","linz","vienna","graz","zurich","basel"];
	for (let key in his_self.game.spaces) {
	  s = his_self.game.spaces[key];
	  if (s.language == "german") { 
	    if (s.religion == "protestant") {
	      if (!skip_keys.includes(key)) {
	 	s.home = "protestant";
	        if (!s.fortified && !s.unrest) {
	          s.political = "protestant";
	        }
	      }
	    } else {
	      if (!skip_keys.includes(key)) {
	 	s.home = "protestant";
		if (s.political == "") { 
		  s.political = "haspburg";
	        }
	      }
	    }
	  }
	}
	for (let i = 0; i < his_self.game.state.activated_powers["protestant"].length; i++) {
	  if (his_self.game.state.activated_powers["protestant"][i] === "hapsburg") {
	    his_self.game.state.activated_powers["protestant"].splice(i, 1);
	    his_self.game.state.events.spanish_invasion = "";
	  }
	}

	//
	// John Frederick and Philip of Hesse
	//
	let jf_added = 0;
        if (his_self.returnSpaceOfPersonage("protestant", "john-frederick")) { jf_added = 1; }
	if (his_self.isSpaceControlled("wittenberg", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "wittenberg") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "wittenberg", "john-frederick");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("brandenburg", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "brandenburg") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "brandenburg", "john-frederick");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("augsburg", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "augsburg") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "augsburg", "john-frederick");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("mainz", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "mainz") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "mainz", "john-frederick");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("trier", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "trier") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "trier", "john-frederick");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("cologne", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "cologne") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "cologne", "john-frederick");
	  jf_added = 1;
	}
	jf_added = 0;
        if (his_self.returnSpaceOfPersonage("protestant", "philip-hesse")) { jf_added = 1; }
	if (his_self.isSpaceControlled("mainz", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "mainz") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "mainz", "philip-hesse");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("cologne", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "cologne") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "cologne", "philip-hesse");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("trier", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "trier") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "trier", "philip-hesse");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("augsburg", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "augsburg") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "augsburg", "philip-hesse");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("brandenburg", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "brandenburg") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "brandenburg", "philip-hesse");
	  jf_added = 1;
	}
	if (his_self.isSpaceControlled("wittenberg", "protestant") && his_self.returnFactionLandUnitsInSpace("protestant", "wittenberg") > 0 && jf_added == 0) {
	  his_self.addArmyLeader("protestant", "wittenberg", "philip-hesse");
	  jf_added = 1;
	}

	//
	// move protestant regulars in catholic spaces to nearest protestant-controlled electorates
	//
	for (let key in his_self.game.spaces) {
	  if (his_self.game.spaces[key].political != "protestant") {
	    if (his_self.game.spaces[key].units["protestant"].length > 0) {
	      let already_routed_through = {};
    	      let res = his_self.returnNearestSpaceWithFilter(
				key ,
				function(spacekey) {
				  if (his_self.game.spaces[spacekey].type === "electorate" && his_self.game.spaces[spacekey].political === "protestant") { return 1; }
				  return 0;
				},
				function(spacekey) {
        			  if (already_routed_through[spacekey] == 1) { return 0; }
				  already_routed_through[spacekey] = 1;
				  return 1;
				},
				0, // transit passes (no need)
				0, // transit seas (no need)
				"protestant" ,
				0 // already crossed sea zone
	      );

	      for (let z = 0; z < his_self.game.spaces[key].units["protestant"].length; z++) {
    		let u = his_self.game.spaces[key].units["protestant"][z];
		if (u.type == "regular" || u.type == "mercenary" || u.army_leader == true) {
		  if (res.length > 0) {
		    his_self.game.spaces[res[0].key].units["protestant"].push(u);
		  }
    		  his_self.game.spaces[key].units["protestant"].splice(z, 1);
		  z--;
		}
	      }
	    }
	  }
	}

	//
	// in 2P papacy now controls hapsburg
	//
	if (his_self.game.players.length == 2) {
          his_self.game.state.activated_powers["papacy"].push("hapsburg");
	}

	his_self.removeCardFromGame("013");

	his_self.displayBoard();
	return 1;

      }
    }
    deck['014'] = { 
      img : "cards/HIS-014.svg" , 
      name : "Paul III" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      returnCustomOverlay : function() {
	return {
          text : "Clement VII is replaced by Paul III. Papacy now wins ties Counter-Reformation rolls.",
          title : "Accession of Paul III",
          img : "/his/img/backgrounds/events/paul-iii.jpg",
	  msg : "Paul III becomes Pope...",
        }
      } ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.events.paul_iii = 1;
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 0;
	his_self.removeCardFromGame('010'); // remove clement vii
	his_self.game.state.leaders.paul_iii = 1;
	return 1;
      },
    }
    deck['015'] = { 
      img : "cards/HIS-015.svg" , 
      name : "Society of Jesus" ,
      ops : 2 ,
      turn : 5 ,
      type : "mandatory" ,
      returnCustomOverlay : function() {
	return {
          text : "The Society of Jesus receives a Papal charter to found Jesuit Universities",
          title : "Society of Jesus",
          img : "/his/img/backgrounds/events/loyola-jesuits.jpg",
	  msg : "Society of Jesus in Play...",
	  styles : [{ key : "backgroundPosition" , val : "center" }],
        }
      } ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.events.society_of_jesus = 1;
	let papacy = his_self.returnPlayerOfFaction("papacy");
	if (his_self.game.player === papacy) {
    	  his_self.playerSelectSpaceWithFilter(
      	    "Select Catholic-Controlled Space for First Jesuit University",
      	    function(space) {
              if (space.religion === "catholic" && space.university != 1) { return 1; }
              return 0; 
            },          
            function(destination_spacekey) {
	      his_self.game.spaces[destination_spacekey].university = 1;
	      his_self.displaySpace(destination_spacekey);
    	      his_self.playerSelectSpaceWithFilter(
      	        "Select Catholic-Controlled Space for Second Jesuit University",
       	        function(space) {
                  if (space.key != destination_spacekey && space.religion === "catholic" && space.university != 1) { return 1; }
                  return 0; 
                },
                function(second_spacekey) {
	          his_self.game.spaces[second_spacekey].university = 1;
	          his_self.displaySpace(second_spacekey);
                  his_self.addMove("found_jesuit_university\t"+second_spacekey);
                  his_self.addMove("found_jesuit_university\t"+destination_spacekey);
	          his_self.addMove("SETVAR\tstate\tevents\tpapacy_may_found_jesuit_universities\t1");
                  his_self.endTurn();
	        },
		null,
		true
	      );
	    },
	    null,
	    true
	  );
        }
	return 0;
      },    
    }
    deck['016'] = { 
      img : "cards/HIS-016.svg" , 
      name : "Calvin" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders['luther'] = 0;
	his_self.game.state.leaders['calvin'] = 1;

	let x = his_self.returnSpaceOfPersonage("protestant", "luther-reformer");
	let y = his_self.returnIndexOfPersonageInSpace("protestant", "luther-reformer", x);

	if (y > -1) {
	  his_self.game.spaces[x].units["protestant"].splice(y, 1);
	}

	for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	  if (his_self.game.state.debaters[i].type === "luther-debater") {
	    his_self.game.state.debaters.splice(i, 1);
	  }
	}

	his_self.displaySpace(x);
	his_self.updateLog("Luther dies and is replaced by Calvin");

	return 1;
      }
    }
    deck['017'] = { 
      img : "cards/HIS-017.svg" , 
      name : "Council of Trent" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	his_self.game.state.council_of_trent = {};
	his_self.game.state.council_of_trent.papacy = {};
	his_self.game.state.council_of_trent.protestants = {};

	his_self.game.queue.push("hide_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_results");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_protestants");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");
	his_self.game.queue.push("council_of_trent_papacy");
	his_self.game.queue.push("show_overlay\tcouncil_of_trent");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "council_of_trent_add_debaters") {

          his_self.game.queue.splice(qe, 1);
	  
	  let faction = mv[1];
	  let debaters = mv[2];

	  if (faction === "papacy") {
	    his_self.game.state.council_of_trent.papacy.debaters = JSON.parse(debaters);
	  } else {
	    his_self.game.state.council_of_trent.protestants.debaters = JSON.parse(debaters);
	  }

	  return 1;

	}

        if (mv[0] === "council_of_trent_papacy") {

          his_self.game.queue.splice(qe, 1);
	  his_self.council_of_trent_overlay.render("papacy");

	  return 0;

	}

        if (mv[0] === "council_of_trent_results") {

          his_self.game.queue.splice(qe, 1);
	  //
	  // this adds stuff to the queue -- so we pass through
	  //
	  his_self.council_of_trent_overlay.render("results");

	  return 1;

	}

        if (mv[0] === "council_of_trent_protestants") {

          his_self.game.queue.splice(qe, 1);
	  his_self.council_of_trent_overlay.render("protestant");

	  return 0;

        }

	return 1;
      },
    }
    deck['018'] = { 
      img : "cards/HIS-018.svg" , 
      name : "Dragut" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	// barbarossa dies, replaced by Dragut
	let s = his_self.returnSpaceOfPersonage("ottoman", "barbarossa");

	if (s != "") {
	  let idx = his_self.returnIndexOfPersonageInSpace("ottoman", "barbarossa", s);
	  if (idx > -1) {
	    if (his_self.game.spaces[s]) {
	      his_self.game.spaces[s].units["ottoman"].splice(idx, 1);
	      his_self.addNavyLeader("ottoman", s, "dragut");
	    }  
	    if (his_self.game.navalspaces[s]) {
	      his_self.game.navalspaces[s].units["ottoman"].splice(idx, 1);
	      his_self.addNavyLeader("ottoman", s, "dragut");
	    }  
	  } 

	  his_self.displaySpace(s);

	} else {
	  his_self.addNavyLeader("ottoman", "istanbul", "dragut");
	  his_self.displaySpace("istanbul");
	}

	return 1;
      },
    }
    deck['019'] = { 
      img : "cards/HIS-019.svg" , 
      name : "Edward VI" ,
      ops : 2 ,
      turn : 0 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.game.state.events.england_changed_rulers_this_turn = 1;

        //
        // removes captured leaders
        //
        for (let i = 0; i < his_self.game.state.players_info.length; i++) {
          for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
            if (his_self.game.state.players_info[i].captured[ii].type == "henry-viii") { his_self.game.state.players_info[i].captured.splice(ii, 1); ii--; } else {
              if (his_self.game.state.players_info[i].captured[ii].type == "charles-brandon") { his_self.game.state.players_info[i].captured.splice(ii, 1); ii--; }
	    }
	  }
	}

	his_self.game.state.leaders.edward_vi = 1;
	his_self.game.state.leaders.henry_viii = 0;
	his_self.game.state.leaders.mary_i = 0;
	his_self.game.state.leaders.elizabeth_i = 0;

	let placed = 0;

        // henry_viii dies, replaced by dudley
        let s = his_self.returnSpaceOfPersonage("england", "henry-viii");
        if (s != "") {
          let idx = his_self.returnIndexOfPersonageInSpace("england", "henry-viii", s);
          if (idx > -1) {
            his_self.game.spaces[s].units["england"].splice(idx, 1);
            his_self.addArmyLeader("england", s, "dudley");
	    placed = 1;
          } 
        }
        
	if (placed == 0) {
          his_self.addArmyLeader("england", "london", "dudley");
	}

	his_self.displaySpace("london");

	return 1;
      },
    }

    deck['020'] = { 
      img : "cards/HIS-020.svg" , 
      name :"Henry II" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders.francis_i = 0;
	his_self.game.state.leaders.henry_ii = 1;
	let placed = 0;

        // francis_i dies replaced by henry_ii
        let s = his_self.returnSpaceOfPersonage("france", "francis-i");
        if (s != "") {
          let idx = his_self.returnIndexOfPersonageInSpace("france", "francis-i", s);
          if (idx > -1) {
            his_self.game.spaces[s].units["france"].splice(idx, 1);
            his_self.addArmyLeader("france", s, "henry-ii");
	    placed = 1;
          } 
        }
        
	if (placed == 0) {
          his_self.addArmyLeader("france", "paris", "henry-ii");
	}

	return 1;
      },
    }
    deck['021'] = { 
      img : "cards/HIS-021.svg" , 
      name : "Mary I" ,
      ops : 2 ,
      turn : 0 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.events.england_changed_rulers_this_turn = 1;

	//
	// this means Mary I was triggered before, but Sickly Edward acceeded the 
	// throne and we now have Mary I being evented again after being added to
	// the deck.
	//
	if (his_self.game.state.henry_viii_re_add_mary_to_throne == 1) {
	  his_self.game.state.henry_iii_sickly_edward = 0;
	}


        //
        // removed captured leaders
        //
        for (let i = 0; i < his_self.game.state.players_info.length; i++) {
          for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
            if (his_self.game.state.players_info[i].captured[ii].type == "henry-viii") { his_self.game.state.players_info[i].captured.splice(ii, 1); ii--; } else {
              if (his_self.game.state.players_info[i].captured[ii].type == "charles-brandon") { his_self.game.state.players_info[i].captured.splice(ii, 1); ii--; }
	    }
	  }
	}

	his_self.game.state.leaders.edward_vi = 0;
	his_self.game.state.leaders.mary_i = 1;
	his_self.game.state.henry_viii_mary_i_added_round = his_self.game.state.round;

	//
	// it is possible that a healthy Edward has already been born before this
	// card has been played, in which case Mary I is actually Edward VI since
	// the succession passes to him.
	//
        if (his_self.game.state.henry_viii_healthy_edward == 1) {
	  let deck = his_self.returnDeck();
	  let card = deck["019"];
	  card.onEvent(his_self,faction);
	  his_self.game.state.leaders.edward_vi = 1;
	  his_self.game.state.leaders.mary_i = 0;
	  return 1;
        } else {

	  //
	  // otherwise remove Edward from the Deck
	  //
	  if (his_self.game.state.henry_viii_sickly_edward == 1) {

	    //
	    // Sickly Edward was born before Mary I was evented, so we put Edward on the 
	    // throne, but Mary re-enters the deck next turn like a looming bird of 
	    // death.
	    //
	    his_self.game.state.henry_viii_re_add_mary_to_throne = 1;
            let deck = his_self.returnDeck();
            let card = deck["019"];
            card.onEvent(his_self,faction);
            return 1;

	    his_self.removeCardFromGame('019'); // remove edward_vi if still in deck

	  }

	  if (his_self.game.state.henry_viii_add_elizabeth == 1) {

	    //
	    // Elizabeth should be added next round anyway
	    //

	  }

	}

	//
	// if sickly edward has been born but this card has been played, we want
	// to push it back into the deck next turn. the card will be removed because
	// it is a mandatory card, so we make a note to re-add it next turn.
	//
        if (his_self.game.state.henry_viii_sickly_edward == 1) {
	  his_self.game.state.henry_viii_mary_i_added_with_sickly_edward_played = 1;
	  return 1;
        }

	//
	// if Elizabeth has been born, we will tag to add her next round
	//
	// this code is in returnNewCards...
	//
	let placed = 0;
	if (his_self.game.state.leaders.henry_viii == 1) {

	  his_self.game.state.leaders.henry_viii = 0; 

	  //
          // mary_i replaces edward_vi or henry_viii
	  //
          let s = his_self.returnSpaceOfPersonage("england", "henry-viii");
          if (s != "") {
            let idx = his_self.returnIndexOfPersonageInSpace("england", "henry-viii", s);
            if (idx > -1) {
              his_self.game.spaces[s].units["england"].splice(idx, 1);
              his_self.addArmyLeader("england", s, "dudley");
	      placed = 1;
            } 
          }
	}

	if (placed == 0) {
          let s = his_self.returnSpaceOfPersonage("england", "dudley");
	  if (s == "") { his_self.addArmyLeader("england", "london", "dudley"); }
	}

	return 1;
      },
    }
    deck['022'] = { 
      img : "cards/HIS-022.svg" , 
      name : "Julius III" ,
      ops : 2 ,
      turn : 7 ,
      type : "mandatory" ,
      returnCustomOverlay : function() {
	return {
          text : "Paul III is replaced by Julius III. Papacy wins Counter-Reformation ties.",
          title : "Accession of Julius III",
          img : "/his/img/backgrounds/events/julius-iii.jpg",
	  msg : "Julius III becomes Pope...",
        }
      } ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.leo_x = 0;
	his_self.game.state.leaders.clement_vii = 0;
	his_self.game.state.leaders.paul_iii = 0;
	his_self.game.state.leaders.julius_iii = 1;
	his_self.removeCardFromGame('010');
	his_self.removeCardFromGame('014');
	return 1;
      },
    }
    deck['023'] = { 
      img : "cards/HIS-023.svg" , 
      name : "Elizabeth I" ,
      ops : 2 ,
      turn : 0 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) { return 1; },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.events.england_changed_rulers_this_turn = 1;

        //
        // removes captured leaders
        //
        for (let i = 0; i < his_self.game.state.players_info.length; i++) {
          for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
            if (his_self.game.state.players_info[i].captured[ii].type == "henry-viii") { his_self.game.state.players_info[i].captured.splice(ii, 1); ii--; } else {
              if (his_self.game.state.players_info[i].captured[ii].type == "charles-brandon") { his_self.game.state.players_info[i].captured.splice(ii, 1); ii--; }
  	    }
	  }
	}

	his_self.game.state.leaders.henry_viii = 0;
	his_self.game.state.leaders.edward_vi = 0;
	his_self.game.state.leaders.mary_i = 0;
	his_self.game.state.leaders.elizabeth_i = 1;
	his_self.removeCardFromGame('019');
	his_self.removeCardFromGame('021');
	return 1;
      },
    }
    deck['024'] = { 
      img : "cards/HIS-024.svg" , 
      name : "Arquebusiers" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu === "pre_field_battle_rolls" || menu === "pre_naval_battle_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (menu === "pre_field_battle_rolls") {
	    if (his_self.doesFactionHaveLandUnitsInSpace(f, his_self.game.state.field_battle.spacekey)) {
              return { faction : f , event : '024', html : `<li class="option" id="024">arquebusiers (${f})</li>` };
            }
	  }
	  if (menu === "pre_naval_battle_rolls") {
	    if (his_self.doesFactionHaveNavalUnitsInSpace(f, his_self.game.state.naval_battle.spacekey)) {
              return { faction : f , event : '024', html : `<li class="option" id="024">arquebusiers (${f})</li>` };
            }
	  }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
try {
        if (menu === "pre_field_battle_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    for (let z = 0; z < fis.length; z++) { fis[z] = his_self.returnControllingPower(fis[z]); }
	    if (fis.includes(f)) {
              if (his_self.game.deck[0].fhand[i].includes('024')) {
	        if (his_self.doesPlayerHaveLandUnitsInSpace(his_self.game.player, spacekey)) {
                  return 1;
                }
              }
            }
          }
        }
        if (menu === "pre_naval_battle_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
	      if (his_self.doesPlayerHaveNavalUnitsInSpace(his_self.game.player, spacekey)) {
                return 1;
              }
            }
          }
        }
} catch (err) { 
console.log("ERR: " + JSON.stringify(err));
}
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "pre_naval_battle_rolls") {
	  his_self.addMove("insert_before_counter_or_acknowledge\tadd_naval_battle_bonus_rolls\t"+faction+"\t2");
	  his_self.addMove("discard\t"+faction+"\t024");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("024"));
	  his_self.endTurn();
        }
        if (menu === "pre_field_battle_rolls") {
	  his_self.addMove("insert_before_counter_or_acknowledge\tadd_field_battle_bonus_rolls\t"+faction+"\t2");
	  his_self.addMove("discard\t"+faction+"\t024");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("024"));
	  his_self.endTurn();
        }
        return 1;
      },
    }
    deck['025'] = { 
      img : "cards/HIS-025.svg" , 
      name : "Field Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_field_battle_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('025')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (his_self.doesFactionHaveLandUnitsInSpace(f, his_self.game.state.field_battle.spacekey)) {
            return { faction : f , event : '025', html : `<li class="option" id="025">field artillery (${f})</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "pre_field_battle_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    for (let z = 0; z < fis.length; z++) { fis[z] = his_self.returnControllingPower(fis[z]); }
	    if (fis.includes(f)) {
              if (his_self.game.deck[0].fhand[i].includes('025')) {
	        if (his_self.doesPlayerHaveLandUnitsInSpace(his_self.game.player, spacekey)) {
                  return 1;
                }
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_field_battle_rolls") {
	  if (faction === "france" || faction === "ottoman") {
	    his_self.addMove("insert_before_counter_or_acknowledge\tadd_field_battle_bonus_rolls\t"+faction+"\t3");
	  } else {
	    his_self.addMove("insert_before_counter_or_acknowledge\tadd_field_battle_bonus_rolls\t"+faction+"\t2");
	  }
	  his_self.addMove("discard\t"+faction+"\t025");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("025"));
	  his_self.endTurn();
        }
        return 1;
      },
    }
    deck['026'] = { 
      img : "cards/HIS-026.svg" , 
      name : "Mercenaries Bribed" ,
      ops : 3 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_field_battle_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('026')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (f === "ottoman") { return {}; }
	  if (f != "") { 
	    if (his_self.doesFactionHaveLandUnitsInSpace(f, his_self.game.state.field_battle.spacekey)) {
              return { faction : f , event : '026', html : `<li class="option" id="026">mercenaries bribed (${f})</li>` };
            }
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "pre_field_battle_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    for (let z = 0; z < fis.length; z++) { fis[z] = his_self.returnControllingPower(fis[z]); }
	    if (fis.includes(f)) {
              if (his_self.game.deck[0].fhand[i].includes('026')) {
	        if (his_self.doesPlayerHaveLandUnitsInSpace(his_self.game.player, spacekey)) {
                  return 1;
                }
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_field_battle_rolls") {
	  his_self.addMove("mercenaries_bribed\t"+faction);
	  his_self.addMove("discard\t"+faction+"\t026");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("026"));
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "mercenaries_bribed") {

          his_self.game.queue.splice(qe, 1);

	  let cmd = "field_battle\t" + his_self.game.state.field_battle.spacekey+"\t"+his_self.game.state.field_battle.attacker_faction;

	  console.log("QUEUE: " + JSON.stringify(his_self.game.queue));

          let faction = mv[1];
	  let card_player_is_attacker = true;
	  if (his_self.game.state.field_battle.faction_map[faction] == his_self.game.state.field_battle.defender_faction) { card_player_is_attacker = false; }

          let spacekey = his_self.game.state.field_battle.spacekey;
          let fmap = his_self.game.state.field_battle.faction_map;
          let remove_next_mercenary = 1;
          let total_mercenaries_removed = 0;

	  if (card_player_is_attacker) {
	    for (let f in fmap) {
	      if (fmap[f] == his_self.game.state.field_battle.defender_faction) {
		for (let z = 0; z < his_self.game.spaces[spacekey].units[f].length; z++) {
		  let u = his_self.game.spaces[spacekey].units[f][z];
		  if (u.type === "mercenary") {
		    if (remove_next_mercenary) {
		      his_self.game.spaces[spacekey].units[f].splice(z, 1);
		      z--;
		      total_mercenaries_removed++;
		      remove_next_mercenary = 0;
		    } else {
		      remove_next_mercenary = 1;
		    }
		  }
		}  
	      }
	    }
	  } else {
	    for (let f in fmap) {
	      if (fmap[f] == his_self.game.state.field_battle.attacker_faction) {
		for (let z = 0; z < his_self.game.spaces[spacekey].units[f].length; z++) {
		  let u = his_self.game.spaces[spacekey].units[f][z];
		  if (u.type === "mercenary") {
		    if (remove_next_mercenary) {
		      his_self.game.spaces[spacekey].units[f].splice(z, 1);
		      z--;
		      total_mercenaries_removed++;
		      remove_next_mercenary = 0;
		    } else {
		      remove_next_mercenary = 1;
		    }
		  }
		}  
	      }
	    }
	  }

	  his_self.addMercenary(faction, spacekey, total_mercenaries_removed);

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lmv = his_self.game.queue[i].split("\t");
	    if (lmv[0].indexOf("field_b") == 0) {
	      his_self.game.queue.splice(i, 1); 
	    } else {
	      if (lmv[0].indexOf("RESOLVE") == 0 || lmv[0].indexOf("HALTED") == 0 || lmv[0].indexOf("counter_or_ac") == 0) {
	      } else {
	        his_self.game.queue.splice(i+1, 0, cmd);
	        if (lmv[0].indexOf("ACKNOWLEDGE") == 0) {} else {
	          i = 0;
	        }
	      }
	    }
	  }
        }
        return 1;
      },
    }
    deck['027'] = { 
      img : "cards/HIS-027.svg" , 
      name : "Mercenaries Grow Restless" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_assault_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              return { faction : f , event : '027', html : `<li class="option" id="027">mercenaries grow restless (${f})</li>` };
              break;
            }
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "pre_assault_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    for (let z = 0; z < fis.length; z++) { fis[z] = his_self.returnControllingPower(fis[z]); }
	    if (fis.includes(f)) {
              if (his_self.game.deck[0].fhand[i].includes('027')) {
	        let assault_spacekey = "";
	        if (his_self.game.state.assault) {
	          if (his_self.game.state.assault.spacekey) {
		    let fac = his_self.returnFactionControllingSpace(his_self.game.state.assault.spacekey);
		    if (his_self.game.player == his_self.returnPlayerCommandingFaction(fac)) {
                      return 1;
	 	    }
	 	  }
	 	}
	      }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_rolls") {
	  his_self.addMove(`mercenaries_grow_restless\t${faction}`);
  	  his_self.addMove(`discard\t${faction}\t027`);
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("027"));
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] === "mercenaries_grow_restless") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  his_self.updateLog(his_self.returnFactionName(faction) + " triggers " + his_self.popup("027"));
	  salert(his_self.returnFactionName(faction) + " events Mercenaries Grow Restless!"); 

          let player = his_self.returnPlayerOfFaction(faction);
	  let space = his_self.game.spaces[his_self.game.state.assault.spacekey];
	  let attacker_land_units_remaining = 0;
	  let defender_land_units_remaining = 0;
	  for (let f in his_self.game.state.assault.faction_map) {
            if (his_self.game.state.assault.faction_map[f] === his_self.game.state.assault.attacker_faction) {
	      for (let z = 0; z < space.units[f].length; z++) {
		if (space.units[f][z].type === "mercenary") {
		  space.units[f].splice(z, 1);
		  z--;
		} else {
		  if (space.units[f][z].type === "cavalry" || space.units[f][z].type === "regular") {
		    attacker_land_units_remaining++;
		  }
		}
	      }
            }       
            if (his_self.game.state.assault.faction_map[f] === his_self.game.state.assault.defender_faction) {
	      for (let z = 0; z < space.units[f].length; z++) {
		let u = space.units[f][z];
	        if (u.type === "mercenary" || u.type === "regular" || u.type === "cavalry") {
		  defender_land_units_remaining++;
		}
	      }
	    }
          }

	  if (defender_land_units_remaining > attacker_land_units_remaining) {

	    //
	    // remove rest of assault
	    //
	    for (let i = his_self.game.queue.length-1; i > 0 ; i--) {
	      let lmv = his_self.game.queue[i].split("\t");
	      if (!(lmv[0].indexOf("assault") == 0 || lmv[0].indexOf("counter") == 0 || lmv[0].indexOf("RESETC") == 0 || lmv[0].indexOf("RESOLVE") == 0 || lmv[0].indexOf("discard") == 0)) {
		break;
	      } else {
	        if (lmv[0].indexOf("RESOLVE") == 0 || lmv[0].indexOf("discard") == 0) {

	        } else {
		  his_self.game.queue.splice(i, 1);
	        }
	      }
	    }

	    his_self.game.queue.push("break_siege");
	    his_self.game.queue.push("hide_overlay\tassault");
    	    his_self.game.queue.push(`discard\t${faction}\t027`);

	  //
	  // assault may continue -- this will take us back to the acknowledge menu
	  //
	  } else {

	    //
	    // remove rest of assault
	    //
	    for (let i = his_self.game.queue.length-1; i > 0 ; i--) {
	      let lmv = his_self.game.queue[i].split("\t");
	      if (!(lmv[0].indexOf("discard") == 0 || lmv[0].indexOf("continue") == 0 || lmv[0].indexOf("play") == 0)) {
		his_self.game.queue.splice(i, 1);
	      } else {
		break;
	      }
	    }

	    his_self.game.queue.push(`assault\t${his_self.game.state.assault.attacker_faction}\t${his_self.game.state.assault.spacekey}`);
	    his_self.game.queue.push("hide_overlay\tassault");
    	    his_self.game.queue.push(`discard\t${faction}\t027`);

	  }

	}


        return 1;
      }
    }
    deck['028'] = { 
      img : "cards/HIS-028.svg" , 
      name : "Siege Mining" ,
      ops : 1 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, spacekey) {
        if (menu == "pre_assault_rolls") {
 	  if (his_self.game.player != his_self.game.state.active_player) {
	    return {};
	  }
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    for (let z = 0; z < fis.length; z++) { fis[z] = his_self.returnCommandingPower(fis[z]); }
	    if (fis.includes(f)) {
              if (his_self.game.deck[0].fhand[i].includes('028')) {
console.log("and we have Siege Mining...");
                f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
                return { faction : f , event : '028', html : `<li class="option" id="028">siege mining (${f})</li>` };
              }
            }
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) { // extra= assault spacekey
        if (menu == "pre_assault_rolls") {
          if (his_self.game.player != his_self.game.state.active_player) { return 0; }
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('028')) {
	      return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_rolls") {
	  his_self.addMove("add_assault_bonus_rolls\t"+faction+"\t3");
	  his_self.addMove("discard\t"+faction+"\t028");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("028"));
	  his_self.endTurn();
        }
        return 1;
      },
    }
    deck['029'] = { 
      img : "cards/HIS-029.svg" , 
      name : "Surprise Attack" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_field_battle_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (his_self.doesFactionHaveLandUnitsInSpace(f, his_self.game.state.field_battle.spacekey)) {
            return { faction : f , event : '029', html : `<li class="option" id="029">surprise attack (${f})</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) { // extra = spacekey of assault
        if (menu == "pre_field_battle_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    if (fis.includes(f)) {
              if (his_self.game.deck[0].fhand[i].includes('029')) {
	        for (let f in his_self.game.spaces[spacekey].units) {
		  if (his_self.returnFactionLandUnitsInSpace(f, his_self.game.spaces[spacekey]) > 0) {
		    if (his_self.game.player == his_self.returnPlayerCommandingFaction(f)) {
                      return 1;
                    }
                  }
                }
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_field_battle_rolls") {
	  let is_attacker = false;
	  for (let f in his_self.game.state.field_battle.faction_map) {
	    if (his_self.game.state.field_battle.faction_map[f] == his_self.game.state.field_battle.attacker_faction) {
	      is_attacker = true;
	    }
	  }
	  if (is_attacker) {
	    his_self.addMove("insert_before_counter_or_acknowledge\tfaction_assigns_hits_first_field_battle\tattacker");
	  } else {
	    his_self.addMove("insert_before_counter_or_acknowledge\tfaction_assigns_hits_first_field_battle\tdefender");
	  }

	  his_self.addMove("discard\t"+faction+"\t029");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("029"));
	  his_self.endTurn();
        }
        return 1;
      },
    }
    deck['030'] = { 
      img : "cards/HIS-030.svg" , 
      name : "Tercios" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, extra="") {
        if (menu === "pre_field_battle_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('030')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  let are_haps_in_space = false;
	  if (extra != "") {
	    if (his_self.game.spaces[extra]) {
	      for (let f in his_self.game.spaces[extra].units) {
		if (his_self.game.spaces[extra].units[f].length > 0) {
		  if (his_self.returnControllingPower(f) == "hapsburg") {
		    are_haps_in_space = true;
		  }
		}
	      }
	    }
	  }
	  if (!are_haps_in_space) { return {}; }
          return { faction : f , event : '030', html : `<li class="option" id="030">tercios (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu === "pre_field_battle_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    for (let z = 0; z < fis.length; z++) { fis[z] = his_self.returnControllingPower(fis[z]); }
	    if (fis.includes(f)) {
              if (his_self.game.deck[0].fhand[i].includes('030')) {
	        for (let f in his_self.game.spaces[spacekey].units) {
		  if (his_self.game.spaces[spacekey].units[f].length > 0) {
		    if (his_self.returnControllingPower(f) == "hapsburg") {
                      return 1;
                    }
                  }
                }
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "pre_field_battle_rolls") {
	  if (faction === "hapsburg") {
	    his_self.addMove("insert_before_counter_or_acknowledge\tadd_field_battle_bonus_rolls\t"+faction+"\t3");
            his_self.addMove("insert_before_counter_or_acknowledge\tSETVAR\tstate\tfield_battle\ttercios\t1");
	    his_self.addMove("discard\t"+faction+"\t030");
	    his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("030"));
	    his_self.endTurn();
          } else {
	    let nhr = 0;
	    for (let f in his_self.game.spaces[his_self.game.state.field_battle.spacekey].units) {
	      if (his_self.returnControllingPower(f) == "hapsburg") {
	        for (let i = 0; i < his_self.game.spaces[his_self.game.state.field_battle.spacekey].units[f].length; i++) {
		  if (his_self.game.spaces[his_self.game.state.field_battle.spacekey].units[f][i].type == "regular") {
		    nhr++;
	          }
	        }
	      }
	    }
	    if (nhr >= 3) {
	      his_self.addMove("discard\t"+faction+"\t030");
	      his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction) + " triggers " + his_self.popup("030"));
	      his_self.addMove("tercios_remove_haps_rolls\t"+his_self.game.state.field_battle.spacekey+"\t"+faction+"\t"+3);
	      his_self.endTurn();
	    } else {
	      // submit the resolve at least
	      his_self.endTurn();
	    }
	  }
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "tercios_remove_haps_rolls") {

	  let spacekey = mv[1];
	  let faction = mv[2];

	  if (his_self.returnControllingPower(his_self.game.state.field_battle.attacker_faction) == "hapsburg") {
	    for (let i = 0; i < 3; i++) {
	      if (his_self.game.state.field_battle.attacker_modified_rolls[i]) {
		if (his_self.game.state.field_battle.attacker_modified_rolls[i] >= 5) {
	          his_self.game.state.field_battle.attacker_hits--;
		}
	        his_self.game.state.field_battle.attacker_modified_rolls[i] = 0;
	      }
	    }
	  } else {
	    for (let i = 0; i < 3; i++) {
	      if (his_self.game.state.field_battle.defender_modified_rolls[i]) {
		if (his_self.game.state.field_battle.defender_modified_rolls[i] >= 5) {
	          his_self.game.state.field_battle.defender_hits--;
		}
	        his_self.game.state.field_battle.defender_modified_rolls[i] = 0;
	      }
	    }
	  }

          his_self.game.queue.splice(qe, 1);
	  his_self.displayModal(his_self.returnFactionName(faction) + " triggers Tercios");

	  return 1;

        }

        return 1;
      }
    }
    deck['031'] = { 
      img : "cards/HIS-031.svg" , 
      name : "Foul Weather" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "navalmove" || menu == "move" || menu == "assault" || menu == "piracy") {
	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('031')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '031', html : `<li class="option blink" id="031">foul weather (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "navalmove" || menu == "move" || menu == "assault" || menu == "piracy") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('031')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "navalmove" || menu == "move" || menu == "assault" || menu == "piracy") {
	  his_self.addMove(`foul_weather\t${player}\t${faction}`);
  	  his_self.addMove("discard\t"+faction+"\t"+"031");
	  if (his_self.game.deck[0].discards["032"]) {
            his_self.addMove("SETVAR\tstate\tevents\tintervention_on_movement_possible\t0");
            his_self.addMove("SETVAR\tstate\tevents\tintervention_on_assault_possible\t0");
	  }
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "foul_weather") {

          let player = mv[1];
          let faction = mv[2];
	  let is_move_over_pass = false;

          his_self.game.queue.splice(qe, 1);

	  his_self.displayModal(his_self.returnFactionName(faction) + " triggers Foul Weather");

	  his_self.updateLog(his_self.returnFactionName(faction) + " triggers " + his_self.popup("031"));
	  his_self.game.state.events.foul_weather = 1;


	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    let lmv = lqe.split("\t");
	    if (lmv[0] == "move") {
	      let source = lmv[3];
	      let destination = lmv[4];
	      if (his_self.game.spaces[source]) {
	        if (his_self.game.spaces[source].pass) {
	          for (let z = 0; z < his_self.game.spaces[source].pass.length; z++) {
		    if (his_self.game.spaces[source].pass[z] == destination) {
		      is_move_over_pass = true;
		    }
	          }
	        }
	      }
	    }
	  }


	  //
	  // "lose 1 CP"
	  //
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("cards_left") != 0 && lqe.indexOf("continue") != 0 && lqe.indexOf("play") != 0 && lqe.indexOf("counter_or_acknowledge") != 0 && lqe.indexOf("RESOLVE") != 0 && lqe.indexOf("HALTED") != 0) {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      // only stop if at "continue" or "play"
	      if (lqe.indexOf("cards_left") == 0 || lqe.indexOf("counter_or_acknowledge") == 0 || lqe.indexOf("RESOLVE") == 0 || lqe.indexOf("HALTED") == 0)  {
	      } else {
		if (is_move_over_pass) {
	          if (lqe.indexOf("continue") == 0) {
		    let lmv = lqe.split("\t");
		    let replacement_command = lmv[0] + "\t" + lmv[1] + "\t" + lmv[2] + "\t" + lmv[3] + "\t" + (parseInt(lmv[4])+1) + "\t" + lmv[5];
		    his_self.game.queue[i] = replacement_command;
		  }
		}
	        i = -1;
	      }
	    }
	  }

	  return 1;

        }

	return 1;
      }
    }
    deck['032'] = { 
      img : "cards/HIS-032.svg" , 
      name : "Gout" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "event") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
              return { faction : f , event : '032', html : '<li class="option blink" id="032">play gout</li>' };
	    }
	  }
	  return {};
	}
        if (menu == "move" || menu == "assault") {
	  let f = "";
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    }
	  }

	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }
	  if (f == "") { return {}; }

	  let includes_army_leader = false;

	  if (menu == "assault") {
	    for (let i = his_self.game.queue.length-1; i > 0; i--) {
	      let lqe = his_self.game.queue[i];
	      if (lqe.indexOf("assault") == 0) {
		let lmv = lqe.split("\t");
		if (lmv[0] === "assault") {
		  let faction = lmv[1];
		  let source = lmv[2];
		  let unit_idx = -1;
		  let space = his_self.game.spaces[source];
		  for (let i = 0; i < space.units[faction].length; i++) {
		    if (space.units[faction][i].army_leader == true) {
		      includes_army_leader = true;
		    }
		  }
		}
	      }
	    }
	  }

	  if (menu == "move") {
	    for (let i = his_self.game.queue.length-1; i > 0; i--) {
	      let lqe = his_self.game.queue[i];
	      if (lqe.indexOf("move") == 0) {
		let lmv = lqe.split("\t");
		if (lmv[0] === "move") {
		  let faction = lmv[1];
		  let source = lmv[3];
		  let unit_idx = -1;
		  for (let i = 0; i < his_self.game.spaces[source].units[faction].length; i++) {
		    let unit = his_self.game.spaces[source].units[faction][i];
		    if (unit.army_leader == true) {
		      let unit_idx = -1;
		      includes_army_leader = true;
		    }
		  }
		}
	      }
	    }
	  }

	  if (includes_army_leader) {
            return { faction : f , event : '032', html : '<li class="option blink" id="032">play gout</li>' };
	  } 
       }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra="") {
        if (menu == "event" && extra == "002") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      return 1;
	    }
	  }
	}
        if (menu == "move" || menu == "assault") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
	// only triggered by Holy Roman Emperor
	if (menu === "event") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              his_self.addMove("gout_stops_charles_v\t"+f);
  	      his_self.addMove(`discard\t${f}\t032`);
              his_self.endTurn();
	      return 1;
	    }
	  }
	}

	if (menu === "assault") {

	  let faction = null;
	  let source = null;
	  let unit_idx = null;

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("assault") == 0) {
	      let lmv = lqe.split("\t");
	      faction = lmv[1];
	      source = lmv[2];
	      if (lmv[0] === "assault") {
	        let space = his_self.game.spaces[source];
	        for (let i = 0; i < space.units[faction].length; i++) {
	          if (space.units[faction][i].army_leader) {
	            unit_idx = i;
	          }
	        }
	      }
	      break;
	    }
	  }

	  //
	  // out of desperation, give random unit gout
	  //
	  if (unit_idx == null) { unit_idx = 0; }

	  let f = "";
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

	  if (faction == null || source == null || unit_idx == null) { his_self.endTurn(); return 0; }
	  his_self.addMove(`gout\t${faction}\t${source}\t${unit_idx}\t${f}`);
  	  his_self.addMove(`discard\t${f}\t032`);
	  if (his_self.game.deck[0].discards["031"]) {
            his_self.addMove("SETVAR\tstate\tevents\tintervention_on_movement_possible\t0");
            his_self.addMove("SETVAR\tstate\tevents\tintervention_on_assault_possible\t0");
	  }
          his_self.endTurn();

	}


        if (menu === "move") {

	  let faction = null;
	  let source = null;
	  let unit_idx = null;

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("move") == 0) {
	      let lmv = lqe.split("\t");
	      if (lmv[0] === "move") {
		faction = lmv[1];
		source = lmv[3];
	        let space = his_self.game.spaces[source];
	        for (let i = 0; i < space.units[faction].length; i++) {
	          if (space.units[faction][i].army_leader) {
	            unit_idx = i;
	          }
	        }
	      }
	    }
	  }

	  //
	  // out of desperation, give random unit gout
	  //
	  if (unit_idx == null) { unit_idx = 0; }

	  let f = "";
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

	  if (faction == null || source == null || unit_idx == null) { his_self.endTurn(); return 0; }
	  his_self.addMove(`gout\t${faction}\t${source}\t${unit_idx}\t${f}`);
  	  his_self.addMove(`discard\t${f}\t032`);
	  if (his_self.game.deck[0].discards["031"]) {
            his_self.addMove("SETVAR\tstate\tevents\tintervention_on_movement_possible\t0");
            his_self.addMove("SETVAR\tstate\tevents\tintervention_on_assault_possible\t0");
	  }
          his_self.endTurn();

        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

	if (mv[0] === "gout_stops_charles_v") {

	  let triggering_faction = mv[1];

          his_self.game.queue.splice(qe, 1);

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    if (his_self.game.queue[i] == "event\thapsburg\t002") {
	      his_self.game.queue[i] = "ops\thapsburg\t002\t5";
	    }
	  }
	  his_self.updateLog(his_self.returnFactionName(triggering_faction) + " triggers Gout");
	  his_self.displayModal(his_self.returnFactionName(triggering_faction) + " triggers Gout");

	  return 1;

	}


        if (mv[0] === "gout") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source = mv[2];
	  let unit_idx = parseInt(mv[3]);
	  let triggering_faction = mv[4];

	  his_self.displayModal(his_self.returnFactionName(triggering_faction) + " triggers Gout");

	  his_self.game.spaces[source].units[faction][unit_idx].gout = true;
	  his_self.game.spaces[source].units[faction][unit_idx].locked = 1;
	  his_self.updateLog(his_self.game.spaces[source].units[faction][unit_idx].name + " has come down with " + his_self.popup("032"));

	  //
	  // "lose 1 CP"
	  //
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("cards_left") != 0 && lqe.indexOf("continue") != 0 && lqe.indexOf("play") != 0 && lqe.indexOf("counter_or_acknowledge") != 0 && lqe.indexOf("RESOLVE") != 0 && lqe.indexOf("HALTED") != 0) {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      // only stop if at "continue" or "play"
	      if (lqe.indexOf("cards_left") == 0 || lqe.indexOf("counter_or_acknowledge") == 0 || lqe.indexOf("RESOLVE") == 0 || lqe.indexOf("HALTED") == 0)  {
	      } else {
	        i = -1;
	      }
	    }
	  }

console.log("POST_GOUT_QUEUE: " + JSON.stringify(his_self.game.queue));

	  return 1;

	}

        return 1;
      }
    }
    deck['033'] = { 
      img : "cards/HIS-033.svg" , 
      name : "Landsknechts" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
        his_self.game.queue.push("landsknechts\t"+faction);
	return 1;
      },
      menuOption  :       function(his_self, menu, player, spacekey="") {
        if (menu == "pre_field_battle_rolls" || menu === "move" || menu === "assault") {
	  let f = "";
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('033')) {
	      if (spacekey != "") {
                if (his_self.returnFriendlyLandUnitsInSpace(his_self.game.state.players_info[his_self.game.player-1].factions[i], spacekey)) {
                  f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	          break;
	        }
	      } else {
	        f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	        break;
	      }
	    }
	  }
	  // removal is very messy if done when units are moving pre-field battle due to RESOLVES flying around
	  if (f === "ottoman" && menu === "pre_field_battle_rolls") { return {}; }
          return { faction : f , event : '033', html : `<li class="option blink" id="033">landsknechts (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu === "pre_field_battle_rolls" || menu === "move" || menu === "assault") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	    let fis = his_self.returnArrayOfFactionsInSpace(spacekey);
	    let one_of_ours = false;
	    for (let z = 0; z < fis.length; z++) {
	      let cf = fis[z];
	      cf = his_self.returnControllingPower(cf);
	      if (f == cf) { one_of_ours = true; }
	    }
	    if (one_of_ours) {
	      if (his_self.game.deck[0].fhand[i].includes('033')) {
	        if (menu === "assault") { 
		  let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
		  if (his_self.returnFriendlyUnbesiegedLandUnitsInSpace(faction, spacekey) > 0) {
		    return 1;
		  }
	        }

	        if (menu === "move") { 
		  let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
		  if (his_self.returnFactionLandUnitsInSpace(f, spacekey, 1) > 0) {
		    return 1;
	          }
		}

		if (menu === "pre_field_battle_rolls") {
	          return 1;
		}

	      }
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction, spacekey="") {
        if (menu === "pre_field_battle_rolls" || menu === "assault" || menu === "move") {

	  if (menu == "pre_field_battle_rolls") {
	    let spacekey = his_self.game.state.player_last_spacekey;
	    let num = 2;
	    if (faction === "hapsburg") { num = 4; }
	    his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" plays " + his_self.popup("033"));
            his_self.addMove("add_units_before_field_battle\t"+faction+"\t"+"mercenary"+"\t"+num+"\t"+spacekey);
            his_self.addMove("discard\t"+faction+"\t033");
            his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" triggers " + his_self.popup("033"));
            his_self.endTurn();

	  } else {

            his_self.addMove("discard\t"+faction+"\t033");
  	    his_self.addMove("landsknechts\t"+faction);
	    his_self.endTurn();            

	  }
	}
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "landsknechts") {

          let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == player) {

	    if (faction === "hapsburg") {
              his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, "hapsburg",
	        function(space) {
	  	  if (his_self.isSpaceUnderSiege(space.key)) { return 0; }
		  if (his_self.returnFactionLandUnitsInSpace("hapsburg", space.key)) { return 1; }
		  if (his_self.returnFriendlyLandUnitsInSpace("hapsburg", space.key)) { return 1; }
	        } ,
	        null ,
	        null ,
	        true
	      );
	    } else {
	      if (faction === "ottoman") {
                his_self.playerRemoveAnyFactionUnitsInSpaceWithFilter("mercenary", 2,
	          function(space) {
		    for (let key in space.units) {
		      for (let i = 0; i < space.units[key].length; i++) {
		        if (space.units[key][i].type === "mercenary") { return 1; }
		      }
		    }
	          } ,
	          null ,
	          null ,
	          true
	        );
	      } else {
                his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 2, faction,
	          function(space) {
		    if (his_self.isSpaceUnderSiege(space.key)) { return 0; }
		    if (his_self.returnFactionLandUnitsInSpace(faction, space.key)) { return 1; }
		    if (his_self.game.players.length == 2) {
		      if (faction == "protestant") {
			// protestants cannot put protestant mercs into spaces since
			// they aren't technically allied with those powers so much 
			// as just controlling them to screw with the Papacy.
			return 0;
		      }
		    }
		    if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
		    return 0;
	          } ,
	          null ,
	          null ,
	          true
	        );
	      }
	    }
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing Landsknechts");
	  }

          his_self.game.queue.splice(qe, 1);
	  return 0;

        }

	return 1;
      },
    }
    deck['034'] = { 
      img : "cards/HIS-034.svg" , 
      name : "Professional Rowers" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
	if (menu === "naval_intercept" || menu === "naval_avoid_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('034')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              i = 100;
            }
          }
          return { faction : f , event : '034', html : `<li class="option" id="034">professional rowers (${f})</li>` };
	}
        if (menu === "naval_intercept" || menu === "pre_naval_battle_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('034')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              i = 100;
            }
          }
	  if (his_self.game.state.naval_battle.attacker_faction != f && his_self.game.state.naval_battle.defender_faction != f) { return {}; }
          return { faction : f , event : '034', html : `<li class="option" id="034">professional rowers (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu === "naval_intercept" || menu === "naval_avoid_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('034')) {
              return 1;
            }
          }
        }
        if (menu === "pre_naval_battle_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('034')) {
              let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              if (his_self.doesFactionHaveNavalUnitsInSpace(f, spacekey)) {
                his_self.naval_battle_overlay.render(his_self.game.state.naval_battle);
                return 1;
              }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {

        his_self.addMove("SETVAR\tstate\tevents\tintervention_naval_avoid_battle_possible\t0");
        his_self.addMove("SETVAR\tstate\tevents\tintervention_naval_intercept_possible\t0");

	if (menu === "naval_intercept") {
	  his_self.game.state.naval_intercept_bonus = 2;
          his_self.addMove("SETVAR\tstate\tnaval_intercept_bonus\t2");
          his_self.addMove("discard\t"+faction+"\t034");
	  his_self.endTurn();
	  return 0;
	}

	if (menu === "naval_avoid_battle") {
	  his_self.game.state.naval_avoid_battle_bonus = 2;
          his_self.addMove("SETVAR\tstate\tnaval_avoid_battle_bonus\t2");
          his_self.addMove("discard\t"+faction+"\t034");
	  his_self.endTurn();
	  return 0;
	}

        if (menu === "pre_naval_battle_rolls") {

	  let attacker_faction = his_self.game.state.naval_battle.attacker_faction;
	  let defender_faction = his_self.game.state.naval_battle.defender_faction;

	  if (faction == attacker_faction || faction == defender_faction) {

	    his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" play " + his_self.popup("034"));
            his_self.addMove("discard\t"+faction+"\t034");
            his_self.addMove("add_naval_battle_bonus_rolls\t"+faction+"\t3");
            his_self.addMove("SETVAR\tstate\tevents\tintervention_post_naval_battle_possible\t0");
	    his_self.endTurn();
	    his_self.updateStatus("acknowledge");

          } else {

            let html = '<ul>';
  	    html += `<li class="option" id="${attacker_faction}">${attacker_faction}</li>`;
  	    html += `<li class="option" id="${defender_faction}">${defender_faction}</li>`;
    	    html += '</ul>';

            his_self.updateStatusWithOptions("Bonus Hits for Whom?", html);

   	    $('.option').off();
	    $('.option').on('click', function () {

	      let winner = $(this).attr("id");
   	      $('.option').off();
	      his_self.updateStatus("acknowledge");
	      his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" triggers " + his_self.popup("034"));
              his_self.addMove("discard\t"+faction+"\t034");
              his_self.addMove("add_naval_battle_bonus_rolls\t"+winner+"\t3");
              his_self.addMove("SETVAR\tstate\tevents\tintervention_post_naval_battle_possible\t0");
	      his_self.endTurn();

	    });

	  }

        }
        return 0;
      },
    }
    deck['035'] = { 
      img : "cards/HIS-035.svg" , 
      name : "Siege Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player, extra="") {
        if (menu === "post_assault_rolls") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('035')) {
	      let assault_spacekey = his_self.game.state.assault.spacekey;
	      let attacker_faction = his_self.game.state.assault.attacker_faction;
	      for (let z = 0; z < his_self.game.state.players_info[his_self.game.player-1].factions.length; z++) {
                if (attacker_faction == his_self.game.state.players_info[his_self.game.player-1].factions[z]) {
                  if (4 >= his_self.returnHopsToFortifiedHomeSpace(assault_spacekey, attacker_faction)) {
              	    f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              	    i = 100;
              	    return { faction : f , event : '035', html : `<li class="option blink" id="035">siege artillery (${f})</li>` };
		  }
		}
	      }
            }
          }
        }   
        return {};
      }, 
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu === "post_assault_rolls") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('035')) {
	      let assault_spacekey = his_self.game.state.assault.spacekey;
	      let attacker_faction = his_self.game.state.assault.attacker_faction;
	      if (his_self.game.spaces[assault_spacekey].neighbours.length == 0) { return 0; }
	      for (let z = 0; z < his_self.game.state.players_info[his_self.game.player-1].factions.length; z++) {
		if (attacker_faction == his_self.game.state.players_info[his_self.game.player-1].factions[z]) {
	          if (4 >= his_self.returnHopsToFortifiedHomeSpace(assault_spacekey, attacker_faction)) {
		    his_self.assault_overlay.render(his_self.game.state.assault);
	 	    return 1;
	          }
	        }
	      }
              return 0;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu === "post_assault_rolls") {
	  let attacker_faction = his_self.game.state.assault.attacker_faction;
          his_self.addMove("SETVAR\tstate\tassault\tsiege_artillery\t0");
	  his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" plays " + his_self.popup("035"));
          his_self.addMove("discard\t"+faction+"\t035");
          his_self.addMove("add_assault_bonus_rolls\t"+attacker_faction+"\t2");
          his_self.addMove("SETVAR\tstate\tassault\tsiege_artillery\t1");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" triggers " + his_self.popup("035"));
          his_self.addMove("SETVAR\tstate\tevents\tintervention_post_assault_possible\t0");
	  his_self.endTurn();
	  his_self.updateStatus("acknowledge");
        }
        return 0;
      },
    }
    deck['036'] = { 
      img : "cards/HIS-036.svg" , 
      name : "Swiss Mercenaries" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      canEvent : function(his_self, faction) { return 1; } ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let target_number = 2;
	let placing_faction = faction;
	if (faction == "ottoman") { placing_faction = "france"; target_number = 4; }
	if (faction == "france") { target_number = 4; }
	his_self.game.queue.push("swiss_mercenaries_place\t"+placing_faction+"\t"+target_number);

	return 1;

      },
      menuOption  :       function(his_self, menu, player, spacekey="") {
        if (menu == "pre_field_battle_rolls" || menu === "assault" || menu === "move") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('036')) {
	      if (spacekey != "") {
                if (his_self.returnFriendlyLandUnitsInSpace(his_self.game.state.players_info[his_self.game.player-1].factions[i], spacekey)) {
                  f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	          break;
	        }
	      } else {
                f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
                break;
              }
            }
          }
	  if (f != "") {
            return { faction : f , event : '036', html : `<li class="option blink" id="036">swiss mercenaries (${f})</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, spacekey) {
        if (menu == "pre_field_battle_rolls" || menu == "assault" || menu === "move") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('036')) {

	      if (menu === "assault") { 
		let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
		if (his_self.returnFriendlyUnbesiegedLandUnitsInSpace(faction, spacekey) > 0) {
		  return 1;
		}
	      }

	      if (menu === "move") { 
		let f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
		if (his_self.returnFactionLandUnitsInSpace(f, spacekey, 1) > 0) {
		  return 1;
	        }
	      }

	      if (menu == "pre_field_battle_rolls") { return 1; }

            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "move" || menu == "assault" || menu == "pre_field_battle_rolls") {
	  let target_faction = faction;
	  let target_number = 2;
	  if (faction == "ottoman" || faction == "france") {
	    target_faction = "france";
	    target_number = 4;
	  }
	  let spacekey = "";
	  if (menu === "pre_field_battle_rolls") { spacekey = his_self.game.state.player_last_spacekey; }

	  his_self.addMove("ACKNOWLEDGE\t"+his_self.returnFactionName(faction)+" plays " + his_self.popup("036"));
	  if (spacekey != "" && target_faction == faction) {
	    his_self.addMove("add_units_before_field_battle\t"+target_faction+"\t"+"mercenary"+"\t"+target_number+"\t"+spacekey);
          } else {
	    his_self.addMove("swiss_mercenaries_place\t"+target_faction+"\t"+target_number);
	  }
          his_self.addMove("discard\t"+faction+"\t036");
	  his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" triggers " + his_self.popup("036"));
	  his_self.endTurn();
	}
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "swiss_mercenaries_place") {

          let faction = mv[1];
          let num = parseInt(mv[2]);
          his_self.game.queue.splice(qe, 1);

	  let player = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == player) {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", num, faction,
	      function(space) {
		for (let f in space.units) {
		  for (let z = 0; z < space.units[f].length; z++) { 
		    if (space.units[f][z].besieged > 0) {
		      if (his_self.returnPlayerCommandingFaction(f) == player) { return 0; }
		    }
	          }
	        }
		if (his_self.returnFactionLandUnitsInSpace(faction, space.key)) { return 1; }
		if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
	        return 0;
	      } ,
	      null ,
	      null ,
	      true
	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("036"));
	  }

	  return 0;
        }

	return 1;
      },
    }
    deck['037'] = { 
      img : "cards/HIS-037.svg" , 
      name : "The Wartburg" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 0; } ,
      menuOption  :       function(his_self, menu, player, card="") {

        if (menu == "event") {

	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }

	  let p = his_self.returnPlayerOfFaction();

          if (his_self.game.state.leaders.luther !== 1) { return {}; }
          if (card === "") { return {}; }
          if (!his_self.game.deck[0]) { return {}; }

	  //
	  // card evented
	  //
	  let cardobj = his_self.game.deck[0].cards[card];

	  //
	  // cannot cancel non-papal home cards
	  //
	  if (card === "001" || card == "002" || card == "003" || card == "004") { return {}; }

	  //
	  // cannot cancel these three types of cards
	  //
	  if (cardobj.type === "response") { return {}; }
	  if (cardobj.type === "mandatory") { return {}; }
	  if (cardobj.type === "combat") { return {}; }

          return { faction : "protestant" , event : '037', html : `<li class="option blink" id="037">wartburg (protestant)</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "event") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('037')) {
	      if (his_self.returnPlayerOfFaction("protestant") == his_self.game.player) {
 		return 1;
	      }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "event") {
	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
          his_self.addMove("NOTIFY\tWartburg Evented");
          his_self.addMove("wartburg");
          his_self.addMove("discard\tprotestant\t037");
          his_self.addMove("commit\tprotestant\tluther-debater");
	  his_self.endTurn();
	  his_self.updateStatus("wartburg acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "wartburg") {

          his_self.game.queue.splice(qe, 1);

	  his_self.displayModal("Protestants cancel event with the Wartburg");

	  his_self.updateStatus(his_self.popup("037") + " triggered");
	  his_self.game.state.events.wartburg = 1;
	  his_self.commitDebater("protestant", "luther-debater", 0);
	  his_self.updateLog(his_self.popup("037") + " triggered");

	  //
	  // remove event from execution and end player turn
	  //
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lmv = his_self.game.queue[i].split("\t");
	    // TODO -- test if removes still now we have removed "remove"
	    if (lmv[0] !== "cards_left" && lmv[0] !== "discard" && lmv[0] !== "round" && lmv[0] !== "play" && lmv[0].indexOf("counter_or_acknowledge") != 0 && lmv[0].indexOf("RESOLVE") != 0 && lmv[0].indexOf("HALTED") != 0) { 
	      his_self.game.queue.splice(i, 1);
	    } else {
	      if (lmv[0] === "remove") {
		let x = "discard";
		for (let z = 1; z < lmv.length; z++) { x += "\t"; x += lmv[1]; }
		his_self.game.queue[i] = x;
	      }
	      if (lmv[0] === "round" || lmv[0] === "play") {
		i == 0;
		break;
	      }
	    }
	  }

	  return 1;

        }

	return 1;
      },
    }
    deck['038'] = { 
      img : "cards/HIS-038.svg" , 
      name : "Halley's Comet" ,
      ops : 2 ,
      turn : 3 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu != "" && menu != "pre_spring_deployment") {
	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }

          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('038')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '038', html : `<li class="option blink" id="038">halley's comet (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu != "" && menu != "pre_spring_deployment") {
	  if (his_self.game.state.active_player === his_self.game.player) { 
	    // not in translation and reformation overlays
	    if (menu.indexOf("lation") > 0 || menu.indexOf("ormation") > 0) {
	      return 0;
	    }
	  }
	  if (!his_self.game.deck) { return 0; }
	  if (!his_self.game.deck[0]) { return 0; }
	  if (!his_self.game.deck[0].fhand) { return 0; }
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('038')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu != "" && menu != "pre_spring_deployment") {

	  let p = his_self.returnPlayerCommandingFaction(faction);
	  if (his_self.game.player == p) {

	    let msg = "Target which Power?";
	    let html = '<ul>';

	    if (faction != "protestant") { html += '<li class="option" id="protestant">Protestant</li>'; }
	    if (faction != "papacy") { html += '<li class="option" id="papacy">Papacy</li>'; }
	    if (his_self.game.players.length > 2) {
	      if (faction != "england") { html += '<li class="option" id="england">England</li>'; }
	      if (faction != "france") { html += '<li class="option" id="france">France</li>'; }
	      if (faction != "hapsburg") { html += '<li class="option" id="hapsburg">Hapsburg</li>'; }
	      if (faction != "ottoman") { html += '<li class="option" id="ottoman">Ottoman</li>'; }
	    }
            html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let target_faction = $(this).attr("id");

  	      let msg = "Force Power to Discard or Skip Turn?";
	      let html = '<ul>';
	      html += '<li class="option" id="discard">discard random card</li>';
	      html += '<li class="option" id="skip">skip next turn</li>';
	      html += '<ul>';

    	      his_self.updateStatusWithOptions(msg, html);

	      $('.option').off();
	      $('.option').on('click', function () {

	        $('.option').off();
	        let action = $(this).attr("id");

	        his_self.updateStatus("submitted");

	        if (action === "discard") {
                  his_self.addMove("discard_random\t"+target_faction);
  	  	  his_self.addMove("remove\t"+faction+"\t038");
  	  	  his_self.addMove("discard\t"+faction+"\t038");
  	          his_self.addMove("NOTIFY\tHalley's Comet forces "+his_self.returnFactionName(target_faction)+" to discard a card");
	  	  his_self.endTurn();
	        }

	        if (action === "skip") {
                  his_self.addMove("skip_next_impulse\t"+target_faction);
  	  	  his_self.addMove("remove\t"+faction+"\t038");
  	  	  his_self.addMove("discard\t"+faction+"\t038");
  	          his_self.addMove("NOTIFY\tHalley's Comet forces "+his_self.returnFactionName(target_faction)+" to skip next turn");
		  his_self.endTurn();
	        }
	      });
	    });
	  }
        }
        return 0;
      },
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction(faction);

	if (player == his_self.game.player) {

	  let msg = "Target which Power?";
	  let html = '<ul>';

	  if (faction != "protestant") { html += '<li class="option" id="protestant">Protestant</li>'; }
	  if (faction != "papacy") { html += '<li class="option" id="papacy">Papacy</li>'; }
	  if (his_self.game.players.length > 2) {
	    if (faction != "england") { html += '<li class="option" id="england">England</li>'; }
	    if (faction != "france") { html += '<li class="option" id="france">France</li>'; }
	    if (faction != "hapsburg") { html += '<li class="option" id="hapsburg">Hapsburg</li>'; }
	    if (faction != "ottoman") { html += '<li class="option" id="ottoman">Ottoman</li>'; }
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let target_faction = $(this).attr("id");

  	    let msg = "Force Power to Discard or Skip Turn?";
	    let html = '<ul>';
	    html += '<li class="option" id="discard">discard random card</li>';
	    html += '<li class="option" id="skip">skip next turn</li>';
	    html += '<ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      his_self.updateStatus("submitted");

	      if (action === "discard") {
                his_self.addMove("discard_random\t"+target_faction);
  	        his_self.addMove("NOTIFY\tHalley's Comet forces "+his_self.returnFactionName(target_faction)+" to discard a card");
		his_self.endTurn();
	      }

	      if (action === "skip") {
                his_self.addMove("skip_next_impulse\t"+target_faction);
  	        his_self.addMove("NOTIFY\tHalley's Comet forces "+his_self.returnFactionName(target_faction)+" to skip next turn");
		his_self.endTurn();
	      }

	    });
	  });

          return 0;

        }

	return 0;
      },
    }
    deck['039'] = { 
      img : "cards/HIS-039.svg" , 
      warn : ["papacy"] ,
      name : "Augsburg Confession" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	if (his_self.isCommitted("melanchthon-debater")) { return 0; }
 	return 1;
      } ,
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction(faction);

	if (his_self.isCommitted("melanchthon-debater")) { return 1; }
	his_self.game.state.events.augsburg_confession = 1;
	his_self.commitDebater("papacy", "melanchthon-debater", 0); // 0 = no bonus

	return 1;
      },
    }
    deck['040'] = { 
      img : "cards/HIS-040.svg" , 
      name : "Machiavelli: The Prince" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction("protestant");

	if (player == his_self.game.player) {

	  let powers = his_self.returnImpulseOrder();
	  let msg = "Declare War on which Power?";

          let html = '<ul>';
	  for (let i = 0; i < powers.length; i++) {
	    if (powers[i] !== faction) {
	      if (!(powers[i] == "protestant" && his_self.game.state.events.schmalkaldic_league != 1)) {
		if (!his_self.areEnemies(powers[i], faction) && !his_self.areAllies(powers[i], faction)) {
                  html += `<li class="option" id="${powers[i]}">${powers[i]}</li>`;
	        }
	      }
	    }
	  }
	  if (html === "") {
            html += `<li class="option" id="skip">skip declaration</li>`;
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");

	    if (action === "skip") { 
              his_self.addMove("ops\t"+faction+"\t"+"040"+"\t"+2);
	      his_self.endTurn();
	      return 0;	
	    }

            his_self.addMove("ops\t"+faction+"\t"+"040"+"\t"+2);
	    his_self.addMove("unexpected_war\t"+faction+"\t"+action);
            his_self.addMove("declare_war\t"+faction+"\t"+action);
	    his_self.endTurn();

	  });

        }

        return 0;
      },
    }

    deck['041'] = { 
      img : "cards/HIS-041.svg" , 
      name : "Marburg Colloquy" ,
      warn : ["papacy"] ,
      ops : 5 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { 
	if (
	  (his_self.isCommitted("luther-debater") != 1 || his_self.isCommitted("melanchthon-debater"))
	  &&
	  (his_self.isCommitted("zwingli-debater") != 1 || his_self.isCommitted("oekolampadius-debater"))
	) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction("protestant");
	if (his_self.game.player === player) {

	  let msg = "Commit which Debaters?";
          let html = '<ul>';
	  if (his_self.isCommitted("luther-debater") != 1) {
	    if (his_self.isCommitted("zwingli-debater") != 1) {
              html += '<li class="option" id="lz">Luther and Zwingli</li>';
	    }
	    if (his_self.isCommitted("oekolampadius-debater") != 1) {
              html += '<li class="option" id="lo">Luther and Oekolampadius</li>';
	    }
	  }
	  if (his_self.isCommitted("melanchthon-debater") != 1) {
	    if (his_self.isCommitted("zwingli-debater") != 1) {
              html += '<li class="option" id="mz">Melanchthon and Zwingli</li>';
	    }
	    if (his_self.isCommitted("oekolampadius-debater") != 1) {
              html += '<li class="option" id="mo">Melanchthon and Oekolampadius</li>';
	    }
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");
	    let refs = 0;

            his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");

	    if (action === "lz") {
	      his_self.addMove("commit\tprotestant\tluther-debater");
	      his_self.addMove("commit\tprotestant\tzwingli-debater");
	      refs = 7;
	    }
	    if (action === "lo") {
	      his_self.addMove("commit\tprotestant\tluther-debater");
	      his_self.addMove("commit\tprotestant\toekolampadius-debater");
	      refs = 6;
	    }
	    if (action === "mz") {
	      his_self.addMove("commit\tprotestant\tzwingli-debater");
	      his_self.addMove("commit\tprotestant\tmelanchthon-debater");
	      refs = 6;
	    }
	    if (action === "mo") {
	      his_self.addMove("commit\tprotestant\toekolampadius-debater");
	      his_self.addMove("commit\tprotestant\tmelanchthon-debater");
	      refs = 5;
	    }

	    for (let i = 0; i < refs; i++) {
              his_self.prependMove("protestant_reformation\t"+player+"\tall");
	    }
            his_self.prependMove("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	    his_self.addMove("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	    his_self.endTurn();

	  });
	}
	return 0;
      },
    }
    deck['042'] = { 
      img : "cards/HIS-042.svg" , 
      name : "Roxelana" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	his_self.game.state.events.roxelana = 1;

	if (faction === "ottoman") {
	  if (his_self.game.player == his_self.returnPlayerCommandingFaction("ottoman")) {
	    his_self.addMove("ops\tottoman\t042\t4");
	    his_self.endTurn();
	  }
	  return 1;
	} else {

	  if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

	    let msg = "Send Suleiman to Istanbul (2 CP)?";
            let html = '<ul>';
                html += '<li class="option" id="yes">yes</li>';
                html += '<li class="option" id="no">no</li>';
                html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      his_self.updateStatus("acknowledge");
	      $('.option').off();
	      let action = $(this).attr("id");

	      let sk = his_self.returnSpaceOfPersonage("ottoman", "suleiman");
	      let sk_idx = his_self.returnIndexOfPersonageInSpace("ottoman", "suleiman", sk);

	      if (action === "yes" && sk != "") {
	        his_self.addMove("ops\t"+faction+"\t042\t2");
	        his_self.addMove("move" + "\t" + "ottoman" + "\t" + "land" + "\t" + sk + "\t" + "istanbul" + "\t" + sk_idx + "\t1");
	      }
	      if (action === "no") {
	        his_self.addMove("ops\t"+faction+"\t042\t4"); 
	      }
	      his_self.endTurn();

	    });
	    return 0;
	  }
	}

	return 0;
      },
    }
    deck['043'] = { 
      img : "cards/HIS-043.svg" , 
      name : "Zwingli Dons Armor" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction("protestant");
	let targets = ["zurich","innsbruck","salzberg","linz","graz","regensburg","augsburg","nuremberg","worms","basel","geneva","turin","grenoble","lyon","besancon","dijon","metz","strasburg"];

	//
	// we all remove the reformer
	//
	his_self.removeReformer("protestant", "zurich", "zwingli-reformer");
	his_self.removeDebater("protestant", "zwingli-debater");

        if (player == his_self.game.player) {
          let count = his_self.countSpacesWithFilter(function(space) {
            if (targets.includes(space.key) && his_self.hasCatholicLandUnits(space.key)) {
              return 1
            }
            return 0;
          });

          if (count == 0) { return 1; }

          his_self.playerSelectSpaceWithFilter(
            "Select Space to Remove Catholic Land Unit",
            function(space) {
              if (targets.includes(space.key) && his_self.hasCatholicLandUnits(space.key)) {
                return 1
              }
              return 0;
            },
            function(spacekey) {

              let catholic_land_units = his_self.returnCatholicLandUnitsInSpace(spacekey);
              let msg = "Remove which Unit?";
              let html = '<ul>';
              for (let i = 0; i < catholic_land_units.length; i++) {
                let u = his_self.game.spaces[spacekey].units[catholic_land_units[i].faction][catholic_land_units[i].unit_idx];
                html += `<li class="option" id="${catholic_land_units[i].faction}_${catholic_land_units[i].unit_idx}">${catholic_land_units[i].faction} - ${u.type}</li>`;
              }

	      if (catholic_land_units.length == 1) {
		his_self.addMove("destroy_unit_by_index\t"+catholic_land_units[0].faction+"\t"+spacekey+"\t"+"\t"+catholic_land_units[0].unit_idx);
		his_self.addMove("NOTIFY\tZwingli destroys Catholic unit in " + his_self.returnSpaceName(spacekey));
		his_self.endTurn();
		return 0;
	      }

              his_self.updateStatusWithOptions(msg, html);

	      $('.option').off();
	      $('.option').on('click', function () {
	        $('.option').off();
	        let x = $(this).attr("id").split("_");
		his_self.addMove("destroy_unit_by_index\t"+x[0]+"\t"+spacekey+"\t"+"\t"+x[1]);
		his_self.endTurn();            
	      });
            },
            null,
            true,
          );
        }
	return 0;
      },
    }
    deck['044'] = { 
      img : "cards/HIS-044.svg" , 
      name : "Affair of the Placards" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { if (his_self.isCommitted("cop-debater")) { return 0; } return 1; } ,
      onEvent : function(his_self, faction) {

	if (his_self.isCommitted("cop-debater")) { return 1; }

	his_self.commitDebater("protestant", "cop-debater", 0); // no bonus

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("NOTIFY\t"+his_self.popup("044"));

	return 1;
      },
    }
    deck['045'] = { 
      img : "cards/HIS-045.svg" , 
      name : "Calvin Expelled" ,
      ops : 1 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

        let obj = {};
        obj.faction = "protestant";

        his_self.excommunicateReformer("calvin-reformer");
	his_self.commitDebater("protestant", "calvin-debater");
	his_self.removeDebater("protestant", "calvin-debater");

	his_self.displaySpace("geneva");

        return 1;
      },
    }
    deck['046'] = { 
      img : "cards/HIS-046.svg" , 
      name : "Calvin's Institutes" ,
      ops : 5 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { if (!his_self.isCommitted("calvin-debater")) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {

	if (his_self.isCommitted("calvin-debater")) { return 1; }

	his_self.commitDebater("protestant", "calvin-debater", 0); // no bonus

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("SETVAR\tstate\tevents\tcalvins_institutes\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("SETVAR\tstate\tevents\tcalvins_institutes\t1");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("NOTIFY\tCalvin's Institutes");

	return 1;
      },
    }
    deck['047'] = { 
      img : "cards/HIS-047.svg" , 
      name : "Copernicus" ,
      ops : 6 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

        let home_spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].home === faction) {
	      return 1;
	    }
	    return 0;
	  }
	);

	let total = home_spaces.length;
	let count = 0;
	let double_vp = 0;

	for (let i = 0; i < home_spaces.length; i++) {
	  if (his_self.game.spaces[home_spaces[i]].religion === "protestant") { count++; }
	}

	if (count >= (total/2)) {
	  double_vp = 1;
	}

	if (double_vp == 1) {

	  // faction will gain when counted
	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;
	  his_self.updateLog(his_self.returnFactionName(faction) + " earns 2 VP from Copernicus");
	  his_self.displayVictoryTrack();

	  return 1;

	} else {

	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 1;
	  his_self.updateLog(his_self.returnFactionName(faction) + " earns 1 VP from Copernicus");
          his_self.displayVictoryTrack();

	  let p = his_self.returnPlayerOfFaction(faction);

	  //
	  // player processes and adds move / ends turn
	  //
	  if (his_self.game.player == p) {

	    let msg = "Which would you prefer?";
    	    let html = '<ul>';
                html += '<li class="option" id="draw">draw 1 card</li>';
                html += '<li class="option" id="discard">protestants discard</li>';
    		html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      his_self.updateStatus("selected...");

	      let action = $(this).attr("id");
   	      $('.option').off();
	      if (action === "draw") {
	        let cardnum = 1;
                his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+faction+"\t1");
                his_self.addMove("DEAL\t1\t"+p+"\t"+(cardnum));
		his_self.endTurn();
	      } else {
                his_self.addMove("discard_random\tprotestant");
		his_self.endTurn();
	      }
	    });

	  }
	}

	return 0;

      },

    }
    deck['048'] = { 
      img : "cards/HIS-048.svg" , 
      name : "Galleons" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { 
	if (his_self.game.state.galleons['france'] == 0 || his_self.game.state.galleons['england'] == 0 || his_self.game.state.galleons['hapsburg'] == 0) {
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player == p) {

	    let msg = "Which Faction gets Galleons?";
    	    let html = '<ul>';
	    if (his_self.game.state.galleons['france'] == 0) {
                html += '<li class="option" id="france">France</li>';
 	    }  
	    if (his_self.game.state.galleons['england'] == 0) {
                html += '<li class="option" id="england">England</li>';
 	    }  
	    if (his_self.game.state.galleons['hapsburg'] == 0) {
                html += '<li class="option" id="hapsburg">Hapsburgs</li>';
 	    }  
 		html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {
	      his_self.updateStatus("acknowledge");
	      let action = $(this).attr("id");
	      his_self.addMove("display_new_world");
	      his_self.addMove("SETVAR\tstate\tgalleons\t"+action+"\t1");
	      his_self.endTurn();
	    });
	}

	return 0;

      },
    }
    deck['049'] = { 
      img : "cards/HIS-049.svg" , 
      name : "Huguenot Raiders" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { 
	for (let key in his_self.game.spaces) {

	  let space = his_self.game.spaces[key];

	  if (space.home == "protestant") { if (his_self.game.state.raiders['protestant'] == 0 && space.ports.length > 0) { if (space.religion == "protestant") { return 1; } } }
	  if (space.home == "england") { if (his_self.game.state.raiders['england'] == 0 && space.ports.length > 0) { if (space.religion == "protestant") { return 1; } } }
	  if (space.home == "france") { if (his_self.game.state.raiders['france'] == 0 && space.ports.length > 0) { if (space.religion == "protestant") { return 1; } } }

	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player === p) {

	  let valid_for_protestant = false;
	  let valid_for_england    = false;
	  let valid_for_france     = false;

	  for (let key in his_self.game.spaces) {
	    let space = his_self.game.spaces[key];
	    let skip_keys = ["innsbruck","linz","vienna","graz","zurich","basel"];
	    if (space.home == "protestant" || (space.language == "german" && !skip_keys.includes(key))) { if (his_self.game.state.raiders['protestant'] == 0 && space.ports.length > 0) { if (space.religion == "protestant") { valid_for_protestant = true; } } }
	    if (space.home == "england") { if (his_self.game.state.raiders['england'] == 0 && space.ports.length > 0) { if (space.religion == "protestant") { valid_for_england = true; } } }
	    if (space.home == "france") { if (his_self.game.state.raiders['france'] == 0 && space.ports.length > 0) { if (space.religion == "protestant") { valid_for_france = true; } } }
	  }

 	  let msg = "Choose Faction for Huguenot Raiders?";
          let html = '<ul>';
	  if (valid_for_protestant) {
	    html += '<li class="option" id="protestant">Protestant</li>';
	  }
	  if (valid_for_england) {
	    html += '<li class="option" id="england">England</li>';
	  }
	  if (valid_for_france) {
	    html += '<li class="option" id="france">France</li>';
	  }
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");
	    his_self.updateStatus("acknowledge");

	    his_self.addMove("display_new_world");
            his_self.game.queue.push("SETVAR\tstate\traiders\t"+action+"\t1");
            his_self.game.queue.push("NOTIFY\tHuguenot Raiders active for "+his_self.returnFactionName(action));
            his_self.endTurn();

	  });
	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " selecting Raiders");
	}

	return 0;
      },
    }
    deck['050'] = { 
      img : "cards/HIS-050.svg" , 
      name : "Mercator's Map" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { if (his_self.game.state.may_explore['hapsburg'] == 1 || his_self.game.state.may_explore['france'] == 1 || his_self.game.state.may_explore['england'] == 1) { return 1; } return 0; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player === p) {

 	  let msg = "Launch Voyage of Discovery for Whom?";
          let html = '<ul>';
          if (his_self.game.state.may_explore['england'] == 1) { 
	    html += '<li class="option" id="england">England</li>';
          }
          if (his_self.game.state.may_explore['france'] == 1) { 
	    html += '<li class="option" id="france">France</li>';
          }
          if (his_self.game.state.may_explore['hapsburg'] == 1) { 
            html += '<li class="option" id="hapsburg">Hapsburg</li>';
          }
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");
	    his_self.updateStatus("acknowledge");

            his_self.addMove("explore\t"+action);
	    his_self.addMove("display_new_world");
            his_self.addMove("SETVAR\tstate\tmay_explore\t"+action+"\t1");
            his_self.addMove("SETVAR\tstate\tevents\tmercators_map\t"+action);
            his_self.endTurn();

	  });
	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing Mercator's Map");
	}

	return 0;
      },
    }
    deck['051'] = { 
      img : "cards/HIS-051.svg" , 
      name : "Michael Servetus" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	his_self.updateLog(his_self.returnFactionName(faction) + " +1 VP from Michael Servetus");
	his_self.game.state.events.michael_servetus = faction;
	his_self.game.queue.push("discard_random\tprotestant");

	return 1;

      }
    }
    deck['052'] = { 
      img : "cards/HIS-052.svg" , 
      name : "Michelangelo" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let x = his_self.rollDice(6);
	let y = his_self.rollDice(6);

	his_self.updateLog("Papacy rolls "+x+" and "+y);

	his_self.game.queue.push("build_saint_peters_with_cp\t"+(x+y));

        return 1;
          
      },
    }
    deck['053'] = { 
      img : "cards/HIS-053.svg" , 
      name : "Plantations" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.plantations['england'] == 0) { return 1; }
	if (his_self.game.state.plantations['hapsburg'] == 0) { return 1; } 
	if (his_self.game.state.plantations['france'] == 0) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player === p) {

 	  let msg = "Choose Faction for Plantations?";
          let html = '<ul>';
	  if (his_self.game.state.plantations['england'] == 0) {
	    html += '<li class="option" id="england">England</li>';
	  }
	  if (his_self.game.state.plantations['france'] == 0) {
	    html += '<li class="option" id="france">France</li>';
	  }
	  if (his_self.game.state.plantations['hapsburg'] == 0) {
	    html += '<li class="option" id="hapsburg">Hapsburg</li>';
	  }
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");
	    his_self.updateStatus("acknowledge");

	    his_self.addMove("display_new_world");
            his_self.addMove("SETVAR\tstate\tplantations\t"+action+"\t1");
            his_self.endTurn();

	  });
	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " building Plantations");
	}

	return 0;
      },
    }
    deck['054'] = { 
      img : "cards/HIS-054.svg" , 
      name : "Potosi Silver Mines " ,
      ops : 3 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player === p) {

 	  let msg = "Who Discovers the Potosi Silver Mines?";
          let html = '<ul>';
          html += '<li class="option" id="england">England</li>';
          html += '<li class="option" id="france">France</li>';
          html += '<li class="option" id="hapsburg">Hapsburg</li>';
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");
	    his_self.updateStatus("acknowledge");

	    his_self.addMove("display_new_world");
	    his_self.addMove("SETVAR\tstate\tevents\tpotosi_silver_mines\t"+action);
	    his_self.addMove("NOTIFY\t"+his_self.returnFactionName(action)+" discovers Potosi Silver Mines");
            his_self.endTurn();

	  });
	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " placing Potosi Silver Mines");
	}

	return 0;
      },
    }
    deck['055'] = { 
      img : "cards/HIS-055.svg" , 
      name : "Jesuit Education" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { if (his_self.game.state.events.society_of_jesus) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {
	if (his_self.game.state.events.society_of_jesus) { his_self.game.queue.push("jesuit_education"); }
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "jesuit_education") {

          his_self.game.queue.splice(qe, 1);

	  if (!his_self.game.state.events.society_of_jesus) {
	    return 1;
	  }

	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {
	    his_self.playerSelectSpaceWithFilter(
	      "Select Catholic Space for 1st Jesuit University",
	      function(space) { if (space.religion === "catholic" && space.university != 1) { return 1; } return 0; },
	      function(spacekey) {
	        his_self.game.spaces[spacekey].university = 1;
	        his_self.displaySpace(spacekey);
		his_self.addMove("found_jesuit_university\t"+spacekey);
		let first_spacekey = spacekey;
	
	        his_self.playerSelectSpaceWithFilter(
	          "Select Catholic Space for 2nd Jesuit University",
	          function(space) { if (space.key != first_spacekey && space.religion === "catholic" && space.university != 1) { return 1; } return 0; },
	          function(spacekey) {
		    his_self.updateStatus("building universities...");
	            his_self.game.spaces[spacekey].university = 1;
	            his_self.displaySpace(spacekey);
		    his_self.addMove("found_jesuit_university\t"+spacekey);
		    his_self.endTurn();
		  },
		  null,
		  true
		);

	      },
	      null ,
	      true
	    );

	  } else {
	    his_self.updateStatus("Papacy building Jesuit Universities");
	  }

	  return 0;

        }
        return 1;
      }


    }
    deck['056'] = { 
      img : "cards/HIS-056.svg" , 
      warn : ["protestant"] ,
      name : "Papal Inquistion" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (his_self.isCommitted("caraffe-debater")) { return 1; }

	if (his_self.game.player == his_self.returnPlayerOfFaction("papacy")) {

	  his_self.commitDebater("papacy", "caraffe-debater", 0); // no bonus
	  his_self.addMove("papal_inquisition_target_player");
	  his_self.addMove("papal_inquisition_convert_spaces");
	  his_self.endTurn();

	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "papal_inquisition_convert_spaces") {

	  let player = his_self.returnPlayerOfFaction("papacy");
          his_self.game.queue.splice(qe, 1);

	  let count = his_self.countSpacesWithFilter(function(space) {
	    if (space.language === "italian" && space.religion === "protestant") { return 1; } return 0;
	  });
	  if (count == 0) { return 1; }

	  if (his_self.game.player === player) {

	    his_self.playerSelectSpaceWithFilter(
	      "Select Protestant Space to Convert",
	      function(space) { if (space.language === "italian" && space.religion === "protestant") { return 1; } return 0; },
	      function(spacekey) {
		his_self.addMove("convert\t"+spacekey+"\tcatholic");
		if (count == 1) { his_self.endTurn(); return 0; }

	        his_self.playerSelectSpaceWithFilter(
	          "Select Protestant Space to Convert",
	          function(space) { if (space.language === "italian" && space.religion === "protestant") { return 1; } return 0; },
	          function(spacekey) {
		    his_self.addMove("convert\t"+spacekey+"\tcatholic");
		    his_self.endTurn();
		  },
		  null,
		  true
		);
	      },
	      null ,
	      true
	    );

	  } else {
	    his_self.updateStatus("Papal Inquisition - Religion Conversion");
	  }

	  return 0;

	}

        if (mv[0] == "papal_inquisition_target_player") {

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {

 	    let msg = "Choose Player to Reveal Cards:";
            let html = '<ul>';
            html += '<li class="option" id="protestant">Protestant</li>';
            if (his_self.game.players.length > 2) { html += '<li class="option" id="england">England</li>'; }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      his_self.updateStatus("selecting...");
	      let action = $(this).attr("id");

              his_self.addMove("papal_inquisition_card_draw\t"+action);
              his_self.addMove("request_reveal_hand\tpapacy\t"+action);
              his_self.endTurn();

	    });
	  } else {
	    his_self.updateStatus("Papal Inquisition - Selecting Target");
	  }

	  return 0;

	}

        if (mv[0] == "papal_inquisition_card_draw") {

	  let target = mv[1];
	  let player = his_self.returnPlayerOfFaction("papacy");

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player === player) {

 	    let msg = "Choose Action:";
            let html = '<ul>';
            html += `<li class="option" id="draw">draw ${target} card</li>`;
            html += '<li class="option" id="recover">recover from discard pile</li>';
            html += '<li class="option" id="debate">initiate debate +2 dice</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action === "draw") {
		his_self.updateStatus("drawing card...");
                his_self.addMove("pull_card\tpapacy\t"+target);
                his_self.endTurn();
	      }
	      if (action === "recover") {
		his_self.updateStatus("recovering discard...");
                his_self.addMove("papal_inquisition_recover_discard");
                his_self.endTurn();
	      }
	      if (action === "debate") {
		his_self.updateStatus("commencing debate...");
                his_self.addMove("papal_inquisition_debate");
                his_self.endTurn();
	      }
	    });
	  } else {
	    his_self.updateStatus("Papal Inquisition - Follow-Up Action");
	  }

	  return 0;

	}

        if (mv[0] == "papal_inquisition_recover_discard") {

	  let player = his_self.returnPlayerOfFaction("papacy");

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player == player) {

            let msg = "Retrieve Card from Discard Pile: ";
            let html = '<ul>';
            for (let key in his_self.game.deck[0].discards) {
              html += `<li class="option" id="${key}">${his_self.game.deck[0].cards[key].name}</li>`;
            }
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {
              $('.option').off();
              let card = $(this).attr("id");
	      his_self.updateStatus("recovering...");
              his_self.addMove("papal_inquisition_recover_card\t"+card);
              his_self.endTurn();
            });

	  } else {
	    his_self.updateStatus("Papal Inquisition - Recovering Card");
	  }

	  return 0;
        }

        if (mv[0] == "papal_inquisition_recover_card") {

          let card = mv[1];

          if (his_self.game.deck[0].discards[card]) {

            let p = his_self.returnPlayerOfFaction("papacy");

            //
            // player returns to hand
            //
            if (his_self.game.player === p) {
              let fhand_idx = his_self.returnFactionHandIdx(p, faction);
              his_self.game.deck[0].fhand[fhand_idx].push(card);
            }

            //
            // everyone removes from discards
            //
            delete his_self.game.deck[0].discards[card];

          }

	  return 1;

	}

        if (mv[0] == "papal_inquisition_debate") {

          his_self.game.queue.splice(qe, 1);
	  his_self.game.state.events.papal_inquisition_debate_bonus = 1;
	  his_self.game.queue.push("SETVAR\tstate\tevents\tpapal_inquisition_debate_bonus\t0");
	  his_self.game.queue.push("papal_inquisition_call_theological_debate");
	  return 1;

	}
        if (mv[0] == "papal_inquisition_call_theological_debate") {

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {
	    his_self.playerCallTheologicalDebate(his_self, player, "papacy");
	  } else {
	    his_self.updateStatus("Papacy calling Theological Debate");
	  }
 
	  return 0;

        }

      return 1;

      }
    }
    deck['057'] = { 
      img : "cards/HIS-057.svg" , 
      name : "Philip of Hesse's Bigamy" ,
      ops : 2 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("philip_of_hesse_bigamy");
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "remove_philip_of_hesse") {

	  let ph = his_self.returnSpaceOfPersonage("protestant", "philip-hesse");

	  his_self.removeArmyLeader("protestant", ph, "philip-hesse");
	  his_self.displaySpace(ph);
	  his_self.updateLog("Philip of Hesse removed from game");
          his_self.game.queue.splice(qe, 1);

	  return 1;

	}

        if (mv[0] == "philip_of_hesse_bigamy") {

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("protestant");
	  let ph = his_self.returnSpaceOfPersonage("protestant", "philip-hesse");

	  if (his_self.game.player === player) {

 	    let msg = "Choose Action: ";
            let html = '<ul>';
            html += '<li class="option" id="discard">discard card</li>';

	    let adequate_cards_to_discard = false;
            let fhand_idx = his_self.returnFactionHandIdx(his_self.game.player, "protestant");
            for (let i = 0; i < his_self.game.deck[0].fhand[fhand_idx].length; i++) {
	      if (parseInt(his_self.game.deck[0].fhand[fhand_idx][i]) > 7) { adequate_cards_to_discard = true; } 
	    };

            if (ph && adequate_cards_to_discard == true) { html += '<li class="option" id="hesse">remove Philip of Hesse</li>'; }
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action === "hesse") {
		his_self.addMove("remove_philip_of_hesse");
		his_self.endTurn();
	      }

	      if (action === "discard") {
		his_self.addMove("discard_random\tprotestant");
		his_self.endTurn();
	      }

	    });
	  } else {
	    his_self.updateStatus("Protestants - Philip of Hesse's Bigamy");
	  }

	  return 0;

	}

        return 1;

      }
    }
    deck['058'] = { 
      img : "cards/HIS-058.svg" , 
      warn : ["protestant"] ,
      name : "Spanish Inquisition" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

	  let count = his_self.countSpacesWithFilter(function(space) {
	      if (space.religion == "protestant" && space.language == "spanish") {
		return 1;
	      }
	      return 0;
	  });

          if (count > 0) {
	    his_self.playerSelectSpaceWithFilter(
	      "Select First Space to Convert", 
	      function(space) {
	        if (space.religion == "protestant" && space.language == "spanish") {
		  return 1;
	        }
	        return 0;
	      },

	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
	        let first_choice = space.key;
	        let spaces = his_self.returnSpacesWithFilter(
          	  function(spacekey) {
		    let s2 = his_self.game.spaces[spacekey];
	            if (s2.religion == "protestant" && s2.language == "spanish" && s2.key != first_choice) {
		      return 1;
	            }
	            return 0;
	  	  }
	        );

	        if (spaces.length == 0) {
		  his_self.addMove("spanish_inquisition_secondary\t"+faction);
		  his_self.addMove("convert\t"+first_choice+"\tcatholic");
		  his_self.endTurn();
		  return 0;
	        }

                if (count > 1) {
	          his_self.playerSelectSpaceWithFilter(

	            "Select Second Space to Convert", 

	            function(space2) {
	              if (s2.religion == "protestant" && s2.language == "spanish" && s2.key != first_choice) {
		        return 1;
	              }
	              return 0;
		    },

	            function(second_choice) {
		      his_self.addMove("spanish_inquisition_secondary\t"+faction);
		      his_self.addMove("convert\t"+second_choice+"\tcatholic");
		      his_self.addMove("convert\t"+first_choice+"\tcatholic");
		      his_self.endTurn();
	            },
		    null , 
		    true 
	          );
	  	} else {
		  his_self.addMove("spanish_inquisition_secondary\t"+faction);
		  his_self.addMove("convert\t"+first_choice+"\tcatholic");
	          his_self.endTurn();
	        }
	      },
	      null ,
	      true 
	    );
	  } else {
	    his_self.updateStatus("No acceptable Protestant targets for Spanish Inquisition");
	    his_self.addMove("spanish_inquisition_secondary\t"+faction);
	    his_self.endTurn();
	  }
        } else {
          his_self.updateStatus("Papacy playing "+his_self.popup("067"));
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "show_hand_and_save") {

          let faction_taking = mv[1];
          let faction_giving = mv[2];

          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);

          if (his_self.game.player == p2) {
            let fhand_idx = his_self.returnFactionHandIdx(p2, faction_giving);
            his_self.addMove("share_hand_and_save\t"+faction_taking+"\t"+faction_giving+"\t"+JSON.stringify(his_self.game.deck[0].fhand[fhand_idx]));
            his_self.endTurn();
          }

          his_self.game.queue.splice(qe, 1);
          return 0;

        }

        if (mv[0] === "share_hand_and_save") {

          let faction_taking = mv[1];
          let faction_giving = mv[2];
          let cards = JSON.parse(mv[3]);

          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);

          if (his_self.game.player == p1) {
            for (let i = 0; i < cards.length; i++) {
	      his_self.game.state.pulled_cards.push({ faction : faction_giving , card : cards[i] });
            }
          }

          his_self.game.queue.splice(qe, 1);
          return 1;

        }


        if (mv[0] === "select_from_saved_and_discard") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  let protcards = [];
	  let engcards = [];
	  let pcards = [];
	  for (let z = 0; z < his_self.game.state.pulled_cards.length; z++) { 
	    if (his_self.game.state.pulled_cards[z].faction == "protestant") {
	      protcards.push(his_self.game.state.pulled_cards[z].card);
	    }
	    if (his_self.game.state.pulled_cards[z].faction == "england") {
	      engcards.push(his_self.game.state.pulled_cards[z].card);
	    }
	    let c = his_self.game.state.pulled_cards[z].card;
	    let d = his_self.returnDeck(true);
	    if (d[c]) {
	      if (d[c].type != "mandatory" && parseInt(c) > 9) {
	        pcards.push(c);
	      } 
	    }
	  }

	  if (his_self.game.player == p) {

	    let prothtml = "";
	    let enghtml = "";

	    for (let z = 0; z < protcards.length; z++) {
	      if (z > 0) { prothtml += ", "; }
	      prothtml += his_self.popup(protcards[z]);
	    }
	    for (let z = 0; z < engcards.length; z++) {
	      if (z > 0) { enghtml += ", "; }
	      enghtml += his_self.popup(protcards[z]);
	    }

	    his_self.updateLog("England hand: " + enghtml);
	    his_self.updateLog("Protestant hand: " + prothtml);

	    if (pcards.length == 0) {
	      his_self.updateLog("No cards available to discard...");
	      his_self.endTurn();
	      return;
	    }

	    his_self.playerSelectCardFromArrayWithFilter(
	      "Select Card to Discard",
	      pcards,
	      function(card) {
	        return 1;
	      },
	      function(card) {
	        let f = "";
	        for (let i = 0; i < his_self.game.state.pulled_cards.length; i++) {
	          if (card === his_self.game.state.pulled_cards[i].card) { f = his_self.game.state.pulled_cards[i].faction; }
	        }
	        his_self.game.state.pulled_cards = [];
                his_self.addMove("discard\t"+f+"\t"+card);
	        his_self.endTurn();
	      }
	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " giving card to Papacy");
	  }

          return 0;

	}


        if (mv[0] === "spanish_inquisition_secondary") {

          his_self.game.queue.splice(qe, 1);

          let faction = mv[1];
          let p = his_self.returnPlayerOfFaction(faction);
          let hp = his_self.returnPlayerOfFaction("hapsburg");

	  // debate piggy-backs off papal inquisition
          his_self.game.queue.push("papal_inquisition_call_theological_debate");
          his_self.game.queue.push("hand_to_fhand\t1\t"+hp+"\t"+"hapsburg"+"\t1");
          his_self.game.queue.push("DEAL\t1\t"+hp+"\t"+1);
	  his_self.game.queue.push("select_from_saved_and_discard\thapsburg");
	  his_self.game.queue.push("show_hand_and_save\thapsburg\tengland");
	  his_self.game.queue.push("show_hand_and_save\thapsburg\tprotestant");
	  his_self.game.state.pulled_cards = [];

	  return 1;
        }

	return 1;
      },
    }
    deck['059'] = { 
      img : "cards/HIS-059.svg" , 
      name : "Lady Jane Grey" ,
      ops : 3 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.events.england_changed_rulers_this_turn != 0) { 
	  let expected = 0;
	  if (!his_self.game.deck[0].discards['003']) { let expected = 1; }
	  if (his_self.game.state.cards_left["england"] > expected) { return 1; }
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p1 = his_self.returnPlayerOfFaction(faction);

	if (his_self.game.player == p1) {
          his_self.addMove("lady_jane_grey_papacy_discard\t"+faction);
          his_self.addMove("hand_to_fhand\t1\t"+p1+"\t"+faction+"\t1");
          his_self.addMove("DEAL\t1\t"+p1+"\t"+1);
          his_self.addMove("pull_card\t"+faction+"\tengland");
          his_self.endTurn();
	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "lady_jane_grey_papacy_discard") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == p) {

 	      his_self.playerFactionSelectCardWithFilter(
	        faction,
	        "Select Card to Give Away",
	        function(card) {
                  let fhand_idx = his_self.returnFactionHandIdx(p, faction);
		  let handlen = his_self.game.deck[0].fhand[fhand_idx].length;
		  let card1 = his_self.game.deck[0].fhand[fhand_idx][handlen-1];
		  let card2 = his_self.game.deck[0].fhand[fhand_idx][handlen-2];
	          if (card === card1 || card === card2) { return 1; }
		  return 0;
	        },
	        function(card) {

                  let msg = "Give " + his_self.popup(card) + " to Which Faction?";
                  let html = '<ul>';
                  html += `<li class="option" id="papacy">Papacy</li>`;
                  html += `<li class="option" id="protestant">Protestant</li>`;
   	          html += '</ul>';

       	          his_self.updateStatusWithOptions(msg, html);

	           $('.option').off();
	           $('.option').on('click', function () {

	             let target = $(this).attr("id");
	             $('.option').off();

                     his_self.updateStatus("giving card...");
                     his_self.addMove("give_card\t"+target+"\t"+faction+"\t"+card);
	             his_self.endTurn();

	           });

	       }
	     );

	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("059"));
	  }

	  return 0;
	}

	return 1;
      },
    }
    deck['060'] = { 
      img : "cards/HIS-060.svg" , 
      name : "Maurice of Saxony" ,
      ops : 4 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction="") {

        let pms = his_self.returnSpaceOfPersonage("protestant", "maurice-of-saxony");
        let hms = his_self.returnSpaceOfPersonage("hapsburg", "maurice-of-saxony");

	if (
	  (his_self.game.player == his_self.returnPlayerCommandingFaction("hapsburg") && pms != "") ||
	  (his_self.game.player == his_self.returnPlayerCommandingFaction("protestant") && hms != "")
	) { return 1; }

	return 0; 

      } ,
      onEvent : function(his_self, faction) {

        if (faction == "papacy") { faction = "hapsburg"; }

	if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

  	  his_self.playerSelectSpaceWithFilter(
	    "Select Fortified Space for Maurice of Saxony" ,
	    function(space) {
	      if (his_self.isSpaceControlled(space.key, faction) && his_self.isSpaceFortified(space.key)) {
	        return 1;
	      }
	      return 0;
	    },
	    function(spacekey) {
	      his_self.addMove("maurice_of_saxony\t"+faction+"\t"+spacekey);
	      his_self.endTurn();
	    },
	    null,
	    true
	  );

	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("060"));
	}

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "maurice_of_saxony") {

	  let faction = mv[1];
	  let spacekey = mv[2];

          for (let i = 0; i < his_self.game.players.length; i++) {
            let p = his_self.game.state.players_info[i];
            for (let z = 0; z < p.captured.length; z++) {
	      if (p.captured[z].type == "maurice-of-saxony") {
		p.captured[z].splice(z, 1);
	      }
	    }
          }

          his_self.game.queue.splice(qe, 1);
          let ms = his_self.returnSpaceOfPersonage(his_self.game.state.events.maurice_of_saxony, "maurice-of-saxony");

	  if (his_self.game.state.events.maurice_of_saxony != "" || ms != "") {

	    let current_owner = his_self.game.state.events.maurice_of_saxony;
            let pms = his_self.returnSpaceOfPersonage("protestant", "maurice-of-saxony");
            let hms = his_self.returnSpaceOfPersonage("hapsburg", "maurice-of-saxony");
	    if (pms) { ms = pms; current_owner = "protestant"; }
	    if (hms) { ms = hms; current_owner = "hapsburg"; }

	    let loop_length = his_self.game.spaces[ms].units[current_owner].length;
	    for (let i = 0; i < loop_length; i++) {
	      let u = his_self.game.spaces[ms].units[current_owner][i];
	      if (u.type === "mercenary" || u.type === "maurice-of-saxony") {
	        his_self.game.spaces[spacekey].units[faction].push(u);
	        his_self.game.spaces[ms].units[current_owner].splice(i, 1);
		i--;
	        loop_length = his_self.game.spaces[ms].units[current_owner].length;
		if (u.type === "maurice-of-saxony") {
		  u.img = "Maurice_Hapsburg.svg";
		  if (faction === "protestant") {
		    u.img = "Maurice_Protestant.svg";
		  }
		}
	      }
	    }

	  } else {

	    his_self.addArmyLeader(faction, spacekey, "maurice-of-saxony");

	    let current_owner = "protestant";
            let pms = his_self.returnSpaceOfPersonage("protestant", "maurice-of-saxony");
            let hms = his_self.returnSpaceOfPersonage("hapsburg", "maurice-of-saxony");
	    if (pms) { ms = pms; current_owner = "protestant"; }
	    if (hms) { ms = hms; current_owner = "hapsburg"; }

	    let ms_idx = his_self.returnIndexOfPersonageInSpace(faction, "maurice-of-saxony", ms);
	    let u = his_self.game.spaces[ms].units[faction][ms_idx];
	    u.img = "Maurice_Hapsburg.svg";
	    if (faction === "protestant") { u.img = "Maurice_Protestant.svg"; }

	  }
	
	  his_self.game.state.events.maurice_of_saxony = faction;
	  return 1;

	}

	return 1;
      }
    }
    deck['061'] = { 
      img : "cards/HIS-061.svg" , 
      warn : ["protestant"] ,
      name : "Mary Defies Council" ,
      ops : 1 ,
      turn : 7 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tenglish");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tenglish");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tenglish");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['062'] = { 
      img : "cards/HIS-062.svg" , 
      name : "Book of Common Prayer" ,
      warn : ["papacy"] ,
      ops : 2 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { if (!his_self.isDebaterCommitted("cranmer-debater")) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {

	let d = his_self.rollDice(6);

	his_self.game.queue.push("NOTIFY\t"+his_self.popup("062")+" rolls "+d);

        if (d == 3 || d == 4) {
	  his_self.game.queue.push("player_add_unrest\t"+faction+"\tenglish\tcatholic");
	}        
        if (d == 5) {
	  his_self.game.queue.push("player_add_unrest\t"+faction+"\tenglish\tcatholic");
	} 
        if (d == 6) {
	  for (let spacekey in his_self.game.spaces) {
	    if (his_self.game.spaces[spacekey].language == "english" && his_self.game.spaces[spacekey].religion == "catholic") {
	      his_self.game.queue.push("unrest\t"+spacekey);
	    }
          }
	}

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tenglish");
	his_self.game.queue.push("protestant_reformation\tprotestant\tenglish");
	his_self.game.queue.push("protestant_reformation\tprotestant\tenglish");
	his_self.game.queue.push("protestant_reformation\tprotestant\tenglish");
	his_self.game.queue.push("commit\tengland\tcranmer-debater");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    let dom_img = "cards/HIS-063.svg";
    if (this.game.players.length == 2) { dom_img = "cards/HIS-063-2P.svg"; }
    if (parseInt(this.game.options['game-wizard-players-select']) == 2) {
      dom_img = "cards/HIS-063-2P.svg";
    }
    deck['063'] = { 
      img : dom_img , 
      name : "Dissolution of the Monasteries" ,
      ops : 4 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	
	if (his_self.game.players.length > 2) {
	  let eng = his_self.returnPlayerCommandingFaction("england");
	  his_self.game.queue.push("hand_to_fhand\t1\t"+eng+"\t"+"england"+"\t1"); // 1 = overlay
          his_self.game.queue.push(`DEAL\t1\t${eng}\t2`);
        }

	his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tenglish");
	his_self.game.queue.push("protestant_reformation\tprotestant\tenglish");
	his_self.game.queue.push("protestant_reformation\tprotestant\tenglish");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	if (his_self.game.players.length == 2) {
	  his_self.game.queue.push("discard_random\tpapacy");
	}

	return 1;
      }
    }
    deck['064'] = { 
      img : "cards/HIS-064.svg" , 
      name : "Pilgrimage of Grace" ,
      ops : 3 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player === player) {

	    let already_selected = [];

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

	    his_self.playerSelectSpaceWithFilter(
	      "Select English Space to throw into Unrest" ,
	      function(space) { if (!already_selected.includes(space.key) && space.home === "england"){ return 1;} return 0; } ,
	      function(spacekey) {

	        already_selected.push(spacekey);
		his_self.game.spaces[spacekey].unrest = 1;
		his_self.displaySpace(spacekey);
		his_self.addMove("unrest\t"+spacekey);

		his_self.endTurn();

	   }, null, true);
	   }, null, true);
	   }, null, true);
	   }, null, true);
	   }, null, true);

	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("064"));
	}

	   return 0;
      },
    }
    deck['065'] = { 
      img : "cards/HIS-065.svg" , 
      warn : ["papacy"] ,
      name : "A Mighty Fortress" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.isDebaterCommitted("luther-debater")) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let player = his_self.returnPlayerOfFaction("protestant");

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("commit\tprotestant\tluther-debater");

	return 1;
      },
    }
    deck['066'] = { 
      img : "cards/HIS-066.svg" , 
      name : "Akinji Raiders" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {

	let enemies = his_self.returnEnemies("ottoman");
	let neighbours = [];
	let valid_spaces_with_cavalry = [];
	let valid_spaces_with_enemies = [];
	let valid_target_factions = [];
	let spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].units["ottoman"].length > 0) {
	      for (let z = 0; z < his_self.game.spaces[spacekey].units["ottoman"].length; z++) {
	        if (his_self.game.spaces[spacekey].units["ottoman"][z].type === "cavalry") {
	          if (his_self.isSpaceControlled(spacekey, "ottoman")) {
		    return 1;
		  }
	        }
	      }
	    }
	  }
        );

	//
	// 
	//
	for (let i = 0; i < spaces.length; i++) {
	  valid_spaces_with_cavalry.push(spaces[i]);
	}

	//
	// spaces contains all spaces with Ottoman Cavalry
	//
	// two hops !
	//
	for (let i = 0; i < spaces.length; i++) {
	  let s = his_self.game.spaces[spaces[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (his_self.isSpaceControlled(s.neighbours[ii], "ottoman")) {
	      if (!neighbours.includes(s.neighbours[ii])) {
	        neighbours.push(s.neighbours[ii]);
	      }
	    } else {
	      for (let iii = 0; iii < enemies.length; iii++) {
	        if (his_self.isSpaceControlled(s.neighbours[ii], enemies[iii])) {
		  valid_target_factions.push(enemies[iii]);
	          valid_spaces_with_enemies.push(neighbours[ii]);
	        }
	      }
	    }
	  }
	}
	for (let i = 0; i < neighbours.length; i++) {
	  let s = his_self.game.spaces[neighbours[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    for (let iii = 0; iii < enemies.length; iii++) {
	      if (his_self.isSpaceControlled(s.neighbours[ii], enemies[iii])) {
		valid_target_factions.push(enemies[iii]);
	        valid_spaces_with_enemies.push(neighbours[ii]);
	      }
	    }
	  }
	}

	if (valid_spaces_with_enemies.length > 0) { return 1; }

	return 0;

      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerCommandingFaction(faction);
	if (his_self.game.player != p) { return 0; }

	let enemies = his_self.returnEnemies("ottoman");
	let neighbours = [];
	let valid_spaces_with_cavalry = [];
	let valid_spaces_with_enemies = [];
	let valid_target_factions = [];
	let spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].units["ottoman"].length > 0) {
	      for (let z = 0; z < his_self.game.spaces[spacekey].units["ottoman"].length; z++) {
	        if (his_self.game.spaces[spacekey].units["ottoman"][z].type === "cavalry") {
	          if (his_self.isSpaceControlled(spacekey, "ottoman")) {
		    return 1;
		  }
	        }
	      }
	    }
	  }
        );

	for (let i = 0; i < spaces.length; i++) {
	  valid_spaces_with_cavalry.push(spaces[i]);
	}

	//
	// two hops !
	//
	for (let i = 0; i < spaces.length; i++) {
	  let s = his_self.game.spaces[spaces[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (his_self.isSpaceControlled(s.neighbours[ii], "ottoman")) {
	      if (!neighbours.includes(s.neighbours[ii])) {
	        neighbours.push(s.neighbours[ii]);
	      }
	    } else {
	      for (let iii = 0; iii < enemies.length; iii++) {
	        if (his_self.isSpaceControlled(s.neighbours[ii], enemies[iii])) {
		  valid_target_factions.push(enemies[iii]);
	          valid_spaces_with_enemies.push(neighbours[ii]);
	        }
	      }
	    }
	  }
	}
	for (let i = 0; i < neighbours.length; i++) {
	  let s = his_self.game.spaces[neighbours[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (his_self.isSpaceControlled(s.neighbours[ii], "ottoman")) {
	      if (!neighbours.includes(s.neighbours[ii])) {
		neighbours.push(s.neighbours[ii]);
	      }
	    } else {
	      for (let iii = 0; iii < enemies.length; iii++) {
	        if (his_self.isSpaceControlled(s.neighbours[ii], enemies[iii])) {
		  valid_target_factions.push(enemies[iii]);
	          valid_spaces_with_enemies.push(neighbours[ii]);
	        }
	      }
	    }
	  }
	}

        let msg = "Steal Random Card from Which Faction?";
        let html = '<ul>';
	let options_provided = [];
        for (let i = 0; i < valid_target_factions.length; i++) {
	   if (!options_provided.includes(valid_target_factions[i])) {
	     options_provided.push(valid_target_factions[i]);
             html += `<li class="option" id="${valid_target_factions[i]}">${valid_target_factions[i]}</li>`;
	  }
	}
	html += '</ul>';

    	his_self.updateStatusWithOptions(msg, html);

	$('.option').off();
	$('.option').on('click', function () {

	  his_self.updateStatus("submitting...");
	  let action = $(this).attr("id");
	  his_self.addMove("pull_card\tottoman\t"+action);
          his_self.endTurn();

	});

        return 0;
      }
    }
    deck['067'] = { 
      img : "cards/HIS-067.svg" , 
      warn : ["protestant"] ,
      name : "Anabaptists" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

	  let count = his_self.countSpacesWithFilter(function(space) {
	      if (space.religion == "protestant" && his_self.isOccupied(space) == 0 && !his_self.isElectorate(space)) {
		return 1;
	      }
	      return 0;
	  });

          if (count > 0) {
	    his_self.playerSelectSpaceWithFilter(
	      "Select First Space to Convert", 
	      function(space) {
	        if (space.religion == "protestant" && his_self.isOccupied(space) == 0 && !his_self.isElectorate(space)) {
		  return 1;
	        }
	        return 0;
	      },

	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
	        let first_choice = space.key;
	        let spaces = his_self.returnSpacesWithFilter(
          	  function(spacekey) {
		    let s2 = his_self.game.spaces[spacekey];
	            if (s2.religion == "protestant" && his_self.isOccupied(s2.key) == 0 && !his_self.isElectorate(s2.key) && s2.key != first_choice) {
		      return 1;
	            }
	            return 0;
	  	  }
	        );

	        if (spaces.length == 0) {
		  his_self.addMove("convert\t"+first_choice+"\tcatholic");
		  his_self.endTurn();
		  return 0;
	        }

                if (count > 1) {
	          his_self.playerSelectSpaceWithFilter(

	            "Select Second Space to Convert", 

	            function(space2) {
	              if (space2.key !== first_choice && space2.religion == "protestant" && his_self.isOccupied(space2.key) == 0 && !his_self.isElectorate(space2.key)) {
		        return 1;
	              }
	              return 0;
		    },

	            function(second_choice) {
		      his_self.addMove("convert\t"+second_choice+"\tcatholic");
		      his_self.addMove("convert\t"+first_choice+"\tcatholic");
		      his_self.endTurn();
	            },
		    null , 
		    true 
	          );
	  	} else {
	          his_self.updateStatus("No acceptable targets for Anabaptists");
	          his_self.endTurn();
	        }
	      },
	      null ,
	      true 
	    );
	  } else {
	    his_self.updateStatus("No acceptable targets for Anabaptists");
	    his_self.endTurn();
	  }
        } else {
          his_self.updateStatus("Papacy playing "+his_self.popup("067"));
        }
        return 0;
      },
    }
    deck['068'] = { 
      img : "cards/HIS-068.svg" , 
      name : "Andrea Doria" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("genoa");
	if (faction == "ottoman" || faction == "protestant" || faction == "england") { return 0; }
	if (faction !== f) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("genoa");
	his_self.deactivateMinorPower(f, "genoa");
	his_self.activateMinorPower(faction, "genoa");
	return 1;
      },
    }
    deck['069'] = { 
      img : "cards/HIS-069.svg" , 
      name : "Auld Alliance" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("scotland");
        if (faction === "france") {
	  return 1;
	}
        if (faction === "england" && f !== "") {
	  return 1;
	} 
	return 0;
      },
      onEvent : function(his_self, faction) {
        let f = his_self.returnAllyOfMinorPower("scotland");
	if (faction === "england") {
 	  if (f !== "") {
	    his_self.deactivateMinorPower(f, "scotland");
	  }
	}
	if (faction === "france") {
	  if (f == "" || f == "scotland") {
	    his_self.activateMinorPower(faction, "scotland");
	  } else {
	    if (f === "france") {

	      let p = his_self.returnPlayerOfFaction("france");
	      if (p === his_self.game.player) {

	        //
	        // add upto 3 new French regulars in any Scottishhome space under French control that isnot under siege.
	        //
   	        his_self.playerSelectSpaceWithFilter(

	  	  "Select Unbesieged Scottish Home Space Under French Control", 

		  function(space) {
		    if (space.home == "scotland") {
		      if (his_self.isSpaceControlled(space.key, "france") || his_self.isSpaceControlled(space.key, "scotland")) {
		        if (!space.besieged) {
		          return 1;
		        }
		      }
		    }
		  },

		  function(spacekey) {
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
	            his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
		    his_self.endTurn();
		  }
	        );

		return 0;

	      } else {
		return 0;
	      }
	    } else {
	      his_self.deactivateMinorPower(f, "scotland");
	    }
	  }
	}
	return 1;
      },
    }
    deck['070'] = { 
      img : "cards/HIS-070.svg" , 
      name : "Charles Bourbon" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
        if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league != 1) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Unbesieged Space You Control",

	    function(space) {
	      if (his_self.game.state.events.schmalkaldic_league == 0) { if (space.type == "electorate") { return 0; } } 
	      // 2P must be German or Iralian space
	      if (his_self.game.players.length == 2) { if (space.language != "italian" && space.language != "german") { return 0; } }
	      if (space.besieged) { return 0; }
	      if (his_self.isSpaceControlled(space, faction)) { return 1; }
	      // if at war with France, unoccupied near Lyon is OK
	      if (his_self.areEnemies(faction, "france")) {
	        if (space.neighbours.includes("lyon") && his_self.isUnoccupied(space)) { return 1; }
	      }
	      return 0;
	    },

	    function(spacekey) {
	      let space = his_self.game.spaces[spacekey];
	      his_self.addMove("add_army_leader\t"+faction+"\t"+spacekey+"\t"+"renegade");
	      if (spacekey === "avignon" || spacekey === "grenoble" || spacekey === "geneva" || spacekey === "dijon" || spacekey === "orleans" || spacekey === "limoges") {
                his_self.addMove("control\t"+faction+"\t"+spacekey);
	      }
	      if (faction != "ottoman") {
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
	      } else {
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
	      }
	      his_self.endTurn();
	    },

	    null,

	    true 

	  );
	} else {
	  his_self.updateStatus(his_self.popup("070") + " entering play");
	}

	return 0;
      },
    }
    let csr_img = "cards/HIS-071.svg";
    if (this.game.players.length == 2) { csr_img = "cards/HIS-071-2P.svg"; }
    deck['071'] = { 
      img : csr_img , 
      name : "City State Rebels" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.players.length == 2) {
	  if (his_self.game.state.events.schmalkaldic_league == 1) { 
	    for (let key in his_self.game.spaces) {
	      let space = his_self.game.spaces[key];
              if (his_self.game.players.length == 2 && space.type == "electorate" && space.political == "hapsburg") { return 1; }
	      if (key == "metz" && !his_self.isSpaceControlled("metz", "independent")) { return 1; }
	      if (his_self.game.spaces[key].language == "italian" || his_self.game.spaces[key].language == "german") {
		if (his_self.game.spaces[key].type == "key") {
		  if (!his_self.isSpaceControlled(key, his_self.game.spaces[key].home)) { return 1; }
		}
	      }
	    }
	  } else {
	    for (let spacekey in his_self.game.spaces) {
	      let space = his_self.game.spaces[spacekey];
	      if (space.type == "key" && space.home === "independent" && (space.key == "metz" || space.language == "german" || space.language == "italian") && (space.political !== space.home && space.political !== "" && space.political)) { return 1; }
	    }
	  }
	  return 0;
	}
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Occupied Territory",

	    function(space) {

	      if (his_self.isSpaceBesieged(space.key)) { return 0; }

	      //
	      // 2P game - may be played against electorate under Hapsburg Control
	      //
	      if (his_self.game.players.length == 2) {
if (space.key == "milan") {
  console.log("#");
  console.log("#");
  console.log("#");
  console.log("MILAN CSR: " + JSON.stringify(space));
}
		if (his_self.game.state.events.schmalkaldic_league == 1) { if (space.type == "electorate" && space.political == "hapsburg") { return 1; } }
	        if (space.type == "key" && space.home === "independent" && (space.key == "metz" || space.language == "german" || space.language == "italian") && (space.political !== space.home && space.political !== "" && space.political)) { return 1; }
	        return 0;
	      }

	      if (space.type == "key" && space.home === "independent" && (space.political !== space.home && space.political !== "" && space.political)) { return 1; }

	      if (space.home !== space.political && space.political !== "" && space.type == "key") {
		if (!space.besieged) {
	          if (!his_self.areAllies(space.home, space.political)) { 
		    if (space.home !== "" && space.political !== "") { return 1; }
		  }
	        }
	      }

	      //
	      // electorate under hapsburg control
	      //
	      if (his_self.game.state.events.schmalkaldic_league == 1 && his_self.game.players.length == 2) {
		if (his_self.isElectorate(space.key)) {
		  if (his_self.isSpaceControlled(space.key, "hapsburg")) { return 1; }
		}
	      }

	      return 0;
	    },

	    function(spacekey) {
	      his_self.updateStatus("selected");
	      his_self.addMove("city-state-rebels\t"+faction+"\t"+spacekey);
	      his_self.endTurn();
	    },

	    null,

	    true

	  );
	} else {
	  his_self.updateStatus("Opponent playing " + his_self.popup("071"));
	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "city-state-rebels") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let respondent = his_self.returnFactionControllingSpace(spacekey);

          his_self.game.queue.splice(qe, 1);


	  let hits = 0;
	  for (let i = 0; i < 5; i++) {
	    let roll = his_self.rollDice(6);
            his_self.updateLog(` ... roll ${5-i}: ${roll}`);
	    if (roll >= 5) {
	      hits++;
	    }
	  }

          his_self.updateLog(` ... hits: ${hits}`);
          his_self.updateLog(his_self.returnFactionName(faction) + " plays " + his_self.popup("071") + " against " + his_self.returnSpaceName(spacekey));

	  let p = his_self.returnPlayerCommandingFaction(respondent);
	  if (p == 0) {
	    for (let z = 0, assigned_hits = 0; assigned_hits < hits && z < his_self.game.spaces[spacekey].units[respondent].length; z++) {
	      try {
	        if (his_self.game.spaces[spacekey].units[respondent][z].type == "regular") {
		  his_self.game.spaces[spacekey].units[respondent].splice(z, 1);
		  z--;
	      } } catch (err) {
	      }
	    }
	    his_self.game.queue.push("finish-city-state-rebels\t"+faction+"\t"+respondent+"\t"+spacekey);
	    return 1;
	  }
	  if (his_self.game.player == p) {
	    his_self.addMove("finish-city-state-rebels\t"+faction+"\t"+respondent+"\t"+spacekey);
	    his_self.playerAssignHits(respondent, spacekey, hits, 1);
	  }
	  
	  return 0;
        }


	if (mv[0] === "finish-city-state-rebels") {

          his_self.game.queue.splice(qe, 1);

	  let faction    = mv[1];
	  let respondent = mv[2];
	  let spacekey   = mv[3];
	  let space      = his_self.game.spaces[spacekey];

	  //
	  // do land or naval units remain
	  //
	  let anything_left = 0; 
	  for (let i = 0; i < space.units[respondent].length; i++) {
	    let u = space.units[respondent][i];
	    if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry") {
	      anything_left = 1;
	    }
	  }

	  if (!anything_left) {
            for (let i = 0; i < space.units[faction].length; i++) {
              his_self.captureLeader(faction, respondent, spacekey, space.units[faction][i]);
              space.units[faction].splice(i, 1);
              i--;
            }

	    let who_gets_control = space.home;

	    //
	    // 2P includes electorates
	    //
	    if (spacekey == "mainz") { space.home == "protestant"; who_gets_control = "protestant"; }
	    if (spacekey == "cologne") { space.home == "protestant"; who_gets_control = "protestant"; }
	    if (spacekey == "trier") { space.home == "protestant"; who_gets_control = "protestant"; }
	    if (spacekey == "augsburg") { space.home == "protestant"; who_gets_control = "protestant"; }
	    if (spacekey == "wittenberg") { space.home == "protestant"; who_gets_control = "protestant"; }
	    if (spacekey == "brandenburg") { space.home == "protestant"; who_gets_control = "protestant"; }

	    his_self.controlSpace(who_gets_control, space.key);
            his_self.addRegular(space.home, space.key, 1);
          }

	  his_self.displaySpace(spacekey);

	  return 1;
	}

	return 1;

      },
    }
    deck['072'] = { 
      img : "cards/HIS-072.svg" , 
      name : "Cloth Prices Fluctuate" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	if (his_self.isSpaceControlled("calais", "england") && his_self.isSpaceControlled("antwerp", "hapsburg")) {

          let p1 = his_self.returnPlayerOfFaction("england");
          let p2 = his_self.returnPlayerOfFaction("hapsburg");

          his_self.game.queue.push("cloth-prices-fluctuate-option1\t"+faction);

          his_self.game.queue.push("hand_to_fhand\t1\t"+p1+"\t"+"england"+"\t1");
          his_self.game.queue.push("DEAL\t1\t"+p1+"\t"+1);

          his_self.game.queue.push("hand_to_fhand\t1\t"+p2+"\t"+"hapsburg"+"\t1");
          his_self.game.queue.push("DEAL\t1\t"+p2+"\t"+1);

	} else {

          his_self.game.queue.push("cloth-prices-fluctuate-option2\t"+faction);

	}

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "cloth-prices-fluctuate-option1") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (p == his_self.game.player) {

	    if (faction === "protestant" && his_self.game.state.events.schmalkaldic_league != 1) {
	      his_self.addMove("NOTIFY\tProtestants cannot place mercenaries yet...");
	      his_self.endTurn();
	      return 0;
	    }

	    if (faction === "ottoman") {

	      //
	      // place 2 cavalry in home space not under siege
	      //
	      his_self.playerSelectSpaceWithFilter(
	        "Select Home Space not under Siege",
	        function(space) {
	          if (space.besieged) { return 0; }
	          if (space.type == "electorate" && his_self.game.state.events.schmalkaldic_league != 1) { return 0; }
	          if (his_self.isSpaceControlled(space, faction) && his_self.isSpaceHomeSpace(space, faction)) { return 1; }
	          return 0;
	        },
	        function(spacekey) {
	          let space = his_self.game.spaces[spacekey];
                  his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
                  his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
	          his_self.endTurn();
	        },
	        null,
	        true
	      );

	    } else {

	      //
	      // place 2 mercenaries in home space not under siege
	      //
	      his_self.playerSelectSpaceWithFilter(
	        "Select Home Space not under Siege",
	        function(space) {
	          if (space.besieged) { return 0; }
	          if (space.type == "electorate" && his_self.game.state.events.schmalkaldic_league != 1) { return 0; }
	          if (his_self.isSpaceControlled(space, faction) && his_self.isSpaceHomeSpace(space, faction)) { return 1; }
	          return 0;
	        },
	        function(spacekey) {
	          let space = his_self.game.spaces[spacekey];
                  his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
                  his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
	          his_self.endTurn();
	        },
		null,
		true
	      );
	    }
	  }
	  return 0;

        }


        if (mv[0] == "cloth-prices-fluctuate-option2") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let f = his_self.returnFactionControllingSpace("antwerp");
	  if (f === "") { f = his_self.game.spaces["antwerp"].home; }

	  // f discards a card
          his_self.addMove("discard_random\t"+f);

	  //
	  // add unrest
	  //
          his_self.playerSelectSpaceWithFilter(
	    "Add Unrest",
	    function(space) {
	      if (space.key == "antwerp") { return 1; }
	      if (space.key == "brussels") { return 1; }
	      if (space.key == "amsterdam") { return 1; }
	      if (space.language == "italian") { return 1; }
	      if (space.home == "hapsburg" && space.language == "italian") { return 1; }
	      if (space.home == "hapsburg" && space.language == "german") { return 1; }
	      return 0;
	    },
	    function(unrest_spacekey1) {
              his_self.addMove("unrest\t"+unrest_spacekey1);
              his_self.playerSelectSpaceWithFilter(
  	        "Add Unrest",
	        function(space) {
	          if (space.key == unrest_spacekey1) { return 1; }
	          if (space.key == "antwerp") { return 1; }
	          if (space.key == "brussels") { return 1; }
	          if (space.key == "amsterdam") { return 1; }
	          if (space.language == "italian") { return 1; }
	          if (space.home == "hapsburg" && space.language == "italian") { return 1; }
	          if (space.home == "hapsburg" && space.language == "german") { return 1; }
	        return 0;
	        },
	        function(unrest_spacekey2) {
                  his_self.addMove("unrest\t"+unrest_spacekey2);
	          his_self.endTurn();
	        }
              );
	    }
          );
	  return 0;
	}

	return 1;

      },
    }
    deck['073'] = { 
      img : "cards/HIS-073.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	let anyone_allied = false;
	if (faction == "ottoman") { return 0; } 
	if (faction == "protestant") { return 0; } 
	if ("genoa" != his_self.returnControllingPower("genoa")) { anyone_allied = true; }
	if ("scotland" != his_self.returnControllingPower("scotland")) { anyone_allied = true; }
	if ("venice" != his_self.returnControllingPower("venice")) { anyone_allied = true; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == p) {

	  let mp = his_self.returnMinorPowers();
	  let ca = [];
	  let cd = [];

	  for (let i = 0; i < mp.length; i++) {
	    if (his_self.canFactionActivateMinorPower(faction, mp[i])) {
	      if (his_self.returnAllyOfMinorPower(mp[i]) == faction) {
	        cd.push(mp[i]);
	      } else {
	        ca.push(mp[i]);
	      }
	    }
	  }
	
	  let msg = 'Activate or De-activate a Minor Power?';
    	  let html = '<ul>';
	  for (let i = 0; i < ca.length; i++) {
            html += `<li class="option" id="${ca[i]}">activate ${ca[i]}</li>`;
	  }
	  for (let i = 0; i < cd.length; i++) {
            html += `<li class="option" id="${cd[i]}">deactivate ${cd[i]}</li>`;
	  }
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {
	    let action = $(this).attr("id");
	    if (ca.includes(action)) {
	      if (faction === "hapsburg" && action == "hungary") {
		his_self.game.state.events.diplomatic_alliance_triggers_hapsburg_hungary_alliance = 1;
	      }
	      his_self.addMove("activate_minor_power\t"+faction+"\t"+action);
	    } else {
	      his_self.addMove("deactivate_minor_power\t"+faction+"\t"+action);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['074'] = { 
      img : "cards/HIS-074.svg" , 
      name : "Diplomatic Overture" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player != 0) {

	  // deal 2 cards to faction
	  his_self.game.queue.push("diplomatic-overture\t"+faction);
          his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction+"\t1");
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "diplomatic-overture") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);
          let fhand_idx = his_self.returnFactionHandIdx(p, faction);
	  let does_player_have_non_mandatory_card = false;
	  let does_player_have_non_home_card = false;

	  for (let i = 0; i < his_self.game.deck[0].fhand[fhand_idx].length; i++) {
	    if (his_self.game.deck[0].cards[his_self.game.deck[0].fhand[fhand_idx][i]].type != "mandatory") { does_player_have_non_mandatory_card = true; }
	    if (parseInt(his_self.game.deck[0].fhand[fhand_idx][i]) > 8) { does_player_have_non_home_card = true; }
	  }

	  if (his_self.game.player == p) {

	    his_self.playerSelectFactionWithFilter(
	      "Select Faction to Give Card",
	      function(f) { if (f !== faction) { return 1; } },
	      function(recipient) {
 	        his_self.playerFactionSelectCardWithFilter(
	          faction,
	          "Select Card to Give Away",
	          function(card) {
		    // no to home cards
		    if (parseInt(card) < 9) { return 0; }
		    // no to mandatory events unless I only have them
		    if (his_self.game.deck[0].cards[card].type == "mandatory" && does_player_have_non_mandatory_card) { return 0; }
		    // otherwise yes
		    return 1; 
		  },
	          function(card) {
                    his_self.addMove("give_card\t"+recipient+"\t"+faction+"\t"+card);
	  	    his_self.endTurn();
	          }
	        );
	      }
	    );
	  }
	  return 0;
	}
	return 1;
      },
    }
    deck['075'] = { 
      img : "cards/HIS-075.svg" , 
      name : "Erasmus" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	if (his_self.game.state.round < 3) {

	  let player = his_self.returnPlayerOfFaction("protestant");

          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	} else {

	  let player = his_self.returnPlayerOfFaction("papacy");   

          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	}

	return 1;
      },
    }
    deck['076'] = { 
      img : "cards/HIS-076.svg" , 
      name : "Foreign Recruits" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (faction === "protestant") { 
	  if (his_self.game.state.events.schmalkaldic_league == 1) { return 1; }
          if (his_self.game.state.activated_powers[faction].length > 0) { return 1; }
	  return 0;
        };
	return 1;
      },
      onEvent : function(his_self, faction) {

	if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

	  //
	  //
	  //
  	  if (his_self.game.state.activated_powers[faction].length > 0) {

	    let msg = "Which Faction gets Recruits?";
    	    let html = '<ul>';
	    if (!(faction == "protestant" && his_self.game.state.events.schmalkaldic_league != 1)) {
              html += `<li class="option" id="${faction}">${his_self.returnFactionName(faction)}</li>`;
	    }
	    for (let i = 0; i < his_self.game.state.activated_powers[faction].length; i++) {
	      let f = his_self.game.state.activated_powers[faction][i];
              html += `<li class="option" id="${f}">${his_self.returnFactionName(f)}</li>`;
 	    }  
 	    html += '</ul>';
    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {
	      his_self.updateStatus("acknowledge");
	      let action = $(this).attr("id");
	      his_self.game.state.events.foreign_recruits = action;
  	      his_self.playerPlayOps("", action, 4, "build");
	    });

	    return 0;
	  }

	  //
	  // if no activated factions, must be us
	  //
	  his_self.game.state.events.foreign_recruits = faction;
  	  his_self.playerPlayOps("", faction, 4, "build");

	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("076"));
	}

	return 0;
      },
    }
    deck['077'] = { 
      img : "cards/HIS-077.svg" , 
      name : "Fountain of Youth" ,
      ops : 2 ,
      turn : 2 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.explorations.length > 0 || his_self.game.state.conquests.length > 0) { 
	  for (let z = 0; z < his_self.game.state.explorations.length; z++) {
	    let e = his_self.game.state.explorations[z];
	    if (e.round == his_self.game.state.round) { return 1; }
	  }
	  for (let z = 0; z < his_self.game.state.conquests.length; z++) {
	    let c = his_self.game.state.conquests[z];
	    if (c.round == his_self.game.state.round) { return 1; }
	  }
	  return 1;
	}
	return 0;
      },
      onEvent(his_self, faction) {

        let player = his_self.returnPlayerCommandingFaction(faction);

        if (his_self.game.player === player) { 

	  let cabot_england_found = 0;
	  let cabot_france_found = 0;
	  let cabot_hapsburg_found = 0;

	  let msg = "Cancel Which Expedition / Conquest?";
          let html = '<ul>';
	  let cabot_found = 0;

	  for (let i = 0; i < his_self.game.state.explorations.length; i++) {

	    let exp = his_self.game.state.explorations[i];

            if (exp.cabot == 1) {
              if (exp.faction == "england") { cabot_england_found = 1; }
              if (exp.faction == "france") { cabot_france_found = 1; }
              if (exp.faction == "hapsburg") { cabot_hapsburg_found = 1; }
            }

	    if (exp.round == his_self.game.state.round) {
              html += `<li class="option" id="${his_self.game.state.explorations[i].faction}">${his_self.returnFactionName(his_self.game.state.explorations[i].faction)} (exploration)</li>`;
	    }
	    if (cabot_found == 0 && his_self.game.state.events.cabot_england == 1 && cabot_england_found == 0) {
              html += `<li class="option" id="cabot_england">sebastian cabot (england)</li>`;
	      cabot_found = 1;
	    }
	    if (cabot_found == 0 && his_self.game.state.events.cabot_france == 1 && cabot_france_found == 0) {
              html += `<li class="option" id="cabot_france">sebastian cabot (france)</li>`;
	      cabot_found = 1;
	    }
	    if (cabot_found == 0 && his_self.game.state.events.cabot_hapsburg == 1 && cabot_hapsburg_found == 0) {
              html += `<li class="option" id="cabot_hapsburg">sebastian cabot (haps)</li>`;
	      cabot_found = 1;
	    }
	  }
	  for (let i = 0; i < his_self.game.state.conquests.length; i++) {
	    if (his_self.game.state.conquests[i].round == his_self.game.state.round) {
              html += `<li class="option" id="conquest-${his_self.game.state.conquests[i].faction}">${his_self.returnFactionName(his_self.game.state.conquests[i].faction)} (conquest)</li>`;
	    }
	  }
          html += '</ul>';

 	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

            $('.option').off();
	    let action = $(this).attr("id");

	    his_self.addMove("display_new_world");
	    if (action == "conquest-england" || action == "conquest-france" || action == "conquest-hapsburg") {
	      if (action == "conquest-england") {
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" cancels English conquest");
	        his_self.addMove("remove_conquest\tengland"); 
	      }
	      if (action == "conquest-france") {
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" cancels French conquest");
	        his_self.addMove("remove_conquest\tfrance"); 
	      }
	      if (action == "conquest-hapsburg") {
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" cancels Hapsburg conquest");
	        his_self.addMove("remove_conquest\thapsburg"); 
	      }
	      his_self.endTurn();
	      return 0;
	    }
	    if (action == "cabot_england" || action == "cabot_hapsburg" || action == "cabot_france") {
	      if (action === "cabot_england") {  his_self.addMove("SETVAR\tstate\tevents\tcabot_england\t0"); }
	      if (action === "cabot_hapsburg") {  his_self.addMove("SETVAR\tstate\tevents\tcabot_hapsburg\t0"); }
	      if (action === "cabot_france") {  his_self.addMove("SETVAR\tstate\tevents\tcabot_france\t0"); }
	    } else {
	      his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" cancels "+his_self.returnFactionName(action)+" exploration");
	      his_self.addMove("remove_exploration\t"+action); 
	    }

	    his_self.endTurn();

	  });
	}
        return 0;
      },
    }
    deck['078'] = { 
      img : "cards/HIS-078.svg" , 
      warn : ["papacy"] ,
      name : "Frederick the Wise" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");

	//
	// protestants get wartburg card if in discards
	//
        if (his_self.game.deck[0].discards["037"]) {
	  his_self.game.deck[0].cards["037"] = his_self.game.deck[0].discards["037"];
	  delete his_self.game.deck[0].discards["037"];
	  if (his_self.game.player == p) {
            let fhand_idx = his_self.returnFactionHandIdx(p, "protestant");
	    his_self.game.deck[0].fhand[fhand_idx].push("037");
	  }
	}

	//
	// protestants can convert german-language space closest to wittenberg
	//
	his_self.game.queue.push("frederick_the_wise\t2");
	his_self.game.queue.push("frederick_the_wise\t1");
	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "frederick_the_wise") {

          his_self.game.queue.splice(qe, 1);
	  let faction = "protestant";
	  let num = mv[1];

	  res = his_self.returnNearestSpaceWithFilter(
	    "wittenberg",
	    function(spacekey) {
	      if (his_self.game.spaces[spacekey].religion == "catholic" && his_self.game.spaces[spacekey].language == "german") { return 1; }
	      return 0;
	    },
	    function(propagation_filter) {
	      return 1;
	    },
	    0,
	    1,
	  );

	  //
	  // if no options, skip
	  //
	  if (res.length <= 0) { 
	    his_self.updateLog("No viable spaces for Frederick the Wise");
	    return 1;
	  }

	  //
	  // otherwise pick closest space
	  //
	  if (his_self.game.player == his_self.returnPlayerOfFaction("protestant")) {
 	    his_self.playerSelectSpaceWithFilter(
  	      "Select Towns to Convert Protestant: ",
	      (space) => {
	        for (let i = 0; i < res.length; i++) { if (space.key == res[i].key) { return 1; } }
	        return 0;
	      },
	      (spacekey) => {
	        his_self.addMove("convert" + "\t" + spacekey + "\t" + "protestant");
	        his_self.endTurn();
	      },
	      null,
	      true
	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName("protestant") + " playing " + his_self.popup("078"));
	  }

	  return 0;

	}

	return 1;
      }
    }
    deck['079'] = { 
      img : "cards/HIS-079.svg" , 
      name : "Fuggers" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	for (let z = 0; z < his_self.game.queue.length; z++) {
	  let c = his_self.game.queue[z].split("\t");
	  if (c[0] == "cards_left") { c.splice(z, 1); }
	}
      
        his_self.game.queue.push("cards_left\t"+faction+"\t"+(parseInt(his_self.game.state.cards_left[faction])+2));
        his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction+"\t1");
        his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
        his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
	his_self.game.state.events.fuggers = faction;

	return 1;
      },
    }
    deck['080'] = { 
      img : "cards/HIS-080.svg" , 
      name : "Gabelle Revolt" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player == p) {

	  let space1 = "";
	  let space2 = "";

          his_self.playerSelectSpaceWithFilter(
	    "Select 1st Unoccupied French Home Space: ",
	    function(space) {
	      if (
		space.home === "france" &&
		(!his_self.isOccupied(space) && !space.unrest)
	      ) {
		return 1;
	      }
	      return 0;
	    },
	    function(spacekey) {

	      space1 = spacekey;

	      his_self.addUnrest(space1);
	      his_self.displaySpace(space1);

              his_self.playerSelectSpaceWithFilter(
	        "Select 2nd Unoccupied French Home Space: ",
	        function(space) {
	          if (
	  	    space.home === "france" &&
	  	    space.key != space1 &&
		    (!his_self.isOccupied(space) && !space.unrest)
	          ) {
		    return 1;
	          }
	          return 0;
	        },
		function(spacekey2) {
		  his_self.updateStatus("adding unrest...");
		  space2 = spacekey2;

	          his_self.addUnrest(space2);
	          his_self.displaySpace(space2);

		  his_self.addMove("unrest\t"+space1);
		  his_self.addMove("unrest\t"+space2);
		  his_self.endTurn();
		},
		null,
		true
	      );
	    },
	    null,
	    true,
	  );
        }

        return 0;
      },
    }
    deck['081'] = { 
      img : "cards/HIS-081.svg" , 
      name : "Indulgence Vendor" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.game.queue.push("indulgence-vendor\t"+faction);
	his_self.game.queue.push("pull_card\t"+faction+"\tprotestant");

        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "indulgence-vendor") {

	  let faction = mv[1];
  
          his_self.game.queue.splice(qe, 1);
	  if (his_self.game.state.last_pulled_card == undefined || his_self.game.state.last_pulled_card === "" || his_self.game.state.last_pulled_card === "undefined") {
	    his_self.updateLog("Protestants have no cards to pull...");
	    return 1;
	  }

	  let p = his_self.returnPlayerOfFaction(faction);
          let fhand_idx = his_self.returnFactionHandIdx(p, faction);
	  let card = his_self.game.state.last_pulled_card;

	  if (card) {
  	    let deck = his_self.returnDeck(true);
	    let ops = deck[card].ops;

  	    his_self.game.queue.push("show_overlay\tfaction\tpapacy");
	    for (let i = 0; i < ops; i++) {
  	      his_self.game.queue.push("build_saint_peters");
	    }
  	    his_self.game.queue.push("discard\t"+faction+"\t"+card);
	  }
	  
	  return 1;

        }

	return 1;

      },
    }
    deck['082'] = { 
      img : "cards/HIS-082.svg" , 
      name : "Janissaries Rebel" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let at_war = false;
	let f = his_self.returnImpulseOrder();
	for (let i = 0; i < f.length; i++) {
	  if (f[i] !== "ottoman") {
	    if (his_self.areEnemies(f[i], "ottoman")) {
	      at_war = true;
	    }
	  }
	}

	his_self.game.state.janissaries_spaces = [];

	let spaces_to_select = 4;
	if (at_war) { spaces_to_select = 2; }

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.isOccupied(spacekey)) { return 0; }
	    if (his_self.game.spaces[spacekey].home == "ottoman") { return 1; }
	    return 0;
	  });

	  if (res.length < spaces_to_select) { spaces_to_select = res.length; }
	  for (let i = 0; i < spaces_to_select; i++) {
	    his_self.addMove("janissaries_rebel\t"+faction+"\t"+(spaces_to_select-i));
	  }
	  his_self.endTurn();

	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "janissaries_rebel") {

          his_self.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let num = mv[2];

	  if (his_self.game.player == his_self.returnPlayerOfFaction(faction)) {

 	    his_self.playerSelectSpaceWithFilter(

	      `Select Space to Add Unrest / #${num}`,

	      (space) => {
		if (his_self.game.state.janissaries_spaces.includes(space.key)) { return 0; }
	        if (his_self.isOccupied(space.key)) { return 0; }
	        if (his_self.game.spaces[space.key].home == "ottoman") { return 1; }
	        return 0;
	      },

	      (spacekey) => {
		his_self.game.state.janissaries_spaces.push(spacekey);
      		his_self.addMove("unrest\t"+spacekey);
		his_self.endTurn();
	      },

	      null,

	      true

	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("088"));
	  }
  
	  return 0;

	}

	return 1;
      },
    }
    deck['083'] = { 
      img : "cards/HIS-083.svg" , 
      name : "John Zapolya" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	//
	//
	//
	if (his_self.game.spaces["buda"].besieged > 0) {

	} else {

	  if (his_self.game.spaces["buda"].political == "" || his_self.game.spaces["buda"].political === "hungary") {
	    his_self.addRegular("hungary", "buda", 4);
	  } else {
	    his_self.addRegular(his_self.game.spaces["buda"].political, "buda", 4);
	  }
	}

	return 1;
      },
    }
    deck['084'] = { 
      img : "cards/HIS-084.svg" , 
      name : "Julia Gonzaga" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.events.barbary_pirates) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {
	his_self.game.state.events.julia_gonzaga_activated = 1;
	his_self.game.state.events.julia_gonzaga = "ottoman";

	return 1;
      },
    }
    deck['085'] = { 
      img : "cards/HIS-085.svg" , 
      name : "Katherina Bora" ,
      warn : ["papacy"] ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	if (!his_self.isDebaterCommitted("luther-debater")) {
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	//
	// protestant player gets 5 Reformation Attempts
	//
	let p = his_self.returnPlayerOfFaction("protestant");

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	//
	// and commit luther
	//
	his_self.commitDebater("protestant", "luther-debater");
	  
	return 1;
      },
    }
    deck['086'] = { 
      img : "cards/HIS-086.svg" , 
      name : "Knights of St. John" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	//
	// knights are on map
	//
	if (his_self.game.state.knights_of_st_john != "") {

	  let space = his_self.game.spaces[his_self.game.state.knights_of_st_john];

	  let connected = false;
	  if (!space.besieged) {
            for (let i = 0; i < space.ports.length; i++) {
              let sea = his_self.game.navalspaces[space.ports[i]];
              for (let z = 0; z < sea.ports.length; z++) {
                if (his_self.returnFactionControllingSpace(sea.ports[z]) == "ottoman") {
                  connected = true;
                }
              }
            }
          }

	  if (connected) {
	    his_self.game.queue.push("knights_ottoman_pull\tpapacy");
            his_self.game.queue.push("pull_card\tpapacy\tottoman");
	  }

        } else {

	  let p = his_self.returnPlayerOfFaction("hapsburg");
	  if (his_self.game.player === p) {

 	    his_self.playerSelectSpaceWithFilter(

	      `Select Space to place Knights of St. John`,

	      (space) => {
		if (space.home === "hapsburg") {
		  if (space.ports.length > 0) { 
		    if (his_self.isSpaceControlled(space.key, "hapsburg")) {
		      return 1;
		    }
		  }
		}
	        return 0;
	      },

	      (spacekey) => {
      		his_self.addMove("knightify_space\t"+spacekey);
		his_self.endTurn();
	      },

	      null,

	      true

	    );
	    
	  } else {
	    his_self.updateStatus("Hapsburgs placing Knights of St. John");
	  }

	  return 0;

	}

        return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "knightify_space") {

          his_self.game.queue.splice(qe, 1);

	  let spacekey = mv[1];
	  let space = his_self.game.spaces[spacekey];

	  space.home = "independent";
	  space.political = "independent";
	  his_self.game.state.knights_of_st_john = spacekey;
	  his_self.game.queue.push("fortify\t"+spacekey);

	  return 1;

	}

        if (mv[0] == "knights_ottoman_pull") {

          let faction = mv[1];
          his_self.game.queue.splice(qe, 1);

          let p = his_self.returnPlayerOfFaction(faction);
          let fhand_idx = his_self.returnFactionHandIdx(p, faction);
          let card = his_self.game.state.last_pulled_card;
          let ops = his_self.game.deck[0].cards[card].ops;

          his_self.game.queue.push("show_overlay\tfaction\tpapacy");
          for (let i = 0; i < ops; i++) {
            his_self.game.queue.push("build_saint_peters");
          }
          his_self.game.queue.push("discard\t"+faction+"\t"+card);

          return 1;

	}

	return 1;
      },
    }
    deck['087'] = { 
      img : "cards/HIS-087.svg" , 
      name : "Mercenaries Demand Pay" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (his_self.game.player == p) {

	  // pick a faction
  	  his_self.playerSelectFactionWithFilter(

	    "Select Faction to Target: ",

	    function(f) {
	      if (f !== faction) { return 1; }
	      return 0;
	    },

	    function (target) {
	      his_self.addMove("check_for_stranded_leaders\t"+target);
	      his_self.addMove("mercenaries-demand-pay\t"+target+"\t"+faction);
	      his_self.addMove("NOTIFY\t"+his_self.popup("087")+" targets "+his_self.returnFactionName(target));
	      his_self.endTurn();
	    }
	  );
	}
	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "mercenaries-demand-pay") {

          his_self.game.queue.splice(qe, 1);

	  let target = mv[1];
	  let faction = mv[2];
	  let player = his_self.returnPlayerOfFaction(target);

	  his_self.displayModal(his_self.returnFactionName(faction) + " plays Mercenaries Demand Pay");
	  his_self.updateStatus(his_self.returnFactionName(target) + " discarding card...");

	  if (player == his_self.game.player) {

	    //
	    // do we have any cards we can discard ?
	    //
            let fhand_idx = his_self.returnFactionHandIdx(his_self.game.player, target);
	    let valid_options = 0;
	    let invalid_options = 0;
	    let home_card_option = 0;

	    for (let i = 0; i < his_self.game.deck[0].fhand[fhand_idx].length; i++) {
	      let card = his_self.game.deck[0].fhand[fhand_idx][i];
	      if (parseInt(card) <= 8) { home_card_option++ };
	      if (his_self.game.deck[0].cards[card].type != "mandatory" && parseInt(card) > 8) { valid_options++; } else {
		invalid_options++;
	      }
	    }

	    //
	    // if only invalid options, skip discard
	    //
	    if (valid_options == 0 && invalid_options == 0) {
	      if (home_card_option == 0) {
	        his_self.addMove("destroy_all_mercenaries\t"+target);
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(target) + " must destroy_all_mercenaries");
	        his_self.endTurn();
	        return 0;
	      }
	    }

	    if (valid_options == 0 && invalid_options > 0) {
	      if (home_card_option == 0) {
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(target) + " cannot be forced to discard cards in hand.");
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(target) + " mercenaries survive.");
	        his_self.endTurn();
	        return 0;
	      }
	    }


            his_self.playerFactionSelectCardWithFilter(

	      target,

	      "Select Card to Discard: ",

	      function(card) {
		let c = his_self.game.deck[0].cards[card];
	        if (c.type === "mandatory") { return 0; }
		return 1;
	      },

	      function(card) {

		//
		// can always opt not to discard
		//
		if (card == "pass"){ 
		  his_self.addMove("destroy_all_mercenaries\t"+target);
	          his_self.addMove("NOTIFY\t"+his_self.returnFactionName(target) + " must destroy_all_mercenaries");
	          his_self.endTurn();
		  return 0;
		}

		let c = his_self.game.deck[0].cards[card].ops;	      

  	  	his_self.addMove("discard\t"+target+"\t"+card);
		his_self.addMove("NOTIFY\t" + his_self.returnFactionName(target) + " discards " + his_self.popup(card));

		let retained = 2;
		if (c == 2) { retained = 4; }
		if (c == 3) { retained = 6; }
		if (c == 4) { retained = 10; }
		if (c >= 5) {
		  his_self.endTurn();
		  return;
		}

		//
		// player must discard down to N (retained) mercenaries
		//
		his_self.playerRetainUnitsWithFilter(
		  target,
		  function(spacekey, unit_idx) {
		    if (his_self.game.spaces[spacekey].units[target][unit_idx].type == "mercenary") { return 1; }
		    return 0;
		  },
		  retained
		);
	      },

	      null ,

	      true // permit passing/no-selection

	    );
	  }
	  return 0;
        }
	return 1;
      }
    }
    deck['088'] = { 
      img : "cards/HIS-088.svg" , 
      name : "Peasants' War" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
        let res = his_self.returnSpacesWithFilter(function(spacekey) {
	  if (his_self.isOccupied(spacekey)) { return 0; }
	  if (his_self.game.spaces[spacekey].language == "german") { return 1; }
	  return 0;
	});
	if (res.length > 0) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.isOccupied(spacekey)) { return 0; }
	    if (his_self.game.spaces[spacekey].language == "german") { return 1; }
	    return 0;
	  });


	  let spaces_to_select = 5;
	  if (res.length < 5) { spaces_to_select = res.length; }
	  for (let i = 0; i < spaces_to_select; i++) {
	    his_self.addMove("peasants_war\t"+faction+"\t"+(5-i));
	  }
	  his_self.endTurn();

	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "peasants_war") {

          his_self.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let num = mv[2];

	  if (!his_self.game.state.peasants_war) {
	    his_self.game.state.peasants_war = [];
	  }
	  if (parseInt(num) == 1) {
	    his_self.game.state.peasants_war = [];
	  }

	  if (his_self.game.player == his_self.returnPlayerOfFaction(faction)) {

	    //
	    // pick unit on map with player land units and select one to remove
	    //
 	    his_self.playerSelectSpaceWithFilter(

	      `Select Space to Add Unrest / #${num}`,

	      (space) => {
	        if (his_self.game.state.peasants_war) { if (his_self.game.state.peasants_war.includes(space.key)) { return 0; } }
	        if (his_self.isOccupied(space.key)) { return 0; }
	        if (his_self.game.spaces[space.key].language == "german") { return 1; }
	        return 0;
	      },

	      (spacekey) => {
	        his_self.game.state.peasants_war.push(spacekey);
      		his_self.addMove("unrest\t"+spacekey);
		his_self.endTurn();
	      },

	      null,

	      true

	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("088"));
	  }
  
	  return 0;

	}

	return 1;
      }
    }
    deck['089'] = { 
      img : "cards/HIS-089.svg" , 
      name : "Pirate Haven" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {

	if (his_self.game.state.events.barbary_pirates == 1) {

	  let target_oran = false;
	  let target_tripoli = false;

	  if (his_self.isUnoccupied("oran") && his_self.areEnemies("ottoman", his_self.returnFactionControllingSpace("oran"))) {
	    let oran = his_self.game.spaces["oran"];
	    for (let i = 0; i < oran.ports.length; i++) {
	      let sea = his_self.game.navalspaces[oran.ports[i]];
	      for (let z = 0; z < sea.ports.length; z++) {
	        if (his_self.game.spaces[sea.ports[z]].fortress == 1 || his_self.game.spaces[sea.ports[z]].type == "key") {
	          if (his_self.returnFactionControllingSpace(sea.ports[z]) == "ottoman") {
	  	    target_oran = true;
		  }
	        }
	      }
	    }
	  }
	  if (his_self.isUnoccupied("tripoli") && his_self.areEnemies("ottoman", his_self.returnFactionControllingSpace("tripoli"))) {
	    let tripoli = his_self.game.spaces["tripoli"];
	    for (let i = 0; i < tripoli.ports.length; i++) {
	      let sea = his_self.game.navalspaces[tripoli.ports[i]];
	      for (let z = 0; z < sea.ports.length; z++) {
	        if (his_self.game.spaces[sea.ports[z]].fortress == 1 || his_self.game.spaces[sea.ports[z]].type == "key") {
	          if (his_self.returnFactionControllingSpace(sea.ports[z]) == "ottoman") {
		    target_tripoli = true;
		  }
	        }
	      }
	    }
	  }

	  if (target_oran == true || target_tripoli == true) {
	    return 1;
	  }

	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("ottoman");

	if (his_self.game.player == p) {
	let target_oran = false;
	let target_tripoli = false;

        if (his_self.isUnoccupied("oran") && his_self.areEnemies("ottoman", his_self.returnFactionControllingSpace("oran"))) {
          let oran = his_self.game.spaces["oran"];
          for (let i = 0; i < oran.ports.length; i++) {
            let seakey = oran.ports[i];
            let sea = his_self.game.navalspaces[seakey];
            for (let z = 0; z < sea.ports.length; z++) {
              if (his_self.game.spaces[sea.ports[z]].fortress == 1 || his_self.game.spaces[sea.ports[z]].type == "key") {
                if (his_self.returnFactionControllingSpace(sea.ports[z]) == "ottoman") {
                  target_oran = true;
                }
              }
            }
          }
        }
        if (his_self.isUnoccupied("tripoli") && his_self.areEnemies("ottoman", his_self.returnFactionControllingSpace("tripoli"))) {
          let tripoli = his_self.game.spaces["tripoli"];
          for (let i = 0; i < tripoli.ports.length; i++) {
            let seakey = tripoli.ports[i];
            let sea = his_self.game.navalspaces[seakey];
            for (let z = 0; z < sea.ports.length; z++) {
              if (his_self.game.spaces[sea.ports[z]].fortress == 1 || his_self.game.spaces[sea.ports[z]].type == "key") {
                if (his_self.returnFactionControllingSpace(sea.ports[z]) == "ottoman") {
                  target_tripoli = true;
                }
              }
            }
          }
        }

   	let msg = "Convert Space into Pirate Haven: ";
        let html = '<ul>';
  	if (target_oran)    { html += `<li class="option" id="oran">Oran</li>`; }
  	if (target_tripoli) { html += `<li class="option" id="tripoli">Tripoli</li>`; }
    	html += '</ul>';

        his_self.updateStatusWithOptions(msg, html);

   	$('.option').off();
	$('.option').on('click', function () {

   	  $('.option').off();
	  let action2 = $(this).attr("id");
	  his_self.updateStatus("converting...");

	  his_self.addMove("pirate_haven\t"+action2);
	  his_self.endTurn();

	});
	}
	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "pirate_haven") {

          his_self.game.queue.splice(qe, 1);
	  let spacekey = mv[1];

	  his_self.addRegular("ottoman", spacekey, 1);
	  his_self.addCorsair("ottoman", spacekey, 2);
	  his_self.game.spaces[spacekey].pirate_haven = 1;
	  if (spacekey != "oran" && spacekey != "tripoli") {
	    his_self.game.spaces[spacekey].fortified = 1;
	  }

	  his_self.controlSpace("ottoman", spacekey);
	  his_self.displaySpace(spacekey);

	  return 1;

	}

        return 1;
      },
    }
    deck['090'] = { 
      img : "cards/HIS-090.svg" , 
      warn : ["papacy"] ,
      name : "Printing Press" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

        his_self.game.state.printing_press_active = 1;

	let p = his_self.returnPlayerOfFaction("protestant");

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['091'] = { 
      img : "cards/HIS-091.svg" , 
      name : "Ransom" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	for (let i = 0; i < his_self.game.state.players_info.length; i++) {
	  if (his_self.game.state.players_info[i].captured.length > 0) {
	    return 1;
	  } 	
	}	
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

  	  //
	  // list of all captured leaders
	  //
	  let captured_leaders = [];
	  let options = [];

	  for (let i = 0; i < his_self.game.state.players_info.length; i++) {
	    for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
	      captured_leaders.push({ faction : his_self.game.state.players_info[i].captured[ii].faction , leader : his_self.game.state.players_info[i].captured[ii].type , player : i , idx : ii });
	      options.push(his_self.game.state.players_info[i].captured[ii].type);
	    } 	
	  }	

   	  let msg = "Select Leader to Ransom: ";
	  let html = '<ul>';
	  for (let i = 0; i < options.length; i++) { html += `<li class="option" id="${i}">${options[i]}</li>`; }
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

   	  $('.option').off();
	  $('.option').on('click', function () {
   	    $('.option').off();

	    his_self.updateStatus("sending");

	    let options_idx = $(this).attr("id");
	    his_self.addMove("ransom\t"+options[options_idx]);
	    his_self.addMove("NOTIFY\t" + options[options_idx] + " ransomed...");
	    his_self.endTurn();
	  });

	}

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "ransom_placement") {

          his_self.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let spacekey = mv[2];

	  if (his_self.game.state.ransomed_leader != null) {
	    his_self.game.spaces[spacekey].units[faction].push(his_self.game.state.ransomed_leader);
	    his_self.game.state.ransomed_leader = null;
	  } 

	  return 1;

	}

        if (mv[0] == "ransom") {

          his_self.game.queue.splice(qe, 1);

	  his_self.game.state.ransomed_leader = null;
	  let ransomed_leader_type = mv[1];
	  let ransomed_leader = null;

	  for (let i = 0; i < his_self.game.state.players_info.length; i++) {
	    for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
	      if (his_self.game.state.players_info[i].captured[ii].type == ransomed_leader_type) {
	        ransomed_leader = his_self.game.state.players_info[i].captured[ii];
		his_self.game.state.players_info[i].captured.splice(ii, 1);
	      }
	    } 	
	  }	

	  if (ransomed_leader === null) { return; }

	  his_self.game.state.ransomed_leader = ransomed_leader;

	  let player = his_self.returnPlayerOfFaction(ransomed_leader.owner);

	  if (player == his_self.game.player) {

            his_self.playerSelectSpaceWithFilter(

	      "Select Fortified Home Space: ",

	      function(space) {
		if ((space.type == "fortress" || space.type == "electorate" || space.type == "key") && space.home == ransomed_leader.owner) {
		  if (his_self.isSpaceControlled(space.key, ransomed_leader.owner)) {
		    return 1;
		  }
		}
		return 0;
	      },

	      function(spacekey) {
		his_self.addMove("ransom_placement\t"+ransomed_leader.owner+"\t"+spacekey);
		his_self.endTurn();
	      },

	      null,

	      true 

	    );
	  }
	  return 0;
        }
	return 1;
      }
    }
    deck['092'] = { 
      img : "cards/HIS-092.svg" , 
      warn : ["ottoman"] ,
      name : "Revolt in Egypt" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        if (his_self.game.state.events.revolt_in_egypt == 1) { return 0; }
        return 1;
      },
      onEvent(his_self, faction) {

	his_self.displayEgypt();

        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);

        his_self.game.state.events.revolt_in_egypt = 1;

        his_self.game.queue.push("check_for_broken_sieges");
        his_self.game.queue.push("revolt_in_egypt_leader_removal\tottoman");
        his_self.game.queue.push("revolt_in_egypt_troop_removal\tottoman\t3");
        his_self.game.queue.push("revolt_in_egypt_troop_removal\tottoman\t2");
        his_self.game.queue.push("revolt_in_egypt_troop_removal\tottoman\t1");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_egypt_leader_removal") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

   	    let msg = "Move Army Leader: ";
	    let options = [];
	    for (let key in his_self.game.spaces) {
	      if (key != "persia" && key != "egypt" && key != "ireland") {
	        let space = his_self.game.spaces[key];
                for (let i = 0; i < space.units["ottoman"].length; i++) {
                  let u = space.units["ottoman"][i];
	          if (u.army_leader) {
	  	    options.push({ spacekey : key , idx : i , name : u.name });
	          }
	        }
	      }
	    }

            let html = '<ul>';
	    for (let i = 0; i < options.length; i++) {
  	      html += `<li class="option" id="${i}">${options[i].name}</li>`;
	    }
  	    html += `<li class="option" id="skip">skip</li>`;
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

   	    $('.option').off();
	    $('.option').on('click', function () {

   	      $('.option').off();
	      his_self.updateStatus("moving...");
	      let options_idx = $(this).attr("id");

	      if (options_idx === "skip") {
                his_self.endTurn();
	        return 0;
	      }

              his_self.addMove("move\tottoman\tland\t"+options[options_idx].spacekey+"\tegypt\t"+options[options_idx].idx);
              his_self.endTurn();

	    });

	  } else {
	    his_self.updateStatus("Ottomans selecting Foreign War Leader...");
	  }

	  return 0;

        }

	//
	// this copies the logic from Plague
	//
        if (mv[0] == "revolt_in_egypt_troop_removal") {

	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player != player) { return 0; }

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; }
	  if (num == 3) { num = "3rd"; }
	  if (num == 3) { num = "4th"; }
	  if (num == 3) { num = "5th"; }

          his_self.playerSelectSpaceOrNavalSpaceWithFilter(

            `Select Space to Remove ${num} Unit` ,

            function(space) {
	      if (space.key == "persia" || space.key == "egypt" || space.key == "ireland") { return 0; }
	      if (space.units["ottoman"].length > 0) {
		  for (let z = 0; z < space.units["ottoman"].length; z++) {
		    let u = space.units["ottoman"][z];
		    if (u.type === "regular") { return 1; }
		    if (u.type === "mercenary") { return 1; }
		    if (u.type === "cavalry") { return 1; }
		  }
	      }
	      return 0;
            },

            function(spacekey) {

	      let land_or_sea = "land";
	      let space = null;

	      if (his_self.game.navalspaces[spacekey]) {
		land_or_sea = "sea";
		space = his_self.game.navalspaces[spacekey];
	      } else {
		space = his_self.game.spaces[spacekey];
	      }
	   
	      if (space == null) {
		alert("ERROR: not sure where you clicked - reload to continue");
		return 1;
	      }
	      
   	      let msg = "Remove Which Unit: ";
              let unittypes = ["corsair", "squadron"];
	      let unit_destroyed = 0;
              let html = '<ul>';
	      let du = -1;
              for (let i = 0; i < space.units["ottoman"].length; i++) {
                if (space.units["ottoman"][i].command_value == 0) {
		  if (!unittypes.includes(space.units["ottoman"][i].type) && space.units["ottoman"][i].army_leader != true && space.units["ottoman"][i].personage != true) {
		    if (du == -1) { du = i; } else { du = -2; }
  		    html += `<li class="option nonskip" id="${space.units["ottoman"][i].type}">${space.units["ottoman"][i].type}</li>`;
		    unittypes.push(space.units["ottoman"][i].type);
		  }
		}
	      }

  	      html += `<li class="option" id="skip">skip</li>`;
    	      html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

   	      $('.option').off();
	      $('.option').on('click', function () {

   	        $('.option').off();
	        let unittype = $(this).attr("id");
		if (unit_destroyed == 1) { return; }	
		unit_destroyed = 1;

		if (unittype === "skip") {
//          	  his_self.endTurn();
		  return 0;
		}

          	his_self.removeUnit("ottoman", spacekey, unittype);

		his_self.displaySpace(spacekey);

          	console.log("remove_unit\t"+land_or_sea+"\t"+"ottoman"+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	his_self.addMove("remove_unit\t"+land_or_sea+"\t"+"ottoman"+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	his_self.addMove("build\tland\tottoman\t"+unittype+"\tegypt");
          	his_self.endTurn();
	      });

	      // auto-submit if only 1 choice
	      if (du > -1) { $('.nonskip').click(); }

            },

            null, 

	    true

	  );

          return 0;

	}

        return 1;
      }
    }
    deck['093'] = { 
      img : "cards/HIS-093.svg" , 
      name : "Revolt in Ireland" ,
      warn : ["england"] ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        if (his_self.game.state.events.revolt_in_ireland == 1) { return 0; }
        return 1;
      },
      onEvent(his_self, faction) {

	his_self.displayIreland();

        his_self.addRegular("independent", "ireland", 1);
        his_self.addRegular("independent", "ireland", 1);
        his_self.addRegular("independent", "ireland", 1);

        his_self.game.state.events.revolt_in_ireland = 1;

	if (faction == "france" || faction == "hapsburg") {
          his_self.game.queue.push("revolt_in_ireland_bonus_resistance\t"+faction);
	}

        his_self.game.queue.push("check_for_broken_sieges");
        his_self.game.queue.push("revolt_in_ireland_leader_removal\tengland");
        his_self.game.queue.push("revolt_in_ireland_troop_removal\tengland\t4");
        his_self.game.queue.push("revolt_in_ireland_troop_removal\tengland\t3");
        his_self.game.queue.push("revolt_in_ireland_troop_removal\tengland\t2");
        his_self.game.queue.push("revolt_in_ireland_troop_removal\tengland\t1");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_ireland_leader_removal") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
  
	  if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

 	    let msg = "Move Army Leader: ";
	    let options = [];
	    for (let key in his_self.game.spaces) {
	      if (key != "persia" && key != "egypt" && key != "ireland") {
	        let space = his_self.game.spaces[key];
                for (let i = 0; i < space.units["england"].length; i++) {
                  let u = space.units["england"][i];
	          if (u.army_leader) {
	  	    options.push({ spacekey : key , idx : i , name : u.name });
	          }
	        }
	      }
	    }

            let html = '<ul>';
	    for (let i = 0; i < options.length; i++) {
  	      html += `<li class="option" id="${i}">${options[i].name}</li>`;
	    }
  	    html += `<li class="option" id="skip">skip</li>`;
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

   	    $('.option').off();
	    $('.option').on('click', function () {

	      let options_idx = $(this).attr("id");
   	      $('.option').off();

	      his_self.updateStatus("shifting forces to Ireland...");

	      if (options_idx === "skip") {
                his_self.endTurn();
	        return 0;
	      }

              his_self.addMove("move\tengland\tland\t"+options[options_idx].spacekey+"\tireland\t"+options[options_idx].idx);
              his_self.endTurn();

	    });

	  } else {
	    his_self.updateStatus("England choosing Foreign War Leader...");
	  }

	  return 0;

        }

	//
	// this copies the logic from Plague
	//
        if (mv[0] == "revolt_in_ireland_troop_removal") {

	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player != player) { return 0; }

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; }
	  if (num == 3) { num = "3rd"; }
	  if (num == 3) { num = "4th"; }
	  if (num == 3) { num = "5th"; }

          his_self.playerSelectSpaceOrNavalSpaceWithFilter(

            `Select Space to Remove ${num} Unit` ,

            function(space) {
	      if (space.key == "persia" || space.key == "egypt" || space.key == "ireland") { return 0; }
	      if (space.units["england"].length > 0) {
		  for (let z = 0; z < space.units["england"].length; z++) {
		    let u = space.units["england"][z];
		    if (u.type === "regular") { return 1; }
		    if (u.type === "mercenary") { return 1; }
		    if (u.type === "cavalry") { return 1; }
		  }
	      }
	      return 0;
            },

            function(spacekey) {

	      let land_or_sea = "land";
	      let space = null;

	      if (his_self.game.navalspaces[spacekey]) {
		land_or_sea = "sea";
		space = his_self.game.navalspaces[spacekey];
	      } else {
		space = his_self.game.spaces[spacekey];
	      }
	   
	      if (space == null) {
		alert("ERROR: not sure where you clicked - reload to continue");
		return 1;
	      }
	      
   	      let msg = "Remove Which Unit: ";
              let unittypes = ["corsair", "squadron"];
	      let unit_destroyed = 0;
              let html = '<ul>';
	      let du = -1;
              for (let i = 0; i < space.units["england"].length; i++) {
                if (space.units["england"][i].command_value == 0) {
		  if (!unittypes.includes(space.units["england"][i].type) && space.units["england"][i].army_leader != true && space.units["england"][i].personage != true) {
		    if (du == -1) { du = i; } else { du = -2; }
  		    html += `<li class="option nonskip" id="${space.units["england"][i].type}">${space.units["england"][i].type}</li>`;
		    unittypes.push(space.units["england"][i].type);
		  }
		}
	      }

  	      html += `<li class="option" id="skip">skip</li>`;
    	      html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

   	      $('.option').off();
	      $('.option').on('click', function () {

   	        $('.option').off();
	        let unittype = $(this).attr("id");
		if (unit_destroyed == 1) { return; }	
		unit_destroyed = 1;

		if (unittype === "skip") {
//          	  his_self.endTurn();
		  return 0;
		}

          	his_self.removeUnit("england", spacekey, unittype);

		his_self.displaySpace(spacekey);

          	his_self.addMove("remove_unit\t"+land_or_sea+"\t"+"england"+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	his_self.addMove("build\tland\tengland\t"+unittype+"\tireland");
          	his_self.endTurn();
	      });

	      // auto-submit if only 1 choice
	      if (du > -1) { $('.nonskip').click(); }

            },

            null, 

	    true

	  );

          return 0;

	}

        if (mv[0] == "revolt_in_ireland_bonus_resistance") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  let p = his_self.returnPlayerCommandingFaction(faction);

	  if (his_self.game.player === p) {

            let msg = "Remove 1 Land Unit to Fortify Irish Resistance?";
            let html = '<ul>';
            html += '<li class="option" id="yes">yes</li>';
            html += '<li class="option" id="no">no</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let action = $(this).attr("id");

	      his_self.updateStatus("acknowledge");

              if (action == "yes") {
		
		//
		// pick unit on map with player land units and select one to remove
		//
 	 	his_self.playerSelectSpaceWithFilter(

		  "Select Space to Remove 1 Land Unit",

		  (space) => { if (his_self.returnFactionLandUnitsInSpace(faction, space.key) > 0) { return 1; } else { return 0; } },

		  (spacekey) => {
		    
      		    let opts = his_self.returnFactionLandUnitsInSpace(faction, spacekey);
		    let space = his_self.game.spaces[spacekey];

            	    let msg = "Remove which Land Unit?";
            	    let html = '<ul>';

		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "cavalry") {
   	                html += `<li class="option" id="${i}">cavalry</li>`;
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "regular") {
   	                html += `<li class="option" id="${i}">regular</li>`;
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "mercenary") {
   	                html += `<li class="option" id="${i}">mercenary</li>`;
			break;
		      }
		    }

            	    html += '</ul>';

            	    his_self.updateStatusWithOptions(msg, html);

	            $('.option').off();
        	    $('.option').on('click', function () {

	              let action = parseInt($(this).attr("id"));

		      his_self.updateStatus("removing unit...");
          	      his_self.addMove("build\tland\tindependent\tregular\tireland");
		      his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					faction + "\t" +
					space.units[faction][action].type + "\t" +
					space.key );
		      his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" removes unit from " + space.key);
		      his_self.endTurn();

		    });
		  },
		);
		return 0;
	      }
              if (action === "no") {
		his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" does not support Irish rebels");
		his_self.endTurn();
	      }
	    });
	  }
	  return 0;
        }
        return 1;
      }
    }
    deck['094'] = { 
      img : "cards/HIS-094.svg" , 
      name : "Revolt of the Communeros" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.isOccupied(spacekey)) { return 0; }
	    if (his_self.game.spaces[spacekey].language == "spanish") { return 1; }
	    return 0;
	  });


	  let spaces_to_select = 3;
	  if (res.length < 3) { spaces_to_select = res.length; }
	  for (let i = 0; i < spaces_to_select; i++) {
	    his_self.addMove("revolt_of_the_communeros\t"+faction+"\t"+(3-i));
	  }
	  his_self.endTurn();

	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_of_the_communeros") {

          his_self.game.queue.splice(qe, 1);
	  let faction = mv[1];
	  let num = mv[2];

	  if (his_self.game.player == his_self.returnPlayerOfFaction(faction)) {

	    //
	    // pick unit on map with player land units and select one to remove
	    //
 	    his_self.playerSelectSpaceWithFilter(

	      `Select Space to Add Unrest / #${num}`,

	      (space) => {
	        if (his_self.isOccupied(space.key)) { return 0; }
	        if (his_self.game.spaces[space.key].language == "spanish") { return 1; }
	        return 0;
	      },

	      (spacekey) => {
      		his_self.addMove("unrest\t"+spacekey);
		his_self.endTurn();
	      },

	      null,

	      true

	    );
	  } else {
	    his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("094"));
	  }
  
	  return 0;

	}

	return 1;
      }
    }
    deck['095'] = { 
      img : "cards/HIS-095.svg" , 
      warn : ["papacy"] ,
      name : "Sack of Rome" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {

	let regulars_in_rome = 0;
	let sack_of_rome = false;
	for (let i = 0; i < his_self.game.spaces["rome"].units.length; i++) {
	  let u = his_self.game.spaces["rome"].units[i];
	  if (u.type == "regular") { regulars_in_rome++; }
	}

	let max_non_papal_mercenaries = 0;
	let spacekey = "";
	for (let key in his_self.game.spaces) {
	  if (his_self.game.spaces[key].language == "italian") {
	    let non_papal_mercenaries = 0;
	    for (let f in his_self.game.spaces[key].units) {
	      if (f != "papacy" && his_self.isAlliedMinorPower(f, "papacy") != true) {
		for (let i = 0; i < his_self.game.spaces[key].units[f].length; i++) {
		  let u = his_self.game.spaces[key].units[f][i];
		  if (u.type == "mercenary") {
		    non_papal_mercenaries++;  
		  }
	        }
	      }
	    }
	    if (non_papal_mercenaries > regulars_in_rome && non_papal_mercenaries > max_non_papal_mercenaries) {
	      spacekey = key;
	      max_non_papal_mercenaries = non_papal_mercenaries;
	      sack_of_rome = true;
	    }
	  }
	}
	return sack_of_rome;
      },
      onEvent : function(his_self, faction) {

	his_self.game.state.events.sack_of_rome = 1;

	let regulars_in_rome = 0;
	let sack_of_rome = false;
	for (let i = 0; i < his_self.game.spaces["rome"].units.length; i++) {
	  let u = his_self.game.spaces["rome"].units[i];
	  if (u.type == "regular") { regulars_in_rome++; }
	}

	let max_non_papal_mercenaries = 0;
	let spacekey = "";
	let fact = "";
	for (let key in his_self.game.spaces) {
	  if (his_self.game.spaces[key].language == "italian") {
	    let non_papal_mercenaries = 0;
	    for (let f in his_self.game.spaces[key].units) {
	      if (f != "papacy" && his_self.isAlliedMinorPower(f, "papacy") != true) {
		for (let i = 0; i < his_self.game.spaces[key].units[f].length; i++) {
		  let u = his_self.game.spaces[key].units[f][i];
		  if (u.type == "mercenary") {
		    non_papal_mercenaries++;  
		    fact = f;
		  }
	        }
	      }
	    }
	    if (non_papal_mercenaries > regulars_in_rome && non_papal_mercenaries > max_non_papal_mercenaries) {
	      spacekey = key;
	      max_non_papal_mercenaries = non_papal_mercenaries;
	      sack_of_rome = true;
	    }
	  }
	}

	if (!sack_of_rome) { return 1; }

	//
	// otherwise we have a field battle
	//
	for (let f in his_self.game.spaces[spacekey].units) {
	  if (f == fact || his_self.returnControllingPower(f) == his_self.returnControllingPower(fact)) {
	    his_self.game.spaces["rome"].units[f] = his_self.game.spaces[spacekey].units[f];
	  }
	}
 	his_self.game.spaces[spacekey].units[fact] = [];
	his_self.game.queue.push("post_sack_of_rome_retreat\t"+fact+"\t"+spacekey);
	his_self.game.queue.push("field_battle\trome\t"+fact);

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "post_sack_of_rome_retreat") {

          let faction = mv[1];
          let spacekey = mv[2];
	  let power_controlling_rome = his_self.returnFactionControllingSpace("rome");

	  for (let f in his_self.game.spaces["rome"].units) {
	    if (f != power_controlling_rome && his_self.returnControllingPower(f) != his_self.returnControllingPower(power_controlling_rome)) {
 	      his_self.game.spaces[spacekey].units[f] = his_self.game.spaces["rome"].units[f];
 	      if (spacekey != "rome") { his_self.game.spaces["rome"].units[faction] = []; }
	    }
	  }
	 
	  //
	  // 2P game give cards to Protestants
	  //
	  if (his_self.game.players.length == 2) { faction = "protestant"; }

	  //
	  // if the papacy lost
	  //
	  if (his_self.game.state.field_battle.attacker_hits > his_self.game.state.field_battle.defender_hits) {

	    //
	    // remove this card from game
	    //
	    his_self.removeCardFromGame("095");

	    //
	    // deduct vp
	    //
	    let total_to_deduct = 5;
            his_self.game.state.saint_peters_cathedral['state'] -= total_to_deduct;
            if (his_self.game.state.saint_peters_cathedral['state'] < 0) {
	      let surplus = his_self.game.state.saint_peters_cathedral['state'] * -1;
	      if (his_self.game.state.saint_peters_cathedral['vp'] > 0) {
		his_self.game.state.saint_peters_cathedral['vp']--;
		his_self.game.state.saint_peters_cathedral['state'] = 5 - surplus;
	      } else {
		his_self.game.state.saint_peters_cathedral['state'] = 0;
	      }
	    }

	    //
	    // pull two cards
	    //
	    let faction_cards_left = his_self.game.state.cards_left[faction];
	    if (his_self.game.players.length == 2 || (faction != "hapsburg" || faction != "france")) {
	      let expected = 4;
	      if (!his_self.game.deck[0].discards['005']) { expected--; }
	      if (!his_self.game.deck[0].discards['006']) { expected--; }
	      if (his_self.game.state.cards_left["papacy"] < expected) { expected--; }
	      if (his_self.game.state.cards_left["papacy"] < expected) { expected--; }
	      if (expected >= 2) {
  	        his_self.game.queue.push("sack_of_rome_if_two_surplus_cards_discard\t"+faction+"\t"+faction_cards_left);
	        his_self.game.queue.push("pull_card\t"+faction+"\t"+"papacy");
	        his_self.game.queue.push("pull_card\t"+faction+"\t"+"papacy");
	      }
	      if (expected == 1) {
	        his_self.game.queue.push("NOTIFY\tPapacy has one card available for pull...");
	        his_self.game.queue.push("pull_card\t"+faction+"\t"+"papacy");
	      }
	      if (expected == 0) {
	        his_self.game.queue.push("NOTIFY\tPapacy has no cards available for pull...");
	      }
	    } else {
	      his_self.game.queue.push("discard_random\tpapacy");
	      his_self.game.queue.push("discard_random\tpapacy");
	    }

	  }

          his_self.game.queue.splice(qe, 1);
          return 1;

        }


	if (mv[0] === "sack_of_rome_if_two_surplus_cards_discard") {

	  let faction = mv[1];
	  let faction_cards_left = parseInt(mv[2]);
	  let cards = [];
	  let surplus_cards = 0;

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player === his_self.returnPlayerCommandingFaction(faction)) {
            let fhand_idx = his_self.returnFactionHandIdx(his_self.game.player, faction);
	    for (let i = faction_cards_left; i < his_self.game.deck[0].fhand[fhand_idx].length; i++) {
	      surplus_cards++;
	      cards.push(his_self.game.deck[0].fhand[fhand_idx][i]);
	    }

	    while (surplus_cards > 2) { cards.shift(); surplus_cards--; }
	  
	    if (surplus_cards == 2) {
	      his_self.addMove("select_and_discard\t"+faction+"\t"+JSON.stringify(cards));
	    }
	    his_self.endTurn();
	  }

          return 0;

	}

	return 1;

      },
    }
    deck['096'] = { 
      img : "cards/HIS-096.svg" , 
      name : "Sale of Moluccas" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.newworld['circumnavigation'].faction) {
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let f = his_self.game.state.newworld['circumnavigation'].faction;
	let p = his_self.returnPlayerCommandingFaction(f);

        his_self.game.queue.push('hand_to_fhand\t1\t' + p + '\t' + f + "\t1");
        his_self.game.queue.push('DEAL\t1\t' + p + '\t' + 2);
	
	return 1;
      }
    }
    deck['097'] = { 
      img : "cards/HIS-097.svg" , 
      name : "Scots Raid" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	if (his_self.areAllies("france", "scotland")) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	//
	// displace from Stirling
	//
	for (let i = 0; i < his_self.game.spaces["stirling"].units["england"].length; i++) {
	  his_self.game.spaces["london"].units["england"].push(his_self.game.spaces["stirling"].units["england"][i]);
	}
	his_self.game.spaces["stirling"].units["england"] = [];

	if (his_self.game.player === his_self.returnPlayerOfFaction("france")) {

	  //
	  // choose between 3 and 6 OPs
	  //
	  let msg = "Scots Raid: move French Army Leader to Scotland?";
          let html = '<ul>';
          html += '<li class="option" id="yes">Yes (3 OPs)</li>';
          html += '<li class="option" id="no">No (6 OPs)</li>';
          html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

     	  $('.option').off();
	  $('.option').on('click', function () {

            $('.option').off();
	    let action = $(this).attr("id");
 	    his_self.updateStatus("acknowledge");

	    if (action === "yes") {

              let msg = "Move Army Leader: ";
              let options = [];
              for (let key in his_self.game.spaces) {
                let space = his_self.game.spaces[key];
                for (let i = 0; i < space.units["france"].length; i++) {
                  let u = space.units["france"][i];
                  if (u.army_leader) {
                    options.push({ spacekey : key , idx : i , name : u.name });
                  }
                }
              }

              let html = '<ul>';
              for (let i = 0; i < options.length; i++) {
                html += `<li class="option" id="${i}">${options[i].name}</li>`;
              }
              html += `<li class="option" id="skip">skip</li>`;
              html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

              $('.option').off();
              $('.option').on('click', function () {

                $('.option').off();
                let options_idx = $(this).attr("id");
		his_self.updateStatus("acknowledge");

                his_self.addMove("SETVAR\tstate\tevents\tscots_raid\t0");
                his_self.addMove("ops\tfrance\t097\t3");
                his_self.addMove("SETVAR\tstate\tevents\tscots_raid\t1");
                his_self.addMove("move\tfrance\tland\t"+options[options_idx].spacekey+"\tstirling\t"+options[options_idx].idx);
                his_self.endTurn();

              });
	    }

	    if (action === "no") {
              his_self.addMove("SETVAR\tstate\tevents\tscots_raid\t0");
              his_self.addMove("ops\tfrance\t097\t6");
              his_self.addMove("SETVAR\tstate\tevents\tscots_raid\t1");
	      his_self.endTurn();
	    }

	  });
	}

	return 0;

      },
    }
    deck['098'] = { 
      img : "cards/HIS-098.svg" , 
      name : "Search for Cibola" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.events.cabot_england == 1) { return 1; }
	if (his_self.game.state.events.cabot_france == 1) { return 1; }
	if (his_self.game.state.events.cabot_hapsburg == 1) { return 1; }
	if (his_self.game.state.colonies.length > 0) { return 1; }
	return 0;
      },
      onEvent(his_self, faction) {

        let player = his_self.returnPlayerCommandingFaction(faction);
        if (his_self.game.player === player) { 

	  let cabot_england_found = 0;
	  let cabot_france_found = 0;
	  let cabot_hapsburg_found = 0;

	  let msg = "Cancel Which Expedition / Conquest?";
          let html = '<ul>';
	  for (let i = 0; i < his_self.game.state.explorations.length; i++) {

	    let exp = his_self.game.state.explorations[i];

            if (exp.cabot == 1) {
              if (exp.faction == "england") { cabot_england_found = 1; }
              if (exp.faction == "france") { cabot_france_found = 1; }
              if (exp.faction == "hapsburg") { cabot_hapsburg_found = 1; }
            }

	    if (his_self.game.state.explorations[i].round == his_self.game.state.round) {
              html += `<li class="option" id="${his_self.game.state.explorations[i].faction}">${his_self.returnFactionName(his_self.game.state.explorations[i].faction)} (exploration)</li>`;
	    }
	  }
	  if (his_self.game.state.events.cabot_england == 1 && cabot_england_found == 0) {
            html += `<li class="option" id="cabot_england">sebastian cabot (england - exploration)</li>`;
	  }
	  if (his_self.game.state.events.cabot_france == 1 && cabot_france_found == 0) {
            html += `<li class="option" id="cabot_france">sebastian cabot (france - exploration)</li>`;
	  }
	  if (his_self.game.state.events.cabot_hapsburg == 1 && cabot_hapsburg_found == 0) {
            html += `<li class="option" id="cabot_hapsburg">sebastian cabot (haps - exploration)</li>`;
	  }
	  for (let i = 0; i < his_self.game.state.conquests.length; i++) {
	    if (his_self.game.state.conquests[i].round == his_self.game.state.round) {
              html += `<li class="option" id="conquest-${his_self.game.state.conquests[i].faction}">${his_self.returnFactionName(his_self.game.state.conquests[i].faction)} (conquest)</li>`;
	    }
	  }
          html += '</ul>';

 	  his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

            $('.option').off();
	    let action = $(this).attr("id");

	    if (action === "conquest-england") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels English conquest");
		his_self.addMove("remove_conquest\tengland"); 
	    }
	    if (action === "conquest-france") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels French conquest");
		his_self.addMove("remove_conquest\tfrance"); 
	    }
	    if (action === "conquest-hapsburg") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels Hapsburg conquest");
		his_self.addMove("remove_conquest\thapsburg"); 
	    }
	    if (action === "cabot_england") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels Sebastian Cabot");
		his_self.addMove("SETVAR\tstate\tevents\tcabot_england\t0"); 
	    }
	    if (action === "cabot_hapsburg") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels Sebastian Cabot");
		his_self.addMove("SETVAR\tstate\tevents\tcabot_hapsburg\t0"); 
	    }
	    if (action === "cabot_france") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels Sebastian Cabot");
		his_self.addMove("SETVAR\tstate\tevents\tcabot_france\t0"); 
	    }
	    if (action === "england") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels English exploration");
		his_self.addMove("remove_exploration\tengland"); 
	    }
	    if (action === "hapsburg") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels Hapsburg exploration");
		his_self.addMove("remove_exploration\thapsburg"); 
	    }
	    if (action === "france") {  
		his_self.addMove("NOTIFY\t"+his_self.popup('098')+" cancels French exploration");
		his_self.addMove("remove_exploration\tfrance"); 
	    }

	    his_self.endTurn();

	  });
	}
        return 0;
      },
    }
    deck['099'] = { 
      img : "cards/HIS-099.svg" , 
      name : "Sebastian Cabot" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.cabot_dead == 1) { return 0; }
	if (faction == "protestant" || faction == "england" || faction == "hapsburg") { return 1; }
	return 0;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (faction == "england" && his_self.game.state.events.cabot_england == 0) { return 1; }
	if (faction == "france" && his_self.game.state.events.cabot_france == 0) { return 1; }
	if (faction == "hapsburg" && his_self.game.state.events.cabot_hapsburg == 0) { return 1; }
	return 0;
      },
      onEvent(his_self, faction) {
	if (faction == "england") { his_self.game.state.events.cabot_england = 1; }
	if (faction == "france") { his_self.game.state.events.cabot_france = 1; }
	if (faction == "hapsburg") { his_self.game.state.events.cabot_hapsburg = 1; }
	his_self.displayExploration();
        return 1;
      },
    }
    deck['100'] = { 
      img : "cards/HIS-100.svg" , 
      name : "Shipbuilding" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (faction == "protestant") { return 0; }
	return 1;
      },
      onEvent(his_self, faction) {
        his_self.game.queue.push("shipbuilding_action_phase_event\t"+faction+"\t2");
        his_self.game.queue.push("shipbuilding_action_phase_event\t"+faction+"\t1");
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
    
        if (mv[0] == "shipbuilding_action_phase_event") {
    
          his_self.game.queue.splice(qe, 1);
          let faction = mv[1];
	  let num = parseInt(mv[2]);

          let player = his_self.returnPlayerCommandingFaction(faction);

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; }

          if (his_self.game.player === player) { 

	    let msg = `Select Space to add ${num} Squadron`;
	    if (faction == "ottoman") { msg = `Select Space to add ${num} Squadron/Corsairs`; }

            his_self.playerSelectSpaceWithFilter(

              msg ,

              (space) => {
                if (his_self.isSpaceControlled(space.key, faction) && space.home === faction) {
	          if (space.ports.length > 0) {
		    if (!his_self.isSpaceUnderSiege(space.key)) {
	   	      return 1;
		    }
		  }
		}
		return 0;
	      },

              (spacekey) => {

                let space = his_self.game.spaces[spacekey];

	        if (faction === "ottoman") {
		  if (spacekey === "algiers" || space.pirate_haven == 1) {
                    his_self.addMove("build\tland\t"+faction+"\t"+"corsair"+"\t"+spacekey);
                    his_self.addMove("build\tland\t"+faction+"\t"+"corsair"+"\t"+spacekey);
		    his_self.endTurn();
		  } else {

	  	    let msg = "Produce 2 Corsairs instead of Squadron?";
          	    let html = '<ul>';
          	    html += '<li class="option" id="corsair">Corsairs</li>';
          	    html += '<li class="option" id="squadron">Squadron</li>';
          	    html += '</ul>';

 		    his_self.updateStatusWithOptions(msg, html);

          	    $('.option').off();
	  	    $('.option').on('click', function () {

          	      $('.option').off();
	  	      let unittype = $(this).attr("id");
		      if (unittype == "corsair") {
                        his_self.addMove("build\tland\t"+faction+"\t"+unittype+"\t"+spacekey);
		      }
                      his_self.addMove("build\tland\t"+faction+"\t"+unittype+"\t"+spacekey);
		      his_self.endTurn();

		    });
		  }
		} else {
                  his_self.addMove("build\tland\t"+faction+"\t"+"squadron"+"\t"+spacekey);
		  his_self.endTurn();
		}
	      },
   	      null ,
	      true
	    );
          }
	  return 0;
	}
	return 1;
      },
    }
    deck['101'] = { 
      img : "cards/HIS-101.svg" , 
      name : "Smallpox" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (
		(faction == "england" && his_self.game.state.may_conquer["england"] == 1) ||
		(faction == "france" && his_self.game.state.may_conquer["france"] == 1) ||
		(faction == "hapsburg" && his_self.game.state.may_conquer["hapsburg"] == 1) 
	) {	
		return 1; 
	}
	return 0;
      },
      onEvent(his_self, faction) {
	his_self.game.queue.push("conquer\t"+faction);
	his_self.game.state.events.smallpox = faction;
        return 1;
      },
    }
    deck['102'] = { 
      img : "cards/HIS-102.svg" , 
      name : "Spring Preparations" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      menuOption  :  function(his_self, menu, player) {
        if (menu == "pre_spring_deployment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('102')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '102', html : `<li class="option" id="102">spring preparations (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_spring_deployment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('102')) {
	      if (his_self.returnPlayerOfFaction("protestant") == his_self.game.player && his_self.game.players.length == 2) { 
 		return 0;
	      }
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_spring_deployment") {
	  if (his_self.game.player === player) {
            his_self.addMove("spring_preparations\t"+faction);
	    his_self.endTurn();
	  }
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "spring_preparations") {

          let faction = mv[1];

	  let capitals = his_self.returnCapitals(faction);
	  for (let i = 0; i < capitals.length; i++) {
	    his_self.addRegular(faction, capitals[i], 1);
	    his_self.displaySpace(capitals[i]);
	  }

          his_self.game.state.spring_deploy_across_passes.push(faction);
          his_self.game.state.spring_deploy_across_seas.push(faction);
          his_self.game.state.events.spring_preparations = faction;

	  // hide so that it will re-appear...
	  if (his_self.spring_deployment_overlay) { his_self.spring_deployment_overlay.hide(); }

          his_self.game.queue.splice(qe, 1);
          return 1;

        }

	return 1;

      },
    }
    deck['103'] = { 
      img : "cards/HIS-103.svg" , 
      name : "Threat to Power" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

	  let msg = "Target Which Minor Army Leader?";
          let html = '<ul>';
	  if (his_self.returnSpaceOfPersonage("england", "charles-brandon") != "" && his_self.game.state.leaders.henry_viii == 1) {
            html += '<li class="option" id="charles-brandon">Charles Brandon (England)</li>';
	  }
	  if (his_self.returnSpaceOfPersonage("hapsburg", "duke-of-alva") != "") {
            html += '<li class="option" id="duke-of-alva">Duke of Alva (Hapsburgs)</li>';
          }
	  if (his_self.returnSpaceOfPersonage("france", "montmorency") != "") {
            html += '<li class="option" id="montmorency">Montmorency (France)</li>';
          }
	  if (his_self.returnSpaceOfPersonage("ottoman", "ibrahim-pasha") != "") {
            html += '<li class="option" id="ibrahim-pasha">Ibrahim Pasha (Ottomans)</li>';
          }
	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

            $('.option').off();
	    let action = $(this).attr("id");

	    his_self.addMove("threat_to_power\t"+action);
	    his_self.endTurn();


	  });
	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "threat_to_power") {

          his_self.game.queue.splice(qe, 1);

	  let leader = mv[1];
	  let faction = "";
	  let leader_found = false;
	  let leader_name = "";

	  if (leader == "charles-brandon") 	{ leader = "charles-brandon"; leader_name = "Charles Brandon"; faction = "england"; }
	  if (leader == "duke-of-alva") 	{ leader = "duke-of-alva"; leader_name = "Duke of Alva"; faction = "hapsburg"; }
	  if (leader == "montmorency") 		{ leader = "montmorency"; leader_name = "Montmorency"; faction = "france"; }
	  if (leader == "ibrahim-pasha") 	{ leader = "ibrahim-pasha"; leader_name = "Ibrahim Pasha"; faction = "ottoman"; }

	  let r = his_self.rollDice(6);

	  his_self.updateLog(his_self.popup("103") + " rolls " + r);

	  let idx = -1;
	  let s = his_self.returnSpaceOfPersonage(faction, leader);
	  if (s) {
	    idx = his_self.returnIndexOfPersonageInSpace(faction, leader, s); 
	    leader_found = true;
	  }

	  //
	  // permanently removed from game
	  //
	  if (r >= 4) {

	    his_self.updateLog(leader_name + " removed from game...");
	    salert(leader_name + " removed from game...");

	    if (leader_found) {
	      his_self.game.spaces[s].units[faction].splice(idx, 1);
	      his_self.displaySpace(s);
	    }

	  //
	  // temporarily removed from game
	  //
	  } else {

	    his_self.updateLog(leader_name + " removed until next turn...");
	    salert(leader_name + " removed until next turn...");

            if (s !== "") {
              idx = his_self.returnIndexOfPersonageInSpace(faction, leader, s);
            }

            let obj = {};
            obj.space = s;
            obj.faction = faction;
	    if (his_self.game.spaces[s]) {
              obj.leader = his_self.game.spaces[s].units[faction][idx];
              if (idx != -1) {
                his_self.game.spaces[s].units[faction].splice(idx, 1);
              }
              his_self.game.state.military_leaders_removed_until_next_round.push(obj);
	    }

	    his_self.displaySpace(s);

	  }
        }

	return 1;
      }
    }
    deck['104'] = { 
      img : "cards/HIS-104.svg" , 
      name : "Trace Italienne" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	//if (his_self.game.state.events.schmalkaldic_league != 1 && faction == "protestant") { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          his_self.playerSelectSpaceWithFilter(

            "Select Space to Fortify" ,

            function(space) {
              if (space.type != "fortress" && space.type != "electorate" && space.type != "key") { return 1; }
	      return 0;
            },

            function(spacekey) {
	      his_self.updateStatus("selected...");
	      let s = his_self.game.spaces[spacekey];
	      if (s.home === "independent" && s.political === "") {
	      } else {
		let controller = s.political;
		if (controller == "") { controller = s.home; }
		if (controller == "") { controller = "independent"; }
                his_self.addMove("build\tland\t"+controller+"\t"+"regular"+"\t"+spacekey);
	      }
	      his_self.addMove(`NOTIFY\t${his_self.returnFactionName(faction)} adds fortress to ${his_self.returnName(spacekey)}`);
              his_self.addMove("fortify\t"+spacekey);
	      his_self.endTurn();
            },

	    null,

	    true

          );
        } else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("104"));;
	}

        return 0;
      },
    }
    deck['105'] = { 
      img : "cards/HIS-105.svg" , 
      name : "Treachery!" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	let spaces_under_siege = his_self.countSpacesWithFilter(
	  function(space) {
	    if (
	      space.besieged > 0
	    ) {
	      return 1;
	    }
	    return 0;
	  }
	);
	if (spaces_under_siege > 0) {
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          his_self.playerSelectSpaceWithFilter(

            "Select Space Under Siege:" ,

            function(space) {
              if (space.besieged > 0) { return 1; }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let attacker = "";

	      for (let key in space.units) {
		for (let i = 0; i < space.units[key].length; i++) {
		  let u = space.units[key][i];
		  if (u.type == "regular" || u.type == "mercenary" || u.type == "cavalry") {
		    if (space.units[key][i].besieged != 1 && space.units[key][i].besieged != true) {
		      attacker = key;
		      if (attacker == "protestant" || attacker == "papacy" || attacker == "hapsburg" || attacker == "ottoman" || attacker == "england" || attacker == "france") { break; }
		    }
		  }
		}
	      }
	      // emergency sanity check -- anyone
	      if (attacker == "") {
		for (let key in space.units) {
		  for (let z = 0; z < space.units[key].length; z++) {
		    let u = space.units[key][z];
		    if (u.type == "regular" || u.type == "cavalry" || u.type == "mercenary") { attacker = key; }
		  }
	        }
	      }	      


	      if (attacker != "") {
                his_self.addMove("remove_siege\t"+spacekey);
                his_self.addMove("treachery\t"+attacker+"\t"+spacekey);
	        his_self.addMove("assault\t"+attacker+"\t"+spacekey);
                his_self.endTurn();
	      } else {
                his_self.addMove("NOTIFY\t"+his_self.popup("105") + " cannot find attacker in siege");
                his_self.endTurn();
	      }
            }
          );

          return 0;
        }
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "treachery") {

          his_self.game.queue.splice(qe, 1);
	  
	  let attacker = mv[1];
	  let spacekey = mv[2];
	  let defender = "";

	  let defenders = [];
	  let space = his_self.game.spaces[spacekey];

	  let total_attackers = 0;
	  let total_defenders = 0;

	  for (let key in space.units) {
	    if (space.units[key].length > 0) {
	      if (space.units[key][0].besieged > 0) {
		total_defenders += his_self.returnFactionLandUnitsInSpace(key, spacekey);
		defenders.push(key);
	      }
	      if (space.units[key][0].besieged == 0) {
		total_attackers += his_self.returnFactionLandUnitsInSpace(key, spacekey);
	      }
	    }
	  }

	  if (total_defenders < total_attackers && total_attackers > 0) {
	    his_self.game.queue.push(`control\t${attacker}\t${spacekey}`);
	    his_self.updateLog(his_self.popup("105") + " - besiegers capture defenders and control space");
	    for (let i = 0; i < defenders.length; i++) {
	      his_self.game.queue.push(`purge_units_and_capture_leaders\t${defenders[i]}\t${attacker}\t${spacekey}`);
	    }
	  }

	}

        return 1;
      },
    }
    deck['106'] = { 
      img : "cards/HIS-106.svg" , 
      name : "Unpaid Mercenaries" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	let spaces_with_mercenaries = his_self.countSpacesWithFilter(
	  function(space) {
	    for (let key in space.units) {
	      for (let i = 0; i < space.units[key].length; i++) {
		if (space.units[key][i].type == "mercenary") { return 1; }
	      }
	    }
	    return 0;
	  }
	);
	if (spaces_with_mercenaries > 0) { 
	  return 1;
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let sswf_function = () => {

          his_self.playerSelectSpaceWithFilter(
	
            "Select Space With Unpaid Mercenaries" ,

            function(space) {
	      for (let key in space.units) {
	        for (let i = 0; i < space.units[key].length; i++) {
	  	  if (space.units[key][i].type == "mercenary") { return 1; }
	        }
	      }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let factions = [];

	      for (let key in space.units) {
		for (let i = 0; i < space.units[key].length; i++) {
		  if (space.units[key][i].type == "mercenary") {
		    if (!factions.includes(key)) {
		      factions.push(key);
		    }
		  }
		}
	      }

	      if (factions.length > 0) {

 	        let msg = "Choose Faction to Lose Mercenaries:";
                let html = '<ul>';
	        for (let i = 0; i < factions.length; i++) {
                  html += `<li class="option" id="${factions[i]}">${factions[i]}</li>`;
		}
                html += `<li class="option" id="switch">change target</li>`;
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

 		$('.option').off();
	  	$('.option').on('click', function () {

 		  $('.option').off();
	    	  let action = $(this).attr("id");

		  // we can switch if we want now
		  if (action == "switch") { sswf_function(); return; }

                  his_self.addMove("maybe_evacuate_or_capture_leaders\t"+action+"\t"+spacekey);
		  his_self.addMove(`unbesiege_if_empty\t${spacekey}\t${action}`);
		  for (let z = 0; z < his_self.game.spaces[spacekey].units[action].length; z++) {
		    if (his_self.game.spaces[spacekey].units[action][z].type === "mercenary") {
		      his_self.addMove(`destroy_unit_by_index\t${action}\t${spacekey}\t${z}`);
		    }
		  }
		  his_self.addMove(`NOTIFY\t${his_self.popup("106")} destroys all mercenaries in ${his_self.returnSpaceName(spacekey)}`);
		  his_self.endTurn();
		});

	      } else {
                his_self.addMove("maybe_evacuate_or_capture_leaders\t"+factions[0]+"\t"+spacekey);
		his_self.addMove(`unbesiege_if_empty\t${spacekey}\t${factions[0]}`);
		for (let z = 0; z < his_self.game.spaces[spacekey].units[factions[0]].length; z++) {
		  if (his_self.game.spaces[spacekey].units[factions[0]][z].type === "mercenary") {
		    his_self.addMove(`destroy_unit_by_index\t${factions[0]}\t${spacekey}\t${z}`);
		  }
		}
		his_self.endTurn();
	      }
            },

	    null,

	    true
          );
	} // sswf_function
	sswf_function();

        }

        return 0;
      },
    }
    deck['107'] = { 
      img : "cards/HIS-107.svg" , 
      name : "Unsanitary Camp" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

	  let sswf_function = () => {

          his_self.playerSelectSpaceWithFilter(

            "Select Space With Land Units" ,

            function(space) {
	      for (let key in space.units) {
	        if (his_self.returnFactionLandUnitsInSpace(key, space.key) > 0) { return 1; }
	      }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let factions = [];

	      for (let key in space.units) {
	        if (his_self.returnFactionLandUnitsInSpace(key, space.key) > 0) { factions.push(key); }
	      }

	      if (factions.length > 0) {

 	        let msg = "Choose Faction to Suffer Losses:";
                let html = '<ul>';
		let op = 0;
	        for (let i = 0; i < factions.length; i++) {
		  op++;
                  html += `<li class="option" id="${factions[i]}">${factions[i]}</li>`;
		}
                html += `<li class="option" id="switch">change target</li>`;
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

 		$('.option').off();
	  	$('.option').on('click', function () {

 		  $('.option').off();
	    	  let action = $(this).attr("id");

		  if (action == "switch") {
		    sswf_function(); return;
		  }

		  if (his_self.game.player == his_self.returnPlayerCommandingFaction(action)) {
                    let c = confirm("Unorthodox! Are you sure you want to sicken your own men?");
                    if (!c) { sswf_function(); return; }
            	  }

		  let total_units = 0;
		  let regular_units = 0;
		  let total_to_delete = 0;
		  let regulars_to_delete = 0;
		  let nonregulars_to_delete = 0;

		  for (let f in his_self.game.spaces[spacekey].units) {
		    if (his_self.returnControllingPower(f) == his_self.returnControllingPower(action)) {
		      for (let z = his_self.game.spaces[spacekey].units[f].length-1; z >= 0; z--) {
		        let u = his_self.game.spaces[spacekey].units[f][z];
		        if (u.type == "regular") { regular_units++; }
		        if (u.type == "cavalry" || u.type == "regular" || u.type == "mercenary") { total_units++; }
		      }
		    }
		  }

		  total_to_delete = Math.ceil(total_units/3);
		  regulars_to_delete = Math.ceil(total_to_delete/2);
		  nonregulars_to_delete = total_to_delete - regulars_to_delete;
		
	          his_self.addMove("check_for_stranded_leaders\t"+faction);

		  for (let f in his_self.game.spaces[spacekey].units) {
		    if (his_self.returnControllingPower(f) == his_self.returnControllingPower(action)) {
		      for (let z = his_self.game.spaces[spacekey].units[f].length-1; z >= 0; z--) {
		        let u = his_self.game.spaces[spacekey].units[f][z];
		        if (u.type == "regular" && regulars_to_delete > 0) {
		          his_self.addMove(`destroy_unit_by_type\t${f}\t${spacekey}\t${u.type}`);
		          regulars_to_delete--;
		        }
		        if (u.army_leader != true && u.navy_leader != true && u.type != "regular" && (u.type == "mercenary" || u.type == "cavalry") && nonregulars_to_delete > 0) {
		          his_self.addMove(`destroy_unit_by_type\t${f}\t${spacekey}\t${u.type}`);
		          nonregulars_to_delete--;
		        }
		      }
		    }
		  }

		  if (total_to_delete > 1) {
		    his_self.addMove(`SALERT\tUnsanitary Camp destroys ${total_to_delete} ${his_self.returnFactionName(action)} units in ${his_self.returnSpaceName(spacekey)}`); 
		  } else {
		    his_self.addMove(`SALERT\tUnsanitary Camp destroys ${total_to_delete} ${his_self.returnFactionName(action)} units in ${his_self.returnSpaceName(spacekey)}`); 
		  }
		  his_self.addMove(`NOTIFY\t${his_self.popup("107")} strikes ${his_self.returnSpaceName(spacekey)}`); 
		  his_self.endTurn();
		});

	        // auto-submit if only 1 choice
                if (op == 1) { $('.option').click(); }

	      } else {

		let action = factions[0];
		let total_units = 0;
		let regular_units = 0;
		let total_to_delete = 0;
		let regulars_to_delete = 0;
		let nonregulars_to_delete = 0;

		for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		  let u = his_self.game.spaces[spacekey].units[action][z];
		  if (u.type == "regular") { regular_units++; }
		  if (u.type == "cavalry" || u.type == "regular" || u.type == "mercenary") { total_units++; }
		}

		total_to_delete = Math.ceil(total_units/3);
		regulars_to_delete = Math.ceil(total_to_delete/2);
		nonregulars_to_delete = total_to_delete - regulars_to_delete;
		
		for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		  let u = his_self.game.spaces[spacekey].units[action][z];
		  if (u.army_leader != true) {
		    if (u.type == "regular" && regulars_to_delete > 0) {
		      his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		    }
		    if ((u.type != "regular" && (u.type == "mercenary" || u.type == "cavalry")) && nonregulars_to_delete > 0) {
		      his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		      nonregulars_to_delete--;
		    }
		  }
		}
		his_self.endTurn();
	      }
            },

	    null,

	    true
          );

	  } // sswf
	  sswf_function();

        } else {
	  his_self.updateLog(his_self.returnFactionName(faction) + " playing " + his_self.popup("107"));
	}
        return 0;
      },
    }
    deck['108'] = { 
      img : "cards/HIS-108.svg" , 
      name : "Venetian Alliance" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { 
	if (faction == "papacy") { return 1; }
	if (faction == "ottoman") { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let ally = his_self.returnAllyOfMinorPower("venice");

	if ((ally === "" || ally === "venice") && faction === "papacy") {
	  his_self.activateMinorPower("papacy", "venice");
	} else {
	  if (faction === "papacy" || faction === "ottoman") {
	    his_self.deactivateMinorPower(ally, "venice");
	  }
	}
	his_self.displayWarBox();

	return 1;

      },
    }
    deck['109'] = { 
      img : "cards/HIS-109.svg" , 
      name : "Venetian Informant" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 0; },
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_spring_deployment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('109')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '109', html : `<li class="option" id="109">venetian informant (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_spring_deployment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('109')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_spring_deployment") {
	  if (his_self.game.player === player) {
            his_self.addMove("discard\t"+faction+"\t109");
            his_self.addMove("venetian_informant\t"+faction);
            his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" plays " + his_self.popup("109"));
	    his_self.endTurn();
	  }
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] === "show_hand") {
        
          let faction_taking = mv[1];
          let faction_giving = mv[2];
          
          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);
          
          if (his_self.game.player == p2) {
            let fhand_idx = his_self.returnFactionHandIdx(p2, faction_giving);
            his_self.addMove("share_hand\t"+faction_taking+"\t"+faction_giving+"\t"+JSON.stringify(his_self.game.deck[0].fhand[fhand_idx]));
            his_self.endTurn();
          }

          his_self.game.queue.splice(qe, 1);
          return 0;

        }

        if (mv[0] === "share_hand") {
        
          let faction_taking = mv[1];
          let faction_giving = mv[2];
          let cards = JSON.parse(mv[3]);

          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);
          
          if (his_self.game.player == p1) {
	    for (let i = 0; i < cards.length; i++) {
	      his_self.updateLog(his_self.returnFactionName(faction_giving) + ": " + his_self.popup(cards[i]));
	    }
	    his_self.deck_overlay.render("Venetian Informant", cards);
          }

          his_self.game.queue.splice(qe, 1);
          return 1;

        }


        if (mv[0] == "venetian_informant") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (player == his_self.game.player) {

	    if (his_self.game.players.length == 2) {

	      if (faction === "protestant") {
	        his_self.addMove("show_hand\tprotestant\tpapacy");
	        his_self.endTurn();
	      } else {
	        his_self.addMove("show_hand\tpapacy\tprotestant");
	        his_self.endTurn();
	      }

	      return 0;

	    } else {

	      let powers = his_self.returnImpulseOrder();
	      let msg = "View which Faction Cards?";

              let html = '<ul>';
	      for (let i = 0; i < powers.length; i++) {
	        if (powers[i] != faction && his_self.returnPlayerCommandingFaction(powers[i]) > 0) {
                  html += `<li class="option" id="${powers[i]}">${his_self.returnFactionName(powers[i])}</li>`;
	        }
	      }
              html += '</ul>';

    	      his_self.updateStatusWithOptions(msg, html);

	      $('.option').off();
	      $('.option').on('click', function () {
	        $('.option').off();
	        let action = $(this).attr("id");
	        his_self.addMove("show_hand\t"+faction+"\t"+action);
	        his_self.endTurn();
	      });

	    }

	  }

	  return 0;

        }

	return 1;

      },
    }
    deck['110'] = { 
      img : "cards/HIS-110.svg" , 
      name : "War in Persia" ,
      warn : ["ottoman"] ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent(his_self, faction) {
        if (his_self.game.state.events.war_in_persia == 1) { return 0; }
        return 1;
      },
      onEvent(his_self, faction) {

	his_self.displayPersia();

        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);

        his_self.game.state.events.war_in_persia = 1;

        his_self.game.queue.push("check_for_broken_sieges");
        his_self.game.queue.push("war_in_persia_leader_removal\tottoman");
        his_self.game.queue.push("war_in_persia_troop_removal\tottoman\t5");
        his_self.game.queue.push("war_in_persia_troop_removal\tottoman\t4");
        his_self.game.queue.push("war_in_persia_troop_removal\tottoman\t3");
        his_self.game.queue.push("war_in_persia_troop_removal\tottoman\t2");
        his_self.game.queue.push("war_in_persia_troop_removal\tottoman\t1");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "war_in_persia_leader_removal") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  if (his_self.game.player == his_self.returnPlayerCommandingFaction(faction)) {

   	    let msg = "Move Army Leader: ";
	    let options = [];
	    for (let key in his_self.game.spaces) {
	      if (key != "persia" && key != "egypt" && key != "ireland") {
	        let space = his_self.game.spaces[key];
                for (let i = 0; i < space.units["ottoman"].length; i++) {
                  let u = space.units["ottoman"][i];
	          if (u.army_leader) {
	            options.push({ spacekey : key , idx : i , name : u.name });
	          }
	        }
	      }
	    }

            let html = '<ul>';
	    for (let i = 0; i < options.length; i++) {
  	      html += `<li class="option" id="${i}">${options[i].name}</li>`;
	    }
  	    html += `<li class="option" id="skip">skip</li>`;
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

   	    $('.option').off();
	    $('.option').on('click', function () {

   	      $('.option').off();
	      let options_idx = $(this).attr("id");

	      if (options_idx === "skip") {
                his_self.endTurn();
	        return 0;
	      }

              his_self.addMove("move\tottoman\tland\t"+options[options_idx].spacekey+"\tpersia\t"+options[options_idx].idx);
              his_self.endTurn();

	    });
	  } else {
	    his_self.updateStatus("Ottomans selecting Foreign War Leader...");
	  }

	  return 0;

        }

	//
	// this copies the logic from Plague
	//
        if (mv[0] == "war_in_persia_troop_removal") {

	  let faction = mv[1];
	  let num = parseInt(mv[2]);
	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player != player) { return 0; }

	  if (num == 1) { num = "1st"; }
	  if (num == 2) { num = "2nd"; }
	  if (num == 3) { num = "3rd"; }
	  if (num == 3) { num = "4th"; }
	  if (num == 3) { num = "5th"; }

          his_self.playerSelectSpaceOrNavalSpaceWithFilter(

            `Select Space to Remove ${num} Unit` ,

            function(space) {
	      if (space.key == "persia" || space.key == "egypt" || space.key == "ireland") { return 0; }
	      if (space.units["ottoman"].length > 0) {
		  for (let z = 0; z < space.units["ottoman"].length; z++) {
		    let u = space.units["ottoman"][z];
		    if (u.type === "regular") { return 1; }
		    if (u.type === "mercenary") { return 1; }
		    if (u.type === "cavalry") { return 1; }
		  }
	      }
	      return 0;
            },

            function(spacekey) {

	      let land_or_sea = "land";
	      let space = null;

	      if (his_self.game.navalspaces[spacekey]) {
		land_or_sea = "sea";
		space = his_self.game.navalspaces[spacekey];
	      } else {
		space = his_self.game.spaces[spacekey];
	      }
	   
	      if (space == null) {
		alert("ERROR: not sure where you clicked - reload to continue");
		return 1;
	      }
	      
   	      let msg = "Remove Which Unit: ";
              let unittypes = ["squadron","corsair"]; // avoids listing these units
	      let unit_destroyed = 0;
              let html = '<ul>';
	      let du = -1;
              for (let i = 0; i < space.units["ottoman"].length; i++) {
                if (space.units["ottoman"][i].command_value == 0) {
		  if (!unittypes.includes(space.units["ottoman"][i].type) && space.units["ottoman"][i].army_leader != true && space.units["ottoman"][i].personage != true) {
		    if (du == -1) { du = i; } else { du = -2; }
  		    html += `<li class="option nonskip" id="${space.units["ottoman"][i].type}">${space.units["ottoman"][i].type}</li>`;
		    unittypes.push(space.units["ottoman"][i].type);
		  }
		}
	      }

  	      html += `<li class="option" id="skip">skip</li>`;
    	      html += '</ul>';

              his_self.updateStatusWithOptions(msg, html);

   	      $('.option').off();
	      $('.option').on('click', function () {

   	        $('.option').off();
	        let unittype = $(this).attr("id");
		if (unit_destroyed == 1) { return; }	
		unit_destroyed = 1;

		if (unittype === "skip") {
//          	  his_self.endTurn();
//		  return 0;
		}

          	his_self.removeUnit("ottoman", spacekey, unittype);

		his_self.displaySpace(spacekey);

		if (num === "5th") { 
		  return 0;
		}

          	his_self.addMove("remove_unit\t"+land_or_sea+"\t"+"ottoman"+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
          	his_self.addMove("build\tland\tottoman\t"+unittype+"\tpersia");
          	his_self.endTurn();
	      });

	      // auto-submit if only 1 choice
	      if (du > -1) { $('.nonskip').click(); }

            },

            null, 

	    true

	  );

          return 0;

	}

        return 1;
      }
    }
    deck['111'] = { 
      img : "cards/HIS-111.svg" , 
      name : "Colonial Governor/Native Uprising" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerCommandingFaction(faction);

	if (his_self.game.player == p) {

          let html = '<ul>';
              html += `<li class="option" id="governor">Colonial Governor</li>`;
              html += `<li class="option" id="uprising">Native Uprising</li>`;
              html += '</ul>';

          his_self.updateStatusWithOptions("Select Colony-Roll Modifier:", html);

 	  $('.option').off();
	  $('.option').on('click', function () {

	    his_self.updateStatus("selecting...");
 	    $('.option').off();
	    let modifier = $(this).attr("id");

	    if (modifier == "governor") {

              let html = '<ul>';
                  html += `<li class="option" id="hapsburg">Hapsburg Governor</li>`;
                  html += `<li class="option" id="england">English Governor</li>`;
                  html += `<li class="option" id="france">French Governor</li>`;
                  html += '</ul>';
              his_self.updateStatusWithOptions("Select Colonial Governor", html);

 	      $('.option').off();
	      $('.option').on('click', function () {
	        his_self.updateStatus("selecting...");
 	        $('.option').off();
	        let action = $(this).attr("id");
	        his_self.addMove("display_new_world");
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" selected " + his_self.returnFactionName(action) + " governor");
	        his_self.addMove("SETVAR\tstate\tevents\tcolonial_governor\t"+action);
	        his_self.addMove("SETVAR\tstate\tevents\tnative_uprising\t0");
	        his_self.endTurn();	    
	      });

	    } else {

              let html = '<ul>';
                  html += `<li class="option" id="hapsburg">Destablize Hapsburg Colonies</li>`;
                  html += `<li class="option" id="england">Destabilize English Colonies</li>`;
                  html += `<li class="option" id="france">Destabilize French Colonies</li>`;
                  html += '</ul>';
              his_self.updateStatusWithOptions("Select Target for Native Uprising:", html);

 	      $('.option').off();
	      $('.option').on('click', function () {
	        his_self.updateStatus("selecting...");
 	        $('.option').off();
	        let action = $(this).attr("id");
	        his_self.addMove("display_new_world");
	        his_self.addMove("NOTIFY\t"+his_self.returnFactionName(faction)+" targets " + his_self.returnFactionName(action) + " colonies");
	        his_self.addMove("SETVAR\tstate\tevents\tcolonial_governor\t0");
	        his_self.addMove("SETVAR\tstate\tevents\tnative_uprising\t"+action);
	        his_self.endTurn();	    
	      });
	    }
	  });
        } else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing Colonial Governor");
	}

	return 0;

      },
    }
    deck['112'] = { 
      img : "cards/HIS-112.svg" , 
      name : "Thomas More" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	if (faction === "protestant" || faction === "england") {

	  let p = his_self.returnPlayerCommandingFaction("england");

          his_self.game.state.events.more_executed_limits_debates = 1;
	  his_self.game.state.events.more_executed = 1;

	  if (p > 0) {
            his_self.game.queue.push('remove\t'+faction+'\t112');
            his_self.game.queue.push('select_and_discard\t' + faction);
            his_self.game.queue.push('hand_to_fhand\t1\t' + p + '\t' + faction + "\t1");
            his_self.game.queue.push('DEAL\t1\t' + p + '\t' + 2);
	  }
          his_self.game.queue.push("NOTIFY\tThomas More prevents debates in England this turn");

	} else {

	  his_self.game.state.events.more_bonus = 1;
	  if (his_self.game.state.events.henry_viii_marital_status >= 2) {
            his_self.game.queue.push('remove\t'+faction+'\t112');
	  }

	  //
	  // pope gets to call a debate and gets +1 bonus dice in England 
	  // or +3 bonus dice in England.
	  //
	  if (his_self.returnPlayerCommandingFaction("papacy") == his_self.game.player) {

            let msg = "Convene Theological Debate?";
            let html = '<ul>';
            html += `<li class="option" id="yes">yes</li>`;
            html += `<li class="option" id="no">no</li>`;
            html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let action2 = $(this).attr("id");
              his_self.updateStatus("submitting...");

              if (action2 === "yes") {
                his_self.playerCallTheologicalDebate(his_self, his_self.game.player, "papacy");
                return 0;
              }

              // no
              his_self.updateLog("Papacy refrains from holding debate");
              his_self.endTurn();

            });

	  }

	  return 0;

	}

	return 1;
      },

    }
    deck['113'] = { 
      img : "cards/HIS-113.svg" , 
      name : "Imperial Coronation" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) {
	let s = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	if (s) { if (s.language == "italian") { return 1; } }
	return 0;
      },
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let s = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	if (s) {
	  try { if (his_self.game.spaces[s]) { s = his_self.game.spaces[s]; } } catch (err) {}
	  if (s.language == "italian") {

    	    let hp = his_self.returnPlayerOfFaction("hapsburg");
  	    let pf = his_self.returnPlayerOfFaction(faction);

	    if (faction !== "hapsburg") {
	      if (his_self.game.players.length != 2) {
	        his_self.game.queue.push("hand_to_fhand\t1\t"+hp+"\t"+"hapsburg"+"\t1");
                his_self.game.queue.push(`DEAL\t1\t${hp}\t1`);
	      } else {
	        his_self.game.queue.push("hand_to_fhand\t1\t"+pf+"\t"+faction+"\t1");
                his_self.game.queue.push(`DEAL\t1\t${pf}\t1`);
	      }
	    } else {
	      his_self.game.queue.push("hand_to_fhand\t1\t"+pf+"\t"+"hapsburg"+"\t1");
              his_self.game.queue.push(`DEAL\t1\t${pf}\t1`);
              his_self.game.queue.push(`DEAL\t1\t${pf}\t1`);
	    }
	  }
	}

	return 1;
      },
    }
    deck['114'] = { 
      img : "cards/HIS-114.svg" , 
      name : "La Forets's Embassy in Istanbul" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { if (his_self.areAllies("ottoman", "france")) { return 1; } return 0; } ,
      canEvent : function(his_self, faction) { if (his_self.areAllies("ottoman", "france")) { return 1; }; return 0; },
      onEvent : function(his_self, faction) {

	if (his_self.areAllies("ottoman", "france")) {

  	  let fp = his_self.returnPlayerOfFaction("france");
  	  let op = his_self.returnPlayerOfFaction("ottoman");

	  his_self.game.queue.push("hand_to_fhand\t1\t"+op+"\t"+"ottoman" + "\t1");
          his_self.game.queue.push(`DEAL\t1\t${op}\t1`);
	  his_self.game.queue.push("hand_to_fhand\t1\t"+fp+"\t"+"france" + "\t1");
          his_self.game.queue.push(`DEAL\t1\t${fp}\t1`);
	
	}

	return 1;
      },
    }
    deck['115'] = { 
      img : "cards/HIS-115.svg" , 
      name : "Thomas Cromwell" ,
      ops : 3 ,
      turn : 4 ,
      type : "response" ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerCommandingFaction(faction);

	if (his_self.game.player == p) {

   	let msg = "Which Action?";
        let html = '<ul>';
        if (his_self.game.deck[0].discards["063"]) {
          html += '<li class="option showcard" id="063">retrieve Dissolution of the Monasteries</li>';
        }
        html += '<li class="option" id="treatise">publish treatise in England</li>';
    	html += '</ul>';

        his_self.updateStatusWithOptions(msg, html);

	$('.option').off();
	$('.option').on('click', function () {

	  $('.option').off();
	  let action = $(this).attr("id");
	  his_self.updateStatus("processing");

	  if (action === "063") {
	    his_self.addMove("thomas_cromwell_retrieves_monasteries");
	    his_self.endTurn();
	  }

	  if (action === "treatise") {
	    his_self.addMove("SETVAR\tstate\tevents\tcromwell\t1");
	    his_self.addMove("player_publish_treatise\tengland");
	    his_self.endTurn();
	  }

	  return 0;
	});

	} else {
	  his_self.updateStatus(his_self.returnFactionName(faction) + " playing " + his_self.popup("115") );
	}
	return 0;
      },
      removeFromDeckAfterPlay : function(his_self, player) {
	if (his_self.game.state.henry_viii_rolls.includes(1)) { return 1; }
	if (his_self.game.state.henry_viii_rolls.includes(2)) { return 1; }
	if (his_self.game.state.henry_viii_rolls.includes(3)) { return 1; }
	return 0;
      },
      menuOption  :       function(his_self, menu, player) {
        if (menu == "papal_bull_cranmer_excommunication") {
	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('115')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '115', html : `<li class="option blink" id="115">thomas cromwell (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "papal_bull_cranmer_excommunication") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('115')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "papal_bull_cranmer_excommunication") {
	  his_self.addMove(`thomas_cromwell_cancels_bull`);
  	  his_self.addMove("discard\t"+faction+"\t"+"115");
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

	if (mv[0] === "thomas_cromwell_retrieves_monasteries") {
          if (his_self.game.deck[0].discards["063"]) {
	    his_self.game.deck[0].cards["063"] = his_self.game.deck[0].discards["063"];
	    delete his_self.game.deck[0].discards["063"];
	    if (his_self.game.player == his_self.returnPlayerCommandingFaction("england")) {
              let fhand_idx = his_self.returnFactionHandIdx(his_self.game.player, "england");
	      his_self.game.deck[0].fhand[fhand_idx].push("063");
	    }
	  }
	  his_self.game.queue.splice(qe, 1);
	  return 1;
	}

        if (mv[0] === "thomas_cromwell_cancels_bull") {
	  his_self.updateLog("Thomas Cromwell cancels Cranmer Excommunication");
          his_self.game.queue.splice(qe, 1);
	  // cancel the excommunication and fall through
	  for (let z = his_self.game.queue.length-1; z >= 1; z--) {
	    let lmv = his_self.game.queue[z].split("\t");
	    if (lmv[0] != "continue" && lmv[0] != "cards_left" && lmv[0] != "play" && lmv[0] != "discard") {
              his_self.game.queue.splice(z, 1);
	    }
	  } 
	  return 1;
	}

	return 1;
      },
    }
    deck['116'] = { 
      img : "cards/HIS-116.svg" , 
      name : "Rough Wooing" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.henry_viii_healthy_edward == 1 || his_self.game.state.henry_viii_sickly_edward == 1) {
	  if (his_self.areAllies("france", "scotland")) {
	    return 1;
	  }
	}
	return 0;
      },
      onEvent : function(his_self, faction) {

	let england_roll = his_self.rollDice(6);
	let france_roll = his_self.rollDice(6);
	let spaces = ["stirling","glasgow","edinburgh"];

	let english_units = 0;
	let french_units = 0;

	for (let i = 0; i < spaces.length; i++) {
	  for (let z = 0; z < his_self.game.spaces[spaces[i]].units["england"].length; z++) {
	    let u = his_self.game.spaces[spaces[i]].units["england"][z];
	    if (u.type == "squadron" || u.type == "mercenary" || u.type == "regular") { english_units++; }
	  }
	  for (let z = 0; z < his_self.game.spaces[spaces[i]].units["france"].length; z++) {
	    let u = his_self.game.spaces[spaces[i]].units["france"][z];
	    if (u.type == "squadron" || u.type == "mercenary" || u.type == "regular") { french_units++; }
	  }
	  for (let z = 0; z < his_self.game.spaces[spaces[i]].units["scotland"].length; z++) {
	    let u = his_self.game.spaces[spaces[i]].units["scotland"][z];
	    if (u.type == "squadron" || u.type == "mercenary" || u.type == "regular") { french_units++; }
	  }
	}
	
	his_self.updateLog("French roll: " + france_roll + " (+2)");
	his_self.updateLog("English roll: " + england_roll);

	if ((2+french_units) <= english_units) {
	  his_self.unsetAllies("france","scotland");
	  his_self.setAllies("england","scotland");
	  for (let i = 0; i < spaces.length; i++) {
	    for (let z = 0; z < his_self.game.spaces[spaces[i]].units["france"].length; z++) {
	      if (his_self.game.spaces[spaces[i]].units["france"][z].type == "squadron") {
	        his_self.game.spaces["paris"].units["rouen"].push(his_self.game.spaces[spaces[i]].units["france"][z]);
	      } else {
	        his_self.game.spaces["paris"].units["france"].push(his_self.game.spaces[spaces[i]].units["france"][z]);
	      }
	    }
	    his_self.game.spaces[spaces[i]].units["france"] = [];
	  }
	  his_self.updateLog("Scotland becomes an English ally...");
	}

	return 1;

      },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; }
    }


    //
    // cards removed from 2P game
    //
if (this.game.players.length == 2) {
    delete deck["001"];
    delete deck["002"];
    delete deck["003"];
    delete deck["004"];
    delete deck["009"];
    delete deck["018"];
    delete deck["030"];
    delete deck["034"];
    delete deck["040"];
    delete deck["042"];
    delete deck["048"];
    delete deck["049"];
    delete deck["050"];
    delete deck["053"];
    delete deck["054"];
    delete deck["058"];
    delete deck["059"];
    delete deck["066"];
    delete deck["068"];
    delete deck["069"];
    delete deck["072"];
    delete deck["073"];
    delete deck["074"];
    delete deck["077"];
    delete deck["080"];
    delete deck["082"];
    delete deck["083"];
    delete deck["084"];
    delete deck["086"];
    delete deck["087"];
    delete deck["089"];
    delete deck["092"];
    delete deck["093"];
    delete deck["094"];
    delete deck["096"];
    delete deck["097"];
    delete deck["098"];
    delete deck["099"];
    delete deck["100"];
    delete deck["101"];
    delete deck["103"];
    delete deck["108"];
    delete deck["110"];
    delete deck["111"];
    delete deck["112"];
    delete deck["113"];
    delete deck["114"];
    delete deck["115"];
    delete deck["116"];

}
if (this.game.options.scenario === "1532" && include_removed == false) {

    delete deck["008"];
    delete deck["009"];
    delete deck["010"];
    delete deck["011"];
    // deleted on creation
    delete deck["013"];
    delete deck["038"];
    delete deck["039"];
    delete deck["041"];
    delete deck["043"];
    delete deck["078"];
    delete deck["083"];
    delete deck["085"];
    delete deck["088"];
    delete deck["095"];
    delete deck["096"];
    delete deck["112"];
    delete deck["113"];
}
if (this.game.state) {
  if (this.game.state.removed && include_removed == false) {
    for (let z = 0; z < this.game.state.removed.length; z++) {
console.log("DELETING Z: " + z);
      try { delete deck[this.game.state.removed[z]]; } catch (err) {}
    }
  }
}


    for (let key in deck) {
      deck[key].key = key;
      deck[key] = this.addEvents(deck[key]);
      if (!deck[key].warn) { deck[key].warn = []; }
    }

    return deck;

  }


