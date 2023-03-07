module.exports = (app, mod, invite) => {

    
    let datetime = app.browser.formatDate(invite.time_finished);
    let date = datetime.month + ' ' + datetime.day + ', ' + datetime.year; 

    let players_html = `<div class="league_recent_players_list">`;
    // render players who have joined
    for (let i = 0; i < invite.players.length; i++) {
      players_html += `
          <div class="league_recent_player${invite.winner?.includes(invite.players[i])?" winner":""}"><img class="saito-module-identicon saito-identicon" id-${invite.players[i]}" src="${app.keychain.returnIdenticon(invite.players[i])}"></div>

      `;
    }
    players_html += "</div>";

    return `
        <div class="saito-table-row league_recent_game" id="saito-game-${invite.game_id}">
          <div class="league_recent_date">${date}</div>${players_html}<div class="league_recent_cause">${invite.method?invite.method:""}</div>
        </div>
    `;;

}


