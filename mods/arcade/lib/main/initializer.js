const InitializerTemplate = require("./initializer.template");

class Initializer {
  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;

    app.connection.on("arcade-game-ready-render-request", (game_details) => {
      this.render(game_details.id);
      this.notify(game_details.name);
      this.attachEvents(game_details.slug);
      siteMessage(`${game_details.name} ready to play!`);
    });

    app.connection.on("arcade-close-game", (game_id)=>{
      if (game_id == this?.game_id){
        this.mod.is_game_initializing = false;
        this.app.connection.emit("rerender-whole-arcade");
      }
    });
  }

  render(game_id = null) {
    this.mod.is_game_initializing = true;
    this.game_id = game_id;

    let html = InitializerTemplate(game_id);

    if (document.querySelector(".arcade-initializer")) {
      this.app.browser.replaceElementBySelector(html, ".arcade-initializer");
    } else {
      this.app.browser.addElementToSelector(html, this.container);
    }
  }

  notify(game_name) {
    let hidden = "hidden";
    if (typeof document.hidden !== "undefined") {
      // Opera 12.10 and Firefox 18 and later support
      hidden = "hidden";
    } else if (typeof document.msHidden !== "undefined") {
      hidden = "msHidden";
    } else if (typeof document.webkitHidden !== "undefined") {
      hidden = "webkitHidden";
    }

    this.startNotification("Game ready!", game_name);

    if (document[hidden]) {
      this.ringTone();
    }
  }

  attachEvents(slug) {
    if (document.querySelector(".arcade-game-initializer-success-button")) {
      document.querySelector(".arcade-game-initializer-success-button").onclick = (e) => {
        //Remember where we enter the game from
        let am = this.app.modules.returnActiveModule().returnName();
        this.app.options.homeModule = am;
        this.app.storage.saveOptions();

        this.app.browser.logMatomoEvent(
          "StartGameClick",
          am,
          slug.slice(0, 1).toUpperCase() + slug.slice(1)
        );

        //Make sure we have enough time to save the options
        setTimeout(()=> {
          window.location = "/" + slug;  
        }, 400);
        
      };
    }
  }

  startNotification(msg, game) {
    //If we haven't already started flashing the tab
    if (!this.tabInterval) {
      this.tabInterval = setInterval(() => {
        if (document.title === game) {
          document.title = msg;
        } else {
          document.title = game;
        }
      }, 575);
    }
  }

  ringTone() {
    const context = new AudioContext(),
      gainNode = context.createGain(),
      start = document.querySelector("#start"),
      stop = document.querySelector("#stop");
    let oscillator = null,
      harmony = null;

    const volume = context.createGain();
    volume.connect(context.destination);
    gainNode.connect(context.destination);

    //Play first note
    oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.setTargetAtTime(523.25, context.currentTime, 0.001);
    gainNode.gain.setTargetAtTime(0.5, context.currentTime, 0.001);
    oscillator.connect(gainNode);
    oscillator.start(context.currentTime);

    harmony = context.createOscillator();
    //harmony.type = "sawtooth";
    harmony.frequency.value = 440;
    volume.gain.setTargetAtTime(0.6, context.currentTime, 0.001);
    harmony.start();
    harmony.connect(volume);

    //Play Second note
    setTimeout(() => {
      oscillator.frequency.setTargetAtTime(659.25, context.currentTime, 0.001);
    }, 350);
    //Play Third note
    setTimeout(() => {
      oscillator.frequency.setTargetAtTime(329.63, context.currentTime, 0.001);
      gainNode.gain.setTargetAtTime(0.8, context.currentTime, 0.01);
    }, 750);
    //Play fourth note
    setTimeout(() => {
      oscillator.frequency.setTargetAtTime(415.3, context.currentTime, 0.001);
      harmony.frequency.setTargetAtTime(554.37, context.currentTime, 0.001);
    }, 1100);
    //Fade out
    setTimeout(() => {
      volume.gain.setTargetAtTime(0, context.currentTime, 0.25);
      gainNode.gain.setTargetAtTime(0, context.currentTime, 0.25);
    }, 1300);
    //To silence
    setTimeout(() => {
      oscillator.stop(context.currentTime);
      oscillator.disconnect();
      harmony.stop(context.currentTime);
      harmony.disconnect();
    }, 3000);
  }
}

module.exports = Initializer;
