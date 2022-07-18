const RedSquareAppspaceContactsTemplate = require("./contacts.template");
const ModalAddContact = require("./../../../../lib/saito/new-ui/modals/add-contact/add-contact");

class RedSquareAppspaceContacts {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.name = "RedSquareAppspaceContacts";
  }

  render(app, mod, selector = "") {
    document.querySelector(".appspace").innerHTML = "";
    app.browser.addElementToSelector(RedSquareAppspaceContactsTemplate(app, mod), ".appspace");
    this.attachEvents(app, mod);
  }

  attachEvents(app, mod) {

    //
    // "add contact"
    //
    document.getElementById("redsquare-add-contact").onclick = (e) => {
console.log("A");
      let add_user_modal = new ModalAddContact(app, mod);
console.log("B");
      add_user_modal.render(app, mod);
console.log("C");
    }

  }

}

module.exports = RedSquareAppspaceContacts;

