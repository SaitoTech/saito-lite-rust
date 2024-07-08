class StreamCapturer {
  constructor(app, logo) {
    this.combinedStream = null;
    this.streamData = [];
    this.app = app;
    this.logo = logo;
    this.view_window = '.video-container-large';
    this.handleResize = this.handleResize.bind(this);
  }

  drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {
    if (arguments.length === 2) {
      x = y = 0;
      w = ctx.canvas.width;
      h = ctx.canvas.height;
    }

    offsetX = typeof offsetX === 'number' ? offsetX : 0.5;
    offsetY = typeof offsetY === 'number' ? offsetY : 0.5;

    if (offsetX < 0) offsetX = 0;
    if (offsetY < 0) offsetY = 0;
    if (offsetX > 1) offsetX = 1;
    if (offsetY > 1) offsetY = 1;

    let iw = img.videoWidth || img.width,
      ih = img.videoHeight || img.height,
      r = Math.min(w / iw, h / ih),
      nw = iw * r,
      nh = ih * r,
      cx,
      cy,
      cw,
      ch,
      ar = 1;

    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    cw = iw / (nw / w);
    ch = ih / (nh / h);

    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
    this.drawLogoOnCanvas(ctx);
  }

  drawLogoOnCanvas(ctx) {
    const maxDimension = 100;
    const aspectRatio = this.logo.naturalWidth / this.logo.naturalHeight;
    let logoWidth, logoHeight;
    if (this.logo.naturalWidth > this.logo.naturalHeight) {
      logoWidth = maxDimension;
      logoHeight = maxDimension / aspectRatio;
    } else {
      logoHeight = maxDimension;
      logoWidth = maxDimension * aspectRatio;
    }

    const logoX = ctx.canvas.width - logoWidth - 50;
    const logoY = ctx.canvas.height - logoHeight - 10;

    this.logo.style.objectFit = 'cover';
    ctx.drawImage(this.logo, logoX, logoY, logoWidth, logoHeight);
  }

  resizeCanvas(canvas) {
    console.log('resizing canvas');

    canvas.width = window.innerWidth;
    canvas.height = document.querySelector(this.view_window).clientHeight;
    const videoElements = document.querySelectorAll('div[id^="stream_"] video');

    this.drawStreamsToCanvas();
  }

  handleResize() {
    this.resizeCanvas(this.canvas);
  }

  captureVideoCallStreams(includeCamera = false) {
    if (this.is_capturing_stream) {
      console.log('RECORD --- Nope out of resetting captureVideoCallStreams');
      return this.combinedStream;
    }

    try {
      this.combinedStream = new MediaStream();
      this.is_capturing_stream = true;

      const view_window = document.querySelector(this.view_window);
      if (!view_window) {
        console.warn('No valid screen input');
        return;
      }

      // Delete all canvas's on the screen (can break games!)
      document.querySelectorAll('canvas').forEach((canvas) => {
        canvas.parentElement.removeChild(document.querySelector('canvas'));
      });

      const audioCtx = new AudioContext();
      const destination = new MediaStreamAudioDestinationNode(audioCtx);

    //   const processStream = (stream) => {
    //     console.log('RECORD --- processing new stream', stream);
    //     if (stream && stream.getAudioTracks().length > 0) {
    //       console.log(stream.getAudioTracks());
    //       const source = audioCtx.createMediaStreamSource(stream);
    //       source.connect(destination);
    //       console.log(destination.stream.getAudioTracks());
    //     }else {
    //         console.log('no audio tracks in stream')
    //     }

    //     return stream;
    //   };

    const processStream = (stream, video= null) => {
        console.log('RECORD --- processing new stream', stream);  
        if (stream) {
          if (stream.getAudioTracks().length > 0) {
            console.log('Audio tracks found:', stream.getAudioTracks());
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(destination);
            console.log('Destination audio tracks:', destination.stream.getAudioTracks());
          } else if (video && 'mozCaptureStream' in video) {
            // Firefox-specific audio capture
            console.log('Using Firefox-specific audio capture');
            const source = audioCtx.createMediaElementSource(video);
            source.connect(destination);
          } else {
            console.log('No audio tracks in stream and not Firefox');
          }
        } else {
          console.log('No stream provided');
        }
      
        return stream;
      };

      // let self = this
      if (includeCamera) {
        let observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (
                  node.nodeType === Node.ELEMENT_NODE &&
                  node.tagName === 'DIV' &&
                  node.id.startsWith('stream_')
                ) {
                  const videos = node.querySelectorAll('video');
                console.log('video elements', videos)
                  videos.forEach((video) => {
                    console.log('Video properties:', {
                        src: video.src,
                        currentSrc: video.currentSrc,
                        readyState: video.readyState,
                        paused: video.paused,
                        muted: video.muted,
                        volume: video.volume
                      });
                    console.log('new video element', video);
                    const stream =
                      'captureStream' in video
                        ? video.captureStream()
                        : 'mozCaptureStream' in video
                        ? video.mozCaptureStream() && video.mozCaptureStream(0)
                        : null;
                     console.log('captured stream', stream)
                    processStream(stream, video);
                    const rect = video.getBoundingClientRect();
                    const parentID = video.parentElement.id;
                    /*const videoElement = document.createElement('video');
                    videoElement.srcObject = stream;
                    videoElement.muted = true;
                    videoElement.play();*/
                    this.streamData.push({ stream, rect, parentID, video });
                  });
                }
              });

              if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach((node) => {
                  for (let i = 0; i < this.streamData.length; i ++){
                    if (!this.streamData[i].video.isConnected){
                        console.log('Mutation observer for removed: ', node);
                        this.streamData.splice(i, 1);
                        break;
                    }
                  }
                });
              }

               console.log('Updated Stream Data: ', JSON.parse(JSON.stringify(this.streamData)));
            }
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              this.streamData.forEach((data) => {
                if (data.parentID === mutation.target.id) {
                  data.rect = mutation.target.getBoundingClientRect();
                }
              });
            }
          });
        });

        //Start Observer
        observer.observe(view_window, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: ['style']
        });

        const canvas = document.createElement('canvas');
        this.canvas = canvas;
        canvas.width = window.innerWidth;
        canvas.height = view_window.clientHeight;
        const ctx = canvas.getContext('2d');
        console.log('Canvas Dimensions: ', canvas.width, canvas.height);
        const drawStreamsToCanvas = () => {
          if (!this.is_capturing_stream) return;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          this.streamData.forEach((data) => {
            const parentElement = document.getElementById(data.parentID);
            if (!parentElement) return;
            const rect = parentElement.getBoundingClientRect();
            // Draw the video on the canvas
            if (data.video.readyState >= 2) {
              this.drawImageProp(
                ctx,
                data.video,
                rect.left,
                rect.top,
                rect.width,
                rect.height
              );
            }
          });
          // console.log('still drawing streams');
          this.animationFrameId = requestAnimationFrame(drawStreamsToCanvas);
        };

        this.drawStreamsToCanvas = drawStreamsToCanvas;

        let self = this;
        window.addEventListener('resize', this.handleResize);
        this.resizeCanvas(canvas);

        const videoElements = document.querySelectorAll(this.view_window + ' div[id^="stream_"] video');

        // console.log('video elements', videoElements)
        this.streamData = Array.from(videoElements)
          .map((video) => {
            let stream =
              'captureStream' in video
                ? video.captureStream()
                : 'mozCaptureStream' in video
                ? video.mozCaptureStream()
                : null;

            processStream(stream, video);
            const rect = video.getBoundingClientRect();
            const parentID = video.parentElement.id;
            //const videoElement = document.createElement('video');
            //videoElement.srcObject = stream;
            //videoElement.muted = true;
            //videoElement.play();
            //videoElement.style.display = 'none';
            return { stream, rect, parentID, video };
          })
          .filter((data) => data.stream !== null);
        this.combinedStream.addTrack(canvas.captureStream(25).getVideoTracks()[0]);
      } else {
        let observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (
                  node.nodeType === Node.ELEMENT_NODE &&
                  node.tagName === 'DIV' &&
                  node.id.startsWith('stream_')
                ) {
                  const videos = node.querySelectorAll('video');
                  videos.forEach((video) => {
                    const stream =
                      'captureStream' in video
                        ? video.captureStream()
                        : 'mozCaptureStream' in video
                        ? video.mozCaptureStream()
                        : null;
                    processStream(stream);
                  });
                }
              });

              if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach((node) => {
                  for (let i = 0; i < this.streamData.length; i ++){
                    if (!this.streamData[i].video.isConnected){
                        this.streamData.splice(i, 1);
                        break;
                    }
                  }
                });
            }

            }
          });
        });
        observer.observe(view_window, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeFilter: ['style']
        });
        document.querySelectorAll('video').forEach((video) => {
          let stream =
            'captureStream' in video
              ? video.captureStream()
              : 'mozCaptureStream' in video
              ? video.mozCaptureStream()
              : null;
          processStream(stream, video);
        });
      }


      this.combinedStream.addTrack(destination.stream.getAudioTracks()[0]);
      return this.combinedStream;

    } catch (error) {
      console.log('Error capturing video streams', error);
      throw error;
    }
  }

  stopCaptureVideoCallStreams() {
    this.is_capturing_stream = false;
    cancelAnimationFrame(this.animationFrameId);
    // console.log('removing event listener')
    window.removeEventListener('resize', this.handleResize);
    this.combinedStream.getTracks().forEach((track) => {
      track.stop();
      console.log(track, 'track');
    });
    this.combinedStream = null;
  }

  emitUpdatedCombinedStream() {
    this.app.connection.emit('screenrecord-update-stream', this.combinedStream);
  }
}

module.exports = StreamCapturer;
