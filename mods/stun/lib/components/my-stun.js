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

    app.browser.addElementToDom(StunComponentMyStunTemplate(app, mod, listeners), document.getElementById("stun-information"));
    this.attachEvents(app, mod);

  }


  attachEvents(app, mod) {

    $('.stun-container').on('click', '#createInvite', function(e) {
        let video_mod = app.modules.returnModule("Video");
        console.log(video_mod);
        video_mod.createVideoInvite();
    });

    $('.stun-container').on('click', '#joinInvite', function(e) {
        let video_mod = app.modules.returnModule("Video");
        // invite code hardcoded for dev purposes
        const inviteCode = $("#inviteCode").val();
        video_mod.joinVideoInvite(inviteCode.trim());
    });

    $('.stun-container').on('click', '#sendv-message-btn', (e) => {
          if (!this.peer_connection) return console.log("Peer connection instance has not been created");
          const text = $('#message-text').val();
          // console.log('text message', text);
          this.peer_connection.dc.send(text);
    });
  }
}

module.exports = MyStun;

