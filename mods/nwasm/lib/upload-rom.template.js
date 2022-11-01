module.exports = UploadRomOverlayTemplate = (app, mod) => {

  return `

    <div class="nwasm-upload-overlay" id="nwasm-upload-overlay">
      <div class="nwasm-upload-rom-box" id="nwasm-upload-rom-box">
      
        <div class="nwasm-upload-area" id="nwasm-upload-area">Drag and drop rom file</div>
      </div>

      <div class="loader"></div>
    </div>

  `;

}

