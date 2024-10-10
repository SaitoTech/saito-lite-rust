module.exports = (app, self) => {

  let default_bet = Math.min(self.match_stake, self.my_balance);

	return `  
  <div class="game-crypto-transfer-manager-container" id="approve-crypto-request-container">
    
    <h2 class="auth_title">Enable In-Game Crypto</h2>
    <div class="stake-input-container">
        <input autocomplete="off" id="amount_to_stake_input" class="stake" 
          type="number" min="${self.min_stake}" max="${self.my_balance}" step="0.00000001" value="${default_bet}" >
        <div class="crypto_msg">
          <div class="select_min">Min: ${self.min_stake}</div>
          <div class="select_match ${(self.match_stake <= self.my_balance) ? "middle" : ""}">Match: ${self.match_stake}</div>
          <div class="select_max ${(self.match_stake > self.my_balance) ? "middle" : ""}">Max: ${Math.round(1000 * self.my_balance) / 1000}</div>
        </div>
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
