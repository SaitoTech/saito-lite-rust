/*********************************************************************************

 WEB3 TEASER MODULE 

 This creates a very simple module that can insert itself into the list of visible
 Arcade games, effectively transforming the Arcade into a basic AppStore that allows
 users to click on the game images to fetch the game module.

**********************************************************************************/
const GameTemplate = require('./../../../lib/templates/gametemplate');

class TeaserModule extends GameTemplate {

	constructor(app, name, slug, title, img, link) {

		super(app);

		this.name = name;
		this.slug = slug;
		this.title = title;
		this.gamename = title;
		this.img = img;
		this.link = link;
		this.teaser = true;

	}

}

module.exports = TeaserModule;
