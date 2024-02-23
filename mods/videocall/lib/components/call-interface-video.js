const VideoBox = require('./video-box');
const CallInterfaceVideoTemplate = require('./call-interface-video.template');

const SwitchDisplay = require('../overlays/switch-display');
const Effects = require('../overlays/effects');
const VideocallSettings = require('../overlays/videocall-settings');

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
		this.display_mode = 'focus';
		this.remote_streams = new Map();
		this.current_speaker = null;
		this.speaker_candidate = null;
		this.public_key = mod.publicKey;
		this.full_screen = fullScreen;

		this.app.connection.on(
			'show-call-interface',
			async (videoEnabled, audioEnabled) => {
				console.log('Render Video Call Interface', videoEnabled, audioEnabled);

				// create chat group
				this.createRoomTextChat();

				//This will render the (full-screen) component
				if (!document.querySelector('.stun-chatbox')) {
					this.render(videoEnabled, audioEnabled);
				}

				this.room_link = this.createRoomLink();

				if (
					this.mod.room_obj.host_public_key == this.mod.publicKey &&
					this.full_screen
				) {
					this.copyInviteLink();
				}
			}
		);

		this.app.connection.on('add-local-stream-request', (localStream) => {
			this.addLocalStream(localStream);
		});

		this.app.connection.on(
			'add-remote-stream-request',
			(peer, remoteStream) => {
				this.remote_streams.set(peer, remoteStream);
				this.addRemoteStream(peer, remoteStream);
			}
		);

		this.app.connection.on(
			'stun-update-connection-message',
			(peer_id, status) => {
				if (this.app.options.stun.peers.includes(peer_id) && !this.video_boxes[peer_id]){
					console.warn("Missing video box for expected peer");
					return;
				}

				if (status === 'connecting') {
					this.video_boxes[peer_id].video_box.renderPlaceholder(
						'connecting'
					);
				} else if (status === 'connected') {
					this.video_boxes[
						peer_id
					].video_box.removeConnectionMessage();
					console.log('removing reconnection message');
					this.startTimer();
					this.updateImages();
				} else if (status === 'disconnected') {
					this.video_boxes[peer_id].video_box.renderPlaceholder(
						'retrying connection'
					);
				}
			}
		);

		this.app.connection.on('remove-peer-box', (peer_id) => {
			if (this.video_boxes[peer_id]?.video_box) {
				if (this.video_boxes[peer_id].video_box?.remove) {
					this.video_boxes[peer_id].video_box.remove(true);
				}
				delete this.video_boxes[peer_id];
				this.updateImages();
			}
		});

		// Change arrangement of video boxes (emitted from SwitchDisplay overlay)
		app.connection.on('stun-switch-view', (newView) => {
			this.display_mode = newView;
			console.log('Switch view: ' + newView);
			switch (newView) {
				case 'gallery':
					this.switchDisplayToGallery();
					break;
				case 'focus':
					this.switchDisplayToExpanded();
					break;
				case 'speaker':
					this.switchDisplayToExpanded();
					break;
				case 'presentation':
					this.switchDisplayToExpanded();
					break;

				default:
					break;
			}
			// if(newView !== "presentation"){}
			siteMessage(`Switched to ${newView} display`, 2000);
		});

		app.connection.on('stun-new-speaker', (peer) => {
			if (!this.full_screen) {
				return;
			}

			document
				.querySelectorAll('.video-box-container-large')
				.forEach((item) => {
					if (item.id === `stream${peer}`) {
						if (item.classList.contains('speaker')) {
							return;
						}

						if (
							this.display_mode == 'speaker' &&
							!item.parentElement.classList.contains(
								'expanded-video'
							)
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

		app.connection.on('stun-disconnect', () => {
			this.video_boxes = {};

			if (this.mod.browser_active) {
				let homeModule = this.app.options?.homeModule || 'Stun';
				let mod = this.app.modules.returnModuleByName(homeModule);
				let slug = mod?.returnSlug() || 'videocall';
				let url = '/' + slug;

				setTimeout(() => {
					window.location.href = url;
				}, 2000);
			} else {
				//
				// Hopefully we don't have to reload the page on the end of a stun call
				// But keep on eye on this for errors and make sure all the components shut themselves down properly
				//
				if (document.getElementById('stun-chatbox')) {
					document.getElementById('stun-chatbox').remove();
					let am = this.app.modules.returnActiveModule();
					window.history.pushState(
						{},
						'',
						window.location.origin + '/' + am.returnSlug()
					);
					document.title = this.old_title;
				}
			}
		});
	}

	destroy() {
		this.app.connection.removeAllListeners('show-call-interface');
		this.app.connection.removeAllListeners('add-local-stream-request');
		this.app.connection.removeAllListeners('add-remote-stream-request');
		this.app.connection.removeAllListeners(
			'stun-update-connection-message'
		);
		this.app.connection.removeAllListeners('remove-peer-box');
		this.app.connection.removeAllListeners('stun-new-speaker');
		this.app.connection.removeAllListeners('stun-switch-view');
	}

	render(videoEnabled, audioEnabled) {
		console.log('Render video interface');
		if (!document.querySelector('#stun-chatbox')) {
			this.app.browser.addElementToDom(
				CallInterfaceVideoTemplate(this.mod, videoEnabled, audioEnabled)
			);
		}

		this.attachEvents();

		if (!this.full_screen) {
			try {
				document.querySelector('.stun-chatbox .minimizer').click();
			} catch (err) {
				console.error(err);
			}
		}
	}

	async createRoomTextChat() {
		let chat_mod = this.app.modules.returnModule('Chat');

		if (!chat_mod) {
			return;
		}

		let cm = chat_mod.respondTo('chat-manager');
		let peer = (await this.app.network.getPeers())[0].publicKey;
		this.chat_group = {
			id: this.mod.room_obj.call_id,
			members: [peer],
			name: `Video Chat`,
			txs: [],
			unread: 0
			//
			// USE A TARGET Container if the chat box is supposed to show up embedded within the UI
			// Don't include if you want it to be just a chat popup....
			//
			//target_container: `.stun-chatbox .${this.remote_container}`,
		};

		chat_mod.groups.push(this.chat_group);

		//You should be able to just create a Chat Group, but we are duplicating the public chat server
		//so we need this hacky work around
		//this.chat_group = chat_mod.returnOrCreateChatGroupFromMembers([this.app.network.peers[0].peer.publickey], `Chat`);
	}

	attachEvents() {
		let add_users = document.querySelector('.add_users_container');
		if (add_users) {
			add_users.addEventListener('click', (e) => {
				this.copyInviteLink();
			});
		}

		document
			.querySelector('.chat_control')
			.addEventListener('click', (e) => {
				this.app.connection.emit('open-chat-with', {
					id: this?.chat_group?.id
				});
			});

		if (document.querySelector('.effects-control')) {
			document
				.querySelector('.effects-control')
				.addEventListener('click', (e) => {
					this.effectsMenu.render();
				});
		}

		document.querySelectorAll('.disconnect-control').forEach((item) => {
			item.addEventListener('click', async (e) => {
				this.app.connection.emit('stun-disconnect');
				let chat_module = this.app.modules.returnModule('Chat');
				if (chat_module && this.chat_group) {
					await chat_module.deleteChatGroup(this.chat_group);
				}
				siteMessage('You have been disconnected', 3000);
			});
		});

		document.getElementById('record-icon').onclick = async () => {
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
		};

		document.querySelectorAll('.display-control').forEach((item) => {
			item.onclick = () => {
				this.videocall_settings.render(this.display_mode);
			};
		});

		document.querySelectorAll('.video-control').forEach((item) => {
			item.onclick = () => {
				this.toggleVideo();
			};
		});

		document.querySelectorAll('.audio-control').forEach((item) => {
			item.onclick = () => {
				this.toggleAudio();
			};
		});

		if (!this.mod.browser_active) {
			//
			// If you are in RedSquare/Arcade/etc, allow stun to shrink down to small box so you
			// can still interact with the site
			//

			document
				.querySelector('.stun-chatbox .minimizer')
				.addEventListener('click', (e) => {
					// fas fa-expand"
					let icon = document.querySelector(
						'.stun-chatbox .minimizer i'
					);
					let chat_box = document.querySelector('.stun-chatbox');

					chat_box.classList.toggle('full-screen');

					if (icon.classList.contains('fa-caret-down')) {
						if (this.display_mode !== 'focus') {
							this.app.connection.emit(
								'stun-switch-view',
								'focus'
							);
						}
						chat_box.classList.add('minimize');
						icon.classList.remove('fa-caret-down');
						icon.classList.add('fa-expand');
						this.app.browser.makeDraggable(
							'stun-chatbox',
							'',
							true
						);
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
						this.app.browser.cancelDraggable('stun-chatbox');
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

		document
			.querySelector('.video-container-large')
			.addEventListener('click', (e) => {
				if (
					this.display_mode == 'gallery' ||
					this.display_mode == 'presentation'
				) {
					return;
				}
				if (e.target.classList.contains('video-box')) {
					let stream_id = e.target.id;
					if (
						e.target.parentElement.parentElement.classList.contains(
							this.local_container
						)
					) {
						return;
					} else {
						this.flipDisplay(stream_id);
					}
				}
			});
	}

	flipDisplay(stream_id) {
		console.log('flipDisplay: ' + this.local_container);
		let big_video = document.querySelector(
			`.${this.local_container} .video-box`
		);
		if (!big_video) {
			return;
		}
		this.video_boxes[big_video.id].video_box.containerClass =
			this.remote_container;
		this.video_boxes[big_video.id].video_box.rerender();

		this.video_boxes[stream_id].video_box.containerClass =
			this.local_container;
		this.video_boxes[stream_id].video_box.rerender();
	}

	createRoomLink() {
		let base64obj = this.app.crypto.stringToBase64(
			JSON.stringify(this.mod.room_obj)
		);

		let url1 = window.location.origin + '/videocall/';

		this.old_title = document.title;

		if (this.full_screen) {
			window.history.pushState(
				{},
				'',
				`${url1}?stun_video_chat=${base64obj}`
			);
			document.title = 'Saito Talk';
		}

		return `${url1}?stun_video_chat=${base64obj}`;
	}

	copyInviteLink() {
		navigator.clipboard.writeText(this.room_link);
		siteMessage('Invite link copied to clipboard', 1500);
	}

	addRemoteStream(peer, remoteStream) {

		this.createVideoBox(peer);
		this.video_boxes[peer].video_box.render(remoteStream);

		//
		// Check if newly added remote stream is muted
		// TODO -- this doesn't pick up if the audio is disabled/muted for some GD reason!!!!
		//
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
	}

	addLocalStream(localStream) {
		console.log('Add local stream');

		this.createVideoBox('local', this.local_container);
		this.video_boxes['local'].video_box.render(localStream);
		this.localStream = localStream;
		this.updateImages();

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
			document
				.querySelector('.audio-control')
				.classList.toggle('disabled');
			document
				.querySelector('.audio-control i')
				.classList.toggle('fa-microphone-slash');
			document
				.querySelector('.audio-control i')
				.classList.toggle('fa-microphone');
		} catch (err) {
			console.warn('Stun UI error', err);
		}
	}

	toggleVideo() {
		this.app.connection.emit('stun-toggle-video');

		//Update UI
		try {
			document
				.querySelector('.video-control')
				.classList.toggle('disabled');
			document
				.querySelector('.video-control i')
				.classList.toggle('fa-video-slash');
			document
				.querySelector('.video-control i')
				.classList.toggle('fa-video');
		} catch (err) {
			console.warn('Stun UI error', err);
		}
	}

	updateImages() {
		let images = ``;
		let count = 0;
		for (let i in this.video_boxes) {
			if (i === 'presentation') {
				continue;
			}

			let publickey = i;
			if (i === 'local') {
				publickey = this.mod.publicKey;
			}

			let imgsrc = this.app.keychain.returnIdenticon(publickey);
			images += `<img data-id ="${i}" class="saito-identicon" src="${imgsrc}"/>`;
			count++;
		}
		document.querySelector(
			'.users-on-call .stun-identicon-list'
		).innerHTML = images;
		document.querySelector(
			'.users-on-call .users-on-call-count'
		).innerHTML = count;
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

		container.innerHTML = ``;
		container.classList.remove('split-view');
		container.classList.add('gallery');

		this.setDisplayContainers();
	}

	switchDisplayToExpanded() {
		this.local_container = 'expanded-video';
		this.remote_container = 'side-videos';

		let container = document.querySelector('.video-container-large');

		container.innerHTML = `<div class="expanded-video"></div>
    <div class="side-videos"></div>`;
		container.classList.add('split-view');
		container.classList.remove('gallery');

		this.setDisplayContainers();
	}

	swicthDisplayToPresentation() {
		this.local_container = 'presentation';
		this.remote_container = 'presentation-side-videos';

		let container = document.querySelector('.video-container-large');

		container.innerHTML = `<div class="presentation"></div>
    <div class="presentation-side-videos"></div>`;
		container.classList.add('split-view');
		container.classList.remove('gallery');

		this.setDisplayContainers();
	}

	setDisplayContainers() {
		for (let i in this.video_boxes) {
			if (i === 'local') {
				this.video_boxes[i].video_box.containerClass =
					this.local_container;
				this.video_boxes[i].video_box.render(this.localStream);
			} else {
				this.video_boxes[i].video_box.containerClass =
					this.remote_container;
				this.video_boxes[i].video_box.render(
					this.remote_streams.get(i)
				);
			}
		}
	}
}

module.exports = CallInterfaceVideo;
