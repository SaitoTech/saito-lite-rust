const ChatPopupTemplate = require("./popup.template");

class ChatPopup {

  constructor(app, mod, group_id="") {
    this.app = app;
    this.name = "ChatPopup";
    this.group_id = group_id;
  }

  render(app, mod, group_id="") {

    if (!document.getElementById(`chat-container-${group_id}`)) {
      app.browser.addElementToDom(ChatPopupTemplate(app, mod, group_id));
    }


    // close
    document.querySelector(`#chat-container-close-${group_id}`).onclick = (e) => {
      let obj = document.getElementById(`chat-container-${group_id}`).remove(); 
    }

//    app.connection.on("chat-render-request", (message) => {
//    listen for chat re-render requests affecting this popup
//    app.connection.on("chat-render-request", (message) => {
//        console.log('inside chat popup listener');
//    });

  }

}

module.exports = ChatPopup;

