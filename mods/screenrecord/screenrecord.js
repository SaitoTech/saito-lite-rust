
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

			return [
				{
					text: 'Record',
					icon: 'fas fa-record-vinyl record-icon',
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
			canvas.height = window.innerHeight;
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
						if (!parentElement) return; // Skip if no parent element is found

						const currentRect = parentElement.getBoundingClientRect();
						if (data.videoElement.readyState >= 2) { // Ensure the video is ready to play
							ctx.drawImage(data.videoElement, currentRect.left, currentRect.top, currentRect.width, currentRect.height);
						}
						data.rect = currentRect; // Update the stored rectangle
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


	// Optional: Stop recording after a certain time
	// setTimeout(() => mediaRecorder.stop(), 10000); // Stop after 10 seconds



	// async startRecording(container, members = [], callbackAfterRecord = null, type = "videocall") {
	// 	let startRecording = await sconfirm('Do you  want to start recording?');
	// 	if (!startRecording) return;
	// 	this.observer = new MutationObserver((mutations) => {
	// 		mutations.forEach((mutation) => {
	// 			if (mutation.type === 'childList') {
	// 				mutation.addedNodes.forEach(node => {

	// 					if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {

	// 						const videos = node.querySelectorAll('video');
	// 						// videos.forEach(video => {
	// 						// 	const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
	// 						// 	const rect = video.getBoundingClientRect();
	// 						// 	const parentID = video.parentElement.id;
	// 						// 	const videoElement = document.createElement('video');
	// 						// 	videoElement.srcObject = stream;
	// 						// 	videoElement.play();
	// 						// 	this.streamData.push({ stream, rect, parentID, videoElement });
	// 						// });
	// 						videos.forEach(video => {
	// 							let existingData = this.streamData.find(d => d.videoElement.srcObject === video.srcObject);
	// 							if (!existingData) {
	// 								const stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
	// 								const videoElement = document.createElement('video');
	// 								videoElement.srcObject = stream;
	// 								videoElement.play();
	// 								videoElement.style.display = "none";
	// 								this.streamData.push({
	// 									stream, videoElement,
	// 									rect: video.getBoundingClientRect(),
	// 									parentID: video.parentElement.id
	// 								});
	// 							} else {
	// 								existingData.rect = video.getBoundingClientRect(); // Update position only
	// 							}
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

	// 	const canvas = document.createElement('canvas');
	// 	canvas.width = window.innerWidth;
	// 	canvas.height = window.innerHeight;
	// 	const ctx = canvas.getContext('2d');
	// 	document.body.appendChild(canvas);


	// 	if (type === "videocall") {
	// 		const drawStreamsToCanvas = () => {
	// 			ctx.clearRect(0, 0, canvas.width, canvas.height);
	// 			this.streamData.forEach(data => {
	// 				let parentElement = document.getElementById(data.parentID)
	// 				const currentRect = parentElement.getBoundingClientRect();
	// 				if (data.videoElement.readyState >= 2) {
	// 					ctx.drawImage(data.videoElement, currentRect.left, currentRect.top, currentRect.width, currentRect.height);
	// 				}
	// 				data.rect = currentRect;
	// 			});
	// 			this.animation_id = requestAnimationFrame(drawStreamsToCanvas);
	// 		};

	// 		// let lastRedraw = Date.now();
	// 		// const minimumRedrawInterval = 1000 / 30; // 30 fps

	// 		// const drawStreamsToCanvas = () => {
	// 		// 	const now = Date.now();
	// 		// 	if (now - lastRedraw > minimumRedrawInterval) {
	// 		// 		ctx.clearRect(0, 0, canvas.width, canvas.height);
	// 		// 		this.streamData.forEach(data => {
	// 		// 			const parentElement = document.getElementById(data.parentID);
	// 		// 			if (!parentElement || data.videoElement.readyState < 2) return;
	// 		// 			const currentRect = parentElement.getBoundingClientRect();
	// 		// 			ctx.drawImage(data.videoElement, currentRect.left, currentRect.top, currentRect.width, currentRect.height);
	// 		// 			data.rect = currentRect;
	// 		// 		});
	// 		// 		lastRedraw = now;
	// 		// 	}
	// 		// 	this.animation_id = requestAnimationFrame(drawStreamsToCanvas);
	// 		// };
	// 		const videoElements = document.querySelectorAll('div[id^="stream_"] video');
	// 		this.streamData = Array.from(videoElements).map(video => {
	// 			const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
	// 			const rect = video.getBoundingClientRect();
	// 			const parentID = video.parentElement.id;
	// 			const videoElement = document.createElement('video');
	// 			videoElement.srcObject = stream;
	// 			videoElement.play();
	// 			videoElement.style.display = "none";

	// 			return { stream, rect, parentID, videoElement };
	// 		}).filter(data => data.stream !== null);

	// 		let chunks = [];
	// 		const mimeType = 'video/webm';
	// 		this.mediaRecorder = new MediaRecorder(canvas.captureStream(120), {
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

	// 		this.updateUIForRecordingStart()

	// 	} else {


	// 		let result = document.querySelector("container");
	// 		const drawStreamsToCanvas = () => {
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

	// 				this.animation_id = requestAnimationFrame(drawStreamsToCanvas);
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
	// 			a.download = 'recorded.webm';
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









	// 	// Optional: Stop recording after a certain time
	// 	// setTimeout(() => mediaRecorder.stop(), 10000); // Stop after 10 seconds
	// }



	// async startRecording(container, members = [], callbackAfterRecord = null) {
	// 	this.localStream = null;
	// 	this.externalMediaControl = false;

	// 	const otherParties = this.app.modules.getRespondTos('media-request');
	// 	if (otherParties.length > 0) {
	// 		this.localStream = otherParties[0].localStream;
	// 		this.additionalSources = otherParties[0].remoteStreams;
	// 		this.externalMediaControl = true;
	// 	} else {
	// 		let includeCamera = await sconfirm('Add webcam to stream?');

	// 		try {
	// 			if (includeCamera) {
	// 				try {
	// 					this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
	// 				} catch (error) {
	// 					console.error("Failed to get user media:", error);
	// 					alert("Failed to access camera and microphone.");
	// 					return;
	// 				}

	// 				this.videoBox = new VideoBox(this.app, this, 'local');
	// 				this.videoBox.render(this.localStream);
	// 				let videoElement = document.querySelector('.video-box-container-large');
	// 				videoElement.style.position = 'absolute';
	// 				videoElement.style.top = '100px';
	// 				videoElement.style.width = '350px';
	// 				videoElement.style.height = '350px';
	// 				this.app.browser.makeDraggable('stream_local');
	// 			} else {
	// 				this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
	// 			}
	// 		} catch (error) {
	// 			console.error('Access to user media denied: ', error);
	// 			salert('Recording will continue without camera and/or microphone input');
	// 		}
	// 	}

	// 	let chunks = [];
	// 	const targetDiv = document.querySelector(container);
	// 	console.log(container, targetDiv, "containers");

	// 	function updateDimensions() {
	// 		const { top, left, width, height } = targetDiv.getBoundingClientRect();
	// 		return { top, left, width, height };
	// 	}

	// 	let { top, left, width, height } = updateDimensions();
	// 	console.log(`Div dimensions - Top: ${top}, Left: ${left}, Width: ${width}, Height: ${height}`);
	// 	this.screenStream = null;
	// 	try {
	// 		this.screenStream = await navigator.mediaDevices.getDisplayMedia({
	// 			video: { displaySurface: 'browser', mediaSource: "window" },
	// 			audio: true,
	// 			preferCurrentTab: true,
	// 			selfBrowserSurface: 'include',
	// 			monitorTypeSurfaces: 'include'
	// 		});
	// 	} catch (error) {
	// 		console.error('Error fetching display media:', error);
	// 		this.showAlert("Error fetching display media");
	// 		return;
	// 	}

	// 	this.screenStream.getTracks().forEach((track) => {
	// 		track.onended = () => {
	// 			console.log('onended', this);
	// 			this.stopRecording();
	// 		};
	// 	});

	// 	const video = document.createElement('video');
	// 	video.srcObject = this.screenStream;
	// 	video.style.display = 'none'; // Hide the video element
	// 	video.play();
	// 	document.body.appendChild(video);

	// 	const canvas = document.createElement('canvas');
	// 	const ctx = canvas.getContext('2d');
	// 	canvas.width = width;
	// 	canvas.height = height;
	// 	const self = this;

	// 	video.onloadedmetadata = () => {
	// 		function draw() {
	// 			let { top, left, width, height } = updateDimensions();
	// 			const titleBarHeight = self.getTitleBarHeight(); 
	// 			const canvasWidth = width;
	// 			const canvasHeight = height - titleBarHeight;
	// 			canvas.width = canvasWidth;
	// 			canvas.height = canvasHeight;

	// 			const scaleX = video.videoWidth / window.innerWidth;
	// 			const scaleY = video.videoHeight / window.innerHeight;

	// 			const scaledWidth = canvasWidth * scaleX;
	// 			const scaledHeight = canvasHeight * scaleY;
	// 			ctx.clearRect(0, 0, canvas.width, canvas.height);

	// 			const srcX = left * scaleX;
	// 			const srcY = (top + titleBarHeight) * scaleY;

	// 			const clipWidth = Math.min(scaledWidth, video.videoWidth - srcX);
	// 			const clipHeight = Math.min(scaledHeight, video.videoHeight - srcY);

	// 			ctx.drawImage(video, srcX, srcY, clipWidth, clipHeight, 0, 0, canvas.width, canvas.height);
	// 			self.animation_id = requestAnimationFrame(draw);
	// 		}
	// 		draw();
	// 	};

	// 	targetDiv.addEventListener('dragstart', (event) => {
	// 		event.dataTransfer.setData('text/plain', null);
	// 	});

	// 	targetDiv.addEventListener('drag', (event) => {
	// 		if (event.clientX > 0 && event.clientY > 0) {
	// 			let { top, left, width, height } = updateDimensions();
	// 			canvas.width = width;
	// 			canvas.height = height;
	// 		}
	// 	});

	// 	targetDiv.addEventListener('dragend', (event) => {
	// 		let { top, left, width, height } = updateDimensions();
	// 		canvas.width = width;
	// 		canvas.height = height;
	// 	});

	// 	window.addEventListener('resize', updateDimensions);
	// 	window.addEventListener('orientationchange', updateDimensions);
	// 	let recordedStream = canvas.captureStream();

	// 	const combinedStream = new MediaStream([...recordedStream.getTracks()]);

	// 	if (this.localStream) {
	// 		let streams = [this.localStream];
	// 		console.log(this.localStream, this.additionalSources, "local and additional sources");
	// 		if (this.additionalSources) {
	// 			this.additionalSources.forEach(stream => streams.push(stream));
	// 		}
	// 		const audioTracks = this.getAudioTracksFromStreams(streams);
	// 		audioTracks.forEach(track => combinedStream.addTrack(track));
	// 	}

	// 	try {
	// 		const mimeType = this.getSupportedMimeType();
	// 		if (!mimeType) {
	// 			throw new Error('No supported MIME type found for MediaRecorder');
	// 		}
	// 		this.mediaRecorder = new MediaRecorder(combinedStream, {
	// 			mimeType: mimeType,
	// 			videoBitsPerSecond: 25 * 1024 * 1024,
	// 			audioBitsPerSecond: 320 * 1024
	// 		});
	// 	} catch (error) {
	// 		console.log("Error creating media recorder", error);
	// 	}

	// 	this.mediaRecorder.ondataavailable = event => {
	// 		if (event.data.size > 0) {
	// 			chunks.push(event.data);
	// 			if (callbackAfterRecord) {
	// 				callbackAfterRecord(event.data);
	// 			}
	// 		}
	// 	};

	// 	this.mediaRecorder.onstop = async () => {
	// 		const blob = new Blob(chunks, { type: 'video/webm' });
	// 		const url = URL.createObjectURL(blob);
	// 		const a = document.createElement('a');
	// 		const defaultFileName = 'saito_video.webm';
	// 		const fileName = (await sprompt('Please enter a recording name', 'saito_video')) || defaultFileName;
	// 		a.style.display = 'none';
	// 		a.href = url;
	// 		a.download = fileName;
	// 		document.body.appendChild(a);
	// 		a.click();
	// 		URL.revokeObjectURL(url);
	// 		document.body.removeChild(video);
	// 		if (members.length > 0) {
	// 			this.sendStopRecordingTransaction(members);
	// 		}
	// 	};

	// 	this.mediaRecorder.start();
	// 	this.updateUIForRecordingStart();

	// 	if (members.length > 0) {
	// 		this.sendStartRecordingTransaction(members);
	// 	}
	// }


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
			recordIcon.classList.add('recording', 'pulsate');
		}
	}

	updateUIForRecordingStop() {
		const recordIcon = document.querySelector('.fa-record-vinyl');
		if (recordIcon) {
			recordIcon.classList.remove('recording', 'pulsate');
		}
	}
}

module.exports = Record;


