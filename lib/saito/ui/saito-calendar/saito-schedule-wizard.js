const SaitoOverlay = require('../saito-overlay/saito-overlay.js');
const SaitoLoader = require('../saito-loader/saito-loader.js');
const callScheduleWizardTemplate = require('../../../../mods/videocall/lib/components/call-schedule-wizard.template.js');

class CallScheduleWizard {
    constructor(app, mod, container = '', defaultDate, name = "") {
        this.app = app;
        this.mod = mod;
        this.container = container;
        this.overlay = new SaitoOverlay(app, mod);
        this.defaultDate = defaultDate;
        this.callbackAfterSubmit = null
        this.name = name
    }
    render() {
        if (!document.querySelector('.call-schedule-container')) {
            this.overlay.show(callScheduleWizardTemplate(this.app, this.mod, this.name));
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
            if (this.mod.name === "Videocall" && !this.mod.isRelayConnected) {
                siteMessage('Wait for peer connection');
                return;
            }
            let localStartTime = startTimeInput.value;
            const duration = document.getElementById('duration').value;
            const description = document.getElementById('description').value;
            const utcStartTime = this.convertToUTC(localStartTime);
            if(this.callbackAfterSubmit){
                await this.callbackAfterSubmit(app, mod, duration, description, utcStartTime);
            }else {
                console.error('callback function has not been added')
            }

        
            this.overlay.remove();
        });
    }

    initializeForm() {
        let defaultDate = this.defaultDate
        const startTimeInput = document.getElementById('startTime');
        let localDateTime;
        if (defaultDate && defaultDate.day && defaultDate.month && defaultDate.year) {
            const { day, month, year } = defaultDate;
            const now = new Date();
            localDateTime = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T12:00`;
        } else {
            const now = new Date();
            localDateTime = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
        }
    
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

}

module.exports = CallScheduleWizard;