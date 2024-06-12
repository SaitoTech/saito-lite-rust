
const ModTemplate = require('../../lib/templates/modtemplate');
const VideoBox = require('../../lib/saito/ui/saito-videobox/video-box');
const html2canvas = require('html2canvas')

class Record extends ModTemplate {
	constructor(app) {
		super(app);
		this.app = app;
		this.name = 'Record';
		this.description = 'Recording Module';
		this.categories = 'Utilities Communications';
		this.class = 'utility';
		this.record_video = false;

		this.styles = ['/saito/saito.css', '/record/style.css'];
		this.interval = null;
		this.streamData = []
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
					icon: `fas fa-record-vinyl record-icon ${this.mediaRecorder ? "pulsate" : ""}`,
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
						await this.startRecording(container, [], callbackAfterRecord, "game");
						recordButton.textContent = "Stop recording";
					} else {
						this.mediaRecorder.stop();
						this.stopRecording()
					}
				}.bind(this)
			});

			return menu;
		}

	}

	onConfirmation(blk, tx, conf) {
		if (tx == null) {
			return;
		}

		let message = tx.returnMessage();

		if (conf === 0) {
			if (message.module === 'record') {
				if (this.app.BROWSER === 1) {
					if (this.hasSeenTransaction(tx)) return;

					if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
						if (message.request === "start recording") {
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
						}
						if (message.request === "stop recording") {
							siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
						}

						this.toggleNotification();
					}

				}
			}
		}
	}



	// async startRecording(container, members = [], callbackAfterRecord = null, type = "game") {
	// 	let startRecording = await sconfirm('Do you  want to start recording?');
	// 	if (!startRecording) return;
	// 	this.observer = new MutationObserver((mutations) => {
	// 		mutations.forEach((mutation) => {
	// 			if (mutation.type === 'childList') {
	// 				mutation.addedNodes.forEach(node => {

	// 					if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {

	// 						const videos = node.querySelectorAll('video');
	// 						videos.forEach(video => {
	// 							const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
	// 							const rect = video.getBoundingClientRect();
	// 							const parentID = video.parentElement.id;
	// 							const videoElement = document.createElement('video');
	// 							videoElement.srcObject = stream;
	// 							videoElement.play();
	// 							this.streamData.push({ stream, rect, parentID, videoElement });
	// 						});
	// 					}
	// 				});
	// 			}
	// 			if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
	// 				this.streamData.forEach(data => {
	// 					if (data.parentID === mutation.target.id) {
	// 						data.rect = mutation.target.getBoundingClientRect();
	// 					}
	// 				});
	// 			}

	// 			if (mutation.removedNodes.length > 0) {
	// 				mutation.removedNodes.forEach(node => {
	// 					// If a video or its parent is removed, find it in streamData and remove it
	// 					let index = this.streamData.findIndex(data => data.videoElement === node || data.videoElement.parentElement === node);
	// 					if (index !== -1) {
	// 						this.streamData.splice(index, 1);
	// 					}
	// 				});
	// 			}
	// 		});
	// 	});

	// 	this.observer.observe(document.body, {
	// 		attributes: true,
	// 		childList: true,
	// 		subtree: true,
	// 		attributeFilter: ['style']
	// 	});


	// 	let combinedStream = new MediaStream();


	// 	if (type === "videocall") {


	// 		if (!startRecording) return;

	// 		const canvas = document.createElement('canvas');
	// 		const scaleFactor = window.devicePixelRatio; // Handle high DPI devices
	// 		canvas.width = window.innerWidth * scaleFactor;
	// 		canvas.height = window.innerHeight * scaleFactor;
	// 		const ctx = canvas.getContext('2d');
	// 		ctx.scale(scaleFactor, scaleFactor); // Scale the context to match the device pixel ratio
	// 		document.body.appendChild(canvas);

	// 		this.observer = new MutationObserver(mutations => {
	// 			mutations.forEach(mutation => {
	// 				if (mutation.type === 'childList') {
	// 					mutation.addedNodes.forEach(node => {
	// 						if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {
	// 							const videos = node.querySelectorAll('video');
	// 							videos.forEach(video => {
	// 								const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
	// 								const rect = video.getBoundingClientRect();
	// 								const parentID = video.parentElement.id;
	// 								const videoElement = document.createElement('video');
	// 								videoElement.srcObject = stream;
	// 								videoElement.play();
	// 								videoElement.style.display = "none";
	// 								this.streamData.push({ stream, rect, parentID, videoElement });
	// 							});
	// 						}
	// 					});
	// 				}
	// 				if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
	// 					this.streamData.forEach(data => {
	// 						if (data.parentID === mutation.target.id) {
	// 							data.rect = mutation.target.getBoundingClientRect();
	// 						}
	// 					});
	// 				}
	// 			});
	// 		});
	// 		this.observer.observe(document.body, {
	// 			attributes: true,
	// 			childList: true,
	// 			subtree: true,
	// 			attributeFilter: ['style']
	// 		});

	// 		let lastUpdateTime = 0;
	// 		const updateInterval = 1000 / 30; // Update at 30 FPS

	// 		const drawStreamsToCanvas = () => {
	// 			if (Date.now() - lastUpdateTime > updateInterval) {
	// 				ctx.clearRect(0, 0, canvas.width, canvas.height);
	// 				html2canvas(document.querySelector(container), {
	// 					scale: scaleFactor,
	// 					useCORS: true
	// 				}).then(contentCanvas => {
	// 					ctx.drawImage(contentCanvas, 0, 0, canvas.width, canvas.height);
	// 					this.streamData.forEach(data => {
	// 						const parentElement = document.getElementById(data.parentID);
	// 						if (!parentElement) return;

	// 						const currentRect = parentElement.getBoundingClientRect();
	// 						if (data.videoElement.readyState >= 2) {
	// 							ctx.drawImage(data.videoElement, currentRect.left + window.pageXOffset, currentRect.top + window.pageYOffset, currentRect.width, currentRect.height);
	// 						}
	// 						data.rect = currentRect;
	// 					});
	// 					lastUpdateTime = Date.now();
	// 				}).catch(error => {
	// 					console.error('Error in html2canvas:', error);
	// 				});
	// 			}
	// 			requestAnimationFrame(drawStreamsToCanvas);
	// 		};
	// 		drawStreamsToCanvas();

	// 		let chunks = [];
	// 		const mimeType = 'video/webm';
	// 		this.mediaRecorder = new MediaRecorder(canvas.captureStream(60), {
	// 			mimeType: mimeType,
	// 			videoBitsPerSecond: 10 * 1024 * 1024,
	// 			audioBitsPerSecond: 320 * 1024
	// 		});
	// 		this.mediaRecorder.ondataavailable = event => {
	// 			if (event.data.size > 0) {
	// 				chunks.push(event.data);
	// 			}
	// 		};
	// 		this.mediaRecorder.onstop = async () => {
	// 			const blob = new Blob(chunks, { type: 'video/webm' });
	// 			const url = URL.createObjectURL(blob);
	// 			const a = document.createElement('a');
	// 			a.style.display = 'none';
	// 			a.href = url;
	// 			a.download = 'recorded.webm';  // Optionally prompt for file name
	// 			document.body.appendChild(a);
	// 			a.click();
	// 			setTimeout(() => {
	// 				document.body.removeChild(a);
	// 				URL.revokeObjectURL(url);
	// 			}, 100);
	// 			if (callbackAfterRecord) {
	// 				callbackAfterRecord(blob);
	// 			}
	// 		};
	// 		this.mediaRecorder.start();

	// 	} else {
	// 		const canvas = document.createElement('canvas');
	// 		canvas.width = window.innerWidth;
	// 		canvas.height = window.innerHeight;
	// 		const ctx = canvas.getContext('2d');
	// 		document.body.appendChild(canvas);

	// 		let result = document.querySelector(container);


	// 		const drawStreamsToCanvas = () => {
	// 			// Clear the entire canvas
	// 			ctx.clearRect(0, 0, canvas.width, canvas.height);

	// 			html2canvas(result).then(contentCanvas => {
	// 				ctx.drawImage(contentCanvas, 0, 0, canvas.width, canvas.height);
	// 				this.streamData.forEach(data => {
	// 					const parentElement = document.getElementById(data.parentID);
	// 					if (!parentElement) return;

	// 					const currentRect = parentElement.getBoundingClientRect();
	// 					if (data.videoElement.readyState >= 2) {
	// 						ctx.drawImage(data.videoElement, currentRect.left, currentRect.top, currentRect.width, currentRect.height);
	// 					}
	// 					data.rect = currentRect;
	// 				});

	// 				requestAnimationFrame(drawStreamsToCanvas);
	// 			});
	// 		};


	// 		const otherParties = this.app.modules.getRespondTos('media-request');
	// 		if (otherParties.length > 0) {
	// 			const videoElements = document.querySelectorAll('div[id^="stream_"] video');
	// 			this.streamData = Array.from(videoElements).map(video => {
	// 				const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
	// 				const rect = video.getBoundingClientRect();
	// 				const parentID = video.parentElement.id;
	// 				const videoElement = document.createElement('video');
	// 				videoElement.srcObject = stream;
	// 				videoElement.play();
	// 				videoElement.style.display = "none";

	// 				return { stream, rect, parentID, videoElement };
	// 			}).filter(data => data.stream !== null)

	// 		} else {
	// 			let includeCamera = await sconfirm('Add webcam to stream?');
	// 			try {
	// 				if (includeCamera) {
	// 					try {
	// 						this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	// 					} catch (error) {
	// 						console.error("Failed to get user media:", error);
	// 						alert("Failed to access camera and microphone.");
	// 						return;
	// 					}

	// 					this.videoBox = new VideoBox(this.app, this, 'local');
	// 					this.videoBox.render(this.localStream);
	// 					let videoElement = document.querySelector('.video-box-container-large');
	// 					console.log('video element', videoElement)
	// 					videoElement.style.position = 'absolute';
	// 					videoElement.style.top = '100px';
	// 					videoElement.style.width = '350px';
	// 					videoElement.style.height = '350px';
	// 					this.app.browser.makeDraggable('stream_local');
	// 					this.app.browser.makeDraggable('stream_local');



	// 					const videoElements = document.querySelectorAll('div[id^="stream_"] video');
	// 					this.streamData = Array.from(videoElements).map(video => {
	// 						const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
	// 						const rect = video.getBoundingClientRect();
	// 						const parentID = video.parentElement.id;
	// 						console.log('stream parent id', parentID)
	// 						const videoElement = document.createElement('video');
	// 						videoElement.srcObject = stream;
	// 						videoElement.play();
	// 						videoElement.style.display = "none";

	// 						return { stream, rect, parentID, videoElement };
	// 					}).filter(data => data.stream !== null);
	// 				} else {
	// 					this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
	// 				}
	// 			} catch (error) {
	// 				console.error('Access to user media denied: ', error);
	// 				salert('Recording will continue without camera and/or microphone input');
	// 			}
	// 		}



	// 		let chunks = [];
	// 		const mimeType = 'video/webm';
	// 		this.mediaRecorder = new MediaRecorder(canvas.captureStream(60), {
	// 			mimeType: mimeType,
	// 			videoBitsPerSecond: 25 * 1024 * 1024,
	// 			audioBitsPerSecond: 320 * 1024
	// 		});
	// 		this.mediaRecorder.ondataavailable = event => {
	// 			if (event.data.size > 0) {
	// 				chunks.push(event.data);
	// 			}
	// 		};

	// 		this.mediaRecorder.onstop = async () => {
	// 			const blob = new Blob(chunks, { type: 'video/webm' });
	// 			const url = URL.createObjectURL(blob);
	// 			const a = document.createElement('a');
	// 			a.style.display = 'none';
	// 			a.href = url;
	// 			const defaultFileName = 'saito_video.webm';
	// 			const fileName = (await sprompt('Please enter a recording name', 'saito_video')) || defaultFileName;
	// 			a.download = fileName;
	// 			document.body.appendChild(a);
	// 			a.click();
	// 			setTimeout(() => {
	// 				document.body.removeChild(a);
	// 				URL.revokeObjectURL(url);
	// 			}, 100);
	// 			if (callbackAfterRecord) {
	// 				callbackAfterRecord(blob);
	// 			}
	// 		};

	// 		this.mediaRecorder.start();
	// 		drawStreamsToCanvas();

	// 	}

	// 	this.localStream = null;
	// 	this.externalMediaControl = false;
	// 	this.updateUIForRecordingStart()
	// }


	async startRecording(container, members = [], callbackAfterRecord = null, type = "game") {
		let startRecording = await sconfirm('Do you  want to start recording?');
		if (!startRecording) return;
		this.observer = new MutationObserver((mutations) => {
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
						// If a video or its parent is removed, find it in streamData and remove it
						let index = this.streamData.findIndex(data => data.videoElement === node || data.videoElement.parentElement === node);
						if (index !== -1) {
							this.streamData.splice(index, 1);
						}
					});
				}
			});
		});

		this.observer.observe(document.body, {
			attributes: true,
			childList: true,
			subtree: true,
			attributeFilter: ['style']
		});


		let combinedStream = new MediaStream();


		if (type === "videocall") {
			const canvas = document.createElement('canvas');
			canvas.width = window.innerWidth;
			canvas.height = document.querySelector('.video-container-large').clientHeight
			const ctx = canvas.getContext('2d');
			document.body.appendChild(canvas);

			const drawStreamsToCanvas = () => {
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				this.streamData.forEach(data => {
					let parentElement = document.getElementById(data.parentID)
					const currentRect = parentElement.getBoundingClientRect();
					if (data.videoElement.readyState >= 2) {
						ctx.drawImage(data.videoElement, currentRect.left, currentRect.top, currentRect.width, currentRect.height);
					}
					data.rect = currentRect;
				});
				requestAnimationFrame(drawStreamsToCanvas);
			};
		
			const videoElements = document.querySelectorAll('div[id^="stream_"] video');
			this.streamData = Array.from(videoElements).map(video => {
				const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
				const rect = video.getBoundingClientRect();
				const parentID = video.parentElement.id;
				const videoElement = document.createElement('video');
				videoElement.srcObject = stream;
				videoElement.play();
				videoElement.style.display = "none";

				return { stream, rect, parentID, videoElement };
			}).filter(data => data.stream !== null);

			let chunks = [];
			const mimeType = 'video/webm';
			this.mediaRecorder = new MediaRecorder(canvas.captureStream(25), {
				mimeType: mimeType,
				videoBitsPerSecond: 25 * 1024 * 1024,
				audioBitsPerSecond: 320 * 1024
			});
			this.mediaRecorder.ondataavailable = event => {
				if (event.data.size > 0) {
					chunks.push(event.data);
				}
			};

			this.mediaRecorder.onstop = async () => {
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

		} else {
			const canvas = document.createElement('canvas');
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			const ctx = canvas.getContext('2d');
			document.body.appendChild(canvas);

			let result = document.querySelector(container);


			const drawStreamsToCanvas = () => {
				// Clear the entire canvas
				ctx.clearRect(0, 0, canvas.width, canvas.height);

				html2canvas(result).then(contentCanvas => {
					ctx.drawImage(contentCanvas, 0, 0, canvas.width, canvas.height);
					this.streamData.forEach(data => {
						const parentElement = document.getElementById(data.parentID);
						if (!parentElement) return; 

						const currentRect = data.rect;
					
						if (data.videoElement.readyState >= 2) { 
							ctx.drawImage(data.videoElement, currentRect.left, currentRect.top, currentRect.width, currentRect.height);
						}
						data.rect = currentRect;
					});

					requestAnimationFrame(drawStreamsToCanvas);
				});
			};


			const otherParties = this.app.modules.getRespondTos('media-request');
			if (otherParties.length > 0) {
				const videoElements = document.querySelectorAll('div[id^="stream_"] video');
				this.streamData = Array.from(videoElements).map(video => {
					const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
					const rect = video.getBoundingClientRect();
					const parentID = video.parentElement.id;
					const videoElement = document.createElement('video');
					videoElement.srcObject = stream;
					videoElement.play();
					videoElement.style.display = "none";

					return { stream, rect, parentID, videoElement };
				}).filter(data => data.stream !== null)

			} else {
				let includeCamera = await sconfirm('Add webcam to stream?');
				try {
					if (includeCamera) {
						try {
							this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
						} catch (error) {
							console.error("Failed to get user media:", error);
							alert("Failed to access camera and microphone.");
							return;
						}

						this.videoBox = new VideoBox(this.app, this, 'local');
						this.videoBox.render(this.localStream);
						let videoElement = document.querySelector('.video-box-container-large');
						console.log('video element', videoElement)
						videoElement.style.position = 'absolute';
						videoElement.style.top = '100px';
						videoElement.style.width = '350px';
						videoElement.style.height = '350px';
						this.app.browser.makeDraggable('stream_local');
						this.app.browser.makeDraggable('stream_local');



						const videoElements = document.querySelectorAll('div[id^="stream_"] video');
						this.streamData = Array.from(videoElements).map(video => {
							const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
							const rect = video.getBoundingClientRect();
							const parentID = video.parentElement.id;
							console.log('stream parent id', parentID)
							const videoElement = document.createElement('video');
							videoElement.srcObject = stream;
							videoElement.play();
							videoElement.style.display = "none";

							return { stream, rect, parentID, videoElement };
						}).filter(data => data.stream !== null);
					} else {
						this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
					}
				} catch (error) {
					console.error('Access to user media denied: ', error);
					salert('Recording will continue without camera and/or microphone input');
				}
			}



			let chunks = [];
			const mimeType = 'video/webm';
			this.mediaRecorder = new MediaRecorder(canvas.captureStream(60), {
				mimeType: mimeType,
				videoBitsPerSecond: 25 * 1024 * 1024,
				audioBitsPerSecond: 320 * 1024
			});
			this.mediaRecorder.ondataavailable = event => {
				if (event.data.size > 0) {
					chunks.push(event.data);
				}
			};

			this.mediaRecorder.onstop = async () => {
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

		}

		this.localStream = null;
		this.externalMediaControl = false;
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
		cancelAnimationFrame(this.animation_id);

		if (this.localStream && !this.externalMediaControl) {
			this.localStream.getTracks().forEach((track) => track.stop());
			this.localStream = null;
		}



		if (this.videoBox) {
			this.videoBox.remove();
			this.videoBox = null;
		}

		this.updateUIForRecordingStop()

		const recordButtonGame = document.getElementById('record-stream');
		if (recordButtonGame) {
			recordButtonGame.textContent = "record game";
		}

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

		newtx.msg = {
			module: 'Screenrecord',
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
	}

	async sendStopRecordingTransaction(keys) {
		let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

		newtx.msg = {
			module: 'Screenrecord',
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
			recordIcon.classList.add('pulsate');
		}
	}

	updateUIForRecordingStop() {
		const recordIcon = document.querySelector('.fa-record-vinyl');
		if (recordIcon) {
			recordIcon.classList.remove('pulsate');
		}
	}
}

module.exports = Record;


