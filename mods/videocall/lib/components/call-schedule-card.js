const callScheduleCardTemplate = require('./call-schedule-card.template.js');

class CallScheduleCard {
    constructor(app, mod, container, obj) {
        this.app = app;
        this.mod = mod;
        this.obj = obj;
        this.room_obj = obj.room_obj
        this.container = container;
        this.interval = null;
    }


    render() {
        let utcStartTime = new Date(this.obj.startTime);
        const localStartTime = new Date(utcStartTime.getTime() - utcStartTime.getTimezoneOffset() * 60000);
        this.obj.localStartTime = localStartTime
        this.app.browser.addElementToSelector(callScheduleCardTemplate(this.app, this.mod, {...this.obj, startTime: localStartTime.toLocaleString()}), this.container);
        this.attachEvents(this.app, this.mod);
        this.updateButtonState();
        this.interval = setInterval(() => this.updateButtonState(), 1000);
    }


    attachEvents(app, mod) {
        const joinButton = document.querySelector(`#${this.obj.cardId} .enter-call-button`);
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                if (!joinButton.classList.contains('disabled')) {
                    console.log("Joining call...");
                    console.log(this.room_obj, "room_obj")
                    this.mod.room_obj = JSON.parse(this.room_obj)
                    this.app.connection.emit('remove-call-schedule-join')
                    this.app.connection.emit("call-launch-enter-call")
                          
                }
            });
        }
    }

    updateButtonState() {
        const joinButton = document.querySelector(`#${this.obj.cardId} .enter-call-button`);
        if (!joinButton) return; 

        const now = new Date();
        const startTime = new Date(this.obj.localStartTime);
        
        if (now >= startTime) {
            // joinButton.classList.remove('disabled');
            joinButton.textContent = 'Enter Call';
            joinButton.classList.add('saito-button-primary')
        } else {
            // joinButton.classList.add('disabled');
            const timeLeft = this.getTimeLeft(now, startTime);
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

    remove() {
        if (this.interval) {
            console.log("interval cleared")
            clearInterval(this.interval);
        }
        const cardElement = document.querySelector(`#${this.obj.cardId}`);
        if (cardElement) {
            cardElement.remove();
        }
    }
}

module.exports = CallScheduleCard;