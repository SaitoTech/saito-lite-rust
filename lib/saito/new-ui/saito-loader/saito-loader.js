const SaitoLoaderTemplate = require('./saito-loader.template');

class SaitoLoader {

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.hasLoaded = false;
    }

    render(app, mod) {
        if (!document.querySelector("#saito-loader-container" && this.hasLoaded === false)) {
            app.browser.prependElementToDom(SaitoLoaderTemplate());
            this.hasLoaded = true
        }
    }

    remove() {
        setTimeout(() => {
            document.querySelector("#saito-loader-container").parentElement.removeChild(document.querySelector("#saito-loader-container"));
        }, 500)

    }
}

module.exports = SaitoLoader;