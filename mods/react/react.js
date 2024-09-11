const Transaction = require('../../lib/saito/transaction').default;
const PeerService = require('saito-js/lib/peer_service').default;
const ModTemplate = require('../../lib/templates/modtemplate');
const HomePage = require('./index');
const path = require('path');



class ReactMod extends ModTemplate {

    constructor(app) {
        
		super(app);
		this.app = app;
		this.name = 'React';
        this.social = {
			twitter: '@SaitoOfficial',
			title: `🟥 ${this.returnName()}`,
			url: `https://saito.io/${this.returnSlug()}/`,
			description: 'shows usage of react ui library with saiton',
			image: 'https://saito.tech/wp-content/uploads/2023/11/videocall-300x300.png'
		};
		this.description =
			'shows usage of react ui library with saito';	
	}


    render(){
        var script = document.createElement("script");
        script.src = "react/react-bundle/react-bundle.js"
        script.type = "text/javascript";
        document.body.appendChild(script);
    }



    webServer(app, expressapp, express) {
        let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
        let mod_self = this;
        expressapp.use('/react-bundle/react-bundle.js', express.static(path.join(__dirname, 'react-bundle/react-bundle.js')));
        expressapp.get('/' + encodeURI(this.returnSlug()), async function (req, res) {
            let reqBaseURL = req.protocol + '://' + req.headers.host + '/';
            mod_self.social.url = reqBaseURL + encodeURI(mod_self.returnSlug());
    
            res.setHeader('Content-type', 'text/html');
            res.charset = 'UTF-8';
            const reactBundleUrl = `${reqBaseURL}react-bundle/react-bundle.js`;

            res.send(HomePage(app, mod_self, app.build_number, mod_self.social, reactBundleUrl));
        });
    
        // Serve static assets
        expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
    }
    
    
	
}

module.exports = ReactMod;
