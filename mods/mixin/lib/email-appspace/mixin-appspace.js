const MixinAppspaceTemplate = require('./mixin-appspace.template.js');
const MixinDepositTemplate = require('./mixin-deposit.template.js');
const MixinWithdrawTemplate = require('./mixin-withdraw.template.js');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

module.exports = MixinAppspace = {

  render(app, mod) {
    document.querySelector(".email-appspace").innerHTML = MixinAppspaceTemplate(app);
  },

  attachEvents(app, mod) {

    try {
      document.querySelector(".create_account").onclick = (e) => {
        mod.createAccount((res) => { 
  	  document.getElementById("create_account").innerHTML = JSON.stringify(res.data);;
        });
      }
    } catch (err) {}

    document.querySelector(".balances_withdraw").onclick = (e) => {
      let overlay = new SaitoOverlay(app);
      overlay.show(app, mod, MixinWithdrawTemplate(app), function() {
      });
    }
    document.querySelector(".balances_deposit").onclick = (e) => {
      let overlay = new SaitoOverlay(app);
      overlay.show(app, mod, MixinDepositTemplate(app), function() {
      });
    }
  },

}
