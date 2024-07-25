const YoutubeInitStreamTemplate = require("./yt-client-init-stream.template");
const SaitoOverlay = require('./../../../lib/saito/ui/saito-overlay/saito-overlay');

class YoutubeInitStream{
	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod, false);
	}

	render() {
		this.overlay.show(YoutubeInitStreamTemplate(this.app, this.mod));	
		this.attachEvents();
	}

	attachEvents(){
		let this_self = this;
		if (document.getElementById("yt-stream-btn")){
			document.getElementById("yt-stream-btn").onclick = (e) => {
				let stream_key = document.getElementById("yt-stream-identifier")?.value;
				
				if (stream_key != "") {
					this_self.app.connection.emit("saito-yt-start-stream", {stream_key: stream_key});
					this_self.overlay.close();
				} else {
					salert("Please provide a valid stream key");
				}
			}
		}
	}


}

module.exports = YoutubeInitStream;
