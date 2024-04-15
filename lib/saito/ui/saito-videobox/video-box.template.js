module.exports = (streamId, app, mod, externalClass = "") => {
	//
	// Do you want presentation videos to be mirrored (flipped) or not ???
	// The Css file flips local video so it is like looking in a mirror at yourself
	// Don't randomly apply in-line styling unless ABSOLUTELY necessary
	//

	let key = streamId;
	let videoAttribute = ""
	if (streamId == 'local') {
		key = mod.publicKey;
		videoAttribute = ' muted';
	}

	console.log("***************", externalClass, streamId);
	let name = app.keychain.returnIdentifierByPublicKey(key, true);

	return `
    <div id="stream_${streamId}"  class="video-box-container-large">
      <video id="${streamId}" ${videoAttribute} autoplay playsinline class="video-box ${externalClass}"></video>
	  <div class="peer-call-list" data-id="${key}"> </div>
      <div class="video-call-info">
        <div class="saito-address" data-id="${key}">${name}</div>
      </div>
    </div>`;
};
