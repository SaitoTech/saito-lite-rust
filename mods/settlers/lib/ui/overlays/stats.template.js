module.exports = SettlersStatsOverlayTemplate = (stats) => {

    let html = `
      <div class="rules-overlay saitoa">`;


        //Fucking Dice
        html += `<div class="settlers-state-container">
<!--                  <div class="settlers-stats-player">Dice Rolls</div> -->
        `;
        
        html += `<div class="settlers-dice-histogram">`
        for (let i = 2; i <= 12; i++){
          html += `  <div class="settlers-dice-bar dice-${i}" data-dice-rolls="${i}">
                      <div class="settlers-dice-count">${stats.mod.game.stats.dice[i]}</div>
                    </div>`;
        }
        html += `</div>`

        html += `<div class="settlers-dice-numbers">`
        for (let i = 2; i <= 12; i++){
          html += `<div class="settlers-dice-number">${i}</div>`;
        }
        html += `</div>
                </div>
        `;

        let players_count = stats.mod.game.state.players.length;


        //VP Race
        if (players_count >= 3) {
          html += `<div class="settlers-state-container combined-player-stats">`;
        }

        html += `<div class="settlers-state-container ${(players_count >= 3) ? `vp-3p` : `` }">`;
        //Sort players by VP
        let ranking_scores = [stats.mod.game.state.players[0].vp];
        let ranking_players = [0];
        for (let i = 1; i < stats.mod.game.state.players.length; i++){
          let j = 0;
          for (; j < ranking_scores.length; j++){
            if (stats.mod.game.state.players[i].vp > ranking_scores[j]){
              break;
            }
          }
          ranking_scores.splice(j,0,stats.mod.game.state.players[i].vp);
          ranking_players.splice(j,0,i);
        }
        for (let i = 0; i < ranking_scores.length; i++){
          let player = ranking_players[i];
          let numVil = 0;
          let numCity = 0;
          for (let j = 0; j < stats.mod.game.state.cities.length; j++) {
            if (stats.mod.game.state.cities[j].player === player + 1) {
              if (stats.mod.game.state.cities[j].level == 1){
                numVil++;
              }else{
                numCity++;
              }
            }
          }

          let longest_road = 

          html += ` <div class="settlers-stats-player p${stats.mod.game.colors[player]}">${stats.mod.game.playerNames[player]} (${ranking_scores[i]} Victory Points)</div>`;
          html += ` <div class="settlers-stats-vp-row ${(players_count >= 3) ? `vp-3p` : `` }">
                      <div class="settlers-stats-vp settlers-stats-village" title="Village">
                        <img src="/settlers/img/icons/village.png">
                        <div class="settlers-stats-vp-count">${numVil}</div>
                      </div>
                      <div class="settlers-stats-vp settlers-stats-city${numCity ? "":" no-vp"}" title="City">
                        <img src="/settlers/img/icons/city.png">
                        <div class="settlers-stats-vp-count">${numCity}</div>
                        <div class="settlers-stats-multiplier">&times;2</div>
                      </div>
                      <div class="settlers-stats-vp settlers-stats-vpc${stats.mod.game.state.players[player].vpc ? "":" no-vp"}" title="Victory Point Card">${stats.mod.vp.img} <div class="settlers-stats-vp-count">${stats.mod.game.state.players[player].vpc}</div></div>
                      <div class="settlers-stats-vp settlers-stats-largest-road${(stats.mod.game.state.longestRoad.player == player + 1) ? "":" no-vp"}" title="Largest Road">
                        ${stats.mod.longest.svg}
                        <div class="settlers-stats-vp-count">${(stats.mod.game.state.longestRoad.player == player + 1)? 2 :0}</div>
                        <div class="settlers-stats-multiplier">+2</div>
                      </div>
                      <div class="settlers-stats-vp settlers-stats-largest-army${(stats.mod.game.state.largestArmy.player == player + 1) ? "":" no-vp"}" title="Largest Army">
                        ${stats.mod.s.img}
                        <div class="settlers-stats-vp-count">${stats.mod.game.state.players[player].knights}</div>
                        <div class="settlers-stats-multiplier">+2</div>
                      </div>
                    </div>`;
        }
       
        html += `</div>`


        //
        //Production Log
        //
        let player_html = ``;
        for (let j = 0; j < stats.mod.game.players.length; j++){
          let count = 0;

          let cards_html = `<div class="settlers-stats-resource-container ${(players_count >= 3) ? `vp-3p` : `` }">`;
          for (let r in stats.mod.game.stats.production){          
            cards_html += `<div class="settlers-stats-card"> 
                            <img src="/settlers/img/cards/${r}.png" >
                            <div class="settlers-stats-resource-count">${stats.mod.game.stats.production[r][j]}</div>
                          </div>
            `;

            count += stats.mod.game.stats.production[r][j]
          }

          cards_html += `</div>`;


          player_html += `<div class="settlers-stats-player p${stats.mod.game.colors[j]}">${stats.mod.game.playerNames[j]} (${count} resources)</div>`;
          player_html += `${cards_html}`;

        }

        html += `<div class="settlers-state-container">
                    `;
        html += player_html;
        html += `</div>`;

        if (players_count >= 3) {
          html += `</div>`;
        }


      return html+"</div>";

}
