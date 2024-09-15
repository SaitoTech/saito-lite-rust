const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const PopupLesson = require('./lib/lesson');
const PopupMenu = require('./lib/menu');
const PopupVocab = require('./lib/vocab');
const PopupReview = require('./lib/review');
const PopupMain = require('./lib/main');
const PopupLessonManager = require('./lib/manager');
const PeerService = require('saito-js/lib/peer_service').default;
const localforage = require('localforage');
const JsStore = require('jsstore');

class Popup extends ModTemplate {
	constructor(app) {
		super(app);
		this.appname = 'Popup Chinese';
		this.name = 'Popup';
		this.slug = 'popup';
		this.description = 'Chinese Language Education on the Saito Network';
		this.categories = 'Social Entertainment';
		this.icon_fa = 'fa-solid fa-language';

		this.styles = ['/popup/style.css'];
		this.peers = [];

		// in browser db
		this.localDB = null;
		this.schema = [
			'id',
			'user_id',
			'publickey',
			'owner',
			'sig',
			'field1',
			'field2',
			'field3',
			'block_id',
			'block_hash',
			'created_at',
			'updated_at',
			'tx',
			'preserve'
		];

		this.social = {
			twitter_card: 'summary',
			twitter_site: '@SaitoOfficial',
			twitter_creator: '@SaitoOfficial',
			twitter_title: 'Popup Chinese',
			twitter_url: 'https://popupchinese.com/',
			twitter_description: 'Popup Chinese - Learn Chinese',
			twitter_image:
				'https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png',
			og_title: 'Popup Chinese',
			og_url: 'https://popupchinese.com',
			og_type: 'website',
			og_description: 'Popup Chinese - Learn Chinese',
			og_site_name: 'Popup Chinese',
			og_image: 'https://popupchinese.com',
			og_image_url: 'https://popupchinese.com',
			og_image_secure_url: 'https://popupchinese.com'
		};

		this.lessons = [];
		this.offset = 0;

		return this;
	}

	returnServices() {
		let services = [];
		services.push(new PeerService(null, 'popup', 'Popup Language Archive'));
		return services;
	}

	////////////////////
	// initialization //
	////////////////////
	async initialize(app) {

		//
		// database setup etc.
		//
		await super.initialize(app);

		//
		// create in-browser DB
		//
		await this.initializeDatabase();

		//
		// load local data
		//
		this.load();
	}

	////////////
	// render //
	////////////
	async render() {

		//
		// create and render components
		//
		if (this.main == null) {
			// initialize components
			this.header = new SaitoHeader(this.app, this);
			await this.header.initialize(this.app);
			this.menu = new PopupMenu(this.app, this);
			this.main = new PopupMain(this.app, this);
			this.manager = new PopupLessonManager(this.app, this);
			this.lesson = new PopupLesson(this.app, this);
			this.review = new PopupReview(this.app, this);
			this.vocab = new PopupVocab(this.app, this);

			this.addComponent(this.header);
			this.addComponent(this.main);
			this.addComponent(this.menu);

			//
			// chat manager can insert itself into left-sidebar if exists
			//
			for (const mod of this.app.modules.returnModulesRespondingTo("chat-manager")) {
			        let cm = mod.respondTo("chat-manager");
			        cm.container = ".saito-sidebar.left";
			        cm.render_manager_to_screen = 1;
				this.addComponent(cm);
			}
		}

		await super.render();

		this.app.connection.emit('popup-home-render-request');
	}

	////////////////////////////
	// fetch language content //
	////////////////////////////
	async onPeerServiceUp(app, peer, service = {}) {

		let popup_self = this;

		//
		// override functions called by non-Saito JS
		//
		if (this.app.BROWSER == 1) {
			add_to_vocab = function (
				field1 = '',
				field2 = '',
				field3 = '',
				field4 = '',
				field5 = '',
				label = ''
			) {
				popup_self.addVocab(
					field1,
					field2,
					field3,
					field4,
					field5,
					label
				);
			};
		}

		//
		// avoid network overhead if in other apps
		//
		if (!this.browser_active) {
			return;
		}

		//
		// load available lessons / media
		//
		if (service.service === 'popup') {

			if (!this.peers.includes(peer.publicKey)) {
				this.peers.push(peer.publicKey);
			}

			//
			// fetch all available lessons on load
			//
			let sql = `
				SELECT lessons.id, lessons.title, lessons.content, lessons.slug, lessons.photo, lessons.username, words.*
				FROM lessons JOIN words WHERE lessons.id = 25 AND words.lesson_id = lessons.id
                   		ORDER BY lessons.created_at DESC
			`;

/***
			this.sendPeerDatabaseRequestWithFilter(
				'Popup',
				sql,
				async (res) => {
					let_lesson_id = 0;
					if (res.rows) {
						for (let record of res.rows) {
							this.addLesson(record);
						}
						return;
					}
				},
				(p) => {
					if (p.publicKey == peer.publicKey) {
						return 1;
					}
					return 0;
				}
			);
***/

		}
	}



