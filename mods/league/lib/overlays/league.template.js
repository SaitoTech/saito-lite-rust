module.exports = LeagueOverlayTemplate = async (app, mod, league) => {
  let game_mod = app.modules.returnModuleByName(league.game);

  let key = app.keychain.returnKey(await app.wallet.getPublicKey());

  let newPlayer = league.admin && !key.email && league.admin !== (await app.wallet.getPublicKey());

  let html = `
    <div class="league-overlay-container">
        <div class="league-overlay">
            <div class="league-overlay-header">
                <div class="league-overlay-header-image" style="background-image: url('${game_mod?.returnArcadeImg()}')"></div>
                <div class="league-overlay-header-title-box">
                    <div class="league-overlay-header-title-box-title">${league.name}</div>
                    <div class="league-overlay-header-title-box-desc">${
                      league.admin ? `${game_mod.returnName()} league` : game_mod.returnGameType()
                    }</div>
                </div>
                <div class="league-overlay-controls">
                    <div id="home" class="menu-icon active-tab"><i class="fas fa-house"></i><div class="menu-text">Home</div></div>
                    <div id="games" class="menu-icon"><i class="fas fa-history"></i><div class="menu-text">Activity</div></div>`;

  if (league.admin) {
    html +=
      league.admin === app.wallet.publicKey
        ? `<div id="players" class="menu-icon"><i class="fas fa-users-cog"></i><div class="menu-text">Manage</div></div>`
        : `<div id="contact" class="menu-icon"><i class="fas fa-comment-alt"></i><div class="menu-text">Contact</div></div>`;
  }

  html += `   </div>
            </div>
            <div class="league-overlay-body">
                <div class="league-overlay-body-content">
                    <div class="league-overlay-description league-overlay-content-box ${
                      newPlayer || league.unverified ? "hidden" : ""
                    }">${league.description}</div>
                    <div class="league-overlay-league-body-games league-overlay-content-box hidden">
                        <div class="league-overlay-games-list league_recent_games"></div>
                    </div>`;

  if (league.admin) {
    if (league.admin == app.wallet.publicKey) {
      html += `<div id="admin-widget" class="admin-widget league-overlay-content-box hidden"></div>`;
    } else {
      html += `<div id="admin_details" class="saito-user league-overlay-content-box hidden" id="saito-user-${
        league.admin
      }" data-id="${league.admin}">
                        <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keychain.returnIdenticon(
                          league.admin
                        )}" data-id="${league.admin}"></div>
                        ${app.browser.returnAddressHTML(league.admin)}
                        <div id="admin_contact" class="saito-userline" data-id="${league.admin}">${
        league.contact
      }</div>
                    </div>`;

      if (newPlayer || league.unverified) {
        html += `<div id="admin_welcome" class="league-overlay-content-box">${league.welcome}</div>`;

        html += `<div id="admin_note" class="contactAdminWarning league-overlay-content-box">
                            <div>Warning</div>`;
        if (newPlayer) {
          html += `<div class="error_line"><i class="fas fa-exclamation-triangle"></i><span>Your account is at risk. <span class="backup_account attention">Enable login</span></span></div>`;
        }
        if (league.unverified) {
          html += `<div class="error_line"><i class="fas fa-exclamation-triangle"></i><span>You need to <span class="contact_admin attention">message the admin</span></span></div>`;
        }

        html += `</div>`;
      }
    }
  }

  html += `
            <div class="league-overlay-controls${newPlayer || league.unverified ? " hidden" : ""}">
              <button id="league-overlay-create-game-button" class="saito-button saito-button-primary">create game</button>
            </div>

            </div>
                <div class="league-overlay-leaderboard league-overlay-content-box"></div>
            </div>
        </div>
    </div>
 
    `;

  return html;
};
