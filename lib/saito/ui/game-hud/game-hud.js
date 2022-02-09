const GameHudTemplate = require("./game-hud.template");

const {
  DESKTOP,
  MOBILE_PORTRAIT,
  MOBILE_LANDSCAPE,
} = require("./game-hud-types");

/**
 * The HUD is a general interface for users to interact with a (board) game
 * HUD is optimized for dynamically displaying user controls, and will (unless overridden) attempt to resize
 * in order to optimally fit the height and width of the menu options, by assuming developers follow certain 
 * conventions about labeling cards, icons, or text menu lists for users to click on.
 * Other than rendering and attaching events in your Game_Module, you will primarily interact with GameHud
 * indirectly. GameTemplate includes two functions for nicely putting content into the GameHud--
 * updateStatusAndListCards -- display a status message (prompt) and graphical depiction of cards
 * updateStatusWithOptions -- display a status message (prompt) and a list of text commands
 * 
 * HUD vs PlayerBox. HUD is best when information about game state is available on the game board and we don't need persistent summaries of opponent statistics. 
 * HUD is flexible for inserting different kinds of clickable options to interact with the game, and can be easily hidden to allow viewing of a possibly large/complex game board 
 *
 * 
 * GameHud is available in different modes -- vertical (along the left side of the screen) 
 * or horizontal (along the bottom of the screen)
 * 
 */
class GameHud {
  /**
   * @constructor
   * @param app - the Saito application
   */
  constructor(app) {
    this.app = app;
    this.game_mod = null;
    this.maxWidth = 0.5;  //this.mode associated variable, ratio of view width for maximum display
    this.card_width = 150; //Maximum card width of 150px
    this.minWidth = 500; //num of pixels for minimum display width (dependent on this.mode)
    this.initial_render = 0;
    this.auto_sizing = 1; //flag to automatically resize HUD based on its internal functions
    this.enable_mode_change = 0; 

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

console.log("rendering the hud here...");

    this.game_mod = mod;
    this.game_mod.useHUD = 1;

    if (mod.browser_active == 1) {
      if (!document.querySelector("#hud")) {
        app.browser.addElementToDom(GameHudTemplate(this.enable_mode_change));
      }

      let hud = document.querySelector("#hud");
      hud.className = "hud"; //Remove additional class names
      hud.removeAttribute("style"); //Remove all inline styling

      switch(this.mode){
        case 0:
          hud.classList.add("hud-long");
        this.maxWidth = 1;
        this.minWidth = 600;
        break;
        case 1:
        hud.classList.add("hud-square");
        this.maxWidth = 0.4;
        this.minWidth = 400;
        break;
        case 2:
         hud.classList.add("hud-vertical");
        this.maxWidth = 0.15;
        this.minWidth = 220;
        break;
        default: console.error("Undefined HUD Mode");
                 this.auto_sizing = false;

      }
      
      if (this.auto_sizing) {
        this.resizeHud();
      }
      hud.style.display = "block";
    }
  }

