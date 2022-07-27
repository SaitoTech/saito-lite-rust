const VideoCallAppspaceTemplate = require('./main.template.js');

class VideoCallAppspace {


    render(app, mod) {

        if (!document.querySelector(".videocall-appspace")) {
            app.browser.addElementToSelector(VideoCallAppspaceTemplate(app, mod), ".appspace");
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
                let video_mod = app.modules.returnModule("VideoCall");
                console.log(video_mod);
                video_mod.createVideoInvite();
            }
            if (e.target.id === "joinInvite") {
                let video_mod = app.modules.returnModule("VideoCall");
                const inviteCode = document.querySelector("#inviteCode").value;
                video_mod.joinVideoInvite(inviteCode.trim());
            }
        })
    }

}


module.exports = VideoCallAppspace;


