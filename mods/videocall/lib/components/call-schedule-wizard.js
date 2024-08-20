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
			this.initializeForm();
            this.attachEvents(this.app, this.mod);
        }
    }

    attachEvents(app, mod) {
        const form = document.getElementById('scheduleForm');
        const startTimeInput = document.getElementById('startTime');

        // Set min datetime when the page loads
        this.setMinDateTime();

        // Update min datetime every minute
        setInterval(() => this.setMinDateTime(), 60000);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!this.mod.isRelayConnected) {
                siteMessage('Wait for peer connection');
                return;
            }

            const startTime = startTimeInput.value;
            const duration = document.getElementById('duration').value;
            const description = document.getElementById('description').value;

			console.log(startTime, duration, description, "details")
            const call_id = await this.mod.generateRoomId();
            const room_obj = {
                call_id,
                scheduled: true,
                call_peers: [],
                startTime,
                duration,
                description
            };

            const link = this.createRoomLink(room_obj);
            await navigator.clipboard.writeText(link);
            siteMessage('New room link created and copied to clipboard', 1500);

            // Close the overlay after successful submission
            this.overlay.remove()
        });
    }

    setMinDateTime() {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const minDateTime = now.toISOString().slice(0, 16);
        document.getElementById('startTime').min = minDateTime;
    }

    createRoomLink(room_obj) {
        const base64obj = this.app.crypto.stringToBase64(JSON.stringify(room_obj));
        const url1 = window.location.origin + '/videocall/';
        return `${url1}?stun_video_chat=${base64obj}`;
    }

	initializeForm() {
		const startTimeInput = document.getElementById('startTime');
		const now = new Date();
		now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
		const currentDateTime = now.toISOString().slice(0, 16);
		startTimeInput.value = currentDateTime;
		startTimeInput.min = currentDateTime;
	}
}

module.exports = CallScheduleWizard;