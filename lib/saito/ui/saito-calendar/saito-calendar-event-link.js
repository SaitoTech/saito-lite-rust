const SaitoOverlay = require('../saito-overlay/saito-overlay');
const SaitoCalendarEventTemplate = require('./saito-calendar-event-link.template.js');

class SaitoCalendarEvent {
    constructor(app, mod, event) {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(app, mod);
        this.event = event;
        this.interval = null;
    }

    render() {
        this.overlay.show(SaitoCalendarEventTemplate(this.app, this.event), ()=> {
             if (this.interval) {
                clearInterval(this.interval);
            }
        });

        window.history.pushState('', '', window.location.pathname);
        this.attachEvents();
    }


    attachEvents() {

        this.updateButtonState();
        this.interval = setInterval(() => this.updateButtonState(), 1000);

        const joinButton = document.getElementById('enter-call-button');
        if (joinButton) {
            joinButton.addEventListener('click', () => {
                this.app.keychain.addKey(this.event.publicKey, this.event);
                this.app.keychain.addWatchedPublicKey(this.event.publicKey);
                this.overlay.close();
                navigateWindow(this.event.link);
            });
        }

        const bookmark = document.getElementById('add-to-calendar');
        if (bookmark) {
            bookmark.onclick = (e) => {
                this.app.keychain.addKey(this.event.publicKey, this.event);
                this.app.keychain.addWatchedPublicKey(this.event.publicKey);
                this.app.connection.emit('calendar-refresh-request');
                this.overlay.close();
            }
        }

    }

    updateButtonState() {
        const joinButton = document.querySelector('.time-to-call');;
        const now = new Date().getTime();
        
        let startTime_in_ms = new Date(this.event.startTime).getTime();

        console.log(now, startTime_in_ms);

        if (now < startTime_in_ms) {
            const timeLeft = this.getTimeLeft(now, startTime_in_ms);
            joinButton.textContent = `Call starts in ${timeLeft}`;
        }
    }

    getTimeLeft(now, start) {
        const diff =  start - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

module.exports = SaitoCalendarEvent;