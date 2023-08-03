const SaitoInput = require("../../../../lib/saito/ui/saito-input/saito-input");
const ChatPopupTemplate = require("./popup.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class ChatPopup {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;

    this.container = container;
    this.input = null; //new SaitoInput(this.app, this.mod, `#chat-popup-${this.group.id} .chat-footer`);
    this.manually_closed = false;
    this.is_rendered = false;

    this.width = "";
    this.height = "";

    this.group = null;

    this.overlay = new SaitoOverlay(app, mod);

    app.connection.on("chat-remove-fetch-button-request", (group_id) => {
      if (this.group?.id === group_id) {
        console.log("Button remove request");
        this.no_older_messages = true;
        if (document.querySelector("#chat-popup-" + this.group.id + " #load-older-chats")) {
          document.querySelector("#chat-popup-" + this.group.id + " #load-older-chats").remove();
        }
      }
    });

    app.connection.on("chat-popup-scroll-top-request", (group_id) => {
      if (this.group?.id === group_id) {
        let popup_qs = "#chat-popup-" + this.group.id;

        if (document.querySelector(popup_qs + " .chat-body")) {
          document.querySelector(popup_qs + " .chat-body").scroll(0, 0);
        }
      }
    });
  }

  remove() {
    let popup_qs = "#chat-popup-" + this.group.id;
    if (document.querySelector(popup_qs)) {
      document.querySelector(popup_qs).remove();
    }
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
    let popup_id = "chat-popup-" + this.group.id;
    let popup_qs = "#" + popup_id;

    //let input_id = "chat-input-" + this.group.id;
    if (!this.input) {
      this.input = new SaitoInput(this.app, this.mod, `#chat-popup-${this.group.id} .chat-footer`);
    }

    let existing_input = this.input.getInput();

    //
    // calculate some values to determine position on screen...
    //
    let x_offset = 1000000;
    let popups_on_page = 0;
    let am_i_on_page = 0;

    document.querySelectorAll(".chat-container").forEach((el) => {
      popups_on_page++;
      var rect = el.getBoundingClientRect();
      if (rect.left < x_offset) {
        x_offset = rect.left;
      }
    });

    if (document.querySelector(popup_qs)) {
      am_i_on_page = 1;
      this.restorePopup(document.querySelector(popup_qs));
    }

    //
    // insert or replace popup on page
    //
    if (am_i_on_page == 1) {
      let html = `<div class="chat-body">
                    ${
                      this?.no_older_messages
                        ? ""
                        : `<div id="load-older-chats" class="saito-chat-button" data-id="${this.group.id}">fetch earlier messages</div>`
                    }
                    ${this.mod.returnChatBody(this.group.id)}
                  </div>`;
      this.app.browser.replaceElementBySelector(html, popup_qs + " .chat-body");
    } else {
      if (this.container && !document.querySelector(this.container)) {
        console.warn("Chat popup has non-existent specified container");
        this.container = "";
      }
      if (this.container && document.querySelector(".chat-static")) {
        this.app.browser.replaceElementBySelector(
          ChatPopupTemplate(this.app, this.mod, this.group, this.container),
          ".chat-static"
        );
      } else {
        this.app.browser.addElementToSelectorOrDom(
          ChatPopupTemplate(this.app, this.mod, this.group, this.container),
          this.container
        );
      }

      //
      // now set left-position of popup
      //
      if (!this.container && popups_on_page > 0) {
        console.log("Reposition secondary popup");
        let obj = document.querySelector(popup_qs);
        let x_pos = x_offset - obj.getBoundingClientRect().width - 10;
        x_pos = Math.max(0, x_pos);
        obj.style.left = x_pos + "px";
      }

      //
      // inputs
      //
      this.input.render();
    }

    //
    // scroll to bottom
    //
    if (document.querySelector(popup_qs + " .chat-body")) {
      document.querySelector(popup_qs + " .chat-body").scroll(0, 1000000000);
    }

    //
    // re-render typed text
    //
    //if (existing_input != "") {
    //  this.input.setInput(existing_input);
    //  existing_input = "";
    //}

    //
    // attach events
    //
    this.attachEvents();

    this.is_rendered = true;
  }

  attachEvents() {
    let app = this.app;
    let mod = this.mod;
    let group_id = this.group.id;
    let input_id = "chat-input-" + this.group.id;
    let header_id = "chat-header-" + this.group.id;

    //
    // our query selector
    //
    let popup_id = "chat-popup-" + this.group.id;
    let popup_qs = "#chat-popup-" + this.group.id;
    this_self = this;

    let chatPopup = document.querySelector(".chat-container" + popup_qs);

    if (chatPopup) {
      chatPopup.onmouseover = (e) => {
        document.querySelectorAll(".chat-container").forEach((el) => {
          el.classList.remove("active");
        });
        e.currentTarget.classList.add("active");
      };

      if (!this.mod.chat_manager_overlay) {
        //
        // make draggable
        //
        this.app.browser.makeDraggable(popup_id, header_id, true);
      }

      //
      // minimize
      let chat_bubble = document.querySelector(`${popup_qs} .chat-header .fa-comment-dots`);
      if (chat_bubble) {
        if (!this.mod.chat_manager_overlay) {
          chat_bubble.onclick = (e) => {
            if (chatPopup.classList.contains("minimized")) {
              this.restorePopup(chatPopup);
            } else {
              this.width = chatPopup.style.width;
              this.height = chatPopup.style.height;
              chatPopup.style.width = "";
              chatPopup.style.height = "";
              chatPopup.classList.add("minimized");
              chatPopup.classList.remove("active");
            }
          };
        }
      }
    }

    // add reply functionality

    document.querySelectorAll(`${popup_qs} .saito-userline-reply`).forEach((el) => {
      el.addEventListener("click", (e) => {
        let quote = "<blockquote>";
        if (el.parentElement.previousElementSibling.innerText.length > 25) {
          quote +=
            "..." + el.parentElement.previousElementSibling.innerText.slice(-25) + "<br/><em>";
        } else {
          quote += el.parentElement.previousElementSibling.innerText + "<br/><em>";
        }
        //Add the time stamp of the original message
        quote +=
          el.parentElement.querySelector(".saito-chat-line-timestamp").innerHTML +
          "</em></blockquote><br/>";

        this.input.insertRange(quote.replaceAll("\n", "<br/>"));
        this.input.focus();
      });
    });

    if (document.querySelector(popup_qs + " #load-older-chats")) {
      document.querySelector(popup_qs + " #load-older-chats").onclick = async (e) => {
        await this.mod.getOlderTransactions(e.currentTarget.dataset.id);
      };
    }

    try {
      //
      // close
      //
      document.querySelector(`${popup_qs} .chat-header .chat-container-close`).onclick = (e) => {
        this.manually_closed = true;
        this.is_rendered = false;
        document.querySelector(`${popup_qs}`).remove();
        app.storage.saveOptions();
      };

      //
      // submit
      //
      this.input.callbackOnReturn = async (message) => {
        let new_msg = message.replaceAll("&nbsp;", " ").replaceAll("<br>", " ");
        if (new_msg.trim() == "") {
          return;
        }
        let newtx = await mod.createChatTransaction(group_id, message);
        await mod.sendChatTransaction(app, newtx);
        console.log("Receive my own chat");
        mod.receiveChatTransaction(newtx);
        this.input.setInput("");
        if (document.querySelector(popup_qs + " .chat-body")) {
          document.querySelector(popup_qs + " .chat-body").scroll(0, 1000000000);
        }
      };

      this.input.callbackOnUpload = (filesrc) => {
        let img = document.createElement("img");
        img.classList.add("img-prev");
        img.src = filesrc;
        let msg = img.outerHTML;
        this.input.callbackOnReturn(msg);
      };

      //
      // submit (button)
      //
      document.querySelector(`${popup_qs} .chat-footer .chat-input-submit`).onclick = (e) => {
        this.input.callbackOnReturn(this.input.getInput());
      };

      //
      // drag and drop images into chat window
      //

      app.browser.addDragAndDropFileUploadToElement(
        popup_id,
        async (filesrc) => {
          filesrc = await app.browser.resizeImg(filesrc); // (img, dimensions, quality)

          let img = document.createElement("img");
          img.classList.add("img-prev");
          img.src = filesrc;
          let msg = img.outerHTML;

          let newtx = await mod.createChatTransaction(group_id, img.outerHTML); // img into msg
          await mod.sendChatTransaction(app, newtx);
          mod.receiveChatTransaction(newtx);
          this.input.setInput("");
        },
        false
      ); // false = no drag-and-drop image click

      document.querySelectorAll(`.img-prev`).forEach(function (img, key) {
        img.onclick = (e) => {
          e.preventDefault();

          let img = e.currentTarget;
          let src = img.getAttribute("src");

          this_self.overlay.show(`<img class="chat-popup-img-enhanced" src="${src}" >`);
        };
      });
    } catch (err) {
      console.log("ERROR IN CHAT POPUP -- we can fix later: " + err);
    }
  }

  restorePopup(chatPopup) {
    chatPopup.classList.remove("minimized");
    chatPopup.classList.add("active");
    chatPopup.style.width = this.width;
    chatPopup.style.height = this.height;
  }
}

module.exports = ChatPopup;
