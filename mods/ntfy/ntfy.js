const ModTemplate = require('../../lib/templates/modtemplate.js');
const Credential = require('./config/config.js');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

class ntfy extends ModTemplate {
    constructor(app) {
        super(app);

        this.name = 'ntfy';
        this.description = 'Module to send notifications to ntfy server.';
        this.categories = 'Utilities';
        this.class = 'utility';

        this.ntfy = {};
        this.ntfy.server = Credential.server || '';
        this.ntfy.user = Credential.user || '';
        this.ntfy.password = Credential.password || '';
    }

    async initialize(app) {
        if (app.BROWSER) { return; }
        let notification = {
            topic: 'test',
            message: 'Server start up. \n' + Date(),
            title: 'Saito node server.'
        };
        this.sendNtfy(notification);
    }

    async sendNtfy(notification) {
        //
        // https://docs.ntfy.sh/publish/#publish-as-json
        //
        //fetch('https://ntfy.sh', {
        //     method: 'POST',
        //     body: JSON.stringify({
        //         "topic": "mytopic",
        //         "message": "Disk space is low at 5.1 GB",
        //         "title": "Low disk space alert",
        //         "tags": ["warning","cd"],
        //         "priority": 4,
        //         "attach": "https://filesrv.lan/space.jpg",
        //         "filename": "diskspace.jpg",
        //         "click": "https://homecamera.lan/xasds1h2xsSsa/",
        //         "actions": [{ "action": "view", "label": "Admin panel", "url": "https://filesrv.lan/admin" }]
        //     })
        // })
        // Field	Required	Type	Example	Description
        // topic	✔️	string	topic1	Target topic name
        // message	-	string	Some message	Message body; set to triggered if empty or not passed
        // title	-	string	Some title	Message title
        // tags	-	string array	["tag1","tag2"]	List of tags that may or not map to emojis
        // priority	-	int (one of: 1, 2, 3, 4, or 5)	4	Message priority with 1=min, 3=default and 5=max
        // actions	-	JSON array	(see action buttons)	Custom user action buttons for notifications
        // click	-	URL	https://example.com	Website opened when notification is clicked
        // attach	-	URL	https://example.com/file.jpg	URL of an attachment, see attach via URL
        // markdown	-	bool	true	Set to true if the message is Markdown-formatted
        // icon	-	string	https://example.com/icon.png	URL to use as notification icon
        // filename	-	string	file.jpg	File name of the attachment
        // delay	-	string	30min, 9am	Timestamp or duration for delayed delivery
        // email	-	e-mail address	phil@example.com	E-mail address for e-mail notifications
        // call	-	phone number or 'yes'	+1222334444 or yes	Phone number to use for voice call
        //
        // https://docs.ntfy.sh/publish/#authentication
        //  Token access  ->  headers: { 'Authorization': 'Bearer tk_somestuffhere' }
        try {
            let body = {};
            for (const key in notification) {
                const value = notification[key];
                body[key] = value;
            }
            // console.log(JSON.stringify(body));
            fetch(Credential.server, {
                method: 'POST',
                headers: { 'Authorization': 'Bearer ' + Credential.password },
                body: JSON.stringify(body)
            })
                .then(res => res.text())
                .then(data => { console.log(data); })
                .catch(err => console.error(err));

        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = ntfy;
