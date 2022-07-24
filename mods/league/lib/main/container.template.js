
module.exports = (app, mod) => {

  let html = `
    <div class="league-main-container" id="league-main-container">
      <div id="league-main-container-header" class="">
        <h2>Saito League</h2>
        <p>Create leagues to compete against other players, through rankings, and win prizes</p>
      </div>
      
      <div class="league-main-container-games" id="league-main-container-games">
      </div>
      <div class="league-component-existing-league" id="league-component-existing-league">
        <h2>Current Leagues</h2>
        <p class="para">Join leagues to compete</p>
      </div>
    </div>
  `;

  return html;
}
