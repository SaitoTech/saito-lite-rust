module.exports = (streamId, muted, isPresentation) => {
  console.log("is presentation ", isPresentation);
  return `
    <div id="stream${streamId}"  class="video-box-container-large">
      <video style="${!isPresentation && "transform: rotateY(180deg);"}" id="${streamId}" ${
    muted ? "muted" : " "
  } autoplay playsinline="true" class="video-box"></video>
      <div class="video-call-info">
        
       </div>
    </div>`;
};
