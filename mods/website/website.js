const path = require('path');
const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');

class Website extends ModTemplate {

  constructor(app) {
    super(app);

    this.app = app;
    this.name = "Website";

    this.description = "Module that creates a root website on a Saito node.";
    this.categories = "Utilities Communications";
    this.header = null;
    return this;
  }

  initializeHompage(app) {

  }

  
  initializeHTML(app) {
    
  }
  initialize(app) {
  }
  
  webServer(app, expressapp, express) {
    expressapp.use("/", express.static(`${__dirname}/../../mods/website/web`));
    // TODO: change every reference in the site from /website/* to /* and remove this line
    expressapp.use("/website/", express.static(`${__dirname}/../../mods/website/web`));
    expressapp.get('/l/:campaign/:channel/:subchannel', async (req, res) => {
      res.sendFile(path.join(__dirname + '/web/marketing/marketing.html'));
    });
    expressapp.get('/l/matomohelpers.js', async (req, res) => {
      res.sendFile(path.join(__dirname + "../../../mods/matomo/matomoHelpers.js"));
    });
    expressapp.get('/l/maketrackinglink', async (req, res) => {
      res.sendFile(path.join(__dirname + '/web/marketing/linkmakerform.html'));
    });
    expressapp.get('/weixin', async (req, res) => {
      res.sendFile(path.join(__dirname + '/web/weixininvite.html'));
    });
    expressapp.get('/subpagestyle/:subpage/:stylesheetfile', async (req, res) => {
      console.log(req.params.stylesheetfile);
      res.sendFile(path.join(__dirname + '/web/subpage/'  + req.params.subpage + "/" + req.params.stylesheetfile));
    });
    expressapp.get('/website/*', async (req, res) => {
      // use website/* here so that website.js will be initialized, i.e. we are still operating within the website module
      res.sendFile(path.join(__dirname + '/web/subpage/index.html'));
    });
  }

}
module.exports = Website;