module.exports = ContinueGameOverlayTemplate = (app, mod, component_obj) => {

  let txmsg = component_obj.invite_tx.returnMessage();
  let invite = component_obj.invite;
  let modname = txmsg.name;
  if (!modname) { modname = txmsg.game; }
  if (!modname) { modname = txmsg.module; }
  let game_mod = app.modules.returnModuleByName(modname);
  let options = txmsg.options;

  let desc = "open invitation";
  (invite.desired_opponent_publickeys != null && invite.desired_opponent_publickeys.length > 0) ? 
  desc = 'private invitation' : 'open invitation';

  let html = `
    <div class="arcade-game-overlay">

      <div class="arcade-game-overlay-header">
				<div class="arcade-game-overlay-header-image" style="background-image: url('/${game_mod.returnSlug()}/img/arcade/arcade.jpg')"></div>
				<div class="arcade-game-overlay-header-title-box">
				  <div class="arcade-game-overlay-header-title-box-title">${game_mod.returnName()}</div>
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
	      <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keys.returnIdenticon(invite.players[i])}"></div>
 	      <div class="saito-username">${invite.players[i]}</div>
	    </div>					  	  
	    `;
  }


  // render players who are requested to join (their slot isnt empty)
    for (let i = 0; i < invite.desired_opponent_publickeys.length; i++) {
      html += `

      <div class="arcade-game-playerbox saito-table-row requested_player">
	      <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keys.returnIdenticon(invite.desired_opponent_publickeys[i])}"></div>
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

 	for (const key in options) {
 		if (!mod.ommit_options.includes(key) && (options[key] != "" && options[key] != 0)) {
    	
    		html += `
        	<div class="saito-table-row">
	    
	        	<div class="arcade-game-options-key">${key}</div>
	        	<div class="arcade-game-options-value">${options[key]}</div>
				
	      	</div>`;
	  }
	 };

	  html += `
	    </div>
	  </div>
	</div>
      </div>
      <div class="arcade-game-controls">
  `;

  	if (invite.players.length == invite.players_needed) {
        
      html += `<div class="arcade-game-controls-join-game saito-button saito-button-primary" data-cmd="continue">continue game</div>`;

    }

  html +=`
        <div class="arcade-game-controls-join-game saito-button saito-button-primary" data-cmd="cancel">cancel game</div>
      </div>
    </div>
  `;

  return html;

}

