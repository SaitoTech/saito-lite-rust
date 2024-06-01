module.exports = FileReceiveOverlayTemplate = (app, mod) => {
	let html = `
	<div id='file-transfer' class='saito-file-transfer-overlay'>
		<div class="pseudo-overlay-controls">
            <div class="icon-button" id="resize"><i class="fa-solid fa-window-minimize"></i></div>
            <div class="icon-button" id="close"><i class="fas fa-times"></i></div>
        </div>
		<h1>Saito Teleporter</h1>
      	<div class="contact"></div>
		<div class="stun-phone-notice">wants to send you:</div>
		<div class="teleporter-file-data">
			<div class="saito-file-transfer" id="saito-file-transfer-${mod.fileId}">
				<div class="file-transfer-progress"></div>
				<i class="fa-solid fa-file-import"></i>
				<div class="file-name">${mod.file.name}</div>
				<div class="fixed-width">${mod.calcSize(mod.file.size)}</div>
			</div>
		</div>
		<div class="teleporter-status-list">
			<div class="teleporter-status-item">
				<div>Establishing Connection</div>
				<div class="teleporter-status" id="peer-connection-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
			<div id="transfer-speed-row" class="teleporter-status-item hideme">
				<div>Transfering File</div>
				<div class="teleporter-status" id="file-transfer-status"><i class="fa-solid fa-ellipsis"></i></div>
			</div>
		</div>	
		<div class="teleporter-transfer-field"></div>
		<div id="peer-permission-buttons" class="file-button-row">
			<div class="saito-button-primary" id="reject-file">Reject</div>
			<div class="saito-button-primary" id="accept-file">Accept</div>
		</div>
		<div id="file-transfer-buttons" class="file-button-row hideme">
			<div class="saito-button-primary" id="cancel-transfer">Cancel</div>
			<div class="saito-button-primary hideme" id="download-transfer"><i class="fa-solid fa-download"></i>Save</div>
		</div>

	</div>`;

	return html;
};
