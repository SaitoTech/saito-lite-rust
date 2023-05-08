const MonopolyOverlayTemplate = require("./monopoly.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class MonopolyOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.player = null;
    this.cardname = null;
  }

  render() {

    this.overlay.show(MonopolyOverlayTemplate(this.app, this.mod, this));
    this.attachEvents();
  }

  attachEvents() {
    this_self = this;
    document.querySelectorAll(".monopoly .settlers-desired-resources img").forEach(function(card, k) {
      card.onclick = (e) => {

        let target = e.currentTarget;
        let card = target.getAttribute("id");

        this_self.mod.addMove(`monopoly\t${this_self.player}\t${this_self.cardname}\t${card}`);
        this_self.mod.endTurn();
        this_self.overlay.hide();
        return 0;

      }
    });

  }

}

module.exports = MonopolyOverlay;

