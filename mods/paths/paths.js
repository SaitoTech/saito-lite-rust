const GameTemplate = require('../../lib/templates/gametemplate');
const ZoomOverlay = require('./lib/ui/overlays/zoom');

const PathsRules = require('./lib/core/rules.template');
const PathsOptions = require('./lib/core/advanced-options.template');
const PathsingularOption = require('./lib/core/options.template');

const JSON = require('json-bigint');



//////////////////
// CONSTRUCTOR  //
//////////////////
class PathsOfGlory extends GameTemplate {

  constructor(app) {

    super(app);

    this.app             = app;

    this.name  		 = "PathsOfGlory";
    this.gamename        = "Paths of Glory";
    this.slug		 = "paths";
    this.description     = `Paths of Glory: The First World War invites players to assume the roles of the leaders of the Central Powers and Allies who led the world to the precipice of destruction between 1914 and 1918.`;
    this.publisher_message = `Here I Stand is published by GMT Games. This module is made available under an open source license provided by GMT Games that permits usage provided that at least one player per game has purchased a copy of the game. Support GMT Games: <a href="https://boardgamegeek.com/boardgame/91/paths-glory">Paths of Glory</a>`;
    this.categories      = "Games Boardgame Strategy";

    this.interface = 1; // graphical interface

    //
    // ui components
    //
    this.zoom_overlay = new ZoomOverlay(this.app, this); 

    //
    // this sets the ratio used for determining
    // the size of the original pieces
    //
    this.boardWidth  = 5100;

    //
    // newbie mode
    //
    this.confirm_moves = 1;

    //
    // "showcard" popups
    //
    this.useCardbox = 1;

    //
    //
    // players
    this.minPlayers 	 = 2;
    this.maxPlayers 	 = 6;

  }


  returnSingularGameOption(){
    return PathsSingularOption();
  }

  returnAdvancedOptions() {
    return PathsOptions();
  }

  returnGameRulesHTML(){
    return PathsRules();
  }




  ////////////////
  // initialize //
  ////////////////
  initializeGame(game_id) {

    //
    // check user preferences to update interface, if text
    //
    if (this.app?.options?.gameprefs) {
      if (this.app.options.gameprefs.his_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    }

    //
    // re-fill status and log
    //
    if (this.game.status != "") { this.updateStatus(this.game.status); }

    //
    // initialize game objects
    //
    this.deck = this.returnDeck();



    let first_time_running = 0;

    //
    // initialize
    //
    if (!this.game.state) {

      this.game.state = this.returnState();
      this.game.state.players_info = this.returnPlayers(this.game.players.length);
      this.game.spaces = this.returnSpaces();

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
      this.game.queue.push("READY");

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

    //
    // add initial units
    //
    if (first_time_running == 1) {
    }

    //
    // and show the board
    //
    this.displayBoard();

  }



  render(app) {

    if (this.browser_active == 0) { return; }

    super.render(app);

    let game_mod = this;

    //
    //
    //
    if (!this.game.state) {
      this.game.state = this.returnState();
    }

    //
    // preload images
    //
    this.preloadImages();


    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.pathsofglory_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}

    this.menu.addMenuOption("game-game", "Game");
    let initial_confirm_moves = "Newbie Mode"; 
    if (this.confirm_moves == 1) {
      initial_confirm_moves = "Expert Mode"; 
    }
    this.menu.addSubMenuOption("game-game", {
      text : initial_confirm_moves,
      id : "game-confirm",
      class : "game-confirm",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
	if (game_mod.confirm_moves == 0) {
	  game_mod.confirm_moves = 1;
          game_mod.saveGamePreference('his_expert_mode', 0);
	  window.location.reload();	
	} else {
	  game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('his_expert_mode', 1);
	  window.location.reload();	
	}
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Log",
      id : "game-log",
      class : "game-log",
      callback : function(app, game_mod) {
        game_mod.menu.hideSubMenus();
        game_mod.log.toggleLog();
      }
    });
    this.menu.addSubMenuOption("game-game", {
      text : "Stats",
      id : "game-stats",
      class : "game-stats",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleStatsMenu();
      }
    });

    this.menu.addChatMenu();
    this.menu.render();
    this.log.render();
    this.cardbox.render();


    //
    // add card events -- text shown and callback run if there
    //
    this.cardbox.addCardType("showcard", "", null);
    this.cardbox.addCardType("card", "select", this.cardbox_callback);
    if (app.browser.isMobileBrowser(navigator.userAgent)) {
      this.cardbox.skip_card_prompt = 0;
    }

    //
    // position cities / spaces / etc
    //
    let spaces = this.returnSpaces();
    for (let key in spaces) {
      if (spaces.hasOwnProperty(key)) {
	try {
	  let obj = document.getElementById(key);
	  obj.style.top = spaces[key].top + "px";
	  obj.style.left = spaces[key].left + "px";
        } catch (err) {
	}
      }
    }

    try {

      if (app.browser.isMobileBrowser(navigator.userAgent)) {
        //this.hammer.render();
      } else {
	let his_self = this;
        this.sizer.render();
        this.sizer.attachEvents('#gameboard');
      }

    } catch (err) {}

    this.hud.render();
    this.displayBoard();

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



  hideOverlays() {
    this.zoom_overlay.hide();
  }

  displayBoard() {
    try {
      this.displaySpaces();
    } catch (err) {
      console.log("error displaying spaces... " + err);
    }
  }


  displaySpace(key) {
console.log("display: " + key);
  }

  displaySpaces() {

    let paths_self = this;

    if (!this.game.state.board) {
      this.game.state.board["protestant"] = this.returnOnBoardUnits("protestant");
      this.game.state.board["papacy"] = this.returnOnBoardUnits("papacy");
      this.game.state.board["england"] = this.returnOnBoardUnits("england");
      this.game.state.board["france"] = this.returnOnBoardUnits("france");
      this.game.state.board["ottoman"] = this.returnOnBoardUnits("ottoman");
      this.game.state.board["hapsburg"] = this.returnOnBoardUnits("hapsburg");
    }

    //
    // add tiles
    //
    for (let key in this.spaces) {
      if (this.spaces.hasOwnProperty(key)) {
	this.displaySpace(key);
      }
    }

    let xpos = 0;
    let ypos = 0;

    if (!paths_self.bound_gameboard_zoom) {

      $('.gameboard').on('mousedown', function (e) {
        if (e.currentTarget.classList.contains("space")) { return; }
        xpos = e.clientX;
        ypos = e.clientY;
      });
      $('.gameboard').on('mouseup', function (e) { 
        if (Math.abs(xpos-e.clientX) > 4) { return; }
        if (Math.abs(ypos-e.clientY) > 4) { return; }
	//
	// if this is a selectable space, let people select directly
	//
	// this is a total hack by the way, but it captures the embedding that happens when
	// we are clicking and the click actino is technically on the item that is INSIDE
	// the selectable DIV, like a click on a unit in a key, etc.
	//
	if (e.target.classList.contains("selectable")) {
	  // something else is handling this
	  return;
	} else {
	  let el = e.target;
	  if (el.parentNode) {
	    if (el.parentNode.classList.contains("selectable")) {
	      // something else is handling this
	      return;
	    } else {
	      if (el.parentNode.parentNode) {
	        if (el.parentNode.parentNode.classList.contains("selectable")) {
	          return;
	        }
	      }
	    }
	  }
	}
	// otherwise show zoom
        //if (e.target.classList.contains("space")) {
          paths_self.theses_overlay.renderAtCoordinates(xpos, ypos);
	  //e.stopPropagation();
	  //e.preventDefault();	
	  //return;
	//}
      });

      paths_self.bound_gameboard_zoom = 1;

    }


  }



  returnCardImage(cardname) {

    let cardclass = "cardimg";
    let deckidx = -1;
    let card;
    let cdeck = this.returnDeck();
    let ddeck = this.returnDiplomaticDeck();

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/his/img/cards/PASS.png" /><div class="cardtext">pass</div>`;
    }

    if (this.debaters[cardname]) { return this.debaters[cardname].returnCardImage(); }

    for (let i = 0; i < this.game.deck.length; i++) {
      var c = this.game.deck[i].cards[cardname];
      if (c == undefined) { c = this.game.deck[i].discards[cardname]; }
      if (c == undefined) { c = this.game.deck[i].removed[cardname]; }
      if (c !== undefined) { 
	deckidx = i;
        card = c;
      }
    }
    if (c == undefined) { c = cdeck[cardname]; card = cdeck[cardname]; }
    if (c == undefined) { c = ddeck[cardname]; card = ddeck[cardname]; }

    //
    // triggered before card deal
    //
    if (cardname === "008") { return `<img class="${cardclass}" src="/his/img/cards/HIS-008.svg" />`; }

    if (deckidx === -1 && !cdeck[cardname] && !ddeck[cardname]) {
      //
      // this is not a card, it is something like "skip turn" or cancel
      //
      return `<div class="noncard" id="${cardname.replaceAll(" ","")}">${cardname}</div>`;
    }

    var html = `<img class="${cardclass}" src="/his/img/${card.img}" />`;

    //
    // add cancel button to uneventable cards
    //
    if (deckidx == 0) { 
      if (!this.deck[cardname]) {
        if (!this.deck[cardname].canEvent(this, "")) {
          html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
        }
      }
    }
    if (deckidx == 1) { 
      if (!this.diplomatic_deck[cardname].canEvent(this, "")) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
      }
    }

