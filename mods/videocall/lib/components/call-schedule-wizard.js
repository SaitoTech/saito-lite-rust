const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader.js');
const callScheduleWizardTemplate = require('./call-schedule-wizard.template.js');

class CallScheduleWizard {
    constructor(app, mod, container = '') {
        this.app = app;
        this.mod = mod;
        this.container = container;
        this.overlay = new SaitoOverlay(app, mod);
    }

    render() {
        if (!document.querySelector('.call-schedule-container')) {
            this.overlay.show(callScheduleWizardTemplate(this.app, this.mod));
            this.attachEvents(this.app, this.mod);
        }
    }

    attachEvents(app, mod) {
        const form = document.getElementById('scheduleForm');
        const startTimeInput = document.getElementById('startTime');
        this.initializeForm();
        setInterval(() => this.updateMinDateTime(), 60000);
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!this.mod.isRelayConnected) {
                siteMessage('Wait for peer connection');
                return;
            }
            let localStartTime = startTimeInput.value;
            const duration = document.getElementById('duration').value;
            const description = document.getElementById('description').value;

            const utcStartTime = this.convertToUTC(localStartTime);

            console.log('UTC start time', utcStartTime);
            const call_id = await this.mod.generateRoomId();
            const room_obj = {
                call_id,
                scheduled: true,
                call_peers: [],
                startTime: utcStartTime, 
                duration,
                description
            };
            const link = JSON.stringify(room_obj);
            this.app.keychain.addKey(call_id, { identifier: call_id, type: "scheduled_call", startTime:utcStartTime, duration, description, link  });
            await navigator.clipboard.writeText(link);
            siteMessage('New room link created and copied to clipboard', 1500);


            this.overlay.remove();
        });
    }

    initializeForm() {
        const startTimeInput = document.getElementById('startTime');
        const now = new Date();
        const localDateTime = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
        startTimeInput.value = localDateTime;
        startTimeInput.min = localDateTime;
    }

    updateMinDateTime() {
        const startTimeInput = document.getElementById('startTime');
        const now = new Date();
        const localDateTime = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
        startTimeInput.min = localDateTime;
    }

    convertToUTC(localDateTime) {
        const date = new Date(localDateTime);
        return date.toISOString().slice(0, 16);
    }

    createRoomLink(room_obj) {
        const base64obj = this.app.crypto.stringToBase64(JSON.stringify(room_obj));
        const url1 = window.location.origin + '/videocall/';
        return `${url1}?stun_video_chat=${base64obj}`;
    }
}

module.exports = CallScheduleWizard;