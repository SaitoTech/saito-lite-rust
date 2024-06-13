


const ModTemplate = require('../../lib/templates/modtemplate');
const VideoBox = require('../../lib/saito/ui/saito-videobox/video-box');
const html2canvas = require('html2canvas')

class Record extends ModTemplate {
    constructor(app) {
        super(app);
        this.app = app;
        this.name = 'Record';
        this.description = 'Recording Module';
        this.categories = 'Utilities Communications';
        this.class = 'utility';
        this.record_video = false;

        this.styles = ['/saito/saito.css', '/record/style.css'];
        this.interval = null;
        this.streamData = []
    }

    respondTo(type, obj) {
        if (type === 'record-actions') {
            this.attachStyleSheets();
            super.render(this.app, this);
            let is_recording = false;
            if (this.mediaRecorder) {
                is_recording = true
            }

            return [
                {
                    text: 'Record',
                    icon: `fas fa-record-vinyl record-icon ${this.mediaRecorder ? "pulsate" : ""}`,
                    callback: async function (app) {
                        let { container, streams, useMicrophone, callbackAfterRecord, members } = obj;

                        if (container) {
                            if (!this.mediaRecorder) {
                                await this.startRecording(container, members, callbackAfterRecord, 'videocall');
                            } else {
                                this.stopRecording();
                            }
                        }
                    }.bind(this)
                }
            ];
        }

        if (type === 'limbo-record') {
            this.attachStyleSheets();
            super.render(this.app, this);       
            let is_recording = false;
            if (this.mediaRecorder) {
                is_recording = true
            }

            return [
                {
                    startRecording: ()=> {
                        this.startRecording(".video-container-large")
                    }
                }
            ];
        }
        if (type === 'game-menu') {
            if (!obj.recordOptions) return;
            let menu = {
                id: 'game-game',
                text: 'Game',
                submenus: [],
            };

            menu.submenus.push({
                parent: 'game-game',
                text: "Record game",
                id: 'record-stream',
                class: 'record-stream',
                callback: async function (app, game_mod) {
                    let recordButton = document.getElementById('record-stream');
                    let { container, callbackAfterRecord } = game_mod.recordOptions;
                    if (!this.mediaRecorder) {
                        await this.startRecording(container, [], callbackAfterRecord, "game");
                        recordButton.textContent = "Stop recording";
                    } else {
                        this.mediaRecorder.stop();
                        this.stopRecording()
                    }
                }.bind(this)
            });

            return menu;
        }

    }

