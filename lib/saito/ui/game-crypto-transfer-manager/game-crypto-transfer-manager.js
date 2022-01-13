const GameCryptoTransferManagerTemplate = require('./game-crypto-transfer-manager.template');
const GameCryptoTransferManagerSendTemplate = require('./game-crypto-transfer-manager-send.template');
const GameCryptoTransferManagerReceiveTemplate = require('./game-crypto-transfer-manager-receive.template');
const GameCryptoTransferManagerBalanceTemplate = require('./game-crypto-transfer-manager-balance.template');
const GameOverlay = require('./../game-overlay/game-overlay');


class GameCryptoTransferManager {

    constructor(app) {
      this.app = app;
      this.game_crypto_transfer_manager_overlay = new GameOverlay(app);
    }


    render(app, mod) {
    }

    attachEvents(app, mod, mycallback=null) {
    }


    balance(app, mod, address, ticker, mycallback=null) {

      let sobj = {};
          sobj.address = address;
          sobj.ticker = ticker;

      this.game_crypto_transfer_manager_overlay.showOverlay(app, mod, GameCryptoTransferManagerBalanceTemplate(app, sobj));
      this.game_crypto_transfer_manager_overlay.blockClose();

    }


    send(app, mod, sender, receiver, amount, ts, ticker, mycallback=null) {

      let sobj = {};
          sobj.amount = amount;
          sobj.from = sender;
          sobj.to = receiver;
          sobj.ticker = ticker;

      this.game_crypto_transfer_manager_overlay.showOverlay(app, mod, GameCryptoTransferManagerSendTemplate(app, sobj));
      this.game_crypto_transfer_manager_overlay.blockClose();
      document.querySelector(".crypto_transfer_btn").onclick = (e) => {
	       this.game_crypto_transfer_manager_overlay.hide(mycallback);
      };

    }



    receive(app, mod, sender, receiver, amount, ts, ticker, mycallback=null) {

      let sobj = {};
          sobj.amount = amount;
          sobj.from = sender;
          sobj.to = receiver;
          sobj.ticker = ticker;

      this.game_crypto_transfer_manager_overlay.showOverlay(app, mod, GameCryptoTransferManagerReceiveTemplate(app, sobj));
      this.game_crypto_transfer_manager_overlay.blockClose();

      if (mycallback != null) { mycallback(); }

    }

    hideOverlay() {
      this.game_crypto_transfer_manager_overlay.hide();
    }

}

module.exports = GameCryptoTransferManager;

