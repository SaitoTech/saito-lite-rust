module.exports = GameSelectorTemplate = (app, mod, element_title = "") => {

  let games_menu = '';
  if (element_title === "") { element_title = "Select Game"; }

  app.modules.respondTo("arcade-games").forEach(module => {
     let modname = module.name;
     let title = (module.gamename)? module.gamename: module.name;
     let slug = (module.returnSlug())? module.slug: module.name.toLowerCase();
     let description = module.description;
     games_menu += `
       <div id="${modname}" class="redsquare-game-container" data-id="${modname}">
 	 <div class="redsquare-game-image"><img src="/${slug}/img/arcade/arcade.jpg" /></div>
	 <div class="redsquare-game-title">${title}</div>
	 <div class="redsquare-game-description">${description}</div>
       </div>
     `;
  });

  return `
    <div class="redsquare-game-creator">
      <div class="redsquare-create-game-header">${element_title}</div>
      <div class="redsquare-create-game-list">${games_menu}</div>
    </div>
  `;

}
