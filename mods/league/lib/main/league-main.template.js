
module.exports = (app, mod) => {

  let html = `
    <div class="league-main-wrapper">
      <div id="league-main-header" class="saito-contentbox saito-box-shadow mb-2">
        <h2>Saito League</h2>
        <p>Create leagues to compete against other players, through rankings, and win prizes</p>
      </div>
      
      <div class="league-avl-games-container" id="league-avl-games-container">
      </div>
    </div>
  `;

  return html;
}
