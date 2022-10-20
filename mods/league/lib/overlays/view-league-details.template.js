module.exports = ViewLeagueDetailsTemplate = (app, mod, league) => {

  if (!league){
    return "";
  }

  // let html = `<div class="league-details-overlay">
    
  //   <h2>${league.name}</h2>
     
  //   <p>${league.description}</p>
  //   <div class="league-overview-box">
  //     <div>Game:</div><div>${(league.game)?league.game:"All"}</div>
  //     <div>Players:</div><div>${league.playerCnt}${league.max_players > 0 ? ` / ${league.max_players}`:""}</div>
  //     <div>Type:</div><div>${league.type}</div>
  //     <div>Ranking Algo:</div><div>${league.ranking}</div>
  //     <div>Admin:</div><div>${app.keys.returnUsername(league.admin)}</div>
  //   </div>`;

  //   //Add btn to query games
  //   html += `<div><button type="button" id="game-leaderboard-toggle" class="view_leaderboard">Show Recent Games</button></div>`;

  //   //Show League dates
  //   if (league.startdate || league.enddate){
  //     html += `<div class="season-dates">${league.startdate} --- ${league.enddate}</div>`;
  //   }
  //   //Show League Options
  //   if (league.options){
  //     html += `<div class="info-header">All matches in this league use the following game options:</div>
  //     <div class="gameShortDescription">${makeDescription(app, league.game, JSON.parse(league.options))}</div>`;
  //   }

  //   if (app.modules.returnActiveModule().name == "Arcade" && league.game && league.myRank > 0 && league.admin !== "saito"){
  //     if (mod.checkDate(league.enddate) && mod.checkDate(league.startdate, true)){
  //       html += `<div><button type="button" id="game-invite-btn" class="game-invite-btn" >Create Game</button></div>`;
  //     }
  //   }
  //   html += `<div id="league-leaderboard" class="league-leaderboard">
  //     <div class="leaderboard-spinner loader"></div>
  //   </div>
    
  //   <div class="btn-controls-box">`;
  //   //Available space in the league
  //   if (league.max_players == 0 || league.playerCnt < league.max_players){
  //     if (mod.checkDate(league.startdate) || league.allowlate){
  //       if (league.myRank <=0){
  //         html += `<button class='button' id='join-btn'>JOIN</button>`;
  //       }
  //       if (app.wallet.returnPublicKey() == league.admin){
  //        html += `<button class='button' id='invite-btn'>INVITE</button>`; 
  //       }
  //     }
  //   }
  //   html += `</div>`;
    
    
  // html += `</div>`;

  let html = `

  <style>
    .league-details-overlay {
      width: 85vw;
      padding: 1.5rem;
      height: 85vh;
    }

    .leaderboard-box {
      display: grid;
      grid-gap: 0.5rem;
      grid-template-columns: 65% 34%;
      width: 100%;
      height: 100%;
    }

    .leaderboard-details-box {
      padding-right: 1rem;
      margin-right: 2rem;
    }

    .saito-module-details-box {
      margin-left: 1rem;
    }

    #leaderboard-btn-create-game {
      display: inline-block;
      width: 22rem;
    }

    .saito-tool-tip {
      width: 3rem;
      height: 3rem;
      border-radius: 1.5rem;
      color: #fff;
      text-align: center;
      line-height: 3rem;
      font-weight: bold;
      display: inline-block;
      border: 1px solid var(--saito-primary);
      color: var(--saito-primary);
      cursor: pointer;
    }

    .observer-sidebar {
      margin-top: 1.5rem;
    }

    .observer-sidebar h6 {
      font-size: 2.2rem;
      margin-bottom: 0.8rem;
      display: inline-block;
      color: var(--saito-black-faded);
    }

    .recent-games-box {
      display: grid;
      grid-column-gap: 2rem;
    }

    .saito-module-custom-box {
      min-width: 20rem;
    }

    .saito-table {
      position: relative;
      padding-top: 3rem; 
    }

    .saito-table-header {
      display: grid;
      grid-template-columns: 4rem auto 5rem 4.5rem 4.5rem;
      grid-column-gap: 1rem;
      margin-bottom: 1rem;
      position: absolute;
      left: 0px;
      top: 0px;
      width: 100%;
      text-align: center;
    }

    .saito-table-body {
      height: auto;
      overflow-y: scroll;
      height: 78vh;
      position: relative;
      overflow-y: scroll;
      text-align: center;
    }

    .saito-table-row {
      display: grid;
      display: grid;
      grid-template-columns: 4rem auto 5rem 4.5rem 4.5rem;
      grid-column-gap: 1rem;
      margin-bottom: 0.5rem;
      background-color: var(--saito-gray);
    }

    .saito-table::-webkit-scrollbar {
      width: 0px;
    }
  </style>

    <div class="league-details-overlay">
      <div class="leaderboard-box">
        
        <div class="leaderboard-details-box">
          <div class="saito-module large">
            <div class="saito-module-image-box">
              <div class="saito-module-image"></div>
            </div>
            <div class="saito-module-details-box">
              <div class="saito-module-title">Saitolicious</div>
              <div class="saito-module-description">Who is the most Saitolicious Saitozen out there? Earn points for playing games on the Arcade and climb the rankings, but your score will drop if you don't come by regularly.</div>
            </div>
          </div>
          <div id="leaderboard-btn-create-game" class="saito-button-secondary small">Create game</div>
          <div class="saito-tool-tip">?</div>
          <div class="saito-tool-tip">h</div>
      
        
        <div id="rs-sidebar-observer" class="observer-sidebar">
          <h6>My games</h6>
          <div class="recent-games-box">
            <div class="saito-module-x" id="saito-module-x-d030499d6b21b3f655045d3a0b4838e39e19acf07ac051a6506216eaccb7e93923efc5b617f09245c14cd12c23cd04485fa338bf1639e282e128bb32bd85dd2c" data-id="d030499d6b21b3f655045d3a0b4838e39e19acf07ac051a6506216eaccb7e93923efc5b617f09245c14cd12c23cd04485fa338bf1639e282e128bb32bd85dd2c">
              <div class="saito-module small" data-payload="">
                <div class="saito-module-image-box">
                  <div class="saito-module-image" style="background-image: url('/wordblocks/img/arcade/arcade.jpg');background-size: cover;"></div>
                </div>
                <div class="saito-module-details-box">
                  <div class="saito-module-title">Wordblocks</div>
                  <div class="saito-module-description">
                    <div class="saito-module-description-identicon-box">
                      <div class="saito-module-identicon-box tip id-pg8HieCxDV8JLbGjBVSogK6muoYLpSRPpoQTwuaxziMF"><img class="saito-module-identicon small" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgzOCwxMTksMjE3LDEpOyBzdHJva2U6cmdiYSgzOCwxMTksMjE3LDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScyNTInIHk9JzAnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSc4NCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMjUyJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PScwJyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PC9nPjwvc3ZnPg==">
                        <div class="tiptext">
                          <div class="saito-address saito-address-pg8HieCxDV8JLbGjBVSogK6muoYLpSRPpoQTwuaxziMF" data-id="pg8HieCxDV8JLbGjBVSogK6muoYLpSRPpoQTwuaxziMF">pg8HieCxDV8JLbGjBVSogK6muoYLpSRPpoQTwuaxziMF</div>
                        </div>
                      </div>
                      <div class="saito-module-identicon-box tip id-dJj3s9LnvgHxVsDWZ4cCyrUBBwnkQFfEEe28tUMRAi9k"><img class="saito-module-identicon small" src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nNDIwJyBzdHlsZT0nYmFja2dyb3VuZC1jb2xvcjpyZ2JhKDI0MCwyNDAsMjQwLDEpOyc+PGcgc3R5bGU9J2ZpbGw6cmdiYSgzOCwyMTcsMTcyLDEpOyBzdHJva2U6cmdiYSgzOCwyMTcsMTcyLDEpOyBzdHJva2Utd2lkdGg6Mi4xOyc+PHJlY3QgIHg9JzE2OCcgeT0nMTY4JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzI1Micgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nODQnIHk9JzMzNicgd2lkdGg9Jzg0JyBoZWlnaHQ9Jzg0Jy8+PHJlY3QgIHg9JzI1MicgeT0nMzM2JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nODQnIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjxyZWN0ICB4PSczMzYnIHk9Jzg0JyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMCcgeT0nMjUyJyB3aWR0aD0nODQnIGhlaWdodD0nODQnLz48cmVjdCAgeD0nMzM2JyB5PScyNTInIHdpZHRoPSc4NCcgaGVpZ2h0PSc4NCcvPjwvZz48L3N2Zz4=">
                        <div class="tiptext">
                          <div class="saito-address saito-address-dJj3s9LnvgHxVsDWZ4cCyrUBBwnkQFfEEe28tUMRAi9k" data-id="dJj3s9LnvgHxVsDWZ4cCyrUBBwnkQFfEEe28tUMRAi9k">dJj3s9LnvgHxVsDWZ4cCyrUBBwnkQFfEEe28tUMRAi9k</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="saito-module-custom-box"> <a href="#" class="saito-module-action watch" id="saito-module-action-d030499d6b21b3f655045d3a0b4838e39e19acf07ac051a6506216eaccb7e93923efc5b617f09245c14cd12c23cd04485fa338bf1639e282e128bb32bd85dd2c" data-cmd="watch" data-id="d030499d6b21b3f655045d3a0b4838e39e19acf07ac051a6506216eaccb7e93923efc5b617f09245c14cd12c23cd04485fa338bf1639e282e128bb32bd85dd2c">Details</a>
                  <div class="saito-module-option">standard game</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- leaderboard-box end -->

        <div class="saito-table">
          <div class="saito-table-header">
            <div><b>Rank</b></div>
            <div><b>Player</b></div>
            <div><b>Score</b></div>
            <div><b>Win</b></div>
            <div><b>Loss</b></div>
          </div>
          <div class="saito-table-body">
            <div class="saito-table-row">
              <div>1</div>
              <div class=" newfriend" data-id="22cEMK37H3HCiR6AgWBsTPDr9ywfT8zXAareeK9L2HUmU">22cEMK37H3HCiR6AgWBsTPDr9ywfT8zXAareeK9L2HUmU</div>
              <div class="">152058</div>
              <div class="">2</div>
              <div class="">2</div>
            </div>
          </div>
        </div>

    </div>
    <!-- league-details-overlay -->
  `;  


  return html;
}


//Adapted from arcade-invite.template.js
let makeDescription = (app, game, options) => {

  let html = '';
  let gameModule = app.modules.returnModule(game);
  if (gameModule && gameModule !== "Arcade") {
    let sgoa = gameModule.returnShortGameOptionsArray(options);
    for (let i in sgoa) {
      html += `<div class="gameShortDescriptionRow"><div class="gameShortDescriptionKey">${i.replace(/_/g, ' ')}`;
      if (sgoa[i] !== null){
        html += `: </div><div class="gameShortDescriptionValue">${sgoa[i]}</div></div>`;
      }else{
        html += `</div></div>`
      }
    }
  }
  
  return html;

}
