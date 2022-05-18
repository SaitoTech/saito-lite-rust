const ChirpNewTemplate = require("./chirp-new.template");

module.exports = ChirpNew = {

  render(app, mod) {
    let html = ChirpNewTemplate();
console.log("render: " + html);
    mod.overlay.showOverlay(app, mod, html);
console.log("done showOverlay: " + html);
  },

  attachEvents(app, mod) {
  },

};
