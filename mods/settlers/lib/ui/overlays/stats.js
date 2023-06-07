const SettlersStatsOverlayTemplate = require("./stats.template");
const SaitoOverlay = require("./../../../../../lib/saito/ui/saito-overlay/saito-overlay");

class StatsOverlay {

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(this.app, this.mod, false);
    this.dice_count = [];
  }

  render() {
    
    this.overlay.show(SettlersStatsOverlayTemplate(this));

    this.createHistogram();
    this.attachEvents();

  }

  attachEvents() {
  }

  createHistogram(){
    let highest_count =  this.mod.game.stats.dice[2];
    // get highest count
    for (let i = 2; i <= 12; i++){
      if (this.mod.game.stats.dice[i] > highest_count) {
        highest_count = this.mod.game.stats.dice[i];
      }
    }

    // height for 1 count; max: 10rem
    let base_height = 10/highest_count;

    for (let i = 2; i <= 12; i++){
      let bar_height = base_height*this.mod.game.stats.dice[i];
      document.querySelector('.dice-'+i).style.height = bar_height+'rem';
      document.querySelector('.dice-'+i+' .settlers-dice-count').innerHTML = this.mod.game.stats.dice[i];

      if (bar_height == 0) {
        document.querySelector('.dice-'+i).style.border = 'none';        
        document.querySelector('.dice-'+i+' .settlers-dice-count').innerHTML = '';
      }
    }
  }

}

module.exports = StatsOverlay;

