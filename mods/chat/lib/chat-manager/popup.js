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
    this.width = 0;
    this.height = 0;
  }

  remove() {
    let popup_qs = ".chat-popup-" + this.group.id;
    console.log("removing: " + popup_qs);
    document.querySelector(popup_qs).remove();
  }

  render() {
    //
    // exit if group unset
    //
    if (this.group == null) {
      return;
    }

    //
    // exit if manually minimized
    //
    if (this.manually_closed) {
      return;
    }

    //
    // our query selector
    //
    let popup_qs = ".chat-popup-" + this.group.id;
    let popup_id = "chat-popup-" + this.group.id;
    let header_id = "chat-header-" + this.group.id;
    let input_id = "chat-input-" + this.group.id;

    let existing_input = "";

    if (document.getElementById(input_id)) {
      existing_input = document.getElementById(input_id).innerHTML;
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
      this.app.browser.replaceElementBySelector(
        ChatPopupTemplate(this.app, this.mod, this.group),
        popup_qs
      );
      this.x_pos = rect.left;
      this.y_pos = rect.top;
      this.width = rect.width;
      this.height = rect.height;
      obj = document.querySelector(popup_qs);
      obj.style.left = this.x_pos + "px";
      obj.style.top = this.y_pos + "px";
      obj.style.width = this.width + "px";
      obj.style.height = this.height + "px";
    } else {
      this.app.browser.addElementToDom(ChatPopupTemplate(this.app, this.mod, this.group));
    }

    //
    // now set left-position of popup
    //
    if (popups_on_page >= 1 && am_i_on_page == 0 && this.manually_moved == false) {
      this.x_pos = x_offset - x_range - 30;
      if (this.x_pos < 0) {
        this.x_pos = 0;
      }
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
    if (document.querySelector("." + popup_id + " .chat-body")) {
      document.querySelector("." + popup_id + " .chat-body").scroll(0, 1000000000);
    }
    //
    // re-render typed text
    //
    if (existing_input != "") {
      document.getElementById(input_id).innerHTML = existing_input;
      existing_input = "";
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
    let popup_id = "chat-popup-" + this.group.id;

    // add reply functionality

    document.querySelectorAll(`${popup_qs} .saito-userline-reply`).forEach((el) => {
      var clicked = el;
      el.addEventListener("click", (e) => {
        let quote = "<blockquote>";
        if (el.parentElement.previousElementSibling.innerText.length > 25) {
          quote +=
            "..." + el.parentElement.previousElementSibling.innerText.slice(-25) + "<br/><em>";
        } else {
          quote += el.parentElement.previousElementSibling.innerText + "<br/><em>";
        }
        if (el.parentElement.innerText.slice(0, -6).length > 60) {
          quote +=
            el.parentElement.innerText.slice(0, -6).substring(0, 60) + "...</em></blockquote><br/>";
        } else {
          quote += el.parentElement.innerText.slice(0, -6) + "</em></blockquote><br/>";
        }
        let chat_input =
          el.parentElement.parentElement.parentElement.nextElementSibling.querySelector(
            ".chat-input"
          );
        chat_input.innerHTML = quote.replaceAll("\n", "<br/>");
        chat_input.focus();
        const range = document.createRange();
        var sel = window.getSelection();
        range.setStart(chat_input, 2);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });

    try {
      //
      // close
      //
      document.querySelector(`${popup_qs} .chat-header .chat-container-close`).onclick = (e) => {
        this.manually_closed = true;
        document.querySelector(`${popup_qs}`).remove();
        app.storage.saveOptions();
      };

      //
      // minimize
      //
      let chat_bubble = document.getElementById(`${popup_qs} .chat-header .fa-comment-dots`);
      if (chat_bubble) {
        chat_bubble.onclick = (e) => {
          this.toggleDisplay();
        };
      }

      //
      // focus on text input
      //
      if (!mod.isOtherInputActive()) {
        document.getElementById(input_id).focus();
        document.execCommand("selectAll", false, null);
        document.getSelection().collapseToEnd();
      }

      //
      // submit
      //
      let msg_input = document.querySelector(`${popup_qs} .chat-footer .chat-input`);
      msg_input.onkeydown = (e) => {
        if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
          e.preventDefault();
          if (msg_input.innerHTML == "") {
            return;
          }
          let newtx = mod.createChatTransaction(group_id, msg_input.innerHTML);
          mod.sendChatTransaction(app, newtx);
          mod.receiveChatTransaction(app, newtx);
          msg_input.textContent = "";
          msg_input.innerHTML = "";
          if (document.getElementById(input_id)) {
            document.getElementById(input_id).innerHTML = "";
          }
        }
      };
      msg_input.onpaste = (e) => {
        var el = e.target;
        setTimeout(function () {
          el.innerHTML = el.innerHTML;
        }, 0);
      };

      //
      // submit (button)
      //
      document.querySelector(`${popup_qs} .chat-footer .chat-input-submit`).onclick = (e) => {
        e.preventDefault();
        if (msg_input.innerHTML == "") {
          return;
        }
        let newtx = mod.createChatTransaction(group_id, msg_input.innerHTML);
        mod.sendChatTransaction(app, newtx);
        mod.receiveChatTransaction(app, newtx);
        msg_input.textContent = "";
        msg_input.innerHTML = "";
        if (document.getElementById(input_id)) {
          document.getElementById(input_id).innerHTML = "";
        }
      };

      //
      // drag and drop images into chat window
      //

      app.browser.addDragAndDropFileUploadToElement(
        popup_id,
        async (filesrc) => {
          filesrc = await app.browser.resizeImg(filesrc, 230, 0.75); // (img, dimensions, quality)

          let img = document.createElement("img");
          img.classList.add("img-prev");
          img.src = filesrc;
          let msg = img.outerHTML;

          //if (msg.length > mod.max_msg_size) {
          //  salert("Image too large: 220kb max");
          //} else {

          let newtx = await mod.createChatTransaction(group_id, img.outerHTML); // img into msg
          await newtx.sign();
          await mod.sendChatTransaction(app, newtx);
          document.getElementById(input_id).innerHTML = ""; //clear the input div off of the image after sending chat transaction
          await mod.receiveChatTransaction(app, newtx);

          //}
        },
        false
      ); // false = no drag-and-drop image click
    } catch (err) {
      console.log("ERROR IN CHAT POPUP -- we can fix later: " + err);
    }
  }
}

module.exports = ChatPopup;
