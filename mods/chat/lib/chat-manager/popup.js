const SaitoEmoji = require("../../../../lib/saito/ui/saito-emoji/saito-emoji");
const ChatPopupTemplate = require("./popup.template");

class ChatPopup {

  constructor(app, mod, container = "") {

    this.app = app;
    this.mod = mod;

    this.container = container;
    this.emoji = null;
    this.manually_closed = false;
    this.manually_moved = false;
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
    // exit if manually minimized
    //
    if (this.manually_closed) { return; }

    //
    // our query selector
    //
    let popup_qs = ".chat-popup-" + this.group.id;
    let popup_id = "chat-popup-" + this.group.id;
    let header_id = "chat-header-" + this.group.id;
    let input_id = "chat-input-" + this.group.id;

    let existing_input = "";

    if (document.getElementById(input_id)) {
      existing_input = document.getElementById(input_id).value;
    }

    //
    //
    //
    if (this.emoji == null) {
        this.emoji = new SaitoEmoji(this.app, this.mod, input_id);
    }

    //
    // calculate some values to determine position on screen...
    //
    let x_offset = 1000000;
    let x_range = 440;
    let popups_on_page = 0;
    let am_i_on_page = 0;

    document.querySelectorAll(".chat-popup").forEach((el) => {
        popups_on_page++;
	var rect = el.getBoundingClientRect();
        x_range = rect.right - rect.left;
        if (rect.left < x_offset) {
	  x_offset = rect.left;
	}
    });    

    if (document.querySelector(popup_qs)) {
      am_i_on_page = 1;
    }


    //
    // insert or replace popup on page
    //
    if (am_i_on_page == 1) {
      let obj = document.querySelector(popup_qs);
      var rect = obj.getBoundingClientRect();
      this.app.browser.replaceElementBySelector(ChatPopupTemplate(this.app, this.mod, this.group), popup_qs);
      this.x_pos = rect.left;
      this.y_pos = rect.top;
      obj = document.querySelector(popup_qs);
      obj.style.left = this.x_pos + "px";
      obj.style.top = this.y_pos + "px";
    } else {
      this.app.browser.addElementToDom(ChatPopupTemplate(this.app, this.mod, this.group));
    }

    //
    // now set left-position of popup
    //
    if (popups_on_page >= 1 && am_i_on_page == 0 && this.manually_moved == false) {
      this.x_pos = x_offset - x_range - 30;
      if (this.x_pos < 0) { this.x_pos = 0; }
      let obj = document.querySelector(popup_qs);
      obj.style.left = this.x_pos + "px";
    }

    //
    // make draggable
    //
    this.app.browser.makeDraggable(popup_id, header_id, true, () => {
      let obj = document.querySelector(popup_qs);
      var rect = obj.getBoundingClientRect();
      this.x_pos = rect.left;
      this.y_pos = rect.top;
      this.manually_moved = true;
    });

    //
    // emojis
    //
    this.emoji.render();

    //
    // scroll to bottom
    //
    document.querySelector(".chat-body").scroll(0, 1000000000);

    //
    // re-render typed text
    //
    if (existing_input != "") {
      document.getElementById(input_id).value = existing_input;
    }


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
    let group_id = this.group.id;
    let input_id = "chat-input-" + this.group.id;

    //
    // our query selector
    //
    let popup_qs = ".chat-popup-" + this.group.id;


    try {

      //
      // close
      //
      document.querySelector(`${popup_qs} .chat-header .chat-container-close`).onclick = (e) => {
        this.manually_closed = true;
        mod.mute = true;
        document.querySelector(`${popup_qs}`).remove();
        app.storage.saveOptions();
      }

      //
      // minimize
      //
      let chat_bubble = document.getElementById(`${popup_qs} .chat-header .fa-comment-dots`);
      if (chat_bubble) {
        chat_bubble.onclick = (e) => {
          this.toggleDisplay();
        }
      }

      //
      // focus on text input
      //
      if (!mod.isOtherInputActive()) {
        document.getElementById(input_id).focus();
      }

      //
      // submit
      //
      let msg_input = document.querySelector(`${popup_qs} .chat-footer .chat-input`);
      msg_input.onkeydown = (e) => {
        if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
          e.preventDefault();
          if (msg_input.textContent == "") { return; }
          let newtx = mod.createChatTransaction(group_id, msg_input.textContent);
          mod.sendChatTransaction(app, newtx);
          mod.receiveChatTransaction(app, newtx);
          msg_input.textContent = "";
        }
      }

      //
      // submit (button)
      //
      document.querySelector(`${popup_qs} .chat-footer .chat-input-submit`).onclick = (e) => {
        e.preventDefault();
        if (msg_input.textContent == "") { return; }
        let newtx = mod.createChatTransaction(group_id, msg_input.textContent);
        mod.sendChatTransaction(app, newtx);
        mod.receiveChatTransaction(app, newtx);
        msg_input.textContent = "";
      }

    } catch (err) {
      console.log("ERROR IN CHAT POPUP -- we can fix later: " + err);
    }

  }

}

module.exports = ChatPopup;

