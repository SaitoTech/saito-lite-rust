const RedSquareChatBoxTemplate = require("./chatbox.template");

class RedSquareChatBox {

    constructor(app) {
        this.name = "RedSquareChatBox";
    }

    render(app, mod, container = "") {

        if (!document.querySelector(".redsquare-chatbox")) {
            app.browser.addElementToClass(RedSquareChatBoxTemplate(app, mod), container);
        }

    }

}

module.exports = RedSquareChatBox;


