/*

This module requires a gifphy API key to be set as an environmental variable:
GIPHY_KEY

Modules must provide an input id to attach the gif selector to.

Modules can also provide a callback to determine how the image (url) is processed.

*/
const { GiphyFetch } = require("@giphy/js-fetch-api");
const { renderGif, renderGrid } = require("@giphy/js-components");
const SaitoOverlay = require("./../../lib/saito/ui/saito-overlay/saito-overlay");
const saitoGifTemplate = require("./lib/giphy.template");
const SaitoLoader = require("./../../lib/saito/ui/saito-loader/saito-loader");
const ModTemplate = require("../../lib/templates/modtemplate");

class Giphy extends ModTemplate {
  constructor(app, mod, input_id, parent_callback = null) {
    super(app);
    this.app = app;
    this.mod = mod;
    this.name = "Giphy";

    this.input_id = input_id;
    this.parent_callback = parent_callback;
    this.overlay = new SaitoOverlay(app, mod);
    this.loader = new SaitoLoader(app, mod);
    this.auth = null;
  }

  async initialize(app) {
    await super.initialize(app);
  }

  async render() {
    let app = this.app;
    let mod = this.mod;

    // get this parent element
    //let input = document.querySelector(`.saito-emoji-container > #${this.input_id}`);
    //this.parentElement = input.parentElement;
    if (document.querySelector(".saito-gif-icon-container")) {
      this.app.browser.addElementToElement(
        `<div class="saito-gif"><i class="fa-solid fa-video"></i></div>`,
        document.querySelector(".saito-gif-icon-container")
      );
    }

    if (!document.getElementById("giphy-styles")) {
      var s = document.createElement("link");
      s.id = "giphy-styles";
      s.rel = "stylesheet";
      s.type = "text/css";
      s.href = "/giphy/css/giphy.css";
      document.querySelector("head").appendChild(s);
    }

    if (!this.auth) {
      let saitogif_self = this;
      await app.network.sendRequestAsTransaction("get giphy auth", {}, function (res) {
        //console.log(res);
        saitogif_self.auth = res;
        saitogif_self.attachEvents(res);
      });
    } else {
      this.attachEvents(this.auth);
    }
  }

  toDataURL = (url) =>
    fetch(url)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .catch((err) => {
        console.error("Error fetching content: " + err);
        return "";
      });

  attachEvents(auth) {
    let app = this.app;
    let mod = this.mod;

    let self = this;
    let gif_icon = document.querySelector(".saito-gif");
    let selectorWidth = window.innerWidth;
    let selectorColumns = 3;

    let gf = new GiphyFetch(auth);

    if (selectorWidth > 525) {
      selectorWidth = 500 + (window.innerWidth - 500) / 2;
    }
    if (selectorWidth > 750) {
      selectorWidth = 750;
    }
    selectorColumns = Math.floor(selectorWidth / 150);

    gif_icon.onclick = (e) => {
      this.overlay.show(saitoGifTemplate(app, mod));
      this.loader.render(app, mod, "saito-gif-content");
      let onGifClick = (gif, e) => {
        console.log(gif, e);
        e.preventDefault();
        this.parent_callback(gif.images.original.url);
        //document.getElementById(self.input_id).value += `${gif.embed_url} \n `;
        self.overlay.remove();
      };

      renderGrid(
        {
          width: selectorWidth,
          fetchGifs: (offset) => {
            return gf.search("inception", { offset });
          },
          columns: selectorColumns,
          gutter: 2,
          onGifClick,
          key: 34,
        },
        document.querySelector(".saito-gif-content")
      );

      this.loader.remove();

      let gif_search_icon = document.querySelector(".saito-gif-search i");
      let gif_input_search = document.querySelector(".saito-gif-search input");

      gif_search_icon.onclick = () => {
        let value = gif_input_search.value;
        console.log(gif_input_search.value, "value");
        document.querySelector(".saito-gif-content").innerHTML = "";
        this.loader.render(app, mod, "saito-gif-content");

        let onGifClick = (gif, e) => {
          e.preventDefault();
          this.parent_callback(gif.images.original.url);
          //document.getElementById(self.input_id).value += `${gif.embed_url} \n `;
          self.overlay.remove();
        };

        renderGrid(
          {
            width: selectorWidth,
            fetchGifs: (offset) => {
              console.log("offset", offset, "value ", value);
              return gf.search(value, { offset });
            },
            columns: selectorColumns,
            gutter: 2,
            onGifClick,
            key: value,
          },
          document.querySelector(".saito-gif-content")
        );
        this.loader.remove();
      };
    };
  }

  async handlePeerTransaction(app, tx = null, peer, mycallback) {
    if (tx == null) {
      return;
    }
    let message = tx.returnMessage();
    if (message.request === "get giphy auth") {
      let api_key = "";
      try {
        api_key = process.env.GIPHY_KEY;
        if (mycallback) {
          await mycallback(api_key);
        }
      } catch (err) {
        console.log("Failed to find key with error: " + err);
      }
    }
  }
}

module.exports = Giphy;
