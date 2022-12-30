const ModTemplate = require('../../lib/templates/modtemplate');
const ThemeBtn = require("./lib/theme-btn");

class Themes extends ModTemplate {
    constructor(app) {
        super(app);
        this.app = app;
        this.name = "Themes";

        this.styles = ['/themes/style.css'];

        this.initialize(app);
        return this;
    }

    initialize(app) {
        super.initialize(app);
    }

    canRenderInto(qs) {
        if (qs === ".saito-header-themes") { return true; }
        return false;
    }

    //
    // render components into other modules on-request
    //
    renderInto(qs) {
        if (qs == ".saito-header-themes") {
          if (!this.renderIntos[qs]) {
            this.renderIntos[qs] = [];

            let obj = new ThemeBtn(this.app, this, ".saito-header-themes");
            this.renderIntos[qs].push(obj);
            this.attachStyleSheets();
          }
        }

        if (this.renderIntos[qs] != null && this.renderIntos[qs].length > 0) {
            this.renderIntos[qs].forEach((comp) => { comp.render(); });
        }
    }
}

module.exports = Themes;
