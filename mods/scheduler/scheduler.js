const saito = require("./../../lib/saito/saito");
const ModTemplate = require('../../lib/templates/modtemplate');
const SaitoHeader = require('../../lib/saito/new-ui/saito-header/saito-header');
const SchedulerOverlay = require('./lib/schedule-overlay');


class Scheduler extends ModTemplate {

    constructor(app, options) {

        super(app);

        this.appname = "Scheduler";
        this.name = "Scheduler";
        this.slug = "scheduler";
        this.description = "Module for scheduling games, events, leagues";
        this.categories = "Utility";

        this.tweets = [];

        this.styles = [
          '/saito/saito.css',
          '/scheduler/css/scheduler-main.css'
        ];

        this.ui_initialized = false;
        this.options = options;
    }

    //this function will trigger when you are connected to a peer.
    onPeerHandshakeComplete(app, peer) {
        if (app.BROWSER == 1) {
            if (this.browser_active == 1) {
            }
        }
    }

    onConfirmation(blk, tx, conf, app) {
    }

    createOverlay(app) {
        this.main = new SchedulerOverlay(app, this, this.options);
        this.main.render();
    }

}

module.exports = Scheduler;
