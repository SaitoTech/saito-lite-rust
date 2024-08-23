module.exports = (app, mod, form) => {
  console.log("Select amount", form?.ticker);
	let html = `

    <div class="game-crypto-transfer-manager-container" id="stake-crypto-request-container">

      <h2 class="auth_title">Amount to Stake?</h2>
      
      <div class="stake-input-container">
        <input autocomplete="off" id="amount_to_stake_input" class="stake" 
        type="number" min="0" max="9999999999.99999999" step="0.00000001" value="${form?.stake || '0.0'}" >`;

      if (form.fixed){
        html += `<div class="crypto-ticker">${form.ticker}</div>`;
      } else {
        html +=  `
                 <div class="token-dropdown"><select class="withdraw-select-crypto" id="stake-select-crypto">`;
        for (let ticker in mod.balances){
          if (!form?.ticker){
            console.log("Set initial ticker");
            form.ticker = ticker;
            mod.max_balance = parseFloat(mod.balances[ticker].balance);
          }
          html += `<option value="${ticker}" ${form.ticker == ticker ? "selected" : ""}>${ticker}</option>`;
        }
        html +=  `</select>
          </div>`;
      }

  html +=  `<div class="crypto_msg"><div></div><div class="select_max">Max: ${mod.max_balance}</div></div></div>`;

  if (mod.min_balance >= 0){

    html += `
        <div class="crypto-stake-confirm-container">
          <input type="checkbox" name="crypto-stake-odds" id="crypto-stake-odds">
          <label for="crypto-stake-odds" class="commentary">allow lower stake for opponent (give odds)</label>
        </div>

        <div id="opponent-minimum-stake" class="stake-input-container hidden">
          <input autocomplete="off" id="minimum_accepted_stake" class="stake" 
          type="number" min="0" max="${mod.max_balance}" step="0.00000001" value="0" >
          <div class="crypto-ticker">${form.ticker}</div>
        </div>`;
  }

  html +=  `<div class="stake-input-error" id="stake-amount-error"></div>

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
