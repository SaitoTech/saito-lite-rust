const GameLoaderTemplate = require('./game-loader.template');

class GameLoader {

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        if (document.querySelector("#game-loader-container")){
            document.querySelector("#game-loader-container").remove();
        }
    }

    render(app, mod, component = '', message = '', hook = null, btn_name = "") {
        if (!document.querySelector("#game-loader-container")) {
            if (component) {
                let container = document.querySelector(component);
                container.innerHTML = GameLoaderTemplate(message, btn_name);
                //app.browser.addElementToId(, component);
            } else {
                app.browser.prependElementToDom(GameLoaderTemplate(message, btn_name));
            }
        }
        if (hook){
            this.attachEvents(app, mod, hook);
        }
    }

    attachEvents(app, mod, slug){
        document.getElementById("start_btn").onclick = (e) =>{
          window.location = "/" + slug;
        };
    }

    remove() {
        setTimeout(() => {
            if (typeof document.getElementById('game-loader-container') != 'undefined' && document.getElementById('game-loader-container') != null) {
                document.getElementById('game-loader-container').remove();
            }
        }, 500)

    }
}

module.exports = GameLoader;