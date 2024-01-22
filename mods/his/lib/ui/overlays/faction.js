const FactionTemplate = require('./faction.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class FactionOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
    }

    hide() { this.overlay.hide(); } 
   
    render(faction="") {

      let his_self = this.mod;

      this.visible = true;

      let f = this.mod.factions[faction];
      this.overlay.show(FactionTemplate(f));

      let controlled_keys = 0;
      let keyboxen = '';

      let war_winner_vp = 0;

      for (let key in his_self.game.spaces) {
        if (his_self.game.spaces[key].type === "key") {
          if (his_self.game.spaces[key].political === his_self.factions[faction].key || (his_self.game.spaces[key].political === "" && his_self.game.spaces[key].home === his_self.factions[faction].key)) {
            controlled_keys++;
          }
        }
      }

      // ENGLAND
      if (his_self.factions[faction].key === "england") {
	war_winner_vp = his_self.game.state.england_war_winner_vp;
        let total_keys = 9;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = his_self.factions[faction].marital_status; i < 7; i++) {
            keyboxen += `<div class="faction_sheet_keytile england_marital_status${i+1}" id="england_marital_status_keytile${i+1}"></div>`;
        }
        for (let i = 1; i <= 9; i++) {
          if (i > (9-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }

        if (this.mod.game.state.leaders.henry_viii == 1) {
	}
        if (this.mod.game.state.leaders.edward_vi == 1) {
	  this.app.browser.addElementToSelector(this.mod.returnCardImage("019"), ".faction_sheet_ruler");
	}
        if (this.mod.game.state.leaders.mary_i == 1) {
	  this.app.browser.addElementToSelector(this.mod.returnCardImage("021"), ".faction_sheet_ruler");
	}
        if (this.mod.game.state.leaders.elizabeth_i == 1) {
	  this.app.browser.addElementToSelector(this.mod.returnCardImage("023"), ".faction_sheet_ruler");
	}


      }
      // FRANCE
      if (his_self.factions[faction].key === "france") {
	war_winner_vp = his_self.game.state.france_war_winner_vp;
        let total_keys = 11;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 0; i < 7; i++) {
          keyboxen += `<div class="faction_sheet_keytile france_chateaux_status${i+1}" id="france_chateaux_status_keytile${i+1}"></div>`;
        }
        for (let i = 1; i <= 11; i++) {
          if (i > (11-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }

        if (this.mod.game.state.leaders.henry_ii == 1) {
	  this.app.browser.addElementToSelector(this.mod.returnCardImage("020"), ".faction_sheet_ruler");
	}

      }
      // OTTOMAN
      if (his_self.factions[faction].key === "ottoman") {
	war_winner_vp = his_self.game.state.ottoman_war_winner_vp;
        let total_keys = 11;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 0; i <= 10; i++) {
          keyboxen += `<div class="faction_sheet_keytile ottoman_piracy_status${i}" id="ottoman_piracy_status_keytile${i}"></div>`;
        }
        for (let i = 1; i <= 11; i++) {
          if (i > (11-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      // PAPACY
      if (his_self.factions[faction].key === "papacy") {
	war_winner_vp = his_self.game.state.papacy_war_winner_vp;
        let total_keys = 7;
	controlled_keys = his_self.returnNumberOfKeysControlledByFaction("papacy");
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 0; i < 12; i++) {
	  if (his_self.game.state.saint_peters_cathedral['state'] == i) {
            keyboxen += `<div class="faction_sheet_keytile papacy_construction_status${i+1} saint_peters_tile" id="papacy_construction_status_keytile${i+1}"></div>`;
          }
	  if (his_self.game.state.saint_peters_cathedral['vp'] == i) {
            keyboxen += `<div class="faction_sheet_keytile papacy_construction_status${7+i} saint_peters_tile" id="papacy_construction_status_keytile${7+i}"></div>`;
          }
        }
        for (let i = 1; i <= 7; i++) {
          if (i == controlled_keys) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i} papacy_keytile" id="faction_sheet_keytile${i}"></div>`;
          }
        }

        if (this.mod.game.state.leaders.clement_vii == 1) {
	  this.app.browser.addElementToSelector(this.mod.returnCardImage("010"), ".faction_sheet_ruler");
	}
        if (this.mod.game.state.leaders.paul_iii == 1) {
	  this.app.browser.addElementToSelector(this.mod.returnCardImage("014"), ".faction_sheet_ruler");
	}
        if (this.mod.game.state.leaders.julius_iii == 1) {
	  this.app.browser.addElementToSelector(this.mod.returnCardImage("022"), ".faction_sheet_ruler");
	}

      }
      // PROTESTANTS
      if (his_self.factions[faction].key === "protestant") {
	war_winner_vp = his_self.game.state.protestant_war_winner_vp;
        for (let i = 0; i <= 6; i++) {
          let box_inserts = "";
          if (his_self.game.state.translations['new']['german'] == i) {
            box_inserts += `<div class="new_testament_german_tile" id="new_testament_german_tile"></div>`;
          }
          if (his_self.game.state.translations['new']['french'] == i) {
            box_inserts += `<div class="new_testament_french_tile" id="new_testament_french_tile"></div>`;
          }
          if (his_self.game.state.translations['new']['english'] == i) {
            box_inserts += `<div class="new_testament_english_tile" id="new_testament_english_tile"></div>`;
          }
          keyboxen += `<div class="faction_sheet_keytile protestant_translation_status${i}" id="protestant_translation_status_keytile${i}">${box_inserts}</div>`;
        }
        for (let i = 1; i <= 12; i++) {
          let box_inserts = "";
          if (his_self.game.state.translations['full']['german'] == (i-1)) {
            box_inserts += `<div class="bible_german_tile" id="bible_german_tile"></div>`;
          }
          if (his_self.game.state.translations['full']['french'] == (i-1)) {
            box_inserts += `<div class="bible_french_tile" id="bible_french_tile"></div>`;
          }
          if (his_self.game.state.translations['full']['english'] == (i-1)) {
            box_inserts += `<div class="bible_english_tile" id="bible_english_tile"></div>`;
          }
          keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}">${box_inserts}</div>`;
        }
      }

      // HAPSBURG
      if (his_self.factions[faction].key === "hapsburg") {
	war_winner_vp = his_self.game.state.hapsburg_war_winner_vp;
        let total_keys = 14;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 1; i <= 14; i++) {
          if (his_self.game.state.translations['german']['full'] == i) {
            box_inserts += `<div class="bible_german_tile" id="bible_german_tile"></div>`;
          }
          if (his_self.game.state.translations['french']['full'] == i) {
            box_inserts += `<div class="bible_french_tile" id="bible_french_tile"></div>`;
          }
          if (his_self.game.state.translations['english']['full'] == i) {
            box_inserts += `<div class="bible_english_tile" id="bible_english_tile"></div>`;
          }
          if (i > (14-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${his_self.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      this.app.browser.addElementToSelector(keyboxen, ".faction_sheet");


      while (war_winner_vp >= 2) {
        this.app.browser.addElementToSelector('<div class="war_winner_vp vp2"></div>', ".faction_sheet_vp");
	war_winner_vp -= 2;
      }
      while (war_winner_vp >= 1) {
        this.app.browser.addElementToSelector('<div class="war_winner_vp vp1"></div>', ".faction_sheet_vp");
	war_winner_vp -= 1;
      }

      this.attachEvents();

    }

    attachEvents() {}

}

module.exports = FactionOverlay;



