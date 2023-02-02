const ModTemplate = require("../../lib/templates/modtemplate");
const NewDesignMain = require("./lib/main/newdesign-main");
const SaitoHeader = require("./../../lib/saito/ui/saito-header/saito-header");

class NewDesign extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "NewDesign";
    this.slug = "newdesign";
    this.description = "Saito Design Reference Module";
    this.categories = "Design Development";

    this.styles = ['/saito/saito.css', '/newdesign/css/newdesign-main.css', '/saito/lib/date-picker/dist/css/datepicker.css', '/saito/lib/saito-date-picker/style.css'];
    this.scripts = ['/saito/lib/date-picker/dist/js/datepicker-full.js', '/saito/lib/saito-date-picker/script.js'];

    this.main = new NewDesignMain(app, this);
    this.header = new SaitoHeader(app, this);

  }


  render(app) {
    this.addComponent(this.main);
    this.addComponent(this.header);
    super.render(app);
  }

}

module.exports = NewDesign;


