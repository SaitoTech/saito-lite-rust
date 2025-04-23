

const videoBoxTemplate = require('./video-box.template');

class VideoBox {
    constructor(app, mod, peer, container_class = '') {
        this.app = app;
        this.mod = mod;
        this.stream = null;
        this.stream_id = peer;
        this.containerClass = container_class;
        this.peer_list = [];
        this.video_class = '';
        this.display_wave_form = false;

        app.connection.on(
            'peer-toggle-audio-status',
            ({ enabled, public_key }) => {

                if (public_key !== this.stream_id) return;

                console.log('peer-toggle-audio-status', public_key, enabled);

                let icon = document.querySelector(`#stream_${this.stream_id} #audio-indicator`);
                if (icon) {
                    if (enabled) {
                        icon.classList.remove("fa-microphone-slash");
                        icon.classList.add("fa-microphone");
                        icon.classList.remove("disabled");
                        this.attachAudioEvents();
                    } else {
                        icon.classList.add("fa-microphone-slash");
                        icon.classList.remove("fa-microphone");

                        //Cut out the fuzzing
                        if (this.animation) {
                            window.cancelAnimationFrame(this.animation);
                            this.animation = null;
                        }
                        icon.removeAttribute("style");
                    }
                }
            }
        );
        app.connection.on(
            'peer-toggle-video-status',
            ({ enabled, public_key }) => {
                if (public_key !== this.stream_id) return;

                console.log('peer-toggle-video-status', public_key, enabled);

                this.toggleMask(enabled)

                /*const video_box = document.getElementById(
                    `stream_${this.stream_id}`
                );
                if (video_box.querySelector(`.video-call-info`)) {
                    let element = video_box.querySelector(
                        `.video-call-info .fa-video-slash`
                    );

                    if (!enabled && !element) {
                        video_box
                            .querySelector(`.video-call-info`)
                            .insertAdjacentHTML(
                                'beforeend',
                                `<i class="fas fa-video-slash"> </i>`
                            );
                    } else {
                        if (element) {
                            element.parentElement.removeChild(element);
                        }
                    }
                }*/
            }
        );

        this.app.connection.on(
            'stun-update-connection-message',
            (peer_id, status) => {

                if (!this.stream_id !== peer_id) {
                    return;
                }

                if (status === 'connecting') {
                    this.updateConnectionMessage('connecting');
                } else if (status === 'connected') {
                    
                    this.removeConnectionMessage();
                } else if (status === 'disconnected') {
                    this.updateConnectionMessage('retrying connection');
                }

      


            }
        );


        app.connection.on('peer-list', (address, list) => {
            if (address !== this.stream_id) {
                return;
            }

            //Save the list in case we change the video display and re-render
            this.peer_list = list;
            this.renderPeerList();
        });
    }


    render(stream = null) {
        if (stream) {
            this.stream = stream;
        }

        //Add Video Box
        if (!document.getElementById(`stream_${this.stream_id}`)) {
            this.app.browser.addElementToClass(
                videoBoxTemplate(
                    this.stream_id,
                    this.app,
                    this.mod,
                    this.video_class
                ),
                this.containerClass
            );

            const videoBoxVideo = document.querySelector(`#stream_${this.stream_id} video`);
            videoBoxVideo.addEventListener('play', (event) => {
                this.app.connection.emit("video-box-started", this.stream_id);
                console.log(
                    this.stream_id + ' Begin Playing Video:',
                    event.currentTarget.videoWidth,
                    event.currentTarget.videoHeight
                );
                if (
                    event.currentTarget.videoHeight >
                    event.currentTarget.videoWidth
                ) {
                    console.log('Portrait Video!');
                    event.currentTarget.parentElement.classList.add(
                        'portrait'
                    );
                } else {
                    console.log('Landscape Video!');
                    event.currentTarget.parentElement.classList.remove(
                        'portrait'
                    );
                }
            });
        }

        if (this.stream) {
            this.removeConnectionMessage();
            const videoBoxVideo = document.querySelector(`#stream_${this.stream_id} video`);
            videoBoxVideo.srcObject = this.stream;

            if (this.stream.getVideoTracks()?.length > 0) {
                //steam includes video, as it should
                //console.log("steam_id", this.stream_id);

            } else {
                if (this.display_wave_form) {
                    this.renderWave();
                } else {
                    //add message saying NOT to expect video
                    this.updateConnectionMessage("No video feed", false);
                    this.toggleMask(true);
                }
            }

            if (this.stream.getAudioTracks()?.length > 0) {
                //console.log("Muted: ", this.stream.getAudioTracks()[0].muted, "Enabled: ", this.stream.getAudioTracks()[0].enabled);
                let enabled = this.stream.getAudioTracks()[0].enabled && !this.stream.getAudioTracks()[0].muted;
                if (this.stream_id === "presentation") {
                    enabled = true;
                }
                this.app.connection.emit("peer-toggle-audio-status", { enabled, public_key: this.stream_id });
            } else {
                let icon = document.querySelector(`#stream_${this.stream_id} #audio-indicator`);
                icon.classList.add("disabled");
            }

        } else {
            this.updateConnectionMessage();
        }

        this.renderPeerList();
        this.attachEvents()

    }

