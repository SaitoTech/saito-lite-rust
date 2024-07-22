module.exports = function ScreenRecordWizardTemplate(app, mod, options) {


	const icon = null;

	let titleText = options.type === "videocall"
		? "What do you want to record?"
		: "Include camera?";

	let html = `
    <div id="screenrecord-wizard" class="screenrecord-wizard">
      <h5 class="screenrecord-wizard-title">${titleText}</h5>
  `;

	if (icon) {
		html += `<div class="record-mode"><i class="selected fa-solid ${icon}"></i></div>`;
	} else {
		html += `
		<div class="record-mode">
		  ${options.type === "videocall"
				? `<i id="mode-audio" class="record-mode-option fa-solid fa-microphone-lines"></i>`
				: ""}
		  <i id="mode-video" class="record-mode-option fa-solid fa-tv ${options.type === "videocall" ? "selected" : ""}"></i>
		</div>
	  `;
	}

	html += `
	  <div id="screenrecord-wizard-btn" class="button saito-button-primary">Start Recording</div>
	</div>
	`;

	return html;
}