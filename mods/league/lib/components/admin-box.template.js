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
          <div id="league-desc" class="post-create-textarea editable-content markdown medium-editor-element" data-placeholder="Describe your league here..." contenteditable="true" spellcheck="true" data-medium-editor-element="true" role="textbox" aria-multiline="true"></div>
        </div>
        <form class="league-component-admin-box-form" id="">
          <input type="hidden" value="" name="game" id="game">
          <div class="label"><label for="max_players">Limit League Size:</label><div class="tip"><i class="fa fa-question-circle" aria-hidden="true"></i><div class="tiptext">In increments of 5 players, you can set a maximum size. Or select 0 for an unlimited league.</div></div></div>
          <input id="max_players" type="number" value="25" min="0" max="500" step="5"/>
          <div class="label"><label for="type">League Visibility:</label><div class="tip"><i class="fa fa-question-circle" aria-hidden="true"></i><div class="tiptext">Whether or not any player can see the league and join it</div></div></div>
          <select id="type">
            <option value="public" selected>Public</option>
            <option value="private">Private</option>
          </select>
          <div class="label"><label for="ranking">Ranking Algorithm:</label><div class="tip"><i class="fa fa-question-circle" aria-hidden="true"></i><div class="tiptext">EXP: players gain experience for playing games, ELO: within a pool of players, apply the ELO algorithm to discover the player's skill ranking</div></div></div>
          <select id="ranking">
            <option value="exp">EXP</option>
            <option value="elo">ELO</option>
          </select>
          <input id="starting_score" type="number" value="0" min="0" max="2000" step="50" style="display:none;"/>
          <button type="submit">Create League</button>
        </form>
      </div>
  `;
  //            <option value="unk" selected>Default</option>

  return html;
}
