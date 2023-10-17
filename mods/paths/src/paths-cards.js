
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




  returnDeck() {

    var deck = {};

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

	  his_self.updateLog("France rolls " + roll + " for "+his_self.popup('004'));

	  if (his_self.isSpaceControlled("milan", "france")) {
	    his_self.updateLog("French control Milan - roll adjusted to 6");
	    roll = 6;
	  };

	  //
	  // France wins 1 VP
	  //
	  if (roll >= 3) {
	    if (his_self.game.state.french_chateaux_vp < 6) {
	      his_self.updateLog("France gains 1VP from "+his_self.popup('004'));
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

            let msg = "Excommunicate Protestant Reformer:";
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
  	  his_self.language_zone_overlay.render();

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
	      if (is_committed == "uncommitted") { is_committed = 1; } else { is_committed = 0; }

              let msg = "Leigzip Debate Format?";
              let html = '<ul>';
              html += '<li class="option" id="select">Pick My Debater</li>';
	      // or prohibit uncommitted debaters
              if (1 < his_self.returnDebatersInLanguageZone(language_zone, "protestant", is_committed)) {
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
	            his_self.addMove("pick_first_round_debaters\tpapacy\tprotestant\t"+language_zone+"\t"+"uncommitted\t" + selected_papal_debater);
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
                    let prohibited_protestant_debater = $(this).attr("id");
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

		his_self.addMove("card\tprotestant\t"+action);
		his_self.addMove("discard\tprotestant\t007");
		his_self.endTurn();

	      } else {

		his_self.addMove("discard\tprotestant\t007");
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
        his_self.game.queue.push("counter_or_acknowledge\tThe Reformation has begun!");
        his_self.game.queue.push("RESETCONFIRMSNEEDED\tall");
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

console.log("#");
console.log("#");
console.log("REOFMRAITON BONUS ROLLS: " + his_self.game.state.tmp_protestant_reformation_bonus);
console.log("#");
console.log("#");

          let player = parseInt(mv[1]);
          if (his_self.returnPlayerOfFaction(mv[1])) { player = his_self.returnPlayerOfFaction(mv[1]); }
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
		    (space.language === language_zone || language_zone == "all") &&
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


    //
    //
    //
    //delete deck["095"];


    for (let key in deck) {
      deck[key] = this.addEvents(deck[key]);
      if (!deck[key].warn) { deck[key].warn = []; }
    }

    return deck;

  }


