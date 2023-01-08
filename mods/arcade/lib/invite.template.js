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

    for (let i = 0; i < txmsg.players.length; i++) {

      html += `

            <div class="tip">
              <img class="saito-module-identicon saito-identicon" id-${txmsg.players[i]}" src="${app.keys.returnIdenticon(txmsg.players[i])}">
              <div class="tiptext">
                <div class="saito-address saito-address-${txmsg.players[i]}" data-id="${txmsg.players[i]}">${txmsg.players[i]}</div>
              </div>
            </div>

      `;

    }

    if (txmsg.players_needed > txmsg.players.length) {

      let missing_slots = txmsg.players_needed - txmsg.players.length;

      for (let i = 0; i < missing_slots; i++) {

        html += `
            <div class="saito-module-identicon identicon-needed">
            </div>
        `;

      }

    }

    html += `
          </div>
        </div>
      </div>
    `;

    return html;

}


