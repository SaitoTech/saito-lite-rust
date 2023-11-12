const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const PopupLesson = require("./lib/lesson");
const PopupMenu = require("./lib/menu");
const PopupReview = require("./lib/review");
const PopupMain = require("./lib/main");
const PopupLessonManager = require("./lib/manager");
const PeerService = require("saito-js/lib/peer_service").default;
const localforage = require("localforage");

class Popup extends ModTemplate {

  constructor(app) {
    super(app);
    this.appname = "Popup Chinese";
    this.name = "Popup";
    this.slug = "popup";
    this.description = "Chinese Language Education on the Saito Network";
    this.categories = "Social Entertainment";
    this.icon_fa = "fa-solid fa-language";

    this.styles = ["/popup/style.css"];
    this.peers = [];

    this.social = {
      twitter_card: "summary",
      twitter_site: "@SaitoOfficial",
      twitter_creator: "@SaitoOfficial",
      twitter_title: "Popup Chinese",
      twitter_url: "https://popupchinese.com/",
      twitter_description: "Popup Chinese - Learn Chinese" ,
      twitter_image: "https://saito.tech/wp-content/uploads/2022/04/saito_card_horizontal.png",
      og_title: "Popup Chinese" ,
      og_url: "https://popupchinese.com",
      og_type: "website",
      og_description: "Popup Chinese - Learn Chinese",
      og_site_name: "Popup Chinese",
      og_image: "https://popupchinese.com",
      og_image_url: "https://popupchinese.com",
      og_image_secure_url:
        "https://popupchinese.com",
    };

    this.lessons = [];
    this.offset = 0;

    return this;
  }

  returnServices() {
    let services = [];
    services.push(new PeerService(null, "popup", "Popup Language Archive"));
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
    // fetch content from options file
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

      this.addComponent(this.header);
      this.addComponent(this.main);
      this.addComponent(this.menu);

      //
      // chat manager can insert itself into left-sidebar if exists
      //
//      for (const mod of this.app.modules.returnModulesRespondingTo("chat-manager")) {
//        let cm = mod.respondTo("chat-manager");
//        cm.container = ".saito-sidebar.left";
//        cm.render_manager_to_screen = 1;
//        this.addComponent(cm);
//      }

    }

    await super.render();

    this.app.connection.emit("popup-home-render-request");

  }



  ////////////////////////////
  // fetch language content //
  ////////////////////////////
  async onPeerServiceUp(app, peer, service = {}) {

    //
    // avoid network overhead if in other apps
    //
    if (!this.browser_active) { return; }

    //
    // load available lessons / media
    //
    if (service.service === "popup") {

      if (!this.peers.includes(peer.publicKey)) { this.peers.push(peer.publicKey); }

      //
      // sql request
      //
      let sql = `SELECT lessons.id, lessons.title, lessons.content, lessons.slug, lessons.photo, users.username, users.userslug
                   FROM lessons JOIN users 
                   WHERE users.id = lessons.user_id AND promoted = 1
                   ORDER BY lessons.created_at DESC`;
      this.sendPeerDatabaseRequestWithFilter(
	"Popup", 
	sql, 
	async (res) => {
	  let_lesson_id = 0;
          if (res.rows) {
            for (let record of res.rows) { this.addLesson(record); }
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

  loadLesson(lesson) {

    if (!lesson) { return; }

    let sql;

    //
    // sql request
    //
    sql = `SELECT *
               FROM sentences
               WHERE lesson_id = ${lesson.id} 
               ORDER BY display_order ASC`;
    this.sendPeerDatabaseRequestWithFilter(
        "Popup", 
	sql, 
	async (res) => {
          if (res.rows) {
	    lesson.sentences = res.rows;
	    mycallback(lesson);
            return;
          }
        },
        (p) => {
  	  if (p.publicKey == peer.publicKey) { return 1; }
          return 0;
        }
    );

  }
  ///////////////////////
  // network functions //
  ///////////////////////
  async onConfirmation(blk, tx, conf) {

    let txmsg = tx.returnMessage();

    if (conf === 0) {
      console.log("%%");
      console.log("NEW TRANSACTION RECEIVED!");
      console.log("txmsg: " + JSON.stringify(txmsg));
    }

  }

  ///////////////////////////////
  // content loading functions //
  ///////////////////////////////
  loadLessons(mycallback) {

  }




  ////////////////
  // add lesson //
  ////////////////
  async addLesson(lesson) {
    let add_me = true;
    for (let i = 0; i < this.lessons.length; i++) { if (this.lessons[i].id === lesson.id) { return; } }
    this.lessons.push(lesson);
  }

  async fetchLessonSentences(lesson, mycallback=null) {
    let sql = `SELECT sentences.speaker_text, sentences.speaker_translation, sentences.sentence_text, sentences.sentence_translation, sentences.display_order, sentences.audio_source, sentences.audio_translation, sentences.video_start, sentences.video_stop, sentences.youtube_start, sentences.youtube_stop, sentences.youku_start, sentences.youku_stop FROM sentences WHERE sentences.lesson_id = ${lesson.id} ORDER BY display_order ASC`;
    this.sendPeerDatabaseRequestWithFilter(
      	"Popup", 
      	sql, 
        async (res) => {
	  if (res.rows) {
            lesson.sentences = res.rows;
	    mycallback(lesson);
          }
        },
        (p) => {
  	  if (this.peers.includes(p.publicKey)) {
            return 1; 
          }
          return 0;
        }
    );
  }

  async fetchLessonQuestions(lesson, mycallback=null) {
    let sql = `SELECT questions.question, questions.answer1, questions.answer2, questions.answer3, questions.answer4, questions.correct, questions.display_order, questions.audio, questions.question_image, questions.explanation, questions.audio_transcript FROM questions WHERE questions.lesson_id = ${lesson.id} ORDER BY display_order ASC`;
console.log(sql);
    this.sendPeerDatabaseRequestWithFilter(
      	"Popup", 
      	sql, 
        async (res) => {
	  if (res.rows) {
            lesson.questions = res.rows;
	    mycallback(lesson);
          }
        },
        (p) => {
  	  if (this.peers.includes(p.publicKey)) {
            return 1; 
          }
          return 0;
        }
    );
  }

  async fetchLessonVocabulary(lesson, mycallback=null) {
    let sql = `SELECT words.audio_source, words.audio_translation, words.field1, words.field2, words.field3, words.field4, words.field5 FROM words WHERE words.lesson_id = ${lesson.id} ORDER BY display_order ASC`;
console.log(sql);
    this.sendPeerDatabaseRequestWithFilter(
      	"Popup", 
      	sql, 
        async (res) => {
	  if (res.rows) {
            lesson.words = res.rows;
	    mycallback(lesson);
          }
        },
        (p) => {
  	  if (this.peers.includes(p.publicKey)) {
            return 1; 
          }
          return 0;
        }
    );
  }

  returnLesson(lesson_id = null) {

    for (let i = 0; i < this.lessons.length; i++) {
      if (this.lessons[i].id == lesson_id) { return this.lessons[i]; }
    }

    return {
      level : "Unknown" ,
      title : "Placeholder Title" ,
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
      this.app.options.popup.display = {}
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
          } catch (err) {
	  }
        }
        //this.app.connection.emit("redsquare-home-render-request");
      }
    });

  }


  save() {

    if (!this.app.options?.popup) {
      this.app.options.popup = {};
      this.app.options.popup.display = {}
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

}

module.exports = Popup;
