const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/ui/saito-header/saito-header');
const PopupHome = require('./index.js');
const PopupLesson = require('./lib/lesson');
const PopupVocab = require('./lib/vocab');
const PopupReview = require('./lib/review');
const PopupMain = require('./lib/main');
const PopupLessonManager = require('./lib/manager');
const PeerService = require('saito-js/lib/peer_service').default;
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
		this.show_vocab = false;

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


		// define database and version
		this.dbName = 'popup';
		this.dbVersion = 1;


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
	async initializeDatabase() {

	    if (!this.browser_active) { return; }

	    return new Promise((resolve, reject) => {
	        // Open (or create) the database
	        const request = indexedDB.open(this.dbName, this.dbVersion);
	
	        request.onerror = (event) => {
	            console.error('Database error:', event.target.errorCode);
	            reject(new Error('Failed to open database'));
	        };
	
	        request.onsuccess = async (event) => {
	            this.localDB = event.target.result;
	            console.log('Database opened successfully:', this.localDB.name);
            
	            // Wait for the database initialization logic to complete
	            try {
	                let x = await this.returnVocab();
	                if (x.length > 0) {
	                    this.show_vocab = true;
	                }
                
	                // Resolve the Promise after all initialization is done
	                resolve(this.localDB);
	            } catch (error) {
	                reject(error);  // If something goes wrong during the vocab check
	            }
        	};

        	request.onupgradeneeded = (event) => {
        	    this.localDB = event.target.result;
        	    console.log('Database upgrade needed. Creating object stores...');
	
	            // Create an object store (table) if it doesn't exist
	            if (!this.localDB.objectStoreNames.contains('vocabulary')) {
	                const objectStore = this.localDB.createObjectStore('vocabulary', { keyPath: 'id', autoIncrement: true });
	
	                // Create an index if needed
	                objectStore.createIndex('field3', 'field3', { unique: true });
	                objectStore.createIndex('field4', 'field4', { unique: true });
	                objectStore.createIndex('lesson_id', 'lesson_id', { unique: false });
	                objectStore.createIndex('label', 'label', { unique: false });
	                objectStore.createIndex('last_studied', 'last_studied', { unique: false });
	                objectStore.createIndex('srs_rank', 'srs_rank', { unique: false });

	                console.log('Object store "vocabulary" created');
	            }
	        };
	    });
	}


	async initialize(app) {

		//
		// database setup etc.
		//
		await super.initialize(app);

		if (!this.app.BROWSER) { return; }

		await this.initializeDatabase();
		this.show_vocab = await this.doesVocabExist();

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
			this.lessonui = new PopupLesson(this.app, this);
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

		if (this.urlpath.length >= 2) {
			if (this.urlpath[1] == "review" || this.urlpath[1] == "vocab") {
				this.app.connection.emit('popup-vocab-render-request');
				return;
			}
			if (this.urlpath[1] == "lessons") {
				if (this.urlpath.length > 2) {
					if (this.urlpath[2] == "absolute-beginners") { this.app.connection.emit('popup-lessons-render-request', ("absolute-beginners")); }
					if (this.urlpath[2] == "elementary") { this.app.connection.emit('popup-lessons-render-request', ("elementary")); }
					if (this.urlpath[2] == "intermediate") { this.app.connection.emit('popup-lessons-render-request', ("intermediate")); }
					if (this.urlpath[2] == "advanced") { this.app.connection.emit('popup-lessons-render-request', ("advanced")); }
					if (this.urlpath[2] == "film-friday") { this.app.connection.emit('popup-lessons-render-request', ("film-friday")); }
					if (this.urlpath[2] == "quiz-night") { this.app.connection.emit('popup-lessons-render-request', ("quiz-night")); }
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
						if (this.manager.waiting_to_display == true ) {
							this.manager.render(this.manager.level);
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
					this.lesson.sentences = res.rows;
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
					this.lesson.questions = res3.rows;
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


	async doesVocabExist() {
		try {
	    		const transaction = this.localDB.transaction(['vocabulary'], 'readonly');
    			const objectStore = transaction.objectStore('vocabulary');
    			const request = objectStore.count();
	
		    	const count = await new Promise((resolve, reject) => {
		        	request.onsuccess = (event) => resolve(event.target.result);
		        	request.onerror = (event) => reject(event.target.error);
		    	});
	
		    	return count > 0;  // Return true or false based on the count
		} catch (err) {
			return false;
		}

		return false;
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
		obj.field1 = field1 || '';
		obj.field2 = field2 || '';
		obj.field3 = field3 || '';
		obj.field4 = field4 || '';
		obj.field5 = field5 || '';
		obj.lesson_id = lesson_id || 0;
		obj.label = label || '';
		obj.audio_source = "";
		obj.audio_translation = "";
		obj.display_order = 0;
		obj.created_at = new Date().getTime();
		obj.updated_at = new Date().getTime();
		obj.last_correct = 0;
		obj.times_studied = 0;
		obj.times_correct = 0;
		obj.times_incorrect = 0;
		obj.srs_rank = 0;


                const transaction = this.localDB.transaction(['vocabulary'], 'readwrite');
                const objectStore = transaction.objectStore('vocabulary');

		const request = objectStore.add(obj);


		request.onsuccess = async () => {
		       	console.log('Vocabulary added successfully:', obj);
    		};

	    	request.onerror = (event) => {
        		console.error('Error adding vocabulary:', event.target.error);
    		};

	}



	async returnVocab(offset = 0, limit = 10) {
	    if (!this.browser_active) { return; }
	    if (!this.app.BROWSER) {
	        return [];
	    }

	    return new Promise((resolve, reject) => {
	        const transaction = this.localDB.transaction(['vocabulary'], 'readonly');
	        const objectStore = transaction.objectStore('vocabulary');
        
	        const request = objectStore.openCursor();
	        const allEntries = [];
	        let index = 0;
	
	        request.onsuccess = (event) => {
	            const cursor = event.target.result;

	            if (cursor) {
	                if (index >= offset && allEntries.length < limit) {
	                    allEntries.push(cursor.value);
	                }
	                index++;
	                cursor.continue();
	            } else {
	                console.log('Fetched vocabulary entries:', allEntries);
	                resolve(allEntries);
	            }
	        };

        	request.onerror = (event) => {
        	    console.error('Error fetching vocabulary entries:', event.target.error);
        	    reject(event.target.error);
        	};
    	    });
	}



async loadQuestion() {
    return new Promise((resolve, reject) => {
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

        const transaction = this.localDB.transaction(['vocabulary'], 'readonly');
        const objectStore = transaction.objectStore('vocabulary');

        // Use a cursor to fetch and filter records
        const request = objectStore.openCursor();
        const rows = [];

	let last_entry = "";

        request.onsuccess = (event) => {

            const cursor = event.target.result;

            if (cursor) {

                // Check the conditions for filtering the rows
                if (
                    (cursor.value.srs_rank === 0) || 
                    (cursor.value.srs_rank === 1 && cursor.value.last_studied < tdate1) ||
                    (cursor.value.srs_rank < 2 && cursor.value.last_studied < tdate2) ||
                    (cursor.value.srs_rank < 3 && cursor.value.last_studied < tdate3) ||
                    (cursor.value.srs_rank < 4 && cursor.value.last_studied < tdate4) ||
                    (cursor.value.srs_rank < 5 && cursor.value.last_studied < tdate5) ||
                    (cursor.value.srs_rank < 6 && cursor.value.last_studied < tdate6) ||
                    (cursor.value.srs_rank < 7 && cursor.value.last_studied < tdate7)
                ) {
                    rows.push(cursor.value);
                }

		last_entry = cursor.value;
                cursor.continue();

            } else {

		if (rows.length == 0) {
			if (last_entry) {
				rows.push(last_entry);
			}
		}

                // Resolve with a random row if rows exist
                if (rows.length > 0) {

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

	  		resolve(obj);

                } else {
                    resolve(null);  // No matching rows found
                }
            }
        };

        request.onerror = (event) => {
            console.error('Error fetching vocabulary:', event.target.error);
            reject(event.target.error);  // Reject on error
        };
    });
}




async saveAnswer(obj) {
    return new Promise((resolve, reject) => {

        // Open a transaction to the 'vocabulary' object store in readwrite mode
        const transaction = this.localDB.transaction(['vocabulary'], 'readwrite');
        const objectStore = transaction.objectStore('vocabulary');
        
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

        const request = objectStore.get(obj.wid);
        
        request.onsuccess = (event) => {
            const word = event.target.result;

            if (word) {
                word.updated_at = new Date().getTime();  // Update the timestamp

                if (obj.correct) {
                  word.last_studied = new Date().getTime();
                  word.last_correct = word.last_studied;
                  word.times_studied++;
                  word.times_correct++;
                  word.srs_rank++;
                } else {
                  word.last_studied = new Date().getTime();
                  word.times_studied++;
                  word.times_incorrect++;
                  word.srs_rank = 0;
		}

                // Put the updated word back into the database
                const updateRequest = objectStore.put(word);

                updateRequest.onsuccess = () => {
                    console.log('Vocabulary updated successfully:', word);
                    resolve(word);  // Resolve with the updated word
                };

                updateRequest.onerror = (updateError) => {
                    console.error('Error updating vocabulary:', updateError.target.error);
                    reject(updateError.target.error);  // Reject if there's an error updating
                };
            } else {
                console.error('No word found with the provided ID');
                reject(new Error('No word found with the provided ID'));  // Reject if the word doesn't exist
            }
        };

        request.onerror = (event) => {
            console.error('Error retrieving word:', event.target.error);
            reject(event.target.error);  // Reject if there's an error retrieving the word
        };
    });
}






        webServer(app, expressapp, express) {

                let webdir = `${__dirname}/../../mods/${this.dirname}/web`;
                let popup_self = this;

                expressapp.get('/' + encodeURI(this.returnSlug() + '/review'), async function (req, res) {
                        let html = PopupHome(app, popup_self, app.build_number);
                        if (!res.finished) {
                                res.setHeader('Content-type', 'text/html');
                                res.charset = 'UTF-8';
                                return res.send(html);
                        }
                        return;
                });

                expressapp.get('/' + encodeURI(this.returnSlug() + '/review/*'), async function (req, res) {
                        let html = PopupHome(app, popup_self, app.build_number);
                        if (!res.finished) {
                                res.setHeader('Content-type', 'text/html');
                                res.charset = 'UTF-8';
                                return res.send(html);
                        }
                        return;
                });

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

    		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
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

    		expressapp.use('/' + encodeURI(this.returnSlug()), express.static(webdir));
	}


}

module.exports = Popup;
