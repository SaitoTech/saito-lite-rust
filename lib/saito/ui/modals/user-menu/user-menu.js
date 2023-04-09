const SaitoOverlay = require("../../saito-overlay/saito-overlay");
const userMenuTemplate = require("./user-menu.template");

class UserMenu {

    constructor(app, publickey) {
        this.app = app;
        this.publickey = publickey;
        this.overlay = new SaitoOverlay(app, null, true, true);
        this.callbacks = {}
    }

    render(app) {

	let thisobj = this;
        if (!document.querySelector("#saito-user-menu")) {
            this.overlay.show(userMenuTemplate());
            let mods = app.modules.respondTo("user-menu");
            let index = 0;
            mods.forEach((mod) => {
                let item = mod.respondTo('user-menu');
                if (item instanceof Array){
                    item.forEach(j => {
                        let id = `user_menu_item_${index}`;
                        thisobj.callbacks[id] = j.callback;
                        thisobj.addMenuItem(j, id);
                        index++;
                    })
                } else {
                    let id = `user_menu_item_${index}`;
                    thisobj.callbacks[id] = item.callback;
                    thisobj.addMenuItem(item, id);
                }
                index++;
            })

    
	    if (app.wallet.returnPreferredCryptoTicker() !== "SAITO") {
              let id = `user_menu_item_${index}`;
	      let ticker = app.wallet.returnPreferredCryptoTicker();
	      thisobj.callbacks[id] = function (app, publickey) {
		alert("Send 3rd Party Crypto");
	      };
	      thisobj.addMenuItem({ icon : "fas fa-money-check-dollar", text : `Send ${ticker}`}, id);
              index++;
	    } else {
              let id = `user_menu_item_${index}`;
	      thisobj.callbacks[id] = function (app, publickey) {
		alert("Send Saito Crypto");
	      };
	      thisobj.addMenuItem({ icon : "fas fa-money-check-dollar", text : "Send SAITO"}, id);
              index++;
	    }

        }

        this.attachEvents(app)
    }


    attachEvents(app) {
	let thisobj = this;
	let pk = this.publickey;
        document.querySelectorAll('.saito-modal-menu-option').forEach(menu => {
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
          <div id="${id}" class="saito-modal-menu-option"><i class="${item.icon}"></i><div>${item.text}</div></div>
        `;
    }
}


module.exports = UserMenu;
