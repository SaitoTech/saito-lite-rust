const SaitoLoaderTemplate = require('./saito-loader.template');

class SaitoLoader {

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.hasLoaded = false;
        this.blocker = false;
    }

    render(app, mod, component = '', blocker = false) {

        if (!document.querySelector("#saito-loader-container" && this.hasLoaded === false)) {
           
            if (component !== '') {
                app.browser.addElementToId(SaitoLoaderTemplate(blocker), component);    
            } else {
                app.browser.prependElementToDom(SaitoLoaderTemplate(blocker));
            }

            this.hasLoaded = true;
        }
    }

    remove() {
        setTimeout(() => {
            document.querySelector("#saito-loader-container").parentElement.removeChild(document.querySelector("#saito-loader-container"));
        }, 500)

    }
}

module.exports = SaitoLoader;