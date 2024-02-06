const ChatSidebarTemplate = require('./chat-sidebar.template');

class ChatSidebar {
	constructor(app, mod, container = '.saito-sidebar.right') {
		this.app = app;
		this.mod = mod;
		this.container = container;

    app.connection.on('chat-popup-render-request', (group = null) => {
      if (!group) {
        group = this.mod.returnCommunityChat();
      }

      if (group) {
        this.render(group);
      }
    });
	}

	render(chat = null) {
    if (document.getElementById("chat-sidebar")){
      this.app.browser.replaceElementById(ChatSidebarTemplate(this.app, this.mod, chat), "chat-sidebar");
    }else{
      this.app.browser.addElementToSelector(ChatSidebarTemplate(this.app, this.mod, chat), this.container);
    }

    this.attachEvents(chat);
  }

  attachEvents(chat) {

  }
}
 
module.exports = ChatSidebar;
