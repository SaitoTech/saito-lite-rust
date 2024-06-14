module.exports = FileShareOverlayTemplate = (app, mod) => {
	let html = `
	<div id='file-transfer' class='saito-file-transfer-overlay'>
		<div class="pseudo-overlay-controls">
            <div class="icon-button" id="resize"><i class="fa-solid fa-window-minimize"></i></div>
            <div class="icon-button" id="close"><i class="fas fa-times"></i></div>
        </div>
		<h1>Saito Fileshare</h1>
		<div class="teleporter-status-list">
			<form id="uploader_overlay" class="saito-file-uploader needs-file teleporter-status-item">
				<div>Selecting File</div>
				<div class="teleporter-status" id="file-selection-status"><i class="fa-solid fa-ellipsis"></i></div>
			    <input type="file" id="hidden_file_element_uploader_overlay" style="display:none" accept="*" class="hidden_file_element">
			</form>
			<div class="teleporter-status-item">
				<div>Establishing Connection</div>
				<div class="teleporter-status" id="peer-connection-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
			<div class="teleporter-status-item">
				<div>Waiting for Peer Response</div>
				<div class="teleporter-status" id="peer-accept-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
			<div id="transfer-speed-row" class="teleporter-status-item hideme">
				<div>Transferring File</div>
				<div class="teleporter-status" id="file-transfer-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
		</div>
		<div class="teleporter-file-data"></div>
		<div class="teleporter-transfer-field"></div>
		<div id="file-transfer-buttons" class="file-button-row hideme">
			<div class="saito-button-primary" id="cancel-transfer">Cancel</div>
		</div>

	</div>`;

	return html;
};

/*

<i class="fa-solid fa-ellipsis"></i>
<i class="fa-solid fa-check"></i>
<i class="fa-solid fa-xmark"></i>
*/