    return html

  }


  async preloadImages() {
    var allImages = [
    //  "img/factions/england.png",
    ];

    this.preloadImageArray(allImages);
  }

  preloadImageArray(imageArray=[], idx=0) {

    let pre_images = [imageArray.length];

    if (imageArray && imageArray.length > idx) {
      pre_images[idx] = new Image();
      pre_images[idx].onload = () => {
        this.preloadImageArray(imageArray, idx+1);
      }
      pre_images[idx].src = "/his/" + imageArray[idx];
    }

  }




  returnSpaceName(spacekey) {
    if (this.game.spaces[spacekey]) { return this.game.spaces[spacekey].name; }
    if (this.game.navalspaces[spacekey]) { return this.game.navalspaces[spacekey].name; }
    return spacekey;
  }

  resetBesiegedSpaces() {
    for (let space in this.game.spaces) {
      if (space.besieged == 2) { space.besieged = 1; }
    }
  }
  resetLockedTroops() {
    for (let space in this.game.spaces) {
      for (let f in this.game.spaces[space].units) {
        for (let z = 0; z < this.game.spaces[space].units[f].length; z++) {
          this.game.spaces[space].units[f][z].locked = false;
        }
      }
    }
  }

  addUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 1;
  }

  removeUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.unrest = 0;
  }

  hasProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["england"].length; i++) {
      let unit = space.units["england"][i];
      if (unit.reformer) { return true; }
    }
    for (let i = 0; i < space.units["france"].length; i++) {
      let unit = space.units["france"][i];
      if (unit.reformer) { return true; }
    }
    return false;
  }


  hasProtestantLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    //
    // only protestant units count
    //
    for (let i = 0; i < space.units["protestant"].length; i++) {
      let unit = space.units["protestant"][i];
      if (unit.type == "regular" || unit.type == "mercenary") { return true; }
    }

    //
    // unless Edward VI or Elizabeth I are on the throne
    //
    if (this.game.state.leaders.edward_vi == 1 || this.game.state.leaders.elizabeth_i == 1) {

      //
      // then british mercenaries and regulars count
      //
      for (let i = 0; i < space.units["england"].length; i++) {
        let unit = space.units["england"][i];
        if (unit.type == "regular" || unit.type == "mercenary") { return true; }
      }

      //
      // or Scottish ones if Scotland is allied to England
      //
      if (this.areAllies("england", "scotland")) {
        for (let i = 0; i < space.units["scotland"].length; i++) {
          let unit = space.units["scotland"][i];
          if (unit.type == "regular" || unit.type == "mercenary") { return true; }
        }
      }

    }

    return false;

  }

  returnCatholicLandUnitsInSpace(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let units = [];

    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {
	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	} else {
          for (let z = 0; z < space.units[f].length; z++) {
	    let u = space.units[f][z];
	    if (u.type === "regular" || u.type === "mercenary" || u.type === "cavalry") { units.push({ faction : f , unit_idx : z }); }
	  }
	}
      }
    }

    return units;

  }

  hasCatholicLandUnits(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      if (f != "protestant" && f != "ottoman") {

	if (f == "england" && (this.game.state.leaders.edward_vi != 1 || this.game.state.leaders.elizabeth_i != 1)) {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	} else {
          if (this.returnFactionLandUnitsInSpace(f, space)) { return true; }
	}
      }
    }

    return false;
  }

  isSpaceFriendly(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return true; }
    return this.areAllies(cf, faction);
  }

  isSpaceHostile(space, faction) {
    let cf = this.returnFactionControllingSpace(space);
    if (cf === faction) { return false; }
    return this.areEnemies(cf, faction);
  }

  isSpaceControlled(space, faction) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == "") { return true; }

    // home spaces that have not fallen to another power.
    if (space.home === faction && space.political == faction) { return true; }

    // independent (gray) spaces seized by the power.
    if (space.home === "independent" && space.political === faction) { return true; }

    // home spaces of other powers seized by the power.
    if (space.home !== faction && space.political === faction) { return true; }

    // home spaces of allied minor powers. 
    if (space.home !== faction && this.isAlliedMinorPower(space.home, faction)) { return true; }

    return false;
  }

  isSpaceFortified(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.type === "electorate" || space.type === "key" || space.type === "fortress") { return true; }
    return false;
  }

  returnHopsToFortifiedHomeSpace(source, faction) {
    let his_self = this;
    try { if (this.game.spaces[source]) { source = this.game.spaces[source]; } } catch (err) {}
    return this.returnHopsBetweenSpacesWithFilter(source, function(spacekey) {
      if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
	if (his_self.isSpaceControlled(spacekey, faction)) {
	  if (his_self.game.spaces[spacekey].home === faction) {
	    return 1;
	  }
	}
      }
      return 0;
    });
  }
  returnHopsToDestination(source, destination) {
    try { if (this.game.spaces[source]) { destination = this.game.spaces[source]; } } catch (err) {}
    try { if (this.game.spaces[destination]) { destination = this.game.spaces[destination]; } } catch (err) {}
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

  //
  // similar to above, except it can cross a sea-zone
  //
  isSpaceConnectedToCapitalSpringDeployment(space, faction) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};
    let transit_passes = 0;
    let hostile_sea_passes = 0;

    if (this.game.state.spring_deploy_across_seas.includes(faction)) {
      hostile_sea_passes = 1;
    }
    if (this.game.state.spring_deploy_across_passes.includes(faction)) {
      transit_passes = 1;
    }

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      },

      // transit passes? 0
      transit_passes,

      // transit seas? 1
      1,
     
      // faction? optional
      faction,

      // already crossed sea zone optional
      0 
    );

    return 1;
  }

  isSpaceAdjacentToReligion(space, religion) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.neighbours.length; i++) {
      if (this.game.spaces[space.neighbours[i]].religion === religion) {
	return true;
      }
    }
    return false;
  }

  isSpaceAdjacentToProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let z = 0; z < space.neighbours.length; z++) {
      if (this.doesSpaceContainProtestantReformer(space.neighbours[z])) { return true; }
    }
    return false;
  }

  // either in port or in adjacent sea
  returnNumberOfSquadronsProtectingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let number_of_squadrons_in_port = 0;
    let number_of_squadrons_at_sea = 0;

    //
    // in port
    //
    for (let f in space.units) {
      for (let i = 0; i < space.units[f].length; i++) {
        if (space.units[f][i].type == "squadron") {
	  if (space.units[f][i].besieged != 0) { number_of_squadrons_in_port++; }
	}
      }
    }

