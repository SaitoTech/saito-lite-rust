//const GameCryptoTransferManagerTemplate = require('./game-crypto-transfer-manager.template'); //Not Used
const GameCryptoTransferManagerSendTemplate = require('./game-crypto-transfer-manager-send.template');
const GameCryptoTransferManagerReceiveTemplate = require('./game-crypto-transfer-manager-receive.template');
const GameCryptoTransferManagerBalanceTemplate = require('./game-crypto-transfer-manager-balance.template');
const GameOverlay = require('./../game-overlay/game-overlay');

/**
 * A tool, integrated in GameTemplate, to facilitate the transfer of cryptos 
 * by populating an overlay with basic forms and getting confirmation from the user
 * 
 * 
 */ 
class GameCryptoTransferManager {

/**
 * @constructor
 * @param app - the Saito Application
 */ 
    constructor(app) {
      this.app = app;
      this.overlay = new GameOverlay(app);
    }

/**
 * Not used
 */ 
    render(app, mod) {
    }

/**
 * Not used
 */ 
    attachEvents(app, mod, mycallback=null) {
    }

/**
 * Display an overlay with the given public key address and ticker (currency)
 * @param app - the Saito application
 * @param mod - the containing module
 * @param address - a public key address
 * @param ticker {string} - name of a currency
 * @mycallback - an optional callback function that never gets called
 */ 
    async returnBalance(app, mod, address, ticker, mycallback=null) {

      try{
        let sobj = {};
            sobj.address = address;
            sobj.ticker = ticker;

        this.overlay.closebox = false; 
        this.overlay.show(app, mod, GameCryptoTransferManagerBalanceTemplate(app, sobj));
        this.overlay.blockClose();
        let cryptoMod = app.wallet.returnCryptoModuleByTicker(ticker);
        let current_balance = await cryptoMod.returnBalance();

        let spinner = document.querySelector(".spinner");
        if (spinner) {spinner.remove();}

        let balanceDiv = document.querySelector("#crypto_balance");
        let confirmBtn = document.querySelector("#crypto_balance_btn");

        if (balanceDiv){
          balanceDiv.textContent = (current_balance) ? sanitize(current_balance) : "Crypto unavailable";
          balanceDiv.classList.remove("hidden");  
        }
        
        if (confirmBtn){
          confirmBtn.classList.remove("hidden");
          confirmBtn.onclick = (e) =>{
            this.hideOverlay(mycallback);
          };         
        }else{
          this.hideOverlay(mycallback);  
        }
        return current_balance;
      }catch(err){
        console.log(err);
      }
      
    }


/**
 * Display an overlay to confirm a crypto transfer
 * @param app - the Saito application
 * @param mod - the containing module
 * @param sender - a public key address of sender
 * @param receiver - public key address of receiver
 * @param amount - the amount of crypto
 * @param ts (unused)
 * @param ticker {string} - name of a currency
 * @mycallback - an optional callback function to run on confirmation
 */ 
    sendPayment(app, mod, sender, receiver, amount, ts, ticker, mycallback=null) {

      try{
        let sobj = {};
          sobj.amount = amount;
          sobj.from = sender;
          sobj.to = receiver;
          sobj.ticker = ticker;

        this.overlay.closebox = false; 
        this.overlay.show(app, mod, GameCryptoTransferManagerSendTemplate(app, sobj));
        this.overlay.blockClose();
        document.querySelector(".crypto_transfer_btn").onclick = (e) => {
           this.overlay.hide(mycallback);
        };  
      }catch(err){
        console.log(err);
      }
      

    }


/**
 * Display an overlay to confirm a crypto transfer
 * @param app - the Saito application
 * @param mod - the containing module
 * @param sender - a public key address of sender
 * @param receiver - public key address of receiver
 * @param amount - the amount of crypto
 * @param ts (unused)
 * @param ticker {string} - name of a currency
 * @mycallback - an optional callback function to run on confirmation
 */ 
    async receivePayment(app, mod, sender, receiver, amount, ts, ticker, mycallback=null) {

      try{
        let sobj = {};
        sobj.amount = amount;
        sobj.from = sender;
        sobj.to = receiver;
        sobj.ticker = ticker;

        this.overlay.closebox = true;  //include a way to close in case the receive funds hangs
        this.overlay.show(app, mod, GameCryptoTransferManagerReceiveTemplate(app, sobj));
        this.overlay.blockClose();

        if (mycallback != null) { mycallback(document.querySelector("#cryptoManagerFeedback")); }

        let confirmBtn = document.querySelector("#crypto_receipt_btn");
        
        if (confirmBtn){
          confirmBtn.onclick = (e) =>{
            this.hideOverlay();
          };         
        }  
      }catch(err){
        console.log(err);
      }
      

    }

    /**
     *  Programmatically close the overlay
     */
    hideOverlay() {
      this.overlay.hide();
    }

}

module.exports = GameCryptoTransferManager;

