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
            this.overlay.show(ScheduleWizardTemplate(this.app, this.mod, this), () => {
                if (this.interval){
                    clearInterval(this.interval);
                    this.interval = null;
                }
            });
            this.attachEvents(this.app, this.mod);
        }
    }
    attachEvents(app, mod) {

        this.interval = setInterval(() => this.updateMinDateTime(), 60000);

        const form = document.getElementById('scheduleForm');
        if (form){
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                if (document.getElementById('description')){
                    this.description = document.getElementById('description').value;
                }

                if (document.getElementById('title')){
                    this.title = document.getElementById('title').value;
                }
        
                const startTimeInput = document.getElementById('startTime');

                if (startTimeInput){
                    let localStartTime = startTimeInput.value;
                    
                    const utcStartTime = new Date(localStartTime).getTime();

                    const duration = document.getElementById('duration').value;

                    if (this.callbackAfterSubmit) {
                        await this.callbackAfterSubmit(utcStartTime, duration, this?.description, this?.title);
                    } else {
                        console.error('callback function has not been added')
                    }
                
                    this.overlay.close();

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
}

module.exports = CallScheduleWizard;