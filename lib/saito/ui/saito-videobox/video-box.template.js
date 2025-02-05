module.exports = (streamId, app, mod, externalClass = "") => {
	//
	// Do you want presentation videos to be mirrored (flipped) or not ???
	// The Css file flips local video so it is like looking in a mirror at yourself
	// Don't randomly apply in-line styling unless ABSOLUTELY necessary
	//

	let key = streamId;
	let videoAttribute = ""
	let volumeControl = true;
	if (streamId == 'local' || mod.publicKey === streamId) {
		key = mod.publicKey;
		videoAttribute = ' muted';
		volumeControl = false
	}

	if (streamId == "presentation" && mod?.screen_share === true) {
		videoAttribute = ' muted';
		volumeControl = false
	}

	let name = app.keychain.returnIdentifierByPublicKey(key, true);

	let html = `<div id="stream_${streamId}"  class="video-box-container-large">
	  <div class="default-video-mask hidden"><i class="fa-solid fa-user-secret"></i></div>
      <video id="${streamId}" ${videoAttribute} autoplay playsinline class="video-box ${externalClass}"></video>
      <div class="video-call-info" data-id="${key}">
      	<div class="call-icons">
					<i id="audio-indicator" class="fa fa-microphone"></i>
      	</div>
        <div class="saito-address" data-id="${key}">${name}</div>
      	<div class="peer-call-list"></div>`

	if (volumeControl) {
		html += '<div class="volume-control"> <i class="fa-solid fa-volume-high"></i> </div>'
	}

	html +=  `
      </div>
    </div>`;


	return html;
};
