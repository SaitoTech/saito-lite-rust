module.exports = GameCryptoTransferManagerDepositTemplate = (app, sobj) => {

  return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Deposit Crypto</h2>
    <div class="stake">${sobj.stake} ${sobj.ticker}</div>
    <div class="crypto_msg" style="font-size:2.3rem;line-height:2.6rem;">A fellow player has suggested a peer-to-peer crypto game, but you do not have enough tokens to accept. NOTE: real-time deposits slow gameplay considerably!</div>
    <div class="crypto-stake-offer-btn-container">
      <div class="button saito-button-primary crypto_transfer_btn secondary" id="enable_staking_no">no, thanks</div>
      <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_yes">yes, deposit</div>
    </div>
  </div>
  `;

}

