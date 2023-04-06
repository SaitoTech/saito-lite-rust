module.exports = (stream_id) => {
    return `
     <div class="icon-btn icon-peer audio-box" id="audiostream${stream_id}">
      <audio autoplay playsinline="true" id="${stream_id}"> 

      </audio>
     </div>
     `;
}
