module.exports = (streamId, muted) => {
    return `
    <div id="stream${streamId}" class="video-box-container">
      <video ${muted ? "muted" : " "} autoplay class="video-box"></video>
    </div>`

}

