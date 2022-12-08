const LoadRomOverlayTemplate = require("./load-rom.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");


class UploadRomOverlay {

  constructor(app, mod = null, container = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app, false);
  }

  render() {

    this.overlay.show(this.app, this.mod, UploadRomOverlayTemplate());

    let obj;

    obj = document.querySelector(".nwasm-upload-overlay");
    obj.classList.add("nwasm-upload-overlay-dark");

    obj = document.querySelector(".preloader");
    obj.innerHTML = "downloading and decrypting...";
    obj.classList.add("nwasm-preloader-dark");

    obj = document.querySelector(".nwasm-upload-instructions");
    obj.innerHTML = "loading ROM file...";

    obj = document.querySelector(".loader");
    obj.style.display = "block";

    this.attachEvents();

  }

  attachEvents() {
  }

}


module.exports = UploadRomOverlay;

