const SwitchDisplayTemplate = (app, mod, display_mode) => {
  return `
      <div class="switch-display-container saito-modal">
     <div class="saito-modal-content">
           <div id="switch-to-gallery" class="saito-modal-menu-option"><i class="${display_mode === "gallery" && "fa-solid fa-check"}"></i><div>Gallery</div></div>
           <div id="switch-to-speaker" class="saito-modal-menu-option"><i class="${display_mode === "speaker" && "fa-solid fa-check"}"></i><div>Speaker</div></div>
         </div>
    </div>
       `;
};

module.exports = SwitchDisplayTemplate;

