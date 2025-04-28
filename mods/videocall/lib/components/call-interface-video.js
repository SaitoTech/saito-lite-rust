const VideoBox = require('../../../../lib/saito/ui/saito-videobox/video-box');

const CallInterfaceVideoTemplate = require('./call-interface-video.template');

const Effects = require('../overlays/effects');
const VideocallSettings = require('../overlays/videocall-settings');
const StreamMirror = require('./stream-mirror');

class CallInterfaceVideo {
	constructor(app, mod, fullScreen = true) {
		this.app = app;
		this.mod = mod;
		this.videocall_settings = new VideocallSettings(app, mod);
		this.effectsMenu = new Effects(app, mod);
		this.localStream;
		this.video_boxes = {};
		this.local_container = 'expanded-video';
		this.remote_container = 'side-videos';
		this.remote_streams = new Map();
		this.current_speaker = null;
		this.speaker_candidate = null;
		this.public_key = mod.publicKey;
		this.full_screen = fullScreen;
		this.rendered = false;

		this.app.connection.on('show-call-interface', async (videoEnabled, audioEnabled) => {
			console.log('Render Video Call Interface', videoEnabled, audioEnabled);

			//This will render the (full-screen) component
			if (!document.querySelector('.stun-chatbox')) {
				this.render(videoEnabled, audioEnabled);
			}

			if (!this.old_title) {
				this.old_title = document.title;
			}

			this.room_link = this.mod.generateCallLink();

			if (this.full_screen) {
				console.log("FULL SCREEN");
				window.history.pushState({}, '', this.room_link);
				document.title = 'Saito Talk';
			}

		});

		this.app.connection.on('stun-update-link', () => {
			this.room_link = this.mod.generateCallLink();
		});

		this.app.connection.on('add-local-stream-request', (localStream) => {
			this.addLocalStream(localStream);
		});

		this.app.connection.on('add-remote-stream-request', (peer, remoteStream) => {
			this.remote_streams.set(peer, remoteStream);
			this.addRemoteStream(peer, remoteStream);

			this.updateImages();
			if (remoteStream) {
				this.startTimer();
			}
		});

		this.app.connection.on('add-waiting-video-box', () => {
			this.addRemoteStream('connecting', null);
		});

		this.app.connection.on('remove-waiting-video-box', () => {
			let peer_id = 'connecting';
			if (this.video_boxes[peer_id]?.video_box) {
				if (this.video_boxes[peer_id].video_box?.remove) {
					this.video_boxes[peer_id].video_box.remove();
				}
				delete this.video_boxes[peer_id];
			}
		});

		this.app.connection.on('remove-peer-box', (peer_id) => {
			this.remote_streams.delete(peer_id);

			if (this.video_boxes[peer_id]?.video_box) {
				if (this.video_boxes[peer_id].video_box?.remove) {
					this.video_boxes[peer_id].video_box.remove();
				}
				delete this.video_boxes[peer_id];
				this.updateImages();
			}

			//this.insertActions(this.mod.room_obj.call_peers);
		});

		// Change arrangement of video boxes (emitted from SwitchDisplay overlay)
		app.connection.on('stun-switch-view', (newView = "", save = false) => {
			siteMessage(`Switched to ${newView} display`, 2000);

			if (newView == 'presentation') {
				newView = 'focus';
			}

			if (newView){
				this.mod.layout = newView;
			}

			switch (this.mod.layout) {
				case 'gallery':
					this.switchDisplayToGallery();
					break;
				case 'speaker':
					this.switchDisplayToExpanded();
					break;
				case 'focus':
					this.switchDisplayToExpanded();
			}
		});

		app.connection.on('stun-new-speaker', (peer) => {
			if (!this.full_screen) {
				return;
			}

			document.querySelectorAll('.video-box-container-large').forEach((item) => {
				if (item.id === `stream${peer}`) {
					if (item.classList.contains('speaker')) {
						return;
					}

					if (
						this.mod.layout == 'speaker' &&
						!item.parentElement.classList.contains('expanded-video')
					) {
						console.log('New Speaker: ' + peer);
						this.flipDisplay(peer);
					}

					item.classList.add('speaker');
				} else {
					item.classList.remove('speaker');
				}
			});
		});

		app.connection.on('stun-data-channel-open', (pkey) => {
			if (this.rendered) {
				//this.insertActions(this.mod.room_obj.call_peers);
			}
		});

		app.connection.on('videocall-show-settings', () => {
			this.videocall_settings.render();
		});

		app.connection.on('stun-disconnect', async () => {
			for (let peer in this.video_boxes) {
				this.app.connection.emit('remove-peer-box', peer);
			}

			if (this.old_title) {
				document.title = this.old_title;
				delete this.old_title;
			}

			app.connection.emit("interrupt-screen-recording");

			if (this.mod.browser_active) {
				let homeModule = this.app.options?.homeModule || this.name;
				let mod = this.app.modules.returnModuleByName(homeModule);
				let slug = mod?.returnSlug() || 'videocall';
				let url = '/' + slug;

				navigateWindow(url, 2000);
			} else {
				//
				// Hopefully we don't have to reload the page on the end of a stun call
				// But keep on eye on this for errors and make sure all the components shut themselves down properly
				//
				if (document.querySelector('.stun-overlay-container')) {
					document.querySelector('.stun-overlay-container').remove();

					if (this.full_screen){
						window.history.back();
					}
				}
			}
		});
	}

