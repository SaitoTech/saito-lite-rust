module.exports = SaitoInputSelectionBox = (top, left) => {

	let bottom = (window.innerHeight - top);

	return `
	<div class="saito-input-selection-box" style="bottom:${bottom}px; left:${left}px;">
		<div class="selection-box-window">
			<div class="selection-box-pane active-tab" id="emoji-window"><emoji-picker></emoji-picker></div>
			<div class="selection-box-pane photo-window" id="photo-window">drag and drop an image or click to select one to upload</div>
			<div class="selection-box-pane" id="gif-window"></div>
		</div>
		<div class="selection-box-tabs">
			<div class="saito-box-tab" id="emoji-tab"><i class="fas fa-smile"></i></div>
			<div class="saito-box-tab" id="photo-tab"><i class="fas fa-image"></i></div>
			<div class="saito-box-tab" id="gif-tab"><i class="fas fa-video"></i></div>
		</div>
	</div>
	`;
}