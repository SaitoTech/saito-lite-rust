module.exports = PotTemplate = (amount = '', game_mod) => {
	if (game_mod.returnTicker() === 'CHIPS') {
		return `
		<div class="pot">
	  	  <div class="potholder">
			<!--div class="line1">pot: </div-->
			<div class="line2">${game_mod.convertChipsToCrypto(amount, true)}</div>
			<div class="line3">${game_mod.returnTicker()}</div>
	 	  </div>
		</div>
		`;
	} else {
		let chip = (amount === 1) ? "CHIP" : "CHIPS";
		return `
			<div class="pot">
		  	  <div class="potholder squeeze">
				<div><span class="line2">${amount}</span> ${chip}</div>
				<div class="line3">${game_mod.convertChipsToCrypto(amount, true)} <span class="smaller-font">${game_mod.returnTicker()}</span></div>
		 	  </div>
			</div>
		`;
	}
};
