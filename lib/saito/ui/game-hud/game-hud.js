const GameHudTemplate = require("./game-hud.template");

const {
  DESKTOP,
  MOBILE_PORTRAIT,
  MOBILE_LANDSCAPE,
} = require("./game-hud-types");

/**
 * The HUD is a general interface for users to interact with a (board) game
 */
class GameHud {
  /**
   *
   */
  constructor(app) {
    this.app = app;
    this.game_mod = null;
    this.maxWidth = 0.5;
    this.card_width = 150; //Maximum card width of 150px
    this.initial_render = 0;
    this.auto_sizing = 1; //flag to automatically resize HUD based on its internal functions

    this.mode = 0; // 0 wide
    // 1 classic (square)
    // 2 vertical
    this.lastPosition = "";
  }

  /**
   * Create HUD if it does not exist
   * @param app - the Saito application
   * @param mod - the game module
   */
  render(app, mod) {
    this.game_mod = mod;
    this.game_mod.useHUD = 1;

    if (mod.browser_active == 1) {
      if (!document.querySelector("#hud")) {
        app.browser.addElementToDom(GameHudTemplate());
      }

      let hud = document.querySelector("#hud");
      hud.className = "hud"; //Remove additional class names
      hud.removeAttribute("style"); //Remove all inline styling

      if (this.mode == 0) {
        hud.classList.add("hud-long");
        this.maxWidth = 0.8;
      }
      if (this.mode == 1) {
        hud.classList.add("hud-square");
        this.maxWidth = 0.5;
      }
      if (this.mode == 2) {
        hud.classList.add("hud-vertical");
        this.maxWidth = 0.2;
      }

      if (this.auto_sizing) {
        this.resizeHud();
        //this.resizeHudHeight();
      }

      hud.style.display = "block";
    }
  }

  /**
   *
   */
  attachEvents(app, game_mod) {
    let myself = this;
    try {
      // hud is draggable
      app.browser.makeDraggable("hud", "hud-header");
    } catch (err) {
      console.error("HUD Events:", err);
    }

    // hud is minimizable
    try {
      let hud_toggle_button = document.getElementById("hud-toggle-button");
      hud_toggle_button.onclick = (e) => {
        e.stopPropagation();
        hud_toggle_button.classList.toggle("fa-caret-up");
        hud_toggle_button.classList.toggle("fa-caret-down");
        myself.toggleHud();
      };
    } catch (err) {
      console.error("HUD Events:", err);
    }
  }

  /**
   * (completely) hide Hud from the DOM
   */
  hide() {
    try {
      document.getElementById("hud").style.display = "none";
    } catch (err) {}
  }

  /**
   *
   */
  updateStatus(status_html) {
    console.log("Update Status through HUD");
    let status_obj = document.getElementById("status");
    if (status_obj) {
      status_obj.innerHTML = status_html;
    }
    //Make sure to hide status-overlay (???) and diplay status
    let status_overlay_div = document.getElementById("status-overlay");
    if (status_overlay_div) {
      if (status_overlay_div.style.display !== "none") {
        status_overlay_div.style.display = "none";
        status_obj.style.display = "block";
      }
    }
    if (this.auto_sizing) { this.resizeHud();  }
    
    //Programmatically change toggle to make HUD pop up
    let hudToggle = document.getElementById("hud-toggle-button");
    if (hudToggle){
      if (hudToggle.classList.contains("fa-caret-up")){
        hudToggle.classList.toggle("fa-caret-up");
        hudToggle.classList.toggle("fa-caret-down");
        this.toggleHud();
      }
    }
  }

  /**
   * Implement the toggle (slide on/offscreen) to minimize and restore HUD from display
   */
  toggleHud() {
    let hud = document.getElementById("hud");
    let hudToggle = document.getElementById("hud-toggle-button");
    if (!hud || !hudToggle) {
      console.error("Couldn't find HUD elements");
      return;
    }

    let deviceType = this.checkSizeAndOrientation();
    console.log("HUD detects ", deviceType);
    switch (deviceType) {
      case DESKTOP:
        if (hudToggle.classList.contains("fa-caret-up")) {
          //I am minimized
          this.lastPosition = getComputedStyle(hud).top;
          hud.style.top = `${window.innerHeight - 20}px`;
        } else {
          //I am restored
          hud.style.top = this.lastPosition;
          this.resizeHud();
        }

        break;
      case MOBILE_PORTRAIT:
      //          hud.classList.toggle('hud-hidden-vertical');
      //          hud_toggle_button.classList.toggle('fa-caret-up');
      //          hud_toggle_button.classList.toggle('fa-caret-down');
      //          break;
      case MOBILE_LANDSCAPE:
      //          hud.classList.toggle('hud-hidden-horizontal');
      //          hud_toggle_button.classList.toggle('fa-caret-right');
      //          hud_toggle_button.classList.toggle('fa-caret-left');
      //          break;
    }
  }

