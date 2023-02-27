module.exports = JoinGameOverlayTemplate = (app, mod, invite) => {
  if (mod.debug) {
    console.log("INVITATION DETAILS: ", invite);
  }

  let desc =
    invite?.desired_opponent_publickeys?.length > 0 ? "private invitation" : "open invitation";

  let html = `
  <div class="arcade-game-overlay">
  <div class="arcade-game-overlay-header">
	  <div class="arcade-game-overlay-header-image" style="background-image: url('${invite.game_mod.returnArcadeImg()}')">
	  </div>
	  <div class="arcade-game-overlay-header-title-box">
		  <div class="arcade-game-overlay-header-title-box-title">${invite.game_name}</div>
		  <div class="arcade-game-overlay-header-title-box-desc">${desc}</div>
	  </div>
  </div>
  <div class="arcade-game-overlay-body">
	  <div class="arcade-game-options">
	    <div class="arcade-game-players">
	`;

  // render players who have joined
  for (let i = 0; i < invite.players.length; i++) {
    html += `
		  <div class="arcade-game-playerbox saito-table-row">
		    <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keychain.returnIdenticon(
          invite.players[i]
        )}"></div>
		    <div class="saito-username">${invite.players[i]}</div>
		  </div>					  	  
			`;
  }

  // render players who are requested to join (their slot isnt empty)
  for (let i = 0; i < invite.desired_opponent_publickeys.length; i++) {
    html += `

      <div class="arcade-game-playerbox empty saito-table-row requested_player">
	      <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keychain.returnIdenticon(
          invite.desired_opponent_publickeys[i]
        )}"></div>
 	      <div class="saito-username">${invite.desired_opponent_publickeys[i]}</div>
	    </div>

      `;
  }

  // render empty slots; empty slots =  players needed - (players joined + players requested)
  for (let i = 0; i < invite.empty_slots; i++) {
    html += `
	        <div class="arcade-game-playerbox saito-table-row">  
	      		<div class="saito-identicon-box empty-slot"></div>
	    			<div class="saito-username">open player slot</div>	
	  			</div>
		    `;
  }

  html += `  
		  	
	      
	      </div>
	    <div class="saito-table">

			  <div class="saito-table-body arcade-overlay-game-options">
	`;

  html += formatOptions(invite.game_mod.returnShortGameOptionsArray(invite.options));

  html += `
			  </div>
		  </div>
	    </div>

	  </div>
	  <div class="arcade-game-controls">`;

  if (mod.isAcceptedGame(invite.game_id)) {
    html += `<div id="arcade-game-controls-continue-game" class="saito-button saito-button-primary">continue game</div>
	    				 <div id="arcade-game-controls-forfeit-game" class="saito-button saito-button-primary">forfeit game</div>
							`;
  } else {
    if (invite.players.includes(app.wallet.getPublicKey())) {
      if (app.wallet.getPublicKey() === invite.originator) {
        html += `<div id="arcade-game-controls-cancel-game" class="saito-button saito-button-primary">cancel invite</div>`;
      } else {
        html += `<div id="arcade-game-controls-cancel-join" class="saito-button saito-button-primary">leave invite</div>`;
      }
    } else {
      html += `<div id="arcade-game-controls-join-game" class="saito-button saito-button-primary">join game</div>`;
    }
  }

  html += `
	  </div>
</div>
  `;

  return html;
};

const formatOptions = (sgoa) => {
  let html = "";
  let cnt = 1;

  for (let i in sgoa) {
    html += `<div class="saito-table-row">
                <div class="arcade-game-options-key">${i.replace(/_/g, " ")}</div>`;
    if (sgoa[i] !== null) {
      html += `<div class="arcade-game-options-value">${sgoa[i]}</div>`;
    }
    html += "</div>";
  }

  return html;
};
