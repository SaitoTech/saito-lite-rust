const saito = require("./../../lib/saito/saito");
const Toggler = require('../../lib/saito/saito-ui/dark_mode_toggler');
const ModTemplate = require("../../lib/templates/modtemplate");
const ChirpMain = require("./lib/main/chirp-main");

class Chirp extends ModTemplate {

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
    this.darkModeToggler = new Toggler(app);

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
    const styles = ['/saito/chirp.css'];
    const scripts = []
    super.initialize(app, meta, styles, scripts);
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

  render(app) {


    if (this.browser_active == 1) {
      super.render(app)
      this.darkModeToggler.initialize();
      ChirpMain.render(this.app, this);
      ChirpMain.attachEvents(this.app, this);
    }
  }

  attachEvents(app) {

    const self = this;

    document.querySelector(".switch").addEventListener('click', (e) => {
      e.preventDefault();
      console.log('toggling dark mode')
      const slider = document.querySelector(".slider");
      console.log(slider.classList.contains("checked"));


      self.darkModeToggler.toggle();
      // self.eventListeners.push({ type: 'click', listener });
      if (slider.classList.contains("checked")) {
        slider.classList.remove("checked");
      } else {
        slider.classList.add("checked");
      }
    })

    document.querySelector("#menuToggle").addEventListener("click", this.toggleMenu);


    document.querySelector("#sidebar-toggle-mobile").addEventListener("click", () => {
      console.log('clicking')
      document.querySelector('.sidebar-mobile').classList.contains('display') == false ? document.querySelector('.sidebar-mobile').classList.add('display') : document.querySelector('.sidebar-mobile').classList.remove('display')

    });

    //  Chat events
    document.querySelector("#chat-container-close").addEventListener("click", () => {

      document.querySelector('.saito-chat-container').classList.remove('display-chat');
    });

    document.querySelectorAll(".saito-chat-toggle").forEach(item => {
      item.addEventListener("click", () => {
        const chatContainer = document.querySelector('.saito-chat-container');
        const chatBody = document.querySelector('.saito-chat-body');
        chatContainer.classList.contains('display-chat') == false ? chatContainer.classList.add('display-chat') : chatContainer.classList.remove('display-chat')
        chatBody.scroll({
          top: chatBody.scrollHeight,
          behavior: "smooth"
        })

      });

    })

    document.body.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {

        sendMessage()
      }
    })

    document.querySelector("#saito-sendmsg-btn").addEventListener('click', sendMessage)

    function sendMessage() {
      const chatInput = document.querySelector('#saito-chat-input');
      const chatBody = document.querySelector('.saito-chat-body')

      const time = `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()} `
      if (chatInput.value != "") {
        console.log(chatInput.value);
        const template = `<div class="saito-chat-bubble me"> 
           <div class="chat-dialog">
             <img src="/saito/img/account.svg"/>
             <div>
               <p class="saito-chat-address">kkadiaiudaol...</p>
               <p>${chatInput.value.trim()}</p>
    
             </div>
             <span>${time}</span>
           </div>
    
         </div>`;

        chatBody.insertAdjacentHTML('beforeend', template);
        chatInput.value = "";

        chatBody.scroll({
          top: chatBody.scrollHeight,
          behavior: "smooth"
        })

        console.log(template);
      }
    }




  }



  toggleMenu(e) {
    console.log("toggling menu");
    document
      .querySelector("#hamburger-contents")
      .classList.contains("show-menu")
      ? document
        .querySelector("#hamburger-contents")
        .classList.remove("show-menu")
      : document
        .querySelector("#hamburger-contents")
        .classList.add("show-menu");
  }




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