  /**
   * HUD events: 
   *    1) HUD can be dragged by the user to a new position
   *    2) HUD can be minimized/restored by clicking on an icon in its top right corner
   *    3) HUD mode can be toggled between available display modes (optional, requires changing the this.enable_mode_change property)
   * @param app - the Saito application
   * @param game_mod - the containing game module
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
      if (hud_toggle_button){
        hud_toggle_button.onclick = (e) => {
          e.stopPropagation();
          myself.toggleHud();
        };  
      }
    } catch (err) {
      console.error("HUD Events:", err);
    }

    //cycle through hud modes
    try{
      let hud_mode_button = document.getElementById("hud-mode-button");
      if (hud_mode_button){
        hud_mode_button.onclick = (e) => {
          e.stopPropagation();
          myself.mode++;
          if (myself.mode > 2){
            myself.mode = 0;
          }
          myself.render(app, game_mod);
        }  
      }
    }catch (err) {
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
   * Inserts provided HTML into the HUD and restores it from minimized position
   * HUD includes css to nicely display a brief text message in a <div class="status-header"></div> 
   * followed by additional more flexible html content
   * @param status_html - the html you want displayed
   */
  updateStatus(status_html) {

    //console.log("Update Status through HUD",status_html);
    let status_obj = document.getElementById("status");
    if (status_obj) {
      status_obj.innerHTML = status_html;
    }

    //Make sure to hide status-overlay (???) and diplay status
    let status_overlay_div = document.getElementById("status-overlay");
    if (status_overlay_div) {
      if (status_overlay_div.style.display !== "none") {
        status_overlay_div.style.display = "none";
        status_obj.style.display = "";
      }
    }
    if (this.auto_sizing) { this.resizeHud();  }
    
    //Programmatically change toggle to make HUD pop up
    let hudToggle = document.getElementById("hud-toggle-button");
    if (hudToggle){
      if (hudToggle.classList.contains("fa-caret-up")){
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

    hudToggle.classList.toggle("fa-caret-up");
    hudToggle.classList.toggle("fa-caret-down");

    let deviceType = this.checkSizeAndOrientation();
    console.log("HUD detects ", deviceType);
    switch (deviceType) {
      case DESKTOP:
        if (hudToggle.classList.contains("fa-caret-up")) {
          //I am minimized
          this.lastPosition = getComputedStyle(hud).top;
          hud.style.top = `${window.innerHeight - 20}px`;
          hud.style.paddingTop = "unset";
          /*hud.style.background = "#222d";*/
        } else {
          //I am restored
          hud.style.top = this.lastPosition;
          hud.style.paddingTop = "";
          hud.style.background = "";
          //this.resizeHud();
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
   * Resize the HUD based on its content
   * This method analyzes the content to determine how it should run resizeHudCards or resizeHudStatus 
   * 
   * 1) HUD contains cards (grid - .status-cardbox)
   * 2) HUD contains icons (flex - .status-icon-menu)
   * 3) HUD contains text  (ul   - .status-text-menu)
   * 4) Other 
   */
  resizeHud() {
    console.log("*** RESIZING HUD***");
    let hud = document.getElementById("hud");
    let hudbox = document.querySelector(".status-cardbox") || document.querySelector(".status-icon-menu");
    let status = document.querySelector(".hud .status");
    
    //hud.style.maxHeight = "unset";
    //hud.style.maxWidth = "unset";

    if (hudbox) {
      if (document.querySelector(".hud-card")){
        this.resizeHudCards(hudbox.children);  
      }else{
        this.resizeHudCards(hudbox.children,hudbox.firstElementChild.getBoundingClientRect().width);
      }
            
    } else {
      if (status){
        this.resizeHudStatus(status);
      }else{
          //Clear inline styling
          hud.style.width = "";
          hud.style.height = "";
      }
    }
  }


  /**
   * Resize HUD based on repeating elements, either cards or (square!) icons
   * Based on HUD.mode (long/vertical), will estimate height and width of HUD to fit all the elements in a single column/row
   * If using cards (which have large inherent size), will shrink them down to an ideal size for display. Icons have fixed size
   * 
   * @param cards - a node collection of the repeating elements
   * @param fixedSize - the width/height of the graphical icon unit
   * 
   */ 
  resizeHudCards(cards, fixedSize = 0) {
    console.log("*** RESIZING HUD FROM CARDS***",fixedSize);
    try {
      let hud =  document.getElementById("hud");
      // hud-body > status-cardbox should ideally take only 80% of the screen at max.
      let wwidth = this.maxWidth * window.innerWidth;
      
      let colCt = cards.length;
      if (this.mode === 2){ //Hud-Vertical
        colCt = 1;
      }
      if (this.mode === 1){ //Hud-square
        colCt = 3;
      }
      //We don't want wider than 150px
      let ideal_width = fixedSize || Math.min(this.card_width, wwidth / colCt);
      
      console.log("Mode:",this.mode,colCt,this.maxWidth,wwidth);
      // >>>> Add code here, for splitting into rows
      

      //Assign card widths (heights should sort themselves out from css (height:fit-content), content is <img>)
      Array.from(cards).forEach((card) => {
        card.style.width = ideal_width + "px";
        if (card.tagName === "DIV"){//Height doesn't sort itself out, effing twilight
          card.style.height = this.game_mod.returnCardHeight(ideal_width) + "px";
        }
      });

      
      //Width to fit everything in one row
      let container_width = (ideal_width+20) * colCt + 40; //and account for the padding
      if (this.mode === 2) container_width += 20; //and likely scroll bar
      container_width = Math.min(container_width, wwidth); //Maximum of 
      container_width = Math.max(container_width, this.minWidth); //Minimum of 500px (change this constant)
      console.log("Width:",fixedSize,ideal_width,container_width);
      //Set Hud Width
      hud.style.width = container_width + "px";


      //Check for overflow of right of screen
      if (hud.style.left && parseInt(window.getComputedStyle(hud).right) < 0){
        console.log("Hud overflow");
        hud.style.left = "";
        hud.style.transform = "";
      }

      //Prep for Hud Height
      console.log(this.game_mod.returnCardHeight(ideal_width),this.calculateElementHeight(cards[0]));
      let cardHeight = fixedSize || Math.max(
        this.game_mod.returnCardHeight(ideal_width),
        this.calculateElementHeight(cards[0])
        ); // because images take a second to load, we have to guestimate the expected height
      
      let msgHeight = this.calculateElementHeight(
        document.querySelector(".status-header") || document.querySelector(".status-message")
      );
      console.log("Height:",cardHeight,msgHeight);
      if (this.mode ===1){
        this.resizeHudHeight(1.5*cardHeight + msgHeight + (fixedSize?20:0));
      }else{
        this.resizeHudHeight((cardHeight+5)*(cards.length/colCt)+msgHeight+15+(fixedSize?20:0));    
      }
      
      
    } catch (err) {
      console.error("ERR: " + err);
    }
  }

  /**
   * Internal function
   * Use the general contents of the status to guesstimate an ideal hud size 
   * based on their inherent css layout renderings
   * @param status - the .status element
   */ 
  resizeHudStatus(status) {
    console.log("*** RESIZING HUD FROM STATUS***");
    let hud =  document.getElementById("hud");
    let currentWidth = hud.getBoundingClientRect().width;
    let stHeight = 0;
    let maxWidth = 0;
    Array.from(status.children).forEach((kid) => {
      let kidHeight = this.calculateElementHeight(kid);
      console.log(kid,kidHeight);
      if (parseInt(window.getComputedStyle(kid).height)==0 && kid.querySelector("ul")){
        kidHeight += kid.querySelector("ul").children.length * 60;
      }
      
      stHeight += kidHeight;
      maxWidth = Math.max(maxWidth, kid.getBoundingClientRect().width);
    });
    console.log("Height:",stHeight,"Width:",maxWidth);
    hud.style.width = `${maxWidth+40}px`;
    this.resizeHudHeight(stHeight);
    console.log("done with resize Hud Height...");
  }

  /**
   * Resize the height of the HUD given the determine number of pixels and some hardcoded knowledge about HUD structure
   * HUD-LONG tries to preserve its Y-axis, unless that causes an overflow
   * If HUD grows beyond bottom of screen, HUD is repositioned inside the screen (hud-long)
   * If HUD height exceeds 85% screen height, resized to screen height (hud-vertical)
   */
  resizeHudHeight(definingHeight) {
    let hud = document.getElementById("hud");
    let headerHeight = this.calculateElementHeight(document.getElementById("hud-header"));

    //Don't overflow window height (45px margin to leave room for game Menu)
    let newHeight = Math.min(definingHeight + headerHeight, window.innerHeight - 45);

    //For HUD-long, we don't want to stay docked to the bottom (keep the status-header in the same place)
    let currentTop = Math.floor(hud.getBoundingClientRect().top);
    if (this.mode === 0 && !hud.style.top){
      hud.style.top = `${currentTop-1}px`;
      hud.style.bottom = "";
      console.log("Set Style:",hud.style.top,"Computed:",window.getComputedStyle(hud).top,"Bound:",currentTop);
    }
    
    //If vertical mode and very tall, go ahead and maximize
    if (this.mode === 2 && newHeight > 0.85 * window.innerHeight){
      newHeight = window.innerHeight - 45;
    }

    hud.style.height = `${newHeight}px`;
    
    //Check if the newly size hud overflows off the bottoom
    let hudRect = document.getElementById("hud").getBoundingClientRect(); //Have to refresh the object
    
    if (currentTop + newHeight > window.innerHeight || hudRect.bottom > window.innerHeight){
      console.log("Redocking to bottom:",currentTop,newHeight,hudRect.bottom,window.innerHeight);
      hud.style.top = "";
      hud.style.bottom = "0px";
    }


  }

  /**
   * An internal tool to calculate the height of an element (by manually adding the top and bottom margins)
   * @param elm - a DOM element
   */
  calculateElementHeight(elm) {
    if (!elm) {
      console.error("elm not found",elm);
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
