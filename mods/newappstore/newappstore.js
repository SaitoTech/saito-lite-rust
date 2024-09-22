const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const Transaction = require('../../lib/saito/transaction').default;
const AddAppOverlay = require('./lib/overlay/add-app');
const JsStore = require('jsstore');

class AppStore extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'AppStore';
		this.appname = 'AppStore';
		this.description =
			'Application manages installing, indexing, compiling and serving Saito modules.';
		this.categories = 'Utilities Dev';
		this.featured_apps = [];
		this.header = null;
		this.icon = 'fas fa-window-restore';

		this.bundling_timer = null;
		this.renderMode = 'none';
		this.search_options = {};

		this.styles = ['/saito/saito.css', '/newappstore/style.css'];

		this.addAppOverlay = null;
		this.localDb = null;
	}

	async initialize(app) {
		await super.initialize(app);
		this.addAppOverlay = new AddAppOverlay(this.app, this)
	}

	async render() {
		//
		// browsers only!
		//
		if (!this.app.BROWSER) {
			return;
		}

		this.header = new SaitoHeader(this.app, this);
		await this.header.initialize(this.app);

		this.addComponent(this.header);

		await super.render();
		this.attachEvents();
	}

	async initializeHTML(app) {
		await super.initializeHTML(app);

		if (this.header == null) {
			this.header = new SaitoHeader(app, this);
			await this.header.initialize(app);
		}
		await this.header.render(app, this);
		this.header.attachEvents(app, this);
	}

	respondTo(type) {
		let this_self = this;
		if (type === 'saito-header') {
			let x = [];
			if (!this.browser_active) {
				x.push({
					text: 'Add app',
					icon: 'fa-solid fa-plus',
					callback: function (app, id) {
						this_self.addAppOverlay.render();
					}
				});

				return x;
			}
		}
		return null;
	}

	async initializeDatabase() {
		if (this.app.BROWSER) {
			this.localDB = new JsStore.Connection(
				new Worker('/saito/lib/jsstore/jsstore.worker.js')
			);

			//
			// create Local database
			//
			let vocabulary = {
				name: 'vocabulary',
				columns: {
					id: { primaryKey: true, autoIncrement: true },
					field1: { dataType: 'string', default: '' },
					field2: { dataType: 'string', default: '' },
					field3: { dataType: 'string', default: '' },
					field4: { dataType: 'string', default: '' },
					field5: { dataType: 'string', default: '' },
					label: { dataType: 'string', default: '' },
					lesson_id: { dataType: 'number', default: 0 },
					created_at: { dataType: 'number', default: 0 },
					updated_at: { dataType: 'number', default: 0 }
				}
			};

			let db = {
				name: 'vocabulary_db',
				tables: [vocabulary]
			};

			var isDbCreated = await this.localDB.initDb(db);
			if (isDbCreated) {
				console.log('POPUP: db created and connection opened');
			} else {
				console.log('POPUP: connection opened');
			}
		}

		return;
	}


	


	attachEvents() {
		let this_self = this;

		if (document.getElementById('generate-tx')) {
			document.getElementById('generate-tx').onclick = async (e) => {
				alert('clicked');
				let binary = document.getElementById('binary').value;
				let title = document.getElementById('title').value;
				let description = document.getElementById('description').value;
				let img = document.getElementById('img').value;

				console.log("binary: ", binary);

				let newtx = await this_self.app.wallet.createUnsignedTransaction(this_self.publicKey, BigInt(0), BigInt(0));
			    newtx.msg = {
			      module: "Appstore",
			      request: "submit application",
			      bin: binary,
			      title: title,
			      description: description,
			      img: img,
			      version: '1.0.0',
			      publisher: this_self.publicKey
			    };

			    let jsonData = newtx.serialize_to_web(this_self.app);
			    console.log('newtx:', );
				
				this_self.download(JSON.stringify(jsonData), `${title}.json`, "text/plain");
			};
		}
	}

	download(content, fileName, contentType) {
	  const a = document.createElement("a");
	  const file = new Blob([content], { type: contentType });
	  a.href = URL.createObjectURL(file);
	  a.download = fileName;
	  a.click();
	}
}

module.exports = AppStore;