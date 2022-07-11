module.exports = (app, mod, game) => {

  let html = `
      <div class="league-component-admin-box">
        <img src="${game.img}">
        
        <form class="league-component-admin-box-form" id="">
          <h2 id="leaguename" contenteditable>${game.modname}</h2>
          <input type="hidden" value="${game.modname}" name="game" id="game">
          <label for="max_players">Limit League Size:</label>
          <input id="max_players" type="number" value="100" min="0" max="500" step="5"/>
          <select id="type">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <select id="ranking">
            <option value="default">Default</option>
            <option value="elo">ELO</option>
            <option value="exp">EXP</option>
          </select>
          <button type="submit">Create League</button>
        </form>
      </div>
  `;

  return html;
}
