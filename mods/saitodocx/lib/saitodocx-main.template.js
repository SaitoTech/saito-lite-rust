module.exports = () => {
	return `
    <div class="saitodocx-main-container" id="saitodocx-main-container">
      <div class="saito-module">
        <div class="saito-module-details-box">
          <div class="saito-module-title">Saito Docx</div>
          <div class="saito-module-description">Create, view & share docs on Saito Network</div>
        </div>

        <div class="saito-module-action saitodocx-action" id="saitodocx-create-new">
          <span>Create new doc</span>
        </div>
      </div>

      <div class="saitodocx-existing-docs-container">
        <div class="saitodocx-existing-docs">
            <div class="saitodocx-existing-docs-title">My docs</div>
            <div class="saitodocx-existing-docs-items">

              <div class="saitodocx-existing-docs-item">
                <i class="fa-regular fa-file saitodocx-existing-docs-item-logo"></i>
                <div class="saitodocx-existing-docs-item-title">
                  Crypto usabili...               
                </div>
                <div class="saitodocx-existing-docs-item-author">khandevv@saito</div>
                <div class="saitodocx-existing-docs-item-timestamp">2 hrs ago</div>
              </div>

              <div class="saitodocx-existing-docs-item">
                <i class="fa-regular fa-file saitodocx-existing-docs-item-logo"></i>
                <div class="saitodocx-existing-docs-item-title">
                  Meeting minutes       
                </div>
                <div class="saitodocx-existing-docs-item-author">khandevv@saito</div>
                <div class="saitodocx-existing-docs-item-timestamp">1 day ago</div>
              </div>
              
            </div>
        </div>
        
        <div class="saitodocx-existing-docs">
            <div class="saitodocx-existing-docs-title">Shared with me</div>
            <div class="saitodocx-existing-docs-msg">No document to show</div>
        </div>
        
        <div class="saitodocx-existing-docs">
            <div class="saitodocx-existing-docs-title">Community docs</div>
            
            <div class="saitodocx-existing-docs-item">
              <i class="fa-regular fa-file saitodocx-existing-docs-item-logo"></i>
              <div class="saitodocx-existing-docs-item-title">
                Diet tracking       
              </div>
              <div class="saitodocx-existing-docs-item-author">wWfsHwDSQphe...</div>
              <div class="saitodocx-existing-docs-item-timestamp">3 hrs ago</div>
            </div>

        </div>
    </div>
    </div>
    `;
};
