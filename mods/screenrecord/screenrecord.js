


const ModTemplate = require('../../lib/templates/modtemplate');
const VideoBox = require('../../lib/saito/ui/saito-videobox/video-box');
const html2canvas = require('html2canvas')
const domtoimage = require('dom-to-image');


class Record extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'screenrecord';
		this.description = 'Recording Module';
		this.categories = 'Utilities Communications';
		this.class = 'utility';
		this.record_video = false;

		this.styles = ['/saito/saito.css', '/screenrecord/style.css'];
		this.interval = null;
		this.streamData = [];

	}

	respondTo(type, obj) {
		if (type === 'record-actions') {
			this.attachStyleSheets();
			super.render(this.app, this);
			let is_recording = false;
			if (this.mediaRecorder) {
				is_recording = true
			}

			return [
				{
					text: 'Record',
					icon: `fas fa-record-vinyl record-icon ${this.mediaRecorder ? "recording" : ""}`,
					hook: "record-actioner",
					callback: async function (app) {
						let { container, streams, useMicrophone, callbackAfterRecord, members } = obj;

						if (container) {
							if (!this.mediaRecorder) {
								await this.startRecording(container, members, callbackAfterRecord, 'videocall');
							} else {
								this.stopRecording();
							}
						}
					}.bind(this)
				}
			];
		}

		if (type === 'limbo-record') {
			this.attachStyleSheets();
			super.render(this.app, this);
			let is_recording = false;
			if (this.mediaRecorder) {
				is_recording = true
			}

			return [
				{
					startRecording: () => {
						this.startRecording(".video-container-large")
					}
				}
			];
		}
		if (type === 'game-menu') {
			if (!obj.recordOptions) return;
			let menu = {
				id: 'game-game',
				text: 'Game',
				submenus: [],
			};

			menu.submenus.push({
				parent: 'game-game',
				text: "Record game",
				id: 'record-stream',
				class: 'record-stream',
				callback: async function (app, game_mod) {
					let recordButton = document.getElementById('record-stream');
					let { container, callbackAfterRecord } = game_mod.recordOptions;
					if (!this.mediaRecorder) {
						await this.startRecording(container, game_mod.players, callbackAfterRecord, "game");
						recordButton.textContent = "Stop recording";
					} else {
						// this.mediaRecorder.stop();
						this.stopRecording()
					}
				}.bind(this)
			});

			return menu;
		}

	}


	async handlePeerTransaction(app, tx = null, peer, mycallback) {
		if (tx == null) {
			return;
		}
		let message = tx.returnMessage();

		if (message.module === 'screenrecord') {
		if (this.app.BROWSER === 1) {
			if (this.hasSeenTransaction(tx)) return;
			if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
				if (message.request === "start recording") {
					siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
					this.updateUIForRecordingStart()
				}
				if (message.request === "stop recording") {
					siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
					this.updateUIForRecordingStop()
				}
			}
		}
	}
	}


	onConfirmation(blk, tx, conf) {
		
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();
		console.log(message.module, 'screenrecord')
		if (conf === 0) {

			if (message.module === 'screenrecord') {
				console.log('received information')
				if (this.app.BROWSER === 1) {
					if (this.hasSeenTransaction(tx)) return;

					if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
						if (message.request === "start recording") {
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
							this.updateUIForRecordingStart()
						}
						if (message.request === "stop recording") {
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
							this.updateUIForRecordingStop()
						}


						// this.toggleNotification();
					}

				}
			}
		}
	}


	drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {


		if (arguments.length === 2) {
			x = y = 0;
			w = ctx.canvas.width;
			h = ctx.canvas.height;
		}

		offsetX = typeof offsetX === "number" ? offsetX : 0.5;
		offsetY = typeof offsetY === "number" ? offsetY : 0.5;

		if (offsetX < 0) offsetX = 0;
		if (offsetY < 0) offsetY = 0;
		if (offsetX > 1) offsetX = 1;
		if (offsetY > 1) offsetY = 1;

		let iw = img.videoWidth || img.width,
			ih = img.videoHeight || img.height,
			r = Math.min(w / iw, h / ih),
			nw = iw * r,
			nh = ih * r,
			cx, cy, cw, ch, ar = 1;

		if (nw < w) ar = w / nw;
		if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
		nw *= ar;
		nh *= ar;

		cw = iw / (nw / w);
		ch = ih / (nh / h);

		cx = (iw - cw) * offsetX;
		cy = (ih - ch) * offsetY;

		if (cx < 0) cx = 0;
		if (cy < 0) cy = 0;
		if (cw > iw) cw = iw;
		if (ch > ih) ch = ih;

		ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
		this.drawLogoOnCanvas(ctx)
	}


	drawLogoOnCanvas(ctx) {
		const maxDimension = 100;
		const aspectRatio = this.logo.naturalWidth / this.logo.naturalHeight;
		let logoWidth, logoHeight;
		if (this.logo.naturalWidth > this.logo.naturalHeight) {
			logoWidth = maxDimension;
			logoHeight = maxDimension / aspectRatio;
		} else {
			logoHeight = maxDimension;
			logoWidth = maxDimension * aspectRatio;
		}

		const logoX = ctx.canvas.width - logoWidth - 50;
		const logoY = ctx.canvas.height - logoHeight - 50;

		this.logo.style.objectFit = "cover";
		ctx.drawImage(this.logo, logoX, logoY, logoWidth, logoHeight);
	}


	async startRecording(container, members = [], callbackAfterRecord = null, type = "videocall") {
		let startRecording = await sconfirm('Do you  want to start recording?');

		if (!startRecording) return;

		// initialize varialble
		this.logo = new Image();
		this.logo.src = '/saito/img/logo.svg';
		this.is_recording = true;
		let combinedStream = new MediaStream();
		let animationFrameId;
		this.members = members

		// console.log('these are the members', members)

		// remove any previous canvas present
		document.querySelectorAll('canvas').forEach(canvas => {
			canvas.parentElement.removeChild(document.querySelector('canvas'))
		})
	

		if (type === "videocall") {
			let observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === 'childList') {
						mutation.addedNodes.forEach(node => {
							if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {

								const videos = node.querySelectorAll('video');
								videos.forEach(video => {
									const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
									const rect = video.getBoundingClientRect();
									const parentID = video.parentElement.id;
									const videoElement = document.createElement('video');
									videoElement.srcObject = stream;
									videoElement.muted = true;
									videoElement.play();

									this.streamData.push({ stream, rect, parentID, videoElement });
								});
							}
						});
					}
					if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
						this.streamData.forEach(data => {
							if (data.parentID === mutation.target.id) {
								data.rect = mutation.target.getBoundingClientRect();
							}
						});
					}

					if (mutation.removedNodes.length > 0) {
						mutation.removedNodes.forEach(node => {

							let index = this.streamData.findIndex(data => data.videoElement === node || data.videoElement.parentElement === node);
							if (index !== -1) {
								this.streamData.splice(index, 1);
							}
						});
					}
				});
			});

			observer.observe(document.body, {
				attributes: true,
				childList: true,
				subtree: true,
				attributeFilter: ['style']
			});

			const canvas = document.createElement('canvas');
			canvas.width = window.innerWidth;
			canvas.height = window.innerWidth
			const ctx = canvas.getContext('2d');
			document.body.appendChild(canvas);

			const drawStreamsToCanvas = () => {
				if (!this.is_recording) return;
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				this.streamData.forEach(data => {
					const parentElement = document.getElementById(data.parentID);
					if (!parentElement) return;
					const rect = parentElement.getBoundingClientRect();
					// Draw the video on the canvas
					if (data.videoElement.readyState >= 2) {
						this.drawImageProp(ctx, data.videoElement, rect.left, rect.top, rect.width, rect.height)
					}
				});

				animationFrameId = requestAnimationFrame(drawStreamsToCanvas);
			};

			const resizeCanvas = () => {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight
				const videoElements = document.querySelectorAll('div[id^="stream_"] video');
				videoElements.forEach(video => {
					video.style.objectFit = "cover";
					video.style.width = "100%";
					video.style.height = "100%";
					video.style.maxWidth = "100%";
				});
				// Update the drawing routine to handle the new canvas size
				drawStreamsToCanvas();
			};
			window.addEventListener('resize', resizeCanvas);
			resizeCanvas();

			const videoElements = document.querySelectorAll('div[id^="stream_"] video');
			// videoElements.forEach(video => {

			// 	// video.style.objectFit = "cover";
			// 	// video.style.width = "100%";
			// 	// video.style.height = "100%";
			// 	// video.style.maxWidth = "100%";
			// });

			const audioCtx = new AudioContext();
			destination = audioCtx.createMediaStreamDestination();

			this.streamData = Array.from(videoElements).map(video => {
				const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
				// if (!video.id.startsWith('local')) {
				// 	// console.log(video, "video localll")
				// 	// video.muted = false;
				// 	// video.volume = 1;
				// 	// console.log(video)
				// }
				if (stream && stream.getAudioTracks().length > 0) {
					let source = audioCtx.createMediaStreamSource(stream)
					source.connect(destination)
				}
				const rect = video.getBoundingClientRect();
				const parentID = video.parentElement.id;
				const videoElement = document.createElement('video');
				videoElement.srcObject = stream;
				videoElement.muted = true;
				videoElement.play();
				videoElement.style.display = "none";
				return { stream, rect, parentID, videoElement };
			}).filter(data => data.stream !== null);


			let chunks = [];


			combinedStream.addTrack(canvas.captureStream(25).getVideoTracks()[0]);
			combinedStream.addTrack(destination.stream.getAudioTracks()[0]);
			this.combinedStream = combinedStream;
			this.app.connection.emit('screenrecord-combined-stream', this.combinedStream)

			this.mediaRecorder = new MediaRecorder(combinedStream, {
				mimeType: 'video/webm; codecs="vp8, opus"',
				videoBitsPerSecond: 25 * 1024 * 1024,
				audioBitsPerSecond: 320 * 1024
			});
			this.mediaRecorder.ondataavailable = event => {
				if (event.data.size > 0) {
					chunks.push(event.data);
				}
			};

			this.mediaRecorder.onstop = async () => {
				// remove listeners
				cancelAnimationFrame(animationFrameId)
				window.removeEventListener('resize', resizeCanvas)
				observer.disconnect()
				// create compile video
				const blob = new Blob(chunks, { type: 'video/webm' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				const defaultFileName = 'saito_video.webm';
				const fileName = (await sprompt('Please enter a recording name', 'saito_video')) || defaultFileName;
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
				setTimeout(() => {
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}, 100);
				if (callbackAfterRecord) {
					callbackAfterRecord(blob);
				}
			};
			this.mediaRecorder.start();
			drawStreamsToCanvas();

			// console.log('these are the members', members)
	
		}
		else {
			// set up top variablse
			let lastSnapshotCanvas = null; // Variable to store the last taken snapshot
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			// document.body.appendChild(canvas);

			const offscreenCanvas = document.createElement('canvas');
			const offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
			offscreenCanvas.width = window.innerWidth;
			offscreenCanvas.height = window.innerHeight;

			// let lastSnapshotCanvas = document.createElement('canvas');
			// let lastSnapshotCtx = lastSnapshotCanvas.getContext('2d');
			// lastSnapshotCanvas.width = window.innerWidth;
			// lastSnapshotCanvas.height = window.innerHeight;


			// set up this 
			let self = this


			// set up audio
			const audioCtx = new AudioContext();
			let destination = audioCtx.createMediaStreamDestination();

			// set up resize event listener
			const resizeCanvas = () => {
				canvas.width = window.innerWidth;
				canvas.height = window.innerHeight;
				offscreenCanvas.width = window.innerWidth;
				offscreenCanvas.height = window.innerHeight;
				// lastSnapshotCanvas.width = window.innerWidth;
				// lastSnapshotCanvas.height = window.innerHeight;
			};
			resizeCanvas();
			window.addEventListener('resize', resizeCanvas);


			// set up mutation observer
			function findClosestVideoChild(node) {
				if (node.tagName && node.tagName.toLowerCase() === 'video') {
					return node;
				}
				for (let i = 0; i < node.childNodes.length; i++) {
					const foundNode = findClosestVideoChild(node.childNodes[i]);
					if (foundNode) {
						return foundNode;
					}
				}
				return null;
			}

			const elementTracker = new WeakMap();
			function shouldThrottle(element) {
				const now = Date.now();
				if (!elementTracker.has(element)) {
					elementTracker.set(element, { count: 1, timestamp: now });
					return false;
				}

				const elementData = elementTracker.get(element);
				const elapsedTime = now - elementData.timestamp;

				if (elapsedTime > 1000) {
					elementTracker.set(element, { count: 1, timestamp: now });
					return false;
				}

				if (elementData.count >= 2) {
					return true;
				}

				elementData.count += 1;
				return false;
			}
			const observer = new MutationObserver(mutations => {
				let to_return = false;
				mutations.forEach(mutation => {


					if (mutation.type === 'attributes') {
						if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
							this.streamData.forEach(data => {
								if (data.parentID === mutation.target.id) {
									to_return = true;
									data.rect = mutation.target.getBoundingClientRect();
								}
							});
						}

						if (mutation.target.id.startsWith("stun-chatbox")) {
							this.streamData.forEach(data => {
								console.log(data);
								const videoNode = findClosestVideoChild(mutation.target);
								if (videoNode && videoNode.parentElement && videoNode.parentElement.id === data.parentID) {
									console.log('moving parent of video', data);
									data.rect = mutation.target.getBoundingClientRect();
									to_return = true;
								}
							});
						}
						if (to_return) return;


						const imgBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

						if (mutation.target.nodeName === 'IMG' && mutation.target.currentSrc === imgBase64) {
							return;
						}
						if (mutation.target.nodeName === 'DIV' && mutation.target.innerHTML === `<img src="${imgBase64}" width="1" height="1" style="margin: 0px; padding: 0px; vertical-align: super;">Hidden Text`) {
							return;
						}
						if (mutation.target === document.querySelector("i#audio-indicator.fa.fa-microphone")) {
							return;
						}
						if (mutation.attributeName === 'style') {
							if (shouldThrottle(mutation.target)) {
								return;
							} else {
								const rect = mutation.target.getBoundingClientRect();
								if (rect.width > 0 && rect.height > 0) {
									takeSnapshot(document.body.getBoundingClientRect());
								}

							}

						}
					}

					if (mutation.type === 'childList') {
						mutation.addedNodes.forEach(node => {
							if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {
								// console.log('childlist', mutation.addedNodes);
								node.querySelectorAll('video').forEach(video => {
									const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream ? video.mozCaptureStream() : null;
									const rect = video.getBoundingClientRect();
									const parentID = video.parentElement.id;
									const videoElement = document.createElement('video');
									videoElement.srcObject = stream;
									videoElement.muted = true;
									videoElement.play();
									this.streamData.push({ stream, rect, parentID, videoElement });
								});
							}
						});
					}


					if (mutation.removedNodes.length > 0) {
						mutation.removedNodes.forEach(node => {
							let index = this.streamData.findIndex(data => data.videoElement === node || data.videoElement.parentElement === node);
							if (index !== -1) {
								this.streamData.splice(index, 1);
							}
						});
					}

				});
			});
			observer.observe(document.body, {
				attributes: true,
				childList: true,
				subtree: true,
				attributeFilter: ['style']
			});



			// get video elements if there is already a call going on
			const videoElements = document.querySelectorAll('div[id^="stream_"] video');
			// videoElements.forEach(video => {

			// 	// video.style.objectFit = "cover";
			// 	// video.style.width = "100%";
			// 	// video.style.height = "100%";
			// 	// video.style.maxWidth = "100%";
			// });

			this.streamData = Array.from(videoElements).map(video => {
				const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
				if (!video.id.startsWith('local')) {
				}
				if (stream && stream.getAudioTracks().length > 0) {
					let source = audioCtx.createMediaStreamSource(stream)
					source.connect(destination)
				}
				const rect = video.getBoundingClientRect();
				const parentID = video.parentElement.id;
				const videoElement = document.createElement('video');
				videoElement.srcObject = stream;
				videoElement.muted = true;
				videoElement.muted
				videoElement.play();
				videoElement.style.display = "none";
				return { stream, rect, parentID, videoElement };
			}).filter(data => data.stream !== null);



			let lastSnapshotTime = 0;

			function takeSnapshot(rect) {
				const now = performance.now();
				const timeSinceLastSnapshot = now - lastSnapshotTime;
				if (timeSinceLastSnapshot >= 1000 / 5) {
					lastSnapshotTime = now;
					html2canvas(document.body, {
						logging: false,
						// useCors: true,
						scale:1,
						x: rect.left,
						y: rect.top,
						width: rect.width,
						height: rect.height,
						ignoreElements: function (element) {
							if (element.id === "stream_local") {
								return true;
							}
							if (element.classList.contains('stun-chatbox')) {
								return true;
							}
						}
					}).then(contentCanvas => {
						ctx.drawImage(contentCanvas, rect.left, rect.top);
						lastSnapshotCanvas = contentCanvas;
						// renderCanvas();
					}).catch(error => console.error("Error capturing canvas:", error));
				} else {
					if (lastSnapshotCanvas) {
						// renderCanvas();
					}
				}
			}
			function renderCanvas() {
				if (!lastSnapshotCanvas) return;
				// console.log(lastSnapshotCanvas, 'canvas.widht', canvas.width, 'canvas.height', canvas.height)
				offscreenCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
				offscreenCtx.drawImage(lastSnapshotCanvas, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
			}

			takeSnapshot(document.body.getBoundingClientRect());

			let drawInterval = setInterval(() => {
				// we draw from both video streams and page to an offscreen context, then draw onto the main context after
				renderCanvas();
				this.streamData.forEach(data => {
					// console.log(this.streamData, "stream data")
					// const parentElement = document.getElementById(data.parentID);
					// if (!parentElement) return;
					// const rect = parentElement.getBoundingClientRect();
					if (data.videoElement.readyState >= 2) {
						this.drawImageProp(offscreenCtx, data.videoElement, data.rect.left, data.rect.top, data.rect.width, data.rect.height)
					}
				});

				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.drawImage(offscreenCanvas, 0, 0);
				// self.drawLogoOnCanvas(ctx)
			}, 1000 / 30);




			const otherParties = this.app.modules.getRespondTos('media-request');
			if (otherParties.length > 0) {
				const videoElements = document.querySelectorAll('div[id^="stream_"] video');
				this.streamData = Array.from(videoElements).map(video => {
					const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
					if (stream && stream.getAudioTracks().length > 0) {
						let source = audioCtx.createMediaStreamSource(stream);
						source.connect(destination);
					}
					const rect = video.getBoundingClientRect();
					const parentID = video.parentElement.id;
					const videoElement = document.createElement('video');
					videoElement.srcObject = stream;
					videoElement.muted = true;
					videoElement.play();
					return { stream, rect, parentID, videoElement };
				}).filter(data => data.stream !== null);

			} else {
				let includeCamera = await sconfirm('Add webcam to stream?');
				try {
					if (includeCamera) {
						try {
							this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
							if (this.localStream && this.localStream.getAudioTracks().length > 0) {
								let source = audioCtx.createMediaStreamSource(this.localStream);
								source.connect(destination);
							}
						} catch (error) {
							console.error("Failed to get user media:", error);
							alert("Failed to access camera and microphone.");
							return;
						}

						this.videoBox = new VideoBox(this.app, this, 'local');
						this.videoBox.render(this.localStream);
						let videoElement = document.querySelector('.video-box-container-large');
						videoElement.style.position = 'absolute';
						videoElement.style.top = '100px';
						videoElement.style.width = '350px';
						videoElement.style.height = '350px';
						this.app.browser.makeDraggable('stream_local');

					} else {
						try {
							this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
							if (this.localStream && this.localStream.getAudioTracks().length > 0) {

								let source = audioCtx.createMediaStreamSource(this.localStream);
								source.connect(destination);
							}
						} catch (error) {
							console.error("Failed to get user media:", error);
							alert("Failed to access camera and microphone.");
							return;
						}
					}
				} catch (error) {
					console.error('Access to user media denied: ', error);
					salert('Recording will continue without camera and/or microphone input');
				}
			}

			combinedStream.addTrack(canvas.captureStream().getVideoTracks()[0]);
			if (destination.stream.getAudioTracks().length > 0) {
				combinedStream.addTrack(destination.stream.getAudioTracks()[0]);
			}

			let chunks = [];
			const mimeType = 'video/webm';
			this.mediaRecorder = new MediaRecorder(combinedStream, {
				mimeType: mimeType,
				videoBitsPerSecond: 10 * 640 * 400
			});
			this.mediaRecorder.ondataavailable = event => {
				if (event.data.size > 0) {
					chunks.push(event.data);
				}
			};

			this.mediaRecorder.onstop = async () => {
				clearInterval(drawInterval)
				window.removeEventListener('resize', resizeCanvas)
				observer.disconnect()
				// stop local stram
				this.is_recording = false;
				const blob = new Blob(chunks, { type: 'video/webm' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.style.display = 'none';
				a.href = url;
				const defaultFileName = 'saito_video.webm';
				const fileName = (await sprompt('Please enter a recording name', 'saito_video')) || defaultFileName;
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
		
				setTimeout(() => {
					document.body.removeChild(a);
					URL.revokeObjectURL(url);
				}, 100);

				if (callbackAfterRecord) {
					callbackAfterRecord(blob);
				}
			};
			this.mediaRecorder.start();
		}


	
		// this.externalMediaControl = false;
		this.sendStartRecordingTransaction(members)
		this.updateUIForRecordingStart()
	}


	getSupportedMimeType() {
		const mimeTypes = [
			'video/webm; codecs=vp9',
			'video/webm; codecs=vp8',
			'video/webm; codecs=vp8,opus',
			'video/mp4',
			'video/x-matroska;codecs=avc1'
		];

		if (navigator.userAgent.includes("Firefox")) {
			return 'video/webm; codecs=vp8,opus'
		}

		for (const mimeType of mimeTypes) {
			if (MediaRecorder.isTypeSupported(mimeType)) {
				return mimeType;
			}
		}

		return 'video/webm; codecs=vp8,opus'
	}
	getTitleBarHeight() {
		const userAgent = navigator.userAgent;
		if (userAgent.includes("Firefox")) {
			return this.isToolbarVisible() ? 105 : 0;
		}
		if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("CriOS")) {
			return this.isToolbarVisible() ? 90 : 0;
		} else {
			return 0;
		}
	}


	isToolbarVisible() {
		const toolbarVisible = window.outerHeight - window.innerHeight > 50;
		console.log(window.outerHeight, window.innerHeight, "Is titlebar")
		return toolbarVisible;
	}

	async stopRecording() {
		if (this.mediaRecorder) {
			this.mediaRecorder.stop();
			this.mediaRecorder = null;
		}

		if (this.screenStream) {
			this.screenStream.getTracks().forEach(track => track.stop());
		}


		if (this.localStream) {
			this.localStream.getTracks().forEach((track) => track.stop());
			this.localStream = null;
		}



		if (this.videoBox) {
			this.videoBox.remove();
			this.videoBox = null;
		}

		this.updateUIForRecordingStop()

		this.sendStopRecordingTransaction(this.members)

	

		this.is_recording = false
		this.members = []
		// window.removeEventListener('resize', updateDimensions);
		// window.removeEventListener('orientationchange', updateDimensions);



	}





	getAudioTracksFromStreams(streams) {
		const audioTracks = [];
		streams.forEach(stream => {
			if (stream instanceof MediaStream) {
				audioTracks.push(...stream.getAudioTracks());
			}
		});
		return audioTracks;
	}

	async sendStartRecordingTransaction(keys) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		try {
			newtx.msg = {
				module: 'screenrecord',
				request: 'start recording',
			};
	
			for (let peer of keys) {
				if (peer != this.publicKey) {
					newtx.addTo(peer);
				}
			}
	
			await newtx.sign();
	
			this.app.connection.emit('relay-transaction', newtx);
			this.app.network.propagateTransaction(newtx);
		} catch (error) {
			console.log("error sending start recording transaction", error)
		}	

		
	}

	async sendStopRecordingTransaction(keys) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'screenrecord',
			request: 'stop recording',
		};

		for (let peer of keys) {
			if (peer != this.publicKey) {
				newtx.addTo(peer);
			}
		}

		await newtx.sign();

		this.app.connection.emit('relay-transaction', newtx);
		this.app.network.propagateTransaction(newtx);
	}

	updateUIForRecordingStart() {
		const recordIcon = document.querySelector('.fa-record-vinyl');
		if (recordIcon) {
			console.log('updating UI for recording start')
			recordIcon.classList.add('recording');
			recordIcon.parentElement.classList.add('recording')
		}
	}

	updateUIForRecordingStop() {
		const recordIcon = document.querySelector('.fa-record-vinyl');
		if (recordIcon) {
			recordIcon.classList.remove('recording');
			recordIcon.parentElement.classList.remove('recording')
		}

		const recordButtonGame = document.getElementById('record-stream');
		if (recordButtonGame) {
			recordButtonGame.textContent = "record game";
		}

	}
}

module.exports = Record;



