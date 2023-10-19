const SaitoLoaderTemplate = require('./saito-loader.template');

class SaitoLoader {

    constructor(app, mod, container="") {
        this.app = app;
        this.mod = mod;
        this.hasLoaded = false;
        this.container = container;
    }

    show() { this.render(); }
    hide() { this.remove(); }

    render(blocker = false) {
        
        if (this.container) {
            if (!document.querySelector(`${this.container} #saito-loader-container`)) {
                this.app.browser.addElementToSelector(SaitoLoaderTemplate(blocker), this.container);
            }
        } else {
            if (!document.querySelector("#saito-loader-container")) {
                this.app.browser.prependElementToDom(SaitoLoaderTemplate(blocker));
            }
        }
    }

    remove(delay = 500) {
        setTimeout(() => {
            let selector = this.container + ' #saito-loader-container';
            selector = selector.trim();

            if (document.querySelector(selector)) {
                document.querySelector(selector).remove();
            }
        }, delay)

    }
}

module.exports = SaitoLoader;
