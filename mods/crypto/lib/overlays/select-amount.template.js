
module.exports = (app, mod) => {

  return `

    <div class="game-crypto-transfer-manager-container">

      <h2 class="auth_title">Amount to Stake?</h2>
      
      <input id="amount_to_stake_input" class="stake amount_to_stake" value="0.0" />
      
      <div class="crypto-stake-confirm-container">
        <input type="checkbox" checked name="crypto-stake-confirm-input" id="crypto-stake-confirm-input">
        <div class="commentary">i confirm peer-to-peer gaming is legal in my jurisdiction</div>
      </div>

      <div class="button saito-button-primary crypto_amount_btn" id="enable_staking_no">confirm</div>

    </div>
 
  `;

  return html;

}

