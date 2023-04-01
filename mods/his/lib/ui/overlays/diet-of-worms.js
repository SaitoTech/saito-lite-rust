const DietOfWormsTemplate = require('./diet-of-worms.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class DietOfWormsOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render() {
        this.overlay.show(DietOfWormsTemplate());
        this.attachEvents();
    }

    attachEvents(){
    }

}

module.exports = DietOfWormsOverlay;

