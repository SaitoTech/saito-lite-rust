const RedSquareFriendsTemplate = require("./friends.template");
const RedSquareFriendBoxTemplate = require("./friendbox.template");

class RedSquareFriends {

  constructor(app, mod = null, selector = "") {
    this.app = app;
    this.name = "RedSquareFriends";
  }

  render(app, mod) {

    app.browser.addElementToSelector(RedSquareFriendsTemplate(app, mod), ".appspace");

  }

}

module.exports = RedSquareFriends;

