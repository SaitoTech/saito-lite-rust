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
                callScheduleWizard.callbackAfterSubmit = async (utcStartTime, duration, description = "", title = "") => {

                    //Creates public key for clal
                    const call_id = await this.mod.generateRoomId();

                    const room_obj = {
                        call_id,
                        scheduled: true,
                        call_peers: [],
                        startTime: utcStartTime, 
                        duration,
                        profile: {description}
                    };
        
                    let call_link =  this.mod.generateCallLink(room_obj)

                    this.app.keychain.addKey(call_id, { identifier: title || "Video Call", startTime:utcStartTime, duration, description, link: call_link });
        
                    this.app.connection.emit('calendar-refresh-request');
                    let event_link =  this.app.browser.createEventInviteLink(this.app.keychain.returnKey(call_id));

                    await navigator.clipboard.writeText(event_link);
                    siteMessage('Invitation link copied to clipboard', 3500);
                }

                callScheduleWizard.render()

            }
        }

    }
}

module.exports = CallPreLauncher;