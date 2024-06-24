
module.exports = ScreenRecordWizardTemplate = (app, mod, options) => {

	let icon = null;


	let html = `<div id="screenrecord-wizard" class="screenrecord-wizard">`;

    html += `<h5 class="screenrecord-wizard-title">What do you want to record?</h5>`


	if (icon){
		html += `<div class="record-mode"><i class="selected fa-solid ${icon}"></i></div>`
	}else{
		html += `<div class="record-mode">
					<i id="mode-audio" class="record-mode-option fa-solid fa-microphone-lines"></i>
					<i id="mode-video" class="record-mode-option fa-solid fa-tv selected"></i>
					<!--i class="fa-solid fa-tv"></i-->
				</div>`;
	}

	let default_title = "Start Recording?";

	html += `
	`;


	html += `<div id="screenrecord-wizard-btn" class="button saito-button-primary">Start Recording</div>
				</div>
	`;

	return html;
};