	destroy() {
		this.app.connection.removeAllListeners('show-call-interface');
		this.app.connection.removeAllListeners('add-local-stream-request');
		this.app.connection.removeAllListeners('add-remote-stream-request');
		this.app.connection.removeAllListeners('remove-peer-box');
		this.app.connection.removeAllListeners('stun-new-speaker');
		this.app.connection.removeAllListeners('stun-switch-view');
		this.rendered = false;
		this?.streamMirror?.destroy();
	}

	render(videoEnabled, audioEnabled) {
		console.log('Render video interface');
		if (!document.querySelector('#stun-chatbox')) {
			this.app.browser.addElementToDom(
				CallInterfaceVideoTemplate(this.mod, videoEnabled, audioEnabled)
			);

			//stun-overlay-container make 

			this.insertActions();
			this.attachEvents();
		}

		if (document.querySelector('.game-video-container')){
			if (!this?.streamMirror){
				this.streamMirror = new StreamMirror(this.app, this.mod);		
			}
		}


		if (!this.mod.browser_active) {
			this.app.connection.emit('stun-switch-view', 'gallery');
		} else {
			this.app.connection.emit('stun-switch-view', this.mod.layout);
		}

		if (!this.full_screen) {
			try {
				document.querySelector('.stun-chatbox .minimizer').click();
			} catch (err) {
				console.error(err);
			}
		}

		this.rendered = true;
	}

	insertActions() {
		// add call icons

		let container = document.querySelector('.control-list.imported-actions');

		if (!container) {
			return;
		}

		container.innerHTML = '';

		let index = 0;

		let streams = [this.localStream];
		this.remote_streams.forEach((stream, key) => {
			streams.push(stream);
		});

		for (const mod of this.app.modules.mods) {
			let item = mod.respondTo('call-actions', { call_id: this.mod.room_obj.call_id });
			if (item instanceof Array) {
				item.forEach((j) => {
					this.createActionItem(j, container, index++);
				});
			} else if (item != null) {
				this.createActionItem(item, container, index++);
			}

			// This should confirm to the standard API!

			item = mod.respondTo('record-actions', {
				container: '.video-container-large',
				streams,
				useMicrophone: true,
				members: this.mod.room_obj.call_peers,
				callbackAfterRecord: (data) => {
					console.log('', data);
				}
			});
			if (item instanceof Array) {
				item.forEach((j) => {
					this.createActionItem(j, container, index++);
				});
			} else if (item != null) {
				this.createActionItem(item, container, index++);
			}
		}

		/*
			<span class="record-control icon_click_area" id="record-icon">
			  <label>Record</label>
			  <i class="fa-solid fa-record-vinyl"></i>
			</span>
		*/
	}

