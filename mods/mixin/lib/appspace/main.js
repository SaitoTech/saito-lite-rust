const MixinAppspaceTemplate = require('./main.template.js');
const MixinDepositTemplate = require('./mixin-deposit.template.js');
const MixinWithdrawTemplate = require('./mixin-withdraw.template.js');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class MixinAppspace {

  constructor(app) {
  }

  render(app, mod) {
    document.querySelector(".appspace").innerHTML = MixinAppspaceTemplate(app, mod);
  
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    try {
      document.querySelector("#mixin-create-wallet").onclick = (e) => {
        mod.createAccount(function(){
          salert("Third party cryptos enabled. Reload the page.");
        });
      }
    } catch (err) {
      console.log("Err in Mixin create wallet " + err);
    }

    try {
      document.querySelector("#mixin-backup-btn").onclick = (e) => {
        app.wallet.backupWallet();
      }
    } catch (err) {
      console.log("Err in Mixin backup wallet");
    }

    try {
      document.querySelector(".create_account").onclick = (e) => {
        mod.createAccount((res) => { 
  	  document.getElementById("create_account").innerHTML = JSON.stringify(res.data);;
        });
      }
    } catch (err) {}

    try {
      document.querySelector("#mixin-history-button").onclick = (e) => {

        document.getElementById('mixin-history-button').innerHTML = 'fetching history...';
        
        mod.fetchSnapshots("", 20, "DESC", (d) => { 
          let html = "";
          if (d.data.length > 0) {
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

            html = "<div class='mixin-item mixin-his-created-at'>"+ created_at +"</div>" +
            "<div class='mixin-item'>"+ type +"</div>" +
            "<div class='mixin-item'>"+ ticker +"</div>" +
            "<div class='mixin-item "+ type.toLowerCase() +"'>"+ indicator + " " + amount +"</div>" +
            "<div class='mixin-item'>Success</div>"; /* right now we dont get `status` in /snapshot api, all trans are `success`*/
            
            document.getElementById('mixin-history-button').setAttribute("class", "hide-btn");
            document.querySelector("#mixin-txn-his-container").innerHTML += html;
            document.querySelector("#mixin-txn-his-container").style.display = 'flex';
            }
          } else {
            document.querySelector("#mixin-txn-his-container").innerHTML += '<p class="mixin-no-history">No account history found.</p>';
            document.querySelector("#mixin-txn-his-container").style.display = 'flex';
            document.getElementById('mixin-history-button').setAttribute("class", "hide-btn");            
          }
        });

        document.getElementById('mixin-history-button').innerHTML = 'Fetching history...';
      }
    } catch (err) {}

    try {
      document.querySelector(".mixin-balances_withdraw").onclick = (e) => {

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
            let hash = app.wallet.sendPayment([sender], [address], [amount], (new Date().getTime()), btoa(sender+address+amount+Date.now()), function() {
                        mod.overlay.hide();
                      }, ticker);
                      overlay.hide();
            
            document.querySelector("#email-appspace-withdraw-overlay").innerHTML = 'Withdrawal Successful!';
            setTimeout(function(){
              location.reload();
            }, 1500);
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
            document.querySelector(".max-amount-error").innerHTML = "Error: Not enough amount avaibale ("+amount_avl+" available)";
            document.querySelector(".max-amount-error").style.display = "block";
            return false;          
          }

          if (amount <= 0) {
            document.querySelector(".max-amount-error").innerHTML = "Error: Amount should be greater than 0";
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

      document.querySelector(".mixin-balances_deposit").onclick = (e) => {

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


    } catch (err) {}

  }
}

module.exports = MixinAppspace;
