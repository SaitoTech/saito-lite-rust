const InitializerTemplate = require("./initializer.template");

class Initializer {
	
  constructor(app, mod, container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
  
    app.connection.on("arcade-game-ready-render-request", (game_details) => {
      this.render(game_details.id);
      this.notify(game_details.name);
      this.attachEvents(game_details.slug);
    });

  }

  render(game_id = null) {

    this.mod.is_game_initializing = true;

    let html = InitializerTemplate(game_id); 
    
    if (document.querySelector(".arcade-initializer")) {
      this.app.browser.replaceElementBySelector(html, ".arcade-initializer");
    } else {
      this.app.browser.addElementToSelector(html, this.container);
    }

  }

  notify(game_name){
    let hidden = "hidden";
      if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
        hiddenTab = "hidden";
      } else if (typeof document.msHidden !== "undefined") {
        hiddenTab = "msHidden";
      } else if (typeof document.webkitHidden !== "undefined") {
        hiddenTab = "webkitHidden";
      }

      this.startNotification("Game ready!", game_name);

      if (document[hidden]) {
        this.ringTone();
      }
  }

  attachEvents(slug) {
  
    if (document.querySelector(".arcade-game-initializer-success-button")){
      document.querySelector(".arcade-game-initializer-success-button").onclick = (e) => {
        this.app.browser.logMatomoEvent("Arcade", "StartGameClick", slug);
        window.location = "/" + slug;
      }
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
    var context = new AudioContext(),
      gainNode = context.createGain(),
      start = document.querySelector('#start'),
      stop = document.querySelector("#stop"),
      oscillator = null,
      harmony = null;

    var volume = context.createGain();
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

