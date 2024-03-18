const videoBoxTemplate = require('./video-box.template');

class VideoBox {
	constructor(app, mod, peer, container_class = '') {
		this.app = app;
		this.mod = mod;
		this.stream = null;
		this.stream_id = peer;
		this.containerClass = container_class;

		app.connection.on(
			'peer-toggle-audio-status',
			({ enabled, public_key }) => {
				if (public_key !== this.stream_id) return;

				console.log('peer-toggle-audio-status', enabled);

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

				console.log('peer-toggle-video-status', enabled);

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

		app.connection.on('peer-list', (address, list) => {
			if (address !== this.stream_id) {
				return;
			}

			this.renderCallList(list);
		});
	}

	attachEvents() {}

	render(stream = null) {
		if (stream) {
			this.stream = stream;

			this.removeConnectionMessage();

			console.log(this.stream_id, this.containerClass);

			//Add Video Box
			if (!document.getElementById(`stream_${this.stream_id}`)) {
				this.app.browser.addElementToClass(
					videoBoxTemplate(this.stream_id, this.app, this.mod),
					this.containerClass
				);

				document
					.querySelector(`#stream_${this.stream_id} video`)
					.addEventListener('play', (event) => {
						console.log(
							'Begin Playing Video:',
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
			}

			const videoBox = document.getElementById(
				`stream_${this.stream_id}`
			);
			videoBox.firstElementChild.srcObject = this.stream;
		} else {
			this.renderPlaceholder();
		}

		this.attachEvents();
	}

	rerender() {
		this.remove();
		this.render(this.stream);
	}

	renderCallList(list) {
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

		list.forEach((address) => {
			// Generate identicon URL for the address
			let identiconUrl = this.app.keychain.returnIdenticon(address);

			// Create an image element for the identicon
			const img = document.createElement('img');
			img.src = identiconUrl;
			img.alt = `Identicon for ${address}`;
			img.classList.add('peer-list-item');
			// Optionally set a class for styling
			img.classList.add('identicon');

			// Append the image to the list item

			// Optionally, add the address text or other elements to the list item
			// For example: listItem.appendChild(document.createTextNode(address));

			// Append the list item to the call list
			callList.appendChild(img);
		});
	}

	renderPlaceholder(placeholder_info = 'negotiating peer connection') {
		if (!document.getElementById(`stream_${this.stream_id}`)) {
			this.app.browser.addElementToClass(
				videoBoxTemplate(this.stream_id, this.app, this.mod),
				this.containerClass
			);
		}
		this.updateConnectionMessage(placeholder_info);
	}

	updateConnectionMessage(message) {
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
			video_box
				.querySelectorAll('#connection-message')
				.forEach((item) => {
					item.parentElement.removeChild(
						video_box.querySelector('#connection-message')
					);
				});
		}

		// if it's in the expanded div, replace
	}

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
