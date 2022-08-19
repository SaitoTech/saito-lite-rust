const SaitoLoaderTemplate = require('./saito-loader.template');

class SaitoLoader {

    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.hasLoaded = false;
        this.blocker = false;
    }

    render(app, mod, component = '', blocker = false) {
        if (!document.querySelector("#saito-loader-container") && this.hasLoaded === false) {
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
            if (typeof document.getElementById('saito-loader-container') != 'undefined' &&  document.getElementById('saito-loader-container') != null) {
                document.getElementById('saito-loader-container').remove();
            }   
        }, 500)

    }
}

module.exports = SaitoLoader;