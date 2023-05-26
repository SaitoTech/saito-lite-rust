const SaitoProfileTemplate = require('./saito-profile.template');

class SaitoProfile {

    constructor(app, mod, container="") {
        this.app = app;
        this.mod = mod;
        this.container = container;
        this.publickey = null;

        this.app.connection.on("saito-profile-render-request", (publickey = "") => {
            this.publickey = publickey;
            this.render();
        });
    }

    render() {
        document.querySelector(this.container).innerHTML =  SaitoProfileTemplate(this.app, this.mod, this);
        

        this.attachEvents();
    }

    attachEvents(){

    }
}

module.exports = SaitoProfile;
