module.exports = AddAppOverlayTemplate = (app, mod) => {

	return `
    <div class="saito-overlay-form saito-app-overlay" id="saito-app-overlay">

        <div class="saito-app-body">
          
          <div class="saito-app-upload active-tab paste_event" id="saito-app-upload">
            drag-and-drop a .saito module to install
          </div>

        </div>


    </div>
  `;
};
