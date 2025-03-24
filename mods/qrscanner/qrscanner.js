const ModTemplate = require('../../lib/templates/modtemplate');
const UserMenu = require('./../../lib/saito/ui/modals/user-menu/user-menu');

const HeaderDropdownTemplate = (dropdownmods) => {
	html = dropdownmods.map((mod) => {
		if (mod.returnLink() != null) {
			return `<a href="${mod.returnLink()}"><li>${mod.name}</li></a>`;
		}
	});
	return `
  <div id="modules-dropdown" class="header-dropdown">
    <ul>${html}</ul>
  </div>`;
};

class QRScanner extends ModTemplate {
	constructor(app) {
		super(app);

		this.name = 'QRScanner';
		this.slug = 'qrscanner';
		this.description = 'Adds QRCode scanning functionality to Saito';
		this.categories = 'Core';
		this.video = null;
		this.canvas = null;
		this.canvas_context = null;
		this.isStreamInit = false;

		this.styles = ['/qrscanner/style.css'];
		this.scanner_callback = null;

		this.description = 'Helper module with QR code scanning functionality.';
		this.categories = 'Dev Data Utilities';
		this.class = 'utility';
		this.constraints = {
			audio: false,
			video: {
				facingMode: 'environment'
			}
		};

		// quirc wasm version
		this.decoder = null;
		this.last_scanned_raw = null;
		this.last_scanned_at = null;

		// In milliseconds
		this.debounce_timeout = 750;

		this.events = ['encrypt-key-exchange-confirm'];

		//
		// and scan when asked
		//
		this.app.connection.on('scanner-start-scanner', (callback = null) => {
			this.startScanner(callback);
		});
	}

	initialize(app) {
		super.initialize(app);
		if (app.BROWSER == 1) {
			this.attachStyleSheets();
		}
	}

	respondTo(type = '') {
		let qr_self = this;
		if (type === 'saito-header') {
			return [
				{
					text: 'Scan',
					icon: 'fas fa-expand',
					rank: 110,
					callback: function (app, id) {
						app.connection.emit('scanner-start-scanner', {});
					}
				}
			];
		}

		return super.respondTo(type);
	}

	attachEvents(app) {
		let scanner_self = this;
		document
			.querySelector('.launch-scanner')
			.addEventListener('click', function (e) {
				scanner_self.startScanner();
			});
	}

	startQRDecoderInitializationLoop() {
		x = this.attemptQRDecode();

		if (x == 1) {
		} else {
			setTimeout(() => {
				this.startQRDecoderInitializationLoop();
			}, 100);
		}
	}

	//
	// turns BODY into the scanner
	//
	startScanner(mycallback = null) {
		if (this.app.BROWSER == 0) {
			return;
		}
		if (!document) {
			return;
		}
		if (document.querySelector('.qrscanner-container')) {
			return;
		}

		if (mycallback != null) {
			this.scanner_callback = mycallback;
		}

		this.app.browser.addElementToDom(this.returnScannerHTML());
		//document.body.innerHTML = this.returnScannerHTML();
		document.querySelector('.close-scanner').onclick = () => {
			document.querySelector('.qrscanner-container').remove();
			this.stop();
		};

		let scanner_self = this;
		scanner_self.start(
			document.getElementById('qr-video'),
			document.getElementById('qr-canvas')
		);
	}

	//
	// turns submitted EL into the scanner
	//
	startEmbeddedScanner(el, mycallback = null) {
		if (this.app.BROWSER == 0) {
			return;
		}
		if (!document) {
			return;
		}
		if (document.querySelector('.qrscanner-container')) {
			return;
		}

		if (mycallback != null) {
			this.scanner_callback = mycallback;
		}

		el.innerHTML = this.returnScannerHTML();
		document.querySelector('.close-scanner').onclick = () => {
			reloadWindow(300);
		};

		let scanner_self = this;

		scanner_self.start(
			document.getElementById('qr-video'),
			document.getElementById('qr-canvas')
		);
	}

	returnScannerHTML() {
		return `
      <div class="qrscanner-container">
        <div id="qr-target" class="qr-target"><div class="corners"></div></div>
        <div id="scanline" class="scanline"></div>
        <div id="close-scanner" class="close-scanner"><i class="fa-solid fa-xmark"></i></div>
        <div class="qr-video-container">
          <video playsinline autoplay id="qr-video" class="qr-video"></video>
        </div>
        <canvas style="display: none" id="qr-canvas"></canvas>
      </div>

    `;
	}

