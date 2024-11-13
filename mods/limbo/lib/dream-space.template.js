module.exports = DreamSpaceTemplate = (videoEnabled) => {

  let html = `
    <div class="dream-controls" id="dream-controls">
      <div class="video-preview">
        <div class="default-limbo-image-mask hidden"></div>
      </div>
      <div class="control-panel">
        <div class="timer">
          <div class="counter"> 00:00 </div>
          <div class="stun-identicon-list"></div>
        </div>  
      </div>
    </div>`;

    return html;
};
