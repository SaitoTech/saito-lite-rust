const AppspaceContactsTemplate = require("./contacts.template");

class AppspaceContacts {

  constructor(app, mod, container = "") {
    this.app = app;
    this.mod = mod;
    this.container = container;
    this.name = "RedSquareAppspaceContacts";
  }

  render() {

console.log("RENDERING CONTACTS!");

    //
    // replace element or insert into page
    //
    if (document.querySelector(".redsquare-contacts")) {
      this.app.browser.replaceElementBySelector(AppspaceContactsTemplate(), ".redsquare-contacts");
    } else {
      if (this.container) {
        this.app.browser.addElementToSelector(AppspaceContactsTemplate(), this.container);
      } else {
        this.app.browser.addElementToDom(AppspaceContactsTemplate());
      }
    }

    this.attachEvents();
  }  

  attachEvents() {

  }

}

module.exports = AppspaceContacts;



