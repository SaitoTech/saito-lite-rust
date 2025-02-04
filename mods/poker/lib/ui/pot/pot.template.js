module.exports = PotTemplate = (amount = "", game_mod) => {
	return `
	<div class="pot">
  	  <div class="potholder">
		<!--div class="line1">pot: </div-->
		<div class="line2">${game_mod.convertChipsToCrypto(amount, true)}</div>
		<div class="line3">${game_mod.returnTicker()}</div>
 	  </div>
	</div>
	`;
};
