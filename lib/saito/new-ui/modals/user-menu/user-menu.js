const SaitoOverlay = require("../../saito-overlay/saito-overlay");
const userMenuTemplate = require("./user-menu.template");

class UserMenu {

    constructor(app, publickey) {
        this.app = app;
        this.publickey = publickey;
        this.overlay = new SaitoOverlay(app);
        this.callbacks = {}
    }

    render(app) {
	let thisobj = this;
        if (!document.querySelector("#saito-user-menu")) {
            this.overlay.show(app, "", userMenuTemplate(app));
            let mods = app.modules.respondTo("user-menu");
            mods.forEach((mod, index, arrry) => {
                let item = mod.respondTo('user-menu');
                let id = `user_menu_item_${index}`;
                thisobj.callbacks[id] = item.callback;
                thisobj.addMenuItem(item, id);
            })
        }
        this.attachEvents(app)
    }


    attachEvents(app) {
	let thisobj = this;
	let pk = this.publickey;
        document.querySelectorAll('.user_menu_item').forEach(menu => {
            let id = menu.getAttribute("id");
            let callback = thisobj.callbacks[id];
            menu.addEventListener('click', () => {
                callback(app, pk);
                thisobj.overlay.remove();
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
