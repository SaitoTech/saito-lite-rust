module.exports = UpdateDescriptionTemplate = (description) => {

    return `
		<form > 
      <div class="saito-overlay-form">
	      <div class="saito-overlay-form-header">
	        <div class="saito-overlay-form-header-title">Update Description</div>
	      </div>
              <input type="text" id="saito-overlay-form-input" class="saito-overlay-form-input" autocomplete="off" placeholder="" value="${description}" />
	      <div class="saito-overlay-form-submitline">
          <button type="submit" class="saito-button-primary fat saito-overlay-form-submit" id="saito-overlay-submit">Update Description</button> 
        </div>
      </div>
		</form>
  `;
};
