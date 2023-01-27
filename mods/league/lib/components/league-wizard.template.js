//const SaitoModuleIntro = require("./../../../../lib/saito/new-ui/templates/saito-module-intro.template");

module.exports = LeagueWizardTemplate = (app, mod, game_mod) => {

  let image = game_mod.respondTo("arcade-games")?.img;

  let html = `<div class="game-create-new-overlay dark">`;

  html += ` 
    <div class="saito-module-intro">
      <div class="saito-module-intro-image" style="background-image:url('${image}');"></div>
      <div class="saito-module-intro-text">
        <div class="saito-module-intro-title editable-content" id="league-name" contenteditable data-placeholder="Name your league....">Name your league....</div>
        <div id="league-desc" class="saito-module-intro-description post-create-textarea editable-content markdown medium-editor-element" data-placeholder="Describe your league here..." contenteditable="true" spellcheck="true" data-medium-editor-element="true" role="textbox" aria-multiline="true">Describe your league here...</div>
      </div>
    </div>
  
  `
   
  html += `
    <div class="game-wizard-controls">
  
      <div class="game-wizard-options">
        <form>
          <div id="league-advance-opt" class="info-item-wrapper">advanced league options...</div>
          <div id="league-options-overlay-container"></div>
          <!--div id="league-game-advance-opt" class="info-item-wrapper">select game options...</div>
          <div id="game-options-overlay-container"></div-->

          <div>
            <button type="button" class="saito-multi-btn game-invite-btn" data-type="public">Create Public League</button>
            <button type="button" class="saito-multi-btn game-invite-btn" data-type="private">Create Private League</button>
          </div>
        </form>
      </div>

      <!--
      <div class="game-wizard-invite">
        <div class="saito-multi-select_btn saito-select dark">
          <div class="saito-multi-select_btn_options saito-slct dark">
            <button type="button" class="saito-multi-btn game-invite-btn" data-type="public">Create Public League</button>
            <button type="button" class="saito-multi-btn game-invite-btn" data-type="private">Create Private League</button>
          </div>
        </div>
      </div>
      -->

    </div>
  </div>`;

  return html;

}
