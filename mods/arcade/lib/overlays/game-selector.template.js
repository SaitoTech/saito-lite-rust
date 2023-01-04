module.exports = GameSelectorTemplate = (app, mod, element_title = "") => {

  let games_menu = '';
  if (element_title === "") { element_title = "Select Game"; }

  app.modules.respondTo("arcade-games").forEach(module => {
    let modname = module.name;
    let title = (module.gamename) ? module.gamename : module.name;
    let slug = (module.returnSlug()) ? module.slug : module.name.toLowerCase();
    let description = module.description;
    games_menu += `
       <div id="${modname}" class="game-selector-container" data-id="${modname}">
 	 <div class="game-selctor-game-image"><img src="/${slug}/img/arcade/arcade.jpg" /></div>
    <div class="game-selector-game-description"></div>
	 <div class="game-selector-game-title">${title}</div>
       </div>
     `;
  });

  return `
  <div class="saito-modal">
  <h6>${element_title}</h6>
  <div class="saito-modal-content">
  <div class="game-selector-game-list">${games_menu}</div>
  </div>
  </div>
  `;

}
