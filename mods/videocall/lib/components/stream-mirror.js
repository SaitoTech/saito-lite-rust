class StreamMirror {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.streams = new Map();

        console.log("********************", "Use Stream Mirroring", "***********************");

        app.connection.on('add-local-stream-request', (localStream) => {
            this.addStream(localStream, "local");
        });
        app.connection.on('add-remote-stream-request', (peer, remoteStream) => {
            this.addStream(remoteStream, peer);
        });

        app.connection.on('remove-peer-box', (peer_id) => {
            this.removeStream(peer_id);
        });

    }

    addStream(stream, id) {
        const gameMenu = document.getElementById('game-menu');
        if (!gameMenu) return;

        if (this.streams.has(id)) {
            this.updateStream(stream, id);
            return;
        }

        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-overlay-container';
        videoContainer.style.cssText = 'position: relative; width: 100%;';

        const video = document.createElement('video');
        video.id = `mirror-${id}`;
        video.autoplay = true;
        video.muted = true;
        video.srcObject = stream;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

        videoContainer.appendChild(video);

        if (id === 'local') {
            const controlPanel = this.createControlPanel();
            videoContainer.appendChild(controlPanel);
        }

        this.streams.set(id, videoContainer);
        if (this.placeVideoInPlayerBox(videoContainer, id)) {
            this.adjustChatbox(id);
        }
    }


    createControlPanel() {
        const controlPanel = document.createElement('div');
        controlPanel.className = 'video-control-panel';
        controlPanel.style.cssText = `
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 1rem;
            background: rgba(0, 0, 0, 0.5);
            padding: 0.5rem 1rem;
            border-radius: 8px;
            z-index: 10;
        `;

        const originalControls = document.querySelector('.control-panel');
        if (originalControls) {
            const originalAudio = originalControls.querySelector('.audio-control');
            const originalVideo = originalControls.querySelector('.video-control');
            const originalDisconnect = originalControls.querySelector('.disconnect-control');
            const controls = [
                { original: originalAudio, className: 'audio-control' },
                { original: originalVideo, className: 'video-control' },
                { original: originalDisconnect, className: 'disconnect-control' }
            ].map(({ original, className }) => {
                const newControl = document.createElement('div');
                newControl.className = `${className} icon_click_area`;
            
                const originalIcon = original.querySelector('i');
                if (originalIcon) {
                    newControl.innerHTML = originalIcon.outerHTML;
                }
            
                newControl.addEventListener('click', () => {
                    original.click();
                    if (className === 'audio-control') {
                        newControl.classList.toggle('disabled');
                        const icon = newControl.querySelector('i');
                        icon.classList.toggle('fa-microphone-slash');
                        icon.classList.toggle('fa-microphone');
                    } else if (className === 'video-control') {
                        newControl.classList.toggle('disabled');
                        const icon = newControl.querySelector('i');
                        icon.classList.toggle('fa-video-slash');
                        icon.classList.toggle('fa-video');
                    }
                });

                newControl.style.cssText = `
                    cursor: pointer;
                    padding: 0.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    color: white;
                `;
                newControl.addEventListener('mouseenter', () => {
                    newControl.style.opacity = '0.8';
                });
                newControl.addEventListener('mouseleave', () => {
                    newControl.style.opacity = '1';
                });

                return newControl;
            });

            controls.forEach(control => controlPanel.appendChild(control));
        
            originalControls.remove();
        }

        return controlPanel;
    }

    removeVideoByPublicKey(id) {
        const streamContainer = document.getElementById(`stream_${id}`);
        if (streamContainer) {
            const videoElement = streamContainer.querySelector('video');
            if (videoElement) {
                videoElement.style.display = "none";
            }
        }
    }

    adjustChatbox(id) {
        this.removeVideoByPublicKey(id);

        const chatbox = document.querySelector('#stun-chatbox-box');
        if (chatbox) {
            chatbox.style.display = "none";
            chatbox.style.height = '10rem';
            chatbox.style.minHeight = 0;
            const section = chatbox.querySelector('.stun-chatbox .video-container-large');
            section.style.display = "none";
            const minimizer = chatbox.querySelector('.minimizer');
            minimizer.style.display = "none";
            const footer = chatbox.querySelector('.footer');
            footer.style.height = "10rem";
        }
    }

    placeVideoInPlayerBox(videoContainer, peerId) {
        const gottenAddress = peerId === 'local' ? this.mod.publicKey : peerId;

        const playerBoxes = document.querySelectorAll('.game-video-container');
        let placed = false;

        for (const box of playerBoxes) {
            const address = box.querySelector('.saito-address').getAttribute('data-id');
            if (address) {
                if (address === gottenAddress) {
                    box.appendChild(videoContainer);
                    placed = true;
                    break;
                }
            }
        }
        return placed;
    }

    updateStream(stream, id) {
        const videoContainer = this.streams.get(id);
        if (videoContainer) {
            const video = videoContainer.querySelector('video');
            if (video) {
                video.srcObject = stream;
            }
        }
    }

    removeStream(id) {
        const videoContainer = this.streams.get(id);
        if (videoContainer) {
            videoContainer.remove();
            this.streams.delete(id);
        }
    }

    destroy() {
        this.streams.forEach(container => container.remove());
        this.streams.clear();
    }
}

module.exports = StreamMirror;

 