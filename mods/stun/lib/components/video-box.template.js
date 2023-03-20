module.exports = (streamId, muted) => {
  return `
    <div id="stream${streamId}"  class="video-box-container-large">
      <video id="${streamId}" ${muted ? "muted" : " "} autoplay playsinline="true" class="video-box"></video>
    </div>`

}

