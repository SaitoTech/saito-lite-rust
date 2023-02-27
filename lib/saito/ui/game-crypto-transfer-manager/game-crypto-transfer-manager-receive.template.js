module.exports = GameCryptoTransferManagerReceive = (app, sobj) => {

  return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Waiting for Transfer</h2>

    <div class="amount">${sobj.amount} ${sobj.ticker}</div>

    <img class="spinner" src="/saito/img/spinner.svg" />
    <div class="amount hidden" id="cryptoManagerFeedback"></div>

    <div class="transfer-details">
      <div class="send_to">from</div>
      <div class="from_address">${sobj.from}</div>
      <div class="send_to">to</div>
      <div class="to_address">${sobj.to}</div>
    </div>

    <div class="button hidden saito-button-primary crypto_transfer_btn" id="crypto_receipt_btn">confirm</div>

    <p></p>

    <div class="ignore"><input type="checkbox" id="ignore_checkbox" class="ignore_checkbox" /> do not ask again</div>

  </div>
  `;

}

