
module.exports = DreamWizardTemplate = (app, mod, options) => {

	let icon = null;
	/*if (options?.audio){
		icon = mod.audio_icon;
	}
	if (options?.includeCamera){
		icon = mod.camera_icon;
	}
	if (options?.screenStream){
		icon = mod.screen_icon;
	}*/

	console.log(options);

	let html = `<div id="dream-wizard" class="dream-wizard">`;

	if (icon) {
		html += `<div class="cast-mode"><i class="selected fa-solid ${icon}"></i></div>`
	} else {
		html += `<div class="cast-mode">
		            ${options.externalMediaType === "videocall" ? `<div class="cast-mode-option" id="mode-audio"><i class="fa-solid ${mod.audio_icon}" title="ignore the camera feeds and cast only the call audio"></i><label>voice</label></div>`: ""}
					
					<div class="cast-mode-option ${options.externalMediaType==="videocall" && "selected"}" id="mode-video"><i class="fa-solid ${mod.screen_icon}" title="Let Saito stitch the video streams together"></i><label>${options.externalMediaType === "videocall" ? "video" : "include video?"}</label></div>
					<!--i id="mode-audio" class="cast-mode-option fa-solid ${mod.audio_icon}"></i>
					<i id="mode-video" class="cast-mode-option fa-solid ${mod.screen_icon} " title="Let Saito stitch the video streams together"></i-->
					<!--i id="mode-screen" class="cast-mode-option fa-solid ${mod.screen_icon}" title="Use browser screen share to capture this window or another on your computer"></i-->
				</div>`;
	}

	let default_title = "Swarmcast: " + app.keychain.returnUsername(mod.publicKey);

	html += `<label for="dream-wizard-identifier">Title the space</label> 
	 <input type="text" name="dream-wizard-identifier" id="dream-wizard-identifier" placeholder="${default_title}" value="${default_title}"></input>
	 <label for="dream-wizard-description">Add a description</label> 
	 <textarea id="dream-wizard-description" class="post-tweet-textarea text-input" placeholder="What are you talking about?"></textarea>  
	`;


	html += `<div id="dream-wizard-btn" class="button saito-button-primary">Start Casting</div>
					<div class="help-hook"><span>Learn more</span><i class="fa-solid fa-circle-info"></i></div>
				</div>
	`;

	return html;
};
