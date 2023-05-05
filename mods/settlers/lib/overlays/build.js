const BuildOverlayTemplate = require("./build.template");
const SaitoOverlay = require("./../../../../lib/saito/ui/saito-overlay/saito-overlay");

class BuildOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
  }

  render() {
    this.overlay.show(BuildOverlayTemplate(this.app, this.mod, this));
    this.attachEvents();
  }

  attachEvents() {
  }

  checkAndReturnResource(resource, resource_count){
    let track_resource = [];
    let player = this.mod.game.player;
    let myBank = this.mod.game.state.players[player - 1].resources.slice();

    for (let i=0; i<myBank.length; i++) {
      if (myBank[i] == resource) {
        track_resource.push(myBank[i]);
      }
    }

    let html = ``;
    for (let i=0; i<resource_count; i++) {
      if (track_resource.length > 0) {
        html += this.returnCardImg(resource, false);
        track_resource.shift();  
      } else {
        html += this.returnCardImg(resource, true);
      }
    }
    
    return html;
  }

  returnCardImg(resource, disabled = false){
    return `<img class="${disabled ? `settlers-card-disabled` : ``}" src="/settlers/img/cards/${resource}.png">`;
  }

}

module.exports = BuildOverlay;

