const MixinAppspaceTemplate = require('./main.template.js');
const MixinDeposit = require('./mixin-deposit');
const MixinWithdraw = require('./mixin-withdraw.js');
const MixinHistory = require('./mixin-history');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class MixinAppspace {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container || ".saito-main";
    this.history_overlay = new SaitoOverlay(app, mod, true, true); 
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

        let mixin_withdraw = new MixinWithdraw(app, mod);

        mixin_withdraw.deposit_ticker = ticker;
        mixin_withdraw.withdraw_balance = balance;
        mixin_withdraw.render();


      });
    });

    const deposit = document.querySelectorAll('.mixin-balances_deposit');
    deposit.forEach(function(el) {
      el.addEventListener('click', function (event) {
          let address = event.target.getAttribute("data-address").split("|")[0];
          let confs = event.target.getAttribute("data-confs");
          let ticker = event.target.getAttribute("data-ticker");

          let mixin_deposit = new MixinDeposit(app, mod);
          mixin_deposit.address = address;
          mixin_deposit.confs = confs;
          mixin_deposit.ticker = ticker;
          mixin_deposit.render();
      });
    })


    const history = document.querySelectorAll('.mixin-balance-history');
    history.forEach(function(el) {
      el.addEventListener('click', function (event) {

        let his_asset_id = event.target.getAttribute("data-assetid");
        let ticker = event.target.getAttribute("data-ticker");
        let his_exists = false;

        let mixin_his = new MixinHistory(app, mod);
        mixin_his.his_asset_id = his_asset_id;
        mixin_his.ticker = ticker;
        mixin_his.his_exists = his_exists;
        mixin_his.render();
      });
    })


    } catch (err) {}

  }
}

module.exports = MixinAppspace;
