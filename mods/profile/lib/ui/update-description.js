const UpdateDescriptionTemplate = require('./update-description.template');
const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader');

class UpdateDescription {
    constructor(app, mod, key = null) {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(this.app, this.mod);
        this.loader = new SaitoLoader(
            this.app,
            this.mod,
            '.saito-overlay-form'
        );
        this.key = key;
    }

    render(description) {
        this.overlay.show(UpdateDescriptionTemplate(description));
        this.attachEvents();
    }

    attachEvents() {

        const inputBox = document.getElementById('saito-overlay-form-input');

        inputBox.select();

        document.querySelector('.saito-overlay-form-submit').onclick = (e) => {
            e.preventDefault();

            var description = inputBox.innerText || inputBox.value;

            this.mod.sendProfileTransaction({ description }, this.key);
            this.overlay.remove()

        };
    }
}

module.exports = UpdateDescription;
