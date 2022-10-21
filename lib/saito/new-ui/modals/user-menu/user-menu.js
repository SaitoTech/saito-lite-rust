const SaitoOverlay = require("../../saito-overlay/saito-overlay");
const userMenuTemplate = require("./user-menu.template");





class UserMenu {

    constructor(app, public_key) {
        this.app = app;
        this.public_key = public_key
        this.overlay = new SaitoOverlay(app);
        this.callbacks = {}
    }

    render(app) {
        if (!document.querySelector("#saito-user-menu")) {
            this.overlay.show(app, "", userMenuTemplate(app));
            let mods = app.modules.respondTo("user-menu");
            mods.forEach((mod, index, arrry) => {
                let item = mod.respondTo('user-menu');
                let id = `user_menu_item_${index}`
                this.callbacks[id] = item.callback
                this.addMenuItem(item, id);
            })
        }
        this.attachEvents(app)
    }


    attachEvents(app) {
        document.querySelectorAll('.user_menu_item').forEach(menu => {
            let id = menu.getAttribute("id");
            let callback = this.callbacks[id];
            menu.addEventListener('click', () => {
                callback(app, "", this.public_key);
                this.overlay.remove();
            })

        })
    }

    addMenuItem(item, id) {
        document.querySelector(".saito-modal-content").innerHTML += `
          <div id="${id}" class="user_menu_item saito-modal-option"><i class="${item.icon}"></i><div>${item.text}</div></div>
        `;
    }
}


module.exports = UserMenu;
