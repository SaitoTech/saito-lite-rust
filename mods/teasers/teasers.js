const saito = require("./../../lib/saito/saito");
const TeaserModule = require("./lib/teasermodule");
const ModTemplate = require("../../lib/templates/modtemplate");
const JSON = require("json-bigint");


class Teasers extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "Teasers";
    this.slug = "teasers";
    this.appname = "Teasers";
    this.description = "Teaser Applications for the Arcade / Appstore";
    this.categories = "Finance Utilities";
    this.icon = "fas fa-wallet";
    this.class = 'utility';

    this.teasers = [
      { name : "HereIStand" , slug : "his" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Here I Stand" , link : "https://wiki.staging.saito.io/tech/applications/his" } 		,
      { name : "Blackjack" , slug : "blackjack" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Blackjack" , link : "https://wiki.staging.saito.io/tech/applications/blackjack" }	,
      { name : "Chess" , slug : "chess" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Chess" , link : "https://wiki.staging.saito.io/tech/applications/chess" }			,
      { name : "Hearts" , slug : "hearts" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Hearts" , link : "https://wiki.staging.saito.io/tech/applications/hearts" }			,
      { name : "Imperium" , slug : "imperium" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Red Imperium" , link : "https://wiki.staging.saito.io/tech/applications/imperium" }	,
      { name : "Quake3" , slug : "quake3" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Quake3" , link : "https://wiki.staging.saito.io/tech/applications/quake3" }			,
      { name : "Poker" , slug : "poker" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Poker" , link : "https://wiki.staging.saito.io/tech/applications/poker" }			,
      { name : "SaitoMania" , slug : "saitomania" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Saito Mania" , link : "https://wiki.staging.saito.io/tech/applications/saitomania" }	,
      { name : "Scotland" , slug : "scotland" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Scotland" , link : "https://wiki.staging.saito.io/tech/applications/scotland" }		,
      { name : "Settlers" , slug : "settlers" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Settlers" , link : "https://wiki.staging.saito.io/tech/applications/settlers" }		,
      { name : "Shogun" , slug : "shogun" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Shogun" , link : "https://wiki.staging.saito.io/tech/applications/shogun" }			,
      { name : "Solitrio" , slug : "solitrio" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Solitrio" , link : "https://wiki.staging.saito.io/tech/applications/solitrio" }		,
      { name : "Spider" , slug : "spider" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Spider" , link : "https://wiki.staging.saito.io/tech/applications/spider" }			,
      { name : "Thirteen" , slug : "thirteen" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Thirteen" , link : "https://wiki.staging.saito.io/tech/applications/thirteen" }		,
      { name : "Twilight" , slug : "twilight" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Twilight" , link : "https://wiki.staging.saito.io/tech/applications/twilight" }		,
      { name : "Wordblocks" , slug : "wordblocks" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Wordblocks" , link : "https://wiki.staging.saito.io/tech/applications/wordblocks" }	,
      { name : "Wuziqi" , slug : "wuziqi" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Wuziqi" , link : "https://wiki.staging.saito.io/tech/applications/wuziqi" }			,
    ];

  }


  async initialize(app) {

    await super.initialize(app);

    //
    // create teaser module
    //
    for (let z = 0; z < this.teasers.length; z++) {
      let t = this.teasers[z];
      let install_this = true;
      for (let zz = 0; zz < app.modules.mods.length; zz++) {
	if (app.modules.mods[zz].name == t.name) {
	  install_this = false;
	}
      }
      if (install_this == true) {
        let tm = new TeaserModule(this.app, t.name, t.slug, t.title, t.img, t.link);
        tm.img = t.img;
        await tm.installModule(app);
        app.modules.mods.push(tm);
      }
    }
    
  }

}

module.exports = Teasers;
