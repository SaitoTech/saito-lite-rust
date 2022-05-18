const saito = require("./../../lib/saito/saito");
const AppTemplate = require("../../lib/templates/apptemplate");
const SaitoHeader = require("../../lib/saito/ui/saito-header/saito-header");
const SaitoOverlay = require("../../lib/saito/ui/saito-overlay/saito-overlay");
const ChirpSidebar = require("./lib/chirp/chirp-sidebar");
const ChirpFeed = require("./lib/chirp/chirp-feed");
const ChirpNew = require("./lib/chirp/chirp-new");
const ChirpBaseTemplate = require('./lib/chirp/chirp-base-template');

class Chirp extends AppTemplate {

  constructor(app) {
    super(app);

    this.name = "Chirp";
    this.description = "Twitter-style Social Media Network on Saito";
    this.categories = "Social Information Community";

    this.events = ["chat-render-request"];
    this.icon_fa = "fas fa-crow";
    this.mods = [];
    this.affix_callbacks_to = [];

    this.header = null;
    this.overlay = null;

  }

  //
  // returnServices
  //
  // if peers are running this module, they will notify each other when they connect. this
  // isn't particularly useful now, but it might be useful for friends who connect directly
  // to each other and sync their posts. we could have browsers auto-ask for relevant content
  // from their friends on-connect for instance, allowing gossip-like content dissemination 
  // without the need for commercial data storage..
  //

  initialize(app) {
    const meta = [];
    const styles = ['/chirp/style.css'];
    const scripts = []
    super.initialize(app, meta, styles, scripts);
  }

  initializeHTML(app, additionalURL) {
    super.initializeHTML(app, additionalURL)
  }
  // chirp

  returnServices() {
    let services = [];
    services.push({ service: "chirp", domain: "saito" });
    return services;
  }


  //
  // receiveEvent
  //
  // receiveEvent is used to send-and-receive events across the Saito application suite.
  // you subscribe to them by specifying their name in the events[] in the constructor, 
  // and then provide the code that executes when a match is hit below.
  //
  // receiveEvent(type, data) {
  //   if (type == "chat-render-request") {
  //     if (this.browser_active) {

  //       //
  //       // auto-open chat box! 
  //       //
  //       if (this.app.options.auto_open_chat_box == undefined) {
  //         this.app.options.auto_open_chat_box = 1;
  //         this.app.storage.saveOptions();
  //       }

  //       //
  //       // render sidebar (with chat)
  //       //
  //       this.renderSidebar();

  //       //
  //       // if chat exists open chat box
  //       //
  //       try {
  //         let chat_mod = this.app.modules.returnModule("Chat");
  //         if (chat_mod.groups.length > 0 && this.chat_open == 0 && this.app.options.auto_open_chat_box) {
  //           this.chat_open = 1;
  //           chat_mod.openChatBox();
  //         }
  //       } catch (err) {
  //         console.log("Err: " + err);
  //       }
  //     }
  //   }
  // }

  returnBaseHTML(app) {
    return ChirpBaseTemplate(app)
  }




  //
  // renderMain
  //
  // calling these functions will write the main column of the application. we specify that
  // this should only happen if the user is looking at this application, to avoid situations
  // where the browser tries to renderMain() while the user is interacting with another 
  // application.
  //
  render() {
    if (this.browser_active == 1) {
      ChirpFeed.render(this.app, this);
      ChirpFeed.attachEvents(this.app, this);
    }
  }

  //
  // renderSidebar
  //
  // we separate this from renderMain() simply because we are allowing the Chat module to 
  // insert its chat box into the left-hand sidebar. This allows us to call renderSidebar()
  // when chat-render-request fires and avoid the need to re-write the entire screen.
  //
  renderSidebar() {
    if (this.browser_active == 1) {
      ChirpSidebar.render(this.app, this);
      ChirpSidebar.attachEvents(this.app, this);
    }
  }


  //
  // respondTo()
  //
  // this function allows Chirp to respond to other modules and components, such as would be
  // needed to insert a settings panel in the /dev center, or even add this module to the 
  // Arcade as a game. Here we announce support for two forms of integration:
  //
  // 1. adding a link to the slide-in header-menu if viewing Chirp
  // 2. adding a link to Chirp to the header-menu Navigation section
  //
  respondTo(type = "") {
    let chirp_mod = this;

    //
    // New Chirp -- add to slide-in menu!
    //
    if (type == "header-menu") {
      if (this.browser_active) {
        return {
          returnMenu: function (app, mod) {
            return `
              <div class="wallet-action-row" id="header-dropdown-new-chirp">
                <span class="scan-qr-info"><i class="settings-fas-icon fas fa-crow"></i> New Chirp</span>
              </div>
      `;
          },
          attachEvents: function (app, mod) {
            document.querySelectorAll("#header-dropdown-new-chirp").forEach((element) => {
              element.onclick = (e) => {
                alert("HTML Overlay?");
                ChirpNew.render(app, mod);
                ChirpNew.attachEvents(app, mod);
              };
            });
          },
        };
      }
    }

    //
    // add Chirp to Navigation Menu
    //
    if (type == "header-dropdown") {
      return {
        name: this.appname ? this.appname : this.name,
        icon_fa: this.icon_fa,
        browser_active: this.browser_active,
        slug: this.returnSlug(),
      };
    }
    return null;
  }