    attachEvents() {
        let volumeControl = document.querySelector(`#stream_${this.stream_id} .volume-control i`);
        let videoBoxVideo = document.querySelector(`#stream_${this.stream_id} video`);

        if (volumeControl && videoBoxVideo) { 
            volumeControl.onclick = () => {
                const audioTrack = this.stream.getAudioTracks()[0];

                if (audioTrack) {
                    if (audioTrack.enabled) {
                        audioTrack.enabled = false;
                        volumeControl.classList.remove("fa-volume-up");
                        volumeControl.classList.add("fa-volume-mute");
                    } else {
                        audioTrack.enabled = true;
                        volumeControl.classList.remove("fa-volume-mute");
                        volumeControl.classList.add("fa-volume-up");
                    }
                }
            };
        }
    }


    show() {
        let v_box = document.getElementById(`stream_${this.stream_id}`);
        if (v_box) {
            v_box.classList.remove("hidden");
        }

    }

    hide() {
        let v_box = document.getElementById(`stream_${this.stream_id}`);
        if (v_box) {
            v_box.classList.add("hidden");
        }
    }

    rerender() {
        this.remove();
        this.render(this.stream);
        this.renderPeerList();
    }

    renderPeerList() {
       if (this.stream_id === 'local') return;

        const callList = document.querySelector(
            `.video-call-info[data-id="${this.stream_id}"] .peer-call-list`
        );


        if (!callList) {
            console.error(
                'Call list element not found for the given key:',
                this.stream_id
            );
            return;
        }

        callList.innerHTML = '';


        for (let address in this.peer_list) {
            let connectionState = this.peer_list[address];
            let identiconUrl = this.app.keychain.returnIdenticon(address);


            const img = document.createElement('img');
            img.src = identiconUrl;
            img.alt = `Identicon for ${address}`;


            img.classList.add('peer-list-item');
            if (connectionState !== 'connected') {
                img.classList.add('not-connected');
            }
            img.classList.add('saito-identicon');
            img.setAttribute('data-id', address);

            callList.appendChild(img);
        }

    }

    attachAudioEvents() {

        if (this.animation || !this.stream) {
            return;
        }

        if (this.stream.getVideoTracks()?.length > 0 || !this.display_wave_form) {
            const icon = document.querySelector(`#stream_${this.stream_id} #audio-indicator`);
            const audioContext = new AudioContext();
            const track = audioContext.createMediaStreamSource(this.stream);
            const analyser = audioContext.createAnalyser();

            analyser.fftSize = 256;

            // Build Audio Chain
            track.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const onFrame = () => {
                analyser.getByteFrequencyData(dataArray);

                let sumSquares = 0;
                for (const amplitude of dataArray) {
                    sumSquares += amplitude * amplitude;
                }
                let raw = Math.sqrt(sumSquares / dataArray.length);

                // I think these max out at 255 
                // so with a little Spinal Tap scaling, we have a percentage of the max
                //

                let num = Math.round(200 * raw / 255) / 10;

                num = Math.min(15, num);

                let blur = Math.ceil(num / 5);

                icon.style.boxShadow = `0 0 ${blur}px ${num}px var(--saito-primary)`;

                this.animation = window.requestAnimationFrame(onFrame);
            };
            this.animation = window.requestAnimationFrame(onFrame);
        }
    }

