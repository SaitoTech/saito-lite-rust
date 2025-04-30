const CallSettingTemplate = require('./call-setting.template');
const SaitoOverlay = require('../../../../lib/saito/ui/saito-overlay/saito-overlay.js');

/**
 *
 * This is the part of the splash screen where you can check your camera
 * and mute your self before creating or joining a meeting
 *
 * There are (currently disabled) functions to test your mic by recording a brief message
 */

class CallSetting {

	constructor(app, mod) {
		this.app = app;
		this.mod = mod;
		this.overlay = new SaitoOverlay(app, mod);
		this.videoStream = null;
		this.audioStream = null;
		this.videoEnabled = true;
		this.audioEnabled = true;
		this.isRecording = false;
		this.recordedChunks = [];
		this.mediaRecorder;
		this.recordedAudio = null;
		this.isPlaying = false;
	}

	render() {

		this.overlay.show(CallSettingTemplate(this), ()=> {this.remove()});

		let previewWindow = document.getElementById('preview-video');
		if (previewWindow){
			this.getUserMedia(previewWindow);	
		}else{
			//console.error("No video element to display user media");
		}
		
	}

	remove() {
		if (this.audioStream) {
			this.audioStream.getTracks().forEach((track) => {
				track.stop();
				console.log('stopping audio track');
			});
		}

		if (this.videoStream) {
			this.videoStream.getTracks().forEach((track) => {
				track.stop();
				console.log(track);
				console.log('stopping video track');
			});
		}

	}

	attachEvents(videoElement) {
		
		let toggleVideoButton = document.getElementById('toggle-video');
		let toggleAudioButton = document.getElementById('toggle-audio');
		this.videoInput = document.getElementById('video-input');
		this.audioInput = document.getElementById('audio-input');
		let testMicButton = document.getElementById('test-mic');
		let audioProgress = document.getElementById('audio-progress');
		let togglePlayback = document.getElementById('toggle-playback');

		if (testMicButton) {
			testMicButton.addEventListener('click', () =>
				this.testMicrophone(testMicButton, audioProgress)
			);
		}

		if (toggleVideoButton) {
			toggleVideoButton.addEventListener('click', () => {
				if (!this.videoStream) return;
				if (this.videoEnabled) {
					this.videoStream.getVideoTracks()[0].enabled = false;
					toggleVideoButton.classList.remove('fa-video');
					toggleVideoButton.classList.add('fa-video-slash');
				} else {
					this.videoStream.getVideoTracks()[0].enabled = true;
					toggleVideoButton.classList.remove('fa-video-slash');
					toggleVideoButton.classList.add('fa-video');
				}

				this.videoEnabled = !this.videoEnabled;
				const notification = this.videoEnabled
					? 'Video enabled'
					: 'Video disabled';
				siteMessage(notification, 3000);

			});
		}

		if (toggleAudioButton) {
			toggleAudioButton.addEventListener('click', () => {
				if (this.audioEnabled) {
					this.audioStream.getAudioTracks()[0].enabled = false;
					toggleAudioButton.classList.remove('fa-microphone');
					toggleAudioButton.classList.add('fa-microphone-slash');
				} else {
					this.audioStream.getAudioTracks()[0].enabled = true;
					toggleAudioButton.classList.remove('fa-microphone-slash');
					toggleAudioButton.classList.add('fa-microphone');
				}
				this.audioEnabled = !this.audioEnabled;
				const notification = this.audioEnabled
					? 'Audio enabled'
					: 'Audio disabled';
				siteMessage(notification, 3000);

			});
		}

		if (this.videoInput){
			this.videoInput.addEventListener('change', () => {
				this.updateMedia('video', videoElement);
			    this.app.options.stun.settings[`preferred_video`] = this.videoInput.value;
			    this.app.storage.saveOptions();
				}
			);
		}

		if (this.audioInput){
			this.audioInput.addEventListener('change', () => {
				this.updateMedia('audio', videoElement);
			    this.app.options.stun.settings[`preferred_audio`] = this.audioInput.value;
			    this.app.storage.saveOptions();
			}
			);
		}

		if (togglePlayback) {
			togglePlayback.addEventListener('click', () => {
				const iconElement = document.getElementById('toggle-playback');

				if (iconElement.classList.contains('fa-play')) {
					iconElement.classList.remove('fa-play');
					iconElement.classList.add('fa-pause');

					if (this.recordedAudio) {
						this.recordedAudio.play();
						this.updateAudioProgress(audioProgress);
					}
				} else {
					iconElement.classList.remove('fa-pause');
					iconElement.classList.add('fa-play');
					if (this.recordedAudio) {
						this.recordedAudio.pause();
					}
				}
			});
		}

	}

