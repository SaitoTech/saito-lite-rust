const SettlersScoreboardTemplate = require("./scoreboard.template");
const SaitoOverlay = require("./../../../lib/saito/ui/saito-overlay/saito-overlay");

class SettlersScoreboard {

  constructor(app, mod, unit="", container="") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.overlay = new SaitoOverlay(this.app, this.mod);
  }

  render() {
 
    let myqs = this.container + " .scoreboard";

    if (document.querySelector(myqs)) {
      this.app.browser.replaceElementBySelector(SettlersScoreboardTemplate(this), myqs);
    } else {
      this.app.browser.addElementToSelector(SettlersScoreboardTemplate(this), this.container);
    }

    this.attachEvents();
  }

  attachEvents() {

    document.querySelector(".scoreboard").onclick = (e) => {
      if (document.querySelector(".scoreboard").classList.contains("scoreboard-lock")) {
	document.querySelector(".scoreboard").classList.remove("scoreboard-lock");
      } else {
	document.querySelector(".scoreboard").classList.add("scoreboard-lock");
      }
    }

    
    document.querySelector("#build-info").onclick = (e) => {
      console.log("opening build overlay ///////////////");
      this.overlay.show(this.returnHTML());
    }
  }

  lock(){
    try {
      document.querySelector(".scoreboard").classList.add("scoreboard-lock");
      setTimeout(function() {
        document.querySelector(".scoreboard").classList.remove("scoreboard-lock");
      }, 1500);
    } catch(err) {
      console.log(err);
    }
  }

  returnHTML() {
    return `


      <div class="trade_overlay saitoa" id="trade_overlay">
       <div>
          <div class="h1 trade_overlay_title">Build</div>
       </div>
       
          
       <div class="build-container">
  
        <div class="build-item-column">
          <div class="build-item-row build-item-row-label">
            <div class="build-column"></div>
            <div class="build-column"></div>
            <div class="build-column">VP</div>
            <div class="build-column resources-container">Resources needed</div>
          </div>
          <div class="build-item-row">
            <div class="build-column">
              <div class="build-text">Road</div>
            </div>
            <div class="build-column">
              <img class="build-item" src="/settlers/img/icons/road.png">
            </div>

            <div class="build-column">
              <div class="build-text">1</div>
            </div>

            <div class="build-column resources-container">
              <img class="build-card" src="/settlers/img/cards/brick.png">
              <img class="build-card" src="/settlers/img/cards/wood.png">

            </div>

          </div>
        </div>
        
          <div class="build-item-column">
            <div class="build-item-row">
              <div class="build-column">
                <div class="build-text">Village</div>
              </div>
              <div class="build-column">
                <img class="build-item" src="/settlers/img/icons/village.png">
              </div>

              <div class="build-column">
                <div class="build-text">2</div>
              </div>

              <div class="build-column resources-container">
                <img class="build-card" src="/settlers/img/cards/ore.png">
                <img class="build-card" src="/settlers/img/cards/wood.png">
                <img class="build-card" src="/settlers/img/cards/brick.png">
                <img class="build-card" src="/settlers/img/cards/wool.png">
              </div>
            </div>
          </div>

          <div class="build-item-column">
            <div class="build-item-row">
              <div class="build-column">
                <div class="build-text">City</div>
              </div>
              <div class="build-column">
                <img class="build-item build-item-disabled" src="/settlers/img/icons/city.png">
              </div>

              <div class="build-column">
                <div class="build-text">2</div>
              </div>

              <div class="build-column resources-container">
                <img class="build-card" src="/settlers/img/cards/wool.png">
                <img class="build-card" src="/settlers/img/cards/wood.png">
                <img class="build-card build-card-disabled" src="/settlers/img/cards/ore.png">
                <img class="build-card build-card-disabled" src="/settlers/img/cards/wheat.png">
                <img class="build-card build-card-disabled" src="/settlers/img/cards/wheat.png">
              </div>
            </div>
          </div>
        
      </div>
    </div>
    `;
  }

}

module.exports = SettlersScoreboard;



