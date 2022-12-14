const SaitoEmoji = require("../../../../lib/saito/new-ui/saito-emoji/saito-emoji");
const ChatPopupTemplate = require("./popup.template");

class ChatPopup {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.emoji = new SaitoEmoji(app, mod, `chat-input`);
    this.minimized = false;
    this.group = null;
  }

  render() {

    console.log("RENDER POPUP");
    if (!document.querySelector(`.chat-container`)) {
      this.app.browser.addElementToDom(`<div class="chat-container"> </div>`)
    }
    //
    // if group is unset, we do not know which chat group to render
    //

    if (this.group == null) {
      console.log("Chat Popup: requested rendering of unspecified group");
      return;
    }

    console.log("RENDER POPUP 2");

    //
    // replace element or insert into page
    //
    let popup_qs = ".chat-popup-" + this.group.id;
    if (document.querySelector(popup_qs)) {
      this.app.browser.replaceElementBySelector(ChatPopupTemplate(this.app, this.mod, this.group), popup_qs);
    } else {
      this.app.browser.addElementToSelectorOrDom(ChatPopupTemplate(this.app, this.mod, this.group), '.chat-container');
    }

    //
    // make it draggable
    //
    this.app.browser.makeDraggable(`chat-popup`, `chat-header`, true);

    //
    // emojis
    //
    //this.emoji.render(this.app, this.mod);

    //
    // scroll to bottom
    //
    //document.querySelector(".chat-body").scroll(0, 1000000000);

    //
    // attach events
    //
    this.attachEvents();

  }

  insertBackgroundTab(app, mod, gid) {
    let tabContainer = document.querySelector(".chat-group-tabs");
    if (tabContainer) {
      tabContainer.classList.add("show-multi");
    }

    let group = mod.returnGroup(gid);
    this.attachEvents(app, mod);
  }

  attachEvents() {

    let app = this.app;
    let mod = this.mod;

    try {


      //
      // close
      //
      document.querySelector(`#chat-container-close`).onclick = (e) => {
        this.minimized = false;
        mod.mute = true;
        document.getElementById(`chat-container`).remove();

        app.options.auto_open_chat_box = -1;
        app.storage.saveOptions();
      }

      //
      // minimize
      //
      let chat_bubble = document.getElementById(`chat-container-minimize`);
      if (chat_bubble) {
        chat_bubble.onclick = (e) => {
          this.toggleDisplay();
        }
      }

      //
      // focus on text input
      //
      if (!mod.isOtherInputActive()) {
        document.getElementById("chat-input").focus();
      }

      //
      // submit
      //
      let msg_input = document.getElementById("chat-input");

      msg_input.onkeydown = (e) => {
        if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
          e.preventDefault();
          if (msg_input.value == "") { return; }
          let newtx = mod.createChatTransaction(group_id, msg_input.value);
          mod.sendChatTransaction(app, newtx);
          mod.receiveChatTransaction(app, newtx);
          msg_input.value = "";
        }
      }

      //
      // submit (button)
      //
      document.getElementById("chat-input-submit").onclick = (e) => {
        e.preventDefault();
        if (msg_input.value == "") { return; }
        let newtx = mod.createChatTransaction(group_id, msg_input.value);
        mod.sendChatTransaction(app, newtx);
        mod.receiveChatTransaction(app, newtx);
        msg_input.value = "";
      }

      //
      // View Other tab
      //
      Array.from(document.getElementsByClassName("chat-group")).forEach((tab) => {
        if (!tab.classList.contains("active-chat-tab")) {
          tab.onclick = (e) => {
            let id = e.currentTarget.getAttribute("id");
            id = id.replace("chat-group-", "");

            this.app.options.auto_open_chat_box = id;
            this.app.storage.saveOptions();

            this.render(this.app, this.mod, id);
          };
        }
      });

    } catch (err) {
      console.log("ERROR IN CHAT POPUP -- we can fix later");
    }

  }

}

module.exports = ChatPopup;

