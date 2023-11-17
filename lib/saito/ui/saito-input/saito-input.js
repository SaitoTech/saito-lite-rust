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
  }

  render(autofocus = true) {
    //Need Unique ids -- based on unique container!

    if (!document.querySelector(this.container + " .saito-input")) {
      if (this.display == "small") {
        this.app.browser.prependElementToSelector(
          SaitoInputTemplate(this.placeholder),
          this.container
        );
        this.attachEvents();
      } else {
        this.app.browser.prependElementToSelector(
          SaitoInputLargeTemplate(this.placeholder),
          this.container
        );
        this.attachLargeEvents();
      }
    }

    if (autofocus) {
      this.focus();
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
            let si = document.querySelector(`${this.container} .saito-input`);
            let reference = si.getBoundingClientRect();

            this.app.browser.addElementToDom(
              SaitoInputSelectionBox(this, reference.top, reference.left - 1)
            );

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
      };
    }
  }

  getInput() {
    let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
    let input = "";

    //
    // Scan input for @ mentions
    //
    this.mentions = [];
    document.querySelectorAll(`${this.container} .saito-input .text-input .saito-mention`).forEach(mention => {
      if (!this.mentions.includes(mention.dataset.id)){
        this.mentions.push(mention.dataset.id);  
      }
    });

    if (inputBox) {
      if (this.quote) {
        input += this.quote + "<br/>";
        this.clearQuote();
      }
      input += inputBox.innerHTML;
    }
    return input;
  }

  getMentions(){
    return this.mentions.slice();
  }

  setInput(text) {
    let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
    if (inputBox) {
      inputBox.innerHTML = sanitize(text);
    }
    this.focus();
  }

  clearQuote() {
    this.quote = "";
    if (document.querySelector(".saito-input-quote")) {
      document.querySelector(".saito-input-quote").remove();
    }
  }

  insertQuote(quote) {
    this.clearQuote();

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
      var sel = window.getSelection();
      range.setStart(inputBox, 2);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    this.focus();
  }

  focus(force = false) {
    let inputBox = document.querySelector(`${this.container} .saito-input .text-input`);
    if (inputBox) {
      if (force || !this.isOtherInputActive()) {
        inputBox.focus();
        document.execCommand("selectAll", false, null);
        document.getSelection().collapseToEnd();

        //setTimeout(function(){ inputBox.selectionStart = inputBox.selectionEnd = 10000; }, 0);
      }
    }
  }

  /*
  TODO -- SelectionBox should probably be it's own component class with render and attachEvents and remove fucntions
  */

  removeSelectionBox() {
    if (document.querySelector(".saito-input-selection-box")) {
      document.querySelector(".saito-input-selection-box").remove();
    }
    document.onclick = null;
    this.giphy_rendered = false;
    this.focus(true);
  }

  attachLargeEvents() {
    //Switch between tabs
    this.open_tab = "";

    Array.from(document.querySelectorAll(".saito-box-tab")).forEach((tab) => {
      tab.onclick = (e) => {
        e.stopPropagation();
        let selected_tab = e.currentTarget.getAttribute("id").replace("tab", "window");

        this.removeSelectionBox();
        this.searchString = "";

        if (selected_tab == this.open_tab) {
          this.open_tab = "";
          return;
        }

        this.open_tab = selected_tab;

        let si = document.querySelector(`${this.container} .saito-input .selection-box-tabs`);
        let reference = si.getBoundingClientRect();

        this.app.browser.addElementToDom(
          SaitoInputSelectionBox(this, reference.top, reference.right, false)
        );

        // close selection box by clicking outside
        document.onclick = (event) => {
          if (!document.querySelector(".saito-input-selection-box").contains(event.target)) {
            console.log("Close");
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
    if (msg_input) {
      this.searchString = "";
      let searchState = false;

      msg_input.onkeydown = (e) => {
        if (searchState) {
          this.searchString += String.fromCharCode(e.keyCode);
          console.log(this.searchString);

          let keys = this.findKeyOrIdentifier();

          if (!keys?.length > 0) {
            searchState = false;
            this.removeSelectionBox();
          } else {
            console.log("Possible Matches: ", JSON.parse(JSON.stringify(keys)));

            let si = document.querySelector(`${this.container} .saito-input .selection-box-tabs`);
            let reference = si.getBoundingClientRect();

            this.open_tab = "at-window";
            if (document.getElementById("saito-input-selection-box")){
              this.app.browser.replaceElementById(SaitoInputSelectionBox(this, reference.top, reference.right, false), "saito-input-selection-box");
            }else{
              this.app.browser.addElementToDom(SaitoInputSelectionBox(this, reference.top, reference.right, false));
            }
            this.addAtEvent();
          }
        }

        if (e.keyCode == 50 || e.which == 50) {
          searchState = true;
          this.tab = "";
          this.searchString = "";
        }
      };
    }
  }

  findKeyOrIdentifier() {
    let myKeys = this.app.keychain.returnKeys();
    let matchingKeys = [];

    for (let key of myKeys) {
      let added = false;

      if (key?.publicKey) {
        if (key.publicKey === this.mod.publicKey) {
          continue;
        }

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
        }
      });
    }

    //Add focus to search bar
    let search_bar = picker.shadowRoot.querySelector("input.search");
    if (search_bar) {
      search_bar.focus({ focusVisible: true });
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

    document.querySelectorAll(".saito-input-contact").forEach(contact => {
      contact.onclick = (e) => {
        this.removeSelectionBox();
        let pkey = e.currentTarget.dataset.id;

        let newText = `<span class="saito-mention" data-id="${pkey}">${this.app.keychain.returnUsername(pkey)}</span>`;
        var input = document.querySelector(`${this.container} .saito-input .text-input`);
        if (input.value) {
          input.value += newText;
        } else {
          input.innerHTML += newText;
        }
      
        document.querySelectorAll(`${this.container} .saito-input .text-input .saito-mention`).forEach(mention => {
          mention.onchange = (e) => {
            mention.remove();
          }
        });

      }
    });
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
