module.exports = SaitoModuleBoxTemplate = (game, img_src="/saito/img/dreamscape.png", players_html, title, details, action) => {

  return `
    <div class="saito-module-box" data-id="${game.game.id}">
      <div class="saito-module-box-graphic">
        <img src="${img_src}" class="saito-arcade-game-image">
      </div>
      <div class="saito-module-box-name-container">
        <div class="saito-module-box-name">${title}</div>
        ${players_html}
      </div>

      <div class="saito-module-box-details">
         ${details}
      </div>

      <div class="saito-module-box-action">
        <a href="#" data-sig="${game.game_id}" data-cmd="watch" class="button saito-module-box--btn-${action}">${action}</a>
      </div>
    </div>
  `;

}