	createActionItem(item, container, index) {
		let id = 'call_action_item_' + index;
		let hook = item?.hook || '';
		let html = `<div id="${id}" class="icon_click_area ${hook}">
						<label>${item.text}</label>
						<i class="${item.icon}"></i>
					</div>`;

		const el = document.createElement('div');

		if (item?.prepend) {
			container.prepend(el);
		} else {
			container.appendChild(el);
		}

		el.outerHTML = html;

		let div = document.getElementById(id);
		if (div) {
			if (item?.callback) {
				div.onclick = () => {
					item.callback(this.app, this.mod.room_obj);
				};
			} else {
				console.warn('Adding an action item with no callback');
			}

			if (item.event) {
				item.event(id);
			}
		} else {
			console.warn('Item not found');
		}
	}

	attachEvents() {
		let add_users = document.querySelector('.add-users-container');
		if (add_users) {
			add_users.addEventListener('click', (e) => {
				this.mod.copyInviteLink();
			});
		}

		if (document.querySelector('.effects-control')) {
			document.querySelector('.effects-control').addEventListener('click', (e) => {
				this.effectsMenu.render();
			});
		}

		document.querySelectorAll('.disconnect-control').forEach((item) => {
			item.addEventListener('click', async (e) => {
				this.app.connection.emit('stun-disconnect');
				siteMessage('You have been disconnected', 3000);
			});
		});

		/*document.getElementById('record-icon').onclick = async () => {
			const recordIcon = document.querySelector('#record-icon i');
			const recordLabel = document.querySelector('#record-icon label');

			const formatTime = (totalSeconds) => {
				const hours = Math.floor(totalSeconds / 3600)
					.toString()
					.padStart(2, '0');
				const minutes = Math.floor((totalSeconds % 3600) / 60)
					.toString()
					.padStart(2, '0');
				const seconds = (totalSeconds % 60).toString().padStart(2, '0');
				return `${hours}:${minutes}:${seconds}`;
			};

			if (this.mod.peerManager.recording === true) {
				console.log('stopping recording');
				this.mod.peerManager.stopRecordCall();

				clearInterval(this.recordingInterval);

				recordLabel.textContent = 'Record';
				recordIcon.classList.remove('recording');
			} else {
				let recording = await this.mod.peerManager.recordCall();
				if (!recording) return;
				let totalSeconds = 0;
				recordLabel.textContent = '00:00:00';
				this.recordingInterval = setInterval(() => {
					totalSeconds++;
					recordLabel.textContent = `${formatTime(totalSeconds)}`;
				}, 1000);

				recordIcon.classList.add('recording');
			}
		};*/

		document.querySelectorAll('.call-controls .video-control').forEach((item) => {
			item.onclick = () => {
				this.toggleVideo();
			};
		});

		document.querySelectorAll('.call-controls .audio-control').forEach((item) => {
			item.onclick = () => {
				this.toggleAudio();
			};
		});

		if (!this.mod.browser_active) {

			//
			// If you are in RedSquare/Arcade/etc, allow stun to shrink down to small box so you
			// can still interact with the site
			//

			document.querySelector('.stun-chatbox .minimizer').addEventListener('click', (e) => {
				// fas fa-expand"
				let icon = document.querySelector('.stun-chatbox .minimizer i');
				let chat_box = document.querySelector('.stun-overlay-container');

				if (icon.classList.contains('fa-caret-down')) {
					if (this.mod.layout == 'focus') {
						// Make sure that I am not staring at myself in local!
						// >>>>>>>>>>>
						/*if (remoteStream) {
							let peer_elem = document.getElementById(`stream_${peer}`);
							if (peer_elem) {
								peer_elem.querySelector('.video-box').click();
							}
						}*/


					}
					chat_box.classList.add('minimize');
					icon.classList.remove('fa-caret-down');
					icon.classList.add('fa-expand');
					this.app.browser.makeDraggable('stun-chatbox-box', '', true);
					this.full_screen = false;
				} else {
					chat_box.classList.remove('minimize');
					chat_box.style.top = '';
					chat_box.style.bottom = '0';
					chat_box.style.left = '0';
					chat_box.style.width = '';
					chat_box.style.height = '';
					icon.classList.remove('fa-expand');
					icon.classList.add('fa-caret-down');
					this.app.browser.cancelDraggable('stun-chatbox-box');
					this.full_screen = true;
				}
			});
		} else {
			//
			// If in the stun app, all a request for full screen mode
			//
			let maximizer = document.querySelector('.stun-chatbox .maximizer');
			if (maximizer) {
				maximizer.onclick = (e) => {
					this.app.browser.requestFullscreen();
				};
			}
		}

		document.querySelector('.video-container-large').addEventListener('click', (e) => {
			if (this.mod.layout == 'gallery') {
				return;
			}
			if (e.target.classList.contains('video-box')) {
				let stream_id = e.target.id;
				if (e.target.parentElement.parentElement.classList.contains(this.local_container)) {
					return;
				} else {
					this.flipDisplay(stream_id);
				}
			}
		});
	}

