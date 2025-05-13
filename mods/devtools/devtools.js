const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const Transaction = require('../../lib/saito/transaction').default;
const AddAppOverlay = require('./lib/overlay/add-app');
const GenerateAppOverlay = require('./lib/overlay/generate-app');

class DevTools extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'DevTools';
		this.appname = 'DevTools';
		this.slug = 'devtools';
		this.description =
			'Application manages installing, indexing, compiling and serving Saito modules.';
		this.categories = 'Utilities Dev';
		this.featured_apps = [];
		this.header = null;
		this.icon = 'fas fa-window-restore';

		this.bundling_timer = null;
		this.renderMode = 'none';
		this.search_options = {};

		this.styles = ['/saito/saito.css'];

		this.addAppOverlay = null;
		this.zip_file = null;
		this.title = null;
		this.description = null;
		this.app_slug = null;
		this.version = null;
		this.publisher = null;
		this.category = null;
		this.img = null;
		this.generate_app = null;
	}

	async initialize(app) {
		await super.initialize(app);
		this.addAppOverlay = new AddAppOverlay(this.app, this);
		this.generateAppOverlay = new GenerateAppOverlay(this.app, this);
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

	async sendSubmitModuleTransaction(zip, slug, callback) {
		let peers = await this.app.network.getPeers();
		if (peers.length == 0) {
			console.warn('No peers');
			return;
		}

		let msg = {
			module: 'AppStore',
			request: 'submit module',
			module_zip: zip,
			slug: slug
		};

		console.log('zip_file trans', zip);

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

	async sendModuleDetailsTransaction(zip, callback) {
		let peers = await this.app.network.getPeers();
		if (peers.length == 0) {
			console.warn('No peers');
			return;
		}

		let msg = {
			module: 'AppStore',
			request: 'get module details',
			module_zip: zip
		};

		this.app.network.sendRequestAsTransaction(
			'get module details',
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

		if (txmsg.request === 'get module details') {
			let { module_zip, slug } = txmsg.data;
			await this_self.getNameAndDescriptionFromZip(module_zip, mycallback);
		}

		return super.handlePeerTransaction(app, tx, peer, mycallback);
	}

	clear() {
		this.zip_file = null;
		this.title = null;
		this.description = null;
		this.app_slug = null;
		this.version = null;
		this.publisher = null;
		this.category = null;
		this.img = null;
	}

	attachEvents() {
		try {
			if (this.app.BROWSER) {
				let this_self = this;

				this.app.browser.addDragAndDropFileUploadToElement(
					`appstore-zip-upload`,
					async (filesrc) => {
						this_self.clear();

						let startPoint = filesrc.indexOf('base64');
						if (startPoint < 0) {
							throw new Error('File not base64 zipped');
						}
						this_self.zip_file = filesrc.substring(startPoint + 7);
						console.log('zip_file: ', this_self.zip_file);

						await this_self.sendModuleDetailsTransaction(this_self.zip_file, async function (res) {
							console.log('mod details: ', res);

							if (res.slug == '') {
								salert('Error: Application missing slug');
								return;
							}

							this_self.generateAppOverlay.mod_details = res;
							this_self.generateAppOverlay.mod_details.publisher = this_self.publicKey;
							this_self.generateAppOverlay.zip_file = this_self.zip_file;
							this_self.generateAppOverlay.render();
						});
					},
					true,
					false,
					false
				);
			
				if (document.getElementById("install")){
					document.getElementById("install").onclick = (e) => {
						this.app.connection.emit('saito-app-app-render-request');
					}
				}

			}
		} catch (err) {
			console.error('Error: ', err);
			salert('An error occurred while compiling application. Check console for details.');
		}
	}

	async createAppBinary(zip_bin, slug, mycallback) {
		let this_self = this;
		try {
			const path = require('path');
			const unzipper = require('unzipper');
			const fs = this_self.app.storage.returnFileSystem();
			let zip_path = `app.zip`;

			try {
				//
				// convert base64 to binary
				//
				let zip_bin2 = Buffer.from(zip_bin, 'base64').toString('binary');
				fs.writeFileSync(path.resolve(__dirname, zip_path), zip_bin2, {
					encoding: 'binary'
				});

				console.log('zip_file created: ', zip_path);
				const directory = await unzipper.Open.file(path.resolve(__dirname, zip_path));

				let app_path = await this_self.getAppPath(directory, slug);
				await directory.extract({ path: './tmp_mod/' });

				console.log('app_path: ', app_path);

				const { execSync } = require('child_process');
				execSync(`sh  ./scripts/dyn-mod-compile.sh ${app_path}`, (error, stdout, stderr) => {
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

				let DYN_MOD_WEB = fs.readFileSync('./build/dyn_mod.js', {
					encoding: 'binary'
				});

				//console.log("Loaded DYN_MOD_WEB:", DYN_MOD_WEB);

/********************************************************
/**** WHEN DEBUGGING, EDIT THIS TO HAVE A COPY SAVED ****
/********************************************************
				execSync(`cp ./build/dyn_mod.js /Users/david/dyn_mod.js`, (error, stdout, stderr) => {
					console.log(stdout);
					console.log(stderr);
					if (error !== null) {
						console.log(`execSync error: ${error}`);
					}
				});
/********************************************************
/********************************************************
/*******************************************************/

				execSync(`rm -rf  ./tmp_mod/ ./build/dyn_mod.js`, (error, stdout, stderr) => {
					console.log(stdout);
					console.log(stderr);
					if (error !== null) {
						console.log(`execSync error: ${error}`);
					}
				});

				execSync(
					`truncate -s 0 ./build/dyn/web/base.txt &&  truncate -s 0 ./build/dyn/web/dyn.module.js`,
					(error, stdout, stderr) => {
						console.log(stdout);
						console.log(stderr);
						if (error !== null) {
							console.log(`execSync error: ${error}`);
						}
					}
				);

				if (mycallback) {
					return mycallback({ DYN_MOD_WEB });
				}
			} catch (err) {
				console.log('ERROR UNZIPPING: ' + err);
			}
		} catch (err) {
			console.log('Error in Appstore createAppBinary:', err);
		}
	}

	async getAppPath(directory, slug) {
		//console.log("getAppPath ////", directory, slug);
		try {
			let app_path = `${slug}.js`;
			let promises = directory.files.map(async (file) => {
				let file_path = file.path;
				if (file_path == `${slug}/${slug}/`) {
					app_path = `${slug}/${slug}/${slug}.js`;
					return;
				} else if (file_path == `${slug}/`) {
					app_path = `${slug}/${slug}.js`;
					return;
				}
			});

			await Promise.all(promises);

			return app_path;
		} catch (err) {
			console.log('ERROR getAppPath: ' + err);
		}
	}

	async getNameAndDescriptionFromZip(zip_bin, mycallback) {
		try {
			const fs = this.app.storage.returnFileSystem();
			const path = require('path');
			const unzipper = require('unzipper');
			let zip_path = `app.zip`;

			// console.log('zip_bin:',zip_bin);
			console.log('zip_path:', zip_path);
			// return;
			//
			// convert base64 to vinary
			//
			let zip_bin2 = Buffer.from(zip_bin, 'base64').toString('binary');

			fs.writeFileSync(path.resolve(__dirname, zip_path), zip_bin2, {
				encoding: 'binary'
			});

			let name = 'Unknown Module';
			let image = '';
			let description = 'unknown';
			let categories = 'unknown';
			let slug = '';
			let version = '1.0.0';

console.log("TRYIG TO ANALYZE ZIP");
console.log("TRYIG TO ANALYZE ZIP");
console.log("TRYIG TO ANALYZE ZIP");
console.log("TRYIG TO ANALYZE ZIP");
console.log("TRYIG TO ANALYZE ZIP");
console.log("TRYIG TO ANALYZE ZIP");
console.log("TRYIG TO ANALYZE ZIP");

			try {
				const directory = await unzipper.Open.file(path.resolve(__dirname, zip_path));
				let promises = directory.files.map(async (file) => {

					console.log('file: ', file);
					// return;

					if (file.path === 'web/img/arcade/arcade.jpg') {
						let content = await file.buffer();
						image = 'data:image/jpeg;base64,' + content.toString('base64');
					}
					if (file.path === 'web/img/saito_icon.jpg') {
						let content = await file.buffer();
						image = 'data:image/jpeg;base64,' + content.toString('base64');
					}

					if (file.path.substr(0, 3) == 'lib') {
						return;
					}
					if (file.path.substr(-2) !== 'js') {
						return;
					}
					//if (file.path.substr(2).indexOf("/") > -1) { return; }
					if (file.path.indexOf('web/') > -1) {
						return;
					}
					if (file.path.indexOf('src/') > -1) {
						return;
					}
					if (file.path.indexOf('www/') > -1) {
						return;
					}
					if (file.path.indexOf('lib/') > -1) {
						return;
					}
					if (file.path.indexOf('license/') > -1) {
						return;
					}
					if (file.path.indexOf('docs/') > -1) {
						return;
					}
					if (file.path.indexOf('sql/') > -1) {
						return;
					}

					let content = await file.buffer();
					let zip_text = content.toString('utf-8');
					let zip_lines = zip_text.split('\n');

					let found_name = 0;
					let found_description = 0;
					let found_categories = 0;
					let found_slug = 0;

					for (
						let i = 0;
						i < zip_lines.length &&
						i < 100 &&
						(found_name == 0 || found_description == 0 || found_categories == 0);
						i++
					) {
						//
						// get name
						//
						if (/this.name/.test(zip_lines[i]) && found_name == 0) {
							found_name = 1;
							if (zip_lines[i].indexOf('=') > 0) {
								name = zip_lines[i].substring(zip_lines[i].indexOf('='));
								name = cleanString(name);
								name = name.replace(/^\s+|\s+$/gm, '');
								if (name.length > 50) {
									name = 'Unknown';
									found_name = 0;
								}
								if (name === 'name') {
									name = 'Unknown';
									found_name = 0;
								}
							}
						}

						//
						// get description
						//
						if (/this.description/.test(zip_lines[i]) && found_description == 0) {
							found_description = 1;
							if (zip_lines[i].indexOf('=') > 0) {
								description = zip_lines[i].substring(zip_lines[i].indexOf('='));
								description = cleanString(description);
								description = description.replace(/^\s+|\s+$/gm, '');
							}
						}

						//
						// get categories
						//
						if (/this.categories/.test(zip_lines[i]) && found_categories == 0) {
							found_categories = 1;
							if (zip_lines[i].indexOf('=') > 0) {
								categories = zip_lines[i].substring(zip_lines[i].indexOf('='));
								categories = cleanString(categories);
								categories = categories.replace(/^\s+|\s+$/gm, '');
							}
						}

						//
						// get slug
						//
						if (/this.slug/.test(zip_lines[i]) && found_slug == 0) {
							found_slug = 1;
							if (zip_lines[i].indexOf('=') > 0) {
								slug = zip_lines[i].substring(zip_lines[i].indexOf('='));
								slug = cleanString(slug);
								slug = slug.replace(/^\s+|\s+$/gm, '');
							}
						}
					}

					function cleanString(str) {
						str = str.replace(/^\s+|\s+$/gm, '');
						str = str.substring(1, str.length - 1);
						return [...str]
							.map((char) => {
								if (char == ' ') {
									return ' ';
								}
								if (char == '.') {
									return '.';
								}
								if (char == ',') {
									return ',';
								}
								if (char == '!') {
									return '!';
								}
								if (char == '`') {
									return '';
								}
								if (char == '\\' || char == "'" || char == '"' || char == ';') {
									return '';
								}
								if (!/[a-zA-Z0-9_-]/.test(char)) {
									return '';
								}
								return char;
							})
							.join('');
					}
				});
				await Promise.all(promises);
			} catch (err) {
				console.log('ERROR UNZIPPING: ' + err);
			}

			//
			// delete unziped module
			try {
				await fs.unlink(path.resolve(__dirname, zip_path));
			} catch (error) {
				console.error(error);
			}

			if (mycallback) {
				return mycallback({ name, image, description, categories, slug, version });
			}
		} catch (err) {
			console.log('Error in Appstore getNameAndDescriptionFromZip:', err);
		}
	}

	download(content, fileName, contentType, callback) {
		const a = document.createElement('a');
		const file = new Blob([content], { type: contentType });
		a.href = URL.createObjectURL(file);
		a.download = fileName;
		a.click();

		if (callback) {
			return callback();
		}
	}
}

module.exports = DevTools;
