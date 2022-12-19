module.exports = JoinGameOverlayTemplate = (app, mod, invite) => {

  let html = `
      <div class="arcade-game-overlay">
        <div class="arcade-game-overlay-header">
          <div class="arcade-game-overlay-header-image">
          </div>
          <div class="arcade-game-overlay-header-title-box">
            <div class="arcade-game-overlay-header-title-box-title">Twilight Struggle</div>
            <div class="arcade-game-overlay-header-title-box-desc">open game invitation</div>
          </div>
        </div>
        <div class="arcade-game-overlay-body">
          <div class="arcade-game-overlay-body-main">

	    <div class="arcade-game-players">
	      <h6>Player</h6>

	      <div class="saito-table">
	        <div class="saito-table-row">
	  	  <div class="saito-identicon-box">
		    <img class="saito-identicon" src="${app.keys.returnIdenticon('fkBBy46Rjw3gAtzSa8o1kHKn9HeCzAibiFvnMqyS5A2b')}">
	          </div>
		  <div class="saito-username">fkBBy46Rjw3gAtzSa8o1kHKn9HeCzAibiFvnMqyS5A2b</div>
		  <div class="saito-identicon-box">
		    <img class="saito-identicon" src="${app.keys.returnIdenticon('fkBBy46Rjw3gAtzSa8o1kHKn9HeCzAibiFvnMqyS5A2b')}">
	          </div>
		  <div class="saito-username">fkBBy46Rjw3gAtzSa8o1kHKn9HeCzAibiFvnMqyS5A2b</div>
	        </div>
	      </div>
	    </div>

	    <div class="arcade-game-options">
	      <h6>Options</h6>

	      <div class="saito-table">
	        <div class="saito-table-row">
	  	  <div class="arcade-game-options-key">deck</div>
	  	  <div class="arcade-game-options-value">optional</div>
	  	  <div class="arcade-game-options-key">time</div>
	  	  <div class="arcade-game-options-value">60 mins</div>
	  	  <div class="arcade-game-options-key">sides</div>
	  	  <div class="arcade-game-options-value">random</div>
	        </div>
	      </div>
	    </div>

	    <div class="arcade-game-options">
	      <div class="saito-button saito-button-primary">join game</div>
	    </div>

          </div>
        </div>
      </div>
  `;

  return html;

}

