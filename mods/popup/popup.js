const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const PopupHome = require('./index.js');
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

		this.lesson = {}; // if being studied

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

		//
		// urlpath check for subpages
		//
		for (let i = 0; i < this.urlpath.length; i++) {
			if (this.urlpath[i] === "") {
				this.urlpath.splice(i, 1); i--; 
			}
			if (this.urlpath[i] === "popup") {
				this.browser_active = 1;
			}
			if (this.urlpath[i] === "lessons") {
				if (this.urlpath.length > (i+1)) {
					this.app.connection.emit("popup-lessons-render-request");
				} else {
					this.app.connection.emit("popup-lessons-render-request");
				}
			}
		}

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


console.log("URLPATH2: " + JSON.stringify(this.urlpath));

		if (this.urlpath.length >= 2) {
			if (this.urlpath[1] == "lessons") {
console.log("PATH LESSONS FOUND");
				if (this.urlpath.length > 2) {
					if (this.urlpath[2] == "absolute-beginners") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (this.urlpath[2] == "elementary") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (this.urlpath[2] == "intermediate") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (this.urlpath[2] == "advanced") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (this.urlpath[2] == "film-friday") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (this.urlpath[2] == "quiz-night") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
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

			//
			// browser should be able to access Saito
			//
			saito_app = app;
			saito_mod = this;

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
					//this.lesson.sentences = res.rows;
alert("setting lesson sentences!");
					//mycallback();
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
			async (res2) => {
				if (res2.rows) {
					this.lesson.words = res2.rows;
alert("setting lesson words!");
console.log("WORDS 2: ");
console.log(JSON.stringify(this.lesson.words));
					mycallback();
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
			async (res3) => {
				if (res3.rows) {
					lesson.questions = res3.rows;
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

				console.log('Local DB instance:', this.localDB);

				const vocabulary = {
				    name: 'vocabulary', 
				};

				const db = {
				    name: 'popup',
				    tables: [vocabulary]
				};

				this.localDB.initDb(db).then(() => {
				    console.log('Database initialized successfully');
				    this.localDB.dropDb('popup');
				    this.initializeDatabase();
				}).then(() => {
				    console.log('Popup Database deleted successfully');
				}).catch((error) => {
				    console.error('Error:', error);
				});
			}

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
					updated_at: { dataType: 'number', default: 0 },
					last_studied: { dataType: 'number', default: 0 },
					last_correct: { dataType: 'number', default: 0 },
					times_studied: { dataType: 'number', default: 0 },
					times_correct: { dataType: 'number', default: 0 },
					times_incorrect: { dataType: 'number', default: 0 },
					srs_rank: { dataType: 'number', default: 1 },
				}
			};

			let db = {
				name: 'popup',
				tables: [vocabulary]
			};

			var isDbCreated = await this.localDB.initDb(db);

console.log("@");
console.log("@");
console.log("@");
console.log("@");
console.log("@");
console.log("@");
console.log("@");
//console.log(JSON.stringify(this.localDB));

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
		obj.last_correct = 0;
		obj.times_studied = 0;
		obj.times_correct = 0;
		obj.times_incorrect = 0;

		if (this.app.BROWSER) {
			let numRows = await this.localDB.insert({
				into: 'vocabulary',
				values: [obj]
			});
		}

		//let v = await this.returnVocab();
		//console.log('POST INSERT: ' + JSON.stringify(v));
	}

	async returnVocab(offset = 0) {
		if (!this.app.BROWSER) {
			return;
		}

console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log("$");
console.log(JSON.stringify(this.localDB));

		let rows = await this.localDB.select({
			from: 'vocabulary',
			//where: where_obj,
			order: { by: 'id', type: 'desc' }
		});

		return rows;
	}


	async loadQuestion() {

	  let question_types = [
		"multiple_choice_english", 
		"multiple_choice_pinyin", 
	  ];
	  let question_type = question_types[Math.floor(Math.random() * question_types.length)];

	  let tdate1 = new Date().getTime();
	  let tdate2 = new Date().getTime() - (172800 * 1000);	
	  let tdate3 = new Date().getTime() - (518400 * 1000);	
	  let tdate4 = new Date().getTime() - (1123200 * 1000);	
	  let tdate5 = new Date().getTime() - (2419200 * 1000);	
	  let tdate6 = new Date().getTime() - (4924800 * 1000);
	  let tdate7 = new Date().getTime() - (14774400 * 1000);	

	  let rows = await this.localDB.select({
	    from: 'vocabulary',
	    where: [
		{
			srs_rank: 1 ,
            		last_studied: { '<': tdate1 }
		},
		{
			srs_rank: { '<' : 2 } ,
            		last_studied: { '<': tdate2 }
		},
		{
			srs_rank: { '<' : 3 } ,
            		last_studied: { '<': tdate3 }
		},
		{
			srs_rank: { '<' : 4 } ,
            		last_studied: { '<': tdate4 }
		},
		{
			srs_rank: { '<' : 5 } ,
            		last_studied: { '<': tdate5 }
		},
		{
			srs_rank: { '<' : 6 } ,
            		last_studied: { '<': tdate6 }
		},
		{
			srs_rank: { '<' : 7 } ,
            		last_studied: { '<': tdate7 }
		}
	      ],
	    or: true
	  });
	  let idx = Math.floor(Math.random() * rows.length);
	  let word = rows[idx];


	  let words = [];
	  let options = [];

	  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

	  if (rows.length > 4) {
	    while (options.length < 4) {
	      shuffleArray(rows);
	      if (!options.includes(rows[0].field1)) {
		words.push(rows[0]);
		options.push(rows[0].field1);
	      }
	    }
	  } else {
	    words.push({
	      english : "good",
	      pinyin  : "hao3",
	      field1 : "good",
	      field2 : "hao3",
	      field3 : "好",
	      field4 : "好",
	    });
	    words.push({
	      english : "ok",
	      pinyin  : "xing2",
	      field1 : "ok",
	      field2 : "xing2",
	      field3 : "行",
	      field4 : "行",
	    });
	    words.push({
	      english : "to eat",
	      pinyin  : "chi1",
	      field1 : "to eat",
	      field2 : "chi1",
	      field3 : "吃",
	      field4 : "吃",
	    });
	    words.push({
	      english : "to go",
	      pinyin  : "zou3",
	      field1 : "to go",
	      field2 : "zou3",
	      field3 : "走",
	      field4 : "走",
	    });
	  }

	  //
	  // substitute random entry for our test
	  //
	  let correct = Math.floor(Math.random() * 4);
	  if (word != null) {
	    words[correct] = word;
	  } else {
	    word = words[correct];
	  }

	  let option1 = "";
	  let option2 = "";
	  let option3 = "";
	  let option4 = "";
	  let question = "";
	  let english = "";

console.log("#");
console.log("#");
console.log("# words length: " + words.length);
console.log(JSON.stringify(words));

	  //
	  // options depend on question type
	  //
	  if (question_type === "multiple_choice_english") {
	    option1 = words[0].field1;
	    option2 = words[1].field1;
	    option3 = words[2].field1;
	    option4 = words[3].field1;
	    question = word.field3;
	    english = word.field1;
	    pinyin = word.field2;
	  }
	  if (question_type === "multiple_choice_pinyin") {
	    option1 = words[0].field2;
	    option2 = words[1].field2;
	    option3 = words[2].field2;
	    option4 = words[3].field2;
	    question = word.field3;
	    english = word.field1;
	    pinyin = word.field2;
	  }


	  
 	  obj = {
	    lesson_id : word.lesson_id ,
	    word_id : word.id ,
	    question_type : question_type ,
	    question : question ,
	    english : english ,
	    pinyin : pinyin ,
	    language : "chinese" ,
	    option1 : option1 ,
	    option2 : option2 ,
	    option3 : option3 ,
	    option4 : option4 ,
	    correct : `option${correct+1}` ,
	    answer : "" ,
	    hint : "" ,
            source_audio_url : 'http://popupchinese.com/data/'
	  }

	  return obj;

	}

	async saveAnswer(obj) {

		if (!obj) { return; } 
		if (!obj.wid) { return; } 
       
                //	{
                //                wid: wid,
                //                lid: lid,
                //                last_question_data: last_question_data,
                //                requested_wid: requested_wid,
                //                source: source,
                //                correct: answered_correctly
                //	}
		let rows = await this.localDB.select({
			from: 'vocabulary',
			where: { id : obj.wid }
		});

		for (let i = 0; i < rows.length; i++) {

			let dset = {};
			let dwhere = {};
			dwhere.id = rows[i].id;

			if (obj.correct) {
			  dset.last_studied = new Date().getTime();
			  dset.last_correct= dset.last_studied;
			  dset.times_studied = rows[i].last_studied++;
			  dset.times_correct = rows[i].times_correct++;
			} else {
			  dset.last_studied = new Date().getTime();
			  dset.times_studied = rows[i].last_studied++;
			  dset.times_incorrect = rows[i].times_incorrect++;
			}

			try {
			  let rowsUpdated = await this.localDB.update({
				in : 'vocabulary' ,
				set : dset ,
				where : dwhere 
			  });
			} catch (err) {
			  console.log("ERROR: " + JSON.stringify(err));
			}
		}
	}




        webServer(app, expressapp, express) {

                let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
                let popup_self = this;

                expressapp.get('/' + encodeURI(this.returnSlug() + '/lessons'), async function (req, res) {
                        let html = PopupHome(app, popup_self, app.build_number);
                        if (!res.finished) {
                                res.setHeader('Content-type', 'text/html');
                                res.charset = 'UTF-8';
                                return res.send(html);
                        }
                        return;
                });

                expressapp.get('/' + encodeURI(this.returnSlug() + '/lessons/*'), async function (req, res) {
                        let html = PopupHome(app, popup_self, app.build_number);
                        if (!res.finished) {
                                res.setHeader('Content-type', 'text/html');
                                res.charset = 'UTF-8';
                                return res.send(html);
                        }
                        return;
                });

	}


}

module.exports = Popup;
