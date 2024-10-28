module.exports  = () => {
	return `
    <div class="nwasm-upload-overlay" id="nwasm-upload-overlay">
      <div class="nwasm-upload-rom-box" id="nwasm-upload-rom-box">
        <div class="nwasm-upload-instructions" id="nwasm-upload-instructions">Loading ROM</div>
        <div class="nwasm-upload-area" id="nwasm-upload-area">
          <div class="loader"></div>
          <div class="preloader">fetching and decrypting</div>
        </div>
      </div>
    </div>
  `;
};
