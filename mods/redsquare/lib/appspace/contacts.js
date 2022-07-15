const RedSquareAppspaceContactsTemplate = require("./contacts.template");

class RedSquareAppspaceContacts {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.name = "RedSquareAppspaceContacts";
  }

  render(app, mod, selector = "") {

    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToSelector(RedSquareAppspaceContactsTemplate(app, mod), ".appspace");

  }

}

module.exports = RedSquareAppspaceContacts;

