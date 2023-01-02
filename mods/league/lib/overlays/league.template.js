module.exports = LeagueOverlayTemplate = (app, mod) => {

    let league = mod.leagues[mod.league_idx];
    let game_mod = app.modules.returnModuleByName(league.name);

    let league_name = game_mod.returnName();
    let league_type = "public league"
    let league_desc = game_mod.description;

    return `
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
            <div class="league-overlay-league-body-games-list">
                <h5>Upcoming Games</h5>
                <div class="saito-table">
                    <div class="saito-table-body">
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                    </div>
                </div>
            </div>
            <div class="league-overlay-league-body-games-list">
                <h5>My Recent Games</h5>
                <div class="saito-table">
                    <div class="saito-table-body">
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                    </div>
                </div>
            </div>
            <div class="league-overlay-league-body-games-list">
                <h5>Recent League Matches</h5>
                <div class="saito-table">
                    <div class="saito-table-body">
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                        <div class="saito-table-row">
                            * June 14th, 2022 (vs david@saito)
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="league-overlay-league-body-leaderboard">
            <div class="league-overlay-leaderboard"></div>
        </div>
    </div>
    <div class="league-overlay-controls">
      <button class="league-overlay-create-game-button saito-button saito-button-primary">create game</button>
  </div>
</div>
 
    `;

};



