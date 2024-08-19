const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader.js');
const callScheduleJoinTemplate = require('./call-schedule-join.template.js');
const CallScheduleCard = require('./call-schedule-card.js');

class CallScheduleJoin {
    constructor(app, mod, container = '') {
        this.app = app;
        this.mod = mod;
        this.container = container;
        this.overlay = new SaitoOverlay(app, mod);
    }


    render() {
        if (!document.querySelector('.call-schedule-join-container')) {
            this.overlay.show(callScheduleJoinTemplate(this.app, this.mod));
            this.renderCallSchedules();
            this.attachEvents(this.app, this.mod);
        }
    }

    attachEvents(app, mod) {
      
    }

    renderCallSchedules() {
        let keys = this.app.keychain.returnKeys({type: "scheduled_call"});
        keys.forEach(key => {
            let {startTime, description} = key;
            let card = new CallScheduleCard(this.app, this.mod, ".scheduled-calls",  {startTime ,description})
            card.render();
         })   
    }

  
  
}

module.exports = CallScheduleJoin;