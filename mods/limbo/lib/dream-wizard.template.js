
module.exports = DreamWizardTemplate = (app, mod, options) => {

	let icon = null;
	if (options?.audio){
		icon = mod.audio_icon;
	}
	if (options?.includeCamera){
		icon = mod.camera_icon;
	}
	if (options?.screenStream){
		icon = mod.screen_icon;
	}

	console.log(options);

	let html = `<div id="dream-wizard" class="dream-wizard">`;

	if (icon){
		html += `<div class="cast-mode"><i class="fa-solid ${icon}"></i></div>`
	}else{
		html += `<div class="cast-mode-options">
					<i class="fa-solid ${mod.audio_icon}"></i>
					<i class="fa-solid ${mod.camera_icon}"></i>
					<i class="fa-solid ${mod.screen_icon}"></i>
				</div>`;
	}

	let default_title = "Saito Space with " + app.keychain.returnUsername(mod.publicKey);

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
