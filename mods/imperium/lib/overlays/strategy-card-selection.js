const ImperiumStrategyCardSelectionOverlayTemplate = require("./strategy-card-selection.template");
const ImperiumStrategyCardOverlayTemplate = require("./strategy-card.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class StrategyCardSelectionOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render(scards_objs=[]) {

    //
    //
    //
    this.mod.cardbox.render();
    this.mod.cardbox.addCardType("strategy-card-popup", "select", function() { alert("TESTING"); });


    this.overlay.show(ImperiumStrategyCardSelectionOverlayTemplate());
    this.app.browser.addElementToSelector(ImperiumStrategyCardOverlayTemplate(), ".strategy-card-selection-content");

    for (let i = 0; i < scards_objs.length; i++) {
      this.app.browser.addElementToSelector(scards_objs[i].returnCardImage(1), '.strategy-card-selection-controls');
    }

    document.querySelectorAll(".strategy-card").forEach((el) => {
      el.classList.add("strategy-card-popup");
    });

    

    this.attachEvents();

  }

  attachEvents() {

    this.mod.cardbox.attachCardEvents();

  }

}

module.exports = StrategyCardSelectionOverlay;

