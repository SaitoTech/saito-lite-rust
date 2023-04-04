module.exports = LeagueOverlayTemplate = (app, mod, league) => {

    let game_mod = app.modules.returnModuleByName(league.game);

    let key = app.keychain.returnKey(app.wallet.returnPublicKey());

    let newPlayer = league.admin && !key.email;

    let html = `
    <div class="league-overlay-container">
        <div class="league-overlay">
            <div class="league-overlay-header">
                <div class="league-overlay-header-image" style="background-image: url('${game_mod?.returnArcadeImg()}')"></div>
                <div class="league-overlay-header-title-box">
                    <div class="league-overlay-header-title-box-title">${league.name}</div>
                    <div class="league-overlay-header-title-box-desc">${(league.admin) ? `${game_mod.returnName()} league` : game_mod.returnGameType() }</div>
                </div>
                <div class="league-overlay-controls">
                    ${(league.admin) ? 
                    `<div id="home" class="menu-icon active-tab"><i class="fas fa-house"></i><div class="menu-text">Home</div></div>
                    <div id="games" class="menu-icon"><i class="fas fa-history"></i><div class="menu-text">Activity</div></div>
                    ${(league.admin === app.wallet.returnPublicKey()) 
                        ? `<div id="players" class="menu-icon"><i class="fas fa-users-cog"></i><div class="menu-text">Manage</div></div>`
                        : `<div id="contact" class="menu-icon"><i class="fas fa-comment-alt"></i><div class="menu-text">Contact</div></div>`}`
                    :""}
                    <!--div class="menu-icon"><i id="league-overlay-create-game-button" class="fas fa-gamepad saito-button-primary"></i><div class="menu-text">Create Game</div></div-->
                </div>
            </div>
            <div class="league-overlay-body">
                <div class="league-overlay-body-content">`;

    html +=      `<div class="league-overlay-description">${league.description}</div>
                  <div class="league-overlay-league-body-games ${(league.admin)?"hidden":""}">
                      <div class="league-overlay-games-list league_recent_games"></div>
                  </div>`;

    if (league.admin){
        
        html +=  `<div id="admin_details" class="saito-user hidden" id="saito-user-${league.admin}" data-id="${league.admin}">
                    <div class="saito-identicon-box"><img class="saito-identicon" src="${app.keychain.returnIdenticon(league.admin)}" data-id="${league.admin}"></div>
                    ${app.browser.returnAddressHTML(league.admin)}
                    <div id="admin_contact" class="saito-userline" data-id="${league.admin}">${league.contact}</div>
                  </div>`;
        if (league.admin == app.wallet.returnPublicKey()){
            html += `<div id="admin-widget" class="admin-widget hidden"></div>`;
        
        }else{
            if (newPlayer || league.unverified){ 
                html += `<div id="admin_note" class="contactAdminWarning">
                            <div>Warning</div>`;
                if (newPlayer){
                    html += `<div class="error_line"><i class="fas fa-exclamation-circle"></i><span>Your account is at risk. <span class="backup_account attention">Enable login</span></span></div>`;
                }
                if (league.unverified){
                    html += `<div class="error_line"><i class="fas fa-exclamation-circle"></i><span>You need to <span class="contact_admin attention">message the admin</span></span></div>`;   
                }
                            

                html +=   `</div>`;
            }else{
                html += `<div id="admin_note" class="hidden">
                        <div>Feel free to reach out to the admin if there are any questions or concerns regarding the league.</div>
                      </div>`;
            }
        }
                  
    }     

    html +=  `</div>
                <div class="league-overlay-leaderboard"></div>
            </div>
            <div class="league-overlay-controls${(newPlayer)? " hidden":""}">
              <button id="league-overlay-create-game-button" class="saito-button saito-button-primary">create game</button>
            </div>
        </div>
    </div>
 
    `;

    return html;
};



