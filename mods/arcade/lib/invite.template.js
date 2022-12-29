module.exports = (app, mod, tx=null) => {

    if (tx === null) { return ""; }

    let txmsg = tx.returnMessage();
    if (!txmsg.type) { txmsg.type = "standard"; }
    if (!txmsg.name) { 
      let game_mod = app.modules.returnModule(txmsg.game);
console.log("GAME MOD: " + txmsg.game);
      if (game_mod) { txmsg.name = game_mod.returnName(); }
    }

    let html = `
          <div class="saito-module saito-game" data-id="abcd1234" data-cmd="join" data-name="${txmsg.name}" data-game="${txmsg.game}" style="background-image: url('/${txmsg.game}/img/arcade/arcade.jpg');">
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

    html += `
                <div class="saito-module-identicon identicon-needed tip">
                  <div class="tiptext">You need this player to start the game</div>
                </div>
              </div>
            </div>
          </div>
  `;

  return html;

}


