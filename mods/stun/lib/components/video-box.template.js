module.exports = (streamId, app, mod) => {
  
  //
  // Do you want presentation videos to be mirrored (flipped) or not ???
  // The Css file flips local video so it is like looking in a mirror at yourself
  // Don't randomly apply in-line styling unless ABSOLUTELY necessary
  //

  let key = streamId;
  let videoAttribute = "";
  if (streamId == "local") {
    key = mod.publicKey;
    videoAttribute = "muted";
  } 

  let name = app.keychain.returnIdentifierByPublicKey(key, true);

  return `
    <div id="stream${streamId}"  class="video-box-container-large">
      <video id="${streamId}" ${videoAttribute} autoplay playsinline class="video-box"></video>
      <div class="video-call-info">
        <div class="saito-address" data-id="${key}">${name}</div>
      </div>
    </div>`;
};
