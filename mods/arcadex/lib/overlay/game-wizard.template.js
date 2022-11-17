const SaitoModuleIntro = require("./../../../../lib/saito/new-ui/templates/saito-module-intro.template");

module.exports = GameWizardTemplate = (app, mod, game_mod, invite_obj = {}) => {

  let invite = null;
  let publickey = null;
  if (invite_obj.invite) { invite = invite_obj.invite; }
  if (invite_obj.publickey) { publickey = invite_obj.publickey; }
  let league_stuff = (invite?.msg?.league)? `<input type="hidden" name="league" value="${invite.msg.league}" />` : "";

  let html = `<div class="game-create-new-overlay dark">`;

  html += SaitoModuleIntro(app, game_mod);
   
  html += `
    <div class="game-wizard-controls">
  
      <div class="game-wizard-options">
        <form>
          <input type="hidden" name="game" value="${game_mod.name}" />
          ${league_stuff}
          ${game_mod.returnPlayerSelectHTML()}
          <div id="arcade-advance-opt" class="info-item-wrapper">advanced options...</div>
          <div id="advanced-options-overlay-container"></div>
        </form>
      </div>

      <div class="game-wizard-invite">
  `;

    if (game_mod.maxPlayers == 1){
      html += `<button type="button" id="game-invite-btn" class="game-invite-btn" data-type="single">Play</button>`;
    }else{
      html += `
          <div class="saito-multi-select_btn saito-select dark">
           <div class="saito-multi-select_btn_options saito-slct dark">
      `;
      if (publickey) {
        html += `
              <button type="button" class="saito-multi-btn game-invite-btn" data-type="direct">Next Step...</button>
       `;
      } else {
        html += `
              <button type="button" class="saito-multi-btn game-invite-btn" data-type="open">Create Open Game</button>
              <button type="button" class="saito-multi-btn game-invite-btn" data-type="private">Create Private Game</button>
       `;
      }
	    html += `</div>
          </div>`;
    }


  html += `
      </div>

    </div>
    
  `;
  
  html += `</div>`; // overlay closing

  return html;

}