	flipDisplay(stream_id) {
		console.log('flipDisplay: ' + this.local_container);
		let big_video = document.querySelector(`.${this.local_container} .video-box`);
		if (!big_video) {
			return;
		}
		this.video_boxes[big_video.id].video_box.containerClass = this.remote_container;
		this.video_boxes[big_video.id].video_box.rerender();

		this.video_boxes[stream_id].video_box.containerClass = this.local_container;
		this.video_boxes[stream_id].video_box.rerender();
	}

	addRemoteStream(peer, remoteStream) {
		this.createVideoBox(peer);
		this.video_boxes[peer].video_box.render(remoteStream);

		if (remoteStream) {
			let peer_elem = document.getElementById(`stream_${peer}`);
			if (peer_elem) {
				peer_elem.querySelector('.video-box').click();
			}
		}

		this.updateImages();

		if (peer.toLowerCase() === 'presentation') {
			// switch mode to presentation
			this.app.connection.emit('stun-switch-view', 'presentation');
			this.flipDisplay('presentation');
		}

		this.setDisplayContainers();
	}

	addLocalStream(localStream) {
		console.log('Add local stream');

		this.createVideoBox('local', this.local_container);
		this.video_boxes['local'].video_box.render(localStream);
		this.localStream = localStream;
		this.updateImages();

		this.setDisplayContainers();
		
		// segmentBackground(document.querySelector('#stream_local video'), document.querySelector('#stream_local canvas'), 1);
		// applyBlur(7);
	}

	createVideoBox(peer, container = this.remote_container) {
		if (!this.video_boxes[peer]) {
			const videoBox = new VideoBox(this.app, this.mod, peer, container);
			this.video_boxes[peer] = { video_box: videoBox };
		}
	}

	toggleAudio() {
		//Tell PeerManager to adjust streams
		this.app.connection.emit('stun-toggle-audio');

		//Update UI
		try {
			document.querySelector('.call-controls .audio-control').classList.toggle('disabled');
			document
				.querySelector('.call-controls .audio-control i')
				.classList.toggle('fa-microphone-slash');
			document.querySelector('.call-controls .audio-control i').classList.toggle('fa-microphone');
		} catch (err) {
			console.warn('Stun UI error', err);
		}
	}

	toggleVideo() {
		this.app.connection.emit('stun-toggle-video');

		//Update UI
		try {
			document.querySelector('.call-controls .video-control').classList.toggle('disabled');
			document.querySelector('.call-controls .video-control i').classList.toggle('fa-video-slash');
			document.querySelector('.call-controls .video-control i').classList.toggle('fa-video');
		} catch (err) {
			console.warn('Stun UI error', err);
		}
	}

	updateImages() {
		let images = ``;
		let count = 0;

		let imageDiv = document.querySelector('.users-on-call .stun-identicon-list');
		let countDiv = document.querySelector('.users-on-call .users-on-call-count');

		if (!imageDiv || !countDiv) {
			return;
		}

		for (let publickey in this.video_boxes) {
			if (publickey === 'presentation') {
				continue;
			}

			if (publickey === 'local') {
				publickey = this.mod.publicKey;
			}

			let imgsrc = this.app.keychain.returnIdenticon(publickey);
			images += `<img data-id ="${publickey}" class="saito-identicon" src="${imgsrc}"/>`;
			count++;
		}

		imageDiv.innerHTML = images;
		countDiv.innerHTML = count;
	}

