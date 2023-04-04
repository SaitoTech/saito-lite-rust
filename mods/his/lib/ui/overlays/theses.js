const ThesesTemplate = require('./theses.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class ThesesOverlay {

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
        this.overlay.show(ThesesTemplate());

	let dw = document.querySelector(".theses-overlay");
	let gb = document.querySelector(".gameboard");
	let gb2 = gb.cloneNode(true);

	gb2.style.position = "";
	gb2.style.transformOrigin = "";
	gb2.style.transform = "";
	gb2.style.left = "";
	gb2.style.right = "";

	dw.appendChild(gb2);
        this.attachEvents();
    }

    attachEvents(){
    }

}

module.exports = ThesesOverlay;

