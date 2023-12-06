const SaitoInputTemplate = require("./saito-input.template");
const SaitoInputLargeTemplate = require("./saito-input-large.template");
const SaitoInputSelectionBox = require("./saito-input-selection-box.template");
const SaitoLoader = require("./../saito-loader/saito-loader");

class SaitoInput {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.loader = new SaitoLoader(app, mod, ".photo-window");
    this.callbackOnReturn = null;
    this.callbackOnUpload = null;
    this.display = "small";
    this.placeholder = "say something";
    this.open_tab = "";
    this.searchString = "";
    this.mentions = [];
    this.enable_mentions = false;
    this.emoji_event_added = false;
    this.quote = "";
    this.quote_src = "";
  }

  render(autofocus = true) {
    //Need Unique ids -- based on unique container!

    if (this.display == "small") {
      if (!document.querySelector(this.container + " .saito-input")) {
        this.app.browser.prependElementToSelector(
          SaitoInputTemplate(this.placeholder),
          this.container
        );
      }

      this.attachEvents();
    } else {
      if (!document.querySelector(this.container + " .saito-input")) {
        this.app.browser.prependElementToSelector(
          SaitoInputLargeTemplate(this, this.placeholder),
          this.container
        );
      }

      this.attachLargeEvents();
    }

    if (autofocus) {
      this.focus();
    }

    if (!document.querySelector("emoji-picker")) {
      this.app.browser.addElementToDom("<emoji-picker></emoji-picker>");
    }
  }

  attachEvents() {
    let input_icon = document.querySelector(`${this.container} .saito-input .saito-emoji`);

    if (input_icon) {
      input_icon.onclick = (e) => {
        e.stopPropagation();
        if (document.querySelector(".saito-input-selection-box")) {
          this.removeSelectionBox();
        } else {
          if (!document.querySelector(".saito-input-selection-box")) {
            this.app.browser.addElementToDom(SaitoInputSelectionBox(this));

            //Switch between tabs
            Array.from(document.querySelectorAll(".saito-box-tab")).forEach((tab) => {
              tab.onclick = (e) => {
                Array.from(document.querySelectorAll(".active-tab")).forEach((tab2) => {
                  tab2.classList.remove("active-tab");
                });
                let selected_tab = e.currentTarget.getAttribute("id").replace("tab", "window");

                if (document.getElementById(selected_tab)) {
                  document.getElementById(selected_tab).classList.add("active-tab");
                }

                if (selected_tab === "gif-window") {
                  this.addGiphyEvent();
                }
              };
            });

            // close selection box by clicking outside
            document.onclick = (e) => {
              if (!document.querySelector(".saito-input-selection-box").contains(e.target)) {
                this.removeSelectionBox();
              }
            };

            this.addEmojiEvent();

            this.addPhotoEvent();

            this.addAtEvent();
          }
        }
      };
    }

    //
    // On single line inputs, interpret return key as submission
    //
    let msg_input = document.querySelector(`${this.container} .saito-input .text-input`);
    if (msg_input) {
      msg_input.onkeydown = (e) => {
        if ((e.which == 13 || e.keyCode == 13) && !e.shiftKey) {
          e.preventDefault();
          if (this.callbackOnReturn) {
            this.callbackOnReturn(this.getInput());
          }
        }

        if (this.enable_mentions) {
          this.liveSearch(e);
        }
      };
    }
  }

  attachLargeEvents() {
    //Switch between tabs
    this.open_tab = "";

    Array.from(document.querySelectorAll(".saito-box-tab")).forEach((tab) => {
      tab.onclick = (e) => {
        e.stopPropagation();
        let selected_tab = e.currentTarget.getAttribute("id").replace("tab", "window");

        this.searchString = "";

        if (selected_tab == this.open_tab) {
          this.removeSelectionBox();
          return;
        }

        this.removeSelectionBox();
        this.open_tab = selected_tab;

        this.app.browser.addElementToDom(SaitoInputSelectionBox(this));

        // close selection box by clicking outside
        document.onclick = (event) => {
          if (!document.querySelector(".saito-input-selection-box").contains(event.target)) {
            this.removeSelectionBox();
          }
        };

        switch (this.open_tab) {
          case "emoji-window":
            this.addEmojiEvent();
            break;
          case "gif-window":
            this.addGiphyEvent();
            break;
          case "photo-window":
            // open file selector directly in mobile, because we cant drag drop in mobile
            if (window.innerWidth <= 786) {
              if (document.querySelector("#hidden_file_element_tweet-overlay") != null) {
                document.querySelector("#hidden_file_element_tweet-overlay").click();
              }
            } else {
              // else give user option to either drag drop/select file
              this.addPhotoEvent();
            }
            break;
          case "at-window":
            this.addAtEvent();
            break;
          default:
        }
      };
    });

    let msg_input = document.querySelector(`${this.container} .saito-input .text-input`);

    if (msg_input && this.enable_mentions) {
      msg_input.onkeydown = this.liveSearch.bind(this);
    }
  }

  liveSearch(e) {
    if (this.open_tab === "at-window") {
      if (e.key.length == 1) {
        this.searchString += String.fromCharCode(e.keyCode);
      }
      //backspace
      if (e.keyCode == 8) {
        if (this.searchString.length > 0) {
          this.searchString = this.searchString.substring(0, this.searchString.length - 1);
        } else {
          this.removeSelectionBox();
          return;
        }
      }


      let updatedList = SaitoInputContacts(this);

      if (updatedList){
        this.app.browser.replaceElementBySelector(updatedList, ".saito-input-contact-list");

        //Tab into list
        if (e.keyCode == 9) {
          e.preventDefault();
          e.stopImmediatePropagation();

          let choices = document.querySelectorAll(".saito-input-contact-list .saito-input-contact");
          let index = 0;
          choices[index].focus();

          console.log("Switch to keyboard navigation");

          document.querySelector('.saito-input-contact-list').onkeydown = (e) => {

            if (e.keyCode == 38){
              index = Math.max(--index, 0);
              e.stopImmediatePropagation();
              e.preventDefault();
            }else if (e.keyCode == 40){
              index++;
              if (index >= choices.length){
                index = choices.length - 1;
              }
              e.stopImmediatePropagation();
              e.preventDefault();
            }
            choices[index].focus();
          }
        }

        this.addAtEvent();

      }else{
        this.removeSelectionBox();
      }


      /*let keys = this.findKeyOrIdentifier();

      if (!keys?.length > 0) {
        this.removeSelectionBox();
      } else {
        this.app.browser.replaceElementByIdOrAddToDom(
          SaitoInputSelectionBox(this),
          "saito-input-selection-box"
        );
        this.addAtEvent();
      }*/
    }

    //@ symbol
    if ((e.keyCode == 50 || e.charCode == 64) && e.key == "@") {
      this.open_tab = "at-window";
      this.searchString = "";

      /*this.app.browser.replaceElementByIdOrAddToDom(
        SaitoInputSelectionBox(this),
        "saito-input-selection-box"
      );*/

      let msg_input = document.querySelector(`${this.container} .saito-input .text-input`);
      let container = msg_input.getBoundingClientRect(msg_input);

      this.app.browser.addElementToDom(`
        <div class="saito-input-selection-box no-mouse" style="height: 0px; left: ${container.left}px; top: ${container.top - 1}px">
        ${SaitoInputContacts(this)}
        </div>`);

      this.addAtEvent();
    }
  }

  getInput(as_html = true) {
    let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
    let input = "";

    // Remove deleted [[]] mentions
    if (this.mentions.length > 0 && inputBox.value) {
      for (let i = this.mentions.length - 1; i >= 0; i--) {
        if (!inputBox.value.includes(`[[${this.app.keychain.returnUsername(this.mentions[i])}]]`)) {
          this.mentions.splice(i, 1);
        }
      }
    }

    //
    // Scan input for @ mentions
    //
    document
      .querySelectorAll(`${this.container} .saito-input .text-input .saito-mention`)
      .forEach((mention) => {
        if (!this.mentions.includes(mention.dataset.id)) {
          this.mentions.push(mention.dataset.id);
        }
      });

    //
    // Include replies as an auto-mention
    //
    if (this.quote_src) {
      this.mentions.push(this.quote_src);
    }

    if (this.quote) {
      input = `${this.quote}`;
    }

    //
    // Contenteditable (esp in Firefox) has a tendency to add a <br> tag if you hit the spacebar
    // This should fix some formatting issues in chat/redsquare posts by trimming that extra (final <br> tag)
    //
    let lastTag = inputBox.lastElementChild;
    if (lastTag && lastTag.tagName == "BR") {
      lastTag.remove();
    }

    if (as_html) {
      input += inputBox.innerHTML;
    } else {
      input += inputBox.innerText || inputBox.value;
    }

    return input;
  }

  getMentions() {
    return this.mentions.slice();
  }

  setInput(text) {
    let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
    if (inputBox) {
      inputBox.innerHTML = sanitize(text);
    }
    this.focus();
  }

  clear() {
    this.clearQuote();
    this.setInput("");
    this.mentions = [];
    this.focus(true);
  }

  clearQuote() {
    this.quote = "";
    this.quote_src = "";
    if (document.querySelector(".saito-input-quote")) {
      document.querySelector(".saito-input-quote").remove();
    }
  }

  insertQuote(quote, src_key) {
    this.clearQuote();

    this.quote_src = src_key;
    this.quote = sanitize(quote);

    this.app.browser.prependElementToSelector(
      `<div class="saito-input-quote"><i class="fas fa-reply"></i>${this.quote}<i class="fa-solid fa-xmark cancel-quote"></i></div>`,
      `${this.container} .saito-input`
    );

    this.focus();

    if (document.querySelector(".cancel-quote")) {
      document.querySelector(".cancel-quote").onclick = (e) => {
        this.quote = "";
        if (document.querySelector(".saito-input-quote")) {
          document.querySelector(".saito-input-quote").remove();
        }
      };
    }
  }

  insertRange(text) {
    let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
    if (inputBox) {
      inputBox.innerHTML = sanitize(text);

      const range = document.createRange();
      var sel = document.getSelection();
      range.setStart(inputBox, 2);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    this.focus();
  }

  focus(force = false) {
    let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);

    if (inputBox && !this.app.browser.isMobileBrowser()) {
      // Don't autofocus on mobile
      // even if "forced"
      if (force || !this.isOtherInputActive()) {
        const range = document.createRange();
        const selection = window.getSelection();

        range.setStart(inputBox, inputBox.childNodes.length);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);

        inputBox.focus();
        //setTimeout(function(){ inputBox.selectionStart = inputBox.selectionEnd = 10000; }, 0);
      }
    }
  }

  /*
  TODO -- SelectionBox should probably be it's own component class with render and attachEvents and remove fucntions
  */

  removeSelectionBox() {
    if (document.querySelector("emoji-picker")) {
      document.body.append(document.querySelector("emoji-picker"));
    }
    if (document.querySelector(".saito-input-selection-box")) {
      document.querySelector(".saito-input-selection-box").remove();
    }
    document.onclick = null;
    this.open_tab = "";
    this.giphy_rendered = false;
    this.focus(true);
  }

  findKeyOrIdentifier() {
    let myKeys = this.app.keychain.returnKeys();
    let matchingKeys = [];

    for (let key of myKeys) {
      let added = false;

      if (key?.publicKey) {
        if (key.publicKey.toUpperCase().includes(this.searchString)) {
          matchingKeys.push(key);
          added = true;
        }
      }

      if (!added && key?.identifier) {
        if (key.identifier.toUpperCase().includes(this.searchString)) {
          matchingKeys.push(key);
        }
      }
    }

    //
    //Fallback to cached registry
    //
    this.app.modules.getRespondTos("saito-return-key").forEach((modResponse) => {
      //
      // Return keys converts the publickey->identifer object into
      // an array of {publicKey, identifier} objects
      //
      let pseudoKeyChain = modResponse.returnKeys();

      for (let key of pseudoKeyChain) {
        let can_add = false;

        // Don't add myself
        if (key.publicKey == this.mod.publicKey) {
          continue;
        }

        // Check for partial match
        if (key.publicKey.toUpperCase().includes(this.searchString)) {
          can_add = true;
        }

        if (key.identifier.toUpperCase().includes(this.searchString)) {
          can_add = true;
        }

        // Make sure not already added from my actual keychain
        for (let added_keys of matchingKeys) {
          if (added_keys.publicKey == key.publicKey) {
            can_add = false;
            break;
          }
        }

        if (can_add) {
          matchingKeys.push(key);
        }
      }
    });

    return matchingKeys;
  }

  addPhotoEvent() {
    //Add photo loading functionality to this selection-box
    this.app.browser.addDragAndDropFileUploadToElement(`photo-window`, async (filesrc) => {
      document.querySelector(".photo-window").innerHTML = "";
      this.loader.render();
      filesrc = await this.app.browser.resizeImg(filesrc); // (img, size, {dimensions})
      this.loader.remove();

      if (this.callbackOnUpload) {
        this.callbackOnUpload(filesrc);
      } else if (this.callbackOnReturn) {
        this.callbackOnReturn(filesrc);
      }
      this.removeSelectionBox();
    });
  }

  addEmojiEvent() {
    let picker = document.querySelector("emoji-picker");

    if (picker) {
      //Insert emoji-window back into window
      let container = document.getElementById("emoji-window");
      if (container) {
        container.append(picker);
      }

      //Make sure we only add event listener once (because we keep the emoji-picker in DOM)
      if (!this.emoji_event_added) {
        picker.addEventListener("emoji-click", (event) => {
          let emoji = event.detail;
          var input = document.querySelector(`${this.container} .saito-input .text-input`);
          if (input.value) {
            input.value += emoji.unicode;
          } else {
            input.innerHTML += emoji.unicode;
          }

          if (this.display == "large") {
            this.removeSelectionBox();
          } else {
            this.focus(true);
          }
        });
        this.emoji_event_added = true;
      }

      //Add focus to search bar
      let search_bar = picker.shadowRoot.querySelector("input.search");
      if (search_bar) {
        if (!this.app.browser.isMobileBrowser()) {
          search_bar.focus({ focusVisible: true });
        }
      }
    }
  }

  async addGiphyEvent() {
    //Insert Giphy page
    if (this.giphy_rendered) {
      return;
    }

    let gif_mod = this.app.modules.respondTo("giphy");
    let gif_function = gif_mod?.length > 0 ? gif_mod[0].respondTo("giphy") : null;
    if (gif_function) {
      gif_function.renderInto("#gif-window", (gif_source) => {
        if (this.callbackOnUpload) {
          this.callbackOnUpload(gif_source);
        } else if (this.callbackOnReturn) {
          this.callbackOnReturn(gif_source);
        }
        this.removeSelectionBox();
      });
      this.giphy_rendered = true;
    }
  }

  async addAtEvent(searchString) {
    document.querySelectorAll(".saito-input-contact").forEach((contact) => {
      contact.onclick = (e) => {
        let pkey = e.currentTarget.dataset.id;

        let newText = `[[${this.app.keychain.returnUsername(pkey)}]] `;
        let newHTML = `<span class="saito-mention saito-address" data-id="${pkey}" data-disable="true" contenteditable="false">${this.app.keychain.returnUsername(
          pkey
        )}</span>`;

        var input = document.querySelector(`${this.container} .saito-input .text-input`);

        if (this.searchString || this.open_tab == "at-window") {
          let re = new RegExp("@" + this.searchString, "gi");
          if (input.tagName == "INPUT" || input.tagName == "TEXTAREA") {
            input.value = input.value.replace(re, "") + newText;
          } else {
            input.innerHTML = input.innerHTML.replace(re, "").replace("<br>", "") + newHTML;
          }
        } else {
          if (input.tagName == "INPUT" || input.tagName == "TEXTAREA") {
            input.value += newText;
          } else {
            input.innerHTML = input.innerHTML.replace("<br>", "") + newHTML;
          }
        }

        this.mentions.push(pkey);

        this.removeSelectionBox();
        this.searchString = "";
      };

      contact.onkeydown = (e) => {
        if (e.keyCode == 13 || e.keyCode == 9) {
          e.preventDefault();
          e.stopImmediatePropagation();

          contact.click();
        }
      };
    });

    // Make sure this also works through typing ... close selection box by clicking outside
    document.onclick = (e) => {
      if (document.querySelector(".saito-input-selection-box")){
        if (!document.querySelector(".saito-input-selection-box").contains(e.target)) {
          this.removeSelectionBox();
        }
      }
    };
  }

  //
  // Maybe needs improvement, but simple test to not rip away
  // focus from a ChatPopup if rendering a new Chatpopup
  //
  isOtherInputActive() {
    if (document.querySelector(".saito-input-selection-box")) {
      return 1;
    }

    if (document.querySelector("emoji-picker")) {
      return 1;
    }

    let ae = document.activeElement;

    if (!ae) {
      return 0;
    }

    if (ae.tagName.toLowerCase() == "input" || ae.tagName.toLowerCase() == "textarea") {
      return 1;
    }

    if (ae.classList.contains("text-input")) {
      return 1;
    }

    return 0;
  }
}

module.exports = SaitoInput;
