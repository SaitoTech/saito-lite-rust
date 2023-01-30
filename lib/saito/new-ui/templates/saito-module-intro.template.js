

module.exports = SaitoModuleIntroTemplate = (app, game_mod, short_descr = true) => {

  let html =  `
    <div class="saito-module-intro">
      <div class="saito-module-intro-image" style="background-image:url('${game_mod.returnArcadeImg()}');"></div>
      <div class="saito-module-intro-text">
        <div class="saito-module-intro-title">${game_mod.gamename || game_mod.name}</div>
        <div class="saito-module-intro-description">${game_mod.description}</div>`;

  if (!short_descr){
    html += `<div class="saito-module-intro-details">${parseDetails(game_mod)}</div>`;
  }
  if (game_mod.publisher_message){
    html += `<div class="saito-module-intro-note">${game_mod.publisher_message}</div>`
  }

  html+=
      `</div>
    </div>
  `;

  return html;
}


const parseDetails = (game_mod) => {
  let html = `<div class="detail_row">${game_mod.categories.substring(6)}</div>`;
  html += `<div class="detail_row"><i class="fas fa-user-friends"></i>: ${game_mod.minPlayers}${(game_mod.minPlayers!=game_mod.maxPlayers)?`-${game_mod.maxPlayers}`:""}</div>`;
  html += `<div class="detail_row"><i class="far fa-clock"></i>: ${game_mod.game_length} minutes</div>`;

  return html;
}



