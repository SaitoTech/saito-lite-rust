SaitoInputControls = require("./saito-input-controls.template");

module.exports = SaitoInputSelectionBox = (input_self, top, left, withControls = true) => {

	//
	//We are hardcoding knowledge about what the saito-input-selection-box dimensions are
	//to keep it from going off the screen
	//
	let bottom = window.innerHeight - top;

	if (left + 360 > window.innerWidth){
		left = window.innerWidth - 360;
	}

	let keys = input_self.findKeyOrIdentifier();
    let contacts = `<div class="saito-input-mention-header">Mention a Contact</div>
    					<div class="saito-input-contact-list">

    `;
    for (let key of keys){
      contacts += `<div class="saito-input-contact" data-id="${key.publicKey}">
      					<img class="saito-input-contact-identicon" src="${input_self.app.keychain.returnIdenticon(key.publicKey)}">
      					<div class="saito-input-contact-name">${input_self.app.keychain.returnUsername(key.publicKey, 20)}</div>
      				</div>`;
    }
    contacts += `</div>`;

    console.log(input_self.open_tab);

	let html = `
	<div id="saito-input-selection-box" class="saito-input-selection-box" style="bottom:${bottom}px; left:${left}px; max-height:${top}px;">
		<div class="selection-box-window">
			<div class="selection-box-pane ${(!input_self.open_tab || input_self.open_tab == "emoji-window") ? "active-tab" : ""}" id="emoji-window"><emoji-picker></emoji-picker></div>
			<div class="selection-box-pane photo-window ${(input_self.open_tab == "photo-window") ? "active-tab" : ""}" id="photo-window">drag and drop an image or click to select one to upload</div>
			<div class="selection-box-pane ${(input_self.open_tab == "gif-window") ? "active-tab" : ""}" id="gif-window"></div>
			<div class="selection-box-pane at-window ${(input_self.open_tab == "at-window") ? "active-tab" : ""}" id="at-window">${contacts}</div>
		</div>`;

	if (withControls){
		html += SaitoInputControls();
	}

	html += "</div>";
	return html;
}