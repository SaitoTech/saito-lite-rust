
module.exports = ArcadeMenuTemplate = (app, mod, gamelist) => {

  return `
    <div class="arcade-menu">
      <div class="saito-menu">
        <ul class="saito-menu-list">
          <li id="Arcade" class="saito-menu-header arcade-menu-item${(mod.viewing_game_homepage=="Arcade")?" selected":""}">Arcade</li>
          ${gamelist}  
        </ul>
      </div>
    </div>
  `;

}

