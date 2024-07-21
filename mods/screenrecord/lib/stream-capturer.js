const VideoBox = require('../../../lib/saito/ui/saito-videobox/video-box');
const html2canvas = require('html2canvas');
class StreamCapturer {
    constructor(app, logo) {
        this.combinedStream = null;
        this.streamData = [];
        this.activeStreams = new Map();
        this.app = app;
        this.logo = logo;
        this.view_window = '.video-container-large';
        this.handleResize = this.handleResize.bind(this);

        app.connection.on('stun-track-event', (peerId, event) => {
            console.log('stun-track-event', peerId)
            if (event.streams.length === 0 && event?.track) {
                this.processTrack(event.track)
            } else {
                event.streams[0].getTracks().forEach((track) => {
                    this.processTrack(track);
                });
            }
        });

        app.connection.on('start-stun-call', (event) => {
            console.log("starting stun call");
            // end the current local stream
            if (this.localStream) {
                console.log('this.localstream', this.localStream)
                this.localStream.getTracks().forEach(track => {
                    track.stop()
                })
            }
            if (this.videoBox) {
                this.videoBox.remove()
            }

            // get stream from media-request
            const checkForStream = () => {
                const streams = this.app.modules.getRespondTos('media-request');
                if (streams.length > 0 && streams[0].localStream) {
                    this.localStream = streams[0].localStream;
                    if (this.localStream.getAudioTracks().length > 0) {
                        let localAudio = this.audioCtx.createMediaStreamSource(this.localStream);
                        localAudio.connect(this.mixer);
                    }
                    return true;
                } else {
                    return false;
                }
            }

            // Start checking for the stream
            const checkStreamInterval = setInterval(() => {
                if (checkForStream()) {
                    // If checkForStream returns true, clear the interval to stop the loop
                    clearInterval(checkStreamInterval);
                }
            }, 100); // Check every 100ms
        })
    }


    processTrack(track) {
        if (track.kind === 'audio') {
            this.processAudioTrack(track);
        }
    }

    processAudioTrack(track) {
        const stream = new MediaStream([track]);
        const trackId = track.id;
        if (!this.activeStreams.has(trackId)) {
            console.log('processing stream', stream, trackId)
            const source = this.audioCtx.createMediaStreamSource(stream);
            const gainNode = this.audioCtx.createGain();
            gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
            source.connect(gainNode);
            gainNode.connect(this.mixer);
            this.activeStreams.set(trackId, { source, gainNode });
        } else {
            console.log('track already exists', trackId)
        }
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

    serializeNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return { type: 'text', content: node.textContent };
        }
        if (node.nodeType === Node.ELEMENT_NODE) {
            const serialized = {
                type: 'element',
                tagName: node.tagName,
                attributes: {},
                children: [],
                styles: {}
            };

            // Serialize attributes
            for (let attr of node.attributes) {
                serialized.attributes[attr.name] = attr.value;
            }

            // Serialize computed styles
            const styles = window.getComputedStyle(node);
            for (let style of styles) {
                serialized.styles[style] = styles.getPropertyValue(style);
            }

            // Serialize children
            for (let child of node.childNodes) {
                serialized.children.push(this.serializeNode(child));
            }

            return serialized;
        }
        return null;
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

            this.audioCtx = new AudioContext();
            this.destination = new MediaStreamAudioDestinationNode(this.audioCtx);

            this.mixer = this.audioCtx.createGain();
            this.mixer.connect(this.destination);

