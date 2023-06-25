const ImperiumStrategyCardSelectionOverlayTemplate = require("./strategy-card-selection.template");
const ImperiumStrategyCardOverlayTemplate = require("./strategy-card.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class StrategyCardSelectionOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render(scards_objs=[], mycallback) {

    let overlay_self = this;

    //
    //
    //
    //this.mod.cardbox.render();
    //this.mod.cardbox.addCardType("strategy-card-popup", "select", function(cardname) {
    //});


    this.overlay.show(ImperiumStrategyCardSelectionOverlayTemplate());
    this.overlay.setBackgroundColor("#000D");
    this.app.browser.addElementToSelector(ImperiumStrategyCardOverlayTemplate(), ".strategy-card-selection-content");

    for (let i = 0; i < scards_objs.length; i++) {
      this.app.browser.addElementToSelector(scards_objs[i].returnCardImage(1), '.strategy-card-selection-controls');
    }

    let cards = [];
    document.querySelectorAll(".strategy-card").forEach((el) => {
      cards.push(el);
    });
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.add("strategy-card-popup");
      cards[i].classList.add(`strat_slot_${(i+1)}`);
    };

        

    this.attachEvents(cards, mycallback);

  }

  attachEvents(cards, mycallback) {

    let overlay_self = this;

    for (let i = 0; i < cards.length; i++) {
      cards[i].onclick = (e) => {
       overlay_self.overlay.hide();
        overlay_self.mod.hideStrategyCard(e.currentTarget.id);
        mycallback(e.currentTarget.id);
      }
    }

  }

}

module.exports = StrategyCardSelectionOverlay;

