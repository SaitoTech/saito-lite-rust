const { GiphyFetch } = require('@giphy/js-fetch-api')
const { renderGif, renderGrid } = require('@giphy/js-components');
const SaitoOverlay = require('../saito-overlay/saito-overlay');
const saitoGifTemplate = require('./saito-gif.template');


class SaitoGif {

    api_key = "18VLGzdwcR6t1rTRUSul2JCqqHVk0sOo"

    constructor(app, mod, post, input_id) {
        this.gf = new GiphyFetch(this.api_key);
        this.app = app;
        this.mod = mod;
        this.gf.trending;
        this.input_id = input_id
        // this.selector = ".saito-emoji-container";
        this.name = "SaitoGif";
        this.mod = mod;
        this.post = post;
        this.picker_shown = false;
        this.overlay = new SaitoOverlay(app, mod);

    }


    render(app, mod) {



        // get this parent element
        let input = document.querySelector(`.saito-emoji-container > #${this.input_id}`);
        this.parentElement = input.parentElement;
        if (document.querySelector('.saito-emoji-container')) {
            this.app.browser.addElementToElement(`<div class="saito-gif"> <i class="fas fa-sticky-note"></i> </div>`, this.parentElement);
        }

        this.attachEvents(app, mod)
    }

    attachEvents(app, mod) {
        let self = this
        let gif_icon = document.querySelector(`#${this.input_id} ~ .saito-gif`);
        gif_icon.onclick = (e) => {
            this.overlay.show(app, mod, saitoGifTemplate(app, mod));

            let fetchGifs = (offset) => {
                return this.gf.trending({ offset, limit: 25 })
            }


            let onGifClick = (gif, e) => {
                e.preventDefault();
                console.log(gif, e);
                let img = document.createElement('img');
                let src = `https://media.giphy.com/media/${gif.id}/giphy.gif`

                try {
                    console.log(self)
                    app.browser.addElementToDom(`<div class="post-tweet-img-preview"><img src="${src}"
                    /><i data-id="${self.post.images.length - 1}" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
                    </div>`, document.getElementById("post-tweet-img-preview-container"));
                    console.log(img, 'image')
                    self.overlay.remove();
                } catch (error) {
                    console.log(error)
                }
              
            }

            renderGrid(
                {
                    width: innerWidth / 2,
                    fetchGifs,
                    columns: 2,
                    gutter: 2,
                    onGifClick
                },
                document.querySelector(".saito-gif-content")
            )
        }
    }



}

module.exports = SaitoGif