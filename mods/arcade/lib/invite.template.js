module.exports = (app, mod, invite) => {

    let txmsg = invite.tx.returnMessage();

    let html = `

      <div class="saito-module saito-game saito-game-${invite.game_id}" style="background-image: url('/${invite.game_slug}/img/arcade/arcade.jpg');">
        <div class="saito-module-titlebar">
          <span class="saito-module-titlebar-title">${invite.game_name}</span>
          <div class="saito-module-titlebar-details game-type">${(invite.game_type).toUpperCase()}</div>
        </div>
           
        <div class="saito-module-holder">
          <div class="saito-module-details saito-game-identicons">
    `;

    // render players who have joined
    for (let i = 0; i < invite.players.length; i++) {
      html += `

          <div class="tip">
            <img class="saito-module-identicon saito-identicon" id-${invite.players[i]}" src="${app.keys.returnIdenticon(invite.players[i])}">
            <div class="tiptext">
              <div class="saito-address saito-address-${invite.players[i]}" data-id="${invite.players[i]}">${invite.players[i]}</div>
            </div>
          </div>

      `;
    }

    // render players who are requested to join (their slot isnt empty)
    for (let i = 0; i < invite.desired_opponent_publickeys.length; i++) {
      html += `

          <div class="tip requested_player">
            <img class="saito-module-identicon saito-identicon" id-${invite.desired_opponent_publickeys[i]}" src="${app.keys.returnIdenticon(invite.desired_opponent_publickeys[i])}">
            <div class="tiptext">
              <div class="saito-address saito-address-${invite.desired_opponent_publickeys[i]}" data-id="${invite.desired_opponent_publickeys[i]}">${invite.desired_opponent_publickeys[i]}</div>
            </div>
          </div>

      `;
    }
    

    // render empty slots; empty slots =  players needed - (players joined + players requested)
    for (let i = 0; i < invite.empty_slots; i++) {
      html += `
          <div class="saito-module-identicon identicon-needed">
          </div>
      `;
    }

    html += `
          </div>
        </div>
      </div>
    `;

    return html;

}


