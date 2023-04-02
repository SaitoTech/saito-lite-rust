const DietOfWormsTemplate = require('./diet-of-worms.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class DietOfWormsOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
	this.visible = false;
        this.overlay = new SaitoOverlay(app, mod);
    }

    hide() {
        this.visible = false;
        this.overlay.hide();
    }
   
    render() {
	this.visible = true;
        this.overlay.show(DietOfWormsTemplate());
        this.attachEvents();
    }

    attachEvents(){
    }

}

module.exports = DietOfWormsOverlay;

