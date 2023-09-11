const DeckTemplate = require('./deck.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class DeckOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod, false, true, true);
    }
 
    hide() {
      this.overlay.hide();
    }

    pullHudOverOverlay() {
      //
      // pull GAME HUD over overlay
      //
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex+1;
        this.mod.hud.zIndex = overlay_zindex+1;
      }
    }
    pushHudUnderOverlay() {
      //
      // push GAME HUD under overlay
      //
      let overlay_zindex = parseInt(this.overlay.zIndex);
      if (document.querySelector(".hud")) {
        document.querySelector(".hud").style.zIndex = overlay_zindex-2;
        this.mod.hud.zIndex = overlay_zindex-2;
      }
    }


  
    render(deck="") {

      let his_self = this.mod;
      this.overlay.show(DeckTemplate());

      if (deck == "hand") {
	for (let i = 0; i < his_self.game.deck[0].fhand[0].length; i++) {
	  let cidx = his_self.game.deck[0].fhand[0][i];
	  let cimg = his_self.returnCardImage(cidx);
	  let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
	  his_self.app.browser.addElementToSelector(html, ".deck-overlay");
	}
      }

      if (deck == "all") {
	for (let key in his_self.game.deck[0].cards) {
	  let cidx = key;
	  let cimg = his_self.returnCardImage(cidx);
	  let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
	  his_self.app.browser.addElementToSelector(html, ".deck-overlay");
	}
      }

      if (deck == "discards") {
	for (let key in his_self.game.deck[0].discards) {
	  let cidx = key;
	  let cimg = his_self.returnCardImage(cidx);
	  let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
	  his_self.app.browser.addElementToSelector(html, ".deck-overlay");
	}
      }

      if (deck == "removed") {
	for (let i = 0; i < his_self.game.state.removed.length; i++) {
	  let cidx = his_self.game.state.removed[i];;
	  let cimg = his_self.returnCardImage(cidx);
	  let html = `<div id="${cidx}" class="card ${cidx}">${cimg}</div>`;
	  his_self.app.browser.addElementToSelector(html, ".deck-overlay");
	}
      }

      this.pushHudUnderOverlay();

      this.attachEvents();

    }

    attachEvents() {

      let his_self = this.mod;

      $('.deck-overlay .card').off();
      $('.deck-overlay .card').on('mouseover', function() {
        let action2 = $(this).attr("id");
console.log(action2);
        his_self.cardbox.show(action2);
      });
      $('.deck-overlay .card').on('mouseout', function() {
        let action2 = $(this).attr("id");
console.log(action2);
        his_self.cardbox.hide(action2);
      });

    }

}

module.exports = DeckOverlay;



