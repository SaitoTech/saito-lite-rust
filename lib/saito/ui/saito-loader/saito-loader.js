const SaitoLoaderTemplate = require('./saito-loader.template');

class SaitoLoader {

    constructor(app, mod, container) {
        this.app = app;
        this.mod = mod;
        this.hasLoaded = false;
        this.blocker = false;
        this.container = container
    }

    render() {
        if (!document.querySelector("#saito-loader-container")) {
            if (this.container) {
                this.app.browser.addElementToSelector(SaitoLoaderTemplate(this.blocker), this.container);
            } else {
                this.app.browser.prependElementToDom(SaitoLoaderTemplate(this.blocker));
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