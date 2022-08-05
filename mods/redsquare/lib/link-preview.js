const LinkPreviewTemplate = require("./link-preview.template");

class LinkPreview {

    constructor(app, mod, link) {
      this.link = link;
      
      console.log('inside link preview constructor');
      console.log(this.link);
    }

    render(app, mod, selector = "") {
      console.log('inside link preview render');
      console.log(this.link);
      app.browser.addElementToSelector(LinkPreviewTemplate(app, mod, this.link), selector);
      this.attachEvents(app, mod);
    }

    attachEvents(app, mod) { 
    }
}

module.exports = LinkPreview;


