const videoBoxTemplate = require('./video-box.template');

class VideoBox {
	constructor(app, mod, peer, container_class = '') {
		this.app = app;
		this.mod = mod;
		this.stream = null;
		this.stream_id = peer;
		this.containerClass = container_class;
		this.peer_list = [];
		this.video_class = '';

		app.connection.on(
			'peer-toggle-audio-status',
			({ enabled, public_key }) => {
				if (public_key !== this.stream_id) return;

				console.log('peer-toggle-audio-status', public_key, enabled);

				const video_box = document.getElementById(
					`stream_${this.stream_id}`
				);
				if (video_box.querySelector(`.video-call-info`)) {
					let element = video_box.querySelector(
						`.video-call-info .fa-microphone-slash`
					);

					if (!enabled && !element) {
						video_box
							.querySelector(`.video-call-info`)
							.insertAdjacentHTML(
								'beforeend',
								`<i class="fa fa-microphone-slash"> </i>`
							);
					} else {
						if (element) {
							element.remove();
						}
					}
				}
			}
		);
		app.connection.on(
			'peer-toggle-video-status',
			({ enabled, public_key }) => {
				if (public_key !== this.stream_id) return;

				console.log('peer-toggle-video-status', public_key, enabled);

				const video_box = document.getElementById(
					`stream_${this.stream_id}`
				);
				if (video_box.querySelector(`.video-call-info`)) {
					let element = video_box.querySelector(
						`.video-call-info .fa-video-slash`
					);

					if (!enabled && !element) {
						video_box
							.querySelector(`.video-call-info`)
							.insertAdjacentHTML(
								'beforeend',
								`<i class="fas fa-video-slash"> </i>`
							);
					} else {
						if (element) {
							element.parentElement.removeChild(element);
						}
					}
				}
			}
		);

				this.app.connection.on(
			'stun-update-connection-message',
			(peer_id, status) => {
				if (!this.stream_id !== peer_id) {
					return;
				}

				if (status === 'connecting') {
					this.updateConnectionMessage('connecting');
				} else if (status === 'connected') {
					this.removeConnectionMessage();
				} else if (status === 'disconnected') {
					this.updateConnectionMessage('retrying connection');
				}
			}
		);


		app.connection.on('peer-list', (address, list) => {
			if (address !== this.stream_id) {
				return;
			}

			//Save the list in case we change the video display and re-render
			this.peer_list = list;
			this.renderPeerList();
		});
	}

	attachEvents() {}

	render(stream = null) {
		if (stream) {
			this.stream = stream;
		}

		//Add Video Box
		if (!document.getElementById(`stream_${this.stream_id}`)) {
			this.app.browser.addElementToClass(
				videoBoxTemplate(
					this.stream_id,
					this.app,
					this.mod,
					this.video_class
				),
				this.containerClass
			);
		
			this.attachEvents();
		}

		if (this.stream){
			this.removeConnectionMessage();
			const videoBoxVideo = document.querySelector(`#stream_${this.stream_id} video`);

			videoBoxVideo.addEventListener('play', (event) => {
					console.log(
						this.stream_id + ' Begin Playing Video:',
						event.currentTarget.videoWidth,
						event.currentTarget.videoHeight
					);
					if (
						event.currentTarget.videoHeight >
						event.currentTarget.videoWidth
					) {
						console.log('Portrait Video!');
						event.currentTarget.parentElement.classList.add(
							'portrait'
						);
					} else {
						console.log('Landscape Video!');
						event.currentTarget.parentElement.classList.remove(
							'portrait'
						);
					}
				});

			videoBoxVideo.srcObject = this.stream;
		} else {
			this.updateConnectionMessage();
		}

	}

	rerender() {
		this.remove();
		this.render(this.stream);
		this.renderPeerList();
	}

	renderPeerList() {

		if (this.stream_id === 'local') return;

		const callList = document.querySelector(
			`.peer-call-list[data-id="${this.stream_id}"]`
		);

		if (!callList) {
			console.error(
				'Call list element not found for the given key:',
				this.stream_id
			);
			return;
		}

		callList.innerHTML = '';


		for (let address in this.peer_list){
			let connectionState = this.peer_list[address];
			let identiconUrl = this.app.keychain.returnIdenticon(address);

			const img = document.createElement('img');
			img.src = identiconUrl;
			img.alt = `Identicon for ${address}`;

			img.classList.add('peer-list-item');
			if (connectionState !== 'connected') {
				img.classList.add('not-connected');
			}
			img.classList.add('saito-identicon');
			img.setAttribute('data-id', address);

			callList.appendChild(img);
		}

	}


	updateConnectionMessage(message = 'negotiating peer connection') {
		const video_box = document.getElementById(`stream_${this.stream_id}`);
		if (video_box.querySelector('#connection-message')) {
			video_box.querySelector(
				'#connection-message'
			).innerHTML = `<p>${message}</p> <span class="lds-dual-ring"> </span> `;
		} else {
			video_box.insertAdjacentHTML(
				'beforeend',
				`<div id="connection-message"> <p> ${message} </p> <span class="lds-dual-ring"> </span></div> `
			);
		}
	}

	removeConnectionMessage() {
		const video_box = document.getElementById(`stream_${this.stream_id}`);
		if (video_box && video_box.querySelector('#connection-message')) {
			video_box.querySelector('#connection-message').remove();
		}
	}

	//
	// this needs fixing!!
	//
	remove(is_disconnection = false) {
		let videoBox = document.getElementById(`stream_${this.stream_id}`);
		if (videoBox) {
			if (is_disconnection) {
				if (
					videoBox.parentElement.classList.contains('expanded-video')
				) {
					videoBox.remove();
					try {
						this.mod.CallInterface.video_boxes[
							'local'
						].video_box.containerClass = 'expanded-video';
						this.mod.CallInterface.video_boxes[
							'local'
						].video_box.rerender();
					} catch (err) {}
					return;
				}
			}
			videoBox.remove();
		}
	}
}

module.exports = VideoBox;
