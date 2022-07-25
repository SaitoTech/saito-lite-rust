const StunComponentMyStunTemplate = require("./my-stun.template");


class MyStun {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {
    let publicKey = app.wallet.returnPublicKey();
    const key_index = app.keys.keys.findIndex(tk => tk.publickey === publicKey);
    let listeners = app.keys.keys[key_index].data.stun.listeners;

    app.browser.addElementToDom(StunComponentMyStunTemplate(app, mod, listeners), "stun-information");
    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {

    document.body.addEventListener('click', (e) => {
      if (e.target.id === "add-to-listeners-btn") {
        let input = document.querySelector('#listeners-input').value.split(',');
        const listeners = input.map(listener => listener.trim());
        let stun_mod = app.modules.returnModule("Stun");
        stun_mod.addListeners(listeners);
      }

      if (e.target.id === "createInvite") {
        let video_mod = app.modules.returnModule("Video");
        console.log(video_mod);
        video_mod.createVideoInvite();
      }
      if (e.target.id === "joinInvite") {
        let video_mod = app.modules.returnModule("Video");
        // invite code hardcoded for dev purposes
        const inviteCode = document.querySelector("#inviteCode").value;
        video_mod.joinVideoInvite(inviteCode.trim());
      }
    })
  }
}

module.exports = MyStun;

