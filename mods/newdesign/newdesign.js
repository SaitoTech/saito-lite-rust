const ModTemplate = require("../../lib/templates/modtemplate");
const NewDesignMain = require("./lib/main/newdesign-main");
const SaitoHeader = require("./../../lib/saito/new-ui/saito-header/saito-header");

class NewDesign extends ModTemplate {

  constructor(app) {
    super(app);

    this.name = "NewDesign";
    this.slug = "newdesign";
    this.description = "Saito Design Reference Module";
    this.categories = "Design Development";

    this.styles = ['/newdesign/saito.css', '/saito/lib/date-picker/dist/css/datepicker.css'];
    this.scripts = ['/saito/lib/date-picker/dist/js/datepicker-full.js']

    this.body = new NewDesignMain(app, this);
    this.header = new SaitoHeader(app, this);

  }


  render(app) {

    super.render(app)

    this.body.render(app, this);
    this.header.render(app, this);

  }

}

module.exports = NewDesign;


