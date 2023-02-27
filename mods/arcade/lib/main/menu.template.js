module.exports = ArcadeMenuTemplate = (gamelist) => {

  return `
    <div class="arcade-menu">
      <div class="saito-menu">
        <ul class="saito-menu-list">${gamelist}</ul>
      </div>
    </div>
  `;

}

