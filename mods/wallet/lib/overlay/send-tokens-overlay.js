const SaitoOverlay = require('./../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SendTokensOverlayTemplate = require('./send-tokens-overlay.template');

module.exports = SendTokensOverlay = {

  render(app, mod) {

    mod.overlay = new SaitoOverlay(app);
    mod.overlay.show(app, mod, SendTokensOverlayTemplate());

  },

  attachEvents(app, mod) {

    let preferred_crypto = app.wallet.wallet.preferred_crypto;
    let ticker = preferred_crypto;
    let cryptomod = null;
    let asset_id = null;

    for (let i = 0; i < app.modules.mods.length; i++) {
      if (app.modules.mods[i].ticker === ticker) {
        cryptomod = app.modules.mods[i];
        asset_id = cryptomod.asset_id;        
      }
    }

    sender =  cryptomod.destination + "|" + cryptomod.mixin.mixin.user_id + "|" + "mixin";

    document.querySelector("#withdraw-fee-accept").onclick = (e) => {
      let hash = app.wallet.sendPayment([sender], [address], [amount], (new Date().getTime()), btoa(sender+address+amount+Date.now()), function() {
                  cryptomod.overlay.hide();
                }, ticker);
      
      salert('Withdrawal successful!');
      setTimeout(function(){
        location.reload();
      }, 2000);
    }

    document.querySelector("#withdraw-fee-reject").onclick = (e) => {
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
      document.getElementById("confirm-fee-text").innerHTML = amount+' ' + ticker + ' to '+ address + '. Continue with withdrawal?';
      document.querySelector("#withdrawl-sent-cont").style.display = 'block';

    }

    document.querySelector("#max-amount-btn").onclick = (e) => {
      let amount_avl = document.querySelector("#amount-avl").getAttribute('data-amount-avl');
      document.querySelector("#withdraw_amount").value = amount_avl;
    }

  },

}

