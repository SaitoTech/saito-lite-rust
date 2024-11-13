module.exports = (app, mod, invite) => {

	let invite_class = (invite.target && invite.players[invite.target - 1 ] == mod.publicKey) ? " my-turn" : ""; 

	let html = `

      <div class="saito-module saito-game${invite_class}" id="saito-game-${invite.game_id}" 
      				style="background-image: url('/${invite.game_slug}/img/arcade/arcade-banner-background.png');">
        <div class="saito-module-titlebar">
          <div class="saito-module-titlebar-title">${invite.game_name}</div>
          <div class="saito-module-titlebar-details game-type">${invite.game_type.toUpperCase()}</div>
        </div>
           
        <div class="saito-module-holder">
          <div class="saito-game-details saito-game-identicons">
    `;

	// render players who have joined
	for (let i = 0; i < invite.players.length; i++) {
		//invite_class = (invite.target && invite.target == i + 1) ? " player-turn" : ""; 
		html += `
          <div class="saito-identicon-box">
            <img class="saito-module-identicon saito-identicon" id-${invite.players[i]}" 
            				src="${app.keychain.returnIdenticon(invite.players[i])}">`;
//    if (invite_class){
//      html += `<i class="fa-solid fa-circle-exclamation"></i>`;
//    }
    html+='</div>';
	}

	// render players who are requested to join (their slot isnt empty)
	for (let i = 0; i < invite.desired_opponent_publickeys.length; i++) {
		html += `
          <div class="requested_player">
            <img class="saito-module-identicon saito-identicon" id-${invite.desired_opponent_publickeys[i]}" 
            			src="${app.keychain.returnIdenticon(invite.desired_opponent_publickeys[i])}">
          </div>

      `;
	}

	// render empty slots; empty slots =  players needed - (players joined + players requested)
	for (let i = 0; i < invite.empty_slots; i++) {
		html += `
          <div class="saito-module-identicon identicon-needed">
          </div>
      `;
	}

	html += `
          </div>
        </div>`;
  
  if (invite_class) {
    html += `<div class="angled-notification">your turn</div>`;
  } 
  // Overwrite "your turn" as necessary
  if (invite.winner) {
    if (invite.winner.includes(mod.publicKey)) {
      html += `<div class="angled-notification">you won</div>`;
    } else {
      html += `<div class="angled-notification">you lost</div>`;
    } 
  }    
  
  html += `</div>`;

	return html;
};
