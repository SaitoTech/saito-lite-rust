const RedSquareFriendsTemplate = require("./friends.template");
const RedSquareFriendBoxTemplate = require("./friendbox.template");

class RedSquareFriends {

  constructor(app) {
    this.app = app;
    this.name = "RedSquareFriends";
  }

  render(app, mod) {

    app.browser.addElementToClass(RedSquareFriendsTemplate(app, mod), ".appspace");

    //for (let i = 0; i < app.keys.keys.length; i++) {
    //  app.browser.addElementToClass(RedSquareFriendBoxTemplate(app, mod, i), ".saito-friendlist");
    //}


  }

}

module.exports = RedSquareFriends;

