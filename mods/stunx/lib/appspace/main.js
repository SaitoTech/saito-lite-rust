const StunxAppspaceTemplate = require('./main.template.js');

class StunxAppspace {



    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
    }

    render(app, mod) {
        if (!document.querySelector(".stunx-appspace")) {
            app.browser.addElementToSelector(StunxAppspaceTemplate(app, mod), ".appspace");
        }
        this.attachEvents(app, mod);
    }

    attachEvents(app, mod) {
        document.body.addEventListener('click', (e) => {
            if (e.target.id === "add-to-listeners-btn") {
                let input = document.querySelector('#listeners-input').value.split(',');
                const listeners = input.map(listener => listener.trim());
                let stun_mod = app.modules.returnModule("Stun");
                stun_mod.addListeners(listeners);
            }

            if (e.target.id === "createInvite") {
                let stunx_mod = app.modules.returnModule("Stunx");
                stunx_mod.createVideoInvite();
            }
            if (e.target.id === "joinInvite") {
                const inviteCode = document.querySelector("#inviteCode").value;
                this.joinVideoInvite(inviteCode.trim());
            }
        })
    }


    joinVideoInvite(roomCode) {
        if (!roomCode) return siteMessageNew("Please insert a room code", 5000);
        let sql = `SELECT * FROM rooms WHERE room_code = "${roomCode}"`;
        let room = null;
        const stunx_mod = this.app.modules.returnModule('Stunx');

        stunx_mod.sendPeerDatabaseRequestWithFilter('Stunx', sql, async (res) => {
            console.log('call back');
            console.log(res);
        })


    }

}


module.exports = StunxAppspace;


