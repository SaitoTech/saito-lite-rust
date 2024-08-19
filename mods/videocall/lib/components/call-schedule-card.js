const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader.js');
const callScheduleCardTemplate = require('./call-schedule-card.template.js');

class CallScheduleCard {
    constructor(app, mod,container,  obj ) {
        this.app = app;
        this.mod = mod;
        this.obj = obj;
        this.container = container;
    }

    render() {
        // if (!document.querySelector('.call-schedule-card-container')) {
            this.app.browser.addElementToSelector(callScheduleCardTemplate(this.app, this.mod, this.obj), this.container)
            this.attachEvents(this.app, this.mod);
        // }
    }

    attachEvents(app, mod) {
      
    }

  
  
}

module.exports = CallScheduleCard;