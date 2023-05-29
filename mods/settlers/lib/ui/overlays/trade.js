const TradeOverlayTemplate = require("./trade.template");
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class TradeOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);

    this.tradeType = -1; // trade with everyone, or playerNum
    this.get  = [];
    this.give = [];
    this.offering_player = 0;
    this.accepting_trade = 0;

  }


  render(tradeType=-1, reset=true) {

    this.tradeType = tradeType;    
    this.accepting_trade = 0;

    let resources = this.mod.returnResources();

    //
    // we use numeric values to simplify hte refactor, so we don't need to change every
    // part of the game logic. we should really just refer to resources by name consistently
    // throughout.
    //
    // brick
    // wood
    // wheat
    // wool
    // ore
    if (reset == true) { 
      this.get = [0,0,0,0,0];
      this.give = [0,0,0,0,0];
    } else {

      // get / give could be
      if (this.get["brick"] || this.get["wood"] || this.get["wheat"] || this.get["wool"] || this.get["ore"]) {
	let x = [0,0,0,0,0];
	if (this.get["brick"]) { x[0] = this.get["brick"]; }
	if (this.get["wood"])  { x[1] = this.get["wood"]; }
	if (this.get["wheat"]) { x[2] = this.get["wheat"]; }
	if (this.get["wool"])  { x[3] = this.get["wool"]; }
	if (this.get["ore"])   { x[4] = this.get["ore"]; }
        this.get = x;
        this.accepting_trade = 1;
      }
      if (this.give["brick"] || this.give["wood"] || this.give["wheat"] || this.give["wool"] || this.give["ore"]) {
	let x = [0,0,0,0,0];
	if (this.give["brick"]) { x[0] = this.give["brick"]; }
	if (this.give["wood"])  { x[1] = this.give["wood"]; }
	if (this.give["wheat"]) { x[2] = this.give["wheat"]; }
	if (this.give["wool"])  { x[3] = this.give["wool"]; }
	if (this.give["ore"])   { x[4] = this.give["ore"]; }
        this.give = x;
        this.accepting_trade = 1;
      }
    }

console.log(JSON.stringify(this.give));
console.log(JSON.stringify(this.get));

    this.overlay.show(TradeOverlayTemplate(this));

    if (this.accepting_trade == 1) {
      document.querySelector(".trade_overlay_button.saito-button-primary").innerHTML = "Accept Trade";
    }

    this.attachEvents();
  }

  attachEvents() {

    let trade_overlay = this;
    let settlers_self = this.mod;

    document.querySelectorAll(".trade_count_up").forEach((arrow) => {
      arrow.addEventListener("click", (e) => {

        settlers_self.accepting_trade = 0;
        document.querySelector(".trade_overlay_button.saito-button-primary").innerHTML = "Broadcast Offer";

        let arrow = e.currentTarget;
        let count_div = arrow.nextElementSibling;
        let new_count = Number(count_div.getAttribute("data-count")) + 1;

        let item = arrow.parentElement.getAttribute("id");
        let temp = item.split("_");
        let resInd = parseInt(temp[1]);

        let resname = "brick";
        if (resInd == 1) { resname = "wood"; }
        if (resInd == 2) { resname = "wheat"; }
        if (resInd == 3) { resname = "wool"; }
        if (resInd == 4) { resname = "ore"; }

        if (temp[0] == "want") {
          trade_overlay.get[temp[1]]++;
          count_div.setAttribute("data-count", new_count);
          count_div.innerHTML = new_count;
        } else {
          //
          // cannot offer more than you have
          //
          if (trade_overlay.give[temp[1]] >= settlers_self.countResource(settlers_self.game.player, resname)) {
            salert("Not more "+ resname +" to trade");
            return;
          } else {
            count_div.setAttribute("data-count", new_count);
            count_div.innerHTML = new_count;
            trade_overlay.give[temp[1]]++;
          }
        }

      });
    });


    document.querySelectorAll(".trade_count_down").forEach((arrow) => {
      arrow.addEventListener("click", (e) => {

          settlers_self.accepting_trade = 0;
          document.querySelector(".trade_overlay_button.saito-button-primary").innerHTML = "Broadcast Offer";

          let arrow = e.currentTarget;
          let count_div = arrow.previousElementSibling;
          let new_count = Number(count_div.getAttribute("data-count")) - 1;

          let item = arrow.parentElement.getAttribute("id");
          let temp = item.split("_");
          let resInd = parseInt(temp[1]);

          let resname = "brick";
          if (resInd == 1) { resname = "wood"; }
          if (resInd == 2) { resname = "wheat"; }
          if (resInd == 3) { resname = "wool"; }
          if (resInd == 4) { resname = "ore"; }

          if (!new_count >= 0) {
            if (temp[0] == "want") {
              trade_overlay.get[temp[1]]--;
            } else {
              trade_overlay.give[temp[1]]--;
            }

            count_div.setAttribute("data-count", new_count);
            count_div.innerHTML = new_count;
          
            if (new_count == 0) {
              count_div.innerHTML = "";
            } 
          }
      });  
    });


    $(".trade_overlay_reset_button").off();
    $(".trade_overlay_reset_button").on("click", function () {
	// render with implicit "reset=true"
        trade_overlay.render(trade_overlay.tradeType);
    });

    $(".trade_overlay_broadcast_button").off();
    $(".trade_overlay_broadcast_button").on("click", function () {

      let offering = {};
      let receiving = {};

      // brick
      // wood
      // wheat
      // wool
      // ore
      for (let i = 0; i < trade_overlay.give.length; i++) {
	if (trade_overlay.give[i] > 0) {
	  if (i == 0) { offering["brick"] = trade_overlay.give[i]; }
	  if (i == 1) { offering["wood"]  = trade_overlay.give[i]; }
	  if (i == 2) { offering["wheat"] = trade_overlay.give[i]; }
	  if (i == 3) { offering["wool"]  = trade_overlay.give[i]; }
	  if (i == 4) { offering["ore"]   = trade_overlay.give[i]; }
        }
      }
      for (let i = 0; i < trade_overlay.get.length; i++) {
	if (trade_overlay.get[i] > 0) {
	  if (i == 0) { receiving["brick"] = trade_overlay.get[i]; }
	  if (i == 1) { receiving["wood"]  = trade_overlay.get[i]; }
	  if (i == 2) { receiving["wheat"] = trade_overlay.get[i]; }
	  if (i == 3) { receiving["wool"]  = trade_overlay.get[i]; }
	  if (i == 4) { receiving["ore"]   = trade_overlay.get[i]; }
        }
      }

      if (settlers_self.accepting_trade == 0) {
        settlers_self.addMove(`offer\t${settlers_self.game.player}\t${trade_overlay.tradeType}\t${JSON.stringify(offering)}\t${JSON.stringify(receiving)}`);
        settlers_self.endTurn();
        trade_overlay.overlay.hide();
      } else {
        settlers_self.addMove(`clear_advert\t${trade_overlay.offering_player}`);
        settlers_self.addMove(`accept_offer\t${trade_overlay.offering_player}\t${settlers_self.game.player}\t${JSON.stringify(offering)}\t${JSON.stringify(receiving)}`);
        settlers_self.endTurn();
        trade_overlay.overlay.hide();
      }

    });

  }

}

module.exports = TradeOverlay;

