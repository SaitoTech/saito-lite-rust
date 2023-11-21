module.exports = (streamId, muted, isPresentation) => {
  
  //console.log("is presentation ", isPresentation);
  //
  // Do you want presentation videos to be mirrored (flipped) or not ???
  // The Css file flips local video so it is like looking in a mirror at yourself
  // Don't randomly apply in-line styling unless ABSOLUTELY necessary
  //
  return `
    <div id="stream${streamId}"  class="video-box-container-large">
      <video id="${streamId}" ${
    muted ? "muted" : " "
  } autoplay playsinline="true" class="video-box"></video>
      <div class="video-call-info">
        
       </div>
    </div>`;
};
