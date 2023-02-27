const SaitoLoaderTemplate = require('./saito-loader.template');

class SaitoLoader {

    constructor(app, mod, container="") {
        this.app = app;
        this.mod = mod;
        this.hasLoaded = false;
        this.blocker = false;
        this.container = container
    }

    show() { this.render(); }
    hide() { this.remove(); }

    render(blocker = false) {
        if (!document.querySelector("#saito-loader-container")) {
            if (this.container) {
                this.app.browser.addElementToSelector(SaitoLoaderTemplate(blocker), this.container);
            } else {
                this.app.browser.prependElementToDom(SaitoLoaderTemplate(blocker));
            }
        }
    }

    remove() {
        setTimeout(() => {
            if (typeof document.getElementById('saito-loader-container') != 'undefined' && document.getElementById('saito-loader-container') != null) {
                document.getElementById('saito-loader-container').remove();
            }
        }, 500)

    }
}

module.exports = SaitoLoader;
