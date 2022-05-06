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
        document.getElementById('activity_button').innerHTML = 'fetching history...';
        
        mod.fetchSnapshots("", 20, "DESC", (d) => { 
          let html = "";
          for (let i = 0; i < d.data.length; i++) {

          let ticker = '';
          for (let j=0; j<mod.mods.length; j++) {
            if (mod.mods[j].asset_id == d.data[i].asset_id) {
              ticker = mod.mods[j].ticker;
              break;
            }
          }

          let trans = d.data[i];
          let created_at = trans.created_at.slice(0, 19).replace('T', ' ');
          let type = (trans.closing_balance > trans.opening_balance) ? 'Deposit' : 'Withdrawal';
          let amount = trans.amount;
          let indicator = (type == 'Deposit') ? '+' : '-';

          html = "<div class='item'>"+ created_at +"</div>" +
          "<div class='item'>"+ type +"</div>" +
          "<div class='item'>"+ ticker +"</div>" +
          "<div class='item "+ type.toLowerCase() +"'>"+ indicator + " " + amount +"</div>" +
          "<div class='item'>Success</div>"; /* right now we dont get `status` in /snapshot api, all trans are `success`*/
          
          document.getElementById('activity_button').setAttribute("class", "hide-btn");
          document.querySelector(".history_container").innerHTML += html;
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
