const DebateTemplate = require('./debate.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class DebateOverlay {

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
   
    render(res=null) {
	if (res == null) { return; }
	this.visible = true;
        this.overlay.show(DebateTemplate(res));
        this.attachEvents();
    }

    attachEvents(){
    }

}

module.exports = DebateOverlay;



