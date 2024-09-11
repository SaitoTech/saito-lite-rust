
module.exports = DreamWizardTemplate = (app, mod, options) => {

	let html;

	let default_title = "Swarmcast: " + app.keychain.returnUsername(mod.publicKey);
	let default_description = "";

	if (options.externalMediaType === "videocall") {
		default_title = "Saito Talk -- Swarmcast";
		let names = options.keylist.map(player => app.keychain.returnUsername(player));
		let last_player = app.keychain.returnUsername(mod.publicKey);
		if (names.length === 0) {
			default_description += `${last_player} is broadcasting live!`
		}else {
			default_description += `${names.join(',')} and ${last_player} are having a conversation on Saito Talk!`
		}

	}

	if (options.externalMediaType === "game") {
		default_title = `${options.game_name} -- Swarmcast`;
		let players = options.players.map(player => app.keychain.returnUsername(player))
		let last_player = players.pop();
		if (players.length === 0) {
			default_description += `${last_player} is playing ${options.game_name} live!`
		}else {
			default_description += `${players.join(',')} and ${last_player} are playing ${options.game_name} live!`
		}
	}



	html = `<div id="dream-wizard" class="dream-wizard">`;

	html += `<div class="cast-mode">`;

	if (options.externalMediaType === "game") {
		// This is bad programming!
		if (!document.querySelector('.video-box-container-large')){
			html += '<div class="cast-mode-option" id="mode-game-screen"><i class="fa-solid fa-tv" title="Game screen only"></i><label>Screen only</label></div>';
		}
		html += `<div class="cast-mode-option selected" id="mode-video"><i class="fa-solid fa-camera" title="Let Saito stitch the game screen and camera feed"></i><label>Screen + camera</label></div>`;

	}else{
		if (options?.mode){
			html +=  `<div class="selected"><i class="fa-solid ${mod.icons[options.mode]}"></i><label>${options.mode}</label></div>`;
		}else{
			html += 	`<div class="cast-mode-option" id="mode-audio"><i class="fa-solid ${mod.icons.audio}" title="ignore the camera feeds and cast only the call audio"></i><label>voice</label></div>
						<div class="cast-mode-option selected" id="mode-video"><i class="fa-solid ${mod.icons.screen}" title="Let Saito stitch the video streams together"></i><label>video</label></div>`;
		}

	}

	html +=	`</div>`;


	html += `<label for="dream-wizard-identifier">Title the space</label> 
	 <input type="text" name="dream-wizard-identifier" id="dream-wizard-identifier" placeholder="${default_title}" value="${default_title}"></input>
	 <label for="dream-wizard-description">Add a description</label> 
	 <textarea id="dream-wizard-description" class="post-tweet-textarea text-input" placeholder="What are you talking about?">${default_description}</textarea>  
	<div class="saito-button-row">
	`;


	if (options?.mode){
		html += `<button id="dream-schedule-btn" class="button saito-button-secondary">Schedule for Later</button>`;	
	}

	html += `<div id="dream-wizard-btn" class="button saito-button-primary">Start Casting Now</div></div>
					<div class="help-hook"><span>Learn more</span><i class="fa-solid fa-circle-info"></i></div>
				</div>
	`;

	return html;
};
