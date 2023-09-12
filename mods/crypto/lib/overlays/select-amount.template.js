
module.exports = (app, mod) => {

  return `

    <div class="game-crypto-transfer-manager-container">

      <h2 class="auth_title">Amount to Stake?</h2>
      
      <div class="stake-input-container">
        <input autocomplete="off" id="amount_to_stake_input" class="stake" value="0.0" />
        <div class="crypto_msg">Max: ${mod.max_balance}</div>
        <div class="crypto-ticker">${mod.ticker}</div>
      </div>

      <div class="crypto-stake-confirm-container">
        <input type="checkbox" name="crypto-stake-confirm-input" id="crypto-stake-confirm-input">
        <div class="commentary">peer-to-peer gaming is legal in my jurisdiction</div>
      </div>

      <div class="button saito-button-primary crypto_amount_btn" id="enable_staking_no">confirm</div>

    </div>
 
  `;

  return html;

}

