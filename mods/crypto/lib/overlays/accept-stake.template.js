module.exports = (app, mod, sobj) => {

  let warning_msg = "(0 network fees)";
  let fee = mod.includeFeeInMax(sobj.ticker);
  if (fee){
    warning_msg = `(${fee} ${sobj.ticker})`;
  }

	return `  
  <div class="game-crypto-transfer-manager-container" id="approve-crypto-request-container">
    
    <h2 class="auth_title">Enable In-Game Crypto</h2>
    <div class="wallet-balance">
         <div class="balance-amount">${app.browser.returnBalanceHTML(sobj.stake, true)}</div>
         <div class="deposit-ticker">${sobj.ticker}</div>
    </div>
    <div class="crypto-stake-confirm-container">
      <input type="checkbox" checked name="crypto-stake-confirm-input" id="approve-crypto-stake-confirm-input">
      <label for="approve-crypto-stake-confirm-input" class="commentary">authorize in-game transfer ${warning_msg}</label>
    </div>

    <div class="crypto-stake-offer-btn-container">
      <div class="button saito-button-primary crypto_transfer_btn secondary" id="enable_staking_no">no, thanks</div>
      <div class="button saito-button-primary crypto_transfer_btn" id="enable_staking_yes">yes, i'm in</div>
    </div>
  </div>
  `;
};


/*
    <div class="stake-input-container">
      <div class="stake">${sobj.stake}</div><div class="crypto-ticker">${sobj.ticker}</div>
      <!--div class="crypto_msg">${sobj.game_mod.crypto_msg}</div!-->
    </div>
*/