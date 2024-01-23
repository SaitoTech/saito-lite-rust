const saito = require('../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const AppStoreAppspace = require('./lib/appspace/main');
const AppStoreBundleConfirm = require('./lib/overlay/appstore-bundle-confirm');
const AppStoreModuleIndexedConfirm = require('./lib/overlay/appstore-module-indexed-confirm');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const fs = require('fs');
const path = require('path');
const JSON = require('json-bigint');
const Transaction = require('../../lib/saito/transaction').default;

class AppStore extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;

		this.name = 'AppStore';
		this.appname = 'AppStore';
		this.description =
			'Application manages installing, indexing, compiling and serving Saito modules.';
		this.categories = 'Utilities Dev';
		this.featured_apps = [
			'Polkadot',
			'Kusama',
			'Westend',
			'Design',
			'Debug',
			'Midnight',
			'Hearts',
			'Settlers',
			'President',
			'Scotland'
		];
		this.header = null;
		this.icon = 'fas fa-window-restore';

		this.bundling_timer = null;
		this.renderMode = 'none';
		this.search_options = {};
	}

	//
	// appstore upload is in email
	//
	respondTo(type) {
		if (type == 'appspace') {
			this.styles = ['/appstore/css/appspace.css'];
			super.render(this.app, this);
			return new AppStoreAppspace(this.app, this);
		}
		return null;
	}

	//
	// click-to-access overlay access
	//
	async initializeHTML(app) {
		await super.initializeHTML(app);

		if (this.header == null) {
			this.header = new SaitoHeader(app, this);
			await this.header.initialize(app);
		}
		await this.header.render(app, this);
		this.header.attachEvents(app, this);
	}

	handleUrlParams(urlParams) {
		let i = urlParams.get('app');
		if (i) {
			let search_options = {};
			search_options.version = i;
			this.search_options = search_options;
			this.renderMode = 'standalone';
		}
	}

	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let message = tx.returnMessage();

		await super.handlePeerTransaction(app, tx, peer, mycallback);

		if (message.request === 'appstore search modules') {
			let squery1 = '%' + message.data + '%';
			let squery2 = message.data;

			let sql =
				'SELECT name, description, version, categories, publickey, unixtime, bid, bsh FROM modules WHERE description LIKE $squery1 OR name = $squery2';
			let params = {
				$squery1: squery1,
				$squery2: squery2
			};

			let rows = await this.app.storage.queryDatabase(
				sql,
				params,
				'appstore'
			);

			let res = {};
			res.err = '';
			res.rows = rows;

			mycallback(res);
			return 1;
		}
	}

	//
	// publish modules into database on module install
	//
	async installModule(app) {
		try {
			if (this.app.BROWSER == 1) {
				return;
			}

			await super.installModule(app);

			let fs = app.storage.returnFileSystem();

			if (fs != null) {
				const archiver = require('archiver');
				const path = require('path');

				//
				// get a list of module directories
				//
				const getDirectories = (source) =>
					fs
						.readdirSync(source, { withFileTypes: true })
						.filter((dirent) => dirent.isDirectory())
						.map((dirent) => dirent.name);

				let mods_dir_path = path.resolve(__dirname, '../');
				let dirs = getDirectories(mods_dir_path);

				if (!fs.existsSync(path.resolve(__dirname, `mods`))) {
					fs.mkdirSync(path.resolve(__dirname, `mods`));
				}

				//
				// zip each module and output it to modules subdir
				//
				dirs.forEach((dir) => {
					////console.log("##########################");
					////console.log("processing: " + dir);
					////console.log("##########################");

					let mod_path = path.resolve(__dirname, `mods/${dir}.zip`);
					let output = fs.createWriteStream(mod_path);

					var archive = archiver('zip', {
						zlib: { level: 9 } // Sets the compression level.
					});

					archive.on('error', function (err) {
						throw err;
					});

					archive.pipe(output);

					let file_array = getFiles(`${mods_dir_path}/${dir}/`);

					//
					// append them to the archiver
					//
					file_array.forEach((file) => {
						let fileReadStream = fs.createReadStream(file);
						var fileArray = path
							.relative(process.cwd(), file)
							.split(path.sep);
						fileArray.splice(0, 2);
						let filename = fileArray.join('/');
						// let pathBasename = path.basename(file);
						archive.append(fileReadStream, { name: filename });
					});

					// listen for all archive data to be written
					// 'close' event is fired only when a file descriptor is involved
					output.on('close', async function () {
						let mod_zip_filename = path.basename(this.path);
						let mod_path = path.resolve(
							__dirname,
							`mods/${mod_zip_filename}`
						);
						let newtx =
							await app.wallet.createUnsignedTransactionWithDefaultFee();
						let zip = fs.readFileSync(mod_path, {
							encoding: 'base64'
						});

						//
						// TODO - fix
						//
						// massive zip files bypassing tx size limits cause issues with
						// some versions of NodeJS. In others they over-size and fail
						// elegantly. adding this check to prevent issues with server
						// on start, particularly with Red Imperium.
						//
						if (zip.length <= 30000000) {
							newtx.msg = {
								module: 'AppStore',
								request: 'submit module',
								module_zip: zip,
								name: dir
							};

							await newtx.sign();
							await app.network.propagateTransaction(newtx);
						} else {
							////console.log("ZIP TOO BIG: " + dir);
						}
					});

					archive.finalize();
				});
			}
		} catch (err) {
			console.log('Error in Appstore');
		}
	}

	async initialize(app) {
		await super.initialize(app);
	}

	async onConfirmation(blk, tx, conf) {
		try {
			let txmsg = tx.returnMessage();

			if (conf == 0) {
				switch (txmsg.request) {
				case 'submit module':
					await this.submitModule(blk, tx);
					if (tx.isFrom(this.publicKey)) {
						try {
							document.querySelector(
								'.appstore-loading-text'
							).innerHTML =
									'Your application is being broadcast to the network. <p></p>Your AppStore should receive it within <span class="time_remaining">45</span> seconds.';
							let appstore_mod =
									this.app.modules.returnModule('AppStore');
							appstore_mod.time_remaining = 45;
							appstore_mod.bundling_timer = setInterval(
								() => {
									if (appstore_mod.time_remaining <= 0) {
										clearInterval(
											appstore_mod.bundling_timer
										);
										AppStoreModuleIndexedConfirm.render(
											appstore_mod.app,
											appstore_mod
										);
										AppStoreModuleIndexedConfirm.attachEvents(
											appstore_mod.app,
											appstore_mod
										);
									} else {
										appstore_mod.time_remaining--;
										if (
											appstore_mod.time_remaining >= 1
										) {
											try {
												document.querySelector(
													'.time_remaining'
												).innerHTML =
														appstore_mod.time_remaining;
											} catch (err) {
												clearInterval(
													appstore_mod.bundling_timer
												);
											}
										}
									}
								},
								1000
							);
						} catch (err) {}
					}
					break;
				case 'request bundle':
					if (tx.isFrom(this.publicKey)) {
						try {
							document.querySelector(
								'.appstore-loading-text'
							).innerHTML =
									'Your application is being processed by the network. Your upgrade should be complete within about <span class="time_remaining">120</span> seconds.';
							let appstore_mod =
									this.app.modules.returnModule('AppStore');
							appstore_mod.time_remaining = 120;
							appstore_mod.bundling_timer = setInterval(
								() => {
									if (appstore_mod.time_remaining < 0) {
										clearInterval(
											appstore_mod.bundling_timer
										);
									} else {
										appstore_mod.time_remaining--;
										if (
											appstore_mod.time_remaining >= 0
										) {
											try {
												document.querySelector(
													'.time_remaining'
												).innerHTML =
														appstore_mod.time_remaining;
											} catch (err) {
												clearInterval(
													appstore_mod.bundling_timer
												);
											}
										}
									}
								},
								1000
							);
						} catch (err) {}
					}
					if (!tx.isTo(this.publicKey)) {
						return;
					}
					await this.requestBundle(blk, tx);
					break;
				case 'receive bundle':
					////console.log("##### - RECEIVE BUNDLE 1");
					if (
						tx.isTo(this.publicKey) &&
							!tx.isFrom(this.publicKey)
					) {
						////console.log("##### BUNDLE RECEIVED #####");
						if (this.app.options.appstore) {
							////console.log("##### - RECEIVE BUNDLE 2");
							if (this.app.options.appstore.default != '') {
								////console.log("##### - RECEIVE BUNDLE 3");
								if (
									tx.isFrom(
										this.app.options.appstore.default
									)
								) {
									////console.log("##### - RECEIVE BUNDLE 4");
									this.receiveBundle(blk, tx);
								}
							}
						}
					}
					break;
				}
			}
		} catch (err) {
			console.log('Error in Appstore');
		}
	}

	async getNameAndDescriptionFromZip(zip_bin, zip_path) {
		try {
			const fs = this.app.storage.returnFileSystem();
			const path = require('path');
			const unzipper = require('unzipper');

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

			try {
				const directory = await unzipper.Open.file(
					path.resolve(__dirname, zip_path)
				);

				let promises = directory.files.map(async (file) => {
					if (file.path === 'web/img/arcade/arcade.jpg') {
						let content = await file.buffer();
						image =
							'data:image/jpeg;base64,' +
							content.toString('base64');
					}
					if (file.path === 'web/img/saito_icon.jpg') {
						let content = await file.buffer();
						image =
							'data:image/jpeg;base64,' +
							content.toString('base64');
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

					for (
						let i = 0;
						i < zip_lines.length &&
						i < 50 &&
						(found_name == 0 ||
							found_description == 0 ||
							found_categories == 0);
						i++
					) {
						//
						// get name
						//
						if (/this.name/.test(zip_lines[i]) && found_name == 0) {
							found_name = 1;
							if (zip_lines[i].indexOf('=') > 0) {
								name = zip_lines[i].substring(
									zip_lines[i].indexOf('=')
								);
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
						if (
							/this.description/.test(zip_lines[i]) &&
							found_description == 0
						) {
							found_description = 1;
							if (zip_lines[i].indexOf('=') > 0) {
								description = zip_lines[i].substring(
									zip_lines[i].indexOf('=')
								);
								description = cleanString(description);
								description = description.replace(
									/^\s+|\s+$/gm,
									''
								);
							}
						}

						//
						// get categories
						//
						if (
							/this.categories/.test(zip_lines[i]) &&
							found_categories == 0
						) {
							found_categories = 1;
							if (zip_lines[i].indexOf('=') > 0) {
								categories = zip_lines[i].substring(
									zip_lines[i].indexOf('=')
								);
								categories = cleanString(categories);
								categories = categories.replace(
									/^\s+|\s+$/gm,
									''
								);
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
								if (
									char == '\\' ||
									char == '\'' ||
									char == '"' ||
									char == ';'
								) {
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
				////console.log("ERROR UNZIPPING: " + err);
			}

			//
			// delete unziped module
			try {
				await fs.unlink(path.resolve(__dirname, zip_path));
			} catch (error) {
				console.error(error);
			}
			return { name, image, description, categories };
		} catch (err) {
			console.log('Error in Appstore');
		}
	}

	async submitModule(blk, tx) {
		try {
			if (this.app.BROWSER == 1) {
				////console.log("we are browser submit module...");
				//console.log(`hash: ${this.app.crypto.hash(tx.timestamp + "-" + tx.signature)}`);

				if (tx.isFrom(this.publicKey)) {
					let newtx =
						await this.app.wallet.createUnsignedTransaction();
					newtx.msg.module = 'Email';
					newtx.msg.title = 'Saito Application Published';
					newtx.msg.message = `

	    <p>
	    Your application has been published with the following APP-ID:
	    </p>

	    <p><br /></p>

	    <p>
	    ${this.app.crypto.hash(tx.timestamp + '-' + tx.signature)}
	    </p>

	    <p><br /></p>

	    <p>
	    Please note: if you have problems installing your application, there may be a problem preventing it from compiling successfully. In these cases, we recommend <a href="https://org.saito.tech/developers">installing Saito</a> and testing locally before deploying to the network. You are welcome to contact the Saito team with questions or problems.
	    </p>

        `;
					await newtx.sign();
					let emailmod = this.app.modules.returnModule('Email');
					if (emailmod) {
						emailmod.addEmail(newtx);
					}
					await this.app.storage.saveTransaction(newtx);
				}

				return;
			}

			////console.log("server is starting app insert");

			let sql = `INSERT
      OR IGNORE INTO modules (name, description, version, image, categories, publickey, unixtime, bid, bsh, tx, featured) VALUES (
      $name,
      $description,
      $version,
      $image,
      $categories,
      $publickey,
      $unixtime,
      $bid,
      $bsh,
      $tx,
      $featured
      )`;

			// should happen locally from ZIP
			let { module_zip } = tx.returnMessage();

			let { name, image, description, categories } =
				await this.getNameAndDescriptionFromZip(
					module_zip,
					`mods/module-${tx.signature}-${tx.timestamp}.zip`
				);

			////console.log("-----------------------------");
			////console.log("--INSERTING INTO APPSTORE --- " + name);
			//console.log(description);
			////console.log("-----------------------------");
			if (name == 'Unknown') {
				//console.log(`TROUBLE EXTRACTING: mods/module-${sig}-${ts}.zip`);
				//////console.log("ZIP: " + module_zip);
				//process.exit();
			}

			let featured_app = 0;
			if (tx.from[0].publicKey == this.publicKey) {
				featured_app = 1;
			}
			if (featured_app == 1) {
				featured_app = 0;
				if (this.featured_apps.includes(name)) {
					featured_app = 1;
				}
			}

			//console.log(name + " is included? " + featured_app);

			let params = {
				$name: name,
				$description: description || '',
				$version: this.app.crypto.hash(
					`${tx.timestamp}-${tx.signature}`
				),
				$image: image,
				$categories: categories,
				$publickey: tx.from[0].publicKey,
				$unixtime: tx.timestamp,
				$bid: blk.id,
				$bsh: blk.hash,
				$tx: JSON.stringify(tx.toJson()),
				$featured: featured_app
			};

			if (name != 'unknown') {
				try {
					await this.app.storage.runDatabase(sql, params, 'appstore');
				} catch (err) {}

				if (
					this.featured_apps.includes(name) &&
					tx.isFrom(this.publicKey)
				) {
					sql = 'UPDATE modules SET featured = 0 WHERE name = $name';
					params = { $name: name };
					await this.app.storage.runDatabase(sql, params, 'appstore');

					sql =
						'UPDATE modules SET featured = 1 WHERE name = $name AND version = $version';
					params = {
						$name: name,
						$version: this.app.crypto.hash(
							`${tx.timestamp}-${tx.signature}`
						)
					};
					await this.app.storage.runDatabase(sql, params, 'appstore');

					//
					// RESET CACHE
					//
					let sql2 =
						'SELECT name, description, version, image, publickey, unixtime, bid, bsh FROM modules  WHERE  featured = 1';
					let params2 = {};
					this.sqlcache[sql2] = await this.app.storage.queryDatabase(
						sql2,
						params2,
						'appstore'
					);
				}
			}
		} catch (err) {
			console.log('Error in Appstore');
		}
	}

	async requestBundle(blk, tx) {
		if (this.app.BROWSER == 1) {
			return;
		}

		try {
			////console.log("now making a bundle!");

			let sql = '';
			let params = '';
			let txmsg = tx.returnMessage();
			let module_list = txmsg.list;

			//
			// module_list consists of a list of the modules to bundle, these contain a name or
			// version number (or both) depending on how they were originally issued to the
			// client.
			//
			// module list = [
			//   { name : "Email" , version : "" } ,
			//   { name : "", version : "1830591927-AE752CDF7529E0419C2E13ABCCD6ABCA252313" }
			// ]
			//
			let module_names = [];
			let module_versions = [];
			let modules_selected = [];

			for (let i = 0; i < module_list.length; i++) {
				if (module_list[i].version != '') {
					module_versions.push(module_list[i].version);
				} else {
					if (module_list[i].name != '') {
						module_names.push(module_list[i].name);
					}
				}
			}

			////console.log("now making a bundle 2!");

			//
			// unversioned apps (first as default)
			//
			//
			for (let i = 0; i < module_names.length; i++) {
				sql = `SELECT *
               FROM modules
               WHERE name = $name`;
				params = { $name: module_names[i] };
				let rows = await this.app.storage.queryDatabase(
					sql,
					params,
					'appstore'
				);

				for (let i = 0; i < rows.length; i++) {
					let tx = JSON.parse(rows[i].tx);
					let { module_zip } = new Transaction(
						undefined,
						tx
					).returnMessage();
					modules_selected.push({
						name: rows[i].name,
						description: rows[i].description,
						zip: module_zip
					});
				}
			}

			////console.log("now making a bundle 3!");

			//
			// versioned apps (second as overrules default)
			//
			for (let i = 0; i < module_versions.length; i++) {
				sql = `SELECT *
               FROM modules
               WHERE version = $version`;
				params = { $version: module_versions[i] };
				let rows = await this.app.storage.queryDatabase(
					sql,
					params,
					'appstore'
				);

				for (let i = 0; i < rows.length; i++) {
					let tx = JSON.parse(rows[i].tx);
					let { module_zip } = new Transaction(
						undefined,
						tx
					).returnMessage();
					modules_selected.push({
						name: rows[i].name,
						description: rows[i].description,
						zip: module_zip
					});
				}
			}

			////console.log("now making a bundle 4!");

			//
			// WEBPACK
			//
			let bundle_filename = await this.bundler(modules_selected);

			//
			// insert resulting JS into our bundles database
			//
			let bundle_binary = fs.readFileSync(
				path.resolve(__dirname, `./bundler/dist/${bundle_filename}`),
				{ encoding: 'binary' }
			);

			//
			// show link to bundle or save in it? Should save it as a file
			//
			sql = `INSERT
      OR IGNORE INTO bundles (version, publickey, unixtime, bid, bsh, name, script) VALUES (
      $version,
      $publickey,
      $unixtime,
      $bid,
      $bsh,
      $name,
      $script
      )`;
			params = {
				$version: this.app.crypto.hash(
					`${tx.timestamp}-${tx.signature}`
				),
				$publickey: tx.from[0].publicKey,
				$unixtime: tx.timestamp,
				$bid: blk.id,
				$bsh: blk.hash,
				$name: bundle_filename,
				$script: bundle_binary
			};

			await this.app.storage.runDatabase(sql, params, 'appstore');

			//
			//
			//
			let online_version =
				this.app.options.server.endpoint.protocol +
				'://' +
				this.app.options.server.endpoint.host +
				':' +
				this.app.options.server.endpoint.port +
				'/appstore/bundle/' +
				bundle_filename;

			//
			// send our filename back at our person of interest
			//
			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee(
					tx.from[0].publicKey
				);
			let msg = {
				module: 'AppStore',
				request: 'receive bundle',
				bundle: online_version
			};
			newtx.msg = msg;
			await newtx.sign();
			await this.app.network.propagateTransaction(newtx);

			////console.log("FINISHED MAKING BUNDLE!");
		} catch (err) {
			console.log('Error in Appstore');
		}
	}

	async bundler(modules) {
		try {
			////console.log("into bundler!");

			//
			// shell access
			//
			const util = require('util');
			const exec = util.promisify(require('child_process').exec);

			//
			// modules has name, description, version, zip
			//
			const fs = this.app.storage.returnFileSystem();
			const path = require('path');
			const unzipper = require('unzipper');

			let ts = new Date().getTime();
			let hash = this.app.crypto.hash(
				modules.map((mod) => mod.version).join('')
			);

			let bash_script_create = `mods/compile-${ts}-${hash}-create`;
			let bash_script = `mods/compile-${ts}-${hash}`;

			let newappdir = `${ts}-${hash}`;

			////console.log("into new app dir: " + newappdir);

			let bash_script_content = '';
			let bash_script_delete = '';
			let bash_script_create_dirs = '';

			//
			// create and execute script that creates directories
			//
			bash_script_create_dirs =
				'cp -rf ' +
				__dirname +
				'/../../bundler/default ' +
				__dirname +
				'/../../bundler/' +
				newappdir +
				'\n';
			bash_script_create_dirs +=
				'rm -f ' +
				__dirname +
				'/../../bundler/' +
				newappdir +
				'/config/*.js' +
				'\n';
			bash_script_create_dirs +=
				'rm -rf ' +
				__dirname +
				'/../../bundler/' +
				newappdir +
				'/mods' +
				'\n';
			bash_script_create_dirs +=
				'mkdir  ' +
				__dirname +
				'/../../bundler/' +
				newappdir +
				'/mods' +
				'\n';
			bash_script_create_dirs +=
				'mkdir  ' +
				__dirname +
				'/../../bundler/' +
				newappdir +
				'/dist' +
				'\n';

			fs.writeFileSync(
				path.resolve(__dirname, bash_script_create),
				bash_script_create_dirs,
				{
					encoding: 'binary'
				}
			);
			try {
				let cwdir = __dirname;
				let createdir_command = 'sh ' + bash_script_create;
				const { stdout, stderr } = await exec(createdir_command, {
					cwd: cwdir,
					maxBuffer: 4096 * 2048
				});
			} catch (err) {
				//console.log(err);
			}

			bash_script_content += 'cd ' + __dirname + '/mods' + '\n';
			bash_script_delete += 'cd ' + __dirname + '/mods' + '\n';

			//
			// save MODS.zip and create bash script to unzip
			//
			let module_paths = modules.map((mod) => {
				////console.log("processing mod: " + mod.name);

				let mod_name = mod.name;
				let mod_path = `mods/${returnSlug(mod_name)}-${ts}-${hash}.zip`;

				bash_script_content +=
					`unzip -o ${returnSlug(
						mod_name
					)}-${ts}-${hash}.zip -d ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)} \\*.js \\*.css \\*.html \\*.wasm` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/web` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/www` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/src` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/sql` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/DESCRIPTION.txt` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/BUGS.txt` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/README.txt` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/README.md` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/install.sh` + '\n';
				bash_script_content +=
					`rm -rf ../../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}/license` + '\n';

				////console.log("still ok");

				bash_script_delete +=
					`rm -rf ${returnSlug(mod_name)}-${ts}-${hash}.zip` + '\n';
				bash_script_delete +=
					`rm -rf ../../bundler/${newappdir}/mods/${returnSlug(
						mod_name
					)}` + '\n';

				let zip_bin2 = Buffer.from(mod.zip, 'base64').toString(
					'binary'
				);
				fs.writeFileSync(path.resolve(__dirname, mod_path), zip_bin2, {
					encoding: 'binary'
				});
				return `${returnSlug(mod_name)}/${returnSlug(mod_name)}.js`;
			});

			bash_script_delete +=
				`rm -f ${__dirname}/mods/compile-${ts}-${hash}-create` + '\n';
			bash_script_delete +=
				`rm -f ${__dirname}/mods/compile-${ts}-${hash}` + '\n';

			//
			// write our modules config file
			//
			let modules_config_filename = `modules.config-${ts}-${hash}.json`;
			await fs.writeFile(
				path.resolve(
					__dirname,
					`../../bundler/${newappdir}/config/${modules_config_filename}`
				),
				JSON.stringify({ mod_paths: module_paths })
			);

			//
			// other filenames
			//
			let bundle_filename = `saito-${ts}-${hash}.js`;
			let index_filename = `index-${ts}-${hash}.js`;

			//
			// write our index file for bundling
			//
			let IndexTemplate = require('./bundler/templates/index.template.js');
			await fs.writeFile(
				path.resolve(
					__dirname,
					`../../bundler/${newappdir}/config/${index_filename}`
				),
				IndexTemplate(modules_config_filename)
			);

			//
			// execute bundling process
			//
			let entry = path.resolve(
				__dirname,
				`../../bundler/${newappdir}/config/${index_filename}`
			);
			let output_path = path.resolve(__dirname, `./bundler/dist`);

			bash_script_content += 'cd ' + __dirname + '\n';
			bash_script_content += 'cd ../../' + '\n';
			bash_script_content += `sh bundle.sh ${entry} ${output_path} ${bundle_filename}`;

			////console.log("COMPILING: " + `sh bundle.sh ${entry} ${output_path} ${bundle_filename}`);

			bash_script_content += '\n';
			bash_script_content += bash_script_delete;

			fs.writeFileSync(
				path.resolve(__dirname, bash_script),
				bash_script_content,
				{
					encoding: 'binary'
				}
			);
			try {
				let cwdir = __dirname;
				let bash_command = 'sh ' + bash_script;
				const { stdout, stderr } = await exec(bash_command, {
					cwd: cwdir,
					maxBuffer: 4096 * 2048
				});
			} catch (err) {
				//console.log(err);
			}

			//console.log(newappdir + " --- " + index_filename + " ------ " + bash_script);

			//
			// create tx
			//
			let newtx =
				await this.app.wallet.createUnsignedTransactionWithDefaultFee();
			let bundle_bin = '';

			////console.log("Bundle Filename: " + bundle_filename);
			////console.log("Bundle __dirname: " + __dirname);

			if (fs) {
				bundle_bin = fs.readFileSync(
					path.resolve(
						__dirname,
						`./bundler/dist/${bundle_filename}`
					),
					{
						encoding: 'binary'
					}
				);
			}
			newtx.msg = {
				module: 'AppStore',
				request: 'add bundle',
				bundle: bundle_bin
			};
			await newtx.sign();
			await this.app.network.propagateTransaction(newtx);

			//
			// cleanup
			//
			await fs.rmdir(
				path.resolve(__dirname, `../../bundler/${newappdir}/`),
				function () {
					////console.log("Appstore Compilation Files Removed!");
				}
			);

			return bundle_filename;
		} catch (err) {
			console.log('Error in Appstore');
		}
		return '';
	}

	receiveBundle(blk, tx) {
		if (this.app.BROWSER != 1) {
			return;
		}

		let txmsg = tx.returnMessage();

		let data = {};
		data.appstore = this;
		data.bundle_appstore_publickey = tx.from[0].publicKey;
		data.appstore_bundle = txmsg.bundle;

		AppStoreBundleConfirm.render(this.app, data);
		AppStoreBundleConfirm.attachEvents(this.app, data);
	}

	//
	// override webserver to permit module-hosting
	//
	webServer(app, expressapp, express) {
		let fs = app.storage.returnFileSystem();
		if (fs != null) {
			expressapp.use(
				'/' + encodeURI(this.name),
				express.static(__dirname + '/web')
			);
			expressapp.get('/appstore/bundle/:filename', async (req, res) => {
				let scriptname = req.params.filename;

				let sql = 'SELECT script FROM bundles WHERE name = $scriptname';
				let params = {
					$scriptname: scriptname
				};
				let rows = await app.storage.queryDatabase(
					sql,
					params,
					'appstore'
				);

				if (rows) {
					if (rows.length > 0) {
						let scriptn = './bundler/dist/' + scriptname;
						let mods_dir_path = path.resolve(__dirname, scriptn);
						let filename = mods_dir_path;
						// console.info("### write from line 944 of appstore.");
						res.writeHead(200, {
							'Content-Type': 'text/javascript',
							'Content-Transfer-Encoding': 'utf8'
						});
						const src = fs.createReadStream(filename, {
							encoding: 'utf8'
						});
						src.pipe(res);

						return;
					}
				}

				res.setHeader('Content-type', 'text/javascript');
				res.charset = 'UTF-8';
				res.send(`

	  let x = confirm("Server reports it does not contain your Saito javascript bundle. This can happen across server upgrades with remotely-hosted application bundles. Do you wish to reset to use the server default and update your default AppStore to this server?");
	  if (x) { 

	    try {

	      if (typeof(Storage) !== "undefined") {
	        let options = null;
	        let data = localStorage.getItem("options");
	        if (data) {
	  	  options = JSON.parse(data); 
	          options.appstore = "";
	          options.bundle = "";
	          options.modules = [];
	          localStorage.setItem("options", JSON.stringify(options));
		  window.location.reload(false);
    		}
	      }

	    } catch (err) {
  	      alert("Error attempting to reset to use default Saito: " + err);
	    }
	  }

	`);
			});
		}
	}

	//////////////////
	// UI Functions //
	//////////////////
	async openAppstoreOverlay(options) {
		await AppStoreOverlay.render(this.app, this, options);
		AppStoreOverlay.attachEvents(this.app, this);
	}

	async sendSubmitModuleTransaction(app, mod, data) {
		let newtx = await app.wallet.createUnsignedTransactionWithDefaultFee();
		let { name, description, zip } = data;
		newtx.msg = {
			module: 'AppStore',
			request: 'submit module',
			module_zip: zip
		};
		await newtx.sign();
		await app.network.propagateTransaction(newtx);
		return newtx;
	}

	/////////////////////
	// Database Search //
	/////////////////////
	async searchForApps(search_options = {}, mycallback = null) {
		if (mycallback == null) {
			return;
		}

		//
		// there are server-side checks, but perform basic ones
		//
		let where_clause = '';
		if (
			search_options.category != '' &&
			search_options.category != undefined
		) {
			where_clause =
				' WHERE categories LIKE "%' +
				search_options.category.replace(/\W/, '') +
				'%"';
		}
		if (search_options.search != '' && search_options.search != undefined) {
			if (where_clause == '') {
				where_clause = ' WHERE ';
			} else {
				where_clause += ' AND ';
			}
			where_clause +=
				' (name LIKE "%' +
				search_options.search.replace(/\W/, '') +
				'%" OR description LIKE "%' +
				search_options.search.replace(/\W/, '') +
				'%" OR version LIKE "%' +
				search_options.search +
				'%")';
		}
		if (
			search_options.version != '' &&
			search_options.version != undefined
		) {
			if (where_clause == '') {
				where_clause = ' WHERE ';
			} else {
				where_clause += ' AND ';
			}
			where_clause += ' version = "' + search_options.version + '"';
		}
		let featured = 0;
		if (search_options.featured == 1) {
			featured = 1;
		}
		if (where_clause == '') {
			where_clause = ' WHERE ';
		} else {
			where_clause += ' AND ';
		}
		if (featured == 1) {
			where_clause += ' featured = 1';
		} else {
			where_clause += ' (featured = 1 OR featured = 0) ';
		}

		//
		// form sql query
		//
		let sql_query =
			'SELECT name, description, version, image, publickey, unixtime, bid, bsh FROM modules ' +
			where_clause;
		////console.log("SELECT name, description, version, image, publickey, unixtime, bid, bsh FROM modules " + where_clause);
		//console.log(sql_query);

		if (this.app.BROWSER === 1) {
			this.sendPeerDatabaseRequestWithFilter(
				this.name,
				sql_query,
				(res) => {
					if (res.rows != undefined) {
						mycallback(res.rows);
					} else {
						mycallback([]);
					}
				}
			);
		} else {
			//
			// TODO - does server need implementation
			//
			mycallback([]);
		}
	}
}

module.exports = AppStore;

//
// supporting utility functions
//
// recursively go through and find all files in dir
function getFiles(dir) {
	try {
		const dirents = fs.readdirSync(dir, { withFileTypes: true });
		const files = dirents.map((dirent) => {
			const res = path.resolve(dir, dirent.name);
			return dirent.isDirectory() ? getFiles(res) : res;
		});
		return Array.prototype.concat(...files);
	} catch (err) {
		console.log('error in getFiles');
	}
	return [];
}

function returnSlug(nme) {
	nme = nme.toLowerCase();
	nme = nme.replace(/\t/g, '_');
	return nme;
}

function deleteDirs(dir) {
	try {
		const dirents = fs.readdirSync(dir, { withFileTypes: true });
		dirents.forEach((dirent) => {
			const res = path.resolve(dir, dirent.name);
			if (dirent.isDirectory() && fs.readdirSync(res).length == 0) {
				fs.rmdirSync(res, { maxRetries: 100, recursive: true });
			} else {
				deleteDirs(res);
				// delete after children have been
				fs.rmdirSync(res, { maxRetries: 100, recursive: true });
			}
		});
	} catch (err) {
		console.log('error in deleteDirs');
	}
}
