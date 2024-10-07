const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const CallScheduleJoinTemplate = require('./call-schedule-join.template.js');

class CallScheduleJoin {
  constructor(app, mod, container = '') {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(app, mod);

    this.app.connection.on('remove-call-schedule-join', () => {
      this.remove();
    });
  }

  render() {
    this.keys = this.app.keychain.returnKeys({ type: 'event', mod: 'videocall' });
    if (this.keys.length === 0) {
      siteMessage("You don't have any saved meetings!");
      return;
    }
    if (!document.querySelector('.call-schedule-join-container')) {
      this.overlay.show(CallScheduleJoinTemplate(this.app, this.mod, this.keys));
      this.attachEvents();
    }
  }

  attachEvents() {
    const now = new Date().getTime();
    for (let event of this.keys) {
        this.updateButtonState(event, now);
    }

    document.querySelectorAll(".enter-call-button").forEach(c => {
        c.onclick = (e) => {
            let id = e.currentTarget.dataset.id;
            for (let k of this.keys){
                if (k.publicKey == id){
                    let link = k.link;
                    let parsedLink = link.split("stun_video_chat=");
                    let rCode = parsedLink.pop();
                    this.mod.room_obj = JSON.parse(this.app.crypto.base64ToString(rCode));
                    this.app.connection.emit('call-launch-enter-call');
                    this.remove();
                }
            }
        }
    });

    if (document.getElementById("create-new-room")){
      document.getElementById("create-new-room").onclick = async (e) => {
        this.remove();
        await this.mod.createRoom();
        app.connection.emit("call-launch-enter-call");
      }
    }

  }


  updateButtonState(event, now = Date.now()) {
      const card = document.querySelector(`.call-schedule-card-container[data-id="${event.publicKey}"]`);
      if (!card) return;

      if (now - event.startTime > -5*60*1000) {
        card.querySelector(".enter-call-button").classList.remove("hidden");
      } 

      if (now - event.startTime < 0) {
        // joinButton.classList.add('disabled');
        const timeLeft = this.getTimeLeft(now, event.startTime);
        card.querySelector(".call-countdown").textContent = `Call starts in ${timeLeft}`;

        setTimeout( ()=> { this.updateButtonState(event);}, 1000);

      }else{
        card.querySelector(".call-countdown").textContent = `Call has begun!`;
      }

      console.log(event);
  }

  getTimeLeft(now, startTime) {
    const diff = startTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  remove() {
    this.overlay.remove();
  }
}

module.exports = CallScheduleJoin;
