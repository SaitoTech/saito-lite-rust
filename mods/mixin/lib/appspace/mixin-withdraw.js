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
    
    this.loadCryptos();

    this.attachEvents();
  }  


  loadCryptos() {
    let available_cryptos = this.app.wallet.returnInstalledCryptos();
    let preferred_crypto = this.app.wallet.returnPreferredCrypto();
    let add = preferred_crypto.returnAddress();
    let fee = 0;
    let balance = 0;

    console.log("withdraw //////////");
    console.log(available_cryptos);
    console.log(preferred_crypto);
    console.log(add);


    // add crytpo dropdowns
    document.querySelector("#withdraw-select-crypto").innerHTML = ""; 
    let html = '';
    for (let i = 0; i < available_cryptos.length; i++) {
      let crypto_mod = available_cryptos[i];
      html = `<option ${(crypto_mod.name == preferred_crypto.name) ? 'selected' : ``} 
      id="crypto-option-${crypto_mod.name}" value="${crypto_mod.ticker}">${crypto_mod.ticker}</option>`;

      this.app.browser.addElementToElement(html, document.querySelector("#withdraw-select-crypto"));
    }


    // calculate fee & balance
    if (preferred_crypto.ticker == "SAITO") {
      fee = this.app.wallet.wallet.default_fee;
      balance = this.app.wallet.wallet.balance;
    } else {
      mod.checkWithdrawalFee(asset_id, function(fee) {
        document.getElementById("confirm-fee-text").innerHTML = 'Withdrawal fee is '+fee+'. Continue with withdrawal?';
        document.querySelector("#withdrawl-sent-cont").style.display = 'block';
      });
      
      balance = preferred_crypto.balance;
    }

    // show fee & balance
    document.querySelector(".withdraw-info-value.fee").innerHTML = fee + ` ${preferred_crypto.ticker}`;
    document.querySelector(".withdraw-info-value.balance").innerHTML = balance + ` ${preferred_crypto.ticker}`;
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
          // document.querySelector("#withdrawal-form").onsubmit = (e) => {
          //   e.preventDefault();
          //   document.querySelector(".error-msg").style.display = "none";
          //   amount = document.querySelector(".withdraw_amount").value;
          //   address = document.querySelector(".withdraw_address").value;
          //   amount_avl = document.querySelector("#amount-avl").getAttribute('data-amount-avl');

          //   if (amount > amount_avl) {
          //     document.querySelector(".max-amount-error").innerHTML = "Error: Not enough amount avaibale ("+amount_avl+" available)";
          //     document.querySelector(".max-amount-error").style.display = "block";
          //     return false;          
          //   }

          //   if (amount <= 0) {
          //     document.querySelector(".max-amount-error").innerHTML = "Error: Amount should be greater than 0";
          //     document.querySelector(".max-amount-error").style.display = "block";
          //     return false;          
          //   }


          //   document.querySelector(".decision-cont").style.display = 'none';
          //   document.querySelector("#withdrawl-sent-cont").style.display = 'none';
          //   document.getElementById("check-fee-text").innerHTML = 'Check fee for withdrawing <b>'+amount+'</b> to <b>'+address+'</b>?';
          //   document.querySelector("#withdrawl-confirm-cont").style.display = 'block';

          // }


          document.querySelector("#withdrawal-form").onsubmit = (e) => {
            e.preventDefault();
            document.querySelector("#withdraw-step-one").classList.toggle("hide-element");
            document.querySelector("#withdraw-step-two").classList.toggle("hide-element");
          }

          document.querySelector("#withdraw-cancel").onclick = (e) => {
            e.preventDefault();
            document.querySelector("#withdraw-step-one").classList.toggle("hide-element");
            document.querySelector("#withdraw-step-two").classList.toggle("hide-element");
          }
        

          document.querySelector("#withdraw-confirm").onclick = (e) => {
            e.preventDefault();

            try {
              document.querySelector(".withdraw-msg-icon").classList.toggle("fa-circle-exclamation");
              document.querySelector(".withdraw-msg-icon").classList.toggle("fa-circle-notch");
              document.querySelector(".confirm-submit").style.opacity = 0;
              document.querySelector(".withdraw-msg-text").innerText = "Sending";
              document.querySelector(".withdraw-msg-question").innerText = "...";

              setTimeout(function() {
                document.querySelector(".confirm-msg").innerHTML = `Transfer request successful <br > Please check transaction history for confirmation`;
                document.querySelector(".withdraw-msg-icon").classList.toggle("fa-circle-notch");
                document.querySelector(".withdraw-msg-icon").classList.toggle("fa-circle-check");
              }, 3000);
            } catch(err) {
              document.querySelector(".confirm-msg").innerHTML = `Transfer request unsuccessful <br > Please try again`;
              document.querySelector(".withdraw-msg-icon").classList.remove("fa-circle-notch");
              document.querySelector(".withdraw-msg-icon").classList.remove("fa-circle-check");
              document.querySelector(".withdraw-msg-icon").classList.toggle("fa-circle-xmark");
            }
          }

        }


        if (document.querySelector("#withdraw-max-btn") != null) {
          document.querySelector("#withdraw-max-btn").onclick = (e) => {
            let amount_avl = document.querySelector("#withdraw-input-amount").getAttribute('data-amount-avl');
            document.querySelector("#withdraw-input-amount").value = amount_avl;
          }
        }

  }

}

module.exports = MixinWithdraw;

