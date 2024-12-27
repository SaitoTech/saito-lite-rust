class StreamMirror {
    constructor(app, mod) {
        this.app = app;
        this.mod = mod;
        this.streams = new Map();
    }

    addStream(stream, id) {
        const gameMenu = document.getElementById('game-menu');
        if (!gameMenu) return;

        if (this.streams.has(id)) {
            this.updateStream(stream, id);
            return;
        }

        const video = document.createElement('video');
        video.id = `mirror-${id}`;
        video.autoplay = true;
        video.muted = true;
        video.srcObject = stream;
        video.style.cssText = 'width: 100%; height: 100%; object-fit: cover;';

        this.streams.set(id, video);
        if (this.placeVideoInPlayerBox(video, id)) {
            this.adjustChatbox(id);
        }

    }


    removeVideoByPublicKey(id) {
        const streamContainer = document.getElementById(`stream_${id}`);
        if (streamContainer) {
            const videoElement = streamContainer.querySelector('video');
            if (videoElement) {
                videoElement.style.display = "none"
            }
        }
    }

    adjustChatbox(id) {
        this.removeVideoByPublicKey(id)

        const chatbox = document.querySelector('#stun-chatbox-box');
        if (chatbox) {
            chatbox.style.height = '10rem';
            chatbox.style.minHeight = 0;
            const section = chatbox.querySelector('.stun-chatbox .video-container-large');
            section.style.display = "none"
            const minimizer = chatbox.querySelector('.minimizer');
            minimizer.style.display = "none"
            const footer = chatbox.querySelector('.footer');
            footer.style.height = "10rem"

        }
    }


    placeVideoInPlayerBox(video, peerId) {
        const shortPeerId = peerId === 'local' ? this.mod.publicKey.substring(0, 6) : peerId.substring(0, 6);
        const playerBoxes = document.querySelectorAll('.game-playerbox');
        let placed = false;

        for (const box of playerBoxes) {
            const address = box.querySelector('.saito-address');
            if (address) {
                const shortAddress = address.textContent.split('-')[1];
                if (shortAddress === shortPeerId) {
                    box.appendChild(video);
                    placed = true;
                    break;
                }
            }
        }
        return placed;
    }
    updateStream(stream, id) {
        const video = this.streams.get(id);
        if (video) {
            video.srcObject = stream;
        }
    }

    removeStream(id) {
        const video = this.streams.get(id);
        if (video) {
            video.remove();
            this.streams.delete(id);
        }
    }

    destroy() {
        this.streams.forEach(video => video.remove());
        this.streams.clear();
    }
}

module.exports = StreamMirror;