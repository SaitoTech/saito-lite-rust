const SaitoDocxCreateTemplate = require('./saitodocx-create.template');

//const Trix = require('trix');

class SaitoDocxCreate {
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;

		app.connection.on('saitodocx-create-render-request', () => {
			console.log('rendering create inside event ///');
			this.render();
		});
	}

	async render() {
		//
		// Wipe the main container and create a fresh build render main template
		//
		if (document.getElementById('saitodocx-create-container') != null) {
			this.app.browser.replaceElementBySelector(
				SaitoDocxCreateTemplate(),
				'#saitodocx-create-container'
			);
		} else {
			this.app.browser.replaceElementContentBySelector(SaitoDocxCreateTemplate(), '#saitodocx-main-container');
		}

		this.attachEvents();
	}

	attachEvents() {
		let this_self = this;
		var element = document.querySelector("trix-editor")

		document.getElementById('saitodocx-save').onclick = () => {


			let text = JSON.stringify(element.editor);
			let editor_doc = element.editor.getDocument();
			
			console.log('editor: ', element.editor);
			console.log('editor document: ', editor_doc.toString());
			console.log('saving text: ', text);
		};
		
		setTimeout(function() {

			let editor_state = {
    "document": [
        {
            "text": [
                {
                    "type": "string",
                    "attributes": {},
                    "string": "hello\nhow are you\n"
                },
                {
                    "type": "string",
                    "attributes": {
                        "blockBreak": true
                    },
                    "string": "\n"
                }
            ],
            "attributes": []
        },
        {
            "text": [
                {
                    "type": "string",
                    "attributes": {},
                    "string": "heading "
                },
                {
                    "type": "string",
                    "attributes": {
                        "blockBreak": true
                    },
                    "string": "\n"
                }
            ],
            "attributes": [
                "heading1"
            ]
        },
        {
            "text": [
                {
                    "type": "string",
                    "attributes": {},
                    "string": "\n"
                },
                {
                    "type": "string",
                    "attributes": {
                        "href": "https://jsonlint.com/"
                    },
                    "string": "https://jsonlint.com/"
                },
                {
                    "type": "string",
                    "attributes": {
                        "blockBreak": true
                    },
                    "string": "\n"
                }
            ],
            "attributes": []
        }
    ],
    "selectedRange": [
        50,
        50
    ]
};

			console.log('json stringify: ', JSON.toString(editor_state));
			//console.log('parse json string: ', JSON.parse(JSON.toString(editor_state)));


			element.editor.loadJSON(editor_state);
			document.getElementById('saitodocx-texteditor').focus();
		}, 0);
	}
}

module.exports = SaitoDocxCreate;
