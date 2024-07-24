const ModTemplate = require('./../../lib/templates/modtemplate');
const PeerService = require('saito-js/lib/peer_service').default;
const YoutubeInitStream = require("./lib/yt-client-init-stream");

class YoutubeClient extends ModTemplate {
	constructor(app) {
		super(app);

		this.app = app;
		this.slug = 'youtube-client';
		this.name = 'youtube-client';
		this.description = 'UI for connecting to youtube stream';
		this.categories = 'Utilities Communications';
		this.class = 'utility';
		this.publickey = '';
		this.styles = ['/youtube-client/style.css', '/saito/saito.css'];

		this.stream_key = '';
		this.stream_status = false;
		this.ws = null;
		this.mediaRecorder = null;
		this.icon_id = '';

		this.app.connection.on('saito-yt-start-stream', (obj = {}) => {
			this.stream_key = obj.stream_key;
			this.startStream();
			this.toggleStreamStatus();
		});

		return this;
	}

	initialize(app) {
		super.initialize(app);
		if (this.browser_active) {
			this.styles = ['/youtube-client/style.css', '/saito/saito.css'];
		}
		if (this.app.BROWSER == 0) {
		}
	}


	respondTo(type = "", obj) {
	    let this_self = this;
	    if (type === "dream-controls") {
	    	let x = [];
	    	console.log('inside youtube-client respondTo ////');
			x.push({
				text: `Youtube Stream`,
				icon: "fa-brands fa-youtube", 
				callback: function (app, id) {
					this_self.icon_id = `dream_controls_menu_item_${id}`;
					console.log("icon id //////////////", this_self.icon_id);

					if (this_self.stream_status == false) {
						let init = new YoutubeInitStream(this_self.app, this_self.mod);
						init.render();
					} else {
						this_self.toggleStreamStatus();
					}

					 
				} // callback

			}); // x

			return x;
	    } // type = dream-controls
	} // respondTo


	startStream(){
		let this_self = this;
		const localVideo = document.getElementById("local");
		navigator.mediaDevices.getUserMedia({video: true}).then(stream => {
		
			localVideo.srcObject = stream;
			const ws_url = window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
		        (window.location.hostname+':3000') +
		        '/rtmp/' +
		        encodeURIComponent(`rtmp://b.rtmp.youtube.com/live2/${this_self.stream_key}`);
			 console.log('url:', ws_url);

		    this_self.ws = new WebSocket(ws_url,"echo-protocol");

		    let mediaStream;
			this_self.ws.addEventListener('open', (e) => {
				console.log('WebSocket Open', e);
				mediaStream = localVideo.captureStream(30); // 30 FPS
				this_self.mediaRecorder = new MediaRecorder(mediaStream, {
				  mimeType: 'video/webm;codecs=h264',
				  videoBitsPerSecond : 3 * 1024 * 1024
				});

				this_self.mediaRecorder.addEventListener('dataavailable', (e) => {
					console.log('dataavailable',e.data);
				  this_self.ws.send(e.data);
				});

				this_self.mediaRecorder.addEventListener('stop', this_self.ws.close.bind(this_self.ws));

				this_self.mediaRecorder.start(1000); // Start recording, and dump data every second
			});

			this_self.ws.addEventListener('close', (e) => {
				console.log('WebSocket Close', e);
				this_self.mediaRecorder.stop();
			});


		}).catch(error => {
		    console.error("Failed to get user media", error);
		}); // navigator
	}

	toggleStreamStatus() {
		let this_self = this;
		this.stream_status = !this.stream_status;
		document.getElementById(this_self.icon_id).classList.toggle('yt-active');

		if (this.stream_status == false) {
			console.log('stopping stream');
			siteMessage("Youtube live stream stopped", 2000);
			this.mediaRecorder.stop();
		}
	}

	async render() {
		if (!this.browser_active) {
			return;
		}
		let this_mod = this;
	}

}

module.exports = YoutubeClient;
