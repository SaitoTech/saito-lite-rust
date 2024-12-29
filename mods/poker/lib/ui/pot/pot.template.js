module.exports = PotTemplate = (amount = "", units = "CHIPS") => {
	return `
	<div class="pot">
  	  <div class="potholder">
		<!--div class="line1">pot: </div-->
		<div class="line2">${amount}</div>
		<div class="line3">${units}</div>
 	  </div>
	</div>
	`;
};
