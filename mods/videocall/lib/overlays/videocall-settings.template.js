const VideoCallSettingsTemplate = (display_mode, mod) => {
	console.log('----- ', display_mode);

	let html = `
            <div class="saito-modal saito-modal-menu videocall-setting-grid-item" id="saito-user-menu">
               <div class="saito-modal-title">Layout</div>
               <div class="saito-modal-content">

                ${
                    mod.screen_share
                      ? `
                      <div class="saito-modal-menu-option">
                        <label class="videocall-option-label ${
                          display_mode === 'presentation' ? `active` : ``
                        }"  for="videocall-option-input-presentation">

                        <input id="videocall-option-input-presentation" ${
                            display_mode === 'presentation' ? `checked` : ``
                          } type="radio" value="presentation"
                          name="videocall-option-input" class="videocall-option-input">

                        
                          <i class="fa-solid fa-person-chalkboard"></i>
                          <div>Presentation</div>
                        </label>
                      </div>

                      `
                      : ``
                  }

                  <div class="saito-modal-menu-option">
                    <label class="videocall-option-label ${
                      display_mode === 'focus' ? `active` : ``
                    }"  for="videocall-option-input-focus">

                    <input id="videocall-option-input-focus" ${
                        display_mode === 'focus' ? `checked` : ``
                      } type="radio" value="focus"
                      name="videocall-option-input" class="videocall-option-input">

                    
                      <i class="fa-solid fa-users-viewfinder"></i>
                      <div>Focus</div>
                    </label>
                  </div>


                  <div class="saito-modal-menu-option">
                    <label class="videocall-option-label ${
                      display_mode === 'gallery' ? `active` : ``
                    }"  for="videocall-option-input-gallery">

                    <input id="videocall-option-input-gallery" ${
                        display_mode === 'gallery' ? `checked` : ``
                      } type="radio" value="gallery"
                      name="videocall-option-input" class="videocall-option-input">


                      <i class="fa-solid fa-table-cells"></i>
                      <div>Gallery</div>
                    </label>
                  </div>


                  <div class="saito-modal-menu-option">
                    <label class="videocall-option-label ${
                      display_mode === 'speaker' ? `active` : ``
                    }"  for="videocall-option-input-speaker">

                    <input id="videocall-option-input-speaker" ${
                        display_mode === 'speaker' ? `checked` : ``
                      } type="radio" value="speaker"
                      name="videocall-option-input" class="videocall-option-input">


                      <i class="fa-solid fa-user"></i>
                      <div>Speaker</div>
                    </label>
                  </div>
                  

               </div>
             </div>
         
      `;

	return html;
};

module.exports = VideoCallSettingsTemplate;
