const AudioBoxTemplate = require('./audio-box.template');
const { setTextRange } = require('typescript');

/**
 *
 *  Audio Box is a hook for a voice call, it adds an <audio> element to the DOM
 *  and can display the identicons of the people involved in the call
 *
 */

class AudioBox {
	constructor(app, mod, stream_id, container) {
		this.app = app;
		this.mod = mod;
		this.stream_id = stream_id;
		this.container = container;
		this.stream = null;

		app.connection.on(
			'peer-toggle-audio-status',
			({ enabled, public_key }) => {
				if (public_key !== this.stream_id) return;

				console.log('peer-toggle-audio-status', enabled);

				const audio_box = document.getElementById(
					`audiostream_${this.stream_id}`
				);
				if (audio_box) {
					let element =
						audio_box.querySelector(`.fa-microphone-slash`);

					if (!enabled) {
						if (!element) {
							audio_box.insertAdjacentHTML(
								'beforeend',
								`<i class="fa fa-microphone-slash"></i>`
							);
						}
						audio_box.classList.add('muted');
					} else {
						if (element) {
							element.remove();
						}
						audio_box.classList.remove('muted');
					}
				}
			}
		);
	}

	render(stream) {
		this.stream = stream;
		console.log(stream, 'stream');

		if (!document.getElementById(`audiostream_${this.stream_id}`)) {
			this.app.browser.addElementToSelector(
				AudioBoxTemplate(this.app, this.mod, this.stream_id),
				this.container
			);
		}

		const audioBox = document.getElementById(
			`audiostream_${this.stream_id}`
		);
		audioBox.firstElementChild.srcObject = this.stream;
	}

	remove() {
		let audio_box = document.getElementById(
			`audiostream_${this.stream_id}`
		);
		if (audio_box) {
			audio_box.remove();
		}
	}
}

module.exports = AudioBox;
