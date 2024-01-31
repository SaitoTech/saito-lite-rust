
  popup(card) {

    let c = null;
    if (!c && this.game.deck[0]) { c = this.game.deck[0].cards[card]; }
    if (!c && this.game.deck[1]) { c = this.game.deck[1].cards[card]; }
    if (!c && this.debaters) { 
      c = this.debaters[card];
      if (c) { return `<span class="showcard ${card}" id="${card}">${c.name}</span>`; }
    }
    if (!c) {
      // catches Here I Stand -- first event before DEAL
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

  returnNewCardsForThisTurn(turn = 1) {

    let deck = this.returnDeck();
    let new_deck = {};

    for (let key in deck) {
      if (key != "001" && key != "002" && key != "003" && key != "004" && key != "005" && key != "006" && key != "007" && key != "008") {
        if (deck[key].turn === turn) {
	  new_deck[key] = deck[key];
        }
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
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
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
if (space.key === "bordeaux") {
  console.log("bordeaux");
  console.log(space.ports.length + " -- " + space.home);
  console.log(JSON.stringify(space));
}
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
	    his_self.addMove("corsair_raid\t"+opponent_faction+"\t"+(i+1));
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

	  if (num == 1) { num == "1st"; }
	  if (num == 2) { num == "2nd"; }
	  if (num == 3) { num == "3rd"; }
	  if (num == 4) { num == "4th"; }

	  let player = his_self.returnPlayerOfFaction(faction);

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player == player) {

 	    let msg = "Corsair Raid: "+num+" hit:";
            let html = '<ul>';
            html += '<li class="option" id="discard">discard card</li>';
            html += '<li class="option" id="eliminate">eliminate squadron</li>';
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
            html += `<li class="option" id="${ca[i]}">activate ${ca[i]}</li>`;
	  }
	  for (let i = 0; i < cd.length; i++) {
            html += `<li class="option" id="${cd[i]}">deactivate ${cd[i]}</li>`;
	  }
          html += `<li class="option" id="skip">skip</li>`;
          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");


	    if (action === "skip") { his_self.endTurn(); return 0; }

	    if (ca.includes(action)) {

	      let finished = 0;

	      if (faction === "protestant" && action === "genoa") {
		his_self.addMove("activate_minor_power\thapsburg\tgenoa");
		finished = 1;
	      }
	      if (faction === "protestant" && action === "venice") {
		his_self.addMove("activate_minor_power\thapsburg\tvenice");
		finished = 1;
	      }
	      if (finished == 0) {
	        his_self.addMove("activate_minor_power\t"+faction+"\t"+action);
	      }

	    } else {

	      his_self.addMove("deactivate_minor_power\t"+his_self.returnAllyOfMinorPower(action)+"\t"+action);
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
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
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
	      his_self.addMove("player_call_theological_debate\tpapacy");
	      his_self.addMove("henry_petitions_for_divorce_grant");
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+faction);
              his_self.addMove(`DEAL\t1\t${p}\t1`);
	      his_self.endTurn();
	    }

	    if (action === "refuse") {
	      his_self.updateStatus("Papacy refuses divorce...");
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
                his_self.addMove("build\tland\tpapacy\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\tpapacy\t"+"mercenary"+"\t"+spacekey);
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
	his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
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
		if (space.units[key].length > 0) {
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
		    if (!unittypes.includes(space.units[faction_to_destroy][i].type)) {
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

		  console.log("!!!");
		  console.log("!!! plague unit removal");
		  console.log("!!!");
          	  console.log("remove_unit\t"+land_or_sea+"\t"+faction_to_destroy+"\t"+unittype+"\t"+spacekey+"\t"+his_self.game.player);
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

                "Select Space to add 2 Squadrons" ,

                  (space) => {
                    if (his_self.isSpaceControlled(space.key, "papacy")) {
		      if (space.ports.length > 0) {
			return 1;
		      }
		    }
		    return 0;
		  },

                  (spacekey) => {
                    let space = his_self.game.spaces[spacekey];
                    his_self.addMove("build\tland\tpapacy\t"+"squadron"+"\t"+spacekey);
                    his_self.addMove("build\tland\tpapacy\t"+"squadron"+"\t"+spacekey);
		    his_self.endTurn();
		  },

		  null ,

		  true
    
	      );

            }       
    
            if (faction === "protestant") {
                        
              let msg = "Add 2 Naval Squadrons Where?";
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
		  his_self.addMove("Protestants do not build any squadrons");
		  his_self.endTurn();
		}

		if (action === "hapsburg") {
                  his_self.addMove("build\tland\thapsburg\t"+"squadron"+"\tnaples");
                  his_self.addMove("build\tland\thapsburg\t"+"squadron"+"\tnaples");
		  his_self.endTurn();
		}

		if (action === "french") {
                  his_self.addMove("build\tland\tfrance\t"+"squadron"+"\tmarseille");
                  his_self.addMove("build\tland\tfrance\t"+"squadron"+"\tmarseille");
		  his_self.endTurn();
		}

		if (action === "ottoman") {
                  //
                  // pick any Ottoman home port
                  //
                  his_self.playerSelectSpaceWithFilter(

                    "Select Ottoman-Controlled Home Port to add 2 Squadrons" ,

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
                      his_self.addMove("build\tland\tottoman\t"+"squadron"+"\t"+spacekey);
		      his_self.endTurn();
		    },

		    null ,

		    true
    
	          );

		}

              });

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
                  his_self.addMove("moveunit" + "\t" + "hapsburg" + "\t" + "land" + "\t" + ak + "\t" + ak_idx + "\t" + "land" + "\t" + spacekey);
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
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	let ally = his_self.returnAllyOfMinorPower("venice");

	if (ally === "" || ally === "venice") {
	  his_self.activateMinorPower("papacy", "venice");
	}
	if (ally == "hapsburg") {
	  his_self.deactivateMinorPower("hapsburg", "venice");
	}
        if (ally === "papacy") {
	  his_self.game.queue.push("venetian_alliance_placement");
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
              }
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
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy");
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
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"papacy");
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
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
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
	  his_self.game.queue.push("request_reveal_hand\tprotestant\tpapacy");
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


  returnDeck() {

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
        if (menu == "pre_field_battle_hits_assignment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              i = 100;
            }
          }
          return { faction : f , event : '001', html : `<li class="option" id="001">janissaries (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_field_battle_hits_assignment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('001')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "pre_field_battle_hits_assignment") {
          his_self.addMove("janissaries");
	  his_self.endTurn();
	  his_self.updateStatus("acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "janissaries") {

          his_self.game.queue.splice(qe, 1);
	  his_self.updateLog("Ottoman Empire plays "+his_self.popup('001'));
	  his_self.game.state.field_battle.attacker_rolls += 5;
	  his_self.game.state.field_battle.attacker_results.push(his_self.rollDice(6));

	  return 1;

        }

	return 1;

      },
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {
	alert("Not implemented");
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
        if (his_self.isBesieged("hapsburg", "charles-v")) { return 0; }
        if (his_self.isCaptured("hapsburg", "charles-v")) { return 0; }
	return 1;
      },
      onEvent : function(his_self, faction) {

	let ck = his_self.returnSpaceOfPersonage("hapsburg", "charles-v");
	let ak = his_self.returnSpaceOfPersonage("hapsburg", "duke-of-alva");
	let ck_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "charles-v", ck);
	let ak_idx = his_self.returnIndexOfPersonageInSpace("hapsburg", "duke-of-alva", ak);
	
        his_self.playerSelectSpaceWithFilter(

	  "Select Destination for Charles V: ",

	  function(space) {
		if (
		  space.home === "hapsburg" &&
		  !his_self.isSpaceControlled(space, "hapsburg")
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
		    if (action === "yes") {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ak_key + "\t" + ak_idx + "\t" + "land" + spacekey);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		      his_self.endTurn();
		    } else {
		      his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		      his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		      his_self.endTurn();
		    }
		  });

		} else {
		  his_self.addMove("ops\t"+faction+"\t"+"002"+"\t"+5);
		  his_self.addMove("moveunit" + "\t" + faction + "\t" + "land" + "\t" + ck_key + "\t" + ck_idx + "\t" + "land" + spacekey);
		  his_self.endTurn();
		}

	  },

	  null

	);

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
	his_self.game.queue.push("six-wives-of-henry-vii\t"+faction);
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "six-wives-of-henry-vii") {

          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player == his_self.game.player.returnPlayerOfFaction("england")) {

	    let faction = mv[1];

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
	      if (!his_self.isCaptured("england", "henry_viii") && !his_self.isBesieged("hapsburg", "charles-v")) {
	        options2 = true;
	      }
	    }
	  
	    if (options1 && options2) {

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
	  	  his_self.game.queue.push("henry_viii_declaration_of_war");
		  his_self.endTurn();
		  return;
	        }
	        if (action2 === "marital") {
	  	  his_self.game.queue.push("advance_henry_viii_marital_status");
		  his_self.endTurn();
		  return;
	        }

	      });

	      return 0;
            }

	    if (options1) {
	      his_self.game.queue.push("henry_viii_declaration_of_war");
	      return 0;
	    }

	    if (options2) {
	      his_self.game.queue.push("advance_henry_viii_marital_status");
	      return 0;
	    }
          }

	  return 0;
        }

        if (mv[0] == "advance_henry_viii_marital_status") {

	  //
	  // Henry VIII already dead, cannot roll
	  //
	  if (his_self.game.state.leaders.mary_i == 1 || his_self.game.state.leaders.edward_vi == 1 || his_self.game.state.leaders_elizabeth_i) {
            his_self.game.queue.splice(qe, 1);
	    return 1;
	  }

          his_self.game.queue.splice(qe, 1);

	  this.updateLog("Henry VIII advances his marital status");

	  this.game.state.henry_viii_marital_status++;
	  if (this.game.state.henry_viii_marital_status > 7) { this.game.state.henry_viii_marital_status = 7; return 1; }

	  if (this.game.state.henry_viii_marital_status > 2) {
	    this.updateStatus("Henry VIII makes a roll on the pregnancy chart");
	    let dd = this.rollDice(6);

	    if (this.game.state.henry_viii_rolls.includes(dd)) {
	      while (this.game.state.henry_viii_rolls.includes(dd) && dd < 6) {
	        dd++;
	      }
	    }
	    this.game.state.henry_viii_rolls.push(dd);

	    if (this.game.state.henry_viii_marital_status == 3) { 
	      this.updateStatus("Henry VIII receives +1 bonus for Jane Seymour");
	      dd++;
	    }

	    // results of pregnancy chart rolls
	    if (dd == 1) {
	      this.updateLog("Henry VIII rolls 1: marriage fails");
	    }
	    if (dd == 2) {
	      this.updateLog("Henry VIII rolls 2: marriage barren");
	    }
	    if (dd == 3) {
	      this.updateLog("Henry VIII rolls 3: wife beheaded - reroll");
	      this.game.state.henry_viii_auto_reroll = 1;
	    }
	    if (dd == 4) {
	      this.updateLog("Henry VIII rolls 4: Elizabeth I born");
	      this.game.state.henry_viii_add_elizabeth = 1;
	    }
	    if (dd == 5) {
	      this.updateLog("Henry VIII rolls 5: sickly Edward VI");
	      this.game.state.henry_viii_sickly_edward = 1;
	      this.game.state.henry_viii_add_elizabeth = 0;
	    }
	    if (dd >= 6) {
	      this.updateLog("Henry VIII rolls 6: healthy Edward VI");
	      this.game.state.henry_viii_healthy_edward = 1;
	      this.game.state.henry_viii_sickly_edward = 0;
	      this.game.state.henry_viii_add_elizabeth = 0;
	    }

	  }

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
	  if (!his_self.isCaptured("france", "francis-i")) { return 0; }
	  if (!his_self.isBesieged("france", "francis-i")) { return 0; }
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
    if (this.game.players.length == 2) {
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
		return;

	      });

	      return;
	    }

	    html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);
  
            $('.option').off();
            $('.option').on('click', function () {
              let selected_reformer = $(this).attr("id");
	      his_self.addEndMove("excommunicate_reformer\t"+selected_reformer);

              let msg = "Convene Theological Debate?";
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
		  his_self.excommunicateReformer(selected_reformer);
		  his_self.playerCallTheologicalDebate(his_self, his_self.game.player, "papacy");
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

            let msg = "Select Protestant Reformer:";
	    let reformer_exists = 0;
            let html = '<ul>';
	    for (let key in his_self.reformers) {
	      let s = his_self.returnSpaceOfPersonage("protestant", key);
	      if (s) {
		reformer_exists = 1;
                html += `<li class="option" id="${key}">${his_self.reformers[key].name}</li>`;
	      }
	    }

	    if (reformer_exists == 0) {
	      his_self.updateLog("No excommunicable Protestant reformers exist");
	      his_self.endTurn();
	      return;
	    }

	    html += '</ul>';
            his_self.updateStatusWithOptions(msg, html);
  
            $('.option').off();
            $('.option').on('click', function () {
              let selected_reformer = $(this).attr("id");
	      his_self.addMove("excommunicate_reformer\t"+selected_reformer);
	      his_self.endTurn();
	    });

	    return 0;

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
              html += '<li class="option" id="uncommitted">Uncommitted</li>';
            }
            if (1 <= his_self.returnDebatersInLanguageZone(language_zone, "protestant", 1)) {
              html += '<li class="option" id="committed">Committed</li>';
            }
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

            $('.option').off();
            $('.option').on('click', function () {

              let is_committed = $(this).attr("id");
	      if (is_committed == "uncommitted") { is_committed = 0; } else { is_committed = 1; }

              let msg = "Leigzip Debate Format?";
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
        	    his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	    his_self.addMove("RESETCONFIRMSNEEDED\tall");
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
                  $('.option').on('click', function () {
                    his_self.language_zone_overlay.hide();
                    let selected_idx = parseInt($(this).attr("id"));
		    let prohibited_protestant_debater = his_self.game.state.debaters[selected_idx].type;
	            his_self.addMove("theological_debate");
        	    his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	    his_self.addMove("RESETCONFIRMSNEEDED\tall");
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
       
	let cards_available = 0;
        for (let key in his_self.game.deck[0].discards) { cards_available++; }
        if (cards_available == 0) { return 0; }

	if (his_self.game.state.leaders.luther == 1) { return 1; }
	if (Object.keys(his_self.game.deck[0].discards).length > 0) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (his_self.game.player === p) {

	  let msg = "Retrieve Card from Discard Pile: ";
          let html = '<ul>';
	  for (let key in his_self.game.deck[0].discards) {
	    if (parseInt(key) > 9) {
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

		his_self.addMove("discard\tprotestant\t007");
    		his_self.addMove("cards_left\tprotestant\t"+(parseInt(his_self.game.state.cards_left["protestant"])+1));
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
      menuOption  :       function(his_self, menu, player) {
        if (menu === "debate") {
          return { faction : "protestant" , event : '007', html : `<li class="option" id="007">Here I Stand (assign Luther)</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "debate") {
	  // Wartburg stops Luther
	  if (his_self.game.state.events.wartburg == 1) { return 0; }
	  if (his_self.game.state.leaders.luther == 1) {
	    if (his_self.game.state.theological_debate.round1_attacker_debater == "luther-debater") { return 0; }
	    if (his_self.game.state.theological_debate.round1_defender_debater == "luther-debater") { return 0; }
	    if (his_self.game.state.theological_debate.round2_attacker_debater == "luther-debater") { return 0; }
	    if (his_self.game.state.theological_debate.round2_defender_debater == "luther-debater") { return 0; }
	    if (player === his_self.returnPlayerOfFaction("protestant")) {
	      if (his_self.canPlayerPlayCard("protestant", "007")) { return 1; }
	    }
	  }
	}
	return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu === "debate") {
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
	  his_self.game.queue.push("ACKNOWLEDGE\tProtestants swap Martin Luther into debate");
	  his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");

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
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      if (his_self.game.state.debaters[i].key === "luther-debater") {
		if (his_self.game.state.debaters[i].committed == 1) { is_luther_committed = 1; }
	      }
	    }
	    for (let i = 0; i < his_self.game.state.excommunicated.length; i++) {
	      if (his_self.game.state.excommunicated[i].debater) {
	        if (his_self.game.state.excommunicated[i].debater.type === "luther-debater") {
		  if (his_self.game.state.excommunicated[i].committed == 1) { is_luther_committed = 1; }
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
      removeFromDeck : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	// set player to protestant
	player = his_self.returnPlayerOfFaction("protestant");

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
        //his_self.game.queue.push("counter_or_acknowledge\tThe Reformation has begun!");
        //his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
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
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "catholic_counter_reformation") {

          let player = parseInt(mv[1]);
          if (his_self.returnPlayerOfFaction(mv[1])) { player = his_self.returnPlayerOfFaction(mv[1]); }
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }
	  let spillover = 0;
	  if (mv[3]) { spillover = parseInt(mv[3]); } // allow reformation outside target area

	  his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
	        space.religion === "protestant" &&
	        ((spillover == 1 || space.language === language_zone) || language_zone == "all") &&
	        !his_self.game.state.tmp_counter_reformations_this_turn.includes(space.key) &&
	        ( 
		  his_self.isSpaceAdjacentToReligion(space, "catholic")
		  ||
		  space.university == 1
		  ||
		  his_self.doesSpaceContainCatholicReformer(space)
	        )
	      ) {
	        return 1;
	      }
	      return 0;
	    }
	  );

	  //
	  // no valid reformation targets
	  //
	  if (target_spaces == 0) {
	    his_self.updateStatus("No valid counter-reformation targets"); 
	    his_self.updateLog("No valid counter-reformation targets"); 
	    his_self.game.queue.splice(qe, 1);
	    return 1;
	  }


	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

	    if (language_zone != "all" && language_zone != "") {
	      his_self.theses_overlay.render(language_zone);
	    } else {
	      his_self.theses_overlay.render();
	    }

            his_self.playerSelectSpaceWithFilter(

	      "Select Counter-Reformation Attempt",

	      //
	      // protestant spaces adjacent to catholic 
	      //
	      function(space) {
		if (
		  space.religion === "protestant" &&
		  ((spillover == 1 || space.language === language_zone) || language_zone == "all") &&
		  !his_self.game.state.tmp_counter_reformations_this_turn.includes(space.key) &&
		  his_self.isSpaceAdjacentToReligion(space, "catholic")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch counter_reformation
	      //
	      function(spacekey) {
	  	his_self.updateStatus("Counter-Reformation attempt: "+his_self.returnSpaceName(spacekey));
		his_self.addMove("counter_reformation\t"+spacekey+"\t"+language_zone);
		let name = his_self.game.spaces[spacekey].name;
		his_self.addMove("counter_or_acknowledge\tCounter-Reformation Attempt: "+his_self.returnSpaceName(spacekey)+"\tcatholic_counter_reformation\t"+name);
                his_self.addMove("RESETCONFIRMSNEEDED\tall");
		his_self.endTurn();
	      },

	      null, // cancel func

	      1     // permit board clicks

	    );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tCatholic Counter-Reformation - no valid targets");
              his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.endTurn();
	    }
	  } else {
	    his_self.updateStatus("Catholic Counter-Reformation in Process");
	  }

          return 0;

        }

        if (mv[0] == "protestant_reformation") {

          let player = parseInt(mv[1]);
          if (his_self.returnPlayerOfFaction(mv[1])) { player = his_self.returnPlayerOfFaction(mv[1]); }
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }
	  let spillover = 0;
	  if (mv[3]) { spillover = parseInt(mv[3]); } // allow reformation outside target area


	  his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
		space.religion === "catholic" &&
		!his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		((spillover == 1 || space.language === language_zone) || language_zone == "all") &&
		(
			his_self.isSpaceAdjacentToProtestantReformer(space, "protestant")
			||
			his_self.isSpaceAdjacentToReligion(space, "protestant")
			||
			his_self.doesSpaceContainProtestantReformer(space)
			||
			his_self.isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space)
		)
	      ) {
	        return 1;
	      }
	      return 0;
	    }
	  );

	  //
	  // no valid reformation targets
	  //
	  if (target_spaces == 0) {
	    his_self.updateStatus("No valid reformation targets"); 
	    his_self.updateLog("No valid reformation targets"); 
	    his_self.game.queue.splice(qe, 1);
	    return 1;
	  }

	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

	      if (language_zone != "all" && language_zone != "") {
	        his_self.theses_overlay.render(language_zone);
	      } else {
	        his_self.theses_overlay.render();
	      }

              his_self.playerSelectSpaceWithFilter(

	        "Select Reformation Target",

	        //
	        // catholic spaces adjacent to protestant 
	        //
	        function(space) {
	  	  if (
		    space.religion === "catholic" &&
		    !his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		    ((spillover == 1 || space.language === language_zone) || language_zone == "all") &&
		    (
			his_self.isSpaceAdjacentToProtestantReformer(space, "protestant")
			||
			his_self.isSpaceAdjacentToReligion(space, "protestant")
			||
			his_self.doesSpaceContainProtestantReformer(space)
			||
			his_self.isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space)
		    )
	          ) {
		    return 1;
	          }
		  return 0;
	        },

	        //
	        // launch reformation
	        //
	        function(spacekey) {
	  	  his_self.addMove("reformation\t"+spacekey+"\t"+language_zone);
		  his_self.addMove("counter_or_acknowledge\tProtestant Reformation Attempt in "+his_self.returnSpaceName(spacekey)+"\tprotestant_reformation\t"+spacekey);
        	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  	  his_self.updateStatus("Reformation attempt in "+his_self.returnSpaceName(spacekey));
		  his_self.endTurn();
	        },
	        null ,
	        1     // permit board clicks
	      );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tProtestant Reformation - no valid targets");
              his_self.addMove("RESETCONFIRMSNEEDED\tall");
	      his_self.updateStatus("No Valid Targets");
	      his_self.endTurn();
	    }
	  } else {
	    his_self.updateStatus("Protestant Reformation...");
	  }
          return 0;
        }
	return 1;
      }
    }
    deck['009'] = { 
      img : "cards/HIS-009.svg" , 
      name : "Barbary Pirates" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	// algiers space is now in play
	his_self.game.spaces['algiers'].home = "ottoman";
	his_self.game.spaces['algiers'].political = "ottoman";
	his_self.addRegular("ottoman", "algiers", 2);
	his_self.addCorsair("ottoman", "algiers", 2);
	his_self.game.state.events.barbary_pirates = 1;
	his_self.game.state.events.ottoman_piracy_enabled = 1;
	his_self.game.state.events.ottoman_corsairs_enabled = 1;

	return 1;
      },

    }
    deck['010'] = { 
      img : "cards/HIS-010.svg" , 
      name : "Clement VII" ,
      ops : 2 ,
      turn : 1 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
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
	  let faction_hand_idx = his_self.returnFactionHandIdx(player, "england");   
 	  his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+his_self.game.state.players_info[player-1].factions[faction_hand_idx]);
	  his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
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

	let f = {};
	if (!f[his_self.game.spaces['genoa'].political]) { f[his_self.game.spaces['genoa'].political] = 1; }
	else { f[his_self.game.spaces['genoa'].political]++ }

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

	let f = {};
	if (!f[his_self.game.spaces['genoa'].political]) { f[his_self.game.spaces['genoa'].political] = 1; }
	else { f[his_self.game.spaces['genoa'].political]++ }

	for (let key in f) {
	  if (f[key] >= 4) {
	    his_self.gainVictoryPoints(faction, 3);
	  }
	  if (f[key] == 3) {
	    his_self.gainVictoryPoints(faction, 2);
	  }
	  if (f[key] == 2) {
	    let faction_hand_idx = his_self.returnFactionHandIdx(player, key);
 	    his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+his_self.game.state.players_info[player-1].factions[faction_hand_idx]);
	    his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
	  }
	}

	his_self.displayVictoryTrack();

      }
    }
    if (this.game.players.length == 2) {
      deck['013'] = { 
        img : "cards/HIS-013-2P.svg" , 
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
          his_self.setAllies("papacy","hapsburg");
	  // protestant home + political spaces
	  for (let key in his_self.game.spaces) {
	    s = his_self.game.spaces[key];
	    if (s.language == "german") { 
	      s.home = "protestant"; 
	      if (s.religion == "protestant") {
		s.political = "protestant";
	      }
	    }
	  }
	  for (let i = 0; i < his_self.game.state.activated_powers["protestant"].length; i++) {
	    if (his_self.game.state.activated_powers["protestant"][i] === "hapsburg") {
	      his_self.game.state.activated_powers["protestant"].splice(i, 1);
	      his_self.game.state.events.spanish_invasion = "";
	    }
	  }
          his_self.game.state.activated_powers["papacy"].push("hapsburg");
	  his_self.displayBoard();
	  return 1;
        }
      }
    } else {
      deck['013'] = { 
        img : "cards/HIS-013.svg" , 
        name : "Schmalkaldic League" ,
        ops : 2 ,
        turn : 1 ,
        type : "mandatory" ,
        removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
        onEvent : function(his_self, faction) {
          his_self.setEnemies("protestant","papacy");
          his_self.setEnemies("protestant","hapsburg");
          his_self.setAllies("papacy","hapsburg");
          his_self.game.state.events.schmalkaldic_league_round = his_self.game.state.round;
          his_self.game.state.events.schmalkaldic_league = 1;
	  // protestant home + political spaces
	  for (let key in his_self.game.spaces) {
	    s = his_self.game.spaces[key];
	    if (s.language == "german") { 
	      s.home = "protestant"; 
	      if (s.religion == "protestant") {
		s.political = "protestant";
	      }
	    }
	  }
	  his_self.displayBoard();
	  return 1;
        }
      }
    }
    deck['014'] = { 
      img : "cards/HIS-014.svg" , 
      name : "Paul III" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
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
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	let papacy = his_self.returnPlayerOfFaction("papacy");
	if (his_self.game.player === papacy) {
    	  his_self.playerSelectSpaceWithFilter(
      	    "Select Catholic-Controlled Space for First Jesuit University",
      	    function(space) {
              if (space.religion === "catholic" && space.university != 1) { return 1; }
              return 0; 
            },          
            function(destination_spacekey) {
    	      his_self.playerSelectSpaceWithFilter(
      	        "Select Catholic-Controlled Space for Second Jesuit University",
       	        function(space) {
                  if (space.key != destination_spacekey && space.religion === "catholic" && space.university != 1) { return 1; }
                  return 0; 
                },
                function(second_spacekey) {
                  his_self.addMove("found_jesuit_university\t"+second_spacekey);
                  his_self.addMove("found_jesuit_university\t"+destination_spacekey);
	          his_self.addMove("SETVAR\tstate\tevents\tpapacy_may_found_jesuit_universities\t1");
                  his_self.endTurn();
	        }
	      );
	    }
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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

	his_self.updateLog("Luther dies and is replaced by Calvin");

	return 0;
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
	    his_self.game.spaces[s].units["ottoman"].splice(idx, 1);
	    his_self.addNavyLeader("ottoman", s, "dragut");
	  }	  
	}

	return 1;
      },
    }
    deck['019'] = { 
      img : "cards/HIS-019.svg" , 
      name : "Edward VI" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders.edward_vi = 1;
	his_self.game.state.leaders.henry_viii = 0;
	his_self.game.state.leaders.mary_i = 0;
	his_self.game.state.leaders.elizabeth_i = 0;

	let placed = 0;

        // henry_viii dies, replaced by dudley
        let s = his_self.returnSpaceOfPersonage("england", "henry_viii");
        if (s != "") {
          let idx = his_self.returnIndexOfPersonageInSpace("england", "henry_viii", s);
          if (idx > -1) {
            his_self.game.spaces[s].units["england"].splice(idx, 1);
            his_self.addArmyLeader("england", s, "dudley");
	    placed = 1;
          } 
        }
        
	if (placed == 0) {
          his_self.addArmyLeader("england", "london", "dudley");
	}

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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	his_self.game.state.leaders.francis_i = 0;
	his_self.game.state.leaders.henry_ii = 1;
	let placed = 0;

        // francis_i dies replaced by henry_ii
        let s = his_self.returnSpaceOfPersonage("france", "francis_i");
        if (s != "") {
          let idx = his_self.returnIndexOfPersonageInSpace("france", "francis_i", s);
          if (idx > -1) {
            his_self.game.spaces[s].units["france"].splice(idx, 1);
            his_self.addArmyLeader("france", s, "henry_ii");
	    placed = 1;
          } 
        }
        
	if (placed == 0) {
          his_self.addArmyLeader("france", "paris", "henry_ii");
	}

	return 1;
      },
    }
    deck['021'] = { 
      img : "cards/HIS-021.svg" , 
      name : "Mary I" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      canEvent : function(his_self, faction) {
        return 1;
      },
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      onEvent : function(his_self, faction) {
	his_self.game.state.leaders.edward_vi = 0;
	his_self.game.state.leaders.mary_i = 1;

	//
	// it is possible that a healthy Edward has already been born before this
	// card has been played, in which case Mary I is actually Edward VI since
	// the succession passes to him.
	//
        if (his_self.game.state.henry_viii_healthy_edward == 1) {
	  let deck = his_self.returnDeck();
	  let card = deck["019"];
	  card.onEvent(his_self,faction);
	  return 1;
        }

	//
	// otherwise remove Edward from the Deck
	//
	his_self.removeCardFromGame('019'); // remove edward_vi if still in deck

	//
	// if sickly edward has been born but this card has been played, we want
	// to push it back into the deck next turn. the card will be removed because
	// it is a mandatory card, so we make a note to re-add it next turn.
	//
        if (his_self.game.state.henry_viii_sickly_edward == 1) {
	  this.game.state.henry_viii_mary_i_added_with_sickly_edward_played = 1;
	  return 1;
        }

	//
	// if Elizabeth has been born, we will tag to add her next round
	//
	// this code is in returnNewCards...


	let placed = 0;
	if (his_self.game.state.leaders.henry_viii == 1) {

	  his_self.game.state.leaders.henry_viii = 0; 

          // mary_i replaces edward_vi or henry_viii
          let s = his_self.returnSpaceOfPersonage("england", "henry_viii");
          if (s != "") {
            let idx = his_self.returnIndexOfPersonageInSpace("england", "henry_viii", s);
            if (idx > -1) {
              his_self.game.spaces[s].units["england"].splice(idx, 1);
              his_self.addArmyLeader("england", s, "dudley");
	      placed = 1;
            } 
          }

	  if (placed == 0) {
            his_self.addArmyLeader("france", "paris", "henry_ii");
	  }
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
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }

          return { faction : f , event : '024', html : `<li class="option" id="024">arquebusiers (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('024')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          player = his_self.returnPlayerOfFaction(faction);
	  player.tmp_roll_bonus = 2;
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
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('025')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '025', html : `<li class="option" id="025">field artillery (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('025')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          player = his_self.returnPlayerOfFaction(faction);
	  player.tmp_roll_bonus = 2;
	  if (faction === "france" || faction === "ottoman") {
	    player.tmp_roll_bonus = 3;
	  }
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
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('026')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (f === "ottoman") { return {}; }
          return { faction : f , event : '026', html : `<li class="option" id="026">mercenaries bribed (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('026')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  alert("Mercenaries Bribed...");
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
        if (menu == "pre_assault_hits_roll") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '027', html : `<li class="option" id="027">mercenaries grow restless (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_hits_roll") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
	      let assault_spacekey = "";
	      if (his_self.game.state.assault) {
	        if (his_self.game.state.assault.spacekey) {
	          if (his_self.isSpaceControlled(his_self.game.state.assault.spacekey, faction)) {
                    return 1;
	 	  }
	 	}
	      }
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_hits_roll") {
	  his_self.addMove(`mercenaries_grow_restless\t${faction}`);
  	  his_self.addMove(`discard\t${faction}\t027`);
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "mercenaries_grow_restless") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  his_self.updateLog(his_self.returnFactionName(faction) + " triggers " + his_self.popup("027"));

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
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('028')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  let am_i_attacker = false;
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("assault") == 0) {
	      let lmv = lqe.split("\t");
	      if (lmv[0] === "assault") {
		if (f === lmv[1]) { am_i_attacker = true; }
	      }
	    }
	  }
	  if (am_i_attacker) {
            return { faction : f , event : '028', html : `<li class="option" id="028">siege mining (${f})</li>` };
	  }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "assault" && his_self.game.player === his_self.game.state.active_player) {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('028')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "assault") {
          his_self.addMove(`siege_mining`);
          his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "siege_mining") {
          his_self.game.queue.splice(qe, 1);
	  his_self.game.state.players_info[his_self.game.state.active_player-1].tmp_roll_bonus = 3;
alert("enabled siege mining: " + his_self.game.state.active_player-1 + " -- " + JSON.stringify(his_self.game.state.players_info[his_self.game.state.active_player-1].tmp_roll_bonus));
	}
        return 1;
      }
    }
    deck['029'] = { 
      img : "cards/HIS-029.svg" , 
      name : "Surprise Attack" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '029', html : `<li class="option" id="029">surprise attack (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          player = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.state.active_player === player) {
	    player.tmp_roll_first = 1;
	  }
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
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('030')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '030', html : `<li class="option" id="030">tercois (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('030')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  alert("tercois is complicated...");
        }
        return 1;
      },
    }
    deck['031'] = { 
      img : "cards/HIS-031.svg" , 
      name : "Foul Weather" ,
      ops : 2 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "move" || menu == "assault" || menu == "piracy") {

	  if (his_self.game.state.active_player === his_self.game.player) { return {}; }

          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('031')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '031', html : `<li class="option" id="031">foul weather (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "move" || menu == "assault" || menu == "piracy") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('031')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "move" || menu == "assault" || menu == "piracy") {
	  his_self.addMove(`foul_weather\t${player}\t${faction}`);
  	  his_self.addMove("discard\t"+faction+"\t"+"031");
  	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "foul_weather") {

          let player = mv[1];
          let faction = mv[2];
          his_self.game.queue.splice(qe, 1);

	  his_self.displayModal(his_self.returnFactionName(faction) + " triggers Foul Weather");

	  his_self.updateLog(his_self.returnFactionName(faction) + " triggers " + his_self.popup("031"));
	  his_self.game.state.events.foul_weather = 1;

	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    if (his_self.game.queue[i].indexOf("continue") == -1) {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      break;
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
        if (menu == "move" || menu == "assault") {
	  let f = "";
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
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
		    if (space.units[faction][i].army_leader) {
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
		  let unit_idx = parseInt(lmv[5]);
		  let unit = his_self.game.spaces[source].units[faction][unit_idx];
		  if (unit.army_leader) {
		    includes_army_leader = true;
		  }
		}
	      }
	    }
	  }

	  if (includes_army_leader) {
            return { faction : f , event : '032', html : '<li class="option" id="032">play gout</li>' };
	  } 
       }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
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

	  if (faction == null || source == null || unit_idx == null) { his_self.endTurn(); return 0; }
  	  his_self.addMove(`discard\t${faction}\t032`);
          his_self.addMove(`gout\t${faction}\t${source}\t${unit_idx}`);
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
		unit_idx = parseInt(lmv[5]);
		break;
	      }
	    }
	  }

	  if (faction == null || source == null || unit_idx == null) { his_self.endTurn(); return 0; }
  	  his_self.addMove(`discard\t${faction}\t032`);
          his_self.addMove(`gout\t${faction}\t${source}\t${unit_idx}`);
          his_self.endTurn();

        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "gout") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let source = mv[2];
	  let unit_idx = parseInt(mv[3]);

	  his_self.displayModal(his_self.returnFactionName(faction) + " triggers Foul Weather");

	  his_self.game.spaces[source].units[faction][unit_idx].gout = true;
	  his_self.updateLog(his_self.game.spaces[source].units[faction][unit_idx].name + " has come down with gout");
          his_self.game.queue.splice(qe, 1);

	  //
	  // "lose 1 CP"
	  //
	  for (let i = his_self.game.queue.length-1; i > 0; i--) {
	    let lqe = his_self.game.queue[i];
	    if (lqe.indexOf("continue") != 0 && lqe.indexOf("play") != 0) {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      break;
	    }
	  }
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
      menuOption  :       function(his_self, menu, player) {
        if (menu == "field_battle") {

	  let f = "";

	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('033')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

          return { faction : f , event : '033', html : `<li class="option" id="033">landsknechts (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('033')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  if (faction == "ottoman" || faction == "france") {
	  } else {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction, 
	      function(space) {
		if (!his_self.isSpaceUnderSiege(space.key)) { return 0; }
		if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	        return 0;
	      } ,
	      null ,
	      null ,
	      true
	    );
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
                his_self.playerRemoveUnitsInSpaceWithFilter("mercenary", 2, faction,
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
    }
    deck['035'] = { 
      img : "cards/HIS-035.svg" , 
      name : "Siege Artillery" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "pre_assault_hits_assignment") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('035')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
	  if (f != "") {
            return { faction : f , event : '035', html : `<li class="option" id="028">siege artillery (${f})</li>` };
          }
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_hits_assignment") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('035')) {
	      let assault_spacekey = his_self.game.state.assault.spacekey;
	      let attacker_faction = his_self.game.state.assault.attacker_faction;
	      if (4 >= his_self.returnHopsToFortifiedHomeSpace(assault_spacekey, attacker_faction)) {
		return 1;
	      }
              return 0;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "assault") {
          his_self.addMove(`siege_artillery`);
          his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {
        if (mv[0] == "siege_artillery") {

          his_self.game.queue.splice(qe, 1);

	  //
	  // three extra hits
	  //
	  his_self.game.state.assault.attacker_rolls += 2;
          for (let i = 0; i < 2; i++) {
            let res = his_self.rollDice(6);
            his_self.game.state.assault.attacker_results.push(res);
            if (res >= 5) { his_self.game.state.assault.attacker_hits++; }
          }

          his_self.game.queue.push("counter_or_acknowledge\tUpdated Assault Results (post Siege Artillery)");
          his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
          his_self.game.queue.push("assault_show_hits_render");

	}
        return 1;
      }
    }
    deck['029'] = { 
      img : "cards/HIS-029.svg" , 
      name : "Surprise Attack" ,
      ops : 2 ,
      turn : 1 ,
      type : "combat" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      menuOption  :       function(his_self, menu, player) {
        if (menu == "assault") {
          let f = "";
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
              break;
            }
          }
          return { faction : f , event : '029', html : `<li class="option" id="029">surprise attack (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('029')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "assault") {
          player = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.state.active_player === player) {
	    player.tmp_roll_first = 1;
	  }
        }
        return 1;
      },
    }
    deck['036'] = { 
      img : "cards/HIS-036.svg" , 
      name : "Swiss Mercenaries" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {
	let num = 2;
	let f = faction;
	if (faction == "france" || faction == "ottoman") { num = 4; f = "france"; }
        his_self.game.queue.push("swiss_mercenaries\t"+f+"\t"+num);
	return 1;
      },
      menuOption  :       function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  let f = "";

	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('036')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }

          return { faction : f , event : '036', html : `<li class="option" id="036">swiss mercenaries (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('036')) {
	      return 1;
	    }
	  }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "field_battle") {
	  if (faction == "ottoman" || faction == "france") {
	  } else {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction, 
	      function(space) {
		if (!his_self.isSpaceUnderSiege(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace("france", space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	      } ,
	      null ,
	      null ,
	      true
	    );
	  }
	}
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "swiss_mercenaries") {

          let faction = mv[1];
          let num = parseInt(mv[2]);
          his_self.game.queue.splice(qe, 1);

	  let player = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == player) {

            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", num, faction,
	      function(space) {
		if (his_self.isSpaceUnderSiege(space.key)) { return 0; }
		if (his_self.returnFactionLandUnitsInSpace(faction, space.key)) { return 1; }
		if (his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 1; }
	        return 0;
	      } ,
	      null ,
	      null ,
	      true
	    );
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

          return { faction : "protestant" , event : '037', html : `<li class="option" id="037">wartburg (protestant)</li>` };
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
      menuOptionActivated:  function(his_self, menu, player, extra) {
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
	    if (lmv[0] !== "remove" && lmv[0] !== "discard" && lmv[0] !== "round" && lmv[0] !== "play") {
	      his_self.game.queue.splice(i, 1);
	    } else {
	      if (lmv[0] === "round" || lmv[0] === "play") {
	        i = -1;
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
          return { faction : f , event : '038', html : `<li class="option" id="038">halley's comet (${f})</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu != "" && menu != "pre_spring_deployment") {
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
  	  his_self.addMove("event\t"+faction+"\t038");
  	  his_self.addMove("discard\t"+faction+"\t038");
	  his_self.endTurn();
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
	    if (faction != "hapsburg") { html += '<li class="option" id="hapsburg">Haspburg</li>'; }
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
	his_self.game.state.events.augsburg_confession = true;
	his_self.commitDebater("papacy", "melanchthon-debater", 0); // 0 = no bonus

	return 1;
      },
    }
    deck['040'] = { 
      img : "cards/HIS-040.svg" , 
      name : "MachiaveIIi: The Prince" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

	if (player == his_self.game.player) {

	  let powers = his_self.returnImpulseOrder();
	  let msg = "Declare War on which Power?";

          let html = '<ul>';
	  for (let i = 0; i < powers.length; i++) {
            html += '<li class="option" id="${powers[i]}">${powers[i]}</li>';
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");

            his_self.addMove("ops\t"+faction+"\t"+"040"+"\t"+2);
            his_self.addMove("declare_war\t"+faction+"\t"+action);
	    his_self.endTurn();

	  });

          return 0;

        }

	return 1;
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
              html += '<li class="option" id="mo">Melanchthon Oekolampadius</li>';
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

	    if (action !== "lz") {
	      his_self.addMove("commit\tprotestant\tluther-debater");
	      his_self.addMove("commit\tprotestant\tzwingli-debater");
	      refs = 7;
	    }
	    if (action !== "lo") {
	      his_self.addMove("commit\tprotestant\tluther-debater");
	      his_self.addMove("commit\tprotestant\toekolampadius-debater");
	      refs = 6;
	    }
	    if (action !== "mz") {
	      his_self.addMove("commit\tprotestant\tzwingli-debater");
	      his_self.addMove("commit\tprotestant\tmalanchthon-debater");
	      refs = 6;
	    }
	    if (action !== "mo") {
	      his_self.addMove("commit\tprotestant\toekolampadius-debater");
	      his_self.addMove("commit\tprotestant\tmalanchthon-debater");
	      refs = 5;
	    }

	    for (let i = 0; i < refs; i++) {
              his_self.prependMove("protestant_reformation\t"+player+"\tall");
	    }
	
            his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
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

	  let msg = "Remove 1 Catholic Land Unit?";
	  let viable_targets = 0;
          let html = '<ul>';
	  for (let i = 0; i < targets.length; i++) {
	    if (his_self.hasCatholicLandUnits(targets[i])) {
	      viable_targets++;
              html += `<li class="option" id="${targets[i]}">${targets[i]}</li>`;
	    }
	  }
	  if (viable_targets == 0) {
            html += '<li class="option" id="skip">skip</li>';
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let action = $(this).attr("id");

	    if (action != "skip") {

	      his_self.endTurn();

	    } else {

	      let catholic_land_units = his_self.returnCatholicLandUnitsInSpace(action);
	      let msg = "Remove which Unit?";
              let html = '<ul>';
	      for (let i = 0; i < catholic_land_units.length; i++) {
	        let u = his_self.game.spaces[action].units[catholic_land_units[i].faction][catholic_land_units[i].unit_idx];
                html += '<li class="option" id="${catholic_land_units[i].faction}_${catholic_land_units[i].unit_idx}">${catholic_land_units[i].faction} - ${u.type}</li>';
	      }

    	      his_self.updateStatusWithOptions(msg, html);

	      $('.option').off();
	      $('.option').on('click', function () {
	        $('.option').off();
	        let x = $(this).attr("id").split("_");
		his_self.addMove("destroy_unit_by_index\t"+x[0]+"\t"+action+"\t"+"\t"+x[1]);
		his_self.endTurn();            
	      });

	    }
	  });

          return 0;

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
      canEvent : function(his_self, faction) { if (!his_self.isCommitted("cop-debater")) { return 0; } return 1; } ,
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {

        let obj = {};
        obj.faction = "protestant";
	obj.space = "geneva";
	obj.reformer = his_self.reformers["calvin-reformer"];
        let target = his_self.returnSpaceOfPersonage("protestant", "calvin-reformer");

console.log("target is: " + target);

	if (target) {
  	  for (let i = 0; i < his_self.game.spaces[target].units["protestant"].length; i++) {
	    if (his_self.game.spaces[target].units["protestant"][i].type == "calvin-reformer") {
              obj.reformer = his_self.game.state.spaces[target].units["protestant"][i];
	      his_self.game.spaces[target].units["protestant"].splice(i, 1);
	    }
	  }
	}

	his_self.removeDebater("protestant", "calvin-debater");
        his_self.game.state.reformers_removed_until_next_round.push(obj);

	his_self.displaySpace(target);

        return 1;
      },
    }
    deck['046'] = { 
      img : "cards/HIS-046.svg" , 
      name : "Calvin's Insitutes" ,
      ops : 5 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { if (!his_self.isCommitted("calvin-debater")) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {

	if (his_self.isCommitted("calvin-debater")) { return 1; }

	his_self.commitDebater("protestant", "calvin-debater", 0); // no bonus

        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.addMove("SETVAR\tstate\tevents\tcalvins_institutions\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.game.queue.push("protestant_reformation\tprotestant\tfrench");
	his_self.addMove("SETVAR\tstate\tevents\tcalvins_institutions\t1");
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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

console.log("count: " + count);
console.log("total: " + total);

	if (count >= (total/2)) {
	  double_vp = 1;
	}

	//
	//
	//
	if (double_vp == 1) {

	  // faction will gain when counted
	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;
	  his_self.displayVictoryTrack();

	  return 1;

	} else {

	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;

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
	      let action = $(this).attr("id");

	      if (action === "draw") {

	 	//	
	 	// deal a card	
	 	//
	        let cardnum = 1;

                his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+faction);
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
    }
    deck['049'] = { 
      img : "cards/HIS-049.svg" , 
      name : "Huguenot Raiders" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['050'] = { 
      img : "cards/HIS-050.svg" , 
      name : "Mercator's Map" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['051'] = { 
      img : "cards/HIS-051.svg" , 
      name : "Michael Servetus" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
    }
    deck['054'] = { 
      img : "cards/HIS-054.svg" , 
      name : "Potosi Silver Mines " ,
      ops : 3 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "jesuit_education") {

	  if (!his_self.game.state.events.society_of_jesus) { return 1; }

          his_self.game.queue.splice(qe, 1);
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player == player) {

	    his_self.playerSelectSpaceWithFilter(
	      "Select Catholic Space for 1st Jesuit University",
	      function(space) { if (space.religion === "catholic" && space.university != 1) { return 1; } return 0; },
	      function(spacekey) {

		let s = his_self.game.spaces[spacekey].university = 1;
		his_self.displaySpace(s);
		his_self.addMove("jesuit_university\t"+spacekey);

	        his_self.playerSelectSpaceWithFilter(
	          "Select Catholic Space for 2nd Jesuit University",
	          function(space) { if (space.religion === "catholic" && space.university != 1) { return 1; } return 0; },
	          function(spacekey) {

		    let s = his_self.game.spaces[spacekey].university = 1;
		    his_self.displaySpace(s);
		    his_self.addMove("jesuit_university\t"+spacekey);
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

	his_self.commitDebater("papacy", "caraffe-debater", 0); // no bonus
	his_self.addMove("papal_inquisition_card_draw");
	his_self.addMove("papal_inquisition_target_player");
	his_self.addMove("papal_inquisition_convert_spaces");
	his_self.endTurn();

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "papal_inquisition_convert_spaces") {

	  let player = his_self.returnPlayerOfFaction("papacy");
          his_self.game.queue.splice(qe, 1);

	  if (his_self.game.player === player) {

	    his_self.playerSelectSpaceWithFilter(
	      "Select Protestant Space to Convert",
	      function(space) { if (space.language === "italian" && space.religion === "protestant") { return 1; } return 0; },
	      function(spacekey) {
		his_self.addMove("convert\t"+spacekey+"\tcatholic");

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
	      let action = $(this).attr("id");

              his_self.addMove("papal_inquisition_draw_card\t"+action);
              his_self.addMove("request_reveal_hand\tpapacy\t"+action);
              his_self.endTurn();

	    });
	  } else {
	    his_self.updateStatus("Papal Inquisition - Selecting Target");
	  }

	  return 0;

	}

        if (mv[0] == "papal_inquisition_draw_card") {

	  let target = mv[1];
	  let player = his_self.returnPlayerOfFaction("papacy");

	  if (his_self.game.player === player) {

            his_self.game.queue.splice(qe, 1);

 	    let msg = "Choose Action:";
            let html = '<ul>';
            html += '<li class="option" id="draw">draw ${target} card</li>';
            html += '<li class="option" id="recover">recover from discard pile</li>';
            html += '<li class="option" id="debate">initiate debate +2 dice</li>';
    	    html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action === "draw") {
                his_self.addMove("pull_card\tpapacy\t"+target);
                his_self.endTurn();
	      }
	      if (action === "recover") {
                his_self.addMove("papal_inquisition_recover_discard");
                his_self.endTurn();
	      }
	      if (action === "debate") {
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

	  if (his_self.game.player === player) {

 	    let msg = "Choose Action: ";
            let html = '<ul>';
            html += '<li class="option" id="discard">discard card</li>';
            html += '<li class="option" id="hesse">remove Philip of Hesse</li>';
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
    }
    deck['059'] = { 
      img : "cards/HIS-059.svg" , 
      name : "Lady Jane Grey" ,
      ops : 3 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['060'] = { 
      img : "cards/HIS-060.svg" , 
      warn : ["ottoman","england","france","papacy"] ,
      name : "Maurice of Saxony" ,
      ops : 4 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (
	     faction === "hapsburg" || 
	     faction === "protestant" || 
	       (
		 faction === "papacy" && 
	  	 his_self.game.players.length == 2 && 
		 his_self.game.state.events.schmalkaldic_league == 1
	       )
	) { return 1; } return 0; 
      } ,
      onEvent : function(his_self, faction) {

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

	return 0;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "maurice-of-saxony") {

	  let faction = mv[1];
	  let spacekey = mv[2];

          for (let i = 0; i < this.game.players.length; i++) {
            let p = this.game.state.players_info[i];
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
            let ms = his_self.returnSpaceOfPersonage(his_self.game.state.events.maurice_of_saxony, "maurice-of-saxony");

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
            let ms = his_self.returnSpaceOfPersonage(his_self.game.state.events.maurice_of_saxony, "maurice-of-saxony");
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
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tengland");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tengland");
	his_self.game.queue.push("catholic_counter_reformation\tpapacy\tengland");
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
      canEvent : function(his_self, faction) { if (his_self.isDebaterCommitted("cranmer-debater")) { return 1; } return 0; } ,
      onEvent : function(his_self, faction) {

	let d = his_self.rollDice(6);

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
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");

	return 1;
      },
    }
    deck['063'] = { 
      img : "cards/HIS-063.svg" , 
      name : "Dissolution of the Monasteries" ,
      ops : 4 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 1; } ,
      canEvent : function(his_self, faction) { return 1; } ,
      onEvent : function(his_self, faction) {
	
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t0");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
	his_self.game.queue.push("protestant_reformation\tprotestant\tengland");
        his_self.game.queue.push("SETVAR\tstate\tskip_counter_or_acknowledge\t1");
	his_self.game.queue.push("discard_random\tpapacy");

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

	player = his_self.returnPlayerOfFaction("protestant");

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
	// two hops !
	//
	for (let i = 0; i < spaces.length; i++) {
	  let s = his_self.game.spaces[spaces[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	  }
	}
	for (let i = 0; i < neighbours.length; i++) {
	  let s = his_self.game.spaces[neighbours[i]];
	  for (let ii = 0; ii < s.neighbours.length; ii++) {
	    if (his_self.isSpaceControlled(s.neighbours[ii], "ottoman")) {
	      if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	    }
	  }
	}

	//
	// enemy control any of these neighbours?
	//
	for (let i = 0; i < neighbours.length; i++) {
	  for (let ii = 0; ii < enemies.length; ii++) {
	    if (his_self.isSpaceControlled(neighbours[i], enemies[ii])) {
	      return 1;
	    }
	  }
	}

	return 0;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	let target_which_faction = [];

	if (his_self.game.player == p) {

	  let enemies = his_self.returnEnemies("ottoman");
	  let neighbours = [];
	  let spaces = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].units["ottoman"].length > 0) {
	      for (let z = 0; z < his_self.game.spaces[spacekey].units["ottoman"].length; z++) {
	        if (his_self.game.spaces[spacekey].units["ottoman"][z].type === "cavalry") {
	          if (his_self.isSpaceControlled(spacekey, "ottoman")) {
	  	    return 1;
		  }
	        }     
	      }
	    }
	  });

	  //
	  // two hops !
	  //
	  for (let i = 0; i < spaces.length; i++) {
	    let s = his_self.game.spaces[spaces[i]];
	    for (let ii = 0; ii < s.neighbours.length; ii++) {
	      if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	    }
	  }
	  for (let i = 0; i < neighbours.length; i++) {
	    let s = his_self.game.spaces[neighbours[i]];
	    for (let ii = 0; ii < neighbours.length; ii++) {
	      if (his_self.isSpaceControlled(neighbours[ii], "ottoman")) {
	        if (!neighbours.includes(s.neighbours[ii])) { neighbours.push(s.neighbours[ii]); }
	      }
	    }
	  }

	  //
	  // enemy control any of these neighbours?
	  //
	  for (let i = 0; i < neighbours.length; i++) {
	    for (let ii = 0; ii < enemies.length; ii++) {
	      if (his_self.isSpaceControlled(neighbours[i], enemies[ii])) {
	        if (!target_which_faction.includes(enemies[ii])) { target_which_faction.push(enemies[ii]); }
	      }
	    }
	  }
	}

        let msg = "Steal Random Card from Which Faction?";
        let html = '<ul>';
        for (let i = 0; i < target_which_faction.length; i++) {
           html += '<li class="option" id="${target_which_faction}">${target_which_faction[i]}</li>';
	}
	html += '</ul>';

    	his_self.updateStatusWithOptions(msg, html);

	$('.option').off();
	$('.option').on('click', function () {

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
          if (0 == his_self.playerSelectSpaceWithFilter(

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
	          if (s2.religion == "protestant" && his_self.isOccupied(s2) == 0 && !his_self.isElectorate(s2) && s2.key != first_choice) {
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


              if (0 == his_self.playerSelectSpaceWithFilter(

	        "Select Second Space to Convert", 

	        function(space2) {
	        },

	        function(second_choice) {

		  his_self.addMove("convert\t"+second_choice+"\tcatholic");
		  his_self.addMove("convert\t"+first_choice+"\tcatholic");
		  his_self.endTurn();

	        },

		null , 

		true 
	      )) { 
	        his_self.updateStatus("No acceptable targets for Anabaptists");
	        his_self.endTurn();
	      };
	    } ,

	    null ,

	    true 
	  )) {
	    his_self.updateStatus("No acceptable targets for Anabaptists");
	    his_self.endTurn();
	  };
	} else {
	  his_self.updateStatus("Papacy playing "+his_self.popup("067"));
	}
	return 0;
      }
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
	  if (f == "") {
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
		      if (his_self.isSpaceControlled(space, "france")) {
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
	      // 2P must be German or Iralian space
	      if (his_self.game.players.length == 2) { if (space.language != "italian" && space.language != "german") { return false; } }
	      if (space.besieged) { return 0; }
	      if (his_self.isSpaceControlled(space, faction)) { return 1; }
	      return 0;
	    },

	    function(spacekey) {
	      let space = his_self.game.spaces[spacekey];
	      his_self.addMove("add_army_leader\t"+faction+"\t"+spacekey+"\t"+"renegade");
              his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
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
    deck['071'] = { 
      img : "cards/HIS-071.svg" , 
      name : "City State Rebels" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.players.length == 2) {
	  if (his_self.game.state.events.schmalkaldic_league == 1) { return 1; }
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

	      // 2P game - may be played against electorate under Hapsburg Control
	      if (his_self.game.players.length == 2) {
		if (his_self.game.state.events.schmalkaldic_league) { if (space.type == "electorate" && ((space.political == "protestant" && space.home == "hapsburg") || (space.political == "hapsburg" && space.home == "protestant"))) { if (his_self.returnFactionLandUnitsInSpace("haspburg", space.key)) { return 1; } } }
	      }

	      // captured key
	      if (space.home === "independent" && (space.political !== space.home && space.political !== "" && space.political)) { return 1; }

	      // captured non-allied home
	      if (space.home !== space.political && space.political !== "") {
		if (!space.besieged) {
	          if (!his_self.areAllies(space.home, space.political)) { 
		    if (space.home !== "" && space.political !== "") { return 1; }
		  }
	        }
	      }

	      // electorate under hapsburg control
	      if (his_self.game.state.events.schmalkaldic_league == 1) {
		if (his_self.isElectorate(space.key)) {
		  if (his_self.isSpaceControlled(space.key, "hapsburg")) { return 1; }
		}
	      }

	      return 0;
	    },

	    function(spacekey) {
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

          his_self.updateLog(his_self.returnFactionName(faction) + " plays " + his_self.popup("071") + " against " + spacekey);

	  let hits = 0;
	  for (let i = 0; i < 5; i++) {
	    let roll = his_self.rollDice(6);
	    if (roll >= 5) {
	      hits++;
	    }
	  }

	  //
	  // TODO, return zero and add choice of unit removal, for now remove army before navy
	  //
	  let p = his_self.returnPlayerOfFaction(respondent);

console.log("HITS: " + hits);

	  if (his_self.game.player == p) {
	    his_self.addMove("finish-city-state-rebels\t"+faction+"\t"+respondent+"\t"+spacekey);
	    his_self.playerAssignHits(faction, spacekey, hits, 1);
	  }
	  
	  return 0;
        }


	if (mv[0] === "finish-city-state-rebels") {

	  let faction    = mv[1];
	  let respondent = mv[2];
	  let spacekey   = mv[3];
	  let space      = his_self.game.spaces[spacekey];

	  // do land or naval units remain
	  let anything_left = 0; 
	  for (let i = 0; i < space.units[respondent].length; i++) {
	    if (!space.units[respondent][i].personage) { anything_left = 1; }
	  }

	  if (!anything_left) {
            for (let i = 0; i < space.units[f].length; i++) {
              his_self.captureLeader(faction, respondent, spacekey, space.units[f][i]);
              space.units[f].splice(i, 1);
              i--;
            }
          }

	  let who_gets_control = his_self.returnAllyOfMinorPower(space.home);
	  space.political = who_gets_control;

	  // add 1 regular - to home minor ally if needed
          his_self.addRegular(space.home, space.key, 1);

	  return 1;
	}

	return 1;

      },
    }
    deck['072'] = { 
      img : "cards/HIS-072.svg" , 
      name : "Cloth Price Fluctuate" ,
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

          his_self.game.queue.push("hand_to_fhand\t1\t"+p1+"\t"+"england");
          his_self.game.queue.push("DEAL\t1\t"+p1+"\t"+1);

          his_self.game.queue.push("hand_to_fhand\t1\t"+p2+"\t"+"hapsburg");
          his_self.game.queue.push("DEAL\t1\t"+p2+"\t"+1);

	} else {

          his_self.game.queue.push("cloth-prices-fluctuate-option2\t"+faction);

	}
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "cloth-prices-fluctuate-option1") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (faction === "ottoman") {

	    //
	    // place 2 cavalry in home space not under siege
	    //
	    his_self.playerSelectSpaceWithFilter(
	      "Select Home Space not under Siege",
	      function(space) {
	        if (space.besieged) { return 0; }
	        if (his_self.isSpaceControlled(space, faction)) { return 1; }
	        return 0;
	      },
	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"cavalry"+"\t"+spacekey);
	        his_self.endTurn();
	      }
	    );

	  } else {

	    //
	    // place 2 mercenaries in home space not under siege
	    //
	    his_self.playerSelectSpaceWithFilter(
	      "Select Home Space not under Siege",
	      function(space) {
	        if (space.besieged) { return 0; }
	        if (his_self.isSpaceControlled(space, faction)) { return 1; }
	        return 0;
	      },
	      function(spacekey) {
	        let space = his_self.game.spaces[spacekey];
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
                his_self.addMove("build\tland\t"+faction+"\t"+"mercenary"+"\t"+spacekey);
	        his_self.endTurn();
	      }
	    );
	  }
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
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
        if (his_self.game.player == 0) {

	  let mp = his_self.returnMinorPowers();
	  let ca = [];
	  let cd = [];

	  for (let i = 0; i < mp.length; i++) {
	    if (his_self.canFactionActivateMinorPower(faction, mp[i])) {
	      if (his_self.returnAllyOfMinorPower(mp[i]) == faction) {
	        ca.push(mp[i]);
	      } else {
	        cd.push(mp[i]);
	      }
	    }
	  }
	
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
        if (his_self.game.player == 0) {

	  // deal 2 cards to faction
	  his_self.game_queue.push("diplomatic-overturn\t"+faction);
          his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
          his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
          his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "diplomatic-overturn") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let p = his_self.returnPlayerOfFaction(faction);

	  if (his_self.game.player == p) {

	    his_self.playerSelectFactionWithFilter(
	      "Select Faction to Give Card",
	      function(f) { if (f !== faction) { return 1; } },
	      function(recipient) {
 	        his_self.playerFactionSelectCardWithFilter(
	          faction,
	          "Select Card to Give Away",
	          function(card) { return 1; },
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
      canEvent : function(his_self, faction) { if (faction == "protestant") { return 0; } return 1; },
      onEvent : function(his_self, faction) {

	his_self.updateStatus(his_self.returnFactionName(faction) + " playing "+ his_self.popup("076"));
	let player = his_self.returnPlayerOfFaction(faction);
	if (his_self.game.player == player) {
  	  his_self.playerPlayOps("", faction, 4, "build");
	}

	return 0;
      },
    }
    deck['077'] = { 
      img : "cards/HIS-077.svg" , 
      name : "Card" ,
      ops : "Fountain of Youth" ,
      turn : 2 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
      
        his_self.game.queue.push("cards_left\t"+faction+"\t"+(parseInt(his_self.game.state.cards_left[faction])+2));
        his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
        his_self.game.queue.push("DEAL\t1\t"+p+"\t"+1);
        his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+faction);
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
		!his_self.isOccupied(space)
	      ) {
		return 1;
	      }
	      return 0;
	    },
	    function(spacekey) {

	      space1 = spacekey;

              his_self.playerSelectSpaceWithFilter(
	        "Select 1st Unoccupied French Home Space: ",
	        function(space) {
	          if (
	  	    space.home === "france" &&
	  	    space.key != space1 &&
		    !his_self.isOccupied(space)
	          ) {
		    return 1;
	          }
	          return 0;
	        },
		function(spacekey2) {

		  space2 = spacekey2;
		  his_self.addMove("unrest\t"+space1);
		  his_self.addMove("unrest\t"+space2);
		  his_self.endTurn();

		}
	      );
	    },
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
    deck['082'] = { 
      img : "cards/HIS-082.svg" , 
      name : "Janissaries Rebel" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let at_war = false;
	let f = his_self.returnImpulseOrder();
	for (let i = 0; i < f.length; i++) {
	  if (f[i] !== "ottoman") {
	    if (his_self.areEnemies(f[1], "ottoman")) {
	      at_war = true;
	    }
	  }
	}

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.game.spaces[spacekey].home !== "ottoman") { return 0; }
	    if (his_self.game.spaces[spacekey].unrest) { return 0; }
	    if (his_self.isOccupied(his_self.game.spaces[spacekey])) { return 0; }
	    return 1;
	  });

	  let spaces_to_select = 4;
	  if (at_war) { spaces_to_select = 2; }

	  his_self.playerSelectOptions(res, spaces_to_select, false, (selected) => {
	    alert("SELECTED SPACES FOR UNREST: " + JSON.stringify(selected));
	    for (let i = 0; i < selected.length; i++) {
	      his_self.addMove("unrest\t"+selected[i]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['083'] = { 
      img : "cards/HIS-083.svg" , 
      name : "John Zapolya" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	//
	//
	//
	if (his_self.game.spaces["buda"].besieged) {

	} else {

	  //
	  //
	  //
	  if (his_self.game.spaces["buda"].political === "" || his_self.game.spaces["buda"].political === "hungary") {
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.events.barbary_pirates) { return 1; }
	return 0;
      },
      onEvent : function(his_self, faction) {
alert("NOT IMPLEMENTED: need to connect this with actual piracy for hits-scoring");
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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

	//
	// protestant player gets 5 Reformation Attempts
	//
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
	      his_self.addMove("mercendaries-demand-pay\t"+target+"\t"+faction);
	      ahis_self.endTurn();
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

	  if (player == his_self.game.player) {

            his_self.playerFactionSelectCardWithFilter(

	      target,

	      "Select Card to Discard: ",

	      function(card) {
		let c = his_self.game.deck[0].cards[card];
	        if (c.type === "mandatory") { return 0; }
		return 1;
	      },

	      function(card) {

		let c = his_self.game.deck[0].cards[card].ops;	      

  	  	his_self.game.queue.push("discard\t"+faction+"\t"+card);

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
	      }
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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

	  if (his_self.game.player == his_self.returnPlayerOfFaction(faction)) {

	    //
	    // pick unit on map with player land units and select one to remove
	    //
 	    his_self.playerSelectSpaceWithFilter(

	      `Select Space to Add Unrest / #${num}`,

	      (space) => {
	        if (his_self.isOccupied(space.key)) { return 0; }
	        if (his_self.game.spaces[space.key].language == "german") { return 1; }
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

	let p = his_self.returnPlayerOfFaction(faction);

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
	  for (let ii = 0; ii < his_self.game.state.players_info[i].captured.length; ii++) {
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
	      captured_leaders.push({ leader : his_self.game.state.players_info[i].captured[ii].type , player : i , idx : ii });
	      options.push(his_self.game.state.players_info[i].captured[ii].type);
	    } 	
	  }	

	  his_self.playerSelectOptions("Select a Captured Leader: ", options, false, (selected) => {
	    if (selected.length == 0) {
	      his_self.endTurn();
	      return;
	    }
	    his_self.addMove("random\t"+selected[0]);
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
	        randomed_leader = his_self.game.state.players_info[i].captured[ii];
		his_self.game.state.players_info[i].captured.splice(ii, 1);
	      }
	    } 	
	  }	

	  if (ransomed_leader === null) { return; }

	  let player = his_self.returnPlayerOfFaction(ransomed_leader.owner);
	  if (player == his_self.game.player) {

            his_self.playerFactionSelectSpaceWithFilter(

	      ransomed_leader.owner,

	      "Select Fortified Home Space: ",

	      function(spacekey) {
		if (his_self.game.spaces[spacekey].type == "fortress" && his_self.game.spaces[spacekey].home == ransomed_leader.owner) {
		  return 1;
		}
		return 0;
	      },

	      function(space) {
		his_self.addMove("ransom_placement\t"+ransomed_leader.owner+"\t"+space.key);
		his_self.endTurn();
	      }
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
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);

        his_self.game.state.events.revolt_in_egypt = 1;

	his_self.game.queue.push("revolt_in_egypt");

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_egypt_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "ottoman";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		3,

		true,

		(selected) => {
		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"egypt" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		  }
		  his_self.endTurn();
		}
	    );
	  }
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
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);
        his_self.addRegular("independent", "egypt", 1);

        his_self.game.state.events.revolt_in_ireland = 1;

	if (faction === "france" || faction === "hapsburg") {
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player == p) {
	    his_self.addMove("revolt_in_ireland_placement");
	    his_self.addMove("revolt_in_ireland_bonus_resistance\t"+faction);
	    his_self.endTurn();
	  }
	  return 0;
	}

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "revolt_in_ireland_bonus_resistance") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];

	  let p = his_self.returnPlayerOfFaction(faction);

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

              if (action === "yes") {
		
		//
		// pick unit on map with player land units and select one to remove
		//
 	 	his_self.playerSelectSpaceWithFilter(

		  "Select Space to Remove 1 Land Unit",

		  (space) => { return his_self.returnFactionLandUnitsInSpace(faction, space.key); },

		  (spacekey) => {
		    
      		    let opts = his_self.returnFactionLandUnitsInSpace(faction, spacekey);
		    let space = his_self.game.spaces[spacekey];

            	    let msg = "Remove which Land Unit?";
            	    let html = '<ul>';

		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "cavalry") {
   	                html += '<li class="option" id="${i}">cavalry</li>';
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "regular") {
   	                html += '<li class="option" id="${i}">regular</li>';
			break;
		      }
		    }
		    for (let i = 0; i < space.units[faction].length; i++) {
		      if (space.units[faction][i].type === "mercenary") {
   	                html += '<li class="option" id="${i}">mercenary</li>';
			break;
		      }
		    }

            	    html += '</ul>';


            	    his_self.updateStatusWithOptions(msg, html);

	            $('.option').off();
        	    $('.option').on('click', function () {

	              let action = $(this).attr("id");

		      his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					faction + "\t" +
					space.units[faction][i].type + "\t" +
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


        if (mv[0] == "revolt_in_ireland_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "england";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		4,

		true,

		(selected) => {

		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"ireland" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		    his_self.addMove("remove_unit\t");
		  }
		  his_self.endTurn();
		}
	    );
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
	    if (his_self.game.spaces[spacekey].language == "spanish") { return 1; }
	    return 0;
	  });

	  let spaces_to_select = 3;

	  his_self.playerSelectOptions(res, spaces_to_select, false, (selected) => {
	    alert("SELECTED SPACES FOR UNREST: " + JSON.stringify(selected));
	    for (let i = 0; i < selected.length; i++) {
	      his_self.addMove("unrest\t"+selected[i]);
	    }
	    his_self.endTurn();
	  });
	}

	return 0;
      },
    }
    deck['095'] = { 
      img : "cards/HIS-095.svg" , 
      warn : ["papacy"] ,
      name : "Sack of Rome" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['096'] = { 
      img : "cards/HIS-096.svg" , 
      name : "Sale of Moluccas" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['097'] = { 
      img : "cards/HIS-097.svg" , 
      name : "Scots Raid" ,
      ops : 2 ,
      turn : 3 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['098'] = { 
      img : "cards/HIS-098.svg" , 
      name : "Search for Cibola" ,
      ops : 2 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['099'] = { 
      img : "cards/HIS-099.svg" , 
      name : "Sebastian Cabot" ,
      ops : 1 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
      onEvent : function(his_self, faction) {
	return 0;
      },
    }
    deck['101'] = { 
      img : "cards/HIS-101.svg" , 
      name : "Smallpox" ,
      ops : 4 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['102'] = { 
      img : "cards/HIS-102.svg" , 
      name : "Spring Preparations" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) { return 0; },
      menuOption  :       function(his_self, menu, player) {
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
          html += '<li class="option" id="brandon">Charles Brandon</li>';
          html += '<li class="option" id="duke">Duke of Alva</li>';
          html += '<li class="option" id="montmorency">Montmorency</li>';
          html += '<li class="option" id="pasha">Ibrahim Pasha</li>';
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

	  let leader = mv[1];
	  let faction = "";

	  if (leader === "brandon") 	{ leader = "charles-brandon"; faction = "england"; }
	  if (leader === "duke") 	{ leader = "duke-of-alva"; faction = "hapsburg"; }
	  if (leader === "montmorency") { leader = "montmorency"; faction = "france"; }
	  if (leader === "pasha") 	{ leader = "ibrahim-pasha"; faction = "ottoman"; }

	  let r = his_self.rollDice(6);

	  let idx = -1;
	  let s = his_self.returnSpaceOfPersonage(faction, leader);
	  if (s) { idx = his_self.returnIndexOfPersonageInSpace(faction, leader, s); }

	  //
	  // removed from game
	  //
	  if (r >= 4) {

	    s.units[faction].splice(idx, 1);
	    his_self.displaySpace(s.key);

	  //
	  // temporarily removed from game
	  //
	  } else {

            if (s !== "") {
              idx = his_self.returnIndexOfPersonageInSpace(faction, reformer, s);
            }

            let obj = {};
            obj.space = s;
            obj.faction = faction;
            obj.leader = his_self.game.state.spaces[s].units[faction][idx];

            if (idx != -1) {
              s.units[faction].splice(idx, 1);
            }

            his_self.game.state.military_leaders_removed_until_next_round.push(obj);

	    his_self.displaySpace(s.key);

            return 1;

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
	if (his_self.game.state.events.schmalkaldic_league != 1 && faction == "protestant") { return 0; }
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

console.log("TESTING: " + JSON.stringify(space.units));

	      for (let key in space.units) {
		for (let i = 0; i < space.units[key].length; i++) {
		  if (space.units[key][i].besieged == 0) {
		    attacker = space.units[key][i].owner;
		    if (attacker == "protestant" || attacker == "papacy" || attacker == "hapsburg" || attacker == "ottoman" || attacker == "england" || attacker == "france") { break; }
		  }
		}
	      }

	      if (attacker != "") {
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

	  if (total_defenders < total_attackers) {
	    his_self.game.queue.push(`control\t${attacker}\t${spacekey}`);
	    his_self.updateLog(his_self.popup("105") + " - besiegers capture defenders and control space");
	    for (let i = 0; i < defenders.length; i++) {
	      his_self.game.queue.push(`purge_units_and_capture_leaders\t${defenders[i]}\t${attacker}\t${spacekey}`);
	    }
	  }

          his_self.game.queue.splice(qe, 1);
	  
	}

        return 1;
      },
    }
    deck['106'] = { 
      img : "cards/HIS-106.svg" , 
      name : "Unpaid Mercenaries" ,
      ops : 4 ,
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
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

 		$('.option').off();
	  	$('.option').on('click', function () {

 		  $('.option').off();
	    	  let action = $(this).attr("id");

		  for (let z = his_self.game.spaces[spacekey].units[action].length-1; z >= 0; z--) {
		    his_self.addMove(`destroy_unit_by_index\t${action}\t${spacekey}\t${z}`);
		  }
		  his_self.endTurn();
		});

	      } else {
		for (let z = his_self.game.spaces[spacekey].units[factions[0]].length-1; z >= 0; z--) {
		  his_self.addMove(`destroy_unit\t${factions[0]}\t${spacekey}\t${z}`);
		}
		his_self.endTurn();
	      }
            }
          );

          return 0;
        }
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
    	        html += '</ul>';

                his_self.updateStatusWithOptions(msg, html);

 		$('.option').off();
	  	$('.option').on('click', function () {

 		  $('.option').off();
	    	  let action = $(this).attr("id");

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
		    if (u.type == "regular" && regulars_to_delete > 0) {
		      his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		      regulars_to_delete--;
		    }
		    if (u.type != "regular" && nonregulars_to_delete > 0) {
		      his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		      nonregulars_to_delete--;
		    }
		  }
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
		  if (u.type == "regular" && regulars_to_delete > 0) {
		    his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		  }
		  if (u.type != "regular" && nonregulars_to_delete > 0) {
		    his_self.addMove(`destroy_unit_by_type\t${action}\t${spacekey}\t${u.type}`);
		    nonregulars_to_delete--;
		  }
		}
		his_self.endTurn();
	      }
            },

	    null,

	    true
          );

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

