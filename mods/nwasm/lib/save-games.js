const saito = require('./../../../lib/saito/saito');
const SaveGamesTemplate = require("./save-games.template");
const SaitoOverlay = require("./../../../lib/saito/new-ui/saito-overlay/saito-overlay");
const JSON = require('json-bigint');

class SaveGamesOverlay {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.mod = mod;
    this.overlay = new SaitoOverlay(app);
  }

  render(app, mod, selector = "") {
    this.overlay.show(app, mod, SaveGamesTemplate(app, mod));

console.log("ACTIVE GAME SAVES: " + mod.active_game_saves.length);

    document.getElementById("nwasm-saved-games").innerHTML = "";

    

    for (let i = 0; i < mod.active_game_saves.length; i++) {
console.log("i1: " + i);
      let s = mod.active_game_saves[i];
console.log("i2: " + i);
      let stxmsg = s.returnMessage();
      let time_played = stxmsg.time_played;

      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      let res = app.browser.formatTime(time_played);

      if (res.hours) { hours = res.hours; }
      if (res.minutes) { minutes = res.minutes; }
      if (res.seconds) { seconds = res.seconds; }

      let hours_full = "00"; 
      let minutes_full = "00"; 
      let seconds_full = "00"; 

      if (hours != 0) { 
        if (hours < 10) {
	  hours_full = "0"+hours.toString()+":";
	} else {
	  hours_full = hours.toString()+":";
	}
      } else {
        hours_full = "";
      }

      if (minutes != 0) { 
        if (minutes < 10) {
	  minutes_full = "0"+minutes.toString()+":";
	} else {
	  minutes_full = minutes.toString()+":";
	}
      } else {
        minutes_full = "00:";
      }
      if (seconds != 0) { 
        if (seconds < 10) {
	  seconds_full = "0"+seconds.toString();
	} else {
	  seconds_full = seconds.toString();
	}
      } else {
        seconds_full = "00";
      }

      let time_elapsed = hours_full + minutes_full + seconds_full;

console.log("i3: " + i);
      let html = `
        <div id="save_game_${i}" data-id="${s.transaction.sig}" class="nwasm-saved-games-item">
          <div class="nwasm-saved-games-screenshot"><img src="${stxmsg.screenshot}" /><div class="nwasn_time_elapsed">${time_elapsed}</div></div>
        </div>
      `;
console.log("i4: " + i);
      if (!document.getElementById(`save_game_${i}`)) {
        app.browser.addElementToId(html, "nwasm-saved-games");
      }
console.log("i5: " + i);
    }
console.log("DONE");
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    let sgo = this;

    for (let i = 0; i < mod.active_game_saves.length; i++) {
      let s = mod.active_game_saves[i];
      let obj = document.getElementById(`save_game_${i}`);
      obj.onclick = (e) => {
	sgo.overlay.hide();	
	sgo.overlay.remove();	
	let sig = e.currentTarget.getAttribute("data-id");
console.log(sig);
        mod.loadSaveGame(sig);
	sgo.overlay.hide();
      };
    }

  }

}


module.exports = SaveGamesOverlay;


