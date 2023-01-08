module.exports = (app, mod, tx=null) => {

    if (tx === null) { return ""; }

    let txmsg = tx.returnMessage();

    if (!txmsg.type) { txmsg.type = "standard"; }
    if (!txmsg.name) { 
      let game_mod = app.modules.returnModule(txmsg.game);
      if (game_mod) { txmsg.name = game_mod.returnName(); }
    }

    let originator = txmsg.originator || null;
    let pubkey = app.wallet.returnPublicKey();
    let cmd = 'join';
    let game_id = txmsg.game_id || null;
    let game_type = `${txmsg.type} game`;
    let game_overlay = "join";

    //
    // change game_type 
    //
    if (mod.isMyGame(tx)) {
      game_overlay = "continue";
      if (!mod.isJoined(tx, app.wallet.returnPublicKey())) { 
	game_type = "private invite";
	game_overlay = "open";
      }
    }


    // check if game invite is joined or not
    if (originator != null) {
      cmd = (pubkey == originator) ? 'continue' : 'join'
    } else if (game_id != null) {
      let mine_games = mod.games.mine;
      if (mine_games.length > 0) {
        mine_games.forEach(function(game,key) {
          if (game.msg.game_id == game_id) {
            cmd = 'continue';
            return;
          }
        });
      }
    }


    let html = `
          <div class="saito-module saito-game" data-id="${game_id}" data-overlay="${game_overlay}" data-cmd="${cmd}" data-name="${txmsg.name}" data-game="${txmsg.game}" style="background-image: url('/${txmsg.game}/img/arcade/arcade.jpg');">
            <div class="saito-module-titlebar">
                <span class="saito-module-titlebar-title">${txmsg.name}</span>
                <div class="saito-module-titlebar-details game-type">${(txmsg.type).toUpperCase()} GAME</div>
            </div>
            
            <div class="saito-module-holder">
                <div class="saito-module-details saito-game-identicons">
    `;

    for (let i=0; i < txmsg.players.length; i++) {
        html += `
              <div class="tip">
                <img class="saito-module-identicon saito-identicon" id-${txmsg.players[i]}" src="${app.keys.returnIdenticon(txmsg.players[i])}">
                <div class="tiptext">
                  <div class="saito-address saito-address-${txmsg.players[i]}" data-id="${txmsg.players[i]}">${txmsg.players[i]}</div>
                </div>
              </div>`;
    }

    if (txmsg.players_needed > txmsg.players.length) {
      let missing_slots = txmsg.players_needed - txmsg.players.length;

      for (let i=0; i<missing_slots; i++) {
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


