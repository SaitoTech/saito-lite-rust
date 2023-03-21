const ImperiumAcknowledgeOverlayTemplate = require("./acknowledge.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class AcknowledgeOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }


  hide() {
    this.visible = 0;
    this.overlay.hide();
  }

  render(msg="", img="") {
    this.visible = 1;
    this.overlay.show(ImperiumAcknowledgeOverlayTemplate(msg));
    try {
      document.querySelector(".acknowledge-overlay").style.backgroundImage = `url(${img});`;
      document.querySelector(".acknowledge-menu").innerHTML = `<div class="acknowledge-notice">${msg}</div><ul><li class="textchoice acknowledge" id="acknowledge">acknowledge</li></ul>`;
    } catch (err) {
    }
  }

}

module.exports = AcknowledgeOverlay;

