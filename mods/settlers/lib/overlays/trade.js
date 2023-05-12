const TradeOverlayTemplate = require("./trade.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class TradeOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);

    this.get  = [];
    this.give = [];

  }

  render(reset=true) {

    if (reset == true) { 
      this.get = [3,0,0,0,0];
      this.give = [0,0,0,0,0];
    }

    this.overlay.show(TradeOverlayTemplate(this));
    this.attachEvents();
  }

  attachEvents() {

    let trade_overlay = this;
    let settlers_self = this.mod;

    $(".trade_area.card").off();
    $(".trade_area.card").on("click", function () {

        let item = $(this).attr("id");
        let temp = item.split("_");
        let resInd = parseInt(temp[1]);

        if (temp[0] == "want") {
          this.get[temp[1]]++;
        } else {
          this.give[temp[1]]++;
        } 

        trade_overlay.render(false);

    });

    $(".trade_overlay_reset_button").off();
    $(".trade_overlay_reset_button").on("click", function () {
	// render with implicit "reset=true"
        trade_overlay.render();
    });

    $(".trade_overlay_broadcast_button").off();
    $(".trade_overlay_broadcast_button").on("click", function () {

alert("OK TRADING");


//        if ($(this).hasClass("noselect")) { return; }
//        settlers_self.addMove(`clear_advert\t${settlers_self.game.player}`);
//        settlers_self.addMove(
//            `offer\t${settlers_self.game.player}\t
//            ${tradeType}\t${JSON.stringify(offering)}\t
//            ${JSON.stringify(receiving)}`);
////        settlers_self.overlay.hide();
//        settlers_self.overlay.closebox = false;
//        settlers_self.endTurn();

    });

  }

}

module.exports = TradeOverlay;

