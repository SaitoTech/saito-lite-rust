module.exports = PotTemplate = (amount = "") => {
	return `
	<div class="pot">
  	  <div class="potholder">
		<div class="line1">pot: </div>
		<div class="line2">${amount}</div>
 	  </div>
	</div>
	`;
};
