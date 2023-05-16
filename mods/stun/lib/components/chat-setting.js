

const ChatSettingTemplate = require("./chat-setting.template");

class ChatSetting {
  videoStream = null;
  audioStream = null;
  videoEnabled = true;
  audioEnabled = true;
  isRecording = false;
  recordedChunks = [];
  mediaRecorder;
  recordedAudio = null;
  isPlaying = false;

  constructor(app, mod) {
    this.app = app;
    this.mod = mod;

    app.connection.on("show-chat-setting", (room_code) => {
      if (room_code) {
        this.room_code = room_code;
      }

      this.render();
    });

    app.connection.on("join-meeting", (to_join) => {
      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track) => {
          track.stop();
          console.log(track);
          console.log("stopping audio track");
        });
      }

      if (this.videoStream) {
        this.videoStream.getTracks().forEach((track) => {
          track.stop();
          console.log(track);
          console.log("stopping video track");
        });
      }

      this.remove();
      this.app.connection.emit("show-chat-manager-large", to_join);
    });
  
    app.connection.on("cancel-meeting", ()=>{
      if (this.audioStream) {
        this.audioStream.getTracks().forEach((track) => {
          track.stop();
          console.log(track);
          console.log("stopping audio track");
        });
      }

      if (this.videoStream) {
        this.videoStream.getTracks().forEach((track) => {
          track.stop();
          console.log(track);
          console.log("stopping video track");
        });
      }

      this.remove();
    });
  }

  render() {
    this.app.browser.addElementToClass(
      ChatSettingTemplate(this.app, this.mod),
      "stun-appspace-settings"
    );
    this.attachEvents(this.app, this.mod);
  }

  remove() {
    if (document.querySelector(".chat-settings-container")) {
      document
        .querySelector(".chat-settings-container")
        .parentElement.removeChild(document.querySelector(".chat-settings-container"));
    }
  }

  attachEvents(app, mod) {
    let videoElement = document.getElementById("video");
    let toggleVideoButton = document.getElementById("toggle-video");
    let toggleAudioButton = document.getElementById("toggle-audio");
    this.videoInput = document.getElementById("video-input");
    this.audioInput = document.getElementById("audio-input");
    let testMicButton = document.getElementById("test-mic");
    let audioProgress = document.getElementById("audio-progress");
    let togglePlayback = document.getElementById("toggle-playback");

    testMicButton.addEventListener("click", () =>
      this.testMicrophone(testMicButton, audioProgress)
    );

    toggleVideoButton.addEventListener("click", () => {
      if(!this.videoStream) return;
      if (this.videoEnabled) {
        this.videoStream.getVideoTracks()[0].enabled = false;
        toggleVideoButton.classList.remove("fa-video");
        toggleVideoButton.classList.add("fa-video-slash");
      } else {
        this.videoStream.getVideoTracks()[0].enabled = true;
        toggleVideoButton.classList.remove("fa-video-slash");
        toggleVideoButton.classList.add("fa-video");
      }

      this.videoEnabled = !this.videoEnabled;
      const notification = this.videoEnabled ? "Video enabled" : "Video disabled";
      siteMessage(notification, 3000);

      app.connection.emit("update-media-preference", "video", this.videoEnabled);
    });

    toggleAudioButton.addEventListener("click", () => {
      if (this.audioEnabled) {
        this.audioStream.getAudioTracks()[0].enabled = false;
        toggleAudioButton.classList.remove("fa-microphone");
        toggleAudioButton.classList.add("fa-microphone-slash");
      } else {
        this.audioStream.getAudioTracks()[0].enabled = true;
        toggleAudioButton.classList.remove("fa-microphone-slash");
        toggleAudioButton.classList.add("fa-microphone");
      }
      this.audioEnabled = !this.audioEnabled;
      const notification = this.audioEnabled ? "Audio enabled" : "Audio disabled";
      siteMessage(notification, 3000);
      app.connection.emit("update-media-preference", "audio", this.audioEnabled);
    });

    this.videoInput.addEventListener("change", () => this.updateMedia("video", videoElement));
    this.audioInput.addEventListener("change", () => this.updateMedia("audio", videoElement));

    togglePlayback.addEventListener("click", () => {
      const iconElement = document.getElementById("toggle-playback");

      if (iconElement.classList.contains("fa-play")) {
        iconElement.classList.remove("fa-play");
        iconElement.classList.add("fa-pause");

        if (this.recordedAudio) {
          this.recordedAudio.play();
          this.updateAudioProgress(audioProgress);
        }
      } else {
        iconElement.classList.remove("fa-pause");
        iconElement.classList.add("fa-play");
        if (this.recordedAudio) {
          this.recordedAudio.pause();
        }
      }
    });

    document.getElementById("join-button").addEventListener("click", () => {});

    this.getUserMedia(videoElement);
  }

  async getUserMedia(videoElement) {
    try {
      this.audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (error) {
      console.error("Error accessing media devices.", error);
      salert("Error access media devices, please check your permissions");
    }

    
    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoElement.srcObject = this.videoStream;
      this.videoEnabled = true
      this.app.connection.emit("update-media-preference", "video", this.videoEnabled);
    } catch (error) {
      this.videoStream = null;
      this.videoEnabled = false
      this.app.connection.emit("update-media-preference", "video", this.videoEnabled);
      salert("Error access camera, using audio only mode ");
    }

    this.loadMediaDevices();
  }

  async loadMediaDevices() {
    const devices = await navigator.mediaDevices.enumerateDevices();
    devices.forEach((device) => {
      const option = document.createElement("option");
      option.value = device.deviceId;
      option.textContent = device.label || `${device.kind} - ${device.deviceId}`;
      if (device.kind === "videoinput") {
        this.videoInput.appendChild(option);
      } else if (device.kind === "audioinput") {
        this.audioInput.appendChild(option);
      }
    });
  }

  async updateMedia(kind, videoElement) {
    const constraints =
      kind === "video"
        ? { video: { deviceId: this.videoInput.value } }
        : { audio: { deviceId: this.audioInput.value } };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    if (kind === "video") {
      if(!this.videoStream ) return
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
      testMicButton.textContent = "Stop Test";
      this.recordedChunks = [];
      const options = { mimeType: "audio/webm" };
      this.mediaRecorder = new MediaRecorder(this.audioStream, options);
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "audio/webm" });
        const audioURL = URL.createObjectURL(blob);
        this.recordedAudio = new Audio(audioURL);
        this.updateAudioProgress(audioProgress);
      };
      this.mediaRecorder.start();
    } else {
      this.isRecording = false;
      testMicButton.textContent = "Test Microphone";
      this.mediaRecorder.stop();
    }
  }

  updateAudioProgress(audioProgress) {
    if (this.recordedAudio) {
      this.recordedAudio.addEventListener("loadedmetadata", () => {
        this.recordedAudio.ontimeupdate = () => {
          const currentTime = this.formatTime(this.recordedAudio.currentTime);
          const duration =
            isNaN(this.recordedAudio.duration) || this.recordedAudio.duration === Infinity
              ? "Loading..."
              : this.formatTime(this.recordedAudio.duration);

          audioProgress.textContent = `${currentTime} / ${duration}`;

          // Update progress bar
          let progressBar = document.getElementById("progress");
          const progressPercentage =
            (this.recordedAudio.currentTime / this.recordedAudio.duration) * 100;
          progressBar.style.width = `${progressPercentage}%`;
        };
      });
    }
  }

  formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
}

module.exports = ChatSetting;