	startTimer() {
		if (this.timer_interval) {
			return;
		}
		let timerElement = document.querySelector('.stun-chatbox .counter');
		let seconds = 0;

		const timer = () => {
			seconds++;

			// Get hours
			let hours = Math.floor(seconds / 3600);
			// Get minutes
			let minutes = Math.floor((seconds - hours * 3600) / 60);
			// Get seconds
			let secs = Math.floor(seconds % 60);

			if (hours > 0) {
				hours = `0${hours}:`;
			} else {
				hours = '';
			}
			if (minutes < 10) {
				minutes = `0${minutes}`;
			}
			if (secs < 10) {
				secs = `0${secs}`;
			}

			timerElement.innerHTML = `${hours}${minutes}:${secs}`;
		};

		this.timer_interval = setInterval(timer, 1000);
	}

	stopTimer() {
		clearInterval(this.timer_interval);
		this.timer_interval = null;
	}

	switchDisplayToGallery() {
		this.local_container = 'gallery';
		this.remote_container = 'gallery';

		let container = document.querySelector('.video-container-large');

		container.innerHTML = `<div class="gallery"></div>`;
		container.classList.remove('split-view', 'expanded', 'presentation');
		container.classList.add('gallery-view');
		this.setDisplayContainers();
	}

	switchDisplayToExpanded() {
		this.local_container = 'expanded-video';
		this.remote_container = 'side-videos';

		let container = document.querySelector('.video-container-large');

		container.innerHTML = `<div class="expanded-video"></div>
		<div class="side-videos"></div>`;
		container.classList.remove('gallery-view', 'presentation');
		container.classList.add('split-view', 'expanded');

		this.setDisplayContainers();
	}

	switchDisplayToPresentation() {
		this.local_container = 'presentation';
		this.remote_container = 'presentation-side-videos';

		let container = document.querySelector('.video-container-large');

		container.innerHTML = `<div class="presentation"></div>
		<div class="presentation-side-videos"></div>`;
		container.classList.remove('gallery-view', 'expanded');
		container.classList.add('split-view', 'presentation');

		this.setDisplayContainers();
	}

	setDisplayContainers() {
		for (let i in this.video_boxes) {
			if (i === 'local') {
				this.video_boxes[i].video_box.containerClass = this.local_container;
				this.video_boxes[i].video_box.render(this.localStream);
			} else {
				this.video_boxes[i].video_box.containerClass = this.remote_container;
				this.video_boxes[i].video_box.render(this.remote_streams.get(i));
			}
		}

		const galleryContainer = document.querySelector('.gallery');
		const sideVideosContainer = document.querySelector('.side-videos, .presentation-side-videos');

		if (galleryContainer) {
			this.setupContainer(galleryContainer);
		}

		if (sideVideosContainer) {
			this.setupContainer(sideVideosContainer);
		}

		document.querySelectorAll('.video-box-container-large').forEach((item) => {
			this.resizeBackground(item);
		});
	}

	setupContainer(container) {
		Array.from(container.children).forEach((child) => {
			child.classList.add('flex-item');
		});
		console.log(container, 'container');
		this.adjustClassesAndCount(container);
	}

	adjustClassesAndCount(element) {
		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const width = entry.contentRect.width;
				const height = entry.contentRect.height;
				const aspectRatio = width / height;

				element.classList.remove('wide', 'tall', 'square');

				if (aspectRatio > 5 / 3) {
					element.classList.add('wide');
				} else if (aspectRatio < 4 / 5) {
					element.classList.add('tall');
				} else {
					element.classList.add('square');
				}

				const childCount = element.children.length;
				Array.from(element.classList).forEach((className) => {
					if (className.startsWith('count-')) {
						element.classList.remove(className);
					}
				});
				element.classList.add(`count-${childCount}`);
			}
		});
		observer.observe(element);
	}

	resizeBackground(element) {
		const bg_observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				const element = entry.target;
				const width = entry.contentRect.width;
				const height = entry.contentRect.height;
				const aspectRatio = width / height;

				element.classList.remove('video-fill', 'video-contain', 'video-cover');

				if (aspectRatio > 16 / 9) {
					element.classList.add('video-fill');
				} else if (aspectRatio < 9 / 16) {
					element.classList.add('video-contain');
				} else {
					element.classList.add('video-cover');
				}
			}
		});

		bg_observer.observe(element);
	}
}

module.exports = CallInterfaceVideo;
