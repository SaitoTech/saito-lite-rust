/**
 * ReactMod: A Saito Module that integrates React Libary as it's UI framework
 * 
 **/

const ModTemplate = require('../../lib/templates/modtemplate');
const HomePage = require('./index');
const React = require('react');
const { createRoot } = require('react-dom/client');
const App = require('./react-components/App').App;

class ReactMod extends ModTemplate {
  constructor(app) {
    super(app);
    this.app = app;
    this.name = 'React';
    this.social = {
      twitter: '@SaitoOfficial',
      title: `🟥 ${this.returnName()}`,
      url: `https://saito.io/${this.returnSlug()}/`,
      description: '',
      image: 'https://saito.tech/wp-content/uploads/2023/11/videocall-300x300.png'
    };
    this.description = 'A placeholder react app';

    this.styles = ['/saito/saito.css', '/react/style.css'];
  }

  onNewBlock(blk) {
    //console.log('new block', blk);
  }

  async initialize(app) {
    await super.initialize(app);
  }




  async render() {
    const rootElement = document.getElementById('root');
    const root = createRoot(rootElement);
    root.render(<App app={this.app} mod={this} />);
    await super.render();
    this.rendered = true;
  }

  webServer(app, expressapp, express) {
    let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
    let mod_self = this;
    expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
      let reqBaseURL = req.protocol + '://' + req.headers.host + '/';
      mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

      if (!res.finished) {
        res.setHeader('Content-type', 'text/html');
        res.charset = 'UTF-8';
        return res.send(HomePage(app, mod_self, app.build_number, mod_self.social));
      }
      return;

    });
      
    expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
  }
}

module.exports = ReactMod;