    onConfirmation(blk, tx, conf) {
        if (tx == null) {
            return;
        }

        let message = tx.returnMessage();

        if (conf === 0) {
            if (message.module === 'record') {
                if (this.app.BROWSER === 1) {
                    if (this.hasSeenTransaction(tx)) return;

                    if (tx.isTo(this.publicKey) && !tx.isFrom(this.publicKey)) {
                        if (message.request === "start recording") {
                            siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} started recording their screen`, 1500);
                        }
                        if (message.request === "stop recording") {
                            siteMessage(`${this.app.keychain.returnUsername(tx.from[0].publicKey)} stopped recording their screen`, 1500);
                        }

                        this.toggleNotification();
                    }

                }
            }
        }
    }


     drawImageProp(ctx, img, x, y, w, h, offsetX, offsetY) {

        console.log(img.videoWidth)

        if (arguments.length === 2) {
            x = y = 0;
            w = ctx.canvas.width;
            h = ctx.canvas.height;
        }

        offsetX = typeof offsetX === "number" ? offsetX : 0.5;
        offsetY = typeof offsetY === "number" ? offsetY : 0.5;

        if (offsetX < 0) offsetX = 0;
        if (offsetY < 0) offsetY = 0;
        if (offsetX > 1) offsetX = 1;
        if (offsetY > 1) offsetY = 1;

        let iw = img.videoWidth || img.width,
            ih = img.videoHeight || img.height,
            r = Math.min(w / iw, h / ih),
            nw = iw * r,
            nh = ih * r,
            cx, cy, cw, ch, ar = 1;

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

        console.log(img, cx, cy, cw, ch, x, y, w, h)
        console.log('drawing image prop')
    
    }



    async startRecording(container, members = [], callbackAfterRecord = null, type = "videocall") {
        let startRecording = await sconfirm('Do you  want to start recording?');
        if (!startRecording) return;
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {

                        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'DIV' && node.id.startsWith('stream_')) {


                            const videos = node.querySelectorAll('video');
                            videos.forEach(video => {
                                const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
                                const rect = video.getBoundingClientRect();
                                const parentID = video.parentElement.id;
                                const videoElement = document.createElement('video');
                                videoElement.srcObject = stream;
                                videoElement.muted = true;
                                videoElement.play();

                                this.streamData.push({ stream, rect, parentID, videoElement });
                            });
                        }
                    });
                }
                if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                    this.streamData.forEach(data => {
                        if (data.parentID === mutation.target.id) {
                            data.rect = mutation.target.getBoundingClientRect();
                        }
                    });
                }

                if (mutation.removedNodes.length > 0) {
                    mutation.removedNodes.forEach(node => {

                        let index = this.streamData.findIndex(data => data.videoElement === node || data.videoElement.parentElement === node);
                        if (index !== -1) {
                            this.streamData.splice(index, 1);
                        }
                    });
                }
            });
        });

        this.observer.observe(document.body, {
            attributes: true,
            childList: true,
            subtree: true,
            attributeFilter: ['style']
        });


        document.querySelectorAll('canvas').forEach(canvas => {
            canvas.parentElement.removeChild(document.querySelector('canvas'))
        })
        let combinedStream = new MediaStream();


        if (type === "videocall") {
            const canvas = document.createElement('canvas');
            canvas.width = window.innerWidth;
            canvas.height = window.innerWidth
            const ctx = canvas.getContext('2d');
            document.body.appendChild(canvas);

            const drawStreamsToCanvas = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.streamData.forEach(data => {
                    const parentElement = document.getElementById(data.parentID);
                    if (!parentElement) return;
                    const rect = parentElement.getBoundingClientRect();
                    // Draw the video on the canvas
                    if (data.videoElement.readyState >= 2) {
                        
                        
                        this.drawImageProp(ctx, data.videoElement, rect.left, rect.top, rect.width, rect.height)
                    }
                });

                this.animation_id = requestAnimationFrame(drawStreamsToCanvas);
            };





            const resizeCanvas = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight
                const videoElements = document.querySelectorAll('div[id^="stream_"] video');
                videoElements.forEach(video => {
                    video.style.objectFit = "cover";
                    video.style.width = "100%";
                    video.style.height = "100%";
                    video.style.maxWidth = "100%";
                });
                // Update the drawing routine to handle the new canvas size
                drawStreamsToCanvas();
            };

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas(); 

            const videoElements = document.querySelectorAll('div[id^="stream_"] video');
            videoElements.forEach(video => {
            
                // video.style.objectFit = "cover";
                // video.style.width = "100%";
                // video.style.height = "100%";
                // video.style.maxWidth = "100%";
            });

            let destination;
            const audioCtx = new AudioContext();
            this.streamData = Array.from(videoElements).map(video => {

                const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);

                if (!video.id.startsWith('local')) {
                    // console.log(video, "video localll")
                    // video.muted = false;
                    // video.volume = 1;
                    // console.log(video)
                }

                
                 destination = audioCtx.createMediaStreamDestination();
                if (stream && stream.getAudioTracks().length > 0) {
                    let source  = audioCtx.createMediaStreamSource(stream)
                    source.connect(destination)
                }
        
                const rect = video.getBoundingClientRect();
                const parentID = video.parentElement.id;
                const videoElement = document.createElement('video');
                videoElement.srcObject = stream;
                videoElement.muted = true;
                videoElement.muted
                videoElement.play();
                videoElement.style.display = "none";
                // videoElement.style.objectFit = "cover";
                // videoElement.style.width = "100%"
                // videoElement.style.height = "100%"
                // videoElement.style.maxWidth = '100%'
                
                return { stream, rect, parentID, videoElement };
            }).filter(data => data.stream !== null);

            try{
            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
            if (this.localStream && this.localStream.getAudioTracks().length > 0) {
                let source  = audioCtx.createMediaStreamSource(this.localStream)
                source.connect(destination)
            }

        } catch (error) {
            console.error("Failed to get user media:", error);
            alert("Failed to access camera and microphone.");
            return;
        }

            let chunks = [];
        

            combinedStream.addTrack(canvas.captureStream(25).getVideoTracks()[0]);
            combinedStream.addTrack(destination.stream.getAudioTracks()[0]);
            this.combinedStream = combinedStream;
            this.app.connection.emit('screenrecord-combined-stream', this.combinedStream)
            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm; codecs="vp8, opus"',
                videoBitsPerSecond: 25 * 1024 * 1024,
                audioBitsPerSecond: 320 * 1024
            });
            this.mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                window.removeEventListener('resize', resizeCanvas)
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const defaultFileName = 'saito_video.webm';
                const fileName = (await sprompt('Please enter a recording name', 'saito_video')) || defaultFileName;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                if (callbackAfterRecord) {
                    callbackAfterRecord(blob);
                }
            };

            this.mediaRecorder.start();
            drawStreamsToCanvas();

        } 
        else {
            this.is_recording = true;
            let result = document.querySelector(container);
            const canvas = document.createElement('canvas');
            canvas.width = result.clientWidth;
            canvas.height = result.clientHeight;
            const ctx = canvas.getContext('2d');
            document.body.appendChild(canvas)
            let combinedStream = new MediaStream()
        
            const audioCtx = new AudioContext();
            let destination = audioCtx.createMediaStreamDestination();
            
           
            const drawStreamsToCanvas = () => {
                if(!this.is_recording) return;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                html2canvas(result).then(contentCanvas => {     
                    this.drawImageProp(ctx, contentCanvas, 0, 0, canvas.width, canvas.height)   
                    // ctx.drawImage(contentCanvas, 0, 0, canvas.width, canvas.height )
                    // this.drawImageProp(contentCanvas, 0, 0, canvas.width, canvas.height);
                    // this.streamData.forEach(data => {
                    //  const parentElement = document.getElementById(data.parentID);
                    //  if (!parentElement) return;

                    //  const currentRect = data.rect;

                    //  if (data.videoElement.readyState >= 2) {
                    //      ctx.drawImage(data.videoElement, currentRect.left, currentRect.top, currentRect.width, currentRect.height);
                    //  }
                    //  data.rect = currentRect;
                    // });
                    this.animation_id = requestAnimationFrame(drawStreamsToCanvas);
                
                });
            };

            function resizeCanvas() {
            let result = document.querySelector(container);
            canvas.width = result.clientWidth;
            canvas.height = result.clientHeight;
                drawStreamsToCanvas(); // Redraw content after resize
            }

            window.addEventListener('resize', resizeCanvas);
            resizeCanvas(); // Initial resize and draw


            const otherParties = this.app.modules.getRespondTos('media-request');
            if (otherParties.length > 0) {
                const videoElements = document.querySelectorAll('div[id^="stream_"] video');
                this.streamData = Array.from(videoElements).map(video => {
                    const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
                    if (stream && stream.getAudioTracks().length > 0) {
                        let source  = audioCtx.createMediaStreamSource(stream)
                        source.connect(destination)
                    }

                    
                    const rect = video.getBoundingClientRect();
                    const parentID = video.parentElement.id;
                    const videoElement = document.createElement('video');
                    videoElement.srcObject = stream;
                    videoElement.muted= true
                    videoElement.play();
                
                    console.log(video.clientHeight)
                    // videoElement.style.display = "none";
                    return { stream, rect, parentID, videoElement };
                }).filter(data => data.stream !== null)

            } else {
                let includeCamera = await sconfirm('Add webcam to stream?');
                try {
                    if (includeCamera) {
                        try {
                            this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                            // this.localStream.getTracks().forEach(track => {
                            //  combinedStream.addTrack(track);
                            // });

                            if (this.localStream && this.localStream.getAudioTracks().length > 0) {
                                let source  = audioCtx.createMediaStreamSource(this.localStream)
                                source.connect(destination)
                            }
                 
                        } catch (error) {
                            console.error("Failed to get user media:", error);
                            alert("Failed to access camera and microphone.");
                            return;
                        }

                        this.videoBox = new VideoBox(this.app, this, 'local');
                        this.videoBox.render(this.localStream);
                        let videoElement = document.querySelector('.video-box-container-large');
                        console.log('video element', videoElement)
                        videoElement.style.position = 'absolute';
                        videoElement.style.top = '100px';
                        videoElement.style.width = '350px';
                        videoElement.style.height = '350px';
                        this.app.browser.makeDraggable('stream_local');
                        this.app.browser.makeDraggable('stream_local');

                        const videoElements = document.querySelectorAll('div[id^="stream_"] video');
                        this.streamData = Array.from(videoElements).map(video => {
                            const stream = 'captureStream' in video ? video.captureStream() : ('mozCaptureStream' in video ? video.mozCaptureStream() : null);
                            const rect = video.getBoundingClientRect();
                            const parentID = video.parentElement.id;
                            console.log('stream parent id', parentID)
                            const videoElement = document.createElement('video');
                            videoElement.srcObject = stream;
                            videoElement.play();
                            videoElement.style.display = "none";

                            return { stream, rect, parentID, videoElement };
                        }).filter(data => data.stream !== null);
                    } else {
                        this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    }
                } catch (error) {
                    console.error('Access to user media denied: ', error);
                    salert('Recording will continue without camera and/or microphone input');
                }
            }



            combinedStream.addTrack(canvas.captureStream(25).getVideoTracks()[0]);
            if(destination.stream.getAudioTracks().length > 1){
                combinedStream.addTrack(destination.stream.getAudioTracks()[0]);
            }

            let chunks = [];
            const mimeType = 'video/webm';
            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 10 * 1024 * 1024,
                audioBitsPerSecond: 320 * 1024
            });
            this.mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = async () => {
                window.removeEventListener('resize', resizeCanvas)
                cancelAnimationFrame(this.animation_id)
                this.is_recording = false;
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.style.display = 'none';
                a.href = url;
                const defaultFileName = 'saito_video.webm';
                const fileName = (await sprompt('Please enter a recording name', 'saito_video')) || defaultFileName;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                if (callbackAfterRecord) {
                    callbackAfterRecord(blob);
                }
            };

            this.mediaRecorder.start();
            // drawStreamsToCanvas();
        }



        this.localStream = null;
        this.externalMediaControl = false;
        this.updateUIForRecordingStart()
    }


    getSupportedMimeType() {
        const mimeTypes = [
            'video/webm; codecs=vp9',
            'video/webm; codecs=vp8',
            'video/webm; codecs=vp8,opus',
            'video/mp4',
            'video/x-matroska;codecs=avc1'
        ];

        if (navigator.userAgent.includes("Firefox")) {
            return 'video/webm; codecs=vp8,opus'
        }

        for (const mimeType of mimeTypes) {
            if (MediaRecorder.isTypeSupported(mimeType)) {
                return mimeType;
            }
        }

        return 'video/webm; codecs=vp8,opus'
    }
    getTitleBarHeight() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Firefox")) {
            return this.isToolbarVisible() ? 105 : 0;
        }
        if (userAgent.includes("Safari") && !userAgent.includes("Chrome") && !userAgent.includes("CriOS")) {
            return this.isToolbarVisible() ? 90 : 0;
        } else {
            return 0;
        }
    }


    isToolbarVisible() {
        const toolbarVisible = window.outerHeight - window.innerHeight > 50;
        console.log(window.outerHeight, window.innerHeight, "Is titlebar")
        return toolbarVisible;
    }

    async stopRecording() {
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
            this.mediaRecorder = null;
        }

        if (this.screenStream) {
            this.screenStream.getTracks().forEach(track => track.stop());
        }
        cancelAnimationFrame(this.animation_id);

        if (this.localStream && !this.externalMediaControl) {
            this.localStream.getTracks().forEach((track) => track.stop());
            this.localStream = null;
        }



        if (this.videoBox) {
            this.videoBox.remove();
            this.videoBox = null;
        }

        this.updateUIForRecordingStop()

        const recordButtonGame = document.getElementById('record-stream');
        if (recordButtonGame) {
            recordButtonGame.textContent = "record game";
        }

    

        // window.removeEventListener('resize', updateDimensions);
        // window.removeEventListener('orientationchange', updateDimensions);



    }





    getAudioTracksFromStreams(streams) {
        const audioTracks = [];
        streams.forEach(stream => {
            if (stream instanceof MediaStream) {
                audioTracks.push(...stream.getAudioTracks());
            }
        });
        return audioTracks;
    }

    async sendStartRecordingTransaction(keys) {
        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

        newtx.msg = {
            module: 'Screenrecord',
            request: 'start recording',
        };

        for (let peer of keys) {
            if (peer != this.publicKey) {
                newtx.addTo(peer);
            }
        }

        await newtx.sign();

        this.app.connection.emit('relay-transaction', newtx);
        this.app.network.propagateTransaction(newtx);
    }

    async sendStopRecordingTransaction(keys) {
        let newtx = await this.app.wallet.createUnsignedTransactionWithDefaultFee(this.publicKey);

        newtx.msg = {
            module: 'Screenrecord',
            request: 'stop recording',
        };

        for (let peer of keys) {
            if (peer != this.publicKey) {
                newtx.addTo(peer);
            }
        }

        await newtx.sign();

        this.app.connection.emit('relay-transaction', newtx);
        this.app.network.propagateTransaction(newtx);
    }

    updateUIForRecordingStart() {
        const recordIcon = document.querySelector('.fa-record-vinyl');
        if (recordIcon) {
            recordIcon.classList.add('pulsate');
        }
    }

    updateUIForRecordingStop() {
        const recordIcon = document.querySelector('.fa-record-vinyl');
        if (recordIcon) {
            recordIcon.classList.remove('pulsate');
        }
    }
}

module.exports = Record;



