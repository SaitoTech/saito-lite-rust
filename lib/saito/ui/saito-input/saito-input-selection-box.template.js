SaitoInputControls = require("./saito-input-controls.template");

module.exports = SaitoInputSelectionBox = (top, left, withControls = true) => {

	//
	//We are hardcoding knowledge about what the saito-input-selection-box dimensions are
	//to keep it from going off the screen
	//
	let bottom = window.innerHeight - top;

	if (left + 360 > window.innerWidth){
		left = window.innerWidth - 360;
	}

	let html = `
	<div class="saito-input-selection-box" style="bottom:${bottom}px; left:${left}px; max-height:${top}px;">
		<div class="selection-box-window">
			<div class="selection-box-pane active-tab" id="emoji-window"><emoji-picker></emoji-picker></div>
			<div class="selection-box-pane photo-window" id="photo-window">drag and drop an image or click to select one to upload</div>
			<div class="selection-box-pane" id="gif-window"></div>
		</div>`;

	if (withControls){
		html += SaitoInputControls();
	}

	html += "</div>";
	return html;
}