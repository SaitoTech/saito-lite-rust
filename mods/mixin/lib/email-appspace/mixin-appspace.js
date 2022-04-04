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

    try {
      document.querySelector(".activity_button").onclick = (e) => {

alert("loading history...");

        mod.fetchSnapshots("", 20, "DESC", (d) => { 
	  document.querySelector(".activity_container").innerHTML = "";
	  for (let i = 0; i < d.data.length; i++) {
	    document.querySelector(".activity_container").innerHTML += JSON.stringify(d.data[i]);;
	  }
        });
      }
    } catch (err) {}

    document.querySelector(".balances_withdraw").onclick = (e) => {

      let overlay = new SaitoOverlay(app);
      let ticker = event.target.getAttribute("data-ticker");
      let asset_id = event.target.getAttribute("data-assetid");
      let balance = event.target.getAttribute("data-balance");
      let sender = event.target.getAttribute("data-sender");

      overlay.show(app, mod, MixinWithdrawTemplate(app, ticker, balance), function() {});

      document.querySelector(".withdraw_submit").onclick = (e) => {

	let amount = document.querySelector(".withdraw_amount").value;
	let address = document.querySelector(".withdraw_address").value;

	let c = confirm(`Check fee for withdrawing ${amount} to ${address}?`);
 	if (c) {
	  document.getElementById("email-appspace-withdraw-overlay").innerHTML = "Checking withdrawl fee. Please be patient...";
	  mod.checkWithdrawalFee(asset_id, function(fee) {
	    document.getElementById("email-appspace-withdraw-overlay").innerHTML = "Withdrawal Fee: "+fee;
	    let c2 = confirm(`Withdrawal fee is ${fee}. Please confirm withdrawal`);
	    if (c2) {
	      document.getElementById("email-appspace-withdraw-overlay").innerHTML = "Processing Withdrawal... please wait";
	      alert("Processing Withdrawal!");
	      let hash = app.wallet.sendPayment([sender], [address], [amount], (new Date().getTime()), function() {
                mod.overlay.hide();
              }, ticker);
      	      overlay.hide();
	    }
	  });
	} else {
	  alert("withdrawal cancelled");
	}
      }
    }
    document.querySelector(".balances_deposit").onclick = (e) => {

      let overlay = new SaitoOverlay(app);
      let address = event.target.getAttribute("data-address").split("|")[0];
      let confs = event.target.getAttribute("data-confs");
      let ticker = event.target.getAttribute("data-ticker");

      overlay.show(app, mod, MixinDepositTemplate(app, address, confs, ticker), function() {
      });

      const QRCode = require('../../../../lib/helpers/qrcode');
      return new QRCode(
        document.getElementById("deposit_qrcode"),
        address
      );

    }
  },

}
