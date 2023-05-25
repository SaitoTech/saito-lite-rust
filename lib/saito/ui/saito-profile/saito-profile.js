const SaitoProfileTemplate = require('./saito-profile.template');

class SaitoProfile {

    constructor(app, mod, container="") {
        this.app = app;
        this.mod = mod;
        this.container = container;
    }

    render() {
        if (this.container) {
            if (!document.querySelector(`${this.container} #saito-loader-container`)) {
                this.app.browser.addElementToSelector(SaitoProfileTemplate(this.app, this.mod, this), this.container);
            }
        } else {
            if (!document.querySelector("#saito-loader-container")) {
                this.app.browser.prependElementToDom(SaitoProfileTemplate(this.app, this.mod, this));
            }
        }

        this.attachEvents();
    }

    attachEvents(){

    }
}

module.exports = SaitoProfile;
