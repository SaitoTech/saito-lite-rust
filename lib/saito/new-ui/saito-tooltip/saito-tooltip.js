const SaitoTooltipTemplate = require("./saito-tooltip.template");

class SaitoTooltip {
  constructor(app){
    this.app = app;
    this.info = "";
    this.ordinal = 0;
  }

  render(app, mod, selector) {
    this.mod = mod;

    try {
      let div = document.querySelector(selector);
      
      if (div) {

        if (this.ordinal == 0) {
          for (let i = 1; i < 100; i++) {
            let qs = `saito-tooltip-${i}`;
            if (!document.getElementById(qs)) {
              this.ordinal = i;
              break;
            }
          }
        }
        let qs = `saito-tooltip-${this.ordinal}`;
        if (!document.getElementById(qs)) {
          div.innerHTML = SaitoTooltipTemplate(app, mod, this);

        }
        
      } else { 
        console.log(selector + " not found"); 
      }
    
    } catch (err) { 
      console.log(err);
      console.log("could not update div"); 
    }


    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    tooltip_self = this;
    const tooltip = document.getElementById('saito-tooltip-'+this.ordinal);

    tooltip.addEventListener('click', function (e) {
      console.log(document.getElementById('saito-tooltip-info-'+tooltip_self.ordinal));
      document.getElementById('saito-tooltip-info-'+tooltip_self.ordinal).classList.toggle('tooltip-info-hide');
    });

  }
}

module.exports = SaitoTooltip;