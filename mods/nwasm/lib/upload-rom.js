const UploadRomOverlayTemplate = require("./upload-rom.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
var str2ab = require('string-to-arraybuffer');
var ab2str = require('arraybuffer-to-string');


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
            //file: file
          };
          let tx = mod.sendUploadRomTransaction(app, mod, data);

          // add file and keys to mod.rom
          let pubkey = app.wallet.returnPublicKey();
          mod.roms.push({
            file_id: data.filename, 
            key: tx.transaction.sig, 
            pubkey: pubkey,
            //file: file
          });          

          console.log(mod.roms);
          // save rom data inside wallet
          mod.save();
        
          salert('file uploaded successfully');
          this.overlay.hideOverlay();
          document.querySelector('.loader').style.display = "none";

          // start emulator
          let st = ab2str(file);
          console.log("STRING: " + st);
          let file2 = str2ab(st);
          myApp.initializeRom(file2);

        },
      false, true); // true = read as array buffer

    } catch(err) {
      console.log('ROM file upload error: '+err);
    }

  }

}


module.exports = UploadRomOverlay;

