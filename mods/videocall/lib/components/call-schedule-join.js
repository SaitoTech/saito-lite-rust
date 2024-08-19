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
        this.cardInstances = [];


        this.app.connection.on('remove-call-schedule-join', ()=> {
            this.remove()
        })
    }

    render() {
        this.keys = this.app.keychain.returnKeys({type: "scheduled_call"});
        if(this.keys.length === 0) {
            siteMessage("You don't have any saved meetings!")
            return;
        }
        if (!document.querySelector('.call-schedule-join-container')) {
            this.overlay.show(callScheduleJoinTemplate(this.app, this.mod));
            this.renderCallSchedules();
            this.attachEvents(this.app, this.mod);
        }
    }

    attachEvents(app, mod) {
    }


    renderCallSchedules() {
    
        this.keys.forEach((key, index) => {
            let {startTime, description, duration, room_obj} = key;
            let cardId = `call-schedule-${index}`;
            let card = new CallScheduleCard(this.app, this.mod, ".scheduled-calls", {startTime, description, duration, room_obj, cardId});
            card.render();
            this.cardInstances.push(card);
        });
    }

    remove() {
        this.cardInstances.forEach(card => card.remove());
        this.cardInstances = [];
        this.overlay.remove()
    }
}

module.exports = CallScheduleJoin;