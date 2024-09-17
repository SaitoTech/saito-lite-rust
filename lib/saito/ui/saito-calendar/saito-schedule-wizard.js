const SaitoOverlay = require('../saito-overlay/saito-overlay.js');
const SaitoLoader = require('../saito-loader/saito-loader.js');
const ScheduleWizardTemplate = require('./saito-schedule-wizard.template.js');

class CallScheduleWizard {
    constructor(app, mod, name = "") {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(app, mod);
        this.callbackAfterSubmit = null
        this.name = name || mod.name;
    }
    render() {
        if (!document.querySelector('.call-schedule-container')) {
            this.overlay.show(ScheduleWizardTemplate(this.app, this.mod, this.name));
            this.attachEvents(this.app, this.mod);
        }
    }
    attachEvents(app, mod) {

        this.interval = setInterval(() => this.updateMinDateTime(), 60000);

        const form = document.getElementById('scheduleForm');
        if (form){
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
        
                const startTimeInput = document.getElementById('startTime');

                if (startTimeInput){
                    let localStartTime = startTimeInput.value;
                    const duration = document.getElementById('duration').value;
                    const description = document.getElementById('description').value;
                    const utcStartTime = this.convertToUTC(localStartTime);

                    if(this.callbackAfterSubmit){
                        await this.callbackAfterSubmit(app, mod, duration, description, utcStartTime);
                    }else {
                        console.error('callback function has not been added')
                    }
                
                    clearInterval(this.interval);
                    this.overlay.remove();

                }
            });
        }
    }

    initializeForm() {
        const startTimeInput = document.getElementById('startTime');
        const now = new Date();
        let localDateTime = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
    
        startTimeInput.min = localDateTime;
    }
    

    updateMinDateTime() {
        const startTimeInput = document.getElementById('startTime');
        const now = new Date();
        const localDateTime = now.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T');
        startTimeInput.min = localDateTime;
        if (startTimeInput.value < localDateTime) {
            startTimeInput.value = localDateTime;
        }
    }

    convertToUTC(localDateTime) {
        const date = new Date(localDateTime);
        return date.toISOString().slice(0, 16);
    }

}

module.exports = CallScheduleWizard;