    renderWave() {


        if (this.animation) {
            window.cancelAnimationFrame(this.animation);
            this.animation = null;
        }

        if (!this.stream.getVideoTracks()?.length && this.display_wave_form) {
            const audioElement = document.getElementById(this.stream_id);
            const audioContext = new AudioContext();
            const masterGain = audioContext.createGain();
            const analyser = audioContext.createAnalyser();

            if (!document.getElementById('oscilloscope')) {
                this.app.browser.addElementToId(`<canvas id="oscilloscope"></canvas>`, `stream_${this.stream_id}`);
            }

            const tracks = this.stream.getAudioTracks();
            if (tracks.length == 1) {
                const track = audioContext.createMediaStreamSource(this.stream);
                track.connect(masterGain).connect(analyser)
            } else {
                tracks.forEach(track => {
                    const temp = new MediaStream([track]);
                    audioContext.createMediaStreamSource(temp).connect(masterGain).connect(analyser)
                });

            }

            /*
               * The Web Audio API provides the AnalyserNode for this purpose.
               * In addition to providing the raw waveform (aka time domain) data,
               * it provides methods for accessing the audio spectrum (aka frequency domain) data.
               *
               * At this point, the waveform array will contain values from -1 to 1 corresponding to the audio waveform playing
               * through the masterGain node. This is just a snapshot of whatever’s currently playing.
               * */

            const waveform = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatTimeDomainData(waveform);

            // Setup canvas
            const oscCanvas = document.getElementById("oscilloscope");
            oscCanvas.width = waveform.length / 2;
            oscCanvas.height = 200;
            const canvasContext = oscCanvas.getContext("2d");

            function drawOscilloscope() {
                //Update date time domain data
                analyser.getFloatTimeDomainData(waveform);

                //Draw Canvas
                canvasContext.clearRect(0, 0, oscCanvas.width, oscCanvas.height);
                canvasContext.beginPath();

                const gradient = canvasContext.createLinearGradient(0, 0, 300, 0);
                gradient.addColorStop("0", "magenta");
                gradient.addColorStop("0.66", "blue");
                gradient.addColorStop("1.0", "red");

                canvasContext.strokeStyle = gradient;
                canvasContext.lineWidth = 2;

                for (let i = 0; i < waveform.length; i++) {
                    const x = i;
                    const y = (0.5 + waveform[i] / 2) * oscCanvas.height;
                    if (i === 0) {
                        canvasContext.moveTo(x, y);
                    } else {
                        canvasContext.lineTo(x, y);
                    }
                }
                canvasContext.stroke();

                this.animation = requestAnimationFrame(drawOscilloscope);
            }

            drawOscilloscope();
        }
    }

    updateConnectionMessage(message = 'negotiating peer connection', with_icon = true) {
        const video_box = document.getElementById(`stream_${this.stream_id}`);
        let icon = (with_icon) ? `<span class="lds-dual-ring"></span>` : "";
        if (video_box.querySelector('#connection-message')) {
            video_box.querySelector(
                '#connection-message'
            ).innerHTML = `<p>${message}</p>${icon}`;
        } else {
            video_box.insertAdjacentHTML(
                'beforeend',
                `<div id="connection-message"> <p>${message}</p>${icon}</div> `
            );
        }
    }

    removeConnectionMessage() {
        const video_box = document.getElementById(`stream_${this.stream_id}`);
        if (video_box && video_box.querySelector('#connection-message')) {
            video_box.querySelector('#connection-message').remove();
        }
    }

    toggleMask(enabled){
        try {
            let elem = document.querySelector(`#stream_${this.stream_id} .default-video-mask`);
            if (enabled){
                elem.classList.add('hidden');
            }else {
                elem.classList.remove('hidden');
            }  
        } catch (error) {
            console.log(error, "error with toggling video mask")
        }
      
    }


    //
    // this needs fixing!!
    //
    remove(is_disconnection = false) {
        //Cut out the fuzzing
        if (this.animation) {
            window.cancelAnimationFrame(this.animation);
            this.animation = null;
        }

        let videoBox = document.getElementById(`stream_${this.stream_id}`);
        if (videoBox) {
            videoBox.remove();
        }
    }
}

module.exports = VideoBox;

