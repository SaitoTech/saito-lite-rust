module.exports = GameSelectorTemplate = (app, mod, element_title = "") => {

  let games_menu = '';
  if (element_title === "") { element_title = "Select Game"; }

  app.modules.respondTo("arcade-games").forEach(module => {
    let modname = module.name;
    let title = (module.gamename) ? module.gamename : module.name;
    let slug = (module.returnSlug()) ? module.slug : module.name.toLowerCase();
    let description = module.description;
    games_menu += `
       <div id="${modname}" class="arcade-game-selector-game" data-id="${modname}">
 	 <div class="arcade-game-selector-game-image"><img src="/${slug}/img/arcade/arcade.jpg" /></div>
	 <div class="arcade-game-selector-game-title">${title}</div>
       </div>
     `;
  });


  return `
  <div class="arcade-game-selector">
    ${games_menu}
  </div>
  `;

}
