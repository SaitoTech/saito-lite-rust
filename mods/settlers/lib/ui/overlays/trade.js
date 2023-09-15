const TradeOverlayTemplate = require("./trade.template");
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class TradeOverlay {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);

    this.tradeType = -1; // trade with everyone, or playerNum
    this.get = {};
    this.give = {};
    this.offering_player = 0;
    this.accepting_trade = 0;
  }

  initialize() {
    this.resources = this.mod.returnResources();

    for (let r of this.resources) {
      console.log(r);
      this.get[r] = 0;
      this.give[r] = 0;
    }

    this.accepting_trade = 0;
  }

  render(reset = true) {
    if (reset) {
      this.initialize();
    }

    this.overlay.show(TradeOverlayTemplate(this));

    if (this.accepting_trade == 1) {
      document.querySelector(".trade_overlay_button").innerHTML =
        "Accept Trade";
    }

    this.attachEvents();
  }

  attachEvents() {
    let trade_overlay = this;
    let settlers_self = this.mod;

    document.querySelectorAll(".trade_count_up").forEach((arrow) => {
      arrow.onclick = (e) => {
        settlers_self.accepting_trade = 0;
        document.querySelector(".trade_overlay_button").innerHTML =
          "Broadcast Offer";

        let item = e.currentTarget.parentElement.getAttribute("id");
        let temp = item.split("_");
        let resname = temp[1];

        if (temp[0] == "want") {
          this.get[resname]++;
        } else {
          //
          // cannot offer more than you have
          //
          if (
            this.give[resname] < settlers_self.countResource(settlers_self.game.player, resname)
          ) {
            this.give[resname]++;
          }
        }
        this.render(false);
      };
    });

    document.querySelectorAll(".trade_count_down").forEach((arrow) => {
      arrow.onclick = (e) => {
        settlers_self.accepting_trade = 0;
        document.querySelector(".trade_overlay_button").innerHTML =
          "Broadcast Offer";

        let item = e.currentTarget.parentElement.getAttribute("id");
        let temp = item.split("_");
        let resname = temp[1];

        if (temp[0] == "want") {
          if (this.get[resname] > 0) {
            this.get[temp[1]]--;
          }
        } else {
          if (this.give[temp[1]] > 0) {
            this.give[temp[1]]--;
          }
        }
        this.render(false);
      };
    });

    $("#trade_overlay_broadcast_button").off();
    $("#trade_overlay_broadcast_button.valid_trade").on("click", function () {
      $("#trade_overlay_broadcast_button").off();

      if (settlers_self.accepting_trade == 0) {
        settlers_self.addMove(
          `offer\t${settlers_self.game.player}\t${trade_overlay.tradeType}\t${JSON.stringify(
            trade_overlay.give
          )}\t${JSON.stringify(trade_overlay.get)}`
        );
        settlers_self.endTurn();
        trade_overlay.overlay.hide();
      } else {
        settlers_self.addMove(`clear_advert\t${trade_overlay.offering_player}`);
        settlers_self.addMove(
          `accept_offer\t${trade_overlay.offering_player}\t${
            settlers_self.game.player
          }\t${JSON.stringify(trade_overlay.give)}\t${JSON.stringify(trade_overlay.get)}`
        );
        settlers_self.endTurn();
        trade_overlay.overlay.hide();
      }
    });
  }
}

module.exports = TradeOverlay;
