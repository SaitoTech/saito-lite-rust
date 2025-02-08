module.exports = (game_mod, invite_obj = {}) => {
	let html = `<div class="arcade-wizard-overlay">`;
	let invite = null;
	let publicKey = null;
	if (invite_obj.invite) {
		invite = invite_obj.invite;
	}
	if (invite_obj.publicKey) {
		publicKey = invite_obj.publicKey;
	}

	let img = game_mod.respondTo('arcade-games')?.image || '';

	html += `
    <form>
    <div class="arcade-wizard-game-container">
    
      <!- ***Game thumbnail & options start*** -->
      <div class="arcade-wizard-game-image">
        <img class="arcade-wizard-game-thumbnail" src="${img}">
      </div>
      <!- ***Game thumbnail & options end*** -->


      <!- ***Game desc & title start*** -->
      <div class="arcade-wizard-game-details  rs-create-game-desc-wrapper">
        <div class="arcade-wizard-game-name">
          <span><b>${game_mod.returnName()}</b></span>
        </div>
        <div class="arcade-wizard-game-description">${
	game_mod.description
}</div>
      </div>
      <!- ***Game desc & title end*** -->
  `;

	html += `
        <input type="hidden" name="game" value="${game_mod.name}" />
  `;

	html += `
    </div>

    <div class="arcade-wizard-game-controls">
  
      <div class="settings">
        ${game_mod.returnOptions()}
        <div id="arcade-advance-opt"><div class="arcade-advance-opt-text">advanced options...</div></div>
      </div>

      <div class="arcade-wizard-game-invite">
  `;

	if (game_mod.maxPlayers == 1) {
		/*html += `<select name="invite_type" style="display:none;">
              <option value="single" selected default></option>
             </select>
    `;*/

		html += `<button type="button" id="game-invite-btn" class="saito-button saito-button-primary game-invite-btn" data-type="single">Play</button>`;
	} else {
		/*html += `<select name="invite_type">
              <option value="open" selected default>public invite</option>
              <option value="private">private invite</option>
             </select>
    `;

    html += `
              <button type="button" id="game-invite-btn" class="saito-button saito-button-primary">Create Game</button>
         `;

    */
		html += `
          <div class="saito-multi-select_btn saito-select">
           <div class="saito-multi-select_btn_options saito-slct">
      `;
		if (publicKey) {
			html += `<button type="button" class="saito-multi-btn  game-invite-btn" data-type="direct">next...</button>`;
		} else {
			if (invite_obj.league) {
				html += `
					<button type="button" class="saito-multi-btn  game-invite-btn" data-type="open">create public league invite</button>
                			 <button type="button" class="saito-multi-btn  game-invite-btn" data-type="private">create private league invite</button>
                			 <button type="button" class="saito-multi-btn  game-invite-btn" data-type="import">import game file</button>
				`;
			} else {
				html += `
              				<button type="button" class="saito-multi-btn  game-invite-btn" data-type="open">create public invite</button>
              				<button type="button" class="saito-multi-btn game-invite-btn" data-type="private">create private invite</button>
                			 <button type="button" class="saito-multi-btn  game-invite-btn" data-type="import">import game file</button>
         			`;

        			if (game_mod?.can_play_async){
					html += `<button type="button" class="saito-multi-btn  game-invite-btn" data-type="async">create async invite</button>`;
				}
			}
		}
		html += `</div>
          </div>`;
	}

	html += `
      </div>

    </div>
  </form>
  `;

	// support game publishers
	if (game_mod.publisher_message) {
		html += `<div id="arcade-game-publisher-message" class="arcade-game-publisher-message">
      <span>NOTE: </span>${game_mod.publisher_message}</div>`;
	}

	html += `</div>`; // overlay closing

	return html;
};
