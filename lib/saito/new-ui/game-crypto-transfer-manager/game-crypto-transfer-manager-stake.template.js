module.exports = GameCryptoTransferManagerSendTemplate = (app, sobj) => {

  return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Enable In-Game Crypto</h2>

    <div class="stake">${sobj.stake} ${sobj.ticker}</div>

    <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_yes">yes, i'm in</div>

    <p></p>

    <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_no">hell, no</div>

    <p></p>

    <div class="commentary">please note: all gaming is peer-to-peer - by using any you confirm you are in a jurisdiction where such activities are legal</div>

  </div>
  `;

}

