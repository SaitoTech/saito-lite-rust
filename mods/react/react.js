const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const HomePage = require('./index');
const React  = require('react');
const { createRoot } = require('react-dom/client');
const App = require('./react-components/App').default;


require('@babel/register')({
    presets: ['@babel/preset-env', '@babel/preset-react']
});



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
        this.description =
            '';
    }


    render() {
        const rootElement = document.getElementById('root');
        const root = createRoot(rootElement);
        root.render(<App app={this.app} />);
    }



    webServer(app, expressapp, express) {
        let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
        let mod_self = this;
        expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
            let reqBaseURL = req.protocol + '://' + req.headers.host + '/';
            mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());

            res.setHeader('Content-type', 'text/html');
            res.charset = 'UTF-8';

            res.send(HomePage(app, mod_self, app.build_number, mod_self.social));
        });

        // Serve static assets
        expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
    }



}

module.exports = ReactMod;
