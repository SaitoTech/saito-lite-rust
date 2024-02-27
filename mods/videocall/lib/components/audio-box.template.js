module.exports = (app, mod, stream_id) => {
	let videoAttribute = '';
	let imgsrc = (stream_id) ? app.keychain.returnIdenticon(stream_id) : "";
	if (stream_id === 'local') {
		imgsrc = app.keychain.returnIdenticon(mod.publicKey);
		videoAttribute = 'muted';
	}

	return `
     <div class="audio-box" id="audiostream_${stream_id}">
      <audio autoplay ${videoAttribute} playsinline id="${stream_id}"></audio>
      <img data-id="${stream_id}" class="saito-identicon" src="${imgsrc}"/>
     </div>
     `;
};
