
module.exports = DreamWizardTemplate = (app, mod, options) => {

	// let icon = null;
	/*if (options?.audio){
		icon = mod.audio_icon;
	}
	if (options?.includeCamera){
		icon = mod.camera_icon;
	}
	if (options?.screenStream){
		icon = mod.screen_icon;
	}*/


	let html;

	if(options.externalMediaType === "videocall"){
		html = `<div id="dream-wizard" class="dream-wizard">`;

			html += `<div class="cast-mode">
						<div class="cast-mode-option" id="mode-audio"><i class="fa-solid ${mod.audio_icon}" title="ignore the camera feeds and cast only the call audio"></i><label>voice</label></div>
						<div class="cast-mode-option selected" id="mode-video"><i class="fa-solid ${mod.screen_icon}" title="Let Saito stitch the video streams together"></i><label>video</label></div>
						<!--i id="mode-audio" class="cast-mode-option fa-solid ${mod.audio_icon}"></i>
						<i id="mode-video" class="cast-mode-option fa-solid ${mod.screen_icon} " title="Let Saito stitch the video streams together"></i-->
						<!--i id="mode-screen" class="cast-mode-option fa-solid ${mod.screen_icon}" title="Use browser screen share to capture this window or another on your computer"></i-->
					</div>`;
		
	
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
	}

	else if(options.externalMediaType === "game"){
		html = `<div id="dream-wizard" class="dream-wizard">`;

		let default_description="";
		let players = options.players.map(player => app.keychain.returnUsername(player))
		let last_player = players.pop();
		default_description += `${players.join(',')} and ${last_player} are playing ${options.game_name} live!`

		// for(let i=0; i< options.players.length; i++){

		// 	if(options.players[i] ===  options.players[options.players.length -1] && options.players.length > 1){
		// 		default_description+= `and `
		// 	} 
		// 	default_description+= `${options.players[i]}`
			
		// 	if(options.players[i] !==  options.players[options.players.length -1] && options.players[i] !==  options.players[options.players.length -1 - 1] ){
		// 		default_description+= `,`
		// 	}
		// }
	
			html += `<div class="cast-mode">
						<div class="cast-mode-option" id="mode-game-screen"><i class="fa-solid fa-tv" title="Game screen only"></i><label>Screen only</label></div>
						<div class="cast-mode-option selected" id="mode-video"><i class="fa-solid fa-camera" title="Let Saito stitch the game screen and camera feed"></i><label>Screen + camera</label></div>
					</div>`;
		
		
		let default_title = `${options.game_name}-cast: ` + app.keychain.returnUsername(mod.publicKey);
	
		html += `<label for="dream-wizard-identifier">Title the space</label> 
		 <input type="text" name="dream-wizard-identifier" id="dream-wizard-identifier" placeholder="${default_title}" value="${default_title}"></input>
		 <label for="dream-wizard-description">Add a description</label> 
		 <textarea id="dream-wizard-description" class="post-tweet-textarea text-input" placeholder="What are you talking about?"> ${default_description}
		 </textarea>  
		`;
	
	
		html += `<div id="dream-wizard-btn" class="button saito-button-primary">Start Casting</div>
						<div class="help-hook"><span>Learn more</span><i class="fa-solid fa-circle-info"></i></div>
					</div>
		`;
	}

	else {
		throw Error("No external media type selected")
	}

	// console.log(options);



	return html;
};
