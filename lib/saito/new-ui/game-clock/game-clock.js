const GameClockTemplate = require("./game-clock.template");

class GameClock {
  constructor(app, mod) {
    this.app = app;
    this.game_mod = mod;
    this.clock_limit = 3600000;
  }

  render() {
    
    //set an initital time
    if (this.game_mod?.game?.clock_limit) { 
      this.clock_limit = parseInt(this.game_mod.game.clock_limit);
    }
    
    let clock = this.clock_limit;
    
    if (this.game_mod?.game?.clock_spent) { 
      clock -= parseInt(this.game_mod.game.clock_spent); 
    }

    try {
      if (!document.getElementById("game-clock")) {
        this.app.browser.addElementToDom(GameClockTemplate());
      }
    } catch (err) {
    }

    this.displayTime(clock);
    this.attachEvents();
  }

  attachEvents() {
    try {
      document.querySelector(".game-clock").addEventListener("click", (e) => {
        this.moveClock();
      });
    } catch (err) {}
  }

  returnHours(x) {
    if (x <= 0) { return 0; }
    return Math.floor(this.returnMinutes(x) / 60);
  }
  returnMinutes(x) {
    if (x <= 0) { return 0; }
    return Math.floor(this.returnSeconds(x) / 60);
  }
  returnSeconds(x) {
    if (x <= 0) { return 0; }
    return Math.floor(x / 1000);
  }

  displayTime(clock) {

    let hours = this.returnHours(clock);
    let minutes = this.returnMinutes(clock);
    let seconds = this.returnSeconds(clock);

    seconds = seconds - minutes * 60;
    minutes = minutes - hours * 60;

    if (hours < 0) {
      hours = 0;
    }
    if (minutes < 0) {
      minutes = 0;
    }
    if (seconds < 0) {
      seconds = 0;
    }

    if (hours < 10) {
      hours = "0" + hours;
    }
    if (minutes < 10) {
      minutes = "0" + minutes;
    }
    if (seconds < 10) {
      seconds = "0" + seconds;
    }

    try {
      document.getElementById("game-clock-hours").innerHTML = sanitize(hours);
      document.getElementById("game-clock-minutes").innerHTML = sanitize(minutes);
      document.getElementById("game-clock-seconds").innerHTML = sanitize(seconds);      
      document.getElementById("game-clock").style.color = this.analyzeTime(clock);
      document.getElementById("game-clock").style.display = "block";
    } catch (err) {}
  }

  analyzeTime(clock){
    if (clock/this.clock_limit > 0.8){
      return "yellowgreen";
    }
    if (clock/this.clock_limit > 0.65){
      return "greenyellow";
    }
    if (clock/this.clock_limit > 0.5){
      return "yellow";
    }
    if (clock/this.clock_limit > 0.3){
      return "orange";
    }
    if (clock/this.clock_limit > 0.15){
      return "orangered";
    }
    return "";
  }

  moveClock() {
    let c = document.querySelector(".game-clock");

    if (c.style.top === "0px" || c.style.top == null || c.style.top === " " || c.style.top == "") {
      c.style.top = "unset";
      c.style.bottom = "0px";
    } else {
      c.style.bottom = "unset";
      c.style.top = "0px";
    }
  }

  hide(){
    let c = document.querySelector("#game-clock");
    if (c){
      c.style.display = "none";
    }    
  }
}

module.exports = GameClock;
