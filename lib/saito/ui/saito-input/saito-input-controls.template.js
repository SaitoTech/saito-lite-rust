module.exports = SaitoInputControls = (input_self) => {

	return `
		<div class="selection-box-tabs">
			<div class="saito-box-tab" id="emoji-tab"><i class="fa-regular fa-face-smile"></i></div>
			<div class="saito-box-tab" id="photo-tab"><i class="fa-regular fa-image"></i></div>
			<div class="saito-box-tab gif-icon" id="gif-tab"></div>
			${input_self.enable_mentions? `<div class="saito-box-tab" id="at-tab"><i class="fa-solid fa-at"></i></div>` : ""}
		</div>`;

}
