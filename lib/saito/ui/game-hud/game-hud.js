const GameHudTemplate = require("./game-hud.template");

const {
  DESKTOP,
  MOBILE_PORTRAIT,
  MOBILE_LANDSCAPE,
} = require("./game-hud-types");

/**
 * 
 */ 
class GameHud {
/**
 * 
 */ 
  constructor(app) {
    this.app = app;
    this.game_mod = null;

    this.status = "";
    this.initial_render = 0;
    this.auto_sizing = 1; //flag to automatically resize HUD based on its internal functions

    this.mode = 0;// 0 wide
                  // 1 classic (square)
                  // 2 vertical

    //this.use_cardbox = 1; //Always on, except in demo
    
    this.card_types = [];
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

        if (!document.querySelector(".hud")) {
          app.browser.addElementToDom(GameHudTemplate());
        }

        let hud = document.querySelector(".hud");
        hud.className = "hud";
        hud.removeAttribute("style");

        if (this.mode == 0) {
          hud.classList.add("hud-long");
        }
        if (this.mode == 1) {
          hud.classList.add("hud-square");
        }
        if (this.mode == 2) {
          hud.classList.add("hud-vertical");
        }


        if (this.auto_sizing){
          this.resizeHudHeight();
          this.resizeHudWidth();  
        }

        hud.style.display = "block";        
    }
  }

/**
 * 
 */ 
  attachEvents(app, game_mod) {
    try {
      let myself = this;

      //
      // "card" items become clickable / cardboxable
      //
      // this function is permanent refernce to changeable_callback
      //
      this.addCardType("card", "select", game_mod.cardbox_callback);

      //
      // hud is draggable
      //
      app.browser.makeDraggable("hud", "hud-header", function () {
        if (myself.auto_sizing){
          myself.resizeHudHeight();
        }
      });
    } catch (err) {}

    /* Not Implemented or used
    // hud popup / popdown
    //
    try {
      let hud_toggle_button = document.getElementById("hud-toggle-button");
      hud_toggle_button.onclick = (e) => {
        e.stopPropagation();
        switch (this.checkSizeAndOrientation()) {
          case DESKTOP:
            hud.classList.toggle("hud-hidden-vertical");
            hud_toggle_button.classList.toggle("fa-caret-up");
            hud_toggle_button.classList.toggle("fa-caret-down");
        }
      };
    } catch (err) {}
    */
  }

/**
 * 
 * 
 */


/**
 * 
 */ 
  hide() {
    try {
      document.getElementById("hud").style.display = "none";
    } catch (err) {}
  }


/**
 * 
 * 
  attachCardEvents(app, game_mod) {
    if (game_mod.browser_active == 0) {
      return;
    }

    //
    // cardbox events
    //
    if (this.use_cardbox == 1) {
      // cardbox needs to manage clicks
      game_mod.cardbox.hide();
      game_mod.cardbox.cardbox_lock = 0;
      game_mod.cardbox.attachCardEvents();
    } else {
      // we manage directly
      for (let i = 0; i < this.card_types.length; i++) {
        let card_css = this.card_types[i].css;
        let card_action = this.card_types[i].action;
        let card_callback = this.card_types[i].mycallback;
        Array.from(document.getElementsByClassName(card_css)).forEach(
          (card) => {
            card.onmouseover = (e) => {};
            card.onmouseout = (e) => {};
            card.onclick = (e) => {
              card_callback(e.currentTarget.id);
            };
          }
        );
      }
    }

    //
    // resize hud width if transparent/long mode
    //
    if (this.mode == 0 && this.auto_sizing) {
      this.resizeHudWidth();
    }
  }
*/

/**
 * 
 */ 
  resizeHudCards() {
    try {
      let cardObj =  document.querySelector(".cardimg-hud") || document.querySelector(".cardimg");
      let image_width = cardObj.width;
      let image_height = this.game_mod.returnCardHeight(image_width);

      document.querySelector(".status-cardbox").height = "unset";

      Array.from(document.querySelectorAll(".status-cardbox .card")).forEach(
        (card) => {
          card.style.height = image_height + "px";
          card.style.width = image_width + "px";
        }
      );
    } catch (err) {
      console.log("ERR: " + err);
    }
  }



