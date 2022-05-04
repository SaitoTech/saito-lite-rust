const ChatSidebar = require('./chat-sidebar');
const ChatBox = require('./chat-box');

module.exports = EmailChat = {

    render(app, mod) {

      mod.renderMode = "email";

      /*
      For some reason, while in a game, EmailChat gets rendered and we don't want to render the sidebar, 
      which will attach itself to document.body and screw up the rendering
      To-Do: understand how/why we come to this point in the middle of a game
      */
      if (document.querySelector(".email-chat")){
        ChatSidebar.render(app, mod);
        ChatSidebar.attachEvents(app, mod);
      }
      
      ChatBox.render(app, mod);
      ChatBox.attachEvents(app, mod);

    },

    attachEvents(app, mod) {
    },

    showChatBox(app, mod, group) {
      mod.renderMode = "email";
      ChatBox.showChatBox(app, mod, group);
    }

}
