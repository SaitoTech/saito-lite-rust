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
        this.adjustChatbox();
      }

    }
  

    adjustChatbox() {
        const chatbox = document.querySelector('.stun-chatbox-box');
        if (chatbox) {
          chatbox.style.height = '10rem';
          const sections = chatbox.querySelectorAll('.stun-chatbox .video-container-large');
          sections.forEach(section => {
            section.style.height=0;
          });
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