            if (includeCamera) {
                this.observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'childList') {
                            mutation.addedNodes.forEach((node) => {
                                if (
                                    node.nodeType === Node.ELEMENT_NODE &&
                                    node.tagName === 'DIV' &&
                                    node.id.startsWith('stream_')
                                ) {
                                    const videos = node.querySelectorAll('video');
                                    // console.log('video elements', videos)
                                    videos.forEach((video) => {
                                        console.log('new video element', video);
                                        const stream =
                                            'captureStream' in video
                                                ? video.captureStream()
                                                : 'mozCaptureStream' in video
                                                    ? video.mozCaptureStream() && video.mozCaptureStream(0)
                                                    : null;
                                        // console.log('captured stream', stream)
                                        // processStream(stream, video);
                                        const rect = video.getBoundingClientRect();
                                        const parentID = video.parentElement.id;
                                        let existingVideoIndex = this.streamData.findIndex(data => data.video.id === video.id)
                                        if (existingVideoIndex !== -1) {
                                            console.log("Video exists")
                                            this.streamData[existingVideoIndex] = { stream, rect, parentID, video }
                                            return;
                                        }
                                        this.streamData.push({ stream, rect, parentID, video });
                                    });
                                }
                            });

                            if (mutation.removedNodes.length > 0) {
                                mutation.removedNodes.forEach((node) => {
                                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {
                                        const videos = node.querySelectorAll('video');
                                        videos.forEach((video) => {
                                            const streamData = this.streamData.find(data => data.video.id === video.id);
                                            if (streamData) {
                                                // console.log('removed stream from source', streamData.stream.id)
                                                // removeStream(streamData.stream.id);
                                                this.streamData = this.streamData.filter(data => data.video.id !== video.id);
                                            }
                                        });
                                    }
                                });
                            }

                            // console.log('Updated Stream Data: ', this.streamData);
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
                this.observer.observe(view_window, {
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

                        // processStream(stream, video);
                        const rect = video.getBoundingClientRect();
                        const parentID = video.parentElement.id;
                        return { stream, rect, parentID, video };
                    })
                    .filter((data) => data.stream !== null);

                const streams = this.app.modules.getRespondTos('media-request');
                if (streams.length > 0) {
                    this.localStream = streams[0].localStream;
                    this.additionalSources = streams[0].remoteStreams;
                    if (this.localStream.getAudioTracks().length > 0) {
                        let localAudio = this.audioCtx.createMediaStreamSource(this.localStream);
                        localAudio.connect(this.mixer);
                    }
                    this.additionalSources.forEach((values, keys) => {
                        console.log(keys, values.remoteStream.getAudioTracks());
                        let otherAudio = this.audioCtx.createMediaStreamSource(values.remoteStream);
                        otherAudio.connect(this.mixer);
                    });
                }
                this.combinedStream.addTrack(canvas.captureStream(25).getVideoTracks()[0]);
            }
            else {
                this.observer = new MutationObserver((mutations) => {
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
                                        // processStream(stream, video);
                                        let existingVideoIndex = this.streamData.findIndex(data => data.video.id === video.id)
                                        if (existingVideoIndex !== -1) {
                                            console.log("Video exists")
                                            this.streamData[existingVideoIndex] = { stream, video }
                                            return;
                                        }
                                        this.streamData.push({ stream, video });
                                    });
                                }
                            });


                            if (mutation.removedNodes.length > 0) {
                                mutation.removedNodes.forEach((node) => {
                                    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {
                                        const videos = node.querySelectorAll('video');
                                        videos.forEach((video) => {
                                            const streamData = this.streamData.find(data => data.video.id === video.id);
                                            if (streamData) {
                                                console.log('removed stream from source', streamData.stream.id)
                                                removeStream(streamData.stream.id);
                                                this.streamData = this.streamData.filter(data => data.video.id !== video.id);
                                            }
                                        });
                                    }
                                });
                            }

                        }
                    });
                });
                this.observer.observe(view_window, {
                    attributes: true,
                    childList: true,
                    subtree: true,
                    attributeFilter: ['style']
                });
                const streams = this.app.modules.getRespondTos('media-request');
                if (streams.length > 0) {
                    this.localStream = streams[0].localStream;
                    this.additionalSources = streams[0].remoteStreams;

                    if (this.localStream.getAudioTracks().length > 0) {
                        let localAudio = this.audioCtx.createMediaStreamSource(this.localStream);
                        localAudio.connect(this.mixer);
                    }
                    this.additionalSources.forEach((values, keys) => {
                        console.log(keys, values.remoteStream.getAudioTracks());
                        let otherAudio = this.audioCtx.createMediaStreamSource(values.remoteStream);
                        otherAudio.connect(this.mixer);
                    });


                }
            }

            this.combinedStream.addTrack(this.destination.stream.getAudioTracks()[0]);
            return this.combinedStream;

        } catch (error) {
            console.log('Error capturing video streams', error);
            throw error;
        }
    }

    stopCaptureVideoCallStreams() {

        console.log('initiate cleanup')
        this.is_capturing_stream = false;
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('resize', this.handleResize);
        this.combinedStream.getTracks().forEach((track) => {
            track.stop();
            console.log(track, 'track');
        });
        this.combinedStream = null;

        this.observer.disconnect()
        this.streamData = [];

        if (this.activeStreams) {
            this.activeStreams.forEach(({ source, gainNode }) => {
                source.disconnect();
                // gainNode.disconnect();
            });
            this.activeStreams.clear();
        }

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }




    }

    async captureGameStream(includeCamera = false) {
        console.log(this.is_capturing_stream, includeCamera, "details")
        if (this.is_capturing_stream) {
            console.log('RECORD --- Nope out of resetting captureGameStreams');
             await this.getVideoBox(includeCamera)
            
            return this.combinedStream;
        }

        this.combinedStream = new MediaStream();
        this.is_capturing_stream = true;
        const view_window = document.querySelector(this.view_window);
        if (!view_window) {
            console.warn('No valid screen input');
            return;
        }


        // clear previous canvas
        if (document.querySelector("#gameCanvasID")) {
            console.log('existing canvas')
            document.querySelector("#gameCanvasID").parentElement.removeChild(document.querySelector("#gameCanvasID"))
        }


        // create audio context and mixer
        this.audioCtx = new AudioContext();
        this.destination = new MediaStreamAudioDestinationNode(this.audioCtx);
        this.mixer = this.audioCtx.createGain();
        this.mixer.connect(this.destination);

        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (
                            node.nodeType === Node.ELEMENT_NODE &&
                            node.tagName === 'DIV' &&
                            node.id.startsWith('stream_')
                        ) {
                            const videos = node.querySelectorAll('video');
                            console.log('new video elements', videos)
                            videos.forEach((video) => {
                                const stream =
                                    'captureStream' in video
                                        ? video.captureStream()
                                        : 'mozCaptureStream' in video
                                            ? video.mozCaptureStream() && video.mozCaptureStream(0)
                                            : null;
                                const rect = video.getBoundingClientRect();
                                const parentID = video.parentElement.id;
                                let existingVideoIndex = this.streamData.findIndex(data => data.video.id === video.id)
                                if (existingVideoIndex !== -1) {
                                    // console.log("Video exists")
                                    this.streamData[existingVideoIndex] = { stream, rect, parentID, video }
                                    return;
                                }
                                this.streamData.push({ stream, rect, parentID, video });
                            });
                        }
                    });

                    if (mutation.removedNodes.length > 0) {
                        mutation.removedNodes.forEach((node) => {
                            if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {
                                const videos = node.querySelectorAll('video');
                                videos.forEach((video) => {
                                    const streamData = this.streamData.find(data => data.video.id === video.id);
                                    if (streamData) {
                                        // console.log('removed stream from source', streamData.stream.id)
                                        // removeStream(streamData.stream.id);
                                        this.streamData = this.streamData.filter(data => data.video.id !== video.id);
                                    }
                                });
                            }
                        });
                    }

                    // console.log('Updated Stream Data: ', this.streamData);
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
        this.observer.observe(view_window, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['style']
        });

        const canvas = document.createElement('canvas');
        canvas.setAttribute("id", "gameCanvasID")
        this.canvas = canvas;
        canvas.width = window.innerWidth;
        canvas.height = view_window.clientHeight;
        const ctx = canvas.getContext('2d');
        // console.log('Canvas Dimensions: ', canvas.width, canvas.height);
        let lastScreenshot = null;

        const drawStreamsToCanvas = () => {
            if (!this.is_capturing_stream) return;
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            // Draw the last captured screenshot if available
            if (lastScreenshot) {
                ctx.drawImage(lastScreenshot, 0, 0, canvas.width, canvas.height);
            }
            // Draw video streams
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
            this.drawLogoOnCanvas(ctx);
            this.drawStreamsAnimationFrameId = requestAnimationFrame(drawStreamsToCanvas);
        };

        let lastCaptureTime = 0;

        const captureInterval = 1000 / 1;

        const captureAndDraw = async (timestamp) => {
            if (!this.is_capturing_stream) return;
            if (timestamp - lastCaptureTime >= captureInterval) {
                lastCaptureTime = timestamp;
                let rect = view_window.getBoundingClientRect()
                try {
                    const screenshot = await html2canvas(view_window, {
                        scale: 0.9,
                        useCORS: false,
                        allowTaint: false,
                        logging: false,
                        x: rect.left,
                        y: rect.top,
                        width: rect.width,
                        height: rect.height,
                        ignoreElements: function (element) {
                            if (element.id === 'stream_local') {
                                return true;
                            }
                            if (element.classList.contains('stun-chatbox')) {
                                return true;
                            }
                            if (element.classList.contains('chat-container')) {
                                return true;
                            }
                            if (element.classList.contains('game-menu')) {
                                return true;
                            }
                        }
                    });

                    lastScreenshot = screenshot;
                } catch (error) {
                    console.error('Error capturing view_window:', error);
                }
            }
            this.captureAnimationFrameId = requestAnimationFrame(captureAndDraw);
        };

        this.drawStreamsToCanvas = drawStreamsToCanvas

        // Start both loops
        window.addEventListener('resize', this.handleResize);
        this.resizeCanvas(canvas);
        captureAndDraw()

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

                // processStream(stream, video);
                const rect = video.getBoundingClientRect();
                const parentID = video.parentElement.id;
                return { stream, rect, parentID, video };
            })

        this.combinedStream.addTrack(canvas.captureStream(30).getVideoTracks()[0]);

        // get existing streams
        try {
            await this.getExistingStreams(includeCamera);
        } catch (error) {
            console.error('Failed to get existing streams:', error);
            alert('An error occurred while setting up streams');
        }
        this.combinedStream.addTrack(this.destination.stream.getAudioTracks()[0]);
        return this.combinedStream
    }

    async stopCaptureGameStream() {
        console.log('initiate cleanup')
        this.is_capturing_stream = false;
        cancelAnimationFrame(this.drawStreamsAnimationFrameId);
        cancelAnimationFrame(this.captureAnimationFrameId);
        window.removeEventListener('resize', this.handleResize);


        // Check and cleanup streams
        const streams = this.app.modules.getRespondTos('media-request');
        if (streams.length > 0 && streams[0].localStream) {
            if (!streams[0].localStream.getAudioTracks().length > 0) {
                if (this.localStream) {
                    this.localStream.getTracks().forEach(track => {
                        track.stop()
                    })
                }
                if (this.videoBox) {
                    this.videoBox.remove()
                }
            }
        } else {
            if (this.localStream) {
                this.localStream.getTracks().forEach(track => {
                    track.stop()
                })
            }

            if (this.videoBox) {
                this.videoBox.remove()
            }
        }


        this.combinedStream.getTracks().forEach((track) => {
            track.stop();
            console.log(track, 'track');
        });

        this.combinedStream = null;
        this.observer.disconnect()

        this.streamData = [];
        if (this.activeStreams) {
            this.activeStreams.forEach(({ source, gainNode }) => {
                source.disconnect();
                // gainNode.disconnect();
            });
            this.activeStreams.clear();
        }

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }


    }


    async getVideoBox(includeCamera) {
        const streams = this.app.modules.getRespondTos('media-request');
        console.log(streams, "streamers")
        if (streams.length === 0) {
            if (includeCamera) {
                if (!this.videoBox) {
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
                    this.videoBox = new VideoBox(this.app, this, 'local');
                    this.videoBox.render(this.localStream);
                    let videoElement = document.querySelector('.video-box-container-large');
                    videoElement.style.position = 'absolute';
                    videoElement.style.top = '100px';
                    videoElement.style.width = '350px';
                    videoElement.style.height = '350px';
                    this.app.browser.makeDraggable('stream_local');
                }

            }else {
                this.videoBox.remove()
                this.videoBox = null
            }
        }
    }

    async getExistingStreams(includeCamera) {

        try {
            const streams = this.app.modules.getRespondTos('media-request');
            if (streams.length > 0) {
                this.localStream = streams[0].localStream;
                this.additionalSources = streams[0].remoteStreams;
                if (this.localStream.getAudioTracks().length > 0) {
                    let localAudio = this.audioCtx.createMediaStreamSource(this.localStream);
                    localAudio.connect(this.mixer);
                }
                this.additionalSources.forEach((values, keys) => {
                    console.log(keys, values.remoteStream.getAudioTracks());
                    let otherAudio = this.audioCtx.createMediaStreamSource(values.remoteStream);
                    otherAudio.connect(this.mixer);
                });
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
                        this.videoBox = new VideoBox(this.app, this, 'local');
                        this.videoBox.render(this.localStream);
                        let videoElement = document.querySelector('.video-box-container-large');
                        videoElement.style.position = 'absolute';
                        videoElement.style.top = '100px';
                        videoElement.style.width = '350px';
                        videoElement.style.height = '350px';
                        this.app.browser.makeDraggable('stream_local');
                    } else {
                        try {
                            this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                            if (this.localStream && this.localStream.getAudioTracks().length > 0) {
                                let audio = this.audioCtx.createMediaStreamSource(this.localStream);
                                audio.connect(this.mixer);
                            }
                        } catch (error) {
                            console.error('Failed to get user media:', error);
                            alert('Failed to access camera and microphone.');
                            return;
                        }
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

    emitUpdatedCombinedStream() {
        this.app.connection.emit('screenrecord-update-stream', this.combinedStream);
    }
}

module.exports = StreamCapturer;
