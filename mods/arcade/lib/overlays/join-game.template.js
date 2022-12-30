module.exports = JoinGameOverlayTemplate = (app, mod, invite_tx) => {

  let txmsg = invite_tx.returnMessage();
  let game_mod = app.modules.returnModuleByName(txmsg.name);

  console.log("TXN MSGGGGGGGG");
  console.log(txmsg);

  let html = `
  <div class="arcade-game-overlay">
  <div class="arcade-game-overlay-header">
	  <div class="arcade-game-overlay-header-image" style="background-image: url('/${game_mod.returnSlug()}/img/arcade/arcade.jpg')">
	  </div>
	  <div class="arcade-game-overlay-header-title-box">
		  <div class="arcade-game-overlay-header-title-box-title">${game_mod.returnName()}</div>
		  <div class="arcade-game-overlay-header-title-box-desc">open game invitation</div>
	  </div>
  </div>
  <div class="arcade-game-overlay-body">
	  <div class="arcade-game-options">
		  <div class="saito-table">
			  <div class="saito-table-body">
	
			  <div class="saito-table-row arcade-game-player-row">
	`;

		for (let i=0; i < txmsg.players.length; i++) {
  		html += `

				  
					  <div class="saito-identicon-box">
						  <img class="saito-identicon"
							  src="${app.keys.returnIdenticon(txmsg.players[i])}">
					  </div>
					  <div class="saito-username">${txmsg.players[i]}</div>
					  	  
			`;

		}

	html += `  

						<div class="saito-identicon-box empty_slot">
					  </div>
					  <div class="saito-username">Open to join</div>

					</div>

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
	    <div class="saito-button saito-button-primary">join game</div>
	  </div>
</div>
  `;

  return html;

}

