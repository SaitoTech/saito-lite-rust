module.exports  = (app, sobj) => {
	return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Deposit Crypto</h2>
    <div class="stake-input-container">
      <div class="stake">${sobj.stake} ${sobj.ticker}</div>
      <div class="crypto_msg">NOTE: real-time deposits can slow gameplay considerably!</div>
    </div>
    <div class="crypto-stake-offer-btn-container">
      <div class="button saito-button-primary crypto_transfer_btn secondary" id="enable_staking_no">no, thanks</div>
      <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_yes">yes, deposit</div>
    </div>
  </div>
  `;
};
