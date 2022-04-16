const GameCardfanTemplate = require("./game-cardfan.template");

/**
 * GameCardFan is a tool for displaying a hand of cards, fanned out so all the cards are overlapping but visible
 * The main utility is in the css for fanning the cards out in a visually pleasing layout, which can also be accessed by just using the "cardfan" class in the container of "card"-classed items
 * cardFan is included by default in gameTemplate and is accessible through .cardfan in the inheriting game module
 * cardFan should only be rendered when needed and only one card fan can exist on the screen at a time.
 * The Game module should provide detailed html for the cards to be displayed in the fan, otherwise by default render
 * makes strong assumptions about the data structure of your game module
 *
 */
class GameCardfan {
  /**
   * @constructor stores a reference to the Saito app
   * @param app - the Saito application
   */
  constructor(app) {
    this.app = app;
  }

  /**
   * Adds a cardfan div to the DOM if it does not already exist and populates it with the
   * provided card html. If no card html is provided, card fan queries the hand in deck one
   * and creates an html template assuming card images are in the directory specified in mod.card_img_dir
   * and appropriately named (when creating the deck)
   */
  render(app, mod, cards_html = "") {
    try {
      if (!document.getElementById("cardfan")) {
        document.body.append(app.browser.htmlToElement(GameCardfanTemplate()));
      }

      if (cards_html === "") {
        let { cards, hand } = mod.game.deck[0];
        let cards_in_hand = hand.map((key) => cards[key]);
        cards_html = cards_in_hand
          .map((card) => `<img class="card" src="${mod.card_img_dir}/${card.name}">`)
          .join("");
      }
      if (!cards_html) {
        console.log("Error? Card Fan can't find player hand");
      }

      document.getElementById("cardfan").innerHTML = cards_html;
      document.getElementById("cardfan").style.display = "block";
    } catch (err) {}
  }

  /**
   * Makes the cardFan draggable
   * @param app - the Saito application
   * @param mod - the game module
   * Neither parameter is actually used
   */
  attachEvents(app, mod) {
    try {
      app.browser.makeDraggable("cardfan");
    } catch (err) {
      console.error(err);
    }
  }

  //** Show the card fan */
  show() {
    try {
      document.getElementById("cardfan").style.display = "block";
    } catch (err) {}
  }

  //** Hide the card fan */
  hide() {
    try {
      document.getElementById("cardfan").style.display = "none";
    } catch (err) {}
  }

  /**
   * Sets a class name for the cardFan to facilitate customization of display
   * @param classname {string} - the class name
   */
  addClass(classname) {
    try {
      if (!document.getElementById("cardfan").classList.contains(classname)){
        document.getElementById("cardfan").classList.add(classname);  
      }
    } catch (err) {}
  }

  /**
   * Removes a class name for the cardFan to facilitate customization of display
   * @param classname {string} - the class name
   */
  removeClass(classname) {
    try {
      if (document.getElementById("cardfan").classList.contains(classname)){
        document.getElementById("cardfan").classList.remove(classname);  
      }
    } catch (err) {}
  }


  /**
   * Inserts the html for a single card into the start of the fan (left side)
   * @param app - the Saito application
   * @param mod - the game module
   * @param cards_html - html specification of the card to be addedf
   */
  prependCard(app, mod, cards_html = "") {
    if (cards_html !== "") {
      const fan = document.getElementById("cardfan");
      if (fan) {
        fan.innerHTML = cards_html + fan.innerHTML;
      }
    }
  }

  /**
   * Inserts the html for a single card into the end of the fan (right side)
   * @param app - the Saito application
   * @param mod - the game module
   * @param cards_html - html specification of the card to be addedf
   */
  addCard(app, mod, cards_html = "") {
    if (cards_html !== "") {
      const fan = document.getElementById("cardfan");
      if (fan) {
        fan.innerHTML += cards_html;
      }
    }
  }
}

module.exports = GameCardfan;
