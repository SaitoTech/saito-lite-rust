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
        if (!document.querySelector('.call-schedule-join-container')) {
            this.overlay.show(callScheduleJoinTemplate(this.app, this.mod));
            this.renderCallSchedules();
            this.attachEvents(this.app, this.mod);
        }
    }

    attachEvents(app, mod) {
        // Add any necessary event listeners
    }

    renderCallSchedules() {
        let keys = this.app.keychain.returnKeys({type: "scheduled_call"});
        keys.forEach((key, index) => {
            let {startTime, description, duration, link} = key;
            let cardId = `call-schedule-${index}`;
            let card = new CallScheduleCard(this.app, this.mod, ".scheduled-calls", {startTime, description, duration, link, cardId});
            card.render();
            this.cardInstances.push(card);
        });
    }

    remove() {
        this.cardInstances.forEach(card => card.remove());
        this.cardInstances = [];
        this.overlay.remove()
        // Remove the overlay or container as needed
    }
}

module.exports = CallScheduleJoin;