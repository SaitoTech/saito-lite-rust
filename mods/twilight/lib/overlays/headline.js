const HeadlineTemplate = require('./headline.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class HeadlineOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
        
        this.cards = null;
        this.title = null;

        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render() {
      this.overlay.show(HeadlineTemplate());
      this.attachEvents();
    }

    attachEvents(){
    }

}


module.exports = HeadlineOverlay;
