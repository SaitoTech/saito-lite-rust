module.exports = LeagueOverlayTemplate = (app, mod, league) => {

    let game_mod = app.modules.returnModuleByName(league.game);

    let html = `
    <div class="league-overlay-container">
        <div class="league-overlay">
            <div class="league-overlay-header">
                <div class="league-overlay-header-image" style="background-image: url('${game_mod?.returnArcadeImg()}')">
                </div>
                <div class="league-overlay-header-title-box">
                    <div class="league-overlay-header-title-box-title">${league.name}</div>
                    <div class="league-overlay-header-title-box-desc">${(league.admin) ? `${game_mod.returnName()} league` : game_mod.returnGameType() }</div>
                </div>
            </div>
            <div class="league-overlay-body">
                <div class="league-overlay-body-content">`;
    if (league.admin){
        html +=  `<div class="saito-user" id="saito-user-${league.admin}" data-id="${league.admin}">
                    <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keychain.returnIdenticon(league.admin)}" data-id="${league.admin}"></div>
                    ${app.browser.returnAddressHTML(league.admin)}
                    <div class="saito-userline" data-id="${league.admin}">${league.contact}</div>
                  </div>`;
    }     

    html +=      `<div class="league-overlay-description">${league.description}</div>
                  <div class="league-overlay-league-body-games">
                      <div class="league-overlay-games-list league_recent_games"></div>
                  </div>
              </div>
                <div class="league-overlay-leaderboard"></div>
            </div>
            <div class="league-overlay-controls">
              <button class="league-overlay-create-game-button saito-button saito-button-primary">create game</button>
            </div>
        </div>
    </div>
 
    `;

    return html;
};



