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
          let data = {
            filename: 'file.n64',
            file: file
          };
          let tx = mod.sendUploadRomTransaction(app, mod, data);

          // add file and keys to mod.rom
          let pubkey = app.wallet.returnPublicKey();
          mod.roms.push({
            file_id: data.filename, 
            file: file,
            key: tx.transaction.sig, 
            pubkey: pubkey
          });          

          console.log(mod.roms);
          // save rom data inside wallet
          mod.save();
        
          salert('file uploaded successfully');
          this.overlay.hideOverlay();
          document.querySelector('.loader').style.display = "none";
        },
      false);

    } catch(err) {
      console.log('ROM file upload error: '+err);
    }

  }

}

module.exports = UploadRomOverlay;

