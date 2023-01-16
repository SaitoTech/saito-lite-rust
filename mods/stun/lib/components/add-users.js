const SaitoOverlay = require("../../../../lib/saito/ui/saito-overlay/saito-overlay");
const AddUsersTemplate = require("./add-users.template");


class AddUsers {
    constructor(app, mod, code) {
        this.app = app;
        this.mod = mod;
        this.saitoOverlay = new SaitoOverlay(app, mod)
    }

    render(code) {
        this.code = code
        this.saitoOverlay.show(AddUsersTemplate(this.app, this.mod, code))
        this.attachEvents()
    }

    attachEvents() {
        document.querySelector('.add-users-code-container .fa-copy').onclick = async (e) => {
            navigator.clipboard.writeText(this.code)
            salert("Link copied to clipboard")
        }
    }


}

module.exports = AddUsers