	async getUserMedia(videoElement) {

		// check saved preferences...
		let audioConstraints = {
				audio: true
			};

		let videoConstraints = {
				video: {
					width: { min: 640, max: 1280 },
					height: { min: 400, max: 720 },
					aspectRatio: { ideal: 1.333333 }
				}
			};

		if (this.app.options.stun?.settings?.preferred_audio){
			audioConstraints.audio["deviceId"] = this.app.options.stun.settings.preferred_audio;
		}
		if (this.app.options.stun?.settings?.preferred_video){
			videoConstraints.video["deviceId"] = this.app.options.stun.settings.preferred_video;
		}

		try {
			this.audioStream = await navigator.mediaDevices.getUserMedia(audioConstraints);
			this.audioEnabled = true;
		} catch (error) {
			console.error('Error accessing media devices.', error);
			salert('Error access media devices, please check your permissions');
		}

		try {
			this.videoStream = await navigator.mediaDevices.getUserMedia(videoConstraints);
			videoElement.srcObject = this.videoStream;
			this.videoEnabled = true;
		} catch (error) {
			console.warn(error);
			this.videoStream = null;
			this.videoEnabled = false;
			salert('Error access camera, using audio only mode ');
		}

		this.attachEvents();
		return this.loadMediaDevices();
	}

	async loadMediaDevices() {
		const devices = await navigator.mediaDevices.enumerateDevices();
		let videoCt = 0;
		let audioCt = 0;
		devices.forEach((device) => {
			const option = document.createElement('option');
			option.value = device.deviceId;
			option.textContent =
				device.label || `${device.kind} - ${device.deviceId}`;
			if (device.kind === 'videoinput' && this.videoInput) {
				if (device.deviceId === this.app.options.stun?.settings?.preferred_video){
					option.selected = true;
				}
				videoCt++;
				this.videoInput.appendChild(option);
			} else if (device.kind === 'audioinput' && this.audioInput) {
				if (device.deviceId === this.app.options.stun?.settings?.preferred_audio){
					option.selected = true;
				}
				audioCt++;
				this.audioInput.appendChild(option);
			}
		});
		if (videoCt > 1){
			this.videoInput.style.display = "flex";
			document.querySelector(".stun-input-settings legend").style.display = "block";
		}
		if (audioCt > 1){
			this.audioInput.style.display = "flex";
			document.querySelector(".stun-input-settings legend").style.display = "block";
		}
	}

	async updateMedia(kind, videoElement) {
		const constraints =
			kind === 'video'
				? { video: { deviceId: this.videoInput.value } }
				: { audio: { deviceId: this.audioInput.value } };

		const stream = await navigator.mediaDevices.getUserMedia(constraints);

		if (kind === 'video') {
			if (!this.videoStream) return;
			this.videoStream.getVideoTracks()[0].stop();
			this.videoStream = stream;
			videoElement.srcObject = this.videoStream;
		} else {
			this.audioStream.getAudioTracks()[0].stop();
			this.audioStream = stream;
		}
	}

	testMicrophone(testMicButton, audioProgress) {
		if (!this.isRecording) {
			this.isRecording = true;
			testMicButton.textContent = 'Stop Test';
			this.recordedChunks = [];
			const options = { mimeType: 'audio/webm' };
			this.mediaRecorder = new MediaRecorder(this.audioStream, options);
			this.mediaRecorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					this.recordedChunks.push(event.data);
				}
			};
			this.mediaRecorder.onstop = () => {
				const blob = new Blob(this.recordedChunks, {
					type: 'audio/webm'
				});
				const audioURL = URL.createObjectURL(blob);
				this.recordedAudio = new Audio(audioURL);
				this.updateAudioProgress(audioProgress);
			};
			this.mediaRecorder.start();
		} else {
			this.isRecording = false;
			testMicButton.textContent = 'Test Microphone';
			this.mediaRecorder.stop();
		}
	}

	updateAudioProgress(audioProgress) {
		if (this.recordedAudio) {
			this.recordedAudio.addEventListener('loadedmetadata', () => {
				this.recordedAudio.ontimeupdate = () => {
					const currentTime = this.formatTime(
						this.recordedAudio.currentTime
					);
					const duration =
						isNaN(this.recordedAudio.duration) ||
						this.recordedAudio.duration === Infinity
							? 'Loading...'
							: this.formatTime(this.recordedAudio.duration);

					audioProgress.textContent = `${currentTime} / ${duration}`;

					// Update progress bar
					let progressBar = document.getElementById('progress');
					const progressPercentage =
						(this.recordedAudio.currentTime /
							this.recordedAudio.duration) *
						100;
					progressBar.style.width = `${progressPercentage}%`;
				};
			});
		}
	}

	formatTime(time) {
		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes.toString().padStart(2, '0')}:${seconds
			.toString()
			.padStart(2, '0')}`;
	}

	returnSettings(){
		//Use defaults if unopened...
		let ui = 'large'; //this.mod.browser_active ? 'large' : 'video';

		// True / from options
		let video = this.app.options.stun?.settings?.preferred_video || true;
		let audio = this.app.options.stun?.settings?.preferred_audio || true;

		// Read from DOM
		if (this.videoInput) {
			video = { deviceId: this.videoInput.value };
			audio = { deviceId: this.audioInput.value };
		}

		// User disabled
		if (!this.videoEnabled){
			video = false;
		}
		if (!this.audioEnabled){
			audio = false;
		}

		return { ui, video, audio };

	}
}

module.exports = CallSetting;
