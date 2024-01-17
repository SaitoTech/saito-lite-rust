const VideoBox = require("../components/video-box");

class StreamManager {
  constructor(app, mod) {
    this.app = app;
    this.mod = mod;
    this.chunks = [];
    this.localStream = null; // My Video Feed
    this.mediaRecorder = null;
    this.canvasStream = null; // The stream from the canvas
  }

  async recordGameStream() {

      let screenStream = null;

      const videoElemScreen = document.createElement("video");
      const videoElemCamera = document.createElement("video");

      // Attempt to get the screen stream
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { mediaSource: "screen" },
          audio: true,
          preferCurrentTab: true,
        });

        videoElemScreen.srcObject = screenStream;
        videoElemScreen.muted = true;
        videoElemScreen.play();
        await new Promise((resolve) => (videoElemScreen.onloadedmetadata = resolve));

      } catch (error) {
        console.error("Access to screen denied: ", error);
        salert("Screen recording permission is required.");
        return;
      }

      let includeCamera = await sconfirm("Include webcam in stream?");

      if (includeCamera) {
        try {
          this.localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true, // Capture microphone audio
          });

          /*
          this.videoBox = new VideoBox(this.app, this.mod, "local");
          this.videoBox.render(this.localStream);
          let videoElement = document.querySelector(".video-box-container-large");
          videoElement.style.position = "absolute";
          videoElement.style.top = "100px";
          videoElement.style.width = "350px";
          videoElement.style.height = "350px";
          this.app.browser.makeDraggable("stream_local");
          */

          //"Play" the webcam output somewhere so it can be captured
          videoElemCamera.srcObject = this.localStream;
          videoElemCamera.muted = true;
          videoElemCamera.play();
          await new Promise((resolve) => (videoElemCamera.onloadedmetadata = resolve));

        } catch (error) {
          console.error("Access to camera denied: ", error);
          salert("Gamecasting will continue without camera and/or microphone input");
        }
      }

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
      if (this.localStream && this.localStream.getAudioTracks().length > 0) {
        combinedStream.addTrack(this.localStream.getAudioTracks()[0]);
      }

      this.canvasStream = canvas.captureStream();
      
      this.mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm",
      });

      // When data is available, push it to the chunks array
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      // When the recording stops, create a video file
      this.mediaRecorder.onstop = async () => {
        
          const completeBlob = new Blob(this.chunks, { type: "video/webm" });
          const defaultFileName = "recorded_call.webm";
          const fileName =
            (await sprompt("Please enter a recording name", "recorded_call")) || defaultFileName;
          
          const videoURL = window.URL.createObjectURL(completeBlob);

          const downloadLink = document.createElement("a");
          document.body.appendChild(downloadLink);
          downloadLink.style = "display: none";
          downloadLink.href = videoURL;
          downloadLink.download = fileName;
          downloadLink.click();

          downloadLink.remove();
          window.URL.revokeObjectURL(videoURL);
     
          this.chunks = [];   
      };

      // Start recording
      this.mediaRecorder.start();
  }

  // Function to stop recording
  stopRecordGameStream() {
    console.log("Stop recording!");

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
