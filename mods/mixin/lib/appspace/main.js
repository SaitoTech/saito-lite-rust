const MixinAppspaceTemplate = require('./main.template.js');
const Deposit = require('./../../../../lib/saito/ui/saito-crypto/overlays/deposit');
const Withdraw = require('./../../../../lib/saito/ui/saito-crypto/overlays/withdraw');
const History = require('./../../../../lib/saito/ui/saito-crypto/overlays/history');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class MixinAppspace {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container || ".saito-main";
  }

  render() {
    document.querySelector(this.container).innerHTML = MixinAppspaceTemplate(this.app, this.mod);
    this.attachEvents();
  }

  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    main_self = this;
    try {
      document.querySelector("#mixin-create-wallet").onclick = (e) => {
        mod.createAccount(function(){
          salert("Enabling Third party cryptos...");
          setTimeout(function(){
            window.location.reload();
          }, 2000);
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
      const withdraw = document.querySelectorAll('.mixin-balances_withdraw');
      withdraw.forEach(function(el) {
      el.addEventListener('click', function (event) {

        let ticker = event.target.getAttribute("data-ticker");
        let asset_id = event.target.getAttribute("data-assetid");
        let balance = event.target.getAttribute("data-balance");
        let sender = event.target.getAttribute("data-sender");

        let withdraw = new Withdraw(app, mod);

        withdraw.ticker = ticker;
        withdraw.amount = amount;
        app.connection.emit('saito-crypto-withdraw-render-request', obj);

      });
    });

    const deposit = document.querySelectorAll('.mixin-balances_deposit');
    deposit.forEach(function(el) {
      el.addEventListener('click', function (event) {
          let address = event.target.getAttribute("data-address").split("|")[0];
          let confs = event.target.getAttribute("data-confs");
          let ticker = event.target.getAttribute("data-ticker");

          let deposit = new Deposit(app, mod);
          deposit.address = address;
          deposit.confs = confs;
          deposit.ticker = ticker;
          app.connection.emit('saito-crypto-deposit-render-request', obj);
      });
    })


    const history = document.querySelectorAll('.mixin-balance-history');
    history.forEach(function(el) {
      el.addEventListener('click', function (event) {
        let ticker = event.target.getAttribute("data-ticker");

        let history = new History(app, mod);
        history.ticker = ticker;
        app.connection.emit('saito-crypto-history-render-request', obj);
      });
    })


    } catch (err) {}

  }
}

module.exports = MixinAppspace;
