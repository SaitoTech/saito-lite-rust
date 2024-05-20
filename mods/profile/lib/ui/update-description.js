const UpdateDescriptionTemplate = require('./update-description.template');
const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay');
const SaitoLoader = require('../../../../lib/saito/ui/saito-loader/saito-loader');

class UpdateDescription {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.overlay = new SaitoOverlay(this.app, this.mod);
        this.loader = new SaitoLoader(
            this.app,
            this.mod,
            '.saito-overlay-form'
        );
        this.callback = null;
    }

    render(description) {
        this.overlay.show(UpdateDescriptionTemplate(description));
        this.attachEvents();
    }

    attachEvents() {
        document.querySelector('.saito-overlay-form-input').select();


        document.querySelector('.saito-overlay-form-submit').onclick = (e) => {
            e.preventDefault();
            console.log(e)
            var description = document.querySelector(
                '.saito-overlay-form-input'
            ).value;

            console.log(description, this.mod)
            this.mod.sendProfileTransaction({ description })
            this.overlay.remove()


        };
    }
}

module.exports = UpdateDescription;