console.log("SHARE HAND CARDS: " + JSON.stringify(cards));
	  his_self.deck_overlay.render("Venetian Informant", cards);
          
          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);
          
          if (his_self.game.player == p1) {

	    for (let i = 0; i < cards.length; i++) {
	      his_self.updateLog(his_self.returnFactionName(faction_giving) + ": " + his_self.popup(cards[i]));
	    }
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
        return 1;
      },
      onEvent(his_self, faction) {

        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);
        his_self.addRegular("independent", "persia", 1);

        his_self.game.state.events.war_in_persia = 1;

	his_self.game.queue.push("war_in_persia_placement");

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "war_in_persia_placement") {

          his_self.game.queue.splice(qe, 1);

	  let faction = "ottoman";
	  let p = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.player === p) {

	    his_self.playerSelectUnitsWithFilterFromSpacesWithFilter(

		faction,

		(space) => {
		  return his_self.returnFactionLandUnitsInSpace(faction, space);
		},

		(unit) => {
		  if (unit.type == "mercentary") { return 1; };
		  if (unit.type == "cavalry") { return 1; };
		  if (unit.type == "regular") { return 1; };
		  return 0;
		},

		5,

		true,

		(selected) => {
		  for (let i = 0; i < selected.length; i++) {
		    his_self.addMove(	"build" + "\t" +
					"land" + "\t" + 
					selected[i].type + "\t" +
					"persia" + "\t" );
		    his_self.addMove(	"remove_unit" + "\t" +
					"land" + "\t" +
					"england" + "\t" +
					selected[i].type + "\t" +
					selected[i].spacekey );
		  }
		  his_self.endTurn();
		}
	    );
	  }
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
    }
    deck['112'] = { 
      img : "cards/HIS-112.svg" , 
      name : "Thomas More" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
	  if (s.language == "italian") {

    	    let hp = his_self.returnPlayerOfFaction("hapsburg");
  	    let pf = his_self.returnPlayerOfFaction(faction);

	    his_self.game.queue.push("hand_to_fhand\t1\t"+hf+"\t"+"hapsburg");
            his_self.game.queue.push(`DEAL\t1\t${hf}\t1`);
	    if (faction !== "hapsburg") {
	      his_self.game.queue.push("hand_to_fhand\t1\t"+pf+"\t"+faction);
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
      canEvent : function(his_self, faction) { return 1; },
      onEvent : function(his_self, faction) {

	if (his_self.areAllies("ottoman", "france")) {

  	  let fp = his_self.returnPlayerOfFaction("france");
  	  let op = his_self.returnPlayerOfFaction("ottoman");

	  his_self.game.queue.push("hand_to_fhand\t1\t"+op+"\t"+"ottoman");
          his_self.game.queue.push(`DEAL\t1\t${op}\t1`);
	  his_self.game.queue.push("hand_to_fhand\t1\t"+op+"\t"+"france");
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['116'] = { 
      img : "cards/HIS-116.svg" , 
      name : "Rough Wooing" ,
      ops : 3 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }


    //
    // cards removed from 2P game
    //
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

    //
    // TO REQUIRES CODING
    //
    delete deck["095"];
    delete deck["112"];
    delete deck["115"];
    delete deck["116"];

    for (let key in deck) {
      deck[key].key = key;
      deck[key] = this.addEvents(deck[key]);
      if (!deck[key].warn) { deck[key].warn = []; }
    }









    return deck;

  }


