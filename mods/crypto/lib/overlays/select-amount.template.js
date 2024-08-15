module.exports = (app, mod, form) => {

	let html = `

    <div class="game-crypto-transfer-manager-container" id="stake-crypto-request-container">

      <h2 class="auth_title">Amount to Stake?</h2>
      
      <div class="stake-input-container">
        <input autocomplete="off" id="amount_to_stake_input" class="stake" 
        type="number" min="0" max="9999999999.99999999" step="0.00000001" value="${form?.stake || '0.0'}" >`;

      if (form.fixed){
        html += `<div class="crypto_msg select_max">Max: ${mod.max_balance}</div>
                 <div class="crypto-ticker">${form.ticker}</div>`;
      } else {
        html +=  `
                 <div class="token-dropdown"><select class="withdraw-select-crypto" id="stake-select-crypto">`;
        for (let ticker in mod.balances){
          html += `<option value="${ticker}" ${form.ticker ? "" : "selected"}>${ticker}</option>`;
          if (!form?.ticker){
            form.ticker = ticker;
            mod.max_balance = parseFloat(mod.balances[ticker].balance);
          }
        }
        html +=  `</select>
          <div class="crypto_msg select_max">Max: ${mod.max_balance}</div>
        </div>`;
      }

  html +=  `</div>
      <div class="stake-input-error" id="stake-amount-error"></div>

      <div class="crypto-stake-confirm-container">
        <input type="checkbox" checked name="crypto-stake-confirm-input" id="crypto-stake-confirm-input">
        <label for="crypto-stake-confirm-input" class="commentary">authorize in-game crypto transfer</label>
      </div>
      <div class="stake-input-error" id="stake-checkbox-error"></div>

      <div class="button saito-button-primary crypto_amount_btn" id="enable_staking_no">confirm</div>

    </div>
 
  `;

	return html;
};
