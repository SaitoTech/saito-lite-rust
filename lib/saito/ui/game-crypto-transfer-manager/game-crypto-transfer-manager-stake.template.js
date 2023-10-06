module.exports = GameCryptoTransferManagerStakeTemplate = (app, sobj) => {

  return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Enable In-Game Crypto</h2>
    <div class="stake-input-container">
      <div class="stake">${sobj.stake} ${sobj.ticker}</div>
      <div class="crypto_msg">${sobj.crypto_msg}</div>
    </div>
    <div class="crypto-stake-confirm-container">
      <input type="checkbox" name="crypto-stake-confirm-input" id="crypto-stake-confirm-input">
      <div class="commentary">peer-to-peer gaming is legal in my jurisdiction</div>
    </div>

    <div class="crypto-stake-offer-btn-container">
      <div class="button saito-button-primary crypto_transfer_btn secondary" id="enable_staking_no">no, thanks</div>
      <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_yes">yes, i'm in</div>
    </div>
  </div>
  `;

}

