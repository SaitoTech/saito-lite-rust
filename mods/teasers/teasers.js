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
      { name : "HereIStand" , slug : "his" , img : "https://staging.saito.io/his/img/arcade/arcade.jpg" , title : "Here I Stand" , link : "https://wiki.saito.io/tech/applications/his" } 		,
      { name : "Nintendo" , slug : "nwasm" , img : "https://staging.saito.io/nwasm/img/arcade/arcade.jpg" , title : "Nintendo" , link : "https://wiki.saito.io/tech/applications/nwasm" }	,
      { name : "Blackjack" , slug : "blackjack" , img : "https://staging.saito.io/blackjack/img/arcade/arcade.jpg" , title : "Blackjack" , link : "https://wiki.saito.io/tech/applications/blackjack" }	,
      { name : "Chess" , slug : "chess" , img : "https://staging.saito.io/chess/img/arcade/arcade.jpg" , title : "Chess" , link : "https://wiki.saito.io/tech/applications/chess" }			,
      { name : "Hearts" , slug : "hearts" , img : "https://staging.saito.io/hearts/img/arcade/arcade.jpg" , title : "Hearts" , link : "https://wiki.saito.io/tech/applications/hearts" }			,
      { name : "Imperium" , slug : "imperium" , img : "https://staging.saito.io/imperium/img/arcade/arcade.jpg" , title : "Red Imperium" , link : "https://wiki.saito.io/tech/applications/imperium" }	,
      { name : "Quake3" , slug : "quake3" , img : "https://staging.saito.io/quake3/img/arcade/arcade.jpg" , title : "Quake3" , link : "https://wiki.saito.io/tech/applications/quake3" }			,
      { name : "Poker" , slug : "poker" , img : "https://staging.saito.io/poker/img/arcade/arcade.jpg" , title : "Poker" , link : "https://wiki.saito.io/tech/applications/poker" }			,
      { name : "SaitoMania" , slug : "saitomania" , img : "https://staging.saito.io/saitomania/img/arcade/arcade.jpg" , title : "Saito Mania" , link : "https://wiki.saito.io/tech/applications/saitomania" }	,
      { name : "Scotland" , slug : "scotland" , img : "https://staging.saito.io/scotland/img/arcade/arcade.jpg" , title : "Scotland" , link : "https://wiki.saito.io/tech/applications/scotland" }		,
      { name : "Settlers" , slug : "settlers" , img : "https://staging.saito.io/settlers/img/arcade/arcade.jpg" , title : "Settlers" , link : "https://wiki.saito.io/tech/applications/settlers" }		,
      { name : "Shogun" , slug : "shogun" , img : "https://staging.saito.io/shogun/img/arcade/arcade.jpg" , title : "Shogun" , link : "https://wiki.saito.io/tech/applications/shogun" }			,
      { name : "Solitrio" , slug : "solitrio" , img : "https://staging.saito.io/solitrio/img/arcade/arcade.jpg" , title : "Solitrio" , link : "https://wiki.saito.io/tech/applications/solitrio" }		,
      { name : "Spider" , slug : "spider" , img : "https://staging.saito.io/spider/img/arcade/arcade.jpg" , title : "Spider" , link : "https://wiki.saito.io/tech/applications/spider" }			,
      { name : "Thirteen" , slug : "thirteen" , img : "https://staging.saito.io/thirteen/img/arcade/arcade.jpg" , title : "Thirteen" , link : "https://wiki.saito.io/tech/applications/thirteen" }		,
      { name : "Twilight" , slug : "twilight" , img : "https://staging.saito.io/twilight/img/arcade/arcade.jpg" , title : "Twilight" , link : "https://wiki.saito.io/tech/applications/twilight" }		,
      { name : "Wordblocks" , slug : "wordblocks" , img : "https://staging.saito.io/wordblocks/img/arcade/arcade.jpg" , title : "Wordblocks" , link : "https://wiki.saito.io/tech/applications/wordblocks" }	,
      { name : "Wuziqi" , slug : "wuziqi" , img : "https://staging.saito.io/wuziqi/img/arcade/arcade.jpg" , title : "Wuziqi" , link : "https://wiki.saito.io/tech/applications/wuziqi" }			,
    ];

  }


  async initialize(app) {

console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$ modules ");
console.log("$");
console.log(JSON.stringify(app.options.modules));

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

	let dupe_mod = false;

	for (let i = 0; i < this.app.modules.mods.length; i++) {
	  if (this.app.modules.mods[i].name === t.name) { dupe_mod = true; }
	}
	for (let i = 0; i < this.app.options.modules.length; i++) {
	  if (this.app.options.modules[i].name === t.name) { dupe_mod = true; }
	}

	if (dupe_mod == false) {
console.log("adding teaser: " + t.name);
          let tm = new TeaserModule(this.app, t.name, t.slug, t.title, t.img, t.link);
          tm.img = t.img;
          await tm.installModule(app);
          app.modules.mods.push(tm);
        }

      }
    }
    
  }

}

module.exports = Teasers;
