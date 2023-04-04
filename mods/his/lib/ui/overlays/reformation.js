const ReformationTemplate = require('./reformation.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class ReformationOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(app, mod);
    }

    hide() {
	this.overlay.hide();
    } 
   
    render() {
	this.visible = true;
        this.overlay.show(ReformationTemplate());
    }

    attachEvents(){
    }

}

module.exports = ReformationOverlay;

