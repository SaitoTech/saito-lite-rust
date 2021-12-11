
      //
      // finished initializing game objects
      //
      this.displayBoard();

    } catch (err) {}
  }



  //
  // manually announce arcade banner support
  //
  respondTo(type) {

    if (super.respondTo(type) != null) {
      return super.respondTo(type);
    }

    if (type == "arcade-carousel") {
      let obj = {};
      obj.background = "/his/img/arcade/arcade-banner-background.png";
      obj.title = "Here I Stand";
      return obj;
    }
   
    return null;
 
  }




  initializeHTML(app) {

    if (this.browser_active == 0) { return; }

    super.initializeHTML(app);

    this.app.modules.respondTo("chat-manager").forEach(mod => {
      mod.respondTo('chat-manager').render(app, this);
      mod.respondTo('chat-manager').attachEvents(app, this);
    });

    // required here so menu will be proper
    try {
      if (this.app.options.gameprefs.hereistand_expert_mode == 1) {
        this.confirm_moves = 0;
      } else {
        this.confirm_moves = 1;
      }
    } catch (err) {}


    this.menu.addMenuOption({
      text : "Game",
      id : "game-game",
      class : "game-game",
      callback : function(app, game_mod) {
	game_mod.menu.showSubMenu("game-game");
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
          game_mod.saveGamePreference('twilight_expert_mode', 0);
	  window.location.reload();	
	} else {
	  game_mod.confirm_moves = 0;
          game_mod.saveGamePreference('twilight_expert_mode', 1);
	  window.location.reload();	
	}
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
    this.menu.addSubMenuOption("game-game", {
      text : "Exit",
      id : "game-exit",
      class : "game-exit",
      callback : function(app, game_mod) {
        window.location.href = "/arcade";
      }
    });


    this.menu.addMenuOption({
      text : "Cards",
      id : "game-cards",
      class : "game-cards",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleCardsMenu();
      }
    });
    this.menu.addMenuOption({
      text : "Display",
      id : "game-display",
      class : "game-display",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        game_mod.handleDisplayMenu();
      }
    });


    let main_menu_added = 0;
    let community_menu_added = 0;
    for (let i = 0; i < this.app.modules.mods.length; i++) {
      if (this.app.modules.mods[i].slug === "chat") {
	for (let ii = 0; ii < this.game.players.length; ii++) {
	  if (this.game.players[ii] != this.app.wallet.returnPublicKey()) {

	    // add main menu
	    if (main_menu_added == 0) {
              this.menu.addMenuOption({
                text : "Chat",
          	id : "game-chat",
          	class : "game-chat",
          	callback : function(app, game_mod) {
		  game_mod.menu.showSubMenu("game-chat");
          	}
              })
	      main_menu_added = 1;
	    }

	    if (community_menu_added == 0) {
    	      this.menu.addSubMenuOption("game-chat", {
    	        text : "Community",
      	        id : "game-chat-community",
      	        class : "game-chat-community",
      	        callback : function(app, game_mod) {
	  	  game_mod.menu.hideSubMenus();
        	  chatmod.sendEvent('chat-render-request', {});
                  chatmod.mute_community_chat = 0;
		  chatmod.openChatBox();
    	        }
              });
	      community_menu_added = 1;
	    }

	    // add peer chat
  	    let data = {};
	    let members = [this.game.players[ii], this.app.wallet.returnPublicKey()].sort();
	    let gid = this.app.crypto.hash(members.join('_'));
	    let name = "Player "+(ii+1);
	    let chatmod = this.app.modules.mods[i];
	
    	    this.menu.addSubMenuOption("game-chat", {
    	      text : name,
      	      id : "game-chat-"+(ii+1),
      	      class : "game-chat-"+(ii+1),
      	      callback : function(app, game_mod) {
		game_mod.menu.hideSubMenus();
	        chatmod.createChatGroup(members, name);
		chatmod.openChatBox(gid);
        	chatmod.sendEvent('chat-render-request', {});
        	chatmod.saveChat();
    	      }
            });
	  }
	}
      }
    }
    this.menu.addMenuIcon({
      text : '<i class="fa fa-window-maximize" aria-hidden="true"></i>',
      id : "game-menu-fullscreen",
      callback : function(app, game_mod) {
	game_mod.menu.hideSubMenus();
        app.browser.requestFullscreen();
      }
    });
    this.menu.render(app, this);
    this.menu.attachEvents(app, this);

    this.log.render(app, this);
    this.log.attachEvents(app, this);

    this.cardbox.render(app, this);
    this.cardbox.attachEvents(app, this);


    //
    // add card events -- text shown and callback run if there
    //
    this.hud.addCardType("logcard", "", null);
    this.hud.addCardType("card", "select", this.cardbox_callback);
    if (!app.browser.isMobileBrowser(navigator.userAgent)) {
      this.cardbox.skip_card_prompt = 1;
    }


    try {

      if (app.browser.isMobileBrowser(navigator.userAgent)) {

        this.hammer.render(this.app, this);
        this.hammer.attachEvents(this.app, this, '.gameboard');

      } else {

	let his_self = this;

        this.sizer.render(this.app, this);
        this.sizer.attachEvents(this.app, this, '.gameboard');

        $('#gameboard').draggable({
	  stop : function(event, ui) {
	    his_self.saveGamePreference((his_self.returnSlug()+"-board-offset"), ui.offset);
	  }
	});

      }

    } catch (err) {}

    this.hud.render(app, this);
    this.hud.attachEvents(app, this);

  }




  displayBoard() {
    this.updateLog("updating board display");
  }




  //
  // Core Game Logic
  //
  handleGameLoop() {

    let his_self = this;

    ///////////
    // QUEUE //
    ///////////
    if (this.game.queue.length > 0) {

        let qe = this.game.queue.length-1;
        let mv = this.game.queue[qe].split("\t");
        let shd_continue = 1;

        //
        // round
        // init
	//
        if (mv[0] == "init") {
	  this.updateLog("init game");
          this.game.queue.splice(qe, 1);
        }

        if (mv[0] === "round") {

	  //
	  // restore state
	  //


	  //
	  // collect stats
	  //
	  if (this.game.state.round > 1) {
	    //this.game.state.stats.round.push({});
	    //this.game.state.stats.round[this.game.state.stats.round.length-1].us_scorings = this.game.state.stats.us_scorings;
	  }

	  //
          // if we have come this far, move to the next turn
          //
          this.updateStatus("<div class='status-message' id='status-message'><span>Preparing for round</span> " + this.game.state.round+"</div>");

          this.game.queue.push("turn");
          for (let i = this.game.players.length; i > 0; i++) {
            this.game.queue.push(`play\t${i}`);
          }

          return 1;
        }


        if (mv[0] === "play") {

          this.displayBoard();
          this.playMove();
          return 0;
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



  playerTurn(selected_card=null) {

    this.startClock();

    let his_self = this;

    this.updateStatusAndListCards(user_message, this.game.deck[0].hand);
    twilight_self.addShowCardEvents(function(card) {
      twilight_self.playerTurnCardSelected(card, player);
    });

  }




  ////////////////////
  // Core Game Data //
  ////////////////////
  returnState() {

    let state = {};

    state.players = [];
    state.events = {};

  }

  returnCountries() {

    let countries = {};

    //countries['canada'] = { top : 752, left : 842 , us : 2 , ussr : 0 , control : 4 , bg : 0 , neighbours : [ 'uk' ] , region : "europe" , name : "Canada" };

    return countries;

  }


  returnCards() {

    var deck = {};

    // EARLY WAR
    //deck['asia']            = { img : "TNRnTS-01" , name : "Asia Scoring", scoring : 1 , player : "both" , recurring : 1 , ops : 0 };

    return deck;

  }



  returnGameOptionsHTML() {

    return `
      <div style="padding:40px;width:100vw;height:100vh;overflow-y:scroll;display:grid;grid-template-columns: 200px auto">
	<div style="top:0;left:0;">
            <label for="player1">Play as:</label>
            <select name="player1">
              <option value="random" selected>random</option>
              <option value="ussr">Protestants</option>
              <option value="us">Hapsburgs</option>
            </select>
	    <div id="game-wizard-advanced-return-btn" class="game-wizard-advanced-return-btn button">accept</div>
	</div>
    </div>
          `;

  }

} // end and export

module.exports = HereIStand;


