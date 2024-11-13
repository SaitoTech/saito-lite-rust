module.exports  = (app, sobj) => {
	return `  
  <div class="game-crypto-transfer-manager-container">
    
    <h2 class="auth_title">Inadequate ${sobj.ticker}</h2>

    <div class="description">
Some players do not have any ${sobj.ticker}.

<p></p>

Once all players have ${sobj.ticker} available in their wallets you can use this method to propose a crypto-game.
    </div>

    <div class="button saito-button-primary crypto_transfer_btn primary" id="exit_staking">understand</div>

  </div>
  `;
};
