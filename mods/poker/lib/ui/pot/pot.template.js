module.exports = PotTemplate = (comp) => {
	return `
		<div class="pot">
	  	  <div class="potholder${comp.ticker === 'CHIPS'?"": " squeeze"}">
			<div class="line2"></div>
			<div class="line3"></div>
	 	  </div>
		</div>
		`;
};
