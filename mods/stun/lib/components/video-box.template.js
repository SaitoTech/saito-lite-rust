module.exports = (streamId, muted, position) => {
  return `
    <div id="stream${streamId}"  class="video-box-container-large ${position}">
      <video id="${streamId}" ${muted ? "muted" : " "} autoplay playsinline="true" class="video-box"></video>
    </div>`

}

