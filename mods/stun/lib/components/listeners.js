const StunComponentListenersTemplate = require("./listeners.template");


class Listeners {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
  }

  render(app, mod) {

    // 
    // Note:
    // `listeners` is empty in constructor 
    //
    const preferred_crypto = app.wallet.returnPreferredCrypto();
    let publicKey = preferred_crypto.returnAddress();
    let key_index = app.keys.keys.findIndex(key => key.publickey === publicKey)
    const listeners = app.keys.keys[key_index].data?.stun?.listeners;

    app.browser.addElementToDom(StunComponentListenersTemplate(app, mod, listeners), "stun-information");
    
    this.attachEvents(app, mod);
  }


  attachEvents(app, mod) {
    // add listeners to stun module
      $('.stun-container').on('click', '#add-to-listeners-btn', function(e) {

          let input = $('#listeners-input').val().split(',');
          const listeners = input.map(listener => listener.trim());
          let stun_mod = app.modules.returnModule("Stun");
          stun_mod.addListeners(listeners);

      });

      app.connection.on('listeners-update', (app, listeners) => {
        let listenersHtml;
        if (listeners) {
            listenersHtml = listeners.map(listener => ` <li class="list-group-item">${listener}</li>`).join('');
            console.log(listeners, listenersHtml);
        } else {
            listenersHtml = "<p> There are no listeners";
        }

        if (document.querySelector("#stun-listeners")) {
            document.querySelector("#stun-listeners").innerHTML = listenersHtml;
        }

        if (document.querySelector('#connectSelect')) {
            document.querySelector('#connectSelect').innerHTML = listenersHtml;
        }
      });
  }
}

module.exports = Listeners;

