const MixinWithdrawTemplate = require("./mixin-withdraw.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class MixinWithdraw {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(this.app, this.mod);
    this.deposit_ticker = null;
    this.withdraw_balance = null;

    this.app.connection.on("mixin-withdraw-overlay-render-request", (obj) => {
      this.deposit_ticker = obj.deposit_ticker;
      this.withdraw_balance = obj.withdraw_balance;
      this.render();
    });
  }

  render() {
    this.overlay.show(MixinWithdrawTemplate(this.app, this.mod, this));
    this.attachEvents();
  }  

  attachEvents() {    

        if (document.querySelector("#withdraw-reject") != null) {
          document.querySelector("#withdraw-reject").onclick = (e) => {
              document.querySelector("#withdrawl-confirm-cont").style.display = 'none';
              document.querySelector("#withdrawl-form-cont").style.display = 'block';
          }
        }

        if (document.querySelector("#withdraw-accept") != null) {
          document.querySelector("#withdraw-accept").onclick = (e) => {
              document.querySelector("#withdrawl-confirm-cont").style.display = 'none';
              document.querySelector("#withdrawl-form-cont").style.display = 'none';  
               
              mod.checkWithdrawalFee(asset_id, function(fee) {
                document.getElementById("confirm-fee-text").innerHTML = 'Withdrawal fee is '+fee+'. Continue with withdrawal?';
                document.querySelector("#withdrawl-sent-cont").style.display = 'block';
              });

          }
        }

        if (document.querySelector("#withdraw-fee-accept") != null) {
          document.querySelector("#withdraw-fee-accept").onclick = (e) => {
              let hash = app.wallet.sendPayment([sender], [address], [amount], (new Date().getTime()), btoa(sender+address+amount+Date.now()), function() {
                          mod.overlay.hide();
                        }, ticker);
                        overlay.hide();
              
              document.querySelector("#saito-withdraw-overlay").innerHTML = 'Withdrawal Successful!';
              setTimeout(function(){
                location.reload();
              }, 1500);
          }
        }

        if (document.querySelector("#withdraw-fee-reject") != null) {
          document.querySelector("#withdraw-fee-reject").onclick = (e) => {
              document.querySelector("#withdrawl-confirm-cont").style.display = 'none';
              document.querySelector("#withdrawl-sent-cont").style.display = 'none';
              document.querySelector("#withdrawl-form-cont").style.display = 'block';
          }
        }


        if (document.querySelector("#withdrawal-form") != null) {
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
        }

        if (document.querySelector("#max-amount-btn") != null) {
          document.querySelector("#max-amount-btn").onclick = (e) => {
            let amount_avl = document.querySelector("#amount-avl").getAttribute('data-amount-avl');
            document.querySelector("#withdraw_amount").value = amount_avl;
          }
        }

  }

}

module.exports = MixinWithdraw;

