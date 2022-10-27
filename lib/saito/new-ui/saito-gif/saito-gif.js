const { GiphyFetch } = require('@giphy/js-fetch-api')
const { renderGif, renderGrid } = require('@giphy/js-components');
const SaitoOverlay = require('../saito-overlay/saito-overlay');
const saitoGifTemplate = require('./saito-gif.template');
const SaitoLoader = require('../saito-loader/saito-loader');



class SaitoGif {

    api_key = process.env.GIPHY_KEY

    constructor(app, mod, post, input_id) {
        this.gf = new GiphyFetch(this.api_key);
        this.app = app;
        this.mod = mod;
        this.input_id = input_id
        this.name = "SaitoGif";
        this.post = post;
        this.overlay = new SaitoOverlay(app, mod);
        this.loader = new SaitoLoader(app, mod);

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

    toDataURL = url => fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        }))





    attachEvents(app, mod) {
        let self = this
        let gif_icon = document.querySelector(`#${this.input_id} ~ .saito-gif`);
        gif_icon.onclick = (e) => {
            this.overlay.show(app, mod, saitoGifTemplate(app, mod));
            this.loader.render(app, mod, "saito-gif-content")
            let onGifClick = (gif, e) => {
                console.log(gif, e)
                e.preventDefault();
                // let img = document.createElement('img');

                // let src = `https://media.giphy.com/media/${gif.id}/giphy.gif`
                // img.src = src
                // app.browser.addElementToDom(`<div class="post-tweet-img-preview"><img src="${src}"
                //     /><i data-id="${self.post.images.length - 1}" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
                //     </div>`, document.getElementById("post-tweet-img-preview-container"));

                    document.getElementById(self.input_id).value += `${gif.embed_url} \n `;
                    self.overlay.remove();

                // self.toDataURL(src)
                //     .then(dataUrl => {
                //         // self.post.images.push(dataUrl);

                //     }).then(resized_img => {
                //         // console.log(self.post.images)
                //         // self.overlay.remove();
                //     })
                //     .catch(error => {
                //         console.log(error)
                //     })


            }

            renderGrid(
                {
                    width: innerWidth / 1.5,
                    fetchGifs: (offset) => {
                        return self.gf.trending(offset, { limit: 25 })
                    },
                    columns: 2,
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
                    // console.log(gif)
                    // let img = document.createElement('img');
                    // let src = `https://media.giphy.com/media/${gif.id}/giphy.gif`
                    // img.src = src
                    // app.browser.addElementToDom(`<div class="post-tweet-img-preview"><img src="${src}"
                    //     /><i data-id="${self.post.images.length - 1}" class="fas fa-times-circle saito-overlay-closebox-btn post-tweet-img-preview-close"></i>
                    //     </div>`, document.getElementById("post-tweet-img-preview-container"));


                    document.getElementById(self.input_id).value += `${gif.embed_url} \n `;
                    self.overlay.remove();
                }

    

                renderGrid(
                    {
                        width: innerWidth / 1.5,
                        fetchGifs: (offset) => {
                            console.log('offset', offset, 'value ', value);
                            return self.gf.search(value,{offset});
                        },
                        columns: 2,
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






}

module.exports = SaitoGif