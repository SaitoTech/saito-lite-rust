const GameHudTemplate = require("./game-hud.template");

const { DESKTOP, MOBILE_PORTRAIT, MOBILE_LANDSCAPE } = require("./game-hud-types");

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
    this.maxWidth = 0.5; //this.mode associated variable, ratio of view width for maximum display
    this.card_width = 150; //Maximum card width of 150px
    this.minWidth = 500; //num of pixels for minimum display width (dependent on this.mode) overwrite AFTER rendering
    this.auto_sizing = 1; //flag to automatically resize HUD based on its internal functions
    this.enable_mode_change = 0; //flag to allow users to toggle between hud-long, hud-square and hud-vertical
    this.draggable = 1;
    this.mode = 0; // 0 wide (HUD-long)
    // 1 classic (HUD-square)
    // 2 vertical
    this.lastPosition = ""; //Remember where the hud was if toggling to hide offscreen
    this.respectDocking = true;

    //
    // variables used to keep status centered in hud
    // as the hud resizes when cards change. we calculate
    // new widths and use older data to inch HUD along so
    // the status stays centered in place as the HUD is 
    // redrawn.
    //
    this.cached_status_header_height_inclusive = -1;
    this.cards_currently_displayed = -1;
    this.user_dragged = 0;
    this.status_left = -1;
    this.status_top = -1;
    this.status_width = -1;
    this.hud_left = -1;
    this.hud_top = -1;
    this.hud_width = -1;

    this.debugging = false;
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
        app.browser.addElementToDom(GameHudTemplate(this.enable_mode_change));
      }

      let hud = document.querySelector("#hud");
      
      if (this.mode >= 0 && this.mode <= 2){
        hud.className = "hud"; //Remove additional class names
        hud.removeAttribute("style"); //Remove all inline styling  
      }
      
      switch (this.mode) {
        case 0:
          hud.classList.add("hud-long");
          this.maxWidth = 0.8;
          this.minWidth = 500;
          hud.style.top = "";
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
        default:
          console.error("Undefined HUD Mode");
          this.auto_sizing = false;
      }

      if (this.auto_sizing) {
        this.respectDocking = true;
        this.resizeHud();
        this.respectDocking = false;
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
    if (this.draggable){
      try {
        // hud is draggable
        app.browser.makeDraggable("hud", "hud-header",()=>{
	  this.user_dragged = 1;

	  try {

  	    let hud = document.querySelector(".hud");
	    let status = document.querySelector(".status-header");

            this.status_left = hud.style.left;
            this.status_top = hud.style.top;
            this.status_width = hud.style.width;

            this.hud_left = hud.style.left;
            this.hud_top = hud.style.top;
            this.hud_width = hud.offsetWidth;

	  } catch (err) {}

          document.querySelector(".hud").classList.add("user_dragged");
        });
      } catch (err) {
        console.error("HUD Events:", err);
      }
    }
    // hud is minimizable
    try {
      let hud_toggle_button = document.getElementById("hud-toggle-button");
      if (hud_toggle_button) {
        hud_toggle_button.onclick = (e) => {
          e.stopPropagation();
          myself.toggleHud();
        };
      }
    } catch (err) {
      console.error("HUD Events:", err);
    }

    //cycle through hud modes
    try {
      let hud_mode_button = document.getElementById("hud-mode-button");
      if (hud_mode_button) {
        hud_mode_button.onclick = (e) => {
          e.stopPropagation();
          myself.mode++;
          if (myself.mode > 2) {
            myself.mode = 0;
          }
          myself.render(app, game_mod);
        };
      }
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
   * Inserts provided HTML into the HUD and restores it from minimized position
   * HUD includes css to nicely display a brief text message in a <div class="status-header"></div>
   * followed by additional more flexible html content
   * @param status_html - the html you want displayed
   */
  updateStatus(status_html) {

    //if no html tags, wrap in a default div
    if (!status_html.match(/<[^<]+>/)){
      status_html = `<div class="status-message">${status_html}</div>`;
    }

    if (this.debugging) console.log("Update Status through HUD",status_html);

    let status_obj = document.getElementById("status");
    let hud_obj = document.getElementById("hud");
    hud_obj.style.display = "none";

    if (status_obj) {
      // hide to prevent sliding around
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
    if (this.auto_sizing) {
      this.resizeHud();
    }

    // show again, we good now
    hud_obj.style.display = "block";

    //Programmatically change toggle to make HUD pop up
    let hudToggle = document.getElementById("hud-toggle-button");
    if (hudToggle) {
      if (hudToggle.classList.contains("fa-caret-up")) {
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
    if (this.debugging) console.log("HUD detects ", deviceType);
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
    if (window.matchMedia("(orientation: landscape)").matches && window.innerHeight <= 700) {
      return MOBILE_LANDSCAPE;
    }
    if (window.matchMedia("(orientation: portrait)").matches && window.innerWidth <= 600) {
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
    if (this.debugging) console.log(`*** RESIZING HUD *** MODE ${this.mode} ***`);
    if (this.debugging) console.log("*** Original DOM statistics: ");
    if (this.debugging) console.log(JSON.parse(JSON.stringify(document.querySelector(".hud").getBoundingClientRect())));
    
    let hud = document.getElementById("hud");
    let hudbox =
      document.querySelector(".status-cardbox") || document.querySelector(".status-icon-menu");
    let status = document.querySelector(".hud .status");

    try {
    if (hudbox) {
      if (document.querySelector(".hud-card")) { //Traditional cards
        this.resizeHudCards(hudbox.children);
      } else { //Fixed with graphical menu items
        this.resizeHudCards(
          hudbox.children,
          hudbox.firstElementChild.getBoundingClientRect().width
        );
      }

    } else { 
      if (status) { //Use size of <div class="status">
        this.resizeHudStatus(status);

      } else {
        //console.log("Resetting to default HUD size");
        //Clear inline styling
        hud.style.width = "";
        hud.style.height = "";
      }
    }

      if (this.debugging) 
        window.setTimeout(() =>{
          console.log("*** New DOM statistics: ");
          console.log(JSON.parse(JSON.stringify(document.querySelector(".hud").getBoundingClientRect())))
        }, 
        350);
    } catch (err) {
      console.error("ERR: " + err);
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
    if (this.debugging) console.log("*** RESIZING HUD FROM CARDS***", "fixedSize: " + fixedSize);
    
    let hud = document.getElementById("hud");
    let status = document.querySelector(".status-header");
    let wwidth = this.maxWidth * window.innerWidth; //Each HUD type determines maximum HUD width

    //Prioritize our minimum width over maximum width for card calculations
    if (window.innerWidth > this.minWidth) {
      wwidth = Math.max(wwidth, this.minWidth);
    }

    let colCt = cards.length;

    //We don't want wider than maximum card width (default 150px)
    let ideal_width = fixedSize || Math.min(this.card_width, (wwidth - 20) / colCt);

    if (this.mode === 2) {
      //Hud-Vertical
      colCt = 1;
    }
    if (this.mode === 1) {
      //Hud-square
      colCt = 3;
    }

    if (this.debugging) console.log("this.card_width: " + this.card_width,"ideal width is: " + ideal_width);

    
    // If cards are small (less than 100px wide), try splitting hand into two rows
    if (ideal_width < 100 && colCt > 3) {
      colCt = Math.ceil(colCt / 2);
      ideal_width = Math.min(this.card_width, (wwidth - 20) / colCt);
      if (this.debugging) console.log("Resizing cards based on multiple rows, new ideal width:" + ideal_width);
    }


    //Assign card widths (heights should sort themselves out from css (height:fit-content), content is <img>)
    Array.from(cards).forEach((card) => {
      card.style.width = ideal_width + "px";
      //Height doesn't sort itself out, so have to estimate height based on predetermined height/width rations
      if (card.tagName === "DIV") {
        card.style.height = this.game_mod.returnCardHeight(ideal_width) + "px";
      }
    });


    //
    // if number cards on display has not changed, no need for resize
    //
    if (cards.length !== this.cards_currently_displayed) {

      this.cards_currently_displayed = cards.length;

      //Width to fit everything in one row
      let container_width = (ideal_width + 5) * colCt; //add a little horizontal padding around each card
      container_width += this.mode === 0 ? 10 : 20; //and extra space for a likely scroll bar in vertical or square mode
      //console.log(`Width: ${ideal_width}x${colCt} = ${container_width} (${this.minWidth},${wwidth})`);
      container_width = Math.min(container_width, wwidth); //Maximum of ideal container width or maximum HUD width
      container_width = Math.max(container_width, this.minWidth); //Each HUD type has a minimum HUD width

      //
      // if the HUD has been dragged, it won't auto-center properly, so we need to 
      // bump the left-position of the HUD so that the status box remains centered
      // in the position to which the user has dragged it, as they are dragging the
      // status rather than the hud.
      //
      if (this.user_dragged == 1) {
   	    if (this.hud_width < container_width) {
	        let width_difference = (container_width - this.hud_width) / 2;
	        if (width_difference >= 1) {
	          hud.style.left = (parseInt(hud.style.left) - parseInt(width_difference)) + "px";
	        }
	      } else {
	        let width_difference = (this.hud_width - container_width) / 2;
	        if (width_difference >= 1) {
	          hud.style.left = (parseInt(hud.style.left) + parseInt(width_difference)) + "px";
	        }
	      }
      }

      //Set Hud Width
      hud.style.width = container_width + "px";

      try {
        this.status_left = status.style.left;
        this.status_top = status.style.top
        this.status_width = status.style.width;
      } catch (err) {}

      this.hud_left = hud.style.left;
      this.hud_top = hud.style.top;
      this.hud_width = container_width;

console.log("status left: " + this.status_left);
console.log("status top: " + this.status_top);
console.log("status width: " + this.status_width);
console.log("hud left: " + this.hud_left);
console.log("hud top: " + this.hud_top);
console.log("hud width: " + this.hud_width);


    } // END WIDTH UPDATE

console.log("resize HUD height");

    //Prep for Hud Height
    if (this.debugging) console.log(this.game_mod.returnCardHeight(ideal_width),  this.calculateElementHeight(cards[0]));
    // because images take a second to load, we have to guestimate the expected height
    let cardHeight = /*fixedSize ||*/ Math.max(this.game_mod.returnCardHeight(ideal_width), this.calculateElementHeight(cards[0])); 


    let msgHeight = null;

    if (this.cached_status_header_height_inclusive != -1) {
      console.log("SKIP STATUS HEADER HEIGHT CALC 3");
      msgHeight = this.cached_status_header_height_inclusive;
    }
    if (document.querySelector(".status-message") && msgHeight == null) {
      console.log("STATUS HEADER MESSAGE CALC");
      msgHeight = this.calculateElementHeight(document.querySelector(".status-message"));
      console.log(msgHeight);
    }
    if (document.querySelector(".status-header") && msgHeight == null) { 
      console.log("STATUS HEADER HEIGHT CALC 2");
      msgHeight = this.calculateElementHeight(document.querySelector(".status-header")); 
      console.log(msgHeight);
    }

    if (this.debugging) console.log(`Card Height: ${cardHeight}, Message Height:${msgHeight}`);

    switch (this.mode) {
      case 0:
        this.resizeHudHeight(cardHeight + msgHeight + 20 + (fixedSize ? 20 : 0));
        break;
      case 1:
        this.resizeHudHeight(1.5 * cardHeight + msgHeight + (fixedSize ? 20 : 0));
        break;
      case 2:
        this.resizeHudHeight((cardHeight + 5) * cards.length + msgHeight + 10 + (fixedSize ? 20 : 0));
        break;
    }


  }

  /**
   * Internal function
   * Use the general contents of the status to guesstimate an ideal hud size
   * based on their inherent css layout renderings
   * @param status - the .status element
   */
  resizeHudStatus(status) {

    console.log("*** RESIZING HUD FROM STATUS ***");
//
// do we need to resize the status? disabled temporarily while we figure
// out the hud resize / rescale issues that are making the UI pop around.
//
/****
    if (this.cards_currently_displayed != -1) {
    let hud = document.getElementById("hud");
    let currentWidth = hud.getBoundingClientRect().width;
    let stHeight = 0;
    let maxWidth = 0;
    Array.from(status.children).forEach((kid) => {
      let kidHeight = this.calculateElementHeight(kid);
      kid.style.maxWidth = "unset";
      if (this.debugging) {
        console.log("---Analyzing: ",kid, `Height: ${kidHeight}, Width: ${kid.getBoundingClientRect().width}`);
      }
      if (kid.querySelector("ul")) {
        if (this.debugging) console.log(`Found list of ${kid.querySelector("ul").children.length} items`);
        if (this.debugging) console.log(`${window.getComputedStyle(kid).height}`);
        if (parseInt(window.getComputedStyle(kid).height) < 60){
          kidHeight += Math.min(kid.querySelector("ul").children.length,4) * 60;
        }
      }

      stHeight += kidHeight;
      maxWidth = Math.max(maxWidth, kid.getBoundingClientRect().width);
      kid.style.maxWidth = "";
    });

    maxWidth += 10; //account for (possible) HUD padding
    if (this.debugging) console.log("Height:", stHeight, "Width:", maxWidth);

    hud.style.width = `${maxWidth}px`;
    this.resizeHudHeight(stHeight);
    }
****/
  }

  /**
   * Resize the height of the HUD given the determine number of pixels and some hardcoded knowledge about HUD structure
   * HUD-LONG tries to preserve its Y-axis, unless that causes an overflow
   * If HUD grows beyond bottom of screen, HUD is repositioned inside the screen (hud-long)
   * If HUD height exceeds 85% screen height, resized to screen height (hud-vertical)
   */
  resizeHudHeight(definingHeight) {
/****
    let hud = document.getElementById("hud");
    let headerHeight = this.calculateElementHeight(document.getElementById("hud-header"));

    //Don't overflow window height (45px margin to leave room for game Menu)
    let newHeight = Math.min(definingHeight + headerHeight, window.innerHeight - 45);
    if (this.debugging) console.log(`Hud height (orig): ${window.getComputedStyle(hud).height} New Hud Height: ${newHeight}`);
  
    //For HUD-long, we don't want to stay docked to the bottom (keep the status-header in the same place)
    let currentTop = Math.floor(hud.getBoundingClientRect().top);
console.log("currenttop is: " + currentTop);
    if (!this.respectDocking && this.mode === 0 && !hud.style.top) {
      hud.style.top = `${currentTop - 1}px`;
      hud.style.bottom = "";
      if (this.debugging) console.log(`Set Style: ${hud.style.top} Computed: ${window.getComputedStyle(hud).top} Bound: ${currentTop}`);
    }

    //If vertical mode and very tall, go ahead and maximize
    if (this.mode === 2 && newHeight > 0.85 * window.innerHeight) {
      newHeight = window.innerHeight - 45;
    }

    hud.style.height = `${newHeight}px`;

    //Check if the newly size hud overflows off the bottoom
    let hudRect = document.getElementById("hud").getBoundingClientRect(); //Have to refresh the object

    if (currentTop + newHeight > window.innerHeight || hudRect.bottom > window.innerHeight) {
      if (this.debugging) console.log("Redocking to bottom:", currentTop, newHeight,  hudRect.bottom, window.innerHeight);
      hud.style.top = "";
      hud.style.bottom = "0px";
    }
****/
  }

  /**
   * An internal tool to calculate the height of an element (by manually adding the top and bottom margins)
   * @param elm - a DOM element
   */
  calculateElementHeight(elm) {
    if (!elm) {
      console.error("elm not found", elm);
      return 0;
    }
    let elmHeight = 0;
    let elmMargin = 0;

   //Check if the newly size hud overflows off the bottoom
    let elmRect = elm.getBoundingClientRect(); //Have to refresh the object
console.log("elmRect: " + JSON.stringify(elmRect));


    if (document.all) {
      // IE
      elmHeight = elm.currentStyle.height;
      elmMargin =
        parseInt(elm.currentStyle.marginTop, 10) + parseInt(elm.currentStyle.marginBottom, 10);

console.log("a1: " + elmHeight);
console.log("a2: " + elmMargin);

    } else {
      // Mozilla
      let view = document.defaultView.getComputedStyle(elm);

      elmHeight = parseInt(view.height);
      if (isNaN(elmHeight)) { elmHeight = parseInt(elm.offsetHeight); }
      if (isNaN(elmHeight)) { elmHeight = 0; }
      elmMargin = parseInt(view["margin-top"]) + parseInt(view["margin-bottom"]);
      if (isNaN(elmMargin)) { elmMargin = 0; }

console.log("offsetHeight: " + elm.offsetHeight);
console.log("a1-2: " + elmHeight);
console.log("a2-2: " + elmMargin);

      if (this.cached_status_header_height_inclusive == -1 && elmHeight != 0 && elmMargin != 0) { this.cached_status_header_height_inclusive = (elmHeight + elmMargin); }


    }
    return parseInt(elmHeight) + parseInt(elmMargin);
  }
}

module.exports = GameHud;
