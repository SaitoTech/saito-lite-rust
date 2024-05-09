module.exports = () => {
	return `
    <div class="saitodocx-create-container" id="saitodocx-create-container">
        
          <div class="saito-module">
            <div class="saito-module-details-box">
              <div class="saito-module-title">New doc</div>
              <div class="saito-module-description">Last saved 07:59 PM, 8th May 2024</div>
            </div>

            <div class="saito-module-action saitodocx-action" id="saitodocx-save">
              <span>Save</span>
              <span>Share</span>
            </div>
          </div>

          <div class="saitodocx-section saitodocx-page">
            
            <!--<textarea class="saitodocx-text" id="saitodocx-text"></textarea> -->
            <form class="saitodocx-create-form" id="saitodocx-create-form">
              <input id="x" value="" type="hidden" name="content">
              <trix-editor id="saitodocx-texteditor" input="x"></trix-editor>
            </form>
          </div>

    </div>
    `;
};
