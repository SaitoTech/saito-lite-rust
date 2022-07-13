module.exports = (app, mod, games) => {

  let html = `
      <div class="league-component-admin-box" id="game-selector">
      <select id="league-game">
      <option value="">--Choose a Game--</option>`;

  for (let game of games){
    html += `<option id="${game.modname}" value="${game.modname}" data-img="${game.img}">${game.modname}</option>`
  }

  html +=
      `</select>
      </div>
      <div class="league-component-admin-box" id="league-details" style="display:none;">
        <h2 id="league-name" class="editable-content" contenteditable>Saito League</h2>
        <div class="forceinrow">
          <img src="/saito/img/background.png">
          <div id="league-desc" class="post-create-textarea editable-content markdown medium-editor-element" placeholder="Your post..." contenteditable="true" spellcheck="true" data-medium-editor-element="true" role="textbox" aria-multiline="true" data-medium-editor-editor-index="1" medium-editor-index="37877e4c-7415-e298-1409-7dca41eed3b8"></div>
        </div>
        <form class="league-component-admin-box-form" id="">
          <input type="hidden" value="" name="game" id="game">
          <label for="max_players">Limit League Size:</label>
          <input id="max_players" type="number" value="100" min="0" max="500" step="5"/>
          <select id="type">
            <option value="public" selected>Public</option>
            <option value="private">Private</option>
          </select>
          <select id="ranking">
            <option value="unk" selected>Default</option>
            <option value="elo">ELO</option>
            <option value="exp">EXP</option>
          </select>
          <input id="starting_score" type="number" value="0" min="0" max="2000" step="50" style="display:none;"/>
          <button type="submit">Create League</button>
        </form>
      </div>
  `;

  return html;
}
