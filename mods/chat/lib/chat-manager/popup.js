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

    this.x_pos = 0;
    this.y_pos = 0;

  }

  render() {

    //
    // exit if group unset
    //
    if (this.group == null) { return; }

    //
    // calculate some values to determine position on screen...
    //
    let x_offset = 1000000;
    let x_range = 440;
    let popups_on_page = 0;
    document.querySelectorAll(".chat-popup").forEach((el) => {
        popups_on_page++;
	var rect = el.getBoundingClientRect();
        x_range = rect.right - rect.left;
        if (rect.left < x_offset) {
	  x_offset = rect.left;
	}
    });    


    //
    // insert or replace popup on page
    //
    let popup_qs = ".chat-popup-" + this.group.id;
    if (document.querySelector(popup_qs)) {
      this.app.browser.replaceElementBySelector(ChatPopupTemplate(this.app, this.mod, this.group), popup_qs);
      popups_on_page--; // because one of them was me
    } else {
      this.app.browser.addElementToDom(ChatPopupTemplate(this.app, this.mod, this.group));
    }


    //
    // now set left-position of popup
    //
    if (popups_on_page >= 1) {
      this.x_pos = x_offset - x_range - 30;
      if (this.x_pos < 0) { this.x_pos = 0; }
      let obj = document.querySelector(popup_qs);
      obj.style.left = this.x_pos + "px";
    }


    //
    // make draggable
    //
    this.app.browser.makeDraggable(`chat-popup`, `chat-header`, true, () => {

	//
	//
	//
	let obj = document.querySelector(popup_qs);

	var rect = obj.getBoundingClientRect();
	console.log(rect.top, rect.right, rect.bottom, rect.left);

	this.x_pos = rect.left;
	this.y_pos = rect.top;

    });

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

