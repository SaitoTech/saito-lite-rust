SaitoInputControls = require("./saito-input-controls.template");

module.exports = SaitoInputSelectionBox = (input_self) => {
	//
	//We are hardcoding knowledge about what the saito-input-selection-box dimensions are
	//to keep it from going off the screen
	//
	let position = {};

	if (input_self.display == "small") {
		let si = document.querySelector(`${input_self.container} .saito-input`);
		let reference = si.getBoundingClientRect();
		position.top = reference.top;
		position.left = reference.left - 1;
	} else {
		let si = document.querySelector(`${input_self.container} .saito-input .selection-box-tabs`);
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
				!input_self.open_tab || input_self.open_tab == "emoji-window" ? "active-tab" : ""
			}" id="emoji-window"></div>
			<div class="selection-box-pane photo-window ${
				input_self.open_tab == "photo-window" ? "active-tab" : ""
			}" id="photo-window">drag and drop an image or click to select one to upload</div>
			<div class="selection-box-pane ${
				input_self.open_tab == "gif-window" ? "active-tab" : ""
			}" id="gif-window"></div>`;

	if (input_self.enable_mentions) {
		let keys = input_self.findKeyOrIdentifier();
		let contacts = `<div class="saito-input-mention-header">Mention a Contact</div>
    					<div class="saito-input-contact-list">`;

		for (let key of keys) {
			contacts += `<div class="saito-input-contact" data-id="${key.publicKey}">
      					<img class="saito-identicon" src="${input_self.app.keychain.returnIdenticon(
									key.publicKey
								)}" data-disable="true">
      					<div class="saito-input-contact-name">${input_self.app.keychain.returnUsername(
									key.publicKey,
									20
								)}</div>
      				</div>`;
		}
		contacts += `</div>`;

		html += `<div class="selection-box-pane at-window ${
			input_self.open_tab == "at-window" ? "active-tab" : ""
		}" id="at-window">${contacts}</div>`;
	}

	html += `</div>`;

	if (input_self.display == "small") {
		html += SaitoInputControls(input_self);
	}

	html += "</div>";
	return html;
};

//<emoji-picker></emoji-picker>
