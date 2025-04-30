module.exports = (app, mod, invite) => {
	if (mod.debug) {
		//console.log("INVITATION DETAILS: ", invite);
	}

	let game_tx = mod.returnGame(invite.game_id);

	//Uncreated games
	let desc = invite.verbose_game_type;
	//	invite?.desired_opponent_publickeys?.length > 0 || invite.invite_type == "private"
	//			? "private invitation"
	//		: "open invitation";
	//If created //

	if (invite.players.length >= invite.players_needed){
		desc = 'active game';
	}

	// broken initialization???


	if (invite.time_finished) {
		desc = 'finished game';
	}

	let html = `
  <div class="arcade-game-overlay">
  <div class="arcade-game-overlay-header">
	  <div class="arcade-game-overlay-header-image" style="background-image: url('${ invite.game_mod.respondTo('arcade-games').image}')">
	  </div>
	  <div class="arcade-game-overlay-header-title-box">
		  <div class="arcade-game-overlay-header-title-box-title">${invite.game_name}</div>
		  <div class="arcade-game-overlay-header-title-box-desc">${desc}</div>
	  </div>
  </div>
  <div class="arcade-game-overlay-body">
	  <div class="arcade-game-options hide-scrollbar">
	    <div class="arcade-game-players">
	`;

	// render players who have joined
	for (let i = 0; i < invite.players.length; i++) {
		html += `
		  <div class="arcade-game-playerbox saito-table-row" id="invite-user-${invite.players[i]}">
		    <div class="saito-identicon-box${invite.winner?.includes(invite.players[i]) ? ' winner' : ''}">
          <img class="saito-identicon" src="${app.keychain.returnIdenticon(invite.players[i])}">
        </div>
		    ${app.browser.returnAddressHTML(invite.players[i])}
        <div class="online-status-indicator"></div>
		  </div>					  	  
			`;
	}

	// render players who are requested to join (their slot isnt empty)
	for (let i = 0; i < invite.desired_opponent_publickeys.length; i++) {
		html += `

      <div class="arcade-game-playerbox empty saito-table-row requested_player" id="invite-user-${invite.desired_opponent_publickeys[i]}">
	      <div class="saito-identicon-box">
	      	<img class="saito-identicon" src="${app.keychain.returnIdenticon(invite.desired_opponent_publickeys[i])}">
	      </div>
 	      ${app.browser.returnAddressHTML(invite.desired_opponent_publickeys[i])}
        <div class="online-status-indicator"></div>
	    </div>
     `;
	}

	// render empty slots; empty slots =  players needed - (players joined + players requested)
	for (let i = 0; i < invite.empty_slots; i++) {
		html += `
	        <div class="arcade-game-playerbox saito-table-row`;

		//if (mod.publicKey === invite.originator) {
		//	html += ` available_slot">  
	   //   			<div class="saito-identicon-box empty-slot"><i class="fa-solid fa-link"></i>`;
		//} else {
			html += `">  
	      			<div class="saito-identicon-box empty-slot">`;
		//}

		html += `</div>
	    			<div class="saito-address">open player slot</div>	
	  			</div>
		    `;
	}

	html += `  
		  	
	      
	      </div>
	    <div class="saito-table">

			  <div class="saito-table-body arcade-overlay-game-options">
	`;

	html += formatOptions(
		invite.game_mod.returnShortGameOptionsArray(invite.options)
	);
	if (invite.time_finished) {
		let datetime = app.browser.formatDate(invite.time_finished);
		html += addTimeStamp('finished at', datetime);
	} else if (invite.time_created) {
		let datetime = app.browser.formatDate(invite.time_created);
		html += addTimeStamp('created at', datetime);
	}
	if (invite?.step >= 0) {
		html += `<div class="saito-table-row">
              <div class="arcade-game-options-key">game moves</div>
							<div class="arcade-game-options-value">${invite.step}</div>
					</div>`;
		if (invite?.game_status){
				html += `<div class="saito-table-row">
              <div class="arcade-game-options-key">status</div>
							<div class="arcade-game-options-value">${invite.game_status}</div>
					</div>`;
		}
	}
	if (invite?.method) {
		html += `<div class="saito-table-row">
              <div class="arcade-game-options-key">game ending</div>
							<div class="arcade-game-options-value">${invite.method}</div>
					</div>`;
	}

	html += `
			  </div>
		  </div>
	    </div>

	  </div>
	  <div class="arcade-game-controls">`;


	if (!invite.time_finished) {
		// Still ongoing

		if (invite.players.length >= invite.players_needed) {
			// Game has enough players (should be active)
			if (invite.players.includes(mod.publicKey)) {
				// I can continue or quit my games
				html += `<div id="arcade-game-controls-continue-game" class="saito-button saito-button-primary">continue game</div>`;
				if (invite.players.length > 1) {
					html += `<div id="arcade-game-controls-forfeit-game" class="saito-button saito-button-secondary">forfeit game</div>`;
				}
				html += `<div id="arcade-game-controls-close-game" class="saito-button saito-button-secondary">cancel game</div>`;
			} else if (invite.empty_slots){
				html += `<div id="arcade-game-controls-watch-game" class="saito-button saito-button-primary">join table</div>`;
			}else if (invite.game_mod.enable_observer) {
				//Observer mode -- ongoing
				html += `<div id="arcade-game-controls-watch-game" class="saito-button saito-button-primary">watch game</div>`;
				if (invite.game_mod.doesGameExistLocally(invite.game_id)){
					html += `<div id="arcade-game-controls-clear-game" class="saito-button saito-button-secondary">clear</div>`;
				}
			}
		} else {
			if (invite.players.includes(mod.publicKey)) {
				if (mod.publicKey === invite.originator) {
					html += `<div id="arcade-game-controls-invite-join" class="saito-button saito-button-primary"><i class="fa-solid fa-link"></i>share</div>`;
					html += `<div id="arcade-game-controls-cancel-join" class="saito-button saito-button-secondary">cancel invite</div>`;
				} else {
					html += `<div id="arcade-game-controls-cancel-join" class="saito-button saito-button-secondary">leave invite</div>`;
				}
			} else if (invite.empty_slots > 0) {
				html += `<div id="arcade-game-controls-join-game" class="saito-button saito-button-primary">join game</div>`;
			} else if (invite.desired_opponent_publickeys.includes(mod.publicKey)) {
				html += `<div id="arcade-game-controls-join-game" class="saito-button saito-button-primary">join game</div>
								<div id="arcade-game-controls-cancel-join" class="saito-button saito-button-secondary">decline invite</div>`;
			}
		}
	} else {
		// Game is finished

		if (invite.game_mod.doesGameExistLocally(invite.game_id)) {
			html += `<div id="arcade-game-controls-continue-game" class="saito-button saito-button-primary">view game</div>`;
		} else if (invite.game_mod.enable_observer && invite?.step > 0) {
			//Observer mode -- finished
			html += `<div id="arcade-game-controls-review-game" class="saito-button saito-button-primary">review game</div>`;
		}

	}

	html += `
	  </div>
</div>
  `;

	return html;
};

const formatOptions = (sgoa) => {
	let html = '';
	let cnt = 1;

	for (let i in sgoa) {
		html += `<div class="saito-table-row">
                <div class="arcade-game-options-key">${i.replace(
					/_/g,
					' '
				)}</div>`;
		if (sgoa[i] !== null) {
			html += `<div class="arcade-game-options-value">${sgoa[i]}</div>`;
		}
		html += '</div>';
	}

	return html;
};

const addTimeStamp = (label, datetime) => {
	return `<div class="saito-table-row">
              <div class="arcade-game-options-key">${label}</div>
							<div class="arcade-game-options-value">${datetime.hours}:${datetime.minutes}, ${datetime.day} ${datetime.month}</div>
					</div>`;
};
