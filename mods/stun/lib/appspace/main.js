const StunAppspaceTemplate = require('./main.template.js');

class StunAppspace {

    constructor(app, mod, container="") {
        this.app = app;
        this.mod = mod;
	this.container = container;
    }

    render() {

        if (document.querySelector(".stun-appspace")) {
          this.app.browser.replaceElementBySelector(StunAppspaceTemplate(this.app, this.mod), ".stun-appspace");
        } else {
          this.app.browser.addElementToSelectorOrDom(StunAppspaceTemplate(this.app, this.mod), this.container);
        }

        this.attachEvents(app, mod);

    }

    attachEvents(app, mod) {
    }

}


module.exports = StunAppspace;


