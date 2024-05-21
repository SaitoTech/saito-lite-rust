module.exports = FileShareOverlayTemplate = (app, mod) => {
	let html = `
	<div class='saito-file-transfer-overlay'>
		<h1>Saito Teleporter</h1>
		<div class="teleporter-status-list">
			<div class="teleporter-status-item">
				<div>Selecting File</div>
				<div class="teleporter-status" id="file-selection-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
			<div class="teleporter-status-item">
				<div>Establishing Connection</div>
				<div class="teleporter-status" id="peer-connection-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
			<div class="teleporter-status-item">
				<div>Requesting Permission</div>
				<div class="teleporter-status" id="peer-accept-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
			<div class="teleporter-status-item">
				<div>Transfering File</div>
				<div class="teleporter-status" id="file-transfer-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
		</div>
		<div class="teleporter-file-data"></div>
		<div class="teleporter-transfer-field"></div>

		<form id="uploader_overlay" class="saito-file-uploader" style="display:none">
		    <input type="file" id="hidden_file_element_uploader_overlay" accept="*" class="hidden_file_element">
		</form>

	</div>`;

	return html;
};

/*

<i class="fa-solid fa-ellipsis"></i>
<i class="fa-solid fa-check"></i>
<i class="fa-solid fa-xmark"></i>
*/
