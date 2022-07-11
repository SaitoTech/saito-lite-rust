const RedSquareChatBoxTemplate = require("./chatbox.template");

class RedSquareChatBox {

    constructor(app) {
        this.name = "RedSquareChatBox";
    }

    render(app, mod, container = "") {

        if (!document.querySelector(".redsquare-chatbox")) {
            app.browser.addElementToClass(RedSquareChatBoxTemplate(app, mod), container);
            this.attachEvents();
        }



    }

    attachEvents() {
        if (document.querySelector('.redsquare-chat-start')) {

            document.querySelectorAll('.saito-chat-list').forEach(item => {
                item.onclick = (e) => {
		    alert("clicked to create!");

                    let chatContainer = document.querySelector(".chat-container");

                    chatContainer.classList.contains('hide-chat') ? chatContainer.classList.remove('hide-chat') : chatContainer.classList.add('hide-chat');
                }
            })

            // Done this way because "sidebar left" renders before "saito-main" in redsquare.js
            document.body.addEventListener('click', (item) => {
                console.log(item.target.id)
                if (item.target.id == 'chat-container-close') {
                    let chatContainer = document.querySelector(".chat-container");
                    chatContainer.classList.add('hide-chat');
                }


            })
        }
    }

}

module.exports = RedSquareChatBox;

