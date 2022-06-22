const RedSquareMenuTemplate = require("./menu.template");

class RedSquareMenu {

  constructor(app) {
    this.name = "RedSquareMenu";
  }

  render(app, mod, class_container="") {

    if (!document.querySelector(".redsquare-component-menu")) {
      if (class_container !== "") {
console.log("class container is: " + class_container);
        let container = document.querySelector(class_container);
        if (container) { 
	  app.browser.addElementToElement(RedSquareMenuTemplate(app, mod), container);
	} else {
          app.browser.addElementToDom(RedSquareMenuTemplate(app, mod));
	}
      } else {
        app.browser.addElementToDom(RedSquareMenuTemplate(app, mod));
      }
    }

  }

}

module.exports = RedSquareMenu;


