module.exports = SaitoInputAddressAutocompleteBox = (obj={}) => {

	let top = 0;
	let left = 0;
	let height = 0;
	if (obj.top) { top = obj.top; }
	if (obj.left) { left = obj.left; }
	if (obj.height) { height = obj.height; }
	
	return `
		<div class="saito-input-selection-box no-mouse" style="height: ${height}px; left: ${left}px; top: ${top}px">
			<div class="saito-input-contact-list"></div>
		</div>
	`;

};


