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

    this.group = null;

    this.is_scrolling = false;

    this.overlay = new SaitoOverlay(app, mod);

    this.dimensions = {};

    app.connection.on("chat-remove-fetch-button-request", (group_id) => {
      if (this.group?.id === group_id) {
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

      if (this.group.name == this.mod.communityGroupName) {
        this.input.enable_mentions = true;
      }
    }

    //let existing_input = this.input.getInput();

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
      this.restorePopup(document.querySelector(popup_qs), true);
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
        let obj = document.querySelector(popup_qs);
        let x_pos = x_offset - obj.getBoundingClientRect().width - 10;
        x_pos = Math.max(0, x_pos);
        obj.style.left = x_pos + "px";
      }

      //
      // inputs
      //
      this.input.render(!this.app.browser.isMobileBrowser());
    }

    //
    // scroll to bottom
    //
    if (document.querySelector(popup_qs + " .chat-body") && !this.is_scrolling) {
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
    let resize_id = "chat-resize-" + this.group.id;
    let header_qs = "#chat-header-" + this.group.id;
    this_self = this;

    let chatPopup = document.querySelector(".chat-container" + popup_qs);

    if (!chatPopup) {
      return;
    }

    chatPopup.onmouseover = (e) => {
      document.querySelectorAll(".chat-container").forEach((el) => {
        el.classList.remove("active");
      });
      e.currentTarget.classList.add("active");
    };

    if (!this.mod.chat_manager_overlay) {
      //
      // make draggable and resizable, but no in mobile/main - page
      //
      this.app.browser.makeDraggable(popup_id, header_id, true);
      this.app.browser.makeResizeable(popup_qs, header_qs, group_id, () => {
        let chat_bubble = document.querySelector(`${popup_qs} .chat-header .chat-minimizer-icon`);
        if (chat_bubble) {
          chat_bubble.classList.add("fa-window-minimize");
          chat_bubble.classList.remove("fa-window-restore");
          this.restorePopup(chatPopup);
        }
      });
    }

    //
    // minimize
    let chat_bubble = document.querySelector(`${popup_qs} .chat-header .chat-minimizer-icon`);
    let mximize_icon = document.querySelector(`${popup_qs} .chat-header .chat-maximizer-icon`);

    if (chat_bubble && mximize_icon && !this.mod.chat_manager_overlay) {
      chat_bubble.onclick = (e) => {
        if (chatPopup.classList.contains("minimized")) {
          chat_bubble.classList.add("fa-window-minimize");
          chat_bubble.classList.remove("fa-window-restore");
          this.restorePopup(chatPopup);
        } else {
          if (chatPopup.classList.contains("maximized")) {
            mximize_icon.classList.add("fa-square");
            mximize_icon.classList.remove("fa-window-restore");
            chatPopup.classList.remove("maximized");
          } else {
            //only update if not also maximized
            this.savePopupDimensions(chatPopup);
          }

          chatPopup.style.top = "";
          chatPopup.style.left = "";
          chatPopup.style.bottom = "";
          chatPopup.style.right = "";
          chatPopup.style.width = "";
          chatPopup.style.height = "";

          chatPopup.classList.add("minimized");
          chatPopup.classList.remove("active");
          chat_bubble.classList.remove("fa-window-minimize");
          chat_bubble.classList.add("fa-window-restore");
          chatPopup.querySelector(".resize-icon").style.display = "none";
        }
      };

      //
      // maximize

      mximize_icon.onclick = (e) => {
        if (chatPopup.classList.contains("maximized")) {
          mximize_icon.classList.add("fa-square");
          mximize_icon.classList.remove("fa-window-restore");
          this.restorePopup(chatPopup);
        } else {
          if (chatPopup.classList.contains("minimized")) {
            chat_bubble.classList.add("fa-window-minimize");
            chat_bubble.classList.remove("fa-window-restore");
            chatPopup.classList.remove("minimized");
          }else{
            this.savePopupDimensions(chatPopup);            
          }

          mximize_icon.classList.remove("fa-square");
          mximize_icon.classList.add("fa-window-restore");

          chatPopup.style.width = "800px";
          chatPopup.style.height = window.innerHeight + "px";

          // decide to maximize to left or right
          if (this.dimensions.left < Math.floor(window.innerWidth / 2)) {
            chatPopup.style.left = "0px";
          } else {
            chatPopup.style.left = window.innerWidth - 800 + "px";
          }

          chatPopup.style.top = "0px";

          chatPopup.classList.add("maximized");
          chatPopup.querySelector(".resize-icon").style.display = "none";
        }
      };
    }
    // add reply functionality

    document.querySelectorAll(`${popup_qs} .saito-userline-reply .chat-reply`).forEach((el) => {
      el.addEventListener("click", (e) => {
        let src_obj = el.parentElement.parentElement.parentElement;

        let quote = "";

        for (let child of el.parentElement.parentElement.childNodes) {
          if (child.nodeType === 3) {
            quote += child.textContent.replace(/^\s+|\s+$/g, "<br>");
          }
          //We may want to also pull inner text from element nodes as long as they aren't the hidden buttons
          if (child.nodeType === 1 && child.nodeName !== "BLOCKQUOTE") {
            quote += child.innerText.replace(/^\s+|\s+$/g, "<br>");
          }
        }

        if (quote.length > 30) {
          quote = "..." + quote.slice(-30);
        }

        let quoteHTML = `<blockquote href="${el.parentElement.dataset.href}">${quote}</blockquote>`;
        this.input.insertQuote(quoteHTML, src_obj.dataset.id);

        this.input.focus(true);
      });
    });

    document.querySelectorAll(`${popup_qs} .saito-userline-reply .chat-copy`).forEach((el) => {
      el.addEventListener("click", (e) => {
        let icon_element = e.currentTarget.firstElementChild;
        if (icon_element) {
          icon_element.classList.toggle("fa-copy");
          icon_element.classList.toggle("fa-check");

          setTimeout(() => {
            icon_element.classList.toggle("fa-copy");
            icon_element.classList.toggle("fa-check");
          }, 800);
        }

        let parent = el.parentElement.parentElement;
        let text = "";

        for (let child of parent.childNodes) {
          if (child.nodeType === 3) {
            text += child.textContent;
          }
          //We may want to also pull inner text from element nodes as long as they aren't the hidden buttons
          if (
            child.nodeType === 1 &&
            !child.classList.contains("saito-userline-reply") &&
            child.nodeName !== "BLOCKQUOTE"
          ) {
            text += child.innerText;
          }
        }

        text = text.replace(/^\s+|\s+$/g, "");

        navigator.clipboard.writeText(text);
      });
    });

    document.querySelectorAll(`${popup_qs} blockquote`).forEach((el) => {
      el.onclick = (e) => {
        let href = el.getAttribute("href");

        let myAnchor = document.querySelector(popup_qs + " #" + href);
        if (myAnchor) {
          myAnchor.scrollIntoView({ block: "end", inline: "nearest", behavior: "smooth" });
        }
      };
    });

    if (document.querySelector(popup_qs + " #load-older-chats")) {
      document.querySelector(popup_qs + " #load-older-chats").onclick = async (e) => {
        await this.mod.getOlderTransactions(e.currentTarget.dataset.id);
      };
    }

    let myBody = document.querySelector(popup_qs + " .chat-body");
    if (myBody) {
      myBody.addEventListener("scroll", (e) => {
        let chatHeight = myBody.getBoundingClientRect().height;

        if (myBody.scrollHeight - chatHeight - myBody.scrollTop > chatHeight) {
          this.is_scrolling = true;
        } else {
          this.is_scrolling = false;
        }
      });
    }

    //
    // close
    //
    document.querySelector(`${popup_qs} .chat-header .chat-container-close`).onclick = (e) => {
      this.manually_closed = true;
      this.is_rendered = false;
      document.querySelector(`${popup_qs}`).remove();
      this.app.connection.emit("chat-manager-render-request");
      app.storage.saveOptions();
    };

    //
    // submit
    //
    this.input.callbackOnReturn = async (message) => {
      if (message.trim() == `${this.input.quote}`) {
        console.log("Reply with no content");
        return;
      }

      let new_msg = message.replaceAll("&nbsp;", " ").replaceAll("<br>", " ");
      if (new_msg.trim() == "") {
        return;
      }

      let newtx = await mod.createChatTransaction(group_id, message, this.input.getMentions());
      await mod.sendChatTransaction(app, newtx);
      mod.receiveChatTransaction(newtx);
      this.input.clear();
      if (document.querySelector(popup_qs + " .chat-body")) {
        this.is_scrolling = false;
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
        this.input.clear();
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
  }

  restorePopup(chatPopup,isRender=false) {
    chatPopup.classList.remove("minimized");
    chatPopup.classList.remove("maximized");
    chatPopup.classList.add("active");

    chatPopup.style.width = this.dimensions.width + "px";
    chatPopup.style.height = this.dimensions.height + "px";
    chatPopup.style.left = this.dimensions.left + "px";
    chatPopup.style.top = this.dimensions.top + "px";

    if(!isRender) {
      chatPopup.style.bottom = "unset";
      chatPopup.style.right = "unset";
    }

    chatPopup.querySelector(".resize-icon").style.display = "block";
  }

  savePopupDimensions(chatPopup) {
    this.dimensions = chatPopup.getBoundingClientRect();
  }
}

module.exports = ChatPopup;
