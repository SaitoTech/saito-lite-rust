module.exports = GameSchedulerTemplate = (app, mod, element_title = "") => {

  let games_menu = '';
  if (element_title === "") { element_title = "Select Game"; }

  app.modules.respondTo("arcade-games").forEach(module => {
     let title = (module.gamename)? module.gamename: module.name;
     let slug = (module.returnSlug())? module.slug: module.name.toLowerCase();
     let description = module.description;
     games_menu += `
       <div class="redsquare-game-container">
 	 <div class="redsquare-game-image"><img src="/${slug}/img/arcade/arcade.jpg" /></div>
	 <div class="redsquare-game-title">${title}</div>
	 <div class="redsquare-game-description">${description}</div>
       </div>
     `;
  });

  return `
    <div class="redsquare-create-game-header">${element_title}</div>
    <div class="redsquare-create-game-list">${games_menu}</div>
  `;
}
