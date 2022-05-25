const ModTemplate = require("../../lib/templates/modtemplate");
const NewDesignMain = require("./lib/main/newdesign-main");

class NewDesign extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "NewDesign";
    this.slug = "newdesign";
    this.description = "Saito Design Reference Module";
    this.categories = "Design Development";

    this.header = null;
    this.overlay = null;

    this.styles = ['/saito/style.css'];

  }

  render(app) {

    super.render(app)

    NewDesignMain.render(app, this);

  }

}

module.exports = NewDesign;


