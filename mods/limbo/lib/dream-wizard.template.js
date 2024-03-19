
module.exports = DreamWizardTemplate = (app, mod) => {

	let html = `<div id="dream-wizard" class="dream-wizard">
					<h1>Saito Dream Space</h1>

					<fieldset class="saito-grid">
						<legend class="settings-label">Input Sources</legend>
						<input type="checkbox" id="enable-screenshare"/>
						<label for="enable-screenshare">share window or screen</label>
						<input type="checkbox" id="enable-webcam" ${mod.localStream ? "checked disabled":""}/>
						<label for="enable-webcam">${mod.localStream ? "webcam already active": "activate webcam"}</label>
					</fieldset>
					<div>Broadcast audio<span id="dream-status"> only</span></div>
					<div id="dream-wizard-btn" class="button saito-button-primary">Select</div>
				</div>
	`;

	return html;
};
