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
		this.sluf = 'appStore';
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
		this.zip_file = null;

		this.title = null;
		this.description = null;
		this.app_slug = null;
		this.version = null;
		this.publisher = null;
		this.category = null;
		this.img = null;
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
			// let x = [];
			// if (!this.browser_active) {
			// 	x.push({
			// 		text: 'Add app',
			// 		icon: 'fa-solid fa-plus',
			// 		callback: function (app, id) {
			// 			this_self.addAppOverlay.render();
			// 		}
			// 	});

			// 	return x;
			// }
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


	async sendSubmitModuleTransaction(zip, slug, callback) {
		let peers = await this.app.network.getPeers();
	    if (peers.length == 0) {
	      console.warn("No peers");
	      return;
	    }

		let msg = {
			module: 'AppStore',
			request: 'submit module',
			module_zip: zip,
			slug: slug
		};

        this.app.network.sendRequestAsTransaction(
          'submit module',
          msg,
          (res) => {

        	console.log('appstore callback: ' + res);
          	return callback(res);
          },
          peers[0].peerIndex
        );
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		let this_self = this;
	    if (tx == null) {
	      return 0;
	    }

	    let txmsg = tx.returnMessage();

	    if (!txmsg.request) {
	      return 0;
	    }

	    if (txmsg.request === 'submit module') {
	    	let { module_zip, slug } = txmsg.data;
	 		await this_self.createAppBinary(module_zip, slug, mycallback);
	    }

	    return super.handlePeerTransaction(app, tx, peer, mycallback);
	}
	
	attachEvents() {
		if (this.app.BROWSER){
			let this_self = this;
			document.querySelector('#appstore-zip-upload').style.display = 'block';
			document.querySelector('#uploaded-file').style.display = 'none';

			this.app.browser.addDragAndDropFileUploadToElement(`appstore-zip-upload`, async (filesrc) => {
				console.log('data:', filesrc);
				this_self.zip_file = filesrc.substring(28);;
				console.log('uploaded zip:', this_self.zip_file);
				document.querySelector('#appstore-zip-upload').style.display = 'none';
				document.querySelector('#uploaded-file').style.display = 'block';
			}, true, false, false);


			if (document.getElementById('cancel-file')) {
				document.getElementById('cancel-file').onclick = async (e) => {
					document.querySelector('#appstore-zip-upload').style.display = 'block';
					document.querySelector('#uploaded-file').style.display = 'none';
					this_self.zip_file = null;
				}
			}

			if (document.getElementById('generate-tx')) {
				document.getElementById('generate-tx').onclick = async (e) => {

					salert("Generating app file for download, please wait...");

					this_self.title = document.getElementById('title').value;
					this_self.description = document.getElementById('description').value;
					this_self.app_slug = document.getElementById('slug').value;
					this_self.version = document.getElementById('version').value;
					this_self.publisher = document.getElementById('publisher').value;
					this_self.category = document.getElementById('category').value;
					this_self.img = '';//document.getElementById('img').value;
				    console.log('zip_file: ', this_self.zip_file);

				    if (this_self.title == '' || this_self.description == '' ||  
				    	this_self.app_slug == '' || this_self.version == '' || 
				    	this_self.publisher == '' || this_self.category == '' ) {
				    	salert("Please provide needed information");
				    	return;
				    }

				    await this_self.sendSubmitModuleTransaction(this_self.zip_file, this_self.app_slug, async function(mod_binary){

				    	let obj = {
					      module: "Appstore",
					      request: "submit application",
					      bin: mod_binary,
					      title: this_self.title,
					      description: this_self.description,
					      slug: this_self.app_slug,
					      img: this_self.img,
					      version: this_self.version,
					      publisher: this_self.publisher,
					      category: this_self.category
					    };

					    let newtx = await this_self.app.wallet.createUnsignedTransaction(this_self.publicKey, BigInt(0), BigInt(0));
					    newtx.msg = obj;

					    let jsonData = newtx.serialize_to_web(this_self.app);
						this_self.download(JSON.stringify(jsonData), `${this_self.app_slug}.json`, "text/plain");
				    });
					
				};
			}
		}
	}

	async createAppBinary(zip_bin, slug, mycallback) {
		let this_self = this;
		try {
			const path = require('path');
			const unzipper = require('unzipper');
			const fs = this_self.app.storage.returnFileSystem();
			let zip_path = `app.zip`;
			
			//
			// convert base64 to vinary
			//
			let zip_bin2 = Buffer.from(zip_bin, 'base64').toString('binary');

			fs.writeFileSync(path.resolve(__dirname, zip_path), zip_bin2, {
				encoding: 'binary'
			});

			console.log('zip_file created: ', zip_path);

			try {
				const directory = await unzipper.Open.file(path.resolve(__dirname, zip_path));
 	 			await directory.extract({ path: './mods/tmp_mod/' })
				

				const { exec } = require('child_process');
				exec(`sh  ./web/saito/dyn/conv.sh ${slug}`,
		        (error, stdout, stderr) => {
		            console.log(stdout);
		            console.log(stderr);
		            if (error !== null) {
		                console.log(`exec error: ${error}`);
		            }
		        });

		        //delete unziped module
				try {
					await fs.unlink(path.resolve(__dirname, zip_path));
				} catch (error) {
					console.error(error);
				}

				
				let end = Date.now() + 10000
				while (Date.now() < end) ;

				const { DYN_MOD_WEB } = require('../../lib/dyn_mod');

				exec(`rm -rf  ./mods/tmp_mod/`,
		        (error, stdout, stderr) => {
		            console.log(stdout);
		            console.log(stderr);
		            if (error !== null) {
		                console.log(`exec error: ${error}`);
		            }
		        });

		        if (mycallback) {
		        	return mycallback(DYN_MOD_WEB);
		        }

			} catch (err) {
				console.log("ERROR UNZIPPING: " + err);
			}
			
			//return { name, image, description, categories };
		} catch (err) {
			console.log('Error in Appstore', err);
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