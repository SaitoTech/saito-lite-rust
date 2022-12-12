const InviteTemplate = require("./invite.template");
const SaitoTooltip = require("./../../../lib/saito/new-ui/saito-tooltip/saito-tooltip");

class Invite {
	
  constructor(app, mod, container="", invite) {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.invite = invite;
    this.saito_tooltip = new SaitoTooltip(app);
  }

  render() {
    //
    // insert content we will render into
    //
    if (document.querySelector(".arcade-invites")) {
      this.app.browser.replaceElementBySelector(InviteTemplate(this.app, this.mod, this.invite), ".arcade-invites");
    } else {
      this.app.browser.addElementToSelector(InviteTemplate(this.app, this.mod, this.invite), this.container);
    }

    this.saito_tooltip.info = `<div class="saito-table league-join-table">
        <div class="saito-table-body" id="league-table-ranking-body">
          
          <div class="saito-table-row">
            <div>Player1</div>
            <div>USSR</div>
          </div>
          <div class="saito-table-row">
            <div>Deck</div>
            <div>Late war</div>
          </div>
          <div class="saito-table-row">
            <div>US Bonus</div>
            <div>3</div>
          </div>
          <div class="saito-table-row">
            <div>Clock</div>
            <div>10</div>
          </div>
        </div>
      </div>`;

    this.saito_tooltip.render(this.app, this.mod, ".saito-tooltip-box");


    this.attachEvents();

  }

  attachEvents() {
  }

};

module.exports = Invite;