	//////////////////////
	// Lesson Functions //
	//////////////////////
	//
	//(add, load, return)
	//
	async addLesson(lesson) {
		let add_me = true;
		for (let i = 0; i < this.lessons.length; i++) {
			if (this.lessons[i].id === lesson.id) {
				return;
			}
		}
		this.lessons.push(lesson);
	}

	loadLesson(lesson) {

		if (!lesson) { return; }

		//
		// sentences
		//
		this.sendPeerDatabaseRequestWithFilter(
			'Popup',
			`SELECT * FROM sentences WHERE lesson_id = ${lesson.id} ORDER BY display_order ASC`,
			sql,
			async (res) => {
				if (res.rows) {
					lesson.sentences = res.rows;
					return;
				}
			},
			(p) => {
				if (p.publicKey == peer.publicKey) {
					return 1;
				}
				return 0;
			}
		);
		//
		// words
		//
		this.sendPeerDatabaseRequestWithFilter(
			'Popup',
			`SELECT * FROM words WHERE lesson_id = ${lesson.id} ORDER BY display_order ASC`,
			sql,
			async (res) => {
				if (res.rows) {
					lesson.words = res.rows;
					return;
				}
			},
			(p) => {
				if (p.publicKey == peer.publicKey) {
					return 1;
				}
				return 0;
			}
		);

		//
		// questions
		//
		this.sendPeerDatabaseRequestWithFilter(
			'Popup',
			`SELECT * FROM questions WHERE lesson_id = ${lesson.id} ORDER BY display_order ASC`,
			sql,
			async (res) => {
				if (res.rows) {
					lesson.questions = res.rows;
					return;
				}
			},
			(p) => {
				if (p.publicKey == peer.publicKey) {
					return 1;
				}
				return 0;
			}
		);
	}

	returnLesson(lesson_id = null) {
		for (let i = 0; i < this.lessons.length; i++) {
			if (this.lessons[i].id == lesson_id) {
				return this.lessons[i];
			}
		}

		return {
			level: 'Unknown',
			title: 'Placeholder Title'
		};
	}






	///////////////////////
	// network functions //
	///////////////////////
	async onConfirmation(blk, tx, conf) {
		let txmsg = tx.returnMessage();

		if (conf === 0) {
			console.log('%%');
			console.log('NEW TRANSACTION RECEIVED!');
			console.log('txmsg: ' + JSON.stringify(txmsg));
		}
	}





	load() {
		if (!this.app.BROWSER) {
			return;
		}

		if (!this.app.options.popup) {
			this.app.options.popup = {};
		}
		if (!this.app.options.popup.display) {
			this.app.options.popup.display = {};
			this.app.options.popup.display.simplified = 1;
			this.app.options.popup.display.traditional = 0;
			this.app.options.popup.display.pinyin = 1;
			this.app.options.popup.display.english = 1;
			this.app.options.popup.display.part_of_speech = 0;
		}
		if (!this.app.options.popup.review) {
			this.app.options.popup.review = {};
			this.app.options.popup.review.enable = 1;
		}

		localforage.getItem(`popup_vocabulary`, (error, value) => {
			if (value && value.length > 0) {
				for (let tx of value) {
					try {
						// process transactions one-by-one
					} catch (err) {}
				}
				//this.app.connection.emit("redsquare-home-render-request");
			}
		});
	}

	save() {
		if (!this.app.options?.popup) {
			this.app.options.popup = {};
			this.app.options.popup.display = {};
			this.app.options.popup.display.simplified = 1;
			this.app.options.popup.display.traditional = 1;
			this.app.options.popup.display.pinyin = 1;
			this.app.options.popup.display.english = 1;
			this.app.options.popup.display.part_of_speech = 1;
			this.app.options.popup.review = {};
			this.app.options.popup.review.enable = 1;
		}

		this.saveOptions();
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

	async addVocab(
		field1 = '',
		field2 = '',
		field3 = '',
		field4 = '',
		field5 = '',
		label = '',
		lesson_id = ''
	) {
		let obj = {};
		obj.field1 = field1;
		obj.field2 = field2;
		obj.field3 = field3;
		obj.field4 = field4;
		obj.field5 = field5;
		obj.lesson_id = lesson_id;
		obj.label = label;
		obj.created_at = new Date().getTime();
		obj.updated_at = new Date().getTime();

		if (this.app.BROWSER) {
			let numRows = await this.localDB.insert({
				into: 'vocabulary',
				values: [obj]
			});
		}

		let v = await this.returnVocab();
		console.log('POST INSERT: ' + JSON.stringify(v));
	}

	async returnVocab(offset = 0) {
		if (!this.app.BROWSER) {
			return;
		}

		let rows = await this.localDB.select({
			from: 'vocabulary',
			//where: where_obj,
			order: { by: 'id', type: 'desc' }
		});

		return rows;
	}
}

module.exports = Popup;
