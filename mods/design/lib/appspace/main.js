const DesignAppspaceTemplate = require('./main.template');

class DesignAppspace {

    constructor(app, mod) {

    }

    render(app, mod) {
      document.querySelector(".appspace").innerHTML = DesignAppspaceTemplate(app);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) {}

}

module.exports = DesignAppspace;


