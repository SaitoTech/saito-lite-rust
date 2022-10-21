const RedSquareAppspaceContactsTemplate = require("./contacts.template");
const ModalAddContact = require("./../../../../lib/saito/new-ui/modals/add-contact/add-contact");

class RedSquareAppspaceContacts {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.name = "RedSquareAppspaceContacts";
    this.add_user_modal = new ModalAddContact(app, mod);
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
      this.add_user_modal.render(app, mod);
    }

  }

  showAddModalContact(app, mod) {
    this.add_user_modal.render(app, mod);
  }

}

module.exports = RedSquareAppspaceContacts;

