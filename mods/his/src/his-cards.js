
  returnNewCardsForThisTurn(turn = 1) {

    let deck = this.returnDeck();
    let new_deck = {};

    for (let key in deck) {
      if (deck[key].turn === turn) {
	new_deck[key] = deck[key];
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
      onEvent : function(his_self, faction) {

	if (faction === "papacy") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "papacy") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("papacy", "genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tpapacy");
	  }

	}

	if (faction === "protestant") {

          let f = his_self.returnAllyOfMinorPower("genoa");
	  if (f != "france") {
            his_self.deactivateMinorPower(f, "genoa");
            his_self.activateMinorPower("france", "genoa");
	  } else {
	    his_self.game.queue.push("andrea_dorea_placement\tprotestant");
	  }

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "andrea_doria_placement") {

	  let faction = mv[1];
          his_self.game.queue.splice(qe, 1);

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
            }
          );

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
	      his_self.addMove("french_constable_invades\t"+spacekey);
	      his_self.addMove("hand_to_fhand\t1\t"+p+"\t"+"protestant");
              his_self.addMove(`DEAL\t1\t${p}\t1`);
              his_self.addMove("add_army_leader\tfrance\t"+spacekey+"\tmontmorency");
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
          );

          return 0;

	}

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_constable_invades") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

 	  let msg = "Choose Option:";
          let html = '<ul>';
          html += '<li class="option" id="squadron">1 squadron in French home port</li>';
          html += '<li class="option" id="mercenaries">2 more mercenaries in '+spacekey+'</li>';
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");
	    if (action === "squadron") {

              his_self.playerSelectSpaceWithFilter(

                "Select French Home Port",

                function(space) {
                  if (space.ports.length > 0 && space.home == "french") {
                    return 1;
                  }
                },

                function(spacekey) {
                  his_self.addMove("build\tland\tfrench\t"+"squadron"+"\t"+spacekey);
                  his_self.endTurn();
                }

              );
	    }
	    if (action === "mercenaries") {
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
	    }

	  });

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
      onEvent : function(his_self, faction) {
alert("Corsair Raid");
        return 1;
      },
    }
    deck['204'] = { 
      img : "cards/HIS-204.svg" , 
      name : "Diplomatic Marriage" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
    deck['205'] = { 
      img : "cards/HIS-205.svg" , 
      name : "Diplomatic Pressure" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Diplomatic Pressure");
      },
    }
    deck['206'] = { 
      img : "cards/HIS-206.svg" , 
      name : "French Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
            }
          );

	}

        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "french_invasion") {

	  let spacekey = mv[1];
          his_self.game.queue.splice(qe, 1);

 	  let msg = "Choose Option:";
          let html = '<ul>';
          html += '<li class="option" id="squadron">1 squadron in French home port</li>';
          html += '<li class="option" id="mercenaries">2 more mercenaries in '+spacekey+'</li>';
    	  html += '</ul>';

          his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    let action = $(this).attr("id");
	    if (action === "squadron") {

              his_self.playerSelectSpaceWithFilter(

                "Select French Home Port",

                function(space) {
                  if (space.ports.length > 0 && space.home == "french") {
                    return 1;
                  }
                },

                function(spacekey) {
                  his_self.addMove("build\tland\tfrench\t"+"squadron"+"\t"+spacekey);
                  his_self.endTurn();
                }

              );
	    }
	    if (action === "mercenaries") {
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\tfrance\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
	    }

	  });

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
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['208'] = { 
      img : "cards/HIS-208.svg" , 
      name : "Knights of St. John" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	his_self.game.queue.push("knights-of-saint-john\t"+faction);
	his_self.game.queue.push("hand_to_fhand\t1\t"+p+"\t"+"faction");
        his_self.game.queue.push(`DEAL\t1\t${p}\t1`);

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "knights-of-saint-john") {

          his_self.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (player == his_self.game.player) {

            let fhand_idx = his_self.returnFactionHandIdx(player, extra);
	    let card = his_self.game.deck[0].cards[his_self.game.deck[0].hand[his_self.game.deck[0].hand[fhand_idx].length-1]];
	    let ops = card.ops;

	    his_self.addMove("NOTIFY\t"+faction+" pulls "+card.name+" - "+ops +" CP");
	    his_self.addMove("build_saint_peters_with_cp\t"+ops);
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
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['210'] = { 
      img : "cards/HIS-210.svg" , 
      name : "Shipbuilding" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['211'] = { 
      img : "cards/HIS-211.svg" , 
      name : "Spanish Invasion" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {
alert("Not Implemented");
      },
    }
    deck['212'] = { 
      img : "cards/HIS-212.svg" , 
      name : "Venetian Alliance" ,
      ops : 0 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let ally = his_self.returnAllyOfMinorPower("venice");

	if (ally == "") {
	  his_self.activateMinorPower("papacy", "venice");
	}
	if (ally == "hapsburg") {
	  his_self.deactivateMinorPower("hapsburg", "venice");
	}
        if (ally === "papacy") {
	  his_self.game.queue.push("venetian_alliance_placement");
	}

	return 1;

      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "venetian_alliance_placement") {

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
              his_self.addMove("add_army_leader\tpapacy\t"+spacekey+"\tferdinand");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
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
              his_self.addMove("add_army_leader\tpapacy\t"+spacekey+"\tcharles-v");
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
	      his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.addMove("build\tland\thapsburg\t"+"mercenary"+"\t"+spacekey);
              his_self.endTurn();
            }
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
    }
    deck['216'] = { 
      img : "cards/HIS-216.svg" , 
      name : "Ottoman Invasion" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");
	his_self.setEnemies("ottoman", "papacy");

	if (his_self.game.player == p) {

          his_self.playerSelectSpaceWithFilter(

            "Select Ottoman-Controlled Port",

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
            }
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
    }
    deck['218'] = { 
      img : "cards/HIS-218.svg" , 
      name : "Siege of Vienna" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['219'] = { 
      img : "cards/HIS-219.svg" , 
      name : "Spanish Inquisition" ,
      ops : 0 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }


  removeCardFromGame(card) {
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
              break;
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
	  his_self.updateLog("Ottoman Empire plays Janissaries");
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
    }
    deck['004'] = { 
      img : "cards/HIS-004.svg" , 
      name : "Patron of the Arts" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      faction : "french" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	if (his_self.game.state.leaders.francis_i == 1) {
	  if (!his_self.isCaptured("france", "francis-i")) { return 1; }
	}
	return 0;
      },
      onEvent : function(his_self, faction) {
	his_self.game.queue.push("patron-of-the-arts");
	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "patron-of-the-arts") {

          his_self.game.queue.splice(qe, 1);

	  let roll = his_self.rollDice(6);

	  his_self.updateLog("France rolls " + roll + " for Patron of the Arts");

	  if (his_self.isSpaceControlled("milan", "france")) {
	    his_self.updateLog("French control Milan - roll adjusted to 6");
	    roll = 6;
	  };

	  //
	  // France wins 1 VP
	  //
	  if (roll >= 3) {
	    if (his_self.game.state.french_chateaux_vp < 6) {
	      his_self.updateLog("SUCCESS: France gains 1VP from Patron of the Arts");
	      his_self.game.state.french_chateaux_vp++;
              his_self.displayVictoryPoints();
	    }
	  }

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

            let msg = "Select Protestant Reformer:";
	    let reformer_exists = 0;
            let html = '<ul>';
	    for (let key in his_self.reformers) {
console.log("key is: " + key);
console.log(JSON.stringify(his_self.reformers[key]));
	      let s = his_self.returnSpaceOfPersonage("protestant", key);
	      if (s) {
	        reformer_exists = 1;
                html += `<li class="option" id="${key}">${his_self.game.reformers[key].name}</li>`;
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
console.log("key is: " + key);
console.log(JSON.stringify(his_self.reformers[key]));
	      let s = his_self.returnSpaceOfPersonage("protestant", key);
	      if (s) {
		reformer_exists = 1;
                html += `<li class="option" id="${key}">${his_self.game.reformers[key].name}</li>`;
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

          his_self.updateStatusWithOptions(msg, html);

          $('.option').off();
          $('.option').on('click', function () {

            let language_zone = $(this).attr("id");

            let msg = "Leigzip Debate Format?";
            let html = '<ul>';
            html += '<li class="option" id="select">Pick My Debater</li>';
            if (1 < his_self.returnDebatersInLanguageZone(language_zone, "protestant", 1)) {
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
		  if (d.faction === "papacy") {
            	    html += `<li class="option" id="${i}">${d.name}</li>`;
		  }
		}
		html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
  
                $('.option').off();
                $('.option').on('click', function () {
                  let selected_papal_debater = $(this).attr("id");
	          his_self.addMove("theological_debate");
        	  his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	          his_self.addMove("SETVAR\tstate\ttheological_debate\tselected_papal_debater\t"+selected_papal_debater);
	          his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted");
		  his_self.endTurn();
		});
	
	      } else {

                let msg = "Prohibit Protestant Debater:";
                let html = '<ul>';
		for (let i = 0; i < his_self.game.state.debaters.length; i++) {
		  let d = his_self.game.state.debaters[i];
		  if (d.faction !== "papacy" && d.language_zone === language_zone) {
            	    html += `<li class="option" id="${i}">${d.name}</li>`;
		  }
		}
		html += '</ul>';
                his_self.updateStatusWithOptions(msg, html);
  
                $('.option').off();
                $('.option').on('click', function () {
                  let prohibited_protestant_debater = $(this).attr("id");
	          his_self.addMove("theological_debate");
        	  his_self.addMove("counter_or_acknowledge\tPapacy calls a theological debate\tdebate");
        	  his_self.addMove("RESETCONFIRMSNEEDED\tall");
	          his_self.addMove("SETVAR\tstate\ttheological_debate\tprohibited_protestant_debater\t"+prohibited_protestant_debater);
	          his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted");
		  his_self.endTurn();
		});
	
	      }
	    });
	  });

	} else {
	  his_self.updateStatus("Papacy calling a Theological Debate");
	}

	return 0;
      },

    }

    deck['007'] = { 
      img : "cards/HIS-007.svg" , 
      name : "Here I Stand" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      faction : "protestant" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
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
            html += '<li class="option" id="${key}">${his_self.game.deck[0].cards[key].name}</li>';
	  }
          html += '</ul>';

    	  his_self.updateStatusWithOptions(msg, html);

	  $('.option').off();
	  $('.option').on('click', function () {

	    $('.option').off();
	    let card = $(this).attr("id");

	    let msg = "Play or Hold Card? ";
            let html = '<ul>';
            html += '<li class="option" id="play}">play card</li>';
            html += '<li class="option" id="hold}">hold card</li>';
            html += '</ul>';

            his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {

	      $('.option').off();
	      let action = $(this).attr("id");

	      if (action == "play") {

		his_self.addMove("card\tprotestant\t"+card);
		his_self.addMove("here_i_stand_event\t"+card);
		his_self.endTurn();

	      } else {

		his_self.addMove("here_i_stand_event\t"+card);
		his_self.endTurn();

	      }

	    });
	  });
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
	  if (his_self.game.state.leaders.luther == 1) {
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
	  his_self.addMove("NOTIFY\tHere I Stand played to substitute Luther into the Theological Debate");
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
              let fhand_idx = this.returnFactionHandIdx(p, faction);
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

	  //
	  // second option -- only possible if Wartburg not in-play
	  //
	  if (his_self.game.state.events.wartburg == 0) {

	    his_self.updateLog("Luther accepts the Debate Challenge - Here I Stand");


	    //
	    // existing protestant debater is committed, but de-activated (bonus does not apply)
	    //
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      let d = his_self.game.state.debaters[i];
	      if (his_self.game.state.theological_debate.attacker === "papacy") {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_defender_debater) {
	  	    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_defender_debater) {
		    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      } else {
	        if (his_self.game.state.theological_debate.round == 1) {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round1_attacker_debater) {
		    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        } else {
	          if (his_self.game.state.debaters[i].key === his_self.game.state.theological_debate.round2_attacker_debater) {
		    his_self.commitDebater(d.key);
	  	    his_self.deactivateDebater(d.key);
	          }
	        }
	      }
	    }


	    let is_luther_committed = 0;
	    for (let i = 0; i < his_self.game.state.debaters.length; i++) {
	      if (his_self.game.state.debaters[i].key === "luther-debater") {
		if (his_self.game.state.debaters[i].committed == 1) { is_luther_commited = 1; }
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
                his_self.game.state.theological_debate.defender_debater_power = 4;
	      } else {
                his_self.game.state.theological_debate.round2_attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.attacker_debater = "luther-debater";
                his_self.game.state.theological_debate.defender_debater_power = 4;
	      }
	    }
	  }

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
	his_self.game.state.tmp_protestant_reformation_bonus = 2;
	his_self.game.state.tmp_protestant_reformation_bonus_spaces = [];
	his_self.game.state.tmp_catholic_reformation_bonus = 0;
	his_self.game.state.tmp_catholic_reformation_bonus_spaces = [];
	his_self.game.state.tmp_reformations_this_turn = [];

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
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addUnit("protestant", "wittenberg", "regular");
        his_self.addReformer("protestant", "wittenberg", "luther-reformer");
        his_self.displaySpace("wittenberg");

	return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "catholic_counter_reformation") {

          let player = parseInt(mv[1]);
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }
          his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
	        space.religion === "protestant" &&
	        (space.language === language_zone || language_zone == "all") &&
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


	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

            his_self.playerSelectSpaceWithFilter(

	      "Select Counter-Reformation Attempt",

	      //
	      // protestant spaces adjacent to catholic 
	      //
	      function(space) {
		if (
		  space.religion === "protestant" &&
		  (space.language === language_zone || language_zone == "all") &&
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
	  	his_self.updateStatus("Counter-Reformation attempt in "+spacekey);
		his_self.addMove("counter_reformation\t"+spacekey+"\t"+language_zone);
		let name = his_self.game.spaces[spacekey].name;
		his_self.addMove("counter_or_acknowledge\tCounter-Reformation Attempt in "+spacekey+"\tcatholic_counter_reformation\t"+name);
        	his_self.addMove("RESETCONFIRMSNEEDED\tall");
		his_self.endTurn();
	      },

	      null, // cancel func

	      1     // permit board clicks

	    );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tCatholic Counter-Reformation - no valid targets");
	      his_self.endTurn();
	    }
	  } else {
	    his_self.updateStatus("Catholic Counter-Reformation in Process");
	  }

          return 0;

        }

        if (mv[0] == "protestant_reformation") {

          let player = parseInt(mv[1]);
          let language_zone = "german";
	  if (mv[2]) { language_zone = mv[2]; }
          his_self.game.queue.splice(qe, 1);

	  let target_spaces = his_self.countSpacesWithFilter(
	    function(space) {
	      if (
		space.religion === "catholic" &&
		!his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		(space.language === language_zone || language_zone == "all") &&
		(
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

	  if (his_self.game.player == player) {
	    if (target_spaces > 0) {

            his_self.playerSelectSpaceWithFilter(

	      "Select Reformation Target",

	      //
	      // catholic spaces adjacent to protestant 
	      //
	      function(space) {
		if (
		  space.religion === "catholic" &&
		  !his_self.game.state.tmp_reformations_this_turn.includes(space.key) &&
		  (space.language === language_zone || language_zone == "all") &&
		  his_self.isSpaceAdjacentToReligion(space, "protestant")
	        ) {
		  return 1;
	        }
		return 0;
	      },

	      //
	      // launch reformation
	      //
	      function(spacekey) {
	  	his_self.updateStatus("Reformation attempt in "+spacekey);
		his_self.addMove("reformation\t"+spacekey+"\t"+language_zone);
		his_self.addMove("counter_or_acknowledge\tProtestant Reformation Attempt in "+spacekey+"\tprotestant_reformation\t"+spacekey);
        	his_self.addMove("RESETCONFIRMSNEEDED\tall");
		his_self.endTurn();
	      },

	      null ,

	      1     // permit board clicks

	    );
	    } else {
	      his_self.addMove("counter_or_acknowledge\tProtestant Reformation - no valid targets");
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
 	  his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+this.game.state.players_info[player-1].factions[faction_hand_idx]);
	  his_self.game.queue.push(`DEAL\t1\t${player}\t1`);
        }
	// three counter-reformation attempts
	his_self.game.queue.push(`counter_reformation_attempt\t${papacy}`);
	his_self.game.queue.push(`counter_reformation_attempt\t${papacy}`);
	his_self.game.queue.push(`counter_reformation_attempt\t${papacy}`);
	his_self.game.queue.push(`STATUS\tPapacy may make 3 counter-reformation attempts`);

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
 	    his_self.game.queue.push("hand_to_fhand\t1\t"+(player)+"\t"+this.game.state.players_info[player-1].factions[faction_hand_idx]);
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
        onEvent : function(his_self, faction) {
          his_self.game.state.events.schmalkaldic_league = 1;
          his_self.game.state.activated_powers["papacy"].push("hapsburg");
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
          his_self.game.state.events.schmalkaldic_league = 1;
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
      onEvent : function(his_self, faction) {

	let papacy = his_self.returnPlayerOfFaction("papacy");
	if (his_self.game.player === papacy) {
	  his_self.game.state.events.papacy_may_found_jesuit_universities = 1;
	  return 0;
	}

	return 0;
      }
    }
    deck['016'] = { 
      img : "cards/HIS-016.svg" , 
      name : "mandatory" ,
      ops : 2 ,
      turn : 6 ,
      type : "mandatory" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
      canEvent : function(his_self, faction) {
        return 1;
      },
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
	  his_self.council_of_trent_overlay.render("protestants");

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
      canEvent : function(his_self, faction) {
        return 1;
      },
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

console.log("leaders mary_i set");

	his_self.removeCardFromGame('019'); // remove edward_vi if still in deck

	let placed = 0;
	if (his_self.game.state.leaders.henry_viii == 1) {

console.log("henry_viii removed from power");
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

console.log("and down to here...");

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
      canEvent : function(his_self, faction) {
        return 1;
      },
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
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "pre_assault_hits_roll") {
          for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
            if (his_self.game.deck[0].fhand[i].includes('027')) {
              return 1;
            }
          }
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, faction) {
        if (menu == "pre_assault_hits_roll") {

          player = his_self.returnPlayerOfFaction(faction);
	  let space = his_self.game.spaces[his_self.game.state.assault.spacekey];
	  for (let f in his_self.game.state.assault.faction_map) {
            if (his_self.game.state.assault.faction_map[f] === his_self.game.state.assault.attacker_faction) {
alert("destroying mercenary units!");		
	      for (let z = 0; z < space.units[f].length; z++) {
		if (space.units[f][z].type === "mercenary") {
		  space.units[f].splice(z, 1);
		  z--;
alert("destroying 1 mercenary");
		}
	      }
            }       
          }             
        }
        return 1;
      },
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
          return { faction : f , event : '028', html : `<li class="option" id="028">siege mining (${f})</li>` };
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
          player = his_self.returnPlayerOfFaction(faction);
	  if (his_self.game.state.active_player === player) {
alert("Play Siege Mining");
	    his_self.game.state.players_info[player-1].tmp_roll_bonus = 3;
	  }
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
	  his_self.endTurn();
        }
        return 1;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "foul_weather") {

          let player = mv[1];
          let faction = mv[2];
          his_self.game.queue.splice(qe, 1);

	  his_self.updateLog(faction + " plays Foul Weather");

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

console.log("ASSAULT GOUT QUEUE: " + JSON.stringify(his_self.game.queue));

	  let f = "";
	  for (let i = 0; i < his_self.game.deck[0].fhand.length; i++) {
	    if (his_self.game.deck[0].fhand[i].includes('032')) {
	      f = his_self.game.state.players_info[his_self.game.player-1].factions[i];
	      break;
	    }
	  }
	  let includes_army_leader = false;

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
        if (menu == "move") {

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

          his_self.addMove(`gout\t${faction}\t${source}\t${unit_idx}`);
          his_self.endTurn();

        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "gout") {

	  let faction = mv[1];
	  let source = mv[2];
	  let unit_idx = parseInt(mv[3]);

	  his_self.game.spaces[source].units[faction][unit_idx].gout = true;
	  his_self.updateLog(his_self.game.spaces[source].units[faction][unit_idx].name + " has come down with gout");
          his_self.game.queue.splice(qe, 1);

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
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
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

        if (mv[0] == "landsknechts") {

          let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (faction === "hapsburg") {
            his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, "hapsburg",
	      function(space) {
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace("hapsburg", space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	      } ,
	      null ,
	      null ,
	      true
	    );
	  } else {
	    if (faction === "ottoman") {
              his_self.playerRemoveUnitsInSpaceWithFilter("mercenary", 2, faction,
	        function(space) {

//		  if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
//		  if (!his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 0; }
//		  if (!his_self.isSpaceFriendly(space.key)) { return 1; }

	        } ,
	        null ,
	        null ,
	        true
	      );

	    } else {
              his_self.playerPlaceUnitsInSpaceWithFilter("mercenary", 4, faction,
	        function(space) {
		  if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		  if (!his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 0; }
		  if (!his_self.isSpaceFriendly(space.key)) { return 1; }
	        } ,
	        null ,
	        null ,
	        true
	      );
	    }
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
    }
    deck['036'] = { 
      img : "cards/HIS-036.svg" , 
      name : "Swiss Mercenaries" ,
      ops : 1 ,
      turn : 1 ,
      type : "response" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
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
		if (!his_self.isSpaceUnderSeige(space.key)) { return 0; }
		if (!his_self.returnFriendlyLandUnitsInSpace(faction, space.key)) { return 0; }
		if (!his_self.isSpaceFriendly(space.key)) { return 1; }
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
	  
          return { faction : "protestant" , event : '037', html : `<li class="option" id="037">jwartburg (protestant)</li>` };
        }
        return {};
      },
      menuOptionTriggers:  function(his_self, menu, player, extra) {
        if (menu == "event") {
        }
        return 0;
      },
      menuOptionActivated:  function(his_self, menu, player, extra) {
        if (menu == "event") {
          his_self.addMove("wartburg");
	  his_self.endTurn();
	  his_self.updateStatus("wartburg acknowledge");
        }
        return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "wartburg") {

	  //
	  // 
	  //
	  his_self.game.state.events.wartburg = 1;
	  his_self.commitDebater("protestant", "luther-debater");

	  his_self.updateLog("Wartburg Updated!");
          his_self.game.queue.splice(qe, 1);

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
    }
    deck['039'] = { 
      img : "cards/HIS-039.svg" , 
      name : "Ausburg Confession" ,
      ops : 4 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['040'] = { 
      img : "cards/HIS-040.svg" , 
      name : "MachiaveIIi: The Prince" ,
      ops : 3 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
      ops : 5 ,
      turn : 3 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['044'] = { 
      img : "cards/HIS-044.svg" , 
      name : "Affair of the Placards" ,
      ops : 2 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['045'] = { 
      img : "cards/HIS-045.svg" , 
      name : "Clavin Expelled" ,
      ops : 1 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['046'] = { 
      img : "cards/HIS-046.svg" , 
      name : "Calvin's Insitutes" ,
      ops : 5 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['047'] = { 
      img : "cards/HIS-047.svg" , 
      name : "Copernicus" ,
      ops : 6 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      onEvent : function(his_self, faction) {

        let home_spaces = his_self.returnSpacesWithFilter(
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].home === faction) {
	    }
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

	//
	//
	//
	if (double_vp == 1) {

	  // faction will gain when counted
	  his_self.game.state.events.copernicus = faction;
	  his_self.game.state.events.copernicus_vp = 2;
	  his_self.displayVictoryTrack();

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

                his_self.addMove("discard_random\tprotestant\t1");
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
      onEvent : function(his_self, faction) {

	his_self.updateLog(faction + " gets 1 VP from Michael Servetus");
	his_self.game.state.events.michael_servetus = faction;
	his_self.game.queue.push("discard_random\tprotestant\t1");

      }
    }
    deck['052'] = { 
      img : "cards/HIS-052.svg" , 
      name : "Michelangelo" ,
      ops : 4 ,
      turn : 4 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
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
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['056'] = { 
      img : "cards/HIS-056.svg" , 
      name : "Ppal Inquistion" ,
      ops : 5 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['057'] = { 
      img : "cards/HIS-057.svg" , 
      name : "Philip of Hesse's Bigamy" ,
      ops : 2 ,
      turn : 5 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['058'] = { 
      img : "cards/HIS-058.svg" , 
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
      name : "Maurice of Saxony" ,
      ops : 4 ,
      turn : 6 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['061'] = { 
      img : "cards/HIS-061.svg" , 
      name : "Mary Defies Council" ,
      ops : 1 ,
      turn : 7 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['062'] = { 
      img : "cards/HIS-062.svg" , 
      name : "Card" ,
      ops : 2 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['063'] = { 
      img : "cards/HIS-063.svg" , 
      name : "Dissolution of the Monasteries" ,
      ops : 4 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['064'] = { 
      img : "cards/HIS-064.svg" , 
      name : "Pilgrimage of Grace" ,
      ops : 3 ,
      turn : 0 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
    }
    deck['065'] = { 
      img : "cards/HIS-065.svg" , 
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

	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
	his_self.game.queue.push("protestant_reformation\t"+player+"\tgerman");
        his_self.game.queue.push("ACKNOWLEDGE\tThe Protestants - A Mighty Fortress - 6 Reformation Attempts in German Zone");
	his_self.commitDebater("protestant", "luther-debater");

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
      name : "Anabaptists" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.selectPlayerOfFaction(faction);
	if (p == his_self.game.player) {
          his_self.playerSelectSpaceWithFilter(

	    "Select First Space to Convert", 

	    function(space) {
	      if (space.religion === "protestant" && his_self.isOccupied(space) == 0 && his_self.isElectorate(space)) {
		return 1;
	      }
	      return 0;
	    },

	    function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let first_choice = space.key;


              his_self.playerSelectSpaceWithFilter(

	        "Select Second Space to Convert", 

	        function(spacekey) {
	          if (spacekey !== first_choice && his_self.game.spaces[spacekey].religion === "protestant" && his_self.isOccupied(his_self.game.spaces[spacekey]) == 0 && his_self.isElectorate(spacekey)) {
		    return 1;
	          }
	          return 0;
	        },

	        function(space) {

	          let second_choice = space.key;

		  his_self.addMove("convert\t"+second_choice+"\tcatholic");
		  his_self.addMove("convert\t"+first_choice+"\tcatholic");
		  his_self.endTurn();

	        },
	      );
	    }
	  );
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
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Unbesieged Space You Control",

	    function(space) {
	      if (space.besieged) { return 0; }
	      if (his_self.isSpaceControlled(space, faction)) { return 1; }
	      return 0;
	    },

	    function(spacekey) {
	      let space = his_self.game.spaces[spacekey];
	      his_self.addMove("add_army_leader\t"+faction+"\t"+spacekey+"\t"+"renegade");
              his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+spacekey);
              his_self.addMove("build\tland\t"+faction+"\t"+"regular"+"\t"+spacekey);
	      his_self.endTurn();
	    }
	  );
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
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);

	if (p == his_self.game.player) {

	  his_self.playerSelectSpaceWithFilter(

	    "Select Space to Target",

	    function(space) {

	      // captured key
	      if (space.home === "independent" && space.political != space.home) { return 1; }

	      // captured non-allied home
	      if (space.home !== space.political && space.political !== "") {
		if (!space.besieged) {
	          if (!his_self.areAllies(space.home, space.political)) { return 1; }
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
	    }
	  );
	}

	return 0;
      },
      handleGameLoop : function(his_self, qe, mv) {

        if (mv[0] == "city-state-rebels") {

	  let faction = mv[1];
	  let spacekey = mv[2];
	  let respondent = his_self.returnFactionControllingSpace(spacekey);

          his_self.game.queue.splice(qe, 1);

          his_self.updateLog(faction + " plays City State Rebels against " + spacekey);

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
          this.addRegular(space.home, space.key, 1);

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
	      "Select Home Space not under Seige",
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
	      "Select Home Space not under Seige",
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
          his_self.addMove("discard_random\t"+f+"\t"+1);

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
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	if (his_self.game.state.round < 3) {

	  let player = his_self.returnPlayerOfFaction("protestant");

          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");
          his_self.game.queue.push("protestant_reformation\t"+player+"\tall");

	} else {

	  let player = his_self.returnPlayerOfFaction("papacy");   

          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
          his_self.game.queue.push("catholic_counter_reformation\t"+player+"\tall");
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
      name : "Frederick the Wise" ,
      ops : 3 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction("protestant");

	//
	// get wartburg card if in discards
	//
        if (his_self.game.deck[0].discards["037"]) {
	  delete his_self.game.deck[0].discards["037"];
	  if (his_self.game.player == p) {
            let fhand_idx = this.returnFactionHandIdx(p, faction);
	    his_self.game.deck[0].fhand[fhand_idx].push("037");
	  }
	}

	let res  = [];
	let res2 = [];

	res = his_self.returnNearestSpaceWithFilter(
	  "wittenberg",
	  function(spacekey) {
	    if (his_self.game.spaces[spacekey].religious == "catholic" && his_self.game.spaces[spacekey].language == "german") { return 1; }
	    return 0;
	  },
	  function(propagation_filter) {
	    return 1;
	  },
	  0,
	  1,
	);

	if (res.length == 1) {
	  res2 = his_self.returnNearestSpaceWithFilter(
	    "wittenberg",
	    function(spacekey) {
	      if (spacekey === res[0].key) { return 0; }
	      if (his_self.game.spaces[spacekey].religious == "catholic" && his_self.game.spaces[spacekey].language == "german") { return 1; }
	      return 0;
	    },
	    function(propagation_filter) {
	      return 1;
	    },
	    0,
	    1,
	  );
	}

	for (let i = 0; i < res.length; i++) {
	  res3.push(res[i]);
	}
	for (let i = 0; i < res2.length; i++) {
	  res3.push(res2[i]);
	}

	let msg = "Select Towns to Flip Protestant: ";
        let html = '<ul>';
        for (let i = 0; i < res3.length; i++) {
	  html += `<li class="option" id="${res3[i].key}">${res3[i].key}</li>`;
	}
        html += '</ul>';

    	his_self.updateStatusWithOptions(msg, html);

	let total_picked = 0;
	let picked = [];

	$('.option').off();
	$('.option').on('click', function () {

	  let action = $(this).attr("id");

	  if (!picked.includes(action)) {
	    picked.push(action);
	    total_picked++;
	    document.getElementById(action).remove();
	  }

	  if (total_picked >= 2) {
	    $('option').off();
	    for (let i = 0; i < 2; i++) {
	      his_self.addMove("convert" + "\t" + picked[i] + "\t" + "protestant");
	    }
	    his_self.endTurn();
	  }

	});
      },
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
  
	  let p = this.returnPlayerOfFaction(faction);
          let fhand_idx = this.returnFactionHandIdx(p, faction);
	  let card = this.game.state.last_pulled_card;
	  let ops = this.game.deck[0].cards[card].ops;

	  for (let i = 0; i < card.ops; i++) {
  	    his_self.game.queue.push("build_saint_peters");
	  }

  	  his_self.game.queue.push("discard\t"+faction+"\t"+card);
          his_self.game.queue.splice(qe, 1);

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

	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");
	this.game.queue.push("protestant_reformation\t"+p+"\tall");

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
	let p = his_self.returnPlayerOfFaction("faction");

	if (his_self.game.player == p) {

	  // pick a faction
  	  his_self.playerSelectFactionWithFilter(

	    "Select Faction to Target: ",

	    function(f) {
	      if (f !== faction) { return 1; }
	      return 0;
	    },

	    function (target) {
	      his_self.addMove("mercendaries-demand-pay\t"+target);
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
	  let player = his_self.returnPlayerOfFaction(target);

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
		    if (this.game.spaces[spacekey].units[target][unit_idx].type == "mercenary") { return 1; }
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
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          let res = his_self.returnSpacesWithFilter(function(spacekey) {
	    if (his_self.isOccupied(spacekey)) { return 0; }
	    if (!his_self.game.spaces[spacekey].language == "german") { return 1; }
	    return 0;
	  });


	  let spaces_to_select = 5;

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
      name : "Printing Press" ,
      ops : 5 ,
      turn : 1 ,
      type : "normal" ,
      removeFromDeckAfterPlay : function(his_self, player) { return 0; } ,
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

        his_self.game.state.tmp_protestant_reformation_bonus++;
        his_self.game.state.printing_press_active = 1;

	let p = his_self.returnPlayerOfFaction(faction);

	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");
	his_self.game.queue.push("protestant_reformation\t"+p+"\tall");

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
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

  	  //
	  // list of all captured leaders
	  //
	  let captured_leaders = [];
	  let options = [];

	  for (let i = 0; i < this.game.state.players_info.length; i++) {
	    for (let ii = 0; ii < this.game.state.players_info[i].captured.length; ii++) {
	      captured_leaders.push({ leader : this.game.state.players_info[i].captured[ii].type , player : i , idx : ii });
	      options.push(this.game.state.players_info[i].captured[ii].type);
	    } 	
	  }	

	  his_self.playerSelectOptions(res, options, false, (selected) => {
	    if (selected.length == 0) {
	      this.endTurn();
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
	  if (this.game.player == p) {
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
		      his_self.addMove("NOTIFY\t"+faction+" removes unit from " + space.key);
		      his_self.endTurn();

		    });
		  },
		);
		return 0;
	      }
              if (action === "no") {
		his_self.addMove("NOTIFY\t"+faction+" does not support Irish rebels");
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
alert("NOT IMPLEMENTED");
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
      canEvent : function(his_self, faction) { return 1; },
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
	      let s = his_self.game.spaces[spacekey];
	      if (s.home === "independent" && s.political === "") {} else {
		let controller = s.political;
                his_self.addMove("build\t"+controller+"\t"+"regular"+"\t"+spacekey);
	      }
              his_self.addMove("fortify\t"+spacekey);
            }

          );
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

            "Select Space Under Seiged" ,

            function(space) {
              if (space.besieged > 0) { return 1; }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let attacker = "";
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
                his_self.addMove("NOTIFY\tTreachery cannot find attacker in seige");
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
	    his_self.updateLog("Treachery - besiegers capture defenders and control space");
	    for (let i = 0; i < defenders.length; i++) {
	      his_self.game.queue.push(`purge_units_and_capture_leaders\t${defenders[i]}\t${attacker}\t${spacekey}`);
	    }
	  }

          his_self.game.queue.splice(qe, 1);
	  
	}

        return 1;
      },
    }
    deck['095'] = { 
      img : "cards/HIS-095.svg" , 
      name : "Sack of Rome" ,
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
		    his_self.addMove(`destroy_unit\t${action}\t${z}`);
		  }
		  his_self.endTurn();
		});

	      } else {
		for (let z = his_self.game.spaces[spacekey].units[factions[0]].length-1; z >= 0; z--) {
		  his_self.addMove(`destroy_unit\t${factions[0]}\t${z}`);
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
      canEvent : function(his_self, faction) {
	return 1;
      },
      onEvent : function(his_self, faction) {

	let p = his_self.returnPlayerOfFaction(faction);
	if (p == his_self.game.player) {

          his_self.playerSelectSpaceWithFilter(

            "Select Space With Land Units" ,

            function(space) {
	      for (let key in space.units) {
	        if (his_self.returnFactionLandUnitsInSpace(space.key) > 0) { return 1; }
	      }
	      return 0;
            },

            function(spacekey) {

	      let space = his_self.game.spaces[spacekey];
	      let factions = [];

	      for (let key in space.units) {
	        if (his_self.returnFactionLandUnitsInSpace(space.key) > 0) { factions.push(key); }
	      }

	      if (factions.length > 0) {

 	        let msg = "Choose Faction to Suffer Losses:";
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
		      his_self.addMove(`destroy_unit\t${action}\t${z}`);
		      regulars_to_delete--;
		    }
		    if (u.type != "regular" && npnregulars_to_delete > 0) {
		      his_self.addMove(`destroy_unit\t${action}\t${z}`);
		      nonregulars_to_delete--;
		    }
		  }
		  his_self.endTurn();
		});

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
		    his_self.addMove(`destroy_unit\t${action}\t${z}`);
		    regulars_to_delete--;
		  }
		  if (u.type != "regular" && npnregulars_to_delete > 0) {
		    his_self.addMove(`destroy_unit\t${action}\t${z}`);
		    nonregulars_to_delete--;
		  }
		}
		his_self.endTurn();
	      }
            }
          );

          return 0;
        }
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
          
          let p1 = his_self.returnPlayerOfFaction(faction_taking);
          let p2 = his_self.returnPlayerOfFaction(faction_giving);
          
          if (his_self.game.player == p1) {

	    for (let i = 0; i < cards.length; i++) {
	      his_self.updateLog(faction_giving + " has " + his_self.deck[cards[i]].name);
	    }
          }

          his_self.game.queue.splice(qe, 1);
          return 1;

        }


        if (mv[0] == "venetian_informant") {

	  let faction = mv[1];
	  let player = his_self.returnPlayerOfFaction(faction);

	  if (player == his_self.game.player) {

	    let powers = his_self.returnImpulseOrder();
	    let msg = "View which Faction Cards?";

            let html = '<ul>';
	    for (let i = 0; i < powers.length; i++) {
	      if (powers[i] != faction) {
                html += '<li class="option" id="${powers[i]}">${powers[i]}</li>';
	      }
	    }
            html += '</ul>';

    	    his_self.updateStatusWithOptions(msg, html);

	    $('.option').off();
	    $('.option').on('click', function () {
	      $('.option').off();
	      let action = $(this).attr("id");
	      his_self.addMove("show_hand\t"+faction+"\t"+action);
	      his_self.endMove();
	    });

	  }

          his_self.game.queue.splice(qe, 1);
	  return 0;


        }

	return 1;

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
    deck['110'] = { 
      img : "cards/HIS-110.svg" , 
      name : "War in Persia" ,
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
      name : "Thomos Cromwell" ,
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

    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
    }

    return deck;

  }


