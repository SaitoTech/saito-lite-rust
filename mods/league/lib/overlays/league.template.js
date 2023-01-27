module.exports = LeagueOverlayTemplate = (app, mod, league_obj) => {

    let league = mod.leagues[mod.league_idx];
    let game_mod = app.modules.returnModuleByName(league.game);

    let league_mod = game_mod.name;
    let league_name = league.name;
    let league_type = "public league"
    let league_desc = game_mod.description;

    let html = `
    <div class="league-overlay-container">
    <div class="league-overlay">
    <div class="league-overlay-header">
        <div class="league-overlay-header-image" style="background-image: url('/${game_mod.returnSlug()}/img/arcade/arcade.jpg')">
        </div>
        <div class="league-overlay-header-title-box">
            <div class="league-overlay-header-title-box-title">${league_name}</div>
            <div class="league-overlay-header-title-box-desc">${league_type}</div>
        </div>
    </div>
    <div class="league-overlay-body">
        <div class="league-overlay-league-body-games">
            <div class="league-overlay-description">${game_mod.description}</div>
        
            <div class="league-overlay-league-body-games-list league_recent_parent_mine">
                <h5>My Recent Games</h5>
                <div class="saito-table league_recent_mine">
                    <div class="saito-table-body ">
                        
                    </div>
                </div>
            </div>
            <div class="league-overlay-league-body-games-list league_recent_parent_others">
                <h5>Recent League Matches</h5>
                <div class="saito-table league_recent_others">
                    <div class="saito-table-body">
                           
                    </div>
                </div>
            </div>
        </div>
        <div class="league-overlay-league-body-leaderboard">
            <div class="league-overlay-leaderboard"></div>
        </div>
    </div>
    <div class="league-overlay-controls">
      <button data-id="${league_mod}" class="league-overlay-create-game-button saito-button saito-button-primary">create game</button>
    </div>
  </div>
</div>
 
    `;

    return html;
};



