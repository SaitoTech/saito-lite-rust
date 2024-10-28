const SettingsTemplate = require('./stun-settings.template');

class Settings {
	constructor(app, mod, container = '.saito-module-settings') {
		this.app = app;
		this.mod = mod;
		this.container = container;
	}

	render() {
		this.app.browser.addElementToSelector(
			SettingsTemplate(this.app, this.mod),
			this.container
		);

		if (this.mod?.streams?.localStream){
			this.loadMediaDevices(this.mod.streams.localStream);
		}
		this.attachEvents();
	}

	async loadMediaDevices(currentStream) {
		const devices = await navigator.mediaDevices.enumerateDevices();
		const videoInput = document.getElementById('video-input');
		const audioInput = document.getElementById('audio-input');

		let currentVideo, currentAudio;

		const used_devices = currentStream.getTracks()
		  .map( (track) => track.getSettings().deviceId );

		let videoCt = 0;
		let audioCt = 0;
		devices.forEach((device) => {
			const option = document.createElement('option');
			option.value = device.deviceId;
			if (used_devices.includes(option.value)){
				option.selected = "true";
			}
			option.textContent =
				device.label || `${device.kind} - ${device.deviceId}`;
			if (device.kind === 'videoinput' && videoInput) {

				videoCt++;
				videoInput.appendChild(option);
			} else if (device.kind === 'audioinput' && audioInput) {
				audioCt++;
				audioInput.appendChild(option);
			}
		});
		if (videoCt > 1){
			videoInput.style.display = "flex";
			document.querySelector(".stun-input-settings legend").style.display = "block";
		}
		if (audioCt > 1){
			audioInput.style.display = "flex";
			document.querySelector(".stun-input-settings legend").style.display = "block";
		}


		if (videoInput){
			videoInput.addEventListener('change', () => this.mod.streams.updateInputs("video", videoInput.value));
		}

		if (audioInput){
			audioInput.addEventListener('change', () => this.mod.streams.updateInputs("audio", audioInput.value));
		}

	}


	attachEvents() {
		let settings_self = this;
		Array.from(
			document.querySelectorAll('input[name=\'stun-privacy\']')
		).forEach((radio) => {
			radio.addEventListener('change', (e) => {
				if (
					e.currentTarget.value !==
					this.app.options.stun.settings.privacy
				) {
					this.app.options.stun.settings.privacy =
						e.currentTarget.value;
					this.app.storage.saveOptions();
				}
			});
		});
	}
}

module.exports = Settings;