/**
 * 
 */ 
  updateStatus(status_html) {
    console.log("Update Status through HUD");
     let status_obj = document.getElementById("status");    
     if (status_obj){
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
    if (this.auto_sizing){
      this.resizeHudWidth();
      this.resizeHudCards(); // cards before height as height is set from width
      this.resizeHudHeight();
    }    

  }




/**
 * 
 */ 
  toggleHud(hud, hud_toggle_button) {
    switch (this.checkSizeAndOrientation()) {
      case DESKTOP:
        hud.style.top = null;
        hud.style.left = null;
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
 * Internal functino to determines view window (Desktop, mobile landscape or mobile portrait)
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
 * 
 */ 
  addCardType(css_name, action_text, mycallback) {
    for (let i = 0; i < this.card_types.length; i++) {
      if (this.card_types[i].css === css_name) {
        return;
      }
    }
    this.card_types.push({
      css: css_name,
      action: action_text,
      mycallback: mycallback,
    });
    this.game_mod.cardbox.addCardType(css_name, action_text, mycallback);
  }

/**
 * 
 */ 
  resizeHudHeight() {
    try {
      let hud = document.getElementById("hud");
      let hud_header = document.getElementById("hud-header");
      let hud_body = document.getElementById("hud-body");

      let wheight = window.innerHeight;

      let hud_rect = hud.getBoundingClientRect();
      let hud_header_rect = hud_header.getBoundingClientRect();
      let hud_body_rect = hud_body.getBoundingClientRect();

      let hud_header_height = hud_header_rect.bottom - hud_header_rect.top;
      let hud_body_height = hud_body_rect.bottom - hud_body_rect.top;
      let hud_height = hud_rect.bottom - hud_rect.top;

      let hub_body_cutoff = hud_height - hud_header_height;

      try {
        // set the height of the hud_body based on the contents / cardbox
        if (
          document.querySelector(".hud-body .status") &&
          document.querySelector(".status-cardbox")
        ) {
          let status_box = document.querySelector(".hud-body .status");
          let status_box_rect = status_box.getBoundingClientRect();
          let status_box_height = status_box_rect.bottom - status_box_rect.top;

          hud_body.style.height = status_box_height + "px";
          hud_body.style.minHeight = status_box_height + "px";
          hud_body.style.maxHeight = status_box_height + "px";

          hud = document.getElementById("hud");
          hud_header = document.getElementById("hud-header");
          hud_body = document.getElementById("hud-body");

          hud_rect = hud.getBoundingClientRect();
          hud_body_rect = hud_body.getBoundingClientRect();
          hud_body_height = hud_body_rect.bottom - hud_body_rect.top;
          //hud_height = hud_rect.bottom - hud_rect.top;
          hud_height = status_box_height + hud_header_height;
        }
      } catch (err) {}

      let new_height = wheight - hud_body_rect.top;
      let max_height = hud_rect.bottom - hud_rect.top;

      if (new_height < max_height) {
        //hud_body.style.height = (hud_height - hud_header_height) + "px";
        //hud_body.style.minHeight = (hud_height - hud_header_height) + "px";
        //hud_body.style.maxHeight = (hud_height - hud_header_height) + "px";

        hud_body.style.height = hud_height + "px";
        hud_body.style.minHeight = hud_height + "px";
        hud_body.style.maxHeight = hud_height + "px";
      } else {
        hud_body.style.height = hud_height + "px";
        hud_body.style.minHeight = hud_height + "px";
        hud_body.style.maxHeight = hud_height + "px";
      }

      //
      // if hud_body and hud header are bigger than hud, shrink hud
      //
      let hudbh = parseInt(
        this.calculateElementHeight(document.getElementById("hud-body"))
      );
      let hudhh = parseInt(
        this.calculateElementHeight(document.getElementById("hud-header"))
      );
      let hudh = parseInt(
        this.calculateElementHeight(document.getElementById("hud"))
      );

      if (hudbh + hudhh > hudh) {
        let adj_hudbh = hudh - hudhh;
        hud_body.style.height = adj_hudbh + "px";
        hud_body.style.minHeight = adj_hudbh + "px";
        hud_body.style.maxHeight = adj_hudbh + "px";
      }
    } catch (err) {}
  }

/**
 * 
 */ 
  resizeHudWidth() {
    let hud = document.getElementById("hud");
    let status_cardbox = document.querySelector(".status-cardbox");
    let cards = document.querySelectorAll(".cardbox-hud");

    if (!cards) {
      return;
    }
    if (!cards[0]) {
      return;
    }

    //
    // check that cards are visible
    //
    // card-box should ideally take only 80% of the screen at max.
    //
    let wwidth = window.innerWidth;
    wwidth *= 0.8;

    let ideal_width = wwidth / cards.length;
    if (ideal_width > 220) {
      ideal_width = 220;
      // cardbox popups means we can go smaller
      //if (this.use_cardbox == 1) {
      //  ideal_width = 150;
      //}
    }

    Array.from(document.querySelectorAll(".status-cardbox .card")).forEach(
      (card) => {
        card.style.width = ideal_width + "px";
        card.style.height = this.game_mod.returnCardHeight(ideal_width) + "px";
      }
    );

    let card_width = Math.floor(cards[0].getBoundingClientRect().width * 1.1);

    if (status_cardbox) {
      let cards_visible = status_cardbox.childElementCount;
      let new_width = card_width * cards_visible;
      // status has 5 pixel padding
      if (new_width < 510) {
        new_width = 510;
      }
      hud.style.width = new_width + "px";
      //hud.style.minWidth = new_width + "px";
      //hud.style.maxWidth = new_width + "px";
    }
  }

/**
 * 
 */ 
  calculateElementHeight(elm) {
    if (document.all) {
      // IE
      elmHeight = elm.currentStyle.height;
      elmMargin =
        parseInt(elm.currentStyle.marginTop, 10) +
        parseInt(elm.currentStyle.marginBottom, 10);
    } else {
      // Mozilla
      elmHeight = document.defaultView
        .getComputedStyle(elm, "")
        .getPropertyValue("height");
      elmMargin =
        parseInt(
          document.defaultView
            .getComputedStyle(elm, "")
            .getPropertyValue("margin-top")
        ) +
        parseInt(
          document.defaultView
            .getComputedStyle(elm, "")
            .getPropertyValue("margin-bottom")
        );
    }
    return parseInt(elmHeight) + parseInt(elmMargin) + "px";
  }
}

module.exports = GameHud;
