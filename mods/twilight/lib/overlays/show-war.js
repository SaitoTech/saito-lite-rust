const ShowWarTemplate = require('./show-war.template');
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class ShowWarOverlay {

    constructor(app, mod){
        this.app = app;
        this.mod = mod;

        this.card = null;
        this.winner = null; 
        this.roll = null; 
        this.modifications = null; 
        this.player = null;
        
        this.overlay = new SaitoOverlay(app, mod);
    }
    
    render() {
        this.overlay.show(ShowWarTemplate(this.game));
        this.attachEvents();
    }

    attachEvents(){
    }

}


module.exports = ShowWarOverlay;
