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

    let uploader = this;    

    try {

      // upload rom file 
      app.browser.addDragAndDropFileUploadToElement("nwasm-upload-overlay",
        (file) => {

          document.querySelector('.loader').style.display = "grid";
          
          // add file to txn
          //console.log(file);
	  //myApp.initializeRom(file);

	  mod.active_game = file;

	  let a = Buffer.from(file, 'binary').toString('base64');;
	  let b = Buffer.from(a, 'base64');

          let ab = new ArrayBuffer(b.length);
          let view = new Uint8Array(ab);
          for (let i = 0; i < b.length; ++i) {
            view[i] = b[i];
          }

	  //
	  // initialize ROM gets the ROM the APP and the MOD
	  //
	  myApp.initializeRom(ab, app, mod);
	  uploader.overlay.hide();

        },
      false, true); // true = read as array buffer


    } catch(err) {
      console.log('ROM file upload error: '+err);
    }

  }

}


module.exports = UploadRomOverlay;

