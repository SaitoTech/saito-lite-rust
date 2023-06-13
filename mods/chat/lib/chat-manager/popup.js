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

    this.group = null;

    this.x_pos = 0;
    this.y_pos = 0;
    this.width = 0;
    this.height = 0;
    this.overlay = new SaitoOverlay(app, mod);
  }

  remove() {

    let popup_qs = "#chat-popup-" + this.group.id;
    document.querySelector(popup_qs).remove();

  }

  render() {

    //
    // exit if group unset
    //
    if (this.group == null) { return; }

    //console.log(JSON.parse(JSON.stringify(this.group)));

    //
    // exit if manually minimized
    //
    if (this.manually_closed) { return; }

    //
    // our query selector
    //
    let popup_id = "chat-popup-" + this.group.id;
    let popup_qs = "#" + popup_id;
    
    //let input_id = "chat-input-" + this.group.id;
    if (!this.input){
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
    }

    //
    // insert or replace popup on page
    //
    if (am_i_on_page == 1) {

      let obj = document.querySelector(popup_qs);
      var rect = obj.getBoundingClientRect();
      this.x_pos = rect.left;
      this.y_pos = rect.top;
      this.width = rect.width;
      this.height = rect.height;

      this.app.browser.replaceElementBySelector(ChatPopupTemplate(this.app, this.mod, this.group, this.container), popup_qs);
      
      //Don't reset any user dragging/resizing
      if (!this.container){
        obj = document.querySelector(popup_qs);
        obj.style.left = this.x_pos + "px";
        obj.style.top = this.y_pos + "px";
        obj.style.width = this.width + "px";
        obj.style.height = this.height + "px";
      }
    } else {
      this.app.browser.addElementToSelectorOrDom(ChatPopupTemplate(this.app, this.mod, this.group, this.container), this.container);

      //
      // now set left-position of popup
      //
      if (!this.container && popups_on_page > 0){
        console.log("Reposition secondary popup");
        let obj = document.querySelector(popup_qs);
        this.x_pos = x_offset - obj.getBoundingClientRect().width - 10;
        if (this.x_pos < 0) { this.x_pos = 0; }
        obj.style.left = this.x_pos + "px";
      }

    }


    //
    // inputs
    //
    this.input.render();

    //
    // scroll to bottom
    //
    if (document.querySelector(popup_qs + " .chat-body")) {
      document.querySelector(popup_qs + " .chat-body").scroll(0, 1000000000);
    }
    //
    // re-render typed text
    //
    if (existing_input != "") {
      this.input.setInput(existing_input);
      existing_input = "";
    }

    //
    // focus on text input
    //
    if (!this.mod.isOtherInputActive()) {
      this.input.focus();
      document.execCommand('selectAll', false, null);
      document.getSelection().collapseToEnd();
    }


    //
    // attach events
    //
    this.attachEvents();

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

    if (document.querySelector(".chat-container"+popup_qs)){

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

    }

    // add reply functionality

    document.querySelectorAll(`${popup_qs} .saito-userline-reply`).forEach((el) => {
      el.addEventListener('click', (e) => {
        let quote = "<blockquote>";
        if (el.parentElement.previousElementSibling.innerText.length > 25) {
          quote += "..." + el.parentElement.previousElementSibling.innerText.slice(-25) + "<br/><em>";
        } else {
          quote += el.parentElement.previousElementSibling.innerText + "<br/><em>";
        }
        //Add the time stamp of the original message
        quote += el.parentElement.querySelector(".saito-chat-line-timestamp").innerHTML + "</em></blockquote><br/>";

        this.input.insertRange(quote.replaceAll('\n', '<br/>'))
        this.input.focus();

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
      // submit
      //
      this.input.callbackOnReturn = (message) => {
          let new_msg = message.replaceAll("&nbsp;", " ").replaceAll("<br>", " ");
          if (new_msg.trim() == "") { return; }
          let newtx = mod.createChatTransaction(group_id, message);
          mod.sendChatTransaction(app, newtx);
          mod.receiveChatTransaction(app, newtx);
          this.input.setInput("");
          if (document.querySelector(popup_qs + " .chat-body")) {
            document.querySelector(popup_qs + " .chat-body").scroll(0, 1000000000);
          }
      }

      this.input.callbackOnUpload = (filesrc) => {
          let img = document.createElement("img");
          img.classList.add("img-prev");
          img.src = filesrc;
          let msg = img.outerHTML;
          this.input.callbackOnReturn(msg);
      }

      //
      // submit (button)
      //
      document.querySelector(`${popup_qs} .chat-footer .chat-input-submit`).onclick = (e) => {
        this.input.callbackOnReturn(this.input.getInput());
      }

      //  
      // drag and drop images into chat window
      //

      app.browser.addDragAndDropFileUploadToElement(popup_id, async (filesrc) => {
        filesrc = await app.browser.resizeImg(filesrc); // (img, dimensions, quality)

        let img = document.createElement('img');
        img.classList.add('img-prev');
        img.src = filesrc;
        let msg = img.outerHTML;

        let newtx = mod.createChatTransaction(group_id, img.outerHTML); // img into msg
        mod.sendChatTransaction(app, newtx);
        mod.receiveChatTransaction(app, newtx);
        this.input.setInput("");

      }, false); // false = no drag-and-drop image click


      document.querySelectorAll(`.img-prev`).forEach(function(img, key) { 
        img.onclick = (e) => {
          e.preventDefault();
          
          let img = e.currentTarget;
          let src = img.getAttribute('src');

          this_self.overlay.show(`<img class="chat-popup-img-enhanced" src="${src}" >`);
        }
      });


    } catch (err) {
      console.log("ERROR IN CHAT POPUP -- we can fix later: " + err);
    }

  }

}

module.exports = ChatPopup;

