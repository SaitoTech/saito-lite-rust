module.exports = AddAppOverlayTemplate = (app, mod) => {

	return `
  <style>
    .saito-app-overlay .saito-app-body .saito-app-upload {
      border: 3px dotted;
      width: 70%;
      margin: auto;
      text-align: center;
      font-size: 2.2rem;
      padding: 10rem 0rem;
    }
  </style>

    <div class="saito-overlay-form saito-app-overlay" id="saito-app-overlay">

        <div class="saito-app-body">
          
          <div class="saito-app-upload active-tab paste_event" id="saito-app-upload">
            drag-and-drop module to install
          </div>

        </div>


    </div>
  `;
};
