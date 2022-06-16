
module.exports = (app, mod) => {

  let html = `
    <div class="league-main-wrapper">
      <div id="league-main-header" class="saito-contentbox saito-box-shadow mb-2">
        <h2>Create a league</h2>
        <p>Create leagues to compete against other players, through rankings, and win prizes</p>
      </div>
      
      <div class="league-avl-games-container">
  `;

  if (typeof mod.games != 'undefined' && mod.games.length > 0) {
    for (var i=0; i<mod.games.length; i++){
        let game = mod.games[i];

        html += `
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
    }
  } else {
    html += `
          <h3> No games avilable in arcade for creating a league.</h3>
    `;
  }

  html += ` 
      </div>
    </div>
  `;

  return html;
}
