const ModTemplate = require("../../lib/templates/modtemplate");
const Main = require("./lib/BrowserTestMain/Main");

class BrowserTest extends ModTemplate {
  constructor(app) {
    super(app);
    this.appname = "Browser Test";
    this.name = "BrowserTest";
    this.slug = "browsertest";
    this.description = "To test browser";
    this.categories = "Testing";
    this.container = "";
    this.styles = ["/browsertest/style.css"];
    this.main = new Main(app, this);
    // this.icon_fa = "fas fa-square-full";
  }

  async render() {
    this.main = this.app.browser.addElementToSelector(this.main.render());
    // this.attachEvents();
    // super.render();
  }
}

module.exports = BrowserTest;
