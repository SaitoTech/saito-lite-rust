
module.exports = (app, mod) => {

  let html = `
    <div class="league-main-container" id="league-main-container">
      <div id="league-main-container-header" class="container-header">
        <h1>Saito League</h1>
        <p>Create leagues to compete against other players, through rankings, and win prizes</p>
      </div>
      <div></div>
      
      <div class="league-main-container-games" id="league-main-container-games">
        <h2>Create a New League</h2>
        <p class="para">Select a game to get started</p>
      </div>
      <div class="league-component-existing-league" id="league-component-existing-league">
        <h2>Current Leagues</h2>
        <p class="para">Join leagues to compete</p>
      </div>
    </div>
  `;

  return html;
}
