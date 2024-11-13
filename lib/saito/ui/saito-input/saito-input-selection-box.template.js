const SaitoInputControls = require('./saito-input-controls.template');
const SaitoInputContacts = require('./saito-input-contacts.template');

module.exports  = (input_self) => {
	//
	//We are hardcoding knowledge about what the saito-input-selection-box dimensions are
	//to keep it from going off the screen
	//
	let position = {};

	if (input_self.display == 'small' || input_self.display == 'medium') {
		let si = document.querySelector(`${input_self.container} .saito-input`);
		let reference = si.getBoundingClientRect();

		position.top = reference.top;
		position.left = reference.right - 359;

		if (input_self.display == 'small') {
			position.left += 35;
		}
	} else {
		let si = document.querySelector(
			`${input_self.container} .saito-input .selection-box-tabs`
		);
		let reference = si.getBoundingClientRect();
		position.top = reference.top;
		position.left = reference.right;
	}

	let top = position.top;
	let bottom = window.innerHeight - top;
	let left = position.left;

	if (left + 360 > window.innerWidth) {
		left = window.innerWidth - 360;
	}

	let html = `
	<div id="saito-input-selection-box" class="saito-input-selection-box" style="bottom:${bottom}px; left:${left}px; max-height:${top}px;">
		<div class="selection-box-window">
			<div class="selection-box-pane ${
	!input_self.open_tab || input_self.open_tab == 'emoji-window'
		? 'active-tab'
		: ''
}" id="emoji-window"></div>
			<div class="selection-box-pane photo-window ${
	input_self.open_tab == 'photo-window' ? 'active-tab' : ''
}" id="photo-window">drag and drop an image or click to select one to upload</div>
			<div class="selection-box-pane ${
	input_self.open_tab == 'gif-window' ? 'active-tab' : ''
}" id="gif-window"></div></div>`;

	if (input_self.display !== 'large') {
		html += SaitoInputControls(input_self);
	}

	html += '</div>';
	return html;
};

//<emoji-picker></emoji-picker>
