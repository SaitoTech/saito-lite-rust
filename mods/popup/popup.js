const saito = require("./../../lib/saito/saito");
const ModTemplate = require("../../lib/templates/modtemplate");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const PopupLesson = require("./lib/ui/lesson");
const PopupMenu = require("./lib/ui/menu");
const PopupMain = require("./lib/ui/main");
const PopupLessonManager = require("./lib/ui/manager");
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

      //
      // sql request
      //
      let sql = `SELECT lessons.id, lessons.title, lessons.slug, lessons.photo, users.username, users.userslug
                   FROM lessons JOIN users 
                   WHERE users.id = lessons.user_id
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
	    
            return;
          }
        },
        (p) => {
  	  if (p.publicKey == peer.publicKey) { return 1; }
          return 0;
        }
    );


    //
    // sql request
    //
    sql = `SELECT *
               FROM words
               WHERE lesson_id = ${lesson.id} 
               ORDER BY display_order ASC`;
    this.sendPeerDatabaseRequestWithFilter(
        "Popup", 
	sql, 
	async (res) => {
          if (res.rows) {
	    lesson.words = res.rows;
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

    if (!this.app.options?.redsquare) {
      this.app.options.redsquare = {};
    }

    this.saveOptions();

  }

}

module.exports = Popup;
