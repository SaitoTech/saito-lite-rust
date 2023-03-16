const ImperiumStrategyCardOverlayTemplate = require("./strategy-card.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class StrategyCardOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render() {

    //
    // show overlay
    //
    this.overlay.showCardSelectionOverlay(this.app, this.mod, this.returnStrategyCards(), {
      columns : 4 ,
      backgroundImage : "/imperium/img/starscape_background3.jpg" ,
    });

    //
    // add player, state and bonus
    //
    for (let s in this.strategy_cards) {

      let strategy_card_state = "not picked";
      let strategy_card_player = -1;
      let strategy_card_bonus = 0;

      for (let i = 0; i < this.game.state.strategy_cards.length; i++) {
        if (s === this.game.state.strategy_cards[i]) {
          strategy_card_bonus = this.game.state.strategy_cards_bonus[i];
        }
      }

      let strategy_card_bonus_html = "";
      if (strategy_card_bonus > 0) {
        strategy_card_bonus_html =
        `<div class="strategy_card_bonus">
          <i class="fas fa-database white-stroke"></i>
          <span>${strategy_card_bonus}</span>
        </div>`;
        this.app.browser.addElementToDom(strategy_card_bonus_html, document.getElementById(s));
      }

      let thiscard = this.strategy_cards[s];
      for (let i = 0; i < this.game.state.players_info.length; i++) {
        if (this.game.state.players_info[i].strategy.includes(s)) {
          strategy_card_state = "unplayed";
          strategy_card_player = (i+1);
          if (this.game.state.players_info[i].strategy_cards_played.includes(s)) {
            strategy_card_state = "played";
          };
        };
      }

      card_html = '';
      if (strategy_card_state != "not picked") {
        card_html += `
          <div class="strategy_card_state p${strategy_card_player}">
            <div class="strategy_card_state_internal bk">${strategy_card_state}</div>
          </div>
       `;
      }

      this.app.browser.addElementToDom(card_html, document.getElementById(s));

    }

    this.attachEvents();

  }

  attachEvents() {
  }

}

module.exports = StrategyCardOverlay;

