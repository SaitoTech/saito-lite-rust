module.exports = (app, stream_id) => {

    if (stream_id === "local") {
        stream_id = app.wallet.getPublicKey();
    } 

    let imgsrc = app.keychain.returnIdenticon(stream_id);

    return `
     <div class="audio-box" id="audiostream${stream_id}">
      <audio autoplay playsinline="true" id="${stream_id}"></audio>
      <img data-id="${stream_id}" class="saito-identicon" src="${imgsrc}"/>
     </div>
     `;
}

