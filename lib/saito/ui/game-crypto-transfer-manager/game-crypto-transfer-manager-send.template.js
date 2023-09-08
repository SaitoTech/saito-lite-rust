module.exports = GameCryptoTransferManagerSendTemplate = (mod, sobj) => {

  html = `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Authorize Crypto Transfer</h2>

    <div class="amount">${sobj.amount} ${sobj.ticker}</div>

    <div class="transfer-details">
      <div class="send_to">to</div>
      <div class="to_address">${sobj.to}</div>
    </div>

    <div class="button saito-button-primary crypto_transfer_btn" id="crypto_transfer_btn">authorize</div>`;

  //If this is a game over transfer, don't show the checkbox...
  if (mod?.game?.over == 0) {
    html += `<div class="ignore"><input type="checkbox" id="ignore_checkbox" class="ignore_checkbox" /> do not ask again</div>`
  }

  html += "</div>";
  return html;

}

