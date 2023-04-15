const FactionTemplate = require('./faction.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class FactionOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render(faction="") {

      this.visible = true;

      let f = this.mod.factions[faction];
      this.overlay.show(FactionTemplate(f));

      let controlled_keys = 0;
      let keyboxen = '';

      for (let key in this.game.spaces) {
        if (this.game.spaces[key].type === "key") {
          if (this.game.spaces[key].political === this.factions[faction].key || (this.game.spaces[key].political === "" && this.game.spaces[key].home === this.factions[faction].key)) {
            controlled_keys++;
          }
        }
      }

      // ENGLAND
      if (this.factions[faction].key === "england") {
        let total_keys = 9;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = this.factions[faction].marital_status; i < 7; i++) {
            keyboxen += `<div class="faction_sheet_keytile england_marital_status${i+1}" id="england_marital_status_keytile${i+1}"></div>`;
        }
        for (let i = 1; i <= 9; i++) {
          if (i > (9-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${this.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      // FRANCE
      if (this.factions[faction].key === "france") {
        let total_keys = 11;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 0; i < 7; i++) {
          keyboxen += `<div class="faction_sheet_keytile france_chateaux_status${i+1}" id="france_chateaux_status_keytile${i+1}"></div>`;
        }
        for (let i = 1; i <= 11; i++) {
          if (i > (11-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${this.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      // OTTOMAN
      if (this.factions[faction].key === "ottoman") {
        let total_keys = 11;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 0; i <= 10; i++) {
          keyboxen += `<div class="faction_sheet_keytile ottoman_piracy_status${i}" id="ottoman_piracy_status_keytile${i}"></div>`;
        }
        for (let i = 1; i <= 11; i++) {
          if (i > (11-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${this.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      // PAPACY
      if (this.factions[faction].key === "papacy") {
        let total_keys = 7;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 0; i < 12; i++) {
          keyboxen += `<div class="faction_sheet_keytile papacy_construction_status${i+1}" id="papacy_construction_status_keytile${i+1}"></div>`;
        }
        for (let i = 1; i <= 7; i++) {
          if (i >= (7-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${this.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      // PROTESTANTS
      if (this.factions[faction].key === "protestant") {

        let total_keys = 11;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 0; i <= 6; i++) {
          let box_inserts = "";
          if (this.game.state.translations['new']['german'] == i) {
            box_inserts += `<div class="new_testament_german_tile" id="new_testament_german_tile"></div>`;
          }
          if (this.game.state.translations['new']['french'] == i) {
            box_inserts += `<div class="new_testament_french_tile" id="new_testament_french_tile"></div>`;
          }
          if (this.game.state.translations['new']['english'] == i) {
            box_inserts += `<div class="new_testament_english_tile" id="new_testament_english_tile"></div>`;
          }
          keyboxen += `<div class="faction_sheet_keytile protestant_translation_status${i}" id="protestant_translation_status_keytile${i}">${box_inserts}</div>`;
        }
        for (let i = 1; i <= 11; i++) {
          if (i > (11-remaining_keys)) {
            let box_inserts = "";
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${this.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      // HAPSBURG
      if (this.factions[faction].key === "hapsburg") {
        let total_keys = 14;
        let remaining_keys = total_keys - controlled_keys;
        for (let i = 1; i <= 14; i++) {
          if (this.game.state.translations['german']['full'] == i) {
            box_inserts += `<div class="bible_german_tile" id="bible_german_tile"></div>`;
          }
          if (this.game.state.translations['french']['full'] == i) {
            box_inserts += `<div class="bible_french_tile" id="bible_french_tile"></div>`;
          }
          if (this.game.state.translations['english']['full'] == i) {
            box_inserts += `<div class="bible_english_tile" id="bible_english_tile"></div>`;
          }
          if (i > (14-remaining_keys)) {
            keyboxen += `<div class="faction_sheet_keytile faction_sheet_${this.factions[faction].key}_keytile${i}" id="faction_sheet_keytile${i}"></div>`;
          }
        }
      }
      document.getElementById("faction_sheet").innerHTML = keyboxen;

      this.attachEvents();

    }

    attachEvents() {}

}

module.exports = FactionOverlay;



