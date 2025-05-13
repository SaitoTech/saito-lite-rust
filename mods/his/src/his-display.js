
  displayCustomOverlay(c="", msg="") {

    //
    // move HUD above winter if winter is showing
    //
    this.welcome_overlay.pullHudOverOverlay();
    this.welcome_overlay.pushHudUnderOverlay();

    if (document.querySelector(".winter")) {
      this.welcome_overlay.overlay.zIndex = this.winter_overlay.overlay.zIndex + 2;
    }

    if (c === "all_corsairs_destroyed") {
        this.welcome_overlay.renderCustom({
          title : "Piracy Fails" , 
          text : "All Corsairs destroyed by Defensive Fire" ,
          card : "" ,
          img : '/his/img/backgrounds/corsairs_destroyed.jpg',
          styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
    }

    if (c === "depleted") {
        this.welcome_overlay.renderCustom({
          title : "Depleted Conquest" , 
          text : msg ,
          card : "" ,
          img : '/his/img/backgrounds/newworld/depleted_conquest.jpeg',
          styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
    }

    if (c === "deserted") {
      this.welcome_overlay.renderCustom({
        title : "Deserted Colony" , 
        text : msg ,
        card : "" ,
        img : '/his/img/backgrounds/newworld/deserted_colony.png',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "protestants") {
      this.welcome_overlay.renderCustom({
        title : "New to the Protestants?" , 
        text : "Why not play cards for OPS and publish treatises in Germany? " ,
        card : this.returnCardImage("065") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "excommunication") {
      this.welcome_overlay.renderCustom({
        title : "Excommunicated!" , 
        text : this.returnFactionName(msg) + " has been excommunicated by Papal Decree" ,
        card : this.returnCardImage("005") ,
        img : '/his/img/backgrounds/events/excommunication.jpg',
      });
      return;
    }
    if (c === "protestant") {
      this.welcome_overlay.renderCustom({
        title : "New to the Protestants?" , 
        text : "Use OPS to publish treatises and convert more spaces to Protestantism" ,
        card : this.returnCardImage("007") ,
        img : '/his/img/backgrounds/move/printing_press.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "papacy") {
      this.welcome_overlay.renderCustom({
        title : "New to the Papacy?" , 
        text : "Why not use your OPS to control Siena and move an invasion force to Florence?" ,
        card : this.returnCardImage("067") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "ottoman") {
      this.welcome_overlay.renderCustom({
        title : "New to the Ottomans?" , 
        text : "Why not use your OPS to invade Hungary and expand your empire?" ,
        card : this.returnCardImage("042") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "england") {
      this.welcome_overlay.renderCustom({
        title : "New to England?" , 
        text : "Why not use your Home Card to declare war on Scotland or France?" ,
        card : this.returnCardImage("003") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "france") {
      this.welcome_overlay.renderCustom({
        title : "New to France?" , 
        text : "Establishing Colonies and building Chateaux is crucial early-game! " ,
        card : this.returnCardImage("004") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "hapsburg") {
      this.welcome_overlay.renderCustom({
        title : "New to the Hapsburgs?" , 
        text : "Are there any independent keys you can conquer this turn? ",
        card : this.returnCardImage("002") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "lost-at-sea") {
      this.welcome_overlay.renderCustom({
        title : "New World Losses" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/lost_at_sea.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "killed") {
      this.welcome_overlay.renderCustom({
        title : "New World Losses" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/killed.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "stlawrence") {
      this.welcome_overlay.renderCustom({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/st_lawrence.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "mississippi") {
      this.welcome_overlay.renderCustom({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/mississippi.jpg',
	styles : [{ key : "backgroundPosition" , val : "center" }],
      });
      return;
    }

    if (c === "greatlakes") {
      this.welcome_overlay.renderCustom({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/greatlakes.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "amazon") {
      this.welcome_overlay.renderCustom({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/amazon3.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "pacificstrait") {
      this.welcome_overlay.renderCustom({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/pacificstrait.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "circumnavigation") {
      this.welcome_overlay.renderCustom({
        title : "New World Achievement" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/circumnavigation.jpg',
      });
      return;
    }

    if (c === "aztec") {
      this.welcome_overlay.renderCustom({
        title : "New World Conquest" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/aztec.jpg',
      });
      return;
    }

    if (c === "maya") {
      this.welcome_overlay.renderCustom({
        title : "New World Conquest" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/inca.jpg',
      });
      return;
    }

    if (c === "inca") {
      this.welcome_overlay.renderCustom({
        title : "New World Conquest" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/inca2.jpg',
      });
      return;
    }

    if (c === "battle-of-mohacs") {
      let t = "The Ottoman subjugation of Hungary-Bohemia forces the Hapsburg Empire to intervene on the side of Christian Europe and in pre-emptive defense of Vienna";
      if (this.areEnemies("hapsburg", "ottoman")) {  
      t = "The Ottoman subjugation of Hungary-Bohemia prompts a Hapsburg-Hungarian Alliance in defense of Christian Europe and the city of Vienna";
      }
      this.welcome_overlay.renderCustom({
        title : "War between the Hapsburg and Ottoman Empires" ,
	text : t,
        img : '/his/img/backgrounds/battle-of-mohacs.jpeg',
      });
      return;
    }

    if (c === "war") {
      this.welcome_overlay.renderCustom({
        title : "War!" ,
        text : msg ,
        img : '/his/img/backgrounds/war_horse.png',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "colonize") {
      this.welcome_overlay.renderCustom({
        title : msg ,
        text : "Colonies earn factions bonus cards in the New World Phase",
        img : '/his/img/backgrounds/move/colonize.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "translate") {
      this.welcome_overlay.renderCustom({
        title : msg ,
        text : "Protestants advance in biblical translation",
        img : '/his/img/backgrounds/move/translate.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "stpeters") {
      this.welcome_overlay.renderCustom({
        title : msg ,
        text : "The Papacy continues to build St. Peter's Basilica",
        img : '/his/img/backgrounds/move/saint_peters.png',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "overcapacity") {
      this.welcome_overlay.renderCustom({
        title : msg ,
        text : "Merge units until you have a 1-unit token free and can build more. See <b>Info > Units</b> for faction limits.",
        img : '/his/img/backgrounds/move/regular.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "conquest") {
      this.welcome_overlay.renderCustom({
        title : msg ,
        text : "Conquests earn factions Victory Points and bonus cards in the New World Phase",
        img : '/his/img/backgrounds/newworld/inca2.jpg',
	styles : [{ key : "backgroundPosition" , val : "center" }],
      });
      return;
    }

    if (c === "spring_deployment") {
      this.welcome_overlay.renderCustom({
        title : "Spring Deployment" ,
        text : "At the start of each round, players may move troops from their capital along any line of spaces controlled by them or their allies. Units may not cross passes or seas containing enemy ships. <b>New players can safely ignore Spring Deployment first turn</b>.",
        img : '/his/img/backgrounds/spring-deployment.jpeg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "diet_of_worms") {
      if (this.game.players.length == 2) {
        this.welcome_overlay.renderCustom({
          title : "Diet of Worms" ,
          text : "Protestants pick a card and add 4. Papacy picks a card and adds the value of a card drawn randomly from the deck. Dice are rolled and the winner flips the difference in hits to the Protestant or Catholic religion.",
          img : '/his/img/backgrounds/diet_of_worms.jpeg',
	  styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
      } else {
        this.welcome_overlay.renderCustom({
          title : "Diet of Worms" ,
          text : "Protestants pick a card and add 4. Papacy and Hapsburg both pick cards and combine their values. Dice are rolled and the winner flips the difference in hits to the Protestant or Catholic religion.",
          img : '/his/img/backgrounds/diet_of_worms.jpeg',
	  styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
      }
    }

    if (c === "explore") {
      this.welcome_overlay.renderCustom({
        title : msg,
        text : "Explorations earn Victory Points for strategic discoveries in the New World Phase",
        img : '/his/img/backgrounds/move/explore.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    let deck = this.returnDeck(true); // include removed
    if (deck[c]) {
      if (deck[c].returnCustomOverlay) {

        let obj = deck[c].returnCustomOverlay();    
        let title = obj.title;
        let text = obj.text;
        let img = obj.img;
        let card = this.returnCardImage(c);

        if (msg == "") {
    	  msg = this.popup(c) + " triggers";
        }
  
        this.welcome_overlay.renderCustom({
          text : text,
          title : title,
          img : img,
          card : card,
        });
      }
    }

  }

  displayHudPopup(c="", msg="") {

    if (c === "all_corsairs_destroyed") {
        this.hud_popup.render({
          title : "Piracy Fails" , 
          text : "All Corsairs destroyed by Defensive Fire" ,
          card : "" ,
          img : '/his/img/backgrounds/corsairs_destroyed.jpg',
          styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
    }

    if (c === "depleted") {
        this.hud_popup.render({
          title : "Depleted Conquest" , 
          text : msg ,
          card : "" ,
          img : '/his/img/backgrounds/newworld/depleted_conquest.jpeg',
          styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
    }

    if (c === "war") {
      this.hud_popup.render({
        title : "War" ,
        text : msg ,
        img : '/his/img/backgrounds/war_horse.png',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "deserted") {
      this.hud_popup.render({
        title : "Deserted Colony" , 
        text : msg ,
        card : "" ,
        img : '/his/img/backgrounds/newworld/deserted_colony.png',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "protestants") {
      this.hud_popup.render({
        title : "New to the Protestants?" , 
        text : "Why not play cards for OPS and publish treatises in Germany? " ,
        card : this.returnCardImage("065") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "excommunication") {
      this.hud_popup.render({
        title : "Excommunicated!" , 
        text : this.returnFactionName(msg) + " has been excommunicated by Papal Decree" ,
        card : this.returnCardImage("005") ,
        img : '/his/img/backgrounds/events/excommunication.jpg',
      });
      return;
    }
    if (c === "protestant") {
      this.hud_popup.render({
        title : "New to the Protestants?" , 
        text : "Use OPS to publish treatises and convert more spaces to Protestantism" ,
        card : this.returnCardImage("007") ,
        img : '/his/img/backgrounds/move/printing_press.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "papacy") {
      this.hud_popup.render({
        title : "New to the Papacy?" , 
        text : "Why not use your OPS to control Siena and move an invasion force to Florence?" ,
        card : this.returnCardImage("067") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "ottoman") {
      this.hud_popup.render({
        title : "New to the Ottomans?" , 
        text : "Why not use your OPS to invade Hungary and expand your empire?" ,
        card : this.returnCardImage("042") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "england") {
      this.hud_popup.render({
        title : "New to England?" , 
        text : "Why not use your Home Card to declare war on Scotland or France?" ,
        card : this.returnCardImage("003") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "france") {
      this.hud_popup.render({
        title : "New to France?" , 
        text : "Establishing Colonies and building Chateaux is crucial early-game! " ,
        card : this.returnCardImage("004") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }
    if (c === "hapsburg") {
      this.hud_popup.render({
        title : "New to the Hapsburgs?" , 
        text : "Are there any independent keys you can conquer this turn? ",
        card : this.returnCardImage("002") ,
        img : '/his/img/backgrounds/tutorials/95theses.jpg',
        styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "lost-at-sea") {
      this.hud_popup.render({
        title : "New World Losses" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/lost_at_sea.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "killed") {
      this.hud_popup.render({
        title : "New World Losses" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/killed.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "stlawrence") {
      this.hud_popup.render({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/st_lawrence.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "mississippi") {
      this.hud_popup.render({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/mississippi.jpg',
	styles : [{ key : "backgroundPosition" , val : "center" }],
      });
      return;
    }

    if (c === "greatlakes") {
      this.hud_popup.render({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/greatlakes.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "amazon") {
      this.hud_popup.render({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/amazon3.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "pacificstrait") {
      this.hud_popup.render({
        title : "New World Discovery" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/pacificstrait.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "circumnavigation") {
      this.hud_popup.render({
        title : "New World Achievement" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/circumnavigation.jpg',
      });
      return;
    }

    if (c === "aztec") {
      this.hud_popup.render({
        title : "New World Conquest" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/aztec.jpg',
      });
      return;
    }

    if (c === "maya") {
      this.hud_popup.render({
        title : "New World Conquest" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/inca.jpg',
      });
      return;
    }

    if (c === "inca") {
      this.hud_popup.render({
        title : "New World Conquest" ,
        text : msg ,
        img : '/his/img/backgrounds/newworld/inca2.jpg',
      });
      return;
    }

    if (c === "battle-of-mohacs") {
      let t = "The Ottoman subjugation of Hungary-Bohemia forces the Hapsburg Empire to intervene on the side of Christian Europe and in pre-emptive defense of Vienna";
      if (this.areEnemies("hapsburg", "ottoman")) {  
        t = "The Ottoman subjugation of Hungary-Bohemia prompts a Hapsburg-Hungarian Alliance in defense of Christian Europe and the city of Vienna";
      }
      this.hud_popup.render({
        title : "War between the Hapsburg and Ottoman Empires" ,
	text : t,
        img : '/his/img/backgrounds/battle-of-mohacs.jpeg',
      });
      return;
    }

    if (c === "colonize") {
      this.hud_popup.render({
        title : msg ,
        text : "Colonies earn factions bonus cards in the New World Phase",
        img : '/his/img/backgrounds/move/colonize.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "conquest") {
      this.hud_popup.render({
        title : msg ,
        text : "Conquests earn factions Victory Points and bonus cards in the New World Phase",
        img : '/his/img/backgrounds/newworld/inca2.jpg',
	styles : [{ key : "backgroundPosition" , val : "center" }],
      });
      return;
    }

    if (c === "spring_deployment") {
      this.hud_popup.render({
        title : "Spring Deployment" ,
        text : "At the start of each round, players may move troops from their capital along any line of spaces controlled by them or their allies. Units may not cross passes or seas containing enemy ships. <b>New players can safely ignore Spring Deployment first turn</b>.",
        img : '/his/img/backgrounds/spring-deployment.jpeg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "diet_of_worms") {
      if (this.game.players.length == 2) {
        this.hud_popup.render({
          title : "Diet of Worms" ,
          text : "Protestants pick a card and add 4. Papacy picks a card and adds the value of a card drawn randomly from the deck. Dice are rolled and the winner flips the difference in hits to the Protestant or Catholic religion.",
          img : '/his/img/backgrounds/diet_of_worms.jpeg',
	  styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
      } else {
        this.hud_popup.render({
          title : "Diet of Worms" ,
          text : "Protestants pick a card and add 4. Papacy and Hapsburg both pick cards and combine their values. Dice are rolled and the winner flips the difference in hits to the Protestant or Catholic religion.",
          img : '/his/img/backgrounds/diet_of_worms.jpeg',
	  styles : [{ key : "backgroundPosition" , val : "bottom" }],
        });
        return;
      }
    }

    if (c === "explore") {
      this.hud_popup.render({
        title : msg,
        text : "Explorations earn Victory Points for strategic discoveries in the New World Phase",
        img : '/his/img/backgrounds/move/explore.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "translate") {
      this.hud_popup.render({
        title : msg ,
        text : "Protestants advance in biblical translation",
        img : '/his/img/backgrounds/move/translate.jpg',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    if (c === "stpeters") {
      this.hud_popup.render({
        title : msg ,
        text : "The Papacy continues to build St. Peter's Basilica",
        img : '/his/img/backgrounds/move/saint_peters.png',
	styles : [{ key : "backgroundPosition" , val : "bottom" }],
      });
      return;
    }

    let deck = this.returnDeck(true); // include removed
    if (deck[c]) {
      if (deck[c].returnCustomOverlay) {

        let obj = deck[c].returnCustomOverlay();    
        let title = obj.title;
        let text = obj.text;
        let img = obj.img;
        let card = this.returnCardImage(c);

        if (msg == "") {
    	  msg = this.popup(c) + " triggers";
        }

        this.hud_popup.render({
          text : text,
          title : title,
          img : img,
          card : card,
        });
      }
    }

  }

  hideOverlays() {
    this.debate_overlay.hide();
    this.treatise_overlay.hide();
    this.religious_overlay.hide();
    this.faction_overlay.hide();
    this.diet_of_worms_overlay.hide();
    this.council_of_trent_overlay.hide();
    this.theses_overlay.hide();
    this.reformation_overlay.hide();
    this.language_zone_overlay.hide();
    this.debaters_overlay.hide();
    this.schmalkaldic_overlay.hide();
    this.assault_overlay.hide();
    this.field_battle_overlay.hide();
    this.movement_overlay.hide();
    this.welcome_overlay.hide();
    this.deck_overlay.hide();
    this.menu_overlay.hide();
    this.winter_overlay.hide();
    this.units_overlay.hide();
  }

  returnReligionImage(religion) {
    if (religion === "protestant") { return "/his/img/tiles/abstract/protestant.png"; }
    if (religion === "catholic") { return "/his/img/tiles/abstract/catholic.png"; }
    return "/his/img/tiles/abstract/independent.svg";
  }

  returnLanguageImage(language) {

    if (language == "english") { return "/his/img/tiles/abstract/english.png"; }
    if (language == "french") { return "/his/img/tiles/abstract/french.png"; }
    if (language == "spanish") { return "/his/img/tiles/abstract/spanish.png"; }
    if (language == "italian") { return "/his/img/tiles/abstract/italian.png"; }
    if (language == "german") { return "/his/img/tiles/abstract/german.png"; }

    return "/his/img/tiles/abstract/other.png";

  }

  returnControlImage(faction) {

    if (faction == "papacy") { return "/his/img/tiles/abstract/papacy.svg"; }
    if (faction == "protestant") { return "/his/img/tiles/abstract/protestant.svg"; }
    if (faction == "england") { return "/his/img/tiles/abstract/england.svg"; }
    if (faction == "france") { return "/his/img/tiles/abstract/france.svg"; }
    if (faction == "ottoman") { return "/his/img/tiles/abstract/ottoman.svg"; }
    if (faction == "hapsburg") { return "/his/img/tiles/abstract/hapsburg.svg"; }

    return "/his/img/tiles/abstract/independent.svg";   

  }

  displayCardsLeft() {
    try {
    for (let key in this.game.state.cards_left) {

      let qs = ".game-factions .game-menu-sub-options ";
      if (key === "hapsburg") { 
        qs += ".game-hapsburg .game-menu-option-label";
	document.querySelector(qs).innerHTML = `Hapsburgs (${this.game.state.cards_left[key]} cards)`;
      }
      if (key === "france") { 
        qs += ".game-france .game-menu-option-label";
	document.querySelector(qs).innerHTML = `France (${this.game.state.cards_left[key]} cards)`;
      }
      if (key === "ottoman") { 
        qs += ".game-ottoman .game-menu-option-label";
	document.querySelector(qs).innerHTML = `Ottoman (${this.game.state.cards_left[key]} cards)`;
      }
      if (key === "england") { 
        qs += ".game-england .game-menu-option-label";
	document.querySelector(qs).innerHTML = `England (${this.game.state.cards_left[key]} cards)`;
      }
      if (key === "protestants" || key == "protestant") { 
        qs += ".game-protestants .game-menu-option-label";
	document.querySelector(qs).innerHTML = `Protestants (${this.game.state.cards_left[key]} cards)`;
      }
      if (key === "papacy") { 
        qs += ".game-papacy .game-menu-option-label";
	document.querySelector(qs).innerHTML = `Papacy (${this.game.state.cards_left[key]} cards)`;
      }
    }
    } catch (err) {}
  }

  displayTurnTrack() {
    try {
      let obj = document.querySelector(".turntrack");
      obj.classList.remove(`turntrack1`);
      obj.classList.remove(`turntrack${this.game.state.round-1}`);
      obj.classList.add(`turntrack${this.game.state.round}`);
    } catch (err) {}
  }

  displayDiplomacyTable() { this.displayWarBox(); }
  displayWarBox() {
    try {
    let factions = ["ottoman","hapsburg","england","france","papacy","protestant","genoa","hungary","scotland","venice"];
    for (let i = 0; i < factions.length; i++) {
      for (let ii = 0; ii < factions.length; ii++) {
	if (ii > i) {
	  let obj = null;
	  let box = '#' + factions[i] + "_" + factions[ii];
	  obj = document.querySelector(box);
	  if (obj) {
	    if (this.areAllies(factions[i], factions[ii], 0)) {
	      obj.innerHTML = '<img src="/his/img/Allied.svg" />';
	      obj.style.display = "block";
	    } else {
	      if (this.areEnemies(factions[i], factions[ii], 0)) {
	        obj.innerHTML = '<img src="/his/img/AtWar.svg" />';
	        obj.style.display = "block";
	      } else {
	        obj.style.display = "none";
	      }
	    }
	  }
	}
      }
    }
    } catch (err) {}
  }

  displayDebaters() {
    this.debaters_overlay.render();
  }

  displayExplorers() {
    this.explorers_overlay.render();
  }

  displayConquistadors() {
    this.conquistadors_overlay.render();
  }

  displayPersia() {
    let obj = document.querySelector("#persia");
    obj.style.display = "block";
  }
  hidePersia() {
    let obj = document.querySelector("#persia");
    obj.style.display = "none";
  }
  displayEgypt() {
    let obj = document.querySelector("#egypt");
    obj.style.display = "block";
  }
  hideEgypt() {
    let obj = document.querySelector("#egypt");
    obj.style.display = "none";
  }
  displayIreland() {
    let obj = document.querySelector("#ireland");
    obj.style.display = "block";
  }
  hideIreland() {
    let obj = document.querySelector("#ireland");
    obj.style.display = "none";
  }

  displayPregnancyChart() {

    let his_self = this;

    document.querySelectorAll(".pregnancy_chart").forEach((el) => {
      el.classList.remove("active");
    });

    if (!his_self.game.state.henry_viii_rolls) { his_self.game.state.henry_viii_rolls = []; }
    if (!his_self.game.state.henry_viii_wives) { his_self.game.state.henry_viii_wives = []; }
    for (let i = 0; i < his_self.game.state.henry_viii_wives.length && i < his_self.game.state.henry_viii_rolls.length; i++) {

      let dd = his_self.game.state.henry_viii_rolls[i];
      let wife = his_self.game.state.henry_viii_wives[i];
      let wife_tile = "/his/img/tiles/wives/";

      if (wife == "boleyn")  { wife_tile += "AnneBoleyn.svg"; }
      if (wife == "cleves")  { wife_tile += "AnneCleves.svg"; }
      if (wife == "aragon")  { wife_tile += "CatherineAragon.svg"; }
      if (wife == "seymour") { wife_tile += "JaneSeymour.svg"; }
      if (wife == "parr")    { wife_tile += "KatherineParr.svg"; }
      if (wife == "howard")  { wife_tile += "KathrynHoward.svg"; }

      if (dd == 1) { document.querySelector("#pregnancy1").style.backgroundImage = `url("${wife_tile}")`; }
      if (dd == 2) { document.querySelector("#pregnancy2").style.backgroundImage = `url("${wife_tile}")`; }
      if (dd == 3) { document.querySelector("#pregnancy3").style.backgroundImage = `url("${wife_tile}")`; }
      if (dd == 4) { document.querySelector("#pregnancy4").style.backgroundImage = `url("${wife_tile}")`; }
      if (dd == 5) { document.querySelector("#pregnancy5").style.backgroundImage = `url("${wife_tile}")`; }
      if (dd == 6) { document.querySelector("#pregnancy6").style.backgroundImage = `url("${wife_tile}")`; }

    }

  }

  displayTheologicalDebater(debater, attacker=true) {

    let tile_f = "/his/img/tiles/debaters/" + this.debaters[debater].img;
    let tile_b = tile_f.replace('.svg', '_back.svg');

    if (this.isDebaterCommitted(debater)) { let x = tile_f; tile_f = tile_b; tile_b = x; } // reverse default sides if committed

    if (attacker) {
      $('.attacker_debater').css('background-image', `url('${tile_f}')`);
      $('.attacker_debater').mouseover(function() { 
	$('.attacker_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.attacker_debater').css('background-image', `url('${tile_f}')`);
      });
    } else {
      $('.defender_debater').css('background-image', `url('${tile_f}')`);
      $('.defender_debater').mouseover(function() { 
	$('.defender_debater').css('background-image', `url('${tile_b}')`);
      }).mouseout(function() {
	$('.defender_debater').css('background-image', `url('${tile_f}')`);
      });
    }
  }

  displayTheologicalDebate(res) {
    this.debate_overlay.render(res);
  }


  displayReligiousConflictSheet() {

    let num_protestant_spaces = 0;
    let rcc = this.returnReligiousConflictChart();
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
        num_protestant_spaces++;
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }
    let cid = "s" + num_protestant_spaces;

    let html = `
      <div class="religious_conflict_sheet" id="religious_conflict_sheet" style="background-image: url('/his/img/reference/religious.jpg')">
	<div class="religious_conflict_sheet_tile" id="religious_conflict_sheet_tile"></div>
	<div class="papal_debaters"></div>
	<div class="lutheran_debaters"></div>
	<div class="calvinist_debaters"></div>
	<div class="anglican_debaters"></div>
	<div class="protestant_debaters"></div>
      </div>
    `;

    this.overlay.showOverlay(html);

    //
    // list all debaters
    //
    for (let i = 0; i < this.game.state.debaters.length; i++) {
      let d = this.game.state.debaters[i];
      let dtile = `<img class="debater_tile" id="${i}" src="/his/img/tiles/debaters/${d.img}" />`;
      if (d.owner === "papacy") {
	this.app.browser.addElementToSelector(dtile, '.papal_debaters');
      }
      if (d.owner === "england") {
	this.app.browser.addElementToSelector(dtile, '.anglican_debaters');
      }
      if (d.owner === "hapsburg") {
	this.app.browser.addElementToSelector(dtile, '.calvinist_debaters');
      }
      if (d.owner === "protestant") {
	this.app.browser.addElementToSelector(dtile, '.protestant_debaters');
      }
    }

    let obj = document.getElementById("religious_conflict_sheet_tile");
    obj.style.top = rcc[cid].top;
    obj.style.left = rcc[cid].left;

  }

  returnProtestantSpacesTrackVictoryPoints() {

    let num_protestant_spaces = 0;
    for (let key in this.game.spaces) {
      if (this.game.spaces[key].religion === "protestant") {
	if (!this.game.spaces[key].unrest) {
          num_protestant_spaces++;
	}
      }
    }
    if (num_protestant_spaces > 50) { num_protestant_spaces = 50; }

    let x = [];
    for (let i = 0; i < 51; i++) { 

      x[i] = {}; x[i].protestant = 0; x[i].papacy = 15;

      if (i >= 4)  { x[i].protestant++; x[i].papacy--; }
      if (i >= 7)  { x[i].protestant++; x[i].papacy--; }
      if (i >= 10) { x[i].protestant++; x[i].papacy--; }
      if (i >= 14) { x[i].protestant++; x[i].papacy--; }
      if (i >= 17) { x[i].protestant++; x[i].papacy--; }
      if (i >= 20) { x[i].protestant++; x[i].papacy--; }
      if (i >= 24) { x[i].protestant++; x[i].papacy--; }
      if (i >= 27) { x[i].protestant++; x[i].papacy--; }
      if (i >= 30) { x[i].protestant++; x[i].papacy--; }
      if (i >= 34) { x[i].protestant++; x[i].papacy--; }
      if (i >= 37) { x[i].protestant++; x[i].papacy--; }
      if (i >= 40) { x[i].protestant++; x[i].papacy--; }
      if (i >= 44) { x[i].protestant++; x[i].papacy--; }
      if (i >= 47) { x[i].protestant++; x[i].papacy--; }
      if (i >= 50) { x[i].protestant+=100; x[i].papacy--; }
    }

    return x[num_protestant_spaces];

  }


  displayFactionSheet(faction) {
    this.faction_overlay.render(faction);
  }

  returnFactionSheetKeys() {
  }

  displayBoard() {

    try {
      if (this.game.state.events.war_in_persia) { this.displayPersia(); }
      if (this.game.state.events.revolt_in_egypt) { this.displayEgypt(); }
      if (this.game.state.events.revolt_in_ireland) { this.displayIreland(); }
    } catch (err) {
      //console.log("error displaying foreign wars... " + err);
    }

    try {
      this.displayPregnancyChart();
    } catch (err) {
      //console.log("error displaying turn track... " + err);
    }
    try {
      this.displayTurnTrack();
    } catch (err) {
      //console.log("error displaying turn track... " + err);
    }
    try {
      this.displayWarBox();
    } catch (err) {
      //console.log("error displaying diplomacy box... " + err);
    }
    try {
      this.displayColony();
    } catch (err) {
      //console.log("error displaying colonies... " + err);
    }
    try {
      this.displayConquest();
    } catch (err) {
      //console.log("error displaying conquest... " + err);
    }
    try {
      this.displayElectorateDisplay();
    } catch (err) {
      //console.log("error displaying electorates... " + err);
    }
    try {
      this.displayNewWorld();
    } catch (err) {
      //console.log("error displaying new world... " + err);
    }
    try {
      this.displaySpaces();
    } catch (err) {
      //console.log("error displaying spaces... " + err);
    }
    try {
      this.displayNavalSpaces();
    } catch (err) {
      //console.log("error displaying naval spaces... " + err);
    }
    try {
      this.displayVictoryTrack();
    } catch (err) {
      //console.log("error displaying victory track... " + err);
    }
  }

  displayNewWorldBonuses() {
    try {

      document.querySelector(".france_colony1_bonus").innerHTML = "";
      document.querySelector(".france_colony2_bonus").innerHTML = "";
      document.querySelector(".england_colony1_bonus").innerHTML = "";
      document.querySelector(".england_colony2_bonus").innerHTML = "";
      document.querySelector(".hapsburg_colony1_bonus").innerHTML = "";
      document.querySelector(".hapsburg_colony2_bonus").innerHTML = "";
      document.querySelector(".hapsburg_colony3_bonus").innerHTML = "";

      //
      // Galleons Colony #1
      //
      if (this.game.state.galleons['france'] == 1) {
	document.querySelector(".france_colony1_bonus").innerHTML = `<img class="army_tile" src="/his/img/Galleons.svg" />`;
      }
      if (this.game.state.galleons['england'] == 1) {
	document.querySelector(".england_colony1_bonus").innerHTML = `<img class="army_tile" src="/his/img/Galleons.svg" />`;
      }
      if (this.game.state.galleons['hapsburg'] == 1) {
	document.querySelector(".hapsburg_colony1_bonus").innerHTML = `<img class="army_tile" src="/his/img/Galleons.svg" />`;
      }
      //
      // Plantations Colony #2
      //
      if (this.game.state.plantations['france'] == 1) {
	document.querySelector(".france_colony2_bonus").innerHTML = `<img class="army_tile" src="/his/img/tiles/colonies/Plantations.svg" />`;
      } else {
	document.querySelector(".france_colony2_bonus").innerHTML = ``;
      }
      if (this.game.state.events.colonial_governor == "france") {
	document.querySelector(".france_colony2_bonus").innerHTML += `<img class="army_tile" src="/his/img/tiles/colonies/ColonialGovernor.svg" />`;
      }

      if (this.game.state.plantations['england'] == 1) {
	document.querySelector(".england_colony2_bonus").innerHTML = `<img class="army_tile" src="/his/img/tiles/colonies/Plantations.svg" />`;
      } else {
	document.querySelector(".england_colony2_bonus").innerHTML = ``;
      }
      if (this.game.state.events.colonial_governor == "england") {
	document.querySelector(".england_colony2_bonus").innerHTML += `<img class="army_tile" src="/his/img/tiles/colonies/ColonialGovernor.svg" />`;
      }

      if (this.game.state.plantations['hapsburg'] == 1) {
	document.querySelector(".hapsburg_colony2_bonus").innerHTML = `<img class="army_tile" src="/his/img/tiles/colonies/Plantations.svg" />`;
      } else {
	document.querySelector(".hapsburg_colony2_bonus").innerHTML = ``;
      }
      if (this.game.state.events.colonial_governor == "hapsburg") {
	document.querySelector(".hapsburg_colony2_bonus").innerHTML += `<img class="army_tile" src="/his/img/tiles/colonies/ColonialGovernor.svg" />`;
      }
      //
      // Raiders Colony #3
      //
      if (this.game.state.raiders['protestant'] == 1) {
	document.querySelector(".hapsburg_colony3_bonus").innerHTML = `<img class="army_tile" src="/his/img/Raider_Protestant.svg" />`;
      }
      if (this.game.state.raiders['england'] == 1) {
	document.querySelector(".hapsburg_colony3_bonus").innerHTML += `<img class="army_tile" src="/his/img/Raider_French.svg" />`;
      }
      if (this.game.state.raiders['france'] == 1) {
	document.querySelector(".hapsburg_colony3_bonus").innerHTML += `<img class="army_tile" src="/his/img/Raider_English.svg" />`;
      }
      //
      // Mercator's Map
      //
      if (this.game.state.events.mercators_map != "") {
	if (document.querySelector(".crossing_atlantic").innerHTML.indexOf("Mercator") == -1) {
	  document.querySelector(".crossing_atlantic").innerHTML += `<img class="army_tile" src="/his/img/Mercator.svg" />`;
        }
      }
    } catch (err) {
      console.log("error displaying New World bonuses: " + JSON.stringify(err));
    }
  }


  displayColony() {

    let obj = document.querySelector(".crossing_atlantic");
    obj.innerHTML = "";

    document.querySelector('.england_colony1').innerHTML  = ``;
    document.querySelector('.england_colony2').innerHTML  = ``;
    document.querySelector('.france_colony1').innerHTML   = ``;
    document.querySelector('.france_colony2').innerHTML   = ``;
    document.querySelector('.hapsburg_colony1').innerHTML = ``;
    document.querySelector('.hapsburg_colony2').innerHTML = ``;
    document.querySelector('.hapsburg_colony3').innerHTML = ``;

    for (let i = 0; i < this.game.state.colonies.length; i++) {

      let c = this.game.state.colonies[i];

      if (c.resolved != 1) {
        obj.innerHTML += `<img class="army_tile" src="${this.returnNextColonyTile(c.faction)}" />`;
      }

      if (c.resolved == 1 && c.destroyed != 1) {
        if (c.colony === "england_colony1")  { document.querySelector('.england_colony1').innerHTML  = `<img class="nw_tile" src="${c.img}" />`; }
        if (c.colony === "england_colony2")  { document.querySelector('.england_colony2').innerHTML  = `<img class="nw_tile" src="${c.img}" />`; }
        if (c.colony === "france_colony1")   { document.querySelector('.france_colony1').innerHTML   = `<img class="nw_tile" src="${c.img}" />`; }
        if (c.colony === "france_colony2")   { document.querySelector('.france_colony2').innerHTML   = `<img class="nw_tile" src="${c.img}" />`; }
        if (c.colony === "hapsburg_colony1") { document.querySelector('.hapsburg_colony1').innerHTML = `<img class="nw_tile" src="${c.img}" />`; }
        if (c.colony === "hapsburg_colony2") { document.querySelector('.hapsburg_colony2').innerHTML = `<img class="nw_tile" src="${c.img}" />`; }
        if (c.colony === "hapsburg_colony3") { document.querySelector('.hapsburg_colony3').innerHTML = `<img class="nw_tile" src="${c.img}" />`; }
      }
    }

    //
    // this will be set when unresolved...
    //
    if (this.game.state.events.potosi_silver_mines != "") {
      obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/colonies/Potosi.svg" />`;
    }

  }


  displayConquest() {

    let obj = document.querySelector(".crossing_atlantic");

    for (let z = 0; z < this.game.state.conquests.length; z++) {

      let con = this.game.state.conquests[z];
      let faction = con.faction;
      let round = con.round;

      //      
      // current round are unresolved      
      //      
      if (round == this.game.state.round) {
        if (faction == "hapsburg") {
          obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/hapsburg/Hapsburg_Conquest.svg" />`;
        }
        if (faction == "france") {
          obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/france/French_Conquest.svg" />`;
        }
        if (faction == "england") {
          obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/england/English_Conquest.svg" />`;
        }
	if (this.game.state.events.smallpox == faction) {
          obj.innerHTML += `<img class="army_tile" src="/his/img/Smallpox.svg" />`;
	}
      }
    }

    let ec = [];
    let fc = [];
    let hc = [];

    if (this.game.state.newworld['aztec'].claimed == 1) {
      if (this.game.state.newworld['aztec'].faction == "england") { ec.push("aztec"); }
      if (this.game.state.newworld['aztec'].faction == "france") { fc.push("aztec"); }
      if (this.game.state.newworld['aztec'].faction == "hapsburg") { hc.push("aztec"); }
    }
    if (this.game.state.newworld['inca'].claimed == 1) {
      if (this.game.state.newworld['inca'].faction == "england") { ec.push("inca"); }
      if (this.game.state.newworld['inca'].faction == "france") { fc.push("inca"); }
      if (this.game.state.newworld['inca'].faction == "hapsburg") { hc.push("inca"); }
    }
    if (this.game.state.newworld['maya'].claimed == 1) {
      if (this.game.state.newworld['maya'].faction == "england") { ec.push("maya"); }
      if (this.game.state.newworld['maya'].faction == "france") { fc.push("maya"); }
      if (this.game.state.newworld['maya'].faction == "hapsburg") { hc.push("maya"); }
    }

    for (let z = 0, zz = 1; z < ec.length; z++) {
      let depl = ""; if (this.game.state.newworld[ec[z]].deleted == 1) { depl = "depleted"; }
      if (zz < 2) {
	document.querySelector(`.england_conquest${zz}`).innerHTML = `<img class="nw_tile ${depl}" src="${this.game.state.newworld[ec[z]].img}" />`;
        zz++;
      }
    }
    for (let z = 0, zz = 1; z < fc.length; z++) {
      let depl = ""; if (this.game.state.newworld[fc[z]].deleted == 1) { depl = "depleted"; }
      if (zz < 2) {
	document.querySelector(`.france_conquest${zz}`).innerHTML = `<img class="nw_tile ${depl}" src="${this.game.state.newworld[fc[z]].img}" />`;
        zz++;
      }
    }
    for (let z = 0, zz = 1; z < hc.length; z++) {
      let depl = ""; if (this.game.state.newworld[hc[z]].deleted == 1) { depl = "depleted"; }
      if (zz < 3) {
	document.querySelector(`.hapsburg_conquest${zz}`).innerHTML = `<img class="nw_tile ${depl}" src="${this.game.state.newworld[hc[z]].img}" />`;
        zz++;
      }
    }

    if (this.game.state.newworld['maya'].claimed == 1) {
      let f = this.game.state.newworld['maya'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.maya').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }
    if (this.game.state.newworld['aztec'].claimed == 1) {
      let f = this.game.state.newworld['aztec'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.aztec').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }
    if (this.game.state.newworld['inca'].claimed == 1) {
      let f = this.game.state.newworld['inca'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.inca').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }

  }

  displayExploration() {

    let obj = document.querySelector(".crossing_atlantic");

    let cabot_england_found = 0;
    let cabot_france_found = 0;
    let cabot_hapsburg_found = 0;

    for (let z = 0; z < this.game.state.explorations.length; z++) {

      let exp = this.game.state.explorations[z];
      let faction = exp.faction;
      let round = exp.round;

      if (exp.cabot == 1) { if (faction == "england") { cabot_england_found = 1; } }
      if (exp.cabot == 1) { if (faction == "france") { cabot_france_found = 1; } }
      if (exp.cabot == 1) { if (faction == "hapsburg") { cabot_hapsburg_found = 1; } }

      //      
      // current round are unresolved      
      //      
      if (round == this.game.state.round) {
        if (faction == "hapsburg") {
          if (this.game.state.hapsburg_uncharted == 1) {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/hapsburg/Hapsburg_Exploration.svg" />`;
          } else {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/hapsburg/Hapsburg_ExplorationCharted.svg" />`;
          }
        }
        if (faction == "france") {
          if (this.game.state.france_uncharted == 1) {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/france/French_Exploration.svg" />`;
          } else {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/france/French_ExplorationCharted.svg" />`;
          }
        }
        if (faction == "england") {
          if (this.game.state.england_uncharted == 1) {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/england/English_Exploration.svg" />`;
          } else {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/england/English_ExplorationCharted.svg" />`;
          }
        }
      }
    }

    if (this.game.state.newworld['stlawrence'].claimed == 1) {
      let f = this.game.state.newworld['stlawrence'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.stlawrence').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }
    if (this.game.state.newworld['greatlakes'].claimed == 1) {
      let f = this.game.state.newworld['greatlakes'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.greatlakes').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }
    if (this.game.state.newworld['mississippi'].claimed == 1) {
      let f = this.game.state.newworld['mississippi'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.mississippi').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }
    if (this.game.state.newworld['amazon'].claimed == 1) {
      let f = this.game.state.newworld['amazon'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.amazon').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }
    if (this.game.state.newworld['pacificstrait'].claimed == 1) {
      let f = this.game.state.newworld['pacificstrait'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.pacificstrait').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }
    if (this.game.state.newworld['circumnavigation'].claimed == 1) {
      let f = this.game.state.newworld['circumnavigation'].faction;
      let t = this.returnExplorationTile(f);
      document.querySelector('.circumnavigation').innerHTML = `<img class="nw_tile" src="/his/img/tiles/${f}/${this.returnExplorationTile(f)}" />`;
    }

    if (cabot_england_found == 0 && this.game.state.events.cabot_england == 1) {
      obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/explorers/Cabot_English.svg" />`;
    }
    if (cabot_france_found == 0 && this.game.state.events.cabot_france == 1) {
      obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/explorers/Cabot_French.svg" />`;
    }
    if (cabot_hapsburg_found == 0 && this.game.state.events.cabot_hapsburg == 1) {
      obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/explorers/Cabot_Hapsburg.svg" />`;
    }

  }

  returnExplorationTile(f="") {
    if (f == "hapsburg") { return "Hapsburg_key.svg"; }
    if (f == "england") { return "England_key.svg"; }
    if (f == "france") { return "France_key.svg"; }
    return "";
  }

  displayNewWorld() {
try {
    document.querySelector(".crossing_atlantic").innerHTML = "";
    this.displayColony();
    this.displayConquest();
    this.displayExploration();
    this.displayNewWorldBonuses();
} catch (err) {
console.log("ERROR DISPLAYING NEW WORLD STUFF: " + JSON.stringify(err));
    }
  }

  displaySpaceDetailedView(name) {
    let html = "";
    if (this.spaces[name]) { html = this.spaces[name].returnView(); }
    if (this.navalspaces[name]) { html = this.navalspaces[name].returnView(); }
    if (html != "") { this.overlay.show(html); }
  }

  displayElectorateDisplay() {
    let elecs = this.returnElectorateDisplay();
    for (let key in elecs) {
      let obj = document.getElementById(`ed_${key}`);
      let tile = this.returnSpaceTile(this.game.spaces[key]);
      obj.innerHTML = ` <img class="hextile" src="${tile}" />`;      
      if (this.returnElectoralBonus(key) != 0) {
        obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-${this.returnElectoralBonus(key)}.svg" />`;
      }
    }
  }


  // returns 1 if the bonus for controlling is still outstanding
  returnElectoralBonus(space) {

    if (space === "augsburg" && this.game.state.augsburg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "mainz" && this.game.state.mainz_electoral_bonus == 0) {
      return 1;
    }
    if (space === "trier" && this.game.state.trier_electoral_bonus == 0) {
      return 1;
    }
    if (space === "cologne" && this.game.state.cologne_electoral_bonus == 0) {
      return 1;
    }
    if (space === "wittenberg" && this.game.state.wittenberg_electoral_bonus == 0) {
      return 2;
    }
    if (space === "brandenburg" && this.game.state.brandenburg_electoral_bonus == 0) {
      return 1;
    }

    return 0;

  }

  returnSpaceTile(space) {

    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";
    let stype = "hex";

    if (space.type == "town") { stype = "hex"; owner = this.returnControllingPower(owner); }
    if (space.type == "key") { stype = "key"; owner = this.returnControllingPower(owner); }
    if (owner == "protestant") { stype = "hex"; owner = this.returnControllingPower(owner); }


    //
    //
    //
    if (space.home === space.political || (space.home !== "" && space.political == "")) {
      if (space.home !== this.returnControllingPower(space.home)) {
	owner = this.returnControllingPower(space.home);
      }
    }

    if (owner != "") {
      if (owner === "hungary") {
        if (owner === "hungary") {
          tile = "/his/img/tiles/independent/";	  
          if (space.religion === "protestant") {
            tile += `Independent_${stype}_back.svg`;
          } else {
            tile += `Independent_${stype}.svg`;
          }
        }
      }
      if (owner === "scotland") {
	if (owner === "scotland") {
          tile = "/his/img/tiles/independent/";	  
          if (space.religion === "protestant") {
            tile += `Independent_${stype}_back.svg`;
          } else {
            tile += `Independent_${stype}.svg`;
          }
        }
      }
      if (owner === "venice") {
	if (owner === "venice") {
          tile = "/his/img/tiles/independent/";	  
          if (space.religion === "protestant") {
            tile += `Independent_${stype}_back.svg`;
          } else {
            tile += `Independent_${stype}.svg`;
          }
        }
      }
      if (owner === "genoa") {
        if (owner === "genoa") {
	  tile = "/his/img/tiles/independent/";	  
          if (space.religion === "protestant") {
            tile += `Independent_${stype}_back.svg`;
          } else {
            tile += `Independent_${stype}.svg`;
          }
        }
      }

      if (owner === "hapsburg") {
        tile = "/his/img/tiles/hapsburg/";	  
        if (space.religion === "protestant") {
          tile += `Hapsburg_${stype}_back.svg`;
        } else {
          tile += `Hapsburg_${stype}.svg`;
        }
      }
      if (owner === "england") {
        tile = "/his/img/tiles/england/";	  
        if (space.religion === "protestant") {
          tile += `England_${stype}_back.svg`;
        } else {
          tile += `England_${stype}.svg`;
        }
      }
      if (owner === "france") {
        tile = "/his/img/tiles/france/";	  
        if (space.religion === "protestant") {
          tile += `France_${stype}_back.svg`;
        } else {
          tile += `France_${stype}.svg`;
        }
      }
      if (owner === "papacy") {
        tile = "/his/img/tiles/papacy/";	  
        if (space.religion === "protestant") {
          tile += `Papacy_${stype}_back.svg`;
	} else {
	  tile += `Papacy_${stype}.svg`;
	}
      }
      if (owner === "protestant") {
        tile = "/his/img/tiles/protestant/";	  
        if (space.religion === "protestant") {
          tile += `Protestant_${stype}_back.svg`;
        } else {
          tile += `Protestant_${stype}.svg`;
        }
      }
      if (owner === "ottoman") {
        tile = "/his/img/tiles/ottoman/";	  
        if (space.religion === "protestant") {
          tile += `Ottoman_${stype}_back.svg`;
        } else {
          tile += `Ottoman_${stype}.svg`;
        }
      }
      if (owner === "independent") {
        tile = "/his/img/tiles/independent/";	  
        if (space.religion === "protestant") {
          tile += `Independent_${stype}_back.svg`;
        } else {
          tile += `Independent_${stype}.svg`;
        }
      }
    }

    return tile;

  }

  returnNavalTiles(faction, spacekey) {

      let html = "";
      let tile = "";
      let space = this.game.navalspaces[spacekey];
      if (!space) {
	// might be at a port
        space = this.game.spaces[spacekey];
      }
      let z = faction;
      let squadrons = 0;
      let corsairs = 0;

      //
      // if the squadron is on-loan, show the original tile not the 
      // owner
      //
      let squadrons_loaned = [];


      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "squadron") {
	  squadrons += 2;
	  if (space.units[z][zz].owner != faction) { 
	    squadrons_loaned.push(space.units[z][zz].owner);
	  }
	}
	if (space.units[z][zz].type === "corsair") {
	  corsairs += 1;
	}
      }

      while (squadrons >= 2) {

	let zzz = z;

	if (squadrons_loaned.length > 0) {
	  zzz = squadrons_loaned[0];
	  squadrons_loaned.splice(0, 1);
	}

        if (zzz === "hapsburg") {
          tile = "/his/img/tiles/hapsburg/";	  
	  if (squadrons >= 2) {
            tile += `Hapsburg_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (zzz === "england") {
          tile = "/his/img/tiles/england/";	  
	  if (squadrons >= 2) {
            tile += `English_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (zzz === "france") {
          tile = "/his/img/tiles/france/";	  
	  if (squadrons >= 2) {
            tile += `French_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (zzz === "papacy") {
          tile = "/his/img/tiles/papacy/";	  
	  if (squadrons >= 2) {
            tile += `Papacy_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (zzz === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (squadrons >= 2) {
            tile += `Ottoman_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (zzz === "venice") {
          tile = "/his/img/tiles/venice/";	  
	  if (squadrons >= 2) {
            tile += `Venice_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (zzz === "genoa") {
          tile = "/his/img/tiles/genoa/";	  
	  if (squadrons >= 2) {
            tile += `Genoa_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (zzz === "scotland") {
          tile = "/his/img/tiles/scotland/";	  
	  if (squadrons >= 2) {
            tile += `Scottish_squadron.svg`;
	    squadrons -= 2;
          }
        }

        html += `<img class="navy_tile" src="${tile}" />`;
      }

      while (corsairs >= 1) {
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }

        html += `<img class="navy_tile" src="${tile}" />`;

      }

    return html;
  }

  returnNavies(space) {

    let html = '<div class="space_navy" id="">';
    let tile = "";

    for (let z in space.units) {
      html += this.returnNavalTiles(z, space.key);
      tile = html;
    }
    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnArmyTiles(faction, spacekey) {

    let z = faction;
    let space = this.game.spaces[spacekey];
    let html = "";

    try {

    if (this.game.state.board[z]) {
      if (this.game.state.board[z].deployed[spacekey]) {
          if (z === "hapsburg") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-1.svg" />`;
	    }
	  }
          if (z === "ottoman") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-1.svg" />`;
	    }
	  }
          if (z === "papacy") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-1.svg" />`;
	    }
	  }
          if (z === "england") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-1.svg" />`;
	    }
	  }
          if (z === "france") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-1.svg" />`;
	    }
	  }
          if (z === "protestant") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-1.svg" />`;
	    }
	  }
          if (z === "venice") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-1.svg" />`;
	    }
	  }
          if (z === "genoa") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-1.svg" />`;
	    }
	  }
          if (z === "hungary") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-1.svg" />`;
	    }
	  }
          if (z === "scotland") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScottishReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScottishReg-1.svg" />`;
	    }
	  }
          if (z === "independent") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-1.svg" />`;
	    }
	  }

      }


      //
      // surplus units that should not technically be available according to
      // tile limitations will be in the "missing" section. we do not want
      // pieces appearing and disappearing from the board, so we display them
      // as single-unit tiles.
      //
      if (this.game.state.board[z].missing[spacekey]) {
          if (z === "hapsburg") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgReg-1.svg" />`;
	    }
	  }
          if (z === "ottoman") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanReg-1.svg" />`;
	    }
	  }
          if (z === "papacy") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyReg-1.svg" />`;
	    }
	  }
          if (z === "england") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandReg-1.svg" />`;
	    }
	  }
          if (z === "france") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchReg-1.svg" />`;
	    }
	  }
          if (z === "protestant") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantReg-1.svg" />`;
	    }
	  }
          if (z === "venice") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/venice/VeniceReg-1.svg" />`;
	    }
	  }
          if (z === "genoa") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/genoa/GenoaReg-1.svg" />`;
	    }
	  }
          if (z === "hungary") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryReg-1.svg" />`;
	    }
	  }
          if (z === "scotland") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScottishReg-1.svg" />`;
	    }
	  }
          if (z === "independent") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/independent/IndependentReg-1.svg" />`;
	    }
	  }
          if (z === "hapsburg") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-1.svg" />`;
	    }
	  }
          if (z === "ottoman") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-1.svg" />`;
	    }
	  }
          if (z === "papacy") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-1.svg" />`;
	    }
	  }
          if (z === "england") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-1.svg" />`;
	    }
	  }
          if (z === "france") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-1.svg" />`;
	    }
	  }
          if (z === "protestant") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-1.svg" />`;
	    }
	  }
          if (z === "venice") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/venice/VeniceMerc-1.svg" />`;
	    }
	  }
          if (z === "genoa") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/genoa/GenoaMerc-1.svg" />`;
	    }
	  }
          if (z === "hungary") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hungary/HungaryMerc-1.svg" />`;
	    }
	  }
          if (z === "scotland") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScottishMerc-1.svg" />`;
	    }
	  }
          if (z === "independent") {
	    for (let i = 0; i < this.game.state.board[z].missing[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/independent/IndependentMerc-1.svg" />`;
	    }
	  }
      }
    }
    //
    // if there is an error
    //
    } catch (err) {
	console.log("ERROR: need to run returnOnBoardUnits: " + JSON.stringify(err));
	this.returnOnBoardUnits();
    }

    return html;
  }

  returnArmies(space) {

    let html = '<div class="space_army" id="">';
    let tile = "";
    let spacekey = space.key;
    let controlling_faction = "";
    if (space.political != "") { controlling_faction = space.political; } else {
      if (space.home != "") { controlling_faction = space.home; }
    }

    for (let z in space.units) {

      //
      // ideally our space is "pre-calculated" and we can display the correct
      // mix of tiles. this should be saved in this.game.state.board["papacy"]
      // etc. see his-units for the returnOnBoardUnits() function that organizes
      // this data object.
      //
      // independent spaces may not be pre-calculated, so we handle them manually
      //
      if (this.game.state.board[z] && (space.political != "independent" || space.home != "independent")) {
	// mercenary also handles cavalry
        html += this.returnMercenaryTiles(z, spacekey);
        html += this.returnArmyTiles(z, spacekey);
	tile = html;
      } else {


        new_units = false;

	//
	// AUTO - ARMIES
	//
        let army = 0;
        for (let zz = 0; zz < space.units[z].length; zz++) {
  	  if (space.units[z][zz].type === "regular") {
	    new_units = true;
	    army++;
	  }
        }

        while (army >= 1) {
          if (z === "hapsburg") {
            tile = "/his/img/tiles/hapsburg/";	  
	    if (army >= 4) {
              tile += `HapsburgReg-4.svg`;
	      army -= 4;
	    } else {
	      if (army >= 2) {
                tile += `HapsburgReg-2.svg`;
	        army -= 2;
	      } else {
	        if (army >= 1) {
                  tile += `HapsburgReg-1.svg`;
	          army -= 1;
	        }
	      }
            }
	  }
          if (z === "england") {
            tile = "/his/img/tiles/england/";	  
	    if (army >= 4) {
              tile += `EnglandReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `EnglandReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `EnglandReg-1.svg`;
	          army -= 1;
                }
              }
	    }
          }
          if (z === "france") {
            tile = "/his/img/tiles/france/";	  
	    if (army >= 4) {
              tile += `FrenchReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `FrenchReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `FrenchReg-1.svg`;
	          army -= 1;
                }
	      }
	    }
          }
          if (z === "papacy") {
            tile = "/his/img/tiles/papacy/";	  
            if (army >= 4) {
              tile += `PapacyReg-4.svg`;
              army -= 4;
            } else {
	      if (army >= 2) {
                tile += `PapacyReg-2.svg`;
	        army -= 2;
	      } else {
	        if (army >= 1) {
                  tile += `PapacyReg-1.svg`;
	          army -= 1;
	        }
	      }
	    }
          }
          if (z === "protestant") {
            tile = "/his/img/tiles/protestant/";	  
	    if (army >= 4) {
              tile += `ProtestantReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `ProtestantReg-2.svg`;
	        army -= 2;
               } else {
	         if (army >= 1) {
                   tile += `ProtestantReg-1.svg`;
	           army -= 1;
                 }
	       }
            }
          }
          if (z === "ottoman") {
            tile = "/his/img/tiles/ottoman/";	  
	    if (army >= 4) {
              tile += `OttomanReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `OttomanReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `OttomanReg-1.svg`;
	          army -= 1;
                }
              }
            }
          }
          if (z === "independent") {
            tile = "/his/img/tiles/independent/";	  
	    if (army >= 2) {
              tile += `IndependentReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `IndependentReg-1.svg`;
	        army -= 1;
              } 
	    }
          }
          if (z === "venice") {
            tile = "/his/img/tiles/venice/";	  
	    if (army >= 2) {
              tile += `VeniceReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `VeniceReg-1.svg`;
	        army -= 1;
              }
	    }
          }
          if (z === "hungary") {
            tile = "/his/img/tiles/hungary/";	  
	    if (army >= 4) {
              tile += `HungaryReg-4.svg`;
	      army -= 4;
            } else {
	      if (army >= 2) {
                tile += `HungaryReg-2.svg`;
	        army -= 2;
              } else {
	        if (army >= 1) {
                  tile += `HungaryReg-1.svg`;
	          army -= 1;
                }
              }
            }
          }
          if (z === "genoa") {
            tile = "/his/img/tiles/genoa/";	  
	    if (army >= 2) {
              tile += `GenoaReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `GenoaReg-1.svg`;
	        army -= 1;
              }
            }
          }
          if (z === "scotland") {
            tile = "/his/img/tiles/scotland/";	  
	    if (army >= 2) {
              tile += `ScottishReg-2.svg`;
	      army -= 2;
            } else {
	      if (army >= 1) {
                tile += `ScottishReg-1.svg`;
	        army -= 1;
              }
            } 
          }
        }

        if (new_units == true) {
          if (controlling_faction != "" && controlling_faction !== z) {
            html += `<img class="army_tile army_tile" src="${tile}" />`;
  	  } else {
            html += `<img class="army_tile" src="${tile}" />`;
	  }
        }

        new_units = false;

        army = 0;
        for (let zz = 0; zz < space.units[z].length; zz++) {
          if (space.units[z][zz].type === "mercenary") {
  	    new_units = true;
            army++;
          }
        }

        while (army > 0) {
          if (z != "") {
            if (z === "hapsburg") {
              tile = "/his/img/tiles/hapsburg/";	  
	      if (army >= 4) {
                tile += `HapsburgMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2) {
                tile += `HapsburgMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1) {
                tile += `HapsburgMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "england") {
              tile = "/his/img/tiles/england/";	  
	      if (army >= 4) {
                tile += `EnglandMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `EnglandMerc-2.svg`;
	        army -= 4;
              } else {
	      if (army >= 1) {
                tile += `EnglandMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "france") {
              tile = "/his/img/tiles/france/";	  
	      if (army >= 4) {
                tile += `FrenchMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `FrenchMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `FrenchMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "papacy") {
              tile = "/his/img/tiles/papacy/";	  
	      if (army >= 4) {
                tile += `PapacyMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "protestant") {
              tile = "/his/img/tiles/protestant/";	  
	      if (army >= 4) {
                tile += `ProtestantMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `ProtestantMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `ProtestantMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "ottoman") {
              tile = "/his/img/tiles/ottoman/";	  
	      if (army >= 4) {
                tile += `OttomanMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `OttomanMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `OttomanMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
          }


          if (new_units == true) {
            if (controlling_faction != "" && controlling_faction !== z) {
              html += `<img class="army_tile army_tile" src="${tile}" />`;
  	    } else {
              html += `<img class="army_tile" src="${tile}" />`;
	    }
          }
        }
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnMercenaryTiles(faction, spacekey) {

    let z = faction;
    let space = this.game.spaces[spacekey];
    let html = "";

    if (this.game.state.board[z]) {
      if (this.game.state.board[z].deployed[spacekey]) {

	  let tile = "";
          if (z === "hapsburg") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/hapsburg/HapsburgMerc-1.svg" />`;
	    }
	  }
          if (z === "ottoman") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['cavalry']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanCav-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['cavalry']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanCav-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['cavalry']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanCav-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['cavalry']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanCav-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['cavalry']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanCav-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['cavalry']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanCav-1.svg" />`;
	    }
	  }
          if (z === "papacy") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/papacy/PapacyMerc-1.svg" />`;
	    }
	  }
          if (z === "england") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/england/EnglandMerc-1.svg" />`;
	    }
	  }
          if (z === "france") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/france/FrenchMerc-1.svg" />`;
	    }
	  }
          if (z === "protestant") {
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/protestant/ProtestantMerc-1.svg" />`;
	    }
	  }
      }
    }

    return html;

  }


  returnMercenaries(space) {

    let html = '<div class="space_mercenaries" id="">';
    let tile = "";
    let spacekey = space.key;

    for (let z in space.units) {

      //
      // ideally our space is "pre-calculated" and we can display the correct
      // mix of tiles. this should be saved in this.game.state.board["papacy"]
      // etc. see his-units for the returnOnBoardUnits() function that organizes
      // this data object.
      //
      if (this.game.state.board[z]) {
        html += this.returnMercenaryTiles(z, spacekey);
	tile = html;
      } else {

        new_units = false;

        let army = 0;
        for (let zz = 0; zz < space.units[z].length; zz++) {
          if (space.units[z][zz].type === "mercenary") {
  	    new_units = true;
            army++;
          }
        }

        while (army > 0) {
          if (z != "") {
            if (z === "hapsburg") {
              tile = "/his/img/tiles/hapsburg/";	  
	      if (army >= 4) {
                tile += `HapsburgMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2) {
                tile += `HapsburgMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1) {
                tile += `HapsburgMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "england") {
              tile = "/his/img/tiles/england/";	  
	      if (army >= 4) {
                tile += `EnglandMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `EnglandMerc-2.svg`;
	        army -= 4;
              } else {
	      if (army >= 1) {
                tile += `EnglandMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "france") {
              tile = "/his/img/tiles/france/";	  
	      if (army >= 4) {
                tile += `FrenchMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `FrenchMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `FrenchMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "papacy") {
              tile = "/his/img/tiles/papacy/";	  
	      if (army >= 4) {
                tile += `PapacyMerc-4.svg`;
	        army -= 4;
	      } else {
	      if (army >= 2 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-2.svg`;
	        army -= 2;
	      } else {
	      if (army >= 1 && tile.indexOf("svg") == -1) {
                tile += `PapacyMerc-1.svg`;
	        army -= 1;
	      }
	      }
	      }
            }
            if (z === "protestant") {
              tile = "/his/img/tiles/protestant/";	  
	      if (army >= 4) {
                tile += `ProtestantMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `ProtestantMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `ProtestantMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
            if (z === "ottoman") {
              tile = "/his/img/tiles/ottoman/";	  
	      if (army >= 4) {
                tile += `OttomanMerc-4.svg`;
	        army -= 4;
              } else {
	      if (army >= 2) {
                tile += `OttomanMerc-2.svg`;
	        army -= 2;
              } else {
	      if (army >= 1) {
                tile += `OttomanMerc-1.svg`;
	        army -= 1;
              }
              }
              }
            }
          }
          html += `<img class="mercenary_tile" src="${tile}" />`;
        }
      }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  returnPersonagesTiles(faction, spacekey) {

    let z = faction;
    let space = this.game.spaces[spacekey];
    let is_naval_space = false;

    if (!space || space == undefined) { space = this.game.navalspaces[spacekey]; is_naval_space = true; }

    let html = "";

      for (let zz = 0; zz < space.units[z].length; zz++) {
	let added = 0;
	if (space.units[z][zz].debater === true) {
          html += `<img src="/his/img/tiles/debater/${space.units[z][zz].img}" />`;
	  tile = html;
	  added = 1;
	}
	if (space.units[z][zz].army_leader && added == 0) {
          html += `<img src="/his/img/tiles/army/${space.units[z][zz].img}" />`;
	  added = 1;
	}
        if (space.units[z][zz].navy_leader && added == 0) {
	  html += `<img src="/his/img/tiles/navy/${space.units[z][zz].img}" />`;
	  added = 1;
	} 
        if (space.units[z][zz].reformer && added == 0) {
	  html += `<img src="/his/img/tiles/reformers/${space.units[z][zz].img}" />`;
	  added = 1;
	}
      }
    return html;
  }

  returnPersonages(space) {

    let html = '<div class="figures_tile" id="">';
    let owner = space.political;
    if (owner == "") { owner = space.home; }
    let tile = "";

    for (let z in space.units) {
      html += this.returnPersonagesTiles(z, space.key);
      if (html != "") { tile = html; }
    }

    html += '</div>';

    if (tile === "") { return tile; }

    return html;

  }

  refreshBoardUnits() {
    this.game.state.board["protestant"] = this.returnOnBoardUnits("protestant");
    this.game.state.board["papacy"] = this.returnOnBoardUnits("papacy");
    this.game.state.board["england"] = this.returnOnBoardUnits("england");
    this.game.state.board["france"] = this.returnOnBoardUnits("france");
    this.game.state.board["ottoman"] = this.returnOnBoardUnits("ottoman");
    this.game.state.board["hapsburg"] = this.returnOnBoardUnits("hapsburg");
    this.game.state.board["independent"] = this.returnOnBoardUnits("independent");
    this.game.state.board["venice"] = this.returnOnBoardUnits("venice");
    this.game.state.board["genoa"] = this.returnOnBoardUnits("genoa");
    this.game.state.board["scotland"] = this.returnOnBoardUnits("scotland");
    this.game.state.board["hungary"] = this.returnOnBoardUnits("hungary");
  }


  displaySpace(key) {

    if (this.game.navalspaces[key]) { this.displayNavalSpace(key); return; }

    let ts = new Date().getTime();
    let no_keytiles_in_keys = [];
    if (this.game.state.board_updated < ts + 20000) {
      this.refreshBoardUnits();
    }

    if (!this.game.spaces[key]) { return; }

    let space = this.game.spaces[key];
    let tile = this.returnSpaceTile(space);

    let stype = "hex";

    if (space.type == "fortress") { stype = "hex"; }
    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

    //
    // sanity check on removing siege
    //
    if (space.besieged > 0) {
      let f = this.returnFactionControllingSpace(space.key);
      let anyone_at_war = false;
      let anyone_here = true;
      if (!this.doesSpaceHaveNonAlliedIndependentUnits(space.key, f)) {
	for (let f in space.units) {
	  for (let ff in space.units) {
	    if (space.units[f].length > 0 && space.units[ff].length > 0) {
	      if (f != ff) {
		anyone_here = true;
		if (this.areEnemies(f, ff)) { anyone_at_war = true; }
	      }
	    }
	  }
	}

	if (anyone_at_war == false) {
	  if (anyone_here == true && this.returnFactionLandUnitsInSpace(f, space.key, 1) == 0) {} else {
     	    this.removeSiege(space.key);
	  }
	}
      }
    }


    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // do not show under some conditions
    //
    if (space.political == space.home && space.religion != "protestant") { show_tile = 0; }
    if (space.political === "" && space.religion != "protestant") { show_tile = 0; }
    if (space.political == "protestant" && space.religion != "protestant") { show_tile = 1; }
    if (
      space.religion === "catholic" && 
      (
	(space.home == "venice" || space.home == "genoa" || space.home == "scotland" || space.home == "hungary") &&
	(space.home == space.political || space.political == "")
      )
    ) {
      let allied_to_major_power = false;
      if (space.type === "key" || space.type == "electorate") {
        if (this.areAllies(space.home, "protestant", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "papacy", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "france", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "england", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "ottoman", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "hapsburg", 0)) { allied_to_major_power = true; }
      }
      if (space.type === "town" || stype == "hex") {
        if (this.areAllies(space.home, "protestant", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "papacy", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "france", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "england", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "ottoman", 0)) { allied_to_major_power = true; }
        if (this.areAllies(space.home, "hapsburg", 0)) { allied_to_major_power = true; }
      }
      if (allied_to_major_power == false) {
        no_keytiles_in_keys.push(space.key);
        show_tile = 0;
      }
    }

    if (space.language == "german" && space.units["protestant"].length > 0) { show_tile = 1; }

    //
    // and force for keys
    //
    if (space.home === "" && space.political !== "") { show_tile = 1; }
    if (space.type === "key") { show_tile = 1; }
    if (space.type === "electorate") { show_tile = 1; }

    //
    // and force for minor
    //
    if (space.home === space.political || (space.home !== "" && space.political == "")) {
      if (stype === "hex" && space.home !== this.returnControllingPower(space.home)) {
        show_tile = 1;
      }   
    }   

    //
    // and force if has units
    //
    let has_units = 0;
    for (let key in space.units) {
      if (space.units[key].length > 0) {
        has_units = 1;
      }
    }

    //
    // sanity check
    //
    if (tile === "") { show_tile = 0; }

    let t = "."+key;
    document.querySelectorAll(t).forEach((obj) => {

      obj.innerHTML = "";

      if (has_units === 1 || show_tile === 1) {
	if (!no_keytiles_in_keys.includes(key) && show_tile == 1) {
          obj.innerHTML = `<img class="${stype}tile" src="${tile}" />`;
	}
        obj.innerHTML += this.returnArmies(space);
        obj.innerHTML += this.returnNavies(space);
        obj.innerHTML += this.returnPersonages(space);
      }

      if (space.fortified == 1) {
	if (this.game.state.knights_of_st_john == space.key) {
          obj.innerHTML += `<img class="fortified" src="/his/img/tiles/KnightsFortress.png" />`;
	} else {
          obj.innerHTML += `<img class="fortified" src="/his/img/tiles/Fortress.svg" />`;
        }
      }
      if (space.pirate_haven == 1) {
        obj.innerHTML += `<img class="pirate-haven" src="/his/img/tiles/ottoman/PirateHaven.svg" />`;
      }
      if (space.university == 1) {
        obj.innerHTML += `<img class="university" src="/his/img/tiles/papacy/Jesuit_Univ.svg" />`;
      }
      if (this.isSpaceInUnrest(space)) {
        obj.innerHTML += `<img class="unrest" src="/his/img/tiles/unrest.svg" />`;
      }
      if (this.isSpaceBesieged(space)) {
        obj.innerHTML += `<img class="siege" src="/his/img/tiles/siege.png" />`;
      }
    });

  }

  showPiracyMarker(key) {
    try {
      document.querySelector(`.piracy_marker.${key}`).style.display = "block";
    } catch (err) {}
  }

  hidePiracyMarker(key) {
    try {
      document.querySelector(`.piracy_marker.${key}`).style.display = "none";
    } catch (err) {}
  }

  displayNavalSpace(key) {

    if (this.game.spaces[key]) {
      this.displaySpace(key);
      return;
    }

    if (!this.game.navalspaces[key]) { return; }

    let obj = document.getElementById(key);
    let space = this.game.navalspaces[key];

    //
    // to prevent desyncs we make sure all units are in the same order
    //
    for (let key in space.units) {
      if (space.units[key].length > 0) {
	space.units[key].sort((a, b) => {
    	  if (a.type < b.type) return -1;
    	  if (a.type > b.type) return 1;
    	  return 0;
	});
        for (let z = 0; z < space.units[key].length; z++) {
	  space.units[key][z].idx = z;
	}
      }
    }

    //
    // should we show the tile?
    //
    let show_tile = 1;

    //
    // show piracy marker if needed
    //
    if (this.game.state.events.ottoman_piracy_seazones.includes(key)) {
      this.showPiracyMarker(key);
    } else {
      this.hidePiracyMarker(key);
    }

    //
    // do not show under some conditions
    //
    if (show_tile === 1) {
      obj.innerHTML = "";
      obj.innerHTML += this.returnNavies(space);
      obj.innerHTML += this.returnPersonages(space);
    }

  }

  displayNavalSpaces() {

    //
    // add tiles
    //
    for (let key in this.game.navalspaces) {
      if (this.game.navalspaces[key]) {
	this.displayNavalSpace(key);
      }
    }

  }

  addSelectable(el) {
    if (!el.classList.contains("selectable")) {
      el.classList.add('selectable');
    }
  }

  removeSelectable() {
    document.querySelectorAll(".selectable").forEach((el) => {
      el.onclick = (e) => {};
      el.classList.remove('selectable');
    });
    $('.space').off();
  }

  displaySpaces() {

    let his_self = this;

    //
    // generate faction tile info
    //
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


    if (!his_self.bound_gameboard_zoom) {

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
          his_self.theses_overlay.renderAtCoordinates(xpos, ypos);
	  //e.stopPropagation();
	  //e.preventDefault();	
	  //return;
	//}
      });

      his_self.bound_gameboard_zoom = 1;

    }


  }


  displayVictoryTrack() {

    let factions_and_scores;
    let x;

try {
    factions_and_scores = this.calculateVictoryPoints();
} catch (err) {
    console.log("#");
    console.log("# error in calculate victory points : " + err);
    console.log("#");
}

try {
    x = this.returnVictoryPointTrack();
} catch (err) {
    console.log("#");
    console.log("# error in return victory point track : " + err);
    console.log("#");
}

    let tiles = [];
    let zindex = 1;
    for (let i = 0; i < 30; i++) { tiles.push(0); }

    for (let f in factions_and_scores) {
try {
      let total_vp = factions_and_scores[f].vp;
      let ftile = f + "_vp_tile";
      obj = document.getElementById(ftile);
      obj.style.left = x[total_vp.toString()].left + "px";
      obj.style.top = x[total_vp.toString()].top + "px";
      obj.style.display = "block";
      if (tiles[total_vp] > 0) {
	let shift = 2 * tiles[total_vp];
        obj.style.transform = `translateY(-${shift}rem) translateX(${shift}rem)`;
	zindex = zindex-1;
        obj.style.zIndex = zindex;
        tiles[total_vp]++;
      } else {
	tiles[total_vp]++;
        obj.style.transform = ``;
        obj.style.zIndex = zindex;
      }
} catch (err) {
}

    }

  }



  returnCardImage(cardname, faction="") {

    let cardclass = "cardimg";
    let deckidx = -1;
    let card;
    let cdeck = this.returnDeck(true); // include removed cards
    let ddeck = this.returnDiplomaticDeck();

    if (cardname === "pass") {
      return `<img class="${cardclass}" src="/his/img/cards/PASS.png" /></div>`;
    }
    if (cardname === "autopass") {
      return `<img class="${cardclass}" src="/his/img/cards/AUTOPASS.png" /></div>`;
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
    let active_faction = faction;
    if (active_faction == "") { active_faction = this.game.state.active_faction; }

    if (deckidx == 0) { 
      if (this.deck[cardname]) {
        if (!this.deck[cardname].canEvent(this, active_faction)) {
          html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
        }
      }
    }
    if (deckidx == 1) { 
      if (!this.diplomatic_deck[cardname].canEvent(this, active_faction)) {
        html += `<img class="${cardclass} cancel_x" src="/his/img/cancel_x.png" />`;
      }
    }

    return html

  }


  displayDebaterPopup(debater) {
    
  }



  async preloadImages() {
    var allImages = [
      "img/factions/protestant.png",
      "img/factions/papacy.png",
      "img/factions/england.png",
      "img/factions/france.png",
      "img/factions/ottoman.png",
      "img/factions/hapsburgs.png",
      "img/backgrounds/reformation.jpg",
      "img/backgrounds/theological-debate.jpg",
      "img/backgrounds/theological-debate2.jpg",
      "img/backgrounds/diet_of_worms.jpeg",
      "img/backgrounds/language-zone.jpg",
      "img/backgrounds/95_theses.jpeg",
      "img/backgrounds/war_horse.png",
      "img/backgrounds/move/assault.jpg",
      "img/backgrounds/move/colonize.jpg",
      "img/backgrounds/move/explore.jpg",
      "img/backgrounds/move/conquer.jpg",
      "img/backgrounds/language_zone.jpg",
      "img/cards/PASS.png",
    ];

    this.preloadImageArray(allImages);
  }

  async preloadMoreImages() {
    var allImages = [
      "img/backgrounds/war-horse.png",
      "img/backgrounds/winter_background.png",
      "img/backgrounds/corsairs_destroyed.jpg",
      "img/backgrounds/diplomacy/excommunication.png",
      "img/backgrounds/henry_viii.png",
      "img/backgrounds/marital_status.png",
      "img/backgrounds/naval_battle.png",
      "img/backgrounds/new_world.png",
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






