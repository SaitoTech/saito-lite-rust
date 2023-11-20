const VideoBox = require("../components/video-box");

class StreamManager {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.localStream = null; // My Video Feed
    this.mediaRecorder = null;
    this.canvasStream = null; // The stream from the canvas
  }

  async recordGameStream(includeCamera = false) {
    try {
      let screenStream = null;
      let cameraStream = null;

      // Attempt to get the screen stream
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: "screen" },
          audio: true,
        });
      } catch (error) {
        console.error("Access to screen denied: ", error);
        salert("Screen recording permission is required.");
        return;
      }

      if (includeCamera) {
        try {
          cameraStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true, // Capture microphone audio
          });
          this.localStream = cameraStream;
          this.videoBox = new VideoBox(this.app, this.mod, "local");
          this.videoBox.render(this.localStream);
          let videoElement = document.querySelector(".video-box-container-large");
          videoElement.style.position = "absolute";
          videoElement.style.top = "100px";
          videoElement.style.width = "350px";
          videoElement.style.height = "350px";
          this.app.browser.makeDraggable("streamlocal");
        } catch (error) {
          console.error("Access to camera denied: ", error);
          salert("Camera and microphone access is required.");
          return;
        }
      }

      const videoElemScreen = document.createElement("video");
      videoElemScreen.srcObject = screenStream;
      videoElemScreen.muted = true;
      videoElemScreen.play();

      const videoElemCamera = document.createElement("video");
      if (includeCamera) {
        videoElemCamera.srcObject = cameraStream;
        videoElemCamera.muted = true;
        videoElemCamera.play();
      }

      // Wait for the video metadata to load
      await Promise.all([
        new Promise((resolve) => (videoElemScreen.onloadedmetadata = resolve)),
        includeCamera
          ? new Promise((resolve) => (videoElemCamera.onloadedmetadata = resolve))
          : Promise.resolve(),
      ]);

      // Now that we have the video dimensions, set up the canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = videoElemScreen.videoWidth + (includeCamera ? videoElemCamera.videoWidth : 0);
      canvas.height = Math.max(
        videoElemScreen.videoHeight,
        includeCamera ? videoElemCamera.videoHeight : 0
      );

      // Draw function
      const drawCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(videoElemScreen, 0, 0);
        if (includeCamera) {
          ctx.drawImage(videoElemCamera, videoElemScreen.videoWidth, 0);
        }
        requestAnimationFrame(drawCanvas);
      };

      // Start the drawing loop
      drawCanvas();

      // Set up the media recorder with the canvas stream
      // Create a new stream for the combined video and audio
      const combinedStream = new MediaStream();

      // Add the canvas' video stream to the combined stream
      canvas
        .captureStream()
        .getVideoTracks()
        .forEach((track) => {
          combinedStream.addTrack(track);
        });

      // Add the audio tracks from the screen and camera to the combined stream
      if (screenStream.getAudioTracks().length > 0) {
        combinedStream.addTrack(screenStream.getAudioTracks()[0]);
      }
      if (cameraStream && cameraStream.getAudioTracks().length > 0) {
        combinedStream.addTrack(cameraStream.getAudioTracks()[0]);
      }
      this.canvasStream = canvas.captureStream();
      const chunks = [];
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm; codecs=vp9",
      });

      // When data is available, push it to the chunks array
      this.mediaRecorder.ondataavailable = function (e) {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // When the recording stops, create a video file
      this.mediaRecorder.onstop = async () => {
        if (chunks.length) {
          const completeBlob = new Blob(chunks, { type: "video/webm" });
          const videoURL = URL.createObjectURL(completeBlob);
          const downloadLink = document.createElement("a");
          downloadLink.href = videoURL;
          downloadLink.download = "recording.webm";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(videoURL);
        }
      };

      // Start recording
      this.mediaRecorder.start();
    } catch (error) {
      console.error("Error capturing media: ", error);
    }
  }

  // Function to stop recording
  stopRecordGameStream() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach((track) => track.stop());
    }
    if (this.videoBox) {
      this.videoBox.remove();
      this.videoBox = null;
    }
  }
}

module.exports = StreamManager;
