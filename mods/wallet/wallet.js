const saito = require('./../../lib/saito/saito');
const SendTokensOverlay = require('./lib/overlay/send-tokens-overlay');
const ModTemplate = require('../../lib/templates/modtemplate');

class Wallet extends ModTemplate {

  constructor(app) {

    super(app);

    this.name = "Wallet";
    this.description = "Adds menu element for sending and receiving tokens.";
    this.categories = "Finance Utilities";
    
  }
  
  respondTo(type = "") {
    let arcade_mod = this;
    if (type == "header-menu") {
      return {
        returnMenu: function (app, mod) {
	  return `
            <div class="wallet-action-row" id="header-dropdown-send-tokens">
              <span class="scan-qr-info"><i class="settings-fas-icon fas fa-star"></i> Send Tokens</span>
            </div>
	  `;
        },
        attachEvents: function (app, mod) {
          document.querySelectorAll('#header-dropdown-send-tokens').forEach((element) => {
	    element.onclick = (e) => {
	      SendTokensOverlay.render(app, mod);
	      SendTokensOverlay.attachEvents(app, mod);
	    }
          });
        }
      };
    };
    return null;
  }

}

module.exports = Wallet;


