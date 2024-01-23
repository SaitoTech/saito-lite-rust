module.exports = GameCryptoTransferManagerBalanceTemplate = (app, sobj) => {
	return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Checking ${sobj.ticker} Balance</h2>

    <div class="to_address">${sobj.address}</div>

    <div id="crypto_balance" class="balance hidden"></div>

    <img style="margin-top: 20px" class="spinner" src="/saito/img/spinner.svg" />

    <div class="button saito-button-primary crypto_transfer_btn hidden" id="crypto_balance_btn">Confirm</div>

  </div>
  `;
};
