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
		this.combined_stream = null;

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
				callback: function (app, id, combined_stream) {
					this_self.icon_id = `dream_controls_menu_item_${id}`;
					console.log("icon id //////////////", this_self.icon_id);

					this_self.combined_stream = combined_stream;

					console.log('combined_stream ///', combined_stream)


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
		
		let mediaStream = this.getStreamData();
		console.log("mediaStream:", mediaStream);

		if (mediaStream == false) {
			salert("Error while fetching mediaStream");
		}

		const ws_url = window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
	        (window.location.hostname) + this.getPort() +
	        '/rtmp/' +
	        encodeURIComponent(`rtmp://b.rtmp.youtube.com/live2/${this_self.stream_key}`);
		 console.log('url:', ws_url);

	    this_self.ws = new WebSocket(ws_url,"echo-protocol");
		this_self.ws.addEventListener('open', (e) => {
			console.log('WebSocket Open', e);
			this_self.mediaRecorder = new MediaRecorder(mediaStream, {
			  mimeType: 'video/webm;codecs=h264',
			  videoBitsPerSecond : 3 * 1024 * 1024
			});

			this_self.mediaRecorder.addEventListener('dataavailable', (e) => {
				//console.log('dataavailable',e.data);
				this_self.ws.send(e.data);
			});

			this_self.mediaRecorder.addEventListener('stop', (e) => {
				this_self.ws.close(1000);
			});

			this_self.mediaRecorder.start(1000); // Start recording, and dump data every second
		});

		this_self.ws.addEventListener('close', (e) => {
			console.log('WebSocket Close', e);
			this_self.mediaRecorder.stop(1000);
		});
	}

	toggleStreamStatus() {
		let this_self = this;
		this.stream_status = !this.stream_status;
		document.getElementById(this_self.icon_id).classList.toggle('yt-active');

		if (this.stream_status == false) {
			console.log('stopping stream');
			siteMessage("Youtube live stream stopped", 2000);
			this.mediaRecorder.stop(1000);
		}
	}

	async render() {
		if (!this.browser_active) {
			return;
		}
		let this_mod = this;
	}


	getStreamData() {
		let mods = this.app.modules.mods;
		console.log("mods:", mods);
		for (let i = 0; i < mods.length; i++) {
			console.log("mod:", mods[i]);
			if (typeof mods[i].slug != "undefined") {
				if (mods[i].slug == "limbo") {
					let limbo = mods[i];
					console.log('limbo mod: ', limbo);
					return limbo.combinedStream;
				}
			}
		}

		return false;
	}

	getPort() {
		// 44344 - test, prod
		// 3000 - local dev
		let port = ':44344';
		let host = this.app.browser.host;
		if (host.includes('127.0.0.1') || host.includes('localhost')) {
			port = ':3000';
		}
		return port;
	}

}

module.exports = YoutubeClient;
