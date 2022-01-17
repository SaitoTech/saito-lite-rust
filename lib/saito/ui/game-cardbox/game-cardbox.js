const GameCardboxTemplate = require("./game-cardbox.template");

/**
 * cardBox facilitates games that involve cards with detailed text instructions and associated actions
 * by storing the associations between css-class references to the cards and callback functions associated with clicking on them
 * Most importantly, cardbox allows users to mouse hover over a css element and view a large popup version of the card
 *
 */
class GameCardbox {
  /**
   * Creates a cardBox
   *
   */
  constructor(app) {
    this.app = app;
    this.game_mod = null;

    this.cardbox_lock = 0; // 1 = mouseover does not remove popup
    this.skip_card_prompt = 0; // 1 = don't prompt for action, just execute
    this.card_types = []; // associative array of css / text / callback
  }

  /**
   * Adds cardbox to the DOM if it doesn't already exist (div elements start in display=none state)
   * @param app - the Saito Application
   * @param mod - the game module using cardbox
   */
  render(app, mod) {
    this.game_mod = mod;

    if (!document.getElementById("game-cardbox")) {
      app.browser.addElementToDom(GameCardboxTemplate());
      document.getElementById("game-cardbox").style.zIndex = -10; //push behind
    }
  }

  /**
   * Doesnt' do anything
   * @param app - the Saito Application
   * @param mod - the game module using cardbox
   */
  attachEvents(app, mod) {}

  /**
   * Only called through a HUD function of the same name
   * Cycles through property card_types (stored by method this.addCardType)
   * to associate mouse hover and click behavior on different css classes in the DOM
   */
  attachCardEvents() {
    try {
      for (let i = 0; i < this.card_types.length; i++) {
        let card_css = this.card_types[i].css;
        let card_action = this.card_types[i].action;
        let card_callback = this.card_types[i].mycallback;

        Array.from(document.getElementsByClassName(card_css)).forEach(
          (card) => {
            card.onmouseover = (e) => {
              try {
                if (this.cardbox_lock !== 1) {
                  this.showCardbox(e.currentTarget.id);
                }
              } catch (err) {}
            };
            card.onmouseout = (e) => {
              try {
                //Should we test cardbox_lock condition here??
                this.hide();
              } catch (err) {}
            };
            card.onclick = (e) => {
              this.cardbox_lock = 1;
              try {
                if (card_action != "" && card_callback != null) {
                  this.showCardbox(
                    e.currentTarget.id,
                    card_action,
                    card_callback
                  );
                } else {
                  this.showCardbox(e.currentTarget.id);
                }
              } catch (err) {}
            };
          }
        );
      }

      //
      // force-close card popup
      //
      let cardbox_exit_btn = document.getElementById("cardbox-exit");
      cardbox_exit_btn.onclick = (e) => {
        this.hide(1);
      };
    } catch (err) {}
  }

  /**
   * Displays the card's html in the DOM
   * @param card - the DOM element that triggered the cardbox
   * @param html - an html representation of the card image
   * @param action {text} - if provided, gives users a button to click on to execute action of the card
   * @param mycallback - if provided, is the function that executes the action of the card, passes "card" (DOM element) as a parameter
   */
  showCardboxHTML(card, html, action = "", mycallback = null) {
    // "Play" the card automatically (run callback) if there is no html to display
    if (
      !html ||
      html.indexOf("noncard") > -1 ||
      html.indexOf("nocard") > -1
    ) {
      if (mycallback != null) {
        mycallback(card);
        this.hide(1);
      }
      return;
    }

    document.getElementById("cardbox-card").innerHTML = html;
   
    // hide cardbox AFTER callback so cards available in game callback
    if (this.skip_card_prompt == 1 && mycallback != null) {
      mycallback(card);
      this.hide(1);
      return;
    }

    //Create a single option menu for users to click to confirm playing "action"
    if (action != "") {
      this.cardbox_lock = 1;
      document.getElementById("cardbox-menu").style.display = "block";
      document.getElementById("cardbox-menu").innerHTML = action;
      document.getElementById("cardbox-menu").onclick = (e) => {
        if (mycallback != null) {
          mycallback(card);
        }
        this.hide(1);
      };
    }

    //If we locked the display (on), include the exit button to close
    if (this.cardbox_lock == 1) {
      document.getElementById("cardbox-exit").style.display = "block";
      document.getElementById("cardbox-exit-background").style.display =
        "block";
    }

    //Make everything else visible and overlay it on top of anything else happening on the screen
    document.getElementById("game-cardbox").style.zIndex = 250;
    document.getElementById("game-cardbox").style.display = "block";
    document.getElementById("cardbox-card").style.display = "block";
  }


  /**
   * Will query the game module for an image of the given card 
   * and render it in the DOM. Will store the card in cardbox array of cards
   * @param card {DOM element} 
   * @param action {text}
   * @param mycallback - an optional callback function
   */
  showCardbox(card, action = "", mycallback = null) {
    if (card == "undefined" || card == "") {
      return;
    }

    this.showCardboxHTML(
      card,
      this.game_mod.returnCardImage(card),
      action,
      mycallback
    );
  }

  /**
   * Hides the cardbox if it is not locked or if a force signal is sent
   * @param force {int 0,1} - will force the cardbox to close/hide even if it is in lock condition
   */
  hide(force = 0) {
    try {
      if (this.cardbox_lock === 1 && force === 0) {
        return;
      }
      document.getElementById("game-cardbox").style.display = "none";
      document.getElementById("cardbox-card").style.display = "none";
      document.getElementById("cardbox-menu").style.display = "none";
      document.getElementById("cardbox-exit").style.display = "none";
      document.getElementById("cardbox-exit-background").style.display = "none";
      this.cardbox_lock = 0;
      document.getElementById("game-cardbox").style.zIndex = -10;
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * A "card" is a triplicate of a css class name, a textual description of an action associated with the card, and a callback functon to be called if the card is selected
   * This function adds a triplicate to the class method so that subsequent calls to attachCardEvents
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
  }
}

module.exports = GameCardbox;
