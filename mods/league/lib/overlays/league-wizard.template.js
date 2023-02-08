module.exports = LeagueWizardTemplate = (app, mod, game_mod) => {

  let html = `

    <div class="game-create-new-overlay dark">

    <div class="league-wizard-overlay">
      <form>

        <div class="league-wizard-game-container">
          <div class="league-wizard-game-image"><img class="league-wizard-game-thumbnail" src="${game_mod.returnArcadeImg()}"></div>
          <div class="leaguee-wizard-game-details  rs-create-game-desc-wrapper">
            <div class="league-wizard-game-name">
	      <input type="text" id="league-name" value="Name League" />
	    </div>
            <div class="league-wizard-game-description">
	      <textarea id="league-desc">${game_mod.description}</textarea>
	    </div>
          </div> 
          <input type="hidden" name="game" value="${game_mod.name}">  
        </div>

        <div class="league-wizard-game-controls">
  
          <div class="settings">
            <div class="overlay-input">
	      <select class="league-wizard-status-select" name="game-wizard-rankings-select">
		<option value="public" selected="" default="">public</options>
		<option value="private">private</options>
	      </select>
            </div>
          </div>

          <div class="league-wizard-game-invite">
  
            <div class="saito-multi-select_btn saito-select">
              <div class="saito-multi-select_btn_options">
                <button type="button" class="saito-multi-btn game-invite-btn" data-type="public">Create New League</button>
              </div>
            </div>

	  </div>

       </div>
    </form>
  </div>

  </div>

  `;

  return html;

}