  /**
   * Internal function to determines view window (Desktop, mobile landscape or mobile portrait)
   *
   */
  checkSizeAndOrientation() {
    if (
      window.matchMedia("(orientation: landscape)").matches &&
      window.innerHeight <= 700
    ) {
      return MOBILE_LANDSCAPE;
    }
    if (
      window.matchMedia("(orientation: portrait)").matches &&
      window.innerWidth <= 600
    ) {
      return MOBILE_PORTRAIT;
    }
    return DESKTOP;
  }

  /**
   * Attempt to resize the HUD based on contents of the .status-cardbox
   * If there are <hud-card>s in <status>, resize them to be no more than 150px wide
   * then figure out the width of <hud> to fit them.
   * Otherwise,
   */
  resizeHud() {
    console.log("*** RESIZING HUD***");
    let hud = document.getElementById("hud");
    let cards = document.querySelectorAll(".hud-card");
    let status = document.querySelector(".hud .status");
    hud.style.maxHeight = "unset";
    hud.style.maxWidth = "unset";

    if (!cards || cards.length == 0) {
      if (status){
        this.resizeHudStatus(status);
      }else{
        if (hud.style.width) {
          hud.style.width = "unset";
        }
        if (hud.style.height) {
          hud.style.height = "unset";
        }  
      }      
    } else {
      this.resizeHudCards(cards);
    }
  }

  resizeHudCards(cards) {
    console.log("*** RESIZING HUD FROM CARDS***");
    try {
      let hud =  document.getElementById("hud");
      // hud-body > status-cardbox should ideally take only 80% of the screen at max.
      let wwidth = this.maxWidth * window.innerWidth;

      //We don't want wider than 150px
      let ideal_width = Math.min(this.card_width, wwidth / cards.length);
      //But if too many cards, need to be able to split into rows
      // >>>> Add code here


      //Assign card widths (heights should sort themselves out from css (height:fit-content), content is <img>)
      Array.from(cards).forEach((card) => {
        card.style.width = ideal_width + "px";
      });

      //Add a little extra so grid can have internal margins
      let card_width = cards[0].getBoundingClientRect().width + 20; 

      //Width to fit everything in one row
      let container_width = card_width * cards.length + 20; //and account for the margin
      container_width = Math.min(container_width, wwidth); //Maximum of 80% vw
      container_width = Math.max(container_width, 500); //Minimum of 500px (change this constant)
      hud.style.width = container_width + "px";

      let cardHeight = Math.max(
        this.game_mod.returnCardHeight(ideal_width),
        this.calculateElementHeight(cards[0])
      ); // because images take a second to load, we have to guestimate the expected height
      
      let msgHeight = this.calculateElementHeight(
        document.querySelector(".status-message")
      );
    
      this.resizeHudHeight(cardHeight+msgHeight);
    } catch (err) {
      console.error("ERR: " + err);
    }
  }

  /**
   * Use the general contents of the status to guesstimate an ideal hud size
   */ 
  resizeHudStatus(status) {
    console.log("*** RESIZING HUD FROM STATUS***");
    let hud =  document.getElementById("hud");
    let currentWidth = hud.getBoundingClientRect().width;
    let stHeight = 0;
    let maxWidth = 0;
    Array.from(status.children).forEach((kid) => {
      stHeight += this.calculateElementHeight(kid);
      maxWidth = Math.max(maxWidth, kid.getBoundingClientRect().width);
    });
    hud.style.width = `${maxWidth+40}px`;
    this.resizeHudHeight(stHeight);
  }

  /**
   *
   */
  resizeHudHeight(definingHeight) {
    let hud = document.querySelector("#hud");
    let headerHeight = this.calculateElementHeight(document.getElementById("hud-header"));

    let hudRect = hud.getBoundingClientRect();
    //Check if HUD is docked to the bottom of the window (to preserve it whether whether shrink or grow)
    let dockBottom =  (hudRect.bottom === window.innerHeight);

    hud.style.height = `${definingHeight + headerHeight + 20}px`;
    console.log("New Hud Height,",dockBottom,hudRect.bottom,window.innerHeight);
    if (dockBottom || hudRect.bottom > window.innerHeight){
      hud.style.top = "unset";
      hud.style.bottom = "0px";
    }
  }

  /**
   *
   */
  calculateElementHeight(elm) {
    if (!elm) {
      console.error("elm not found");
      return 0;
    }
    let elmHeight = 0;
    let elmMargin = 0;

    if (document.all) {
      // IE
      elmHeight = elm.currentStyle.height;
      elmMargin =
        parseInt(elm.currentStyle.marginTop, 10) +
        parseInt(elm.currentStyle.marginBottom, 10);
    } else {
      // Mozilla
      let view = document.defaultView.getComputedStyle(elm);

      elmHeight = view.height;
      elmMargin =
        parseInt(view["margin-top"]) + parseInt(view["margin-bottom"]);
    }
    return parseInt(elmHeight) + parseInt(elmMargin);
  }
}

module.exports = GameHud;
