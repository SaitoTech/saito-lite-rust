module.exports = (streamId, muted) => {
  return `
    <div id="stream${streamId}"  class="video-box-container-large">
      <video ${muted ? "muted" : " "} autoplay playsinline="true" class="video-box"></video>
      <canvas id="output_canvas"></canvas>
      <div id="reconnect-button"><button>reconnect</button> </div>
    </div>`

}

