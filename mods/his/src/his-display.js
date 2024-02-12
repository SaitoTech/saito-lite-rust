
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

    for (let key in this.game.state.cards_left) {

      let qs = ".game-factions .game-menu-sub-options ";
      if (key === "hapsburgs") { 
        qs += ".game-hapsburgs .game-menu-option-label";
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

  }

  displayTurnTrack() {

    let obj = document.querySelector(".turntrack");
    obj.classList.remove(`turntrack1`);
    obj.classList.remove(`turntrack${this.game.state.round-1}`);
    obj.classList.add(`turntrack${this.game.state.round}`);

  }

  displayDiplomacyTable() { this.displayWarBox(); }
  displayWarBox() {

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
  }

  displayDebaters() {
    this.debaters_overlay.render();
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

  displayExplorers() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    let f = ["hapsburg","france","england"];
    for (let i = 0; i < f.length; i++) {
      let x = this.returnAvailableExplorers(f[i]);
      for (let z = 0; z < x.length; z++) {
        html += `	<div class="personage_tile${z}" data-id="${this.explorers[x[z]].type}" style="background-image:url('${this.explorers[x[z]].img}')"></div>`;
      }
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

  }

  displayConquistadors() {

    let html = `<div class="personage_overlay" id="personage_overlay">`;
    let f = ["hapsburg","france","england"];
    for (let i = 0; i < f.length; i++) {
      let x = this.returnAvailableConquistadors(f[i]);
      for (let z = 0; z < x.length; z++) {
        html += `	<div class="personage_tile${z}" data-id="${this.conquistadors[x[z]].type}" style="background-image:url('${this.conquistadors[x[z]].img}')"></div>`;
      }
    }
    html += `</div>`;

    this.overlay.showOverlay(html);

  }

  displayTheologicalDebater(debater, attacker=true) {

    let tile_f = "/his/img/tiles/debaters/" + this.debaters[debater].img;
    let tile_b = tile_f.replace('.svg', '_back.svg');

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

    if (this.game.state.events.war_in_persia) { this.displayPersia(); }
    if (this.game.state.events.revolt_in_egypt) { this.displayEgypt(); }
    if (this.game.state.events.revolt_in_ireland) { this.displayIreland(); }

    try {
      this.displayTurnTrack();
    } catch (err) {
      console.log("error displaying board... " + err);
    }
    try {
      this.displayWarBox();
    } catch (err) {
      console.log("error displaying board... " + err);
    }
    try {
      this.displayColony();
    } catch (err) {
      console.log("error displaying board... " + err);
    }
    try {
      this.displayConquest();
    } catch (err) {
      console.log("error displaying conquest... " + err);
    }
    try {
      this.displayElectorateDisplay();
    } catch (err) {
      console.log("error displaying electorates... " + err);
    }
    try {
      this.displayNewWorld();
    } catch (err) {
      console.log("error displaying new world... " + err);
    }
    try {
      this.displaySpaces();
    } catch (err) {
      console.log("error displaying spaces... " + err);
    }
    try {
      this.displayNavalSpaces();
    } catch (err) {
      console.log("error displaying naval spaces... " + err);
    }
    try {
      this.displayVictoryTrack();
    } catch (err) {
      console.log("error displaying victory track... " + err);
    }
  }

  displayColony() {

    let obj = document.querySelector(".crossing_atlantic");
    for (let i = 0; i < this.game.state.colonies.length; i++) {
      if (this.game.state.colonies[i].resolved != 1) {
        if (this.game.state.colonies[i].faction == "france") {
	  let tile = "/his/img/tiles/colonies/Charlesbourg.svg";
	  if (this.game.state.newworld['french_colony1'].claimed == 1) {
	    tile = "/his/img/tiles/colonies/Montreal.svg";
	  }
	  obj.innerHTML += `<img class="army_tile" src="${tile}" />`;
        }
        if (this.game.state.colonies[i].faction == "hapsburg") {
	  let tile = "/his/img/tiles/colonies/PuertoRico.svg";
	  if (this.game.state.newworld['hapsburg_colony1'].claimed == 1) {
	    tile = "/his/img/tiles/colonies/Cuba.svg";
	  }
	  if (this.game.state.newworld['hapsburg_colony2'].claimed == 1) {
	    tile = "/his/img/tiles/colonies/Hispanola.svg";
	  }
	  obj.innerHTML += `<img class="army_tile" src="${tile}" />`;
        }
        if (this.game.state.colonies[i].faction == "england") {
	  let tile = "/his/img/tiles/colonies/Roanoke.svg";
	  if (this.game.state.newworld['english_colony1'].claimed == 1) {
	    tile = "/his/img/tiles/colonies/Jamestown.svg";
	  }
	  obj.innerHTML += `<img class="army_tile" src="${tile}" />`;
        }
      }
    }

    if (this.game.state.newworld['england_colony1'].claimed == 1) {
      document.querySelector('.england_colony1').innerHTML = `<img class="nw_tile" src="${this.game.state.newworld['england_colony1'].img}" />`;
    }
    if (this.game.state.newworld['england_colony2'].claimed == 1) {
      document.querySelector('.england_colony2').innerHTML = `<img class="nw_tile" src="${this.game.state.newworld['england_colony2'].img}" />`;
    }
    if (this.game.state.newworld['france_colony1'].claimed == 1) {
      document.querySelector('.france_colony1').innerHTML = `<img class="nw_tile" src="${this.game.state.newworld['france_colony1'].img}" />`;
    }
    if (this.game.state.newworld['france_colony2'].claimed == 1) {
      document.querySelector('.france_colony2').innerHTML = `<img class="nw_tile" src="${this.game.state.newworld['france_colony2'].img}" />`;
    }
    if (this.game.state.newworld['hapsburg_colony1'].claimed == 1) {
      document.querySelector('.hapsburg_colony1').innerHTML = `<img class="nw_tile" src="${this.game.state.newworld['hapsburg_colony1'].img}" />`;
    }
    if (this.game.state.newworld['hapsburg_colony2'].claimed == 1) {
      document.querySelector('.hapsburg_colony2').innerHTML = `<img class="nw_tile" src="${this.game.state.newworld['hapsburg_colony2'].img}" />`;
    }
    if (this.game.state.newworld['hapsburg_colony3'].claimed == 1) {
      document.querySelector('.hapsburg_colony3').innerHTML = `<img class="nw_tile" src="${this.game.state.newworld['hapsburg_colony3'].img}" />`;
    }

  }

  displayConquest() {

    let obj = document.querySelector(".crossing_atlantic");
        obj.innerHTML = "";

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

    for (let z = 0; z < this.game.state.explorations.length; z++) {

      let exp = this.game.state.explorations[z];
      let faction = exp.faction;
      let round = exp.round;

      //      
      // current round are unresolved      
      //      
      if (round == this.game.state.round) {
        if (faction == "hapsburg") {
          if (this.game.state.hapsburg_charted == 1) {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/hapsburg/Hapsburg_ExplorationCharted.svg" />`;
          } else {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/hapsburg/Hapsburg_Exploration.svg" />`;
          }
        }
        if (faction == "france") {
          if (this.game.state.france_charted == 1) {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/france/French_ExplorationCharted.svg" />`;
          } else {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/france/French_Exploration.svg" />`;
          }
        }
        if (faction == "england") {
          if (this.game.state.england_charted == 1) {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/england/English_ExplorationCharted.svg" />`;
          } else {
            obj.innerHTML += `<img class="army_tile" src="/his/img/tiles/england/English_Exploration.svg" />`;
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

  }

  returnExplorationTile(f="") {
    if (f == "hapsburg") { return "Hapsburg_key.svg"; }
    if (f == "england") { return "England_key.svg"; }
    if (f == "france") { return "France_key.svg"; }
    return "";
  }

  displayNewWorld() {
try {
    this.displayConquest();
    this.displayExploration();
    this.displayColony();
} catch (err) { 
  console.log("display error: " + JSON.stringify(err));
}
  }

  displaySpaceDetailedView(name) {
    // function is attached to this.spaces not this.game.spaces
    let html = this.spaces[name].returnView();    
    this.overlay.show(html);
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

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }
    if (owner == "protestant") { stype = "hex"; }

    if (owner != "") {

      // if these have a major ally, we make them
      // the owner for tile-display purposes.
      if (owner === "hungary") {
	owner = this.returnAllyOfMinorPower(owner);
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
	owner = this.returnAllyOfMinorPower(owner);
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
	owner = this.returnAllyOfMinorPower(owner);
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
	owner = this.returnAllyOfMinorPower(owner);
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

      for (let zz = 0; zz < space.units[z].length; zz++) {
	if (space.units[z][zz].type === "squadron") {
	  squadrons += 2;
	}
	if (space.units[z][zz].type === "corsair") {
	  corsairs += 1;
	}
      }

      while (squadrons >= 2) {
        if (z === "hapsburg") {
          tile = "/his/img/tiles/hapsburg/";	  
	  if (squadrons >= 2) {
            tile += `Hapsburg_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "england") {
          tile = "/his/img/tiles/england/";	  
	  if (squadrons >= 2) {
            tile += `English_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "france") {
          tile = "/his/img/tiles/france/";	  
	  if (squadrons >= 2) {
            tile += `French_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "papacy") {
          tile = "/his/img/tiles/papacy/";	  
	  if (squadrons >= 2) {
            tile += `Papacy_squadron.svg`;
	    squadrons -= 2;
	  }
        }
        if (z === "ottoman") {
          tile = "/his/img/tiles/ottoman/";	  
	  if (squadrons >= 2) {
            tile += `Ottoman_squadron.svg`;
	    squadrons -= 2;
          }
	  if (corsairs >= 1) {
            tile += `Ottoman_corsair.svg`;
	    corsairs -= 1;
          }
        }
        if (z === "venice") {
          tile = "/his/img/tiles/venice/";	  
	  if (squadrons >= 2) {
            tile += `Venice_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "genoa") {
          tile = "/his/img/tiles/genoa/";	  
	  if (squadrons >= 2) {
            tile += `Genoa_squadron.svg`;
	    squadrons -= 2;
          }
        }
        if (z === "scotland") {
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
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScotlandReg-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['regular']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/scotland/ScotlandReg-1.svg" />`;
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
      if (this.game.state.board[z]) {
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
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['6']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-6.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['5']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-5.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['4']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-4.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['3']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-3.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['2']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-2.svg" />`;
	    }
	    for (let i = 0; i < this.game.state.board[z].deployed[spacekey]['mercenary']['1']; i++) {
              html += `<img class="army_tile" src="/his/img/tiles/ottoman/OttomanMerc-1.svg" />`;
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
    if (!space || space == undefined) { space = this.game.navalspaces[spacekey]; }

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
    if (this.game.state.board_updated < ts + 20000) {
      this.refreshBoardUnits();
    }

    if (!this.game.spaces[key]) { return; }

    let space = this.game.spaces[key];
    let tile = this.returnSpaceTile(space);

    let stype = "hex";

    if (space.type == "town") { stype = "hex"; }
    if (space.type == "key") { stype = "key"; }

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
    if (space.language == "german" && space.units["protestant"].length > 0) { show_tile = 1; }

    //
    // and force for keys
    //
    if (space.home === "" && space.political !== "") { show_tile = 1; }
    if (space.type === "key") { show_tile = 1; }
    if (space.type === "electorate") { show_tile = 1; }

    //
    // and force if has units
    //
    for (let key in space.units) {
      if (space.units[key].length > 0) {
	show_tile = 1; 
      }
    }

    //
    // sanity check
    //
    if (tile === "") { show_tile = 0; }

    let t = "."+key;
    document.querySelectorAll(t).forEach((obj) => {

      obj.innerHTML = "";

      if (show_tile === 1) {
        obj.innerHTML = `<img class="${stype}tile" src="${tile}" />`;
        obj.innerHTML += this.returnArmies(space);
        obj.innerHTML += this.returnNavies(space);
        obj.innerHTML += this.returnPersonages(space);
      }

      if (space.fortified == 1) {
        obj.innerHTML += `<img class="fortified" src="/his/img/tiles/Fortress.svg" />`;
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

  displayNavalSpace(key) {

    if (this.game.spaces[key]) { this.displaySpace(key); return; }
    if (!this.game.navalspaces[key]) { return; }

    let obj = document.getElementById(key);
    let space = this.game.navalspaces[key];

    //
    // should we show the tile?
    //
    let show_tile = 1;

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

    let factions_and_scores = this.calculateVictoryPoints();

    let x = this.returnVictoryPointTrack();

    for (f in factions_and_scores) {
try {
      let total_vp = factions_and_scores[f].vp;
      let ftile = f + "_vp_tile";
      obj = document.getElementById(ftile);
      obj.style.left = x[total_vp.toString()].left + "px";
      obj.style.top = x[total_vp.toString()].top + "px";
      obj.style.display = "block";
} catch (err) {
  console.log("Error Displaying Victory Track: " + JSON.stringify(err));
}

    }

  }



  returnCardImage(cardname) {

    let cardclass = "cardimg";
    let deckidx = -1;
    let card;
    let cdeck = this.returnDeck();
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
    if (deckidx == 0) { 
      if (this.deck[cardname]) {
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
      "img/cards/PASS.png",
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






