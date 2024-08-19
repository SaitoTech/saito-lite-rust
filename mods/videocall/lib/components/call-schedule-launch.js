const CallLaunch = require('./call-launch.js');
const CallScheduleLaunchTemplate = require('./call-schedule-launch.template.js');

class CallScheduleLaunch {
    constructor(app, mod, container) {
        this.app = app;
        this.mod = mod;
        this.container = container;
        this.name = "CallScheduleLaunch";
        this.callDetails = null;
        this.interval = null;
    }

    render() {
        let { startTime, duration, description, call_id } = this.mod.room_obj;
        console.log('watched public key', this.mod.room_obj);

        const utcStartTime = new Date(startTime);
        const localStartTime = new Date(utcStartTime.getTime() - utcStartTime.getTimezoneOffset() * 60000);
        let link = JSON.stringify(this.mod.room_obj);
        this.app.keychain.addKey(call_id, { identifier: call_id, type: "scheduled_call", startTime:utcStartTime, duration, description, link  });
        this.app.keychain.addWatchedPublicKey(call_id);

        this.callDetails = { 
            utcStartTime, 
            localStartTime, 
            duration, 
            description 
        };


        if (!document.querySelector('.call-schedule-launch')) {
            document.body.innerHTML += CallScheduleLaunchTemplate(this.app, { 
                startTime: localStartTime.toLocaleString(), 
                duration, 
                description 
            });
            this.attachEvents();
            this.updateButtonState();
            this.interval = setInterval(() => this.updateButtonState(), 1000);
        }
    }

    remove() {
        if (document.querySelector('.call-schedule-launch')) {
            document.querySelector('.call-schedule-launch').parentElement.removeChild(document.querySelector('.call-schedule-launch'));
        }
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    attachEvents() {
        const joinButton = document.querySelector('.enter-call-button');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                if (!joinButton.classList.contains('disabled')) {
                    let callLaunch = new CallLaunch(this.app, this.mod, this.container);
                    callLaunch.render();
                    this.remove();
                    console.log("Joining call...");
                }
            });
        }
    }

    updateButtonState() {
        const joinButton = document.querySelector('.enter-call-button');
        const now = new Date();
        
        if (now >= this.callDetails.localStartTime) {
            joinButton.classList.remove('disabled');
            joinButton.textContent = 'Enter Call';
        } else {
            joinButton.classList.add('disabled');
            const timeLeft = this.getTimeLeft(now, this.callDetails.localStartTime);
            joinButton.textContent = `Call starts in ${timeLeft}`;
        }
    }

    getTimeLeft(now, startTime) {
        const diff = startTime.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

module.exports = CallScheduleLaunch;