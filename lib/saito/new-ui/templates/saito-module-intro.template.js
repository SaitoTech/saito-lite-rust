

module.exports = SaitoModuleIntroTemplate = (app, game_mod) => {

  let image = game_mod.respondTo("arcade-games")?.img;
  if (!image){
  	image = "/saito/img/dreamscape.png"; 
  }

  return `
    <div class="saito-module-intro">
      <div class="saito-module-intro-image">
        <img src="${image}">
      </div>

      <div class="saito-module-intro-text">
        <div class="saito-module-intro-title">${game_mod.name}</div>
        <div class="saito-module-intro-description">${game_mod.description}</div>
      </div>
    </div>
  `;

}