  //
  // initialize()
  //
  // this function runs every time Saito initializes, which is the first time the server
  // loads and every time the browser is refreshed. This function is a suitable place
  // for initializing the DOM and attaching events.
  //
  // be aware that this function fires EVERY time Saito initializes regardless of 
  // whether the user is actually VIEWING the application. If we want to restrict code
  // to running ONLY when the user is viewing this application, we should wrap code
  // with a check against (this.browser_active == 1).
  //
  //


  //
  // initializeHTML()
  //
  // this function is similar to initialize() except it only runs for the module that 
  // the user is actively viewing. this makes it a superior place to put DOM creation
  // and event attachment. 
  //
  // initializeHTML(app) {

  //   this.header = new SaitoHeader(app, this);
  //   this.header.render(app, this);
  //   this.header.attachEvents(app, this);

  //   this.overlay = new SaitoOverlay(app);

  //   this.renderMain();
  //   this.renderSidebar();

  // }

  //
  // load transactions when the network goes up
  //
  onPeerHandshakeComplete(app, peer) {

    //
    // don't fetch if not viewing
    //
    if (this.browser_active == 0) { return; }

    let chirp_self = this;

    //
    // ask Chirp-supporting peers for posts !
    //
    let sql = `SELECT * FROM chirps`;
    this.sendPeerDatabaseRequestWithFilter(

      "Chirp",

      sql,

      (res) => {
        if (res.rows) {
          //alert("fetched posts: " + res.rows.length);
        }
      }
    );
  }


  //
  // onConfirmation()
  //
  // this is the function transactions hit when they come in over the blockchain. let's 
  // do something when we receive one on its first confirmation.
  //
  async onConfirmation(blk, tx, conf, app) {

    let txmsg = tx.returnMessage();

    try {

      if (conf == 0) {

        if (txmsg.module === "Chirp" && txmsg.request == "post") {
          console.log("Received: " + JSON.stringify(txmsg));
        }
      }

    } catch (err) {
      console.log("ERROR in arcade: " + err);
    }

  }

  //
  // handlePeerRequest()
  //
  // this is the function that is handed off-chain peer-to-peer messages. usually these
  // messages will include a transaction that can be sent to the same functions for 
  // processing as those called by onConfirmation. This permits the same code to service
  // both on-chain and off-chain message-passing.
  //
  async handlePeerRequest(app, message, peer, mycallback = null) {

    //
    // this code doubles onConfirmation
    //
    if (message.request === "chirp post") {

      let tx = null;

      if (message.data.tx) {
        tx = new saito.default.transaction(message.data.tx);
      }

      let txmsg = tx.returnMessage();

      if (txmsg.module === "Chirp" && txmsg.request === "post") {
        console.log("Received " + JSON.stringify(txmsg) + " off-chain");
      }
    }

    super.handlePeerRequest(app, message, peer, mycallback);

  }


  async receivePost(app, tx) {
    console.log("receive post function");
    /****
        let sql2 = `INSERT INTO invites (
                    game_id ,
                    player ,
                    acceptance_sig ,
                    module ,
                    created_at ,
                    expires_at
                  ) VALUES (
                    $game_id ,
                    $player ,
                    $acceptance_sig ,
                    $module ,
                    $created_at ,
                    $expires_at
                  )`;
        let params2 = {
          $game_id: game_id,
          $player: player,
          $acceptance_sig: acceptance_sig,
          $module: module,
          $created_at: created_at,
          $expires_at: expires_at,
        };
        await app.storage.executeDatabase(sql2, params2, "arcade");
    ****/
    return;
  }


  createPost() {


    let html = `


    `;



  }

  createPostTransaction(message) {

    let recipient = this.app.wallet.returnPublicKey();

    let newtx = this.app.wallet.createUnsignedTransaction(recipient);
    newtx.msg = {
      module: "Chirp",
      request: "open",
      message: "This is our post",
    };

    newtx = this.app.wallet.signTransaction(newtx);
    this.app.network.propagateTransaction(newtx);

  }


  //
  // shouldAffixCallbackToModule()
  //
  // if we want to process transactions for other modules, such as game invites or 
  // email or chat messages, we can tell Saito that we want to receive these 
  // transactions in onConfirmation() in addition to our standard Chirp transactions.
  //
  shouldAffixCallbackToModule(modname) {
    if (modname == "Chirp") { return 1; }
    return 0;
  }

}

module.exports = Chirp;

