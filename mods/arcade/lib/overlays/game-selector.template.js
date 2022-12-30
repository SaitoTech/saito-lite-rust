module.exports = GameSelectorTemplate = (app, mod, element_title = "") => {

  let games_menu = '';
  if (element_title === "") { element_title = "Select Game"; }

  app.modules.respondTo("arcade-games").forEach(module => {
    let modname = module.name;
    let title = (module.gamename) ? module.gamename : module.name;
    let slug = (module.returnSlug()) ? module.slug : module.name.toLowerCase();
    let description = module.description;
    games_menu += `
       <div id="${modname}" class="arcade-game-container" data-id="${modname}">
 	 <div class="arcade-game-image"><img src="/${slug}/img/arcade/arcade.jpg" /></div>
	 <div class="arcade-game-title">${title}</div>
	 <div class="arcade-game-description">${description}</div>
       </div>
     `;
  });

  return `
    <div class="arcade-game-selector-container">
      <div class="header">${element_title}</div>
      <div class="game-list">${games_menu}</div>
    </div>
  `;

}
