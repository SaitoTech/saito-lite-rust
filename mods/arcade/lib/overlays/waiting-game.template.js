module.exports = WaitingGameOverlayTemplate = (app, mod, invite_tx) => {

  let txmsg = invite_tx.returnMessage();
  let modname = txmsg.name;
  if (!modname) { modname = txmsg.game; }
  if (!modname) { modname = txmsg.module; }
  let game_mod = app.modules.returnModuleByName(modname);
  let desc = "waiting for players";

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

  for (let i=0; i < txmsg.players.length; i++) {
    html += `
  	    <div class="arcade-game-playerbox saito-table-row">
	      <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keys.returnIdenticon(txmsg.players[i])}"></div>
 	      <div class="saito-username">${txmsg.players[i]}</div>
	    </div>					  	  
	    `;
  }

  if (txmsg.players_needed > txmsg.players.length) {
    let missing_slots = txmsg.players_needed - txmsg.players.length;
    for (let i=0; i<missing_slots; i++) {
      html += `
            <div class="arcade-game-playerbox saito-table-row">  
  	      <div class="saito-identicon-box empty-slot"></div>
	      <div class="saito-username">open player slot</div>
	    </div>
      `;
    }
  }


  html += `  
 	
	  </div>

	  <div class="saito-table">
  	    <div class="saito-table-body">
	      <div class="saito-table-row">
	        <div class="arcade-game-options-key">deck</div>
	        <div class="arcade-game-options-value">optional</div>
	      </div>
	      <div class="saito-table-row">
	        <div class="arcade-game-options-key">time</div>
	        <div class="arcade-game-options-value">60 mins</div>
	      </div>
	      <div class="saito-table-row">
	        <div class="arcade-game-options-key">sides</div>
	        <div class="arcade-game-options-value">random</div>
	      </div>
	    </div>
	  </div>
	</div>
      </div>
      <div class="arcade-game-controls">
        <div class="arcade-game-controls-cancel-invite saito-button saito-button-primary" data-cmd="cancel">cancel invite</div>
      </div>
    </div>
  `;

  return html;

}

