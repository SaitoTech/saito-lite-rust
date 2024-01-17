const VideoCallSettingsTemplate = (display_mode, mod) => {

        console.log("----- ", display_mode);

        let html = `
          <div class="videocall-setting-grid-item saito-modal">

            <div class="videocall-option-grid">
              <div class="videocall-setting-title">Change layout</div>


              ${(mod.screen_share) ? `
              <div class="videocall-option-container">
                <label class="videocall-option-label active" for="videocall-option-input-presentation">
                  <input id="videocall-option-input-presentation" checked type="radio" value="presentation"
                   name="videocall-option-input" class="videocall-option-input">
                  <div class="videocall-option-name">Presentation</div> 
                  <i class="fa-solid fa-person-chalkboard"></i>
                </label>
              </div>
              ` : ``}

              <div class="videocall-option-container">
                <label class="videocall-option-label ${(display_mode === "focus")?`active` : ``}"  for="videocall-option-input-focus">
                  <input id="videocall-option-input-focus" ${(display_mode === "focus")?`checked` : ``} type="radio" value="focus"
                   name="videocall-option-input" class="videocall-option-input">
                  <div class="videocall-option-name">Focus</div> 
                  <i class="fa-solid fa-users-viewfinder"></i>
                </label>
              </div>
            
                <div class="videocall-option-container">
                  <label class="videocall-option-label ${(display_mode === "gallery")?`active` : ``}" for="videocall-option-input-gallery">
                    <input id="videocall-option-input-gallery" ${(display_mode === "gallery")?`checked` : ``} type="radio" value="gallery" name="videocall-option-input" class="videocall-option-input">
                    <div class="videocall-option-name">Gallery</div> 
                    <i class="fa-solid fa-table-cells"></i>
                  </label>
               </div>
              
              <div class="videocall-option-container">
                <label class="videocall-option-label ${(display_mode === "speaker")?`active` : ``}" for="videocall-option-input-speaker">
                  <input id="videocall-option-input-speaker" ${(display_mode === "speaker")?`checked` : ``} type="radio" value="speaker" name="videocall-option-input" class="videocall-option-input">
                  <div class="videocall-option-name">Speaker</div> 
                  <i class="fa-solid fa-user"></i>
                </label>
              </div>
            
            </div>


             ${(!mod.screen_share) ?
              `<div class="videocall-option-grid">
                  <div class="videocall-setting-title">Screenshare</div>
                  <div class="videocall-setting-icon share-control">
                    <i class="fa-solid fa-display"></i>
                  </div>
                </div>`
                : ``
            }
            
          </div>
         
      `;

      return html;

};

module.exports = VideoCallSettingsTemplate;
