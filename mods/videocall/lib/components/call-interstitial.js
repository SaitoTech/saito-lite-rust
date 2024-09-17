const CallPreLauncherTemplate = require('./call-interstitial.template');
const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const CallScheduleWizard = require('../../../../lib/saito/ui/saito-calendar/saito-schedule-wizard.js');

class CallPreLauncher {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(app, mod);
    }


    render() {

        this.overlay.show(CallPreLauncherTemplate());
        this.attachEvents();
    }


    attachEvents() {

        if (document.getElementById('create-invite-now')){
            document.getElementById('create-invite-now').onclick = (e) => {
                this.overlay.close();
                this.mod.renderInto('.saito-overlay');
            }
        }

        if (document.getElementById('create-specific-date')){
            document.getElementById('create-specific-date').onclick = (e) => {
                this.overlay.close();

                const callScheduleWizard = new CallScheduleWizard(this.app, this.mod)
                callScheduleWizard.callbackAfterSubmit = async function (app, mod, duration, description, utcStartTime) {

                    //Creates public key for clal
                    const call_id = await mod.generateRoomId();

                    const room_obj = {
                        call_id,
                        scheduled: true,
                        call_peers: [],
                        startTime: utcStartTime, 
                        duration,
                        description
                    };
        
                    const room_obj_stringified = JSON.stringify(room_obj);
                    let call_link =  mod.generateCallLink(room_obj)
                    app.keychain.addKey(call_id, { identifier: "Video Call", startTime:utcStartTime, duration, description });
        
                    app.connection.emit('calendar-refresh-request');
                    await navigator.clipboard.writeText(call_link);
                    siteMessage('Invitation link copied to clipboard', 3500);
                }

                callScheduleWizard.render()

            }
        }

    }
}

module.exports = CallPreLauncher;