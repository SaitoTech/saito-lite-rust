const ModTemplate = require("../../lib/templates/modtemplate");
const ChirpMain = require("./lib/main/chirp-main");
const SaitoHeader = require("./../../lib/saito/new-ui/saito-header/saito-header");

class Chirp extends ModTemplate {

    constructor(app) {
        super(app);

        this.name = "Chirp";
        this.slug = "chirp";
        this.description = "Chirp Twitter clone";
        this.categories = "Design Development";

        this.styles = ['/saito/saito.css', '/chirp/style.css'];
        this.scripts = ['/saito/lib/saito-date-picker/script.js'];

        this.body = new ChirpMain(app, this);
        this.header = new SaitoHeader(app, this);

    }


    render(app) {

        super.render(app);

        this.body.render(app, this);
        this.header.render(app, this);

    }

}

module.exports = Chirp;