console.log("SQUADRONS IN SPACE: " + number_of_squadrons_in_port);

    //
    // adjacent sea
    //
console.log("SPACE PORTS: " + JSON.stringify(space.ports));

    for (let p = 0; p < space.ports.length; p++) {

      let sea = this.game.navalspaces[space.ports[p]];

console.log("SEA: " + JSON.stringify(sea));

      for (let f in sea.units) {

	// faction at sea is friendly to port space controller
	if (this.isSpaceFriendly(space, f)) {
	  for (let i = 0; i < sea.units[f].length; i++) {
	    if (sea.units[f][i].type == "squadron") {
	      number_of_squadrons_at_sea++;
	    }
	  }
	}
      }
    }

console.log("SQUADRONS AT SEA: " + number_of_squadrons_at_sea);

    return (number_of_squadrons_in_port + number_of_squadrons_at_sea);

  }
  doesSpaceContainProtestantReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["protestant"].length; i++) {
      if (space.units["protestant"][i].reformer == true) { return true; }
    }
    return false;
  }

  doesSpaceContainCatholicReformer(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units["papacy"].length; i++) {
      if (space.units["papacy"][i].reformer == true) { return true; }
    }
    return false;
  }

  isSpaceAPortInTheSameSeaZoneAsAProtestantPort(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let seas = [];
    for (let i = 0; i < space.ports.length; i++) {
      if (!seas.includes(space.ports[i])) { seas.push(space.ports[i]); }
    }
    for (let s in this.game.spaces) {
      let sp = this.game.spaces[s];
      if (sp.religion == "protestant" && sp.ports.length > 0) {
	for (let z = 0; z < sp.ports.length; z++) {
	  if (seas.includes(sp.ports[z])) { return true; }
	}
      }
    }  
    return false;
  }


  returnSpacesWithFilter(filter_func) {
    let spaces = [];
    for (let spacekey in this.game.spaces) {
      if (filter_func(spacekey) == 1) { spaces.push(spacekey); }
    }
    return spaces;
  }

  isSpaceFactionCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let capitals = this.returnCapitals(faction);
    for (let i = 0; i < capitals.length; i++) {
      if (capitals[i] === space.key) { return true; }
    }
    return false;
  }

  isSpaceInUnrest(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.unrest == 1) { return true; }
    return false;
  }

  isSpaceUnderSiege(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.besieged > 0) { return true; }
    return false;
  }

  isSpaceConnectedToCapital(space, faction) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let his_self = this;
    let capitals = this.returnCapitals(faction);
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // capitals are good destinations
      function(spacekey) {
        if (capitals.includes(spacekey)) { return 1; }
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	return 0;
      }
    );

    return 1;
  }










  returnFactionControllingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    let factions = this.returnImpulseOrder(); 
    for (let i = 0; i < factions.length; i++) {
      if (this.isSpaceControlled(space, factions[i])) { return factions[i]; }
    }
    if (space.political) { return space.political; }
    return space.home;
  }



  returnSpaceOfPersonage(faction, personage) {
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i]) {
	    if (this.game.spaces[key].units[faction][i].type === personage) {
  	      return key;
            }
          }
        }
      }
    }
    return "";
  }

  returnIndexOfPersonageInSpace(faction, personage, spacekey="") {
    if (spacekey === "") { return -1; }
    if (!this.game.spaces[spacekey]) { return -1; }
    for (let i = 0; i < this.game.spaces[spacekey].units[faction].length; i++) {
      if (this.game.spaces[spacekey].units[faction][i].type === personage) {
        return i;
      }
    }
    return -1;
  }

  returnNavalTransportDestinations(faction, space, ops) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    let viable_destinations = [];
    let viable_navalspaces = [];
    let options = [];
    let ops_remaining = ops-1;    

    for (let i = 0; i < space.ports.length; i++) {
      if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	viable_navalspaces.push({key : space.ports[i] , ops_remaining : ops_remaining});
      }
    }

    //
    // TODO check for blocking fleet
    //
    while (ops_remaining > 1) {
      ops_remaining--;
      for (let i = 0; i < viable_navalspaces.length; i++) {
	for (let z = 0; z < this.game.navalspaces[viable_navalspaces[i].key].neighbours.length; z++) {
          if (this.doesFactionHaveNavalUnitsInSpace(faction, space.ports[i])) {
	    let ns = this.game.navalspaces[viable_navalspaces[i].key].neighbours[z];
	    let already_included = 0;
	    for (let z = 0; z < viable_navalspaces.length; z++) {
	      if (viable_navalspaces[z].key == ns) { already_included = 1; }
	    }
	    if (already_included == 0) {
	      viable_navalspaces.push({ key : ns , ops_remaining : ops_remaining });
	    }
	  }
	}
      }
    }

    //
    //
    //
    for (let i = 0; i < viable_navalspaces.length; i++) {
      let key = viable_navalspaces[i].key;
      for (let z = 0; z < this.game.navalspaces[key].ports.length; z++) {      
	let port = this.game.navalspaces[key].ports[z];
	if (port != space.key) {
	  viable_destinations.push({ key : port , cost : (ops - ops_remaining)});
	}
      }
    }

    return viable_destinations;

  }


  returnFactionNavalUnitsToMove(faction) {

    let units = [];

    //
    // include minor-activated factions
    //
    let fip = [];
        fip.push(faction);
    if (this.game.state.activated_powers[faction]) {
      for (let i = 0; i < this.game.state.activated_powers[faction].length; i++) {
        fip.push(this.game.state.activated_powers[faction][i]);
      }
    }

    //
    // if this is the 2P game, include any major activated units
    //
    if (faction != "independent" && faction != "scotland" && faction != "genoa" && faction != "venice" && faction != "hungary") {
      if (this.game.players.length == 2) {
        if (this.areAllies(faction, "hapsburg") && faction != "hapsburg") { fip.push("hapsburg"); }
        if (this.areAllies(faction, "protestant") && faction != "protestant") { fip.push("protestant"); }
        if (this.areAllies(faction, "france") && faction != "france") { fip.push("france"); }
        if (this.areAllies(faction, "england") && faction != "england") { fip.push("england"); }
        if (this.areAllies(faction, "papacy") && faction != "papacy") { fip.push("papacy"); }
        if (this.areAllies(faction, "ottoman") && faction != "ottoman") { fip.push("ottoman"); }
      }
    }

    //
    // find units
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.spaces) {

	//
	// we only care about units in ports
	//
	if (this.game.spaces[key].ports) {
	if (this.game.spaces[key].ports.length > 0) {
	  let ships = [];
	  let leaders = [];
	  for (let z = 0; z < this.game.spaces[key].units[fip[i]].length; z++) {

	    //
	    // only add leaders if there is a ship in port
	    //
	    let u = this.game.spaces[key].units[fip[i]][z];
	    u.idx = z;
	    if (u.land_or_sea === "sea") {
	      if (u.navy_leader == true) {
		leaders.push(u);
	      } else {
		ships.push(u);
	      }
	    }
	  }

	  //
	  // add and include location
	  //
	  if (ships.length > 0) {
	    for (let y = 0; y < ships.length; y++) {
	      ships[y].spacekey = key;
	      units.push(ships[y]);
	    }
	    for (let y = 0; y < leaders.length; y++) {
	      leaders[y].spacekey = key;
	      units.push(leaders[y]);
	    }
	  }
	}
        }
      }
    }

    //
    // add ships and leaders out-of-port
    //
    for (let i = 0; i < fip.length; i++) {
      for (let key in this.game.navalspaces) {
	for (let z = 0; z < this.game.navalspaces[key].units[fip[i]].length; z++) {
	  this.game.navalspaces[key].units[fip[i]][z].spacekey = key;
	  units.push(this.game.navalspaces[key].units[fip[i]][z]);
	}
      }
    }

    return units;
  }








  returnNearestFriendlyFortifiedSpaces(faction, space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

if (space.key === "agram") {
  console.log(space.type + " -- " + space.fortified);
}

    if (space.type == "fortress" || space.type == "electorate" || space.type == "key" || space.fortified == 1) { return [space]; }

if (faction == "venice") {
  console.log("getting res for: " + space.key);
}

    let original_spacekey = space.key;
    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestSpaceWithFilter(

      space.key,

      // fortified spaces
      function(spacekey) {
        if (his_self.isSpaceFortified(his_self.game.spaces[spacekey])) {
console.log(spacekey + " -- is fortified");
	  if (his_self.isSpaceControlled(spacekey, faction)) {
console.log("and controlled");
	    return 1;
	  }
	  if (his_self.isSpaceFriendly(spacekey, faction)) {
console.log("and friendly");
	    return 1;
	  }
	}
        return 0;
      },

      // route through this?
      function(spacekey) {
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	if (his_self.isSpaceFriendly(spacekey, faction)) { return 1; }
	if (spacekey == original_spacekey) { return 1; }
	return 0;
      }
    );

    return res;

  }


  returnNearestFactionControlledPorts(faction, space) {
    try { if (this.game.navelspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let his_self = this;
    let already_routed_through = {};

    let res = this.returnNearestNavalSpaceOrPortWithFilter(

      space.key,

      // ports
      function(spacekey) {
        if (his_self.game.spaces[spacekey]) {
	  if (his_self.isSpaceControlled(space, faction)) {
	    return 1;
	  }
	}
        return 0;
      },

      // route through this
      function(spacekey) {	
        if (his_self.game.spaces[spacekey]) { return 0; }
	if (already_routed_through[spacekey] == 1) { return 0; }
        already_routed_through[spacekey] = 1;
	return 1;
      }
    );

    return res;

  }


  canFactionRetreatToSpace(faction, space, attacker_comes_from_this_space="") {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.spaces[attacker_comes_from_this_space]) { attacker_comes_from_this_space = this.game.spaces[attacker_comes_from_this_space]; } } catch (err) {}
    if (space === attacker_comes_from_this_space) { return 0; }
    if (this.isSpaceInUnrest(space) == 1) { return 0; }
    if (this.isSpaceFriendly(space, faction) == 1) { return 1; }
    return 0;
  }

  canFactionRetreatToNavalSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    return 1;
  }

  convertSpace(religion, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.religion = religion;
    this.displayBoard();
  }

  controlSpace(faction, space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    space.political = faction;
    space.occupier = faction;
  }


  returnDefenderFaction(attacker_faction, space) {
    // called in combat, this finds whichever faction is there but isn't allied to the attacker
    // or -- failing that -- whichever faction is recorded as occupying the space.
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let f in space.units) {
      let luis = this.returnFactionLandUnitsInSpace(f, space.key);
      if (luis > 0) {
        if (!this.areAllies(attacker_faction, f) && f !== attacker_faction) {
	  return f;
	}
      }
    }
    return this.returnFactionOccupyingSpace(space);
  }

  returnFactionOccupyingSpace(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (space.occupier != "" && space.occupier != undefined && space.occupier != "undefined" && space.occupier != 'undefined') { 
      // whoever had units here first
      if (space.units[space.occupier]) {
        if (space.units[space.occupier].length > 0) {
          return space.occupier; 
        }
      }
    }
    // or whoever has political control
    if (space.political != "") { return space.political; }
    // or whoever has home control
    if (space.owner != -1) { return space.owner; }
    return space.home;
  }

  returnFriendlyLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionLandUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "regular") { luis++; }
      if (space.units[faction][i].type === "mercenary") { luis++; }
      if (space.units[faction][i].type === "cavalry") { luis++; }
    }
    return luis;
  }

  returnFactionSeaUnitsInSpace(faction, space) {
    let luis = 0;
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    for (let i = 0; i < space.units[faction].length; i++) {
      if (space.units[faction][i].type === "squadron") { luis++; }
      if (space.units[faction][i].type === "corsair") { luis++; }
    }
    return luis;
  }

  doesOtherFactionHaveNavalUnitsInSpace(exclude_faction, key) {
    if (this.game.spaces[key]) {
      for (let f in this.game.spaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.spaces[key].units[faction]) {
            for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    if (this.game.navalspaces[key]) {
      for (let f in this.game.navalspaces[key].units) {
	if (f != exclude_faction) {
          if (this.game.navalspaces[key].units[faction]) {
            for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
              if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	        return 1;
              }
            }
	  }
	}
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsInSpace(faction, key) {
    if (this.game.spaces[key]) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
          if (this.game.spaces[key].units[faction][i].type === "squadron" || this.game.spaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    if (this.game.navalspaces[key]) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
          if (this.game.navalspaces[key].units[faction][i].type === "squadron" || this.game.navalspaces[key].units[faction][i].type === "corsair") {
  	    return 1;
          }
        }
      }
    }
    return 0;
  }

  doesFactionHaveNavalUnitsOnBoard(faction) {
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key].units[faction]) {
        for (let i = 0; i < this.game.navalspaces[key].units[faction].length; i++) {
	  return 1;
	}
      }
    }
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction]) {
        for (let i = 0; i < this.game.spaces[key].units[faction].length; i++) {
	  if (this.game.spaces[key].units[faction][i].land_or_sea === "sea") {
	    return 1;
	  }
	}
      }
    }
    return 0;
  }

  returnFactionMap(space, faction1, faction2) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let faction_map = {};

    for (let f in space.units) {
      if (this.returnFactionLandUnitsInSpace(f, space)) {
        if (f == faction1) {
          faction_map[f] = faction1;
        } else {
          if (f == faction2) {
            faction_map[f] = faction2;
          } else {
            if (this.areAllies(f, faction1)) {
              faction_map[f] = faction1;
            }
            if (this.areAllies(f, faction2)) {
              faction_map[f] = faction2;
            }
          }
        }
      }
    }
    return faction_map;
  }

  returnHomeSpaces(faction) {

    let spaces = [];

    for (let i in this.game.spaces) {
      if (this.game.spaces[i].home === faction) { spaces.push(i); }
    }

    return spaces;

  }

  //
  // transit seas calculates neighbours across a sea zone
  //
  // if transit_seas and faction is specified, we can only cross if
  // there are no ports in a zone with non-faction ships.
  //
  returnNeighbours(space, transit_passes=1, transit_seas=0, faction="") {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    if (transit_seas == 0) {
      if (transit_passes == 1) {
        return space.neighbours;
      }
      let neighbours = [];
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];      
        if (!space.pass.includes[x]) {
  	  neighbours.push(x);
        }
      }
      return neighbours;
    } else {

      let neighbours = [];

      if (transit_passes == 1) {
        neighbours = JSON.parse(JSON.stringify(space.neighbours));
      } else {
        for (let i = 0; i < space.neighbours.length; i++) {
          let x = space.neighbours[i];  
          if (!space.pass.includes[x]) {
            neighbours.push(x);
          }
        }
      }

      //
      // any ports ?
      //
      if (space.ports) {
        if (space.ports.length > 0) {
	  for (let i = 0; i < space.ports.length; i++) {
	    let navalspace = this.game.navalspaces[space.ports[i]];
	    let any_unfriendly_ships = false;
	    if (navalspace.ports) {
	      if (faction != "") {
	        for (let z = 0; z < navalspace.ports.length; z++) {
	          if (this.doesOtherFactionHaveNavalUnitsInSpace(faction, navalspace.ports[z])) {
		    if (this.game.state.events.spring_preparations != faction) {
		      any_unfriendly_ships = true;
		    }
		  }
	        }
	      }
              for (let z = 0; z < navalspace.ports.length; z++) {
	        if (!neighbours.includes(navalspace.ports[z]) && any_unfriendly_ships == false) {
	          neighbours.push(navalspace.ports[z]);
	        };
	      }
	    }
 	  }
        }
      }
      return neighbours;
    }
  }


  //
  // only calculates moves from naval spaces, not outbound from ports
  //
  returnNavalNeighbours(space, transit_passes=1) {
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}
    let neighbours = [];
    for (let i = 0; i < space.ports.length; i++) {
      let x = space.ports[i];
      neighbours.push(x);
    }
    for (let i = 0; i < space.neighbours.length; i++) {
      let x = space.neighbours[i];
      neighbours.push(x);
    }

    return neighbours;
  }




  //
  // returns adjacent naval and port spaces
  //
  returnNavalAndPortNeighbours(space) {
    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}
    try { if (this.game.navalspaces[space]) { space = this.game.navalspaces[space]; } } catch (err) {}

    let key = space.key;
    let neighbours = [];

    //
    // ports add only naval spaces
    //
    if (this.game.spaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
    }

    //
    // naval spaces add ports
    //
    if (this.game.navalspaces[key]) {
      for (let i = 0; i < space.ports.length; i++) {
        let x = space.ports[i];
        neighbours.push(x);
      }
      for (let i = 0; i < space.neighbours.length; i++) {
        let x = space.neighbours[i];
        neighbours.push(x);
      }
    }

    return neighbours;
  }


  //
  // returns both naval and port movement options
  //
  returnNavalMoveOptions(spacekey) {

    let neighbours = [];

    if (this.game.navalspaces[spacekey]) {
      for (let i = 0; i < this.game.navalspaces[spacekey].neighbours.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].neighbours[i]);
      }
      for (let i = 0; i < this.game.navalspaces[spacekey].ports.length; i++) {
	neighbours.push(this.game.navalspaces[spacekey].ports[i]);
      }
    } else {
      if (this.game.spaces[spacekey]) {
        for (let i = 0; i < this.game.spaces[spacekey].ports.length; i++) {
	  neighbours.push(this.game.spaces[spacekey].ports[i]);
        }
      }
    }

    return neighbours;
  }


  //
  // find the nearest destination.
  //
  returnNearestNavalSpaceOrPortWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNavalNeighbours(sourcekey);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }



    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.navalspaces[key].neighbours.length; i++) {
	      if (searched_spaces[this.game.navalspaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[this.game.navalspaces[key].neighbours[i]] = { hops : (hops+1) , key : this.game.navalspaces[key].neighbours[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  //
  // find the nearest destination.
  //
  // transit_eas = filters on spring deploment criteria of two friendly ports on either side of the zone + no uncontrolled ships in zone
  //
  returnNearestSpaceWithFilter(sourcekey, destination_filter, propagation_filter, include_source=1, transit_passes=0, transit_seas=0, faction="", already_crossed_sea_zone=0) {

    //
    // return array with results + hops distance
    //
    let results = [];
    let searched_spaces = {};
    let pending_spaces = {};

    //
    // if the source matches our destination, return it
    //
    if (include_source == 1) {
      if (destination_filter(sourcekey)) {
        results.push({ space : sourcekey , hops : 0 });
        return results;
      }
    }

    //
    // put the neighbours into pending
    //
    let n = this.returnNeighbours(sourcekey, transit_passes, transit_seas, faction);

    for (let i = 0; i < n.length; i++) {
      pending_spaces[n[i]] = { hops : 0 , key : n[i] };
    }

    //
    // otherwise propagate outwards searching pending
    //
    let continue_searching = 1;
    while (continue_searching) {

      let count = 0;
      for (let key in pending_spaces) {

	count++;
	let hops = pending_spaces[key].hops;

	if (destination_filter(key)) {
	  // found results? this is last pass
	  results.push({ hops : (hops+1) , key : key });	
	  continue_searching = 0;
	  if (searched_spaces[key]) {
	    // we've searched for this before
	  } else {
	    searched_spaces[key] = { hops : (hops+1) , key : key };
	  }
	} else {
	  if (propagation_filter(key)) {
    	    for (let i = 0; i < this.game.spaces[key].neighbours.length; i++) {
	      if (searched_spaces[this.game.spaces[key].neighbours[i]]) {
		// don't add to pending as we've transversed before
	      } else {
      	        pending_spaces[this.game.spaces[key].neighbours[i]] = { hops : (hops+1) , key : this.game.spaces[key].neighbours[i] };
	      }
    	    }
	  }
	  searched_spaces[key] = { hops : (hops+1) , key : key };
	}
	delete pending_spaces[key];

      }
      if (count == 0) {
	continue_searching = 0;
	for (let newkey in pending_spaces) {
	  if (pending_spaces[newkey]) { continue_searching = 1; }
	}
      }
    }

    //
    // at this point we have results or not 
    //
    return results;

  }

  isSpaceElectorate(spacekey) {
    if (spacekey === "augsburg") { return true; }
    if (spacekey === "mainz") { return true; }
    if (spacekey === "trier") { return true; }
    if (spacekey === "cologne") { return true; }
    if (spacekey === "wittenberg") { return true; }
    if (spacekey === "brandenburg") { return true; }
    return false;
  }

  returnNumberOfCatholicElectorates() {
    let controlled_keys = 0;
    if (!this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (!this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfProtestantElectorates() {
    let controlled_keys = 0;
    if (this.isSpaceControlled('augsburg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('mainz', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('trier', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('cologne', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('wittenberg', "protestant")) { controlled_keys++; }
    if (this.isSpaceControlled('brandenburg', "protestant")) { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByCatholics() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "catholic") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "catholic") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfElectoratesControlledByProtestants() {
    let controlled_keys = 0;
    if (this.game.spaces['augsburg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['mainz'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['trier'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['cologne'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['wittenberg'].religion === "protestant") { controlled_keys++; }
    if (this.game.spaces['brandenburg'].religion === "protestant") { controlled_keys++; }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByFaction(faction) {
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }
  returnNumberOfKeysControlledByPlayer(player_num) {
    let faction = this.game.state.players_info[player_num-1].faction;
    let controlled_keys = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].type === "key") {
        if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
          controlled_keys++;
        }
      }
    }
    return controlled_keys;
  }

  returnNumberOfCatholicSpacesInLanguageZone(language="") {  
    let catholic_spaces = 0;
    for (let key in this.game.spaces) {
      if ((this.game.spaces[key].unrest == 1 && this.game.spaces[key].religion == "protestant") || this.game.spaces[key].religion === "catholic") {
	if (language == "" || this.game.spaces[key].language == language) {
	  catholic_spaces++;
	}
      }
    }
    return catholic_spaces;
  }

  returnNumberOfProtestantSpacesInLanguageZone(language="") {  
    let protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant" && this.game.spaces[key].unrest == 0) {
	if (language == "all" || language == "" || this.game.spaces[key].language == language) {
	  protestant_spaces++;
	}
      }
    }
    return protestant_spaces;
  }


  returnNavalSpaces() {

    let seas = {};

    seas['irish'] = {
      top : 875 ,
      left : 900 ,
      name : "Irish Sea" ,
      ports : ["glasgow"] ,
      neighbours : ["biscay","north","channel"] ,
    }
    seas['biscay'] = {
      top : 1500 ,
      left : 1400 ,
      name : "Bay of Biscay" ,
      ports : ["brest", "nantes", "bordeaux", "corunna" ] ,
      neighbours : ["irish","channel","atlantic"] ,
    }
    seas['atlantic'] = {
      top : 2700 ,
      left : 850 ,
      name : "Atlantic Ocean" ,
      ports : ["gibraltar" , "seville" , "corunna"] ,
      neighbours : ["biscay"] ,
    }
    seas['channel'] = {
      top : 1020 ,
      left : 1450 ,
      name : "English Channel" ,
      ports : ["brest", "plymouth", "portsmouth", "rouen", "bolougne", "calais" ] ,
      neighbours : ["irish","biscay","north"] ,
    }
    seas['north'] = {
      top : 200 ,
      left : 2350 ,
      name : "North Sea" ,
      ports : ["london", "norwich", "berwick", "edinburgh", "calais", "antwerp", "amsterdam", "bremen", "hamburg" ] ,
      neighbours : ["irish","channel","baltic"] ,
    }
    seas['baltic'] = {
      top : 50 ,
      left : 3150 ,
      name : "Baltic Sea" ,
      ports : ["lubeck", "stettin" ] ,
      neighbours : ["north"] ,
    }
    seas['gulflyon'] = {
      top : 1930 ,
      left : 2430 ,
      name : "Gulf of Lyon" ,
      ports : ["cartagena", "valencia", "palma", "barcelona" , "marseille", "nice" , "genoa", "bastia" ] ,
      neighbours : ["barbary","tyrrhenian"] ,
    }
    seas['barbary'] = {
      top : 2330 ,
      left : 2430 ,
      name : "Barbary Coast" ,
      ports : ["gibraltar", "oran", "cartagena", "algiers" , "tunis", "cagliari" , "palma" ] ,
      neighbours : ["gulflyon","tyrrhenian","ionian","africa"] ,
    }
    seas['tyrrhenian'] = {
      top : 2260 ,
      left : 3300 ,
      name : "Tyrrhenian Sea" ,
      ports : ["genoa" , "bastia" , "rome" , "naples" , "palermo" , "cagliari" , "messina" ] ,
      neighbours : ["barbary","gulflyon"] ,
    }
    seas['africa'] = {
      top : 2770 ,
      left : 4200 ,
      name : "North African Coast" ,
      ports : ["tunis" , "tripoli" , "malta" , "candia" , "rhodes" ] ,
      neighbours : ["ionian","barbary","aegean"] ,
    }
    seas['aegean'] = {
      top : 2470 ,
      left : 4450 ,
      name : "Aegean Sea" ,
      ports : ["rhodes" , "candia" , "coron" , "athens" , "salonika" , "istanbul" ] ,
      neighbours : ["black","africa","ionian"] ,
    }
    seas['ionian'] = {
      top : 2390 ,
      left : 3750 ,
      name : "Ionian Sea" ,
      ports : ["malta" , "messina" , "coron", "lepanto" , "corfu" , "taranto" ] ,
      neighbours : ["black","aegean","adriatic"] ,
    }
    seas['adriatic'] = {
      top : 1790 ,
      left : 3400 ,
      name : "Adriatic Sea" ,
      ports : ["corfu" , "durazzo" , "scutari" , "ragusa" , "trieste" , "venice" , "ravenna" , "ancona" ] ,
      neighbours : ["ionian"] ,
    }
    seas['black'] = {
      top : 1450 ,
      left : 4750 ,
      name : "Black Sea" ,
      ports : ["istanbul" , "varna" ] ,
      neighbours : ["aegean"] ,
    }

    for (let key in seas) {
      seas[key].units = {};
      seas[key].units['england'] = [];
      seas[key].units['france'] = [];
      seas[key].units['hapsburg'] = [];
      seas[key].units['ottoman'] = [];
      seas[key].units['papacy'] = [];
      seas[key].units['protestant'] = [];
      seas[key].units['venice'] = [];
      seas[key].units['genoa'] = [];
      seas[key].units['hungary'] = [];
      seas[key].units['scotland'] = [];
      seas[key].units['independent'] = [];
      seas[key].key = key;
    }

    return seas;
  }

  returnSpaceName(key) {
    if (this.game.spaces[key]) { return this.game.spaces[key].name; }
    if (this.game.navalspaces[key]) { return this.game.navalspaces[key].name; }
    return "Unknown";
  }


  returnSpacesInUnrest() {
    let spaces_in_unrest = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].unrest == 1) { spaces_in_unrest.push(key); }
    }
    return spaces_in_unrest;
  }

  returnSpacesWithFactionInfantry(faction) {
    let spaces_with_infantry = [];
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].units[faction].length > 0) {
        spaces_with_infantry.push(key);
      }
    }
    return spaces_with_infantry;
  }

  returnSpaces() {

    let spaces = {};

    spaces['stirling'] = {
      top: 70,
      left: 1265,
      home: "scotland",
      political: "scotland",
      religion: "catholic",
      ports: ["irish"],
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
      ports: ["irish"],
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
      ports: ["north"],
      neighbours: ["stirling","carlisle","berwick"],
      language: "english",
      type: "key"
    }
    spaces['berwick'] = {
      top: 183,
      left: 1572,
      home: "england",
      political: "england",
      ports: ["north"],
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
      type: "town"

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
      ports: ["north"],
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
      ports: ["irish"],
      neighbours: ["shrewsbury","wales","plymouth","portsmouth","london"],
      type: "key"
    }
    spaces['london'] = {
      top: 706,
      left: 1785,
      home: "england",
      political: "england",
      religion: "catholic",
      ports: ["north"],
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
      ports: ["irish"],
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
      ports: ["channel"],
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
      ports:["north"], 
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
      ports: ["channel"],
      neighbours: ["calais","rouen","paris","stquentin"],
      language: "french",
      type: "town"
    }
    spaces['stquentin'] = {
      name: "St. Quentin",
      top: 933,
      left: 2093,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stdizier","paris","boulogne"],
      type: "town"
    }
    spaces['stdizier'] = {
      name: "St. Dizier",
      top: 1043,
      left: 2205,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["brussels","stquentin","paris","dijon","metz"],
      language: "french",
      type: "town"
    }
    spaces['paris'] = {
      top: 1063,
      left: 2009,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["rouen","boulogne","stquentin","stdizier","dijon","orleans"],
      language: "french",
      type: "key"
    }
    spaces['rouen'] = {
      top: 1000,
      left: 1805,
      home: "france",
      political: "france",
      ports: ["channel"],
      religion: "channelc",
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
      neighbours: ["stdizier","paris","orleans","lyon","besancon"],
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
      ports: ["biscay"],
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
      ports: ["channnel","biscay"],
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
      ports: ["biscay"],
      neighbours: ["navarre", "nantes","tours","limoges"],
      pass: ["navarre"],
      language: "french",
      type: "key"
    }
    spaces['lyon'] = {
      top: 1445,
      left: 2312,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["avignon","limoges","orleans","dijon","geneva","grenoble"],
      language: "french",
      type: "key"
    }
    spaces['grenoble'] = {
      top: 1590,
      left: 2437,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["turin","lyon","geneva"],
      pass: ["turin"],
      language: "french",
      type: "town"
    }
    spaces['avignon'] = {
      top: 1645,
      left: 2292,
      home: "france",
      political: "france",
      religion: "catholic",
      neighbours: ["barcelona","toulouse","lyon","marseille"],
      pass: ["barcelona"],
      language: "french",
      type: "town"
    }
    spaces['marseille'] = {
      top: 1781,
      left: 2390,
      home: "france",
      political: "france",
      religion: "catholic",
      ports: ["lyon"],
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
      neighbours: ["barcelona","bordeaux","avignon"],
      pass: ["barcelona"],
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
      ports: ["north"],
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
      ports: ["north"],
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
      ports: ["baltic"],
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
      ports: ["baltic"],
      neighbours: ["lubeck","brandenburg"],
      language: "german",
      type: "town"
    }
    spaces['brandenburg'] = {
      top: 467,
      left: 3080,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["stettin","lubeck","magdeburg","wittenberg","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['wittenberg'] = {
      top: 610,
      left: 3133,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["brandenburg","magdeburg","leipzig","prague","breslau"],
      language: "german",
      type: "electorate"
    }
    spaces['magdeburg'] = {
      top: 536,
      left: 2935,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["lubeck","brandenburg","wittenberg","erfurt","brunswick"],
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
      top: 726,
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
      neighbours: ["nuremberg","augsburg","salzburg","linz"],
      language: "german",
      type: "town"
    }
    spaces['salzburg'] = {
      top: 1108,
      left: 3147,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["graz","linz","regensburg","augsburg","innsbruck"],
      pass: ["graz"],
      language: "german",
      type: "town"
    }
    spaces['augsburg'] = {
      top: 1084,
      left: 2864,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["innsbruck","worms","nuremberg","regensburg","salzburg"],
      pass: ["innsbruck"],
      language: "german",
      type: "electorate"
    }
    spaces['nuremberg'] = {
      top: 930,
      left: 2837,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["augsburg","worms","mainz","kassel","leipzig","regensburg"],
      language: "german",
      type: "town"
    }
    spaces['mainz'] = {
      top: 872,
      left: 2668,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["trier","cologne","kassel","nuremberg","worms"],
      language: "german",
      type: "electorate"
    }
    spaces['trier'] = {
      top: 897,
      left: 2521,
      home: "",
      political: "hapsburg",
      religion: "catholic",
      neighbours: ["liege","metz","mainz"],
      language: "german",
      type: "electorate"
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
    spaces['corunna'] = {
      top: 1870,
      left: 1015,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["biscay","atlantic"],
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
      ports: ["gulflyon"],
      neighbours: ["toulouse","avignon","zaragoza","valencia"],
      pass: ["toulouse","avignon"],
      language: "spanish",
      type: "key"
    }
    spaces['palma'] = {
      top: 2266,
      left: 2211,
      home: "hapsburg",
      political: "",
      ports: ["gulflyon","barbary"],
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
      neighbours: ["cordoba","valladolid","zaragoza","valencia"],
      language: "spanish",
      type: "town"
    }
    spaces['valencia'] = {
      top: 2333,
      left: 1871,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
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
      ports: ["gulflyon","barbary"],
      neighbours: ["granada","valencia"],
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
      ports: ["atlantic"],
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
      ports: ["atlantic","barbary"],
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
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['algiers'] = {
      top: 2656,
      left: 2275,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['tunis'] = {
      top: 2599,
      left: 2945,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["barbary","africa"],
      neighbours: [],
      language: "other",
      type: "key"
    }
    spaces['cagliari'] = {
      top: 2320,
      left: 2828,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports:["tyrrhenian","barbary"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['palermo'] = {
      top: 2421,
      left: 3260,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
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
      ports: ["tyrrhenian","ionian"],
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
      ports: ["ionian"],
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
      ports: ["tyrrhenian"],
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
      ports: ["ionian","africa"],
      neighbours: [],
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
      neighbours: ["salzburg","vienna","mohacs","agram","trieste"],
      pass: ["salzburg"],
      language: "german",
      type: "town"
    }
    spaces['trieste'] = {
      top: 1392,
      left: 3257,
      home: "hapsburg",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
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
      neighbours: ["augsburg","trent","zurich","salzburg"],
      pass: ["augsburg","trent"],
      language: "german",
      type: "town"
    }
    spaces['tripoli'] = {
      top: 3030,
      left: 3316,
      home: "hapsburg ottoman",
      political: "",
      religion: "catholic",
      ports: ["north"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['candia'] = {
      top: 2670,
      left: 4484,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['rhodes'] = {
      top: 2524,
      left: 4730,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["aegean","africa"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['corfu'] = {
      top: 2210,
      left: 3868,
      home: "venice",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: [],
      language: "other",
      type: "fortress"
    }
    spaces['coron'] = {
      top: 2510,
      left: 4146,
      home: "",
      political: "",
      religion: "other",
      ports:["ionian","aegean"],
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
      ports: ["aegean"],
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
      ports: ["ionian"],
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
      neighbours: ["durazzo","lepanto","athens","salonika"],
      pass: ["durazzo"],
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
      ports: ["adriatic"],
      neighbours: ["larissa","scutari"],
      pass: ["larissa"],
      language: "other",
      type: "town"
    }
    spaces['scutari'] = {
      top: 1860,
      left: 3819,
      home: "ottoman",
      political: "",
      religion: "other",
      ports: ["adriatic"],
      neighbours: ["nezh","ragusa","durazzo"],
      pass: ["nezh"],
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
      ports: ["black","aegean"],
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
      ports: ["black"],
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
      neighbours: ["szegedin","sofia","bucharest","belgrade"],
      pass: ["szegedin","sofia"],
      language: "other",
      type: "town"
    }
    spaces['sofia'] = {
      top: 1765,
      left: 4275,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["nicopolis","nezh","edirne"],
      pass: ["nicopolis"],
      language: "other",
      type: "town"
    }
    spaces['nezh'] = {
      top: 1652,
      left: 4070,
      home: "ottoman",
      political: "",
      religion: "other",
      neighbours: ["scutari","belgrade","sofia"],
      pass: ["scutari"],
      language: "other",
      type: "town"
    }


    spaces['belgrade'] = {
      top: 1450,
      left: 3894,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["ragusa","szegedin","mohacs","agram","nezh","nicopolis"],
      pass: ["ragusa"],
      language: "other",
      type: "key"
    }
    spaces['szegedin'] = {
      top: 1268,
      left: 3846,
      home: "hungary",
      political: "",
      religion: "catholic",
      neighbours: ["nicopolis","buda","belgrade"],
      pass: ["nicopolis"],
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
      neighbours: ["zara","graz","trieste","belgrade","mohacs"],
      pass: ["zara"],
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
      ports: ["north"],
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
      ports: ["north"],
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
      neighbours: ["basel","besancon","lyon","turin","grenoble"],
      pass: ["turin"],
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
      neighbours: ["innsbruck","milan","modena","venice"],
      pass: ["innsbruck"],
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
      neighbours: ["milan","pavia","geneva","grenoble","genoa"],
      pass: ["grenoble","geneva"],
      language: "italian",
      type: "town"
    }
    spaces['nice'] = {
      top: 1733,
      left: 2580,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["gulflyon"],
      neighbours: ["genoa","marseille"],
      pass: ["genoa"],
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
      ports: ["gulflyon","tyrrhenian"],
      neighbours: [],
      language: "other",
      type: "town"
    }
    spaces['genoa'] = {
      top: 1626,
      left: 2726,
      home: "genoa",
      political: "",
      religion: "catholic",
      ports: ["gulflyon","tyrrhenian"],
      neighbours: ["nice","pavia","turin","modena","siena"],
      pass: ["nice"],
      language: "italian",
      type: "key"
    }
    spaces['rome'] = {
      top: 1924,
      left: 3125,
      home: "papacy",
      political: "",
      religion: "catholic",
      ports: ["tyrrhenian"],
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
      ports: ["adriatic"],
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
      ports: ["adriatic"],
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
      ports:["adriatic"],
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
      neighbours: ["agram","ragusa","trieste"],
      pass: ["agram"],
      language: "other",
      type: "town"
    }
    spaces['ragusa'] = {
      top: 1750,
      left: 3660,
      home: "independent",
      political: "",
      religion: "catholic",
      ports: ["adriatic"],
      neighbours: ["belgrade","zara","scutari"],
      pass: ["belgrade"],
      language: "italian",
      type: "town"
    }

    //
    // foreign war cards are spaces
    //
    spaces['egypt'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['ireland'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }
    spaces['persia'] = {
      top: 0,
      left: 0,
      home: "independent",
      political: "",
      religion: "",
      ports: [],
      neighbours: [],
      pass: [],
      language: "",
      type: "war"
    }

    for (let key in spaces) {
      spaces[key].units = {};
      spaces[key].units['england'] = [];
      spaces[key].units['france'] = [];
      spaces[key].units['hapsburg'] = [];
      spaces[key].units['ottoman'] = [];
      spaces[key].units['papacy'] = [];
      spaces[key].units['protestant'] = [];
      spaces[key].units['venice'] = [];
      spaces[key].units['genoa'] = [];
      spaces[key].units['hungary'] = [];
      spaces[key].units['scotland'] = [];
      spaces[key].units['independent'] = [];
      spaces[key].university = 0;
      spaces[key].unrest = 0;
      if (!spaces[key].ports) { spaces[key].ports = []; }
      if (!spaces[key].pass) { spaces[key].pass = []; }
      if (!spaces[key].name) { spaces[key].name = key.charAt(0).toUpperCase() + key.slice(1); }
      if (!spaces[key].key) { spaces[key].key = key; }
      if (!spaces[key].besieged) { spaces[key].besieged = 0; }
      if (!spaces[key].besieged_factions) { spaces[key].besieged_factions = []; }
    }

    return spaces;

  }


  isOccupied(space) {

    try { if (this.game.spaces[space]) { space = this.game.spaces[space]; } } catch (err) {}

    for (let key in space.units) {
      if (space.units[key].length > 0) { return 1; }
    }

    return 0;
  }

  isElectorate(spacekey) {

    try { if (spacekey.key) { spacekey = spacekey.key; } } catch (err) {}

    if (spacekey === "augsburg") { return 1; }
    if (spacekey === "trier") { return 1; }
    if (spacekey === "cologne") { return 1; }
    if (spacekey === "wittenberg") { return 1; }
    if (spacekey === "mainz") { return 1; }
    if (spacekey === "brandenburg") { return 1; }
    return 0;
  }

  //
  // import space attaches events / functions to spaces if they do not exist
  //
  importSpace(obj, key) {

    let his_self = this;

    obj.key = key;

    if (obj.name == null)               { obj.name = "Unknown"; }
    if (obj.owner == null)              { obj.owner = -1; }          
    if (obj.type == null)               { obj.type = "town"; }     
    if (obj.debaters == null)           { obj.debaters = []; }     
    if (obj.returnView == null)		{ 

      obj.returnView = function () {

	let html = '<div class="space_view" id="">';

	let home = obj.home;
	let religion = obj.religion;
	let political = obj.political;
	let language = obj.language;
	if (!political) { political = obj.home; }

	if (political == "genoa" || political == "venice" || political == "scotland" || political == "hungary" || political == "independent") { his_self.game.state.board[political] = his_self.returnOnBoardUnits(political); } else {
	  if (home == "genoa" || home == "venice" || home == "scotland" || home == "hungary" || home == "independent") { his_self.game.state.board[home] = his_self.returnOnBoardUnits(home); }
	}

	html += `
	  <div class="space_name">${obj.name}</div>
	  <div class="space_properties">
	    <div class="religion"><div class="${religion}" style="background-image: url('${his_self.returnReligionImage(religion)}')"></div><div class="label">${religion} religion</div></div>
	    <div class="political"><div class="${political}" style="background-image: url('${his_self.returnControlImage(political)}')"></div><div class="label">${political} control</div></div>
	    <div class="language"><div class="${language}" style="background-image: url('${his_self.returnLanguageImage(language)}')"></div><div class="label">${language} language</div></div>
	    <div class="home"><div class="${home}" style="background-image: url('${his_self.returnControlImage(home)}')"></div><div class="label">${home} home</div></div>
	  </div>
	  <div class="space_units">
	`;

        for (let key in obj.units) {
	  html += his_self.returnArmyTiles(key, obj.key);
	  html += his_self.returnMercenaryTiles(key, obj.key);
	  html += his_self.returnPersonagesTiles(key, obj.key);
	  html += his_self.returnNavalTiles(key, obj.key);
        }

        for (let f in this.units) {
	  if (this.units[f].length > 0) {
            for (let i = 0; i < this.units[f].length; i++) {
	      let b = "";
	      if (this.units[f][i].besieged) { b = ' (besieged)'; }
	      html += `<div class="space_unit">${f} - ${this.units[f][i].type} ${b}</div>`;
	    }
	  }
	}

	html += `</div>`;
	html += `</div>`;

	return html;

      };

    }

    return obj;

  }



  onNewRound() {
  }

  onNewTurn() {
  }

  returnState() {

    let state = {};

    state.events = {};
    state.players = [];
    state.removed = []; // removed cards
    state.turn = 1;
    state.skip_counter_or_acknowledge = 0; // don't skip

    state.active_player = -1;

    return state;

  }


  //
  // Core Game Logic
  //
  async handleGameLoop() {

    let paths_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
	let z = this.returnEventObjects();
        let shd_continue = 1;

console.log("QUEUE: " + JSON.stringify(this.game.queue));
console.log("MOVE: " + mv[0]);

	//
	// entry point for every round in the game
	//
        if (mv[0] === "round") {

	  this.game.state.turn++;
	   
this.updateLog(`###############`);
this.updateLog(`### Turn ${this.game.state.turn} ###`);
this.updateLog(`###############`);

	  this.onNewTurn();

	  this.game.state.cards_left = {};

	}

        if (mv[0] == "init") {
          this.game.queue.splice(qe, 1);
	  return 1;
        }

	if (mv[0] === "show_overlay") {

	  //
	  // hide any cardbox
	  //
	  this.cardbox.hide();

	  if (mv[1] === "zoom") {
	    let lz = mv[2];
	    this.zoom_overlay.render(lz);
          }
          this.game.queue.splice(qe, 1);
	  return 1;
	}
	if (mv[0] === "hide_overlay") {
	  if (mv[1] === "zoom") { this.theses_overlay.hide(); }
          this.game.queue.splice(qe, 1);
	  return 1;
	}


        if (mv[0] === "card") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayCard(card, p, faction);
	  }

	  return 0;

	}

        if (mv[0] === "ops") {

	  this.game.queue.splice(qe, 1);

	  let faction = mv[1];
	  let card = mv[2];
	  let opsnum = parseInt(mv[3]);
 
          this.updateLog(this.returnFactionName(faction) + " plays " + this.popup(card) + " for ops");

	  let p = this.returnPlayerOfFaction(faction);

	  if (this.game.player === p) {
	    this.playerPlayOps(card, faction, opsnum);
	  } else {
	    this.updateStatus(this.returnFactionName(faction) + " playing ops");
	  }

	  return 0;

	}

	//
	// objects and cards can add commands
	//
        for (let i in z) {
          if (!z[i].handleGameLoop(this, qe, mv)) { return 0; }
        }


        //
        // avoid infinite loops
        //
        if (shd_continue == 0) {
          console.log("NOT CONTINUING");
          return 0;
        }

    } // if cards in queue

    return 1;

  }




  returnPlayers(num = 0) {

    var players = [];
    return players;

  }





} // end and export

module.exports = PathsOfGlory;


