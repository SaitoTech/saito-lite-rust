module.exports = (app, self) => {


	return `  
  <div class="game-crypto-transfer-manager-container" id="approve-crypto-request-container">
    
    <h2 class="auth_title">Enable In-Game Crypto</h2>
    <div class="stake-input-container">
        <input autocomplete="off" id="amount_to_stake_input" class="stake" 
          type="number" min="${self.min_stake}" max="9999999999.99999999" step="0.00000001" value="${self.match_stake}" >
        <div class="crypto_msg select_min">Min: ${self.min_stake}</div>
        <div class="crypto_msg select_match">Match: ${self.match_stake}</div>
        <div class="crypto-ticker">${self.ticker}</div>
    </div>
    <div class="stake-input-error" id="stake-amount-error"></div>
    <div class="crypto-stake-confirm-container">
      <input type="checkbox" checked name="crypto-stake-confirm-input" id="approve-crypto-stake-confirm-input">
      <label for="approve-crypto-stake-confirm-input" class="commentary">authorize in-game crypto transfer</label>
    </div>

    <div class="crypto-stake-offer-btn-container">
      <div class="button saito-button-primary crypto_transfer_btn secondary" id="enable_staking_no">no, thanks</div>
      <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_yes">yes, i'm in</div>
    </div>
  </div>
  `;
};
