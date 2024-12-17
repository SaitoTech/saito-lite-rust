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
		this.stream_type = 'main';
		this.stream_url = {
			'main': "rtmp://a.rtmp.youtube.com/live2",
			'backup': "rtmp://b.rtmp.youtube.com/live2?backup=1"
		};
		this.stream_status = false;
		this.ws = null;
		this.mediaRecorder = null;
		this.icon_id = '';
		this.combined_stream = null;

		this.app.connection.on('saito-yt-start-stream', async (obj = {}) => {
			this.stream_key = obj.stream_key;
			//this.stream_type = obj.stream_type;
			document.addEventListener('visibilitychange', this.visibilityChange.bind(this));
			await this.startStream();
			this.startStreamStatus();
		});

		this.app.connection.on('saito-yt-stop-stream', (obj = {}) => {
			if (this.stream_status == true) {
				this.stopStreamStatus();
			}
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
			x.push({
				text: `Youtube Stream`,
				icon: "fa-brands fa-youtube",
				callback: function (app, id, combined_stream) {
					this_self.icon_id = `dream_controls_menu_item_${id}`;
					this_self.combined_stream = combined_stream;
					console.log('combined_stream ///', combined_stream)
					if (this_self.stream_status == false) {
						let init = new YoutubeInitStream(this_self.app, this_self.mod);
						init.render();
					} else {
						this_self.stopStreamStatus();
					}


				} // callback

			}); // x

			return x;
		} // type = dream-controls
	} // respondTo


	async startStream() {
		let this_self = this;

		let mediaStream = await this.getStreamData();
		console.log("mediaStream:", mediaStream);

		if (mediaStream == false) {
			siteMessage("Error while fetching mediaStream", 2000);
		}

		const ws_url = window.location.protocol.replace('http', 'ws') + '//' + // http: -> ws:, https: -> wss:
			(window.location.hostname) + this.getPort() +
			'/encoder?url=' +
			encodeURIComponent(`${this.stream_url[this.stream_type]}/${this_self.stream_key}`);
		console.log('url:', ws_url);

		this_self.ws = new WebSocket(ws_url, "echo-protocol");
		this_self.ws.addEventListener('open', (e) => {
			console.log('WebSocket Open', e);
			this_self.mediaRecorder = new MediaRecorder(mediaStream, {
				mimeType: this_self.getMIME(),
				videoBitsPerSecond: 1.5 * 1024 * 1024
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

	startStreamStatus() {
		if (document.getElementById(this.icon_id)) {
			document.getElementById(this.icon_id).classList.add('yt-active');
		}
		siteMessage("Youtube live stream started", 2000);
		this.stream_status = true;
	}

	stopStreamStatus() {
		if (document.getElementById(this.icon_id)) {
			document.getElementById(this.icon_id).classList.remove('yt-active');
		}
		this.stream_status = false;
		siteMessage("Youtube live stream stopped", 2000);
		this.mediaRecorder.stop(1000);
	}

	async render() {
		if (!this.browser_active) {
			return;
		}
		let this_mod = this;
	}

	async getStreamData() {
		let mods = this.app.modules.mods;
		for (let i = 0; i < mods.length; i++) {
			if (typeof mods[i].slug != "undefined") {
				if (mods[i].slug == "swarmcast") {
					let limbo = mods[i];
					console.log('limbo mod: ', limbo);

					if (limbo.combinedStream == null) {
						let options = {
							identifier: "Swarmcast",
							description: limbo.description
						}
						console.log("options:", options);
						await limbo.getStream(options);

						console.log('limbo mod after: ', limbo);
					}

					return limbo.combinedStream;
				}
			}
		}



		return false;
	}

	getPort() {
		// 44344 - test, prod
		// 3000 - local dev
		let port = '';
		let protocol = this.app.browser.protocol;

		console.log('protocol:', protocol);
		if (protocol == 'http:') {
			port = `:${this.app.browser.port}`;
		}

		console.log('port:', port);
		return port;
	}

	getMIME() {
		let mime = 'video/webm;codecs=h264';
		const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

		if (isFirefox) {
			let supported = this.getAllSupportedMimeTypes();
			console.log('supported mimes: ', supported);
			for (let i = 0; i < supported.length; i++) {
				if (supported[i] == 'video/webm;codecs="vp8.0, opus"') {
					mime = supported[i];
					break;
				}
			}
		}

		console.log('mime:', mime);
		return mime;
	}

	getAllSupportedMimeTypes(...mediaTypes) {
		if (!mediaTypes.length) mediaTypes.push('video', 'audio')
		const CONTAINERS = ['webm', 'ogg', 'mp3', 'mp4', 'x-matroska', '3gpp', '3gpp2', '3gp2', 'quicktime', 'mpeg', 'aac', 'flac', 'x-flac', 'wave', 'wav', 'x-wav', 'x-pn-wav', 'not-supported']
		const CODECS = ['vp9', 'vp9.0', 'vp8', 'vp8.0', 'avc1', 'av1', 'h265', 'h.265', 'h264', 'h.264', 'opus', 'vorbis', 'pcm', 'aac', 'mpeg', 'mp4a', 'rtx', 'red', 'ulpfec', 'g722', 'pcmu', 'pcma', 'cn', 'telephone-event', 'not-supported']

		return [...new Set(
			CONTAINERS.flatMap(ext =>
				mediaTypes.flatMap(mediaType => [
					`${mediaType}/${ext}`,
				]),
			),
		), ...new Set(
			CONTAINERS.flatMap(ext =>
				CODECS.flatMap(codec =>
					mediaTypes.flatMap(mediaType => [
						// NOTE: 'codecs:' will always be true (false positive)
						`${mediaType}/${ext};codecs=${codec}`,
					]),
				),
			),
		), ...new Set(
			CONTAINERS.flatMap(ext =>
				CODECS.flatMap(codec1 =>
					CODECS.flatMap(codec2 =>
						mediaTypes.flatMap(mediaType => [
							`${mediaType}/${ext};codecs="${codec1}, ${codec2}"`,
						]),
					),
				),
			),
		)].filter(variation => MediaRecorder.isTypeSupported(variation))
	}
	visibilityChange() {
		salert("You navigated away from this tab. To ensure the best streaming experience, please keep this tab in focus")
	}
}

module.exports = YoutubeClient;
