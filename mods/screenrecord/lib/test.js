// In Record class
class Record extends ModTemplate {
  constructor(app) {
    super(app);
    // ... other initializations ...
    this.videoBox = null;
  }

  // ... other methods ...

  getOrCreateVideoBox(includeCamera) {
    if (!this.videoBox && includeCamera) {
      this.videoBox = new VideoBox(this.app, this, 'local');
      let videoElement = document.querySelector('.video-box-container-large');
      if (videoElement) {
        videoElement.style.position = 'absolute';
        videoElement.style.top = '100px';
        videoElement.style.width = '350px';
        videoElement.style.height = '350px';
        this.app.browser.makeDraggable('stream_local');
      }
    }
    return this.videoBox;
  }

  removeVideoBox() {
    if (this.videoBox) {
      this.videoBox.remove();
      this.videoBox = null;
    }
  }
}

// In StreamCapturer class
class StreamCapturer {
  constructor(app, mod, logo) {
    // ... other initializations ...
    this.mod = mod; // Ensure this is set in the constructor
  }

  // ... other methods ...

  async getVideoBox(includeCamera) {
    const streams = this.app.modules.getRespondTos('media-request');
    if (streams.length === 0) {
      if (includeCamera) {
        if (!this.mod.videoBox) {
          try {
            this.localStream = await navigator.mediaDevices.getUserMedia({
              video: true,
              audio: true
            });
            if (this.localStream && this.localStream.getAudioTracks().length > 0) {
              let localAudio = this.audioCtx.createMediaStreamSource(this.localStream);
              localAudio.connect(this.mixer);
            }
          } catch (error) {
            console.error('Failed to get user media:', error);
            alert('Failed to access camera and microphone.');
            return;
          }
          this.mod.getOrCreateVideoBox(true);
          this.mod.videoBox.render(this.localStream);
        }
      } else {
        this.mod.removeVideoBox();
      }
    }
  }

  async getExistingStreams(includeCamera) {
    try {
      const streams = this.app.modules.getRespondTos('media-request');
      if (streams.length > 0) {
        // ... existing code ...
      } else {
        try {
          if (includeCamera) {
            try {
              this.localStream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
              });
              if (this.localStream && this.localStream.getAudioTracks().length > 0) {
                let localAudio = this.audioCtx.createMediaStreamSource(this.localStream);
                localAudio.connect(this.mixer);
              }
            } catch (error) {
              console.error('Failed to get user media:', error);
              alert('Failed to access camera and microphone.');
              return;
            }
            this.mod.getOrCreateVideoBox(true);
            this.mod.videoBox.render(this.localStream);
          } else {
            // ... existing code for audio-only ...
          }
        } catch (error) {
          console.error('Access to user media denied: ', error);
          salert('Recording will continue without camera and/or microphone input');
        }
      }
    } catch (error) {
      console.error('Error in getExistingStreams:', error);
      throw error;
    }
  }

  stopCaptureGameStream() {
    // ... existing cleanup code ...

    // Update VideoBox removal
    this.mod.removeVideoBox();

    // ... rest of the cleanup code ...
  }
}