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

    let cards = [];
    document.querySelectorAll(".strategy-card").forEach((el) => {
      cards.push(el);
    });
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.add("strategy-card-popup");
      cards[i].classList.add(`strat_slot_${(i+1)}`);
    };

        

    this.attachEvents(cards);

  }

  attachEvents(cards) {

/***
    let zindex = [];
    let old = 

    for (let i = 0; i < cards.length; i++) {
      cards[i].bind("mouseenter", function() {
        let slot = document.querySelector(`.strat_slot_${i+1}`);
	l
      });
      cards[i].bind("mouseenter", function() {
	
      });
    }
    $(adddiv).on('mouseenter', function () { let s = $(this).attr("id"); imperium_self.addSectorHighlight(s); });
    $(adddiv).on('mouseleave', function () { let s = $(this).attr("id"); imperium_self.removeSectorHighlight(s); });
    this.mod.cardbox.attachCardEvents();
***/

  }

}

module.exports = StrategyCardSelectionOverlay;

