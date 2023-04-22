const DebatersTemplate = require('./debaters.template');
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class DebatersOverlay {

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

    render(faction="") {

      this.visible = true;
      this.overlay.show(DebatersTemplate());

      for (let i = 0; i < this.mod.game.state.debaters.length; i++) {
        let committed = "";
        if (this.mod.game.state.debaters[i].committed == 1) { commited = " debater-commited"; }
        this.app.browser.addElementToSelector(`<div class="debaters-tile debaters-tile${i} ${committed}" data-key="${this.mod.game.state.debaters[i].key}" data-id="${this.mod.game.state.debaters[i].img}" style="background-image:url('/his/img/tiles/debaters/${this.mod.game.state.debaters[i].img}')"></div>`, ".debaters-overlay");
      }


      for (let i = 0; i < this.mod.game.state.debaters.length; i++) {
        let tile_f = "/his/img/tiles/debaters/" + this.mod.game.state.debaters[i].img;
        let tile_b = tile_f.replace('.svg', '_back.svg');
        if (this.mod.game.state.debaters[i].committed == 1) {
          let x = tile_f;
          tile_f = tile_b;
          tile_b = x;
        }

        let divsq = `.debaters-tile${i}`;

        $(divsq).mouseover(function() {
          $(this).css('background-image', `url('${tile_b}')`);
        }).mouseout(function() {
          $(this).css('background-image', `url('${tile_f}')`);
        });

        $(divsq).click(function() {
          let key = $(this).attr("data-key");
alert(key);
        });

      }

      this.attachEvents();

    }

    attachEvents() {}

}

module.exports = DebatersOverlay;



