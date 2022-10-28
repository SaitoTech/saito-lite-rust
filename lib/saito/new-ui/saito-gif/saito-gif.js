const { GiphyFetch } = require('@giphy/js-fetch-api')
const { renderGif, renderGrid } = require('@giphy/js-components');
const SaitoOverlay = require('../saito-overlay/saito-overlay');
const saitoGifTemplate = require('./saito-gif.template');
const SaitoLoader = require('../saito-loader/saito-loader');
const UIModTemplate = require('../../../templates/uimodtemplate');

class SaitoGif extends UIModTemplate {

    constructor(app, mod, post, input_id) {
        super(app);
        //this.gf = new GiphyFetch(this.api_key);
        this.app = app;
        this.mod = mod;
        this.input_id = input_id
        this.name = "SaitoGif";
        this.post = post;
        this.overlay = new SaitoOverlay(app, mod);
        this.loader = new SaitoLoader(app, mod);
        this.auth = null;
    
        this.initialize(app);

    }
  
    initialize(app) {
      super.initialize(app);
    }
    render(app, mod) {
        // get this parent element
        let input = document.querySelector(`.saito-emoji-container > #${this.input_id}`);
        this.parentElement = input.parentElement;
        if (document.querySelector('.saito-emoji-container')) {
            this.app.browser.addElementToElement(`<div class="saito-gif"> <i class="fas fa-sticky-note"></i> </div>`, this.parentElement);
        }
        let saitogif_self = this;

        saitogif_self.app.network.peers[0].sendRequestWithCallback("get gify auth", {}, function(res) {
            console.log(res);
            saitogif_self.attachEvents(app, mod, res);
        });

    }

    toDataURL = url => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        }))

    attachEvents(app, mod, auth) {
        let self = this
        let gif_icon = document.querySelector(`#${this.input_id} ~ .saito-gif`);
        let selectorWidth = window.innerWidth;
        let selectorColumns = 3;

        let gf= new GiphyFetch(auth);


        if (selectorWidth > 525) { selectorWidth = 500 + ((window.innerWidth - 500) / 2) }
        if (selectorWidth > 750) { selectorWidth = 750 }
        selectorColumns = Math.floor(selectorWidth / 150);


        gif_icon.onclick = (e) => {
            this.overlay.show(app, mod, saitoGifTemplate(app, mod));
            this.loader.render(app, mod, "saito-gif-content")
            let onGifClick = (gif, e) => {
                console.log(gif, e)
                e.preventDefault();
                document.getElementById(self.input_id).value += `${gif.embed_url} \n `;
                self.overlay.remove();
            }

            renderGrid(
                {
                    width: selectorWidth,
                    fetchGifs: (offset) => {
                        return gf.trending(offset, { limit: 25 })
                    },
                    columns: selectorColumns,
                    gutter: 2,
                    onGifClick,
                    key: 34
                },
                document.querySelector(".saito-gif-content")
            )

            this.loader.remove();


            let gif_search_icon = document.querySelector(".saito-gif-search i");
            let gif_input_search = document.querySelector(".saito-gif-search input");

            gif_search_icon.onclick = () => {
                let value = gif_input_search.value
                console.log(gif_input_search.value, "value");
                document.querySelector('.saito-gif-content').innerHTML = "";
                this.loader.render(app, mod, "saito-gif-content")

                let onGifClick = (gif, e) => {

                    e.preventDefault();
                    document.getElementById(self.input_id).value += `${gif.embed_url} \n `;
                    self.overlay.remove();
                }



                renderGrid(
                    {
                        width: selectorWidth,
                        fetchGifs: (offset) => {
                            console.log('offset', offset, 'value ', value);
                            return gf.search(value, { offset });
                        },
                        columns: selectorColumns,
                        gutter: 2,
                        onGifClick,
                        key: value
                    },
                    document.querySelector('.saito-gif-content')
                )
                this.loader.remove()
            }
        }



    }

    async handlePeerRequest(app, message, peer, mycallback = null) {
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");
        console.log("#######################");

        if (message.request === "get giphy auth") {
            //api_key = process.env.GIPHY_KEY
            api_key = "YERpEZ66dS76CfnXWh5D3BbjMOkdB3lp";
            if (mycallback) { mycallback(api_key) }
        }
    }


    



}

module.exports = SaitoGif