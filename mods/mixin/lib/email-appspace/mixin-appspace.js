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
          let indicator = (type == 'Deposit') ? '+' : '';

          html = "<div class='item'>"+ created_at +"</div>" +
          "<div class='item'>"+ type +"</div>" +
          "<div class='item'>"+ ticker +"</div>" +
          "<div class='item "+ type.toLowerCase() +"'>"+ indicator + " " + amount +"</div>" +
          "<div class='item'>Success</div>"; /* right now we dont get `status` in /snapshot api, all trans are `success`*/
          
          document.getElementById('activity_button').setAttribute("class", "hide-btn");
          document.querySelector(".history_container").innerHTML += html;
          }
        });

        document.getElementById('activity_button').innerHTML = 'load account history';
      }
    } catch (err) {}

    document.querySelector(".balances_withdraw").onclick = (e) => {

      let overlay = new SaitoOverlay(app);
      let ticker = event.target.getAttribute("data-ticker");
      let asset_id = event.target.getAttribute("data-assetid");
      let balance = event.target.getAttribute("data-balance");
      let sender = event.target.getAttribute("data-sender");

      overlay.show(app, mod, MixinWithdrawTemplate(app, ticker, balance), function() {});

      document.querySelector("#withdraw-reject").onclick = (e) => {
          document.querySelector("#withdrawl-confirm-cont").style.display = 'none';
          document.querySelector("#withdrawl-form-cont").style.display = 'block';
      }

      document.querySelector("#withdraw-accept").onclick = (e) => {
          document.querySelector("#withdrawl-confirm-cont").style.display = 'none';
          document.querySelector("#withdrawl-form-cont").style.display = 'none';  
           
          mod.checkWithdrawalFee(asset_id, function(fee) {
            document.getElementById("confirm-fee-text").innerHTML = 'Withdrawal fee is '+fee+'. Continue with withdrawal?';
            document.querySelector("#withdrawl-sent-cont").style.display = 'block';
          });

      }

      document.querySelector("#withdraw-fee-accept").onclick = (e) => {
          let hash = app.wallet.sendPayment([sender], [address], [amount], (new Date().getTime()), btoa(sender+address+amount), function() {
                      mod.overlay.hide();
                    }, ticker);
                    overlay.hide();
      }

      document.querySelector("#withdraw-fee-reject").onclick = (e) => {
          document.querySelector("#withdrawl-confirm-cont").style.display = 'none';
          document.querySelector("#withdrawl-sent-cont").style.display = 'none';
          document.querySelector("#withdrawl-form-cont").style.display = 'block';
      }

      document.querySelector("#withdrawal-form").onsubmit = (e) => {
        e.preventDefault();
        document.querySelector(".error-msg").style.display = "none";
      	amount = document.querySelector(".withdraw_amount").value;
      	address = document.querySelector(".withdraw_address").value;
        amount_avl = document.querySelector("#amount-avl").getAttribute('data-amount-avl');

        if (amount > amount_avl) {
          document.querySelector(".max-amount-error").style.display = "block";
          return false;          
        }

        if (amount < 0) {
          document.querySelector(".max-amount-error").innerHTML = "Amount should be greater than 0";
          document.querySelector(".max-amount-error").style.display = "block";
          return false;          
        }


        document.querySelector(".decision-cont").style.display = 'none';
        document.querySelector("#withdrawl-sent-cont").style.display = 'none';
        document.getElementById("check-fee-text").innerHTML = 'Check fee for withdrawing <b>'+amount+'</b> to <b>'+address+'</b>?';
        document.querySelector("#withdrawl-confirm-cont").style.display = 'block';

      }

      document.querySelector("#max-amount-btn").onclick = (e) => {
        let amount_avl = document.querySelector("#amount-avl").getAttribute('data-amount-avl');
        document.querySelector("#withdraw_amount").value = amount_avl;
      }

    }

    document.querySelector(".balances_deposit").onclick = (e) => {

      let overlay = new SaitoOverlay(app);
      let address = event.target.getAttribute("data-address").split("|")[0];
      let confs = event.target.getAttribute("data-confs");
      let ticker = event.target.getAttribute("data-ticker");

      overlay.show(app, mod, MixinDepositTemplate(app, address, confs, ticker), function() {
      });

      document.querySelector("#copy-deposit-add").onclick = (e) => {
        let public_key = document.querySelector(".public-address").value;
        
        navigator.clipboard.writeText(public_key);
        document.querySelector("#copy-deposit-add").classList.add("copy-check");

        setTimeout(() => {
          document.querySelector("#copy-deposit-add").classList.remove("copy-check");            
        }, 400);
      };

      const QRCode = require('../../../../lib/helpers/qrcode');
      return new QRCode(
        document.getElementById("qrcode"),
        address
      );

    }




  },

}
