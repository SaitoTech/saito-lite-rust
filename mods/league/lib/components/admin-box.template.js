module.exports = (app, mod, game) => {

  let html = `
      <div class="league-avl-game-item">
        <img src="${game.img}">
        <h2>${game.modname}</h2>
        
        <form type="POST" action="" class="league-main-create-form" id="create-form">
          <input type="hidden" value="${game.modname}" name="game" id="game">
          <select id="type">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button type="submit">Create League</button>
        </form>
      </div>
  `;

  return html;
}
