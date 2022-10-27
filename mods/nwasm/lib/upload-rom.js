const UploadRomOverlayTemplate = require("./upload-rom.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");


class UploadRomOverlay {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod, selector = "") {
    this.overlay.show(app, mod, UploadRomOverlayTemplate(app, mod));
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {
    
    try {

      // upload rom file 
      app.browser.addDragAndDropFileUploadToElement("nwasm-upload-overlay",
        (file) => {

          document.querySelector('.loader').style.display = "grid";
          
          // add file to txn
          console.log(file);

	  myApp.initializeRom(file);

        },
      false, true); // true = read as array buffer

    } catch(err) {
      console.log('ROM file upload error: '+err);
    }

  }

}


module.exports = UploadRomOverlay;

