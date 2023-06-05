module.exports = SettlersStatsOverlayTemplate = (stats) => {

    let html = `
      <div class="rules-overlay saitoa">`;

        //Fucking Dice
        html += `<div class="settlers-state-container">`;
        
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


        //
        //Production Log
        //
        let player_html = ``;
        for (let j = 0; j < stats.mod.game.players.length; j++){
          let count = 0;

          let cards_html = `<div class="settlers-stats-resource-container">`;
          for (let r in stats.mod.game.stats.production){          
            cards_html += `<div class="settlers-stats-card"> 
                            <img src="/settlers/img/cards/${r}.png" >
                            <div class="settlers-stats-resource-count">${stats.mod.game.stats.production[r][j]}</div>
                          </div>
            `;

            count += stats.mod.game.stats.production[r][j]
          }

          cards_html += `</div>`;


          player_html += `<div class="settlers-stats-player">${stats.mod.game.playerNames[j]} (Total: ${count})</div>`;
          player_html += `${cards_html}`;

        }

        html += `<div class="settlers-state-container">
                    <div class="settlers-stats-caption">Resources</div>`;
        html += player_html;
        html += `</div>`;


        // //VP Race
        html += `<div class="settlers-state-container">`;
        html += `   <div class="settlers-vp-race-body">`
        
        html += `   </div>
                </div>`;       



      return html+"</div>";

}
