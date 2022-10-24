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
    expressapp.get('/website/*', async (req, res) => {
      // use website/* here so that website.js will be initialized, i.e. we are still operating within the website module
      res.sendFile(path.join(__dirname + '/web/subpage/index.html'));
    });
  }
}
module.exports = Website;
