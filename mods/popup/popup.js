const saito = require('./../../lib/saito/saito');
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const PopupLesson = require('./lib/lesson');
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
		await this.deleteDatabase();
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
			this.main = new PopupMain(this.app, this);
			this.manager = new PopupLessonManager(this.app, this);
			this.lesson = new PopupLesson(this.app, this);
			this.review = new PopupReview(this.app, this);
			this.vocab = new PopupVocab(this.app, this);

			this.addComponent(this.header);
			this.addComponent(this.main);

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

	
		let path = window.location.pathname;
		let x = path.split("/");
		if (path.length > 1) {
			if (path[1] == "lessons") {
				if (path.length > 2) {
					if (path[2] == "absolute-beginners") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (path[2] == "elementary") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (path[2] == "intermediate") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (path[2] == "advanced") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (path[2] == "film-friday") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (path[2] == "quiz-night") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
				} else {
					this.app.connection.emit('popup-lessons-render-request', ("all"));
				}
				return;
			}
		}


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

			save_display_mode = function (
				mode = ""
			) {
				if (mode === "simplified") {
					if (popup_self.app.options.popup.display.simplified == 1) {
						popup_self.app.options.popup.display.simplified = 0;
						popup_self.app.options.popup.display.traditional = 1;
					} else {
						popup_self.app.options.popup.display.simplified = 1;
						popup_self.app.options.popup.display.traditional = 0;
					}
				}
				if (mode === "traditional") {
					if (popup_self.app.options.popup.display.traditional == 1) {
						popup_self.app.options.popup.display.traditional = 0;
						popup_self.app.options.popup.display.simplified = 1;
					} else {
						popup_self.app.options.popup.display.traditional = 1;
						popup_self.app.options.popup.display.simplified = 0;
					}
				}
				if (mode === "pinyin") {
					if (popup_self.app.options.popup.display.pinyin == 1) {
						popup_self.app.options.popup.display.pinyin = 0;
					} else {
						popup_self.app.options.popup.display.pinyin = 1;
					}
				}
				if (mode === "english") {
					if (popup_self.app.options.popup.display.english == 1) {
						popup_self.app.options.popup.display.english = 0;
					} else {
						popup_self.app.options.popup.display.english = 1;
					}
				}

				popup_self.save();
			};


			save_vocab_mode = function (
				mode = ""
			) {
				if (mode === "field1") {
					if (popup_self.app.options.popup.vocab.field1 == 1) {
						popup_self.app.options.popup.vocab.field1 = 0;
					} else {
						popup_self.app.options.popup.vocab.field1 = 1;
					}
				}
				if (mode === "field2") {
					if (popup_self.app.options.popup.vocab.field2 == 1) {
						popup_self.app.options.popup.vocab.field2 = 0;
					} else {
						popup_self.app.options.popup.vocab.field2 = 1;
					}
				}
				if (mode === "field3") {
					if (popup_self.app.options.popup.vocab.field3 == 1) {
						popup_self.app.options.popup.vocab.field3 = 0;
					} else {
						popup_self.app.options.popup.vocab.field3 = 1;
					}
				}
				if (mode === "field4") {
					if (popup_self.app.options.popup.vocab.field4 == 1) {
						popup_self.app.options.popup.vocab.field4 = 0;
					} else {
						popup_self.app.options.popup.vocab.field4 = 1;
					}
				}
				if (mode === "field5") {
					if (popup_self.app.options.popup.vocab.field5 == 1) {
						popup_self.app.options.popup.vocab.field5 = 0;
					} else {
						popup_self.app.options.popup.vocab.field5 = 1;
					}
				}
				popup_self.save();
			};

			add_to_vocab = function (
				field1 = '',
				field2 = '',
				field3 = '',
				field4 = '',
				field5 = '',
				label = ''
			) {

				if (field1 === "unknown") { field1 = ""; }	
				if (field2 === "unknown") { field2 = ""; }	
				if (field3 === "unknown") { field3 = ""; }	
				if (field4 === "unknown") { field4 = ""; }	
				if (field5 === "unknown") { field5 = ""; }	

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
				this.peers.push(peer);
			}

			//
			// fetch all available lessons on load
			//
			let sql = `
				SELECT lessons.id, lessons.title, lessons.content, lessons.slug, lessons.photo, lessons.username, lessons.userslug 
				FROM lessons 
                   		ORDER BY lessons.created_at DESC
			`;

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

	loadLessonSentences(lesson, mycallback) {

		if (!lesson) { return; }
		if (this.peers.length == 0) { return; }
		let peer = this.peers[0];

		//
		// sentences
		//
		this.sendPeerDatabaseRequestWithFilter(
			'Popup',
			`SELECT * FROM sentences WHERE lesson_id = ${lesson.id} ORDER BY display_order ASC`,
			async (res) => {
				if (res.rows) {
					lesson.sentences = res.rows;
					mycallback(lesson);
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
	loadLessonWords(lesson, mycallback) {

		if (!lesson) { return; }
		if (this.peers.length == 0) { return; }
		let peer = this.peers[0];

		//
		// words
		//
		this.sendPeerDatabaseRequestWithFilter(
			'Popup',
			`SELECT * FROM words WHERE lesson_id = ${lesson.id} ORDER BY display_order ASC`,
			async (res) => {
				if (res.rows) {
					lesson.words = res.rows;
					mycallback(lesson);
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

	loadLessonQuestions(lesson, mycallback) {

		if (!lesson) { return; }
		if (this.peers.length == 0) { return; }
		let peer = this.peers[0];

		//
		// questions
		//
		this.sendPeerDatabaseRequestWithFilter(
			'Popup',
			`SELECT * FROM questions WHERE lesson_id = ${lesson.id} ORDER BY display_order ASC`,
			async (res) => {
				if (res.rows) {
					lesson.questions = res.rows;
					mycallback(lesson);
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
		if (!this.app.options.popup.vocab) {
			this.app.options.popup.vocab = {};
			this.app.options.popup.vocab.field1 = 1;
			this.app.options.popup.vocab.field2 = 1;
			this.app.options.popup.vocab.field3 = 1;
			this.app.options.popup.vocab.field4 = 1;
			this.app.options.popup.vocab.field5 = 0;
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

	updatePreference(field1, value1) {

		if (field1 == "display") {
			if (value1 == "simplified") { this.app.options.popup.display.simplified = 1; }
			if (value1 == "traditional") { this.app.options.popup.display.traditional = 1; }
			if (value1 == "pinyin") { this.app.options.popup.display.pinyin = 1; }
			if (value1 == "english") { this.app.options.popup.display.english = 1; }
			if (value1 == "part-of-speech") { this.app.options.popup.display.part_of_speech = 1; }
		}

		return 1;
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

		this.app.storage.saveOptions();
	}



	/////////////////////////
	// in-browser database //
	/////////////////////////
	async deleteDatabase() {

		if (this.app.BROWSER) {

			if (!this.localDB) {
				this.localDB = new JsStore.Connection(
                	                new Worker('/saito/lib/jsstore/jsstore.worker.js')
                	        );
			}

			this.localDB.dropDb("popup").then(function() {
				console.log('Popup Database deleted successfully');
			}).catch(function(error) {
				console.error('Error deleting the database:', error);
			});


		}
		return;
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
				name: 'popup',
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
		obj.audio_source = "";
		obj.audio_translation = "";
		obj.display_order = 0;
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
