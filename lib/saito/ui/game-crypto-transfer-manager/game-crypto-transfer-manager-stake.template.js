module.exports = GameCryptoTransferManagerStakeTemplate = (app, sobj) => {

  return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Enable In-Game Crypto</h2>

    <div class="stake">${sobj.stake} ${sobj.ticker}</div>
    <div class="crypto_msg">${sobj.crypto_msg}</div>

    <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_yes">yes, i'm in</div>

    <p></p>

    <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_no">hell, no</div>

    <p></p>

    <div class="commentary">all gaming is peer-to-peer - by using you confirm that such usage is legal in your jurisdiction</div>

  </div>
  `;

}

