module.exports = (app, mod, stream_id) => {

    let imgsrc = app.keychain.returnIdenticon(stream_id);
    if (stream_id === "local"){
        imgsrc = app.keychain.returnIdenticon(mod.publicKey);
    }

    return `
     <div class="audio-box" id="audiostream_${stream_id}">
      <audio autoplay playsinline="true" id="${stream_id}"></audio>
      <img data-id="${stream_id}" class="saito-identicon" src="${imgsrc}"/>
     </div>
     `;
}