	async start(video, canvas) {
		this.video = video;
		this.canvas = canvas;

		this.canvas_context = this.canvas.getContext('2d');
		this.decoder = new Worker('/qrscanner/quirc_worker.js');
		this.decoder.onmessage = (msg) => {
			this.onDecoderMessage(msg);
		};

		try {
			let stream = await navigator.mediaDevices.getUserMedia(
				this.constraints
			);
			this.handleSuccess(stream);
		} catch (err) {
			this.handleError(err);
		}

		this.startQRDecoderInitializationLoop();
	}

	stop() {
		this.decoder.terminate();
		if (this.video) {
			this.video.srcObject.getTracks().forEach((track) => track.stop());
		}
		if (document.querySelector('.qrscanner-container')) {
			document.querySelector('.qrscanner-container').remove();
		}
	}

	render() {}

	//
	// main loop sending messages to quirc_worker to detect qrcodes on the page
	//
	attemptQRDecode() {
		if (this.isStreamInit) {
			try {
				this.canvas.width = this.video.videoWidth;
				this.canvas.height = this.video.videoHeight;
				this.canvas_context.drawImage(
					this.video,
					0,
					0,
					this.canvas.width,
					this.canvas.height
				);
				if (this.canvas.width == 0) return;

				var imgData = this.canvas_context.getImageData(
					0,
					0,
					this.canvas.width,
					this.canvas.height
				);

				if (imgData.data) {
					this.decoder.postMessage(imgData);
				}
				return 1;
			} catch (err) {
				return 0;
			}
		} else {
			return 0;
		}
		return 0;
	}

	//
	// worker passes back a message either containing decoded data,
	// or it attempts t
	//
	onDecoderMessage(msg) {
		if (msg.data != 'done') {
			var qrid = msg.data['payload_string'];
			let right_now = Date.now();
			if (
				qrid != this.last_scanned_raw ||
				this.last_scanned_at < right_now - this.debounce_timeout
			) {
				this.last_scanned_raw = qrid;
				this.last_scanned_at = right_now;
				this.handleDecodedMessage(qrid);
				return;
			} else if (qrid === this.last_scanned_raw) {
				this.last_scanned_at = right_now;
			}
		}
		setTimeout(() => {
			this.attemptQRDecode();
		}, 0);
	}

	//
	// The default behavior of just a publickey is to created initiate a keyexchange.
	// Else, the message is broadcast for other modules to utilize
	//
	handleDecodedMessage(msg) {
		//
		// remove scanline
		//
		if (document.querySelector('.scanline')) {
			document.querySelector('.scanline').remove();
		}

		//
		// we know what we want to do (callback provided)
		//
		if (this.scanner_callback != null) {
			this.stop();
			this.scanner_callback(msg);
			return;
		}

		//
		// or this is a URL
		//
		if (this.app.browser.isValidUrl(msg)) {
			this.stop();
			let c = confirm('Visit: ' + msg + '?');
			if (c) {
				navigateWindow(msg);
				return;
			}
		}

		//
		// or this is a publickey
		//
		if (this.app.wallet.isValidPublicKey(msg)) {
			this.stop();
			let userMenu = new UserMenu(this.app, msg);
			userMenu.render(this.app);
			return;
		}

		//
		// non-SAITO publickey?
		//
		if (!msg.match(/\s/gi)) {
			if (msg.match(/[0-9a-zA-Z]+/i)) {
				this.stop();

				let obj = {};
				obj.address = msg;
				this.app.connection.emit(
					'saito-crypto-withdraw-render-request',
					obj
				);

				return;
			}
		}

		this.sendEvent('qrcode', msg);
	}

	decodeFromFile(f) {
		var reader = new FileReader();
		reader.onload = ((file) => {
			return (e) => {
				this.canvas_context.clearRect(
					0,
					0,
					this.canvas.width,
					this.canvas.height
				);
				// port to new quirc system
			};
		})(f);
		reader.readAsDataURL(f);
	}

	handleSuccess(stream) {
		window.stream = stream;
		this.video.srcObject = stream;
		this.isStreamInit = true;
	}

	handleError(error) {
		//console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
	}
}

module.exports = QRScanner;
