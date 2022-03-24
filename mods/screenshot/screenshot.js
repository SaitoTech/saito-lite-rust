const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class Screenshot extends ModTemplate {

  constructor(app) {

    super(app);

    this.appname = "Screenshot";
    this.name = "Screenshot";
    this.description = "Games gain the ability to take screenshots and post to forum";
    this.categories = "Utility Entertainment";

  }
  
  respondTo(type = "") {
    if (type == "game-menu") {
      return {
	menus : [ {
          menu_option: {
	    text: "Screenshot",
	    id: "game-screenshot",
            class : "game-screenshot",
            callback : async function(app, game_mod) {
	      game_mod.menu.showSubMenu("game-screenshot");
	    }
          },
	  sub_menu_option: {
            text : "Screenshot Magic",
            id : "game-screenshot-snap",
            class : "game-screenshot-snap",
            callback : async function(app, game_mod) {
              await app.browser.captureScreenshot(function(image) {
                game_mod.app.modules.returnModule("Post").postImage(image, game_mod.returnSlug());
              });
            }
	  },
	} ]
      }
    }
    return null;
  }

}




module.exports = Screenshot;

