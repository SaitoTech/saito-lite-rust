const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');

/*
const redsquareHome = require("./index");
const InviteTemplate = require('../../lib/templates/invitetemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SaitoMobileBar = require('../../lib/saito/new-ui/saito-mobile-bar/saito-mobile-bar')
const RedSquareMain = require('./lib/main');
const Tweet = require('./lib/tweet');
const JSON = require("json-bigint");
const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const prettify = require('html-prettify');
const SaitoLoader = require("../../lib/saito/new-ui/saito-loader/saito-loader");
const PostTweet = require("./lib/post");
const { convertCompilerOptionsFromJson } = require("typescript");
//const { displace } = require("jimp/types");
*/
class RedSquareX extends ModTemplate {

  constructor(app) {

    super(app);
    this.appname = "Red Square X";
    this.name = "RedSquareX";
    this.slug = "redsquarex";
    this.description = "Open Source Twitter-clone for the Saito Network";
    this.categories = "Social Entertainment";
   
    this.redsquare = {}; // where settings go, saved to options file


    this.styles = [
      '/saito/saitox.css',
      '/redsquarex/css/redsquarex-main.css',
    ];

    this.icon_fa = "fas fa-square-full";

    
    return this;

  }


  initialize(app) {

  }

  initializeHTML(app) {
 
  }

  render(app, mod) {
    /*
    if (this.ui_initialized == false) {
      this.main = new RedSquareMain(this.app, this);
      this.header = new SaitoHeader(this.app, this);
      this.mobileBar = new SaitoMobileBar(this.app, this);
      this.addComponent(this.main);
      this.addComponent(this.header);
      this.addComponent(this.mobileBar);
      this.ui_initialized = true;
    }
    */
  }

}

module.exports = RedSquareX;

