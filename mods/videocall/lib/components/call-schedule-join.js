const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');
const CallScheduleJoinTemplate = require('./call-schedule-join.template.js');

class CallScheduleJoin {
  constructor(app, mod, keys) {
    this.app = app;
    this.mod = mod;
    this.keys = keys;
    this.overlay = new SaitoOverlay(app, mod);

    app.connection.on('remove-call-schedule-join', () => {
      this.remove();
    });
  }

  render(auto_join = true) {

    if (this.keys.length == 0){
      this.remove(false);
      return;
    }

    if (!document.querySelector('.call-schedule-join-container')) {
      this.overlay.show(CallScheduleJoinTemplate(this, auto_join), ()=> { this.remove(false); });
      this.attachEvents(auto_join);
    }

    return true;
  }

  attachEvents(auto_join) {
    const now = new Date().getTime();
    for (let event of this.keys) {
        this.updateButtonState(event, now);
    }

    document.querySelectorAll(".enter-call-button").forEach(c => {
        c.onclick = async (e) => {
            let id = e.currentTarget.dataset.id;
            for (let k of this.keys){
                if (k.publicKey == id){
                    this.link = k.link;
                    let parsedLink = this.link.split("stun_video_chat=");
                    let rCode = parsedLink.pop();
                    this.mod.room_obj = JSON.parse(this.app.crypto.base64ToString(rCode));

                    this.remove(auto_join);

                    if (auto_join){
                      this.app.connection.emit('call-launch-enter-call');  
                    }else{
                      await navigator.clipboard.writeText(this.link);
                      siteMessage("Call link copied");
                    }
                    
                }
            }
        }
    });


    document.querySelectorAll(".delete-call-button").forEach(c => {
        c.onclick = (e) => {
            let id = e.currentTarget.dataset.id;
            for (let i = this.keys.length-1; i >=0; i--){
              if (this.keys[i].publicKey == id){
                this.keys.splice(i, 1);
              }
            }
            this.app.keychain.removeKey(id);
            // maybe send a cancel transaction?
            this.overlay.remove();
            this.render();
        }
    });

    if (document.getElementById("create-new-room")){
      document.getElementById("create-new-room").onclick = async (e) => {
        this.remove(auto_join);
        this.link = await this.mod.createRoom();
        if (auto_join){
          this.app.connection.emit('call-launch-enter-call');  
        }else{
          await navigator.clipboard.writeText(this.link);
          siteMessage("Call link copied");
        }
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

  remove(auto_join = true) {
    this.overlay.remove();
    this.app.connection.emit('close-preview-window', !auto_join);
  }
}

module.exports = CallScheduleJoin;
